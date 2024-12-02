import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsersCog, FaSignOutAlt, FaChartBar } from "react-icons/fa";
import useAuth from '~/context/auth/useAuth';
import { useDeviceToken } from '~/context/auth/Noti';
import icon from "~/assets/icon.ico";

const AdminSideBar = ({ minHeight = 'min-h-screen' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deleteDeviceToken } = useDeviceToken();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await deleteDeviceToken(); 
    logout();
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Trang quản lý', icon: FaChartBar },
    { path: '/admin/manage-users', label: 'Quản lý người dùng', icon: FaUsersCog },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`bg-primary/40 px-[25px] ${minHeight} relative`}>   
      <div className='px-[15px] py-[30px] flex flex-col items-center justify-center border-b-[1px] border-[#EDEDED]/[0.3]'>
        <div className="h-[80px] w-[80px] rounded-full cursor-pointer flex items-center justify-center relative z-40 mb-3">
          <img src={icon} alt="" className="h-full w-full rounded-full object-cover" />
        </div>
      </div>

      <div className='py-[30px] border-b-[1px] border-black'>
        <h2 className="text-sm font-semibold text-black/60 mb-4 px-3">MENU QUẢN LÝ</h2>
        {menuItems.map((item) => (
          <div 
            key={item.path}
            className={`flex items-center justify-between gap-[10px] py-[12px] cursor-pointer px-3 rounded-lg transition-all duration-300 ${
              isActive(item.path)
               ? 'bg-black/20' : 'hover:bg-black/10'
            }`}
            onClick={() => navigate(item.path)}
          >
            <div className='flex items-center gap-[10px]'>
              <item.icon className={`text-xl ${isActive(item.path) ? 'text-white' : 'text-black'}`} />
              <p className={`text-[14px] leading-[20px] font-medium ${isActive(item.path) ? 'text-white' : 'text-black'}`}>
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='absolute bottom-0 left-0 w-full border-t border-[#EDEDED]/[0.3] bg-primary/20'>
        <div 
          className='flex items-center gap-2 cursor-pointer hover:bg-black/10 p-4 transition-all duration-300'
          onClick={handleLogout}
        >
          <FaSignOutAlt className="text-lg text-black" />
          <p className='text-[14px] font-semibold text-black'>Đăng xuất</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSideBar;

