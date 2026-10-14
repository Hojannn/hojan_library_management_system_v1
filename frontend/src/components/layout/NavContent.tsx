import { useAuth } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import {
  BookmarkCheck,
  BookmarkIcon,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  User
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface NavContentProps {
  collapsed?: boolean;
  onItemClick?: () => void; // Used to auto-close mobile drawer on link selection
  onToggle?: () => void;
}

interface NavChild {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  children?: NavChild[];
}

export const NavContent: React.FC<NavContentProps> = ({ collapsed = false, onItemClick, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // null = follow the active route; otherwise the user's explicit toggle
  const [submenuOpenOverride, setSubmenuOpenOverride] = useState<boolean | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Define navigation items directly per role
  const getNavItems = (): NavItem[] => {
    if (user?.role === "student") {
      return [
        { label: "Books", path: "/books", icon: BookOpen },
        { label: "My Borrows", path: "/my-borrows", icon: BookmarkCheck },
      ];
    }

    if (user?.role === "admin" || user?.role === "librarian") {
      return [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        {
          label: "Borrow Requests",
          path: "/all-borrows",
          icon: BookmarkIcon,
          children: [
            { label: "Waiting/Pending", path: "/all-borrows/pending" },
            { label: "Active", path: "/all-borrows/active" },
            { label: "Overdue", path: "/all-borrows/overdue" },
            { label: "Returned", path: "/all-borrows/returned" },
            { label: "Rejected", path: "/all-borrows/rejected" },
          ],
        },
        { label: "Users", path: "/users", icon: User },
        { label: "Books List", path: "/book-list", icon: BookOpen },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  // Submenu is open when the user toggled it open, or when a borrow-request route is active
  const isSubmenuOpen = submenuOpenOverride ?? location.pathname.startsWith("/all-borrows");

  return (
    <div className="flex flex-col h-full">
      {/* Brand / Logo Header */}
      <div
        className={cn(
          "flex h-16 items-center justify-between border-b border-sidebar-border shrink-0",
          collapsed ? "px-3" : "px-4"
        )}
      >
        <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "mx-auto")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <BookOpen className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg whitespace-nowrap tracking-tight text-sidebar-foreground">
              Library System
            </span>
          )}
        </div>
        {onToggle && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="shrink-0 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}
      </div>

      {/* Expand control when collapsed */}
      {onToggle && collapsed && (
        <div className="p-2 border-b border-sidebar-border">
          <Button
            variant="ghost"
            onClick={onToggle}
            className="w-full h-8 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}

      {/* Links */}
      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children && !collapsed;

          if (hasChildren) {
            return (
              <div key={item.path}>
                <div className="relative">
                  <NavLink
                    to={item.path}
                    onClick={onItemClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset pr-9",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => setSubmenuOpenOverride(!isSubmenuOpen)}
                    aria-label={isSubmenuOpen ? `Collapse ${item.label} menu` : `Expand ${item.label} menu`}
                    aria-expanded={isSubmenuOpen}
                    className="absolute inset-y-0 right-1 my-auto flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform duration-200", isSubmenuOpen && "rotate-180")}
                    />
                  </button>
                </div>

                {isSubmenuOpen && (
                  <ul className="mt-1 ml-3 space-y-1 border-l border-sidebar-border pl-3">
                    {item.children?.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          to={child.path}
                          onClick={onItemClick}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset",
                              isActive
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center px-0"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info and Logout */}
      <div className="border-t border-sidebar-border p-3 space-y-2 mt-auto">
        {!collapsed && user && (
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.avatar_url} alt={user.username} />
              <AvatarFallback className="bg-leather/20 text-leather font-medium text-xs">
                {user.username?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.username}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </NavLink>
        )}

        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full h-10 justify-start gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Logout" : undefined}
          aria-label="Logout"
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};
