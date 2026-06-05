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

  const tabs = [
    { to: "/admin", label: "Товары" },
    { to: "/admin/categories", label: "Категории" },
    { to: "/admin/reviews", label: "Отзывы" },
    { to: "/admin/requests", label: "Заявки" },
  ];

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
          {tabs.map((t) => {
            const active = t.to === "/admin" ? pathname === "/admin" : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
