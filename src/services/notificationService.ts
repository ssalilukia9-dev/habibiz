
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

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    
    // Some mobile browsers require serviceWorker registration before permission
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.ready;
    }

    const permission = await Notification.requestPermission();
    
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

    // Median.co / GoNative Bridge support
    // This triggers native device-level alerts that can wake the screen
    if ((window as any).median || (window as any).gonative) {
      const bridge = (window as any).median || (window as any).gonative;
      try {
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
      } catch (e) {
        console.warn("Median bridge call failed", e);
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
