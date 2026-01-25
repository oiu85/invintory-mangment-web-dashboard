import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoom, getRoomStats, getLayout, getPlacements, deleteLayout, calculateRoomCapacity } from '../api/roomApi';
import axiosClient from '../api/axiosClient';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import ConfirmModal from '../components/ConfirmModal';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/ui/ErrorState';
import Room2DView from '../components/Room2DView';
import Room3DView from '../components/Room3DView';
import DoorConfig from '../components/DoorConfig';
import { Building2, Package, TrendingUp, Box, List, History, ArrowLeft, Maximize2, Trash2, Grid3x3, Boxes, DoorOpen, AlertCircle } from 'lucide-react';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [room, setRoom] = useState(null);
  const [stats, setStats] = useState(null);
  const [layout, setLayout] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('layout');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [doorUpdateKey, setDoorUpdateKey] = useState(0);
  const [products, setProducts] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [productCompatibility, setProductCompatibility] = useState({});

  useEffect(() => {
    fetchRoomData();
    fetchProductsAndStock();
  }, [id]);

  const fetchProductsAndStock = async () => {
    try {
      const [productsResponse, stockResponse] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/warehouse-stock'),
      ]);
      setProducts(productsResponse.data || []);
      setWarehouseStock(stockResponse.data || []);
      
      // Calculate product compatibility
      if (room) {
        calculateCompatibility();
      }
    } catch (error) {
      console.error('Error fetching products and stock:', error);
    }
  };

  const calculateCompatibility = async () => {
    if (!room || products.length === 0) return;

    const compatibility = {};
    for (const product of products) {
      if (product.product_dimension) {
        const dim = product.product_dimension;
        const fits = 
          dim.width <= room.width &&
          dim.depth <= room.depth &&
          dim.height <= room.height;
        
        compatibility[product.id] = {
          fits,
          dimensions: `${dim.width}×${dim.depth}×${dim.height} cm`,
          stock: warehouseStock.find(s => s.product_id === product.id)?.quantity || 0,
        };
      }
    }
    setProductCompatibility(compatibility);
  };

  useEffect(() => {
    if (room && products.length > 0) {
      calculateCompatibility();
    }
  }, [room, products, warehouseStock]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const [roomData, statsData] = await Promise.all([
        getRoom(id),
        getRoomStats(id).catch(() => null),
      ]);
      console.log('Fetched room data:', roomData);
      console.log('Room door:', roomData?.door);
      setRoom(roomData);
      setStats(statsData);

      // Try to fetch layout and placements
      try {
        const layoutData = await getLayout(id);
        // getLayout returns the layout object with layout_data
        if (layoutData && typeof layoutData === 'object' && !layoutData.message && !layoutData.error) {
          // Store the full layout object, not just layout_data
          // This includes compartment_config, grid_columns, grid_rows
          setLayout({
            ...layoutData.layout_data,
            // Include compartment and grid data from the layout object
            compartments: layoutData.layout_data?.compartments || layoutData.compartment_config?.compartments || [],
            grid: layoutData.layout_data?.grid || (layoutData.grid_columns && layoutData.grid_rows ? {
              columns: layoutData.grid_columns,
              rows: layoutData.grid_rows,
            } : null),
          });
        } else {
          setLayout(null);
        }
      } catch (error) {
        // Layout might not exist (404 is expected)
        if (error.response?.status !== 404) {
          console.error('Error fetching layout:', error);
        }
        setLayout(null);
      }

      try {
        const placementsData = await getPlacements(id);
        // Ensure placements is always an array
        if (Array.isArray(placementsData)) {
          setPlacements(placementsData);
        } else if (placementsData && Array.isArray(placementsData.placements)) {
          setPlacements(placementsData.placements);
        } else {
          setPlacements([]);
        }
      } catch (error) {
        // Placements might not exist
        if (error.response?.status !== 404) {
          console.error('Error fetching placements:', error);
        }
        setPlacements([]);
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
      showToast(t('errorLoadingRooms'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLayout = async () => {
    try {
      await deleteLayout(id);
      showToast(t('layoutDeleted'), 'success');
      setLayout(null);
      setPlacements([]);
      setIsDeleteModalOpen(false);
      fetchRoomData();
    } catch (error) {
      console.error('Error deleting layout:', error);
      showToast(t('errorDeletingLayout'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={<Skeleton variant="heading" className="w-48" />}
          subtitle={<Skeleton variant="text" className="w-64" />}
        />
        <Card variant="glass">
          <Card.Body>
            <div className="space-y-4">
              <Skeleton variant="title" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={t('roomNotFound')}
          subtitle={t('roomNotFoundMessage')}
        />
        <EmptyState
          icon={AlertCircle}
          title={t('roomNotFound')}
          description={t('roomNotFoundMessage')}
          action={() => navigate('/rooms')}
          actionLabel={t('backToRooms')}
        />
      </div>
    );
  }

  const roomVolume = parseFloat(room.width || 0) * parseFloat(room.depth || 0) * parseFloat(room.height || 0);
  const roomArea = parseFloat(room.width || 0) * parseFloat(room.depth || 0);
  
  // Get latest layout from room.layouts or use fetched layout
  const latestLayoutFromRoom = room.layouts && Array.isArray(room.layouts) && room.layouts.length > 0 
    ? room.layouts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]
    : null;
  
  // Handle layout data structure - it could be a RoomLayout model or layout_data JSON
  let latestLayout = latestLayoutFromRoom;
  if (!latestLayout && layout) {
    // Check if layout has utilization_percentage directly (from API response)
    if (layout.utilization_percentage !== undefined) {
      latestLayout = layout;
    } else if (layout.utilization !== undefined) {
      // If it's from layout_data JSON
      latestLayout = {
        utilization_percentage: layout.utilization,
        total_items_placed: layout.placements?.length || 0,
        total_items_attempted: (layout.placements?.length || 0) + (layout.unplaced_items?.length || 0),
        algorithm_used: layout.algorithm || 'compartment',
        compartment_config: layout.compartments ? { compartments: layout.compartments } : null,
        grid_columns: layout.grid?.columns || null,
        grid_rows: layout.grid?.rows || null,
      };
    }
  }
  
  // Safely extract utilization percentage, ensuring it's always a number
  let utilization = 0;
  if (latestLayout) {
    const utilValue = latestLayout.utilization_percentage ?? latestLayout.utilization ?? 0;
    if (utilValue !== null && utilValue !== undefined) {
      const parsed = typeof utilValue === 'number' ? utilValue : parseFloat(String(utilValue));
      utilization = (!isNaN(parsed) && isFinite(parsed)) ? parsed : 0;
    }
  }
  
  // Final safety check - ensure utilization is always a valid number
  if (typeof utilization !== 'number' || isNaN(utilization) || !isFinite(utilization)) {
    utilization = 0;
  }
  
  // Clamp utilization between 0 and 100
  utilization = Math.max(0, Math.min(100, utilization));
  
  // StatCard component (similar to Dashboard)
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorConfigs = {
      blue: {
        bg: 'bg-primary-50 dark:bg-primary-900/20',
        iconBg: 'bg-primary-100 dark:bg-primary-900/30',
        text: 'text-primary-600 dark:text-primary-400',
      },
      green: {
        bg: 'bg-success-50 dark:bg-success-900/20',
        iconBg: 'bg-success-100 dark:bg-success-900/30',
        text: 'text-success-600 dark:text-success-400',
      },
      purple: {
        bg: 'bg-secondary-50 dark:bg-secondary-900/20',
        iconBg: 'bg-secondary-100 dark:bg-secondary-900/30',
        text: 'text-secondary-600 dark:text-secondary-400',
      },
      orange: {
        bg: 'bg-warning-50 dark:bg-warning-900/20',
        iconBg: 'bg-warning-100 dark:bg-warning-900/30',
        text: 'text-warning-600 dark:text-warning-400',
      },
      red: {
        bg: 'bg-error-50 dark:bg-error-900/20',
        iconBg: 'bg-error-100 dark:bg-error-900/30',
        text: 'text-error-600 dark:text-error-400',
      },
    };

    const config = colorConfigs[color] || colorConfigs.blue;

    return (
      <Card variant="glass" className="overflow-hidden">
        <Card.Body>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${config.iconBg}`}>
              <Icon className={`w-6 h-6 ${config.text}`} />
            </div>
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

  const tabs = [
    { id: 'layout', label: t('layoutView'), icon: Maximize2 },
    { id: 'placements', label: t('placements'), icon: List },
    { id: 'history', label: t('history'), icon: History },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title={room.name}
        subtitle={room.warehouse?.name || t('nA')}
        showBack
        backPath="/rooms"
        actions={
          <Badge
            variant={
              room.status === 'active' ? 'success' :
              room.status === 'maintenance' ? 'warning' : 'default'
            }
            size="lg"
          >
            {t(room.status)}
          </Badge>
        }
      />

      {/* Room Information Card */}
      <Card variant="glass" className="mb-6">
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('roomDimensions')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {parseFloat(room.width || 0).toFixed(0)} × {parseFloat(room.depth || 0).toFixed(0)} × {parseFloat(room.height || 0).toFixed(0)} {t('cm')}
              </p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('roomVolume')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {(roomVolume / 1000000).toFixed(2)} {t('m3')}
              </p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('roomArea')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {(roomArea / 10000).toFixed(2)} {t('m2')}
              </p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('roomWarehouse')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                {room.warehouse?.name || t('nA')}
              </p>
            </div>
          </div>
          {room.description && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('roomDescription')}</p>
              <p className="text-neutral-900 dark:text-white">{room.description}</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Room Capacity Information */}
      <Card variant="glass" className="mb-6">
        <Card.Body>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            {t('roomCapacity') || 'Room Capacity'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                {t('totalVolume') || 'Total Volume'}
              </p>
              <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                {(roomVolume / 1000000).toFixed(2)} m³
              </p>
            </div>
            <div className="p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                {t('floorArea') || 'Floor Area'}
              </p>
              <p className="text-xl font-bold text-success-600 dark:text-success-400">
                {(roomArea / 10000).toFixed(2)} m²
              </p>
            </div>
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                {t('maxHeight') || 'Maximum Height'}
              </p>
              <p className="text-xl font-bold text-warning-600 dark:text-warning-400">
                {parseFloat(room.height || 0).toFixed(0)} cm
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Product Compatibility */}
      {Object.keys(productCompatibility).length > 0 && (
        <Card variant="glass" className="mb-6">
          <Card.Body>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              {t('productCompatibility') || 'Product Compatibility'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(productCompatibility).slice(0, 9).map(([productId, compat]) => {
                const product = products.find(p => p.id === parseInt(productId));
                if (!product) return null;
                
                return (
                  <div
                    key={productId}
                    className={`p-3 rounded-lg border-2 ${
                      compat.fits
                        ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                        : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                        {product.name}
                      </span>
                      <Badge variant={compat.fits ? 'success' : 'error'}>
                        {compat.fits ? t('fits') || 'Fits' : t('doesNotFit') || "Doesn't Fit"}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                      {t('dimensions')}: {compat.dimensions}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {t('stock')}: {compat.stock} {t('units') || 'units'}
                    </p>
                  </div>
                );
              })}
            </div>
            {Object.keys(productCompatibility).length > 9 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4 text-center">
                {t('showingFirst9Products') || 'Showing first 9 products. Use layout generator to see all.'}
              </p>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title={t('roomUtilization')}
          value={`${utilization.toFixed(1)}%`}
          icon={TrendingUp}
          color={utilization >= 80 ? 'green' : utilization >= 50 ? 'orange' : 'red'}
          subtitle={latestLayout ? t('currentLayout') : t('noLayout')}
        />
        <StatCard
          title={t('itemsPlaced')}
          value={placements.length || (latestLayout?.total_items_placed || 0)}
          icon={Package}
          color="blue"
          subtitle={t('itemsInRoom')}
        />
        <StatCard
          title={t('availableSpace')}
          value={`${(((100 - Math.max(0, Math.min(100, utilization))) / 100) * roomVolume / 1000000).toFixed(2)} ${t('m3')}`}
          icon={Box}
          color="purple"
          subtitle={t('remainingCapacity')}
        />
      </div>

      {/* Door Configuration */}
      <div className="mb-6">
        <DoorConfig 
          roomId={id} 
          room={room} 
          onUpdate={() => {
            fetchRoomData();
            // Force re-render of views by updating key
            setDoorUpdateKey(prev => prev + 1);
          }} 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <Button onClick={() => navigate(`/rooms/${id}/generate-layout`)}>
          {t('generateLayout')}
        </Button>
        {latestLayout && (
          <>
            <Button variant="secondary" onClick={() => {
              // For now, optimize just regenerates - can be enhanced later
              navigate(`/rooms/${id}/generate-layout`);
            }}>
              {t('optimizeLayout')}
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} icon={Trash2}>
              {t('clearLayout')}
            </Button>
          </>
        )}
      </div>

      {/* Tabs */}
      <Card variant="glass">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          <div className="p-6">
          {/* Layout View Tab */}
          {activeTab === 'layout' && (
            <div>
              {latestLayout ? (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t('layoutInformation')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('algorithm')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{latestLayout.algorithm_used || layout?.algorithm || t('algorithm')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('utilizationPercentage')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{utilization.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('itemsPlacedCount')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{latestLayout.total_items_placed || layout?.placements?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('itemsAttempted')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{latestLayout.total_items_attempted || ((layout?.placements?.length || 0) + (layout?.unplaced_items?.length || 0))}</p>
                      </div>
                    </div>
                  </div>
                  {/* Visualization Toggle - Always show if layout exists */}
                  {latestLayout && (
                    <div className="mb-4 flex gap-2 justify-end">
                      <Button
                        variant={viewMode === '2d' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('2d')}
                      >
                        <Grid3x3 className="w-4 h-4 mr-2" />
                        {t('view2D')}
                      </Button>
                      <Button
                        variant={viewMode === '3d' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('3d')}
                      >
                        <Boxes className="w-4 h-4 mr-2" />
                        {t('view3D')}
                      </Button>
                    </div>
                  )}

                  {/* Visualization */}
                  {latestLayout ? (
                    viewMode === '2d' ? (
                      <Room2DView 
                        key={`2d-view-${doorUpdateKey}`}
                        room={room} 
                        placements={placements || []}
                        door={room?.door}
                        compartments={
                          layout?.compartments || 
                          (typeof latestLayoutFromRoom?.compartment_config === 'object' && latestLayoutFromRoom?.compartment_config?.compartments) ||
                          latestLayoutFromRoom?.layout_data?.compartments || 
                          []
                        }
                        layout={{
                          ...(layout || latestLayoutFromRoom?.layout_data || {}),
                          grid: layout?.grid || 
                            (latestLayoutFromRoom?.grid_columns && latestLayoutFromRoom?.grid_rows ? {
                              columns: latestLayoutFromRoom.grid_columns,
                              rows: latestLayoutFromRoom.grid_rows,
                            } : null) ||
                            latestLayoutFromRoom?.layout_data?.grid || null
                        }}
                      />
                    ) : (
                      <Room3DView 
                        key={`3d-view-${doorUpdateKey}`}
                        room={room} 
                        placements={placements || []}
                        door={room?.door}
                      />
                    )
                  ) : (
                    <div className="glass rounded-lg p-8 text-center">
                      <p className="text-neutral-600 dark:text-neutral-400 mb-4">{t('visualizationPlaceholder') || 'No layout available'}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-500">{t('visualizationComingSoon') || 'Generate a layout to see visualization'}</p>
                    </div>
                  )}

                  {/* Overflow / Unplaced Items */}
                  {(layout?.unplaced_items?.length || 0) > 0 && (
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                        {t('unplacedItems') || 'Unplaced (Overflow) Items'}
                      </h4>
                      <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                        {layout.unplaced_items.slice(0, 50).map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-4">
                            <span>
                              {item.product_id ? `#${item.product_id}` : t('nA')} {item.reason ? `- ${item.reason}` : ''}
                            </span>
                            <span className="font-mono text-xs">
                              {parseFloat(item.width || 0).toFixed(0)}×{parseFloat(item.depth || 0).toFixed(0)}×{parseFloat(item.height || 0).toFixed(0)}
                            </span>
                          </div>
                        ))}
                        {layout.unplaced_items.length > 50 && (
                          <p className="text-xs mt-2">
                            {t('showingFirst')} 50 / {layout.unplaced_items.length}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noLayoutFound')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{t('generateLayoutToStart')}</p>
                  <Button onClick={() => navigate(`/rooms/${id}/generate-layout`)}>
                    {t('generateLayout')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div>
              {placements.length > 0 ? (
                <Table
                  headers={[t('product'), t('position'), t('dimensions'), t('rotation'), t('stackInfo')]}
                  data={placements}
                  renderRow={(placement) => (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {placement.product?.name || `${t('productNumber')}${placement.product_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        <span className="font-mono text-xs">
                          {t('xPosition')}: {parseFloat(placement.x_position || 0).toFixed(1)}<br />
                          {t('yPosition')}: {parseFloat(placement.y_position || 0).toFixed(1)}<br />
                          {t('zPosition')}: {parseFloat(placement.z_position || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {t('width')}: {parseFloat(placement.width || 0).toFixed(0)} × {t('depth')}: {parseFloat(placement.depth || 0).toFixed(0)} × {t('height')}: {parseFloat(placement.height || 0).toFixed(0)} {t('cm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {placement.rotation || '0'}{t('degrees')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {placement.stack_id ? (
                          <Badge variant="success" size="sm">
                            {t('stackPosition')}: {placement.stack_position || 1}
                          </Badge>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-500">{t('groundLevel')}</span>
                        )}
                      </td>
                    </>
                  )}
                />
              ) : (
                <EmptyState
                  icon={List}
                  title={t('noPlacements')}
                  description={t('generateLayoutToSeePlacements')}
                />
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {room.layouts && room.layouts.length > 0 ? (
                <Table
                  headers={[t('date'), t('algorithm'), t('utilizationPercentage'), t('itemsPlacedCount'), t('actions')]}
                  data={room.layouts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))}
                  renderRow={(layout) => (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {new Date(layout.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {layout.algorithm_used || t('algorithm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        <Badge
                          variant={
                            (parseFloat(layout.utilization_percentage || 0)) >= 80 ? 'success' :
                            (parseFloat(layout.utilization_percentage || 0)) >= 50 ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {parseFloat(layout.utilization_percentage || 0).toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        {layout.total_items_placed || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                        <Button variant="secondary" size="sm" onClick={() => {
                          setLayout(layout);
                          setActiveTab('layout');
                        }}>
                          {t('view')}
                        </Button>
                      </td>
                    </>
                  )}
                />
              ) : (
                <EmptyState
                  icon={History}
                  title={t('noHistory')}
                  description={t('layoutHistoryWillAppearHere')}
                />
              )}
            </div>
          )}
          </div>
        </Tabs>
      </Card>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLayout}
        title={t('clearLayout')}
        message={t('clearLayoutMessage')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
};

export default RoomDetails;
