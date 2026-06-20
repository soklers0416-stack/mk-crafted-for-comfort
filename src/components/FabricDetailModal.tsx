import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  fabricColorsByCollectionQuery,
  fabricCharacteristicsQuery,
  fabricCategoriesQuery,
} from "@/lib/queries";
import type { Fabric } from "@/lib/db";

export function FabricDetailModal({
  fabric,
  onClose,
}: {
  fabric: Fabric | null;
  onClose: () => void;
}) {
  const open = !!fabric;
  const { data: colors = [] } = useQuery({
    ...fabricColorsByCollectionQuery(fabric?.id ?? ""),
    enabled: open,
  });
  const { data: charDefs = [] } = useQuery(fabricCharacteristicsQuery);
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!fabric) return null;
  const cat = cats.find((c) => c.slug === fabric.category_slug);

  // Render characteristics in defined order, then any extras present on the fabric
  const orderedLabels = charDefs.map((d) => d.label);
  const extra = Object.keys(fabric.characteristics || {}).filter((k) => !orderedLabels.includes(k));
  const allLabels = [...orderedLabels, ...extra];
  const charsList = allLabels
    .map((label) => ({ label, value: (fabric.characteristics || {})[label] }))
    .filter((c) => c.value && String(c.value).trim() !== "");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-background p-6 shadow-2xl animate-scale-in md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-surface-muted hover:bg-surface transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            {fabric.sample_photo ? (
              <img
                src={fabric.sample_photo}
                alt={fabric.title}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="aspect-square w-full rounded-2xl bg-surface-muted" />
            )}
          </div>
          <div>
            {cat && (
              <p className="text-sm font-medium uppercase tracking-wider text-primary">
                {cat.title}
              </p>
            )}
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{fabric.title}</h2>
            {fabric.description && (
              <p className="mt-4 text-base text-muted-foreground">{fabric.description}</p>
            )}

            {charsList.length > 0 && (
              <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm">
                {charsList.map((c) => (
                  <div
                    key={c.label}
                    className="flex justify-between gap-3 border-b border-dashed py-2"
                  >
                    <dt className="text-muted-foreground">{c.label}</dt>
                    <dd className="text-right font-medium">{c.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {fabric.recommendations && (
              <div className="mt-5 rounded-2xl bg-primary/5 p-4 text-sm">
                <div className="font-semibold">Подходит для</div>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">
                  {fabric.recommendations}
                </p>
              </div>
            )}
          </div>
        </div>

        {colors.length > 0 && (
          <section className="mt-10">
            <h3 className="font-display text-xl font-bold">Цвета коллекции</h3>
            <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {colors.map((color) => (
                <div key={color.id} className="group cursor-pointer text-center">
                  <div className="aspect-square overflow-hidden rounded-2xl bg-surface-muted transition-all duration-300 group-hover:scale-110 group-hover:shadow-card">
                    {color.photo ? (
                      <img
                        src={color.photo}
                        alt={color.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs font-medium leading-tight">{color.name}</p>
                  {color.code && (
                    <p className="text-[11px] text-muted-foreground">{color.code}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
