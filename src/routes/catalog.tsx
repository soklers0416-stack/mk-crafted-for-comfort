import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/data";

const search = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/catalog")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Каталог мебели — МК Мебель" },
      { name: "description", content: "Каталог мебели МК Мебель: диваны, кровати, шкафы, столы, прихожие и матрасы." },
      { property: "og:title", content: "Каталог мебели — МК Мебель" },
      { property: "og:description", content: "Стильная мебель собственного производства." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();

  const list = category ? products.filter((p) => p.category === category) : products;
  const current = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Каталог</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
          {current ? current.title : "Вся мебель"}
        </h1>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => navigate({ search: {} })}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              !category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
            }`}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate({ search: { category: c.slug } })}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === c.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-12 text-muted-foreground">Скоро добавим товары в эту категорию.</p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
