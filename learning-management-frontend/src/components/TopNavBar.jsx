import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Button } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;

const TopNavBar = () => {
  const navigate = useNavigate();

  const userRole = sessionStorage.getItem('userRole');
  const fullname = sessionStorage.getItem('fullname');

  const handleLogout = () => {
    sessionStorage.clear(); 
    navigate('/login'); 
  };

  const profileMenuItems = [
    {
      key: 'profile',
      label: (
        <Link to={`/${userRole ? userRole.toLowerCase() : ''}/profile`}>
          <UserOutlined /> Profile
        </Link>
      ),
    },
    {
      key: 'logout',
      label: (
        <span onClick={handleLogout}>
          <LogoutOutlined /> Logout
        </span>
      ),
    },
  ];

  // items based on roles
  const navItems = {
    ADMIN: [
      { key: 'users', label: <Link to="/admin/users">Users</Link> },
      { key: 'settings', label: <Link to="/admin/settings">Settings</Link> },
    ],
    STUDENT: [
      { key: 'courses', label: <Link to="/student/courses">Courses</Link> },
      { key: 'enrollments', label: <Link to="/student/enrollments">Enrollments</Link> },
      { key: 'assignments', label: <Link to="/student/assignments">Assignments</Link> },
    ],
    INSTRUCTOR: [
      { key: 'myCourses', label: <Link to="/instructor/courses">My Courses</Link> },
      { key: 'Exams', label: <Link to="/instructor/grade-exams">Exams</Link> },
    ],
  };

  const getHomeLink = () => {
    switch (userRole) {
      case 'ADMIN': return '/admin/users';
      case 'INSTRUCTOR': return '/instructor/courses';
      case 'STUDENT': return '/student/enrollments';
      default: return '/';
    }
  };

  return (
    <Header style={headerStyle}>
      <div style={logoStyle}>
      <Link to={getHomeLink()} style={linkStyle}>
          <h2 style={{ color: '#ffffff', margin: 0 }}>Learning Management System</h2>
        </Link>
      </div>

      {/* Dynamic Navigation based on role */}
      <Menu theme="dark" mode="horizontal" style={menuStyle} items={navItems[userRole] || []} />

      {/* Profile and Logout */}
      <Space style={{ float: 'right' }}>
        <Dropdown
          menu={{ items: profileMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" style={{ color: '#ffffff' }}>
            <Avatar icon={<UserOutlined />} style={{ marginRight: '8px' }} />
            {fullname || 'User'} <DownOutlined />
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
};

// Custom styles
const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#001529',
  padding: '0 24px',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
};

const linkStyle = {
  textDecoration: 'none',
};

const menuStyle = {
  lineHeight: '64px',
  flex: 1,
  justifyContent: 'center',
};

export default TopNavBar;
