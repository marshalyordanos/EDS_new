import React from "react";
import "../../styles/legal.css";
import PublicLayout from "../../layouts/PublicLayout";

const PrivacyPolicy = () => {
  return (
    <PublicLayout>
      <div className="legal-page-container" style={{ flex: 1 }}>
        <header className="legal-header">
          <span className="legal-badge">Legal Document</span>
          <h1 className="legal-main-title">Privacy Policy</h1>
          <div className="legal-meta">
            <span className="meta-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="meta-icon"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Effective: June 2026
            </span>
            <span className="meta-item">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="meta-icon"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              AfriDATAi, operated by DAB Development Research and Training PLC
            </span>
          </div>
        </header>

        <main className="legal-body">
          <div className="legal-summary-box">
            <p>
              <strong>Summary:</strong> AfriDATAi collects only the information
              needed to operate the expert database. We do not sell your data,
              share it with advertisers, or use it for any purpose beyond what
              is described in this policy.
            </p>
          </div>

          <h2>1. Who we are</h2>
          <p>
            AfriDATAi is an expert database system developed and operated by DAB
            Development Research and Training PLC. We provide organizations and
            institutions with access to a database of verified professionals
            across multiple countries and sectors.
          </p>
          <p>
            For questions about this policy, contact us at{" "}
            <a href="mailto:business@afridatai.com">business@afridatai.com</a>{" "}
            or call <a href="tel:+251980666305">+251 980 666 305</a>.
          </p>

          <h2>2. Information we collect</h2>
          <p>We collect information in the following ways:</p>
          <ul>
            <li>
              <strong>Expert registration data:</strong> Name, professional
              title, sector, country, contact details, qualifications, and any
              other information submitted during expert onboarding.
            </li>
            <li>
              <strong>Organization account data:</strong> Name of the
              organization, contact person, email address, and purpose of access
              when an institution registers for platform access.
            </li>
            <li>
              <strong>Usage data:</strong> Search queries, pages visited, and
              actions taken within the platform, collected to improve the
              service.
            </li>
            <li>
              <strong>Contact form submissions:</strong> Name, email,
              organization, and message content submitted through our website
              contact form.
            </li>
          </ul>

          <h2>3. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Maintain and operate the AfriDATAi expert database</li>
            <li>Verify expert profiles and ensure data accuracy</li>
            <li>
              Provide registered organizations with access to expert search and
              filtering tools
            </li>
            <li>Respond to inquiries and support requests</li>
            <li>
              Send platform updates, service notifications, and relevant
              communications
            </li>
            <li>Improve the platform based on usage patterns and feedback</li>
          </ul>
          <p>
            We do not use your information for advertising, and we do not share
            it with third parties for commercial purposes.
          </p>

          <h2>4. How we store and protect your data</h2>
          <p>
            All data stored in AfriDATAi is protected using industry-standard
            security practices, including encrypted storage and role-based
            access controls. Only authorized personnel at DAB Development
            Research and Training PLC and designated platform administrators can
            access the database.
          </p>
          <p>
            We retain expert and organization data for as long as it is relevant
            and accurate. You may request deletion of your data at any time by
            contacting us.
          </p>

          <h2>5. Sharing of information</h2>
          <p>
            AfriDATAi does not sell personal data. Expert profiles are only
            accessible within the organization that registered them. No other
            organization can view or search your experts.
          </p>
          <p>
            We may share information in the following limited circumstances:
          </p>
          <ul>
            <li>
              <strong>Within your organization only:</strong> Expert profile
              information is visible solely to the organization account under
              which it was registered. Access across organizations does not
              occur.
            </li>
            <li>
              <strong>With service providers:</strong> We may use trusted
              technical partners to host or operate the platform. These partners
              are bound by confidentiality agreements.
            </li>
            <li>
              <strong>Where required by law:</strong> We may disclose
              information if required to do so by applicable law or a lawful
              government request.
            </li>
          </ul>

          <h2>6. Your rights</h2>
          <p>
            If your information is stored in AfriDATAi, you have the right to:
          </p>
          <ul>
            <li>Request access to the information we hold about you</li>
            <li>Request corrections to inaccurate or outdated information</li>
            <li>Request deletion of your data from the database</li>
            <li>
              Withdraw consent for any use of your data where consent was the
              basis for collection
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:business@afridatai.com">business@afridatai.com</a>.
          </p>

          <h2>7. Requesting expert data outside the platform</h2>
          <div className="legal-summary-box">
            <p>
              <strong>Need expert details outside the platform?</strong> If you
              need to access, download, or share expert information from your
              database, contact the AfriDATAi support team. We will prepare and
              send the requested data securely.
            </p>
          </div>
          <p>
            AfriDATAi platform access is required to search and browse your
            registered experts. If you need expert records delivered outside of
            the platform — for example, to share with a colleague, include in a
            report, or use in an offline process — you can request this directly
            from our support team.
          </p>
          <p>To request an expert data export:</p>
          <ul>
            <li>
              Send an email to{" "}
              <a href="mailto:business@afridatai.com">business@afridatai.com</a>{" "}
              with the subject line: <strong>Expert Data Request</strong>
            </li>
            <li>Include your organization name and account details</li>
            <li>
              Specify the expertise area, field, or individual expert details
              you are looking for
            </li>
            <li>
              Our support team will verify your identity and organization, then
              prepare and send the requested data securely
            </li>
          </ul>
          <p>
            Data exports are provided only to verified account holders of the
            organization under which the experts are registered. We do not share
            or export expert data to unverified parties under any circumstance.
          </p>

          <h2>8. Cookies and tracking</h2>
          <p>
            The AfriDATAi website may use basic cookies to support site
            functionality and measure usage. We do not use advertising or
            tracking cookies. You can disable cookies in your browser settings
            without affecting your ability to access the website.
          </p>

          <h2>9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will update the effective date at the top of this page. Continued
            use of the platform after changes are posted constitutes acceptance
            of the updated policy.
          </p>

          <div className="legal-contact-card">
            <h3>Questions about this Privacy Policy?</h3>
            <p>Contact our team directly:</p>
            <p className="contact-link-row">
              <a href="mailto:business@afridatai.com">business@afridatai.com</a>
            </p>
            <p className="contact-link-row">
              <a href="tel:+251980666305">+251 980 666 305</a>
            </p>
            <p className="contact-footer-text">
              DAB Development Research and Training PLC, Addis Ababa, Ethiopia
            </p>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
