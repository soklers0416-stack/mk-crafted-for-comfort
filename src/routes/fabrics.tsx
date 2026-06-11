import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fabricsQuery, fabricCategoriesQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/cart";
import { PageBanner, PageBlocksRenderer } from "@/components/PageBlocks";

export const Route = createFileRoute("/fabrics")({
  head: () => ({
    meta: [
      { title: "Каталог тканей — МК Мебель" },
      { name: "description", content: "Каталог обивочных тканей: велюр, рогожка, букле, шенилл, экокожа, антивандальные и премиальные ткани." },
      { property: "og:title", content: "Каталог тканей — МК Мебель" },
      { property: "og:description", content: "Образцы тканей и реальные фото мебели в каждой ткани." },
    ],
  }),
  component: FabricsPage,
});

function FabricsPage() {
  const { data: fabrics = [] } = useQuery(fabricsQuery);
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");

  const filtered = fabrics
    .filter((f) => !cat || f.category_slug === cat)
    .filter((f) => !q || f.title.toLowerCase().includes(q.toLowerCase()) || f.code.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner pageKey="fabrics" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Материалы</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Каталог тканей</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
          Более 100 вариантов обивочных тканей. Используем проверенных российских и европейских поставщиков.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setCat("")} className={`rounded-full px-4 py-2 text-sm font-medium ${!cat ? "bg-primary text-primary-foreground" : "bg-surface-muted"}`}>Все ткани</button>
          {cats.map((c) => (
            <button key={c.slug} onClick={() => setCat(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${cat === c.slug ? "bg-primary text-primary-foreground" : "bg-surface-muted"}`}>{c.title}</button>
          ))}
        </div>

        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск ткани по названию или коду"
            className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((f) => (
            <Link key={f.id} to="/fabrics/$id" params={{ id: f.id }}
              className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:shadow-card">
              <div className="aspect-square overflow-hidden bg-surface-muted">
                {f.sample_photo && <img src={f.sample_photo} alt={f.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-semibold leading-tight">{f.title}</h3>
                {f.code && <p className="text-xs text-muted-foreground">Код: {f.code}</p>}
                {f.surcharge > 0 && <p className="mt-1 text-sm font-medium text-primary">+{formatPrice(f.surcharge)}</p>}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-20 text-center text-muted-foreground">
              Тканей пока нет. Добавьте их через админ-панель.
            </p>
          )}
        </div>
      </div>
      <PageBlocksRenderer pageKey="fabrics" />
      <Footer />
    </div>
  );
}
