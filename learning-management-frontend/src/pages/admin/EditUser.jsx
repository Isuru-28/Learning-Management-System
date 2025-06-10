import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Tag, Switch } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditUser = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`http://localhost:8088/api/v1/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        message.error('Failed to fetch user data.');
      }
    };

    fetchUser();
  }, [id]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:8088/api/v1/admin/users/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('User updated successfully!');
      navigate('/admin/users');
    } catch (error) {
      message.error('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  const nameRules = [
    { required: true, message: 'This field is required!' },
    { pattern: /^[A-Za-z\s]+$/, message: 'Should contain only letters.' },
    { max: 30, message: 'Cannot exceed 30 characters.' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Edit User</h2>
      <Form
        name="edit-user"
        onFinish={onFinish}
        layout="vertical"
        initialValues={userData}
      >
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
        <Form.Item label="Account Status" name="enabled" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>
        <Form.Item label="User Roles">
          {userData.roles.map(role => (
            <Tag key={role.id} color="blue">{role.name}</Tag>
          ))}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditUser;