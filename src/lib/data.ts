import sofa from "@/assets/cat-sofa.jpg";
import bed from "@/assets/cat-bed.jpg";
import mattress from "@/assets/cat-mattress.jpg";
import wardrobe from "@/assets/cat-wardrobe.jpg";
import hallway from "@/assets/cat-hallway.jpg";
import dining from "@/assets/cat-dining.jpg";
import kids from "@/assets/cat-kids.jpg";

import psofa1 from "@/assets/prod-sofa1.jpg";
import psofa2 from "@/assets/prod-sofa2.jpg";
import pbed1 from "@/assets/prod-bed1.jpg";
import pmat1 from "@/assets/prod-mattress1.jpg";
import pward1 from "@/assets/prod-wardrobe1.jpg";
import pdin1 from "@/assets/prod-dining1.jpg";

export type Category = {
  slug: string;
  title: string;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  description: string;
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

export const products: Product[] = [
  { id: "s1", title: "Диван «Осло»", category: "sofas", price: 64900, image: psofa1, description: "Мягкий 3-местный диван из букле, скандинавский стиль, ножки светлый дуб." },
  { id: "s2", title: "Диван «Берген»", category: "sofas", price: 78500, image: psofa2, description: "Глубокий бархатный 3-местный диван с деревянными ножками." },
  { id: "b1", title: "Кровать «Сторо» 160×200", category: "beds", price: 42900, image: pbed1, description: "Кровать с мягким изголовьем и подъёмным механизмом." },
  { id: "m1", title: "Матрас «Комфорт Плюс»", category: "mattresses", price: 28900, image: pmat1, description: "Независимый пружинный блок, средняя жёсткость." },
  { id: "w1", title: "Шкаф «Орхус» 180", category: "wardrobes", price: 54900, image: pward1, description: "Шкаф светлый дуб с распашными дверями." },
  { id: "d1", title: "Стол «Лунд» с 4 стульями", category: "dining", price: 49900, image: pdin1, description: "Круглый обеденный стол со стульями." },
  { id: "k1", title: "Детская кровать «Мини»", category: "kids", price: 24900, image: kids, description: "Уютная детская кровать из массива." },
  { id: "h1", title: "Прихожая «Норд»", category: "hallways", price: 36500, image: hallway, description: "Лаконичная прихожая со скамьёй и зеркалом." },
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
