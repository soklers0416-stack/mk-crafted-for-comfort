import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GripVertical, Plus, Trash2, Eye, EyeOff, Upload, X, ArrowLeft, ImagePlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { pageBlocksQuery, PAGE_KEYS, type PageBlock } from "@/lib/pageBlocks";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { toast } from "sonner";
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/_authenticated/admin/page-blocks/$pageKey")({
  component: Page,
});

const sb = supabase as any;

const KIND_LABEL: Record<string, string> = {
  "hero-banner": "Верхний баннер",
  "text-image": "Текст + фото",
  "gallery": "Галерея фото",
  "cta": "Призыв к действию",
  "system": "Системная секция",
};

function Page() {
  const { pageKey } = Route.useParams();
  const pageMeta = PAGE_KEYS.find((p) => p.key === pageKey);
  const qc = useQueryClient();
  const { data: blocks = [] } = useQuery(pageBlocksQuery(pageKey));
  const [items, setItems] = useState<PageBlock[]>([]);
  useEffect(() => { setItems(blocks); }, [blocks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const save = useMutation({
    mutationFn: async (b: PageBlock) => {
      const { id, ...rest } = b;
      const { error } = await sb.from("page_blocks").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_blocks", pageKey] }),
  });

  const reorder = useMutation({
    mutationFn: async (list: PageBlock[]) => {
      await Promise.all(list.map((b, i) => sb.from("page_blocks").update({ sort_order: i }).eq("id", b.id)));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_blocks", pageKey] }),
  });

  const add = useMutation({
    mutationFn: async (kind: string) => {
      const { error } = await sb.from("page_blocks").insert({
        page_key: pageKey, kind, sort_order: items.length, title: "Новый блок",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_blocks", pageKey] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("page_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["page_blocks", pageKey] }),
  });

  function patch(id: string, partial: Partial<PageBlock>) {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...partial } : x)));
  }

  function onDragEnd(e: any) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(items, items.findIndex((x) => x.id === active.id), items.findIndex((x) => x.id === over.id));
    setItems(next);
    reorder.mutate(next);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <Link to="/admin/page-blocks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Все страницы
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{pageMeta?.label ?? pageKey}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Перетаскивайте блоки для изменения порядка. Скрытые блоки не показываются на сайте. Системные секции редактируются на своих экранах.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => add.mutate("text-image")} className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Текст + фото</button>
          <button onClick={() => add.mutate("gallery")} className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> Галерея</button>
          <button onClick={() => add.mutate("cta")} className="inline-flex h-9 items-center gap-1 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> CTA</button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-6 space-y-3">
            {items.map((b) => (
              <BlockRow
                key={b.id}
                block={b}
                onPatch={(p) => patch(b.id, p)}
                onSave={() => save.mutate(items.find((x) => x.id === b.id)!)}
                onDelete={() => del.mutate(b.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function BlockRow({
  block, onPatch, onSave, onDelete,
}: {
  block: PageBlock;
  onPatch: (p: Partial<PageBlock>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [expanded, setExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isSystem = block.kind === "system";

  async function onUploadMain(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    try { const url = await uploadPhoto(f); onPatch({ image_url: url }); setTimeout(onSave, 50); toast.success("Загружено"); }
    catch (err: any) { toast.error(err.message ?? "Ошибка"); } finally { setUploading(false); }
  }

  async function onUploadGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadPhoto));
      const next = [...block.gallery, ...urls];
      onPatch({ gallery: next }); setTimeout(onSave, 50);
      toast.success(`Загружено: ${urls.length}`);
    } catch (err: any) { toast.error(err.message ?? "Ошибка"); } finally { setUploading(false); }
  }

  function removeFromGallery(i: number) {
    const next = block.gallery.filter((_, idx) => idx !== i);
    onPatch({ gallery: next }); setTimeout(onSave, 50);
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium">{KIND_LABEL[block.kind] ?? block.kind}</span>
            {isSystem && <span className="text-muted-foreground">контент на отдельном экране админки</span>}
          </div>
          <div className="mt-1 text-sm font-medium">{block.title || "(без заголовка)"}</div>
        </div>
        <button
          onClick={() => { onPatch({ is_visible: !block.is_visible }); setTimeout(onSave, 50); }}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs"
        >
          {block.is_visible ? <><Eye className="h-3.5 w-3.5" /> Виден</> : <><EyeOff className="h-3.5 w-3.5" /> Скрыт</>}
        </button>
        {!isSystem && (
          <>
            <button onClick={() => setExpanded((x) => !x)} className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs">
              {expanded ? "Свернуть" : "Изменить"}
            </button>
            <button onClick={onDelete} className="inline-flex h-9 items-center gap-1 rounded-lg border border-destructive/40 px-3 text-xs text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {!isSystem && expanded && (
        <div className="space-y-3 border-t border-border p-4">
          <div className="grid gap-2 md:grid-cols-2">
            <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Заголовок"
              value={block.title ?? ""} onChange={(e) => onPatch({ title: e.target.value })} onBlur={onSave} />
            <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Подзаголовок"
              value={block.subtitle ?? ""} onChange={(e) => onPatch({ subtitle: e.target.value })} onBlur={onSave} />
          </div>
          <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" rows={4} placeholder="Текст"
            value={block.body ?? ""} onChange={(e) => onPatch({ body: e.target.value })} onBlur={onSave} />
          <div className="grid gap-2 md:grid-cols-2">
            <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Текст кнопки"
              value={block.button_text ?? ""} onChange={(e) => onPatch({ button_text: e.target.value })} onBlur={onSave} />
            <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Ссылка кнопки"
              value={block.button_link ?? ""} onChange={(e) => onPatch({ button_link: e.target.value })} onBlur={onSave} />
          </div>

          {block.kind !== "gallery" && block.kind !== "cta" && (
            <div className="flex items-center gap-3">
              {block.image_url && (
                <div className="relative h-20 w-28 overflow-hidden rounded-lg bg-surface-muted">
                  <img src={block.image_url} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => { onPatch({ image_url: null }); setTimeout(onSave, 50); }}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 text-xs">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "..." : "Загрузить фото"}
                <input type="file" accept="image/*" className="hidden" onChange={onUploadMain} />
              </label>
            </div>
          )}

          {block.kind === "gallery" && (
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">Галерея ({block.gallery.length})</div>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                {block.gallery.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removeFromGallery(i)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="grid aspect-square cursor-pointer place-items-center rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  <ImagePlus className="h-5 w-5" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onUploadGallery} />
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
