import { createFileRoute, Link } from "@tanstack/react-router";
import { PAGE_KEYS } from "@/lib/pageBlocks";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/page-blocks/")({
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
      <h1 className="font-display text-2xl font-bold">Конструктор страниц</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Выберите страницу для редактирования баннера, порядка блоков, добавления новых блоков и галерей.
      </p>
      <div className="mt-6 grid gap-3">
        {PAGE_KEYS.map((p) => (
          <Link
            key={p.key}
            to="/admin/page-blocks/$pageKey"
            params={{ pageKey: p.key }}
            className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition hover:border-primary"
          >
            <div>
              <div className="font-medium">{p.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">/{p.key}</div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}
