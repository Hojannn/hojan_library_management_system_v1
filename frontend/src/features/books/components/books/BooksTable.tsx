import { Archive, BookOpen, Eye, Pencil, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBookDate } from "../../lib/bookListView";
import type { Book, StaffBookState } from "../../types/book.types";

interface BooksTableProps {
  books: Book[];
  state: StaffBookState;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
  onRestore: (book: Book) => void;
  isProcessing?: boolean;
}

const BooksTable = ({ books, state, onView, onEdit, onArchive, onRestore, isProcessing }: BooksTableProps) => {
  if (!books.length) return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-white/20 text-center">
      <BookOpen className="size-8 text-muted-foreground" />
      <div><p className="text-sm font-semibold">No books found</p><p className="mt-1 text-xs text-muted-foreground">Try changing your search or filters.</p></div>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-white/55 bg-white/20">
      <Table className="min-w-[900px]">
        <TableHeader><TableRow>
          <TableHead>Book</TableHead><TableHead>ISBN</TableHead><TableHead>Category</TableHead>
          <TableHead>Availability</TableHead><TableHead>Total</TableHead>
          {state === "archived" && <TableHead>Archived</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>{books.map((book) => (
          <TableRow key={book.id}>
            <TableCell><div className="flex items-center gap-3">
              <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {book.image_url ? <img src={book.image_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="size-4 text-muted-foreground" />}
              </div>
              <div className="min-w-0"><p className="max-w-56 truncate text-xs font-bold text-heading">{book.title}</p><p className="mt-1 max-w-56 truncate text-[11px] text-muted-foreground">{book.author || "Unknown author"}</p></div>
            </div></TableCell>
            <TableCell className="text-xs text-muted-foreground">{book.isbn || "—"}</TableCell>
            <TableCell><span className="booky-badge">{book.category_name || "Uncategorized"}</span></TableCell>
            <TableCell><span className={book.available_copies > 0 ? "booky-badge booky-badge-success" : "booky-badge booky-badge-danger"}>{book.available_copies > 0 ? `${book.available_copies} available` : "Unavailable"}</span></TableCell>
            <TableCell className="text-xs font-semibold">{book.total_copies}</TableCell>
            {state === "archived" && <TableCell className="text-xs text-muted-foreground">{formatBookDate(book.archived_at)}</TableCell>}
            <TableCell><div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => onView(book)} aria-label={`View ${book.title}`}><Eye /></Button>
              {state === "active" ? <>
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => onArchive(book)} aria-label={`Archive ${book.title}`} disabled={isProcessing}><Archive /></Button>
              </> : <Button variant="ghost" size="sm" onClick={() => onRestore(book)} aria-label={`Restore ${book.title}`} disabled={isProcessing}><RotateCcw /> Restore</Button>}
            </div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
};

export default BooksTable;
