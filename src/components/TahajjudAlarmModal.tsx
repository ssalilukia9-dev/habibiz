import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sparkles, Bell, BellOff, Volume2, X, ArrowRight, Heart, Check, Clock } from 'lucide-react';
import { TahajjudAlarmService } from '../services/tahajjudAlarmService.ts';

interface TahajjudAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAdhkar?: () => void;
  addHasanat?: (amount: number) => void;
  alarmInfo?: {
    timeStr?: string;
    label?: string;
    message?: string;
  };
}

export default function TahajjudAlarmModal({
  isOpen,
  onClose,
  onNavigateToAdhkar,
  addHasanat,
  alarmInfo
}: TahajjudAlarmModalProps) {
  const [hasClaimedHasanat, setHasClaimedHasanat] = useState(false);
  const [snoozeFeedback, setSnoozeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHasClaimedHasanat(false);
      setSnoozeFeedback(null);
    }
  }, [isOpen]);

  const handleDismiss = () => {
    TahajjudAlarmService.stopAlarm();
    TahajjudAlarmService.cancelSnooze();
    onClose();
  };

  const handleSnooze = (minutes: 5 | 10) => {
    TahajjudAlarmService.snooze(minutes);
    const snoozeTimeStr = new Date(Date.now() + minutes * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSnoozeFeedback(`Alarm deferred by ${minutes} minutes (Will ring at ${snoozeTimeStr})`);
    
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleStartQiyam = () => {
    TahajjudAlarmService.stopAlarm();
    TahajjudAlarmService.cancelSnooze();
    if (addHasanat && !hasClaimedHasanat) {
      addHasanat(5);
      setHasClaimedHasanat(true);
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', { 
        detail: { amount: 35, reason: "Answered Tahajjud Vigil! +5 Hasanat!" } 
      }));
    }
    onClose();
    if (onNavigateToAdhkar) {
      onNavigateToAdhkar();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
        
        {/* Backdrop with pulsating nocturnal glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
          onClick={handleDismiss}
        >
          {/* Ambient deep purple & gold glow rings */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0%,rgba(15,10,30,0.8)_60%,rgba(0,0,0,0.95)_100%)] animate-pulse" />
        </motion.div>

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-[2.5rem] bg-gradient-to-b from-[#18112e] via-[#100b20] to-[#0a0714] border-2 border-purple-500/40 p-6 sm:p-8 shadow-[0_0_80px_rgba(168,85,247,0.35)] text-center space-y-6 z-10 overflow-hidden"
        >
          {/* Top Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
            title="Dismiss Alarm"
          >
            <X size={18} />
          </button>

          {/* Animated Glowing Moon Icon with Audio Waves */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-ping" />
            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 to-amber-400 rounded-full opacity-40 blur-md animate-spin-slow" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-700 to-indigo-900 border-2 border-purple-400/60 flex items-center justify-center text-purple-200 shadow-2xl">
              <Moon size={38} className="text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            </div>
          </div>

          {/* Title & Timing Info */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} className="text-amber-400" />
              <span>Last 1/3 of the Night Vigil • Alarm Ringing</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Time for Tahajjud
            </h3>

            <p className="text-xs sm:text-sm text-purple-200/80 font-medium max-w-md mx-auto leading-relaxed">
              "Our Lord descends every night to the lowest heaven when the last third of the night remains, saying: 'Who calls upon Me that I may answer him?'"
            </p>
          </div>

          {/* Tahajjud Sacred Du'a Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-purple-500/20 text-right space-y-2.5 shadow-inner">
            <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold block text-left">
              Prophetic Tahajjud Opening Supplication
            </span>
            <p className="arabic-text text-base sm:text-lg text-amber-200 font-bold leading-loose dir-rtl">
              اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالأَرْضِ وَمَنْ فِيهِنَّ
            </p>
            <p className="text-[11px] text-slate-300 italic text-left font-sans">
              "O Allah! All praise is due to You; You are the Light of the heavens and the earth and whatever is in them."
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleStartQiyam}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Moon size={16} />
              <span>Stand for Qiyam & Adhkar (+35 Hasanat)</span>
              <ArrowRight size={16} />
            </button>

            {snoozeFeedback ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 shadow-inner"
              >
                <Clock size={14} className="text-amber-400 animate-spin" />
                <span>{snoozeFeedback}</span>
              </motion.div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  onClick={() => handleSnooze(5)}
                  className="py-3 bg-white/5 hover:bg-purple-500/20 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-purple-500/20 hover:border-purple-400/40 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Defer alarm by 5 minutes"
                >
                  <Clock size={13} className="text-purple-400" />
                  <span>Snooze (5m)</span>
                </button>

                <button
                  onClick={() => handleSnooze(10)}
                  className="py-3 bg-white/5 hover:bg-purple-500/20 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-purple-500/20 hover:border-purple-400/40 flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Defer alarm by 10 minutes"
                >
                  <Clock size={13} className="text-amber-400" />
                  <span>Snooze (10m)</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="py-3 bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-red-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BellOff size={13} />
                  <span>Dismiss</span>
                </button>
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
