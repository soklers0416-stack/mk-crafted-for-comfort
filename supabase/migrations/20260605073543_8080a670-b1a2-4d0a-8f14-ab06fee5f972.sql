
-- 1. Fix touch_updated_at search_path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- 2. Restrict has_role execution (only server-side & via policies; revoke from clients)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- 3. Tighten requests insert policy: require at least source or data
DROP POLICY IF EXISTS "requests anyone can submit" ON public.requests;
CREATE POLICY "requests submit with payload" ON public.requests FOR INSERT
  WITH CHECK (length(coalesce(source, '')) > 0 AND data IS NOT NULL);

-- 4. Public read for product-photos bucket
CREATE POLICY "product-photos public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-photos');
