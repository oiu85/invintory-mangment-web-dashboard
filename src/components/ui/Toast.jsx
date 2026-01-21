import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({
  message,
  type = 'success',
  duration = 5000,
  onClose,
  position = 'top-right',
  action,
  actionLabel,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);
  
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };
  
  const colors = {
    success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800 text-success-800 dark:text-success-200',
    error: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800 text-error-800 dark:text-error-200',
    warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 text-warning-800 dark:text-warning-200',
    info: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200',
  };
  
  const Icon = icons[type];
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };
  
  return (
    <div
      className={`fixed ${positionClasses[position]} z-toast animate-slide-in-right`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md ${colors[type]}`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
          {action && actionLabel && (
            <button
              onClick={action}
              className="mt-2 text-sm font-semibold underline hover:no-underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
