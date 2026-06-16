import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X, LayoutDashboard, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { ContactDialog } from "./ContactDialog";

const nav = [
  { to: "/catalog", label: "Каталог" },
  { to: "/fabrics", label: "Ткани" },
  { to: "/promotions", label: "Акции" },
  { to: "/apartment", label: "МК Подбор" },
  { to: "/partners", label: "Партнёры" },
  { to: "/reviews", label: "Отзывы" },
  { to: "/about", label: "О компании" },
  { to: "/delivery", label: "Доставка и оплата" },
  { to: "/contacts", label: "Контакты" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const { count } = useCart();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 md:h-20 md:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-display font-bold">
            МК
          </span>
          <span className="hidden sm:block font-display text-lg font-semibold tracking-tight">
            МК Мебель
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/75 transition hover:text-primary"
              activeProps={{ className: "text-primary font-medium" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" aria-label="Админка"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-muted" title="Админка">
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          <Link to="/favorites" aria-label="Избранное" title="Избранное"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface-muted">
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            aria-label="Корзина"
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-surface-muted"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setContactOpen(true)}
            className="hidden md:inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Связаться
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full hover:bg-surface-muted"
            aria-label="Меню"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-foreground/85"
              >
                {n.label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); setContactOpen(true); }}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Связаться
            </button>
          </nav>
        </div>
      )}

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} extraData={{ button: "Связаться", section: "Шапка сайта" }} />
    </header>
  );
}
