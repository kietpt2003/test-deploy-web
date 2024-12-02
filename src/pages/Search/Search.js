import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { IoMdSearch } from 'react-icons/io';
import { FaTrash, FaHistory } from 'react-icons/fa';
import slugify from '~/ultis/config';
import { useNavigate, Link } from 'react-router-dom';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchSearchHistory();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      try {
        const response = await AxiosInterceptor.get(`/api/gadgets?Name=${searchQuery}&Page=1&PageSize=100`);
        setSearchResults(response.data.items);
        setShowModal(true);
        if (isAuthenticated) {
          await fetchSearchHistory();
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await AxiosInterceptor.get("/api/keyword-histories");
      setSearchHistory(response.data); // API returns array of {id, keyword} objects
      
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
      await AxiosInterceptor.delete(`/api/keyword-histories/${id}`);
      fetchSearchHistory();
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const deleteAllHistory = async () => {
    try {
      await AxiosInterceptor.delete("/api/keyword-histories/all");
      setSearchHistory([]);
    } catch (error) {
      console.error('Error deleting all history:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
      setShowHistory(false);
    }
  };

  return (
    <div className="relative group hidden sm:block">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearch}
        onFocus={() => isAuthenticated && setShowHistory(true)}
        placeholder="Tìm kiếm"
        className="w-[400px] sm:w-[400px] group-hover:w-[400px] transition-all duration-300 rounded-full border border-gray-300 px-2 py-1 focus:outline-none focus:border-1 focus:border-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
      />
      <IoMdSearch
        className="text-gray-500 group-hover:text-primary dark:text-gray-400 dark:group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3 cursor-pointer"
        onClick={handleSearch}
      />

      {showHistory && !showModal && (
        <div
          ref={modalRef}
          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50"
        >
          {isAuthenticated ? (
            <>
              <div className="flex justify-between items-center p-2 border-b dark:border-gray-600">
                <span className="text-sm font-medium flex items-center">
                  <FaHistory className="mr-2" /> Lịch sử tìm kiếm
                </span>
                {searchHistory.length > 0 && (
                  <button
                    onClick={deleteAllHistory}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              {searchHistory.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.keyword);
                        handleSearch({ key: 'Enter' });
                      }}
                      className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <span className="text-sm dark:text-gray-300">{item.keyword}</span>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-gray-500 dark:text-gray-400">Không có lịch sử tìm kiếm</div>
              )}
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-2">Vui lòng đăng nhập để xem lịch sử tìm kiếm</p>
              <Link
                to="/login"
                className="text-primary hover:text-primary-dark font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div
          ref={modalRef}
          className={`absolute top-full mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden ${searchResults.length > 0 ? 'max-h-[500px] overflow-y-auto' : ''
            }`}
        >
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => navigate(`/gadget/detail/${slugify(result.name)}`, {
                  state: {
                    productId: result.id,
                  }
                })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
              >
                <img src={result.thumbnailUrl} alt={result.name} className="w-12 h-12 object-contain rounded mr-4" />
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-white">{result.name}</h3>
                  <div className="text-gray-500 dark:text-gray-400">
                    {result.discountPercentage > 0 ? (
                      <>
                        <span className="text-red-500 dark:text-red-400 text-xs mr-3">{result.discountPrice.toLocaleString()}₫</span>
                        <span className="text-xs line-through">{result.price.toLocaleString()}₫</span>
                        <span className="bg-red-100 dark:bg-red-900 text-xs text-red-600 dark:text-red-300 rounded-full ml-2 px-2 py-1">-{result.discountPercentage}%</span>
                      </>
                    ) : (
                      <span className="text-xs">{result.price.toLocaleString()}₫</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchComponent;