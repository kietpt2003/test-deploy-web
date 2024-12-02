import React, { useEffect, useState } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { HomeOutlined, MinusOutlined, PhoneOutlined, PlusOutlined, CheckCircleOutlined, ShoppingCartOutlined, LoadingOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import slugify from '~/ultis/config';
import { TrashIcon } from 'lucide-react';
import useAuth from '~/context/auth/useAuth';
import { Modal } from 'antd';
import { CART_ACTIONS } from '~/constants/cartEvents';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderConfirmation = ({ selectedItems, cartItemsBySeller, totalPrice, onCancel }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const navigate = useNavigate();

    const handleConfirmOrder = async () => {
        setIsProcessing(true);
        try {
            const listGadgetItems = Object.values(selectedItems).flat();
            await AxiosInterceptor.post('/api/order', { listGadgetItems });
            setOrderSuccess(true);
            
            // Dispatch event to reset cart count after successful order
            window.dispatchEvent(new CustomEvent('cartUpdate', { 
                detail: { type: CART_ACTIONS.REMOVE_ITEMS, items: listGadgetItems }
            }));
        } catch (error) {
            console.error("Error placing order:", error);
            if (error.response && error.response.data && error.response.data.reasons) {
                const reasons = error.response.data.reasons;

                // Display the message from the first reason
                if (reasons.length > 0) {
                    const reasonMessage = reasons[0].message;
                    toast.error(reasonMessage);
                } else {
                    toast.error("Đặt hàng thất bại. Vui lòng thử lại.");
                }
            }
        } finally {
            setIsProcessing(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
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
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">  <ShoppingCartOutlined className="text-5xl text-primary" /> Xác nhận đơn hàng</h2>

            {Object.entries(selectedItems).map(([sellerId, productIds]) => (
                <div key={sellerId} className="mb-6 border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-700">
                        {cartItemsBySeller[sellerId][0]?.seller?.shopName}
                    </h3>
                    {productIds.map(productId => {
                        const item = cartItemsBySeller[sellerId].find(item => item.gadget.id === productId);
                        if (!item) return null;
                        return (
                            <div key={productId} className="flex justify-between items-center mb-2">
                                <div className="flex items-center flex-grow mr-4">
                                    <img src={item.gadget.thumbnailUrl} alt={item.gadget.name} className="w-12 h-12 object-contain mr-2" />
                                    <span className="text-gray-600">{item.gadget.name} x {item.quantity}</span>
                                </div>
                                <span className="font-medium text-gray-800 ml-4">
                                    {((item.gadget.discountPercentage > 0 ? item.gadget.discountPrice : item.gadget.price) * item.quantity).toLocaleString()}₫
                                </span>
                            </div>
                        );
                    })}
                </div>
            ))}

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
    );
};

const CartPage = () => {
    const [sellers, setSellers] = useState([]);
    const [cartItemsBySeller, setCartItemsBySeller] = useState({});
    const [selectedItems, setSelectedItems] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);  // rename from isModalVisible
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
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
        const fetchSellers = async () => {
            try {
                const response = await AxiosInterceptor.get('/api/cart/sellers?Page=1&PageSize=100');
                setSellers(response.data.items);
            } catch (error) {
                console.error("Error fetching sellers:", error);
            }
        };

        fetchSellers();
    }, []);

    useEffect(() => {
        const fetchCartItemsForSeller = async (sellerId) => {
            try {
                const response = await AxiosInterceptor.get(`/api/cart/seller/${sellerId}`);
                setCartItemsBySeller(prev => ({ ...prev, [sellerId]: response.data.items }));
            } catch (error) {
                console.error(`Error fetching cart items for seller ${sellerId}:`, error);
            }
        };

        sellers.forEach(seller => fetchCartItemsForSeller(seller.id));
    }, [sellers]);

    const handleQuantityChange = async (sellerId, productId, change) => {
        setCartItemsBySeller(prev => {

            const updatedItems = prev[sellerId].map(item => {
                if (item.gadget.id === productId) {
                    const newQuantity = Math.max(1, item.quantity + change);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            return {
                ...prev,
                [sellerId]: updatedItems,
            };
        });

        try {
            const item = cartItemsBySeller[sellerId].find(item => item.gadget.id === productId);
            const newQuantity = Math.max(1, item.quantity + change);

            await AxiosInterceptor.put(`/api/cart/old`, {
                gadgetId: productId,
                quantity: newQuantity
            });

            const totalItems = Object.values(cartItemsBySeller).reduce((sum, items) => {
                return sum + items.length;
            }, 0);
            
            window.dispatchEvent(new CustomEvent('cartUpdate', { 
                detail: { count: totalItems } 
            }));
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Failed to update item quantity. Please try again.");


            setCartItemsBySeller(prev => {
                const revertedItems = prev[sellerId].map(item => {
                    if (item.gadget.id === productId) {
                        return { ...item, quantity: item.quantity - change };
                    }
                    return item;
                });
                return {
                    ...prev,
                    [sellerId]: revertedItems,
                };
            });
        }
    };

    const handleRemoveItemsForSeller = (sellerId) => {
        const seller = sellers.find(s => s.id === sellerId);
        setConfirmModal({
            isOpen: true,
            title: 'Xác nhận xóa tất cả sản phẩm',
            message: `Bạn có chắc chắn muốn xóa tất cả sản phẩm của ${seller?.shopName || 'người bán này'}?`,
            onConfirm: async () => {
                try {
                    await AxiosInterceptor.delete(`/api/cart/seller/${sellerId}`);
                    setCartItemsBySeller(prev => {
                        const updatedCart = {
                            ...prev,
                            [sellerId]: []
                        };

                        // Calculate new total after removal
                        const newTotal = Object.values(updatedCart).reduce((sum, items) => {
                            return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
                        }, 0);

                        // Dispatch event with new count
                        window.dispatchEvent(new CustomEvent('cartUpdate', { 
                            detail: { type: CART_ACTIONS.REMOVE }
                        }));

                        return updatedCart;
                    });
                    toast.success("Xóa tất cả sản phẩm khỏi giỏ hàng thành công");
                } catch (error) {
                    console.error(`Error removing items from seller ${sellerId}:`, error);
                    toast.error("Xóa tất cả sản phẩm khỏi giỏ hàng thất bại.");
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleRemoveItem = (gadgetId, quantity, gadgetName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Xác nhận xóa sản phẩm',
            message: `Bạn có chắc chắn muốn xóa sản phẩm "${gadgetName}" khỏi giỏ hàng?`,
            onConfirm: async () => {
                try {
                    await AxiosInterceptor.delete('/api/cart', {
                        data: { gadgetId, quantity }
                    });
                    
                    window.dispatchEvent(new CustomEvent('cartUpdate', { 
                        detail: { type: CART_ACTIONS.REMOVE }
                    }));

                    // Update cart items state
                    setCartItemsBySeller(prev => {
                        const updatedCart = {};
                        Object.keys(prev).forEach(sellerId => {
                            updatedCart[sellerId] = prev[sellerId].filter(item => item.gadget.id !== gadgetId);
                        });

                        // Calculate new total items (not quantities)
                        const newTotal = Object.values(updatedCart).reduce((sum, items) => {
                            return sum + items.length;
                        }, 0);

                        window.dispatchEvent(new CustomEvent('cartUpdate', { 
                            detail: { count: newTotal } 
                        }));

                        return updatedCart;
                    });

                    setSelectedItems(prev => {
                        const updatedSelected = { ...prev };
                        Object.keys(updatedSelected).forEach(sellerId => {
                            updatedSelected[sellerId] = updatedSelected[sellerId].filter(id => id !== gadgetId);
                            if (updatedSelected[sellerId].length === 0) {
                                delete updatedSelected[sellerId];
                            }
                        });
                        return updatedSelected;
                    });
                    toast.success("Xóa sản phẩm khỏi giỏ hàng thành công");
                } catch (error) {
                    if (error.response?.data?.reasons?.[0]?.message) {
                        toast.error(error.response.data.reasons[0].message);
                    } else {
                        toast.error("Có lỗi xảy ra vui lòng thử lại");
                    }
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleSelectItem = (sellerId, productId) => {
        setSelectedItems(prev => {
            const newSelectedItems = { ...prev };
            if (newSelectedItems[sellerId]?.includes(productId)) {
                newSelectedItems[sellerId] = newSelectedItems[sellerId].filter(id => id !== productId);
                if (newSelectedItems[sellerId].length === 0) delete newSelectedItems[sellerId];
            } else {
                if (!newSelectedItems[sellerId]) newSelectedItems[sellerId] = [];
                newSelectedItems[sellerId].push(productId);
            }
            return newSelectedItems;
        });
    };

    const handleSelectAllForSeller = (sellerId) => {
        setSelectedItems(prev => {
            const isSelected = selectedItems[sellerId]?.length === cartItemsBySeller[sellerId].length;
            const updatedSelectedItems = { ...prev };

            if (isSelected) {
                delete updatedSelectedItems[sellerId];
            } else {
                updatedSelectedItems[sellerId] = cartItemsBySeller[sellerId].map(item => item.gadget.id);
            }
            return updatedSelectedItems;
        });
    };

    const handleSelectAll = () => {
        const validItemsBySeller = {};
        sellers.forEach(seller => {
            const validItems = (cartItemsBySeller[seller.id] || [])
                .filter(item => item.gadget.status !== "Inactive" && item.gadget.isForSale !== false)
                .map(item => item.gadget.id);
            if (validItems.length > 0) {
                validItemsBySeller[seller.id] = validItems;
            }
        });

        const allSelected = Object.keys(selectedItems).length === Object.keys(validItemsBySeller).length &&
            Object.keys(validItemsBySeller).every(sellerId => 
                selectedItems[sellerId]?.length === validItemsBySeller[sellerId].length);

        if (allSelected) {
            setSelectedItems({});
        } else {
            setSelectedItems(validItemsBySeller);
        }
    };

    useEffect(() => {
        let total = 0;
        Object.entries(selectedItems).forEach(([sellerId, productIds]) => {
            productIds.forEach(productId => {
                const item = cartItemsBySeller[sellerId]?.find(item => item.gadget.id === productId);
                if (item) {
                    total += (item.gadget.discountPercentage > 0 ? item.gadget.discountPrice : item.gadget.price) * item.quantity;
                }
            });
        });
        setTotalPrice(total);
    }, [selectedItems, cartItemsBySeller]);

    const onClose = () => {
        setIsOpen(false);
    };

    const isAnySelectedItemInactiveOrNotForSale = () => {
        for (const [sellerId, productIds] of Object.entries(selectedItems)) {
            for (const productId of productIds) {
                const item = cartItemsBySeller[sellerId]?.find(item => item.gadget.id === productId);
                if (item && (item.gadget.status === "Inactive" || item.gadget.isForSale === false)) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleCheckout = () => {
        if (isAnySelectedItemInactiveOrNotForSale()) {
            toast.error("Không thể mua hàng do có sản phẩm không hợp lệ trong giỏ hàng.");
            return;
        }
        if (!user?.address || !user?.phoneNumber) {
            setIsOpen(true);
            return;
        }
        setShowConfirmation(true);
    };

    const handleCancelOrder = () => {
        setShowConfirmation(false);
    };

    const selectedItemCount = Object.values(selectedItems).flat().length;

    // Add this useEffect to update cart count in header when cart items change
    useEffect(() => {
        const updateCartCount = async () => {
            try {
                if (sellers.length > 0) {
                    const totalUniqueItems = Object.values(cartItemsBySeller).reduce((sum, items) => {
                        return sum + items.length; // Only count each item once, regardless of quantity
                    }, 0);
                    const event = new CustomEvent('cartUpdate', { detail: { count: totalUniqueItems } });
                    window.dispatchEvent(event);
                }
            } catch (error) {
                console.error("Error updating cart count:", error);
            }
        };

        updateCartCount();
    }, [sellers, cartItemsBySeller]);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <ToastContainer />
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
            {!showConfirmation ? (
                <>
                    <h1 className="text-3xl font-bold text-center text-indigo-900 dark:text-white mb-8">
                        Giỏ hàng của bạn
                    </h1>

                    {sellers.length === 0 || Object.values(cartItemsBySeller).every(items => items.length === 0) ? (
                        <div className="text-center text-gray-500 text-lg font-semibold py-8">
                            Giỏ hàng trống
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={Object.keys(selectedItems).length === sellers.length &&
                                        sellers.every(seller => selectedItems[seller.id]?.length === cartItemsBySeller[seller.id]?.length)}
                                />
                                <label className="ml-2">Sản phẩm</label>
                            </div>

                            {sellers.map(seller => (
                                (cartItemsBySeller[seller.id]?.length > 0) && (
                                    <div key={seller.id} className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
                                        <div className="mb-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => handleSelectAllForSeller(seller.id)}
                                                    checked={selectedItems[seller.id]?.length === cartItemsBySeller[seller.id]?.length}
                                                />
                                                <h2 className="text-lg font-semibold ml-2">{seller.shopName}</h2>
                                            </div>
                                            <div className="flex items-center mt-2">
                                                <HomeOutlined />
                                                <p className="ml-2">{seller.shopAddress}</p>
                                            </div>
                                            <div className="flex items-center mt-2">
                                                <PhoneOutlined />
                                                <p className="ml-2">SĐT: {seller.phoneNumber}</p>
                                            </div>
                                            <div className='flex justify-end mt-2'>
                                                <button
                                                    onClick={() => handleRemoveItemsForSeller(seller.id)}
                                                    className="text-red-500 hover:underline"
                                                >
                                                    Xóa tất cả
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {(cartItemsBySeller[seller.id] || []).map(item => (
                                                <div key={item.gadget.id} className="flex items-start gap-4 p-4 border rounded-md shadow-sm bg-gray-100">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems[seller.id]?.includes(item.gadget.id) || false}
                                                        onChange={() => handleSelectItem(seller.id, item.gadget.id)}
                                                        className="mt-1"
                                                    />
                                                    <img src={item.gadget.thumbnailUrl}
                                                        alt={item.gadget.name}
                                                        className="w-20 h-20 object-contain rounded-md"
                                                    />

                                                    <div className="flex-grow flex flex-col space-y-2">
                                                        <h4 className="font-bold cursor-pointer"
                                                            onClick={() => navigate(`/gadget/detail/${slugify(item.gadget.name)}`, {
                                                                state: {
                                                                    productId: item.gadget.id,
                                                                }
                                                            })}
                                                        >{item.gadget.name}</h4>
                                                        <p>Hãng: {item.gadget.brand.name}</p>
                                                        <p>Loại sản phẩm: {item.gadget.category.name}</p>

                                                        <div className="flex items-center mt-2">
                                                            <p>Đơn giá: </p>
                                                            {item.gadget.discountPercentage > 0 ? (
                                                                <>
                                                                    <div className="text-red-500 font-semibold text-sm ml-2 mr-2">
                                                                        {item.gadget.discountPrice.toLocaleString()}₫
                                                                    </div>
                                                                    <span className="line-through text-gray-500">

                                                                        {item.gadget.price.toLocaleString()}đ
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <div className="text-gray-800 font-semibold text-sm ml-2">
                                                                    {item.gadget.price.toLocaleString()}₫
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center mt-2">
                                                            <p>Thành tiền: </p>
                                                            <span className="font-semibold text-red-500 ml-2">
                                                                {(
                                                                    (item.gadget.discountPercentage > 0
                                                                        ? item.gadget.discountPrice
                                                                        : item.gadget.price) * item.quantity
                                                                ).toLocaleString()}₫
                                                            </span>
                                                        </div>
                                                        {item.gadget.status === "Inactive" ? (
                                                            <div className="text-red-500">
                                                                Sản phẩm đã bị khóa do vi phạm chính sách TechGadget
                                                            </div>
                                                        ) : item.gadget.isForSale === false && (
                                                            <div className="text-red-500">
                                                                Ngừng bán
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleQuantityChange(seller.id, item.gadget.id, -1)}
                                                                disabled={item.quantity <= 1}
                                                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                                            >
                                                                <MinusOutlined />
                                                            </button>
                                                            <span>{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantityChange(seller.id, item.gadget.id, 1)}
                                                                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                                                            >
                                                                <PlusOutlined />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-end mt-2'>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.gadget.id, item.quantity, item.gadget.name)}
                                                            className="text-red-500 hover:underline"
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}

                            {totalPrice > 0 && (
                                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 py-3 shadow-2xl px-4 flex justify-between items-center">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                        <p className="text-lg font-semibold text-gray-700">Tổng tiền:</p>
                                        <p className="text-xl font-bold text-red-500">{totalPrice.toLocaleString()}₫</p>
                                        <p className="text-lg font-semibold text-gray-700 sm:border-l sm:pl-4 sm:ml-4">
                                            Sản phẩm đã chọn:
                                            <span className="text-blue-600 font-bold ml-2">{selectedItemCount}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={isAnySelectedItemInactiveOrNotForSale()}
                                        className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${isAnySelectedItemInactiveOrNotForSale()
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-primary/80 hover:bg-secondary/90 text-white'
                                            }`}
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <OrderConfirmation
                    selectedItems={selectedItems}
                    cartItemsBySeller={cartItemsBySeller}
                    totalPrice={totalPrice}
                    onCancel={handleCancelOrder}
                />
            )}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
};

export default CartPage;