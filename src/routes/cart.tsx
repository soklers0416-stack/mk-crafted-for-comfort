import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPrice, useCart } from "@/lib/cart";
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
  const { detailed, total, setQty, remove, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Укажите имя и телефон");
      return;
    }
    // TODO: подключить Google Таблицы — отправка { name, phone, comment, items: detailed, total }
    setSent(true);
    clear();
  };

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
                  <img src={it.product.photo1} alt={it.product.title} loading="lazy" className="h-28 w-28 shrink-0 rounded-2xl bg-surface-muted object-contain p-2 md:h-32 md:w-32" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-semibold md:text-lg">{it.product.title}</h3>
                      <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-primary" aria-label="Удалить">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground md:text-sm">{it.product.description}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => setQty(it.id, it.qty - 1)} className="grid h-9 w-9 place-items-center hover:text-primary" aria-label="Меньше">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{it.qty}</span>
                        <button onClick={() => setQty(it.id, it.qty + 1)} className="grid h-9 w-9 place-items-center hover:text-primary" aria-label="Больше">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="font-display text-lg font-semibold">{formatPrice(it.product.price * it.qty)}</div>
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
                <button type="submit" className="w-full rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                  Отправить заявку
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
