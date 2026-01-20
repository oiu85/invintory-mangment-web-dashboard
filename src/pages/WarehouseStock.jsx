import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { Package, AlertTriangle, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import Card from '../components/Card';
import { useLanguage } from '../context/LanguageContext';

const WarehouseStock = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
  });

  useEffect(() => {
    fetchStock();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = stock.filter(item =>
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStock(filtered);
    } else {
      setFilteredStock(stock);
    }
  }, [searchTerm, stock]);

  const fetchStock = async () => {
    try {
      const response = await axiosClient.get('/warehouse-stock');
      setStock(response.data);
      setFilteredStock(response.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
      showToast(t('errorLoadingStock'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleUpdate = (stockItem) => {
    setFormData({
      product_id: stockItem.product_id,
      quantity: stockItem.quantity,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('product_id', formData.product_id);
    formDataToSend.append('quantity', formData.quantity);

    try {
      await axiosClient.post('/warehouse-stock/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsModalOpen(false);
      fetchStock();
      showToast(t('stockUpdated'), 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast(error.response?.data?.message || t('errorUpdatingStock'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const totalItems = filteredStock.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const lowStockCount = filteredStock.filter(item => (item.quantity || 0) < 10).length;
  const outOfStockCount = filteredStock.filter(item => (item.quantity || 0) === 0).length;

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleWarehouseStock')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionWarehouseStock')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          title={t('totalItems')}
          value={totalItems.toLocaleString()}
          icon={Package}
          color="blue"
          subtitle={t('itemsInWarehouse')}
        />
        <Card
          title={t('lowStockItems')}
          value={lowStockCount}
          icon={AlertTriangle}
          color="orange"
          subtitle={t('requiringAttention')}
        />
        <Card
          title={t('outOfStock')}
          value={outOfStockCount}
          icon={AlertCircle}
          color="red"
          subtitle={t('needsRestocking')}
        />
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchProductsOrCategories')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Table
          headers={[t('productId'), t('productName'), t('category'), t('currentStock'), t('status')]}
          data={filteredStock}
          renderRow={(item) => {
            const quantity = item.quantity || 0;
            const status = quantity === 0 ? 'out' : quantity < 10 ? 'low' : quantity < 50 ? 'medium' : 'good';
            const statusConfig = {
              out: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', label: t('outOfStockLabel') },
              low: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', label: t('lowStockLabel') },
              medium: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300', label: t('mediumStock') },
              good: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', label: t('goodStock') },
            };
            const statusStyle = statusConfig[status];

            return (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.product_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">
                  {item.product?.name || t('nA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                    {item.product?.category?.name || t('nA')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    {quantity.toLocaleString()} {t('units')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </td>
              </>
            );
          }}
          actions={(item) => (
            <Button variant="secondary" onClick={() => handleUpdate(item)}>
              {t('update')}
            </Button>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('updateWarehouseStock')}
      >
        <form onSubmit={handleSubmit}>
          <Select
            label={t('selectProduct')}
            value={formData.product_id}
            onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            options={[
              { value: '', label: t('selectProduct') },
              ...products.map((product) => ({
                value: product.id,
                label: `${product.name}${product.warehouse_stock ? ` (${t('currentStock')}: ${product.warehouse_stock.quantity} ${t('units')})` : ''}`
              }))
            ]}
            required
          />
          <Input
            label={t('quantity')}
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            min="0"
          />
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>{t('note')}:</strong> {t('stockUpdateNote')}
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('updating') : t('updateStock')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehouseStock;
