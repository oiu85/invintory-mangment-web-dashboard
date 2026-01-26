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

    // Initialize FCM and register token after successful login
    // Use a small delay to ensure token is set in localStorage
    try {
      // Wait a bit for localStorage to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Initialize FCM (this will get the token)
      await fcmService.initialize();
      
      // If FCM is already initialized and has a token, register it
      // This handles the case where FCM was initialized before login
      if (fcmService.getToken()) {
        console.log('FCM: Registering token after login...');
        // Reset registration state and retry
        fcmService.resetRegistrationState();
        await fcmService.retryRegistration();
      }
    } catch (error) {
      console.error('Failed to initialize FCM after login:', error);
      // Don't fail login if FCM fails
    }

    return response.data;
  };

  const logout = async () => {
    try {
      // Unregister FCM token before logout
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

