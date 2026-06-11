import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Category, Product, Review, Fabric, FabricCategory, ProductFabric,
  AboutContent, AboutAdvantage, AboutStat, AboutStep, CustomerPhoto, GalleryItem, Faq,
  Partner, PartnerCategory,
} from "./db";

const sb = supabase as any;

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await sb.from("categories").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Category[];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await sb.from("products").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Product[];
  },
});

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: async (): Promise<Review[]> => {
    const { data, error } = await sb.from("reviews").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Review[];
  },
});

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await sb.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });
}

export const fabricCategoriesQuery = queryOptions({
  queryKey: ["fabric_categories"],
  queryFn: async (): Promise<FabricCategory[]> => {
    const { data, error } = await sb.from("fabric_categories").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as FabricCategory[];
  },
});

export const fabricsQuery = queryOptions({
  queryKey: ["fabrics"],
  queryFn: async (): Promise<Fabric[]> => {
    const { data, error } = await sb.from("fabrics").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []).map((f: any) => ({
      ...f,
      characteristics: f.characteristics ?? {},
      furniture_photos: Array.isArray(f.furniture_photos) ? f.furniture_photos : [],
    })) as Fabric[];
  },
});

export function fabricQuery(id: string) {
  return queryOptions({
    queryKey: ["fabric", id],
    queryFn: async (): Promise<Fabric | null> => {
      const { data, error } = await sb.from("fabrics").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        characteristics: data.characteristics ?? {},
        furniture_photos: Array.isArray(data.furniture_photos) ? data.furniture_photos : [],
      } as Fabric;
    },
  });
}

export const productFabricsQuery = queryOptions({
  queryKey: ["product_fabrics"],
  queryFn: async (): Promise<ProductFabric[]> => {
    const { data, error } = await sb.from("product_fabrics").select("product_id,fabric_id");
    if (error) throw error;
    return (data ?? []) as ProductFabric[];
  },
});

export const aboutContentQuery = queryOptions({
  queryKey: ["about_content"],
  queryFn: async (): Promise<Record<string, Record<string, any>>> => {
    const { data, error } = await sb.from("about_content").select("key,value");
    if (error) throw error;
    const map: Record<string, any> = {};
    for (const r of (data ?? []) as AboutContent[]) map[r.key] = r.value ?? {};
    return map;
  },
});

export const aboutAdvantagesQuery = queryOptions({
  queryKey: ["about_advantages"],
  queryFn: async (): Promise<AboutAdvantage[]> => {
    const { data, error } = await sb.from("about_advantages").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AboutAdvantage[];
  },
});
export const aboutStatsQuery = queryOptions({
  queryKey: ["about_stats"],
  queryFn: async (): Promise<AboutStat[]> => {
    const { data, error } = await sb.from("about_stats").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AboutStat[];
  },
});
export const aboutStepsQuery = queryOptions({
  queryKey: ["about_steps"],
  queryFn: async (): Promise<AboutStep[]> => {
    const { data, error } = await sb.from("about_steps").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as AboutStep[];
  },
});
export const customerPhotosQuery = queryOptions({
  queryKey: ["customer_photos"],
  queryFn: async (): Promise<CustomerPhoto[]> => {
    const { data, error } = await sb.from("customer_photos").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as CustomerPhoto[];
  },
});
export const galleryItemsQuery = queryOptions({
  queryKey: ["gallery_items"],
  queryFn: async (): Promise<GalleryItem[]> => {
    const { data, error } = await sb.from("gallery_items").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as GalleryItem[];
  },
});
export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async (): Promise<Faq[]> => {
    const { data, error } = await sb.from("faqs").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as Faq[];
  },
});
