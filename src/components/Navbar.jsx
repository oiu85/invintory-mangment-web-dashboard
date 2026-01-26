import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, User, Menu, Moon, Sun, Languages, ChevronDown, Search } from 'lucide-react';
import Button from './ui/Button';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <nav className="sticky top-0 z-sticky glass border-b border-neutral-200/60 dark:border-neutral-700/60 shadow-depth-sm">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-neutral-600 dark:text-neutral-300 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary p-2.5 rounded-lg shadow-elevated-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">{t('inventorySystem')}</h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">{t('managementDashboard')}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 rounded-lg transition-all duration-200 font-semibold text-sm hover:shadow-sm"
              title="Toggle Language"
              aria-label="Toggle language"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'en' ? 'AR' : 'EN'}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 dark:hover:from-primary-900/20 dark:hover:to-secondary-900/20 rounded-lg transition-all duration-200 font-semibold text-sm hover:shadow-sm"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 dark:from-primary-900/20 dark:to-secondary-900/20 hover:from-primary-100/50 hover:to-secondary-100/50 dark:hover:from-primary-800/30 dark:hover:to-secondary-800/30 rounded-lg transition-all duration-200 hover:shadow-sm"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div className="bg-gradient-primary p-1.5 rounded-full shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user?.type || 'Admin'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 glass-strong rounded-lg shadow-depth-lg border border-neutral-200/50 dark:border-neutral-700/50 py-1 animate-scale-in z-dropdown"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    role="menuitem"
                    aria-label={t('logout')}
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="sm:hidden flex items-center gap-2 px-3 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
