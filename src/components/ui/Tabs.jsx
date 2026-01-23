import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Tabs = ({
  items = [],
  tabs = [], // Support both 'items' and 'tabs' prop names
  defaultIndex = 0,
  activeTab, // Support controlled mode with activeTab
  activeIndex: controlledActiveIndex, // Support controlled mode with activeIndex
  onChange,
  onTabChange, // Support both 'onChange' and 'onTabChange' prop names
  orientation = 'horizontal',
  className = '',
  children,
  ...props
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // Use tabs if provided, otherwise items
  const tabItems = tabs.length > 0 ? tabs : items;
  
  // Determine if controlled or uncontrolled
  const isControlled = activeTab !== undefined || controlledActiveIndex !== undefined;
  
  // Get active index - support both string IDs and numeric indices
  const getActiveIndex = () => {
    if (isControlled) {
      if (activeTab !== undefined) {
        // Find index by id
        const index = tabItems.findIndex(tab => (tab.id || tab.value) === activeTab);
        return index >= 0 ? index : defaultIndex;
      }
      return controlledActiveIndex !== undefined ? controlledActiveIndex : defaultIndex;
    }
    return defaultIndex;
  };
  
  const [activeIndex, setActiveIndex] = useState(getActiveIndex());
  const tabRefs = useRef([]);
  
  // Sync with controlled prop
  useEffect(() => {
    if (isControlled) {
      const newIndex = getActiveIndex();
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  }, [activeTab, controlledActiveIndex, tabItems]);

  useEffect(() => {
    // Focus management for keyboard navigation
    if (tabRefs.current[activeIndex]) {
      tabRefs.current[activeIndex].focus();
    }
  }, [activeIndex]);

  const handleKeyDown = (e, index) => {
    let newIndex = activeIndex;
    
    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight' || (isRTL && e.key === 'ArrowLeft')) {
        e.preventDefault();
        newIndex = (index + 1) % items.length;
      } else if (e.key === 'ArrowLeft' || (isRTL && e.key === 'ArrowRight')) {
        e.preventDefault();
        newIndex = (index - 1 + items.length) % items.length;
      }
    } else {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (index + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = (index - 1 + items.length) % items.length;
      }
    }
    
    if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = items.length - 1;
    }
    
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      onChange?.(newIndex, items[newIndex]);
    }
  };

  const handleClick = (index, item) => {
    if (!isControlled) {
      setActiveIndex(index);
    }
    // Call both onChange and onTabChange for compatibility
    const tabId = item.id || item.value || index;
    onChange?.(index, item);
    onTabChange?.(tabId);
  };

  // Filter out DOM props that shouldn't be passed to the div
  const { activeTab: _, onTabChange: __, ...domProps } = props;

  return (
    <div className="w-full">
      <div
        className={`${orientation === 'vertical' ? 'flex' : 'flex border-b border-neutral-200 dark:border-neutral-700'} ${className}`}
        role="tablist"
        aria-orientation={orientation}
        {...domProps}
      >
        {tabItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;
          return (
            <button
              key={item.id || item.value || index}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${index}`}
              id={`tab-${index}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleClick(index, item)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
            </button>
          );
        })}
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

const TabPanel = ({ children, index, activeIndex, id, className = '', ...props }) => {
  if (index !== activeIndex) return null;

  return (
    <div
      role="tabpanel"
      id={id || `panel-${index}`}
      aria-labelledby={`tab-${index}`}
      tabIndex={0}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

Tabs.Panel = TabPanel;

export default Tabs;
