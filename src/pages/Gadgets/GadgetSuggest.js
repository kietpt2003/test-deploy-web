import React, { useState, useEffect, useRef } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { ToastContainer, toast } from 'react-toastify';
import { CiHeart } from 'react-icons/ci';
import { useLocation, useNavigate } from 'react-router-dom';
import slugify from '~/ultis/config';
import 'react-toastify/dist/ReactToastify.css';

const SuggestGadget = () => {
  const [suggestedGadgets, setSuggestedGadgets] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5); // Changed from 4 to 5
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = location.state || {};

  useEffect(() => {
    const fetchSuggestedGadgets = async () => {
      try {
        const response = await AxiosInterceptor.get(`/api/gadgets/suggested/${productId}`);
        setSuggestedGadgets(response.data.items);

        // Fetch review data for each gadget
        const reviewPromises = response.data.items.map(gadget =>
          AxiosInterceptor.get(`/api/reviews/summary/gadgets/${gadget.id}`)
        );
        const reviewResponses = await Promise.all(reviewPromises);

        const reviewMap = {};
        response.data.items.forEach((gadget, index) => {
          reviewMap[gadget.id] = reviewResponses[index].data;
        });
        setReviewData(reviewMap);
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedGadgets();
  }, [productId]);

  const toggleFavorite = async (gadgetId, isFavorite) => {
    try {
      await AxiosInterceptor.post(`/api/favorite-gadgets/${gadgetId}`);
      setSuggestedGadgets((prev) =>
        prev.map((product) =>
          product.id === gadgetId ? { ...product, isFavorite: !product.isFavorite } : product
        )
      );
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

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 8); // Tăng thêm 8 sản phẩm
  };

  if (loading) {
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
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-4">Gợi ý sản phẩm cho bạn</h1>
      <ToastContainer />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"> {/* Changed from grid-cols-4 to grid-cols-5 and adjusted gap */}
        {suggestedGadgets.slice(0, visibleCount).map((product) => (
          <div
            key={product.id}
            className="border-1 rounded-2xl shadow-sm text-black flex flex-col justify-between relative transition-transform duration-200 transform-gpu hover:scale-105 hover:border-primary/50 overflow-hidden bg-gray-100"
            onClick={() =>
              navigate(`/gadget/detail/${slugify(product.name)}`, {
                state: { productId: product.id },
              })
            }
          >
            {product.discountPercentage > 0 && (
              <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold text-center py-1 px-2 rounded-tr-md rounded-b-md">
                Giảm {`${product.discountPercentage}%`}
              </div>
            )}
            {product.status === "Inactive" ? (
              <div className="absolute top-1/3 left-0 transform -translate-y-1/2 w-full bg-red-500 text-white text-xs font-bold text-center py-1 rounded">
                Sản phẩm đã bị khóa
              </div>
            ) : product.isForSale === false && (
              <div className="absolute top-1/3 left-0 transform -translate-y-1/2 w-full bg-red-500 text-white text-xs font-bold text-center py-1 rounded">
              Ngừng bán
            </div>
            )}
            <div className="p-2 flex-grow cursor-pointer">
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="w-full h-24 object-contain mb-2 rounded-xl"
              />
              <h3
                className="font-semibold text-xs overflow-hidden overflow-ellipsis whitespace-nowrap"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                }}
              >
                {product.name}
              </h3>

              <div className="flex py-4">

                {product.discountPercentage > 0 ? (
                  <>
                    <div className="text-red-500 font-semibold text-xs mr-2">
                      {product.discountPrice.toLocaleString()}₫
                    </div>
                    <span className="line-through text-gray-500 text-xs">
                      {product.price.toLocaleString()}₫
                    </span>
                  </>
                ) : (
                  <div className="text-gray-800 font-semibold text-xs">
                    {product.price.toLocaleString()}₫
                  </div>
                )}
              </div>
            </div>
            {/* Only show reviews if they exist and count > 0 */}
            {reviewData[product.id] && reviewData[product.id].numOfReview > 0 && (
              <div className="flex items-center text-xs text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {reviewData[product.id].avgReview} ({reviewData[product.id].numOfReview})
                </span>
              </div>
            )}
            <div className=" p-2">
              <div className="w-full text-xs flex items-center justify-end px-2 py-1 text-gray-500">
                <span className="mr-2">Yêu thích</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id, product.isFavorite);
                  }}
                  className="cursor-pointer flex items-center"
                >
                  {product.isFavorite ? (
                    <svg
                      className="h-6 w-4 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <CiHeart className="h-6 w-4 text-gray-500" />
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleCount < suggestedGadgets.length && (
        <div className="mt-6 flex justify-center">
          <span
            onClick={handleShowMore}
            className=" text-gray font-semibold py-2 px-4 rounded cursor-pointer"
          >
            Xem thêm
          </span>
        </div>
      )}
    </div>
  );
};

export default SuggestGadget;
