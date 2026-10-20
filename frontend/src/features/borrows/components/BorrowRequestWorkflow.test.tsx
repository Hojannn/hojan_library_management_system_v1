import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Borrow } from "../types/borrow.types";
import BorrowRequestsTable from "./BorrowRequestsTable";
import RejectBorrowRequestDialog from "./RejectBorrowRequestDialog";
import ConfirmPickupDialog from "./ConfirmPickupDialog";

const borrow: Borrow = {
  id: "12345678-abcd-4000-8000-123456789abc",
  user_id: "user-1",
  user_name: "Ana Cruz",
  user_email: "ana@example.com",
  book_id: "book-1",
  book_title: "Clean Code",
  book_image: null,
  author: "Robert C. Martin",
  book_available_copies: 2,
  borrowed_at: null,
  due_date: null,
  returned_at: null,
  approved_at: null,
  rejection_reason: null,
  status: "PENDING_BORROW",
  is_overdue: false,
  created_at: "2026-10-20T18:45:00",
};

describe("borrow request workflow components", () => {
  it("renders request date without time and a cover fallback", () => {
    render(<BorrowRequestsTable rows={[borrow]} tab="pending" onOpen={vi.fn()} />);
    expect(screen.getByText(/Oct 20, 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/6:45/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("No cover available for Clean Code")).toBeInTheDocument();
  });

  it("shows a tab-specific empty state", () => {
    render(<BorrowRequestsTable rows={[]} tab="pickup" onOpen={vi.fn()} />);
    expect(screen.getByText("No books are waiting for pickup")).toBeInTheDocument();
  });

  it("requires and trims a rejection reason", async () => {
    const confirm = vi.fn();
    const user = userEvent.setup();
    render(
      <RejectBorrowRequestDialog
        borrow={borrow}
        open
        processing={false}
        onOpenChange={vi.fn()}
        onConfirm={confirm}
      />,
    );
    const submit = screen.getByRole("button", { name: "Reject request" });
    expect(submit).toBeDisabled();
    await user.type(screen.getByLabelText("Rejection reason"), "  Missing ID  ");
    await user.click(submit);
    expect(confirm).toHaveBeenCalledWith("Missing ID");
  });

  it("confirms pickup once and previews a fourteen-day loan", async () => {
    const confirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmPickupDialog
        borrow={{ ...borrow, status: "READY_FOR_PICKUP" }}
        open
        processing={false}
        onOpenChange={vi.fn()}
        onConfirm={confirm}
      />,
    );
    expect(screen.getByText("14 days")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm pickup" }));
    expect(confirm).toHaveBeenCalledTimes(1);
  });
});
