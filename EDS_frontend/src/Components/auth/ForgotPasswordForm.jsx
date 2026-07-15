import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Form, Input, Button, App } from 'antd';
import { useTheme } from '../../context/ThemeContext';
import fullLogoWhite from "../../assets/full-logo-white.svg";
import fullLogoRed from "../../assets/full-logo-red.svg";
import { requestPasswordReset } from '../../services/authService'


const ForgotPasswordForm = ({ onBackToLoginClick, onCodeSent }) => {
  const { message } = App.useApp();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const logoSrc = resolvedTheme === "dark" ? fullLogoWhite : fullLogoRed;

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await requestPasswordReset(values.email);
      message.success(`A verification code has been sent to ${values.email}. Please check your inbox.`);
      if (onCodeSent) onCodeSent();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.error ||
        'Failed to send reset link. Please check the email and try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: "var(--theme-bg-primary)",
          border: "1px solid var(--theme-border-light)",
        }}
      >
        {/* Red top bar */}
        <div className="h-1.5 w-full" style={{ background: 'var(--gradient-primary)' }} />

        <div className="p-8 md:p-10">
          {/* Logo + title */}
          <div className="flex flex-col items-center mb-8">
            <img src={logoSrc} alt="AfriDATAi" className="h-12 w-auto mb-5" />
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Raleway, sans-serif', color: 'var(--theme-text-primary)' }}>
              Reset your password
            </h2>
            <p className="text-sm mt-1 text-center" style={{ fontFamily: 'Raleway, sans-serif', color: 'var(--theme-text-secondary)' }}>
              Enter your registered email and we'll send you a verification code.
            </p>
          </div>

          <Form onFinish={handleSubmit} layout="vertical">
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email address!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input placeholder="you@example.com" size="large" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full font-bold"
                size="large"
                style={{ height: '48px', fontSize: '15px', fontFamily: 'Raleway, sans-serif' }}
              >
                Send Verification Code
              </Button>
            </Form.Item>
          </Form>

          <button
            onClick={onBackToLoginClick}
            className="mt-6 cursor-pointer text-sm font-semibold flex items-center justify-center w-full border-none bg-transparent"
            style={{ color: 'var(--color-primary)', fontFamily: 'Raleway, sans-serif' }}
          >
            <FiArrowLeft className="mr-2" />
            Back to Login
          </button>
        </div>
      </div>

      <p className="text-center text-xs mt-6" style={{ fontFamily: 'Raleway, sans-serif', color: 'var(--theme-text-muted)' }}>
        © 2025 AfriDATAI Expert Database System
      </p>
    </div>
  );
};

export default ForgotPasswordForm;