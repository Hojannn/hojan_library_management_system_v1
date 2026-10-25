import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmationDialogButtonClass, confirmationDialogContentClass, confirmationDialogDescriptionClass, confirmationDialogDetailClass, confirmationDialogFooterClass, confirmationDialogTitleClass } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { formatBookDate } from "../../lib/bookListView";
import type { Book } from "../../types/book.types";

interface Props {
  open: boolean;
  book: Book | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (book: Book) => void;
}

const BookRestoreDialog = ({ open, book, isPending, onOpenChange, onConfirm }: Props) => {
  if (!book) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={confirmationDialogContentClass}>
      <div className="flex size-11 items-center justify-center rounded-full bg-success-soft text-success"><RotateCcw /></div>
      <DialogTitle className={confirmationDialogTitleClass}>Restore this book?</DialogTitle>
      <DialogDescription className={confirmationDialogDescriptionClass}>This title will return to the active catalog with its existing inventory.</DialogDescription>
      <div className={confirmationDialogDetailClass}><strong className="block font-semibold text-foreground">{book.title}</strong><span className="text-muted-foreground">Archived {formatBookDate(book.archived_at)}</span></div>
      <DialogFooter className={confirmationDialogFooterClass}><Button variant="outline" className={confirmationDialogButtonClass} onClick={() => onOpenChange(false)}>Cancel</Button><Button className={confirmationDialogButtonClass} disabled={isPending} onClick={() => onConfirm(book)}><RotateCcw />{isPending ? "Restoring…" : "Restore book"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
};

export default BookRestoreDialog;
