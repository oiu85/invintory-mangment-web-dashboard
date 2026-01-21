import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'rounded-xl border transition-all duration-200';
  
  const variants = {
    default: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-sm',
    elevated: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-lg',
    outlined: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-600',
    interactive: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer hover:shadow-md',
  };
  
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5' : '';
  
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

const CardHeader = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 border-b border-neutral-200 dark:border-neutral-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardBody = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardBody.displayName = 'CardBody';

const CardFooter = forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 border-t border-neutral-200 dark:border-neutral-700 ${className}`}
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
