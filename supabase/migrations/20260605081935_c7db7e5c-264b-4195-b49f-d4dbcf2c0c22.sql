
-- Allow storage (and clients) to execute the role check
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Reset existing policies on product-photos bucket
DROP POLICY IF EXISTS "product-photos public read" ON storage.objects;
DROP POLICY IF EXISTS "product-photos admin insert" ON storage.objects;
DROP POLICY IF EXISTS "product-photos admin update" ON storage.objects;
DROP POLICY IF EXISTS "product-photos admin delete" ON storage.objects;

CREATE POLICY "product-photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-photos');

CREATE POLICY "product-photos admin insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product-photos admin update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-photos' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "product-photos admin delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-photos' AND public.has_role(auth.uid(), 'admin'));
