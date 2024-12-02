import React from 'react';
import useAuth from '~/context/auth/useAuth';
import { Navigate } from 'react-router-dom';

export default function AuthRoute({ children }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-7 h-7 bg-gradient-to-tr from-indigo-600 to-pink-600 rounded-full flex items-center justify-center animate-spin">
                    <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
                <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                    Loading...
                </span>
            </div>
        );
    }

    return <div>{children}</div>;
}
