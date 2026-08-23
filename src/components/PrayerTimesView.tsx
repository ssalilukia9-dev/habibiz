import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  Volume2, 
  Play, 
  Pause, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  BellRing,
  Globe,
  Download,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Star,
  Quote,
  Smartphone,
  ShieldCheck,
  Zap,
  Info,
  Moon,
  Flame,
  Bell,
  Check,
  Award
} from 'lucide-react';
import { JUMMAH_HADITHS } from '../data/jummahData.ts';
import { notificationService } from '../services/notificationService.ts';
import { getAudioStreamUrl } from '../lib/api.ts';
import { GLOBAL_ADHAN_LIST } from '../constants.ts';
import WaveformVisualizer from './WaveformVisualizer.tsx';
import { calculateTahajjudTimings, getUpcomingWhiteDays, TahajjudTiming, WhiteDayInfo } from '../services/islamicScheduleService.ts';
import { TahajjudAlarmService, TahajjudAlarmSettings } from '../services/tahajjudAlarmService.ts';

interface PrayerTime {
  name: string;
  time: string;
  id: string;
}

interface AdhanSound {
  id: string;
  title: string;
  location: string;
  audioUrl: string;
  image: string;
}

const ADHAN_SOUNDS: AdhanSound[] = GLOBAL_ADHAN_LIST;

export default function PrayerTimesView() {
  const [loading, setLoading] = useState(true);
  const [prayerData, setPrayerData] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [prevPrayer, setPrevPrayer] = useState<PrayerTime | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [detailedCountdown, setDetailedCountdown] = useState<{ hours: number; mins: number; secs: number }>({ hours: 0, mins: 0, secs: 0 });
  const [location, setLocation] = useState('London, UK'); // Default
  const [playingAdhan, setPlayingAdhan] = useState<string | null>(null);
  const [selectedAdhanId, setSelectedAdhanId] = useState<string>(() => {
    return localStorage.getItem('preferred-adhan-id') || 'makkah';
  });
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>(() => {
    return (localStorage.getItem('prayer-location-mode') as 'auto' | 'manual') || 'auto';
  });
  const [inputCity, setInputCity] = useState(() => {
    return localStorage.getItem('prayer-city') || 'London';
  });
  const [inputCountry, setInputCountry] = useState(() => {
    return localStorage.getItem('prayer-country') || 'UK';
  });
  const [testingAdhan, setTestingAdhan] = useState(false);
  const [testCountdown, setTestCountdown] = useState<number | null>(null);
  const [showClosedAppGuide, setShowClosedAppGuide] = useState(false);
  const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  useEffect(() => {
    if (errorStatus) {
      const timer = setTimeout(() => setErrorStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorStatus]);
  const [customUrl, setCustomUrl] = useState(() => {
    return localStorage.getItem('preferred-adhan-custom-url') || '';
  });
  const [isCustomValid, setIsCustomValid] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tahajjud & Night Vigil State
  const [tahajjudSettings, setTahajjudSettings] = useState<TahajjudAlarmSettings>(() => TahajjudAlarmService.getSettings());
  const [tahajjudAlarmEnabled, setTahajjudAlarmEnabled] = useState<boolean>(() => TahajjudAlarmService.getSettings().enabled);
  const [tahajjudOffset, setTahajjudOffset] = useState<string>(() => TahajjudAlarmService.getSettings().offset);
  const [tahajjudSound, setTahajjudSound] = useState<string>(() => TahajjudAlarmService.getSettings().sound);
  const [testingTahajjud, setTestingTahajjud] = useState(false);
  const [isPlayingChimePreview, setIsPlayingChimePreview] = useState(false);

  // White Days (Ayyam al-Beed) State
  const [whiteDaysAlarmEnabled, setWhiteDaysAlarmEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('whitedays-reminder-settings');
    return saved ? JSON.parse(saved).enabled !== false : true;
  });
  const [testingWhiteDays, setTestingWhiteDays] = useState(false);
  const [whiteDaysData, setWhiteDaysData] = useState(() => getUpcomingWhiteDays());

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const fetchPrayerTimes = async (forceMode?: 'auto' | 'manual', forceCity?: string, forceCountry?: string) => {
    try {
      setLoading(true);
      const activeMode = forceMode || locationMode;
      const city = forceCity !== undefined ? forceCity : inputCity;
      const country = forceCountry !== undefined ? forceCountry : inputCountry;
      
      let lat = 51.5074;
      let lng = -0.1278;
      let dispName = 'London, UK';

      if (activeMode === 'auto') {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          dispName = `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
          localStorage.setItem('prayer-lat', lat.toString());
          localStorage.setItem('prayer-lng', lng.toString());
          localStorage.setItem('prayer-display-name', dispName);
        } catch (e) {
          console.warn("Geolocation failed, trying previously saved coordinates", e);
          const savedLat = localStorage.getItem('prayer-lat');
          const savedLng = localStorage.getItem('prayer-lng');
          const savedDisp = localStorage.getItem('prayer-display-name');
          if (savedLat && savedLng) {
            lat = parseFloat(savedLat);
            lng = parseFloat(savedLng);
            dispName = savedDisp || `GPS (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
          } else {
            dispName = 'London, UK';
          }
        }
      } else {
        dispName = `${city}, ${country}`;
      }

      setLocation(dispName);
      localStorage.setItem('prayer-location-mode', activeMode);
      localStorage.setItem('prayer-city', city);
      localStorage.setItem('prayer-country', country);

      const endpoint = activeMode === 'auto'
        ? `/api/proxy/aladhan/timings?latitude=${lat}&longitude=${lng}&method=2`
        : `/api/proxy/aladhan/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`;

      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (!data.data || !data.data.timings) {
        throw new Error("Invalid response from prayer times service. Please check City and Country values.");
      }

      const timings = data.data.timings;
      const isFriday = new Date().getDay() === 5;
      
      const formatted: PrayerTime[] = [
        { id: 'fajr', name: 'Fajr', time: timings.Fajr },
        { id: 'sunrise', name: 'Sunrise', time: timings.Sunrise },
      ];

      if (isFriday) {
        formatted.push({ id: 'jummah', name: 'Jummah', time: timings.Dhuhr });
      } else {
        formatted.push({ id: 'dhuhr', name: 'Dhuhr', time: timings.Dhuhr });
      }

      formatted.push(
        { id: 'asr', name: 'Asr', time: timings.Asr },
        { id: 'maghrib', name: 'Maghrib', time: timings.Maghrib },
        { id: 'isha', name: 'Isha', time: timings.Isha }
      );
      
      setPrayerData(formatted);
      calculateNextPrayer(formatted);
      setLoading(false);

      // Trigger global synchronization across open components
      window.dispatchEvent(new CustomEvent('prayer_times_updated'));
    } catch (e: any) {
      console.error(e);
      setErrorStatus(e.message || "Failed to fetch prayer times. Check inputs or connection.");
      setLoading(false);
    }
  };

  const calculateNextPrayer = (prayers: PrayerTime[]) => {
    if (!prayers || prayers.length === 0) return;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    
    let nextIdx = prayers.findIndex(p => {
      const [h, m] = p.time.split(':').map(Number);
      return (h * 60 + m) > currentMinutes;
    });

    if (nextIdx === -1) {
      nextIdx = 0; // Wraps to tomorrow Fajr
    }

    const prevIdx = (nextIdx - 1 + prayers.length) % prayers.length;
    const foundNext = prayers[nextIdx];
    const foundPrev = prayers[prevIdx];

    setNextPrayer(foundNext);
    setPrevPrayer(foundPrev);
    
    updateLiveProgress(foundNext, foundPrev);
  };

  const updateLiveProgress = (next: PrayerTime, prev: PrayerTime | null) => {
    const now = new Date();
    const [nh, nm] = next.time.split(':').map(Number);
    const targetNext = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nh, nm, 0, 0);
    
    if (targetNext.getTime() <= now.getTime()) {
      targetNext.setDate(targetNext.getDate() + 1);
    }
    
    const diff = targetNext.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    setDetailedCountdown({ hours, mins, secs });
    setTimeLeft(`${hours}h ${mins}m ${secs}s`);

    // Calculate percentage between previous prayer and next prayer
    if (prev) {
      const [ph, pm] = prev.time.split(':').map(Number);
      const targetPrev = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ph, pm, 0, 0);
      if (targetPrev.getTime() > targetNext.getTime()) {
        targetPrev.setDate(targetPrev.getDate() - 1);
      }
      if (targetPrev.getTime() > now.getTime()) {
        targetPrev.setDate(targetPrev.getDate() - 1);
      }
      
      const totalInterval = targetNext.getTime() - targetPrev.getTime();
      const elapsed = now.getTime() - targetPrev.getTime();
      const pct = Math.max(0, Math.min(100, (elapsed / (totalInterval || 1)) * 100));
      setProgressPercent(pct);
    } else {
      setProgressPercent(Math.min(100, Math.max(0, 100 - (diff / (6 * 3600 * 1000)) * 100)));
    }
  };

  // Live real-time tick every second
  useEffect(() => {
    if (!prayerData.length) return;
    const ticker = setInterval(() => {
      calculateNextPrayer(prayerData);
    }, 1000);
    return () => clearInterval(ticker);
  }, [prayerData]);

  const testAdhanNotification = async () => {
    if (testingAdhan) return;
    try {
      setTestingAdhan(true);
      
      await notificationService.requestPermission().catch(() => {});
      
      const preferredId = selectedAdhanId || 'makkah';
      let audioUrl = ADHAN_SOUNDS[0]?.audioUrl || '';
      
      if (preferredId === 'custom' && customUrl) {
        audioUrl = customUrl;
      } else {
        const found = ADHAN_SOUNDS.find(a => a.id === preferredId);
        if (found) audioUrl = found.audioUrl;
      }

      const streamAudioUrl = getAudioStreamUrl(audioUrl);

      notificationService.notify(
        "Adhan Voice Test Signal",
        `Your preferred Adhan voice is playing. Come to success!`,
        'prayer',
        '/resources'
      );

      // Trigger rich Adhan modal screen
      window.dispatchEvent(new CustomEvent('trigger_test_adhan', {
        detail: {
          prayerName: nextPrayer?.name || 'Dhuhr',
          prayerTime: nextPrayer?.time || '12:45',
          adhanId: preferredId
        }
      }));

      setTestingAdhan(false);
      
    } catch (err: any) {
      console.warn("Adhan test notification error:", err);
      setTestingAdhan(false);
    }
  };

  const startClosedAppTest = async () => {
    const granted = await notificationService.requestPermission();
    if (!granted) {
      setErrorStatus("Please enable notifications in your browser/device permissions.");
      return;
    }
    setNotificationPerm('granted');
    
    // 5-second countdown to allow user to lock or minimize
    setTestCountdown(5);
    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setTestCountdown(null);
        notificationService.triggerTestClosedAppAthan(1, nextPrayer?.name || 'Asr');
      } else {
        setTestCountdown(count);
      }
    }, 1000);
  };

  const handleToggleTahajjudAlarm = async () => {
    const nextState = !tahajjudAlarmEnabled;
    setTahajjudAlarmEnabled(nextState);
    TahajjudAlarmService.saveSettings({ enabled: nextState, offset: tahajjudOffset as any, sound: tahajjudSound as any });
    
    if (nextState) {
      await notificationService.requestPermission();
      const maghrib = prayerData.find(p => p.id === 'Maghrib')?.time || '18:40';
      const fajr = prayerData.find(p => p.id === 'Fajr')?.time || '05:15';
      notificationService.scheduleTahajjudNotifications({ Maghrib: maghrib, Fajr: fajr });
    }
  };

  const handleChangeTahajjudOffset = (offset: string) => {
    setTahajjudOffset(offset);
    TahajjudAlarmService.saveSettings({ enabled: tahajjudAlarmEnabled, offset: offset as any });
    const maghrib = prayerData.find(p => p.id === 'Maghrib')?.time || '18:40';
    const fajr = prayerData.find(p => p.id === 'Fajr')?.time || '05:15';
    notificationService.scheduleTahajjudNotifications({ Maghrib: maghrib, Fajr: fajr });
  };

  const handleChangeTahajjudSound = (sound: string) => {
    setTahajjudSound(sound);
    TahajjudAlarmService.saveSettings({ sound: sound as any });
  };

  const handlePreviewTahajjudSound = (sound: string) => {
    setIsPlayingChimePreview(true);
    TahajjudAlarmService.playAlarmChime(sound, 0.9);
    setTimeout(() => setIsPlayingChimePreview(false), 2500);
  };

  const handleTestTahajjud = async () => {
    setTestingTahajjud(true);
    await notificationService.triggerTestTahajjudAlarm(1);
    
    // Also trigger audio alarm and full wake modal via TahajjudAlarmService
    const maghrib = prayerData.find(p => p.id === 'Maghrib')?.time || '18:40';
    const fajr = prayerData.find(p => p.id === 'Fajr')?.time || '05:15';
    const target = TahajjudAlarmService.getNextAlarmTarget(maghrib, fajr);

    setTimeout(() => {
      TahajjudAlarmService.triggerAlarm({
        timeStr: target.displayTime,
        label: target.label,
        message: "Test Nocturnal Alarm: The Lord descends to the lowest heaven in the last third of the night."
      });
      setTestingTahajjud(false);
    }, 1200);
  };

  const handleToggleWhiteDaysAlarm = async () => {
    const nextState = !whiteDaysAlarmEnabled;
    setWhiteDaysAlarmEnabled(nextState);
    const newSettings = { enabled: nextState, eveningBefore: true, suhoorMorning: true };
    localStorage.setItem('whitedays-reminder-settings', JSON.stringify(newSettings));

    if (nextState) {
      await notificationService.requestPermission();
      notificationService.scheduleWhiteDaysNotifications();
    }
  };

  const handleTestWhiteDays = async () => {
    setTestingWhiteDays(true);
    await notificationService.triggerTestWhiteDaysAlarm(2);
    setTimeout(() => setTestingWhiteDays(false), 3000);
  };

  useEffect(() => {
    const isValid = (url: string) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };
    setIsCustomValid(isValid(customUrl));
  }, [customUrl]);

  useEffect(() => {
    localStorage.setItem('preferred-adhan-id', selectedAdhanId);
    if (selectedAdhanId === 'custom') {
      localStorage.setItem('preferred-adhan-custom-url', customUrl);
    }
  }, [selectedAdhanId, customUrl]);

  const toggleAdhan = (id: string, url: string) => {
    if (playingAdhan === id) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (e) {}
      }
      setPlayingAdhan(null);
    } else {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (e) {}
      }
      
      const streamUrl = getAudioStreamUrl(url);
      const audio = new Audio(streamUrl);
      audio.preload = 'auto';
      audioRef.current = audio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (e.name === 'AbortError' || e.message?.includes('interrupted')) return;
          console.warn("Playback interrupted or blocked:", e);
          setErrorStatus("Playback waiting for user interaction. Tap anywhere to play.");
          setPlayingAdhan(null);
        });
      }
      setPlayingAdhan(id);
      audio.onended = () => setPlayingAdhan(null);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedAdhanId(id);
  };

  const handleDownload = async (adhan: AdhanSound | { id: string, title: string, audioUrl: string }) => {
    try {
      const streamUrl = getAudioStreamUrl(adhan.audioUrl);
      const response = await fetch(streamUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${adhan.title.replace(/\s+/g, '_')}_Adhan.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.warn("Direct download fallback to stream URL:", e);
      const streamUrl = getAudioStreamUrl(adhan.audioUrl);
      window.open(streamUrl, '_blank');
    }
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Error Feedback */}
      <AnimatePresence>
        {errorStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            {errorStatus}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Jummah Special Section */}
      {new Date().getDay() === 5 && (
        <section className="animate-in fade-in zoom-in duration-700">
           <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-brand-primary/20 via-brand-depth to-brand-depth border border-brand-primary/20 p-10 md:p-16">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[100px] -ml-32 -mb-32" />
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                 <div className="space-y-8">
                    <div className="flex items-center gap-4">
                       <span className="px-4 py-1.5 bg-brand-primary text-brand-depth rounded-full text-[10px] font-black uppercase tracking-widest">Friday Focus</span>
                       <div className="h-px flex-1 bg-white/10" />
                    </div>
                    
                    <div className="space-y-4">
                       <h3 className="text-5xl font-black text-white tracking-tight leading-none">The Sacred<br/><span className="text-brand-primary">Friday (Jummah)</span></h3>
                       <p className="text-slate-400 font-medium text-lg max-w-md">Today is the master of all days. A day of congregation, purification, and divine mercy.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-2">
                          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Main Prayer</p>
                          <p className="text-2xl font-black text-white">Jummah Salat</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Replaces Dhuhr</p>
                       </div>
                       <div className="p-6 bg-brand-primary/10 border border-brand-primary/20 rounded-3xl space-y-2">
                          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Timing</p>
                          <p className="text-2xl font-black text-white">
                            {prayerData.find(p => p.id === 'jummah')?.time || prayerData.find(p => p.id === 'dhuhr')?.time}
                          </p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sermon & Prayer</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-3 text-white">
                       <Star size={24} className="text-brand-primary" fill="currentColor" />
                       <h4 className="text-lg font-black uppercase tracking-widest">Friday Virtues</h4>
                    </div>
                    
                    <div className="space-y-4">
                       {JUMMAH_HADITHS.slice(0, 3).map((hadith: any, i: number) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: 20 }}
                           whileInView={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="group p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3 hover:bg-white/10 transition-all border-l-4 border-l-brand-primary relative overflow-hidden"
                         >
                            <div className="absolute -right-2 -bottom-2 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
                               <Quote size={40} className="text-brand-primary" />
                            </div>
                            <p className="text-sm font-medium text-slate-300 italic leading-relaxed relative z-10">"{hadith.text}"</p>
                            <div className="flex items-center justify-between relative z-10">
                               <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">— {hadith.source}</span>
                               <div className="px-2 py-0.5 bg-brand-primary/10 rounded-md text-[8px] font-black text-brand-primary uppercase tracking-widest">
                                 {hadith.benefit}
                               </div>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* Hero Stats with Dynamic Circular Progress Ring */}
      <section className="relative min-h-[480px] md:min-h-[520px] rounded-[3.5rem] overflow-hidden group shadow-2xl border border-white/10 bg-brand-depth/60 flex items-center justify-center p-6 md:p-12">
        <img 
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105 opacity-30 pointer-events-none"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-depth via-brand-depth/70 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl w-full">
          {/* Dynamic Progress Ring Widget */}
          <div className="relative flex items-center justify-center">
            {/* Ambient Background Aura */}
            <div className="absolute w-72 h-72 md:w-80 md:h-80 bg-gradient-to-tr from-emerald-500/20 via-amber-500/20 to-brand-primary/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <svg className="w-72 h-72 md:w-84 md:h-84 -rotate-90 transform" viewBox="0 0 300 300">
              <defs>
                <linearGradient id="prayerDynamicRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx="150"
                cy="150"
                r="125"
                className="stroke-white/10"
                strokeWidth="10"
                fill="none"
              />

              {/* Inner Decorative Ticks Circle */}
              <circle
                cx="150"
                cy="150"
                r="110"
                className="stroke-white/5"
                strokeWidth="1"
                strokeDasharray="4 8"
                fill="none"
              />

              {/* Dynamic Animated Progress Circle */}
              <motion.circle
                cx="150"
                cy="150"
                r="125"
                stroke="url(#prayerDynamicRingGrad)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                filter="url(#ringGlow)"
                strokeDasharray={785.4}
                strokeDashoffset={785.4 - (785.4 * Math.min(100, Math.max(2, progressPercent))) / 100}
                className="transition-all duration-1000 ease-out"
              />

              {/* Rotating Indicator Dot on the Ring Tip */}
              {(() => {
                const angle = (Math.min(100, Math.max(0, progressPercent)) / 100) * 360;
                const rad = (angle * Math.PI) / 180;
                const dotX = 150 + 125 * Math.cos(rad);
                const dotY = 150 + 125 * Math.sin(rad);
                return (
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="7"
                    className="fill-amber-300 shadow-lg filter drop-shadow-[0_0_8px_#fbbf24]"
                  />
                );
              })()}
            </svg>

            {/* Content Inside Dynamic Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/15 mb-1.5">
                <Clock size={12} className="text-amber-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-300">
                  Next Prayer
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase drop-shadow-lg">
                {nextPrayer?.name || 'Loading...'}
              </h2>

              <div className="mt-1 font-mono font-black text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-emerald-300 tracking-tight tabular-nums">
                {String(detailedCountdown.hours).padStart(2, '0')}:{String(detailedCountdown.mins).padStart(2, '0')}:{String(detailedCountdown.secs).padStart(2, '0')}
              </div>

              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                at {nextPrayer?.time}
              </p>

              {/* Progress percentage capsule */}
              <div className="mt-2.5 px-3 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  {Math.round(100 - progressPercent)}% remaining
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
            <MapPin size={13} className="text-emerald-400" /> {location}
          </div>
        </div>
      </section>

      {/* Prayer Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
             <Calendar size={24} className="text-brand-primary" /> Daily Schedule
          </h3>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">Today's Timings</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 px-2">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
            ))
          ) : (
            prayerData.map((prayer) => (
              <motion.div
                key={prayer.id}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-[2.5rem] border text-center transition-all relative overflow-hidden ${
                  nextPrayer?.id === prayer.id 
                  ? 'bg-gradient-to-b from-amber-500/15 via-emerald-500/10 to-brand-primary/10 border-amber-500/40 shadow-2xl shadow-amber-500/15' 
                  : 'bg-white/5 border-white/5'
                }`}
              >
                {nextPrayer?.id === prayer.id && (
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                )}

                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${nextPrayer?.id === prayer.id ? 'text-amber-300' : 'text-slate-500'}`}>
                    {prayer.name}
                  </p>
                </div>

                <p className="text-2xl font-black text-white font-mono">{prayer.time}</p>
                
                {nextPrayer?.id === prayer.id ? (
                  <div className="mt-3 flex flex-col items-center gap-1.5">
                    {/* Mini SVG Progress Ring */}
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" className="stroke-white/10" strokeWidth="3" fill="none" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          className="stroke-amber-400"
                          strokeWidth="3.5"
                          strokeDasharray="88"
                          strokeDashoffset={88 - (88 * Math.min(100, Math.max(5, progressPercent))) / 100}
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-black text-amber-300">
                        {Math.round(100 - progressPercent)}%
                      </span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-300/90">
                      Active Next
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 h-4" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Closed-App Athan Calls & Engagement Guardian Card */}
      <section className="relative overflow-hidden rounded-[2.5rem] p-6 sm:p-8 bg-gradient-to-br from-brand-primary/15 via-black/40 to-brand-depth border border-brand-primary/25 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                <ShieldCheck size={20} />
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Closed-App Athan Calls
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Background Active
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
              Receive the sacred Call to Prayer with real audio alerts on your lockscreen even when Sanctuary is closed or your device is asleep.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowClosedAppGuide(!showClosedAppGuide)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Info size={14} className="text-brand-primary" />
              <span>{showClosedAppGuide ? 'Hide Guide' : 'Setup Guide'}</span>
            </button>

            <button
              onClick={startClosedAppTest}
              disabled={testCountdown !== null}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg ${
                testCountdown !== null
                  ? 'bg-amber-500 text-black animate-pulse'
                  : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/25 active:scale-95'
              }`}
            >
              <Smartphone size={15} />
              <span>
                {testCountdown !== null 
                  ? `Lock Screen Now! (${testCountdown}s)` 
                  : 'Test Closed-App Call'}
              </span>
            </button>
          </div>
        </div>

        {/* Engagement Booster Value Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Instant Lockscreen Actions</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tap directly into the Adhan player, Qibla compass, or fast prayer log without searching through apps.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap size={16} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">+50 Hasanat on Every Swalah</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Recite the authentic Sunnah Du'a after Adhan with voice assistance to claim Hasanat & boost your spiritual streak.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Volume2 size={16} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Offline Service Worker Audio</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scheduled in your browser's persistent Service Worker daemon to sound even when internet drops.
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Setup & Permission Guide */}
        <AnimatePresence>
          {showClosedAppGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs text-slate-300"
            >
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <Smartphone size={14} /> How to Ensure 100% Reliable Closed-App Calls
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="font-bold text-white">📱 For iPhone & iPad (iOS)</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Tap the <strong>Share button</strong> (square with arrow) in Safari.<br />
                    2. Choose <strong>"Add to Home Screen"</strong>.<br />
                    3. Open Sanctuary from your Home Screen to unlock native lockscreen Athan alerts and banner notifications.
                  </p>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="font-bold text-white">🤖 For Android & Chrome</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    1. Allow <strong>Notification & Sound</strong> permissions when prompted.<br />
                    2. In Android Settings &gt; Apps &gt; Sanctuary, set Battery to <strong>"Unrestricted"</strong> to prevent background sleep.<br />
                    3. Install the app to your Home Screen for instant 1-tap lockscreen wake.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Tahajjud (Night Vigil) & White Days (Ayyam al-Beed) Alarms Hub */}
      {(() => {
        const maghribTime = prayerData.find(p => p.id === 'Maghrib')?.time || '18:30';
        const fajrTime = prayerData.find(p => p.id === 'Fajr')?.time || '05:15';
        const tahajjudInfo = calculateTahajjudTimings(maghribTime, fajrTime);

        return (
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Moon className="text-purple-400" size={28} /> Sacred Alarms & Voluntary Devotions
                </h3>
                <p className="text-slate-400 text-sm font-medium">Automatic lockscreen wake alerts for Tahajjud & Sunnah White Days fasts</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs font-bold">
                <Sparkles size={13} /> Divine Blessings
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Card 1: Tahajjud (Night Vigil & Last Third of Night) */}
              <motion.div
                id="tour-tahajjud-hub"
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
                      <Moon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-white tracking-tight">Tahajjud Vigil</h4>
                        {tahajjudInfo.isLastThirdNow && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                            Active Right Now!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-200/70 font-medium">Last 1/3 of the Night & Qiyam</p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleTahajjudAlarm}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                      tahajjudAlarmEnabled
                        ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Bell size={14} className={tahajjudAlarmEnabled ? 'animate-bounce' : ''} />
                    {tahajjudAlarmEnabled ? 'Alarm ON' : 'Alarm OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahajjud Begins</span>
                    <p className="text-2xl font-black text-purple-300 font-mono">{tahajjudInfo.startTimeStr}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Optimal prayer window</p>
                  </div>
                  <div className="space-y-1 border-l border-white/10 pl-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Islamic Midnight</span>
                    <p className="text-2xl font-black text-slate-200 font-mono">{tahajjudInfo.midnightTimeStr}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Halfway point of night</p>
                  </div>
                </div>

                {/* Alarm Timing Trigger Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alarm Wake-up Window</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'last_third', label: 'Last 1/3 Start' },
                      { id: '60_min_before_fajr', label: '60m before Fajr' },
                      { id: '45_min_before_fajr', label: '45m before Fajr' },
                      { id: '30_min_before_fajr', label: '30m before Fajr' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleChangeTahajjudOffset(opt.id)}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold text-center transition-all border ${
                          tahajjudOffset === opt.id
                            ? 'bg-purple-500/20 text-purple-200 border-purple-400/50 shadow-sm'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alarm Tone Sound Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Wake Sound Tone</label>
                    <button
                      onClick={() => handlePreviewTahajjudSound(tahajjudSound)}
                      className="text-[10px] text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Volume2 size={12} className={isPlayingChimePreview ? 'animate-bounce' : ''} />
                      <span>{isPlayingChimePreview ? 'Playing Tone...' : 'Preview Tone'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'noor_chime', label: 'Noor Chime 🔔' },
                      { id: 'madinah_melody', label: 'Madinah 🌙' },
                      { id: 'gentle_breeze', label: 'Serene Breeze 🍃' }
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => {
                          handleChangeTahajjudSound(tone.id);
                          handlePreviewTahajjudSound(tone.id);
                        }}
                        className={`py-2 px-2 rounded-xl text-[10px] font-bold text-center transition-all border ${
                          tahajjudSound === tone.id
                            ? 'bg-purple-500/30 text-white border-purple-400'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/15 flex items-start gap-3">
                  <Quote size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-purple-200/80 italic leading-relaxed">
                    "Our Lord descends every night to the lowest heaven when the last third of the night remains, saying: 'Who is calling upon Me that I may answer him?'" (Sahih Bukhari)
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleTestTahajjud}
                    disabled={testingTahajjud}
                    className="px-4 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    {testingTahajjud ? <Loader2 size={13} className="animate-spin" /> : <Smartphone size={13} />}
                    {testingTahajjud ? 'Triggering Alarm...' : 'Test Tahajjud Wake Alarm'}
                  </button>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles size={11} /> Ready & Armed
                  </span>
                </div>
              </motion.div>

              {/* Card 2: White Days (Ayyam al-Beed) Sunnah Fasting Hub */}
              <motion.div
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-[2.5rem] border border-amber-500/25 bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
                      <Flame size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white tracking-tight">White Days Fasting</h4>
                      <p className="text-xs text-amber-200/70 font-medium">Ayyam al-Beed (13th, 14th, 15th {whiteDaysData.currentHijriMonthName})</p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleWhiteDaysAlarm}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                      whiteDaysAlarmEnabled
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-lg shadow-amber-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Bell size={14} className={whiteDaysAlarmEnabled ? 'animate-bounce' : ''} />
                    {whiteDaysAlarmEnabled ? 'Alarms ON' : 'Alarms OFF'}
                  </button>
                </div>

                {/* 3 White Days Strip */}
                <div className="grid grid-cols-3 gap-2.5">
                  {whiteDaysData.currentMonthDays.map((day) => (
                    <div
                      key={day.hijriDay}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        day.isToday
                          ? 'bg-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                          : day.isTomorrow
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-black/40 border-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                          {day.hijriDay}th Hijri
                        </span>
                      </div>
                      <p className="text-xs font-bold text-white leading-snug">{day.dateStr.split(',')[0]}</p>
                      <p className="text-[10px] text-slate-400">{day.dateStr.split(',')[1]}</p>
                      <div className="mt-1.5">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block ${
                          day.isToday 
                            ? 'bg-amber-400 text-black uppercase' 
                            : day.isTomorrow 
                            ? 'bg-amber-500/20 text-amber-300' 
                            : day.daysRemaining > 0 
                            ? 'text-slate-400' 
                            : 'text-slate-600'
                        }`}>
                          {day.isToday ? 'Today!' : day.isTomorrow ? 'Tomorrow' : day.daysRemaining > 0 ? `In ${day.daysRemaining}d` : 'Passed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-3">
                  <Award size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200/80 italic leading-relaxed">
                    "Fasting three days of each month (13th, 14th, and 15th) is equivalent to fasting the entire lifetime." (Sunan an-Nasa'i)
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleTestWhiteDays}
                    disabled={testingWhiteDays}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {testingWhiteDays ? <Loader2 size={13} className="animate-spin" /> : <Smartphone size={13} />}
                    {testingWhiteDays ? 'Testing Alarm...' : 'Test White Days Lockscreen Alert'}
                  </button>
                  <span className="text-[10px] text-slate-500 font-bold">Suhoor & Evening Reminders</span>
                </div>
              </motion.div>

            </div>
          </section>
        );
      })()}

      {/* Adhan Gallery */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight">The Infinite Echo</h3>
            <p className="text-slate-500 font-medium">Sacred calls to prayer from the world's epicenters</p>
          </div>
          <Globe size={32} className="text-brand-primary/40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Custom Divine Channel Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative h-72 rounded-[3.5rem] overflow-hidden shadow-2xl border border-brand-primary/20 bg-brand-primary/5 p-8 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent opacity-50" />
            
               <div className="relative z-10 flex justify-between items-start">
               <div className="w-10 h-10 bg-brand-primary/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-brand-primary/20">
                  <Volume2 size={18} className="text-brand-primary" />
               </div>
               <div className="flex gap-2">
                 <button 
                  disabled={!isCustomValid}
                  onClick={() => handleSelect('custom')}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                    selectedAdhanId === 'custom' 
                      ? 'bg-brand-primary text-brand-depth border-brand-primary' 
                      : 'bg-white/5 text-slate-500 hover:text-white border-white/10'
                  } ${!isCustomValid && 'opacity-30 cursor-not-allowed'}`}
                  title="Select as Primary Adhan"
                 >
                   <CheckCircle2 size={18} />
                 </button>
                 <button 
                  disabled={!isCustomValid}
                  onClick={() => handleDownload({ id: 'custom', title: 'Custom', audioUrl: customUrl })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white/5 text-slate-500 hover:text-white border border-white/10 ${!isCustomValid && 'opacity-30 cursor-not-allowed'}`}
                 >
                   <Download size={18} />
                 </button>
                 <button 
                  disabled={!isCustomValid}
                  onClick={() => toggleAdhan('custom', customUrl)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
                    isCustomValid 
                      ? 'bg-brand-primary text-brand-depth shadow-brand-primary/40 hover:rotate-6' 
                      : 'bg-white/5 text-slate-700 border border-white/5 cursor-not-allowed'
                  }`}
                 >
                   {playingAdhan === 'custom' ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                 </button>
               </div>
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Personal Channel</p>
                <h4 className="text-2xl font-black text-white tracking-tight">Custom Adhan</h4>
              </div>
              <div className="relative group/input">
                <input 
                  type="url"
                  placeholder="Paste Adhan URL (mp3/wav)..."
                  value={customUrl || ''}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all"
                />
                {!isCustomValid && customUrl && (
                  <p className="absolute left-1 -bottom-4 text-[8px] text-red-500 font-bold uppercase tracking-widest">Invalid audio link</p>
                )}
              </div>
            </div>
          </motion.div>

          {ADHAN_SOUNDS.map((adhan) => (
            <motion.div
              key={adhan.id}
              whileHover={{ scale: 1.02 }}
              className="group relative h-72 rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/5"
            >
              <img src={adhan.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-depth via-brand-depth/40 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
                      <Volume2 size={18} className="text-white" />
                   </div>
                   <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => handleSelect(adhan.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
                        selectedAdhanId === adhan.id 
                          ? 'bg-brand-primary text-brand-depth border-brand-primary' 
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                      }`}
                      title="Select as Primary Adhan"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDownload(adhan)}
                      className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"
                      title="Download Adhan"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => toggleAdhan(adhan.id, adhan.audioUrl)}
                      className="w-14 h-14 bg-brand-primary text-brand-depth rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-primary/40 transform scale-90 group-hover:scale-100 transition-all hover:rotate-6 active:scale-95"
                    >
                      {playingAdhan === adhan.id ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                    </button>
                   </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">{adhan.location}</p>
                  <h4 className="text-2xl font-black text-white tracking-tight">{adhan.title}</h4>
                  {playingAdhan === adhan.id && (
                    <div className="pt-2">
                      <WaveformVisualizer 
                        audioElement={audioRef.current} 
                        isPlaying={playingAdhan === adhan.id && !audioRef.current?.paused} 
                        theme="adhan" 
                        height={24} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Precision Location Sync & Test Center */}
      <section className="glass-panel-purple border-brand-primary/20 p-8 md:p-12 rounded-[3.5rem] space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Location Configuration Panel */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">Precision Location Sync</h4>
                <p className="text-xs text-slate-400">Align your sanctuary timings with your local horizon</p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button
                onClick={() => {
                  setLocationMode('auto');
                  fetchPrayerTimes('auto');
                }}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  locationMode === 'auto'
                    ? 'bg-brand-primary text-brand-depth font-black shadow-lg shadow-brand-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🛰️ Automatic GPS
              </button>
              <button
                onClick={() => {
                  setLocationMode('manual');
                  localStorage.setItem('prayer-location-mode', 'manual');
                }}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  locationMode === 'manual'
                    ? 'bg-brand-primary text-brand-depth font-black shadow-lg shadow-brand-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🏙️ Custom City
              </button>
            </div>

            {/* Conditional Fields */}
            <AnimatePresence mode="wait">
              {locationMode === 'manual' ? (
                <motion.div
                  key="manual-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">City Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Chicago"
                        value={inputCity || ''}
                        onChange={(e) => setInputCity(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Country Name</label>
                      <input
                        type="text"
                        placeholder="e.g. USA"
                        value={inputCountry || ''}
                        onChange={(e) => setInputCountry(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all font-semibold"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => fetchPrayerTimes('manual', inputCity, inputCountry)}
                    className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Sync Manual City Timings
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="auto-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-6 bg-brand-primary/5 border border-brand-primary/10 rounded-3xl text-center space-y-4"
                >
                  <p className="text-xs text-slate-400 font-medium">
                    Sanctuary is currently fetching timings using GPS sensors to discover local horizons.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-brand-primary font-black text-xs uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 bg-brand-primary rounded-full animate-ping" />
                    Active Location: {location}
                  </div>
                  <button
                    onClick={() => fetchPrayerTimes('auto')}
                    className="mx-auto px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
                  >
                    Recalibrate GPS
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Adhan Voice Alert Testing Center */}
          <div className="space-y-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-10 lg:pt-0 lg:pl-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <BellRing size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">Adhan Voice Testing Center</h4>
                  <p className="text-xs text-slate-400">Ensure background voice alerts work perfectly</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Modern browsers strictly prevent sound from playing automatically until you interact with the page. Tap below to verify that your selected Adhan voice plays properly and that browser permissions are fully enabled.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={testAdhanNotification}
                disabled={testingAdhan}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                  testingAdhan 
                    ? 'bg-brand-primary/20 text-brand-primary cursor-not-allowed border border-brand-primary/20' 
                    : 'bg-brand-primary text-brand-depth shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {testingAdhan ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Playing Test Adhan...
                  </>
                ) : (
                  <>
                    <Volume2 size={16} />
                    Test Voice Alerts & Notifications
                  </>
                )}
              </button>
              
              {testingAdhan && (
                <div className="py-2 px-4 bg-white/5 rounded-2xl border border-white/10">
                  <WaveformVisualizer 
                    audioElement={audioRef.current} 
                    isPlaying={testingAdhan && !audioRef.current?.paused} 
                    theme="adhan" 
                    height={30} 
                  />
                </div>
              )}
              
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 pl-1">
                <span>Reminders Status:</span>
                <span className="text-brand-primary font-black">Active & Ready</span>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
