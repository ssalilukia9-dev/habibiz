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
  Star
} from 'lucide-react';
import { getDailyHadith } from '../data/hadiths.ts';
import { getPrayerTimes, formatTime, PrayerTimeData } from '../services/prayerService.ts';
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

      {/* 2. PROGRESS STRIP */}
      <div id="tour-progress-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Verses Read', val: versesRead, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10', total: 6236, action: () => onNavigate('quran') },
          { label: 'Hadith Streak', val: streak, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10', unit: 'Days', action: handleHadithClick },
          { label: 'Spiritual Rank', val: rank, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', sub: `Level ${level}`, action: () => onNavigate('profile') }
        ].map((item) => (
          <div 
            key={item.label}
            onClick={item.action}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] flex items-center gap-6 group cursor-pointer transition-colors duration-300 hover:border-brand-primary/30"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] ${item.bg} flex items-center justify-center ${item.color} transition-all shadow-inner`}>
              <item.icon size={28} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tabular-nums">{item.val}</span>
                {item.unit && <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</span>}
                {item.sub && <span className="text-[10px] font-bold text-slate-400 uppercase">{item.sub}</span>}
              </div>
              {item.total && (
                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <div className={`h-full ${item.color.replace('text', 'bg')} rounded-full`} style={{ width: `${Math.min((versesRead/item.total)*100, 100)}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. THE CENTERPIECE: SPIRITUAL REVELATION */}
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

            <div className="pt-6">
               <button className="px-10 py-4 bg-white text-black font-black rounded-full hover:bg-slate-100 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-white/20 shadow-2xl flex items-center gap-3 cursor-pointer">
                  {dailyRevelation.type === 'quran' ? 'Open Quran' : 'Learn Wisdom'} <ArrowRight size={16} />
               </button>
            </div>
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

      {/* MOMENTUM & QIBLA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Momentum */}
        <div className="lg:col-span-8 glass-panel p-8 md:p-12 rounded-[3.5rem] border-white/5 bg-gradient-to-br from-brand-primary/5 to-transparent space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">Daily Vigor</h3>
              <p className="text-slate-400 font-medium text-xs tracking-wide">Sync your soul with the divine rhythm</p>
            </div>
            <div className="flex gap-4">
               {[
                 { label: 'Prayers', val: '5/5', color: 'text-emerald-400' },
                 { label: 'Dhikr', val: '330', color: 'text-blue-400' }
               ].map(stat => (
                 <div key={stat.label} className="text-center px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
                    <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-4 group hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Flame size={20} />
                </div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Growth Task</h4>
              </div>
              <p className="text-sm text-slate-200 font-bold leading-relaxed">Consider fasting tomorrow for the sake of Allah (Sunnah).</p>
              <button className="w-full py-3 bg-orange-500 text-orange-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-orange-500/15 cursor-pointer">Challenge Myself</button>
            </div>
            
            <div className="p-7 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 space-y-4 group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-pink-300">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">AI Reflection</h4>
              </div>
              <p className="text-sm text-slate-200 font-bold leading-relaxed">Seek deeper understanding from your Spiritual AI Companion.</p>
              <button 
                onClick={() => onNavigate('companion')} 
                className="w-full py-3 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/15 cursor-pointer"
              >
                Spark Discussion
              </button>
            </div>
          </div>
        </div>

        {/* Qibla Card */}
        <div className="lg:col-span-4 glass-panel p-8 md:p-10 rounded-[3.5rem] border-white/5 bg-black/40 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
           <div className="w-28 h-28 rounded-full border-2 border-brand-primary/20 flex items-center justify-center relative">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                 <Compass size={36} />
              </div>
           </div>
           <div className="space-y-2 relative z-10">
              <h4 className="text-xl font-black text-white italic">Qibla Path</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">Align yourself towards the Holy Kaaba in Makkah.</p>
           </div>
           <button 
             onClick={() => onNavigate('resources', { resId: 'qibla' })}
             className="px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 active:scale-95 transition-all shadow-lg shadow-white/10 cursor-pointer"
           >
             Open Finder
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
