import { useEffect, useState } from "react";
import useInView from "../../hooks/useInView";
import useCountUp from "../../hooks/useCountUp";

/* ── the small data marks ─────────────────────────────────── */

const BAR_HEIGHTS = [22, 34, 30, 48, 62, 58, 80, 100];

const SparkBars = ({ active }) => (
  <div className={`ld-spark${active ? " is-in" : ""}`} aria-hidden="true">
    {BAR_HEIGHTS.map((height, i) => (
      <span
        key={i}
        className="ld-spark-bar"
        style={{ "--ld-h": `${height}%`, "--ld-bd": `${i * 55}ms` }}
      />
    ))}
  </div>
);

/** One tick per country, so the mark literally is the count. */
const SparkTicks = ({ active, count }) => (
  <div className={`ld-spark is-ticks${active ? " is-in" : ""}`} aria-hidden="true">
    {Array.from({ length: Math.min(count || 10, 14) }).map((_, i) => (
      <span key={i} className="ld-spark-tick" style={{ "--ld-bd": `${i * 42}ms` }} />
    ))}
  </div>
);

const SparkDots = ({ active }) => (
  <div className={`ld-spark is-dots${active ? " is-in" : ""}`} aria-hidden="true">
    {Array.from({ length: 22 }).map((_, i) => (
      <span key={i} className="ld-spark-dot" style={{ "--ld-bd": `${i * 24}ms` }} />
    ))}
  </div>
);

const SparkLive = () => (
  <div className="ld-spark is-live" aria-hidden="true">
    <span className="ld-pulse-dot" />
    <svg className="ld-wave" viewBox="0 0 120 14" fill="none" preserveAspectRatio="none">
      <path
        d="M0 7h14l5-5 6 10 5-8 7 3h12l5-6 6 11 5-8 6 3h13l5-5 6 9 5-7 7 3h13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

/* ── one ledger entry ─────────────────────────────────────── */

const CountEntry = ({ ordinal, value, suffix, label, active, children }) => {
  const shown = useCountUp(value, active);
  const [settled, setSettled] = useState(false);

  // The suffix lands only once the digits stop moving.
  useEffect(() => {
    if (active && value && shown >= value) setSettled(true);
  }, [active, value, shown]);

  return (
    <div className={`ld-entry${settled ? " is-settled" : ""}`}>
      <i className="ld-entry-ordinal">{ordinal}</i>
      <b className="ld-entry-figure">
        {shown.toLocaleString()}
        {suffix && <span className="ld-entry-suffix">{suffix}</span>}
      </b>
      <span className="ld-entry-label">{label}</span>
      {children}
    </div>
  );
};

/**
 * Full-bleed stat band closing the hero.
 *
 * Totals come from the public API; each figure carries a small mark that
 * encodes what it measures rather than decorating it.
 */
const LedgerStrip = ({ totals }) => {
  const [ref, inView] = useInView(0.35);
  const { experts = 0, countries = 0, sectors = 0 } = totals || {};

  return (
    <div className="ld-ledger-band" ref={ref}>
      <div className="ld-ledger">
        <CountEntry
          ordinal="01"
          value={experts}
          suffix="+"
          label="Verified experts"
          active={inView}
        >
          <SparkBars active={inView} />
        </CountEntry>

        <CountEntry
          ordinal="02"
          value={countries}
          suffix="+"
          label="Countries covered"
          active={inView}
        >
          <SparkTicks active={inView} count={countries} />
        </CountEntry>

        <CountEntry
          ordinal="03"
          value={sectors}
          suffix="+"
          label="Sectors and fields"
          active={inView}
        >
          <SparkDots active={inView} />
        </CountEntry>

        <div className="ld-entry is-settled">
          <i className="ld-entry-ordinal">04</i>
          <b className="ld-entry-figure is-word">Real-time</b>
          <span className="ld-entry-label">Data updates</span>
          <SparkLive />
        </div>
      </div>
    </div>
  );
};

export default LedgerStrip;
