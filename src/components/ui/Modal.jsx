import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  ...props
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];
      
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };
      
      firstElement?.focus();
      modalRef.current?.addEventListener('keydown', handleTab);
      
      return () => {
        document.body.style.overflow = '';
        modalRef.current?.removeEventListener('keydown', handleTab);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);
  
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  };
  
  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-modal p-4 animate-fade-in"
      onClick={closeOnBackdrop ? (e) => e.target === e.currentTarget && onClose() : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      {...props}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-neutral-800 backdrop-blur-md rounded-xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] flex flex-col animate-scale-in border border-neutral-200 dark:border-neutral-700 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={`flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h2 id="modal-title" className={`text-2xl font-bold text-neutral-900 dark:text-white ${isRTL ? 'text-right' : 'text-left'}`}>
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg p-1.5 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
