import React, { useState, useEffect } from 'react'
import { Laptop, Headphones, Speaker, Smartphone, Plus, X, Redo2, Trash2, Search, List, PlusCircle } from 'lucide-react'
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import AxiosInterceptor from '~/components/api/AxiosInterceptor'

const categories = [
  { id: "458d7752-e45e-444a-adf9-f7201c07acd1", name: "Laptop", icon: Laptop },
  { id: "9f6ac480-e673-49ec-9bc0-7566cca80b86", name: "Tai nghe", icon: Headphones },
  { id: "bb65a310-e28e-4226-a562-0b6ea27f4faa", name: "Loa", icon: Speaker },
  { id: "ea4183e8-5a94-401c-865d-e000b5d2b72d", name: "Điện thoại", icon: Smartphone }
]

export default function SpecificationKeyPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id)
  const [isOpen, setIsOpen] = useState(false)
  const [newSpecName, setNewSpecName] = useState('')
  const [newSpecUnits, setNewSpecUnits] = useState([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [specificationKeys, setSpecificationKeys] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const [deleteMode, setDeleteMode] = useState({})
  const [showConfirmDelete, setShowConfirmDelete] = useState(null)
  const [showAddUnitModal, setShowAddUnitModal] = useState(null)
  const [newUnitName, setNewUnitName] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const itemsPerPage = 10

  const handleCategoryChange = (id) => {
    setSelectedCategory(id)
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchSpecificationKeys()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCreateSpec = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const response = await AxiosInterceptor.post('/api/specification-keys', {
        categoryId: selectedCategory,
        name: newSpecName,
        specificationUnits: newSpecUnits.filter(unit => unit.trim() !== '')
      })

      toast.success('Thông số đã được tạo thành công')

      setIsOpen(false)
      setNewSpecName('')
      setNewSpecUnits([''])
      fetchSpecificationKeys()
    } catch (error) {
      console.error('Error creating specification:', error)
      if (error.response?.data?.reasons?.length > 0) {
        error.response.data.reasons.forEach(reason => {
          toast.error(reason.message)
        })
      } else {
        toast.error('Không thể tạo thông số')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const addUnitField = () => {
    setNewSpecUnits([...newSpecUnits, ''])
  }

  const removeUnitField = (index) => {
    const updatedUnits = newSpecUnits.filter((_, i) => i !== index)
    setNewSpecUnits(updatedUnits)
  }

  const handleUnitChange = (index, value) => {
    const updatedUnits = [...newSpecUnits]
    updatedUnits[index] = value
    setNewSpecUnits(updatedUnits)
  }

  const fetchSpecificationKeys = async () => {
    try {
      setIsLoading(true)
      let url = `/api/specification-keys/categories/${selectedCategory}?Page=1&PageSize=100`
      if (searchTerm) {
        url += `&Name=${encodeURIComponent(searchTerm)}`
      }
      const response = await AxiosInterceptor.get(url)
      setSpecificationKeys(response.data.items)
    } catch (error) {
      console.error("Error fetching specification keys:", error)
      toast.error("Không thể tải danh sách thông số")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecificationKeys()
  }, [selectedCategory])

  const handleDeleteSpecificationKey = async (id) => {
    try {
      await AxiosInterceptor.delete(`/api/specification-keys/${id}`)
      toast.success('Đã xóa thông số thành công')
      fetchSpecificationKeys()
      setDeleteMode(prev => ({ ...prev, [id]: false }))
    } catch (error) {
      console.error('Error deleting specification key:', error)
      if (error.response && error.response.data && error.response.data.reasons) {
        const reasons = error.response.data.reasons;

        // Display the message from the first reason
        if (reasons.length > 0) {
          const reasonMessage = reasons[0].message;
          toast.error(reasonMessage);
        } else {
          toast.error('Không thể xóa thông số')
        }
      }

    }
  }

  const handleDeleteSpecificationUnit = async (id) => {
    try {
      await AxiosInterceptor.delete(`/api/specification-units/${id}`)
      toast.success('Đã xóa đơn vị thành công')
      fetchSpecificationKeys()
    } catch (error) {
      console.error('Error deleting specification unit:', error)
      if (error.response && error.response.data && error.response.data.reasons) {
        const reasons = error.response.data.reasons;

        // Display the message from the first reason
        if (reasons.length > 0) {
          const reasonMessage = reasons[0].message;
          toast.error(reasonMessage);
        } else {
          toast.error('Không thể xóa đơn vị')
        }
      }

    }
  }

  const handleAddSpecificationUnit = async (specificationKeyId) => {
    try {
      await AxiosInterceptor.post('/api/specification-units', {
        specificationKeyId: specificationKeyId,
        name: newUnitName
      })
      toast.success('Đã thêm đơn vị thành công')
      setNewUnitName('')
      fetchSpecificationKeys()
      setShowAddUnitModal(null)
    } catch (error) {
      console.error('Error adding specification unit:', error)
      toast.error('Không thể thêm đơn vị')
    }
  }

  const filteredKeys = specificationKeys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pageCount = Math.ceil(filteredKeys.length / itemsPerPage)
  const paginatedKeys = filteredKeys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const renderSpecificationUnits = (units, specKeyId) => {
    if (units.length === 0) return null
    return (
      <div className="flex flex-wrap gap-1">
        {units.map((unit) => (
          <span key={unit.id} className="px-2 py-1 bg-gray-200 text-xs rounded-full text-gray-600 flex items-center">
            {unit.name}
            {deleteMode[specKeyId] && (
              <button
                onClick={() => setShowConfirmDelete({ type: 'unit', id: unit.id })}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
      </div>
    )
  }

  const getPaginationRange = () => {
    const maxVisible = 5
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(start + maxVisible - 1, pageCount)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const toggleDeleteMode = (id) => {
    setDeleteMode(prev => ({ ...prev, [id]: !prev[id] }))
    setDropdownOpen(null)
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý đơn vị thông số kỹ thuật</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary/75 hover:bg-secondary/85 text-white font-bold py-2 px-4 rounded inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo thông số
          </button>
        </div>
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto bg-gray-100 p-1 rounded-lg">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === category.id
                    ? "bg-primary/75 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  <IconComponent className="inline-block mr-2" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tìm kiếm thông số..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary/80"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 cursor-pointer"
            onClick={handleSearch}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
            <div className="h-4 w-4 bg-white rounded-full"></div>
          </div>
          <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Loading...
          </span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên thông số
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn vị
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedKeys.map((specKey) => (
                  <tr key={specKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {specKey.name}
                      {deleteMode[specKey.id] && (
                        <button
                          onClick={() => setShowConfirmDelete({ type: 'key', id: specKey.id })}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderSpecificationUnits(specKey.specificationUnits, specKey.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownPosition({ top: rect.bottom, left: rect.left });
                            setDropdownOpen(dropdownOpen === specKey.id ? null : specKey.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <List className="h-5 w-5 ml-5" />
                        </button>

                        {dropdownOpen === specKey.id && (
                          <div
                            className="fixed w-48 bg-white rounded-md shadow-lg z-[9999]"
                            style={{
                              top: `${dropdownPosition.top}px`,
                              left: `${dropdownPosition.left}px`,
                            }}
                          >
                            <div className="py-1">
                              {deleteMode[specKey.id] ? (
                                <button
                                  onClick={() => toggleDeleteMode(specKey.id)}
                                  className="flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-100 hover:bg-blue-200 w-full"
                                >
                                  <Redo2 className="h-4 w-4 mr-2" />
                                  Hủy xóa
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleDeleteMode(specKey.id)}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setDropdownOpen(null);
                                  setShowAddUnitModal(specKey);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Thêm đơn vị
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center p-4 text-gray-500">Không có thông số kỹ thuật</div>
          )}

          <div className="flex justify-center mt-6 space-x-2">
            {getPaginationRange().map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`px-4 py-2 rounded-md ${pageNumber === currentPage
                  ? 'bg-primary/80 text-white'
                  : 'bg-gray-200 text-gray-700'
                  }`}
                disabled={isLoading}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo thông số mới</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/75"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên
              </label>
              <input
                id="name"
                type="text"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/75"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn vị
              </label>
              {newSpecUnits.map((unit, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => handleUnitChange(index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/75"
                  />
                  {index === newSpecUnits.length - 1 && (
                    <button
                      onClick={addUnitField}
                      className="ml-2 text-primary/75 hover:text-secondary/85"
                    >
                      <Plus className="h-6 w-6" />
                    </button>
                  )}
                  {index !== 0 && (
                    <button
                      onClick={() => removeUnitField(index)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleCreateSpec}
              disabled={isSubmitting}
              className="w-full bg-primary/75 hover:bg-secondary/85 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p className="mb-4">
              {showConfirmDelete.type === 'key'
                ? 'Bạn có chắc chắn muốn xóa thông số này và tất cả các đơn vị liên quan?'
                : 'Bạn có chắc chắn muốn xóa đơn vị này?'}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (showConfirmDelete.type === 'key') {
                    handleDeleteSpecificationKey(showConfirmDelete.id)
                  } else {
                    handleDeleteSpecificationUnit(showConfirmDelete.id)
                  }
                  setShowConfirmDelete(null)
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm đơn vị mới</h2>
            <p className="mb-2">Thêm đơn vị cho thông số: {showAddUnitModal.name}</p>
            <input
              type="text"
              value={newUnitName}
              onChange={(e) => setNewUnitName(e.target.value)}
              placeholder="Nhập tên đơn vị mới"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/75 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddUnitModal(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => handleAddSpecificationUnit(showAddUnitModal.id)}
                className="px-4 py-2 bg-primary/75 text-white rounded hover:bg-secondary/85"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}