import { NavLink } from "react-router-dom";
import { useState } from "react";
import logomarkWhite from "../../assets/logomark-white.svg";
import fullLogoWhite from "../../assets/full-logo-white.svg";
import { Popover } from "antd";
import UserProfileSection from "./UserProfileSection";
import {
  FiHome,
  FiSearch,
  FiDatabase,
  FiUserPlus,
  FiUsers,
  FiFileText,
  FiMessageSquare,
  FiChevronDown,
  FiChevronsLeft,
  FiChevronRight,
  FiChevronsRight,
  FiBarChart2,
} from "react-icons/fi";

const SubMenu = ({ items, getNavLinkClass }) => (
  <ul className="space-y-1">
    {items.map((item) => (
      <li key={item.to}>
        <NavLink to={item.to} end={item.end}>
          {({ isActive }) => {
            const linkProps = getNavLinkClass({ isActive });
            return (
              <div
                className={`${linkProps.className} w-full `}
                style={linkProps.style}
              >
                {item.label}
              </div>
            );
          }}
        </NavLink>
      </li>
    ))}
  </ul>
);
const SideBar = ({ isExpanded, setIsExpanded, token }) => {
  const fullLogoSrc = fullLogoWhite;
  const logomarkSrc = logomarkWhite;
  const databaseMenuItems = [
    { to: "/dashboard/all", label: "All Experts", end: true },
    { to: "/dashboard/experts/this-week", label: "This Week" },
    { to: "/dashboard/experts/this-month", label: "This Month" },
  ];
  const registerMenuItems = [
    { to: "/dashboard/register/quick-upload", label: "Quick Upload" },
    { to: "/dashboard/register/build-cv", label: "Build CV" },
  ];
  const [isDatabaseMenuOpen, setDatabaseMenuOpen] = useState(false);
  const [isRegisterMenuOpen, setRegisterMenuOpen] = useState(false);
  const firstName = localStorage.getItem("userFirstName");
  const lastName = localStorage.getItem("userLastName");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";

  const getNavLinkClass = ({ isActive }) => {
    const commonClasses = "flex items-center justify-between p-3 rounded-lg";

    if (isActive) {
      return {
        className: `${commonClasses} font-semibold text-white`,
        style: {
          backgroundColor: "var(--color-primary)",
        },
      };
    } else {
      return {
        className: `${commonClasses} text-[var(--theme-text-muted)] hover:bg-white/10`,
      };
    }
  };

  const getSubMenuNavLinkClass = ({ isActive }) => {
    const commonClasses =
      "flex items-center justify-between p-2 rounded-lg text-base";
    if (isActive) {
      return {
        className: `${commonClasses} font-semibold text-white`,
        style: {
          backgroundColor: "var(--color-primary)",
        },
      };
    } else {
      return {
        className: `${commonClasses} text-[var(--theme-text-muted)] hover:bg-white/10`,
      };
    }
  };

  const getPopoverSubMenuNavLinkClass = ({ isActive }) => {
    const commonClasses =
      "flex items-center justify-between p-2 rounded-lg text-base";
    if (isActive) {
      return {
        className: `${commonClasses} font-semibold  text-white`,
        style: {
          backgroundColor: "var(--color-primary)",
        },
      };
    } else {
      return {
        className: `${commonClasses} text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)]`,
      };
    }
  };

  return (
    <aside
      className={`custom-sidebar h-full p-6 flex flex-col shadow-lg transition-all duration-300 ${
        isExpanded ? "w-64" : "w-24"
      }`}
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--theme-border-light)",
      }}
    >
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center justify-center">
          {isExpanded ? (
            <img
              src={fullLogoSrc}
              alt="AfriDATAi"
              className="h-12 w-auto transition-all duration-300"
            />
          ) : (
            <img
              src={logomarkSrc}
              alt="AfriDATAi"
              className="h-12 w-12 transition-all duration-300"
            />
          )}
        </div>
        <button
          onClick={() => setIsExpanded && setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg hover:bg-white/20"
        >
          {isExpanded ? (
            <FiChevronsLeft className="text-[var(--theme-text-muted)]" />
          ) : (
            <FiChevronsRight className="text-[var(--theme-text-muted)]" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow overflow-y-auto">
        <ul className="space-y-2">
          {/* Menu Item: Home — admin and company only */}
          {userRole !== "content_manager" && (
            <li>
              <NavLink
                to={
                  userRole === "admin"
                    ? "/dashboard/home"
                    : "/dashboard/company"
                }
              >
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiHome className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden text-lg font-semibold transition-all ${!isExpanded && "w-0"}`}
                      >
                        Home
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* Menu Item: Search — admin and company only */}
          {userRole !== "content_manager" && (
            <li>
              <NavLink to="/dashboard/search">
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiSearch className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden font-semibold text-lg transition-all ${!isExpanded && "w-0"}`}
                      >
                        Search
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* Menu Item: My Analytics — admin and company only */}
          {userRole !== "content_manager" && (
            <li>
              <NavLink to="/dashboard/my-analytics">
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiBarChart2 className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden font-semibold text-lg transition-all ${!isExpanded && "w-0"}`}
                      >
                        My Analytics
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* System Analytics - Only for System Admins */}
          {userRole === "admin" && (
            <li>
              <NavLink to="/dashboard/analytics">
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiBarChart2 className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden font-semibold 
                          text-lg transition-all ${!isExpanded && "w-0"}`}
                      >
                        Full System Analytics
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* Menu Item: Create User — admin only */}
          {userRole === "admin" && (
            <li>
              <NavLink to="/dashboard/CreateAdmin">
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiUsers className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden font-semibold text-lg transition-all ${!isExpanded && "w-0"}`}
                      >
                        Create User
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* Blog Posts — content_manager and admin */}
          {(userRole === "admin" || userRole === "content_manager") && (
            <li>
              <NavLink to="/dashboard/content/blog">
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiFileText className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden font-semibold text-lg transition-all ${!isExpanded && "w-0"}`}
                      >
                        Blog Posts
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* Testimonials — content_manager and admin */}
          {(userRole === "admin" || userRole === "content_manager") && (
            <li>
              <NavLink to="/dashboard/content/testimonials">
                {({ isActive }) => (
                  <div {...getNavLinkClass({ isActive })}>
                    <div className="flex items-center">
                      <FiMessageSquare className="mr-3 text-2xl" />
                      <span
                        className={`overflow-hidden font-semibold text-lg transition-all ${!isExpanded && "w-0"}`}
                      >
                        Testimonials
                      </span>
                    </div>
                  </div>
                )}
              </NavLink>
            </li>
          )}

          {/* --- MANAGE DATABASE SECTION --- Only for System Admins */}
          {userRole === "admin" && (
            <li>
              {isExpanded ? (
                <>
                  <button
                    onClick={() => setDatabaseMenuOpen(!isDatabaseMenuOpen)}
                    className="w-full flex items-center justify-between p-3 text-[var(--theme-text-muted)] rounded-lg hover:bg-white/10 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <FiDatabase className="mr-2  text-2xl text-[var(--theme-text-muted)]" />
                      <span className="font-semibold text-lg text-[var(--theme-text-muted)]">
                        Manage Database
                      </span>
                    </div>
                    {isDatabaseMenuOpen ? (
                      <FiChevronDown className="text-[var(--theme-text-muted)]" />
                    ) : (
                      <FiChevronRight className="text-[var(--theme-text-muted)]" />
                    )}
                  </button>
                  {isDatabaseMenuOpen && (
                    <div className="pl-6 mt-1">
                      <SubMenu
                        items={databaseMenuItems}
                        getNavLinkClass={getSubMenuNavLinkClass}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Popover
                  placement="rightTop"
                  trigger="hover"
                  className="custom-popover"
                  content={
                    <SubMenu
                      items={databaseMenuItems}
                      getNavLinkClass={getPopoverSubMenuNavLinkClass}
                    />
                  }
                >
                  <div {...getNavLinkClass({ isActive: false })}>
                    <FiDatabase className="text-2xl" />
                  </div>
                </Popover>
              )}
            </li>
          )}

          {/* Menu Item: Register — admin and company only */}
          {userRole !== "content_manager" && (
            <li>
              {isExpanded ? (
                <>
                  <button
                    onClick={() => setRegisterMenuOpen(!isRegisterMenuOpen)}
                    className="w-full flex items-center justify-between p-3 text-[var(--theme-text-muted)] rounded-lg hover:bg-white/10 focus:outline-none"
                  >
                    <div className="flex items-center">
                      <FiUserPlus className="mr-3 text-2xl text-[var(--theme-text-muted)]" />
                      <span className="font-semibold text-lg text-[var(--theme-text-muted)]">
                        Register
                      </span>
                    </div>
                    {isRegisterMenuOpen ? (
                      <FiChevronDown className="text-[var(--theme-text-muted)]" />
                    ) : (
                      <FiChevronRight className="text-[var(--theme-text-muted)]" />
                    )}
                  </button>
                  {isRegisterMenuOpen && (
                    <div className="pl-6 mt-1">
                      <SubMenu
                        items={registerMenuItems}
                        getNavLinkClass={getSubMenuNavLinkClass}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Popover
                  placement="rightTop"
                  trigger="hover"
                  className="custom-popover"
                  content={
                    <SubMenu
                      items={registerMenuItems}
                      getNavLinkClass={getPopoverSubMenuNavLinkClass}
                    />
                  }
                >
                  <div {...getNavLinkClass({ isActive: false })}>
                    <FiUserPlus className="text-2xl" />
                  </div>
                </Popover>
              )}
            </li>
          )}

          {/* Menu Item: Admin Panel */}
          <li>
            <a
              href="#"
              className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100"
            ></a>
          </li>
        </ul>
      </nav>

      {/* User Profile & Logout Section */}
      <div className="mt-auto pt-4 border-white/20">
        <UserProfileSection
          token={token}
          fullName={fullName}
          email={userEmail}
          isExpanded={isExpanded}
        />
      </div>
    </aside>
  );
};

export default SideBar;
