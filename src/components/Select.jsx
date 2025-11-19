import { useLanguage } from '../context/LanguageContext';

const Select = ({ label, value, onChange, options, error, helpText, placeholder, required, ...props }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className="mb-4">
      {label && (
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition ${
          isRTL ? 'text-right' : 'text-left'
        } ${
          error ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
        }`}
        required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && (
        <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {helpText}
        </p>
      )}
      {error && (
        <p className={`mt-1 text-sm text-red-500 dark:text-red-400 ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;

