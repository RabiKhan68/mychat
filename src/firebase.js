// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Init Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Ensure user is signed in anonymously
signInAnonymously(auth).catch(console.error);

export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // ✅ This is where you pass the VAPID key
      const token = await getToken(messaging, {
        vapidKey: "BE2QYSq0gUpSagRjb54fQZP2QN85XvWja12AiScoECAn8OEPKQqd3BSjXzcE3V8EKwg5BGIpI7uOX0acUvmZWfs"
      });
      console.log("📲 Device token:", token);
      return token;
    } else {
      console.log("Permission denied for notifications");
    }
  } catch (err) {
    console.error("Error getting notification permission", err);
  }
};

// Optional: handle foreground messages
onMessage(messaging, (payload) => {
  console.log("📩 Foreground message:", payload);
});