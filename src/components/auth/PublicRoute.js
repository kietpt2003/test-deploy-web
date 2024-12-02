import React from 'react';
import useAuth from '~/context/auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    if (user?.role === "Admin" || user?.role === "Manager") {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Truy cập bị từ chối</strong>
                    <span className="block sm:inline"> Người quản trị không thể truy cập vào trang này.</span>
                </div>
                <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-400"
                    onClick={goBack}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // Nếu không phải admin, cho phép truy cập
    return <>{children}</>;
}
