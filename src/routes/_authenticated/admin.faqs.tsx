import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { faqsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  component: AdminFaqs,
});

function AdminFaqs() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery(faqsQuery);
  const add = useMutation({
    mutationFn: async () => { const { error } = await (supabase as any).from("faqs").insert({ question: "Новый вопрос", answer: "", sort_order: rows.length * 10 + 10 }); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
  });
  const upd = useMutation({
    mutationFn: async (r: any) => { const { error } = await (supabase as any).from("faqs").update({ question: r.question, answer: r.answer, sort_order: r.sort_order }).eq("id", r.id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await (supabase as any).from("faqs").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faqs"] }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">FAQ</h1>
      <button onClick={() => add.mutate()} className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" />Добавить вопрос</button>

      <div className="mt-6 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border/60 bg-card p-4">
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <input defaultValue={r.question} placeholder="Вопрос" onBlur={(e) => upd.mutate({ ...r, question: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium" />
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={r.sort_order} onBlur={(e) => upd.mutate({ ...r, sort_order: Number(e.target.value) })} className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm" />
                <button onClick={() => del.mutate(r.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <textarea defaultValue={r.answer} placeholder="Ответ" rows={3} onBlur={(e) => upd.mutate({ ...r, answer: e.target.value })} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
