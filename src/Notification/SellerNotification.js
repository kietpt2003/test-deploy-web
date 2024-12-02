import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Circle, ShoppingCart, Wallet, BellRing, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeviceToken } from '~/context/auth/Noti';

const Notification = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('all'); // Add this line
    const dropdownRef = useRef(null);
    const pageRef = useRef(currentPage);
    const navigate = useNavigate();

    const {
        notifications,
        isFetching,
        hasMore,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        notificationCount,
        resetNotificationCount,
        setupMessageListener,
        setUnreadCount
    } = useDeviceToken();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        pageRef.current = currentPage;
    }, [notifications]);

    useEffect(() => {
        const messageUnsubscribe = setupMessageListener((payload) => {
            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification(payload?.notification?.title || 'New Notification', {
                    body: payload?.notification?.body,
                    icon: payload?.notification?.icon || '/path/to/default/icon.png'
                });
            }
        });

        return () => messageUnsubscribe && messageUnsubscribe();
    }, []);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        resetNotificationCount(); // Reset counter when bell is clicked
    };
    const handleMarkAllAsRead = () => {
        markAllAsRead();
        setUnreadCount(0);
    };
    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const threshold = 50;

        if (scrollHeight - scrollTop - threshold <= clientHeight && !isFetching && hasMore) {
            const nextPage = pageRef.current + 1;
            setCurrentPage(nextPage);
            fetchNotifications(nextPage);
        }
    }, [hasMore, isFetching]);

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.type === 'SellerOrder' ) {
            navigate(`/order/detail-seller/${notification.sellerOrderId}`);
        } else if (notification.type === 'WalletTracking') {
            navigate('/seller/transaction-history');
        }
    };
    const getNotificationIcon = (type) => {
        const iconClass = "w-10 h-10 p-2.5"; // Chuẩn hóa kích thước icon
        switch (type) {
            case 'SellerOrder':
                return <ShoppingCart className={`${iconClass} text-white bg-primary/75 rounded-full flex-shrink-0`} />;
            case 'WalletTracking':
                return <Wallet className={`${iconClass} bg-green-100 text-green-600 rounded-full flex-shrink-0`} />;
            default:
                return <BellRing className={`${iconClass} bg-gray-100 text-gray-600 rounded-full flex-shrink-0`} />;
        }
    };

    // Add this function to filter notifications
    const filteredNotifications = notifications.filter(notification =>
        activeTab === 'all' || (activeTab === 'unread' && !notification.isRead)
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-full hover:bg-gray-200 transition-all"
            >
                <Bell className="w-6 h-6 text-gray-700 hover:text-indigo-900" />
                {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-[380px] bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[85vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                        <h3 className="text-xl font-bold text-gray-800">Thông báo</h3>
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-primary/75 hover:text-secondary/85 font-medium"
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>
                    <div className="flex gap-2 p-2 items-center">
                            <button
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                                    ${activeTab === 'all' 
                                        ? 'bg-primary/75 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                onClick={() => setActiveTab('all')}
                            >
                                Tất cả 
                            </button>
                            <button
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                                    ${activeTab === 'unread' 
                                        ? 'bg-primary/75 text-white' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                onClick={() => setActiveTab('unread')}
                            >
                                Chưa đọc ({notifications.filter(n => !n.isRead).length})
                            </button>
                        </div>
                    <div
                        className="overflow-y-auto flex-1 scroll-smooth"
                        onScroll={handleScroll}
                    >
                        {isFetching && currentPage === 1 ? (
                            <div className="flex justify-center p-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <p className="p-4 text-center text-gray-500">Không có thông báo</p>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-all 
                                    ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                                    onClick={() => handleNotificationClick(notification)}

                                >
                                    <div className="flex items-start space-x-3">
                                        {getNotificationIcon(notification.type)}
                                        <div className="flex-grow">
                                            <div className="flex items-center space-x-2">
                                                <p className={`text-xs ${notification.isRead ? 'text-gray-800' : 'text-gray-900 font-semibold'}`}>
                                                    {notification.title}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <p className="text-xs text-gray-500">{notification.content}</p>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <p className="text-xs text-gray-400">
                                                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <Circle fill="currentColor" className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {isFetching && currentPage > 1 && (
                            <div className="flex justify-center p-4">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notification;
