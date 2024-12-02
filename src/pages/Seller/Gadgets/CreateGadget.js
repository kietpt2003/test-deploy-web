import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Plus, ArrowRight, ArrowLeft, Upload, ImageIcon, Trash2, Clipboard, FileText, Calendar } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import 'tailwindcss/tailwind.css';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';

const CreateGadget = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specificationKeys, setSpecificationKeys] = useState([]);
  const [specificationUnits, setSpecificationUnits] = useState({});
  const [gadgetData, setGadgetData] = useState({
    brandId: '',
    name: '',
    price: '',
    thumbnailUrl: '',
    categoryId: '',
    condition: '',
    quantity: '',
    discount: {
      discountPercentage: '',
      discountExpiredDate: '',
    },
    gadgetImages: [],
    gadgetDescriptions: [{ type: 'Image', value: '', file: null }],
    specificationValues: [{ specificationKeyId: '', specificationUnitId: '', values: [''] }],
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [gadgetImagePreviews, setGadgetImagePreviews] = useState([]);
  const [gadgetDescriptionPreviews, setGadgetDescriptionPreviews] = useState([]);
  const [hasDiscount, setHasDiscount] = useState(false);

  const inputClassName = "mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-gray-400 focus:ring-opacity-50 px-2 py-2";

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await AxiosInterceptor.get("/api/categories");
        setCategories(categoriesRes.data.items);

      } catch (error) {
        console.error("Error fetching categories", error);

      }
    };
    fetchCategories();
  }, []);

  // Fetch brands when a category is selected
  useEffect(() => {
    if (gadgetData.categoryId) {
      AxiosInterceptor.get(`/api/brands/categories/${gadgetData.categoryId}?Page=1&PageSize=100`)
        .then((res) => {
          setBrands(res.data.items);
        })
        .catch((error) => console.error("Error fetching brands", error));
    }
  }, [gadgetData.categoryId]);

  // Fetch specification keys when a category is selected
  useEffect(() => {
    if (gadgetData.categoryId) {
      AxiosInterceptor.get(`/api/specification-keys/categories/${gadgetData.categoryId}?Page=1&PageSize=100`)
        .then((res) => {
          setSpecificationKeys(res.data.items);
          const units = res.data.items.reduce((acc, item) => {
            acc[item.id] = item.specificationUnits;
            return acc;
          }, {});
          setSpecificationUnits(units);
        })
        .catch((error) => console.error("Error fetching specification keys", error));
    }
  }, [gadgetData.categoryId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    setIsLoading(true);
    if (e) {
      e.preventDefault();
    }

    // Validate discount fields
    if (gadgetData.discount.discountPercentage || gadgetData.discount.discountExpiredDate) {
      const DiscountPercentage = parseFloat(gadgetData.discount.discountPercentage);
      const now = new Date();
      const discountDate = new Date(gadgetData.discount.discountExpiredDate);
      if (discountDate <= now) {
        toast.error("Discount expiration date must be in the future");
        return;
      }
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('brandId', gadgetData.brandId);
    formData.append('name', gadgetData.name);
    formData.append('price', gadgetData.price);
    formData.append('thumbnailUrl', gadgetData.thumbnailUrl);
    formData.append('categoryId', gadgetData.categoryId);
    formData.append('condition', gadgetData.condition);
    formData.append('quantity', gadgetData.quantity);

    // Only append discount fields if discount is enabled and values exist
    if (hasDiscount) {
      if (gadgetData.discount.discountPercentage) {
        formData.append('discount.discountPercentage', gadgetData.discount.discountPercentage);
      }
      if (gadgetData.discount.discountExpiredDate) {
        formData.append('discount.discountExpiredDate', gadgetData.discount.discountExpiredDate);
      }
    }

    // Xử lý GadgetImages
    gadgetData.gadgetImages.forEach((image, index) => {
      formData.append(`GadgetImages`, image);
    });
    gadgetData.gadgetDescriptions.forEach((desc, index) => {
      if (desc.id) {
        formData.append(`GadgetDescriptions[${index}].id`, desc.id);
      }
      formData.append(`GadgetDescriptions[${index}].type`, desc.type);
      if (desc.type === 'Image') {
        if (desc.file instanceof File) {
          formData.append(`GadgetDescriptions[${index}].id`, null);
          formData.append(`GadgetDescriptions[${index}].image`, desc.file);
        } else if (desc.value) {
          formData.append(`GadgetDescriptions[${index}].value`, desc.value);
        }
      } else {
        formData.append(`GadgetDescriptions[${index}].text`, desc.value || '');
      }
    });

    let specIndex = 0;
    gadgetData.specificationValues.forEach((spec) => {
      spec.values.forEach((value) => {
        formData.append(`SpecificationValues[${specIndex}].id`, '');
        formData.append(`SpecificationValues[${specIndex}].specificationKeyId`, spec.specificationKeyId || '');
        formData.append(`SpecificationValues[${specIndex}].specificationUnitId`, spec.specificationUnitId || '');
        formData.append(`SpecificationValues[${specIndex}].value`, value);
        specIndex++;
      });
    });

    try {
      await AxiosInterceptor.post('/api/gadgets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Tạo sản phẩm thành công!");
      setTimeout(() => {
        navigate('/all-products');
      }, 3500);
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
    finally {
      setIsLoading(false);
    }
  };

  // Handle discount date formatting
  const handleDateChange = (date) => {
    if (date) {
      // Convert to ISO string format
      const isoDate = new Date(date).toISOString();
      setGadgetData((prev) => ({
        ...prev,
        discount: {
          ...prev.discount,
          discountExpiredDate: isoDate,
        },
      }));
    } else {
      setGadgetData((prev) => ({
        ...prev,
        discount: {
          ...prev.discount,
          discountExpiredDate: null,
        },
      }));
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
  const handleBrandChange = (e) => {
    setGadgetData((prev) => ({
      ...prev,
      brandId: e.target.value,
    }));
  };

  const handleCategoryChange = (e) => {
    setGadgetData((prev) => ({
      ...prev,
      categoryId: e.target.value,
      brandId: '', // Reset brand when category changes
    }));
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit(); // No event object needed now
    }
  };

  const handleImageUpload = (e, type) => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'thumbnail') {
      const file = files[0];
      if (file instanceof Blob) {
        setGadgetData(prev => ({ ...prev, thumbnailUrl: file }));
      }
    } else if (type === 'gallery') {
      const filesArray = Array.from(files).filter(file => file instanceof Blob);
      setGadgetData(prev => ({
        ...prev,
        gadgetImages: [...prev.gadgetImages, ...filesArray]
      }));
    }
  };

  const handleRemoveImage = (index) => {
    setGadgetData(prev => ({
      ...prev,
      gadgetImages: prev.gadgetImages.filter((_, i) => i !== index)
    }));
  };


  const handleDescriptionChange = (index, field, value) => {
    const newDescriptions = [...gadgetData.gadgetDescriptions];
    if (field === 'type' && value === 'Image') {
      newDescriptions[index] = { ...newDescriptions[index], type: value, value: '', file: null };
    } else {
      newDescriptions[index] = { ...newDescriptions[index], [field]: value || '' };
    }
    setGadgetData(prev => ({ ...prev, gadgetDescriptions: newDescriptions }));
  };


  const handleDescriptionImageChange = (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDescriptions = [...gadgetData.gadgetDescriptions];
      newDescriptions[index] = {
        ...newDescriptions[index],
        type: 'Image',
        value: URL.createObjectURL(file),
        file: file
      };
      setGadgetData(prev => ({ ...prev, gadgetDescriptions: newDescriptions }));
    }
  };

  const handleAddDescription = (index) => {
    setGadgetData(prev => {
      const newDescriptions = [...prev.gadgetDescriptions];
      newDescriptions.splice(index + 1, 0, { type: 'NormalText', value: '' });
      return { ...prev, gadgetDescriptions: newDescriptions };
    });
  };

  const handleRemoveDescription = (index) => {
    setGadgetData(prev => ({
      ...prev,
      gadgetDescriptions: prev.gadgetDescriptions.filter((_, i) => i !== index)
    }));
  };
  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...gadgetData.specificationValues];
    if (field === 'specificationKey') {
      newSpecs[index] = {
        ...newSpecs[index],
        specificationKeyId: value,
        specificationUnitId: '' // Reset unit when key changes
      };
    } else if (field === 'specificationUnit') {
      newSpecs[index] = {
        ...newSpecs[index],
        specificationUnitId: value
      };
    } else if (field === 'value') {
      newSpecs[index] = {
        ...newSpecs[index],
        value: value
      };
    }
    setGadgetData(prev => ({ ...prev, specificationValues: newSpecs }));
  };

  const handleValueChange = (specIndex, valueIndex, value) => {
    const newSpecs = [...gadgetData.specificationValues];
    if (!newSpecs[specIndex].values) {
      newSpecs[specIndex].values = [''];
    }
    newSpecs[specIndex].values[valueIndex] = value;
    setGadgetData(prev => ({ ...prev, specificationValues: newSpecs }));
  };
  const handleAddValue = (specIndex) => {
    const newSpecs = [...gadgetData.specificationValues];
    if (!newSpecs[specIndex].values) {
      newSpecs[specIndex].values = [];
    }
    newSpecs[specIndex].values.push('');
    setGadgetData(prev => ({ ...prev, specificationValues: newSpecs }));
  };
  const handleRemoveValue = (specIndex, valueIndex) => {
    const newSpecs = [...gadgetData.specificationValues];
    newSpecs[specIndex].values.splice(valueIndex, 1);
    setGadgetData(prev => ({ ...prev, specificationValues: newSpecs }));
  };

  /* Add a new specification */
  const handleAddSpecification = () => {
    setGadgetData(prev => ({
      ...prev,
      specificationValues: [
        ...prev.specificationValues,
        { specificationKeyId: '', specificationUnitId: '', values: [''] }
      ]
    }));
  };

  /* Remove a specification */
  const handleRemoveSpecification = (index) => {
    setGadgetData(prev => ({
      ...prev,
      specificationValues: prev.specificationValues.filter((_, i) => i !== index)
    }));
  };
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
              <input
                id="name"
                name="name"
                type="text"
                value={gadgetData.name}
                onChange={(e) => setGadgetData({ ...gadgetData, name: e.target.value })}
                className={inputClassName}
                placeholder="Nhập tên sản phẩm"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                id="categoryId"
                value={gadgetData.categoryId}
                onChange={handleCategoryChange}
                className={inputClassName}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="brandId" className="block text-sm font-medium text-gray-700">Thương hiệu</label>
              <select
                id="brandId"
                value={gadgetData.brandId}
                onChange={handleBrandChange}
                className={inputClassName}
                disabled={!gadgetData.categoryId}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá</label>
              <input
                id="price"
                type="number"
                value={gadgetData.price}
                onChange={(e) => setGadgetData({ ...gadgetData, price: e.target.value })}
                className={inputClassName}
                placeholder="Nhập giá sản phẩm"
              />
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Tình trạng</label>
              <input
                id="condition"
                type="text"
                value={gadgetData.condition}
                onChange={(e) => setGadgetData({ ...gadgetData, condition: e.target.value })}
                className={inputClassName}
                placeholder="Nhập tình trạng sản phẩm"
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
              <input
                id="quantity"
                type="number"
                value={gadgetData.quantity}
                onChange={(e) => setGadgetData({ ...gadgetData, quantity: e.target.value })}
                className={inputClassName}
                placeholder="Nhập số lượng"
              />
            </div>

            {/* New discount section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">Áp dụng giảm giá</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      if (!e.target.checked) {
                        // Clear discount values when disabled
                        setGadgetData(prev => ({
                          ...prev,
                          discount: { discountPercentage: '', discountExpiredDate: '' }
                        }));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {hasDiscount && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">Phần trăm giảm giá</label>
                    <input
                      id="discountPercentage"
                      type="number"
                      value={gadgetData.discount.discountPercentage}
                      onChange={(e) => setGadgetData({ ...gadgetData, discount: { ...gadgetData.discount, discountPercentage: e.target.value } })}
                      className={inputClassName}
                      placeholder="Nhập phần trăm giảm giá"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label htmlFor="discountExpiredDate" className="block text-sm font-medium text-gray-700">Ngày hết hạn giảm giá</label>
                    <div className="flex items-center">
                      <DatePicker
                        selected={gadgetData.discount.discountExpiredDate ? new Date(gadgetData.discount.discountExpiredDate) : null}
                        onChange={handleDateChange}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="dd/MM/yyyy HH:mm"
                        minDate={new Date()}
                        filterTime={filterPassedTime}
                        className={inputClassName}
                        placeholderText="Chọn ngày và giờ"
                      />
                      <Calendar className="ml-2" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
              <div className="relative w-full sm:w-1/2 md:w-1/3 aspect-square">
                <label
                  htmlFor="thumbnailUpload"
                  className="absolute inset-0 cursor-pointer border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                </label>
                <input
                  id="thumbnailUpload"
                  type="file"
                  onChange={(e) => handleImageUpload(e, 'thumbnail')}
                  className="hidden"
                />
                {gadgetData.thumbnailUrl && (
                  <>
                    <img
                      src={gadgetData.thumbnailUrl instanceof File ? URL.createObjectURL(gadgetData.thumbnailUrl) : gadgetData.thumbnailUrl}
                      alt="Thumbnail"
                      className="absolute inset-0 w-full h-full object-contain rounded"
                    />
                    <button
                      onClick={() => setGadgetData(prev => ({ ...prev, thumbnailUrl: null }))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      type="button"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</label>
              <div className="grid grid-cols-3 gap-4">
                {gadgetData.gadgetImages.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image instanceof Blob ? URL.createObjectURL(image) : (typeof image === 'string' ? image : '')}
                      alt={`Gadget ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-contain rounded"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      type="button"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="imageUpload"
                  className="cursor-pointer border-2 border-dashed border-gray-300 rounded flex items-center justify-center w-full h-32 hover:border-gray-400"
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  multiple
                  onChange={(e) => handleImageUpload(e, 'gallery')}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-black" />
                Mô tả sản phẩm
              </h3>
              {gadgetData.gadgetDescriptions.map((desc, index) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <div className="flex items-center space-x-4 mb-2">
                    <select
                      value={desc.type}
                      onChange={(e) => handleDescriptionChange(index, 'type', e.target.value)}
                      className="block w-1/3 rounded-md border-gray-300 shadow-sm focus:border-gray-200 focus:ring focus:ring-gray-400 focus:ring-opacity-50"
                    >
                      <option value="NormalText">Văn bản thường</option>
                      <option value="BoldText">Văn bản đậm</option>
                      <option value="Image">Hình ảnh</option>
                    </select>
                    {desc.type === 'Image' && (
                      <label htmlFor={`descImage-${index}`} className="cursor-pointer bg-primary/75 text-white px-4 py-2 rounded hover:bg-secondary/85 flex items-center">
                        <ImageIcon className="w-5 h-5 mr-2" />
                        Chọn ảnh
                      </label>
                    )}
                  </div>
                  {desc.type === 'Image' ? (
                    <div className="mt-2">
                      <input
                        id={`descImage-${index}`}
                        type="file"
                        onChange={(e) => handleDescriptionImageChange(e, index)}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full max-w-md mx-auto">
                        {desc.value ? (
                          <img
                            src={desc.value}
                            alt={`Description ${index + 1}`}
                            className="w-full h-64 object-contain rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={desc.value || ''}
                      onChange={(e) => handleDescriptionChange(index, 'value', e.target.value)}
                      className="w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-1"
                      rows={3}
                      placeholder="Nội dung mô tả"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleAddDescription(index)}
                      className="text-secondary/75 hover:text-secondary/85"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDescription(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {gadgetData.gadgetDescriptions.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleAddDescription()}
                  variant="outline"
                  className="w-full py-8 border-dashed border-2 text-secondary hover:text-secondary/85 flex items-center justify-center"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Thêm mô tả sản phẩm
                </button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clipboard className="w-6 h-6 mr-2 text-black" />
              Thông số kỹ thuật
            </h3>
            {gadgetData.specificationValues.map((spec, index) => (
              <div key={index} className="mb-4 p-4 border rounded relative">
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thông số</label>
                    <select
                      value={spec.specificationKeyId || ''}
                      onChange={(e) => handleSpecificationChange(index, 'specificationKey', e.target.value)}
                      className={`${inputClassName} overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
                    >
                      <option value="">Chọn thông số</option>
                      {specificationKeys
                        .filter(key => !gadgetData.specificationValues.some(s => s.specificationKeyId === key.id && s !== spec))
                        .map((key) => (
                          <option key={key.id} value={key.id}>{key.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                    <select
                      value={spec.specificationUnitId || ''}
                      onChange={(e) => handleSpecificationChange(index, 'specificationUnit', e.target.value)}
                      className={`${inputClassName} ${!specificationUnits[spec.specificationKeyId] ||
                        specificationUnits[spec.specificationKeyId].length === 0
                        ? 'text-gray-800'
                        : ''}`}
                      disabled={!specificationUnits[spec.specificationKeyId] || specificationUnits[spec.specificationKeyId].length === 0}
                    >
                      <option value="">Chọn đơn vị</option>
                      {specificationUnits[spec.specificationKeyId]?.map((unit) => (
                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị cho {specificationKeys.find(key => key.id === spec.specificationKeyId)?.name}
                  </label>
                  {(spec.values || ['']).map((value, valueIndex) => (
                    <div key={valueIndex} className="flex items-center mb-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleValueChange(index, valueIndex, e.target.value)}
                        className={`${inputClassName} flex-grow`}
                        placeholder="Nhập giá trị"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(index, valueIndex)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddValue(index)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary/80 hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    <Plus className="w-5 h-5 mr-1" /> Thêm giá trị
                  </button>
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAddSpecification(index)}
                    className="text-secondary/75 hover:text-secondary/85"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {gadgetData.specificationValues.length === 0 && (
              <button
                type="button"
                onClick={() => handleAddSpecification()}
                variant="outline"
                className="w-full py-8 border-dashed border-2 text-secondary hover:text-secondary/85 flex items-center justify-center"
              >
                <Plus className="w-6 h-6 mr-2" />
                Thêm thông số kỹ thuật
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary/85"></div>
        </div>
    );
}
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-8">Tạo sản phẩm mới</h1>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3, 4, 5].map((s, index) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s <= step ? 'bg-primary/75 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
                <span className={`mt-2 text-sm ${s === step ? 'font-semibold text-secondary/100' : 'text-gray-500'}`}>
                  {s === 1 ? 'Thông tin cơ bản' :
                    s === 2 ? 'Giá & Khuyến mãi' :
                      s === 3 ? 'Hình ảnh' :
                        s === 4 ? 'Mô tả' :
                          'Thông số kỹ thuật'}
                </span>
              </div>
              {index < 4 && (
                <div className={`flex-1 h-1 ${s < step ? 'bg-primary/75' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div>
        {renderStep()}
        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary/70 hover:bg-secondary/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
            </button>
          )}
          <button
            type="button"
            onClick={handleNextStep}
            className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary/95 hover:bg-secondary/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            {step < 5 ? (
              <>Tiếp theo <ArrowRight className="w-5 h-5 ml-2" /></>
            ) : (
              'Tạo sản phẩm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGadget;
