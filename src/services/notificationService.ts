
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import OneSignal from 'react-onesignal';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'prayer' | 'hadith' | 'system' | 'community';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: AppNotification[] = [];

  private constructor() {
    this.loadFromStorage();
    this.setupCapacitorListeners();
    this.initChannels();
    this.initOneSignal();
  }

  async initOneSignal() {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId) {
      console.warn("OneSignal VITE_ONESIGNAL_APP_ID is not configured in environment variables. Web Push is inactive.");
      return;
    }

    try {
      console.log("Initializing OneSignal Web Push with App ID:", appId);
      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false, // Custom UI will handle prompting
        } as any,
      });
      console.log("OneSignal initialized successfully!");
    } catch (err) {
      console.error("OneSignal initialization failed gracefully:", err);
    }
  }

  async setOneSignalUser(userId: string, email?: string) {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId) return;

    try {
      // Modern Web SDK V16 syntax support
      if (OneSignal.login) {
        await OneSignal.login(userId);
      }
      if (email && OneSignal.User?.addTag) {
        await OneSignal.User.addTag("email", email);
      }
    } catch (e) {
      console.warn("Setting OneSignal user info failed gracefully:", e);
    }
  }

  async clearOneSignalUser() {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId) return;

    try {
      if (OneSignal.logout) {
        await OneSignal.logout();
      }
    } catch (e) {
      console.warn("Clearing OneSignal user failed gracefully:", e);
    }
  }

  async initChannels() {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.createChannel({
          id: 'prayer',
          name: 'Prayer Reminders',
          description: 'Notifications for prayer/Swalah times and daily reminders',
          importance: 5, // High importance -> shows pop-up / heads-up banner
          visibility: 1, // Public visibility -> shows on lock screen
          vibration: true,
          lights: true,
          lightColor: '#A855F7'
        });
        console.log("Native prayer notification channel initialized.");
      } catch (e) {
        console.warn("Failed to create native notification channel:", e);
      }
    }
  }

  async schedulePrayerNotifications(prayerTimes: Record<string, string>) {
    // 1. Read user reminder preferences
    const savedReminders = localStorage.getItem('prayer-reminders');
    const settings = savedReminders ? JSON.parse(savedReminders) : { 
      Global: true, Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true 
    };

    if (settings.Global === false) {
      console.log("Prayer notifications are globally disabled in settings.");
      return;
    }

    const preferredAdhanId = localStorage.getItem('preferred-adhan-id') || 'makkah';
    const adhanVoiceTitles: Record<string, string> = {
      makkah: 'Makkah Al-Mukarramah',
      madinah: 'Al-Madinah Al-Munawwarah',
      alafasy: 'Mishary Rashid Alafasy',
      fajr_makkah: 'Fajr Makkah Al-Haram',
      alaqsa: 'Al-Aqsa Mosque (Al-Quds)',
      minshawi: 'Sheikh Mohamed Siddiq El-Minshawi',
      abdulbasit: 'Sheikh Abdulbasit Abdusamad',
      dubai: 'Dubai Adhan',
      lebanon: 'Sheikh Abd Alrazaq Saleh',
      nasreddine: 'Nasreddine Toubar',
      arkan: 'Sheikh Abdul Wali Al-Arkani',
      brunei: 'Sultan Omar Ali Saifuddien'
    };
    const adhanVoice = adhanVoiceTitles[preferredAdhanId] || 'Sacred Recitation';

    const prayersToCheck = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const webScheduleItems: any[] = [];
    const nativeNotifications: any[] = [];
    let idCounter = 2000;

    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      for (const prayer of prayersToCheck) {
        if (settings[prayer] === false) continue;
        const timeStr = prayerTimes[prayer];
        if (!timeStr) continue;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduleTime = new Date(targetDate);
        scheduleTime.setHours(hours, minutes, 0, 0);

        if (scheduleTime.getTime() > Date.now()) {
          // Add for Service Worker Background Scheduler
          webScheduleItems.push({
            prayer,
            time: scheduleTime.toISOString(),
            displayTime: timeStr,
            id: `${prayer}-${scheduleTime.getTime()}`
          });

          // Add for Native Capacitor Scheduler
          nativeNotifications.push({
            id: idCounter++,
            title: `🕌 Time for ${prayer} (${timeStr})`,
            body: `The sacred call to prayer has begun (${adhanVoice}). Come to success.`,
            channelId: 'prayer',
            schedule: { at: scheduleTime },
            extra: {
              actionUrl: `/?athan=${encodeURIComponent(prayer)}&time=${encodeURIComponent(timeStr)}#adhan`,
              prayerName: prayer
            }
          });
        }
      }
    }

    // A. Dispatch to Service Worker for background / closed-app web push & timers
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'SCHEDULE_PRAYER_NOTIFICATIONS',
            schedule: webScheduleItems,
            adhanVoice
          });
        }
      } catch (err) {
        console.warn("ServiceWorker schedule sync failed:", err);
      }
    }

    // B. Save schedule to LocalStorage for offline and tab-restore checks
    localStorage.setItem('sanctuary_scheduled_prayers', JSON.stringify({
      updatedAt: Date.now(),
      schedule: webScheduleItems
    }));

    // C. Schedule Native Capacitor Notifications (iOS / Android APK)
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        const prayerPendingIds = pending.notifications
          .filter(n => n.id >= 2000 && n.id <= 2500)
          .map(n => ({ id: n.id }));
        
        if (prayerPendingIds.length > 0) {
          await LocalNotifications.cancel({ notifications: prayerPendingIds });
        }

        if (nativeNotifications.length > 0) {
          await LocalNotifications.schedule({
            notifications: nativeNotifications
          });
          console.log(`Successfully scheduled ${nativeNotifications.length} native prayer alarms.`);
        }
      } catch (e) {
        console.warn("Native prayer scheduling failed:", e);
      }
    }
  }

  async triggerTestClosedAppAthan(delaySeconds: number = 4, prayerName: string = 'Asr') {
    const preferredAdhanId = localStorage.getItem('preferred-adhan-id') || 'makkah';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Request permission if not already granted
    const isGranted = await this.requestPermission();
    if (!isGranted) {
      alert("Please allow notification permissions to receive Athan calls when the app is closed.");
      return;
    }

    // Dispatch test to Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'TEST_PRAYER_ALARM',
            delayMs: delaySeconds * 1000,
            prayerName,
            prayerTime: timeStr,
            adhanVoice: 'Makkah Al-Mukarramah'
          });
        }
      } catch (err) {
        console.warn("SW test trigger error:", err);
      }
    }

    // If native Capacitor
    if (Capacitor.isNativePlatform()) {
      const scheduleTime = new Date(Date.now() + delaySeconds * 1000);
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: 9999,
            title: `🕌 Time for ${prayerName} (${timeStr})`,
            body: `The sacred call to prayer has begun (Makkah Al-Mukarramah). Come to prayer, come to success.`,
            channelId: 'prayer',
            schedule: { at: scheduleTime },
            extra: {
              actionUrl: `/?athan=${encodeURIComponent(prayerName)}&time=${encodeURIComponent(timeStr)}#adhan`,
              prayerName
            }
          }]
        });
      } catch (e) {
        console.warn("Native test schedule failed:", e);
      }
    }
  }

  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('app_notifications');
    if (saved) {
      this.notifications = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
  }

  private saveToStorage() {
    localStorage.setItem('app_notifications', JSON.stringify(this.notifications));
  }

  private setupCapacitorListeners() {
    if (Capacitor.isNativePlatform()) {
      try {
        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          const actionUrl = notification.notification.extra?.actionUrl;
          if (actionUrl) {
            if (actionUrl.startsWith('#')) {
              window.location.hash = actionUrl;
            } else {
              window.location.pathname = actionUrl;
            }
          }
        });
      } catch (e) {
        console.warn("Failed to register localNotificationActionPerformed listener", e);
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        const permResult = await LocalNotifications.requestPermissions();
        return permResult.display === 'granted';
      } catch (e) {
        console.warn("Capacitor requestPermissions failed, falling back...", e);
      }
    }

    if (!('Notification' in window)) return false;
    
    // Some mobile browsers require serviceWorker registration before permission
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }

    const permission = await Notification.requestPermission();
    
    // OneSignal subscription request if appId is configured
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (appId && permission === 'granted') {
      try {
        if (OneSignal.Notifications?.requestPermission) {
          await OneSignal.Notifications.requestPermission();
          console.log("OneSignal push permission request processed.");
        } else if ((OneSignal as any).registerForPushNotifications) {
          await (OneSignal as any).registerForPushNotifications();
        }
      } catch (e) {
        console.warn("OneSignal permission request failed gracefully:", e);
      }
    }
    
    // Median bridge specific push registration
    if (permission === 'granted' && ((window as any).median || (window as any).gonative)) {
      const bridge = (window as any).median || (window as any).gonative;
      try {
        // Request deep native integration
        bridge.nativebridge.postMessage(JSON.stringify({
          type: 'push',
          action: 'register'
        }));
      } catch (e) {
        console.warn("Median push registration failed", e);
      }
    }

    return permission === 'granted';
  }

  async notify(title: string, body: string, type: AppNotification['type'], actionUrl?: string) {
    const id = Math.random().toString(36).substring(7);
    const notification: AppNotification = {
      id,
      title,
      body,
      type,
      timestamp: new Date(),
      read: false,
      actionUrl
    };

    // Native Capacitor support
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 1000000),
              channelId: 'prayer',
              extra: {
                actionUrl
              }
            }
          ]
        });
      } catch (e) {
        console.warn("Capacitor local notification schedule failed, falling back to other layers...", e);
      }
    }

    // Median.co / GoNative Bridge support
    // This triggers native device-level alerts that can wake the screen
    if ((window as any).median || (window as any).gonative) {
      const bridge = (window as any).median || (window as any).gonative;
      try {
        // Bypass pattern A: Try the high-level Local Notifications API Namespace directly if registered
        if (bridge.localNotifications && typeof bridge.localNotifications.create === 'function') {
          bridge.localNotifications.create({
            title: title,
            message: body,
            actionUrl: actionUrl || '/',
            vibrate: true,
            sound: true
          });
        }
        
        // Bypass pattern B: Try standard postMessage commands
        if (bridge.nativebridge && typeof bridge.nativebridge.postMessage === 'function') {
          // Native local notification (works without internet if app is in background)
          bridge.nativebridge.postMessage(JSON.stringify({
            type: 'localNotification',
            title,
            message: body,
            actionUrl: actionUrl || '/',
            vibrate: true,
            sound: true,
            wakeScreen: true // Attempt to wake screen
          }));
          
          // Also send generic notification message if localNotification is not supported
          bridge.nativebridge.postMessage(JSON.stringify({
            type: 'notification',
            title,
            message: body,
            actionUrl: actionUrl || '/'
          }));
        }
      } catch (e) {
        console.warn("Median bridge call failed, falling back to Web API...", e);
      }
    }

    // Add to in-app list
    this.notifications.unshift(notification);
    this.notifications = this.notifications.slice(0, 50); // Keep last 50
    this.saveToStorage();

    // Play Sound if enabled (checking localStorage for preference or defaulting to true for chat)
    const savedReminders = localStorage.getItem('prayer-reminders');
    const reminders = savedReminders ? JSON.parse(savedReminders) : { Adhan: true };
    
    // For chat, we trigger sound if it's not a prayer reminder (those have their own logic usually)
    // or if the user enabled Adhan sounds (as a proxy for global audio)
    if (reminders.Adhan || type === 'community') {
      this.playNotificationSound();
      this.vibrate();
    }

    // Trigger System Notification
    if (Notification.permission === 'granted') {
      const iconUrl = 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7';
      const notificationOptions: any = {
        body,
        icon: iconUrl,
        badge: iconUrl,
        tag: type,
        vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40], // Complex "attention" pattern
        requireInteraction: type === 'community' || type === 'prayer',
        renotify: true,
        silent: false,
        priority: 'high',
        dir: 'auto'
      };

      try {
        // Try SW first if controller exists (better for "heads-up" on mobile)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, notificationOptions);
          });
        } else {
          const n = new Notification(title, notificationOptions);
          n.onclick = (e) => {
            e.preventDefault();
            window.focus();
            if (actionUrl) {
               if (actionUrl.startsWith('#')) {
                  window.location.hash = actionUrl;
               } else {
                  window.location.pathname = actionUrl;
               }
            }
            n.close();
          };
        }
      } catch (e) {
        console.error("Notification trigger failed", e);
      }
    }

    // Custom Event for UI update
    window.dispatchEvent(new CustomEvent('notification_received', { detail: notification }));
  }

  private playNotificationSound() {
    try {
      // iPhone-style "Chime" sound
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'); 
      audio.volume = 0.6;
      audio.play().catch(e => {
        console.warn("Audio playback failed:", e);
        // Fallback for mobile: Play on next interaction or just skip if blocked
      });
    } catch (e) {
      console.warn("Could not play notification sound", e);
    }
  }

  private vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // Short double pulse
    }
  }

  getNotifications() {
    return this.notifications;
  }

  markAsRead(id: string) {
    const n = this.notifications.find(notif => notif.id === id);
    if (n) {
      n.read = true;
      this.saveToStorage();
      window.dispatchEvent(new CustomEvent('notification_updated'));
    }
  }

  clearAll() {
    this.notifications = [];
    this.saveToStorage();
    window.dispatchEvent(new CustomEvent('notification_updated'));
  }
}

export const notificationService = NotificationService.getInstance();
