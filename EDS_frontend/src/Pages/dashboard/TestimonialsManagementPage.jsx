import { useEffect, useState } from "react";
import { App, Table, Button, Modal, Form, Input, Switch, Upload, Popconfirm, Tooltip, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "../../services/contentService";
import PageHeader from "../../Components/shared/PageHeader";
const { TextArea } = Input;

export default function TestimonialsManagementPage() {
  const { message } = App.useApp();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
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
      message.success(item.is_active ? "Testimonial hidden." : "Testimonial activated.");
      fetchTestimonials();
    } catch {
      message.error("Failed to update testimonial.");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-semibold" style={{ color: "var(--theme-text-primary)" }}>{text}</span>,
    },
    {
      title: "Role / Organization",
      key: "role_org",
      render: (_, item) => (
        <div>
          <p style={{ color: "var(--theme-text-secondary)", fontSize: "0.875rem" }}>{item.role || "—"}</p>
          <p style={{ color: "var(--theme-text-muted)", fontSize: "0.75rem" }}>{item.organization || "—"}</p>
        </div>
      ),
    },
    {
      title: "Quote",
      dataIndex: "quote",
      key: "quote",
      render: (text) => (
        <span style={{ color: "var(--theme-text-secondary)", fontSize: "0.875rem" }}>
          {text.length > 80 ? text.slice(0, 80) + "…" : text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => (
        <Tag color={active ? "green" : "default"}>{active ? "Active" : "Hidden"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <Tooltip title={item.is_active ? "Hide" : "Show"}>
            <Button
              size="small"
              type={item.is_active ? "default" : "primary"}
              onClick={() => handleToggleActive(item)}
              style={!item.is_active ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}
            >
              {item.is_active ? "Hide" : "Show"}
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(item)} />
          </Tooltip>
          <Popconfirm
            title="Delete this testimonial?"
            onConfirm={() => handleDelete(item.id)}
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
    <div>
      <PageHeader title="Testimonials" description={`${testimonials.length} testimonial${testimonials.length !== 1 ? "s" : ""} total`}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{ background: "var(--color-primary)", borderColor: "var(--color-primary)" }}
        >
          Add Testimonial
        </Button>
      </PageHeader>

      <div style={{ 
        backgroundColor: "var(--theme-bg-primary)", 
        border: "1px solid var(--theme-border-light)", 
        borderRadius: "16px", 
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)"
      }}>
        <Table
          dataSource={testimonials}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingItem ? "Edit Testimonial" : "Add Testimonial"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: "Name is required" }]}>
              <Input placeholder="e.g. John Doe" />
            </Form.Item>
            <Form.Item name="role" label="Role / Title">
              <Input placeholder="e.g. CEO" />
            </Form.Item>
          </div>

          <Form.Item name="organization" label="Organization">
            <Input placeholder="e.g. AfriDATAi" />
          </Form.Item>

          <Form.Item name="quote" label="Quote" rules={[{ required: true, message: "Quote is required" }]}>
            <TextArea rows={4} placeholder="What did they say?" />
          </Form.Item>

          <Form.Item label="Photo">
            <Upload
              beforeUpload={(file) => { setPhotoFile(file); return false; }}
              maxCount={1}
              accept="image/*"
              onRemove={() => setPhotoFile(null)}
            >
              <Button icon={<UploadOutlined />}>Select photo</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="is_active" label="Visible on landing page" valuePropName="checked" initialValue={true}>
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
              {editingItem ? "Save Changes" : "Add Testimonial"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
