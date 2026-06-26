import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizePhotoUrl } from "@/lib/photoUrls";

const sb = supabase as any;

export type BannerSettings = {
  text_align?: "left" | "center" | "right";
  overlay?: number; // 0..1 — затемнение для читаемости текста
  bg_color?: string; // CSS color/gradient если нет картинки
  button_enabled?: boolean;
};

export type BannerRow = {
  id: string;
  page_key: string;
  system_ref: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  is_visible: boolean;
  settings: BannerSettings;
};

export type BannerDefaults = {
  eyebrow?: string;
  title: string;
  body?: string;
  button_text?: string;
  button_link?: string;
  button_enabled?: boolean;
  text_align?: "left" | "center" | "right";
  bg_color?: string; // дефолтный фон когда без картинки
};

export type BannerPlacement = {
  id: string; // "page:ref"
  page_key: string;
  ref: string;
  page_label: string;
  placement_label: string;
  defaults: BannerDefaults;
};

/** Реестр всех баннеров сайта. Чтобы добавить новый баннер — добавьте запись сюда и используйте <SiteBanner id="..." /> на странице. */
export const BANNER_REGISTRY: BannerPlacement[] = [
  {
    id: "about:hero",
    page_key: "about",
    ref: "hero",
    page_label: "О компании",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "О компании",
      title: "Создаём мебель, в которой хочется жить",
      body: "Собственное производство в Краснодаре с 2014 года.",
      button_text: "Каталог",
      button_link: "/catalog",
      button_enabled: true,
      text_align: "left",
    },
  },
  {
    id: "apartment:hero",
    page_key: "apartment",
    ref: "hero",
    page_label: "Квартира под ключ",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Сервис",
      title: "Квартира под ключ",
      body: "Подберём мебель под ваш бюджет и интерьер.",
      button_text: "Рассчитать",
      button_link: "/apartment",
      button_enabled: true,
      text_align: "left",
    },
  },
  {
    id: "fabrics:hero",
    page_key: "fabrics",
    ref: "hero",
    page_label: "Ткани",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Каталог",
      title: "Ткани и материалы",
      body: "Большой выбор обивочных тканей собственного склада.",
      text_align: "left",
    },
  },
  {
    id: "partners:hero",
    page_key: "partners",
    ref: "hero",
    page_label: "Партнёрам",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Партнёрам",
      title: "Создаём красивые интерьеры вместе",
      body: "Программа для дизайнеров и студий.",
      button_text: "Стать партнёром",
      button_link: "/partners",
      button_enabled: true,
      text_align: "left",
    },
  },
  {
    id: "catalog:hero",
    page_key: "catalog",
    ref: "hero",
    page_label: "Каталог",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Каталог",
      title: "Вся мебель",
      body: "Стильная мебель собственного производства.",
      text_align: "left",
    },
  },
  {
    id: "promotions:hero",
    page_key: "promotions",
    ref: "hero",
    page_label: "Акции",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Акции",
      title: "Действующие акции",
      body: "Специальные цены и ограниченные предложения от производства.",
      text_align: "left",
    },
  },
  {
    id: "delivery:hero",
    page_key: "delivery",
    ref: "hero",
    page_label: "Доставка",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Сервис",
      title: "Доставка и оплата",
      body: "Привезём, занесём и соберём. Удобная оплата и рассрочка.",
      text_align: "left",
    },
  },
  {
    id: "contacts:hero",
    page_key: "contacts",
    ref: "hero",
    page_label: "Контакты",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Контакты",
      title: "Свяжитесь с нами",
      body: "Шоурум в Краснодаре, ул. Уссурийская, 17.",
      text_align: "left",
    },
  },
  {
    id: "reviews:hero",
    page_key: "reviews",
    ref: "hero",
    page_label: "Отзывы",
    placement_label: "Верхний баннер",
    defaults: {
      eyebrow: "Отзывы",
      title: "Нам доверяют сотни клиентов",
      body: "Реальные отзывы покупателей МК Мебель.",
      text_align: "left",
    },
  },
];

export const siteBannersQuery = queryOptions({
  queryKey: ["site_banners"],
  queryFn: async (): Promise<BannerRow[]> => {
    const { data, error } = await sb
      .from("page_blocks")
      .select("id,page_key,system_ref,title,subtitle,body,image_url,button_text,button_link,is_visible,settings")
      .eq("kind", "hero-banner");
    if (error) throw error;
    return ((data ?? []) as any[]).map((r) => ({
      ...r,
      image_url: normalizePhotoUrl(r.image_url),
      settings: (r.settings ?? {}) as BannerSettings,
    }));
  },
});

/** Подобрать строку из БД для placement-а. Учитываем legacy: старые записи могут иметь system_ref=null. */
export function findBannerRow(rows: BannerRow[], p: BannerPlacement): BannerRow | undefined {
  return (
    rows.find((r) => r.page_key === p.page_key && r.system_ref === p.ref) ||
    rows.find((r) => r.page_key === p.page_key && (r.system_ref === null || r.system_ref === "")) // legacy
  );
}
