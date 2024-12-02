import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color.replace('border-l-4', 'text-opacity-80')}`} />
      </div>
    </div>
  );
};

export default StatCard;
