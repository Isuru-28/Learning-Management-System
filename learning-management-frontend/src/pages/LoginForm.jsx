import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const { Title, Text } = Typography;

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await loginUser(values);
      const token = response.data.token;
      const decodedToken = jwtDecode(token);

      const userRole = decodedToken.authorities[0];
      const fullname = decodedToken.fullname;
      const userEmail = decodedToken.sub;
      const userId = decodedToken.userId;

      if (!userId) {
        throw new Error('User ID not found in the token');
      }

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userRole', userRole);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('userEmail', userEmail);
      sessionStorage.setItem('fullname', fullname);

      message.success('Login successful!');
      
      switch (userRole) {
        case 'ADMIN':
          navigate('/admin/users');
          break;
        case 'INSTRUCTOR':
          navigate('/instructor/courses');
          break;
        case 'STUDENT':
          navigate('/student/enrollments');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Title level={2} style={styles.title}>Login</Title>
      <Form
        name="login"
        onFinish={onFinish}
        layout="vertical"
        style={styles.form}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
          style={styles.formItem}
        >
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
          style={styles.formItem}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item style={styles.formItem}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Login
          </Button>
        </Form.Item>
        <Form.Item style={styles.formItem}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </Form.Item>
      </Form>
      <div style={styles.footer}>
        <Text> Dont have an account?</Text>
        <Link to="/register" style={styles.registerLink}>
          Register here
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
  registerLink: {
    marginLeft: '5px',
    color: '#1890ff',
  },
};

export default LoginForm;