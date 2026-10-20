import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Borrow } from "../types/borrow.types";

interface Props { borrow: Borrow | null; open: boolean; processing: boolean; onOpenChange: (open: boolean) => void; onConfirm: (reason: string) => void; }

export default function RejectBorrowRequestDialog({ borrow, open, processing, onOpenChange, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setReason("");
    onOpenChange(nextOpen);
  };
  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent showCloseButton={!processing}><DialogHeader><DialogTitle>Reject borrow request?</DialogTitle><DialogDescription>Tell {borrow?.user_name || "the student"} why this request cannot be fulfilled.</DialogDescription></DialogHeader><div><label htmlFor="rejection-reason" className="mb-2 block text-sm font-medium">Rejection reason</label><Textarea id="rejection-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Enter a clear reason…" disabled={processing} /></div><DialogFooter><Button variant="outline" disabled={processing} onClick={() => handleOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={processing || !reason.trim()} onClick={() => onConfirm(reason.trim())}>Reject request</Button></DialogFooter></DialogContent></Dialog>;
}
