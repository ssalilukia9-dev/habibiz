
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Trash2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Users, 
  CheckCircle2,
  Trash
} from 'lucide-react';
import { notificationService, AppNotification } from '../services/notificationService';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = () => {
    const list = notificationService.getNotifications();
    setNotifications([...list]);
    setUnreadCount(list.filter(n => !n.read).length);
  };

  useEffect(() => {
    refreshNotifications();

    const handleUpdate = () => refreshNotifications();
    window.addEventListener('notification_received', handleUpdate);
    window.addEventListener('notification_updated', handleUpdate);

    return () => {
      window.removeEventListener('notification_received', handleUpdate);
      window.removeEventListener('notification_updated', handleUpdate);
    };
  }, []);

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'prayer': return <Clock size={16} className="text-brand-primary" />;
      case 'hadith': return <BookOpen size={16} className="text-amber-500" />;
      case 'system': return <Sparkles size={16} className="text-emerald-500" />;
      case 'community': return <Users size={16} className="text-blue-500" />;
      default: return <Bell size={16} />;
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications?')) {
      notificationService.clearAll();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white/5 rounded-xl border border-white/5 text-slate-400 hover:text-brand-primary transition-all group"
      >
        <Bell size={20} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-primary text-brand-depth text-[10px] font-black rounded-full flex items-center justify-center border-2 border-brand-depth">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed inset-x-4 top-24 md:absolute md:inset-auto md:right-0 md:top-full mt-4 w-auto md:w-96 bg-brand-depth/98 backdrop-blur-3xl rounded-[2.5rem] border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.8)] z-[9999] overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Bell size={14} className="text-brand-primary" /> Notifications
                </h3>
                <div className="flex gap-4 items-center">
                  <button 
                    onClick={() => {
                      navigate('/notifications');
                      setIsOpen(false);
                    }}
                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                  >
                    View All
                  </button>
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"
                      title="Clear All"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-white md:hidden"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-12 px-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-600">
                      <Bell size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-400">All Quiet in the Sanctuary</p>
                      <p className="text-[10px] text-slate-600">We'll alert you for prayers and updates</p>
                    </div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => notificationService.markAsRead(n.id)}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-all cursor-pointer group relative ${!n.read ? 'bg-brand-primary/[0.02]' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-white/5 ${!n.read ? 'bg-brand-primary/10' : 'bg-white/5'}`}>
                          {getTypeIcon(n.type)}
                        </div>
                        <div className="space-y-1 pr-4">
                          <p className={`text-xs font-bold leading-tight ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                            {n.body}
                          </p>
                          <p className="text-[9px] text-slate-600 font-medium">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {!n.read && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && unreadCount > 0 && (
                <div className="p-3 bg-brand-primary/10 border-t border-brand-primary/10 flex justify-center">
                   <button 
                    onClick={() => {
                      notifications.forEach(n => !n.read && notificationService.markAsRead(n.id));
                    }}
                    className="text-[9px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                   >
                     <CheckCircle2 size={10} /> Mark all as read
                   </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
