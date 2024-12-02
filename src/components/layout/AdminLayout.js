import React from 'react';
import { Outlet } from 'react-router-dom';

import RoleBaseRoute from '../auth/RoleBaseRoute';
import AdminSideBar from '~/pages/Admin/AdminSideBar';
const AdminLayout = () => {
  return (
    <RoleBaseRoute accessibleRoles={['Admin']}>
      <div style={{ display: 'flex' }}>
        <AdminSideBar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Outlet /> 
        </div>
      </div>
    </RoleBaseRoute>
  );
};

export default AdminLayout;
