import { Archive, BookOpen, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import { formatBookDate, getBookCirculation } from "../../lib/bookListView";
import type { Book } from "../../types/book.types";

interface Props {
  book: Book | null;
  borrows: Borrow[];
  circulationAvailable: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
}

const BookDetailsDialog = ({ book, borrows, circulationAvailable, open, onOpenChange, onEdit, onArchive }: Props) => {
  if (!book) return null;
  const circulation = getBookCirculation(book.id, borrows);
  const metrics = [["Total copies", book.total_copies], ["Available", book.available_copies], ["On loan", circulationAvailable ? circulation.onLoan : "—"], ["Reserved", circulationAvailable ? circulation.reserved : "—"]];
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent aria-label="Book details" className="w-full overflow-y-auto p-0 sm:max-w-[480px]">
      <SheetHeader className="border-b border-border px-6 py-5"><SheetTitle className="text-xl text-foreground sm:text-2xl">Book details</SheetTitle><SheetDescription className="text-sm sm:text-base">Inventory and circulation information for this title.</SheetDescription></SheetHeader>
      <div className="space-y-6 p-6">
        <div className="flex gap-4"><div className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">{book.image_url ? <img src={book.image_url} alt={`${book.title} cover`} className="h-full w-full object-cover" /> : <BookOpen className="size-7 text-muted-foreground" />}</div><div><h2 className="booky-heading text-xl text-foreground">{book.title}</h2><p className="mt-1 text-sm text-muted-foreground">{book.author || "Unknown author"}</p><span className="booky-badge mt-3">{book.category_name || "Uncategorized"}</span></div></div>
        <div className="grid grid-cols-2 gap-3">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-muted p-4"><p className="text-sm text-muted-foreground sm:text-base">{label}</p><strong className="mt-1 block text-xl text-heading sm:text-2xl">{value}</strong></div>)}</div>
        <dl className="grid grid-cols-[110px_1fr] gap-y-3 text-sm sm:text-base"><dt className="text-muted-foreground">ISBN</dt><dd>{book.isbn || "—"}</dd><dt className="text-muted-foreground">Pages</dt><dd>{book.pages || "—"}</dd><dt className="text-muted-foreground">Added</dt><dd>{formatBookDate(book.created_at)}</dd><dt className="text-muted-foreground">Description</dt><dd>{book.description || "No description provided."}</dd></dl>
        {!circulationAvailable ? <section className="rounded-xl border border-warning/20 bg-warning-soft p-4 text-sm text-warning sm:text-base"><strong>Circulation data is unavailable.</strong><p className="mt-1">Inventory details are still available. Try again before archiving this title.</p></section> : circulation.records.length > 0 && <section><h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground sm:text-base">Current circulation</h3><div className="mt-2 space-y-2">{circulation.records.map((record) => <div key={record.id} className="rounded-lg bg-muted/60 p-3 text-sm sm:text-base"><strong>{record.user_name || "Unknown student"}</strong><span className="ml-2 text-muted-foreground">{record.status.replaceAll("_", " ")}</span></div>)}</div></section>}
      </div>
      {!book.is_deleted && <SheetFooter className="border-t border-border bg-popover p-4 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => onArchive(book)}><Archive /> Archive</Button><Button onClick={() => onEdit(book)}><Pencil /> Edit book</Button></SheetFooter>}
    </SheetContent>
  </Sheet>;
};

export default BookDetailsDialog;
