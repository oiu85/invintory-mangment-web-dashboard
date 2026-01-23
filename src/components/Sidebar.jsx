import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  Users,
  ArrowRightLeft,
  ShoppingCart,
  FileText,
  Building2,
  Ruler,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Boxes,
  Settings,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ onClose, isCollapsed: externalCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const sidebarRef = useRef(null);

  // Use external collapsed state if provided, otherwise use internal
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = onToggleCollapse || setInternalCollapsed;

  // Group menu items by category for better organization
  const menuGroups = [
    {
      title: t('main') || 'Main',
      icon: Home,
      items: [
        { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
      ]
    },
    {
      title: t('inventory') || 'Inventory',
      icon: Boxes,
      items: [
        { path: '/products', label: t('products'), icon: Package },
        { path: '/categories', label: t('categories'), icon: Tag },
        { path: '/warehouse-stock', label: t('warehouseStock'), icon: Warehouse },
        { path: '/rooms', label: t('rooms'), icon: Building2 },
        { path: '/product-dimensions', label: t('productDimensions'), icon: Ruler },
      ]
    },
    {
      title: t('operations') || 'Operations',
      icon: ArrowRightLeft,
      items: [
        { path: '/drivers', label: t('drivers'), icon: Users },
        { path: '/assign-stock', label: t('assignStock'), icon: ArrowRightLeft },
      ]
    },
    {
      title: t('reports') || 'Reports',
      icon: BarChart3,
      items: [
        { path: '/sales', label: t('sales'), icon: ShoppingCart },
        { path: '/invoices', label: t('invoices'), icon: FileText },
      ]
    },
  ];

  // Check if any item in a group is active
  const isGroupActive = (group) => {
    return group.items.some(item => location.pathname === item.path);
  };

  // Handle collapse toggle
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close mobile sidebar when clicking a link
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      ref={sidebarRef}
      className={`glass border-r border-neutral-200/60 dark:border-neutral-700/60 h-full shadow-depth-lg flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      onMouseEnter={() => {
        if (isCollapsed) {
          setHoveredItem(null);
        }
      }}
    >
      {/* Header with Logo and Collapse Button */}
      <div className={`flex items-center justify-between p-4 border-b border-neutral-200/60 dark:border-neutral-700/60 ${
        isCollapsed ? 'px-3' : ''
      }`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-primary p-2 rounded-lg shadow-elevated-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold gradient-text truncate">{t('inventorySystem')}</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{t('managementDashboard')}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="bg-gradient-primary p-2 rounded-lg shadow-elevated-md mx-auto">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="flex items-center gap-2">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1.5 rounded-lg hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Desktop collapse button */}
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 rounded-lg transition-all duration-200 hover:shadow-sm"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isRTL ? (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            ) : (
              isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 custom-scrollbar" aria-label="Main navigation">
        {menuGroups.map((group, groupIndex) => {
          const GroupIcon = group.icon;
          const hasActiveItem = isGroupActive(group);
          
          return (
            <div key={groupIndex} className="space-y-1">
              {/* Group Header */}
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <GroupIcon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>
              )}
              
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isHovered = hoveredItem === item.path;
                  
                  return (
                    <div
                      key={item.path}
                      className="relative group"
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={item.path}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 relative ${
                          isCollapsed ? 'justify-center' : ''
                        } ${
                          isActive
                            ? 'bg-gradient-primary text-white shadow-elevated-md hover:shadow-elevated-lg scale-[1.02]'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 hover:shadow-sm'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 bg-white rounded-r ${isRTL ? 'rounded-l' : 'rounded-r'}`} />
                        )}
                        
                        <div className={`relative ${isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'} transition-colors`}>
                          <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                          {isActive && (
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
                          )}
                        </div>
                        
                        {!isCollapsed && (
                          <span className={`font-semibold text-sm transition-all duration-300 ${
                            isActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {item.label}
                          </span>
                        )}
                      </Link>
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && isHovered && (
                        <div className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 z-50 pointer-events-none`}>
                          <div className="bg-neutral-900 dark:bg-neutral-800 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-depth-lg whitespace-nowrap animate-scale-in">
                            {item.label}
                            <div className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-4 ${
                              isRTL 
                                ? 'right-0 translate-x-full border-l-neutral-900 dark:border-l-neutral-800 border-t-transparent border-b-transparent border-r-transparent' 
                                : 'left-0 -translate-x-full border-r-neutral-900 dark:border-r-neutral-800 border-t-transparent border-b-transparent border-l-transparent'
                            }`} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-neutral-200/60 dark:border-neutral-700/60">
          <div className="bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              {t('version') || 'Version'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              v1.0.0
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
