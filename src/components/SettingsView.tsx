import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, Bell, Shield, Info, Database, LogOut, ArrowRight, ChevronRight, Sparkles, MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Zap, Waves, Tent, Trash2, WifiOff, Compass, Heart, Flame, Palette, Sliders } from 'lucide-react';
import { LANGUAGES } from '../constants.ts';
import { notificationService } from '../services/notificationService';
import { offlineService, SyncProgress } from '../services/offlineService';
import { CURATED_THEMES, ThemeService } from '../services/themeService';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  theme: string;
  setTheme: (val: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  language: string;
  setLanguage: (val: string) => void;
}

export default function SettingsView({ theme, setTheme, darkMode, setDarkMode, onLogout, language, setLanguage }: SettingsViewProps) {
  const navigate = useNavigate();
  // Custom client-side Gemini API Key State
  const [customGeminiKey, setCustomGeminiKey] = useState(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });

  const saveGeminiKey = (key: string) => {
    setCustomGeminiKey(key);
    if (key.trim()) {
      localStorage.setItem('custom_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('custom_gemini_api_key');
    }
  };

  // Custom API Server URL State
  const [customApiUrl, setCustomApiUrl] = useState(() => {
    return localStorage.getItem('custom_api_base_url') || '';
  });

  const saveApiUrl = (url: string) => {
    setCustomApiUrl(url);
    if (url.trim()) {
      localStorage.setItem('custom_api_base_url', url.trim());
    } else {
      localStorage.removeItem('custom_api_base_url');
    }
  };

  // Force Ramadan Mode State & Toggle
  const [forceRamadan, setForceRamadan] = useState(() => {
    return localStorage.getItem('force-ramadan-mode') === 'true';
  });

  const toggleForceRamadan = () => {
    const newValue = !forceRamadan;
    setForceRamadan(newValue);
    localStorage.setItem('force-ramadan-mode', String(newValue));
    window.dispatchEvent(new Event('ramadan_mode_updated'));
  };

  // Offline Mode Setting
  const [offlineMode, setOfflineMode] = useState(() => {
    return localStorage.getItem('offline-mode') === 'true';
  });

  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [cacheSize, setCacheSize] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('last-sync-time');
  });

  useEffect(() => {
    if (offlineMode) {
      offlineService.getCacheSize().then(setCacheSize);
    } else {
      setCacheSize(null);
    }
  }, [offlineMode]);

  const startSync = async () => {
    await offlineService.syncFullQuran(async (progress) => {
      setSyncProgress(progress);
      
      // Update cache size display every 10 suras during sync
      if (progress.current % 10 === 0 || progress.status === 'completed') {
        const size = await offlineService.getCacheSize();
        setCacheSize(size);
      }

      if (progress.status === 'completed') {
        const now = new Date().toLocaleString();
        localStorage.setItem('last-sync-time', now);
        setLastSyncTime(now);
        setOfflineMode(true);
        setTimeout(() => setSyncProgress(null), 3000);
      }
    });
  };

  const toggleOfflineMode = async () => {
    if (!offlineMode) {
      if (confirm('Enable Offline Sanctuary? This will download the entire Quran text and basic audio references (~50MB) for disconnected access.')) {
        startSync();
      }
    } else {
      if (confirm('Disable Offline Mode and clear cache?')) {
        await offlineService.clearCache();
        setOfflineMode(false);
        setCacheSize(null);
        localStorage.removeItem('last-sync-time');
        setLastSyncTime(null);
      }
    }
  };

  const clearCacheManual = async () => {
    if (confirm('Are you sure you want to clear the Quran data cache? You will need to re-download for offline access.')) {
      await offlineService.clearCache();
      const size = await offlineService.getCacheSize();
      setCacheSize(size);
      localStorage.removeItem('last-sync-time');
      setLastSyncTime(null);
      if (offlineMode) setOfflineMode(false);
    }
  };

  // Prayer Notifications & Reminders
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('prayer-reminders');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true, Adhan: true, Global: false
    };
  });

  const [downloadedSuras, setDownloadedSuras] = useState<Record<string, any>>({});
  const [surahList, setSurahList] = useState<any[]>([]);
  const [isOfflineManagerExpanded, setIsOfflineManagerExpanded] = useState(false);

  useEffect(() => {
    const loadOfflineData = async () => {
      const meta = await offlineService.getAllDownloadedSurahs();
      setDownloadedSuras(meta);
      const list = await offlineService.getSurahs();
      if (list) setSurahList(list);
    };
    loadOfflineData();
  }, [offlineMode, syncProgress]);

  const removeSura = async (metaKey: string) => {
    const [num, reciter] = metaKey.split('_');
    if (confirm(`Remove Sura ${num} from your offline cache?`)) {
      await offlineService.removeDownloadedSurah(parseInt(num), reciter === 'default' ? undefined : parseInt(reciter));
      const meta = await offlineService.getAllDownloadedSurahs();
      setDownloadedSuras(meta);
      const size = await offlineService.getCacheSize();
      setCacheSize(size);
    }
  };

  const [isRemindersExpanded, setIsRemindersExpanded] = useState(false);

  // Tahajjud & White Days Settings State
  const [tahajjudSettings, setTahajjudSettings] = useState(() => {
    const saved = localStorage.getItem('tahajjud-reminder-settings');
    return saved ? JSON.parse(saved) : { enabled: true, offset: 'last_third' };
  });

  const [whiteDaysSettings, setWhiteDaysSettings] = useState(() => {
    const saved = localStorage.getItem('whitedays-reminder-settings');
    return saved ? JSON.parse(saved) : { enabled: true, eveningBefore: true, suhoorMorning: true };
  });

  const toggleTahajjudSetting = (enabled: boolean) => {
    const updated = { ...tahajjudSettings, enabled };
    setTahajjudSettings(updated);
    localStorage.setItem('tahajjud-reminder-settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('prayer_times_updated'));
  };

  const setTahajjudOffsetSetting = (offset: string) => {
    const updated = { ...tahajjudSettings, offset };
    setTahajjudSettings(updated);
    localStorage.setItem('tahajjud-reminder-settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('prayer_times_updated'));
  };

  const toggleWhiteDaysSetting = (enabled: boolean) => {
    const updated = { ...whiteDaysSettings, enabled };
    setWhiteDaysSettings(updated);
    localStorage.setItem('whitedays-reminder-settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('prayer_times_updated'));
  };

  useEffect(() => {
    localStorage.setItem('prayer-reminders', JSON.stringify(reminders));
    window.dispatchEvent(new CustomEvent('prayer_times_updated'));
  }, [reminders]);

  const toggleGlobalReminders = async () => {
    const newVal = !reminders.Global;
    
    if (newVal) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        alert('Please enable notifications in your browser settings to receive alerts.');
        return;
      }
      
      notificationService.notify(
        'Notifications Active',
        'You will now receive alerts for prayers and community updates.',
        'system'
      );
    }

    setReminders(prev => ({ ...prev, Global: newVal }));
  };

  const toggleIndividualReminder = (key: string) => {
    setReminders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    localStorage.setItem('offline-mode', offlineMode.toString());
  }, [offlineMode]);

  const [communityNotifs, setCommunityNotifs] = useState(() => {
    return localStorage.getItem('community-notifs') !== 'false';
  });

  const toggleCommunity = (val: boolean) => {
    setCommunityNotifs(val);
    localStorage.setItem('community-notifs', val.toString());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      <header>
        <h2 className="text-4xl font-bold text-white tracking-tight">App Settings</h2>
        <p className="text-brand-primary font-medium tracking-wide">Personalize your digital sanctuary</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Alerts</p>
            <div className="flex items-center gap-2">
               <Bell size={16} className="text-brand-primary" />
               <span className="text-xl font-bold text-white">{Object.values(reminders).filter(Boolean).length}</span>
            </div>
         </div>
         <motion.button 
           whileTap={{ scale: 0.95 }}
           onClick={() => {
             notificationService.notify('Test Signal', 'Testing notification sound and vibration...', 'system');
           }}
           className="glass-panel p-6 rounded-3xl border-white/5 space-y-2 text-left hover:border-brand-primary/30 transition-all group"
         >
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Test Audio</p>
            <div className="flex items-center gap-2 text-brand-primary group-hover:gap-4 transition-all">
               <Zap size={16} />
               <span className="text-xs font-bold uppercase tracking-widest italic">Signal Sound</span>
            </div>
         </motion.button>
      </div>

      {/* Appearance & Theme Previewer Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
            <Moon size={14} /> Global Appearance & Spiritual Atmosphere
          </h3>
          <button
            type="button"
            onClick={() => navigate('/settings/theme')}
            className="text-xs font-bold text-brand-primary hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Advanced Studio</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Dedicated Spiritual Studio Launch Banner */}
        <div 
          onClick={() => navigate('/settings/theme')}
          className="glass-panel p-6 sm:p-7 rounded-[2.5rem] border border-brand-primary/30 bg-gradient-to-r from-brand-sidebar via-brand-primary/10 to-brand-depth hover:border-brand-primary/60 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/15 rounded-full blur-3xl group-hover:scale-110 transition-transform pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-black flex items-center justify-center font-black shadow-lg shadow-brand-primary/30 shrink-0 group-hover:scale-105 transition-transform">
                <Palette size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-[9px] font-black uppercase tracking-widest border border-brand-primary/30">
                    Spiritual Mood & Aesthetics
                  </span>
                </div>
                <h4 className="text-lg font-black text-white group-hover:text-brand-primary transition-colors">
                  Customize Sanctuary Theme Colors
                </h4>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  Tailor primary brand colors, midnight depth tones, ambient spiritual glow, and match colors to your heart's mood (Peace, Tahajjud, Fajr, Dua).
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-5 py-3 bg-brand-primary text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-brand-primary/30 flex items-center justify-center gap-2 group-hover:gap-3 transition-all shrink-0 cursor-pointer"
            >
              <Sliders size={14} />
              <span>Customize Colors</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl space-y-px">
          {/* Theme Selector with Swatches & Live Preview Card */}
          <div className="p-8 border-b border-white/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                 <div className="w-1.5 h-5 bg-brand-primary rounded-full" />
                 <div>
                   <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Sanctuary Essence</p>
                   <h4 className="text-lg font-black text-white">Quick Color Palette Swatches</h4>
                 </div>
              </div>
              <button
                onClick={() => navigate('/settings/theme')}
                className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 px-3 py-1.5 rounded-full border border-brand-primary/30 w-fit flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sliders size={10} /> Full Theme Customizer Page
              </button>
            </div>

            {/* Interactive Color Swatches Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CURATED_THEMES.slice(0, 8).map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      ThemeService.applyTheme(t.id);
                    }}
                    className={`p-4 rounded-3xl border transition-all flex flex-col items-center text-center gap-2.5 relative overflow-hidden group cursor-pointer ${
                      isSelected 
                        ? 'bg-white/10 border-brand-primary shadow-xl ring-2 ring-brand-primary/40' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    {/* Color Swatch Circle */}
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-black shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform relative"
                      style={{ backgroundColor: t.colors.primary }}
                    >
                      <Sparkles size={18} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle2 size={12} className="text-black" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-white text-xs whitespace-nowrap">{t.name}</p>
                      <p className="text-[8px] text-brand-primary font-bold uppercase tracking-widest mt-0.5">{t.mood}</p>
                    </div>
                    {/* Swatch hex badge */}
                    <span className="text-[8px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-black/40 border border-white/5">
                      {t.colors.primary}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Interactive Mini-App Previewer Component */}
            <div className="mt-4 p-6 rounded-3xl bg-black/40 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary flex items-center gap-2">
                  <Sparkles size={12} /> Live Theme Canvas Preview
                </span>
                <span className="text-[9px] font-mono text-slate-400 capitalize">
                  Active Theme: <span className="text-white font-bold">{theme}</span>
                </span>
              </div>

              {/* Mock App Interface Preview Card */}
              <div className="p-5 rounded-2xl bg-brand-sidebar border border-brand-primary/30 shadow-2xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-primary text-brand-depth flex items-center justify-center font-black text-xs shadow-md">
                      ✦
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">Sanctuary OS Preview</h5>
                      <p className="text-[8px] text-slate-400">All UI surfaces reflect selected palette</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-brand-primary/20 text-brand-primary rounded-lg text-[9px] font-black uppercase tracking-wider border border-brand-primary/30">
                    Live Active
                  </span>
                </div>

                {/* Mock Prayer Time & Verse Widget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 space-y-1">
                    <div className="flex items-center justify-between text-brand-primary text-[9px] font-black uppercase">
                      <span>Next Prayer: Maghrib</span>
                      <Sun size={12} />
                    </div>
                    <p className="text-lg font-black text-white font-mono">06:42 PM</p>
                    <p className="text-[8px] text-slate-400">Time remaining: 42 mins</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-amber-400 text-[9px] font-black uppercase">
                      <span>Daily Hasanat</span>
                      <Sparkles size={12} />
                    </div>
                    <p className="text-lg font-black text-amber-300 font-mono">+1,250 Barakah</p>
                    <p className="text-[8px] text-slate-400">Level 4 • Seeker of Light</p>
                  </div>
                </div>

                {/* Mock Action Buttons with Theme Glow */}
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2.5 bg-brand-primary text-brand-depth rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand-primary/20">
                    Primary Action
                  </button>
                  <button className="px-4 py-2.5 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/10 hover:bg-white/15">
                    Explore Quran
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl text-brand-primary border border-white/5">
                 <Globe size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-200">Primary Translation</p>
                <p className="text-xs text-slate-500">Language for meaning and context</p>
              </div>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-brand-depth border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest p-2.5 outline-none text-brand-primary focus:border-brand-primary/50 transition-all cursor-pointer"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <hr className="border-white/5" />

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/10">
                 <Moon size={22} className="fill-amber-400/10" />
              </div>
              <div>
                <p className="font-bold text-slate-200">Simulate Ramadan Mode</p>
                <p className="text-xs text-slate-500">Enable fasting dashboard, countdowns, and active tracking instantly</p>
              </div>
            </div>
            <button 
              onClick={toggleForceRamadan}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${forceRamadan ? 'bg-amber-500 text-brand-depth hover:bg-amber-600 shadow-lg shadow-amber-500/15' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
            >
              {forceRamadan ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
          <Bell size={14} /> Notification Preferences
        </h3>
        <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl space-y-px">
           {/* Permission Grant Block - CRITICAL FOR MOBILE */}
           <div className="p-6 bg-brand-primary/5 border-b border-white/5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                 <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/20 shrink-0">
                    <Bell size={28} />
                 </div>
                 <div className="flex-1 text-center md:text-left space-y-1">
                    <h4 className="text-lg font-black text-white italic uppercase tracking-tight">Stay Connected</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                       Mobile devices require a manual signal to receive Adhan and Community updates. Grant access to your digital sanctuary.
                    </p>
                 </div>
                 <button 
                    onClick={() => {
                       if ('Notification' in window) {
                          Notification.requestPermission().then(permission => {
                             if (permission === 'granted') {
                                notificationService.notify('Access Granted', 'Your sanctuary is now connected to your device.', 'system');
                             } else if (permission === 'denied') {
                                alert("Signals are blocked. Please enable notifications in your browser settings to receive alerts.");
                             }
                          });
                       } else {
                          alert("Notifications are not supported on this device/browser.");
                       }
                    }}
                    className="w-full md:w-auto bg-brand-primary text-brand-depth px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                 >
                    Grant Permission
                 </button>
              </div>
           </div>

           {/* Prayer Notifications */}
           <div className="border-b border-white/5">
             <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group cursor-pointer" onClick={() => setIsRemindersExpanded(!isRemindersExpanded)}>
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-brand-primary transition-colors border border-white/5">
                    <Bell size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-200">Prayer Alerts</p>
                      <motion.div 
                        animate={{ rotate: isRemindersExpanded ? 180 : 0 }}
                        className="text-slate-500"
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                    </div>
                    <p className="text-xs text-slate-500">Adhan & Iqamah reminders</p>
                  </div>
               </div>
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGlobalReminders();
                  }}
                  className={`w-16 h-9 rounded-full transition-all relative ${reminders.Global ? 'bg-brand-primary' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${reminders.Global ? 'left-8' : 'left-1.5'} shadow-lg`} />
                </button>
             </div>

             <AnimatePresence>
               {isRemindersExpanded && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="overflow-hidden bg-black/20"
                 >
                   <div className="p-6 space-y-6">
                      {/* Adhan Sound Toggle */}
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-sm font-bold text-slate-300">Adhan Audio</p>
                            <p className="text-[10px] text-slate-500">Play full audio call to prayer</p>
                         </div>
                         <button 
                            onClick={() => toggleIndividualReminder('Adhan')}
                            className={`w-12 h-7 rounded-full transition-all relative ${reminders.Adhan ? 'bg-brand-primary/60' : 'bg-slate-800'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${reminders.Adhan ? 'left-6' : 'left-1'} shadow-md`} />
                          </button>
                      </div>

                      <div className="h-[1px] bg-white/5" />

                      {/* Individual Prayer Toggles */}
                      <div className="grid grid-cols-1 gap-4">
                        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                          <div key={prayer} className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-400">{prayer}</p>
                            <button 
                              onClick={() => toggleIndividualReminder(prayer)}
                              className={`w-10 h-6 rounded-full transition-all relative ${reminders[prayer] ? 'bg-brand-primary/40' : 'bg-slate-800'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${reminders[prayer] ? 'left-5' : 'left-1'} shadow-sm`} />
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {/* Tahajjud (Night Vigil) Alarms */}
           <div className="border-b border-white/5 p-6 hover:bg-white/5 transition-all">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
                    <Moon size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Tahajjud & Qiyam Al-Layl Alarm</p>
                    <p className="text-xs text-slate-500">Wake up for the blessed Last Third of the Night</p>
                  </div>
               </div>
               <button 
                  onClick={() => toggleTahajjudSetting(!tahajjudSettings.enabled)}
                  className={`w-16 h-9 rounded-full transition-all relative ${tahajjudSettings.enabled ? 'bg-purple-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${tahajjudSettings.enabled ? 'left-8' : 'left-1.5'} shadow-lg`} />
                </button>
             </div>

             {tahajjudSettings.enabled && (
               <div className="mt-4 pl-16 space-y-2">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alarm Offset</p>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                   {[
                     { id: 'last_third', label: 'Last 1/3 Start' },
                     { id: '60_min_before_fajr', label: '60m before Fajr' },
                     { id: '45_min_before_fajr', label: '45m before Fajr' },
                     { id: '30_min_before_fajr', label: '30m before Fajr' }
                   ].map((opt) => (
                     <button
                       key={opt.id}
                       onClick={() => setTahajjudOffsetSetting(opt.id)}
                       className={`py-2 px-2.5 rounded-xl text-[10px] font-bold text-center transition-all border ${
                         tahajjudSettings.offset === opt.id
                           ? 'bg-purple-500/20 text-purple-200 border-purple-400/50'
                           : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                       }`}
                     >
                       {opt.label}
                     </button>
                   ))}
                 </div>
               </div>
             )}
           </div>

           {/* White Days (Ayyam al-Beed) Fasting Alarms */}
           <div className="border-b border-white/5 p-6 hover:bg-white/5 transition-all">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                    <Flame size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">White Days (Ayyam al-Beed) Alarms</p>
                    <p className="text-xs text-slate-500">Sunnah fasting reminders on 13th, 14th, 15th of lunar month</p>
                  </div>
               </div>
               <button 
                  onClick={() => toggleWhiteDaysSetting(!whiteDaysSettings.enabled)}
                  className={`w-16 h-9 rounded-full transition-all relative ${whiteDaysSettings.enabled ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${whiteDaysSettings.enabled ? 'left-8' : 'left-1.5'} shadow-lg`} />
                </button>
             </div>
           </div>

           {/* Community Notifications */}
           <div className="flex items-center justify-between p-6 border-b border-white/5 hover:bg-white/5 transition-all group">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-brand-primary transition-colors border border-white/5">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Community & Chat</p>
                  <p className="text-xs text-slate-500">Mentions, new messages, and social updates</p>
                </div>
             </div>
             <button 
                onClick={() => toggleCommunity(!communityNotifs)}
                className={`w-16 h-9 rounded-full transition-all relative ${communityNotifs ? 'bg-brand-primary' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${communityNotifs ? 'left-8' : 'left-1.5'} shadow-lg`} />
              </button>
           </div>

           {/* Daily Inspiration */}
           <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-brand-primary transition-colors border border-white/5">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Daily Hadith & Verses</p>
                  <p className="text-xs text-slate-500">Receive one spiritual gem every morning</p>
                </div>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 rounded-lg text-[10px] font-black text-brand-primary uppercase">
                Active
             </div>
           </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
          <Shield size={14} /> Data & Reliability
        </h3>
        <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">

           {/* Offline Sanctuary */}
           <div className="flex flex-col p-6 border-b border-white/5 hover:bg-white/5 transition-all group">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-white/5 rounded-2xl text-slate-400 group-hover:text-brand-primary transition-colors border border-white/5">
                    <Database size={22} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Offline Sanctuary</p>
                    <p className="text-xs text-slate-500">Cache revelations for disconnected study</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {cacheSize && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={10} className="text-brand-primary" />
                          <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest">
                            Stored: {cacheSize}
                          </p>
                        </div>
                      )}
                      {lastSyncTime && (
                        <div className="flex items-center gap-1.5">
                          <RefreshCw size={10} className="text-slate-500" />
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                            Synced: {lastSyncTime}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                 {offlineMode && !syncProgress && (
                   <>
                     <button 
                       onClick={() => setIsOfflineManagerExpanded(!isOfflineManagerExpanded)}
                       className={`p-2 transition-all ${isOfflineManagerExpanded ? 'text-brand-primary bg-brand-primary/10 rounded-lg' : 'text-slate-500 hover:text-white'}`}
                       title="Manage Downloads"
                     >
                       <Database size={18} />
                     </button>
                     <button 
                       onClick={clearCacheManual}
                       className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                       title="Clear All Cache"
                     >
                       <RefreshCw size={16} />
                     </button>
                   </>
                 )}
                 <button 
                    onClick={toggleOfflineMode}
                    disabled={syncProgress?.status === 'syncing'}
                    className={`w-16 h-9 rounded-full transition-all relative ${offlineMode ? 'bg-brand-primary' : 'bg-slate-800'} ${syncProgress?.status === 'syncing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${offlineMode ? 'left-8' : 'left-1.5'} shadow-lg`} />
                  </button>
               </div>
             </div>

             <AnimatePresence>
               {syncProgress && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="mt-6 space-y-3 overflow-hidden text-center"
                 >
                   <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/10 rounded-md border border-brand-primary/20">
                          {syncProgress.status === 'syncing' ? (
                            <RefreshCw size={10} className="animate-spin text-brand-primary" />
                          ) : syncProgress.status === 'completed' ? (
                            <CheckCircle2 size={10} className="text-emerald-500" />
                          ) : (
                            <AlertCircle size={10} className="text-red-500" />
                          )}
                          <span className={`${syncProgress.status === 'completed' ? 'text-emerald-500' : 'text-brand-primary'}`}>
                            {syncProgress.status}
                          </span>
                        </div>
                        <span className="text-slate-500">
                          {syncProgress.current}/{syncProgress.total} Suras
                        </span>
                      </div>
                      <div className="text-brand-primary text-sm font-mono drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                        {Math.round((syncProgress.current / syncProgress.total) * 100)}%
                      </div>
                   </div>
                   <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                        className="h-full bg-gradient-to-r from-brand-primary/60 to-brand-primary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] relative"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_2s_linear_infinite]" />
                      </motion.div>
                   </div>
                   <div className="flex justify-between items-center px-1">
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                        {syncProgress.status === 'syncing' ? `Optimizing Sura ${syncProgress.current}...` : 'Sanctuary Synchronized'}
                     </p>
                     {cacheSize && (
                       <p className="text-[9px] text-brand-primary/60 font-black tracking-widest">
                         {cacheSize} DOWNLOADED
                       </p>
                     )}
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <AnimatePresence>
                {isOfflineManagerExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-black/20"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Offline Manager</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{Object.keys(downloadedSuras).length} Items Cached</p>
                      </div>
                      
                      <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                        {Object.entries(downloadedSuras).map(([key, data]) => {
                          const [num] = key.split('_');
                          const sura = surahList.find(s => s.number === parseInt(num));
                          return (
                            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-sm">
                                  {num}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white">{sura?.englishName || `Sura ${num}`}</p>
                                  <div className="flex items-center gap-3">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{data.ayahCount} Ayahs</p>
                                    <div className="w-1 h-1 bg-slate-700 rounded-full" />
                                    <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{new Date(data.timestamp).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => removeSura(key)}
                                className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                        {Object.keys(downloadedSuras).length === 0 && (
                          <div className="text-center py-10 space-y-3 opacity-30">
                            <WifiOff size={40} className="mx-auto" />
                            <p className="text-xs font-black uppercase tracking-widest">No Offline Data</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
           </div>

           {/* Version Info */}
           <div className="flex items-center justify-between p-6 group">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl text-slate-400 border border-white/5">
                  <Info size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Sanctuary Version</p>
                  <p className="text-xs text-slate-500">v1.5.0-purple • Sanctuary Release</p>
                </div>
             </div>
             <div className="px-3 py-1 bg-brand-primary/10 rounded-lg border border-brand-primary/20 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                Stable
             </div>
           </div>
        </div>
      </section>

      {/* Sanctuary Elite Subscription & Plan Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-3">
          <Sparkles size={14} /> Sanctuary Elite & Membership
        </h3>
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-purple-500/10 rounded-[2rem] border border-amber-500/20 overflow-hidden shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-brand-depth px-2 py-0.5 rounded-full">
                Sacred Tier
              </span>
              <h4 className="text-base font-black text-white uppercase tracking-tight">Sanctuary Elite VIP</h4>
            </div>
            <p className="text-xs text-slate-300">
              Manage your subscription, 4K Haramain Live streams, 365-day annual pass, and cancel or downgrade anytime.
            </p>
          </div>
          <button
            onClick={() => navigate('/premium')}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-brand-depth rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Manage Subscription <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Admin Command Console Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80 flex items-center gap-3">
          <Shield size={14} /> Sanctuary Super Admin Console
        </h3>
        <div className="bg-amber-500/5 rounded-[2rem] border border-amber-500/20 overflow-hidden shadow-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-black text-white uppercase tracking-tight">Admin & Governance Hub</h4>
            <p className="text-xs text-slate-400">Manage pilgrim deeds, grant Hasanat, broadcast Ummah announcements, and inspect Firestore entities.</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('app_navigate', { detail: { tab: 'admin' } }))}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Launch Admin Hub <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* AI & Gateway Configuration Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400/60 flex items-center gap-3">
          <Sparkles size={14} /> AI & Gateway Configuration
        </h3>
        <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl p-8 space-y-8">
          {/* Companion Key */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-4 bg-indigo-400 rounded-full" />
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Aliyah Companion Key</p>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              If you are running Sanctuary on a custom deployment (such as Netlify) or as an APK on mobile, the built-in server-side AI proxy is unavailable. Paste your free Google Gemini API Key here to run Aliyah completely client-side.
            </p>

            <div className="space-y-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={customGeminiKey || ''}
                onChange={(e) => saveGeminiKey(e.target.value)}
                className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-slate-100 placeholder:text-slate-600 text-sm focus:border-indigo-400/50 focus:outline-none transition-all selection:bg-indigo-500/30 font-mono"
              />
              <div className="flex justify-between items-center px-1">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-1"
                >
                  Get Free API Key <ChevronRight size={10} />
                </a>
                {customGeminiKey.trim() ? (
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} /> Saved locally
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-amber-500/60 tracking-wider">
                    Using hosted server by default
                  </span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Custom API Base URL */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1 h-4 bg-purple-400 rounded-full" />
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Sync API Gateway URL</p>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              For native mobile apps (APK/iOS) or offline sync testing, specify the absolute URL of the hosted Sanctuary backend server.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="https://your-deployment.run.app"
                value={customApiUrl || ''}
                onChange={(e) => saveApiUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 px-5 py-4 rounded-2xl text-slate-100 placeholder:text-slate-600 text-sm focus:border-purple-400/50 focus:outline-none transition-all selection:bg-purple-500/30 font-mono"
              />
              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] text-slate-500 font-bold">
                  Leave blank to use default auto-detection.
                </span>
                {customApiUrl.trim() ? (
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} /> Custom Gateway Active
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase text-purple-400/80 tracking-wider animate-pulse">
                    Auto-Detect Fallback Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logout Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/60 flex items-center gap-3">
          <LogOut size={14} /> Critical Actions
        </h3>
        <div className="bg-red-500/5 rounded-[2rem] border border-red-500/10 overflow-hidden shadow-2xl">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-between p-8 hover:bg-red-500/10 transition-all group"
          >
            <div className="flex items-center gap-5 text-left">
              <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform">
                <LogOut size={24} />
              </div>
              <div>
                <p className="font-black text-slate-200">Sign Out of Sanctuary</p>
                <p className="text-xs text-red-500/60 font-medium">Safe departure from your digital session</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>
      </section>

      <div className="pt-16 text-center space-y-4">
        <p className="text-sm text-slate-500 italic max-w-xs mx-auto">"Invite to the way of your Lord with wisdom and good instruction." (16:125)</p>
        <div className="h-[1px] w-12 bg-brand-primary/20 mx-auto" />
        <p className="text-[10px] text-brand-primary/30 font-mono uppercase tracking-[0.4em]">Digital Sanctuary © 2026</p>
      </div>
    </div>
  );
}
