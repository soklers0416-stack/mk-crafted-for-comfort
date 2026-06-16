import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice, useCart } from "@/lib/cart";
import { productsQuery, fabricsQuery } from "@/lib/queries";
import { getSelectedFabric } from "@/lib/productFabric";
import { submitApplication } from "@/lib/applications.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Корзина — МК Мебель" },
      { name: "description", content: "Оформите заявку на мебель МК Мебель." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const { data: products = [] } = useQuery(productsQuery);
  const { data: fabrics = [] } = useQuery(fabricsQuery);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const detailed = items
    .map((it) => {
      const product = products.find((p) => p.id === it.id);
      if (!product) return null;
      const fabricId = typeof window !== "undefined" ? getSelectedFabric(product.id) : null;
      const fabric = fabricId ? fabrics.find((f) => f.id === fabricId) ?? null : null;
      return { ...it, product, fabric };
    })
    .filter(Boolean) as Array<{ id: string; qty: number; product: typeof products[number]; fabric: typeof fabrics[number] | null }>;

  const total = detailed.reduce((s, x) => {
    const base = x.product.sale_enabled && x.product.sale_new_price ? x.product.sale_new_price : x.product.price;
    const surcharge = x.fabric?.surcharge ?? 0;
    return s + (base + surcharge) * x.qty;
  }, 0);

  const submitFn = useServerFn(submitApplication);
  const submitOrder = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !phone.trim()) throw new Error("Укажите имя и телефон");
      // Подробный состав корзины — текстом, без ID товаров.
      const itemsList = detailed.map((x) => {
        const base = x.product.sale_enabled && x.product.sale_new_price ? x.product.sale_new_price : x.product.price;
        const surcharge = x.fabric?.surcharge ?? 0;
        const lineTotal = (base + surcharge) * x.qty;
        const parts = [
          `• ${x.product.title}`,
          x.fabric ? `   Ткань: ${x.fabric.title}` : null,
          `   Количество: ${x.qty}`,
          `   Цена: ${formatPrice(lineTotal)}`,
        ].filter(Boolean);
        return parts.join("\n");
      }).join("\n\n");
      const itemsSummary = `${itemsList}\n\nИтого: ${formatPrice(total)}`;
      await submitFn({
        data: {
          formKey: "cart",
          title: "Заказ из корзины",
          data: {
            name,
            phone,
            comment,
            items: itemsSummary,
            total: formatPrice(total),
            button: "Оформить заказ",
            section: "Корзина",
          },
        },
      });
    },
    onSuccess: () => { setSent(true); clear(); },
    onError: (e: any) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => { e.preventDefault(); submitOrder.mutate(); };

  if (sent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-3xl text-primary">✓</div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Спасибо!</h1>
          <p className="mt-3 text-muted-foreground">Наш менеджер свяжется с вами в ближайшее время.</p>
          <Link to="/" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">
            На главную
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Корзина</h1>

        {detailed.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-border/60 bg-card p-10 text-center">
            <p className="text-muted-foreground">Корзина пуста.</p>
            <Link to="/catalog" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-4">
              {detailed.map((it) => (
                <div key={it.id} className="flex gap-4 rounded-3xl border border-border/60 bg-card p-4">
                  {it.product.photo1 && <img src={it.product.photo1} alt={it.product.title} loading="lazy" className="h-28 w-28 shrink-0 rounded-2xl bg-surface-muted object-contain p-2 md:h-32 md:w-32" />}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-semibold md:text-lg">{it.product.title}</h3>
                      <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-primary" aria-label="Удалить">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground md:text-sm">{it.product.description}</p>
                    {it.fabric && (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        {it.fabric.sample_photo && <img src={it.fabric.sample_photo} className="h-4 w-4 rounded-full object-cover" alt="" />}
                        Ткань: {it.fabric.title}{it.fabric.surcharge > 0 ? ` (+${formatPrice(it.fabric.surcharge)})` : ""}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => setQty(it.id, it.qty - 1)} className="grid h-9 w-9 place-items-center hover:text-primary"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm font-medium">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} className="grid h-9 w-9 place-items-center hover:text-primary"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="font-display text-lg font-semibold">{formatPrice(((it.product.sale_enabled && it.product.sale_new_price) ? it.product.sale_new_price : it.product.price + (it.fabric?.surcharge ?? 0)) * it.qty)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 lg:sticky lg:top-24">
              <h3 className="font-display text-xl font-semibold">Оформление</h3>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Итого</span>
                <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              <form onSubmit={submit} className="mt-5 space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" type="tel"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий" rows={3}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
                <button type="submit" disabled={submitOrder.isPending}
                  className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
                  {submitOrder.isPending ? "Отправляем…" : "Отправить заявку"}
                </button>
                <p className="text-center text-xs text-muted-foreground">Нажимая, вы соглашаетесь с обработкой данных.</p>
              </form>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
