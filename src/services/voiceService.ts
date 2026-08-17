import { getAudioStreamUrl } from '../lib/api';

export type VoiceLanguage = 'ar' | 'en';

export interface VoicePlaybackState {
  isPlaying: boolean;
  activeId: string | number | null;
  mode: 'arabic' | 'english' | 'both' | null;
  rate: number;
}

type StateListener = (state: VoicePlaybackState) => void;

export class VoiceService {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audio: HTMLAudioElement | null = null;
  private static activeId: string | number | null = null;
  private static currentMode: 'arabic' | 'english' | 'both' | null = null;
  private static playbackRate: number = 1.0;
  private static onEndCallback: (() => void) | null = null;
  private static listeners: Set<StateListener> = new Set();

  static subscribe(listener: StateListener): () => void {
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
    return {
      isPlaying: Boolean(this.audio || (this.synth && this.synth.speaking)),
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
   * Speak English translation or reflection
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
      // Gentle pause between Arabic recitation and English translation
      setTimeout(() => {
        if (this.activeId === id) {
          this.speakEnglish(englishText, id, () => {
            this.stop();
            if (onEnd) onEnd();
          });
        }
      }, 450);
    });
  }

  /**
   * Core speech playback method
   */
  static speak(
    text: string, 
    lang: VoiceLanguage = 'ar', 
    id?: string | number, 
    onEnd?: () => void,
    mode: 'arabic' | 'english' | 'both' = lang === 'ar' ? 'arabic' : 'english'
  ) {
    this.stop();
    this.activeId = id || null;
    this.currentMode = mode;
    this.onEndCallback = onEnd || null;
    this.notifyListeners();

    const cleanText = text.replace(/[\r\n]+/g, ' ').trim();
    if (!cleanText) {
      this.stop();
      if (onEnd) onEnd();
      return;
    }

    try {
      // Encode for high quality streaming TTS
      const truncated = cleanText.slice(0, 300);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(truncated)}&tl=${lang}&client=tw-ob`;
      const streamUrl = getAudioStreamUrl(ttsUrl);

      const audioObj = new Audio(streamUrl);
      audioObj.preload = 'auto';
      audioObj.playbackRate = this.playbackRate;
      this.audio = audioObj;

      const playPromise = audioObj.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.notifyListeners();
            audioObj.onended = () => {
              this.handlePlaybackComplete();
            };
          })
          .catch(err => {
            if (err.name === 'AbortError' || err.message?.includes('interrupted')) {
              return;
            }
            console.warn("TTS stream play restricted, falling back to local speech synthesis:", err);
            this.speakWithSynthesis(cleanText, lang);
          });
      }
    } catch (e) {
      console.warn("Failed to play TTS stream, falling back to synthesis:", e);
      this.speakWithSynthesis(cleanText, lang);
    }
  }

  private static speakWithSynthesis(text: string, lang: VoiceLanguage = 'ar') {
    if (!this.synth) {
      this.handlePlaybackComplete();
      return;
    }
    
    try {
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = lang === 'ar' ? Math.max(0.8, this.playbackRate * 0.85) : this.playbackRate;
      utterance.pitch = lang === 'ar' ? 0.95 : 1.0;
      
      const voices = this.synth.getVoices();
      if (lang === 'ar') {
        const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('AR'));
        if (arVoice) utterance.voice = arVoice;
      } else {
        const enVoice = voices.find(v => (v.lang.startsWith('en') || v.lang.includes('EN')) && !v.name.includes('Google'));
        if (enVoice) utterance.voice = enVoice;
      }
      
      utterance.onend = () => {
        this.handlePlaybackComplete();
      };
      
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn("Speech synthesis notice:", e.error);
        }
        this.handlePlaybackComplete();
      };
      
      this.synth.speak(utterance);
      this.notifyListeners();
    } catch (e) {
      console.warn("Speech synthesis execution error:", e);
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
        console.warn("Error in onEnd callback:", e);
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
        this.audio.src = "";
      } catch (e) {}
      this.audio = null;
    }
    this.activeId = null;
    this.currentMode = null;
    this.notifyListeners();
  }
}
