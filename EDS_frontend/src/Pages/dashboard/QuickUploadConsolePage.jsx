import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Select } from "antd";
import {
  FiUploadCloud,
  FiFileText,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { createExpert, parseCv } from "../../services/expertService";
import {
  expertiseOptions,
  countryOptions,
  nationalityOptions,
} from "../../constants/searchTaxonomy";
import protectedApiClient from "../../api/axios";
import "../../styles/console.css";

const ACCEPTED = ".pdf,.docx";
const MAX_MB = 10;

const LANGUAGE_LEVEL = { 4: "Excellent", 3: "Very good", 2: "Average", 1: "Basic" };

const prettyBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CV_LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Amharic", label: "Amharic" },
];

const splitList = (value) =>
  (value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

/* Resolve a parsed string to a real option, case-insensitively. Returns ""
   when there's no match, so a Select never holds a value it can't display. */
const matchOption = (options, raw) => {
  const needle = (raw || "").trim().toLowerCase();
  if (!needle) return "";
  return options.find((o) => o.value.toLowerCase() === needle)?.value || "";
};

/* Label with a provenance marker: extracted from the CV, or still needed. */
const FieldLabel = ({ children, required, extracted }) => (
  <label>
    {children}
    {required && <span className="con-req">*</span>}
    {extracted ? (
      <span className="con-from-cv">
        <FiCheck size={9} />
        from CV
      </span>
    ) : (
      <span className="con-missing">add</span>
    )}
  </label>
);

export default function QuickUploadConsolePage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [values, setValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    nationality: "",
    country: "",
    cv_language: "",
    year_of_experience: "",
  });
  const [expertise, setExpertise] = useState([]);

  const extracted = parsed?.extracted || [];
  const wasExtracted = (key) => extracted.includes(key);

  const setValue = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleFile = async (picked) => {
    if (!picked) return;

    const ext = picked.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext)) {
      message.error("That file type isn't supported. Upload a PDF, DOC, or DOCX.");
      return;
    }
    if (picked.size > MAX_MB * 1024 * 1024) {
      message.error(`That file is over ${MAX_MB} MB. Upload a smaller one.`);
      return;
    }

    setFile(picked);
    setParsing(true);
    setParsed(null);

    const form = new FormData();
    form.append("cv_file", picked);

    try {
      const data = await parseCv(form);
      setParsed(data);

      const f = data.fields || {};
      // The parser's "country" is often really a nationality ("Ethiopian"),
      // so route each value to whichever list it actually belongs in.
      const raw = (f.country || "").trim();
      const asCountry = matchOption(countryOptions, raw);
      const asNationality = matchOption(nationalityOptions, raw);

      setValues({
        first_name: f.first_name || "",
        last_name: f.last_name || "",
        email: f.email || "",
        nationality: asCountry ? "" : asNationality,
        country: asCountry,
        cv_language: matchOption(CV_LANGUAGES, f.cv_language),
        year_of_experience: "",
      });
      setExpertise(splitList(f.expertise_area));

      message.success(`Read ${data.extracted_count} fields from the CV.`);
    } catch {
      // Parsing failed, but the operator can still fill everything by hand.
      setParsed({ fields: {}, extracted: [], extracted_count: 0, failed: true });
      message.warning("Couldn't read that CV automatically. Fill the details in below.");
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setExpertise([]);
    setValues({
      first_name: "",
      last_name: "",
      email: "",
      nationality: "",
      country: "",
      cv_language: "",
      year_of_experience: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* Required fields mirror the original form's validation rules. */
  const missing = useMemo(() => {
    const gaps = [];
    if (!values.first_name.trim()) gaps.push("First name");
    if (!values.last_name.trim()) gaps.push("Last name");
    if (!values.email.trim()) gaps.push("Email");
    if (!expertise.length) gaps.push("Areas of expertise");
    if (!String(values.year_of_experience).trim()) gaps.push("Years of experience");
    return gaps;
  }, [values, expertise]);

  const canSubmit = file && !parsing && missing.length === 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const expert = await createExpert({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        email: values.email.trim(),
        expertise_area: expertise.join(", "),
        nationality: values.nationality || "",
        country: values.country || "",
        cv_language: values.cv_language || "English",
        year_of_experience: Number(values.year_of_experience) || 0,
        registered_by: localStorage.getItem("userId"),
      });

      const cvForm = new FormData();
      cvForm.append("cv_file", file);
      cvForm.append("expert_id", expert.id);

      // Unformatted for now: the file is attached to the record without
      // running the parser's save path.
      await protectedApiClient.patch(`/api/v1/experts/${expert.id}/`, cvForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Expert registered.");
      navigate("/dashboard/all");
    } catch (error) {
      const detail =
        error.response?.data?.email?.[0] ||
        error.response?.data?.error ||
        "Could not register that expert. Check the details and try again.";
      message.error(detail);
      console.error("Quick upload failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const phase = !file ? 0 : parsing || !parsed ? 1 : 1;

  return (
    <div className="con-qu">
      <div className="con-qu-col">
        <div className="con-qu-head">
          <h2>Add an expert from their CV</h2>
          <p>Drop the document first — we read the details out of it, then you confirm.</p>
        </div>

        {/* ── Phases ── */}
        <div className="con-phases">
          <div className={`con-phase${file ? " done" : " now"}`}>
            <span className="con-phase-dot">{file ? <FiCheck size={11} /> : "1"}</span>
            <span className="con-phase-txt">Upload</span>
          </div>
          <span className={`con-phase-line${file ? " done" : ""}`} />
          <div className={`con-phase${phase === 1 && file ? " now" : ""}`}>
            <span className="con-phase-dot">2</span>
            <span className="con-phase-txt">Review extracted</span>
          </div>
          <span className="con-phase-line" />
          <div className="con-phase">
            <span className="con-phase-dot">3</span>
            <span className="con-phase-txt">Saved</span>
          </div>
        </div>

        {/* ── Dropzone or file chip ── */}
        {!file ? (
          <div
            className={`con-drop${dragging ? " dragging" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <span className="con-drop-icon">
              <FiUploadCloud size={24} />
            </span>
            <h3>Drop a CV here</h3>
            <p>or click to choose a file from your computer</p>
            <span className="formats">PDF, DOC, DOCX · up to {MAX_MB} MB</span>
          </div>
        ) : (
          <div className="con-card" style={{ marginBottom: 16 }}>
            <div className="con-filerow">
              <div className="con-filechip">
                <span className="con-filechip-icon">
                  <FiFileText size={16} />
                </span>
                <div className="con-filechip-meta">
                  <b>{file.name}</b>
                  <small>
                    {prettyBytes(file.size)}
                    {parsing ? " · reading…" : parsed?.failed ? " · not readable" : " · parsed"}
                  </small>
                  <div className="con-bar">
                    <i style={{ width: parsing ? "60%" : "100%" }} />
                  </div>
                </div>
                {!parsing && parsed && !parsed.failed && (
                  <span className="con-badge-ok">
                    <FiCheck size={10} />
                    {parsed.extracted_count} fields
                  </span>
                )}
              </div>
              <button className="con-btn con-btn-ghost" onClick={reset}>
                <FiRefreshCw size={14} />
                Replace
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {/* ── Review ── */}
        {file && !parsing && (
          <div className="con-card">
            <div className="con-review-head">
              <h3>{parsed?.failed ? "Enter the details" : "Review what we found"}</h3>
            </div>

            <div className="con-fields">
              <div className="con-field">
                <FieldLabel required extracted={wasExtracted("first_name")}>
                  First name
                </FieldLabel>
                <input
                  className={`con-input ${wasExtracted("first_name") ? "filled" : "empty"}`}
                  value={values.first_name}
                  onChange={(e) => setValue("first_name", e.target.value)}
                  placeholder="Enter first name"
                />
              </div>

              <div className="con-field">
                <FieldLabel required extracted={wasExtracted("last_name")}>
                  Last name
                </FieldLabel>
                <input
                  className={`con-input ${wasExtracted("last_name") ? "filled" : "empty"}`}
                  value={values.last_name}
                  onChange={(e) => setValue("last_name", e.target.value)}
                  placeholder="Enter last name"
                />
              </div>

              <div className="con-field">
                <FieldLabel required extracted={wasExtracted("email")}>
                  Email
                </FieldLabel>
                <input
                  className={`con-input ${wasExtracted("email") ? "filled" : "empty"}`}
                  type="email"
                  value={values.email}
                  onChange={(e) => setValue("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="con-field">
                <FieldLabel extracted={Boolean(values.country)}>Country</FieldLabel>
                <Select
                  value={values.country || undefined}
                  onChange={(v) => setValue("country", v || "")}
                  options={countryOptions}
                  placeholder="Select a country"
                  style={{ width: "100%" }}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
              </div>

              <div className="con-field">
                <FieldLabel extracted={Boolean(values.nationality)}>
                  Nationality
                </FieldLabel>
                <Select
                  value={values.nationality || undefined}
                  onChange={(v) => setValue("nationality", v || "")}
                  options={nationalityOptions}
                  placeholder="Select a nationality"
                  style={{ width: "100%" }}
                  showSearch
                  allowClear
                  optionFilterProp="label"
                />
              </div>

              <div className="con-field">
                <FieldLabel required extracted={false}>
                  Years of experience
                </FieldLabel>
                <input
                  className={`con-input ${values.year_of_experience ? "" : "empty"}`}
                  type="number"
                  min="0"
                  max="60"
                  value={values.year_of_experience}
                  onChange={(e) => setValue("year_of_experience", e.target.value)}
                  placeholder="Not in the CV — enter manually"
                />
              </div>

              <div className="con-field">
                <FieldLabel extracted={Boolean(values.cv_language)}>CV language</FieldLabel>
                <Select
                  value={values.cv_language || undefined}
                  onChange={(v) => setValue("cv_language", v || "")}
                  options={CV_LANGUAGES}
                  placeholder="Select language"
                  style={{ width: "100%" }}
                  allowClear
                />
              </div>

              <div className="con-field wide">
                <FieldLabel required extracted={wasExtracted("expertise_area")}>
                  Areas of expertise
                </FieldLabel>
                <Select
                  mode="tags"
                  value={expertise}
                  onChange={setExpertise}
                  options={expertiseOptions}
                  placeholder="Search the list, or type to add your own"
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.value ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
                <span className="con-hint">
                  {expertise.length
                    ? `${expertise.length} area${expertise.length === 1 ? "" : "s"} selected`
                    : `At least one is required — ${expertiseOptions.length} to choose from.`}
                </span>
              </div>

              {parsed?.fields?.language_skills?.length > 0 && (
                <div className="con-field wide">
                  <FieldLabel extracted>Languages detected</FieldLabel>
                  <div className="con-taglist">
                    {parsed.fields.language_skills.map((lang, i) => (
                      <span className="con-tagx" key={`${lang.language}-${i}`}>
                        {lang.language}
                        {lang.speaking ? ` — ${LANGUAGE_LEVEL[lang.speaking] || ""}` : ""}
                      </span>
                    ))}
                  </div>
                  <span className="con-hint">Detected in the CV, for reference.</span>
                </div>
              )}

              {parsed?.counts && !parsed.failed && (
                <div className="con-field wide">
                  <span className="con-hint">
                    Also found in this CV: {parsed.counts.education} education,{" "}
                    {parsed.counts.work_experience} work, and{" "}
                    {parsed.counts.research_experience} research entries. The file is
                    attached to the record — add these through Build CV if you need
                    them as structured data.
                  </span>
                </div>
              )}
            </div>

            <div className="con-footbar">
              <span className="note">
                {missing.length
                  ? `Still needed: ${missing.join(", ")}.`
                  : "Everything required is filled in."}
              </span>
              <span className="sp" />
              <button className="con-btn con-btn-quiet" onClick={reset}>
                Start over
              </button>
              <button
                className="con-btn con-btn-primary"
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? "Registering…" : "Register expert"}
              </button>
            </div>
          </div>
        )}

        {parsing && (
          <div className="con-card">
            <div className="con-card-body">
              <div className="con-skeleton" style={{ height: 220 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
