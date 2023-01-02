/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyCk4ZmaU9-bGmP2x78QPh7mZpDCMdSnSjo",
    authDomain: "chatapp-demo22.firebaseapp.com",
    projectId: "chatapp-demo22",
    storageBucket: "chatapp-demo22.appspot.com",
    messagingSenderId: "140210512745",
    appId: "1:140210512745:web:a8b4c8b7e9c9cff95013f8",
    measurementId: "G-XQXHVKVJN3",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
    };

    self.registration.showNotification(notificationTitle,
        notificationOptions);
});