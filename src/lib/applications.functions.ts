import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Сохраняем заявку
    const { data: inserted, error } = await (supabaseAdmin as any)
      .from("requests")
      .insert({ source: data.formKey, title: data.title || data.formKey, data: data.data, status: "new" })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    // 2) Получаем настройки интеграции
    const { data: integ } = await supabaseAdmin
      .from("integrations")
      .select("apps_script_url, webhook_url, enabled")
      .eq("id", 1)
      .maybeSingle();

    const payload = {
      id: inserted?.id,
      created_at: inserted?.created_at,
      form_key: data.formKey,
      title: data.title || data.formKey,
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

    const payload = {
      test: true,
      created_at: new Date().toISOString(),
      form_key: "test",
      title: "Тестовая запись из админки",
      data: { name: "Тест", phone: "+7 000 000-00-00", comment: "Проверка подключения" },
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

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bulk: true, items: apps ?? [] }),
    });
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);
    return { ok: true, count: apps?.length ?? 0 };
  });
