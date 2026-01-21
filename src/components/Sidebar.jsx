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
  X
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const menuItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/products', label: t('products'), icon: Package },
    { path: '/categories', label: t('categories'), icon: Tag },
    { path: '/warehouse-stock', label: t('warehouseStock'), icon: Warehouse },
    { path: '/rooms', label: t('rooms'), icon: Building2 },
    { path: '/product-dimensions', label: t('productDimensions'), icon: Ruler },
    { path: '/drivers', label: t('drivers'), icon: Users },
    { path: '/assign-stock', label: t('assignStock'), icon: ArrowRightLeft },
    { path: '/sales', label: t('sales'), icon: ShoppingCart },
    { path: '/invoices', label: t('invoices'), icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 min-h-screen shadow-sm relative z-20">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
              <span className={`font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
