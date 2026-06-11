import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { partnersContentQuery } from "@/lib/queries";
import { toast } from "sonner";

const FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "hero_title", label: "Заголовок hero" },
  { key: "hero_text", label: "Текст hero", multiline: true },
  { key: "hero_cta", label: "Кнопка hero" },
  { key: "partners_section_title", label: "Заголовок «Наши партнёры»" },
  { key: "apply_title", label: "Заголовок формы заявки" },
  { key: "apply_text", label: "Текст над формой заявки", multiline: true },
  { key: "apply_submit", label: "Кнопка формы" },
  { key: "apply_success", label: "Сообщение после отправки", multiline: true },
  { key: "turnkey_block_title", label: "Блок «Проверенные партнёры» — заголовок" },
  { key: "turnkey_block_text", label: "Блок «Проверенные партнёры» — текст", multiline: true },
  { key: "turnkey_block_cta", label: "Блок «Проверенные партнёры» — кнопка" },
];

export const Route = createFileRoute("/_authenticated/admin/partners/content")({
  component: AdminPartnersContent,
});

function AdminPartnersContent() {
  const qc = useQueryClient();
  const { data: content = {} } = useQuery(partnersContentQuery);

  const upd = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await (supabase as any).from("partners_content").upsert({ key, value });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["partners_content"] }); toast.success("Сохранено"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Тексты раздела «Партнёры»</h1>
      <div className="mt-6 grid gap-4">
        {FIELDS.map((f) => (
          <label key={f.key} className="block rounded-2xl border border-border/60 bg-card p-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{f.label}</span>
            {f.multiline ? (
              <textarea defaultValue={content[f.key] ?? ""} onBlur={(e) => upd.mutate({ key: f.key, value: e.target.value })} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[100px]" />
            ) : (
              <input defaultValue={content[f.key] ?? ""} onBlur={(e) => upd.mutate({ key: f.key, value: e.target.value })} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
