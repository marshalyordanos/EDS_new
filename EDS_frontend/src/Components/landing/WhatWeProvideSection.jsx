const services = [
  {
    title: "Advanced expert search and filtering",
    description:
      "Powerful filters and smart suggestions to help you find the right expert based on skillsets, geography, sector, language, and availability. Results in seconds.",
    iconBg: "red",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
  },
  {
    title: "Comprehensive expert dashboard",
    description:
      "Real-time dashboards showing expert profiles, sector statistics, project involvements, and decision-making analytics. All in one place.",
    iconBg: "gray",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    ),
  },
  {
    title: "Real-time data registration",
    description:
      "Seamless onboarding of new experts with automated form validation, duplicate detection, and instant updates to the central database.",
    iconBg: "red",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"></path>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"></path>
      </svg>
    ),
  },
  {
    title: "Secure admin access",
    description:
      "Role-based access controls and end-to-end encryption ensure data integrity, privacy compliance, and trusted multi-organization collaboration.",
    iconBg: "gray",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    ),
  },
  {
    title: "Sector intelligence and analytics",
    description:
      "Deep analytics on expert distribution by country, field, gender, and experience level. Actionable insights for planning and recruitment.",
    iconBg: "red",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
  },
  {
    title: "Multi-organization collaboration",
    description:
      "Invite partners, share expert shortlists, and co-manage projects across teams. Full audit trails and permission controls at every level.",
    iconBg: "gray",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
];

const WhatWeProvideSection = () => {
  return (
    <section className="capabilities-section">
      <div className="capabilities-header" data-aos="fade-up">
        <p className="capabilities-tag">Platform Capabilities</p>
        <h2 className="capabilities-title">Built for serious expert discovery</h2>
        <p className="capabilities-subtitle">
          Every tool you need to find, evaluate, and engage the right expert.
          <br />
          From rapid search to deep analytics.
        </p>
      </div>

      <div className="capabilities-grid">
        {services.map((service, index) => (
          <div
            className="capability-card"
            key={index}
            data-aos="fade-up"
            data-aos-delay={index * 80}
          >
            <div className="capability-card-top">
              <div className={`capability-icon-box ${service.iconBg}`}>
                {service.icon}
              </div>
              <span className="capability-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <div className="capability-card-body">
              <h3 className="capability-card-title">{service.title}</h3>
              <p className="capability-card-desc">{service.description}</p>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatWeProvideSection;
