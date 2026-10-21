import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/features/books/types/book.types";
import BooksListPage from "./BooksListPage";

const activeBooks: Book[] = Array.from({ length: 12 }, (_, index) => ({
  id: `book-${index + 1}`,
  title: index === 0 ? "Clean Code" : `Title ${String(index + 1).padStart(2, "0")}`,
  author: index === 0 ? "Robert C. Martin" : `Author ${index + 1}`,
  isbn: index === 0 ? "978-0132350884" : `ISBN-${index + 1}`,
  category_id: index % 2 ? "fiction" : "technology",
  category_name: index % 2 ? "Fiction" : "Technology",
  total_copies: index === 0 ? 3 : 1,
  available_copies: index === 1 ? 0 : 1,
  image_url: "",
  pages: 300,
  created_at: `2026-10-${String(index + 1).padStart(2, "0")}T00:00:00Z`,
  is_deleted: false,
  archived_at: null,
}));
const archivedBooks: Book[] = [{ ...activeBooks[0], id: "archived-1", title: "Archived Title", is_deleted: true, archived_at: "2026-10-20T00:00:00Z" }];
const queryState = vi.hoisted(() => ({ borrowError: false, archivedError: false, archivedLoading: false }));

vi.mock("@/hooks/useBooks", () => ({
  useStaffBooks: (state: string) => ({ data: state === "active" ? activeBooks : archivedBooks, isLoading: state === "archived" && queryState.archivedLoading, isError: state === "archived" && queryState.archivedError, error: null }),
  useArchiveBook: () => ({ mutate: vi.fn(), isPending: false }),
  useRestoreBook: () => ({ mutate: vi.fn(), isPending: false }),
  useCreateBooks: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBooks: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/useBorrows", () => ({
  useAdminBorrows: () => ({ data: [{ id: "loan-1", user_id: "u", user_name: "Ana", book_id: "book-1", book_title: "Clean Code", book_available_copies: 1, borrowed_at: null, due_date: null, approved_at: null, rejection_reason: null, returned_at: null, status: "BORROWED", is_overdue: false }], isLoading: false, isError: queryState.borrowError }),
}));
vi.mock("@/features/books/components/categories/CategoryModal", () => ({
  default: () => null,
}));

const renderPage = () => render(<MemoryRouter><BooksListPage /></MemoryRouter>);

describe("BooksListPage", () => {
  beforeEach(() => {
    queryState.borrowError = false;
    queryState.archivedError = false;
    queryState.archivedLoading = false;
  });
  afterEach(cleanup);

  it("shows active inventory summaries and ten rows per page", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Books List" })).toBeInTheDocument();
    expect(screen.getByTestId("total-titles")).toHaveTextContent("12");
    expect(screen.getByTestId("total-copies")).toHaveTextContent("14");
    expect(screen.getByTestId("available-copies")).toHaveTextContent("11");
    expect(screen.getByTestId("unavailable-titles")).toHaveTextContent("1");
    expect(screen.getAllByRole("row")).toHaveLength(11);
  });

  it("filters active books and opens details with circulation counts", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole("searchbox", { name: "Search books" }), "Clean Code");
    expect(screen.getByText("Robert C. Martin")).toBeInTheDocument();
    const row = screen.getByText("Clean Code").closest("tr");
    await user.click(within(row!).getByRole("button", { name: "View Clean Code" }));
    const dialog = screen.getByRole("dialog", { name: "Book details" });
    expect(dialog).toHaveTextContent("Total copies3");
    expect(dialog).toHaveTextContent("On loan1");
    expect(dialog).toHaveTextContent("Reserved0");
  });

  it("filters, sorts, and pages through active inventory", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.selectOptions(screen.getByRole("combobox", { name: "Category" }), "fiction");
    await user.selectOptions(screen.getByRole("combobox", { name: "Availability" }), "unavailable");
    expect(screen.getByText("Title 02")).toBeInTheDocument();
    expect(screen.queryByText("Title 12")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Category" }), "all");
    await user.selectOptions(screen.getByRole("combobox", { name: "Availability" }), "all");
    await user.selectOptions(screen.getByRole("combobox", { name: "Sort books" }), "recent");
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
  });

  it("switches to archived books and exposes restore actions", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Archived/ }));
    expect(screen.getByText("Archived Title")).toBeInTheDocument();
    expect(screen.getByText(/Oct 20, 2026/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restore Archived Title" })).toBeInTheDocument();
  });

  it("keeps active books usable when archived fails and shows the selected-tab error", async () => {
    queryState.archivedError = true;
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText("Title 12")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Books List" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Archived/ }));
    expect(screen.getByText("Could not load archived books.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Books List" })).toBeInTheDocument();
  });

  it("does not report unknown circulation as zero or archive-eligible", async () => {
    queryState.borrowError = true;
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole("searchbox", { name: "Search books" }), "Clean Code");
    const row = screen.getByText("Clean Code").closest("tr");
    await user.click(within(row!).getByRole("button", { name: "View Clean Code" }));
    expect(screen.getByRole("dialog", { name: "Book details" })).toHaveTextContent("Circulation data is unavailable");
    expect(screen.getByRole("dialog", { name: "Book details" })).not.toHaveTextContent("On loan0");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(within(row!).getByRole("button", { name: "Archive Clean Code" }));
    expect(screen.getByRole("heading", { name: "Circulation unavailable" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Archive book" })).not.toBeInTheDocument();
  });
});
