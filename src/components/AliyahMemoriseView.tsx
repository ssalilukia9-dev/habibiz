import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Radio,
  Bookmark,
  Share2,
  Lightbulb,
  Check,
  CheckCheck,
  ChevronDown,
  Wand2,
  Compass,
  ShieldCheck,
  Sliders,
  HelpCircle,
  Hash,
  Target,
  XCircle,
  AlertCircle,
  Volume1,
  ListOrdered,
  ArrowRight,
  Brain,
  Headphones,
  Zap,
  Repeat,
  FastForward,
  Star,
  Settings,
  Info,
  ChevronUp,
  Clock,
  Sparkle,
  Keyboard,
  Timer
} from 'lucide-react';
import { SURAH_LIST, JUZ_LIST } from '../constants.ts';

export interface AyahWord {
  id: string;
  index: number;
  arabic: string;
  normalized: string;
  firstLetter: string;
  status: 'unrecited' | 'correct' | 'mistake' | 'active';
  detectedSpoken?: string;
  problemReason?: string;
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
  juzNumber?: number;
  words: AyahWord[];
}

export interface MistakeLogItem {
  id: string;
  wordIndex: number;
  expectedWord: string;
  spokenWord: string;
  problemReason: string;
  tajweedTip: string;
  ayahNumberInSurah: number;
  surahNumber: number;
  surahName: string;
  timestamp: number;
}

interface AliyahMemoriseViewProps {
  onBack: () => void;
  addHasanat: (amount: number) => void;
  isPremium?: boolean;
  onShowPremium?: () => void;
}

export type HifzMode = 'follow' | 'blind' | 'firstLetter' | 'vanishing' | 'echo';

// Available Qari Audio Reciters with reliable CDN endpoints
export const QARI_OPTIONS = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', sub: 'Hafs an Asim (Standard)', cdnId: 'ar.alafasy' },
  { id: 'abdulbasit', name: 'Abdul Basit Murattal', sub: 'Classic Egyptian Recitation', cdnId: 'ar.abdulbasitmurattal' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', sub: 'Tajweed Mastery Reciter', cdnId: 'ar.husary' },
  { id: 'minshawi', name: 'Mohamed Siddiq El-Minshawi', sub: 'Spiritual Murattal', cdnId: 'ar.minshawi' },
  { id: 'sudais', name: 'Abdur-Rahman As-Sudais', sub: 'Imam of Masjid Al-Haram', cdnId: 'ar.abdurrahmaansudais' },
  { id: 'shuraim', name: 'Saud Al-Shuraim', sub: 'Masjid Al-Haram', cdnId: 'ar.saoodshuraym' }
];

// Arabic diacritics stripping & normalization for robust speech matching
export const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    // Remove diacritics (harakat / tashkeel / tanween / sukun)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '')
    // Normalize alefs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize ya and alif maqsura
    .replace(/[ىي]/g, 'ي')
    // Normalize ta marbuta to haa
    .replace(/ة/g, 'ه')
    // Remove Quranic stop marks, sajda marks, rub el hizb
    .replace(/[\u0600-\u0605\u06DD\u06DE\u06E9\u06D4\u060C\u061B\u061F\.,:;\(\)\[\]\{\}«»"']/g, '')
    // Replace multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Calculate Levenshtein similarity (0 to 1)
export const calculateSimilarity = (s1: string, s2: string): number => {
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

// Tajweed Rule Analysis & Problem Identifier Helper
export const getTajweedProblemAnalysis = (expected: string, spoken: string): { reason: string; tip: string } => {
  const normExp = normalizeArabic(expected);
  const normSpk = normalizeArabic(spoken);

  if (/[حخعغهء]/.test(normExp) && !/[حخعغهء]/.test(normSpk)) {
    return {
      reason: 'Throat Letter Makhraj (حلقي - Halqi)',
      tip: 'Articulate the throat letters (ح, ع, خ, غ, ه, ء) deeply from their correct vocal exit point in the throat.'
    };
  }
  if (/[صضطظق]/.test(normExp) && !/[صضطظق]/.test(normSpk)) {
    return {
      reason: 'Heavy Letter Elevation (تفخيم - Tafkheem)',
      tip: 'Elevate the back of the tongue towards the soft palate for heavy letters (ص, ض, ط, ظ, ق).'
    };
  }
  if (/[قطبجد]/.test(normExp)) {
    return {
      reason: 'Qalqalah Echo / Bounce (قلقلة)',
      tip: 'Apply a crisp acoustic bounce when stopping on (ق, ط, ب, ج, د) with Sukun.'
    };
  }
  if (/[نم]/.test(normExp) && normExp.length > 2) {
    return {
      reason: 'Ghunnah 2-Count Nasal Resonance (غنة)',
      tip: 'Hold the 2-beat nasal resonance on Noon or Meem with Shaddah.'
    };
  }
  if (normExp.length >= 5 && normSpk.length <= 3) {
    return {
      reason: 'Madd Lengthening / Incomplete Word (مد)',
      tip: 'Elongate the vowel sound to the prescribed count (2, 4, or 6 harakat) without clipping the word short.'
    };
  }

  return {
    reason: 'Letter Articulation & Harakat',
    tip: 'Ensure accurate pronunciation of each letter and vowel in exact Quranic sequence.'
  };
};

// Web Audio API Sound generator
const playAudioChime = (type: 'success' | 'mistake' | 'advance' | 'surahComplete') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Pleasant dual tone chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'surahComplete') {
      // Grand celebratory fanfare
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.45);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    } else if (type === 'advance') {
      // Soft gentle transition tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      // Subtle warning click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    // Ignore audio synthesis errors
  }
};

export default function AliyahMemoriseView({
  onBack,
  addHasanat,
  isPremium = true,
  onShowPremium
}: AliyahMemoriseViewProps) {
  // 1. Initial State from localStorage (Resume feature)
  const savedSurah = Number(localStorage.getItem('aliyah_memorise_last_surah')) || 1;
  const savedAyah = Number(localStorage.getItem('aliyah_memorise_last_ayah')) || 0;

  // Navigation & Strict Quran Order State (1 to 114)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(savedSurah);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(savedAyah);
  const [loadedAyahs, setLoadedAyahs] = useState<LoadedAyah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState<boolean>(true);
  const [showSurahPicker, setShowSurahPicker] = useState<boolean>(false);
  const [surahPickerTab, setSurahPickerTab] = useState<'surahs' | 'juz'>('surahs');
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');

  // Hifz Mode & Display
  const [hifzMode, setHifzMode] = useState<HifzMode>('follow');
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showAyahRibbon, setShowAyahRibbon] = useState<boolean>(true);
  const [repeatCountSetting, setRepeatCountSetting] = useState<number>(1);
  const [currentRepeatIteration, setCurrentRepeatIteration] = useState<number>(1);
  const [selectedQari, setSelectedQari] = useState<string>('alafasy');

  // Active Ayah word progression
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [currentWords, setCurrentWords] = useState<AyahWord[]>([]);
  const [isAyahCompleted, setIsAyahCompleted] = useState<boolean>(false);
  
  // Tarteel Continuous Hands-Free Recitation Engine Settings (Default ON!)
  const [continuousHandsFree, setContinuousHandsFree] = useState<boolean>(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState<number>(1); // seconds before auto-jumping (1, 2, 3, or 0.5)
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [strictnessLevel, setStrictnessLevel] = useState<'standard' | 'forgiving' | 'strict'>('standard');
  const [strictQuranOrder, setStrictQuranOrder] = useState<boolean>(true);

  // Audio Playback for Qari reference
  const [isPlayingQari, setIsPlayingQari] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Speech Recognition (Tarteel-Style Live Voice Follower)
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  
  // Problem / Mistake Inspection
  const [mistakesLog, setMistakesLog] = useState<MistakeLogItem[]>([]);
  const [selectedProblemWord, setSelectedProblemWord] = useState<AyahWord | null>(null);
  
  // Stats & Progress
  const [sessionCompletedAyahs, setSessionCompletedAyahs] = useState<number>(0);
  const [sessionHasanat, setSessionHasanat] = useState<number>(0);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  
  // Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextAyahTimeoutRef = useRef<any>(null);
  const wordsContainerRef = useRef<HTMLDivElement | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep ref in sync for recognition handlers
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Current Selected Surah Meta
  const selectedSurahMeta = useMemo(() => {
    return SURAH_LIST.find(s => s.number === selectedSurahNumber) || SURAH_LIST[0];
  }, [selectedSurahNumber]);

  // Persist current position to localStorage
  useEffect(() => {
    localStorage.setItem('aliyah_memorise_last_surah', selectedSurahNumber.toString());
    localStorage.setItem('aliyah_memorise_last_ayah', currentAyahIndex.toString());
  }, [selectedSurahNumber, currentAyahIndex]);

  // Filtered Surahs for quick jump
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return SURAH_LIST;
    const q = surahSearchQuery.toLowerCase();
    return SURAH_LIST.filter(s => 
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [surahSearchQuery]);

  // 1. Fetch Surah Ayahs from API in Strict Quran Order
  useEffect(() => {
    let isMounted = true;
    const fetchSurah = async () => {
      setLoadingAyahs(true);
      try {
        const selectedReciterCdn = QARI_OPTIONS.find(q => q.id === selectedQari)?.cdnId || 'ar.alafasy';
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurahNumber}/editions/quran-uthmani,en.sahih`);
        const data = await res.json();

        if (isMounted && data.code === 200 && data.data.length >= 2) {
          const arabicData = data.data[0];
          const englishData = data.data[1];

          const ayahs: LoadedAyah[] = arabicData.ayahs.map((ayah: any, idx: number) => {
            let rawText = ayah.text;
            // Clean leading Bismillah if not Surah 1 or 9
            if (selectedSurahNumber !== 1 && selectedSurahNumber !== 9 && idx === 0) {
              rawText = rawText.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim() || rawText;
            }

            const wordTokens = rawText.split(/\s+/).filter(Boolean);
            const words: AyahWord[] = wordTokens.map((w: string, wIdx: number) => {
              const cleanFirst = normalizeArabic(w).slice(0, 1) || w.slice(0, 1);
              return {
                id: `${ayah.number}_${wIdx}`,
                index: wIdx,
                arabic: w,
                normalized: normalizeArabic(w),
                firstLetter: cleanFirst,
                status: 'unrecited'
              };
            });

            return {
              number: ayah.number,
              numberInSurah: ayah.numberInSurah,
              surahNumber: selectedSurahNumber,
              surahName: arabicData.name,
              surahEnglishName: arabicData.englishName,
              arabicText: rawText,
              translation: englishData.ayahs[idx]?.text || '',
              audioUrl: `https://cdn.islamic.network/quran/audio/128/${selectedReciterCdn}/${ayah.number}.mp3`,
              juzNumber: ayah.juz,
              words
            };
          });

          setLoadedAyahs(ayahs);
          
          // Verify valid index or clamp
          const targetIndex = currentAyahIndex < ayahs.length ? currentAyahIndex : 0;
          setCurrentAyahIndex(targetIndex);
          setCurrentRepeatIteration(1);
          if (ayahs.length > 0) {
            setupAyahWords(ayahs[targetIndex]);
          }
        }
      } catch (err) {
        console.warn("Failed to load Surah data:", err);
        showToast("⚠️ Could not load Surah. Please check internet connection.");
      } finally {
        if (isMounted) setLoadingAyahs(false);
      }
    };

    fetchSurah();
    return () => { 
      isMounted = false; 
      if (nextAyahTimeoutRef.current) clearTimeout(nextAyahTimeoutRef.current);
    };
  }, [selectedSurahNumber, selectedQari]);

  // Setup words for active ayah
  const setupAyahWords = useCallback((ayah: LoadedAyah) => {
    if (!ayah || !ayah.words) return;
    const initializedWords: AyahWord[] = ayah.words.map((w, i) => ({
      ...w,
      status: i === 0 ? 'active' : 'unrecited',
      detectedSpoken: undefined,
      problemReason: undefined,
      tajweedTip: undefined
    }));
    setCurrentWords(initializedWords);
    setActiveWordIndex(0);
    setIsAyahCompleted(false);
    setAutoAdvanceCountdown(null);
    setSpokenTranscript('');
    setSelectedProblemWord(null);
  }, []);

  const currentAyah = loadedAyahs[currentAyahIndex];

  // 2. Continuous Speech Recognition Engine (Tarteel Mode)
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari, or tap words to recite manually.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      recognition.maxAlternatives = 3;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimText += event.results[i][0].transcript + ' ';
        }

        const cleanSpeech = interimText.trim();
        setSpokenTranscript(cleanSpeech);

        if (cleanSpeech) {
          processSpokenChunk(cleanSpeech);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isListeningRef.current = false;
          showToast("⚠️ Microphone permission denied. Please enable mic in browser.");
        }
      };

      recognition.onend = () => {
        // Tarteel auto-reconnect: keep listening continuously unless user explicitly stopped it
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            // Restart after brief delay if busy
            setTimeout(() => {
              if (isListeningRef.current) {
                try { recognitionRef.current?.start(); } catch {}
              }
            }, 300);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      setupMicAudioVisualizer();
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [currentWords, activeWordIndex, isAyahCompleted]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
    }
    setMicVolumeLevel(0);
  }, []);

  // Process live spoken tokens against Quranic words (Word-by-word with Tarteel-style Problem Detection)
  const processSpokenChunk = (spokenText: string) => {
    if (!currentWords || currentWords.length === 0 || isAyahCompleted) return;

    const normalizedSpoken = normalizeArabic(spokenText);
    const spokenTokens = normalizedSpoken.split(/\s+/).filter(Boolean);

    if (spokenTokens.length === 0) return;

    let pointer = activeWordIndex;
    const updated = [...currentWords];
    let mistakeFound = false;

    // Strictness threshold
    const matchThreshold = strictnessLevel === 'strict' ? 0.78 : strictnessLevel === 'forgiving' ? 0.55 : 0.65;

    for (const token of spokenTokens) {
      if (pointer >= updated.length) break;

      const currentExpected = updated[pointer].normalized;
      const similarity = calculateSimilarity(currentExpected, token);

      // Check if matches the current active word
      if (similarity >= matchThreshold || currentExpected.startsWith(token) || token.startsWith(currentExpected) || currentExpected === token) {
        updated[pointer] = {
          ...updated[pointer],
          status: 'correct',
          detectedSpoken: token,
          problemReason: undefined,
          tajweedTip: undefined
        };
        pointer++;
        if (pointer < updated.length) {
          updated[pointer] = { ...updated[pointer], status: 'active' };
        }
      } else {
        // Look ahead: Did the user accidentally skip this word and recite the next word?
        let lookAheadMatch = -1;
        for (let next = pointer + 1; next < Math.min(pointer + 3, updated.length); next++) {
          const nextExpected = updated[next].normalized;
          if (calculateSimilarity(nextExpected, token) >= matchThreshold || nextExpected.startsWith(token)) {
            lookAheadMatch = next;
            break;
          }
        }

        if (lookAheadMatch !== -1) {
          // Highlight skipped word(s) in RED
          for (let s = pointer; s < lookAheadMatch; s++) {
            const problem = getTajweedProblemAnalysis(updated[s].arabic, token);
            updated[s] = {
              ...updated[s],
              status: 'mistake',
              problemReason: 'Word Skipped / Missed in Recitation',
              tajweedTip: problem.tip,
              detectedSpoken: '(Skipped)'
            };

            // Log problem
            setMistakesLog(prev => [
              {
                id: `mistake_${Date.now()}_${s}`,
                wordIndex: s,
                expectedWord: updated[s].arabic,
                spokenWord: '(Skipped in flow)',
                problemReason: 'Word Skipped',
                tajweedTip: problem.tip,
                ayahNumberInSurah: currentAyah?.numberInSurah || 1,
                surahNumber: selectedSurahNumber,
                surahName: selectedSurahMeta.englishName,
                timestamp: Date.now()
              },
              ...prev.slice(0, 24)
            ]);
          }

          // Mark the matched word as correct
          updated[lookAheadMatch] = {
            ...updated[lookAheadMatch],
            status: 'correct',
            detectedSpoken: token
          };

          pointer = lookAheadMatch + 1;
          if (pointer < updated.length) {
            updated[pointer] = { ...updated[pointer], status: 'active' };
          }
          mistakeFound = true;
        } else if (token.length >= 3) {
          // Mispronounced / Problem Word Detected (Highlight in RED!)
          const problem = getTajweedProblemAnalysis(updated[pointer].arabic, token);
          updated[pointer] = {
            ...updated[pointer],
            status: 'mistake',
            problemReason: problem.reason,
            tajweedTip: problem.tip,
            detectedSpoken: token
          };

          playAudioChime('mistake');

          setMistakesLog(prev => [
            {
              id: `mistake_${Date.now()}_${pointer}`,
              wordIndex: pointer,
              expectedWord: updated[pointer].arabic,
              spokenWord: token,
              problemReason: problem.reason,
              tajweedTip: problem.tip,
              ayahNumberInSurah: currentAyah?.numberInSurah || 1,
              surahNumber: selectedSurahNumber,
              surahName: selectedSurahMeta.englishName,
              timestamp: Date.now()
            },
            ...prev.slice(0, 24)
          ]);

          mistakeFound = true;
        }
      }
    }

    setActiveWordIndex(pointer);
    setCurrentWords(updated);

    // Ayah Completion Verification (All words completed or last word reached)
    const verifiedWordsCount = updated.filter(w => w.status === 'correct').length;
    const isCompletedNow = pointer >= updated.length || verifiedWordsCount === updated.length;

    if (isCompletedNow && !isAyahCompleted) {
      handleAyahCompletionSuccess();
    }
  };

  // Handle Ayah Completion Success & Auto Advance in Strict Quran Order
  const handleAyahCompletionSuccess = useCallback(() => {
    setIsAyahCompleted(true);
    addHasanat(20);
    setSessionCompletedAyahs(prev => prev + 1);
    setSessionHasanat(prev => prev + 20);

    // Check repeat drills
    if (repeatCountSetting > 1 && currentRepeatIteration < repeatCountSetting) {
      const nextIteration = currentRepeatIteration + 1;
      setCurrentRepeatIteration(nextIteration);
      playAudioChime('success');
      showToast(`✨ Ayah completed! Repeat drill ${nextIteration} of ${repeatCountSetting}`);
      setTimeout(() => {
        if (currentAyah) {
          setupAyahWords(currentAyah);
        }
      }, 800);
      return;
    }

    // Reset repeat counter
    setCurrentRepeatIteration(1);

    const isLastAyahOfSurah = currentAyahIndex >= loadedAyahs.length - 1;

    if (isLastAyahOfSurah) {
      playAudioChime('surahComplete');
      addHasanat(100);
      setSessionHasanat(prev => prev + 100);
      showToast(`🏆 Alhamdulillah! Surah ${selectedSurahMeta.englishName} completed! (+100 Hasanat)`);
    } else {
      playAudioChime('success');
      showToast("MashAllah! Ayah verified! +20 Hasanat ✨");
    }

    // Continuous Hands-free flow: smoothly auto-switch to next verse / next surah and keep mic listening!
    if (continuousHandsFree) {
      let count = Math.max(1, autoAdvanceDelay);
      setAutoAdvanceCountdown(count);

      if (nextAyahTimeoutRef.current) clearTimeout(nextAyahTimeoutRef.current);

      const interval = setInterval(() => {
        count--;
        if (count > 0) {
          setAutoAdvanceCountdown(count);
        } else {
          clearInterval(interval);
          setAutoAdvanceCountdown(null);
          playAudioChime('advance');
          
          if (!isLastAyahOfSurah) {
            // STRICT QURAN ORDER: Advance to next verse in current surah
            const nextIdx = currentAyahIndex + 1;
            setCurrentAyahIndex(nextIdx);
            setupAyahWords(loadedAyahs[nextIdx]);
            if (isListeningRef.current) {
              setSpokenTranscript('');
            }
          } else if (strictQuranOrder && selectedSurahNumber < 114) {
            // STRICT QURAN ORDER: Auto-advance to the NEXT SURAH in the Quran!
            const nextSurahNum = selectedSurahNumber + 1;
            setSelectedSurahNumber(nextSurahNum);
            setCurrentAyahIndex(0);
            showToast(`📖 Continuing in Strict Order: Opening Surah ${nextSurahNum} (${SURAH_LIST[nextSurahNum - 1]?.englishName})`);
          }
        }
      }, 1000);

      nextAyahTimeoutRef.current = interval;
    }
  }, [
    currentAyahIndex, 
    loadedAyahs, 
    repeatCountSetting, 
    currentRepeatIteration, 
    selectedSurahMeta, 
    continuousHandsFree, 
    autoAdvanceDelay, 
    strictQuranOrder, 
    selectedSurahNumber, 
    currentAyah, 
    setupAyahWords, 
    addHasanat
  ]);

  // Cancel auto advance countdown (if user wants to pause / review)
  const cancelAutoAdvance = () => {
    if (nextAyahTimeoutRef.current) clearTimeout(nextAyahTimeoutRef.current);
    setAutoAdvanceCountdown(null);
    showToast("Auto-switch paused. Take your time to review.");
  };

  // Manual word tap: inspect problem, retry word, or toggle status
  const handleWordClick = (word: AyahWord) => {
    if (word.status === 'mistake') {
      setSelectedProblemWord(word);
    } else if (word.status === 'correct') {
      // Toggle back to unrecited if user wants to re-test
      const updated = [...currentWords];
      updated[word.index] = { ...updated[word.index], status: 'unrecited', detectedSpoken: undefined };
      setCurrentWords(updated);
      setActiveWordIndex(word.index);
    } else {
      // Mark as correct
      const updated = [...currentWords];
      updated[word.index] = { ...updated[word.index], status: 'correct' };
      setCurrentWords(updated);
      const nextUnrecited = updated.findIndex((w, i) => i > word.index && w.status !== 'correct');
      if (nextUnrecited !== -1) {
        setActiveWordIndex(nextUnrecited);
        updated[nextUnrecited].status = 'active';
      } else {
        setActiveWordIndex(updated.length);
        handleAyahCompletionSuccess();
      }
    }
  };

  // Pass current active word (if speech recognition had background noise)
  const handlePassActiveWord = () => {
    if (activeWordIndex < currentWords.length) {
      const updated = [...currentWords];
      updated[activeWordIndex] = { ...updated[activeWordIndex], status: 'correct' };
      const nextIdx = activeWordIndex + 1;
      if (nextIdx < updated.length) {
        updated[nextIdx] = { ...updated[nextIdx], status: 'active' };
      }
      setCurrentWords(updated);
      setActiveWordIndex(nextIdx);
      if (nextIdx >= updated.length) {
        handleAyahCompletionSuccess();
      }
    }
  };

  // Retry problem word
  const handleRetryProblemWord = (word: AyahWord) => {
    const updated = [...currentWords];
    updated[word.index] = {
      ...updated[word.index],
      status: 'active',
      problemReason: undefined,
      tajweedTip: undefined,
      detectedSpoken: undefined
    };
    setCurrentWords(updated);
    setActiveWordIndex(word.index);
    setSelectedProblemWord(null);
    showToast(`Ready to re-recite "${word.arabic}"`);
  };

  // Manual Next / Prev Navigation in Strict Quran Order
  const handleNextAyah = () => {
    if (nextAyahTimeoutRef.current) clearTimeout(nextAyahTimeoutRef.current);
    if (currentAyahIndex < loadedAyahs.length - 1) {
      const nextIdx = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIdx);
      setCurrentRepeatIteration(1);
      setupAyahWords(loadedAyahs[nextIdx]);
      if (isPlayingQari) {
        playQariAyah(loadedAyahs[nextIdx]);
      }
    } else if (strictQuranOrder && selectedSurahNumber < 114) {
      // Transition to next Surah in strict Quran order
      setSelectedSurahNumber(selectedSurahNumber + 1);
      setCurrentAyahIndex(0);
      showToast(`Advancing to Surah ${selectedSurahNumber + 1} in Strict Order`);
    } else {
      showToast("Alhamdulillah! Full Quran cycle reached! 🏆");
    }
  };

  const handlePrevAyah = () => {
    if (nextAyahTimeoutRef.current) clearTimeout(nextAyahTimeoutRef.current);
    if (currentAyahIndex > 0) {
      const prevIdx = currentAyahIndex - 1;
      setCurrentAyahIndex(prevIdx);
      setCurrentRepeatIteration(1);
      setupAyahWords(loadedAyahs[prevIdx]);
    } else if (strictQuranOrder && selectedSurahNumber > 1) {
      setSelectedSurahNumber(selectedSurahNumber - 1);
      setCurrentAyahIndex(0);
      showToast(`Previous Surah ${selectedSurahNumber - 1}`);
    }
  };

  // Play Qari Reference Audio
  const playQariAyah = (ayah?: LoadedAyah) => {
    const targetAyah = ayah || currentAyah;
    if (!targetAyah) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(targetAyah.audioUrl);
    audio.playbackRate = playbackSpeed;
    audioRef.current = audio;

    audio.onplay = () => setIsPlayingQari(true);
    audio.onended = () => {
      setIsPlayingQari(false);
      // Auto repeat if set
      if (repeatCountSetting > 1 && currentRepeatIteration < repeatCountSetting) {
        setCurrentRepeatIteration(prev => prev + 1);
        playQariAyah(targetAyah);
      }
    };

    audio.play().catch(e => console.warn("Audio playback error:", e));
  };

  const stopQariAyah = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingQari(false);
  };

  // Mic visualizer setup
  const setupMicAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;
        setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        if (isListeningRef.current) {
          requestAnimationFrame(updateVolume);
        }
      };
      updateVolume();
    } catch (e) {
      console.warn("Audio visualizer fallback:", e);
    }
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isListening) stopListening();
        else startListening();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextAyah();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevAyah();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (isPlayingQari) stopQariAyah();
        else playQariAyah();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (currentAyah) setupAyahWords(currentAyah);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isPlayingQari, currentAyah, handleNextAyah, handlePrevAyah, startListening, stopListening, setupAyahWords]);

  const correctCount = currentWords.filter(w => w.status === 'correct').length;
  const mistakeCount = currentWords.filter(w => w.status === 'mistake').length;
  const progressPercent = currentWords.length > 0 ? Math.round((correctCount / currentWords.length) * 100) : 0;
  const surahProgressPercent = loadedAyahs.length > 0 ? Math.round(((currentAyahIndex + 1) / loadedAyahs.length) * 100) : 0;

  return (
    <div className="min-h-screen pb-32 text-white bg-radial-gradient">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-emerald-500 text-black font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-300 backdrop-blur-md"
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK SURAH & JUZ PICKER MODAL (Strict Chronological Order 1 to 114) */}
      <AnimatePresence>
        {showSurahPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowSurahPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/15 rounded-[2.5rem] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Strict Mushaf Sequence</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">114 Surahs • 30 Juz</span>
                  </div>
                  <h3 className="text-xl font-black text-white">Select Quran Point in Strict Order</h3>
                </div>
                <button
                  onClick={() => setShowSurahPicker(false)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Tabs: Surah vs Juz */}
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <button
                  onClick={() => setSurahPickerTab('surahs')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    surahPickerTab === 'surahs'
                      ? 'bg-amber-400 text-black font-black shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  114 Surahs (Sequential 1→114)
                </button>
                <button
                  onClick={() => setSurahPickerTab('juz')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    surahPickerTab === 'juz'
                      ? 'bg-amber-400 text-black font-black shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  30 Juz (Juz 1 to Juz 30)
                </button>
              </div>

              {/* Search Bar */}
              {surahPickerTab === 'surahs' && (
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Surah (e.g. Baqarah, Yasin, Mulk, 36, Kahf)..."
                    value={surahSearchQuery}
                    onChange={(e) => setSurahSearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-all"
                    autoFocus
                  />
                </div>
              )}

              {/* Surah List Grid */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[50vh] custom-scrollbar">
                {surahPickerTab === 'surahs' ? (
                  filteredSurahs.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => {
                        setSelectedSurahNumber(s.number);
                        setCurrentAyahIndex(0);
                        setShowSurahPicker(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                        s.number === selectedSurahNumber
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                          : 'bg-white/[0.02] hover:bg-white/[0.08] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black font-mono ${
                          s.number === selectedSurahNumber ? 'bg-amber-400 text-black' : 'bg-white/10 text-amber-300'
                        }`}>
                          {s.number}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{s.englishName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({s.numberOfAyahs} Ayahs)</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{s.englishNameTranslation} • {s.revelationType}</span>
                        </div>
                      </div>

                      <span className="text-xl font-serif text-amber-300">{s.name}</span>
                    </button>
                  ))
                ) : (
                  // Juz List Grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {JUZ_LIST.map((j) => (
                      <button
                        key={j.index}
                        onClick={() => {
                          const firstSurahNumber = j.startSurah || j.surahs?.[0]?.surahNumber || 1;
                          setSelectedSurahNumber(firstSurahNumber);
                          setCurrentAyahIndex(0);
                          setShowSurahPicker(false);
                          showToast(`Opened Juz ${j.index} in Strict Quran Order`);
                        }}
                        className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/10 border border-white/5 text-left flex items-center justify-between cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xs font-mono font-bold">
                            {j.index}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{j.nameTransliteration || `Juz ${j.index}`}</p>
                            <p className="text-[10px] text-slate-400 font-serif">{j.nameArabic}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">Juz {j.index}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHORTCUTS HELP MODAL */}
      <AnimatePresence>
        {showShortcutsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowShortcutsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Keyboard size={18} className="text-amber-400" />
                  <span>Hands-Free Keyboard Shortcuts</span>
                </h3>
                <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white">
                  <XCircle size={18} />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { key: 'Space', desc: 'Toggle Live Microphone On / Off' },
                  { key: '→ (Right Arrow)', desc: 'Next Ayah in Strict Quran Order' },
                  { key: '← (Left Arrow)', desc: 'Previous Ayah in Quran' },
                  { key: 'P', desc: 'Play / Pause Qari Reference Audio' },
                  { key: 'R', desc: 'Reset & Re-recite Active Verse' }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-slate-300">{s.desc}</span>
                    <kbd className="px-2 py-1 rounded bg-black/60 border border-white/20 text-amber-300 font-mono text-[10px] font-bold">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* TOP HEADER & BRAND BAR */}
        <div className="glass-panel p-6 sm:p-8 rounded-[3rem] border-white/10 bg-gradient-to-r from-brand-sidebar via-brand-depth to-black/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <button
              onClick={onBack}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer shadow-lg"
              title="Return to Main Menu"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <Brain size={12} className="text-amber-400" /> Aliyah Memorise AI
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Zap size={10} /> Auto-Switching Hands-Free
                </span>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ListOrdered size={10} /> Strict Quran Order (1→114)
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white italic tracking-tight flex items-center gap-2">
                <span>Aliyah</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400">Strict Quran Memorisation</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Follows strict Mushaf sequence. Recite continuously — Aliyah highlights errors in red and auto-advances to the next verse hands-free.
              </p>
            </div>
          </div>

          {/* Quick Stats & Surah Quick Switcher */}
          <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
            {/* Hasanat pill */}
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              <div>
                <p className="text-[9px] text-amber-300/80 font-black uppercase">Session Earned</p>
                <p className="text-xs font-mono font-bold text-amber-300">+{sessionHasanat} Hasanat</p>
              </div>
            </div>

            {/* Completed Ayahs pill */}
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <div>
                <p className="text-[9px] text-emerald-300/80 font-black uppercase">Verses Mastered</p>
                <p className="text-xs font-mono font-bold text-emerald-300">{sessionCompletedAyahs} Ayahs</p>
              </div>
            </div>

            {/* Quick Surah Picker Button */}
            <button
              onClick={() => setShowSurahPicker(true)}
              className="bg-black/80 hover:bg-slate-900 border border-amber-500/40 rounded-2xl py-3 px-4 text-xs font-bold text-white flex items-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              <BookOpen size={14} className="text-amber-400" />
              <span>{selectedSurahNumber}. {selectedSurahMeta.englishName}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* STRICT QURAN ORDER BREADCRUMB & SURAH PROGRESS BAR */}
        <div className="glass-panel p-4 sm:p-5 rounded-3xl border-white/10 bg-black/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2 font-mono flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Surah {selectedSurahNumber} of 114
              </span>
              <span className="text-slate-400">→</span>
              <span className="font-bold text-white">
                {selectedSurahMeta.englishName} ({selectedSurahMeta.name})
              </span>
              <span className="text-slate-400">→</span>
              <span className="text-emerald-400 font-bold">
                Ayah {currentAyahIndex + 1} of {loadedAyahs.length}
              </span>
              {currentAyah?.juzNumber && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-cyan-300 text-[11px]">Juz {currentAyah.juzNumber}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="View Keyboard Shortcuts"
              >
                <Keyboard size={13} />
                <span>Shortcuts</span>
              </button>

              <div className="flex items-center gap-1.5">
                <span>Strict Order:</span>
                <button
                  onClick={() => setStrictQuranOrder(!strictQuranOrder)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase transition-all ${
                    strictQuranOrder ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-white/10 text-slate-400'
                  }`}
                  title="When active, completing the last ayah automatically opens the next Surah"
                >
                  {strictQuranOrder ? 'ACTIVE (1→114)' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Surah completion bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Surah Progress ({currentAyahIndex + 1}/{loadedAyahs.length} Ayahs)</span>
              <span>{surahProgressPercent}%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${surahProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* TARTEEL ENGINE SETTINGS & MEMORISATION MODES BAR */}
        <div className="glass-panel p-5 rounded-3xl border-white/10 bg-black/50 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Memorisation Mode Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Hifz Mode:</span>
              
              <button
                onClick={() => setHifzMode('follow')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  hifzMode === 'follow'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
                title="Full text visible with real-time live recitation tracking"
              >
                <Eye size={13} />
                <span>Follow & Recite</span>
              </button>

              <button
                onClick={() => setHifzMode('blind')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  hifzMode === 'blind'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
                title="Words are blurred until you recite them correctly from pure memory"
              >
                <EyeOff size={13} />
                <span>Blind Hifz (Blurred)</span>
              </button>

              <button
                onClick={() => setHifzMode('firstLetter')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  hifzMode === 'firstLetter'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
                title="Only first letter of each word shown as an active memory prompt"
              >
                <Sparkle size={13} />
                <span>First Letter Hints</span>
              </button>

              <button
                onClick={() => setHifzMode('vanishing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  hifzMode === 'vanishing'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
                title="Words dissolve as you recite them correctly"
              >
                <Wand2 size={13} />
                <span>Vanishing Mushaf</span>
              </button>
            </div>

            {/* Auto-Advance Speed & Hands-free Switch */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setContinuousHandsFree(!continuousHandsFree)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  continuousHandsFree
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
                title="Automatically advance to the next Ayah upon completing recitation and keep mic listening"
              >
                <Zap size={14} className={continuousHandsFree ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
                <span>Hands-Free Auto-Next: <strong>{continuousHandsFree ? 'ON' : 'OFF'}</strong></span>
              </button>

              {/* Delay Speed selector */}
              {continuousHandsFree && (
                <select
                  value={autoAdvanceDelay}
                  onChange={(e) => setAutoAdvanceDelay(Number(e.target.value))}
                  className="bg-black/80 border border-white/10 rounded-xl py-2 px-2.5 text-[11px] font-mono text-amber-300 outline-none cursor-pointer"
                  title="Auto-advance delay after verse completion"
                >
                  <option value={1}>Delay: 1s</option>
                  <option value={2}>Delay: 2s</option>
                  <option value={3}>Delay: 3s</option>
                </select>
              )}

              {/* Repeat Drill Selector */}
              <select
                value={repeatCountSetting}
                onChange={(e) => setRepeatCountSetting(Number(e.target.value))}
                className="bg-black/80 border border-white/10 rounded-xl py-2 px-2.5 text-[11px] font-mono text-slate-300 outline-none cursor-pointer"
                title="Number of times to repeat verse before advancing"
              >
                <option value={1}>Repeat: 1x</option>
                <option value={3}>Repeat: 3x Drill</option>
                <option value={5}>Repeat: 5x Drill</option>
                <option value={7}>Repeat: 7x Drill</option>
              </select>

              {/* Qari Selector */}
              <select
                value={selectedQari}
                onChange={(e) => setSelectedQari(e.target.value)}
                className="bg-black/80 border border-white/10 rounded-xl py-2 px-2.5 text-[11px] font-bold text-amber-300 outline-none cursor-pointer"
                title="Select Reciter Audio Guide"
              >
                {QARI_OPTIONS.map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MAIN HIFZ RECITER & SACRED AYAH CARD */}
        {loadingAyahs ? (
          <div className="glass-panel p-16 rounded-[3rem] border-white/10 text-center space-y-4">
            <RefreshCw className="animate-spin text-amber-400 mx-auto" size={32} />
            <p className="text-sm font-bold text-slate-300">Loading Sacred Surah {selectedSurahNumber} ({selectedSurahMeta.englishName})...</p>
          </div>
        ) : currentAyah ? (
          <div className="glass-panel p-6 sm:p-10 rounded-[3rem] border-white/10 bg-gradient-to-b from-black/80 via-brand-depth/60 to-black/95 shadow-2xl space-y-8 relative overflow-hidden">
            
            {/* Ayah Navigation & Strict Sequence Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 shadow-md">
                    Surah {selectedSurahMeta.number}. {selectedSurahMeta.name} • Ayah {currentAyah.numberInSurah} of {loadedAyahs.length}
                  </span>
                  <span className="text-slate-400 text-xs font-mono">
                    Global Verse #{currentAyah.number}
                  </span>
                  {repeatCountSetting > 1 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      Drill: {currentRepeatIteration} / {repeatCountSetting}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>{selectedSurahMeta.englishName}</span>
                  <span className="text-xs text-amber-400 font-normal">({selectedSurahMeta.englishNameTranslation})</span>
                </h3>
              </div>

              {/* Prev / Next Buttons in Strict Quran Order */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevAyah}
                  disabled={currentAyahIndex === 0 && selectedSurahNumber === 1}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/10"
                  title="Previous Verse in Strict Sequence (Left Arrow)"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="px-4 py-2 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono font-bold text-amber-400">
                  Ayah {currentAyahIndex + 1} / {loadedAyahs.length}
                </div>

                <button
                  onClick={handleNextAyah}
                  disabled={currentAyahIndex === loadedAyahs.length - 1 && selectedSurahNumber === 114}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer border border-white/10"
                  title="Next Verse in Strict Sequence (Right Arrow)"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* ARABIC WORDS DISPLAY AREA (Word-by-word interactive highlighting with Tarteel Red Alert) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 px-2 flex-wrap gap-2">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  {isListening ? (
                    <span className="text-emerald-400 font-bold">🎤 Microphone live: Recite verse now...</span>
                  ) : (
                    <span>Tap microphone below or tap individual words to verify recitation:</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePassActiveWord}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold border border-white/10 cursor-pointer"
                    title="Skip/Pass current word if already spoken softly"
                  >
                    Pass Current Word ⏭
                  </button>

                  <span className="text-amber-400 font-medium font-mono">
                    {correctCount} / {currentWords.length} Words ({progressPercent}%)
                  </span>
                </div>
              </div>

              {/* Quran Words Container */}
              <div 
                ref={wordsContainerRef}
                className="p-8 sm:p-14 rounded-3xl bg-black/70 border border-white/10 flex flex-wrap flex-row-reverse items-center justify-center gap-4 sm:gap-6 min-h-[220px] text-right shadow-inner"
                dir="rtl"
              >
                {currentWords.map((word, wIdx) => {
                  const isCorrect = word.status === 'correct';
                  const isActive = word.status === 'active';
                  const isMistake = word.status === 'mistake';

                  return (
                    <motion.button
                      key={word.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordClick(word)}
                      className={`px-5 py-4 rounded-2xl text-3xl sm:text-5xl font-serif transition-all cursor-pointer relative select-none group leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-500/25 text-emerald-300 border-2 border-emerald-400 shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-400/50'
                          : isMistake
                          ? 'bg-rose-600/40 text-rose-100 border-2 border-rose-500 shadow-2xl shadow-rose-500/40 ring-4 ring-rose-500/50 animate-pulse'
                          : isActive
                          ? 'bg-amber-500/30 text-amber-300 border-2 border-amber-400 shadow-2xl shadow-amber-500/40 animate-pulse scale-105 ring-2 ring-amber-400/60'
                          : 'bg-white/[0.04] text-white/90 hover:bg-white/15 border border-white/10'
                      }`}
                    >
                      {/* Word text rendering based on Hifz mode */}
                      {hifzMode === 'blind' && !isCorrect ? (
                        <span className="filter blur-lg select-none opacity-20 transition-all">{word.arabic}</span>
                      ) : hifzMode === 'firstLetter' && !isCorrect ? (
                        <span className="font-mono text-cyan-300 font-black tracking-widest text-2xl sm:text-3xl">
                          {word.firstLetter}...
                        </span>
                      ) : hifzMode === 'vanishing' && isCorrect ? (
                        <span className="opacity-0">{word.arabic}</span>
                      ) : (
                        <span>{word.arabic}</span>
                      )}

                      {/* Correct Status Badge */}
                      {isCorrect && (
                        <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-400 text-black flex items-center justify-center text-xs font-black shadow-lg">
                          ✓
                        </span>
                      )}

                      {/* Problem / Mistake Status Badge (Tarteel Red Alert) */}
                      {isMistake && (
                        <span className="absolute -top-3 -right-3 px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-black uppercase tracking-wider shadow-2xl border border-rose-300 animate-bounce">
                          ⚠️ Fix Error
                        </span>
                      )}

                      {/* Active Cursor Indicator */}
                      {isActive && !isCorrect && !isMistake && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400 animate-ping" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Translation Display */}
              {showTranslation && (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Sahih International Translation</p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    "{currentAyah.translation}"
                  </p>
                </div>
              )}
            </div>

            {/* TARTEEL PROBLEM DIAGNOSTIC SHEET (When a problem word is selected or highlighted) */}
            <AnimatePresence>
              {selectedProblemWord && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/90 via-black to-rose-950/90 border-2 border-rose-500 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertTriangle size={20} />
                      <h4 className="text-sm font-black uppercase tracking-wider">Recitation Problem Diagnostic</h4>
                    </div>
                    <button
                      onClick={() => setSelectedProblemWord(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1">
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Expected Quranic Word</p>
                      <p className="text-3xl font-serif text-white">{selectedProblemWord.arabic}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 space-y-1">
                      <p className="text-[10px] text-rose-400 uppercase font-mono">What Was Spoken / Issue</p>
                      <p className="text-base font-bold text-rose-200">{selectedProblemWord.detectedSpoken || 'Mispronounced / Skipped'}</p>
                      <p className="text-xs text-rose-300">{selectedProblemWord.problemReason || 'Letter articulation or timing issue'}</p>
                    </div>
                  </div>

                  {selectedProblemWord.tajweedTip && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                      <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{selectedProblemWord.tajweedTip}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => playQariAyah()}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 size={14} />
                      <span>Hear Qari Recite</span>
                    </button>

                    <button
                      onClick={() => handleRetryProblemWord(selectedProblemWord)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} />
                      <span>Retry Word</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AYAH COMPLETED CELEBRATION & AUTO-ADVANCE BANNER */}
            <AnimatePresence>
              {isAyahCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/25 via-emerald-600/35 to-amber-500/25 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3.5 text-emerald-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-black flex items-center justify-center font-black text-xl shadow-lg">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">Ayah Recited Completely & Verified!</h4>
                      <p className="text-xs text-emerald-300">BarakAllahu Feek! +20 Hasanat recorded.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {autoAdvanceCountdown !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-300 bg-black/60 px-4 py-2 rounded-xl border border-amber-500/40 animate-pulse flex items-center gap-1.5">
                          <Clock size={14} /> Auto-switching in {autoAdvanceCountdown}s...
                        </span>
                        <button
                          onClick={cancelAutoAdvance}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded-xl font-bold transition-all cursor-pointer"
                        >
                          Pause
                        </button>
                      </div>
                    ) : null}

                    <button
                      onClick={handleNextAyah}
                      className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl cursor-pointer flex items-center gap-2"
                    >
                      <span>Next Verse Now</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MICROPHONE & AUDIO RECITER CONTROL DOCK */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/80 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Qari Audio Reference Player */}
                <div className="flex items-center gap-3.5">
                  <button
                    onClick={() => isPlayingQari ? stopQariAyah() : playQariAyah()}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                      isPlayingQari
                        ? 'bg-amber-400 text-black shadow-amber-400/40'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                    title={isPlayingQari ? 'Pause Qari Recitation' : 'Listen to Qari reference (P)'}
                  >
                    {isPlayingQari ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
                  </button>

                  <div>
                    <p className="text-sm font-bold text-white">
                      {QARI_OPTIONS.find(q => q.id === selectedQari)?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Audio Guide • Ayah {currentAyah.numberInSurah}</p>
                  </div>

                  {/* Speed Selector */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-black/60 border border-white/15 rounded-xl py-1.5 px-2.5 text-[10px] font-mono text-slate-300 outline-none cursor-pointer"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1.0}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                  </select>
                </div>

                {/* Primary Mic Button (Aliyah Live Recite Engine) */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-3 cursor-pointer shadow-2xl ${
                      isListening
                        ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/50 ring-2 ring-rose-400'
                        : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black shadow-amber-500/30 hover:scale-105'
                    }`}
                    title="Toggle Live Microphone (Spacebar)"
                  >
                    {isListening ? (
                      <>
                        <MicOff size={18} />
                        <span>Stop Listening</span>
                      </>
                    ) : (
                      <>
                        <Mic size={18} />
                        <span>Start Reciting (Live Mic)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setupAyahWords(currentAyah)}
                    className="p-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl transition-all cursor-pointer border border-white/10"
                    title="Reset Ayah Progress (R)"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>

              {/* Live Mic Transcript & Audio Waveform Level */}
              {isListening && (
                <div className="p-4 rounded-2xl bg-black/70 border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="flex items-center gap-2 text-amber-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      Listening live in Arabic to your recitation...
                    </span>
                    <span className="font-mono text-slate-400">Mic Level: {micVolumeLevel}%</span>
                  </div>

                  {/* Audio visualizer bar */}
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 h-full transition-all duration-75"
                      style={{ width: `${Math.max(8, micVolumeLevel)}%` }}
                    />
                  </div>

                  {spokenTranscript && (
                    <div className="p-2.5 rounded-xl bg-white/5 text-right font-serif text-sm text-slate-200" dir="rtl">
                      "{spokenTranscript}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FULL SURAH AYAH RIBBON (Strict Sequence Navigation Strip) */}
            {showAyahRibbon && loadedAyahs.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-400 flex items-center gap-1.5">
                    <ListOrdered size={12} /> Surah {selectedSurahMeta.name} Ayah Sequence (Strict Order):
                  </span>
                  <span>Tap any verse to jump directly:</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar">
                  {loadedAyahs.map((ayah, aIdx) => {
                    const isCurrent = aIdx === currentAyahIndex;
                    const isPassed = aIdx < currentAyahIndex;

                    return (
                      <button
                        key={ayah.number}
                        onClick={() => {
                          if (nextAyahTimeoutRef.current) clearTimeout(nextAyahTimeoutRef.current);
                          setCurrentAyahIndex(aIdx);
                          setCurrentRepeatIteration(1);
                          setupAyahWords(ayah);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 cursor-pointer border ${
                          isCurrent
                            ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/30 scale-105'
                            : isPassed
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                        }`}
                      >
                        {isPassed ? `✓ ${ayah.numberInSurah}` : `Ayah ${ayah.numberInSurah}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RECITER MISTAKES & RECENT PROBLEMS LOG */}
            {mistakesLog.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle size={14} className="text-rose-400" />
                    <span>Recitation Problems Highlighted ({mistakesLog.length})</span>
                  </h4>
                  <button
                    onClick={() => setMistakesLog([])}
                    className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear Log
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {mistakesLog.slice(0, 6).map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-rose-300 font-bold">{item.surahName} : Ayah {item.ayahNumberInSurah}</span>
                        <span className="text-slate-400 font-mono">{item.problemReason}</span>
                      </div>
                      <p className="text-base font-serif text-white">{item.expectedWord}</p>
                      <p className="text-[10px] text-slate-300 line-clamp-2">{item.tajweedTip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : null}

      </div>
    </div>
  );
}
