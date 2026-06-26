import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  aboutContentQuery, aboutAdvantagesQuery, aboutStatsQuery, aboutStepsQuery,
  customerPhotosQuery, galleryItemsQuery, faqsQuery,
} from "@/lib/queries";
import { submitApplication } from "@/lib/applications.functions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { useReveal } from "@/hooks/useReveal";
import { PageBanner, PageBlocksRenderer } from "@/components/PageBlocks";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "О компании — МК Мебель" },
      { name: "description", content: "МК Мебель — собственное производство мебели в Краснодаре. Современный дизайн, честные цены, помощь в подборе." },
      { property: "og:title", content: "О компании — МК Мебель" },
      { property: "og:description", content: "Собственное производство мебели в Краснодаре." },
    ],
  }),
  component: AboutPage,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const safe = name ? name.charAt(0).toUpperCase() + name.slice(1) : "Star";
  const Cmp = (Icons as any)[safe] ?? Icons.Star;
  return <Cmp className={className} />;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ animationDelay: shown ? `${delay}ms` : undefined }}
      className={`${className} ${shown ? "animate-fade-in" : "opacity-0 translate-y-3"} transition-all duration-700`}
    >
      {children}
    </div>
  );
}

function AboutPage() {
  const { data: content = {} } = useQuery(aboutContentQuery);
  const { data: advantages = [] } = useQuery(aboutAdvantagesQuery);
  const { data: stats = [] } = useQuery(aboutStatsQuery);
  const { data: steps = [] } = useQuery(aboutStepsQuery);
  const { data: customers = [] } = useQuery(customerPhotosQuery);
  const { data: gallery = [] } = useQuery(galleryItemsQuery);
  const { data: faqs = [] } = useQuery(faqsQuery);

  const [lightbox, setLightbox] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const submitFn = useServerFn(submitApplication);

  const hero = content.hero ?? {};
  const whyCheaper = content.why_cheaper ?? {};
  const whyUs = content.why_us ?? {};
  const showroom = content.showroom ?? {};
  const consult = content.consult ?? {};

  const submit = useMutation({
    mutationFn: async () => {
      console.log("[MK_REQUEST][client][about-consult][mutation_start]", { hasName: !!name.trim(), hasPhone: !!phone.trim() });
      if (!name.trim() || !phone.trim()) throw new Error("Заполните имя и телефон");
      console.log("[MK_REQUEST][client][about-consult][before_submitApplication]", { payloadKeys: ["name", "phone", "section", "button", "page_url"] });
      const result = await submitFn({
        data: {
          formKey: "about-consult",
          title: "Консультация со страницы «О компании»",
          data: {
            name,
            phone,
            section: "О компании",
            button: consult.button_text ?? "Получить консультацию",
            page_url: typeof window !== "undefined" ? window.location.href : "",
          },
        },
      });
      console.log("[MK_REQUEST][client][about-consult][after_submitApplication]", result);
    },
    onSuccess: () => { console.log("[MK_REQUEST][client][about-consult][success]"); setSent(true); },
    onError: (e: any) => { console.log("[MK_REQUEST][client][about-consult][catch]", { message: e.message, name: e.name, stack: e.stack }); toast.error(e.message); },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageBanner pageKey="about" />

      {/* HERO с фото на фоне и цифрами поверх */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-8 md:py-28 lg:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">О компании</p>
            <h1 className="mt-3 font-display text-5xl font-bold tracking-tight md:text-7xl">
              {hero.title ?? "Создаём мебель, в которой хочется жить"}
            </h1>
            {hero.text && (
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">{hero.text}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.button_text && (
                <a href={hero.button_link ?? "/catalog"} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                  {hero.button_text}<ArrowRight className="h-4 w-4" />
                </a>
              )}
              <a href="#consult" className="inline-flex h-12 items-center rounded-full border border-border bg-card px-6 text-sm font-medium hover:border-primary/40">
                Получить консультацию
              </a>
            </div>
          </Reveal>

          {hero.image && (
            <Reveal delay={120}>
              <div className="relative">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem]">
                  <img src={hero.image} alt="" className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                </div>
                {stats.length > 0 && (
                  <div className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-card p-5 shadow-xl ring-1 ring-border/60 md:block">
                    <div className="font-display text-3xl font-bold text-primary">{stats[0].value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{stats[0].label}</div>
                  </div>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* СТАТИСТИКА — bento */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div
                  key={s.id}
                  className={`group rounded-3xl border border-border/60 bg-card p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg ${
                    i === 0 ? "lg:bg-primary lg:text-primary-foreground lg:border-primary" : ""
                  }`}
                >
                  <div className={`font-display text-4xl font-bold md:text-5xl ${i === 0 ? "lg:text-primary-foreground" : "text-primary"}`}>{s.value}</div>
                  <div className={`mt-3 text-sm ${i === 0 ? "lg:text-primary-foreground/90" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ПРЕИМУЩЕСТВА — карточки с иконками */}
      {advantages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Почему МК Мебель</p>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">Наши преимущества</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a, i) => (
              <Reveal key={a.id} delay={i * 60}>
                <div className="group h-full rounded-3xl border border-border/60 bg-card p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon name={a.icon} className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ПОЧЕМУ У НАС / ПОЧЕМУ ВЫБИРАЮТ */}
      {(whyCheaper.title || whyUs.title) && (
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            {whyCheaper.title && (
              <Reveal>
                <div className="h-full overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">Честная цена</p>
                  <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{whyCheaper.title}</h2>
                  <p className="mt-5 text-primary-foreground/90 whitespace-pre-line">{whyCheaper.text}</p>
                </div>
              </Reveal>
            )}
            {whyUs.title && (
              <Reveal delay={100}>
                <div className="h-full rounded-3xl border border-border/60 bg-card p-8 md:p-12">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">Наш подход</p>
                  <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">{whyUs.title}</h2>
                  <p className="mt-5 text-muted-foreground whitespace-pre-line">{whyUs.text}</p>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* МЕБЕЛЬ У ПОКУПАТЕЛЕЙ — ключевой визуальный блок */}
      {customers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary">Реальные интерьеры</p>
                <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Мебель у наших покупателей</h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Тёплая благодарность нашим клиентам, которые делятся фотографиями своих интерьеров.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4">
            {customers.slice(0, 8).map((c, i) => {
              const span = i % 5 === 0 ? "row-span-2 col-span-2" : i % 7 === 3 ? "row-span-2" : "";
              return (
                <button
                  key={c.id}
                  onClick={() => setLightbox(c.photo)}
                  className={`group relative overflow-hidden rounded-2xl bg-surface-muted ${span}`}
                >
                  <img src={c.photo} alt={c.model || ""} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  {(c.model || c.city || c.comment) && (
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      {c.model && <div className="text-sm font-medium">{c.model}</div>}
                      {c.city && <div className="text-xs opacity-80">{c.city}</div>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ШОУРУМ + ФОТО СЕТКА */}
      {showroom.title && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Шоурум и производство</p>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">{showroom.title}</h2>
              <p className="mt-5 text-muted-foreground whitespace-pre-line">{showroom.text}</p>
              {showroom.button_text && (
                <a href={showroom.button_link ?? "#"} target="_blank" rel="noreferrer"
                   className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {showroom.button_text}<ArrowRight className="h-4 w-4" />
                </a>
              )}
            </Reveal>
            {Array.isArray(showroom.images) && showroom.images.length > 0 && (
              <Reveal delay={120}>
                <div className="grid grid-cols-2 gap-3">
                  {showroom.images.slice(0, 4).map((u: string, i: number) => (
                    <div key={i} className={`overflow-hidden rounded-2xl bg-surface-muted ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
                      <img src={u} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ЭТАПЫ — временная шкала */}
      {steps.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Процесс</p>
              <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">Как мы работаем</h2>
            </div>
          </Reveal>
          <div className="mt-12 relative">
            <div className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-border lg:block" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <Reveal key={s.id} delay={i * 80}>
                  <div className="relative h-full rounded-3xl border border-border/60 bg-card p-6">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground shadow-lg">
                      {i + 1}
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ГАЛЕРЕЯ */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-primary">Атмосфера</p>
                <h2 className="mt-2 font-display text-3xl font-bold md:text-5xl">Галерея</h2>
              </div>
            </div>
          </Reveal>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
            {gallery.map((g) => (
              <button key={g.id} onClick={() => setLightbox(g.photo)} className="group shrink-0 overflow-hidden rounded-3xl">
                <img src={g.photo} alt={g.caption} loading="lazy" className="h-72 w-96 object-cover transition duration-500 group-hover:scale-105" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <Reveal>
            <h2 className="text-center font-display text-3xl font-bold md:text-5xl">Частые вопросы</h2>
          </Reveal>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-border/60">
                <AccordionTrigger className="text-left font-display text-base md:text-lg">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* CONSULT */}
      <section id="consult" className="mx-auto max-w-5xl px-4 pb-24 md:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] bg-primary p-8 text-primary-foreground md:p-14">
            <h2 className="font-display text-3xl font-bold md:text-5xl">{consult.title ?? "Получите консультацию"}</h2>
            {consult.text && <p className="mt-4 max-w-xl text-primary-foreground/85">{consult.text}</p>}
            {sent ? (
              <p className="mt-8 rounded-2xl bg-white/10 p-5 text-sm">Спасибо! Менеджер свяжется с вами в ближайшее время.</p>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className="rounded-full bg-white/10 px-5 py-3.5 text-sm placeholder:text-white/70 outline-none focus:bg-white/20" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" type="tel" className="rounded-full bg-white/10 px-5 py-3.5 text-sm placeholder:text-white/70 outline-none focus:bg-white/20" />
                <button type="submit" disabled={submit.isPending} className="rounded-full bg-white px-7 py-3.5 text-sm font-medium text-primary hover:bg-white/90">
                  {consult.button_text ?? "Получить консультацию"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>

      <PageBlocksRenderer pageKey="about" />
      <Footer />

      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 animate-fade-in" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}
