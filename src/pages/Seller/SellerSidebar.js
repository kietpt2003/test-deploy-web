import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import icon from "~/assets/icon.ico";
import { ShoppingCartCheckoutOutlined, StackedBarChartOutlined } from '@mui/icons-material';
import { AppstoreAddOutlined } from '@ant-design/icons';
import { SquarePen } from 'lucide-react';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

const menuItems = [
  { path: '/seller/dashboard', icon: QueryStatsIcon, text: 'Thống kê bán hàng' },
  { path: '/all-products', icon: AppstoreAddOutlined, text: 'Danh sách sản phẩm' },
  { path: '/seller/Order-management', icon: ShoppingCartCheckoutOutlined, text: 'Quản lý đơn hàng' },
  { path: '/seller/manage-reviews-gadgets', icon: SquarePen, text: 'Đánh giá sản phẩm' },
  { path: '/seller/transaction-history', icon: StackedBarChartOutlined, text: 'Lịch sử giao dịch' },
  
];

const SellerSidebar = ({ minHeight = 'min-h-screen' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const MenuItem = ({ path, icon: Icon, text }) => {
    const isActive = location.pathname === path;
    return (
      <div 
        onClick={() => navigate(path)} 
        className={`flex items-center justify-between gap-[10px] py-[15px] px-[10px] cursor-pointer rounded-lg transition-all duration-300 ${
          isActive ? 'bg-black/20' : 'hover:bg-black/10'
        }`}
      >
        <div className='flex items-center gap-[10px]'>
          <Icon className={isActive ? 'text-white' : 'text-black'} />
          <p className={`text-[14px] leading-[20px] font-normal ${isActive ? 'text-white' : 'text-black'}`}>{text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-primary/40 px-[25px] ${minHeight} relative`}>
      <div className='px-[15px] py-[30px] flex items-center justify-center border-b-[1px] border-[#EDEDED]/[0.3]'>
        <div className="h-[80px] w-[80px] rounded-full cursor-pointer flex items-center justify-center relative z-40">
          <img src={icon} alt="" className="h-full w-full rounded-full object-cover" />
        </div>
      </div>

      <div className='pt-[15px] border-b-[1px] border-black'>
        <h2 className="text-sm font-semibold text-black/60 mb-4 px-3">MENU QUẢN LÝ</h2>
        {menuItems.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default SellerSidebar;