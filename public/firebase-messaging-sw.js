// public/firebase-messaging-sw.js

// ✅ Import Firebase scripts (compat version required for SW)
importScripts("https://www.gstatic.com/firebasejs/12.1.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.1.0/firebase-messaging-compat.js");

// ✅ Initialize Firebase inside Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCV2S2sOE-NwCyaOxw1nD0fWnZb4K77gqs",
  authDomain: "mattho-d9ab3.firebaseapp.com",
  projectId: "mattho-d9ab3",
  storageBucket: "mattho-d9ab3.appspot.com",
  messagingSenderId: "623456589591",
  appId: "1:623456589591:web:09f87052a7cca2ed7f4952",
});

// ✅ Init messaging
const messaging = firebase.messaging();

// ✅ Handle background push messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);

  // Prefer notification fields, but fall back to data if needed
  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "You have a new message!",
    icon: "/chat.png", // make sure chat.png is in your /public folder
    badge: "/chat.png", // optional small icon
    data: {
      url: payload.fcmOptions?.link || "/", // fallback if no click_action provided
    },
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle notification click (opens app)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If app already open, focus it
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
