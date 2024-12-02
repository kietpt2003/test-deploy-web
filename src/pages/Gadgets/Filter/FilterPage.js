import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Checkbox, Button, Slider, Tag } from 'antd';
import { useLocation } from 'react-router-dom';

function FilterPage({ isVisible, onClose, onApplyFilters, initialFilters }) { // Add initialFilters prop
    const location = useLocation();
    const { categoryId } = location.state || {};
    const [filters, setFilters] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 200000000]);
    const [isPriceModified, setIsPriceModified] = useState(false);
    const apiBaseUrl = process.env.NODE_ENV === "development"
        ? process.env.REACT_APP_DEV_API
        : process.env.REACT_APP_PRO_API;

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/gadget-filters/category/${categoryId}?Page=1&PageSize=100`);
                setFilters(response.data);
            } catch (error) {
                console.error("Error fetching filters:", error);
            }
        };

        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/brands/categories/${categoryId}?Page=1&PageSize=100`);
                setBrands(response.data.items);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        if (categoryId) {
            fetchFilters();
            fetchBrands();
        }
    }, [categoryId]);

    // Add new useEffect to sync with parent's appliedFilters
    useEffect(() => {
        if (initialFilters) {
            // Set brands
            if (initialFilters.Brands) {
                setSelectedBrands(initialFilters.Brands);
            }
            
            // Set price range
            if (initialFilters.MinPrice != null && initialFilters.MaxPrice != null) {
                setPriceRange([initialFilters.MinPrice, initialFilters.MaxPrice]);
                setIsPriceModified(true);
            } else {
                setPriceRange([0, 200000000]);
                setIsPriceModified(false);
            }
            
            // Set gadget filters
            if (initialFilters.GadgetFilters && filters.length > 0) {
                const newSelectedFilters = {};
                filters.forEach(filterCategory => {
                    filterCategory.gadgetFilters.forEach(filter => {
                        if (initialFilters.GadgetFilters.includes(filter.gadgetFilterId)) {
                            if (!newSelectedFilters[filterCategory.specificationKeyName]) {
                                newSelectedFilters[filterCategory.specificationKeyName] = {};
                            }
                            newSelectedFilters[filterCategory.specificationKeyName][filter.gadgetFilterId] = filter.value;
                        }
                    });
                });
                setSelectedFilters(newSelectedFilters);
            }
        }
    }, [initialFilters, filters, isVisible]);

    const handleCheckboxChange = (specKeyName, filterId, filterValue) => {
        setSelectedFilters((prevFilters) => ({
            ...prevFilters,
            [specKeyName]: {
                ...prevFilters[specKeyName],
                [filterId]: prevFilters[specKeyName]?.[filterId] ? undefined : filterValue,
            },
        }));
    };

    const handleBrandChange = (brandId) => {
        setSelectedBrands((prevBrands) =>
            prevBrands.includes(brandId)
                ? prevBrands.filter((id) => id !== brandId)
                : [...prevBrands, brandId]
        );
    };

    const handlePriceChange = (value) => {
        setPriceRange(value);
        setIsPriceModified(true);
    };

    const removeSelectedFilter = (specKeyName, filterId) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };
            delete updatedFilters[specKeyName][filterId];
            if (Object.keys(updatedFilters[specKeyName]).length === 0) {
                delete updatedFilters[specKeyName];
            }
            return updatedFilters;
        });
    };

    const removePriceFilter = () => {
        setPriceRange([0, 200000000]);
        setIsPriceModified(false);
    };

    const applyFilters = () => {
        const gadgetFilters = Object.entries(selectedFilters).flatMap(([key, filters]) =>
            Object.keys(filters).filter(filterId => filters[filterId]).map(filterId => filterId)
        );
        
        const filterData = {
            GadgetFilters: gadgetFilters,
            Brands: selectedBrands,
        };

        // Chỉ thêm price vào filter khi đã được modify
        if (isPriceModified) {
            filterData.MinPrice = priceRange[0];
            filterData.MaxPrice = priceRange[1];
        }
        
        onApplyFilters(filterData);
        onClose();
    };


    const renderFilterGroup = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filters.map((filterCategory) => (
                    <div key={filterCategory.specificationKeyName} className="filter-group">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">{filterCategory.specificationKeyName}</h4>
                        <div className="space-y-2">
                            {filterCategory.gadgetFilters.map((filterOption) => (
                                <Checkbox
                                    key={filterOption.gadgetFilterId}
                                    checked={selectedFilters[filterCategory.specificationKeyName]?.[filterOption.gadgetFilterId] || false}
                                    onChange={() => handleCheckboxChange(
                                        filterCategory.specificationKeyName,
                                        filterOption.gadgetFilterId,
                                        filterOption.value
                                    )}
                                    style={{
                                        '--ant-primary-color': '#FFA500',
                                        '--ant-primary-5': '#FFA500',
                                        '--ant-checkbox-color': '#FFA500'
                                    }}
                                >
                                    <span className="text-sm">{filterOption.value}</span>
                                </Checkbox>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBrandFilter = () => (
        <div className="brand-filter mt-4">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Thương hiệu</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {brands.map((brand) => (
                    <div
                        key={brand.id}
                        onClick={() => handleBrandChange(brand.id)}
                        className={`flex items-center justify-center cursor-pointer p-2 border rounded-lg w-30 h-10 ${selectedBrands.includes(brand.id) ? "border-orange-500" : "border-gray-300"
                            }`}
                    >
                        <img
                            src={brand.logoUrl}
                            alt={`Logo of ${brand.id}`}
                            className="w-30 h-8 object-contain"
                        />
                    </div>
                ))}
            </div>

        </div>
    );



    const renderSelectedFilters = () => (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-sm font-semibold mb-2 text-gray-700">Đã chọn: </h4>
            <div className="flex flex-wrap gap-2">
                {Object.entries(selectedFilters || {}).flatMap(([specKeyName, filters]) =>
                    Object.entries(filters || {})
                        .filter(([, value]) => value)
                        .map(([filterId, value]) => (
                            <Tag
                                closable
                                onClose={() => removeSelectedFilter(specKeyName, filterId)}
                                key={`${specKeyName}-${filterId}`}
                            >
                                {specKeyName}: {value}
                            </Tag>
                        ))
                )}
                {selectedBrands.map((brandId) => {
                    const brand = brands.find((b) => b.id === brandId); // Tìm thương hiệu theo brandId
                    return (
                        <Tag
                            closable
                            onClose={() => handleBrandChange(brandId)}
                            key={brandId}
                        >
                            {brand ? `Brand: ${brand.name}` : `Brand: Unknown`} {/* Hiển thị tên thương hiệu */}
                        </Tag>
                    );
                })}
                {isPriceModified && (
                    <Tag
                        closable
                        onClose={removePriceFilter}
                    >
                        Giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
                    </Tag>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            open={isVisible}  // Thay đổi từ visible thành open
            onCancel={onClose}
            width={900}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="apply"
                    type="primary"
                    onClick={applyFilters}
                    style={{
                        backgroundColor: '#FFA500',
                        borderColor: '#FFA500',
                    }}
                >
                    Xác nhận
                </Button>,
            ]}
        >
            {renderSelectedFilters()}
            {renderBrandFilter()}
            {renderFilterGroup()}
            <div className="price-filter max-w-md w-full mt-4">
                <h4 className="text-lg font-semibold mb-2">Giá</h4>
                <Slider
                    range
                    min={0}
                    max={200000000}
                    value={priceRange}
                    onChange={handlePriceChange}
                    trackStyle={{
                        backgroundColor: '#FFA500'
                    }}
                    handleStyle={[
                        {
                            borderColor: '#FFA500',
                            backgroundColor: '#FFA500',
                            opacity: 1,
                            boxShadow: '0 0 0 2px rgba(255, 165, 0, 0.2)'
                        },
                        {
                            borderColor: '#FFA500',
                            backgroundColor: '#FFA500',
                            opacity: 1,
                            boxShadow: '0 0 0 2px rgba(255, 165, 0, 0.2)'
                        }
                    ]}
                    railStyle={{
                        backgroundColor: '#f5f5f5'
                    }}
                    className="hover:cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-sm">
                    <span>Giá cao nhất: {priceRange[0].toLocaleString()} VND</span>
                    <span>Giá thấp nhất: {priceRange[1].toLocaleString()} VND</span>
                </div>
            </div>
        </Modal>
    );
}

export default FilterPage;
