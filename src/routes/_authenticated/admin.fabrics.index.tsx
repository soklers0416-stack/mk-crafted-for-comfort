import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fabricsQuery, fabricCategoriesQuery } from "@/lib/queries";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/fabrics/")({
  component: AdminFabrics,
});

function AdminFabrics() {
  const qc = useQueryClient();
  const { data: fabrics = [] } = useQuery(fabricsQuery);
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("fabrics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fabrics"] }); toast.success("Удалено"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Ткани</h1>
          <p className="mt-1 text-sm text-muted-foreground">Всего: {fabrics.length}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/fabrics/categories" className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">Категории</Link>
          <Link to="/admin/fabrics/$id" params={{ id: "new" }} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Добавить ткань
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Образец</th>
              <th className="px-4 py-3 text-left">Название</th>
              <th className="px-4 py-3 text-left">Код</th>
              <th className="px-4 py-3 text-left">Категория</th>
              <th className="px-4 py-3 text-right">Доплата</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {fabrics.map((f) => {
              const cat = cats.find((c) => c.slug === f.category_slug);
              return (
                <tr key={f.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    {f.sample_photo ? <img src={f.sample_photo} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-surface-muted" />}
                  </td>
                  <td className="px-4 py-3 font-medium">{f.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat?.title ?? f.category_slug}</td>
                  <td className="px-4 py-3 text-right">{f.surcharge > 0 ? `+${f.surcharge} ₽` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to="/admin/fabrics/$id" params={{ id: f.id }} className="rounded-lg p-2 hover:bg-surface-muted"><Pencil className="h-4 w-4" /></Link>
                      <button onClick={() => { if (confirm(`Удалить "${f.title}"?`)) del.mutate(f.id); }} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {fabrics.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Пока нет тканей</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
