import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AxiosInterceptor from "~/components/api/AxiosInterceptor";

const OrderTableSeller = ({ orders: initialOrders = [], onOrderStatusChanged }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState(initialOrders);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    setOrders(initialOrders);
    setTotalOrders(initialOrders.length);
    // Reset to first page when orders change
    setCurrentPage(1);
  }, [initialOrders]);

  // Calculate pagination values
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const translateStatus = (status) => {
    const statusMap = {
      Success: "Thành công",
      Cancelled: "Đã hủy",
      Pending: "Đang chờ",
    };
    return statusMap[status] || status;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination component
  const Pagination = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return (
      <div className="mt-4">
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <nav className="flex items-center space-x-2">
            {/* Page Numbers */}
            {Array.from({ length: Math.ceil(totalPages) }, (_, index) => index + 1)
              .filter((number) => number >= startPage && number <= endPage) // Ensure the buttons are displayed within the calculated range
              .map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-4 py-2 rounded-md ${
                    number === currentPage ? "bg-primary/70 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {number}
                </button>
              ))}
          </nav>
        </div>
      </div>
    );
  };

  if (isLoading)
    return (
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
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border-2 border-gray-200  table-fixed">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-sm">Mã đơn hàng</th>
            <th className="py-2 px-4 border-b text-sm">Tổng giá tiền</th>
            <th className="py-2 px-4 border-b text-sm">Trạng thái</th>
            <th className="py-2 px-4 border-b text-sm">Ngày đặt</th>
            <th className="py-2 px-4 border-b text-sm"></th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order.id} 
             
              className="hover:bg-gray-50 cursor-pointer">
                <td className="py-2 px-4 border-b text-center text-sm">{order.id}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{order.amount?.toLocaleString()}₫</td>
                <td className="py-2 px-4 border-b text-center text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "Success"
                        ? "bg-green-100 text-green-800"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {translateStatus(order.status)}
                  </span>
                </td>

                <td className="py-2 px-4 border-b text-center text-sm">{formatDate(order.createdAt)}</td>
                <td>
                  <button
               onClick={() => navigate(`/order/detail-seller/${order.id}`)}
                    className="text-primary/70 hover:text-secondary/80"
                  >
                    <Eye className="h-5 w-5 items-center" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-2 text-center">
                Không có đơn hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Show pagination only if there are more orders than ordersPerPage */}
      {orders.length > ordersPerPage && <Pagination />}

    </div>
  );
};

export default OrderTableSeller;