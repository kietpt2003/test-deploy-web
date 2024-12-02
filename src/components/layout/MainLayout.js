import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import PublicRoute from '../auth/PublicRoute';
import Footer from './Footer';

const MainLayout = () => {
  const location = useLocation();
  const hideFooterPaths = ['/favorite', '/profile','/orderHistory','/cart','/review-gadget'];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <PublicRoute>
      <div>
        <Header />
        <div>
          <Outlet />
        </div>
        {shouldShowFooter && <Footer />}
      </div>
    </PublicRoute>
  );
};

export default MainLayout;
