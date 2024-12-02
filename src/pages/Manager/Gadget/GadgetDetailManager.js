import React, { useEffect, useState, useRef } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { ArrowBack } from '@mui/icons-material';
import StarRatings from 'react-star-ratings';
import { Star, Lock, Unlock } from 'lucide-react';  // Replace Switch import
import user from "~/assets/R.png";

const GadgetDetailManager = () => {
    const location = useLocation();
    const { gadgetId } = location.state || {};
    const [gadget, setGadget] = useState(null);
    const [activeTab, setActiveTab] = useState('specifications');
    const navigate = useNavigate();

    const imgRef = useRef(null);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2; // Number of reviews per page
    const [actionLoading, setActionLoading] = useState({});
    const [sortByDate, setSortByDate] = useState('');
    const [sortByRating, setSortByRating] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [selectedReply, setSelectedReply] = useState(null);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(reviews.length / itemsPerPage);

    const getPaginationRange = () => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(start + maxVisible - 1, totalPages);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const handleChangePage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const fetchGadgetDetails = async () => {
        try {
            const response = await AxiosInterceptor.get(`/api/gadgets/${gadgetId}`);
            setGadget(response.data);
        } catch (error) {
            console.error("Error fetching gadget details:", error);
            toast.error("Failed to fetch gadget details");
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await AxiosInterceptor.get(`/api/reviews/gadget/${gadgetId}/manager`, {
                params: {
                    Page: 1,
                    PageSize: 100,
                    SortByDate: sortByDate,
                    SortByRating: sortByRating,
                },
            });
            setReviews(response.data.items);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleReview = async (reviewId, status) => {
        try {
            setActionLoading(prev => ({ ...prev, [`review-${reviewId}`]: true }));
            const endpoint = status === 'Active'
                ? `/api/review/${reviewId}/deactivate`
                : `/api/review/${reviewId}/activate`;

            await AxiosInterceptor.put(endpoint);
            await fetchReviews();
            toast.success("Thay đổi trạng thái thành công");
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error toggling review status:", error);
            toast.error("Failed to update review status");
        } finally {
            setActionLoading(prev => ({ ...prev, [`review-${reviewId}`]: false }));
        }
    };

    const handleToggleReply = async (replyId, status) => {
        try {
            setActionLoading(prev => ({ ...prev, [`reply-${replyId}`]: true }));
            const endpoint = status === 'Active'
                ? `/api/seller-replies/${replyId}/deactivate`
                : `/api/seller-replies/${replyId}/activate`;

            await AxiosInterceptor.put(endpoint);
            await fetchReviews();
            toast.success("Thay đổi trạng thái thành công");
            setIsReplyModalOpen(false);
        } catch (error) {
            console.error("Error toggling reply status:", error);
            toast.error("Failed to update reply status");
        } finally {
            setActionLoading(prev => ({ ...prev, [`reply-${replyId}`]: false }));
        }
    };

    const openConfirmModal = (review) => {
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const openConfirmReplyModal = (reply) => {
        setSelectedReply(reply);
        setIsReplyModalOpen(true);
    };

    useEffect(() => {
        fetchGadgetDetails();
    }, []);

    useEffect(() => {
        if (activeTab === 'manageReview') {
            fetchReviews();
        }
    }, [gadgetId, activeTab, sortByDate, sortByRating]);

    const handleImageClick = (imageUrl) => {
        if (imgRef.current) {
            imgRef.current.src = imageUrl;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!gadget) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
                <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
            <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Loading...
            </span>
        </div>
    }


    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ToastContainer />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="relative pt-5">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-black cursor-pointer"
                    >
                        <ArrowBack />
                    </button>
                </div>
                <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">{gadget.name}</h1>
                    </div>
                    <div className="mb-6 flex justify-center items-center">
                        <img ref={imgRef} src={gadget.thumbnailUrl} alt={gadget.name} className="w-full max-w-md h-90 object-contain rounded-lg border-none" />
                    </div>
                    <div className="flex space-x-2 mb-6 overflow-x-auto">
                        {gadget.gadgetImages.map((image, index) => (
                            <img key={index} src={image.imageUrl} alt={`${gadget.name} - Image ${index + 1}`} width={100} height={100} className="rounded-md border border-gray-200 cursor-pointer" onClick={() => handleImageClick(image.imageUrl)} />
                        ))}
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex justify-center space-x-4 mb-6">
                            <button className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'specifications' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`} onClick={() => setActiveTab('specifications')}>
                                Thông số kỹ thuật
                            </button>
                            <button className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'review' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`} onClick={() => setActiveTab('review')}>
                                Bài viết đánh giá
                            </button>
                            <button className={`w-64 px-4 py-2 rounded-lg font-semibold text-base border border-blue-300 ${activeTab === 'manageReview' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'text-gray-600 border-gray-300'}`} onClick={() => setActiveTab('manageReview')}>
                                Quản lý đánh giá
                            </button>
                        </div>
                        {activeTab === 'specifications' && (
                            <div className="space-y-4">
                                {gadget.specificationValues && (() => {
                                    // Group specifications by their keys
                                    const groupedSpecs = gadget.specificationValues.reduce((acc, spec) => {
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
                                {gadget.gadgetDescriptions.sort((a, b) => a.index - b.index).map((desc) => {
                                    const isImageUrl = desc.value.startsWith("http") && (desc.value.endsWith(".jpg") || desc.value.endsWith(".jpeg") || desc.value.endsWith(".png"));
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
                        {activeTab === 'manageReview' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="mb-4">
                                        <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700 mr-3">Sắp xếp theo ngày</label>
                                        <select
                                            id="sort-by-date"
                                            value={sortByDate}
                                            onChange={(e) => setSortByDate(e.target.value)}
                                            className="w-full sm:w-[180px] px-1 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                                        >
                                            <option value="">---</option>
                                            <option value="DESC">Mới</option>
                                            <option value="ASC">Cũ</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="sort-by-rating" className="text-sm font-medium text-gray-700 mr-3">Đánh giá theo</label>
                                        <select
                                            id="sort-by-rating"
                                            value={sortByRating}
                                            onChange={(e) => setSortByRating(e.target.value)}
                                            className="w-full sm:w-[180px] px-1 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                                        >
                                            <option value="">---</option>
                                            <option value="DESC">Cao nhất</option>
                                            <option value="ASC">Thấp nhất</option>
                                        </select>
                                    </div>
                                </div>
                                {currentReviews.length > 0 ? (
                                    <>
                                        {currentReviews.map((review) => (
                                            <div key={review.id} className="mb-4 p-4 border rounded-lg">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={review.customer?.avatarUrl || user}
                                                            alt={review.customer?.fullName || 'User'}
                                                            className="w-10 h-10 rounded-full mr-2"
                                                        />
                                                        <div>
                                                            <p className="font-semibold">{review.customer?.fullName || 'Anonymous'}</p>
                                                            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => openConfirmModal(review)}
                                                            disabled={actionLoading[`review-${review.id}`]}
                                                            className="p-2 hover:bg-gray-100 rounded-full"
                                                        >
                                                            {review.status === 'Active' ? (
                                                                <Unlock className="w-5 h-5 text-green-600" />
                                                            ) : (
                                                                <Lock className="w-5 h-5 text-red-600" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center mb-2">
                                                    <span className="text-yellow-500">{'★'.repeat(review.rating || 0)}</span>
                                                    <span className="text-gray-400">{'★'.repeat(5 - (review.rating || 0))}</span>
                                                </div>
                                                <div className="mt-2 flex items-center text-gray-700">
                                                    <p>{review.content || 'No content'}</p>
                                                    {review.isUpdated && (
                                                        <p className="ml-2 text-gray-400 text-xs">Đã chỉnh sửa</p>
                                                    )}
                                                </div>
                                                {review.sellerReply && (
                                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-md font-semibold text-primary mb-2">Phản hồi từ người bán</h4>
                                                            <div className="flex items-center">
                                                                <button
                                                                    onClick={() => openConfirmReplyModal(review.sellerReply)}
                                                                    disabled={actionLoading[`reply-${review.sellerReply.id}`]}
                                                                    className="p-2 hover:bg-gray-100 rounded-full"
                                                                >
                                                                    {review.sellerReply.status === 'Active' ? (
                                                                        <Unlock className="w-5 h-5 text-green-600" />
                                                                    ) : (
                                                                        <Lock className="w-5 h-5 text-red-600" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
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
                                        ))}

                                        {/* Pagination controls */}
                                        <div className="flex justify-center mt-6 space-x-2">
                                            {getPaginationRange().map((pageNumber) => (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handleChangePage(pageNumber)}
                                                    className={`px-4 py-2 rounded-md ${pageNumber === currentPage
                                                            ? 'bg-primary/80 text-white'
                                                            : 'bg-gray-200 text-gray-700'
                                                        }`}
                                                    disabled={loading}
                                                >
                                                    {pageNumber}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p>Không có đánh giá.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isModalOpen && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận thay đổi trạng thái</h3>
                        <p className="mb-4">
                            Bạn có chắc chắn muốn {selectedReview.status === 'Active' ? 'khóa' : 'mở khóa'} đánh giá này?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-secondary/85"
                                onClick={() => handleToggleReview(selectedReview.id, selectedReview.status)}
                                disabled={actionLoading[`review-${selectedReview.id}`]}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isReplyModalOpen && selectedReply && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Xác nhận thay đổi trạng thái</h3>
                        <p className="mb-4">
                            Bạn có chắc chắn muốn {selectedReply.status === 'Active' ? 'khóa' : 'mở khóa'} phản hồi này?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onClick={() => setIsReplyModalOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-secondary/85"
                                onClick={() => handleToggleReply(selectedReply.id, selectedReply.status)}
                                disabled={actionLoading[`reply-${selectedReply.id}`]}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GadgetDetailManager;