import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Video,
  Play,
  CheckCircle2,
  Sparkles,
  User,
  Clock,
  Star,
  RefreshCw,
  Bell,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Send
} from 'lucide-react';
import {
  YoutubeBroadcastService,
  YoutubeBroadcastVideoItem,
  DEFAULT_YOUTUBE_BROADCASTS
} from '../services/youtubeBroadcastService.ts';

interface EditKhatamVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: YoutubeBroadcastVideoItem | null;
  onSaveSuccess?: (updatedVideo: YoutubeBroadcastVideoItem) => void;
  onVideoUpdated?: (updatedVideo: YoutubeBroadcastVideoItem) => void;
  currentUser?: any;
  adminUser?: any;
}

export default function EditKhatamVideoModal({
  isOpen,
  onClose,
  video,
  onSaveSuccess,
  onVideoUpdated,
  currentUser,
  adminUser
}: EditKhatamVideoModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [category, setCategory] = useState<'tafsir' | 'dua' | 'motivation' | 'tajweed' | 'juz_guide' | 'general'>('tajweed');
  const [duration, setDuration] = useState('');
  const [juzNumber, setJuzNumber] = useState<string>('');
  const [featured, setFeatured] = useState(false);
  const [notifyAllUsers, setNotifyAllUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewTest, setPreviewTest] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeAdmin = adminUser || currentUser;

  // Sync form state when video prop changes
  useEffect(() => {
    if (video) {
      setUrl(video.url || '');
      setTitle(video.title || '');
      setDescription(video.description || '');
      setSpeaker(video.speaker || '');
      setCategory(video.category || 'tajweed');
      setDuration(video.duration || '');
      setJuzNumber(video.juzNumber !== undefined ? String(video.juzNumber) : '');
      setFeatured(!!video.featured);
      setNotifyAllUsers(true);
      setPreviewTest(false);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [video, isOpen]);

  if (!isOpen || !video) return null;

  const parsedUrl = YoutubeBroadcastService.parseVideoUrl(url);
  const isDefaultVideo = DEFAULT_YOUTUBE_BROADCASTS.some(d => d.id === video.id);
  const defaultOriginal = DEFAULT_YOUTUBE_BROADCASTS.find(d => d.id === video.id);

  const handleResetToDefault = () => {
    if (!defaultOriginal) return;
    setUrl(defaultOriginal.url);
    setTitle(defaultOriginal.title);
    setDescription(defaultOriginal.description || '');
    setSpeaker(defaultOriginal.speaker || '');
    setCategory(defaultOriginal.category);
    setDuration(defaultOriginal.duration || '');
    setJuzNumber(defaultOriginal.juzNumber !== undefined ? String(defaultOriginal.juzNumber) : '');
    setFeatured(!!defaultOriginal.featured);
    setPreviewTest(false);
    setErrorMsg(null);
    setSuccessMsg('Reset form fields to default starter values.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMsg('Please enter a YouTube video URL.');
      return;
    }

    if (!parsedUrl.isValid) {
      setErrorMsg('Please enter a valid YouTube or video link (watch, youtu.be, shorts, or direct link).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const categoryLabel = YoutubeBroadcastService.getCategoryLabel(category);
    const updatedPayload = {
      url: url.trim(),
      title: title.trim() || `${categoryLabel} Broadcast`,
      description: description.trim(),
      speaker: speaker.trim() || 'Sanctuary Scholar',
      category,
      categoryLabel,
      duration: duration.trim() || '20:00',
      juzNumber: juzNumber.trim() ? Number(juzNumber) : undefined,
      featured,
      notifyAllUsers
    };

    const res = await YoutubeBroadcastService.updateBroadcastVideo(
      video.id,
      updatedPayload,
      activeAdmin
    );

    setIsSubmitting(false);

    if (res.success && res.video) {
      setSuccessMsg('Video updated & notification dispatched to all users! ✨');
      if (onSaveSuccess) onSaveSuccess(res.video);
      if (onVideoUpdated) onVideoUpdated(res.video);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to update video. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="edit-khatam-video-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="edit-khatam-video-modal"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#0a1928] to-[#040c16] border border-amber-500/30 rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 text-white my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-md">
                <Video size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/30">
                    Admin Video Customizer
                  </span>
                  {isDefaultVideo && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                      Default Broadcast Card
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white italic tracking-tight">
                  Edit Khatam Video & Notify Users
                </h3>
              </div>
            </div>

            <button
              id="edit-video-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* YouTube URL Input & Instant Thumbnail Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                  YouTube Video Link <span className="text-amber-400">*</span>
                </label>
                {parsedUrl.isValid && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Valid Video Link
                  </span>
                )}
              </div>

              <div className="relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={16} />
                <input
                  id="edit-video-url-input"
                  required
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setPreviewTest(false);
                    setErrorMsg(null);
                  }}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full bg-black/60 border border-amber-500/40 focus:border-amber-400 rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs font-mono outline-none transition-all focus:ring-1 focus:ring-amber-400/30"
                />
              </div>

              {/* Thumbnail Live Preview */}
              {url && parsedUrl.isValid && (
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-16 h-10 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10 relative">
                      <img
                        src={parsedUrl.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play size={12} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-amber-300 truncate">
                        {title || 'Sacred Reflection Video'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono truncate">{url}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewTest(!previewTest)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
                  >
                    <Play size={12} className="text-amber-400" />
                    <span>{previewTest ? 'Hide Player' : 'Test Player'}</span>
                  </button>
                </div>
              )}

              {/* Embedded Player Test Frame */}
              {previewTest && parsedUrl.isValid && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-amber-400/30 shadow-lg">
                  <iframe
                    src={parsedUrl.embedUrl}
                    title="Video Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>

            {/* Title & Scholar / Speaker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                  Video Title <span className="text-amber-400">*</span>
                </label>
                <input
                  id="edit-video-title-input"
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Essential Tajweed Rules for Fluent Recitation"
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                  Scholar / Reciter / Speaker
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    id="edit-video-speaker-input"
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="e.g. Ustadh Wissam Sharieff, Sheikh Sudais"
                    className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-2xl py-3 pl-9 pr-4 text-white text-xs outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                Video Description & Reflections
              </label>
              <textarea
                id="edit-video-description-input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what spiritual pearls, Khatam supplications, or guidance this video delivers..."
                className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-2xl py-2.5 px-4 text-white text-xs outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Category, Duration & Juz # */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                  Category
                </label>
                <select
                  id="edit-video-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-2xl py-3 px-3 text-white text-xs outline-none transition-all cursor-pointer"
                >
                  <option value="tajweed">Tajweed Masterclass</option>
                  <option value="dua">Khatam Duas & Supplications</option>
                  <option value="juz_guide">Khatam Schedules & Guides</option>
                  <option value="tafsir">Tafsir & Surah Reflections</option>
                  <option value="motivation">Daily Motivation & Virtues</option>
                  <option value="general">General Sacred Wisdom</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                  Duration (MM:SS)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    id="edit-video-duration-input"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 21:40"
                    className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-2xl py-3 pl-9 pr-3 text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">
                  Juz Number (1-30)
                </label>
                <input
                  id="edit-video-juz-input"
                  type="number"
                  min="1"
                  max="30"
                  value={juzNumber}
                  onChange={(e) => setJuzNumber(e.target.value)}
                  placeholder="Optional (1-30)"
                  className="w-full bg-black/50 border border-white/10 focus:border-amber-400 rounded-2xl py-3 px-3 text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            {/* Broadcast Notification to All Users Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent rounded-2xl border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Bell size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Broadcast Notification to All Users</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] rounded font-mono font-bold">REAL-TIME</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Sends an instant push & in-app sanctuary announcement when you save updates
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="toggle-notify-users-btn"
                onClick={() => setNotifyAllUsers(!notifyAllUsers)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  notifyAllUsers
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'bg-white/10 text-slate-400 hover:bg-white/15'
                }`}
              >
                {notifyAllUsers ? '🔔 Notify Enabled' : 'Off'}
              </button>
            </div>

            {/* Featured Hero Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <Star size={16} className={featured ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                <div>
                  <p className="text-xs font-bold text-white">Pin as Featured Video</p>
                  <p className="text-[10px] text-slate-400">Highlights this video at the top of the Khatam Journey sanctuary</p>
                </div>
              </div>

              <button
                type="button"
                id="toggle-featured-btn"
                onClick={() => setFeatured(!featured)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  featured
                    ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/20'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {featured ? '⭐ Featured' : 'Standard'}
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
              {isDefaultVideo ? (
                <button
                  type="button"
                  id="edit-video-reset-btn"
                  onClick={handleResetToDefault}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Reset fields to the built-in default values"
                >
                  <RefreshCw size={13} />
                  <span>Reset to Default</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="edit-video-cancel-btn"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="edit-video-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Save & Broadcast</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
