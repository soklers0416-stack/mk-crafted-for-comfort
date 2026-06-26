GRANT SELECT (apps_script_url, webhook_url, enabled) ON public.integrations TO anon;
CREATE POLICY "integrations public webhook urls"
ON public.integrations
FOR SELECT
TO anon
USING (true);