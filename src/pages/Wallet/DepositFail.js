import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const DepositFail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <XCircle className="mx-auto h-24 w-24 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-800">
            Nạp tiền thất bại!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Giao dịch nạp tiền không thành công. Vui lòng thử lại sau.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Trang Chủ
          </button>
          <button
            onClick={() => navigate('/deposit-history')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Lịch Sử Thanh Toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositFail;