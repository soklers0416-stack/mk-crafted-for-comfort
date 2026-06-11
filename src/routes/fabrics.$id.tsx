import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fabricQuery, fabricCategoriesQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/cart";

export const Route = createFileRoute("/fabrics/$id")({
  component: FabricDetail,
});

function FabricDetail() {
  const { id } = Route.useParams();
  const { data: f, isLoading } = useQuery(fabricQuery(id));
  const { data: cats = [] } = useQuery(fabricCategoriesQuery);
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="p-12 text-center text-muted-foreground">Загрузка…</div><Footer /></div>;
  if (!f) return (
    <div className="min-h-screen bg-background"><Header />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-bold">Ткань не найдена</h1>
        <Link to="/fabrics" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">К каталогу тканей</Link>
      </div><Footer /></div>
  );
  const cat = cats.find((c) => c.slug === f.category_slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/fabrics" className="hover:text-primary">Ткани</Link>
          {cat && (<><ChevronRight className="h-3 w-3" /><span>{cat.title}</span></>)}
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{f.title}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            {f.sample_photo && <img src={f.sample_photo} alt={f.title} className="aspect-square w-full rounded-3xl object-cover" />}
          </div>
          <div>
            {cat && <p className="text-sm font-medium uppercase tracking-wider text-primary">{cat.title}</p>}
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{f.title}</h1>
            {f.code && <p className="mt-1 text-sm text-muted-foreground">Код: {f.code}</p>}
            {f.description && <p className="mt-4 text-base text-muted-foreground">{f.description}</p>}

            <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm">
              {f.characteristics.for_children && <div className="flex justify-between border-b border-dashed py-2"><dt className="text-muted-foreground">Подходит для детей</dt><dd>Да</dd></div>}
              {f.characteristics.for_pets && <div className="flex justify-between border-b border-dashed py-2"><dt className="text-muted-foreground">Подходит для животных</dt><dd>Да</dd></div>}
              {f.characteristics.easy_care && <div className="flex justify-between border-b border-dashed py-2"><dt className="text-muted-foreground">Лёгкость ухода</dt><dd>{f.characteristics.easy_care}</dd></div>}
              {f.characteristics.durability && <div className="flex justify-between border-b border-dashed py-2"><dt className="text-muted-foreground">Износостойкость</dt><dd>{f.characteristics.durability}</dd></div>}
              {f.characteristics.features && <div className="flex justify-between gap-3 border-b border-dashed py-2"><dt className="text-muted-foreground">Особенности</dt><dd className="text-right">{f.characteristics.features}</dd></div>}
            </dl>

            {f.recommendations && (
              <div className="mt-5 rounded-2xl bg-primary/5 p-4 text-sm">
                <div className="font-medium">Рекомендации</div>
                <p className="mt-1 text-muted-foreground">{f.recommendations}</p>
              </div>
            )}

            {f.surcharge > 0 && (
              <div className="mt-5 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Доплата к стоимости: {formatPrice(f.surcharge)}
              </div>
            )}
          </div>
        </div>

        {f.furniture_photos.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Мебель в этой ткани</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {f.furniture_photos.map((src, i) => (
                <button key={i} onClick={() => setLightbox(src)} className="overflow-hidden rounded-2xl bg-surface-muted">
                  <img src={src} alt="" loading="lazy" className="aspect-square w-full object-cover transition hover:scale-105" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
      {lightbox && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </div>
  );
}
