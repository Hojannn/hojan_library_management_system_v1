import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationsModal from "./NotificationsModal";
import "./catalog.css";

export default function CatalogLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isBooks = /^\/books(?:\/[^/]+)?\/?$/.test(pathname);
  const isDetails = /^\/books\/[^/]+\/?$/.test(pathname);
  const isBorrows = /^\/my-borrows\/?$/.test(pathname);
  const isFavorites = /^\/my-favorites\/?$/.test(pathname);
  const isAbout = /^\/about\/?$/.test(pathname);
  const isProfile = /^\/profile\/?$/.test(pathname);
  const initials =
    user?.username
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const handleLogout = async () => {
    await logout?.();
    navigate("/login");
  };

  return (
    <div
      className={`booky ${isDetails ? "booky-detail-shell" : ""} ${isBorrows ? "booky-borrows-shell" : ""} ${isFavorites ? "booky-favorites-shell" : ""} ${isAbout ? "booky-about-shell" : ""} ${isProfile ? "booky-profile-shell" : ""}`}
    >
      <header className="booky-header">
        <Link to="/books" className="booky-brand" aria-label="Booky home">
          <span className="booky-mark">
            <img src="/catalog/brand.svg" alt="" />
          </span>
          <span>Booky</span>
        </Link>
        <nav className="booky-nav" aria-label="Main navigation">
          <Link to="/books" aria-current={isBooks ? "page" : undefined}>
            Books
          </Link>
          <Link to="/my-borrows" aria-current={isBorrows ? "page" : undefined}>
            My Borrows
          </Link>
          <Link to="/my-favorites" aria-current={isFavorites ? "page" : undefined}>
            My Favorites
          </Link>
          <Link to="/about" aria-current={isAbout ? "page" : undefined}>
            About
          </Link>
        </nav>
        <div className="booky-account">
          <NotificationsModal />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="booky-profile" aria-label="Account menu">
              <span className="booky-avatar">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
              </span>
              <span className="booky-identity">
                <strong>{user?.username || "Reader"}</strong>
                <span>{user?.role || "Student"}</span>
              </span>
              <ChevronDown className="booky-profile-chevron" size={16} aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="booky-profile-menu">
              <DropdownMenuLabel className="booky-profile-menu-label">
                <strong>{user?.username || "Reader"}</strong>
                <span>{user?.email || (user?.role ?? "Student")}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="booky-profile-menu-item"
                onClick={() => navigate("/profile")}
              >
                <Settings size={16} aria-hidden="true" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="booky-profile-menu-item"
                onClick={() => void handleLogout()}
              >
                <LogOut size={16} aria-hidden="true" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="booky-content">
        <Outlet />
      </main>
      {!isDetails && !isBorrows && !isFavorites && !isAbout && !isProfile && (
        <footer className="booky-footer">
          <span>Booky&nbsp; / &nbsp;Your campus library, a little closer.</span>
          <span>Discover. Borrow. Grow.</span>
        </footer>
      )}
    </div>
  );
}
