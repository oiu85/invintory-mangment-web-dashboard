import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import fcmService from '../services/fcmService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Initialize FCM after successful user fetch
      try {
        console.log('🔔 Initializing FCM service for logged-in user');
        await fcmService.initialize();
        console.log('✅ FCM service initialized successfully');
      } catch (fcmError) {
        console.error('❌ Failed to initialize FCM after user fetch:', fcmError);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const response = await axiosClient.post('/admin/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { token, user } = response.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);

    // Initialize FCM after login
    try {
      await fcmService.initialize();
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
    }

    return response.data;
  };

  const logout = async () => {
    try {
      await fcmService.unregisterToken();
      await axiosClient.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

