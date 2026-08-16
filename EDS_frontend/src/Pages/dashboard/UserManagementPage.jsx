import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App, Modal, Form, Input, Select, Drawer, Popconfirm } from "antd";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiKey,
  FiTrash2,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  getUsers,
  getUserStats,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserActive,
} from "../../services/userService";
import "../../styles/console.css";

/* Roles are rendered in this order and described in plain words, so the
   reader never has to decode a colour to know what access means. */
const ROLES = [
  {
    key: "admin",
    label: "Full admin",
    blurb: "Full access, including user management",
    caps: [
      [true, "Search and view every expert"],
      [true, "Register and edit experts"],
      [true, "Manage blog and testimonials"],
      [true, "Create and remove other users"],
    ],
  },
  {
    key: "company",
    label: "Company user",
    blurb: "Sees only experts their company registered",
    caps: [
      [true, "Search and view experts"],
      [true, "Register experts for their company"],
      [false, "Manage blog and testimonials"],
      [false, "Create or remove users"],
    ],
  },
  {
    key: "content_manager",
    label: "Content manager",
    blurb: "Blog and testimonials only",
    caps: [
      [false, "Search or view experts"],
      [false, "Register experts"],
      [true, "Manage blog and testimonials"],
      [false, "Create or remove users"],
    ],
  },
];

const ROLE_BY_KEY = Object.fromEntries(ROLES.map((r) => [r.key, r]));

const ROLE_SELECT = [
  { value: "company", label: "Company user" },
  { value: "admin", label: "Full admin" },
  { value: "content_manager", label: "Content manager" },
];

const PAGE_SIZE = 10;

const initialsOf = (first = "", last = "", email = "") => {
  const a = `${first?.[0] || ""}${last?.[0] || ""}`.trim();
  return (a || email?.[0] || "?").toUpperCase();
};

const fullNameOf = (user) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function UserManagementPage() {
  const { message } = App.useApp();
  const currentUserId = Number(localStorage.getItem("userId"));

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [ordering, setOrdering] = useState("-created_at");

  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE, ordering };
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== undefined) params.is_active = statusFilter;

      const data = await getUsers(params);
      setUsers(data.results ?? []);
      setTotal(data.count ?? 0);
    } catch {
      message.error("Could not load users. Refresh to try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, ordering, message]);

  const fetchStats = useCallback(async () => {
    try {
      setStats(await getUserStats());
    } catch {
      // Stats are supplementary — the table still works without them.
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  const debounceRef = useRef();
  const onSearchChange = (value) => {
    setDraftSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 350);
  };
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  /* Group the current page's rows by role, keeping ROLES order. */
  const grouped = useMemo(
    () =>
      ROLES.map((role) => ({
        role,
        rows: users.filter((u) => u.role === role.key),
      })).filter((g) => g.rows.length > 0),
    [users]
  );

  const refresh = () => {
    fetchUsers();
    fetchStats();
  };

  const openCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: "company" });
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      company_name: user.company_name,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role: values.role,
        company_name: values.role === "company" ? values.company_name || "" : "",
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
        message.success("User updated.");
      } else {
        await createUser(payload);
        message.success("User created. Default password: Dab@2025");
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      const data = err.response?.data;
      const first =
        data && typeof data === "object" ? Object.values(data).flat()[0] : null;
      message.error(first || data?.detail || data?.error || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user) => {
    try {
      await deleteUser(user.id);
      message.success(`${fullNameOf(user)} deleted.`);
      if (selected?.id === user.id) setSelected(null);
      refresh();
    } catch (err) {
      message.error(err.response?.data?.error || "Could not delete that user.");
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const res = await resetUserPassword(user.id);
      message.success(res.message || "Password reset to the default.");
    } catch (err) {
      message.error(err.response?.data?.error || "Could not reset that password.");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const updated = await toggleUserActive(user.id);
      message.success(
        `${updated.email} is now ${updated.is_active ? "active" : "deactivated"}.`
      );
      if (selected?.id === user.id) setSelected(updated);
      refresh();
    } catch (err) {
      message.error(err.response?.data?.error || "Could not change that status.");
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  const isSelf = (user) => user.id === currentUserId;

  return (
    <div className="con-users">
      {/* ── Heading ── */}
      <div className="con-page-head">
        <div>
          <h2>Who has access</h2>
          <p>
            {loading
              ? "Loading accounts…"
              : `${total} account${total === 1 ? "" : "s"} across three roles.`}
          </p>
        </div>
        <button className="con-btn con-btn-primary" onClick={openCreate}>
          <FiPlus size={14} />
          Invite user
        </button>
      </div>

      {/* ── Summary strip ── */}
      <div className="con-summary">
        <div className="con-sum-cell">
          <b className="con-num">{stats?.total ?? "—"}</b>
          <small>Total accounts</small>
        </div>
        <div className="con-sum-cell">
          <b className="con-num">{stats?.active ?? "—"}</b>
          <small>Active</small>
        </div>
        <div className={`con-sum-cell${stats?.inactive ? " flag" : ""}`}>
          <b className="con-num">{stats?.inactive ?? "—"}</b>
          <small>Deactivated</small>
        </div>
        <div className="con-sum-cell">
          <b className="con-num">{stats?.admin ?? "—"}</b>
          <small>Full admins</small>
        </div>
        <div className="con-sum-cell">
          <b className="con-num">{stats?.new_this_month ?? "—"}</b>
          <small>Joined in 30 days</small>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="con-toolbar">
        <div className="con-searchbox">
          <FiSearch size={15} />
          <input
            value={draftSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, email, or company"
          />
          {draftSearch && (
            <button
              onClick={() => onSearchChange("")}
              style={{ border: 0, background: "none", cursor: "pointer", color: "var(--con-ink-3)" }}
              aria-label="Clear search"
            >
              <FiX size={14} />
            </button>
          )}
        </div>

        <Select
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
          placeholder="All roles"
          allowClear
          style={{ minWidth: 160 }}
          options={ROLE_SELECT}
        />

        <Select
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          placeholder="Any status"
          allowClear
          style={{ minWidth: 150 }}
          options={[
            { value: true, label: "Active" },
            { value: false, label: "Deactivated" },
          ]}
        />

        <Select
          value={ordering}
          onChange={setOrdering}
          style={{ minWidth: 160, marginLeft: "auto" }}
          options={[
            { value: "-created_at", label: "Newest first" },
            { value: "created_at", label: "Oldest first" },
            { value: "first_name", label: "Name (A–Z)" },
            { value: "-first_name", label: "Name (Z–A)" },
          ]}
        />
      </div>

      {/* ── Table ── */}
      <div className="con-tablecard">
        {loading ? (
          <div className="con-card-body" style={{ display: "grid", gap: 10 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="con-skeleton" style={{ height: 52 }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="con-empty" style={{ padding: "56px 24px" }}>
            {search || roleFilter || statusFilter !== undefined
              ? "No users match these filters."
              : "No users yet."}
          </div>
        ) : (
          <div className="con-table-scroll">
            <table className="con-utable">
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Person</th>
                  <th style={{ width: "22%" }}>Company</th>
                  <th style={{ width: "14%" }}>Status</th>
                  <th style={{ width: "16%" }}>Joined</th>
                  <th style={{ width: "16%" }} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {grouped.map(({ role, rows }) => (
                  <Fragment key={role.key}>
                    <tr className={`con-grouprow ${role.key}`}>
                      <td colSpan={5}>
                        <span className="con-grouplabel">
                          <b>{role.label}</b>
                          <span className="n con-num">{rows.length}</span>
                          <span className="what">{role.blurb}</span>
                        </span>
                      </td>
                    </tr>

                    {rows.map((user) => (
                      <tr
                        key={user.id}
                        className={`con-urow${user.is_active ? "" : " inactive"}${
                          selected?.id === user.id ? " selected" : ""
                        }`}
                        onClick={() => setSelected(user)}
                      >
                        <td>
                          <span className="con-who">
                            <span
                              className={`con-uav${user.role === "admin" ? " admin" : ""}`}
                            >
                              {initialsOf(user.first_name, user.last_name, user.email)}
                            </span>
                            <span className="con-who-txt">
                              <b>
                                {fullNameOf(user)}
                                {isSelf(user) && <span className="con-youtag">you</span>}
                              </b>
                              <small>{user.email}</small>
                            </span>
                          </span>
                        </td>
                        <td>
                          {user.company_name ? (
                            <span className="con-co">{user.company_name}</span>
                          ) : (
                            <span className="con-blank">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`con-status ${user.is_active ? "active" : "off"}`}>
                            <i />
                            {user.is_active ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="con-when">{formatDate(user.created_at)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <span className="con-rowacts">
                            <button
                              className="con-iact"
                              title="Edit"
                              onClick={() => openEdit(user)}
                            >
                              <FiEdit2 size={14} />
                            </button>

                            <Popconfirm
                              title="Reset this password?"
                              description="It will be set back to Dab@2025."
                              okText="Reset"
                              onConfirm={() => handleResetPassword(user)}
                            >
                              <button className="con-iact" title="Reset password">
                                <FiKey size={14} />
                              </button>
                            </Popconfirm>

                            <Popconfirm
                              title="Delete this user?"
                              description="This cannot be undone."
                              okText="Delete"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => handleDelete(user)}
                              disabled={isSelf(user)}
                            >
                              <button
                                className="con-iact danger"
                                title={isSelf(user) ? "You cannot delete your own account" : "Delete"}
                                disabled={isSelf(user)}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </Popconfirm>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="con-tfoot">
            <span className="count">
              Showing {rangeStart}–{rangeEnd} of {total}
            </span>
            <span className="con-pager">
              <button
                className="con-pg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <FiChevronLeft size={12} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === pageCount || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <span key={n} style={{ display: "contents" }}>
                    {i > 0 && arr[i - 1] !== n - 1 && (
                      <span style={{ color: "var(--con-ink-3)", padding: "0 2px" }}>…</span>
                    )}
                    <button
                      className={`con-pg${n === page ? " on" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <button
                className="con-pg"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                aria-label="Next page"
              >
                <FiChevronRight size={12} />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={396}
        closable={false}
        styles={{ body: { padding: 0, background: "var(--con-surface)" } }}
      >
        {selected && (
          <>
            <div className="con-pv-head">
              <div className="con-pv-top">
                <span
                  className={`con-uav${selected.role === "admin" ? " admin" : ""}`}
                  style={{ width: 46, height: 46, fontSize: 15 }}
                >
                  {initialsOf(selected.first_name, selected.last_name, selected.email)}
                </span>
                <div className="con-pv-id">
                  <h3>{fullNameOf(selected)}</h3>
                  <p>
                    {ROLE_BY_KEY[selected.role]?.label || selected.role} ·{" "}
                    {selected.is_active ? "Active" : "Deactivated"}
                  </p>
                </div>
                <button
                  className="con-pv-close"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                >
                  <FiX size={15} />
                </button>
              </div>

              <div className="con-pv-acts">
                <button className="con-btn con-btn-quiet" onClick={() => openEdit(selected)}>
                  <FiEdit2 size={14} />
                  Edit
                </button>
                <Popconfirm
                  title="Reset this password?"
                  description="It will be set back to Dab@2025."
                  okText="Reset"
                  onConfirm={() => handleResetPassword(selected)}
                >
                  <button className="con-btn con-btn-quiet">
                    <FiKey size={14} />
                    Reset password
                  </button>
                </Popconfirm>
              </div>
            </div>

            <div className="con-pv-scroll">
              <div className="con-pv-sec">
                <h4>Account</h4>
                <dl className="con-kv">
                  <dt>Email</dt>
                  <dd>{selected.email}</dd>
                  <dt>Role</dt>
                  <dd>{ROLE_BY_KEY[selected.role]?.label || selected.role}</dd>
                  <dt>Company</dt>
                  <dd>
                    {selected.company_name || (
                      <span className="con-blank">Not applicable</span>
                    )}
                  </dd>
                  <dt>Joined</dt>
                  <dd>{formatDate(selected.created_at)}</dd>
                  <dt>Last updated</dt>
                  <dd>{formatDate(selected.updated_at)}</dd>
                </dl>
              </div>

              <div className="con-pv-sec">
                <h4>What this role can do</h4>
                <div className="con-caps">
                  {(ROLE_BY_KEY[selected.role]?.caps || []).map(([allowed, text]) => (
                    <span className={`con-cap ${allowed ? "yes" : "no"}`} key={text}>
                      {allowed ? <FiCheck size={13} /> : <FiX size={13} />}
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              <div className="con-pv-sec">
                <h4>Status</h4>
                {isSelf(selected) ? (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--con-ink-2)" }}>
                    This is your own account — you cannot deactivate or delete it.
                  </p>
                ) : (
                  <>
                    <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--con-ink-2)" }}>
                      Deactivating blocks sign-in but keeps the account and everything it
                      registered.
                    </p>
                    <button
                      className="con-btn con-btn-quiet"
                      onClick={() => handleToggleActive(selected)}
                    >
                      {selected.is_active ? "Deactivate account" : "Reactivate account"}
                    </button>

                    <div className="con-danger-zone">
                      <b>Delete permanently</b>
                      <p>
                        Cannot be undone. Experts they registered stay in the database.
                      </p>
                      <Popconfirm
                        title="Delete this user?"
                        description="This cannot be undone."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(selected)}
                      >
                        <button className="con-btn con-btn-danger">Delete user</button>
                      </Popconfirm>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>

      {/* ── Create / edit ── */}
      <Modal
        title={editingUser ? "Edit user" : "Invite a user"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="first_name"
              label="First name"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="First name" />
            </Form.Item>
            <Form.Item
              name="last_name"
              label="Last name"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email" },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select options={ROLE_SELECT} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
            {({ getFieldValue }) =>
              getFieldValue("role") === "company" ? (
                <Form.Item
                  name="company_name"
                  label="Company name"
                  rules={[
                    { required: true, message: "Company name is required for company users" },
                  ]}
                >
                  <Input placeholder="Company name" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {!editingUser && (
            <p style={{ fontSize: 12.5, color: "var(--con-ink-2)", marginBottom: 8 }}>
              They will sign in with the default password <strong>Dab@2025</strong>.
            </p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="con-btn con-btn-quiet"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="con-btn con-btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingUser ? "Save changes" : "Create user"}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
