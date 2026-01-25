import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLayout, getRoom } from '../api/roomApi';
import { getAllProductDimensions } from '../api/roomApi';
import axiosClient from '../api/axiosClient';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import ValidationPanel from './layout/ValidationPanel';
import PreviewPanel from './layout/PreviewPanel';
import { Package, Plus, Trash2, AlertCircle, Wand2, CheckCircle2, XCircle } from 'lucide-react';

const LayoutGenerator = ({ roomId, onSuccess, onClose }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [items, setItems] = useState([]);
  const [showAddProductHint, setShowAddProductHint] = useState(false);
  const [initFromStockEnabled, setInitFromStockEnabled] = useState(true); // Default to enabled
  const [showManualForm, setShowManualForm] = useState(false); // Hide manual form by default
  const [initCaps, setInitCaps] = useState({
    perProductCap: null, // No limit - use all stock
    maxTotalItems: null, // No limit
  });
  const [initPreview, setInitPreview] = useState(null);
  const [options, setOptions] = useState({
    algorithm: 'compartment', // Default to compartment algorithm
    allow_rotation: false, // Always disabled in simplified 2D mode
    max_layers: null,
    prefer_bottom: true,
    minimize_height: false,
    grid: {
      columns: null,
      rows: null,
    },
    column_max_height: null,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [room, setRoom] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  // Auto-populate from stock when all data is ready (only once on initial load)
  const [hasAutoPopulated, setHasAutoPopulated] = useState(false);

  useEffect(() => {
    fetchData();
    fetchRoom();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const roomData = await getRoom(roomId);
      setRoom(roomData);
    } catch (error) {
      console.error('Error fetching room:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, dimensionsResponse, stockResponse] = await Promise.all([
        axiosClient.get('/products'),
        getAllProductDimensions().catch(() => []),
        axiosClient.get('/warehouse-stock').catch(() => ({ data: [] })),
      ]);
      setProducts(productsResponse.data);
      setDimensions(Array.isArray(dimensionsResponse) ? dimensionsResponse : []);
      setWarehouseStock(Array.isArray(stockResponse.data) ? stockResponse.data : []);
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
    // No caps - use all available stock
    const perProductCap = initCaps.perProductCap ? parseInt(initCaps.perProductCap) : null;
    const maxTotalItems = initCaps.maxTotalItems ? parseInt(initCaps.maxTotalItems) : null;

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

      // Apply caps if specified
      let quantityToUse = stockQty;
      if (perProductCap && quantityToUse > perProductCap) {
        quantityToUse = perProductCap;
        excluded.capped.push({ product_id: productId, stock: stockQty, used: quantityToUse });
      }

      if (maxTotalItems && expandedTotal + quantityToUse > maxTotalItems) {
        const remaining = maxTotalItems - expandedTotal;
        if (remaining > 0) {
          quantityToUse = remaining;
          excluded.capped.push({ product_id: productId, stock: stockQty, used: quantityToUse });
        } else {
          break;
        }
      }

      if (quantityToUse <= 0) continue;

      included.push({ product_id: parseInt(productId), quantity: quantityToUse });
      expandedTotal += quantityToUse;
    }

    const preview = {
      included_products: included.length,
      expanded_total: expandedTotal,
      caps: { perProductCap: perProductCap || 'Unlimited', maxTotalItems: maxTotalItems || 'Unlimited' },
      excluded,
    };

    return { included, preview };
  };

  // Auto-populate from stock when all data is ready (only once on initial load)
  useEffect(() => {
    if (!hasAutoPopulated && products.length > 0 && dimensions.length > 0 && warehouseStock.length > 0) {
      // Auto-populate from stock after data is loaded
      const { included } = buildInitFromStock();
      if (included.length > 0) {
        setItems(included);
        setInitFromStockEnabled(true);
        setHasAutoPopulated(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, dimensions.length, warehouseStock.length, hasAutoPopulated]);

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
    if (items.length === 0) {
      showToast(t('pleaseAddProductsFromStock') || 'Please load products from stock or add manually', 'error');
      return false;
    }
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
        product_id: parseInt(product_id), // Ensure integer type
        quantity: parseInt(quantity), // Ensure integer type
      }));

      // Build options object, only including non-null values
      const optionsToSend = {};
      
      if (options.max_layers) {
        optionsToSend.max_layers = parseInt(options.max_layers);
      }
      
      if (options.prefer_bottom !== undefined && options.prefer_bottom !== null) {
        optionsToSend.prefer_bottom = Boolean(options.prefer_bottom);
      }
      
      if (options.minimize_height !== undefined && options.minimize_height !== null) {
        optionsToSend.minimize_height = Boolean(options.minimize_height);
      }
      
      if (options.column_max_height) {
        optionsToSend.column_max_height = parseFloat(options.column_max_height);
      }

      // Only include grid if at least one value is set
      if (options.grid && (options.grid.columns || options.grid.rows)) {
        optionsToSend.grid = {};
        if (options.grid.columns) {
          optionsToSend.grid.columns = parseInt(options.grid.columns);
        }
        if (options.grid.rows) {
          optionsToSend.grid.rows = parseInt(options.grid.rows);
        }
      }

      // Validate items before sending
      if (itemsToSend.length === 0) {
        showToast(t('pleaseAddProductsFromStock') || 'Please add at least one product to generate a layout', 'error');
        setSubmitting(false);
        return;
      }

      // Ensure all product_ids are valid integers
      const validItems = itemsToSend.filter(item => {
        const pid = parseInt(item.product_id);
        const qty = parseInt(item.quantity);
        return !isNaN(pid) && pid > 0 && !isNaN(qty) && qty > 0;
      });

      if (validItems.length === 0) {
        showToast(t('invalidProductData') || 'Invalid product data. Please check your selections.', 'error');
        setSubmitting(false);
        return;
      }

      const data = {
        algorithm: options.algorithm || 'compartment',
        allow_rotation: options.allow_rotation || false,
        items: validItems,
        options: optionsToSend,
      };

      console.log('Sending layout generation request:', JSON.stringify(data, null, 2));

      const response = await generateLayout(roomId, data);
      setResult(response);
      showToast(t('layoutGenerated'), 'success');
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Error generating layout:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error response:', error.response);
      
      // Log validation errors if present
      if (error.response?.data?.errors) {
        console.error('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
      }
      
      // Show detailed error message
      let errorMessage = t('errorGeneratingLayout');
      
      if (error.response?.data) {
        if (error.response.data.errors) {
          // Format validation errors
          const errorObj = error.response.data.errors;
          const errorKeys = Object.keys(errorObj);
          if (errorKeys.length > 0) {
            const firstError = errorObj[errorKeys[0]];
            errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
          } else {
            errorMessage = 'Validation error occurred';
          }
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      
      showToast(errorMessage, 'error');
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

  // Prepare items for validation (with dimensions)
  const itemsForValidation = items
    .filter(item => item.product_id)
    .map(item => {
      const dim = getProductDimensions(item.product_id);
      return {
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity) || 1,
        width: dim?.width || 0,
        depth: dim?.depth || 0,
        height: dim?.height || 0,
      };
    })
    .filter(item => item.width > 0 && item.depth > 0 && item.height > 0);

  return (
    <div className="space-y-6">
      {/* Validation and Preview Panels */}
      {itemsForValidation.length > 0 && room && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValidationPanel
            roomId={roomId}
            items={itemsForValidation}
            onValidationChange={setValidationResult}
          />
          <PreviewPanel
            roomId={roomId}
            items={itemsForValidation}
            room={room}
          />
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Init from Warehouse Stock - Primary Method */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Wand2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('initFromWarehouseStock') || 'Auto-Populate from Warehouse Stock'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('initFromWarehouseStockHint') || 'Automatically uses all products with stock and dimensions. No limits - uses maximum available stock per product.'}
                </p>
              </div>
            </div>
          </div>

          {initFromStockEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('perProductCap') || 'Per-product cap (optional)'}
                  type="number"
                  min="1"
                  value={initCaps.perProductCap || ''}
                  onChange={(e) => setInitCaps((prev) => ({ ...prev, perProductCap: e.target.value || null }))}
                  helpText={t('perProductCapHint') || 'Leave empty to use all available stock per product'}
                  placeholder={t('unlimited') || 'Unlimited - uses all stock'}
                />
                <Input
                  label={t('maxTotalItems') || 'Max total items (optional)'}
                  type="number"
                  min="1"
                  value={initCaps.maxTotalItems || ''}
                  onChange={(e) => setInitCaps((prev) => ({ ...prev, maxTotalItems: e.target.value || null }))}
                  helpText={t('maxTotalItemsHint') || 'Leave empty for unlimited total items'}
                  placeholder={t('unlimited') || 'Unlimited'}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => {
                  const { preview } = buildInitFromStock();
                  setInitPreview(preview);
                }}>
                  {t('preview') || 'Preview Stock'}
                </Button>
                <Button type="button" variant="primary" onClick={populateFromStock}>
                  {t('loadFromStock') || 'Load All from Stock'}
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

        {/* Manual Items Selection - Collapsible */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('manualProductSelection') || 'Manual Product Selection (Optional)'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('manualSelectionHint') || 'Manually add products if you need to override stock quantities'}
              </p>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowManualForm(!showManualForm)} 
              size="sm"
            >
              {showManualForm ? t('hide') : t('showManualForm')}
            </Button>
          </div>

          {showManualForm && (
            <>
              <div className="flex justify-end mb-4">
                <Button type="button" variant="secondary" onClick={addItem} size="sm" className="flex-shrink-0">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addProduct')}
                </Button>
              </div>
              {items.length === 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {t('noProductsAdded') || 'No products added manually. Use "Load All from Stock" above to auto-populate.'}
                  </p>
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
                      <div className="flex items-center justify-between">
                        <div>
                          <strong>{t('dimensions')}:</strong> {parseFloat(productDim.width || 0).toFixed(0)} × {parseFloat(productDim.depth || 0).toFixed(0)} × {parseFloat(productDim.height || 0).toFixed(0)} cm
                          {productDim.weight && ` | ${t('weight')}: ${parseFloat(productDim.weight).toFixed(2)} kg`}
                        </div>
                        {/* Stock indicator */}
                        {(() => {
                          const stock = warehouseStock.find(s => s.product_id === parseInt(item.product_id));
                          const available = stock?.quantity || 0;
                          const requested = parseInt(item.quantity) || 0;
                          const hasStock = available >= requested;
                          return (
                            <div className="flex items-center gap-1">
                              {hasStock ? (
                                <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
                              )}
                              <span className={hasStock ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}>
                                {available} {t('available') || 'available'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
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
            </>
          )}

          {/* Show current items count if items exist */}
          {items.length > 0 && !showManualForm && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>{items.length}</strong> {t('productsLoaded') || 'products loaded'} ({items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)} {t('totalItems') || 'total items'})
              </p>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowManualForm(true)}
                className="mt-2"
              >
                {t('viewOrEdit') || 'View/Edit Products'}
              </Button>
            </div>
          )}
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
                { value: 'compartment', label: 'Compartment (Grid-based by Product)' },
                { value: 'compartment_grid', label: 'Compartment Grid' },
                { value: 'laff_maxrects', label: 'LAFF + MaxRects (Legacy)' },
              ]}
            />
            {options.algorithm === 'compartment' || options.algorithm === 'compartment_grid' ? (
              <div className="space-y-2">
                <Input
                  label={t('gridColumns') || 'Grid Columns (optional)'}
                  type="number"
                  min="1"
                  value={options.grid.columns || ''}
                  onChange={(e) => setOptions({
                    ...options,
                    grid: { ...options.grid, columns: e.target.value ? parseInt(e.target.value) : null }
                  })}
                  placeholder={t('auto') || 'Auto'}
                />
                <Input
                  label={t('gridRows') || 'Grid Rows (optional)'}
                  type="number"
                  min="1"
                  value={options.grid.rows || ''}
                  onChange={(e) => setOptions({
                    ...options,
                    grid: { ...options.grid, rows: e.target.value ? parseInt(e.target.value) : null }
                  })}
                  placeholder={t('auto') || 'Auto'}
                />
                <Input
                  label={t('columnMaxHeight') || 'Column Max Height (cm, optional)'}
                  type="number"
                  min="0"
                  value={options.column_max_height || ''}
                  onChange={(e) => setOptions({
                    ...options,
                    column_max_height: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  placeholder={t('roomHeight') || 'Room Height'}
                />
              </div>
            ) : null}
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
          <Button 
            type="submit" 
            disabled={
              submitting || 
              items.length === 0 || 
              items.every(item => !item.product_id) ||
              (validationResult && !validationResult.valid)
            }
          >
            {submitting ? t('generatingLayout') : t('generateLayout')}
          </Button>
          {validationResult && !validationResult.valid && (
            <div className="flex items-center gap-2 text-error-600 dark:text-error-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{t('fixValidationErrors') || 'Please fix validation errors before generating'}</span>
            </div>
          )}
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
