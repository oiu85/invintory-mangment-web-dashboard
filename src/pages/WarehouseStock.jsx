import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';

const WarehouseStock = () => {
  const { showToast } = useToast();
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
      showToast('Error loading warehouse stock', 'error');
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
      showToast('Stock updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast(error.response?.data?.message || 'Error updating stock', 'error');
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Warehouse Stock</h1>
        <p className="text-gray-600">Manage inventory levels in the warehouse with detailed tracking</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-800">{totalItems.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <span className="text-3xl">📦</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-orange-600">{outOfStockCount}</p>
            </div>
            <div className="bg-orange-100 p-4 rounded-lg">
              <span className="text-3xl">🔴</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products or categories..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Table
          headers={['Product ID', 'Product Name', 'Category', 'Current Stock', 'Status']}
          data={filteredStock}
          renderRow={(item) => {
            const quantity = item.quantity || 0;
            const status = quantity === 0 ? 'out' : quantity < 10 ? 'low' : quantity < 50 ? 'medium' : 'good';
            const statusConfig = {
              out: { bg: 'bg-red-100', text: 'text-red-800', label: 'Out of Stock' },
              low: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Low Stock' },
              medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium Stock' },
              good: { bg: 'bg-green-100', text: 'text-green-800', label: 'Good Stock' },
            };
            const statusStyle = statusConfig[status];

            return (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {item.product?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {item.product?.category?.name || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    {quantity.toLocaleString()} units
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
              Update
            </Button>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Warehouse Stock"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.warehouse_stock && `(Current: ${product.warehouse_stock.quantity} units)`}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            min="0"
          />
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Enter the total quantity you want to set for this product in the warehouse.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Stock'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WarehouseStock;
