import { useLanguage } from '../context/LanguageContext';

const Textarea = ({ label, value, onChange, error, helpText, rows = 3, required, ...props }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-300 resize-y shadow-sm ${
          isRTL ? 'text-right' : 'text-left'
        } ${
          error 
            ? 'border-error-400 dark:border-error-500 focus:ring-error-400 focus:border-error-500 focus:shadow-glow-error/30' 
            : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-400 focus:border-transparent focus:bg-gradient-to-r focus:from-primary-50 focus:to-secondary-50 dark:focus:from-primary-900/20 dark:focus:to-secondary-900/20 focus:shadow-glow-primary/20'
        }`}
        required={required}
        {...props}
      />
      {helpText && (
        <p className={`mt-1 text-xs text-neutral-500 dark:text-neutral-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className={`mt-1 text-sm text-error-500 dark:text-error-400 flex items-center gap-1 ${isRTL ? 'text-right' : 'text-left'}`} role="alert">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;

