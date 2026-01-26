import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AppShell from '../components/layout/AppShell';
import PageContainer from '../components/layout/PageContainer';
import fcmService from '../services/fcmService';

const Layout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Initialize FCM when user is logged in
  // Note: This is a fallback initialization. Primary initialization happens in AuthContext after login
  useEffect(() => {
    if (!user) {
      return;
    }

    // Only initialize if not already initialized
    // This prevents duplicate initialization when user state changes
    if (fcmService.isInitialized) {
      // If already initialized but token registration failed, retry
      const status = fcmService.getRegistrationStatus();
      if (status.status === 'failed' && fcmService.getToken()) {
        console.log('FCM: Retrying token registration in Layout...');
        fcmService.resetRegistrationState();
        fcmService.retryRegistration().catch((error) => {
          console.error('FCM: Failed to retry registration in Layout:', error);
        });
      }
      return;
    }

    // Initialize FCM after a short delay to ensure page is loaded
    const initFCM = async () => {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise((resolve) => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Small delay to ensure everything is ready
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        await fcmService.initialize();
        
        // After initialization, if we have a token and user is authenticated, register it
        if (fcmService.getToken()) {
          console.log('FCM: Registering token in Layout after initialization...');
          await fcmService.retryRegistration();
        }
      } catch (error) {
        console.error('Failed to initialize FCM:', error);
      }
    };

    initFCM();

    // Cleanup: unregister token on logout
    return () => {
      if (!user) {
        fcmService.unregisterToken().catch((error) => {
          console.error('FCM: Failed to unregister token on cleanup:', error);
        });
      }
    };
  }, [user]);

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AppShell>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 ${sidebarOpen ? 'left-0' : '-left-full'} lg:left-0 z-sticky transition-transform duration-300 ease-in-out`}
      >
        <Sidebar 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <PageContainer className="py-6">
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </AppShell>
  );
};

export default Layout;
