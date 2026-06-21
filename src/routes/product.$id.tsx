import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ShoppingBag, Truck, Palette, ChevronRight, CreditCard, Info, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ContactDialog } from "@/components/ContactDialog";
import { RequestDialog } from "@/components/RequestDialog";
import { FabricPicker } from "@/components/FabricPicker";
import { FavoriteButton } from "@/components/FavoriteButton";
import { SpecInfoDialog } from "@/components/SpecInfoDialog";
import { formatPrice, useCart } from "@/lib/cart";
import { categoriesQuery, productsQuery, productQuery, fabricsQuery, specMechanismsQuery, specFillingsQuery } from "@/lib/queries";
import { getGallery } from "@/lib/db";
import { getSelectedFabric, setSelectedFabric, subscribeFabric } from "@/lib/productFabric";
import { incrementStat } from "@/lib/favorites";
import { pushRecentlyViewed, getRecentlyViewed, subscribeRecent } from "@/lib/recentlyViewed";
import { ShareButton } from "@/components/ShareButton";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Товар — МК Мебель" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const { data: product, isLoading } = useQuery(productQuery(id));
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: allProducts = [] } = useQuery(productsQuery);
  const { data: fabrics = [] } = useQuery(fabricsQuery);
  const { data: mechanisms = [] } = useQuery(specMechanismsQuery);
  const { data: fillings = [] } = useQuery(specFillingsQuery);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [installmentOpen, setInstallmentOpen] = useState(false);
  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [fabricPickerOpen, setFabricPickerOpen] = useState(false);
  const [fabricExamplesOpen, setFabricExamplesOpen] = useState(false);
  const [fabricId, setFabricId] = useState<string | null>(null);
  const [selSize, setSelSize] = useState<string>("");
  const [selBox, setSelBox] = useState<string>("");
  const [mechInfoOpen, setMechInfoOpen] = useState(false);
  const [fillInfoOpen, setFillInfoOpen] = useState(false);

  useEffect(() => {
    setFabricId(getSelectedFabric(id));
    return subscribeFabric(() => setFabricId(getSelectedFabric(id)));
  }, [id]);

  useEffect(() => {
    incrementStat(id, "views");
    pushRecentlyViewed(id);
  }, [id]);


  const selectedFabric = fabrics.find((f) => f.id === fabricId) ?? null;
  const mechanismInfo = useMemo(() => mechanisms.find((m) => m.id === product?.mechanism_id) ?? null, [mechanisms, product?.mechanism_id]);
  const fillingInfo = useMemo(() => fillings.find((m) => m.id === product?.filling_id) ?? null, [fillings, product?.filling_id]);


  if (isLoading) {
    return <div className="min-h-screen bg-background"><Header /><div className="p-12 text-center text-muted-foreground">Загрузка…</div><Footer /></div>;
  }
  if (!product) {
    return (
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
    );
  }

  const gallery = getGallery(product);
  const currentImg = activeImg ?? gallery[0] ?? null;
  const sale = product.sale_enabled ? product : null;
  const baseProductPrice = sale?.sale_new_price ?? product.price;

  // Размеры/короб как варианты с разной ценой
  const rows = (Array.isArray(product.sizes) ? product.sizes : []) as typeof product.sizes;
  const hasSizes = rows.length > 0;
  const sizeKeys = Array.from(new Set(rows.map((r) => r.size).filter(Boolean)));
  const effectiveSize = hasSizes ? (sizeKeys.includes(selSize) ? selSize : sizeKeys[0]) : "";
  const boxesForSize = hasSizes
    ? Array.from(new Set(rows.filter((r) => r.size === effectiveSize).map((r) => (r.box ?? "").trim())))
    : [];
  const effectiveBox = boxesForSize.includes(selBox) ? selBox : (boxesForSize[0] ?? "");
  const selectedRow = hasSizes
    ? (rows.find((r) => r.size === effectiveSize && (r.box ?? "").trim() === effectiveBox) ?? rows.find((r) => r.size === effectiveSize) ?? rows[0])
    : null;
  const hasBoxForSize = boxesForSize.some((b) => /короб/i.test(b) && !/без/i.test(b));
  const boxAvailable = hasSizes
    ? (hasBoxForSize ? true : (boxesForSize.some((b) => /без/i.test(b)) ? false : (product.has_box ?? false)))
    : (product.has_box ?? false);

  const sizePriceNum = selectedRow ? Number(String(selectedRow.price ?? "").replace(/[^\d]/g, "")) : NaN;
  const basePrice = hasSizes && Number.isFinite(sizePriceNum) && sizePriceNum > 0 ? sizePriceNum : baseProductPrice;
  const surcharge = selectedFabric?.surcharge ?? 0;
  const displayPrice = basePrice + surcharge;
  const category = categories.find((c) => c.slug === product.category_slug);
  const similar = allProducts.filter((p) => p.category_slug === product.category_slug && p.id !== product.id).slice(0, 4);

  const sleepingPlace = selectedRow?.sleeping?.trim() || product.sleeping_place || "";
  const boxValue = selectedRow ? (selectedRow.box ?? "").trim() : "";
  const productMeta: Record<string, string> = {
    section: "Карточка товара",
    product_name: product.title,
    product_category: category?.title ?? product.category_slug ?? "",
    product_price: `${displayPrice.toLocaleString("ru-RU")} ₽`,
    product_id: product.id,
  };
  if (effectiveSize) productMeta.product_size = effectiveSize;
  if (sleepingPlace) productMeta.product_sleeping = sleepingPlace;
  if (boxValue) productMeta.product_box = boxValue;
  if (selectedFabric) productMeta.product_fabric = selectedFabric.title;
  if (product.mechanism && product.mechanism !== "—") productMeta.product_mechanism = product.mechanism;
  if (product.filling && product.filling !== "—") productMeta.product_filling = product.filling;



  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/catalog" className="hover:text-primary">Каталог</Link>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link to="/catalog" search={{ category: category.slug }} className="hover:text-primary">{category.title}</Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card">
              {currentImg && <img src={currentImg} alt={product.title} className="aspect-[5/4] w-full object-contain p-4" />}
              {sale && (
                <span className="absolute left-4 top-4 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow">
                  {product.sale_label ?? "АКЦИЯ"}
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-6 gap-3">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setActiveImg(g)}
                    className={`overflow-hidden rounded-2xl border-2 bg-card transition ${

                      currentImg === g ? "border-primary" : "border-transparent hover:border-border"
                    }`}>
                    <img src={g} alt="" className="aspect-square w-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {category && <p className="text-sm font-medium uppercase tracking-wider text-primary">{category.title}</p>}
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{product.title}</h1>
            <p className="mt-3 text-base text-muted-foreground">{product.description}</p>

            {product.availability && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {product.availability === "в наличии" ? "В наличии" : "Под заказ"}
                {product.production_time && <span className="text-primary/70">· {product.production_time}</span>}
              </div>
            )}

            {/* Характеристики в столбик под плашкой "В наличии" */}
            <ul className="mt-5 space-y-2 text-sm">
              {hasSizes && effectiveSize && (
                <li className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <span className="text-muted-foreground">Размер</span>
                  <span className="text-right font-medium">{effectiveSize}</span>
                </li>
              )}
              {!hasSizes && sleepingPlace && sleepingPlace !== "—" && (
                <li className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <span className="text-muted-foreground">Спальное место</span>
                  <span className="text-right font-medium">{sleepingPlace}</span>
                </li>
              )}
              {product.mechanism && product.mechanism !== "—" && (
                <li className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <span className="text-muted-foreground">Механизм</span>
                  <span className="flex items-center gap-1.5 text-right font-medium">
                    {product.mechanism}
                    <button
                      type="button"
                      onClick={() => setMechInfoOpen(true)}
                      aria-label="Подробнее о механизме"
                      title="Подробнее"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              )}
              {product.filling && product.filling !== "—" && (
                <li className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <span className="text-muted-foreground">Наполнение</span>
                  <span className="flex items-center gap-1.5 text-right font-medium">
                    {product.filling}
                    <button
                      type="button"
                      onClick={() => setFillInfoOpen(true)}
                      aria-label="Подробнее о наполнении"
                      title="Подробнее"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </li>
              )}
              {!hasSizes && typeof product.has_box === "boolean" && (
                <li className="flex items-baseline justify-between gap-3 border-b border-dashed border-border/60 py-2">
                  <span className="text-muted-foreground">Короб</span>
                  <span className="text-right font-medium">{product.has_box ? "Есть" : "Нет"}</span>
                </li>
              )}
            </ul>

            {/* Размеры — кнопками */}
            {hasSizes && (
              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Размер</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sizeKeys.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelSize(sz)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        effectiveSize === sz ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {product.custom_size_enabled && (
                  <button
                    onClick={() => setCustomSizeOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Нужен другой размер?
                  </button>
                )}
              </div>
            )}

            {hasSizes && (sleepingPlace || true) && (
              <div className="mt-5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Спальное место</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {sleepingPlace && sleepingPlace !== "—" && (
                    <span className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
                      {sleepingPlace}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Короб: <span className="font-medium text-foreground">{boxAvailable ? "есть" : "нет"}</span>
                  </span>
                </div>
              </div>
            )}

            {hasSizes && boxesForSize.length > 1 && (
              <div className="mt-5">
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Комплектация</div>
                <div className="mt-2 flex flex-col gap-2">
                  {boxesForSize.map((b) => {
                    const row = rows.find((r) => r.size === effectiveSize && (r.box ?? "").trim() === b);
                    const priceNum = row ? Number(String(row.price ?? "").replace(/[^\d]/g, "")) : NaN;
                    const priceText = Number.isFinite(priceNum) && priceNum > 0 ? formatPrice(priceNum + surcharge) : null;
                    const active = effectiveBox === b;
                    const label = b.length === 0 ? "Без короба" : b;
                    return (
                      <button
                        key={b || "_empty"}
                        onClick={() => setSelBox(b)}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                          active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${active ? "border-primary" : "border-muted-foreground/40"}`}>
                            {active && <span className="h-2 w-2 rounded-full bg-primary" />}
                          </span>
                          {label}
                        </span>
                        {priceText && <span className="font-display text-base font-semibold">{priceText}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasSizes && product.custom_size_enabled && (
              <button
                onClick={() => setCustomSizeOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Нужен другой размер?
              </button>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              {sale?.sale_old_price && <span className="text-lg text-muted-foreground line-through">{formatPrice(sale.sale_old_price)}</span>}
              <span className="font-display text-4xl font-bold">
                {product.price_from && !hasSizes && <span className="text-lg font-normal text-muted-foreground">от </span>}
                {formatPrice(displayPrice)}
              </span>
            </div>
            {sale?.sale_text && <p className="mt-1 text-sm font-medium text-red-600">{sale.sale_text}</p>}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => { add(product.id); incrementStat(product.id, "cart_adds"); toast.success("Добавлено в корзину"); }}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                <ShoppingBag className="h-4 w-4" />В корзину
              </button>
              <FavoriteButton id={product.id} className="h-12 w-12" />
              <ShareButton title={product.title} />
              <button onClick={() => setQuestionOpen(true)} className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium transition hover:border-primary hover:text-primary">Я просто спросить</button>
              <button onClick={() => setDeliveryOpen(true)} className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium transition hover:border-primary hover:text-primary">Рассчитать доставку</button>
              <button onClick={() => setInstallmentOpen(true)} className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium transition hover:border-primary hover:text-primary"><CreditCard className="h-4 w-4" />Рассрочка</button>
            </div>


            {/* Выбранная ткань */}
            <div className="mt-6 rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-start gap-3">
                <Palette className="mt-0.5 h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Выбранная ткань</div>
                  {selectedFabric ? (
                    <div className="mt-2 flex items-center gap-3">
                      {selectedFabric.sample_photo && <img src={selectedFabric.sample_photo} alt="" className="h-12 w-12 rounded-xl object-cover" />}
                      <div className="flex-1">
                        <div className="font-medium">{selectedFabric.title}</div>
                        {selectedFabric.code && <div className="text-xs text-muted-foreground">{selectedFabric.code}{selectedFabric.surcharge > 0 ? ` · +${formatPrice(selectedFabric.surcharge)}` : ""}</div>}
                      </div>
                      <button onClick={() => setFabricPickerOpen(true)} className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-primary hover:text-primary">Изменить ткань</button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-1 font-medium">Ткань не выбрана</div>
                      <button onClick={() => setFabricPickerOpen(true)} className="mt-2 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Выбрать ткань</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedFabric && (
              <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <div className="font-display text-lg font-semibold">Хотите увидеть мебель в этой ткани?</div>
                <p className="mt-1 text-sm text-muted-foreground">Мы можем отправить реальные фотографии мебели в выбранном цвете и помочь подобрать лучший вариант под ваш интерьер.</p>
                <button onClick={() => setFabricExamplesOpen(true)} className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Получить примеры</button>
              </div>
            )}

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {["Более 100 вариантов тканей","Возможно изменение размеров","В наличии или изготовление от 2 недель","Помощь в подборе мебели"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary" />{t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Таблица размеров убрана — выбор размера выведен кнопками выше */}


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

        <section className="mt-16 rounded-[28px] border border-border/60 bg-surface p-8 md:rounded-[40px] md:p-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold md:text-3xl">Доставка и оплата</h2>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {["Доставка по Краснодару","Доставка по Краснодарскому краю","Доставка по всей России","Рассрочка Т-Банк и Халва","Оплата после согласования заказа","Стоимость и сроки доставки уточняйте у менеджера"].map((t) => (
                  <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-primary" />{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <button onClick={() => setDeliveryOpen(true)}
                className="inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                Рассчитать доставку
              </button>
            </div>
          </div>
        </section>

        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Похожие товары</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        <RecentlyViewedSection excludeId={id} />
      </div>

      <Footer />
      <RequestDialog
        open={customSizeOpen}
        onOpenChange={setCustomSizeOpen}
        title="Нужен другой размер?"
        description={`Изготовим ${product.title.toLowerCase()} в нужном вам размере.`}
        source={`custom-size:${product.id}`}
        submitLabel="Отправить заявку"
        extraData={{ ...productMeta, button: "Нужен другой размер" }}
        fields={[
          { name: "name", label: "Имя" },
          { name: "phone", label: "Телефон", type: "tel" },
          { name: "size", label: "Желаемый размер" },
          { name: "comment", label: "Комментарий", required: false },
        ]}
      />
      <SpecInfoDialog
        open={mechInfoOpen}
        onOpenChange={setMechInfoOpen}
        title="Механизм"
        spec={mechanismInfo ? { name: mechanismInfo.name, description: mechanismInfo.description, photo: mechanismInfo.photo, recommendations: mechanismInfo.recommendations } : (product.mechanism ? { name: product.mechanism } : null)}
      />
      <SpecInfoDialog
        open={fillInfoOpen}
        onOpenChange={setFillInfoOpen}
        title="Что внутри?"
        spec={fillingInfo ? { name: fillingInfo.name, description: fillingInfo.description, photo: fillingInfo.photo, recommendations: fillingInfo.recommendations } : (product.filling ? { name: product.filling } : null)}
      />

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} extraData={{ ...productMeta, button: "Связаться" }} />

      <RequestDialog open={questionOpen} onOpenChange={setQuestionOpen} title="Я просто спросить" description="Ответим на любые вопросы по товару." source={`question:${product.id}`}
        extraData={{ ...productMeta, button: "Я просто спросить" }}
        fields={[{ name: "name", label: "Имя" },{ name: "phone", label: "Телефон", type: "tel" },{ name: "question", label: "Ваш вопрос", required: false }]} />
      <RequestDialog open={colorOpen} onOpenChange={setColorOpen} title="Другие цвета и ткани" description="Подберём вариант под ваш интерьер." source={`color:${product.id}`} submitLabel="Отправить запрос"
        extraData={{ ...productMeta, button: "Другие цвета и ткани" }}
        fields={[{ name: "name", label: "Имя" },{ name: "phone", label: "Телефон", type: "tel" },{ name: "color", label: "Какой цвет интересует?" }]} />
      <RequestDialog open={deliveryOpen} onOpenChange={setDeliveryOpen} title="Рассчитать доставку" description="Сообщим точную стоимость и сроки." source={`delivery:${product.id}`}
        extraData={{ ...productMeta, button: "Рассчитать доставку" }}
        fields={[{ name: "name", label: "Имя" },{ name: "phone", label: "Телефон", type: "tel" },{ name: "city", label: "Город доставки" }]} />
      <RequestDialog open={installmentOpen} onOpenChange={setInstallmentOpen} title="Рассрочка" description="Расскажем об условиях рассрочки Т-Банк и Халва." source={`installment:${product.id}`}
        extraData={{ ...productMeta, button: "Рассрочка" }}
        fields={[{ name: "name", label: "Имя" },{ name: "phone", label: "Телефон", type: "tel" },{ name: "term", label: "Желаемый срок (мес.)", required: false }]} />
      <RequestDialog
        open={fabricExamplesOpen} onOpenChange={setFabricExamplesOpen}
        title="Фото мебели в выбранной ткани"
        description={`${product.title} · ${selectedFabric?.title ?? ""}`}
        source={`fabric-examples:${product.id}:${selectedFabric?.id ?? ""}`}
        submitLabel="Получить примеры"
        extraData={{ ...productMeta, button: "Фото в выбранной ткани" }}
        fields={[{ name: "phone", label: "Телефон", type: "tel" }]}
      />
      <FabricPicker
        open={fabricPickerOpen}
        onOpenChange={setFabricPickerOpen}
        productId={product.id}
        selectedId={fabricId}
        onSelect={(f) => { setSelectedFabric(product.id, f.id); toast.success(`Ткань выбрана: ${f.title}`); }}
      />
    </div>
  );
}



function RecentlyViewedSection({ excludeId }: { excludeId: string }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setIds(getRecentlyViewed().filter((x) => x !== excludeId).slice(0, 4));
    update();
    return subscribeRecent(update);
  }, [excludeId]);
  const { data: all = [] } = useQuery(productsQuery);
  const items = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) as any[];
  if (items.length === 0) return null;
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold md:text-3xl">Вы недавно смотрели</h2>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
