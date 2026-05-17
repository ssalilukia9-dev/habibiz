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
  Crown
} from 'lucide-react';
import { getDailyHadith } from '../data/hadiths.ts';
import { getPrayerTimes, formatTime, PrayerTimeData } from '../services/prayerService.ts';

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
  currentUser = null
}: HomeViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerTimeData | null>(null);
  const [notifiedPrayers, setNotifiedPrayers] = useState<Set<string>>(new Set());

  // Hijri Date Logic
  const hijriDate = moment(currentTime).format('iD iMMMM iYYYY');
  const [hDay, hMonth, hYear] = hijriDate.split(' ');

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
      arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
      translation: "For indeed, with hardship [will be] ease.",
      reference: "Surah Al-Inshirah [94:6]"
    },
    {
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      translation: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
      reference: "Surah Al-Baqarah [2:201]"
    },
    {
      arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
      translation: "Allah is the Light of the heavens and the earth.",
      reference: "Surah An-Nur [24:35]"
    },
    {
      arabic: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا",
      translation: "And be patient, [O Muhammad], for the decision of your Lord, for indeed, you are in Our eyes.",
      reference: "Surah At-Tur [52:48]"
    },
    {
      arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
      translation: "So remember Me; I will remember you.",
      reference: "Surah Al-Baqarah [2:152]"
    }
  ];

  const getDailyVerse = () => {
    const day = new Date().getUTCDate();
    const index = day % DAILY_VERSES.length;
    return DAILY_VERSES[index];
  };

  const dailyVerse = getDailyVerse();

  return (
    <div className="space-y-6 md:space-y-10 pb-20">
      
      {/* 1. BENTO HEADER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        
        {/* WELCOME BLOCK (LG:7) */}
        <div className="lg:col-span-7 glass-panel-purple p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
            <Sparkles size={180} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-brand-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={12} className="animate-pulse" />
              <span>SANCTUARY</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-200 leading-[0.9] tracking-tighter flex items-center gap-4">
              Salam,<br/><span className="text-brand-primary uppercase">Seeker</span>
              {currentUser && topUserId === currentUser.uid && (
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="bg-amber-400 text-amber-900 p-2 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.5)] animate-bounce"
                  title="Sanctuary Crown Holder"
                >
                  <Crown size={32} />
                </motion.div>
              )}
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Your spiritual journey is thriving. You've read 12 more verses than yesterday!
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onNavigate('quran')}
                className="px-8 py-4 bg-brand-primary text-brand-depth font-black rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 text-xs uppercase"
              >
                Continue Quran <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => onNavigate('market')}
                className="px-8 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs uppercase flex items-center gap-3"
              >
                Marketplace <ShoppingBag size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* CLOCK & PRAYER QUICK VIEW (LG:5) */}
        <div className="lg:col-span-5 glass-panel p-8 md:p-10 rounded-[2.5rem] flex flex-col justify-between border-white/5 relative overflow-hidden">
          <div className="flex justify-between items-start">
             <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-black text-slate-200 font-mono tracking-tighter">
                   {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hDay} {hMonth} {hYear}</div>
             </div>
             <button onClick={requestNotificationPermission} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-primary border border-white/10 transition-all">
               <Bell size={20} />
             </button>
          </div>

          <div className="space-y-4 mt-8">
             {prayerData ? (
               <>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                          <Target size={20} />
                       </div>
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Next Prayer</p>
                          <p className="text-sm font-black text-slate-200">{prayerData.nextPrayer}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-brand-primary leading-none">{formatTime(prayerData.nextTime)}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-slate-600 justify-center font-bold">
                    <MapPin size={10} /> Active: {prayerData.currentPrayer} • {location?.lat.toFixed(2)}° N
                 </div>
               </>
             ) : (
               <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-white/5 rounded-2xl" />
                  <div className="h-4 bg-white/5 rounded-full w-1/2 mx-auto" />
               </div>
             )}
          </div>
        </div>
      </div>

      {/* 2. SPIRITUAL METRICS (3 COL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* QURAN PROGRESS */}
        <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-5 group">
           <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-inner">
              <BookOpen size={28} />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Quran Progress</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-slate-200">{versesRead}</span>
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Verses</span>
              </div>
           </div>
        </motion.div>

        {/* HADITH STREAK */}
        <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-5 group">
           <div className="w-16 h-16 rounded-3xl bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all shadow-inner">
              <Flame size={28} className={streak > 0 ? 'animate-pulse' : ''} />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Hadith Streak</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-slate-200">{streak}</span>
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Days</span>
              </div>
           </div>
        </motion.div>

        {/* DUA COUNT */}
        <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-5 group">
           <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-inner">
              <Heart size={28} />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Dua Reflections</p>
              <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black text-slate-200">{duaCount}</span>
                 <span className="text-[10px] text-slate-500 font-bold uppercase">Saved</span>
              </div>
           </div>
        </motion.div>
      </div>

      {/* 3. CENTERPIECE: DAILY REVELATION & SHORTCUTS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* NAVIGATION SHORTCUTS (XL:3) */}
        <div className="xl:col-span-3 space-y-4">
           {[ 
             { id: 'resources', sub: 'adhkar', label: 'Adhkar', icon: Zap, color: 'text-blue-400' },
             { id: 'resources', sub: 'hadith', label: 'Hadith Library', icon: Library, color: 'text-teal-400' },
             { id: 'companion', sub: '', label: 'AI Companion', icon: MessageCircle, color: 'text-purple-400' }
           ].map((link, idx) => (
             <motion.button
               key={link.label}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: idx * 0.1 }}
               onClick={() => onNavigate(link.id, link.sub ? { resId: link.sub } : undefined)}
               className="w-full p-5 glass-panel rounded-2xl border-white/5 flex items-center justify-between group hover:border-brand-primary/30 transition-all bg-white/2"
             >
               <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${link.color}`}>
                     <link.icon size={20} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-200 group-hover:text-white">{link.label}</span>
               </div>
               <ArrowRight size={14} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
             </motion.button>
           ))}
        </div>

        {/* DAILY AYAH (XL:9) */}
        <div className="xl:col-span-9 glass-panel p-8 md:p-12 rounded-[3rem] border-brand-primary/10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <div className="absolute -right-20 -bottom-20 text-brand-primary/5 pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
              <Quote size={400} />
           </div>
           <div className="relative z-10 flex flex-col items-center text-center space-y-8">
              <div className="px-4 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
                 Daily Revelation
              </div>
              <p className="arabic-text text-3xl md:text-5xl text-slate-200 leading-[2] md:leading-[1.8] drop-shadow-lg">
                {dailyVerse.arabic}
              </p>
              <div className="max-w-2xl space-y-2">
                 <p className="text-lg md:text-2xl text-slate-300 font-light italic leading-relaxed">
                   "{dailyVerse.translation}"
                 </p>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">{dailyVerse.reference}</p>
              </div>
              <button 
                onClick={() => onNavigate('quran')}
                className="p-4 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-all scale-125"
              >
                 <ArrowRight size={24} />
              </button>
           </div>
        </div>
      </div>

      {/* 4. LEVEL PROGRESS & RANK CARD */}
      <div className="glass-panel-purple p-8 md:p-10 rounded-[3rem] border-brand-primary/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-brand-primary flex items-center justify-center text-brand-depth shadow-2xl relative">
                  <span className="text-4xl font-black">{level}</span>
                  <div className="absolute -top-2 -right-2 bg-brand-depth text-brand-primary p-2 rounded-full border border-brand-primary shadow-lg">
                     <TrophyIcon size={16} />
                  </div>
              </div>
              <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Spiritual Rank</p>
                 <h3 className="text-3xl font-black text-slate-200">{rank}</h3>
              </div>
           </div>

            <div className="flex-1 w-full max-w-xl space-y-4">
              <div className="flex justify-between items-end">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Hasanat</p>
                    <p className="text-3xl font-black text-slate-200 tracking-tighter">{hasanat.toLocaleString()}</p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Next Level</p>
                    <p className="text-sm font-black text-slate-200">
                       {Math.round(levelProgress)}% Complete
                    </p>
                 </div>
              </div>
              <div className="w-full h-5 bg-brand-depth/10 rounded-full overflow-hidden p-1 shadow-inner border border-brand-depth/5">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${levelProgress}%` }}
                   className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] relative overflow-hidden"
                 >
                    <motion.div 
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full"
                    />
                 </motion.div>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] text-center">
                Keep striving for the sake of Allah to unlock Level {level + 1}
              </p>
           </div>
        </div>
      </div>

      {/* 5. PRAYER LIST (6 COL) */}
      <div className="glass-panel p-6 md:p-10 rounded-[3rem] border-white/5">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Prayer Schedule</h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Updates</span>
            </div>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {prayerTimes.map((prayer) => (
              <div key={prayer.name} className={`p-6 rounded-[2rem] text-center border transition-all duration-500 ${prayer.active ? 'bg-brand-primary shadow-2xl shadow-brand-primary/20 border-brand-primary' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}>
                 <div className={`p-3 bg-white/5 rounded-2xl inline-block mb-4 ${prayer.active ? 'text-brand-depth' : 'text-brand-primary'}`}>
                    <prayer.icon size={20} />
                 </div>
                 <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${prayer.active ? 'text-brand-depth/60' : 'text-slate-500'}`}>{prayer.name}</p>
                 <p className={`text-lg font-black ${prayer.active ? 'text-brand-depth' : 'text-slate-200'}`}>{prayer.time}</p>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}

function TrophyIcon({ size }: { size: number }) {
  return <Sparkles size={size} />;
}
