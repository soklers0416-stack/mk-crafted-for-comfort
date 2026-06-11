
-- Product stats table (1 row per product)
CREATE TABLE public.product_stats (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  views bigint NOT NULL DEFAULT 0,
  likes bigint NOT NULL DEFAULT 0,
  cart_adds bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_stats TO anon, authenticated;
GRANT ALL ON public.product_stats TO service_role;
ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read stats" ON public.product_stats FOR SELECT USING (true);
CREATE POLICY "Admins can manage stats" ON public.product_stats FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RPC to safely increment counters (callable by anon)
CREATE OR REPLACE FUNCTION public.increment_product_stat(p_id uuid, p_field text, p_delta int DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_field NOT IN ('views','likes','cart_adds') THEN
    RAISE EXCEPTION 'invalid field %', p_field;
  END IF;
  INSERT INTO public.product_stats(product_id, views, likes, cart_adds)
  VALUES (p_id,
    CASE WHEN p_field='views' THEN GREATEST(p_delta,0) ELSE 0 END,
    CASE WHEN p_field='likes' THEN GREATEST(p_delta,0) ELSE 0 END,
    CASE WHEN p_field='cart_adds' THEN GREATEST(p_delta,0) ELSE 0 END)
  ON CONFLICT (product_id) DO UPDATE SET
    views = CASE WHEN p_field='views' THEN GREATEST(product_stats.views + p_delta, 0) ELSE product_stats.views END,
    likes = CASE WHEN p_field='likes' THEN GREATEST(product_stats.likes + p_delta, 0) ELSE product_stats.likes END,
    cart_adds = CASE WHEN p_field='cart_adds' THEN GREATEST(product_stats.cart_adds + p_delta, 0) ELSE product_stats.cart_adds END,
    updated_at = now();
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_product_stat(uuid, text, int) TO anon, authenticated;

-- Home blocks configuration
CREATE TABLE public.home_blocks (
  key text PRIMARY KEY,
  title text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_blocks TO anon, authenticated;
GRANT ALL ON public.home_blocks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_blocks TO authenticated;
ALTER TABLE public.home_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read home_blocks" ON public.home_blocks FOR SELECT USING (true);
CREATE POLICY "Admins manage home_blocks" ON public.home_blocks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.home_blocks(key, title, enabled, sort_order) VALUES
  ('bestsellers','Хиты продаж', true, 10),
  ('popular','Популярное сейчас', true, 20),
  ('recently_viewed','Вы недавно смотрели', true, 30)
ON CONFLICT (key) DO NOTHING;
