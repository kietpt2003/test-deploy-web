import React, { useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import StarRatings from 'react-star-ratings';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { AliwangwangOutlined, ArrowRightOutlined, SendOutlined } from '@ant-design/icons';
import slugify from '~/ultis/config';
import { useNavigate } from 'react-router-dom';

const ReviewTable = ({ orders, onOrderStatusChanged, onOrderUpdateStatusChanged }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [ratings, setRatings] = useState({});
  const [contents, setContents] = useState({});
  const [sellerReplies, setSellerReplies] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const isContentValid = (content, originalContent = '') => {
    return content && content.trim() !== '' && content.trim() !== originalContent.trim();
  };

  const handleOpenModal = (order, isEdit = false) => {
    setCurrentOrder(order);
    setRatings((prev) => ({
      ...prev,
      [order.id]: order.review ? order.review.rating : 0,
    }));
    setContents((prev) => ({
      ...prev,
      [order.id]: order.review ? order.review.content : '',
    }));
    setSellerReplies((prev) => ({
      ...prev,
      [order.id]: order.review && order.review.sellerReply ? order.review.sellerReply.content : '',
    }));
    setIsEditing(isEdit);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentOrder(null);
    setIsEditing(false);
  };

  const handleRatingChange = (orderId, newRating) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [orderId]: newRating,
    }));
  };

  const handleContentChange = (orderId, newContent) => {
    setContents((prevContents) => ({
      ...prevContents,
      [orderId]: newContent,
    }));
  };


  const handleSubmitReview = async (order) => {
    const rating = ratings[order.sellerOrderItemId] || 0;
    const content = contents[order.sellerOrderItemId] || '';
    if (!isContentValid(content)) {
      toast.error('Nội dung phản hồi không được để trống');
      return;
    }

    if (rating < 0 || rating > 5 || content.trim() === '') {
      toast.error('Rating phải từ 0 đến 5 và nội dung không được để trống.');
      return;
    }

    try {
      await AxiosInterceptor.post(`/api/review/seller-order-item/${order.sellerOrderItemId}`, {
        Rating: rating,
        Content: content,
      });
      toast.success('Đánh giá đã được gửi.');
      onOrderStatusChanged(order.sellerOrderItemId);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.reasons) {
        const reasons = error.response.data.reasons;
        if (reasons.length > 0) {
          const reasonMessage = reasons[0].message;
          toast.error(reasonMessage);
        } else {
          toast.error("Thay đổi trạng thái thất bại, vui lòng thử lại");
        }
      }
    }
  };

  const handleUpdateReview = async () => {
    const newContent = contents[currentOrder.review.id];
    const originalContent = currentOrder.review.content;

    if (ratings[currentOrder.id] === currentOrder.review.rating &&
      contents[currentOrder.id].trim() === currentOrder.review.content.trim()) {
      toast.error('Vui lòng thay đổi nội dung hoặc số sao trước khi cập nhật.');
      return;
    }

    if (ratings[currentOrder.id] < 0 || ratings[currentOrder.id] > 5 || contents[currentOrder.id].trim() === '') {
      toast.error('Rating phải từ 0 đến 5 và nội dung không được để trống.');
      return;
    }

    try {
      await AxiosInterceptor.patch(`/api/review/${currentOrder.review.id}`, {
        Rating: ratings[currentOrder.id],
        Content: contents[currentOrder.id],
      });
      toast.success('Đánh giá đã được cập nhật.');
      handleCloseModal();
      onOrderUpdateStatusChanged({
        ...currentOrder,
        review: {
          ...currentOrder.review,
          rating: ratings[currentOrder.id],
          content: contents[currentOrder.id],
          isUpdated: true,
        },
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.reasons) {
        const reasons = error.response.data.reasons;
        if (reasons.length > 0) {
          const reasonMessage = reasons[0].message;
          toast.error(reasonMessage);
        } else {
          toast.error("Thay đổi trạng thái thất bại, vui lòng thử lại");
        }
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const isUpdateValid = () => {
    if (!currentOrder || !currentOrder.review) return false;

    const newRating = ratings[currentOrder.id];
    const newContent = contents[currentOrder.id]?.trim() || '';

    // Check if content is empty or rating is invalid
    if (newContent === '' || newRating < 0 || newRating > 5) {
      return false;
    }

    // Check if content and rating are unchanged
    if (newRating === currentOrder.review.rating &&
      newContent === currentOrder.review.content.trim()) {
      return false;
    }

    return true;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const navigate = useNavigate();
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



  return (
    <div className="container max-w-6xl mx-auto p-4 flex flex-col gap-4">
      {currentOrders.map((order) => (
        <div key={order.id}
          onClick={() => navigate(`/gadget/detail/${slugify(order.name)}`, {
            state: {
              productId: order.gadgetId,
            }
          })}
          className="bg-white p-4 rounded-lg shadow-md flex relative cursor-pointer hover:bg-gray-50 transition-colors duration-200">
          <img src={order.thumbnailUrl} alt={order.name} className="w-24 h-24 object-contain rounded mr-4" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{order.name}</h3>
            {order.review === null ? (
              <div
                onClick={(e) => e.stopPropagation()}
              >
                <StarRatings
                  rating={ratings[order.sellerOrderItemId] || 0}
                  starRatedColor="#ffd700"
                  changeRating={(newRating) => handleRatingChange(order.sellerOrderItemId, newRating)}
                  numberOfStars={5}
                  starDimension="20px"
                  starSpacing="2px"

                />
                <div className="flex items-start">
                  <AliwangwangOutlined />
                  <div className="relative w-full h-10">
                    <textarea
                      value={contents[order.sellerOrderItemId] || ''}
                      onChange={(e) => handleContentChange(order.sellerOrderItemId, e.target.value)}
                      className="w-full h-8 overflow-hidden px-3 py-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-primary mt-2 resize-none"
                      rows={4} // Adjust number of rows as needed
                      placeholder="Đánh giá của bạn..."

                    />
                    <button
                      onClick={() => handleSubmitReview(order)}
                      className="absolute top-4 right-3 text-primary bg-transparent hover:text-secondary/80"
                    >
                      <SendOutlined className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <StarRatings
                  rating={order.review.rating}
                  starRatedColor="#ffd700"
                  numberOfStars={5}
                  starDimension="24px"
                  starSpacing="2px"
                />
                <div className="mt-2 flex items-center text-gray-700">
                  <p>{order.review.content}</p>
                  {order.review.isUpdated && (
                    <p className="ml-2 text-gray-400 text-xs">Đã chỉnh sửa</p>
                  )}
                  {order.review.status === 'Inactive' && (
                    <p className="ml-2 text-red-500 text-xs">Đánh giá của bạn đã bị khóa</p>
                  )}
                </div>

                <p className="mt-2 text-gray-500 text-sm">{formatDate(order.review.createdAt)}</p>

                {!order.review.isUpdated && (
                  <button onClick={() => handleOpenModal(order, true)} className="text-primary/70 hover:text-secondary/80 mt-2">
                    <Edit className="h-5 w-5 absolute top-4 right-4" />
                  </button>
                )}
              </div>
            )}
            {/* Seller Reply Section */}
            {order.review && order.review.sellerReply && order.review.sellerReply.status === 'Active' && (
              <div className=" bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-semibold text-primary mb-2">Phản hồi từ người bán</h4>
                <p className="text-gray-500 text-sm">{formatDate(order.review.sellerReply.createdAt)}</p>

                <div className="mt-2 flex items-center text-gray-700">
                  <p className="text-gray-700">{order.review.sellerReply.content}</p>
                  {order.review.sellerReply.isUpdated && (
                    <p className="ml-2 text-gray-400 text-xs">Đã chỉnh sửa</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        {getPaginationRange().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handleChangePage(pageNumber)}
            className={`px-4 py-2 rounded-md ${pageNumber === currentPage
              ? 'bg-primary/80 text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          // disabled={isLoading}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px]">
            <h2 className="text-xl font-bold mb-4">Cập nhật đánh giá</h2>
            <div className="mb-4">
              <StarRatings
                rating={ratings[currentOrder.id] || 0}
                starRatedColor="#ffd700"
                changeRating={(newRating) => handleRatingChange(currentOrder.id, newRating)}
                numberOfStars={5}
                starDimension="24px"
                starSpacing="2px"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">Nội dung</label>
              <textarea
                value={contents[currentOrder.id] || ''}
                onChange={(e) => handleContentChange(currentOrder.id, e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Hủy</button>
              <button onClick={handleUpdateReview} disabled={!isUpdateValid()} className={`px-4 py-2 bg-primary/75 text-white rounded ${isUpdateValid()
                ? 'hover:bg-secondary/85'
                : 'opacity-50 cursor-not-allowed'
                }`}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewTable;