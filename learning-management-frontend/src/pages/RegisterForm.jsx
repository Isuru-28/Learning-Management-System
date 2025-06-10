import React, { useState } from 'react';
import { Form, Input, Button, message, Typography, Row, Col } from 'antd';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match. Please try again.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(values);
      message.success('Registration successful! Please check your email for activation.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data === 'Email is already in use') {
        message.error('This email is already registered');
      } else {
        message.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Title level={3} style={styles.title}>
        Student Register
      </Title>

      <Form
        name="register"
        onFinish={onFinish}
        layout="vertical"
        style={styles.form}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                { required: true, message: 'Please input first name!' },
                { pattern: /^[A-Za-z\s]+$/, message: 'First name should contain only letters.' },
                { max: 30, message: 'First name cannot exceed 30 characters.' }
              ]}
              style={styles.formItem}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[
                { required: true, message: 'Please input last name!' },
                { pattern: /^[A-Za-z\s]+$/, message: 'Last name should contain only letters.' },
                { max: 30, message: 'Last name cannot exceed 30 characters.' }
              ]}
              style={styles.formItem}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input a valid email!' },
            { type: 'email', message: 'Please input a valid email format!' },
            { max: 50, message: 'Email cannot exceed 50 characters.' }
          ]}
          style={styles.formItem}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: 'Please input phone number!' },
            { pattern: /^\d{10}$/, message: 'Phone number must be exactly 10 digits without symbols or spaces.' }
          ]}
          style={styles.formItem}
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
          style={styles.formItem}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm your password!' }]}
          style={styles.formItem}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item style={styles.formItem}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form.Item>
      </Form>

      <div style={styles.footer}>
        <Text>Already have an account?</Text>
        <Link to="/login" style={styles.loginLink}>
          Login here
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '40px',
    textAlign: 'center',
  },
  form: {
    margin: '10px 0',
  },
  title: {
    marginBottom: '20px',
  },
  formItem: {
    marginBottom: '10px',
  },
  footer: {
    marginTop: '20px',
  },
  loginLink: {
    marginLeft: '5px',
    color: '#1890ff',
  },
};

export default RegisterForm;