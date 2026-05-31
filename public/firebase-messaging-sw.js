// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDM9TBuqog0Eqe-16w8o5RUCYpiBnsxUIs",
  authDomain: "one-dead.firebaseapp.com",
  databaseURL: "https://one-dead-default-rtdb.firebaseio.com",
  projectId: "one-dead",
  storageBucket: "one-dead.firebasestorage.app",
  messagingSenderId: "143126746923",
  appId: "1:143126746923:web:2437eb864c5726fdf7176e",
  measurementId: "G-D5KDQW796R"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Check if there are any active/open windows or tabs of this application.
  // We use includeUncontrolled: true to capture any tabs of our origin.
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    if (clientList && clientList.length > 0) {
      console.log('[firebase-messaging-sw.js] An application tab is open. Suppressing background notification.');
      return;
    }

    // All tabs/windows are closed. Fire the background notification.
    const notificationTitle = payload.notification?.title || 'Background Message Title';
    const notificationOptions = {
      body: payload.notification?.body || 'Background Message body.',
      icon: payload.notification?.icon || '/favicon.ico',
      data: payload.data,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
});