
GRANT INSERT ON public.requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;

GRANT SELECT ON public.integrations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
