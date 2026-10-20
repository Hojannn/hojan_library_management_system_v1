import { Archive, BookOpen, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import { formatBookDate, getBookCirculation } from "../../lib/bookListView";
import type { Book } from "../../types/book.types";

interface Props {
  book: Book | null;
  borrows: Borrow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (book: Book) => void;
  onArchive: (book: Book) => void;
}

const BookDetailsDialog = ({ book, borrows, open, onOpenChange, onEdit, onArchive }: Props) => {
  if (!book) return null;
  const circulation = getBookCirculation(book.id, borrows);
  const metrics = [["Total copies", book.total_copies], ["Available", book.available_copies], ["On loan", circulation.onLoan], ["Reserved", circulation.reserved]];
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent aria-label="Book details" className="!top-0 !right-0 !left-auto h-dvh !max-w-[480px] !translate-x-0 !translate-y-0 content-start overflow-y-auto rounded-none p-0 sm:w-[480px]">
      <div className="border-b bg-muted/40 p-6"><p className="booky-eyebrow">Catalog details</p><DialogTitle className="mt-2 text-2xl">Book details</DialogTitle><DialogDescription className="mt-2">Inventory and circulation information for this title.</DialogDescription></div>
      <div className="space-y-6 p-6">
        <div className="flex gap-4"><div className="flex h-36 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">{book.image_url ? <img src={book.image_url} alt={`${book.title} cover`} className="h-full w-full object-cover" /> : <BookOpen className="size-7 text-muted-foreground" />}</div><div><h2 className="booky-heading text-xl">{book.title}</h2><p className="mt-1 text-sm text-muted-foreground">{book.author || "Unknown author"}</p><span className="booky-badge mt-3">{book.category_name || "Uncategorized"}</span></div></div>
        <div className="grid grid-cols-2 gap-3">{metrics.map(([label, value]) => <div key={label} className="rounded-xl border bg-white/25 p-4"><p className="text-[11px] text-muted-foreground">{label}</p><strong className="mt-1 block text-xl text-heading">{value}</strong></div>)}</div>
        <dl className="grid grid-cols-[110px_1fr] gap-y-3 text-xs"><dt className="text-muted-foreground">ISBN</dt><dd>{book.isbn || "—"}</dd><dt className="text-muted-foreground">Pages</dt><dd>{book.pages || "—"}</dd><dt className="text-muted-foreground">Added</dt><dd>{formatBookDate(book.created_at)}</dd><dt className="text-muted-foreground">Description</dt><dd>{book.description || "No description provided."}</dd></dl>
        {circulation.records.length > 0 && <section><h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current circulation</h3><div className="mt-2 space-y-2">{circulation.records.map((record) => <div key={record.id} className="rounded-lg bg-muted/60 p-3 text-xs"><strong>{record.user_name || "Unknown student"}</strong><span className="ml-2 text-muted-foreground">{record.status.replaceAll("_", " ")}</span></div>)}</div></section>}
      </div>
      {!book.is_deleted && <DialogFooter className="mx-0 mb-0 mt-auto p-4"><Button variant="outline" onClick={() => onArchive(book)}><Archive /> Archive</Button><Button onClick={() => onEdit(book)}><Pencil /> Edit book</Button></DialogFooter>}
    </DialogContent>
  </Dialog>;
};

export default BookDetailsDialog;
