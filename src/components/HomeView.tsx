import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment-hijri';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Calendar,
  MessageCircle,
  Quote,
  Bell,
  ArrowRight,
  Zap,
  BookOpen,
  Sparkles,
  CloudSun,
  Compass,
  MapPin,
  Flame,
  Heart,
  Target,
  Crown,
  Star,
  CheckCircle2,
  Check,
  Award,
  Activity,
  RotateCcw,
  Plus,
  HeartHandshake,
  Volume2,
  Pause,
  Play,
  Baby,
  Layers,
  Globe,
  Share2,
  Music2,
  ZoomIn,
  Landmark
} from 'lucide-react';
import { ALL_NAMES_OF_ALLAH, NameOfAllah } from '../data/namesOfAllahData.ts';
import { getDailyHadith } from '../data/hadiths.ts';
import { DAILY_ISLAMIC_QUOTES, getDailyQuoteForDate, DailyQuoteItem } from '../data/dailyQuotesData.ts';
import { getDailyAyahForDate } from '../data/dailyAyahsData.ts';
import { dailyWisdomService, WisdomMode, DailyWisdomSummary } from '../services/dailyWisdomService.ts';
import { shareService } from '../services/shareService.ts';
import { getPrayerTimes, formatTime, PrayerTimeData } from '../services/prayerService.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';
import { YoutubeNamesService, YoutubeNamesState } from '../services/youtubeNamesService.ts';
import RamadanHub from './RamadanHub.tsx';
import RamadanCountdownWidget from './RamadanCountdownWidget.tsx';
import WhiteDaysWidget from './WhiteDaysWidget.tsx';
import { getRamadanStatus } from '../services/islamicScheduleService.ts';
import salamSoulBg from '../assets/images/salam_soul_bg_1783445291609.jpg';
import { 
  fetchDailyBanner, 
  getSynchronousDailyBannerFallback, 
  DailyBannerData 
} from '../services/dailyBannerService.ts';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal.tsx';
import MindEasingHopeBeacon from './MindEasingHopeBeacon.tsx';
import QuickSanctuaryExplorer from './QuickSanctuaryExplorer.tsx';

// Comprehensive Hijri Month metadata with English transliteration, meaning, and sacred status
const HIJRI_MONTHS_MAP: Record<number, { en: string; ar: string; meaning: string; sacred: boolean }> = {
  1: { en: 'Muharram', ar: 'مُحَرَّم', meaning: 'The Sacred Month of Peace', sacred: true },
  2: { en: 'Safar', ar: 'صَفَر', meaning: 'The Month of Journey', sacred: false },
  3: { en: 'Rabi\' al-Awwal', ar: 'رَبِيع ٱلْأَوَّل', meaning: 'Birth of Prophet Muhammad ﷺ', sacred: false },
  4: { en: 'Rabi\' al-Thani', ar: 'رَبِيع ٱلثَّانِي', meaning: 'The Second Spring of Barakah', sacred: false },
  5: { en: 'Jumada al-Ula', ar: 'جُمَادَىٰ ٱلْأُولَىٰ', meaning: 'The First Land of Resilience', sacred: false },
  6: { en: 'Jumada al-Akhirah', ar: 'جُمَادَىٰ ٱلْآخِرَة', meaning: 'The Final Land of Reflection', sacred: false },
  7: { en: 'Rajab', ar: 'رَجَب', meaning: 'The Sacred Month of Isra & Mi\'raj', sacred: true },
  8: { en: 'Sha\'ban', ar: 'شَعْبَان', meaning: 'The Month of Preparation for Fasting', sacred: false },
  9: { en: 'Ramadan', ar: 'رَمَضَان', meaning: 'The Holy Month of Fasting & Quran', sacred: true },
  10: { en: 'Shawwal', ar: 'شَوَّال', meaning: 'The Month of Eid ul-Fitr & Rejoicing', sacred: false },
  11: { en: 'Dhu al-Qi\'dah', ar: 'ذُو ٱلْقَعْدَة', meaning: 'The Sacred Month of Rest', sacred: true },
  12: { en: 'Dhu al-Hijjah', ar: 'ذُو ٱلْحِجَّة', meaning: 'The Sacred Month of Hajj & Eid al-Adha', sacred: true }
};

const ISLAMIC_WEEKDAYS: Record<number, { en: string; ar: string; title: string }> = {
  0: { en: 'Sunday', ar: 'الأَحَد', title: 'Yawm al-Ahad (The First Day)' },
  1: { en: 'Monday', ar: 'الاِثْنَيْن', title: 'Yawm al-Ithnayn (Sunnah Fasting Day)' },
  2: { en: 'Tuesday', ar: 'الثُّلَاثَاء', title: 'Yawm ath-Thulatha' },
  3: { en: 'Wednesday', ar: 'الأَرْبِعَاء', title: 'Yawm al-Arbi\'a' },
  4: { en: 'Thursday', ar: 'الخَمِيس', title: 'Yawm al-Khamis (Eve of Jummah)' },
  5: { en: 'Friday', ar: 'الجُمُعَة', title: 'Yawm al-Jumu\'ah (Blessed Master of Days)' },
  6: { en: 'Saturday', ar: 'السَّبْت', title: 'Yawm as-Sabt' }
};

interface HomeViewProps {
  onNavigate: (tab: string, extra?: any) => void;
  hasanat?: number;
  level?: number;
  rank?: string;
  levelProgress?: number;
  versesRead: number;
  duaCount: number;
  streak: number;
  topUserId?: string | null;
  currentUser?: any;
  updateStreak?: () => void;
  lastInteractionAt?: number;
  addHasanat?: (amount: number) => void;
}

export default function HomeView({ 
  onNavigate,
  hasanat = 0,
  level = 1,
  rank = 'Seeker',
  levelProgress = 0,
  versesRead = 0,
  duaCount = 0,
  streak = 0,
  topUserId = null,
  currentUser = null,
  updateStreak,
  lastInteractionAt,
  addHasanat
}: HomeViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimeData | null>(null);
  const [lastRead, setLastRead] = useState<any>(null);
  const [voicePlayback, setVoicePlayback] = useState<VoicePlaybackState>(VoiceService.getState());
  const [ytState, setYtState] = useState<YoutubeNamesState>(YoutubeNamesService.getState());
  const [copiedAyah, setCopiedAyah] = useState(false);

  // 🖼️ Media Lightbox Modal State
  const [isBannerLightboxOpen, setIsBannerLightboxOpen] = useState(false);
  // 🕊️ 15-Second Heart-at-Ease Spotlight State (Appears on start for 15s, then Ayah of Day re-appears)
  const [showHeartAtEase, setShowHeartAtEase] = useState<boolean>(true);

  useEffect(() => {
    const unsubVoice = VoiceService.subscribe(setVoicePlayback);
    const unsubYt = YoutubeNamesService.subscribe(setYtState);
    return () => {
      unsubVoice();
      unsubYt();
    };
  }, []);

  // Force Ramadan Mode State & Listener
  const [forceRamadan, setForceRamadan] = useState(() => {
    return localStorage.getItem('force-ramadan-mode') === 'true';
  });

  useEffect(() => {
    const handleRamadanUpdate = () => {
      setForceRamadan(localStorage.getItem('force-ramadan-mode') === 'true');
    };
    window.addEventListener('ramadan_mode_updated', handleRamadanUpdate);
    return () => window.removeEventListener('ramadan_mode_updated', handleRamadanUpdate);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('last-read-quran');
    if (saved) {
      try {
        setLastRead(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleContinue = () => {
    if (lastRead) {
      if (lastRead.type === 'surah') {
        onNavigate('quran', { surahNumber: lastRead.number });
      } else {
        onNavigate('juz', { juzIndex: lastRead.index });
      }
    } else {
      onNavigate('quran');
    }
  };

  // Daily Vigor Trackers State (Persisted per calendar day)
  const todayKey = new Date().toDateString();

  const [prayersCompleted, setPrayersCompleted] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`daily_vigor_prayers_${todayKey}`);
      return saved ? JSON.parse(saved) : { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
    } catch {
      return { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false };
    }
  });

  const [hadithReflected, setHadithReflected] = useState<boolean>(() => {
    return localStorage.getItem(`daily_vigor_hadith_${todayKey}`) === 'true';
  });

  const [quranAyahsRead, setQuranAyahsRead] = useState<number>(() => {
    return parseInt(localStorage.getItem(`daily_vigor_quran_${todayKey}`) || '0', 10);
  });

  const [dhikrCount, setDhikrCount] = useState<number>(() => {
    return parseInt(localStorage.getItem(`daily_vigor_dhikr_${todayKey}`) || '33', 10);
  });

  const [dhikrPhraseIdx, setDhikrPhraseIdx] = useState<number>(0);
  const dhikrPhrases = [
    { ar: 'سُبْحَانَ اللَّهِ', en: 'SubhanAllah', tr: 'Glory be to Allah' },
    { ar: 'الْحَمْدُ لِلَّهِ', en: 'Alhamdulillah', tr: 'Praise be to Allah' },
    { ar: 'اللَّهُ أَكْبَرُ', en: 'Allahu Akbar', tr: 'Allah is the Greatest' },
    { ar: 'أَسْتَغْفِرُ اللَّهَ', en: 'Astaghfirullah', tr: 'I seek Allah\'s forgiveness' },
    { ar: 'لَا إِلَهَ إِلَّا اللَّهُ', en: 'La ilaha illallah', tr: 'None worthy of worship but Allah' }
  ];

  const togglePrayerCompleted = (name: string) => {
    setPrayersCompleted(prev => {
      const updated = { ...prev, [name]: !prev[name] };
      localStorage.setItem(`daily_vigor_prayers_${todayKey}`, JSON.stringify(updated));
      return updated;
    });

    if (!prayersCompleted[name] && addHasanat) {
      addHasanat(2);
    }
  };

  const toggleHadithReflected = () => {
    const next = !hadithReflected;
    setHadithReflected(next);
    localStorage.setItem(`daily_vigor_hadith_${todayKey}`, String(next));
    if (next && addHasanat) {
      addHasanat(2);
    }
  };

  const incrementQuranAyahs = (amount: number) => {
    const next = quranAyahsRead + amount;
    setQuranAyahsRead(next);
    localStorage.setItem(`daily_vigor_quran_${todayKey}`, String(next));
    if (addHasanat) {
      addHasanat(amount * 1);
    }
  };

  const incrementDhikr = () => {
    const next = dhikrCount + 1;
    setDhikrCount(next);
    localStorage.setItem(`daily_vigor_dhikr_${todayKey}`, String(next));
    if (next % 33 === 0 && addHasanat) {
      addHasanat(2);
    } else if (addHasanat) {
      addHasanat(1);
    }
  };

  const resetDhikr = () => {
    setDhikrCount(0);
    localStorage.setItem(`daily_vigor_dhikr_${todayKey}`, '0');
  };

  const completedPrayersCount = Object.values(prayersCompleted).filter(Boolean).length;
  
  const totalCompletedPillars = 
    (completedPrayersCount === 5 ? 1 : completedPrayersCount > 0 ? 0.5 : 0) +
    (hadithReflected ? 1 : 0) +
    (quranAyahsRead >= 5 ? 1 : quranAyahsRead > 0 ? 0.5 : 0);
  
  const vigorPercentage = Math.min(100, Math.round((totalCompletedPillars / 3) * 100));

  const handleHadithClick = () => {
    onNavigate('resources', { resId: 'hadith' });
    const lastStreakUpdate = localStorage.getItem('last-hadith-streak-update');
    const today = new Date().toDateString();
    if (lastStreakUpdate !== today && updateStreak) {
      updateStreak();
      localStorage.setItem('last-hadith-streak-update', today);
    }
  };

  // Hijri Date Calculation with English Transliteration and Calligraphy
  const mHijri = moment(currentTime);
  const hMonthNum = mHijri.iMonth() + 1; // 1 - 12
  const hDayNum = mHijri.iDate();
  const hYearNum = mHijri.iYear();
  const hMonthMeta = HIJRI_MONTHS_MAP[hMonthNum] || { en: "Rabi' al-Awwal", ar: "رَبِيع ٱلْأَوَّل", meaning: "Sacred Month", sacred: false };
  
  // Format English Hijri String e.g. "8 Rabi' al-Awwal 1448 AH"
  const hijriEnglishString = `${hDayNum} ${hMonthMeta.en} ${hYearNum} AH`;
  // Format Arabic Hijri String
  const arabicNumerals = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
  const hijriArabicString = `${arabicNumerals(hDayNum)} ${hMonthMeta.ar} ${arabicNumerals(hYearNum)} هـ`;
  
  // Gregorian companion string
  const gregorianDateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const weekdayMeta = ISLAMIC_WEEKDAYS[currentTime.getDay()];

  // Moon Phase Art Calculation based on Hijri Day
  const getMoonPhaseArt = (day: number) => {
    if (day === 1 || day === 30) return { name: 'Hilal (New Crescent)', icon: '🌙', desc: 'Birth of Lunar Month' };
    if (day >= 2 && day <= 6) return { name: 'Waxing Crescent', icon: '🌒', desc: 'Growing Radiance' };
    if (day >= 7 && day <= 9) return { name: 'First Quarter', icon: '🌓', desc: 'Half Illuminated' };
    if (day >= 10 && day <= 12) return { name: 'Waxing Gibbous', icon: '🌔', desc: 'Nearing Completion' };
    if (day >= 13 && day <= 15) return { name: 'Badr (Full Moon)', icon: '🌕', desc: 'White Sunnah Fasting Days (13, 14, 15)' };
    if (day >= 16 && day <= 19) return { name: 'Waning Gibbous', icon: '🌖', desc: 'Luminous Descent' };
    if (day >= 20 && day <= 23) return { name: 'Last Quarter', icon: '🌗', desc: 'Night Vigil Awakening' };
    return { name: 'Waning Crescent', icon: '🌘', desc: 'Concluding Cycle' };
  };

  const moonPhase = getMoonPhaseArt(hDayNum);
  const isWhiteDays = hDayNum >= 13 && hDayNum <= 15;
  const isFriday = currentTime.getDay() === 5;
  const isRamadanActive = !!(hMonthNum === 9 || forceRamadan);
  const ramadanStatus = useMemo(() => getRamadanStatus(currentTime), [currentTime]);
  const [previewRamadanCountdown, setPreviewRamadanCountdown] = useState(false);
  const shouldShowRamadanCountdown = (ramadanStatus.daysUntilRamadan <= 3 && !isRamadanActive) || previewRamadanCountdown;

  const dailyHadith = getDailyHadith();

  // Calculate Day of the Year
  const dayOfYear = useMemo(() => {
    const start = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }, [currentTime.toDateString()]);

  const dailyQuote: DailyQuoteItem = useMemo(() => {
    return getDailyQuoteForDate(currentTime);
  }, [currentTime.toDateString()]);

  // Auto-Rotating Daily Wisdom Mode (Automatically switches each new day: Ayah -> Hadith -> Quote)
  const [wisdomMode, setWisdomMode] = useState<WisdomMode>(() => {
    return dailyWisdomService.getDailyRotatingWisdomMode(new Date());
  });

  // Automatically update wisdom mode on every new day
  useEffect(() => {
    setWisdomMode(dailyWisdomService.getDailyRotatingWisdomMode(currentTime));
  }, [currentTime.toDateString()]);

  const handleNextWisdomMode = () => {
    const modes: WisdomMode[] = ['ayah', 'hadith', 'quote'];
    const nextIndex = (modes.indexOf(wisdomMode) + 1) % modes.length;
    setWisdomMode(modes[nextIndex]);
  };

  const currentWisdom: DailyWisdomSummary = useMemo(() => {
    return dailyWisdomService.getWisdomSummary(wisdomMode, currentTime);
  }, [wisdomMode, currentTime.toDateString()]);

  // Daily Wisdom Notification State
  const [isWisdomNotifEnabled, setIsWisdomNotifEnabled] = useState<boolean>(() => {
    return dailyWisdomService.isNotificationEnabled(wisdomMode);
  });
  const [wisdomNotifToast, setWisdomNotifToast] = useState<string | null>(null);

  useEffect(() => {
    setIsWisdomNotifEnabled(dailyWisdomService.isNotificationEnabled(wisdomMode));
  }, [wisdomMode]);

  const handleToggleWisdomNotif = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const current = isWisdomNotifEnabled;
    if (!current) {
      const ok = await dailyWisdomService.requestPermissionAndEnable(wisdomMode);
      if (ok) {
        setIsWisdomNotifEnabled(true);
        setWisdomNotifToast(`🔔 Push alerts active for ${wisdomMode.toUpperCase()} of the Day! Sent a test preview.`);
      } else {
        setWisdomNotifToast(`⚠️ Please allow notification permission in your browser to receive daily reminders.`);
      }
    } else {
      dailyWisdomService.setNotificationEnabled(wisdomMode, false);
      setIsWisdomNotifEnabled(false);
      setWisdomNotifToast(`🔕 Muted daily notifications for ${wisdomMode.toUpperCase()} of the Day.`);
    }
    setTimeout(() => setWisdomNotifToast(null), 4500);
  };

  const dailyAttribute: NameOfAllah = useMemo(() => {
    const idx = dayOfYear % ALL_NAMES_OF_ALLAH.length;
    return ALL_NAMES_OF_ALLAH[idx] || ALL_NAMES_OF_ALLAH[0];
  }, [dayOfYear]);

  // Quote / Wisdom audio & copy state
  const [isPlayingQuoteVoice, setIsPlayingQuoteVoice] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Daily Wisdom Like & Heart Engagement State
  const [isWisdomLiked, setIsWisdomLiked] = useState<boolean>(() => {
    return localStorage.getItem(`daily_wisdom_liked_${todayKey}_${wisdomMode}`) === 'true';
  });
  const [wisdomLikesCount, setWisdomLikesCount] = useState<number>(() => {
    const base = 142 + (dayOfYear * 7) % 89;
    const isLiked = localStorage.getItem(`daily_wisdom_liked_${todayKey}_${wisdomMode}`) === 'true';
    return base + (isLiked ? 1 : 0);
  });
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Network & Connectivity Speed State (Responsive to WiFi and Mobile Data)
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [connectionType, setConnectionType] = useState<string>('fast');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const conn = (navigator as any).connection;
      const updateConn = () => {
        setConnectionType(conn.effectiveType || conn.type || 'fast');
      };
      conn.addEventListener('change', updateConn);
      updateConn();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Soothing crystal sound chime for Likes and Dhikr clicks
  const playTactileChime = (type: 'like' | 'dhikr' | 'streak') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'like') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.14); // A5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'dhikr') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'streak') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {}
  };

  const handleToggleLikeWisdom = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTactileChime('like');
    const next = !isWisdomLiked;
    setIsWisdomLiked(next);
    setWisdomLikesCount(prev => next ? prev + 1 : Math.max(1, prev - 1));
    localStorage.setItem(`daily_wisdom_liked_${todayKey}_${wisdomMode}`, String(next));

    if (next) {
      setShowHeartPop(true);
      if (addHasanat) addHasanat(2);
      setTimeout(() => setShowHeartPop(false), 900);
    }
  };

  // Daily AI Banner Image & Spiritual Atmosphere State
  const [bannerVariation, setBannerVariation] = useState<number>(() => {
    const saved = localStorage.getItem('sanctuary_banner_variation');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [dailyBanner, setDailyBanner] = useState<DailyBannerData>(() => {
    return getSynchronousDailyBannerFallback(dailyAttribute, currentTime, bannerVariation);
  });

  const [isBannerImageLoaded, setIsBannerImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetchDailyBanner(dailyAttribute, currentTime, bannerVariation).then((banner) => {
      if (isMounted) {
        setDailyBanner(banner);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dailyAttribute.id, currentTime.toDateString(), bannerVariation]);

  const handleCycleBannerTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVar = (bannerVariation + 1) % 3;
    setBannerVariation(nextVar);
    setIsBannerImageLoaded(false);
    localStorage.setItem('sanctuary_banner_variation', String(nextVar));
  };

  const handlePlayQuoteVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      if (isPlayingQuoteVoice) {
        window.speechSynthesis.cancel();
        setIsPlayingQuoteVoice(false);
        return;
      }
      window.speechSynthesis.cancel();
      const textToSpeak = `${currentWisdom.arabic ? currentWisdom.arabic + '. ' : ''}${currentWisdom.mainText}. ${currentWisdom.source}.`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingQuoteVoice(true);
      utterance.onend = () => setIsPlayingQuoteVoice(false);
      utterance.onerror = () => setIsPlayingQuoteVoice(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `✨ ${currentWisdom.badge}\n${currentWisdom.arabic ? currentWisdom.arabic + '\n' : ''}"${currentWisdom.mainText}"\n— ${currentWisdom.source}\n\n💡 Reflection: ${currentWisdom.reflection}\n📲 Shared via Aloha Sanctuary`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2200);
  };

  const handleShareQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareService.open({
      title: currentWisdom.badge,
      badge: currentWisdom.mode === 'ayah' ? 'Ayah of the Day' : currentWisdom.mode === 'hadith' ? 'Hadith of the Day' : 'Quote of the Day',
      text: currentWisdom.mainText,
      arabic: currentWisdom.arabic,
      source: currentWisdom.source,
      author: currentWisdom.author,
      url: window.location.href
    });
  };

  // Get User Location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setLocation({ lat: 21.4225, lng: 39.8262 }) // Fallback Makkah
      );
    } else {
      setLocation({ lat: 21.4225, lng: 39.8262 });
    }
  }, []);

  // Prayer times computation
  useEffect(() => {
    if (location) {
      const methodId = localStorage.getItem('prayer-method') || 'MuslimWorldLeague';
      const savedOffsets = localStorage.getItem('prayer-offsets');
      const offsets = savedOffsets ? JSON.parse(savedOffsets) : {};
      
      setPrayerData(getPrayerTimes(location.lat, location.lng, methodId, offsets));
    }
  }, [location, currentTime.getMinutes()]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) Notification.requestPermission();
  };

  const prayerTimes = prayerData ? [
    { name: 'Fajr', time: formatTime(prayerData.fajr), icon: Sunrise, active: prayerData.currentPrayer === 'Fajr' },
    { name: 'Sunrise', time: formatTime(prayerData.sunrise), icon: CloudSun, active: false },
    { name: 'Dhuhr', time: formatTime(prayerData.dhuhr), icon: Sun, active: prayerData.currentPrayer === 'Dhuhr' },
    { name: 'Asr', time: formatTime(prayerData.asr), icon: CloudSun, active: prayerData.currentPrayer === 'Asr' },
    { name: 'Maghrib', time: formatTime(prayerData.maghrib), icon: Sunset, active: prayerData.currentPrayer === 'Maghrib' },
    { name: 'Isha', time: formatTime(prayerData.isha), icon: Moon, active: prayerData.currentPrayer === 'Isha' },
  ] : [];

  const DAILY_VERSES = [
    {
      type: 'quran',
      arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "For indeed, with hardship [will be] ease.",
      reference: "Surah Al-Inshirah [94:6]",
      link: { tab: 'quran', extra: { surahNumber: 94 } }
    },
    {
      type: 'quran',
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      translation: "Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.",
      reference: "Surah Al-Baqarah [2:201]",
      link: { tab: 'quran', extra: { surahNumber: 2 } }
    },
    {
      type: 'quran',
      arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
      translation: "Allah is the Light of the heavens and the earth.",
      reference: "Surah An-Nur [24:35]",
      link: { tab: 'quran', extra: { surahNumber: 2 } }
    },
    {
      type: 'quran',
      arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      translation: "Unquestionably, by the remembrance of Allah hearts are assured.",
      reference: "Surah Ar-Ra'd [13:28]",
      link: { tab: 'resources', extra: { resId: 'adhkar' } }
    }
  ];

  const getDailyRevelation = () => {
    const day = new Date().getUTCDate();
    const useHadith = day % 2 === 0;

    if (useHadith) {
      return {
        type: 'hadith',
        arabic: dailyHadith.arabic,
        translation: dailyHadith.english,
        reference: `${dailyHadith.narrator} • ${dailyHadith.collection}`,
        link: { tab: 'resources', extra: { resId: 'hadith' } }
      };
    }

    const verseIndex = (day % (DAILY_VERSES.length * 2)) % DAILY_VERSES.length;
    return DAILY_VERSES[verseIndex];
  };

  const dailyRevelation = getDailyRevelation();

  const handleCopyAyah = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${dailyRevelation.arabic}\n"${dailyRevelation.translation}"\n- ${dailyRevelation.reference}`);
    setCopiedAyah(true);
    setTimeout(() => setCopiedAyah(false), 2000);
  };

  const isPlayingDailyAttribute = ytState.isPlaying && ytState.activeNameId === dailyAttribute.id;

  const handlePlayDailyAttributeAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingDailyAttribute) {
      YoutubeNamesService.pause();
    } else {
      YoutubeNamesService.play(dailyAttribute.id);
    }
  };

  return (
    <div className="relative space-y-8 md:space-y-10 pb-24 max-w-7xl mx-auto">
      
      {/* 🌌 Atmospheric Background Animated Ambient Orbs & Celestial Particles */}
      <div className="absolute inset-0 -top-10 overflow-hidden pointer-events-none -z-10 select-none">
        {/* Luminous Gold Celestial Orb */}
        <motion.div 
          animate={{ 
            x: [0, 25, -20, 0], 
            y: [0, -20, 15, 0],
            scale: [1, 1.12, 0.95, 1],
            opacity: [0.12, 0.22, 0.14, 0.12]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 left-1/4 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/0 blur-[100px]"
        />

        {/* Luminous Emerald Deep Spiritual Orb */}
        <motion.div 
          animate={{ 
            x: [0, -30, 20, 0], 
            y: [0, 25, -15, 0],
            scale: [0.95, 1.15, 1, 0.95],
            opacity: [0.10, 0.20, 0.12, 0.10]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-48 right-10 w-[420px] h-[420px] rounded-full bg-gradient-to-bl from-emerald-500/25 via-teal-500/10 to-transparent blur-[110px]"
        />

        {/* Luminous Midnight Purple / Sapphire Light */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.16, 0.08]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-10 w-[460px] h-[460px] rounded-full bg-gradient-to-r from-purple-600/15 via-indigo-600/10 to-transparent blur-[120px]"
        />

        {/* Subtle Floating Star Sparkles */}
        <div className="absolute inset-0 opacity-40">
          {[
            { top: '8%', left: '15%', delay: 0, duration: 4 },
            { top: '18%', left: '82%', delay: 1.5, duration: 5 },
            { top: '35%', left: '48%', delay: 0.8, duration: 3.8 },
            { top: '55%', left: '12%', delay: 2.2, duration: 4.5 },
            { top: '72%', left: '88%', delay: 1.1, duration: 4.2 },
            { top: '85%', left: '35%', delay: 2.8, duration: 5.2 }
          ].map((star, sIdx) => (
            <motion.div
              key={`star-${sIdx}`}
              style={{ top: star.top, left: star.left }}
              animate={{ 
                opacity: [0.15, 0.85, 0.15],
                scale: [0.8, 1.3, 0.8]
              }}
              transition={{ 
                duration: star.duration, 
                repeat: Infinity, 
                ease: "easeInOut", 
                delay: star.delay 
              }}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
            />
          ))}
        </div>
      </div>
      
      {/* 0. FLOATING HEART-EASING HOPE BEACON (15s Floating Spotlight that floats over screen without displacing page layout) */}
      <AnimatePresence>
        {showHeartAtEase ? (
          <motion.div 
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 right-3 sm:right-6 md:right-8 z-50 max-w-xl w-[calc(100vw-1.5rem)] sm:w-[540px] drop-shadow-2xl pointer-events-auto"
          >
            <MindEasingHopeBeacon 
              key="hope-beacon"
              onClose={() => setShowHeartAtEase(false)}
              onNavigate={onNavigate} 
              addHasanat={addHasanat} 
              durationSeconds={15}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 1. OFFICIAL SANCTUARY PARTNER RIBBON (Begins the Home Page top as shown in image) */}
      <motion.div 
        id="tour-official-ribbon"
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.006 }}
        className="relative overflow-hidden glass-panel border-white/5 p-3.5 sm:p-4 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-amber-500/10 via-[#061828]/80 to-emerald-500/10 gap-3 shadow-xl border border-amber-400/25 group"
      >
        {/* Shimmering Border Light Sweep */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-amber-300 to-transparent pointer-events-none opacity-60"
        />

        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0 text-sm cursor-pointer"
          >
            🌴
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em]">Sanctuary Foundation</p>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30 animate-pulse">ALOHA GROUP</span>
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-tight italic">Aloha Sanctuary &bull; Premium Spiritual Excellence</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Responsive Network & Data Speed Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-[10px] font-bold text-slate-300 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isOnline ? (connectionType === '4g' || connectionType === 'fast' ? '⚡ Ultra-Fast Sync' : '📶 Cloud Sync Active') : '💾 Fast Offline Cache'}</span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate('market')}
            className="px-5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase rounded-xl transition-all tracking-[0.2em] cursor-pointer shadow-md shadow-amber-500/10"
          >
            Suq Al-Mubaraki
          </motion.button>
        </div>
      </motion.div>
      
      {/* 2. DYNAMIC DAILY HERO BANNER (Ayah of the Day Hero Banner, Card 2 as in image) */}
      <motion.div 
        id="tour-salam-soul"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.003 }}
        className={`relative overflow-hidden rounded-[2.2rem] md:rounded-[2.8rem] border ${dailyBanner.borderClass} p-6 sm:p-8 md:p-9 min-h-[230px] md:min-h-[260px] flex flex-col justify-between shadow-2xl transition-all duration-700 group`}
      >
        {/* Dynamic High-Quality Background Image with Blur-Up & Fallback */}
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <img 
            src={dailyBanner.imageUrl || dailyBanner.fallbackImageUrl}
            alt={dailyQuote.theme}
            referrerPolicy="no-referrer"
            onLoad={() => setIsBannerImageLoaded(true)}
            onError={(e) => {
              // Fallback to local high-res asset on network failure
              (e.currentTarget as HTMLImageElement).src = dailyBanner.fallbackImageUrl;
              setIsBannerImageLoaded(true);
            }}
            className={`w-full h-full object-cover object-center transition-all duration-1000 transform scale-105 group-hover:scale-100 ${
              isBannerImageLoaded ? 'opacity-35 blur-0' : 'opacity-20 blur-sm'
            }`}
          />
        </div>

        {/* Atmospheric Glass & AI Light Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r ${dailyBanner.glowGradient} z-0 pointer-events-none`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020a12]/95 via-[#04121e]/80 to-transparent z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.18)_0%,rgba(16,185,129,0.1)_45%,transparent_75%)] z-0 pointer-events-none" />
        
        <div className="absolute top-0 right-0 p-8 opacity-[0.07] pointer-events-none scale-125 transform-gpu z-10">
          <Quote size={160} style={{ color: dailyQuote.accentColor || dailyBanner.accentColor }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          
          {/* Top Bar inside Banner: Single Daily Wisdom Header with Daily Rotation Pill + Notification Alert Toggle + Atmosphere */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Daily Wisdom Rotating Badge & Switcher */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-xl shadow-inner">
                {wisdomMode === 'ayah' && <BookOpen size={14} className="text-emerald-400" />}
                {wisdomMode === 'hadith' && <Sparkles size={14} className="text-amber-400" />}
                {wisdomMode === 'quote' && <Quote size={14} className="text-sky-400" />}
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  {wisdomMode === 'ayah' ? 'Ayah of the Day' : wisdomMode === 'hadith' ? 'Hadith of the Day' : 'Quote of the Day'}
                </span>
                <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30">
                  Daily Auto-Switch
                </span>
              </div>

              {/* Replay 15s Heart at Ease Spotlight Button */}
              <button
                onClick={() => setShowHeartAtEase(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Open 15-Second Heart at Ease Spotlight"
              >
                <Sparkles size={11} className="text-emerald-400" />
                <span>Heart At Ease (15s)</span>
              </button>

              {/* Interchange Button to cycle between Ayah, Hadith, Quote */}
              <button
                onClick={handleNextWisdomMode}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                title="Switch to next daily wisdom card (Ayah / Hadith / Quote)"
              >
                <RotateCcw size={11} className="text-amber-400" />
                <span className="hidden sm:inline">Interchange</span>
              </button>
            </div>

            {/* Right Action Icons: Notification Bell & Theme Atmosphere Switcher */}
            <div className="flex items-center gap-2">
              {/* Daily Push Notification Toggle */}
              <button
                onClick={handleToggleWisdomNotif}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer backdrop-blur-md ${
                  isWisdomNotifEnabled
                    ? 'bg-amber-400/20 border border-amber-400/40 text-amber-300 hover:bg-amber-400/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={`Toggle Daily ${wisdomMode.toUpperCase()} Push Notifications`}
              >
                <Bell size={12} className={isWisdomNotifEnabled ? 'text-amber-400 animate-bounce' : 'text-slate-500'} />
                <span>{isWisdomNotifEnabled ? 'Alerts ON' : 'Enable Alerts'}</span>
              </button>

              {/* Theme Atmosphere Switcher */}
              <button 
                onClick={handleCycleBannerTheme}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                title="Switch Visual Spiritual Atmosphere & Daily Theme"
              >
                <RotateCcw size={11} className="text-amber-300" />
                <span className="hidden sm:inline">Change Atmosphere</span>
              </button>

              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md">
                <span className="text-emerald-300 font-serif text-xs font-bold font-arabic">
                  {isFriday ? 'جُمُعَة مُبَارَكَة' : 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notification Alert Feedback */}
          <AnimatePresence>
            {wisdomNotifToast && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2 backdrop-blur-md"
              >
                <Bell size={14} className="text-amber-400 shrink-0" />
                <span>{wisdomNotifToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Wisdom Gem Content (Minimized words & punchy clarity) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="px-2.5 py-0.5 rounded-lg text-black font-black text-[10px] uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: currentWisdom.accentColor || '#f59e0b' }}
                  >
                    {currentWisdom.author}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold">&bull; {currentWisdom.source}</span>
                </div>
                
                {/* Minimized Punchy Main Text */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  "{currentWisdom.mainText}"
                </h1>
              </div>
              
              <div className="pt-0.5 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <p className="text-[11px] font-semibold text-amber-300/90 italic bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl inline-block shadow-sm">
                  ✨ {currentWisdom.reflection}
                </p>
              </div>
            </div>

            {/* Arabic Calligraphy Pillar */}
            <div className="md:col-span-4 flex flex-col items-center md:items-end justify-center">
              <div className="p-4 rounded-2xl bg-black/50 border border-white/15 text-center space-y-1.5 shadow-inner backdrop-blur-md max-w-xs w-full">
                <p className="arabic-text text-xl sm:text-2xl font-arabic font-bold text-amber-300 drop-shadow-md leading-relaxed">
                  {currentWisdom.arabic || 'حِكْمَةُ الْيَوْمِ وَنُورُ الْقَلْبِ'}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {currentWisdom.mode === 'ayah' ? 'Sacred Quranic Verse' : currentWisdom.mode === 'hadith' ? 'Prophetic Wisdom' : 'Daily Islamic Wisdom'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons with Interactive Like / Heart Button */}
          <div className="flex flex-wrap items-center gap-3 pt-1 relative">
            {/* Heart / Like Wisdom Engagement Button with live counter */}
            <button 
              onClick={handleToggleLikeWisdom}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer relative overflow-hidden ${
                isWisdomLiked
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 shadow-rose-500/20'
                  : 'bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15'
              }`}
              title={isWisdomLiked ? 'Liked (+2 Hasanat saved)' : 'Like & Save Daily Reflection (+2 Hasanat)'}
            >
              <Heart 
                size={15} 
                className={`transition-transform duration-300 ${
                  isWisdomLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 group-hover:scale-110'
                }`} 
              />
              <span>{isWisdomLiked ? 'Liked' : 'Like'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] font-mono font-bold text-rose-300">
                {wisdomLikesCount}
              </span>

              {/* Floating Heart Burst Particle Animation */}
              <AnimatePresence>
                {showHeartPop && (
                  <motion.div 
                    initial={{ opacity: 1, scale: 0.5, y: 0 }}
                    animate={{ opacity: 0, scale: 1.8, y: -25 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Heart size={28} className="fill-rose-400 text-rose-400 drop-shadow-md" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button 
              onClick={handlePlayQuoteVoice}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                isPlayingQuoteVoice
                  ? 'bg-amber-400 text-black shadow-amber-400/25 animate-pulse'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
              title={`Listen to this daily ${wisdomMode}`}
            >
              {isPlayingQuoteVoice ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
              <span>{isPlayingQuoteVoice ? 'Pause Voice' : 'Listen Audio'}</span>
            </button>

            <button 
              onClick={handleShareQuote}
              className="px-5 py-2.5 bg-brand-primary text-brand-depth font-black rounded-2xl hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 cursor-pointer"
              title="Share across WhatsApp, Telegram, X, Facebook, and Email"
            >
              <Share2 size={14} />
              <span>Share {wisdomMode.toUpperCase()}</span>
            </button>

            <button 
              onClick={handleCopyQuote}
              className="px-4 py-2.5 bg-white/10 text-white font-bold rounded-2xl border border-white/15 hover:bg-white/15 hover:border-brand-primary/40 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider backdrop-blur-md cursor-pointer"
              title="Copy wisdom text to clipboard"
            >
              {copiedQuote ? <Check size={14} className="text-emerald-400" /> : <Quote size={14} />}
              <span>{copiedQuote ? 'Copied!' : 'Copy'}</span>
            </button>

            <button 
              onClick={handleContinue}
              className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-2xl border border-white/15 hover:bg-white/15 hover:border-brand-primary/40 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider backdrop-blur-md cursor-pointer"
            >
              <BookOpen size={14} />
              <span>{lastRead ? `Resume ${lastRead.title}` : 'Read Quran'}</span>
            </button>

            {/* Expand Visual Artwork Lightbox Button */}
            <button 
              onClick={() => setIsBannerLightboxOpen(true)}
              className="px-4 py-2.5 bg-white/10 text-white font-bold rounded-2xl border border-white/15 hover:bg-white/15 hover:border-brand-primary/40 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider backdrop-blur-md cursor-pointer"
              title="Expand & view full sanctuary atmosphere artwork"
            >
              <ZoomIn size={14} className="text-amber-300" />
              <span>Expand Visual</span>
            </button>

            {isFriday ? (
              <button 
                onClick={() => onNavigate('resources', { resId: 'quran', surahNumber: 18 })}
                className="px-5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/35 font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                title="Read Surah Al-Kahf on Friday"
              >
                <BookOpen size={14} />
                <span>Surah Al-Kahf (18)</span>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('resources', { resId: 'adhkar' })}
                className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-2xl border border-white/15 hover:bg-white/15 hover:border-brand-primary/40 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
              >
                <span>Find Calm</span>
                <Moon size={14} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2.1 QUICK SANCTUARY EXPLORER (Breezy light navigation & instant discovery matrix for all features) */}
      <QuickSanctuaryExplorer onNavigate={onNavigate} />

      {/* 3. ARTISTIC PRAYER CONSOLE & SACRED ISLAMIC LUNAR-SOLAR CALENDAR */}
      <div 
        id="tour-prayer-console"
        className="glass-panel p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-[#061828]/95 via-[#03101C]/90 to-[#020A12]/95 relative overflow-hidden backdrop-blur-3xl shadow-2xl space-y-8"
      >
        {/* Ambient Cosmic Background Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header: Makkah Time + Sacred Dual Hijri/Gregorian Calendar Card + Countdown */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Holy Makkah Time & Local Location Coordinates */}
          <div className="lg:col-span-3 space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em]">Live Sanctuary Clock</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-md">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h2>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-semibold text-slate-400">
              <MapPin size={14} className="text-brand-primary shrink-0" />
              <span>{location ? `${location.lat.toFixed(2)}°N, ${location.lng.toFixed(2)}°E` : 'Holy Makkah Sanctuary'}</span>
            </div>
          </div>

          {/* Center Column: Masterpiece Dual Hijri-Gregorian Calendar & Moon Phase Art */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-emerald-500/10 border border-amber-400/30 relative overflow-hidden shadow-inner group">
              {/* Subtle Arabesque Pattern Texture */}
              <div className="absolute -right-6 -bottom-6 text-6xl opacity-10 select-none pointer-events-none">
                {moonPhase.icon}
              </div>

              <div className="space-y-3 relative z-10">
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    <span>{moonPhase.icon}</span>
                    <span>{hijriEnglishString}</span>
                  </div>

                  {hMonthMeta.sacred && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
                      Sacred Month
                    </span>
                  )}
                </div>

                {/* Main Dates (English + Arabic Calligraphy) */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      {hMonthMeta.en} • <span className="text-amber-300 font-serif font-arabic text-lg sm:text-xl">{hijriArabicString}</span>
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    {gregorianDateString} &bull; <span className="text-slate-400">{weekdayMeta.title}</span>
                  </p>
                </div>

                {/* Lunar Phase & Spiritual Day Details */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-200/90 flex items-center gap-1.5">
                    <span>{moonPhase.name}</span>
                    {isWhiteDays && <span className="text-emerald-400 font-bold">• White Fasting Day</span>}
                  </span>
                  <button
                    onClick={() => onNavigate('resources', { resId: 'calendar' })}
                    className="text-brand-primary hover:underline font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    View Full Hijri Calendar &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Next Prayer Countdown Ring */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            {prayerData ? (
              (() => {
                const now = currentTime.getTime();
                const nextMs = new Date(prayerData.nextTime).getTime();
                const diffMs = Math.max(0, nextMs - now);
                
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
                
                const totalEstWindow = 5 * 3600 * 1000;
                const elapsedMs = Math.max(0, totalEstWindow - diffMs);
                const progressPct = Math.min(100, Math.max(10, (elapsedMs / totalEstWindow) * 100));

                const radius = 54;
                const circumference = 2 * Math.PI * radius;
                const strokeOffset = circumference - (circumference * progressPct) / 100;

                return (
                  <div className="flex items-center gap-5 w-full justify-center lg:justify-end">
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 140 140">
                        <defs>
                          <linearGradient id="sanctuaryPrayerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="60%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                        </defs>

                        {/* Track */}
                        <circle
                          cx="70"
                          cy="70"
                          r={radius}
                          className="stroke-white/10"
                          strokeWidth="7"
                          fill="none"
                        />

                        {/* Progress */}
                        <motion.circle
                          cx="70"
                          cy="70"
                          r={radius}
                          stroke="url(#sanctuaryPrayerGrad)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>

                      {/* Content Inside Ring */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <p className="text-[8px] font-black text-amber-300 uppercase tracking-[0.2em]">Next Prayer</p>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">{prayerData.nextPrayer}</h4>
                        <span className="text-[10px] font-mono font-bold text-slate-300">{formatTime(prayerData.nextTime)}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="px-3.5 py-1 rounded-xl bg-black/50 border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-mono font-black text-white">
                          {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Remaining Until {prayerData.nextPrayer}</p>
                      
                      <button 
                        onClick={requestNotificationPermission}
                        className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                        title="Configure Prayer Alerts"
                      >
                        <Bell size={12} className="text-amber-400" />
                        <span>Adhan Alerts</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="h-28 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Integrated 5-Prayer Ribbon Bar */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {prayerTimes.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div 
                  key={`home-prayer-ribbon-${p.name}-${idx}`}
                  className={`p-3.5 rounded-2xl text-center border transition-all relative overflow-hidden flex flex-col items-center justify-between gap-1.5 ${
                    p.active 
                      ? 'bg-gradient-to-b from-brand-primary/25 to-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/20' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${p.active ? 'text-brand-primary' : 'text-slate-400'}`}>
                      {p.name}
                    </span>
                    <Icon size={14} className={p.active ? 'text-brand-primary' : 'text-slate-500'} />
                  </div>
                  <p className={`text-base font-black font-mono tracking-tight ${p.active ? 'text-white' : 'text-slate-200'}`}>
                    {p.time}
                  </p>
                  {p.active && (
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-brand-primary text-brand-depth">
                      Current Window
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. RAMADAN HUB / COUNTDOWN / WHITE DAYS WIDGET LOGIC */}
      {isRamadanActive ? (
        <RamadanHub 
          currentTime={currentTime} 
          prayerData={prayerData} 
          addHasanat={addHasanat} 
          onExitRamadanMode={() => {
            localStorage.setItem('force-ramadan-mode', 'false');
            setForceRamadan(false);
            setPreviewRamadanCountdown(false);
          }}
        />
      ) : shouldShowRamadanCountdown ? (
        <RamadanCountdownWidget 
          currentTime={currentTime}
          onNavigate={onNavigate}
          addHasanat={addHasanat}
          onActivateRamadanMode={() => {
            localStorage.setItem('force-ramadan-mode', 'true');
            window.dispatchEvent(new CustomEvent('ramadan_mode_updated'));
            setForceRamadan(true);
          }}
          onClosePreview={() => setPreviewRamadanCountdown(false)}
        />
      ) : (
        /* SACRED WHITE DAYS (AYYAM AL-BEED) FASTING WIDGET (Replaced by Ramadan Countdown within 3 days of Ramadan) */
        <WhiteDaysWidget 
          addHasanat={addHasanat} 
          onNavigateToFastTracker={() => onNavigate('resources', { resId: 'tracker' })} 
          daysUntilRamadan={ramadanStatus.daysUntilRamadan}
          onPreviewRamadanCountdown={() => setPreviewRamadanCountdown(true)}
        />
      )}

      {/* 5. DEVOTION STREAK FIRE CARD */}
      <div id="tour-streak-fire" className={`relative overflow-hidden rounded-[2.5rem] p-6 sm:p-7 transition-all duration-500 border ${
        streak >= 7
          ? 'bg-gradient-to-r from-orange-950/80 via-red-950/60 to-amber-950/80 border-orange-500/60 shadow-[0_0_50px_rgba(249,115,22,0.35)]'
          : 'bg-[#061828]/60 border-white/10'
      }`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border transition-all shrink-0 ${
              streak >= 7
                ? 'bg-gradient-to-br from-orange-500 via-red-500 to-amber-400 border-orange-300 shadow-[0_0_30px_rgba(249,115,22,0.85)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Flame 
                size={32} 
                className={streak >= 7 ? 'text-white fill-amber-200 animate-pulse' : 'text-slate-400'} 
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                  streak >= 7 ? 'text-amber-300' : 'text-slate-400'
                }`}>
                  Spiritual Devotion Streak
                </span>
                {streak >= 7 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/25 text-orange-200 border border-orange-400/40 text-[9px] font-black uppercase">
                    7+ Days Active 🔥
                  </span>
                )}
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">
                {streak} {streak === 1 ? 'Day' : 'Days'} Istiqamah Streak
              </h4>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                {streak >= 7
                  ? `Masha'Allah! You have maintained an unbroken ${streak}-day spiritual streak.`
                  : `Return daily to nurture your spiritual consistency and ignite your 7-Day Istiqamah Flame.`}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (updateStreak) updateStreak();
              if (addHasanat) addHasanat(5);
            }}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-xl shrink-0 ${
              streak >= 7
                ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-brand-depth hover:brightness-110 shadow-orange-500/30 border border-amber-300/40'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-brand-primary/40'
            }`}
          >
            <Flame size={15} className={streak >= 7 ? 'fill-current animate-pulse' : ''} />
            <span>{streak >= 7 ? 'Stoke The Flame (+5)' : 'Claim Daily Streak (+5)'}</span>
          </button>
        </div>
      </div>

      {/* 7. DAILY SPIRITUAL VIGOR & DISCIPLINE TRACKERS */}
      <div id="tour-daily-vigor" className="glass-panel p-6 sm:p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#061828]/95 via-brand-sidebar to-black/70 space-y-8 shadow-2xl">
        
        {/* Header & Vitality Summary */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary flex items-center gap-1.5">
                <Sparkles size={14} /> Daily Spiritual Disciplines
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black font-mono">
                {vigorPercentage}% Completed
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
              Daily Vigor & Actions
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Track your prayers, prophetic hadith reflection, and Quran recitation.
            </p>
          </div>

          {/* Quick Stats Pill Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full lg:w-auto">
            <div className="text-center px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-lg font-black text-emerald-400 font-mono">{completedPrayersCount}/5</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Prayers</p>
            </div>
            <div className="text-center px-4 py-3 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-lg font-black text-amber-400 font-mono">{quranAyahsRead}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Ayahs</p>
            </div>
            <div className="text-center px-4 py-3 bg-white/5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
              <p className="text-lg font-black text-purple-400 font-mono">{hadithReflected ? '1/1' : '0/1'}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Hadith</p>
            </div>
          </div>
        </div>

        {/* 5 DAILY PRAYERS INTERACTIVE CHECKLIST */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sunrise size={16} className="text-emerald-400" />
              <span>5 Obligatory Prayers</span>
            </h4>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('resources', { resId: 'five_pillars' })}
                className="text-[11px] font-black text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>📖 Explore 5 Pillars of Islam</span>
              </button>
              <span className="text-[11px] text-slate-400 font-medium">
                Tap to complete (+2 Hasanat)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: 'Fajr', icon: Sunrise, time: prayerData ? formatTime(prayerData.fajr) : '05:15 AM' },
              { name: 'Dhuhr', icon: Sun, time: prayerData ? formatTime(prayerData.dhuhr) : '12:30 PM' },
              { name: 'Asr', icon: CloudSun, time: prayerData ? formatTime(prayerData.asr) : '03:45 PM' },
              { name: 'Maghrib', icon: Sunset, time: prayerData ? formatTime(prayerData.maghrib) : '06:40 PM' },
              { name: 'Isha', icon: Moon, time: prayerData ? formatTime(prayerData.isha) : '08:05 PM' }
            ].map((p, idx) => {
              const isDone = !!prayersCompleted[p.name];
              const Icon = p.icon;
              return (
                <button
                  key={`ramadan-hub-prayer-${p.name}-${idx}`}
                  onClick={() => togglePrayerCompleted(p.name)}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
                    isDone 
                      ? 'bg-gradient-to-b from-emerald-500/25 to-emerald-950/40 border-emerald-500/60 text-white shadow-lg shadow-emerald-500/15' 
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon size={16} className={isDone ? 'text-emerald-400' : 'text-slate-400'} />
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all ${
                      isDone ? 'bg-emerald-400 text-black font-black' : 'border border-slate-600'
                    }`}>
                      {isDone && <Check size={12} />}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-sm text-white tracking-wide">{p.name}</p>
                    <p className="text-[11px] font-mono text-slate-400">{p.time}</p>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isDone ? 'bg-emerald-400/20 text-emerald-300' : 'text-slate-500'
                  }`}>
                    {isDone ? 'Completed ✓' : '+2 Hasanat'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TRI-PILLAR INTERACTIVE TRACKERS: HADITH, QURAN & QUICK DHIKR BEAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Hadith Reflection Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 flex flex-col justify-between hover:border-brand-primary/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Hadith Reflection</h4>
                    <p className="text-[10px] text-slate-400">Daily Sunnah Guidance</p>
                  </div>
                </div>
                {hadithReflected && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border border-emerald-500/30">
                    Reflected ✓
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-wider">{dailyHadith.narrator}</p>
                <p className="text-xs text-slate-200 font-medium leading-relaxed italic line-clamp-3">
                  "{dailyHadith.english}"
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button 
                onClick={toggleHadithReflected}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  hadithReflected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-brand-primary text-brand-depth hover:bg-brand-primary/90 shadow-md'
                }`}
              >
                {hadithReflected ? 'Reflected ✓' : 'Mark Reflected (+2)'}
              </button>
              <button 
                onClick={handleHadithClick}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold uppercase border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen size={14} />
                <span>Library</span>
              </button>
            </div>
          </div>

          {/* Quran Recitation Counter Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Quran Recitation</h4>
                    <p className="text-[10px] text-slate-400">Daily Recitation Progress</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
                  {quranAyahsRead} Ayahs
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium">
                Log your recitation today to earn Hasanat rewards and maintain your spiritual connection with the Holy Quran.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={() => incrementQuranAyahs(1)}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
              >
                +1 Ayah
              </button>
              <button 
                onClick={() => incrementQuranAyahs(5)}
                className="flex-1 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer"
              >
                +5 Ayahs
              </button>
              <button 
                onClick={() => onNavigate('quran')}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold uppercase border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>Read</span>
              </button>
            </div>
          </div>

          {/* Quick Dhikr & Tasbih Interactive Bead Station */}
          <div className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all col-span-1 md:col-span-2 lg:col-span-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Quick Dhikr Bead</h4>
                    <p className="text-[10px] text-slate-400">Instant Remembrance</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setDhikrPhraseIdx(prev => (prev + 1) % dhikrPhrases.length);
                      playTactileChime('dhikr');
                    }}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-[9px] font-bold uppercase cursor-pointer"
                    title="Change Dhikr Phrase"
                  >
                    <RotateCcw size={11} />
                  </button>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-xl border border-emerald-400/20">
                    {dhikrCount} / 33
                  </span>
                </div>
              </div>

              {/* Phrase Display */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-center space-y-0.5">
                <p className="text-sm font-bold font-arabic text-emerald-300">
                  {dhikrPhrases[dhikrPhraseIdx]?.ar}
                </p>
                <p className="text-[10px] font-semibold text-slate-300">
                  {dhikrPhrases[dhikrPhraseIdx]?.en} &bull; <span className="text-slate-400 text-[9px]">{dhikrPhrases[dhikrPhraseIdx]?.tr}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button 
                onClick={() => {
                  playTactileChime('dhikr');
                  incrementDhikr();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Tap Dhikr</span>
                <span className="w-4 h-4 rounded-full bg-slate-950/30 text-white text-[9px] flex items-center justify-center font-mono font-bold">
                  +1
                </span>
              </button>
              <button 
                onClick={() => onNavigate('resources', { resId: 'tasbih' })}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold uppercase border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Open Full 3D Digital Tasbih"
              >
                <span>Tasbih</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Universal Media Lightbox Expansion Modal */}
      <MediaLightboxModal
        isOpen={isBannerLightboxOpen}
        onClose={() => setIsBannerLightboxOpen(false)}
        media={{
          url: dailyBanner.imageUrl || dailyBanner.fallbackImageUrl,
          title: dailyQuote.theme || 'Sanctuary Atmospheric Artwork',
          caption: `${dailyQuote.quote || ''} — ${dailyQuote.source || ''}`,
          author: 'Habibi Sanctuary Sacred Visuals'
        }}
      />

    </div>
  );
}
