import { messaging, getToken, onMessage } from '../config/firebase';
import axiosClient from '../api/axiosClient';

class FcmService {
  constructor() {
    this.token = null;
    this.onMessageCallback = null;
  }

  /**
   * Initialize FCM service
   */
  async initialize() {
    if (!messaging) {
      console.warn('Firebase Messaging is not available');
      return;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        // Get FCM token
        await this.getToken();
        
        // Set up message listener
        this.setupMessageListener();
        
        console.log('FCM Service initialized successfully');
      } else {
        console.warn('Notification permission denied');
      }
    } catch (error) {
      console.error('Failed to initialize FCM Service:', error);
    }
  }

  /**
   * Get FCM token and register with backend
   */
  async getToken() {
    if (!messaging) return null;

    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'your-vapid-key';
      
      this.token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (this.token) {
        console.log('FCM Token:', this.token);
        await this.registerTokenWithBackend();
        return this.token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerTokenWithBackend() {
    if (!this.token) return;

    try {
      await axiosClient.post('/fcm-token', {
        token: this.token,
        platform: 'web',
        device_id: this.getDeviceId(),
      });
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Failed to register FCM token:', error);
    }
  }

  /**
   * Unregister FCM token (on logout)
   */
  async unregisterToken() {
    if (!this.token) return;

    try {
      await axiosClient.delete('/fcm-token', {
        data: { token: this.token },
      });
      this.token = null;
      console.log('FCM token unregistered');
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
    }
  }

  /**
   * Set up message listener for foreground messages
   */
  setupMessageListener() {
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Show browser notification
      this.showNotification(payload);
      
      // Call callback if set
      if (this.onMessageCallback) {
        this.onMessageCallback(payload);
      }
    });
  }

  /**
   * Show browser notification
   */
  showNotification(payload) {
    const notification = payload.notification;
    if (!notification) return;

    const notificationTitle = notification.title || 'New Notification';
    const notificationOptions = {
      body: notification.body || '',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: payload.messageId,
      data: payload.data,
    };

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
  }

  /**
   * Set callback for incoming messages
   */
  setOnMessageCallback(callback) {
    this.onMessageCallback = callback;
  }

  /**
   * Get device ID from localStorage
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = Date.now().toString();
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }
}

// Export singleton instance
export default new FcmService();
