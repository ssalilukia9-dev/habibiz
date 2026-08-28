
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import OneSignal from 'react-onesignal';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { calculateTahajjudTimings, getUpcomingWhiteDays } from './islamicScheduleService.ts';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'prayer' | 'hadith' | 'system' | 'community' | 'tahajjud' | 'whitedays' | 'feed' | 'market' | 'khatam' | 'prayers' | 'video';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: AppNotification[] = [];
  private announcementUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.loadFromStorage();
    this.setupCapacitorListeners();
    this.initChannels();
    this.initOneSignal();
    this.initAnnouncementWatcher();
  }

  /**
   * Watch the 'announcements' collection for new document additions
   * and trigger local device notifications with custom payload deep-linking to YouTube / Khatam Journey videos.
   */
  initAnnouncementWatcher() {
    if (this.announcementUnsubscribe) {
      return;
    }

    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(20));
      
      let isFirstSnapshot = true;
      const PROCESSED_KEY = 'sanctuary_notified_announcements';
      const getProcessed = (): Set<string> => {
        try {
          const raw = localStorage.getItem(PROCESSED_KEY);
          return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch (e) {
          return new Set();
        }
      };
      const markProcessed = (id: string) => {
        try {
          const current = getProcessed();
          current.add(id);
          const arr = Array.from(current).slice(-100);
          localStorage.setItem(PROCESSED_KEY, JSON.stringify(arr));
        } catch (e) {}
      };

      this.announcementUnsubscribe = onSnapshot(q, (snapshot) => {
        const processed = getProcessed();

        if (isFirstSnapshot) {
          // On initialization, register all pre-existing announcements as seen
          snapshot.docs.forEach((doc) => {
            markProcessed(doc.id);
          });
          isFirstSnapshot = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const doc = change.doc;
            const docId = doc.id;
            if (processed.has(docId)) return;
            markProcessed(docId);

            const data = doc.data();
            const title = data.title || '📢 New Sanctuary Announcement';
            const message = data.message || data.body || 'A new spiritual update has been posted to the sanctuary.';
            const type: AppNotification['type'] = (data.type === 'khatam_video' || data.type === 'video') ? 'khatam' : (data.type || 'system');
            
            // Build custom payload specifically deep-linking to the new YouTube video posted in Khatam Journey
            let actionUrl = data.targetUrl || '/?tab=resources&resId=khatam';
            const videoId = data.videoId || data.youtubeId;
            const mediaUrl = data.mediaUrl || data.url;

            if (data.type === 'khatam_video' || videoId || (mediaUrl && (mediaUrl.includes('youtu.be') || mediaUrl.includes('youtube.com')))) {
              if (videoId) {
                actionUrl = `/?tab=resources&resId=khatam&video=${encodeURIComponent(videoId)}`;
              } else if (mediaUrl) {
                actionUrl = `/?tab=resources&resId=khatam&mediaUrl=${encodeURIComponent(mediaUrl)}`;
              } else {
                actionUrl = '/?tab=resources&resId=khatam';
              }
            }

            // Trigger local device notification across Native Capacitor, Median bridge, and Web Notification APIs
            this.notify(title, message, type, actionUrl);
            console.log(`[NotificationService] New announcement received & notified: ${docId}`, { title, actionUrl });
          }
        });
      }, (err) => {
        console.warn("[NotificationService] Announcements listener error:", err);
      });
    } catch (e) {
      console.warn("[NotificationService] Failed to initialize announcement watcher:", e);
    }
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
          name: 'Prayer Reminders (Adhan)',
          description: 'Notifications for prayer/Swalah times and Athan calls',
          importance: 5, // High importance -> shows pop-up / heads-up banner
          visibility: 1, // Public visibility -> shows on lock screen
          vibration: true,
          lights: true,
          lightColor: '#A855F7'
        });

        await LocalNotifications.createChannel({
          id: 'adhkar',
          name: 'Daily Adhkar & Dua Reminders',
          description: 'Morning, evening, and bedtime Athkar and prophetic Duas',
          importance: 4,
          visibility: 1, // Shows on lock screen
          vibration: true,
          lights: true,
          lightColor: '#10B981'
        });

        await LocalNotifications.createChannel({
          id: 'tahajjud',
          name: 'Tahajjud & Qiyam Al-Layl Alarms',
          description: 'Awaken for the Last Third of the Night and voluntary night prayer',
          importance: 5, // High importance for waking up
          visibility: 1, // Shows on lock screen
          vibration: true,
          lights: true,
          lightColor: '#8B5CF6'
        });

        await LocalNotifications.createChannel({
          id: 'whitedays',
          name: 'White Days (Ayyam al-Beed) Fasting Alarms',
          description: 'Reminders for Sunnah fasting on the 13th, 14th, and 15th of the lunar month',
          importance: 4,
          visibility: 1, // Shows on lock screen
          vibration: true,
          lights: true,
          lightColor: '#F59E0B'
        });

        await LocalNotifications.createChannel({
          id: 'community',
          name: 'Community & Chat Alerts',
          description: 'Messages, halal community discussions and announcements',
          importance: 4,
          visibility: 1, // Shows on lock screen
          vibration: true,
          lights: true,
          lightColor: '#3B82F6'
        });

        console.log("Native notification channels initialized successfully for APK build.");
      } catch (e) {
        console.warn("Failed to create native notification channels:", e);
      }
    }
  }

  async scheduleTahajjudNotifications(prayerTimes: Record<string, string>) {
    const saved = localStorage.getItem('tahajjud-reminder-settings');
    const settings = saved ? JSON.parse(saved) : { enabled: true, offset: 'last_third' };

    if (!settings.enabled) {
      console.log("Tahajjud alarms are disabled by user preference.");
      return;
    }

    const maghrib = prayerTimes['Maghrib'] || '18:40';
    const fajr = prayerTimes['Fajr'] || '05:15';
    const tahajjudInfo = calculateTahajjudTimings(maghrib, fajr);

    const nativeTahajjudList: any[] = [];
    const webTahajjudList: any[] = [];

    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);

      const [fH, fM] = fajr.split(':').map(Number);
      const fajrDate = new Date(targetDate);
      fajrDate.setHours(fH, fM, 0, 0);

      // Determine alarm time based on offset preference
      let alarmDate = new Date(tahajjudInfo.startTime);
      alarmDate.setDate(targetDate.getDate());

      if (settings.offset === '60_min_before_fajr') {
        alarmDate = new Date(fajrDate.getTime() - 60 * 60 * 1000);
      } else if (settings.offset === '45_min_before_fajr') {
        alarmDate = new Date(fajrDate.getTime() - 45 * 60 * 1000);
      } else if (settings.offset === '30_min_before_fajr') {
        alarmDate = new Date(fajrDate.getTime() - 30 * 60 * 1000);
      }

      if (alarmDate.getTime() > Date.now()) {
        const timeFormatted = alarmDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        
        webTahajjudList.push({
          time: alarmDate.toISOString(),
          displayTime: timeFormatted,
          title: '🌌 Tahajjud & Last Third of the Night',
          body: 'The gates of divine mercy are open. "Is there anyone asking that I may give?" Answer the call to Qiyam.',
          actionUrl: '/?tab=resources&resId=adhkar#tahajjud'
        });

        nativeTahajjudList.push({
          id: 4001 + dayOffset,
          title: `🌌 Time for Tahajjud (${timeFormatted})`,
          body: 'The Lord descends in the last third of the night. Stand in Qiyam and seek forgiveness.',
          channelId: 'tahajjud',
          schedule: { at: alarmDate },
          extra: { actionUrl: '/?tab=resources&resId=adhkar#tahajjud' }
        });
      }
    }

    // Sync to SW
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'SCHEDULE_TAHAJJUD_NOTIFICATIONS',
            schedule: webTahajjudList
          });
        }
      } catch (e) {
        console.warn("SW Tahajjud sync failed:", e);
      }
    }

    // Native Capacitor Scheduling
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        const existing = pending.notifications
          .filter(n => n.id >= 4000 && n.id <= 4050)
          .map(n => ({ id: n.id }));

        if (existing.length > 0) {
          await LocalNotifications.cancel({ notifications: existing });
        }

        if (nativeTahajjudList.length > 0) {
          await LocalNotifications.schedule({ notifications: nativeTahajjudList });
          console.log(`Scheduled ${nativeTahajjudList.length} native Tahajjud alarms.`);
        }
      } catch (err) {
        console.warn("Failed to schedule native Tahajjud alarms:", err);
      }
    }
  }

  async scheduleWhiteDaysNotifications() {
    const saved = localStorage.getItem('whitedays-reminder-settings');
    const settings = saved ? JSON.parse(saved) : { enabled: true, advanceAlerts: true, eveningBefore: true, suhoorMorning: true };

    if (!settings.enabled) {
      console.log("White days alarms are disabled by user preference.");
      return;
    }

    const { currentMonthDays, nextMonthDays } = getUpcomingWhiteDays();
    const allMonths = [
      { name: currentMonthDays[0]?.hijriMonthName || 'Islamic Month', days: currentMonthDays },
      { name: nextMonthDays[0]?.hijriMonthName || 'Next Month', days: nextMonthDays }
    ];

    const nativeWhiteDaysList: any[] = [];
    const webWhiteDaysList: any[] = [];
    let idCounter = 5001;

    allMonths.forEach(({ name: monthName, days }) => {
      const day13 = days.find(d => d.hijriDay === 13);
      if (!day13) return;

      const day13Date = new Date(day13.gregorianDate);

      // 1. 3 Days Before (Day 10 at 20:00 / 8 PM)
      const alert3DaysEarly = new Date(day13Date);
      alert3DaysEarly.setDate(alert3DaysEarly.getDate() - 3);
      alert3DaysEarly.setHours(20, 0, 0, 0);

      if (alert3DaysEarly.getTime() > Date.now()) {
        const title = `🌙 White Days in 3 Days (13th ${monthName})`;
        const body = `Prepare your soul and schedule: The 3 blessed Sunnah White Days fasts begin in 3 days.`;
        webWhiteDaysList.push({
          time: alert3DaysEarly.toISOString(),
          title,
          body,
          actionUrl: '/?tab=resources&resId=calendar'
        });
        nativeWhiteDaysList.push({
          id: idCounter++,
          title,
          body,
          channelId: 'whitedays',
          schedule: { at: alert3DaysEarly },
          extra: { actionUrl: '/?tab=resources&resId=calendar' }
        });
      }

      // 2. 2 Days Before (Day 11 at 20:00 / 8 PM)
      const alert2DaysEarly = new Date(day13Date);
      alert2DaysEarly.setDate(alert2DaysEarly.getDate() - 2);
      alert2DaysEarly.setHours(20, 0, 0, 0);

      if (alert2DaysEarly.getTime() > Date.now()) {
        const title = `🌙 White Days in 2 Days (13th ${monthName})`;
        const body = `Fasting 3 days of each month equals fasting the entire lifetime. Set your intention for Sunnah fasting.`;
        webWhiteDaysList.push({
          time: alert2DaysEarly.toISOString(),
          title,
          body,
          actionUrl: '/?tab=resources&resId=calendar'
        });
        nativeWhiteDaysList.push({
          id: idCounter++,
          title,
          body,
          channelId: 'whitedays',
          schedule: { at: alert2DaysEarly },
          extra: { actionUrl: '/?tab=resources&resId=calendar' }
        });
      }

      // 3. 1 Day Before / Eve of 13th (Day 12 at 20:00 / 8 PM)
      const alert1DayEarly = new Date(day13Date);
      alert1DayEarly.setDate(alert1DayEarly.getDate() - 1);
      alert1DayEarly.setHours(20, 0, 0, 0);

      if (alert1DayEarly.getTime() > Date.now()) {
        const title = `🌙 White Days Fasting Begins Tomorrow! (13th ${monthName})`;
        const body = `Tomorrow is the 13th of ${monthName}. Make your Niyyah (intention) and set your Suhoor alarm.`;
        webWhiteDaysList.push({
          time: alert1DayEarly.toISOString(),
          title,
          body,
          actionUrl: '/?tab=resources&resId=calendar'
        });
        nativeWhiteDaysList.push({
          id: idCounter++,
          title,
          body,
          channelId: 'whitedays',
          schedule: { at: alert1DayEarly },
          extra: { actionUrl: '/?tab=resources&resId=calendar' }
        });
      }

      // 4. Individual White Days (13th, 14th, 15th) - Suhoor Morning Alert at 04:30 AM
      days.forEach((wd) => {
        const morningDate = new Date(wd.gregorianDate);
        morningDate.setHours(4, 30, 0, 0);

        if (morningDate.getTime() > Date.now()) {
          const ordinal = wd.hijriDay === 13 ? '1st' : wd.hijriDay === 14 ? '2nd' : '3rd';
          const title = `✨ ${ordinal} White Day Fast Today (${wd.hijriDay}th ${wd.hijriMonthName})`;
          const body = `Suhoor Mubarak! Fasting on the ${wd.hijriDay}th of ${wd.hijriMonthName} brings multiplied blessings.`;

          webWhiteDaysList.push({
            time: morningDate.toISOString(),
            title,
            body,
            actionUrl: '/?tab=resources&resId=calendar'
          });

          nativeWhiteDaysList.push({
            id: idCounter++,
            title,
            body,
            channelId: 'whitedays',
            schedule: { at: morningDate },
            extra: { actionUrl: '/?tab=resources&resId=calendar' }
          });
        }
      });
    });

    // Sync to SW
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'SCHEDULE_WHITEDAYS_NOTIFICATIONS',
            schedule: webWhiteDaysList
          });
        }
      } catch (e) {
        console.warn("SW White Days sync failed:", e);
      }
    }

    // Native Capacitor Scheduling
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        const existing = pending.notifications
          .filter(n => n.id >= 5000 && n.id <= 5090)
          .map(n => ({ id: n.id }));

        if (existing.length > 0) {
          await LocalNotifications.cancel({ notifications: existing });
        }

        if (nativeWhiteDaysList.length > 0) {
          await LocalNotifications.schedule({ notifications: nativeWhiteDaysList });
          console.log(`Scheduled ${nativeWhiteDaysList.length} native White Days 3-day advance & fasting alarms.`);
        }
      } catch (err) {
        console.warn("Failed to schedule native White Days alarms:", err);
      }
    }
  }

  async triggerTestTahajjudAlarm(delaySeconds: number = 3) {
    const isGranted = await this.requestPermission();
    if (!isGranted) return false;

    const title = "🌌 Tahajjud & Last Third of Night Alarm";
    const body = "The Lord descends to the lowest heaven. Stand in devotion and make Du'a in this blessed hour.";

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'TEST_CUSTOM_ALARM',
            delayMs: delaySeconds * 1000,
            title,
            body,
            tag: 'tahajjud-test'
          });
        }
      } catch (e) {}
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: 9998,
            title,
            body,
            channelId: 'tahajjud',
            schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
            extra: { actionUrl: '/resources?tab=adhkar' }
          }]
        });
      } catch (e) {}
    }

    setTimeout(() => {
      this.notify(title, body, 'tahajjud', '/resources?tab=adhkar');
    }, delaySeconds * 1000);

    return true;
  }

  async triggerTestWhiteDaysAlarm(delaySeconds: number = 3) {
    const isGranted = await this.requestPermission();
    if (!isGranted) return false;

    const title = "🌙 White Days Sunnah Fast Alarm (13th, 14th, 15th)";
    const body = "Reminder for Ayyam al-Beed Sunnah Fasting. Prepare Suhoor and purify your soul.";

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.active) {
          registration.active.postMessage({
            type: 'TEST_CUSTOM_ALARM',
            delayMs: delaySeconds * 1000,
            title,
            body,
            tag: 'whitedays-test'
          });
        }
      } catch (e) {}
    }

    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.schedule({
          notifications: [{
            id: 9997,
            title,
            body,
            channelId: 'whitedays',
            schedule: { at: new Date(Date.now() + delaySeconds * 1000) },
            extra: { actionUrl: '/resources?tab=calendar' }
          }]
        });
      } catch (e) {}
    }

    setTimeout(() => {
      this.notify(title, body, 'whitedays', '/resources?tab=calendar');
    }, delaySeconds * 1000);

    return true;
  }

  async scheduleDailyAdhkarAndDuaReminders() {
    const reminders = [
      { id: 3001, hour: 7, minute: 0, title: '🌅 Morning Adhkar & Protection Duas', body: 'Begin your morning with the remembrance of Allah. Recite Ayat al-Kursi & the 3 Quls for full protection.', actionUrl: '/resources?tab=adhkar&section=morning' },
      { id: 3002, hour: 17, minute: 30, title: '🌇 Evening Adhkar & Prophetic Duas', body: 'The sun is setting. Safeguard your soul and family with the evening remembrance and forgiveness prayers.', actionUrl: '/resources?tab=adhkar&section=evening' },
      { id: 3003, hour: 22, minute: 0, title: '🌌 Bedtime Adhkar & Surat Al-Mulk', body: 'Prepare for peaceful rest with Surah Al-Mulk and bedtime remembrance. Sleep in the state of purity and Wudu.', actionUrl: '/resources?tab=adhkar&section=sleep' }
    ];

    const nativeAdhkarList: any[] = [];
    const now = new Date();

    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      for (const rem of reminders) {
        const schedDate = new Date();
        schedDate.setDate(now.getDate() + dayOffset);
        schedDate.setHours(rem.hour, rem.minute, 0, 0);

        if (schedDate.getTime() > Date.now()) {
          nativeAdhkarList.push({
            id: rem.id + (dayOffset * 10),
            title: rem.title,
            body: rem.body,
            channelId: 'adhkar',
            schedule: { at: schedDate },
            extra: { actionUrl: rem.actionUrl }
          });
        }
      }
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        const existingAdhkar = pending.notifications
          .filter(n => n.id >= 3000 && n.id <= 3100)
          .map(n => ({ id: n.id }));
        
        if (existingAdhkar.length > 0) {
          await LocalNotifications.cancel({ notifications: existingAdhkar });
        }

        if (nativeAdhkarList.length > 0) {
          await LocalNotifications.schedule({ notifications: nativeAdhkarList });
          console.log(`Scheduled ${nativeAdhkarList.length} daily Adhkar & Dua native reminders.`);
        }
      } catch (err) {
        console.warn("Failed to schedule native daily Adhkar alarms:", err);
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

  async sendDirectPushNotification(userId: string, title: string, body: string, actionUrl?: string) {
    // Send standard in-app heads-up and persistent notification
    await this.notify(title, body, 'system', actionUrl);
    console.log(`[NotificationService] Direct push alert sent to user ${userId}:`, title);
  }

  private vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]); // Short double pulse
    }
  }

  async notifyNewFeedPost(author: string, content: string, postId?: string) {
    const cleanSnippet = content.length > 80 ? `${content.substring(0, 80)}...` : content;
    await this.notify(
      `💬 New NoorTalk Story by ${author || 'Community Member'}`,
      cleanSnippet || 'A new reflection has been shared on the NoorTalk community feed.',
      'feed',
      postId ? `/?tab=ummah&view=feed&post=${postId}` : '/?tab=ummah&view=feed'
    );
  }

  async notifyCommentReply(replierName: string, replyText: string, postId: string, parentCommentAuthor?: string, isPostOwner?: boolean) {
    const cleanSnippet = replyText.length > 90 ? `${replyText.substring(0, 90)}...` : replyText;
    const title = parentCommentAuthor 
      ? `💬 ${replierName} replied to ${parentCommentAuthor}'s thread`
      : (isPostOwner ? `💬 ${replierName} replied on your reflection` : `💬 New reply in discussion by ${replierName}`);
    
    const body = `"${cleanSnippet}" — Tap to view thread discussion`;
    const actionUrl = `/?tab=ummah&view=feed&post=${postId}&expand=true#post-${postId}`;

    await this.notify(title, body, 'feed', actionUrl);
    console.log(`[NotificationService] Comment thread reply notification triggered:`, { title, postId });
  }

  async notifyNewMarketProduct(title: string, price: string, seller: string, productId?: string) {
    await this.notify(
      `🛍️ New Halal Product: ${title}`,
      `Listed by ${seller || 'Verified Seller'} for ${price || 'Halal Trade'}. Tap to explore in Suq Al-Mubaraki.`,
      'market',
      productId ? `/?tab=market&product=${productId}` : '/?tab=market'
    );
  }

  async notifyNewKhatamVideo(title: string, speaker?: string, videoId?: string) {
    const speakerText = speaker ? ` featuring ${speaker}` : '';
    await this.notify(
      `📺 New Khatam Journey Video: ${title}`,
      `New spiritual lecture & reflection${speakerText} is now available in the Khatam Hub.`,
      'khatam',
      videoId ? `/?tab=resources&resId=khatam&video=${videoId}` : '/?tab=resources&resId=khatam'
    );
  }

  async notifyPrayerReminder(prayerName: string, timeStr: string) {
    await this.notify(
      `🕌 Time for ${prayerName} (${timeStr})`,
      `The sacred window for ${prayerName} prayer has arrived. Turn to Allah and find tranquility.`,
      'prayers',
      `/?tab=prayers&prayer=${encodeURIComponent(prayerName)}`
    );
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
