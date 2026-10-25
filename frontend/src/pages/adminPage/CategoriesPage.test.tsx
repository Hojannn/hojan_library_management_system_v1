import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import CategoriesPage from "./CategoriesPage";

const roleState = vi.hoisted(() => ({ role: "admin", booksError: false }));
const categories = [
  { id: "programming", name: "Programming", book_count: 2 },
  { id: "history", name: "History", book_count: 0 },
  ...Array.from({ length: 5 }, (_, index) => ({ id: `supplemental-${index + 1}`, name: `Supplemental ${index + 1}`, book_count: 0 })),
];
const books = [
  { id: "b1", title: "Clean Code", author: "Robert C. Martin", category_id: "programming", category_name: "Programming", total_copies: 2, available_copies: 1, image_url: null, pages: 464 },
  { id: "b2", title: "The Pragmatic Programmer", author: "David Thomas", category_id: "programming", category_name: "Programming", total_copies: 1, available_copies: 1, image_url: null, pages: 352 },
];

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { role: roleState.role } }) }));
vi.mock("@/hooks/useCategories", () => ({
  useCategories: () => ({ data: categories, isLoading: false, isError: false }),
  useDeleteCategory: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock("@/hooks/useBooks", () => ({ useStaffBooks: () => ({ data: books, isLoading: false, isError: roleState.booksError }) }));
vi.mock("@/features/books/components/categories/CategoryModal", () => ({ default: ({ isOpen, initialCategory }: { isOpen: boolean; initialCategory?: { name: string } | null }) => isOpen ? <div role="dialog">{initialCategory ? `Edit ${initialCategory.name}` : "Manage Categories"}</div> : null }));

const renderPage = () => render(<MemoryRouter><CategoriesPage /></MemoryRouter>);

describe("CategoriesPage", () => {
  afterEach(() => { cleanup(); roleState.role = "admin"; roleState.booksError = false; });

  it("renders the Figma summary and category table", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Categories" })).toBeInTheDocument();
    expect(screen.getByText("Categories", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByText("Workspace / Categories")).not.toBeInTheDocument();
    expect(screen.getByTestId("total-categories")).toHaveTextContent("07");
    expect(screen.getByTestId("book-titles")).toHaveTextContent("02");
    expect(screen.getByTestId("empty-categories")).toHaveTextContent("06");
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getAllByText("Empty").length).toBeGreaterThan(0);
    expect(screen.getByText("Showing 1–6 of 7 categories")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("matches the borrow request page spacing and table surfaces", () => {
    renderPage();

    const page = screen.getByRole("heading", { name: "Categories" }).closest("header")?.parentElement;
    const card = screen.getByText("Total categories").closest("article");
    const workspace = screen.getByRole("searchbox", { name: "Search categories" }).closest("section");
    const filterBar = screen.getByRole("searchbox", { name: "Search categories" }).closest("div");
    const headerRow = screen.getByRole("columnheader", { name: "Category" }).closest("tr");
    const categoryRow = screen.getByText("Programming").closest("tr");
    const pagination = screen.getByText("Showing 1–6 of 7 categories").parentElement;

    expect(page).toHaveClass("w-full", "space-y-7", "pb-10");
    expect(page).not.toHaveClass("mx-auto", "max-w-[1180px]");
    expect(card).toHaveClass("rounded-3xl", "border-border/70", "bg-card", "shadow-[var(--glass-shadow)]");
    expect(workspace).toHaveClass("overflow-hidden", "rounded-3xl", "border-border/70", "bg-card");
    expect(filterBar).toHaveClass("border-b", "border-border", "p-5");
    expect(headerRow).toHaveClass("border-border", "bg-muted/60");
    expect(categoryRow).toHaveClass("border-border/60", "bg-card/30");
    expect(pagination).toHaveClass("border-t", "border-border/60", "px-5", "py-4");
  });

  it("uses responsive typography for category controls and table details", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: "Categories" })).toHaveClass("text-2xl", "sm:text-3xl");
    expect(screen.getByRole("searchbox", { name: "Search categories" })).toHaveClass("text-sm", "sm:text-base");
    expect(screen.getByRole("combobox", { name: "Sort categories" })).toHaveClass("text-sm", "sm:text-base");
    expect(screen.getByRole("columnheader", { name: "Category" })).not.toHaveClass("text-[10px]", "uppercase");
  });

  it("pages through categories with the shared table controls", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(screen.queryByText("Supplemental 5")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Supplemental 5")).toBeInTheDocument();
    expect(screen.getByText("Showing 7–7 of 7 categories")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("keeps the table visible and opens connected books in a category drawer", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole("searchbox", { name: "Search categories" }), "prog");
    expect(screen.queryByText("History")).not.toBeInTheDocument();
    const row = screen.getByText("Programming").closest("tr");
    await user.click(within(row!).getByRole("button", { name: "View Programming books" }));
    const drawer = screen.getByRole("dialog", { name: "Programming books" });
    expect(drawer).toHaveAttribute("data-slot", "sheet-content");
    expect(drawer).toHaveClass("!bg-popover", "!text-popover-foreground", "!backdrop-blur-none", "w-full", "sm:max-w-[480px]");
    expect(drawer).not.toHaveClass("!bg-black", "!text-white");
    expect(within(drawer).getByText("Clean Code")).toBeInTheDocument();
    expect(within(drawer).getAllByRole("link", { name: "View book details" })[0]).toHaveAttribute("href", "/book-list?book=b1");
    expect(screen.getByText("All categories")).toBeInTheDocument();
    await user.click(within(drawer).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Programming books" })).not.toBeInTheDocument();
    expect(screen.getByText("All categories")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search categories" })).toHaveValue("prog");
  });

  it("keeps librarian access read-only", () => {
    roleState.role = "librarian";
    renderPage();
    expect(screen.queryByRole("button", { name: "Add category" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Edit/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Delete/ })).not.toBeInTheDocument();
  });

  it("opens the selected category for editing", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Edit Programming" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Edit Programming");
  });

  it("shows a drill-down error when books cannot load", async () => {
    roleState.booksError = true;
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "View Programming books" }));
    const drawer = screen.getByRole("dialog", { name: "Programming books" });
    expect(within(drawer).getByText("Could not load books in this category.")).toBeInTheDocument();
    expect(within(drawer).queryByText("No active books in this category.")).not.toBeInTheDocument();
  });
});
