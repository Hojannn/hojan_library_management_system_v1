import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface FooterProps {
  libraryName?: string;
  className?: string;
}

export const Footer = ({
  libraryName = "Library Management System",
  className,
}: FooterProps) => {
  const year = new Date().getFullYear();
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "librarian";
  const links = isStaff
    ? [
        { label: "Dashboard", to: "/dashboard" },
        { label: "Books List", to: "/book-list" },
        { label: "Borrow Requests", to: "/all-borrows" },
        { label: "Users", to: "/users" },
      ]
    : [];

  return (
    <footer
      className={cn(
        "shrink-0 border-t border-border bg-secondary px-4 py-3 md:px-6",
        className
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-8">
        <div className="max-w-sm space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold">{libraryName}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Discover books, manage borrowing, and keep your library connected.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="space-y-3">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:max-w-xs">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-6 border-t border-border pt-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          © {year} {libraryName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
