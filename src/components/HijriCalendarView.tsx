import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment-hijri';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Sparkles, 
  Clock, 
  Star, 
  Compass, 
  Flame, 
  BookOpen, 
  Info, 
  ArrowRight,
  RefreshCw,
  Bell
} from 'lucide-react';
import { getPrayerTimes, formatTime } from '../services/prayerService.ts';

interface HijriEvent {
  title: string;
  arabicTitle: string;
  hijriDay: number;
  hijriMonth: number; // 1 to 12
  monthName: string;
  description: string;
  virtue: string;
  isMajor?: boolean;
}

const ISLAMIC_EVENTS: HijriEvent[] = [
  {
    title: 'Islamic New Year',
    arabicTitle: 'رأس السنة الهجرية',
    hijriDay: 1,
    hijriMonth: 1,
    monthName: 'Muharram',
    description: 'The first day of the Islamic lunar calendar marking the Hijrah of the Prophet ﷺ from Makkah to Madinah.',
    virtue: 'Sacred month of Muharram; good deeds carry heightened reward.',
    isMajor: true
  },
  {
    title: 'Day of Ashura',
    arabicTitle: 'يوم عاشوراء',
    hijriDay: 10,
    hijriMonth: 1,
    monthName: 'Muharram',
    description: 'Commemorates Allah saving Prophet Musa (AS) and Bani Israel from Pharaoh. Fasting on this day expiates the sins of the previous year.',
    virtue: 'Sunnah to fast on the 9th and 10th (or 10th and 11th) of Muharram.',
    isMajor: true
  },
  {
    title: 'Mawlid an-Nabi',
    arabicTitle: 'المولد النبوي الشريف',
    hijriDay: 12,
    hijriMonth: 3,
    monthName: "Rabi' al-Awwal",
    description: 'The birth of the Messenger of Allah, Prophet Muhammad ﷺ, the Mercy to all worlds.',
    virtue: 'Time to increase in sending blessings (Salawat) upon the Prophet ﷺ and studying the Seerah.'
  },
  {
    title: "Isra and Mi'raj",
    arabicTitle: 'الإسراء والمعراج',
    hijriDay: 27,
    hijriMonth: 7,
    monthName: 'Rajab',
    description: 'The miraculous Night Journey from Makkah to Al-Quds and ascension through the seven heavens where the 5 daily prayers were ordained.',
    virtue: 'Rajab is one of the four sacred months. Deepen prayer devotion.',
    isMajor: true
  },
  {
    title: "Mid-Sha'ban (Nisf Sha'ban)",
    arabicTitle: 'ليلة النصف من شعبان',
    hijriDay: 15,
    hijriMonth: 8,
    monthName: "Sha'ban",
    description: 'Night of forgiveness preceding the holy month of Ramadan.',
    virtue: 'Recommended for voluntary night prayers and preparation for Ramadan.'
  },
  {
    title: '1st of Ramadan (Fasting Begins)',
    arabicTitle: 'أول رمضان المبارك',
    hijriDay: 1,
    hijriMonth: 9,
    monthName: 'Ramadan',
    description: 'The blessed month of obligatory fasting, Quran revelation, and spiritual elevation.',
    virtue: 'Gates of Paradise are opened, gates of Hell are closed, and devils are chained.',
    isMajor: true
  },
  {
    title: 'Laylat al-Qadr (Night of Decree)',
    arabicTitle: 'ليلة القدر',
    hijriDay: 27,
    hijriMonth: 9,
    monthName: 'Ramadan',
    description: 'Better than a thousand months (83+ years of continuous worship). Sought in the odd nights of the last ten days.',
    virtue: 'Worship on this night equals more than 1,000 months of good deeds.',
    isMajor: true
  },
  {
    title: 'Eid al-Fitr',
    arabicTitle: 'عيد الفطر المبارك',
    hijriDay: 1,
    hijriMonth: 10,
    monthName: 'Shawwal',
    description: 'Celebration of completing the blessed month of Ramadan fasting. Day of charity (Zakat al-Fitr), joy, and community prayer.',
    virtue: 'Followed by the Sunnah of fasting 6 days of Shawwal.',
    isMajor: true
  },
  {
    title: 'Day of Arafah',
    arabicTitle: 'يوم عرفة',
    hijriDay: 9,
    hijriMonth: 12,
    monthName: 'Dhul-Hijjah',
    description: 'The pinnacle of Hajj pilgrimage. Fasting on this day expiates sins of the past year and coming year for non-pilgrims.',
    virtue: 'Best day of the entire year for Dua and supplication.',
    isMajor: true
  },
  {
    title: 'Eid al-Adha',
    arabicTitle: 'عيد الأضحى المبارك',
    hijriDay: 10,
    hijriMonth: 12,
    monthName: 'Dhul-Hijjah',
    description: 'Feast of Sacrifice commemorating Prophet Ibrahim\'s (AS) devotion. Days of Tashreeq and Qurbani.',
    virtue: 'Days of eating, drinking, and glorifying the remembrance of Allah (Takbeerat).',
    isMajor: true
  }
];

const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah'
];

export default function HijriCalendarView({ onNavigate }: { onNavigate?: (tab: string, extra?: any) => void }) {
  // Current real date
  const now = useMemo(() => new Date(), []);
  
  // Hijri offset tracker for navigation
  const [currentMoment, setCurrentMoment] = useState(() => moment());
  const [selectedDayObj, setSelectedDayObj] = useState<any>(null);
  
  // Date converter states
  const [gregInput, setGregInput] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [hijriConvertedOutput, setHijriConvertedOutput] = useState<string>('');

  const currentHijriMonthNum = currentMoment.iMonth() + 1; // 1-12
  const currentHijriYear = currentMoment.iYear();
  const currentHijriMonthName = HIJRI_MONTH_NAMES[currentMoment.iMonth()] || currentMoment.format('iMMMM');

  // Compute days in the displayed Hijri month
  const calendarDays = useMemo(() => {
    const daysInMonth = moment.iDaysInMonth(currentHijriYear, currentMoment.iMonth());
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const m = moment(`${currentHijriYear}/${currentHijriMonthNum}/${day}`, 'iYYYY/iM/iD');
      const gregDate = m.toDate();
      const dayOfWeek = gregDate.getDay(); // 0: Sun, 1: Mon, etc.
      
      const isWhiteDay = day === 13 || day === 14 || day === 15;
      const isMondayOrThursday = dayOfWeek === 1 || dayOfWeek === 4;
      const isToday = m.isSame(moment(), 'day');

      // Check if any Islamic event on this day
      const event = ISLAMIC_EVENTS.find(e => e.hijriMonth === currentHijriMonthNum && e.hijriDay === day);

      days.push({
        hijriDay: day,
        hijriMonth: currentHijriMonthNum,
        hijriYear: currentHijriYear,
        gregDate,
        gregFormatted: m.format('D MMM'),
        dayName: m.format('ddd'),
        dayOfWeek,
        isWhiteDay,
        isMondayOrThursday,
        isToday,
        event,
        momentObj: m
      });
    }
    return days;
  }, [currentHijriYear, currentHijriMonthNum, currentMoment]);

  // First day offset for empty grid cells
  const firstDayOfWeek = calendarDays.length > 0 ? calendarDays[0].dayOfWeek : 0;

  // Handlers for month navigation
  const nextHijriMonth = () => {
    setCurrentMoment(prev => moment(prev).add(1, 'iMonth'));
  };

  const prevHijriMonth = () => {
    setCurrentMoment(prev => moment(prev).subtract(1, 'iMonth'));
  };

  const resetToToday = () => {
    setCurrentMoment(moment());
    setSelectedDayObj(null);
  };

  // Convert Gregorian to Hijri
  const handleConvertGregToHijri = () => {
    if (!gregInput) return;
    const m = moment(gregInput, 'YYYY-MM-DD');
    if (m.isValid()) {
      setHijriConvertedOutput(m.format('iD iMMMM iYYYY [AH] (dddd)'));
    } else {
      setHijriConvertedOutput('Invalid Date');
    }
  };

  // Calculate Lunar Moon Phase
  const moonPhase = useMemo(() => {
    const todayHijriDay = moment().iDate();
    let phaseName = 'Waxing Crescent';
    let iconEmoji = '🌒';
    let percentage = Math.round((todayHijriDay / 29.5) * 100);

    if (todayHijriDay === 1) {
      phaseName = 'New Moon (Hilal)';
      iconEmoji = '🌑';
    } else if (todayHijriDay < 7) {
      phaseName = 'Waxing Crescent';
      iconEmoji = '🌒';
    } else if (todayHijriDay >= 7 && todayHijriDay <= 9) {
      phaseName = 'First Quarter';
      iconEmoji = '🌓';
    } else if (todayHijriDay > 9 && todayHijriDay < 14) {
      phaseName = 'Waxing Gibbous';
      iconEmoji = '🌔';
    } else if (todayHijriDay >= 14 && todayHijriDay <= 16) {
      phaseName = 'Full Moon (Badr - White Days)';
      iconEmoji = '🌕';
    } else if (todayHijriDay > 16 && todayHijriDay < 22) {
      phaseName = 'Waning Gibbous';
      iconEmoji = '🌖';
    } else if (todayHijriDay >= 22 && todayHijriDay <= 24) {
      phaseName = 'Last Quarter';
      iconEmoji = '🌗';
    } else {
      phaseName = 'Waning Crescent';
      iconEmoji = '🌘';
    }

    return {
      todayHijriDay,
      phaseName,
      iconEmoji,
      percentage: Math.min(100, Math.max(0, percentage))
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-sidebar via-brand-primary/15 to-brand-sidebar border border-brand-primary/20 p-6 md:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-[0.25em]">
              <CalendarIcon size={16} />
              <span>Sacred Islamic Lunar Calendar • التقويم الهجري</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
              {currentHijriMonthName} {currentHijriYear} AH
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-light max-w-2xl">
              Track Islamic holy months, fasting reminders (White Days & Sunnah fasts), upcoming sacred events, and moon phases.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={resetToToday}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <RefreshCw size={14} />
              <span>Jump to Today</span>
            </button>
          </div>
        </div>

        {/* Live Moon Phase Card */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
            <span className="text-3xl">{moonPhase.iconEmoji}</span>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Moon Phase</p>
              <p className="text-sm font-bold text-white">{moonPhase.phaseName}</p>
              <p className="text-[10px] text-brand-primary font-mono font-bold">Day {moonPhase.todayHijriDay} of Lunar Cycle</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-black">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next White Days Fast</p>
              <p className="text-sm font-bold text-white">13th, 14th & 15th {currentHijriMonthName}</p>
              <p className="text-[10px] text-slate-400">Sunnah of the Prophet ﷺ</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Corresponding Date</p>
              <p className="text-sm font-bold text-white font-mono">{moment().format('dddd, D MMMM YYYY')}</p>
              <p className="text-[10px] text-emerald-400 font-bold">{moment().format('iD iMMMM iYYYY')} AH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar View Grid & Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Interactive Hijri Month Calendar Grid */}
        <div className="lg:col-span-8 glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/5 space-y-6">
          
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevHijriMonth}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {currentHijriMonthName} {currentHijriYear}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {calendarDays[0]?.momentObj.format('MMMM YYYY')} – {calendarDays[calendarDays.length - 1]?.momentObj.format('MMMM YYYY')}
              </p>
            </div>

            <button
              onClick={nextHijriMonth}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={d} className={`text-[11px] font-black uppercase tracking-wider py-2 rounded-xl ${
                i === 5 ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
              }`}>
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty padding cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[72px] md:min-h-[84px] rounded-2xl bg-white/[0.01] border border-transparent" />
            ))}

            {/* Actual Days */}
            {calendarDays.map((dayItem) => {
              const isSelected = selectedDayObj?.hijriDay === dayItem.hijriDay;
              return (
                <motion.div
                  key={dayItem.hijriDay}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDayObj(dayItem)}
                  className={`min-h-[76px] md:min-h-[92px] p-2 md:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    dayItem.isToday
                      ? 'bg-gradient-to-br from-amber-500/20 via-brand-primary/20 to-brand-sidebar border-amber-400/80 shadow-lg shadow-amber-500/20'
                      : isSelected
                      ? 'bg-brand-primary/30 border-brand-primary shadow-md'
                      : dayItem.event
                      ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/15'
                  }`}
                >
                  {/* Top Bar inside cell: Hijri number and badges */}
                  <div className="flex items-center justify-between">
                    <span className={`text-base md:text-xl font-black ${
                      dayItem.isToday ? 'text-amber-300' : 'text-white'
                    }`}>
                      {dayItem.hijriDay}
                    </span>

                    <div className="flex items-center gap-1">
                      {dayItem.isWhiteDay && (
                        <span className="w-2 h-2 rounded-full bg-orange-400" title="White Day Fast (Ayyam al-Beed)" />
                      )}
                      {dayItem.isMondayOrThursday && !dayItem.isWhiteDay && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Sunnah Fast Day" />
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Gregorian date & event tag */}
                  <div className="space-y-0.5">
                    {dayItem.event && (
                      <p className="text-[8px] md:text-[9px] font-bold text-amber-300 line-clamp-1 leading-tight">
                        ★ {dayItem.event.title}
                      </p>
                    )}
                    <p className="text-[9px] md:text-[10px] font-mono text-slate-400">
                      {dayItem.gregFormatted}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-300" />
              <span>Today's Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span>White Days (13, 14, 15)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>Mon / Thu Sunnah Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>Islamic Event</span>
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Selected Day Inspector & Upcoming Holy Events */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Selected Day Card */}
          <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} />
              <span>Day Inspection</span>
            </h4>

            {selectedDayObj ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <p className="text-2xl font-black text-white">
                    {selectedDayObj.hijriDay} {HIJRI_MONTH_NAMES[selectedDayObj.hijriMonth - 1]} {selectedDayObj.hijriYear} AH
                  </p>
                  <p className="text-xs font-mono text-slate-300">
                    {selectedDayObj.momentObj.format('dddd, MMMM D, YYYY')}
                  </p>
                </div>

                {selectedDayObj.event && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <p className="text-xs font-black text-amber-300 uppercase tracking-wide">
                      ★ {selectedDayObj.event.title}
                    </p>
                    <p className="arabic-text text-lg text-white text-right">
                      {selectedDayObj.event.arabicTitle}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedDayObj.event.description}
                    </p>
                  </div>
                )}

                {selectedDayObj.isWhiteDay && (
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold">
                    🌕 White Day Fast: Sins wiped as if fasting a whole year!
                  </div>
                )}

                {selectedDayObj.isMondayOrThursday && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold">
                    🕊️ Sunnah Fast Day: Deeds presented to Allah on Mondays and Thursdays.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs space-y-2">
                <CalendarIcon size={24} className="mx-auto text-slate-500 mb-2" />
                <p>Tap any day on the calendar grid to inspect holy events, fasting recommendations, and details.</p>
              </div>
            )}
          </div>

          {/* Quick Date Converter */}
          <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4">
            <h4 className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} />
              <span>Date Converter</span>
            </h4>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Gregorian Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={gregInput}
                  onChange={(e) => setGregInput(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                />
                <button
                  onClick={handleConvertGregToHijri}
                  className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Convert
                </button>
              </div>

              {hijriConvertedOutput && (
                <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-mono font-bold text-emerald-400">{hijriConvertedOutput}</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Major Islamic Events Timeline Across the Year */}
      <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white italic">Major Islamic Holy Events Timeline</h3>
            <p className="text-xs text-slate-400 mt-0.5">Annual sacred occasions across the 12 Hijri months.</p>
          </div>
          <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
            1447–1448 AH
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ISLAMIC_EVENTS.map((ev, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-primary/30 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-mono font-bold text-slate-300">
                    {ev.hijriDay} {ev.monthName}
                  </span>
                  {ev.isMajor && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                      Major
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-black text-white">{ev.title}</h4>
                <p className="arabic-text text-base text-brand-primary">{ev.arabicTitle}</p>
                <p className="text-xs text-slate-300 leading-relaxed font-light">{ev.description}</p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] text-emerald-400 font-medium">💡 {ev.virtue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
