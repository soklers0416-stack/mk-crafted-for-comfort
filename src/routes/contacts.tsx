import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteBanner } from "@/components/SiteBanner";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Контакты — МК Мебель" },
      { name: "description", content: "Шоурум в Краснодаре, ул. Уссурийская, 17. Телефон +7 (918) 073-62-68." },
      { property: "og:title", content: "Контакты — МК Мебель" },
      { property: "og:description", content: "Связаться с МК Мебель." },
    ],
  }),
  component: ContactsPage,
});

function ContactsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SiteBanner id="contacts:hero" />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">

          <div className="space-y-5">
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><MapPin className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-semibold">Адрес</h3>
              <p className="mt-1 text-muted-foreground">г. Краснодар, ул. Уссурийская, 17</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Clock className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-semibold">График работы</h3>
              <p className="mt-1 text-muted-foreground">Ежедневно 09:00–19:00</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Phone className="h-5 w-5" /></span>
              <h3 className="mt-4 font-display text-lg font-semibold">Телефон</h3>
              <a href="tel:+79180736268" className="mt-1 inline-block font-display text-2xl font-semibold text-primary">
                +7 (918) 073-62-68
              </a>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="https://max.ru/" target="_blank" rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <MessageCircle className="h-4 w-4" /> Написать в MAX
              </a>
              <a href="https://vk.com/" target="_blank" rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium hover:border-primary hover:text-primary">
                Перейти в VK
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card">
            <iframe
              title="МК Мебель на карте"
              src="https://yandex.ru/map-widget/v1/?ll=39.029%2C45.045&z=14&pt=39.029%2C45.045%2Cpm2rdm"
              className="h-[500px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
