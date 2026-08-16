import { useEffect, useMemo, useState } from "react";
import { App, Button, Modal, Form, Input, Select, Upload, Popconfirm, Tooltip } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiSend,
  FiEdit3,
} from "react-icons/fi";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
} from "../../services/contentService";
import "../../styles/console.css";
import "../../styles/content.css";

const { TextArea } = Input;

/* Strip the body down to a one-glance excerpt for the card. */
const excerpt = (body = "") => body.replace(/\s+/g, " ").trim();

const initial = (text = "") => (text.trim()[0] || "?").toUpperCase();

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

export default function BlogManagementPage() {
  const { message } = App.useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form] = Form.useForm();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getBlogPosts(true);
      setPosts(res.data.results ?? res.data);
    } catch {
      message.error("Failed to load blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreate = () => {
    setEditingPost(null);
    setCoverFile(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (post) => {
    setEditingPost(post);
    setCoverFile(null);
    form.setFieldsValue({ title: post.title, body: post.body, status: post.status });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("body", values.body);
      formData.append("status", values.status);
      if (coverFile) formData.append("cover_image", coverFile);

      if (editingPost) {
        await updateBlogPost(editingPost.slug, formData);
        message.success("Post updated.");
      } else {
        await createBlogPost(formData);
        message.success("Post created.");
      }
      setModalOpen(false);
      fetchPosts();
    } catch (err) {
      message.error(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slug) => {
    try {
      await deleteBlogPost(slug);
      message.success("Post deleted.");
      fetchPosts();
    } catch {
      message.error("Failed to delete post.");
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      if (post.status === "published") {
        await unpublishBlogPost(post.slug);
        message.success("Post unpublished.");
      } else {
        await publishBlogPost(post.slug);
        message.success("Post published.");
      }
      fetchPosts();
    } catch {
      message.error("Failed to update status.");
    }
  };

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.length - publishedCount;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (!q) return true;
      return (
        post.title?.toLowerCase().includes(q) ||
        post.author_name?.toLowerCase().includes(q) ||
        post.body?.toLowerCase().includes(q)
      );
    });
  }, [posts, query, statusFilter]);

  const filters = [
    { key: "all", label: "All", count: posts.length },
    { key: "published", label: "Published", count: publishedCount },
    { key: "draft", label: "Drafts", count: draftCount },
  ];

  return (
    <div className="cnt-page">
      <header className="cnt-head">
        <div className="cnt-head-text">
          <span className="cnt-eyebrow">Content</span>
          <h1>Blog</h1>
          <p>Write, publish, and keep the public journal current.</p>
        </div>
        <div className="cnt-head-actions">
          <button className="con-btn con-btn-primary" onClick={openCreate}>
            <FiPlus size={15} />
            New post
          </button>
        </div>
      </header>

      <div className="cnt-stats">
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph brand">
            <FiFileText />
          </span>
          <span>
            <b>{loading ? "—" : posts.length}</b>
            <small>Total posts</small>
          </span>
        </div>
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph good">
            <FiSend />
          </span>
          <span>
            <b>{loading ? "—" : publishedCount}</b>
            <small>Published</small>
          </span>
        </div>
        <div className="con-card cnt-stat">
          <span className="cnt-stat-glyph draft">
            <FiEdit3 />
          </span>
          <span>
            <b>{loading ? "—" : draftCount}</b>
            <small>Drafts</small>
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
            placeholder="Search posts by title, author, or text"
            aria-label="Search posts"
          />
        </div>
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

      <div className="cnt-grid">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div className="con-card cnt-card" key={`skeleton-${i}`}>
              <div className="con-skeleton cnt-skel-cover" />
              <div className="cnt-card-body">
                <div className="con-skeleton cnt-skel-line" style={{ width: "80%" }} />
                <div className="con-skeleton cnt-skel-line" style={{ width: "95%" }} />
                <div className="con-skeleton cnt-skel-line" style={{ width: "60%" }} />
              </div>
            </div>
          ))}

        {!loading &&
          visible.map((post) => {
            const live = post.status === "published";
            const date = formatDate(post.published_at || post.created_at);
            return (
              <article className="con-card cnt-card" key={post.id}>
                <div className="cnt-cover">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt="" loading="lazy" />
                  ) : (
                    <div className="cnt-cover-blank">{initial(post.title)}</div>
                  )}
                  <span className={`cnt-pill ${live ? "live" : "draft"}`}>
                    {live ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="cnt-card-body">
                  <h3 className="cnt-card-title">{post.title}</h3>
                  <p className="cnt-excerpt">{excerpt(post.body)}</p>
                  <div className="cnt-meta">
                    <span>{post.author_name || "Unattributed"}</span>
                    {date && <span className="cnt-meta-dot">·</span>}
                    {date && <span>{date}</span>}
                  </div>
                </div>

                <div className="cnt-card-foot">
                  <Tooltip title={live ? "Unpublish" : "Publish"}>
                    <button
                      className="cnt-act"
                      onClick={() => handleTogglePublish(post)}
                      aria-label={live ? "Unpublish post" : "Publish post"}
                    >
                      {live ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <button
                      className="cnt-act"
                      onClick={() => openEdit(post)}
                      aria-label="Edit post"
                    >
                      <FiEdit2 />
                    </button>
                  </Tooltip>
                  <span className="cnt-act-spacer" />
                  <Popconfirm
                    title="Delete this post?"
                    description="This cannot be undone."
                    onConfirm={() => handleDelete(post.slug)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Delete">
                      <button className="cnt-act danger" aria-label="Delete post">
                        <FiTrash2 />
                      </button>
                    </Tooltip>
                  </Popconfirm>
                </div>
              </article>
            );
          })}

        {!loading && visible.length === 0 && (
          <div className="cnt-empty">
            <span className="cnt-empty-glyph">
              <FiFileText />
            </span>
            <b>{posts.length === 0 ? "No posts yet" : "Nothing matches that"}</b>
            <p>
              {posts.length === 0
                ? "Write the first post to start the journal. Drafts stay private until you publish them."
                : "Try a different search term, or switch the status filter back to All."}
            </p>
            {posts.length === 0 && (
              <button className="con-btn con-btn-primary" onClick={openCreate}>
                <FiPlus size={15} />
                New post
              </button>
            )}
          </div>
        )}
      </div>

      <Modal
        title={editingPost ? "Edit post" : "New post"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Post title" />
          </Form.Item>

          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, message: "Body is required" }]}
          >
            <TextArea rows={8} placeholder="Write your post content here..." />
          </Form.Item>

          <Form.Item label="Cover image">
            <Upload
              beforeUpload={(file) => {
                setCoverFile(file);
                return false;
              }}
              maxCount={1}
              accept="image/*"
              onRemove={() => setCoverFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select image</Button>
            </Upload>
            {editingPost?.cover_image && !coverFile && (
              <p className="dashboard-meta mt-1">
                The current image is kept unless you choose a new one.
              </p>
            )}
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="draft">
            <Select>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="published">Published</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-2">
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="dashboard-btn-primary"
            >
              {editingPost ? "Save changes" : "Create post"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
