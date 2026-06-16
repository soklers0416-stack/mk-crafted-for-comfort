import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { navItemsQuery, type NavItem } from "@/lib/queries";
import { toast } from "sonner";
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/_authenticated/admin/nav")({
  component: NavAdmin,
});

const sb = supabase as any;

function NavAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(navItemsQuery);
  const [items, setItems] = useState<NavItem[]>([]);
  useEffect(() => { setItems(data); }, [data]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["nav_items"] });
  };

  const reorder = useMutation({
    mutationFn: async (list: NavItem[]) => {
      await Promise.all(
        list.map((it, i) => sb.from("nav_items").update({ sort_order: (i + 1) * 10 }).eq("id", it.id)),
      );
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const savePatch = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<NavItem> }) => {
      const { error } = await sb.from("nav_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from("nav_items").insert({
        label: "Новый пункт",
        href: "/",
        sort_order: (items.length + 1) * 10,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("nav_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: any) => toast.error(e.message),
  });

  function patch(id: string, p: Partial<NavItem>) {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }

  function onDragEnd(e: any) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((x) => x.id === active.id);
    const newIndex = items.findIndex((x) => x.id === over.id);
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorder.mutate(next);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Меню сайта (шапка)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Перетаскивайте пункты для изменения порядка. Названия и ссылки сохраняются автоматически по выходу из поля.
          </p>
        </div>
        <button onClick={() => add.mutate()} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Добавить пункт
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((it) => (
              <Row
                key={it.id}
                item={it}
                onLocalPatch={(p) => patch(it.id, p)}
                onSave={(p) => { patch(it.id, p); savePatch.mutate({ id: it.id, patch: p }); }}
                onDelete={() => { if (confirm(`Удалить пункт «${it.label}»?`)) del.mutate(it.id); }}
              />
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Пока нет пунктов. Добавьте первый.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-muted-foreground">
        Подсказка: ссылка должна начинаться с «/» (например, <code>/catalog</code>) и совпадать с существующей страницей сайта.
      </p>
    </div>
  );
}

function Row({
  item, onLocalPatch, onSave, onDelete,
}: {
  item: NavItem;
  onLocalPatch: (p: Partial<NavItem>) => void;
  onSave: (p: Partial<NavItem>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground active:cursor-grabbing" aria-label="Перетащить">
        <GripVertical className="h-5 w-5" />
      </button>
      <input
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder="Название"
        value={item.label}
        onChange={(e) => onLocalPatch({ label: e.target.value })}
        onBlur={(e) => { if (e.target.value !== item.label) {} onSave({ label: e.target.value }); }}
      />
      <input
        className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
        placeholder="/path"
        value={item.href}
        onChange={(e) => onLocalPatch({ href: e.target.value })}
        onBlur={(e) => onSave({ href: e.target.value })}
      />
      <button
        onClick={() => onSave({ is_visible: !item.is_visible })}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs"
        title={item.is_visible ? "Скрыть" : "Показать"}
      >
        {item.is_visible ? <><Eye className="h-3.5 w-3.5" /> Виден</> : <><EyeOff className="h-3.5 w-3.5" /> Скрыт</>}
      </button>
      <button onClick={onDelete} className="inline-flex h-9 items-center gap-1 rounded-lg border border-destructive/40 px-3 text-xs text-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
