import { Archive, BookOpen, Eye, Pencil, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatAuthorName } from "@/utils/formatAuthorName";
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
    <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="rounded-2xl bg-primary/10 p-3"><BookOpen className="size-6 text-primary" /></span>
      <div><p className="text-sm font-semibold sm:text-base lg:text-lg">No books found</p><p className="mt-1 text-xs text-muted-foreground sm:text-sm lg:text-base">Try changing your search or filters.</p></div>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[900px] text-sm sm:text-base">
        <TableHeader><TableRow className="border-border bg-muted/60 hover:bg-muted/60">
          <TableHead>Book</TableHead><TableHead>ISBN</TableHead><TableHead>Category</TableHead>
          {state === "active" ? <><TableHead>Availability</TableHead><TableHead>Total</TableHead></> : <><TableHead>Archived</TableHead><TableHead>Status</TableHead></>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>{books.map((book) => (
          <TableRow key={book.id} className="border-border/60 bg-card/30 hover:bg-muted/45">
            <TableCell><div className="flex items-center gap-3">
              <div className="flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {book.image_url ? <img src={book.image_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="size-4 text-muted-foreground" />}
              </div>
              <div className="min-w-0"><p className="max-w-56 truncate font-medium lg:text-lg">{book.title}</p><p className="mt-1 max-w-56 truncate text-xs text-muted-foreground sm:text-sm lg:text-base" title={book.author || "Unknown author"}>{book.author ? formatAuthorName(book.author) : "Unknown author"}</p></div>
            </div></TableCell>
            <TableCell className="text-xs text-muted-foreground sm:text-sm">{book.isbn || "—"}</TableCell>
            <TableCell><span className="booky-badge text-xs sm:text-sm">{book.category_name || "Uncategorized"}</span></TableCell>
            {state === "active" ? <><TableCell><span className={`${book.available_copies > 0 ? "booky-badge booky-badge-success" : "booky-badge booky-badge-danger"} text-xs sm:text-sm`}>{book.available_copies > 0 ? `${book.available_copies} available` : "Unavailable"}</span></TableCell><TableCell className="text-xs font-semibold sm:text-sm lg:text-base">{book.total_copies}</TableCell></> : <><TableCell className="text-xs text-muted-foreground sm:text-sm lg:text-base">{formatBookDate(book.archived_at)}</TableCell><TableCell><span className="booky-badge text-xs sm:text-sm">Archived</span></TableCell></>}
            <TableCell><div className="flex justify-end gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => onView(book)} aria-label={`View ${book.title}`}><Eye /></Button>
              {state === "active" ? <>
                <Button variant="ghost" size="icon-sm" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}><Pencil /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => onArchive(book)} aria-label={`Archive ${book.title}`} disabled={isProcessing}><Archive /></Button>
              </> : <Button variant="ghost" size="sm" className="text-xs sm:text-sm" onClick={() => onRestore(book)} aria-label={`Restore ${book.title}`} disabled={isProcessing}><RotateCcw /> Restore</Button>}
            </div></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
};

export default BooksTable;
