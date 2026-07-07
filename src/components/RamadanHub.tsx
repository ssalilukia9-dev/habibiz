import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  BookOpen, 
  Heart, 
  Flame, 
  Award, 
  Star 
} from 'lucide-react';
import { PrayerTimeData } from '../services/prayerService.ts';

interface RamadanHubProps {
  currentTime: Date;
  prayerData: PrayerTimeData | null;
  addHasanat?: (amount: number) => void;
}

interface DailyLog {
  suhoor: boolean;
  fasting: boolean;
  taraweeh: boolean;
  quran: boolean;
  sadaqah: boolean;
}

export default function RamadanHub({ currentTime, prayerData, addHasanat }: RamadanHubProps) {
  // Current Ramadan Day (1 to 30) - users can adjust
  const [ramadanDay, setRamadanDay] = useState<number>(() => {
    return Number(localStorage.getItem('ramadan-current-day') || '15');
  });

  const [logs, setLogs] = useState<DailyLog>(() => {
    const saved = localStorage.getItem(`sanctuary_ramadan_log_day_${ramadanDay}`);
    if (saved) return JSON.parse(saved);
    return { suhoor: false, fasting: false, taraweeh: false, quran: false, sadaqah: false };
  });

  // Keep logs in sync when the selected day changes
  useEffect(() => {
    const saved = localStorage.getItem(`sanctuary_ramadan_log_day_${ramadanDay}`);
    if (saved) {
      setLogs(JSON.parse(saved));
    } else {
      setLogs({ suhoor: false, fasting: false, taraweeh: false, quran: false, sadaqah: false });
    }
  }, [ramadanDay]);

  const changeDay = (dir: 'prev' | 'next') => {
    let nextDay = ramadanDay;
    if (dir === 'prev' && ramadanDay > 1) nextDay = ramadanDay - 1;
    if (dir === 'next' && ramadanDay < 30) nextDay = ramadanDay + 1;
    setRamadanDay(nextDay);
    localStorage.setItem('ramadan-current-day', String(nextDay));
  };

  // Serene local synth chime
  const playLocalChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Harmony: E5 to A5 for a bright, divine chime
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn("Browser AudioContext offline or blocked", err);
    }
  };

  const toggleLog = (key: keyof DailyLog) => {
    const newLogs = { ...logs, [key]: !logs[key] };
    setLogs(newLogs);
    localStorage.setItem(`sanctuary_ramadan_log_day_${ramadanDay}`, JSON.stringify(newLogs));

    // If turned on, play chime and reward Hasanat
    if (newLogs[key]) {
      playLocalChime();
      if (addHasanat) {
        addHasanat(50); // Reward 50 Hasanat points per spiritual deed logged
      }
    }
  };

  // Fasting live timers
  const getFastingStatus = () => {
    if (!prayerData) return null;
    
    const now = currentTime.getTime();
    const fajrTime = prayerData.fajr.getTime();
    const maghribTime = prayerData.maghrib.getTime();
    
    let isFasting = false;
    let targetTime: number;
    let label = '';
    
    if (now >= fajrTime && now < maghribTime) {
      isFasting = true;
      targetTime = maghribTime;
      label = 'Iftar (Break Fast)';
    } else {
      isFasting = false;
      if (now >= maghribTime) {
        // After maghrib: Target is Fajr of next day
        targetTime = fajrTime + 24 * 60 * 60 * 1000;
      } else {
        // Before fajr: Target is today's Fajr
        targetTime = fajrTime;
      }
      label = 'Suhoor Closes';
    }
    
    const diff = targetTime - now;
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, isFasting, label, progress: 100 };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Calculate total duration for progress indicator
    let totalDuration = 0;
    if (isFasting) {
      totalDuration = maghribTime - fajrTime;
    } else {
      totalDuration = (24 * 60 * 60 * 1000) - (maghribTime - fajrTime);
    }
    
    const elapsed = totalDuration - diff;
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    return { hours, minutes, seconds, isFasting, label, progress };
  };

  const fastingInfo = getFastingStatus();

  // Ramadan standard Duas
  const handleSpeak = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Calculated count of completed fasts across the logs
  const getFastedDaysCount = () => {
    let count = 0;
    for (let i = 1; i <= 30; i++) {
      const daySaved = localStorage.getItem(`sanctuary_ramadan_log_day_${i}`);
      if (daySaved) {
        const parsed = JSON.parse(daySaved);
        if (parsed.fasting) count++;
      }
    }
    return count;
  };

  const totalFasted = getFastedDaysCount();

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-1 glass-panel rounded-[4rem] border-amber-500/20 bg-gradient-to-b from-amber-500/5 via-black/20 to-black/40 overflow-hidden relative shadow-3xl"
    >
      {/* Background celestial glow decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -mt-32 -mr-32" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -mb-32 -ml-32" />
      
      <div className="p-8 md:p-12 space-y-10 relative z-10">
        
        {/* Row 1: Header / Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Moon size={30} className="fill-amber-400/10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em]">Ramadan Mubārak</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                Holy Month Hub
                <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Live Track
                </span>
              </h2>
            </div>
          </div>

          {/* Ramadan Day Picker UI */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button 
              onClick={() => changeDay('prev')}
              disabled={ramadanDay <= 1}
              className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Previous Ramadan Day"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center min-w-[130px]">
              <p className="text-[8px] font-black text-amber-400 uppercase tracking-[0.2em]">Spiritual Stage</p>
              <p className="text-sm font-black text-white">Day {ramadanDay} of 30</p>
            </div>
            <button 
              onClick={() => changeDay('next')}
              disabled={ramadanDay >= 30}
              className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Next Ramadan Day"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Row 2: Bento fast timers & Progress indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Fast Timer Box */}
          <div className="lg:col-span-7 bg-black/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000" 
                style={{ width: `${fastingInfo?.progress || 0}%` }}
              />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-amber-400/80 uppercase tracking-widest block">
                    Current Gateway Timing
                  </span>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    {fastingInfo?.isFasting ? 'State: Active Fasting' : 'State: Eating Permitted'}
                    <span className={`w-2.5 h-2.5 rounded-full ${fastingInfo?.isFasting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                  </h3>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${fastingInfo?.isFasting ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {fastingInfo?.isFasting ? 'Fasting Active' : 'Rest Mode'}
                </div>
              </div>

              {/* Huge Timer */}
              {fastingInfo ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={12} className="text-amber-400" /> Countdown to {fastingInfo.label}
                  </p>
                  <div className="flex items-center gap-4 font-mono select-none">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-center min-w-[70px]">
                      <div className="text-4xl md:text-5xl font-black text-white">
                        {String(fastingInfo.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-1">Hrs</div>
                    </div>
                    <span className="text-3xl text-slate-600 font-bold">:</span>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-center min-w-[70px]">
                      <div className="text-4xl md:text-5xl font-black text-white">
                        {String(fastingInfo.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-1">Min</div>
                    </div>
                    <span className="text-3xl text-slate-600 font-bold">:</span>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-center min-w-[70px]">
                      <div className="text-4xl md:text-5xl font-black text-amber-400">
                        {String(fastingInfo.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-wider mt-1">Sec</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-slate-500 text-sm">Synchronizing location prayer grids...</div>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Fasts Kept</p>
                  <p className="text-sm font-black text-white">{totalFasted} / 30 Fasts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Suhoor Ends</p>
                <p className="text-xs font-black text-slate-200">
                  {prayerData ? prayerData.fajr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Checklist Tracker */}
          <div className="lg:col-span-5 bg-black/40 border border-white/5 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Star size={14} className="text-amber-400 fill-amber-400" /> Day {ramadanDay} Spiritual Deeds
                </h4>
                <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">
                  +50 Hasanat Each
                </span>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'suhoor' as const, label: 'Suhoor & Intended Fast', desc: 'Pre-dawn meal & intention' },
                  { key: 'fasting' as const, label: 'Complete Daily Sawm', desc: 'Fasted sunrise to sunset' },
                  { key: 'taraweeh' as const, label: 'Prayed Taraweeh / Night', desc: 'Qiyam prayers completed' },
                  { key: 'quran' as const, label: 'Read Daily Portion of Quran', desc: 'Minimum 1 page/Juz' },
                  { key: 'sadaqah' as const, label: 'Gave Sadaqah / Did Good', desc: 'Charity or helping a person' },
                ].map((deed) => {
                  const isChecked = logs[deed.key];
                  return (
                    <button
                      key={deed.key}
                      onClick={() => toggleLog(deed.key)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all ${isChecked ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}
                    >
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold transition-colors ${isChecked ? 'text-amber-400' : 'text-slate-200'}`}>{deed.label}</p>
                        <p className="text-[10px] text-slate-500">{deed.desc}</p>
                      </div>
                      <div className={`w-7 h-7 rounded-lg shrink-0 border flex items-center justify-center transition-all ${isChecked ? 'bg-amber-500 border-amber-500 text-brand-depth scale-105' : 'border-white/10 text-transparent'}`}>
                        <Check size={16} strokeWidth={3} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Live Ramadan Duas Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2 border-t border-white/5">
          
          {/* Dua 1: Suhoor */}
          <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] space-y-4 relative group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Morning Intention</p>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Sawm (Fasting) Intention Dua</h4>
              </div>
              <button 
                onClick={() => handleSpeak("وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ", "ar")}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors border border-white/5"
                title="Listen Arabic Recitation"
              >
                <Volume2 size={16} />
              </button>
            </div>
            
            <p className="arabic-text text-2xl text-amber-200/90 leading-normal text-right pr-2">
              وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ
            </p>
            
            <div className="space-y-1 bg-black/20 p-4 rounded-xl border border-white/[0.02]">
              <p className="text-[10px] font-semibold text-slate-400 italic">
                "Wa bi-sawmi ghadinn nawaytu min shahri Ramadān."
              </p>
              <p className="text-[11px] text-slate-300 leading-normal">
                I intend to keep the fast for tomorrow in the month of Ramadan.
              </p>
            </div>
          </div>

          {/* Dua 2: Iftar */}
          <div className="p-8 bg-white/[0.01] border border-white/5 rounded-[2rem] space-y-4 relative group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Sunset Gratitude</p>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Iftar Breaking Dua</h4>
              </div>
              <button 
                onClick={() => handleSpeak("اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ", "ar")}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors border border-white/5"
                title="Listen Arabic Recitation"
              >
                <Volume2 size={16} />
              </button>
            </div>
            
            <p className="arabic-text text-2xl text-amber-200/90 leading-normal text-right pr-2">
              اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
            </p>
            
            <div className="space-y-1 bg-black/20 p-4 rounded-xl border border-white/[0.02]">
              <p className="text-[10px] font-semibold text-slate-400 italic">
                "Allāhumma innī laka sumtu wa bika āmantu wa 'alā rizqika aftartu."
              </p>
              <p className="text-[11px] text-slate-300 leading-normal">
                O Allah, I fasted for You and I believe in You and with Your provision I break my fast.
              </p>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
