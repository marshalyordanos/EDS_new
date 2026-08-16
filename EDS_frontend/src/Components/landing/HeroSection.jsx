import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import RotatingWord from "./RotatingWord";
import ExpertIndexConsole from "./ExpertIndexConsole";
import LedgerStrip from "./LedgerStrip";

const ROTATING_WORDS = ["experts", "consultants", "researchers", "specialists"];

/**
 * Landing hero: the thesis of the page is that AfriDATAi is a queryable
 * index, so the hero contains a working search rather than a static image.
 */
const HeroSection = ({ index }) => {
  const { data, loading, failed } = index;

  return (
    <section className="ld-hero">
      <div className="ld-wrap ld-hero-grid">
        <div>
          <Reveal delay={60} className="ld-partner">
            <span className="ld-partner-dot" />
            Research &amp; development partner
            <b>DAB Development Research</b>
          </Reveal>

          <Reveal as="h1" delay={140} className="ld-hero-title">
            Verified <RotatingWord words={ROTATING_WORDS} />
            <br />
            across Africa,
            <br />
            indexed.
          </Reveal>

          <Reveal as="p" delay={230} className="ld-hero-lede">
            AfriDATAi is the expert database for organisations that need the
            right person, verified, in minutes — not weeks. Built for research
            institutions, NGOs, governments and enterprises.
          </Reveal>

          <Reveal delay={310} className="ld-hero-cta">
            <Link to="/login" className="ld-btn ld-btn-red">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              Request access
            </Link>
            <a href="#how-it-works" className="ld-btn ld-btn-ghost">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              See how it works
            </a>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <ExpertIndexConsole
            records={data.samples}
            loading={loading}
            failed={failed}
          />
        </Reveal>
      </div>

      <LedgerStrip totals={data.totals} />
    </section>
  );
};

export default HeroSection;
