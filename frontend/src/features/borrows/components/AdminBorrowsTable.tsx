import { useState } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
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
import { formatAuthorName } from "@/utils/formatAuthorName";

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
    "inline-flex justify-center rounded-full px-2 py-1.5 text-xs font-bold sm:px-3 sm:text-sm",
    tone === "danger" && "bg-danger-soft text-danger",
    tone === "warning" && "bg-warning-soft text-warning",
    tone === "neutral" && "bg-muted text-foreground",
  )}>
    {label}
  </span>
);

const BookCell = ({ borrow }: { borrow: Borrow }) => (
  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
    {borrow.book_image ? (
      <img src={borrow.book_image} alt="" className="h-12 w-8 rounded object-cover" />
    ) : (
      <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-heading text-[6px] font-bold text-white">BOOK</div>
    )}
    <div className="min-w-0">
      <p className="truncate text-xs font-bold text-foreground sm:text-sm">{borrow.book_title || "Untitled"}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm" title={borrow.author || "Unknown author"}>{borrow.author ? formatAuthorName(borrow.author) : "Unknown author"}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{loanReference(borrow.id)}</p>
    </div>
  </div>
);

const StudentCell = ({ borrow }: { borrow: Borrow }) => (
  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
      {borrowerInitials(borrow.user_name)}
    </span>
    <div className="min-w-0">
      <p className="truncate text-xs font-bold text-foreground sm:text-sm">{borrow.user_name || "Unknown student"}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">{borrow.user_email || "No email"}</p>
    </div>
  </div>
);

const AdminBorrowsTable = ({ borrows, mode, today, onViewDetails, onRecordReturn, isProcessing, processingId }: AdminBorrowsTableProps) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(borrows.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const pageRows = borrows.slice(startIndex, startIndex + ROWS_PER_PAGE);

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
      <div className="w-full overflow-x-auto">
        <Table className="w-full table-fixed text-sm sm:text-base">
          <TableHeader>
            <TableRow className="border-border bg-muted/60 hover:bg-muted/60">
              <TableHead className={cn("w-[21%] px-2 text-foreground sm:px-3", mode === "active" && "w-[22%]")}>Student</TableHead>
              <TableHead className={cn("w-[22%] px-2 text-foreground sm:px-3", mode === "active" && "w-[24%]")}>Book / Loan</TableHead>
              <TableHead className="w-[10%] px-2 text-foreground sm:px-3">Borrowed</TableHead>
              <TableHead className="w-[10%] px-2 text-foreground sm:px-3">Due date</TableHead>
              {mode === "history" && <TableHead className="w-[9%] px-2 text-foreground sm:px-3">Returned</TableHead>}
              <TableHead className={cn("w-[10%] px-2 text-foreground sm:px-3", mode === "active" && "w-[12%]")}>{mode === "active" ? "Status" : "Outcome"}</TableHead>
              <TableHead className={cn("w-[18%] px-2 text-center text-foreground sm:px-3", mode === "active" && "w-[22%]")}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((borrow) => {
              const status = mode === "active" ? activeStatus(borrow, today) : returnOutcome(borrow);
              const rowBusy = isProcessing && processingId === borrow.id;
              return (
                <TableRow key={borrow.id} className="h-20 border-border/60 bg-card/30 hover:bg-muted/45">
                  <TableCell className="overflow-hidden px-2 sm:px-3"><StudentCell borrow={borrow} /></TableCell>
                  <TableCell className="overflow-hidden px-2 sm:px-3"><BookCell borrow={borrow} /></TableCell>
                  <TableCell className="break-words px-2 text-xs sm:px-3 sm:text-sm">{formatLoanDate(borrow.borrowed_at)}</TableCell>
                  <TableCell className="break-words px-2 text-xs sm:px-3 sm:text-sm">{formatLoanDate(borrow.due_date)}</TableCell>
                  {mode === "history" && <TableCell className="break-words px-2 text-xs sm:px-3 sm:text-sm">{formatLoanDate(borrow.returned_at)}</TableCell>}
                  <TableCell className="overflow-hidden px-2 sm:px-3"><StatusPill {...status} /></TableCell>
                  <TableCell className="px-1 text-center sm:px-3">
                    <div className="flex flex-row items-center justify-center gap-1.5">
                      <Button variant="ghost" size="sm" className="h-7 text-xs font-bold sm:text-sm" onClick={() => onViewDetails(borrow)}>View details</Button>
                      {mode === "active" && (
                        <Button size="sm" className="h-auto min-h-9 whitespace-normal rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground hover:bg-primary-hover sm:px-3 sm:text-sm" disabled={rowBusy} onClick={() => onRecordReturn(borrow)}>
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
      <TablePagination className="mt-auto" page={currentPage} pageSize={ROWS_PER_PAGE} totalItems={borrows.length} itemLabel={mode === "active" ? "active loans" : "returns"} onPageChange={setPage} />
    </>
  );
};

export default AdminBorrowsTable;
