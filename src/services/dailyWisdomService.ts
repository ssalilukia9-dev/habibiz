import { getDailyQuoteForDate, DAILY_ISLAMIC_QUOTES, DailyQuoteItem } from '../data/dailyQuotesData.ts';
import { HADITH_DATABASE, HadithEntry, getDailyHadith } from '../data/hadiths.ts';
import { getDailyAyahForDate, DAILY_ISLAMIC_AYAHS, DailyAyahItem } from '../data/dailyAyahsData.ts';
import { notificationService } from './notificationService.ts';

export type WisdomMode = 'ayah' | 'hadith' | 'quote';

export interface DailyWisdomSummary {
  mode: WisdomMode;
  badge: string;
  arabic?: string;
  mainText: string;
  source: string;
  author: string;
  reflection: string;
  accentColor: string;
  audioText: string;
}

class DailyWisdomManager {
  private static STORAGE_PREF_PREFIX = 'sanctuary_daily_notif_';

  getAyahOfDay(date: Date = new Date()): DailyAyahItem {
    return getDailyAyahForDate(date);
  }

  getHadithOfDay(date: Date = new Date()): HadithEntry {
    return getDailyHadith(date);
  }

  getQuoteOfDay(date: Date = new Date()): DailyQuoteItem {
    return getDailyQuoteForDate(date);
  }

  getDailyRotatingWisdomMode(date: Date = new Date()): WisdomMode {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const modes: WisdomMode[] = ['ayah', 'hadith', 'quote'];
    return modes[Math.abs(dayOfYear) % 3];
  }

  getWisdomSummary(mode: WisdomMode, date: Date = new Date()): DailyWisdomSummary {
    if (mode === 'ayah') {
      const ayah = this.getAyahOfDay(date);
      return {
        mode: 'ayah',
        badge: `Ayah of the Day • Surah ${ayah.surahEnglishName} (${ayah.surahNumber}:${ayah.ayahNumber})`,
        arabic: ayah.arabic,
        mainText: ayah.translation,
        source: `Surah ${ayah.surahEnglishName} [${ayah.surahNumber}:${ayah.ayahNumber}]`,
        author: 'The Noble Qur\'an',
        reflection: ayah.shortReflection,
        accentColor: ayah.accentColor || '#10b981',
        audioText: `${ayah.arabic}. ${ayah.translation}`
      };
    } else if (mode === 'hadith') {
      const hadith = this.getHadithOfDay(date);
      return {
        mode: 'hadith',
        badge: `Hadith of the Day • ${hadith.topic}`,
        arabic: hadith.arabic,
        mainText: hadith.english,
        source: hadith.collection,
        author: `Prophet Muhammad ﷺ (Narrated by ${hadith.narrator})`,
        reflection: `Topic: ${hadith.topic}. Reflect and act upon this prophetic guidance today.`,
        accentColor: '#f59e0b',
        audioText: `${hadith.arabic}. ${hadith.english}. Narrated by ${hadith.narrator}.`
      };
    } else {
      const quote = this.getQuoteOfDay(date);
      return {
        mode: 'quote',
        badge: `Quote of the Day • ${quote.theme}`,
        arabic: quote.arabic,
        mainText: quote.quote,
        source: quote.source,
        author: quote.author,
        reflection: quote.reflection,
        accentColor: quote.accentColor || '#3b82f6',
        audioText: `${quote.arabic ? quote.arabic + '. ' : ''}${quote.quote}. Said by ${quote.author}.`
      };
    }
  }

  // Push Notification Preferences
  isNotificationEnabled(mode: WisdomMode): boolean {
    if (typeof localStorage === 'undefined') return true;
    const val = localStorage.getItem(`${DailyWisdomManager.STORAGE_PREF_PREFIX}${mode}`);
    return val === null ? true : val === 'true';
  }

  setNotificationEnabled(mode: WisdomMode, enabled: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${DailyWisdomManager.STORAGE_PREF_PREFIX}${mode}`, enabled ? 'true' : 'false');
    }
  }

  async requestPermissionAndEnable(mode: WisdomMode): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        this.setNotificationEnabled(mode, true);
        this.sendTestNotification(mode);
        return true;
      } else {
        this.setNotificationEnabled(mode, false);
        return false;
      }
    }
    this.setNotificationEnabled(mode, true);
    return true;
  }

  sendTestNotification(mode: WisdomMode) {
    const summary = this.getWisdomSummary(mode);
    const title = `Aloha Sanctuary: ${summary.badge.split('•')[0].trim()}`;
    const body = `"${summary.mainText}" — ${summary.source}`;

    // 1. In-App Notification Center & Push Notification
    notificationService.notify(title, body, 'hadith', '/home');

    // 2. Browser Web Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Native notification trigger:', e);
      }
    }
  }
}

export const dailyWisdomService = new DailyWisdomManager();
