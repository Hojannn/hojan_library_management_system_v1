import type { Borrow } from "@/features/borrows/types/borrow.types";
import type { User, UserRole } from "../types/auth.types";

export type UserRoleFilter = "all" | UserRole;
export type UserStatusFilter = "all" | "active" | "inactive";
export type UserSort = "newest" | "oldest" | "name";

interface UserFilters {
  search: string;
  role: UserRoleFilter;
  status: UserStatusFilter;
  sort: UserSort;
}

const activeLoanStatuses = new Set<Borrow["status"]>([
  "READY_FOR_PICKUP",
  "BORROWED",
  "PENDING_RETURN",
  "OVERDUE",
]);

export function getUserSummary(users: User[]) {
  return {
    totalUsers: users.length,
    students: users.filter((user) => user.role === "student").length,
    staffAccounts: users.filter((user) => user.role === "librarian" || user.role === "admin").length,
    inactiveAccounts: users.filter((user) => !user.is_active).length,
  };
}

export function getActiveLoansForUser(userId: string, borrows: Borrow[]) {
  return borrows.filter(
    (borrow) => String(borrow.user_id) === String(userId) && activeLoanStatuses.has(borrow.status),
  );
}

export function filterAndSortUsers(users: User[], filters: UserFilters) {
  const search = filters.search.trim().toLowerCase();
  return users
    .filter((user) => !search || user.username.toLowerCase().includes(search) || user.email.toLowerCase().includes(search))
    .filter((user) => filters.role === "all" || user.role === filters.role)
    .filter((user) => {
      if (filters.status === "all") return true;
      return filters.status === "active" ? Boolean(user.is_active) : !user.is_active;
    })
    .sort((left, right) => {
      if (filters.sort === "name") return left.username.localeCompare(right.username);
      const leftTime = left.created_at ? new Date(left.created_at).getTime() : 0;
      const rightTime = right.created_at ? new Date(right.created_at).getTime() : 0;
      return filters.sort === "oldest" ? leftTime - rightTime : rightTime - leftTime;
    });
}
