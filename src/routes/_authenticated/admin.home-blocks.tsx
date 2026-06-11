import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { homeBlocksQuery, type HomeBlock } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowDown, ArrowUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/home-blocks")({
  component: HomeBlocksAdmin,
});

function HomeBlocksAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(homeBlocksQuery);
  const [rows, setRows] = useState<HomeBlock[]>([]);
  useEffect(() => { setRows(data); }, [data]);

  const update = (i: number, patch: Partial<HomeBlock>) =>
    setRows((r) => r.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const copy = [...rows];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setRows(copy.map((b, idx) => ({ ...b, sort_order: (idx + 1) * 10 })));
  };

  async function save() {
    const sb = supabase as any;
    for (const b of rows) {
      const { error } = await sb.from("home_blocks").update({
        title: b.title, enabled: b.enabled, sort_order: b.sort_order,
      }).eq("key", b.key);
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Сохранено");
    qc.invalidateQueries({ queryKey: ["home_blocks"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Блоки главной страницы</h1>
        <p className="text-sm text-muted-foreground">Включайте, выключайте, переименовывайте и меняйте порядок блоков. «Хиты продаж» выводит товары, отмеченные ☑ в карточке товара, плюс самые лайкаемые. «Популярное сейчас» — товары с максимальными просмотрами и лайками. «Вы недавно смотрели» — история посетителя.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left">
            <tr>
              <th className="px-4 py-3">Порядок</th>
              <th className="px-4 py-3">Ключ</th>
              <th className="px-4 py-3">Заголовок</th>
              <th className="px-4 py-3">Видимость</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={b.key} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-muted"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-muted"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{b.key}</td>
                <td className="px-4 py-3">
                  <input
                    value={b.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={b.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
                    <span>{b.enabled ? "Показан" : "Скрыт"}</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={save} className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground">
        Сохранить
      </button>

      <p className="text-xs text-muted-foreground">
        Чтобы вручную отметить товар как «Хит продаж», откройте карточку товара в админке и включите соответствующий чекбокс. Такие товары всегда отображаются первыми.
      </p>
    </div>
  );
}
