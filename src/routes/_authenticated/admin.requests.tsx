import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RequestRow } from "@/lib/db";
import { Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  component: AdminRequests,
});

function AdminRequests() {
  const qc = useQueryClient();
  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: async (): Promise<RequestRow[]> => {
      const { data, error } = await (supabase as any)
        .from("requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase as any).from("requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("requests").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["requests"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Заявки с сайта</h1>
      <p className="mt-1 text-sm text-muted-foreground">Всего: {requests.length}</p>

      <div className="mt-6 space-y-3">
        {requests.map((r) => (
          <div key={r.id} className={`rounded-2xl border bg-card p-5 ${r.status === "done" ? "opacity-60 border-border/40" : "border-border/60"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-display text-base font-semibold">{r.title || r.source}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("ru-RU")} · {r.source}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus.mutate({ id: r.id, status: r.status === "done" ? "new" : "done" })}
                  className={`inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium ${
                    r.status === "done" ? "bg-surface-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" /> {r.status === "done" ? "Возобновить" : "Обработано"}
                </button>
                <button onClick={() => { if (confirm("Удалить заявку?")) del.mutate(r.id); }}
                  className="text-red-600 hover:bg-red-50 rounded-lg p-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
              {Object.entries(r.data ?? {}).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="text-muted-foreground">{k}:</dt>
                  <dd className="font-medium">{String(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">Пока нет заявок.</p>
        )}
      </div>
    </div>
  );
}
