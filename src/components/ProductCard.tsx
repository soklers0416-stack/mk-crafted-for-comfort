import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { formatPrice } from "@/lib/cart";
import type { Product } from "@/lib/data";
import { RequestDialog } from "@/components/RequestDialog";

export function ProductCard({ product }: { product: Product }) {
  const [requestOpen, setRequestOpen] = useState(false);
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
          src={product.photo1}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-contain p-3 transition duration-700 group-hover:scale-[1.03]"
        />
        {sale && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow">
            {sale.label ?? "АКЦИЯ"}
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

        {/* Краткие характеристики */}
        <ul className="space-y-1 text-xs text-muted-foreground">
          {product.sleepingPlace && product.sleepingPlace !== "—" && (
            <li>Спальное место: <span className="text-foreground">{product.sleepingPlace}</span></li>
          )}
          {product.mechanism && product.mechanism !== "—" && (
            <li>Механизм: <span className="text-foreground">{product.mechanism}</span></li>
          )}
          {product.availability && (
            <li>Наличие: <span className="text-foreground">{product.availability === "в наличии" ? "В наличии" : "Под заказ"}</span></li>
          )}
        </ul>

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
            onClick={() => setRequestOpen(true)}
            className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Оставить заявку
          </button>
        </div>
      </div>

      <RequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        title={`Заявка: ${product.title}`}
        description="Оставьте контакты — менеджер свяжется с вами."
        source={`card:${product.id}`}
        fields={[
          { name: "name", label: "Имя" },
          { name: "phone", label: "Телефон", type: "tel" },
          { name: "comment", label: "Комментарий", required: false },
        ]}
      />
    </article>
  );
}
