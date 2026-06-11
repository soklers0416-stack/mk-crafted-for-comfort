import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { testIntegration } from "@/lib/applications.functions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: AdminIntegrations,
});

function AdminIntegrations() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("integrations").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    apps_script_url: "",
    sheets_url: "",
    webhook_url: "",
    enabled: false,
  });

  useEffect(() => {
    if (data) {
      setForm({
        apps_script_url: data.apps_script_url ?? "",
        sheets_url: data.sheets_url ?? "",
        webhook_url: data.webhook_url ?? "",
        enabled: !!data.enabled,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("integrations").update(form).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Сохранено");
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const test = useServerFn(testIntegration);
  const runTest = useMutation({
    mutationFn: () => test(),
    onSuccess: (res: any) => {
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
      qc.invalidateQueries({ queryKey: ["integrations"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold">Интеграции</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Отправка заявок в Google Таблицу через Apps Script. Если таблица временно недоступна — заявка всё равно сохранится в админке.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
        <Field label="Google Apps Script URL" hint="URL веб-приложения (Deployments → Web app)">
          <input
            type="url"
            value={form.apps_script_url}
            onChange={(e) => setForm((f) => ({ ...f, apps_script_url: e.target.value }))}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </Field>

        <Field label="Ссылка на Google Таблицу" hint="Открыть таблицу прямо из админки">
          <div className="flex gap-2">
            <input
              type="url"
              value={form.sheets_url}
              onChange={(e) => setForm((f) => ({ ...f, sheets_url: e.target.value }))}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            {form.sheets_url && (
              <a href={form.sheets_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-surface-muted">
                <ExternalLink className="h-4 w-4" /> Открыть
              </a>
            )}
          </div>
        </Field>

        <Field label="Webhook URL (опционально)" hint="Дополнительный URL для дублирования заявок">
          <input
            type="url"
            value={form.webhook_url}
            onChange={(e) => setForm((f) => ({ ...f, webhook_url: e.target.value }))}
            placeholder="https://..."
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </Field>

        <label className="flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            className="h-5 w-5 rounded border-border"
          />
          <span className="text-sm font-medium">Включить отправку заявок в Google Таблицу</span>
        </label>

        <div className="flex flex-wrap gap-2 pt-3">
          <button
            onClick={() => save.mutate()} disabled={save.isPending}
            className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? "Сохранение…" : "Сохранить"}
          </button>
          <button
            onClick={() => runTest.mutate()} disabled={runTest.isPending}
            className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-medium hover:bg-surface-muted disabled:opacity-50"
          >
            {runTest.isPending ? "Проверка…" : "Проверить подключение"}
          </button>
        </div>

        {data?.last_test_at && (
          <div className={`mt-4 flex items-start gap-2 rounded-xl p-4 text-sm ${data.last_test_status === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
            {data.last_test_status === "ok" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
            <div>
              <div className="font-medium">{data.last_test_status === "ok" ? "Подключение успешно" : "Ошибка подключения"}</div>
              <div className="text-xs opacity-80">{new Date(data.last_test_at).toLocaleString("ru-RU")}</div>
              {data.last_test_message && <div className="mt-1">{data.last_test_message}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-surface-muted/50 p-6 text-sm text-muted-foreground">
        <h3 className="font-display text-base font-semibold text-foreground">Как настроить</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Создайте Google Таблицу и откройте <b>Расширения → Apps Script</b>.</li>
          <li>Вставьте скрипт, который принимает POST с JSON и добавляет строку в таблицу.</li>
          <li>Нажмите <b>Развернуть → Веб-приложение</b>, доступ — «Все», скопируйте URL.</li>
          <li>Вставьте URL в поле «Google Apps Script URL», включите отправку и нажмите «Проверить подключение».</li>
        </ol>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
