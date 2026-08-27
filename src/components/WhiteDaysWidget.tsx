import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Moon, 
  Calendar, 
  Clock, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Share2, 
  Volume2, 
  Heart, 
  Star, 
  BookOpen, 
  X,
  AlertCircle
} from 'lucide-react';
import { getUpcomingWhiteDays, WhiteDayInfo } from '../services/islamicScheduleService.ts';
import { notificationService } from '../services/notificationService.ts';

interface WhiteDaysWidgetProps {
  addHasanat?: (amount: number) => void;
  onNavigateToFastTracker?: () => void;
  className?: string;
  forceShow?: boolean;
  daysUntilRamadan?: number;
  onPreviewRamadanCountdown?: () => void;
}

export default function WhiteDaysWidget({
  addHasanat,
  onNavigateToFastTracker,
  className = '',
  forceShow = false,
  daysUntilRamadan,
  onPreviewRamadanCountdown
}: WhiteDaysWidgetProps) {
  const [whiteDaysInfo, setWhiteDaysInfo] = useState(getUpcomingWhiteDays());
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isTodayActive: false });
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [threeDaysEarlyAlert, setThreeDaysEarlyAlert] = useState(true);
  const [fastingIntentions, setFastingIntentions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('white-days-intentions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showHadithModal, setShowHadithModal] = useState(false);
  const [showDuasModal, setShowDuasModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [playingDuaAudio, setPlayingDuaAudio] = useState<string | null>(null);

  // Check if widget should be visible:
  // Visible starting 3 days before (10th of Hijri month) through the 15th, and disappears when done (16th onwards)
  const isWindowActive = whiteDaysInfo.isWithin3DaysOrActive;

  // If outside the 3-day window and not force-shown, don't render
  if (!forceShow && !isWindowActive) {
    return null;
  }

  // Load reminder settings from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('whitedays-reminder-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.enabled !== undefined) setRemindersEnabled(parsed.enabled);
        if (parsed.threeDaysEarly !== undefined) setThreeDaysEarlyAlert(parsed.threeDaysEarly);
      }
    } catch {}
  }, []);

  // Update schedule and countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const info = getUpcomingWhiteDays();
      setWhiteDaysInfo(info);

      const now = new Date();
      const targetDay = info.nextUpcomingDay;

      if (!targetDay) return;

      const targetDate = new Date(targetDay.gregorianDate);
      targetDate.setHours(5, 15, 0, 0); // Fajr start of fast

      const diffMs = targetDate.getTime() - now.getTime();
      const isTodayActive = targetDay.isToday;

      if (diffMs <= 0 && isTodayActive) {
        // If today is a white day and past Fajr, target is Iftar (around 18:45)
        const iftarDate = new Date(targetDay.gregorianDate);
        iftarDate.setHours(18, 45, 0, 0);
        const iftarDiff = Math.max(0, iftarDate.getTime() - now.getTime());

        const hours = Math.floor(iftarDiff / (1000 * 60 * 60));
        const minutes = Math.floor((iftarDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((iftarDiff % (1000 * 60)) / 1000);
        setCountdown({ days: 0, hours, minutes, seconds, isTodayActive: true });
      } else {
        const safeDiff = Math.max(0, diffMs);
        const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((safeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((safeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((safeDiff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, isTodayActive: false });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleReminder = () => {
    const nextState = !remindersEnabled;
    setRemindersEnabled(nextState);
    saveSettings({ enabled: nextState, threeDaysEarly: threeDaysEarlyAlert });

    if (nextState) {
      notificationService.requestPermission();
      notificationService.notify(
        '🌕 White Days Fasting Alarms Active',
        'You will receive reminders for the 13th, 14th, and 15th of the Hijri month.',
        'whitedays'
      );
    }
  };

  const toggleThreeDaysEarly = () => {
    const nextState = !threeDaysEarlyAlert;
    setThreeDaysEarlyAlert(nextState);
    saveSettings({ enabled: remindersEnabled, threeDaysEarly: nextState });
    
    if (nextState) {
      notificationService.notify(
        '🔔 3-Day Advance Notice Enabled',
        'You will be reminded 3 days before the White Days begin to prepare your fasting intention.',
        'whitedays'
      );
    }
  };

  const saveSettings = (obj: any) => {
    try {
      localStorage.setItem('whitedays-reminder-settings', JSON.stringify(obj));
    } catch {}
  };

  const toggleIntention = (dateKey: string) => {
    const updated = { ...fastingIntentions, [dateKey]: !fastingIntentions[dateKey] };
    setFastingIntentions(updated);
    try {
      localStorage.setItem('white-days-intentions', JSON.stringify(updated));
    } catch {}

    if (updated[dateKey] && addHasanat) {
      addHasanat(25);
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', {
        detail: { amount: 25, reason: 'Sacred Fasting Intention (Niyyah) Set! +25 Hasanat!' }
      }));
    }
  };

  const handleShare = async () => {
    const text = `🌙 Reminder: Upcoming White Days Sunnah Fasting (13th, 14th, 15th ${whiteDaysInfo.currentHijriMonthName}). The Prophet ﷺ said: "Fasting three days of every month is equivalent to fasting a whole lifetime." Join me in fasting!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'White Days Sunnah Fasting', text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const playDuaTTS = (text: string, id: string) => {
    if (playingDuaAudio === id) {
      window.speechSynthesis?.cancel();
      setPlayingDuaAudio(null);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.onend = () => setPlayingDuaAudio(null);
      utterance.onerror = () => setPlayingDuaAudio(null);
      setPlayingDuaAudio(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine active display days: show current month's 13-15 or next month if current passed
  const activeDays = (whiteDaysInfo.currentMonthDays.some(d => d.daysRemaining >= 0))
    ? whiteDaysInfo.currentMonthDays
    : whiteDaysInfo.nextMonthDays;

  return (
    <div 
      id="white-days-widget"
      className={`relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-[#131118] to-black/80 p-6 sm:p-8 backdrop-blur-xl shadow-[0_10px_40px_rgba(245,158,11,0.12)] space-y-6 ${className}`}
    >
      {/* Ambient glowing lunar aura */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <Moon size={26} className="text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                White Days Fasting
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Sparkles size={11} /> Ayyam al-Beed
              </span>
            </div>
            <p className="text-xs text-amber-200/75 font-medium">
              13th, 14th, 15th {activeDays[0]?.hijriMonthName} • Sunnah of the Prophet ﷺ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowHadithModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen size={13} />
            <span>Virtues</span>
          </button>

          <button
            onClick={() => setShowDuasModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Heart size={13} className="text-amber-400" />
            <span>Duas</span>
          </button>

          <button
            onClick={toggleReminder}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border cursor-pointer ${
              remindersEnabled
                ? 'bg-amber-500 text-black border-amber-400 font-black shadow-md shadow-amber-500/25'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <Bell size={13} className={remindersEnabled ? 'animate-bounce' : ''} />
            <span>{remindersEnabled ? 'Alerts ON' : 'Alerts OFF'}</span>
          </button>
        </div>
      </div>

      {/* Ramadan Approaching Teaser Banner if within 60 days */}
      {daysUntilRamadan !== undefined && daysUntilRamadan > 0 && daysUntilRamadan <= 60 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/15 border border-amber-400/30 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-base">🌙</span>
            <div>
              <span className="font-black text-amber-300">Blessed Month of Ramadan is approaching</span>
              <span className="text-slate-300 ml-1.5 font-medium hidden sm:inline">({daysUntilRamadan} days remaining)</span>
            </div>
          </div>
          {onPreviewRamadanCountdown && (
            <button
              onClick={onPreviewRamadanCountdown}
              className="px-3 py-1 rounded-xl bg-amber-400 text-black font-black text-[10px] uppercase tracking-wider hover:bg-amber-300 transition-all flex items-center gap-1 shadow-md shadow-amber-400/20 cursor-pointer shrink-0"
            >
              <Sparkles size={11} />
              <span>Preview Ramadan Countdown</span>
            </button>
          )}
        </div>
      )}

      {/* Countdown Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black/70 via-amber-950/40 to-black/70 border border-amber-500/25 p-4 sm:p-5 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-400 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                {countdown.isTodayActive 
                  ? '✨ White Days Fasting Active Today!' 
                  : 'Countdown to Next White Days Fast'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {countdown.isTodayActive 
                ? 'Time remaining until Iftar at Sunset:' 
                : `Next window starts Fajr on ${whiteDaysInfo.nextUpcomingDay?.dateStr || 'the 13th'}:`}
            </p>
          </div>

          {/* Countdown Clock Tiles */}
          <div className="flex items-center gap-2 sm:gap-3 font-mono">
            {!countdown.isTodayActive && (
              <div className="flex flex-col items-center bg-black/60 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[54px]">
                <span className="text-xl sm:text-2xl font-black text-amber-300">
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">Days</span>
              </div>
            )}

            <div className="flex flex-col items-center bg-black/60 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[54px]">
              <span className="text-xl sm:text-2xl font-black text-white">
                {String(countdown.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">Hours</span>
            </div>

            <div className="flex flex-col items-center bg-black/60 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[54px]">
              <span className="text-xl sm:text-2xl font-black text-white">
                {String(countdown.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">Mins</span>
            </div>

            <div className="flex flex-col items-center bg-black/60 border border-amber-500/30 rounded-xl px-3 py-1.5 min-w-[54px]">
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                {String(countdown.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Lunar White Days Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {activeDays.map((day, idx) => {
          const isFullMoon = day.hijriDay === 14;
          const isPast = day.daysRemaining < 0;
          const dateKey = `${day.hijriYear}-${day.hijriMonthName}-${day.hijriDay}`;
          const isIntended = !!fastingIntentions[dateKey];

          return (
            <motion.div
              key={`${dateKey}-${idx}`}
              whileHover={{ y: -2 }}
              className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between gap-3 ${
                day.isToday
                  ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50'
                  : isFullMoon
                  ? 'bg-white/5 border-amber-500/30'
                  : 'bg-black/30 border-white/10'
              }`}
            >
              {/* Top Tag & Lunar Phase */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    day.isToday
                      ? 'bg-amber-400 text-black shadow-md'
                      : isFullMoon
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}>
                    {day.hijriDay}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 block">
                      Day {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {day.hijriDay}th {day.hijriMonthName}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {day.isToday ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      Today
                    </span>
                  ) : day.isTomorrow ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider">
                      Tomorrow
                    </span>
                  ) : isPast ? (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[9px] font-bold">
                      Completed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-amber-200/80 border border-white/5 text-[9px] font-bold">
                      In {day.daysRemaining} days
                    </span>
                  )}
                </div>
              </div>

              {/* Gregorian Date */}
              <div className="space-y-0.5 py-1">
                <p className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Calendar size={12} className="text-amber-400" />
                  {day.dateStr}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isFullMoon ? '🌕 Full Moon (Peak Luminosity)' : idx === 0 ? '🌔 Waxing Gibbous' : '🌖 Waning Gibbous'}
                </p>
              </div>

              {/* Intention / Completed Checkbox Button */}
              <button
                onClick={() => toggleIntention(dateKey)}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isIntended
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:text-white'
                }`}
              >
                <CheckCircle2 size={14} className={isIntended ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{isIntended ? 'Intention Set (+25)' : 'Make Fasting Niyyah'}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs border-t border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleThreeDaysEarly}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              threeDaysEarlyAlert
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <Bell size={12} />
            <span>3-Day Early Alert: {threeDaysEarlyAlert ? 'Active' : 'Muted'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={12} />
            <span>{copiedLink ? 'Copied Schedule!' : 'Share Sunnah'}</span>
          </button>
        </div>

        <p className="text-[11px] text-amber-200/80 italic">
          "Fasting 3 days every month is like fasting for a lifetime." (Sahih Bukhari)
        </p>
      </div>

      {/* Virtues of White Days Hadith Modal */}
      <AnimatePresence>
        {showHadithModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#13111c] border border-amber-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Virtues of White Days (Ayyam al-Beed)</h4>
                    <p className="text-xs text-amber-200/70">Authentic Prophetic Traditions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHadithModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">1. Like Fasting an Entire Year</span>
                  <p className="italic text-white leading-relaxed">
                    Abu Hurairah (RA) narrated: "My beloved Prophet ﷺ advised me to do three things: to fast three days of every month, to pray two Rak'ahs of Duha, and to pray Witr before sleeping."
                  </p>
                  <span className="text-[10px] text-slate-400 block">— Sahih al-Bukhari (1981)</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">2. Specific 13th, 14th, and 15th</span>
                  <p className="italic text-white leading-relaxed">
                    Abu Dharr (RA) reported that the Messenger of Allah ﷺ said: "If you fast three days of a month, then fast on the thirteenth, fourteenth, and fifteenth."
                  </p>
                  <span className="text-[10px] text-slate-400 block">— Sunan an-Nasa'i (2420), Jami` at-Tirmidhi (761)</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">3. Tenfold Reward (Hasanat Multiplier)</span>
                  <p className="italic text-white leading-relaxed">
                    "Fasting three days every month is equivalent to fasting all the time, because each good deed is rewarded tenfold."
                  </p>
                  <span className="text-[10px] text-slate-400 block">— Sahih al-Bukhari & Sahih Muslim</span>
                </div>
              </div>

              <button
                onClick={() => setShowHadithModal(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all"
              >
                Close & Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fasting Du'as Modal */}
      <AnimatePresence>
        {showDuasModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#13111c] border border-amber-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Suhoor & Iftar Supplications</h4>
                    <p className="text-xs text-amber-200/70">Prophetic Du'as for Voluntary Fasts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDuasModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Suhoor Niyyah */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Intention for Fasting (Niyyah)</span>
                    <button
                      onClick={() => playDuaTTS("Wa bisawmi ghadin nawaytu min shahri ayyam al beed", "niyyah")}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 text-[10px] flex items-center gap-1"
                    >
                      <Volume2 size={12} className={playingDuaAudio === "niyyah" ? "animate-spin" : ""} /> Listen
                    </button>
                  </div>
                  <p className="arabic-text text-base text-amber-200 font-bold dir-rtl text-right">
                    نَوَيْتُ صَوْمَ أَيَّامِ الْبِيضِ سُنَّةً لِلَّهِ تَعَالَى
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "I intend to fast the White Days as a Sunnah for the sake of Allah the Almighty."
                  </p>
                </div>

                {/* Iftar Du'a */}
                <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Du'a at Breaking the Fast (Iftar)</span>
                    <button
                      onClick={() => playDuaTTS("Dhahaba al-dhama'u wabtallat al-'urooq wa thabata al-ajru in sha Allah", "iftar")}
                      className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 text-[10px] flex items-center gap-1"
                    >
                      <Volume2 size={12} className={playingDuaAudio === "iftar" ? "animate-spin" : ""} /> Listen
                    </button>
                  </div>
                  <p className="arabic-text text-base text-amber-200 font-bold dir-rtl text-right">
                    ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills." (Abu Dawud)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDuasModal(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
