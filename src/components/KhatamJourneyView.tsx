import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Play,
  Film,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Search,
  Share2,
  Flame,
  ExternalLink,
  Plus,
  Heart,
  Clock,
  User,
  Shield,
  Layers,
  Maximize2,
  Minimize2,
  Check,
  Trash2,
  Upload,
  RefreshCw,
  Copy,
  Video,
  Radio,
  Send,
  MessageCircle,
  Globe,
  List,
  LayoutGrid,
  Tag,
  ThumbsUp,
  X
} from 'lucide-react';
import { 
  YoutubeBroadcastService, 
  YoutubeBroadcastVideoItem, 
  DEFAULT_YOUTUBE_BROADCASTS 
} from '../services/youtubeBroadcastService.ts';
import { FULL_JUZ_LIST } from '../data/juzData.ts';
import { AdminConfigService } from '../services/adminConfigService.ts';
import { shareService } from '../services/shareService.ts';
import ConstructionBanner from './ConstructionBanner.tsx';

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
  const [videos, setVideos] = useState<YoutubeBroadcastVideoItem[]>(DEFAULT_YOUTUBE_BROADCASTS);
  const [activeVideo, setActiveVideo] = useState<YoutubeBroadcastVideoItem | null>(DEFAULT_YOUTUBE_BROADCASTS[0]);
  const [activeTab, setActiveTab] = useState<'videos' | 'tracker' | 'dua'>('videos');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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

  // User Video Reactions (heart | like | sparkle | dua)
  const [videoReactions, setVideoReactions] = useState<Record<string, 'heart' | 'like' | 'sparkle' | 'dua'>>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_khatam_video_reactions');
      if (saved) return JSON.parse(saved);
      const legacyLiked = localStorage.getItem('sanctuary_khatam_liked_videos');
      if (legacyLiked) {
        const ids: string[] = JSON.parse(legacyLiked);
        const mapped: Record<string, 'heart' | 'like' | 'sparkle' | 'dua'> = {};
        ids.forEach(id => { mapped[id] = 'heart'; });
        return mapped;
      }
      return {};
    } catch {
      return {};
    }
  });

  const [activeBurst, setActiveBurst] = useState<{ videoId: string; emoji: string; id: number } | null>(null);
  const [openReactionMenuId, setOpenReactionMenuId] = useState<string | null>(null);

  // Admin Video Posting State inside Khatam Journey
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

  // Hub Cross-Platform Sharing Modal State
  const [sharingVideo, setSharingVideo] = useState<YoutubeBroadcastVideoItem | null>(null);
  const [hubShareComment, setHubShareComment] = useState<string>('');
  const [isPostingToHub, setIsPostingToHub] = useState<boolean>(false);
  const [hubPostSuccess, setHubPostSuccess] = useState<boolean>(false);

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

  // Daily Khatam Goal & Progress State
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
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Subscribe to real-time broadcast videos and announcements from Firestore
  useEffect(() => {
    const unsubVideos = YoutubeBroadcastService.subscribeToVideos((list) => {
      setVideos(list);
      if (!activeVideo && list.length > 0) {
        setActiveVideo(list[0]);
      }
    });
    const unsubAnnouncements = YoutubeBroadcastService.subscribeToAnnouncements((list) => {
      setAnnouncements(list);
    });
    return () => {
      unsubVideos();
      unsubAnnouncements();
    };
  }, []);

  const showToast = (msg: string) => {
    setClaimToast(msg);
    setTimeout(() => setClaimToast(null), 3500);
  };

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

  const handleClaimVideoReward = (video: YoutubeBroadcastVideoItem) => {
    if (watchedVideoIds.includes(video.id)) {
      showToast("Reward already claimed for this video! BarakAllahu Feek.");
      return;
    }
    const next = [...watchedVideoIds, video.id];
    setWatchedVideoIds(next);
    localStorage.setItem('sanctuary_khatam_watched_videos', JSON.stringify(next));
    if (addHasanat) addHasanat(25);
    showToast(`Claimed +25 Hasanat for watching "${video.title.slice(0, 30)}..." ✨`);
  };

  const handleVideoReaction = async (
    video: YoutubeBroadcastVideoItem, 
    reactionType: 'heart' | 'like' | 'sparkle' | 'dua' = 'heart',
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    const currentReaction = videoReactions[video.id];
    const isRemoving = currentReaction === reactionType;
    const isChanging = currentReaction && currentReaction !== reactionType;

    const nextReactions = { ...videoReactions };
    if (isRemoving) {
      delete nextReactions[video.id];
    } else {
      nextReactions[video.id] = reactionType;
    }
    setVideoReactions(nextReactions);
    localStorage.setItem('sanctuary_khatam_video_reactions', JSON.stringify(nextReactions));

    // Update local video item state for instant UI update
    setVideos(prev => prev.map(v => {
      if (v.id !== video.id) return v;
      const curLikes = v.likes || 0;
      const curHearts = v.hearts || 0;
      const curReactions = { ...(v.reactions || {}) };

      if (isRemoving) {
        return {
          ...v,
          likes: Math.max(0, curLikes - 1),
          hearts: reactionType === 'heart' ? Math.max(0, curHearts - 1) : curHearts,
          reactions: {
            ...curReactions,
            [reactionType]: Math.max(0, (curReactions[reactionType] || 1) - 1)
          }
        };
      } else {
        return {
          ...v,
          likes: curLikes + (isChanging ? 0 : 1),
          hearts: reactionType === 'heart' ? curHearts + 1 : (currentReaction === 'heart' ? Math.max(0, curHearts - 1) : curHearts),
          reactions: {
            ...curReactions,
            [reactionType]: (curReactions[reactionType] || 0) + 1,
            ...(isChanging && currentReaction ? { [currentReaction]: Math.max(0, (curReactions[currentReaction] || 1) - 1) } : {})
          }
        };
      }
    }));

    if (activeVideo && activeVideo.id === video.id) {
      setActiveVideo(prev => {
        if (!prev) return null;
        const curLikes = prev.likes || 0;
        const curHearts = prev.hearts || 0;
        const curReactions = { ...(prev.reactions || {}) };
        if (isRemoving) {
          return {
            ...prev,
            likes: Math.max(0, curLikes - 1),
            hearts: reactionType === 'heart' ? Math.max(0, curHearts - 1) : curHearts,
            reactions: {
              ...curReactions,
              [reactionType]: Math.max(0, (curReactions[reactionType] || 1) - 1)
            }
          };
        } else {
          return {
            ...prev,
            likes: curLikes + (isChanging ? 0 : 1),
            hearts: reactionType === 'heart' ? curHearts + 1 : (currentReaction === 'heart' ? Math.max(0, curHearts - 1) : curHearts),
            reactions: {
              ...curReactions,
              [reactionType]: (curReactions[reactionType] || 0) + 1
            }
          };
        }
      });
    }

    setOpenReactionMenuId(null);

    // Call service to sync to Firestore
    await YoutubeBroadcastService.reactToVideo(video.id, reactionType, !isRemoving);

    if (!isRemoving) {
      const emojiMap = { heart: '❤️', like: '👍', sparkle: '✨', dua: '🤲' };
      setActiveBurst({ videoId: video.id, emoji: emojiMap[reactionType], id: Date.now() });
      if (addHasanat) addHasanat(5);
      showToast(`${emojiMap[reactionType]} Reacted to video reflection! +5 Hasanat ✨`);
    } else {
      showToast("Reaction removed.");
    }
  };

  const handleToggleLike = async (video: YoutubeBroadcastVideoItem) => {
    return handleVideoReaction(video, 'heart');
  };

  // Admin YouTube Video Broadcast Action
  const handleAdminPublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) {
      showToast("Please enter a valid YouTube video link.");
      return;
    }

    setIsAddingVideo(true);
    const categoryLabel = YoutubeBroadcastService.getCategoryLabel(newVideoCategory);
    let titleToUse = newVideoTitle.trim();
    if (!titleToUse) {
      titleToUse = `${categoryLabel} - Video #${videos.length + 1}`;
    }

    const res = await YoutubeBroadcastService.postKhatamAnnouncement({
      url: newVideoUrl.trim(),
      title: titleToUse,
      category: newVideoCategory,
      speaker: newVideoSpeaker.trim() || 'Sanctuary Scholar',
      description: newVideoDescription.trim() || 'Sacred guidance and reflections for travelers on the Khatam Journey.'
    }, currentUser?.displayName || 'Admin Overseer');

    setIsAddingVideo(false);

    if (res.success && res.video) {
      setNewVideoUrl('');
      setNewVideoTitle('');
      setNewVideoSpeaker('');
      setNewVideoDescription('');
      setNewVideoDuration('');
      setNewVideoJuz('');
      setNewVideoFeatured(false);
      setActiveVideo(res.video);
      showToast(`Broadcasted & created announcement for "${titleToUse}" in Firestore! 🌟`);
    } else {
      showToast(res.error || "Failed to broadcast video.");
    }
  };

  // Secure Admin Deletion Modal State
  const [pendingDeleteModal, setPendingDeleteModal] = useState<{
    id: string;
    title: string;
    video: YoutubeBroadcastVideoItem;
  } | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState<boolean>(false);

  const handleAdminDeleteVideo = (video: YoutubeBroadcastVideoItem) => {
    setPendingDeleteModal({
      id: video.id,
      title: video.title,
      video
    });
  };

  const handleConfirmPermanentDelete = async () => {
    if (!pendingDeleteModal) return;
    setIsProcessingDelete(true);
    const { video } = pendingDeleteModal;
    try {
      const success = await YoutubeBroadcastService.deleteBroadcastVideo(video.id);
      if (success) {
        showToast(`🗑️ Video "${video.title}" removed from broadcast.`);
        if (activeVideo?.id === video.id) {
          const remaining = videos.filter(v => v.id !== video.id);
          if (remaining.length > 0) setActiveVideo(remaining[0]);
        }
      }
    } catch (err) {
      console.error("Error deleting video:", err);
      showToast("Failed to delete video.");
    } finally {
      setIsProcessingDelete(false);
      setPendingDeleteModal(null);
    }
  };

  const handleAdminToggleFeatured = async (video: YoutubeBroadcastVideoItem) => {
    await YoutubeBroadcastService.toggleFeatured(video.id, !!video.featured);
    showToast(`${video.featured ? 'Removed from' : 'Pinned as'} Featured Hero Video!`);
  };

  // Cross-Platform Share Trigger
  const handleOpenShare = (video: YoutubeBroadcastVideoItem) => {
    setSharingVideo(video);
    setHubShareComment('');
    setHubPostSuccess(false);
  };

  const handleUniversalShareModal = (video: YoutubeBroadcastVideoItem) => {
    YoutubeBroadcastService.shareBroadcastVideo(video);
  };

  const handlePostToUmmahHub = async () => {
    if (!sharingVideo) return;
    setIsPostingToHub(true);
    const res = await YoutubeBroadcastService.shareToUmmahHub(sharingVideo, currentUser, hubShareComment);
    setIsPostingToHub(false);
    if (res.success) {
      setHubPostSuccess(true);
      if (addHasanat) addHasanat(15);
      showToast(`Shared to Ummah Hub! +15 Hasanat ✨`);
      setTimeout(() => {
        setSharingVideo(null);
        setHubPostSuccess(false);
      }, 1500);
    } else {
      showToast(res.error || "Could not share to Ummah Hub.");
    }
  };

  // Filtered videos list
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        v.title.toLowerCase().includes(q) || 
        (v.speaker && v.speaker.toLowerCase().includes(q)) || 
        (v.description && v.description.toLowerCase().includes(q)) ||
        (v.tags && v.tags.some(t => t.toLowerCase().includes(q)));
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Under Construction Banner */}
        <ConstructionBanner 
          moduleName="Khatam Journey & Video Broadcasts" 
          customMessage="This module is still under construction. Ongoing updates, new recordings, and sync improvements are actively rolling out."
          allowDismiss={true}
        />
        
        {/* Header Hero Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-[3rem] border-white/10 bg-gradient-to-br from-amber-500/10 via-brand-depth to-black/80 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" /> Sacred Quran Journey
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                  {completedJuz.length}/30 Juz Completed
                </span>
                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Video size={10} /> YouTube Broadcast Hub
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white italic tracking-tight flex items-center gap-3">
                <span>Khatam</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Journey</span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Step-by-step Quran completion roadmap with YouTube video broadcasts, scholar masterclasses, cross-platform video sharing in the hub, and sacred Duas.
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
                  <span>Admin Console</span>
                </button>
              )}
            </div>
          </div>

          {/* Daily Khatam Goal & Visual Progress Bar */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
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

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => updateDailyProgress(1)}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus size={14} />
                    <span>+1 {dailyGoalType === 'pages' ? 'Page' : 'Verse'}</span>
                  </button>
                  <button
                    onClick={() => updateDailyProgress(4)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>+4 (1 Prayer)</span>
                  </button>
                  <button
                    onClick={() => updateDailyProgress(20)}
                    className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>+20 (1 Full Juz)</span>
                  </button>
                </div>

                <button
                  onClick={resetDailyProgress}
                  className="p-2 text-slate-500 hover:text-slate-300 text-[10px] transition-colors cursor-pointer"
                  title="Reset today's counter"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Right Card: Pace Target info */}
            <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-[2.5rem] border-white/10 bg-gradient-to-br from-brand-sidebar to-brand-depth space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[9px] font-mono uppercase tracking-wider">
                  Target: {khatamTargetDays}-Day Khatam Roadmap
                </span>
                <h3 className="text-xl font-black text-white mt-2">
                  Quran Completion Strategy
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Recite 4 pages after Fajr, Dhuhr, Asr, Maghrib, and Isha to finish all 30 Juz within {khatamTargetDays} days effortlessly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Daily Milestone</p>
                  <p className="text-lg font-black text-amber-300">~{pagesPerDay} Pages</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Per Prayer</p>
                  <p className="text-lg font-black text-emerald-300">~{pagesPerPrayer} Pages</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'videos', label: `YouTube Video List (${videos.length})`, icon: Video },
              { id: 'tracker', label: '30-Day Juz Tracker', icon: Calendar },
              { id: 'dua', label: 'Dua Al-Khatam', icon: Sparkles }
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

          {activeTab === 'videos' && (
            <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-amber-400 text-black shadow-md font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-amber-400 text-black shadow-md font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: YOUTUBE BROADCAST VIDEO SANCTUARY & LIST VIEW */}
        {activeTab === 'videos' && (
          <div className="space-y-8">
            {/* ADMIN STUDIO: Direct YouTube Broadcast Posting Panel */}
            {isAdmin && (
              <div className="glass-panel p-6 rounded-[2.5rem] border-red-500/30 bg-gradient-to-r from-red-500/10 via-brand-sidebar to-brand-depth space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
                      <Video size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-black uppercase tracking-wider border border-red-500/30">
                          Admin Youtube Broadcast Service
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Radio size={10} className="animate-pulse" /> Live Hub Broadcaster
                        </span>
                      </div>
                      <h2 className="text-lg font-black text-white">
                        Post YouTube Video URLs to Khatam Journey (Broadcast to All Users)
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAdminStudio(!showAdminStudio)}
                      className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>{showAdminStudio ? 'Close Studio' : '+ Post YouTube URL'}</span>
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
                            <span>YouTube Video URL / Link *</span>
                            <span className="text-slate-500 font-normal">(watch?v=, youtu.be, /shorts/)</span>
                          </label>
                          <input
                            type="url"
                            required
                            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                            value={newVideoUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewVideoUrl(val);
                              if (!newVideoTitle && (val.includes('youtube.com') || val.includes('youtu.be'))) {
                                const parsed = YoutubeBroadcastService.parseVideoUrl(val);
                                if (parsed.isValid) {
                                  setNewVideoTitle(`Khatam Reflection #${videos.length + 1}`);
                                }
                              }
                            }}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400 font-mono"
                          />

                          {/* Live Video Preview Pill */}
                          {newVideoUrl && YoutubeBroadcastService.parseVideoUrl(newVideoUrl).thumbnailUrl && (
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-[11px]">
                              <img
                                src={YoutubeBroadcastService.parseVideoUrl(newVideoUrl).thumbnailUrl}
                                alt="Thumb"
                                className="w-10 h-6 object-cover rounded"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <span className="text-emerald-400 font-bold">YouTube URL Parsed Ready to Broadcast</span>
                            </div>
                          )}
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
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            Category / Journey Stage
                          </label>
                          <select
                            value={newVideoCategory}
                            onChange={(e: any) => setNewVideoCategory(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-400 cursor-pointer"
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
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
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
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
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
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newVideoFeatured}
                            onChange={(e) => setNewVideoFeatured(e.target.checked)}
                            className="w-4 h-4 rounded text-red-500 focus:ring-red-400 bg-black/40 border-white/20"
                          />
                          <span className="text-xs text-slate-300 font-bold">
                            Pin as Featured Hero Video at top
                          </span>
                        </label>

                        <button
                          type="submit"
                          disabled={isAddingVideo}
                          className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-black text-xs rounded-xl transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isAddingVideo ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Broadcasting to Firestore...</span>
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

            {/* LIVE ANNOUNCEMENTS FROM FIRESTORE */}
            {announcements && announcements.length > 0 && (
              <div className="glass-panel p-5 rounded-[2rem] border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-brand-sidebar to-black/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold">
                      <Radio size={16} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Official Khatam Announcements & Broadcasts
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                          Live Firestore Feed ({announcements.length})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Official video broadcasts published by administration for the Ummah
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {announcements.slice(0, 3).map((ann: any) => {
                    const hasMedia = ann.mediaUrl || ann.youtubeUrl || ann.thumbnailUrl;
                    return (
                      <div
                        key={ann.id}
                        onClick={() => {
                          const matchingVideo = videos.find(v => v.url === ann.mediaUrl || v.url === ann.youtubeUrl || v.id === ann.id);
                          if (matchingVideo) {
                            setActiveVideo(matchingVideo);
                          } else if (ann.mediaUrl || ann.youtubeUrl) {
                            const parsed = YoutubeBroadcastService.parseVideoUrl(ann.mediaUrl || ann.youtubeUrl);
                            setActiveVideo({
                              id: ann.id,
                              title: ann.title?.replace('🎬 ', '') || 'Khatam Broadcast',
                              url: ann.mediaUrl || ann.youtubeUrl,
                              embedUrl: ann.embedUrl || parsed.embedUrl,
                              thumbnailUrl: ann.thumbnailUrl || parsed.thumbnailUrl,
                              category: ann.category || 'general',
                              speaker: ann.speaker || ann.sender || 'Sanctuary Scholar',
                              description: ann.message || ann.description,
                              createdAt: typeof ann.createdAt === 'string' ? ann.createdAt : new Date().toISOString()
                            });
                          }
                          showToast(`Loaded broadcast: ${ann.title}`);
                        }}
                        className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-400/40 hover:bg-black/60 transition-all cursor-pointer group flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-start gap-3">
                          {hasMedia && (
                            <div className="w-16 h-11 rounded-lg bg-black overflow-hidden shrink-0 border border-white/10 relative group-hover:scale-105 transition-transform">
                              <img
                                src={ann.thumbnailUrl || (ann.mediaUrl || ann.youtubeUrl ? YoutubeBroadcastService.parseVideoUrl(ann.mediaUrl || ann.youtubeUrl || '').thumbnailUrl : undefined) || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'}
                                alt="Thumb"
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play size={12} className="text-white fill-white" />
                              </div>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                              {ann.sender || 'Admin Broadcast'}
                            </span>
                            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                              {ann.title}
                            </h4>
                            {(ann.message || ann.description) && (
                              <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
                                {ann.message || ann.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1.5 border-t border-white/5">
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 size={10} /> Tap to Watch in Studio
                          </span>
                          <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Video Player Hero */}
            {activeVideo && (
              <div className={`glass-panel rounded-[2.5rem] border-white/10 overflow-hidden bg-black/70 shadow-2xl transition-all ${theaterMode ? 'max-w-6xl mx-auto' : ''}`}>
                <div className="relative aspect-video w-full bg-black">
                  {activeVideo.embedUrl ? (
                    <iframe
                      src={activeVideo.embedUrl}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : activeVideo.url ? (
                    <video
                      src={activeVideo.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      No video source available
                    </div>
                  )}
                </div>

                <div className="p-6 sm:p-8 space-y-4 bg-gradient-to-b from-brand-sidebar to-black/90">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Video size={10} /> {activeVideo.categoryLabel || activeVideo.category}
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

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Rich Reaction Group (Heart, Like, Sparkle, Dua) */}
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                        {/* Heart / Love */}
                        <button
                          onClick={(e) => handleVideoReaction(activeVideo, 'heart', e)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            videoReactions[activeVideo.id] === 'heart'
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                              : 'hover:bg-white/10 text-slate-300'
                          }`}
                          title="Heart Reflection (Hubb)"
                        >
                          <Heart size={14} className={videoReactions[activeVideo.id] === 'heart' ? 'fill-white text-white' : 'text-rose-400'} />
                          <span>{(activeVideo.hearts || activeVideo.likes || 0) + (videoReactions[activeVideo.id] === 'heart' ? 1 : 0)}</span>
                        </button>

                        {/* Thumbs Up / Like */}
                        <button
                          onClick={(e) => handleVideoReaction(activeVideo, 'like', e)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            videoReactions[activeVideo.id] === 'like'
                              ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                              : 'hover:bg-white/10 text-slate-300'
                          }`}
                          title="Beneficial Reflection (Like)"
                        >
                          <ThumbsUp size={13} className={videoReactions[activeVideo.id] === 'like' ? 'fill-white text-white' : 'text-blue-400'} />
                          <span className="hidden sm:inline">Like</span>
                        </button>

                        {/* Barakah / Sparkles */}
                        <button
                          onClick={(e) => handleVideoReaction(activeVideo, 'sparkle', e)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            videoReactions[activeVideo.id] === 'sparkle'
                              ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                              : 'hover:bg-white/10 text-slate-300'
                          }`}
                          title="Barakah & Noor (Sparkle)"
                        >
                          <Sparkles size={13} className={videoReactions[activeVideo.id] === 'sparkle' ? 'fill-black' : 'text-amber-400'} />
                        </button>

                        {/* Dua / Ameen */}
                        <button
                          onClick={(e) => handleVideoReaction(activeVideo, 'dua', e)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            videoReactions[activeVideo.id] === 'dua'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'hover:bg-white/10 text-slate-300'
                          }`}
                          title="Ameen / Dua (Supplication)"
                        >
                          <span className="text-xs">🤲</span>
                        </button>
                      </div>

                      {/* Cross-Platform Share Button */}
                      <button
                        onClick={() => handleOpenShare(activeVideo)}
                        className="px-3.5 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Share video cross-platform and to Ummah Hub"
                      >
                        <Share2 size={14} />
                        <span>Share</span>
                      </button>

                      {/* Claim Hasanat Reward */}
                      <button
                        onClick={() => handleClaimVideoReward(activeVideo)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                          watchedVideoIds.includes(activeVideo.id)
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black hover:brightness-110 shadow-amber-500/20'
                        }`}
                      >
                        {watchedVideoIds.includes(activeVideo.id) ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Claimed (+25 ✨)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Claim +25 Hasanat</span>
                          </>
                        )}
                      </button>

                      {/* Admin Controls */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleAdminToggleFeatured(activeVideo)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
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
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            title="Delete this video"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setTheaterMode(!theaterMode)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
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
                  { id: 'all', label: `All Videos (${videos.length})` },
                  { id: 'tafsir', label: 'Tafsir & Reflections' },
                  { id: 'dua', label: 'Khatam Duas' },
                  { id: 'juz_guide', label: 'Schedules & Guides' },
                  { id: 'motivation', label: 'Daily Motivation' },
                  { id: 'tajweed', label: 'Tajweed Masterclass' }
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
                  placeholder="Search broadcasts, scholars, topics..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            {/* LIST VIEW (Primary) */}
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {filteredVideos.map((video, idx) => {
                  const isSelected = activeVideo?.id === video.id;
                  const isWatched = watchedVideoIds.includes(video.id);

                  return (
                    <motion.div
                      key={video.id}
                      layout
                      onClick={() => {
                        setActiveVideo(video);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className={`glass-panel p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-500/10 shadow-xl'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      {/* Left: Thumbnail & Badges */}
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative w-28 sm:w-36 aspect-video rounded-2xl overflow-hidden bg-black shrink-0 border border-white/10">
                          <img
                            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                              isSelected ? 'bg-amber-400 text-black' : 'bg-black/70 text-white'
                            }`}>
                              <Play size={14} className="translate-x-0.5" />
                            </div>
                          </div>

                          {video.duration && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                              {video.duration}
                            </span>
                          )}

                          {isWatched && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[8px] font-black uppercase">
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Title, Speaker & Details */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider">
                              {video.categoryLabel || video.category}
                            </span>
                            {video.speaker && (
                              <span className="text-[10px] text-cyan-300 font-medium flex items-center gap-1">
                                <User size={10} /> {video.speaker}
                              </span>
                            )}
                            <span className="text-[10px] text-rose-300/90 font-bold flex items-center gap-1">
                              <Heart size={10} className="fill-rose-400 text-rose-400" />
                              {((video.hearts || video.likes || 0) + (videoReactions[video.id] ? 1 : 0)).toLocaleString()} hearts
                            </span>
                            {video.featured && (
                              <span className="text-[9px] text-amber-400 font-black flex items-center gap-0.5">
                                <Star size={9} className="fill-amber-400" /> Featured
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
                            {video.title}
                          </h3>

                          {video.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions Toolbar & Share Buttons */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/5 relative" onClick={(e) => e.stopPropagation()}>
                        {/* Reaction Burst Animation Overlay */}
                        <AnimatePresence>
                          {activeBurst && activeBurst.videoId === video.id && (
                            <motion.div
                              key={activeBurst.id}
                              initial={{ opacity: 1, y: 0, scale: 0.6 }}
                              animate={{ opacity: 0, y: -36, scale: 1.4 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              className="absolute -top-6 left-2 pointer-events-none z-30 flex items-center gap-1 bg-amber-500/90 text-black px-2 py-0.5 rounded-full text-xs font-black shadow-lg"
                            >
                              <span>{activeBurst.emoji}</span>
                              <span>+5 Hasanat</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex items-center gap-1.5 text-xs">
                          {/* Rich Reaction Cluster with Quick Heart & Reaction Picker */}
                          <div className="relative flex items-center">
                            <button
                              onClick={(e) => handleVideoReaction(video, videoReactions[video.id] || 'heart', e)}
                              className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                                videoReactions[video.id]
                                  ? videoReactions[video.id] === 'heart'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                                    : videoReactions[video.id] === 'like'
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm shadow-blue-500/20'
                                    : videoReactions[video.id] === 'sparkle'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                              }`}
                              title="React to reflection (Heart / Like / Noor / Dua)"
                            >
                              {videoReactions[video.id] === 'heart' && <Heart size={13} className="fill-rose-400 text-rose-400" />}
                              {videoReactions[video.id] === 'like' && <ThumbsUp size={13} className="fill-blue-400 text-blue-400" />}
                              {videoReactions[video.id] === 'sparkle' && <Sparkles size={13} className="text-amber-400" />}
                              {videoReactions[video.id] === 'dua' && <span className="text-[11px]">🤲</span>}
                              {!videoReactions[video.id] && <Heart size={13} className="text-slate-400 group-hover:text-rose-400" />}
                              
                              <span>
                                {(video.hearts || video.likes || 0) + (videoReactions[video.id] ? 1 : 0)}
                              </span>
                            </button>

                            {/* Mini Reaction Selector Popover Toggle */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenReactionMenuId(openReactionMenuId === video.id ? null : video.id);
                              }}
                              className="px-1 py-1 text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer"
                              title="Choose reaction emoji"
                            >
                              ▾
                            </button>

                            {/* Floating Reaction Selector Menu */}
                            <AnimatePresence>
                              {openReactionMenuId === video.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.85, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.85, y: 4 }}
                                  className="absolute bottom-full left-0 mb-1 z-30 p-1 bg-[#061828] border border-amber-400/30 rounded-2xl flex items-center gap-1 shadow-2xl backdrop-blur-xl"
                                >
                                  <button
                                    onClick={(e) => handleVideoReaction(video, 'heart', e)}
                                    className="p-1.5 hover:bg-rose-500/20 rounded-xl text-base transition-transform hover:scale-125 cursor-pointer"
                                    title="Heart (Love/Hubb)"
                                  >
                                    ❤️
                                  </button>
                                  <button
                                    onClick={(e) => handleVideoReaction(video, 'like', e)}
                                    className="p-1.5 hover:bg-blue-500/20 rounded-xl text-base transition-transform hover:scale-125 cursor-pointer"
                                    title="Like (Beneficial)"
                                  >
                                    👍
                                  </button>
                                  <button
                                    onClick={(e) => handleVideoReaction(video, 'sparkle', e)}
                                    className="p-1.5 hover:bg-amber-500/20 rounded-xl text-base transition-transform hover:scale-125 cursor-pointer"
                                    title="Barakah & Noor"
                                  >
                                    ✨
                                  </button>
                                  <button
                                    onClick={(e) => handleVideoReaction(video, 'dua', e)}
                                    className="p-1.5 hover:bg-emerald-500/20 rounded-xl text-base transition-transform hover:scale-125 cursor-pointer"
                                    title="Ameen / Dua"
                                  >
                                    🤲
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <button
                            onClick={() => handleOpenShare(video)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/5 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                            title="Share to Ummah Hub & Social"
                          >
                            <Share2 size={13} />
                            <span className="hidden sm:inline">Share</span>
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleAdminToggleFeatured(video)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  video.featured ? 'bg-amber-400 text-black border-amber-400' : 'bg-white/5 text-slate-400 border-white/5'
                                }`}
                                title="Toggle Featured"
                              >
                                <Star size={13} className={video.featured ? 'fill-black' : ''} />
                              </button>
                              <button
                                onClick={() => handleAdminDeleteVideo(video)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/20 transition-all cursor-pointer"
                                title="Delete broadcast"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setActiveVideo(video);
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-md"
                        >
                          <span>Play</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* GRID VIEW */
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
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      className={`glass-panel rounded-3xl border overflow-hidden transition-all cursor-pointer group flex flex-col justify-between relative ${
                        isSelected
                          ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-500/5'
                          : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                        <img
                          src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'}
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

                        {video.duration && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                            {video.duration}
                          </span>
                        )}

                        {isWatched && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/90 text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Check size={10} /> Watched
                          </span>
                        )}
                      </div>

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

                        {/* Dedicated Community Hearts & Beneficial Endorsement Metric */}
                        <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-black/40 border border-white/5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                            <Heart size={13} className="fill-rose-400 text-rose-400" />
                            <span>{((video.hearts || video.likes || 0) + (videoReactions[video.id] ? 1 : 0)).toLocaleString()} Community Hearts</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <Sparkles size={11} /> Beneficial
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                          <div className="flex items-center gap-2.5">
                            {/* Heart Reaction Button in Grid */}
                            <button
                              onClick={(e) => handleVideoReaction(video, 'heart', e)}
                              className={`flex items-center gap-1 transition-colors ${
                                videoReactions[video.id]
                                  ? 'text-rose-400 font-bold'
                                  : 'text-slate-400 hover:text-rose-400'
                              }`}
                              title="Heart Reflection"
                            >
                              <Heart size={13} className={videoReactions[video.id] ? 'fill-rose-400 text-rose-400' : ''} />
                              <span>{(video.hearts || video.likes || 0) + (videoReactions[video.id] ? 1 : 0)}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenShare(video);
                              }}
                              className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                              title="Share"
                            >
                              <Share2 size={13} />
                            </button>
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                              <Sparkles size={11} /> +25
                            </span>
                          </div>
                          <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            Play <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 30-DAY KHATAM TRACKER & JUZ CHECKLIST */}
        {activeTab === 'tracker' && (
          <div className="space-y-8">
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

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-right font-serif">
                <p className="text-xl sm:text-2xl text-amber-200 leading-loose">
                  اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً
                </p>
                <p className="text-sm text-slate-300 font-sans text-left leading-relaxed">
                  "O Allah, have mercy upon me through the Quran, and make it for me a guide, a light, a guidance, and a mercy."
                </p>

                <p className="text-xl sm:text-2xl text-amber-200 leading-loose border-t border-white/10 pt-6">
                  اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ وَارْزُقْنِي تِلاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ
                </p>
                <p className="text-sm text-slate-300 font-sans text-left leading-relaxed">
                  "O Allah, remind me of what I have forgotten of it, teach me what I am ignorant of it, and grant me its recitation in the hours of the night and the edges of the day."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CROSS-PLATFORM VIDEO SHARING MODAL & UMMAH HUB POSTER */}
      <AnimatePresence>
        {sharingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-brand-sidebar border border-white/10 rounded-[3rem] p-6 sm:p-8 space-y-6 shadow-3xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Share Video Cross-Platform</h3>
                    <p className="text-xs text-slate-400">Share to Ummah Hub, WhatsApp, Telegram, or social media</p>
                  </div>
                </div>
                <button
                  onClick={() => setSharingVideo(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Video Preview Snapshot */}
              <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/10">
                <img
                  src={sharingVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'}
                  alt={sharingVideo.title}
                  className="w-20 h-12 object-cover rounded-xl shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                    {sharingVideo.categoryLabel || sharingVideo.category}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{sharingVideo.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{sharingVideo.speaker || 'Sanctuary Scholar'}</p>
                </div>
              </div>

              {/* Share to Ummah Hub Community Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-400" />
                    <span>Post to Ummah Hub Community Feed</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">+15 Hasanat ✨</span>
                </div>

                <textarea
                  rows={2}
                  value={hubShareComment}
                  onChange={(e) => setHubShareComment(e.target.value)}
                  placeholder="Add your personal reflection or thought for the community..."
                  className="w-full bg-black/50 border border-white/10 focus:border-emerald-400 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none resize-none"
                />

                <button
                  onClick={handlePostToUmmahHub}
                  disabled={isPostingToHub || hubPostSuccess}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-black font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isPostingToHub ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Publishing to Ummah Hub...</span>
                    </>
                  ) : hubPostSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Shared to Community Hub!</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Broadcast to Ummah Feed</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social Platform Share Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  External Channels & Apps
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      const url = shareService.getWhatsAppUrl({
                        title: sharingVideo.title,
                        text: `Watch this Khatam reflection: ${sharingVideo.title}`,
                        url: sharingVideo.url
                      });
                      window.open(url, '_blank');
                    }}
                    className="p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-black border border-emerald-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = shareService.getTelegramUrl({
                        title: sharingVideo.title,
                        text: `Watch this Khatam reflection: ${sharingVideo.title}`,
                        url: sharingVideo.url
                      });
                      window.open(url, '_blank');
                    }}
                    className="p-3 rounded-2xl bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Telegram</span>
                  </button>

                  <button
                    onClick={() => {
                      const url = shareService.getTwitterUrl({
                        title: sharingVideo.title,
                        text: `Watch this Khatam reflection: ${sharingVideo.title}`,
                        url: sharingVideo.url
                      });
                      window.open(url, '_blank');
                    }}
                    className="p-3 rounded-2xl bg-black/60 hover:bg-black text-white border border-white/20 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <span className="font-mono font-black text-sm">𝕏</span>
                    <span>X / Twitter</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sharingVideo.url);
                      showToast("Copied video link to clipboard!");
                      setSharingVideo(null);
                    }}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Copy size={16} />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE ADMIN DELETION MODAL */}
      <AnimatePresence>
        {pendingDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-sidebar border border-red-500/40 rounded-[3rem] p-8 space-y-6 shadow-3xl text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <Trash2 size={24} />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Permanently Delete Broadcast?</h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to remove <strong className="text-white font-bold">"{pendingDeleteModal.title}"</strong> from the Khatam Journey for all users?
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPendingDeleteModal(null)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPermanentDelete}
                  disabled={isProcessingDelete}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessingDelete ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GOAL CONFIGURATION MODAL */}
      <AnimatePresence>
        {showGoalConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-brand-sidebar border border-white/10 rounded-[3rem] p-6 sm:p-8 space-y-6 shadow-3xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Flame size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Daily Khatam Target</h3>
                    <p className="text-xs text-slate-400">Set your daily reading cadence</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGoalConfigModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { target: 20, type: 'pages' as const, label: '1 Full Juz / Day (20 Pages - 30-Day Khatam)' },
                  { target: 10, type: 'pages' as const, label: 'Half Juz / Day (10 Pages - 60-Day Khatam)' },
                  { target: 4, type: 'pages' as const, label: '4 Pages / Day (Gentle pace)' },
                  { target: 50, type: 'verses' as const, label: '50 Verses / Day (Ayah based)' }
                ].map(opt => (
                  <button
                    key={`${opt.target}-${opt.type}`}
                    onClick={() => handleSetDailyGoal(opt.target, opt.type)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      dailyGoalTarget === opt.target && dailyGoalType === opt.type
                        ? 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-400/20 font-black'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {dailyGoalTarget === opt.target && dailyGoalType === opt.type && (
                      <Check size={16} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
