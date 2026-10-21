import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import CategoriesPage from "./CategoriesPage";

const roleState = vi.hoisted(() => ({ role: "admin", booksError: false }));
const categories = [
  { id: "programming", name: "Programming", book_count: 2 },
  { id: "history", name: "History", book_count: 0 },
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
    expect(screen.getByTestId("total-categories")).toHaveTextContent("02");
    expect(screen.getByTestId("book-titles")).toHaveTextContent("02");
    expect(screen.getByTestId("empty-categories")).toHaveTextContent("01");
    expect(screen.getByText("Programming")).toBeInTheDocument();
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("searches and drills into books in a category", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByRole("searchbox", { name: "Search categories" }), "prog");
    expect(screen.queryByText("History")).not.toBeInTheDocument();
    const row = screen.getByText("Programming").closest("tr");
    await user.click(within(row!).getByRole("button", { name: "View Programming books" }));
    expect(screen.getByRole("heading", { name: "Programming books" })).toBeInTheDocument();
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View book details" })[0]).toHaveAttribute("href", "/book-list?book=b1");
    await user.click(screen.getByRole("button", { name: "Back to categories" }));
    expect(screen.getByText("All categories")).toBeInTheDocument();
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
    expect(screen.getByText("Could not load books in this category.")).toBeInTheDocument();
    expect(screen.queryByText("No active books in this category.")).not.toBeInTheDocument();
  });
});
