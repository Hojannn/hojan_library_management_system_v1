import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import {
  activeStatus,
  borrowerInitials,
  formatLoanDate,
  loanReference,
  returnOutcome,
  type LoanWorkspaceMode,
} from "@/features/borrows/lib/loanView";
import { cn } from "@/lib/utils";

interface AdminBorrowsTableProps {
  borrows: Borrow[];
  mode: LoanWorkspaceMode;
  today: Date;
  onViewDetails: (borrow: Borrow) => void;
  onRecordReturn: (borrow: Borrow) => void;
  isProcessing?: boolean;
  processingId?: string | null;
}

const ROWS_PER_PAGE = 10;

const StatusPill = ({ label, tone }: { label: string; tone: "neutral" | "warning" | "danger" }) => (
  <span className={cn(
    "inline-flex min-w-28 justify-center rounded-full px-3 py-1.5 text-[10px] font-bold",
    tone === "danger" && "bg-danger-soft text-danger",
    tone === "warning" && "bg-warning-soft text-warning",
    tone === "neutral" && "bg-muted text-foreground",
  )}>
    {label}
  </span>
);

const BookCell = ({ borrow }: { borrow: Borrow }) => (
  <div className="flex min-w-48 items-center gap-3">
    {borrow.book_image ? (
      <img src={borrow.book_image} alt="" className="h-12 w-8 rounded object-cover" />
    ) : (
      <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-heading text-[6px] font-bold text-white">BOOK</div>
    )}
    <div className="min-w-0">
      <p className="truncate text-xs font-bold text-foreground">{borrow.book_title || "Untitled"}</p>
      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{borrow.author || "Unknown author"}</p>
      <p className="mt-0.5 text-[9px] text-muted-foreground">{loanReference(borrow.id)}</p>
    </div>
  </div>
);

const StudentCell = ({ borrow }: { borrow: Borrow }) => (
  <div className="flex min-w-48 items-center gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
      {borrowerInitials(borrow.user_name)}
    </span>
    <div className="min-w-0">
      <p className="truncate text-xs font-bold text-foreground">{borrow.user_name || "Unknown student"}</p>
      <p className="mt-1 truncate text-[9px] text-muted-foreground">{borrow.user_email || "No email"}</p>
    </div>
  </div>
);

const AdminBorrowsTable = ({ borrows, mode, today, onViewDetails, onRecordReturn, isProcessing, processingId }: AdminBorrowsTableProps) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(borrows.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = borrows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  const endIndex = Math.min(startIndex + ROWS_PER_PAGE, borrows.length);

  if (!borrows.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted"><Inbox className="size-5 text-muted-foreground" /></span>
        <div><p className="text-sm font-bold">No loan records found</p><p className="mt-1 text-xs text-muted-foreground">Try changing your search or filters.</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow className="border-0 bg-muted/70 hover:bg-muted/70">
              <TableHead className="rounded-l-md px-3 text-[9px] font-bold text-muted-foreground">Student</TableHead>
              <TableHead className="px-3 text-[9px] font-bold text-muted-foreground">Book / Loan</TableHead>
              <TableHead className="px-3 text-[9px] font-bold text-muted-foreground">Borrowed</TableHead>
              <TableHead className="px-3 text-[9px] font-bold text-muted-foreground">Due date</TableHead>
              {mode === "history" && <TableHead className="px-3 text-[9px] font-bold text-muted-foreground">Returned</TableHead>}
              <TableHead className="px-3 text-[9px] font-bold text-muted-foreground">{mode === "active" ? "Status" : "Outcome"}</TableHead>
              <TableHead className="rounded-r-md px-3 text-center text-[9px] font-bold text-muted-foreground">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((borrow) => {
              const status = mode === "active" ? activeStatus(borrow, today) : returnOutcome(borrow);
              const rowBusy = isProcessing && processingId === borrow.id;
              return (
                <TableRow key={borrow.id} className="h-20 border-border/60 bg-white/35 hover:bg-white/55">
                  <TableCell className="px-3"><StudentCell borrow={borrow} /></TableCell>
                  <TableCell className="px-3"><BookCell borrow={borrow} /></TableCell>
                  <TableCell className="px-3 text-[11px]">{formatLoanDate(borrow.borrowed_at)}</TableCell>
                  <TableCell className="px-3 text-[11px]">{formatLoanDate(borrow.due_date)}</TableCell>
                  {mode === "history" && <TableCell className="px-3 text-[11px]">{formatLoanDate(borrow.returned_at)}</TableCell>}
                  <TableCell className="px-3"><StatusPill {...status} /></TableCell>
                  <TableCell className="px-3 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold" onClick={() => onViewDetails(borrow)}>View details</Button>
                      {mode === "active" && (
                        <Button size="sm" className="h-9 min-w-28 rounded-full bg-primary text-[10px] font-bold text-primary-foreground hover:bg-primary-hover" disabled={rowBusy} onClick={() => onRecordReturn(borrow)}>
                          {rowBusy ? "Recording…" : "Record return"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">Showing {startIndex + 1}–{endIndex} of {borrows.length} {mode === "active" ? "active loans" : "returns"}</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="bg-white/40 text-[11px]" disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}>← Previous</Button>
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{currentPage}</span>
          <Button variant="ghost" size="sm" className="bg-white/40 text-[11px]" disabled={currentPage === totalPages} onClick={() => setPage((value) => value + 1)}>Next →</Button>
        </div>
      </div>
    </>
  );
};

export default AdminBorrowsTable;
