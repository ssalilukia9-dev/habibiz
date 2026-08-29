// Dedicated Audio Engine for Sacred Supplications (Dua) Library
// Supports Voice Reciters & Immersive Ambient Soundscapes (Rain, Madinah Breeze, River, Tahajjud Wind, 432Hz Drone)

export interface DuaReciter {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  style: string;
  voiceLang: string;
  rate: number;
  pitch: number;
  sampleAudio?: string;
}

export interface DuaAmbientSound {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  icon: string;
  type: 'synth' | 'audio';
  audioUrl?: string;
}

export const DUA_RECITERS: DuaReciter[] = [
  {
    id: 'alafasy',
    name: 'Sheikh Mishary Rashid Alafasy',
    arabicName: 'الشيخ مشاري راشد العفاسي',
    description: 'World-renowned Kuwaiti Qari known for soul-stirring, melodious and clear intonation',
    style: 'Melodious & Rhythmic Murattal',
    voiceLang: 'ar-SA',
    rate: 0.9,
    pitch: 1.0,
    sampleAudio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3'
  },
  {
    id: 'sudais',
    name: 'Sheikh Abdul Rahman Al-Sudais',
    arabicName: 'الشيخ عبد الرحمن السديس',
    description: 'Chief Imam of Masjid al-Haram in Makkah, fervent and reverent Khushoo recitation',
    style: 'Fervent & Reverent Haramain Khushoo',
    voiceLang: 'ar-SA',
    rate: 0.95,
    pitch: 1.05,
    sampleAudio: 'https://cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais/1.mp3'
  },
  {
    id: 'muaiqly',
    name: 'Sheikh Maher Al-Muaiqly',
    arabicName: 'الشيخ ماهر المعيقلي',
    description: 'Imam of Masjid al-Haram, emotionally captivating and warm spiritual cadence',
    style: 'Deep & Emotional Contemplation',
    voiceLang: 'ar-SA',
    rate: 0.88,
    pitch: 0.95,
    sampleAudio: 'https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/1.mp3'
  },
  {
    id: 'ghamdi',
    name: 'Sheikh Saad Al-Ghamdi',
    arabicName: 'الشيخ سعد الغامدي',
    description: 'Gentle, tranquil, and steady cadence ideal for daily memorization and reflective duas',
    style: 'Tranquil & Steady Pace',
    voiceLang: 'ar-SA',
    rate: 0.92,
    pitch: 1.0,
    sampleAudio: 'https://cdn.islamic.network/quran/audio/128/ar.saoodshuraym/1.mp3'
  },
  {
    id: 'ai_sanctuary',
    name: 'Sanctuary Natural Studio Voice',
    arabicName: 'صوت المحراب النقي',
    description: 'High-clarity studio narration engine with pristine Arabic phonetics and balanced pacing',
    style: 'Crystal Clear Modern Studio Vocal',
    voiceLang: 'ar-SA',
    rate: 0.88,
    pitch: 1.0
  }
];

export const DUA_AMBIENT_SOUNDS: DuaAmbientSound[] = [
  {
    id: 'none',
    name: 'Pure Recitation (No Background)',
    arabicName: 'تلاوة نقية بدون خلفية',
    description: 'Silent backdrop focusing purely on the spoken supplication and sacred words',
    icon: 'VolumeX',
    type: 'synth'
  },
  {
    id: 'makkah_rain',
    name: 'Gentle Rain on Kaaba Marble',
    arabicName: 'مطر صحن المطاف الهادئ',
    description: 'Soothing natural rain and distant thunder over the sacred courtyard of Makkah',
    icon: 'CloudRain',
    type: 'synth',
    audioUrl: 'https://cdn.freesound.org/previews/531/531947_11861866-lq.mp3'
  },
  {
    id: 'madinah_breeze',
    name: 'Dawn Courtyard of Al-Masjid An-Nabawi',
    arabicName: 'نسيم روضة المسجد النبوي',
    description: 'Subtle morning breeze and peaceful courtyard birds of Madinah Al-Munawwarah',
    icon: 'Wind',
    type: 'synth',
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3'
  },
  {
    id: 'peaceful_stream',
    name: 'Peaceful Flowing Spring (Salsabil)',
    arabicName: 'خرير عين سلسبيل العذبة',
    description: 'Gentle babbling mountain stream evoking the peaceful springs of Jannah',
    icon: 'Waves',
    type: 'synth'
  },
  {
    id: 'tahajjud_night',
    name: 'Nocturnal Tahajjud Silence & Night Breeze',
    arabicName: 'سكينة ليل التهجد والوتر',
    description: 'Deep midnight atmospheric stillness for fervent last-third-of-night supplications',
    icon: 'Moon',
    type: 'synth'
  },
  {
    id: 'binaural_432hz',
    name: '432Hz Sacred Calming Drone',
    arabicName: 'تردد السكينة والخشوع',
    description: 'Deep harmonic resonance calibrated to reduce mental anxiety and foster Khushoo',
    icon: 'Sparkles',
    type: 'synth'
  }
];

export interface DuaAudioPreferences {
  reciterId: string;
  ambientSoundId: string;
  ambientVolume: number; // 0 to 1
  isAmbientEnabled: boolean;
}

export class DuaAudioService {
  private static audioCtx: AudioContext | null = null;
  private static synthGain: GainNode | null = null;
  private static synthOscillators: (OscillatorNode | AudioNode)[] = [];
  private static audioElement: HTMLAudioElement | null = null;
  private static isPlayingAmbient: boolean = false;
  private static currentAmbientId: string = 'none';

  static getPreferences(): DuaAudioPreferences {
    try {
      const reciterId = localStorage.getItem('sanctuary_dua_reciter') || 'alafasy';
      const ambientSoundId = localStorage.getItem('sanctuary_dua_ambient_sound') || 'makkah_rain';
      const volumeStr = localStorage.getItem('sanctuary_dua_ambient_vol');
      const ambientVolume = volumeStr !== null ? parseFloat(volumeStr) : 0.45;
      const isAmbientEnabled = localStorage.getItem('sanctuary_dua_ambient_enabled') !== 'false';

      return {
        reciterId,
        ambientSoundId,
        ambientVolume: isNaN(ambientVolume) ? 0.45 : Math.max(0, Math.min(1, ambientVolume)),
        isAmbientEnabled
      };
    } catch {
      return {
        reciterId: 'alafasy',
        ambientSoundId: 'makkah_rain',
        ambientVolume: 0.45,
        isAmbientEnabled: true
      };
    }
  }

  static setReciter(reciterId: string) {
    localStorage.setItem('sanctuary_dua_reciter', reciterId);
    window.dispatchEvent(new CustomEvent('sanctuary_dua_audio_changed', {
      detail: { reciterId }
    }));
  }

  static setAmbientSound(ambientSoundId: string) {
    localStorage.setItem('sanctuary_dua_ambient_sound', ambientSoundId);
    this.currentAmbientId = ambientSoundId;
    if (this.isPlayingAmbient) {
      this.playAmbient(ambientSoundId);
    }
    window.dispatchEvent(new CustomEvent('sanctuary_dua_audio_changed', {
      detail: { ambientSoundId }
    }));
  }

  static setAmbientVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    localStorage.setItem('sanctuary_dua_ambient_vol', clamped.toString());
    if (this.synthGain && this.audioCtx) {
      try {
        this.synthGain.gain.setTargetAtTime(clamped * 0.35, this.audioCtx.currentTime, 0.1);
      } catch {}
    }
    if (this.audioElement) {
      this.audioElement.volume = clamped;
    }
    window.dispatchEvent(new CustomEvent('sanctuary_dua_audio_changed', {
      detail: { ambientVolume: clamped }
    }));
  }

  static setAmbientEnabled(enabled: boolean) {
    localStorage.setItem('sanctuary_dua_ambient_enabled', enabled ? 'true' : 'false');
    if (!enabled) {
      this.stopAmbient();
    }
    window.dispatchEvent(new CustomEvent('sanctuary_dua_audio_changed', {
      detail: { isAmbientEnabled: enabled }
    }));
  }

  static getActiveReciter(): DuaReciter {
    const prefs = this.getPreferences();
    return DUA_RECITERS.find(r => r.id === prefs.reciterId) || DUA_RECITERS[0];
  }

  static getActiveAmbientSound(): DuaAmbientSound {
    const prefs = this.getPreferences();
    return DUA_AMBIENT_SOUNDS.find(s => s.id === prefs.ambientSoundId) || DUA_AMBIENT_SOUNDS[0];
  }

  // Synthesize ambient soundscape via Web Audio API
  static playAmbient(soundId?: string, overrideVolume?: number) {
    const prefs = this.getPreferences();
    if (!prefs.isAmbientEnabled && soundId === undefined) return;

    const targetId = soundId || prefs.ambientSoundId;
    const targetVol = overrideVolume !== undefined ? overrideVolume : prefs.ambientVolume;

    if (targetId === 'none') {
      this.stopAmbient();
      return;
    }

    this.stopAmbient();

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.setValueAtTime(targetVol * 0.35, this.audioCtx.currentTime);
      this.synthGain.connect(this.audioCtx.destination);

      this.isPlayingAmbient = true;
      this.currentAmbientId = targetId;

      if (targetId === 'binaural_432hz') {
        // Create 432Hz warm meditative drone
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const oscLow = this.audioCtx.createOscillator();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, this.audioCtx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(436, this.audioCtx.currentTime); // 4Hz theta wave beat

        oscLow.type = 'triangle';
        oscLow.frequency.setValueAtTime(108, this.audioCtx.currentTime); // Deep 108Hz sub base

        const lowGain = this.audioCtx.createGain();
        lowGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        oscLow.connect(lowGain);
        lowGain.connect(this.synthGain);

        osc1.connect(this.synthGain);
        osc2.connect(this.synthGain);

        osc1.start();
        osc2.start();
        oscLow.start();

        this.synthOscillators = [osc1, osc2, oscLow, lowGain];
      } else if (targetId === 'makkah_rain' || targetId === 'madinah_breeze' || targetId === 'peaceful_stream' || targetId === 'tahajjud_night') {
        // High quality pink/brown noise synthetic generator with gentle resonant filter
        const bufferSize = this.audioCtx.sampleRate * 2;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.audioCtx.createBiquadFilter();
        if (targetId === 'makkah_rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1100, this.audioCtx.currentTime);
          filter.Q.setValueAtTime(1.2, this.audioCtx.currentTime);
        } else if (targetId === 'madinah_breeze') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(550, this.audioCtx.currentTime);
          filter.Q.setValueAtTime(2.5, this.audioCtx.currentTime);
        } else if (targetId === 'peaceful_stream') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1600, this.audioCtx.currentTime);
          filter.Q.setValueAtTime(0.8, this.audioCtx.currentTime);
        } else {
          // tahajjud_night
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, this.audioCtx.currentTime);
          filter.Q.setValueAtTime(0.5, this.audioCtx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(this.synthGain);
        whiteNoise.start();

        this.synthOscillators = [whiteNoise, filter];
      }
    } catch (e) {
      console.warn('[DuaAudioService] Synth ambient playback notice:', e);
    }
  }

  static stopAmbient() {
    this.isPlayingAmbient = false;
    if (this.synthOscillators.length > 0) {
      this.synthOscillators.forEach(node => {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          if ('disconnect' in node && typeof (node as any).disconnect === 'function') {
            (node as any).disconnect();
          }
        } catch {}
      });
      this.synthOscillators = [];
    }

    if (this.synthGain && this.audioCtx) {
      try {
        this.synthGain.disconnect();
      } catch {}
      this.synthGain = null;
    }

    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.src = '';
      } catch {}
      this.audioElement = null;
    }
  }

  static isAmbientPlaying(): boolean {
    return this.isPlayingAmbient;
  }
}
