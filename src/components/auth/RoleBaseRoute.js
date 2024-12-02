import React from 'react';
import useAuth from '~/context/auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function RoleBaseRoute({ children, accessibleRoles }) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();


    const goBack = () => {
        navigate(-1); // This is equivalent to navigating back
    };

    if (!accessibleRoles.includes(user?.role) || !isAuthenticated) {
        return (
            <div className="h-screen flex flex-col items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Truy cập bị từ chối</strong>
                    <span className="block sm:inline"> Bạn không có quyền truy cập trang này.</span>
                </div>
                <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-400"
                    onClick={goBack}
                >
                    Back
                </button>
            </div>
        )
    }

    return (
        <>{children}</>
    );
}
