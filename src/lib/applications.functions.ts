import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Публичный доступ к REST API backend без @supabase/supabase-js.
// Важно: на сервере supabase-js поднимает RealtimeClient, из-за чего на Node 20
// появляется ошибка про WebSocket после успешной отправки заявки. Для форм
// Realtime не нужен, поэтому используем обычный fetch.
function cleanEnvValue(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

function getPublicBackendEnv() {
  const url = cleanEnvValue(
    process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      (import.meta as any).env?.VITE_SUPABASE_URL,
  );
  const keys = Array.from(
    new Set(
      [
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        process.env.VITE_SUPABASE_ANON_KEY,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        process.env.SUPABASE_ANON_KEY,
        (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY,
        (import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
      ]
        .map(cleanEnvValue)
        .filter(Boolean),
    ),
  );
  if (!url || keys.length === 0) {
    throw new Error(
      "Missing Supabase env: SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY (or VITE_* equivalents)",
    );
  }
  return { url: url.replace(/\/$/, ""), keys };
}

async function backendRest<T = any>({
  path,
  method = "GET",
  body,
  query,
}: {
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  query?: string;
}): Promise<{ data: T | null; error: any; status: number; statusText: string }> {
  const { url, keys } = getPublicBackendEnv();
  const target = `${url}/rest/v1/${path}${query ? `?${query}` : ""}`;

  let lastResult: { data: T | null; error: any; status: number; statusText: string } | null = null;
  for (const key of keys) {
    const response = await fetch(target, {
      method,
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        ...(method === "POST" ? { prefer: "return=minimal" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text().catch(() => "");
    let parsed: any = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    lastResult = {
      data: response.ok ? parsed : null,
      error: response.ok ? null : parsed || { message: response.statusText },
      status: response.status,
      statusText: response.statusText,
    };

    if (response.ok || !/invalid api key/i.test(String(lastResult.error?.message ?? lastResult.error ?? ""))) {
      return lastResult;
    }
  }

  return lastResult ?? { data: null, error: { message: "Invalid API key" }, status: 401, statusText: "Unauthorized" };
}

function createTraceId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `trace-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function safeUrlLabel(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return "invalid-url";
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postToIntegrationUrl({
  url,
  payload,
  traceId,
}: {
  url: string;
  payload: Record<string, unknown>;
  traceId: string;
}) {
  const target = safeUrlLabel(url);
  let lastStatus = 0;
  let lastBody = "";
  let lastError = "";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      console.log("[MK_REQUEST][server][submitApplication][external_fetch_start]", {
        traceId,
        target,
        attempt,
      });
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseText = await response.clone().text().catch(() => "");
      lastStatus = response.status;
      lastBody = responseText;
      console.log("[MK_REQUEST][server][submitApplication][external_fetch_response]", {
        traceId,
        target,
        attempt,
        status: response.status,
        ok: response.ok,
        body: responseText.slice(0, 2000),
      });
      if (response.ok) {
        return { ok: true, status: response.status, body: responseText, target, attempt };
      }
    } catch (error: any) {
      lastError = error?.message ?? String(error);
      console.error("[MK_REQUEST][server][submitApplication][external_fetch_catch]", {
        traceId,
        target,
        attempt,
        message: error?.message,
        name: error?.name,
      });
    }

    if (attempt < 3) {
      console.log("[MK_REQUEST][server][submitApplication][external_fetch_retry_wait]", {
        traceId,
        target,
        nextAttempt: attempt + 1,
      });
      await wait(700 * attempt);
    }
  }

  return {
    ok: false,
    status: lastStatus,
    body: lastBody,
    error: lastError,
    target,
    attempt: 3,
  };
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
    const traceId = createTraceId();
    const t0 = Date.now();
    console.log("[MK_REQUEST][server][submitApplication][STEP_1_start]", {
      traceId,
      formKey: data.formKey,
      title: data.title,
      dataKeys: Object.keys(data.data ?? {}),
      hasSupabaseUrl: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      hasPublicKey: !!(
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY
      ),
    });

    try {
      getPublicBackendEnv();
      console.log("[MK_REQUEST][server][submitApplication][STEP_2_rest_ready]", { traceId });
    } catch (err: any) {
      console.error("[MK_REQUEST][server][submitApplication][STEP_2_rest_error]", {
        traceId, message: err?.message, name: err?.name, stack: err?.stack,
      });
      throw err;
    }

    // 1) Сохраняем заявку (RLS: insert разрешён роли anon)
    console.log("[MK_REQUEST][server][submitApplication][STEP_3_before_db_insert]", { traceId });
    try {
      const insertRes = await backendRest({
        path: "requests",
        method: "POST",
        body: { source: data.formKey, title: data.title || data.formKey, data: data.data, status: "new" },
      });
      console.log("[MK_REQUEST][server][submitApplication][STEP_4_db_insert_result]", {
        traceId,
        status: insertRes?.status,
        statusText: insertRes?.statusText,
        hasError: !!insertRes?.error,
        errorMessage: insertRes?.error?.message,
        errorCode: insertRes?.error?.code,
        errorDetails: insertRes?.error?.details,
        errorHint: insertRes?.error?.hint,
      });
      if (insertRes?.error) {
        throw new Error(insertRes.error.message || "DB insert failed");
      }
    } catch (err: any) {
      console.error("[MK_REQUEST][server][submitApplication][STEP_4_db_insert_catch]", {
        traceId, message: err?.message, name: err?.name, stack: err?.stack,
      });
      throw err;
    }

    // 2) Получаем настройки интеграции
    console.log("[MK_REQUEST][server][submitApplication][STEP_5_before_integration_read]", { traceId });
    let integ: any = null;
    try {
      const integRes = await backendRest<any[]>({
        path: "integrations",
        query: "select=apps_script_url,webhook_url,enabled&id=eq.1&limit=1",
      });
      const integError = integRes.error;
      integ = Array.isArray(integRes.data) ? integRes.data[0] ?? null : integRes.data;
      console.log("[MK_REQUEST][server][submitApplication][STEP_6_integration_result]", {
        traceId,
        enabled: !!integ?.enabled,
        hasAppsScriptUrl: !!integ?.apps_script_url,
        hasWebhookUrl: !!integ?.webhook_url,
        errorMessage: integError?.message,
        errorCode: integError?.code,
      });
    } catch (err: any) {
      console.error("[MK_REQUEST][server][submitApplication][STEP_6_integration_catch]", {
        traceId, message: err?.message, name: err?.name, stack: err?.stack,
      });
    }

    const flat = flattenForSheets({
      id: traceId,
      created_at: new Date().toISOString(),
      form_key: data.formKey,
      title: data.title || data.formKey,
      data: data.data as Record<string, any>,
    });

    const payload = { ...flat, form_key: data.formKey, data: data.data };

    // 3) Отправляем в Apps Script / webhook
    let sheetsOk = true;
    if (integ?.enabled) {
      const urls = [integ.apps_script_url, integ.webhook_url].filter(Boolean) as string[];
      console.log("[MK_REQUEST][server][submitApplication][STEP_7_before_external]", {
        traceId, targets: urls.map(safeUrlLabel),
      });
      try {
        const externalResults = await Promise.all(urls.map((url) => postToIntegrationUrl({ url, payload, traceId })));
        console.log("[MK_REQUEST][server][submitApplication][STEP_8_external_results]", {
          traceId,
          results: externalResults.map((r) => ({ target: r.target, ok: r.ok, status: r.status, attempt: r.attempt })),
        });
        if (urls.length > 0 && !externalResults.some((r) => r.ok)) {
          sheetsOk = false;
          const first = externalResults[0];
          console.error("[MK_REQUEST][server][submitApplication][STEP_8_external_failed_all]", {
            traceId, status: first?.status, error: first?.error, body: first?.body?.slice(0, 2000),
          });
        }
      } catch (err: any) {
        sheetsOk = false;
        console.error("[MK_REQUEST][server][submitApplication][STEP_8_external_catch]", {
          traceId, message: err?.message, name: err?.name, stack: err?.stack,
        });
      }
    } else {
      console.log("[MK_REQUEST][server][submitApplication][STEP_7_external_skipped]", {
        traceId, reason: integ?.enabled ? "no_urls" : "integration_disabled_or_missing",
      });
    }

    // 4) Дублируем заявку на почту через Resend
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const to = "mkmebel.krasnodar@mail.ru";
        const rowsHtml = Object.entries(data.data as Record<string, any>)
          .filter(([, v]) => v != null && v !== "")
          .map(([k, v]) => {
            const val = typeof v === "object" ? JSON.stringify(v) : String(v);
            const safe = val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
            return `<tr><td style="padding:6px 10px;border:1px solid #eee;vertical-align:top;color:#666;font-size:13px"><b>${k}</b></td><td style="padding:6px 10px;border:1px solid #eee;font-size:13px">${safe}</td></tr>`;
          })
          .join("");
        const subject = `Новая заявка с сайта: ${data.title || typeLabel(data.formKey)}`;
        const html = `
          <div style="font-family:Arial,sans-serif;color:#111">
            <h2 style="margin:0 0 12px">${subject}</h2>
            <p style="color:#666;margin:0 0 12px">Тип: ${typeLabel(data.formKey)}</p>
            <table style="border-collapse:collapse;border:1px solid #eee;min-width:400px">${rowsHtml}</table>
            <p style="color:#999;font-size:12px;margin-top:16px">Отправлено автоматически с сайта МК Мебель.</p>
          </div>`;
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "МК Мебель <onboarding@resend.dev>",
            to: [to],
            subject,
            html,
          }),
        });
        const body = await resp.text().catch(() => "");
        console.log("[MK_REQUEST][server][submitApplication][STEP_email_resend]", {
          traceId, status: resp.status, ok: resp.ok, body: body.slice(0, 500),
        });
      } else {
        console.log("[MK_REQUEST][server][submitApplication][STEP_email_skipped]", { traceId, reason: "no_RESEND_API_KEY" });
      }
    } catch (err: any) {
      console.error("[MK_REQUEST][server][submitApplication][STEP_email_catch]", {
        traceId, message: err?.message, name: err?.name,
      });
    }

    const result = { ok: true as const, traceId, sheetsOk };
    console.log("[MK_REQUEST][server][submitApplication][STEP_9_return_response]", {
      traceId, durationMs: Date.now() - t0, result,
    });
    return result;
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
