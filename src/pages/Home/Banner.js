import React from "react";
import BannerImg from "../../assets/hero/blackfriday.png";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { VscLaw } from "react-icons/vsc";
import { RiSecurePaymentLine } from "react-icons/ri";
import { HiOutlineTag } from "react-icons/hi";

const Banner = () => {
  return (
    <div className="min-h-[550px] flex justify-center items-center py-12 sm:py-0">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* image section */}
          <div data-aos="zoom-in">
            <img
              src={BannerImg}
              alt=""
              className="max-w-[400px] h-[350px] rounded-xl w-full mx-auto drop-shadow-[-10px_10px_12px_rgba(0,0,0,1)] object-cover"
            />
          </div>

          {/* text details section */}
          <div className="flex flex-col justify-center gap-6 sm:pt-0">
            <h1 data-aos="fade-up" className="text-3xl sm:text-4xl font-bold">
              Black Friday!!! Giảm giá tới 50%
            </h1>
            <p
              data-aos="fade-up"
              className="text-sm text-gray-500 tracking-wide leading-5"
            >
              Cơ hội duy nhất trong năm để sở hữu những sản phẩm yêu thích với mức giá không thể tin được!
            </p>
            <div className="flex flex-col gap-4">
              <div data-aos="fade-up" className="flex items-center gap-4">
                <HiOutlineSpeakerphone className="text-4xl h-12 w-12 shadow-sm p-4 rounded-full bg-violet-100 dark:bg-violet-400" />
                <p>Những sản phẩm chất lượng</p>
              </div>
              <div data-aos="fade-up" className="flex items-center gap-4">
                <VscLaw className="text-4xl h-12 w-12 shadow-sm p-4 rounded-full bg-orange-100 dark:bg-orange-400" />
                <p>Giá cả cạnh tranh</p>
              </div>
              <div data-aos="fade-up" className="flex items-center gap-4">
                <RiSecurePaymentLine className="text-4xl h-12 w-12 shadow-sm p-4 rounded-full bg-green-100 dark:bg-green-400" />
                <p>Phương thức thanh toán đơn giản</p>
              </div>
              <div data-aos="fade-up" className="flex items-center gap-4">
                <HiOutlineTag className="text-4xl h-12 w-12 shadow-sm p-4 rounded-full bg-yellow-100 dark:bg-yellow-400" />
                <p>Nhận nhiều ưu đãi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
