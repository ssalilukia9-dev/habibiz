import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sparkles, 
  Clock, 
  Calendar, 
  Heart, 
  BookOpen, 
  Sun, 
  Star, 
  ChevronRight, 
  Share2, 
  Volume2, 
  Flame, 
  Award,
  X
} from 'lucide-react';
import { getRamadanStatus, RamadanStatus } from '../services/islamicScheduleService.ts';

interface RamadanCountdownWidgetProps {
  currentTime?: Date;
  onNavigate?: (tab: string, extra?: any) => void;
  addHasanat?: (amount: number) => void;
  onActivateRamadanMode?: () => void;
  onClosePreview?: () => void;
}

export default function RamadanCountdownWidget({
  currentTime,
  onNavigate,
  addHasanat,
  onActivateRamadanMode,
  onClosePreview
}: RamadanCountdownWidgetProps) {
  const [status, setStatus] = useState<RamadanStatus>(() => getRamadanStatus(currentTime));
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [showDuaModal, setShowDuaModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    const update = () => {
      setStatus(getRamadanStatus(currentTime));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [currentTime]);

  const handleShare = async () => {
    const text = `🌙 The Blessed Month of Ramadan is arriving in ${status.daysUntilRamadan} days, ${status.hoursUntilRamadan} hours! May Allah allow us to reach Ramadan in faith and good health. Join me in preparing on Muslim Deen Sanctuary!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ramadan Countdown', text });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const playWelcomeDua = () => {
    if ('speechSynthesis' in window) {
      if (playingAudio) {
        window.speechSynthesis.cancel();
        setPlayingAudio(false);
        return;
      }
      window.speechSynthesis.cancel();
      const dua = "Allahumma ballighna Ramadan. O Allah, let us reach Ramadan in good health and strong faith.";
      const utt = new SpeechSynthesisUtterance(dua);
      utt.rate = 0.85;
      utt.onstart = () => setPlayingAudio(true);
      utt.onend = () => setPlayingAudio(false);
      utt.onerror = () => setPlayingAudio(false);
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div 
      id="ramadan-countdown-widget"
      className="relative overflow-hidden rounded-[2.5rem] border border-amber-400/40 bg-gradient-to-br from-[#1a1408] via-[#0f141c] to-[#0a0612] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_50px_rgba(245,158,11,0.18)] space-y-6"
    >
      {/* Ambient Celestial Glow */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/30 shrink-0">
            <Moon size={26} className="fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Countdown to Ramadan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} /> Holy Month Approaching
              </span>
            </div>
            <p className="text-xs text-amber-200/80 font-medium">
              Expected 1st of Ramadan {status.currentHijriYear} AH • {status.nextRamadanStartStr}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowDuaModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Heart size={13} className="text-amber-400" />
            <span>Welcoming Du'a</span>
          </button>

          <button
            onClick={() => setShowPrepModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen size={13} />
            <span>Prep Checklist</span>
          </button>

          {onActivateRamadanMode && (
            <button
              onClick={onActivateRamadanMode}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Preview Ramadan Mode</span>
            </button>
          )}

          {onClosePreview && (
            <button
              onClick={onClosePreview}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Close Countdown Preview"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Countdown Hero Board */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black/80 via-amber-950/30 to-black/80 border border-amber-400/30 p-5 sm:p-6 shadow-inner">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
                Time Remaining Until 1st Ramadan
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained."
            </p>
            <span className="text-[10px] text-amber-300/80 font-bold block">— Sahih al-Bukhari</span>
          </div>

          {/* 4 Digit Count Tile Blocks */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 font-mono">
            <div className="flex flex-col items-center bg-black/70 border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px]">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                {String(status.daysUntilRamadan).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold font-sans mt-0.5">Days</span>
            </div>

            <div className="flex flex-col items-center bg-black/70 border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px]">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {String(status.hoursUntilRamadan).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold font-sans mt-0.5">Hours</span>
            </div>

            <div className="flex flex-col items-center bg-black/70 border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px]">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {String(status.minutesUntilRamadan).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold font-sans mt-0.5">Mins</span>
            </div>

            <div className="flex flex-col items-center bg-black/70 border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 min-w-[62px]">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {String(status.secondsUntilRamadan).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold font-sans mt-0.5">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Ramadan Spiritual Roadmap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300">
            <BookOpen size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Khatam Quran Goal</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Recite 1 Juz (20 pages) daily to complete the entire Holy Quran during the blessed 30 days.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Flame size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Sha'ban Sunnah Fasts</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Build your spiritual momentum by fasting Mondays, Thursdays, and the lunar White Days.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-400">
            <Heart size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Heart Purification</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Seek forgiveness, restore ties with family, and make frequent Tawbah before the holy month.
          </p>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 size={12} />
            <span>{copiedShare ? 'Copied Link!' : 'Share Countdown with Ummah'}</span>
          </button>

          <button
            onClick={playWelcomeDua}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Volume2 size={12} className={playingAudio ? 'animate-bounce' : ''} />
            <span>Listen Ramadan Du'a</span>
          </button>
        </div>

        <span className="text-[11px] text-amber-200/80 italic">
          "Allahumma Sallimna li-Ramadan" • O Allah, preserve us for Ramadan
        </span>
      </div>

      {/* Welcoming Du'a Modal */}
      <AnimatePresence>
        {showDuaModal && (
          <div key="ramadan-welcoming-dua-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              key="ramadan-welcoming-dua-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#14101e] border border-amber-400/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Welcoming Ramadan Supplication</h4>
                    <p className="text-xs text-amber-200/70">Prophetic and Salaf Du'as</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDuaModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20 space-y-2">
                  <p className="arabic-text text-xl text-amber-200 font-bold dir-rtl text-right leading-loose">
                    اللَّهُمَّ بَلِّغْنَا رَمَضَانَ وَسَلِّمْنَا إِلَى رَمَضَانَ وَتَسَلَّمْهُ مِنَّا مُتَقَبَّلاً
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "Allahumma ballighna Ramadan wa sallimna ila Ramadan wa tasallamhu minna mutaqabbala."
                  </p>
                  <p className="text-xs text-amber-300/90 font-medium">
                    "O Allah, allow us to reach Ramadan, hand us over safely to Ramadan, and accept it from us." (Yahya ibn Abi Kathir)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDuaModal(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all"
              >
                Close & Ameen
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ramadan Preparation Modal */}
      <AnimatePresence>
        {showPrepModal && (
          <div key="ramadan-prep-blueprint-overlay" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              key="ramadan-prep-blueprint-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#14101e] border border-emerald-500/40 p-6 sm:p-7 shadow-2xl space-y-5 text-left max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Ramadan Preparation Blueprint</h4>
                    <p className="text-xs text-emerald-200/70">5 Essential Steps for the Believer</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrepModal(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                {[
                  { num: '1', title: 'Make Up Missed Fasts (Qada)', desc: 'Prioritize paying back any missed days from past years before Ramadan arrives.' },
                  { num: '2', title: 'Set Daily Quran Khatam Goals', desc: '4 pages after each of the 5 prayers equals 1 full Juz daily = 30 Juz completion.' },
                  { num: '3', title: 'Habituate Night Prayers (Tahajjud)', desc: 'Wake up 20 minutes before Fajr starting now to prepare for Qiyam and Suhoor.' },
                  { num: '4', title: 'Allocate Ramadan Sadaqah', desc: 'Prepare daily small acts of charity to multiply your Hasanat in the month of generosity.' },
                  { num: '5', title: 'Digital Detox & Intention', desc: 'Clear distractions and establish a sincere niyyah for spiritual renewal.' }
                ].map((step) => (
                  <div key={step.num} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {step.num}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-white">{step.title}</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowPrepModal(false)}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all"
              >
                Let's Prepare Insha'Allah
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
