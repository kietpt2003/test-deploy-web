import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, History, Clock } from 'lucide-react'; // Bạn có thể sử dụng các icon khác nếu muốn

const WalletDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800 text-center">Ví của tôi</h2>
        </div>
        <nav className="mt-4">
          <NavLink
            to="/deposit-history"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 ${
                isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`
            }
            end
          >
            <History className="mr-3 h-5 w-5" />
            Lịch sử nạp tiền
          </NavLink>
          <NavLink
            to="/refund-history"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 ${
                isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`
            }
          >
            <Clock className="mr-3 h-5 w-5" />
            Lịch sử hoàn tiền
          </NavLink>
          <NavLink
            to="/payment-history"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 ${
                isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
              }`
            }
          >
            <Wallet className="mr-3 h-5 w-5" />
            Lịch sử thanh toán
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default WalletDashboard;