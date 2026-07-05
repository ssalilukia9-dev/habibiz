import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService, AppNotification } from '../services/notificationService';
import { Bell, X, MessageSquare, ShieldCheck, Info, ChevronDown } from 'lucide-react';

export default function HeadsUpNotification() {
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  useEffect(() => {
    const handleNotification = (e: any) => {
      const notification = e.detail as AppNotification;
      setActiveNotification(notification);
      
      // Auto-dismiss after 6 seconds
      setTimeout(() => {
        setActiveNotification(prev => prev?.id === notification.id ? null : prev);
      }, 6000);
    };

    window.addEventListener('notification_received', handleNotification);
    return () => window.removeEventListener('notification_received', handleNotification);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'community': return <MessageSquare size={16} className="text-[#25D366]" />; // WhatsApp color proxy
      case 'prayer': return <ShieldCheck size={16} className="text-[#A855F7]" />;
      case 'system': return <Info size={16} className="text-blue-500" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  const getAppLabel = (type: string) => {
    switch (type) {
      case 'community': return 'Ummah Chat';
      case 'prayer': return 'Noor Al-Iman';
      case 'system': return 'Sanctuary System';
      default: return 'Sanctuary';
    }
  };

  if (!activeNotification) return null;

  return (
    <AnimatePresence>
      {activeNotification && (
        <div className="fixed top-2 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md glass-panel pointer-events-auto rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border-white/10 overflow-hidden bg-brand-sidebar/80 backdrop-blur-3xl"
          >
            <div className="p-5">
              {/* Native Android-style Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                     {getIcon(activeNotification.type)}
                   </div>
                   <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
                     {getAppLabel(activeNotification.type)} • Just now
                   </span>
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex gap-4 items-start pb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white leading-tight">
                    {activeNotification.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1 leading-relaxed">
                    {activeNotification.body}
                  </p>
                </div>
                
                <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-depth shadow-xl shadow-brand-primary/20 shrink-0 overflow-hidden">
                   <Bell size={24} />
                </div>
              </div>

              {/* In-app action bar */}
              <div className="flex gap-2">
                 <button 
                   onClick={() => setActiveNotification(null)}
                   className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                 >
                   Dismiss
                 </button>
                 <button 
                   onClick={() => {
                     if (activeNotification.actionUrl) {
                       window.location.hash = activeNotification.actionUrl;
                     }
                     setActiveNotification(null);
                   }}
                   className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-brand-secondary rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-secondary/20"
                 >
                   View Sanctuary
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
