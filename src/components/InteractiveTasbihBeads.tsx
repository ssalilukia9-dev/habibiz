import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Volume2, Sparkles, Check, Mic } from 'lucide-react';
import { VoiceTasbihService, RecognizedSupplication } from '../services/voiceTasbihService.ts';

export type BeadTheme = 'amber' | 'emerald' | 'wood' | 'pearl' | 'obsidian';

interface InteractiveTasbihBeadsProps {
  count: number;
  target: number;
  supplication?: Omit<RecognizedSupplication, 'count'> | null;
  onIncrement: () => void;
  onReset?: () => void;
  isVoiceActive?: boolean;
  interimVoiceText?: string;
  className?: string;
  compact?: boolean;
}

const BEAD_THEMES: Record<BeadTheme, {
  name: string;
  beadClass: string;
  activeBeadClass: string;
  markerClass: string;
  glowClass: string;
  sound: 'amber' | 'wood' | 'crystal';
}> = {
  amber: {
    name: 'Royal Amber',
    beadClass: 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-800 border-amber-300/40 shadow-amber-500/30',
    activeBeadClass: 'bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border-white shadow-amber-400/80 scale-125',
    markerClass: 'bg-gradient-to-br from-yellow-100 via-amber-300 to-amber-900 border-yellow-200 shadow-yellow-500/50',
    glowClass: 'from-amber-500/20 to-orange-500/5',
    sound: 'amber'
  },
  emerald: {
    name: 'Sacred Jade',
    beadClass: 'bg-gradient-to-br from-emerald-300 via-emerald-600 to-emerald-950 border-emerald-300/40 shadow-emerald-500/30',
    activeBeadClass: 'bg-gradient-to-br from-emerald-200 via-emerald-400 to-emerald-700 border-white shadow-emerald-400/80 scale-125',
    markerClass: 'bg-gradient-to-br from-teal-100 via-emerald-300 to-emerald-900 border-teal-200 shadow-emerald-500/50',
    glowClass: 'from-emerald-500/20 to-teal-500/5',
    sound: 'crystal'
  },
  wood: {
    name: 'Oud Wood',
    beadClass: 'bg-gradient-to-br from-amber-700 via-yellow-900 to-amber-950 border-amber-600/30 shadow-black/40',
    activeBeadClass: 'bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 border-amber-300 shadow-amber-700/60 scale-125',
    markerClass: 'bg-gradient-to-br from-amber-400 via-amber-700 to-black border-amber-400 shadow-amber-900/50',
    glowClass: 'from-amber-900/20 to-yellow-950/5',
    sound: 'wood'
  },
  pearl: {
    name: 'Luminous Pearl',
    beadClass: 'bg-gradient-to-br from-white via-slate-100 to-slate-400 border-white/60 shadow-white/20',
    activeBeadClass: 'bg-gradient-to-br from-white via-amber-50 to-slate-200 border-white shadow-white/80 scale-125',
    markerClass: 'bg-gradient-to-br from-amber-100 via-slate-200 to-slate-500 border-amber-200 shadow-slate-300/50',
    glowClass: 'from-slate-200/20 to-amber-100/5',
    sound: 'crystal'
  },
  obsidian: {
    name: 'Midnight Gold',
    beadClass: 'bg-gradient-to-br from-slate-700 via-slate-900 to-black border-amber-500/40 shadow-black/60',
    activeBeadClass: 'bg-gradient-to-br from-slate-600 via-slate-800 to-black border-amber-400 shadow-amber-500/50 scale-125',
    markerClass: 'bg-gradient-to-br from-amber-300 via-slate-800 to-black border-amber-400 shadow-amber-500/40',
    glowClass: 'from-amber-600/15 to-slate-900/10',
    sound: 'amber'
  }
};

const TOTAL_VISIBLE_BEADS = 33;

export default function InteractiveTasbihBeads({
  count,
  target,
  supplication,
  onIncrement,
  onReset,
  isVoiceActive = false,
  interimVoiceText = '',
  className = '',
  compact = false
}: InteractiveTasbihBeadsProps) {
  const [selectedTheme, setSelectedTheme] = useState<BeadTheme>(() => {
    return (localStorage.getItem('tasbih-bead-theme') as BeadTheme) || 'amber';
  });

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [clickScale, setClickScale] = useState(false);
  const rippleIdRef = useRef(0);

  const themeConfig = BEAD_THEMES[selectedTheme] || BEAD_THEMES.amber;

  const handleThemeChange = (theme: BeadTheme) => {
    setSelectedTheme(theme);
    localStorage.setItem('tasbih-bead-theme', theme);
    VoiceTasbihService.playBeadSound(BEAD_THEMES[theme].sound);
  };

  const handleBeadClick = (e?: React.MouseEvent) => {
    onIncrement();
    VoiceTasbihService.playBeadSound(themeConfig.sound);

    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;
      setRipples(prev => [...prev.slice(-3), { id, x, y }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 700);
    }

    setClickScale(true);
    setTimeout(() => setClickScale(false), 120);

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  // Rotation calculation: every count advances the ring by (360 / TOTAL_VISIBLE_BEADS) degrees
  const beadStepAngle = 360 / TOTAL_VISIBLE_BEADS;
  const currentRotation = -(count * beadStepAngle);
  const activeIndex = count % TOTAL_VISIBLE_BEADS;
  const progressPercent = Math.min(100, Math.round((count / Math.max(1, target)) * 100));

  // Radius of the circular bead ring
  const radius = compact ? 115 : 145;
  const beadDiameter = compact ? 22 : 26;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Bead Material Selector */}
      <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full mb-4">
        {(Object.keys(BEAD_THEMES) as BeadTheme[]).map((themeKey) => {
          const t = BEAD_THEMES[themeKey];
          const isSelected = selectedTheme === themeKey;
          return (
            <button
              key={themeKey}
              onClick={() => handleThemeChange(themeKey)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-white/20 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title={t.name}
            >
              <span className={`w-2.5 h-2.5 rounded-full shadow-inner border border-white/40 ${t.beadClass}`} />
              <span className="hidden sm:inline">{t.name.split(' ')[1] || t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Moving Bead Ring Stage */}
      <div 
        className="relative flex items-center justify-center cursor-pointer group"
        style={{
          width: compact ? 300 : 360,
          height: compact ? 300 : 360
        }}
        onClick={(e) => handleBeadClick(e)}
      >
        {/* Ambient Glow Backdrop */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${themeConfig.glowClass} blur-2xl pointer-events-none transition-all`} />

        {/* Outer Circular Track & Minaret/Tassel accent */}
        <div className="absolute inset-4 rounded-full border border-white/5 shadow-inner pointer-events-none" />

        {/* Rotating Circular Rosary Beads */}
        <motion.div
          animate={{ rotate: currentRotation }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {Array.from({ length: TOTAL_VISIBLE_BEADS }).map((_, idx) => {
            const angle = (idx * beadStepAngle) * (Math.PI / 180);
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;
            const isMarker = idx % 11 === 0;
            const isCurrentActive = idx === activeIndex;

            return (
              <motion.div
                key={idx}
                className="absolute flex items-center justify-center"
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
              >
                {/* Physical Bead sphere */}
                <div
                  style={{
                    width: isMarker ? beadDiameter + 4 : beadDiameter,
                    height: isMarker ? beadDiameter + 4 : beadDiameter
                  }}
                  className={`rounded-full border shadow-lg transition-transform duration-200 relative ${
                    isCurrentActive
                      ? themeConfig.activeBeadClass
                      : isMarker
                      ? themeConfig.markerClass
                      : themeConfig.beadClass
                  }`}
                >
                  {/* Gloss Specular Highlight */}
                  <div className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-white/70 blur-[0.3px]" />
                  {isMarker && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-amber-200/90" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Center Digital / Arabic Counter Core */}
        <motion.div
          animate={{ scale: clickScale ? 0.94 : 1 }}
          transition={{ duration: 0.1 }}
          className={`relative z-10 rounded-full flex flex-col items-center justify-center p-6 text-center backdrop-blur-xl border border-white/15 shadow-2xl transition-all ${
            compact ? 'w-44 h-44' : 'w-56 h-56'
          } bg-slate-900/90 group-hover:border-brand-primary/40`}
        >
          {/* Progress Ring SVG */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1.5">
            <circle
              cx="50%"
              cy="50%"
              r="47%"
              className="stroke-white/5 fill-none"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="47%"
              className="stroke-brand-primary fill-none transition-all duration-300"
              strokeWidth="4"
              strokeDasharray="295"
              strokeDashoffset={295 - (295 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Click Ripple feedback */}
          {ripples.map(r => (
            <motion.span
              key={r.id}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute w-20 h-20 rounded-full bg-brand-primary/30 pointer-events-none"
              style={{ left: r.x - 40, top: r.y - 40 }}
            />
          ))}

          {/* Center Supplication Arabic Text */}
          <div className="flex flex-col items-center justify-center space-y-1 my-auto max-w-[85%]">
            {supplication ? (
              <>
                <p className="font-arabic text-amber-200 text-lg md:text-xl font-bold leading-relaxed line-clamp-1">
                  {supplication.arabic}
                </p>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider line-clamp-1">
                  {supplication.transliteration || supplication.name}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                Continuous Dhikr
              </p>
            )}

            {/* Big Digital Count */}
            <div className="flex items-baseline gap-1 py-0.5">
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow">
                {count}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                / {target}
              </span>
            </div>

            {/* Tap instruction or Voice indicator */}
            {isVoiceActive ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 animate-pulse">
                <Mic size={10} />
                <span>Voice Listening</span>
              </div>
            ) : (
              <span className="text-[10px] font-medium text-slate-400 group-hover:text-brand-primary transition-colors">
                Tap bead or center to count
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Interim voice feedback if talking */}
      <AnimatePresence>
        {isVoiceActive && interimVoiceText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 px-3 py-1 rounded-full bg-black/60 border border-brand-primary/30 text-xs text-amber-300 font-medium italic flex items-center gap-2"
          >
            <Sparkles size={12} className="text-amber-400 animate-spin" />
            <span>"{interimVoiceText}"</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Progress Bar & Reset Action */}
      <div className="w-full max-w-xs mt-4 flex items-center justify-between gap-3 px-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-full h-2 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary to-emerald-400 rounded-full"
            style={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 200 }}
          />
        </div>

        {onReset && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10"
            title="Reset tasbih count to 0"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
