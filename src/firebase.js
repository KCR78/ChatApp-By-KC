import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAN_p-yfj7PP_-cqFfIga0E38xaXwwZJNY",
  authDomain: "chatapp-by-kc.firebaseapp.com",
  projectId: "chatapp-by-kc",
  storageBucket: "chatapp-by-kc.appspot.com",
  messagingSenderId: "295571164845",
  appId: "1:295571164845:web:52b31e0860e5fbd891c024",
  measurementId: "G-YC3SXX3XS8"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();

export const provider = new GoogleAuthProvider();

export const storage = getStorage();
export const db = getFirestore();

export const messaging = getMessaging(app);


export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });