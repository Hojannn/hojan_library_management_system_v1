import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { Footer } from "./Footer";
import { useAuth } from "@/hooks/useAuth";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isStaff = user?.role === "admin" || user?.role === "librarian";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Top Header with Hamburger Sheet */}
      <MobileHeader />

      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className={isDashboard ? "flex-1 p-4 md:p-8" : "flex-1 p-4 md:p-6"}>
          <Outlet />
        </main>
        {!isStaff && <Footer />}
      </div>
    </div>
  );
};

export default MainLayout;
