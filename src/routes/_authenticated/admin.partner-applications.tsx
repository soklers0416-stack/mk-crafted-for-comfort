import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { partnerApplicationsQuery, partnerCategoriesQuery } from "@/lib/queries";

const STATUS_OPTIONS = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Обработана" },
  { value: "rejected", label: "Отклонена" },
];

export const Route = createFileRoute("/_authenticated/admin/partner-applications")({
  component: AdminPartnerApplications,
});

function AdminPartnerApplications() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(partnerApplicationsQuery);
  const { data: cats = [] } = useQuery(partnerCategoriesQuery);

  const upd = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("partner_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner_applications"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("partner_applications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner_applications"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Заявки на сотрудничество</h1>
      <p className="mt-2 text-sm text-muted-foreground">Всего: {rows.length}</p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Пока нет заявок.
          </p>
        )}
        {rows.map((r) => {
          const cat = cats.find((c) => c.slug === r.category_slug);
          return (
            <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-semibold">{r.name}{r.company && <span className="text-muted-foreground"> · {r.company}</span>}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("ru-RU")}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={r.status} onChange={(e) => upd.mutate({ id: r.id, status: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <button onClick={() => { if (confirm("Удалить заявку?")) del.mutate(r.id); }} className="grid h-9 w-9 place-items-center rounded-lg text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                {r.phone && <div><span className="text-muted-foreground">Телефон:</span> <a href={`tel:${r.phone}`} className="text-primary hover:underline">{r.phone}</a></div>}
                {r.email && <div><span className="text-muted-foreground">Email:</span> <a href={`mailto:${r.email}`} className="text-primary hover:underline">{r.email}</a></div>}
                {r.website && <div className="md:col-span-2"><span className="text-muted-foreground">Сайт/соцсети:</span> {r.website}</div>}
                {cat && <div><span className="text-muted-foreground">Категория:</span> {cat.title}</div>}
              </div>
              {r.comment && <p className="mt-3 rounded-xl bg-surface-muted p-3 text-sm whitespace-pre-line">{r.comment}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
