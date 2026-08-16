import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../shared/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import fullLogoWhite from "../../assets/full-logo-white.svg";
import fullLogoRed from "../../assets/full-logo-red.svg";

/** In-page section anchors, matching the ids rendered by the landing sections. */
const SECTION_LINKS = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Reach", href: "#reach" },
  { label: "Trust", href: "#trust" },
];

/**
 * Landing masthead.
 *
 * Sticky and transparent over the hero; a hairline rule fades in once the
 * page scrolls, so the header reads as part of the ruled "index" system
 * rather than a floating bar.
 */
const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const logoSrc = resolvedTheme === "dark" ? fullLogoWhite : fullLogoRed;
  const location = useLocation();
  const navigate = useNavigate();
  const onHomepage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll(); // respect an already-scrolled position on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section links only exist on the homepage. Elsewhere, navigate home first
  // and let the browser jump to the hash once that page has rendered.
  const goToSection = (event, href) => {
    if (onHomepage) return;
    event.preventDefault();
    navigate(`/${href}`);
  };

  return (
    <header className={`ld-masthead${scrolled ? " is-stuck" : ""}`}>
      <div className="ld-masthead-inner">
        <Link to="/" className="ld-wordmark" aria-label="AfriDATAi home">
          <img src={logoSrc} alt="AfriDATAi" className="ld-wordmark-logo" />
          <span className="ld-wordmark-tag">Expert Index</span>
        </Link>

        <nav className="ld-masthead-nav" aria-label="Page sections">
          {SECTION_LINKS.map((link) => (
            <a
              key={link.href}
              href={onHomepage ? link.href : `/${link.href}`}
              className="ld-masthead-link"
              onClick={(event) => goToSection(event, link.href)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/blog" className="ld-masthead-link">
            Blog
          </Link>
        </nav>

        <div className="ld-masthead-actions">
          <ThemeToggle />
          <Link to="/login" className="ld-btn ld-btn-red ld-masthead-cta">
            Request access
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
