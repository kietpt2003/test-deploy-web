importScripts("https://www.gstatic.com/firebasejs/9.21.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyB2kuteEViayoLANLWE7S7usPcc77whoxA",
  authDomain: "fbdemo-f9d5f.firebaseapp.com",
  projectId: "fbdemo-f9d5f",
  storageBucket: "fbdemo-f9d5f.appspot.com",
  messagingSenderId: "487441071572",
  appId: "1:487441071572:web:f5f7e18b1d926b6cb5ea41",
  // Thêm vapidKey nếu bạn có
  vapidKey: "YOUR_VAPID_KEY_HERE" // Thay thế bằng vapidKey của bạn
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(function(payload) {

    const channel = new BroadcastChannel('notification-channel');
    
    // Gửi notification
    channel.postMessage({
      type: 'BACKGROUND_NOTIFICATION',
      payload: payload,
      timestamp: Date.now()
    });

    // Đợi một chút trước khi đóng channel
    setTimeout(() => {
      channel.close();
    }, 1000);

    // Show notification
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/logo.png",
      badge: "/logo.png",
      timestamp: Date.now()
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error('❌ [SW] Firebase initialization error:', error);
}

// Thêm log khi SW được cài đặt
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Log khi SW được kích hoạt
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Log active state
      new Promise(resolve => {
        resolve();
      })
    ])
  );
});

// Thêm message handler cho service worker
self.addEventListener('message', event => {
  // Phản hồi lại client nếu cần
  event.source.postMessage({
    type: 'SW_RECEIVED',
    payload: event.data
  });
});

self.addEventListener('activate', event => {
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const data = notification.data;
  notification.close();

  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientList => {
      for (const client of clientList) {
        if (client.url === data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (data.url) {
        return clients.openWindow(data.url);
      }
    })
  );
});

// Thêm error handler
self.addEventListener('error', (event) => {
  console.error('💥 [SW] Error:', event.error);
});
