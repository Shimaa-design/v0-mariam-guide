"use client";

import { useEffect, useRef, useState } from "react";
import { PrayerTimes } from "../types";

const ADHAN_SOUND_URL = "https://www.islamcan.com/audio/adhan/azan2.mp3";
const CHECK_INTERVAL = 60000; // Check every minute

interface UsePrayerNotificationsProps {
  prayerTimes: PrayerTimes | null;
  isEnabled: boolean;
  notificationPermission: NotificationPermission;
}

export function usePrayerNotifications({
  prayerTimes,
  isEnabled,
  notificationPermission,
}: UsePrayerNotificationsProps) {
  const [lastNotifiedPrayer, setLastNotifiedPrayer] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(ADHAN_SOUND_URL);
      audioRef.current.preload = "auto";
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAdhan = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.error("Error playing adhan:", error);
      }
    }
  };

  const showNotification = (prayerName: string, prayerTime: string) => {
    if (notificationPermission !== "granted") return;

    const notification = new Notification(`It's time for ${prayerName}`, {
      body: `${prayerName} prayer time is now (${prayerTime})`,
      icon: "/icon.png", // You can add an icon to your public folder
      badge: "/icon.png",
      tag: `prayer-${prayerName}`,
      requireInteraction: false,
      silent: false, // Allow browser's default sound
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 30 seconds
    setTimeout(() => notification.close(), 30000);
  };

  const checkPrayerTime = () => {
    if (!isEnabled || !prayerTimes) return;

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // Check each prayer time
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const isFriday = now.getDay() === 5;

    for (const prayer of prayers) {
      let prayerTime = prayerTimes[prayer as keyof PrayerTimes];
      let prayerDisplayName = prayer;

      // Use Jumuah time on Fridays for Dhuhr
      if (prayer === "Dhuhr" && isFriday && prayerTimes.Jumuah) {
        prayerTime = prayerTimes.Jumuah;
        prayerDisplayName = "Jumuah";
      }

      if (!prayerTime) continue;

      // Extract time without seconds
      const prayerTimeShort = prayerTime.substring(0, 5);

      // Create unique identifier for this prayer time
      const notificationId = `${currentDate}-${prayerDisplayName}-${prayerTimeShort}`;

      // Check if current time matches prayer time and we haven't notified for this prayer yet
      if (currentTime === prayerTimeShort && lastNotifiedPrayer !== notificationId) {
        console.log(`Prayer time reached: ${prayerDisplayName} at ${prayerTime}`);

        // Play adhan sound
        playAdhan();

        // Show notification
        showNotification(prayerDisplayName, prayerTime);

        // Mark as notified
        setLastNotifiedPrayer(notificationId);

        // Store in localStorage to prevent duplicate notifications if page reloads
        localStorage.setItem("lastPrayerNotification", notificationId);

        break; // Only notify for one prayer at a time
      }
    }
  };

  // Load last notification from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const lastNotification = localStorage.getItem("lastPrayerNotification");
      if (lastNotification) {
        setLastNotifiedPrayer(lastNotification);
      }
    }
  }, []);

  // Set up interval to check prayer times
  useEffect(() => {
    if (!isEnabled || !prayerTimes) {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      return;
    }

    // Check immediately
    checkPrayerTime();

    // Then check every minute
    checkIntervalRef.current = setInterval(checkPrayerTime, CHECK_INTERVAL);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isEnabled, prayerTimes, lastNotifiedPrayer, notificationPermission]);

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return {
    stopAdhan,
    lastNotifiedPrayer,
  };
}
