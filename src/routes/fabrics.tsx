import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Info } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fabricsQuery, fabricCategoriesQuery, fabricColorsByCollectionQuery } from "@/lib/queries";
import { PageBanner, PageBlocksRenderer } from "@/components/PageBlocks";
import { FabricDetailModal } from "@/components/FabricDetailModal";
import type { Fabric } from "@/lib/db";

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
  const [active, setActive] = useState<Fabric | null>(null);

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
          <button onClick={() => setCat("")} className={`rounded-full px-4 py-2 text-sm font-medium transition ${!cat ? "bg-primary text-primary-foreground" : "bg-surface-muted hover:bg-surface"}`}>Все ткани</button>
          {cats.map((c) => (
            <button key={c.slug} onClick={() => setCat(c.slug)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${cat === c.slug ? "bg-primary text-primary-foreground" : "bg-surface-muted hover:bg-surface"}`}>{c.title}</button>
          ))}
        </div>

        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск ткани по названию или коду"
            className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {filtered.map((f) => (
            <FabricCollectionRow key={f.id} fabric={f} onOpen={() => setActive(f)} />
          ))}
          {filtered.length === 0 && (
            <p className="py-20 text-center text-muted-foreground">
              Тканей пока нет. Добавьте их через админ-панель.
            </p>
          )}
        </div>
      </div>
      <PageBlocksRenderer pageKey="fabrics" />
      <Footer />
      <FabricDetailModal fabric={active} onClose={() => setActive(null)} />
    </div>
  );
}

function FabricCollectionRow({ fabric, onOpen }: { fabric: Fabric; onOpen: () => void }) {
  const { data: colors = [] } = useQuery(fabricColorsByCollectionQuery(fabric.id));
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const cat = cats.find((c) => c.slug === fabric.category_slug);

  return (
    <article className="overflow-visible rounded-3xl border border-border/60 bg-card p-6 transition hover:shadow-card md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-5">
        <div className="min-w-0">
          {cat && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {cat.title}
            </p>
          )}
          <h3 className="mt-1 font-display text-3xl font-bold leading-tight md:text-4xl">{fabric.title}</h3>
        </div>
        <button
          onClick={onOpen}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          <Info className="h-3.5 w-3.5" />
          Подробнее о ткани
        </button>
      </header>

      <div className="mt-6">
        {colors.length > 0 ? (
          <div className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-5 md:overflow-visible lg:grid-cols-7 xl:grid-cols-8">
            {colors.map((c) => (
              <FabricSwatch key={c.id} photo={c.photo} name={c.name} code={c.code} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Цвета пока не добавлены</p>
        )}
      </div>
    </article>
  );
}

function FabricSwatch({ photo, name, code }: { photo?: string | null; name?: string | null; code?: string | null }) {
  const [hover, setHover] = useState(false);
  const [tap, setTap] = useState(false);
  const show = hover || tap;
  return (
    <div
      className="group relative w-28 shrink-0 snap-start md:w-auto"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTap(false); }}
      onClick={() => setTap((v) => !v)}
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-surface-muted ring-1 ring-border transition-transform duration-200 group-hover:scale-[1.03]">
        {photo && <img src={photo} alt={name || code || ""} loading="lazy" className="h-full w-full object-cover" />}
      </div>
      {(code || name) && (
        <p className="mt-2 truncate text-center text-xs font-medium text-foreground">{code || name}</p>
      )}
      {photo && show && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 sm:block">
          <div className="h-[300px] w-[300px] overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-scale-in">
            <img src={photo} alt={name || code || ""} className="h-full w-full object-cover" />
          </div>
          {(code || name) && (
            <p className="mt-2 text-center text-xs font-semibold text-foreground drop-shadow">{code || name}</p>
          )}
        </div>
      )}
    </div>
  );
}
