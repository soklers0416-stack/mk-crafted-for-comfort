import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, productQuery, fabricsQuery, productFabricsQuery, fabricCategoriesQuery, specMechanismsQuery, specFillingsQuery } from "@/lib/queries";
import type { Product, SizeRow, Spec } from "@/lib/db";
import { SOFA_TYPES } from "@/lib/db";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: EditProduct,
});

const EMPTY: Omit<Product, "id"> = {
  category_slug: "",
  title: "",
  description: "",
  price: 0,
  price_from: false,
  photo1: null, photo2: null, photo3: null, photo4: null, photo5: null, photo6: null,
  sleeping_place: "",
  mechanism: "",
  filling: "",
  mechanism_id: null,
  filling_id: null,
  sofa_type: null,
  custom_size_enabled: false,
  has_box: false,
  availability: "в наличии",
  production_time: "",
  sizes: [],
  specs: [],
  sale_enabled: false,
  sale_label: "",
  sale_old_price: null,
  sale_new_price: null,
  sale_text: "",
  is_bestseller: false,
  sort_order: 0,
};


function EditProduct() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: existing } = useQuery({ ...productQuery(id), enabled: !isNew });
  const { data: fabrics = [] } = useQuery(fabricsQuery);
  const { data: fabCats = [] } = useQuery(fabricCategoriesQuery);
  const { data: pf = [] } = useQuery(productFabricsQuery);
  const { data: mechanisms = [] } = useQuery(specMechanismsQuery);
  const { data: fillings = [] } = useQuery(specFillingsQuery);

  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [selectedFabrics, setSelectedFabrics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (existing) setForm(existing);
    if (!isNew && existing === null) toast.error("Товар не найден");
  }, [existing, isNew]);

  useEffect(() => {
    if (!isNew) setSelectedFabrics(new Set(pf.filter((r) => r.product_id === id).map((r) => r.fabric_id)));
  }, [pf, id, isNew]);

  useEffect(() => {
    if (isNew && categories.length && !form.category_slug) {
      setForm((f) => ({ ...f, category_slug: categories[0].slug }));
    }
  }, [categories, isNew, form.category_slug]);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadPhoto(slot: 1 | 2 | 3 | 4 | 5 | 6, file: File) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-photos").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { toast.error(error.message); return; }
    update(`photo${slot}` as any, `/api/public/photo/${path}`);
  }

  async function uploadMultiplePhotos(files: FileList) {
    const slots: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];
    const empty = slots.filter((n) => !(form as any)[`photo${n}`]);
    if (empty.length === 0) { toast.error("Все 6 слотов заняты"); return; }
    const toUpload = Array.from(files).slice(0, empty.length);
    if (files.length > empty.length) toast.message(`Загружаем ${empty.length} из ${files.length} — больше нет свободных слотов`);
    setBusy(true);
    try {
      const uploaded: { slot: 1 | 2 | 3 | 4 | 5 | 6; url: string }[] = [];
      await Promise.all(toUpload.map(async (file, i) => {
        const slot = empty[i];
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-photos").upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
        uploaded.push({ slot, url: `/api/public/photo/${path}` });
      }));
      setForm((f) => {
        const next = { ...f } as any;
        for (const u of uploaded) next[`photo${u.slot}`] = u.url;
        return next;
      });
      toast.success(`Загружено: ${uploaded.length}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  function loadSizesTemplate() {
    const tmpl = (qc.getQueryData(["products"]) as any[] | undefined)?.find(
      (p: any) => p.id !== id && p.category_slug === form.category_slug && Array.isArray(p.sizes) && p.sizes.length > 0,
    );
    if (!tmpl) { toast.error("В этой категории ещё нет товара с размерами"); return; }
    const rows = tmpl.sizes.map((s: any) => ({ size: s.size ?? "", sleeping: s.sleeping ?? "", box: s.box ?? "", price: "" }));
    update("sizes", rows);
    toast.success(`Подгружено ${rows.length} строк — впишите цены`);
  }

  async function save() {
    if (!form.title.trim()) return toast.error("Введите название");
    if (!form.category_slug) return toast.error("Выберите категорию");
    setBusy(true);
    try {
      const payload = { ...form };
      let productId = id;
      if (isNew) {
        const { data, error } = await (supabase as any).from("products").insert(payload).select("id").single();
        if (error) throw error;
        productId = data.id;
        toast.success("Товар создан");
      } else {
        const { error } = await (supabase as any).from("products").update(payload).eq("id", id);
        if (error) throw error;
      }
      // Sync product_fabrics
      await (supabase as any).from("product_fabrics").delete().eq("product_id", productId);
      if (selectedFabrics.size > 0) {
        const rows = Array.from(selectedFabrics).map((fid) => ({ product_id: productId, fabric_id: fid }));
        const { error: e2 } = await (supabase as any).from("product_fabrics").insert(rows);
        if (e2) throw e2;
      }
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product", productId] });
      qc.invalidateQueries({ queryKey: ["product_fabrics"] });
      if (isNew) navigate({ to: "/admin/products/$id", params: { id: productId } });
      else toast.success("Сохранено");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  function toggleFabric(fid: string) {
    setSelectedFabrics((s) => { const n = new Set(s); if (n.has(fid)) n.delete(fid); else n.add(fid); return n; });
  }

  const photoSlots: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];

  return (
    <div>
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> К списку товаров
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">
        {isNew ? "Новый товар" : form.title || "Редактирование"}
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Основное */}
          <Section title="Основное">
            <Field label="Название">
              <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Описание">
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={inputCls} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Категория">
                <select value={form.category_slug} onChange={(e) => update("category_slug", e.target.value)} className={inputCls}>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
              </Field>
              <Field label="Цена, ₽">
                <input type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))} className={inputCls} />
              </Field>
              <Field label='Показывать "от"'>
                <Toggle on={form.price_from} onChange={(v) => update("price_from", v)} />
              </Field>
            </div>
          </Section>

          {/* Фото */}
          <Section title="Фотографии (до 6)">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photoSlots.map((n) => {
                const url = (form as any)[`photo${n}`] as string | null;
                return (
                  <div key={n} className="relative aspect-square overflow-hidden rounded-2xl border border-dashed border-border bg-surface-muted">
                    {url ? (
                      <>
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          onClick={() => update(`photo${n}` as any, null)}
                          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary">
                        <Upload className="h-5 w-5" />
                        Фото {n}
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(n, f); }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Характеристики */}
          <Section title="Характеристики">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Спальное место"><input value={form.sleeping_place ?? ""} onChange={(e) => update("sleeping_place", e.target.value)} className={inputCls} /></Field>
              <Field label="Короб"><Toggle on={Boolean(form.has_box)} onChange={(v) => update("has_box", v)} /></Field>
              <Field label="Механизм (из справочника)">
                <select
                  value={form.mechanism_id ?? ""}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    const m = mechanisms.find((x) => x.id === v);
                    setForm((f) => ({ ...f, mechanism_id: v, mechanism: m?.name ?? "" }));
                  }}
                  className={inputCls}
                >
                  <option value="">— не выбрано —</option>
                  {mechanisms.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </Field>
              <Field label="Наполнение (из справочника)">
                <select
                  value={form.filling_id ?? ""}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    const m = fillings.find((x) => x.id === v);
                    setForm((f) => ({ ...f, filling_id: v, filling: m?.name ?? "" }));
                  }}
                  className={inputCls}
                >
                  <option value="">— не выбрано —</option>
                  {fillings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </Field>
              <Field label="Тип дивана (для подкатегорий)">
                <select value={form.sofa_type ?? ""} onChange={(e) => update("sofa_type", (e.target.value || null) as any)} className={inputCls}>
                  <option value="">— не указано —</option>
                  {SOFA_TYPES.map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
                </select>
              </Field>
              <Field label="Возможно изготовление нестандартного размера">
                <Toggle on={Boolean(form.custom_size_enabled)} onChange={(v) => update("custom_size_enabled", v)} />
              </Field>
              <Field label="Наличие">
                <select value={form.availability ?? "в наличии"} onChange={(e) => update("availability", e.target.value as any)} className={inputCls}>
                  <option value="в наличии">в наличии</option>
                  <option value="под заказ">под заказ</option>
                </select>
              </Field>
              <Field label="Срок изготовления"><input value={form.production_time ?? ""} onChange={(e) => update("production_time", e.target.value)} className={inputCls} /></Field>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Описания механизма и наполнения подтянутся автоматически из «Справочника характеристик».</p>
          </Section>


          {/* Доступные ткани */}
          <Section title="Доступные ткани">
            <p className="text-xs text-muted-foreground">Отметьте ткани, доступные для выбора в этом товаре. Если ничего не отметить — будут доступны все ткани.</p>
            {fabCats.map((c) => {
              const list = fabrics.filter((f) => f.category_slug === c.slug);
              if (list.length === 0) return null;
              return (
                <div key={c.slug} className="mt-3">
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.title}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {list.map((f) => (
                      <label key={f.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs">
                        <input type="checkbox" checked={selectedFabrics.has(f.id)} onChange={() => toggleFabric(f.id)} />
                        {f.sample_photo && <img src={f.sample_photo} alt="" className="h-6 w-6 rounded object-cover" />}
                        <span className="truncate">{f.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            {fabrics.length === 0 && <p className="text-sm text-muted-foreground">Сначала добавьте ткани в разделе «Ткани».</p>}
          </Section>



          {/* Размеры */}
          <Section
            title="Размеры и цены"
            action={
              <button onClick={() => update("sizes", [...form.sizes, { size: "", sleeping: "", box: "", price: "" }])}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Plus className="h-3 w-3" /> Строка
              </button>
            }
          >
            {form.sizes.length === 0 && <p className="text-sm text-muted-foreground">Пока нет строк.</p>}
            {form.sizes.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input placeholder="Размер" value={s.size} onChange={(e) => updateRow("sizes", i, "size", e.target.value)} className={`${inputCls} col-span-3`} />
                <input placeholder="Спальное место" value={s.sleeping} onChange={(e) => updateRow("sizes", i, "sleeping", e.target.value)} className={`${inputCls} col-span-3`} />
                <input placeholder="Короб" value={s.box} onChange={(e) => updateRow("sizes", i, "box", e.target.value)} className={`${inputCls} col-span-2`} />
                <input placeholder="Цена" value={s.price} onChange={(e) => updateRow("sizes", i, "price", e.target.value)} className={`${inputCls} col-span-3`} />
                <button onClick={() => removeRow("sizes", i)} className="col-span-1 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="mx-auto h-4 w-4" /></button>
              </div>
            ))}
          </Section>

          {/* Доп. характеристики */}
          <Section
            title="Дополнительные характеристики"
            action={
              <button onClick={() => update("specs", [...form.specs, { label: "", value: "" }])}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Plus className="h-3 w-3" /> Строка
              </button>
            }
          >
            {form.specs.length === 0 && <p className="text-sm text-muted-foreground">Пока нет строк.</p>}
            {form.specs.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <input placeholder="Параметр" value={s.label} onChange={(e) => updateRow("specs", i, "label", e.target.value)} className={`${inputCls} col-span-5`} />
                <input placeholder="Значение" value={s.value} onChange={(e) => updateRow("specs", i, "value", e.target.value)} className={`${inputCls} col-span-6`} />
                <button onClick={() => removeRow("specs", i)} className="col-span-1 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="mx-auto h-4 w-4" /></button>
              </div>
            ))}
          </Section>
        </div>

        {/* Боковая колонка */}
        <div className="space-y-6">
          <Section title="Акция">
            <Field label="Включить плашку «Акция»"><Toggle on={form.sale_enabled} onChange={(v) => update("sale_enabled", v)} /></Field>
            <Field label="Текст плашки (напр. ХИТ, СКИДКА)"><input value={form.sale_label ?? ""} onChange={(e) => update("sale_label", e.target.value)} className={inputCls} /></Field>
            <Field label="Старая цена, ₽"><input type="number" value={form.sale_old_price ?? ""} onChange={(e) => update("sale_old_price", e.target.value ? Number(e.target.value) : null)} className={inputCls} /></Field>
            <Field label="Новая цена, ₽"><input type="number" value={form.sale_new_price ?? ""} onChange={(e) => update("sale_new_price", e.target.value ? Number(e.target.value) : null)} className={inputCls} /></Field>
            <Field label="Описание акции"><input value={form.sale_text ?? ""} onChange={(e) => update("sale_text", e.target.value)} className={inputCls} /></Field>
          </Section>

          <Section title="Прочее">
            <Field label="Показывать в «Хитах продаж» на главной"><Toggle on={form.is_bestseller} onChange={(v) => update("is_bestseller", v)} /></Field>
            <Field label="Порядок сортировки"><input type="number" value={form.sort_order} onChange={(e) => update("sort_order", Number(e.target.value))} className={inputCls} /></Field>
          </Section>

          <button onClick={save} disabled={busy}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {busy ? "Сохраняем…" : isNew ? "Создать товар" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );

  function updateRow(key: "sizes" | "specs", idx: number, field: string, value: string) {
    setForm((f) => {
      const arr = [...(f[key] as any[])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [key]: arr };
    });
  }
  function removeRow(key: "sizes" | "specs", idx: number) {
    setForm((f) => ({ ...f, [key]: (f[key] as any[]).filter((_, i) => i !== idx) }));
  }
}

const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`inline-flex h-6 w-11 items-center rounded-full transition ${on ? "bg-primary" : "bg-border"}`}>
      <span className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
