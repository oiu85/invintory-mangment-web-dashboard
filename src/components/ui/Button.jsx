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
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none btn-press relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-primary dark:bg-gradient-primary-dark hover:bg-gradient-primary-hover text-white focus:ring-primary-400 shadow-elevated-md hover:shadow-elevated-lg hover:shadow-glow-primary active:scale-[0.98] transform',
    secondary: 'bg-gradient-to-r from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 hover:from-neutral-300 hover:to-neutral-400 dark:hover:from-neutral-600 dark:hover:to-neutral-500 text-neutral-900 dark:text-neutral-100 focus:ring-neutral-400 shadow-sm hover:shadow-md active:scale-[0.98] transform',
    ghost: 'bg-transparent hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-400 active:scale-[0.98] transform',
    destructive: 'bg-gradient-error dark:bg-gradient-error-dark hover:opacity-90 text-white focus:ring-error-400 shadow-elevated-md hover:shadow-elevated-lg hover:shadow-glow-error active:scale-[0.98] transform',
    outline: 'border-2 border-gradient-to-r from-primary-400 to-secondary-400 bg-transparent hover:bg-gradient-background-subtle text-neutral-700 dark:text-neutral-300 focus:ring-primary-400 active:scale-[0.98] transform',
    success: 'bg-gradient-success dark:bg-gradient-success-dark hover:opacity-90 text-white focus:ring-success-400 shadow-elevated-md hover:shadow-elevated-lg hover:shadow-glow-success active:scale-[0.98] transform',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[32px]',
    md: 'px-4 py-2 text-base gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  const isDisabled = disabled || loading;
  
  // Add shimmer effect for gradient buttons
  const hasGradient = ['primary', 'destructive', 'success'].includes(variant);
  
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${hasGradient ? 'group' : ''}`}
      aria-disabled={isDisabled}
      style={hasGradient ? {
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 50%',
      } : {}}
      onMouseEnter={(e) => {
        if (hasGradient && !isDisabled) {
          e.currentTarget.style.backgroundPosition = '100% 50%';
        }
      }}
      onMouseLeave={(e) => {
        if (hasGradient && !isDisabled) {
          e.currentTarget.style.backgroundPosition = '0% 50%';
        }
      }}
      {...props}
    >
      {hasGradient && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      )}
      {loading && (
        <Loader2 className={`${iconSizes[size]} animate-spin relative z-10`} aria-hidden="true" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={`${iconSizes[size]} relative z-10`} aria-hidden="true" />
      )}
      {children && <span className="relative z-10">{children}</span>}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizes[size]} relative z-10`} aria-hidden="true" />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
