import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import img3 from "../../assets/dab.jpg";

const phrases1 = ["right expert", "top consultant", "best researcher"];
const phrases2 = ["10+ countries", "across Africa", "multiple sectors"];

// ── Looping Typewriter ──────────────────────────────────────
const LoopingTypewriter = ({ phrases, active, speed = 72, deleteSpeed = 48 }) => {
  const [displayed, setDisplayed] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    if (!active) return;
    const current = phrases[phraseIndex];
    let timer;

    if (phase === "typing") {
      if (displayed.length < current.length) {
        timer = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed);
      } else {
        timer = setTimeout(() => setPhase("deleting"), 3000);
      }
    } else {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(d => d.slice(0, -1)), deleteSpeed);
      } else {
        timer = setTimeout(() => {
          setPhraseIndex(i => (i + 1) % phrases.length);
          setPhase("typing");
        }, 400);
      }
    }
    return () => clearTimeout(timer);
  }, [active, displayed, phase, phraseIndex, phrases, speed, deleteSpeed]);

  return (
    <span className="highlight-red">
      {displayed}
      <span className="typing-cursor">|</span>
    </span>
  );
};

// ── Stat count-up ───────────────────────────────────────────
const stats = [
  { target: 10000, suffix: "+", label: "Verified experts", isText: false },
  { target: 10, suffix: "+", label: "Countries covered", isText: false },
  { target: 50, suffix: "+", label: "Sectors and fields", isText: false },
  { target: null, text: "Real-time", label: "Data updates", isText: true },
];

const useCountUp = (target, duration, trigger) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger || target === null) return;
    let startTime = null;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [trigger, target, duration]);
  return count;
};

const StatCard = ({ stat, trigger, index }) => {
  const count = useCountUp(stat.target, 1800, trigger);
  const display = stat.isText
    ? stat.text
    : stat.target === 10000
      ? count.toLocaleString() + stat.suffix
      : count + stat.suffix;

  return (
    <div
      className="hero-stat-card"
      style={{ animationDelay: `${0.75 + index * 0.15}s` }}
    >
      <span className="hero-stat-card-number">{display}</span>
      <span className="hero-stat-card-label">{stat.label}</span>
    </div>
  );
};

// ── HeroSection ─────────────────────────────────────────────
const HeroSection = () => {
  const [typing1Active, setTyping1Active] = useState(false);
  const [typing2Active, setTyping2Active] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setTyping1Active(true), 950);
    const t2 = setTimeout(() => setTyping2Active(true), 1350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // IntersectionObserver for count-up
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <span className="announcement-text">
          Official research and development partner
        </span>
        <div className="partner-badge">
          <div className="partner-logo-box">
            <img src={img3} alt="Partner" className="partner-logo-img" />
          </div>
          <div className="partner-info">
            <span className="partner-name">DAB Development Research</span>
            <span className="partner-sub">and Training PLC</span>
          </div>
        </div>
      </div>

      <section className="hero-section">
        <div className="hero-center-content">
          <div className="hero-badge hero-entrance hero-entrance-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z"></path>
            </svg>
            <span>Expert database system, live across 10+ countries</span>
          </div>

          <h1 className="hero-title-new hero-entrance hero-entrance-2">
            Find the{" "}
            <LoopingTypewriter phrases={phrases1} active={typing1Active} />
            {" "}across
            <br />
            <LoopingTypewriter phrases={phrases2} active={typing2Active} speed={72} />
          </h1>

          <p className="hero-subtitle-new hero-entrance hero-entrance-3 " >
            AfriDATAi is a growing expert database that helps organizations find
            and connect with verified professionals across multiple countries
            and sectors. Built for research institutions, NGOs, governments, and
            enterprises.
          </p>

          <div className="hero-buttons hero-entrance hero-entrance-4">
            <Link to="/login">
              <button className="hero-btn-primary">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                Request access
              </button>
            </Link>
            <button className="hero-btn-dark">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Book a demo
            </button>
            <button className="hero-btn-outline">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
              See features
            </button>
          </div>

          <div
            className="hero-stats-grid hero-entrance hero-entrance-5"
            ref={statsRef}
          >
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} trigger={statsVisible} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
