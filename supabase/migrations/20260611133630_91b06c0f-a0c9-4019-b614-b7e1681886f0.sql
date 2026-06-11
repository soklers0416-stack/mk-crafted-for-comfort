
-- 1. partner_categories
CREATE TABLE public.partner_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partner_categories TO anon, authenticated;
GRANT ALL ON public.partner_categories TO service_role;
ALTER TABLE public.partner_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_categories public read" ON public.partner_categories FOR SELECT USING (true);
CREATE POLICY "partner_categories admin write" ON public.partner_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. partners
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  advantages jsonb NOT NULL DEFAULT '[]'::jsonb,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  socials jsonb NOT NULL DEFAULT '[]'::jsonb,
  logo text,
  main_photo text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_for jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partners TO anon, authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners public read" ON public.partners FOR SELECT USING (true);
CREATE POLICY "partners admin write" ON public.partners FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER partners_touch BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. partner_applications
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  category_slug text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.partner_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_applications public insert" ON public.partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "partner_applications admin read" ON public.partner_applications FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "partner_applications admin update" ON public.partner_applications FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "partner_applications admin delete" ON public.partner_applications FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER partner_applications_touch BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 4. partners_content
CREATE TABLE public.partners_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.partners_content TO anon, authenticated;
GRANT ALL ON public.partners_content TO service_role;
ALTER TABLE public.partners_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_content public read" ON public.partners_content FOR SELECT USING (true);
CREATE POLICY "partners_content admin write" ON public.partners_content FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER partners_content_touch BEFORE UPDATE ON public.partners_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
