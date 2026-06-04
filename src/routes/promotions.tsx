import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/data";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Акции и скидки — МК Мебель" },
      { name: "description", content: "Действующие акции и специальные предложения МК Мебель." },
      { property: "og:title", content: "Акции и скидки — МК Мебель" },
      { property: "og:description", content: "Скидки и хиты продаж от собственного производства." },
    ],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const list = products.filter((p) => p.sale?.enabled);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Акции</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Действующие акции
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Специальные цены, хиты продаж и ограниченные предложения от собственного производства.
        </p>

        {list.length === 0 ? (
          <p className="mt-12 text-muted-foreground">Сейчас нет действующих акций. Загляните позже.</p>
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
