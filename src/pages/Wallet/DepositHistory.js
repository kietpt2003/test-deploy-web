import React, { useState, useEffect } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { Eye, PlusCircle, X, CircleEllipsis } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function DepositHistory() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [cancelDepositId, setCancelDepositId] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VnPay');
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isSuccess = queryParams.get('isSuccess');
    const status = queryParams.get('status');

    if (isSuccess === 'True' || status === 'PAID') {
      navigate('/deposit-success', { replace: true });
    } else if (queryParams.has('isSuccess') || queryParams.has('status')) {
      navigate('/deposit-fail', { replace: true });
    }
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10); 
  const [sortByDate, setSortByDate] = useState('DESC'); 

  const fetchDeposits = async () => {
    try {
      const response = await AxiosInterceptor.get(`/api/wallet-trackings?Types=Deposit&SortByDate=${sortByDate}&Page=${currentPage}&PageSize=${pageSize}`);
      
      
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

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const response = await AxiosInterceptor.post('/api/wallet/deposit', {
        amount: parseFloat(amount),
        paymentMethod,
        returnUrl: `${window.location.origin}/deposit-history`
      });
      
      if (response.data && response.data.depositUrl) {
        window.location.href = response.data.depositUrl;
      } else {
        toast.error('Không thể tạo liên kết nạp tiền');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.reasons?.[0]?.message || 'Có lỗi xảy ra khi nạp tiền';
      toast.error(errorMessage);
    }
  };


  const handleCancelDeposit = async () => {
    try {
      await AxiosInterceptor.put(`/api/wallet-trackings/${cancelDepositId}/cancel`);
      toast.success('Giao dịch đã được hủy thành công.');
      fetchDeposits();
      setShowCancelConfirmModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi hủy giao dịch.';
      toast.error(errorMessage);
    }
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lịch Sử Nạp Tiền</h2>
        <button
          onClick={() => setShowDepositModal(true)}
          className="bg-primary/80 hover:bg-secondary/90 text-white font-bold py-2 px-4 rounded flex items-center transition duration-300"
        >
          <PlusCircle className="mr-2" size={20} />
          Nạp tiền
        </button>
      </div>
      
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 relative">
            <button
              onClick={() => setShowDepositModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Nạp Tiền</h3>
            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền cần nạp</label>
                <input
                  type="number"
                  placeholder='VND'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Momo">Momo</option>
                  <option value="VnPay">VnPay</option>
                  <option value="PayOS">PayOS</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="mr-2 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded transition duration-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-primary/80 hover:bg-secondary/90 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Nạp tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4">Xác nhận hủy giao dịch</h3>
            <p className="mb-4">Bạn có chắc chắn muốn hủy giao dịch này?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCancelConfirmModal(false)}
                className="mr-2 bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded transition duration-300"
              >
                Không
              </button>
              <button
                onClick={handleCancelDeposit}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Có, hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thêm dropdown để sắp xếp */}
      <div className="mb-4">
        <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700 mr-3">Sắp xếp theo ngày</label>
        <select
          id="sort-by-date"
          value={sortByDate}
          onChange={(e) => {
            setSortByDate(e.target.value);
            setCurrentPage(1); 
          }}
          className="w-full sm:w-[180px] px-1 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
        >
          <option value="DESC">Mới nhất</option>
          <option value="ASC">Cũ nhất</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {deposits.length === 0 ? ( // Kiểm tra length của deposits
          <div className="text-center p-6">
            <p className="text-gray-500">Bạn chưa có lịch sử nạp tiền nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Phương thức', 'Số tiền', 'Trạng thái', 'Thời gian nạp tiền', 'Ngày tạo giao dịch'].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deposits.map((deposit) => (
                  <tr key={deposit.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{deposit.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(deposit.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        deposit.status === 'Success' ? 'bg-green-100 text-green-800' :
                        deposit.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        deposit.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {deposit.status === 'Success' ? 'Thành công' :
                         deposit.status === 'Pending' ? 'Đang chờ' :
                         deposit.status === 'Expired' ? 'Đã hết hạn' :
                         deposit.status === 'Cancelled' ? 'Đã hủy' :
                         deposit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deposit.status === 'Pending' && deposit.depositedAt === null ? 'Đang chờ...' :
                       deposit.status === 'Cancelled' && deposit.depositedAt === null ? 'Đã hủy' :
                       deposit.status === 'Expired' && deposit.depositedAt === null ? 'Đã hết hạn' :
                       deposit.depositedAt ? formatDate(deposit.depositedAt) : 'Đang chờ...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      {formatDate(deposit.createdAt)}
                      {deposit.status === 'Pending' && (
                        <div className="absolute top-1/2 right-2 mr-3 -translate-y-1/2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancelDepositId(deposit.id);
                              setShowCancelConfirmModal(true);
                            }}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <CircleEllipsis size={22} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      <ToastContainer />
    </div>
  );
}
