import { describe, expect, it } from "vitest";
import { filterAndSortCategories, getCategorySummary } from "./categoryWorkspace";

const categories = [
  { id: "1", name: "Programming", book_count: 3 },
  { id: "2", name: "Design", book_count: 2 },
  { id: "3", name: "History", book_count: 0 },
];

describe("category workspace", () => {
  it("calculates category, title, and empty-category totals", () => {
    expect(getCategorySummary(categories)).toEqual({
      totalCategories: 3,
      bookTitles: 5,
      emptyCategories: 1,
    });
  });

  it("filters case-insensitively and supports every sort", () => {
    expect(filterAndSortCategories(categories, "PROG", "name-asc").map((item) => item.name)).toEqual(["Programming"]);
    expect(filterAndSortCategories(categories, "", "name-desc").map((item) => item.name)).toEqual(["Programming", "History", "Design"]);
    expect(filterAndSortCategories(categories, "", "most-books").map((item) => item.name)).toEqual(["Programming", "Design", "History"]);
  });

  it("handles missing counts and empty inputs", () => {
    expect(getCategorySummary([])).toEqual({ totalCategories: 0, bookTitles: 0, emptyCategories: 0 });
    expect(getCategorySummary([{ id: "1", name: "Other" }])).toEqual({ totalCategories: 1, bookTitles: 0, emptyCategories: 1 });
  });
});
