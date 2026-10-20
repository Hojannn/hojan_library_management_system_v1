import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRequestDate } from "../lib/borrowRequestView";
import type { Borrow } from "../types/borrow.types";

interface Props { borrow: Borrow | null; open: boolean; processing: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; }

export default function ConfirmPickupDialog({ borrow, open, processing, onOpenChange, onConfirm }: Props) {
  const pickup = new Date();
  const due = new Date(pickup);
  due.setDate(due.getDate() + 14);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent showCloseButton={!processing}><DialogHeader><DialogTitle>Confirm book pickup</DialogTitle><DialogDescription>This starts the loan for {borrow?.user_name || "this student"}.</DialogDescription></DialogHeader><div className="rounded-xl border bg-muted/40 p-4"><p className="font-semibold">{borrow?.book_title}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">Pickup date</dt><dd className="font-medium">{formatRequestDate(pickup.toISOString())}</dd></div><div><dt className="text-muted-foreground">Expected return</dt><dd className="font-medium">{formatRequestDate(due.toISOString())}</dd></div></dl><p className="mt-3 text-xs font-semibold text-primary">Loan period: <span>14 days</span></p></div><DialogFooter><Button variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={processing} onClick={onConfirm}>Confirm pickup</Button></DialogFooter></DialogContent></Dialog>;
}
