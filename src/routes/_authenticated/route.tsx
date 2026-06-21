import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading, signOut } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Загрузка…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">Нет доступа</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Этот аккаунт не является администратором. Войдите под учётной записью владельца сайта.
          </p>
          <button
            onClick={() => signOut().then(() => location.href = "/auth")}
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
          >
            Выйти
          </button>
        </div>
      </div>
    );
  }

  type Tab = { to: string; label: string; exact?: boolean };
  type Group = { key: string; label: string; tabs: Tab[] };

  const groups: Group[] = [
    {
      key: "catalog",
      label: "Каталог",
      tabs: [
        { to: "/admin", label: "Товары", exact: true },
        { to: "/admin/categories", label: "Категории" },
        { to: "/admin/specs", label: "Справочник характеристик" },
        { to: "/admin/apartment", label: "Квартира под ключ" },
        { to: "/admin/product-stats", label: "Статистика" },
      ],
    },
    {
      key: "fabrics",
      label: "Ткани",
      tabs: [
        { to: "/admin/fabrics", label: "Ткани", exact: true },
        { to: "/admin/fabrics/categories", label: "Категории" },
        { to: "/admin/fabrics/characteristics", label: "Характеристики" },
      ],
    },
    {
      key: "partners",
      label: "Партнёры",
      tabs: [
        { to: "/admin/partners", label: "Партнёры", exact: true },
        { to: "/admin/partners/categories", label: "Категории" },
        { to: "/admin/partners/content", label: "Тексты" },
      ],
    },
    {
      key: "content",
      label: "Контент",
      tabs: [
        { to: "/admin/about", label: "О компании" },
        { to: "/admin/customer-photos", label: "Фото клиентов" },
        { to: "/admin/gallery", label: "Галерея" },
        { to: "/admin/faqs", label: "FAQ" },
        { to: "/admin/reviews", label: "Отзывы" },
      ],
    },
    {
      key: "requests",
      label: "Заявки",
      tabs: [
        { to: "/admin/applications", label: "Заявки" },
        { to: "/admin/partner-applications", label: "Заявки партнёров" },
        { to: "/admin/forms", label: "Формы заявок" },
        { to: "/admin/integrations", label: "Интеграции" },
      ],
    },
    {
      key: "site",
      label: "Сайт",
      tabs: [
        { to: "/admin/nav", label: "Меню (шапка)" },
        { to: "/admin/home-blocks", label: "Блоки главной" },
        { to: "/admin/home-slides", label: "Слайдер главной" },
        { to: "/admin/page-blocks", label: "Конструктор страниц" },
      ],
    },
  ];

  const tabActive = (t: Tab) => (t.exact ? pathname === t.to : pathname === t.to || pathname.startsWith(t.to + "/"));
  const activeGroup = groups.find((g) => g.tabs.some(tabActive)) ?? groups[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="font-display text-lg font-semibold">МК Мебель · Админка</Link>
          <button
            onClick={() => signOut().then(() => location.href = "/")}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Выйти
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 md:px-8">
          {groups.map((g) => {
            const active = g.key === activeGroup.key;
            const first = g.tabs[0];
            return (
              <Link
                key={g.key}
                to={first.to}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {g.label}
              </Link>
            );
          })}
        </nav>
        {activeGroup.tabs.length > 1 && (
          <div className="border-t border-border/60 bg-surface-muted/40">
            <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 md:px-8">
              {activeGroup.tabs.map((t) => {
                const active = tabActive(t);
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 my-2 text-xs font-medium transition ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
