import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { AlertTriangle, Package, Users, TrendingUp, MapPin, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getProductRoomAvailability, refreshRoomLayout, getRooms } from '../api/roomApi';

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
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomError, setRoomError] = useState(null);

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
        setLoadingRooms(true);
        setRoomError(null);
        try {
          const availability = await getProductRoomAvailability(parseInt(formData.product_id));
          // Handle different response structures
          let rooms = availability?.rooms || availability?.data?.rooms || (Array.isArray(availability) ? availability : []);
          
          // If no rooms from product-specific endpoint, try fetching all rooms as fallback
          if (!rooms || rooms.length === 0) {
            try {
              const allRooms = await getRooms();
              // Map all rooms to availability format (with quantity 0 if not available)
              rooms = (Array.isArray(allRooms) ? allRooms : []).map(room => ({
                room_id: room.id,
                room_name: room.name,
                quantity: 0, // Unknown quantity, but room exists
              }));
            } catch (fallbackError) {
              console.error('Error fetching all rooms as fallback:', fallbackError);
            }
          }
          
          setRoomAvailability(rooms || []);
          
          if (!rooms || rooms.length === 0) {
            setRoomError(t('noRoomsAvailableForProduct') || 'No rooms available for this product. Please create a room first.');
          }
        } catch (error) {
          console.error('Error fetching room availability:', error);
          setRoomAvailability([]);
          const errorMessage = error.response?.data?.message || error.message || t('errorLoadingRooms');
          setRoomError(errorMessage);
          showToast(errorMessage, 'error');
          
          // Try fallback: fetch all rooms
          try {
            const allRooms = await getRooms();
            const rooms = (Array.isArray(allRooms) ? allRooms : []).map(room => ({
              room_id: room.id,
              room_name: room.name,
              quantity: 0,
            }));
            if (rooms.length > 0) {
              setRoomAvailability(rooms);
              setRoomError(null);
              showToast(t('usingAllRoomsFallback') || 'Using all available rooms (availability unknown)', 'warning');
            }
          } catch (fallbackError) {
            console.error('Fallback room fetch also failed:', fallbackError);
          }
        } finally {
          setLoadingRooms(false);
        }
      })();
    } else {
      setSelectedProduct(null);
      setRoomAvailability([]);
      setSelectedRoom(null);
      setRoomError(null);
      setFormData(prev => ({ ...prev, room_id: '' }));
    }
  }, [formData.product_id, products, warehouseStock, t, showToast]);

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

    // Check warehouse stock availability (primary check)
    if (parseInt(formData.quantity) > selectedProduct.available_quantity) {
      showToast(t('insufficientStock').replace('{quantity}', selectedProduct.available_quantity.toString()), 'error');
      return;
    }

    if (!formData.room_id) {
      showToast(t('pleaseSelectRoomForAssignment'), 'error');
      return;
    }

    // Room availability check - only warn if room has stock and it's insufficient
    // If room has 0 or unknown quantity, we're assigning from warehouse, so allow it
    const roomEntry = roomAvailability.find(r => 
      (r.room_id && r.room_id === parseInt(formData.room_id)) || 
      (r.id && r.id === parseInt(formData.room_id))
    );
    const availableInRoom = roomEntry?.quantity !== undefined ? roomEntry.quantity : null;
    
    // Only block if room has known stock and it's insufficient
    // If quantity is 0 or null/undefined, we're assigning from warehouse, which is allowed
    if (availableInRoom !== null && availableInRoom > 0 && parseInt(formData.quantity) > availableInRoom) {
      showToast(
        t('insufficientRoomStock')
          .replace('{quantity}', availableInRoom.toString()),
        'error'
      );
      return;
    }
    
    // If room quantity is 0 or unknown, we're assigning from warehouse - this is valid
    // The backend will handle the assignment from warehouse stock

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('driver_id', formData.driver_id);
    formDataToSend.append('product_id', formData.product_id);
    formDataToSend.append('quantity', formData.quantity);
    formDataToSend.append('room_id', formData.room_id);

    try {
      const response = await axiosClient.post('/assign-stock', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      showToast(t('stockAssigned'), 'success');
      
      // Refresh layout if it was updated
      if (response.data.layout_updated && formData.room_id) {
        try {
          await refreshRoomLayout(formData.room_id);
          showToast('Room layout refreshed', 'success');
        } catch (layoutError) {
          console.error('Error refreshing layout:', layoutError);
          // Don't show error to user, layout refresh is optional
        }
      }
      
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
      
      // Extract detailed error message from backend
      const errorData = error.response?.data;
      let errorMessage = t('errorAssigningStock');
      
      if (errorData?.message) {
        errorMessage = errorData.message;
        
        // Add additional context if available
        if (errorData.available_in_warehouse !== undefined) {
          errorMessage += ` (${t('available')}: ${errorData.available_in_warehouse} ${t('units')})`;
        }
        if (errorData.available_in_room !== undefined) {
          errorMessage += ` (${t('availableInRoom')}: ${errorData.available_in_room} ${t('units')})`;
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleAssignStock')}
        subtitle={t('pageDescriptionAssignStock')}
        actions={
          <Button icon={ArrowRightLeft} iconPosition="left" variant="ghost">
            {t('assignStock')}
          </Button>
        }
      />

      {loadingData ? (
        <div className="space-y-4">
          <Card variant="glass">
            <Card.Body compact>
              <Skeleton variant="title" className="mb-4" />
              <Skeleton variant="input" className="mb-4" />
              <Skeleton variant="input" className="mb-4" />
              <Skeleton variant="input" />
            </Card.Body>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <Card.Body compact>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Select
                    id="assign-driver"
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
                    id="assign-product"
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

                  <div>
                    <Select
                      id="assign-room"
                      label={t('selectRoomForAssignment')}
                      value={formData.room_id}
                      onChange={(e) => {
                        const roomId = e.target.value;
                        setFormData({ ...formData, room_id: roomId });
                        const entry = roomAvailability.find(r => 
                          (r.room_id && r.room_id === parseInt(roomId)) || 
                          (r.id && r.id === parseInt(roomId))
                        );
                        setSelectedRoom(entry || null);
                      }}
                      options={[
                        { value: '', label: loadingRooms ? t('loadingRooms') || 'Loading rooms...' : t('selectRoom') },
                        ...roomAvailability.map((room) => {
                          const roomId = room.room_id || room.id;
                          const roomName = room.room_name || room.name;
                          const quantity = room.quantity !== undefined ? room.quantity : '?';
                          return {
                            value: roomId,
                            label: `${roomName} (${t('available')}: ${quantity})`,
                          };
                        }),
                      ]}
                      required
                      disabled={loadingRooms || !formData.product_id}
                      helpText={loadingRooms ? t('loadingRooms') || 'Loading rooms...' : roomError || (roomAvailability.length === 0 && formData.product_id ? t('noRoomsAvailable') || 'No rooms available' : undefined)}
                    />
                    {loadingRooms && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('loadingRooms') || 'Loading available rooms...'}</span>
                      </div>
                    )}
                    {roomError && !loadingRooms && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-error-50 dark:bg-error-900/20 rounded border border-error-200 dark:border-error-800" role="alert">
                        <AlertTriangle className="w-4 h-4 text-error-600 dark:text-error-400 flex-shrink-0" />
                        <p className="text-sm text-error-700 dark:text-error-300">{roomError}</p>
                      </div>
                    )}
                  </div>

                  <Input
                    id="assign-quantity"
                    label={t('quantityToAssign')}
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="1"
                    max={selectedRoom?.quantity || selectedProduct?.available_quantity || 0}
                  />

                  {selectedProduct && (
                    <div className="p-4 glass bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg border border-primary-200/60 dark:border-primary-800/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-gradient-primary p-1.5 rounded-lg shadow-sm">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-semibold text-primary-900 dark:text-primary-300">
                          {t('availableInWarehouse')}: <span className="font-bold text-primary-600 dark:text-primary-400">{selectedProduct.available_quantity}</span> {t('units')}
                        </p>
                      </div>
                      {selectedRoom && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-gradient-secondary p-1.5 rounded-lg shadow-sm">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-sm font-semibold text-primary-900 dark:text-primary-300">
                            {t('availableInRoom')}: <span className="font-bold text-secondary-600 dark:text-secondary-400">{selectedRoom.quantity}</span> {t('units')} ({selectedRoom.room_name})
                          </p>
                        </div>
                      )}
                      {parseInt(formData.quantity) > selectedProduct.available_quantity && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-gradient-to-r from-error-50/70 to-error-100/50 dark:from-error-900/30 dark:to-error-800/30 rounded border border-error-200/60 dark:border-error-800/60 shadow-sm" role="alert">
                          <div className="bg-gradient-error p-1 rounded shadow-sm">
                            <AlertTriangle className="w-3.5 h-3.5 text-white flex-shrink-0" />
                          </div>
                          <p className="text-sm font-semibold text-error-700 dark:text-error-300">
                            {t('cannotAssignMore')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button type="submit" loading={loading} disabled={selectedProduct && parseInt(formData.quantity) > selectedProduct.available_quantity} className="w-full" size="lg">
                    {t('assignStock')}
                  </Button>
                </form>
              </Card.Body>
            </Card>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            {selectedProduct && (
              <Card variant="glass">
                <Card.Body compact>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">{t('productDetails')}</h3>
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('productName')}</p>
                      <p className="font-bold text-neutral-900 dark:text-white">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('price')}</p>
                      <p className="font-bold text-success-600 dark:text-success-400 text-lg">${selectedProduct.price}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('category')}</p>
                      <Badge variant="primary">{selectedProduct.category?.name || t('nA')}</Badge>
                    </div>
                    <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                      <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('availableStock')}</p>
                      <p className={`font-bold text-2xl ${
                        selectedProduct.available_quantity < 10 ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'
                      }`}>
                        {selectedProduct.available_quantity} {t('units')}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            <Card variant="glass">
              <Card.Body compact>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-3">{t('quickStats')}</h3>
                <div className="space-y-3">
                  <div className="p-2.5 bg-gradient-to-r from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200/60 dark:border-primary-800/60">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('totalDrivers')}</p>
                    <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{drivers.length}</p>
                  </div>
                  <div className="p-2.5 bg-gradient-to-r from-success-50/50 to-success-100/30 dark:from-success-900/20 dark:to-success-800/20 rounded-lg border border-success-200/60 dark:border-success-800/60">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('totalProducts')}</p>
                    <p className="text-xl font-bold text-success-600 dark:text-success-400">{products.length}</p>
                  </div>
                  <div className="p-2.5 bg-gradient-to-r from-secondary-50/50 to-secondary-100/30 dark:from-secondary-900/20 dark:to-secondary-800/20 rounded-lg border border-secondary-200/60 dark:border-secondary-800/60">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide mb-1">{t('totalWarehouseItems')}</p>
                    <p className="text-xl font-bold text-secondary-600 dark:text-secondary-400">
                      {warehouseStock.reduce((sum, item) => sum + (item.quantity || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignStock;
