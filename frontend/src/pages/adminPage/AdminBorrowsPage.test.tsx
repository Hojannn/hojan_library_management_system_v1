import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import AdminBorrowsPage from "./AdminBorrowsPage";

const mocks = vi.hoisted(() => ({ confirmReturn: vi.fn() }));

const borrows: Borrow[] = [
  {
    id: "00000000-0000-0000-0000-000000000014",
    user_id: "student-1",
    user_name: "Maria Santos",
    user_email: "maria.santos@student.edu",
    book_id: "book-1",
    book_title: "Clean Code",
    author: "Robert C. Martin",
    book_image: null,
    book_available_copies: 0,
    borrowed_at: "2026-10-04T08:00:00Z",
    due_date: "2026-10-18T08:00:00Z",
    approved_at: "2026-10-03T08:00:00Z",
    rejection_reason: null,
    returned_at: null,
    status: "BORROWED",
    is_overdue: true,
    created_at: "2026-10-03T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    user_id: "student-2",
    user_name: "Bea Cruz",
    user_email: "bea.cruz@student.edu",
    book_id: "book-2",
    book_title: "The Alchemist",
    author: "Paulo Coelho",
    book_image: null,
    book_available_copies: 0,
    borrowed_at: "2026-10-06T08:00:00Z",
    due_date: "2026-10-20T08:00:00Z",
    approved_at: "2026-10-05T08:00:00Z",
    rejection_reason: null,
    returned_at: null,
    status: "PENDING_RETURN",
    is_overdue: false,
    created_at: "2026-10-05T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    user_id: "student-3",
    user_name: "Juan Delacruz",
    user_email: "juan.delacruz@student.edu",
    book_id: "book-3",
    book_title: "Atomic Habits",
    author: "James Clear",
    book_image: null,
    book_available_copies: 1,
    borrowed_at: "2026-10-06T08:00:00Z",
    due_date: "2026-10-20T08:00:00Z",
    approved_at: "2026-10-05T08:00:00Z",
    rejection_reason: null,
    returned_at: "2026-10-20T09:00:00Z",
    status: "RETURNED",
    is_overdue: false,
    created_at: "2026-10-05T08:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000099",
    user_id: "student-4",
    user_name: "Ignored Request",
    user_email: "ignored@student.edu",
    book_id: "book-4",
    book_title: "Pending Book",
    author: "Pending Author",
    book_image: null,
    book_available_copies: 1,
    borrowed_at: null,
    due_date: null,
    approved_at: null,
    rejection_reason: null,
    returned_at: null,
    status: "PENDING_BORROW",
    is_overdue: false,
    created_at: "2026-10-20T07:00:00Z",
  },
];

vi.mock("@/hooks/useBorrows", () => ({
  useAdminBorrows: () => ({ data: borrows, isLoading: false, isError: false, error: null }),
  useApproveReturn: () => ({
    mutate: mocks.confirmReturn,
    isPending: false,
    variables: null,
  }),
}));

const renderPage = () => render(
  <MemoryRouter initialEntries={["/all-borrows/active"]}>
    <Routes>
      <Route path="/all-borrows/:status" element={<AdminBorrowsPage />} />
    </Routes>
  </MemoryRouter>,
);

describe("AdminBorrowsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-10-20T12:00:00+08:00"));
    mocks.confirmReturn.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows live loan summary counts and keeps borrow requests out of the workspace", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Loans & Returns" })).toBeInTheDocument();
    expect(screen.getByTestId("active-loans-count")).toHaveTextContent("02");
    expect(screen.getByTestId("overdue-count")).toHaveTextContent("01");
    expect(screen.getByTestId("due-today-count")).toHaveTextContent("01");
    expect(screen.getByTestId("returned-today-count")).toHaveTextContent("01");
    expect(screen.queryByText("Ignored Request")).not.toBeInTheDocument();
  });

  it("switches to return history and filters it by student or book", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();

    await user.click(screen.getByRole("button", { name: /Return History/i }));
    expect(screen.getByText("Juan Delacruz")).toBeInTheDocument();
    expect(screen.queryByText("Maria Santos")).not.toBeInTheDocument();

    await user.type(screen.getByRole("searchbox"), "Atomic");
    expect(screen.getByText("Atomic Habits")).toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "No match");
    expect(screen.getByText("No loan records found")).toBeInTheDocument();
  });

  it("opens loan details and confirms a physical return", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderPage();

    const mariaRow = screen.getByText("Maria Santos").closest("tr");
    expect(mariaRow).not.toBeNull();
    await user.click(within(mariaRow!).getByRole("button", { name: "View details" }));
    expect(screen.getByRole("dialog", { name: "Loan details" })).toHaveTextContent("LN-014");

    await user.click(screen.getByRole("button", { name: "Record return" }));
    expect(screen.getByRole("dialog", { name: "Record book return" })).toHaveTextContent("October 20, 2026");

    await user.click(screen.getByRole("button", { name: "Confirm return" }));
    expect(mocks.confirmReturn).toHaveBeenCalledWith("00000000-0000-0000-0000-000000000014");
  });
});
