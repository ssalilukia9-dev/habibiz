import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Play,
  Pause,
  Film,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  Award,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Share2,
  Flame,
  Volume2,
  ExternalLink,
  Plus,
  Compass,
  Heart,
  Clock,
  User,
  Shield,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Check,
  RotateCcw,
  Trash2,
  Upload,
  Database,
  RefreshCw,
  Copy,
  Video,
  Radio,
  ShieldAlert,
  AlertTriangle,
  X
} from 'lucide-react';
import { KhatamVideoService, KhatamVideoItem, DEFAULT_KHATAM_VIDEOS } from '../services/khatamVideoService.ts';
import { FULL_JUZ_LIST } from '../data/juzData.ts';
import { AdminConfigService } from '../services/adminConfigService.ts';

interface KhatamJourneyViewProps {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
  currentUser?: any;
  onOpenAdmin?: () => void;
}

export default function KhatamJourneyView({
  onBack,
  addHasanat,
  currentUser,
  onOpenAdmin
}: KhatamJourneyViewProps) {
  const [videos, setVideos] = useState<KhatamVideoItem[]>(DEFAULT_KHATAM_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<KhatamVideoItem | null>(DEFAULT_KHATAM_VIDEOS[0]);
  const [activeTab, setActiveTab] = useState<'videos' | 'tracker' | 'dua'>('videos');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_khatam_watched_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Admin Posting & Management State inside Khatam Journey
  const [showAdminStudio, setShowAdminStudio] = useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newVideoTitle, setNewVideoTitle] = useState<string>('');
  const [newVideoCategory, setNewVideoCategory] = useState<'tafsir' | 'dua' | 'motivation' | 'tajweed' | 'juz_guide' | 'general'>('tafsir');
  const [newVideoSpeaker, setNewVideoSpeaker] = useState<string>('');
  const [newVideoDescription, setNewVideoDescription] = useState<string>('');
  const [newVideoDuration, setNewVideoDuration] = useState<string>('');
  const [newVideoJuz, setNewVideoJuz] = useState<string>('');
  const [newVideoFeatured, setNewVideoFeatured] = useState<boolean>(false);
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);

  const isAdmin = currentUser?.email === 'ssalilukia9@gmail.com' ||
                  currentUser?.email === 'admin@habibisanctuary.com' ||
                  (typeof localStorage !== 'undefined' && (
                    localStorage.getItem('sanctuary_admin_logged_in') === 'true' ||
                    localStorage.getItem('sanctuary_admin_mode') === 'true' ||
                    localStorage.getItem('saved-auth-email')?.toLowerCase() === 'ssalilukia9@gmail.com' ||
                    localStorage.getItem('saved-auth-email')?.toLowerCase()?.includes('admin')
                  )) ||
                  AdminConfigService.isAdminUser(currentUser);

  // Juz completion state (1 to 30)
  const [completedJuz, setCompletedJuz] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_khatam_completed_juz');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  // Khatam Pace target (days: 30, 60, 90)
  const [khatamTargetDays, setKhatamTargetDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_khatam_target_days');
      return saved ? Number(saved) : 30;
    } catch {
      return 30;
    }
  });

  // Daily Khatam Goal & Progress State (e.g. pages or verses per day)
  const [dailyGoalType, setDailyGoalType] = useState<'pages' | 'verses'>(() => {
    return (localStorage.getItem('sanctuary_khatam_daily_goal_type') as 'pages' | 'verses') || 'pages';
  });

  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(() => {
    const saved = localStorage.getItem('sanctuary_khatam_daily_goal_target');
    return saved ? Number(saved) : 20; // default 20 pages (1 full Juz / day)
  });

  const [dailyCompletedUnits, setDailyCompletedUnits] = useState<number>(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem('sanctuary_khatam_daily_progress_date');
      const savedUnits = localStorage.getItem('sanctuary_khatam_daily_progress_units');
      if (savedDate === todayStr && savedUnits) {
        return Number(savedUnits);
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [dailyGoalStreak, setDailyGoalStreak] = useState<number>(() => {
    const saved = localStorage.getItem('sanctuary_khatam_daily_goal_streak');
    return saved ? Number(saved) : 1;
  });

  const [showGoalConfigModal, setShowGoalConfigModal] = useState<boolean>(false);
  const [customGoalInput, setCustomGoalInput] = useState<string>('');

  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Daily Goal Handlers
  const updateDailyProgress = (delta: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const next = Math.max(0, dailyCompletedUnits + delta);
    setDailyCompletedUnits(next);
    localStorage.setItem('sanctuary_khatam_daily_progress_date', today);
    localStorage.setItem('sanctuary_khatam_daily_progress_units', String(next));
    
    if (next >= dailyGoalTarget && dailyCompletedUnits < dailyGoalTarget) {
      if (addHasanat) addHasanat(30);
      const nextStreak = dailyGoalStreak + 1;
      setDailyGoalStreak(nextStreak);
      localStorage.setItem('sanctuary_khatam_daily_goal_streak', String(nextStreak));
      showToast(`🎉 Masha'Allah! Daily Khatam Goal completed! +30 Hasanat & ${nextStreak}-day Streak 🔥`);
    } else if (delta > 0) {
      if (addHasanat) addHasanat(5 * delta);
      showToast(`+${delta} ${dailyGoalType} logged! +${5 * delta} Hasanat ✨`);
    }
  };

  const handleSetDailyGoal = (target: number, type: 'pages' | 'verses' = dailyGoalType) => {
    if (target < 1) return;
    setDailyGoalTarget(target);
    setDailyGoalType(type);
    localStorage.setItem('sanctuary_khatam_daily_goal_target', String(target));
    localStorage.setItem('sanctuary_khatam_daily_goal_type', type);
    setShowGoalConfigModal(false);
    showToast(`Daily Khatam Target updated to ${target} ${type} per day 🎯`);
  };

  const resetDailyProgress = () => {
    const today = new Date().toISOString().slice(0, 10);
    setDailyCompletedUnits(0);
    localStorage.setItem('sanctuary_khatam_daily_progress_date', today);
    localStorage.setItem('sanctuary_khatam_daily_progress_units', '0');
    showToast('Today\'s Khatam reading log has been reset.');
  };

  // Subscribe to real-time videos from Firestore
  useEffect(() => {
    const unsub = KhatamVideoService.subscribeToVideos((list) => {
      setVideos(list);
      if (!activeVideo && list.length > 0) {
        setActiveVideo(list[0]);
      }
    });
    return () => unsub();
  }, []);

  // Save completed Juz
  const toggleJuzComplete = (juzNum: number) => {
    let next: number[];
    if (completedJuz.includes(juzNum)) {
      next = completedJuz.filter(j => j !== juzNum);
    } else {
      next = [...completedJuz, juzNum];
      if (addHasanat) addHasanat(50);
      showToast(`Juz ${juzNum} marked completed! +50 Hasanat earned 🌟`);
    }
    setCompletedJuz(next);
    localStorage.setItem('sanctuary_khatam_completed_juz', JSON.stringify(next));
  };

  const handleSetTargetDays = (days: number) => {
    setKhatamTargetDays(days);
    localStorage.setItem('sanctuary_khatam_target_days', String(days));
  };

  const showToast = (msg: string) => {
    setClaimToast(msg);
    setTimeout(() => setClaimToast(null), 3500);
  };

  const handleClaimVideoReward = (video: KhatamVideoItem) => {
    if (watchedVideoIds.includes(video.id)) {
      showToast("Reward already claimed for this video! BarakAllahu Feek.");
      return;
    }
    const next = [...watchedVideoIds, video.id];
    setWatchedVideoIds(next);
    localStorage.setItem('sanctuary_khatam_watched_videos', JSON.stringify(next));
    if (addHasanat) addHasanat(25);
    showToast(`Claimed +25 Hasanat for watching "${video.title.slice(0, 32)}..." ✨`);
  };

  // Admin Video Actions directly inside Khatam Journey
  const handleAdminPublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) {
      showToast("Please enter a valid video link (YouTube, Vimeo, MP4).");
      return;
    }

    setIsAddingVideo(true);
    const categoryLabel = KhatamVideoService.getCategoryLabel(newVideoCategory);
    let titleToUse = newVideoTitle.trim();
    if (!titleToUse) {
      titleToUse = `${categoryLabel} - Video #${videos.length + 1}`;
    }

    const res = await KhatamVideoService.addVideo({
      url: newVideoUrl.trim(),
      title: titleToUse,
      category: newVideoCategory,
      categoryLabel,
      speaker: newVideoSpeaker.trim() || 'Sanctuary Scholar',
      description: newVideoDescription.trim() || 'Reflection and guidance for completing the Holy Quran.',
      duration: newVideoDuration.trim() || '15:00',
      juzNumber: newVideoJuz ? parseInt(newVideoJuz, 10) : undefined,
      featured: newVideoFeatured
    }, currentUser?.displayName || 'Admin');

    setIsAddingVideo(false);

    if (res.success) {
      setNewVideoUrl('');
      setNewVideoTitle('');
      setNewVideoSpeaker('');
      setNewVideoDescription('');
      setNewVideoDuration('');
      setNewVideoJuz('');
      setNewVideoFeatured(false);
      showToast(`Broadcasted "${titleToUse}" to all users in Firestore! 🌟`);
    } else {
      showToast(res.error || "Failed to publish video.");
    }
  };

  // 🛡️ SECURE ADMIN DELETION CONFIRMATION MODAL STATE
  // Prevents accidental data loss when deleting Khatam Journey videos
  const [pendingDeleteModal, setPendingDeleteModal] = useState<{
    id: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    badge?: string;
    video: KhatamVideoItem;
  } | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState<boolean>(false);

  const handleAdminDeleteVideo = (video: KhatamVideoItem) => {
    // Open secure confirmation modal preventing accidental data loss
    setPendingDeleteModal({
      id: video.id,
      title: video.title,
      subtitle: `${video.speaker || 'Sanctuary Scholar'} • ${video.categoryLabel || video.category}${video.duration ? ` (${video.duration})` : ''}`,
      imageUrl: video.thumbnailUrl,
      badge: `🎬 ${video.categoryLabel || 'Khatam Video'}`,
      video
    });
  };

  const handleConfirmPermanentDelete = async () => {
    if (!pendingDeleteModal) return;
    setIsProcessingDelete(true);
    const { video } = pendingDeleteModal;
    try {
      const success = await KhatamVideoService.deleteVideo(video.id);
      if (success) {
        showToast(`🗑️ Video "${video.title}" permanently deleted.`);
        if (activeVideo?.id === video.id) {
          const remaining = videos.filter(v => v.id !== video.id);
          if (remaining.length > 0) setActiveVideo(remaining[0]);
        }
      }
    } catch (err) {
      console.error("Error deleting Khatam video:", err);
      showToast("Failed to delete video.");
    } finally {
      setIsProcessingDelete(false);
      setPendingDeleteModal(null);
    }
  };

  const handleAdminToggleFeatured = async (video: KhatamVideoItem) => {
    await KhatamVideoService.toggleFeatured(video.id, !!video.featured);
    showToast(`${video.featured ? 'Removed from' : 'Pinned as'} Featured Hero Video!`);
  };

  // Filtered video list
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        v.title.toLowerCase().includes(q) || 
        (v.speaker && v.speaker.toLowerCase().includes(q)) || 
        (v.description && v.description.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [videos, selectedCategory, searchQuery]);

  const progressPercent = Math.round((completedJuz.length / 30) * 100);
  const pagesPerDay = Math.ceil(604 / khatamTargetDays);
  const pagesPerPrayer = Math.ceil(pagesPerDay / 5);

  return (
    <div className="min-h-screen pb-28 text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {claimToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-500 text-black font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-300"
          >
            <CheckCircle2 size={16} />
            <span>{claimToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Header Hero Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-[3rem] border-white/10 bg-gradient-to-br from-amber-500/10 via-brand-depth to-black/80 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" /> Sacred Quran Journey
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                  {completedJuz.length}/30 Juz Completed
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white italic tracking-tight flex items-center gap-3">
                <span>Khatam</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Journey</span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Step-by-step Quran completion roadmap with daily video reflections, scholar masterclasses, milestone tracking, and sacred completion Duas.
              </p>
            </div>

            {/* Quick Khatam Progress Gauge & Admin Shortcut */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 w-full sm:w-auto">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-14 h-14 -rotate-90">
                    <circle cx="28" cy="28" r="23" className="stroke-white/10" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="28"
                      cy="28"
                      r="23"
                      className="stroke-amber-400 transition-all duration-700"
                      strokeWidth="4"
                      strokeDasharray={145}
                      strokeDashoffset={145 - (145 * progressPercent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-amber-300">{progressPercent}%</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</p>
                  <p className="text-sm font-black text-white">{completedJuz.length} of 30 Juz</p>
                  <p className="text-[10px] text-emerald-400 font-medium">{30 - completedJuz.length} Juz remaining</p>
                </div>
              </div>

              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Shield size={14} />
                  <span>Admin Hub Videos</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily Khatam Goal & Visual Picture Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Daily Khatam Goal Interactive Progress Bar Card */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-[2.5rem] border-amber-500/25 bg-gradient-to-br from-brand-sidebar via-brand-depth to-black/90 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Today's Sacred Rhythm</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      {dailyGoalStreak} Day Streak 🔥
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    Daily Khatam Goal
                  </h2>
                </div>
              </div>

              {/* Configure Target Button */}
              <button
                onClick={() => setShowGoalConfigModal(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <span>Target: {dailyGoalTarget} {dailyGoalType}/day</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Progress Bar & Numerical Metrics */}
            <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  Completed Today: <strong className="text-amber-300 font-mono text-base">{dailyCompletedUnits}</strong> / {dailyGoalTarget} {dailyGoalType}
                </span>
                <span className={`font-mono font-black text-sm ${dailyCompletedUnits >= dailyGoalTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {Math.min(100, Math.round((dailyCompletedUnits / Math.max(1, dailyGoalTarget)) * 100))}%
                </span>
              </div>

              {/* Glowing Linear Progress Bar */}
              <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (dailyCompletedUnits / Math.max(1, dailyGoalTarget)) * 100)}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    dailyCompletedUnits >= dailyGoalTarget
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50'
                      : 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-lg shadow-amber-500/50'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  {dailyCompletedUnits >= dailyGoalTarget ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Daily Goal Completed! BarakAllahu Feek.
                    </span>
                  ) : (
                    <span>~{Math.max(0, dailyGoalTarget - dailyCompletedUnits)} {dailyGoalType} remaining today</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {dailyGoalType === 'pages' && `~${Math.ceil(dailyGoalTarget / 5)} pages / prayer`}
                </span>
              </div>
            </div>

            {/* Quick Increment Actions */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick Log Today's Reading</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => updateDailyProgress(1)}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus size={14} /> +1 {dailyGoalType === 'pages' ? 'Page' : 'Verse'}
                </button>
                <button
                  onClick={() => updateDailyProgress(4)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Recommended: 4 pages after 1 Salah"
                >
                  <Plus size={14} /> +4 (1 Salah)
                </button>
                <button
                  onClick={() => updateDailyProgress(10)}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus size={14} /> +10 (Half Juz)
                </button>
                <button
                  onClick={() => updateDailyProgress(20)}
                  className="py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Plus size={14} /> +20 (1 Juz)
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => updateDailyProgress(-1)}
                  disabled={dailyCompletedUnits <= 0}
                  className="text-[11px] text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Undo (-1)
                </button>
                <button
                  onClick={resetDailyProgress}
                  className="text-[11px] text-red-400/80 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Reset Today
                </button>
              </div>
            </div>
          </div>

          {/* Right: High Quality Picture Card for Khatam Journey */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-[2.5rem] border border-amber-500/30 shadow-2xl group min-h-[260px] flex flex-col justify-end p-6 sm:p-8">
            {/* Background High Res Sacred Quran Recitation Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1200')`
              }}
            />
            {/* Elegant Gradient Darkening Layer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-amber-950/20 mix-blend-color" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-200 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                <BookOpen size={12} /> Sacred Tilawah Companion
              </div>

              <h3 className="text-xl font-black text-white leading-tight">
                Family & Soul Khatam Journey
              </h3>

              <p className="arabic-text text-amber-200 text-sm leading-relaxed text-right">
                "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"
              </p>

              <p className="text-xs text-slate-300 italic">
                "And recite the Qur'an with measured, rhythmic recitation." (73:4)
              </p>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <Sparkles size={13} /> {completedJuz.length} of 30 Juz done
                </span>
                <span className="text-amber-400 font-mono font-bold">
                  {khatamTargetDays}-Day Track
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Goal Configuration Modal */}
        <AnimatePresence>
          {showGoalConfigModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setShowGoalConfigModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-brand-sidebar border border-amber-500/30 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">Set Daily Khatam Goal</h3>
                      <p className="text-xs text-slate-400">Choose your daily reading target</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGoalConfigModal(false)}
                    className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Preset Targets */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-300">Popular Daily Schedules:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { target: 4, type: 'pages' as const, label: '4 Pages / Day', sub: 'Gentle (150 days)' },
                      { target: 10, type: 'pages' as const, label: '10 Pages / Day', sub: 'Half Juz (60 days)' },
                      { target: 20, type: 'pages' as const, label: '20 Pages / Day', sub: '1 Full Juz (30 days)' },
                      { target: 40, type: 'pages' as const, label: '40 Pages / Day', sub: '2 Juz / Day (15 days)' },
                      { target: 50, type: 'verses' as const, label: '50 Verses / Day', sub: 'Ayah-based pace' },
                      { target: 100, type: 'verses' as const, label: '100 Verses / Day', sub: 'Ayah-based pace' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSetDailyGoal(preset.target, preset.type)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          dailyGoalTarget === preset.target && dailyGoalType === preset.type
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-200'
                        }`}
                      >
                        <p className="text-xs font-bold">{preset.label}</p>
                        <p className="text-[10px] text-slate-400">{preset.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom input */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-xs font-bold text-slate-300">Or Enter Custom Goal:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="604"
                      value={customGoalInput}
                      onChange={(e) => setCustomGoalInput(e.target.value)}
                      placeholder="e.g. 15"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-400 outline-none"
                    />
                    <select
                      value={dailyGoalType}
                      onChange={(e) => setDailyGoalType(e.target.value as any)}
                      className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none"
                    >
                      <option value="pages">Pages / Day</option>
                      <option value="verses">Verses / Day</option>
                    </select>
                    <button
                      onClick={() => {
                        const val = parseInt(customGoalInput, 10);
                        if (val > 0) handleSetDailyGoal(val, dailyGoalType);
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10 overflow-x-auto pb-1">
            {[
              { id: 'videos', label: `Sacred Video Sanctuary (${videos.length})`, icon: Film },
              { id: 'tracker', label: '30-Day Khatam Planner & Juz Checklist', icon: Calendar },
              { id: 'dua', label: 'Dua Al-Khatam (Completion Prayer)', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: VIDEO SANCTUARY */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            {/* ADMIN STUDIO: Direct Video Upload & Publishing Panel */}
            {isAdmin && (
              <div className="glass-panel p-6 rounded-[2.5rem] border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-brand-sidebar to-brand-depth space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
                      <Shield size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
                          Admin Overseer
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Radio size={10} className="animate-pulse" /> Live Firestore Broadcast
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-white">
                        Post Videos to Khatam Journey (Visible to All Users)
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAdminStudio(!showAdminStudio)}
                      className="px-4 py-2 bg-amber-400 text-black hover:bg-amber-300 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-amber-400/20 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>{showAdminStudio ? 'Close Studio' : '+ Post New Video'}</span>
                    </button>
                    {onOpenAdmin && (
                      <button
                        onClick={onOpenAdmin}
                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        <span>Full Admin</span>
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showAdminStudio && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAdminPublishVideo}
                      className="space-y-4 pt-4 border-t border-white/10"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                            <span>Video URL / Link *</span>
                            <span className="text-slate-500 font-normal">(YouTube, Shorts, Vimeo, MP4)</span>
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://www.youtube.com/watch?v=... or /shorts/..."
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            Video Title (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Completing Surah Al-Baqarah & Spiritual Milestones"
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            Category / Journey Stage
                          </label>
                          <select
                            value={newVideoCategory}
                            onChange={(e: any) => setNewVideoCategory(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="tafsir" className="bg-slate-900 text-white">Tafsir & Reflections</option>
                            <option value="dua" className="bg-slate-900 text-white">Khatam Duas & Supplications</option>
                            <option value="motivation" className="bg-slate-900 text-white">Daily Khatam Motivation</option>
                            <option value="juz_guide" className="bg-slate-900 text-white">Schedules & Guides</option>
                            <option value="tajweed" className="bg-slate-900 text-white">Tajweed & Recitation Mastery</option>
                            <option value="general" className="bg-slate-900 text-white">General Sacred Ilm</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                              Speaker / Scholar
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Sheikh Omar Suleiman"
                              value={newVideoSpeaker}
                              onChange={(e) => setNewVideoSpeaker(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                              Duration (MM:SS)
                            </label>
                            <input
                              type="text"
                              placeholder="12:45"
                              value={newVideoDuration}
                              onChange={(e) => setNewVideoDuration(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Description & Key Insights (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Provide context or key benefits of this video reflection for travelers on the Khatam Journey..."
                          value={newVideoDescription}
                          onChange={(e) => setNewVideoDescription(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newVideoFeatured}
                            onChange={(e) => setNewVideoFeatured(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-black/40 border-white/20"
                          />
                          <span className="text-xs text-slate-300 font-bold">
                            Pin as Featured Hero Video at top
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={isAddingVideo}
                          className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-xs rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isAddingVideo ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Publishing to Firestore...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Broadcast to All Users Now</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Active Video Player Hero */}
            {activeVideo && (
              <div className={`glass-panel rounded-[2.5rem] border-white/10 overflow-hidden bg-black/60 shadow-2xl transition-all ${theaterMode ? 'max-w-6xl mx-auto' : ''}`}>
                <div className="relative aspect-video w-full bg-black">
                  {activeVideo.embedUrl ? (
                    <iframe
                      src={activeVideo.embedUrl}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeVideo.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-4 bg-gradient-to-b from-brand-sidebar to-black/90">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest">
                          {activeVideo.categoryLabel || activeVideo.category}
                        </span>
                        {activeVideo.duration && (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[9px] font-mono flex items-center gap-1">
                            <Clock size={10} /> {activeVideo.duration}
                          </span>
                        )}
                        {activeVideo.speaker && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-bold flex items-center gap-1">
                            <User size={10} /> {activeVideo.speaker}
                          </span>
                        )}
                        {activeVideo.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Star size={9} className="fill-black" /> Featured Hero
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                        {activeVideo.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleAdminToggleFeatured(activeVideo)}
                            className={`p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              activeVideo.featured 
                                ? 'bg-amber-400 text-black border-amber-400' 
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                            }`}
                            title={activeVideo.featured ? 'Remove from Featured' : 'Pin to Featured'}
                          >
                            <Star size={14} className={activeVideo.featured ? 'fill-black' : ''} />
                          </button>
                          <button
                            onClick={() => handleAdminDeleteVideo(activeVideo)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            title="Delete this video"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleClaimVideoReward(activeVideo)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                          watchedVideoIds.includes(activeVideo.id)
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black hover:brightness-110 shadow-amber-500/20'
                        }`}
                      >
                        {watchedVideoIds.includes(activeVideo.id) ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Reward Claimed (+25 ✨)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Claim +25 Hasanat</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setTheaterMode(!theaterMode)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                        title={theaterMode ? 'Normal View' : 'Theater Mode'}
                      >
                        {theaterMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                  </div>

                  {activeVideo.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl border-t border-white/5 pt-3">
                      {activeVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Video Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl">
                {[
                  { id: 'all', label: 'All Videos' },
                  { id: 'tafsir', label: 'Tafsir & Reflections' },
                  { id: 'dua', label: 'Khatam Duas' },
                  { id: 'juz_guide', label: 'Schedules & Guides' },
                  { id: 'motivation', label: 'Daily Motivation' },
                  { id: 'tajweed', label: 'Tajweed' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Khatam videos..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const isSelected = activeVideo?.id === video.id;
                const isWatched = watchedVideoIds.includes(video.id);

                return (
                  <motion.div
                    key={video.id}
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      setActiveVideo(video);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`glass-panel rounded-3xl border overflow-hidden transition-all cursor-pointer group flex flex-col justify-between relative ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-500/5'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    {/* Thumbnail with overlay */}
                    <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 ${
                          isSelected ? 'bg-amber-400 text-black' : 'bg-black/70 text-white border border-white/20'
                        }`}>
                          <Play size={20} className="translate-x-0.5" />
                        </div>
                      </div>

                      {/* Admin Quick Action Pills on Card */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-20" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleAdminToggleFeatured(video)}
                            className={`p-1.5 rounded-lg text-[10px] backdrop-blur-md transition-all ${
                              video.featured ? 'bg-amber-400 text-black font-black' : 'bg-black/70 text-white hover:bg-black/90'
                            }`}
                            title={video.featured ? 'Featured' : 'Mark as Featured'}
                          >
                            <Star size={11} className={video.featured ? 'fill-black' : ''} />
                          </button>
                          <button
                            onClick={() => handleAdminDeleteVideo(video)}
                            className="p-1.5 rounded-lg text-[10px] bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-all"
                            title="Delete video"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}

                      {/* Duration Badge */}
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                          {video.duration}
                        </span>
                      )}

                      {/* Watched Badge */}
                      {isWatched && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Check size={10} /> Watched
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-amber-400 uppercase tracking-wider">
                            {video.categoryLabel || video.category}
                          </span>
                          {video.speaker && <span>{video.speaker}</span>}
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {video.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Sparkles size={11} /> +25 Hasanat
                        </span>
                        <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                          Play <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 30-DAY KHATAM TRACKER & JUZ CHECKLIST */}
        {activeTab === 'tracker' && (
          <div className="space-y-8">
            {/* Khatam Pace Selector Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-r from-brand-sidebar to-brand-depth space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Calendar className="text-amber-400" size={24} />
                    <span>Your Khatam Target & Daily Rhythm</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your completion pace to see your daily page milestones.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { days: 30, label: '30 Days (1 Juz / Day)' },
                    { days: 60, label: '60 Days (Half Juz / Day)' },
                    { days: 90, label: '90 Days (Gentle)' }
                  ].map(target => (
                    <button
                      key={target.days}
                      onClick={() => handleSetTargetDays(target.days)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        khatamTargetDays === target.days
                          ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommended Daily Schedule Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pages</p>
                  <p className="text-xl font-black text-white">604 Pages</p>
                  <p className="text-[10px] text-amber-400">Complete Holy Quran</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Target</p>
                  <p className="text-xl font-black text-amber-300">~{pagesPerDay} Pages / Day</p>
                  <p className="text-[10px] text-slate-400">For {khatamTargetDays}-day Khatam</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">After Each Prayer</p>
                  <p className="text-xl font-black text-emerald-400">~{pagesPerPrayer} Pages</p>
                  <p className="text-[10px] text-slate-400">Fajr, Dhuhr, Asr, Maghrib, Isha</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion Reward</p>
                  <p className="text-xl font-black text-cyan-400">+1,500 Hasanat</p>
                  <p className="text-[10px] text-slate-400">Plus Khatam Certificate</p>
                </div>
              </div>
            </div>

            {/* 30 Juz Visual Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  The 30 Sacred Juz Checklist
                </h3>
                <span className="text-xs text-amber-400 font-semibold">
                  Tap to mark as read (+50 ✨)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                  const isDone = completedJuz.includes(juzNum);
                  const juzData = FULL_JUZ_LIST.find(j => j.index === juzNum);

                  return (
                    <motion.div
                      key={juzNum}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleJuzComplete(juzNum)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                        isDone
                          ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                          : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                          isDone ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-400'
                        }`}>
                          {juzNum}
                        </span>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                          isDone ? 'bg-emerald-500 text-black' : 'border border-white/20'
                        }`}>
                          {isDone && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white truncate">
                          Juz {juzNum}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {juzData?.startAyah || `Section ${juzNum}`}
                        </p>
                      </div>

                      <div className="text-[9px] font-mono text-amber-400/80">
                        {isDone ? '✨ Completed' : 'Pending'}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DUA AL-KHATAM */}
        {activeTab === 'dua' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <div className="glass-panel p-6 sm:p-10 rounded-[3rem] border-white/10 bg-gradient-to-br from-amber-500/10 via-brand-depth to-black/90 space-y-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                <Sparkles size={32} />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                  Sacred Completion Supplication
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white italic">
                  Dua Khatm Al-Quran Al-Kareem
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                  Prophetic and righteous supplication recited upon concluding the recitation of the entire Holy Quran.
                </p>
              </div>

              {/* Dua Passage 1 */}
              <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4 text-right">
                <p className="text-xl sm:text-2xl font-serif text-amber-200 leading-loose">
                  اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.
                </p>
                <div className="text-left text-xs text-slate-300 space-y-1.5 border-t border-white/5 pt-4">
                  <p className="font-semibold text-amber-400">Transliteration:</p>
                  <p className="italic text-slate-400">
                    Allahumma irhamni bil-Qur'an, waj'alhu li imaman wa nooran wa hudan wa rahmah. Allahumma dhakkirni minhu ma naseet, wa 'allimni minhu ma jahilt, warzuqni tilawatahu aana'al-layli wa atraafan-nahar, waj'alhu li hujjatan ya Rabbal-'alameen.
                  </p>
                  <p className="font-semibold text-amber-400 pt-2">Translation:</p>
                  <p>
                    "O Allah, have mercy on me through the Quran, and make it for me a guide, a light, a guidance, and a mercy. O Allah, remind me of what I have forgotten from it, teach me of what I was ignorant of it, and grant me its recitation during hours of the night and extremities of the day, and make it an argument in my favor, O Lord of the Worlds."
                  </p>
                </div>
              </div>

              {/* Dua Passage 2 */}
              <div className="p-6 bg-black/40 rounded-3xl border border-white/10 space-y-4 text-right">
                <p className="text-xl sm:text-2xl font-serif text-amber-200 leading-loose">
                  اللَّهُمَّ أَصْلِحْ لِي دِينِيَ الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِيَ الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.
                </p>
                <div className="text-left text-xs text-slate-300 space-y-1.5 border-t border-white/5 pt-4">
                  <p className="font-semibold text-amber-400">Translation:</p>
                  <p>
                    "O Allah, rectify for me my religion which is the safeguard of my affairs, and rectify for me my world in which is my livelihood, and rectify for me my Hereafter to which is my return, and make life an increase for me in every good, and make death a relief for me from every evil."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 🛡️ SECURE ADMIN DELETION CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="w-full max-w-lg bg-slate-950 border-2 border-rose-500/40 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-3xl relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                    <ShieldAlert size={26} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                      Destructive Action Guard
                    </span>
                    <h3 className="text-lg font-black text-white">
                      Confirm Permanent Deletion
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => !isProcessingDelete && setPendingDeleteModal(null)}
                  disabled={isProcessingDelete}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 cursor-pointer disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Warning Notice */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1 text-xs">
                <p className="text-rose-200 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-rose-400 shrink-0" />
                  <span>This action cannot be undone.</span>
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed pl-5">
                  This YouTube video will be permanently removed from the Khatam Journey sanctuary in Firestore and will no longer be visible to seekers.
                </p>
              </div>

              {/* Item Preview Card */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-4">
                {pendingDeleteModal.imageUrl ? (
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                    <img
                      src={pendingDeleteModal.imageUrl}
                      alt={pendingDeleteModal.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-slate-500">
                    <Trash2 size={24} />
                  </div>
                )}

                <div className="space-y-1 overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[9px] font-black uppercase tracking-wider truncate">
                      {pendingDeleteModal.badge || 'Khatam Video'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">
                    {pendingDeleteModal.title}
                  </h4>
                  {pendingDeleteModal.subtitle && (
                    <p className="text-[11px] text-slate-400 truncate">
                      {pendingDeleteModal.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessingDelete}
                  onClick={() => setPendingDeleteModal(null)}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel, Keep Video
                </button>
                <button
                  type="button"
                  disabled={isProcessingDelete}
                  onClick={handleConfirmPermanentDelete}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessingDelete ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Yes, Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
