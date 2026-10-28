-- Overload affiliate_get_commissions with 0 parameters for PostgREST schema cache compatibility
CREATE OR REPLACE FUNCTION public.affiliate_get_commissions()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.affiliate_get_commissions(NULL::uuid);
$$;

REVOKE ALL ON FUNCTION public.affiliate_get_commissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.affiliate_get_commissions() TO authenticated;

NOTIFY pgrst, 'reload schema';
