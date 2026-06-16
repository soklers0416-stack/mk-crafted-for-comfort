// Универсальные типы и словари для форм/заявок.

export type FormFieldType = "text" | "tel" | "email" | "select" | "textarea" | "file" | "photo";

export type FormField = {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // для select
  order: number;
};

export type FormConfig = {
  key: string;
  title: string;
  description: string;
  button_text: string;
  success_text: string;
  fields: FormField[];
  updated_at: string;
};

export type ApplicationStatus = "new" | "in_progress" | "contacted" | "done" | "declined";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  contacted: "Связались",
  done: "Завершено",
  declined: "Отказ",
};

export const STATUS_OPTIONS: ApplicationStatus[] = ["new", "in_progress", "contacted", "done", "declined"];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  contacted: "bg-purple-100 text-purple-700",
  done: "bg-emerald-100 text-emerald-700",
  declined: "bg-gray-200 text-gray-600",
};

// Тип формы -> русское название
export const FORM_TYPE_LABELS: Record<string, string> = {
  callback: "Обратный звонок",
  consult: "Консультация",
  "custom-size": "Другой размер",
  "fabric-samples": "Примеры в ткани",
  "fabric-examples": "Примеры в ткани",
  visualization: "Визуализация",
  partner: "Стать партнёром",
  cart: "Заказ из корзины",
  contact: "Обратный звонок",
  question: "Я просто спросить",
  color: "Другие цвета и ткани",
  delivery: "Рассчитать доставку",
  installment: "Рассрочка",
  apartment: "МК Подбор",
};

// `source` в БД может содержать суффикс ":<id>" (например "delivery:abc-uuid").
// Для отображения типа отрезаем суффикс.
export function baseFormKey(key: string): string {
  return (key || "").split(":")[0];
}

export function formTypeLabel(key: string): string {
  const base = baseFormKey(key);
  return FORM_TYPE_LABELS[base] ?? base;
}

// Русские названия для известных полей в data jsonb
export const FIELD_LABELS: Record<string, string> = {
  name: "Имя",
  phone: "Телефон",
  email: "Email",
  company: "Компания",
  website: "Сайт",
  category: "Категория",
  comment: "Комментарий",
  question: "Вопрос",
  size: "Размер",
  color: "Цвет",
  city: "Город доставки",
  term: "Срок рассрочки (мес.)",
  product: "Товар",
  product_id: "ID товара",
  product_name: "Товар",
  product_category: "Категория товара",
  product_price: "Цена",
  product_size: "Размер",
  product_fabric: "Ткань",
  product_mechanism: "Механизм",
  product_filling: "Наполнение",
  fabric: "Ткань",
  mechanism: "Механизм",
  filling: "Наполнение",
  items: "Состав заказа",
  total: "Итого",
  subtotal: "Сумма без скидки",
  discount_percent: "Скидка, %",
  discount_amount: "Сумма скидки",
  savings: "Экономия",
  photo: "Фотография",
  file: "Файл",
  button: "Кнопка",
  section: "Раздел сайта",
  page_url: "Страница",
};

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

// Поля, которые отдельно показываются как «шапка» заявки и не дублируются в общем списке.
export const META_FIELDS = ["name", "phone", "email", "button", "section", "page_url"] as const;

export const PRODUCT_FIELDS = [
  "product_name",
  "product_category",
  "product_price",
  "product_size",
  "product_fabric",
  "product_mechanism",
  "product_filling",
  "product_id",
] as const;
