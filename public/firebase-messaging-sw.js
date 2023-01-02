/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: "AIzaSyCfuIrYAjEUFCFbd3xsuOwlw0DtG05sFoE",
    authDomain: "chat-project-apps.firebaseapp.com",
    projectId: "chat-project-apps",
    storageBucket: "chat-project-apps.appspot.com",
    messagingSenderId: "787604356818",
    appId: "1:787604356818:web:4aadf0bd2b124d7eca770b",
    measurementId: "G-HEX3KVFL2L",
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