import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { App, Form, Input, Button } from "antd";
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
    <div className="w-full max-w-md">
      {/* Card with modern design */}
      <div
        style={{
          backgroundColor: "var(--theme-bg-primary)",
          borderRadius: "16px",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--theme-border-light)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <div className="p-10 md:p-8">
          {/* Logo + title */}
          <div className="flex flex-col items-center ">
            <div
              className="p-2 rounded-2xl"
              style={{
                background: "var(--color-primary-ultra-light)",
                transition: "background-color 0.3s ease",
              }}
            >
              <svg
                className="w-12 h-12 text-[var(--color-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "var(--theme-text-primary)",
                marginBottom: "0.5rem",
                fontFamily: "Raleway, sans-serif",
                transition: "color 0.3s ease",
              }}
            >
              Welcome Back
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--theme-text-secondary)",
                fontFamily: "Raleway, sans-serif",
                transition: "color 0.3s ease",
              }}
            >
              Sign in to access your dashboard
            </p>
          </div>

          <Form onFinish={handleSubmit} form={form} layout="vertical">
            <Form.Item
              name="email"
              label={
                <span
                  style={{
                    color: "var(--theme-text-secondary)",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  Email Address
                </span>
              }
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="you@example.com"
                className="rounded-xl"
                style={{
                  backgroundColor: "var(--theme-bg-tertiary)",
                  borderColor: "var(--theme-border-medium)",
                  color: "var(--theme-text-primary)",
                }}
                prefix={
                  <svg
                    className="w-5 h-5 mr-2"
                    style={{ color: "var(--theme-text-muted)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{
                    color: "var(--theme-text-secondary)",
                    fontWeight: "600",
                    fontSize: "0.875rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  Password
                </span>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                size="large"
                placeholder="Enter your password"
                className="rounded-xl"
                style={{
                  backgroundColor: "var(--theme-bg-tertiary)",
                  borderColor: "var(--theme-border-medium)",
                  color: "var(--theme-text-primary)",
                }}
                prefix={
                  <svg
                    className="w-5 h-5 mr-2"
                    style={{ color: "var(--theme-text-muted)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
            </Form.Item>

            {/* Forgot password */}
            <div className="flex justify-end -mt-3 mb-6">
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-sm font-semibold cursor-pointer border-none bg-transparent p-0 hover:underline transition-all"
                style={{
                  color: "var(--color-primary)",
                  fontFamily: "Raleway, sans-serif",
                }}
              >
                Forgot password?
              </button>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="large"
                style={{
                  height: "52px",
                  fontSize: "15px",
                  fontFamily: "Raleway, sans-serif",
                  background: "var(--gradient-primary)",
                  border: "none",
                }}
              >
                SIGN IN
              </Button>
            </Form.Item>
          </Form>

          {/* Divider */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--theme-border-light)",
              transition: "border-color 0.3s ease",
            }}
          >
            <p
              style={{
                textAlign: "center",
                fontSize: "0.75rem",
                color: "var(--theme-text-muted)",
                fontFamily: "Raleway, sans-serif",
                transition: "color 0.3s ease",
              }}
            >
              Need help? Contact{" "}
              <a
                href="mailto:support@afridatai.com"
                className="text-[var(--color-primary)] hover:underline font-semibold"
              >
                support@afridatai.com
              </a>
            </p>
          </div>
        </div>
      </div>
      {/* 
      <p style={{ 
        textAlign: "center", 
        fontSize: "0.75rem", 
        color: "var(--theme-text-muted)", 
        marginTop: "2rem", 
        fontFamily: 'Raleway, sans-serif',
        transition: "color 0.3s ease"
      }}>
        © 2025 AfriDATAI Expert Database System. All rights reserved.
      </p> */}
    </div>
  );
};

export default LoginForm;
