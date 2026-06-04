import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products, categories } from "@/lib/data";
import { formatPrice, useCart } from "@/lib/cart";
import { toast } from "sonner";

const steps = [
  { slug: "sofas", title: "Выберите диван" },
  { slug: "beds", title: "Выберите кровать" },
  { slug: "mattresses", title: "Выберите матрас" },
  { slug: "wardrobes", title: "Выберите шкаф" },
  { slug: "hallways", title: "Выберите прихожую" },
  { slug: "dining", title: "Выберите стол и стулья" },
];

export const Route = createFileRoute("/apartment")({
  head: () => ({
    meta: [
      { title: "Квартира под ключ — МК Мебель" },
      { name: "description", content: "Подберите мебель для всей квартиры в одном месте. Пошаговый конструктор от МК Мебель." },
      { property: "og:title", content: "Квартира под ключ — МК Мебель" },
      { property: "og:description", content: "Пошаговый подбор мебели для всей квартиры." },
    ],
  }),
  component: ApartmentPage,
});

function ApartmentPage() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Record<string, string | null>>({});
  const { add } = useCart();
  const navigate = useNavigate();

  const current = steps[step];
  const list = products.filter((p) => p.category === current.slug);
  const total = Object.entries(picked).reduce((s, [, id]) => {
    const p = products.find((x) => x.id === id);
    return p ? s + p.price : s;
  }, 0);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  };

  const finish = () => {
    Object.values(picked).forEach((id) => { if (id) add(id); });
    toast.success("Комплект добавлен в корзину");
    navigate({ to: "/cart" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Конструктор</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Квартира под ключ
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Соберите мебель для всей квартиры за 6 шагов. После — отправьте заявку, и менеджер свяжется с вами.
        </p>

        {/* progress */}
        <div className="mt-10 grid grid-cols-3 gap-2 md:grid-cols-6">
          {steps.map((s, i) => (
            <button
              key={s.slug}
              onClick={() => setStep(i)}
              className={`rounded-2xl border px-3 py-3 text-left text-xs transition ${
                i === step ? "border-primary bg-primary/5"
                  : picked[s.slug] ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                Шаг {i + 1}
                {picked[s.slug] && <Check className="h-3 w-3" />}
              </div>
              <div className="mt-1 font-medium leading-tight text-foreground">{s.title}</div>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">
                {current.title}
              </h2>
              <button
                onClick={() => setPicked((p) => ({ ...p, [current.slug]: null }))}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Пропустить
              </button>
            </div>
            {list.length === 0 ? (
              <p className="mt-8 text-muted-foreground">Скоро добавим товары в эту категорию.</p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {list.map((p) => {
                  const active = picked[current.slug] === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPicked((s) => ({ ...s, [current.slug]: p.id }))}
                      className={`group overflow-hidden rounded-3xl border bg-card text-left transition ${
                        active ? "border-primary ring-2 ring-primary/30" : "border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="aspect-[5/4] overflow-hidden bg-surface-muted">
                        <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                      </div>
                      <div className="flex items-center justify-between gap-3 p-4">
                        <div>
                          <div className="font-medium">{p.title}</div>
                          <div className="mt-1 font-display text-lg font-semibold">{formatPrice(p.price)}</div>
                        </div>
                        <span className={`grid h-9 w-9 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-surface text-foreground/60"}`}>
                          <Check className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Назад
              </button>
              <button
                onClick={next}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {step === steps.length - 1 ? "Перейти в корзину" : "Далее"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* summary */}
          <aside className="rounded-3xl border border-border/60 bg-card p-6">
            <h3 className="font-display text-lg font-semibold">Ваш комплект</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {steps.map((s) => {
                const id = picked[s.slug];
                const p = id ? products.find((x) => x.id === id) : null;
                const cat = categories.find((c) => c.slug === s.slug);
                return (
                  <li key={s.slug} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{cat?.title}</span>
                    <span className="font-medium text-right">
                      {p ? `${p.title} · ${formatPrice(p.price)}` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Итого</span>
              <span className="font-display text-2xl font-bold">{formatPrice(total)}</span>
            </div>
            <button
              onClick={finish}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              Отправить в корзину
            </button>
            <Link to="/catalog" className="mt-3 block text-center text-xs text-muted-foreground hover:text-primary">
              Вернуться в каталог
            </Link>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
