import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Checkbox, Button, Slider, Tag } from 'antd';
import { useLocation } from 'react-router-dom';

function Filter({ isVisible, onClose, onApplyFilters, initialFilters }) {
  const location = useLocation();
  const { categoryId } = location.state || {};
  const [filters, setFilters] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [priceRange, setPriceRange] = useState([0, 200000000]);
  const [isPriceRangeTouched, setIsPriceRangeTouched] = useState(false);
  const apiBaseUrl = process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_DEV_API
    : process.env.REACT_APP_PRO_API;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/gadget-filters/category/${categoryId}`);
        setFilters(response.data);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    if (categoryId) {
      fetchFilters();
    }
  }, [categoryId]);

  const handleCheckboxChange = (specKeyName, filterId, filterValue) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [specKeyName]: {
        ...prevFilters[specKeyName],
        [filterId]: prevFilters[specKeyName]?.[filterId] ? undefined : filterValue,
      },
    }));
  };

 // Add new useEffect to sync with parent's appliedFilters
 useEffect(() => {
  if (initialFilters) {
    
      
      // Set price range
      if (initialFilters.MinPrice != null && initialFilters.MaxPrice != null) {
          setPriceRange([initialFilters.MinPrice, initialFilters.MaxPrice]);
          setIsPriceRangeTouched(true);
      } else {
        setIsPriceRangeTouched(false);
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

  const applyFilters = () => {
    const gadgetFilters = Object.entries(selectedFilters).flatMap(([key, filters]) =>
      Object.keys(filters).filter(filterId => filters[filterId]).map(filterId => filterId)
    );

    const filterData = {
      GadgetFilters: gadgetFilters,
    };

    // Only include price range if it was modified
    if (isPriceRangeTouched) {
      filterData.MinPrice = priceRange[0];
      filterData.MaxPrice = priceRange[1];
    }

    onApplyFilters(filterData);
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
                  className={`
                  
                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-[#FFA500]
                    [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-[#FFA500]
                    
                  `}
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
        {isPriceRangeTouched && (
          <Tag
            closable
            onClose={() => {
              setPriceRange([0, 200000000]);
              setIsPriceRangeTouched(false);
            }}
          >
            Giá: {priceRange[0].toLocaleString()}đ - {priceRange[1].toLocaleString()}đ
          </Tag>
        )}
      </div>
    </div>
  );


  return (
    <Modal
      open={isVisible}  // Thay đổi visible thành open
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
          }}>
          Xác nhận
        </Button>,

      ]}
    >

      {renderSelectedFilters()}
      {renderFilterGroup()}
      <div className="price-filter max-w-md w-full">
        <h4 className="text-lg font-semibold mb-2">Giá</h4>
        <Slider
          range
          min={0}
          max={200000000}
          value={priceRange}
          onChange={(value) => {
            setPriceRange(value);
            setIsPriceRangeTouched(true);
          }}
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

export default Filter;
