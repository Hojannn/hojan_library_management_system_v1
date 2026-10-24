import { test } from "node:test";
import assert from "node:assert/strict";
import { borrowState, filterBorrows, summarizeBorrows } from "../src/features/borrows/borrow-view.ts";
import type { Borrow } from "../src/features/borrows/types/borrow.types.ts";

const now = new Date("2026-10-24T08:00:00+08:00");
const loan = (id: string, values: Partial<Borrow> = {}): Borrow => ({ id, book_id: id, user_id: "u", book_title: id, status: "BORROWED", borrowed_at: "2026-10-12T00:00:00", due_date: "2026-10-29T00:00:00", returned_at: null, is_overdue: false, ...values });

test("due statuses use Manila calendar days and handle absent dates", () => {
  assert.equal(borrowState(loan("today", { due_date: "2026-10-24T00:00:00" }), now).label, "Due today");
  assert.equal(borrowState(loan("soon", { due_date: "2026-10-26T00:00:00" }), now).label, "Due in 2 days");
  assert.equal(borrowState(loan("late", { due_date: "2026-10-22T00:00:00" }), now).label, "2 days overdue");
  assert.equal(borrowState(loan("none", { due_date: null }), now).kind, "borrowed");
  assert.equal(borrowState(loan("pending", { status: "PENDING_BORROW", due_date: null }), now).kind, "pending");
  assert.equal(borrowState(loan("return", { status: "PENDING_RETURN" }), now).label, "Awaiting return confirmation");
});

test("summary counts held books and excludes rejected requests from returned", () => {
  const active = [loan("a"), loan("b", { due_date: "2026-10-26T00:00:00" }), loan("c", { due_date: "2026-10-20T00:00:00" }), loan("d", { status: "PENDING_BORROW" }), loan("e", { status: "PENDING_RETURN" })];
  assert.deepEqual(summarizeBorrows(active, [loan("r", { status: "RETURNED" }), loan("x", { status: "REJECTED" })], now), { borrowed: 4, soon: 1, overdue: 1, returned: 1 });
});

test("search, status and date sorting preserve cached records and pending requests", () => {
  const records = [loan("Zebra"), loan("Alpha", { due_date: "2026-10-20T00:00:00", author: "Martin" }), loan("Pending", { status: "PENDING_BORROW", due_date: null })];
  const options = { query: "", status: "all", period: "all", sort: "due", history: false };
  assert.deepEqual(filterBorrows(records, options, now).map(b => b.id), ["Alpha", "Zebra", "Pending"]);
  assert.deepEqual(filterBorrows(records, { ...options, query: " martin " }, now).map(b => b.id), ["Alpha"]);
  assert.equal(filterBorrows(records, { ...options, status: "pending" }, now).length, 1);
  assert.deepEqual(records.map(b => b.id), ["Zebra", "Alpha", "Pending"]);
});

test("history periods use return dates and keep rejected requests visible for all time", () => {
  const history = [loan("old", { status: "RETURNED", returned_at: "2026-06-01T00:00:00" }), loan("new", { status: "RETURNED", returned_at: "2026-10-20T00:00:00" }), loan("rejected", { status: "REJECTED", created_at: "2026-10-23T00:00:00" })];
  const options = { query: "", status: "all", period: "month", sort: "returned", history: true };
  assert.deepEqual(filterBorrows(history, options, now).map(b => b.id), ["rejected", "new"]);
  assert.equal(filterBorrows(history, { ...options, period: "all" }, now).length, 3);
});
