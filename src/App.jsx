import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './pages/ProtectedRoute';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import WarehouseStock from './pages/WarehouseStock';
import Drivers from './pages/Drivers';
import AssignStock from './pages/AssignStock';
import Sales from './pages/Sales';
import SaleDetails from './pages/SaleDetails';
import Invoices from './pages/Invoices';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import RoomLayout from './pages/RoomLayout';
import ProductDimensions from './pages/ProductDimensions';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>
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
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
