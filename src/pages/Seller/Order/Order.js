import React, { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import AxiosInterceptor from "~/components/api/AxiosInterceptor";
import { toast, ToastContainer } from "react-toastify";
import OrderTableSeller from "./OrderTable";
import { PendingOutlined } from "@mui/icons-material";

const OrderHistorySeller = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortByDate, setSortByDate] = useState('DESC');

  const fetchOrders = async (pageNumber = 1, statusFilter = status) => {
    setIsLoading(true);
    try {
      const response = await AxiosInterceptor.get(`/api/seller-orders?SortByDate=${sortByDate}`, {
        params: { Page: pageNumber, PageSize: 100, Status: statusFilter },
      });

      const { items, totalCount } = response.data;
      setOrders(items);
      setTotalPages(Math.ceil(totalCount / 10));
    } catch (error) {
      if (error.response && error.response.data && error.response.data.reasons) {
        const reasons = error.response.data.reasons;
        if (reasons.length > 0) {
          const reasonMessage = reasons[0].message;
          toast.error(reasonMessage);
        } else {
          toast.error("Có lỗi xảy ra vui lòng thử lại");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page, status);
  }, [page, status, sortByDate]);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
    fetchOrders(1, newStatus);
  };

  const handleOrderStatus = (orderId) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    setFilteredOrders((prevFilteredOrders) => prevFilteredOrders.filter((order) => order.id !== orderId));
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <div className="mb-4">
          <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700 mr-3">
            Sắp xếp theo ngày
          </label>
          <select
            id="sort-by-date"
            value={sortByDate}
            onChange={(e) => {
              setSortByDate(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-[180px] px-1 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
          >
            <option value="DESC">Mới nhất</option>
            <option value="ASC">Cũ nhất</option>
          </select>
        </div>
        <div className="flex space-x-2 overflow-x-auto bg-primary/10 p-1 rounded-lg mb-6">
          <button
            onClick={() => handleStatusChange("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center
              ${status === "" ? "bg-primary/80 text-white" : "text-gray-600 hover:bg-primary/20"}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" /> Tất cả
          </button>
          <button
            onClick={() => handleStatusChange("Pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center
              ${status === "Pending" ? "bg-primary/80 text-white" : "text-gray-600 hover:bg-primary/20"}`}
          >
            <PendingOutlined className="w-4 h-4 mr-2" /> Đang chờ
          </button>
          <button
            onClick={() => handleStatusChange("Success")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center
              ${status === "Success" ? "bg-primary/80 text-white" : "text-gray-600 hover:bg-primary/20"}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Thành công
          </button>
          <button
            onClick={() => handleStatusChange("Cancelled")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center
              ${status === "Cancelled" ? "bg-primary/80 text-white" : "text-gray-600 hover:bg-primary/20"}`}
          >
            <XCircle className="w-4 h-4 mr-2" /> Đã hủy
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
            <div className="h-4 w-4 bg-white rounded-full"></div>
          </div>
          <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Loading...
          </span>
        </div>
      )}

      {filteredOrders.length === 0 && !isLoading ? (
        <p className="text-center text-gray-500">Không có đơn hàng nào.</p>
      ) : (
        <OrderTableSeller orders={filteredOrders} onOrderStatusChanged={handleOrderStatus} />
      )}
    </div>
  );
};

export default OrderHistorySeller;
