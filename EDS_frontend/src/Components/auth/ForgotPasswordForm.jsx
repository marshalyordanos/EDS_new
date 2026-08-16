import { useState } from 'react';
import { FiArrowLeft, FiMail } from 'react-icons/fi';
import { Form, Input, Button, App } from 'antd';
import { requestPasswordReset } from '../../services/authService'

const ForgotPasswordForm = ({ onBackToLoginClick, onCodeSent }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

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
    <>
      <div className="auth-heading">
        <p className="auth-eyebrow">Account recovery</p>
        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-subtitle">
          Enter your registered email and we'll send you a verification code.
        </p>
      </div>

      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="email"
          label={<span className="auth-field-label">Email address</span>}
          rules={[
            { required: true, message: 'Please enter your email address!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            size="large"
            placeholder="you@example.com"
            prefix={<FiMail style={{ color: "var(--theme-text-muted)" }} />}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            className="auth-submit"
          >
            Send verification code
          </Button>
        </Form.Item>
      </Form>

      <button onClick={onBackToLoginClick} className="auth-back-link">
        <FiArrowLeft />
        Back to login
      </button>
    </>
  );
};

export default ForgotPasswordForm;
