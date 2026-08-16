import { useEffect, useMemo, useState } from "react";
import { App, Button, Modal, Form, Input, Switch, Upload, Popconfirm, Tooltip } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiMessageSquare,
} from "react-icons/fi";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../services/contentService";
import "../../styles/console.css";
import "../../styles/content.css";

const { TextArea } = Input;

const initial = (text = "") => (text.trim()[0] || "?").toUpperCase();

export default function TestimonialsManagementPage() {
  const { message } = App.useApp();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [form] = Form.useForm();

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await getTestimonials(true);
      setTestimonials(res.data.results ?? res.data);
    } catch {
      message.error("Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setPhotoFile(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setPhotoFile(null);
    form.setFieldsValue({
      name: item.name,
      role: item.role,
      organization: item.organization,
      quote: item.quote,
      is_active: item.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("role", values.role || "");
      formData.append("organization", values.organization || "");
      formData.append("quote", values.quote);
      formData.append("is_active", values.is_active ? "true" : "false");
      if (photoFile) formData.append("photo", photoFile);

      if (editingItem) {
        await updateTestimonial(editingItem.id, formData);
        message.success("Testimonial updated.");
      } else {
        await createTestimonial(formData);
        message.success("Testimonial created.");
      }
      setModalOpen(false);
      fetchTestimonials();
    } catch (err) {
      message.error(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTestimonial(id);
      message.success("Testimonial deleted.");
      fetchTestimonials();
    } catch {
      message.error("Failed to delete testimonial.");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const formData = new FormData();
      formData.append("is_active", !item.is_active ? "true" : "false");
      await updateTestimonial(item.id, formData);
      message.success(item.is_active ? "Testimonial hidden." : "Testimonial is now live.");
      fetchTestimonials();
    } catch {
      message.error("Failed to update testimonial.");
    }
  };

  const liveCount = testimonials.filter((t) => t.is_active).length;
  const hiddenCount = testimonials.length - liveCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testimonials.filter((item) => {
      if (visibilityFilter === "live" && !item.is_active) return false;
      if (visibilityFilter === "hidden" && item.is_active) return false;
      if (!q) return true;
      return (
        item.name?.toLowerCase().includes(q) ||
        item.organization?.toLowerCase().includes(q) ||
        item.role?.toLowerCase().includes(q) ||
        item.quote?.toLowerCase().includes(q)
      );
    });
  }, [testimonials, query, visibilityFilter]);

  const filters = [
    { key: "all", label: "All", count: testimonials.length },
    { key: "live", label: "Live", count: liveCount },
    { key: "hidden", label: "Hidden", count: hiddenCount },
  ];

  return (
    <div className="cnt-page">
      <header className="cnt-head">
        <div className="cnt-head-text">
          <span className="cnt-eyebrow">Content</span>
          <h1>Testimonials</h1>
          <p>Quotes shown on the landing page. Hidden ones stay off the site.</p>
        </div>
        <div className="cnt-head-actions">
          <button className="con-btn con-btn-primary" onClick={openCreate}>
            <FiPlus size={15} />
            Add testimonial
          </button>
        </div>
      </header>

      <div className="cnt-stats">
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph brand">
            <FiMessageSquare />
          </span>
          <span>
            <b>{loading ? "—" : testimonials.length}</b>
            <small>Total</small>
          </span>
        </div>
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph good">
            <FiEye />
          </span>
          <span>
            <b>{loading ? "—" : liveCount}</b>
            <small>Live on site</small>
          </span>
        </div>
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph">
            <FiEyeOff />
          </span>
          <span>
            <b>{loading ? "—" : hiddenCount}</b>
            <small>Hidden</small>
          </span>
        </div>
      </div>

      <div className="cnt-toolbar">
        <div className="cnt-search">
          <FiSearch size={15} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, organization, or quote"
            aria-label="Search testimonials"
          />
        </div>
        <div className="cnt-seg" role="group" aria-label="Filter by visibility">
          {filters.map((f) => (
            <button
              key={f.key}
              className={visibilityFilter === f.key ? "on" : ""}
              onClick={() => setVisibilityFilter(f.key)}
              aria-pressed={visibilityFilter === f.key}
            >
              {f.label}
              <span className="cnt-seg-count">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cnt-grid">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div className="con-card cnt-quote-card" key={`skeleton-${i}`}>
              <div className="con-skeleton cnt-skel-line" style={{ width: "90%" }} />
              <div className="con-skeleton cnt-skel-line" style={{ width: "100%", marginTop: 8 }} />
              <div className="con-skeleton cnt-skel-line" style={{ width: "70%", marginTop: 8 }} />
              <div className="cnt-who">
                <div className="con-skeleton cnt-avatar" />
                <div style={{ flex: 1 }}>
                  <div className="con-skeleton cnt-skel-line" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          ))}

        {!loading &&
          visible.map((item) => (
            <article
              className={`con-card cnt-quote-card ${item.is_active ? "" : "is-hidden"}`}
              key={item.id}
            >
              <span className="cnt-quotemark" aria-hidden="true">
                &ldquo;
              </span>
              <p className="cnt-quote">{item.quote}</p>

              <div className="cnt-who">
                {item.photo ? (
                  <img className="cnt-avatar" src={item.photo} alt="" loading="lazy" />
                ) : (
                  <span className="cnt-avatar-blank">{initial(item.name)}</span>
                )}
                <span className="cnt-who-text">
                  <b>{item.name}</b>
                  <small>
                    {[item.role, item.organization].filter(Boolean).join(" · ") ||
                      "No role given"}
                  </small>
                </span>
              </div>

              <div className="cnt-quote-foot">
                <span className={`cnt-pill ${item.is_active ? "live" : "hidden"}`}>
                  {item.is_active ? "Live" : "Hidden"}
                </span>
                <span className="cnt-act-spacer" />
                <Tooltip title={item.is_active ? "Hide from site" : "Show on site"}>
                  <button
                    className="cnt-act"
                    onClick={() => handleToggleActive(item)}
                    aria-label={item.is_active ? "Hide testimonial" : "Show testimonial"}
                  >
                    {item.is_active ? <FiEyeOff /> : <FiEye />}
                  </button>
                </Tooltip>
                <Tooltip title="Edit">
                  <button
                    className="cnt-act"
                    onClick={() => openEdit(item)}
                    aria-label="Edit testimonial"
                  >
                    <FiEdit2 />
                  </button>
                </Tooltip>
                <Popconfirm
                  title="Delete this testimonial?"
                  description="This cannot be undone."
                  onConfirm={() => handleDelete(item.id)}
                  okText="Delete"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Delete">
                    <button className="cnt-act danger" aria-label="Delete testimonial">
                      <FiTrash2 />
                    </button>
                  </Tooltip>
                </Popconfirm>
              </div>
            </article>
          ))}

        {!loading && visible.length === 0 && (
          <div className="cnt-empty">
            <span className="cnt-empty-glyph">
              <FiMessageSquare />
            </span>
            <b>
              {testimonials.length === 0 ? "No testimonials yet" : "Nothing matches that"}
            </b>
            <p>
              {testimonials.length === 0
                ? "Add a quote from a client or partner. It appears on the landing page as soon as it is live."
                : "Try a different search term, or switch the filter back to All."}
            </p>
            {testimonials.length === 0 && (
              <button className="con-btn con-btn-primary" onClick={openCreate}>
                <FiPlus size={15} />
                Add testimonial
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        title={editingItem ? "Edit testimonial" : "Add testimonial"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="name"
              label="Full name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="e.g. John Doe" />
            </Form.Item>
            <Form.Item name="role" label="Role / title">
              <Input placeholder="e.g. CEO" />
            </Form.Item>
          </div>

          <Form.Item name="organization" label="Organization">
            <Input placeholder="e.g. AfriDATAi" />
          </Form.Item>

          <Form.Item
            name="quote"
            label="Quote"
            rules={[{ required: true, message: "Quote is required" }]}
          >
            <TextArea rows={4} placeholder="What did they say?" />
          </Form.Item>

          <Form.Item label="Photo">
            <Upload
              beforeUpload={(file) => {
                setPhotoFile(file);
                return false;
              }}
              maxCount={1}
              accept="image/*"
              onRemove={() => setPhotoFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Visible on landing page"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-2">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ background: "var(--color-primary)", borderColor: "var(--color-primary)" }}
            >
              {editingItem ? "Save changes" : "Add testimonial"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
