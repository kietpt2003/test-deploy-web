import React, { useState } from 'react';
import { Laptop, Headphones, Speaker, Smartphone } from 'lucide-react';
import GadgetManagement from './GadgetManagement';
import { ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const categoryIds = {
  laptop: "458d7752-e45e-444a-adf9-f7201c07acd1",
  headphones: "9f6ac480-e673-49ec-9bc0-7566cca80b86",
  speakers: "bb65a310-e28e-4226-a562-0b6ea27f4faa",
  phones: "ea4183e8-5a94-401c-865d-e000b5d2b72d"
};

const categoryNames = {
  "458d7752-e45e-444a-adf9-f7201c07acd1": "Laptop",
  "9f6ac480-e673-49ec-9bc0-7566cca80b86": "Tai nghe",
  "bb65a310-e28e-4226-a562-0b6ea27f4faa": "Loa",
  "ea4183e8-5a94-401c-865d-e000b5d2b72d": "Điện thoại"
};

const GadgetManagementPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(categoryIds.laptop);
  const navigate = useNavigate();

  // Add resetPage function
  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
  };

  const categoryIcons = {
    [categoryIds.laptop]: Laptop,
    [categoryIds.headphones]: Headphones,
    [categoryIds.speakers]: Speaker,
    [categoryIds.phones]: Smartphone
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
          <button 
            onClick={()=>navigate("/seller/gadgets/create")} 
            className="px-4 py-2 bg-primary/80 text-white rounded hover:bg-primary transition duration-200"
          >
            Tạo sản phẩm
          </button>
        </div>
        <div className="mb-8">
        <div className="flex space-x-2 overflow-x-auto bg-primary/10 p-1 rounded-lg">
          {Object.entries(categoryIds).map(([key, id]) => {
            const IconComponent = categoryIcons[id];
            return (
              <button
                key={key}
                onClick={() => handleCategoryChange(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === id 
                    ? "bg-primary/80 text-white" 
                    : "text-gray-600 hover:bg-primary/20"
                }`}
              >
                <IconComponent className="inline-block mr-2" />
                {categoryNames[id]}
              </button>
            );
          })}
        </div>
        </div>
      </div>
      <GadgetManagement categoryId={selectedCategory} />
    </div>
  );
};

export default GadgetManagementPage;