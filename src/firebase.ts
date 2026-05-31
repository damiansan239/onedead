// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getRemoteConfig, fetchAndActivate } from "firebase/remote-config";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM9TBuqog0Eqe-16w8o5RUCYpiBnsxUIs",
  authDomain: "one-dead.firebaseapp.com",
  databaseURL: "https://one-dead-default-rtdb.firebaseio.com",
  projectId: "one-dead",
  storageBucket: "one-dead.firebasestorage.app",
  messagingSenderId: "143126746923",
  appId: "1:143126746923:web:2437eb864c5726fdf7176e",
  measurementId: "G-D5KDQW796R",
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const analytics = import.meta.env.PROD ? getAnalytics(app) : null;

export const config = getRemoteConfig(app);

config.defaultConfig = {
  show_history: false,
  show_notifications: false,
};

fetchAndActivate(config);
