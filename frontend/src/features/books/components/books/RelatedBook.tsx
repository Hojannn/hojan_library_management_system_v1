import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { Book } from "../../types/book.types";

interface RelatedBookProps {
  authorName: string;
  books: Book[];
  onSelectBook: (id: string) => void;
}

const RelatedBook = ({ authorName, books, onSelectBook }: RelatedBookProps) => {
  const formatAuthorName = (maxAuthors = 1) => {
    if (!authorName) return "Author";

    const authors = authorName.split(/,|&|and/).map((a) => a.trim());

    if (authors.length > maxAuthors) {
      return `${authors[0]} et al.`;
    }
    return authorName;
  };

  const displayName = formatAuthorName(1);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold tracking-tight text-foreground">
        More by {displayName}
      </h3>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-center rounded-xl bg-muted/40 border border-dashed border-border/60 space-y-2">
          <BookOpen className="w-5 h-5 text-muted-foreground/60" />
          <p className="text-xs text-muted-foreground font-medium">
            No other books by {displayName} found in the library.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBook(item.id)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent cursor-pointer transition-colors group"
            >
              <img
                src={item.image_url || "/placeholder-cover.jpg"}
                alt={item.title}
                className="w-12 h-16 object-cover rounded-md border shadow-xs shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold text-foreground truncate" title={item.title}>
                  {item.title}
                </h4>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.available_copies > 0
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {item.available_copies > 0 ? "Available" : "On Loan"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedBook;