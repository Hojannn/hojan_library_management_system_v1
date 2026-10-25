import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  itemLabel,
  onPageChange,
  className,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("flex flex-col gap-3 border-t border-border/60 px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-muted-foreground">Showing {start}–{end} of {totalItems} {itemLabel}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><ArrowLeft /> Previous</Button>
        <span className="px-2 text-muted-foreground">Page {currentPage} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next <ArrowRight /></Button>
      </div>
    </div>
  );
}
