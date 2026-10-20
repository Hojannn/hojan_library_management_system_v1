import { describe, expect, it } from "vitest";

import type { Book } from "../types/book.types";
import type { Borrow } from "@/features/borrows/types/borrow.types";
import {
  filterAndSortBooks,
  formatBookDate,
  getBookCirculation,
  getBookSummary,
} from "./bookListView";

const books: Book[] = [
  {
    id: "1", title: "Clean Code", author: "Robert Martin", isbn: "111",
    category_id: "c1", category_name: "Technology", total_copies: 3,
    available_copies: 2, image_url: "", pages: 400, created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "2", title: "Dune", author: "Frank Herbert", isbn: undefined,
    category_id: "c2", category_name: "Fiction", total_copies: 2,
    available_copies: 0, image_url: "", pages: 500, created_at: "2026-02-01T00:00:00Z",
    archived_at: "2026-10-20T03:00:00Z",
  },
];

describe("book list view model", () => {
  it("summarizes active inventory", () => {
    expect(getBookSummary(books)).toEqual({
      totalTitles: 2, totalCopies: 5, availableCopies: 2, unavailableTitles: 1,
    });
  });

  it("searches null-safe metadata and applies filters", () => {
    expect(filterAndSortBooks(books, { search: "111" }).map((book) => book.id)).toEqual(["1"]);
    expect(filterAndSortBooks(books, { search: "dune", category: "c2" }).map((book) => book.id)).toEqual(["2"]);
    expect(filterAndSortBooks(books, { availability: "unavailable" }).map((book) => book.id)).toEqual(["2"]);
    expect(filterAndSortBooks(books, { archiveDate: "2026-10-20" }).map((book) => book.id)).toEqual(["2"]);
  });

  it("sorts without mutating input", () => {
    const original = [...books];
    expect(filterAndSortBooks(books, { sort: "title" }).map((book) => book.title)).toEqual(["Clean Code", "Dune"]);
    expect(filterAndSortBooks(books, { sort: "recent" }).map((book) => book.id)).toEqual(["2", "1"]);
    expect(filterAndSortBooks(books, { sort: "availability" }).map((book) => book.id)).toEqual(["1", "2"]);
    expect(books).toEqual(original);
  });

  it("classifies current circulation", () => {
    const statuses: Borrow["status"][] = [
      "PENDING_BORROW", "READY_FOR_PICKUP", "BORROWED", "OVERDUE",
      "PENDING_RETURN", "RETURNED", "REJECTED",
    ];
    const borrows = statuses.map((status, index) => ({
      id: String(index), user_id: "u", book_id: "1", book_title: "Clean Code",
      book_available_copies: 2, borrowed_at: null, due_date: null,
      approved_at: null, rejection_reason: null, returned_at: null,
      status, is_overdue: status === "OVERDUE",
    }));
    expect(getBookCirculation("1", borrows)).toMatchObject({
      onLoan: 3, reserved: 2, hasBlocking: true, blockingKind: "request",
    });
    expect(getBookCirculation("missing", borrows)).toMatchObject({ onLoan: 0, reserved: 0 });
  });

  it("formats missing and valid dates safely", () => {
    expect(formatBookDate(null)).toBe("—");
    expect(formatBookDate("2026-10-20T00:00:00Z")).toContain("2026");
  });
});
