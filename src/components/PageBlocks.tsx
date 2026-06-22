import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { pageBlocksQuery, type PageBlock } from "@/lib/pageBlocks";
import { useReveal } from "@/hooks/useReveal";
import { SiteLightbox } from "@/components/SiteLightbox";
import { SiteBanner } from "@/components/SiteBanner";
import { BANNER_REGISTRY } from "@/lib/siteBanners";

/** Системные секции страницы могут быть скрыты через админку. */
export function useSystemBlockVisible(pageKey: string, ref: string) {
  const { data: blocks = [] } = useQuery(pageBlocksQuery(pageKey));
  const b = blocks.find((x) => x.kind === "system" && x.system_ref === ref);
  return b ? b.is_visible : true;
}

/** Верхний баннер страницы. Делегирует в универсальный SiteBanner — управляется через «Баннеры сайта». */
export function PageBanner({ pageKey }: { pageKey: string; fallbackImage?: string }) {
  const placement = BANNER_REGISTRY.find((p) => p.page_key === pageKey && p.ref === "hero");
  if (!placement) return null;
  return <SiteBanner id={placement.id} />;
}

function CustomBlock({ block }: { block: PageBlock }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [lb, setLb] = useState<number | null>(null);

  if (block.kind === "cta") {
    return (
      <section ref={ref} className={`mx-auto max-w-7xl px-4 py-10 md:px-8 ${shown ? "animate-fade-in" : "opacity-0"}`}>
        <div className="rounded-3xl bg-primary/5 p-8 text-center md:p-12">
          {block.title && <h2 className="font-display text-2xl font-bold md:text-3xl">{block.title}</h2>}
          {block.body && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{block.body}</p>}
          {block.button_text && block.button_link && (
            <Link
              to={block.button_link}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              {block.button_text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (block.kind === "gallery") {
    return (
      <section ref={ref} className={`mx-auto max-w-7xl px-4 py-10 md:px-8 ${shown ? "animate-fade-in" : "opacity-0"}`}>
        {block.title && <h2 className="font-display text-2xl font-bold md:text-3xl">{block.title}</h2>}
        {block.subtitle && <p className="mt-2 text-muted-foreground">{block.subtitle}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {block.gallery.map((src, i) => (
            <button
              key={i}
              onClick={() => setLb(i)}
              className="group overflow-hidden rounded-2xl bg-surface-muted"
            >
              <img
                src={src}
                alt=""
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
        <SiteLightbox open={lb !== null} index={lb ?? 0} images={block.gallery} onClose={() => setLb(null)} />
      </section>
    );
  }

  // default: text-image
  return (
    <section ref={ref} className={`mx-auto max-w-7xl px-4 py-10 md:px-8 ${shown ? "animate-fade-in" : "opacity-0"}`}>
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          {block.subtitle && (
            <p className="text-sm font-medium uppercase tracking-wider text-primary">{block.subtitle}</p>
          )}
          {block.title && (
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{block.title}</h2>
          )}
          {block.body && (
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{block.body}</p>
          )}
          {block.button_text && block.button_link && (
            <Link
              to={block.button_link}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              {block.button_text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        {block.image_url && (
          <div className="overflow-hidden rounded-3xl bg-surface-muted">
            <img
              src={block.image_url}
              alt={block.title || ""}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** Рендерит пользовательские блоки (text-image / gallery / cta) указанной страницы. */
export function PageBlocksRenderer({ pageKey }: { pageKey: string }) {
  const { data: blocks = [] } = useQuery(pageBlocksQuery(pageKey));
  const custom = blocks.filter(
    (b) => b.is_visible && b.kind !== "system" && b.kind !== "hero-banner",
  );
  if (custom.length === 0) return null;
  return (
    <>
      {custom.map((b) => (
        <CustomBlock key={b.id} block={b} />
      ))}
    </>
  );
}
