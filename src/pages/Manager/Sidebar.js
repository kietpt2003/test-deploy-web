import React from 'react'
import { FaTachometerAlt, FaRegSun, FaWrench, FaStickyNote, FaRegChartBar, FaRegCalendarAlt, FaWpforms, FaSignOutAlt, FaProductHunt } from "react-icons/fa"
import { useNavigate, useLocation } from 'react-router-dom';
import icon from "~/assets/icon.ico"
import { useDeviceToken } from '~/context/auth/Noti';
import useAuth from '~/context/auth/useAuth';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

const Sidebar = ({ minHeight = 'min-h-screen' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { deleteDeviceToken } = useDeviceToken();
    const { logout, error } = useAuth();

    const handleLogout = async () => {
        await deleteDeviceToken(); 
        logout();
    };

    const menuItems = [
        { path: '/manage-dashboard', icon: QueryStatsIcon, text: 'Thống kê bán hàng' },
        { path: '/manage-gadget', icon: FaProductHunt, text: 'Quản lý sản phẩm' },
        { path: '/manage-seller-application', icon: FaWpforms, text: 'Quản lý đơn người bán' },
        { path: '/specification-key', icon: FaRegSun, text: 'Quản lý thông số' },
        { path: '/brand', icon: FaWrench, text: 'Quản lý thương hiệu' },
    ];

    const MenuItem = ({ path, icon: Icon, text }) => {
        const isActive = location.pathname === path;
        return (
            <div 
                onClick={() => navigate(path)} 
                className={`flex items-center justify-between gap-[10px] py-[15px] cursor-pointer rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-black/20' : 'hover:bg-black/10'
                }`}
            >
                <div className='flex items-center gap-[10px] px-[10px]'>
                    <Icon color={isActive ? 'white' : 'black'} /> 
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
                {menuItems.map((item, index) => (
                    <MenuItem key={index} {...item} />
                ))}
            </div>
            <div className='absolute bottom-0 left-0 w-full border-t border-[#EDEDED]/[0.3] p-4'>
                <div 
                    className='flex items-center gap-2 cursor-pointer hover:bg-black/10 p-3 rounded-lg transition-all duration-300'
                    onClick={handleLogout}
                >
                    <FaSignOutAlt color='black' />
                    <p className='text-[14px] font-semibold text-black'>Đăng xuất</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar