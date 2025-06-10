import React, { useState, useEffect } from 'react'
import { List, Button, message, Modal, Spin, Typography, Row, Col } from 'antd'
import { BookOutlined, DownloadOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons'
import { getEnrolledCourses, getCourseFiles, downloadFile, unenrollFromCourse, generateTranscript } from '../services/api'

const { Title } = Typography

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [courseFiles, setCourseFiles] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  const userId = sessionStorage.getItem('userId')

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  const fetchEnrolledCourses = async () => {
    setLoading(true)
    try {
      const response = await getEnrolledCourses(userId)
      setEnrolledCourses(response.data)
    } catch (error) {
      message.error('Failed to fetch enrolled courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseFiles = async (courseId) => {
    setLoading(true)
    try {
      const response = await getCourseFiles(courseId)
      const filteredFiles = response.data.filter(file => file.fileType !== "EXAM_SUBMISSION")
      setCourseFiles(filteredFiles)
      setSelectedCourseId(courseId)
      setIsModalVisible(true)
    } catch (error) {
      message.error('Failed to fetch course files')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId) => {
    try {
      const response = await downloadFile(fileId, userId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'file')
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      message.error('Failed to download file')
    }
  }

  const handleUnenroll = async (courseId) => {
    try {
      await unenrollFromCourse(courseId, userId)
      message.success('Successfully unenrolled from the course')
      fetchEnrolledCourses()
    } catch (error) {
      message.error('Failed to unenroll from the course')
    }
  }

  const handleGenerateTranscript = async () => {
    setLoading(true)
    try {
      const response = await generateTranscript(userId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'transcript.pdf')
      document.body.appendChild(link)
      link.click()
      message.success('Transcript generated and downloaded successfully')
    } catch (error) {
      message.error('Failed to generate transcript')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>Enrolled Courses</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={handleGenerateTranscript}
            loading={loading}
          >
            Generate Transcript
          </Button>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <List
          itemLayout="horizontal"
          dataSource={enrolledCourses}
          renderItem={(item) => (
            <List.Item
              key={item.courseId}
              actions={[
                <Button
                  key="view"
                  icon={<BookOutlined />}
                  onClick={() => fetchCourseFiles(item.courseId)}
                >
                  View Files
                </Button>,
                <Button
                  key="unenroll"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleUnenroll(item.courseId)}
                >
                  Unenroll
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.courseTitle}
                description={`Enrolled on: ${new Date(item.enrollmentDate).toLocaleDateString()}`}
              />
            </List.Item>
          )}
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      <Modal
        title={`Course Files - ${enrolledCourses.find(course => course.courseId === selectedCourseId)?.courseTitle}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <List
          itemLayout="horizontal"
          dataSource={courseFiles}
          renderItem={(file) => (
            <List.Item
              key={file.id}
              actions={[
                <Button
                  key="download"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(file.id)}
                >
                  Download
                </Button>
              ]}
            >
              <List.Item.Meta
                title={file.title}
                description={`Uploaded on: ${new Date(file.uploadDate).toLocaleDateString()}`}
              />
            </List.Item>
          )}
          pagination={{ pageSize: 10 }}
        />
      </Modal>
    </div>
  )
}

export default EnrolledCourses