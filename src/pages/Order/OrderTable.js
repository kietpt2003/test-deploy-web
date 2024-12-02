// orderId = sellerorderId 
import { HomeOutlined, PhoneOutlined } from "@ant-design/icons";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AxiosInterceptor from "~/components/api/AxiosInterceptor";
import slugify from "~/ultis/config";

const OrderTable = ({ orders, onOrderCancelled }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const handleChangePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const getPaginationRange = () => {
    const maxVisible = 5; // Số lượng nút hiển thị
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(start + maxVisible - 1, totalPages);

    // Điều chỉnh start nếu end đã chạm giới hạn
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  // Add this useEffect to reset pagination when orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [orders]);

  // Function to open the cancel modal and set the selected order ID
  const openCancelModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  // Function to handle the cancel request
  const handleCancelOrder = async () => {
    if (!cancelReason) {
      toast.error("Vui lòng điền lý do hủy!!");
      return;
    }
    try {
      await AxiosInterceptor.put(`/api/seller-order/${selectedOrderId}/cancel`, {
        reason: cancelReason,
      });
      setShowCancelModal(false);
      setCancelReason("");
      toast.success("Bạn đã hủy đơn thành công!!");

      // Thêm phần này để update trạng thái của order
      if (onOrderCancelled) {
        onOrderCancelled(selectedOrderId);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.reasons) {
        const reasons = error.response.data.reasons;

        // Display the message from the first reason
        if (reasons.length > 0) {
          const reasonMessage = reasons[0].message;
          toast.error(reasonMessage);
        } else {
          toast.error("Thay đổi trạng thái thất bại, vui lòng thử lại");
        }
      }
    }
  };

  useEffect(() => {
    if (!showCancelModal) {
      setCancelReason(""); // Clear reason when modal is closed
    }
  }, [showCancelModal]);

  const handleOrderClick = (orderId) => {
    navigate(`/order/detail/${orderId}`);
  };

  const hasPendingOrders = orders.some((order) => order.status === "Pending");
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
      <table className="min-w-full bg-white border border-gray-200 table-fixed">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b w-1/4">Sản phẩm</th>
            <th className="py-2 px-4 border-b w-1/4">Tổng giá tiền</th>
            <th className="py-2 px-4 border-b w-1/4">Trạng thái</th>
            <th className="py-2 px-4 border-b w-1/4">Ngày đặt</th>
            <th className="py-2 px-4 border-b w-1/4"></th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-gray-50"
            
            >
              {/* Products Column */}
              <td className="py-2 px-4 border-b">
                {order.gadgets.map((gadget) => (
                  <div key={gadget.sellerOrderItemId} 
                  onClick={() => navigate(`/gadget/detail/${slugify(gadget.name)}`, {
                    state: {
                        productId: gadget.gadgetId,
                    }
                })}
                  className="flex items-center space-x-4 py-2 cursor-pointer">
                    <img
                      src={gadget.thumbnailUrl}
                      alt={gadget.name}
                      className="w-12 h-12 object-contain rounded"
                    />
                    <div>
                      <p className="font-semibold">{gadget.name}</p>
                      {gadget.discountPercentage > 0 ? (
                        <div className="flex items-center space-x-2">
                          <p className="text-red-500 font-semibold text-sm">
                            {gadget.quantity} x {gadget.discountPrice.toLocaleString()}₫
                          </p>
                          <p className="line-through text-gray-500 text-xs">
                            {gadget.price.toLocaleString()}₫
                          </p>
                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                            -{gadget.discountPercentage}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          {gadget.quantity} x {gadget.discountPrice.toLocaleString()}₫
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </td>

              {/* Total Amount Column */}
              <td className="py-2 px-4 border-b text-center">{order.amount.toLocaleString()}₫</td>

              {/* Status Column */}
              <td className="py-2 px-4 border-b text-center">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
        ${order.status === "Success" ? "bg-green-100 text-green-800" : order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                >
                  {order.status === "Success"
                    ? "Thành công"
                    : order.status === "Pending"
                    ? "Đang chờ"
                    : order.status === "Cancelled"
                    ? "Đã hủy"
                    : order.status}
                </span>
              </td>

              {/* Order Date Column */}
              <td className="py-2 px-4 border-b text-center">{formatDate(order.createdAt)}</td>

              {/* Actions Column */}
              {/* {hasPendingOrders && (
                <td className="py-2 px-4 border-b text-center">
                  {order.status === "Pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openCancelModal(order.id);
                      }}
                      className="text-primary/70 hover:text-secondary/80"
                    >
                      <Eye className="h-5 w-5 items-center" />
                    </button>
                  )}
                </td>
              )} */}
                <td>
                  <button
                onClick={() => handleOrderClick(order.id)}
                    className="text-primary/70 hover:text-secondary/80"
                  >
                    <Eye className="h-5 w-5 items-center" />
                  </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        {getPaginationRange().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handleChangePage(pageNumber)}
            className={`px-4 py-2 rounded-md ${
              pageNumber === currentPage
                ? 'bg-primary/80 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            // disabled={isLoading}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      {/* Cancel Order Modal */}
      {/* {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Hủy đơn hàng</h2>
            <p className="text-gray-700 mb-4">Vui lòng nhập lý do hủy :</p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows="4"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do ở đây..."
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setShowCancelModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleCancelOrder}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default OrderTable;