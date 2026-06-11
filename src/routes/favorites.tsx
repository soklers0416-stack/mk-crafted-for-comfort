import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { productsQuery } from "@/lib/queries";
import { getFavorites, subscribeFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Избранное — МК Мебель" },
      { name: "description", content: "Сохранённые товары МК Мебель." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(getFavorites());
    return subscribeFavorites(() => setIds(getFavorites()));
  }, []);
  const { data: all = [] } = useQuery(productsQuery);
  const items = ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) as any[];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <h1 className="font-display text-3xl font-bold md:text-4xl">Избранное</h1>
        <p className="mt-2 text-sm text-muted-foreground">Сохранённые товары хранятся в вашем браузере.</p>

        {items.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Heart className="h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">В избранном пока ничего нет.</p>
            <Link to="/catalog" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
