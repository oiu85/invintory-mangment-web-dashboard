import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './pages/ProtectedRoute';
import Layout from './pages/Layout';
import Skeleton from './components/ui/Skeleton';
import Card from './components/ui/Card';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const WarehouseStock = lazy(() => import('./pages/WarehouseStock'));
const Drivers = lazy(() => import('./pages/Drivers'));
const DriverDetails = lazy(() => import('./pages/DriverDetails'));
const AssignStock = lazy(() => import('./pages/AssignStock'));
const Sales = lazy(() => import('./pages/Sales'));
const SaleDetails = lazy(() => import('./pages/SaleDetails'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Rooms = lazy(() => import('./pages/Rooms'));
const RoomDetails = lazy(() => import('./pages/RoomDetails'));
const RoomLayout = lazy(() => import('./pages/RoomLayout'));
const ProductDimensions = lazy(() => import('./pages/ProductDimensions'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Card variant="elevated" className="p-8">
      <div className="space-y-4">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    </Card>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="products" element={<Products />} />
                      <Route path="categories" element={<Categories />} />
                      <Route path="warehouse-stock" element={<WarehouseStock />} />
                      <Route path="drivers" element={<Drivers />} />
                      <Route path="drivers/:id" element={<DriverDetails />} />
                      <Route path="assign-stock" element={<AssignStock />} />
                      <Route path="sales" element={<Sales />} />
                      <Route path="sales/:id" element={<SaleDetails />} />
                      <Route path="invoices" element={<Invoices />} />
                      <Route path="rooms" element={<Rooms />} />
                      <Route path="rooms/:id" element={<RoomDetails />} />
                      <Route path="rooms/:id/generate-layout" element={<RoomLayout />} />
                      <Route path="product-dimensions" element={<ProductDimensions />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
