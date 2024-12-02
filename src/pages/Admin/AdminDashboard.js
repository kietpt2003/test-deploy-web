import React, { useState, useEffect } from "react";
import { Users, Store, UserCog } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AxiosInterceptor from "~/components/api/AxiosInterceptor";

const AdminDashboard = () => {
  const [statistics, setStatistics] = useState({
    totalCustomers: 0,
    totalSellers: 0,
    totalManagers: 0,
    totalActive: 0,
    totalInactive: 0,
    totalPending: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await AxiosInterceptor.get(`/api/users?Page=1&PageSize=100`);
      const users = response.data.items;

      const totalCustomers = users.filter((user) => user.role === "Customer").length;
      const totalSellers = users.filter((user) => user.role === "Seller").length;
      const totalManagers = users.filter((user) => user.role === "Manager").length;

      const totalActive = users.filter((user) => user.status === "Active").length;
      const totalInactive = users.filter((user) => user.status === "Inactive").length;
      const totalPending = users.filter((user) => user.status === "Pending").length;

      setStatistics({ 
        totalCustomers, 
        totalSellers, 
        totalManagers,
        totalActive,
        totalInactive,
        totalPending
      });
    } catch (error) {
      console.error("Failed to fetch statistics", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleChartData = () => [
    { name: 'Khách hàng', value: statistics.totalCustomers },
    { name: 'Người bán', value: statistics.totalSellers },
    { name: 'Quản lý', value: statistics.totalManagers },
  ];

  const getStatusChartData = () => [
    { name: 'Hoạt động', value: statistics.totalActive },
    { name: 'Bị khóa', value: statistics.totalInactive },
    { name: 'Đang chờ', value: statistics.totalPending },
  ];

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-7 h-7 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-spin">
        <div className="h-4 w-4 bg-white rounded-full"></div>
      </div>
      <span className="ml-2 text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
        Loading...
      </span>
    </div>
  );

  const ROLE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  const STATUS_COLORS = ['#4CAF50', '#f44336', '#FF9800'];

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-6 border-b pb-2">Thống kê người dùng</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Khách hàng', count: statistics.totalCustomers, Icon: Users },
              { title: 'Người bán', count: statistics.totalSellers, Icon: Store },
              { title: 'Quản lý', count: statistics.totalManagers, Icon: UserCog },
            ].map(({ title, count, Icon }, index) => (
              <div
                key={index}
                className="bg-primary/10 rounded-lg p-6 shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-500">{title}</h3>
                  <Icon className="w-8 h-8 text-primary/80" />
                </div>
                <p className="text-2xl font-bold text-primary/80">{count}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-center mb-4 text-primary/80">Biểu đồ vai trò</h3>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getRoleChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getRoleChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-center mb-4 text-primary/80">Biểu đồ trạng thái</h3>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;