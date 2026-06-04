import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { formatPrice, useCart } from "@/lib/cart";
import type { Product } from "@/lib/data";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const sale = product.sale?.enabled ? product.sale : null;
  const displayPrice = sale?.newPrice ?? product.price;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:shadow-card">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-[5/4] overflow-hidden bg-surface-muted"
      >
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {sale && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow">
            {sale.label}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <Link to="/product/$id" params={{ id: product.id }}>
            <h3 className="font-display text-lg font-semibold leading-tight hover:text-primary">{product.title}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {sale?.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(sale.oldPrice)}</span>
            )}
            <span className="font-display text-xl font-semibold">
              {product.priceFrom && <span className="text-sm font-normal text-muted-foreground">от </span>}
              {formatPrice(displayPrice)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-center text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            Подробнее
          </Link>
          <button
            onClick={() => { add(product.id); toast.success("Добавлено в корзину"); }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            aria-label="В корзину"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">В корзину</span>
          </button>
        </div>
      </div>
    </article>
  );
}
