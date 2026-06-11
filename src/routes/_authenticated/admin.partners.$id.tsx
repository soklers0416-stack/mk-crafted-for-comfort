import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { partnerQuery, partnerCategoriesQuery } from "@/lib/queries";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";
import type { Partner, PartnerSocial } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/admin/partners/$id")({
  component: AdminPartnerEdit,
});

function AdminPartnerEdit() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: partner } = useQuery(partnerQuery(id));
  const { data: categories = [] } = useQuery(partnerCategoriesQuery);
  const [form, setForm] = useState<Partner | null>(null);

  useEffect(() => { if (partner) setForm(partner); }, [partner]);

  const save = useMutation({
    mutationFn: async (next: Partner) => {
      const { error } = await (supabase as any).from("partners").update({
        title: next.title,
        category_slug: next.category_slug,
        description: next.description,
        advantages: next.advantages,
        phone: next.phone,
        email: next.email,
        website: next.website,
        socials: next.socials,
        logo: next.logo,
        main_photo: next.main_photo,
        gallery: next.gallery,
        is_active: next.is_active,
        sort_order: next.sort_order,
      }).eq("id", next.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners"] }); qc.invalidateQueries({ queryKey: ["partner", id] }); toast.success("Сохранено"); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async () => { const { error } = await (supabase as any).from("partners").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners"] }); navigate({ to: "/admin/partners" }); },
  });

  if (!form) return <p className="text-muted-foreground">Загрузка…</p>;

  const setField = <K extends keyof Partner>(k: K, v: Partner[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="space-y-6">
      <Link to="/admin/partners" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" />Все партнёры
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Редактирование</h1>
        <div className="flex gap-2">
          <button onClick={() => { if (confirm("Удалить партнёра?")) del.mutate(); }} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />Удалить
          </button>
          <button onClick={() => save.mutate(form)} disabled={save.isPending} className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {save.isPending ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Основная информация">
          <Field label="Название"><input className="adm-input" value={form.title} onChange={(e) => setField("title", e.target.value)} /></Field>
          <Field label="Категория">
            <select className="adm-input" value={form.category_slug} onChange={(e) => setField("category_slug", e.target.value)}>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
            </select>
          </Field>
          <Field label="Описание">
            <textarea className="adm-input min-h-[120px]" value={form.description} onChange={(e) => setField("description", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Порядок"><input type="number" className="adm-input" value={form.sort_order} onChange={(e) => setField("sort_order", Number(e.target.value))} /></Field>
            <Field label="Статус">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setField("is_active", e.target.checked)} />
                Активен (показывать на сайте)
              </label>
            </Field>
          </div>
        </Card>

        <Card title="Контакты">
          <Field label="Телефон"><input className="adm-input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} /></Field>
          <Field label="Email"><input className="adm-input" value={form.email} onChange={(e) => setField("email", e.target.value)} /></Field>
          <Field label="Сайт"><input className="adm-input" value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://example.com" /></Field>
          <SocialsEditor socials={form.socials} onChange={(s) => setField("socials", s)} />
        </Card>

        <Card title="Преимущества">
          <ListEditor
            items={form.advantages}
            onChange={(a) => setField("advantages", a)}
            placeholder="Например: гарантия 3 года"
          />
        </Card>

        <Card title="Логотип и главное фото">
          <Field label="Логотип">
            <PhotoInput value={form.logo} onChange={(v) => setField("logo", v)} />
          </Field>
          <Field label="Главное фото">
            <PhotoInput value={form.main_photo} onChange={(v) => setField("main_photo", v)} />
          </Field>
        </Card>

        <div className="lg:col-span-2">
          <Card title="Галерея работ">
            <GalleryEditor items={form.gallery} onChange={(g) => setField("gallery", g)} />
          </Card>
        </div>
      </div>

      <style>{`.adm-input{display:block;width:100%;border-radius:.75rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:.625rem .875rem;font-size:.875rem;outline:none}.adm-input:focus{border-color:hsl(var(--primary))}`}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-6">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function PhotoInput({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [uploading, setUploading] = useState(false);
  const handle = async (file: File) => {
    setUploading(true);
    try { onChange(await uploadPhoto(file)); }
    catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-20 overflow-hidden rounded-xl bg-surface-muted">
        {value && <img src={value} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex flex-col gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-primary/40">
          <Upload className="h-4 w-4" />{uploading ? "Загрузка…" : "Загрузить"}
          <input
            type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }}
          />
        </label>
        {value && <button onClick={() => onChange(null)} className="text-xs text-red-600 hover:underline text-left">Удалить</button>}
      </div>
    </div>
  );
}

function ListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="adm-input"
            value={it}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items]; next[i] = e.target.value; onChange(next);
            }}
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid h-10 w-10 place-items-center rounded-lg text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <Plus className="h-4 w-4" />Добавить
      </button>
    </div>
  );
}

function SocialsEditor({ socials, onChange }: { socials: PartnerSocial[]; onChange: (s: PartnerSocial[]) => void }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Соцсети</span>
      <div className="mt-2 space-y-2">
        {socials.map((s, i) => (
          <div key={i} className="grid grid-cols-[120px_1fr_auto] gap-2">
            <input className="adm-input" placeholder="Тип" value={s.type} onChange={(e) => { const n = [...socials]; n[i] = { ...n[i], type: e.target.value }; onChange(n); }} />
            <input className="adm-input" placeholder="https://…" value={s.url} onChange={(e) => { const n = [...socials]; n[i] = { ...n[i], url: e.target.value }; onChange(n); }} />
            <button onClick={() => onChange(socials.filter((_, j) => j !== i))} className="grid h-10 w-10 place-items-center rounded-lg text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button onClick={() => onChange([...socials, { type: "Instagram", url: "" }])} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Plus className="h-4 w-4" />Добавить соцсеть
        </button>
      </div>
    </div>
  );
}

function GalleryEditor({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const handle = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        urls.push(await uploadPhoto(f));
      }
      onChange([...items, ...urls]);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  };
  return (
    <div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-primary/40">
        <Upload className="h-4 w-4" />{uploading ? "Загрузка…" : "Добавить фото"}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
      </label>
      {items.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {items.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-surface-muted">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
