import { useState, useEffect, useCallback } from 'react';
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
  Gamepad2,
  ShoppingBag,
  Library,
  Flame,
  Heart,
  Target,
  Crown,
  Star,
  CheckCircle2,
  Check,
  CheckSquare,
  Award,
  Activity,
  RotateCcw,
  Plus,
  HeartHandshake,
  Volume2,
  Pause
} from 'lucide-react';
import { getDailyHadith } from '../data/hadiths.ts';
import { getPrayerTimes, formatTime, PrayerTimeData } from '../services/prayerService.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';
import DailyVirtues from './DailyVirtues.tsx';
import RamadanHub from './RamadanHub.tsx';
import salamSoulBg from '../assets/images/salam_soul_bg_1783445291609.jpg';

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
  const [notifiedPrayers, setNotifiedPrayers] = useState<Set<string>>(new Set());
  const [lastRead, setLastRead] = useState<any>(null);
  const [voicePlayback, setVoicePlayback] = useState<VoicePlaybackState>(VoiceService.getState());

  useEffect(() => {
    const unsub = VoiceService.subscribe(setVoicePlayback);
    return () => {
      unsub();
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
    if (saved) setLastRead(JSON.parse(saved));
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

  const [isFastingToday, setIsFastingToday] = useState<boolean>(() => {
    return localStorage.getItem(`daily_vigor_fasting_${todayKey}`) === 'true';
  });

  const [sadaqahGiven, setSadaqahGiven] = useState<boolean>(() => {
    return localStorage.getItem(`daily_vigor_sadaqah_${todayKey}`) === 'true';
  });

  // Trackers Handlers
  const togglePrayerCompleted = (prayerName: string) => {
    const nextState = !prayersCompleted[prayerName];
    const updated = { ...prayersCompleted, [prayerName]: nextState };
    setPrayersCompleted(updated);
    localStorage.setItem(`daily_vigor_prayers_${todayKey}`, JSON.stringify(updated));
    if (nextState && addHasanat) {
      addHasanat(15);
    }
  };

  const toggleHadithReflected = () => {
    const next = !hadithReflected;
    setHadithReflected(next);
    localStorage.setItem(`daily_vigor_hadith_${todayKey}`, String(next));
    if (next && addHasanat) {
      addHasanat(20);
    }
  };

  const incrementQuranAyahs = (amount: number) => {
    const next = quranAyahsRead + amount;
    setQuranAyahsRead(next);
    localStorage.setItem(`daily_vigor_quran_${todayKey}`, String(next));
    if (addHasanat) {
      addHasanat(amount * 5);
    }
  };

  const incrementDhikr = (amount: number = 1) => {
    const next = dhikrCount + amount;
    setDhikrCount(next);
    localStorage.setItem(`daily_vigor_dhikr_${todayKey}`, String(next));
    if (addHasanat && amount >= 33) {
      addHasanat(25);
    } else if (addHasanat && next % 33 === 0) {
      addHasanat(10);
    }
  };

  const toggleFastingToday = () => {
    const next = !isFastingToday;
    setIsFastingToday(next);
    localStorage.setItem(`daily_vigor_fasting_${todayKey}`, String(next));
    if (next && addHasanat) {
      addHasanat(35);
    }
  };

  const toggleSadaqah = () => {
    const next = !sadaqahGiven;
    setSadaqahGiven(next);
    localStorage.setItem(`daily_vigor_sadaqah_${todayKey}`, String(next));
    if (next && addHasanat) {
      addHasanat(30);
    }
  };

  const completedPrayersCount = Object.values(prayersCompleted).filter(Boolean).length;
  
  // Calculate Daily Vigor Score out of 6 total spiritual pillars
  const totalCompletedPillars = 
    (completedPrayersCount === 5 ? 1 : completedPrayersCount > 0 ? 0.5 : 0) +
    (hadithReflected ? 1 : 0) +
    (quranAyahsRead >= 5 ? 1 : quranAyahsRead > 0 ? 0.5 : 0) +
    (dhikrCount >= 33 ? 1 : 0) +
    (isFastingToday ? 1 : 0) +
    (sadaqahGiven ? 1 : 0);
  
  const vigorPercentage = Math.min(100, Math.round((totalCompletedPillars / 6) * 100));

  const handleHadithClick = () => {
    // Navigate to shared hadith view
    onNavigate('resources', { resId: 'hadith' });
    
    // Update streak if not updated today
    const lastStreakUpdate = localStorage.getItem('last-hadith-streak-update');
    const today = new Date().toDateString();
    if (lastStreakUpdate !== today && updateStreak) {
      updateStreak();
      localStorage.setItem('last-hadith-streak-update', today);
    }
  };

  // Hijri Date Logic
  const hijriDate = moment(currentTime).format('iD iMMMM iYYYY');
  const [hDay, hMonth, hYear] = hijriDate.split(' ');
  const isRamadanMonth = hMonth && hMonth.toLowerCase().includes('ramad');
  const isRamadanActive = !!(isRamadanMonth || forceRamadan);

  const dailyHadith = getDailyHadith();

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

  // Update logic
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
      translation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
      reference: "Surah Al-Baqarah [2:201]",
      link: { tab: 'quran', extra: { surahNumber: 2 } }
    },
    {
      type: 'quran',
      arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
      translation: "Allah is the Light of the heavens and the earth.",
      reference: "Surah An-Nur [24:35]",
      link: { tab: 'quran', extra: { surahNumber: 24 } }
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

  const getDailyGreeting = () => {
    const day = new Date().getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    const greetings = [
      {
        title: "Salam, Gentle Soul",
        subtitle: "May your Sunday be anchored in tranquility, sincere Dua, and peaceful reflection on Allah's boundless mercy.",
        badge: "Sunday Serenity 🕊️",
        quote: "Whoever relies upon Allah – He is sufficient for him. [Surah At-Talaq 65:3]",
        imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Begin with Bismillah",
        subtitle: "A fresh Monday dawn to seek knowledge, spread genuine kindness, and elevate your scales of good deeds.",
        badge: "Monday Barakah 🌅",
        quote: "Actions are judged by intentions. [Sahih al-Bukhari]",
        imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Seek Divine Light",
        subtitle: "Transform Tuesday's fleeting hours into lasting treasures through thoughtful Adhkar and steadfast prayer.",
        badge: "Tuesday Devotion 📿",
        quote: "Indeed, my Lord is near and responsive. [Surah Hud 11:61]",
        imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Nourish Your Spirit",
        subtitle: "True inner calm blossoms with Dhikr. Let gratitude guide your speech and heart throughout this Wednesday.",
        badge: "Wednesday Wisdom 📖",
        quote: "Unquestionably, by the remembrance of Allah hearts are assured. [Surah Ar-Ra'd 13:28]",
        imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Awaken with Hope",
        subtitle: "Thursday welcomes the eve of Jummah. Renew your intentions, seek forgiveness, and draw close to your Creator.",
        badge: "Thursday Renewal 🌙",
        quote: "The best of you are those with the best character. [Jami` at-Tirmidhi]",
        imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Jummah Mubārak",
        subtitle: "The crown of the week. Send abundant blessings on the Beloved Prophet ﷺ and illuminate your soul with Surah Al-Kahf.",
        badge: "Blessed Friday 🕌",
        quote: "Send abundant blessings upon me on Friday. [Sunan Abi Dawud]",
        imageUrl: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1600&q=80"
      },
      {
        title: "Heartfelt Gratitude",
        subtitle: "Pause this Saturday to count the countless blessings of guidance, health, and family bestowed upon you.",
        badge: "Saturday Reflection 🌟",
        quote: "If you are grateful, I will surely increase your favor. [Surah Ibrahim 14:7]",
        imageUrl: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?auto=format&fit=crop&w=1600&q=80"
      }
    ];
    return greetings[day];
  };

  const dailyGreeting = getDailyGreeting();
  const dailyRevelation = getDailyRevelation();

  return (
    <div className="space-y-8 md:space-y-12 pb-24">
      {/* Sponsorship Banner - Subtle & Integrated */}
      <div className="glass-panel border-white/5 p-4 rounded-[2rem] flex flex-col md:flex-row items-center justify-between bg-white/[0.02] gap-4">
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/10 shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.4em] mb-0.5">Sanctuary Partners</p>
            <h4 className="text-xs font-black text-white px-0.5 uppercase tracking-tighter italic">Habibi x ALOHA Precision</h4>
          </div>
        </div>
        <button className="px-6 py-2 bg-white/5 text-white/40 text-[8px] font-black uppercase rounded-xl hover:bg-white/10 transition-all tracking-[0.2em] cursor-pointer">Explore Collection</button>
      </div>
      
      {/* 1. HERO BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* WELCOME BLOCK (SALAM SOUL) */}
        <div 
          id="tour-salam-soul"
          className="lg:col-span-12 relative overflow-hidden rounded-[3.5rem] border border-white/10 p-8 md:p-14 min-h-[380px] md:min-h-[440px] flex flex-col justify-between bg-cover bg-center shadow-2xl transition-colors duration-500 hover:border-brand-primary/40"
          style={{ 
            backgroundImage: `url(${dailyGreeting.imageUrl}), url(${salamSoulBg})` 
          }}
        >
          {/* Overlay for pristine contrast and rich atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/75 z-0" />
          
          <div className="absolute top-0 right-0 p-12 opacity-[0.08] pointer-events-none scale-150 transform-gpu z-10">
            <Sparkles size={240} className="text-brand-primary" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-brand-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">{dailyGreeting.badge}</span>
            </div>

            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight tracking-tight uppercase">
                {dailyGreeting.title}
              </h1>
              <p className="text-slate-200 text-base md:text-lg font-medium leading-relaxed drop-shadow-sm">
                {dailyGreeting.subtitle}
              </p>
              <p className="text-xs font-semibold text-brand-accent/80 italic">
                "{dailyGreeting.quote}"
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={handleContinue}
                className="group relative px-8 py-4 bg-brand-primary text-brand-depth font-black rounded-3xl overflow-hidden hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-[0_15px_35px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                <BookOpen size={18} />
                {lastRead ? `Resume ${lastRead.title}` : 'Read Quran'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => onNavigate('resources', { resId: 'adhkar' })}
                className="px-8 py-4 bg-white/10 text-white font-black rounded-3xl border border-white/15 hover:bg-white/15 hover:border-brand-primary/40 transition-all text-xs uppercase flex items-center justify-center gap-3 backdrop-blur-md cursor-pointer"
              >
                Find Calm <Moon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* PRAYER CONSOLE */}
        <div 
          id="tour-prayer-console"
          className="lg:col-span-12 glass-panel p-8 md:p-12 rounded-[3.5rem] border-white/5 bg-black/40 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden backdrop-blur-3xl shadow-3xl"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-brand-primary/5 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
            {/* Left: Time & Location */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holy Makkah Time</p>
              <h2 className="text-5xl md:text-7xl font-black text-white font-mono tracking-tighter tabular-nums">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-slate-400">
                <MapPin size={12} className="text-brand-primary" />
                {location?.lat.toFixed(1)}°N, {location?.lng.toFixed(1)}°E
              </div>
            </div>

            {/* Middle: Active Dynamic Progress Ring Countdown */}
            {prayerData ? (
              <div className="flex-1 w-full max-w-md flex items-center justify-center">
                {(() => {
                  const now = currentTime.getTime();
                  const nextMs = new Date(prayerData.nextTime).getTime();
                  const diffMs = Math.max(0, nextMs - now);
                  
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
                  
                  // Approximate 5-hour max window for relative progress %
                  const totalEstWindow = 5 * 3600 * 1000;
                  const elapsedMs = Math.max(0, totalEstWindow - diffMs);
                  const progressPct = Math.min(100, Math.max(8, (elapsedMs / totalEstWindow) * 100));

                  const radius = 64;
                  const circumference = 2 * Math.PI * radius; // ~402.12
                  const strokeOffset = circumference - (circumference * progressPct) / 100;

                  return (
                    <div className="relative p-6 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex flex-col items-center justify-center shadow-inner w-full">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 160 160">
                          <defs>
                            <linearGradient id="homePrayerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="60%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                          </defs>

                          {/* Track */}
                          <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            className="stroke-white/10"
                            strokeWidth="8"
                            fill="none"
                          />

                          {/* Progress Circle */}
                          <motion.circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="url(#homePrayerRingGrad)"
                            strokeWidth="9"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeOffset}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>

                        {/* Text inside ring */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                          <p className="text-[9px] font-black text-amber-300 uppercase tracking-[0.25em]">Next Prayer</p>
                          <h3 className="text-xl font-black text-white uppercase tracking-tight">{prayerData.nextPrayer}</h3>
                          <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">{formatTime(prayerData.nextTime)}</div>
                        </div>
                      </div>

                      {/* Live countdown timer pill */}
                      <div className="mt-3 px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-mono font-black text-white">
                          {String(hours).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} remaining
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 h-32 flex items-center justify-center">
                 <div className="w-10 h-10 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              </div>
            )}

            {/* Right: Actions / Calendar */}
            <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
              <button 
                onClick={requestNotificationPermission} 
                className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-primary hover:border-brand-primary transition-all border border-white/10 shadow-lg cursor-pointer"
                title="Configure Prayer Alerts"
              >
                <Bell size={24} />
              </button>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-right">
                {hDay} {hMonth} {hYear}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isRamadanActive && (
        <RamadanHub 
          currentTime={currentTime} 
          prayerData={prayerData} 
          addHasanat={addHasanat} 
        />
      )}

      {/* 2. THE CENTERPIECE: SPIRITUAL REVELATION */}
      <div id="tour-daily-centerpiece" className="relative">
        <div 
          onClick={() => onNavigate(dailyRevelation.link.tab, dailyRevelation.link.extra)}
          className="group relative p-10 md:p-20 rounded-[3.5rem] bg-gradient-to-b from-brand-primary/10 to-transparent border border-white/5 text-center space-y-10 cursor-pointer overflow-hidden shadow-3xl hover:border-brand-primary/30 transition-colors duration-300"
        >
          {/* Spiritual Geometry (Subtle) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                {dailyRevelation.type === 'quran' ? <BookOpen size={28} /> : <Sparkles size={28} />}
              </div>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em]">{dailyRevelation.type === 'quran' ? 'Daily Verse' : 'Daily Hadith'}</span>
            </div>

            <p className="arabic-text text-3xl md:text-6xl text-white leading-relaxed md:leading-relaxed max-w-5xl">
              {dailyRevelation.arabic}
            </p>

            <div className="max-w-3xl space-y-4">
              <p className="text-lg md:text-3xl text-slate-200 font-light italic leading-snug">
                "{dailyRevelation.translation}"
              </p>
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent mx-auto" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">
                {dailyRevelation.reference}
              </p>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
               <button 
                 onClick={(e) => {
                   e.stopPropagation();
                   const id = 'home-daily-revelation';
                   if (voicePlayback.isPlaying && voicePlayback.activeId === id) {
                     VoiceService.stop();
                   } else {
                     VoiceService.speakBoth(dailyRevelation.arabic, dailyRevelation.translation, id);
                   }
                 }}
                 className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer shadow-xl active:scale-95 ${
                   voicePlayback.isPlaying && voicePlayback.activeId === 'home-daily-revelation'
                     ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                     : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                 }`}
               >
                 {voicePlayback.isPlaying && voicePlayback.activeId === 'home-daily-revelation' ? (
                   <>
                     <Pause size={16} className="fill-current" />
                     <span>Stop Voice</span>
                   </>
                 ) : (
                   <>
                     <Volume2 size={16} />
                     <span>Recite Voice</span>
                   </>
                 )}
               </button>

               <button className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-slate-100 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-white/20 shadow-2xl flex items-center gap-3 cursor-pointer">
                  {dailyRevelation.type === 'quran' ? 'Open Quran' : 'Learn Wisdom'} <ArrowRight size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 SPIRITUAL STREAK FIRE SHOWCASE */}
      <div id="tour-streak-fire" className={`relative overflow-hidden rounded-[3rem] p-6 md:p-8 transition-all duration-500 border ${
        streak >= 7
          ? 'bg-gradient-to-r from-orange-950/80 via-red-950/60 to-amber-950/80 border-orange-500/60 shadow-[0_0_50px_rgba(249,115,22,0.35)]'
          : 'bg-white/[0.02] border-white/10'
      }`}>
        {/* Animated Rising Fire Flame Particles (Triggered when streak >= 7) */}
        {streak >= 7 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Ambient fiery backdrop glow */}
            <div className="absolute -bottom-10 left-1/4 w-96 h-40 bg-orange-600/30 rounded-full blur-[60px] animate-pulse" />
            <div className="absolute -top-10 right-1/4 w-80 h-36 bg-red-600/20 rounded-full blur-[60px] animate-pulse" />
            
            {/* Spark & Ember Particles */}
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, x: (i * 24) % 300 - 150, scale: 0.4 }}
                animate={{ 
                  opacity: [0, 1, 0.8, 0], 
                  y: [10, -100 - (i * 10)],
                  x: [
                    (i * 24) % 300 - 150, 
                    (i * 24) % 300 - 150 + (i % 2 === 0 ? 20 : -20)
                  ],
                  scale: [0.4, 1.5, 0.2]
                }}
                transition={{
                  duration: 2.2 + (i % 4) * 0.4,
                  repeat: Infinity,
                  delay: (i * 0.2) % 2.5,
                  ease: "easeOut"
                }}
                className="absolute bottom-2 left-1/2 rounded-full blur-[0.5px]"
                style={{
                  width: `${6 + (i % 3) * 3}px`,
                  height: `${6 + (i % 3) * 3}px`,
                  backgroundColor: i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#ef4444' : '#fbbf24',
                  boxShadow: i % 2 === 0 ? '0 0 12px #f97316' : '0 0 14px #ef4444'
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Animated Fire Flame Badge Container */}
            <div className={`relative w-20 h-20 rounded-3xl flex items-center justify-center border transition-all shrink-0 ${
              streak >= 7
                ? 'bg-gradient-to-br from-orange-500 via-red-500 to-amber-400 border-orange-300 shadow-[0_0_35px_rgba(249,115,22,0.85)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <motion.div
                animate={streak >= 7 ? { 
                  scale: [1, 1.22, 0.96, 1.15, 1],
                  rotate: [-4, 4, -3, 3, 0]
                } : {}}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Flame 
                  size={40} 
                  className={streak >= 7 
                    ? 'text-white fill-amber-200 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]' 
                    : 'text-slate-400'
                  } 
                />
              </motion.div>
              
              {streak >= 7 ? (
                <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xl border border-white/20 animate-bounce">
                  FIRE 🔥
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-white/10 text-slate-400 text-[8px] font-bold">
                  {streak}/7
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.35em] ${
                  streak >= 7 ? 'text-amber-300' : 'text-slate-400'
                }`}>
                  {streak >= 7 ? '🔥 Divine Istiqamah Flame Streak' : 'Spiritual Devotion Streak'}
                </span>
                {streak >= 7 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500/25 text-orange-200 border border-orange-400/40 text-[9px] font-black tracking-wider uppercase">
                    7+ Days Active
                  </span>
                )}
              </div>
              <h4 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight">
                {streak} {streak === 1 ? 'Day' : 'Days'} Devotion Streak
              </h4>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                {streak >= 7
                  ? `Masha'Allah! You have maintained an unbroken ${streak}-day spiritual streak. The sacred fire of steadfastness is glowing strong!`
                  : `You are on a ${streak}-day streak! Keep returning daily to reach 7 days and ignite your Divine Fire Streak effect.`}
              </p>
            </div>
          </div>

          {/* Action / Progress Control */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => {
                if (updateStreak) updateStreak();
                if (addHasanat) addHasanat(30);
              }}
              className={`px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2.5 active:scale-95 shadow-xl ${
                streak >= 7
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-brand-depth hover:brightness-110 shadow-orange-500/30 border border-amber-300/40'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-brand-primary/40'
              }`}
            >
              <Flame size={16} className={streak >= 7 ? 'fill-current animate-pulse' : ''} />
              <span>{streak >= 7 ? 'Stoke The Flame (+30)' : 'Claim Daily Streak (+30)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div id="tour-shortcuts" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { id: 'resources', sub: 'adhkar', label: 'Adhkar', icon: Moon, desc: 'Supplications', color: 'text-blue-400' },
           { id: 'leaderboard', sub: '', label: 'Rankings', icon: Crown, desc: 'Spiritual Community', color: 'text-amber-400' },
           { id: 'companion', sub: '', label: 'Divine AI', icon: MessageCircle, desc: 'Chat with Aliyah', color: 'text-purple-400' },
           { id: 'resources', sub: 'hajj_umrah', label: 'Pilgrimage', icon: MapPin, desc: 'Hajj & Umrah Hub', color: 'text-emerald-400' }
         ].map((link) => (
           <button
             key={link.label}
             onClick={() => onNavigate(link.id, link.sub ? { resId: link.sub } : undefined)}
             className="p-8 glass-panel rounded-[2.5rem] border-white/5 flex flex-col items-center text-center space-y-5 group bg-white/[0.01] hover:border-brand-primary/30 transition-all cursor-pointer"
           >
              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${link.color} transition-transform shadow-inner`}>
                 <link.icon size={28} />
              </div>
              <div className="space-y-1">
                 <h4 className="text-base font-black text-white">{link.label}</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{link.desc}</p>
              </div>
           </button>
         ))}
      </div>

      {/* MOMENTUM & DAILY VIGOR SECTION */}
      <div id="tour-daily-vigor" className="glass-panel p-8 md:p-14 rounded-[3.5rem] border-white/10 bg-gradient-to-br from-brand-primary/15 via-brand-sidebar to-black/60 space-y-10 shadow-2xl">
        {/* Header & Vitality Score */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-[0.35em] text-brand-primary flex items-center gap-1.5">
                <Sparkles size={14} /> Spiritual Vitality & Tracker
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black font-mono">
                {vigorPercentage}% Completed
              </span>
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white italic tracking-tight">
              Daily Vigor
            </h3>
            <p className="text-slate-300 font-normal text-sm md:text-base leading-relaxed">
              Cultivate consistency in your worship. Track your 5 daily prayers, Quran recitation, prophetic hadith reflection, tasbih beads, fasting, and charity.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="text-center px-4 py-3.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-xl font-black text-emerald-400 font-mono">{completedPrayersCount}/5</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Prayers</p>
            </div>
            <div className="text-center px-4 py-3.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-xl font-black text-blue-400 font-mono">{dhikrCount}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Dhikr Beads</p>
            </div>
            <div className="text-center px-4 py-3.5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-xl font-black text-amber-400 font-mono">{quranAyahsRead}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Ayahs Read</p>
            </div>
            <div className={`text-center px-4 py-3.5 rounded-3xl border backdrop-blur-md transition-all relative overflow-hidden ${
              streak >= 7 
                ? 'bg-gradient-to-b from-orange-500/20 to-red-500/30 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                : 'bg-white/5 border-white/10'
            }`}>
              {streak >= 7 && (
                <span className="absolute top-1 right-2 text-orange-400 animate-pulse text-[10px]">🔥</span>
              )}
              <p className={`text-xl font-black font-mono flex items-center justify-center gap-1 ${
                streak >= 7 ? 'text-orange-300' : 'text-slate-200'
              }`}>
                {streak}d
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                {streak >= 7 ? 'Flame Streak' : 'Devotion'}
              </p>
            </div>
          </div>
        </div>

        {/* Spacious Overall Progress Bar */}
        <div className="space-y-2.5">
          <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-300">
            <span>Daily Spiritual Disciplines ({totalCompletedPillars} of 6 Completed)</span>
            <span className="text-brand-primary font-mono text-sm">{vigorPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 p-[1.5px]">
            <div 
              className="h-full bg-gradient-to-r from-brand-primary via-emerald-400 to-amber-300 rounded-full transition-all duration-700 shadow-[0_0_16px_rgba(168,85,247,0.6)]"
              style={{ width: `${vigorPercentage}%` }}
            />
          </div>
        </div>
        
        {/* TRACKER 1: 5 DAILY PRAYERS TRACKER (SPACIOUS & INTERACTIVE) */}
        <div className="p-8 md:p-10 rounded-[2.5rem] bg-black/50 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black shadow-lg">
                <Sunrise size={22} />
              </div>
              <div>
                <h4 className="text-base font-black text-white uppercase tracking-wider">5 Daily Prayers Tracker</h4>
                <p className="text-xs text-slate-400">Tap prayer cards upon completion to claim +15 Hasanat each</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto ${
              completedPrayersCount === 5 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-slate-300 border-white/10'
            }`}>
              {completedPrayersCount === 5 ? 'All 5 Prayers Completed ✓' : `${5 - completedPrayersCount} Remaining Today`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Fajr', icon: Sunrise, time: prayerData ? formatTime(prayerData.fajr) : '05:15 AM' },
              { name: 'Dhuhr', icon: Sun, time: prayerData ? formatTime(prayerData.dhuhr) : '12:30 PM' },
              { name: 'Asr', icon: CloudSun, time: prayerData ? formatTime(prayerData.asr) : '03:45 PM' },
              { name: 'Maghrib', icon: Sunset, time: prayerData ? formatTime(prayerData.maghrib) : '06:40 PM' },
              { name: 'Isha', icon: Moon, time: prayerData ? formatTime(prayerData.isha) : '08:05 PM' }
            ].map((p) => {
              const isDone = !!prayersCompleted[p.name];
              return (
                <button
                  key={p.name}
                  onClick={() => togglePrayerCompleted(p.name)}
                  className={`p-5 rounded-3xl border transition-all flex flex-col items-center text-center gap-3 cursor-pointer relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
                    isDone 
                      ? 'bg-gradient-to-b from-emerald-500/25 to-emerald-950/40 border-emerald-500/60 text-white shadow-xl shadow-emerald-500/15' 
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <p.icon size={18} className={isDone ? 'text-emerald-400' : 'text-slate-400'} />
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                      isDone ? 'bg-emerald-400 text-black font-black shadow-md' : 'border border-slate-600 group-hover:border-slate-400'
                    }`}>
                      {isDone && <Check size={14} />}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-black text-sm text-white tracking-wide">{p.name}</p>
                    <p className="text-xs font-mono text-slate-400">{p.time}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isDone ? 'bg-emerald-400/20 text-emerald-300' : 'text-slate-500'
                  }`}>
                    {isDone ? 'Prayed +15' : '+15 Hasanat'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TRACKER 2 & 3: DAILY HADITH TRACKER & QURAN RECITATION TRACKER (ROOMY DUAL GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Hadith Reflection Tracker */}
          <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/10 space-y-6 flex flex-col justify-between hover:border-brand-primary/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-md">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Daily Hadith Reflection</h4>
                    <p className="text-xs text-slate-400">Prophetic Wisdom of the Day</p>
                  </div>
                </div>
                {hadithReflected && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                    Reflected ✓
                  </span>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <p className="text-xs font-black text-brand-primary uppercase tracking-widest">{dailyHadith.narrator}</p>
                <p className="text-sm text-slate-200 font-medium leading-relaxed italic">
                  "{dailyHadith.english}"
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={toggleHadithReflected}
                className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  hadithReflected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' 
                    : 'bg-brand-primary text-brand-depth hover:bg-brand-primary/90 shadow-xl shadow-brand-primary/25'
                }`}
              >
                {hadithReflected ? 'Reflected Today ✓ (+20 Hasanat)' : 'Mark Reflected (+20 Hasanat)'}
              </button>
              <button 
                onClick={handleHadithClick}
                className="px-5 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                title="Explore All Hadiths"
              >
                <BookOpen size={16} />
                <span>Library</span>
              </button>
            </div>
          </div>

          {/* Quran Recitation Tracker */}
          <div className="p-8 rounded-[2.5rem] bg-black/40 border border-white/10 space-y-6 flex flex-col justify-between hover:border-amber-500/40 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Quran Recitation Tracker</h4>
                    <p className="text-xs text-slate-400">Daily Recitation Goal: 10 Ayahs</p>
                  </div>
                </div>
                <span className="text-sm font-mono font-black text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-2xl border border-amber-400/20">
                  {quranAyahsRead} Ayahs
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-300 uppercase">
                  <span>Today's Recitation Progress</span>
                  <span className="text-amber-400 font-mono">{Math.min(100, Math.round((quranAyahsRead / 10) * 100))}%</span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    style={{ width: `${Math.min(100, (quranAyahsRead / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => incrementQuranAyahs(1)}
                className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                +1 Ayah
              </button>
              <button 
                onClick={() => incrementQuranAyahs(5)}
                className="flex-1 py-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
              >
                +5 Ayahs
              </button>
              <button 
                onClick={() => onNavigate('quran')}
                className="px-5 py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-wider border border-white/10 transition-colors cursor-pointer flex items-center gap-2"
                title="Open Quran Reader"
              >
                <BookOpen size={16} />
                <span>Read</span>
              </button>
            </div>
          </div>
        </div>

        {/* TRACKER 4, 5 & 6: DIGITAL TASBIH DHIKR, FASTING (SAWM) & SADAQAH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Dhikr Tasbih Tracker */}
          <div className="p-7 bg-black/40 rounded-[2.5rem] border border-white/10 space-y-5 flex flex-col justify-between hover:border-blue-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                  <Sparkles size={14} /> Dhikr Counter
                </span>
                <button
                  onClick={() => setDhikrPhraseIdx((prev) => (prev + 1) % dhikrPhrases.length)}
                  className="text-[9px] font-black uppercase text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 cursor-pointer transition-colors"
                >
                  Switch ⟳
                </button>
              </div>

              <div className="text-center py-4 px-3 bg-white/[0.02] rounded-2xl border border-white/5 space-y-1">
                <p className="arabic-text text-xl text-white font-bold">{dhikrPhrases[dhikrPhraseIdx].ar}</p>
                <p className="text-xs text-blue-300 font-bold">{dhikrPhrases[dhikrPhraseIdx].en}</p>
                <p className="text-3xl font-black text-white font-mono pt-1">{dhikrCount}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => incrementDhikr(1)}
                className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-400 text-blue-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                +1 Bead
              </button>
              <button
                onClick={() => incrementDhikr(33)}
                className="px-4 py-3.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 font-black rounded-2xl text-xs uppercase tracking-wider cursor-pointer"
              >
                +33 Set
              </button>
            </div>
          </div>

          {/* Fasting / Sawm Tracker */}
          <div className="p-7 bg-black/40 rounded-[2.5rem] border border-white/10 space-y-5 flex flex-col justify-between hover:border-orange-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                  <Flame size={14} /> Sawm Tracker
                </span>
                {isFastingToday && (
                  <span className="text-[9px] font-black uppercase text-orange-400 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/30">
                    Fasting Logged
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <p className="text-sm font-bold text-white leading-tight">Sunnah & Voluntary Fast</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isFastingToday ? "Mubarak! Fasting today for the sake of Allah (+35 Hasanat)." : "Log fasting for Mondays, Thursdays, or White Days (13, 14, 15)."}
                </p>
              </div>
            </div>

            <button
              onClick={toggleFastingToday}
              className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isFastingToday 
                  ? 'bg-orange-500 text-orange-950 shadow-lg font-black' 
                  : 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10'
              }`}
            >
              {isFastingToday ? 'Fasting Logged ✓ (+35 Hasanat)' : 'Log Fasting Today (+35 Hasanat)'}
            </button>
          </div>

          {/* Sadaqah & Good Deed Tracker */}
          <div className="p-7 bg-black/40 rounded-[2.5rem] border border-white/10 space-y-5 flex flex-col justify-between hover:border-pink-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-pink-400 flex items-center gap-2">
                  <HeartHandshake size={14} /> Sadaqah Tracker
                </span>
                {sadaqahGiven && (
                  <span className="text-[9px] font-black uppercase text-pink-300 bg-pink-500/20 px-2.5 py-1 rounded-full border border-pink-500/30">
                    Completed
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <p className="text-sm font-bold text-white leading-tight">Charity & Good Deed</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {sadaqahGiven ? "Deed recorded! A smile or charity expiates sins (+30 Hasanat)." : "Give charity, help someone, or smile as Sunnah."}
                </p>
              </div>
            </div>

            <button
              onClick={toggleSadaqah}
              className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                sadaqahGiven 
                  ? 'bg-pink-500 text-pink-950 shadow-lg font-black' 
                  : 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10'
              }`}
            >
              {sadaqahGiven ? 'Charity Logged ✓ (+30 Hasanat)' : 'Log Good Deed Today (+30 Hasanat)'}
            </button>
          </div>

        </div>

        {/* Spiritual Shortcuts Bar: Tahajjud, White Days, Hijri Calendar, Qibla Compass, Daily Adhkar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => onNavigate('prayer_times')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-purple-500/20 flex flex-col justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                <Moon size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                Alarms
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wide">Tahajjud Qiyam</p>
              <p className="text-[10px] text-slate-400">Night Vigil Alarm</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('prayer_times')}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-amber-500/20 flex flex-col justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
                <Flame size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                13, 14, 15
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wide">White Days</p>
              <p className="text-[10px] text-slate-400">Sunnah Fasting</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('resources', { resId: 'calendar' })}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex flex-col justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                <Calendar size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                Hijri
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wide">Hijri Calendar</p>
              <p className="text-[10px] text-slate-400 font-mono">{hDay} {hMonth}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('resources', { resId: 'qibla' })}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex flex-col justify-between transition-all group text-left cursor-pointer"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
                <Compass size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Makkah
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wide">Qibla Compass</p>
              <p className="text-[10px] text-slate-400">Sacred Kaaba</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('resources', { resId: 'adhkar' })}
            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex flex-col justify-between transition-all group text-left cursor-pointer col-span-2 md:col-span-1"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 group-hover:scale-105 transition-transform">
                <Sparkles size={18} />
              </div>
              <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Adhkar
              </span>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-wide">Daily Duas</p>
              <p className="text-[10px] text-slate-400">Morning & Evening</p>
            </div>
          </button>
        </div>
      </div>

      <DailyVirtues />

      {/* PRAYER SCHEDULE BOTTOM */}
      <div className="p-1 glass-panel rounded-[3.5rem] border-white/5 bg-white/[0.01]">
        <div className="p-8 md:p-12 space-y-8">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Cosmic Alignment</h3>
                <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">Prayer Schedule</p>
              </div>
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Schedule</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {prayerTimes.map((prayer) => (
                <div key={prayer.name} className={`p-6 rounded-[2.5rem] text-center border transition-all duration-300 relative overflow-hidden group ${prayer.active ? 'bg-brand-primary border-brand-primary shadow-2xl shadow-brand-primary/20' : 'bg-white/[0.02] border-white/5 hover:border-brand-primary/30'}`}>
                   {prayer.active && (
                     <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                   )}
                   <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all ${prayer.active ? 'bg-brand-depth text-brand-primary' : 'bg-white/5 text-slate-400 group-hover:text-brand-primary'}`}>
                      <prayer.icon size={24} />
                   </div>
                   <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${prayer.active ? 'text-brand-depth/60' : 'text-slate-400'}`}>{prayer.name}</p>
                   <p className={`text-xl font-black font-mono tracking-tighter tabular-nums ${prayer.active ? 'text-brand-depth' : 'text-white'}`}>{prayer.time}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

    </div>
  );
}

function TrophyIcon({ size }: { size: number }) {
  return <Sparkles size={size} />;
}
