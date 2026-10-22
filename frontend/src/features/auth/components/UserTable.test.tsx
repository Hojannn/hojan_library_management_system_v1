import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserTable from "./UserTable";

const updateRole = vi.fn();
const updateStatus = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "admin-1", username: "Alex Admin", email: "alex@test.dev", role: "admin", avatar_url: "", is_active: true } }),
  useGetAllUsers: () => ({ data: [
    { id: "admin-1", username: "Alex Admin", email: "alex@test.dev", role: "admin", avatar_url: "", is_active: true, created_at: "2026-10-20T00:00:00Z" },
    { id: "student-1", username: "Bianca Student", email: "bianca@test.dev", role: "student", student: null, avatar_url: "", is_active: true, created_at: "2026-10-19T00:00:00Z" },
    { id: "librarian-1", username: "Carlo Librarian", email: "carlo@test.dev", role: "librarian", avatar_url: "", is_active: false, created_at: "2026-10-18T00:00:00Z" },
  ], isLoading: false, isError: false }),
  useUpdateUserRole: () => ({ mutate: updateRole, isPending: false }),
  useUpdateUserActiveStatus: () => ({ mutate: updateStatus, isPending: false }),
}));

vi.mock("@/hooks/useBorrows", () => ({
  useAdminBorrows: () => ({ data: [{
    id: "borrow-1", user_id: "student-1", book_id: "book-1", book_title: "The Midnight Library",
    book_available_copies: 1, borrowed_at: "2026-10-01T00:00:00Z", due_date: "2026-10-15T00:00:00Z",
    approved_at: "2026-10-01T00:00:00Z", rejection_reason: null, returned_at: null,
    status: "OVERDUE", is_overdue: true,
  }], isLoading: false, isError: false }),
}));

describe("admin users workspace", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => cleanup());

  it("shows Figma summary cards and marks the signed-in user", () => {
    render(<UserTable />);
    expect(screen.getByRole("heading", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByText("Alex Admin · You")).toBeInTheDocument();
    expect(screen.getByText("Total users").parentElement).toHaveTextContent("3");
    expect(screen.getAllByText("Students")[0].parentElement).toHaveTextContent("1");
    expect(screen.getByText("Staff accounts").parentElement).toHaveTextContent("2");
    expect(screen.getByText("Inactive account").parentElement).toHaveTextContent("1");
  });

  it("opens a profile drawer with loans and account actions", async () => {
    const user = userEvent.setup();
    render(<UserTable />);
    await user.click(screen.getByRole("button", { name: "View Bianca Student details" }));
    expect(screen.getByRole("heading", { name: "User profile" })).toBeInTheDocument();
    expect(screen.getByText("The Midnight Library")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change role" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivate account" })).toBeInTheDocument();
  });

  it("does not expose account actions for the signed-in admin", async () => {
    const user = userEvent.setup();
    render(<UserTable />);
    await user.click(screen.getByRole("button", { name: "View Alex Admin details" }));
    expect(screen.getByText("This is your signed-in account.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Change role" })).not.toBeInTheDocument();
  });
});
