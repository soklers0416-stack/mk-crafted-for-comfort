import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { normalizePhotoUrl } from "@/lib/photoUrls";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [newCat, setNewCat] = useState({ slug: "", title: "" });

  const create = useMutation({
    mutationFn: async () => {
      if (!newCat.slug || !newCat.title) throw new Error("Заполните slug и название");
      const { error } = await (supabase as any).from("categories").insert({
        slug: newCat.slug, title: newCat.title, sort_order: categories.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); setNewCat({ slug: "", title: "" }); toast.success("Добавлено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await (supabase as any).from("categories").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Удалено"); },
    onError: (e: any) => toast.error(e.message),
  });

  async function uploadImage(catId: string, file: File) {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `category-${catId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-photos").upload(path, file, { contentType: file.type });
    if (error) return toast.error(error.message);
    update.mutate({ id: catId, patch: { image_url: normalizePhotoUrl(path) } });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Категории</h1>
      <p className="mt-1 text-sm text-muted-foreground">Slug — это идентификатор в URL. Удаление категории, в которой есть товары, заблокировано.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-surface-muted">
              {c.image_url ? (
                <>
                  <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => update.mutate({ id: c.id, patch: { image_url: null } })}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <label className="flex h-full w-full cursor-pointer items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary">
                  <Upload className="h-4 w-4" /> Загрузить фото
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(c.id, f); }} />
                </label>
              )}
            </div>
            <input
              defaultValue={c.title}
              onBlur={(e) => { if (e.target.value !== c.title) update.mutate({ id: c.id, patch: { title: e.target.value } }); }}
              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
            />
            <div className="mt-1 flex items-center justify-between">
              <code className="text-xs text-muted-foreground">{c.slug}</code>
              <button onClick={() => { if (confirm(`Удалить "${c.title}"?`)) del.mutate(c.id); }}
                className="text-red-600 hover:bg-red-50 rounded p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-base font-semibold">Новая категория</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
          <input placeholder="slug (англ., напр. sofas)" value={newCat.slug}
            onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input placeholder="Название" value={newCat.title}
            onChange={(e) => setNewCat({ ...newCat, title: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <button onClick={() => create.mutate()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            <Plus className="h-4 w-4" /> Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
