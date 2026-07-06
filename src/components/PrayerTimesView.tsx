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
  Quote
} from 'lucide-react';
import { JUMMAH_HADITHS } from '../data/jummahData.ts';
import { notificationService } from '../services/notificationService.ts';
import WaveformVisualizer from './WaveformVisualizer.tsx';

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

const ADHAN_SOUNDS: AdhanSound[] = [
  {
    id: 'makkah',
    title: 'Haram Al-Sharif',
    location: 'Makkah, Saudi Arabia',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'madinah',
    title: 'Masjid Nabawi',
    location: 'Madinah, Saudi Arabia',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    image: 'https://images.unsplash.com/photo-1597401411513-41c37f7a771a?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'mishary',
    title: 'Mishary Alafasy',
    location: 'Kuwait City, Kuwait',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan20.mp3',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'turkey',
    title: 'Blue Mosque',
    location: 'Istanbul, Turkey',
    audioUrl: 'https://archive.org/download/Adhan_Collection/Adhan-Turkey.mp3',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'movie_style',
    title: 'Cinematic Echo',
    location: 'Emotional / Movie Style',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan14.mp3',
    image: 'https://images.unsplash.com/photo-1519817650390-64a934479f67?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sharjah',
    title: 'Noor Mosque',
    location: 'Sharjah, UAE',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'bosnia',
    title: 'Sarajevo Style',
    location: 'Sarajevo, Bosnia',
    audioUrl: 'https://www.islamcan.com/audio/adhan/azan12.mp3',
    image: 'https://images.unsplash.com/photo-1563914442296-e2652b123689?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'africa',
    title: 'Bilal Harmony',
    location: 'West African Echo',
    audioUrl: 'https://archive.org/download/Adhan_Collection/Adhan-African.mp3',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=800'
  }
];

export default function PrayerTimesView() {
  const [loading, setLoading] = useState(true);
  const [prayerData, setPrayerData] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
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
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    let found = prayers.find(p => {
      const [h, m] = p.time.split(':').map(Number);
      return (h * 60 + m) > currentMinutes;
    });

    if (!found) found = prayers[0]; // Next day Fajr
    setNextPrayer(found);
    
    // Update countdown every minute
    updateCountdown(found);
  };

  const updateCountdown = (prayer: PrayerTime) => {
    const now = new Date();
    const [h, m] = prayer.time.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0);
    
    if (target < now) target.setDate(target.getDate() + 1);
    
    const diff = target.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeLeft(`${hours}h ${mins}m`);
  };

  const testAdhanNotification = async () => {
    if (testingAdhan) return;
    try {
      setTestingAdhan(true);
      setErrorStatus("Triggering 10s voice test. Click screen to unlock if audio is blocked...");
      
      const granted = await notificationService.requestPermission();
      
      const preferredId = selectedAdhanId || 'makkah';
      let audioUrl = 'https://www.islamcan.com/audio/adhan/azan2.mp3';
      
      if (preferredId === 'custom' && customUrl) {
        audioUrl = customUrl;
      } else {
        const adhanMap: Record<string, string> = {
          'makkah': 'https://www.islamcan.com/audio/adhan/azan2.mp3',
          'madinah': 'https://www.islamcan.com/audio/adhan/azan1.mp3',
          'mishary': 'https://www.islamcan.com/audio/adhan/azan20.mp3',
          'turkey': 'https://archive.org/download/Adhan_Collection/Adhan-Turkey.mp3',
          'movie_style': 'https://www.islamcan.com/audio/adhan/azan14.mp3',
          'sharjah': 'https://www.islamcan.com/audio/adhan/azan3.mp3',
          'bosnia': 'https://www.islamcan.com/audio/adhan/azan12.mp3',
          'africa': 'https://archive.org/download/Adhan_Collection/Adhan-African.mp3'
        };
        audioUrl = adhanMap[preferredId] || audioUrl;
      }

      notificationService.notify(
        "Adhan Voice Test Signal",
        `Your preferred Adhan voice is playing. Come to success!`,
        'prayer',
        '/resources'
      );

      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
      
      setTimeout(() => {
        audio.pause();
        setTestingAdhan(false);
      }, 10000);
      
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Autoplay restricted. Tap anywhere on the page first, then retry.");
      setTestingAdhan(false);
    }
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
      audioRef.current?.pause();
      setPlayingAdhan(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(e => {
        console.error("Playback failed:", e);
        setErrorStatus("Playback failed. The source might be restricted or broken.");
        setPlayingAdhan(null);
      });
      setPlayingAdhan(id);
      audio.onended = () => setPlayingAdhan(null);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedAdhanId(id);
  };

  const handleDownload = async (adhan: AdhanSound | { id: string, title: string, audioUrl: string }) => {
    try {
      const response = await fetch(adhan.audioUrl);
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
      console.warn("Direct download failed due to CORS, falling back to open in new tab:", e);
      // Fallback: Just open the URL in a new tab so user can save it manually
      window.open(adhan.audioUrl, '_blank');
      setErrorStatus("Direct download restricted. Opening in new tab for manual save.");
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

      {/* Hero Stats */}
      <section className="relative h-[450px] rounded-[3.5rem] overflow-hidden group shadow-2xl border border-white/5 bg-brand-depth/40">
        <img 
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 opacity-40"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-depth via-brand-depth/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-6">
          <div className="w-20 h-20 bg-brand-primary/20 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-brand-primary/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
            <Clock size={40} className="text-brand-primary animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-black text-brand-primary uppercase tracking-[0.5em]">Upcoming Prayer</p>
            <h2 className="text-7xl font-black text-white tracking-tighter">
              {nextPrayer?.name}
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-3xl font-mono font-black text-white px-6 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                {timeLeft} left
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            <MapPin size={14} className="text-brand-primary" /> {location}
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
                className={`p-6 rounded-[2.5rem] border text-center transition-all ${
                  nextPrayer?.id === prayer.id 
                  ? 'bg-brand-primary/10 border-brand-primary/30 shadow-2xl shadow-brand-primary/10' 
                  : 'bg-white/5 border-white/5'
                }`}
              >
                <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${nextPrayer?.id === prayer.id ? 'text-brand-primary' : 'text-slate-500'}`}>
                  {prayer.name}
                </p>
                <p className="text-2xl font-black text-white font-mono">{prayer.time}</p>
                {nextPrayer?.id === prayer.id && (
                  <div className="mt-3 flex justify-center">
                    <span className="w-2 h-2 bg-brand-primary rounded-full animate-ping" />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

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
                  value={customUrl}
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
                        value={inputCity}
                        onChange={(e) => setInputCity(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-brand-primary/50 transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Country Name</label>
                      <input
                        type="text"
                        placeholder="e.g. USA"
                        value={inputCountry}
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
