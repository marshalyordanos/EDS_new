import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { App, Modal, Upload } from "antd";
import {
  FiDownload,
  FiEdit2,
  FiTrash2,
  FiLock,
  FiBriefcase,
  FiSearch,
  FiBookOpen,
  FiAward,
  FiUploadCloud,
  FiFile,
  FiX,
  FiUnlock,
  FiClock as FiPending,
  FiCreditCard,
} from "react-icons/fi";
import {
  getExpertDetails,
  getNestedResourceList,
  deleteExpert,
  updateExpertCv,
} from "../../services/expertService";
import {
  listAccessRequests,
  createAccessRequest,
} from "../../services/accessRequestService";
import "../../styles/console.css";

const initialsOf = (first = "", last = "") =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "–";

const fmtDate = (value, opts = { day: "2-digit", month: "short", year: "numeric" }) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", opts);
};

const fmtMonthYear = (value) => fmtDate(value, { month: "short", year: "numeric" });
const yearOf = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : null;
};

const monthsSince = (value) => {
  if (!value) return null;
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
};

const splitList = (value) =>
  (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const EVENT_META = {
  work: { label: "Work", icon: FiBriefcase },
  research: { label: "Research", icon: FiSearch },
  education: { label: "Education", icon: FiBookOpen },
  certification: { label: "Certification", icon: FiAward },
};

/* Fields hidden from anyone who isn't the registering company or an admin. */
const Locked = () => (
  <span className="con-locked">
    <FiLock size={10} />
    Hidden
  </span>
);

export default function ExpertProfilePage() {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expert, setExpert] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [research, setResearch] = useState([]);
  const [expertise, setExpertise] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [spineFilter, setSpineFilter] = useState("all");
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  // This company's own AccessRequest for this expert, if any - null means
  // "not requested yet", not "loading". Only ever fetched for non-owned
  // experts viewed by a company user (see the effect below).
  const [accessRequest, setAccessRequest] = useState(null);
  const [requestingAccess, setRequestingAccess] = useState(false);

  const role = localStorage.getItem("userRole");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!expertId) return;
      setLoading(true);
      setError(null);
      try {
        const [details, personalList, eduList, expList, expertiseList, resList] =
          await Promise.all([
            getExpertDetails(expertId),
            getNestedResourceList(expertId, "personal_detail"),
            getNestedResourceList(expertId, "education"),
            getNestedResourceList(expertId, "work_experience"),
            getNestedResourceList(expertId, "expertise"),
            getNestedResourceList(expertId, "research_experience"),
          ]);
        if (cancelled) return;

        setExpert(details);
        setPersonal(personalList[0] || null);
        setEducation(eduList || []);
        setWorkExperience((expList || []).filter((e) => e.typee !== "certification"));
        setCertifications((expList || []).filter((e) => e.typee === "certification"));
        setExpertise(expertiseList[0] || null);
        setResearch(resList || []);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load expert profile:", err);
        // A company user gets a 404 (not 403) for an expert registered by
        // another company - not found rather than forbidden, so the error
        // does not confirm that ID belongs to a real record.
        setError(
          err.response?.status === 404
            ? "This expert isn't available to view. It may belong to another company, or the record may not exist."
            : "Could not load this expert. Refresh to try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [expertId]);

  // Only company users viewing an expert they did NOT register need to know
  // about a request - the owner and admin never see the request button.
  useEffect(() => {
    if (!expert || role !== "company" || expert.yours) return;
    let cancelled = false;
    listAccessRequests({ expert: expertId })
      .then((res) => {
        if (cancelled) return;
        const results = res.data.results ?? res.data;
        setAccessRequest(results?.[0] || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [expert, expertId, role]);

  const sendAccessRequest = async () => {
    setRequestingAccess(true);
    try {
      const res = await createAccessRequest(expertId);
      setAccessRequest(res.data);
      message.success("Request sent. An admin will review it and set a price.");
    } catch (err) {
      message.error(err.response?.data?.expert?.[0] || "Could not send that request.");
    } finally {
      setRequestingAccess(false);
    }
  };

  const handleRequestAccess = () => {
    modal.confirm({
      title: (
        <h3 className="font-semibold text-md" style={{ color: "var(--con-ink)" }}>
          Request CV &amp; contact info for {fullName}?
        </h3>
      ),
      content: (
        <p style={{ color: "var(--con-ink-2)", marginTop: 8 }}>
          An admin will review this request and set a price. You&rsquo;ll be able to see
          their CV, email, and phone number once it&rsquo;s approved and paid for.
        </p>
      ),
      okText: "Send request",
      cancelText: "Cancel",
      onOk: sendAccessRequest,
    });
  };

  // The registering company, an admin, or a company that PAID for access
  // (PurchasedExpertSerializer) sees contact details; everyone else sees the
  // professional record with contact fields redacted. The backend only ever
  // includes `email` in the payload for those three cases, so its presence
  // is the one source of truth here rather than re-deriving it client-side.
  const canSeePrivate = Boolean(expert?.yours) || role === "admin" || "email" in (expert || {});

  const fullName = expert
    ? [expert.first_name, expert.last_name].filter(Boolean).join(" ") || "Unnamed expert"
    : "";

  const sectors = useMemo(() => splitList(expert?.expertise_area), [expert]);
  const regions = useMemo(
    () => splitList(expert?.countries_of_work_experience),
    [expert]
  );
  const languages = useMemo(() => {
    const raw = expert?.language_skills;
    if (!raw) return [];
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  }, [expert]);

  const staleMonths = monthsSince(expert?.updated_at);

  /* Merge work, research, education, and certifications into one
     chronology. They all carry dates, so splitting them into separate
     timelines hides the actual shape of a career. */
  const spine = useMemo(() => {
    const events = [
      ...workExperience.map((e) => ({
        kind: "work",
        key: `work-${e.id}`,
        title: e.position_title || "Position",
        org: e.organization_name,
        start: e.start_date,
        end: e.end_date,
        ongoing: !e.end_date,
        country: e.country,
        desc: e.responsibilities || e.description,
        sortDate: e.start_date || e.end_date,
      })),
      ...certifications.map((e) => ({
        kind: "certification",
        key: `cert-${e.id}`,
        title: e.position_title || "Certification",
        org: e.organization_name ? `Issued by ${e.organization_name}` : null,
        start: e.start_date,
        end: null,
        ongoing: false,
        desc: e.responsibilities || e.description,
        sortDate: e.start_date,
      })),
      ...research.map((e) => ({
        kind: "research",
        key: `res-${e.id}`,
        title: e.position || "Research",
        org: e.client ? `Client: ${e.client}` : null,
        start: e.start_date,
        end: e.end_date,
        ongoing: !e.end_date,
        country: e.country,
        desc: e.description,
        sortDate: e.start_date || e.end_date,
      })),
      ...education.map((e) => ({
        kind: "education",
        key: `edu-${e.id}`,
        title: [e.education_level, e.field_of_study].filter(Boolean).join(", ") || "Qualification",
        org: e.institution_name,
        start: e.year_of_grad,
        end: null,
        ongoing: false,
        desc: null,
        graduated: true,
        sortDate: e.year_of_grad,
      })),
    ];

    return events
      .filter((e) => e.sortDate)
      .sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));
  }, [workExperience, certifications, research, education]);

  const filteredSpine =
    spineFilter === "all" ? spine : spine.filter((e) => e.kind === spineFilter);

  /* Group into year bands so the career's shape reads at a glance. */
  const spineBands = useMemo(() => {
    const bands = [];
    let currentBand = null;
    filteredSpine.forEach((event) => {
      const y = yearOf(event.sortDate);
      const bandStart = y ? Math.floor(y / 5) * 5 : null;
      const label = bandStart ? `${bandStart} — ${bandStart + 5}` : "Undated";
      if (!currentBand || currentBand.label !== label) {
        currentBand = { label, events: [] };
        bands.push(currentBand);
      }
      currentBand.events.push(event);
    });
    return bands;
  }, [filteredSpine]);

  const facts = {
    years: expert?.year_of_experience ?? null,
    positions: workExperience.length,
    research: research.length,
    quals: education.length,
  };

  const handleDelete = () => {
    modal.confirm({
      title: (
        <h3 className="font-semibold text-md" style={{ color: "var(--con-ink)" }}>
          Delete {fullName}?
        </h3>
      ),
      content: (
        <p style={{ color: "var(--con-ink-2)", marginTop: 8 }}>
          This permanently removes their record. This cannot be undone.
        </p>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        setIsDeleting(true);
        try {
          await deleteExpert(expertId);
          message.success("Expert deleted.");
          navigate("/dashboard/all");
        } catch (err) {
          message.error("Could not delete that expert.");
          console.error(err);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const closeCvModal = () => {
    if (uploadingCv) return;
    setCvModalOpen(false);
    setCvFile(null);
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;
    setUploadingCv(true);
    try {
      const updated = await updateExpertCv(expertId, cvFile);
      setExpert(updated);
      message.success(expert?.cv_file ? "CV updated." : "CV uploaded.");
      setCvModalOpen(false);
      setCvFile(null);
    } catch (err) {
      const detail = err.response?.data?.cv_file?.[0] || err.response?.data?.detail;
      message.error(detail || "Could not save that CV. Nothing was changed.");
    } finally {
      setUploadingCv(false);
    }
  };

  if (loading) {
    return (
      <div className="con-dossier">
        <div className="con-skeleton" style={{ height: 160 }} />
        <div className="con-dossier-body">
          <div className="con-dossier-left">
            <div className="con-skeleton" style={{ height: 220 }} />
            <div className="con-skeleton" style={{ height: 160 }} />
          </div>
          <div className="con-dossier-right">
            <div className="con-skeleton" style={{ height: 420 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="con-dossier">
        <div className="con-error">{error || "Expert not found."}</div>
      </div>
    );
  }

  return (
    <div className="con-dossier">
      {/* ── Masthead ── */}
      <div className="con-masthead">
        <div className="con-mh-top">
          <span className="con-mh-av">{initialsOf(expert.first_name, expert.last_name)}</span>
          <div className="con-mh-id">
            <h2>{fullName}</h2>
            {(personal?.current_position || sectors[0]) && (
              <div className="con-mh-role">
                {[personal?.current_position, sectors[0]].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="con-mh-meta">
              {expert.code && <span className="con-code-chip">{expert.code}</span>}
              {expert.nationality && <span>{expert.nationality}</span>}
              {expert.country && (
                <>
                  <span className="sep">·</span>
                  <span>{expert.country}</span>
                </>
              )}
              {fmtDate(expert.created_at) && (
                <>
                  <span className="sep">·</span>
                  <span>Registered {fmtDate(expert.created_at)}</span>
                </>
              )}
            </div>
          </div>

          <div className="con-mh-acts">
            {expert.cv_file && (canSeePrivate) && (
              <a
                className="con-btn con-btn-quiet"
                href={expert.cv_file}
                target="_blank"
                rel="noreferrer"
                download
              >
                <FiDownload size={14} />
                Download CV
              </a>
            )}
            {role === "company" && !expert.yours && !canSeePrivate && (
              <>
                {!accessRequest && (
                  <button
                    className="con-btn con-btn-quiet"
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                  >
                    <FiUnlock size={14} />
                    {requestingAccess ? "Sending…" : "Request CV & contact info"}
                  </button>
                )}
                {accessRequest?.status === "pending" && (
                  <span className="con-btn con-btn-quiet" style={{ cursor: "default" }}>
                    <FiPending size={14} />
                    Request pending review
                  </span>
                )}
                {accessRequest?.status === "priced" && (
                  <span
                    className="con-btn con-btn-quiet"
                    style={{ cursor: "default" }}
                    title="An admin has set a price. Contact them to arrange payment."
                  >
                    <FiCreditCard size={14} />
                    Awaiting payment · {accessRequest.price}
                  </span>
                )}
                {accessRequest?.status === "rejected" && (
                  <button
                    className="con-btn con-btn-quiet"
                    onClick={handleRequestAccess}
                    disabled={requestingAccess}
                    title={accessRequest.admin_note || "Previous request was declined."}
                  >
                    <FiUnlock size={14} />
                    {requestingAccess ? "Sending…" : "Request again"}
                  </button>
                )}
              </>
            )}
            {expert.yours && (
              <button
                className="con-btn con-btn-quiet"
                onClick={() => setCvModalOpen(true)}
              >
                <FiUploadCloud size={14} />
                {expert.cv_file ? "Update CV" : "Upload CV"}
              </button>
            )}
            {expert.yours && (
              <Link className="con-btn con-btn-quiet" to={`/dashboard/experts/edit/${expert.id}`}>
                <FiEdit2 size={14} />
                Edit
              </Link>
            )}
            {expert.yours && (
              <button
                className="con-btn con-btn-ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label="Delete expert"
                title="Delete expert"
              >
                <FiTrash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="con-mh-facts">
          <div className="con-fact">
            <b className="con-num">{facts.years ?? "—"}</b>
            <small>Years of experience</small>
          </div>
          <div className="con-fact">
            <b className="con-num">{facts.positions}</b>
            <small>Positions held</small>
          </div>
          <div className="con-fact">
            <b className="con-num">{facts.research}</b>
            <small>Research projects</small>
          </div>
          <div className="con-fact">
            <b className="con-num">{facts.quals}</b>
            <small>Qualifications</small>
          </div>
          <div className={`con-fact${staleMonths != null && staleMonths >= 12 ? " warn" : ""}`}>
            <b className="con-num">{staleMonths != null ? `${staleMonths} mo` : "—"}</b>
            <small>Since CV update</small>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="con-dossier-body">
        {/* LEFT */}
        <div className="con-dossier-left">
          <div className="con-dcard">
            <div className="con-dcard-h">
              <h3>Contact &amp; identity</h3>
            </div>
            <div className="con-dcard-b">
              <dl className="con-dkv">
                <dt>Email</dt>
                <dd>{canSeePrivate ? expert.email || "—" : <Locked />}</dd>
                <dt>Phone</dt>
                <dd>{canSeePrivate ? personal?.phone_number || "—" : <Locked />}</dd>
                <dt>Gender</dt>
                <dd>{personal?.gender || "—"}</dd>
                <dt>Nationality</dt>
                <dd>{expert.nationality || "—"}</dd>
                <dt>Date of birth</dt>
                <dd>
                  {canSeePrivate ? fmtDate(personal?.date_of_birth) || "—" : <Locked />}
                </dd>
                <dt>CV language</dt>
                <dd>{expert.cv_language || "—"}</dd>
              </dl>

              {!canSeePrivate && (
                <div className="con-privacy-note">
                  <FiLock size={14} />
                  <p>
                    <b>Contact details hidden</b>
                    This expert was registered by another company. Their professional
                    record is fully visible.
                  </p>
                </div>
              )}
            </div>
          </div>

          {(expertise?.specialization || sectors.length > 0) && (
            <div className="con-dcard">
              <div className="con-dcard-h">
                <h3>Expertise</h3>
                {sectors.length > 0 && <span className="n">{sectors.length}</span>}
              </div>
              <div className="con-dcard-b">
                {expertise?.specialization && (
                  <>
                    <div className="con-eyebrow" style={{ marginBottom: 7 }}>
                      Primary specialisation
                    </div>
                    <div className="con-dchips" style={{ marginBottom: 13 }}>
                      <span className="con-dchip key">{expertise.specialization}</span>
                    </div>
                  </>
                )}
                {sectors.length > 0 && (
                  <>
                    <div className="con-eyebrow" style={{ marginBottom: 7 }}>
                      Sectors
                    </div>
                    <div className="con-dchips">
                      {sectors.map((s) => (
                        <span className="con-dchip" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {expertise?.key_words?.length > 0 && (
                  <>
                    <div className="con-eyebrow" style={{ margin: "13px 0 7px" }}>
                      Keywords
                    </div>
                    <div className="con-dchips">
                      {expertise.key_words.map((k) => (
                        <span className="con-dchip" key={k}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div className="con-dcard">
              <div className="con-dcard-h">
                <h3>Languages</h3>
              </div>
              <div className="con-dcard-b">
                {languages.map((lang, i) => {
                  const level = { 4: "Excellent", 3: "Very good", 2: "Average", 1: "Basic" };
                  return (
                    <div className="con-dlang" key={`${lang.language}-${i}`}>
                      <span className="con-dlang-name">{lang.language}</span>
                      <span className="con-dmeter">
                        <i style={{ width: `${((lang.speaking || 0) / 4) * 100}%` }} />
                      </span>
                      <small>{level[lang.speaking] || "—"}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {regions.length > 0 && (
            <div className="con-dcard">
              <div className="con-dcard-h">
                <h3>Regions worked</h3>
                <span className="n">{regions.length}</span>
              </div>
              <div className="con-dcard-b">
                <div className="con-dchips">
                  {regions.map((r) => (
                    <span className="con-dchip" key={r}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="con-dossier-right">
          <div className="con-dcard">
            <div className="con-dcard-h" style={{ gap: 12 }}>
              <h3>Career</h3>
              <span className="con-dtabs">
                {[
                  ["all", "All"],
                  ["work", "Work"],
                  ["research", "Research"],
                  ["education", "Education"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    className={spineFilter === key ? "on" : ""}
                    onClick={() => setSpineFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </span>
            </div>

            {filteredSpine.length === 0 ? (
              <div className="con-empty">Nothing recorded for this expert yet.</div>
            ) : (
              <div className="con-spine">
                {spineBands.map((band) => (
                  <div key={band.label}>
                    <div className="con-yr">
                      <b>{band.label}</b>
                      <span className="rule" />
                    </div>
                    {band.events.map((event) => {
                      const meta = EVENT_META[event.kind];
                      const Icon = meta.icon;
                      const kindClass =
                        event.kind === "education"
                          ? "edu"
                          : event.kind === "certification"
                          ? "cert"
                          : event.kind === "research"
                          ? "res"
                          : "work";
                      return (
                        <div className="con-ev" key={event.key}>
                          <span className={`con-ev-dot ${kindClass}`}>
                            <Icon size={11} />
                          </span>
                          <div className="con-ev-b">
                            <div className="con-ev-title">
                              <b>{event.title}</b>
                              <span className={`con-ev-kind ${kindClass}`}>{meta.label}</span>
                            </div>
                            {event.org && <div className="con-ev-org">{event.org}</div>}
                            <div className="con-ev-when">
                              {event.graduated
                                ? `Graduated ${yearOf(event.start) ?? "—"}`
                                : event.kind === "certification"
                                ? fmtMonthYear(event.start) || "—"
                                : `${fmtMonthYear(event.start) || "—"} – ${
                                    event.ongoing ? "present" : fmtMonthYear(event.end) || "—"
                                  }${event.country ? ` · ${event.country}` : ""}`}
                            </div>
                            {event.desc && <p className="con-ev-desc">{event.desc}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(expert.journals || expert.publications || expert.books) && (
            <div className="con-dcard">
              <div className="con-dcard-h">
                <h3>Publications &amp; output</h3>
              </div>
              <div className="con-dcard-b" style={{ paddingTop: 4 }}>
                {expert.journals && (
                  <>
                    <div className="con-eyebrow" style={{ margin: "10px 0 2px" }}>
                      Journals
                    </div>
                    <div className="con-pub">{expert.journals}</div>
                  </>
                )}
                {expert.publications && (
                  <>
                    <div className="con-eyebrow" style={{ margin: "14px 0 2px" }}>
                      Publications
                    </div>
                    <div className="con-pub">{expert.publications}</div>
                  </>
                )}
                {expert.books && (
                  <>
                    <div className="con-eyebrow" style={{ margin: "14px 0 2px" }}>
                      Books
                    </div>
                    <div className="con-pub">{expert.books}</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        title={expert.cv_file ? "Update CV" : "Upload CV"}
        open={cvModalOpen}
        onCancel={closeCvModal}
        footer={null}
        width={480}
        destroyOnClose
      >
        <div className="con-cv-modal">
          {expert.cv_file && (
            <div className="con-cv-current">
              <span className="con-cv-current-icon">
                <FiFile size={15} />
              </span>
              <span className="con-cv-current-text">
                <b>Current CV on file</b>
                <small>Uploading a new file replaces this one.</small>
              </span>
              <a
                className="con-textlink"
                href={expert.cv_file}
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>
            </div>
          )}

          <Upload.Dragger
            accept=".pdf,.docx"
            maxCount={1}
            fileList={
              cvFile
                ? [{ uid: "cv", name: cvFile.name, status: "done" }]
                : []
            }
            beforeUpload={(file) => {
              setCvFile(file);
              return false;
            }}
            onRemove={() => setCvFile(null)}
            className="con-cv-dragger"
          >
            <p className="con-cv-dragger-icon">
              <FiUploadCloud size={22} />
            </p>
            <p className="con-cv-dragger-text">Click or drag a file to upload</p>
            <p className="con-cv-dragger-hint">PDF, DOC, or DOCX · up to 5MB</p>
          </Upload.Dragger>

          <div className="con-cv-modal-actions">
            <button className="con-btn con-btn-ghost" onClick={closeCvModal} disabled={uploadingCv}>
              <FiX size={14} />
              Cancel
            </button>
            <button
              className="con-btn con-btn-primary"
              onClick={handleCvUpload}
              disabled={!cvFile || uploadingCv}
            >
              <FiUploadCloud size={14} />
              {uploadingCv ? "Saving…" : expert.cv_file ? "Save new CV" : "Upload CV"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
