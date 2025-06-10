import React, { useState, useEffect } from 'react'
import { List, Card, Typography, Spin, message, Upload, Button, Modal, Space } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { getEnrolledCourses, getExamsForStudent, downloadExam, submitExamAnswer } from '../services/api'
import PropTypes from 'prop-types'

const { Title, Text } = Typography

const StudentAssignments = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadModalVisible, setUploadModalVisible] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [fileList, setFileList] = useState([])

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    try {
      const studentId = sessionStorage.getItem('userId')
      const response = await getEnrolledCourses(studentId)
      const coursesWithExams = await Promise.all(
        response.data.map(async (course) => {
          const examsResponse = await getExamsForStudent(course.courseId)
          return { ...course, exams: examsResponse.data }
        })
      )
      setEnrolledCourses(coursesWithExams)
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      message.error('Failed to fetch enrolled courses')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (examId) => {
    try {
      const studentId = sessionStorage.getItem('userId')
      const response = await downloadExam(examId, studentId)
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `exam_${examId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Error downloading exam:', error)
      message.error('Failed to download the exam file')
    }
  }

  const handleUpload = (exam) => {
    setSelectedExam(exam)
    setUploadModalVisible(true)
    setFileList([])
  }

  const handleUploadSubmit = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload')
      return
    }

    try {
      const studentId = sessionStorage.getItem('userId')
      await submitExamAnswer(selectedExam.courseId, selectedExam.id, studentId, fileList[0].originFileObj)
      message.success('Answer sheet uploaded successfully')
      setUploadModalVisible(false)
      setFileList([])
    } catch (error) {
      console.error('Error uploading answer sheet:', error)
      message.error(`Failed to upload answer sheet: ${error.message}`)
    }
  }

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1))
  }

  const isExamActive = (exam) => {
    const now = new Date()
    return now >= new Date(exam.startDate) && now <= new Date(exam.endDate)
  }

  const ExamItem = ({ exam }) => (
    <List.Item>
      <Card
        title={exam.title}
        extra={
          <Space>
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(exam.id)}
              disabled={!isExamActive(exam)}
            >
              Download
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => handleUpload(exam)}
              disabled={!isExamActive(exam)}
            >
              Upload Answer
            </Button>
          </Space>
        }
        style={{ width: '100%' }}
      >
        <Space direction="vertical">
          <Text>Start Date: {new Date(exam.startDate).toLocaleString()}</Text>
          <Text>End Date: {new Date(exam.endDate).toLocaleString()}</Text>
          <Text>Status: {isExamActive(exam) ? 'Active' : 'Inactive'}</Text>
        </Space>
      </Card>
    </List.Item>
  )

  ExamItem.propTypes = {
    exam: PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      courseId: PropTypes.number.isRequired,
    }).isRequired,
  }

  const CourseItem = ({ course }) => (
    <List.Item>
      <Card title={course.courseTitle} style={{ width: '100%' }}>
        <List
          dataSource={course.exams}
          renderItem={(exam) => <ExamItem exam={exam} />}
          locale={{ emptyText: 'No exams available for this course' }}
        />
      </Card>
    </List.Item>
  )

  CourseItem.propTypes = {
    course: PropTypes.shape({
      courseTitle: PropTypes.string.isRequired,
      exams: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired,
        courseId: PropTypes.number.isRequired,
      })).isRequired,
    }).isRequired,
  }

  if (loading) {
    return <Spin size="large" />
  }

  return (
    <div className="p-6">
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        <List
          dataSource={enrolledCourses}
          renderItem={(course) => <CourseItem course={course} />}
          locale={{ emptyText: 'You are not enrolled in any courses' }}
        />
      </Space>
      <Modal
        title="Upload Answer Sheet"
        visible={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false)
          setFileList([])
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setUploadModalVisible(false)
            setFileList([])
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleUploadSubmit} disabled={fileList.length === 0}>
            Submit
          </Button>,
        ]}
      >
        <Upload
          accept=".pdf,.doc,.docx"
          fileList={fileList}
          onChange={handleFileChange}
          beforeUpload={() => false}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
      </Modal>
    </div>
  )
}

export default StudentAssignments