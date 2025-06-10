import React, { useState, useEffect } from 'react'
import { Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getCourses } from '../services/api'

const GradeExams = () => {
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
      title: 'Course Title',
      dataIndex: 'title',
      key: 'title',
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <h2>Grade Exams</h2>
      <Table 
        columns={columns} 
        dataSource={courses} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`/instructor/grade-exams/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}

export default GradeExams