import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/features/books/types/book.types";
import BooksListPage from "./BooksListPage";

const activeBooks: Book[] = Array.from({ length: 12 }, (_, index) => ({
  id: `book-${index + 1}`,
  title: index === 0 ? "Clean Code" : `Title ${String(index + 1).padStart(2, "0")}`,
  author: index === 0 ? "Robert C. Martin, Martin Fowler" : `Author ${index + 1}`,
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

const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="Current location">{`${location.pathname}${location.search}`}</output>;
};
const renderPage = (initialEntry = "/book-list") => render(<MemoryRouter initialEntries={[initialEntry]}><BooksListPage /><LocationProbe /></MemoryRouter>);

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
    expect(screen.getByText("Library catalog", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("Workspace / Library catalog")).not.toBeInTheDocument();
    expect(screen.getByTestId("total-titles")).toHaveTextContent("12");
    expect(screen.getByTestId("total-copies")).toHaveTextContent("14");
    expect(screen.getByTestId("available-copies")).toHaveTextContent("11");
    expect(screen.getByTestId("unavailable-titles")).toHaveTextContent("1");
    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(screen.getByText("Showing 1–10 of 12 books")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("matches the borrow request page spacing and table surfaces", () => {
    renderPage();

    const page = screen.getByRole("heading", { name: "Books List" }).closest("header")?.parentElement;
    const card = screen.getByText("Total titles").closest("article");
    const workspace = screen.getByRole("searchbox", { name: "Search books" }).closest("section");
    const filterBar = screen.getByRole("searchbox", { name: "Search books" }).closest("div");
    const headerRow = screen.getByRole("columnheader", { name: "Book" }).closest("tr");
    const bookRow = screen.getByText("Title 12").closest("tr");

    expect(page).toHaveClass("w-full", "space-y-7", "pb-10");
    expect(page).not.toHaveClass("mx-auto", "max-w-[1180px]");
    expect(card).toHaveClass("rounded-3xl", "border-border/70", "bg-card", "shadow-[var(--glass-shadow)]");
    expect(workspace).toHaveClass("overflow-hidden", "rounded-3xl", "border-border/70", "bg-card");
    expect(filterBar).toHaveClass("border-b", "border-border", "p-5");
    expect(headerRow).toHaveClass("border-border", "bg-muted/60");
    expect(bookRow).toHaveClass("border-border/60", "bg-card/30");
  });

  it("uses compact author formatting in the table", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole("searchbox", { name: "Search books" }), "Clean Code");

    expect(screen.getByText("Robert C. Martin et al.")).toHaveAttribute("title", "Robert C. Martin, Martin Fowler");
  });

  it("scales page, controls, and table typography with the screen size", () => {
    renderPage();
    const titleRow = screen.getByText("Title 12").closest("tr");
    expect(titleRow).not.toBeNull();

    expect(screen.getByRole("heading", { name: "Books List" })).toHaveClass("text-2xl", "sm:text-3xl", "lg:text-4xl");
    expect(screen.getByTestId("total-titles")).toHaveClass("text-2xl", "sm:text-3xl", "lg:text-4xl");
    expect(screen.getByRole("button", { name: /All Books/ })).toHaveClass("text-sm", "sm:text-base", "lg:text-lg");
    expect(screen.getByRole("searchbox", { name: "Search books" })).toHaveClass("text-sm", "sm:text-base");
    expect(screen.getByRole("combobox", { name: "Category" })).toHaveClass("text-sm", "sm:text-base");
    expect(within(titleRow!).getByText("Author 12")).toHaveClass("text-xs", "sm:text-sm", "lg:text-base");
    expect(within(titleRow!).getByText("Fiction")).toHaveClass("text-xs", "sm:text-sm");
    expect(within(titleRow!).getByText("1 available")).toHaveClass("text-xs", "sm:text-sm");
  });

  it("filters active books and opens details with circulation counts", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole("searchbox", { name: "Search books" }), "Clean Code");
    expect(screen.getByText("Robert C. Martin et al.")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getByText("Showing 11–12 of 12 books")).toBeInTheDocument();
  });

  it("switches to archived books and exposes restore actions", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: /Archived/ }));
    expect(screen.getByText("Archived Title")).toBeInTheDocument();
    expect(screen.getByText(/Oct 20, 2026/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Restore Archived Title" }));
    const restoreDialog = screen.getByRole("dialog", { name: "Restore this book?" });
    expect(restoreDialog).toHaveClass("bg-popover", "text-popover-foreground", "sm:max-w-md");
    expect(screen.getByRole("heading", { name: "Restore this book?" })).toHaveClass("text-xl", "sm:text-2xl", "text-foreground");
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
    const archiveDialog = screen.getByRole("dialog", { name: "Circulation unavailable" });
    expect(archiveDialog).toHaveClass("bg-popover", "text-popover-foreground", "sm:max-w-md");
    expect(screen.getByRole("heading", { name: "Circulation unavailable" })).toHaveClass("text-xl", "sm:text-2xl", "text-foreground");
    expect(screen.queryByRole("button", { name: "Archive book" })).not.toBeInTheDocument();
  });

  it("opens a linked staff book detail and clears the query when closed", async () => {
    const user = userEvent.setup();
    renderPage("/book-list?book=book-1");
    expect(await screen.findByRole("dialog", { name: "Book details" })).toHaveTextContent("Clean Code");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByLabelText("Current location")).toHaveTextContent("/book-list");
    expect(screen.getByLabelText("Current location")).not.toHaveTextContent("?book=");
  });

  it("ignores an unknown linked book id", () => {
    renderPage("/book-list?book=missing-book");
    expect(screen.queryByRole("dialog", { name: "Book details" })).not.toBeInTheDocument();
  });
});
