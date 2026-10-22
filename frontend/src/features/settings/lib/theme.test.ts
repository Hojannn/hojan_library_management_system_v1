import { beforeEach, describe, expect, it } from "vitest";

import { applyTheme, getStoredTheme, initializeTheme } from "./theme";

describe("theme preferences", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("stores and applies the selected theme", () => {
    applyTheme("dark");

    expect(localStorage.getItem("booky-theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");

    applyTheme("light");

    expect(localStorage.getItem("booky-theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("uses light when no valid preference has been stored", () => {
    localStorage.setItem("booky-theme", "system");

    expect(getStoredTheme()).toBe("light");
    expect(initializeTheme()).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("restores a valid stored preference", () => {
    localStorage.setItem("booky-theme", "dark");

    expect(initializeTheme()).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
  });
});
