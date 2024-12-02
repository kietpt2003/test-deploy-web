import React, { useState } from 'react'; 
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, User, Briefcase, Phone, Mail, FileText } from 'lucide-react';

const ManageDetailApplication = ({ application, onClose, fetchApplications }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  // Định nghĩa baseUrl
  const baseUrl = process.env.NODE_ENV === "development"
    ? `${process.env.REACT_APP_DEV_API}/api/seller-applications`
    : `${process.env.REACT_APP_PRO_API}/api/seller-applications`;

  const handleApprove = async () => {
    try {
      const response = await AxiosInterceptor.put(`${baseUrl}/${application.id}/approve`);
      if (response.status >= 200 && response.status < 300) {
        toast.success('Đơn đã được phê duyệt thành công!');
        setTimeout(async () => {
          await fetchApplications();
          onClose();
        }, 1000);
      } else {
        toast.error('Không thể phê duyệt đơn.');
      }
    } catch (error) {
      console.error('Lỗi khi phê duyệt đơn:', error);
      toast.error('Không thể phê duyệt đơn.');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      toast.error('Vui lòng nhập lý do từ chối.');
      return;
    }

    setIsRejecting(true);
    try {
      const response = await AxiosInterceptor.put(`${baseUrl}/${application.id}/reject`, {
        rejectReason: rejectReason,
      });
      if (response.status >= 200 && response.status < 300) {
        toast.success('Đơn đã bị từ chối thành công!');
        setTimeout(async () => {
          await fetchApplications();
          onClose();
        }, 1000);
      } else {
        toast.error('Không thể từ chối đơn.');
      }
    } catch (error) {
      console.error('Lỗi khi từ chối đơn:', error);
      toast.error('Không thể từ chối đơn.');
    } finally {
      setIsRejecting(false);
    }
  };

  const toggleRejectInput = () => {
    setShowRejectInput(!showRejectInput);
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'Pending' ? 'Đang Chờ' : status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}
      </span>
    );
  };

  const businessModelTranslation = {
    BusinessHousehold: 'Hộ Kinh Doanh',
    Personal: 'Cá Nhân',
    Company: 'Công Ty',
  };

  const ConfirmationPopup = ({ onConfirm, onCancel, title, message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Hủy
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-primary/75 text-white rounded hover:bg-secondary/85">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Chi Tiết Đơn Đăng Ký</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary/80" />
                <h3 className="text-lg  font-semibold text-gray-800">Thông Tin Cửa Hàng</h3>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Tên Cửa Hàng:</span> {application.shopName}</p>
                <p><span className="font-medium">Địa Chỉ Cửa Hàng:</span> {application.shopAddress}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-primary/80" />
                <h3 className="text-lg font-semibold text-gray-800">Thông Tin Doanh Nghiệp</h3>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Mô Hình Kinh Doanh:</span> {businessModelTranslation[application.businessModel] || application.businessModel}</p>
                {application.companyName && <p><span className="font-medium">Tên Công Ty:</span> {application.companyName}</p>}
                <p><span className="font-medium">Mã Số Thuế:</span> {application.taxCode}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary/80" />
              <h3 className="text-lg font-semibold text-gray-800">Thông Tin Liên Hệ</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Số Điện Thoại:</span> {application.phoneNumber}</p>
              {application.billingMailApplications.length > 0 && (
                <div>
                  <span className="font-medium">Email Thanh Toán:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {application.billingMailApplications.map((email, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{email.mail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary/80" />
              <h3 className="text-lg font-semibold text-gray-800">Trạng Thái Đơn Đăng Ký</h3>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Trạng Thái:</span>
                <StatusBadge status={application.status} />
              </div>
              <div className="flex items-center space-x-2">
                <p><span className="font-medium">Ngày Tạo:</span> {new Date(application.createdAt).toLocaleString()}</p>
              </div>
              {application.rejectReason && (
                <p><span className="font-medium">Lý Do Từ Chối:</span> {application.rejectReason}</p>
              )}
            </div>
          </div>
          {application.businessRegistrationCertificateUrl && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-primary/80" />
                <h3 className="text-lg font-semibold text-gray-800">Giấy Đăng Ký Kinh Doanh</h3>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                {getFileType(application.businessRegistrationCertificateUrl) === 'image' ? (
                  <img
                    src={application.businessRegistrationCertificateUrl}
                    alt="Giấy Đăng Ký Kinh Doanh"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                ) : getFileType(application.businessRegistrationCertificateUrl) === 'pdf' ? (
                  <iframe
                    src={application.businessRegistrationCertificateUrl}
                    title="Giấy Đăng Ký Kinh Doanh"
                    className="w-full h-96 rounded-lg shadow-md"
                  />
                ) : (
                  <p>Không thể hiển thị file. <a href={application.businessRegistrationCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tải xuống</a></p>
                )}
              </div>
            </div>
          )}
        </div>

        {application.status === 'Pending' && (
          <div className="p-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hành Động</h3>
            <div className="flex space-x-4">
              <button onClick={() => setShowApproveConfirm(true)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                Phê Duyệt
              </button>
              <button onClick={toggleRejectInput} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                {showRejectInput ? 'Ẩn' : 'Từ Chối'}
              </button>
            </div>
            {showRejectInput && (
              <div className="mt-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  className="border border-gray-300 rounded-md p-2 w-full"
                  rows="3"
                />
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setShowRejectConfirm(true)} 
                    className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ${!rejectReason.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!rejectReason.trim()}
                  >
                    Xác nhận từ chối
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showApproveConfirm && (
        <ConfirmationPopup
          onConfirm={() => {
            setShowApproveConfirm(false);
            handleApprove();
          }}
          onCancel={() => setShowApproveConfirm(false)}
          title="Xác nhận phê duyệt"
          message="Bạn có chắc chắn muốn phê duyệt đơn đăng ký này không?"
        />
      )}

      {showRejectConfirm && (
        <ConfirmationPopup
          onConfirm={() => {
            setShowRejectConfirm(false);
            handleReject();
          }}
          onCancel={() => setShowRejectConfirm(false)}
          title="Xác nhận từ chối"
          message="Bạn có chắc chắn muốn từ chối đơn đăng ký này không?"
        />
      )}
    </div>
  );
};

export default ManageDetailApplication;