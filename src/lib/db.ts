// Типы данных для каталога. Соответствуют структуре таблиц в Lovable Cloud.

export type Category = {
  id: string;
  slug: string;
  title: string;
  image_url: string | null;
  sort_order: number;
};

export type SizeRow = { size: string; sleeping: string; box: string; price: string };
export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  category_slug: string;
  title: string;
  description: string;
  price: number;
  price_from: boolean;
  photo1: string | null;
  photo2: string | null;
  photo3: string | null;
  photo4: string | null;
  photo5: string | null;
  photo6: string | null;
  sleeping_place: string | null;
  mechanism: string | null;
  filling: string | null;
  has_box: boolean | null;
  availability: "в наличии" | "под заказ" | null;
  production_time: string | null;
  sizes: SizeRow[];
  specs: Spec[];
  sale_enabled: boolean;
  sale_label: string | null;
  sale_old_price: number | null;
  sale_new_price: number | null;
  sale_text: string | null;
  is_bestseller: boolean;
  sort_order: number;
};

export type Review = {
  id: string;
  name: string;
  source: string;
  rating: number;
  text: string;
  sort_order: number;
};

export type RequestRow = {
  id: string;
  source: string;
  title: string;
  data: Record<string, string>;
  status: string;
  created_at: string;
};

export type FabricCategory = {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
};

export type FabricCharacteristics = {
  for_children?: boolean;
  for_pets?: boolean;
  easy_care?: string; // например "высокая"
  durability?: string; // например "30 000 циклов"
  features?: string; // свободное описание
};

export type Fabric = {
  id: string;
  code: string;
  title: string;
  category_slug: string;
  description: string;
  characteristics: FabricCharacteristics;
  recommendations: string;
  surcharge: number;
  sample_photo: string | null;
  furniture_photos: string[];
  sort_order: number;
};

export type ProductFabric = { product_id: string; fabric_id: string };

export type AboutContent = { key: string; value: Record<string, any> };
export type AboutAdvantage = { id: string; icon: string; title: string; description: string; sort_order: number };
export type AboutStat = { id: string; label: string; value: string; sort_order: number };
export type AboutStep = { id: string; title: string; description: string; sort_order: number };
export type CustomerPhoto = { id: string; photo: string; city: string; model: string; comment: string; sort_order: number };
export type GalleryItem = { id: string; photo: string; category: string; caption: string; sort_order: number };
export type Faq = { id: string; question: string; answer: string; sort_order: number };

export function getGallery(p: Product): string[] {
  return [p.photo1, p.photo2, p.photo3, p.photo4, p.photo5, p.photo6].filter(
    (x): x is string => Boolean(x),
  );
}

export function formatPriceRub(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}
