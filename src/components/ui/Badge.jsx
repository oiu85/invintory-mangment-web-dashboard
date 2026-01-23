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
    primary: 'bg-gradient-primary text-white shadow-glow-primary/30',
    secondary: 'bg-gradient-secondary text-white shadow-glow-secondary/30',
    success: 'bg-gradient-success text-white shadow-glow-success/30',
    warning: 'bg-gradient-warning text-white shadow-glow-warning/30',
    error: 'bg-gradient-error text-white shadow-glow-error/30',
    outline: 'border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent',
    gradient: 'bg-gradient-accent-vibrant text-white shadow-glow-purple/40',
    purple: 'bg-gradient-accent-purple text-white shadow-glow-purple/30',
    cyan: 'bg-gradient-accent-cyan text-white shadow-glow-cyan/30',
    pink: 'bg-gradient-accent-pink text-white shadow-glow-pink/30',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-sm font-semibold',
    lg: 'px-3 py-1.5 text-base font-semibold',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const hasGradient = ['primary', 'secondary', 'success', 'warning', 'error', 'gradient', 'purple', 'cyan', 'pink'].includes(variant);
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 ${variants[variant]} ${sizes[size]} ${hasGradient ? 'hover:scale-105 hover:shadow-lg' : ''} ${className}`}
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
