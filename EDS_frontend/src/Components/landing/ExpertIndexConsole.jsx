import { useEffect, useMemo, useRef, useState } from "react";

const ALL = "all";

/** Country name → 3-letter tag for the record row. */
const isoTag = (country) => (country || "??").slice(0, 3).toUpperCase();

/** Splits a label around the first match so it can be highlighted. */
const splitOnMatch = (label, query) => {
  if (!query) return [label, "", ""];
  const at = label.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return [label, "", ""];
  return [
    label.slice(0, at),
    label.slice(at, at + query.length),
    label.slice(at + query.length),
  ];
};

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const SkeletonRows = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <div className="ld-record" key={i}>
        <span className="ld-skeleton" style={{ width: "52px" }} />
        <span className="ld-skeleton" />
        <span className="ld-skeleton" style={{ width: "34px" }} />
        <span />
      </div>
    ))}
  </>
);

/**
 * The hero's live expert index.
 *
 * Records come from the public landing endpoint and are anonymised server
 * side (code / sector / country / seniority only) — no names, emails or CVs
 * ever reach this component.
 */
const ExpertIndexConsole = ({ records, loading, failed }) => {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState(ALL);
  const inputRef = useRef(null);

  // Animate rows on the first paint only; re-animating on every keystroke
  // reads as flicker.
  const firstPaintDone = useRef(false);
  useEffect(() => {
    if (records.length) firstPaintDone.current = true;
  }, [records]);

  // Sector chips are derived from the data actually present, so the filters
  // can never advertise a sector with no records behind it.
  const sectors = useMemo(() => {
    const seen = new Map();
    records.forEach((r) => {
      const key = (r.sector || "").split(/[\s/]/)[0];
      if (key && !seen.has(key)) seen.set(key, r.sector);
    });
    return [...seen.keys()].slice(0, 6);
  }, [records]);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (sector !== ALL && !(r.sector || "").startsWith(sector)) return false;
      if (!q) return true;
      return [r.code, r.sector, r.country, r.seniority]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [records, query, sector]);

  const showEmpty = !loading && !hits.length;

  return (
    <div className="ld-console">
      <div className="ld-console-bar">
        <span className="ld-lamp is-live" />
        <span className="ld-lamp" />
        <span className="ld-lamp" />
        <span className="ld-console-title">Expert index — live</span>
        <span className="ld-console-count">
          {/* Blank until real data lands, so no 0 → N flash on load. */}
          <em>{loading ? " " : hits.length}</em>
          <span>shown</span>
        </span>
      </div>

      <div className="ld-search-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          ref={inputRef}
          className="ld-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by sector, country, or code…"
          aria-label="Search the expert index"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {sectors.length > 0 && (
        <div className="ld-chip-row" role="group" aria-label="Filter by sector">
          <button
            type="button"
            className="ld-chip"
            aria-pressed={sector === ALL}
            onClick={() => setSector(ALL)}
          >
            All
          </button>
          {sectors.map((name) => (
            <button
              type="button"
              key={name}
              className="ld-chip"
              aria-pressed={sector === name}
              onClick={() => setSector(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="ld-records" aria-live="polite">
        {loading && <SkeletonRows />}

        {!loading && failed && (
          <p className="ld-console-msg">
            The live index is unavailable right now.
            <br />
            Browse the platform capabilities below.
          </p>
        )}

        {showEmpty && !failed && (
          <p className="ld-console-msg">
            No records match <code>{query || sector}</code>
            <br />
            Try a sector, a country, or a record code.
          </p>
        )}

        {!loading &&
          hits.map((record) => {
            const [before, match, after] = splitOnMatch(record.sector, query.trim());
            return (
              <div
                className={`ld-record${firstPaintDone.current ? "" : " is-fresh"}`}
                key={record.code}
              >
                <span className="ld-rec-code">{record.code}</span>
                <span className="ld-rec-main">
                  <span className="ld-rec-sector">
                    {before}
                    {match && <mark>{match}</mark>}
                    {after}
                  </span>
                  <span className="ld-rec-seniority">
                    {record.seniority} · {record.country}
                  </span>
                </span>
                <span className="ld-rec-flag">{isoTag(record.country)}</span>
                <span className="ld-rec-verify" title="Verified record">
                  <CheckIcon />
                  <span className="ld-sr-only">Verified</span>
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ExpertIndexConsole;
