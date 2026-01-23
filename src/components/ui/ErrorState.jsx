import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';
import Card from './Card';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading data. Please try again.',
  onRetry,
  retryLabel = 'Retry',
  className = '',
  ...props
}) => {
  return (
    <Card variant="elevated" className={`text-center ${className}`} {...props}>
      <Card.Body className="py-12">
        <div className="bg-error-100 dark:bg-error-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-error-600 dark:text-error-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} icon={RefreshCw} iconPosition="left" variant="primary">
            {retryLabel}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default ErrorState;
