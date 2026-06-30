import { Link } from "@tanstack/react-router";
const logoAsset = { url: "/mk-logo.jpg" };

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <img src={logoAsset.url} alt="МК" className="h-16 w-16 rounded-xl object-cover" />
            <span className="font-display text-lg font-semibold">{"\n"}</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Собственное производство мебели в Краснодаре. Стильно, качественно, без переплат.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Каталог</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalog" className="hover:text-primary">Диваны</Link></li>
            <li><Link to="/catalog" className="hover:text-primary">Кровати</Link></li>
            <li><Link to="/catalog" className="hover:text-primary">Шкафы</Link></li>
            <li><Link to="/catalog" className="hover:text-primary">Столы и стулья</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Компания</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">О нас</Link></li>
            <li><Link to="/delivery" className="hover:text-primary">Доставка и оплата</Link></li>
            <li><Link to="/reviews" className="hover:text-primary">Отзывы</Link></li>
            <li><Link to="/apartment" className="hover:text-primary">МК Подбор</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Контакты</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>г. Краснодар, ул. Уссурийская, 17</li>
            <li>09:00–19:00</li>
            <li><a href="tel:+79180736268" className="text-primary font-medium">+7 (918) 073-62-68</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground md:px-8">
          © {new Date().getFullYear()} МК Мебель. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
