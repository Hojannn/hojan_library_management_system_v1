import { AlertTriangle, Archive } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import type { getBookCirculation } from "../../lib/bookListView";
import type { Book } from "../../types/book.types";

interface Props {
  open: boolean;
  book: Book | null;
  circulation: ReturnType<typeof getBookCirculation>;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (book: Book) => void;
}

const BookArchiveDialog = ({ open, book, circulation, isPending, onOpenChange, onConfirm }: Props) => {
  if (!book) return null;
  const blocked = circulation.hasBlocking;
  const destination = circulation.blockingKind === "request" ? "/borrow-requests/pending" : "/all-borrows/active";
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="p-6 sm:max-w-md">
      <div className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning"><AlertTriangle /></div>
      <DialogTitle className="text-xl">{blocked ? "Book cannot be archived" : "Archive this book?"}</DialogTitle>
      <DialogDescription>{blocked ? "Resolve the active circulation records before archiving this title." : "The title will leave the active catalog and remain available in Archived."}</DialogDescription>
      <div className="rounded-xl bg-muted/60 p-4 text-xs"><strong className="block text-sm text-heading">{book.title}</strong><span className="text-muted-foreground">{book.author}</span><div className="mt-3 flex gap-5"><span>Total: {book.total_copies}</span><span>Available: {book.available_copies}</span>{blocked && <span>Active: {circulation.onLoan + circulation.reserved}</span>}</div></div>
      <DialogFooter className="mt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        {blocked ? <Button render={<Link to={destination} />}>{circulation.blockingKind === "request" ? "Review borrow requests" : "Review active loans"}</Button> : <Button variant="destructive" disabled={isPending} onClick={() => onConfirm(book)}><Archive />{isPending ? "Archiving…" : "Archive book"}</Button>}
      </DialogFooter>
    </DialogContent>
  </Dialog>;
};

export default BookArchiveDialog;
