import type { Book } from "../../types/book.types";
export default function BookDetailsTable({ book }: { book: Book }) {
  const details = [
    ["Book title", book.title], ["Author", book.author], ["Genre / Category", book.category_name || "Uncategorized"],
    ["ISBN", book.isbn || "N/A"], ["Total copies", String(book.total_copies ?? 0)],
    ["Edition language", "English"], ["Book format", book.pages ? `Paperback · ${book.pages.toLocaleString()} pages` : "N/A"],
  ];
  return <dl className="details-table">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
