import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  BANNER_REGISTRY,
  findBannerRow,
  siteBannersQuery,
  type BannerDefaults,
} from "@/lib/siteBanners";

type Props = {
  /** ID плейсмента из BANNER_REGISTRY, например "promotions:hero". */
  id: string;
  /** Можно переопределить дефолты прямо в коде. Используется как фолбэк, если в БД ещё ничего нет. */
  defaults?: Partial<BannerDefaults>;
  className?: string;
};

/**
 * Универсальный баннер сайта.
 * Контент берётся из таблицы page_blocks (kind='hero-banner'), редактируется
 * через админку «Конструктор сайта → Баннеры сайта». Если в БД ничего нет,
 * показываются дефолты из реестра (src/lib/siteBanners.ts).
 */
export function SiteBanner({ id, defaults: defaultsOverride, className }: Props) {
  const placement = BANNER_REGISTRY.find((p) => p.id === id);
  const { data: rows = [] } = useQuery(siteBannersQuery);
  if (!placement) {
    if (typeof window !== "undefined") console.warn(`[SiteBanner] неизвестный id="${id}"`);
    return null;
  }

  const row = findBannerRow(rows, placement);
  if (row && row.is_visible === false) return null;

  const d = { ...placement.defaults, ...(defaultsOverride ?? {}) };
  const settings = row?.settings ?? {};

  const title = (row?.title ?? d.title)?.trim();
  const subtitle = (row?.subtitle ?? d.eyebrow)?.trim();
  const body = (row?.body ?? d.body)?.trim();
  const buttonText = (row?.button_text ?? d.button_text)?.trim();
  const buttonLink = (row?.button_link ?? d.button_link)?.trim();
  const buttonEnabled =
    settings.button_enabled ?? d.button_enabled ?? Boolean(buttonText && buttonLink);
  const align = settings.text_align ?? d.text_align ?? "left";
  const image = row?.image_url || null;
  const overlay = typeof settings.overlay === "number" ? Math.min(1, Math.max(0, settings.overlay)) : image ? 0.35 : 0;
  const bgColor = settings.bg_color || d.bg_color || "";

  const alignText =
    align === "center" ? "text-center items-center" : align === "right" ? "text-right items-end" : "text-left items-start";
  const alignWrap =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";

  const hasImage = Boolean(image);
  const bgStyle: React.CSSProperties = hasImage
    ? {
        backgroundImage: `url("${image}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : bgColor
      ? { background: bgColor }
      : {};

  const noBgFallback = !hasImage && !bgColor;

  return (
    <section className={`mx-auto max-w-7xl px-4 pt-6 md:px-8 md:pt-10 ${className ?? ""}`}>
      <div
        className={`relative overflow-hidden rounded-[24px] md:rounded-[32px] ${
          noBgFallback ? "bg-gradient-to-br from-primary/10 via-primary/5 to-background" : ""
        }`}
        style={bgStyle}
      >
        {hasImage && overlay > 0 && (
          <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden />
        )}

        <div className={`relative z-10 flex ${alignWrap} px-6 py-10 md:px-12 md:py-16 min-h-[220px] md:min-h-[320px]`}>
          <div className={`flex max-w-2xl flex-col gap-3 ${alignText} ${hasImage ? "text-white drop-shadow-sm" : ""}`}>
            {subtitle && (
              <p
                className={`text-xs md:text-sm font-medium uppercase tracking-wider ${
                  hasImage ? "text-white/90" : "text-primary"
                }`}
              >
                {subtitle}
              </p>
            )}
            {title && (
              <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                {title}
              </h1>
            )}
            {body && (
              <p
                className={`max-w-xl text-base md:text-lg ${
                  hasImage ? "text-white/90" : "text-muted-foreground"
                }`}
              >
                {body}
              </p>
            )}
            {buttonEnabled && buttonText && buttonLink && (
              <div className="mt-2">
                <BannerButton text={buttonText} href={buttonLink} onImage={hasImage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function BannerButton({ text, href, onImage }: { text: string; href: string; onImage: boolean }) {
  const cls = `inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition hover:scale-[1.02] ${
    onImage ? "bg-white text-foreground hover:bg-white/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
  }`;
  // Внешние ссылки → <a>, внутренние → Link
  if (/^https?:\/\//.test(href) || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={cls}>
        {text} <ArrowRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      {text} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
