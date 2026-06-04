import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products, type Product } from "./data";

export type CartItem = { id: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
  detailed: (CartItem & { product: Product })[];
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "mk-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = (id: string, qty = 1) =>
    setItems((prev) => {
      const i = prev.find((x) => x.id === id);
      if (i) return prev.map((x) => (x.id === id ? { ...x, qty: x.qty + qty } : x));
      return [...prev, { id, qty }];
    });
  const remove = (id: string) => setItems((p) => p.filter((x) => x.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x)));
  const clear = () => setItems([]);

  const detailed = items
    .map((it) => {
      const product = products.find((p) => p.id === it.id);
      return product ? { ...it, product } : null;
    })
    .filter(Boolean) as (CartItem & { product: Product })[];

  const count = items.reduce((s, x) => s + x.qty, 0);
  const total = detailed.reduce((s, x) => {
    const price = x.product.sale?.enabled && x.product.sale.newPrice
      ? x.product.sale.newPrice
      : x.product.price;
    return s + price * x.qty;
  }, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, setQty, clear, count, total, detailed }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("CartProvider missing");
  return c;
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";
