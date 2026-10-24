import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "./catalog.css";

export default function CatalogLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isDetails = /^\/books\/[^/]+\/?$/.test(pathname);
  const initials = user?.username.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase() || "U";

  return (
    <div className={`booky ${isDetails ? "booky-detail-shell" : ""}`}>
      <header className="booky-header">
        <Link to="/books" className="booky-brand" aria-label="Booky home">
          <span className="booky-mark"><img src="/catalog/brand.svg" alt="" /></span>
          <span>Booky</span>
        </Link>
        <nav className="booky-nav" aria-label="Main navigation">
          <Link to="/books" aria-current="page">Books</Link>
          <Link to="/my-borrows">My Borrows</Link>
          <button type="button">My Favorites</button>
          <button type="button">About</button>
        </nav>
        <div className="booky-account">
          <button type="button" className="booky-notifications" aria-label="Notifications"><img src="/catalog/bell.svg" alt="" /></button>
          <Link to="/profile" className="booky-profile" aria-label="View your profile">
            <span className="booky-avatar">{user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}</span>
            <span className="booky-identity"><strong>{user?.username || "Reader"}</strong><span>{user?.role || "Student"}</span></span>
          </Link>
        </div>
      </header>
      <main className="booky-content"><Outlet /></main>
      {!isDetails && <footer className="booky-footer"><span>Booky&nbsp; / &nbsp;Your campus library, a little closer.</span><span>Discover. Borrow. Grow.</span></footer>}
    </div>
  );
}
