import React from "react";
// import "./CreativeCTABanner.css";

const CTASection = () => {
  return (
    <section className="creative-banner-section">
      <div className="creative-banner-card">
        <div className="banner-inner-content">
          <span className="banner-tagline">Start Today</span>

          <h2 className="banner-heading">
            Ready to find the right experts? <br />
            <span className="heading-highlight">
              Let's build your team today.
            </span>
          </h2>

          <p className="banner-text">
            AfriDATAi streamlines the discovery and engagement of verified
            professionals across multiple countries and sectors. Connect with
            world-class expertise instantly.
          </p>

          <div className="banner-actions">
            <button className="action-btn btn-crimson">
              <svg
                className="btn-svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
              Request access
            </button>

            <button className="action-btn btn-dark">
              <svg
                className="btn-svg-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Email us directly
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
