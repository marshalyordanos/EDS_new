import { useEffect, useState } from "react";
import { App, Table, Button, Modal, Form, Input, Select, Tag, Upload, Popconfirm, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import PageHeader from "../../Components/shared/PageHeader";
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
} from "../../services/contentService";

const { TextArea } = Input;

export default function BlogManagementPage() {
  const { message } = App.useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
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

  // Calculate stats for the dashboard
  const publishedPosts = posts.filter(post => post.status === 'published').length;
  const draftPosts = posts.filter(post => post.status === 'draft').length;

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-semibold" style={{ color: "var(--theme-text-primary)" }}>{text}</span>,
    },
    {
      title: "Author",
      dataIndex: "author_name",
      key: "author_name",
      render: (name) => <span style={{ color: "var(--theme-text-secondary)" }}>{name || "—"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "published" ? "green" : "default"}>
          {status === "published" ? "Published" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "Published At",
      dataIndex: "published_at",
      key: "published_at",
      render: (date) => <span style={{ color: "var(--theme-text-secondary)" }}>{date ? new Date(date).toLocaleDateString() : "—"}</span>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => <span style={{ color: "var(--theme-text-secondary)" }}>{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, post) => (
        <div className="flex items-center gap-2">
          <Tooltip title={post.status === "published" ? "Unpublish" : "Publish"}>
            <Button
              size="small"
              type={post.status === "published" ? "default" : "primary"}
              onClick={() => handleTogglePublish(post)}
              style={post.status !== "published" ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}
            >
              {post.status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(post)} />
          </Tooltip>
          <Popconfirm
            title="Delete this post?"
            onConfirm={() => handleDelete(post.slug)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        <PageHeader title="Blog Posts" description={`${posts.length} post${posts.length !== 1 ? "s" : ""} total`}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            className="dashboard-btn-primary"
          >
            New Post
          </Button>
        </PageHeader>

        <div className="dashboard-table-container">
          <Table
            dataSource={posts}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} posts`
            }}
          />
        </div>

      <Modal
        title={
          <span className="dashboard-title text-xl">
            {editingPost ? "Edit Post" : "New Blog Post"}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: "Title is required" }]}>
            <Input placeholder="Post title" />
          </Form.Item>

          <Form.Item name="body" label="Body" rules={[{ required: true, message: "Body is required" }]}>
            <TextArea rows={8} placeholder="Write your post content here..." />
          </Form.Item>

          <Form.Item label="Cover Image">
            <Upload
              beforeUpload={(file) => { setCoverFile(file); return false; }}
              maxCount={1}
              accept="image/*"
              onRemove={() => setCoverFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select image</Button>
            </Upload>
            {editingPost?.cover_image && !coverFile && (
              <p className="dashboard-meta mt-1">
                Current image will be kept if no new image is selected.
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
              {editingPost ? "Save Changes" : "Create Post"}
            </Button>
          </div>
        </Form>
      </Modal>
      </div>
    </div>
  );
}
