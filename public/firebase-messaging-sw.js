/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
// var firebaseConfig = {
//     apiKey: "AIzaSyDmU3HQg2ZEScFC5uoVAJrKq52PqMmIuAc",
//     authDomain: "chatdemo-602c9.firebaseapp.com",
//     projectId: "chatdemo-602c9",
//     storageBucket: "chatdemo-602c9.appspot.com",
//     messagingSenderId: "55333745105",
//     appId: "1:55333745105:web:b06fd5c27946a3807f30f0",
//     measurementId: "G-V0HD8TSRSX",
// };

var firebaseConfig = {
    apiKey: "AIzaSyBDYE3VxqDUySDmWNQssfrmXwQerrmnoGo",
    authDomain: "chatappdemo2-220ac.firebaseapp.com",
    projectId: "chatappdemo2-220ac",
    storageBucket: "chatappdemo2-220ac.appspot.com",
    messagingSenderId: "147430298357",
    appId: "1:147430298357:web:16ce0bfd9a638bf8206bbc",
    measurementId: "G-JY4204K7GB",
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