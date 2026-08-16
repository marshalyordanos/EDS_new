import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiAlertCircle,
  FiX,
  FiChevronRight,
  FiEdit3,
  FiTarget,
} from "react-icons/fi";

/**
 * CV completeness tracker.
 *
 * The backend scores every expert against a weighted checklist and returns the
 * result as `expert.cv_completeness`. This module renders the two halves of
 * that: a compact ring for lists, and a drill-down panel answering "what is
 * actually missing?" when the ring is clicked.
 *
 * Both read the same payload — nothing is recomputed here, so a badge in
 * search can never disagree with the score on the profile page.
 */

/* Mirrors completeness.COMPLETE_AT / PARTIAL_AT on the backend. Used only to
   pick a colour when a payload predates the `status` field; the backend's own
   `status` wins whenever it is present. */
const COMPLETE_AT = 85;
const PARTIAL_AT = 40;

const statusOf = (report) => {
  if (!report) return "unknown";
  if (report.status) return report.status;
  const percent = report.percent ?? 0;
  if (percent >= COMPLETE_AT) return "complete";
  if (percent >= PARTIAL_AT) return "partial";
  return "incomplete";
};

const STATUS_LABEL = {
  complete: "Complete",
  partial: "Partly filled",
  incomplete: "Incomplete",
  unknown: "Not scored",
};

/* ── Ring ──────────────────────────────────────────────────────
   An SVG arc rather than a bar: at list density a ring reads as a single
   glyph and keeps the number legible in the middle. */
export const CompletenessRing = ({
  report,
  size = 38,
  onClick,
  title,
}) => {
  const percent = Math.max(0, Math.min(100, report?.percent ?? 0));
  const status = statusOf(report);

  const stroke = size <= 30 ? 3 : 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (percent / 100) * circumference;

  const label =
    title ||
    `CV ${percent}% complete — ${report?.missing_count ?? 0} field${
      report?.missing_count === 1 ? "" : "s"
    } missing`;

  const content = (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="cvc-ring-track"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        className="cvc-ring-arc"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        /* Start the arc at 12 o'clock instead of 3. */
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        className="cvc-ring-num"
        dominantBaseline="central"
        textAnchor="middle"
        style={{ fontSize: size <= 30 ? 9.5 : 11 }}
      >
        {percent}
      </text>
    </svg>
  );

  if (!onClick) {
    return (
      <span className={`cvc-ring is-${status}`} title={label} aria-label={label}>
        {content}
      </span>
    );
  }

  return (
    <span
      className={`cvc-ring is-${status} clickable`}
      title={`${label} — click for the breakdown`}
      aria-label={`${label}. Show breakdown.`}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        // Rows are themselves buttons; keep the click from selecting the row.
        e.stopPropagation();
        e.preventDefault();
        onClick(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          onClick(e);
        }
      }}
    >
      {content}
    </span>
  );
};

/* ── Inline bar ────────────────────────────────────────────────
   For places with horizontal room, where a labelled bar reads better
   than a ring (profile header, drill-down summary). */
export const CompletenessBar = ({ report, showLabel = true }) => {
  const percent = Math.max(0, Math.min(100, report?.percent ?? 0));
  const status = statusOf(report);

  return (
    <div className={`cvc-bar-wrap is-${status}`}>
      {showLabel && (
        <div className="cvc-bar-head">
          <span className="cvc-bar-pct">{percent}%</span>
          <span className="cvc-bar-status">{STATUS_LABEL[status]}</span>
        </div>
      )}
      <div className="cvc-bar-track">
        <i style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

/* ── Drill-down panel ──────────────────────────────────────────
   Every section is listed, complete ones included: seeing "Education 4/4 ✓"
   is what makes the missing rows below it trustworthy. Sections are ordered
   by how much score they would recover, so the top of the list is also the
   most useful thing to go and fix. */
export const CompletenessDetail = ({ expert, report, onClose }) => {
  const navigate = useNavigate();

  const sections = useMemo(() => {
    const list = report?.sections || [];
    // Lost points = the share of the section's weight not yet earned. This
    // ranks a half-filled heavy section above an empty light one.
    return [...list].sort((a, b) => {
      const lost = (s) => ((100 - (s.percent ?? 0)) / 100) * (s.weight ?? 0);
      return lost(b) - lost(a);
    });
  }, [report]);

  if (!report) return null;

  const percent = report.percent ?? 0;
  const status = statusOf(report);
  const name = `${expert?.first_name || ""} ${expert?.last_name || ""}`.trim();

  const goEdit = () => {
    if (expert?.id) navigate(`/dashboard/experts/edit/${expert.id}`);
  };

  return createPortal(
    <div
      className="cvc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="CV completeness breakdown"
      onClick={onClose}
    >
      <div className="cvc-modal" onClick={(e) => e.stopPropagation()}>
        <header className="cvc-modal-head">
          <div className="cvc-modal-title">
            <CompletenessRing report={report} size={52} />
            <div>
              <h3>{name || "This expert"}</h3>
              <p>
                <span className={`cvc-pill is-${status}`}>{STATUS_LABEL[status]}</span>
                {report.filled}/{report.total} checks passed ·{" "}
                {report.missing_count} still missing
              </p>
            </div>
          </div>
          <button className="cvc-modal-close" onClick={onClose} aria-label="Close breakdown">
            <FiX size={16} />
          </button>
        </header>

        {report.next_steps?.length > 0 && (
          <div className="cvc-next">
            <div className="cvc-next-head">
              <FiTarget size={13} />
              Fix these first — they move the score most
            </div>
            <ol className="cvc-next-list">
              {report.next_steps.map((step) => (
                <li key={`${step.section_key}-${step.label}`}>
                  <span className="cvc-next-label">{step.label}</span>
                  <span className="cvc-next-hint">{step.hint}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="cvc-modal-body">
          {sections.map((section) => {
            const done = section.percent >= 100;
            return (
              <section
                key={section.key}
                className={`cvc-sec${done ? " is-done" : ""}`}
              >
                <div className="cvc-sec-head">
                  <span className="cvc-sec-icon">
                    {done ? <FiCheck size={13} /> : <FiAlertCircle size={13} />}
                  </span>
                  <span className="cvc-sec-name">{section.label}</span>
                  <span className="cvc-sec-count">
                    {section.filled}/{section.total}
                  </span>
                  {/* Weight is shown so it is obvious why a small gap in one
                      section costs more than a large gap in another. */}
                  <span className="cvc-sec-weight" title="Share of the total score">
                    {section.weight}%
                  </span>
                </div>

                <div className="cvc-sec-track">
                  <i style={{ width: `${section.percent}%` }} />
                </div>

                {section.missing?.length > 0 && (
                  <ul className="cvc-miss">
                    {section.missing.map((item) => (
                      <li key={item.key}>
                        <FiChevronRight size={11} />
                        <span className="cvc-miss-label">{item.label}</span>
                        <span className="cvc-miss-hint">{item.hint}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <footer className="cvc-modal-foot">
          <span className="cvc-foot-note">
            {percent >= COMPLETE_AT
              ? "This record is search-ready."
              : "Filling the gaps above makes this expert easier to match to work."}
          </span>
          {expert?.id && (
            <button className="cvc-btn-primary" onClick={goEdit}>
              <FiEdit3 size={13} />
              Complete this CV
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
};

/* Ring + panel wired together — the common case for a list row. */
const CvCompleteness = ({ expert, size = 38 }) => {
  const [open, setOpen] = useState(false);
  const report = expert?.cv_completeness;

  if (!report) return null;

  return (
    <>
      <CompletenessRing report={report} size={size} onClick={() => setOpen(true)} />
      {open && (
        <CompletenessDetail
          expert={expert}
          report={report}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default CvCompleteness;
