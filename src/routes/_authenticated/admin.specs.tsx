import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { specMechanismsQuery, specFillingsQuery } from "@/lib/queries";
import type { SpecItem } from "@/lib/db";
import { Plus, Trash2, Upload, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/specs")({
  component: AdminSpecs,
});

type Cat = "mechanisms" | "fillings";

function AdminSpecs() {
  const [cat, setCat] = useState<Cat>("mechanisms");
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Справочник характеристик</h1>
      <p className="mt-1 text-sm text-muted-foreground">Названия, описания, фото и рекомендации для механизмов и наполнений.</p>

      <div className="mt-6 flex gap-2">
        <button onClick={() => setCat("mechanisms")} className={tabCls(cat === "mechanisms")}>Механизмы</button>
        <button onClick={() => setCat("fillings")} className={tabCls(cat === "fillings")}>Наполнения</button>
      </div>

      <div className="mt-6">
        {cat === "mechanisms" ? <SpecList table="spec_mechanisms" queryKey={["spec_mechanisms"]} /> : <SpecList table="spec_fillings" queryKey={["spec_fillings"]} />}
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

const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
