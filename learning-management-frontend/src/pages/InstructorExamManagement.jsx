import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { getExamsByCourse, createExam, updateExam, deleteExam } from '../services/api';
import PropTypes from 'prop-types';
import moment from 'moment';
import InstructorExamSubmissions from './InstructorExamSubmissions';

const { RangePicker } = DatePicker;

const InstructorExamManagement = ({ courseId }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submissionsModalVisible, setSubmissionsModalVisible] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [form] = Form.useForm();
  const [editingExamId, setEditingExamId] = useState(null);

  useEffect(() => {
    fetchExams();
  }, [courseId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await getExamsByCourse(courseId);
      setExams(response.data);
    } catch (error) {
      message.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values) => {
    try {
      const formData = new FormData();
      const instructorId = sessionStorage.getItem('userId');
      
      formData.append('instructorId', instructorId);
      formData.append('title', values.title);
      formData.append('startDate', values.examPeriod[0].format('YYYY-MM-DDTHH:mm:ss'));
      formData.append('endDate', values.examPeriod[1].format('YYYY-MM-DDTHH:mm:ss'));
      formData.append('fileType', 'EXAM');
      
      if (values.file && values.file.length > 0 && values.file[0].originFileObj) {
        formData.append('file', values.file[0].originFileObj);
      }

      if (editingExamId) {
        await updateExam(courseId, editingExamId, formData);
        message.success('Exam updated successfully');
      } else {
        await createExam(courseId, formData);
        message.success('Exam created successfully');
      }
      setModalVisible(false);
      fetchExams();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        message.error('You do not have permission to perform this action');
      } else {
        message.error('Failed to save exam: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDelete = async (examId) => {
    try {
      await deleteExam(courseId, examId);
      message.success('Exam deleted successfully');
      fetchExams();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        message.error('You do not have permission to delete this exam');
      } else {
        message.error('Failed to delete exam');
      }
    }
  };

  const handleViewSubmissions = (examId) => {
    setSelectedExamId(examId);
    setSubmissionsModalVisible(true);
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { 
      title: 'Start Date', 
      dataIndex: 'startDate', 
      key: 'startDate',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm')
    },
    { 
      title: 'End Date', 
      dataIndex: 'endDate', 
      key: 'endDate',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleModalOpen(record.id)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
            style={{ marginRight: 8 }}
          >
            Delete
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewSubmissions(record.id)}
          >
            View Submissions
          </Button>
        </>
      ),
    },
  ];

  const handleModalOpen = (examId = null) => {
    setEditingExamId(examId);
    form.resetFields();
    if (examId) {
      const exam = exams.find(e => e.id === examId);
      if (exam) {
        form.setFieldsValue({
          title: exam.title,
          // examPeriod: [moment(exam.startDate), moment(exam.endDate)],
          file: exam.fileUrl ? [{ uid: '-1', name: exam.fileUrl, status: 'done', url: exam.fileUrl }] : []
        });
      }
    }
    setModalVisible(true);
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleModalOpen()}
        style={{ marginBottom: 16 }}
      >
        Add Exam
      </Button>
      <Table columns={columns} dataSource={exams} rowKey="id" loading={loading} />

      <Modal
        title={editingExamId ? 'Edit Exam' : 'Add Exam'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateOrUpdate} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input the exam title!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="examPeriod" label="Exam Period" rules={[{ required: true, message: 'Please select the exam period!' }]}>
            <RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item 
            name="file" 
            label="Exam File" 
            rules={[{ required: !editingExamId, message: 'Please upload an exam file!' }]}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingExamId ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Exam Submissions"
        open={submissionsModalVisible}
        onCancel={() => setSubmissionsModalVisible(false)}
        footer={null}
        width={800}
      >
        <InstructorExamSubmissions examId={selectedExamId} />
      </Modal>
    </div>
  );
};

InstructorExamManagement.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default InstructorExamManagement;