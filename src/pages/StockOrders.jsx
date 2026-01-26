import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { Package, CheckCircle2, XCircle, Clock, Search, Filter } from 'lucide-react';

const StockOrders = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.driver_name?.toLowerCase().includes(search) ||
        order.product_name?.toLowerCase().includes(search) ||
        order.id.toString().includes(search)
      );
    }

    setFilteredOrders(filtered);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/admin/stock-orders');
      setOrders(response.data.data || []);
      setFilteredOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching stock orders:', error);
      showToast(t('errorLoadingStockOrders') || 'Error loading stock orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    // Validate orderId
    if (!orderId || isNaN(orderId)) {
      showToast(t('invalidOrderId') || 'Invalid order ID', 'error');
      return;
    }

    const confirmMessage = t('confirmApproveStockOrder') || 'Are you sure you want to approve this stock order?';
    if (!confirm(confirmMessage)) {
      return;
    }

    setProcessingId(orderId);
    try {
      // Ensure orderId is a number
      const numericOrderId = parseInt(orderId, 10);
      console.log('Approving order:', numericOrderId);
      
      const response = await axiosClient.post(`/admin/stock-orders/${numericOrderId}/approve`);
      
      if (response.data?.success) {
        showToast(response.data?.message || t('stockOrderApproved') || 'Stock order approved successfully', 'success');
        await fetchOrders();
      } else {
        showToast(response.data?.message || t('errorApprovingOrder') || 'Error approving order', 'error');
      }
    } catch (error) {
      console.error('Error approving stock order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      // Get detailed error message from backend
      let errorMessage = t('errorApprovingOrder') || 'Error approving order';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Add additional context if available (insufficient stock)
      if (error.response?.data?.available_in_warehouse !== undefined) {
        const available = error.response.data.available_in_warehouse;
        const requested = error.response.data.requested;
        const shortage = error.response.data.shortage || (requested - available);
        const productName = error.response.data.product_name;
        
        let contextMessage = `\n${t('available') || 'Available'}: ${available}, ${t('requested') || 'Requested'}: ${requested}`;
        if (shortage > 0) {
          contextMessage += `, ${t('shortage') || 'Shortage'}: ${shortage}`;
        }
        if (productName) {
          contextMessage = `[${productName}] ${contextMessage}`;
        }
        errorMessage += contextMessage;
      }
      
      // Add current status if order status changed
      if (error.response?.data?.current_status) {
        errorMessage += ` (${t('currentStatus') || 'Current Status'}: ${error.response.data.current_status})`;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId) => {
    // Validate orderId
    if (!orderId || isNaN(orderId)) {
      showToast(t('invalidOrderId') || 'Invalid order ID', 'error');
      return;
    }

    const promptMessage = t('enterRejectionReason') || 'Please enter rejection reason (optional):';
    const reason = prompt(promptMessage);
    if (reason === null) return; // User cancelled

    setProcessingId(orderId);
    try {
      // Ensure orderId is a number
      const numericOrderId = parseInt(orderId, 10);
      console.log('Rejecting order:', numericOrderId);
      
      const response = await axiosClient.post(`/admin/stock-orders/${numericOrderId}/reject`, {
        rejection_reason: reason || null,
      });
      
      if (response.data?.success) {
        showToast(response.data?.message || t('stockOrderRejected') || 'Stock order rejected', 'success');
        await fetchOrders();
      } else {
        showToast(response.data?.message || t('errorRejectingOrder') || 'Error rejecting order', 'error');
      }
    } catch (error) {
      console.error('Error rejecting stock order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Get detailed error message from backend
      let errorMessage = t('errorRejectingOrder') || 'Error rejecting order';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" icon={Clock}>{t('pending') || 'Pending'}</Badge>;
      case 'approved':
        return <Badge variant="success" icon={CheckCircle2}>{t('approved') || 'Approved'}</Badge>;
      case 'rejected':
        return <Badge variant="error" icon={XCircle}>{t('rejected') || 'Rejected'}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const headers = [
    { key: 'id', label: t('id') || 'ID', sortable: true },
    { key: 'driver_name', label: t('driver') || 'Driver', sortable: true },
    { key: 'product_name', label: t('product') || 'Product', sortable: true },
    { key: 'quantity', label: t('quantity') || 'Quantity', sortable: true },
    { key: 'warehouse_stock_available', label: t('warehouseStock') || 'Warehouse Stock', sortable: true },
    { key: 'status', label: t('status') || 'Status', sortable: true },
    { key: 'created_at', label: t('date') || 'Date', sortable: true },
  ];

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const approvedCount = orders.filter(o => o.status === 'approved').length;
  const rejectedCount = orders.filter(o => o.status === 'rejected').length;

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('stockOrders') || 'Stock Orders'}
        subtitle={t('manageStockOrders') || 'Manage driver stock requests'}
        actions={
          <Button icon={Package} iconPosition="left" variant="ghost">
            {t('stockOrders') || 'Stock Orders'}
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="glass">
          <Card.Body compact>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('pendingOrders') || 'Pending Orders'}
                </p>
                <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-warning-100 dark:bg-warning-900/20 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card variant="glass">
          <Card.Body compact>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('approvedOrders') || 'Approved Orders'}
                </p>
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {approvedCount}
                </p>
              </div>
              <div className="bg-success-100 dark:bg-success-900/20 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card variant="glass">
          <Card.Body compact>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  {t('rejectedOrders') || 'Rejected Orders'}
                </p>
                <p className="text-2xl font-bold text-error-600 dark:text-error-400">
                  {rejectedCount}
                </p>
              </div>
              <div className="bg-error-100 dark:bg-error-900/20 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-error-600 dark:text-error-400" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="glass" className="mb-6">
        <Card.Body compact>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={t('searchOrders') || 'Search orders...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Filter className={`w-4 h-4 text-neutral-400 ${isRTL ? 'order-2' : ''}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                <option value="all">{t('allStatuses') || 'All Statuses'}</option>
                <option value="pending">{t('pending') || 'Pending'}</option>
                <option value="approved">{t('approved') || 'Approved'}</option>
                <option value="rejected">{t('rejected') || 'Rejected'}</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      {loading ? (
        <Card variant="glass">
          <Card.Body>
            <Skeleton variant="title" className="mb-4" />
            <Skeleton variant="text" className="mb-2" />
            <Skeleton variant="text" className="mb-2" />
            <Skeleton variant="text" />
          </Card.Body>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card variant="glass">
          <Card.Body>
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('noStockOrders') || 'No stock orders found'}
              </p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card variant="glass">
          <Card.Body>
            <Table
              headers={headers}
              data={filteredOrders}
              sortable={true}
              loading={loading}
              emptyMessage={t('noStockOrders') || 'No stock orders found'}
              renderRow={(order) => (
                <>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    #{order.id}
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {order.driver_name || t('nA') || 'N/A'}
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {order.product_name || t('nA') || 'N/A'}
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="font-semibold">{order.quantity} {t('units') || 'units'}</span>
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {order.warehouse_stock_available !== undefined ? (
                      <div className="flex flex-col gap-1">
                        <span className={`font-semibold ${order.can_approve ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                          {order.warehouse_stock_available} {t('units') || 'units'}
                        </span>
                        {!order.can_approve && order.stock_shortage > 0 && (
                          <span className="text-xs text-error-500 dark:text-error-400">
                            {t('shortage') || 'Shortage'}: {order.stock_shortage}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-400">{t('nA') || 'N/A'}</span>
                    )}
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {getStatusBadge(order.status)}
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {(() => {
                      const date = new Date(order.created_at);
                      const locale = isRTL ? 'ar-SA' : 'en-US';
                      return date.toLocaleDateString(locale) + ' ' + date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                    })()}
                  </td>
                </>
              )}
              actions={(order) => (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {order.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(order.id)}
                        disabled={processingId === order.id || (order.can_approve === false)}
                        icon={CheckCircle2}
                        title={order.can_approve === false ? (t('insufficientStock') || 'Insufficient warehouse stock') : ''}
                      >
                        {t('approve') || 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="error"
                        onClick={() => handleReject(order.id)}
                        disabled={processingId === order.id}
                        icon={XCircle}
                      >
                        {t('reject') || 'Reject'}
                      </Button>
                    </>
                  )}
                  {order.status === 'rejected' && order.rejection_reason && (
                    <span className={`text-xs text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`} title={order.rejection_reason}>
                      {order.rejection_reason}
                    </span>
                  )}
                </div>
              )}
            />
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default StockOrders;
