import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { App, Modal, Input, InputNumber } from "antd";
import {
  FiUnlock,
  FiClock,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
} from "react-icons/fi";
import {
  listAccessRequests,
  priceAccessRequest,
  rejectAccessRequest,
  markAccessRequestPaid,
} from "../../services/accessRequestService";
import "../../styles/console.css";
import "../../styles/content.css";

const { TextArea } = Input;

const STATUS_META = {
  pending: { label: "Pending", pill: "draft" },
  priced: { label: "Awaiting payment", pill: "draft" },
  paid: { label: "Paid", pill: "live" },
  rejected: { label: "Rejected", pill: "danger" },
};

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

export default function AccessRequestsPage() {
  const { message } = App.useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const [priceModalFor, setPriceModalFor] = useState(null);
  const [priceValue, setPriceValue] = useState(null);
  const [priceNote, setPriceNote] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const [rejectModalFor, setRejectModalFor] = useState(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const [markingPaidId, setMarkingPaidId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await listAccessRequests();
      setRequests(res.data.results ?? res.data);
    } catch {
      message.error("Failed to load access requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const counts = useMemo(() => {
    const c = { pending: 0, priced: 0, paid: 0, rejected: 0 };
    requests.forEach((r) => {
      if (c[r.status] != null) c[r.status] += 1;
    });
    return c;
  }, [requests]);

  const visible = useMemo(
    () => (statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter)),
    [requests, statusFilter]
  );

  const filters = [
    { key: "all", label: "All", count: requests.length },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "priced", label: "Awaiting payment", count: counts.priced },
    { key: "paid", label: "Paid", count: counts.paid },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ];

  const openPriceModal = (req) => {
    setPriceModalFor(req);
    setPriceValue(req.price || null);
    setPriceNote(req.admin_note || "");
  };

  const handleSetPrice = async () => {
    if (!priceValue || priceValue <= 0) {
      message.error("Enter a price greater than zero.");
      return;
    }
    setSavingPrice(true);
    try {
      await priceAccessRequest(priceModalFor.id, priceValue, priceNote);
      message.success("Price set. The company can now arrange payment.");
      setPriceModalFor(null);
      fetchRequests();
    } catch (err) {
      message.error(err.response?.data?.price?.[0] || "Could not set that price.");
    } finally {
      setSavingPrice(false);
    }
  };

  const openRejectModal = (req) => {
    setRejectModalFor(req);
    setRejectNote("");
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectAccessRequest(rejectModalFor.id, rejectNote);
      message.success("Request rejected.");
      setRejectModalFor(null);
      fetchRequests();
    } catch {
      message.error("Could not reject that request.");
    } finally {
      setRejecting(false);
    }
  };

  const handleMarkPaid = async (req) => {
    setMarkingPaidId(req.id);
    try {
      await markAccessRequestPaid(req.id);
      message.success("Marked as paid. The company now has full access to this expert.");
      fetchRequests();
    } catch {
      message.error("Could not mark that request as paid.");
    } finally {
      setMarkingPaidId(null);
    }
  };

  return (
    <div className="cnt-page">
      <header className="cnt-head">
        <div className="cnt-head-text">
          <span className="cnt-eyebrow">Access</span>
          <h1>Contact & CV requests</h1>
          <p>Companies asking to unlock an expert they did not register.</p>
        </div>
      </header>

      <div className="cnt-stats">
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph draft">
            <FiClock />
          </span>
          <span>
            <b>{loading ? "—" : counts.pending}</b>
            <small>Pending review</small>
          </span>
        </div>
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph draft">
            <FiCreditCard />
          </span>
          <span>
            <b>{loading ? "—" : counts.priced}</b>
            <small>Awaiting payment</small>
          </span>
        </div>
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph good">
            <FiCheckCircle />
          </span>
          <span>
            <b>{loading ? "—" : counts.paid}</b>
            <small>Paid</small>
          </span>
        </div>
      </div>

      <div className="cnt-toolbar">
        <div className="cnt-seg" role="group" aria-label="Filter by status">
          {filters.map((f) => (
            <button
              key={f.key}
              className={statusFilter === f.key ? "on" : ""}
              onClick={() => setStatusFilter(f.key)}
              aria-pressed={statusFilter === f.key}
            >
              {f.label}
              <span className="cnt-seg-count">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="arq-tablecard">
        {loading ? (
          <div className="con-card-body" style={{ display: "grid", gap: 10, padding: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="con-skeleton" style={{ height: 52 }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="cnt-empty">
            <span className="cnt-empty-glyph">
              <FiUnlock />
            </span>
            <b>{requests.length === 0 ? "No requests yet" : "Nothing matches that"}</b>
            <p>
              {requests.length === 0
                ? "When a company asks to unlock an expert's contact info and CV, it shows up here."
                : "Try a different status filter."}
            </p>
          </div>
        ) : (
          <div className="arq-scroll">
            <table className="arq-table">
              <thead>
                <tr>
                  <th style={{ width: "22%" }}>Requested by</th>
                  <th style={{ width: "20%" }}>Expert</th>
                  <th style={{ width: "16%" }}>Company</th>
                  <th style={{ width: "13%" }}>Status</th>
                  <th className="num" style={{ width: "10%" }}>
                    Price
                  </th>
                  <th style={{ width: "11%" }}>Requested</th>
                  <th className="actions" style={{ width: "8%" }} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((req) => {
                  const meta = STATUS_META[req.status] || { label: req.status, pill: "hidden" };
                  return (
                    <tr key={req.id}>
                      <td>
                        <span className="arq-who">
                          <span className="arq-avatar">{initialsOf(req.requested_by_name)}</span>
                          <span className="arq-who-text">
                            <b>{req.requested_by_name}</b>
                            <small>{req.requested_by_company || "No company on file"}</small>
                          </span>
                        </span>
                      </td>
                      <td>
                        <Link className="arq-expert-link" to={`/dashboard/experts/${req.expert}`}>
                          {req.expert_name || `Expert #${req.expert}`}
                        </Link>
                      </td>
                      <td>
                        {req.requested_by_company ? (
                          <span className="arq-company">{req.requested_by_company}</span>
                        ) : (
                          <span className="arq-blank">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`cnt-pill ${meta.pill}`}>{meta.label}</span>
                      </td>
                      <td className="num">
                        {req.price != null ? (
                          <span className="arq-price">
                            <span className="cur">$</span>
                            {req.price}
                          </span>
                        ) : (
                          <span className="arq-price unset">—</span>
                        )}
                      </td>
                      <td className="arq-when">{fmtDate(req.created_at)}</td>
                      <td>
                        <div className="arq-actions">
                          {req.status === "pending" && (
                            <>
                              <button
                                className="con-btn con-btn-primary con-btn-sm"
                                onClick={() => openPriceModal(req)}
                              >
                                Set price
                              </button>
                              <button
                                className="arq-icon-btn"
                                onClick={() => openRejectModal(req)}
                                title="Reject request"
                                aria-label="Reject request"
                              >
                                <FiXCircle size={14} />
                              </button>
                            </>
                          )}
                          {req.status === "priced" && (
                            <>
                              <button
                                className="con-btn con-btn-primary con-btn-sm"
                                onClick={() => handleMarkPaid(req)}
                                disabled={markingPaidId === req.id}
                              >
                                {markingPaidId === req.id ? "Saving…" : "Mark paid"}
                              </button>
                              <button
                                className="con-btn con-btn-quiet con-btn-sm"
                                onClick={() => openPriceModal(req)}
                              >
                                Edit
                              </button>
                              <button
                                className="arq-icon-btn"
                                onClick={() => openRejectModal(req)}
                                title="Reject request"
                                aria-label="Reject request"
                              >
                                <FiXCircle size={14} />
                              </button>
                            </>
                          )}
                          {req.status === "rejected" && req.admin_note && (
                            <span className="arq-note-flag" title={req.admin_note}>
                              <FiFileText size={12} />
                              Reason noted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title={`Set a price — ${priceModalFor?.expert_name || ""}`}
        open={Boolean(priceModalFor)}
        onCancel={() => setPriceModalFor(null)}
        footer={null}
        destroyOnClose
      >
        <div className="flex flex-col gap-3 mt-2">
          <label className="con-field-label">
            Price
            <InputNumber
              min={0.01}
              step={1}
              style={{ width: "100%", marginTop: 4 }}
              value={priceValue}
              onChange={setPriceValue}
              placeholder="e.g. 750"
            />
          </label>
          <label className="con-field-label">
            Note (optional, visible to the requester)
            <TextArea
              rows={3}
              style={{ marginTop: 4 }}
              value={priceNote}
              onChange={(e) => setPriceNote(e.target.value)}
              placeholder="e.g. Standard access tier"
            />
          </label>
          <div className="flex justify-end gap-3 mt-2">
            <button className="con-btn con-btn-quiet" onClick={() => setPriceModalFor(null)}>
              Cancel
            </button>
            <button
              className="con-btn con-btn-primary"
              onClick={handleSetPrice}
              disabled={savingPrice}
            >
              {savingPrice ? "Saving…" : "Set price"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        title={`Reject request — ${rejectModalFor?.expert_name || ""}`}
        open={Boolean(rejectModalFor)}
        onCancel={() => setRejectModalFor(null)}
        footer={null}
        destroyOnClose
      >
        <div className="flex flex-col gap-3 mt-2">
          <label className="con-field-label">
            Reason (optional, visible to the requester)
            <TextArea
              rows={3}
              style={{ marginTop: 4 }}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. Not available for sharing right now"
            />
          </label>
          <div className="flex justify-end gap-3 mt-2">
            <button className="con-btn con-btn-quiet" onClick={() => setRejectModalFor(null)}>
              Cancel
            </button>
            <button className="con-btn con-btn-primary" onClick={handleReject} disabled={rejecting}>
              {rejecting ? "Rejecting…" : "Reject request"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
