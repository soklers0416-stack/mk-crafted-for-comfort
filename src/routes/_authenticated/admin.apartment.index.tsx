import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apartmentContentQuery } from "@/lib/apartment";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/apartment/")({
  component: ApartmentContent,
});

const FIELDS: { key: string; label: string; multi?: boolean }[] = [
  { key: "badge", label: "Плашка (баннер выгоды)" },
  { key: "headline", label: "Заголовок" },
  { key: "price_from", label: "Стартовая цена (например, «от 115 000 ₽»)" },
  { key: "subtext", label: "Подзаголовок", multi: true },
  { key: "cta_main", label: "Текст основной кнопки" },
  { key: "cta_info", label: "Текст кнопки «Подробнее»" },
  { key: "info_title", label: "Заголовок окна условий" },
  { key: "info_text", label: "Текст окна условий", multi: true },
  { key: "form_title", label: "Заголовок формы расчёта" },
  { key: "form_text", label: "Текст под заголовком формы", multi: true },
];

function ApartmentContent() {
  const qc = useQueryClient();
  const { data: content = {} } = useQuery(apartmentContentQuery);
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => setDraft(content), [content]);

  const save = useMutation({
    mutationFn: async () => {
      const rows = FIELDS.map((f) => ({ key: f.key, value: draft[f.key] ?? "" }));
      const { error } = await (supabase as any).from("apartment_content").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Сохранено"); qc.invalidateQueries({ queryKey: ["apartment_content"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl">
      <h2 className="font-display text-xl font-semibold">Тексты раздела</h2>
      <div className="mt-5 space-y-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</span>
            {f.multi ? (
              <textarea
                value={draft[f.key] ?? ""} rows={3}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            ) : (
              <input
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
          </label>
        ))}
      </div>
      <button onClick={() => save.mutate()} disabled={save.isPending}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {save.isPending ? "Сохранение…" : "Сохранить"}
      </button>
    </div>
  );
}
