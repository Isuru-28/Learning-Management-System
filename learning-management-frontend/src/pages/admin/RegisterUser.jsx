import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { registerAdminUser } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const RegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await registerAdminUser(values, values.role);
      message.success('User registered successfully!');
      navigate('/admin/users');
    } catch (error) {
      const errorMessage = error.response?.data === 'Email is already in use'
        ? 'This email is already registered'
        : 'Failed to register user. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const nameRules = [
    { required: true, message: 'This field is required!' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Should contain only letters.' },
    { max: 30, message: 'Cannot exceed 30 characters.' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Register User</h2>
      <Form name="register-user" onFinish={onFinish} layout="vertical">
        <Form.Item label="First Name" name="firstname" rules={nameRules}>
          <Input />
        </Form.Item>
        <Form.Item label="Last Name" name="lastname" rules={nameRules}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, type: 'email', message: 'Please input a valid email!' },
            { max: 50, message: 'Email cannot exceed 50 characters.' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: 'Please input phone number!' },
            { pattern: /^\d{10}$/, message: 'Must be exactly 10 digits.' }
          ]}
        >
          <Input type="tel" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input a password!' },
            { min: 8, message: 'Password must be at least 8 characters.' }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="User Role"
          name="role"
          rules={[{ required: true, message: 'Please select a user role!' }]}
        >
          <Select placeholder="Select a role">
            <Option value="STUDENT">Student</Option>
            <Option value="INSTRUCTOR">Instructor</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RegisterUser;