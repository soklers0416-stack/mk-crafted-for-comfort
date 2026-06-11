import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ApartmentContent = Record<string, string>;
export type ApartmentCategory = {
  id: string;
  title: string;
  sort_order: number;
  product_category_slugs: string[];
};
export type ApartmentDiscount = {
  id: string;
  title: string;
  description: string;
  min_items: number;
  min_amount: number;
  percent: number;
  sort_order: number;
};

export const apartmentContentQuery = queryOptions({
  queryKey: ["apartment_content"],
  queryFn: async (): Promise<ApartmentContent> => {
    const { data, error } = await (supabase as any).from("apartment_content").select("key,value");
    if (error) throw error;
    const map: ApartmentContent = {};
    for (const row of (data ?? []) as { key: string; value: string }[]) map[row.key] = row.value;
    return map;
  },
});

export const apartmentCategoriesQuery = queryOptions({
  queryKey: ["apartment_categories"],
  queryFn: async (): Promise<ApartmentCategory[]> => {
    const { data, error } = await (supabase as any)
      .from("apartment_categories").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as ApartmentCategory[];
  },
});

export const apartmentDiscountsQuery = queryOptions({
  queryKey: ["apartment_discounts"],
  queryFn: async (): Promise<ApartmentDiscount[]> => {
    const { data, error } = await (supabase as any)
      .from("apartment_discounts").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as ApartmentDiscount[];
  },
});

// Расчёт скидки: берём правило с максимальным процентом, чьи условия выполнены.
export function pickDiscount(
  discounts: ApartmentDiscount[],
  itemsCount: number,
  total: number,
): ApartmentDiscount | null {
  const eligible = discounts.filter((d) => itemsCount >= d.min_items && total >= d.min_amount);
  if (eligible.length === 0) return null;
  return eligible.reduce((max, d) => (d.percent > max.percent ? d : max));
}

export function trackApartmentEvent(eventType: "view" | "start" | "submit" | "category_pick", data: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  (supabase as any).from("apartment_events").insert({ event_type: eventType, data }).then(() => {}, () => {});
}
