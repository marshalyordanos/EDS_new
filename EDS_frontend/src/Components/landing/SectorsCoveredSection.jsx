import Reveal from "./Reveal";
import { SECTORS } from "./landingContent";

const SectorTag = ({ name, path }) => (
  <span className="ld-sector-tag">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
    {name}
  </span>
);

/** Duplicated once so the CSS translateX(-50%) loop is seamless. */
const MarqueeRow = ({ items, reverse = false }) => (
  <div className={`ld-marquee${reverse ? " is-reverse" : ""}`} aria-hidden="true">
    <div className="ld-marquee-track">
      {[...items, ...items].map((sector, i) => (
        <SectorTag key={`${sector.name}-${i}`} {...sector} />
      ))}
    </div>
  </div>
);

const SectorsCoveredSection = () => {
  const half = Math.ceil(SECTORS.length / 2);
  const rowOne = SECTORS.slice(0, half);
  const rowTwo = SECTORS.slice(half);

  return (
    <section className="ld-sectors">
      <Reveal className="ld-wrap">
        <p className="ld-eyebrow">Sectors covered</p>
        <h2 className="ld-title">
          Many fields,
          <br />
          one index
        </h2>
      </Reveal>

      <MarqueeRow items={rowOne} />
      <MarqueeRow items={rowTwo} reverse />

      {/* The marquee is decorative; this keeps the list available to readers. */}
      <p className="ld-sr-only">
        Sectors covered: {SECTORS.map((s) => s.name).join(", ")}.
      </p>
    </section>
  );
};

export default SectorsCoveredSection;
