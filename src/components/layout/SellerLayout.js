import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerHeader from '~/pages/Seller/SellerHeader';
import SellerSidebar from '~/pages/Seller/SellerSidebar';
import RoleBaseRoute from '../auth/RoleBaseRoute';
const SellerLayout = () => {
  return (
    <RoleBaseRoute accessibleRoles={['Seller']}>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <SellerHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <SellerSidebar />
        <div style={{ flex: 1 }}>
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    </div>
    </RoleBaseRoute>
  );
};

export default SellerLayout;
