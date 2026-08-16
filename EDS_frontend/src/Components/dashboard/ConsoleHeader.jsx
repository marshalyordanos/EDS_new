import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiSearch,
  FiChevronRight,
  FiBell,
  FiSun,
  FiMoon,
  FiUpload,
  FiPlus,
  FiMenu,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/console.css";

/* Route → breadcrumb label. Longest match wins, so nested routes resolve
   to their own label rather than their parent's. */
const CRUMBS = [
  ["/dashboard/home", "Home"],
  ["/dashboard/company", "Home"],
  ["/dashboard/search", "Search"],
  ["/dashboard/my-analytics", "My Analytics"],
  ["/dashboard/analytics", "System Analytics"],
  ["/dashboard/all", "All Experts"],
  ["/dashboard/experts/this-week", "This Week"],
  ["/dashboard/experts/this-month", "This Month"],
  ["/dashboard/experts/outdated-cvs", "Outdated CVs"],
  ["/dashboard/register/quick-upload", "Quick Upload"],
  ["/dashboard/register/build-cv", "Build CV"],
  ["/dashboard/users", "Manage Users"],
  ["/dashboard/CreateAdmin", "Create Admin"],
  ["/dashboard/content/blog", "Blog Posts"],
  ["/dashboard/content/testimonials", "Testimonials"],
];

const crumbFor = (pathname) => {
  const hit = CRUMBS.filter(([path]) => pathname.startsWith(path)).sort(
    (a, b) => b[0].length - a[0].length
  )[0];
  return hit ? hit[1] : "Dashboard";
};

const ConsoleHeader = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, cycleTheme } = useTheme();

  const goToSearch = () => navigate("/dashboard/search");

  // ⌘K / Ctrl+K opens search from anywhere in the console.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        navigate("/dashboard/search");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  const isAdmin = localStorage.getItem("userRole") === "admin";

  return (
    <header className="con-topbar">
      <button
        className="con-icon-btn lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Open sidebar"
      >
        <FiMenu size={16} />
      </button>

      <div className="con-crumb">
        <span>Dashboard</span>
        <FiChevronRight size={12} />
        <b>{crumbFor(pathname)}</b>
      </div>

      <button className="con-omni" onClick={goToSearch} aria-label="Search experts">
        <FiSearch size={15} />
        <span className="con-omni-text">Search experts, skills, or sectors</span>
        <span className="con-kbd">⌘K</span>
      </button>

      <div className="con-topbar-actions">
        <button
          className="con-icon-btn"
          onClick={cycleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <FiMoon size={16} /> : <FiSun size={16} />}
        </button>

        <button className="con-icon-btn" aria-label="Notifications">
          <FiBell size={16} />
          <span className="con-pip" />
        </button>

        {isAdmin && (
          <button
            className="con-btn con-btn-quiet hidden sm:inline-flex"
            onClick={() => navigate("/dashboard/register/quick-upload")}
          >
            <FiUpload size={14} />
            Import CVs
          </button>
        )}

        <button
          className="con-btn con-btn-primary"
          onClick={() => navigate("/dashboard/register/build-cv")}
        >
          <FiPlus size={14} />
          Add Expert
        </button>
      </div>
    </header>
  );
};

export default ConsoleHeader;
