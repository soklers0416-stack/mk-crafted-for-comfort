import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { apartmentDiscountsQuery, type ApartmentDiscount } from "@/lib/apartment";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/apartment/discounts")({
  component: ApartmentDiscounts,
});

function ApartmentDiscounts() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery(apartmentDiscountsQuery);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["apartment_discounts"] });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("apartment_discounts").insert({
        title: "Новая скидка", description: "", min_items: 3, min_amount: 100000, percent: 3, sort_order: list.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async (row: Partial<ApartmentDiscount> & { id: string }) => {
      const { id, ...rest } = row;
      const { error } = await (supabase as any).from("apartment_discounts").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("apartment_discounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Скидки квартиры под ключ</h2>
        <button onClick={() => create.mutate()} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Добавить правило
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {list.map((d) => <DiscountRow key={d.id} row={d} onSave={update.mutate} onDelete={() => { if (confirm("Удалить правило?")) remove.mutate(d.id); }} />)}
        {list.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Правил пока нет.</p>}
      </div>
    </div>
  );
}

function DiscountRow({ row, onSave, onDelete }: { row: ApartmentDiscount; onSave: (r: Partial<ApartmentDiscount> & { id: string }) => void; onDelete: () => void }) {
  const [d, setD] = useState(row);
  const dirty = JSON.stringify(d) !== JSON.stringify(row);
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Название акции">
          <input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={input} />
        </Field>
        <Field label="Процент скидки">
          <input type="number" value={d.percent} onChange={(e) => setD({ ...d, percent: +e.target.value })} className={input} />
        </Field>
        <Field label="Количество товаров (от)">
          <input type="number" value={d.min_items} onChange={(e) => setD({ ...d, min_items: +e.target.value })} className={input} />
        </Field>
        <Field label="Минимальная сумма, ₽">
          <input type="number" value={d.min_amount} onChange={(e) => setD({ ...d, min_amount: +e.target.value })} className={input} />
        </Field>
        <Field label="Описание (необязательно)" className="sm:col-span-2">
          <input value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className={input} />
        </Field>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={onDelete} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        <button onClick={() => onSave(d)} disabled={!dirty}
          className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground disabled:opacity-50">
          Сохранить
        </button>
      </div>
    </div>
  );
}

const input = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
