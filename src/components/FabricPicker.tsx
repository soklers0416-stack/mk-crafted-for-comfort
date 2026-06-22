import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { fabricsQuery, fabricCategoriesQuery, productFabricsQuery, fabricColorsByCollectionQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/cart";
import type { Fabric, FabricColor } from "@/lib/db";

export function FabricPicker({
  open, onOpenChange, productId, selectedId, selectedColorId, onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productId: string;
  selectedId: string | null;
  selectedColorId?: string | null;
  onSelect: (fabric: Fabric, color: FabricColor | null) => void;
}) {
  const { data: fabrics = [] } = useQuery(fabricsQuery);
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const { data: pf = [] } = useQuery(productFabricsQuery);
  const [cat, setCat] = useState<string>("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<Fabric | null>(null);
  const [colorId, setColorId] = useState<string | null>(null);

  const { data: viewColors = [] } = useQuery({
    ...fabricColorsByCollectionQuery(view?.id ?? ""),
    enabled: !!view?.id,
  });

  useEffect(() => { if (!open) { setView(null); setQ(""); setColorId(null); } }, [open]);
  useEffect(() => {
    // При открытии деталки уже выбранной ткани — подставим текущий цвет
    if (view && selectedId === view.id) setColorId(selectedColorId ?? null);
    else setColorId(null);
  }, [view, selectedId, selectedColorId]);

  const allowedIds = new Set(pf.filter((r) => r.product_id === productId).map((r) => r.fabric_id));
  const available = allowedIds.size > 0 ? fabrics.filter((f) => allowedIds.has(f.id)) : fabrics;
  const filtered = available
    .filter((f) => !cat || f.category_slug === cat)
    .filter((f) => !q || f.title.toLowerCase().includes(q.toLowerCase()) || f.code.toLowerCase().includes(q.toLowerCase()));

  const hasColors = viewColors.length > 0;
  const chosenColor = viewColors.find((c) => c.id === colorId) ?? null;
  const canConfirm = !!view && (!hasColors || !!chosenColor);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background p-5">
          <SheetHeader className="space-y-1">
            <SheetTitle className="font-display text-2xl">Выбор ткани</SheetTitle>
            <SheetDescription>Выберите ткань и цвет для вашего товара</SheetDescription>
          </SheetHeader>
          {!view && (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => setCat("")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${!cat ? "bg-primary text-primary-foreground" : "bg-surface-muted"}`}>Все</button>
                {cats.map((c) => (
                  <button key={c.slug} onClick={() => setCat(c.slug)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${cat === c.slug ? "bg-primary text-primary-foreground" : "bg-surface-muted"}`}>{c.title}</button>
                ))}
              </div>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по названию или коду"
                  className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </div>
            </>
          )}
        </div>

        {view ? (
          <div className="p-5">
            <button onClick={() => setView(null)} className="text-sm text-muted-foreground hover:text-primary">← Назад к списку</button>
            {view.sample_photo && <img src={view.sample_photo} alt={view.title} className="mt-3 aspect-square w-full rounded-2xl object-cover" />}
            <h3 className="mt-4 font-display text-xl font-semibold">{view.title}</h3>
            {view.code && <p className="text-xs text-muted-foreground">Код: {view.code}</p>}
            {view.description && <p className="mt-3 text-sm text-muted-foreground">{view.description}</p>}
            {view.recommendations && (
              <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm">{view.recommendations}</div>
            )}
            <dl className="mt-4 space-y-1 text-sm">
              {Object.entries(view.characteristics || {})
                .filter(([, v]) => v && String(v).trim() !== "")
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right">{String(v)}</dd>
                  </div>
                ))}
            </dl>

            {hasColors && (
              <div className="mt-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="text-sm font-medium">Цвет {chosenColor ? <span className="text-muted-foreground font-normal">· {chosenColor.name}{chosenColor.code ? ` (${chosenColor.code})` : ""}</span> : <span className="text-muted-foreground font-normal">— выберите вариант</span>}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {viewColors.map((c) => {
                    const active = colorId === c.id;
                    return (
                      <button key={c.id} type="button" onClick={() => setColorId(c.id)}
                        title={`${c.name}${c.code ? ` · ${c.code}` : ""}`}
                        className={`group relative overflow-hidden rounded-xl border bg-surface-muted text-left transition ${active ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary"}`}>
                        <div className="aspect-square">
                          {c.photo ? (
                            <img src={c.photo} alt={c.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">{c.code || c.name}</div>
                          )}
                        </div>
                        {active && (
                          <div className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <div className="px-1.5 py-1 text-[10px] line-clamp-1">{c.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view.surcharge > 0 && <p className="mt-3 text-sm font-medium text-primary">Доплата: {formatPrice(view.surcharge)}</p>}
            <button
              onClick={() => { if (!canConfirm || !view) return; onSelect(view, chosenColor); onOpenChange(false); }}
              disabled={!canConfirm}
              className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              {hasColors ? (chosenColor ? "Выбрать ткань и цвет" : "Выберите цвет") : "Выбрать эту ткань"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
            {filtered.map((f) => (
              <button key={f.id} onClick={() => setView(f)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left transition hover:border-primary">
                <div className="aspect-square bg-surface-muted">
                  {f.sample_photo && <img src={f.sample_photo} alt={f.title} className="h-full w-full object-cover" />}
                </div>
                <div className="p-2.5">
                  <div className="line-clamp-1 text-xs font-medium">{f.title}</div>
                  {f.code && <div className="text-[10px] text-muted-foreground">{f.code}</div>}
                  {f.surcharge > 0 && <div className="text-[10px] text-primary">+{formatPrice(f.surcharge)}</div>}
                </div>
                {selectedId === f.id && (
                  <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">Ничего не найдено</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
