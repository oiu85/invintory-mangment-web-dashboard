import { forwardRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = forwardRef(({
  label,
  value,
  onChange,
  options = [],
  error,
  helpText,
  className = '',
  required = false,
  placeholder,
  ...props
}, ref) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const baseClasses = 'w-full px-4 py-2.5 pr-10 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 appearance-none cursor-pointer';
  
  const stateClasses = error
    ? 'border-error-500 dark:border-error-600 focus:ring-error-500 focus:border-error-500'
    : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500 focus:border-primary-500';
  
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const bgPosition = isRTL ? 'left-0.5rem' : 'right-0.5rem';
  
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
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={`${baseClasses} ${stateClasses} ${textAlign}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundPosition: `${isRTL ? 'left' : 'right'} 0.5rem center`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: isRTL ? '2.5rem' : '2.5rem',
            paddingLeft: isRTL ? '0.75rem' : '2.5rem',
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined}
          required={required}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            if (typeof option === 'string') {
              return (
                <option key={option} value={option}>
                  {option}
                </option>
              );
            }
            return (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            );
          })}
        </select>
        {error && (
          <div className={`absolute inset-y-0 flex items-center pointer-events-none ${isRTL ? 'left-0 pl-3' : 'right-10 pr-3'}`}>
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

Select.displayName = 'Select';

export default Select;
