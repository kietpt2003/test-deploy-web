// orderId = sellerorderId 
import { CreditCardOutlined, HomeOutlined, ShopOutlined } from "@ant-design/icons";
import { ArrowBack } from "@mui/icons-material";
import { AlignLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import AxiosInterceptor from "~/components/api/AxiosInterceptor";
import slugify from "~/ultis/config";

const OrderDetail = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const [orderDetailsResponse, orderItemsResponse] = await Promise.all([
                    AxiosInterceptor.get(`/api/seller-orders/${orderId}`),
                    AxiosInterceptor.get(`/api/seller-order/${orderId}/items`),
                ]);

                setOrderDetails(orderDetailsResponse.data);
                setOrderItems(orderItemsResponse.data.items);
            } catch (error) {
                console.error("Error fetching order details:", error);
                toast.error("Failed to fetch order details");
            }
        };

        fetchOrderDetails();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const translateStatus = (status) => {
        switch (status) {
            case "Success":
                return "Đã giao thành công";
            case "Pending":
                return "Đang chờ";
            case "Cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    const openCancelModal = () => {
        setShowCancelModal(true);
    };

    const handleCancelOrder = async () => {

        try {
            setIsLoading(true);
            await AxiosInterceptor.put(`/api/seller-order/${orderId}/cancel`, {
                reason: cancelReason.trim() || "",
            });

            setOrderDetails((prevDetails) => ({
                ...prevDetails,
                status: "Cancelled",
                cancelledReason: cancelReason.trim(),
                sellerOrderUpdatedAt: new Date().toISOString(),
            }));

            setShowCancelModal(false);
            setCancelReason("");

            toast.success("Hủy đơn hàng thành công");
        } catch (error) {
            const errorMessage =
                error.response?.data?.reasons?.[0]?.message ||
                "Hủy đơn hàng thất bại, vui lòng thử lại";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!orderDetails) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
                <div className="h-4 w-4 bg-white rounded-full"></div>
            </div>
            <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                Loading...
            </span>
        </div>
    }
    const getStatusClass = (status) => {
        switch (status) {
            case "Success":
                return "bg-green-500 text-white-700";
            case "Pending":
                return "bg-yellow-500 text-white-700";
            case "Cancelled":
                return "bg-red-500 text-white-700";
            default:
                return "bg-gray-100 text-white-700";
        }
    };
    return (
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
            <ToastContainer />
            <h2 className="text-xl font-semibold mb-4 text-center">
                Chi tiết đơn hàng #{orderId}
            </h2>

            {/* Thông tin trạng thái đơn hàng */}
            {orderDetails.status === "Cancelled" && (
                <div className="mt-6 p-4 bg-red-100 rounded-lg">
                    <div className="flex items-center justify-between">

                        <h3 className="font-semibold text-red-700 ">Đơn hàng của bạn đã bị hủy</h3>
                        <p className="text-sm text-gray-600">
                            Ngày đặt hàng: {formatDate(orderDetails.sellerOrderCreatedAt)}{" "}

                        </p>

                    </div>
                    <p>Lý do hủy: {orderDetails.cancelledReason}</p>
                    <p>Thời gian hủy: {formatDate(orderDetails.sellerOrderUpdatedAt)}</p>
                </div>
            )}

            {orderDetails.status === "Success" && (
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-green-700 ">Đơn hàng của bạn đã được giao thành công</h3>
                        <p className="text-sm text-gray-600">
                            Ngày đặt hàng: {formatDate(orderDetails.sellerOrderCreatedAt)}{" "}

                        </p>
                    </div>
                </div>
            )}

            {orderDetails.status === "Pending" && (
                <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
                    <div className="flex items-center justify-between">

                        <h3 className="font-semibold text-yellow-700 ">Đơn hàng của bạn đang chờ xử lý</h3>
                        <p className="text-sm text-gray-600">
                            Ngày đặt hàng: {formatDate(orderDetails.sellerOrderCreatedAt)}{" "}

                        </p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4">
                {/* Địa chỉ người nhận */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-primary/80 mb-2 flex items-center">
                        <HomeOutlined className="mr-2" /> Địa chỉ người nhận
                    </h3>
                    <p className="font-semibold p-2">{orderDetails.customerInfo.fullName}</p>
                    <p className=" p-2">Địa chỉ: {orderDetails.customerInfo.address}</p>
                    <p className=" p-2">Điện thoại: {orderDetails.customerInfo.phoneNumber}</p>
                </div>

                {/* Địa chỉ cửa hàng */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-primary/80 mb-2 flex items-center">
                        <ShopOutlined className="mr-2" /> Địa chỉ cửa hàng
                    </h3>
                    <p className="font-semibold p-2">{orderDetails.sellerInfo.shopName}</p>
                    <p className=" p-2">Địa chỉ: {orderDetails.sellerInfo.shopAddress}</p>
                    <p className=" p-2">Điện thoại: {orderDetails.sellerInfo.phoneNumber}</p>
                </div>

                {/* Hình thức thanh toán */}
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-primary/80 mb-2 flex items-center">
                        <CreditCardOutlined className="mr-2" /> Hình thức thanh toán
                    </h3>
                    <p className=" p-2">{orderDetails.paymentMethod}</p>
                    <p className=" p-2">Thời gian thanh toán: {formatDate(orderDetails.walletTrackingCreatedAt)}</p>
                </div>
            </div>

            {/* Sản phẩm */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">Sản phẩm</h3>
                <div className="border-t">
                    <table className="min-w-full bg-white border border-gray-200 table-fixed">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">Tên sản phẩm</th>
                                <th className="py-2 px-4 border-b">Giá gốc</th>
                                <th className="py-2 px-4 border-b">Số lượng</th>
                                <th className="py-2 px-4 border-b">Giảm giá</th>
                                <th className="py-2 px-4 border-b">Tạm tính</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((item) => (
                                <tr key={item.sellerOrderItemId}
                                    onClick={() => navigate(`/gadget/detail/${slugify(item.name)}`, {
                                        state: {
                                            productId: item.gadgetId,
                                        }
                                    })}
                                    className="hover:bg-gray-50 cursor-pointer">
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={item.thumbnailUrl}
                                                alt={item.name}
                                                className="w-24 h-24 object-contain rounded"
                                            />
                                            <div
                                                className="flex-grow">
                                                <p className="font-semibold">{item.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">{item.price.toLocaleString()}₫</td>
                                    <td className="py-2 px-4 border-b text-center">{item.quantity}</td>
                                    <td className="py-2 px-4 border-b text-center">{item.discountPercentage}%</td>
                                    <td className="py-2 px-4 border-b text-center">{(item.quantity * item.discountPrice).toLocaleString()}₫</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tổng cộng */}
            <div className="text-right">
                <p className="font-semibold text-red-500 text-lg">
                    Tổng cộng: {orderDetails.totalAmount.toLocaleString()}₫
                </p>
            </div>

            {/* Cancel Order Button */}
            {orderDetails.status === "Pending" && (
                <div className="flex justify-end mt-4">
                    <button
                        onClick={openCancelModal}
                        className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                    >
                        Hủy đơn hàng
                    </button>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[90%] max-w-[400px] m-4">
                        <div className="p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Hủy đơn hàng #{orderId}
                            </h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                placeholder="Lý do hủy(Không bắt buộc)"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full h-24 border rounded p-2 dark:border-gray-700"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleCancelOrder}
                                    className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                                    disabled={isLoading}
                                >
                                    Xác nhận hủy
                                </button>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="ml-2 text-gray-600 hover:text-gray-800"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Back to Orders Button */}
            <div className=" mt-6">
                <button
                    onClick={() => navigate('/orderHistory')}
                    className="text-primary/70 hover:text-secondary/80 cursor-pointer"
                >
                    <ArrowBack /> Quay lại đơn hàng của tôi
                </button>
            </div>
        </div>

    );
};

export default OrderDetail;