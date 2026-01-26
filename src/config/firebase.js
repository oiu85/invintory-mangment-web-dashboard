import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
// Uses environment variables if available, otherwise falls back to project defaults
// Project: wearehousex-35d78
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB4M_LWPJPtd-qG-7Ph2D83y-L3VGrSM4o',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'wearehousex-35d78.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'wearehousex-35d78',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'wearehousex-35d78.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '320924770212',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:320924770212:web:4648d32491caa75fda6b31',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-VJK3LTE7F8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
  }
}

export { messaging, getToken, onMessage };
export default app;
