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
  visualization: "Визуализация",
  partner: "Стать партнёром",
  cart: "Заказ из корзины",
  contact: "Обратный звонок",
};

export function formTypeLabel(key: string): string {
  return FORM_TYPE_LABELS[key] ?? key;
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
  size: "Размер",
  product: "Товар",
  fabric: "Ткань",
  items: "Состав заказа",
  total: "Итого",
  photo: "Фотография",
  file: "Файл",
};

export function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}
