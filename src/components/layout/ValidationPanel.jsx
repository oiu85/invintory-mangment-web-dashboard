import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { validateLayout } from '../../api/roomApi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

const ValidationPanel = ({ roomId, items = [], onValidationChange }) => {
  const { t } = useLanguage();
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roomId && items.length > 0) {
      performValidation();
    } else {
      setValidation(null);
    }
  }, [roomId, JSON.stringify(items)]);

  const performValidation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await validateLayout(roomId, items);
      setValidation(result);
      if (onValidationChange) {
        onValidationChange(result);
      }
    } catch (err) {
      console.error('Validation error:', err);
      setError(err.response?.data?.message || t('errorValidatingLayout') || 'Error validating layout');
    } finally {
      setLoading(false);
    }
  };

  if (!roomId || items.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('validating') || 'Validating...'}</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="p-4 border-2 border-error-500">
        <div className="flex items-center gap-2 text-error-600 dark:text-error-400">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  if (!validation) {
    return null;
  }

  const isValid = validation.valid;
  const roomValidation = validation.room_validation || {};
  const stockValidation = validation.stock_validation || {};
  const capacity = validation.capacity || {};
  const suggestions = validation.suggestions || {};

  return (
    <Card variant="glass" className="p-4">
      <div className="space-y-4">
        {/* Validation Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {t('validationStatus') || 'Validation Status'}
          </h3>
          <Badge variant={isValid ? 'success' : 'error'}>
            {isValid ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {t('valid') || 'Valid'}
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-1" />
                {t('invalid') || 'Invalid'}
              </>
            )}
          </Badge>
        </div>

        {/* Room Validation */}
        {roomValidation.errors && roomValidation.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-error-600 dark:text-error-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('roomValidationErrors') || 'Room Validation Errors'}
            </h4>
            <ul className="list-disc list-inside text-sm text-error-600 dark:text-error-400 space-y-1">
              {roomValidation.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {roomValidation.warnings && roomValidation.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-warning-600 dark:text-warning-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('warnings') || 'Warnings'}
            </h4>
            <ul className="list-disc list-inside text-sm text-warning-600 dark:text-warning-400 space-y-1">
              {roomValidation.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stock Validation */}
        {stockValidation.errors && stockValidation.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-error-600 dark:text-error-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('stockValidationErrors') || 'Stock Validation Errors'}
            </h4>
            <ul className="list-disc list-inside text-sm text-error-600 dark:text-error-400 space-y-1">
              {stockValidation.errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Capacity Information */}
        {capacity && (
          <div className="space-y-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('capacityEstimate') || 'Capacity Estimate'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {t('estimatedUtilization') || 'Estimated Utilization'}:
                </span>
                <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                  {capacity.estimated_utilization?.toFixed(1) || 0}%
                </span>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {t('strategy') || 'Strategy'}:
                </span>
                <span className="ml-2 font-semibold text-neutral-900 dark:text-white">
                  {capacity.strategy || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {Object.keys(suggestions).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('suggestions') || 'Suggestions'}
            </h4>
            <div className="space-y-2">
              {Object.entries(suggestions).map(([productId, suggestion]) => (
                <div key={productId} className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded text-sm">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {t('product')} #{productId}:
                  </span>
                  <span className="ml-2 text-neutral-600 dark:text-neutral-400">
                    {t('suggestedQuantity') || 'Suggested quantity'}: {suggestion.suggested_quantity} 
                    ({t('limitedBy') || 'Limited by'}: {suggestion.limited_by})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Capacity */}
        {roomValidation.capacity && Object.keys(roomValidation.capacity).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {t('productCapacity') || 'Product Capacity'}
            </h4>
            <div className="space-y-1">
              {Object.entries(roomValidation.capacity).map(([productId, cap]) => (
                <div key={productId} className="flex items-center justify-between text-sm p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {t('product')} #{productId}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cap.fits ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}>
                      {cap.requested} / {cap.max_quantity}
                    </span>
                    {cap.fits ? (
                      <CheckCircle2 className="w-4 h-4 text-success-600 dark:text-success-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error-600 dark:text-error-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ValidationPanel;
