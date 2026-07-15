import React from "react";
import "../../styles/legal.css";
import PublicLayout from "../../layouts/PublicLayout";

const TermsOfUse = () => {
  return (
    <PublicLayout>
      <div className="legal-page-container" style={{ flex: 1 }}>
        <header className="legal-header">
          <span className="legal-badge">Legal Document</span>
          <h1 className="legal-main-title">Terms of Use</h1>
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
              <strong>Summary:</strong> By accessing AfriDATAi, you agree to use
              the platform responsibly and only for its intended purpose. The
              database and its contents may not be copied, redistributed, or
              used commercially without written permission.
            </p>
          </div>

          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing or using the AfriDATAi platform, website, or any
            associated services, you agree to be bound by these Terms of Use. If
            you do not agree, you must not access or use the platform.
          </p>
          <p>
            These terms apply to all users, including registered organizations,
            individual visitors, and expert registrants.
          </p>

          <h2>2. About the platform</h2>
          <p>
            AfriDATAi is an expert database system operated by DAB Development
            Research and Training PLC. The platform enables registered
            organizations to search, filter, and access profiles of verified
            professionals across multiple countries and sectors.
          </p>
          <p>
            Access to the full database is granted only to verified
            organizations following a registration and approval process.
          </p>

          <h2>3. Data ownership and access scope</h2>
          <div className="legal-summary-box">
            <p>
              <strong>Important:</strong> Each organization on AfriDATAi has
              access only to the experts registered under their own account. You
              will not see experts registered by other organizations, and other
              organizations will not see yours. Your expert data belongs to you.
            </p>
          </div>
          <p>
            AfriDATAi operates on a private, organization-scoped data model:
          </p>
          <ul>
            <li>
              <strong>Your experts, your access only.</strong> When your
              organization registers experts on the platform, those records are
              visible exclusively to your account. No other organization can
              view, search, or access your expert profiles.
            </li>
            <li>
              <strong>Each organization manages its own database.</strong> Every
              registered organization has its own separate workspace. You build,
              manage, and search your own expert pool independently.
            </li>
            <li>
              <strong>No cross-organization data sharing.</strong> Expert data
              is never shared across organizations unless you have explicitly
              authorized it in writing with AfriDATAi.
            </li>
            <li>
              <strong>Admins control internal access.</strong> Within your
              organization, account administrators can manage which team members
              have access to your expert database using role-based permissions.
            </li>
          </ul>
          <p>
            This model ensures that your expert network remains confidential,
            competitive, and fully under your organization's control.
          </p>

          <h2>4. Permitted use</h2>
          <p>You may use AfriDATAi to:</p>
          <ul>
            <li>
              Search and browse expert profiles registered under your own
              organization's account
            </li>
            <li>
              Contact your registered experts through the platform for
              professional engagements
            </li>
            <li>
              Register experts by submitting accurate and truthful profile
              information on their behalf
            </li>
            <li>
              Request access for your organization in accordance with our
              onboarding process
            </li>
          </ul>

          <h2>5. Requesting expert data outside the platform</h2>
          <div className="legal-summary-box">
            <p>
              <strong>Need expert details outside the platform?</strong> Contact
              the AfriDATAi support team with the expertise area and details you
              need. Our team will verify your request and send the data to you
              securely.
            </p>
          </div>
          <p>
            If you need expert records from your database delivered outside of
            the platform — to share with a colleague, include in a report, or
            use in an offline workflow — you can request this from our support
            team at any time.
          </p>
          <p>
            <strong>How to request:</strong>
          </p>
          <ul>
            <li>
              Email{" "}
              <a href="mailto:business@afridatai.com">business@afridatai.com</a>{" "}
              with the subject line: <strong>Expert Data Request</strong>
            </li>
            <li>
              Include your organization name and registered account details
            </li>
            <li>
              Describe the expertise area, sector, or specific expert
              information you need
            </li>
            <li>
              Our team will verify your identity and organization, then prepare
              and deliver the data securely
            </li>
          </ul>
          <p>
            Data is provided only to verified account holders of the
            organization that registered those experts. Requests from unverified
            parties will not be fulfilled.
          </p>

          <h2>6. Prohibited use</h2>
          <p>You may not use AfriDATAi to:</p>
          <ul>
            <li>
              Copy, scrape, harvest, or systematically extract data from the
              platform without written permission
            </li>
            <li>
              Redistribute, resell, or republish expert data to third parties
            </li>
            <li>
              Use expert contact information for unsolicited commercial
              communications
            </li>
            <li>
              Submit false, misleading, or fraudulent information during
              registration
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the platform or
              its underlying systems
            </li>
            <li>
              Use the platform in any way that violates applicable local or
              international law
            </li>
          </ul>

          <h2>7. Expert profiles and data accuracy</h2>
          <p>
            AfriDATAi makes reasonable efforts to verify the accuracy of expert
            profiles. However, we do not guarantee the completeness, accuracy,
            or currency of any information in the database. Organizations using
            the platform are responsible for conducting their own verification
            where required for high-stakes decisions.
          </p>
          <p>
            Experts who register on the platform are responsible for ensuring
            their submitted information is accurate and kept up to date.
            Intentionally false submissions may result in removal from the
            database.
          </p>

          <h2>8. Intellectual property</h2>
          <p>
            The AfriDATAi platform, including its design, software, database
            structure, and content, is the intellectual property of DAB
            Development Research and Training PLC. Nothing in these terms grants
            you ownership of or license to any part of the platform beyond the
            limited right to use it as described in these terms.
          </p>
          <p>
            The AfriDATAi name, logo, and brand identity may not be used without
            prior written consent.
          </p>

          <h2>9. Account responsibility</h2>
          <p>
            If you register an organization account, you are responsible for
            maintaining the confidentiality of your login credentials and for
            all activity that occurs under your account. You must notify us
            immediately at{" "}
            <a href="mailto:business@afridatai.com">business@afridatai.com</a>{" "}
            if you become aware of any unauthorized use of your account.
          </p>

          <h2>10. Suspension and termination</h2>
          <p>
            AfriDATAi reserves the right to suspend or terminate access to any
            account or user that violates these terms, provides false
            information, or uses the platform in a manner inconsistent with its
            intended purpose. We may do so without prior notice where necessary.
          </p>

          <h2>11. Limitation of liability</h2>
          <p>
            AfriDATAi and DAB Development Research and Training PLC are not
            liable for any direct, indirect, or consequential loss arising from
            your use of the platform or reliance on any information contained
            within it. The platform is provided on an "as available" basis
            without warranties of any kind.
          </p>

          <h2>12. Governing law</h2>
          <p>
            These Terms of Use are governed by the laws of the Federal
            Democratic Republic of Ethiopia. Any disputes arising from the use
            of the platform will be subject to the jurisdiction of the competent
            courts of Addis Ababa, Ethiopia.
          </p>

          <h2>13. Changes to these terms</h2>
          <p>
            We may revise these Terms of Use at any time. Updated terms will be
            posted on this page with a revised effective date. Continued use of
            the platform after changes are posted constitutes acceptance of the
            revised terms.
          </p>

          <div className="legal-contact-card">
            <h3>Questions about these Terms?</h3>
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

export default TermsOfUse;
