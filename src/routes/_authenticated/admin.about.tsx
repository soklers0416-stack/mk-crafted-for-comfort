import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { aboutContentQuery, aboutAdvantagesQuery, aboutStatsQuery, aboutStepsQuery } from "@/lib/queries";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/about")({
  component: AdminAbout,
});

const TABS = ["content", "advantages", "stats", "steps"] as const;
type Tab = typeof TABS[number];

function AdminAbout() {
  const [tab, setTab] = useState<Tab>("content");
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Страница «О компании»</h1>
      <div className="mt-4 flex gap-2 border-b border-border">
        {([["content","Тексты и блоки"],["advantages","Преимущества"],["stats","Цифры"],["steps","Этапы работы"]] as [Tab,string][]).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm border-b-2 ${tab===k?"border-primary text-primary":"border-transparent text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "content" && <ContentEditor />}
        {tab === "advantages" && <AdvantagesEditor />}
        {tab === "stats" && <StatsEditor />}
        {tab === "steps" && <StepsEditor />}
      </div>
    </div>
  );
}

function ContentEditor() {
  const qc = useQueryClient();
  const { data: content = {} } = useQuery(aboutContentQuery);
  const [draft, setDraft] = useState<Record<string, any>>({});
  useEffect(() => { setDraft(content); }, [content]);

  const save = useMutation({
    mutationFn: async (key: string) => {
      const { error } = await (supabase as any).from("about_content").upsert({ key, value: draft[key] ?? {} });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["about_content"] }); toast.success("Сохранено"); },
    onError: (e: any) => toast.error(e.message),
  });

  function setField(key: string, field: string, value: any) {
    setDraft((d) => ({ ...d, [key]: { ...(d[key] ?? {}), [field]: value } }));
  }
  async function uploadHero(key: string, field: string, file: File) {
    try { const url = await uploadPhoto(file); setField(key, field, url); } catch (e: any) { toast.error(e.message); }
  }
  async function uploadShowroomToIndex(file: File, index: number) {
    try {
      const url = await uploadPhoto(file);
      const arr = Array.isArray(draft.showroom?.images) ? [...draft.showroom.images] : [];
      arr[index] = url;
      setField("showroom", "images", arr);
    } catch (e: any) { toast.error(e.message); }
  }


  const BLOCKS: { key: string; title: string; fields: { name: string; label: string; type?: string }[] }[] = [
    { key: "hero", title: "Первый экран", fields: [
      { name: "title", label: "Заголовок" },
      { name: "text", label: "Текст", type: "textarea" },
      { name: "button_text", label: "Текст кнопки" },
      { name: "button_link", label: "Ссылка кнопки" },
      { name: "image", label: "Фото", type: "image" },
    ]},
    { key: "why_cheaper", title: "Почему наши цены ниже", fields: [
      { name: "title", label: "Заголовок" },
      { name: "text", label: "Текст", type: "textarea" },
    ]},
    { key: "why_us", title: "Почему выбирают нас", fields: [
      { name: "title", label: "Заголовок" },
      { name: "text", label: "Текст", type: "textarea" },
    ]},
    { key: "showroom", title: "Наш шоурум", fields: [
      { name: "title", label: "Заголовок" },
      { name: "text", label: "Адрес / текст", type: "textarea" },
      { name: "button_text", label: "Текст кнопки" },
      { name: "button_link", label: "Ссылка на карты" },
    ]},
    { key: "consult", title: "Форма консультации", fields: [
      { name: "title", label: "Заголовок" },
      { name: "text", label: "Подзаголовок", type: "textarea" },
      { name: "button_text", label: "Текст кнопки" },
    ]},
  ];

  return (
    <div className="space-y-6">
      {BLOCKS.map((b) => {
        const v = draft[b.key] ?? {};
        return (
          <div key={b.key} className="rounded-2xl border border-border/60 bg-card p-5">
            <h2 className="font-display text-base font-semibold">{b.title}</h2>
            <div className="mt-4 space-y-3">
              {b.fields.map((f) => (
                <div key={f.name}>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea rows={3} value={v[f.name] ?? ""} onChange={(e) => setField(b.key, f.name, e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                  ) : f.type === "image" ? (
                    <div className="flex items-center gap-3">
                      {v[f.name] ? (
                        <div className="relative">
                          <img src={v[f.name]} className="h-24 w-32 rounded-xl object-cover" alt="" />
                          <button onClick={() => setField(b.key, f.name, "")} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
                        </div>
                      ) : null}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-xs text-muted-foreground hover:text-primary">
                        <Upload className="h-3.5 w-3.5" /> Загрузить
                        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f2 = e.target.files?.[0]; if (f2) uploadHero(b.key, f.name, f2); }} />
                      </label>
                    </div>
                  ) : (
                    <input value={v[f.name] ?? ""} onChange={(e) => setField(b.key, f.name, e.target.value)} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" />
                  )}
                </div>
              ))}
              {b.key === "showroom" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Фото шоурума</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                      <div key={i}>
                        <label className="mb-1 block text-xs text-muted-foreground">Фото {i + 1}</label>
                        {v.images?.[i] ? (
                          <div className="relative aspect-square">
                            <img src={v.images[i]} alt="" className="h-full w-full rounded-xl object-cover" />
                            <button onClick={() => setField("showroom", "images", (v.images || []).filter((_: any, j: number) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"><X className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs text-muted-foreground hover:text-primary">
                            <Upload className="h-4 w-4" /> Добавить
                            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f2 = e.target.files?.[0]; if (f2) uploadShowroomToIndex(f2, i); }} />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">На главной странице показываются первые 2 фото.</p>
                </div>
              )}
              <button onClick={() => save.mutate(b.key)} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Сохранить блок</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdvantagesEditor() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(aboutAdvantagesQuery);
  const add = useMutation({
    mutationFn: async () => { const { error } = await (supabase as any).from("about_advantages").insert({ icon: "star", title: "Новое преимущество", description: "", sort_order: rows.length * 10 + 10 }); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about_advantages"] }),
  });
  const upd = useMutation({
    mutationFn: async (r: any) => { const { error } = await (supabase as any).from("about_advantages").update({ icon: r.icon, title: r.title, description: r.description, sort_order: r.sort_order }).eq("id", r.id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about_advantages"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("about_advantages").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["about_advantages"] }),
  });

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="grid items-start gap-2 rounded-2xl border border-border/60 bg-card p-3 md:grid-cols-[100px_1fr_2fr_80px_auto]">
          <input defaultValue={r.icon} onBlur={(e) => upd.mutate({ ...r, icon: e.target.value })} placeholder="иконка" className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input defaultValue={r.title} onBlur={(e) => upd.mutate({ ...r, title: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input defaultValue={r.description} onBlur={(e) => upd.mutate({ ...r, description: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input type="number" defaultValue={r.sort_order} onBlur={(e) => upd.mutate({ ...r, sort_order: Number(e.target.value) })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <button onClick={() => del.mutate(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button onClick={() => add.mutate()} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"><Plus className="h-4 w-4" />Добавить преимущество</button>
    </div>
  );
}

function StatsEditor() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(aboutStatsQuery);
  const add = useMutation({ mutationFn: async () => { const { error } = await (supabase as any).from("about_stats").insert({ label: "новый показатель", value: "0", sort_order: rows.length * 10 + 10 }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["about_stats"] }) });
  const upd = useMutation({ mutationFn: async (r: any) => { const { error } = await (supabase as any).from("about_stats").update({ label: r.label, value: r.value, sort_order: r.sort_order }).eq("id", r.id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["about_stats"] }) });
  const del = useMutation({ mutationFn: async (id: string) => { const { error } = await (supabase as any).from("about_stats").delete().eq("id", id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["about_stats"] }) });
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="grid items-start gap-2 rounded-2xl border border-border/60 bg-card p-3 md:grid-cols-[1fr_1fr_80px_auto]">
          <input defaultValue={r.value} onBlur={(e) => upd.mutate({ ...r, value: e.target.value })} placeholder="значение" className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input defaultValue={r.label} onBlur={(e) => upd.mutate({ ...r, label: e.target.value })} placeholder="подпись" className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input type="number" defaultValue={r.sort_order} onBlur={(e) => upd.mutate({ ...r, sort_order: Number(e.target.value) })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <button onClick={() => del.mutate(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button onClick={() => add.mutate()} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"><Plus className="h-4 w-4" />Добавить</button>
    </div>
  );
}

function StepsEditor() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(aboutStepsQuery);
  const add = useMutation({ mutationFn: async () => { const { error } = await (supabase as any).from("about_steps").insert({ title: "Новый шаг", description: "", sort_order: rows.length * 10 + 10 }); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["about_steps"] }) });
  const upd = useMutation({ mutationFn: async (r: any) => { const { error } = await (supabase as any).from("about_steps").update({ title: r.title, description: r.description, sort_order: r.sort_order }).eq("id", r.id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["about_steps"] }) });
  const del = useMutation({ mutationFn: async (id: string) => { const { error } = await (supabase as any).from("about_steps").delete().eq("id", id); if (error) throw error; }, onSuccess: () => qc.invalidateQueries({ queryKey: ["about_steps"] }) });
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="grid items-start gap-2 rounded-2xl border border-border/60 bg-card p-3 md:grid-cols-[1fr_2fr_80px_auto]">
          <input defaultValue={r.title} onBlur={(e) => upd.mutate({ ...r, title: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input defaultValue={r.description} onBlur={(e) => upd.mutate({ ...r, description: e.target.value })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <input type="number" defaultValue={r.sort_order} onBlur={(e) => upd.mutate({ ...r, sort_order: Number(e.target.value) })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
          <button onClick={() => del.mutate(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button onClick={() => add.mutate()} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"><Plus className="h-4 w-4" />Добавить шаг</button>
    </div>
  );
}
