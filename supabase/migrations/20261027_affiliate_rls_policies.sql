-- Migración para corregir y habilitar políticas RLS completas en las tablas del programa de afiliados

-- 1. Tabla: affiliates
DROP POLICY IF EXISTS "Afiliados pueden ver su propio registro" ON public.affiliates;
DROP POLICY IF EXISTS "Afiliados pueden actualizar su binance_uid" ON public.affiliates;
DROP POLICY IF EXISTS "Afiliados pueden ver sus propias comisiones" ON public.affiliates;
DROP POLICY IF EXISTS "Allow select on affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Allow insert on affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Allow update on affiliates" ON public.affiliates;

CREATE POLICY "Allow select on affiliates"
    ON public.affiliates FOR SELECT
    USING (true);

CREATE POLICY "Allow insert on affiliates"
    ON public.affiliates FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update on affiliates"
    ON public.affiliates FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 2. Tabla: affiliate_commissions
DROP POLICY IF EXISTS "Afiliados pueden ver comisiones de su cuenta" ON public.affiliate_commissions;
DROP POLICY IF EXISTS "Allow select on affiliate_commissions" ON public.affiliate_commissions;
DROP POLICY IF EXISTS "Allow insert on affiliate_commissions" ON public.affiliate_commissions;
DROP POLICY IF EXISTS "Allow update on affiliate_commissions" ON public.affiliate_commissions;

CREATE POLICY "Allow select on affiliate_commissions"
    ON public.affiliate_commissions FOR SELECT
    USING (true);

CREATE POLICY "Allow insert on affiliate_commissions"
    ON public.affiliate_commissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update on affiliate_commissions"
    ON public.affiliate_commissions FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 3. Tabla: affiliate_payouts
DROP POLICY IF EXISTS "Afiliados pueden ver sus propias liquidaciones" ON public.affiliate_payouts;
DROP POLICY IF EXISTS "Allow select on affiliate_payouts" ON public.affiliate_payouts;
DROP POLICY IF EXISTS "Allow insert on affiliate_payouts" ON public.affiliate_payouts;
DROP POLICY IF EXISTS "Allow update on affiliate_payouts" ON public.affiliate_payouts;

CREATE POLICY "Allow select on affiliate_payouts"
    ON public.affiliate_payouts FOR SELECT
    USING (true);

CREATE POLICY "Allow insert on affiliate_payouts"
    ON public.affiliate_payouts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update on affiliate_payouts"
    ON public.affiliate_payouts FOR UPDATE
    USING (true)
    WITH CHECK (true);
