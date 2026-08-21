// Tahajjud Alarm & Nocturnal Qiyam Audio Service
import { calculateTahajjudTimings, TahajjudTiming } from './islamicScheduleService.ts';
import { notificationService } from './notificationService.ts';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface TahajjudAlarmSettings {
  enabled: boolean;
  offset: 'last_third' | '60_min_before_fajr' | '45_min_before_fajr' | '30_min_before_fajr';
  sound: 'noor_chime' | 'madinah_melody' | 'gentle_breeze' | 'adhan_subh';
  volume: number; // 0 to 1
  autoDismissMinutes: number;
}

const STORAGE_KEY = 'tahajjud-reminder-settings';

const DEFAULT_SETTINGS: TahajjudAlarmSettings = {
  enabled: true,
  offset: 'last_third',
  sound: 'noor_chime',
  volume: 0.85,
  autoDismissMinutes: 5
};

class TahajjudAlarmManager {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private ringInterval: any = null;
  private listeners: Set<(ringing: boolean, info?: any) => void> = new Set();
  private checkInterval: any = null;
  private lastTriggeredDateStr: string = '';

  constructor() {
    this.startBackgroundMonitor();
  }

  public getSettings(): TahajjudAlarmSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  }

  public saveSettings(settings: Partial<TahajjudAlarmSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  public subscribe(cb: (ringing: boolean, info?: any) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners(ringing: boolean, info?: any) {
    this.listeners.forEach(cb => cb(ringing, info));
  }

  /**
   * Generates a sacred, soothing nocturnal wake chime using Web Audio API
   */
  public playAlarmChime(tone: string = 'noor_chime', volume: number = 0.8) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Sacred Pentatonic Chord progression (E Major / Hijaz inspired): E4, G#4, B4, E5, F#5, G#5
      const notes = tone === 'gentle_breeze'
        ? [261.63, 329.63, 392.00, 523.25, 659.25] // C Major
        : tone === 'madinah_melody'
        ? [293.66, 311.13, 369.99, 440.00, 587.33] // Hijaz D
        : [329.63, 415.30, 493.88, 659.25, 739.99, 830.61]; // Noor E Major

      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.45);

        // Soft bell envelope with harmonic warm fade
        const noteStart = now + idx * 0.45;
        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.35 * volume, noteStart + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.4);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 2.5);
      });
    } catch (e) {
      console.warn("Web Audio alarm chime playback error:", e);
    }
  }

  /**
   * Start ringing the continuous Tahajjud wake alarm
   */
  public triggerAlarm(info?: any) {
    if (this.isRinging) return;
    this.isRinging = true;

    const settings = this.getSettings();
    
    // Play initial chime
    this.playAlarmChime(settings.sound, settings.volume);

    // Repeat chime every 3.5 seconds
    if (this.ringInterval) clearInterval(this.ringInterval);
    this.ringInterval = setInterval(() => {
      if (!this.isRinging) {
        clearInterval(this.ringInterval);
        return;
      }
      this.playAlarmChime(settings.sound, settings.volume);
    }, 3500);

    // Auto-dismiss after set minutes
    setTimeout(() => {
      this.stopAlarm();
    }, (settings.autoDismissMinutes || 5) * 60 * 1000);

    this.notifyListeners(true, info);
  }

  /**
   * Stop / Dismiss the ringing alarm
   */
  public stopAlarm() {
    this.isRinging = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        this.audioCtx.suspend();
      } catch {}
    }
    this.notifyListeners(false);
  }

  /**
   * Calculate precise alarm trigger date for next Tahajjud
   */
  public getNextAlarmTarget(maghribTimeStr?: string, fajrTimeStr?: string): { targetDate: Date; displayTime: string; label: string } {
    const settings = this.getSettings();
    const tahajjudInfo = calculateTahajjudTimings(maghribTimeStr || '18:40', fajrTimeStr || '05:15');

    const now = new Date();
    const [fH, fM] = (fajrTimeStr || '05:15').split(':').map(Number);
    const fajrDate = new Date(now);
    fajrDate.setHours(fH, fM, 0, 0);
    if (fajrDate <= now) {
      fajrDate.setDate(fajrDate.getDate() + 1);
    }

    let targetDate = new Date(tahajjudInfo.startTime);
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    let label = 'Last 1/3 of Night';
    if (settings.offset === '60_min_before_fajr') {
      targetDate = new Date(fajrDate.getTime() - 60 * 60 * 1000);
      label = '60 mins before Fajr';
    } else if (settings.offset === '45_min_before_fajr') {
      targetDate = new Date(fajrDate.getTime() - 45 * 60 * 1000);
      label = '45 mins before Fajr';
    } else if (settings.offset === '30_min_before_fajr') {
      targetDate = new Date(fajrDate.getTime() - 30 * 60 * 1000);
      label = '30 mins before Fajr';
    }

    const displayTime = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return { targetDate, displayTime, label };
  }

  /**
   * Background time monitor checking every 20 seconds
   */
  private startBackgroundMonitor() {
    if (typeof window === 'undefined') return;

    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      const settings = this.getSettings();
      if (!settings.enabled || this.isRinging) return;

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}:${now.getMinutes()}`;

      // Prevent triggering multiple times in the same minute
      if (this.lastTriggeredDateStr === todayStr) return;

      // Check if current hour & minute match alarm target
      const { targetDate, displayTime, label } = this.getNextAlarmTarget();
      const diffMs = Math.abs(now.getTime() - targetDate.getTime());

      // If within 45 seconds of target alarm time
      if (diffMs <= 45 * 1000) {
        this.lastTriggeredDateStr = todayStr;
        this.triggerAlarm({
          timeStr: displayTime,
          label,
          message: "The Lord descends to the lowest heaven in the last third of the night. Stand in Qiyam Al-Layl."
        });

        // Trigger system notification
        notificationService.notify(
          `🌌 Tahajjud Alarm • ${displayTime}`,
          "The blessed hours of Qiyam Al-Layl are here. Answer the call to private devotion.",
          'tahajjud',
          '/resources?tab=adhkar'
        );
      }
    }, 20000);
  }
}

export const TahajjudAlarmService = new TahajjudAlarmManager();
