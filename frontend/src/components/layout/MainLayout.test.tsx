import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainLayout from "./MainLayout";

const authState = vi.hoisted(() => ({ role: "admin", username: "Alex Reader" }));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: authState.role, username: authState.username } }),
}));
vi.mock("./Sidebar", () => ({ Sidebar: () => null }));
vi.mock("./MobileHeader", () => ({ MobileHeader: () => null }));

const renderLayout = (initialPath = "/profile") => render(
  <MemoryRouter initialEntries={[initialPath]}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/profile" element={<div>Profile content</div>} />
        <Route path="/books" element={<div>Catalog content</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe("MainLayout footer visibility", () => {
  beforeEach(() => {
    authState.role = "admin";
    authState.username = "Alex Reader";
  });
  afterEach(cleanup);

  it.each(["admin", "librarian"])("hides the footer for %s users", (role) => {
    authState.role = role;
    renderLayout("/profile");
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("keeps the footer for students on non-catalog routes", () => {
    authState.role = "student";
    renderLayout("/profile");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders CatalogLayout on catalog routes", () => {
    authState.role = "student";
    renderLayout("/books");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText("Catalog content")).toBeInTheDocument();
  });
});
