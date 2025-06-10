import React, { useState, useEffect } from 'react';
import { Table, message, Button, Popconfirm } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:8088/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:8088/api/v1/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'First Name', dataIndex: 'firstname', key: 'firstname' },
    { title: 'Last Name', dataIndex: 'lastname', key: 'lastname' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'roles', key: 'roles', render: (roles) => roles.join(', ') },
    { title: 'Account Status', dataIndex: 'enabled', key: 'enabled', render: enabled => (enabled ? 'Active' : 'Inactive') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        !record.roles.includes('ADMIN') && (
          <>
            <Button type="link" onClick={() => navigate(`/admin/edit-user/${record.id}`)}>Edit</Button>
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          </>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Registered Users</h2>
      <Button
        type="primary"
        onClick={() => navigate('/admin/register-user')}
        style={{ marginBottom: '20px' }}
      >
        Register User
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

export default UsersPage;