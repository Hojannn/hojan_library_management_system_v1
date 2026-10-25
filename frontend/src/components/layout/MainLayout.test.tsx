import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MainLayout from "./MainLayout";
import type { Borrow } from "@/features/borrows/types/borrow.types";

const authState = vi.hoisted(() => ({
  role: "admin",
  username: "Alex Reader",
  logout: vi.fn(),
  activeBorrows: [] as Borrow[],
  historyBorrows: [] as Borrow[],
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", role: authState.role, username: authState.username },
    logout: authState.logout,
  }),
}));
vi.mock("@/hooks/useBorrows", () => ({
  useBorrows: () => ({ data: authState.activeBorrows, isLoading: false, isError: false }),
  useBorrowHistory: () => ({ data: authState.historyBorrows, isLoading: false, isError: false }),
}));
vi.mock("./Sidebar", () => ({ Sidebar: () => null }));
vi.mock("./MobileHeader", () => ({ MobileHeader: () => null }));

const renderLayout = (initialPath = "/profile") =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<div>Profile content</div>} />
          <Route path="/books" element={<div>Catalog content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("MainLayout footer visibility", () => {
  beforeEach(() => {
    authState.role = "admin";
    authState.username = "Alex Reader";
    authState.activeBorrows = [];
    authState.historyBorrows = [];
    authState.logout.mockReset();
    localStorage.clear();
  });
  afterEach(cleanup);

  it.each(["admin", "librarian"])("hides the footer for %s users", (role) => {
    authState.role = role;
    renderLayout("/profile");
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("renders CatalogLayout for students on profile/settings route", () => {
    authState.role = "student";
    renderLayout("/profile");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText("Profile content")).toBeInTheDocument();
  });

  it("renders CatalogLayout on catalog routes", () => {
    authState.role = "student";
    renderLayout("/books");
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByText("Catalog content")).toBeInTheDocument();
  });

  it("opens profile dropdown with Settings and Logout in CatalogLayout", async () => {
    authState.role = "student";
    renderLayout("/books");
    fireEvent.click(screen.getByRole("button", { name: "Account menu" }));
    expect(await screen.findByRole("menuitem", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Logout" })).toBeInTheDocument();
  });

  it("shows unread notification indicator and opens notifications modal", async () => {
    authState.role = "student";
    authState.activeBorrows = [
      {
        id: "b-1",
        user_id: "user-1",
        book_id: "book-1",
        book_title: "Design Patterns",
        book_available_copies: 1,
        borrowed_at: null,
        due_date: null,
        approved_at: "2026-10-25T08:00:00Z",
        rejection_reason: null,
        returned_at: null,
        status: "READY_FOR_PICKUP",
        is_overdue: false,
      },
    ];
    renderLayout("/books");

    const bellButton = screen.getByRole("button", { name: "Notifications (1 unread)" });
    expect(bellButton).toBeInTheDocument();

    fireEvent.click(bellButton);
    expect(await screen.findByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByText("Ready for pickup")).toBeInTheDocument();
    expect(screen.getByText(/Design Patterns/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Mark all read/i }));
    expect(screen.queryByText("1 new")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });
});
