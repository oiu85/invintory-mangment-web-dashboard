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
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
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

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // This looks to see if the current is already open and focuses if it is
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
