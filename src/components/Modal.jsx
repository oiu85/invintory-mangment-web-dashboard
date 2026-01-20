import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-start justify-center z-[9999] p-4 pt-8 animate-fade-in overflow-y-auto"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white dark:bg-gray-800 backdrop-blur-md rounded-xl shadow-2xl ${sizes[size]} w-full mx-4 my-4 flex flex-col animate-scale-in border border-gray-200 dark:border-gray-700`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-700 dark:to-gray-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 id="modal-title" className={`text-2xl font-bold text-gray-800 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-120px)]">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

