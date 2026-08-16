import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Drawer } from "antd";
import SideBar from "../Components/dashboard/SideBar";
import ConsoleHeader from "../Components/dashboard/ConsoleHeader";
import "../styles/dashboard.css";
import "../styles/console.css";

/* Pages rebuilt on the console design manage their own padding. */
const CONSOLE_PAGES = [
  "/dashboard/home",
  "/dashboard/search",
  "/dashboard/register/quick-upload",
  "/dashboard/register/build-cv",
  "/dashboard/users",
];

/* Console pages whose path carries a parameter, so they can't be matched by
   the exact list above. Editing a CV uses the same shell as building one. */
const CONSOLE_PAGE_PATTERNS = [
  /^\/dashboard\/experts\/edit\/[^/]+$/,
  /^\/dashboard\/experts\/[^/]+$/,
];

const DashboardLayout = ({ token }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { pathname } = useLocation();

  // Exact match: /dashboard/search is the console workspace, but its
  // legacy children (/search/advanced, /search/results) still want padding.
  const cleanPath = pathname.replace(/\/$/, "");
  const isConsolePage =
    CONSOLE_PAGES.includes(cleanPath) ||
    CONSOLE_PAGE_PATTERNS.some((pattern) => pattern.test(cleanPath));

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "var(--con-ground)",
        color: "var(--con-ink)",
      }}
    >
      <div className="hidden lg:block fixed top-0 left-0 h-full z-20">
        <SideBar
          token={token}
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
        />
      </div>
      <Drawer
        placement="left"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={256}
        className="lg:hidden"
        styles={{
          body: { padding: 0, background: "var(--con-rail)" },
          header: { display: "none" },
        }}
        closeIcon={null}
      >
        <SideBar token={token} isExpanded={true} setIsExpanded={() => setIsDrawerVisible(false)} />
      </Drawer>
      <main
        className={`flex-1 transition-all duration-300
              ${isSidebarExpanded ? "lg:ml-64" : "lg:ml-20"}`}
        style={{
          backgroundColor: "var(--con-ground)",
          minHeight: "100vh",
        }}
      >
        <ConsoleHeader onOpenSidebar={() => setIsDrawerVisible(true)} />

        {/* Console pages own their padding; everything else keeps the
            original 2rem gutter. */}
        <div className={isConsolePage ? "" : "p-8"}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
