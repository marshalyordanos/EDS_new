import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Form, Input, Button } from "antd";
import { FiMail, FiLock } from "react-icons/fi";
import { loginUser } from "../../services/authService";

const LoginForm = ({ onForgotPasswordClick, setRole2, setToken }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const data = await loginUser(values.email, values.password);
      message.success("Login Successful!");
      setLoading(false);

      if (data.tokens && data.tokens.access && data.tokens.refresh) {
        localStorage.setItem("accessToken", data.tokens.access);
        if (setToken) setToken(data.tokens.access);
        localStorage.setItem("refreshToken", data.tokens.refresh);
        localStorage.setItem("userFirstName", data.user.first_name);
        localStorage.setItem("userLastName", data.user.last_name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userIsSuperuser", data.user.is_superuser);
        setRole2(data.user.role);
        localStorage.setItem("userId", data.user.id);

        if (data.user.role === "admin") {
          navigate("/dashboard/home");
        } else if (data.user.role === "company") {
          navigate("/dashboard/company");
        } else if (data.user.role === "content_manager") {
          navigate("/dashboard/content/blog");
        }
      } else {
        message.error("Authentication failed: No token received.");
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data && error.response.data.error) {
        message.error(error.response.data.error);
      } else {
        message.error("An unknown error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="auth-heading">
        <p className="auth-eyebrow">Expert Database System</p>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-subtitle">Access your organization's dashboard.</p>
      </div>

      <Form onFinish={handleSubmit} form={form} layout="vertical">
        <Form.Item
          name="email"
          label={<span className="auth-field-label">Email address</span>}
          rules={[
            { required: true, type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            size="large"
            placeholder="you@example.com"
            prefix={<FiMail style={{ color: "var(--theme-text-muted)" }} />}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="auth-field-label">Password</span>}
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password
            size="large"
            placeholder="Enter your password"
            prefix={<FiLock style={{ color: "var(--theme-text-muted)" }} />}
          />
        </Form.Item>

        <div className="auth-forgot-row">
          <button type="button" onClick={onForgotPasswordClick} className="auth-link">
            Forgot password?
          </button>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="auth-submit"
          >
            Sign in
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginForm;
