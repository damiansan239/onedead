import React from "react";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

import { app } from "@/firebase";

const useNotification = (): Messaging | null => {
  const [messaging, setMessaging] = React.useState<Messaging | null>(null);

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

        const msgInstance = getMessaging(app);
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

    initMessaging();

    return () => {
      active = false;
    };
  }, []);

  return messaging;
};

export default useNotification;
