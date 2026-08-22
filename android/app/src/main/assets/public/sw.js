/* eslint-disable no-restricted-globals */

// Cache Name for offline audio and prayer assets
const CACHE_NAME = 'sanctuary-athan-v2';
const ADHAN_ASSETS = [
  '/',
  '/index.html',
  'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'
];

let scheduledTimers = [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ADHAN_ASSETS).catch((err) => {
        console.warn('Pre-caching some assets failed non-fatally:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Periodic prayer schedule checker in Service Worker
function checkAndTriggerPendingPrayers(prayerSchedule, adhanTitle) {
  if (!prayerSchedule || !Array.isArray(prayerSchedule)) return;

  const now = Date.now();
  for (const item of prayerSchedule) {
    const triggerTime = new Date(item.time).getTime();
    // If within 45 seconds of trigger time
    if (Math.abs(now - triggerTime) < 45000 && !item.triggered) {
      item.triggered = true;
      showAdhanNotification(item.prayer, item.displayTime, adhanTitle || 'Sacred Recitation');
    }
  }
}

function showAdhanNotification(prayerName, prayerTime, adhanVoice) {
  const prayerIcons = {
    Fajr: '🌅',
    Sunrise: '🌄',
    Dhuhr: '☀️',
    Asr: '🌤️',
    Maghrib: '🌇',
    Isha: '🌌',
    Jummah: '🕌'
  };

  const iconEmoji = prayerIcons[prayerName] || '🕌';
  const title = `${iconEmoji} Time for ${prayerName} Prayer (${prayerTime})`;
  const body = `The sacred call to prayer has begun (${adhanVoice}). Answer the call: "Hayya 'ala as-Salah, Hayya 'ala al-Falah."`;

  const options = {
    body,
    icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
    badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
    tag: `athan-${prayerName}-${Date.now()}`,
    vibrate: [500, 150, 500, 150, 450, 150, 200, 100, 170, 50, 450, 150, 200, 100, 170, 50],
    requireInteraction: true,
    renotify: true,
    silent: false,
    data: {
      actionUrl: `/?athan=${encodeURIComponent(prayerName)}&time=${encodeURIComponent(prayerTime)}#adhan`,
      prayerName,
      prayerTime,
      type: 'athan'
    },
    actions: [
      {
        action: 'listen_athan',
        title: '🔊 Listen Adhan & Du\'a'
      },
      {
        action: 'open_qibla',
        title: '🧭 Qibla Compass'
      },
      {
        action: 'mark_prayed',
        title: '🤲 Claim +50 Hasanat'
      }
    ]
  };

  return self.registration.showNotification(title, options);
}

// Listen for messages from web application
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SCHEDULE_PRAYER_NOTIFICATIONS') {
    // Clear previous memory timers
    scheduledTimers.forEach(t => clearTimeout(t));
    scheduledTimers = [];

    const schedule = data.schedule || [];
    const adhanVoice = data.adhanVoice || 'Makkah Al-Mukarramah';

    schedule.forEach((item) => {
      const delayMs = new Date(item.time).getTime() - Date.now();
      if (delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) { // Within 24 hours
        const timerId = setTimeout(() => {
          showAdhanNotification(item.prayer, item.displayTime, adhanVoice);
        }, delayMs);
        scheduledTimers.push(timerId);
      }
    });

    console.log(`Service Worker scheduled ${scheduledTimers.length} closed-app Athan alarms.`);
  }

  if (data.type === 'TEST_PRAYER_ALARM') {
    const delayMs = data.delayMs || 4000;
    const prayerName = data.prayerName || 'Asr';
    const prayerTime = data.prayerTime || '16:30';
    const adhanVoice = data.adhanVoice || 'Makkah Al-Mukarramah';

    setTimeout(() => {
      showAdhanNotification(prayerName, prayerTime, adhanVoice);
    }, delayMs);
  }

  if (data.type === 'SCHEDULE_TAHAJJUD_NOTIFICATIONS') {
    const schedule = data.schedule || [];
    schedule.forEach((item) => {
      const delayMs = new Date(item.time).getTime() - Date.now();
      if (delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          self.registration.showNotification(item.title || '🌌 Tahajjud & Qiyam Al-Layl', {
            body: item.body || 'The Lord descends to the lowest heaven in the last third of the night. Stand in Qiyam.',
            icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=8B5CF6',
            badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=8B5CF6',
            vibrate: [500, 150, 500, 150, 450, 150],
            requireInteraction: true,
            renotify: true,
            tag: `tahajjud-${Date.now()}`,
            data: { actionUrl: item.actionUrl || '/resources?tab=adhkar' },
            actions: [
              { action: 'open_tahajjud', title: '🤲 Read Tahajjud Duas' },
              { action: 'open_quran', title: '📖 Quran Recitation' }
            ]
          });
        }, delayMs);
      }
    });
  }

  if (data.type === 'SCHEDULE_WHITEDAYS_NOTIFICATIONS') {
    const schedule = data.schedule || [];
    schedule.forEach((item) => {
      const delayMs = new Date(item.time).getTime() - Date.now();
      if (delayMs > 0 && delayMs < 72 * 60 * 60 * 1000) { // Within 72 hours
        setTimeout(() => {
          self.registration.showNotification(item.title || '🌙 White Days Sunnah Fast', {
            body: item.body || 'Reminder for Ayyam al-Beed Sunnah Fasting (13th, 14th, 15th of the lunar month).',
            icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=F59E0B',
            badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=F59E0B',
            vibrate: [400, 100, 400, 100],
            requireInteraction: true,
            renotify: true,
            tag: `whitedays-${Date.now()}`,
            data: { actionUrl: item.actionUrl || '/resources?tab=calendar' },
            actions: [
              { action: 'open_fasting', title: '🌙 Set Fasting Intention' },
              { action: 'open_calendar', title: '📅 Islamic Calendar' }
            ]
          });
        }, delayMs);
      }
    });
  }

  if (data.type === 'TEST_CUSTOM_ALARM') {
    const delayMs = data.delayMs || 3000;
    const title = data.title || '🔔 Islamic Reminder Alarm';
    const body = data.body || 'Habibi Islamic Sanctuary reminder.';
    const tag = data.tag || `custom-${Date.now()}`;

    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
        badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
        vibrate: [500, 150, 500, 150, 400, 100],
        requireInteraction: true,
        tag
      });
    }, delayMs);
  }
});

// Push notification event for cloud-triggered Athans
self.addEventListener('push', (event) => {
  let data = { title: '🕌 Sacred Call to Prayer', body: 'Time for prayer. Come to prayer, come to success.' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const prayerName = data.prayerName || 'Prayer';
  const prayerTime = data.prayerTime || '';
  const actionUrl = data.actionUrl || (prayerName ? `/?athan=${encodeURIComponent(prayerName)}#adhan` : '/');

  const options = {
    body: data.body,
    icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
    badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
    vibrate: [500, 150, 500, 150, 450, 150, 200, 100, 170, 50, 450, 150, 200, 100, 170, 50],
    tag: `athan-${prayerName}`,
    requireInteraction: true,
    renotify: true,
    data: {
      actionUrl,
      prayerName,
      prayerTime
    },
    actions: [
      { action: 'listen_athan', title: '🔊 Listen Adhan & Du\'a' },
      { action: 'open_qibla', title: '🧭 Qibla Compass' },
      { action: 'mark_prayed', title: '🤲 Claim +50 Hasanat' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Periodic background sync event
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'athan-periodic-check') {
    // Check pending alarms from Cache/IndexedDB if needed
  }
});

// Rich notification click and action engagement handling
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  let targetPath = data.actionUrl || '/';
  const prayerName = data.prayerName || 'Prayer';

  if (action === 'listen_athan') {
    targetPath = `/?athan=${encodeURIComponent(prayerName)}&autoplay=true#adhan`;
  } else if (action === 'open_qibla') {
    targetPath = '/#qibla';
  } else if (action === 'mark_prayed') {
    targetPath = `/?claimed_prayer=${encodeURIComponent(prayerName)}&hasanat=50#prayer_times`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a client window is already open, focus it and post navigation/athan trigger
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          client.postMessage({
            type: 'ATHAN_NOTIFICATION_CLICKED',
            action,
            prayerName,
            targetPath
          });
          return client.focus().then(() => {
            if ('navigate' in client) {
              return client.navigate(targetPath);
            }
          });
        }
      }
      // If closed, open a new window with the deep link
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetPath);
      }
    })
  );
});

