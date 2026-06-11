import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, Phone, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  partnerCategoriesQuery,
  publicPartnersQuery,
  partnersContentQuery,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useReveal } from "@/hooks/useReveal";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Партнёры — МК Мебель" },
      { name: "description", content: "Дизайнеры интерьера, магазины дверей, обоев, освещения и другие проверенные партнёры МК Мебель." },
      { property: "og:title", content: "Партнёры — МК Мебель" },
      { property: "og:description", content: "Создаём красивые интерьеры вместе с проверенными партнёрами." },
    ],
  }),
  component: PartnersPage,
});

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(100),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z.string().trim().min(5, "Укажите телефон").max(40),
  email: z.string().trim().email("Некорректный email").max(150).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  category_slug: z.string().trim().max(50),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

function PartnersPage() {
  const { data: content = {} } = useQuery(partnersContentQuery);
  const { data: categories = [] } = useQuery(partnerCategoriesQuery);
  const { data: partners = [] } = useQuery(publicPartnersQuery);
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(
    () => (activeCat === "all" ? partners : partners.filter((p) => p.category_slug === activeCat)),
    [partners, activeCat],
  );

  const hero = useReveal<HTMLDivElement>();
  const cats = useReveal<HTMLDivElement>();
  const form = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div
          ref={hero.ref}
          className={`grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] ${hero.shown ? "animate-fade-in" : "opacity-0"}`}
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Партнёры</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
              {content.hero_title || "Создаём красивые интерьеры вместе"}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {content.hero_text}
            </p>
            <a href="#apply" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
              {content.hero_cta || "Стать партнёром"}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {partners.slice(0, 4).map((p) => (
              <div key={p.id} className="aspect-square overflow-hidden rounded-3xl bg-surface-muted">
                {p.main_photo || p.logo ? (
                  <img src={p.main_photo || p.logo!} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><Building2 className="h-10 w-10" /></div>
                )}
              </div>
            ))}
            {partners.length === 0 && (
              <div className="col-span-2 grid aspect-[2/1] place-items-center rounded-3xl bg-surface-muted text-sm text-muted-foreground">
                Партнёры скоро появятся
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          {content.partners_section_title || "Наши партнёры"}
        </h2>

        <div ref={cats.ref} className={`mt-6 flex flex-wrap gap-2 ${cats.shown ? "animate-fade-in" : "opacity-0"}`}>
          <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")} label="Все" count={partners.length} />
          {categories.map((c) => {
            const count = partners.filter((p) => p.category_slug === c.slug).length;
            if (count === 0) return null;
            return (
              <CatChip
                key={c.slug}
                active={activeCat === c.slug}
                onClick={() => setActiveCat(c.slug)}
                label={c.title}
                count={count}
              />
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            В этой категории пока нет партнёров.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const cat = categories.find((c) => c.slug === p.category_slug);
              return (
                <Link
                  key={p.id}
                  to="/partners/$id"
                  params={{ id: p.id }}
                  className="group overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                    {p.main_photo ? (
                      <img src={p.main_photo} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><Building2 className="h-10 w-10" /></div>
                    )}
                    {p.logo && (
                      <div className="absolute bottom-3 left-3 grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white shadow-md">
                        <img src={p.logo} alt="" className="h-full w-full object-contain p-1" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {cat && <span className="text-xs font-medium uppercase tracking-wider text-primary">{cat.title}</span>}
                    <h3 className="mt-1 font-display text-lg font-semibold">{p.title}</h3>
                    {p.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>}
                    <div className="mt-4 flex items-center justify-between text-sm">
                      {p.phone ? (
                        <a href={`tel:${p.phone}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-primary">
                          <Phone className="h-3.5 w-3.5" />{p.phone}
                        </a>
                      ) : <span />}
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        Подробнее <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section id="apply" className="mx-auto max-w-5xl px-4 pb-20 md:px-8">
        <div
          ref={form.ref}
          className={`overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-12 ${form.shown ? "animate-fade-in" : "opacity-0"}`}
        >
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            {content.apply_title || "Приглашаем к сотрудничеству"}
          </h2>
          <p className="mt-3 max-w-2xl text-primary-foreground/90">
            {content.apply_text}
          </p>
          <ApplyForm categories={categories} submitText={content.apply_submit || "Отправить заявку"} successText={content.apply_success || "Спасибо за заявку. Мы свяжемся с вами в ближайшее время."} />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function CatChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/40"
      }`}
    >
      {label}
      <span className={`text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{count}</span>
    </button>
  );
}

function ApplyForm({
  categories,
  submitText,
  successText,
}: {
  categories: { slug: string; title: string }[];
  submitText: string;
  successText: string;
}) {
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "", website: "", category_slug: "", comment: "",
  });
  const [sent, setSent] = useState(false);

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = applicationSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await (supabase as any).from("partner_applications").insert({
        ...parsed.data,
        company: parsed.data.company ?? "",
        email: parsed.data.email ?? "",
        website: parsed.data.website ?? "",
        comment: parsed.data.comment ?? "",
      });
      if (error) throw error;
    },
    onSuccess: () => setSent(true),
    onError: (e: any) => toast.error(e.message || "Не удалось отправить заявку"),
  });

  if (sent) {
    return <p className="mt-8 rounded-2xl bg-white/10 p-6 text-base">{successText}</p>;
  }

  const input = "rounded-2xl bg-white/10 px-4 py-3 text-sm placeholder:text-white/70 outline-none focus:bg-white/20";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
      className="mt-8 grid gap-3 sm:grid-cols-2"
    >
      <input className={input} placeholder="Имя *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} required />
      <input className={input} placeholder="Компания" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} maxLength={150} />
      <input className={input} placeholder="Телефон *" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={40} required />
      <input className={input} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={150} />
      <input className={`${input} sm:col-span-2`} placeholder="Сайт или соцсети" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} maxLength={200} />
      <select
        value={form.category_slug}
        onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
        className={`${input} sm:col-span-2 appearance-none`}
      >
        <option value="" className="text-foreground">Категория деятельности</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug} className="text-foreground">{c.title}</option>
        ))}
      </select>
      <textarea className={`${input} sm:col-span-2 min-h-[110px]`} placeholder="Комментарий" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} maxLength={1000} />
      <button
        type="submit"
        disabled={submit.isPending}
        className="sm:col-span-2 mt-2 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-primary transition hover:bg-white/90 disabled:opacity-60"
      >
        {submit.isPending ? "Отправляем…" : submitText}
      </button>
    </form>
  );
}

