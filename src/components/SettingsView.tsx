import { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Bell, Shield, Info, Database, LogOut, ArrowRight, ChevronRight, Sparkles, MessageSquare, RefreshCw, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { LANGUAGES } from '../constants.ts';
import { notificationService } from '../services/notificationService';
import { offlineService, SyncProgress } from '../services/offlineService';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  language: string;
  setLanguage: (val: string) => void;
}

export default function SettingsView({ darkMode, setDarkMode, onLogout, language, setLanguage }: SettingsViewProps) {
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

  const [isRemindersExpanded, setIsRemindersExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem('prayer-reminders', JSON.stringify(reminders));
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

      {/* Appearance Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
          <Moon size={14} /> Global Appearance
        </h3>
        <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-2xl text-brand-primary border border-white/5">
                {darkMode ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <p className="font-bold text-slate-200">Dark Sanctuary Mode</p>
                <p className="text-xs text-slate-500">Optimized for night-time reflection</p>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`w-16 h-9 rounded-full transition-all relative ${darkMode ? 'bg-brand-primary' : 'bg-slate-800'}`}
            >
              <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all ${darkMode ? 'left-8' : 'left-1.5'} shadow-lg`} />
            </button>
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
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary/60 flex items-center gap-3">
          <Bell size={14} /> Notification Sanctuary
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
                  <button 
                    onClick={clearCacheManual}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="Clear Cache"
                  >
                    <RefreshCw size={16} />
                  </button>
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
           </div>

           {/* Version Info */}
           <div className="flex items-center justify-between p-6 group">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-white/5 rounded-2xl text-slate-400 border border-white/5">
                  <Info size={22} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">Habibi AI Version</p>
                  <p className="text-xs text-slate-500">v1.5.0-purple • Sanctuary Release</p>
                </div>
             </div>
             <div className="px-3 py-1 bg-brand-primary/10 rounded-lg border border-brand-primary/20 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                Stable
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
