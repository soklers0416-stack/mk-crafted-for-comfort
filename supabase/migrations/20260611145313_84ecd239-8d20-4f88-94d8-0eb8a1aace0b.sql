
-- PAGE BLOCKS
CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  kind text NOT NULL DEFAULT 'text-image',
  system_ref text,
  title text,
  subtitle text,
  body text,
  image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  button_text text,
  button_link text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_blocks_page_idx ON public.page_blocks(page_key, sort_order);

GRANT SELECT ON public.page_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT ALL ON public.page_blocks TO service_role;

ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_blocks read all" ON public.page_blocks FOR SELECT USING (true);
CREATE POLICY "page_blocks admin write" ON public.page_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER page_blocks_touch BEFORE UPDATE ON public.page_blocks
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- HOME SLIDES
CREATE TABLE public.home_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text,
  button_text text,
  button_link text,
  image_url text,
  bg_color text DEFAULT '#f5f3ee',
  text_align text DEFAULT 'left',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.home_slides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_slides TO authenticated;
GRANT ALL ON public.home_slides TO service_role;

ALTER TABLE public.home_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "home_slides read all" ON public.home_slides FOR SELECT USING (true);
CREATE POLICY "home_slides admin write" ON public.home_slides FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER home_slides_touch BEFORE UPDATE ON public.home_slides
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED HOME SLIDES (5 from brief)
INSERT INTO public.home_slides (title, subtitle, button_text, button_link, sort_order) VALUES
  ('Ваш дом. Ваш стиль. Наша мебель.', 'Собственное производство в Краснодаре', 'В каталог', '/catalog', 1),
  ('Уют начинается с правильного дивана.', 'Большой выбор моделей и тканей', 'Смотреть диваны', '/catalog?category=divany', 2),
  ('Место, где собирается вся семья.', 'Мебель, в которой хочется проводить время', 'Каталог', '/catalog', 3),
  ('Красивый интерьер не должен ждать.', 'Доставка по России, рассрочка', 'Подобрать мебель', '/catalog', 4),
  ('В мебельном магазине можно потеряться. У нас — найти своё.', 'Помогаем подобрать комплект под вашу квартиру', 'Квартира под ключ', '/apartment', 5);

-- SEED PAGE_BLOCKS: hero banners and system sections for 4 pages
-- ABOUT
INSERT INTO public.page_blocks (page_key, kind, title, subtitle, sort_order) VALUES
  ('about','hero-banner','О компании','Производство мебели в Краснодаре',0);
INSERT INTO public.page_blocks (page_key, kind, system_ref, title, sort_order) VALUES
  ('about','system','about.intro','Введение',1),
  ('about','system','about.stats','Цифры компании',2),
  ('about','system','about.advantages','Преимущества',3),
  ('about','system','about.steps','Как мы работаем',4),
  ('about','system','about.gallery','Галерея',5);

-- PARTNERS
INSERT INTO public.page_blocks (page_key, kind, title, subtitle, sort_order) VALUES
  ('partners','hero-banner','Партнёрам','Условия сотрудничества и партнёрская программа',0);
INSERT INTO public.page_blocks (page_key, kind, system_ref, title, sort_order) VALUES
  ('partners','system','partners.intro','Введение',1),
  ('partners','system','partners.categories','Категории партнёров',2),
  ('partners','system','partners.list','Список партнёров',3),
  ('partners','system','partners.form','Форма заявки',4);

-- FABRICS
INSERT INTO public.page_blocks (page_key, kind, title, subtitle, sort_order) VALUES
  ('fabrics','hero-banner','Каталог тканей','Подберите ткань для вашей мебели',0);
INSERT INTO public.page_blocks (page_key, kind, system_ref, title, sort_order) VALUES
  ('fabrics','system','fabrics.filters','Фильтры',1),
  ('fabrics','system','fabrics.grid','Каталог тканей',2);

-- APARTMENT
INSERT INTO public.page_blocks (page_key, kind, title, subtitle, sort_order) VALUES
  ('apartment','hero-banner','Квартира под ключ','Соберите комплект мебели со скидкой',0);
INSERT INTO public.page_blocks (page_key, kind, system_ref, title, sort_order) VALUES
  ('apartment','system','apartment.intro','Описание',1),
  ('apartment','system','apartment.builder','Конструктор комплекта',2),
  ('apartment','system','apartment.discounts','Условия скидок',3);
