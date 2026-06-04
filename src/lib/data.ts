import sofa from "@/assets/cat-sofa.jpg";
import bed from "@/assets/cat-bed.jpg";
import mattress from "@/assets/cat-mattress.jpg";
import wardrobe from "@/assets/cat-wardrobe.jpg";
import hallway from "@/assets/cat-hallway.jpg";
import dining from "@/assets/cat-dining.jpg";
import kids from "@/assets/cat-kids.jpg";

import psofa1 from "@/assets/prod-sofa1.jpg";
import psofa2 from "@/assets/prod-sofa2.jpg";
import psofaMain from "@/assets/prod-sofa-main.jpg";
import pbed1 from "@/assets/prod-bed1.jpg";
import pmat1 from "@/assets/prod-mattress1.jpg";
import pward1 from "@/assets/prod-wardrobe1.jpg";
import pdin1 from "@/assets/prod-dining1.jpg";

export type Category = {
  slug: string;
  title: string;
  image: string;
};

export type SizeRow = {
  size: string;
  sleeping: string;
  box: string;
  price: string;
};

export type Spec = { label: string; value: string };

export type Sale = {
  enabled: boolean;
  label: string;           // "АКЦИЯ" / "СКИДКА" / "ХИТ ПРОДАЖ" / "ОСТАЛОСЬ 2 ШТУКИ"
  oldPrice?: number;       // зачёркнутая
  newPrice?: number;       // новая
  text?: string;           // описание акции
};

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  priceFrom?: boolean;     // отображать "от"
  image: string;
  gallery?: string[];      // дополнительные ракурсы (каталог/разложенный/интерьер/…)
  description: string;
  stock?: string;          // "В наличии" / "Под заказ от 2 недель"
  sizes?: SizeRow[];
  specs?: Spec[];
  sale?: Sale;
};

export const categories: Category[] = [
  { slug: "sofas", title: "Диваны", image: sofa },
  { slug: "beds", title: "Кровати", image: bed },
  { slug: "mattresses", title: "Матрасы", image: mattress },
  { slug: "wardrobes", title: "Шкафы", image: wardrobe },
  { slug: "hallways", title: "Прихожие", image: hallway },
  { slug: "dining", title: "Столы и стулья", image: dining },
  { slug: "kids", title: "Детские кровати", image: kids },
];

const defaultSofaSizes: SizeRow[] = [
  { size: "2400×1600", sleeping: "2000×1400", box: "Есть", price: "55 000 ₽" },
  { size: "2600×1600", sleeping: "2200×1400", box: "Нет", price: "60 000 ₽" },
  { size: "Индивидуальный размер", sleeping: "По запросу", box: "По запросу", price: "Рассчитать" },
];

const defaultSofaSpecs: Spec[] = [
  { label: "Габариты", value: "2400×1000×900 мм" },
  { label: "Спальное место", value: "2000×1400 мм" },
  { label: "Механизм трансформации", value: "Еврокнижка" },
  { label: "Наполнение", value: "ППУ высокой плотности, независимый пружинный блок" },
  { label: "Короб для хранения", value: "Есть" },
  { label: "Каркас", value: "Брус хвойных пород, фанера" },
  { label: "Гарантия", value: "18 месяцев" },
];

const defaultBedSpecs: Spec[] = [
  { label: "Габариты", value: "1700×2100×1100 мм" },
  { label: "Спальное место", value: "1600×2000 мм" },
  { label: "Механизм", value: "Подъёмный с газлифтом" },
  { label: "Короб для хранения", value: "Есть" },
  { label: "Каркас", value: "ЛДСП, массив" },
  { label: "Гарантия", value: "18 месяцев" },
];

export const products: Product[] = [
  {
    id: "s1",
    title: "Диван «Осло»",
    category: "sofas",
    price: 64900,
    priceFrom: true,
    image: psofa1,
    gallery: [psofa1, psofaMain, psofa2],
    description: "Мягкий 3-местный диван из букле, скандинавский стиль, ножки светлый дуб.",
    stock: "В наличии",
    sizes: defaultSofaSizes,
    specs: defaultSofaSpecs,
    sale: { enabled: true, label: "ХИТ ПРОДАЖ", oldPrice: 78500, newPrice: 64900, text: "Лидер продаж этого сезона" },
  },
  {
    id: "s2",
    title: "Диван «Берген»",
    category: "sofas",
    price: 78500,
    priceFrom: true,
    image: psofaMain,
    gallery: [psofaMain, psofa1, psofa2],
    description: "Глубокий бархатный 3-местный диван с деревянными ножками.",
    stock: "Под заказ от 2 недель",
    sizes: defaultSofaSizes,
    specs: defaultSofaSpecs,
    sale: { enabled: false, label: "АКЦИЯ" },
  },
  {
    id: "b1",
    title: "Кровать «Сторо» 160×200",
    category: "beds",
    price: 42900,
    priceFrom: true,
    image: pbed1,
    gallery: [pbed1],
    description: "Кровать с мягким изголовьем и подъёмным механизмом.",
    stock: "В наличии",
    sizes: [
      { size: "1600×2000", sleeping: "1600×2000", box: "Есть", price: "42 900 ₽" },
      { size: "1800×2000", sleeping: "1800×2000", box: "Есть", price: "47 900 ₽" },
      { size: "Индивидуальный размер", sleeping: "По запросу", box: "По запросу", price: "Рассчитать" },
    ],
    specs: defaultBedSpecs,
    sale: { enabled: true, label: "СКИДКА", oldPrice: 52900, newPrice: 42900, text: "−19% до конца месяца" },
  },
  {
    id: "m1",
    title: "Матрас «Комфорт Плюс»",
    category: "mattresses",
    price: 28900,
    priceFrom: true,
    image: pmat1,
    gallery: [pmat1],
    description: "Независимый пружинный блок, средняя жёсткость.",
    stock: "В наличии",
    sizes: [
      { size: "1400×2000", sleeping: "1400×2000", box: "—", price: "28 900 ₽" },
      { size: "1600×2000", sleeping: "1600×2000", box: "—", price: "32 900 ₽" },
      { size: "1800×2000", sleeping: "1800×2000", box: "—", price: "36 900 ₽" },
    ],
    specs: [
      { label: "Высота", value: "22 см" },
      { label: "Жёсткость", value: "Средняя" },
      { label: "Наполнение", value: "Независимый пружинный блок, кокос, ППУ" },
      { label: "Чехол", value: "Жаккард" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    sale: { enabled: false, label: "АКЦИЯ" },
  },
  {
    id: "w1",
    title: "Шкаф «Орхус» 180",
    category: "wardrobes",
    price: 54900,
    image: pward1,
    gallery: [pward1],
    description: "Шкаф светлый дуб с распашными дверями.",
    stock: "Под заказ от 2 недель",
    sizes: [
      { size: "1800×2200×600", sleeping: "—", box: "—", price: "54 900 ₽" },
      { size: "Индивидуальный размер", sleeping: "—", box: "—", price: "Рассчитать" },
    ],
    specs: [
      { label: "Габариты", value: "1800×2200×600 мм" },
      { label: "Материал корпуса", value: "ЛДСП Egger" },
      { label: "Фасады", value: "МДФ" },
      { label: "Фурнитура", value: "Blum" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    sale: { enabled: false, label: "АКЦИЯ" },
  },
  {
    id: "d1",
    title: "Стол «Лунд» с 4 стульями",
    category: "dining",
    price: 49900,
    priceFrom: true,
    image: pdin1,
    gallery: [pdin1],
    description: "Круглый обеденный стол со стульями.",
    stock: "В наличии",
    sizes: [
      { size: "Ø1100 мм + 4 стула", sleeping: "—", box: "—", price: "49 900 ₽" },
      { size: "Ø1200 мм + 6 стульев", sleeping: "—", box: "—", price: "62 900 ₽" },
    ],
    specs: [
      { label: "Материал столешницы", value: "Массив дуба" },
      { label: "Основание", value: "Металл, порошковая окраска" },
      { label: "Стулья", value: "Массив, мягкое сиденье" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: true, label: "АКЦИЯ", oldPrice: 58900, newPrice: 49900, text: "Комплект по специальной цене" },
  },
  {
    id: "k1",
    title: "Детская кровать «Мини»",
    category: "kids",
    price: 24900,
    image: kids,
    gallery: [kids],
    description: "Уютная детская кровать из массива.",
    stock: "В наличии",
    sizes: [
      { size: "800×1600", sleeping: "800×1600", box: "Есть", price: "24 900 ₽" },
      { size: "900×1900", sleeping: "900×1900", box: "Есть", price: "28 900 ₽" },
    ],
    specs: [
      { label: "Материал", value: "Массив берёзы" },
      { label: "Покрытие", value: "Безопасный лак на водной основе" },
      { label: "Бортики", value: "Есть" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: false, label: "АКЦИЯ" },
  },
  {
    id: "h1",
    title: "Прихожая «Норд»",
    category: "hallways",
    price: 36500,
    image: hallway,
    gallery: [hallway],
    description: "Лаконичная прихожая со скамьёй и зеркалом.",
    stock: "Под заказ от 2 недель",
    sizes: [
      { size: "1200×2000×400", sleeping: "—", box: "—", price: "36 500 ₽" },
      { size: "Индивидуальный размер", sleeping: "—", box: "—", price: "Рассчитать" },
    ],
    specs: [
      { label: "Габариты", value: "1200×2000×400 мм" },
      { label: "Материал", value: "ЛДСП" },
      { label: "Состав", value: "Шкаф, скамья, зеркало, крючки" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: false, label: "АКЦИЯ" },
  },
];

export const bestsellers = ["s1", "b1", "m1", "d1"].map(
  (id) => products.find((p) => p.id === id)!,
);

export const advantages = [
  { title: "Собственное производство", text: "Делаем мебель сами, без посредников." },
  { title: "Изменение размеров", text: "Адаптируем мебель под ваше пространство." },
  { title: "Более 100 тканей", text: "Огромный выбор обивки и цветов." },
  { title: "В наличии и под заказ", text: "Готовые модели и индивидуальные проекты." },
  { title: "Рассрочка Т-Банк и Халва", text: "Удобная оплата без переплат." },
  { title: "Доставка и сборка", text: "Привезём и соберём — вам останется наслаждаться." },
  { title: "Честные цены", text: "Без лишних наценок и скрытых платежей." },
];

export const heroFeatures = [
  "Собственное производство",
  "Более 100 вариантов тканей",
  "Изготовление от 2 недель",
  "Рассрочка Т-Банк и Халва",
];

export const reviews = [
  { name: "Анна К.", source: "Яндекс", rating: 5, text: "Заказывали диван — всё чётко, привезли вовремя, качество отличное. Менеджеры внимательные." },
  { name: "Дмитрий С.", source: "2ГИС", rating: 5, text: "Делали кровать на заказ, чуть изменили размеры. Результат превзошёл ожидания." },
  { name: "Мария В.", source: "VK", rating: 5, text: "Очень довольны кухонным уголком. Ткань приятная, сборка аккуратная." },
  { name: "Игорь П.", source: "Яндекс", rating: 5, text: "Шкаф собрали за час, всё ровно. Спасибо за работу!" },
  { name: "Екатерина М.", source: "VK", rating: 5, text: "Заказывали мебель в детскую — ребёнок счастлив. Качество, как и обещали." },
  { name: "Сергей Л.", source: "2ГИС", rating: 5, text: "Брали диван и матрас. Цена честная, доставка бесплатная по городу." },
];

export const deliveryPoints = [
  { title: "Доставка по Краснодару", text: "Бесплатно при заказе от 30 000 ₽. Привезём в удобное время." },
  { title: "Доставка по Краснодарскому краю", text: "Рассчитаем стоимость по адресу — звоните или оставьте заявку." },
  { title: "Доставка по России", text: "Отправляем транспортными компаниями в любой регион." },
  { title: "Сборка мебели", text: "Опытные сборщики соберут мебель аккуратно и быстро." },
  { title: "Рассрочка Т-Банк", text: "До 24 месяцев без переплат." },
  { title: "Рассрочка Халва", text: "Удобные ежемесячные платежи." },
];
