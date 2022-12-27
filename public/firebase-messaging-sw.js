/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyCiNZRBzZn-cDRQ7ecBuAoNPlU1GRzyKE0",
    authDomain: "demochat-d8037.firebaseapp.com",
    projectId: "demochat-d8037",
    storageBucket: "demochat-d8037.appspot.com",
    messagingSenderId: "981484670979",
    appId: "1:981484670979:web:67acb3cfcc913a31e17e36",
    measurementId: "G-CMLLT6LM7N",
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