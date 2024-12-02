import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PlusCircle, XCircle, Info, Upload } from 'lucide-react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SellerApplication = () => {
  const { register, handleSubmit, watch, formState: { errors }, setValue, control } = useForm({
    defaultValues: {
      BusinessModel: 'Cá Nhân'
    }
  });
  const [billingMails, setBillingMails] = useState(['']);
  const [previewFile, setPreviewFile] = useState(null);
  const BusinessModel = watch('BusinessModel');

  useEffect(() => {
    if (BusinessModel === 'Cá Nhân') {
      setValue('CompanyName', '');
      setValue('BusinessRegistrationCertificate', null);
      setPreviewFile(null);
    }
  }, [BusinessModel, setValue]);

  const businessModelMapping = {
    'Cá Nhân': 'Personal',
    'Hộ Kinh Doanh': 'BusinessHousehold',
    'Công Ty': 'Company',
  };

  const onSubmit = async (data) => {
    const businessModelInEnglish = businessModelMapping[data.BusinessModel] || data.BusinessModel;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'BusinessModel') {
        formData.append(key, businessModelInEnglish);
      } else if (key === 'BusinessRegistrationCertificate') {
        // The file is now properly handled by the Controller
        if (value && value.length > 0) {
          formData.append(key, value[0]);
        }
      } else {
        formData.append(key, value);
      }
    });

    billingMails.forEach(email => {
      if (email !== '') {
        formData.append('BillingMails', email);
      }
    });


    try {
      const baseUrl = process.env.NODE_ENV === "development"
        ? `${process.env.REACT_APP_DEV_API}/api/seller-applications`
        : `${process.env.REACT_APP_PRO_API}/api/seller-applications`;

      const response = await AxiosInterceptor.post(baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });


      if (response.status >= 200 && response.status < 300) {
        toast.success('Đơn Đăng Ký đã được gửi thành công!');
      } else if (response.status >= 400 && response.status < 500) {
        const errorMessage = response.data.reasons?.[0]?.message || 'Vui lòng thử lại.';
        toast.error(`${errorMessage}`);
      } else {
        toast.error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      toast.error(`${errorMessage}`);
    }
  };

  const addBillingMail = () => setBillingMails([...billingMails, '']);
  const removeBillingMail = (index) => {
    const newMails = billingMails.filter((_, i) => i !== index);
    setBillingMails(newMails);
  };

  const handleFileChange = (e, onChange) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
      onChange(e.target.files); // This updates the form state
    } else {
      setPreviewFile(null);
      onChange(null);
    }
  };

  const renderPreview = useMemo(() => {
    if (!previewFile) return null;
  
    const fileUrl = URL.createObjectURL(previewFile);
  
    if (previewFile.type.startsWith('image/')) {
      return (
        <img 
          src={fileUrl} 
          alt="Preview" 
          className="mt-4 max-w-full h-auto max-h-96 object-contain rounded-md" 
        />
      );
    } else if (previewFile.type === 'application/pdf') {
      return (
        <iframe
          src={fileUrl}
          title="PDF Preview"
          width="100%"
          height="500px"
          className="mt-4 border border-gray-300 rounded-md"
        >
          Your browser does not support PDFs.
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
        </iframe>
      );
    }
  
    return <p className="mt-2 text-sm text-gray-500">Unsupported file type</p>;
  }, [previewFile]);
  

  const inputClassName = "mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4 py-2";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Đơn Đăng Ký Người Bán</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ShopName" className="block text-sm font-medium text-gray-700">Tên Cửa Hàng</label>
            <input
              {...register('ShopName', { required: 'Tên cửa hàng là bắt buộc' })}
              id="ShopName"
              type="text"
              className={inputClassName}
            />
            {errors.ShopName && <p className="mt-1 text-sm text-red-600">{errors.ShopName.message}</p>}
          </div>

          <div>
            <label htmlFor="ShopAddress" className="block text-sm font-medium text-gray-700">Địa Chỉ Cửa Hàng</label>
            <input
              {...register('ShopAddress', { required: 'Địa chỉ cửa hàng là bắt buộc' })}
              id="ShopAddress"
              type="text"
              className={inputClassName}
            />
            {errors.ShopAddress && <p className="mt-1 text-sm text-red-600">{errors.ShopAddress.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="BusinessModel" className="block text-sm font-medium text-gray-700">Mô Hình Kinh Doanh</label>
          <select
            {...register('BusinessModel', { required: 'Mô hình kinh doanh là bắt buộc' })}
            id="BusinessModel"
            className={inputClassName}
          >
            <option value="Cá Nhân">Cá Nhân</option>
            <option value="Hộ Kinh Doanh">Hộ Kinh Doanh</option>
            <option value="Công Ty">Công Ty</option>
          </select>
          {errors.BusinessModel && <p className="mt-1 text-sm text-red-600">{errors.BusinessModel.message}</p>}
        </div>

        {BusinessModel !== 'Cá Nhân' && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-400 mr-2" />
              <p className="text-sm text-blue-700">
                Tên Công Ty và Giấy Chứng Nhận Đăng Ký Kinh Doanh là bắt buộc cho mô hình Hộ Kinh Doanh và Công Ty.
              </p>
            </div>
          </div>
        )}

        {BusinessModel !== 'Cá Nhân' && (
          <>
            <div>
              <label htmlFor="CompanyName" className="block text-sm font-medium text-gray-700">Tên Công Ty</label>
              <input
                {...register('CompanyName', { required: 'Tên công ty là bắt buộc cho mô hình kinh doanh này' })}
                id="CompanyName"
                type="text"
                className={inputClassName}
              />
              {errors.CompanyName && <p className="mt-1 text-sm text-red-600">{errors.CompanyName.message}</p>}
            </div>

            <div>
              <label htmlFor="BusinessRegistrationCertificate" className="block text-sm font-medium text-gray-700">
                Giấy Chứng Nhận Đăng Ký Kinh Doanh
              </label>
              <Controller
                name="BusinessRegistrationCertificate"
                control={control}
                rules={{
                  required: 'Giấy chứng nhận đăng ký kinh doanh là bắt buộc cho mô hình kinh doanh này',
                  validate: {
                    fileFormat: (files) => {
                      if (files && files.length > 0) {
                        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                        return validTypes.includes(files[0].type) || 'Tệp phải là JPEG, JPG, PNG hoặc PDF';
                      }
                      return true;
                    }
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <input
                      id="BusinessRegistrationCertificate"
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, onChange)}
                      onBlur={onBlur}
                    />
                    <label
                      htmlFor="BusinessRegistrationCertificate"
                      className="cursor-pointer inline-flex items-center bg-white py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Tải Lên Ảnh hoặc PDF
                    </label>
                    {value && <span className="ml-2">{value[0]?.name}</span>}
                  </>
                )}
              />
              {errors.BusinessRegistrationCertificate && (
                <p className="mt-1 text-sm text-red-600">{errors.BusinessRegistrationCertificate.message}</p>
              )}
              {renderPreview}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="TaxCode" className="block text-sm font-medium text-gray-700">Mã Số Thuế</label>
            <input
              {...register('TaxCode', {
                required: 'Mã số thuế là bắt buộc',
                pattern: {
                  value: /^[0-9]+$/, 
                  message: 'Mã số thuế chỉ được phép là số'
                }
              })}
              id="TaxCode"
              type="text"
              className={inputClassName}
            />
            {errors.TaxCode && <p className="mt-1 text-sm text-red-600">{errors.TaxCode.message}</p>}
          </div>

          <div>
            <label htmlFor="PhoneNumber" className="block text-sm font-medium text-gray-700">Số Điện Thoại</label>
            <input
              {...register('PhoneNumber', {
                required: 'Số điện thoại là bắt buộc',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại phải có 10-11 chữ số'
                }
              })}
              id="PhoneNumber"
              type="tel"
              className={inputClassName}
            />
            {errors.PhoneNumber && <p className="mt-1 text-sm text-red-600">{errors.PhoneNumber.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Thanh Toán</label>
          {billingMails.map((email, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newMails = [...billingMails];
                  newMails[index] = e.target.value;
                  setBillingMails(newMails);
                }}
                className={`${inputClassName} flex-grow`}
                placeholder="Nhập email"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeBillingMail(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <XCircle size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addBillingMail}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary/70 hover:bg-secondary/85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            <PlusCircle size={16} className="mr-2" />
            Thêm Email
          </button>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary/85 hover:bg-secondary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            Gửi Đơn Đăng Ký
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default SellerApplication;