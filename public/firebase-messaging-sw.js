// public/firebase-messaging-sw.js

// ✅ Use importScripts (no "import" allowed in service workers)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// ✅ Initialize Firebase inside service worker
firebase.initializeApp({
  apiKey: "AIzaSyCV2S2sOE-NwCyaOxw1nD0fWnZb4K77gqs",
  authDomain: "mattho-d9ab3.firebaseapp.com",
  projectId: "mattho-d9ab3",
  storageBucket: "mattho-d9ab3.firebasestorage.app",
  messagingSenderId: "623456589591",
  appId: "1:623456589591:web:09f87052a7cca2ed7f4952",
});

// ✅ Init messaging
const messaging = firebase.messaging();

// ✅ Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message:", payload);

  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message!",
    icon: "/chat.png", // place a chat.png in public/
  };

  // Show push notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});
