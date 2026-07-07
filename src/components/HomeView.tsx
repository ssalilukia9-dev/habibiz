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
        <button className="px-6 py-2 bg-white/5 text-white/40 text-[8px] font-black uppercase rounded-xl hover:bg-white/10 transition-all tracking-[0.2em]">Explore Collection</button>
      </div>
      
      {/* 1. HERO BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* WELCOME BLOCK */}
        <div className="lg:col-span-8 glass-panel p-8 md:p-14 rounded-[3rem] flex flex-col justify-between relative overflow-hidden group border-white/5 bg-gradient-to-br from-brand-primary/10 to-transparent">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 pointer-events-none scale-150 transform-gpu">
            <Sparkles size={240} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-brand-primary">
              <div className="w-1 h-4 bg-brand-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">The Sanctuary</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter">
                {isRamadanActive ? (
                  <>Ramadan <br/><span className="text-amber-400 italic">Mubārak</span></>
                ) : (
                  <>Salam, <br/><span className="text-brand-primary italic">Soul</span></>
                )}
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md">
                {isRamadanActive ? (
                  <>Your Ramadan fast and prayers are <span className="text-amber-400 font-bold">gloriously blessed</span> today.</>
                ) : (
                  <>Your spiritual momentum is <span className="text-white">Thriving</span> today.</>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={handleContinue}
                className="group relative px-10 py-6 bg-brand-primary text-brand-depth font-black rounded-3xl overflow-hidden hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
              >
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <BookOpen size={20} />
                {lastRead ? `Resume ${lastRead.title}` : 'Read Quran'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => onNavigate('resources', { resId: 'adhkar' })}
                className="px-10 py-6 bg-white/5 text-white font-black rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-sm uppercase flex items-center justify-center gap-4 hover:border-brand-primary/30"
              >
                Find Calm <Moon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* PRAYER CONSOLE */}
        <div className="lg:col-span-4 glass-panel p-8 rounded-[3.5rem] border-white/5 bg-black/40 flex flex-col justify-between relative overflow-hidden backdrop-blur-3xl shadow-3xl">
          <div className="absolute top-0 right-0 w-full h-1/2 bg-brand-primary/5 blur-[100px] -mt-20" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Holy Makkah Time</p>
                <h2 className="text-4xl font-black text-white font-mono tracking-tighter">
                   {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h2>
              </div>
              <button onClick={requestNotificationPermission} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-primary transition-all border border-white/10">
                <Bell size={24} />
              </button>
            </div>

            {prayerData ? (
              <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 text-center space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-1">Next Prayer</p>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">{prayerData.nextPrayer}</h3>
                  </div>
                  <div className="text-5xl font-black text-white font-mono">{formatTime(prayerData.nextTime)}</div>
                </div>
                
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <MapPin size={12} className="text-brand-primary" />
                      {location?.lat.toFixed(1)}°N, {location?.lng.toFixed(1)}°E
                   </div>
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {hDay} {hMonth}
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                 <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
              </div>
            )}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Verses Read', val: versesRead, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10', total: 6236, action: () => onNavigate('quran') },
          { label: 'Hadith Streak', val: streak, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10', unit: 'Days', action: handleHadithClick },
          { label: 'Spiritual Rank', val: rank, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', sub: `Level ${level}`, action: () => onNavigate('profile') }
        ].map((item) => (
          <motion.div 
            key={item.label}
            whileHover={{ y: -4 }}
            onClick={item.action}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] flex items-center gap-6 group cursor-pointer transition-all hover:border-white/10"
          >
            <div className={`w-16 h-16 rounded-[1.5rem] ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-all shadow-inner`}>
              <item.icon size={28} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{item.val}</span>
                {item.unit && <span className="text-[10px] font-bold text-slate-500 uppercase">{item.unit}</span>}
                {item.sub && <span className="text-[10px] font-bold text-slate-500 uppercase">{item.sub}</span>}
              </div>
              {item.total && (
                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <div className={`h-full ${item.color.replace('text', 'bg')} rounded-full`} style={{ width: `${Math.min((versesRead/item.total)*100, 100)}%` }} />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. THE CENTERPIECE: SPIRITUAL REVELATION */}
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => onNavigate(dailyRevelation.link.tab, dailyRevelation.link.extra)}
          className="group relative p-12 md:p-24 rounded-[4rem] bg-gradient-to-b from-brand-primary/10 to-transparent border border-white/5 text-center space-y-12 cursor-pointer overflow-hidden shadow-4xl hover:border-brand-primary/20 transition-all"
        >
          {/* Spiritual Geometry (Subtle) */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 animate-float">
                {dailyRevelation.type === 'quran' ? <BookOpen size={32} /> : <Sparkles size={32} />}
              </div>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em]">{dailyRevelation.type === 'quran' ? 'Daily Verse' : 'Daily Hadith'}</span>
            </div>

            <p className="arabic-text text-4xl md:text-7xl text-white leading-relaxed md:leading-relaxed max-w-5xl transition-all duration-700 hover:scale-[1.02] transform-gpu">
              {dailyRevelation.arabic}
            </p>

            <div className="max-w-3xl space-y-6">
              <p className="text-xl md:text-4xl text-slate-200 font-light italic leading-snug">
                "{dailyRevelation.translation}"
              </p>
              <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent mx-auto" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.5em]">
                {dailyRevelation.reference}
              </p>
            </div>

            <div className="pt-10">
               <button className="px-12 py-5 bg-white text-black font-black rounded-full hover:scale-110 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-white/20 shadow-2xl flex items-center gap-4">
                  {dailyRevelation.type === 'quran' ? 'Open Quran' : 'Learn Wisdom'} <ArrowRight size={18} />
               </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { id: 'resources', sub: 'adhkar', label: 'Adhkar', icon: Moon, desc: 'Supplications', color: 'text-blue-400' },
           { id: 'leaderboard', sub: '', label: 'Rankings', icon: Crown, desc: 'Spiritual Community', color: 'text-amber-400' },
           { id: 'companion', sub: '', label: 'Divine AI', icon: MessageCircle, desc: 'Chat with Aliyah', color: 'text-purple-400' },
           { id: 'resources', sub: 'hajj_umrah', label: 'Pilgrimage', icon: MapPin, desc: 'Hajj & Umrah Hub', color: 'text-emerald-400' }
         ].map((link) => (
           <motion.button
             key={link.label}
             whileHover={{ y: -8, scale: 1.02 }}
             onClick={() => onNavigate(link.id, link.sub ? { resId: link.sub } : undefined)}
             className="p-10 glass-panel rounded-[3rem] border-white/5 flex flex-col items-center text-center space-y-6 group bg-white/[0.01]"
           >
              <div className={`w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center ${link.color} group-hover:scale-110 transition-transform shadow-inner`}>
                 <link.icon size={32} />
              </div>
              <div className="space-y-1">
                 <h4 className="text-lg font-black text-white">{link.label}</h4>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{link.desc}</p>
              </div>
           </motion.button>
         ))}
      </div>

      {/* MOMENTUM & QIBLA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Momentum */}
        <div className="lg:col-span-8 glass-panel p-10 md:p-14 rounded-[4rem] border-white/5 bg-gradient-to-br from-brand-primary/5 to-transparent space-y-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-4xl font-black text-white italic tracking-tighter">Daily Vigor</h3>
              <p className="text-slate-500 font-medium tracking-wide">Sync your soul with the divine rhythm</p>
            </div>
            <div className="flex gap-4">
               {[
                 { label: 'Prayers', val: '5/5', color: 'text-emerald-400' },
                 { label: 'Dhikr', val: '330', color: 'text-blue-400' }
               ].map(stat => (
                 <div key={stat.label} className="text-center px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  <Flame size={24} />
                </div>
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Growth Task</h4>
              </div>
              <p className="text-base text-slate-200 font-bold leading-relaxed">Consider fasting tomorrow for the sake of Allah (Sunnah).</p>
              <button className="w-full py-4 bg-orange-500 text-orange-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-orange-500/20">Challenge Myself</button>
            </div>
            
            <div className="p-8 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 space-y-6 group hover:border-indigo-500/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform text-pink-300">
                  <Sparkles size={24} />
                </div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI Reflection</h4>
              </div>
              <p className="text-base text-slate-200 font-bold leading-relaxed">Seek deeper understanding from your Spiritual AI Companion.</p>
              <button 
                onClick={() => onNavigate('companion')} 
                className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
              >
                Spark Discussion
              </button>
            </div>
          </div>
        </div>

        {/* Qibla Card */}
        <div className="lg:col-span-4 glass-panel p-10 rounded-[4rem] border-white/5 bg-black/40 flex flex-col items-center justify-center text-center space-y-8 relative group overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
           <div className="w-32 h-32 rounded-full border-4 border-brand-primary/10 flex items-center justify-center relative transition-transform duration-1000 group-hover:rotate-45">
              <div className="absolute inset-2 rounded-full border-2 border-brand-primary/30 border-t-transparent animate-spin duration-3000" />
              <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shadow-[0_0_40px_rgba(2,132,199,0.2)]">
                 <Compass size={40} />
              </div>
           </div>
           <div className="space-y-3 relative z-10">
              <h4 className="text-2xl font-black text-white italic">Qibla Path</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Align yourself perfectly <br/>towards the Kaaba.</p>
           </div>
           <button 
             onClick={() => onNavigate('resources', { resId: 'qibla' })}
             className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
           >
             Open Finder
           </button>
        </div>
      </div>

      <DailyVirtues />

      {/* PRAYER SCHEDULE BOTTOM */}
      <div className="p-1 glass-panel rounded-[4rem] border-white/5 bg-white/[0.01]">
        <div className="p-10 md:p-14 space-y-12">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Cosmic Alignment</h3>
                <p className="text-3xl font-black text-white italic tracking-tighter">Prayer Schedule</p>
              </div>
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Frequency</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {prayerTimes.map((prayer) => (
                <div key={prayer.name} className={`p-8 rounded-[3.5rem] text-center border transition-all duration-700 relative overflow-hidden group ${prayer.active ? 'bg-brand-primary border-brand-primary shadow-4xl shadow-brand-primary/20' : 'bg-white/[0.02] border-white/5 hover:border-brand-primary/30'}`}>
                   {prayer.active && (
                     <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                   )}
                   <div className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-500 ${prayer.active ? 'bg-brand-depth text-brand-primary scale-110' : 'bg-white/5 text-slate-500 group-hover:text-brand-primary group-hover:scale-110'}`}>
                      <prayer.icon size={28} />
                   </div>
                   <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${prayer.active ? 'text-brand-depth/40' : 'text-slate-600'}`}>{prayer.name}</p>
                   <p className={`text-2xl font-black font-mono tracking-tighter ${prayer.active ? 'text-brand-depth' : 'text-white'}`}>{prayer.time}</p>
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
