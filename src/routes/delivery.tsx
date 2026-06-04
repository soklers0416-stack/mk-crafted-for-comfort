import { createFileRoute } from "@tanstack/react-router";
import { Truck, Wrench, CreditCard, MapPin, Map, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { deliveryPoints } from "@/lib/data";

const icons = [MapPin, Map, Building2, Wrench, CreditCard, CreditCard];

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Доставка и оплата — МК Мебель" },
      { name: "description", content: "Доставка по Краснодару, краю и России. Сборка мебели. Рассрочка Т-Банк и Халва." },
      { property: "og:title", content: "Доставка и оплата — МК Мебель" },
      { property: "og:description", content: "Доставка, сборка и рассрочка от МК Мебель." },
    ],
  }),
  component: DeliveryPage,
});

function DeliveryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Сервис</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Доставка и оплата</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Привезём, занесём и соберём. Удобная оплата и рассрочка без переплат.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {deliveryPoints.map((p, i) => {
            const Icon = icons[i] || Truck;
            return (
              <div key={p.title} className="rounded-3xl border border-border/60 bg-card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
