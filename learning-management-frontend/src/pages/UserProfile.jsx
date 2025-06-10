import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Tabs } from 'antd';
import { getUserProfile, updateUserProfile, changePassword } from '../services/api';

const { TabPane } = Tabs;

const UserProfile = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      form.setFieldsValue(response.data);
    } catch (error) {
      message.error('Failed to fetch user profile');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updateUserProfile(values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordChange = async (values) => {
    setLoading(true);
    try {
      await changePassword(values);
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>User Profile</h2>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Profile Information" key="1">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              label="First Name"
              name="firstname"
              rules={[
                { required: true, message: 'Please input first name!' },
                { pattern: /^[A-Za-z\s]+$/, message: 'First name should contain only letters.' },
                { max: 30, message: 'First name cannot exceed 30 characters.' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastname"
              rules={[
                { required: true, message: 'Please input last name!' },
                { pattern: /^[A-Za-z\s]+$/, message: 'Last name should contain only letters.' },
                { max: 30, message: 'Last name cannot exceed 30 characters.' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input a valid email!' },
                { type: 'email', message: 'Please input a valid email format!' },
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
                { pattern: /^\d{10}$/, message: 'Phone number must be exactly 10 digits without symbols or spaces.' }
              ]}
            >
              <Input type="tel" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="Change Password" key="2">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={onPasswordChange}
          >
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 8, message: 'Password must be at least 8 characters long.' }
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserProfile;