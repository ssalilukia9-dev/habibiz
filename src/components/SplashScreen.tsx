import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ArrowRight, Sparkles, Moon } from 'lucide-react';
import habibiFocusSplashBg from '../assets/images/habibi_focus_splash_1786912886877.jpg';
import FirdawsLogo from './FirdawsLogo';

interface SplashScreenProps {
  onEnter?: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  // 3 distinct animated sequential splash screens:
  // 1. 'aloha' (Official Aloha Group of Companies)
  // 2. 'firdaws' (Official Firdaws Charity Organization)
  // 3. 'habibi' (Habibi Sanctuary Haven with majestic animated background & crescent)
  const [currentScreen, setCurrentScreen] = useState<'aloha' | 'firdaws' | 'habibi'>('aloha');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Synthesized harmonic crystal chime (528Hz Solfeggio frequency)
  const playHarmonicChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const frequencies = [528, 660, 792, 1056, 1320];
      
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.1 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 2.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 2.8);
      });
    } catch (e) {
      console.warn("Audio chime skipped:", e);
    }
  };

  // Screen 1: Aloha Display for 2.8 seconds -> Screen 2: Firdaws
  useEffect(() => {
    if (currentScreen === 'aloha') {
      const timer = setTimeout(() => {
        setCurrentScreen('firdaws');
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Screen 2: Firdaws Display for 2.8 seconds -> Screen 3: Habibi
  useEffect(() => {
    if (currentScreen === 'firdaws') {
      const timer = setTimeout(() => {
        setCurrentScreen('habibi');
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Screen 3: Habibi Display for 3.5 seconds -> Enter application
  useEffect(() => {
    if (currentScreen === 'habibi') {
      const timer = setTimeout(() => {
        if (onEnter) onEnter();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, onEnter]);

  const handleSoundToggle = () => {
    if (!soundEnabled) {
      playHarmonicChime();
    }
    setSoundEnabled(!soundEnabled);
  };

  const handleSkip = () => {
    if (onEnter) onEnter();
  };

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(14px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Top subtle floating controls (Sound & Skip) */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={handleSoundToggle}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md backdrop-blur-md ${
            currentScreen === 'aloha'
              ? 'bg-[#0A3656]/10 text-[#0A3656] hover:bg-[#0A3656]/20 border border-[#0A3656]/20'
              : currentScreen === 'firdaws'
              ? 'bg-[#031F19]/80 text-[#F5D061] border border-emerald-700/40 hover:bg-[#031F19]'
              : 'bg-[#06121C]/80 text-[#F5D061] border border-white/15 hover:bg-white/10'
          }`}
          title={soundEnabled ? "Mute Sound" : "Play Harmonic Chime (528Hz)"}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        <button
          onClick={handleSkip}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md active:scale-95 backdrop-blur-md ${
            currentScreen === 'aloha'
              ? 'bg-[#0A3656] text-[#F5EDE0] hover:bg-[#06243A]'
              : currentScreen === 'firdaws'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5D061] text-[#031F19] hover:brightness-110 shadow-[#D4AF37]/30'
              : 'bg-gradient-to-r from-[#C58F54] to-[#E2B789] text-[#06121C] hover:brightness-110 shadow-[#C58F54]/30'
          }`}
        >
          <span>Skip</span>
          <ArrowRight size={12} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* 1. SEPARATE SCREEN 1: ALOHA GROUP OF COMPANIES (ANIMATED LUXURY REPLICA)  */}
        {/* ========================================================================= */}
        {currentScreen === 'aloha' && (
          <motion.div
            key="screen-aloha"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-[#F5EDE0] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Ambient Radial Lighting & Elegant Rotating Geometry */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,rgba(245,237,224,0.9)_60%,rgba(235,224,208,1)_100%)] pointer-events-none" />
            
            {/* Subtle Animated Compass & Concentric Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="w-[480px] h-[480px] sm:w-[650px] sm:h-[650px] rounded-full border border-[#C58F54]/30 border-dashed"
              />
              <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-[#0A3656]/15" />
            </div>

            {/* Floating Soft Dust Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(14)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2, y: '105vh', x: `${i * 7.2}vw` }}
                  animate={{ opacity: [0.2, 0.65, 0.2], y: '-10vh' }}
                  transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: 'linear', delay: i * 0.25 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#C58F54] to-[#0A3656] opacity-40"
                />
              ))}
            </div>

            {/* Center Animated Brand Lockup */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 max-w-xl mx-auto"
            >
              {/* Four Stylized Waves with Staggered Fluid Wave Animation */}
              <div className="w-32 h-24 sm:w-40 sm:h-30 shrink-0 filter drop-shadow-md">
                <svg viewBox="0 0 200 160" className="w-full h-full" fill="none">
                  {/* Top Wave 1 (Tan Gold) */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                    d="M 95 32 C 120 16, 150 14, 180 26 C 150 32, 125 42, 100 59 C 80 46, 87 36, 95 32 Z"
                    fill="#C58F54"
                  />
                  {/* Top Wave 2 (Tan Gold Light) */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.22, ease: "easeOut" }}
                    d="M 70 56 C 100 36, 140 34, 185 54 C 150 64, 110 74, 75 89 C 60 76, 65 62, 70 56 Z"
                    fill="#B8824A"
                  />
                  {/* Bottom Wave 3 (Deep Royal Navy) */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.34, ease: "easeOut" }}
                    d="M 27 92 C 55 72, 100 72, 145 96 C 170 110, 180 110, 180 110 C 145 122, 100 120, 60 102 C 43 94, 30 92, 27 92 Z"
                    fill="#0A3656"
                  />
                  {/* Bottom Wave 4 (Darkest Navy) */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.46, ease: "easeOut" }}
                    d="M 5 122 C 40 98, 90 100, 135 130 C 165 148, 180 146, 180 146 C 140 162, 85 156, 40 132 C 20 122, 10 122, 5 122 Z"
                    fill="#062A45"
                  />
                </svg>
              </div>

              {/* Animated Typography */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="text-center sm:text-left flex flex-col justify-center"
              >
                <h1 className="text-5xl sm:text-7xl font-black tracking-[0.06em] text-[#0A3656] font-sans leading-none">
                  ALOHA
                </h1>
                <p className="text-lg sm:text-2xl font-medium text-[#0A3656] tracking-normal mt-2.5">
                  Group of Companies
                </p>
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#C58F54] uppercase mt-2">
                  Precision • Innovation • Excellence
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 2. SEPARATE SCREEN 2: FIRDAWS CHARITY ORGANIZATION (ANIMATED PRESTIGE)    */}
        {/* ========================================================================= */}
        {currentScreen === 'firdaws' && (
          <motion.div
            key="screen-firdaws"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-[#031F19] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
          >
            {/* Sacred Emerald Gradient Depth & Radial Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#02130F] via-[#031F19] to-[#042A22]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.2)_0%,rgba(212,175,55,0.08)_45%,transparent_75%)] pointer-events-none" />

            {/* Glowing Golden Particle Sparks */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(18)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2, y: '105vh', x: `${i * 5.6}vw` }}
                  animate={{ opacity: [0.2, 0.8, 0.2], y: '-10vh' }}
                  transition={{ duration: 4.5 + (i % 3), repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-t from-[#D4AF37] to-[#FFF2B2] shadow-[0_0_10px_#F5D061]"
                />
              ))}
            </div>

            {/* Center Animated Firdaws Emblem */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center space-y-5 max-w-md mx-auto"
            >
              {/* Radiant Glow behind Emblem */}
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#D4AF37]/25 rounded-full blur-2xl -m-4 pointer-events-none"
                />
                
                <div className="w-28 h-28 sm:w-36 sm:h-36 filter drop-shadow-[0_6px_30px_rgba(212,175,55,0.5)]">
                  <FirdawsLogo variant="icon" size="xl" />
                </div>
              </div>

              {/* Typography */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="space-y-2"
              >
                <h2 className="text-4xl sm:text-5xl font-black tracking-[0.08em] text-white font-sans">
                  FIRDAWS
                </h2>
                <p className="text-xs sm:text-sm font-black tracking-[0.25em] text-[#F5D061] uppercase">
                  Charity Organization
                </p>
                <p className="text-sm sm:text-base font-serif italic text-emerald-300/90 pt-1">
                  "Empowering Lives, Shaping Futures"
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. SEPARATE SCREEN 3: HABIBI SANCTUARY (THE FULL MAJESTIC SPIRITUAL HAVEN)*/}
        {/* ========================================================================= */}
        {currentScreen === 'habibi' && (
          <motion.div
            key="screen-habibi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#06121C] flex flex-col items-center justify-between p-6 sm:p-10 text-center overflow-hidden"
          >
            {/* Background Texture & Sacred Calligraphy Depth with Parallax/Scale */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 md:opacity-75 scale-105 transform-gpu transition-all duration-1000"
              style={{ 
                backgroundImage: `url(/splash.jpg), url(https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=85&w=1600), url(${habibiFocusSplashBg})` 
              }}
            />

            {/* Obsidian & Deep Oceanic Radial Glow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030910] via-[#06121C]/80 to-[#030910]/95 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(226,183,137,0.25)_0%,rgba(16,185,129,0.08)_40%,transparent_75%)] pointer-events-none" />

            {/* Glowing Golden Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0.2 + Math.random() * 0.7,
                    y: '105vh',
                    x: `${(i * 4.2 + Math.random() * 5)}vw`,
                    scale: 0.5 + Math.random() * 0.8
                  }}
                  animate={{ 
                    y: '-10vh',
                    opacity: [0.15, 0.9, 0.15],
                    scale: [0.5, 1.3, 0.4]
                  }}
                  transition={{ 
                    duration: 5.5 + Math.random() * 4,
                    repeat: Infinity,
                    ease: "linear",
                    delay: (i * 0.2) % 3
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-t from-[#F5D061] to-[#FFE27A] shadow-[0_0_12px_#F5D061]"
                />
              ))}
            </div>

            {/* Top Subtitle Brand Identifier */}
            <div className="relative z-20 w-full flex items-center justify-center pt-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C58F54]/15 border border-[#C58F54]/30 rounded-full shadow-lg backdrop-blur-md"
              >
                <Sparkles size={12} className="text-[#F5D061] animate-pulse" />
                <span className="text-[10px] font-mono font-black tracking-[0.28em] text-[#F5D061] uppercase">
                  Aloha × Firdaws Sanctuary
                </span>
              </motion.div>
            </div>

            {/* Center Hero: Glowing 3D Crescent & Sacred Title */}
            <div className="relative z-20 flex flex-col items-center text-center px-4 my-auto max-w-lg space-y-6">
              {/* 3D Crescent Emblem with Pulsing Aura */}
              <motion.div
                initial={{ scale: 0.75, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="relative"
              >
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.8, 0.35] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-tr from-[#C58F54]/40 via-[#F5D061]/30 to-[#10B981]/20 rounded-full blur-3xl -m-6 pointer-events-none"
                />

                <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.8rem] bg-gradient-to-b from-[#FFE8A3] via-[#C58F54] to-[#0A2A3F] p-[2px] shadow-[0_0_50px_rgba(245,208,97,0.5)] relative overflow-hidden group">
                  <div className="w-full h-full bg-[#040D15]/95 backdrop-blur-xl rounded-[2.7rem] flex flex-col items-center justify-center relative overflow-hidden p-2">
                    {/* Glowing Sacred Crescent & Radiant Star */}
                    <div className="relative flex items-center justify-center">
                      <Moon 
                        size={56} 
                        className="text-[#F5D061] fill-[#F5D061]/25 transform -rotate-12 filter drop-shadow-[0_0_20px_rgba(245,208,97,0.9)]" 
                      />
                      <Sparkles 
                        size={24} 
                        className="text-white absolute -top-1 -right-1 animate-pulse filter drop-shadow-[0_0_12px_#ffffff]" 
                      />
                    </div>
                    
                    {/* Dynamic Light Sweep */}
                    <motion.div 
                      animate={{ x: ['-160%', '220%'] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Title & Slogan */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.9 }}
                className="space-y-3"
              >
                <h1 className="text-5xl md:text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFFBF0] via-[#F5D061] to-[#C58F54] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                  habibi
                </h1>

                <p className="text-xs md:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed font-medium">
                  Your Heart’s Digital Spiritual Haven — Inspiring Peace, Precision Worship & Humanitarian Purpose.
                </p>
              </motion.div>
            </div>

            {/* Bottom Sacred Opening Inscription */}
            <footer className="relative z-20 w-full max-w-md mx-auto text-center pb-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="flex flex-col items-center justify-center gap-1.5"
              >
                <span className="text-[#F5D061] font-serif text-lg md:text-xl tracking-wide drop-shadow-[0_2px_15px_rgba(245,208,97,0.7)]">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <div className="flex items-center justify-center gap-2 text-[8px] font-mono font-bold tracking-[0.25em] uppercase text-slate-400">
                  <span className="text-[#E2B789]">Aloha</span>
                  <span className="text-[#C58F54]">•</span>
                  <span className="text-[#10B981]">Firdaws</span>
                  <span className="text-[#C58F54]">•</span>
                  <span>Habibi Sanctuary</span>
                </div>
              </motion.div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
