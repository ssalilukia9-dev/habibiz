import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Bookmark, 
  Share2, 
  Languages, 
  Sparkles, 
  Search, 
  BookOpen, 
  Sliders, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  HelpCircle,
  Sun,
  Moon,
  Mic,
  MicOff,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Check,
  Compass,
  XCircle,
  Clock
} from 'lucide-react';
import { SURAH_LIST, JUZ_LIST, RECITERS, getAyahAudioUrl } from '../constants';
import { FULL_JUZ_LIST } from '../data/juzData';
import { Ayah, Surah } from '../types';
import { readLaterService } from '../services/readLaterService.ts';

export type MushafTheme = 'parchment' | 'night' | 'emerald';
export type TarteelMode = 'case1_detective' | 'case2_correction' | 'case3_reveal';

interface MushafPageViewProps {
  initialPage?: number;
  onBack?: () => void;
  onSelectSurah?: (surah: Surah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  addHasanat?: (amount: number) => void;
  incrementVerse?: () => void;
  language?: string;
  bookmarks: number[];
  onToggleBookmark: (ayahNumber: number) => void;
  isPremium?: boolean;
  onShowPremium?: () => void;
}

export interface AyahWord {
  id: string;
  index: number;
  arabic: string;
  normalized: string;
  status: 'unrecited' | 'correct' | 'mistake' | 'active';
}

export interface PageAyah {
  number: number;           // Global Ayah number (1-6236)
  numberInSurah: number;    // Ayah in surah (1-N)
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  text: string;
  translation: string;
  audioUrl?: string;
  juz: number;
  page: number;
  manzil?: number;
  ruku?: number;
  isRecited: boolean;
  words: AyahWord[];
}

// Convert English numbers to Arabic-Indic digits (1 -> ١, 24 -> ٢٤)
export const toArabicDigits = (num: number | string): string => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
};

// Arabic diacritics stripping & phonetic normalization
export const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Tashkeel, Sukun, Shaddah, Quranic symbols
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\u0621-\u064A\s]/g, '')
    .trim()
    .toLowerCase();
};

export const calculateSimilarity = (s1: string, s2: string): number => {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  if (longer.includes(shorter)) return 0.9;

  const getBigrams = (str: string) => {
    const s = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) s.add(str.slice(i, i + 2));
    return s;
  };
  const b1 = getBigrams(s1);
  const b2 = getBigrams(s2);
  let intersection = 0;
  b1.forEach(bg => { if (b2.has(bg)) intersection++; });
  return (2.0 * intersection) / (b1.size + b2.size || 1);
};

export default function MushafPageView({
  initialPage = 1,
  onBack,
  onSelectSurah,
  selectedReciter,
  onReciterChange,
  addHasanat,
  incrementVerse,
  language = 'en',
  bookmarks,
  onToggleBookmark,
  isPremium,
  onShowPremium
}: MushafPageViewProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mushaf Styling & Theme (Parchment, Emerald, Night)
  const [mushafTheme, setMushafTheme] = useState<MushafTheme>(() => {
    return (localStorage.getItem('mushaf_theme_choice') as MushafTheme) || 'parchment';
  });

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [selectedAyahForDetails, setSelectedAyahForDetails] = useState<PageAyah | null>(null);
  const [pageJumpInput, setPageJumpInput] = useState(String(currentPage));

  // Tarteel Live Voice Engine
  const [tarteelOpen, setTarteelOpen] = useState(false);
  const [tarteelMode, setTarteelMode] = useState<TarteelMode>('case1_detective');
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [activeVoiceAyahIdx, setActiveVoiceAyahIdx] = useState(0);
  const [detectedSurahBanner, setDetectedSurahBanner] = useState<{
    surahName: string;
    surahArabicName: string;
    ayahNumber: number;
    page: number;
  } | null>(null);
  const [revealedAyahsCount, setRevealedAyahsCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [readLaterIds, setReadLaterIds] = useState<string[]>(() => {
    return readLaterService.getItems().map(i => i.id);
  });

  useEffect(() => {
    return readLaterService.subscribe((items) => {
      setReadLaterIds(items.map(i => i.id));
    });
  }, []);

  const isAyahInReadLater = (ayah: PageAyah) => {
    return readLaterIds.includes(`ayah-${ayah.surahNumber}-${ayah.numberInSurah}`);
  };

  const handleToggleReadLater = (ayah: PageAyah) => {
    const isCurrentlyIn = isAyahInReadLater(ayah);
    readLaterService.toggleAyah(
      ayah.surahNumber,
      ayah.surahName || ayah.surahEnglishName,
      {
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: ayah.translation
      },
      ayah.surahEnglishName
    );
    showToast(!isCurrentlyIn ? `Saved ${ayah.surahEnglishName} ${ayah.surahNumber}:${ayah.numberInSurah} to Read Later queue (offline)` : 'Removed from Read Later queue');
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const activeReciterObj = RECITERS.find(r => r.id === selectedReciter) || RECITERS[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleThemeChange = (t: MushafTheme) => {
    setMushafTheme(t);
    localStorage.setItem('mushaf_theme_choice', t);
  };

  // Stop listening safely
  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      } catch {}
    }
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [stopListening]);

  // Load 15-line page data
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setIsPlayingAudio(false);
    setActiveAyahIndex(null);
    setActiveVoiceAyahIdx(0);
    setActiveWordIdx(0);
    setRevealedAyahsCount(0);

    const fetchPageData = async () => {
      try {
        const [arRes, transRes] = await Promise.all([
          fetch(`/api/proxy/alquran/page/${currentPage}/quran-uthmani`).catch(() => fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`)),
          fetch(`/api/proxy/alquran/page/${currentPage}/en.sahih`).catch(() => fetch(`https://api.alquran.cloud/v1/page/${currentPage}/en.sahih`))
        ]);

        const [arData, transData] = await Promise.all([
          arRes.json(),
          transRes.json().catch(() => ({ data: { ayahs: [] } }))
        ]);

        if (isCancelled) return;

        if (arData?.data?.ayahs) {
          const mapped: PageAyah[] = arData.data.ayahs.map((ayah: any, idx: number) => {
            const rawText = ayah.text || '';
            const wordsList: AyahWord[] = rawText
              .split(/\s+/)
              .filter(Boolean)
              .map((w: string, wIdx: number) => ({
                id: `${ayah.number}_${wIdx}`,
                index: wIdx,
                arabic: w,
                normalized: normalizeArabic(w),
                status: (idx === 0 && wIdx === 0) ? 'active' : 'unrecited'
              }));

            const audioUrl = getAyahAudioUrl(activeReciterObj, ayah.surah.number, ayah.numberInSurah, ayah.number);

            return {
              number: ayah.number,
              numberInSurah: ayah.numberInSurah,
              surahNumber: ayah.surah.number,
              surahName: ayah.surah.name,
              surahEnglishName: ayah.surah.englishName,
              text: rawText,
              translation: transData?.data?.ayahs?.[idx]?.text || '',
              audioUrl,
              juz: ayah.juz,
              page: ayah.page || currentPage,
              manzil: ayah.manzil,
              ruku: ayah.ruku,
              isRecited: false,
              words: wordsList
            };
          });

          setPageAyahs(mapped);
          if (addHasanat) addHasanat(10);
        } else {
          throw new Error('Invalid page payload');
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn("Failed to load Mushaf page:", err);
          setError("Failed to illuminate this page. Please check connection.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchPageData();
    setPageJumpInput(String(currentPage));
  }, [currentPage, selectedReciter]);

  // Derived Surah & Juz headers
  const pageHeaderInfo = useMemo(() => {
    if (!pageAyahs || pageAyahs.length === 0) {
      return { surahName: `Page ${currentPage}`, englishName: '', juzArabic: `الجزء ${toArabicDigits(1)}` };
    }
    const first = pageAyahs[0];
    const jData = FULL_JUZ_LIST.find(j => j.index === first.juz);
    return {
      surahName: first.surahName,
      englishName: first.surahEnglishName,
      juzArabic: jData ? jData.nameArabic : `الجزء ${toArabicDigits(first.juz)}`
    };
  }, [pageAyahs, currentPage]);

  // Case 1: Detect Surah from Speech & Follow Along
  const tryDetectSurahAndJump = async (spokenText: string): Promise<boolean> => {
    const cleanSpoken = normalizeArabic(spokenText);
    if (!cleanSpoken || cleanSpoken.length < 3) return false;

    // A. Check Spoken Surah Name
    for (const surah of SURAH_LIST) {
      const normSurahArabic = normalizeArabic(surah.name);
      const normEnglish = surah.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const spokenLower = spokenText.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (
        cleanSpoken.includes(normSurahArabic) ||
        (normSurahArabic.length > 3 && cleanSpoken.includes(normSurahArabic.replace(/^سوره/, '').trim())) ||
        spokenLower.includes(normEnglish) ||
        spokenLower.includes(`surah${surah.number}`)
      ) {
        try {
          const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surah.number}:1/editions/quran-uthmani`);
          const data = await res.json();
          if (data.code === 200 && data.data.length > 0) {
            const detectedPage = data.data[0].page;
            setDetectedSurahBanner({
              surahName: surah.englishName,
              surahArabicName: surah.name,
              ayahNumber: 1,
              page: detectedPage
            });
            setCurrentPage(detectedPage);
            showToast(`🎯 Tarteel AI: Identified Surah ${surah.englishName}! Opening Page ${detectedPage}...`);
            return true;
          }
        } catch {}
      }
    }

    // B. Search Quran DB for spoken Ayah text
    try {
      const searchTerms = cleanSpoken.split(/\s+/).slice(0, 6).join(' ');
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchTerms)}/all/ar`);
      const data = await res.json();
      if (data.code === 200 && data.data?.matches?.length > 0) {
        const match = data.data.matches[0];
        setDetectedSurahBanner({
          surahName: match.surah.englishName,
          surahArabicName: match.surah.name,
          ayahNumber: match.numberInSurah,
          page: match.page
        });
        setCurrentPage(match.page);
        showToast(`🎯 Tarteel AI: Verse Identified! Surah ${match.surah.englishName} (Ayah ${match.numberInSurah}) • Page ${match.page}`);
        return true;
      }
    } catch {}

    return false;
  };

  // Start Speech Recognition
  const startListening = useCallback((isDetective = false) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("⚠️ Speech recognition works best on Chrome, Safari, or Edge.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
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

      recognition.onresult = async (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          interimText += event.results[i][0].transcript + ' ';
        }

        const cleanSpeech = interimText.trim();
        setSpokenTranscript(cleanSpeech);

        if (cleanSpeech) {
          if (tarteelMode === 'case1_detective' || isDetective) {
            const detected = await tryDetectSurahAndJump(cleanSpeech);
            if (detected) return;
          }

          processSpokenRecitation(cleanSpeech);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          stopListening();
          showToast("⚠️ Microphone access required. Please allow microphone permissions.");
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setTimeout(() => {
              if (isListeningRef.current) {
                try { recognitionRef.current?.start(); } catch {}
              }
            }, 250);
          }
        } else {
          setIsListening(false);
        }
      };

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          mediaStreamRef.current = stream;
        }).catch(() => {});
      }

      recognition.start();
    } catch {
      stopListening();
    }
  }, [tarteelMode, stopListening]);

  // Process live spoken tokens against the active Ayah & Words on the Mushaf page
  const processSpokenRecitation = (spokenText: string) => {
    if (!pageAyahs || pageAyahs.length === 0 || activeVoiceAyahIdx >= pageAyahs.length) return;

    const currentAyah = pageAyahs[activeVoiceAyahIdx];
    if (!currentAyah) return;

    const normalizedSpoken = normalizeArabic(spokenText);
    const tokens = normalizedSpoken.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return;

    let pointer = activeWordIdx;
    const updatedWords = [...currentAyah.words];

    for (const token of tokens) {
      if (pointer >= updatedWords.length) break;

      const currentExpected = updatedWords[pointer].normalized;
      const similarity = calculateSimilarity(currentExpected, token);

      if (similarity >= 0.58 || currentExpected.startsWith(token) || token.startsWith(currentExpected)) {
        updatedWords[pointer] = {
          ...updatedWords[pointer],
          status: 'correct'
        };
        pointer++;
        if (pointer < updatedWords.length) {
          updatedWords[pointer] = { ...updatedWords[pointer], status: 'active' };
        }
      } else {
        // Lookahead check for skipping or minor mispronunciation
        let lookAheadMatch = -1;
        for (let next = pointer + 1; next < Math.min(pointer + 3, updatedWords.length); next++) {
          if (calculateSimilarity(updatedWords[next].normalized, token) >= 0.58) {
            lookAheadMatch = next;
            break;
          }
        }

        if (lookAheadMatch !== -1) {
          for (let s = pointer; s < lookAheadMatch; s++) {
            updatedWords[s] = { ...updatedWords[s], status: 'mistake' };
          }
          updatedWords[lookAheadMatch] = { ...updatedWords[lookAheadMatch], status: 'correct' };
          pointer = lookAheadMatch + 1;
        } else if (token.length >= 3) {
          updatedWords[pointer] = { ...updatedWords[pointer], status: 'mistake' };
        }
      }
    }

    setActiveWordIdx(pointer);

    const nextAyahs = [...pageAyahs];
    nextAyahs[activeVoiceAyahIdx] = {
      ...currentAyah,
      words: updatedWords
    };

    const isFinished = pointer >= updatedWords.length || updatedWords.filter(w => w.status === 'correct').length === updatedWords.length;

    if (isFinished && !currentAyah.isRecited) {
      nextAyahs[activeVoiceAyahIdx].isRecited = true;
      setPageAyahs(nextAyahs);
      setRevealedAyahsCount(prev => prev + 1);
      if (addHasanat) addHasanat(20);
      showToast(`✨ MashaAllah! Ayah ${currentAyah.numberInSurah} recited successfully! (+20 Hasanat)`);

      // Advance to next Ayah on page or next page
      if (activeVoiceAyahIdx < pageAyahs.length - 1) {
        const nextIdx = activeVoiceAyahIdx + 1;
        setActiveVoiceAyahIdx(nextIdx);
        setActiveWordIdx(0);
        setSpokenTranscript('');
      } else if (currentPage < 604) {
        showToast(`📖 Turning to Quran Page ${currentPage + 1}...`);
        setCurrentPage(prev => prev + 1);
      }
    } else {
      setPageAyahs(nextAyahs);
    }
  };

  // Audio Playback
  const playAyahAudio = (index: number) => {
    if (index < 0 || index >= pageAyahs.length) {
      setIsPlayingAudio(false);
      setActiveAyahIndex(null);
      return;
    }
    setActiveAyahIndex(index);
    setIsPlayingAudio(true);

    const ayah = pageAyahs[index];
    if (ayah.audioUrl && audioRef.current) {
      audioRef.current.src = ayah.audioUrl;
      audioRef.current.play().catch(() => {});
    }
  };

  const togglePageAudio = () => {
    if (isPlayingAudio) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      if (activeAyahIndex !== null) {
        if (audioRef.current) audioRef.current.play();
        setIsPlayingAudio(true);
      } else {
        playAyahAudio(0);
      }
    }
  };

  const handleAudioEnded = () => {
    if (activeAyahIndex !== null && activeAyahIndex < pageAyahs.length - 1) {
      playAyahAudio(activeAyahIndex + 1);
      if (incrementVerse) incrementVerse();
      if (addHasanat) addHasanat(5);
    } else {
      setIsPlayingAudio(false);
      setActiveAyahIndex(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <audio ref={audioRef} onEnded={handleAudioEnded} />

      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-slate-900/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-xl text-xs font-bold flex items-center gap-2.5"
          >
            <Sparkles size={16} className="text-amber-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 1. MASTER CONTROLS & NAVIGATION BAR */}
      <div className="glass-panel p-4 md:p-6 rounded-[2.5rem] border-white/10 flex flex-wrap items-center justify-between gap-4 bg-brand-sidebar/80 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={() => {
                stopListening();
                onBack();
              }}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Return"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Madani Mushaf 15-Line</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20">604 Pages</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white">
              {pageHeaderInfo.englishName ? `${pageHeaderInfo.englishName} • ` : ''}Page {currentPage}
            </h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Tarteel AI Voice Assistant Trigger */}
          <button
            onClick={() => setTarteelOpen(!tarteelOpen)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              tarteelOpen || isListening
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/25 ring-2 ring-emerald-400'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Mic size={16} className={isListening ? 'animate-bounce text-slate-950' : 'text-emerald-400'} />
            <span>Tarteel Voice AI</span>
            {isListening && <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />}
          </button>

          {/* Theme Palette Switcher */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => handleThemeChange('parchment')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                mushafTheme === 'parchment' ? 'bg-[#D4C8B5] text-[#1A1105] shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Parchment Manuscript"
            >
              📜 Parchment
            </button>
            <button
              onClick={() => handleThemeChange('emerald')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                mushafTheme === 'emerald' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Emerald Gold"
            >
              🌿 Emerald
            </button>
            <button
              onClick={() => handleThemeChange('night')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                mushafTheme === 'night' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Night Lux"
            >
              🌙 Night
            </button>
          </div>

          {/* Jump to Page input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const p = parseInt(pageJumpInput, 10);
              if (p >= 1 && p <= 604) setCurrentPage(p);
            }} 
            className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-brand-primary"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">Pg</span>
            <input 
              type="number"
              min={1}
              max={604}
              value={pageJumpInput || ''}
              onChange={(e) => setPageJumpInput(e.target.value)}
              className="w-10 bg-transparent text-white font-black text-xs text-center focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 font-medium">/ 604</span>
          </form>

          {/* Surah Dropdown Jump */}
          <select 
            value={pageAyahs[0]?.surahNumber || 1}
            onChange={(e) => {
              const sNum = parseInt(e.target.value, 10);
              const foundJuz = FULL_JUZ_LIST.find(j => j.surahs.some(s => s.surahNumber === sNum));
              if (foundJuz) setCurrentPage(foundJuz.startPage);
            }}
            className="bg-white/5 border border-white/10 text-xs font-bold text-slate-200 rounded-2xl px-3 py-2 focus:outline-none focus:border-brand-primary max-w-[130px]"
          >
            {SURAH_LIST.map(s => (
              <option key={s.number} value={s.number} className="bg-brand-depth text-white">
                {s.number}. {s.englishName}
              </option>
            ))}
          </select>

          {/* Reciter Audio Play */}
          <button 
            onClick={togglePageAudio}
            className={`p-3 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isPlayingAudio 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 animate-pulse' 
                : 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20 hover:scale-105'
            }`}
            title={isPlayingAudio ? "Pause Recitation" : "Listen to Qari"}
          >
            {isPlayingAudio ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Translation Toggle */}
          <button 
            onClick={() => setShowTranslations(!showTranslations)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              showTranslations 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Translation"
          >
            <Languages size={18} />
          </button>
        </div>
      </div>

      {/* 🌟 2. TARTEEL AI VOICE ENGINE ACCORDION / HERO SECTION (3 CASES) */}
      <AnimatePresence>
        {tarteelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-[2.5rem] border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-brand-depth/90 backdrop-blur-xl shadow-2xl space-y-6"
          >
            {/* Header with Case Selection Tabs */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Tarteel Recitation Assistant</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">Voice Companion & Memory Studio</h3>
              </div>

              {/* 3 CASES TABS */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 w-full md:w-auto">
                <button
                  onClick={() => setTarteelMode('case1_detective')}
                  className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    tarteelMode === 'case1_detective'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass size={14} />
                  <span>Case 1: Auto-Detect & Follow</span>
                </button>

                <button
                  onClick={() => setTarteelMode('case2_correction')}
                  className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    tarteelMode === 'case2_correction'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>Case 2: Live Correction</span>
                </button>

                <button
                  onClick={() => setTarteelMode('case3_reveal')}
                  className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    tarteelMode === 'case3_reveal'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Case 3: Blank Recite & Reveal</span>
                </button>
              </div>
            </div>

            {/* Central Mic Hero with Mode Description */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="relative">
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.2, 0.7, 0.2] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="absolute -inset-4 rounded-full bg-emerald-500 blur-xl pointer-events-none"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                      className="absolute -inset-2 rounded-full bg-teal-400 blur-md pointer-events-none"
                    />
                  </>
                )}

                <button
                  onClick={() => {
                    if (isListening) {
                      stopListening();
                    } else {
                      startListening(tarteelMode === 'case1_detective');
                    }
                  }}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-2xl ${
                    isListening
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 scale-105 shadow-rose-500/40 ring-4 ring-rose-400/50'
                      : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 hover:scale-105 shadow-emerald-500/40 ring-4 ring-emerald-400/30'
                  }`}
                >
                  {isListening ? (
                    <MicOff size={32} className="text-white" />
                  ) : (
                    <Mic size={32} className="text-slate-950 font-black" />
                  )}
                </button>
              </div>

              {/* Mode Contextual Description */}
              <div className="max-w-md space-y-1">
                <h4 className="text-sm font-black text-white">
                  {isListening
                    ? '🎤 Reciting into Tarteel AI...'
                    : tarteelMode === 'case1_detective'
                    ? 'Case 1: Tap Mic & Recite Any Verse Anywhere'
                    : tarteelMode === 'case2_correction'
                    ? `Case 2: Live Correction for Surah ${pageHeaderInfo.englishName || 'Selected'}`
                    : `Case 3: Memory Reveal Mode (Ayahs Hidden on Page ${currentPage})`}
                </h4>
                <p className="text-xs text-slate-400">
                  {tarteelMode === 'case1_detective'
                    ? 'Tarteel automatically detects the Surah and Ayah, jumps to that page, and moves along with your voice!'
                    : tarteelMode === 'case2_correction'
                    ? 'Recite into the mic to get real-time Green highlights for correct words and immediate Tajweed correction guidance!'
                    : 'Ayahs are masked in sacred blank parchment. Recite each verse accurately to unveil it in shining gold calligraphy!'}
                </p>
              </div>

              {/* Live Spoken Transcript */}
              {spokenTranscript && (
                <div className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 max-w-lg w-full flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[10px]">HEARING</span>
                  <span className="font-serif text-sm font-bold text-white truncate" dir="rtl">{spokenTranscript}</span>
                  <span className="text-[10px] text-emerald-400/80 font-mono">Live</span>
                </div>
              )}

              {/* Detected Surah Banner */}
              {detectedSurahBanner && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>
                    Detected: Surah {detectedSurahBanner.surahName} ({detectedSurahBanner.surahArabicName}) • Ayah {detectedSurahBanner.ayahNumber} • Page {detectedSurahBanner.page}
                  </span>
                </div>
              )}

              {/* Case 3 Progress Stats */}
              {tarteelMode === 'case3_reveal' && (
                <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Revealed: {revealedAyahsCount} / {pageAyahs.length} Ayahs
                  </span>
                  <span className="text-amber-400">
                    +20 Hasanat per Ayah Unlocked ✨
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 3. ICONIC 15-LINE MADANI MUSHAF PAGE CANVAS (SAME AS ALIYAH MEMORISE) */}
      <div className="relative my-4 select-none transition-all duration-300">
        
        {/* Authentic Madani Mushaf Outer Geometric Arabesque Frame */}
        <div 
          className="relative mx-auto max-w-[740px] rounded-[28px] p-3 sm:p-5 shadow-2xl transition-all duration-300 bg-[#0089a8] border-4 border-[#c5a059]"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #0098ba 0%, #00748e 100%)`,
            boxShadow: '0 25px 60px -15px rgba(0, 137, 168, 0.35), 0 0 0 1px rgba(197, 160, 89, 0.4)'
          }}
        >
          {/* Islamic Geometric Gold Corner Accents */}
          <div className="absolute top-1.5 left-1.5 w-7 h-7 border-t-2 border-l-2 border-amber-300 pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-7 h-7 border-t-2 border-r-2 border-amber-300 pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-7 h-7 border-b-2 border-l-2 border-amber-300 pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-7 h-7 border-b-2 border-r-2 border-amber-300 pointer-events-none" />

          {/* Inner Golden Filigree Border */}
          <div className="rounded-[20px] border-2 border-[#e6cca0] p-2 bg-white/10">
            
            {/* Inner Canvas (Parchment, Emerald, or Night) */}
            <div className={`relative rounded-[16px] p-5 sm:p-8 min-h-[620px] flex flex-col justify-between border border-[#c5a059]/40 ${
              mushafTheme === 'parchment'
                ? 'bg-[#FCFAF5] text-[#1A1105]'
                : mushafTheme === 'emerald'
                ? 'bg-[#041610] text-[#E8F8F0]'
                : 'bg-[#0A1015] text-[#F0F4F8]'
            }`}>
              
              {/* 🕌 TOP CARTOUCHE PLAQUES (SURAH & JUZ HEADERS) */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#c5a059]/40">
                {/* Left: Surah Calligraphy Plaque */}
                <div className="px-4 py-1 rounded-full border-2 border-[#c5a059] bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] flex items-center gap-1.5 shadow-sm">
                  <span className="font-serif font-bold text-sm tracking-wide">
                    {pageHeaderInfo.surahName}
                  </span>
                </div>

                {/* Center Star Rosette */}
                <div className="w-6 h-6 rounded-full border border-[#c5a059] flex items-center justify-center text-[#c5a059] text-[10px]">
                  ۞
                </div>

                {/* Right: Juz Calligraphy Plaque */}
                <div className="px-4 py-1 rounded-full border-2 border-[#c5a059] bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] flex items-center gap-1.5 shadow-sm">
                  <span className="font-serif font-bold text-sm tracking-wide">
                    {pageHeaderInfo.juzArabic}
                  </span>
                </div>
              </div>

              {/* Main Content Area */}
              {loading ? (
                <div className="py-36 text-center space-y-3">
                  <RefreshCw size={32} className="animate-spin text-cyan-600 dark:text-cyan-400 mx-auto" />
                  <p className="text-xs font-bold font-serif opacity-70">Illuminating Madani Page {currentPage}...</p>
                </div>
              ) : error ? (
                <div className="py-28 text-center space-y-4">
                  <p className="text-rose-500 text-sm font-bold">{error}</p>
                  <button 
                    onClick={() => setCurrentPage(currentPage)}
                    className="px-6 py-2 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-lg"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Bismillah Header for Ayah 1 of any Surah (except Surah 9 At-Tawbah & Surah 1 Al-Fatiha) */}
                  {pageAyahs.some(a => a.numberInSurah === 1 && a.surahNumber !== 9 && a.surahNumber !== 1) && (
                    <div className="py-3 text-center border-y border-[#c5a059]/30 my-2">
                      <p 
                        className="font-serif text-2xl sm:text-3xl font-bold tracking-wide"
                        style={{ fontFamily: `'Amiri', 'Scheherazade New', 'Traditional Arabic', serif` }}
                      >
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </p>
                    </div>
                  )}

                  {/* 📖 CONTINUOUS 15-LINE MADANI QURAN CALLIGRAPHY */}
                  <div
                    dir="rtl"
                    className="flex-1 text-justify leading-[2.8] sm:leading-[3.2] font-serif text-lg sm:text-[23px] tracking-wide"
                    style={{
                      fontFamily: `'Amiri', 'Scheherazade New', 'Traditional Arabic', serif`,
                      textJustify: 'inter-word'
                    }}
                  >
                    {pageAyahs.map((ayah, aIdx) => {
                      const isAudioActive = activeAyahIndex === aIdx;
                      const isVoiceActive = tarteelOpen && isListening && activeVoiceAyahIdx === aIdx;
                      const isAyahRevealed = ayah.isRecited || (tarteelMode !== 'case3_reveal');

                      return (
                        <span
                          key={ayah.number}
                          onClick={() => setSelectedAyahForDetails(ayah)}
                          className={`inline transition-all duration-300 cursor-pointer rounded-xl px-1 ${
                            isAudioActive
                              ? 'bg-amber-400/25 rounded-xl'
                              : isVoiceActive
                              ? 'bg-emerald-500/15 rounded-xl'
                              : 'hover:bg-amber-500/10'
                          }`}
                        >
                          {/* Case 3 Masking / Reveal or Word-By-Word Highlights */}
                          {tarteelMode === 'case3_reveal' && !isAyahRevealed && !isVoiceActive ? (
                            <span className="inline-block px-4 py-1 my-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500/70 text-xs font-sans font-bold animate-pulse">
                              🔒 Recite Ayah {ayah.numberInSurah} to Reveal...
                            </span>
                          ) : (
                            ayah.words.map((w, wIdx) => {
                              const isWordActiveVoice = isVoiceActive && wIdx === activeWordIdx;
                              const isWordCorrect = w.status === 'correct';
                              const isWordMistake = w.status === 'mistake';

                              let wordColorClass = '';
                              if (tarteelOpen && isListening) {
                                if (isWordCorrect) {
                                  wordColorClass = 'text-emerald-600 dark:text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]';
                                } else if (isWordMistake) {
                                  wordColorClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/20 rounded px-1 underline decoration-rose-500';
                                } else if (isWordActiveVoice) {
                                  wordColorClass = 'text-amber-600 dark:text-amber-300 font-bold underline decoration-amber-500 decoration-2 underline-offset-8 animate-pulse';
                                }
                              }

                              return (
                                <span
                                  key={w.id}
                                  className={`inline-block mx-[2.5px] transition-colors ${wordColorClass}`}
                                >
                                  {w.arabic}
                                </span>
                              );
                            })
                          )}

                          {/* ۝ Ornate Gold Ayah End Seal with Arabic Number */}
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              playAyahAudio(aIdx);
                            }}
                            className="inline-flex items-center justify-center mx-1.5 align-middle select-none cursor-pointer"
                            title={`Play Ayah ${ayah.numberInSurah}`}
                          >
                            <span className={`relative inline-flex items-center justify-center w-7 h-7 rounded-full border transition-all ${
                              isAudioActive
                                ? 'border-amber-400 bg-amber-400 text-slate-950 font-black scale-110 shadow-md'
                                : 'border-[#c5a059] bg-[#c5a059]/10 text-[#c5a059] font-serif text-xs font-bold hover:scale-105'
                            }`}>
                              {toArabicDigits(ayah.numberInSurah)}
                            </span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 🕌 BOTTOM CARTOUCHE PLAQUE (PAGE NUMBER BADGE) */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t-2 border-[#c5a059]/40 text-xs">
                <div className="flex items-center gap-2 font-bold opacity-75">
                  <span className="px-2.5 py-0.5 rounded-full border border-[#c5a059]/50 bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8]">
                    Manzil {pageAyahs[0]?.manzil || 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full border border-[#c5a059]/50 bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8]">
                    Ruku {pageAyahs[0]?.ruku || 1}
                  </span>
                </div>

                {/* Page Badge */}
                <div className="px-6 py-1 rounded-full border-2 border-[#c5a059] bg-[#0089a8]/10 text-[#0089a8] dark:text-[#38bdf8] font-serif font-black text-base shadow-md flex items-center gap-2">
                  <span>{toArabicDigits(currentPage)}</span>
                  <span className="text-xs opacity-60 font-sans font-normal">({currentPage})</span>
                </div>

                <div className="text-[10px] font-mono opacity-60 font-bold uppercase tracking-wider">
                  Madani 15-Line
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Page Flip Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 px-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-xs font-black uppercase tracking-widest text-slate-300 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} /> Prev Page ({currentPage > 1 ? currentPage - 1 : 1})
          </button>

          {/* Quick Page Range Slider */}
          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <input
              type="range"
              min="1"
              max="604"
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-primary/20 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
          </div>

          <button 
            onClick={() => setCurrentPage(prev => Math.min(604, prev + 1))}
            disabled={currentPage >= 604}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-primary text-brand-depth hover:opacity-90 disabled:opacity-30 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
          >
            Next Page ({currentPage < 604 ? currentPage + 1 : 604}) <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Translations Drawer */}
      <AnimatePresence>
        {showTranslations && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 space-y-6 bg-brand-sidebar/90"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Languages size={16} /> English Translations — Page {currentPage}
              </h3>
              <button 
                onClick={() => setShowTranslations(false)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {pageAyahs.map((ayah) => (
                <div 
                  key={ayah.number}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-primary/20 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="text-brand-primary">Ayah {ayah.numberInSurah} ({ayah.surahEnglishName})</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => onToggleBookmark(ayah.number)}
                        className={`p-1.5 rounded-lg transition-colors ${bookmarks.includes(ayah.number) ? 'text-brand-primary' : 'text-slate-500 hover:text-white'}`}
                        title={bookmarks.includes(ayah.number) ? "Bookmarked (Permanent)" : "Bookmark"}
                      >
                        <Bookmark size={14} fill={bookmarks.includes(ayah.number) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => handleToggleReadLater(ayah)}
                        className={`p-1.5 rounded-lg transition-colors ${isAyahInReadLater(ayah) ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}
                        title={isAyahInReadLater(ayah) ? "In Read Later Queue (Offline)" : "Save to Read Later"}
                      >
                        <Clock size={14} className={isAyahInReadLater(ayah) ? "fill-amber-400/20" : ""} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {ayah.translation}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Ayah Action Modal */}
      <AnimatePresence>
        {selectedAyahForDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 max-w-lg w-full bg-brand-sidebar space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Surah {selectedAyahForDetails.surahEnglishName}</span>
                  <h4 className="text-lg font-black text-white">Ayah {selectedAyahForDetails.numberInSurah}</h4>
                </div>
                <button 
                  onClick={() => setSelectedAyahForDetails(null)}
                  className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p 
                  className="font-serif text-2xl text-right text-amber-200 leading-loose"
                  style={{ fontFamily: `'Amiri', 'Scheherazade New', 'Traditional Arabic', serif` }}
                  dir="rtl"
                >
                  {selectedAyahForDetails.text}
                </p>
                <div className="h-0.5 w-16 bg-brand-primary/30" />
                <p className="text-sm text-slate-200 leading-relaxed">
                  "{selectedAyahForDetails.translation}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button 
                  onClick={() => {
                    const idx = pageAyahs.findIndex(a => a.number === selectedAyahForDetails.number);
                    if (idx !== -1) playAyahAudio(idx);
                    setSelectedAyahForDetails(null);
                  }}
                  className="px-6 py-2.5 bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play size={14} /> Play Ayah
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onToggleBookmark(selectedAyahForDetails.number)}
                    className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-bold cursor-pointer"
                    title={bookmarks.includes(selectedAyahForDetails.number) ? "Bookmarked (Permanent)" : "Bookmark"}
                  >
                    <Bookmark size={14} fill={bookmarks.includes(selectedAyahForDetails.number) ? "currentColor" : "none"} />
                    {bookmarks.includes(selectedAyahForDetails.number) ? 'Bookmarked' : 'Bookmark'}
                  </button>

                  <button 
                    onClick={() => handleToggleReadLater(selectedAyahForDetails)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                      isAyahInReadLater(selectedAyahForDetails)
                        ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                    title={isAyahInReadLater(selectedAyahForDetails) ? "In Read Later Queue (Offline)" : "Save to Read Later"}
                  >
                    <Clock size={14} className={isAyahInReadLater(selectedAyahForDetails) ? "fill-amber-400/20" : ""} />
                    {isAyahInReadLater(selectedAyahForDetails) ? 'In Queue' : 'Read Later'}
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
