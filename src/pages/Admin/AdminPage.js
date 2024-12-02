import React, { useEffect, useState } from "react";
import AxiosInterceptor from "~/components/api/AxiosInterceptor";
import { Eye, X, Loader, User, Building, Store, MapPin, Briefcase, Mail, FileText, Phone, IdCard, Calendar, Shell, Search } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { FaGenderless } from "react-icons/fa";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  useEffect(() => {
    let url = `/api/users?Page=${page}&PageSize=${pageSize}`;
    
    if (currentSearchTerm.trim()) {
      url += `&Name=${encodeURIComponent(currentSearchTerm.trim())}`;
    }
    if (roleFilter !== 'all') {
      url += `&Role=${roleFilter}`;
    }
    if (statusFilter !== 'all') {
      url += `&Status=${statusFilter}`;
    }

    setIsLoading(true);
    AxiosInterceptor.get(url)
      .then((response) => {
        setUsers(response.data.items);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [roleFilter, statusFilter, page, pageSize, currentSearchTerm]);

  // Add new useEffect to reset currentPage when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Inactive":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getRoleInVietnamese = (role) => {
    switch (role) {
      case "Customer":
        return "Khách hàng";
      case "Seller":
        return "Người bán";
      case "Manager":
        return "Quản lý";
      default:
        return role;
    }
  };

  const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'unknown';
  };

  const renderUserInfo = (user) => {
    const renderField = (label, value) => {
      if (!value) return null; // Don't render if value is null/undefined/empty
      return (
        <div className="mb-4">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-base font-medium">{value}</p>
        </div>
      );
    };

    switch (user.role) {
      case "Manager":
        return (
          <div className="space-y-4">
          {user.manager?.fullName &&
            renderField(
              <>
                <User className="inline-block mr-2 text-primary/70" /> Tên quản lý
              </>,
              user.manager.fullName
            )}
          {renderField(
            <>
              <Mail className="inline-block mr-2 text-green-500" /> Email
            </>,
            user.email
          )}
        </div>
        );
      case "Seller":
        return (
          <div className="space-y-4">
      {user.seller?.companyName &&
        renderField(
          <>
            <Building className="inline-block mr-2 text-primary/70" /> Tên công ty
          </>,
          user.seller.companyName
        )}
      {user.seller?.shopName &&
        renderField(
          <>
            <Store className="inline-block mr-2 text-green-500" /> Tên cửa hàng
          </>,
          user.seller.shopName
        )}
      {user.seller?.shopAddress &&
        renderField(
          <>
            <MapPin className="inline-block mr-2 text-red-500" /> Địa chỉ cửa hàng
          </>,
          user.seller.shopAddress
        )}
      {user.seller?.businessModel &&
        renderField(
          <>
            <Briefcase className="inline-block mr-2 text-yellow-500" /> Mô hình kinh doanh
          </>,
          user.seller.businessModel
        )}
      {renderField(
        <>
          <Mail className="inline-block mr-2 text-purple-500" /> Email
        </>,
        user.email
      )}
      {user.seller?.businessRegistrationCertificateUrl && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            <FileText className="inline-block mr-2 text-gray-500" /> Giấy phép kinh doanh:
          </p>
          <div className="flex justify-center">
            {getFileType(user.seller.businessRegistrationCertificateUrl) === "image" ? (
              <img
                src={user.seller.businessRegistrationCertificateUrl}
                alt="Business Registration Certificate"
                className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer"
                onClick={() => {
                  setSelectedImage(user.seller.businessRegistrationCertificateUrl);
                  setIsImageModalOpen(true);
                }}
              />
            ) : getFileType(user.seller.businessRegistrationCertificateUrl) === "pdf" ? (
              <iframe
                src={user.seller.businessRegistrationCertificateUrl}
                title="Business Registration Certificate"
                className="w-full h-96 rounded-lg shadow-md"
              />
            ) : (
              <p>
                Không thể hiển thị file.{" "}
                <a
                  href={user.seller.businessRegistrationCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Tải xuống
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
        );
      case "Customer":
        return (
          <div className="space-y-4">
          {/* Avatar */}
          {user.customer?.avatarUrl && (
            <div className="flex justify-center mb-4">
              <img
                src={user.customer.avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 shadow-md"
              />
            </div>
          )}
    
          {/* Full Name */}
          {user.customer?.fullName &&
            renderField(
              <>
                <User className="inline-block mr-2 text-primary/70" /> Họ và tên
              </>,
              user.customer.fullName
            )}
    
          {/* Email */}
          {renderField(
            <>
              <Mail className="inline-block mr-2 text-green-500" /> Email
            </>,
            user.email
          )}
    
          {/* Phone Number */}
          {user.customer?.phoneNumber &&
            renderField(
              <>
                <Phone className="inline-block mr-2 text-yellow-500" /> Số điện thoại
              </>,
              user.customer.phoneNumber
            )}
    
          {/* Address */}
          {user.customer?.address &&
            renderField(
              <>
                <MapPin className="inline-block mr-2 text-red-500" /> Địa chỉ
              </>,
              user.customer.address
            )}
    
          {/* CCCD */}
          {user.customer?.cccd &&
            renderField(
              <>
                <IdCard className="inline-block mr-2 text-indigo-500" /> CCCD
              </>,
              user.customer.cccd
            )}
    
          {/* Gender */}
          {user.customer?.gender &&
            renderField(
              <>
                <Shell className="inline-block mr-2 text-pink-500" /> Giới tính
              </>,
              user.customer.gender
            )}
    
          {/* Date of Birth */}
          {user.customer?.dateOfBirth &&
            renderField(
              <>
                <Calendar className="inline-block mr-2 text-purple-500" /> Ngày sinh
              </>,
              new Date(user.customer.dateOfBirth).toLocaleDateString()
            )}
        </div>
        );
      default:
        return null;
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleStatusToggleClick = (user) => {
    setUserToToggle(user);
    setShowConfirmModal(true);
  };

  const handleConfirmStatusToggle = async () => {
    if (!userToToggle) return;
    
    setLoadingStates(prev => ({ ...prev, [userToToggle.id]: true }));
    try {
      const endpoint = userToToggle.status === "Active" 
        ? `/api/user/${userToToggle.id}/deactivate`
        : `/api/user/${userToToggle.id}/activate`;
      
      await AxiosInterceptor.put(endpoint);
      
      setUsers(prev => prev.map(user => {
        if (user.id === userToToggle.id) {
          return {
            ...user,
            status: userToToggle.status === "Active" ? "Inactive" : "Active"
          };
        }
        return user;
      }));
      
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      if (error.response?.data?.reasons?.[0]?.message) {
        toast.error(error.response.data.reasons[0].message);
      } else {
        toast.error("Thay đổi trạng thái thất bại, vui lòng thử lại");
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [userToToggle.id]: false }));
      setShowConfirmModal(false);
      setUserToToggle(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    setCurrentSearchTerm(searchQuery);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  const getPaginationRange = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(start + maxVisible - 1, totalPages);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

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

  return (
    <div className="container mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-semibold mb-4">Quản lý người dùng</h1>
      
      <div className="mb-6 flex gap-4 justify-between">
        {/* Replace search input with form */}
        <form onSubmit={handleSearch} className="relative w-64 flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/70"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary/75 text-white rounded hover:bg-secondary/85 focus:ring-offset-2"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        <div className="flex gap-4">
          {/* Existing role filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
              }}
              className="w-48 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/70 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="Customer">Khách hàng</option>
              <option value="Seller">Người bán</option>
              <option value="Manager">Quản lý</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Existing status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/70 focus:border-primary/70 appearance-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Bị khóa</option>
              <option value="Pending">Đang chờ</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getRoleInVietnamese(user.role)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {user.status === "Pending" ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Đang chờ
                      </span>
                    ) : (
                      <>
                        {loadingStates[user.id] ? (
                          <Loader className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={user.status === "Active"}
                              onChange={() => handleStatusToggleClick(user)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center p-4 text-gray-500">Không có người dùng</div>
      )}

      <div className="flex justify-center mt-6 space-x-2">
        {getPaginationRange().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setCurrentPage(pageNumber)}
            className={`px-4 py-2 rounded-md ${
              pageNumber === currentPage
                ? 'bg-primary/80 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            disabled={isLoading}
          >
            {pageNumber}
          </button>
        ))}
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
             onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Chi Tiết Người Dùng</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary/80" />
                    <h3 className="text-lg font-semibold text-gray-800">Thông Tin {getRoleInVietnamese(selectedUser.role)}</h3>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    {renderUserInfo(selectedUser)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
             onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && userToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Xác nhận thay đổi trạng thái
            </h3>
            <p className="text-gray-500 mb-6">
              Bạn có chắc chắn muốn {userToToggle.status === "Active" ? "khóa" : "mở khóa"} tài khoản này?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmStatusToggle}
                className="px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-md transition-colors duration-200"
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

export default AdminPage;