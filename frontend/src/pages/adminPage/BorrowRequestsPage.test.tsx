import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BorrowRequestsPage from "./BorrowRequestsPage";

vi.mock("@/hooks/useBorrows", () => ({
  useAdminBorrows: () => ({
    data: [
      { id: "one", user_id: "u", book_id: "b", book_title: "Clean Code", book_available_copies: 1, borrowed_at: null, due_date: null, returned_at: null, approved_at: null, rejection_reason: null, status: "PENDING_BORROW", is_overdue: false, created_at: "2026-10-20T08:00:00" },
      { id: "two", user_id: "u", book_id: "b", book_title: "Refactoring", book_available_copies: 0, borrowed_at: null, due_date: null, returned_at: null, approved_at: "2026-10-20T09:00:00", rejection_reason: null, status: "READY_FOR_PICKUP", is_overdue: false, created_at: "2026-10-19T08:00:00" },
      { id: "three", user_id: "u", book_id: "b", book_title: "Old history", book_available_copies: 0, borrowed_at: "2026-10-18T08:00:00", due_date: null, returned_at: null, approved_at: null, rejection_reason: null, status: "BORROWED", is_overdue: false, created_at: "2026-10-17T08:00:00" },
      { id: "four", user_id: "u", book_id: "b", book_title: "New history", book_available_copies: 0, borrowed_at: "2026-10-20T08:00:00", due_date: null, returned_at: null, approved_at: null, rejection_reason: null, status: "BORROWED", is_overdue: false, created_at: "2026-10-19T08:00:00" },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useApproveBorrow: () => ({ mutate: vi.fn(), isPending: false, variables: undefined }),
  useRejectBorrow: () => ({ mutate: vi.fn(), isPending: false, variables: undefined }),
  useConfirmBorrowPickup: () => ({ mutate: vi.fn(), isPending: false, variables: undefined }),
}));

describe("BorrowRequestsPage", () => {
  it("shows Figma summary cards and the route-backed pending tab", () => {
    render(<MemoryRouter initialEntries={["/borrow-requests/pending"]}><Routes><Route path="/borrow-requests/:tab" element={<BorrowRequestsPage />} /></Routes></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Borrow Requests" })).toBeInTheDocument();
    expect(screen.getByText("Pending requests").parentElement).toHaveTextContent("1");
    expect(screen.getByText("For pickup").parentElement).toHaveTextContent("1");
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.queryByText("Refactoring")).not.toBeInTheDocument();
  });

  it("defaults a direct history route to newest activity first", () => {
    render(<MemoryRouter initialEntries={["/borrow-requests/history"]}><Routes><Route path="/borrow-requests/:tab" element={<BorrowRequestsPage />} /></Routes></MemoryRouter>);
    const newer = screen.getByText("New history");
    const older = screen.getByText("Old history");
    expect(newer.compareDocumentPosition(older) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("uses theme-aware surfaces for summary cards and the request workspace", () => {
    const { container } = render(<MemoryRouter initialEntries={["/borrow-requests/pending"]}><Routes><Route path="/borrow-requests/:tab" element={<BorrowRequestsPage />} /></Routes></MemoryRouter>);

    expect(within(container).getByText("Pending requests").closest("article")).toHaveClass("bg-card", "border-border/70");
    expect(container.querySelector("section.overflow-hidden")).toHaveClass("bg-card", "border-border/70");
    expect(within(container).getByPlaceholderText("Search student, book, or request ID")).toHaveClass("bg-control");
  });

  it("scales page and control typography across screen sizes", () => {
    const { container } = render(<MemoryRouter initialEntries={["/borrow-requests/pending"]}><Routes><Route path="/borrow-requests/:tab" element={<BorrowRequestsPage />} /></Routes></MemoryRouter>);
    const view = within(container);

    expect(view.getByText("Borrow Requests", { selector: "p" })).toHaveClass("text-xs", "sm:text-sm");
    expect(view.queryByText("Workspace / Borrow Requests")).not.toBeInTheDocument();
    expect(view.getByRole("heading", { name: "Borrow Requests" })).toHaveClass("text-2xl", "sm:text-3xl");
    expect(view.getByText(/Review student requests/)).toHaveClass("text-sm", "sm:text-base");
    expect(view.getByText("Pending requests")).toHaveClass("text-sm", "sm:text-base");
    expect(view.getByText("Awaiting review")).toHaveClass("text-xs", "sm:text-sm");
    expect(view.getByRole("link", { name: "Pending" })).toHaveClass("text-sm", "sm:text-base");
    expect(view.getByPlaceholderText("Search student, book, or request ID")).toHaveClass("text-sm", "sm:text-base");
  });
});
