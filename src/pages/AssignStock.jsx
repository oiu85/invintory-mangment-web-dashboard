import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { AlertTriangle, Package, Users, TrendingUp, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getProductRoomAvailability } from '../api/roomApi';

const AssignStock = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [formData, setFormData] = useState({
    driver_id: '',
    product_id: '',
    quantity: '',
    room_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

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

      // Fetch room availability for this product
      (async () => {
        try {
          const availability = await getProductRoomAvailability(parseInt(formData.product_id));
          setRoomAvailability(availability.rooms || []);
        } catch (error) {
          console.error('Error fetching room availability:', error);
          setRoomAvailability([]);
        }
      })();
    } else {
      setSelectedProduct(null);
      setRoomAvailability([]);
      setSelectedRoom(null);
      setFormData(prev => ({ ...prev, room_id: '' }));
    }
  }, [formData.product_id, products, warehouseStock]);

  const fetchDrivers = async () => {
    try {
      const response = await axiosClient.get('/admin/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast(t('errorLoadingDrivers'), 'error');
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
      showToast(t('errorLoadingProducts'), 'error');
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
      showToast(t('pleaseSelectProduct'), 'error');
      return;
    }

    if (parseInt(formData.quantity) > selectedProduct.available_quantity) {
      showToast(t('insufficientStock').replace('{quantity}', selectedProduct.available_quantity.toString()), 'error');
      return;
    }

    if (!formData.room_id) {
      showToast(t('pleaseSelectRoomForAssignment'), 'error');
      return;
    }

    const roomEntry = roomAvailability.find(r => r.room_id === parseInt(formData.room_id));
    const availableInRoom = roomEntry?.quantity || 0;
    if (parseInt(formData.quantity) > availableInRoom) {
      showToast(
        t('insufficientRoomStock')
          .replace('{quantity}', availableInRoom.toString()),
        'error'
      );
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('driver_id', formData.driver_id);
    formDataToSend.append('product_id', formData.product_id);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('room_id', formData.room_id);

    try {
      await axiosClient.post('/assign-stock', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast(t('stockAssigned'), 'success');
      setFormData({
        driver_id: '',
        product_id: '',
        quantity: '',
        room_id: '',
      });
      setSelectedProduct(null);
      setRoomAvailability([]);
      setSelectedRoom(null);
      fetchWarehouseStock();
    } catch (error) {
      console.error('Error assigning stock:', error);
      showToast(error.response?.data?.message || t('errorAssigningStock'), 'error');
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
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleAssignStock')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionAssignStock')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <Select
                label={t('selectDriver')}
                value={formData.driver_id}
                onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                options={[
                  { value: '', label: t('selectDriver') },
                  ...drivers.map((driver) => ({
                    value: driver.id,
                    label: `${driver.name} (${driver.email}) - ${driver.total_sales || 0} ${t('sales')}`
                  }))
                ]}
                required
              />
              
              <Select
                label={t('selectProduct')}
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                options={[
                  { value: '', label: t('selectProduct') },
                  ...products.map((product) => {
                    const stock = warehouseStock.find(s => s.product_id === product.id);
                    const available = stock?.quantity || 0;
                    return {
                      value: product.id,
                      label: `${product.name} - ${t('availableInWarehouse')}: ${available} ${t('units')}`
                    };
                  })
                ]}
                required
              />

              <Select
                label={t('selectRoomForAssignment')}
                value={formData.room_id}
                onChange={(e) => {
                  const roomId = e.target.value;
                  setFormData({ ...formData, room_id: roomId });
                  const entry = roomAvailability.find(r => r.room_id === parseInt(roomId));
                  setSelectedRoom(entry || null);
                }}
                options={[
                  { value: '', label: t('selectRoom') },
                  ...roomAvailability.map((room) => ({
                    value: room.room_id,
                    label: `${room.room_name} (${t('available')}: ${room.quantity})`,
                  })),
                ]}
                required
              />

              <Input
                label={t('quantityToAssign')}
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="1"
                max={selectedRoom?.quantity || selectedProduct?.available_quantity || 0}
              />

              {selectedProduct && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      {t('availableInWarehouse')}: <span className="font-bold">{selectedProduct.available_quantity}</span> {t('units')}
                    </p>
                  </div>
                  {selectedRoom && (
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {t('availableInRoom')}: <span className="font-bold">{selectedRoom.quantity}</span> {t('units')} ({selectedRoom.room_name})
                      </p>
                    </div>
                  )}
                  {parseInt(formData.quantity) > selectedProduct.available_quantity && (
                    <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {t('cannotAssignMore')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" disabled={loading || (selectedProduct && parseInt(formData.quantity) > selectedProduct.available_quantity)} className="w-full mt-4">
                {loading ? t('assigning') : t('assignStock')}
              </Button>
            </form>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          {selectedProduct && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('productDetails')}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('productName')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('price')}</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">${selectedProduct.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('category')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedProduct.category?.name || t('nA')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('availableStock')}</p>
                  <p className={`font-semibold text-2xl ${
                    selectedProduct.available_quantity < 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {selectedProduct.available_quantity} {t('units')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('quickStats')}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalDrivers')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{drivers.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalProducts')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{products.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalWarehouseItems')}</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
