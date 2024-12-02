import React, { useState, useEffect } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function SellerTransfer() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [sortByDate, setSortByDate] = useState('DESC');
const navigate = useNavigate();
  const fetchDeposits = async () => {
    try {
      const response = await AxiosInterceptor.get(`/api/wallet-trackings?SortByDate=${sortByDate}&Page=${currentPage}&PageSize=${pageSize}`);
      setDeposits(Array.isArray(response.data.items) ? response.data.items : []);
      setTotalItems(response.data.totalItems || 0);
      setLoading(false);
    } catch (err) {
      setError('Không thể lấy lịch sử nạp tiền');
      setLoading(false);
      toast.error('Không thể lấy lịch sử nạp tiền');
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [currentPage, sortByDate]);

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

  const handleChangePage = (newPage) => {
    setCurrentPage(newPage);
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

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Lịch Sử Giao Dịch</h2>
      </div>

      <div className="mb-4">
        <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700 mr-2">Sắp xếp theo ngày</label>
        <select
          id="sort-by-date"
          value={sortByDate}
          onChange={(e) => {
            setSortByDate(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
        >
          <option value="DESC">Mới nhất</option>
          <option value="ASC">Cũ nhất</option>
        </select>
      </div>

      {deposits.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-gray-500">Bạn chưa có lịch sử giao dịch nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deposits.map((deposit) => (
            <div key={deposit.id}
            onClick={() => navigate(`/order/detail-seller/${deposit.sellerOrderId}`)}
            className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center justify-between cursor-pointer">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">
                  Mã giao dịch: <span className="text-gray-900">{deposit.sellerOrderId}</span>
                </p>
                <p className="text-sm text-gray-500">Loại giao dịch: Tự động</p>
                <div className="flex items-center mt-1">
                  <p className="text-sm font-semibold text-gray-700">Trạng thái:</p>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${deposit.status === 'Success' ? 'bg-green-200 text-green-700' :
                        deposit.status === 'Pending' ? 'bg-yellow-200 text-yellow-700' :
                          deposit.status === 'Expired' ? 'bg-red-200 text-red-700' :
                            'bg-gray-200 text-gray-700'
                      }`}
                  >
                    {deposit.status === 'Success' ? 'Hoàn thành' :
                      deposit.status === 'Pending' ? 'Đang chờ' :
                        deposit.status === 'Expired' ? 'Đã hết hạn' :
                          deposit.status === 'Cancelled' ? 'Đã hủy' :
                            deposit.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-gray-700">
                  Số tiền: <span className="text-green-600">+ {formatCurrency(deposit.amount)}</span>
                </p>
                <p className="text-xs text-gray-500 mt-5">
                  Ngày tạo: {formatDate(deposit.createdAt)}
                </p>
              </div>
            </div>

          ))}
        </div>
      )}

      {/* Replace the old pagination section with this new one */}
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
                    onClick={() => handleChangePage(number)}
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

      <ToastContainer />
    </div>
  );
}
