import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, MapPin, Phone, Clock, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { ContactDialog } from "@/components/ContactDialog";
import { bestsellers, advantages, heroFeatures, reviews } from "@/lib/data";
import hero from "@/assets/hero-living.jpg";
import apartmentImg from "@/assets/apartment.jpg";
import factory from "@/assets/factory.jpg";
import showroom from "@/assets/showroom.jpg";
import catSofa from "@/assets/cat-sofa.jpg";
import catBed from "@/assets/cat-bed.jpg";
import catMattress from "@/assets/cat-mattress.jpg";
import catWardrobe from "@/assets/cat-wardrobe.jpg";
import catHallway from "@/assets/cat-hallway.jpg";
import catDining from "@/assets/cat-dining.jpg";
import catKids from "@/assets/cat-kids.jpg";

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
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-12">
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px]">
            <img
              src={hero}
              alt="Современная гостиная МК Мебель"
              width={1920}
              height={1080}
              className="h-[560px] w-full object-cover md:h-[680px]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/85 via-white/45 to-transparent md:from-white/75 md:via-white/30" />
            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-6 md:px-14">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Производство в Краснодаре
                  </span>
                  <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                    Ваш дом.<br />
                    Ваш стиль.<br />
                    <span className="text-primary">Наша мебель.</span>
                  </h1>
                  <p className="mt-5 max-w-lg text-base text-foreground/75 md:text-lg">
                    Собственное производство в Краснодаре. Стильная мебель без наценок.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/catalog"
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Перейти в каталог
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/apartment"
                      className="inline-flex h-12 items-center rounded-full border border-foreground/15 bg-white/85 px-6 text-sm font-medium text-foreground backdrop-blur transition hover:border-primary hover:text-primary"
                    >
                      Квартира под ключ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero features */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
            {heroFeatures.map((f) => (
              <div key={f} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm font-medium leading-tight">{f}</span>
              </div>
            ))}
          </div>
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
          <CategoryCard slug="sofas" title="Диваны" image={catSofa} large />
          <CategoryCard slug="beds" title="Кровати" image={catBed} />
          <CategoryCard slug="mattresses" title="Матрасы" image={catMattress} />
          <CategoryCard slug="wardrobes" title="Шкафы" image={catWardrobe} />
          <CategoryCard slug="hallways" title="Прихожие" image={catHallway} />
          <CategoryCard slug="dining" title="Столы и стулья" image={catDining} />
          <CategoryCard slug="kids" title="Детские кровати" image={catKids} />
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Популярное</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Хиты продаж
            </h2>
          </div>
          <Link to="/catalog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Весь каталог <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

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
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] bg-surface md:rounded-[40px]">
          <div className="grid md:grid-cols-2">
            <div className="order-2 p-8 md:order-1 md:p-14">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Сервис</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">
                Квартира под ключ
              </h2>
              <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
                Подберите мебель для всей квартиры в одном месте. Соберите свой комплект и отправьте заявку менеджеру.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {["Диван", "Кровать", "Матрас", "Шкаф", "Прихожая", "Стол и стулья"].map((s) => (
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
                Начать подбор
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="order-1 md:order-2">
              <img
                src={apartmentImg}
                alt="Современная квартира"
                loading="lazy"
                className="h-full max-h-[520px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

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
            <article key={r.name} className="rounded-3xl border border-border/60 bg-card p-6">
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
