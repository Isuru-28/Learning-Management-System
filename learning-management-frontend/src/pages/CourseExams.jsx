import React, { useState, useEffect } from 'react'
import { Table, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { getExamsByCourse } from '../services/api'

const CourseExams = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(false)
  const { courseId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
  }, [courseId])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const response = await getExamsByCourse(courseId)
      setExams(response.data)
    } catch (error) {
      message.error('Failed to fetch exams')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Exam Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => new Date(text).toLocaleString(),
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h2>Course Exams</h2>
      <Table 
        columns={columns} 
        dataSource={exams} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`/instructor/grade-exams/${courseId}/${record.id}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}

export default CourseExams