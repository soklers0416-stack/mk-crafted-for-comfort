import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { SOFA_TYPES } from "@/lib/db";

const search = z.object({ category: z.string().optional(), sofa_type: z.string().optional() });

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
  const { category, sofa_type } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: products = [], isLoading } = useQuery(productsQuery);

  let list = category
    ? products.filter((p) => p.category_slug === category || (p.category_slugs ?? []).includes(category))
    : products;
  const isSofa = category === "sofas" || category === "divany" || category === "divan";
  if (isSofa && sofa_type) list = list.filter((p) => p.sofa_type === sofa_type);
  const current = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteBanner id="catalog:hero" defaults={{ title: current ? current.title : "Вся мебель" }} />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap gap-2">

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

        {isSofa && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => navigate({ search: { category } })}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                !sofa_type ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"
              }`}
            >
              Все типы
            </button>
            {SOFA_TYPES.map((t) => (
              <button
                key={t.slug}
                onClick={() => navigate({ search: { category, sofa_type: t.slug } })}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  sofa_type === t.slug ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <p className="mt-12 text-muted-foreground">Загрузка…</p>
        ) : list.length === 0 ? (
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
