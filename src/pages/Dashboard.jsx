import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getRooms } from '../api/roomApi';
import Card from '../components/Card';
import Table from '../components/Table';
import LoadingSpinner from '../components/LoadingSpinner';
import { SalesLineChart, RevenueBarChart, TopDriversChart } from '../components/Chart';
import { useLanguage } from '../context/LanguageContext';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar,
  BarChart3,
  Building2
} from 'lucide-react';
import Button from '../components/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRooms();
    const interval = setInterval(() => {
      fetchStats();
      fetchRooms();
    }, 30000);
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

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
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
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('welcomeBack')}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card
          title={t('totalProducts')}
          value={stats.total_products}
          icon={Package}
          color="blue"
          subtitle={t('activeProducts')}
        />
        <Card
          title={t('totalDrivers')}
          value={stats.total_drivers}
          icon={Users}
          color="green"
          subtitle={t('activeDrivers')}
        />
        <Card
          title={t('totalRooms')}
          value={rooms.length}
          icon={Building2}
          color="indigo"
          subtitle={t('activeRooms')}
        />
        <Card
          title={t('totalSales')}
          value={stats.total_sales}
          icon={ShoppingCart}
          color="purple"
          subtitle={t('allTimeSales')}
        />
        <Card
          title={t('totalRevenue')}
          value={`$${parseFloat(stats.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="orange"
          subtitle={t('totalRevenueGenerated')}
        />
      </div>

      {/* Today's Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('todaysPerformance')}</h3>
            </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{t('live')}</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="border-r border-gray-200 dark:border-gray-700 pr-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('salesToday')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.today_sales || 0}</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('transactions')}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span>{t('activeDay')}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('revenueToday')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${parseFloat(stats.today_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{t('currentPeriod')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions')}</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/products')}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('addProduct')}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
            </button>
            <button
              onClick={() => navigate('/drivers')}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-300" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('addDriver')}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
            </button>
            <button
              onClick={() => navigate('/assign-stock')}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                  <Package className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('assignStock')}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
            </button>
            <button
              onClick={() => navigate('/rooms')}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('viewRooms')}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {stats.sales_by_day && stats.sales_by_day.length > 0 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('salesTrend')}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Last 7 Days</span>
              </div>
              <SalesLineChart data={stats.sales_by_day} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('revenueTrend')}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Last 7 Days</span>
              </div>
              <RevenueBarChart data={stats.sales_by_day} />
            </div>
          </>
        )}
      </div>

      {/* Top Drivers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {stats.top_drivers && stats.top_drivers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('topPerformingDrivers')}</h3>
              <Button variant="secondary" onClick={() => navigate('/drivers')} className="text-xs">
                {t('viewAll')}
              </Button>
            </div>
            <TopDriversChart data={stats.top_drivers} />
          </div>
        )}

        {/* Low Stock Alert */}
        {stats.low_stock_products.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border-l-4 border-red-500 border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lowStockAlert')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('productsRequiringAttention')}</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.low_stock_products.slice(0, 5).map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('productId')}: {item.product_id}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                      {item.quantity} {t('units')}
                    </span>
                  </div>
                </div>
              ))}
              {stats.low_stock_products.length > 5 && (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/warehouse-stock')}
                  className="w-full text-sm"
                >
                  {t('viewAllLowStockItems')} ({stats.low_stock_products.length})
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-8 text-center">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('stockStatusOptimal')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('noLowStock')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
