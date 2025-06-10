import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../services/api';

const CreateCourse = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const instructorId = sessionStorage.getItem('userId');
      if (!instructorId) {
        message.error('User ID not found. Please log in again.');
        navigate('/login');
        return;
      }
      
      await createCourse(values, instructorId);
      message.success('Course created successfully');
      navigate('/instructor/courses');
    } catch (error) {
      message.error('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Create New Course</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Course Title"
          rules={[{ required: true, message: 'Please input the course title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Course Description"
          rules={[{ required: true, message: 'Please input the course description!' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Course
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateCourse;