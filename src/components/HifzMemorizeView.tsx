import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Award,
  Flame,
  Search,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  VolumeX,
  Layers,
  Sparkle,
  Radio,
  Bookmark,
  Share2,
  Lightbulb,
  Check,
  CheckCheck,
  ChevronDown,
  Wand2,
  Compass,
  FileAudio,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Hash,
  ExternalLink,
  Target,
  XCircle,
  AlertCircle,
  Volume1,
  ListOrdered,
  ArrowRight
} from 'lucide-react';
import { SURAH_LIST, RECITERS } from '../constants.ts';
import { FULL_JUZ_LIST } from '../data/juzData.ts';
import { getAudioStreamUrl } from '../lib/api.ts';

export interface AyahWord {
  id: string;
  arabic: string;
  normalized: string;
  status: 'unrecited' | 'correct' | 'mistake' | 'active';
  transcription?: string;
  tajweedTip?: string;
}

export interface LoadedAyah {
  number: number;           // Global Ayah number (1 - 6236)
  numberInSurah: number;    // Ayah number in surah (1 - N)
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  arabicText: string;
  translation: string;
  audioUrl?: string;
  words: AyahWord[];
}

export interface MistakeDetail {
  id: string;
  ayahNumberInSurah: number;
  globalAyahNumber: number;
  expectedWord: string;
  spokenWord: string;
  expectedAyahText: string;
  advice: string;
  timestamp: Date;
  isOutOfOrder?: boolean;
}

export interface AyahEvaluationState {
  status: 'pending' | 'flawless' | 'corrected' | 'mistake';
  mistakesCount: number;
  mistakes: MistakeDetail[];
  timeSpentSeconds: number;
}

interface VoiceSearchResult {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumberInSurah: number;
  globalAyahNumber: number;
  arabicText: string;
  translation: string;
  matchScore: number;
  matchedPhrase: string;
}

interface HifzMemorizeViewProps {
  onBack: () => void;
  addHasanat: (amount: number) => void;
  isPremium?: boolean;
  onShowPremium?: () => void;
}

// Arabic diacritics stripping & normalization for robust speech matching
const normalizeArabic = (text: string): string => {
  return text
    // Remove diacritics (harakat / tashkeel / tanween)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    // Normalize alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize ya and alif maqsura
    .replace(/[ىي]/g, 'ي')
    // Normalize ta marbuta
    .replace(/ة/g, 'ه')
    // Remove Quranic punctuation and symbols
    .replace(/[\u0600-\u0605\u06DD\u06DE\u06E9\u06D4\u060C\u061B\u061F\.,:;\(\)\[\]\{\}«»"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Calculate Levenshtein similarity (0 to 1)
const calculateSimilarity = (s1: string, s2: string): number => {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return Math.max(0, 1 - distance / maxLen);
};

// Tajweed Rule Analysis Helper
const getTajweedAdvice = (expected: string, spoken: string): string => {
  const normExp = normalizeArabic(expected);
  const normSpk = normalizeArabic(spoken);

  if (/[حخعغهء]/.test(normExp) && !/[حخعغهء]/.test(normSpk)) {
    return 'Makhraj Throat Letter (Halaqi): Articulate throat sounds (ح, ع, خ, غ, ه, ء) clearly from their vocal cavity.';
  }
  if (/[صضطظق]/.test(normExp)) {
    return 'Tafkheem (Heavy Letters): Elevate the back of the tongue for heavy letters (ص, ض, ط, ظ, ق).';
  }
  if (/[قطبجد]/.test(normExp)) {
    return 'Qalqalah Bounce: Echo the sound slightly when stopping on letters of Qutb Jad (ق, ط, ب, ج, د).';
  }
  if (/[نثم]/.test(normExp)) {
    return 'Ghunnah / Nasalization: Maintain 2-beat nasal resonance for Noon and Meem letters.';
  }
  return 'Ensure proper vowel lengthening (Madd) and clear letter articulation in exact sequence.';
};

export default function HifzMemorizeView({
  onBack,
  addHasanat,
  isPremium = true,
  onShowPremium
}: HifzMemorizeViewProps) {
  // App Mode: 'memorize' (Hifz follow-along) | 'voice_search' (Quran Shazam) | 'test' (Blind Memorization Test)
  const [appMode, setAppMode] = useState<'memorize' | 'voice_search' | 'test'>('memorize');

  // Scope & Surah Selection
  const [scopeType, setScopeType] = useState<'surah' | 'page' | 'juz'>('surah');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1); // Default Al-Fatihah
  const [selectedPageNumber, setSelectedPageNumber] = useState<number>(1);
  const [selectedJuzNumber, setSelectedJuzNumber] = useState<number>(30);
  const [selectedReciterId, setSelectedReciterId] = useState<number>(7); // Default Mishary Rashid Alafasy

  // Hifz Visual Mask Mode: 'blur' (Words blurred until recited) | 'visible' (Full text) | 'hints' (First letter only)
  const [hifzMaskMode, setHifzMaskMode] = useState<'blur' | 'visible' | 'hints'>('blur');

  // Strict Quran Order Enforcement Toggle
  const [strictOrderMode, setStrictOrderMode] = useState<boolean>(true);

  // Loaded Quran State
  const [ayahs, setAyahs] = useState<LoadedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Step-by-Step Active Recitation Progression
  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Step-by-Step Ayah Evaluation Status Map (Index -> AyahEvaluationState)
  const [ayahEvaluations, setAyahEvaluations] = useState<Record<number, AyahEvaluationState>>({});

  // Speech Recognition & Live Processing
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [liveMistakeAlert, setLiveMistakeAlert] = useState<{
    type: 'out_of_order' | 'wrong_word' | 'tajweed';
    message: string;
    details?: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Voice Search / Shazam State
  const [isSearchingVoice, setIsSearchingVoice] = useState(false);
  const [searchResults, setSearchResults] = useState<VoiceSearchResult[]>([]);
  const [searchSpokenQuery, setSearchSpokenQuery] = useState('');

  // Audio Reference (Qari recitation & Auto-Recite Rest)
  const [isPlayingQari, setIsPlayingQari] = useState(false);
  const [activePlayingAyahIndex, setActivePlayingAyahIndex] = useState<number | null>(null);
  const [isAutoRecitingRest, setIsAutoRecitingRest] = useState(false);
  const isAutoRecitingRestRef = useRef(false);
  const autoReciteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wordProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Session Statistics & End-of-Surah Correction Masterclass
  const [ayahsRecitedCount, setAyahsRecitedCount] = useState(0);
  const [allMistakesLog, setAllMistakesLog] = useState<MistakeDetail[]>([]);
  const [showCorrectionMasterclass, setShowCorrectionMasterclass] = useState(false);
  const [drillMistakesOnlyMode, setDrillMistakesOnlyMode] = useState(false);

  // Active Ayah shortcut
  const activeAyah = ayahs[activeAyahIndex] || null;

  // Selected Surah Metadata
  const currentSurahMeta = useMemo(() => {
    return SURAH_LIST.find(s => s.number === selectedSurahNumber) || SURAH_LIST[0];
  }, [selectedSurahNumber]);

  // Selected Reciter Metadata
  const currentReciterMeta = useMemo(() => {
    return RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
  }, [selectedReciterId]);

  // Fetch Quran verses for the selected scope
  useEffect(() => {
    let isCancelled = false;
    const fetchQuranScope = async () => {
      setIsLoading(true);
      setLoadError(null);
      stopAudio();
      stopSpeechRecognition();
      setActiveAyahIndex(0);
      setCurrentWordIndex(0);
      setAyahEvaluations({});
      setAllMistakesLog([]);
      setShowCorrectionMasterclass(false);
      setLiveMistakeAlert(null);

      const reciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

      try {
        let endpoint = '';
        let transEndpoint = '';

        if (scopeType === 'surah') {
          endpoint = `/api/proxy/alquran/surah/${selectedSurahNumber}/quran-uthmani`;
          transEndpoint = `/api/proxy/alquran/surah/${selectedSurahNumber}/en.sahih`;
        } else if (scopeType === 'page') {
          endpoint = `/api/proxy/alquran/page/${selectedPageNumber}/quran-uthmani`;
          transEndpoint = `/api/proxy/alquran/page/${selectedPageNumber}/en.sahih`;
        } else {
          endpoint = `/api/proxy/alquran/juz/${selectedJuzNumber}/quran-uthmani`;
          transEndpoint = `/api/proxy/alquran/juz/${selectedJuzNumber}/en.sahih`;
        }

        const [resAr, resTrans] = await Promise.all([
          fetch(endpoint),
          fetch(transEndpoint).catch(() => null)
        ]);

        if (!resAr.ok) throw new Error(`Quran fetch error ${resAr.status}`);
        const dataAr = await resAr.json();
        const dataTrans = resTrans && resTrans.ok ? await resTrans.json() : null;

        if (isCancelled) return;

        if (dataAr?.data?.ayahs) {
          const transMap: Record<number, string> = {};
          if (dataTrans?.data?.ayahs) {
            dataTrans.data.ayahs.forEach((a: any) => {
              transMap[a.number] = a.text;
            });
          }

          const parsed: LoadedAyah[] = dataAr.data.ayahs.map((a: any) => {
            const rawWords = a.text.split(/\s+/).filter(Boolean);
            const wordObjs: AyahWord[] = rawWords.map((w: string, wIdx: number) => ({
              id: `${a.number}_${wIdx}`,
              arabic: w,
              normalized: normalizeArabic(w),
              status: 'unrecited'
            }));

            const surahMeta = SURAH_LIST.find(s => s.number === (a.surah?.number || selectedSurahNumber)) || SURAH_LIST[0];

            return {
              number: a.number,
              numberInSurah: a.numberInSurah,
              surahNumber: surahMeta.number,
              surahName: surahMeta.name,
              surahEnglishName: surahMeta.englishName,
              arabicText: a.text,
              translation: transMap[a.number] || '',
              audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciter.slug}/${a.number}.mp3`,
              words: wordObjs
            };
          });

          setAyahs(parsed);

          // Initialize evaluations map
          const initialEval: Record<number, AyahEvaluationState> = {};
          parsed.forEach((_, idx) => {
            initialEval[idx] = {
              status: 'pending',
              mistakesCount: 0,
              mistakes: [],
              timeSpentSeconds: 0
            };
          });
          setAyahEvaluations(initialEval);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to load verses", err);
          setLoadError("Unable to connect to Quran data stream. Please check network.");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchQuranScope();
    return () => {
      isCancelled = true;
    };
  }, [scopeType, selectedSurahNumber, selectedPageNumber, selectedJuzNumber, selectedReciterId]);

  // Audio Playback
  const stopAudio = () => {
    if (wordProgressTimerRef.current) {
      clearInterval(wordProgressTimerRef.current);
      wordProgressTimerRef.current = null;
    }
    if (autoReciteTimerRef.current) {
      clearTimeout(autoReciteTimerRef.current);
      autoReciteTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlayingQari(false);
    setActivePlayingAyahIndex(null);
  };

  const stopAutoReciteRest = () => {
    setIsAutoRecitingRest(false);
    isAutoRecitingRestRef.current = false;
    stopAudio();
  };

  const playQariAyah = (targetIndex: number, continueFlow = false) => {
    const targetAyah = ayahs[targetIndex];
    if (!targetAyah || !targetAyah.audioUrl) {
      if (continueFlow && targetIndex < ayahs.length - 1) {
        setActiveAyahIndex(targetIndex + 1);
        setCurrentWordIndex(0);
        setTimeout(() => playQariAyah(targetIndex + 1, true), 350);
      }
      return;
    }

    if (isPlayingQari && activePlayingAyahIndex === targetIndex && !continueFlow) {
      stopAudio();
      return;
    }

    stopAudio();

    const audio = new Audio(getAudioStreamUrl(targetAyah.audioUrl));
    audioRef.current = audio;
    setIsPlayingQari(true);
    setActivePlayingAyahIndex(targetIndex);

    // Progressive Word-by-Word visual synchronization during audio playback
    const wordsCount = targetAyah.words?.length || 1;
    setCurrentWordIndex(0);
    targetAyah.words.forEach(w => { w.status = 'unrecited'; });

    audio.onloadedmetadata = () => {
      const dur = audio.duration || 4;
      const intervalMs = Math.max(180, Math.floor((dur * 1000) / wordsCount));
      let currentWord = 0;
      
      if (wordProgressTimerRef.current) clearInterval(wordProgressTimerRef.current);
      wordProgressTimerRef.current = setInterval(() => {
        if (currentWord < wordsCount) {
          if (targetAyah.words[currentWord]) {
            targetAyah.words[currentWord].status = 'correct';
          }
          currentWord++;
          setCurrentWordIndex(currentWord);
        } else {
          if (wordProgressTimerRef.current) {
            clearInterval(wordProgressTimerRef.current);
            wordProgressTimerRef.current = null;
          }
        }
      }, intervalMs);
    };

    audio.onended = () => {
      setIsPlayingQari(false);
      setActivePlayingAyahIndex(null);
      if (wordProgressTimerRef.current) {
        clearInterval(wordProgressTimerRef.current);
        wordProgressTimerRef.current = null;
      }
      
      // Mark all words in targetAyah as correct
      targetAyah.words.forEach(w => { w.status = 'correct'; });
      setCurrentWordIndex(wordsCount);

      // Trigger Ayah Completed and continue to rest if auto-flow is active
      if (continueFlow || isAutoRecitingRestRef.current) {
        handleAyahCompleted(true);
      }
    };

    audio.onerror = () => {
      setIsPlayingQari(false);
      setActivePlayingAyahIndex(null);
      if (continueFlow || isAutoRecitingRestRef.current) {
        setTimeout(() => handleAyahCompleted(true), 800);
      }
    };

    audio.play().catch(() => {
      setIsPlayingQari(false);
      setActivePlayingAyahIndex(null);
      if (continueFlow || isAutoRecitingRestRef.current) {
        setTimeout(() => handleAyahCompleted(true), 800);
      }
    });
  };

  const playQariActiveAyah = () => {
    playQariAyah(activeAyahIndex, false);
  };

  // Start continuous Tarteel auto-recitation for all remaining ayahs
  const startAutoReciteRest = () => {
    setIsAutoRecitingRest(true);
    isAutoRecitingRestRef.current = true;
    // Stop live mic if active
    if (isListening) {
      stopSpeechRecognition();
    }
    playQariAyah(activeAyahIndex, true);
  };

  // Audio Level Meter (Visualizer)
  const startAudioMeter = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(checkVolume);
        };
        checkVolume();
      }
    } catch (e) {
      // Audio level meter optional
    }
  };

  const stopAudioMeter = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Speech Recognition for Hifz Follower
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert("Quran Voice Recognition is supported on Chrome, Safari, and modern browsers. You can also use manual tap-to-verify.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        startAudioMeter();
        setLiveMistakeAlert(null);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += res + ' ';
          } else {
            interimChunk += res;
          }
        }

        const totalSpoken = (finalChunk + interimChunk).trim();
        setInterimText(totalSpoken);

        if (totalSpoken) {
          setSpokenTranscript(totalSpoken);
          processRecitedSpeech(totalSpoken);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Tarteel Speech Recognition Error:", e);
        if (e.error === 'not-allowed') {
          setIsListening(false);
          stopAudioMeter();
          alert("Microphone permission required for live recitation tracking.");
        }
      };

      recognition.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            stopAudioMeter();
          }
        } else {
          setIsListening(false);
          stopAudioMeter();
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start Speech Recognition:", err);
      setIsListening(false);
      stopAudioMeter();
    }
  };

  const stopSpeechRecognition = () => {
    setIsListening(false);
    stopAudioMeter();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  // Real-time Step-by-Step Word-by-Word & Order Matching Engine
  const processRecitedSpeech = (spokenText: string) => {
    if (!activeAyah) return;

    const normalizedSpokenTokens = spokenText.split(/\s+/).map(normalizeArabic).filter(Boolean);
    if (normalizedSpokenTokens.length === 0) return;

    // 1. OUT-OF-ORDER AYAH DETECTION (Check if the user jumped to a different Ayah in the Surah)
    if (strictOrderMode && normalizedSpokenTokens.length >= 2) {
      const joinedSpoken = normalizedSpokenTokens.join(' ');
      
      // Check other ayahs in this Surah
      for (let i = 0; i < ayahs.length; i++) {
        if (i !== activeAyahIndex) {
          const otherAyah = ayahs[i];
          const otherAyahNorm = normalizeArabic(otherAyah.arabicText);
          
          if (otherAyahNorm.includes(joinedSpoken) || calculateSimilarity(otherAyahNorm, joinedSpoken) > 0.65) {
            // OUT OF ORDER RECITATION DETECTED!
            const isAhead = i > activeAyahIndex;
            const diff = Math.abs(i - activeAyahIndex);

            const alertMsg = isAhead 
              ? `⚠️ Out of Order: You recited from Ayah ${otherAyah.numberInSurah} instead of current Ayah ${activeAyah.numberInSurah}. Follow the Quran step-by-step!`
              : `⚠️ Verse Sequence Alert: You recited from a previous Ayah (${otherAyah.numberInSurah}). Current is Ayah ${activeAyah.numberInSurah}.`;

            setLiveMistakeAlert({
              type: 'out_of_order',
              message: alertMsg,
              details: `Expected Ayah ${activeAyah.numberInSurah}: "${activeAyah.arabicText.slice(0, 30)}..."`
            });

            // Flag current active word as mistake
            if (activeAyah.words[currentWordIndex]) {
              activeAyah.words[currentWordIndex].status = 'mistake';
            }

            // Record mistake into log
            const mistakeItem: MistakeDetail = {
              id: `${activeAyah.number}_order_${Date.now()}`,
              ayahNumberInSurah: activeAyah.numberInSurah,
              globalAyahNumber: activeAyah.number,
              expectedWord: activeAyah.words[currentWordIndex]?.arabic || activeAyah.arabicText,
              spokenWord: spokenText,
              expectedAyahText: activeAyah.arabicText,
              advice: `Sequence Warning: Please recite Ayah ${activeAyah.numberInSurah} in exact Quranic order before proceeding to Ayah ${otherAyah.numberInSurah}.`,
              timestamp: new Date(),
              isOutOfOrder: true
            };

            setAllMistakesLog(prev => [...prev, mistakeItem]);
            setAyahEvaluations(prev => {
              const current = prev[activeAyahIndex] || { status: 'pending', mistakesCount: 0, mistakes: [], timeSpentSeconds: 0 };
              return {
                ...prev,
                [activeAyahIndex]: {
                  ...current,
                  status: 'mistake',
                  mistakesCount: current.mistakesCount + 1,
                  mistakes: [...current.mistakes, mistakeItem]
                }
              };
            });
            return;
          }
        }
      }
    }

    // 2. WORD-BY-WORD PROGRESSION WITHIN CURRENT AYAH
    const words = activeAyah.words;
    let matchIdx = currentWordIndex;
    let hadNewMistake = false;

    for (const spokenToken of normalizedSpokenTokens) {
      if (matchIdx < words.length) {
        const expectedWord = words[matchIdx];
        const similarity = calculateSimilarity(expectedWord.normalized, spokenToken);

        if (similarity >= 0.62) {
          // Word matched accurately!
          words[matchIdx].status = 'correct';
          words[matchIdx].transcription = spokenToken;
          matchIdx++;
          setLiveMistakeAlert(null); // Clear mistake alert on successful word
        } else if (spokenToken.length >= 3 && similarity < 0.40) {
          // Significant mispronunciation / wrong word spoken
          if (words[matchIdx].status !== 'correct') {
            words[matchIdx].status = 'mistake';
            hadNewMistake = true;

            const advice = getTajweedAdvice(expectedWord.arabic, spokenToken);

            setLiveMistakeAlert({
              type: 'wrong_word',
              message: `Word Discrepancy: Expected "${expectedWord.arabic}"`,
              details: `Heard "${spokenToken}". ${advice}`
            });

            // Log detailed mistake
            const mistakeItem: MistakeDetail = {
              id: `${expectedWord.id}_${Date.now()}`,
              ayahNumberInSurah: activeAyah.numberInSurah,
              globalAyahNumber: activeAyah.number,
              expectedWord: expectedWord.arabic,
              spokenWord: spokenToken,
              expectedAyahText: activeAyah.arabicText,
              advice,
              timestamp: new Date(),
              isOutOfOrder: false
            };

            setAllMistakesLog(prev => [...prev, mistakeItem]);
            setAyahEvaluations(prev => {
              const current = prev[activeAyahIndex] || { status: 'pending', mistakesCount: 0, mistakes: [], timeSpentSeconds: 0 };
              return {
                ...prev,
                [activeAyahIndex]: {
                  ...current,
                  status: 'mistake',
                  mistakesCount: current.mistakesCount + 1,
                  mistakes: [...current.mistakes, mistakeItem]
                }
              };
            });
          }
        }
      }
    }

    setCurrentWordIndex(matchIdx);

    // If all words in current Ayah have been recited:
    if (matchIdx >= words.length && words.length > 0) {
      handleAyahCompleted();
    }
  };

  // Manual Word / Ayah Verification (For quiet environments or manual testing)
  const advanceSingleWordManually = () => {
    if (!activeAyah) return;
    const words = activeAyah.words;
    if (currentWordIndex < words.length) {
      words[currentWordIndex].status = 'correct';
      const nextIdx = currentWordIndex + 1;
      setCurrentWordIndex(nextIdx);

      if (nextIdx >= words.length) {
        handleAyahCompleted();
      }
    }
  };

  const handleAyahCompleted = (fromAutoFlow = false) => {
    addHasanat(15);
    setAyahsRecitedCount(prev => prev + 1);

    // Finalize evaluation state for this ayah
    setAyahEvaluations(prev => {
      const current = prev[activeAyahIndex] || { status: 'pending', mistakesCount: 0, mistakes: [], timeSpentSeconds: 0 };
      const status = current.mistakesCount === 0 ? 'flawless' : 'corrected';
      return {
        ...prev,
        [activeAyahIndex]: {
          ...current,
          status
        }
      };
    });

    setLiveMistakeAlert(null);

    // Auto-advance to next sequential Ayah if available
    if (activeAyahIndex < ayahs.length - 1) {
      const nextIdx = activeAyahIndex + 1;
      setTimeout(() => {
        setActiveAyahIndex(nextIdx);
        setCurrentWordIndex(0);
        setSpokenTranscript('');
        setInterimText('');

        // If auto-flow is enabled, continuously play and recite the rest!
        if (fromAutoFlow || isAutoRecitingRestRef.current) {
          if (autoReciteTimerRef.current) clearTimeout(autoReciteTimerRef.current);
          autoReciteTimerRef.current = setTimeout(() => {
            playQariAyah(nextIdx, true);
          }, 450);
        }
      }, 600);
    } else {
      // Reached the end of the Surah! Trigger comprehensive Correction Masterclass
      setIsAutoRecitingRest(false);
      isAutoRecitingRestRef.current = false;
      stopAudio();
      setTimeout(() => {
        setShowCorrectionMasterclass(true);
      }, 800);
    }
  };

  // Instant Complete Current Ayah and advance
  const handleManualCompleteAndAdvance = () => {
    if (!activeAyah) return;
    activeAyah.words.forEach(w => { w.status = 'correct'; });
    setCurrentWordIndex(activeAyah.words.length);
    handleAyahCompleted(isAutoRecitingRestRef.current);
  };

  const resetCurrentAyah = () => {
    if (!activeAyah) return;
    activeAyah.words.forEach(w => {
      w.status = 'unrecited';
    });
    setCurrentWordIndex(0);
    setSpokenTranscript('');
    setInterimText('');
    setLiveMistakeAlert(null);

    // Clear mistakes for current ayah in evaluation map
    setAyahEvaluations(prev => {
      const current = prev[activeAyahIndex] || { status: 'pending', mistakesCount: 0, mistakes: [], timeSpentSeconds: 0 };
      return {
        ...prev,
        [activeAyahIndex]: {
          ...current,
          status: 'pending',
          mistakesCount: 0,
          mistakes: []
        }
      };
    });
  };

  // Restart full surah recitation session
  const restartFullSurahSession = () => {
    ayahs.forEach(a => {
      a.words.forEach(w => {
        w.status = 'unrecited';
      });
    });
    setActiveAyahIndex(0);
    setCurrentWordIndex(0);
    setSpokenTranscript('');
    setInterimText('');
    setLiveMistakeAlert(null);
    setAyahsRecitedCount(0);
    setAllMistakesLog([]);
    setShowCorrectionMasterclass(false);
    setDrillMistakesOnlyMode(false);

    const initialEval: Record<number, AyahEvaluationState> = {};
    ayahs.forEach((_, idx) => {
      initialEval[idx] = {
        status: 'pending',
        mistakesCount: 0,
        mistakes: [],
        timeSpentSeconds: 0
      };
    });
    setAyahEvaluations(initialEval);
  };

  // Jump to specific Ayah for focused drill / correction
  const jumpToAyahForDrill = (ayahIdx: number) => {
    setShowCorrectionMasterclass(false);
    setActiveAyahIndex(ayahIdx);
    setCurrentWordIndex(0);
    setSpokenTranscript('');
    setInterimText('');
    setLiveMistakeAlert(null);
    if (ayahs[ayahIdx]) {
      ayahs[ayahIdx].words.forEach(w => {
        w.status = 'unrecited';
      });
    }
  };

  // Calculate Overall Surah Performance Metrics
  const surahPerformanceStats = useMemo(() => {
    const totalAyahs = ayahs.length;
    if (totalAyahs === 0) return { accuracyScore: 100, flawlessCount: 0, mistakesCount: 0, grade: 'Flawless' };

    let flawlessCount = 0;
    let mistakeAyahsCount = 0;

    Object.values(ayahEvaluations).forEach(ev => {
      if (ev.status === 'flawless') flawlessCount++;
      if (ev.status === 'mistake' || ev.mistakesCount > 0) mistakeAyahsCount++;
    });

    const evaluatedAyahsCount = Math.max(1, flawlessCount + mistakeAyahsCount);
    const accuracyScore = Math.round((flawlessCount / evaluatedAyahsCount) * 100);

    let grade = 'Master Hafiz 🏆';
    if (accuracyScore < 70) grade = 'Needs Practice 📖';
    else if (accuracyScore < 90) grade = 'Proficient Reciter ⭐';

    return {
      accuracyScore,
      flawlessCount,
      mistakeAyahsCount,
      grade,
      totalMistakes: allMistakesLog.length
    };
  }, [ayahEvaluations, ayahs.length, allMistakesLog.length]);

  // ----------------------------------------------------
  // Quran Shazam / Voice Search ("Recite to Find Ayah")
  // ----------------------------------------------------
  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert("Microphone recognition not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      setIsSearchingVoice(true);
      setSearchResults([]);
      setSearchSpokenQuery('');

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSearchSpokenQuery(transcript);

        if (event.results[0].isFinal) {
          executeVoiceSearchLookup(transcript);
        }
      };

      recognition.onerror = () => {
        setIsSearchingVoice(false);
      };

      recognition.onend = () => {
        setIsSearchingVoice(false);
      };

      recognition.start();
    } catch (e) {
      setIsSearchingVoice(false);
    }
  };

  const executeVoiceSearchLookup = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(queryText)}/all/en`);
      const data = await res.json();

      if (data?.data?.matches && data.data.matches.length > 0) {
        const results: VoiceSearchResult[] = data.data.matches.slice(0, 5).map((m: any) => {
          const surahMeta = SURAH_LIST.find(s => s.number === m.surah.number) || SURAH_LIST[0];
          return {
            surahNumber: m.surah.number,
            surahName: surahMeta.name,
            surahEnglishName: surahMeta.englishName,
            ayahNumberInSurah: m.numberInSurah,
            globalAyahNumber: m.number,
            arabicText: m.text,
            translation: m.surah.englishNameTranslation || '',
            matchScore: 98,
            matchedPhrase: queryText
          };
        });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Voice search lookup failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render word based on Hifz mask mode
  const renderWordText = (word: AyahWord, index: number) => {
    const isCompleted = word.status === 'correct' || index < currentWordIndex;
    const isMistake = word.status === 'mistake';

    if (hifzMaskMode === 'visible') {
      return word.arabic;
    }

    if (hifzMaskMode === 'hints') {
      if (isCompleted || isMistake) return word.arabic;
      return `${word.arabic.charAt(0)}•••`;
    }

    // Blur Mode (True Hifz)
    if (isCompleted || isMistake) {
      return word.arabic;
    }
    return (
      <span className="blur-md select-none opacity-40 group-hover:opacity-60 transition-all">
        {word.arabic}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-16">
      
      {/* 1. TOP HEADER & TARTEEL AI ENGINE BRAND */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#061828]/95 via-brand-sidebar to-black shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Return to Sanctuary"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Wand2 size={12} className="text-amber-400" /> Tarteel AI Quran Voice Engine
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[9px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ListOrdered size={10} /> Step-by-Step Quran Order
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                Quran Recitation & Hifz Companion
              </h2>
              <p className="text-xs text-slate-300">
                Follows exact sequential Quran order. Listens in real time, detects wrong ayahs or words, highlights slips in red, and presents an AI Correction Masterclass at the end.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto shrink-0 font-sans">
            {[
              { id: 'memorize', label: 'Hifz Studio', icon: BookOpen },
              { id: 'voice_search', label: 'Quran Shazam', icon: Search },
              { id: 'test', label: 'Blind Test', icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = appMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setAppMode(tab.id as any);
                    if (tab.id === 'test') {
                      setHifzMaskMode('blur');
                    }
                  }}
                  className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-primary to-emerald-500 text-brand-depth shadow-lg font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* APP MODE 1 & 3: HIFZ STUDIO / BLIND MEMORIZATION TEST */}
      {/* ---------------------------------------------------- */}
      {appMode !== 'voice_search' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Scope, Surah Selector, Masking Mode, Qari Selector & Order Strictness */}
          <div className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            
            {/* Surah / Scope Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setScopeType('surah')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    scopeType === 'surah' ? 'bg-brand-primary text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Surah
                </button>
                <button
                  onClick={() => setScopeType('juz')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    scopeType === 'juz' ? 'bg-brand-primary text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Juz
                </button>
                <button
                  onClick={() => setScopeType('page')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                    scopeType === 'page' ? 'bg-brand-primary text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Page
                </button>
              </div>

              {scopeType === 'surah' && (
                <select
                  value={selectedSurahNumber}
                  onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
                  className="px-4 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-brand-primary"
                >
                  {SURAH_LIST.map((s) => (
                    <option key={s.number} value={s.number} className="bg-slate-900 text-white">
                      {s.number}. {s.englishName} ({s.name}) • {s.numberOfAyahs} Ayahs
                    </option>
                  ))}
                </select>
              )}

              {scopeType === 'juz' && (
                <select
                  value={selectedJuzNumber}
                  onChange={(e) => setSelectedJuzNumber(Number(e.target.value))}
                  className="px-4 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-brand-primary"
                >
                  {FULL_JUZ_LIST.map((j) => (
                    <option key={j.index} value={j.index} className="bg-slate-900 text-white">
                      Juz {j.index} • {j.nameTransliteration} ({j.nameArabic})
                    </option>
                  ))}
                </select>
              )}

              {scopeType === 'page' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">Page:</span>
                  <input
                    type="number"
                    min={1}
                    max={604}
                    value={selectedPageNumber}
                    onChange={(e) => setSelectedPageNumber(Math.min(604, Math.max(1, Number(e.target.value))))}
                    className="w-20 px-3 py-1.5 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-white text-center focus:outline-none focus:border-brand-primary"
                  />
                </div>
              )}
            </div>

            {/* Reciter & Mask Mode Toggles */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Strict Order Toggle */}
              <button
                onClick={() => setStrictOrderMode(!strictOrderMode)}
                title="Strict Quran Order: Highlights out-of-order recitation and wrong verses"
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border ${
                  strictOrderMode
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <ShieldCheck size={12} className={strictOrderMode ? 'text-emerald-400' : 'text-slate-400'} />
                <span>{strictOrderMode ? 'Strict Order: ON' : 'Strict Order: OFF'}</span>
              </button>

              {/* Continuous Tarteel Auto-Flow Toggle */}
              <button
                onClick={() => {
                  if (isAutoRecitingRest) {
                    stopAutoReciteRest();
                  } else {
                    startAutoReciteRest();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isAutoRecitingRest
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md font-black animate-pulse'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
                title="Continuous Tarteel Engine: After completing one Ayah, automatically does the rest ayah-by-ayah"
              >
                <Sparkles size={12} className={isAutoRecitingRest ? 'text-black' : 'text-amber-400'} />
                <span>{isAutoRecitingRest ? '⚡ Auto-Reciting Rest: ON' : '⚡ Auto-Recite Rest'}</span>
              </button>

              {/* Mask Mode Selector */}
              <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 items-center">
                <button
                  onClick={() => setHifzMaskMode('blur')}
                  title="Blur Mode: Unblurs word-by-word as you recite accurately"
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    hifzMaskMode === 'blur' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <EyeOff size={12} />
                  <span>Blur</span>
                </button>

                <button
                  onClick={() => setHifzMaskMode('hints')}
                  title="Hints Mode: Shows initial letter"
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    hifzMaskMode === 'hints' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Lightbulb size={12} />
                  <span>Hints</span>
                </button>

                <button
                  onClick={() => setHifzMaskMode('visible')}
                  title="Visible Mode: Follow along"
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                    hifzMaskMode === 'visible' ? 'bg-amber-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye size={12} />
                  <span>Visible</span>
                </button>
              </div>

              {/* Master Qari Reference Audio */}
              <select
                value={selectedReciterId}
                onChange={(e) => setSelectedReciterId(Number(e.target.value))}
                className="px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-brand-primary"
                title="Qari reference voice"
              >
                {RECITERS.slice(0, 10).map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    🎙️ {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP-BY-STEP AYAH SEQUENCE RIBBON */}
          {ayahs.length > 0 && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ListOrdered size={13} className="text-brand-primary" />
                  <span>Quranic Order Sequence: Ayah {activeAyahIndex + 1} of {ayahs.length}</span>
                </span>
                <span className="font-mono text-emerald-400">
                  {Math.round(((activeAyahIndex + 1) / ayahs.length) * 100)}% Surah Progress
                </span>
              </div>

              {/* Step pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {ayahs.map((a, idx) => {
                  const ev = ayahEvaluations[idx];
                  const isActive = idx === activeAyahIndex;
                  const isPassed = idx < activeAyahIndex;
                  const hasMistake = ev?.status === 'mistake' || (ev?.mistakesCount || 0) > 0;
                  const isFlawless = ev?.status === 'flawless';

                  return (
                    <button
                      key={a.number}
                      onClick={() => {
                        setActiveAyahIndex(idx);
                        setCurrentWordIndex(0);
                        setSpokenTranscript('');
                        setInterimText('');
                        setLiveMistakeAlert(null);
                      }}
                      className={`h-9 px-3 shrink-0 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-black ring-2 ring-amber-400/50 shadow-lg scale-105 font-black'
                          : hasMistake
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                          : isFlawless || isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                      }`}
                      title={`Ayah ${a.numberInSurah} • ${hasMistake ? 'Mistake detected' : isFlawless ? 'Flawless' : 'Upcoming'}`}
                    >
                      {hasMistake ? (
                        <AlertTriangle size={11} className="text-red-400" />
                      ) : isFlawless || isPassed ? (
                        <Check size={11} className="text-emerald-400" />
                      ) : (
                        <Hash size={10} className="opacity-40" />
                      )}
                      <span>v.{a.numberInSurah}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN RECITATION MUSHAF SANCTUARY BOARD */}
          <div className="p-6 sm:p-10 md:p-12 rounded-[3rem] bg-gradient-to-b from-[#061828]/95 via-[#03101C] to-black border-2 border-brand-primary/30 shadow-2xl relative overflow-hidden space-y-8">
            
            {/* Header: Ayah Navigation, Reciter, and Mistake Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-black text-lg shadow-inner">
                  {activeAyah?.numberInSurah || 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      Surah {activeAyah?.surahEnglishName} ({activeAyah?.surahName})
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-mono text-amber-300">
                      Step #{activeAyahIndex + 1}/{ayahs.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ayah {activeAyah?.numberInSurah} of {ayahs.length} • Global #{activeAyah?.number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeAyahIndex > 0) {
                      setActiveAyahIndex(prev => prev - 1);
                      setCurrentWordIndex(0);
                      setLiveMistakeAlert(null);
                    }
                  }}
                  disabled={activeAyahIndex === 0}
                  className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                  title="Previous Verse in Quran Order"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => {
                    if (activeAyahIndex < ayahs.length - 1) {
                      setActiveAyahIndex(prev => prev + 1);
                      setCurrentWordIndex(0);
                      setLiveMistakeAlert(null);
                    }
                  }}
                  disabled={activeAyahIndex >= ayahs.length - 1}
                  className="p-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                  title="Next Verse in Quran Order"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={playQariActiveAyah}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all cursor-pointer ${
                    isPlayingQari && activePlayingAyahIndex === activeAyahIndex
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                  title="Listen to Master Qari pronunciation for this Ayah"
                >
                  {isPlayingQari && activePlayingAyahIndex === activeAyahIndex ? <Pause size={14} /> : <Volume2 size={14} />}
                  <span>{isPlayingQari && activePlayingAyahIndex === activeAyahIndex ? 'Pause Qari' : 'Listen Qari'}</span>
                </button>
              </div>
            </div>

            {/* LIVE MISTAKE / OUT-OF-ORDER ALERT BANNER */}
            <AnimatePresence>
              {liveMistakeAlert && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="p-4 rounded-2xl bg-red-500/15 border-2 border-red-500/40 text-red-200 shadow-xl flex items-start gap-3.5"
                >
                  <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5 animate-bounce" />
                  <div className="space-y-1 text-xs">
                    <p className="font-black text-red-300 uppercase tracking-wide">
                      {liveMistakeAlert.message}
                    </p>
                    {liveMistakeAlert.details && (
                      <p className="text-slate-300 font-medium leading-relaxed">
                        {liveMistakeAlert.details}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setLiveMistakeAlert(null)}
                    className="ml-auto text-slate-400 hover:text-white p-1"
                  >
                    <XCircle size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* QURAN SCRIPT DISPLAY WITH LIVE WORD HIGHLIGHTING */}
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Retrieving Quranic Text...</p>
              </div>
            ) : loadError ? (
              <div className="py-16 text-center space-y-3">
                <AlertTriangle size={32} className="text-amber-400 mx-auto" />
                <p className="text-sm text-red-300">{loadError}</p>
              </div>
            ) : activeAyah ? (
              <div className="space-y-8">
                {/* Word by Word Flow */}
                <div 
                  dir="rtl"
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-6 font-arabic leading-loose text-3xl sm:text-4xl md:text-5xl"
                >
                  {activeAyah.words.map((word, idx) => {
                    const isPassed = idx < currentWordIndex || word.status === 'correct';
                    const isTarget = idx === currentWordIndex;
                    const isMistake = word.status === 'mistake';

                    return (
                      <motion.span
                        key={word.id}
                        layout
                        initial={{ opacity: 0.8, scale: 0.95 }}
                        animate={{ 
                          scale: isTarget ? 1.08 : 1,
                          opacity: 1
                        }}
                        className={`relative px-3 py-2 rounded-2xl transition-all duration-300 inline-flex items-center cursor-pointer select-none ${
                          isMistake
                            ? 'bg-red-500/25 text-red-300 border-2 border-red-500 ring-4 ring-red-500/20 shadow-lg shadow-red-500/20 animate-pulse'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                            : isTarget
                            ? 'bg-amber-400/20 text-amber-300 border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-lg'
                            : 'text-slate-300 bg-white/[0.02] border border-white/5'
                        }`}
                        onClick={() => {
                          if (idx === currentWordIndex) {
                            advanceSingleWordManually();
                          }
                        }}
                      >
                        {renderWordText(word, idx)}

                        {/* Subtle Ayah Marker badge on last word */}
                        {idx === activeAyah.words.length - 1 && (
                          <span className="mr-2 text-xs font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            ﴿{activeAyah.numberInSurah}﴾
                          </span>
                        )}
                      </motion.span>
                    );
                  })}
                </div>

                {/* English Translation */}
                <div className="text-center max-w-2xl mx-auto space-y-2 pt-4 border-t border-white/5">
                  <p className="text-slate-300 text-sm italic font-light leading-relaxed">
                    "{activeAyah.translation}"
                  </p>
                </div>
              </div>
            ) : null}

            {/* LIVE VOICE RECORDER CONSOLE & CONTROLS */}
            <div className="pt-6 border-t border-white/10 flex flex-col items-center space-y-6">
              
              {/* Spoken Transcript Bubble */}
              {spokenTranscript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/15 max-w-xl text-center space-y-1"
                >
                  <p className="text-[10px] font-black uppercase text-brand-primary tracking-widest">
                    Recognized Voice Recitation
                  </p>
                  <p className="text-base text-amber-200 font-arabic font-bold" dir="rtl">
                    {spokenTranscript}
                  </p>
                </motion.div>
              )}

              {/* Central Glowing Mic Button & Level Meter */}
              <div className="flex items-center gap-6">
                <button
                  onClick={resetCurrentAyah}
                  className="p-3.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all cursor-pointer"
                  title="Restart This Ayah (Clear Mistakes)"
                >
                  <RotateCcw size={18} />
                </button>

                <div className="relative">
                  {/* Glowing Pulse Rings when Mic is Live */}
                  {isListening && (
                    <>
                      <div 
                        className="absolute -inset-3 bg-red-500/30 rounded-full blur-xl animate-pulse pointer-events-none"
                        style={{ transform: `scale(${1 + audioLevel / 100})` }}
                      />
                      <div className="absolute -inset-1 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
                    </>
                  )}

                  <button
                    onClick={toggleMic}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer relative z-10 ${
                      isListening
                        ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-500/50 ring-4 ring-red-500/40'
                        : 'bg-gradient-to-tr from-brand-primary via-emerald-400 to-teal-500 text-black shadow-brand-primary/40 hover:scale-105'
                    }`}
                  >
                    {isListening ? (
                      <MicOff size={32} className="animate-pulse" />
                    ) : (
                      <Mic size={32} />
                    )}
                  </button>
                </div>

                <button
                  onClick={advanceSingleWordManually}
                  className="p-3.5 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-2xl border border-white/10 transition-all cursor-pointer"
                  title="Verify Next Word Manually (+1 Word)"
                >
                  <Check size={18} />
                </button>
              </div>

              {/* Continuous Tarteel & Ayah-by-Ayah Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full max-w-xl">
                {/* 1-Tap Complete Current Ayah and advance */}
                <button
                  onClick={handleManualCompleteAndAdvance}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:scale-105"
                  title="Mark Current Ayah Complete and Move to Next"
                >
                  <CheckCircle2 size={15} />
                  <span>Complete Ayah (+15★) & Go Next</span>
                </button>

                {/* Auto-Recite Rest of Surah (Continuous Tarteel) */}
                {isAutoRecitingRest ? (
                  <button
                    onClick={stopAutoReciteRest}
                    className="px-4 py-2.5 rounded-2xl bg-red-500 text-white border border-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-500/30 animate-pulse"
                    title="Pause Automatic Ayah-by-Ayah Recitation"
                  >
                    <Pause size={15} />
                    <span>Stop Auto-Flow</span>
                  </button>
                ) : (
                  <button
                    onClick={startAutoReciteRest}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
                    title="Let Tarteel AI automatically flow and recite all remaining verses ayah-by-ayah"
                  >
                    <Sparkles size={15} />
                    <span>⚡ Recite All Rest (Ayah by Ayah)</span>
                  </button>
                )}
              </div>

              {/* Microphone Status Banner */}
              <div className="text-center space-y-1">
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  {isAutoRecitingRest
                    ? '⚡ Tarteel Auto-Flow Active: Reciting Rest of Surah Verse-by-Verse'
                    : isListening 
                    ? 'Listening to your Holy Recitation...' 
                    : 'Tap Microphone & Recite in Arabic'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isAutoRecitingRest
                    ? 'Advancing sequentially through each Ayah with Qari voice, live word syncing, and Hasanat rewards.'
                    : isListening 
                    ? 'Words turn emerald green on accuracy, red on mistakes. Sequence is strictly verified.'
                    : 'Works seamlessly with Uthmani script and real-time phonetic recognition.'}
                </p>
              </div>
            </div>

          </div>

          {/* Session Progress Stats & Review Trigger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <p className="text-2xl font-black text-emerald-400 font-mono">{ayahsRecitedCount}/{ayahs.length}</p>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Ayahs Completed</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <p className="text-2xl font-black text-amber-400 font-mono">+{ayahsRecitedCount * 15}</p>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Hasanat Earned</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <p className="text-2xl font-black text-blue-400 font-mono">
                {activeAyah ? `${currentWordIndex}/${activeAyah.words.length}` : '0/0'}
              </p>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Current Ayah Words</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <p className="text-2xl font-black text-purple-400 font-mono">{surahPerformanceStats.accuracyScore}%</p>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Overall Accuracy</p>
            </div>
          </div>

          {/* Direct Trigger to Open Correction Masterclass at any time */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowCorrectionMasterclass(true)}
              className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 mx-auto"
            >
              <FileAudio size={14} className="text-amber-400" />
              <span>View Surah AI Correction & Performance Report ({allMistakesLog.length} Notes)</span>
            </button>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* APP MODE 2: QURAN SHAZAM (VOICE SEARCH IDENTIFIER) */}
      {/* ---------------------------------------------------- */}
      {appMode === 'voice_search' && (
        <div className="space-y-6">
          <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-b from-[#061828]/95 via-[#03101C] to-black border-2 border-emerald-500/30 shadow-2xl text-center space-y-8">
            
            <div className="max-w-xl mx-auto space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                <Search size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                Quran Voice Identifier ("Shazam")
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Recite or hum any verse from any of the 114 Surahs. Tarteel AI matches the recitation in milliseconds to find the exact Surah and Ayah number.
              </p>
            </div>

            {/* Recite to Search Button */}
            <div className="py-4 flex flex-col items-center space-y-4">
              <button
                onClick={startVoiceSearch}
                className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all duration-300 shadow-2xl cursor-pointer active:scale-95 ${
                  isSearchingVoice
                    ? 'bg-red-500 text-white ring-8 ring-red-500/30 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-black hover:scale-105 shadow-emerald-500/25'
                }`}
              >
                <Mic size={18} />
                <span>{isSearchingVoice ? 'Listening... Speak Any Ayah' : 'Tap to Recite Verse'}</span>
              </button>

              {searchSpokenQuery && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-lg">
                  <p className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Heard Recitation</p>
                  <p className="text-lg text-white font-arabic mt-1" dir="rtl">{searchSpokenQuery}</p>
                </div>
              )}
            </div>

            {/* Quick Prompt Test Chips */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or test with sample Quranic phrases:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { text: 'الرَّحْمَنُ عَلَّمَ الْقُرْآنَ', label: 'Ar-Rahman (55:1-2)' },
                  { text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', label: 'Ayat al-Kursi (2:255)' },
                  { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', label: 'Al-Ikhlas (112:1)' },
                  { text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', label: 'Al-Kawthar (108:1)' }
                ].map((sample) => (
                  <button
                    key={sample.label}
                    onClick={() => {
                      setSearchSpokenQuery(sample.text);
                      executeVoiceSearchLookup(sample.text);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-arabic cursor-pointer transition-all"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Match Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4 pt-6 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Matches Found ({searchResults.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {searchResults.map((res, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black font-mono">
                            {res.surahNumber}:{res.ayahNumberInSurah}
                          </span>
                          <h5 className="text-sm font-black text-white">
                            Surah {res.surahEnglishName} ({res.surahName})
                          </h5>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase">
                          {res.matchScore}% Match Confidence
                        </span>
                      </div>

                      <p className="text-2xl text-white font-arabic text-right leading-loose" dir="rtl">
                        {res.arabicText}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <p className="text-xs text-slate-400 italic">
                          "{res.translation}"
                        </p>
                        <button
                          onClick={() => {
                            setSelectedSurahNumber(res.surahNumber);
                            setScopeType('surah');
                            setAppMode('memorize');
                          }}
                          className="px-4 py-1.5 rounded-xl bg-brand-primary text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          <span>Practice in Hifz</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* WORLD-CLASS END-OF-SURAH AI CORRECTION & REVIEW MASTERCLASS */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {showCorrectionMasterclass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="my-8 p-6 sm:p-10 rounded-[3rem] bg-gradient-to-b from-[#071c2e] via-[#04121e] to-black border-2 border-amber-400/40 max-w-3xl w-full text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background glow accents */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* Master Badge & Title */}
                <div className="space-y-3">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400/20 via-emerald-500/20 to-brand-primary/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto shadow-2xl">
                    <Award size={42} className="animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-[0.25em]">
                      Surah Recitation Masterclass & Correction
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                      Surah {currentSurahMeta.englishName} ({currentSurahMeta.name})
                    </h3>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                      Detailed step-by-step Quran recitation breakdown. Review mistakes, listen to the Master Qari correction audio, and perfect your memorization.
                    </p>
                  </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-2xl font-black text-emerald-400 font-mono">{surahPerformanceStats.accuracyScore}%</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Accuracy Score</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-2xl font-black text-amber-400 font-mono">+{ayahsRecitedCount * 15 + (surahPerformanceStats.totalMistakes === 0 ? 50 : 0)}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Hasanat Earned</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-2xl font-black text-blue-400 font-mono">{ayahsRecitedCount}/{ayahs.length}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Verses Covered</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <p className="text-2xl font-black text-rose-400 font-mono">{surahPerformanceStats.totalMistakes}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Correction Points</p>
                  </div>
                </div>

                {/* AYAH-BY-AYAH STEP-BY-STEP CORRECTION BREAKDOWN LIST */}
                <div className="space-y-4 text-left max-h-[380px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ListOrdered size={14} /> Step-by-Step Verse Corrections & Tajweed
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Qari: {currentReciterMeta.name}
                    </span>
                  </h4>

                  {ayahs.map((a, idx) => {
                    const ev = ayahEvaluations[idx];
                    const hasMistakes = (ev?.mistakesCount || 0) > 0;
                    const isPlayingThis = isPlayingQari && activePlayingAyahIndex === idx;

                    return (
                      <div
                        key={a.number}
                        className={`p-5 rounded-2xl border transition-all space-y-3 ${
                          hasMistakes
                            ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                            : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/30'
                        }`}
                      >
                        {/* Verse Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono font-black text-white">
                              {a.numberInSurah}
                            </span>
                            <span className="text-xs font-bold text-white">
                              Ayah {a.numberInSurah}
                            </span>
                            {hasMistakes ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-black uppercase flex items-center gap-1 border border-red-500/30">
                                <AlertTriangle size={10} /> {ev.mistakesCount} Mistake{ev.mistakesCount > 1 ? 's' : ''} Flagged
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase flex items-center gap-1 border border-emerald-500/30">
                                <CheckCircle2 size={10} /> Flawless Recitation
                              </span>
                            )}
                          </div>

                          {/* 1-Tap Qari Audio Playback & Practice Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => playQariAyah(idx)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                                isPlayingThis
                                  ? 'bg-amber-400 text-black shadow-md animate-pulse'
                                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15'
                              }`}
                              title="Listen to Qari correct recitation"
                            >
                              {isPlayingThis ? <Pause size={12} /> : <Volume2 size={12} />}
                              <span>{isPlayingThis ? 'Pause' : 'Listen Correction'}</span>
                            </button>

                            <button
                              onClick={() => jumpToAyahForDrill(idx)}
                              className="px-3 py-1.5 rounded-xl bg-brand-primary text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                              <span>Practice</span>
                              <ArrowRight size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Arabic Verse Text with Highlighted Mistakes */}
                        <p className="text-xl sm:text-2xl text-white font-arabic text-right leading-loose pt-1" dir="rtl">
                          {a.arabicText}
                        </p>

                        {/* Mistake Details & Tajweed Correction Advice */}
                        {hasMistakes && ev.mistakes.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2 text-xs">
                            <p className="font-bold text-red-300 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle size={12} /> AI Correction Analysis:
                            </p>
                            {ev.mistakes.map((m, mIdx) => (
                              <div key={m.id || mIdx} className="space-y-1 pl-1">
                                <p className="text-slate-200 text-xs">
                                  • <span className="font-bold text-amber-300">Expected:</span> "{m.expectedWord}" 
                                  {m.spokenWord && <> — <span className="font-bold text-rose-300">Heard:</span> "{m.spokenWord}"</>}
                                </p>
                                <p className="text-slate-400 text-[11px] italic pl-2">
                                  💡 {m.advice}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={restartFullSurahSession}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border border-white/15"
                  >
                    <RotateCcw size={14} />
                    <span>Retest Entire Surah</span>
                  </button>

                  <button
                    onClick={() => {
                      // Jump to the first mistaken ayah, or simply close modal
                      const firstMistakeIdx = Object.keys(ayahEvaluations).find(k => (ayahEvaluations[Number(k)]?.mistakesCount || 0) > 0);
                      if (firstMistakeIdx !== undefined) {
                        jumpToAyahForDrill(Number(firstMistakeIdx));
                      } else {
                        setShowCorrectionMasterclass(false);
                      }
                    }}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Target size={14} />
                    <span>{allMistakesLog.length > 0 ? 'Drill Mistaken Verses' : 'Session Complete (Masha’Allah)'}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
