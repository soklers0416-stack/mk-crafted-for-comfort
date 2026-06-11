import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { isFavorite, subscribeFavorites, toggleFavorite } from "@/lib/favorites";
import { toast } from "sonner";

export function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const [fav, setFav] = useState(false);
  useEffect(() => {
    setFav(isFavorite(id));
    return subscribeFavorites(() => setFav(isFavorite(id)));
  }, [id]);

  return (
    <button
      type="button"
      aria-label={fav ? "Убрать из избранного" : "В избранное"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = toggleFavorite(id);
        toast.success(next ? "Добавлено в избранное" : "Убрано из избранного");
      }}
      className={`grid place-items-center rounded-full border border-border bg-background transition hover:border-primary ${fav ? "text-red-500" : "text-muted-foreground"} ${className}`}
    >
      <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
    </button>
  );
}
