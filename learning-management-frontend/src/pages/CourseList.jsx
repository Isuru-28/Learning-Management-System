import React, { useState, useEffect } from 'react'
import { Table, Button, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getCourses } from '../services/api'

const CourseList = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const instructorId = sessionStorage.getItem('userId')
      if (!instructorId) {
        throw new Error('Instructor ID not found')
      }
      const response = await getCourses()
      const filteredCourses = response.data.filter(course => course.instructor.id.toString() === instructorId)
      setCourses(filteredCourses)
    } catch (error) {
      message.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h2>Course List</h2>
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={() => navigate('/instructor/courses/create')}
        style={{ marginBottom: '16px' }}
      >
        Create New Course
      </Button>
      <Table 
        columns={columns} 
        dataSource={courses} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`/instructor/courses/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}

export default CourseList