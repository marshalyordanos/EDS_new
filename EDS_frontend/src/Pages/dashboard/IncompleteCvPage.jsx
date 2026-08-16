import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit3, FiFilter } from "react-icons/fi";
import { getExpertsWithIncompleteCv } from "../../services/expertService";
import PageHeader from "../../Components/shared/PageHeader";
import {
  CompletenessRing,
  CompletenessDetail,
} from "../../Components/dashboard/CvCompleteness";
import { Pagination, Spin, Alert } from "antd";
import "../../styles/console.css";

/**
 * Every expert whose weighted CV score is below the completeness threshold,
 * emptiest first — a work queue, not a report. Each row shows how complete the
 * record is and what the next most valuable thing to fill in would be; the
 * score opens the full breakdown.
 *
 * The threshold buttons narrow the queue: "under 40%" is the triage list,
 * the default shows everything that is not yet complete.
 */

const THRESHOLDS = [
  { value: undefined, label: "All incomplete" },
  { value: 40, label: "Under 40%" },
  { value: 70, label: "Under 70%" },
];

const IncompleteCvPage = () => {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [threshold, setThreshold] = useState(undefined);
  const [breakdownFor, setBreakdownFor] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getExpertsWithIncompleteCv(currentPage, threshold)
      .then((data) => {
        if (cancelled) return;
        setExperts(data.results || []);
        setTotal(data.count || 0);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not load incomplete records. Refresh to try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, threshold]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="dashboard-loading">
          <Spin size="large" />
          <p className="dashboard-meta">Loading incomplete records...</p>
        </div>
      );
    }
    if (error) {
      return <Alert message="Error" description={error} type="error" showIcon />;
    }
    if (experts.length === 0) {
      return (
        <div className="dashboard-empty">
          <div className="dashboard-empty-title">Nothing left in progress</div>
          <div className="dashboard-empty-description">
            Every expert in this view meets the completeness threshold.
          </div>
        </div>
      );
    }

    return (
      <div className="con-rows">
        {experts.map((expert) => {
          const report = expert.cv_completeness;
          const next = report?.next_steps?.[0];
          const name =
            `${expert.first_name || ""} ${expert.last_name || ""}`.trim() ||
            "Unnamed record";

          return (
            <div className="con-row cvq-row" key={expert.id}>
              <CompletenessRing
                report={report}
                size={40}
                onClick={() => setBreakdownFor(expert)}
              />

              <div className="con-row-body">
                <span className="con-row-name">
                  {name}
                  {expert.code && <span className="con-row-code">{expert.code}</span>}
                </span>
                <span className="con-row-meta">
                  {[expert.expertise_area, expert.country]
                    .filter(Boolean)
                    .join(" · ") || "No sector recorded"}
                </span>
                {next && (
                  <span className="cvq-next">
                    Next: <b>{next.label}</b> — {next.hint}
                  </span>
                )}
              </div>

              <div className="cvq-acts">
                {report && (
                  <button
                    className="con-btn con-btn-quiet"
                    onClick={() => setBreakdownFor(expert)}
                  >
                    {report.missing_count} missing
                  </button>
                )}
                <button
                  className="con-btn con-btn-primary"
                  onClick={() => navigate(`/dashboard/experts/edit/${expert.id}`)}
                >
                  <FiEdit3 size={13} />
                  Complete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        <PageHeader
          title="Incomplete CVs"
          description="Records scored against the full CV checklist, emptiest first. Open a score to see exactly which fields are missing."
        />

        <div className="cvq-filterbar">
          <span className="cvq-filterlabel">
            <FiFilter size={12} />
            Show
          </span>
          {THRESHOLDS.map((option) => (
            <button
              key={option.label}
              className={`con-qualdot${threshold === option.value ? " active" : ""}`}
              onClick={() => {
                setThreshold(option.value);
                setCurrentPage(1);
              }}
            >
              {option.label}
            </button>
          ))}
          {!isLoading && (
            <span className="cvq-tally">
              {total} record{total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="dashboard-card mt-6">{renderContent()}</div>

        <div className="flex justify-center mt-8">
          {!isLoading && total > 0 && (
            <Pagination
              current={currentPage}
              total={total}
              pageSize={10}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          )}
        </div>
      </div>

      {breakdownFor && (
        <CompletenessDetail
          expert={breakdownFor}
          report={breakdownFor.cv_completeness}
          onClose={() => setBreakdownFor(null)}
        />
      )}
    </div>
  );
};

export default IncompleteCvPage;
