import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { homeSlidesQuery, heroSliderSettingsQuery, type HomeSlide } from "@/lib/pageBlocks";
import { uploadPhoto } from "@/lib/uploadPhoto";
import { HeroSlider } from "@/components/HeroSlider";
import { toast } from "sonner";
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/_authenticated/admin/home-slides")({
  component: Page,
});

const sb = supabase as any;

function Page() {
  const qc = useQueryClient();
  const { data: slides = [] } = useQuery(homeSlidesQuery);
  const { data: settings } = useQuery(heroSliderSettingsQuery);
  const [items, setItems] = useState<HomeSlide[]>([]);
  useEffect(() => { setItems(slides); }, [slides]);

  const saveSettings = useMutation({
    mutationFn: async (autoplay_seconds: number) => {
      const { error } = await sb.from("site_settings").upsert({
        key: "hero_slider",
        value: { autoplay_seconds },
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings", "hero_slider"] }),
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const save = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<HomeSlide> }) => {
      const { error } = await sb.from("home_slides").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["home_slides"] }),
  });

  const reorder = useMutation({
    mutationFn: async (list: HomeSlide[]) => {
      await Promise.all(
        list.map((s, i) => sb.from("home_slides").update({ sort_order: i + 1 }).eq("id", s.id)),
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["home_slides"] }),
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await sb.from("home_slides").insert({
        title: "Новый слайд",
        sort_order: items.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["home_slides"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("home_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["home_slides"] }),
  });

  function patch(id: string, partial: Partial<HomeSlide>) {
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, ...partial } : x)));
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
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Главный слайдер</h1>
          <p className="mt-1 text-sm text-muted-foreground">Перетаскивайте слайды для изменения порядка. Изменения сохраняются автоматически.</p>
        </div>
        <button onClick={() => add.mutate()} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Добавить слайд
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-6 space-y-3">
            {items.map((s) => (
              <SlideRow
                key={s.id}
                slide={s}
                onPatch={(p) => patch(s.id, p)}
                onSavePatch={(p) => { patch(s.id, p); save.mutate({ id: s.id, patch: p }); }}
                onDelete={() => del.mutate(s.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SlideRow({
  slide, onPatch, onSavePatch, onDelete,
}: {
  slide: HomeSlide;
  onPatch: (p: Partial<HomeSlide>) => void;
  onSavePatch: (p: Partial<HomeSlide>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [uploading, setUploading] = useState(false);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(f);
      onSavePatch({ image_url: url });
      toast.success("Фото загружено");
    } catch (err: any) {
      toast.error(err.message ?? "Ошибка загрузки");
    } finally { setUploading(false); }
  }

  function saveField<K extends keyof HomeSlide>(k: K, v: HomeSlide[K]) {
    onSavePatch({ [k]: v } as Partial<HomeSlide>);
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-2 cursor-grab text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
          {slide.image_url ? (
            <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">Нет фото</div>
          )}
        </div>
        <div className="grid flex-1 gap-2 md:grid-cols-2">
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Заголовок"
            value={slide.title} onChange={(e) => onPatch({ title: e.target.value })} onBlur={(e) => saveField("title", e.target.value)} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Подпись"
            value={slide.subtitle ?? ""} onChange={(e) => onPatch({ subtitle: e.target.value })} onBlur={(e) => saveField("subtitle", e.target.value)} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Текст кнопки"
            value={slide.button_text ?? ""} onChange={(e) => onPatch({ button_text: e.target.value })} onBlur={(e) => saveField("button_text", e.target.value)} />
          <input className="rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Ссылка кнопки, напр. /catalog"
            value={slide.button_link ?? ""} onChange={(e) => onPatch({ button_link: e.target.value })} onBlur={(e) => saveField("button_link", e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 text-xs">
            <Upload className="h-3.5 w-3.5" /> {uploading ? "..." : "Фото"}
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
          <button
            onClick={() => onSavePatch({ is_visible: !slide.is_visible })}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs"
          >
            {slide.is_visible ? <><Eye className="h-3.5 w-3.5" /> Виден</> : <><EyeOff className="h-3.5 w-3.5" /> Скрыт</>}
          </button>
          <button onClick={onDelete} className="inline-flex h-9 items-center gap-1 rounded-lg border border-destructive/40 px-3 text-xs text-destructive">
            <Trash2 className="h-3.5 w-3.5" /> Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
