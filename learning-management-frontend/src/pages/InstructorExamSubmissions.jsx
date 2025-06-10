import React, { useState, useEffect } from 'react';
import { Table, Spin, message, Button } from 'antd';
import { getExamSubmissions, downloadExamSubmission } from '../services/api';
import PropTypes from 'prop-types';

const InstructorExamSubmissions = ({ examId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchExamSubmissions();
    } else {
      setLoading(false);
    }
  }, [examId]);

  const fetchExamSubmissions = async () => {
    try {
      const response = await getExamSubmissions(examId);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching exam submissions:', error);
      message.error('Failed to fetch exam submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (submissionId, studentName) => {
    try {
      const response = await downloadExamSubmission(submissionId);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName}_submission.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download the file');
    }
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Submission Time',
      dataIndex: 'submissionTime',
      key: 'submissionTime',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handleDownload(record.id, record.studentName)}>
          Download
        </Button>
      ),
    },
  ];

  if (!examId) {
    return <div>Please select an exam to view submissions.</div>;
  }

  return (
    <div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table columns={columns} dataSource={submissions} rowKey="id" />
      )}
    </div>
  );
};

InstructorExamSubmissions.propTypes = {
  examId: PropTypes.number,
};

export default InstructorExamSubmissions;