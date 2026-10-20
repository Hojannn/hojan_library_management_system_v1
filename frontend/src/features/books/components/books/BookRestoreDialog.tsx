import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <DialogContent className="p-6 sm:max-w-md">
      <div className="flex size-11 items-center justify-center rounded-full bg-success-soft text-success"><RotateCcw /></div>
      <DialogTitle className="text-xl">Restore this book?</DialogTitle>
      <DialogDescription>This title will return to the active catalog with its existing inventory.</DialogDescription>
      <div className="rounded-xl bg-muted/60 p-4 text-xs"><strong className="block text-sm text-heading">{book.title}</strong><span className="text-muted-foreground">Archived {formatBookDate(book.archived_at)}</span></div>
      <DialogFooter className="mt-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={isPending} onClick={() => onConfirm(book)}><RotateCcw />{isPending ? "Restoring…" : "Restore book"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
};

export default BookRestoreDialog;
