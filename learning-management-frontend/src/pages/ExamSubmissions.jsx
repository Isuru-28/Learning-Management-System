import React, { useState, useEffect } from 'react'
import { Table, Button, message, Input, Spin, Modal, Space, Typography } from 'antd'
import { DownloadOutlined, EditOutlined, SearchOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { getExamSubmissions, downloadExamSubmission, updateExamSubmissionMarks, resetExamSubmissionMarks } from '../services/api'

const { Title } = Typography

const ExamSubmissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [marksToUpdate, setMarksToUpdate] = useState({})
  const [resetModalVisible, setResetModalVisible] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const [searchText, setSearchText] = useState('')
  const { examId } = useParams()

  useEffect(() => {
    if (examId) {
      fetchSubmissions()
    } else {
      setLoading(false)
    }
  }, [examId])

  const fetchSubmissions = async () => {
    try {
      const response = await getExamSubmissions(examId)
      setSubmissions(response.data)
    } catch (error) {
      console.error('Error fetching exam submissions:', error)
      message.error('Failed to fetch exam submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select submissions to download')
      return
    }

    for (const submission of selectedRows) {
      try {
        const response = await downloadExamSubmission(submission.id)
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${submission.studentName}_submission.pdf`)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
      } catch (error) {
        console.error(`Error downloading file for ${submission.studentName}:`, error)
        message.error(`Failed to download file for ${submission.studentName}`)
      }
    }
    message.success('Download complete')
  }

  const handleMarkChange = (submissionId, marks) => {
    const numericMarks = marks.replace(/[^0-9]/g, '')
    setMarksToUpdate(prev => ({ ...prev, [submissionId]: numericMarks }))
  }

  const handleUpdateMarks = async () => {
    try {
      const marksToSubmit = Object.entries(marksToUpdate).map(([id, marks]) => ({
        id: parseInt(id),
        marks: parseInt(marks)
      })).filter(({ marks }) => marks >= 0 && marks <= 100)

      if (marksToSubmit.length === 0) {
        message.info('No valid marks to update')
        return
      }

      await updateExamSubmissionMarks(marksToSubmit)
      message.success('Marks updated successfully')
      setEditMode(false)
      setMarksToUpdate({})
      fetchSubmissions()
    } catch (error) {
      console.error('Error updating marks:', error)
      message.error('Failed to update marks')
    }
  }

  const handleResetMarks = async () => {
    try {
      await resetExamSubmissionMarks(selectedRows.map(row => row.id))
      message.success('Marks reset successfully')
      setResetModalVisible(false)
      setSelectedRows([])
      fetchSubmissions()
    } catch (error) {
      console.error('Error resetting marks:', error)
      message.error('Failed to reset marks')
    }
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setMarksToUpdate({})
  }

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.studentName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Submission Time',
      dataIndex: 'submissionTime',
      key: 'submissionTime',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record) => (
        editMode ? (
          <Input
            type="text"
            value={marksToUpdate[record.id] ?? record.marks ?? ''}
            onChange={(e) => handleMarkChange(record.id, e.target.value)}
            style={{ width: 100 }}
            status={
              marksToUpdate[record.id] && (parseInt(marksToUpdate[record.id]) < 0 || parseInt(marksToUpdate[record.id]) > 100)
                ? 'error'
                : ''
            }
          />
        ) : (
          <span>{record.marks !== null ? record.marks : 'Not graded'}</span>
        )
      ),
    },
  ]

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows)
    },
  }

  if (!examId) {
    return <div>Please select an exam to view submissions.</div>
  }

  return (
    <div className="p-6">
      <Space className="mb-4" direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={selectedRows.length === 0}
          >
            Download Selected
          </Button>
          {editMode ? (
            <>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleUpdateMarks}
              >
                Save Marks
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditMode(true)}
            >
              Edit Marks
            </Button>
          )}
          <Button
            onClick={() => setResetModalVisible(true)}
            disabled={selectedRows.length === 0}
          >
            Reset Selected Marks
          </Button>
          <Input
            placeholder="Search by student name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
        </Space>
      </Space>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table 
          columns={columns} 
          dataSource={submissions} 
          rowKey="id"
          rowSelection={rowSelection}
          pagination={{ pageSize: 10 }}
        />
      )}
      <Modal
        title="Reset Marks"
        visible={resetModalVisible}
        onOk={handleResetMarks}
        onCancel={() => setResetModalVisible(false)}
      >
        <p>Are you sure you want to reset marks for the selected submissions?</p>
      </Modal>
    </div>
  )
}

export default ExamSubmissions