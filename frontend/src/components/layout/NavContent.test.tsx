import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavContent } from "./NavContent";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "admin-1",
      username: "Alex Admin",
      email: "alex@library.test",
      avatar_url: "",
      role: "admin",
      is_active: true,
    },
    logout: vi.fn(),
  }),
  useGetAllUsers: () => ({ data: [] }),
}));

describe("admin sidebar navigation", () => {
  afterEach(cleanup);

  it("renders Users as a direct navigation link without a dropdown menu", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <NavContent />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/users");
    expect(screen.queryByRole("button", { name: /Users menu/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Librarians" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Students" })).not.toBeInTheDocument();
  });
});
