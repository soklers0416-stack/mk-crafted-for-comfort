import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { productsQuery, categoriesQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { formatPriceRub } from "@/lib/db";
import type { Product } from "@/lib/db";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminProductsList,
});

function AdminProductsList() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [catFilter, setCatFilter] = useState<string>("");
  const filtered = useMemo(
    () => (catFilter ? products.filter((p) => p.category_slug === catFilter) : products),
    [products, catFilter],
  );

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Удалено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleSale = useMutation({
    mutationFn: async (p: Product) => {
      const { error } = await (supabase as any)
        .from("products").update({ sale_enabled: !p.sale_enabled }).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Товары</h1>
          <p className="mt-1 text-sm text-muted-foreground">Всего: {products.length}</p>
        </div>
        <Link
          to="/admin/products/$id" params={{ id: "new" }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Добавить товар
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Фото</th>
              <th className="px-4 py-3 text-left">Название</th>
              <th className="px-4 py-3 text-left">Категория</th>
              <th className="px-4 py-3 text-right">Цена</th>
              <th className="px-4 py-3 text-center">Акция</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cat = categories.find((c) => c.slug === p.category_slug);
              return (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    {p.photo1 ? (
                      <img src={p.photo1} alt="" className="h-12 w-12 rounded-lg object-cover bg-surface-muted" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-surface-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat?.title ?? p.category_slug}</td>
                  <td className="px-4 py-3 text-right">{formatPriceRub(p.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleSale.mutate(p)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        p.sale_enabled ? "bg-red-100 text-red-700" : "bg-surface-muted text-muted-foreground"
                      }`}
                    >
                      {p.sale_enabled ? "ВКЛ" : "выкл"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link to="/admin/products/$id" params={{ id: p.id }} className="rounded-lg p-2 hover:bg-surface-muted">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => { if (confirm(`Удалить "${p.title}"?`)) del.mutate(p.id); }}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Пока нет товаров</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
