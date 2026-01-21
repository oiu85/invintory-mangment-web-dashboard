import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLayout } from '../api/roomApi';
import { getAllProductDimensions } from '../api/roomApi';
import axiosClient from '../api/axiosClient';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { Package, Plus, Trash2, AlertCircle, Wand2 } from 'lucide-react';

const LayoutGenerator = ({ roomId, onSuccess, onClose }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [showAddProductHint, setShowAddProductHint] = useState(true);
  const [initFromStockEnabled, setInitFromStockEnabled] = useState(false);
  const [initCaps, setInitCaps] = useState({
    perProductCap: 25,
    maxTotalItems: 500,
  });
  const [initPreview, setInitPreview] = useState(null);
  const [options, setOptions] = useState({
    algorithm: 'laff_maxrects',
    allow_rotation: false, // Always disabled in simplified 2D mode
    max_layers: null,
    prefer_bottom: true,
    minimize_height: false,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, dimensionsResponse] = await Promise.all([
        axiosClient.get('/products'),
        getAllProductDimensions().catch(() => []),
      ]);
      setProducts(productsResponse.data);
      setDimensions(Array.isArray(dimensionsResponse) ? dimensionsResponse : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast(t('errorLoadingProducts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProductDimensions = (productId) => {
    return dimensions.find(d => d.product_id === parseInt(productId));
  };

  const fetchWarehouseStock = async () => {
    try {
      const response = await axiosClient.get('/warehouse-stock');
      setWarehouseStock(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching warehouse stock:', error);
      // don't block layout generation if stock fetch fails
    }
  };

  useEffect(() => {
    fetchWarehouseStock();
  }, []);

  const addItem = () => {
    setItems((prev) => [...prev, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const buildInitFromStock = () => {
    const perProductCap = Math.max(1, parseInt(initCaps.perProductCap) || 25);
    const maxTotalItems = Math.max(1, parseInt(initCaps.maxTotalItems) || 500);

    const dimensionByProductId = new Map(
      (dimensions || []).map((d) => [d.product_id, d])
    );

    const included = [];
    const excluded = {
      zeroStock: [],
      missingDimensions: [],
      capped: [],
    };

    let expandedTotal = 0;

    for (const stockItem of warehouseStock || []) {
      const productId = stockItem.product_id;
      const stockQty = parseInt(stockItem.quantity || 0) || 0;

      if (!productId) continue;
      if (stockQty <= 0) {
        excluded.zeroStock.push(productId);
        continue;
      }

      const dim = dimensionByProductId.get(productId);
      if (!dim) {
        excluded.missingDimensions.push(productId);
        continue;
      }

      const remaining = maxTotalItems - expandedTotal;
      if (remaining <= 0) break;

      const cappedQty = Math.min(stockQty, perProductCap, remaining);
      if (cappedQty <= 0) continue;

      if (cappedQty < stockQty) {
        excluded.capped.push({ product_id: productId, stock: stockQty, used: cappedQty });
      }

      included.push({ product_id: String(productId), quantity: cappedQty });
      expandedTotal += cappedQty;
    }

    const preview = {
      included_products: included.length,
      expanded_total: expandedTotal,
      caps: { perProductCap, maxTotalItems },
      excluded,
    };

    return { included, preview };
  };

  const populateFromStock = () => {
    const { included, preview } = buildInitFromStock();
    setInitPreview(preview);

    if (included.length === 0) {
      showToast(t('noStockProductsToInit') || 'No stock products with dimensions to initialize', 'error');
      return;
    }

    setItems(included);
    showToast(t('initializedFromStock') || 'Initialized items from warehouse stock', 'success');
  };

  const validateItems = () => {
    for (const item of items) {
      if (!item.product_id) {
        showToast(t('pleaseSelectProduct'), 'error');
        return false;
      }
      if (!item.quantity || item.quantity < 1) {
        showToast(t('quantityMustBePositive'), 'error');
        return false;
      }
      const dim = getProductDimensions(item.product_id);
      if (!dim) {
        showToast(t('productMissingDimensions'), 'error');
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!validateItems()) {
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      // Merge duplicate product rows (recommended)
      const merged = new Map();
      for (const item of items) {
        if (!item.product_id) continue;
        const pid = parseInt(item.product_id);
        const qty = parseInt(item.quantity) || 0;
        if (!pid || qty <= 0) continue;
        merged.set(pid, (merged.get(pid) || 0) + qty);
      }

      const itemsToSend = Array.from(merged.entries()).map(([product_id, quantity]) => ({
        product_id,
        quantity,
      }));

      const data = {
        algorithm: options.algorithm,
        allow_rotation: options.allow_rotation,
        items: itemsToSend,
        options: {
          max_layers: options.max_layers ? parseInt(options.max_layers) : null,
          prefer_bottom: options.prefer_bottom,
          minimize_height: options.minimize_height,
        },
      };

      const response = await generateLayout(roomId, data);
      setResult(response);
      showToast(t('layoutGenerated'), 'success');
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error generating layout:', error);
      showToast(error.response?.data?.message || error.response?.data?.error || t('errorGeneratingLayout'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }

  const productsWithDimensions = products.filter(p => getProductDimensions(p.id));

  return (
    <div className="space-y-6">
      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Init from Warehouse Stock */}
        <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('initFromWarehouseStock') || 'Init from Warehouse Stock'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('initFromWarehouseStockHint') || 'Populate items using warehouse stock (capped for performance)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="init_from_stock"
                checked={initFromStockEnabled}
                onChange={(e) => setInitFromStockEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="init_from_stock" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                {t('enabled') || 'Enabled'}
              </label>
            </div>
          </div>

          {initFromStockEnabled && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Input
                label={t('perProductCap') || 'Per-product cap'}
                type="number"
                min="1"
                value={initCaps.perProductCap}
                onChange={(e) => setInitCaps((prev) => ({ ...prev, perProductCap: e.target.value }))}
                helpText={t('perProductCapHint') || 'Default 25'}
              />
              <Input
                label={t('maxTotalItems') || 'Max total items'}
                type="number"
                min="1"
                value={initCaps.maxTotalItems}
                onChange={(e) => setInitCaps((prev) => ({ ...prev, maxTotalItems: e.target.value }))}
                helpText={t('maxTotalItemsHint') || 'Default 500'}
              />
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => {
                  const { preview } = buildInitFromStock();
                  setInitPreview(preview);
                }}>
                  {t('preview') || 'Preview'}
                </Button>
                <Button type="button" variant="primary" onClick={populateFromStock}>
                  {t('populate') || 'Populate'}
                </Button>
              </div>

              {initPreview && (
                <div className="md:col-span-3 mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded border border-indigo-200 dark:border-indigo-800 text-sm">
                  <div className="flex flex-wrap gap-4 text-indigo-900 dark:text-indigo-200">
                    <span>
                      {t('includedProducts') || 'Included products'}: <strong>{initPreview.included_products}</strong>
                    </span>
                    <span>
                      {t('expandedTotal') || 'Expanded total'}: <strong>{initPreview.expanded_total}</strong>
                    </span>
                    <span>
                      {t('caps') || 'Caps'}: <strong>{initPreview.caps.perProductCap}/{initPreview.caps.maxTotalItems}</strong>
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-indigo-800 dark:text-indigo-300">
                    {t('excludedMissingDimensions') || 'Missing dimensions'}: {initPreview.excluded.missingDimensions.length} |{' '}
                    {t('excludedZeroStock') || 'Zero stock'}: {initPreview.excluded.zeroStock.length} |{' '}
                    {t('excludedCapped') || 'Capped'}: {initPreview.excluded.capped.length}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('selectProducts')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('addMultipleProductsHint') || 'You can add multiple products to optimize space utilization'}
                <br />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {t('simplified2DMode') || 'Simplified 2D mode: Products will be placed on floor only (no rotation, no stacking)'}
                </span>
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={addItem} size="sm" className="flex-shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              {t('addProduct')}
            </Button>
          </div>
          {items.length === 1 && showAddProductHint && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {t('tipAddMoreProducts') || 'Tip: Click "Add Product" to place multiple products in this room'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProductHint(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                ×
              </button>
            </div>
          )}
          <div className="space-y-4">
            {items.map((item, index) => {
              const productDim = getProductDimensions(item.product_id);
              const selectedProduct = products.find(p => p.id === parseInt(item.product_id));

              return (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Select
                        label={t('product')}
                        value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        options={[
                          { value: '', label: t('selectProduct') },
                          ...productsWithDimensions.map(p => ({
                            value: p.id,
                            label: `${p.name}${productDim ? ` (${parseFloat(productDim.width || 0).toFixed(0)}×${parseFloat(productDim.depth || 0).toFixed(0)}×${parseFloat(productDim.height || 0).toFixed(0)} cm)` : ''}`
                          }))
                        ]}
                        required
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        label={t('quantity')}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <div className="pt-7">
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {productDim && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
                      <strong>{t('dimensions')}:</strong> {parseFloat(productDim.width || 0).toFixed(0)} × {parseFloat(productDim.depth || 0).toFixed(0)} × {parseFloat(productDim.height || 0).toFixed(0)} cm
                      {productDim.weight && ` | ${t('weight')}: ${parseFloat(productDim.weight).toFixed(2)} kg`}
                    </div>
                  )}
                  {item.product_id && !productDim && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {t('productMissingDimensions')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Algorithm Options */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('algorithmOptions')}</h3>
          <div className="space-y-4">
            <Select
              label={t('algorithm')}
              value={options.algorithm}
              onChange={(e) => setOptions({ ...options, algorithm: e.target.value })}
              options={[
                { value: 'laff_maxrects', label: 'LAFF + MaxRects' },
              ]}
            />
            <div className="flex items-center gap-2 opacity-50">
              <input
                type="checkbox"
                id="allow_rotation"
                checked={false}
                disabled
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="allow_rotation" className="text-sm text-gray-700 dark:text-gray-300">
                {t('allowRotation')} ({t('simplifiedModeDisabled') || 'Simplified mode: disabled'})
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prefer_bottom"
                checked={options.prefer_bottom}
                onChange={(e) => setOptions({ ...options, prefer_bottom: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="prefer_bottom" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                {t('preferBottom')}
              </label>
            </div>
            <Input
              label={t('maxLayers')}
              type="number"
              min="1"
              value={options.max_layers || ''}
              onChange={(e) => setOptions({ ...options, max_layers: e.target.value || null })}
              placeholder={t('optional')}
            />
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('generationResults')}</h3>
            <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('utilizationPercentage')}</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {parseFloat(result.utilization_percentage || 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('itemsPlacedCount')}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.total_items_placed || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('itemsUnplaced')}</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {result.unplaced_items?.length || 0}
                </p>
              </div>
            </div>
            {result.unplaced_items && result.unplaced_items.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">{t('unplacedItems')}</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400">
                  {result.unplaced_items.map((item, idx) => (
                    <li key={idx}>
                      Product #{item.product_id}: {item.quantity} {t('units')} - {item.reason || t('noSpaceAvailable')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="submit" disabled={submitting || items.length === 0}>
            {submitting ? t('generatingLayout') : t('generateLayout')}
          </Button>
          {onClose && (
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('close')}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LayoutGenerator;
