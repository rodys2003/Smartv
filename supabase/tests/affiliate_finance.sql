-- Structural privilege contract. Executed against isolated PostgreSQL by the Node DB harness.
DO $$
DECLARE table_name text; proc record;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['affiliates','affiliate_commissions','affiliate_payouts','affiliate_finance_rate','affiliate_finance_audit','affiliate_payout_items'] LOOP
    IF has_table_privilege('authenticated','public.'||table_name,'INSERT')
      OR has_table_privilege('authenticated','public.'||table_name,'UPDATE')
      OR has_table_privilege('authenticated','public.'||table_name,'DELETE') THEN
      RAISE EXCEPTION 'Direct financial write privilege on %',table_name;
    END IF;
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid=('public.'||table_name)::regclass) THEN
      RAISE EXCEPTION 'RLS missing on %',table_name;
    END IF;
  END LOOP;
  FOR proc IN SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname LIKE 'affiliate_%' AND p.proname<>'affiliate_lookup_code'
  LOOP
    IF has_function_privilege('anon',proc.oid,'EXECUTE') THEN RAISE EXCEPTION 'Anonymous financial RPC access'; END IF;
  END LOOP;
END $$;
