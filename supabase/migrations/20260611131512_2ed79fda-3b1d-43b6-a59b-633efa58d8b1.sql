
-- Категории тканей
CREATE TABLE public.fabric_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fabric_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabric_categories TO authenticated;
GRANT ALL ON public.fabric_categories TO service_role;
ALTER TABLE public.fabric_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fabric_categories public read" ON public.fabric_categories FOR SELECT USING (true);
CREATE POLICY "fabric_categories admin write" ON public.fabric_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ткани
CREATE TABLE public.fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL DEFAULT '',
  title text NOT NULL,
  category_slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  characteristics jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendations text NOT NULL DEFAULT '',
  surcharge numeric NOT NULL DEFAULT 0,
  sample_photo text,
  furniture_photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fabrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabrics TO authenticated;
GRANT ALL ON public.fabrics TO service_role;
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fabrics public read" ON public.fabrics FOR SELECT USING (true);
CREATE POLICY "fabrics admin write" ON public.fabrics FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER fabrics_touch BEFORE UPDATE ON public.fabrics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Связь товар <-> ткань
CREATE TABLE public.product_fabrics (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  fabric_id uuid NOT NULL REFERENCES public.fabrics(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, fabric_id)
);
GRANT SELECT ON public.product_fabrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_fabrics TO authenticated;
GRANT ALL ON public.product_fabrics TO service_role;
ALTER TABLE public.product_fabrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_fabrics public read" ON public.product_fabrics FOR SELECT USING (true);
CREATE POLICY "product_fabrics admin write" ON public.product_fabrics FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Начальные категории тканей
INSERT INTO public.fabric_categories (slug, title, sort_order) VALUES
  ('velour', 'Велюр', 10),
  ('rogozhka', 'Рогожка', 20),
  ('boucle', 'Букле', 30),
  ('chenille', 'Шенилл', 40),
  ('eco-leather', 'Экокожа', 50),
  ('antivandal', 'Антивандальные ткани', 60),
  ('premium', 'Премиальные ткани', 70);

-- О компании: блоки контента (key/value)
CREATE TABLE public.about_content (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_content TO authenticated;
GRANT ALL ON public.about_content TO service_role;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about_content public read" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "about_content admin write" ON public.about_content FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Преимущества
CREATE TABLE public.about_advantages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT '',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_advantages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_advantages TO authenticated;
GRANT ALL ON public.about_advantages TO service_role;
ALTER TABLE public.about_advantages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about_advantages public read" ON public.about_advantages FOR SELECT USING (true);
CREATE POLICY "about_advantages admin write" ON public.about_advantages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Цифры/статистика
CREATE TABLE public.about_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_stats TO authenticated;
GRANT ALL ON public.about_stats TO service_role;
ALTER TABLE public.about_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about_stats public read" ON public.about_stats FOR SELECT USING (true);
CREATE POLICY "about_stats admin write" ON public.about_stats FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Шаги как мы работаем
CREATE TABLE public.about_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_steps TO authenticated;
GRANT ALL ON public.about_steps TO service_role;
ALTER TABLE public.about_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "about_steps public read" ON public.about_steps FOR SELECT USING (true);
CREATE POLICY "about_steps admin write" ON public.about_steps FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Фото клиентов
CREATE TABLE public.customer_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo text NOT NULL,
  city text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  comment text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.customer_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_photos TO authenticated;
GRANT ALL ON public.customer_photos TO service_role;
ALTER TABLE public.customer_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_photos public read" ON public.customer_photos FOR SELECT USING (true);
CREATE POLICY "customer_photos admin write" ON public.customer_photos FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Галерея
CREATE TABLE public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo text NOT NULL,
  category text NOT NULL DEFAULT 'showroom',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_items public read" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "gallery_items admin write" ON public.gallery_items FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- FAQ
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "faqs admin write" ON public.faqs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Дефолтное наполнение
INSERT INTO public.about_content (key, value) VALUES
  ('hero', '{"title":"Создаём мебель, в которой хочется жить","text":"МК Мебель — собственное производство в Краснодаре. Современный дизайн, честные цены и помощь в подборе.","button_text":"Смотреть каталог","button_link":"/catalog","image":""}'::jsonb),
  ('why_cheaper', '{"title":"Почему наши цены ниже","text":"Мы производим мебель сами и продаём без посредников. Никаких наценок розничных сетей и переплат за бренд — вы платите только за качество."}'::jsonb),
  ('why_us', '{"title":"Почему выбирают нас","text":"Помогаем подобрать модель, ткань, размеры и комплектацию под ваш интерьер и бюджет. Сопровождаем от заявки до сборки."}'::jsonb),
  ('showroom', '{"title":"Приезжайте и протестируйте мебель лично","text":"Адрес: Краснодар, ул. Уссурийская, 17","button_text":"Построить маршрут","button_link":"https://yandex.ru/maps/?text=Краснодар+Уссурийская+17","images":[]}'::jsonb),
  ('consult', '{"title":"Получите консультацию","text":"Менеджер свяжется с вами и поможет с выбором.","button_text":"Получить консультацию"}'::jsonb);

INSERT INTO public.about_advantages (icon, title, description, sort_order) VALUES
  ('factory','Собственное производство','Полный цикл изготовления в Краснодаре',10),
  ('tag','Цены без посредников','Продаём напрямую — без розничных наценок',20),
  ('truck','Доставка по России','Доставляем в любой регион',30),
  ('layers','Более 100 моделей мебели','Большой каталог под любые задачи',40),
  ('clock','Изготовление от 14 дней','Минимальные сроки производства',50),
  ('hand','Помощь в подборе','Поможем выбрать ткань, размер и комплектацию',60);

INSERT INTO public.about_stats (label, value, sort_order) VALUES
  ('лет опыта','10+',10),
  ('довольных клиентов','5000+',20),
  ('моделей мебели','100+',30),
  ('вариантов тканей','100+',40);

INSERT INTO public.about_steps (title, description, sort_order) VALUES
  ('Выбор мебели','Выбираете модель в каталоге или с помощью менеджера',10),
  ('Подбор тканей и размеров','Подбираем ткань, цвет, размеры и комплектацию',20),
  ('Изготовление','Производим мебель на нашем производстве',30),
  ('Доставка и сборка','Доставляем и собираем у вас дома',40);

INSERT INTO public.faqs (question, answer, sort_order) VALUES
  ('Сколько времени занимает изготовление?','В среднем 14–21 день в зависимости от модели и комплектации.',10),
  ('Можно ли изменить размеры мебели?','Да, многие модели изготавливаются под индивидуальные размеры.',20),
  ('Можно ли выбрать другую ткань?','Да, доступно более 100 вариантов тканей разных категорий.',30),
  ('Есть ли доставка по России?','Да, доставляем в любой регион РФ транспортными компаниями.',40);
