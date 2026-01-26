import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import axiosClient from '../api/axiosClient';

class FCMService {
  constructor() {
    this.token = null;
    this.isInitialized = false;
    this.onMessageCallback = null;
  }

  async initialize() {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID key
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey || vapidKey.length !== 87) {
        console.error('Invalid VAPID key. Must be 87 characters. Please check .env file.');
        return false;
      }

      // Get FCM token
      this.token = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!this.token) {
        console.error('Failed to get FCM token');
        return false;
      }

      console.log('✅ FCM Token:', this.token);

      // Register token with backend
      await this.registerToken();

      // Setup foreground message listener immediately
      // Note: The callback can be set later via setOnMessageCallback
      this.setupMessageListener();

      this.isInitialized = true;
      console.log('🎉 FCM Service fully initialized and ready');
      return true;
    } catch (error) {
      console.error('❌ FCM initialization failed:', error);
      
      if (error.message?.includes('push service error')) {
        console.error('');
        console.error('🔧 SOLUTION:');
        console.error('1. Go to: https://console.firebase.google.com/project/wearehousex-35d78/settings/cloudmessaging');
        console.error('2. Under "Web Push certificates", click "Generate key pair" (or delete and regenerate if exists)');
        console.error('3. COPY THE ENTIRE KEY (must be exactly 87 characters)');
        console.error('4. Update .env: VITE_FIREBASE_VAPID_KEY=<paste key here>');
        console.error('5. Restart: npm run dev');
        console.error('6. Clear browser: F12 > Application > Clear site data');
        console.error('');
      }
      
      return false;
    }
  }

  async registerToken() {
    if (!this.token) {
      console.warn('No token to register');
      return false;
    }

    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.warn('User not authenticated, skipping token registration');
      return false;
    }

    try {
      const response = await axiosClient.post('/fcm-token', {
        token: this.token,
        platform: 'web',
        device_id: this.getDeviceId(),
      });

      console.log('✅ Token registered with backend:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Failed to register token:', error.response?.data || error.message);
      return false;
    }
  }

  async unregisterToken() {
    if (!this.token) {
      return true;
    }

    try {
      await axiosClient.delete('/fcm-token', {
        data: { token: this.token },
      });
      console.log('✅ Token unregistered');
      this.token = null;
      return true;
    } catch (error) {
      console.error('❌ Failed to unregister token:', error);
      return false;
    }
  }

  setupMessageListener() {
    console.log('🎧 Setting up foreground message listener...');
    onMessage(messaging, (payload) => {
      console.log('===================================');
      console.log('📬 FOREGROUND MESSAGE RECEIVED!');
      console.log('===================================');
      console.log('Full payload:', payload);
      console.log('Title:', payload.notification?.title);
      console.log('Body:', payload.notification?.body);
      console.log('Data:', payload.data);
      console.log('Has callback:', !!this.onMessageCallback);
      
      if (this.onMessageCallback) {
        console.log('🎯 Calling registered callback...');
        this.onMessageCallback(payload);
        console.log('✅ Callback executed');
      } else {
        console.warn('⚠️ No callback registered for foreground messages!');
      }

      // Show browser notification if app is in focus
      if (Notification.permission === 'granted') {
        console.log('🔔 Showing browser notification');
        new Notification(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body || '',
          icon: '/logo.png',
          data: payload.data,
        });
      } else {
        console.log('🔕 Notification permission not granted:', Notification.permission);
      }
      console.log('===================================');
    });
    console.log('✅ Foreground message listener set up');
  }

  setOnMessageCallback(callback) {
    console.log('📝 Registering message callback in FCM service');
    this.onMessageCallback = callback;
    console.log('✅ Callback registered, type:', typeof callback);
  }

  getToken() {
    return this.token;
  }

  getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'web_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
}

const fcmService = new FCMService();
export default fcmService;
