
-- Global list of dynamic fabric characteristic fields
CREATE TABLE public.fabric_characteristics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fabric_characteristics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabric_characteristics TO authenticated;
GRANT ALL ON public.fabric_characteristics TO service_role;
ALTER TABLE public.fabric_characteristics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.fabric_characteristics FOR SELECT USING (true);
CREATE POLICY "auth manage" ON public.fabric_characteristics FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fc_touch BEFORE UPDATE ON public.fabric_characteristics FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Colors of a fabric collection
CREATE TABLE public.fabric_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fabric_id uuid NOT NULL REFERENCES public.fabrics(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  code text NOT NULL DEFAULT '',
  photo text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fabric_colors_fabric_id_idx ON public.fabric_colors(fabric_id);
GRANT SELECT ON public.fabric_colors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fabric_colors TO authenticated;
GRANT ALL ON public.fabric_colors TO service_role;
ALTER TABLE public.fabric_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.fabric_colors FOR SELECT USING (true);
CREATE POLICY "auth manage" ON public.fabric_colors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER fcol_touch BEFORE UPDATE ON public.fabric_colors FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed characteristics list from existing data keys
INSERT INTO public.fabric_characteristics (label, sort_order)
SELECT DISTINCT key, row_number() OVER (ORDER BY key) * 10
FROM public.fabrics, jsonb_object_keys(characteristics) AS key
WHERE jsonb_typeof(characteristics) = 'object'
ON CONFLICT (label) DO NOTHING;
