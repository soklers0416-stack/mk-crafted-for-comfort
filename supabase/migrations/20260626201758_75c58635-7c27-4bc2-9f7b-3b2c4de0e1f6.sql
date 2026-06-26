
DROP POLICY IF EXISTS "requests submit with payload" ON public.requests;
CREATE POLICY "requests anon insert" ON public.requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(COALESCE(source,'')) > 0 AND data IS NOT NULL);
NOTIFY pgrst, 'reload schema';
