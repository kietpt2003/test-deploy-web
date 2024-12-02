import React, { useEffect, useState } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { Search, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryManage from './CategoryManage';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [page, searchValue]);

  const fetchCategories = async () => {
    try {
      const baseUrl = process.env.NODE_ENV === "development"
        ? `${process.env.REACT_APP_DEV_API}/api/categories`
        : `${process.env.REACT_APP_PRO_API}/api/categories`;


      const url = searchValue
        ? `${baseUrl}?Page=${page}&PageSize=10&Name=${searchValue}`
        : `${baseUrl}?Page=${page}&PageSize=10`;

      const response = await AxiosInterceptor.get(url);
      const totalItems = response.data.totalItems || 0;

      setCategories(response.data.items || []);
      setTotalPages(Math.ceil(totalItems / 10));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setTotalPages(0);
    }
  };

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
    setPage(1);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleModalClose = () => {
    closeModal(); 
    fetchCategories(); 
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/70"
          />
        </div>
        <div>
          <button
            onClick={openModal}
            className="flex items-center bg-primary/70 text-black font-medium px-4 py-2 rounded-md hover:bg-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo danh mục
          </button>
          <CategoryManage visible={isModalVisible} onClose={handleModalClose} />
        </div>
      </div>
      <div className="rounded-md border max-w-screen-lg mx-auto">
        <table className="w-full ">
          <thead>
            <tr className="border-b bg-primary/40">
              <th className="p-4 pl-5 text-left font-medium">ID</th>
              <th className="p-4 text-center font-medium">Tên danh mục</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <React.Fragment key={category.id}>
                <tr className="border-b">
                  <td className="p-4 pl-5">
                    {(page - 1) * 10 + (index + 1)}
                  </td>
                  <td className="p-4 text-center">{category.name} ({category.id})</td>
                </tr>
              </React.Fragment>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không tìm thấy danh mục!!!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <nav className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handleChangePage(pageNumber)}
              className={`px-4 py-2 rounded-md ${pageNumber === page ? 'bg-primary/70 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {pageNumber}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default CategoryPage;
