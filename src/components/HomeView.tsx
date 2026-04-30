import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Compass
} from 'lucide-react';
import { getDailyHadith } from '../data/hadiths.ts';

export default function HomeView({ onNavigate }: { onNavigate: (tab: string, extra?: any) => void }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const dailyHadith = getDailyHadith();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification("Prayer Time Reminder", { 
          body: "It's time for Dhuhr prayer. Take a moment for your soul.",
          icon: '/favicon.ico'
        });
      } else {
        Notification.requestPermission();
      }
    }
  };

  const prayerTimes = [
    { name: 'Fajr', time: '04:12 AM', icon: Sunrise, active: false },
    { name: 'Dhuhr', time: '12:45 PM', icon: Sun, active: true },
    { name: 'Asr', time: '04:15 PM', icon: CloudSun, active: false },
    { name: 'Maghrib', time: '07:32 PM', icon: Sunset, active: false },
    { name: 'Isha', time: '09:10 PM', icon: Moon, active: false },
  ];

  const spiritualStats = [
    { label: 'Quran Progress', value: '14%', sub: '2 Surahs read today', color: 'bg-emerald-500' },
    { label: 'Hadith Streak', value: '12', sub: 'Day streak active', color: 'bg-amber-500' },
    { label: 'Dua Count', value: '45', sub: 'Reflections saved', color: 'bg-blue-500' }
  ];

  const tools = [
    { id: 'zakat', name: 'Zakat Calculator', icon: Zap, desc: 'Calculate your purification' },
    { id: 'qibla', name: 'Qibla Finder', icon: Compass, desc: 'Find the sacred direction' },
    { id: 'babynames', name: 'Islamic Names', icon: Sparkles, desc: 'Meanings of beauty' }
  ];

  const dailyVerse = {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "For indeed, with hardship [will be] ease.",
    reference: "Surah Al-Inshirah [94:6]"
  };

  return (
    <div className="space-y-12">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="space-y-4 max-w-xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-[0.3em] mb-2"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>Digital Sanctuary</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
            Assalamu <br/><span className="text-brand-primary">Alaikum</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Welcome back to your spiritual hub. Explore the depths of the Quran and the wisdom of Hadith.
          </p>
          <div className="flex gap-4 pt-4">
             <button 
               onClick={() => onNavigate('quran')}
               className="px-8 py-4 bg-brand-primary text-brand-depth font-bold rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
                Continue Reading <ArrowRight size={18} />
             </button>
             <button 
               onClick={() => onNavigate('settings')}
               className="px-8 py-4 glass-panel text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
             >
                Prayer Times
             </button>
          </div>
        </div>

        <div className="md:w-[320px] glass-panel p-8 rounded-[2.5rem] text-center relative group overflow-hidden animate-float">
          <div className="absolute top-0 left-0 w-full h-full bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <button 
            onClick={testNotification}
            className="absolute top-4 right-4 w-10 h-10 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center hover:bg-brand-primary hover:text-brand-depth transition-all"
            title="Test Prayer Reminder"
          >
            <Bell size={18} />
          </button>

          <div className="p-4 bg-brand-primary/10 rounded-2xl inline-block mb-6 shadow-inner">
             <Calendar size={24} className="text-brand-primary" />
          </div>

          <div className="text-4xl font-black text-brand-primary font-mono tracking-tighter mb-2">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Next Prayer</span>
                <span className="text-brand-primary font-bold">ASR • 4:15 PM</span>
             </div>
             <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full w-[65%] rounded-full shadow-[0_0_10px_#d4af37]" />
             </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS / BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Daily Verse */}
         <motion.div 
           whileHover={{ y: -5 }}
           onClick={() => onNavigate('quran', { surahNumber: 94 })}
           className="col-span-1 md:col-span-2 glass-panel p-8 rounded-[2rem] border-brand-primary/10 relative overflow-hidden group cursor-pointer"
         >
            <div className="absolute -right-10 -bottom-10 text-brand-primary/5 group-hover:rotate-12 transition-transform duration-700">
               <BookOpen size={240} />
            </div>
            <div className="flex items-center gap-2 mb-8 text-brand-primary font-bold text-[10px] uppercase tracking-widest bg-brand-primary/10 w-fit px-3 py-1 rounded-full">
               <Zap size={12} /> Daily Revelation
            </div>
            <p className="arabic-text text-4xl text-brand-primary mb-8 leading-relaxed drop-shadow-sm">
               {dailyVerse.arabic}
            </p>
            <div className="space-y-2">
               <p className="text-xl text-slate-300 font-light italic leading-relaxed">"{dailyVerse.translation}"</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{dailyVerse.reference}</p>
            </div>
         </motion.div>

         {/* Calendar/Hijri */}
         <div className="glass-panel p-8 rounded-[2rem] flex flex-col justify-between border-brand-primary/10">
            <div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Hijri Date</div>
               <div className="text-3xl font-bold text-white">14 Shawwal</div>
               <div className="text-brand-primary font-black text-4xl mt-1">1447</div>
            </div>
            <div className="pt-6 border-t border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 italic">Ongoing Event</p>
                <p className="text-sm font-bold text-slate-200">Post-Ramadan Gratitude</p>
            </div>
         </div>
      </div>

      {/* SPIRITUAL TRACKER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {spiritualStats.map((stat, i) => (
           <motion.div 
             key={stat.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="glass-panel p-6 rounded-[2rem] border-white/5 group hover:border-brand-primary/20 transition-all"
           >
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">{stat.label}</div>
              <div className="flex items-end gap-3 mb-4">
                 <span className="text-4xl font-black text-white leading-none">{stat.value}</span>
                 <span className="text-[10px] text-brand-primary font-bold mb-1">{stat.sub}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: stat.value.includes('%') ? stat.value : '40%' }}
                   className={`h-full ${stat.color} shadow-[0_0_10px_currentColor] opacity-60`} 
                 />
              </div>
           </motion.div>
         ))}
      </div>

      {/* TOOLS & UTILITIES */}
      <div className="space-y-6">
         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] text-center">Spiritual Toolbox</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
               <button 
                 key={tool.name}
                 onClick={() => onNavigate('resources', { resId: tool.id })}
                 className="flex items-center gap-6 p-6 glass-panel rounded-3xl group border-white/5 hover:border-brand-primary/30 transition-all text-left"
               >
                  <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform shadow-inner">
                     <tool.icon size={28} />
                  </div>
                  <div>
                     <p className="font-bold text-slate-100 mb-0.5">{tool.name}</p>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{tool.desc}</p>
                  </div>
               </button>
            ))}
         </div>
      </div>

      {/* DAILY HADITH SECTION - FULL WIDTH */}
      <div className="relative">
         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em] mb-8 text-center">Wisdom of the Day</div>
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           onClick={() => onNavigate('hadith')}
           className="glass-panel p-10 md:p-16 rounded-[3rem] border-brand-primary/20 relative overflow-hidden shadow-2xl cursor-pointer group"
         >
            <div className="absolute top-0 right-0 p-12 text-brand-primary/5 pointer-events-none">
              <Quote size={180} />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <p className="arabic-text text-4xl md:text-5xl text-brand-primary mb-10 leading-loose">
                {dailyHadith.arabic}
              </p>
              <p className="text-slate-300 italic text-2xl font-light leading-relaxed mb-10 px-4">
                "{dailyHadith.english}"
              </p>
              <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-8 border-t border-white/10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                       <MessageCircle size={18} />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narrated by</p>
                       <p className="text-sm font-bold text-slate-200">{dailyHadith.narrator}</p>
                    </div>
                 </div>
                 <div className="w-px h-10 bg-white/10 hidden md:block" />
                 <div className="px-4 py-2 bg-brand-primary/5 border border-brand-primary/20 rounded-full text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                    {dailyHadith.collection} • {dailyHadith.topic}
                 </div>
              </div>
            </div>
         </motion.div>
      </div>

      {/* PRAYER TIMES LIST */}
      <div className="glass-panel p-8 rounded-[2rem] border-white/5">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] mb-10">Prayer Schedule</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name} 
              className={`p-6 rounded-3xl text-center transition-all duration-300 border ${
                prayer.active 
                  ? 'bg-brand-primary shadow-lg shadow-brand-primary/20 border-brand-primary' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div className="flex justify-center mb-4">
                <prayer.icon size={20} className={prayer.active ? 'text-brand-depth' : 'text-brand-primary'} />
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${prayer.active ? 'text-brand-depth/60' : 'text-slate-500'}`}>
                {prayer.name}
              </div>
              <div className={`text-sm font-black ${prayer.active ? 'text-brand-depth' : 'text-white'}`}>
                {prayer.time}
              </div>
              {prayer.active && (
                <div className="mt-2 text-[8px] font-bold px-2 py-0.5 bg-white/20 rounded-full text-brand-depth inline-block animate-pulse">
                  CURRENT
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
