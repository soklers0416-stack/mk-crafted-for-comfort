import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { formatPrice, useCart } from "@/lib/cart";
import type { Product } from "@/lib/db";
import { FavoriteButton } from "@/components/FavoriteButton";
import { incrementStat } from "@/lib/favorites";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [hover, setHover] = useState(false);
  const sale = product.sale_enabled ? product : null;
  const displayPrice = sale?.sale_new_price ?? product.price;
  const hasSecond = Boolean(product.photo2);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:shadow-card">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="relative block aspect-[5/4] overflow-hidden bg-card"
      >
        {product.photo1 && (
          <img
            src={product.photo1}
            alt={product.title}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-500 ${hover && hasSecond ? "opacity-0" : "opacity-100"}`}
          />
        )}
        {hasSecond && (
          <img
            src={product.photo2!}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-contain p-4 transition-opacity duration-500 ${hover ? "opacity-100" : "opacity-0"}`}
          />
        )}
        {sale && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow">
            {product.sale_label ?? "АКЦИЯ"}
          </span>
        )}
        <FavoriteButton id={product.id} className="absolute right-3 top-3 h-9 w-9" />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <Link to="/product/$id" params={{ id: product.id }}>
            <h3 className="font-display text-lg font-semibold leading-tight hover:text-primary">{product.title}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        </div>

        {product.availability && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {product.availability === "в наличии" ? "В наличии" : "Под заказ"}
          </div>
        )}

        <ul className="space-y-1 text-xs text-muted-foreground">
          {product.sleeping_place && product.sleeping_place !== "—" && (
            <li>Спальное место: <span className="text-foreground font-medium">{product.sleeping_place}</span></li>
          )}
          {product.mechanism && product.mechanism !== "—" && (
            <li>Механизм: <span className="text-foreground font-medium">{product.mechanism}</span></li>
          )}
          {product.filling && product.filling !== "—" && (
            <li>Наполнение: <span className="text-foreground font-medium">{product.filling}</span></li>
          )}
          {typeof product.has_box === "boolean" && (
            <li>Короб: <span className="text-foreground font-medium">{product.has_box ? "есть" : "нет"}</span></li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {sale?.sale_old_price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(sale.sale_old_price)}</span>
            )}
            <span className="font-display text-xl font-semibold">
              {product.price_from && <span className="text-sm font-normal text-muted-foreground">от </span>}
              {formatPrice(displayPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/product/$id"
            params={{ id: product.id }}
            className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-center text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            Подробнее
          </Link>
          <button
            onClick={() => { add(product.id); incrementStat(product.id, "cart_adds"); toast.success("Добавлено в корзину"); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" />
            В корзину
          </button>
          <FavoriteButton id={product.id} className="h-10 w-10 shrink-0" />
        </div>
      </div>
    </article>
  );
}
