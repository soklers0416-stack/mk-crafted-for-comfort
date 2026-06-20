import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fabricQuery,
  fabricCategoriesQuery,
  fabricCharacteristicsQuery,
  fabricColorsByCollectionQuery,
} from "@/lib/queries";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import type { Fabric, FabricColor } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/admin/fabrics/$id")({
  component: EditFabric,
});

const EMPTY: Omit<Fabric, "id"> = {
  code: "", title: "", category_slug: "", description: "",
  characteristics: {}, recommendations: "", surcharge: 0,
  sample_photo: null, furniture_photos: [], sort_order: 0,
  allow_pets: false, washable: false, pros: "", cons: "",
};

function EditFabric() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const { data: charDefs = [] } = useQuery(fabricCharacteristicsQuery);
  const { data: existing } = useQuery({ ...fabricQuery(id), enabled: !isNew });
  const { data: existingColors = [] } = useQuery({
    ...fabricColorsByCollectionQuery(id),
    enabled: !isNew,
  });
  const [form, setForm] = useState<Omit<Fabric, "id">>(EMPTY);
  const [colors, setColors] = useState<FabricColor[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (existing) setForm(existing); }, [existing]);
  useEffect(() => { setColors(existingColors); }, [existingColors]);
  useEffect(() => { if (isNew && cats.length && !form.category_slug) setForm((f) => ({ ...f, category_slug: cats[0].slug })); }, [cats, isNew, form.category_slug]);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }
  function upChar(label: string, v: string) {
    setForm((f) => ({ ...f, characteristics: { ...f.characteristics, [label]: v } }));
  }

  async function onSamplePhoto(file: File) {
    try { const url = await uploadPhoto(file); up("sample_photo", url); }
    catch (e: any) { toast.error(e.message); }
  }

  async function save() {
    if (!form.title.trim()) return toast.error("Введите название коллекции");
    setBusy(true);
    try {
      let collectionId = id;
      if (isNew) {
        const { data, error } = await (supabase as any).from("fabrics").insert(form).select("id").single();
        if (error) throw error;
        collectionId = data.id;
      } else {
        const { error } = await (supabase as any).from("fabrics").update(form).eq("id", id);
        if (error) throw error;
      }

      // Sync colors: simple strategy — delete & re-insert
      if (!isNew) {
        const existingIds = existingColors.map((c) => c.id);
        const keptIds = colors.filter((c) => existingIds.includes(c.id)).map((c) => c.id);
        const toDelete = existingIds.filter((eid) => !keptIds.includes(eid));
        if (toDelete.length) {
          const { error } = await (supabase as any).from("fabric_colors").delete().in("id", toDelete);
          if (error) throw error;
        }
        // Updates
        for (const c of colors.filter((c) => existingIds.includes(c.id))) {
          const { error } = await (supabase as any).from("fabric_colors").update({
            name: c.name, code: c.code, photo: c.photo, sort_order: c.sort_order,
          }).eq("id", c.id);
          if (error) throw error;
        }
      }
      // Inserts (new rows have id starting with "tmp-")
      const toInsert = colors
        .filter((c) => c.id.startsWith("tmp-"))
        .map((c, i) => ({
          fabric_id: collectionId,
          name: c.name, code: c.code, photo: c.photo,
          sort_order: c.sort_order || (i + 1) * 10,
        }));
      if (toInsert.length) {
        const { error } = await (supabase as any).from("fabric_colors").insert(toInsert);
        if (error) throw error;
      }

      qc.invalidateQueries({ queryKey: ["fabrics"] });
      qc.invalidateQueries({ queryKey: ["fabric", collectionId] });
      qc.invalidateQueries({ queryKey: ["fabric_colors"] });
      toast.success(isNew ? "Коллекция создана" : "Сохранено");
      if (isNew) nav({ to: "/admin/fabrics/$id", params: { id: collectionId } });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  function addColor() {
    setColors((cs) => [
      ...cs,
      { id: `tmp-${Math.random().toString(36).slice(2)}`, fabric_id: id, name: "", code: "", photo: null, sort_order: (cs.length + 1) * 10 },
    ]);
  }
  function updColor(i: number, patch: Partial<FabricColor>) {
    setColors((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }
  function delColor(i: number) {
    setColors((cs) => cs.filter((_, j) => j !== i));
  }
  async function onColorPhoto(i: number, file: File) {
    try { const url = await uploadPhoto(file); updColor(i, { photo: url }); }
    catch (e: any) { toast.error(e.message); }
  }

  return (
    <div>
      <Link to="/admin/fabrics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> К списку коллекций
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">{isNew ? "Новая коллекция" : form.title || "Редактирование"}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Основное">
            <F label="Название коллекции"><input value={form.title} onChange={(e) => up("title", e.target.value)} className={I} placeholder="Например: Velutto" /></F>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Код / артикул"><input value={form.code} onChange={(e) => up("code", e.target.value)} className={I} /></F>
              <F label="Тип ткани">
                <select value={form.category_slug} onChange={(e) => up("category_slug", e.target.value)} className={I}>
                  {cats.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
              </F>
            </div>
            <F label="Описание"><textarea value={form.description} onChange={(e) => up("description", e.target.value)} rows={3} className={I} /></F>
            <F label="Подходит для комнат">
              <div className="grid gap-2 sm:grid-cols-2">
                {ROOMS.map((r) => {
                  const list = (form.recommendations || "").split(",").map((s) => s.trim()).filter(Boolean);
                  const checked = list.includes(r);
                  return (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...list.filter((x) => x !== r), r]
                            : list.filter((x) => x !== r);
                          up("recommendations", next.join(", "));
                        }}
                        className="h-4 w-4"
                      />
                      {r}
                    </label>
                  );
                })}
              </div>
            </F>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Доплата, ₽"><input type="number" value={form.surcharge} onChange={(e) => up("surcharge", Number(e.target.value))} className={I} /></F>
              <F label="Порядок"><input type="number" value={form.sort_order} onChange={(e) => up("sort_order", Number(e.target.value))} className={I} /></F>
            </div>
          </Section>

          <Section title="Характеристики">
            <p className="text-xs text-muted-foreground">
              Пустые поля не показываются на сайте.{" "}
              <Link to="/admin/fabrics/characteristics" className="text-primary hover:underline">Управлять списком характеристик</Link>
            </p>
            {charDefs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Список характеристик пуст. <Link to="/admin/fabrics/characteristics" className="text-primary hover:underline">Добавить характеристики</Link>
              </p>
            ) : (
              charDefs.map((def) => (
                <F key={def.id} label={def.label}>
                  <input
                    value={form.characteristics[def.label] ?? ""}
                    onChange={(e) => upChar(def.label, e.target.value)}
                    className={I}
                  />
                </F>
              ))
            )}
            <div className="mt-2 grid gap-2 sm:grid-cols-2 pt-3 border-t border-border/60">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.allow_pets} onChange={(e) => up("allow_pets", e.target.checked)} className="h-4 w-4" />
                Подходит для домашних животных
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.washable} onChange={(e) => up("washable", e.target.checked)} className="h-4 w-4" />
                Можно мыть
              </label>
            </div>
          </Section>

          <Section title="Преимущества и недостатки">
            <p className="text-xs text-muted-foreground">Каждый пункт с новой строки. Пустые блоки не показываются на сайте.</p>
            <F label="Преимущества">
              <textarea value={form.pros} onChange={(e) => up("pros", e.target.value)} rows={4} className={I} placeholder="Например:&#10;Мягкая на ощупь&#10;Не выгорает" />
            </F>
            <F label="Недостатки">
              <textarea value={form.cons} onChange={(e) => up("cons", e.target.value)} rows={4} className={I} placeholder="Например:&#10;Требует бережного ухода" />
            </F>
          </Section>

          <Section title="Главное фото коллекции">
            <div className="flex items-start gap-3">
              {form.sample_photo ? (
                <div className="relative">
                  <img src={form.sample_photo} alt="" className="h-32 w-32 rounded-2xl object-cover" />
                  <button onClick={() => up("sample_photo", null)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-xs text-muted-foreground hover:text-primary">
                  <Upload className="h-5 w-5" />Главное фото
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSamplePhoto(f); }} />
                </label>
              )}
            </div>
          </Section>

          <Section title={`Цвета коллекции (${colors.length})`}>
            {isNew && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                Сначала сохраните коллекцию — затем сможете добавить цвета.
              </p>
            )}
            <div className="space-y-3">
              {colors.map((c, i) => (
                <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-surface/50 p-3">
                  <div className="shrink-0">
                    {c.photo ? (
                      <div className="relative">
                        <img src={c.photo} alt="" className="h-20 w-20 rounded-xl object-cover" />
                        <button onClick={() => updColor(i, { photo: null })} className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-[10px] text-muted-foreground hover:text-primary">
                        <Upload className="h-4 w-4" />Фото
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onColorPhoto(i, f); }} />
                      </label>
                    )}
                  </div>
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <input value={c.name} onChange={(e) => updColor(i, { name: e.target.value })} placeholder="Название цвета" className={I} />
                    <input value={c.code} onChange={(e) => updColor(i, { code: e.target.value })} placeholder="Артикул (например, Velutto 03)" className={I} />
                  </div>
                  <button onClick={() => delColor(i)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button
                onClick={addColor}
                disabled={isNew}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Добавить цвет
              </button>
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <button onClick={save} disabled={busy} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {busy ? "Сохраняем…" : isNew ? "Создать коллекцию" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

const I = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="rounded-2xl border border-border/60 bg-card p-5"><h2 className="font-display text-base font-semibold">{title}</h2><div className="mt-4 space-y-3">{children}</div></div>);
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>);
}
