import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'rounded-xl border transition-all duration-300 relative';
  
  const variants = {
    default: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-depth-sm',
    elevated: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-depth-lg',
    glass: 'glass border-neutral-200/50 dark:border-neutral-700/50 shadow-depth-md',
    glassStrong: 'glass-strong border-neutral-200/50 dark:border-neutral-700/50 shadow-depth-lg',
    outlined: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-600',
    gradient: 'bg-white dark:bg-neutral-800 border-0 shadow-depth-md before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-primary before:-z-10 before:opacity-20',
    interactive: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-depth-sm cursor-pointer hover:shadow-depth-lg hover:shadow-glow-primary/20',
  };
  
  const hoverClasses = hover ? 'hover:shadow-depth-lg hover:-translate-y-1 hover:shadow-glow-primary/10 transition-all duration-300' : '';
  
  return (
    <div
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef(({ children, className = '', compact = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`${compact ? 'p-4' : 'p-5'} border-b border-neutral-200/60 dark:border-neutral-700/60 bg-gradient-to-r from-transparent via-neutral-50/50 to-transparent dark:via-neutral-800/30 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardBody = forwardRef(({ children, className = '', compact = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`${compact ? 'p-4' : 'p-5'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardBody.displayName = 'CardBody';

const CardFooter = forwardRef(({ children, className = '', compact = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`${compact ? 'p-4' : 'p-5'} border-t border-neutral-200/60 dark:border-neutral-700/60 bg-gradient-to-r from-transparent via-neutral-50/50 to-transparent dark:via-neutral-800/30 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

Card.displayName = 'Card';

export default Card;
