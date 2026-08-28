import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Quote, 
  Volume2, 
  VolumeX, 
  Heart, 
  Share2, 
  X, 
  Check, 
  Bookmark, 
  ArrowRight,
  Clock,
  Pause,
  Play
} from 'lucide-react';
import { 
  HopeItem, 
  getHopeItemForDay 
} from '../data/mindEasingHopeData.ts';
import { shareService } from '../services/shareService.ts';
import { notificationService } from '../services/notificationService.ts';

interface MindEasingHopeBeaconProps {
  onClose?: () => void;
  onNavigate?: (tab: string, extra?: any) => void;
  addHasanat?: (amount: number) => void;
  durationSeconds?: number;
}

export default function MindEasingHopeBeacon({ 
  onClose,
  onNavigate, 
  addHasanat,
  durationSeconds = 15
}: MindEasingHopeBeaconProps) {
  // Single specific hope gem for today
  const dailyItem: HopeItem = React.useMemo(() => getHopeItemForDay(), []);

  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 15-second countdown timer
  useEffect(() => {
    if (isPaused || isExpandedModalOpen || isPlayingAudio || timeLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isExpandedModalOpen, isPlayingAudio, timeLeft]);

  // Trigger auto-close when timer reaches 0 cleanly in an effect
  useEffect(() => {
    if (timeLeft <= 0 && !isPaused && !isExpandedModalOpen && !isPlayingAudio) {
      if (timerRef.current) clearInterval(timerRef.current);
      onClose?.();
    }
  }, [timeLeft, isPaused, isExpandedModalOpen, isPlayingAudio, onClose]);

  // Check if current item is bookmarked in local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanctuary_hope_bookmarks');
      if (saved) {
        const list = JSON.parse(saved);
        setIsBookmarked(list.includes(dailyItem.id));
      } else {
        setIsBookmarked(false);
      }
    } catch {
      setIsBookmarked(false);
    }
  }, [dailyItem.id]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      alert("Audio speech playback is not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${dailyItem.title}. ${dailyItem.translation}. ${dailyItem.reflection} ${dailyItem.reference}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.88; // Gentle, soothing tempo
    utterance.pitch = 0.95; // Warm, peaceful tone
    
    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPaused(true); // Pause 15s timer while listening to soothing audio
    };
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPaused(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved = localStorage.getItem('sanctuary_hope_bookmarks');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(dailyItem.id)) {
        list = list.filter(id => id !== dailyItem.id);
        setIsBookmarked(false);
      } else {
        list.push(dailyItem.id);
        setIsBookmarked(true);
        notificationService.notify('Heart Solace Saved', `"${dailyItem.title}" saved to your sanctuary reflections.`, 'system');
        if (addHasanat) addHasanat(10);
      }
      localStorage.setItem('sanctuary_hope_bookmarks', JSON.stringify(list));
    } catch (err) {
      console.warn("Bookmark error:", err);
    }
  };

  const handleCopyText = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `🕊️ *Heart at Ease: ${dailyItem.title}*\n${dailyItem.arabic ? dailyItem.arabic + '\n' : ''}${dailyItem.translation}\n\n💡 *Context & Reflection:*\n${dailyItem.reflection}\n\n📖 *Reference:* ${dailyItem.reference}\n📲 *Shared via Habibi Sanctuary — Daily Serenity Spotlight*`;
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
    if (addHasanat) addHasanat(5);
  };

  const handleShareHope = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareService.open({
      title: `Heart at Ease: ${dailyItem.title}`,
      badge: dailyItem.tag,
      text: `${dailyItem.translation}\n\n${dailyItem.reflection}`,
      arabic: dailyItem.arabic,
      source: dailyItem.reference,
      url: window.location.href
    });
  };

  const handleDismiss = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (onClose) onClose();
  };

  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / durationSeconds) * 100));

  return (
    <motion.div 
      id="mind-easing-hope-beacon"
      initial={{ opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full z-20 overflow-hidden rounded-[2rem] sm:rounded-[2.2rem] bg-gradient-to-br from-[#062118]/98 via-[#081926]/98 to-[#121b14]/98 border border-emerald-400/40 shadow-2xl backdrop-blur-2xl p-4 sm:p-5 group my-1 ring-1 ring-emerald-400/20"
    >
      {/* ⏳ 15-Second Spotlight Animated Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Subtle Ambient Glowing Aurora */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -ml-20 -mb-20" />

      {/* Shimmering Top Accent Line */}
      <motion.div 
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 left-0 h-[2px] w-1/3 bg-gradient-to-r from-transparent via-emerald-300 to-transparent pointer-events-none opacity-70"
      />

      <div className="relative z-10 space-y-4 pt-1">
        {/* Header: Title, 15-Second Spotlight Timer & Skip Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/25 shrink-0">
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">
                  Heart At Ease &bull; سكينة القلب
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Today's Solace
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>{dailyItem.title}</span>
              </h3>
            </div>
          </div>

          {/* 15s Timer Status Badge & Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/50 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold backdrop-blur-md shadow-inner">
              <Clock size={12} className="animate-pulse text-emerald-400" />
              <span>{timeLeft}s remaining</span>
            </div>

            {/* Pause / Resume Timer Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
              title={isPaused ? "Resume auto-timer" : "Pause auto-timer to read longer"}
            >
              {isPaused ? <Play size={13} className="text-emerald-400" /> : <Pause size={13} />}
            </button>

            {/* Direct Transition to Ayah of the Day */}
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Skip directly to Ayah of the Day"
            >
              <span>Ayah of Day</span>
              <ArrowRight size={13} />
            </button>

            {/* Close Button */}
            <button 
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Heart at Ease"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Single Specific Daily Sacred Relief Script & Reflection Box */}
        <div className="space-y-3 bg-black/40 border border-white/5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-md">
          {dailyItem.arabic && (
            <div className="text-right" dir="rtl">
              <p className="font-arabic text-xl sm:text-2xl text-amber-200 leading-[2] tracking-wide selection:bg-amber-500/30">
                {dailyItem.arabic}
              </p>
            </div>
          )}

          <p className="text-sm sm:text-base text-slate-100 font-bold leading-relaxed tracking-tight italic">
            "{dailyItem.translation.replace(/^["“]/, '').replace(/["”]$/, '')}"
          </p>

          {/* Reflection & Mind-Easing Commentary */}
          <div className="pt-2 border-t border-white/5 text-xs text-slate-300 font-medium leading-relaxed space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] uppercase tracking-wider">
              <span>💡 Sacred Solace Context:</span>
            </div>
            <p className="text-slate-300/90 leading-relaxed">
              {dailyItem.reflection}
            </p>
          </div>

          {/* Reference & Tag Footer */}
          <div className="flex items-center justify-between pt-2 text-[10px] font-bold text-slate-400 border-t border-white/5 flex-wrap gap-2">
            <span className="text-amber-300/90 flex items-center gap-1 font-mono">
              <span>📖 {dailyItem.reference}</span>
              {dailyItem.narrator && <span>&bull; Narrated by {dailyItem.narrator}</span>}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-[9px]">
              {dailyItem.tag}
            </span>
          </div>
        </div>

        {/* Interactive Action Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-1.5">
            {/* Audio Voice Recitation */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 animate-pulse'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
              }`}
              title="Listen with serene voice recitation"
            >
              {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span className="hidden sm:inline">{isPlayingAudio ? 'Pause Narration' : 'Serene Voice'}</span>
            </button>

            {/* Read Full Story / Tafsir Modal */}
            {dailyItem.type === 'story' && (
              <button
                onClick={() => {
                  setIsExpandedModalOpen(true);
                  setIsPaused(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                <BookOpen size={13} />
                <span className="hidden sm:inline">Read Full Story</span>
              </button>
            )}
          </div>

          {/* Social & Persistence Actions */}
          <div className="flex items-center gap-1.5">
            {/* Copy Text */}
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
              title="Copy blessing to clipboard"
            >
              {copiedText ? <Check size={14} className="text-emerald-400" /> : <Quote size={14} />}
            </button>

            {/* Bookmark Favorite */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-white/5 border-white/5 text-slate-300 hover:text-white'
              }`}
              title="Save to sanctuary bookmarks"
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-amber-400' : ''} />
            </button>

            {/* Share Hope */}
            <button
              onClick={handleShareHope}
              className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1 text-xs font-black"
              title="Share ray of hope"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📖 Full Mind-Easing Story Reader Modal */}
      <AnimatePresence>
        {isExpandedModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsExpandedModalOpen(false);
                setIsPaused(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-[#09221b] via-[#0b1c2b] to-[#121c16] border border-emerald-400/40 rounded-[2.5rem] p-6 sm:p-8 text-slate-100 shadow-2xl space-y-5 overflow-y-auto max-h-[85vh] z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-xl font-bold">
                    {dailyItem.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Heart-Soothing Story</span>
                    <h3 className="text-lg font-black text-white">{dailyItem.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsExpandedModalOpen(false);
                    setIsPaused(false);
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {dailyItem.arabicTitle && (
                <div className="text-right py-1" dir="rtl">
                  <p className="font-arabic text-xl text-amber-200">{dailyItem.arabicTitle}</p>
                </div>
              )}

              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-sm font-bold text-amber-100 italic">
                {dailyItem.translation}
              </div>

              <div className="space-y-3 text-sm text-slate-200 leading-relaxed font-normal">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
                  <span>📜 Historical Context:</span>
                </div>
                <p className="text-slate-300 bg-white/5 p-3.5 rounded-2xl border border-white/5">
                  {dailyItem.context}
                </p>

                <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider pt-2">
                  <span>🕊️ Divine Solace & Life Lesson:</span>
                </div>
                <p className="whitespace-pre-line text-slate-100 leading-relaxed">
                  {dailyItem.reflection}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-mono text-amber-300">{dailyItem.reference}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareHope}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Share This Story</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsExpandedModalOpen(false);
                      setIsPaused(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
