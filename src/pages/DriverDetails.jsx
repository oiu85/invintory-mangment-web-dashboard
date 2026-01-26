import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getDriverAnalytics, getDriverInventory, getDriverSettlement, performInventory, getInventoryHistory } from '../api/driverApi';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Tabs from '../components/ui/Tabs';
import PageHeader from '../components/layout/PageHeader';
import ErrorState from '../components/ui/ErrorState';
import { SalesLineChart, RevenueBarChart } from '../components/Chart';
import InventoryHistory from '../components/InventoryHistory';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart,
  BarChart3,
  Calendar,
  ArrowLeft,
  FileText,
  Box,
  ClipboardList,
  Download,
  History
} from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const DriverDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isInventoryConfirmModalOpen, setIsInventoryConfirmModalOpen] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [inventoryPeriod, setInventoryPeriod] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0], // Start of week
    end_date: new Date().toISOString().split('T')[0], // Today
    period_type: 'week'
  });

  useEffect(() => {
    fetchAnalytics();
    fetchInventoryHistory();
  }, [id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDriverAnalytics(id);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching driver analytics:', err);
      setError(err.response?.data?.message || t('errorLoadingData'));
      showToast(t('errorLoadingData'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await getInventoryHistory(id);
      setInventoryHistory(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching inventory history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInventory = () => {
    setIsInventoryConfirmModalOpen(true);
  };

  const confirmPerformInventory = async () => {
    try {
      setLoadingInventory(true);
      setIsInventoryConfirmModalOpen(false);
      
      await performInventory(id, {
        period_start_date: inventoryPeriod.start_date,
        period_end_date: inventoryPeriod.end_date,
        notes: null
      });
      
      showToast(t('inventoryPerformedSuccess') || 'Inventory performed successfully. Driver earnings reset to 0.', 'success');
      
      // Refresh analytics and history
      await fetchAnalytics();
      await fetchInventoryHistory();
      
      // Fetch the inventory data to show in modal
      const inventoryResponse = await getDriverInventory(
        id,
        inventoryPeriod.start_date,
        inventoryPeriod.end_date
      );
      
      // Show the inventory data
      setInventoryData(inventoryResponse.data);
      setIsInventoryModalOpen(true);
    } catch (err) {
      console.error('Error performing inventory:', err);
      showToast(err.response?.data?.message || t('errorPerformingInventory') || 'Error performing inventory', 'error');
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleSettlement = async () => {
    try {
      setLoadingInventory(true);
      const response = await getDriverSettlement(
        id,
        inventoryPeriod.start_date,
        inventoryPeriod.end_date,
        inventoryPeriod.period_type
      );
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const driverName = analytics?.driver?.name || 'driver';
      link.download = `settlement-${driverName}-${inventoryPeriod.start_date}-to-${inventoryPeriod.end_date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast(t('settlementGenerated') || 'Settlement generated successfully', 'success');
    } catch (err) {
      console.error('Error generating settlement:', err);
      showToast(t('errorGeneratingSettlement') || 'Error generating settlement', 'error');
    } finally {
      setLoadingInventory(false);
    }
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
    const colorConfigs = {
      blue: {
        bg: 'bg-primary-50 dark:bg-primary-900/20',
        iconBg: 'bg-gradient-to-br from-primary-500 to-primary-600',
        text: 'text-primary-600 dark:text-primary-400',
        border: 'border-primary-200 dark:border-primary-800',
      },
      green: {
        bg: 'bg-success-50 dark:bg-success-900/20',
        iconBg: 'bg-gradient-to-br from-success-500 to-success-600',
        text: 'text-success-600 dark:text-success-400',
        border: 'border-success-200 dark:border-success-800',
      },
      purple: {
        bg: 'bg-secondary-50 dark:bg-secondary-900/20',
        iconBg: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
        text: 'text-secondary-600 dark:text-secondary-400',
        border: 'border-secondary-200 dark:border-secondary-800',
      },
      orange: {
        bg: 'bg-warning-50 dark:bg-warning-900/20',
        iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
        text: 'text-warning-600 dark:text-warning-400',
        border: 'border-warning-200 dark:border-warning-800',
      },
    };

    const config = colorConfigs[color] || colorConfigs.blue;

    return (
      <Card variant="glass" className="overflow-hidden">
        <Card.Body>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${config.iconBg} shadow-md`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                {trend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${config.text} mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          )}
        </Card.Body>
      </Card>
    );
  };

  // Prepare chart data
  const salesChartData = useMemo(() => {
    if (!analytics?.charts?.sales_by_day) return [];
    return analytics.charts.sales_by_day.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: item.count,
      revenue: item.revenue,
    }));
  }, [analytics]);

  const monthlyChartData = useMemo(() => {
    if (!analytics?.charts?.sales_by_month) return [];
    return analytics.charts.sales_by_month.map(item => ({
      date: item.month,
      count: item.count,
      revenue: item.revenue,
    }));
  }, [analytics]);

  const tabs = [
    { id: 'overview', label: t('overview'), icon: BarChart3 },
    { id: 'sales', label: t('sales'), icon: ShoppingCart },
    { id: 'stock', label: t('stock'), icon: Package },
    { id: 'products', label: t('topProducts'), icon: Box },
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={<Skeleton variant="heading" className="w-48" />}
          subtitle={<Skeleton variant="text" className="w-64" />}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} variant="glass">
              <Card.Body>
                <Skeleton variant="title" />
                <Skeleton variant="text" />
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={t('driverDetails') || 'Driver Details'}
          subtitle={t('errorLoadingData') || 'Error loading data'}
          showBack
          backPath="/drivers"
        />
        <ErrorState
          title={t('errorLoadingData') || 'Error loading data'}
          description={error || t('driverNotFound') || 'Driver not found'}
          action={() => navigate('/drivers')}
          actionLabel={t('backToDrivers') || 'Back to Drivers'}
        />
      </div>
    );
  }

  const { driver, overview, period_stats, trends, top_products, recent_sales, current_stock } = analytics;

  return (
    <div className="min-h-screen">
      <PageHeader
        title={driver.name}
        subtitle={driver.email}
        showBack
        backPath="/drivers"
        actions={
          <Badge variant="primary" size="lg">
            {t('driver') || 'Driver'}
          </Badge>
        }
      />

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title={t('totalSales') || 'Total Sales'}
          value={overview.total_sales}
          icon={ShoppingCart}
          color="blue"
          subtitle={t('allTime') || 'All time'}
        />
        <StatCard
          title={t('totalRevenue') || 'Total Revenue'}
          value={`$${parseFloat(overview.total_revenue || 0).toFixed(2)}`}
          icon={DollarSign}
          color="green"
          subtitle={t('allTime') || 'All time'}
          trend={trends?.revenue_growth}
        />
        <StatCard
          title={t('currentStock') || 'Current Stock'}
          value={overview.total_stock_items}
          icon={Package}
          color="purple"
          subtitle={t('itemsInStock')}
        />
        <StatCard
          title={t('avgSaleAmount') || 'Avg Sale Amount'}
          value={`$${parseFloat(overview.avg_sale_amount || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="orange"
          subtitle={t('perTransaction') || 'Per transaction'}
        />
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="glass">
          <Card.Body>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{t('today') || 'Today'}</h3>
              <Calendar className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {period_stats.today.sales} {t('sales') || 'sales'}
              </p>
              <p className="text-lg text-success-600 dark:text-success-400 font-semibold">
                ${parseFloat(period_stats.today.revenue || 0).toFixed(2)}
              </p>
            </div>
          </Card.Body>
        </Card>
        <Card variant="glass">
          <Card.Body>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{t('thisWeek') || 'This Week'}</h3>
              <Calendar className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {period_stats.this_week.sales} {t('sales') || 'sales'}
              </p>
              <p className="text-lg text-success-600 dark:text-success-400 font-semibold">
                ${parseFloat(period_stats.this_week.revenue || 0).toFixed(2)}
              </p>
            </div>
          </Card.Body>
        </Card>
        <Card variant="glass">
          <Card.Body>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">{t('thisMonth') || 'This Month'}</h3>
              <Calendar className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {period_stats.this_month.sales} {t('sales') || 'sales'}
              </p>
              <p className="text-lg text-success-600 dark:text-success-400 font-semibold">
                ${parseFloat(period_stats.this_month.revenue || 0).toFixed(2)}
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Tabs */}
      <Card variant="glass">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card variant="elevated">
                    <Card.Header>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('salesTrend') || 'Sales Trend (Last 30 Days)'}</h3>
                    </Card.Header>
                    <Card.Body>
                      <SalesLineChart data={salesChartData} isDark={isDark} />
                    </Card.Body>
                  </Card>
                  <Card variant="elevated">
                    <Card.Header>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('revenueTrend') || 'Revenue Trend (Last 12 Months)'}</h3>
                    </Card.Header>
                    <Card.Body>
                      <RevenueBarChart data={monthlyChartData} isDark={isDark} />
                    </Card.Body>
                  </Card>
                </div>

                {/* Performance Summary */}
                <Card variant="elevated">
                  <Card.Header>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{t('performanceSummary') || 'Performance Summary'}</h3>
                  </Card.Header>
                  <Card.Body>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('salesGrowth') || 'Sales Growth'}</p>
                        <p className={`text-2xl font-bold ${trends.sales_growth >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                          {trends.sales_growth >= 0 ? '+' : ''}{trends.sales_growth.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('revenueGrowth') || 'Revenue Growth'}</p>
                        <p className={`text-2xl font-bold ${trends.revenue_growth >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                          {trends.revenue_growth >= 0 ? '+' : ''}{trends.revenue_growth.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('totalTransactions') || 'Total Transactions'}</p>
                        <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                          {overview.total_sales}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-lg">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('avgTransaction') || 'Avg Transaction'}</p>
                        <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                          ${parseFloat(overview.avg_sale_amount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === 'sales' && (
              <div>
                {recent_sales && recent_sales.length > 0 ? (
                  <Table
                    headers={[t('invoiceNumber'), t('customerName'), t('items'), t('totalAmount'), t('customPrice'), t('date'), t('actions')]}
                    data={recent_sales}
                    renderRow={(sale) => {
                      // Calculate average custom price markup
                      const items = sale.items || [];
                      const customPriceItems = items.filter(item => item.custom_price != null);
                      const avgMarkup = customPriceItems.length > 0
                        ? customPriceItems.reduce((sum, item) => {
                            const originalPrice = parseFloat(item.original_price || item.price || 0);
                            const customPrice = parseFloat(item.custom_price || 0);
                            return sum + ((customPrice - originalPrice) / originalPrice * 100);
                          }, 0) / customPriceItems.length
                        : null;
                      
                      return (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {sale.invoice_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {sale.customer_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            <Badge variant="secondary">{sale.items_count}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600 dark:text-success-400">
                            ${parseFloat(sale.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {avgMarkup != null ? (
                              <Badge variant={avgMarkup > 0 ? 'success' : 'warning'}>
                                {avgMarkup > 0 ? '+' : ''}{avgMarkup.toFixed(1)}%
                              </Badge>
                            ) : (
                              <span className="text-neutral-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            {new Date(sale.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/sales/${sale.id}`)}
                            >
                              {t('view')}
                            </Button>
                          </td>
                        </>
                      );
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">{t('noSales')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Stock Tab */}
            {activeTab === 'stock' && (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-end">
                  <Button
                    variant="primary"
                    onClick={handleInventory}
                    icon={ClipboardList}
                  >
                    {t('performInventory')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleSettlement}
                    icon={Download}
                  >
                    {t('generateSettlement')}
                  </Button>
                </div>

                {/* Earnings Summary */}
                {current_stock && current_stock.length > 0 && (
                  <Card variant="elevated">
                    <Card.Body>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                        {t('earningsSummary')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                            {t('totalStockValue')}
                          </p>
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${current_stock.reduce((sum, s) => sum + parseFloat(s.total_value || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                            {t('totalCostValue')}
                          </p>
                          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                            ${current_stock.reduce((sum, s) => sum + parseFloat(s.total_cost_value || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-lg">
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                            {t('potentialProfit')}
                          </p>
                          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                            ${current_stock.reduce((sum, s) => sum + (parseFloat(s.total_value || 0) - parseFloat(s.total_cost_value || 0)), 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Stock Table with Assignment History */}
                {current_stock && current_stock.length > 0 ? (
                  <div className="space-y-4">
                    <Table
                      headers={[
                        t('product') || 'المنتج',
                        t('category') || 'الفئة',
                        t('quantity') || 'الكمية',
                        t('timesTaken'),
                        t('costPrice'),
                        t('sellingPrice'),
                        t('totalCost'),
                        t('totalValue'),
                        t('profit')
                      ]}
                      data={current_stock}
                      renderRow={(stock) => {
                        const profit = parseFloat(stock.total_value || 0) - parseFloat(stock.total_cost_value || 0);
                        return (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {stock.product_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              <Badge>{stock.category_name}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              <Badge variant="success">{stock.quantity}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              <Badge variant="secondary">
                                <History className="w-3 h-3 inline mr-1" />
                                {stock.assignments_count || 0}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              ${parseFloat(stock.avg_cost_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              ${parseFloat(stock.product_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              ${parseFloat(stock.total_cost_value || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600 dark:text-success-400">
                              ${parseFloat(stock.total_value || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                              <span className={profit >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}>
                                ${profit.toFixed(2)}
                              </span>
                            </td>
                          </>
                        );
                      }}
                    />

                    {/* Assignment History Details */}
                    <Card variant="elevated">
                      <Card.Body>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                          {t('assignmentHistory')}
                        </h3>
                        <div className="space-y-4">
                          {current_stock.map((stock) => (
                            stock.assignments && stock.assignments.length > 0 && (
                              <div key={stock.product_id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-neutral-900 dark:text-white">
                                    {stock.product_name}
                                  </h4>
                                  <Badge variant="primary">
                                    {stock.assignments.length} {t('times')}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  {stock.assignments.map((assignment, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm bg-neutral-50 dark:bg-neutral-700/50 p-2 rounded">
                                      <div className="flex items-center gap-4">
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                          {new Date(assignment.created_at).toLocaleDateString()}
                                        </span>
                                        <Badge variant="secondary" size="sm">
                                          {assignment.quantity} {t('units')}
                                        </Badge>
                                        <Badge variant={assignment.assigned_from === 'warehouse' ? 'primary' : 'warning'} size="sm">
                                          {assignment.assigned_from === 'warehouse' ? t('fromWarehouse') : t('fromRoom')}
                                        </Badge>
                                      </div>
                                      <span className="font-semibold text-neutral-900 dark:text-white">
                                        ${parseFloat(assignment.cost_price || 0).toFixed(2)} × {assignment.quantity} = ${(parseFloat(assignment.cost_price || 0) * assignment.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">{t('noStock')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Top Products Tab */}
            {activeTab === 'products' && (
              <div>
                {top_products && top_products.length > 0 ? (
                  <Table
                    headers={[t('product'), t('totalQuantity'), t('totalRevenue'), t('rank')]}
                    data={top_products}
                    renderRow={(product, index) => (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {product.product_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          <Badge variant="primary">{product.total_quantity}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600 dark:text-success-400">
                          ${parseFloat(product.total_revenue || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                          <Badge variant={index === 0 ? 'success' : index === 1 ? 'warning' : index === 2 ? 'secondary' : 'default'}>
                            #{index + 1}
                          </Badge>
                        </td>
                      </>
                    )}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Box className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">{t('noProducts')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Tabs>
      </Card>

      {/* Inventory Modal */}
      <Modal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        title={t('inventoryReport')}
        size="xl"
      >
        <div className="space-y-6">
          {/* Period Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg">
            <Input
              label={t('startDate')}
              type="date"
              value={inventoryPeriod.start_date}
              onChange={(e) => setInventoryPeriod({ ...inventoryPeriod, start_date: e.target.value })}
            />
            <Input
              label={t('endDate')}
              type="date"
              value={inventoryPeriod.end_date}
              onChange={(e) => setInventoryPeriod({ ...inventoryPeriod, end_date: e.target.value })}
            />
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={async () => {
                  try {
                    setLoadingInventory(true);
                    const inventoryResponse = await getDriverInventory(
                      id,
                      inventoryPeriod.start_date,
                      inventoryPeriod.end_date
                    );
                    setInventoryData(inventoryResponse.data);
                    showToast(t('inventoryRefreshed') || 'Inventory data refreshed', 'success');
                  } catch (err) {
                    console.error('Error fetching inventory:', err);
                    showToast(err.response?.data?.message || t('errorLoadingData') || 'Error loading inventory data', 'error');
                  } finally {
                    setLoadingInventory(false);
                  }
                }}
                loading={loadingInventory}
                className="w-full"
              >
                {t('refresh')}
              </Button>
            </div>
          </div>

          {loadingInventory ? (
            <div className="text-center py-12">
              <Skeleton variant="title" />
              <Skeleton variant="text" />
            </div>
          ) : inventoryData ? (
            <>
              {/* Summary */}
              <Card variant="elevated">
                <Card.Body>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                      {t('summary')}
                    </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 rounded-lg">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('totalSales') || 'إجمالي المبيعات'}
                      </p>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {inventoryData.summary?.total_sales || 0}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 rounded-lg">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('totalRevenue') || 'إجمالي الإيرادات'}
                      </p>
                      <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                        ${parseFloat(inventoryData.summary?.total_revenue || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 rounded-lg">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('totalCost')}
                      </p>
                      <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                        ${parseFloat(inventoryData.summary?.total_cost || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 rounded-lg">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        {t('totalProfit')}
                      </p>
                      <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                        ${parseFloat(inventoryData.summary?.total_profit || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Profit Details */}
              {inventoryData.profit_details && inventoryData.profit_details.length > 0 && (
                <Card variant="elevated">
                  <Card.Body>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                      {t('profitDetails')}
                    </h3>
                    <div className="overflow-x-auto">
                      <Table
                        headers={[
                          t('invoiceNumber') || 'رقم الفاتورة',
                          t('customer') || 'العميل',
                          t('product') || 'المنتج',
                          t('quantity') || 'الكمية',
                          t('costPrice'),
                          t('sellingPrice'),
                          t('profit')
                        ]}
                        data={inventoryData.profit_details}
                        renderRow={(detail) => (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {detail.invoice_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              {detail.customer_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              {detail.product_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              <Badge variant="secondary">{detail.quantity}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              ${parseFloat(detail.cost_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                              ${parseFloat(detail.selling_price || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                              <span className={parseFloat(detail.total_profit || 0) >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}>
                                ${parseFloat(detail.total_profit || 0).toFixed(2)}
                              </span>
                            </td>
                          </>
                        )}
                      />
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button
                  variant="primary"
                  onClick={handleSettlement}
                  loading={loadingInventory}
                  icon={Download}
                >
                  {t('generateSettlementInvoice')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsInventoryModalOpen(false)}
                >
                  {t('close')}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('noInventoryData')}
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Inventory Confirmation Modal */}
      <Modal
        isOpen={isInventoryConfirmModalOpen}
        onClose={() => setIsInventoryConfirmModalOpen(false)}
        title={t('confirmPerformInventory') || 'Confirm Perform Inventory'}
      >
        <div className="space-y-6">
          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
            <p className="text-warning-800 dark:text-warning-200 text-sm">
              {t('inventoryWarning') || 'This will reset the driver\'s earnings to 0 and save the current inventory snapshot. This action cannot be undone.'}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('periodStartDate')}
              </label>
              <Input
                type="date"
                value={inventoryPeriod.start_date}
                onChange={(e) => setInventoryPeriod({ ...inventoryPeriod, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                {t('periodEndDate')}
              </label>
              <Input
                type="date"
                value={inventoryPeriod.end_date}
                onChange={(e) => setInventoryPeriod({ ...inventoryPeriod, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="secondary"
              onClick={() => setIsInventoryConfirmModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={confirmPerformInventory}
              loading={loadingInventory}
              icon={ClipboardList}
            >
              {t('confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Inventory History Section */}
      {activeTab === 'stock' && (
        <div className="mt-6">
          <InventoryHistory
            history={inventoryHistory}
            loading={loadingHistory}
          />
        </div>
      )}
    </div>
  );
};

export default DriverDetails;
