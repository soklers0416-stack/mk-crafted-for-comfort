import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/apartment/analytics")({
  component: ApartmentAnalytics,
});

const TYPE_LABELS: Record<string, string> = {
  view: "Открыли раздел",
  start: "Начали собирать",
  submit: "Отправили заявку",
  category_pick: "Выборы категории",
};

function ApartmentAnalytics() {
  const { data: events = [] } = useQuery({
    queryKey: ["apartment_events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("apartment_events").select("event_type, data, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const stats = useMemo(() => {
    const totals: Record<string, number> = { view: 0, start: 0, submit: 0, category_pick: 0 };
    const byMonth: Record<string, Record<string, number>> = {};
    const byCategory: Record<string, number> = {};
    for (const e of events) {
      totals[e.event_type] = (totals[e.event_type] ?? 0) + 1;
      const month = new Date(e.created_at).toISOString().slice(0, 7);
      byMonth[month] ??= { view: 0, start: 0, submit: 0, category_pick: 0 };
      byMonth[month][e.event_type] = (byMonth[month][e.event_type] ?? 0) + 1;
      if (e.event_type === "category_pick" && e.data?.category) {
        byCategory[e.data.category] = (byCategory[e.data.category] ?? 0) + 1;
      }
    }
    const months = Object.keys(byMonth).sort().reverse();
    const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return { totals, byMonth, months, topCats };
  }, [events]);

  return (
    <div className="max-w-5xl">
      <h2 className="font-display text-xl font-semibold">Аналитика «Квартира под ключ»</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {(["view", "start", "submit", "category_pick"] as const).map((k) => (
          <div key={k} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground">{TYPE_LABELS[k]}</div>
            <div className="mt-2 font-display text-3xl font-bold">{stats.totals[k] ?? 0}</div>
          </div>
        ))}
      </div>

      <h3 className="mt-8 font-display text-lg font-semibold">По месяцам</h3>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Месяц</th>
              <th className="p-3">Открыли</th>
              <th className="p-3">Начали сборку</th>
              <th className="p-3">Отправили заявку</th>
              <th className="p-3">Выборов категорий</th>
            </tr>
          </thead>
          <tbody>
            {stats.months.map((m) => (
              <tr key={m} className="border-t border-border">
                <td className="p-3 font-medium">{formatMonth(m)}</td>
                <td className="p-3">{stats.byMonth[m].view}</td>
                <td className="p-3">{stats.byMonth[m].start}</td>
                <td className="p-3">{stats.byMonth[m].submit}</td>
                <td className="p-3">{stats.byMonth[m].category_pick}</td>
              </tr>
            ))}
            {stats.months.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Данных пока нет.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 font-display text-lg font-semibold">Топ категорий</h3>
      <div className="mt-3 space-y-2">
        {stats.topCats.map(([name, count]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex-1 font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{count}</div>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full bg-primary" style={{ width: `${(count / (stats.topCats[0]?.[1] || 1)) * 100}%` }} />
            </div>
          </div>
        ))}
        {stats.topCats.length === 0 && <p className="text-sm text-muted-foreground">Пока никто не выбирал категории.</p>}
      </div>
    </div>
  );
}

function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}
