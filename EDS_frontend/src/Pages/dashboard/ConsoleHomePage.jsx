import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiRefreshCw,
  FiClock,
  FiChevronRight,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiX,
} from "react-icons/fi";
import protectedApiClient from "../../api/axios";
import AnalyticsPanel from "../../Components/dashboard/AnalyticsPanel";
import "../../styles/console.css";

const RANGES = [
  { key: "day", label: "Day", field: "registered_today" },
  { key: "week", label: "Week", field: "registered_this_week" },
  { key: "month", label: "Month", field: "registered_this_month" },
  { key: "year", label: "Year", field: "registered_this_year" },
];

const RANGE_CAPTION = {
  day: "Registered today",
  week: "Registered this week",
  month: "Registered this month",
  year: "Registered this year",
};

const initialsOf = (first = "", last = "") =>
  `${first[0] || ""}${last[0] || ""}`.toUpperCase() || "–";

/* Stale CVs are triaged into three bands so the queue reads by shape,
   not only by the number in the pill. */
const severityOf = (months) => {
  if (months >= 24) return "high";
  if (months >= 15) return "mid";
  return "low";
};

const relativeTime = (value) => {
  if (!value) return "—";
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return "—";

  const minutes = Math.round((Date.now() - then.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  if (hours < 48) return "yesterday";

  return then.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const greetingFor = (hour) => {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/* ── Sparkline ──────────────────────────────────────────────
   Area + line + emphasized endpoint over the monthly series. */
const Sparkline = ({ points }) => {
  const width = 460;
  const height = 72;

  const path = useMemo(() => {
    if (points.length < 2) return null;

    const max = Math.max(...points, 1);
    const step = width / (points.length - 1);
    const y = (value) => height - 12 - (value / max) * (height - 24);

    const line = points.map((value, i) => `${i * step},${y(value)}`).join(" L");
    const last = { x: (points.length - 1) * step, y: y(points[points.length - 1]) };

    return { line: `M${line}`, area: `M${line} L${width},${height} L0,${height} Z`, last };
  }, [points]);

  if (!path) return <div className="con-spark" />;

  return (
    <svg
      className="con-spark"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Registrations over the last twelve months"
    >
      <defs>
        <linearGradient id="con-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--con-accent)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--con-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path.area} fill="url(#con-spark-fill)" />
      <path
        d={path.line}
        fill="none"
        stroke="var(--con-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={path.last.x}
        cy={path.last.y}
        r="3.6"
        fill="var(--con-accent)"
        stroke="var(--con-surface)"
        strokeWidth="2"
      />
    </svg>
  );
};

/* ── Trend chart ────────────────────────────────────────────
   Hand-drawn SVG bars: the current month is solid, prior months
   recede to 30% so the eye lands on "now" first. */
const TrendChart = ({ series }) => {
  const width = 700;
  const height = 224;
  const padLeft = 42;
  const padRight = 14;
  const padTop = 20;
  const baseline = 188;

  if (!series.length) {
    return <div className="con-empty">No registrations recorded yet.</div>;
  }

  const max = Math.max(...series.map((d) => d.count), 1);
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const plotWidth = width - padLeft - padRight;
  const slot = plotWidth / series.length;
  const barWidth = Math.min(34, slot * 0.62);

  const ticks = [0, 1, 2, 3, 4].map((i) => {
    const value = (niceMax / 4) * i;
    return { value, y: baseline - ((baseline - padTop) / 4) * i };
  });

  return (
    <svg
      className="con-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Monthly registrations, ${series[0].label} through ${
        series[series.length - 1].label
      }`}
    >
      {ticks.map((tick) => (
        <g key={tick.value}>
          <line
            x1={padLeft}
            y1={tick.y}
            x2={width - padRight}
            y2={tick.y}
            stroke="var(--con-line)"
            strokeWidth="1"
          />
          <text
            x={padLeft - 8}
            y={tick.y + 4}
            textAnchor="end"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            fill="var(--con-ink-3)"
          >
            {Math.round(tick.value)}
          </text>
        </g>
      ))}

      {series.map((point, i) => {
        const isLast = i === series.length - 1;
        const barHeight = (point.count / niceMax) * (baseline - padTop);
        const x = padLeft + slot * i + (slot - barWidth) / 2;
        const y = baseline - barHeight;

        return (
          <g key={point.month}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, point.count > 0 ? 2 : 0)}
              rx="3"
              fill="var(--con-accent)"
              opacity={isLast ? 1 : 0.3}
            >
              <title>{`${point.label}: ${point.count}`}</title>
            </rect>
            {isLast && point.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                fill="var(--con-accent)"
              >
                {point.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={baseline + 18}
              textAnchor="middle"
              fontSize="10"
              fontFamily="Raleway, sans-serif"
              fontWeight={isLast ? 600 : 400}
              fill={isLast ? "var(--con-ink)" : "var(--con-ink-3)"}
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Inline detail panel ──────────────────────────────────────
   Renders the full record list behind a ladder card, in place — this is
   what replaces navigating to a separate page like /dashboard/all. Each
   row opens the console-styled expert profile; the panel itself never
   leaves the home page. */
const PANEL_META = {
  today: { title: "Registered today", empty: "No experts registered yet today." },
  updated: { title: "CVs updated", empty: "No CVs have been updated yet." },
  outdated: {
    title: "CVs over 12 months old",
    empty: "Every CV is up to date.",
  },
  activity: { title: "Recent activity", empty: "No activity recorded yet." },
};

const ExpertDetailPanel = ({ panel, experts, loading, onClose, onOpenExpert }) => {
  const meta = PANEL_META[panel];

  return (
    <div className="con-card con-detail-panel">
      <div className="con-card-head">
        <h3>{meta.title}</h3>
        <span className="con-pill con-num">{experts.length}</span>
        <span className="con-spacer" />
        <button className="con-btn con-btn-quiet" onClick={onClose}>
          <FiX size={14} />
          Close
        </button>
      </div>

      {loading ? (
        <div className="con-card-body">
          <div className="con-skeleton" style={{ height: 180 }} />
        </div>
      ) : experts.length === 0 ? (
        <div className="con-empty">{meta.empty}</div>
      ) : (
        <div className="con-queue con-detail-scroll">
          {experts.map((expert) => (
            <button
              key={expert.id}
              className="con-qrow"
              onClick={() => onOpenExpert(expert.id)}
            >
              <span className="con-qav">{initialsOf(expert.first_name, expert.last_name)}</span>
              <span className="con-qmeta">
                <b>
                  {expert.first_name} {expert.last_name}
                </b>
                <small>
                  {[expert.expertise_area, expert.country].filter(Boolean).join(" · ") ||
                    "No sector recorded"}
                </small>
              </span>
              {panel === "outdated" && expert.months_stale != null && (
                <span className={`con-pill ${severityOf(expert.months_stale)} con-num`}>
                  {expert.months_stale} mo
                </span>
              )}
              {(panel === "today" || panel === "updated") && (
                <span className="con-num" style={{ color: "var(--con-ink-3)", fontSize: "12px" }}>
                  {relativeTime(panel === "today" ? expert.created_at : expert.updated_at)}
                </span>
              )}
              {panel === "activity" && (
                <span className="con-num" style={{ color: "var(--con-ink-3)", fontSize: "12px" }}>
                  {relativeTime(expert.updated_at || expert.created_at)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ConsoleHomePage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("month");
  const [stats, setStats] = useState(null);
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which inline detail panel is open, if any. Cards toggle this instead of
  // navigating away — the operator stays on the home page and this shell.
  const [openPanel, setOpenPanel] = useState(null);
  const togglePanel = (key) => setOpenPanel((current) => (current === key ? null : key));

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, expertsRes] = await Promise.all([
          protectedApiClient.get("/api/v1/experts/stats/"),
          protectedApiClient.get("/api/v1/experts/"),
        ]);
        if (cancelled) return;

        setStats(statsRes.data || {});
        const list = Array.isArray(expertsRes.data)
          ? expertsRes.data
          : expertsRes.data?.results || [];
        setExperts(list);
      } catch (err) {
        if (cancelled) return;
        setError("Could not load dashboard data. Refresh to try again.");
        console.error("Console home fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeRange = RANGES.find((r) => r.key === range) || RANGES[2];
  const heroValue = stats?.[activeRange.field] ?? 0;

  const monthly = stats?.monthly_registrations || [];
  const sparkPoints = monthly.map((m) => m.count);

  // Month-over-month delta only makes sense on the month range.
  const delta = useMemo(() => {
    if (range !== "month" || !stats) return null;
    const prev = stats.registered_prev_month ?? 0;
    const current = stats.registered_this_month ?? 0;
    if (prev === 0) return current > 0 ? { dir: "up", value: "new" } : null;
    const pct = ((current - prev) / prev) * 100;
    return {
      dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat",
      value: `${Math.abs(pct).toFixed(1)}%`,
      prev,
    };
  }, [range, stats]);

  const outdated = stats?.outdated_cv_preview || [];

  /* Same day-boundary logic as stats.registered_today on the backend, run
     client-side over the list already loaded — no extra request, and the
     count always matches the "New today" figure above it. */
  const newToday = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return experts
      .filter((e) => e.created_at && new Date(e.created_at) >= startOfToday)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [experts]);

  /* Mirrors stats.updated_count: touched after creation, not just created. */
  const recentlyUpdated = useMemo(() => {
    return experts
      .filter((e) => {
        if (!e.created_at || !e.updated_at) return false;
        return new Date(e.updated_at) - new Date(e.created_at) > 60000;
      })
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }, [experts]);

  /* Full outdated list, not just the 5-row stats.outdated_cv_preview.
     Mirrors the backend's own 12-month stale cutoff, computed over the
     expert list already loaded — no second request. */
  const outdatedFull = useMemo(() => {
    const staleCutoff = new Date();
    staleCutoff.setMonth(staleCutoff.getMonth() - 12);
    return experts
      .filter((e) => e.updated_at && new Date(e.updated_at) < staleCutoff)
      .map((e) => {
        const then = new Date(e.updated_at);
        const now = new Date();
        const months =
          (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
        return { ...e, months_stale: Math.max(0, months) };
      })
      .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
  }, [experts]);

  /* Recent activity, derived from the expert list: an expert that has been
     touched since creation reads as an update, otherwise a registration. */
  const activity = useMemo(() => {
    return [...experts]
      .map((expert) => {
        const created = expert.created_at ? new Date(expert.created_at) : null;
        const updated = expert.updated_at ? new Date(expert.updated_at) : null;
        const wasUpdated =
          created && updated && updated.getTime() - created.getTime() > 60000;
        return {
          id: expert.id,
          kind: wasUpdated ? "updated" : "created",
          name: `${expert.first_name || ""} ${expert.last_name || ""}`.trim() || "Unnamed expert",
          at: wasUpdated ? updated : created,
        };
      })
      .filter((row) => row.at)
      .sort((a, b) => b.at - a.at);
  }, [experts]);

  // Table above only ever shows the first 5; "View all" opens the full list.
  const activityPreview = activity.slice(0, 5);

  /* Same ordering as `activity`, but carrying full expert records so the
     "View all" panel can reuse ExpertDetailPanel's expert-row rendering. */
  const activityFull = useMemo(() => {
    const orderById = new Map(activity.map((row, i) => [row.id, i]));
    return [...experts]
      .filter((e) => orderById.has(e.id))
      .sort((a, b) => orderById.get(a.id) - orderById.get(b.id));
  }, [experts, activity]);

  const firstName = localStorage.getItem("userFirstName") || "there";
  const greeting = greetingFor(new Date().getHours());

  if (error) {
    return (
      <div className="con-canvas">
        <div className="con-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="con-canvas">
      {/* ── Greeting + range ── */}
      <div className="con-greeting">
        <div>
          <h2>
            {greeting}, {firstName}
          </h2>
          <p>
            {loading
              ? "Loading your database…"
              : `${(stats?.total_experts ?? 0).toLocaleString()} experts on file`}
          </p>
        </div>
        <div className="con-seg" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              className={range === r.key ? "on" : ""}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Priority ladder ── */}
      <div className="con-ladder">
        <div className="con-card con-hero">
          <div>
            <div className="con-eyebrow">{RANGE_CAPTION[range]}</div>
            <div className="con-hero-figure">
              <b className="con-num">{loading ? "—" : heroValue.toLocaleString()}</b>
              {delta && (
                <span className={`con-delta ${delta.dir}`}>
                  {delta.dir === "up" && <FiArrowUp size={12} />}
                  {delta.dir === "down" && <FiArrowDown size={12} />}
                  {delta.value}
                </span>
              )}
            </div>
          </div>

          <Sparkline points={sparkPoints} />

          <div className="con-hero-foot">
            {delta?.prev != null && <span>vs. {delta.prev} last month</span>}
            {delta?.prev != null && <span style={{ color: "var(--con-ink-3)" }}>·</span>}
            <span>{(stats?.registered_this_year ?? 0).toLocaleString()} this year</span>
          </div>
        </div>

        <div className="con-stat-stack">
          <button
            className={`con-card con-stat${openPanel === "today" ? " open" : ""}`}
            onClick={() => togglePanel("today")}
            aria-expanded={openPanel === "today"}
          >
            <span className="con-stat-glyph good">
              <FiPlus />
            </span>
            <span>
              <b className="con-num">{loading ? "—" : stats?.registered_today ?? 0}</b>
              <small>New today</small>
            </span>
            <span className="con-stat-go">
              <FiChevronDown size={16} />
            </span>
          </button>

          <button
            className={`con-card con-stat${openPanel === "updated" ? " open" : ""}`}
            onClick={() => togglePanel("updated")}
            aria-expanded={openPanel === "updated"}
          >
            <span className="con-stat-glyph">
              <FiRefreshCw />
            </span>
            <span>
              <b className="con-num">{loading ? "—" : stats?.updated_count ?? 0}</b>
              <small>CVs updated</small>
            </span>
            <span className="con-stat-go">
              <FiChevronDown size={16} />
            </span>
          </button>

          <button
            className={`con-card con-stat${openPanel === "outdated" ? " open" : ""}`}
            onClick={() => togglePanel("outdated")}
            aria-expanded={openPanel === "outdated"}
          >
            <span className="con-stat-glyph warn">
              <FiClock />
            </span>
            <span>
              <b className="con-num">{loading ? "—" : stats?.outdated_cv_count ?? 0}</b>
              <small>CVs over 12 months old</small>
            </span>
            <span className="con-stat-go">
              <FiChevronDown size={16} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Inline detail panel ──────────────────────────────────
          Opened by a ladder card above. Replaces the old behaviour of
          navigating to a separate (differently-styled) page — the operator
          never leaves this screen. */}
      {openPanel && (
        <ExpertDetailPanel
          panel={openPanel}
          experts={
            openPanel === "today"
              ? newToday
              : openPanel === "updated"
              ? recentlyUpdated
              : openPanel === "activity"
              ? activityFull
              : outdatedFull
          }
          loading={loading}
          onClose={() => setOpenPanel(null)}
          onOpenExpert={(id) => navigate(`/dashboard/experts/${id}`)}
        />
      )}

      {/* ── Trend + queue ── */}
      <div className="con-split">
        <div className="con-card">
          <div className="con-card-head">
            <h3>Registration trend</h3>
            <span className="con-spacer" />
            <span className="con-eyebrow">Last 12 months</span>
          </div>
          <div className="con-chart-shell">
            {loading ? (
              <div className="con-skeleton" style={{ height: 224, margin: "8px" }} />
            ) : (
              <TrendChart series={monthly} />
            )}
          </div>
          <div className="con-legend">
            <span>
              <i className="con-swatch" /> Current month
            </span>
            <span>
              <i className="con-swatch muted" /> Prior months
            </span>
          </div>
        </div>

        <div className="con-card">
          <div className="con-card-head">
            <h3>Needs attention</h3>
            <span className="con-spacer" />
            {!loading && (stats?.outdated_cv_count ?? 0) > 0 && (
              <span className="con-pill mid con-num">{stats.outdated_cv_count} open</span>
            )}
          </div>
          <div className="con-card-body" style={{ paddingBottom: 6 }}>
            <p style={{ margin: 0, fontSize: "12.5px", color: "var(--con-ink-2)" }}>
              Experts whose CV has not been refreshed in over a year.
            </p>
          </div>

          {loading ? (
            <div className="con-card-body">
              <div className="con-skeleton" style={{ height: 180 }} />
            </div>
          ) : outdated.length === 0 ? (
            <div className="con-empty">Every CV is up to date.</div>
          ) : (
            <>
              <div className="con-queue">
                {outdated.map((expert) => {
                  const severity = severityOf(expert.months_stale);
                  return (
                    <button
                      key={expert.id}
                      className={`con-qrow sev-${severity}`}
                      onClick={() => navigate(`/dashboard/experts/${expert.id}`)}
                    >
                      <span className="con-qav">
                        {initialsOf(expert.first_name, expert.last_name)}
                      </span>
                      <span className="con-qmeta">
                        <b>
                          {expert.first_name} {expert.last_name}
                        </b>
                        <small>
                          {[expert.expertise_area, expert.country].filter(Boolean).join(" · ") ||
                            "No sector recorded"}
                        </small>
                      </span>
                      <span className={`con-pill ${severity} con-num`}>
                        {expert.months_stale} mo
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="con-card-foot">
                <a
                  className="con-textlink"
                  onClick={() => togglePanel("outdated")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && togglePanel("outdated")}
                >
                  Review all {stats?.outdated_cv_count ?? 0}
                  <FiChevronRight size={13} />
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="con-card">
        <div className="con-card-head" style={{ paddingBottom: 12 }}>
          <h3>Recent activity</h3>
          <span className="con-spacer" />
          {/* Same click surfaces the full record list inline — the current
              table above is already capped to the 5 most recent rows. */}
          <button className="con-btn con-btn-quiet" onClick={() => togglePanel("activity")}>
            <FiFilter size={14} />
            View all
          </button>
        </div>

        {loading ? (
          <div className="con-card-body">
            <div className="con-skeleton" style={{ height: 160 }} />
          </div>
        ) : activityPreview.length === 0 ? (
          <div className="con-empty">No activity recorded yet.</div>
        ) : (
          <div className="con-table-scroll">
            <table className="con-table">
              <thead>
                <tr>
                  <th style={{ width: "28%" }}>Action</th>
                  <th style={{ width: "42%" }}>Expert</th>
                  <th style={{ width: "30%" }}>When</th>
                </tr>
              </thead>
              <tbody>
                {activityPreview.map((row) => (
                  <tr key={`${row.kind}-${row.id}`}>
                    <td>
                      <span className={`con-tag ${row.kind}`}>
                        <i />
                        {row.kind === "updated" ? "CV updated" : "Registered"}
                      </span>
                    </td>
                    <td>
                      <span className="name">{row.name}</span>
                    </td>
                    <td className="when">{relativeTime(row.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Analytics (merged in from the retired /dashboard/analytics) ── */}
      <AnalyticsPanel experts={experts} loading={loading} scope="system" />
    </div>
  );
}
