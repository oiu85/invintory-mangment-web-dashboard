import { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getRooms } from '../api/roomApi';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import PageHeader from '../components/layout/PageHeader';
import { SalesLineChart, RevenueBarChart, TopDriversChart } from '../components/Chart';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
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
import Button from '../components/ui/Button';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isDark } = useTheme();
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
  const [error, setError] = useState(null);

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
      setError(null);
      const response = await axiosClient.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || t('errorLoadingData'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchStats();
    fetchRooms();
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, loading: cardLoading }) => {
    const colorConfigs = {
      blue: {
        gradient: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
      },
      green: {
        gradient: 'from-green-500 to-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20',
        iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
        text: 'text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
      },
      purple: {
        gradient: 'from-purple-500 to-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
      },
      orange: {
        gradient: 'from-orange-500 to-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
      },
      indigo: {
        gradient: 'from-indigo-500 to-indigo-600',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-200 dark:border-indigo-800',
      },
    };

    const config = colorConfigs[color] || colorConfigs.blue;

    if (cardLoading) {
      return (
        <Card variant="glass" className="overflow-hidden">
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <Skeleton variant="avatar" />
              <Skeleton variant="text" className="w-16" />
            </div>
            <Skeleton variant="title" className="mb-2" />
            <Skeleton variant="text" className="w-24" />
          </Card.Body>
        </Card>
      );
    }

    return (
      <Card variant="glass" hover className="overflow-hidden relative group">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        <Card.Body compact>
          <div className="flex items-center justify-between mb-3">
            <div className={`${config.iconBg} p-2.5 rounded-xl shadow-elevated-md group-hover:scale-110 transition-transform duration-300`}>
              {Icon && <Icon className="w-5 h-5 text-white" />}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1 uppercase tracking-wide">{title}</p>
            <p className={`text-2xl font-bold ${config.text} mb-1`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={t('dashboard')}
          subtitle={t('welcomeBack')}
        />
        <ErrorState
          title={t('errorLoadingDashboard')}
          message={error}
          onRetry={handleRetry}
          retryLabel={t('retry')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('dashboard')}
        subtitle={t('welcomeBack')}
        actions={
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        }
      />
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <StatCard key={i} loading={true} />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title={t('totalProducts')}
              value={stats.total_products}
              icon={Package}
              color="blue"
              subtitle={t('activeProducts')}
            />
            <StatCard
              title={t('totalDrivers')}
              value={stats.total_drivers}
              icon={Users}
              color="green"
              subtitle={t('activeDrivers')}
            />
            <StatCard
              title={t('totalRooms')}
              value={rooms.length}
              icon={Building2}
              color="indigo"
              subtitle={t('activeRooms')}
            />
            <StatCard
              title={t('totalSales')}
              value={stats.total_sales}
              icon={ShoppingCart}
              color="purple"
              subtitle={t('allTimeSales')}
            />
            <StatCard
              title={t('totalRevenue')}
              value={`$${parseFloat(stats.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              color="orange"
              subtitle={t('totalRevenueGenerated')}
            />
          </>
        )}
      </div>

      {/* Today's Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Today's Performance */}
        <Card variant="glass" className="lg:col-span-2">
          <Card.Header compact>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-primary p-2 rounded-lg shadow-sm">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('todaysPerformance')}</h3>
              </div>
              <span className="text-xs font-semibold bg-gradient-success text-white px-2.5 py-1 rounded-full shadow-sm">{t('live')}</span>
            </div>
          </Card.Header>
          <Card.Body compact>
            {loading ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Skeleton variant="text" className="w-24 mb-2" />
                  <Skeleton variant="heading" className="mb-2" />
                  <Skeleton variant="text" className="w-32" />
                </div>
                <div>
                  <Skeleton variant="text" className="w-24 mb-2" />
                  <Skeleton variant="heading" className="mb-2" />
                  <Skeleton variant="text" className="w-32" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="border-r border-neutral-200 dark:border-neutral-700 pr-6">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">{t('salesToday')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.today_sales || 0}</p>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('transactions')}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-success-600 dark:text-success-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>{t('activeDay')}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">{t('revenueToday')}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                      ${parseFloat(stats.today_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{t('currentPeriod')}</span>
                  </div>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        <Card variant="glass">
          <Card.Header compact>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('quickActions')}</h3>
          </Card.Header>
          <Card.Body compact>
            <div className="space-y-1.5">
              <button
                onClick={() => navigate('/products')}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 hover:from-primary-100/70 hover:to-secondary-100/70 dark:hover:from-primary-800/30 dark:hover:to-secondary-800/30 rounded-lg transition-all text-left group hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-primary p-1.5 rounded-lg shadow-sm">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{t('addProduct')}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/drivers')}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-success-50/50 to-primary-50/50 dark:from-success-900/20 dark:to-primary-900/20 hover:from-success-100/70 hover:to-primary-100/70 dark:hover:from-success-800/30 dark:hover:to-primary-800/30 rounded-lg transition-all text-left group hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-success p-1.5 rounded-lg shadow-sm">
                    <Users className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{t('addDriver')}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-success-600 dark:group-hover:text-success-400 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/assign-stock')}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-secondary-50/50 to-purple-50/50 dark:from-secondary-900/20 dark:to-purple-900/20 hover:from-secondary-100/70 hover:to-purple-100/70 dark:hover:from-secondary-800/30 dark:hover:to-purple-800/30 rounded-lg transition-all text-left group hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-secondary p-1.5 rounded-lg shadow-sm">
                    <Package className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{t('assignStock')}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/rooms')}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100/70 hover:to-purple-100/70 dark:hover:from-indigo-800/30 dark:hover:to-purple-800/30 rounded-lg transition-all text-left group hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-lg shadow-sm">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{t('viewRooms')}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Charts Section */}
      {stats.sales_by_day && stats.sales_by_day.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card variant="glass">
            <Card.Header compact>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('salesTrend')}</h3>
                <span className="text-xs font-semibold bg-gradient-primary text-white px-2.5 py-1 rounded-full shadow-sm">Last 7 Days</span>
              </div>
            </Card.Header>
            <Card.Body compact>
              <SalesLineChart data={stats.sales_by_day} isDark={isDark} />
            </Card.Body>
          </Card>
          <Card variant="glass">
            <Card.Header compact>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('revenueTrend')}</h3>
                <span className="text-xs font-semibold bg-gradient-primary text-white px-2.5 py-1 rounded-full shadow-sm">Last 7 Days</span>
              </div>
            </Card.Header>
            <Card.Body compact>
              <RevenueBarChart data={stats.sales_by_day} isDark={isDark} />
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Top Drivers & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {stats.top_drivers && stats.top_drivers.length > 0 && (
          <Card variant="glass">
            <Card.Header compact>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('topPerformingDrivers')}</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/drivers')}>
                  {t('viewAll')}
                </Button>
              </div>
            </Card.Header>
            <Card.Body compact>
              <TopDriversChart data={stats.top_drivers} isDark={isDark} />
            </Card.Body>
          </Card>
        )}

        {/* Low Stock Alert */}
        {stats.low_stock_products.length > 0 ? (
          <Card variant="glass" className="border-l-4 border-error-500">
            <Card.Header compact>
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-error p-2.5 rounded-lg shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">{t('lowStockAlert')}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">{t('productsRequiringAttention')}</p>
                </div>
              </div>
            </Card.Header>
            <Card.Body compact>
              <div className="space-y-2">
                {stats.low_stock_products.slice(0, 5).map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between p-2.5 bg-gradient-to-r from-error-50/50 to-error-100/30 dark:from-error-900/20 dark:to-error-800/20 rounded-lg border border-error-200/60 dark:border-error-800/60">
                    <div>
                      <p className="font-semibold text-sm text-neutral-900 dark:text-white">{item.product_name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('productId')}: {item.product_id}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-error text-white shadow-sm">
                        {item.quantity} {t('units')}
                      </span>
                    </div>
                  </div>
                ))}
                {stats.low_stock_products.length > 5 && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/warehouse-stock')}
                    className="w-full"
                  >
                    {t('viewAllLowStockItems')} ({stats.low_stock_products.length})
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card variant="glass" className="text-center">
            <Card.Body className="py-12">
              <div className="bg-success-100 dark:bg-success-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{t('stockStatusOptimal')}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('noLowStock')}</p>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
