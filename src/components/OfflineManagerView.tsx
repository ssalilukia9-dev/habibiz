import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Trash2, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  HardDrive,
  RefreshCcw,
  Volume2,
  X,
  AlertCircle
} from 'lucide-react';
import { RECITERS } from '../constants.ts';
import { offlineService, SyncProgress } from '../services/offlineService';
import { notificationService } from '../services/notificationService';

interface OfflineManagerViewProps {
  selectedReciter: number;
}

export default function OfflineManagerView({ selectedReciter }: OfflineManagerViewProps) {
  const [cacheSize, setCacheSize] = useState('0 KB');
  const [downloadedSurahs, setDownloadedSurahs] = useState<Record<string, any>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncType, setSyncType] = useState<'text' | 'audio'>('text');
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [offlineMode, setOfflineMode] = useState(() => localStorage.getItem('offline-mode') === 'true');

  const activeReciter = RECITERS.find(r => r.id === selectedReciter);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const size = await offlineService.getCacheSize();
    const metadata = await offlineService.getAllDownloadedSurahs();
    setCacheSize(size);
    setDownloadedSurahs(metadata);
  };

  const toggleOfflineMode = () => {
    const newVal = !offlineMode;
    setOfflineMode(newVal);
    localStorage.setItem('offline-mode', newVal.toString());
    notificationService.notify(
      newVal ? 'Offline Mode Active' : 'Online Mode',
      newVal ? 'The app will prioritize cached data.' : 'The app will fetch live data when available.',
      'system'
    );
  };

  const handleFullSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncType('text');
    
    await offlineService.syncFullQuran((progress) => {
      setSyncProgress(progress);
      if (progress.status === 'completed') {
        setIsSyncing(false);
        loadStatus();
        notificationService.notify('Sync Complete', 'The entire Quran text is now offline.', 'system');
      } else if (progress.status === 'error') {
        setIsSyncing(false);
      }
    });
  };

  const handleAudioSync = async () => {
    if (isSyncing) return;
    if (!confirm(`Warning: This will download audio for all 114 Surahs for ${activeReciter?.name}. Estimated size: 1.2GB. Continue?`)) return;
    
    setIsSyncing(true);
    setSyncType('audio');
    
    await offlineService.syncFullReciter(selectedReciter, (progress) => {
      setSyncProgress(progress);
      if (progress.status === 'completed') {
        setIsSyncing(false);
        loadStatus();
        notificationService.notify('Audio cached', `${activeReciter?.name}'s recitation is now fully offline.`, 'system');
      } else if (progress.status === 'error') {
        setIsSyncing(false);
      }
    });
  };

  const clearCache = async () => {
    if (confirm('Are you sure you want to delete all offline Quran data and audio?')) {
      await offlineService.clearCache();
      loadStatus();
      notificationService.notify('Cache Cleared', 'All offline data has been removed.', 'system');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-brand-sidebar/40 p-8 rounded-[2.5rem] border border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                <HardDrive size={20} />
             </div>
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Storage & Offline</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">Manage your sacred downloads and offline access.</p>
        </div>

        <button 
          onClick={toggleOfflineMode}
          className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${
            offlineMode 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-lg shadow-emerald-500/10' 
            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
          }`}
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Offline Protocol</span>
            <span className="text-xs font-bold">{offlineMode ? 'Mandatory Cache' : 'Dynamic Live'}</span>
          </div>
          {offlineMode ? <WifiOff size={24} /> : <Wifi size={24} />}
        </button>
      </header>

      {/* Sync Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Median / Mobile Status */}
        {((window as any).median || (window as any).gonative) && (
          <div className="col-span-full bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                   <ShieldCheck size={28} />
                </div>
                <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-tight">Native Mobile Protocol Active</h3>
                   <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest leading-none mt-1">High Priority Notifications & Wake Screen Enabled</p>
                </div>
             </div>
             <div className="hidden sm:block text-[8px] font-black text-emerald-500/40 uppercase tracking-[0.2em] italic">
                Secured by Median Bridge
             </div>
          </div>
        )}

        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-brand-primary pointer-events-none">
              <RefreshCcw size={80} />
           </div>
           
           <div className="space-y-1">
             <h3 className="text-lg font-bold text-white tracking-tight">Full Quran Sync</h3>
             <p className="text-xs text-slate-400 font-medium">Download text and basic metadata for all 114 Surahs.</p>
           </div>

           <div className="flex flex-col gap-3">
             {isSyncing ? (
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div className="flex items-center gap-2 text-brand-primary">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest">
                          {syncType === 'text' ? `Syncing Text ${syncProgress?.current}/114` : `Syncing Audio ${syncProgress?.current}/114`}
                        </span>
                     </div>
                     <span className="text-sm font-bold text-white">{Math.round((syncProgress?.current || 0) / 114 * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${(syncProgress?.current || 0) / 114 * 100}%` }}
                       className="h-full bg-brand-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                     />
                  </div>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button 
                   onClick={handleFullSync}
                   className="flex-1 bg-white/5 border border-white/10 text-slate-300 font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all"
                 >
                   Sync Text Only
                 </button>
                 <button 
                   onClick={handleAudioSync}
                   className="flex-1 bg-brand-primary text-brand-depth font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/20 flex flex-col items-center justify-center leading-tight"
                 >
                   <span>Download All Audio</span>
                   <span className="text-[8px] opacity-70">For {activeReciter?.name.split(' ').pop()}</span>
                 </button>
               </div>
             )}
           </div>

           <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <AlertCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                Note: This syncs text data and Sahih International translation. Audio must be downloaded per Surah from the reader view to manage storage effectively.
              </p>
           </div>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between">
           <div className="space-y-4">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Sanctuary Data</p>
                    <h3 className="text-3xl font-black text-white italic">{cacheSize}</h3>
                 </div>
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                    <HardDrive size={24} />
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Recitation Cache</span>
                    <span className="text-brand-primary">{Object.keys(downloadedSurahs).filter(k => k.includes('_')).length} Surahs</span>
                 </div>
                 <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-primary/40 w-1/3" />
                 </div>
              </div>
           </div>

           <button 
             onClick={clearCache}
             className="w-full py-4 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/10 rounded-xl transition-all border border-rose-500/20"
           >
             Flush Offline Storage
           </button>
        </div>
      </div>

      {/* Downloaded Surahs List */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary">
              <CheckCircle2 size={16} />
           </div>
           <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Downloaded Content</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           {Object.keys(downloadedSurahs).length === 0 ? (
             <div className="col-span-full py-12 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                <Download size={32} className="mx-auto mb-4 text-slate-600 opacity-20" />
                <p className="text-slate-500 text-sm font-medium">No surahs downloaded yet.</p>
             </div>
           ) : (
             Object.entries(downloadedSurahs).map(([key, meta]: [string, any]) => {
               const [surahNum, reciterId] = key.split('_');
               const reciter = RECITERS.find(r => r.id === Number(reciterId));
               
               return (
                 <div key={key} className="bg-white/5 border border-white/5 p-5 rounded-2xl hover:border-brand-primary/20 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-brand-depth text-[10px] font-black">
                          {surahNum}
                       </div>
                       {meta.isFullyCached ? (
                         <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full">
                            <ShieldCheck size={10} /> Fully Offline
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-full">
                            <AlertCircle size={10} /> Partial
                         </div>
                       )}
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reciter</p>
                       <p className="text-sm font-bold text-white truncate">{reciter?.name || 'Text only'}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                       <span>{new Date(meta.timestamp).toLocaleDateString()}</span>
                       <span>{meta.ayahCount} Ayahs</span>
                    </div>
                 </div>
               );
             })
           )}
        </div>
      </section>
    </div>
  );
}
