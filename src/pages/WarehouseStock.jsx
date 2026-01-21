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
import { Package, AlertTriangle, AlertCircle, CheckCircle2, TrendingUp, MapPin, Layers } from 'lucide-react';
import Card from '../components/Card';
import { useLanguage } from '../context/LanguageContext';
import { applySuggestion, getRooms } from '../api/roomApi';

const WarehouseStock = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applyingSuggestion, setApplyingSuggestion] = useState(false);
  const [storageSuggestions, setStorageSuggestions] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
  });
  const [oldQuantity, setOldQuantity] = useState(0);

  useEffect(() => {
    fetchStock();
    fetchProducts();
    fetchRooms();
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

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleUpdate = (stockItem) => {
    setFormData({
      product_id: stockItem.product_id,
      quantity: stockItem.quantity,
    });
    setOldQuantity(stockItem.quantity || 0);
    setCurrentProduct(stockItem.product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('product_id', formData.product_id);
    formDataToSend.append('quantity', formData.quantity);

    try {
      const response = await axiosClient.post('/warehouse-stock/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setIsModalOpen(false);
      fetchStock();
      showToast(t('stockUpdated'), 'success');

      // If quantity increased and a room is selected, place the delta into that room
      const newQuantity = parseInt(formData.quantity);
      const delta = Math.max(0, newQuantity - oldQuantity);
      if (delta > 0 && selectedRoomId) {
        try {
          const placeResponse = await axiosClient.post('/warehouse-stock/place', {
            room_id: parseInt(selectedRoomId),
            product_id: parseInt(formData.product_id),
            quantity: delta,
          });

          const placed = placeResponse.data.placed ?? 0;
          const unplaced = placeResponse.data.unplaced ?? 0;

          const roomName =
            rooms.find((r) => r.id === parseInt(selectedRoomId))?.name || '';

          if (placed > 0) {
            showToast(
              `${placed} ${t('unitsPlacedInRoom')} ${roomName}`,
              'success'
            );
          }

          if (unplaced > 0) {
            showToast(
              `${unplaced} ${t('unitsCouldNotBePlacedInRoom')} ${roomName}`,
              'warning'
            );
          }
        } catch (error) {
          console.error('Error placing stock into room:', error);
          showToast(
            error.response?.data?.message || t('errorPlacingIntoRoom'),
            'error'
          );
        }
      }

      // Check if response includes storage suggestions
      if (response.data.suggestion_id && response.data.feedback) {
        setStorageSuggestions({
          suggestion_id: response.data.suggestion_id,
          feedback: response.data.feedback,
          raw_suggestions: response.data.raw_suggestions || [],
        });
        setIsSuggestionsModalOpen(true);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast(error.response?.data?.message || t('errorUpdatingStock'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplySuggestion = async (suggestion, roomId) => {
    setApplyingSuggestion(true);
    try {
      const suggestionData = {
        suggestion_id: storageSuggestions.suggestion_id,
        room_id: roomId,
        product_id: parseInt(formData.product_id),
        x_position: suggestion.x,
        y_position: suggestion.y,
        z_position: suggestion.z,
        quantity_to_place: 1, // Place one item at a time
        rotation: suggestion.rotation || '0',
        type: suggestion.type,
        stack_id: suggestion.stack_id || null,
        stack_position: suggestion.stack_position || null,
        stack_base_x: suggestion.stack_base_x || suggestion.x,
        stack_base_y: suggestion.stack_base_y || suggestion.y,
        items_below_count: suggestion.items_below_count || 0,
      };

      await applySuggestion(suggestionData);
      showToast(t('suggestionApplied'), 'success');
      setIsSuggestionsModalOpen(false);
      setStorageSuggestions(null);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      showToast(error.response?.data?.message || t('errorApplyingSuggestion'), 'error');
    } finally {
      setApplyingSuggestion(false);
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

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchProductsOrCategories')}
          className="max-w-md"
        />
        <div className="flex items-end gap-2">
          <Select
            label={t('selectRoomForPlacement')}
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            options={[
              { value: '', label: t('noRoomSelected') },
              ...rooms.map((room) => ({
                value: room.id,
                label: room.name,
              })),
            ]}
          />
        </div>
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

      {/* Storage Suggestions Modal */}
      <Modal
        isOpen={isSuggestionsModalOpen}
        onClose={() => {
          setIsSuggestionsModalOpen(false);
          setStorageSuggestions(null);
        }}
        title={t('storageSuggestions')}
        size="xl"
      >
        {storageSuggestions && (
          <div className="space-y-6">
            {/* Summary */}
            {storageSuggestions.feedback?.summary && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {storageSuggestions.feedback.summary}
                </p>
              </div>
            )}

            {/* Room Suggestions */}
            {storageSuggestions.raw_suggestions && storageSuggestions.raw_suggestions.length > 0 ? (
              <div className="space-y-4">
                {storageSuggestions.raw_suggestions.map((roomSuggestion, roomIdx) => (
                  <div key={roomIdx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {roomSuggestion.room?.name || `Room #${roomSuggestion.room?.id}`}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {parseFloat(roomSuggestion.room?.width || 0).toFixed(0)} × {parseFloat(roomSuggestion.room?.depth || 0).toFixed(0)} × {parseFloat(roomSuggestion.room?.height || 0).toFixed(0)} cm
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('currentUtilization')}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {parseFloat(roomSuggestion.current_utilization || 0).toFixed(1)}%
                        </p>
                        {roomSuggestion.projected_utilization && (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('projectedUtilization')}</p>
                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                              {parseFloat(roomSuggestion.projected_utilization).toFixed(1)}%
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Suggestions List */}
                    {roomSuggestion.suggestions && roomSuggestion.suggestions.length > 0 && (
                      <div className="space-y-2">
                        {roomSuggestion.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              suggestion.type === 'stack'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {suggestion.type === 'stack' ? (
                                  <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
                                ) : (
                                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {suggestion.type === 'stack' ? t('stackType') : t('newSpotType')}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {t('position')}: ({parseFloat(suggestion.x || 0).toFixed(1)}, {parseFloat(suggestion.y || 0).toFixed(1)}, {parseFloat(suggestion.z || 0).toFixed(1)})
                                    {suggestion.stack_position && ` | ${t('stackPosition')}: ${suggestion.stack_position}`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleApplySuggestion(suggestion, roomSuggestion.room.id)}
                                disabled={applyingSuggestion}
                              >
                                {applyingSuggestion ? t('applying') : t('applySuggestion')}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {roomSuggestion.unplaced_in_room > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-300">
                        {roomSuggestion.unplaced_in_room} {t('itemsUnplaced')} {t('inThisRoom')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{t('noSuggestions')}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" onClick={() => {
                setIsSuggestionsModalOpen(false);
                setStorageSuggestions(null);
              }}>
                {t('dismiss')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseStock;
