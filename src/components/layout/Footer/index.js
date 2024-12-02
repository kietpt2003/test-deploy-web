import React from "react";
import footerLogo from "~/assets/logo.png";
import Banner from "~/assets/website/footer-pattern.jpg";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaLocationArrow,
  FaMobileAlt,
  FaEnvelope,
} from "react-icons/fa";

const BannerImg = {
  backgroundImage: `url(${Banner})`,
  backgroundPosition: "bottom",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  height: "100%",
  width: "100%",
};

const FooterLinks = [
  {
    title: "Trang chủ",
    link: "/#",
  },
  {
    title: "Sản phẩm",
    link: "/#",
  },
  {
    title: "Tin Tức & Khuyến Mãi",
    link: "/#",
  },
  {
    title: "Hỗ Trợ Khách Hàng",
    link: "/#",
  },
];

const FooterLinks2 = [
  {
    title: "Về Tech-Gadget",
    link: "/#",
  },
  {
    title: "Chính sách sử dụng dịch vụ",
    link: "/#",
  },
  {
    title: "Điều khoản bảo mật",
    link: "/#",
  },
];

const Footer = () => {
  return (
    <div style={BannerImg} className="text-white">
      <div className="container">
        <div className="grid md:grid-cols-3 pb-44 pt-5">
          {/* company details */}
          <div className="py-8 px-4">
            <h1 className="sm:text-3xl text-xl font-bold sm:text-left text-justify mb-3 flex items-center gap-3">
              <img src={footerLogo} alt="" className="max-w-[50px]" />
              Tech Gadget
            </h1>
            <p>
              Tìm kiếm và lựa chọn thiết bị công nghệ với các tùy chọn tùy chỉnh, giúp bạn dễ dàng tìm thấy sản phẩm hoàn hảo cho nhu cầu của mình.
            </p>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 col-span-2 md:pl-10">
            <div>
              <div className="py-8 px-4">
                <h1 className="sm:text-xl text-xl font-bold sm:text-left text-justify mb-3">
                  Dịch vụ
                </h1>
                <ul className="flex flex-col gap-3">
                  {FooterLinks.map((link) => (
                    <li
                      className="cursor-pointer hover:text-primary hover:translate-x-1 duration-300 text-gray-200"
                      key={link.title}
                    >
                      <span>{link.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <div className="py-8 px-4">
                <h1 className="sm:text-xl text-xl font-bold sm:text-left text-justify mb-3">
                  Liên kết
                </h1>
                <ul className="flex flex-col gap-3">
                  {FooterLinks2.map((link) => (
                    <li
                      className="cursor-pointer hover:text-primary hover:translate-x-1 duration-300 text-gray-200"
                      key={link.title}
                    >
                      <span>{link.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* social links */}

            <div>
              <div className="flex items-center gap-3 mt-6">
                <a href="#">
                  <FaInstagram className="text-3xl" />
                </a>
                <a href="#">
                  <FaFacebook className="text-3xl" />
                </a>
                <a href="#">
                  <FaLinkedin className="text-3xl" />
                </a>
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3">
                  <FaEnvelope />
                  <p>tech.gadgets.portal@gmail.com</p>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <FaLocationArrow />
                  <p>Long Thạnh Mỹ, Thành Phố Thủ Đức, Hồ Chí Minh</p>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <FaMobileAlt />
                  <p>(+84)388415317</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
