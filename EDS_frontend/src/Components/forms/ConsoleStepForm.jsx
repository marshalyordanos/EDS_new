import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form } from "antd";
import { FiCheck } from "react-icons/fi";
import "../../styles/console.css";

/* Count how many of a step's declared fields currently hold a value, so
   progress can be reported in fields rather than in steps. */
const countFilled = (values, fields = []) => {
  let total = 0;
  let filled = 0;

  fields.forEach((field) => {
    const path = Array.isArray(field) ? field : [field];
    let node = values;
    for (const key of path) {
      node = node?.[key];
      if (node === undefined) break;
    }

    // Repeatable sections count each entry's populated keys.
    if (Array.isArray(node)) {
      node.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        const keys = Object.keys(entry);
        total += keys.length;
        filled += keys.filter((k) => {
          const v = entry[k];
          return v !== undefined && v !== null && v !== "";
        }).length;
      });
      if (node.length === 0) total += 1;
      return;
    }

    total += 1;
    if (node !== undefined && node !== null && node !== "") filled += 1;
  });

  return { total, filled };
};

/* A step is "done" once every required-ish field it declares has a value. */
const stepStatus = (values, step, index, current) => {
  const { total, filled } = countFilled(values, step.fields);
  if (index === current) return "now";
  if (total > 0 && filled >= total) return "done";
  if (filled > 0) return "partial";
  return "pending";
};

const ConsoleStepForm = ({
  form,
  steps,
  onSubmit,
  onStep1Next,
  isStep1Submitting,
  isSubmitting,
  submitButtonText = "Register",
  title = "Build CV",
  preview,
  // Persists whatever has been filled in so far and returns true on success.
  // Only offered once step 1 has run (an expert record exists to attach a
  // draft to) — see hasRecord below.
  onSaveDraft,
  isSavingDraft,
  hasRecord = false,
  // Where "Save & finish later" and a successful draft save send the user.
  finishLaterTo = "/dashboard/search",
}) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [visited, setVisited] = useState({ 0: true });

  // Subscribe to form values so the stepper and preview update as you type.
  const watched = Form.useWatch([], form);
  const values = useMemo(() => watched || {}, [watched]);

  const progress = useMemo(() => {
    let total = 0;
    let filled = 0;
    steps.forEach((step) => {
      const c = countFilled(values, step.fields);
      total += c.total;
      filled += c.filled;
    });
    return { total, filled, pct: total ? Math.round((filled / total) * 100) : 0 };
  }, [values, steps]);

  const goNext = async () => {
    try {
      const stepValues = await form.validateFields(steps[current].fields);
      if (current === 0 && onStep1Next) {
        const ok = await onStep1Next(stepValues);
        if (!ok) return;
      }
      const next = current + 1;
      setCurrent(next);
      setVisited((v) => ({ ...v, [next]: true }));
    } catch {
      // Ant Design surfaces the field errors itself.
    }
  };

  const isLast = current === steps.length - 1;

  const handleSaveDraft = async () => {
    if (!onSaveDraft) {
      // No draft handler wired up (e.g. this step form isn't attached to a
      // record yet) — nothing to persist, so don't pretend otherwise.
      navigate(finishLaterTo);
      return;
    }
    // Save whatever is currently in the form without requiring full-step
    // validation — a draft is allowed to be incomplete by definition.
    const saved = await onSaveDraft(form.getFieldsValue(true));
    if (saved) navigate(finishLaterTo);
  };

  return (
    <div className={`con-bcv${preview ? "" : " no-preview"}`}>
      {/* ── Stepper ── */}
      <aside className="con-stepper">
        <div className="con-stepper-head">
          <h3>{title}</h3>
          <p>
            {[values.firstName, values.lastName].filter(Boolean).join(" ") ||
              "New expert"}
          </p>
        </div>

        <div className="con-prog-wrap">
          <div className="con-prog">
            <i style={{ width: `${progress.pct}%` }} />
          </div>
          <div className="con-prog-txt">
            {progress.filled} of {progress.total} fields
          </div>
        </div>

        <div className="con-steps">
          {steps.map((step, index) => {
            const status = stepStatus(values, step, index, current);
            const counts = countFilled(values, step.fields);
            return (
              <button
                key={step.title}
                className={`con-step ${status}`}
                // Only let the operator jump to steps they've already reached,
                // so step 1 still creates the expert before the rest run.
                onClick={() => visited[index] && setCurrent(index)}
                disabled={!visited[index]}
                style={!visited[index] ? { cursor: "default" } : undefined}
              >
                <span className="con-step-dot">
                  {status === "done" ? <FiCheck size={11} /> : index + 1}
                </span>
                <span className="con-step-txt">
                  <b>{step.title}</b>
                  <small>
                    {status === "done"
                      ? "Complete"
                      : status === "now"
                      ? "In progress"
                      : counts.filled > 0
                      ? `${counts.filled} of ${counts.total}`
                      : step.optional
                      ? "Optional"
                      : "Not started"}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Form ── */}
      <section className="con-bcv-form">
        <div className="con-bcv-formhead">
          <h2>{steps[current].title}</h2>
          {steps[current].description && <p>{steps[current].description}</p>}
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className="con-bcv-form"
          style={{ minHeight: 0, flex: 1 }}
          initialValues={{ education: [{}], experience: [{}], research_experience: [{}] }}
        >
          <div className="con-bcv-body">
            {steps.map((step, index) => (
              <div
                key={step.title}
                style={{ display: index === current ? "block" : "none" }}
              >
                {typeof step.content === "function" ? step.content() : step.content}
              </div>
            ))}
          </div>

          <div className="con-bcv-foot">
            {current > 0 && (
              <button
                type="button"
                className="con-btn con-btn-quiet"
                onClick={() => setCurrent(current - 1)}
              >
                Back
              </button>
            )}
            <span className="sp" />
            {hasRecord && (
              <button
                type="button"
                className="con-btn con-btn-ghost"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                title="Save what you've entered so far and continue later"
              >
                {isSavingDraft ? "Saving…" : "Save & finish later"}
              </button>
            )}
            {isLast ? (
              <button
                type="submit"
                className="con-btn con-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving…" : submitButtonText}
              </button>
            ) : (
              <button
                type="button"
                className="con-btn con-btn-primary"
                onClick={goNext}
                disabled={current === 0 && isStep1Submitting}
              >
                {current === 0 && isStep1Submitting
                  ? "Creating…"
                  : `Continue to ${steps[current + 1].title}`}
              </button>
            )}
          </div>
        </Form>
      </section>

      {/* ── Live preview ── */}
      {preview && (
        <aside className="con-pv-live">
          <div className="con-pv-livehead">
            <h4>Live preview</h4>
            <span className="con-live-dot">
              <i />
              updating
            </span>
          </div>
          <div className="con-paper-scroll">{preview(values)}</div>
        </aside>
      )}
    </div>
  );
};

export default ConsoleStepForm;
