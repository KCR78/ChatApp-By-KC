/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyAN_p-yfj7PP_-cqFfIga0E38xaXwwZJNY",
    authDomain: "chatapp-by-kc.firebaseapp.com",
    projectId: "chatapp-by-kc",
    storageBucket: "chatapp-by-kc.appspot.com",
    messagingSenderId: "295571164845",
    appId: "1:295571164845:web:52b31e0860e5fbd891c024",
    measurementId: "G-YC3SXX3XS8"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    // console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});