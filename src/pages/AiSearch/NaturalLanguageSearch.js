import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Search, ChevronLeft, ChevronRight, Mic, MicOff, AudioLines } from 'lucide-react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import GadgetSearchHistory from './GadgetSearchHistory';
import Logo from "~/assets/logo.png";
import { useNavigate } from 'react-router-dom';
import slugify from '~/ultis/config';
import { CiHeart } from 'react-icons/ci';
import { toast, ToastContainer } from 'react-toastify';
import { LoadingOutlined, SendOutlined } from '@ant-design/icons';
import { FaCircle, FaDotCircle } from 'react-icons/fa';
import axios from 'axios';

const NaturalLanguageSearch = () => {
    const [searchText, setSearchText] = useState('');
    const [gadgets, setGadgets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGadget, setSelectedGadget] = useState(null);
    const itemsPerPage = 8;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Change initial state to false
    const [sellers, setSellers] = useState([]);
    const [resultType, setResultType] = useState('gadget');
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [reviewData, setReviewData] = useState({});
    const [userLocation, setUserLocation] = useState(null);
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setSearchText(transcript);

            // Clear any existing timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Set new timeout to trigger search after 1.5 seconds of no new speech
            const timeout = setTimeout(() => {
                if (transcript.trim() !== '') {
                    handleSearch();
                }
            }, 1500);

            setSearchTimeout(timeout);
        }

        // Cleanup timeout on component unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [transcript]);

    const toggleListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
            setIsListening(false);
        } else {
            resetTranscript();
            SpeechRecognition.startListening({ continuous: true, language: 'vi-VN' });
            setIsListening(true);
        }
    };
//khoảng cách 
    const getGeocode = async (address) => {
        try {
            const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
                params: {
                    access_token: 'pk.eyJ1IjoidGhuZzMxMiIsImEiOiJjbTN5ZjMyODcxZ2JjMmpzN3Z6M3M0cmRyIn0.ZG2ETG3QESh3_eVm-MiUFA',
                    country: 'VN'
                }
            });
            if (response.data.features.length > 0) {
                return {
                    latitude: response.data.features[0].center[1],
                    longitude: response.data.features[0].center[0]
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return null;
    };


    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const SPEEDS = {
        car: 60, // km/h
    };

    const calculateTravelTime = (distance, speed) => {
        if (!distance || !speed) return null; // Kiểm tra dữ liệu đầu vào
        return distance / speed; // Thời gian tính bằng giờ
    };

    const formatTravelTime = (hours) => {
        if (!hours) return 'Không thể tính thời gian';

        const minutes = Math.round(hours * 60);
        if (minutes < 60) {
            return `${minutes} phút`;
        } else {
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return `${h} giờ ${m > 0 ? `${m} phút` : ''}`;
        }
    };

    const getTravelTimes = (distance) => {
        if (!distance) return null;

        return {
            car: formatTravelTime(calculateTravelTime(distance, SPEEDS.car))
        };
    };
// hêt khoảng cách

    const fetchGadgets = async () => {
        setLoading(true);
        try {
            const response = await AxiosInterceptor.post('/api/natural-languages/search', {
                input: searchText,
            });
            setResultType(response.data.type);
            if (response.data.type === 'gadget') {
                // Fetch reviews for each gadget
                const reviewPromises = response.data.gadgets.map(gadget =>
                    AxiosInterceptor.get(`/api/reviews/summary/gadgets/${gadget.id}`)
                );
                const reviewResponses = await Promise.all(reviewPromises);

                const reviewMap = {};
                response.data.gadgets.forEach((gadget, index) => {
                    reviewMap[gadget.id] = reviewResponses[index].data;
                });
                setReviewData(reviewMap);
                setGadgets(response.data.gadgets);
                setSellers([]);
            } else {
                // Add distance calculation for sellers
                const sellersWithDistance = await Promise.all(response.data.sellers.map(async (seller) => {
                    const coordinates = await getGeocode(seller.shopAddress);
                    let distance = null;
                    if (coordinates && userLocation) {
                        distance = calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            coordinates.latitude,
                            coordinates.longitude
                        );
                    }
                    return { ...seller, distance };
                }));
                setSellers(sellersWithDistance);
                setGadgets([]);
            }
        } catch (error) {
            console.error('Failed to fetch results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        // Stop speech recognition if it's active
        if (listening) {
            SpeechRecognition.stopListening();
            setIsListening(false);
            resetTranscript();
        }

        // If search text is empty, clear results
        if (!searchText || !searchText.trim()) {
            setGadgets([]);
            setSellers([]);
            setResultType('gadget');
            return;
        }

        setCurrentPage(1);
        await fetchGadgets();
    };

    const handlePageChange = (direction) => {
        setCurrentPage((prevPage) => prevPage + (direction === 'next' ? 1 : -1));
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const handleProductClick = (gadget) => {
        setSelectedGadget(gadget);
    };

    const handleConfirmNavigation = () => {
        if (selectedGadget) {
            navigate(`/gadget/detail/${slugify(selectedGadget.name)}`, {
                state: {
                    productId: selectedGadget.id,
                }
            });
        }
    };

    const handleCloseModal = () => {
        setSelectedGadget(null);
    };

    const handleSellerClick = (seller) => {
        setSelectedSeller(seller);
    };

    const handleConfirmSellerNavigation = () => {
        if (selectedSeller) {
            navigate(`/seller-page/${slugify(selectedSeller.shopName)}`, {
                state: {
                    sellerId: selectedSeller.id,
                }
            });
        }
    };

    const totalPages = Math.ceil(gadgets.length / itemsPerPage);
    const displayedGadgets = gadgets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const toggleFavorite = async (gadgetId, isFavorite) => {
        try {
            await AxiosInterceptor.post(`/api/favorite-gadgets/${gadgetId}`);
            setGadgets((prevProducts) =>
                prevProducts.map((product) =>
                    product.id === gadgetId ? { ...product, isFavorite: !isFavorite } : product
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
    return (
        <div className="flex h-screen relative z-0">
            <GadgetSearchHistory />
            <ToastContainer />
            <div className="flex flex-col flex-grow overflow-hiddden">
                {/* Product List Section */}
                <div className="flex-grow p-4">
                    <div className="flex items-center justify-between mb-4 border-b">
                        <div>
                            <button onClick={() => navigate("/")} className="font-bold text-2xl sm:text-3xl flex gap-2">
                                <img src={Logo} alt="Logo" className="w-10" />
                                Tech Gadget
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-center text-gray-500">Đang tải...</p>
                    ) : resultType === 'gadget' ? (
                        displayedGadgets.length > 0 ? (
                            <div className="container w-full max-w-screen-lg mx-auto grid grid-cols-4 gap-4 h-[400px] overflow-y-hiden">
                                {displayedGadgets.map((gadget) => (
                                    <div
                                        key={gadget.id}
                                        onClick={() => handleProductClick(gadget)}
                                        className="relative border-2 rounded-2xl shadow-sm flex flex-col justify-between transition-transform duration-200 transform hover:scale-105 hover:border-primary/50 h-[250px]">
                                        {gadget.discountPercentage > 0 && (
                                            <div className="absolute top-0 left-0 bg-red-600 text-white text-sm font-bold text-center py-1 px-2 rounded-tr-md rounded-b-md">
                                                Giảm {`${gadget.discountPercentage}%`}
                                            </div>
                                        )}
                                        {!gadget.isForSale && (
                                            <div className="absolute top-0 right-0 bg-gray-400 text-white text-sm font-bold text-center py-1 px-1 rounded-tr-md rounded-b-md">
                                                Ngừng bán
                                            </div>
                                        )}
                                        <div className="p-2 flex flex-col flex-grow">
                                            <img
                                                src={gadget.thumbnailUrl}
                                                alt={gadget.name}
                                                className="w-full h-32 object-contain mb-2 rounded"
                                            />
                                            <h3 className="font-semibold text-xs line-clamp-2">{gadget.name}</h3>
                                            <div className="flex py-4">
                                                {gadget.discountPercentage > 0 ? (
                                                    <>
                                                        <div className="text-red-500 font-semibold text-sm mr-2">
                                                            {gadget.discountPrice.toLocaleString()}₫
                                                        </div>
                                                        <span className="line-through text-gray-500 text-xs">
                                                            {gadget.price.toLocaleString()}₫
                                                        </span>
                                                    </>
                                                ) : (
                                                    <div className="text-gray-800 font-semibold text-sm">
                                                        {gadget.price.toLocaleString()}₫
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                        {/* <div className="flex items-center justify-between p-2"> */}
                                        <div className="absolute bottom-2 right-1 flex items-center justify-between w-full">
                                            {/* Add review display */}
                                            {reviewData[gadget.id] && reviewData[gadget.id].numOfReview > 0 ? (
                                                <div className="flex items-center text-xs text-gray-600 ml-3">
                                                    <span className="flex items-center">
                                                        <svg
                                                            className="w-4 h-4 text-yellow-400"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="ml-1">
                                                            {reviewData[gadget.id].avgReview} (
                                                            {reviewData[gadget.id].numOfReview})
                                                        </span>
                                                    </span>
                                                </div>
                                            ) : (
                                                // Placeholder to maintain spacing when no reviews exist
                                                <div className="w-16"></div>
                                            )}

                                            {/* Favorite Button */}
                                            <div className="flex items-center text-sm text-gray-500 ml-auto">
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
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mt-4">Không tìm thấy từ khóa, hãy thử tìm với từ khóa khác</p>
                        )
                    ) : (
                        sellers.length > 0 ? (
                            <div className="container w-full max-w-screen-lg h-[550px] mx-auto overflow-y-auto">
                                <div className="grid grid-cols-1 gap-4 p-4 cursor-pointer">
                                    {sellers.map((seller) => (
                                        <div key={seller.id}
                                            onClick={() => handleSellerClick(seller)}
                                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-bold text-lg text-primary/80">
                                                    {seller.shopName || "Chưa đặt tên shop"}
                                                </h3>
                                                <span className="text-sm px-3 py-1 bg-gray-100 rounded-full">
                                                    {seller.businessModel === 'Personal'
                                                        ? 'Cá nhân'
                                                        : seller.businessModel === 'BusinessHousehold'
                                                            ? 'Hộ kinh doanh'
                                                            : seller.businessModel === 'Company'
                                                                ? 'Công ty'
                                                                : ''}
                                                </span>

                                            </div>
                                            <div className="space-y-2 text-gray-600">
                                                <p className="flex items-center gap-2 ">
                                                    <span className="font-semibold ">Địa chỉ:</span>
                                                    <span className="text-gray-700">{seller.shopAddress}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold min-w-[100px]">Số điện thoại:</span>
                                                    <span className="text-gray-700">{seller.phoneNumber}</span>
                                                </p>

                                                {/* khoảng cách */}
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold min-w-[100px]">Khoảng cách:</span>
                                                    <div className="text-gray-700 flex ">
                                                        <span>
                                                            {seller.distance
                                                                ? `${seller.distance.toFixed(1)} km`
                                                                : 'Không thể tính khoảng cách'
                                                            }
                                                        </span>
                                                        {seller.distance && (
                                                            <span className="ml-3">
                                                                {getTravelTimes(seller.distance).car}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mt-4">Không tìm thấy cửa hàng nào phù hợp</p>
                        )
                    )}
                </div>

                {/* Pagination - only show for gadgets */}
                {resultType === 'gadget' && displayedGadgets.length > 0 && (
                    <div className="flex items-center justify-between p-1 bg-white border-t">
                        <button
                            onClick={() => handlePageChange('prev')}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-3 py-2  bg-gray-200 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" /> Trước
                        </button>

                        {/* <span className="text-gray-600">
                            Trang {currentPage} / {totalPages}
                        </span> */}

                        <button
                            onClick={() => handlePageChange('next')}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Kế tiếp <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Search Bar - Updated version */}
                <div className="sticky top-0 bg-white p-4">

                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder={listening ? "Đang nghe..." : "Nhập thông tin cần tìm hoặc nhấn mic để nói"}

                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={handleKeyPress}

                            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-primary/80"
                        />
                        {/* {listening && (
                                <div className="mt-2 text-sm text-gray-500 animate-pulse">
                                    Đang nghe...
                                </div>
                            )} */}
                        {browserSupportsSpeechRecognition && (
                            <button
                                onClick={toggleListening}
                                className={`ml-2 p-2 rounded-md hover:bg-gray-100 ${listening ? 'text-red-500' : 'text-gray-500'}`}
                                title={listening ? 'Dừng nhận diện giọng nói' : 'Bắt đầu nhận diện giọng nói'}
                            >
                                {listening ? <AudioLines className="animate-spin w-5 h-5" /> : <AudioLines className="w-5 h-5" />}
                            </button>
                        )}
                        <button
                            onClick={handleSearch}
                            className="ml-2 p-2 bg-primary-500 text-gray rounded-md hover:bg-primary-600"
                        >
                            {loading ? <LoadingOutlined className="w-5 h-5 text-primary/80" /> : <SendOutlined className="w-5 h-5 text-primary/80" />}
                        </button>
                    </div>

                </div>
            </div>
            {selectedGadget && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{ zIndex: 1000 }} onClick={handleCloseModal}>
                    <div className="bg-white p-6 rounded-md shadow-md" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Xác nhận</h2>
                        <p>Bạn có muốn đến trang chi tiết sản phẩm không?</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmNavigation}
                                className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary-600"
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {selectedSeller && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    style={{ zIndex: 1000 }}
                    onClick={() => setSelectedSeller(null)}>
                    <div className="bg-white p-6 rounded-md shadow-md" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Xác nhận</h2>
                        <p>Bạn có muốn đến trang chi tiết người bán không?</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setSelectedSeller(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmSellerNavigation}
                                className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary-600"
                            >
                                Đồng ý
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NaturalLanguageSearch;