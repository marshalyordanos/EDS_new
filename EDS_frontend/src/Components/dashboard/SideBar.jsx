import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Popover } from "antd";
import logomarkWhite from "../../assets/logomark-white.svg";
import fullLogoWhite from "../../assets/full-logo-white.svg";
import UserProfileSection from "./UserProfileSection";
import {
  FiHome,
  FiSearch,
  FiUserPlus,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronsRight,
  FiUpload,
  FiUnlock,
} from "react-icons/fi";
import "../../styles/sidebar.css";
import "../../styles/console.css";

/* A single nav row. `count` renders an inline badge; `alert` tints it amber
   to flag work that is waiting on someone. */
const NavItem = ({ to, icon, label, isExpanded, end, count, alert }) => (
  <NavLink to={to} end={end}>
    {({ isActive }) => (
      <div className={`con-nav-item${isActive ? " active" : ""}`} title={!isExpanded ? label : undefined}>
        <span className="con-nav-icon">{icon}</span>
        <span className="con-nav-text">{label}</span>
        {count != null && (
          <span className={`con-nav-count${alert ? " alert" : ""}`}>{count}</span>
        )}
      </div>
    )}
  </NavLink>
);

const SubNav = ({ items, itemClass = "con-subnav-item" }) => (
  <ul className="con-subnav">
    {items.map((item) => (
      <li key={item.to}>
        <NavLink to={item.to} end={item.end}>
          {({ isActive }) => (
            <span className={`${itemClass}${isActive ? " active" : ""}`}>{item.label}</span>
          )}
        </NavLink>
      </li>
    ))}
  </ul>
);

/* Group heading. Collapsed, the label is replaced by a hairline so the
   grouping still reads without text. */
const GroupLabel = ({ children, isExpanded }) =>
  isExpanded ? <div className="con-nav-label">{children}</div> : <div className="con-nav-rule" />;

const SideBar = ({ isExpanded, setIsExpanded, token }) => {
  const [isRegisterMenuOpen, setRegisterMenuOpen] = useState(false);

  const firstName = localStorage.getItem("userFirstName");
  const lastName = localStorage.getItem("userLastName");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";

  const isAdmin = userRole === "admin";
  const isContentManager = userRole === "content_manager";

  const registerMenuItems = [
    { to: "/dashboard/register/quick-upload", label: "Quick Upload" },
    { to: "/dashboard/register/build-cv", label: "Build CV" },
  ];

  /* Collapsible group: inline sub-nav when expanded, hover popover when not. */
  const CollapsibleGroup = ({ icon, label, items, isOpen, setOpen }) =>
    isExpanded ? (
      <>
        <button onClick={() => setOpen(!isOpen)} className="con-nav-item" style={{ width: "100%" }}>
          <span className="con-nav-icon">{icon}</span>
          <span className="con-nav-text">{label}</span>
          <FiChevronDown
            className="con-nav-chevron"
            style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </button>
        {isOpen && <SubNav items={items} />}
      </>
    ) : (
      <Popover
        placement="rightTop"
        trigger="hover"
        className="custom-popover"
        content={<SubNav items={items} itemClass="con-popover-item" />}
      >
        <div className="con-nav-item" title={label}>
          <span className="con-nav-icon">{icon}</span>
        </div>
      </Popover>
    );

  return (
    <aside
      className={`con-rail${isExpanded ? "" : " collapsed"} transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      {/* ── Brand ── */}
      <div className="con-rail-brand">
        <img
          src={isExpanded ? fullLogoWhite : logomarkWhite}
          alt="AfriDATAi"
          className={`con-rail-logo${isExpanded ? "" : " mark"}`}
        />
        {setIsExpanded && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="con-collapse-btn"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? <FiChevronsLeft size={13} /> : <FiChevronsRight size={13} />}
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="con-rail-nav">
        {/* Overview */}
        {!isContentManager && (
          <ul className="con-nav-group">
            <GroupLabel isExpanded={isExpanded}>Overview</GroupLabel>
            <li>
              <NavItem
                to={isAdmin ? "/dashboard/home" : "/dashboard/company"}
                icon={<FiHome />}
                label="Home"
                isExpanded={isExpanded}
                end
              />
            </li>
            <li>
              <NavItem
                to="/dashboard/search"
                icon={<FiSearch />}
                label="Search"
                isExpanded={isExpanded}
              />
            </li>
            {/* Analytics moved onto the dashboard home pages. */}
          </ul>
        )}

        {/* Register */}
        {!isContentManager && (
          <ul className="con-nav-group">
            <GroupLabel isExpanded={isExpanded}>Register</GroupLabel>
            <li>
              <CollapsibleGroup
                icon={<FiUpload />}
                label="Register"
                items={registerMenuItems}
                isOpen={isRegisterMenuOpen}
                setOpen={setRegisterMenuOpen}
              />
            </li>
          </ul>
        )}

        {/* Administration */}
        {(isAdmin || isContentManager) && (
          <ul className="con-nav-group">
            <GroupLabel isExpanded={isExpanded}>Administration</GroupLabel>
            {isAdmin && (
              <li>
                <NavItem
                  to="/dashboard/users"
                  icon={<FiUsers />}
                  label="Manage Users"
                  isExpanded={isExpanded}
                />
              </li>
            )}
            <li>
              <NavItem
                to="/dashboard/content/blog"
                icon={<FiFileText />}
                label="Blog Posts"
                isExpanded={isExpanded}
              />
            </li>
            <li>
              <NavItem
                to="/dashboard/content/testimonials"
                icon={<FiMessageSquare />}
                label="Testimonials"
                isExpanded={isExpanded}
              />
            </li>
            {isAdmin && (
              <li>
                <NavItem
                  to="/dashboard/access-requests"
                  icon={<FiUnlock />}
                  label="Access Requests"
                  isExpanded={isExpanded}
                />
              </li>
            )}
          </ul>
        )}
      </nav>

      {/* ── User ── */}
      <div className="con-rail-foot">
        <UserProfileSection
          token={token}
          fullName={fullName}
          email={userEmail}
          role={userRole}
          isExpanded={isExpanded}
        />
      </div>
    </aside>
  );
};

export default SideBar;
