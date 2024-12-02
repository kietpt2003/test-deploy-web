// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2kuteEViayoLANLWE7S7usPcc77whoxA",
  authDomain: "fbdemo-f9d5f.firebaseapp.com",
  projectId: "fbdemo-f9d5f",
  storageBucket: "fbdemo-f9d5f.appspot.com",
  messagingSenderId: "487441071572",
  appId: "1:487441071572:web:f5f7e18b1d926b6cb5ea41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

let currentDeviceToken = null;  // Add this line at the top level

// Request permission to send notifications and retrieve the device token
export const requestForToken = async () => {
  try {
    // Request notification permission first
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey: "BE-r6mRU4zAHn3fE8iS_HzPf1xvtUGVzFl4PcVoKz0osGG2iffl7QBLpZ-6KeMnd5oayi93m39SNvOunTIQYPbA" // Replace with your public VAPID key from Firebase Console
    });
    if (currentToken) {
      currentDeviceToken = currentToken;  // Store token in variable
      return currentToken;
      // You can send this token to your server and store it to send notifications later
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

export const getCurrentToken = () => currentDeviceToken;  // Add this export

export const clearDeviceToken = () => {
  const token = currentDeviceToken;
  currentDeviceToken = null;
  return token;
};

// Listen for foreground messages
export const onMessageListener = (callback) => {
  const unsubscribe = onMessage(messaging, (payload) => {
    callback(payload);  // Gọi callback trực tiếp, không return
  });
  return unsubscribe;
};
