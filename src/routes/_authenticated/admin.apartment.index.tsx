import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apartmentContentQuery } from "@/lib/apartment";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";
import { Upload, X, Plus, Trash2 } from "lucide-react";

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

const HOME_FIELDS: { key: string; label: string; multi?: boolean; placeholder?: string }[] = [
  { key: "home_headline", label: "Заголовок", placeholder: "Квартира под ключ" },
  { key: "home_subtext", label: "Подзаголовок", multi: true, placeholder: "Подберите мебель для всей квартиры в одном месте…" },
  { key: "home_cta", label: "Текст кнопки", placeholder: "Начать подбор" },
];

function parseItems(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.filter((x) => typeof x === "string");
  } catch {/* not json — fall back to lines */}
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
}

function ApartmentContent() {
  const qc = useQueryClient();
  const { data: content = {} } = useQuery(apartmentContentQuery);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    setDraft(content);
    setItems(parseItems(content.home_items));
  }, [content]);

  const save = useMutation({
    mutationFn: async () => {
      const allKeys = [
        ...FIELDS.map((f) => f.key),
        ...HOME_FIELDS.map((f) => f.key),
        "home_image",
        "home_items",
      ];
      const rows = allKeys.map((k) => ({
        key: k,
        value: k === "home_items" ? JSON.stringify(items) : (draft[k] ?? ""),
      }));
      const { error } = await (supabase as any).from("apartment_content").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Сохранено"); qc.invalidateQueries({ queryKey: ["apartment_content"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  async function onUpload(file: File) {
    try {
      const url = await uploadPhoto(file);
      setDraft((d) => ({ ...d, home_image: url }));
      toast.success("Фото загружено — не забудьте сохранить");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="max-w-3xl space-y-10">
      <section>
        <h2 className="font-display text-xl font-semibold">Блок «Квартира под ключ» на главной</h2>
        <p className="mt-1 text-xs text-muted-foreground">Этот блок виден всем посетителям главной страницы.</p>

        <div className="mt-5 space-y-4">
          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Фото блока</span>
            <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-muted">
              {draft.home_image ? (
                <>
                  <img src={draft.home_image} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, home_image: "" }))}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Upload className="h-5 w-5" />
                  Загрузить фото
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
                  />
                </label>
              )}
            </div>
          </div>

          {HOME_FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</span>
              {f.multi ? (
                <textarea
                  value={draft[f.key] ?? ""} rows={3} placeholder={f.placeholder}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              ) : (
                <input
                  value={draft[f.key] ?? ""} placeholder={f.placeholder}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              )}
            </label>
          ))}

          <div>
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Список пунктов (что входит в комплект)
            </span>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={it}
                    onChange={(e) => setItems((arr) => arr.map((x, j) => j === i ? e.target.value : x))}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setItems((arr) => [...arr, ""])}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
              >
                <Plus className="h-4 w-4" /> Добавить пункт
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Тексты страницы «Квартира под ключ»</h2>
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
      </section>

      <button onClick={() => save.mutate()} disabled={save.isPending}
        className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {save.isPending ? "Сохранение…" : "Сохранить"}
      </button>
    </div>
  );
}
