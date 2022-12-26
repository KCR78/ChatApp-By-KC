/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyCo_mAoSpnhpDKCf-sN8TAy54Bem9lg93E",
    authDomain: "chatapp-by-kcr.firebaseapp.com",
    projectId: "chatapp-by-kcr",
    storageBucket: "chatapp-by-kcr.appspot.com",
    messagingSenderId: "618273233205",
    appId: "1:618273233205:web:482566996fa9a19eb3d47c",
    measurementId: "G-KYH4G90Z8G"
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