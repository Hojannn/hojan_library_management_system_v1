import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { Book } from "../../types/book.types";
import BookArchiveDialog from "./BookArchiveDialog";
import BookFormModal from "./BookFormModal";
import BookRestoreDialog from "./BookRestoreDialog";

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
vi.mock("@/hooks/useBooks", () => ({
  useCreateBooks: () => ({ mutate: mocks.create, isPending: false }),
  useUpdateBooks: () => ({ mutate: mocks.update, isPending: false }),
}));
vi.mock("@/hooks/useCategories", () => ({ useCategories: () => ({ data: [], isLoading: false }) }));

const book: Book = { id: "book-1", title: "Clean Code", author: "Robert C. Martin", category_id: "", total_copies: 3, available_copies: 2, image_url: "", pages: 464 };

describe("book management workflow", () => {
  it("opens the add drawer and validates required fields", async () => {
    const user = userEvent.setup();
    render(<BookFormModal isOpen onClose={vi.fn()} book={null} />);
    expect(screen.getByRole("dialog", { name: "Add a new book" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add book" }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Author is required")).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("shows eligible and blocked archive states", async () => {
    const user = userEvent.setup();
    const confirm = vi.fn();
    const { rerender } = render(<MemoryRouter><BookArchiveDialog open book={book} circulation={{ onLoan: 0, reserved: 0, records: [], hasBlocking: false, blockingKind: null }} isPending={false} onOpenChange={vi.fn()} onConfirm={confirm} /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: "Archive book" }));
    expect(confirm).toHaveBeenCalledWith(book);

    rerender(<MemoryRouter><BookArchiveDialog open book={book} circulation={{ onLoan: 0, reserved: 1, records: [], hasBlocking: true, blockingKind: "request" }} isPending={false} onOpenChange={vi.fn()} onConfirm={confirm} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Book cannot be archived" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review borrow requests" })).toHaveAttribute("href", "/borrow-requests/pending");
  });

  it("confirms restore and guards duplicate submission", async () => {
    const confirm = vi.fn();
    const user = userEvent.setup();
    render(<BookRestoreDialog open book={book} isPending onOpenChange={vi.fn()} onConfirm={confirm} />);
    const button = screen.getByRole("button", { name: "Restoring…" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(confirm).not.toHaveBeenCalled();
  });
});
