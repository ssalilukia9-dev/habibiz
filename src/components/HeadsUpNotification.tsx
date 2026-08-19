import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '../services/notificationService.ts';
import { Bell, X, MessageSquare, ShieldCheck, Info, Sparkles, ArrowRight, Clock } from 'lucide-react';

export default function HeadsUpNotification() {
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNotification = (e: any) => {
      const notification = e.detail as AppNotification;
      if (!notification || !notification.title) return;
      
      setActiveNotification(notification);
      
      // Auto-dismiss smoothly after 5.5 seconds
      const timer = setTimeout(() => {
        setActiveNotification(prev => prev?.id === notification.id ? null : prev);
      }, 5500);

      return () => clearTimeout(timer);
    };

    window.addEventListener('notification_received', handleNotification);
    return () => window.removeEventListener('notification_received', handleNotification);
  }, []);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'community': return <MessageSquare size={16} className="text-emerald-400" />;
      case 'prayer': return <Clock size={16} className="text-amber-400" />;
      case 'system': return <Sparkles size={16} className="text-brand-primary" />;
      default: return <Bell size={16} className="text-brand-primary" />;
    }
  };

  const getAppLabel = (type?: string) => {
    switch (type) {
      case 'community': return 'Ummah Hub';
      case 'prayer': return 'Prayer Reminder';
      case 'system': return 'Sanctuary OS';
      default: return 'Sanctuary Signal';
    }
  };

  const handleAction = () => {
    if (activeNotification?.actionUrl) {
      const url = activeNotification.actionUrl.startsWith('#')
        ? `/${activeNotification.actionUrl.substring(1)}`
        : activeNotification.actionUrl;
      navigate(url);
    }
    setActiveNotification(null);
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <div className="fixed top-3 md:top-4 left-0 right-0 z-[999999] flex justify-center px-3 md:px-4 pointer-events-none">
          <motion.div
            initial={{ y: -80, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="w-full max-w-md pointer-events-auto bg-brand-sidebar/95 backdrop-blur-2xl border border-brand-primary/35 rounded-[1.8rem] md:rounded-[2.2rem] p-3.5 md:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] relative overflow-hidden"
          >
            {/* Top subtle highlight shimmer */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent" />

            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-brand-primary/15 border border-brand-primary/25 flex items-center justify-center shrink-0 shadow-md shadow-brand-primary/10">
                {getIcon(activeNotification.type)}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 pr-1 cursor-pointer" onClick={handleAction}>
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">
                    {getAppLabel(activeNotification.type)}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Now</span>
                </div>
                <h4 className="text-xs md:text-sm font-black text-white leading-tight truncate">
                  {activeNotification.title}
                </h4>
                <p className="text-[11px] md:text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed mt-0.5">
                  {activeNotification.body}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveNotification(null);
                }}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>

            {/* Quick action bar if actionUrl is present */}
            {activeNotification.actionUrl && (
              <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveNotification(null)}
                  className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleAction}
                  className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-brand-depth bg-brand-primary hover:opacity-95 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowRight size={11} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
