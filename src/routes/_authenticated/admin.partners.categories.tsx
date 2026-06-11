import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { partnerCategoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/partners/categories")({
  component: AdminPartnerCategories,
});

function AdminPartnerCategories() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(partnerCategoriesQuery);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["partner_categories"] });

  const add = useMutation({
    mutationFn: async () => {
      const slug = `cat-${Date.now()}`;
      const { error } = await (supabase as any).from("partner_categories").insert({ slug, title: "Новая категория", sort_order: rows.length * 10 + 10 });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const upd = useMutation({
    mutationFn: async (r: any) => { const { error } = await (supabase as any).from("partner_categories").update({ slug: r.slug, title: r.title, sort_order: r.sort_order }).eq("id", r.id); if (error) throw error; },
    onSuccess: invalidate,
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("partner_categories").delete().eq("id", id); if (error) throw error; },
    onSuccess: invalidate,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Категории партнёров</h1>
        <button onClick={() => add.mutate()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" />Добавить
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="grid items-center gap-2 rounded-2xl border border-border/60 bg-card p-3 md:grid-cols-[1fr_1fr_100px_auto]">
            <input defaultValue={r.title} placeholder="Название" onBlur={(e) => upd.mutate({ ...r, title: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium" />
            <input defaultValue={r.slug} placeholder="slug" onBlur={(e) => upd.mutate({ ...r, slug: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono" />
            <input type="number" defaultValue={r.sort_order} onBlur={(e) => upd.mutate({ ...r, sort_order: Number(e.target.value) })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={() => { if (confirm("Удалить категорию?")) del.mutate(r.id); }} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
