import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { productsQuery } from "@/lib/queries";
import { SiteBanner } from "@/components/SiteBanner";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Акции и скидки — МК Мебель" },
      { name: "description", content: "Действующие акции и специальные предложения МК Мебель." },
    ],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const { data: products = [] } = useQuery(productsQuery);
  const list = products.filter((p) => p.sale_enabled);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteBanner id="promotions:hero" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        {list.length === 0 ? (
          <p className="text-muted-foreground">Сейчас нет действующих акций. Загляните позже.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
