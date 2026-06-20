import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Layers,
  Scale,
  Activity,
  Sparkles,
  Droplet,
  Sun,
  Shield,
  Circle,
  Sofa,
  Bed,
  Baby,
  Home,
  Armchair,
  DoorOpen,
  PawPrint,
  Droplets,
  Check,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  fabricCharacteristicsQuery,
  fabricCategoriesQuery,
} from "@/lib/queries";
import type { Fabric } from "@/lib/db";

function iconForChar(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes("состав")) return Layers;
  if (l.includes("плотн")) return Scale;
  if (l.includes("износ") || l.includes("мартин")) return Activity;
  if (l.includes("уход") || l.includes("чист")) return Sparkles;
  if (l.includes("вод") || l.includes("влаг")) return Droplet;
  if (l.includes("свет") || l.includes("выгор")) return Sun;
  if (l.includes("защит") || l.includes("антиког")) return Shield;
  return Circle;
}

function iconForRecommendation(text: string): LucideIcon {
  const l = text.toLowerCase();
  if (l.includes("гостин")) return Sofa;
  if (l.includes("спальн")) return Bed;
  if (l.includes("дет")) return Baby;
  if (l.includes("кресл")) return Armchair;
  if (l.includes("прихож") || l.includes("кориод")) return DoorOpen;
  return Home;
}

export function FabricDetailModal({
  fabric,
  onClose,
}: {
  fabric: Fabric | null;
  onClose: () => void;
}) {
  const open = !!fabric;
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

  // Only render characteristics that still exist in admin definitions AND have a value.
  const charsList = charDefs
    .map((d) => ({ label: d.label, value: (fabric.characteristics || {})[d.label] }))
    .filter((c) => c.value !== undefined && c.value !== null && String(c.value).trim() !== "");
  const flagChars: { label: string; Icon: typeof PawPrint }[] = [];
  if (fabric.allow_pets) flagChars.push({ label: "Домашние животные", Icon: PawPrint });
  if (fabric.washable) flagChars.push({ label: "Можно мыть", Icon: Droplets });
  const hasChars = charsList.length > 0 || flagChars.length > 0;


  const recList = (fabric.recommendations || "")
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-2 sm:p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-background shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background transition shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[95vh] overflow-y-auto md:grid-cols-2">
          {/* Left: full-bleed image */}
          <div className="bg-surface-muted md:sticky md:top-0 md:h-[95vh]">
            {fabric.sample_photo ? (
              <img
                src={fabric.sample_photo}
                alt={fabric.title}
                className="h-64 w-full object-cover md:h-full"
              />
            ) : (
              <div className="h-64 w-full md:h-full" />
            )}
          </div>

          {/* Right: content */}
          <div className="p-6 md:p-10">
            {cat && (
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {cat.title}
              </p>
            )}
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {fabric.title}
            </h2>
            {fabric.description && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {fabric.description}
              </p>
            )}

            {(hasChars || recList.length > 0) && (
              <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto_1fr] sm:items-start">
                {hasChars ? (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
                      Характеристики
                    </h3>
                    <ul className="mt-4 flex flex-col gap-3">
                      {charsList.map((c) => {
                        const Icon = iconForChar(c.label);
                        return (
                          <li key={c.label} className="flex items-start gap-3 text-sm">
                            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="leading-6">
                              <span className="text-muted-foreground">{c.label}: </span>
                              <span className="font-medium text-foreground">{c.value}</span>
                            </span>
                          </li>
                        );
                      })}
                      {flagChars.map(({ label, Icon }) => (
                        <li key={label} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="font-medium leading-6 text-foreground">{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : <div />}

                {hasChars && recList.length > 0 && (
                  <div className="hidden sm:block h-full w-px self-stretch bg-border" aria-hidden />
                )}

                {recList.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">
                      Подходит для
                    </h3>
                    <ul className="mt-4 flex flex-col gap-3">
                      {recList.map((r) => {
                        const Icon = iconForRecommendation(r);
                        return (
                          <li key={r} className="flex items-center gap-3 text-sm">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="font-medium text-foreground">{r}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {(fabric.pros?.trim() || fabric.cons?.trim()) && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {fabric.pros?.trim() && (
                  <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-800">
                      <Check className="h-4 w-4" /> Преимущества
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                      {fabric.pros.split(/\n+/).map((s) => s.trim()).filter(Boolean).map((s, i) => (
                        <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-600" /><span>{s}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                {fabric.cons?.trim() && (
                  <div className="rounded-2xl border border-rose-200/70 bg-rose-50/60 p-5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-rose-800">
                      <Minus className="h-4 w-4" /> Недостатки
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-rose-900">
                      {fabric.cons.split(/\n+/).map((s) => s.trim()).filter(Boolean).map((s, i) => (
                        <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rose-600" /><span>{s}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
