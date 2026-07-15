import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: 1,
    title: "Register",
    description:
      "Create your organization account and get verified platform access.",
  },
  {
    number: 2,
    title: "Search",
    description:
      "Enter keywords, sector, or country to surface relevant experts instantly.",
  },
  {
    number: 3,
    title: "Filter",
    description:
      "Narrow by experience, language, availability, gender, and more.",
  },
  {
    number: 4,
    title: "Connect",
    description:
      "Access full verified profiles and reach out directly through the platform.",
  },
];

const HowItWorksSection = () => {
  const [lineActive, setLineActive] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLineActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-it-works-section" ref={sectionRef}>
      <div className="how-it-works-header" data-aos="fade-up">
        <p className="how-it-works-tag">How It Works</p>
        <h2 className="how-it-works-title">From search to connection in minutes</h2>
        <p className="how-it-works-subtitle">
          A simple, powerful workflow designed for decision-makers and researchers alike.
        </p>
      </div>

      <div className="how-it-works-steps">
        <div className={`how-it-works-line${lineActive ? " line-active" : ""}`} />
        {steps.map((step, index) => (
          <div
            className="how-it-works-step"
            key={index}
            style={{ "--pulse-delay": `${index * 1.1}s` }}
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="step-circle">{step.number}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
