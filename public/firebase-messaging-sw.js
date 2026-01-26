importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB4M_LWPJPtd-qG-7Ph2D83y-L3VGrSM4o",
  authDomain: "wearehousex-35d78.firebaseapp.com",
  projectId: "wearehousex-35d78",
  storageBucket: "wearehousex-35d78.firebasestorage.app",
  messagingSenderId: "320924770212",
  appId: "1:320924770212:web:4648d32491caa75fda6b31",
  measurementId: "G-VJK3LTE7F8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
