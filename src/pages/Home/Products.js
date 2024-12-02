import React, { useEffect, useState, useRef } from 'react';
import { CiHeart } from 'react-icons/ci';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import useAuth from '~/context/auth/useAuth';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import slugify from '~/ultis/config';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";




const categoryIds = {
  laptop: "458d7752-e45e-444a-adf9-f7201c07acd1",
  headphones: "9f6ac480-e673-49ec-9bc0-7566cca80b86",
  speakers: "bb65a310-e28e-4226-a562-0b6ea27f4faa",
  phones: "ea4183e8-5a94-401c-865d-e000b5d2b72d"
};

const apiBase = process.env.NODE_ENV === "development"
  ? process.env.REACT_APP_DEV_API + "/"
  : process.env.REACT_APP_PRO_API + "/";

const categoryPaths = Object.fromEntries(
  Object.entries(categoryIds).map(([key, id]) => [key, `${apiBase}api/gadgets/category/${id}?Page=1&PageSize=20`])
);

export default function ProductPage() {

  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const navigate = useNavigate();
  const [products, setProducts] = useState({
    laptop: [],
    headphones: [],
    speakers: [],
    phones: []
  });

  const [brands, setBrands] = useState({
    laptop: [],
    headphones: [],
    speakers: [],
    phones: []
  });

  const navigationRefs = {
    laptop: { prev: useRef(null), next: useRef(null) },
    headphones: { prev: useRef(null), next: useRef(null) },
    speakers: { prev: useRef(null), next: useRef(null) },
    phones: { prev: useRef(null), next: useRef(null) }
  };
  const [swiperInstances, setSwiperInstances] = useState({
    laptop: null,
    headphones: null,
    speakers: null,
    phones: null
  });
  const [swiperStates, setSwiperStates] = useState({
    laptop: { isBeginning: true, isEnd: false },
    headphones: { isBeginning: true, isEnd: false },
    speakers: { isBeginning: true, isEnd: false },
    phones: { isBeginning: true, isEnd: false },
  });
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    const fetchCategoryData = async (category) => {
      setLoading(true);
      const api = isAuthenticated ? AxiosInterceptor : axios;
      try {
        const productResponse = await api.get(categoryPaths[category]);

        const activeProducts = productResponse.data.items.filter(
          (product) => product.sellerStatus === 'Active' && product.gadgetStatus === 'Active'
        );

        // Fetch reviews for each product
        const reviewPromises = activeProducts.map(product =>
          axios.get(`${apiBase}api/reviews/summary/gadgets/${product.id}`)
            .then(response => ({ id: product.id, ...response.data }))
            .catch(() => ({ id: product.id, avgReview: 0, numOfReview: 0 }))
        );

        const reviewResults = await Promise.all(reviewPromises);
        const reviewMap = reviewResults.reduce((acc, review) => {
          acc[review.id] = review;
          return acc;
        }, {});

        setReviews(prev => ({ ...prev, ...reviewMap }));
        setProducts((prev) => ({ ...prev, [category]: activeProducts }));

        const brandResponse = await axios.get(`${apiBase}api/brands/categories/${categoryIds[category]}`);
        setBrands((prev) => ({ ...prev, [category]: brandResponse.data.items }));
      } catch (error) {
        console.error(`Error fetching ${category} data:`, error);
        toast.error(`Có lỗi xảy ra khi lấy dữ liệu ${category}.`);
      } finally {
        setLoading(false);
      }
    };

    Object.keys(categoryIds).forEach(fetchCategoryData);
  }, []);


  const toggleFavorite = async (gadgetId, isFavorite, setCategory) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
      return;
    }
    try {
      await AxiosInterceptor.post(`/api/favorite-gadgets/${gadgetId}`);
      setProducts((prev) => ({
        ...prev,
        [setCategory]: prev[setCategory].map(product =>
          product.id === gadgetId ? { ...product, isFavorite: !isFavorite } : product
        )

      }));
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



  const renderProduct = (product, setCategory) => (
    <div className="parent-container overflow-hidden p-2">
      <div
        key={product.id}
        className="border-2 rounded-2xl shadow-sm flex flex-col justify-between relative transition-transform duration-200 transform hover:scale-105 hover:border-primary/50 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
        onClick={() => navigate(`/gadget/detail/${slugify(product.name)}`, {
          state: {
            productId: product.id,
          }
        })}
      >
        {product.discountPercentage > 0 && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-sm font-bold text-center py-1 px-1 rounded-tr-md rounded-b-md">
            Giảm {`${product.discountPercentage}%`}
          </div>
        )}
        {product.isForSale === false && (
          <div className="absolute top-0 right-0 bg-gray-400 text-white text-sm font-bold text-center py-1 px-1 rounded-tr-md rounded-b-md">
            Ngừng bán
          </div>
        )}
        <div className="p-2 flex-grow">
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="w-full h-32 object-contain mb-2 rounded-2xl"
          />
          <h3 className="font-semibold text-xs overflow-hidden overflow-ellipsis whitespace-nowrap dark:text-white" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
            {product.name}
          </h3>
          <div className="flex py-4">
            {product.discountPercentage > 0 ? (
              <>
                <div className="text-red-500 dark:text-red-400 font-semibold text-sm mr-2">
                  {product.discountPrice.toLocaleString()}₫
                </div>
                <span className="line-through text-gray-500 dark:text-gray-400">
                  {product.price.toLocaleString()}₫
                </span>
              </>
            ) : (
              <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm">
                {product.price.toLocaleString()}₫
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between p-2">
          {/* Reviews */}
          {reviews[product.id] && reviews[product.id].numOfReview > 0 ? (
            <div className="flex items-center text-xs text-gray-600">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1">
                  {reviews[product.id].avgReview} ({reviews[product.id].numOfReview})
                </span>
              </span>
            </div>
          ) : (
            // Placeholder to maintain spacing when no reviews exist
            <div className="w-16"></div>
          )}

          {/* Favorite Button */}
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">Yêu thích</span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id, product.isFavorite, setCategory);
              }}
              className="cursor-pointer flex items-center"
            >
              {product.isFavorite ? (
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <CiHeart className="h-5 w-5 text-gray-500" />
              )}
            </span>
          </div>
        </div>

      </div>
    </div>
  );

  const handleReachBeginning = (category) => {
    setSwiperStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], isBeginning: true }
    }));
  };

  const handleReachEnd = (category) => {
    setSwiperStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], isEnd: true }
    }));
  };

  const handleFromBeginning = (category) => {
    setSwiperStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], isBeginning: false }
    }));
  };

  const handleFromEnd = (category) => {
    setSwiperStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], isEnd: false }
    }));
  };
  const renderCategory = (category, title) => (
    <div data-aos="fade-up" className="mb-10">
      <div className="flex items-center justify-between p-2">
        <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
        <div className="flex flex-wrap space-x-2">
          {brands[category].map((brand) => (
            <button
              className="bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
              key={brand.id}
              onClick={() => {
                navigate(`/gadgets/${title}/${slugify(brand.name)}`, {
                  state: {
                    categoryId: categoryIds[category],
                    brandId: brand.id
                  }
                })
              }}
            >
              {brand.name}
            </button>
          ))}
          <button
            className="bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
            onClick={() => {
              navigate(`/gadgets/${title}`, {
                state: {
                  categoryId: categoryIds[category],
                }
              })
            }}
          >
            Xem thêm
          </button>
        </div>
      </div>

      <div className="relative group">
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          modules={[Navigation]}
          onSwiper={(swiper) => {
            setSwiperInstances(prev => ({
              ...prev,
              [category]: swiper
            }));
          }}
          onReachBeginning={() => handleReachBeginning(category)}
          onReachEnd={() => handleReachEnd(category)}
          onFromEdge={() => {
            handleFromBeginning(category);
            handleFromEnd(category);
          }}
          className="relative"
        >
          {products[category]?.reduce((slides, product, index) => {
            if (index % 10 === 0) slides.push([]);
            slides[slides.length - 1].push(product);
            return slides;
          }, []).map((productGroup, slideIndex) => (
            <SwiperSlide key={slideIndex}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 bg-gray-100">
                {productGroup.map(product => renderProduct(product, category))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {!swiperStates[category].isBeginning && (
          <button
            onClick={() => swiperInstances[category]?.slidePrev()}
            className="absolute left-0 z-10 top-1/2 transform -translate-y-1/2 cursor-pointer hidden group-hover:flex"
          >
            <ChevronLeft className="h-8 w-8 text-gray-500" />
          </button>
        )}

        {!swiperStates[category].isEnd && (
          <button
            onClick={() => swiperInstances[category]?.slideNext()}
            className="absolute right-0 z-10 top-1/2 transform -translate-y-1/2 cursor-pointer hidden group-hover:flex"
          >
            <ChevronRight className="h-8 w-8 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
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
  return (
    <div className="container p-10">
      <ToastContainer />
      {renderCategory("laptop", "Laptop")}
      {renderCategory("headphones", "Tai nghe")}
      {renderCategory("speakers", "Loa")}
      {renderCategory("phones", "Điện thoại")}
    </div>
  );
}
