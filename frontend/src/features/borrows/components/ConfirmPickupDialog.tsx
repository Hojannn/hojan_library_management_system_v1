import { Button } from "@/components/ui/button";
import { confirmationDialogButtonClass, confirmationDialogContentClass, confirmationDialogDescriptionClass, confirmationDialogDetailClass, confirmationDialogFooterClass, confirmationDialogTitleClass } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatRequestDate } from "../lib/borrowRequestView";
import type { Borrow } from "../types/borrow.types";

interface Props { borrow: Borrow | null; open: boolean; processing: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; }

export default function ConfirmPickupDialog({ borrow, open, processing, onOpenChange, onConfirm }: Props) {
  const pickup = new Date();
  const due = new Date(pickup);
  due.setDate(due.getDate() + 14);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className={confirmationDialogContentClass} showCloseButton={!processing}><DialogHeader><DialogTitle className={confirmationDialogTitleClass}>Confirm book pickup</DialogTitle><DialogDescription className={confirmationDialogDescriptionClass}>This starts the loan for {borrow?.user_name || "this student"}.</DialogDescription></DialogHeader><div className={confirmationDialogDetailClass}><p className="font-semibold">{borrow?.book_title}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:text-base"><div><dt className="text-muted-foreground">Pickup date</dt><dd className="font-medium">{formatRequestDate(pickup.toISOString())}</dd></div><div><dt className="text-muted-foreground">Expected return</dt><dd className="font-medium">{formatRequestDate(due.toISOString())}</dd></div></dl><p className="mt-3 text-sm font-semibold text-primary">Loan period: <span>14 days</span></p></div><DialogFooter className={confirmationDialogFooterClass}><Button variant="outline" className={confirmationDialogButtonClass} disabled={processing} onClick={() => onOpenChange(false)}>Cancel</Button><Button className={confirmationDialogButtonClass} disabled={processing} onClick={onConfirm}>Confirm pickup</Button></DialogFooter></DialogContent></Dialog>;
}
