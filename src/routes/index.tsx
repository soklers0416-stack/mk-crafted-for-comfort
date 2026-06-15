import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, MapPin, Phone, Clock, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { ContactDialog } from "@/components/ContactDialog";
import { HeroSlider } from "@/components/HeroSlider";
import { advantages, heroFeatures } from "@/lib/data";
import { useQuery } from "@tanstack/react-query";
import { productsQuery, reviewsQuery, productStatsQuery, homeBlocksQuery, categoriesQuery } from "@/lib/queries";
import { apartmentContentQuery } from "@/lib/apartment";
import { getRecentlyViewed, subscribeRecent } from "@/lib/recentlyViewed";
import { useEffect as useEffectReact } from "react";
import apartmentImgFallback from "@/assets/apartment.jpg";
import factory from "@/assets/factory.jpg";
import showroom from "@/assets/showroom.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "МК Мебель — мебель из Краснодара | Собственное производство" },
      { name: "description", content: "Стильная мебель собственного производства. Диваны, кровати, шкафы, столы. Рассрочка Т-Банк и Халва, доставка по России." },
      { property: "og:title", content: "МК Мебель — мебель из Краснодара" },
      { property: "og:description", content: "Собственное производство. Стильная мебель без наценок." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [contactOpen, setContactOpen] = useState(false);
  const { data: allProducts = [] } = useQuery(productsQuery);
  const { data: reviews = [] } = useQuery(reviewsQuery);
  const { data: stats = [] } = useQuery(productStatsQuery);
  const { data: blocks = [] } = useQuery(homeBlocksQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: apt = {} } = useQuery(apartmentContentQuery);
  const statMap = new Map(stats.map((s) => [s.product_id, s]));
  const likesOf = (id: string) => statMap.get(id)?.likes ?? 0;
  const viewsOf = (id: string) => statMap.get(id)?.views ?? 0;
  const manualHits = allProducts.filter((p) => p.is_bestseller);
  const autoHits = [...allProducts].sort((a, b) => likesOf(b.id) - likesOf(a.id)).filter((p) => likesOf(p.id) > 0);
  const seen = new Set<string>();
  const bestsellers = [...manualHits, ...autoHits].filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 4);
  const popular = [...allProducts]
    .map((p) => ({ p, score: viewsOf(p.id) * 1 + likesOf(p.id) * 3 }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 0)
    .slice(0, 4)
    .map((x) => x.p);

  const [recentIds, setRecentIds] = useState<string[]>([]);
  useEffectReact(() => {
    const upd = () => setRecentIds(getRecentlyViewed());
    upd();
    return subscribeRecent(upd);
  }, []);
  const recent = recentIds.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean).slice(0, 4) as typeof allProducts;

  const blockEnabled = (key: string) => {
    const b = blocks.find((x) => x.key === key);
    return b ? b.enabled : true;
  };
  const blockTitle = (key: string, fallback: string) => blocks.find((x) => x.key === key)?.title ?? fallback;
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO SLIDER (управляется через админку) */}
      <HeroSlider />

      {/* Hero features */}
      <section className="mx-auto mt-6 max-w-7xl px-4 md:mt-8 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {heroFeatures.map((f) => (
            <div key={f} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium leading-tight">{f}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Каталог</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Категории мебели
            </h2>
          </div>
          <Link to="/catalog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Смотреть всё <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {categories.map((c, i) => (
            <CategoryCard
              key={c.id}
              slug={c.slug}
              title={c.title}
              image={c.image_url || apartmentImgFallback}
              large={i === 0 && categories.length >= 5}
            />
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      {blockEnabled("bestsellers") && bestsellers.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Популярное</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {blockTitle("bestsellers", "Хиты продаж")}
              </h2>
            </div>
            <Link to="/catalog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Весь каталог <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}

      {/* POPULAR NOW */}
      {blockEnabled("popular") && popular.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Тренд</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {blockTitle("popular", "Популярное сейчас")}
              </h2>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED */}
      {blockEnabled("recently_viewed") && recent.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {blockTitle("recently_viewed", "Вы недавно смотрели")}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((p) => (<ProductCard key={p.id} product={p} />))}
          </div>
        </section>
      )}


      {/* ADVANTAGES */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Преимущества</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Почему выбирают МК Мебель
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {advantages.map((a, i) => (
            <div
              key={a.title}
              className="rounded-3xl border border-border/60 bg-card p-6 transition hover:border-primary/40 hover:shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 font-display font-semibold text-primary">
                  0{i + 1}
                </span>
                <h3 className="font-display text-lg font-semibold">{a.title}</h3>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* APARTMENT */}
      {(() => {
        const headline = (apt as any).home_headline?.trim() || "Поможем завершить весь интерьер";
        const subtext = (apt as any).home_subtext?.trim() || "Мы поможем не только подобрать мебель, но и завершить интерьер вашей квартиры \n\n\nЧерез наших проверенных партнёров вы сможете заказать всё необходимое для комфортного переезда:\n дизайн-проект, текстиль, освещение, декор, ремонтные работы и другие услуги для обустройства квартиры \n\n\n Один магазин. Проверенные специалисты. Готовый результат";
        const cta = (apt as any).home_cta?.trim() || "Начать подбор";
        const img = (apt as any).home_image?.trim() || apartmentImgFallback;
        let listItems: string[] = ["Диван", "Кровать", "Матрас", "Шкаф", "Прихожая", "Стол и стулья"];
        try {
          const parsed = JSON.parse((apt as any).home_items || "[]");
          if (Array.isArray(parsed) && parsed.length > 0) listItems = parsed.filter((x: any) => typeof x === "string" && x.trim());
        } catch { /* fallback */ }
        return (
          <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
            <div className="relative overflow-hidden rounded-[28px] bg-surface md:rounded-[40px]">
              <div className="grid md:grid-cols-2">
                <div className="order-2 p-8 md:order-1 md:p-14">
                  <p className="text-sm font-medium uppercase tracking-wider text-primary">Сервис</p>
                  <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl whitespace-pre-line">
                    {headline}
                  </h2>
                  <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg whitespace-pre-line">
                    {subtext}
                  </p>
                  <ul className="mt-6 space-y-2 text-sm">
                    {listItems.map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/apartment"
                    className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="order-1 md:order-2">
                  <img
                    src={img}
                    alt="Современная квартира"
                    loading="lazy"
                    className="h-full max-h-[520px] w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* REVIEWS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Отзывы</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Нам доверяют
            </h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            {["VK", "Яндекс", "2ГИС"].map((s) => (
              <span key={s} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((r) => (
            <article key={r.id} className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm text-foreground/85">«{r.text}»</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground">{r.source}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">О компании</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              МК Мебель
            </h2>
            <p className="mt-5 text-base text-muted-foreground md:text-lg">
              Собственное производство мебели в Краснодаре. Создаём стильную и качественную мебель по честным ценам — без лишних наценок.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div><div className="font-display text-3xl font-bold text-primary">10+</div><div className="mt-1 text-xs text-muted-foreground">лет опыта</div></div>
              <div><div className="font-display text-3xl font-bold text-primary">100+</div><div className="mt-1 text-xs text-muted-foreground">тканей</div></div>
              <div><div className="font-display text-3xl font-bold text-primary">2 нед.</div><div className="mt-1 text-xs text-muted-foreground">срок</div></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src={factory} alt="Производство" loading="lazy" className="aspect-[3/4] w-full rounded-3xl object-cover" />
            <img src={showroom} alt="Шоурум" loading="lazy" className="mt-8 aspect-[3/4] w-full rounded-3xl object-cover" />
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="rounded-[28px] border border-border/60 bg-surface p-8 md:rounded-[40px] md:p-14">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Контакты</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Приходите в шоурум
              </h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>г. Краснодар, ул. Уссурийская, 17</div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-primary" />
                  <div>Ежедневно 09:00–19:00</div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 text-primary" />
                  <a href="tel:+79180736268" className="font-semibold text-primary">+7 (918) 073-62-68</a>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setContactOpen(true)}
                  className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  Оставить заявку
                </button>
                <Link to="/contacts" className="inline-flex h-11 items-center rounded-full border border-border bg-background px-5 text-sm font-medium">
                  Все контакты
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-background">
              <iframe
                title="МК Мебель на карте"
                src="https://yandex.ru/map-widget/v1/?ll=39.029%2C45.045&z=14&pt=39.029%2C45.045%2Cpm2rdm"
                className="h-72 w-full md:h-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
