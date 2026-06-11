import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Phone, Mail, Globe, Check, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { partnerQuery, partnerCategoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/partners/$id")({
  component: PartnerPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold">Партнёр не найден</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error?.message ?? ""}</p>
        <Link to="/partners" className="mt-6 inline-flex items-center gap-2 text-primary"><ArrowLeft className="h-4 w-4" />Все партнёры</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6">
      <Link to="/partners" className="text-primary">Все партнёры</Link>
    </div>
  ),
});

function PartnerPage() {
  const { id } = Route.useParams();
  const { data: partner, isLoading } = useQuery(partnerQuery(id));
  const { data: categories = [] } = useQuery(partnerCategoriesQuery);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">Загрузка…</div>
      </div>
    );
  }
  if (!partner) throw notFound();

  const cat = categories.find((c) => c.slug === partner.category_slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <Link to="/partners" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" />Все партнёры
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-surface-muted">
              {partner.main_photo ? (
                <img src={partner.main_photo} alt={partner.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground"><Building2 className="h-16 w-16" /></div>
              )}
            </div>
            <div className="mt-6 flex items-start gap-4">
              {partner.logo && (
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-white">
                  <img src={partner.logo} alt="" className="h-full w-full object-contain p-1.5" />
                </div>
              )}
              <div>
                {cat && <span className="text-xs font-medium uppercase tracking-wider text-primary">{cat.title}</span>}
                <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{partner.title}</h1>
              </div>
            </div>
            {partner.description && (
              <p className="mt-6 whitespace-pre-line text-muted-foreground">{partner.description}</p>
            )}

            {partner.advantages.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold">Преимущества</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {partner.advantages.map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="rounded-3xl border border-border/60 bg-card p-6 md:sticky md:top-24 md:self-start">
            <h2 className="font-display text-lg font-semibold">Контакты</h2>
            <div className="mt-4 space-y-3 text-sm">
              {partner.phone && (
                <a href={`tel:${partner.phone}`} className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 hover:border-primary/40">
                  <Phone className="h-4 w-4 text-primary" />{partner.phone}
                </a>
              )}
              {partner.email && (
                <a href={`mailto:${partner.email}`} className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 hover:border-primary/40">
                  <Mail className="h-4 w-4 text-primary" />{partner.email}
                </a>
              )}
              {partner.website && (
                <a href={partner.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3 hover:border-primary/40">
                  <Globe className="h-4 w-4 text-primary" /><span className="truncate">{partner.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>
            {partner.socials.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Соцсети</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {partner.socials.map((s, i) => (
                    <li key={i}>
                      <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-xs hover:border-primary/40">
                        {s.type || s.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {partner.gallery.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold">Галерея работ</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {partner.gallery.map((src, i) => (
                <button key={i} onClick={() => setLightbox(src)} className="group overflow-hidden rounded-2xl bg-surface-muted">
                  <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />

      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}
