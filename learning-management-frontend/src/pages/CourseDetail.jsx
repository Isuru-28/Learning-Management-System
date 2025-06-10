import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCourseById, deleteCourse } from '../services/api';
import CourseFiles from './CourseFiles';
import InstructorExamManagement from './InstructorExamManagement';
import StudentExamList from './StudentExamList';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRole = sessionStorage.getItem('userRole');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const response = await getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      message.error('Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const instructorId = sessionStorage.getItem('userId');
      await deleteCourse(id, instructorId);
      message.success('Course deleted successfully');
      navigate('/instructor/courses');
    } catch (error) {
      message.error('Failed to delete course');
    }
  };

  const items = [
    {
      key: '1',
      label: 'Course Files',
      children: <CourseFiles courseId={id} />,
    },
    {
      key: '2',
      label: 'Exams',
      children: userRole === 'INSTRUCTOR' ? <InstructorExamManagement courseId={id} /> : <StudentExamList courseId={id} />,
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      {userRole === 'INSTRUCTOR' && (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/instructor/courses/edit/${id}`)}
            style={{ marginRight: 8 }}
          >
            Edit Course
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Delete Course
          </Button>
        </>
      )}

      <Tabs items={items} defaultActiveKey="1" style={{ marginTop: 16 }} />
    </div>
  );
};

export default CourseDetail;