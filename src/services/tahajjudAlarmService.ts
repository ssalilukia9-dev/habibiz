// Tahajjud Alarm & Nocturnal Qiyam Audio Service
import { calculateTahajjudTimings, TahajjudTiming } from './islamicScheduleService.ts';
import { notificationService } from './notificationService.ts';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export type TahajjudSoundType = 
  | 'noor_chime' 
  | 'madinah_melody' 
  | 'makkah_dawn' 
  | 'gentle_breeze' 
  | 'golden_adhan' 
  | 'tranquil_ney' 
  | 'desert_dawn' 
  | 'custom';

export interface TahajjudAlarmSettings {
  enabled: boolean;
  offset: 'last_third' | '60_min_before_fajr' | '45_min_before_fajr' | '30_min_before_fajr';
  sound: TahajjudSoundType;
  volume: number; // 0 to 1
  autoDismissMinutes: number;
  customSoundUrl?: string;
  customSoundName?: string;
}

const STORAGE_KEY = 'tahajjud-reminder-settings';

const DEFAULT_SETTINGS: TahajjudAlarmSettings = {
  enabled: true,
  offset: 'last_third',
  sound: 'noor_chime',
  volume: 0.85,
  autoDismissMinutes: 5,
  customSoundUrl: '',
  customSoundName: ''
};

class TahajjudAlarmManager {
  private audioCtx: AudioContext | null = null;
  private customAudioEl: HTMLAudioElement | null = null;
  private isRinging: boolean = false;
  private ringInterval: any = null;
  private listeners: Set<(ringing: boolean, info?: any) => void> = new Set();
  private checkInterval: any = null;
  private lastTriggeredDateStr: string = '';
  private snoozeTimer: any = null;
  private snoozeUntil: Date | null = null;
  private snoozeMinutes: number = 0;

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
   * Generates or plays a sacred, soothing nocturnal wake chime/audio
   */
  public playAlarmChime(tone: TahajjudSoundType = 'noor_chime', volume: number = 0.85, customAudioUrl?: string) {
    try {
      const settings = this.getSettings();
      const activeCustomUrl = customAudioUrl || settings.customSoundUrl;

      // Handle custom audio playback via HTML5 Audio
      if (tone === 'custom' && activeCustomUrl) {
        if (this.customAudioEl) {
          this.customAudioEl.pause();
          this.customAudioEl.currentTime = 0;
        }
        this.customAudioEl = new Audio(activeCustomUrl);
        this.customAudioEl.volume = Math.max(0, Math.min(1, volume));
        this.customAudioEl.play().catch(err => {
          console.warn("Custom audio playback error, falling back to synthesizer:", err);
          this.playSynthesizedTone('noor_chime', volume);
        });
        return;
      }

      this.playSynthesizedTone(tone, volume);
    } catch (e) {
      console.warn("Tahajjud alarm chime playback error:", e);
    }
  }

  private playSynthesizedTone(tone: TahajjudSoundType, volume: number) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new AudioContextClass();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    // Harmonic tonal sequences for various sacred spiritual profiles
    let notes: { freq: number; type?: OscillatorType; duration?: number; delay?: number }[] = [];

    switch (tone) {
      case 'madinah_melody':
        // Hijaz Maqam meditative progression: D4, Eb4, F#4, G4, A4, D5
        notes = [
          { freq: 293.66, delay: 0.0 },
          { freq: 311.13, delay: 0.4 },
          { freq: 369.99, delay: 0.8 },
          { freq: 392.00, delay: 1.2 },
          { freq: 440.00, delay: 1.6 },
          { freq: 587.33, delay: 2.1 }
        ];
        break;

      case 'makkah_dawn':
        // Deep resonant subh harmonics (Bayati / Kurd D3-A4)
        notes = [
          { freq: 146.83, delay: 0.0, duration: 3.2 }, // Low D3 drone
          { freq: 220.00, delay: 0.3 },
          { freq: 293.66, delay: 0.7 },
          { freq: 349.23, delay: 1.1 },
          { freq: 440.00, delay: 1.6 },
          { freq: 523.25, delay: 2.1 }
        ];
        break;

      case 'gentle_breeze':
        // Soft C Major pentatonic high octave
        notes = [
          { freq: 523.25, delay: 0.0 },
          { freq: 587.33, delay: 0.35 },
          { freq: 659.25, delay: 0.7 },
          { freq: 783.99, delay: 1.05 },
          { freq: 1046.50, delay: 1.4 }
        ];
        break;

      case 'golden_adhan':
        // Resonant Adhan harmonic intervals
        notes = [
          { freq: 220.00, delay: 0.0, duration: 2.5 },
          { freq: 329.63, delay: 0.5 },
          { freq: 440.00, delay: 1.0 },
          { freq: 493.88, delay: 1.5 },
          { freq: 659.25, delay: 2.0 }
        ];
        break;

      case 'tranquil_ney':
        // Sufi Ney Acoustic Flute simulation with soft sine/triangle harmonics
        notes = [
          { freq: 349.23, delay: 0.0, type: 'triangle' },
          { freq: 440.00, delay: 0.45, type: 'triangle' },
          { freq: 523.25, delay: 0.9, type: 'sine' },
          { freq: 698.46, delay: 1.4, type: 'sine' }
        ];
        break;

      case 'desert_dawn':
        // Dawn chirp harmonic pulses
        notes = [
          { freq: 880.00, delay: 0.0 },
          { freq: 1174.66, delay: 0.25 },
          { freq: 1318.51, delay: 0.5 },
          { freq: 1760.00, delay: 0.75 },
          { freq: 880.00, delay: 1.1 }
        ];
        break;

      case 'noor_chime':
      default:
        // Sacred Pentatonic E Major: E4, G#4, B4, E5, F#5, G#5
        notes = [
          { freq: 329.63, delay: 0.0 },
          { freq: 415.30, delay: 0.4 },
          { freq: 493.88, delay: 0.8 },
          { freq: 659.25, delay: 1.2 },
          { freq: 739.99, delay: 1.6 },
          { freq: 830.61, delay: 2.0 }
        ];
        break;
    }

    notes.forEach((item) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = item.type || 'sine';
      const startTime = now + (item.delay || 0);
      const noteDuration = item.duration || 2.4;

      osc.frequency.setValueAtTime(item.freq, startTime);

      // Soft bell envelope with harmonic warm fade
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.35 * volume, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.1);
    });
  }

  /**
   * Stop any current preview or playing chime
   */
  public stopPreview() {
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.currentTime = 0;
    }
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        this.audioCtx.suspend();
      } catch {}
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
   * Defer wake-up alarm by 5 or 10 minutes (Snooze)
   */
  public snooze(minutes: 5 | 10 = 10) {
    this.stopAlarm();
    if (this.snoozeTimer) {
      clearTimeout(this.snoozeTimer);
    }
    
    this.snoozeMinutes = minutes;
    const targetMs = Date.now() + minutes * 60 * 1000;
    this.snoozeUntil = new Date(targetMs);

    this.snoozeTimer = setTimeout(() => {
      this.snoozeUntil = null;
      this.snoozeMinutes = 0;
      this.snoozeTimer = null;
      this.triggerAlarm({
        timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        label: `Snoozed ${minutes}m Expired`,
        message: 'Tahajjud wake alert reminder'
      });
    }, minutes * 60 * 1000);

    // Broadcast snooze event
    window.dispatchEvent(new CustomEvent('tahajjud_snoozed', { 
      detail: { minutes, snoozeUntil: this.snoozeUntil } 
    }));
  }

  /**
   * Cancel any active snooze
   */
  public cancelSnooze() {
    if (this.snoozeTimer) {
      clearTimeout(this.snoozeTimer);
      this.snoozeTimer = null;
    }
    this.snoozeUntil = null;
    this.snoozeMinutes = 0;
    window.dispatchEvent(new CustomEvent('tahajjud_snooze_cancelled'));
  }

  /**
   * Get active snooze status
   */
  public getSnoozeInfo(): { isSnoozed: boolean; snoozeUntil: Date | null; minutes: number } {
    return {
      isSnoozed: !!(this.snoozeUntil && this.snoozeUntil.getTime() > Date.now()),
      snoozeUntil: this.snoozeUntil,
      minutes: this.snoozeMinutes
    };
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
