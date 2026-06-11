import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  aboutContentQuery, aboutAdvantagesQuery, aboutStatsQuery, aboutStepsQuery,
  customerPhotosQuery, galleryItemsQuery, faqsQuery,
} from "@/lib/queries";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

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
  const Cmp = (Icons as any)[name?.charAt(0).toUpperCase() + name?.slice(1)] ?? Icons.Star;
  return <Cmp className={className} />;
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
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [sent, setSent] = useState(false);

  const hero = content.hero ?? {};
  const whyCheaper = content.why_cheaper ?? {};
  const whyUs = content.why_us ?? {};
  const showroom = content.showroom ?? {};
  const consult = content.consult ?? {};

  const submit = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !phone.trim()) throw new Error("Заполните имя и телефон");
      const { error } = await (supabase as any).from("requests").insert({ source: "about-consult", title: "Консультация со страницы «О компании»", data: { name, phone }, status: "new" });
      if (error) throw error;
    },
    onSuccess: () => setSent(true),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">О компании</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-6xl">{hero.title ?? "Создаём мебель, в которой хочется жить"}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{hero.text}</p>
            {hero.button_text && (
              <a href={hero.button_link ?? "/catalog"} className="mt-8 inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">{hero.button_text}</a>
            )}
          </div>
          {hero.image && <img src={hero.image} alt="" className="aspect-[4/3] w-full rounded-3xl object-cover" />}
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.id} className="rounded-3xl border border-border/60 bg-card p-6">
                <div className="font-display text-4xl font-bold text-primary">{s.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Advantages */}
      {advantages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Наши преимущества</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a) => (
              <div key={a.id} className="rounded-3xl border border-border/60 bg-card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon name={a.icon} className="h-6 w-6" /></div>
                <h3 className="mt-4 font-display text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why cheaper / Why us */}
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground md:p-10">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{whyCheaper.title}</h2>
            <p className="mt-4 text-primary-foreground/90">{whyCheaper.text}</p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card p-8 md:p-10">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{whyUs.title}</h2>
            <p className="mt-4 text-muted-foreground">{whyUs.text}</p>
          </div>
        </div>
      </section>

      {/* Showroom */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{showroom.title}</h2>
            <p className="mt-4 text-muted-foreground whitespace-pre-line">{showroom.text}</p>
            {showroom.button_text && (
              <a href={showroom.button_link ?? "#"} target="_blank" rel="noreferrer"
                 className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">{showroom.button_text}</a>
            )}
          </div>
          {Array.isArray(showroom.images) && showroom.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {showroom.images.slice(0, 4).map((u: string, i: number) => (
                <img key={i} src={u} alt="" loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Steps */}
      {steps.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Как мы работаем</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.id} className="rounded-3xl border border-border/60 bg-card p-6">
                <div className="font-display text-4xl font-bold text-primary/30">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer photos */}
      {customers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Мебель у наших покупателей</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {customers.map((c) => (
              <button key={c.id} onClick={() => setLightbox(c.photo)} className="group overflow-hidden rounded-2xl bg-surface-muted text-left">
                <img src={c.photo} alt="" loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                <div className="p-3">
                  {c.model && <div className="text-sm font-medium">{c.model}</div>}
                  {c.city && <div className="text-xs text-muted-foreground">{c.city}</div>}
                  {c.comment && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">«{c.comment}»</p>}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Галерея</h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
            {gallery.map((g) => (
              <button key={g.id} onClick={() => setLightbox(g.photo)} className="shrink-0 overflow-hidden rounded-2xl">
                <img src={g.photo} alt={g.caption} loading="lazy" className="h-64 w-80 object-cover" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Часто задаваемые вопросы</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* Consult form */}
      <section className="mx-auto max-w-3xl px-4 pb-20 md:px-8">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
          <h2 className="font-display text-3xl font-bold">{consult.title ?? "Получите консультацию"}</h2>
          <p className="mt-3 text-primary-foreground/85">{consult.text}</p>
          {sent ? (
            <p className="mt-6 rounded-2xl bg-white/10 p-4 text-sm">Спасибо! Менеджер свяжется с вами в ближайшее время.</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="mt-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" className="rounded-full bg-white/10 px-4 py-3 text-sm placeholder:text-white/70 outline-none focus:bg-white/20" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" type="tel" className="rounded-full bg-white/10 px-4 py-3 text-sm placeholder:text-white/70 outline-none focus:bg-white/20" />
              <button type="submit" disabled={submit.isPending} className="rounded-full bg-white px-6 py-3 text-sm font-medium text-primary hover:bg-white/90">{consult.button_text ?? "Получить консультацию"}</button>
            </form>
          )}
        </div>
      </section>

      <Footer />

      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}
