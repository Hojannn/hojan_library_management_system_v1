import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainLayout from "./MainLayout";

const authState = vi.hoisted(() => ({ role: "admin" }));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: authState.role } }),
}));
vi.mock("./Sidebar", () => ({ Sidebar: () => null }));
vi.mock("./MobileHeader", () => ({ MobileHeader: () => null }));

const renderLayout = () => render(
  <MemoryRouter initialEntries={["/books"]}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/books" element={<div>Page content</div>} />
      </Route>
    </Routes>
  </MemoryRouter>,
);

describe("MainLayout footer visibility", () => {
  beforeEach(() => { authState.role = "admin"; });
  afterEach(cleanup);

  it.each(["admin", "librarian"])("hides the footer for %s users", (role) => {
    authState.role = role;
    renderLayout();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("keeps the footer for students", () => {
    authState.role = "student";
    renderLayout();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
