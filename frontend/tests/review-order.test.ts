import { expect, test } from "vitest";
import { ReviewEntity, sortReviews } from "../src/features/books/models/ReviewEntity";

test("review ordering sorts dates without mutating cached reviews", () => {
  const older = new ReviewEntity({ id: "old", rating: 4, comment: "Older", created_at: "2026-01-01T00:00:00Z" });
  const newer = new ReviewEntity({ id: "new", rating: 5, comment: "Newer", created_at: "2026-10-24T00:00:00Z" });
  const reviews = [older, newer];
  expect(sortReviews(reviews, "newest").map(r => r.id)).toEqual(["new", "old"]);
  expect(sortReviews(reviews, "oldest").map(r => r.id)).toEqual(["old", "new"]);
  expect(reviews.map(r => r.id)).toEqual(["old", "new"]);
  expect(sortReviews([], "newest")).toEqual([]);
});
