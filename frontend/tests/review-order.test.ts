import { test } from "node:test";
import assert from "node:assert/strict";
import { ReviewEntity, sortReviews } from "../src/features/books/models/ReviewEntity.ts";

test("review ordering sorts dates without mutating cached reviews", () => {
  const older = new ReviewEntity({ id: "old", rating: 4, comment: "Older", created_at: "2026-01-01T00:00:00Z" });
  const newer = new ReviewEntity({ id: "new", rating: 5, comment: "Newer", created_at: "2026-10-24T00:00:00Z" });
  const reviews = [older, newer];
  assert.deepEqual(sortReviews(reviews, "newest").map(r => r.id), ["new", "old"]);
  assert.deepEqual(sortReviews(reviews, "oldest").map(r => r.id), ["old", "new"]);
  assert.deepEqual(reviews.map(r => r.id), ["old", "new"]);
  assert.deepEqual(sortReviews([], "newest"), []);
});
