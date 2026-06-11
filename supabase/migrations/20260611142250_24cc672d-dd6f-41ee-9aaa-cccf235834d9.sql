
-- Тексты раздела
CREATE TABLE public.apartment_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apartment_content TO anon, authenticated;
GRANT ALL ON public.apartment_content TO service_role, authenticated;
ALTER TABLE public.apartment_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apartment_content public read" ON public.apartment_content FOR SELECT USING (true);
CREATE POLICY "apartment_content admin write" ON public.apartment_content FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER apartment_content_touch BEFORE UPDATE ON public.apartment_content
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

INSERT INTO public.apartment_content (key, value) VALUES
('badge', '🔥 ЭКОНОМИЯ ДО 7% ПРИ ПОКУПКЕ КОМПЛЕКТОМ'),
('headline', 'Квартира под ключ от 115 000 ₽'),
('price_from', 'от 115 000 ₽'),
('subtext', 'Один комплект. Одна доставка. Одна выгодная цена. Соберите мебель для всей квартиры и получите дополнительную скидку до 7%.'),
('cta_main', 'Рассчитать стоимость'),
('cta_info', 'Узнать подробнее'),
('info_title', 'Условия акции'),
('info_text', 'Чем больше товаров в комплекте — тем выше скидка. Скидка применяется автоматически после выбора товаров.'),
('form_title', 'Получить расчёт'),
('form_text', 'Оставьте контакты — пришлём расчёт и забронируем цену.')
ON CONFLICT (key) DO NOTHING;

-- Категории комплекта
CREATE TABLE public.apartment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  product_category_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apartment_categories TO anon, authenticated;
GRANT ALL ON public.apartment_categories TO service_role, authenticated;
ALTER TABLE public.apartment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apartment_categories public read" ON public.apartment_categories FOR SELECT USING (true);
CREATE POLICY "apartment_categories admin write" ON public.apartment_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER apartment_categories_touch BEFORE UPDATE ON public.apartment_categories
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

INSERT INTO public.apartment_categories (title, sort_order, product_category_slugs) VALUES
('Диван', 1, '["sofas"]'),
('Кровать', 2, '["beds"]'),
('Матрас', 3, '["mattresses"]'),
('Шкаф', 4, '["wardrobes"]'),
('Комод', 5, '["dressers"]'),
('Прихожая', 6, '["hallways"]'),
('Стол', 7, '["tables","dining"]'),
('Стулья', 8, '["chairs"]');

-- Правила скидок
CREATE TABLE public.apartment_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  min_items INTEGER NOT NULL DEFAULT 1,
  min_amount NUMERIC NOT NULL DEFAULT 0,
  percent NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apartment_discounts TO anon, authenticated;
GRANT ALL ON public.apartment_discounts TO service_role, authenticated;
ALTER TABLE public.apartment_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apartment_discounts public read" ON public.apartment_discounts FOR SELECT USING (true);
CREATE POLICY "apartment_discounts admin write" ON public.apartment_discounts FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER apartment_discounts_touch BEFORE UPDATE ON public.apartment_discounts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

INSERT INTO public.apartment_discounts (title, description, min_items, min_amount, percent, sort_order) VALUES
('3 товара', 'Скидка 3% от 100 000 ₽', 3, 100000, 3, 1),
('5 товаров', 'Скидка 5% от 200 000 ₽', 5, 200000, 5, 2),
('7 товаров', 'Скидка 7% от 300 000 ₽', 7, 300000, 7, 3);

-- Аналитика
CREATE TABLE public.apartment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.apartment_events TO anon, authenticated;
GRANT SELECT, DELETE ON public.apartment_events TO authenticated;
GRANT ALL ON public.apartment_events TO service_role;
ALTER TABLE public.apartment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apartment_events public insert" ON public.apartment_events FOR INSERT
  WITH CHECK (event_type IN ('view','start','submit','category_pick'));
CREATE POLICY "apartment_events admin read" ON public.apartment_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));
CREATE POLICY "apartment_events admin delete" ON public.apartment_events FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));
CREATE INDEX apartment_events_created_at_idx ON public.apartment_events (created_at DESC);
CREATE INDEX apartment_events_type_idx ON public.apartment_events (event_type);

-- Запись «Квартира под ключ» в form_configs
INSERT INTO public.form_configs (key, title, description, button_text, success_text, fields) VALUES
('apartment', 'Получить расчёт «Квартира под ключ»', 'Менеджер свяжется в течение 15 минут и подтвердит цену.', 'Отправить заявку', 'Спасибо! Расчёт уже у менеджера, он скоро свяжется.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"comment","label":"Комментарий","type":"textarea","required":false,"order":3}]')
ON CONFLICT (key) DO NOTHING;
