import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Card from '../components/Card';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import { SalesLineChart, RevenueBarChart, TopDriversChart } from '../components/Chart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_drivers: 0,
    total_sales: 0,
    total_revenue: 0,
    today_sales: 0,
    today_revenue: 0,
    low_stock_products: [],
    sales_by_day: [],
    top_drivers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your inventory.</p>
      </div>
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Products"
          value={stats.total_products}
          icon="📦"
          color="blue"
        />
        <Card
          title="Total Drivers"
          value={stats.total_drivers}
          icon="👤"
          color="green"
        />
        <Card
          title="Total Sales"
          value={stats.total_sales}
          icon="💰"
          color="purple"
        />
        <Card
          title="Total Revenue"
          value={`$${parseFloat(stats.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💵"
          color="yellow"
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-blue-600">{stats.today_sales || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${parseFloat(stats.today_revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
              📦 Add New Product
            </button>
            <button className="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition">
              👤 Add New Driver
            </button>
            <button className="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition">
              📤 Assign Stock
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Chart */}
        {stats.sales_by_day && stats.sales_by_day.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
            <SalesLineChart data={stats.sales_by_day} />
          </div>
        )}

        {/* Revenue Chart */}
        {stats.sales_by_day && stats.sales_by_day.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h3>
            <RevenueBarChart data={stats.sales_by_day} />
          </div>
        )}
      </div>

      {/* Top Drivers Chart */}
      {stats.top_drivers && stats.top_drivers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Drivers</h3>
          <TopDriversChart data={stats.top_drivers} />
        </div>
      )}

      {/* Low Stock Alert */}
      {stats.low_stock_products.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Low Stock Alert</h2>
              <p className="text-gray-600 text-sm">Products that need restocking</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table
              headers={['Product ID', 'Product Name', 'Current Stock']}
              data={stats.low_stock_products}
              renderRow={(item) => (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      {item.quantity} units
                    </span>
                  </td>
                </>
              )}
            />
          </div>
        </div>
      )}

      {stats.low_stock_products.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">All Good!</h3>
          <p className="text-gray-600">No products are running low on stock.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
