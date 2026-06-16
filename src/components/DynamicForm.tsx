import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { submitApplication } from "@/lib/applications.functions";
import type { FormConfig, FormField } from "@/lib/forms";

async function uploadFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `applications/${crypto.randomUUID()}.${ext}`;
  const { error } = await (supabase.storage.from("product-photos") as any).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = (supabase.storage.from("product-photos") as any).getPublicUrl(path);
  return data.publicUrl as string;
}

export function useFormConfig(key: string) {
  return useQuery({
    queryKey: ["form-config", key],
    queryFn: async (): Promise<FormConfig | null> => {
      const { data, error } = await (supabase as any)
        .from("form_configs").select("*").eq("key", key).maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
}

const DEFAULT_CONFIG: Omit<FormConfig, "key" | "updated_at"> = {
  title: "Заявка",
  description: "",
  button_text: "Отправить",
  success_text: "Спасибо! Менеджер свяжется в ближайшее время.",
  fields: [
    { name: "name", label: "Имя", type: "text", required: true, order: 1 },
    { name: "phone", label: "Телефон", type: "tel", required: true, order: 2 },
    { name: "comment", label: "Комментарий", type: "textarea", required: false, order: 3 },
  ],
};

export function DynamicForm({
  formKey,
  extraData,
  onSent,
  className,
}: {
  formKey: string;
  extraData?: Record<string, unknown>;
  onSent?: () => void;
  className?: string;
}) {
  const { data: configData, isLoading } = useFormConfig(formKey);
  const config: FormConfig =
    configData ?? { key: formKey, updated_at: "", ...DEFAULT_CONFIG };
  const [values, setValues] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = useServerFn(submitApplication);

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Загрузка…</div>;
  }

  const fields = [...(config.fields ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (sent) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary text-2xl">✓</div>
        <h3 className="font-display text-xl font-semibold">Готово</h3>
        <p className="mt-2 text-sm text-muted-foreground">{config.success_text}</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && !values[f.name]) {
        toast.error(`Заполните: ${f.label}`);
        return;
      }
    }
    setBusy(true);
    try {
      // Если есть File — загружаем
      const data: Record<string, unknown> = { ...values };
      for (const f of fields) {
        const v = values[f.name];
        if (v instanceof File) {
          data[f.name] = await uploadFile(v);
        }
      }
      const page_url = typeof window !== "undefined" ? window.location.href : "";
      const payload = { ...data, ...(extraData ?? {}), page_url };
      await submit({ data: { formKey, title: config.title, data: payload } });
      setSent(true);
      onSent?.();
    } catch (err: any) {
      toast.error(err?.message ?? "Не удалось отправить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className ?? "space-y-3"}>
      {fields.map((f: FormField) => {
        const common = {
          key: f.name,
          required: f.required,
          placeholder: f.placeholder || f.label,
          className: "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary",
        };
        if (f.type === "textarea") {
          return (
            <textarea
              {...common} rows={3}
              value={values[f.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            />
          );
        }
        if (f.type === "select") {
          return (
            <select {...common}
              value={values[f.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            >
              <option value="">{f.placeholder || f.label}</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          );
        }
        if (f.type === "file" || f.type === "photo") {
          return (
            <label key={f.name} className="block">
              <span className="mb-1 block text-xs text-muted-foreground">{f.label}{f.required ? " *" : ""}</span>
              <input
                type="file"
                accept={f.type === "photo" ? "image/*" : undefined}
                required={f.required}
                onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.files?.[0] ?? null }))}
                className="w-full text-sm"
              />
            </label>
          );
        }
        return (
          <input
            {...common}
            type={f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
            value={values[f.name] ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
          />
        );
      })}
      <button
        type="submit" disabled={busy}
        className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? "Отправляем…" : config.button_text}
      </button>
    </form>
  );
}
