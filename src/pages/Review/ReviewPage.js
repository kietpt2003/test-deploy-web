import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Star } from 'lucide-react';
import axios from 'axios';
import StarRatings from 'react-star-ratings';
import user from "~/assets/R.png"
const ReviewPage = () => {
  const location = useLocation();
  const { productId } = location.state || {};
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortByDate, setSortByDate] = useState('');
  const [sortByRating, setSortByRating] = useState('');
  const apiBaseUrl = process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_API
    : process.env.REACT_APP_PRO_API;
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/reviews/gadget/${productId}`, {
          params: {
            SortByDate: sortByDate,
            SortByRating: sortByRating,
          },
        });
        setReviews(response.data.items);
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
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, sortByDate, sortByRating]);

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
  const totalReviews = reviews.length;
  const starCounts = [0, 0, 0, 0, 0];

  reviews.forEach((review) => {
    starCounts[review.rating - 1]++;
  });

  const starPercentages = starCounts.map((count) => ((count / totalReviews) * 100).toFixed(2));

  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">Đánh giá sản phẩm</h1>
      <ToastContainer />

      <div className="mb-6 w-full flex justify-center">
        <div className="w-full max-w-md">
          {/* Average rating with stars */}
          <div className="flex items-center mb-4 justify-center">
            <span className="text-3xl font-bold text-primary/80">{averageRating}</span>
            <div className="ml-2 flex">
              <StarRatings
                rating={parseFloat(averageRating)}
                starRatedColor="orange"
                numberOfStars={5}
                starDimension="24px"
                starSpacing="2px"
              />
            </div>
          </div>

          {/* Star rating breakdown */}
          <div className="space-y-2">
            {starCounts.map((count, index) => (
              <div key={index} className="flex items-center">
                <span className="w-8 text-right">{5 - index}</span>
                <Star size={16} className="text-gray-400 ml-2" />
                <div className="flex-1 mx-2 h-3 bg-gray-200 rounded">
                  <div
                    className="h-3 bg-primary/80 rounded"
                    style={{ width: `${Math.floor(starPercentages[5 - index - 1])}%` }}
                  ></div>
                </div>
                <span className="w-12 text-right">{Math.floor(starPercentages[5 - index - 1])}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="mb-4">
          <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700 mr-3">Sắp xếp theo ngày</label>
          <select
            id="sort-by-date"
            value={sortByDate}
            onChange={(e) => setSortByDate(e.target.value)}
            className="w-full sm:w-[180px] px-1 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
          >
            <option value="">---</option>
            <option value="DESC">Mới</option>
            <option value="ASC">Cũ</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="sort-by-rating" className="text-sm font-medium text-gray-700 mr-3">Đánh giá theo</label>
          <select
            id="sort-by-rating"
            value={sortByRating}
            onChange={(e) => setSortByRating(e.target.value)}
            className="w-full sm:w-[180px] px-1 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
          > <option value="">---</option>
            <option value="DESC">Cao nhất</option>
            <option value="ASC">Thấp nhất</option>
          </select>
        </div>
      </div>
      {reviews.length > 0 ? (
        reviews
          .filter(review => review.status === 'Active')
          .map((review) => (
          <div key={review.id}
            className="mb-4 p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <img src={review.customer.avatarUrl || user} alt={review.customer.fullName} className="w-10 h-10 rounded-full mr-2" />
              <div>
                <p className="font-semibold">{review.customer.fullName}</p>
                <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
              <span className="text-gray-400">{'★'.repeat(5 - review.rating)}</span>
            </div>
            <div className="mt-2 flex items-center text-gray-700">
              <p>{review.content}</p>
              {review.isUpdated && (
                <p className="ml-2 text-gray-400 text-xs">Đã chỉnh sửa</p>
              )}
            </div>
            {review.sellerReply && review.sellerReply.status === 'Active' && (
              <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-md font-semibold text-primary mb-2">Phản hồi từ người bán</h4>
                <p className="text-gray-500 text-sm">{formatDate(review.sellerReply.createdAt)}</p>
                <div className="mt-2 flex items-center text-gray-700">
                  <p>{review.sellerReply.content}</p>
                  {review.sellerReply.isUpdated && (
                    <p className="ml-2 text-gray-400 text-xs">Đã chỉnh sửa</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>Không có đánh giá.</p>
      )}
    </div>
  );
};

export default ReviewPage;