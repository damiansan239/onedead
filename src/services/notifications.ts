import React from "react";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

import { getDatabase, ref, push } from "firebase/database";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

import { app } from "@/firebase";

const useNotification = (): Messaging | null => {
  const [messaging, setMessaging] = React.useState<Messaging | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  const auth = getAuth(app);
  const database = getDatabase(app);
  const msgInstance = getMessaging(app);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  React.useEffect(() => {
    let active = true;


    const initMessaging = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.warn(
            "Firebase Cloud Messaging is not supported in this browser/environment.",
          );
          return;
        }

        if (!active) return;
        setMessaging(msgInstance);

        // Register foreground message handler
        onMessage(msgInstance, (payload) => {
          console.log("Foreground message received:", payload);

          // Display foreground notification if permitted
          if (Notification.permission === "granted") {
            const { title, body, icon } = payload.notification || {};
            new Notification(title || "New Notification", {
              body,
              icon: icon || "/favicon.ico",
              data: payload.data,
            });
          }
        });

        // Request permission and retrieve the FCM token
        const permission = await Notification.requestPermission();
        if (permission === "granted" && active) {
          const token = await getToken(msgInstance, {
            vapidKey: import.meta.env.VITE_VAPID_KEY,
          });

          const userTokensRef = ref(database, `users/${currentUser?.uid}/tokens`);
          push(userTokensRef, token);
          console.log("FCM Token obtained successfully:", token);
        } else {
          console.log(
            "FCM notification permission not granted or state inactive:",
            permission,
          );
        }
      } catch (error) {
        console.error("Failed to initialize Firebase Messaging:", error);
      }
    };

    if (currentUser) {
      initMessaging();
    }

    return () => {
      active = false;
    };
  }, [currentUser, database, msgInstance]);

  return messaging;
};

export default useNotification;
