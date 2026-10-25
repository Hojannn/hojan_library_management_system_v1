import { AlertTriangle, Archive } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { confirmationDialogButtonClass, confirmationDialogContentClass, confirmationDialogDescriptionClass, confirmationDialogDetailClass, confirmationDialogFooterClass, confirmationDialogTitleClass } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import type { getBookCirculation } from "../../lib/bookListView";
import type { Book } from "../../types/book.types";

interface Props {
  open: boolean;
  book: Book | null;
  circulation: ReturnType<typeof getBookCirculation>;
  circulationAvailable: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (book: Book) => void;
}

const BookArchiveDialog = ({ open, book, circulation, circulationAvailable, isPending, onOpenChange, onConfirm }: Props) => {
  if (!book) return null;
  const blocked = circulation.hasBlocking;
  const destination = circulation.blockingKind === "request" ? "/borrow-requests/pending" : "/all-borrows/active";
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={confirmationDialogContentClass}>
      <div className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning"><AlertTriangle /></div>
      <DialogTitle className={confirmationDialogTitleClass}>{!circulationAvailable ? "Circulation unavailable" : blocked ? "Book cannot be archived" : "Archive this book?"}</DialogTitle>
      <DialogDescription className={confirmationDialogDescriptionClass}>{!circulationAvailable ? "Eligibility cannot be confirmed right now. Reload circulation data before archiving." : blocked ? "Resolve the active circulation records before archiving this title." : "No active loans or reservations exist. The title will leave the active catalog and remain available in Archived."}</DialogDescription>
      <div className={confirmationDialogDetailClass}><strong className="block font-semibold text-foreground">{book.title}</strong><span className="text-muted-foreground">{book.author}</span><div className="mt-3 flex flex-wrap gap-5"><span>Total: {book.total_copies}</span><span>Available: {book.available_copies}</span>{blocked && <span>Active: {circulation.onLoan + circulation.reserved}</span>}</div></div>
      <DialogFooter className={confirmationDialogFooterClass}>
        <Button variant="outline" className={confirmationDialogButtonClass} onClick={() => onOpenChange(false)}>Cancel</Button>
        {!circulationAvailable ? null : blocked ? <Button className={confirmationDialogButtonClass} render={<Link to={destination} />}>{circulation.blockingKind === "request" ? "Review borrow requests" : "Review active loans"}</Button> : <Button variant="destructive" className={confirmationDialogButtonClass} disabled={isPending} onClick={() => onConfirm(book)}><Archive />{isPending ? "Archiving…" : "Archive book"}</Button>}
      </DialogFooter>
    </DialogContent>
  </Dialog>;
};

export default BookArchiveDialog;
