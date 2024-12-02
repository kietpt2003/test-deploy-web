import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '~/context/auth/useAuth';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { toast, ToastContainer } from 'react-toastify';
import { Breadcrumb, Modal } from 'antd';
import { CheckCircleOutlined, HomeFilled, InfoCircleFilled, LoadingOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import slugify from '~/ultis/config';
import StarRatings from 'react-star-ratings';
import { Star } from 'lucide-react';
import GadgetHistoryDetail from '../Gadgets/GadgetHistoryDetail';
import GadgetSuggest from '../Gadgets/GadgetSuggest';
import users from "~/assets/R.png"
import { CART_ACTIONS } from '~/constants/cartEvents';

const OrderConfirmation = ({ product, quantity, onCancel }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const navigate = useNavigate();
    const popupRef = useRef(null);
    const unitPrice = product.discountPrice || product.price;
    const totalPrice = unitPrice * quantity;

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            // If the click is outside the popup, call onCancel
            onCancel();
        }
    };

    useEffect(() => {
        // Add event listener for clicks
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Clean up the event listener
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleConfirmOrder = async () => {
        setIsProcessing(true);
        try {
            const response = await AxiosInterceptor.post("/api/order/now", {
                gadgetId: product.id,
                quantity,
            });
            setOrderSuccess(true);
        } catch (error) {
            console.error("Error placing order:", error);
            if (error.response && error.response.data && error.response.data.reasons) {
                const reasons = error.response.data.reasons;

                // Display the message from the first reason
                if (reasons.length > 0) {
                    const reasonMessage = reasons[0].message;
                    onCancel(); // Close the confirmation modal first
                    setTimeout(() => {
                        toast.error(reasonMessage, {
                            position: "top-right",
                            autoClose: 3000,
                            style: { zIndex: 9999 }
                        });
                    }, 100);
                } else {
                    onCancel(); // Close the confirmation modal first
                    setTimeout(() => {
                        toast.error("Đặt hàng thất bại. Vui lòng thử lại.", {
                            position: "top-right",
                            autoClose: 3000,
                            style: { zIndex: 9999 }
                        });
                    }, 100);
                }
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                <div ref={popupRef} className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                    <CheckCircleOutlined className="text-green-500 text-8xl mb-6" />
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Đặt hàng thành công!</h2>
                    <p className="text-gray-600 mb-8">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full px-6 py-3 bg-primary/80 hover:bg-secondary/90 text-white rounded-lg transition duration-200 font-semibold"
                        >
                            Về trang Chủ
                        </button>
                        <button
                            onClick={() => navigate('/orderHistory')}
                            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200 font-semibold"
                        >
                            Xem Lịch Sử Đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-xl w-full">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    <ShoppingCartOutlined className="text-5xl text-primary" /> Xác nhận đơn hàng
                </h2>

                <div className="mb-6 border-b pb-4">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center flex-grow mr-4">
                            <img src={product.thumbnailUrl} alt={product.name} className="w-12 h-12 object-contain mr-2" />
                            <span className="text-gray-600">{product.name} x {quantity}</span>
                        </div>
                        <span className="font-medium text-gray-800 ml-4">
                            {unitPrice.toLocaleString()}₫
                        </span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xl font-bold mb-6">
                    <span>Tổng cộng:</span>
                    <span className="text-red-600">{totalPrice.toLocaleString()}₫</span>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirmOrder}
                        disabled={isProcessing}
                        className={`px-6 py-2 bg-primary/80 hover:bg-secondary/90 text-white rounded-lg transition duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? <LoadingOutlined /> : 'Thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// const ProfileWarningModal = ({ isOpen, onClose }) => {
//     const navigate = useNavigate();

//     return (
//         <Modal
//             title="Thông tin cá nhân chưa đầy đủ"
//             open={isOpen}
//             onCancel={onClose}
//             footer={[
//                 <button
//                     key="profile"
//                     onClick={() => navigate('/profile')}
//                     className="px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-secondary/90"
//                 >
//                     Cập nhật thông tin
//                 </button>
//             ]}
//         >
//             <p>Vui lòng cập nhật địa chỉ và số điện thoại trong hồ sơ của bạn trước khi tiếp tục mua hàng.</p>
//         </Modal>
//     );
// };

const DetailGadgetPage = () => {
    const { isAuthenticated } = useAuth();
    const apiBase = process.env.NODE_ENV === "development"
        ? process.env.REACT_APP_DEV_API + "/"
        : process.env.REACT_APP_PRO_API + "/";
    // const { id } = useParams();
    const location = useLocation();
    const { productId } = location.state || {};
    const [product, setProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('specifications');
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showProfileWarning, setShowProfileWarning] = useState(false);
    const navigate = useNavigate();
    // const {user} = useAuth()
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUserData = async () => {
            if (!isAuthenticated) {
                return;
              }
            try {
                const response = await AxiosInterceptor.get('/api/users/current');
                setUser(response.data.customer);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const apiClient = isAuthenticated ? AxiosInterceptor : axios;
        const fetchProduct = async () => {
            try {
                const response = await apiClient(`${apiBase}api/gadgets/${productId}`);
                setProduct(response.data);
                setPrice(response.price);
            } catch (error) {
                console.error("Error fetching product details:", error);
                setError("Failed to fetch product details.");
            }
        };

        const fetchReviews = async () => {
            if (!isAuthenticated) {
                return;
              }
            try {
                const response = await AxiosInterceptor.get(`/api/reviews/gadget/${productId}`);
                setReviews(response.data.items.slice(0, 2)); // Show only the first 2 reviews             
            } catch (error) {
                toast.error('Failed to fetch reviews');
            }
        };

        fetchProduct();
        fetchReviews();
    }, [productId, isAuthenticated, apiBase]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [productId]);  // This will run whenever productId changes

    const imgRef = useRef(null); // Tạo ref để tham chiếu đến hình ảnh chính

    const handleImageClick = (imageUrl) => {
        if (imgRef.current) {
            imgRef.current.src = imageUrl; // Cập nhật src của hình ảnh chính
        }
    };
    if (error) return <div>{error}</div>;
    if (!product) return <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
            <div className="h-4 w-4 bg-white rounded-full"></div>
        </div>
        <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Loading...
        </span>
    </div>;

    const handleQuantityChange = (type) => {
        setQuantity(prev => type === 'increment' ? prev + 1 : Math.max(1, prev - 1));
    };

    const handleShowMoreReviews = () => {
        navigate(`/gadget/detail/${slugify(product.name)}/reviews`, {
            state: {
                productId: product.id,
            },
        });
    };


    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        try {
            await AxiosInterceptor.post("/api/cart", {
                gadgetId: productId,
                quantity,
            });

            window.dispatchEvent(new CustomEvent('cartUpdate', {
                detail: { type: CART_ACTIONS.ADD }
            }));

            toast.success("Thêm sản phẩm thành công");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.reasons) {
                const reasons = error.response.data.reasons;
                if (reasons.length > 0) {
                    const reasonMessage = reasons[0].message;
                    toast.error(reasonMessage);
                } else {
                    toast.error("Thêm sản phẩm thất bại, vui lòng thử lại");
                }
            }
        }
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (!user?.address || !user?.phoneNumber) {
            setIsOpen(true);
            return;
        }
        setShowConfirmation(true);
    };

    const onClose = () => {
        setIsOpen(false);
    };

    const handleCancelOrder = () => {
        setShowConfirmation(false);
    };

    const totalPrice = product.price * quantity;
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
            <Breadcrumb
                className="w-full"
                items={[
                    {
                        title: (
                            <p
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    navigate("/");
                                }}
                            >
                                Trang chủ
                            </p>
                        ),
                    },
                    {
                        title: (
                            <p
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    navigate(`/gadgets/${slugify(product.category?.name)}`, {
                                        state: {
                                            categoryId: product.category.id,
                                        },
                                    });
                                }}
                            >
                                {product.category?.name}
                            </p>
                        ),
                    },
                    {
                        title: (
                            <p
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    navigate(`/gadgets/${slugify(product.category?.name)}/${slugify(product.brand?.name)}`, {
                                        state: {
                                            categoryId: product.category.id,
                                            brandId: product.brand.id,
                                        },
                                    });
                                }}
                            >
                                {product.brand?.name}
                            </p>
                        ),
                    },
                    {
                        title: <p>{product.name}</p>,
                    },
                ]}
            />

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 9999 }}
            />
            <Modal
                title="Thông tin cá nhân chưa đầy đủ"
                open={isOpen}
                onCancel={onClose}
                footer={[
                    <button
                        key="profile"
                        onClick={() => navigate('/profile')}
                        className="px-4 py-2 bg-primary/80 text-white rounded-lg hover:bg-secondary/90"
                    >
                        Cập nhật thông tin
                    </button>
                ]}
            >
                <p>Vui lòng cập nhật địa chỉ và số điện thoại trong hồ sơ của bạn trước khi tiếp tục mua hàng.</p>
            </Modal>
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column */}
                <div className="lg:w-2/3">
                    <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

                    <div className="mb-6 flex justify-center items-center">
                        <div className="mb-6 flex justify-center items-center">
                            <img
                                ref={imgRef}
                                src={product.thumbnailUrl}
                                alt={product.name}
                                className="w-full max-w-md h-90 object-contain rounded-lg border-none"
                            />
                        </div>

                    </div>

                    <div className="flex space-x-2 mb-6 overflow-x-auto">
                        {product.gadgetImages && product.gadgetImages.map((image, index) => (
                            <img
                                key={index}
                                src={image.imageUrl}
                                alt={`${product.name} - Image ${index + 1}`}
                                width={100}
                                height={100}
                                className="rounded-md border border-gray-200 cursor-pointer"
                                onClick={() => handleImageClick(image.imageUrl)}
                            />
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-center space-x-4 mb-6">
                            <button
                                className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'specifications' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`}
                                onClick={() => setActiveTab('specifications')}
                            >
                                Thông số kỹ thuật
                            </button>
                            <button
                                className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'review' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`}
                                onClick={() => setActiveTab('review')}
                            >
                                Bài viết đánh giá
                            </button>
                        </div>
                        {activeTab === 'specifications' && (
                            <div className="space-y-4">
                                {product.specificationValues && (() => {
                                    // Group specifications by their keys
                                    const groupedSpecs = product.specificationValues.reduce((acc, spec) => {
                                        const keyName = spec.specificationKey?.name || 'N/A';
                                        if (!acc[keyName]) {
                                            acc[keyName] = [];
                                        }
                                        acc[keyName].push(spec);
                                        return acc;
                                    }, {});

                                    // Render grouped specifications
                                    return Object.entries(groupedSpecs).map(([keyName, specs]) => (
                                        <div key={keyName}
                                            className="flex items-start text-sm border-b border-gray-200 py-3 last:border-0"
                                        >
                                            <div className="w-1/3 text-gray-600">
                                                {keyName}
                                            </div>
                                            <div className="w-2/3 font-medium text-gray-900">
                                                {specs.map((spec, index) => (
                                                    <div key={spec.id}>
                                                        {spec.value || 'N/A'} {spec.specificationUnit?.name || ''}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>

                        )}
                        {activeTab === 'review' && (
                            <div className="space-y-4">
                                {product.gadgetDescriptions &&
                                    product.gadgetDescriptions
                                        .sort((a, b) => a.index - b.index)
                                        .map((desc) => {
                                            const isImageUrl = desc.value.startsWith("http") &&
                                                (desc.value.endsWith(".jpg") ||
                                                    desc.value.endsWith(".jpeg") ||
                                                    desc.value.endsWith(".png"));

                                            return (
                                                <div key={desc.id} className={desc.type === 'BoldText' ? ' font-bold' : ' text-sx'}>
                                                    {isImageUrl ? (
                                                        <img src={desc.value} alt="Gadget" className="max-w-full h-auto" />
                                                    ) : (
                                                        <div>{desc.value}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                            </div>
                        )}
                    </div>

                    <div className="mt-7 ">
                        <h2 className="text-sm font-bold mb-4 text-center">Đánh giá sản phẩm {product.name}</h2>
                        {reviews.length === 0 ? (
                            <p></p>
                        ) : (
                            <div className="mb-6 w-full flex ">
                                <div className="w-full max-w-md">
                                    {/* Average rating with stars */}
                                    <div className="flex items-center mb-4 justify-center">
                                        <span className="text-xl font-bold text-orange-500">{averageRating}</span>
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
                                                        className="h-3 bg-orange-500 rounded"
                                                        style={{ width: `${Math.floor(starPercentages[5 - index - 1])}%` }}
                                                    ></div>
                                                </div>
                                                <span className="w-12 text-right">{Math.floor(starPercentages[5 - index - 1])}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-8">

                            {reviews.length > 0 ? (
                                reviews
                                    .filter(review => review.status === 'Active')
                                    .map((review) => (
                                        <div key={review.id} className="mb-6 p-6 border border-gray-200 rounded-lg shadow-sm">
                                            <div className="flex items-center mb-4">
                                                <img
                                                    src={review.customer.avatarUrl || users}
                                                    alt={review.customer.fullName}
                                                    className="w-12 h-12 rounded-full mr-4"
                                                />
                                                <div>
                                                    <p className="font-semibold text-base">{review.customer.fullName}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center mb-4">
                                                <span className="text-yellow-500 text-lg">{'★'.repeat(review.rating)}</span>
                                                <span className="text-gray-300 text-lg">{'★'.repeat(5 - review.rating)}</span>
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
                                <div className="text-center">
                                    <p className="text-sm">Nếu đã mua sản phẩm này tại TechGadget. Hãy đánh giá ngay để giúp hàng ngàn người chọn mua hàng tốt nhất bạn nhé!</p>
                                </div>
                            )}
                            {reviews.length > 1 && (
                                <button onClick={handleShowMoreReviews} className="text-primary mt-4 text-center">
                                    Xem tất cả
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:w-1/3">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center py-4">
                            {product.discountPercentage > 0 ? (
                                <div className="flex flex-col w-full">
                                    <div className="flex items-center">
                                        <div className="text-3xl font-bold text-red-600">
                                            {product.discountPrice.toLocaleString()}₫
                                        </div>
                                        <span className="line-through text-gray-500 ml-4">
                                            {product.price.toLocaleString()}₫
                                        </span>
                                        <div className="ml-auto text-sm font-bold px-4 py-2 bg-red-100 text-red-600 rounded-full">
                                            -{product.discountPercentage}%
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Ưu đãi đến: {formatDate(product.discountExpiredDate)}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-800 font-semibold text-3xl">
                                    {product.price.toLocaleString()}₫
                                </div>
                            )}
                        </div>
                        {product.status === "Inactive" ? (
                            <div className="relative">
                                <div className="absolute top-0 right-0 mt-2  bg-red-500 text-white text-sm font-bold py-1 px-2 rounded-full shadow-lg">
                                    Sản phẩm đã bị khóa
                                </div>
                            </div>
                        ) : product.isForSale === false && (
                            <div className="relative">
                                <div className="absolute top-0 right-0 mt-2  bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg">
                                    Ngừng bán
                                </div>
                            </div>
                        )}
                        <div className={`space-y-2 mb-6 ${product.isForSale === false ? 'opacity-50' : ''}`}>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="text-gray-600">Số lượng:</div>
                                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                                    <button
                                        className="px-2 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
                                        onClick={() => handleQuantityChange('decrement')}
                                        disabled={product.isForSale === false}
                                    >
                                        -
                                    </button>
                                    <span className="text-lg font-semibold px-2">{quantity}</span>
                                    <button
                                        className="px-2 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200"
                                        onClick={() => handleQuantityChange('increment')}
                                        disabled={product.isForSale === false}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <button
                                className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-200"
                                onClick={handleAddToCart}
                                disabled={product.isForSale === false}
                            >
                                Thêm vào giỏ hàng
                            </button>
                            <button
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
                                onClick={handleBuyNow}
                                disabled={product.isForSale === false}
                            >
                                Mua ngay
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg font-semibold">Thông tin người bán</h2>
                            <button
                                onClick={() => navigate(`/seller-page/${slugify(product.seller?.shopName)}`, {
                                    state: { sellerId: product.seller?.id },
                                })}
                                className="px-4 py-2 bg-primary/80 text-white font-semibold rounded-lg shadow-md hover:bg-primary transition duration-200"
                            >
                                Xem Shop
                            </button>
                        </div>

                        <div className="flex">
                            <InfoCircleFilled />
                            <p className='p-2'>{product.seller?.shopName}</p>

                        </div>
                        <div className="flex">
                            <HomeFilled />
                            <p className="p-2">{product.seller?.shopAddress}</p>
                        </div>
                        <div className="flex">

                            <h2 className="text-lg font-semibold mt-4 ">Thương hiệu</h2>
                            {product.brand?.logoUrl && (
                                <img src={product.brand.logoUrl} alt={product.brand.name || 'Brand Logo'} className="object-contain w-16 h-16 max-h-20 ml-5" />
                            )}
                        </div>

                    </div>
                    {isAuthenticated && <GadgetHistoryDetail />}

                </div>
            </div>

            {/* Reviews */}
            {isAuthenticated && <GadgetSuggest />}

            {showConfirmation && (
                <OrderConfirmation
                    product={product}
                    quantity={quantity}
                    totalPrice={totalPrice}
                    onCancel={handleCancelOrder}
                />
            )}
            {/* <ProfileWarningModal 
                isOpen={showProfileWarning}
                onClose={() => setShowProfileWarning(false)}
            /> */}
        </div>

    );
};

export default DetailGadgetPage;