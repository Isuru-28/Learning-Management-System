import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      message.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      message.error('Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Forgot Password</h2>
      <Form
        name="forgot-password"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Send Reset Email
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;