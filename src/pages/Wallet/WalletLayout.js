import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '~/components/layout/Header';
import WalletDashboard from './WalletDashboard';


const WalletLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Header />
            <div style={{ display: 'flex', flex: 1 }}>
                <WalletDashboard />
                <div style={{ flex: 1, padding: '20px' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default WalletLayout;