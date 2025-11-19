import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    warehouseStock: 'Warehouse Stock',
    drivers: 'Drivers',
    assignStock: 'Assign Stock',
    sales: 'Sales',
    invoices: 'Invoices',
    logout: 'Logout',
    
    // Dashboard
    welcomeBack: 'Welcome back! Here\'s your business overview.',
    totalProducts: 'Total Products',
    totalDrivers: 'Total Drivers',
    totalSales: 'Total Sales',
    totalRevenue: 'Total Revenue',
    todaysPerformance: 'Today\'s Performance',
    salesToday: 'Sales Today',
    revenueToday: 'Revenue Today',
    quickActions: 'Quick Actions',
    addProduct: 'Add Product',
    addDriver: 'Add Driver',
    assignStock: 'Assign Stock',
    salesTrend: 'Sales Trend',
    revenueTrend: 'Revenue Trend',
    topPerformingDrivers: 'Top Performing Drivers',
    lowStockAlert: 'Low Stock Alert',
    stockStatusOptimal: 'Stock Status: Optimal',
    allGood: 'All Good!',
    noLowStock: 'No products are running low on stock.',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    actions: 'Actions',
    noData: 'No data available',
    activeProducts: 'Active products in catalog',
    activeDrivers: 'Active delivery drivers',
    allTimeSales: 'All-time sales count',
    totalRevenueGenerated: 'Total revenue generated',
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    products: 'المنتجات',
    categories: 'الفئات',
    warehouseStock: 'مخزون المستودع',
    drivers: 'السائقين',
    assignStock: 'تعيين المخزون',
    sales: 'المبيعات',
    invoices: 'الفواتير',
    logout: 'تسجيل الخروج',
    
    // Dashboard
    welcomeBack: 'مرحباً بعودتك! إليك نظرة عامة على عملك.',
    totalProducts: 'إجمالي المنتجات',
    totalDrivers: 'إجمالي السائقين',
    totalSales: 'إجمالي المبيعات',
    totalRevenue: 'إجمالي الإيرادات',
    todaysPerformance: 'أداء اليوم',
    salesToday: 'مبيعات اليوم',
    revenueToday: 'إيرادات اليوم',
    quickActions: 'إجراءات سريعة',
    addProduct: 'إضافة منتج',
    addDriver: 'إضافة سائق',
    assignStock: 'تعيين مخزون',
    salesTrend: 'اتجاه المبيعات',
    revenueTrend: 'اتجاه الإيرادات',
    topPerformingDrivers: 'أفضل السائقين أداءً',
    lowStockAlert: 'تنبيه المخزون المنخفض',
    stockStatusOptimal: 'حالة المخزون: مثالية',
    allGood: 'كل شيء على ما يرام!',
    noLowStock: 'لا توجد منتجات منخفضة المخزون.',
    
    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    actions: 'الإجراءات',
    noData: 'لا توجد بيانات متاحة',
    activeProducts: 'المنتجات النشطة في الكتالوج',
    activeDrivers: 'سائقو التوصيل النشطون',
    allTimeSales: 'عدد المبيعات الإجمالي',
    totalRevenueGenerated: 'إجمالي الإيرادات المُولدة',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      return saved || 'en';
    }
    return 'en';
  });

  const t = useCallback((key) => {
    return translations[language]?.[key] || key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const newLang = prev === 'en' ? 'ar' : 'en';
      // Update localStorage immediately
      try {
        localStorage.setItem('language', newLang);
      } catch (e) {
        console.warn('Failed to save language preference:', e);
      }
      return newLang;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isRTL = language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage,
      t,
    }),
    [language, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
