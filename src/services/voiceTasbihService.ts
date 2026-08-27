export interface RecognizedSupplication {
  id: string;
  name: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  count: number;
  isCustom?: boolean;
  keywords?: string[];
}

export const DEFAULT_SUPPLICATIONS: Omit<RecognizedSupplication, 'count'>[] = [
  {
    id: 'subhanallah',
    name: 'SubhanAllah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subḥānallāh',
    meaning: 'Glory be to Allah'
  },
  {
    id: 'alhamdulillah',
    name: 'Alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alḥamdulillāh',
    meaning: 'Praise be to Allah'
  },
  {
    id: 'allahuakbar',
    name: 'Allahu Akbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allāhu Akbar',
    meaning: 'Allah is the Greatest'
  },
  {
    id: 'astaghfirullah',
    name: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullāh',
    meaning: 'I seek the forgiveness of Allah'
  },
  {
    id: 'lailahaillallah',
    name: 'La ilaha illa Allah',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ',
    transliteration: 'Lā ilāha illallāh',
    meaning: 'There is no god but Allah'
  },
  {
    id: 'subhanallahi_wa_bihamdihi',
    name: 'SubhanAllahi wa bihamdihi',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥānallāhi wa bi-ḥamdih',
    meaning: 'Glory be to Allah and all praise is His'
  },
  {
    id: 'subhanallahil_adheem',
    name: 'SubhanAllahil Adheem',
    arabic: 'سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'Subḥānallāhil ‘Aẓīm',
    meaning: 'Glory be to Allah the Almighty'
  },
  {
    id: 'lahawla',
    name: 'La hawla wa la quwwata illa billah',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāh',
    meaning: 'There is no power nor strength except with Allah'
  },
  {
    id: 'salawat',
    name: 'Allahumma Salli Ala Muhammad',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    transliteration: 'Allāhumma ṣalli ‘alā Muḥammad',
    meaning: 'O Allah, send blessings upon Muhammad'
  },
  {
    id: 'hasbunallah',
    name: 'Hasbunallahu wa Ni\'mal Wakeel',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Ḥasbunallāhu wa ni‘mal wakīl',
    meaning: 'Allah is sufficient for us, and He is the best disposer of affairs'
  },
  {
    id: 'yahayyu_yaqayyum',
    name: 'Ya Hayyu Ya Qayyum',
    arabic: 'يَا حَيُّ يَا قَيُّومُ',
    transliteration: 'Yā Ḥayyu Yā Qayyūm',
    meaning: 'O Ever-Living, O Sustainer of all existence'
  },
  {
    id: 'rabbi_ighfirli',
    name: 'Rabbi Ighfir Li',
    arabic: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbi-ghfir lī',
    meaning: 'My Lord, forgive me'
  }
];

export const KNOWN_SUPPLICATIONS = DEFAULT_SUPPLICATIONS;

export interface VoiceTasbihListener {
  onStatusChange?: (isListening: boolean) => void;
  onSupplicationRecognized?: (supplication: Omit<RecognizedSupplication, 'count'>, countToAdd: number, rawTranscript: string) => void;
  onInterimTranscript?: (transcript: string) => void;
  onError?: (err: string) => void;
}

export class VoiceTasbihService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static listeners: Set<VoiceTasbihListener> = new Set();
  private static shouldKeepListening: boolean = false;
  private static restartTimeout: any = null;
  private static audioContext: AudioContext | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  static getCustomSupplications(): Omit<RecognizedSupplication, 'count'>[] {
    try {
      const saved = localStorage.getItem('sanctuary_custom_supplications');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading custom supplications:', e);
    }
    return [];
  }

  static saveCustomSupplication(supp: {
    name: string;
    arabic?: string;
    transliteration?: string;
    meaning?: string;
    keywords?: string[];
  }): Omit<RecognizedSupplication, 'count'> {
    const list = this.getCustomSupplications();
    const id = 'custom_' + Date.now();
    const newSupp: Omit<RecognizedSupplication, 'count'> = {
      id,
      name: supp.name.trim(),
      arabic: supp.arabic?.trim() || supp.name.trim(),
      transliteration: supp.transliteration?.trim() || supp.name.trim(),
      meaning: supp.meaning?.trim() || 'Custom Devotional Supplication',
      isCustom: true,
      keywords: supp.keywords && supp.keywords.length > 0 ? supp.keywords : [supp.name.toLowerCase().trim()]
    };
    list.unshift(newSupp);
    localStorage.setItem('sanctuary_custom_supplications', JSON.stringify(list));
    return newSupp;
  }

  static deleteCustomSupplication(id: string) {
    const list = this.getCustomSupplications().filter(s => s.id !== id);
    localStorage.setItem('sanctuary_custom_supplications', JSON.stringify(list));
  }

  static getAllSupplications(): Omit<RecognizedSupplication, 'count'>[] {
    const custom = this.getCustomSupplications();
    return [...custom, ...DEFAULT_SUPPLICATIONS];
  }

  static playBeadSound(variant: 'amber' | 'wood' | 'crystal' = 'amber') {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = variant === 'crystal' ? 1200 : variant === 'wood' ? 450 : 850;
      osc.type = variant === 'crystal' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio autoplay gracefully handled
    }
  }

  static subscribe(listener: VoiceTasbihListener): () => void {
    this.listeners.add(listener);
    if (listener.onStatusChange) {
      listener.onStatusChange(this.isListening);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyStatus(status: boolean) {
    this.isListening = status;
    this.listeners.forEach(l => l.onStatusChange?.(status));
  }

  private static notifySupplication(supp: Omit<RecognizedSupplication, 'count'>, countToAdd: number, raw: string) {
    this.listeners.forEach(l => l.onSupplicationRecognized?.(supp, countToAdd, raw));
  }

  private static notifyInterim(transcript: string) {
    this.listeners.forEach(l => l.onInterimTranscript?.(transcript));
  }

  private static notifyError(err: string) {
    this.listeners.forEach(l => l.onError?.(err));
  }

  /**
   * Matches spoken words/phrases to known supplications (built-in + custom) and calculates count
   */
  static matchSupplication(text: string): { supplication: Omit<RecognizedSupplication, 'count'>; count: number } | null {
    if (!text) return null;
    const clean = text.toLowerCase().trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ");

    if (!clean) return null;

    // 1. Check custom supplications first
    const customList = this.getCustomSupplications();
    for (const cust of customList) {
      const triggers = [cust.name.toLowerCase(), cust.transliteration.toLowerCase(), ...(cust.keywords || [])];
      let matchCount = 0;
      for (const trig of triggers) {
        if (trig && clean.includes(trig)) {
          const occurrences = clean.split(trig).length - 1;
          if (occurrences > matchCount) matchCount = occurrences;
        }
      }
      if (matchCount > 0) {
        return { supplication: cust, count: Math.max(1, matchCount) };
      }
    }

    // 2. Built-in Multi-occurrence patterns
    const patterns: { id: string; keywords: string[] }[] = [
      {
        id: 'subhanallahi_wa_bihamdihi',
        keywords: ['subhanallahi wa bihamdihi', 'subhan allah wa bihamdihi', 'subhanallahi wa bihamdih', 'سبحان الله وبحمده']
      },
      {
        id: 'subhanallahil_adheem',
        keywords: ['subhanallahil adheem', 'subhan allahil adheem', 'subhan allah al azeem', 'سبحان الله العظيم']
      },
      {
        id: 'lahawla',
        keywords: ['la hawla wa la quwwata illa billah', 'la hawla', 'lahawla', 'لا حول ولا قوة إلا بالله']
      },
      {
        id: 'salawat',
        keywords: ['allahumma salli ala muhammad', 'allahumma salli', 'sallallahu alayhi wa sallam', 'salawat', 'اللهم صل على محمد', 'صلى الله عليه وسلم']
      },
      {
        id: 'hasbunallah',
        keywords: ['hasbunallahu wa nimal wakeel', 'hasbunallah wa nimal wakeel', 'hasbunallah', 'حسبنا الله ونعم الوكيل']
      },
      {
        id: 'yahayyu_yaqayyum',
        keywords: ['ya hayyu ya qayyum', 'ya hayy ya qayyum', 'يا حي يا قيوم']
      },
      {
        id: 'rabbi_ighfirli',
        keywords: ['rabbi ighfirli', 'rabbighfirli', 'rabbi ighfir li', 'رب اغفر لي', 'ربى اغفر لى']
      },
      {
        id: 'lailahaillallah',
        keywords: ['la ilaha illa allah', 'la ilaha illallah', 'lailahaillallah', 'there is no god but allah', 'لا اله الا الله', 'لا إله إلا الله']
      },
      {
        id: 'astaghfirullah',
        keywords: ['astaghfirullah', 'astagfirullah', 'astagferullah', 'i seek forgiveness', 'استغفر الله', 'أستغفر الله']
      },
      {
        id: 'allahuakbar',
        keywords: ['allahu akbar', 'allahuakbar', 'allah is greatest', 'الله أكبر', 'الله اكبر']
      },
      {
        id: 'alhamdulillah',
        keywords: ['alhamdulillah', 'alhamdu lillah', 'alhamdulilah', 'praise be to allah', 'الحمد لله']
      },
      {
        id: 'subhanallah',
        keywords: ['subhanallah', 'subhan allah', 'subhaanallah', 'glory be to allah', 'سبحان الله']
      }
    ];

    for (const pat of patterns) {
      let matchCount = 0;
      for (const kw of pat.keywords) {
        if (clean.includes(kw)) {
          const occurrences = clean.split(kw).length - 1;
          if (occurrences > matchCount) {
            matchCount = occurrences;
          }
        }
      }

      if (matchCount > 0) {
        const found = DEFAULT_SUPPLICATIONS.find(s => s.id === pat.id);
        if (found) {
          return { supplication: found, count: Math.max(1, matchCount) };
        }
      }
    }

    // Default fallback if user spoke any distinct dhikr/prayer phrase
    if (clean.length > 2) {
      return {
        supplication: {
          id: 'spoken_dhikr',
          name: 'Spoken Dhikr',
          arabic: 'ذِكْرٌ وَدُعَاء',
          transliteration: clean.charAt(0).toUpperCase() + clean.slice(1),
          meaning: 'Remembrance & Supplication of Allah'
        },
        count: 1
      };
    }

    return null;
  }

  /**
   * Starts live continuous speech recognition for Tasbih counting.
   * Constant until manually stopped with stop()
   */
  static start() {
    if (!this.isSupported()) {
      this.notifyError('Voice recognition is not supported in this environment.');
      return;
    }

    this.shouldKeepListening = true;
    if (this.isListening) return;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.notifyStatus(true);
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const matched = this.matchSupplication(transcript);
            if (matched) {
              this.notifySupplication(matched.supplication, matched.count, transcript);
            }
          } else {
            interim += transcript;
          }
        }
        if (interim) {
          this.notifyInterim(interim);
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('[VoiceTasbihService] Recognition warning:', e.error);
        }
      };

      this.recognition.onend = () => {
        if (this.shouldKeepListening) {
          // Automatic resilient restart to keep constant counting
          this.restartTimeout = setTimeout(() => {
            if (this.shouldKeepListening) {
              try {
                this.recognition?.start();
              } catch {
                // Re-initialize if previous instance was closed
                this.isListening = false;
                this.start();
              }
            }
          }, 150);
        } else {
          this.notifyStatus(false);
        }
      };

      this.recognition.start();
    } catch (e: any) {
      console.warn('[VoiceTasbihService] Start error:', e);
      if (this.shouldKeepListening) {
        this.restartTimeout = setTimeout(() => {
          if (this.shouldKeepListening) this.start();
        }, 500);
      } else {
        this.notifyStatus(false);
      }
    }
  }

  /**
   * Stops voice Tasbih listening permanently until manually started
   */
  static stop() {
    this.shouldKeepListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.notifyStatus(false);
  }

  /**
   * Toggle Voice Tasbih
   */
  static toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  static getListeningState(): boolean {
    return this.isListening;
  }
}

