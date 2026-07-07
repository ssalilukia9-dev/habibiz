import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Trash2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Users, 
  Search,
  MoreVertical,
  CheckCheck,
  ChevronRight,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { notificationService, AppNotification } from '../services/notificationService';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const refreshNotifications = () => {
    const list = notificationService.getNotifications();
    setNotifications([...list]);
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
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
      case 'prayer': return <Clock size={18} className="text-brand-primary" />;
      case 'hadith': return <BookOpen size={18} className="text-amber-500" />;
      case 'system': return <Sparkles size={18} className="text-emerald-500" />;
      case 'community': return <Users size={18} className="text-blue-500" />;
      default: return <Bell size={18} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !n.read) || 
                         (filter === 'chat' && n.type === 'community');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Native Setup Banner */}
      {permissionStatus !== 'granted' && (
        <div className="mx-4 bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-500/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
               <AlertTriangle size={32} />
            </div>
            <div className="space-y-1">
               <h3 className="text-lg font-black text-white uppercase tracking-tight italic">System Signals Disabled</h3>
               <p className="text-sm text-amber-500/80 font-medium">Native push and lock-screen alerts require your permission to wake the device.</p>
            </div>
          </div>
          <button 
            onClick={handleRequestPermission}
            className="w-full md:w-auto px-8 py-4 bg-amber-500 text-brand-depth font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
          >
            Enable Native Alerts
          </button>
        </div>
      )}

      {permissionStatus === 'granted' && (
        <div className="mx-4 bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 text-emerald-500 rotate-12 transition-transform group-hover:scale-110">
            <ShieldCheck size={120} />
          </div>
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
               <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
               <h3 className="text-lg font-black text-white uppercase tracking-tight italic">High Priority Protected</h3>
               <p className="text-sm text-emerald-500/80 font-medium">Sacred signals are authorized for lock-screen and background delivery.</p>
            </div>
          </div>
          {((window as any).median || (window as any).gonative) && (
            <div className="px-5 py-2 bg-emerald-500 border border-emerald-400 text-brand-depth font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/30">
              Native Bridge Optimized
            </div>
          )}
        </div>
      )}

      {/* OneSignal Status Banner */}
      <div className="mx-4 bg-purple-500/10 border border-purple-500/20 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-xl shadow-purple-500/5">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400">
            <Zap size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white uppercase tracking-tight italic flex items-center gap-3">
              OneSignal Web Push
              {import.meta.env.VITE_ONESIGNAL_APP_ID ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase animate-pulse">
                  Active
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
                  Simulated
                </span>
              )}
            </h3>
            <p className="text-sm text-purple-300/80 font-medium">
              {import.meta.env.VITE_ONESIGNAL_APP_ID 
                ? "Your browser is successfully integrated with our cloud-to-device push gateway."
                : "Add VITE_ONESIGNAL_APP_ID in your env config to enable deep browser background alerts."}
            </p>
          </div>
        </div>
        {import.meta.env.VITE_ONESIGNAL_APP_ID ? (
          <button 
            onClick={handleRequestPermission}
            className="w-full md:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-brand-depth font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            Link / Subscribe
          </button>
        ) : (
          <div className="px-4 py-2 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">
            Local Push Active
          </div>
        )}
      </div>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            Sanctuary Notifications
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Your spiritual timeline and community updates</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              notificationService.notify(
                'Sacred Signal Test', 
                'This is how you will receive divine reminders and community updates. Peace be upon you.', 
                'system'
              );
            }}
            className="px-6 py-3 bg-brand-primary text-brand-depth rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/30"
          >
            Test Signals
          </button>
          <button 
            onClick={() => {
              if (confirm('Permanently clear all notification history?')) notificationService.clearAll();
            }}
            className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all"
            title="Clear All History"
          >
            <Trash2 size={20} />
          </button>
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Filter Tabs - WhatsApp Style */}
      <div className="flex gap-2 px-4 overflow-x-auto pb-2 scrollbar-hide">
        {(['all', 'unread', 'chat'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === tab 
              ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white/[0.02] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 px-12 text-center"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-slate-700 mb-6">
                <Bell size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Peace and Quiet</h3>
              <p className="text-sm text-slate-600 mt-2">No notifications found matching your current view.</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredNotifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={() => notificationService.markAsRead(n.id)}
                  className={`relative p-6 md:p-8 flex gap-6 hover:bg-white/[0.05] transition-all cursor-pointer group ${!n.read ? 'bg-brand-primary/[0.01]' : ''}`}
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                    !n.read ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary shadow-lg shadow-brand-primary/10' : 'bg-white/5 border-white/5 text-slate-500'
                  }`}>
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-2 relative pr-12">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-black tracking-tight flex items-center gap-2 ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                        {n.title}
                        {!n.read && <span className="w-1.5 h-1.5 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed line-clamp-2 ${!n.read ? 'text-slate-300' : 'text-slate-500'}`}>
                      {n.body}
                    </p>
                    
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
                        Arrived {new Date(n.timestamp).toLocaleDateString()}
                      </span>
                      {n.read && (
                        <div className="flex items-center gap-1 text-brand-primary">
                          <CheckCheck size={12} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Read</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    <ChevronRight size={20} className="text-brand-primary" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-8 py-10 glass-panel rounded-[2.5rem] border-brand-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
            <Filter size={20} />
          </div>
          <div>
            <h5 className="font-bold text-white">Smart Grouping</h5>
            <p className="text-xs text-slate-500 italic">Conversations from community are highlighted separately.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            notifications.forEach(n => !n.read && notificationService.markAsRead(n.id));
          }}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-brand-primary uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Mark Everything as Read
        </button>
      </div>
    </div>
  );
}
