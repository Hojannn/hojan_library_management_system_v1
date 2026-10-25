import { BookOpen, CalendarDays, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatRequestTimestamp, getBorrowReference } from "../lib/borrowRequestView";
import type { Borrow } from "../types/borrow.types";

interface Props {
  borrow: Borrow | null;
  open: boolean;
  processing: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (borrow: Borrow) => void;
  onReject: (borrow: Borrow) => void;
}

export default function BorrowRequestDetailsSheet({ borrow, open, processing, onOpenChange, onApprove, onReject }: Props) {
  if (!borrow) return null;
  const pending = borrow.status === "PENDING_BORROW";
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-border sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5"><SheetTitle className="text-xl text-foreground sm:text-2xl">Borrow request details</SheetTitle><SheetDescription className="text-sm sm:text-base">{getBorrowReference(borrow)}</SheetDescription></SheetHeader>
        <div className="space-y-6 px-6 py-3">
          <section className="rounded-2xl border border-border bg-muted p-4"><p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground sm:text-base">Student</p><p className="flex items-center gap-2 text-sm font-semibold sm:text-base"><UserRound className="size-4 text-primary" />{borrow.user_name || "Unknown student"}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground sm:text-base"><Mail className="size-4" />{borrow.user_email || "No email available"}</p></section>
          <section className="rounded-2xl border border-border bg-muted p-4"><p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground sm:text-base">Requested book</p><div className="flex gap-3"><span className="flex h-16 w-12 items-center justify-center rounded bg-primary/10"><BookOpen className="text-primary" /></span><div><p className="text-sm font-semibold sm:text-base">{borrow.book_title}</p><p className="text-sm text-muted-foreground sm:text-base">{borrow.author || "Unknown author"}</p><p className="mt-2 text-sm font-medium sm:text-base">{borrow.book_available_copies ?? 0} copies currently available</p></div></div></section>
          <section><p className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground sm:text-base">Timeline</p><div className="space-y-3 border-l-2 border-primary/20 pl-4"><p className="flex items-center gap-2 text-sm sm:text-base"><CalendarDays className="size-4 text-primary" />Requested {formatRequestTimestamp(borrow.created_at)}</p>{borrow.approved_at && <p className="text-sm sm:text-base">Approved {formatRequestTimestamp(borrow.approved_at)}</p>}{borrow.borrowed_at && <p className="text-sm sm:text-base">Picked up {formatRequestTimestamp(borrow.borrowed_at)}</p>}{borrow.rejection_reason && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive sm:text-base">Reason: {borrow.rejection_reason}</p>}</div></section>
        </div>
        {pending && <SheetFooter className="border-t border-border bg-popover px-6"><Button variant="destructive" disabled={processing} onClick={() => onReject(borrow)}>Reject</Button><Button disabled={processing} onClick={() => onApprove(borrow)}>Approve request</Button></SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
