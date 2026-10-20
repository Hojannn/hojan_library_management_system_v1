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
      <SheetContent className="w-full overflow-y-auto bg-[#f7f5ef] sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5"><SheetTitle>Borrow request details</SheetTitle><SheetDescription>{getBorrowReference(borrow)}</SheetDescription></SheetHeader>
        <div className="space-y-6 px-6 py-3">
          <section className="rounded-2xl border bg-white/70 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</p><p className="flex items-center gap-2 font-semibold"><UserRound className="size-4 text-primary" />{borrow.user_name || "Unknown student"}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="size-4" />{borrow.user_email || "No email available"}</p></section>
          <section className="rounded-2xl border bg-white/70 p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requested book</p><div className="flex gap-3"><span className="flex h-16 w-12 items-center justify-center rounded bg-primary/10"><BookOpen className="text-primary" /></span><div><p className="font-semibold">{borrow.book_title}</p><p className="text-sm text-muted-foreground">{borrow.author || "Unknown author"}</p><p className="mt-2 text-xs font-medium">{borrow.book_available_copies ?? 0} copies currently available</p></div></div></section>
          <section><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline</p><div className="space-y-3 border-l-2 border-primary/20 pl-4"><p className="flex items-center gap-2 text-sm"><CalendarDays className="size-4 text-primary" />Requested {formatRequestTimestamp(borrow.created_at)}</p>{borrow.approved_at && <p className="text-sm">Approved {formatRequestTimestamp(borrow.approved_at)}</p>}{borrow.borrowed_at && <p className="text-sm">Picked up {formatRequestTimestamp(borrow.borrowed_at)}</p>}{borrow.rejection_reason && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Reason: {borrow.rejection_reason}</p>}</div></section>
        </div>
        {pending && <SheetFooter className="border-t bg-white/60 px-6"><Button variant="destructive" disabled={processing} onClick={() => onReject(borrow)}>Reject</Button><Button disabled={processing} onClick={() => onApprove(borrow)}>Approve request</Button></SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
