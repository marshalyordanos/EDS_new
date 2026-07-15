import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../shared/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import fullLogoWhite from "../../assets/full-logo-white.svg";
import fullLogoRed from "../../assets/full-logo-red.svg";

const Navbar = () => {
  const { resolvedTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const logoSrc = resolvedTheme === "dark" ? fullLogoWhite : fullLogoRed;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header animate-fade delay-1${scrolled ? " header-shrunk" : ""}`}>
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo-brand">
            <img src={logoSrc} alt="AfriDATAi" className="h-10 w-auto" />
          </Link>
        </div>
        <div className="header-nav">
          <Link to="/blog" className="nav-blog-link">Blog</Link>
          <span className="nav-divider" />
          <ThemeToggle />
          <span className="nav-divider" />
          <Link to="/login">
            <button className="signin-btn">Request Access</button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
