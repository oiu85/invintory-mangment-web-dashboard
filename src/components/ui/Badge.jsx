import { X } from 'lucide-react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon: Icon,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200',
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200',
    secondary: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-200',
    success: 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200',
    warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-200',
    error: 'bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-200',
    outline: 'border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-full"
          aria-label="Remove"
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </span>
  );
};

export default Badge;
