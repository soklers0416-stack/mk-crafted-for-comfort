import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PageBlockKind = "hero-banner" | "text-image" | "gallery" | "cta" | "system";

export type PageBlock = {
  id: string;
  page_key: string;
  kind: PageBlockKind | string;
  system_ref: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  gallery: string[];
  button_text: string | null;
  button_link: string | null;
  is_visible: boolean;
  sort_order: number;
  settings: Record<string, any>;
};

export type HomeSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  bg_color: string | null;
  text_align: string | null;
  is_visible: boolean;
  sort_order: number;
};

const sb = supabase as any;

function normalize(row: any): PageBlock {
  return {
    ...row,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    settings: row.settings ?? {},
  };
}

export function pageBlocksQuery(pageKey: string) {
  return queryOptions({
    queryKey: ["page_blocks", pageKey],
    queryFn: async (): Promise<PageBlock[]> => {
      const { data, error } = await sb
        .from("page_blocks")
        .select("*")
        .eq("page_key", pageKey)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []).map(normalize);
    },
  });
}

export const allPageBlocksQuery = queryOptions({
  queryKey: ["page_blocks", "all"],
  queryFn: async (): Promise<PageBlock[]> => {
    const { data, error } = await sb.from("page_blocks").select("*").order("page_key").order("sort_order");
    if (error) throw error;
    return (data ?? []).map(normalize);
  },
});

export const homeSlidesQuery = queryOptions({
  queryKey: ["home_slides"],
  queryFn: async (): Promise<HomeSlide[]> => {
    const { data, error } = await sb.from("home_slides").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as HomeSlide[];
  },
});

export const PAGE_KEYS: { key: string; label: string }[] = [
  { key: "about", label: "О компании" },
  { key: "partners", label: "Партнёры" },
  { key: "fabrics", label: "Ткани" },
  { key: "apartment", label: "Квартира под ключ" },
];
