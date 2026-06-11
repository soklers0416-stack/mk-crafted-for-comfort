import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apartmentCategoriesQuery, type ApartmentCategory } from "@/lib/apartment";
import { categoriesQuery } from "@/lib/queries";
import { toast } from "sonner";
import { Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/apartment/categories")({
  component: ApartmentCats,
});

function ApartmentCats() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery(apartmentCategoriesQuery);
  const { data: catalogCats = [] } = useQuery(categoriesQuery);
  const [newTitle, setNewTitle] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["apartment_categories"] });

  const create = useMutation({
    mutationFn: async () => {
      if (!newTitle.trim()) return;
      const { error } = await (supabase as any).from("apartment_categories").insert({
        title: newTitle.trim(), sort_order: cats.length + 1, product_category_slugs: [],
      });
      if (error) throw error;
    },
    onSuccess: () => { setNewTitle(""); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<ApartmentCategory> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await (supabase as any).from("apartment_categories").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("apartment_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    await update.mutateAsync({ id: cats[idx].id, sort_order: cats[j].sort_order });
    await update.mutateAsync({ id: cats[j].id, sort_order: cats[idx].sort_order });
  }

  return (
    <div className="max-w-4xl">
      <h2 className="font-display text-xl font-semibold">Категории комплекта</h2>
      <p className="mt-1 text-sm text-muted-foreground">Привяжите категории каталога — товары появятся в выборе.</p>

      <div className="mt-5 flex gap-2">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Название новой категории"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
        <button onClick={() => create.mutate()} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {cats.map((c, idx) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                defaultValue={c.title}
                onBlur={(e) => e.target.value !== c.title && update.mutate({ id: c.id, title: e.target.value })}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                multiple value={c.product_category_slugs}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                  update.mutate({ id: c.id, product_category_slugs: selected });
                }}
                className="min-h-[42px] rounded-xl border border-border bg-background px-3 py-1.5 text-sm"
                size={3}
              >
                {catalogCats.map((cc) => <option key={cc.slug} value={cc.slug}>{cc.title}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <button onClick={() => move(idx, -1)} className="rounded-lg p-1.5 hover:bg-surface-muted"><ChevronUp className="h-4 w-4" /></button>
                <button onClick={() => move(idx, 1)} className="rounded-lg p-1.5 hover:bg-surface-muted"><ChevronDown className="h-4 w-4" /></button>
                <button onClick={() => { if (confirm("Удалить категорию?")) remove.mutate(c.id); }}
                  className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Удерживайте Ctrl/Cmd для выбора нескольких категорий каталога.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
