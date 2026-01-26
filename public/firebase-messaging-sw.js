// Firebase Cloud Messaging Service Worker
// This file must be in the public directory to be accessible at the root URL

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Firebase configuration
// These values should match your firebase.js config
const firebaseConfig = {
  apiKey: 'AIzaSyB4M_LWPJPtd-qG-7Ph2D83y-L3VGrSM4o',
  authDomain: 'wearehousex-35d78.firebaseapp.com',
  projectId: 'wearehousex-35d78',
  storageBucket: 'wearehousex-35d78.firebasestorage.app',
  messagingSenderId: '320924770212',
  appId: '1:320924770212:web:4648d32491caa75fda6b31',
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error('[SW] Firebase init error:', error);
}

// Retrieve an instance of Firebase Messaging
let messaging = null;
try {
  messaging = firebase.messaging();
} catch (error) {
  console.error('[SW] Messaging error:', error);
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: payload.messageId,
      data: payload.data,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle service worker installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      self.registration.pushManager.getSubscription().catch(() => null)
    ])
  );
});

// Handle push events (required for FCM)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const notificationTitle = data.notification?.title || 'New Notification';
    const notificationOptions = {
      body: data.notification?.body || '',
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: data.messageId,
      data: data.data,
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
