"use client";

import { useState, useEffect } from "react";

// Detect if running on iOS
const isIOS = () => {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
  const isStandalone = (window.navigator as any).standalone === true;
  const isInAppBrowser = /fbav|fban|instagram|twitter|line|snapchat/.test(userAgent);

  return isIOSDevice || isStandalone || isInAppBrowser;
};

// Check iOS version
const getIOSVersion = () => {
  if (typeof window === "undefined") return null;

  const match = window.navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (match) {
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: match[3] ? parseInt(match[3], 10) : 0,
    };
  }
  return null;
};

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);
  const [iosVersion, setIosVersion] = useState<{major: number, minor: number, patch: number} | null>(null);
  const [hasServiceWorker, setHasServiceWorker] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Detect iOS
    setIosDevice(isIOS());
    setIosVersion(getIOSVersion());

    // Check for service worker support
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      setHasServiceWorker(true);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      console.warn("Notifications are not supported in this browser");
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  // Check if notifications will work reliably
  const isReliable = !iosDevice || (iosVersion && iosVersion.major >= 16 && hasServiceWorker);

  return {
    permission,
    isSupported,
    requestPermission,
    isGranted: permission === "granted",
    iosDevice,
    iosVersion,
    hasServiceWorker,
    isReliable, // Whether notifications will work reliably
  };
}
