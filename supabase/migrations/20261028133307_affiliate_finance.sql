-- Financial writes are serialized and authorized inside PostgreSQL. No live data cleanup.
BEGIN;
CREATE SCHEMA IF NOT EXISTS affiliate_private;
REVOKE ALL ON SCHEMA affiliate_private FROM PUBLIC;
GRANT USAGE ON SCHEMA affiliate_private TO authenticated;

ALTER TABLE public.affiliates ALTER COLUMN referral_code DROP NOT NULL;
ALTER TABLE public.affiliate_payouts ADD COLUMN IF NOT EXISTS request_id uuid;
ALTER TABLE public.affiliate_payouts ADD COLUMN IF NOT EXISTS rate_version bigint;
ALTER TABLE public.affiliate_payouts ADD COLUMN IF NOT EXISTS rejected_reason text;
ALTER TABLE public.affiliate_payouts ADD COLUMN IF NOT EXISTS processed_at timestamptz;
ALTER TABLE public.affiliate_payouts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.affiliate_payouts ADD COLUMN IF NOT EXISTS commission_ids uuid[];

-- A previously duplicated ticket/reference is an operator reconciliation decision, not a DELETE.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.affiliate_commissions WHERE ticket_id IS NOT NULL GROUP BY ticket_id HAVING count(*) > 1)
    OR EXISTS (SELECT 1 FROM public.affiliate_payouts WHERE nullif(trim(binance_tx_reference), '') IS NOT NULL
      GROUP BY lower(trim(binance_tx_reference)) HAVING count(*) > 1)
  THEN RAISE EXCEPTION 'Historical duplicate commissions/transfers require reconciliation before migration'; END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS affiliate_one_commission_per_ticket ON public.affiliate_commissions(ticket_id) WHERE ticket_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS affiliate_payout_request_key ON public.affiliate_payouts(affiliate_id, request_id) WHERE request_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS affiliate_transfer_reference_key ON public.affiliate_payouts(lower(trim(binance_tx_reference)))
  WHERE nullif(trim(binance_tx_reference), '') IS NOT NULL;

-- Existing malformed values stop migration rather than being silently reinterpreted.
ALTER TABLE public.affiliate_commissions ADD CONSTRAINT affiliate_commission_finite
  CHECK (gross_sale_price::text NOT IN ('NaN','Infinity','-Infinity')
    AND discount_amount::text NOT IN ('NaN','Infinity','-Infinity')
    AND net_sale_price::text NOT IN ('NaN','Infinity','-Infinity')
    AND commission_amount::text NOT IN ('NaN','Infinity','-Infinity'));
ALTER TABLE public.affiliate_payouts ADD CONSTRAINT affiliate_payout_finite
  CHECK (gross_amount_usdt::text NOT IN ('NaN','Infinity','-Infinity')
    AND net_amount_usdt::text NOT IN ('NaN','Infinity','-Infinity')
    AND coalesce(cop_to_usdt_rate::text,'') NOT IN ('NaN','Infinity','-Infinity'));

CREATE TABLE public.affiliate_finance_rate (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  cop_per_usdt numeric(14,4) CHECK (cop_per_usdt > 0 AND cop_per_usdt < 1000000000),
  version bigint NOT NULL DEFAULT 0,
  updated_at timestamptz
);
INSERT INTO public.affiliate_finance_rate(id) VALUES(true);
CREATE TABLE public.affiliate_finance_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid,
  action text NOT NULL, entity_id uuid, details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.affiliate_payout_items (
  payout_id uuid NOT NULL REFERENCES public.affiliate_payouts(id),
  commission_id uuid NOT NULL REFERENCES public.affiliate_commissions(id),
  currency text NOT NULL, original_amount numeric(14,2) NOT NULL,
  PRIMARY KEY(payout_id, commission_id)
);
CREATE TABLE affiliate_private.confirmed_payments (
  ticket_id uuid PRIMARY KEY, paid_at timestamptz NOT NULL, actor_id uuid NOT NULL
);

CREATE FUNCTION affiliate_private.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
      AND u.email_confirmed_at IS NOT NULL
      AND ((u.raw_app_meta_data->>'finance_admin') = 'true'
        OR lower(u.email) = 'developer01012003@gmail.com')
  )
$$;
CREATE FUNCTION affiliate_private.require_admin() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT affiliate_private.is_admin() THEN RAISE EXCEPTION 'Acceso exclusivo de administración' USING ERRCODE='42501'; END IF;
END $$;
CREATE FUNCTION affiliate_private.lock_finance() RETURNS void LANGUAGE sql SET search_path = '' AS $$
  SELECT pg_advisory_xact_lock(7062864190123)
$$;
CREATE FUNCTION affiliate_private.audit(p_action text, p_entity uuid, p_details jsonb DEFAULT '{}') RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  INSERT INTO public.affiliate_finance_audit(actor_id, action, entity_id, details)
    VALUES(auth.uid(), p_action, p_entity, p_details)
$$;

-- Replace every historical policy, including overly permissive policies with unknown names.
DO $$ DECLARE p record; t text; BEGIN
  FOREACH t IN ARRAY ARRAY['affiliates','affiliate_commissions','affiliate_payouts','affiliate_finance_rate','affiliate_finance_audit','affiliate_payout_items'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT SELECT ON public.%I TO authenticated', t);
  END LOOP;
END $$;
CREATE POLICY affiliate_owner_read ON public.affiliates FOR SELECT TO authenticated USING(id = auth.uid() OR affiliate_private.is_admin());
CREATE POLICY commission_owner_read ON public.affiliate_commissions FOR SELECT TO authenticated USING(affiliate_id = auth.uid() OR affiliate_private.is_admin());
CREATE POLICY payout_owner_read ON public.affiliate_payouts FOR SELECT TO authenticated USING(affiliate_id = auth.uid() OR affiliate_private.is_admin());
CREATE POLICY rate_read ON public.affiliate_finance_rate FOR SELECT TO authenticated USING(true);
CREATE POLICY audit_admin_read ON public.affiliate_finance_audit FOR SELECT TO authenticated USING(affiliate_private.is_admin());
CREATE POLICY item_owner_read ON public.affiliate_payout_items FOR SELECT TO authenticated USING(EXISTS(
  SELECT 1 FROM public.affiliate_payouts p WHERE p.id=payout_id AND (p.affiliate_id=auth.uid() OR affiliate_private.is_admin())
));

CREATE FUNCTION public.affiliate_get_rate() RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT jsonb_build_object('cop_per_usdt',cop_per_usdt,'version',version,'updated_at',updated_at)
    FROM public.affiliate_finance_rate WHERE id
$$;
CREATE FUNCTION public.affiliate_set_rate(p_rate numeric, p_reason text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM affiliate_private.require_admin();
  PERFORM affiliate_private.lock_finance();
  IF p_rate IS NULL OR p_rate <= 0 OR p_rate >= 1000000000 OR p_rate::text IN ('NaN','Infinity','-Infinity') THEN
    RAISE EXCEPTION 'La tasa debe ser positiva y finita'; END IF;
  UPDATE public.affiliate_finance_rate SET cop_per_usdt=p_rate,version=version+1,updated_at=now() WHERE id;
  PERFORM affiliate_private.audit('rate_changed',NULL,jsonb_build_object('rate',p_rate,'reason',p_reason));
  RETURN public.affiliate_get_rate();
END $$;

CREATE FUNCTION public.affiliate_lookup_code(p_code text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT jsonb_build_object('id',id,'referral_code',referral_code,'status',status,'user_name',user_name,'commission_rate',0.30)
    FROM public.affiliates WHERE upper(referral_code)=upper(trim(p_code)) AND status='active'
$$;
CREATE FUNCTION public.affiliate_register(p_name text, p_phone text, p_tiktok text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result public.affiliates; mail text; BEGIN
  SELECT email INTO mail FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL;
  IF mail IS NULL THEN RAISE EXCEPTION 'Inicia sesión con una cuenta verificada' USING ERRCODE='42501'; END IF;
  IF nullif(trim(p_phone),'') IS NULL OR nullif(trim(p_tiktok),'') IS NULL THEN RAISE EXCEPTION 'Teléfono y TikTok son obligatorios'; END IF;
  INSERT INTO public.affiliates(id,user_email,user_name,phone,tiktok_account,status,commission_rate)
    VALUES(auth.uid(),mail,nullif(trim(p_name),''),trim(p_phone),trim(p_tiktok),'pending',0.30)
    RETURNING * INTO result;
  PERFORM affiliate_private.audit('affiliate_requested',result.id);
  RETURN to_jsonb(result);
END $$;
CREATE FUNCTION public.affiliate_update_destination(p_id uuid,p_uid text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_id THEN RAISE EXCEPTION 'Solo puedes modificar tu cuenta' USING ERRCODE='42501'; END IF;
  IF nullif(trim(p_uid),'') IS NULL OR length(trim(p_uid))>50 THEN RAISE EXCEPTION 'Binance UID inválido'; END IF;
  PERFORM affiliate_private.lock_finance();
  UPDATE public.affiliates SET binance_uid=trim(p_uid),updated_at=now() WHERE id=p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Afiliado no encontrado'; END IF;
  PERFORM affiliate_private.audit('destination_updated',p_id);
END $$;
CREATE FUNCTION public.affiliate_admin_update(p_id uuid,p_status text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result public.affiliates; BEGIN
  PERFORM affiliate_private.require_admin(); PERFORM affiliate_private.lock_finance();
  IF p_status NOT IN ('pending','active','suspended') OR p_status IS NULL THEN RAISE EXCEPTION 'Estado inválido'; END IF;
  UPDATE public.affiliates SET status=p_status, updated_at=now(),
    referral_code=CASE WHEN p_status='active' THEN coalesce(referral_code,'REF'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))) ELSE referral_code END
    WHERE id=p_id RETURNING * INTO result;
  IF NOT FOUND THEN RAISE EXCEPTION 'Afiliado no encontrado'; END IF;
  PERFORM affiliate_private.audit('affiliate_status',p_id,jsonb_build_object('status',p_status));
  RETURN to_jsonb(result);
END $$;
CREATE FUNCTION public.affiliate_admin_upsert(p_email text,p_name text,p_code text,p_binance_uid text,p_status text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid; result public.affiliates; BEGIN
  PERFORM affiliate_private.require_admin(); PERFORM affiliate_private.lock_finance();
  SELECT id INTO uid FROM auth.users WHERE lower(email)=lower(trim(p_email)) AND email_confirmed_at IS NOT NULL;
  IF uid IS NULL THEN RAISE EXCEPTION 'El usuario debe iniciar sesión primero con un correo verificado'; END IF;
  IF p_code IS NULL OR p_code !~ '^[A-Z0-9]{3,15}$' THEN RAISE EXCEPTION 'Código inválido'; END IF;
  INSERT INTO public.affiliates(id,user_email,user_name,referral_code,binance_uid,status,commission_rate)
    VALUES(uid,lower(trim(p_email)),p_name,p_code,p_binance_uid,p_status,0.30)
  ON CONFLICT(id) DO UPDATE SET user_name=EXCLUDED.user_name,referral_code=EXCLUDED.referral_code,
    binance_uid=coalesce(EXCLUDED.binance_uid,affiliates.binance_uid),status=EXCLUDED.status,updated_at=now()
  RETURNING * INTO result;
  PERFORM affiliate_private.audit('affiliate_admin_updated',uid,jsonb_build_object('status',p_status));
  RETURN to_jsonb(result);
END $$;

-- Maturity always comes from this new authoritative payment log. Legacy rows stay visible,
-- but cannot be withdrawn until an administrator reconfirms the actual sale.
CREATE FUNCTION affiliate_private.quote(p_affiliate_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE a public.affiliates; r public.affiliate_finance_rate; ids uuid[];
  cop numeric; usdt numeric; gross numeric; BEGIN
  SELECT * INTO a FROM public.affiliates WHERE id=p_affiliate_id;
  IF a.id IS NULL THEN RAISE EXCEPTION 'Afiliado no encontrado'; END IF;
  SELECT * INTO r FROM public.affiliate_finance_rate WHERE id;
  SELECT coalesce(array_agg(c.id ORDER BY c.id),ARRAY[]::uuid[]),
    coalesce(sum(c.commission_amount) FILTER(WHERE c.currency='COP'),0),
    coalesce(sum(c.commission_amount) FILTER(WHERE c.currency='USDT'),0)
  INTO ids,cop,usdt FROM public.affiliate_commissions c
    JOIN affiliate_private.confirmed_payments pay ON pay.ticket_id=c.ticket_id
    JOIN public.tickets t ON t.id=c.ticket_id
  WHERE c.affiliate_id=a.id AND c.payout_id IS NULL AND c.status IN ('validating','available')
    AND pay.paid_at + interval '7 days' <= now() AND t.status <> 'cancelled'
    AND t.user_id IS NOT NULL AND t.user_id <> a.id
    AND (c.currency='USDT' OR r.cop_per_usdt IS NOT NULL);
  gross=round(usdt + CASE WHEN cop>0 THEN cop/r.cop_per_usdt ELSE 0 END,2);
  RETURN jsonb_build_object('affiliate_id',a.id,'commission_ids',ids,'cop_amount',cop,'usdt_amount',usdt,
    'cop_per_usdt',r.cop_per_usdt,'rate_version',r.version,'gross_usdt',gross,'fee_usdt',2,
    'net_usdt',greatest(gross-2,0),'eligible',a.status='active' AND gross>=5 AND nullif(trim(a.binance_uid),'') IS NOT NULL,
    'binance_uid',coalesce(a.binance_uid,''),'quoted_at',now());
END $$;
CREATE FUNCTION public.affiliate_quote(p_affiliate_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE target uuid=coalesce(p_affiliate_id,auth.uid()); BEGIN
  IF auth.uid() IS NULL OR (auth.uid()<>target AND NOT affiliate_private.is_admin()) THEN
    RAISE EXCEPTION 'No puedes consultar otra cuenta' USING ERRCODE='42501'; END IF;
  RETURN affiliate_private.quote(target);
END $$;
CREATE FUNCTION public.affiliate_request_withdrawal(p_quote jsonb,p_request_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE q jsonb; result public.affiliate_payouts; target uuid=auth.uid(); BEGIN
  IF target IS NULL OR p_request_id IS NULL THEN RAISE EXCEPTION 'Sesión y solicitud requeridas' USING ERRCODE='42501'; END IF;
  PERFORM affiliate_private.lock_finance();
  SELECT * INTO result FROM public.affiliate_payouts WHERE affiliate_id=target AND request_id=p_request_id FOR UPDATE;
  IF FOUND THEN RETURN to_jsonb(result); END IF;
  q=affiliate_private.quote(target);
  IF p_quote IS NULL OR (q-'quoted_at') IS DISTINCT FROM (p_quote-'quoted_at') THEN
    RAISE EXCEPTION 'La cotización cambió. Revisa el saldo y confirma nuevamente.'; END IF;
  IF NOT (q->>'eligible')::boolean THEN RAISE EXCEPTION 'Saldo no disponible: mínimo bruto 5 USDT, validación de 7 días y Binance UID requerido'; END IF;
  INSERT INTO public.affiliate_payouts(affiliate_id,binance_uid,gross_amount_usdt,withdrawal_fee_usdt,net_amount_usdt,
    cop_total_original,cop_to_usdt_rate,rate_version,request_id,commission_ids,status)
  VALUES(target,q->>'binance_uid',(q->>'gross_usdt')::numeric,2,(q->>'net_usdt')::numeric,
    (q->>'cop_amount')::numeric,(q->>'cop_per_usdt')::numeric,(q->>'rate_version')::bigint,p_request_id,
    ARRAY(SELECT jsonb_array_elements_text(q->'commission_ids')::uuid),'pending') RETURNING * INTO result;
  INSERT INTO public.affiliate_payout_items(payout_id,commission_id,currency,original_amount)
    SELECT result.id,c.id,c.currency,c.commission_amount FROM public.affiliate_commissions c WHERE c.id=ANY(result.commission_ids);
  UPDATE public.affiliate_commissions SET payout_id=result.id,updated_at=now() WHERE id=ANY(result.commission_ids) AND payout_id IS NULL;
  PERFORM affiliate_private.audit('withdrawal_requested',result.id,q-'quoted_at');
  RETURN to_jsonb(result);
END $$;
CREATE FUNCTION public.affiliate_transition_payout(p_payout_id uuid,p_action text,p_reference text DEFAULT NULL,p_reason text DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.affiliate_payouts; BEGIN
  PERFORM affiliate_private.require_admin(); PERFORM affiliate_private.lock_finance();
  SELECT * INTO p FROM public.affiliate_payouts WHERE id=p_payout_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Retiro no encontrado'; END IF;
  IF p_action='processing' AND p.status='processing' THEN RETURN; END IF;
  IF p_action='completed' AND p.status='completed' AND lower(trim(p_reference))=lower(trim(p.binance_tx_reference)) THEN RETURN; END IF;
  IF p_action='rejected' AND p.status='rejected' AND p_reason=p.rejected_reason THEN RETURN; END IF;
  IF p.status NOT IN ('pending','processing') THEN RAISE EXCEPTION 'El retiro ya está cerrado'; END IF;
  IF p.commission_ids IS NULL OR cardinality(p.commission_ids)=0 OR EXISTS(
    SELECT 1 FROM unnest(p.commission_ids) AS x(id) LEFT JOIN public.affiliate_commissions c ON c.id=x.id
    WHERE c.id IS NULL OR c.payout_id IS DISTINCT FROM p.id OR c.affiliate_id<>p.affiliate_id OR c.status='paid'
  ) THEN RAISE EXCEPTION 'Retiro histórico/inconsistente: requiere conciliación manual'; END IF;
  IF p_action='processing' THEN
    UPDATE public.affiliate_payouts SET status='processing',processed_at=now(),updated_at=now() WHERE id=p.id;
  ELSIF p_action='completed' THEN
    IF p.status<>'processing' THEN RAISE EXCEPTION 'Marca el retiro en proceso antes de registrar la transferencia'; END IF;
    IF nullif(trim(p_reference),'') IS NULL THEN RAISE EXCEPTION 'La referencia Binance es obligatoria'; END IF;
    UPDATE public.affiliate_payouts SET status='completed',binance_tx_reference=trim(p_reference),paid_at=now(),updated_at=now(),notes=p_reason WHERE id=p.id;
    UPDATE public.affiliate_commissions SET status='paid',updated_at=now() WHERE payout_id=p.id;
  ELSIF p_action='rejected' THEN
    IF nullif(trim(p_reason),'') IS NULL THEN RAISE EXCEPTION 'Indica el motivo y confirma que no hubo transferencia'; END IF;
    UPDATE public.affiliate_payouts SET status='rejected',rejected_reason=p_reason,updated_at=now() WHERE id=p.id;
    UPDATE public.affiliate_commissions SET payout_id=NULL,status='available',updated_at=now() WHERE payout_id=p.id;
  ELSE RAISE EXCEPTION 'Transición inválida'; END IF;
  PERFORM affiliate_private.audit('withdrawal_'||p_action,p.id,jsonb_build_object('reference',p_reference,'reason',p_reason));
END $$;
CREATE FUNCTION public.affiliate_get_audit() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM affiliate_private.require_admin();
  RETURN coalesce((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at DESC,a.id) FROM public.affiliate_finance_audit a),'[]');
END $$;

CREATE FUNCTION affiliate_private.ticket_notes(p_notes text) RETURNS jsonb
LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
BEGIN
  RETURN coalesce(p_notes::jsonb,'{}');
EXCEPTION WHEN invalid_text_representation THEN RETURN '{}';
END $$;
CREATE FUNCTION affiliate_private.capture_ticket(p_ticket_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE t public.tickets; n jsonb; a public.affiliates; c public.affiliate_commissions;
  curr text; gross numeric; discount numeric; BEGIN
  SELECT * INTO t FROM public.tickets WHERE id=p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF auth.uid() IS NULL OR (auth.uid() IS DISTINCT FROM t.user_id AND NOT affiliate_private.is_admin()) THEN
    RAISE EXCEPTION 'No puedes atribuir otro ticket' USING ERRCODE='42501'; END IF;
  SELECT * INTO c FROM public.affiliate_commissions WHERE ticket_id=t.id;
  IF FOUND AND c.status<>'estimated' THEN RETURN to_jsonb(c); END IF;
  n=affiliate_private.ticket_notes(t.notes);
  SELECT * INTO a FROM public.affiliates WHERE upper(referral_code)=upper(n->>'referral_code') AND status='active';
  IF a.id IS NULL OR a.id=t.user_id OR t.user_id IS NULL OR t.status='cancelled' THEN RETURN NULL; END IF;
  curr=CASE WHEN n->>'payment_method'='binance' THEN 'USDT' ELSE 'COP' END;
  -- Ticket price already includes the existing plan/add-on/discount treatment.
  -- The administrator confirms this recorded sale; browser RPC prices are ignored.
  gross=greatest(t.total_price,coalesce((n->>CASE WHEN curr='USDT' THEN 'original_usdt_price' ELSE 'original_cop_price' END)::numeric,t.total_price));
  discount=gross-t.total_price;
  IF t.total_price IS NULL OR t.total_price<0 OR gross::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Precio de venta inválido'; END IF;
  INSERT INTO public.affiliate_commissions(affiliate_id,referral_code,ticket_id,ticket_number,service_name,currency,
    gross_sale_price,discount_amount,net_sale_price,commission_rate,commission_amount,status)
  VALUES(a.id,a.referral_code,t.id,t.ticket_number,t.service_name,curr,gross,discount,t.total_price,0.30,round(t.total_price*0.30,2),'estimated')
  ON CONFLICT(ticket_id) WHERE ticket_id IS NOT NULL DO UPDATE SET affiliate_id=EXCLUDED.affiliate_id,
    referral_code=EXCLUDED.referral_code,service_name=EXCLUDED.service_name,currency=EXCLUDED.currency,
    gross_sale_price=EXCLUDED.gross_sale_price,discount_amount=EXCLUDED.discount_amount,
    net_sale_price=EXCLUDED.net_sale_price,commission_rate=0.30,commission_amount=EXCLUDED.commission_amount,updated_at=now()
    WHERE affiliate_commissions.status='estimated' RETURNING * INTO c;
  RETURN to_jsonb(c);
END $$;
CREATE FUNCTION public.affiliate_capture_ticket(p_ticket_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM affiliate_private.lock_finance();
  RETURN affiliate_private.capture_ticket(p_ticket_id);
END $$;
CREATE FUNCTION public.affiliate_set_ticket_payment(p_ticket_id uuid,p_paid boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE t public.tickets; n jsonb; stamp timestamptz; captured jsonb; BEGIN
  PERFORM affiliate_private.require_admin(); PERFORM affiliate_private.lock_finance();
  IF p_paid IS NULL THEN RAISE EXCEPTION 'Indica el estado de pago'; END IF;
  SELECT * INTO t FROM public.tickets WHERE id=p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF p_paid AND t.status='cancelled' THEN RAISE EXCEPTION 'No puedes confirmar una venta cancelada'; END IF;
  n=affiliate_private.ticket_notes(t.notes);
  IF p_paid THEN
    -- Legacy paid rows have no trusted payment log: reconcile them manually, not on a read.
    IF EXISTS(SELECT 1 FROM public.affiliate_commissions WHERE ticket_id=t.id AND (payout_id IS NOT NULL OR status IN ('validating','available','paid')))
      AND NOT EXISTS(SELECT 1 FROM affiliate_private.confirmed_payments WHERE ticket_id=t.id) THEN
      RAISE EXCEPTION 'Venta histórica: requiere conciliación manual, no una nueva confirmación de pago'; END IF;
    captured=affiliate_private.capture_ticket(t.id);
    IF nullif(trim(n->>'referral_code'),'') IS NOT NULL AND captured IS NULL THEN
      RAISE EXCEPTION 'Referido inválido, inactivo o autorreferido. Corrige la atribución antes de confirmar el pago.'; END IF;
    INSERT INTO affiliate_private.confirmed_payments(ticket_id,paid_at,actor_id) VALUES(t.id,now(),auth.uid())
      ON CONFLICT(ticket_id) DO NOTHING;
    SELECT paid_at INTO stamp FROM affiliate_private.confirmed_payments WHERE ticket_id=t.id;
    UPDATE public.affiliate_commissions SET status='validating',ticket_paid_at=stamp,
      available_at=stamp+interval '7 days',updated_at=now()
      WHERE ticket_id=t.id AND status='estimated' AND payout_id IS NULL;
    n=n||jsonb_build_object('payment_status','paid','is_paid',true,'paid_at',stamp);
  ELSE
    IF EXISTS(SELECT 1 FROM public.affiliate_commissions WHERE ticket_id=t.id AND (payout_id IS NOT NULL OR status='paid')) THEN
      RAISE EXCEPTION 'Hay un retiro reservado o pagado. Concilia la transferencia antes de revertir el pago.'; END IF;
    DELETE FROM affiliate_private.confirmed_payments WHERE ticket_id=t.id;
    UPDATE public.affiliate_commissions SET status='estimated',ticket_paid_at=NULL,available_at=NULL,updated_at=now()
      WHERE ticket_id=t.id AND status<>'cancelled';
    n=n||jsonb_build_object('payment_status','pending','is_paid',false,'paid_at',NULL);
  END IF;
  UPDATE public.tickets SET notes=n::text,updated_at=now() WHERE id=t.id;
  PERFORM affiliate_private.audit(CASE WHEN p_paid THEN 'sale_payment_confirmed' ELSE 'sale_payment_reversed' END,t.id);
END $$;
CREATE FUNCTION public.affiliate_set_ticket_service(p_ticket_id uuid,p_status text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE t public.tickets; BEGIN
  PERFORM affiliate_private.require_admin(); PERFORM affiliate_private.lock_finance();
  IF p_status IS NULL OR p_status NOT IN ('waiting','in_progress','completed','cancelled') THEN RAISE EXCEPTION 'Estado inválido'; END IF;
  SELECT * INTO t FROM public.tickets WHERE id=p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF p_status='cancelled' THEN
    IF EXISTS(SELECT 1 FROM public.affiliate_commissions WHERE ticket_id=t.id AND (payout_id IS NOT NULL OR status='paid')) THEN
      RAISE EXCEPTION 'Hay un retiro reservado o pagado. Se requiere conciliación manual.'; END IF;
    UPDATE public.affiliate_commissions SET status='cancelled',updated_at=now() WHERE ticket_id=t.id;
  ELSIF p_status='completed' THEN
    UPDATE public.affiliate_commissions SET service_completed_at=coalesce(service_completed_at,now()),updated_at=now() WHERE ticket_id=t.id;
  END IF;
  UPDATE public.tickets SET status=p_status,updated_at=now() WHERE id=t.id;
  PERFORM affiliate_private.audit('ticket_service_'||p_status,t.id);
END $$;
CREATE FUNCTION public.affiliate_ticket_number_action(p_ticket_number integer,p_action text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE target uuid; BEGIN
  PERFORM affiliate_private.require_admin();
  SELECT id INTO target FROM public.tickets WHERE ticket_number=p_ticket_number;
  IF target IS NULL THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
  IF p_action='payment' THEN PERFORM public.affiliate_set_ticket_payment(target,true);
  ELSIF p_action IN ('completed','cancelled') THEN PERFORM public.affiliate_set_ticket_service(target,p_action);
  ELSE RAISE EXCEPTION 'Acción inválida'; END IF;
END $$;

-- Defend the authoritative payment ledger even if an older client still updates tickets directly.
CREATE FUNCTION affiliate_private.protect_ticket_finance() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  PERFORM affiliate_private.lock_finance();
  IF TG_OP='DELETE' THEN
    IF EXISTS(SELECT 1 FROM public.affiliate_commissions WHERE ticket_id=OLD.id)
      OR EXISTS(SELECT 1 FROM affiliate_private.confirmed_payments WHERE ticket_id=OLD.id) THEN
      RAISE EXCEPTION 'Ticket financiero: requiere conciliación antes de eliminar su historial'; END IF;
    RETURN OLD;
  END IF;
  IF EXISTS(SELECT 1 FROM public.affiliate_commissions WHERE ticket_id=OLD.id AND (payout_id IS NOT NULL OR status='paid')) THEN
    IF NEW.status='cancelled' OR NEW.total_price IS DISTINCT FROM OLD.total_price
      OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.notes IS DISTINCT FROM OLD.notes THEN
      RAISE EXCEPTION 'Ticket con retiro reservado/pagado: requiere conciliación antes de modificarlo'; END IF;
  END IF;
  IF NOT affiliate_private.is_admin() AND EXISTS(SELECT 1 FROM affiliate_private.confirmed_payments WHERE ticket_id=OLD.id)
    AND (NEW.total_price IS DISTINCT FROM OLD.total_price OR NEW.notes IS DISTINCT FROM OLD.notes
      OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.status IS DISTINCT FROM OLD.status) THEN
    RAISE EXCEPTION 'Venta confirmada: solicita los cambios al administrador' USING ERRCODE='42501'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_affiliate_ticket_finance BEFORE UPDATE OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION affiliate_private.protect_ticket_finance();

-- Read-time projection is conservative; it never silently promotes persisted records.
CREATE FUNCTION public.affiliate_get_commissions(p_affiliate_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE target uuid=p_affiliate_id; result jsonb; BEGIN
  IF auth.uid() IS NULL OR (NOT affiliate_private.is_admin() AND target IS DISTINCT FROM auth.uid()) THEN
    RAISE EXCEPTION 'No puedes consultar otra cuenta' USING ERRCODE='42501'; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(c)||jsonb_build_object(
    'ticket_paid_at',coalesce(pay.paid_at,c.ticket_paid_at),
    'available_at',CASE WHEN pay.ticket_id IS NULL THEN c.available_at ELSE pay.paid_at+interval '7 days' END,
    'requires_reconciliation',pay.ticket_id IS NULL AND c.status IN ('validating','available'),
    'payment_verified',pay.ticket_id IS NOT NULL,
    'status',CASE WHEN c.status IN ('cancelled','paid') OR c.payout_id IS NOT NULL THEN c.status
      WHEN pay.ticket_id IS NULL THEN c.status
      WHEN pay.paid_at+interval '7 days'<=now() THEN 'available' ELSE 'validating' END
    ) ORDER BY c.created_at DESC,c.id),'[]') INTO result
    FROM public.affiliate_commissions c LEFT JOIN affiliate_private.confirmed_payments pay ON pay.ticket_id=c.ticket_id
    WHERE target IS NULL OR c.affiliate_id=target;
  RETURN result;
END $$;

-- Explicit execute allowlist: helpers stay inaccessible, owner checks live inside each RPC.
REVOKE ALL ON ALL TABLES IN SCHEMA affiliate_private FROM PUBLIC,anon,authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA affiliate_private FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION affiliate_private.is_admin() TO authenticated;
DO $$ DECLARE f record; BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature,p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN (
      'affiliate_get_rate','affiliate_set_rate','affiliate_lookup_code','affiliate_register','affiliate_update_destination',
      'affiliate_admin_update','affiliate_admin_upsert','affiliate_quote','affiliate_request_withdrawal',
      'affiliate_transition_payout','affiliate_get_audit','affiliate_capture_ticket','affiliate_set_ticket_payment',
      'affiliate_set_ticket_service','affiliate_ticket_number_action','affiliate_get_commissions')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',f.signature);
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION public.affiliate_lookup_code(text) TO anon;
COMMIT;
