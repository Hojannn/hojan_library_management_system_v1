import { Button } from "@/components/ui/button";
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
      <DialogContent className="gap-5 rounded-2xl bg-popover p-6 sm:max-w-[500px]" overlayClassName="bg-overlay backdrop-blur-[2px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="booky-heading text-2xl">Record book return</DialogTitle>
          <DialogDescription>Confirm the book has been received by the library.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-3 rounded-xl bg-muted/70 p-4 text-xs">
          <dt className="text-muted-foreground">Student</dt><dd className="font-bold">{borrow.user_name || "Unknown student"}</dd>
          <dt className="text-muted-foreground">Book</dt><dd className="font-bold">{borrow.book_title}</dd>
          <dt className="text-muted-foreground">Loan ID</dt><dd className="font-bold">{loanReference(borrow.id)}</dd>
          <dt className="text-muted-foreground">Due date</dt><dd className="font-bold">{formatLoanDate(borrow.due_date, true)}</dd>
        </dl>
        <div><p className="mb-2 text-xs font-bold">Return date</p><div className="flex h-11 items-center justify-between rounded-lg bg-white/50 px-3 text-xs"><span>{formatLoanDate(today.toISOString(), true)}</span><span className="text-muted-foreground">Today</span></div></div>
        <p className="text-xs text-muted-foreground">This closes the loan and restores one available copy.</p>
        <DialogFooter className="-mx-6 -mb-6 mt-1 grid grid-cols-[1fr_2fr] border-t-0 bg-transparent px-6 pb-6 pt-2">
          <Button variant="ghost" className="bg-muted text-xs" disabled={isPending} onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-primary text-xs font-bold text-primary-foreground hover:bg-primary-hover" disabled={isPending} onClick={() => onConfirm(borrow)}>{isPending ? "Confirming…" : "Confirm return"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecordReturnDialog;
