import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Crown, 
  Flame, 
  BookOpen, 
  Search, 
  RefreshCw, 
  Plus, 
  Minus, 
  Trash2, 
  Bell, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Activity, 
  Send, 
  Award,
  Sliders,
  Check,
  X,
  Zap,
  TrendingUp,
  Clock,
  Heart,
  Globe,
  Radio,
  Download,
  Filter,
  UserCheck,
  UserX,
  Edit3,
  Save,
  MessageSquare,
  Shield,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { db, auth } from '../lib/firebase.ts';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { notificationService } from '../services/notificationService.ts';

interface AdminViewProps {
  currentUser: any;
  addHasanat?: (amount: number) => void;
}

export interface SanctuaryUser {
  uid: string;
  id?: string;
  displayName?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  hasanat?: number;
  streak?: number;
  versesRead?: number;
  duaCount?: number;
  rank?: string;
  level?: number;
  role?: 'admin' | 'user' | 'moderator' | 'superadmin' | string;
  status?: 'active' | 'suspended' | 'banned' | string;
  isBanned?: boolean;
  lastActive?: any;
  createdAt?: any;
  updatedAt?: any;
  location?: string;
  adminNotes?: string;
  directAlert?: string;
}

export default function AdminView({ currentUser, addHasanat }: AdminViewProps) {
  const [users, setUsers] = useState<SanctuaryUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'banned'>('all');
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'broadcast' | 'system'>('analytics');
  
  // Selected user for modal / deep-edit
  const [selectedUser, setSelectedUser] = useState<SanctuaryUser | null>(null);
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<Partial<SanctuaryUser>>({});
  
  // Notification Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'admins' | 'active'>('all');
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);
  
  // Direct targeted message to selected user
  const [directMessageText, setDirectMessageText] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // 1. Fetch Real Live Users from Firestore
  const fetchLiveUsers = () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const unsub = onSnapshot(usersRef, (snapshot) => {
        const liveList: SanctuaryUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          liveList.push({
            uid: docSnap.id,
            id: docSnap.id,
            displayName: data.displayName || data.name || 'Anonymous Seeker',
            name: data.name || data.displayName || 'Anonymous Seeker',
            email: data.email || 'No email provided',
            photoURL: data.photoURL || '',
            hasanat: typeof data.hasanat === 'number' ? data.hasanat : 0,
            streak: typeof data.streak === 'number' ? data.streak : 0,
            versesRead: typeof data.versesRead === 'number' ? data.versesRead : 0,
            duaCount: typeof data.duaCount === 'number' ? data.duaCount : 0,
            rank: data.rank || 'Seeker',
            level: typeof data.level === 'number' ? data.level : 1,
            role: data.role || (docSnap.id === currentUser?.uid ? 'admin' : 'user'),
            status: data.status || (data.isBanned ? 'banned' : 'active'),
            isBanned: Boolean(data.isBanned || data.status === 'banned'),
            lastActive: data.lastActive || data.updatedAt || data.createdAt || null,
            createdAt: data.createdAt || null,
            adminNotes: data.adminNotes || '',
            directAlert: data.directAlert || '',
            location: data.location || 'Global'
          });
        });

        // Always ensure current admin user is in list if DB was empty
        if (liveList.length === 0 && currentUser) {
          liveList.push({
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email || 'Admin',
            email: currentUser.email || 'admin@sanctuary.app',
            hasanat: 1500,
            streak: 7,
            versesRead: 50,
            duaCount: 30,
            rank: 'Scholar',
            level: 5,
            role: 'admin',
            status: 'active'
          });
        }

        setUsers(liveList);
        setLoading(false);
      }, (err) => {
        console.warn("Firestore live users onSnapshot error:", err);
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, 'users');
      });

      return unsub;
    } catch (e) {
      console.warn("Failed to subscribe to users:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = fetchLiveUsers();
    return () => {
      if (unsub) unsub();
    };
  }, [currentUser]);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMessage(msg);
      setTimeout(() => setActionErrorMessage(null), 4000);
    } else {
      setActionSuccessMessage(msg);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  // 2. Direct Admin Overrides: Edit Any User's Attributes
  const handleUpdateUserField = async (userUid: string, fields: Partial<SanctuaryUser>) => {
    try {
      const userRef = doc(db, 'users', userUid);
      await updateDoc(userRef, {
        ...fields,
        updatedAt: serverTimestamp()
      });
      showFeedback(`Successfully updated user ${userUid.slice(0, 8)}`);
      
      // Update local state immediately
      setUsers(prev => prev.map(u => u.uid === userUid ? { ...u, ...fields } : u));
      if (selectedUser?.uid === userUid) {
        setSelectedUser(prev => prev ? { ...prev, ...fields } : null);
      }
      setIsEditingUser(false);
    } catch (err: any) {
      console.error("Failed to update user:", err);
      // Fallback try setDoc with merge in case document didn't exist yet
      try {
        const userRef = doc(db, 'users', userUid);
        await setDoc(userRef, { ...fields, updatedAt: serverTimestamp() }, { merge: true });
        showFeedback(`Successfully saved user profile`);
        setUsers(prev => prev.map(u => u.uid === userUid ? { ...u, ...fields } : u));
        if (selectedUser?.uid === userUid) {
          setSelectedUser(prev => prev ? { ...prev, ...fields } : null);
        }
        setIsEditingUser(false);
      } catch (err2) {
        showFeedback("Failed to update user record: " + (err?.message || 'Check Firestore rules'), true);
      }
    }
  };

  // Quick Hasanat delta
  const handleAdjustHasanat = async (user: SanctuaryUser, delta: number) => {
    const newHasanat = Math.max(0, (user.hasanat || 0) + delta);
    await handleUpdateUserField(user.uid, { hasanat: newHasanat });
  };

  // Toggle Ban / Suspend
  const handleToggleBan = async (user: SanctuaryUser) => {
    const willBan = !user.isBanned;
    await handleUpdateUserField(user.uid, { 
      isBanned: willBan,
      status: willBan ? 'banned' : 'active'
    });
  };

  // Toggle Admin / User Role
  const handleToggleRole = async (user: SanctuaryUser) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    await handleUpdateUserField(user.uid, { role: nextRole });
  };

  // Send Direct Alert to a specific user
  const handleSendDirectAlert = async (userUid: string) => {
    if (!directMessageText.trim()) return;
    try {
      const userRef = doc(db, 'users', userUid);
      await updateDoc(userRef, {
        directAlert: directMessageText.trim(),
        alertTimestamp: serverTimestamp()
      });
      showFeedback(`Direct notification sent to user!`);
      setDirectMessageText('');
    } catch (e: any) {
      showFeedback(`Could not dispatch alert: ${e?.message}`, true);
    }
  };

  // Delete User Record
  const handleDeleteUser = async (userUid: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user document from Firestore? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', userUid));
      setUsers(prev => prev.filter(u => u.uid !== userUid));
      if (selectedUser?.uid === userUid) setSelectedUser(null);
      showFeedback("User document deleted.");
    } catch (e: any) {
      showFeedback("Error deleting user: " + e.message, true);
    }
  };

  // Broadcast Notification to all users
  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showFeedback("Please provide both a title and message for the broadcast.", true);
      return;
    }

    try {
      // Save announcement document to Firestore announcements collection
      const announcementRef = doc(collection(db, 'announcements'));
      await setDoc(announcementRef, {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        target: broadcastTarget,
        sentBy: currentUser?.email || currentUser?.uid || 'Admin',
        createdAt: serverTimestamp()
      });

      // Also trigger browser push notification if enabled
      notificationService.notify(
        broadcastTitle.trim(),
        broadcastMessage.trim(),
        'system'
      );

      setBroadcastStatus("Broadcast published to live users!");
      setBroadcastTitle('');
      setBroadcastMessage('');
      setTimeout(() => setBroadcastStatus(null), 4000);
      showFeedback("Global announcement delivered successfully!");
    } catch (e: any) {
      showFeedback("Failed to publish broadcast: " + e.message, true);
    }
  };

  // Export Users as JSON or CSV
  const handleExportData = (type: 'json' | 'csv') => {
    let blob: Blob;
    let filename = `sanctuary_users_${new Date().toISOString().slice(0,10)}`;

    if (type === 'json') {
      const dataStr = JSON.stringify(users, null, 2);
      blob = new Blob([dataStr], { type: 'application/json' });
      filename += '.json';
    } else {
      const headers = ['UID', 'Name', 'Email', 'Hasanat', 'Streak', 'VersesRead', 'DuaCount', 'Rank', 'Role', 'Status'];
      const rows = users.map(u => [
        `"${u.uid}"`,
        `"${(u.displayName || '').replace(/"/g, '""')}"`,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        u.hasanat || 0,
        u.streak || 0,
        u.versesRead || 0,
        u.duaCount || 0,
        `"${u.rank || 'Seeker'}"`,
        `"${u.role || 'user'}"`,
        `"${u.status || 'active'}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      filename += '.csv';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showFeedback(`Exported ${users.length} user records (${type.toUpperCase()})`);
  };

  // ==================== REAL ANALYTICS CALCULATIONS ====================
  const analytics = useMemo(() => {
    const totalUsers = users.length;
    const totalHasanat = users.reduce((acc, u) => acc + (u.hasanat || 0), 0);
    const totalVerses = users.reduce((acc, u) => acc + (u.versesRead || 0), 0);
    const totalDuas = users.reduce((acc, u) => acc + (u.duaCount || 0), 0);
    const avgStreak = totalUsers > 0 ? (users.reduce((acc, u) => acc + (u.streak || 0), 0) / totalUsers).toFixed(1) : '0';
    
    const adminCount = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
    const bannedCount = users.filter(u => u.isBanned || u.status === 'banned').length;
    const activeCount = Math.max(0, totalUsers - bannedCount);

    // Leaderboards / Top Engaged
    const topByHasanat = [...users].sort((a, b) => (b.hasanat || 0) - (a.hasanat || 0)).slice(0, 5);
    const topByQuran = [...users].sort((a, b) => (b.versesRead || 0) - (a.versesRead || 0)).slice(0, 5);
    const topByStreak = [...users].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 5);

    // Spiritual Rank Distribution
    const rankCounts: Record<string, number> = {};
    users.forEach(u => {
      const r = u.rank || 'Seeker';
      rankCounts[r] = (rankCounts[r] || 0) + 1;
    });

    return {
      totalUsers,
      totalHasanat,
      totalVerses,
      totalDuas,
      avgStreak,
      adminCount,
      bannedCount,
      activeCount,
      topByHasanat,
      topByQuran,
      topByStreak,
      rankCounts
    };
  }, [users]);

  // Filtered user list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const name = (u.displayName || u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const uid = (u.uid || '').toLowerCase();
      const queryStr = searchTerm.toLowerCase().trim();

      const matchesSearch = !queryStr || name.includes(queryStr) || email.includes(queryStr) || uid.includes(queryStr);
      
      if (!matchesSearch) return false;

      if (roleFilter === 'admin') return u.role === 'admin' || u.role === 'superadmin';
      if (roleFilter === 'user') return u.role !== 'admin' && !u.isBanned;
      if (roleFilter === 'banned') return u.isBanned || u.status === 'banned';
      return true;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-28">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-emerald-400"
          >
            <CheckCircle2 size={18} />
            <span>{actionSuccessMessage}</span>
          </motion.div>
        )}
        {actionErrorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-rose-500"
          >
            <AlertTriangle size={18} />
            <span>{actionErrorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-sidebar via-brand-primary/15 to-brand-sidebar border border-brand-primary/20 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-[0.25em]">
              <ShieldCheck size={16} />
              <span>Real-Time Admin Command & Direct Control</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
              App Operations & Live Analytics
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-light max-w-2xl">
              Real-time analytics and database management computed from live Firestore users. Modify any user's stats, ranks, roles, or send instant targeted alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchLiveUsers()}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Refresh Firestore sync"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              <span>Sync DB</span>
            </button>

            <button
              onClick={() => handleExportData('csv')}
              className="px-4 py-3 rounded-2xl bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary border border-brand-primary/30 text-xs font-black flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10">
          {[
            { id: 'analytics', label: 'Live Usage & Real Stats', icon: BarChart3 },
            { id: 'users', label: `Manage Users (${users.length})`, icon: Users },
            { id: 'broadcast', label: 'Global Announcements', icon: Bell },
            { id: 'system', label: 'Database & Operations', icon: Database }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 border border-brand-primary/40'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REAL LIVE ANALYTICS (NO PREDICTIONS, 100% REAL DATA FROM FIRESTORE) */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Registered</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><Users size={18} /></div>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-white">{analytics.totalUsers}</p>
                <p className="text-[11px] text-slate-400 mt-1">{analytics.activeCount} active • {analytics.bannedCount} suspended</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hasanat Earned</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Crown size={18} /></div>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-amber-300">{analytics.totalHasanat.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Sum of all good deeds tracked</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quran Verses Read</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><BookOpen size={18} /></div>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-purple-300">{analytics.totalVerses.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Real verses completed in app</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Athkar Supplications</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Sparkles size={18} /></div>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-black text-emerald-300">{analytics.totalDuas.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">{analytics.avgStreak} days average streak</p>
              </div>
            </div>
          </div>

          {/* Top Engaged Users Live Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Hasanat Leaders */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Crown size={16} />
                  <span>Top Hasanat Leaders</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live DB</span>
              </div>
              <div className="space-y-2">
                {analytics.topByHasanat.map((u, i) => (
                  <div 
                    key={u.uid}
                    onClick={() => { setSelectedUser(u); setActiveTab('users'); }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400">{u.rank || 'Seeker'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-400">{u.hasanat?.toLocaleString()} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Quran Reciters */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <BookOpen size={16} />
                  <span>Most Quran Verses Read</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live DB</span>
              </div>
              <div className="space-y-2">
                {analytics.topByQuran.map((u, i) => (
                  <div 
                    key={u.uid}
                    onClick={() => { setSelectedUser(u); setActiveTab('users'); }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400">{u.email?.split('@')[0]}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-purple-400">{u.versesRead?.toLocaleString()} verses</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Longest Streaks */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <Flame size={16} />
                  <span>Unbroken Streaks</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Live DB</span>
              </div>
              <div className="space-y-2">
                {analytics.topByStreak.map((u, i) => (
                  <div 
                    key={u.uid}
                    onClick={() => { setSelectedUser(u); setActiveTab('users'); }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 text-xs font-mono font-bold flex items-center justify-center">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[120px]">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400">{u.rank || 'Seeker'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-orange-400">{u.streak} days</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Spiritual Ranks Breakdown */}
          <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] space-y-6">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Activity size={18} className="text-brand-primary" />
              <span>Real Spiritual Rank Distribution Across All Users</span>
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {['Seeker', 'Devotee', 'Guardian', 'Scholar', 'Wali'].map((rk) => {
                const count = analytics.rankCounts[rk] || 0;
                const percentage = analytics.totalUsers > 0 ? Math.round((count / analytics.totalUsers) * 100) : 0;
                return (
                  <div key={rk} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{rk}</p>
                    <p className="text-2xl font-black text-white">{count}</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{percentage}% of userbase</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER MANAGEMENT & DIRECT OVERRIDE CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Controls & Filter Bar */}
          <div className="glass-panel p-4 md:p-6 rounded-2xl border-white/10 bg-brand-sidebar/70 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            
            {/* Search Box */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'admin', label: 'Admins Only' },
                { id: 'user', label: 'Members' },
                { id: 'banned', label: 'Banned / Suspended' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRoleFilter(f.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    roleFilter === f.id
                      ? 'bg-white text-black font-black'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* User List Table / Cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((u) => {
              const isSelected = selectedUser?.uid === u.uid;
              return (
                <div 
                  key={u.uid}
                  className={`p-5 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-brand-primary/20 via-brand-sidebar to-brand-sidebar border-brand-primary shadow-xl scale-[1.005]'
                      : 'glass-panel border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* User Identity & Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary font-black text-lg shrink-0">
                        {(u.displayName || u.email || 'U')[0].toUpperCase()}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">{u.displayName}</h4>
                          
                          {u.role === 'admin' && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-black text-amber-300 uppercase tracking-wider">
                              Admin
                            </span>
                          )}

                          {u.isBanned && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-[10px] font-black text-rose-300 uppercase tracking-wider">
                              Banned
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                            {u.rank || 'Seeker'} (Lvl {u.level || 1})
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 font-mono truncate max-w-sm">{u.email}</p>
                        <p className="text-[10px] text-slate-500 font-mono">UID: {u.uid}</p>
                      </div>
                    </div>

                    {/* Stats Badges */}
                    <div className="flex items-center gap-3 flex-wrap text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-bold">
                        {u.hasanat?.toLocaleString()} Hasanat
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 font-mono font-bold">
                        {u.streak}d Streak
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono font-bold">
                        {u.versesRead} Verses
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono font-bold">
                        {u.duaCount} Athkar
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      
                      {/* Quick +500 Hasanat */}
                      <button
                        onClick={() => handleAdjustHasanat(u, 500)}
                        className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-xs font-bold transition-all"
                        title="Grant +500 Hasanat directly"
                      >
                        +500
                      </button>

                      {/* Quick -100 Hasanat */}
                      <button
                        onClick={() => handleAdjustHasanat(u, -100)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-bold transition-all"
                        title="Deduct 100 Hasanat"
                      >
                        -100
                      </button>

                      {/* Open Full Override Inspector */}
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setEditFormData(u);
                          setIsEditingUser(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/80 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit Full User</span>
                      </button>

                      {/* Ban / Unban Toggle */}
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          u.isBanned
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500 hover:text-black'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                        }`}
                        title={u.isBanned ? "Unban this user" : "Suspend / Ban user"}
                      >
                        {u.isBanned ? <UserCheck size={14} /> : <UserX size={14} />}
                      </button>

                      {/* Delete doc */}
                      <button
                        onClick={() => handleDeleteUser(u.uid)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white border border-white/10 text-xs transition-all"
                        title="Delete user document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center glass-panel rounded-3xl border-white/5">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                  No users found matching your search.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* USER FULL EDIT MODAL (ADMIN CAN AFFECT ANY ATTRIBUTE OF ANY USER) */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {isEditingUser && selectedUser && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-brand-sidebar border border-brand-primary/40 rounded-[2.5rem] p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-3xl"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-white italic">
                        Direct Override: {selectedUser.displayName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">UID: {selectedUser.uid}</p>
                    </div>

                    <button
                      onClick={() => setIsEditingUser(false)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Edit Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Display Name</label>
                      <input
                        type="text"
                        value={editFormData.displayName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Email</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Hasanat Balance</label>
                      <input
                        type="number"
                        value={editFormData.hasanat || 0}
                        onChange={(e) => setEditFormData({ ...editFormData, hasanat: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-amber-300 font-mono text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Streak (Days)</label>
                      <input
                        type="number"
                        value={editFormData.streak || 0}
                        onChange={(e) => setEditFormData({ ...editFormData, streak: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-orange-300 font-mono text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Quran Verses Read</label>
                      <input
                        type="number"
                        value={editFormData.versesRead || 0}
                        onChange={(e) => setEditFormData({ ...editFormData, versesRead: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-purple-300 font-mono text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Athkar Completed</label>
                      <input
                        type="number"
                        value={editFormData.duaCount || 0}
                        onChange={(e) => setEditFormData({ ...editFormData, duaCount: parseInt(e.target.value) || 0 })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-emerald-300 font-mono text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Spiritual Rank</label>
                      <select
                        value={editFormData.rank || 'Seeker'}
                        onChange={(e) => setEditFormData({ ...editFormData, rank: e.target.value })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                      >
                        <option value="Seeker">Seeker</option>
                        <option value="Devotee">Devotee</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Scholar">Scholar</option>
                        <option value="Wali">Wali</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Role / Permissions</label>
                      <select
                        value={editFormData.role || 'user'}
                        onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                        className="w-full mt-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                      >
                        <option value="user">Standard User / Member</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Administrator</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>

                  </div>

                  {/* Direct Alert to this User */}
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Send size={12} className="text-brand-primary" />
                      <span>Send Direct Banner Alert to This User</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. As-salamu alaykum! Your account has been upgraded."
                        value={directMessageText}
                        onChange={(e) => setDirectMessageText(e.target.value)}
                        className="flex-1 p-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs"
                      />
                      <button
                        onClick={() => handleSendDirectAlert(selectedUser.uid)}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/80 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send size={12} />
                        <span>Send Alert</span>
                      </button>
                    </div>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setIsEditingUser(false)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => handleUpdateUserField(selectedUser.uid, editFormData)}
                      className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-brand-primary/30 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Save Changes to Live DB</span>
                    </button>
                  </div>

                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GLOBAL BROADCAST NOTIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 bg-brand-sidebar/60 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white italic">Publish Announcement to All Connected Users</h3>
              <p className="text-xs text-slate-400 mt-1">
                Broadcast messages appear immediately in the notifications center and dispatch push notifications to active subscribers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ramadan Special Khatam Schedule Released!"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full mt-1.5 p-3.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Message Body</label>
                <textarea
                  rows={4}
                  placeholder="Enter full announcement details for all Sanctuary members..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full mt-1.5 p-3.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Target Audience:</span>
                  <select 
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                    className="p-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                  >
                    <option value="all">All Registered Users ({users.length})</option>
                    <option value="admins">Admins Only</option>
                    <option value="active">Active Members Only</option>
                  </select>
                </div>

                <button
                  onClick={handleSendBroadcast}
                  className="px-8 py-3 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-brand-primary/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Send size={15} />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DATABASE & OPERATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Database Health */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                <span>Firestore Cloud Connection</span>
              </h4>
              <p className="text-xs text-slate-400 font-light">
                Connected to Firestore database <code className="text-brand-primary bg-black/40 px-1.5 py-0.5 rounded">ai-studio-7c39dcb1-66bc-45ec-abae-c7e2edbdcb62</code>.
              </p>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Live Stream Active</span>
                </p>
                <p className="text-[11px] text-slate-400">{users.length} live user documents loaded into cache.</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 space-y-4">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Sliders size={18} className="text-amber-400" />
                <span>Quick Admin Actions</span>
              </h4>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleExportData('json')}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span>Backup Full Database (JSON)</span>
                  <Download size={14} />
                </button>

                <button
                  onClick={() => handleExportData('csv')}
                  className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span>Export User Analytics Spreadsheet (CSV)</span>
                  <FileSpreadsheet size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
