import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import factory from "@/assets/factory.jpg";
import showroom from "@/assets/showroom.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О компании — МК Мебель" },
      { name: "description", content: "МК Мебель — собственное производство мебели в Краснодаре. Стильная и качественная мебель по честным ценам." },
      { property: "og:title", content: "О компании — МК Мебель" },
      { property: "og:description", content: "Собственное производство мебели в Краснодаре." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">О компании</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">МК Мебель</h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          Собственное производство мебели в Краснодаре. Создаём стильную и качественную мебель по честным ценам — без лишних наценок.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { v: "10+", t: "лет опыта" },
            { v: "100+", t: "вариантов тканей" },
            { v: "от 2 нед.", t: "срок изготовления" },
          ].map((s) => (
            <div key={s.t} className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-4xl font-bold text-primary">{s.v}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.t}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <figure>
            <img src={factory} alt="Производство МК Мебель" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
            <figcaption className="mt-3 text-sm text-muted-foreground">Наше производство</figcaption>
          </figure>
          <figure>
            <img src={showroom} alt="Шоурум МК Мебель" loading="lazy" className="aspect-[4/3] w-full rounded-3xl object-cover" />
            <figcaption className="mt-3 text-sm text-muted-foreground">Шоурум на Уссурийской, 17</figcaption>
          </figure>
        </div>
      </div>
      <Footer />
    </div>
  );
}
