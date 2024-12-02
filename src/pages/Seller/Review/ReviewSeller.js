import React, { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, PenLine, NotebookPen, MessageSquareOff, MessageSquareMore } from "lucide-react";
import AxiosInterceptor from "~/components/api/AxiosInterceptor";
import { toast, ToastContainer } from "react-toastify";
import ReviewSellerTable from "./ReviewSellerTable";

const ReviewSeller = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [status, setStatus] = useState("NotReply");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortByDate, setSortByDate] = useState('DESC');

  const fetchOrders = async (pageNumber = 1, statusFilter = status) => {
    try {
      const response = await AxiosInterceptor.get(`/api/reviews/seller-order-items?FilterBy=${statusFilter}&SortByDate=${sortByDate}`, {
        params: { Page: pageNumber, PageSize: 100 },
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
          toast.error("Có lỗi xảy ra vui lòng thử lại ");
        }
      }
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
    // Update orders and filteredOrders state to remove the cancelled order
    setOrders((prevOrders) => prevOrders.filter((order) => order.review.id !== orderId));
    setFilteredOrders((prevFilteredOrders) => prevFilteredOrders.filter((order) => order.review.id !== orderId));
  };

  const handleOrderUpdateStatus = (updatedOrder) => {
    setOrders((prevOrders) => {
      const orderIndex = prevOrders.findIndex(order => order.review.id === updatedOrder.review.id);
      if (orderIndex !== -1) {
        const newOrders = [...prevOrders];
        newOrders[orderIndex] = updatedOrder;
        return newOrders;
      }
      return prevOrders.filter(order => order.review.id !== updatedOrder.review.id);
    });
    setFilteredOrders((prevFilteredOrders) => {
      const orderIndex = prevFilteredOrders.findIndex(order => order.review.id === updatedOrder.review.id);
      if (orderIndex !== -1) {
        const newFilteredOrders = [...prevFilteredOrders];
        newFilteredOrders[orderIndex] = updatedOrder;
        return newFilteredOrders;
      }
      return prevFilteredOrders.filter(order => order.review.id !== updatedOrder.review.id);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold text-center text-indigo-900 dark:text-white ">
        Phản hồi của bạn
      </h1>
      <div className="flex justify-between items-center mb-6">
        <div className="mb-4">
          <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700 mr-3">Sắp xếp theo ngày</label>
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
            onClick={() => handleStatusChange("NotReply")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center ${status === "NotReply" ? "bg-primary/80 text-white" : "text-gray-600 hover:bg-primary/20"}`}
          >
            <MessageSquareOff className="inline-block mr-2" /> Chưa trả lời
          </button>
          <button
            onClick={() => handleStatusChange("Replied")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center ${status === "Replied" ? "bg-primary/80 text-white" : "text-gray-600 hover:bg-primary/20"}`}
          >
            <MessageSquareMore className="inline-block mr-2" /> Đã trả lời
          </button>
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">Không có phản hồi nào.</p>
      ) : (
        <ReviewSellerTable orders={filteredOrders} onOrderStatusChanged={handleOrderStatus} onOrderUpdateStatusChanged={handleOrderUpdateStatus} />
      )}
    </div>
  );
};

export default ReviewSeller;