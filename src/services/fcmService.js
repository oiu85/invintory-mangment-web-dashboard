import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '../config/firebase';
import axiosClient from '../api/axiosClient';
class FcmService {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.onMessageCallback = null;
    this.isInitialized = false;
    this.registrationAttempts = 0;
    this.maxRegistrationAttempts = 5;
    this.isRegistering = false;
    this.registrationStatus = null; // 'pending', 'success', 'failed'
  }

  /**
   * Initialize FCM service
   * Following Firebase official documentation pattern
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('FCM: Already initialized');
      return;
    }

    // Check browser support
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('FCM: Service workers not supported in this browser');
      return;
    }

    // Check if push notifications are supported
    if (!('PushManager' in window)) {
      console.warn('FCM: Push notifications not supported in this browser');
      return;
    }

    try {
      console.log('FCM: Starting initialization...');

      // Get VAPID key from environment FIRST (fail fast if not configured)
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey || vapidKey === 'your-vapid-key' || vapidKey === 'BGjISSR1GNyHIguifIvU0kF7gq6JaCGKlcH7MwYNG_Yc-dfUYCZD1SH-wbuZKrSUd6PUE9R2JHiWofmqTXhY1Ao') {
        console.error('FCM: VAPID key not properly configured');
        console.error('FCM: Please follow the setup instructions in the console below:');
        console.group('📋 FCM Setup Instructions');
        console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
        console.log('2. Select your project: wearehousex-35d78');
        console.log('3. Go to Project Settings > Cloud Messaging');
        console.log('4. Scroll to "Web Push certificates"');
        console.log('5. If no key pair exists, click "Generate key pair"');
        console.log('6. Copy the key and update .env file:');
        console.log('   VITE_FIREBASE_VAPID_KEY=<your-generated-key>');
        console.log('7. Restart the dev server: npm run dev');
        console.groupEnd();
        return;
      }

      console.log('FCM: VAPID key found');

      // Request notification permission FIRST
      console.log('FCM: Requesting notification permission...');
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('FCM: Notification permission denied by user');
        console.warn('FCM: To enable notifications, click the lock icon in the address bar and allow notifications');
        return;
      }

      console.log('FCM: Notification permission granted');

      // Register service worker
      console.log('FCM: Registering service worker...');
      const registration = await this.registerServiceWorker();
      if (!registration) {
        throw new Error('Service worker registration failed');
      }

      console.log('FCM: Service worker registered successfully');

      // Wait for service worker to be ready
      const readyRegistration = await navigator.serviceWorker.ready;
      console.log('FCM: Service worker is ready');
      
      // Initialize messaging
      console.log('FCM: Initializing Firebase Messaging...');
      this.messaging = getMessaging(app);
      console.log('FCM: Firebase Messaging initialized');

      // Get FCM token with service worker registration
      console.log('FCM: Requesting FCM token...');
      console.log('FCM: Using VAPID key:', vapidKey.substring(0, 20) + '...');
      
      try {
        this.token = await getToken(this.messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: readyRegistration,
        });
      } catch (tokenError) {
        console.error('FCM: Failed to get token', {
          error: tokenError.message,
          code: tokenError.code,
          name: tokenError.name,
        });

        // Specific error handling
        if (tokenError.code === 'messaging/permission-blocked') {
          console.error('FCM: Notifications are blocked. Enable them in browser settings.');
        } else if (tokenError.code === 'messaging/token-subscribe-failed' || tokenError.message.includes('push service error')) {
          console.error('FCM: Push service error. This usually means:');
          console.group('🔧 Possible Solutions');
          console.log('1. VAPID key is incorrect or from a different Firebase project');
          console.log('2. Cloud Messaging is not enabled in Firebase Console');
          console.log('3. Web Push certificate needs to be regenerated');
          console.log('4. Try the following:');
          console.log('   a. Go to Firebase Console > Project Settings > Cloud Messaging');
          console.log('   b. Delete the existing Web Push certificate');
          console.log('   c. Generate a new key pair');
          console.log('   d. Update VITE_FIREBASE_VAPID_KEY in .env with the new key');
          console.log('   e. Restart dev server');
          console.groupEnd();
        } else if (tokenError.code === 'messaging/failed-service-worker-registration') {
          console.error('FCM: Service worker registration failed');
        }

        throw tokenError;
      }

      if (this.token) {
        console.log('✅ FCM: Token obtained successfully', {
          token_preview: this.token.substring(0, 20) + '...',
        });
        
        // Check if user is authenticated before registering
        if (this.isAuthenticated()) {
          // Register token with backend (non-blocking)
          console.log('FCM: User authenticated, registering token with backend...');
          this.registerTokenWithBackend().catch((error) => {
            console.error('FCM: Background token registration error', error);
          });
        } else {
          console.warn('FCM: User not authenticated, token will be registered after login');
        }
        
        // Set up foreground message listener
        this.setupMessageListener();
        
        this.isInitialized = true;
        console.log('✅ FCM: Initialization complete');
      } else {
        console.warn('FCM: No token received from Firebase');
      }
    } catch (error) {
      console.error('❌ FCM: Initialization failed', {
        error: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
      });

      // Don't throw - allow app to continue without FCM
      this.isInitialized = false;
    }
  }

  /**
   * Register service worker for FCM
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      // Check if service worker is already registered
      let registration = await navigator.serviceWorker.getRegistration('/');
      
      if (!registration) {
        // Register the service worker
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });
        
        // Wait for service worker to install and activate
        if (registration.installing) {
          await new Promise((resolve) => {
            const worker = registration.installing;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') {
                resolve();
              }
            });
          });
        } else if (registration.waiting) {
          // If waiting, skip waiting to activate immediately
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          await new Promise((resolve) => {
            const worker = registration.waiting;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') {
                resolve();
              }
            });
          });
        }
      }

      // Wait for service worker to be ready
      const readyRegistration = await navigator.serviceWorker.ready;
      
      // Ensure service worker is active
      if (!readyRegistration.active || readyRegistration.active.state !== 'activated') {
        throw new Error('Service worker not activated');
      }

      // Small delay to ensure service worker is fully ready
      await new Promise(resolve => setTimeout(resolve, 300));

      return readyRegistration;
    } catch (error) {
      console.error('FCM: Service worker registration error', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Register FCM token with backend
   * Includes proper error handling, authentication checks, and retry logic
   */
  async registerTokenWithBackend() {
    // Check if token exists
    if (!this.token) {
      console.warn('FCM: Cannot register token - no FCM token available');
      this.registrationStatus = 'failed';
      return;
    }

    // Check if user is authenticated
    if (!this.isAuthenticated()) {
      console.warn('FCM: Cannot register token - user not authenticated');
      this.registrationStatus = 'failed';
      return;
    }

    // Prevent concurrent registration attempts
    if (this.isRegistering) {
      console.log('FCM: Registration already in progress, skipping...');
      return;
    }

    // Check if we've exceeded max attempts
    if (this.registrationAttempts >= this.maxRegistrationAttempts) {
      console.error(`FCM: Max registration attempts (${this.maxRegistrationAttempts}) reached. Stopping retries.`);
      this.registrationStatus = 'failed';
      return;
    }

    this.isRegistering = true;
    this.registrationStatus = 'pending';
    this.registrationAttempts++;

    try {
      console.log(`FCM: Registering token with backend (attempt ${this.registrationAttempts}/${this.maxRegistrationAttempts})...`);
      
      const response = await axiosClient.post('/fcm-token', {
        token: this.token,
        platform: 'web',
        device_id: this.getDeviceId(),
      });

      if (response.data?.success) {
        console.log('FCM: Token registered successfully', {
          tokenId: response.data.data?.id,
          platform: response.data.data?.platform,
          action: response.data.data?.action,
        });
        this.registrationStatus = 'success';
        this.registrationAttempts = 0; // Reset on success
        this.isRegistering = false;
        return true;
      } else {
        throw new Error('Backend returned unsuccessful response');
      }
    } catch (error) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      };

      console.error('FCM: Failed to register token', errorDetails);

      // Handle specific error cases
      if (error.response?.status === 401) {
        console.error('FCM: Authentication failed - user may have been logged out');
        this.registrationStatus = 'failed';
        this.isRegistering = false;
        return false;
      }

      if (error.response?.status === 422) {
        console.error('FCM: Validation error - check token format');
        this.registrationStatus = 'failed';
        this.isRegistering = false;
        return false;
      }

      // For other errors, retry with exponential backoff
      if (this.registrationAttempts < this.maxRegistrationAttempts) {
        const delay = Math.min(3000 * Math.pow(2, this.registrationAttempts - 1), 30000); // Max 30 seconds
        console.log(`FCM: Retrying registration in ${delay}ms...`);
        
        this.isRegistering = false;
        setTimeout(() => {
          this.registerTokenWithBackend();
        }, delay);
      } else {
        console.error('FCM: Max registration attempts reached. Token registration failed.');
        this.registrationStatus = 'failed';
        this.isRegistering = false;
      }

      return false;
    }
  }

  /**
   * Set up message listener for foreground messages
   */
  setupMessageListener() {
    if (!this.messaging) {
      return;
    }

    onMessage(this.messaging, (payload) => {
      // Show notification
      this.showNotification(payload);
      
      // Call custom callback if set
      if (this.onMessageCallback) {
        try {
          this.onMessageCallback(payload);
        } catch (error) {
          console.error('FCM: Callback error', error);
        }
      }
    });
  }

  /**
   * Show browser notification
   */
  showNotification(payload) {
    const notification = payload.notification;
    if (!notification) {
      return;
    }

    const notificationTitle = notification.title || 'New Notification';
    const notificationOptions = {
      body: notification.body || '',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: payload.messageId,
      data: payload.data || {},
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
   * Unregister FCM token (on logout)
   */
  async unregisterToken() {
    if (!this.token) {
      return;
    }

    try {
      await axiosClient.delete('/fcm-token', {
        data: { token: this.token },
      });
      this.token = null;
      this.isInitialized = false;
      this.messaging = null;
    } catch (error) {
      console.error('FCM: Failed to unregister token', error);
    }
  }

  /**
   * Get device ID from localStorage
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Get current FCM token
   */
  getToken() {
    return this.token;
  }

  /**
   * Get registration status
   */
  getRegistrationStatus() {
    return {
      status: this.registrationStatus,
      attempts: this.registrationAttempts,
      maxAttempts: this.maxRegistrationAttempts,
      isRegistering: this.isRegistering,
    };
  }

  /**
   * Reset registration state (useful for retrying after login)
   */
  resetRegistrationState() {
    this.registrationAttempts = 0;
    this.registrationStatus = null;
    this.isRegistering = false;
  }

  /**
   * Manually trigger token registration (useful after login)
   */
  async retryRegistration() {
    this.resetRegistrationState();
    if (this.token && this.isAuthenticated()) {
      return await this.registerTokenWithBackend();
    } else {
      console.warn('FCM: Cannot retry registration - missing token or authentication');
      return false;
    }
  }

  /**
   * Get comprehensive debug information
   * Useful for troubleshooting token registration issues
   */
  getDebugInfo() {
    const authToken = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    return {
      fcm: {
        isInitialized: this.isInitialized,
        hasToken: !!this.token,
        tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : null,
        registrationStatus: this.getRegistrationStatus(),
      },
      authentication: {
        isAuthenticated: this.isAuthenticated(),
        hasAuthToken: !!authToken,
        authTokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
        user: user ? JSON.parse(user) : null,
      },
      browser: {
        serviceWorkerSupported: 'serviceWorker' in navigator,
        notificationPermission: Notification.permission,
        serviceWorkerRegistration: null, // Will be populated if available
      },
    };
  }

  /**
   * Print debug information to console
   */
  debug() {
    const info = this.getDebugInfo();
    console.group('🔍 FCM Debug Information');
    console.log('FCM Status:', info.fcm);
    console.log('Authentication:', info.authentication);
    console.log('Browser Support:', info.browser);
    console.groupEnd();
    return info;
  }
}

// Export singleton instance
const fcmServiceInstance = new FcmService();

// Expose to window for debugging (development only)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.fcmService = fcmServiceInstance;
  console.log('💡 FCM Service exposed to window.fcmService for debugging');
  console.log('   Try: window.fcmService.debug()');
}

export default fcmServiceInstance;
