
CREATE TABLE public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nav_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
GRANT ALL ON public.nav_items TO service_role;

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read nav_items" ON public.nav_items FOR SELECT USING (true);
CREATE POLICY "Admins manage nav_items" ON public.nav_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER nav_items_touch BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.nav_items (label, href, sort_order) VALUES
  ('Каталог', '/catalog', 10),
  ('Ткани', '/fabrics', 20),
  ('Акции', '/promotions', 30),
  ('МК Подбор', '/apartment', 40),
  ('Партнёры', '/partners', 50),
  ('Отзывы', '/reviews', 60),
  ('О компании', '/about', 70),
  ('Доставка и оплата', '/delivery', 80),
  ('Контакты', '/contacts', 90);
