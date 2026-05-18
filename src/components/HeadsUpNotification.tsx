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
            className="w-full max-w-md bg-white pointer-events-auto rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/5 overflow-hidden"
          >
            <div className="p-4 bg-white">
              {/* Native Android-style Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                     {getIcon(activeNotification.type)}
                   </div>
                   <span className="text-[11px] font-medium text-slate-500 tracking-tight">
                     {getAppLabel(activeNotification.type)} • Just now
                   </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[10px] font-bold">1</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex gap-4 items-start pb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                    {activeNotification.title}
                  </h4>
                  <p className="text-[12px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                    {activeNotification.body}
                  </p>
                </div>
                
                {/* Visual indicator (DiceBear proxy for user avatar if it was a chat) */}
                <div className="w-10 h-10 rounded-2xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                   <Bell size={20} className="text-slate-300" />
                </div>
              </div>
            </div>

            {/* In-app action bar */}
            <div className="flex border-t border-slate-100 divide-x divide-slate-100">
               <button 
                 onClick={() => setActiveNotification(null)}
                 className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors"
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
                 className="flex-1 py-3 text-[11px] font-black uppercase tracking-widest text-[#A855F7] hover:bg-purple-50 transition-colors"
               >
                 Review
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
