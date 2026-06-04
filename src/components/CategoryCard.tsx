import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/lib/data";

type Props =
  | { category: Category; large?: boolean; slug?: never; title?: never; image?: never }
  | { slug: string; title: string; image: string; large?: boolean; category?: never };

export function CategoryCard(props: Props) {
  const slug = props.category?.slug ?? props.slug!;
  const title = props.category?.title ?? props.title!;
  const image = props.category?.image ?? props.image!;
  const large = props.large ?? false;

  return (
    <Link
      to="/catalog"
      search={{ category: slug }}
      className={`group relative block overflow-hidden rounded-3xl bg-surface-muted ${
        large ? "aspect-[4/5] md:aspect-[5/6]" : "aspect-[5/6]"
      }`}
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
        <h3 className="font-display text-xl font-semibold text-white md:text-2xl">
          {title}
        </h3>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
