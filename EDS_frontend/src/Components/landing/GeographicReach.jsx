import { useMemo } from "react";
import Reveal from "./Reveal";
import useInView from "../../hooks/useInView";

/**
 * Country distribution, derived from the anonymised sample rows.
 *
 * The samples are a capped slice of the index, so these are relative
 * proportions of what is on the page — not a full census. The copy says so
 * rather than implying a total.
 */
const GeographicReach = ({ records }) => {
  const [ref, inView] = useInView(0.25);

  const rows = useMemo(() => {
    const tally = new Map();
    records.forEach((r) => {
      const name = r.country || "Unspecified";
      tally.set(name, (tally.get(name) || 0) + 1);
    });
    return [...tally.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records]);

  if (!rows.length) return null;

  const max = rows[0].count;

  return (
    <section className="ld-reach" id="reach">
      <div className="ld-wrap ld-reach-grid">
        <Reveal>
          <p className="ld-eyebrow">Geographic reach</p>
          <h2 className="ld-title">
            Operating across
            <br />
            the continent
          </h2>
          <p className="ld-lede">
            A growing footprint across sub-Saharan and North Africa, expanding
            into new markets every year. The breakdown shows where the most
            recently registered experts are based.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="ld-country-table" ref={ref}>
            {rows.map((row, i) => (
              <div className="ld-country-row" key={row.name}>
                <span className="ld-country-iso">
                  {row.name.slice(0, 3).toUpperCase()}
                </span>
                <span className="ld-country-name">{row.name}</span>
                <span className="ld-country-count">{row.count}</span>
                <span className={`ld-meter${inView ? " is-in" : ""}`}>
                  <i
                    style={{
                      width: `${Math.round((row.count / max) * 100)}%`,
                      "--ld-bd": `${i * 70}ms`,
                    }}
                  />
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default GeographicReach;
