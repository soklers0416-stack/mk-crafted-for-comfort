import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DynamicForm } from "@/components/DynamicForm";
import { productsQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/cart";
import type { Product } from "@/lib/db";
import {
  apartmentContentQuery, apartmentCategoriesQuery, apartmentDiscountsQuery,
  pickDiscount, trackApartmentEvent, type ApartmentCategory,
} from "@/lib/apartment";
import { Check, Plus, X, Sparkles, Info } from "lucide-react";

export const Route = createFileRoute("/apartment")({
  head: () => ({
    meta: [
      { title: "Квартира под ключ — МК Мебель" },
      { name: "description", content: "Соберите мебель для всей квартиры с дополнительной скидкой до 7%." },
      { property: "og:title", content: "Квартира под ключ — МК Мебель" },
      { property: "og:description", content: "Один комплект, одна доставка, одна выгодная цена." },
    ],
  }),
  component: ApartmentPage,
});

function ApartmentPage() {
  const { data: content = {} } = useQuery(apartmentContentQuery);
  const { data: categories = [] } = useQuery(apartmentCategoriesQuery);
  const { data: discounts = [] } = useQuery(apartmentDiscountsQuery);
  const { data: products = [] } = useQuery(productsQuery);

  const [infoOpen, setInfoOpen] = useState(false);
  const [pickerCat, setPickerCat] = useState<ApartmentCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [picked, setPicked] = useState<Record<string, string[]>>({}); // catId -> productIds[]
  const [started, setStarted] = useState(false);

  useEffect(() => { trackApartmentEvent("view"); }, []);

  function scrollToBuilder() {
    document.getElementById("apartment-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addProduct(catId: string, productId: string) {
    setPicked((p) => ({ ...p, [catId]: Array.from(new Set([...(p[catId] ?? []), productId])) }));
    if (!started) { setStarted(true); trackApartmentEvent("start"); }
    const cat = categories.find((c) => c.id === catId);
    if (cat) trackApartmentEvent("category_pick", { category: cat.title });
  }
  function removeProduct(catId: string, productId: string) {
    setPicked((p) => ({ ...p, [catId]: (p[catId] ?? []).filter((x) => x !== productId) }));
  }

  const pickedItems = useMemo(() => {
    const items: { catTitle: string; product: typeof products[number]; price: number }[] = [];
    for (const cat of categories) {
      for (const pid of picked[cat.id] ?? []) {
        const product = products.find((p) => p.id === pid);
        if (product) {
          const price = product.sale_enabled && product.sale_new_price ? product.sale_new_price : product.price;
          items.push({ catTitle: cat.title, product, price });
        }
      }
    }
    return items;
  }, [picked, categories, products]);

  const subtotal = pickedItems.reduce((s, x) => s + x.price, 0);
  const itemCount = pickedItems.length;
  const discount = pickDiscount(discounts, itemCount, subtotal);
  const discountAmount = discount ? Math.round((subtotal * discount.percent) / 100) : 0;
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          {content.badge && (
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold text-orange-700">
              <Sparkles className="h-3.5 w-3.5" /> {content.badge}
            </span>
          )}
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-6xl">
            {content.headline || "Квартира под ключ"}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg whitespace-pre-line">
            {content.subtext}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={scrollToBuilder}
              className="inline-flex h-12 items-center rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
              {content.cta_main || "Рассчитать стоимость"}
            </button>
            <button onClick={() => setInfoOpen(true)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-7 text-sm font-medium hover:bg-surface-muted">
              <Info className="h-4 w-4" /> {content.cta_info || "Узнать подробнее"}
            </button>
          </div>
        </div>
      </section>

      {/* Builder */}
      <section id="apartment-builder" className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Соберите свой комплект</h2>
        <p className="mt-2 text-sm text-muted-foreground">Выберите товары — скидка применится автоматически.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {categories.map((cat) => {
              const items = picked[cat.id] ?? [];
              return (
                <div key={cat.id} className="rounded-3xl border border-border/60 bg-card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold">{cat.title}</h3>
                    <button onClick={() => setPickerCat(cat)}
                      className="inline-flex h-9 items-center gap-1 rounded-full bg-primary/10 px-4 text-xs font-medium text-primary hover:bg-primary/15">
                      <Plus className="h-3.5 w-3.5" /> Добавить
                    </button>
                  </div>
                  {items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {items.map((pid) => {
                        const p = products.find((x) => x.id === pid);
                        if (!p) return null;
                        const price = p.sale_enabled && p.sale_new_price ? p.sale_new_price : p.price;
                        return (
                          <div key={pid} className="flex items-center gap-3 rounded-2xl bg-surface-muted/60 p-3">
                            {p.photo1 && <img src={p.photo1} alt="" className="h-12 w-12 rounded-xl bg-background object-contain p-1" />}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{p.title}</div>
                              <div className="text-xs text-muted-foreground">{formatPrice(price)}</div>
                            </div>
                            <button onClick={() => removeProduct(cat.id, pid)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calculator */}
          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
            <h3 className="font-display text-xl font-semibold">Расчёт</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Товаров в комплекте" value={String(itemCount)} />
              <Row label="Стоимость по отдельности" value={formatPrice(subtotal)} />
              {discount && (
                <>
                  <Row label={`Скидка (${discount.percent}%)`} value={`−${formatPrice(discountAmount)}`} accent="text-emerald-600" />
                  <Row label="Стоимость комплектом" value={formatPrice(total)} bold />
                  <Row label="Ваша выгода" value={formatPrice(discountAmount)} accent="text-emerald-600" bold />
                </>
              )}
              {!discount && itemCount > 0 && (
                <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                  Добавьте ещё товаров — будет действовать скидка комплектом.
                </p>
              )}
            </div>

            <button
              onClick={() => setFormOpen(true)}
              disabled={itemCount === 0}
              className="mt-5 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              Получить расчёт
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Расчёт — без обязательств. Перезвоним за 15 минут.
            </p>
          </aside>
        </div>
      </section>

      <Footer />

      {/* Info dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{content.info_title || "Условия акции"}</DialogTitle>
            {content.info_text && <DialogDescription>{content.info_text}</DialogDescription>}
          </DialogHeader>
          <div className="mt-3 space-y-3">
            {discounts.map((d) => (
              <div key={d.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-base font-semibold">{d.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {d.min_items}+ товаров на сумму от {formatPrice(d.min_amount)} — скидка {d.percent}%
                  </div>
                  {d.description && <div className="mt-1 text-xs text-muted-foreground">{d.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product picker */}
      <Dialog open={!!pickerCat} onOpenChange={(v) => !v && setPickerCat(null)}>
        <DialogContent className="rounded-3xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Выберите: {pickerCat?.title}</DialogTitle>
          </DialogHeader>
          {pickerCat && (
            <PickerList
              category={pickerCat}
              products={products}
              selected={picked[pickerCat.id] ?? []}
              onPick={(pid) => addProduct(pickerCat.id, pid)}
              onUnpick={(pid) => removeProduct(pickerCat.id, pid)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{content.form_title || "Получить расчёт"}</DialogTitle>
            {content.form_text && <DialogDescription>{content.form_text}</DialogDescription>}
          </DialogHeader>
          <DynamicForm
            formKey="apartment"
            extraData={{
              items: pickedItems.map((x) => `• ${x.catTitle}: ${x.product.title} — ${formatPrice(x.price)}`).join("\n"),
              subtotal: formatPrice(subtotal),
              discount_percent: discount ? `${discount.percent}%` : "—",
              discount_amount: formatPrice(discountAmount),
              total: formatPrice(total),
              savings: formatPrice(discountAmount),
            }}
            onSent={() => { trackApartmentEvent("submit", { items: itemCount, total }); setTimeout(() => setFormOpen(false), 2000); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-display text-base font-semibold" : ""} ${accent ?? ""}`}>{value}</span>
    </div>
  );
}

function PickerList({
  category, products, selected, onPick, onUnpick,
}: {
  category: ApartmentCategory;
  products: Product[];
  selected: string[];
  onPick: (id: string) => void;
  onUnpick: (id: string) => void;
}) {
  const slugs = category.product_category_slugs ?? [];
  const list = (products ?? []).filter((p) => slugs.length === 0 || slugs.includes(p.category_slug));
  if (list.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Товаров в этой категории пока нет.</p>;
  }
  return (
    <div className="grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
      {list.map((p) => {
        const isSelected = selected.includes(p.id);
        const price = p.sale_enabled && p.sale_new_price ? p.sale_new_price : p.price;
        return (
          <button
            key={p.id}
            onClick={() => (isSelected ? onUnpick(p.id) : onPick(p.id))}
            className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            {p.photo1 && <img src={p.photo1} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-surface-muted object-contain p-1" />}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">{formatPrice(price)}</div>
            </div>
            {isSelected && <Check className="h-5 w-5 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}
