import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';

const AssignStock = () => {
  const { showToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [formData, setFormData] = useState({
    driver_id: '',
    product_id: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchDrivers();
    fetchProducts();
    fetchWarehouseStock();
  }, []);

  useEffect(() => {
    if (formData.product_id) {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      const stock = warehouseStock.find(s => s.product_id === parseInt(formData.product_id));
      setSelectedProduct({
        ...product,
        available_quantity: stock?.quantity || 0,
      });
    } else {
      setSelectedProduct(null);
    }
  }, [formData.product_id, products, warehouseStock]);

  const fetchDrivers = async () => {
    try {
      const response = await axiosClient.get('/admin/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast('Error loading drivers', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products', 'error');
    }
  };

  const fetchWarehouseStock = async () => {
    try {
      const response = await axiosClient.get('/warehouse-stock');
      setWarehouseStock(response.data);
    } catch (error) {
      console.error('Error fetching warehouse stock:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    if (parseInt(formData.quantity) > selectedProduct.available_quantity) {
      showToast(`Insufficient stock! Available: ${selectedProduct.available_quantity} units`, 'error');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('driver_id', formData.driver_id);
    formDataToSend.append('product_id', formData.product_id);
    formDataToSend.append('quantity', formData.quantity);

    try {
      await axiosClient.post('/assign-stock', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Stock assigned successfully!', 'success');
      setFormData({
        driver_id: '',
        product_id: '',
        quantity: '',
      });
      setSelectedProduct(null);
      fetchWarehouseStock();
    } catch (error) {
      console.error('Error assigning stock:', error);
      showToast(error.response?.data?.message || 'Error assigning stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Assign Stock to Driver</h1>
        <p className="text-gray-600">Transfer products from warehouse to driver inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver</label>
                <select
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Driver</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} ({driver.email}) - {driver.total_sales || 0} sales
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((product) => {
                    const stock = warehouseStock.find(s => s.product_id === product.id);
                    const available = stock?.quantity || 0;
                    return (
                      <option key={product.id} value={product.id}>
                        {product.name} - Available: {available} units
                      </option>
                    );
                  })}
                </select>
              </div>

              <Input
                label="Quantity to Assign"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="1"
                max={selectedProduct?.available_quantity || 0}
              />

              {selectedProduct && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Available in Warehouse:</strong> {selectedProduct.available_quantity} units
                  </p>
                  {parseInt(formData.quantity) > selectedProduct.available_quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      ⚠️ Cannot assign more than available stock!
                    </p>
                  )}
                </div>
              )}

              <Button type="submit" disabled={loading || (selectedProduct && parseInt(formData.quantity) > selectedProduct.available_quantity)} className="w-full mt-4">
                {loading ? 'Assigning...' : 'Assign Stock'}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          {selectedProduct && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-semibold">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-semibold text-green-600">${selectedProduct.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{selectedProduct.category?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Stock</p>
                  <p className={`font-semibold text-2xl ${
                    selectedProduct.available_quantity < 10 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedProduct.available_quantity} units
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-blue-600">{drivers.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-green-600">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Warehouse Items</p>
                <p className="text-2xl font-bold text-purple-600">
                  {warehouseStock.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStock;
