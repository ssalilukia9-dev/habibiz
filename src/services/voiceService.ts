import { getApiBaseUrl } from '../lib/api';

export type VoiceLanguage = 'ar' | 'en';

export interface VoicePlaybackState {
  isPlaying: boolean;
  activeId: string | number | null;
  mode: 'arabic' | 'english' | 'both' | null;
  rate: number;
}

type StateListener = (state: VoicePlaybackState) => void;

export class VoiceService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audio: HTMLAudioElement | null = null;
  private static activeId: string | number | null = null;
  private static currentMode: 'arabic' | 'english' | 'both' | null = null;
  private static playbackRate: number = 1.0;
  private static onEndCallback: (() => void) | null = null;
  private static listeners: Set<StateListener> = new Set();
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static audioUnlocked: boolean = false;
  private static isInitialized: boolean = false;

  static init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Pre-populate SpeechSynthesis voices
    if (this.synth) {
      const loadVoices = () => {
        try {
          this.cachedVoices = this.synth?.getVoices() || [];
        } catch (e) {
          // ignore
        }
      };

      loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = loadVoices;
      }
    }

    // Unlock audio context on first user interaction for Mobile Browsers & WebViews
    const unlockAudio = () => {
      if (this.audioUnlocked) return;
      this.audioUnlocked = true;

      try {
        const dummyAudio = new Audio();
        dummyAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        dummyAudio.volume = 0.01;
        dummyAudio.play().catch(() => {});
      } catch (e) {
        // ignore
      }

      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

  static subscribe(listener: StateListener): () => void {
    this.init();
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (e) {
        console.warn("Error in VoiceService listener", e);
      }
    });
  }

  static getState(): VoicePlaybackState {
    const isAudioPlaying = Boolean(this.audio && !this.audio.paused && !this.audio.ended);
    const isSynthSpeaking = Boolean(this.synth && this.synth.speaking);

    return {
      isPlaying: isAudioPlaying || isSynthSpeaking,
      activeId: this.activeId,
      mode: this.currentMode,
      rate: this.playbackRate
    };
  }

  static setRate(rate: number) {
    this.playbackRate = Math.max(0.75, Math.min(1.5, rate));
    if (this.audio) {
      this.audio.playbackRate = this.playbackRate;
    }
    this.notifyListeners();
  }

  static getRate(): number {
    return this.playbackRate;
  }

  static isPlaying(id?: string | number): boolean {
    if (id !== undefined) {
      return this.activeId === id && this.getState().isPlaying;
    }
    return this.getState().isPlaying;
  }

  /**
   * Play high-clarity Arabic recitation text
   */
  static speakArabic(text: string, id?: string | number, onEnd?: () => void) {
    this.speak(text, 'ar', id, onEnd, 'arabic');
  }

  /**
   * Speak English translation or explanation
   */
  static speakEnglish(text: string, id?: string | number, onEnd?: () => void) {
    this.speak(text, 'en', id, onEnd, 'english');
  }

  /**
   * Seamless combo: Recites Arabic first, followed by English explanation
   */
  static speakBoth(arabicText: string, englishText: string, id?: string | number, onEnd?: () => void) {
    this.stop();
    this.activeId = id || null;
    this.currentMode = 'both';
    this.notifyListeners();

    this.speakArabic(arabicText, id, () => {
      // Short pause between Arabic recitation and English translation
      setTimeout(() => {
        if (this.activeId === id) {
          this.speakEnglish(englishText, id, () => {
            this.stop();
            if (onEnd) onEnd();
          });
        }
      }, 500);
    });
  }

  /**
   * Core speech playback method with Dual-Engine Fallback (Server Audio Stream -> Browser Speech Synthesis)
   */
  static speak(
    text: string, 
    lang: VoiceLanguage = 'ar', 
    id?: string | number, 
    onEnd?: () => void,
    mode: 'arabic' | 'english' | 'both' = lang === 'ar' ? 'arabic' : 'english'
  ) {
    this.init();
    this.stop();

    this.activeId = id || null;
    this.currentMode = mode;
    this.onEndCallback = onEnd || null;
    this.notifyListeners();

    const cleanText = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) {
      this.handlePlaybackComplete();
      return;
    }

    // Try Engine 1: Server TTS Audio Stream
    const baseUrl = getApiBaseUrl();
    const encodedText = encodeURIComponent(cleanText.slice(0, 300));
    const ttsStreamUrl = `${baseUrl}/api/tts?text=${encodedText}&lang=${lang}`;

    try {
      const audioObj = new Audio();
      audioObj.preload = 'auto';
      audioObj.src = ttsStreamUrl;
      audioObj.playbackRate = this.playbackRate;
      this.audio = audioObj;

      let hasHandledEnd = false;
      const safeEnd = () => {
        if (hasHandledEnd) return;
        hasHandledEnd = true;
        this.handlePlaybackComplete();
      };

      audioObj.onended = () => {
        safeEnd();
      };

      audioObj.onerror = (e) => {
        console.warn("[VoiceService] Server TTS Stream failed, falling back to Native Speech Synthesis:", e);
        if (this.audio === audioObj) {
          this.audio = null;
        }
        this.speakWithSynthesis(cleanText, lang);
      };

      const playPromise = audioObj.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.notifyListeners();
          })
          .catch((err) => {
            if (err.name === 'AbortError') return;
            console.warn("[VoiceService] HTML5 Audio play prevented or restricted, falling back to Native Speech Synthesis:", err);
            if (this.audio === audioObj) {
              this.audio = null;
            }
            this.speakWithSynthesis(cleanText, lang);
          });
      }
    } catch (e) {
      console.warn("[VoiceService] Audio instantiation failed, using Native Speech Synthesis:", e);
      this.speakWithSynthesis(cleanText, lang);
    }
  }

  /**
   * Engine 2: Local Web Speech Synthesis fallback
   */
  private static speakWithSynthesis(text: string, lang: VoiceLanguage = 'ar') {
    if (!this.synth) {
      this.handlePlaybackComplete();
      return;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = lang === 'ar' ? Math.max(0.75, this.playbackRate * 0.85) : this.playbackRate;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

      // Pick the best available matching voice
      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();
      if (voices.length > 0) {
        if (lang === 'ar') {
          const arVoice = voices.find(v => 
            v.lang.startsWith('ar') || 
            v.lang.includes('AR') || 
            v.name.toLowerCase().includes('arabic') ||
            v.name.toLowerCase().includes('maged') ||
            v.name.toLowerCase().includes('tarik') ||
            v.name.toLowerCase().includes('laila')
          );
          if (arVoice) utterance.voice = arVoice;
        } else {
          const enVoice = voices.find(v => 
            (v.lang.startsWith('en') || v.lang.includes('EN')) && 
            !v.name.toLowerCase().includes('compact')
          );
          if (enVoice) utterance.voice = enVoice;
        }
      }

      let ended = false;
      const onDone = () => {
        if (ended) return;
        ended = true;
        this.handlePlaybackComplete();
      };

      utterance.onend = onDone;
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn("[VoiceService] SpeechSynthesis notice:", e.error);
        }
        onDone();
      };

      // Workaround for Chrome/Android SpeechSynthesis garbage collection stall
      const resumeWatchdog = setInterval(() => {
        if (!this.synth?.speaking) {
          clearInterval(resumeWatchdog);
        } else {
          this.synth.resume();
        }
      }, 3000);

      this.synth.speak(utterance);
      this.notifyListeners();
    } catch (e) {
      console.warn("[VoiceService] SpeechSynthesis execution error:", e);
      this.handlePlaybackComplete();
    }
  }

  private static handlePlaybackComplete() {
    const callback = this.onEndCallback;
    this.activeId = null;
    this.currentMode = null;
    this.audio = null;
    this.onEndCallback = null;
    this.notifyListeners();

    if (callback) {
      try {
        callback();
      } catch (e) {
        console.warn("[VoiceService] Error in onEnd callback:", e);
      }
    }
  }

  static stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.src = '';
      } catch (e) {}
      this.audio = null;
    }
    this.activeId = null;
    this.currentMode = null;
    this.notifyListeners();
  }
}
