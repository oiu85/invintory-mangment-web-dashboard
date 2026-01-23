import { forwardRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  error,
  helpText,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  required = false,
  ...props
}, ref) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const baseClasses = 'w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 shadow-sm';
  
  const stateClasses = error
    ? 'border-error-400 dark:border-error-500 focus:ring-error-400 focus:border-error-500 focus:shadow-glow-error/30'
    : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-400 focus:border-transparent focus:bg-gradient-to-r focus:from-primary-50 focus:to-secondary-50 dark:focus:from-primary-900/20 dark:focus:to-secondary-900/20 focus:shadow-glow-primary/20';
  
  const iconPadding = Icon
    ? iconPosition === 'left'
      ? isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
      : isRTL ? 'pl-10 pr-4' : 'pr-10 pl-4'
    : '';
  
  const textAlign = isRTL ? 'text-right' : 'text-left';
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={props.id}
          className={`block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ${textAlign}`}
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'}`}>
            <Icon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          dir={type === 'email' || type === 'url' ? 'ltr' : isRTL ? 'rtl' : 'ltr'}
          className={`${baseClasses} ${stateClasses} ${iconPadding} ${textAlign}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          required={required}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
            <Icon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
          </div>
        )}
        {error && (
          <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'}`}>
            <AlertCircle className="w-5 h-5 text-error-500" aria-hidden="true" />
          </div>
        )}
      </div>
      {helpText && !error && (
        <p id={props.id ? `${props.id}-help` : undefined} className={`mt-1 text-xs text-neutral-500 dark:text-neutral-400 ${textAlign}`}>
          {helpText}
        </p>
      )}
      {error && (
        <p id={props.id ? `${props.id}-error` : undefined} className={`mt-1 text-sm text-error-500 dark:text-error-400 flex items-center gap-1 ${textAlign}`} role="alert">
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
