import { Button } from "@/components/ui/button";
import { confirmationDialogButtonClass, confirmationDialogContentClass, confirmationDialogDescriptionClass, confirmationDialogDetailClass, confirmationDialogFooterClass, confirmationDialogTitleClass } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import { formatLoanDate, loanReference } from "@/features/borrows/lib/loanView";

interface RecordReturnDialogProps {
  borrow: Borrow | null;
  open: boolean;
  today: Date;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (borrow: Borrow) => void;
}

const RecordReturnDialog = ({ borrow, open, today, isPending, onOpenChange, onConfirm }: RecordReturnDialogProps) => {
  if (!borrow) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={confirmationDialogContentClass} overlayClassName="bg-overlay backdrop-blur-[2px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className={confirmationDialogTitleClass}>Record book return</DialogTitle>
          <DialogDescription className={confirmationDialogDescriptionClass}>Confirm the book has been received by the library.</DialogDescription>
        </DialogHeader>
        <dl className={`${confirmationDialogDetailClass} grid grid-cols-[96px_1fr] gap-x-4 gap-y-3`}>
          <dt className="text-muted-foreground">Student</dt><dd className="font-bold">{borrow.user_name || "Unknown student"}</dd>
          <dt className="text-muted-foreground">Book</dt><dd className="font-bold">{borrow.book_title}</dd>
          <dt className="text-muted-foreground">Loan ID</dt><dd className="font-bold">{loanReference(borrow.id)}</dd>
          <dt className="text-muted-foreground">Due date</dt><dd className="font-bold">{formatLoanDate(borrow.due_date, true)}</dd>
        </dl>
        <div><p className="mb-2 text-sm font-bold text-foreground sm:text-base">Return date</p><div className="flex h-11 items-center justify-between rounded-lg border border-border bg-background px-3 text-sm sm:text-base"><span>{formatLoanDate(today.toISOString(), true)}</span><span className="text-muted-foreground">Today</span></div></div>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">This closes the loan and restores one available copy.</p>
        <DialogFooter className={`${confirmationDialogFooterClass} grid grid-cols-[1fr_2fr]`}>
          <Button variant="outline" className={confirmationDialogButtonClass} disabled={isPending} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className={confirmationDialogButtonClass} disabled={isPending} onClick={() => onConfirm(borrow)}>{isPending ? "Confirming…" : "Confirm return"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordReturnDialog;
