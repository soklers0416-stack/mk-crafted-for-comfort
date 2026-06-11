import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fabricCategoriesQuery } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/fabrics/categories")({
  component: AdminFabricCats,
});

function AdminFabricCats() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const [slug, setSlug] = useState(""); const [title, setTitle] = useState("");

  const add = useMutation({
    mutationFn: async () => {
      if (!slug.trim() || !title.trim()) throw new Error("Заполните slug и название");
      const { error } = await (supabase as any).from("fabric_categories").insert({ slug, title, sort_order: cats.length * 10 + 10 });
      if (error) throw error;
    },
    onSuccess: () => { setSlug(""); setTitle(""); qc.invalidateQueries({ queryKey: ["fabric_categories"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const upd = useMutation({
    mutationFn: async (c: { id: string; title: string; sort_order: number }) => {
      const { error } = await (supabase as any).from("fabric_categories").update({ title: c.title, sort_order: c.sort_order }).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fabric_categories"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("fabric_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fabric_categories"] }),
  });

  return (
    <div>
      <Link to="/admin/fabrics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> К тканям</Link>
      <h1 className="mt-3 font-display text-2xl font-bold">Категории тканей</h1>

      <div className="mt-6 grid gap-4 rounded-2xl border border-border/60 bg-card p-5 sm:grid-cols-[1fr_2fr_auto]">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (латиницей)" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={() => add.mutate()} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Добавить</button>
      </div>

      <ul className="mt-6 space-y-2">
        {cats.map((c) => (
          <li key={c.id} className="grid items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 sm:grid-cols-[100px_1fr_100px_auto]">
            <span className="text-xs text-muted-foreground">{c.slug}</span>
            <input defaultValue={c.title} onBlur={(e) => upd.mutate({ id: c.id, title: e.target.value, sort_order: c.sort_order })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
            <input type="number" defaultValue={c.sort_order} onBlur={(e) => upd.mutate({ id: c.id, title: c.title, sort_order: Number(e.target.value) })} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
            <button onClick={() => { if (confirm(`Удалить "${c.title}"?`)) del.mutate(c.id); }} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
