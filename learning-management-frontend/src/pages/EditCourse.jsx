import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseById, updateCourse } from '../services/api';

const EditCourse = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCourseById(id);
        form.setFieldsValue(response.data);
      } catch (error) {
        message.error('Failed to fetch course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const instructorId = sessionStorage.getItem('userId');
      if (!instructorId) {
        throw new Error('Instructor ID not found');
      }
      await updateCourse(id, values, instructorId);
      message.success('Course updated successfully');
      navigate('/instructor/courses');
    } catch (error) {
      message.error('Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Edit Course</h1>
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
            Update Course
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditCourse;