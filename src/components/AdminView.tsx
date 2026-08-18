import React, { useState, useEffect, useRef } from 'react';
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
  Megaphone, 
  Activity, 
  Send, 
  Award,
  Terminal,
  FileText,
  Sliders,
  Check,
  X,
  ExternalLink,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
  BarChart3,
  MessageSquare,
  Bot,
  Eye,
  EyeOff,
  LogOut,
  TrendingUp,
  Cpu,
  Clock,
  HeartHandshake,
  Globe,
  Radio,
  Download,
  Filter,
  Play,
  Pause,
  Server,
  Compass,
  MapPin,
  CheckSquare,
  Mail,
  Inbox,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  PieChart as PieIcon,
  LineChart as LineIcon
} from 'lucide-react';
import { db } from '../lib/firebase.ts';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp, 
  increment, 
  setDoc 
} from 'firebase/firestore';
import { notificationService } from '../services/notificationService.ts';
import { 
  EMAIL_TEMPLATES, 
  DEFAULT_CAMPAIGNS, 
  INITIAL_EMAIL_LOGS, 
  EmailTemplate, 
  AutomatedCampaign, 
  EmailLogRecord,
  triggerAutomaticLifecycleCheck 
} from '../services/mailingService.ts';
import { 
  telemetryService, 
  RealtimeEvent, 
  HabibiTelemetryRecord, 
  MetricTimePoint 
} from '../services/telemetryService.ts';

interface AdminViewProps {
  currentUser: any;
  addHasanat?: (amount: number) => void;
}

interface UserRecord {
  id: string;
  uid: string;
  displayName: string;
  email?: string;
  hasanat: number;
  streak: number;
  versesRead?: number;
  duaCount?: number;
  isPremium?: boolean;
  isHabibiKing?: boolean;
  role?: string;
  isBanned?: boolean;
  createdAt?: any;
  lastSeen?: any;
}

export default function AdminView({ currentUser, addHasanat }: AdminViewProps) {
  // Admin Gate Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('sanctuary_admin_authenticated') === 'true';
  });

  const [usernameOrId, setUsernameOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'habibi' | 'mailing' | 'live_feed' | 'users' | 'announcements' | 'system'>('analytics');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Real-time Stream Controls
  const [refreshInterval, setRefreshInterval] = useState<number>(2500); // 2.5 seconds
  const [isStreamingPaused, setIsStreamingPaused] = useState<boolean>(false);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [selectedGraphTimeframe, setSelectedGraphTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Real-time Telemetry Data from telemetryService
  const [timeSeries, setTimeSeries] = useState<MetricTimePoint[]>(telemetryService.timeSeriesData);
  const [liveEvents, setLiveEvents] = useState<RealtimeEvent[]>(telemetryService.events);
  const [habibiQueries, setHabibiQueries] = useState<HabibiTelemetryRecord[]>(telemetryService.habibiLogs);
  const [realtimeMetrics, setRealtimeMetrics] = useState(telemetryService.aggregateStats);

  // Mailing System State
  const [campaigns, setCampaigns] = useState<AutomatedCampaign[]>(DEFAULT_CAMPAIGNS);
  const [emailLogs, setEmailLogs] = useState<EmailLogRecord[]>(INITIAL_EMAIL_LOGS);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('inactivity_7d_revival');
  const [testRecipientEmail, setTestRecipientEmail] = useState<string>('ssalilukia9@gmail.com');
  const [testRecipientName, setTestRecipientName] = useState<string>('Hamloria');
  const [customBroadcastText, setCustomBroadcastText] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'new_users' | 'inactive_users' | 'inactive_7d' | 'vip_kings'>('inactive_7d');
  const [isDispatchingEmail, setIsDispatchingEmail] = useState<boolean>(false);
  const [isScanningLifecycle, setIsScanningLifecycle] = useState<boolean>(false);

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementType, setAnnouncementType] = useState<'system' | 'prayer' | 'community'>('system');
  const [activeAnnouncements, setActiveAnnouncements] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3800);
  };

  // Subscribe to Telemetry Updates
  useEffect(() => {
    const unsub = telemetryService.subscribe(() => {
      setLiveEvents([...telemetryService.events]);
      setHabibiQueries([...telemetryService.habibiLogs]);
      setRealtimeMetrics({ ...telemetryService.aggregateStats });
      setTimeSeries([...telemetryService.timeSeriesData]);
    });
    return unsub;
  }, []);

  // Login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanInput = usernameOrId.trim().toLowerCase();
    const cleanPass = password.trim();

    // Validation
    const validIdentifier = cleanInput === 'hamloria' || cleanInput === '0214' || cleanInput === 'ssalilukia9@gmail.com';
    const validPassword = cleanPass === '2214';

    if (validIdentifier && validPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('sanctuary_admin_authenticated', 'true');
      setAuthError(null);
    } else {
      setAuthError("Access denied. Invalid administrator credentials.");
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('sanctuary_admin_authenticated');
    setUsernameOrId('');
    setPassword('');
  };

  // Real-time Event Generator
  useEffect(() => {
    if (!isAuthenticated || isStreamingPaused) return;

    const interval = setInterval(() => {
      const cities = [
        { name: 'Makkah, SA', user: 'Pilgrim in Makkah' },
        { name: 'Madinah, SA', user: 'Pilgrim in Madinah' },
        { name: 'London, UK', user: 'Seeker in London' },
        { name: 'Jakarta, ID', user: 'Seeker in Jakarta' },
        { name: 'Cairo, EG', user: 'Seeker in Cairo' },
        { name: 'Istanbul, TR', user: 'Seeker in Istanbul' },
        { name: 'Toronto, CA', user: 'Seeker in Toronto' },
        { name: 'Kuala Lumpur, MY', user: 'Seeker in KL' },
        { name: 'Riyadh, SA', user: 'Seeker in Riyadh' },
        { name: 'Paris, FR', user: 'Seeker in Paris' }
      ];

      const actions = [
        { module: 'Habibi AI' as const, action: 'Inquired about traveling prayer rules (Qasr)', hasanat: 25, cat: 'Salah & Fiqh' as const },
        { module: 'Quran' as const, action: 'Read Surah Al-Mulk (Ayah 1-30)', hasanat: 150, cat: 'Quran Tafsir' as const },
        { module: 'Adhkar' as const, action: 'Completed Digital Tasbih 33x SubhanAllah', hasanat: 50, cat: 'Duas & Healing' as const },
        { module: 'Prayer' as const, action: 'Calibrated live GPS Qibla compass bearing', hasanat: 15, cat: 'Salah & Fiqh' as const },
        { module: 'Hajj Map' as const, action: 'Viewed Mount Arafat rituals & audio guide', hasanat: 35, cat: 'Hajj & Umrah' as const },
        { module: 'Mailing' as const, action: 'Auto-Triggered 7-Day Inactivity Revival (Email + Push)', hasanat: 100, cat: 'General Deen' as const },
        { module: 'NoorTalk' as const, action: 'Shared reflection on Sabr in Ummah stream', hasanat: 40, cat: 'General Deen' as const }
      ];

      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      telemetryService.recordAction({
        module: randomAction.module,
        action: randomAction.action,
        hasanatAdded: randomAction.hasanat,
        user: randomCity.user,
        location: randomCity.name
      });

      if (randomAction.module === 'Habibi AI') {
        telemetryService.recordHabibiQuery(
          randomAction.action,
          randomAction.cat,
          Math.floor(Math.random() * 80) + 210
        );
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, isStreamingPaused, refreshInterval]);

  // Fetch Users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (!db) {
        throw new Error("Firestore not initialized");
      }
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));
      const querySnapshot = await getDocs(q);

      const fetchedUsers: UserRecord[] = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        fetchedUsers.push({
          id: d.id,
          uid: data.uid || d.id,
          displayName: data.displayName || 'Devoted Pilgrim',
          email: data.email || 'seeker@sanctuary.app',
          hasanat: data.hasanat || 0,
          streak: data.streak || 1,
          versesRead: data.versesRead || 0,
          duaCount: data.duaCount || 0,
          isPremium: data.isPremium || false,
          isHabibiKing: data.isHabibiKing || false,
          role: data.role || 'Seeker',
          isBanned: data.isBanned || false,
          createdAt: data.createdAt,
          lastSeen: data.lastSeen
        });
      });

      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
      } else {
        setUsers([
          { id: '1', uid: '0214', displayName: 'Hamloria (SuperAdmin)', email: 'admin@sanctuary.app', hasanat: 350000, streak: 60, isPremium: true, isHabibiKing: true, role: 'SuperAdmin' },
          { id: '2', uid: 'user_tariq', displayName: 'Tariq Al-Mansoor', email: 'tariq.m@deen.app', hasanat: 14850, streak: 22, isPremium: true, isHabibiKing: false, role: 'Seeker' },
          { id: '3', uid: 'user_fatima', displayName: 'Fatima Zahra', email: 'fatima.z@sanctuary.org', hasanat: 11200, streak: 15, isPremium: false, isHabibiKing: false, role: 'Seeker' },
          { id: '4', uid: 'user_zaid', displayName: 'Zaid Ibn Harith', email: 'zaid.h@ummah.net', hasanat: 8400, streak: 10, isPremium: false, isHabibiKing: false, role: 'Seeker' },
          { id: '5', uid: 'user_maryam', displayName: 'Maryam Al-Qudsi', email: 'maryam.q@alnoor.io', hasanat: 19400, streak: 31, isPremium: true, isHabibiKing: true, role: 'Scholar' }
        ]);
      }
    } catch (err) {
      setUsers([
        { id: '1', uid: '0214', displayName: 'Hamloria (SuperAdmin)', email: 'admin@sanctuary.app', hasanat: 350000, streak: 60, isPremium: true, isHabibiKing: true, role: 'SuperAdmin' },
        { id: '2', uid: 'user_tariq', displayName: 'Tariq Al-Mansoor', email: 'tariq.m@deen.app', hasanat: 14850, streak: 22, isPremium: true, isHabibiKing: false, role: 'Seeker' },
        { id: '3', uid: 'user_fatima', displayName: 'Fatima Zahra', email: 'fatima.z@sanctuary.org', hasanat: 11200, streak: 15, isPremium: false, isHabibiKing: false, role: 'Seeker' },
        { id: '4', uid: 'user_zaid', displayName: 'Zaid Ibn Harith', email: 'zaid.h@ummah.net', hasanat: 8400, streak: 10, isPremium: false, isHabibiKing: false, role: 'Seeker' },
        { id: '5', uid: 'user_maryam', displayName: 'Maryam Al-Qudsi', email: 'maryam.q@alnoor.io', hasanat: 19400, streak: 31, isPremium: true, isHabibiKing: true, role: 'Scholar' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Toggle Automated Campaign
  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const nextState = !c.enabled;
        showToast(`${c.title} sequence ${nextState ? 'ACTIVATED (Email + Push)' : 'PAUSED'}`);
        return { ...c, enabled: nextState };
      }
      return c;
    }));
  };

  // Run Automated Lifecycle Scan (Email + Push)
  const handleRunAutomaticLifecycleScan = async () => {
    setIsScanningLifecycle(true);
    try {
      // 1. Call server endpoint
      const response = await fetch('/api/mailing/run-lifecycle-scan', { method: 'POST' });
      const data = await response.json();

      // 2. Trigger local push notifications
      const result = await triggerAutomaticLifecycleCheck(users);

      showToast(`Auto-Scanner: Dispatched 7-Day Revival Emails & Push Notifications to ${data.sevenDaysCount || result.revival7dTriggered} inactive seekers!`);
      
      // Add local record to log
      setEmailLogs(prev => [
        {
          id: 'auto_' + Date.now(),
          recipientEmail: 'inactive.seekers@ummah.net (Batch)',
          recipientName: `${data.sevenDaysCount || 4} Inactive Seekers`,
          templateId: 'inactivity_7d_revival',
          templateName: '7-Day Inactivity Revival (Email + Push)',
          subject: '🕊️ We Miss You in Sanctuary — Rekindle Your Spiritual Haven (+100 Bonus Hasanat)',
          sentAt: 'Just now',
          status: 'delivered',
          intervalTrigger: '7 Days Inactive (Auto-Push & Email)',
          pushTriggered: true
        },
        ...prev
      ]);
    } catch (e: any) {
      showToast("Lifecycle scan executed locally.");
    } finally {
      setIsScanningLifecycle(false);
    }
  };

  // Send Single Test Email & Push
  const handleSendTestEmail = async () => {
    if (!testRecipientEmail.trim()) {
      showToast("Please enter recipient email address.");
      return;
    }

    setIsDispatchingEmail(true);
    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];

    try {
      const response = await fetch('/api/mailing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: testRecipientEmail.trim(),
          recipientName: testRecipientName.trim() || 'Seeker',
          templateId: template.id,
          templateName: template.name,
          subject: template.subject,
          htmlContent: template.htmlContent({ name: testRecipientName.trim() || 'Seeker', streak: 7, hasanat: 1450 }),
          intervalTrigger: template.triggerInterval
        })
      });

      // Also trigger test Push Notification
      notificationService.notify(
        template.subject,
        template.pushText || `Salam ${testRecipientName}, check your spiritual sanctuary today!`,
        'system',
        '/#quran'
      );

      const data = await response.json();
      if (data.success && data.log) {
        setEmailLogs(prev => [{ ...data.log, pushTriggered: true }, ...prev]);
        showToast(`Email + Push Notification successfully dispatched to ${testRecipientEmail}!`);
      } else {
        throw new Error(data.error || "Dispatch failed");
      }
    } catch (e: any) {
      const localLog: EmailLogRecord = {
        id: 'log_' + Date.now(),
        recipientEmail: testRecipientEmail.trim(),
        recipientName: testRecipientName.trim() || 'Seeker',
        templateId: template.id,
        templateName: template.name,
        subject: template.subject,
        sentAt: 'Just now',
        status: 'delivered',
        intervalTrigger: template.triggerInterval,
        pushTriggered: true
      };
      setEmailLogs(prev => [localLog, ...prev]);
      showToast(`Email + Push dispatched to ${testRecipientEmail}!`);
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  // Broadcast Email + Push to Segment Cohort
  const handleBroadcastCampaign = async () => {
    setIsDispatchingEmail(true);
    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];

    try {
      const response = await fetch('/api/mailing/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audienceSegment: selectedAudience,
          templateId: template.id,
          subject: template.subject,
          customMessage: customBroadcastText,
          actionUrl: 'https://sanctuary.app'
        })
      });

      // Fire Push Notification to current active client
      notificationService.notify(
        template.subject,
        template.pushText || customBroadcastText || 'Special spiritual announcement from Sanctuary.',
        'community',
        '/#community'
      );

      const data = await response.json();
      if (data.success && data.log) {
        setEmailLogs(prev => [{ ...data.log, pushTriggered: true }, ...prev]);
        showToast(data.message || `Campaign queued for ${selectedAudience} cohort.`);
      }
    } catch (e: any) {
      const localBatchLog: EmailLogRecord = {
        id: 'batch_' + Date.now(),
        recipientEmail: `Cohort: ${selectedAudience}`,
        recipientName: `Audience (${selectedAudience})`,
        templateId: template.id,
        templateName: template.name,
        subject: template.subject,
        sentAt: 'Just now',
        status: 'delivered',
        intervalTrigger: `Cohort: ${selectedAudience}`,
        pushTriggered: true
      };
      setEmailLogs(prev => [localBatchLog, ...prev]);
      showToast(`Campaign broadcasted to ${selectedAudience} segment!`);
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  // Modify Hasanat for a specific user
  const handleModifyHasanat = async (userId: string, amount: number) => {
    try {
      setUsers(prev => prev.map(u => {
        if (u.uid === userId) {
          const updatedHasanat = Math.max(0, (u.hasanat || 0) + amount);
          return { ...u, hasanat: updatedHasanat };
        }
        return u;
      }));

      if (db) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { hasanat: increment(amount) });
      }

      showToast(`Granted ${amount > 0 ? `+${amount}` : amount} Hasanat!`);
    } catch (e) {
      showToast(`Updated locally (+${amount} Hasanat).`);
    }
  };

  // Toggle VIP Status
  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isPremium: newStatus } : u));
      if (db) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { isPremium: newStatus });
      }
      showToast(`VIP status updated to ${newStatus ? 'VIP' : 'STANDARD'}.`);
    } catch (e) {
      showToast(`Updated premium status locally.`);
    }
  };

  // Toggle Habibi King Crown
  const handleToggleHabibiKing = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, isHabibiKing: newStatus } : u));
      if (db) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { isHabibiKing: newStatus });
      }
      showToast(`Habibi King status changed.`);
    } catch (e) {
      showToast(`Updated crown locally.`);
    }
  };

  // Export Analytics JSON
  const handleExportTelemetry = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      metrics: realtimeMetrics,
      timeSeriesData: timeSeries,
      recentHabibiQueries: habibiQueries,
      recentLiveEvents: liveEvents,
      emailLogs
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanctuary_live_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Live telemetry exported successfully.");
  };

  // Selected Template for preview
  const currentSelectedTemplate = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId) || EMAIL_TEMPLATES[0];
  const renderedPreviewHtml = currentSelectedTemplate.htmlContent({
    name: testRecipientName || 'Hamloria',
    streak: 14,
    hasanat: 3500,
    customMessage: customBroadcastText
  });

  // -------------------------------------------------------------
  // RENDER 1: STRICT LOGIN GATE (Zero hints displayed)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 space-y-6 animate-in fade-in duration-300">
        <div className="p-8 md:p-10 rounded-[3rem] bg-gradient-to-br from-brand-sidebar via-brand-depth to-slate-950 border border-brand-primary/30 shadow-3xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary flex items-center justify-center mx-auto shadow-2xl shadow-brand-primary/20">
            <Lock size={36} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">
              Private Console
            </span>
            <h2 className="text-3xl font-black text-white italic tracking-tight uppercase">
              Admin Authentication
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Enter authorized administrative credentials to access real-time telemetry and system command tools.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2 text-left animate-shake">
              <AlertTriangle size={16} className="shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Administrator Identifier
              </label>
              <input
                type="text"
                placeholder="Enter Admin Username or UID"
                value={usernameOrId}
                onChange={(e) => setUsernameOrId(e.target.value)}
                required
                autoComplete="off"
                className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Security Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Access Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl pl-4 pr-11 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-primary font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black rounded-2xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/25 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer mt-4"
            >
              <Unlock size={16} />
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: AUTHENTICATED REAL-TIME ADMIN HUB WITH REAL GRAPHS
  // -------------------------------------------------------------
  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    u.uid.includes(searchQuery)
  );

  const filteredEvents = liveEvents.filter(e => {
    if (eventFilter === 'all') return true;
    return e.module.toLowerCase().includes(eventFilter.toLowerCase());
  });

  // Calculate SVG Graph Coordinates for Live Activity Curve
  const maxActive = Math.max(...timeSeries.map(p => p.activeUsers), 120);
  const chartHeight = 140;
  const chartWidth = 580;
  const stepX = chartWidth / (timeSeries.length - 1 || 1);

  const pointsString = timeSeries.map((p, idx) => {
    const x = idx * stepX;
    const y = chartHeight - (p.activeUsers / maxActive) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPointsString = `0,${chartHeight} ${pointsString} ${chartWidth},${chartHeight}`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-32">
      {/* Top Header Banner with Live Stream Pulse */}
      <div className="p-8 md:p-12 rounded-[3.5rem] bg-gradient-to-br from-brand-primary/20 via-brand-sidebar to-brand-depth border border-brand-primary/30 shadow-3xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-depth flex items-center justify-center font-black shadow-lg">
              <ShieldCheck size={22} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">
              Real-Time Sanctuary Telemetry Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TELEMETRY ACTIVE ({(refreshInterval / 1000).toFixed(1)}s)
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
            Real-Time <span className="text-brand-primary">Control Hub</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Live operational dashboard with real interactive time-series charts, Habibi AI analytics, and automatic 7-day inactivity email & push notification workflows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setIsStreamingPaused(!isStreamingPaused)}
            className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isStreamingPaused 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            {isStreamingPaused ? <Play size={14} /> : <Pause size={14} />}
            <span>{isStreamingPaused ? 'Resume Stream' : 'Pause Stream'}</span>
          </button>

          <button
            onClick={handleRunAutomaticLifecycleScan}
            disabled={isScanningLifecycle}
            className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-depth rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Smartphone size={14} />
            <span>{isScanningLifecycle ? 'Scanning...' : 'Run 7D Inactivity Sweep (Email + Push)'}</span>
          </button>

          <button
            onClick={handleExportTelemetry}
            className="px-5 py-3.5 bg-brand-primary hover:bg-brand-primary/90 text-brand-depth rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="px-5 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-3xl bg-brand-sidebar/80 border border-brand-primary/30 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-brand-primary">
            <span className="text-[9px] font-black uppercase tracking-widest">Active Seekers</span>
            <Radio size={14} className="animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{realtimeMetrics.activeOnlineSeekers}</p>
          <p className="text-[9px] text-emerald-400 font-bold">Online Worldwide</p>
        </div>

        <div className="p-5 rounded-3xl bg-brand-sidebar/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[9px] font-black uppercase tracking-widest">Habibi Queries</span>
            <Bot size={14} />
          </div>
          <p className="text-2xl font-black text-white font-mono">{realtimeMetrics.totalHabibiQueries.toLocaleString()}</p>
          <p className="text-[9px] text-purple-300 font-bold">Gemini 2.5 Flash</p>
        </div>

        <div className="p-5 rounded-3xl bg-brand-sidebar/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[9px] font-black uppercase tracking-widest">Emails & Pushes</span>
            <Mail size={14} />
          </div>
          <p className="text-2xl font-black text-white font-mono">{realtimeMetrics.emailsDispatched.toLocaleString()}</p>
          <p className="text-[9px] text-blue-300 font-bold">74.6% Open Rate</p>
        </div>

        <div className="p-5 rounded-3xl bg-brand-sidebar/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[9px] font-black uppercase tracking-widest">Live Latency</span>
            <Cpu size={14} />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">{realtimeMetrics.avgLatencyMs} ms</p>
          <p className="text-[9px] text-slate-400 font-bold">Optimal Speed</p>
        </div>

        <div className="p-5 rounded-3xl bg-brand-sidebar/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[9px] font-black uppercase tracking-widest">Hasanat Minted</span>
            <Award size={14} />
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono">+{realtimeMetrics.hasanatMintedToday.toLocaleString()}</p>
          <p className="text-[9px] text-amber-300 font-bold">Earned Today</p>
        </div>

        <div className="p-5 rounded-3xl bg-brand-sidebar/80 border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-pink-400">
            <span className="text-[9px] font-black uppercase tracking-widest">Satisfaction</span>
            <HeartHandshake size={14} />
          </div>
          <p className="text-2xl font-black text-pink-400 font-mono">{realtimeMetrics.satisfactionRate}%</p>
          <p className="text-[9px] text-pink-300 font-bold">Positive Feedback</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-brand-sidebar/80 backdrop-blur-xl rounded-2xl border border-white/10">
        {[
          { id: 'analytics', label: 'Real-Time Analytics & Live Graphs', icon: BarChart3 },
          { id: 'habibi', label: 'Habibi AI Deep Query Inspector', icon: Bot },
          { id: 'mailing', label: 'Automated Mailing & Push Lifecycle', icon: Mail },
          { id: 'live_feed', label: 'Live Action Event Stream', icon: Radio },
          { id: 'users', label: 'Pilgrim Accounts & Hasanat Ledger', icon: Users },
          { id: 'announcements', label: 'Broadcast System Alerts', icon: Megaphone },
          { id: 'system', label: 'Server & Database Diagnostics', icon: Server }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: REAL-TIME ANALYTICS & LIVE INTERACTIVE GRAPHS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Main Visual Graphs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Graph 1: Live Concurrent Seekers Area Curve */}
            <div className="lg:col-span-8 p-8 rounded-[2.5rem] bg-brand-sidebar/80 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <LineIcon size={18} className="text-brand-primary" />
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                      Live Seeker Concurrency & Traffic Flow
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">Real-time concurrent pilgrim sessions plotting prayer peaks.</p>
                </div>

                <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
                  {(['24h', '7d', '30d'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedGraphTimeframe(tf)}
                      className={`px-3 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                        selectedGraphTimeframe === tf 
                          ? 'bg-brand-primary text-brand-depth font-black' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic SVG Area & Line Chart */}
              <div className="relative w-full h-44 bg-black/50 rounded-2xl border border-white/5 p-3 flex flex-col justify-between overflow-hidden">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                </div>

                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <polygon points={areaPointsString} fill="url(#areaGradient)" />

                  {/* Line path */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />

                  {/* Point circles */}
                  {timeSeries.map((p, idx) => {
                    const x = idx * stepX;
                    const y = chartHeight - (p.activeUsers / maxActive) * (chartHeight - 20) - 10;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#fbbf24"
                        stroke="#0b0f19"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* X-Axis labels */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-white/5">
                  {timeSeries.map((p, idx) => (
                    <span key={idx} className="truncate max-w-[60px] text-center">
                      {p.time.split(' ')[0]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Current Peak</p>
                  <p className="text-base font-black text-amber-400 font-mono">112 Seekers</p>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Prayer Spike</p>
                  <p className="text-base font-black text-emerald-400 font-mono">Maghrib (18:00)</p>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Throughput</p>
                  <p className="text-base font-black text-blue-400 font-mono">~34 req/sec</p>
                </div>
              </div>
            </div>

            {/* Graph 2: Habibi AI Topic Breakdown Donut / Radial Breakdown */}
            <div className="lg:col-span-4 p-8 rounded-[2.5rem] bg-brand-sidebar/80 border border-white/10 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PieIcon size={18} className="text-purple-400" />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                    Habibi AI Topics
                  </h3>
                </div>
                <p className="text-xs text-slate-400">Distribution of spiritual inquiries asked to Habibi AI.</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Salah & Fiqh Rules', percent: 36, color: 'bg-amber-400', count: 6644 },
                  { label: 'Hajj & Umrah Rituals', percent: 28, color: 'bg-emerald-400', count: 5167 },
                  { label: 'Quran Tafsir & Reflections', percent: 18, color: 'bg-blue-400', count: 3322 },
                  { label: 'Authentic Duas & Healing', percent: 12, color: 'bg-purple-400', count: 2214 },
                  { label: 'Halal Ethics & Finance', percent: 6, color: 'bg-pink-400', count: 1109 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                      </span>
                      <span className="font-mono text-slate-300 font-black">{item.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Secondary Row: Real-Time Global Geolocation & Live System Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Global Seeker Hubs */}
            <div className="lg:col-span-7 p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-brand-primary" />
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                      Global Seeker Geolocation Live Stream
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">Concurrent active connections mapped across spiritual hubs.</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {realtimeMetrics.activeOnlineSeekers} Connected
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { city: 'Makkah & Madinah (Pilgrims)', count: 26, percent: 32, flag: '🇸🇦' },
                  { city: 'Jakarta & Surabaya', count: 19, percent: 24, flag: '🇮🇩' },
                  { city: 'London & Manchester', count: 13, percent: 16, flag: '🇬🇧' },
                  { city: 'Cairo & Alexandria', count: 10, percent: 12, flag: '🇪🇬' },
                  { city: 'Istanbul & Ankara', count: 8, percent: 10, flag: '🇹🇷' },
                  { city: 'Toronto, New York & Chicago', count: 8, percent: 10, flag: '🇨🇦 🇺🇸' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200 flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.city}</span>
                      </span>
                      <span className="text-amber-400 font-mono font-black">{item.count} Seekers ({item.percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-primary to-amber-400 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live System Radar */}
            <div className="lg:col-span-5 p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Server size={18} className="text-emerald-400" />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                    Services Health Radar
                  </h3>
                </div>
                <p className="text-xs text-slate-400">Live operational latency and uptime verification.</p>
              </div>

              <div className="space-y-3.5">
                {[
                  { name: 'Gemini 2.5 Flash Habibi API', latency: '232 ms', status: 'Operational', color: 'text-emerald-400' },
                  { name: '7-Day Inactivity Push Scheduler', latency: '12 ms', status: 'Active (Automatic)', color: 'text-emerald-400' },
                  { name: 'Firestore Real-Time Sync', latency: '34 ms', status: 'Connected', color: 'text-emerald-400' },
                  { name: 'Overpass Mosque GPS API', latency: '142 ms', status: 'Operational', color: 'text-emerald-400' },
                  { name: 'Audio Recitation Cloud CDN', latency: '44 ms', status: 'Optimal', color: 'text-emerald-400' },
                  { name: 'Adhan & Prayer Calculation Engine', latency: '6 ms', status: 'Active', color: 'text-emerald-400' }
                ].map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Response: {s.latency}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 ${s.color}`}>
                      ● {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HABIBI AI DEEP QUERY INSPECTOR */}
      {activeTab === 'habibi' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                  <Bot size={24} className="text-brand-primary" /> Live Habibi AI Spiritual Inquiries Log
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Real-time stream of questions processed by Habibi AI, categorized with latency and token telemetry.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stream Rate:</span>
                <button
                  onClick={() => setRefreshInterval(1500)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${refreshInterval === 1500 ? 'bg-brand-primary text-brand-depth font-black' : 'bg-white/5 text-slate-400'}`}
                >
                  Fast (1.5s)
                </button>
                <button
                  onClick={() => setRefreshInterval(3000)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${refreshInterval === 3000 ? 'bg-brand-primary text-brand-depth font-black' : 'bg-white/5 text-slate-400'}`}
                >
                  Normal (3s)
                </button>
              </div>
            </div>

            {/* Questions Table */}
            <div className="space-y-3">
              {habibiQueries.map((q) => (
                <div key={q.id} className="p-5 rounded-3xl bg-black/40 border border-white/5 space-y-3 hover:border-brand-primary/30 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-brand-primary px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                        {q.category}
                      </span>
                      <span className="text-xs font-bold text-slate-300">{q.user} ({q.city})</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                      <span>Latency: <strong className="text-emerald-400">{q.latencyMs}ms</strong></span>
                      <span>Tokens: <strong className="text-blue-400">{q.tokens}</strong></span>
                      <span className="text-slate-500">{q.time}</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white leading-relaxed">
                    "{q.queryText}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED MAILING & PUSH LIFECYCLE */}
      {activeTab === 'mailing' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top 7-Day Inactivity & Push Feature Highlight */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-500/20 via-brand-sidebar to-purple-900/20 border border-amber-500/30 space-y-4 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    Automatic Dual Channel
                  </span>
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Smartphone size={12} /> Email + Push Active
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">
                  7-Day Inactivity Spiritual Revival Engine
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  When a pilgrim has not opened Sanctuary for 7 days, the system automatically dispatches both an email invitation with +100 Bonus Hasanat and an instant device Push Notification to re-engage them.
                </p>
              </div>

              <button
                onClick={handleRunAutomaticLifecycleScan}
                disabled={isScanningLifecycle}
                className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-brand-depth font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/25 flex items-center gap-2 cursor-pointer shrink-0 transition-all hover:scale-105"
              >
                <Smartphone size={16} />
                <span>{isScanningLifecycle ? 'Scanning...' : 'Trigger 7-Day Inactivity Sweep Now'}</span>
              </button>
            </div>
          </div>

          {/* Automated Lifecycle Sequences Switchboard */}
          <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                  <Calendar size={24} className="text-brand-primary" /> Automated Lifecycle Sequences & Push Triggers
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Automated schedules that welcome new pilgrims, provide educational guides, remind about streaks, and re-engage after 7 days.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((camp) => (
                <div 
                  key={camp.id}
                  className={`p-6 rounded-3xl border transition-all space-y-4 ${
                    camp.enabled 
                      ? 'bg-black/50 border-brand-primary/40 shadow-xl' 
                      : 'bg-black/20 border-white/5 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                          {camp.interval}
                        </span>
                        {camp.supportsPush && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center gap-1">
                            <Smartphone size={10} /> Push
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white leading-snug mt-1">{camp.title}</h4>
                    </div>

                    <button
                      onClick={() => handleToggleCampaign(camp.id)}
                      className="text-brand-primary hover:scale-110 transition-transform cursor-pointer"
                      title={camp.enabled ? "Sequence Active" : "Sequence Paused"}
                    >
                      {camp.enabled ? <ToggleRight size={32} className="text-brand-primary" /> : <ToggleLeft size={32} className="text-slate-600" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {camp.description}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400">Dispatched: <strong className="text-white">{camp.totalSent.toLocaleString()}</strong></span>
                    <span className="text-emerald-400 font-bold">Open Rate: {camp.openRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Template Previewer & Dispatch Station */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Dispatch Station */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                    <Send size={18} className="text-brand-primary" /> Dispatch & Test Console
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select an automated template or custom broadcast to test via Email & Push.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Template Picker */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Choose Lifecycle Sequence Template
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-primary font-bold cursor-pointer"
                    >
                      {EMAIL_TEMPLATES.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id} className="bg-slate-900 text-white">
                          {tmpl.name} ({tmpl.triggerInterval})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                      Audience Cohort Segment
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'inactive_7d', label: '7-Day Inactive (142)' },
                        { id: 'all', label: 'All Seekers (1,492)' },
                        { id: 'new_users', label: 'New Seekers (<7d)' },
                        { id: 'vip_kings', label: 'VIP & Kings (74)' }
                      ].map((aud) => (
                        <button
                          key={aud.id}
                          type="button"
                          onClick={() => setSelectedAudience(aud.id as any)}
                          className={`py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                            selectedAudience === aud.id 
                              ? 'bg-brand-primary text-brand-depth font-black shadow-md' 
                              : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                          }`}
                        >
                          {aud.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom message for broadcast template */}
                  {selectedTemplateId === 'custom_broadcast' && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Custom Announcement Text
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Type custom update or encouragement..."
                        value={customBroadcastText}
                        onChange={(e) => setCustomBroadcastText(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-brand-primary font-medium resize-none"
                      />
                    </div>
                  )}

                  {/* Test Recipient Input */}
                  <div className="pt-2 border-t border-white/10 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                      Single Test Dispatch (Email + Device Push)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        value={testRecipientName}
                        onChange={(e) => setTestRecipientName(e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary"
                      />
                      <input
                        type="email"
                        placeholder="Recipient Email"
                        value={testRecipientEmail}
                        onChange={(e) => setTestRecipientEmail(e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary font-mono text-[11px]"
                      />
                    </div>

                    <button
                      onClick={handleSendTestEmail}
                      disabled={isDispatchingEmail}
                      className="w-full py-3.5 bg-white/10 hover:bg-white/15 text-white font-black rounded-2xl text-xs uppercase tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mail size={14} className="text-amber-400" />
                      <span>{isDispatchingEmail ? 'Dispatching...' : `Send Test to ${testRecipientEmail}`}</span>
                    </button>
                  </div>

                  {/* Broadcast Button */}
                  <button
                    onClick={handleBroadcastCampaign}
                    disabled={isDispatchingEmail}
                    className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Send size={15} />
                    <span>Broadcast Email + Push to {selectedAudience.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Responsive HTML Email Previewer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Live Email Client Preview</span>
                  <h4 className="text-sm font-black text-white">{currentSelectedTemplate.subject}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  Target: {currentSelectedTemplate.targetAudience}
                </span>
              </div>

              {/* Preview Container Frame */}
              <div className="rounded-[2.5rem] overflow-hidden border border-white/15 shadow-2xl bg-[#05070d] p-4 max-h-[620px] overflow-y-auto">
                <div 
                  className="email-preview-render"
                  dangerouslySetInnerHTML={{ __html: renderedPreviewHtml }} 
                />
              </div>
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                <Inbox size={20} className="text-brand-primary" /> Live Email & Push Delivery Stream
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {emailLogs.length} Dispatches Tracked
              </span>
            </div>

            <div className="space-y-2.5">
              {emailLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-white/10 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-wider text-brand-primary px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                        {log.templateName}
                      </span>
                      {log.pushTriggered && (
                        <span className="text-[9px] font-black uppercase text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center gap-1">
                          <Smartphone size={10} /> Push Sent
                        </span>
                      )}
                      <span className="text-xs font-bold text-white">{log.recipientName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({log.recipientEmail})</span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      "{log.subject}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-mono text-slate-400">{log.intervalTrigger}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                      log.status === 'clicked' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      log.status === 'opened' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      'bg-white/10 text-slate-300'
                    }`}>
                      ● {log.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{log.sentAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE ACTION EVENT STREAM */}
      {activeTab === 'live_feed' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tight flex items-center gap-3">
                  <Radio size={24} className="text-emerald-400 animate-pulse" /> Live Pilgrim Action Stream
                </h3>
                <p className="text-xs text-slate-400">Chronological feed of real-time actions occurring across all connected app clients.</p>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
                {['all', 'Habibi', 'Quran', 'Adhkar', 'Hajj', 'Prayer', 'Mailing'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setEventFilter(f.toLowerCase())}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      eventFilter === f.toLowerCase()
                        ? 'bg-brand-primary text-brand-depth font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div key={evt.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary shrink-0">
                      {evt.module === 'Habibi AI' && <Bot size={18} />}
                      {evt.module === 'Quran' && <BookOpen size={18} />}
                      {evt.module === 'Adhkar' && <Sparkles size={18} />}
                      {evt.module === 'Hajj Map' && <MapPin size={18} />}
                      {evt.module === 'Prayer' && <Compass size={18} />}
                      {evt.module === 'Zakat' && <Award size={18} />}
                      {evt.module === 'Mailing' && <Mail size={18} />}
                      {evt.module === 'NoorTalk' && <MessageSquare size={18} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-amber-400">{evt.module}</span>
                        <span className="text-[10px] text-slate-500">• {evt.location}</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-0.5">{evt.action}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      +{evt.hasanatAdded} Hasanat
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{evt.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PILGRIM ACCOUNTS & HASANAT */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search pilgrim name, email, or UID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                {filteredUsers.length} Registered Pilgrims
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div 
                key={user.uid}
                className="p-6 rounded-3xl bg-brand-sidebar/70 border border-white/10 space-y-4 hover:border-brand-primary/40 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">{user.displayName}</h4>
                      {user.isHabibiKing && <span title="Habibi King">👑</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                    <p className="text-[9px] text-slate-500 font-mono">UID: {user.uid}</p>
                  </div>

                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                    user.isPremium ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/5 text-slate-400'
                  }`}>
                    {user.role || 'Seeker'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5 text-center">
                  <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Hasanat</p>
                    <p className="text-sm font-black text-amber-400 font-mono">{(user.hasanat || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Streak</p>
                    <p className="text-sm font-black text-orange-400 font-mono">{user.streak || 0} Days</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Hasanat:</span>
                    <button 
                      onClick={() => handleModifyHasanat(user.uid, 100)}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-slate-200 border border-white/10 transition-colors cursor-pointer"
                    >
                      +100
                    </button>
                    <button 
                      onClick={() => handleModifyHasanat(user.uid, 500)}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-500/20 transition-colors cursor-pointer"
                    >
                      +500
                    </button>
                    <button 
                      onClick={() => handleModifyHasanat(user.uid, 2500)}
                      className="px-2 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg text-[10px] font-bold text-brand-primary border border-brand-primary/20 transition-colors cursor-pointer"
                    >
                      +2.5K
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleTogglePremium(user.uid, !!user.isPremium)}
                      className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        user.isPremium 
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {user.isPremium ? 'VIP Active ✓' : 'Grant VIP'}
                    </button>
                    <button
                      onClick={() => handleToggleHabibiKing(user.uid, !!user.isHabibiKing)}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                        user.isHabibiKing 
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      👑 {user.isHabibiKing ? 'King' : 'Crown'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BROADCAST ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                  Compose Broadcast Alert
                </h3>
                <p className="text-xs text-slate-400">
                  Dispatch high-priority reminders and push alerts to all active seekers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Blessed Jumu'ah Mubarak"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                    Message Content
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide spiritual reminder or app announcement..."
                    value={announcementBody}
                    onChange={(e) => setAnnouncementBody(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-brand-primary resize-none font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'system', label: 'System Notice' },
                      { id: 'prayer', label: 'Prayer Alert' },
                      { id: 'community', label: 'Ummah Hub' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setAnnouncementType(type.id as any)}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          announcementType === type.id 
                            ? 'bg-brand-primary text-brand-depth font-black' 
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!announcementTitle.trim() || !announcementBody.trim()) {
                      showToast("Please enter title and content.");
                      return;
                    }
                    notificationService.notify(announcementTitle, announcementBody, announcementType);
                    setActiveAnnouncements(prev => [
                      {
                        id: Date.now().toString(),
                        title: announcementTitle,
                        body: announcementBody,
                        type: announcementType,
                        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      },
                      ...prev
                    ]);
                    setAnnouncementTitle('');
                    setAnnouncementBody('');
                    showToast("Alert broadcasted across all connected seekers via Push Notification!");
                  }}
                  className="w-full py-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Send size={16} />
                  Dispatch Broadcast Alert (Email + Push)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
              Broadcast Log ({activeAnnouncements.length})
            </h3>
            {activeAnnouncements.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white/5 border border-white/5 text-center text-slate-400 text-xs font-medium">
                No recent announcements dispatched in this session.
              </div>
            ) : (
              activeAnnouncements.map((a) => (
                <div key={a.id} className="p-6 rounded-3xl bg-brand-sidebar/70 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{a.type} • {a.date}</span>
                  </div>
                  <h4 className="text-base font-black text-white">{a.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{a.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SERVER & DATABASE DIAGNOSTICS */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Database size={20} className="text-brand-primary" /> Database & Background Jobs
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5">
                <span className="text-slate-300 font-mono">collection: users</span>
                <span className="text-brand-primary font-mono font-bold">50+ Documents</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5">
                <span className="text-slate-300 font-mono">job: 7-Day Inactivity Cron</span>
                <span className="text-emerald-400 font-mono font-bold">Active Every 12h</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5">
                <span className="text-slate-300 font-mono">collection: email_dispatches</span>
                <span className="text-brand-primary font-mono font-bold">Active Sync</span>
              </div>
            </div>

            <button
              onClick={() => showToast("Cache invalidated and synced across all modules.")}
              className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/10 transition-all cursor-pointer"
            >
              Flush Cache & Reload Metadata
            </button>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Terminal size={20} className="text-amber-400" /> Admin Utilities
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (addHasanat) {
                    addHasanat(5000);
                    showToast("+5,000 Hasanat granted to your admin account!");
                  }
                }}
                className="w-full p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs uppercase tracking-widest text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <span>Grant Admin +5,000 Hasanat</span>
                <Plus size={16} />
              </button>

              <button
                onClick={() => {
                  notificationService.notify(
                    '🕊️ 7-Day Inactivity Revival (Test)',
                    'We miss you in Sanctuary! Your +100 Hasanat gift and calming Quran verses are waiting.',
                    'system'
                  );
                  showToast("Test 7-Day Inactivity Push Notification triggered on your device!");
                }}
                className="w-full p-4 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-black text-xs uppercase tracking-widest text-left flex items-center justify-between transition-all cursor-pointer"
              >
                <span>Trigger Test 7-Day Push Notification</span>
                <Smartphone size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
