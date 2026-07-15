import React, { useEffect, useRef, useState } from "react";
// import "./TrustSecurity.css";

const featuresData = [
  {
    id: 1,
    title: "Verified profiles",
    description:
      "Every expert undergoes a rigorous multi-step verification process before being listed in the database.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Data privacy",
    description:
      "End-to-end encryption and GDPR-aligned data practices protect expert and organization data at every level.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Research-backed",
    description:
      "Built by DAB Development Research, a proven institution in African development, research, and professional training.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Always current",
    description:
      "Real-time registration and update systems ensure the database stays fresh, accurate, and up to date.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
];

const TrustSecurity = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the section is 15% visible in the viewport, trigger the animation state
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once it animates in, we can stop observing it
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="trust-section" ref={sectionRef}>
      <div className="trust-container">
        {/* Header Block Section */}
        <div
          className={`trust-header ${isVisible ? "animate-fade-in" : "hidden-state"}`}
        >
          <span className="trust-subtitle">Trust and Security</span>
          <h2 className="trust-title">Built on trust. Backed by research.</h2>
          <p className="trust-description">
            AfriDATAi is developed in partnership with{" "}
            <strong>DAB Development Research and Training PLC</strong>, with a
            focus on data quality, verification, and responsible expert
            registration.
          </p>
        </div>

        {/* 4-Column Feature Card Layout Grid */}
        <div className="trust-grid">
          {featuresData.map((feature, index) => (
            <div
              key={feature.id}
              className={`trust-card ${isVisible ? "animate-slide-up" : "hidden-state"}`}
              style={{ animationDelay: isVisible ? `${index * 0.12}s` : "0s" }}
            >
              <div className="trust-icon-box">{feature.icon}</div>
              <h3 className="trust-card-title">{feature.title}</h3>
              <p className="trust-card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;
