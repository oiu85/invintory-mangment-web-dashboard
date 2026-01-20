import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

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
    inventorySystem: 'Inventory System',
    managementDashboard: 'Management Dashboard',
    
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
    transactions: 'transactions',
    activeDay: 'Active day',
    currentPeriod: 'Current period',
    viewAll: 'View All',
    viewAllLowStockItems: 'View All Low Stock Items',
    last7Days: 'Last 7 Days',
    productsRequiringAttention: 'Products requiring immediate attention',
    live: 'Live',
    
    // Categories Page
    pageTitleCategories: 'Categories',
    pageDescriptionCategories: 'Organize your products into categories with detailed information',
    addCategory: '+ Add Category',
    editCategory: 'Edit Category',
    createCategory: 'Create Category',
    categoryName: 'Name',
    categoryDescription: 'Description',
    searchCategories: 'Search categories...',
    productsCount: 'Products Count',
    totalValue: 'Total Value',
    created: 'Created',
    deleteCategory: 'Delete Category',
    deleteCategoryMessage: 'Are you sure you want to delete "{name}"? This will affect all products in this category.',
    categoryUpdated: 'Category updated successfully!',
    categoryCreated: 'Category created successfully!',
    categoryDeleted: 'Category deleted successfully!',
    errorLoadingCategories: 'Error loading categories',
    errorSavingCategory: 'Error saving category',
    errorDeletingCategory: 'Error deleting category',
    saving: 'Saving...',
    update: 'Update',
    create: 'Create',
    
    // Products Page
    pageTitleProducts: 'Products',
    pageDescriptionProducts: 'Manage your product catalog with detailed information',
    addProduct: '+ Add Product',
    editProduct: 'Edit Product',
    createProduct: 'Create Product',
    productName: 'Name',
    productPrice: 'Price',
    productCategory: 'Category',
    productDescription: 'Description',
    productImage: 'Image URL',
    imagePreview: 'Image Preview',
    selectCategory: 'Select Category',
    searchProducts: 'Search products by name, description, or category...',
    id: 'ID',
    image: 'Image',
    name: 'Name',
    price: 'Price',
    category: 'Category',
    warehouseStock: 'Warehouse Stock',
    driverStock: 'Driver Stock',
    totalSold: 'Total Sold',
    description: 'Description',
    productUpdated: 'Product updated successfully!',
    productCreated: 'Product created successfully!',
    productDeleted: 'Product deleted successfully!',
    errorLoadingProducts: 'Error loading products',
    errorSavingProduct: 'Error saving product',
    errorDeletingProduct: 'Error deleting product',
    deleteProduct: 'Delete Product',
    deleteProductMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
    units: 'units',
    
    // Sales Page
    pageTitleSales: 'Sales',
    pageDescriptionSales: 'View all sales transactions',
    searchSales: 'Search by invoice number, customer, or driver...',
    invoiceNumber: 'Invoice Number',
    customer: 'Customer',
    customerName: 'Customer Name',
    driver: 'Driver',
    totalAmount: 'Total Amount',
    date: 'Date',
    viewDetails: 'View Details',
    errorLoadingSales: 'Error loading sales',
    
    // Drivers Page
    pageTitleDrivers: 'Drivers',
    pageDescriptionDrivers: 'Manage your delivery drivers and their performance',
    addDriver: '+ Add Driver',
    editDriver: 'Edit Driver',
    createDriver: 'Create Driver',
    driverName: 'Name',
    driverEmail: 'Email',
    driverPassword: 'Password',
    newPassword: 'New Password (leave empty to keep current)',
    searchDrivers: 'Search drivers by name or email...',
    email: 'Email',
    totalSales: 'Total Sales',
    totalRevenue: 'Total Revenue',
    stockItems: 'Stock Items',
    joined: 'Joined',
    stock: 'Stock',
    stockForDriver: 'Stock for {name}',
    noStockAssigned: 'No stock assigned to this driver yet.',
    product: 'Product',
    quantity: 'Quantity',
    driverUpdated: 'Driver updated successfully!',
    driverCreated: 'Driver created successfully!',
    driverDeleted: 'Driver deleted successfully!',
    errorLoadingDrivers: 'Error loading drivers',
    errorSavingDriver: 'Error saving driver',
    errorDeletingDriver: 'Error deleting driver',
    errorFetchingStock: 'Error fetching driver stock',
    deleteDriver: 'Delete Driver',
    deleteDriverMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
    
    // WarehouseStock Page
    pageTitleWarehouseStock: 'Warehouse Stock',
    pageDescriptionWarehouseStock: 'Manage inventory levels in the warehouse with detailed tracking',
    totalItems: 'Total Items',
    lowStockItems: 'Low Stock Items',
    outOfStock: 'Out of Stock',
    itemsInWarehouse: 'Items in warehouse',
    requiringAttention: 'Requiring attention',
    needsRestocking: 'Needs restocking',
    searchProductsOrCategories: 'Search products or categories...',
    productId: 'Product ID',
    productName: 'Product Name',
    currentStock: 'Current Stock',
    status: 'Status',
    outOfStockLabel: 'Out of Stock',
    lowStockLabel: 'Low Stock',
    mediumStock: 'Medium Stock',
    goodStock: 'Good Stock',
    updateWarehouseStock: 'Update Warehouse Stock',
    selectProduct: 'Select Product',
    stockUpdateNote: 'Enter the total quantity you want to set for this product in the warehouse.',
    note: 'Note',
    stockUpdated: 'Stock updated successfully!',
    errorUpdatingStock: 'Error updating stock',
    errorLoadingStock: 'Error loading warehouse stock',
    updating: 'Updating...',
    updateStock: 'Update Stock',
    
    // AssignStock Page
    pageTitleAssignStock: 'Assign Stock to Driver',
    pageDescriptionAssignStock: 'Transfer products from warehouse to driver inventory',
    selectDriver: 'Select Driver',
    selectProduct: 'Select Product',
    quantityToAssign: 'Quantity to Assign',
    availableInWarehouse: 'Available in Warehouse',
    cannotAssignMore: 'Cannot assign more than available stock!',
    insufficientStock: 'Insufficient stock! Available: {quantity} units',
    productDetails: 'Product Details',
    price: 'Price',
    availableStock: 'Available Stock',
    quickStats: 'Quick Stats',
    totalDrivers: 'Total Drivers',
    totalProducts: 'Total Products',
    totalWarehouseItems: 'Total Warehouse Items',
    stockAssigned: 'Stock assigned successfully!',
    errorAssigningStock: 'Error assigning stock',
    errorLoadingDrivers: 'Error loading drivers',
    errorLoadingProducts: 'Error loading products',
    pleaseSelectProduct: 'Please select a product',
    assigning: 'Assigning...',
    assignStock: 'Assign Stock',
    sales: 'sales',
    
    // Invoices Page
    pageTitleInvoices: 'Invoices',
    pageDescriptionInvoices: 'View and manage all sales invoices',
    searchInvoices: 'Search by invoice number, customer, or driver...',
    itemsCount: 'Items Count',
    actions: 'Actions',
    view: 'View',
    downloadPdf: 'Download PDF',
    details: 'Details',
    invoice: 'INVOICE',
    items: 'Items',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    invoiceDownloaded: 'Invoice downloaded successfully!',
    errorDownloadingInvoice: 'Error downloading invoice',
    errorLoadingInvoice: 'Error loading invoice',
    errorLoadingInvoices: 'Error loading invoices',
    downloadPdfInvoice: 'Download PDF Invoice',
    viewFullDetails: 'View Full Details',
    
    // SaleDetails Page
    pageTitleSaleDetails: 'Sale Details',
    backToSales: '← Back to Sales',
    saleNotFound: 'Sale Not Found',
    saleNotFoundMessage: 'The sale you\'re looking for doesn\'t exist.',
    backToSalesButton: 'Back to Sales',
    dateTime: 'Date & Time',
    
    // Login Page
    inventorySystem: 'Inventory System',
    signInToAccount: 'Sign in to your admin account',
    emailAddress: 'Email Address',
    password: 'Password',
    signingIn: 'Signing in...',
    signIn: 'Sign In',
    loginFailed: 'Login failed. Please check your credentials.',
    defaultCredentials: 'Default credentials: admin@inventory.com / password',
    enterPassword: 'Enter your password',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    noData: 'No data available',
    activeProducts: 'Active products in catalog',
    activeDrivers: 'Active delivery drivers',
    allTimeSales: 'All-time sales count',
    totalRevenueGenerated: 'Total revenue generated',
    nA: 'N/A',
    items: 'items',
    confirm: 'Confirm',
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
    inventorySystem: 'نظام المخزون',
    managementDashboard: 'لوحة تحكم الإدارة',
    
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
    transactions: 'معاملات',
    activeDay: 'يوم نشط',
    currentPeriod: 'الفترة الحالية',
    viewAll: 'عرض الكل',
    viewAllLowStockItems: 'عرض جميع عناصر المخزون المنخفض',
    last7Days: 'آخر 7 أيام',
    productsRequiringAttention: 'المنتجات التي تحتاج إلى اهتمام فوري',
    live: 'مباشر',
    
    // Categories Page
    pageTitleCategories: 'الفئات',
    pageDescriptionCategories: 'نظم منتجاتك في فئات مع معلومات مفصلة',
    addCategory: '+ إضافة فئة',
    editCategory: 'تعديل الفئة',
    createCategory: 'إنشاء فئة',
    categoryName: 'الاسم',
    categoryDescription: 'الوصف',
    searchCategories: 'البحث في الفئات...',
    productsCount: 'عدد المنتجات',
    totalValue: 'القيمة الإجمالية',
    created: 'تاريخ الإنشاء',
    deleteCategory: 'حذف الفئة',
    deleteCategoryMessage: 'هل أنت متأكد من حذف "{name}"؟ سيؤثر هذا على جميع المنتجات في هذه الفئة.',
    categoryUpdated: 'تم تحديث الفئة بنجاح!',
    categoryCreated: 'تم إنشاء الفئة بنجاح!',
    categoryDeleted: 'تم حذف الفئة بنجاح!',
    errorLoadingCategories: 'خطأ في تحميل الفئات',
    errorSavingCategory: 'خطأ في حفظ الفئة',
    errorDeletingCategory: 'خطأ في حذف الفئة',
    saving: 'جاري الحفظ...',
    update: 'تحديث',
    create: 'إنشاء',
    
    // Products Page
    pageTitleProducts: 'المنتجات',
    pageDescriptionProducts: 'إدارة كتالوج المنتجات مع معلومات مفصلة',
    addProduct: '+ إضافة منتج',
    editProduct: 'تعديل المنتج',
    createProduct: 'إنشاء منتج',
    productName: 'الاسم',
    productPrice: 'السعر',
    productCategory: 'الفئة',
    productDescription: 'الوصف',
    productImage: 'رابط الصورة',
    imagePreview: 'معاينة الصورة',
    selectCategory: 'اختر الفئة',
    searchProducts: 'البحث في المنتجات بالاسم أو الوصف أو الفئة...',
    id: 'المعرف',
    image: 'الصورة',
    name: 'الاسم',
    price: 'السعر',
    category: 'الفئة',
    warehouseStock: 'مخزون المستودع',
    driverStock: 'مخزون السائق',
    totalSold: 'إجمالي المبيعات',
    description: 'الوصف',
    productUpdated: 'تم تحديث المنتج بنجاح!',
    productCreated: 'تم إنشاء المنتج بنجاح!',
    productDeleted: 'تم حذف المنتج بنجاح!',
    errorLoadingProducts: 'خطأ في تحميل المنتجات',
    errorSavingProduct: 'خطأ في حفظ المنتج',
    errorDeletingProduct: 'خطأ في حذف المنتج',
    deleteProduct: 'حذف المنتج',
    deleteProductMessage: 'هل أنت متأكد من حذف "{name}"؟ لا يمكن التراجع عن هذا الإجراء.',
    units: 'وحدة',
    
    // Sales Page
    pageTitleSales: 'المبيعات',
    pageDescriptionSales: 'عرض جميع معاملات المبيعات',
    searchSales: 'البحث برقم الفاتورة أو العميل أو السائق...',
    invoiceNumber: 'رقم الفاتورة',
    customer: 'العميل',
    customerName: 'اسم العميل',
    driver: 'السائق',
    totalAmount: 'المبلغ الإجمالي',
    date: 'التاريخ',
    viewDetails: 'عرض التفاصيل',
    errorLoadingSales: 'خطأ في تحميل المبيعات',
    
    // Drivers Page
    pageTitleDrivers: 'السائقين',
    pageDescriptionDrivers: 'إدارة سائقي التوصيل وأدائهم',
    addDriver: '+ إضافة سائق',
    editDriver: 'تعديل السائق',
    createDriver: 'إنشاء سائق',
    driverName: 'الاسم',
    driverEmail: 'البريد الإلكتروني',
    driverPassword: 'كلمة المرور',
    newPassword: 'كلمة مرور جديدة (اتركها فارغة للاحتفاظ بالحالية)',
    searchDrivers: 'البحث في السائقين بالاسم أو البريد الإلكتروني...',
    email: 'البريد الإلكتروني',
    totalSales: 'إجمالي المبيعات',
    totalRevenue: 'إجمالي الإيرادات',
    stockItems: 'عناصر المخزون',
    joined: 'تاريخ الانضمام',
    stock: 'المخزون',
    stockForDriver: 'المخزون لـ {name}',
    noStockAssigned: 'لم يتم تعيين مخزون لهذا السائق بعد.',
    product: 'المنتج',
    quantity: 'الكمية',
    driverUpdated: 'تم تحديث السائق بنجاح!',
    driverCreated: 'تم إنشاء السائق بنجاح!',
    driverDeleted: 'تم حذف السائق بنجاح!',
    errorLoadingDrivers: 'خطأ في تحميل السائقين',
    errorSavingDriver: 'خطأ في حفظ السائق',
    errorDeletingDriver: 'خطأ في حذف السائق',
    errorFetchingStock: 'خطأ في جلب مخزون السائق',
    deleteDriver: 'حذف السائق',
    deleteDriverMessage: 'هل أنت متأكد من حذف "{name}"؟ لا يمكن التراجع عن هذا الإجراء.',
    
    // WarehouseStock Page
    pageTitleWarehouseStock: 'مخزون المستودع',
    pageDescriptionWarehouseStock: 'إدارة مستويات المخزون في المستودع مع تتبع مفصل',
    totalItems: 'إجمالي العناصر',
    lowStockItems: 'عناصر المخزون المنخفض',
    outOfStock: 'نفد المخزون',
    itemsInWarehouse: 'العناصر في المستودع',
    requiringAttention: 'تحتاج إلى انتباه',
    needsRestocking: 'تحتاج إلى إعادة تخزين',
    searchProductsOrCategories: 'البحث في المنتجات أو الفئات...',
    productId: 'معرف المنتج',
    productName: 'اسم المنتج',
    currentStock: 'المخزون الحالي',
    status: 'الحالة',
    outOfStockLabel: 'نفد المخزون',
    lowStockLabel: 'مخزون منخفض',
    mediumStock: 'مخزون متوسط',
    goodStock: 'مخزون جيد',
    updateWarehouseStock: 'تحديث مخزون المستودع',
    selectProduct: 'اختر المنتج',
    stockUpdateNote: 'أدخل الكمية الإجمالية التي تريد تعيينها لهذا المنتج في المستودع.',
    note: 'ملاحظة',
    stockUpdated: 'تم تحديث المخزون بنجاح!',
    errorUpdatingStock: 'خطأ في تحديث المخزون',
    errorLoadingStock: 'خطأ في تحميل مخزون المستودع',
    updating: 'جاري التحديث...',
    updateStock: 'تحديث المخزون',
    
    // AssignStock Page
    pageTitleAssignStock: 'تعيين المخزون للسائق',
    pageDescriptionAssignStock: 'نقل المنتجات من المستودع إلى مخزون السائق',
    selectDriver: 'اختر السائق',
    selectProduct: 'اختر المنتج',
    quantityToAssign: 'الكمية المراد تعيينها',
    availableInWarehouse: 'المتاح في المستودع',
    cannotAssignMore: 'لا يمكن تعيين أكثر من المخزون المتاح!',
    insufficientStock: 'مخزون غير كافٍ! المتاح: {quantity} وحدة',
    productDetails: 'تفاصيل المنتج',
    price: 'السعر',
    availableStock: 'المخزون المتاح',
    quickStats: 'إحصائيات سريعة',
    totalDrivers: 'إجمالي السائقين',
    totalProducts: 'إجمالي المنتجات',
    totalWarehouseItems: 'إجمالي عناصر المستودع',
    stockAssigned: 'تم تعيين المخزون بنجاح!',
    errorAssigningStock: 'خطأ في تعيين المخزون',
    errorLoadingDrivers: 'خطأ في تحميل السائقين',
    errorLoadingProducts: 'خطأ في تحميل المنتجات',
    pleaseSelectProduct: 'يرجى اختيار منتج',
    assigning: 'جاري التعيين...',
    assignStock: 'تعيين المخزون',
    sales: 'مبيعات',
    
    // Invoices Page
    pageTitleInvoices: 'الفواتير',
    pageDescriptionInvoices: 'عرض وإدارة جميع فواتير المبيعات',
    searchInvoices: 'البحث برقم الفاتورة أو العميل أو السائق...',
    itemsCount: 'عدد العناصر',
    actions: 'الإجراءات',
    view: 'عرض',
    downloadPdf: 'تحميل PDF',
    details: 'التفاصيل',
    invoice: 'فاتورة',
    items: 'العناصر',
    unitPrice: 'سعر الوحدة',
    subtotal: 'المجموع الفرعي',
    invoiceDownloaded: 'تم تحميل الفاتورة بنجاح!',
    errorDownloadingInvoice: 'خطأ في تحميل الفاتورة',
    errorLoadingInvoice: 'خطأ في تحميل الفاتورة',
    errorLoadingInvoices: 'خطأ في تحميل الفواتير',
    downloadPdfInvoice: 'تحميل فاتورة PDF',
    viewFullDetails: 'عرض التفاصيل الكاملة',
    
    // SaleDetails Page
    pageTitleSaleDetails: 'تفاصيل البيع',
    backToSales: '← العودة إلى المبيعات',
    saleNotFound: 'البيع غير موجود',
    saleNotFoundMessage: 'البيع الذي تبحث عنه غير موجود.',
    backToSalesButton: 'العودة إلى المبيعات',
    dateTime: 'التاريخ والوقت',
    
    // Login Page
    inventorySystem: 'نظام المخزون',
    signInToAccount: 'تسجيل الدخول إلى حسابك الإداري',
    emailAddress: 'عنوان البريد الإلكتروني',
    password: 'كلمة المرور',
    signingIn: 'جاري تسجيل الدخول...',
    signIn: 'تسجيل الدخول',
    loginFailed: 'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.',
    defaultCredentials: 'بيانات الاعتماد الافتراضية: admin@inventory.com / password',
    enterPassword: 'أدخل كلمة المرور',
    
    // Common
    loading: 'جاري التحميل...',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    noData: 'لا توجد بيانات متاحة',
    activeProducts: 'المنتجات النشطة في الكتالوج',
    activeDrivers: 'سائقو التوصيل النشطون',
    allTimeSales: 'عدد المبيعات الإجمالي',
    totalRevenueGenerated: 'إجمالي الإيرادات المُولدة',
    nA: 'غير متاح',
    items: 'عناصر',
    confirm: 'تأكيد',
  },
};

export const LanguageProvider = ({ children }) => {
  const isUpdatingRef = useRef(false);

  const [language, setLanguage] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('language');
        if (saved === 'en' || saved === 'ar') {
          return saved;
        }
      }
    } catch (e) {
      console.warn('Error reading language preference:', e);
    }
    return 'en';
  });

  const t = useCallback((key) => {
    try {
      return translations[language]?.[key] || key;
    } catch (e) {
      console.warn('Error getting translation:', e);
      return key;
    }
  }, [language]);

  // Apply language to document safely
  const applyLanguage = useCallback((lang) => {
    if (typeof window === 'undefined' || isUpdatingRef.current) return;
    
    try {
      isUpdatingRef.current = true;
      const isRTL = lang === 'ar';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Error applying language:', e);
    } finally {
      // Use setTimeout to prevent race conditions
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    try {
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
    } catch (e) {
      console.error('Error toggling language:', e);
    }
  }, []);

  // Apply language changes to document
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    applyLanguage(language);
  }, [language, applyLanguage]);

  // Initialize language on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      applyLanguage(language);
    } catch (e) {
      console.warn('Error initializing language:', e);
    }
  }, []); // Only run once on mount

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
