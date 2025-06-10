import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

const AdminLayout = () => {
  return (
    <div style={{ minHeight: '100vh', padding:'0'}}>
      <div style={{ position: 'sticky ', width: '100%', zIndex: '1000' }}>
        <TopNavBar />
      </div>

      <div style={{ paddingTop: '10px', padding: '16px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
