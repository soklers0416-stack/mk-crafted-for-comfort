import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { FormConfig, FormField, FormFieldType } from "@/lib/forms";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/forms")({
  component: AdminForms,
});

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Текст" },
  { value: "tel", label: "Телефон" },
  { value: "email", label: "Email" },
  { value: "textarea", label: "Комментарий" },
  { value: "select", label: "Список" },
  { value: "file", label: "Загрузка файла" },
  { value: "photo", label: "Загрузка фотографии" },
];

function AdminForms() {
  const qc = useQueryClient();
  const { data: configs = [] } = useQuery({
    queryKey: ["form-configs-all"],
    queryFn: async (): Promise<FormConfig[]> => {
      const { data, error } = await (supabase as any).from("form_configs").select("*").order("key");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [activeKey, setActiveKey] = useState<string | null>(null);
  useEffect(() => {
    if (!activeKey && configs.length) setActiveKey(configs[0].key);
  }, [activeKey, configs]);

  const active = configs.find((c) => c.key === activeKey);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Формы заявок</h1>
      <p className="mt-1 text-sm text-muted-foreground">Настройте тексты и поля каждой формы — без изменения кода.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr]">
        <aside className="space-y-1">
          {configs.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveKey(c.key)}
              className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
                c.key === activeKey ? "bg-primary text-primary-foreground" : "hover:bg-surface-muted"
              }`}
            >
              <div className="font-medium">{c.title || c.key}</div>
              <div className={`text-xs ${c.key === activeKey ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{c.key}</div>
            </button>
          ))}
        </aside>

        {active && <FormEditor key={active.key} config={active} onSaved={() => qc.invalidateQueries({ queryKey: ["form-configs-all"] })} />}
      </div>
    </div>
  );
}

function FormEditor({ config, onSaved }: { config: FormConfig; onSaved: () => void }) {
  const [draft, setDraft] = useState<FormConfig>(config);
  useEffect(() => setDraft(config), [config]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("form_configs")
        .update({
          title: draft.title,
          description: draft.description,
          button_text: draft.button_text,
          success_text: draft.success_text,
          fields: draft.fields,
        })
        .eq("key", draft.key);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Сохранено"); onSaved(); },
    onError: (e: any) => toast.error(e.message),
  });

  function updateField(idx: number, patch: Partial<FormField>) {
    setDraft((d) => ({ ...d, fields: d.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)) }));
  }
  function addField() {
    setDraft((d) => ({
      ...d,
      fields: [...d.fields, { name: `field_${d.fields.length + 1}`, label: "Новое поле", type: "text", required: false, order: d.fields.length + 1 }],
    }));
  }
  function removeField(idx: number) {
    setDraft((d) => ({ ...d, fields: d.fields.filter((_, i) => i !== idx) }));
  }
  function move(idx: number, dir: -1 | 1) {
    setDraft((d) => {
      const fields = [...d.fields];
      const j = idx + dir;
      if (j < 0 || j >= fields.length) return d;
      [fields[idx], fields[j]] = [fields[j], fields[idx]];
      return { ...d, fields: fields.map((f, i) => ({ ...f, order: i + 1 })) };
    });
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <L label="Заголовок"><Input value={draft.title} onChange={(v) => setDraft((d) => ({ ...d, title: v }))} /></L>
        <L label="Текст кнопки"><Input value={draft.button_text} onChange={(v) => setDraft((d) => ({ ...d, button_text: v }))} /></L>
      </div>
      <L label="Описание"><Input value={draft.description} onChange={(v) => setDraft((d) => ({ ...d, description: v }))} /></L>
      <L label="Текст после отправки"><Input value={draft.success_text} onChange={(v) => setDraft((d) => ({ ...d, success_text: v }))} /></L>

      <div className="pt-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Поля формы</h3>
          <button onClick={addField} className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Добавить поле
          </button>
        </div>
        <div className="space-y-2">
          {draft.fields.map((f, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-background p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_160px_auto]">
                <input
                  value={f.label}
                  onChange={(e) => updateField(idx, { label: e.target.value })}
                  placeholder="Название (видит клиент)"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={f.name}
                  onChange={(e) => updateField(idx, { name: e.target.value.replace(/[^a-z0-9_-]/gi, "") })}
                  placeholder="Системное имя"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <select
                  value={f.type}
                  onChange={(e) => updateField(idx, { type: e.target.value as FormFieldType })}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(idx, -1)} className="rounded-lg p-1.5 hover:bg-surface-muted"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => move(idx, 1)} className="rounded-lg p-1.5 hover:bg-surface-muted"><ChevronDown className="h-4 w-4" /></button>
                  <button onClick={() => removeField(idx)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <label className="inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={f.required} onChange={(e) => updateField(idx, { required: e.target.checked })} />
                  Обязательное
                </label>
                <input
                  value={f.placeholder ?? ""}
                  onChange={(e) => updateField(idx, { placeholder: e.target.value })}
                  placeholder="Подсказка (необязательно)"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                />
                {f.type === "select" && (
                  <input
                    value={(f.options ?? []).join(", ")}
                    onChange={(e) => updateField(idx, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    placeholder="Варианты через запятую"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-3">
        <button
          onClick={() => save.mutate()} disabled={save.isPending}
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {save.isPending ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
    />
  );
}
