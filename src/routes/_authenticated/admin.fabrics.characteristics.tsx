import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fabricCharacteristicsQuery } from "@/lib/queries";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import type { FabricCharacteristicDef } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/admin/fabrics/characteristics")({
  component: AdminFabricChars,
});

function AdminFabricChars() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery(fabricCharacteristicsQuery);
  const [newLabel, setNewLabel] = useState("");

  const add = useMutation({
    mutationFn: async (label: string) => {
      const nextOrder = (items[items.length - 1]?.sort_order ?? 0) + 10;
      const { error } = await (supabase as any).from("fabric_characteristics").insert({ label: label.trim(), sort_order: nextOrder });
      if (error) throw error;
    },
    onSuccess: () => { setNewLabel(""); qc.invalidateQueries({ queryKey: ["fabric_characteristics"] }); toast.success("Добавлено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async (it: FabricCharacteristicDef) => {
      const { error } = await (supabase as any).from("fabric_characteristics").update({ label: it.label, sort_order: it.sort_order }).eq("id", it.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fabric_characteristics"] }); toast.success("Сохранено"); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("fabric_characteristics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fabric_characteristics"] }); toast.success("Удалено"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="max-w-3xl">
      <Link to="/admin/fabrics" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> К коллекциям
      </Link>
      <h1 className="mt-3 font-display text-2xl font-bold">Характеристики тканей</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Эти поля будут доступны в каждой коллекции. Пустые поля не показываются на сайте.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Например: Состав, Плотность, Износостойкость"
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          onKeyDown={(e) => { if (e.key === "Enter" && newLabel.trim()) add.mutate(newLabel); }}
        />
        <button
          onClick={() => newLabel.trim() && add.mutate(newLabel)}
          className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {items.map((it) => (
          <Row key={it.id} item={it} onSave={(patched) => save.mutate(patched)} onDel={() => { if (confirm(`Удалить «${it.label}»?`)) del.mutate(it.id); }} />
        ))}
        {items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Пока нет характеристик
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ item, onSave, onDel }: { item: FabricCharacteristicDef; onSave: (it: FabricCharacteristicDef) => void; onDel: () => void }) {
  const [label, setLabel] = useState(item.label);
  const [order, setOrder] = useState(item.sort_order);
  const dirty = label !== item.label || order !== item.sort_order;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-3">
      <input value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      <button onClick={() => onSave({ ...item, label, sort_order: order })} disabled={!dirty} className="rounded-lg p-2 text-primary hover:bg-primary/10 disabled:opacity-30"><Save className="h-4 w-4" /></button>
      <button onClick={onDel} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
