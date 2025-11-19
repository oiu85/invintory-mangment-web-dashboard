import { Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        dir={isRTL ? 'rtl' : 'ltr'}
        className={`w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition ${
          isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
        }`}
      />
      <Search className={`absolute top-2.5 w-5 h-5 text-gray-400 dark:text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
    </div>
  );
};

export default SearchInput;
