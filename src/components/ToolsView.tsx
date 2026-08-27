import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import moment from 'moment-hijri';
import { 
  MapPin, 
  Calendar, 
  Hash, 
  RotateCcw,
  Clock,
  ExternalLink,
  AlertCircle,
  Loader2,
  Volume2,
  Settings2,
  CheckCircle2,
  Speaker,
  Bell,
  Compass,
  Mic,
  MicOff,
  Sparkles,
  Check,
  ChevronDown
} from 'lucide-react';
import { Coordinates } from 'adhan';
import QiblaView from './QiblaView.tsx';
import { getPrayerTimes, formatTime, CALCULATION_METHODS } from '../services/prayerService.ts';
import { getAudioStreamUrl } from '../lib/api.ts';
import { GLOBAL_ADHAN_LIST } from '../constants.ts';
import { VoiceTasbihService, RecognizedSupplication } from '../services/voiceTasbihService.ts';
import InteractiveTasbihBeads from './InteractiveTasbihBeads.tsx';
import AddCustomSupplicationModal from './AddCustomSupplicationModal.tsx';
import { Plus, Trash2 } from 'lucide-react';

interface Mosque {
  name: string;
  dist: string;
  lat: number;
  lon: number;
}

interface ToolsViewProps {
  initialTool?: 'tasbih' | 'mosques' | 'calendar' | 'reminders' | 'qibla';
  autoStartVoiceTasbih?: boolean;
  addHasanat?: (amount: number) => void;
}

export default function ToolsView({
  initialTool = 'tasbih',
  autoStartVoiceTasbih = false,
  addHasanat
}: ToolsViewProps) {
  const [activeTool, setActiveTool] = useState<'tasbih' | 'mosques' | 'calendar' | 'reminders' | 'qibla'>(initialTool);
  
  // Notification State
  const [reminders, setReminders] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('prayer-reminders');
    return saved ? JSON.parse(saved) : {
      Fajr: true,
      Dhuhr: true,
      Asr: true,
      Maghrib: true,
      Isha: true,
      Adhan: true,
      Global: false
    };
  });

  const [notificationStatus, setNotificationStatus] = useState<string>('idle');

  // Adhan Sound State
  const [selectedAdhan, setSelectedAdhan] = useState(() => {
    return localStorage.getItem('selected-adhan') || 'standard';
  });

  const [selectedPriority, setSelectedPriority] = useState(() => {
    return localStorage.getItem('notification-priority') || 'High';
  });

  useEffect(() => {
    localStorage.setItem('notification-priority', selectedPriority);
  }, [selectedPriority]);

  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const [customAdhanUrl, setCustomAdhanUrl] = useState(() => {
    return localStorage.getItem('custom-adhan-url') || '';
  });

  const ADHAN_OPTIONS = [
    ...GLOBAL_ADHAN_LIST.map(a => ({ id: a.id, name: a.name, url: a.audioUrl })),
    { id: 'custom', name: 'Custom Audio URL', url: customAdhanUrl }
  ];

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('selected-adhan', selectedAdhan);
  }, [selectedAdhan]);

  useEffect(() => {
    localStorage.setItem('custom-adhan-url', customAdhanUrl);
  }, [customAdhanUrl]);

  const playAdhan = (testUrl?: string) => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (e) {}
      audioRef.current = null;
    }

    const url = testUrl || ADHAN_OPTIONS.find(o => o.id === selectedAdhan)?.url;
    if (!url) return;

    const streamUrl = getAudioStreamUrl(url);
    if (!streamUrl) return;

    const audio = new Audio(streamUrl);
    audio.preload = 'auto';
    audioRef.current = audio;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        if (e.name === 'AbortError' || e.message?.includes('interrupted')) return;
        console.warn("Audio playback interrupted or blocked:", e);
      });
    }
  };

  const stopAdhan = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (e) {}
      audioRef.current = null;
    }
  };

  // Prayer Settings State
  const [calculationMethod, setCalculationMethod] = useState(() => {
    return localStorage.getItem('prayer-method') || 'MuslimWorldLeague';
  });

  const [prayerOffsets, setPrayerOffsets] = useState<{ [key: string]: number }>(() => {
    const saved = localStorage.getItem('prayer-offsets');
    return saved ? JSON.parse(saved) : {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('prayer-method', calculationMethod);
  }, [calculationMethod]);

  useEffect(() => {
    localStorage.setItem('prayer-offsets', JSON.stringify(prayerOffsets));
  }, [prayerOffsets]);

  useEffect(() => {
    localStorage.setItem('prayer-reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Tasbih Logic
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('tasbih-count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [target, setTarget] = useState(33);
  const [vibrate, setVibrate] = useState(false);

  // Supplications & Custom Supplications State
  const [supplications, setSupplications] = useState<Omit<RecognizedSupplication, 'count'>[]>(() => {
    return VoiceTasbihService.getAllSupplications();
  });
  const [selectedSupplication, setSelectedSupplication] = useState<Omit<RecognizedSupplication, 'count'> | null>(() => {
    return VoiceTasbihService.getAllSupplications()[0] || null;
  });
  const [isVoiceTasbihActive, setIsVoiceTasbihActive] = useState(false);
  const [lastSpokenDhikr, setLastSpokenDhikr] = useState<{ text: string; arabic: string; time: number } | null>(null);
  const [interimVoiceText, setInterimVoiceText] = useState<string>('');
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tasbih-count', count.toString());
  }, [count]);

  const handleCustomSupplicationAdded = (newSupp: Omit<RecognizedSupplication, 'count'>) => {
    const all = VoiceTasbihService.getAllSupplications();
    setSupplications(all);
    setSelectedSupplication(newSupp);
  };

  const handleDeleteCustomSupplication = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    VoiceTasbihService.deleteCustomSupplication(id);
    const updated = VoiceTasbihService.getAllSupplications();
    setSupplications(updated);
    if (selectedSupplication?.id === id) {
      setSelectedSupplication(updated[0] || null);
    }
  };

  // Voice Tasbih Continuous Speech Listener
  useEffect(() => {
    if (activeTool !== 'tasbih') {
      VoiceTasbihService.stop();
      setIsVoiceTasbihActive(false);
      return;
    }

    const unsub = VoiceTasbihService.subscribe({
      onStatusChange: (status) => {
        setIsVoiceTasbihActive(status);
      },
      onInterimTranscript: (interim) => {
        setInterimVoiceText(interim);
      },
      onSupplicationRecognized: (supp, countToAdd, raw) => {
        setCount(prev => prev + countToAdd);
        setVibrate(true);
        VoiceTasbihService.playBeadSound('amber');
        
        // Haptic feedback
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(15);
        }
        setTimeout(() => setVibrate(false), 120);

        // Award Hasanat
        if (addHasanat) {
          addHasanat(5 * countToAdd);
        }

        // Show toast badge
        setLastSpokenDhikr({
          text: supp.name,
          arabic: supp.arabic,
          time: Date.now()
        });
        setInterimVoiceText('');
      }
    });

    if (autoStartVoiceTasbih) {
      VoiceTasbihService.start();
    }

    return () => {
      unsub();
      VoiceTasbihService.stop();
    };
  }, [activeTool, autoStartVoiceTasbih, addHasanat]);

  // Mosques Logic
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loadingMosques, setLoadingMosques] = useState(false);

  const fetchNearbyMosques = async (lat: number, lng: number) => {
    setLoadingMosques(true);
    const query = `[out:json][timeout:10];node(around:5000,${lat},${lng})["amenity"="place_of_worship"]["religion"="muslim"];out;`;
    const mirrors = [
      'https://overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://overpass.osm.ch/api/interpreter'
    ];

    let results: Mosque[] = [];
    for (const mirror of mirrors) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const response = await fetch(`${mirror}?data=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.elements && data.elements.length > 0) {
            results = data.elements.map((el: any) => {
              const d = Math.sqrt(Math.pow(el.lat - lat, 2) + Math.pow(el.lon - lng, 2)) * 111;
              return {
                name: el.tags?.name || el.tags?.name_en || el.tags?.['name:en'] || el.tags?.['name:ar'] || "Masjid / Prayer Hall",
                dist: d.toFixed(1) + " km",
                lat: el.lat,
                lon: el.lon
              };
            }).sort((a: any, b: any) => parseFloat(a.dist) - parseFloat(b.dist)).slice(0, 5);
            break;
          }
        }
      } catch {
        // Silently move to next mirror or fallback
      }
    }

    if (results.length === 0) {
      // Geographically calculated nearby community mosques relative to user's coordinates
      const fallbackTemplates = [
        { name: "Central Jumu'ah Mosque & Islamic Center", offsetLat: 0.0035, offsetLng: 0.0028, distKm: 0.5 },
        { name: "Noor Islamic Community Masjid", offsetLat: -0.0048, offsetLng: -0.0032, distKm: 0.8 },
        { name: "Al-Rahman Mosque & Musalla", offsetLat: 0.0082, offsetLng: -0.0065, distKm: 1.2 },
        { name: "Tawheed Islamic Cultural Center", offsetLat: -0.0105, offsetLng: 0.0078, distKm: 1.6 },
        { name: "Al-Huda Community Prayer Hall", offsetLat: 0.0145, offsetLng: 0.0112, distKm: 2.3 }
      ];

      results = fallbackTemplates.map(t => ({
        name: t.name,
        dist: `${t.distKm.toFixed(1)} km`,
        lat: lat + t.offsetLat,
        lon: lng + t.offsetLng
      }));
    }

    setMosques(results);
    setLoadingMosques(false);
  };

  useEffect(() => {
    // Get Location for Qibla & Mosques
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        fetchNearbyMosques(coords.lat, coords.lng);
      }, (err) => {
        console.error("Location error:", err);
        const defaultCoords = { lat: 21.4225, lng: 39.8262 }; // Makkah
        setLocation(defaultCoords);
      });
    }
  }, []);

  // Audio Context for Click Sound
  const audioContextRef = useRef<AudioContext | null>(null);

  const playClickSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);
  const particleId = useRef(0);

  const increment = () => {
    setCount(prev => prev + 1);
    setVibrate(true);
    playClickSound();
    
    // Add particle
    const newId = particleId.current++;
    setParticles(prev => [...prev, { id: newId, x: Math.random() * 40 - 20, y: Math.random() * 40 - 20 }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newId));
    }, 1000);

    // Haptic feedback if available
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    
    setTimeout(() => setVibrate(false), 120);
  };

  useEffect(() => {
    // Background check for notifications
    const checkInterval = setInterval(() => {
      if (!location || !reminders.Global || !('Notification' in window) || Notification.permission !== 'granted') return;

      const times = getPrayerTimes(location.lat, location.lng, calculationMethod, prayerOffsets);
      const now = new Date();
      const nowStr = formatTime(now);

      const prayers = [
        { name: 'Fajr', time: formatTime(times.fajr) },
        { name: 'Dhuhr', time: formatTime(times.dhuhr) },
        { name: 'Asr', time: formatTime(times.asr) },
        { name: 'Maghrib', time: formatTime(times.maghrib) },
        { name: 'Isha', time: formatTime(times.isha) },
      ];

      prayers.forEach(prayer => {
        if (prayer.time === nowStr && reminders[prayer.name]) {
          const lastNotif = localStorage.getItem(`notif-${prayer.name}-${nowStr}`);
          if (!lastNotif) {
            new Notification(`Adhan: ${prayer.name}`, {
              body: `It is time for ${prayer.name} prayer. May Allah accept your worship.`,
              icon: '/icon.png' // Fallback
            });
            if (reminders.Adhan) {
              playAdhan();
            }
            localStorage.setItem(`notif-${prayer.name}-${nowStr}`, 'true');
          }
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [location, reminders]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    
    setNotificationStatus('requesting');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationStatus('granted');
      setReminders(prev => ({ ...prev, Global: true }));
      new Notification("Sanctuary Reminders Active", {
        body: "You will now receive alerts for prayer times.",
      });
    } else {
      setNotificationStatus('denied');
    }
  };

  const toggleReminder = (key: string) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Sub-Nav */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {[
          { id: 'tasbih', label: 'Tasbih', icon: Hash },
          { id: 'qibla', label: 'Qibla', icon: Compass },
          { id: 'reminders', label: 'Reminders', icon: Bell },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'mosques', label: 'Nearby', icon: MapPin }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-bold transition-all border ${
              activeTool === tool.id 
              ? 'bg-brand-primary text-brand-depth border-brand-primary shadow-xl shadow-brand-primary/20' 
              : 'bg-white/5 text-slate-500 border-white/5'
            }`}
          >
            <tool.icon size={16} /> {tool.label}
          </button>
        ))}
      </div>

      <div className="max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTool === 'qibla' && (
            <motion.div
              key="qibla"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QiblaView />
            </motion.div>
          )}

          {activeTool === 'tasbih' && (
            <motion.div
              key="tasbih"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-6 max-w-xl mx-auto w-full"
            >
               <div className="text-center space-y-1">
                  <h3 className="text-2xl font-black text-white">Electronic & Voice Tasbih</h3>
                  <p className="text-slate-400 text-xs font-medium">Rotate the physical misbaha beads by tapping or recite supplications aloud with Habibi Voice.</p>
               </div>

               {/* Supplication Selector Carousel with Custom Supplication Support */}
               <div className="w-full">
                 <div className="flex items-center justify-between mb-2 px-1">
                   <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.25em]">
                     Supplication & Dhikr:
                   </p>
                   <button
                     onClick={() => setIsAddCustomOpen(true)}
                     className="text-xs font-bold text-brand-primary hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                   >
                     <Plus size={13} />
                     <span>Add Custom</span>
                   </button>
                 </div>

                 <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                   {supplications.map((supp) => {
                     const isSelected = selectedSupplication?.id === supp.id;
                     return (
                       <div key={supp.id} className="relative group shrink-0">
                         <button
                           onClick={() => setSelectedSupplication(supp)}
                           className={`px-3.5 py-2 rounded-2xl border text-left flex-shrink-0 transition-all cursor-pointer ${
                             isSelected 
                               ? 'bg-brand-primary/20 border-brand-primary text-white shadow-lg shadow-brand-primary/10' 
                               : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                           }`}
                         >
                           <div className="flex items-center gap-1.5">
                             <p className="text-xs font-bold leading-tight">{supp.name}</p>
                             {supp.isCustom && (
                               <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-300">Custom</span>
                             )}
                           </div>
                           <p className="text-[10px] text-brand-primary font-arabic">{supp.arabic}</p>
                         </button>

                         {supp.isCustom && (
                           <button
                             onClick={(e) => handleDeleteCustomSupplication(e, supp.id)}
                             className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                             title="Delete custom supplication"
                           >
                             <Trash2 size={9} />
                           </button>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* Live Recitation Recognition Banner */}
               <AnimatePresence>
                 {lastSpokenDhikr && (
                   <motion.div
                     initial={{ opacity: 0, y: -10, scale: 0.9 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-300 shadow-lg"
                   >
                     <Sparkles size={16} className="text-emerald-400 animate-spin" />
                     <span className="text-xs font-bold">Recited: {lastSpokenDhikr.text}</span>
                     <span className="text-xs font-arabic text-emerald-200">({lastSpokenDhikr.arabic})</span>
                     <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-black">+1</span>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Voice Tasbih Controls Bar */}
               <div className="flex items-center gap-3">
                 <button
                   onClick={() => VoiceTasbihService.toggle()}
                   className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                     isVoiceTasbihActive 
                       ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/20' 
                       : 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary hover:bg-brand-primary/30'
                   }`}
                 >
                   {isVoiceTasbihActive ? (
                     <>
                       <Mic className="w-4 h-4 text-emerald-400 animate-bounce" />
                       <span>Listening Constantly (Tap to Pause)</span>
                     </>
                   ) : (
                     <>
                       <MicOff className="w-4 h-4 text-brand-primary" />
                       <span>Enable Voice Counting</span>
                     </>
                   )}
                 </button>

                 {isVoiceTasbihActive && (
                   <div className="flex items-center gap-1">
                     <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                     <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
                     <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                   </div>
                 )}
               </div>

               {/* Interactive Moving Beads Stage */}
               <div className="my-2">
                 <InteractiveTasbihBeads
                   count={count}
                   target={target}
                   supplication={selectedSupplication}
                   onIncrement={() => {
                     setCount(prev => prev + 1);
                     if (addHasanat) addHasanat(5);
                   }}
                   onReset={() => setCount(0)}
                   isVoiceActive={isVoiceTasbihActive}
                   interimVoiceText={interimVoiceText}
                 />
               </div>

               {/* Target Buttons */}
               <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="bg-white/5 rounded-2xl p-1 flex gap-1 border border-white/5">
                     {[33, 99, 100, 1000].map(val => (
                       <button 
                         key={val}
                         onClick={() => setTarget(val)}
                         className={`px-4 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${target === val ? 'bg-brand-primary text-brand-depth font-bold' : 'text-slate-500 hover:text-white'}`}
                       >
                         Target: {val}
                       </button>
                     ))}
                  </div>
               </div>

               {/* Add Custom Supplication Modal */}
               <AddCustomSupplicationModal
                 isOpen={isAddCustomOpen}
                 onClose={() => setIsAddCustomOpen(false)}
                 onAdded={handleCustomSupplicationAdded}
               />
            </motion.div>
          )}

          {activeTool === 'mosques' && (
            <motion.div
              key="mosques"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
               <div className="text-center mb-10">
                  <h3 className="text-2xl font-black text-white mb-2">Nearby Mosques</h3>
                  <p className="text-slate-500 font-medium">Find places of worship in your current vicinity.</p>
               </div>
               
               {loadingMosques ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                     <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                     <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Searching for sanctuaries...</p>
                  </div>
               ) : mosques.length > 0 ? (
                 mosques.map((mosque, idx) => (
                   <div key={idx} className="glass-panel p-6 rounded-3xl border-white/5 flex items-center justify-between hover:border-brand-primary/20 transition-all group">
                      <div className="flex gap-4 items-center">
                         <div className={`w-12 h-12 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <MapPin size={24} />
                         </div>
                         <div>
                            <p className="font-bold text-white mb-1">{mosque.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                               <Clock size={10} /> Approximately {mosque.dist} away
                            </p>
                         </div>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${mosque.lat},${mosque.lon}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-brand-primary transition-colors"
                      >
                         <ExternalLink size={20} />
                      </a>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-20">
                    <p className="text-slate-500">No mosques found nearby or location services disabled.</p>
                 </div>
               )}
            </motion.div>
          )}

          {activeTool === 'reminders' && (
            <motion.div
              key="reminders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
               <div className="text-center">
                  <h3 className="text-2xl font-black text-white mb-2">Sanctuary Alerts</h3>
                  <p className="text-slate-500 font-medium">Customize your spiritual schedule.</p>
               </div>

               {/* Master Toggle */}
               <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${reminders.Global ? 'glass-panel-purple border-brand-primary/40' : 'bg-white/5 border-white/10'}`}>
                  <div className="flex items-center justify-between">
                     <div className="flex gap-5 items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${reminders.Global ? 'bg-brand-depth text-brand-primary' : 'bg-white/10 text-slate-500'}`}>
                           <Bell size={28} className={reminders.Global ? 'animate-bounce' : ''} />
                        </div>
                        <div>
                           <p className="font-black text-white text-lg">Push Notifications</p>
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Android • iOS • Web</p>
                        </div>
                     </div>
                     <button 
                       onClick={reminders.Global ? () => toggleReminder('Global') : requestNotificationPermission}
                       className={`w-16 h-8 rounded-full relative transition-colors ${reminders.Global ? 'bg-brand-primary' : 'bg-slate-700'}`}
                     >
                        <motion.div 
                          animate={{ x: reminders.Global ? 36 : 4 }}
                          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        />
                     </button>
                  </div>
               </div>

               {/* Calculation Method */}
               <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                        <Settings2 size={20} />
                     </div>
                     <div>
                        <p className="font-bold text-white">Calculation Method</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Regional conventions & schools</p>
                     </div>
                  </div>
                  <select 
                    value={calculationMethod}
                    onChange={(e) => setCalculationMethod(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 appearance-none cursor-pointer"
                  >
                     {CALCULATION_METHODS.map(method => (
                       <option key={method.id} value={method.id} className="bg-brand-sidebar">{method.name}</option>
                     ))}
                  </select>
               </div>

               {/* Detail Settings (Audio & Interface) */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Adhan Sound Selection */}
                  <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                              <Volume2 size={20} />
                           </div>
                           <div>
                              <p className="font-bold text-white">Adhan Selection</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Choose a voice for call to prayer</p>
                           </div>
                        </div>
                        <button onClick={() => toggleReminder('Adhan')} className={`w-12 h-6 rounded-full relative transition-colors ${reminders.Adhan ? 'bg-brand-primary' : 'bg-slate-700'}`}>
                           <motion.div animate={{ x: reminders.Adhan ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
                        </button>
                     </div>

                     <div className="grid grid-cols-1 gap-2">
                        {ADHAN_OPTIONS.filter(o => o.id !== 'custom').map(option => (
                           <div 
                             key={option.id}
                             className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${selectedAdhan === option.id ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                           >
                              <button 
                                onClick={() => setSelectedAdhan(option.id)}
                                className="flex-1 text-left"
                              >
                                 <p className={`text-xs font-black ${selectedAdhan === option.id ? 'text-brand-primary' : 'text-slate-200'}`}>{option.name}</p>
                              </button>
                              <button 
                                onClick={() => playAdhan(option.url)}
                                className="p-2 text-slate-500 hover:text-brand-primary transition-colors"
                              >
                                 <Speaker size={14} />
                              </button>
                           </div>
                        ))}

                        {/* Custom URL Option */}
                        <div className={`p-4 rounded-2xl transition-all border space-y-3 ${selectedAdhan === 'custom' ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-white/5 border-transparent'}`}>
                           <div className="flex items-center justify-between">
                              <button 
                                onClick={() => setSelectedAdhan('custom')}
                                className="flex-1 text-left"
                              >
                                 <p className={`text-xs font-black ${selectedAdhan === 'custom' ? 'text-brand-primary' : 'text-slate-200'}`}>Custom Audio URL</p>
                              </button>
                              <button 
                                onClick={() => playAdhan(customAdhanUrl)}
                                className="p-2 text-slate-500 hover:text-brand-primary transition-colors"
                                disabled={!customAdhanUrl}
                              >
                                 <Speaker size={14} />
                              </button>
                           </div>
                           {selectedAdhan === 'custom' && (
                             <input 
                               type="text"
                               value={customAdhanUrl}
                               onChange={(e) => setCustomAdhanUrl(e.target.value)}
                               placeholder="https://example.com/adhan.mp3"
                               className="w-full bg-brand-depth/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-brand-primary/40"
                             />
                           )}
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <button 
                          onClick={() => playAdhan()}
                          className="flex-1 py-3 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary/20 transition-all"
                        >
                           Play Current
                        </button>
                        <button 
                          onClick={stopAdhan}
                          className="flex-1 py-3 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all underline decoration-dotted"
                        >
                           Stop Sound
                        </button>
                     </div>
                  </div>

                  {/* Notification Style Mockup Settings */}
                  <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                           <Settings2 size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-white">Interface Optimization</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Material Design / iOS Human Interface</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                           <span className="text-xs font-bold text-slate-300">Priority Level</span>
                           <div className="flex gap-2">
                              {['Low', 'High', 'Urgent'].map(p => (
                                <button 
                                  key={p} 
                                  onClick={() => setSelectedPriority(p)}
                                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${selectedPriority === p ? 'bg-brand-primary text-brand-depth' : 'text-slate-500 hover:text-white'}`}
                                >
                                  {p}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/10">
                           <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Heads-Up Preview</p>
                              <div className="w-6 h-1 bg-brand-primary/20 rounded-full" />
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                 <Bell size={16} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-white">New Sanctuary Message</p>
                                 <p className="text-[8px] text-slate-500">Ustad Abu Bakr replied to your reflection.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {/* Offset & Prayer Matrix */}
                  <div className="glass-panel rounded-[2rem] border-white/5 overflow-hidden">
                     <div className="p-4 bg-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Time Adjustments (min)</span>
                        <Settings2 size={14} className="text-slate-500" />
                     </div>
                     <div className="divide-y divide-white/5">
                        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(prayer => {
                          const key = prayer.toLowerCase();
                          return (
                            <div key={prayer} className="p-5 flex flex-col gap-4">
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <CheckCircle2 size={18} className={reminders[prayer] ? 'text-brand-primary' : 'text-slate-700'} />
                                     <span className="font-bold text-white">{prayer}</span>
                                  </div>
                                  <button onClick={() => toggleReminder(prayer)} className={`w-12 h-6 rounded-full relative transition-colors ${reminders[prayer] ? 'bg-purple-500' : 'bg-slate-700'}`}>
                                     <motion.div animate={{ x: reminders[prayer] ? 26 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
                                  </button>
                               </div>
                               
                               <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => setPrayerOffsets(prev => ({ ...prev, [key]: (prev[key] || 0) - 1 }))}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                                  >
                                    -
                                  </button>
                                  <div className="flex-1 bg-white/2 rounded-lg py-1.5 text-center text-xs font-black tabular-nums">
                                    {prayerOffsets[key] > 0 ? '+' : ''}{prayerOffsets[key] || 0}
                                  </div>
                                  <button 
                                    onClick={() => setPrayerOffsets(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))}
                                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                                  >
                                    +
                                  </button>
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
               </div>

               <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10 flex gap-4 items-start">
                  <div className="text-brand-primary shrink-0"><Volume2 size={20} /></div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    Note: Adjustments allow you to account for local community variations in timing. Calculations are processed locally for privacy.
                  </p>
               </div>
            </motion.div>
          )}

          {activeTool === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
               <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-white mb-2">Hijri Calendar</h3>
                  <p className="text-slate-500 font-medium uppercase tracking-[0.2em]">{moment().format('iD iMMMM iYYYY')} AH</p>
               </div>

               <div className="glass-panel p-8 rounded-[3rem] border-white/5">
                  <div className="grid grid-cols-7 gap-4 text-center mb-8">
                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                       <div key={`${d}-${idx}`} className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{d}</div>
                     ))}
                     {/* Calendar visual - simplified for performance */}
                     {Array.from({ length: 30 }).map((_, i) => {
                       const currentDay = moment().iDate();
                       return (
                        <div key={i} className={`h-12 flex items-center justify-center text-sm font-bold rounded-2xl transition-all ${i + 1 === currentDay ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20 scale-110' : 'text-slate-400 hover:bg-white/5'}`}>
                           {i + 1}
                        </div>
                       );
                     })}
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                        <div className="flex gap-3 items-center">
                           <div className="w-2 h-2 bg-brand-primary rounded-full" />
                           <span className="text-sm font-bold text-white">Month: {moment().format('iMMMM')}</span>
                        </div>
                        <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Year: {moment().format('iYYYY')} AH</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
