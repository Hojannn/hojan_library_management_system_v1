import { expect, test } from "vitest";
import { borrowState, filterBorrows, summarizeBorrows } from "../src/features/borrows/borrow-view";
import type { Borrow } from "../src/features/borrows/types/borrow.types";

const now = new Date("2026-10-24T08:00:00+08:00");
const loan = (id: string, values: Partial<Borrow> = {}): Borrow => ({
  id,
  book_id: id,
  user_id: "u",
  book_title: id,
  book_available_copies: 1,
  status: "BORROWED",
  borrowed_at: "2026-10-12T00:00:00",
  due_date: "2026-10-29T00:00:00",
  approved_at: null,
  rejection_reason: null,
  returned_at: null,
  is_overdue: false,
  ...values,
});

test("due statuses use Manila calendar days and handle absent dates", () => {
  expect(borrowState(loan("today", { due_date: "2026-10-24T00:00:00" }), now).label).toBe("Due today");
  expect(borrowState(loan("soon", { due_date: "2026-10-26T00:00:00" }), now).label).toBe("Due in 2 days");
  expect(borrowState(loan("late", { due_date: "2026-10-22T00:00:00" }), now).label).toBe("2 days overdue");
  expect(borrowState(loan("none", { due_date: null }), now).kind).toBe("borrowed");
  expect(borrowState(loan("pending", { status: "PENDING_BORROW", due_date: null }), now).kind).toBe("pending");
  expect(borrowState(loan("ready", { status: "READY_FOR_PICKUP", due_date: null }), now)).toEqual({
    kind: "ready",
    label: "Ready for pickup",
  });
  expect(borrowState(loan("return", { status: "PENDING_RETURN" }), now).label).toBe("Awaiting return confirmation");
});

test("summary counts held books and excludes rejected requests from returned", () => {
  const active = [
    loan("a"),
    loan("b", { due_date: "2026-10-26T00:00:00" }),
    loan("c", { due_date: "2026-10-20T00:00:00" }),
    loan("d", { status: "PENDING_BORROW" }),
    loan("f", { status: "READY_FOR_PICKUP" }),
    loan("e", { status: "PENDING_RETURN" }),
  ];
  expect(summarizeBorrows(active, [loan("r", { status: "RETURNED" }), loan("x", { status: "REJECTED" })], now)).toEqual({
    borrowed: 4,
    soon: 1,
    overdue: 1,
    returned: 1,
  });
});

test("search, status and date sorting preserve cached records and pending requests", () => {
  const records = [
    loan("Zebra"),
    loan("Alpha", { due_date: "2026-10-20T00:00:00", author: "Martin" }),
    loan("Pending", { status: "PENDING_BORROW", due_date: null }),
    loan("Ready", { status: "READY_FOR_PICKUP", due_date: null }),
  ];
  const options = { query: "", status: "all", period: "all", sort: "due", history: false };
  expect(filterBorrows(records, options, now).map(b => b.id)).toEqual(["Alpha", "Zebra", "Pending", "Ready"]);
  expect(filterBorrows(records, { ...options, query: " martin " }, now).map(b => b.id)).toEqual(["Alpha"]);
  expect(filterBorrows(records, { ...options, status: "pending" }, now).length).toBe(1);
  expect(filterBorrows(records, { ...options, status: "ready" }, now).map(b => b.id)).toEqual(["Ready"]);
  expect(records.map(b => b.id)).toEqual(["Zebra", "Alpha", "Pending", "Ready"]);
});

test("history periods use return dates and keep rejected requests visible for all time", () => {
  const history = [
    loan("old", { status: "RETURNED", returned_at: "2026-06-01T00:00:00" }),
    loan("new", { status: "RETURNED", returned_at: "2026-10-20T00:00:00" }),
    loan("rejected", { status: "REJECTED", created_at: "2026-10-23T00:00:00" }),
  ];
  const options = { query: "", status: "all", period: "month", sort: "returned", history: true };
  expect(filterBorrows(history, options, now).map(b => b.id)).toEqual(["rejected", "new"]);
  expect(filterBorrows(history, { ...options, period: "all" }, now).length).toBe(3);
});
