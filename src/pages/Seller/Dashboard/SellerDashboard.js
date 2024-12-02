import React, { useState, useEffect } from 'react';
import AxiosInterceptor from '~/components/api/AxiosInterceptor';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './chart/StatCard';
import { ShoppingBag, Package, Archive, Landmark, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];
const DAYS_OF_WEEK = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const CustomTooltip = ({ active, payload, type = "sales" }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = type === "sales" ? "#f6ae5c" : "#f67c3b";
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ minWidth: '150px' }}>
        <div className="bg-gray-100/80 px-3 py-1.5">
          <p className="text-sm text-gray-600">{data.date}</p>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>
              {type === "sales" ? "Doanh thu: " : "Đơn: "}
              <span className="font-semibold">
                {type === "sales" ? formatCurrency(data.salesRevenue) : data.value}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    numberOfGadgets: 0,
    numberOfSoldGadgets: 0,
    totalRevenue: 0,
    totalOfSellerOrders: 0
  });

  const [weeklyData, setWeeklyData] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [weeklyTotals, setWeeklyTotals] = useState({
    totalOrders: 0,
    totalRevenue: 0
  });

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDateTimeForTooltip = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const formatDateForAPI = (date) => {
    // Create a new Date object to avoid modifying the original date
    const adjustedDate = new Date(date);
    
    // Subtract 7 hours to adjust for Vietnam time
    adjustedDate.setHours(adjustedDate.getHours() + 7);
    
    // Format the adjusted date as ISO string and add 'Z' for UTC
    return adjustedDate.toISOString().split('.')[0] + 'Z';
  };

  const fetchDayData = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const [revenue, orders] = await Promise.all([
        AxiosInterceptor.get(`/api/stats/sales-revenue/seller?Start=${formatDateForAPI(startOfDay)}&End=${formatDateForAPI(endOfDay)}`),
        AxiosInterceptor.get(`/api/stats/number-of-seller-orders/seller?Start=${formatDateForAPI(startOfDay)}&End=${formatDateForAPI(endOfDay)}`)
      ]);

      return {
        date: formatDate(date),
        dayOfWeek: DAYS_OF_WEEK[date.getDay()],
        salesRevenue: revenue.data.salesRevenue,
        numberOfSellerOrders: orders.data.numberOfSellerOrders
      };
    } catch (error) {
      console.error('Error fetching day data:', error);
      return null;
    }
  };

  const fetchWeekData = async (start, end) => {
    try {
      const [gadgets, soldGadgets, weekRevenue, weekOrders] = await Promise.all([
        AxiosInterceptor.get('/api/stats/number-of-gadgets/seller'),
        AxiosInterceptor.get('/api/stats/number-of-sold-gadgets/seller'),
        AxiosInterceptor.get(`/api/stats/sales-revenue/seller?Start=${formatDateForAPI(start)}&End=${formatDateForAPI(end)}`),
        AxiosInterceptor.get(`/api/stats/number-of-seller-orders/seller?Start=${formatDateForAPI(start)}&End=${formatDateForAPI(end)}`)
      ]);

      setStats({
        numberOfGadgets: gadgets.data.numberOfGadgets,
        numberOfSoldGadgets: soldGadgets.data.numberOfSoldGadgets,
        totalRevenue: weekRevenue.data.totalRevenue,
        totalOfSellerOrders: weekOrders.data.totalOfSellerOrders
      });

      const weekPromises = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        return fetchDayData(date);
      });

      const weekData = await Promise.all(weekPromises);
      const validWeekData = weekData.filter(day => day !== null);

      setWeeklyData(validWeekData);

      // Calculate weekly totals
      const weeklyTotals = validWeekData.reduce((acc, day) => {
        acc.totalOrders += day.numberOfSellerOrders;
        acc.totalRevenue += day.salesRevenue;
        return acc;
      }, { totalOrders: 0, totalRevenue: 0 });

      setWeeklyTotals(weeklyTotals);

    } catch (error) {
      console.error('Error fetching week data:', error);
    }
  };

  useEffect(() => {
    const { start, end } = getWeekRange(currentWeekStart);
    fetchWeekData(start, end);
  }, [currentWeekStart]);

  const changeWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);

    const minDate = new Date('2024-10-14');
    const maxDate = new Date('2024-12-30');

    if (newDate >= minDate && newDate <= maxDate) {
      setCurrentWeekStart(newDate);
    }
  };

  const pieData = weeklyData.map(day => ({
    name: day.dayOfWeek,
    value: day.numberOfSellerOrders,
    date: day.date
  }));

  const { start, end } = getWeekRange(currentWeekStart);

  return (
    <div className="container mx-auto p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bảng thống kê bán hàng</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          icon={Landmark}
          color="border-l-4 border-green-500"
        />
        <StatCard
          title="Số đơn thành công"
          value={stats.totalOfSellerOrders}
          icon={ShoppingBag}
          color="border-l-4 border-blue-500"
        />
        <StatCard
          title="Số sản phẩm bán ra"
          value={stats.numberOfSoldGadgets}
          icon={Package}
          color="border-l-4 border-yellow-500"
        />
        <StatCard
          title="Tổng sản phẩm"
          value={stats.numberOfGadgets}
          icon={Archive}
          color="border-l-4 border-purple-500"
        />
      </div>

      <div className="flex justify-center items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <button
          onClick={() => changeWeek(-1)}
          className="text-primary/70 hover:text-secondary/85 transition duration-300 mr-4"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <Calendar className="text-gray-500 mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-700">
            {formatDate(start)} - {formatDate(end)}
          </h2>
        </div>
        <button
          onClick={() => changeWeek(1)}
          className="text-primary/70 hover:text-secondary/85 transition duration-300 ml-4"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Số đơn đặt hàng theo tuần</h2>
            <div className="text-sm text-gray-500">
              Tổng đơn: <span className="font-semibold text-gray-700">{weeklyTotals.totalOrders}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={(props) => <CustomTooltip {...props} type="orders" />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Doanh thu theo tuần</h2>
            <div className="text-sm text-gray-500">
              Tổng doanh thu: <span className="font-semibold text-gray-700">{formatCurrency(weeklyTotals.totalRevenue)}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayOfWeek" />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={(props) => <CustomTooltip {...props} type="sales" />} />
              <Legend />
              <Bar dataKey="salesRevenue" fill="#f6ae5c" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

