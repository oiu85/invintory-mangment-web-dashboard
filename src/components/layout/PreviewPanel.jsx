import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { validateLayout } from '../../api/roomApi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { TrendingUp, Package, AlertCircle, Info } from 'lucide-react';

const PreviewPanel = ({ roomId, items = [], room = null }) => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomId && items.length > 0 && room) {
      loadPreview();
    } else {
      setPreview(null);
    }
  }, [roomId, JSON.stringify(items), room]);

  const loadPreview = async () => {
    setLoading(true);
    try {
      const result = await validateLayout(roomId, items);
      setPreview(result);
    } catch (err) {
      console.error('Preview error:', err);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  if (!roomId || items.length === 0 || !room) {
    return null;
  }

  if (loading) {
    return (
      <Card variant="glass" className="p-4">
        <div className="text-center text-neutral-600 dark:text-neutral-400">
          {t('loadingPreview') || 'Loading preview...'}
        </div>
      </Card>
    );
  }

  if (!preview) {
    return null;
  }

  const capacity = preview.capacity || {};
  const roomValidation = preview.room_validation || {};
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <Card variant="glass" className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            {t('layoutPreview') || 'Layout Preview'}
          </h3>
        </div>

        {/* Utilization Estimate */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {t('estimatedUtilization') || 'Estimated Utilization'}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {capacity.estimated_utilization?.toFixed(1) || 0}%
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-success-600 dark:text-success-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {t('totalItems') || 'Total Items'}
              </span>
            </div>
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {totalItems}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-warning-600 dark:text-warning-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {t('strategy') || 'Strategy'}
              </span>
            </div>
            <div className="text-sm font-bold text-warning-600 dark:text-warning-400">
              {capacity.strategy || 'N/A'}
            </div>
          </div>
        </div>

        {/* Room Dimensions */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
            {t('roomDimensions') || 'Room Dimensions'}
          </h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">{t('width') || 'Width'}:</span>
              <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                {parseFloat(room.width || 0).toFixed(0)} {t('cm') || 'cm'}
              </span>
            </div>
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">{t('depth') || 'Depth'}:</span>
              <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                {parseFloat(room.depth || 0).toFixed(0)} {t('cm') || 'cm'}
              </span>
            </div>
            <div>
              <span className="text-neutral-600 dark:text-neutral-400">{t('height') || 'Height'}:</span>
              <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                {parseFloat(room.height || 0).toFixed(0)} {t('cm') || 'cm'}
              </span>
            </div>
          </div>
        </div>

        {/* Volume Information */}
        {capacity.room_volume && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">
              {t('volumeInformation') || 'Volume Information'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {t('roomVolume') || 'Room Volume'}:
                </span>
                <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                  {(capacity.room_volume / 1000000).toFixed(2)} m³
                </span>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {t('usedVolume') || 'Used Volume'}:
                </span>
                <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                  {capacity.total_volume ? (capacity.total_volume / 1000000).toFixed(2) : 0} m³
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Potential Issues */}
        {roomValidation.warnings && roomValidation.warnings.length > 0 && (
          <div className="p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
            <h4 className="text-sm font-semibold text-warning-800 dark:text-warning-200 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {t('potentialIssues') || 'Potential Issues'}
            </h4>
            <ul className="list-disc list-inside text-sm text-warning-700 dark:text-warning-300 space-y-1">
              {roomValidation.warnings.slice(0, 3).map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Grid Visualization Info */}
        {capacity.strategy && (
          <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <h4 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">
              {t('recommendedStrategy') || 'Recommended Strategy'}
            </h4>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              {capacity.strategy === 'stacking_required' && (t('strategyStackingRequired') || 'High floor utilization detected. Vertical stacking will be used.')}
              {capacity.strategy === 'dense_packing' && (t('strategyDensePacking') || 'Optimal for dense packing with high utilization.')}
              {capacity.strategy === 'sparse_packing' && (t('strategySparsePacking') || 'Sparse packing recommended for better organization.')}
              {capacity.strategy === 'mixed' && (t('strategyMixed') || 'Mixed strategy will be used for optimal results.')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PreviewPanel;
