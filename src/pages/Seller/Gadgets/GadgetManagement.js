import React, { useEffect, useState } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { toast, ToastContainer } from "react-toastify";
import { Eye, X, Percent, Plus, Box, ShoppingBag, Pause, Search, Edit, Loader, Calendar, List, TicketX, AlignLeft, OctagonX } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import slugify from '~/ultis/config';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',    // Changed order to put day first
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false      // Use 24-hour format
    });
};

const GadgetManagement = ({ categoryId }) => {
    const [gadgets, setGadgets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedGadget, setSelectedGadget] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loadingStates, setLoadingStates] = useState({}); // Add this state
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [gadgetToRemoveDiscount, setGadgetToRemoveDiscount] = useState(null);
    const [actionDropdownId, setActionDropdownId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gadgetToDelete, setGadgetToDelete] = useState(null);
    const [showSaleConfirmModal, setShowSaleConfirmModal] = useState(false);
    const [gadgetToToggleSale, setGadgetToToggleSale] = useState(null);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const formRef = React.useRef(null);

    const resetForm = () => {
        if (formRef.current) {
            formRef.current.reset();
            setFormattedDate('');
        }
    };

    const fetchGadgets = async () => {
        try {
            setIsLoading(true);
            let url = `/api/gadgets/category/${categoryId}/current-seller?Page=1&PageSize=100`;

            // Add search parameter if exists
            if (searchTerm) {
                url += `&Name=${encodeURIComponent(searchTerm)}`;
            }

            // Remove sort parameter logic

            const response = await AxiosInterceptor.get(url);
            setGadgets(response.data.items);
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to fetch products");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGadgets();
    }, [categoryId, searchTerm]); // Remove sortOrder from dependencies

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when category changes
        fetchGadgets();
    }, [categoryId]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGadgets = gadgets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(gadgets.length / itemsPerPage);
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
    const handleSaleToggle = (id, isForSale) => {
        setGadgetToToggleSale({ id, isForSale });
        setShowSaleConfirmModal(true);
    };

    const confirmSaleToggle = async () => {
        if (!gadgetToToggleSale) return;

        setLoadingStates(prev => ({ ...prev, [gadgetToToggleSale.id]: true }));
        try {
            const endpoint = gadgetToToggleSale.isForSale
                ? `/api/gadgets/${gadgetToToggleSale.id}/set-not-for-sale`
                : `/api/gadgets/${gadgetToToggleSale.id}/set-for-sale`;

            await AxiosInterceptor.put(endpoint);

            setGadgets(prevGadgets =>
                prevGadgets.map(gadget =>
                    gadget.id === gadgetToToggleSale.id ? { ...gadget, isForSale: !gadgetToToggleSale.isForSale } : gadget
                )
            );
            toast.success("Cập nhật trạng thái thành công");
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
        } finally {
            setLoadingStates(prev => ({ ...prev, [gadgetToToggleSale.id]: false }));
            setShowSaleConfirmModal(false);
            setGadgetToToggleSale(null);
        }
    };

    const handleChangePage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const showDiscountModal = (gadget) => {
        setSelectedGadget(gadget);
        setIsModalVisible(true);
        setIsEditing(gadget.discountPercentage > 0);

        if (gadget.discountPercentage > 0) {
            const discountDate = new Date(gadget.discountExpiredDate);
            setSelectedDate(discountDate);
            setFormattedDate(moment(discountDate).format('DD/MM/YYYY'));

            // Set timeout to ensure form is mounted before setting value
            setTimeout(() => {
                if (formRef.current) {
                    const input = formRef.current.querySelector('#discountPercentage');
                    if (input) {
                        input.value = gadget.discountPercentage;
                    }
                }
            }, 0);
        } else {
            setSelectedDate(null);
            setFormattedDate('');
            if (formRef.current) {
                formRef.current.reset();
            }
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedGadget(null);
        setIsEditing(false);
        setSelectedDate(null);
        resetForm();
    };

    const validateDiscount = (discountPercentage, discountExpiredDate) => {
        const now = moment();
        const expirationDate = moment(discountExpiredDate);

        if (!discountPercentage || discountPercentage < 1 || discountPercentage > 90) {
            toast.error("giảm giá phải từ 1 đến 90%");
            return false;
        }

        if (!expirationDate.isValid()) {
            toast.error("Vui lòng chọn ngày hết hạn");
            return false;
        }

        if (expirationDate.isBefore(now)) {
            toast.error("Vui lòng chọn thời gian hết hạn");
            return false;
        }

        return true;
    };

    const handleDateChange = (date) => {
        if (date) {
            setSelectedDate(date);
            setFormattedDate(moment(date).format('DD/MM/YYYY'));
        } else {
            setSelectedDate(null);
            setFormattedDate('');
        }
    };
    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);

        if (selectedDate.toDateString() === currentDate.toDateString()) {
            return selectedDate.getTime() >= currentDate.getTime();
        }
        return true;
    };
    const handleDiscountSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const discountPercentage = parseInt(event.target.discountPercentage.value, 10);

            if (!selectedDate) {
                toast.error("Vui lòng chọn ngày hết hạn");
                return;
            }

            const discountExpiredDate = moment(selectedDate).toISOString();

            if (!validateDiscount(discountPercentage, discountExpiredDate)) {
                return;
            }

            const formData = new FormData();
            formData.append("DiscountPercentage", discountPercentage);
            formData.append("DiscountExpiredDate", discountExpiredDate);

            await AxiosInterceptor.post(`/api/gadget-discount/${selectedGadget.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            toast.success(isEditing ? 'Cập nhật giảm giá thành công!' : 'Thêm giảm giá thành công!');

            await fetchGadgets();
            resetForm();
            setIsModalVisible(false);
            setSelectedGadget(null);
            setSelectedDate(null);
        } catch (error) {
            console.error("Error adding discount:", error);
            if (error.response?.data?.reasons?.[0]?.message) {
                toast.error(error.response.data.reasons[0].message);
            } else {
                toast.error("Failed to add discount. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOutsideClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            handleCancel();
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const executeSearch = () => {
        setSearchTerm(searchInput);
        setCurrentPage(1);
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            executeSearch();
        }
    };

    const handleRemoveDiscount = async (gadgetId) => {
        setGadgetToRemoveDiscount(gadgetId);
        setShowConfirmModal(true);
        setDropdownOpen(null);
    };

    const confirmRemoveDiscount = async () => {
        try {
            await AxiosInterceptor.put(`/api/gadget-discount/${gadgetToRemoveDiscount}`);
            await fetchGadgets();
            toast.success('Đã xóa giảm giá thành công!');
            setShowConfirmModal(false);
            setGadgetToRemoveDiscount(null);
        } catch (error) {
            console.error("Error removing discount:", error);
            if (error.response?.data?.reasons?.[0]?.message) {
                toast.error(error.response.data.reasons[0].message);
            } else {
                toast.error("Xóa giảm giá thất bại. Vui lòng thử lại.");
            }
        }
    };

    const handleDeleteGadget = async () => {
        try {
            await AxiosInterceptor.delete(`/api/gadgets/${gadgetToDelete}`);
            await fetchGadgets();
            toast.success('Xóa sản phẩm thành công!');
            setShowDeleteModal(false);
            setGadgetToDelete(null);
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

    const toggleActionDropdown = (gadgetId, e) => {
        e.stopPropagation();
        setActionDropdownId(actionDropdownId === gadgetId ? null : gadgetId);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('.dropdown-container')) {
                setDropdownOpen(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionDropdownId && !event.target.closest('td')) {
                setActionDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [actionDropdownId]);

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

    const handleUpdateGadget = (gadgetId) => {
        navigate(`/seller/gadgets/update/${gadgetId}`);
    };
    const translateStatus = (status) => {
        switch (status) {
            case "Active":
                return "Khả dụng";
            case "Inactive":
                return "Bị khóa";
            default:
                return status;
        }
    };
    const renderConfirmModal = () => {
        if (!showConfirmModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-semibold mb-4">Xác nhận xóa giảm giá</h3>
                    <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa giảm giá này không?</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setShowConfirmModal(false);
                                setGadgetToRemoveDiscount(null);
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmRemoveDiscount}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDeleteConfirmModal = () => {
        if (!showDeleteModal) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-semibold mb-4">Xác nhận xóa sản phẩm</h3>
                    <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setGadgetToDelete(null);
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDeleteGadget}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSaleConfirmModal = () => {
        if (!showSaleConfirmModal || !gadgetToToggleSale) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Xác nhận thay đổi trạng thái
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Bạn có chắc chắn muốn {gadgetToToggleSale.isForSale ? "ngừng bán" : "bán"} sản phẩm này?
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={() => {
                                setShowSaleConfirmModal(false);
                                setGadgetToToggleSale(null);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={confirmSaleToggle}
                            className="px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-md transition-colors duration-200"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Statistics Section with improved layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Tổng sản phẩm</p>
                            <p className="text-2xl font-bold text-primary/80">{gadgets.length}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Box className="w-6 h-6 text-primary/80" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đang giảm giá</p>
                            <p className="text-2xl font-bold text-primary/80">
                                {gadgets.filter(g => g.discountPercentage > 0).length}
                            </p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Percent className="w-6 h-6 text-primary/80" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Đang bán</p>
                            <p className="text-2xl font-bold text-primary/80">
                                {gadgets.filter(g => g.isForSale).length}
                            </p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <ShoppingBag className="w-6 h-6 text-primary/80" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ngừng bán</p>
                            <p className="text-2xl font-bold text-primary/80">
                                {gadgets.filter(g => !g.isForSale).length}
                            </p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Pause className="w-6 h-6 text-primary/80" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add search and sort controls */}
            <div className="mb-4 flex gap-4">
                <div className="relative flex-1 max-w-xs">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        onKeyPress={handleSearchKeyPress}
                        className="p-2 pr-10 border border-gray-300 rounded-md w-full focus:ring-primary/80 focus:border-primary/80"
                    />
                    <button
                        onClick={executeSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary/80"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <table className="min-w-full bg-white rounded-md shadow-lg">
                <thead>
                    <tr>
                        <th className="p-4 text-left font-medium">Hình ảnh </th>
                        <th className="p-4 text-left font-medium">Tên sản phẩm</th>
                        <th className="p-4 text-left font-medium">Giá</th>
                        <th className="p-4 text-left font-medium">Giảm giá</th>
                        <th className="p-4 text-left font-medium">Số lượng</th>
                        <th className="p-4 text-left font-medium">Trạng thái</th>
                        <th className="p-4 text-left font-medium">Đang bán</th>
                        <th className="p-4 text-left font-medium"></th>
                    </tr>
                </thead>
                <tbody>
                    {currentGadgets.map((gadget) => (
                        <tr key={gadget.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                                <div className="relative">
                                    <img
                                        src={gadget.thumbnailUrl}
                                        alt={gadget.name}
                                        className="w-32 h-32 object-contain rounded"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder-image.png';
                                        }}
                                    />
                                    <button
                                        onClick={() => handleUpdateGadget(gadget.id)}
                                        className="absolute top-0 left-0 bg-white p-1 rounded-full shadow-md border-x-2 mt-2"
                                        title="Cập nhật sản phẩm"
                                    >
                                        <Edit className="h-4 w-4 text-primary/100" />
                                    </button>
                                </div>
                            </td>
                            <td className="p-4">
                                {gadget.name.length > 20 ? `${gadget.name.slice(0, 20)}...` : gadget.name}
                            </td>
                            <td className="p-4">
                                {gadget.discountPercentage > 0 ? (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                            {`${gadget.discountPrice.toLocaleString()}₫`}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                                            {`${gadget.price.toLocaleString()}₫`}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-900 dark:text-white">
                                        {`${gadget.price.toLocaleString()}₫`}
                                    </span>
                                )}
                            </td>
                            <td className="p-4 relative">
                                {gadget.discountPercentage > 0 ? (
                                    <>
                                        <span className="text-sm text-blue-600 hover:text-blue-800">
                                            <span className="block text-sm text-gray-600">{`-${gadget.discountPercentage}%`}</span>
                                            {gadget.discountExpiredDate && (
                                                <span className="block text-xs text-gray-500">
                                                    {`HSD: ${formatDate(gadget.discountExpiredDate)}`}
                                                </span>
                                            )}
                                        </span>
                                        <div className="dropdown-container absolute top-10 right-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDropdownOpen(dropdownOpen === gadget.id ? null : gadget.id);
                                                }}
                                                className="bg-white p-1 rounded-full shadow-md border mt-2"
                                                title="Tùy chọn"
                                            >
                                                <List className="h-4 w-4 text-primary/100" />
                                            </button>
                                            {dropdownOpen === gadget.id && (
                                                <div className="absolute top-full mt-2 right-0 z-50">
                                                    <div className="py-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                showDiscountModal(gadget);
                                                                setDropdownOpen(null);
                                                            }}
                                                            className="bg-white p-1 rounded-full shadow-md border mt-2 "
                                                        >
                                                            <Edit className="h-4 w-4 text-primary/80" />

                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveDiscount(gadget.id);
                                                            }}
                                                            className="bg-white p-1 rounded-full shadow-md border mt-2"
                                                        >
                                                            <TicketX className="h-4 w-4 text-red-800" />

                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => showDiscountModal(gadget)}
                                        className="flex items-center justify-center w-8 h-8 rounded-full text-primary/80 hover:text-primary"
                                        disabled={isLoading}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                )}
                            </td>
                            <td className="p-4">{gadget.quantity}</td>
                            <td className="p-4">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full  ${gadget.gadgetStatus === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                    {translateStatus(gadget.gadgetStatus)}
                                </span>

                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    {loadingStates[gadget.id] ? (
                                        <Loader className="h-5 w-5 animate-spin text-primary" />
                                    ) : (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={gadget.isForSale}
                                                onChange={() => handleSaleToggle(gadget.id, gadget.isForSale)}
                                                disabled={loadingStates[gadget.id]}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 relative">
                                <button
                                    onClick={(e) => toggleActionDropdown(gadget.id, e)}
                                    className="flex items-center space-x-1 text-primary/80 hover:text-primary"
                                    disabled={isLoading}
                                >
                                    <AlignLeft className="h-5 w-5 items-center" />
                                </button>
                                {actionDropdownId === gadget.id && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    navigate(`/gadget/detail-seller/${slugify(gadget.name)}`, {
                                                        state: { gadgetId: gadget.id }
                                                    });
                                                    setActionDropdownId(null);
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Xem chi tiết
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setGadgetToDelete(gadget.id);
                                                    setShowDeleteModal(true);
                                                    setActionDropdownId(null);
                                                }}
                                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                            >
                                                <OctagonX className="h-4 w-4 mr-2" />
                                                Xóa sản phẩm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {gadgets.length === 0 && !isLoading && (
                <div className="text-center p-4 text-gray-500">Không có sản phẩm</div>
            )}
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

            {/* Discount Modal */}
            {isModalVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
                    onClick={handleOutsideClick}
                >
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">
                                {isEditing ? 'Cập nhật giảm giá' : 'Thêm giảm giá'}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form ref={formRef} onSubmit={handleDiscountSubmit} className="space-y-4">
                            <div className="flex flex-col">
                                <label htmlFor="discountPercentage" className="text-gray-700">
                                    Nhập phần trăm giảm giá
                                </label>
                                <input
                                    type="number"
                                    id="discountPercentage"
                                    name="discountPercentage"
                                    min="1"
                                    max="90"
                                    step="1"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-gray-400 focus:ring-opacity-50 px-2 py-2"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="discountExpiredDate" className="text-gray-700">
                                    Ngày hết hạn giảm giá
                                </label>
                                <div className="flex items-center">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={handleDateChange}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        minDate={new Date()}
                                        filterTime={filterPassedTime}
                                        className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-gray-400 focus:ring-opacity-50 px-2 py-2"
                                        placeholderText="Chọn ngày và giờ"
                                        required
                                    />
                                    <Calendar className="ml-2" />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                    disabled={isLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary"
                                    disabled={isLoading}
                                >
                                    {isEditing ? 'Cập nhật' : 'Xác nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {renderSaleConfirmModal()}
            {renderConfirmModal()}
            {renderDeleteConfirmModal()}
        </div>
    );
};

export default GadgetManagement;