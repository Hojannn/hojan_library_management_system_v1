import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Star } from "lucide-react";
import { useFavoriteBooks, useToggleFavoriteBook } from "@/hooks/useBooks";
import type { Book } from "../../types/book.types";

interface BookCardProps {
  book: Book;
  variant?: "default" | "catalog" | "popular" | "recommendation";
}

const BookCard = ({ book }: BookCardProps) => {
  const { data: favorites } = useFavoriteBooks();
  const toggleFavorite = useToggleFavoriteBook();
  const isFavorite = Boolean(favorites?.some((fav) => fav.id === book.id));

  const formattedRating =
    book.average_rating != null
      ? Number(Number(book.average_rating).toFixed(1))
      : 0;

  const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!book.id || toggleFavorite.isPending) return;
    toggleFavorite.mutate({ bookId: book.id, isFavorite });
  };

  return (
    <Link
      to={`/books/${book.id}`}
      className="group block w-full max-w-[180px] cursor-pointer select-none space-y-2.5 mx-auto"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted border border-border/70 shadow-2xs transition-transform duration-200 group-hover:scale-[1.03]">
        <button
          type="button"
          onClick={handleToggleFavorite}
          disabled={toggleFavorite.isPending}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${book.title} from favorites`
              : `Add ${book.title} to favorites`
          }
          className={`absolute top-2.5 right-2.5 z-10 grid size-8 place-items-center rounded-full border backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
              : "border-white/30 bg-popover/85 text-foreground hover:bg-popover hover:scale-105"
          }`}
        >
          <Heart
            className="size-4"
            fill={isFavorite ? "currentColor" : "none"}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>

        {book.image_url ? (
          <img
            src={book.image_url}
            alt={`${book.title} cover`}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-muted-foreground text-center">
            <BookOpen className="h-7 w-7 stroke-[1.5]" aria-hidden="true" />
            <span className="text-xs uppercase font-semibold mt-2 line-clamp-2">
              {book.title || "No Cover"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 px-0.5">
        <h3 className="text-sm sm:text-[15px] font-bold text-foreground line-clamp-1 leading-snug group-hover:text-heading transition-colors">
          {book.title}
        </h3>

        <p className="text-xs sm:text-[13px] font-medium text-muted-foreground line-clamp-1">
          {book.author}
        </p>

        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-xs sm:text-[13px] font-bold text-foreground">
            {formattedRating}
          </span>
          <Star
            aria-hidden="true"
            className="size-3.5 fill-amber-400 stroke-amber-400"
          />
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
