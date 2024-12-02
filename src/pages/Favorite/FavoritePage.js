import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { useNavigate } from 'react-router-dom';
import slugify from '~/ultis/config';
import { toast, ToastContainer } from 'react-toastify';

function FavoritePage() {
    const [groupedFavorites, setGroupedFavorites] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [scrollPositions, setScrollPositions] = useState({});
    const [loading, setLoading] = useState(false);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [shopAnchorEl, setShopAnchorEl] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await AxiosInterceptor.get("api/favorite-gadgets?Page=1&PageSize=100");
                const grouped = response.data.items.reduce((groups, item) => {
                    const shopName = item.gadget.seller.shopName;
                    if (!groups[shopName]) {
                        groups[shopName] = {
                            shopInfo: item.gadget.seller,
                            products: []
                        };
                    }
                    groups[shopName].products.push(item.gadget);
                    return groups;
                }, {});
                setLoading(true);
                setGroupedFavorites(Object.values(grouped));

            } catch (error) {
                console.error("Failed to fetch favorites:", error);
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);


    const handleScroll = (direction, shopName) => {
        const container = document.getElementById(`shop-container-${shopName}`);
        if (!container) return;

        const scrollAmount = 300; // Điều chỉnh khoảng cách scroll
        const newScrollLeft = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });

        // Cập nhật trạng thái scroll cho shop cụ thể
        setScrollPositions(prev => ({
            ...prev,
            [shopName]: newScrollLeft
        }));
    };

    // Kiểm tra xem có thể scroll không
    const checkScrollable = (shopName) => {
        const container = document.getElementById(`shop-container-${shopName}`);
        if (!container) return { canScrollLeft: false, canScrollRight: false };

        const canScrollLeft = container.scrollLeft > 0;
        const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);

        return { canScrollLeft, canScrollRight };
    };

    // Theo dõi scroll event của mỗi container
    useEffect(() => {
        const handleContainerScroll = (shopName) => {
            const { canScrollLeft, canScrollRight } = checkScrollable(shopName);
            setScrollPositions(prev => ({
                ...prev,
                [shopName]: {
                    canScrollLeft,
                    canScrollRight
                }
            }));
        };

        // Thêm scroll listener cho mỗi container
        groupedFavorites.forEach(shop => {
            const container = document.getElementById(`shop-container-${shop.shopInfo.shopName}`);
            if (container) {
                container.addEventListener('scroll', () => handleContainerScroll(shop.shopInfo.shopName));
                // Kiểm tra ban đầu
                handleContainerScroll(shop.shopInfo.shopName);
            }
        });

        // Cleanup
        return () => {
            groupedFavorites.forEach(shop => {
                const container = document.getElementById(`shop-container-${shop.shopInfo.shopName}`);
                if (container) {
                    container.removeEventListener('scroll', () => handleContainerScroll(shop.shopInfo.shopName));
                }
            });
        };
    }, [groupedFavorites]);

    const handleRemoveProduct = async (gadgetId) => {
        try {
            await AxiosInterceptor.post(`/api/favorite-gadgets/${gadgetId}`);
            setGroupedFavorites(prevGroups => {
                const newGroups = prevGroups.map(group => ({
                    ...group,
                    products: group.products.filter(product => product.id !== gadgetId)
                })).filter(group => group.products.length > 0);
                toast.success("Xóa khỏi yêu thích thành công");
                return newGroups;
            });
        } catch (error) {
            console.error("Error removing product:", error);
        }
        handleClose();
    };

    const handleDeleteAll = async () => {
        try {
            await AxiosInterceptor.delete("/api/favorite-gadgets");
            setGroupedFavorites([]);
            toast.success("Đã xóa tất cả sản phẩm yêu thích");
        } catch (error) {
            console.error("Error deleting all favorites:", error);
            toast.error("Không thể xóa tất cả sản phẩm yêu thích");
        }
        setOpenConfirmDialog(false);
    };

    const handleClick = (event, product) => {
        setAnchorEl(event.currentTarget);
        setSelectedProduct(product);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedProduct(null);
    };

    const handleShopMenuClick = (event, shop) => {
        event.stopPropagation();
        setShopAnchorEl(event.currentTarget);
        setSelectedShop(shop);
    };

    const handleShopMenuClose = () => {
        setShopAnchorEl(null);
        setSelectedShop(null);
    };

    const handleDeleteByShop = async (sellerId) => {
        try {
            await AxiosInterceptor.delete(`/api/favorite-gadgets/sellers/${sellerId}`);
            setGroupedFavorites(prevGroups => 
                prevGroups.filter(group => group.shopInfo.id !== sellerId)
            );
            toast.success("Đã xóa tất cả sản phẩm của cửa hàng");
        } catch (error) {
            console.error("Error deleting shop products:", error);
            toast.error("Không thể xóa sản phẩm của cửa hàng");
        }
        handleShopMenuClose();
    };

    return (
        <div className="min-h-screen dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-900 dark:text-white">
                        Danh sách yêu thích
                    </h1>
                    {groupedFavorites.length > 0 && (
                        <button 
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setOpenConfirmDialog(true)}
                        >
                            Xóa tất cả
                        </button>
                    )}
                </div>

                {/* Custom Tailwind Modal */}
                {openConfirmDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                                Xác nhận xóa
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setOpenConfirmDialog(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {groupedFavorites.length === 0 ? (

                    <div className="text-center text-gray-500 dark:text-gray-300">
                        Danh sách yêu thích trống
                    </div>
                ) : (
                    groupedFavorites.map((shop) => (
                        <div key={shop.shopInfo.shopName} className="mb-10">
                            <div className="bg-40 rounded-lg shadow-md">
                                <div className="p-3 bg-primary/40 dark:bg-gray-700 rounded-t-lg flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-indigo-900 dark:text-white">{shop.shopInfo.shopName}</h2>
                                        <p className="text-sm text-indigo-900 dark:text-white">{shop.shopInfo.shopAddress}</p>
                                    </div>
                                    <IconButton
                                        onClick={(e) => handleShopMenuClick(e, shop.shopInfo)}
                                        size="small"
                                        className="text-gray-500"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </IconButton>
                                </div>
                                
                                {/* Shop Menu */}
                                <Menu
                                    anchorEl={shopAnchorEl}
                                    open={Boolean(shopAnchorEl) && selectedShop?.id === shop.shopInfo.id}
                                    onClose={handleShopMenuClose}
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                >
                                    <MenuItem onClick={() => handleDeleteByShop(shop.shopInfo.id)}>
                                        Xóa tất cả sản phẩm của cửa hàng
                                    </MenuItem>
                                </Menu>

                                <div className="relative">
                                    {/* Container sản phẩm có thể scroll */}
                                    <div
                                        id={`shop-container-${shop.shopInfo.shopName}`}
                                        className="overflow-x-auto scrollbar-hide"
                                        style={{
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none'
                                        }}
                                    >
                                        <div className="p-4 flex gap-4 min-w-min">
                                            {shop.products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => navigate(`/gadget/detail/${slugify(product.name)}`, {
                                                        state: {
                                                            productId: product.id,
                                                        }
                                                    })}
                                                    className="border rounded-lg shadow-sm flex-none w-[200px] flex flex-col justify-between relative bg-40 cursor-pointer"
                                                >
                                                    {product.discountPercentage > 0 && (
                                                        <div className="absolute top-0 left-0 bg-red-600 text-white text-sm font-bold text-center py-1 px-2 rounded-tr-md rounded-b-md">
                                                            Giảm {`${product.discountPercentage}%`}
                                                        </div>
                                                    )}
                                                    {product.status === "Inactive" ? (
                                                        <div className="absolute top-1/3 left-0 transform -translate-y-1/2 w-full bg-red-500 text-white text-sm font-bold text-center py-1 rounded">
                                                           Sản phẩm đã bị khóa do vi phạm chính sách TechGadget
                                                        </div>
                                                    ) : !product.isForSale && (
                                                        <div className="absolute top-0 right-0 bg-gray-400 text-white text-sm font-bold text-center py-1 px-1 rounded-tr-md rounded-b-md">
                                                            Ngừng bán
                                                        </div>
                                                    )}
                                                    <div className="p-2 cursor-pointer">
                                                        <img
                                                            src={product.thumbnailUrl}
                                                            alt={product.name}
                                                            className="w-full h-32 object-contain mb-2 rounded"
                                                        />
                                                        <div className="flex justify-between items-center mb-2 text-indigo-900 dark:text-white">
                                                            <h3 className="font-semibold text-xs line-clamp-2">{product.name}</h3>
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Stop the click event from bubbling up
                                                                    handleClick(e, product);
                                                                }}
                                                                size="small"
                                                                className="text-gray-500"
                                                            >
                                                                <MoreVert />
                                                            </IconButton>
                                                        </div>
                                                        <div className="flex py-4">
                                                            {product.discountPercentage > 0 ? (
                                                                <>
                                                                    <div className="text-red-500 font-semibold text-sm mr-2">
                                                                        {product.discountPrice.toLocaleString()}₫
                                                                    </div>
                                                                    <span className="line-through text-gray-500">
                                                                        {product.price.toLocaleString()}₫
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <div className="text-gray-800 font-semibold text-sm">
                                                                    {product.price.toLocaleString()}₫
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Menu
                                                        anchorEl={anchorEl}
                                                        open={Boolean(anchorEl) && selectedProduct?.id === product.id}
                                                        onClose={handleClose}
                                                        anchorOrigin={{
                                                            vertical: "bottom",
                                                            horizontal: "right",
                                                        }}
                                                        transformOrigin={{
                                                            vertical: "top",
                                                            horizontal: "right",
                                                        }}
                                                    >
                                                        <MenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Stop the click event from bubbling up
                                                                handleRemoveProduct(product.id);
                                                            }}>
                                                            Xóa khỏi yêu thích
                                                        </MenuItem>
                                                    </Menu>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nút scroll phải */}
                                    {scrollPositions[shop.shopInfo.shopName]?.canScrollRight && (
                                        <button
                                            onClick={() => handleScroll('right', shop.shopInfo.shopName)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-l shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                    )}
                                    {scrollPositions[shop.shopInfo.shopName]?.canScrollLeft && (
                                        <button
                                            onClick={() => handleScroll('left', shop.shopInfo.shopName)}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 text-indigo-900 dark:text-white p-2 rounded-r shadow-md hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>

                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default FavoritePage;