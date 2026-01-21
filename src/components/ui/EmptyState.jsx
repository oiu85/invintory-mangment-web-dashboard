import { Package } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Package,
  title = 'No data available',
  description,
  action,
  actionLabel,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`} {...props}>
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-4 mb-4">
        <Icon className="w-12 h-12 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mb-6">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
