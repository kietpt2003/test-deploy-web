import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import { FileText, Clock } from 'lucide-react';
import SellerApplication from './SellerApplication';
import HistorySellerApplication from './HistorySellerApplication';
import { useDeviceToken } from '~/context/auth/Noti';
import { FaSignOutAlt } from 'react-icons/fa';
import useAuth from '~/context/auth/useAuth';

const SellerDashboard = () => {
  const { deleteDeviceToken } = useDeviceToken();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await deleteDeviceToken();
    logout();
  };
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col fixed h-full">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Mục Lục</h2>
        </div>
        <nav className="mt-4">
          <NavLink
            to="/seller-application"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`
            }
            end
          >
            <FileText className="mr-3 h-5 w-5" />
            Mục đăng ký đơn
          </NavLink>
          <NavLink
            to="/history-seller-application"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 ${isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`
            }
          >
            <Clock className="mr-3 h-5 w-5" />
            Lịch sử đăng ký đơn
          </NavLink>
        </nav>
        {/* Divider */}
        <div className="border-t border-gray-300 my-4 mx-4"></div>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <FaSignOutAlt className="mr-3 h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;