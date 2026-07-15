import { Form, Input, Button, App } from 'antd';
import { changePassword } from "../../services/authService";
import { useState } from 'react';

const ChangePasswordForm = ({ form, onSuccess, onCancel }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await changePassword(values.old_password, values.new_password);
      message.success("Password changed successfully!");
      if (onSuccess) {
        onSuccess(); 
      }
    } catch (error) {
      const errorMsg = error.response?.data?.current_password?.[0] || 
                       error.response?.data?.new_password?.[0] ||
                       "Failed to change password. Please check your current password.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="old_password"
        label="Old Password"
        rules={[{ required: true, message: 'Please enter your old password!' }]}
      >
        <Input.Password placeholder="Enter your old password" />
      </Form.Item>

      <Form.Item
        name="new_password"
        label="New Password"
        rules={[{ required: true, message: 'Please enter your new password!' }]}
        hasFeedback
      >
        <Input.Password placeholder="Enter a strong new password" />
      </Form.Item>

      <Form.Item
        name="confirm_new_password"
        label="Confirm New Password"
        dependencies={['new_password']}
        hasFeedback
        rules={[
          { required: true, message: 'Please confirm your new password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('new_password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The new passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm your new password" />
      </Form.Item>

      <Form.Item className="mt-6 text-right">
        <Button key="back" onClick={onCancel} style={{ marginRight: 8 }} className="hover:shadow-md">
          Cancel
        </Button>
        <Button key="submit" type="primary" htmlType="submit" loading={loading}>
          Change Password
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;