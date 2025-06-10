import React, { useState, useEffect } from 'react';
import { Table, Button, Upload, Input, message, Modal, Form, Popconfirm } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCourseFiles, uploadCourseFile, updateCourseFile, deleteCourseFile } from '../services/api';
import PropTypes from 'prop-types';
import moment from 'moment';

const CourseFiles = ({ courseId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFiles();
  }, [courseId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await getCourseFiles(courseId);
      // Filter out exam files
      const courseFiles = response.data.filter(file => file.fileType !== 'EXAM' && file.fileType !== 'EXAM_SUBMISSION');
      setFiles(courseFiles);
    } catch (error) {
      message.error('Failed to fetch course files');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (values) => {
    try {
      const instructorId = sessionStorage.getItem('userId');
      if (!values.file || !values.file[0]) {
        throw new Error('Please select a file to upload');
      }
      await uploadCourseFile(courseId, instructorId, values.file[0].originFileObj, values.title, 'COURSE');
      message.success('File uploaded successfully');
      setUploadModalOpen(false);
      fetchFiles();
    } catch (error) {
      message.error('Failed to upload file: ' + error.message);
    }
  };

  const handleEdit = async (values) => {
    try {
      const instructorId = sessionStorage.getItem('userId');
      await updateCourseFile(editingFile.id, instructorId, values.title, values.file?.[0]?.originFileObj);
      message.success('File updated successfully');
      setEditModalOpen(false);
      fetchFiles();
    } catch (error) {
      message.error('Failed to update file: ' + error.message);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      const instructorId = sessionStorage.getItem('userId');
      await deleteCourseFile(fileId, instructorId);
      message.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      message.error('Failed to delete file: ' + error.message);
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'File Name', dataIndex: 'fileUrl', key: 'fileUrl', render: (fileUrl) => fileUrl.split('/').pop() },
    { title: 'Upload Date', dataIndex: 'uploadDate', key: 'uploadDate', render: (date) => moment(date).format('YYYY-MM-DD HH:mm') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingFile(record);
              setEditModalOpen(true);
              form.setFieldsValue({ title: record.title });
            }}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this file?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setUploadModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Upload File
      </Button>
      <Table columns={columns} dataSource={files} rowKey="id" loading={loading} />

      <Modal
        title="Upload File"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
      >
        <Form onFinish={handleUpload}>
          <Form.Item name="title" rules={[{ required: true, message: 'Please input the file title!' }]}>
            <Input placeholder="File Title" />
          </Form.Item>
          <Form.Item
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
            rules={[{ required: true, message: 'Please select a file!' }]}
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Upload
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit File"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleEdit}>
          <Form.Item name="title" rules={[{ required: true, message: 'Please input the file title!' }]}>
            <Input placeholder="File Title" />
          </Form.Item>
          <Form.Item
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Select New File (Optional)</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

CourseFiles.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseFiles;