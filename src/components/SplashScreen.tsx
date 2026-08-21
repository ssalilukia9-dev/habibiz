import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, VolumeX, Watch, ArrowRight } from 'lucide-react';
import habibiFocusSplashBg from '../assets/images/habibi_focus_splash_1786912886877.jpg';

interface SplashScreenProps {
  onEnter?: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  // Stage 1: 'aloha' (First to appear), Stage 2: 'sanctuary' (Original sanctuary splash screen matching Aloha theme)
  const [currentStage, setCurrentStage] = useState<'aloha' | 'sanctuary'>('aloha');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [progress, setProgress] = useState(0);

  // Gentle synthesized spiritual chime using Web Audio API in 528Hz Solfeggio frequency
  const playHarmonicChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [528, 660, 792, 1056]; // Sacred harmonics
      
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

  // Stage 1: Aloha Splash (Runs for 2.6 seconds, then transitions into sanctuary stage)
  useEffect(() => {
    if (currentStage === 'aloha') {
      const alohaTimer = setTimeout(() => {
        setCurrentStage('sanctuary');
      }, 2600);
      return () => clearTimeout(alohaTimer);
    }
  }, [currentStage]);

  // Stage 2: Sanctuary loading progress (5 seconds smooth progress)
  useEffect(() => {
    if (currentStage === 'sanctuary') {
      const stepDurationMs = 50;
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
    }
  }, [currentStage, onEnter]);

  const handleSoundToggle = () => {
    if (!soundEnabled) {
      playHarmonicChime();
    }
    setSoundEnabled(!soundEnabled);
  };

  const handleSkipAll = () => {
    if (onEnter) onEnter();
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between overflow-hidden select-none"
    >
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* STAGE 1: FIRST TO APPEAR - ALOHA GROUP OF COMPANIES SPLASH SCREEN        */}
        {/* ========================================================================= */}
        {currentStage === 'aloha' && (
          <motion.div
            key="aloha-splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-[#F4EFE6] flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden"
          >
            {/* Soft Warm Linen Background Overlay & Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.92)_0%,rgba(244,239,230,0.65)_60%,rgba(230,222,208,0.95)_100%)]" />
            
            {/* Floating Aloha Gold & Teal Particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(14)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.15, y: '100vh', x: `${i * 7}vw` }}
                  animate={{ opacity: [0.15, 0.45, 0.15], y: '-10vh' }}
                  transition={{ duration: 6 + (i % 3), repeat: Infinity, ease: 'linear' }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#C58F54]/50 blur-[0.5px]"
                />
              ))}
            </div>

            {/* Top Bar with Skip */}
            <header className="relative z-10 w-full max-w-5xl flex items-center justify-between">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A2A3F]/5 border border-[#0A2A3F]/10">
                <span className="w-2 h-2 rounded-full bg-[#C58F54] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#0A2A3F]/80">
                  Global Partner
                </span>
              </div>

              <button
                onClick={() => setCurrentStage('sanctuary')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0A2A3F]/10 hover:bg-[#0A2A3F]/15 text-[10px] font-black uppercase tracking-widest text-[#0A2A3F] transition-all cursor-pointer border border-[#0A2A3F]/15"
              >
                <span>Continue</span>
                <ArrowRight size={12} />
              </button>
            </header>

            {/* Center: Aloha Authentic Wave Logo & Typography */}
            <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-6 max-w-md">
              {/* Animated Wave Emblem + Wordmark Container */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6"
              >
                {/* Flowing Navy and Copper-Gold Waves SVG */}
                <div className="w-24 h-20 md:w-32 md:h-24 shrink-0 relative filter drop-shadow-md">
                  <svg viewBox="0 0 180 150" className="w-full h-full">
                    <defs>
                      <linearGradient id="alohaGoldUpper" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E2B789" />
                        <stop offset="100%" stopColor="#C58F54" />
                      </linearGradient>
                      <linearGradient id="alohaGoldLower" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4A373" />
                        <stop offset="100%" stopColor="#A97138" />
                      </linearGradient>
                      <linearGradient id="alohaNavyUpper" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1B4D6E" />
                        <stop offset="100%" stopColor="#0D3049" />
                      </linearGradient>
                      <linearGradient id="alohaNavyLower" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0F3B56" />
                        <stop offset="100%" stopColor="#061C2C" />
                      </linearGradient>
                    </defs>

                    {/* Top Gold Wave Upper */}
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                      d="M 90 28 C 115 12, 145 10, 175 22 C 145 28, 120 38, 95 55 C 75 42, 82 32, 90 28 Z" 
                      fill="url(#alohaGoldUpper)" 
                    />
                    
                    {/* Middle Gold Wave Main */}
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.1 }}
                      d="M 65 52 C 95 32, 135 30, 180 50 C 145 60, 105 70, 70 85 C 55 72, 60 58, 65 52 Z" 
                      fill="url(#alohaGoldLower)" 
                    />
                    
                    {/* Upper Navy Wave */}
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      d="M 22 88 C 50 68, 95 68, 140 92 C 165 106, 175 106, 175 106 C 140 118, 95 116, 55 98 C 38 90, 25 88, 22 88 Z" 
                      fill="url(#alohaNavyUpper)" 
                    />
                    
                    {/* Lower Deep Navy Wave */}
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      d="M 0 118 C 35 94, 85 96, 130 126 C 160 144, 175 142, 175 142 C 135 158, 80 152, 35 128 C 15 118, 5 118, 0 118 Z" 
                      fill="url(#alohaNavyLower)" 
                    />
                  </svg>
                </div>

                {/* Typography: ALOHA Group of Companies */}
                <div className="text-center sm:text-left leading-tight">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-[0.12em] text-[#0A2A3F] font-sans">
                    ALOHA
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#0A2A3F]/80 mt-1">
                    Group of Companies
                  </p>
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8C7A6B] pt-4 border-t border-[#0A2A3F]/10 w-full"
              >
                In Partnership with Digital Sanctuary
              </motion.p>
            </div>

            {/* Bottom Footer */}
            <footer className="relative z-10 text-center">
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] uppercase text-[#0A2A3F]/60">
                Precision • Innovation • Excellence
              </span>
            </footer>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: REDESIGNED SANCTUARY SPLASH SCREEN (MATCHING ALOHA THEME)        */}
        {/* ========================================================================= */}
        {currentStage === 'sanctuary' && (
          <motion.div
            key="sanctuary-splash"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#0A1C2A] flex flex-col items-center justify-between overflow-hidden"
          >
            {/* Background Islamic Calligraphy & Watercolor Splashes Art (splash.jpg / splash.svg) */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75 md:opacity-90 scale-105 transform-gpu transition-all duration-1000"
              style={{ 
                backgroundImage: `url(/splash.jpg), url(https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=85&w=1600), url(/splash.svg), url(${habibiFocusSplashBg})` 
              }}
            />

            {/* Aloha Deep Oceanic Navy & Warm Bronze Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#06121C] via-[#0A1C2A]/75 to-[#06121C]/90 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,143,84,0.25)_0%,rgba(27,77,110,0.2)_45%,transparent_80%)]" />

            {/* Animated Floating Stardust Particles matching Aloha Bronze Gold */}
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
                    opacity: [0.15, 0.85, 0.15],
                    scale: [0.5, 1.25, 0.4]
                  }}
                  transition={{ 
                    duration: 7 + Math.random() * 6,
                    repeat: Infinity,
                    ease: "linear",
                    delay: (i * 0.3) % 4
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#E2B789] shadow-[0_0_10px_#c58f54]"
                />
              ))}
            </div>

            {/* Top Header: ALOHA GROUP BADGE + ISIS WRIST + AUDIO CHIME + SKIP */}
            <header className="relative z-20 w-full max-w-5xl mx-auto px-6 pt-6 md:pt-10 flex items-center justify-between gap-4">
              {/* Aloha Group of Companies Brand Badge in Sanctuary */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-3 bg-[#06121C]/70 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-[#C58F54]/30 shadow-2xl"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#E2B789] to-[#C58F54] flex items-center justify-center text-[#06121C] font-black shadow-lg shadow-[#C58F54]/30 text-xs">
                  🌴
                </div>
                <div className="leading-tight text-left">
                  <span className="text-[11px] font-black text-[#E2B789] tracking-[0.25em] uppercase block">
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
                {/* Isis Wrist Companion Badge in Aloha Theme */}
                <div className="hidden sm:flex items-center gap-2 bg-[#06121C]/70 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-[#1B4D6E]/50 shadow-xl">
                  <Watch size={14} className="text-[#E2B789] animate-pulse" />
                  <div className="leading-tight text-left">
                    <span className="text-[10px] font-black text-[#E2B789] tracking-[0.2em] uppercase block">
                      ISIS WRIST
                    </span>
                    <span className="text-[7px] font-bold text-slate-400 tracking-widest uppercase block">
                      COMPANION
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSoundToggle}
                  className="w-10 h-10 rounded-2xl bg-[#06121C]/70 backdrop-blur-xl border border-[#C58F54]/30 flex items-center justify-center text-[#E2B789] hover:text-white hover:bg-[#C58F54]/20 transition-all cursor-pointer shadow-lg"
                  title={soundEnabled ? "Mute Sacred Sound" : "Play Sacred Sound (528Hz)"}
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                
                <button
                  onClick={handleSkipAll}
                  className="px-4 py-2 rounded-2xl bg-[#F4EFE6]/10 hover:bg-[#F4EFE6]/20 backdrop-blur-xl border border-[#F4EFE6]/20 text-[10px] font-black uppercase tracking-widest text-[#FDFBF7] transition-all cursor-pointer"
                >
                  Skip
                </button>
              </motion.div>
            </header>

            {/* Center Hero Branding: Aloha x Habibi + hami.code */}
            <div className="relative z-20 flex flex-col items-center text-center px-4 my-auto max-w-2xl">
              {/* Glowing Bronze-Gold Crescent Emblem in Aloha Oceanic Frame */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 25 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="relative mb-6"
              >
                <motion.div 
                  animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.75, 0.35] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#C58F54]/30 rounded-full blur-2xl -m-6 pointer-events-none"
                />

                <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.8rem] bg-gradient-to-b from-[#E2B789] via-[#C58F54] to-[#1B4D6E] p-[1.5px] shadow-[0_0_45px_rgba(197,143,84,0.45)] relative overflow-hidden group">
                  <div className="w-full h-full bg-[#06121C]/95 backdrop-blur-xl rounded-[2.7rem] flex flex-col items-center justify-center text-[#E2B789] relative overflow-hidden">
                    <span className="text-4xl md:text-5xl filter drop-shadow-[0_0_15px_rgba(197,143,84,0.9)]">
                      🌙
                    </span>
                    
                    {/* Light Sweep Animation */}
                    <motion.div 
                      animate={{ x: ['-150%', '200%'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E2B789]/35 to-transparent -skew-x-12 pointer-events-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Title & hami.code badge in Aloha Theme */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.9 }}
                className="space-y-4"
              >
                {/* hami.code Pill in Aloha Bronze */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#C58F54]/15 border border-[#C58F54]/35 rounded-full shadow-lg">
                  <Sparkles size={12} className="text-[#E2B789] animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#E2B789] uppercase">
                    hami.code
                  </span>
                </div>

                {/* Clean 2-Word App Name in Aloha Warm Linen-Gold Gradient */}
                <h1 className="text-6xl md:text-8xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FDFBF7] via-[#E2B789] to-[#C58F54] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                  habibi
                </h1>

                {/* Isis Wrist Mobile Badge for Small Screens */}
                <div className="sm:hidden flex items-center justify-center gap-2 pt-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#E2B789] bg-[#C58F54]/15 px-3 py-1 rounded-full border border-[#C58F54]/30">
                    ISIS WRIST
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Footer: Serene Sacred Inscription in Aloha Linen Gold */}
            <footer className="relative z-20 w-full max-w-xl mx-auto px-6 pb-8 md:pb-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-2"
              >
                <span className="text-[#E2B789] font-serif text-lg md:text-xl tracking-wide drop-shadow-[0_2px_12px_rgba(197,143,84,0.6)]">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <span className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase text-[#CBD5E1]/80">
                  Aloha Sanctuary • Spiritual Focus
                </span>
              </motion.div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
