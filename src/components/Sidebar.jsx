import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/products', label: 'Products', icon: '📦' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { path: '/warehouse-stock', label: 'Warehouse Stock', icon: '🏭' },
    { path: '/drivers', label: 'Drivers', icon: '👤' },
    { path: '/assign-stock', label: 'Assign Stock', icon: '📤' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/invoices', label: 'Invoices', icon: '🧾' },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white min-h-screen p-4 shadow-xl">
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h2 className="text-xl font-bold">Menu</h2>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

