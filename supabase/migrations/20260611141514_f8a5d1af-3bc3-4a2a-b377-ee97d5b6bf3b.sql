
-- 1. Form configs (упрощённый редактор)
CREATE TABLE public.form_configs (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  button_text TEXT NOT NULL DEFAULT 'Отправить',
  success_text TEXT NOT NULL DEFAULT 'Спасибо! Мы скоро свяжемся.',
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.form_configs TO anon, authenticated;
GRANT ALL ON public.form_configs TO service_role, authenticated;
ALTER TABLE public.form_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "form_configs public read" ON public.form_configs FOR SELECT USING (true);
CREATE POLICY "form_configs admin write" ON public.form_configs FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER form_configs_touch BEFORE UPDATE ON public.form_configs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Seed форм
INSERT INTO public.form_configs (key, title, description, button_text, success_text, fields) VALUES
('callback', 'Обратный звонок', 'Перезвоним в течение 15 минут в рабочее время.', 'Заказать звонок', 'Спасибо! Мы скоро перезвоним.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"comment","label":"Комментарий","type":"textarea","required":false,"order":3}]'),
('consult', 'Получить консультацию', 'Подберём мебель под ваш интерьер и бюджет.', 'Отправить', 'Спасибо! Менеджер свяжется с вами.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"comment","label":"Что подобрать","type":"textarea","required":false,"order":3}]'),
('custom-size', 'Нужен другой размер', 'Изготовим мебель по индивидуальным размерам.', 'Отправить заявку', 'Спасибо! Уточним детали и пришлём расчёт.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"size","label":"Желаемый размер","type":"text","required":true,"order":3},{"name":"comment","label":"Комментарий","type":"textarea","required":false,"order":4}]'),
('fabric-samples', 'Получить примеры мебели в ткани', 'Пришлём фото мебели в выбранной ткани.', 'Отправить', 'Спасибо! Подготовим примеры и пришлём.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"email","label":"Email","type":"email","required":false,"order":3},{"name":"comment","label":"Какую ткань","type":"textarea","required":false,"order":4}]'),
('visualization', 'Визуализация мебели в интерьере', 'Бесплатно покажем, как мебель будет смотреться у вас.', 'Отправить заявку', 'Спасибо! Дизайнер свяжется с вами.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"email","label":"Email","type":"email","required":false,"order":3},{"name":"photo","label":"Фото интерьера","type":"photo","required":false,"order":4},{"name":"comment","label":"Комментарий","type":"textarea","required":false,"order":5}]'),
('partner', 'Стать партнёром', 'Заполните форму — наш менеджер свяжется с вами.', 'Отправить заявку', 'Спасибо! Свяжемся в ближайшее время.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"company","label":"Компания","type":"text","required":false,"order":2},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":3},{"name":"email","label":"Email","type":"email","required":false,"order":4},{"name":"website","label":"Сайт","type":"text","required":false,"order":5},{"name":"comment","label":"Комментарий","type":"textarea","required":false,"order":6}]'),
('cart', 'Оформление заказа', '', 'Отправить заявку', 'Спасибо! Менеджер свяжется в ближайшее время.',
  '[{"name":"name","label":"Имя","type":"text","required":true,"order":1},{"name":"phone","label":"Телефон","type":"tel","required":true,"order":2},{"name":"email","label":"Email","type":"email","required":false,"order":3},{"name":"comment","label":"Комментарий","type":"textarea","required":false,"order":4}]')
ON CONFLICT (key) DO NOTHING;

-- 2. Integrations (одна строка)
CREATE TABLE public.integrations (
  id INTEGER PRIMARY KEY DEFAULT 1,
  apps_script_url TEXT NOT NULL DEFAULT '',
  sheets_url TEXT NOT NULL DEFAULT '',
  webhook_url TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  last_test_at TIMESTAMPTZ,
  last_test_status TEXT NOT NULL DEFAULT '',
  last_test_message TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT integrations_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE ON public.integrations TO authenticated;
GRANT ALL ON public.integrations TO service_role;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrations admin read" ON public.integrations FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "integrations admin write" ON public.integrations FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER integrations_touch BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
INSERT INTO public.integrations (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 3. View объединяющая все заявки
CREATE OR REPLACE VIEW public.all_applications WITH (security_invoker = true) AS
SELECT
  r.id,
  r.source AS form_key,
  r.title,
  COALESCE(r.data->>'name','') AS name,
  COALESCE(r.data->>'phone','') AS phone,
  COALESCE(r.data->>'email','') AS email,
  r.data,
  r.status,
  r.created_at,
  'request'::text AS origin
FROM public.requests r
UNION ALL
SELECT
  p.id,
  'partner' AS form_key,
  'Заявка партнёра' AS title,
  p.name,
  p.phone,
  p.email,
  jsonb_build_object(
    'name', p.name, 'company', p.company, 'phone', p.phone,
    'email', p.email, 'website', p.website, 'category', p.category_slug,
    'comment', p.comment
  ) AS data,
  p.status,
  p.created_at,
  'partner'::text AS origin
FROM public.partner_applications p;

GRANT SELECT ON public.all_applications TO authenticated;
