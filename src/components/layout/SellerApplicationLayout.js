import React from 'react';
import { Outlet } from 'react-router-dom';
import SellerDashboard from '~/pages/Seller/SellerDashboard';

const SellerApplicationLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <aside className="w-64 flex-shrink-0">
          <SellerDashboard />
        </aside>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerApplicationLayout;

