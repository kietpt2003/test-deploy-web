import React, { useState } from 'react';
import { Button, Input, Space, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import 'tailwindcss/tailwind.css';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryManage = ({ visible, onClose }) => {
  const [categories, setCategories] = useState([]);

  const addCategory = (parentId = 0) => {
    const newCategory = { id: Date.now(), parentId, name: '', children: [] };
    if (parentId === 0) {
      setCategories([...categories, newCategory]);
    } else {
      setCategories(updateCategories(categories, parentId, newCategory));
    }
  };

  const updateCategories = (cats, parentId, newCat) => {
    return cats.map(cat => {
      if (cat.id === parentId) {
        return { ...cat, children: [...cat.children, newCat] };
      }
      if (cat.children.length > 0) {
        return { ...cat, children: updateCategories(cat.children, parentId, newCat) };
      }
      return cat;
    });
  };

  const deleteCategory = (id) => {
    const removeCategory = (cats) => cats.filter(cat => cat.id !== id)
      .map(cat => ({ ...cat, children: removeCategory(cat.children) }));
    setCategories(removeCategory(categories));
  };

  const handleNameChange = (id, name) => {
    const updateName = (cats) => cats.map(cat => {
      if (cat.id === id) {
        return { ...cat, name };
      }
      if (cat.children.length > 0) {
        return { ...cat, children: updateName(cat.children) };
      }
      return cat;
    });
    setCategories(updateName(categories));
  };

  const saveCategories = async () => {
    const saveCategory = async (category) => {
      try {
        const payload = {
          name: category.name,
        };

        if (category.parentId !== 0) {
          payload.parentId = category.parentId;
        }

        const response = await AxiosInterceptor.post(
          process.env.NODE_ENV === "development"
            ? `${process.env.REACT_APP_DEV_API}/api/categories`
            : `${process.env.REACT_APP_PRO_API}/api/categories`,
          payload
        );

        return response.data.id;
      } catch (error) {
        console.error('Error saving category:', error);
        return null;
      }
    };

    const saveAllCategories = async (cats, parentId = 0) => {
      for (const cat of cats) {
        const newId = await saveCategory({ ...cat, parentId });
        if (newId && cat.children && cat.children.length > 0) {
          await saveAllCategories(cat.children, newId);
        }
      }
    };

    try {
      await saveAllCategories(categories);
      setCategories([]);
      onClose();
      toast.success("Lưu Thành Công");
    } catch (error) {
      toast.error("Thêm Thất Bại");
    }
  };
  const handleCancel = () => {
    setCategories([]);
    onClose();
  };

  const renderCategory = (cat) => (
    <div key={cat.id} className="ml-4 pt-2">
      <Space>
        {/* <Input
          value={cat.name}
          onChange={(e) => handleNameChange(cat.id, e.target.value)}
          placeholder="Nhập danh mục"
          className="w-64 border-primary"
        /> */}
        <input
          id="name"
          type="text"
          value={cat.name}
          onChange={(e) => handleNameChange(cat.id, e.target.value)}
          placeholder='Nhập danh mục'
          className="mt-1 block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary/40 focus:border-primary/40 sm:text-sm"
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => addCategory(cat.id)}
          style={{ backgroundColor: 'rgba(254, 169, 40, 0.6)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(254, 169, 40, 0.8)';
            e.currentTarget.style.borderColor = 'rgba(254, 169, 40, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(254, 169, 40, 0.6)';
            e.currentTarget.style.borderColor = 'rgba(254, 169, 40, 0.6)';
          }}
        />
        <Button
          type="danger"
          icon={<DeleteOutlined />}
          onClick={() => deleteCategory(cat.id)}
          className="hover:bg-red-400"
        />
      </Space>
      <div className="mt-2">
        {cat.children.map(child => renderCategory(child))}
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer />
      <Modal
        open={visible}
        onCancel={onClose}
        footer={[
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type='button'
              onClick={handleCancel}
              className="inline-flexjustify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              Hủy
            </button>,
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-primary/60 px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
              onClick={saveCategories}>
              Lưu
            </button>
          </div>
        ]}
      >
        <div>

          <button
            type="button"
            className=" justify-center rounded-md border border-transparent bg-primary/60 px-4 py-2 text-sm font-medium text-white hover:bg-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2"
            onClick={() => addCategory()}
          >
            <PlusOutlined /> Thêm danh mục con
          </button>
          <div>
            {categories.map(cat => renderCategory(cat))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CategoryManage;