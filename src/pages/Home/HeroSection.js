import React, { useEffect, useState } from "react";
import Image1 from "../../assets/hero/phone.png";
import Image2 from "../../assets/hero/laptop.png";
import Image3 from "../../assets/hero/headphone.png";
import Slider from "react-slick";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import slugify from "~/ultis/config";
import { Button } from "antd";
// Image list for the slider

const ImageList = [
  {
    id: 1,
    img: Image3,
    title: "Khuyến mãi HOT: Giảm giá tới 15% cho tai nghe cao cấp!",
    description:
      "Trải nghiệm âm thanh đỉnh cao với những chiếc tai nghe chất lượng hàng đầu. Cơ hội vàng để nâng cấp thiết bị của bạn. Mua ngay kẻo lỡ!",
  },
  {
    id: 2,
    img: Image2,
    title: "Sale sốc 20% - Laptop Gaming chinh phục mọi trận đấu!",
    description:
      "Khám phá thế giới gaming đỉnh cao với các dòng laptop hiệu năng mạnh mẽ. Cơ hội có hạn, săn ngay để không bỏ lỡ ưu đãi đặc biệt này!",
  },
  {
    id: 3,
    img: Image1,
    title: "Smartphone chính hãng - Giảm giá tới 15% hôm nay!",
    description:
      "Sở hữu điện thoại xịn với mức giá không thể tốt hơn. Thoải mái lựa chọn các dòng sản phẩm từ iPhone, Samsung, Xiaomi, và hơn thế nữa. Ưu đãi kết thúc sớm!",
  },
];


const fetchBrandsForCategories = async (navigate) => {
  try {
    const categoriesResponse = await axios.get(
      process.env.NODE_ENV === "development"
        ? `${process.env.REACT_APP_DEV_API}/api/categories`
        : `${process.env.REACT_APP_PRO_API}/api/categories`
    );

    const categoriesData = categoriesResponse.data.items;

    const updatedCategories = await Promise.all(
      categoriesData.map(async (category) => {
        const brands = [];
        let page = 1;
        let hasNextPage = true;

        while (hasNextPage) {
          try {
            const brandsResponse = await axios.get(
              `${process.env.REACT_APP_DEV_API || process.env.REACT_APP_PRO_API}/api/brands/categories/${category.id}?page=${page}&pageSize=20`
            );

            const brandsPage = brandsResponse.data.items || [];
            brands.push(...brandsPage); // Gộp thương hiệu mới vào mảng tổng

            hasNextPage = brandsResponse.data.hasNextPage;
            page++; // Tăng page để lấy trang tiếp theo
          } catch (error) {
            console.error(`Error fetching brands for category ${category.name}`, error);
            break; // Nếu có lỗi, thoát khỏi vòng lặp
          }
        }
        let hotGadgets = [];
        try {
          const hotGadgetsResponse = await axios.get(
            `${process.env.REACT_APP_DEV_API || process.env.REACT_APP_PRO_API}/api/gadgets/hot?categoryId=${category.id}`
          );
          hotGadgets = hotGadgetsResponse.data.items || []; // Store hot gadgets


        } catch (error) {
          console.error(`Error fetching hot gadgets for category ${category.name}`, error);
        }

        // Chia thành từng cột 10 thương hiệu
        const brandColumns = [];
        const columnSize = Math.ceil(brands.length / 3); // Tính kích thước cột

        for (let i = 0; i < brands.length; i += columnSize) {
          brandColumns.push(brands.slice(i, i + columnSize)); // Tạo mảng các cột thương hiệu
        }

        return {
          name: category.name,
          icon: getCategoryIcon(category.name),
          details: [
            {
              subcategory: `Hãng ${category.name}`,
              items: brandColumns.map((column) =>
                column.map((brand) => ({
                  name: brand.name,
                  navigate: () => navigate(`/gadgets/${category.name}/${slugify(brand.name)}`, {

                    state: {
                      categoryId: category.id,
                      brandId: brand.id
                    }

                  })
                }))
              ),
              hotGadgets: hotGadgets.map(gadget => ({
                name: gadget.name,
                navigate: () => navigate(`/gadget/detail/${slugify(gadget.name)}`, {
                  state: {
                    productId: gadget.id
                  }
                })
              }))
            }
          ]
        };
      })
    );

    return updatedCategories;
  } catch (error) {
    console.error("Error fetching categories or brands", error);
    return [];
  }
};


const getCategoryIcon = (categoryName) => {
  switch (categoryName.toLowerCase()) {
    case 'laptop':
      return (
        <svg
          className="h-8 w-8 text-yellow-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3h18v12H3z" />
          <path d="M2 16h20v2H2z" />
          <path d="M4 16V4h16v12H4z" />
        </svg>
      );


    case 'tai nghe':
      return (
        <svg
          className="h-8 w-8 text-yellow-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a9 9 0 00-9 9v3a3 3 0 006 0v-3a3 3 0 006 0v3a3 3 0 006 0v-3a9 9 0 00-9-9z" />
          <path d="M12 21v1" />
        </svg>
      );


    case 'loa':
      return (
        <svg
          className="h-8 w-8 text-yellow-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <path d="M9 9h6v6H9z" />
          <line x1="3" y1="12" x2="0" y2="12" />
          <line x1="24" y1="12" x2="21" y2="12" />
        </svg>
      );


    case 'điện thoại':
      return (
        <svg
          className="h-8 w-8 text-yellow-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
          <path d="M9 4h6" />
          <path d="M9 20h6" />
        </svg>
      );


    default:
      return null;
  }
};

const promoImages = ["https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/11f7ef79-450b-4375-9ff3-266344d1a855.jpg",
  "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/1de74d95-2bc4-4b56-8922-43ae56ea038c.jpg",
  "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/76f7a00b-6749-45db-b5bc-6377237ee6d5.jpg"];

const HeroSection = ({ handleOrderPopup }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isHoveringDetails, setIsHoveringDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCategories = async () => {
      const fetchedCategories = await fetchBrandsForCategories(navigate);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    loadCategories();
  }, []);
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
  const handleMouseEnterCategory = (index) => {
    setHoveredCategory(index);
    setIsHoveringDetails(true);
  };

  const handleMouseLeaveCategory = () => {
    setIsHoveringDetails(false);
  };

  const handleBrandClick = (navigateFunction) => {
    if (typeof navigateFunction === 'function') {
      navigateFunction();
    }
  };


  const handleMouseEnterDetails = () => {
    setIsHoveringDetails(true);
  };

  const handleMouseLeaveDetails = () => {
    setIsHoveringDetails(false);
    setHoveredCategory(null);
  };
  var settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "ease-in-out",
    pauseOnHover: false,
    pauseOnFocus: true,
  };
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
    <div className="relative overflow-hidden min-h-[800px] sm:min-h-[100px] bg-gray-100 flex dark:bg-gray-950 dark:text-white duration-200 p-5">
      {/* background pattern */}
      <div className="h-[700px] w-[700px] bg-primary/40 absolute -top-1/2 right-0 rounded-3xl rotate-45 -z[8]"></div>

      {/* Main section */}
      <div className="container flex gap-2 justify-center sm:pb-0 relative">

        {/* Left Sidebar */}
        <div className="w-[200px] h-[300px] bg-white dark:bg-gray-800 rounded-lg p-4 relative z-20">
          <div className="h-[400px] flex flex-col justify-between p-4">
            <ul className="flex flex-col">
              {categories.map((category, index) => (
                <li
                  key={index}
                  onMouseEnter={() => handleMouseEnterCategory(index)}
                  onMouseLeave={handleMouseLeaveCategory}
                  className="flex items-center gap-2 cursor-pointer mb-5"
                >
                  {category.icon}
                  <h3>{category.name}</h3>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands Panel - Đặt phần này ở cùng vị trí */}

          {(hoveredCategory !== null || isHoveringDetails) && (
            <div
              className="absolute top-0 left-full ml-2 w-[955px] h-[300px] bg-white dark:bg-gray-900 p-4 flex justify-between z-30"
              onMouseEnter={handleMouseEnterDetails}
              onMouseLeave={handleMouseLeaveDetails}
            >
              {categories[hoveredCategory]?.details.map((detail, idx) => (
                <div key={idx} className="flex w-full justify-between">
                  {/* Phần tử bên trái */}
                  <div className="flex-1 min-w-[100px] space-y-4">
                    <div className="font-semibold text-gray-600 dark:text-gray-300">
                      {detail.subcategory}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {detail.items.map((brandColumn, columnIndex) => (
                        <div key={columnIndex} className="list-none list-inside space-y-2  ">
                          {brandColumn.map((item, id) => (
                            <div
                              key={id}
                              className="text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                              onClick={() => handleBrandClick(item.navigate)}
                            >
                              <div className="font-medium text-sm hover:text-primary">
                                {item.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phần tử bên phải */}
                  <div className="flex-1 min-w-[100px] space-y-4 ml-auto w-full max-w-full overflow-hidden">
                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-4">
                      Sản phẩm nổi bật
                    </h3>
                    <div className="grid gap-4">
                      {detail.hotGadgets?.map((gadget, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded"
                          onClick={() => handleBrandClick(gadget.navigate)}
                        >
                          <div className="font-medium text-sm hover:text-primary truncate">
                            {gadget.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>


          )}


        </div>
        {/* Slider Container */}
        <div className="flex-grow sm:pb-0 border-1 border-gray-500 rounded-lg h-[300px] w-[700px] relative z-10">
          <Slider {...settings}>
            {ImageList.map((data) => (
              <div key={data.id}>
                <div className="grid grid-cols-1 sm:grid-cols-2 ">
                  {/* text content section */}
                  <div className="flex flex-col justify-center gap-4 sm:pt-0 text-center sm:text-left order-2 sm:order-1 relative z-10">
                    <h1
                      data-aos="zoom-out"
                      data-aos-duration="500"
                      data-aos-once="true"
                      className="text-5xl sm:text-1xl lg:text-2xl font-bold"
                    >
                      {data.title}
                    </h1>
                    <p
                      data-aos="fade-up"
                      data-aos-duration="500"
                      data-aos-delay="100"
                      className="text-sm"
                    >
                      {data.description}
                    </p>
                    <div
                      data-aos="fade-up"
                      data-aos-duration="500"
                      data-aos-delay="300"
                    >
                    </div>
                  </div>
                   {/* image section */}
                   <div className="order-1 sm:order-2">
                    <div
                      data-aos="zoom-in"
                      data-aos-once="true"
                      className="relative z-10"
                    >
                      <img
                        src={data.img}
                        alt={data.title}
                        className="w-[300px] h-[300px] sm:h-[300px] sm:w-[200px] sm:scale-105 lg:scale -120 object-contain mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Right Sidebar (Framed Promotional Images) */}
        <div className="h-[300px] w-[200px] bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 relative z-10">
          <div className="space-y-4">
            {promoImages.map((img, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg p-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Promo ${index + 1}`}
                  className="rounded-lg object-cover w-full h-[80px]  hover:scale-105 transition-transform duration-300"
                />
              </div>

            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
