import React, { useState, useEffect } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { Eye } from 'lucide-react';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const RefundHistory = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const navigate = useNavigate();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10); 

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await AxiosInterceptor.get(`/api/wallet-trackings?Types=Refund&Page=${currentPage}&PageSize=${pageSize}`);
        setRefunds(response.data.items);
        setTotalItems(response.data.totalItems);
        setLoading(false);
        
      } catch (err) {
        setError('Không thể lấy lịch sử hoàn tiền');
        setLoading(false);
        toast.error('Không thể lấy lịch sử hoàn tiền');
      }
    };

    fetchRefunds();
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
      <h2 className="text-2xl font-bold mb-6">Lịch Sử Hoàn Tiền</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {refunds.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-500">Bạn chưa có lịch sử hoàn tiền nào</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              {['Mã đơn hàng','Số tiền', 'Trạng thái', 'Thời gian hoàn tiền', 'Ngày tạo giao dịch'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refunds.map((refund) => (
                <tr key={refund.id}
                onClick={() => navigate(`/order/detail/${refund.sellerOrderId}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors" >
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.sellerOrderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(refund.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      refund.status === 'Success' ? 'bg-green-100 text-green-800' :
                      refund.status === 'Pending' && refund.refundedAt === null ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {refund.status === 'Success' ? 'Thành công' :
                       refund.status === 'Pending'  ? 'Đang chờ' :
                       refund.status === 'Cancelled' ? 'Đã hủy' :
                       refund.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {refund.refundedAt ? formatDate(refund.refundedAt) : 'Đang chờ...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(refund.createdAt)}</td>
        
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

export default RefundHistory;
