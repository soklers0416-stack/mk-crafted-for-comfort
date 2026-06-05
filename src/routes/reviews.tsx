import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { reviewsQuery } from "@/lib/queries";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Отзывы — МК Мебель" },
      { name: "description", content: "Реальные отзывы клиентов о мебели МК Мебель из Краснодара." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data: reviews = [] } = useQuery(reviewsQuery);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Отзывы</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Нам доверяют сотни клиентов
        </h1>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-sm text-foreground/85">«{r.text}»</p>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted-foreground">{r.source}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
