CREATE TABLE public.size_price_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_slug text NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
    title text NOT NULL DEFAULT '',
    rows jsonb NOT NULL DEFAULT '[]'::jsonb,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.size_price_templates TO authenticated;
GRANT ALL ON public.size_price_templates TO service_role;

ALTER TABLE public.size_price_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "size_price_templates admin write"
ON public.size_price_templates
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "size_price_templates public read"
ON public.size_price_templates
FOR SELECT
USING (true);

CREATE TRIGGER size_price_templates_touch
BEFORE UPDATE ON public.size_price_templates
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();