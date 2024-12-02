import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '~/pages/Manager/Sidebar';
import RoleBaseRoute from '../auth/RoleBaseRoute';
const ManagerLayout = () => {
  return (
    <RoleBaseRoute accessibleRoles={['Manager']}>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Outlet /> 
        </div>
      </div>
    </RoleBaseRoute>
  );
};

export default ManagerLayout;
