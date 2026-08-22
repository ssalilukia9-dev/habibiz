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
  RotateCcw
} from 'lucide-react';
import { KhatamVideoService, KhatamVideoItem, DEFAULT_KHATAM_VIDEOS } from '../services/khatamVideoService.ts';
import { FULL_JUZ_LIST } from '../data/juzData.ts';

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

  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

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

          {/* Navigation Sub-Tabs */}
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
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                        {activeVideo.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
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
                    className={`glass-panel rounded-3xl border overflow-hidden transition-all cursor-pointer group flex flex-col justify-between ${
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
    </div>
  );
}
