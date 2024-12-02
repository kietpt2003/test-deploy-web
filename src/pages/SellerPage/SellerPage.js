import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { Heart, Store, Phone, MapPin, Tag, Search } from 'lucide-react';
import slugify from '~/ultis/config';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { CiHeart } from 'react-icons/ci';
import axios from 'axios';
import useAuth from '~/context/auth/useAuth';

const categoryIds = {
    laptop: "458d7752-e45e-444a-adf9-f7201c07acd1",
    headphones: "9f6ac480-e673-49ec-9bc0-7566cca80b86",
    speakers: "bb65a310-e28e-4226-a562-0b6ea27f4faa",
    phones: "ea4183e8-5a94-401c-865d-e000b5d2b72d"
};

const categoryNames = {
    laptop: "Laptop",
    headphones: "Tai nghe",
    speakers: "Loa",
    phones: "Điện thoại"
};

const businessModelTypes = {
    'Personal': 'Cá nhân',
    'BusinessHousehold': 'Hộ kinh doanh',
    'Company': 'Công ty'
};

const apiBaseUrl = process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_API
    : process.env.REACT_APP_PRO_API;

const SellerPage = () => {
    const location = useLocation();
    const { sellerId } = location.state || {};
    const [seller, setSeller] = useState(null);
    const [gadgetsByCategory, setGadgetsByCategory] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState('laptop'); // Changed from 'all'
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('Asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState({});
    const { isAuthenticated } = useAuth();
    const [statistics, setStatistics] = useState({
        total: 0,
        discounted: 0,
        notForSale: 0
    });

    const fetchSellerDetails = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/api/sellers/${sellerId}`);
            setSeller(response.data);
        } catch (error) {
            console.error("Error fetching seller details:", error);
            toast.error("Failed to fetch seller details");
        }
    };

    const fetchGadgets = async () => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams({
                ...(searchTerm && { Name: searchTerm }),
                SortOrder: sortOrder
            });

            const response = await axios.get(
                `${apiBaseUrl}/api/gadgets/categories/${categoryIds[activeCategory]}/sellers/${sellerId}?${queryParams}&Page=1&PageSize=100`
            );
            const reviewPromises = response.data.items.map(gadget =>
                AxiosInterceptor.get(`/api/reviews/summary/gadgets/${gadget.id}`)
            );
            const reviewResponses = await Promise.all(reviewPromises);

            const reviewMap = {};
            response.data.items.forEach((gadget, index) => {
                reviewMap[gadget.id] = reviewResponses[index].data;
            });
            setReviewData(reviewMap);

            const categoryGadgets = response.data.items;
            const stats = {
                total: categoryGadgets.length,
                discounted: categoryGadgets.filter(g => g.discountPercentage > 0).length,
                notForSale: categoryGadgets.filter(g => !g.isForSale).length
            };
            setStatistics(stats);

            setGadgetsByCategory(prev => ({
                ...prev,
                [activeCategory]: categoryGadgets
            }));

        } catch (error) {
            console.error("Error fetching gadgets:", error);
            toast.error("Failed to fetch gadgets");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleFavorite = async (gadgetId, isFavorite) => {

        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
            return;
        }
        try {
            await AxiosInterceptor.post(`/api/favorite-gadgets/${gadgetId}`);

            setGadgetsByCategory(prev => {
                const category = activeCategory;
                if (!prev[category]) return prev;

                return {
                    ...prev,
                    [category]: prev[category].map(gadget =>
                        gadget.id === gadgetId
                            ? { ...gadget, isFavorite: !isFavorite }
                            : gadget
                    )
                };
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

    const handleSearch = () => {
        setSearchTerm(searchInput);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGadgets = (gadgetsByCategory[activeCategory] || []).slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil((gadgetsByCategory[activeCategory] || []).length / itemsPerPage);

    const handleChangePage = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    useEffect(() => {
        fetchSellerDetails();
    }, [sellerId]);

    useEffect(() => {
        if (sellerId) {
            setCurrentPage(1);
            fetchGadgets();
        }
    }, [sellerId, searchTerm, sortOrder, activeCategory]);


    if (isLoading) return (
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
        <div className="container mx-auto px-4 py-8">
            <ToastContainer />

            {/* Seller Information Section */}
            <div className="bg-white rounded-xl shadow-lg mb-8 p-6">
                {seller ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-6 text-primary/80 border-b">{seller.shopName}</h1>
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="w-5 h-5 mr-3" />
                                    <span>{seller.shopAddress}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Store className="w-5 h-5 mr-3" />
                                    <span>{businessModelTypes[seller.businessModel] || seller.businessModel}</span>

                                    {(seller.businessModel === 'Company' || seller.businessModel === 'BusinessHousehold') && (
                                        <div className="flex items-center text-gray-600 ml-8">
                                            <Tag className="w-5 h-5 mr-3" /> <span> {seller.companyName}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="w-5 h-5 mr-3" />
                                    <span>{seller.phoneNumber}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="p-6 bg-primary/10 rounded-lg w-full">
                                <h3 className="text-lg font-semibold text-primary/80 mb-4 text-center">
                                    Thống kê cửa hàng
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary/80 mb-1">
                                            {statistics.total}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Sản phẩm {categoryNames[activeCategory]}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-primary/80 mb-1">
                                            {statistics.discounted}
                                        </p>
                                        <p className="text-sm text-gray-600">Đang giảm giá</p>
                                    </div>
                                    <div className="text-center col-span-2">
                                        <p className="text-2xl font-bold text-primary/80 mb-1">
                                            {statistics.notForSale}
                                        </p>
                                        <p className="text-sm text-gray-600">Ngừng bán</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">Loading seller information...</div>
                )}
            </div>

            {/* Product Categories Tabs */}
            <div className="mb-8">
                <div className="flex space-x-2 overflow-x-auto bg-primary/10 p-1 rounded-lg">
                    {Object.entries(categoryNames).map(([key, name]) => (
                        <button
                            key={key}
                            onClick={() => setActiveCategory(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeCategory === key
                                    ? 'bg-primary/80 text-white'
                                    : 'text-gray-600 hover:bg-primary/20'
                                }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modified Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative sm:max-w-xs">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
                {/* <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="Asc">Giá tăng dần</option>
                    <option value="Desc">Giá giảm dần</option>
                </select> */}
            </div>

            {/* Products Grid */}
            <div className="container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mx-auto px-2">
                {currentGadgets?.length > 0 ? (
                    currentGadgets.map((gadget) => (
                        <div
                            key={gadget.id}
                            className="relative border rounded-lg shadow-sm flex flex-col justify-between transition-transform duration-200 transform hover:scale-105 hover:border-primary/50"
                            onClick={() => navigate(`/gadget/detail/${slugify(gadget.name)}`, {
                                state: {
                                    productId: gadget.id,
                                }
                            })}
                        >
                            {/* Discount badge */}
                            {gadget.discountPercentage > 0 && (
                                <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold text-center py-0.5 px-1.5 rounded-tr-md rounded-b-md">
                                    Giảm {`${gadget.discountPercentage}%`}
                                </div>
                            )}
                            {/* Not for sale badge */}
                            {!gadget.isForSale && (
                                <div className="absolute top-0 right-0 bg-gray-400 text-white text-sm font-bold text-center py-1 px-1 rounded-tr-md rounded-b-md">
                                    Ngừng bán
                                </div>
                            )}
                            <div className="p-1.5">
                                <img
                                    src={gadget.thumbnailUrl}
                                    alt={gadget.name}
                                    className="w-full h-24 object-contain mb-1 rounded"
                                />
                                <h3 className="font-semibold text-xs line-clamp-2">{gadget.name}</h3>
                                <div className="flex py-2">
                                    {gadget.discountPercentage > 0 ? (
                                        <>
                                            <div className="text-red-500 font-semibold text-xs mr-1">
                                                {gadget.discountPrice.toLocaleString()}₫
                                            </div>
                                            <span className="line-through text-gray-500 text-xs">
                                                {gadget.price.toLocaleString()}₫
                                            </span>
                                        </>
                                    ) : (
                                        <div className="text-gray-800 font-semibold text-xs">
                                            {gadget.price.toLocaleString()}₫
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-2">
                                {/* Add review display */}
                                {reviewData[gadget.id] && reviewData[gadget.id].numOfReview > 0 ? (
                                    <div className="flex items-center text-xs text-gray-600">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            {reviewData[gadget.id].avgReview} ({reviewData[gadget.id].numOfReview})
                                        </span>
                                    </div>
                                ) : (
                                    // Placeholder to maintain spacing when no reviews exist
                                    <div className="w-16"></div>
                                )}
                                <div className="flex items-center text-sm text-gray-500">
                                    <span className="mr-2">Yêu thích</span>
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(gadget.id, gadget.isFavorite);
                                        }}
                                        className="cursor-pointer flex items-center"
                                    >
                                        {gadget.isFavorite ? (
                                            <svg
                                                className="h-8 w-5 text-red-500"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                            </svg>
                                        ) : (
                                            <CiHeart className="h-8 w-5 text-gray-500" />
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex justify-center items-center py-8">
                        <p className="text-gray-500 text-lg">Không có sản phẩm trong danh mục này</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
                {getPaginationRange().map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => handleChangePage(pageNumber)}
                        className={`px-4 py-2 rounded-md ${pageNumber === currentPage
                                ? 'bg-primary/80 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                        disabled={isLoading}
                    >
                        {pageNumber}
                    </button>
                ))}
            </div>

        </div>
    );
};

export default SellerPage;