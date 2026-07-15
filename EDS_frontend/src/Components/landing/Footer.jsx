import { Link } from "react-router-dom";
import logo from "../../assets/dab.jpg";
import fullLogoWhite from "../../assets/full-logo-white.svg";

const Footer = () => {
  return (
    <footer className="footer animate-fade delay-4">
      <div className="footer-content">
        {/* Main 4-Column Layout */}
        <div className="footer-main">
          {/* Column 1: Logo & Partner */}
          {/* Column 1: Text Logo & Partner */}
          <div className="footer-column brand-column">
            <div className="footer-logo-section">
              <img src={fullLogoWhite} alt="AfriDATAi" className="footer-brand-logo" />
            </div>
            <p className="brand-description">
              A growing expert database connecting organizations with verified
              professionals across 10+ countries and 50+ sectors.
            </p>
            <div className="footer-partner-badge">
              <div className="partner-logo-box">
                <img src={logo} alt="Partner" className="partner-logo-img" />
              </div>
              <div className="partner-info">
                <span className="partner-name">DAB Development Research</span>
                <span className="partner-sub">and Training PLC</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="footer-column">
            <h3 className="column-title">Platform</h3>
            <ul className="footer-links">
              <li>
                <a href="#expert-search">Expert search</a>
              </li>
              <li>
                <a href="#analytics">Analytics dashboard</a>
              </li>
              <li>
                <a href="#registration">Data registration</a>
              </li>
              <li>
                <a href="#admin">Admin portal</a>
              </li>
              <li>
                <a href="#api">API access</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Organization Links */}
          <div className="footer-column">
            <h3 className="column-title">Organization</h3>
            <ul className="footer-links">
              <li>
                <a href="#about">About AfriDATAI</a>
              </li>
              <li>
                <a href="#partner">Our research partner</a>
              </li>
              <li>
                <a href="#countries">Countries covered</a>
              </li>
              <li>
                <a href="#sectors">Sectors</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className="footer-column">
            <h3 className="column-title">Contact</h3>
            <ul className="footer-links contact-info-list">
              <li>
                <a
                  href="mailto:business@afridatai.com"
                  className="contact-link"
                >
                  <svg
                    className="link-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  business@afridatai.com
                </a>
              </li>
              <li>
                <a href="tel:+251980666305" className="contact-link">
                  <svg
                    className="link-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  +251955932222
                </a>
              </li>
            </ul>

            {/* Inline Social Icons Wrapper */}
            <div className="social-icons-row">
              <a
                href="https://www.linkedin.com/company/afridatai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-icon-link"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/1Po9nZPMzh/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-icon-link"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/afridatai?igsh=ams3ajh3NW81YzB1"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-icon-link"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Line */}
        <div className="footer-bottom">
          <p className="copyright">
            © 2026 AfriDATAI · In partnership with DAB Development Research and
            Training PLC
          </p>
          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy policy</Link>
            <span className="separator">·</span>
            <Link to="/terms-of-use">Terms of use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
