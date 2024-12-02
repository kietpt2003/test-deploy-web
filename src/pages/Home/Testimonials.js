import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { Star } from 'lucide-react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await AxiosInterceptor.get('/api/reviews/home-page?Page=1&PageSize=50');
        setReviews(response.data.items);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  var settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    cssEase: "linear",
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 10000,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="py-10 mb-10">
      <div className="container">
        {/* header section */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p className="text-sm text-primary">
            Đánh giá từ khách hàng
          </p>
          <h1 className="text-3xl font-bold">
            Những phản hồi của khách hàng
          </h1>
          <p className="text-xs text-gray-400">
            Mua sắm dễ dàng, trải nghiệm tuyệt vời - Tech Gadgets luôn đồng hành cùng bạn
          </p>
        </div>

        {/* Testimonial cards */}
        <div>
          <Slider {...settings}>
            {reviews.map((review) => (
              <div className="my-6" key={review.id}>
                <div
                  className="flex flex-col gap-4 shadow-lg py-8 px-6 mx-4 rounded-xl dark:bg-gray-700 bg-primary/10 relative"
                >
                  <div className="mb-4">
                    <img
                      src={review.customer.avatarUrl || "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/9d575c15-aa74-4262-97cc-6fe67c57ce2e.jpg"}
                      alt={`Avatar of ${review.customer.fullName}`}
                      className="rounded-full w-20 h-20 object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 dark:text-gray-300">{review.content}</p>
                      <h1 className="text-xl font-bold text-black/80 dark:text-light dark:text-gray-300">
                        {review.customer.fullName}
                      </h1>
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-black/20 text-9xl font-serif absolute top-0 right-0 dark:text-gray-300">
                    ,,
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;