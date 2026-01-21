import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoom, getRoomStats, getLayout, getPlacements, deleteLayout } from '../api/roomApi';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import Table from '../components/Table';
import ConfirmModal from '../components/ConfirmModal';
import Room2DView from '../components/Room2DView';
import Room3DView from '../components/Room3DView';
import { Building2, Package, TrendingUp, Box, List, History, ArrowLeft, Maximize2, Trash2, Grid3x3, Boxes } from 'lucide-react';

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

  useEffect(() => {
    fetchRoomData();
  }, [id]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      const [roomData, statsData] = await Promise.all([
        getRoom(id),
        getRoomStats(id).catch(() => null),
      ]);
      setRoom(roomData);
      setStats(statsData);

      // Try to fetch layout and placements
      try {
        const layoutData = await getLayout(id);
        // getLayout returns the layout object with layout_data
        if (layoutData && typeof layoutData === 'object' && !layoutData.message && !layoutData.error) {
          // If layout_data exists, use it; otherwise use the layout object itself
          setLayout(layoutData.layout_data || layoutData);
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
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('roomNotFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('roomNotFoundMessage')}</p>
          <Button onClick={() => navigate('/rooms')}>{t('backToRooms')}</Button>
        </div>
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
        algorithm_used: layout.algorithm || 'laff_maxrects',
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
  
  const tabs = [
    { id: 'layout', label: t('layoutView'), icon: Maximize2 },
    { id: 'placements', label: t('placements'), icon: List },
    { id: 'history', label: t('history'), icon: History },
  ];

  return (
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/rooms')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToRooms')}
        </Button>
      </div>

      {/* Room Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{room.name}</h1>
          <span className={`px-4 py-2 rounded-full font-semibold ${
            room.status === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
            room.status === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}>
            {t(room.status)}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('roomDimensions')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {parseFloat(room.width || 0).toFixed(0)} × {parseFloat(room.depth || 0).toFixed(0)} × {parseFloat(room.height || 0).toFixed(0)} cm
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('roomVolume')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(roomVolume / 1000000).toFixed(2)} m³
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('roomArea')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(roomArea / 10000).toFixed(2)} m²
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('roomWarehouse')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {room.warehouse?.name || t('nA')}
            </p>
          </div>
        </div>
        {room.description && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('roomDescription')}</p>
            <p className="text-gray-900 dark:text-white">{room.description}</p>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          title={t('roomUtilization')}
          value={`${utilization.toFixed(1)}%`}
          icon={TrendingUp}
          color={utilization >= 80 ? 'green' : utilization >= 50 ? 'orange' : 'red'}
          subtitle={latestLayout ? t('currentLayout') : t('noLayout')}
        />
        <Card
          title={t('itemsPlaced')}
          value={placements.length || (latestLayout?.total_items_placed || 0)}
          icon={Package}
          color="blue"
          subtitle={t('itemsInRoom')}
        />
        <Card
          title={t('availableSpace')}
          value={`${(((100 - Math.max(0, Math.min(100, utilization))) / 100) * roomVolume / 1000000).toFixed(2)} m³`}
          icon={Box}
          color="purple"
          subtitle={t('remainingCapacity')}
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
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t('clearLayout')}
            </Button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

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
                        <p className="font-semibold text-gray-900 dark:text-white">{latestLayout.algorithm_used || layout?.algorithm || 'laff_maxrects'}</p>
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
                  {/* Visualization Toggle */}
                  {placements.length > 0 && (
                    <div className="mb-4 flex gap-2 justify-end">
                      <Button
                        variant={viewMode === '2d' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('2d')}
                      >
                        <Grid3x3 className="w-4 h-4 mr-2" />
                        2D View
                      </Button>
                      <Button
                        variant={viewMode === '3d' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setViewMode('3d')}
                      >
                        <Boxes className="w-4 h-4 mr-2" />
                        3D View
                      </Button>
                    </div>
                  )}

                  {/* Visualization */}
                  {placements.length > 0 ? (
                    viewMode === '2d' ? (
                      <Room2DView room={room} placements={placements} />
                    ) : (
                      <Room3DView room={room} placements={placements} />
                    )
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400 mb-4">{t('visualizationPlaceholder')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">{t('visualizationComingSoon')}</p>
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
                            {t('showingFirst') || 'Showing first'} 50 / {layout.unplaced_items.length}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {placement.product?.name || `Product #${placement.product_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-mono text-xs">
                          X: {parseFloat(placement.x_position || 0).toFixed(1)}<br />
                          Y: {parseFloat(placement.y_position || 0).toFixed(1)}<br />
                          Z: {parseFloat(placement.z_position || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        W: {parseFloat(placement.width || 0).toFixed(0)} × D: {parseFloat(placement.depth || 0).toFixed(0)} × H: {parseFloat(placement.height || 0).toFixed(0)} cm
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {placement.rotation || '0'}°
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {placement.stack_id ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs">
                            {t('stackPosition')}: {placement.stack_position || 1}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">{t('groundLevel')}</span>
                        )}
                      </td>
                    </>
                  )}
                />
              ) : (
                <div className="text-center py-12">
                  <List className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noPlacements')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('generateLayoutToSeePlacements')}</p>
                </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(layout.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {layout.algorithm_used || 'laff_maxrects'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          (parseFloat(layout.utilization_percentage || 0)) >= 80 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                          (parseFloat(layout.utilization_percentage || 0)) >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                        }`}>
                          {parseFloat(layout.utilization_percentage || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {layout.total_items_placed || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noHistory')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t('layoutHistoryWillAppearHere')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
