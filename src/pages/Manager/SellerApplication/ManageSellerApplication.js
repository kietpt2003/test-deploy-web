import React, { useState, useEffect, useCallback } from 'react'; 
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { Eye } from 'lucide-react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManageDetailApplication from './ManageDetailApplication';

const ManageSellerApplicationPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortByDate, setSortByDate] = useState('DESC');
  const [status, setStatus] = useState('All');
  const [totalPages, setTotalPages] = useState(0);

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const baseUrl = process.env.NODE_ENV === "development" 
        ? `${process.env.REACT_APP_DEV_API}/api/seller-applications` 
        : `${process.env.REACT_APP_PRO_API}/api/seller-applications`

      const response = await AxiosInterceptor.get(
        `${baseUrl}?SortByDate=${sortByDate}&Status=${status === 'All' ? '' : status}&Page=${page}&PageSize=${pageSize}`
      )
      setApplications(response.data.items)
      setTotalPages(Math.ceil(response.data.totalItems / pageSize))
    } catch (err) {
      setError('Không thể lấy danh sách đơn đăng ký')
      toast.error('Không thể lấy danh sách đơn đăng ký')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, sortByDate, status])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleViewDetails = async (id) => {
    try {
      const baseUrl = process.env.NODE_ENV === "development" 
        ? `${process.env.REACT_APP_DEV_API}/api/seller-applications` 
        : `${process.env.REACT_APP_PRO_API}/api/seller-applications`

      const response = await AxiosInterceptor.get(`${baseUrl}/${id}`)
      setSelectedApplication(response.data)
      setIsPopupOpen(true)
    } catch (err) {
      console.error('Không thể lấy chi tiết đơn đăng ký', err)
      toast.error('Không thể lấy chi tiết đơn đăng ký')
    }
  }

  const handleClosePopup = () => {
    setIsPopupOpen(false)
    fetchApplications()
  }

  const handleSortChange = (e) => {
    setSortByDate(e.target.value)
    setPage(1)  // Reset page to 1 when sort changes
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setPage(1)  // Reset page to 1 when status filter changes
  }

  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Quản Lý Đơn Đăng Ký</h2>

      <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="sort-by-date" className="text-sm font-medium text-gray-700">Sắp xếp theo ngày</label>
          <select
            id="sort-by-date"
            value={sortByDate}
            onChange={handleSortChange}
            className="w-full sm:w-[180px] px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
          >
            <option value="DESC">Mới nhất</option>
            <option value="ASC">Cũ nhất</option>
          </select>
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            id="status-filter"
            value={status}
            onChange={handleStatusChange}
            className="w-full sm:w-[180px] px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
          >
            <option value="All">Tất cả</option>
            <option value="Pending">Đang Chờ</option>
            <option value="Approved">Đã Duyệt</option>
            <option value="Rejected">Bị Từ Chối</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {applications.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-gray-500">Bạn chưa có đơn nào chờ xét duyệt</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Cửa Hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô Hình Kinh Doanh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex justify-center items-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{app.shopName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {app.businessModel === 'BusinessHousehold' ? 'Hộ Kinh Doanh' :
                      app.businessModel === 'Personal' ? 'Cá Nhân' :
                        app.businessModel === 'Company' ? 'Công Ty' : app.businessModel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.status === 'Pending' ? 'Đang Chờ' : app.status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(app.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center">
                    <button
                      onClick={() => handleViewDetails(app.id)}
                      className="text-primary hover:text-secondary transition-colors duration-200"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {isPopupOpen && selectedApplication && (
        <ManageDetailApplication
          application={selectedApplication}
          onClose={handleClosePopup}
          fetchApplications={fetchApplications}
        />
      )}
      <div className="flex justify-center mt-4">
        <nav className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => setPage(pageNumber)}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${pageNumber === page ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {pageNumber}
            </button>
          ))}
        </nav>
      </div>
      <ToastContainer />
    </div>
  )
}

export default ManageSellerApplicationPage;