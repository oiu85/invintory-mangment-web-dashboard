import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500 shadow-md hover:shadow-lg',
    secondary: 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 focus:ring-neutral-500',
    ghost: 'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-500',
    destructive: 'bg-error-600 hover:bg-error-700 active:bg-error-800 text-white focus:ring-error-500 shadow-md hover:shadow-lg',
    outline: 'border-2 border-neutral-300 dark:border-neutral-600 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-500',
    success: 'bg-success-600 hover:bg-success-700 active:bg-success-800 text-white focus:ring-success-500 shadow-md hover:shadow-lg',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className={`${iconSizes[size]} animate-spin`} aria-hidden="true" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={iconSizes[size]} aria-hidden="true" />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSizes[size]} aria-hidden="true" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
