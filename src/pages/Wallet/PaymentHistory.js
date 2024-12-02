import React, { useState, useEffect } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { Eye } from 'lucide-react';
import { toast } from "react-toastify";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await AxiosInterceptor.get(`/api/wallet-trackings?Types=Payment&Page=${currentPage}&PageSize=${pageSize}`);
        setPayments(response.data.items);
        setTotalItems(response.data.totalItems);
        setLoading(false);
      } catch (err) {
        setError('Không thể lấy lịch sử thanh toán');
        setLoading(false);
        toast.error('Không thể lấy lịch sử thanh toán');
      }
    };

    fetchPayments();
  }, [currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
        <div className="h-4 w-4 bg-white rounded-full"></div>
      </div>
      <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
        Loading...
      </span>
    </div>
  );
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Lịch Sử Thanh Toán</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-500">Bạn chưa có lịch sử thanh toán nào</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Số tiền', 'Trạng thái', 'Ngày thanh toán'].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'Success' ? 'bg-green-100 text-green-800' :
                      payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {payment.status === 'Success' ? 'Thành công' :
                        payment.status === 'Pending' ? 'Đang chờ' :
                          payment.status === 'Cancelled' ? 'Đã hủy' :
                            payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-4">
        <div className="flex justify-center mt-4">
          <nav className="flex items-center space-x-2">
            {(() => {
              const maxVisiblePages = 5;
              const totalPages = Math.ceil(totalItems / pageSize);
              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }

              return Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(number => number >= startPage && number <= endPage)
                .map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`px-4 py-2 rounded-md ${
                      number === currentPage 
                        ? "bg-primary/70 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number}
                  </button>
                ));
            })()}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
