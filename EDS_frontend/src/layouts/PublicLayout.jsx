import Navbar from "../Components/landing/Navbar";
import Footer from "../Components/landing/Footer";

/**
 * Shell for public pages.
 *
 * `className` lets a page scope a design system onto the whole shell —
 * the landing page passes "ld-root" so the masthead and footer pick up the
 * landing tokens alongside the page body.
 */
const PublicLayout = ({ children, bgColor, className = "" }) => (
  <div
    className={className}
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: bgColor || "var(--theme-bg-primary)",
      transition: "background-color 0.3s ease",
    }}
  >
    <Navbar />
    {children}
    <Footer />
  </div>
);

export default PublicLayout;
