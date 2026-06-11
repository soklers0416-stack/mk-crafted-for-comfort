
CREATE TABLE public.spec_mechanisms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photo TEXT,
  recommendations TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spec_mechanisms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spec_mechanisms TO authenticated;
GRANT ALL ON public.spec_mechanisms TO service_role;
ALTER TABLE public.spec_mechanisms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spec_mechanisms public read" ON public.spec_mechanisms FOR SELECT USING (true);
CREATE POLICY "spec_mechanisms admin write" ON public.spec_mechanisms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER spec_mechanisms_touch BEFORE UPDATE ON public.spec_mechanisms FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.spec_fillings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  photo TEXT,
  recommendations TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.spec_fillings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.spec_fillings TO authenticated;
GRANT ALL ON public.spec_fillings TO service_role;
ALTER TABLE public.spec_fillings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spec_fillings public read" ON public.spec_fillings FOR SELECT USING (true);
CREATE POLICY "spec_fillings admin write" ON public.spec_fillings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER spec_fillings_touch BEFORE UPDATE ON public.spec_fillings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS mechanism_id UUID REFERENCES public.spec_mechanisms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS filling_id UUID REFERENCES public.spec_fillings(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sofa_type TEXT,
  ADD COLUMN IF NOT EXISTS custom_size_enabled BOOLEAN NOT NULL DEFAULT false;

INSERT INTO public.spec_mechanisms (slug, name, description, sort_order) VALUES
  ('tik-tak', 'Тик-так', 'Раскладной механизм «тик-так» (пантограф): сиденье плавно выдвигается вперёд и опускается на пол, образуя ровное спальное место без щелей. Подходит для ежедневного использования.', 10),
  ('eurobook', 'Еврокнижка', 'Самый надёжный и простой механизм: сиденье выдвигается вперёд, спинка опускается на освободившееся место. Подходит для ежедневного сна.', 20),
  ('dolphin', 'Дельфин', 'Угловой механизм: из-под сиденья выдвигается дополнительная секция и поднимается до уровня основного сиденья. Образует широкое спальное место.', 30),
  ('accordion', 'Аккордеон', 'Раскладывается одним движением вперёд по принципу гармошки. Большое и ровное спальное место, подходит для ежедневного использования.', 40)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.spec_fillings (slug, name, description, sort_order) VALUES
  ('ppu', 'ППУ', 'Пенополиуретан высокой плотности. Обеспечивает комфортную упругость, хорошо держит форму, гипоаллергенен.', 10),
  ('nps', 'Независимый пружинный блок', 'Каждая пружина в отдельном чехле. Точечная поддержка тела, ортопедический эффект, тишина при движении.', 20),
  ('ppu-nps', 'ППУ + НПБ', 'Комбинированное наполнение: независимый пружинный блок с ортопедическим эффектом плюс комфортные слои ППУ сверху.', 30),
  ('bonnel', 'Зависимый пружинный блок (Боннель)', 'Классический пружинный блок: пружины соединены между собой. Надёжное и доступное решение.', 40)
ON CONFLICT (slug) DO NOTHING;
