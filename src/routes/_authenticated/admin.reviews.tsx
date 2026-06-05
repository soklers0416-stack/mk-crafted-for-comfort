import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery(reviewsQuery);
  const [draft, setDraft] = useState({ name: "", source: "Яндекс", rating: 5, text: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("reviews").insert({
        ...draft, sort_order: reviews.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reviews"] }); setDraft({ name: "", source: "Яндекс", rating: 5, text: "" }); toast.success("Добавлено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("reviews").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Отзывы</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <button onClick={() => { if (confirm("Удалить отзыв?")) del.mutate(r.id); }}
                className="text-red-600 hover:bg-red-50 rounded p-1"><Trash2 className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 text-sm">«{r.text}»</p>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{r.name}</span><span>{r.source}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-base font-semibold">Добавить отзыв</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input placeholder="Имя" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input placeholder="Источник (VK / Яндекс…)" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
          </select>
        </div>
        <textarea placeholder="Текст отзыва" value={draft.text} rows={3}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={() => create.mutate()}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>
    </div>
  );
}
