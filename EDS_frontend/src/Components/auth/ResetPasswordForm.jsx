import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Form, Input, Button, App } from "antd";
import { useTheme } from "../../context/ThemeContext";
import logomarkWhite from "../../assets/logomark-white.svg";
import logomarkRed from "../../assets/logomark-red.svg";
import { confirmPasswordReset } from "../../services/authService"

const ResetPasswordForm = ({ uid, token, onPasswordResetSuccess, onBackToLoginClick }) => {
  const { message } = App.useApp();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const logoSrc = resolvedTheme === "dark" ? logomarkRed : logomarkWhite;

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await confirmPasswordReset(uid, token, values.password);
      

      message.success("Your password has been reset successfully! You can now log in.");
      
      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(); 
      }

    } catch (error) {
      const errorData = error.response?.data;
      let errorMessage = "An unknown error occurred.";
      if (errorData) {
        errorMessage = Object.values(errorData).flat().join(' ');
      }
      message.error(errorMessage || "Failed to reset password. The code may be invalid or expired.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-8 md:p-12 flex items-center justify-center">
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-8"
        style={{
          backgroundColor: "var(--theme-bg-primary)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logoSrc} alt="AfriDATAi" className="h-16 w-16 mb-4" />
          <h2 className="text-xl font-bold" style={{ color: "var(--theme-text-primary)" }}>Set a New Password</h2>
          <p className="text-sm mt-2" style={{ color: "var(--theme-text-secondary)" }}>
            Please enter and confirm your new password below.
          </p>
        </div>

        <Form name="reset_password" onFinish={handleSubmit} layout="vertical" autoComplete="off">

          <Form.Item
            name="password"
            label="New Password"
            rules={[{ required: true, message: "Please enter your new password!" }]}
            hasFeedback
          >
            <Input.Password
              placeholder="Enter a strong password"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm New Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your new password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("The two passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm your new password"
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full font-bold"
              size="large"
              style={{ borderRadius: '9999px' }}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6 !text-[var(--color-primary)] hover:underline">
          <button
            onClick={onBackToLoginClick}
            className="cursor-pointer text-sm font-semibold flex items-center justify-center w-full transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;