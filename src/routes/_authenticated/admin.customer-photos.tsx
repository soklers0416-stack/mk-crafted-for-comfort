import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { customerPhotosQuery } from "@/lib/queries";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/customer-photos")({
  component: AdminCustomerPhotos,
});

function AdminCustomerPhotos() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(customerPhotosQuery);
  const [busy, setBusy] = useState(false);

  const upd = useMutation({
    mutationFn: async (r: any) => { const { error } = await (supabase as any).from("customer_photos").update({ city: r.city, model: r.model, comment: r.comment, sort_order: r.sort_order }).eq("id", r.id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer_photos"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("customer_photos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customer_photos"] }),
  });

  async function onUpload(file: File) {
    setBusy(true);
    try {
      const url = await uploadPhoto(file);
      const { error } = await (supabase as any).from("customer_photos").insert({ photo: url, sort_order: rows.length * 10 + 10 });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["customer_photos"] });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Мебель у наших покупателей</h1>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
        <Upload className="h-4 w-4" /> {busy ? "Загрузка…" : "Загрузить фото"}
        <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
      </label>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <div key={r.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <img src={r.photo} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-2 p-3">
              <input defaultValue={r.city} placeholder="Город" onBlur={(e) => upd.mutate({ ...r, city: e.target.value })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
              <input defaultValue={r.model} placeholder="Модель" onBlur={(e) => upd.mutate({ ...r, model: e.target.value })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
              <textarea defaultValue={r.comment} placeholder="Комментарий (необязательно)" rows={2} onBlur={(e) => upd.mutate({ ...r, comment: e.target.value })} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
              <div className="flex items-center justify-between">
                <input type="number" defaultValue={r.sort_order} onBlur={(e) => upd.mutate({ ...r, sort_order: Number(e.target.value) })} className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <button onClick={() => { if (confirm("Удалить?")) del.mutate(r.id); }} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">Пока нет фото клиентов</p>}
      </div>
    </div>
  );
}
