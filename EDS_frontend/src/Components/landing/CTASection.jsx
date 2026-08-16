import { Link } from "react-router-dom";
import Reveal from "./Reveal";

const CTASection = () => (
  <section className="ld-cta" id="request-access">
    <div className="ld-wrap">
      <Reveal className="ld-cta-card">
        <p className="ld-cta-eyebrow">Start today</p>
        <h2 className="ld-cta-title">
          Ready to find the right experts? <em>Let&apos;s build your team.</em>
        </h2>
        <p className="ld-cta-text">
          AfriDATAi streamlines the discovery and engagement of verified
          professionals across multiple countries and sectors. Connect with
          world-class expertise instantly.
        </p>

        <div className="ld-cta-actions">
          <Link to="/login" className="ld-btn ld-btn-paper">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            Request access
          </Link>
          <a href="#contact" className="ld-btn ld-btn-outline-light">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            Email us directly
          </a>
        </div>
      </Reveal>
    </div>
  </section>
);

export default CTASection;
