import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Публичный серверный клиент с publishable/anon ключом — НЕ требует
// SUPABASE_SERVICE_ROLE_KEY. Используется для приёма заявок из всех форм
// (insert в public.requests разрешён политикой RLS для роли anon).
function createPublicServerClient() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    (import.meta as any).env?.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env: SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY (or VITE_* equivalents)",
    );
  }
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// Карта типов заявок в человеческие названия (зеркалит FORM_TYPE_LABELS на клиенте).
const TYPE_LABELS: Record<string, string> = {
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

function baseType(formKey: string): string {
  return (formKey || "").split(":")[0];
}

function typeLabel(formKey: string): string {
  const b = baseType(formKey);
  return TYPE_LABELS[b] ?? b;
}

// Известные поля, которые выносим в отдельные колонки.
// Все остальные ключи `data` склеиваем в колонку `extra`.
const KNOWN_FIELDS = new Set([
  "name", "phone", "email", "comment", "question",
  "button", "section", "page_url",
  "product_name", "product_category", "product_price",
  "product_size", "product_fabric", "product_mechanism", "product_filling", "product_id",
  "size", "fabric", "mechanism", "filling", "color", "city", "term",
  "items", "total", "subtotal", "discount_percent", "discount_amount", "savings",
]);

// Готовит плоский объект с фиксированными колонками для Google Таблицы.
function flattenForSheets(row: {
  id?: string;
  created_at?: string;
  form_key: string;
  title?: string;
  data: Record<string, any>;
  status?: string;
}) {
  const d = row.data || {};
  const extras = Object.entries(d)
    .filter(([k, v]) => !KNOWN_FIELDS.has(k) && v != null && v !== "")
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" | ");

  // Характеристики товара одной строкой — удобно для одной колонки.
  const charParts: string[] = [];
  if (d.product_size) charParts.push(`Размер: ${d.product_size}`);
  if (d.size) charParts.push(`Размер: ${d.size}`);
  if (d.product_fabric) charParts.push(`Ткань: ${d.product_fabric}`);
  if (d.product_mechanism) charParts.push(`Механизм: ${d.product_mechanism}`);
  if (d.product_filling) charParts.push(`Наполнение: ${d.product_filling}`);
  if (d.color) charParts.push(`Цвет: ${d.color}`);

  return {
    id: row.id ?? "",
    created_at: row.created_at ?? new Date().toISOString(),
    type: baseType(row.form_key),
    type_label: typeLabel(row.form_key),
    title: row.title || typeLabel(row.form_key),
    button: d.button ?? "",
    section: d.section ?? "",
    page_url: d.page_url ?? "",
    name: d.name ?? "",
    phone: d.phone ?? "",
    email: d.email ?? "",
    comment: d.comment ?? d.question ?? "",
    product_name: d.product_name ?? "",
    product_category: d.product_category ?? "",
    product_price: d.product_price ?? "",
    product_characteristics: charParts.join("; "),
    items: d.items ?? "",
    total: d.total ?? "",
    extra: extras,
    status: row.status ?? "new",
  };
}

// Публичная отправка заявки.
// Сначала сохраняем в БД (даже если Apps Script недоступен), затем пытаемся отправить в Google Таблицу.
export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((input: { formKey: string; title: string; data: Record<string, unknown> }) => {
    if (!input || typeof input.formKey !== "string" || !input.formKey) {
      throw new Error("formKey обязателен");
    }
    if (typeof input.data !== "object" || input.data === null) {
      throw new Error("Некорректные данные формы");
    }
    return {
      formKey: input.formKey.slice(0, 80),
      title: (input.title || "").slice(0, 200),
      data: input.data,
    };
  })
  .handler(async ({ data }) => {
    const supabasePublic = createPublicServerClient();

    // 1) Сохраняем заявку (RLS: insert разрешён роли anon)
    const { data: inserted, error } = await (supabasePublic as any)
      .from("requests")
      .insert({ source: data.formKey, title: data.title || data.formKey, data: data.data, status: "new" })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    // 2) Получаем настройки интеграции (best-effort; если RLS не пускает — пропускаем webhook)
    const { data: integ } = await (supabasePublic as any)
      .from("integrations")
      .select("apps_script_url, webhook_url, enabled")
      .eq("id", 1)
      .maybeSingle();

    const flat = flattenForSheets({
      id: inserted?.id,
      created_at: inserted?.created_at,
      form_key: data.formKey,
      title: data.title || data.formKey,
      data: data.data as Record<string, any>,
    });

    // Совместимость: оставляем «сырые» поля рядом с плоскими колонками,
    // чтобы старые Apps Script продолжали работать.
    const payload = {
      ...flat,
      form_key: data.formKey,
      data: data.data,
    };

    // 3) Отправляем в Apps Script / webhook (best-effort, не блокируем ответ при ошибке)
    if (integ?.enabled) {
      const urls = [integ.apps_script_url, integ.webhook_url].filter(Boolean) as string[];
      await Promise.allSettled(
        urls.map((url) =>
          fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          }).catch(() => null),
        ),
      );
    }

    return { ok: true, id: inserted?.id };
  });

// Проверка подключения (только админ).
export const testIntegration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Нет доступа");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: integ } = await supabaseAdmin
      .from("integrations")
      .select("apps_script_url, webhook_url, enabled")
      .eq("id", 1)
      .maybeSingle();

    const url = integ?.apps_script_url || integ?.webhook_url;
    if (!url) {
      await supabaseAdmin
        .from("integrations")
        .update({
          last_test_at: new Date().toISOString(),
          last_test_status: "error",
          last_test_message: "Не указан URL Apps Script или webhook",
        })
        .eq("id", 1);
      return { ok: false, message: "Не указан URL Apps Script или webhook" };
    }

    const testData = {
      name: "Тест",
      phone: "+7 000 000-00-00",
      comment: "Проверка подключения",
      button: "Связаться",
      section: "Тест из админки",
      page_url: "https://example.com/test",
    };
    const payload = {
      ...flattenForSheets({
        id: "test",
        created_at: new Date().toISOString(),
        form_key: "callback",
        title: "Тестовая запись из админки",
        data: testData,
      }),
      test: true,
      form_key: "callback",
      data: testData,
    };

    let ok = false;
    let message = "";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
      message = ok
        ? `Подключение успешно (HTTP ${res.status})`
        : `Ошибка ${res.status}: ${(await res.text()).slice(0, 200)}`;
    } catch (e: any) {
      ok = false;
      message = e?.message ?? "Сетевая ошибка";
    }

    await supabaseAdmin
      .from("integrations")
      .update({
        last_test_at: new Date().toISOString(),
        last_test_status: ok ? "ok" : "error",
        last_test_message: message,
      })
      .eq("id", 1);

    return { ok, message };
  });

// Экспорт всех заявок в Google Таблицу (одной пачкой).
export const exportToSheets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Нет доступа");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: integ } = await supabaseAdmin
      .from("integrations")
      .select("apps_script_url, webhook_url, enabled")
      .eq("id", 1)
      .maybeSingle();

    const url = integ?.apps_script_url || integ?.webhook_url;
    if (!url) throw new Error("Не указан URL Apps Script");

    const { data: apps } = await supabaseAdmin
      .from("all_applications" as any)
      .select("*")
      .order("created_at", { ascending: false });

    const items = (apps ?? []).map((a: any) =>
      flattenForSheets({
        id: a.id,
        created_at: a.created_at,
        form_key: a.form_key,
        title: a.title,
        data: a.data || {},
        status: a.status,
      }),
    );

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bulk: true, items }),
    });
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);
    return { ok: true, count: items.length };
  });
