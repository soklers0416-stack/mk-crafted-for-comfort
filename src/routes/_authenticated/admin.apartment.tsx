import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/apartment")({
  component: ApartmentAdminLayout,
});

function ApartmentAdminLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const tabs = [
    { to: "/admin/apartment", label: "Тексты" },
    { to: "/admin/apartment/categories", label: "Категории комплекта" },
    { to: "/admin/apartment/discounts", label: "Скидки" },
    { to: "/admin/apartment/analytics", label: "Аналитика" },
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-border/60 pb-2">
        {tabs.map((t) => {
          const active = t.to === "/admin/apartment" ? pathname === "/admin/apartment" : pathname === t.to;
          return (
            <Link key={t.to} to={t.to}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                active ? "bg-primary text-primary-foreground" : "hover:bg-surface-muted"
              }`}>
              {t.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-6"><Outlet /></div>
    </div>
  );
}
