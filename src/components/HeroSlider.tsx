import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { homeSlidesQuery } from "@/lib/pageBlocks";
import hero from "@/assets/hero-living.jpg";

export function HeroSlider() {
  const { data: slides = [] } = useQuery(homeSlidesQuery);
  const visible = slides.filter((s) => s.is_visible);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, duration: 30 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    const t = setInterval(() => embla.scrollNext(), 6000);
    return () => { clearInterval(t); embla.off("select", onSelect); };
  }, [embla]);

  if (visible.length === 0) return null;

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[28px] md:rounded-[40px] bg-surface-muted">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {visible.map((s, i) => (
                <div key={s.id} className="relative min-w-0 flex-[0_0_100%]">
                  <div
                    className="relative flex flex-col md:block md:h-[640px]"
                    style={{ background: s.bg_color || "#f5f3ee" }}
                  >
                    {/* Image: bottom on mobile, full-cover on desktop */}
                    <div className="order-2 md:order-none md:absolute md:inset-0 h-[260px] md:h-full w-full overflow-hidden">
                      <img
                        src={s.image_url || hero}
                        alt={s.title}
                        className={`h-full w-full object-cover object-center transition-transform duration-1000 ${index === i ? "scale-100" : "scale-105"}`}
                      />
                      {/* Gradient overlay only on desktop, behind text on the left */}
                      <div className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
                    </div>

                    {/* Text: top on mobile, overlay-left on desktop */}
                    <div className="order-1 md:order-none relative md:absolute md:inset-y-0 md:left-0 z-10 flex items-center px-6 py-8 md:px-14 md:py-0 md:w-1/2">
                      <div className={`max-w-xl ${index === i ? "animate-fade-in" : "opacity-0"}`}>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur md:bg-white/90">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          МК Мебель · Краснодар
                        </span>
                        <h1 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-white sm:text-4xl md:text-5xl lg:text-6xl md:drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                          {s.title}
                        </h1>
                        {s.subtitle && (
                          <p className="mt-5 max-w-lg text-base text-foreground/75 md:text-white/90 md:text-lg md:drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">{s.subtitle}</p>
                        )}
                        {s.button_text && s.button_link && (
                          <div className="mt-7">
                            <Link
                              to={s.button_link}
                              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
                            >
                              {s.button_text}
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {visible.length > 1 && (
            <>
              <button
                onClick={() => embla?.scrollPrev()}
                aria-label="Предыдущий слайд"
                className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground shadow backdrop-blur hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => embla?.scrollNext()}
                aria-label="Следующий слайд"
                className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground shadow backdrop-blur hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {visible.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => embla?.scrollTo(i)}
                    aria-label={`Слайд ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${index === i ? "w-8 bg-primary" : "w-2 bg-white/70"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
