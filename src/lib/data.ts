// ============================================================================
//  КАТАЛОГ ТОВАРОВ — редактируется вручную, без AI
// ============================================================================
//
//  КАК ДОБАВИТЬ НОВЫЙ ТОВАР:
//  1. Скопируйте любой объект из массива `products` ниже.
//  2. Вставьте его в конец массива (перед закрывающей `]`).
//  3. Измените поля:
//     - id: уникальный идентификатор (любая строка, например "s5")
//     - category: slug категории из массива `categories` ("sofas", "beds", ...)
//     - title: название товара
//     - price: цена числом (без пробелов)
//     - description: краткое описание
//     - photo1..photo5: фото товара (photo1 обязательно, остальные опционально)
//     - sizes / specs / sleepingPlace / mechanism / filling / hasBox /
//       availability / productionTime — характеристики
//     - sale.enabled: true — показывать плашку «Акция» на карточке
//
//  КАК ЗАМЕНИТЬ ФОТО:
//  - Через Visual Editor: кликните на фото на сайте и загрузите своё.
//  - Через код: импортируйте изображение сверху файла и поставьте его
//    в нужное поле photo1..photo5.
//
//  КАК УДАЛИТЬ ТОВАР: удалите его объект из массива `products`.
//
//  КАК ВКЛЮЧИТЬ/ВЫКЛЮЧИТЬ АКЦИЮ: измените sale.enabled на true/false.
// ============================================================================

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
  label?: string;           // "АКЦИЯ" / "СКИДКА" / "ХИТ ПРОДАЖ"
  oldPrice?: number;
  newPrice?: number;
  text?: string;
};

export type Product = {
  id: string;
  category: string;          // slug из categories
  title: string;
  price: number;
  priceFrom?: boolean;       // показывать "от"
  description: string;

  // Галерея — до 5 отдельных фото (photo1 обязательно)
  photo1: string;
  photo2?: string;
  photo3?: string;
  photo4?: string;
  photo5?: string;
  photo6?: string;

  // Характеристики
  sizes?: SizeRow[];
  sleepingPlace?: string;    // спальное место
  mechanism?: string;        // механизм трансформации
  filling?: string;          // наполнение
  hasBox?: boolean;          // короб
  availability?: "в наличии" | "под заказ";
  productionTime?: string;   // срок изготовления
  specs?: Spec[];            // доп. характеристики

  // Акция
  sale?: Sale;
};

// Вспомогательные геттеры — НЕ ТРОГАТЬ
export function getGallery(p: Product): string[] {
  return [p.photo1, p.photo2, p.photo3, p.photo4, p.photo5].filter(
    (x): x is string => Boolean(x),
  );
}

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

// ============================================================================
//  СПИСОК ТОВАРОВ
// ============================================================================
export const products: Product[] = [
  {
    id: "s1",
    category: "sofas",
    title: "Диван «Осло»",
    price: 64900,
    priceFrom: true,
    description: "Мягкий 3-местный диван из букле, скандинавский стиль, ножки светлый дуб.",
    photo1: psofa1,
    photo2: psofaMain,
    photo3: psofa2,
    sizes: defaultSofaSizes,
    sleepingPlace: "2000×1400 мм",
    mechanism: "Еврокнижка",
    filling: "ППУ высокой плотности, независимый пружинный блок",
    hasBox: true,
    availability: "в наличии",
    productionTime: "В наличии — отгрузка от 1 дня",
    specs: [
      { label: "Габариты", value: "2400×1000×900 мм" },
      { label: "Каркас", value: "Брус хвойных пород, фанера" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: true, label: "ХИТ ПРОДАЖ", oldPrice: 78500, newPrice: 64900, text: "Лидер продаж этого сезона" },
  },
  {
    id: "s2",
    category: "sofas",
    title: "Диван «Берген»",
    price: 78500,
    priceFrom: true,
    description: "Глубокий бархатный 3-местный диван с деревянными ножками.",
    photo1: psofaMain,
    photo2: psofa1,
    photo3: psofa2,
    sizes: defaultSofaSizes,
    sleepingPlace: "2000×1400 мм",
    mechanism: "Еврокнижка",
    filling: "ППУ, независимый пружинный блок",
    hasBox: true,
    availability: "под заказ",
    productionTime: "От 2 недель",
    specs: [
      { label: "Габариты", value: "2400×1000×900 мм" },
      { label: "Каркас", value: "Брус хвойных пород, фанера" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: false },
  },
  {
    id: "b1",
    category: "beds",
    title: "Кровать «Сторо» 160×200",
    price: 42900,
    priceFrom: true,
    description: "Кровать с мягким изголовьем и подъёмным механизмом.",
    photo1: pbed1,
    sizes: [
      { size: "1600×2000", sleeping: "1600×2000", box: "Есть", price: "42 900 ₽" },
      { size: "1800×2000", sleeping: "1800×2000", box: "Есть", price: "47 900 ₽" },
      { size: "Индивидуальный размер", sleeping: "По запросу", box: "По запросу", price: "Рассчитать" },
    ],
    sleepingPlace: "1600×2000 мм",
    mechanism: "Подъёмный с газлифтом",
    filling: "—",
    hasBox: true,
    availability: "в наличии",
    productionTime: "В наличии",
    specs: [
      { label: "Габариты", value: "1700×2100×1100 мм" },
      { label: "Каркас", value: "ЛДСП, массив" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: true, label: "СКИДКА", oldPrice: 52900, newPrice: 42900, text: "−19% до конца месяца" },
  },
  {
    id: "m1",
    category: "mattresses",
    title: "Матрас «Комфорт Плюс»",
    price: 28900,
    priceFrom: true,
    description: "Независимый пружинный блок, средняя жёсткость.",
    photo1: pmat1,
    sizes: [
      { size: "1400×2000", sleeping: "1400×2000", box: "—", price: "28 900 ₽" },
      { size: "1600×2000", sleeping: "1600×2000", box: "—", price: "32 900 ₽" },
      { size: "1800×2000", sleeping: "1800×2000", box: "—", price: "36 900 ₽" },
    ],
    sleepingPlace: "1400×2000 мм",
    mechanism: "—",
    filling: "Независимый пружинный блок, кокос, ППУ",
    hasBox: false,
    availability: "в наличии",
    productionTime: "В наличии",
    specs: [
      { label: "Высота", value: "22 см" },
      { label: "Жёсткость", value: "Средняя" },
      { label: "Чехол", value: "Жаккард" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    sale: { enabled: false },
  },
  {
    id: "w1",
    category: "wardrobes",
    title: "Шкаф «Орхус» 180",
    price: 54900,
    description: "Шкаф светлый дуб с распашными дверями.",
    photo1: pward1,
    sizes: [
      { size: "1800×2200×600", sleeping: "—", box: "—", price: "54 900 ₽" },
      { size: "Индивидуальный размер", sleeping: "—", box: "—", price: "Рассчитать" },
    ],
    sleepingPlace: "—",
    mechanism: "Распашные двери",
    filling: "—",
    hasBox: false,
    availability: "под заказ",
    productionTime: "От 2 недель",
    specs: [
      { label: "Габариты", value: "1800×2200×600 мм" },
      { label: "Материал корпуса", value: "ЛДСП Egger" },
      { label: "Фасады", value: "МДФ" },
      { label: "Фурнитура", value: "Blum" },
      { label: "Гарантия", value: "24 месяца" },
    ],
    sale: { enabled: false },
  },
  {
    id: "d1",
    category: "dining",
    title: "Стол «Лунд» с 4 стульями",
    price: 49900,
    priceFrom: true,
    description: "Круглый обеденный стол со стульями.",
    photo1: pdin1,
    sizes: [
      { size: "Ø1100 мм + 4 стула", sleeping: "—", box: "—", price: "49 900 ₽" },
      { size: "Ø1200 мм + 6 стульев", sleeping: "—", box: "—", price: "62 900 ₽" },
    ],
    sleepingPlace: "—",
    mechanism: "—",
    filling: "—",
    hasBox: false,
    availability: "в наличии",
    productionTime: "В наличии",
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
    category: "kids",
    title: "Детская кровать «Мини»",
    price: 24900,
    description: "Уютная детская кровать из массива.",
    photo1: kids,
    sizes: [
      { size: "800×1600", sleeping: "800×1600", box: "Есть", price: "24 900 ₽" },
      { size: "900×1900", sleeping: "900×1900", box: "Есть", price: "28 900 ₽" },
    ],
    sleepingPlace: "800×1600 мм",
    mechanism: "—",
    filling: "—",
    hasBox: true,
    availability: "в наличии",
    productionTime: "В наличии",
    specs: [
      { label: "Материал", value: "Массив берёзы" },
      { label: "Покрытие", value: "Безопасный лак на водной основе" },
      { label: "Бортики", value: "Есть" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: false },
  },
  {
    id: "h1",
    category: "hallways",
    title: "Прихожая «Норд»",
    price: 36500,
    description: "Лаконичная прихожая со скамьёй и зеркалом.",
    photo1: hallway,
    sizes: [
      { size: "1200×2000×400", sleeping: "—", box: "—", price: "36 500 ₽" },
      { size: "Индивидуальный размер", sleeping: "—", box: "—", price: "Рассчитать" },
    ],
    sleepingPlace: "—",
    mechanism: "—",
    filling: "—",
    hasBox: false,
    availability: "под заказ",
    productionTime: "От 2 недель",
    specs: [
      { label: "Габариты", value: "1200×2000×400 мм" },
      { label: "Материал", value: "ЛДСП" },
      { label: "Состав", value: "Шкаф, скамья, зеркало, крючки" },
      { label: "Гарантия", value: "18 месяцев" },
    ],
    sale: { enabled: false },
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
