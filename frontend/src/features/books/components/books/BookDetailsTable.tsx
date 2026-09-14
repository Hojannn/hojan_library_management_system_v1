import type { Book } from "../../types/book.types";

interface BookDetailsPageProps {
  book: Book;
}

const BookDetailsTable = ({ book }: BookDetailsPageProps) => {
  const details = [
    { label: "Book Title", value: book.title },
    { label: "Author", value: book.author },
    { label: "Genre / Category", value: book.category_name || "Uncategorized" },
    { label: "ISBN", value: book.isbn || "N/A" },
    { label: "Total Copies", value: `${book.available_copies ?? 0}` },
    { label: "Edition Language", value: "English" },
    { label: "Book Format", value: book.pages ? `Paperback, ${book.pages} pages` : "N/A" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-xl border border-border divide-y divide-border">
      {details.map((detail) => (
        <div
          key={detail.label}
          className="grid grid-cols-3 p-3.5 text-xs bg-muted/20 hover:bg-muted/40 transition-colors"
        >
          <span className="font-medium text-muted-foreground">{detail.label}</span>
          <span className="col-span-2 font-semibold text-foreground">{detail.value}</span>
        </div>
      ))}
    </div>
  );
};

export default BookDetailsTable;