import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fabricQuery, fabricCategoriesQuery } from "@/lib/queries";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import type { Fabric } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/admin/fabrics/$id")({
  component: EditFabric,
});

const EMPTY: Omit<Fabric, "id"> = {
  code: "", title: "", category_slug: "", description: "",
  characteristics: {}, recommendations: "", surcharge: 0,
  sample_photo: null, furniture_photos: [], sort_order: 0,
};

function EditFabric() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const { data: existing } = useQuery({ ...fabricQuery(id), enabled: !isNew });
  const [form, setForm] = useState<Omit<Fabric, "id">>(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (existing) setForm(existing); }, [existing]);
  useEffect(() => { if (isNew && cats.length && !form.category_slug) setForm((f) => ({ ...f, category_slug: cats[0].slug })); }, [cats, isNew, form.category_slug]);

  function up<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }
  function upChar<K extends keyof Fabric["characteristics"]>(k: K, v: any) {
    setForm((f) => ({ ...f, characteristics: { ...f.characteristics, [k]: v } }));
  }

  async function onSamplePhoto(file: File) {
    try { const url = await uploadPhoto(file); up("sample_photo", url); }
    catch (e: any) { toast.error(e.message); }
  }
  async function onFurniturePhoto(file: File) {
    try { const url = await uploadPhoto(file); up("furniture_photos", [...form.furniture_photos, url]); }
    catch (e: any) { toast.error(e.message); }
  }

  async function save() {
    if (!form.title.trim()) return toast.error("Введите название");
    setBusy(true);
    try {
      if (isNew) {
        const { data, error } = await (supabase as any).from("fabrics").insert(form).select("id").single();
        if (error) throw error;
        toast.success("Ткань создана");
        qc.invalidateQueries({ queryKey: ["fabrics"] });
        nav({ to: "/admin/fabrics/$id", params: { id: data.id } });
      } else {
        const { error } = await (supabase as any).from("fabrics").update(form).eq("id", id);
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["fabrics"] });
        qc.invalidateQueries({ queryKey: ["fabric", id] });
        toast.success("Сохранено");
      }
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <div>
      <Link to="/admin/fabrics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> К списку тканей
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">{isNew ? "Новая ткань" : form.title || "Редактирование"}</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Основное">
            <F label="Название"><input value={form.title} onChange={(e) => up("title", e.target.value)} className={I} /></F>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Код"><input value={form.code} onChange={(e) => up("code", e.target.value)} className={I} /></F>
              <F label="Категория">
                <select value={form.category_slug} onChange={(e) => up("category_slug", e.target.value)} className={I}>
                  {cats.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
              </F>
            </div>
            <F label="Описание"><textarea value={form.description} onChange={(e) => up("description", e.target.value)} rows={3} className={I} /></F>
            <F label="Рекомендации"><textarea value={form.recommendations} onChange={(e) => up("recommendations", e.target.value)} rows={2} className={I} /></F>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Доплата, ₽"><input type="number" value={form.surcharge} onChange={(e) => up("surcharge", Number(e.target.value))} className={I} /></F>
              <F label="Порядок"><input type="number" value={form.sort_order} onChange={(e) => up("sort_order", Number(e.target.value))} className={I} /></F>
            </div>
          </Section>

          <Section title="Характеристики">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.characteristics.for_children} onChange={(e) => upChar("for_children", e.target.checked)} />Для детей</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.characteristics.for_pets} onChange={(e) => upChar("for_pets", e.target.checked)} />Для животных</label>
            </div>
            <F label="Лёгкость ухода"><input value={form.characteristics.easy_care ?? ""} onChange={(e) => upChar("easy_care", e.target.value)} className={I} placeholder="Например: высокая" /></F>
            <F label="Износостойкость"><input value={form.characteristics.durability ?? ""} onChange={(e) => upChar("durability", e.target.value)} className={I} placeholder="Например: 30 000 циклов" /></F>
            <F label="Особенности"><textarea value={form.characteristics.features ?? ""} onChange={(e) => upChar("features", e.target.value)} rows={2} className={I} /></F>
          </Section>

          <Section title="Образец ткани">
            <div className="flex items-start gap-3">
              {form.sample_photo ? (
                <div className="relative">
                  <img src={form.sample_photo} alt="" className="h-32 w-32 rounded-2xl object-cover" />
                  <button onClick={() => up("sample_photo", null)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-xs text-muted-foreground hover:text-primary">
                  <Upload className="h-5 w-5" />Фото образца
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onSamplePhoto(f); }} />
                </label>
              )}
            </div>
          </Section>

          <Section title="Фото мебели в этой ткани">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {form.furniture_photos.map((u, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                  <img src={u} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => up("furniture_photos", form.furniture_photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-xs text-muted-foreground hover:text-primary">
                <Upload className="h-4 w-4" />Добавить
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFurniturePhoto(f); }} />
              </label>
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <button onClick={save} disabled={busy} className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {busy ? "Сохраняем…" : isNew ? "Создать ткань" : "Сохранить"}
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
