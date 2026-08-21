import { getApiBaseUrl } from '../lib/api';

export type VoiceLanguage = 'ar' | 'en';

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  activeId: string | number | null;
  mode: 'arabic' | 'english' | 'both' | null;
  rate: number;
  // Continuous Playlist support
  isContinuous: boolean;
  currentIndex: number;
  totalItems: number;
  currentTitle?: string;
}

export interface ContinuousPlayItem {
  id: string | number;
  arabic: string;
  english?: string;
  transliteration?: string;
  title?: string;
  audioUrl?: string;
  repetitionCount?: number;
}

export interface ContinuousPlayOptions {
  mode: 'arabic' | 'english' | 'both';
  intervalMs?: number;
  loop?: boolean;
  onItemChange?: (index: number, item: ContinuousPlayItem) => void;
  onFinished?: () => void;
}

type StateListener = (state: VoicePlaybackState) => void;

export class VoiceService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audio: HTMLAudioElement | null = null;
  private static activeId: string | number | null = null;
  private static currentMode: 'arabic' | 'english' | 'both' | null = null;
  private static playbackRate: number = 1.0;
  private static isPausedState: boolean = false;
  private static onEndCallback: (() => void) | null = null;
  private static listeners: Set<StateListener> = new Set();
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static audioUnlocked: boolean = false;
  private static isInitialized: boolean = false;
  private static sessionCounter: number = 0;
  private static activeSessionId: number = 0;
  private static pauseTimeout: any = null;

  // Continuous Queue state
  private static isContinuousActive: boolean = false;
  private static continuousQueue: ContinuousPlayItem[] = [];
  private static continuousIndex: number = 0;
  private static continuousOptions: ContinuousPlayOptions | null = null;
  private static continuousDelayTimeout: any = null;

  static init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Pre-populate SpeechSynthesis voices
    if (this.synth) {
      const loadVoices = () => {
        try {
          this.cachedVoices = this.synth?.getVoices() || [];
        } catch {
          // ignore
        }
      };

      loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = loadVoices;
      }
    }

    // Unlock audio context on first user interaction for Mobile Browsers, WebViews, Netlify & PWA
    const unlockAudio = () => {
      if (this.audioUnlocked) return;
      this.audioUnlocked = true;

      try {
        const dummyAudio = new Audio();
        dummyAudio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        dummyAudio.volume = 0.01;
        dummyAudio.play().catch(() => {});
      } catch {
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
    const isSynthSpeaking = Boolean(this.synth && this.synth.speaking && !this.synth.paused);

    return {
      isPlaying: isAudioPlaying || isSynthSpeaking,
      isPaused: this.isPausedState,
      activeId: this.activeId,
      mode: this.currentMode,
      rate: this.playbackRate,
      isContinuous: this.isContinuousActive,
      currentIndex: this.continuousIndex,
      totalItems: this.continuousQueue.length,
      currentTitle: this.continuousQueue[this.continuousIndex]?.title || 
                    this.continuousQueue[this.continuousIndex]?.transliteration || 
                    undefined
    };
  }

  static setRate(rate: number) {
    this.playbackRate = Math.max(0.75, Math.min(1.75, rate));
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
   * Helper to clean text for TTS
   */
  private static cleanText(text: string): string {
    return text
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\(\)\[\]\{\}\<\>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Play high-clarity Arabic recitation text or dedicated studio audio recording
   */
  static speakArabic(text: string, id?: string | number, onEnd?: () => void, customAudioUrl?: string) {
    this.speak(text, 'ar', id, onEnd, 'arabic', customAudioUrl);
  }

  /**
   * Speak English translation or explanation
   */
  static speakEnglish(text: string, id?: string | number, onEnd?: () => void) {
    this.speak(text, 'en', id, onEnd, 'english');
  }

  /**
   * Seamless combo: Recites Arabic first (or authentic audio), followed by English explanation
   */
  static speakBoth(arabicText: string, englishText: string, id?: string | number, onEnd?: () => void, customAudioUrl?: string) {
    this.init();
    this.stopAudioInternal();
    const sessionId = ++this.sessionCounter;
    this.activeSessionId = sessionId;

    this.activeId = id || null;
    this.currentMode = 'both';
    this.isPausedState = false;
    this.onEndCallback = onEnd || null;
    this.notifyListeners();

    this.speakInternal(arabicText, 'ar', id, () => {
      if (this.activeSessionId !== sessionId || this.isPausedState) return;

      this.pauseTimeout = setTimeout(() => {
        if (this.activeSessionId !== sessionId || this.isPausedState) return;

        this.speakInternal(englishText, 'en', id, () => {
          if (this.activeSessionId !== sessionId) return;
          this.handlePlaybackComplete();
        }, 'both', sessionId);
      }, 400);
    }, 'both', sessionId, customAudioUrl);
  }

  /**
   * Core multi-engine audio playback method
   */
  static speak(
    text: string, 
    lang: VoiceLanguage = 'ar', 
    id?: string | number, 
    onEnd?: () => void,
    mode: 'arabic' | 'english' | 'both' = lang === 'ar' ? 'arabic' : 'english',
    customAudioUrl?: string
  ) {
    this.init();
    this.stopAudioInternal();
    const sessionId = ++this.sessionCounter;
    this.activeSessionId = sessionId;

    this.activeId = id || null;
    this.currentMode = mode;
    this.isPausedState = false;
    this.onEndCallback = onEnd || null;
    this.notifyListeners();

    this.speakInternal(text, lang, id, onEnd, mode, sessionId, customAudioUrl);
  }

  private static speakInternal(
    text: string,
    lang: VoiceLanguage,
    id: string | number | undefined,
    onEnd: (() => void) | undefined,
    mode: 'arabic' | 'english' | 'both',
    sessionId: number,
    customAudioUrl?: string
  ) {
    if (this.activeSessionId !== sessionId) return;

    // If a direct high-quality studio audio URL is provided, play it directly with fallback to TTS
    if (customAudioUrl) {
      const streamUrls = [
        customAudioUrl,
        `${getApiBaseUrl()}/api/proxy/audio?url=${encodeURIComponent(customAudioUrl)}`
      ];
      this.tryAudioStreams(streamUrls, 0, text, lang, sessionId, () => {
        if (this.activeSessionId !== sessionId) return;
        if (onEnd) onEnd();
        else this.handlePlaybackComplete();
      });
      return;
    }

    const cleaned = this.cleanText(text);
    if (!cleaned) {
      if (this.activeSessionId === sessionId) {
        if (onEnd) onEnd();
        else this.handlePlaybackComplete();
      }
      return;
    }

    const chunks = this.splitIntoPhrases(cleaned, 180);
    this.playAudioChunks(chunks, lang, 0, sessionId, onEnd);
  }

  /**
   * Split long text into manageable sentences/phrases for smooth audio streaming
   */
  private static splitIntoPhrases(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];
    
    const parts = text.split(/(?<=[.،؛:!\?\n])/);
    const result: string[] = [];
    let current = '';

    for (const part of parts) {
      if ((current + ' ' + part).trim().length <= maxLen) {
        current = (current + ' ' + part).trim();
      } else {
        if (current) result.push(current);
        if (part.length > maxLen) {
          const words = part.split(' ');
          let wordChunk = '';
          for (const w of words) {
            if ((wordChunk + ' ' + w).trim().length <= maxLen) {
              wordChunk = (wordChunk + ' ' + w).trim();
            } else {
              if (wordChunk) result.push(wordChunk);
              wordChunk = w;
            }
          }
          if (wordChunk) current = wordChunk;
          else current = '';
        } else {
          current = part.trim();
        }
      }
    }
    if (current) result.push(current);
    return result.length > 0 ? result : [text.slice(0, maxLen)];
  }

  /**
   * Play sequential audio chunks with single-execution fallback
   */
  private static playAudioChunks(
    chunks: string[], 
    lang: VoiceLanguage, 
    chunkIndex: number, 
    sessionId: number,
    onFinish?: () => void
  ) {
    if (this.activeSessionId !== sessionId) return;

    if (chunkIndex >= chunks.length) {
      if (onFinish) {
        onFinish();
      } else {
        this.handlePlaybackComplete();
      }
      return;
    }

    const chunkText = chunks[chunkIndex];
    const encoded = encodeURIComponent(chunkText);
    
    // Priority order: First use the backend proxy /api/tts to avoid browser CORS issues, then fallback
    const streamUrls = [
      `${getApiBaseUrl()}/api/tts?text=${encoded}&lang=${lang}`,
      `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang === 'ar' ? 'ar' : 'en'}&client=tw-ob&q=${encoded}`
    ];

    this.tryAudioStreams(streamUrls, 0, chunkText, lang, sessionId, () => {
      if (this.activeSessionId !== sessionId) return;
      this.playAudioChunks(chunks, lang, chunkIndex + 1, sessionId, onFinish);
    });
  }

  /**
   * Try stream URLs in strict sequence, preventing duplicate / echoing concurrent audio runs
   */
  private static tryAudioStreams(
    urls: string[], 
    urlIndex: number, 
    chunkText: string, 
    lang: VoiceLanguage, 
    sessionId: number,
    onChunkDone: () => void
  ) {
    if (this.activeSessionId !== sessionId) return;

    if (urlIndex >= urls.length) {
      // Fallback to native SpeechSynthesis strictly once
      this.speakWithSynthesis(chunkText, lang, sessionId, onChunkDone);
      return;
    }

    const currentUrl = urls[urlIndex];
    let advanced = false;

    const nextAttempt = () => {
      if (advanced || this.activeSessionId !== sessionId) return;
      advanced = true;
      if (this.audio) {
        this.audio.onended = null;
        this.audio.onerror = null;
        this.audio = null;
      }
      this.tryAudioStreams(urls, urlIndex + 1, chunkText, lang, sessionId, onChunkDone);
    };

    try {
      if (this.audio) {
        this.audio.pause();
        this.audio.onended = null;
        this.audio.onerror = null;
        this.audio.src = '';
        this.audio = null;
      }

      const audioObj = new Audio();
      audioObj.preload = 'auto';
      audioObj.src = currentUrl;
      audioObj.playbackRate = this.playbackRate;
      this.audio = audioObj;

      audioObj.onended = () => {
        if (advanced || this.activeSessionId !== sessionId) return;
        advanced = true;
        if (this.audio === audioObj) {
          this.audio = null;
        }
        onChunkDone();
      };

      audioObj.onerror = () => {
        nextAttempt();
      };

      const playPromise = audioObj.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (this.activeSessionId === sessionId) {
              this.notifyListeners();
            }
          })
          .catch(() => {
            nextAttempt();
          });
      }
    } catch {
      nextAttempt();
    }
  }

  /**
   * Fallback Engine: Local Web Speech Synthesis with rich voice discovery
   */
  private static speakWithSynthesis(
    text: string, 
    lang: VoiceLanguage, 
    sessionId: number, 
    onChunkDone: () => void
  ) {
    if (this.activeSessionId !== sessionId || !this.synth) {
      onChunkDone();
      return;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = lang === 'ar' ? Math.max(0.75, this.playbackRate * 0.88) : this.playbackRate;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

      // Pick best matching voice
      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();
      if (voices.length > 0) {
        if (lang === 'ar') {
          const arVoice = voices.find(v => 
            v.lang.startsWith('ar') || 
            v.lang.includes('AR') || 
            v.name.toLowerCase().includes('arabic') ||
            v.name.toLowerCase().includes('maged') ||
            v.name.toLowerCase().includes('tarik') ||
            v.name.toLowerCase().includes('laila') ||
            v.name.toLowerCase().includes('naayf')
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
        if (this.activeSessionId === sessionId) {
          onChunkDone();
        }
      };

      utterance.onend = onDone;
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn("[VoiceService] SpeechSynthesis notice:", e.error);
        }
        onDone();
      };

      this.synth.speak(utterance);
      this.notifyListeners();
    } catch {
      onChunkDone();
    }
  }

  // ==========================================
  // CONTINUOUS PLAYLIST & APP-WIDE AUDIO QUEUE
  // ==========================================

  /**
   * Start continuous playback through a playlist (e.g. 99 Names of Allah, Adhkar Categories, Hadiths)
   */
  static startContinuousPlay(
    items: ContinuousPlayItem[],
    options: ContinuousPlayOptions,
    startIndex: number = 0
  ) {
    this.stop();
    if (!items || items.length === 0) return;

    this.isContinuousActive = true;
    this.continuousQueue = items;
    this.continuousIndex = Math.max(0, Math.min(items.length - 1, startIndex));
    this.continuousOptions = options;
    this.isPausedState = false;

    this.playContinuousItemAt(this.continuousIndex);
  }

  /**
   * Play specific index in continuous playlist
   */
  private static playContinuousItemAt(index: number) {
    if (!this.isContinuousActive || index >= this.continuousQueue.length) {
      if (this.continuousOptions?.loop && this.continuousQueue.length > 0) {
        this.playContinuousItemAt(0);
        return;
      }
      this.stopContinuousQueue();
      if (this.continuousOptions?.onFinished) {
        this.continuousOptions.onFinished();
      }
      return;
    }

    this.continuousIndex = index;
    const item = this.continuousQueue[index];
    const mode = this.continuousOptions?.mode || 'arabic';
    const interval = this.continuousOptions?.intervalMs ?? 700;

    if (this.continuousOptions?.onItemChange) {
      this.continuousOptions.onItemChange(index, item);
    }

    this.notifyListeners();

    const onFinishCurrent = () => {
      if (!this.isContinuousActive || this.isPausedState) return;

      this.continuousDelayTimeout = setTimeout(() => {
        if (this.isContinuousActive && !this.isPausedState) {
          this.playContinuousItemAt(index + 1);
        }
      }, interval);
    };

    if (mode === 'arabic') {
      this.speakArabic(item.arabic, `cont-${item.id}`, onFinishCurrent, item.audioUrl);
    } else if (mode === 'english') {
      const enText = item.english || item.transliteration || '';
      this.speakEnglish(enText, `cont-${item.id}`, onFinishCurrent);
    } else {
      // Both: Arabic recitation followed by English meaning
      const enText = `${item.transliteration ? item.transliteration + '. ' : ''}${item.english || ''}`;
      this.speakBoth(item.arabic, enText, `cont-${item.id}`, onFinishCurrent, item.audioUrl);
    }
  }

  /**
   * Skip to next item in continuous playlist
   */
  static nextInContinuous() {
    if (!this.isContinuousActive || this.continuousQueue.length === 0) return;
    if (this.continuousDelayTimeout) clearTimeout(this.continuousDelayTimeout);
    const nextIdx = (this.continuousIndex + 1) % this.continuousQueue.length;
    this.playContinuousItemAt(nextIdx);
  }

  /**
   * Skip to previous item in continuous playlist
   */
  static prevInContinuous() {
    if (!this.isContinuousActive || this.continuousQueue.length === 0) return;
    if (this.continuousDelayTimeout) clearTimeout(this.continuousDelayTimeout);
    const prevIdx = this.continuousIndex > 0 ? this.continuousIndex - 1 : this.continuousQueue.length - 1;
    this.playContinuousItemAt(prevIdx);
  }

  /**
   * Toggle Pause / Resume
   */
  static togglePauseContinuous() {
    if (!this.isContinuousActive) return;

    if (this.isPausedState) {
      this.isPausedState = false;
      this.playContinuousItemAt(this.continuousIndex);
    } else {
      this.isPausedState = true;
      if (this.continuousDelayTimeout) clearTimeout(this.continuousDelayTimeout);
      this.stopAudioInternal();
      this.notifyListeners();
    }
  }

  static stopContinuousQueue() {
    this.isContinuousActive = false;
    this.continuousQueue = [];
    this.continuousIndex = 0;
    this.continuousOptions = null;
    if (this.continuousDelayTimeout) clearTimeout(this.continuousDelayTimeout);
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

  private static stopAudioInternal() {
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
      this.pauseTimeout = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    if (this.audio) {
      try {
        this.audio.onended = null;
        this.audio.onerror = null;
        this.audio.pause();
        this.audio.src = '';
        this.audio.load();
      } catch {}
      this.audio = null;
    }
  }

  static stop() {
    this.activeSessionId = ++this.sessionCounter;
    if (this.continuousDelayTimeout) {
      clearTimeout(this.continuousDelayTimeout);
      this.continuousDelayTimeout = null;
    }
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
      this.pauseTimeout = null;
    }
    this.isContinuousActive = false;
    this.isPausedState = false;
    this.stopAudioInternal();
    this.activeId = null;
    this.currentMode = null;
    this.notifyListeners();
  }
}
