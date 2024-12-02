import React, { useState, useEffect } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { ToastContainer, toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import slugify from '~/ultis/config';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

const GadgetHistoryDetail = () => {
  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGadgetHistory = async () => {
      try {
        const response = await AxiosInterceptor.get('/api/gadget-histories');
        const fetchedGadgets = response.data.items.map(item => item.gadget);
        setGadgets(fetchedGadgets);
      } catch (error) {
        toast.error('Failed to fetch gadget history');
      } finally {
        setLoading(false);
      }
    };

    fetchGadgetHistory();
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">Sản phẩm đã xem</h1>
      <ToastContainer />

      {/* Custom Navigation Buttons */}
      <div className="relative max-w-md mx-auto"> {/* Thêm max-w-md và mx-auto */}
        <Swiper
          slidesPerView={1}
          navigation={{
            prevEl: '.custom-swiper-button-prev',
            nextEl: '.custom-swiper-button-next',
          }}
          modules={[Navigation]}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          spaceBetween={30}
          loop={true}
          className="w-full" // Thêm w-full
        >
          {gadgets.length > 0 ? (
            gadgets.map((gadget) => (
              <SwiperSlide key={gadget.id} className="flex justify-center"> {/* Thêm flex và justify-center */}
                <div
                  onClick={() =>
                    navigate(`/gadget/detail/${slugify(gadget.name)}`, {
                      state: { productId: gadget.id },
                    })
                  }
                  className="relative p-2 border rounded-lg shadow-md w-full max-w-sm cursor-pointer" /* Thay đổi w-76 thành w-full và max-w-sm */
                >
                  <div className="flex">
                    <img
                      src={gadget.thumbnailUrl}
                      alt={gadget.name}
                      className="w-16 h-16 object-contain rounded mr-4"
                    />
                    <div className="flex flex-col w-48">
                      <h3
                        className="font-semibold text-xs overflow-hidden overflow-ellipsis whitespace-nowrap"
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 1,
                          whiteSpace: 'normal',
                        }}
                      >
                        {gadget.name}
                      </h3>
                      <div className="text-gray-500 text-sm mt-1">
                        {gadget.discountPercentage > 0 ? (
                          <>
                            <span className="text-red-500 font-semibold">
                              {gadget.discountPrice.toLocaleString()}₫
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 font-semibold ">
                            {gadget.price.toLocaleString()}₫
                          </span>
                        )}
                      </div>
                      {gadget.status === "Inactive" ? (
                        <div className="text-red-500 font-bold text-sm">
                          Sản phẩm đã bị khóa
                        </div>
                      ) : !gadget.isForSale && (
                        <div className="text-red-500 font-bold text-sm">
                          Ngừng bán
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <p>Không có sản phẩm đã xem gần đây.</p>
          )}
        </Swiper>

        {/* Updated Navigation Buttons with conditional rendering */}
        <button 
          className={`custom-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-l shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors ${
            isBeginning ? 'hidden' : ''
          }`}
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button 
          className={`custom-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-l shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors ${
            isEnd ? 'hidden' : ''
          }`}
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default GadgetHistoryDetail;
