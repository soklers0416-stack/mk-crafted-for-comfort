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
  mechanism_id: string | null;
  filling_id: string | null;
  sofa_type: string | null;
  custom_size_enabled: boolean;
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

export type SpecItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  photo: string | null;
  recommendations: string;
  sort_order: number;
};

export type SizePriceTemplate = {
  id: string;
  category_slug: string;
  title: string;
  rows: SizeRow[];
  sort_order: number;
};


export const SOFA_TYPES: { slug: string; title: string }[] = [
  { slug: "straight", title: "Прямые" },
  { slug: "corner", title: "Угловые" },
  { slug: "modular", title: "Модульные" },
  { slug: "mini", title: "Мини-диваны" },
];


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

// Dynamic characteristic name list (admin-managed). Each key = label.
export type FabricCharacteristicDef = {
  id: string;
  label: string;
  sort_order: number;
};

// Characteristic values on a collection are stored as { [label]: string }
export type FabricCharacteristics = Record<string, string>;

export type FabricColor = {
  id: string;
  fabric_id: string;
  name: string;
  code: string;
  photo: string | null;
  sort_order: number;
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
  allow_pets: boolean;
  washable: boolean;
  pros: string;
  cons: string;
};


export type ProductFabric = { product_id: string; fabric_id: string };

export type AboutContent = { key: string; value: Record<string, any> };
export type AboutAdvantage = { id: string; icon: string; title: string; description: string; sort_order: number };
export type AboutStat = { id: string; label: string; value: string; sort_order: number };
export type AboutStep = { id: string; title: string; description: string; sort_order: number };
export type CustomerPhoto = { id: string; photo: string; city: string; model: string; comment: string; sort_order: number };
export type GalleryItem = { id: string; photo: string; category: string; caption: string; sort_order: number };
export type Faq = { id: string; question: string; answer: string; sort_order: number };

export type PartnerCategory = { id: string; slug: string; title: string; sort_order: number };
export type PartnerSocial = { type: string; url: string };
export type Partner = {
  id: string;
  title: string;
  category_slug: string;
  description: string;
  advantages: string[];
  phone: string;
  email: string;
  website: string;
  socials: PartnerSocial[];
  logo: string | null;
  main_photo: string | null;
  gallery: string[];
  recommended_for: string[];
  is_active: boolean;
  sort_order: number;
};
export type PartnerApplication = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  category_slug: string;
  comment: string;
  status: string;
  created_at: string;
};

export function getGallery(p: Product): string[] {
  return [p.photo1, p.photo2, p.photo3, p.photo4, p.photo5, p.photo6].filter(
    (x): x is string => Boolean(x),
  );
}

export function formatPriceRub(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}
