import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  WifiOff, 
  Wifi, 
  HardDrive, 
  CloudOff, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Info,
  ArrowRight,
  Database,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OfflineStatusIndicatorProps {
  compact?: boolean;
}

export default function OfflineStatusIndicator({ compact = false }: OfflineStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isOfflineModeSetting, setIsOfflineModeSetting] = useState<boolean>(() => {
    return localStorage.getItem('offline-mode') === 'true';
  });
  const [justReconnected, setJustReconnected] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  const navigate = useNavigate();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        setJustReconnected(false);
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    const handleStorageChange = () => {
      setIsOfflineModeSetting(localStorage.getItem('offline-mode') === 'true');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('offline_mode_toggled', handleStorageChange);

    // Periodic check for local storage settings & connectivity
    const interval = setInterval(() => {
      if (typeof navigator !== 'undefined') {
        const currentOnline = navigator.onLine;
        if (currentOnline !== isOnline) {
          setIsOnline(currentOnline);
          if (currentOnline) {
            setJustReconnected(true);
            setTimeout(() => setJustReconnected(false), 5000);
          }
        }
      }
      setIsOfflineModeSetting(localStorage.getItem('offline-mode') === 'true');
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('offline_mode_toggled', handleStorageChange);
      clearInterval(interval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [isOnline]);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    try {
      // Test connectivity with a fast ping
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`/api/health?t=${Date.now()}`, { 
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        setTestResult('success');
        setIsOnline(true);
      } else {
        setTestResult('failed');
      }
    } catch {
      setTestResult('failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const isOfflineActive = !isOnline || isOfflineModeSetting;

  // Don't render anything if connected and not just reconnected
  if (!isOfflineActive && !justReconnected) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {/* RECONNECTED TOAST / PILL */}
        {justReconnected && !isOfflineActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-500/10 cursor-default"
          >
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className={compact ? "hidden sm:inline" : ""}>Online · Synced</span>
            {compact && <span className="sm:hidden">Online</span>}
          </motion.div>
        )}

        {/* OFFLINE-FIRST BADGE IN TOP HEADER */}
        {isOfflineActive && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            onClick={() => setShowDetailsModal(true)}
            className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all cursor-pointer active:scale-95"
            title="App is operating in Offline-First mode. Progress is safely cached locally."
          >
            {/* Animated Pulsing Dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>

            <WifiOff size={12} className="text-amber-400 shrink-0" />
            
            <span className={compact ? "hidden sm:inline" : ""}>
              Offline-First
            </span>
            {compact && <span className="sm:hidden">Offline</span>}

            {/* Subtle Local Caching Indicator Badge */}
            <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-mono text-amber-300/80 bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-400/20 lowercase">
              cached locally
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* DETAILED OFFLINE-FIRST STATUS MODAL */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-brand-sidebar border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden space-y-5"
            >
              {/* Background ambient accent */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                    <CloudOff size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white tracking-tight">
                        Offline-First Mode
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {isOfflineModeSetting 
                        ? 'Manual Offline Mode enabled in Settings' 
                        : 'No internet connection detected'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <HardDrive size={14} className="text-amber-400" />
                  <span>Progress Safely Cached Locally</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  All your worship activities — including <strong className="text-white">Hasanaat scores</strong>, <strong className="text-white">Prayer completions</strong>, <strong className="text-white">Adhkar counts</strong>, <strong className="text-white">Quran reading marks</strong>, and <strong className="text-white">Gratitude logs</strong> — are safely preserved in local browser storage.
                </p>
              </div>

              {/* Features Working Offline List */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Active Offline Features
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Quran & Translations</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Adhkar & Tasbih</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Prayer Calculations</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-slate-300">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Daily Shukr Journal</span>
                  </div>
                </div>
              </div>

              {/* Cloud Sync Assurance */}
              <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-white/5 p-3 rounded-2xl border border-white/5">
                <ShieldCheck size={16} className="text-brand-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  When you regain internet connection, Sanctuary OS will automatically sync your local progress seamlessly with the cloud.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isTestingConnection ? "animate-spin text-brand-primary" : "text-slate-400"} />
                    <span>{isTestingConnection ? "Testing Connection..." : "Check Connection"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailsModal(false);
                      navigate('/settings');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-brand-primary/15 hover:bg-brand-primary/25 border border-brand-primary/30 text-brand-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Offline Hub</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* Test Result Message */}
                {testResult === 'success' && (
                  <p className="text-[11px] font-bold text-emerald-400 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 size={13} /> Connection verified! App is online.
                  </p>
                )}
                {testResult === 'failed' && (
                  <p className="text-[11px] font-bold text-amber-400 text-center flex items-center justify-center gap-1">
                    <CloudOff size={13} /> Still offline. Progress continues to be saved locally.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
