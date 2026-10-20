import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import { activeStatus, borrowerInitials, formatLoanDate, loanReference, returnOutcome } from "@/features/borrows/lib/loanView";

interface LoanDetailsDialogProps {
  borrow: Borrow | null;
  open: boolean;
  today: Date;
  onOpenChange: (open: boolean) => void;
  onRecordReturn: (borrow: Borrow) => void;
}

const LoanDetailsDialog = ({ borrow, open, today, onOpenChange, onRecordReturn }: LoanDetailsDialogProps) => {
  if (!borrow) return null;
  const isReturned = borrow.status === "RETURNED" || !!borrow.returned_at;
  const status = isReturned ? returnOutcome(borrow) : activeStatus(borrow, today);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-dvh max-h-none w-full max-w-md translate-x-0 translate-y-0 content-start overflow-y-auto rounded-none bg-popover p-6 sm:max-w-[460px]" overlayClassName="bg-overlay backdrop-blur-[2px]">
        <DialogHeader className="border-b border-border pb-6 pt-2">
          <p className="booky-eyebrow">Loan {loanReference(borrow.id)}</p>
          <DialogTitle className="booky-heading text-2xl">Loan details</DialogTitle>
          <DialogDescription><span className="booky-badge booky-badge-danger mt-2">{status.label}</span></DialogDescription>
        </DialogHeader>

        <section className="border-b border-border py-6">
          <p className="booky-eyebrow mb-4">Student</p>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-xs font-bold">{borrowerInitials(borrow.user_name)}</span>
            <div><p className="font-bold">{borrow.user_name || "Unknown student"}</p><p className="mt-1 text-xs text-muted-foreground">{borrow.user_email || "No email"}</p></div>
          </div>
        </section>

        <section className="border-b border-border py-6">
          <p className="booky-eyebrow mb-4">Borrowed book</p>
          <div className="flex items-center gap-4">
            {borrow.book_image ? <img src={borrow.book_image} alt="" className="h-24 w-16 rounded object-cover" /> : <div className="flex h-24 w-16 items-center justify-center rounded bg-heading text-[10px] font-bold text-white">BOOK</div>}
            <div><h3 className="booky-heading text-lg">{borrow.book_title}</h3><p className="mt-1 text-xs text-muted-foreground">{borrow.author || "Unknown author"}</p><p className="mt-3 text-xs text-muted-foreground">Loan duration: 14 days</p></div>
          </div>
        </section>

        <section className="py-6">
          <p className="booky-eyebrow mb-5">Loan timeline</p>
          <ol className="space-y-5">
            <li className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">1</span><div><p className="text-xs font-bold">Book picked up</p><p className="mt-1 text-xs text-muted-foreground">{formatLoanDate(borrow.borrowed_at, true)}</p></div></li>
            <li className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">2</span><div><p className="text-xs font-bold">Return due date</p><p className="mt-1 text-xs text-muted-foreground">{formatLoanDate(borrow.due_date, true)}</p></div></li>
            <li className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-danger-soft text-[10px] font-bold text-danger">3</span><div><p className="text-xs font-bold">{isReturned ? "Returned" : "Awaiting return"}</p><p className="mt-1 text-xs text-muted-foreground">{isReturned ? formatLoanDate(borrow.returned_at, true) : status.label}</p></div></li>
          </ol>
        </section>

        {!isReturned && <Button className="mt-auto h-11 w-full rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:bg-primary-hover" onClick={() => onRecordReturn(borrow)}>Record return</Button>}
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetailsDialog;
