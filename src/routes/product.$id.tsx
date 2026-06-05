import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ShoppingBag, Truck, Palette, ChevronRight, CreditCard } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ContactDialog } from "@/components/ContactDialog";
import { RequestDialog } from "@/components/RequestDialog";
import { formatPrice, useCart } from "@/lib/cart";
import { products, categories, getGallery } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = products.find((p) => p.id === params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.title} — МК Мебель` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.title },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.photo1 },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-3xl font-bold">Товар не найден</h1>
        <Link to="/catalog" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
          Вернуться в каталог
        </Link>
      </div>
      <Footer />
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="min-h-screen bg-background p-8">
      <p className="text-muted-foreground">Не удалось загрузить товар.</p>
      <button onClick={reset} className="mt-4 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground">Повторить</button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: import("@/lib/data").Product };
  const { add } = useCart();
  const gallery: string[] = getGallery(product);
  const [activeImg, setActiveImg] = useState<string>(gallery[0]);
  const [contactOpen, setContactOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);

  const sale = product.sale?.enabled ? product.sale : null;
  const displayPrice = sale?.newPrice ?? product.price;
  const category = categories.find((c) => c.slug === product.category);
  const similar = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/catalog" className="hover:text-primary">Каталог</Link>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to="/catalog" search={{ category: category.slug }} className="hover:text-primary">
                {category.title}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* GALLERY */}
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-surface-muted">
              <img src={activeImg} alt={product.title} className="aspect-[5/4] w-full object-contain p-4" />
              {sale && (
                <span className="absolute left-4 top-4 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow">
                  {sale.label ?? "АКЦИЯ"}
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {gallery.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(g)}
                    className={`overflow-hidden rounded-2xl border-2 bg-surface-muted transition ${
                      activeImg === g ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={g} alt="" className="aspect-square w-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div>
            {category && (
              <p className="text-sm font-medium uppercase tracking-wider text-primary">{category.title}</p>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{product.title}</h1>
            <p className="mt-3 text-base text-muted-foreground">{product.description}</p>

            {/* Наличие */}
            {product.availability && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {product.availability === "в наличии" ? "В наличии" : "Под заказ"}
                {product.productionTime && <span className="text-primary/70">· {product.productionTime}</span>}
              </div>
            )}

            {/* Краткие характеристики */}
            <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {product.sleepingPlace && product.sleepingPlace !== "—" && (
                <div className="flex justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <dt className="text-muted-foreground">Спальное место</dt>
                  <dd className="text-right font-medium">{product.sleepingPlace}</dd>
                </div>
              )}
              {product.mechanism && product.mechanism !== "—" && (
                <div className="flex justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <dt className="text-muted-foreground">Механизм</dt>
                  <dd className="text-right font-medium">{product.mechanism}</dd>
                </div>
              )}
              {product.filling && product.filling !== "—" && (
                <div className="flex justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <dt className="text-muted-foreground">Наполнение</dt>
                  <dd className="text-right font-medium">{product.filling}</dd>
                </div>
              )}
              {typeof product.hasBox === "boolean" && (
                <div className="flex justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <dt className="text-muted-foreground">Короб</dt>
                  <dd className="text-right font-medium">{product.hasBox ? "Есть" : "Нет"}</dd>
                </div>
              )}
            </dl>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              {sale?.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(sale.oldPrice)}</span>
              )}
              <span className="font-display text-4xl font-bold">
                {product.priceFrom && <span className="text-lg font-normal text-muted-foreground">от </span>}
                {formatPrice(displayPrice)}
              </span>
            </div>
            {sale?.text && <p className="mt-1 text-sm font-medium text-red-600">{sale.text}</p>}

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => { add(product.id); toast.success("Добавлено в корзину"); }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <ShoppingBag className="h-4 w-4" />
                Оформить заказ
              </button>
              <button
                onClick={() => setQuestionOpen(true)}
                className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Я просто спросить
              </button>
              <button
                onClick={() => setDeliveryOpen(true)}
                className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Рассчитать доставку
              </button>
              <button
                onClick={() => setInstallmentOpen(true)}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <CreditCard className="h-4 w-4" />
                Рассрочка
              </button>
            </div>

            {/* Colors */}
            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start gap-3">
                <Palette className="mt-0.5 h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">Доступно более 100 вариантов тканей и цветов</div>
                  <button
                    onClick={() => setColorOpen(true)}
                    className="mt-2 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Посмотреть другие цвета
                  </button>
                </div>
              </div>
            </div>

            {/* Trust */}
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {[
                "Более 100 вариантов тканей",
                "Возможно изменение размеров",
                "В наличии или изготовление от 2 недель",
                "Помощь в подборе мебели",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SIZES TABLE */}
        {product.sizes && product.sizes.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Размеры и цены</h2>
            <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4 font-medium">Размер</th>
                    <th className="px-5 py-4 font-medium">Спальное место</th>
                    <th className="px-5 py-4 font-medium">Короб</th>
                    <th className="px-5 py-4 text-right font-medium">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {product.sizes.map((s, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td className="px-5 py-4 font-medium">{s.size}</td>
                      <td className="px-5 py-4 text-muted-foreground">{s.sleeping}</td>
                      <td className="px-5 py-4 text-muted-foreground">{s.box}</td>
                      <td className="px-5 py-4 text-right font-semibold">{s.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SPECS */}
        {product.specs && product.specs.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Характеристики</h2>
            <div className="mt-6 grid gap-x-10 gap-y-1 rounded-3xl border border-border/60 bg-card p-6 md:grid-cols-2 md:p-8">
              {product.specs.map((s, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 border-b border-dashed border-border/60 py-3 last:border-0">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="text-right text-sm font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* DELIVERY */}
        <section className="mt-16 rounded-[28px] border border-border/60 bg-surface p-8 md:rounded-[40px] md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold md:text-3xl">Доставка и оплата</h2>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {[
                  "Доставка по Краснодару",
                  "Доставка по Краснодарскому краю",
                  "Доставка по всей России",
                  "Рассрочка Т-Банк и Халва",
                  "Оплата после согласования заказа",
                  "Стоимость и сроки доставки уточняйте у менеджера",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <button
                onClick={() => setDeliveryOpen(true)}
                className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Рассчитать доставку
              </button>
            </div>
          </div>
        </section>

        {/* SIMILAR */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Похожие товары</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>

      <Footer />

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
      <RequestDialog
        open={questionOpen}
        onOpenChange={setQuestionOpen}
        title="Я просто спросить"
        description="Ответим на любые вопросы по товару."
        source={`question:${product.id}`}
        fields={[
          { name: "name", label: "Имя" },
          { name: "phone", label: "Телефон", type: "tel" },
          { name: "question", label: "Ваш вопрос", required: false },
        ]}
      />
      <RequestDialog
        open={colorOpen}
        onOpenChange={setColorOpen}
        title="Другие цвета и ткани"
        description="Подберём вариант под ваш интерьер. Доступно более 100 тканей."
        source={`color:${product.id}`}
        submitLabel="Отправить запрос"
        fields={[
          { name: "name", label: "Имя" },
          { name: "phone", label: "Телефон", type: "tel" },
          { name: "color", label: "Какой цвет интересует?" },
        ]}
      />
      <RequestDialog
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        title="Рассчитать доставку"
        description="Сообщим точную стоимость и сроки."
        source={`delivery:${product.id}`}
        fields={[
          { name: "name", label: "Имя" },
          { name: "phone", label: "Телефон", type: "tel" },
          { name: "city", label: "Город доставки" },
        ]}
      />
      <RequestDialog
        open={installmentOpen}
        onOpenChange={setInstallmentOpen}
        title="Рассрочка"
        description="Расскажем об условиях рассрочки Т-Банк и Халва."
        source={`installment:${product.id}`}
        fields={[
          { name: "name", label: "Имя" },
          { name: "phone", label: "Телефон", type: "tel" },
          { name: "term", label: "Желаемый срок (мес.)", required: false },
        ]}
      />
    </div>
  );
}
