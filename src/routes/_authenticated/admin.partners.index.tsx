import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Eye, EyeOff, Trash2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { partnersQuery, partnerCategoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/partners/")({
  component: AdminPartnersList,
});

function AdminPartnersList() {
  const qc = useQueryClient();
  const { data: partners = [] } = useQuery(partnersQuery);
  const { data: categories = [] } = useQuery(partnerCategoriesQuery);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["partners"] });

  const add = useMutation({
    mutationFn: async () => {
      const { data, error } = await (supabase as any)
        .from("partners")
        .insert({ title: "Новый партнёр", category_slug: categories[0]?.slug ?? "other", sort_order: partners.length * 10 + 10 })
        .select("id").single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: (id) => { invalidate(); window.location.href = `/admin/partners/${id}`; },
  });
  const toggleActive = useMutation({
    mutationFn: async (p: any) => { const { error } = await (supabase as any).from("partners").update({ is_active: !p.is_active }).eq("id", p.id); if (error) throw error; },
    onSuccess: invalidate,
  });
  const updOrder = useMutation({
    mutationFn: async ({ id, sort_order }: { id: string; sort_order: number }) => { const { error } = await (supabase as any).from("partners").update({ sort_order }).eq("id", id); if (error) throw error; },
    onSuccess: invalidate,
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("partners").delete().eq("id", id); if (error) throw error; },
    onSuccess: invalidate,
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Партнёры</h1>
        <button onClick={() => add.mutate()} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" />Добавить партнёра
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {partners.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Пока нет ни одного партнёра.
          </p>
        )}
        {partners.map((p) => {
          const cat = categories.find((c) => c.slug === p.category_slug);
          return (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              {p.logo || p.main_photo ? (
                <img src={p.logo || p.main_photo!} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-surface-muted" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{p.title}</div>
                <div className="truncate text-xs text-muted-foreground">{cat?.title || p.category_slug}</div>
              </div>
              <input
                type="number"
                defaultValue={p.sort_order}
                onBlur={(e) => updOrder.mutate({ id: p.id, sort_order: Number(e.target.value) })}
                className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
              <button onClick={() => toggleActive.mutate(p)} className={`grid h-9 w-9 place-items-center rounded-lg ${p.is_active ? "bg-primary/10 text-primary" : "bg-surface-muted text-muted-foreground"}`} title={p.is_active ? "Скрыть" : "Показать"}>
                {p.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <Link to="/admin/partners/$id" params={{ id: p.id }} className="grid h-9 w-9 place-items-center rounded-lg text-primary hover:bg-primary/10">
                <Pencil className="h-4 w-4" />
              </Link>
              <button onClick={() => { if (confirm("Удалить партнёра?")) del.mutate(p.id); }} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
