import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Volume2, VolumeX, Watch } from 'lucide-react';
import habibiFocusSplashBg from '../assets/images/habibi_focus_splash_1786912886877.jpg';

interface SplashScreenProps {
  onEnter?: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gentle synthesized spiritual chime using Web Audio API
  const playHarmonicChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [528, 660, 792, 1056]; // Solfeggio sacred frequency
      
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
        
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.14 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.14 + 2.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.14);
        osc.stop(ctx.currentTime + idx * 0.14 + 2.8);
      });
    } catch (e) {
      console.warn("Audio chime skipped:", e);
    }
  };

  // 8 Seconds smooth loading interval (80ms * 100 steps = 8000ms)
  useEffect(() => {
    const stepDurationMs = 80;
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            if (onEnter) onEnter();
          }, 350);
          return 100;
        }
        return prev + 1;
      });
    }, stepDurationMs);

    return () => clearInterval(timer);
  }, [onEnter]);

  const handleSoundToggle = () => {
    if (!soundEnabled) {
      playHarmonicChime();
    }
    setSoundEnabled(!soundEnabled);
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] bg-[#050807] flex flex-col items-center justify-between overflow-hidden select-none"
    >
      {/* Background Islamic Sunset Copilot Artwork */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-65 md:opacity-80 scale-100 transform-gpu transition-all duration-1000"
        style={{ backgroundImage: `url(${habibiFocusSplashBg})` }}
      />

      {/* Atmospheric Vignette & Sacred Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#040706] via-brand-depth/40 to-black/75 backdrop-blur-[0.5px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18)_0%,rgba(16,185,129,0.1)_45%,transparent_75%)]" />

      {/* Animated Floating Stardust Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0.2 + Math.random() * 0.7,
              y: '105vh',
              x: `${(i * 4.2 + Math.random() * 6)}vw`,
              scale: 0.5 + Math.random() * 0.8
            }}
            animate={{ 
              y: '-10vh',
              opacity: [0.1, 0.85, 0.1],
              scale: [0.5, 1.25, 0.4]
            }}
            transition={{ 
              duration: 7 + Math.random() * 6,
              repeat: Infinity,
              ease: "linear",
              delay: (i * 0.3) % 4
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_#fbbf24]"
          />
        ))}
      </div>

      {/* Top Header: ALOHA GROUP OF COMPANIES + ISIS WRIST + AUDIO TOGGLE */}
      <header className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-6 md:pt-10 flex items-center justify-between gap-4">
        {/* Aloha Group Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 bg-black/45 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-amber-500/25 shadow-2xl"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/30 text-sm">
            🌴
          </div>
          <div className="leading-tight text-left">
            <span className="text-[11px] font-black text-amber-300 tracking-[0.25em] uppercase block">
              ALOHA
            </span>
            <span className="text-[8px] font-bold text-slate-300 tracking-widest uppercase block">
              GROUP OF COMPANIES
            </span>
          </div>
        </motion.div>

        {/* Right side: Isis Wrist + Audio Control + Skip */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          {/* Isis Wrist Companion Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-black/45 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-emerald-500/25 shadow-xl">
            <Watch size={14} className="text-emerald-400 animate-pulse" />
            <div className="leading-tight text-left">
              <span className="text-[10px] font-black text-emerald-300 tracking-[0.2em] uppercase block">
                ISIS WRIST
              </span>
              <span className="text-[7px] font-bold text-slate-400 tracking-widest uppercase block">
                COMPANION
              </span>
            </div>
          </div>

          <button
            onClick={handleSoundToggle}
            className="w-10 h-10 rounded-2xl bg-black/45 backdrop-blur-xl border border-amber-500/25 flex items-center justify-center text-amber-400 hover:text-white hover:bg-amber-500/20 transition-all cursor-pointer shadow-lg"
            title={soundEnabled ? "Mute Sacred Sound" : "Play Sacred Sound"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          {onEnter && (
            <button
              onClick={onEnter}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Skip
            </button>
          )}
        </motion.div>
      </header>

      {/* Center Hero Branding: habibi + hami.code */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 my-auto max-w-2xl">
        {/* Glowing Golden Crescent Emblem with Subtle Hover Pulse */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          className="relative mb-6"
        >
          <motion.div 
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-amber-400/25 rounded-full blur-2xl -m-6 pointer-events-none"
          />

          <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.8rem] bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-[1.5px] shadow-[0_0_45px_rgba(245,158,11,0.4)] relative overflow-hidden group">
            <div className="w-full h-full bg-[#091410]/95 backdrop-blur-xl rounded-[2.7rem] flex flex-col items-center justify-center text-amber-300 relative overflow-hidden">
              <span className="text-4xl md:text-5xl filter drop-shadow-[0_0_15px_rgba(245,158,11,0.85)]">
                🌙
              </span>
              
              {/* Light Sweep Animation */}
              <motion.div 
                animate={{ x: ['-150%', '200%'] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent -skew-x-12 pointer-events-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Title & hami.code badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="space-y-4"
        >
          {/* hami.code Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full shadow-lg">
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-300 uppercase">
              hami.code
            </span>
          </div>

          {/* Clean 2-Word App Name: habibi */}
          <h1 className="text-6xl md:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            habibi
          </h1>

          {/* Isis Wrist Mobile Badge for Small Screens */}
          <div className="sm:hidden flex items-center justify-center gap-2 pt-2">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ISIS WRIST
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer: Serene Sacred Inscription */}
      <footer className="relative z-20 w-full max-w-xl mx-auto px-6 pb-8 md:pb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-2"
        >
          <span className="text-amber-300/90 font-serif text-lg md:text-xl tracking-wide drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)]">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </span>
          <span className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase text-emerald-400/80">
            Aloha Sanctuary • Spiritual Focus
          </span>
        </motion.div>
      </footer>
    </motion.div>
  );
}
