import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsQuery, productStatsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin/product-stats")({
  component: ProductStatsAdmin,
});

type SortKey = "popularity" | "views" | "likes" | "cart_adds" | "title";

function ProductStatsAdmin() {
  const { data: products = [] } = useQuery(productsQuery);
  const { data: stats = [] } = useQuery(productStatsQuery);
  const [sort, setSort] = useState<SortKey>("popularity");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const m = new Map(stats.map((s) => [s.product_id, s]));
    const list = products.map((p) => {
      const s = m.get(p.id);
      const views = s?.views ?? 0, likes = s?.likes ?? 0, cart_adds = s?.cart_adds ?? 0;
      const popularity = views + likes * 3 + cart_adds * 5 + (p.is_bestseller ? 1000 : 0);
      return { p, views, likes, cart_adds, popularity };
    });
    const filtered = q ? list.filter((r) => r.p.title.toLowerCase().includes(q.toLowerCase())) : list;
    return filtered.sort((a, b) => {
      if (sort === "title") return a.p.title.localeCompare(b.p.title);
      return (b as any)[sort] - (a as any)[sort];
    });
  }, [products, stats, sort, q]);

  const total = stats.reduce((acc, s) => ({
    views: acc.views + (s.views ?? 0),
    likes: acc.likes + (s.likes ?? 0),
    cart_adds: acc.cart_adds + (s.cart_adds ?? 0),
  }), { views: 0, likes: 0, cart_adds: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Статистика товаров</h1>
        <p className="text-sm text-muted-foreground">Просмотры, лайки (добавления в избранное), добавления в корзину и общий рейтинг популярности.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Всего просмотров" value={total.views} />
        <Stat label="Всего лайков" value={total.likes} />
        <Stat label="Всего в корзину" value={total.cart_adds} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по названию"
          className="h-10 w-72 rounded-full border border-border bg-background px-4 text-sm" />
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-10 rounded-full border border-border bg-background px-4 text-sm">
          <option value="popularity">Сортировка: Рейтинг популярности</option>
          <option value="views">Просмотры</option>
          <option value="likes">Лайки</option>
          <option value="cart_adds">В корзину</option>
          <option value="title">Название (A→Я)</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              <th className="px-4 py-3">Товар</th>
              <th className="px-4 py-3 text-right">Просмотры</th>
              <th className="px-4 py-3 text-right">Лайки</th>
              <th className="px-4 py-3 text-right">В корзину</th>
              <th className="px-4 py-3 text-right">Рейтинг</th>
              <th className="px-4 py-3">Хит</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, views, likes, cart_adds, popularity }) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link to="/admin/products/$id" params={{ id: p.id }} className="font-medium hover:text-primary">{p.title}</Link>
                  <div className="text-xs text-muted-foreground">{p.category_slug}</div>
                </td>
                <td className="px-4 py-3 text-right">{views}</td>
                <td className="px-4 py-3 text-right">{likes}</td>
                <td className="px-4 py-3 text-right">{cart_adds}</td>
                <td className="px-4 py-3 text-right font-semibold">{popularity}</td>
                <td className="px-4 py-3">{p.is_bestseller ? "✓" : ""}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Нет данных</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value.toLocaleString("ru-RU")}</div>
    </div>
  );
}
