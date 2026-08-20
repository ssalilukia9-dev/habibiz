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
  BookOpen,
  Award,
  Flame,
  Search,
  ArrowLeft,
  Settings2,
  HelpCircle,
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
  ArrowRight,
  Infinity as InfinityIcon,
  Compass,
  Check,
  ChevronDown
} from 'lucide-react';
import { SURAH_LIST, RECITERS } from '../constants.ts';
import { FULL_JUZ_LIST } from '../data/juzData.ts';

interface AyahWord {
  id: string;
  arabic: string;
  normalized: string;
  status: 'unrecited' | 'active' | 'correct' | 'mistake' | 'skipped';
  transcription?: string;
  mistakeReason?: string;
  tajweedTip?: string;
}

interface LoadedAyah {
  number: number;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
  arabicText: string;
  translation: string;
  audioUrl?: string;
  words: AyahWord[];
}

interface MistakeLogItem {
  id: string;
  ayahNumber: number;
  surahName: string;
  wordIndex: number;
  expectedWord: string;
  spokenWord: string;
  tajweedTip: string;
  timestamp: Date;
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
    .replace(/[\u0600-\u0605\u06DD\u06DE\u06E9\u06D4\u060C\u061B\u061F\.,:;\(\)\[\]\{\}]/g, '')
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
  return 1 - distance / maxLen;
};

// Common Tajweed rules helper based on Arabic phonetic variations
const getTajweedRuleAdvice = (expected: string, spoken: string): string => {
  const normExp = normalizeArabic(expected);
  const normSpk = normalizeArabic(spoken);

  if (/[حخعغهء]/.test(normExp) && !/[حخعغهء]/.test(normSpk)) {
    return 'Check Throat Letter (Halaq): Pronounce letters like (ح, ع, خ) from their deep throat exit points (Makhraj).';
  }
  if (/[صضطظق]/.test(normExp)) {
    return 'Tafkheem (Full Mouth): Elevate the back of your tongue for heavy letters (ص, ض, ط, ظ, ق).';
  }
  if (/[قطبجد]/.test(normExp)) {
    return 'Qalqalah Bounce: Echo the sound slightly when stopping on letters of Qutb Jad (ق, ط, ب, ج, د).';
  }
  if (/[نم]/.test(normExp)) {
    return 'Ghunnah (Nasalization): Hold the nasal sound for 2 counts on Shaddah/Noon/Meem.';
  }
  return 'Phonetic Check: Recite clearly with distinct vowels (Fatha, Damma, Kasra) and correct letter stops.';
};

export default function HifzMemorizeView({
  onBack,
  addHasanat,
  isPremium = true,
  onShowPremium
}: HifzMemorizeViewProps) {
  // Navigation & Scope Selection: 'whole' (continuous through whole Quran), 'surah' (1-114), 'juz' (1-30)
  const [browseTab, setBrowseTab] = useState<'whole' | 'surah' | 'juz'>('whole');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1); // Default to Al-Fatihah
  const [selectedJuzIndex, setSelectedJuzIndex] = useState<number>(30); // Default to Juz 30
  const [searchFilter, setSearchFilter] = useState('');
  
  // App Modes:
  // 'reveal': Tarteel Reveal-On-Recite (Ayahs hidden, reveal word-by-word and ayah-by-ayah as you recite from memory)
  // 'corrector': Open Mushaf Follow-Along (all text visible with live green/red highlights)
  // 'review': Mistakes Revision Log
  const [mode, setMode] = useState<'reveal' | 'corrector' | 'review'>('reveal');
  const [strictness, setStrictness] = useState<'standard' | 'strict' | 'relaxed'>('standard');
  const [revealedAyahsCount, setRevealedAyahsCount] = useState(0); // Count of completely unveiled verses
  const [hintLevel, setHintLevel] = useState<number>(0); // 0 = no hint, 1 = first word hint, 2 = full peek

  // Content Data
  const [ayahs, setAyahs] = useState<LoadedAyah[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Speech Recognition & Tracking State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [activeAyahIndex, setActiveAyahIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [currentRecitedWord, setCurrentRecitedWord] = useState('');
  const [recentMatchFeedback, setRecentMatchFeedback] = useState<{
    type: 'correct' | 'mistake' | 'hint' | 'complete';
    message: string;
    word?: string;
  } | null>(null);

  // Statistics & Mistake Log
  const [mistakeLogs, setMistakeLogs] = useState<MistakeLogItem[]>([]);
  const [totalRecitedWords, setTotalRecitedWords] = useState(0);
  const [correctWordsCount, setCorrectWordsCount] = useState(0);
  const [hasanatEarnedSession, setHasanatEarnedSession] = useState(0);
  const [selectedWordTooltip, setSelectedWordTooltip] = useState<{
    word: AyahWord;
    ayahNumber: number;
    surahName: string;
  } | null>(null);

  // Per-Ayah Tafsir Only Reveal state (keeps Arabic script hidden)
  const [expandedTafsirAyahs, setExpandedTafsirAyahs] = useState<Record<number, boolean>>({});

  const toggleTafsir = (ayahNum: number) => {
    setExpandedTafsirAyahs(prev => ({
      ...prev,
      [ayahNum]: !prev[ayahNum]
    }));
  };

  // Qari Audio Reference
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioAyahIndex, setAudioAyahIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeAyahCardRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Quran Verses by Scope
  useEffect(() => {
    let isCancelled = false;
    const fetchQuranVerses = async () => {
      setIsLoading(true);
      setLoadError(null);
      stopAudio();

      try {
        let endpoint = '';
        let transEndpoint = '';

        if (browseTab === 'whole') {
          // Continuous Whole Quran mode starting at selectedSurahNumber (default 1)
          endpoint = `/api/proxy/alquran/surah/${selectedSurahNumber}/ar.alafasy`;
          transEndpoint = `/api/proxy/alquran/surah/${selectedSurahNumber}/en.sahih`;
        } else if (browseTab === 'surah') {
          endpoint = `/api/proxy/alquran/surah/${selectedSurahNumber}/ar.alafasy`;
          transEndpoint = `/api/proxy/alquran/surah/${selectedSurahNumber}/en.sahih`;
        } else {
          endpoint = `/api/proxy/alquran/juz/${selectedJuzIndex}/ar.alafasy`;
          transEndpoint = `/api/proxy/alquran/juz/${selectedJuzIndex}/en.sahih`;
        }

        const resArabic = await fetch(endpoint);
        const dataArabic = await resArabic.json();

        let transDataMap: Record<number, string> = {};
        try {
          const resTrans = await fetch(transEndpoint);
          const dataTrans = await resTrans.json();
          if (dataTrans?.data?.ayahs) {
            dataTrans.data.ayahs.forEach((a: any) => {
              transDataMap[a.number] = a.text;
            });
          }
        } catch (e) {
          console.warn("Translation load notice:", e);
        }

        if (isCancelled) return;

        if (dataArabic?.data?.ayahs) {
          const parsedAyahs: LoadedAyah[] = dataArabic.data.ayahs.map((a: any) => {
            const rawText: string = a.text || '';
            const rawWords = rawText.split(/\s+/).filter(w => w.trim().length > 0);
            
            const words: AyahWord[] = rawWords.map((wordStr, wIdx) => ({
              id: `${a.number}-${wIdx}`,
              arabic: wordStr,
              normalized: normalizeArabic(wordStr),
              status: 'unrecited'
            }));

            const targetSurahNum = a.surah?.number || (browseTab === 'juz' ? 1 : selectedSurahNumber);
            const surahInfo = SURAH_LIST.find(s => s.number === targetSurahNum);

            return {
              number: a.number,
              numberInSurah: a.numberInSurah,
              surahNumber: targetSurahNum,
              surahName: surahInfo?.englishName || a.surah?.englishName || `Surah ${targetSurahNum}`,
              arabicText: rawText,
              translation: transDataMap[a.number] || '',
              audioUrl: a.audio ? a.audio.replace(/^http:/, 'https:') : undefined,
              words
            };
          });

          setAyahs(parsedAyahs);
          setActiveAyahIndex(0);
          setActiveWordIndex(0);
          setRevealedAyahsCount(0);
          setHintLevel(0);
        } else {
          setLoadError('Failed to load sacred verses. Please check connection.');
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Error loading Quran data:", err);
          setLoadError('Unable to load Quran verses. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchQuranVerses();

    return () => {
      isCancelled = true;
      stopAudio();
    };
  }, [browseTab, selectedSurahNumber, selectedJuzIndex]);

  // Scroll active card smoothly into view
  useEffect(() => {
    if (activeAyahCardRef.current) {
      activeAyahCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeAyahIndex]);

  // Stop Audio helper
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
    setAudioAyahIndex(null);
  };

  // Play Reciter Audio for an Ayah
  const playAyahAudio = (ayahIdx: number) => {
    const targetAyah = ayahs[ayahIdx];
    if (!targetAyah?.audioUrl) return;

    if (isPlayingAudio && audioAyahIndex === ayahIdx) {
      stopAudio();
      return;
    }

    stopAudio();
    const audio = new Audio(targetAyah.audioUrl);
    audioRef.current = audio;
    setAudioAyahIndex(ayahIdx);
    setIsPlayingAudio(true);

    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioAyahIndex(null);
    };

    audio.onerror = () => {
      setIsPlayingAudio(false);
      setAudioAyahIndex(null);
    };

    audio.play().catch(() => {
      setIsPlayingAudio(false);
      setAudioAyahIndex(null);
    });
  };

  // Auto-advance to Next Surah in Continuous Whole Quran Mode
  const advanceToNextSurah = () => {
    if (selectedSurahNumber < 114) {
      const nextSurahNum = selectedSurahNumber + 1;
      setSelectedSurahNumber(nextSurahNum);
      setRecentMatchFeedback({
        type: 'complete',
        message: `✨ Surah Completed! Unveiling Surah ${SURAH_LIST[nextSurahNum - 1]?.englishName || nextSurahNum}...`
      });
    } else {
      setRecentMatchFeedback({
        type: 'complete',
        message: `🎉 Masha'Allah! You have completed recitation through the entire Quran!`
      });
    }
  };

  // 2. Speech Recognition Listener
  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
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
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interimStr = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcript + ' ';
          } else {
            interimStr += transcript;
          }
        }

        const activeTranscript = (finalStr + interimStr).trim();
        setSpeechTranscript(activeTranscript);

        if (activeTranscript) {
          processLiveSpeech(activeTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          alert("Microphone permission was denied. Please allow microphone access in your browser to recite.");
        }
      };

      recognition.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // 3. Real-Time Token Alignment & Unveiling Engine
  const processLiveSpeech = (spokenText: string) => {
    if (ayahs.length === 0 || activeAyahIndex >= ayahs.length) return;

    const currentAyah = ayahs[activeAyahIndex];
    if (!currentAyah || !currentAyah.words) return;

    const spokenTokens = spokenText.split(/\s+/).map(normalizeArabic).filter(Boolean);
    if (spokenTokens.length === 0) return;

    const latestSpoken = spokenTokens[spokenTokens.length - 1];
    setCurrentRecitedWord(latestSpoken);

    const threshold = strictness === 'strict' ? 0.82 : strictness === 'relaxed' ? 0.60 : 0.70;
    const currentExpectedWord = currentAyah.words[activeWordIndex];

    if (!currentExpectedWord) return;

    const similarity = calculateSimilarity(currentExpectedWord.normalized, latestSpoken);

    if (similarity >= threshold) {
      // ✅ MATCH: Correct word recited -> UNVEIL IT!
      setAyahs(prev => {
        const next = [...prev];
        const a = { ...next[activeAyahIndex] };
        const wList = [...a.words];
        wList[activeWordIndex] = {
          ...wList[activeWordIndex],
          status: 'correct',
          transcription: latestSpoken
        };
        a.words = wList;
        next[activeAyahIndex] = a;
        return next;
      });

      setCorrectWordsCount(prev => prev + 1);
      setTotalRecitedWords(prev => prev + 1);
      
      const letterHasanat = Math.max(10, currentExpectedWord.arabic.length * 10);
      addHasanat(letterHasanat);
      setHasanatEarnedSession(prev => prev + letterHasanat);

      setRecentMatchFeedback({
        type: 'correct',
        message: `✨ Unveiled: "${currentExpectedWord.arabic}" (+${letterHasanat} Hasanat)`,
        word: currentExpectedWord.arabic
      });

      // Advance to next word or complete Ayah
      if (activeWordIndex + 1 < currentAyah.words.length) {
        setActiveWordIndex(prev => prev + 1);
      } else {
        // Entire Ayah completely recited & unveiled!
        setRevealedAyahsCount(prev => prev + 1);

        if (activeAyahIndex + 1 < ayahs.length) {
          setActiveAyahIndex(prev => prev + 1);
          setActiveWordIndex(0);
          setHintLevel(0);
          setRecentMatchFeedback({
            type: 'complete',
            message: `🌟 Ayah ${currentAyah.numberInSurah} Revealed! Recite the next verse...`
          });
        } else {
          // Finished this Surah / Juz!
          if (browseTab === 'whole' && selectedSurahNumber < 114) {
            advanceToNextSurah();
          } else {
            setRecentMatchFeedback({
              type: 'complete',
              message: `🎉 Allahu Akbar! All verses in this section have been completely revealed!`
            });
          }
        }
      }
    } else {
      // Check if user skipped ahead
      const nextWord = currentAyah.words[activeWordIndex + 1];
      const nextSimilarity = nextWord ? calculateSimilarity(nextWord.normalized, latestSpoken) : 0;

      if (nextSimilarity >= threshold) {
        // Marked as skipped and reveal
        setAyahs(prev => {
          const next = [...prev];
          const a = { ...next[activeAyahIndex] };
          const wList = [...a.words];
          wList[activeWordIndex] = {
            ...wList[activeWordIndex],
            status: 'skipped',
            mistakeReason: 'Skipped word during recitation'
          };
          wList[activeWordIndex + 1] = {
            ...wList[activeWordIndex + 1],
            status: 'correct',
            transcription: latestSpoken
          };
          a.words = wList;
          next[activeAyahIndex] = a;
          return next;
        });

        const tip = 'Word skipped: Recite continuously without skipping Quranic words.';
        const newMistake: MistakeLogItem = {
          id: `mistake-${Date.now()}`,
          ayahNumber: currentAyah.numberInSurah,
          surahName: currentAyah.surahName,
          wordIndex: activeWordIndex,
          expectedWord: currentExpectedWord.arabic,
          spokenWord: '[Skipped]',
          tajweedTip: tip,
          timestamp: new Date()
        };

        setMistakeLogs(prev => [newMistake, ...prev.slice(0, 49)]);
        setTotalRecitedWords(prev => prev + 1);
        setActiveWordIndex(prev => prev + 2);

        setRecentMatchFeedback({
          type: 'mistake',
          message: `⚠️ Skipped word: "${currentExpectedWord.arabic}"`,
          word: currentExpectedWord.arabic
        });
      } else {
        // Mistake / mispronunciation
        if (latestSpoken.length >= 2) {
          const advice = getTajweedRuleAdvice(currentExpectedWord.arabic, latestSpoken);
          
          setAyahs(prev => {
            const next = [...prev];
            const a = { ...next[activeAyahIndex] };
            const wList = [...a.words];
            wList[activeWordIndex] = {
              ...wList[activeWordIndex],
              status: 'mistake',
              transcription: latestSpoken,
              tajweedTip: advice
            };
            a.words = wList;
            next[activeAyahIndex] = a;
            return next;
          });

          const newMistake: MistakeLogItem = {
            id: `mistake-${Date.now()}`,
            ayahNumber: currentAyah.numberInSurah,
            surahName: currentAyah.surahName,
            wordIndex: activeWordIndex,
            expectedWord: currentExpectedWord.arabic,
            spokenWord: latestSpoken,
            tajweedTip: advice,
            timestamp: new Date()
          };

          setMistakeLogs(prev => [newMistake, ...prev.slice(0, 49)]);
          setTotalRecitedWords(prev => prev + 1);

          setRecentMatchFeedback({
            type: 'mistake',
            message: `Try again: Expected "${currentExpectedWord.arabic}", heard "${latestSpoken}"`,
            word: currentExpectedWord.arabic
          });
        }
      }
    }
  };

  // Reset Session
  const handleResetSession = () => {
    stopListening();
    stopAudio();
    setActiveAyahIndex(0);
    setActiveWordIndex(0);
    setRevealedAyahsCount(0);
    setCorrectWordsCount(0);
    setTotalRecitedWords(0);
    setHasanatEarnedSession(0);
    setSpeechTranscript('');
    setRecentMatchFeedback(null);
    setSelectedWordTooltip(null);
    setHintLevel(0);

    setAyahs(prev => prev.map(a => ({
      ...a,
      words: a.words.map(w => ({
        ...w,
        status: 'unrecited',
        transcription: undefined,
        mistakeReason: undefined,
        tajweedTip: undefined
      }))
    })));
  };

  // Unveil Next Word Manually as a Hint
  const handleRevealNextWordHint = () => {
    if (ayahs.length === 0 || activeAyahIndex >= ayahs.length) return;
    const currentAyah = ayahs[activeAyahIndex];
    if (!currentAyah || !currentAyah.words) return;

    setHintLevel(1);
    const word = currentAyah.words[activeWordIndex];
    if (word) {
      setRecentMatchFeedback({
        type: 'hint',
        message: `💡 Hint: Next word starts with "${word.arabic.charAt(0)}..."`,
        word: word.arabic
      });
    }
  };

  // Accuracy calculation
  const accuracyPercentage = useMemo(() => {
    if (totalRecitedWords === 0) return 100;
    return Math.min(100, Math.round((correctWordsCount / totalRecitedWords) * 100));
  }, [correctWordsCount, totalRecitedWords]);

  // Current scope title
  const currentTitle = useMemo(() => {
    if (browseTab === 'whole') {
      const s = SURAH_LIST.find(item => item.number === selectedSurahNumber);
      return `Whole Quran Continuous • Surah ${selectedSurahNumber}. ${s?.englishName || ''} (${s?.name || ''})`;
    } else if (browseTab === 'surah') {
      const s = SURAH_LIST.find(item => item.number === selectedSurahNumber);
      return s ? `${s.number}. ${s.englishName} (${s.name})` : `Surah ${selectedSurahNumber}`;
    } else {
      const j = FULL_JUZ_LIST.find(item => item.index === selectedJuzIndex);
      return `Juz ${selectedJuzIndex} • ${j?.surahs[0]?.surahEnglishName || ''} to ${j?.surahs[j?.surahs.length - 1]?.surahEnglishName || ''}`;
    }
  }, [browseTab, selectedSurahNumber, selectedJuzIndex]);

  // Filtered lists
  const filteredSurahs = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return SURAH_LIST;
    return SURAH_LIST.filter(s => 
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  const filteredJuzList = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return FULL_JUZ_LIST;
    return FULL_JUZ_LIST.filter(j => 
      j.index.toString().includes(q) ||
      `juz ${j.index}`.includes(q) ||
      j.nameTranslation.toLowerCase().includes(q) ||
      j.nameTransliteration.toLowerCase().includes(q) ||
      j.surahs.some(s => s.surahEnglishName.toLowerCase().includes(q) || s.surahName.includes(q))
    );
  }, [searchFilter]);

  return (
    <div className="space-y-6 pb-28 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border border-emerald-500/20 p-6 md:p-8 shadow-2xl shadow-emerald-950/30">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 flex items-center gap-2 text-xs font-bold"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} className="animate-spin text-emerald-400" />
                <span>Tarteel Hifz • Quran Recitation & Word Unveil</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>Quran Recitation & Live Unveil</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-noor-gold/20 text-noor-gold font-bold border border-noor-gold/30">
                  Entire Quran
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium pt-1">
                Ayahs are veiled by default. Recite from memory into your mic — the sacred words and verses dynamically unveil before your eyes, correcting pronunciation and tracking your memorization across the entire Quran.
              </p>
            </div>
          </div>

          {/* Real-time Session Metrics */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl p-3.5 rounded-3xl border border-white/10">
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revealed</p>
              <p className="text-lg font-black text-emerald-400">
                {revealedAyahsCount} <span className="text-[10px] text-slate-400 font-normal">/ {ayahs.length}</span>
              </p>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</p>
              <p className={`text-lg font-black ${accuracyPercentage >= 90 ? 'text-emerald-400' : accuracyPercentage >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                {accuracyPercentage}%
              </p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hasanat</p>
              <p className="text-lg font-black text-noor-gold flex items-center justify-center gap-1">
                <Flame size={14} className="fill-noor-gold" />
                +{hasanatEarnedSession}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector & Controls */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setMode('reveal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'reveal'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <EyeOff size={14} />
              <span>Unveil On Recite (Tarteel Hifz)</span>
            </button>
            <button
              onClick={() => setMode('corrector')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'corrector'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic size={14} />
              <span>Open Mushaf (Follow Along)</span>
            </button>
            <button
              onClick={() => setMode('review')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'review'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle size={14} />
              <span>Mistakes Review ({mistakeLogs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'reveal' && (
              <>
                <button
                  onClick={handleRevealNextWordHint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                  title="Reveal the next word if you are stuck"
                >
                  <Lightbulb size={14} />
                  <span>Word Hint</span>
                </button>
                <button
                  onClick={() => setHintLevel(hintLevel === 2 ? 0 : 2)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    hintLevel === 2 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
                  }`}
                  title="Peek at the text temporarily"
                >
                  {hintLevel === 2 ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{hintLevel === 2 ? 'Hide Words' : 'Peek Verse'}</span>
                </button>
              </>
            )}

            <button
              onClick={handleResetSession}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all active:scale-95"
              title="Reset Recitation Session"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scope Browser: Whole Quran Continuous vs 114 Surahs vs 30 Juz */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/5 p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/5 w-fit">
            <button
              onClick={() => setBrowseTab('whole')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                browseTab === 'whole' ? 'bg-brand-primary text-brand-depth shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <InfinityIcon size={14} />
              <span>Whole Quran Flow</span>
            </button>
            <button
              onClick={() => setBrowseTab('surah')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                browseTab === 'surah' ? 'bg-brand-primary text-brand-depth shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Surah (1–114)
            </button>
            <button
              onClick={() => setBrowseTab('juz')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                browseTab === 'juz' ? 'bg-brand-primary text-brand-depth shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Juz (1–30)
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input
              type="text"
              placeholder={browseTab === 'juz' ? 'Search Juz 1–30...' : 'Search Surah (e.g. Baqarah, Kahf, Mulk)...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50"
            />
          </div>
        </div>

        {/* Carousel / Quick Surah Picker */}
        {browseTab === 'juz' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredJuzList.map((j) => (
              <button
                key={j.index}
                onClick={() => setSelectedJuzIndex(j.index)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                  selectedJuzIndex === j.index
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    selectedJuzIndex === j.index ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                  }`}>
                    {j.index}
                  </span>
                  <span className="text-xs font-bold text-white">Juz {j.index}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px] pt-1">
                  {j.surahs[0]?.surahEnglishName || j.nameTransliteration}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filteredSurahs.map((s) => (
              <button
                key={s.number}
                onClick={() => setSelectedSurahNumber(s.number)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-left transition-all ${
                  selectedSurahNumber === s.number
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    selectedSurahNumber === s.number ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-slate-300'
                  }`}>
                    {s.number}
                  </span>
                  <span className="text-xs font-bold text-white">{s.englishName}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[130px] pt-1 font-amiri text-right">
                  {s.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Microphone Recitation Control Bar */}
      <div className="sticky top-20 z-30 bg-slate-900/95 backdrop-blur-2xl p-4 md:p-5 rounded-3xl border border-emerald-500/30 shadow-2xl shadow-black/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`relative flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse'
                  : 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 hover:bg-emerald-400'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  <span>Listening... Tap to Pause</span>
                </>
              ) : (
                <>
                  <Mic size={18} />
                  <span>Start Reciting (Mic ON)</span>
                </>
              )}
            </motion.button>

            {isListening && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-300 font-bold">
                  {currentRecitedWord ? `Recited: "${currentRecitedWord}"` : 'Listening for your Quran recitation...'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 truncate max-w-xs">{currentTitle}</span>
            <button
              onClick={() => playAyahAudio(activeAyahIndex)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isPlayingAudio 
                  ? 'bg-noor-gold text-slate-950 border-noor-gold shadow-lg shadow-noor-gold/20' 
                  : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
              }`}
              title="Listen to Sheikh Mishary Alafasy reciting this verse"
            >
              {isPlayingAudio ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlayingAudio ? 'Pause Qari' : 'Teacher Audio'}</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Toast */}
        <AnimatePresence mode="wait">
          {recentMatchFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 ${
                recentMatchFeedback.type === 'correct' || recentMatchFeedback.type === 'complete'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : recentMatchFeedback.type === 'hint'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {recentMatchFeedback.type === 'correct' || recentMatchFeedback.type === 'complete' ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : recentMatchFeedback.type === 'hint' ? (
                  <Lightbulb size={16} className="text-amber-400 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                )}
                <span>{recentMatchFeedback.message}</span>
              </div>
              {recentMatchFeedback.word && (
                <span className="font-amiri text-sm px-2.5 py-0.5 rounded-lg bg-black/40 border border-white/10">
                  {recentMatchFeedback.word}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Quran Recitation Surface */}
      {isLoading ? (
        <div className="p-16 text-center space-y-4 bg-slate-900/50 rounded-3xl border border-white/5">
          <RefreshCw size={32} className="animate-spin text-emerald-400 mx-auto" />
          <p className="text-sm font-bold text-slate-300">Loading sacred Quranic script and diacritics...</p>
        </div>
      ) : loadError ? (
        <div className="p-8 text-center space-y-4 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-300">
          <AlertTriangle size={32} className="mx-auto text-red-400" />
          <p className="text-sm font-bold">{loadError}</p>
          <button
            onClick={handleResetSession}
            className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold"
          >
            Retry Loading
          </button>
        </div>
      ) : mode === 'review' ? (
        /* Mistake Review Log */
        <div className="space-y-4">
          <div className="p-6 bg-slate-900/70 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={18} />
              <span>Mistakes & Tajweed Review Log</span>
            </h3>
            <p className="text-xs text-slate-400">
              Review any words you stumbled upon or mispronounced. Practice each one with the recommended Tajweed tips.
            </p>
          </div>

          {mistakeLogs.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-white/5 space-y-2">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">Masha'Allah! Zero mistakes recorded in this session.</p>
              <p className="text-xs text-slate-400">Start reciting to track your pronunciation and memorization live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mistakeLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 bg-slate-900/80 rounded-3xl border border-red-500/20 hover:border-red-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{log.surahName} • Ayah {log.ayahNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Expected Quran Word</p>
                      <p className="font-amiri text-xl font-black text-emerald-400">{log.expectedWord}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Heard / Pronounced</p>
                      <p className="font-amiri text-xl font-bold text-red-400">{log.spokenWord}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <p className="font-bold text-[10px] text-amber-400 uppercase tracking-wider mb-0.5">Tajweed Coach Advice</p>
                    <p>{log.tajweedTip}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Unveil On Recite (Tarteel Hifz) & Mushaf Cards */
        <div className="space-y-6">
          {ayahs.map((ayah, aIdx) => {
            const isCurrentAyah = aIdx === activeAyahIndex;
            const isPastAyah = aIdx < activeAyahIndex;
            const isFutureAyah = aIdx > activeAyahIndex;

            // In 'reveal' mode: future ayahs are completely hidden behind mystery cards
            // Current ayah is waiting for words to be recited
            // Past ayahs are completely revealed
            const isCompletelyRevealed = mode === 'corrector' || isPastAyah || ayah.words.every(w => w.status === 'correct' || w.status === 'skipped');

            return (
              <div
                key={ayah.number}
                ref={isCurrentAyah ? activeAyahCardRef : null}
                className={`relative overflow-hidden p-6 md:p-8 rounded-[2.5rem] border transition-all ${
                  isCurrentAyah
                    ? 'bg-slate-900/95 border-emerald-500/50 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500/20'
                    : isPastAyah
                    ? 'bg-slate-900/50 border-emerald-500/20'
                    : 'bg-slate-900/20 border-white/5 opacity-70'
                }`}
              >
                {/* Ayah Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      isPastAyah || isCompletelyRevealed
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrentAyah
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 animate-pulse'
                        : 'bg-white/5 text-slate-400'
                    }`}>
                      {isCompletelyRevealed ? <Check size={14} /> : ayah.numberInSurah}
                    </span>
                    <div>
                      <span className="font-bold text-slate-200">{ayah.surahName}</span>
                      <span className="text-[10px] text-slate-500 ml-2">Ayah {ayah.numberInSurah}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrentAyah && mode === 'reveal' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        Active Verse • Recite to Unveil
                      </span>
                    )}

                    <button
                      onClick={() => playAyahAudio(aIdx)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isPlayingAudio && audioAyahIndex === aIdx
                          ? 'bg-noor-gold text-slate-950'
                          : 'bg-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isPlayingAudio && audioAyahIndex === aIdx ? <Pause size={13} /> : <Volume2 size={13} />}
                      <span>Audio</span>
                    </button>
                  </div>
                </div>

                {/* Veiled Placeholder Card for Future Ayahs in Reveal Mode */}
                {mode === 'reveal' && isFutureAyah && hintLevel !== 2 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                      <EyeOff size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Veiled Verse • Ayah {ayah.numberInSurah}</p>
                      <p className="text-[11px] text-slate-600">Recite previous verses to unlock and unveil this Ayah</p>
                    </div>
                  </div>
                ) : (
                  /* Arabic Word Stream */
                  <div 
                    className="py-6 text-right leading-[3.2] dir-rtl font-amiri text-2xl md:text-3xl flex flex-wrap flex-row-reverse items-center justify-start gap-2.5 select-none"
                    style={{ direction: 'rtl' }}
                  >
                    {ayah.words.map((word, wIdx) => {
                      const isCurrentWord = isCurrentAyah && wIdx === activeWordIndex;
                      const isRevealedWord = word.status === 'correct' || word.status === 'skipped' || word.status === 'mistake' || isCompletelyRevealed || hintLevel === 2;
                      const isFirstWordHint = isCurrentWord && hintLevel === 1;

                      return (
                        <span
                          key={word.id}
                          onClick={() => isRevealedWord && setSelectedWordTooltip({
                            word,
                            ayahNumber: ayah.numberInSurah,
                            surahName: ayah.surahName
                          })}
                          className={`relative inline-block px-2.5 py-1 rounded-2xl transition-all cursor-pointer ${
                            word.status === 'correct'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 scale-100'
                              : word.status === 'mistake'
                              ? 'bg-red-500/25 text-red-300 border border-red-500/50 underline decoration-wavy decoration-red-400'
                              : word.status === 'skipped'
                              ? 'bg-amber-500/20 text-amber-300 border border-dashed border-amber-500/50'
                              : isCurrentWord
                              ? 'bg-emerald-500/30 text-white border-2 border-emerald-400 animate-pulse shadow-lg shadow-emerald-500/25 scale-105'
                              : isRevealedWord
                              ? 'text-slate-200'
                              : 'bg-white/5 text-transparent border border-white/5 rounded-xl px-4 select-none blur-sm'
                          }`}
                        >
                          {isRevealedWord ? (
                            word.arabic
                          ) : isFirstWordHint ? (
                            <span className="text-amber-300">{word.arabic.charAt(0)}...</span>
                          ) : (
                            <span className="opacity-0">{word.arabic}</span>
                          )}

                          {word.status === 'correct' && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                          )}
                          {word.status === 'mistake' && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-400" />
                          )}
                        </span>
                      );
                    })}

                    {/* Sacred Ayah End Symbol */}
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-sans text-xs font-bold mx-1.5">
                      {ayah.numberInSurah}
                    </span>
                  </div>
                )}

                {/* Translation revealed when Ayah completed */}
                {ayah.translation && (isCompletelyRevealed || hintLevel === 2) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-3 border-t border-white/5 text-xs md:text-sm text-slate-400 font-medium leading-relaxed"
                  >
                    {ayah.translation}
                  </motion.div>
                )}

                {/* Dedicated Tafsir Toggle Button & Panel (keeps Arabic text completely hidden!) */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => toggleTafsir(ayah.number)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        expandedTafsirAyahs[ayah.number]
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:text-white'
                      }`}
                      title="Reveal Tafsir & meaning while keeping sacred Arabic text hidden"
                    >
                      <BookOpen size={13} className="text-amber-400" />
                      <span>{expandedTafsirAyahs[ayah.number] ? 'Hide Verse Tafsir' : 'Reveal Tafsir Only'}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/40 text-amber-300/80 font-mono">
                        Arabic stays hidden 🔒
                      </span>
                    </button>

                    {isFutureAyah && mode === 'reveal' && hintLevel !== 2 && (
                      <span className="text-[10px] text-slate-500 font-medium italic">
                        Contemplate meaning before reciting
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedTafsirAyahs[ayah.number] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        className="overflow-hidden bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-black/80 rounded-2xl p-4 md:p-5 border border-amber-500/30 space-y-2.5 shadow-xl"
                      >
                        <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={13} className="text-amber-400" />
                            <span>Tafsir & Exegesis Insight • {ayah.surahName} (Ayah {ayah.numberInSurah})</span>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Hifz Memory Aid
                          </span>
                        </div>

                        <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal bg-black/30 p-3.5 rounded-xl border border-white/5">
                          <p className="font-semibold text-amber-200/90 mb-1">Meaning & Sahih Translation:</p>
                          <p className="italic text-slate-300">"{ayah.translation || 'Sacred Quranic verse divine meaning...'}"</p>
                        </div>

                        <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                          <p className="font-bold text-slate-300">Spiritual Contemplation (Tadabbur):</p>
                          <p>
                            Reflect upon the divine wisdom, context, and message behind this verse. Understanding the core theme helps cement the sequence of words in your memory before reciting them aloud into the microphone.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Word Tajweed Inspector Modal */}
      <AnimatePresence>
        {selectedWordTooltip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-emerald-400" size={18} />
                  <span className="text-xs font-bold text-white">
                    {selectedWordTooltip.surahName} • Ayah {selectedWordTooltip.ayahNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedWordTooltip(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg"
                >
                  Close
                </button>
              </div>

              <div className="text-center p-5 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quranic Word</p>
                <p className="font-amiri text-4xl font-bold text-emerald-400">
                  {selectedWordTooltip.word.arabic}
                </p>
                <p className="text-xs text-slate-300 font-mono">
                  Base Phonetic: {selectedWordTooltip.word.normalized}
                </p>
              </div>

              {selectedWordTooltip.word.transcription && (
                <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">What Mic Detected:</span>
                  <p className="font-amiri text-lg font-bold text-white">{selectedWordTooltip.word.transcription}</p>
                </div>
              )}

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1.5">
                <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Sparkles size={12} />
                  <span>Tajweed Pronunciation Guide</span>
                </p>
                <p className="text-slate-200">
                  {selectedWordTooltip.word.tajweedTip || getTajweedRuleAdvice(selectedWordTooltip.word.arabic, selectedWordTooltip.word.normalized)}
                </p>
              </div>

              <button
                onClick={() => setSelectedWordTooltip(null)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
