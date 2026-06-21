import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { specMechanismsQuery, specFillingsQuery, sizePriceTemplatesQuery, categoriesQuery } from "@/lib/queries";
import type { SpecItem, SizeRow, SizePriceTemplate, Category } from "@/lib/db";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/specs")({
  component: AdminSpecs,
});

type Cat = "mechanisms" | "fillings" | "sizes";

function AdminSpecs() {
  const [cat, setCat] = useState<Cat>("mechanisms");
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Справочник характеристик</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Механизмы, наполнения и шаблоны размеров с ценами для карточек товаров.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setCat("mechanisms")} className={tabCls(cat === "mechanisms")}>Механизмы</button>
        <button onClick={() => setCat("fillings")} className={tabCls(cat === "fillings")}>Наполнения</button>
        <button onClick={() => setCat("sizes")} className={tabCls(cat === "sizes")}>Размеры и цены</button>
      </div>

      <div className="mt-6">
        {cat === "mechanisms" && <SpecList table="spec_mechanisms" queryKey={["spec_mechanisms"]} />}
        {cat === "fillings" && <SpecList table="spec_fillings" queryKey={["spec_fillings"]} />}
        {cat === "sizes" && <SizePriceTemplates />}
      </div>
    </div>
  );
}

function tabCls(active: boolean) {
  return `rounded-full px-4 py-2 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:border-primary"}`;
}

function SpecList({ table, queryKey }: { table: string; queryKey: any[] }) {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey,
    queryFn: async (): Promise<SpecItem[]> => {
      const { data, error } = await (supabase as any).from(table).select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as SpecItem[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (row: Partial<SpecItem> & { id?: string }) => {
      if (row.id) {
        const { id, ...rest } = row;
        const { error } = await (supabase as any).from(table).update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from(table).insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success("Сохранено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success("Удалено"); },
  });

  function add() {
    const slug = `new-${Date.now()}`;
    upsert.mutate({ slug, name: "Новый элемент", description: "", recommendations: "", sort_order: (items.at(-1)?.sort_order ?? 0) + 10 });
  }

  return (
    <div>
      <button onClick={add} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4" /> Добавить
      </button>
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <SpecRow key={it.id} item={it} onSave={(v) => upsert.mutate({ id: it.id, ...v })} onDelete={() => { if (confirm("Удалить?")) del.mutate(it.id); }} />
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Пока пусто.</p>}
      </div>
    </div>
  );
}

function SpecRow({ item, onSave, onDelete }: { item: SpecItem; onSave: (v: Partial<SpecItem>) => void; onDelete: () => void }) {
  const [form, setForm] = useState<SpecItem>(item);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `specs/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-photos").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      setForm((f) => ({ ...f, photo: `/api/public/photo/${path}` }));
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="grid gap-3 md:grid-cols-[160px,1fr]">
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-border bg-surface-muted">
            {form.photo ? (
              <>
                <img src={form.photo} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setForm((f) => ({ ...f, photo: null }))} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"><X className="h-3.5 w-3.5" /></button>
              </>
            ) : (
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary">
                <Upload className="h-5 w-5" />
                {busy ? "Загрузка…" : "Фото"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
              </label>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-[1fr,140px,90px]">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название" className={inputCls} />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" className={inputCls} />
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Сорт." className={inputCls} />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Описание" className={inputCls} />
          <textarea value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} rows={2} placeholder="Рекомендации" className={inputCls} />
          <div className="flex gap-2">
            <button onClick={() => onSave(form)} className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Сохранить</button>
            <button onClick={onDelete} className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="inline h-3 w-3" /> Удалить</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SizePriceTemplates() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: templates = [] } = useQuery(sizePriceTemplatesQuery);

  const upsert = useMutation({
    mutationFn: async (row: Partial<SizePriceTemplate> & { id?: string }) => {
      if (row.id) {
        const { id, ...rest } = row;
        const { error } = await (supabase as any).from("size_price_templates").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("size_price_templates").insert(row);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["size_price_templates"] }); toast.success("Сохранено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("size_price_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["size_price_templates"] }); toast.success("Удалено"); },
  });

  function add() {
    const firstCat = categories[0]?.slug ?? "";
    upsert.mutate({
      category_slug: firstCat,
      title: "Новый шаблон",
      rows: [{ size: "", sleeping: "", box: "", price: "" }],
      sort_order: (templates.at(-1)?.sort_order ?? 0) + 10,
    });
  }

  const byCat = categories.map((c) => ({ category: c, list: templates.filter((t) => t.category_slug === c.slug) }));

  return (
    <div>
      <button onClick={add} disabled={categories.length === 0}
        className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        <Plus className="h-4 w-4" /> Добавить шаблон
      </button>
      <div className="mt-4 space-y-6">
        {byCat.map(({ category, list }) => (
          <div key={category.slug}>
            <div className="mb-3 text-sm font-semibold text-muted-foreground">{category.title}</div>
            <div className="space-y-3">
              {list.map((t) => (
                <TemplateRow
                  key={t.id}
                  template={t}
                  categories={categories}
                  onSave={(v) => upsert.mutate({ id: t.id, ...v })}
                  onDelete={() => { if (confirm("Удалить шаблон?")) del.mutate(t.id); }}
                />
              ))}
              {list.length === 0 && <p className="text-sm text-muted-foreground">Пока нет шаблонов для этой категории.</p>}
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-sm text-muted-foreground">Сначала добавьте категории мебели.</p>}
      </div>
    </div>
  );
}

function TemplateRow({ template, categories, onSave, onDelete }: {
  template: SizePriceTemplate;
  categories: Category[];
  onSave: (v: Partial<SizePriceTemplate>) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState<SizePriceTemplate>(template);

  function updateRow(idx: number, field: keyof SizeRow, value: string) {
    setForm((f) => {
      const rows = [...f.rows];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...f, rows };
    });
  }

  function addRow() {
    setForm((f) => ({ ...f, rows: [...f.rows, { size: "", sleeping: "", box: "", price: "" }] }));
  }

  function removeRow(idx: number) {
    setForm((f) => ({ ...f, rows: f.rows.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr,180px,90px]">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Название шаблона" className={inputCls} />
        <select value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className={inputCls}>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
        </select>
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Сорт." className={inputCls} />
      </div>

      <div className="space-y-2">
        {form.rows.length > 0 && (
          <div className="grid grid-cols-12 gap-2 px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <div className="col-span-3">Размер</div>
            <div className="col-span-3">Спальное место</div>
            <div className="col-span-2 text-center">Короб</div>
            <div className="col-span-3">Цена (в карточке)</div>
            <div className="col-span-1" />
          </div>
        )}
        {form.rows.map((row, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2">
            <input placeholder="180×120" value={row.size} onChange={(e) => updateRow(i, "size", e.target.value)} className={`${inputCls} col-span-3`} />
            <input placeholder="160×200" value={row.sleeping} onChange={(e) => updateRow(i, "sleeping", e.target.value)} className={`${inputCls} col-span-3`} />
            <div className="col-span-2 flex justify-center">
              <input
                type="checkbox"
                checked={!!row.box && row.box !== "нет"}
                onChange={(e) => updateRow(i, "box", e.target.checked ? "да" : "")}
                className="h-5 w-5 cursor-pointer accent-primary"
                aria-label="Есть короб"
              />
            </div>
            <input placeholder="оставьте пустым" disabled value={row.price} className={`${inputCls} col-span-3 bg-surface-muted text-muted-foreground`} />
            <button onClick={() => removeRow(i)} className="col-span-1 rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="mx-auto h-4 w-4" /></button>
          </div>
        ))}
        <button onClick={addRow} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Plus className="h-3 w-3" /> Строка
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => onSave(form)} className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">Сохранить</button>
        <button onClick={onDelete} className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><Trash2 className="inline h-3 w-3" /> Удалить</button>
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
