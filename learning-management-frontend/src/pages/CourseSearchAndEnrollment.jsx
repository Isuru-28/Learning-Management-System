import React, { useState, useEffect } from 'react'
import { Table, Input, Button, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { searchCourses, enrollInCourse, getEnrolledCourses } from '../services/api'

const { Search } = Input

const CourseSearchAndEnrollment = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set())

  const studentId = sessionStorage.getItem('userId')

  useEffect(() => {
    fetchAllCourses()
    fetchEnrolledCourses()
  }, [])

  const fetchAllCourses = async () => {
    setLoading(true)
    try {
      const response = await searchCourses('')
      setCourses(response.data)
      setFilteredCourses(response.data)
    } catch (error) {
      message.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrolledCourses = async () => {
    try {
      const response = await getEnrolledCourses(studentId)
      const enrolledIds = new Set(response.data.map(course => course.courseId))
      setEnrolledCourseIds(enrolledIds)
    } catch (error) {
      message.error('Failed to fetch enrolled courses')
    }
  }

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase().trim()
    const filtered = lowercasedValue === '' ? courses : courses.filter(
      course =>
        course.title.toLowerCase().includes(lowercasedValue) ||
        course.description.toLowerCase().includes(lowercasedValue) ||
        `${course.instructor.firstname} ${course.instructor.lastname}`.toLowerCase().includes(lowercasedValue)
    )
    setFilteredCourses(filtered)
  }

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId, studentId)
      message.success('Successfully enrolled in the course')
      setEnrolledCourseIds(prev => new Set(prev).add(courseId))
    } catch (error) {
      message.error('Failed to enroll in the course')
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
    {
      title: 'Instructor',
      dataIndex: ['instructor', 'firstname'],
      key: 'instructor',
      render: (_, record) => `${record.instructor.firstname} ${record.instructor.lastname}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          onClick={() => handleEnroll(record.id)}
          disabled={enrolledCourseIds.has(record.id)}
        >
          {enrolledCourseIds.has(record.id) ? 'Enrolled' : 'Enroll'}
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h2>Course Search and Enrollment</h2>
      <Search
        placeholder="Search courses"
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 300, marginBottom: '20px' }}
      />
      <Table 
        columns={columns} 
        dataSource={filteredCourses} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}

export default CourseSearchAndEnrollment