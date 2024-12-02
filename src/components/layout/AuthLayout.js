import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Outlet /> 
    </div>
  );
};

export default AuthLayout;
