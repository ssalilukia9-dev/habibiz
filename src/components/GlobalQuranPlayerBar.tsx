import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  X
} from 'lucide-react';
import { QuranAudioService, QuranAudioState } from '../services/quranAudioService';
import { SURAH_LIST } from '../constants';
import { useNavigate } from 'react-router-dom';

interface GlobalQuranPlayerBarProps {
  currentViewingSurahNumber?: number | null;
  isInSurahView?: boolean;
}

export default function GlobalQuranPlayerBar({
  currentViewingSurahNumber = null,
  isInSurahView = false
}: GlobalQuranPlayerBarProps) {
  const [audioState, setAudioState] = useState<QuranAudioState>(QuranAudioService.getState());
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = QuranAudioService.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // If no track is loaded, don't show the player
  if (!audioState.currentTrack) {
    return null;
  }

  // If user is actively viewing the exact same Surah in detail mode,
  // the in-surah player bar handles playback controls to prevent visual overlap
  if (isInSurahView && currentViewingSurahNumber === audioState.currentTrack.surahNumber) {
    return null;
  }

  const { currentTrack, isPlaying, isLoading, reciterName, progress, currentTime, duration, playbackRate } = audioState;
  const surahInfo = SURAH_LIST.find(s => s.number === currentTrack.surahNumber);
  const progressPercent = Math.max(0, Math.min(100, (progress || 0) * 100));

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    QuranAudioService.seekProgress(fraction);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const frac = Math.max(0, Math.min(1, hoverX / rect.width));
    setHoverProgress(frac);
  };

  const handleMouseLeave = () => {
    setHoverProgress(null);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const curIdx = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(curIdx + 1) % speeds.length];
    QuranAudioService.setPlaybackRate(nextSpeed);
  };

  const handleStopAndClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    QuranAudioService.stop();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="fixed z-50 left-3 right-3 md:left-auto md:right-6 md:w-[420px] bottom-[76px] md:bottom-6 pointer-events-auto"
      >
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0f172a]/95 via-[#090d16]/98 to-[#05070a] border border-brand-primary/30 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden text-white">
          
          {/* Top Progress Scrub Bar with Glowing Handle & Smooth Transitions */}
          <div 
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="group relative h-2.5 w-full bg-slate-900/90 hover:h-3 transition-all duration-200 cursor-pointer select-none flex items-center overflow-visible"
            title={hoverProgress !== null && duration ? `Seek to ${formatTime(hoverProgress * duration)}` : "Click to seek"}
          >
            {/* Background Track Line */}
            <div className="absolute inset-x-0 h-1 group-hover:h-1.5 bg-white/10 transition-all" />

            {/* Hover Track Preview */}
            {hoverProgress !== null && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white/15 pointer-events-none transition-opacity duration-150"
                style={{ width: `${hoverProgress * 100}%` }}
              />
            )}

            {/* Active Filled Progress Track with Smooth Width Interpolation */}
            <div 
              className="relative h-1 group-hover:h-1.5 bg-gradient-to-r from-amber-400 via-brand-primary to-emerald-400 transition-[width] duration-300 ease-out rounded-r-full"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Soft luminous halo at leading edge */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400/40 rounded-full blur-[4px] pointer-events-none" />
            </div>

            {/* Glowing Seeker Handle Knob */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-[left] duration-300 ease-out z-20 flex items-center justify-center"
              style={{ left: `${progressPercent}%` }}
            >
              {/* Ambient Glow Aura */}
              <div className="absolute w-5 h-5 rounded-full bg-amber-400/30 blur-sm group-hover:bg-amber-400/60 group-hover:w-6 group-hover:h-6 transition-all duration-200" />
              
              {/* Active Audio Pulse Ring when playing */}
              {isPlaying && (
                <div className="absolute w-4 h-4 rounded-full bg-amber-400/40 animate-ping opacity-60 pointer-events-none" />
              )}

              {/* Core Handle */}
              <div className="relative w-2.5 h-2.5 group-hover:w-3.5 group-hover:h-3.5 rounded-full bg-gradient-to-br from-white via-amber-100 to-amber-300 border border-brand-primary/80 shadow-[0_0_10px_2px_rgba(245,158,11,0.7)] group-hover:shadow-[0_0_14px_4px_rgba(245,158,11,0.9)] transition-all duration-200 transform flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-amber-700/80 group-hover:bg-amber-900" />
              </div>
            </div>

            {/* Loading Shimmer Indicator */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse pointer-events-none" />
            )}
          </div>

          {/* Main Bar Content */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              
              {/* Surah Number / Ornament */}
              <button
                onClick={() => {
                  if (surahInfo) {
                    navigate('/resources', { state: { activeRes: 'quran', selectedSurah: surahInfo } });
                  }
                }}
                className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-brand-primary/25 to-brand-primary/5 border border-brand-primary/40 flex items-center justify-center shrink-0 shadow-inner group hover:scale-105 transition-transform cursor-pointer"
                title="View Surah"
              >
                <div className="text-center">
                  <span className="text-[9px] font-black text-brand-primary block leading-none">
                    {currentTrack.surahNumber}
                  </span>
                  <span className="text-[7px] text-slate-400 uppercase font-mono block mt-0.5">
                    AYAH {currentTrack.numberInSurah}
                  </span>
                </div>
                
                {isPlaying && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>

              {/* Title & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white tracking-wide truncate">
                    Surah {surahInfo?.englishName || currentTrack.surahEnglishName || `Surah ${currentTrack.surahNumber}`}
                  </h4>
                  <span className="text-[10px] text-brand-primary font-arabic font-bold shrink-0">
                    {surahInfo?.name || currentTrack.surahName || ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {reciterName}
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => QuranAudioService.playPrevious()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Previous Verse"
                >
                  <SkipBack size={15} />
                </button>

                <button
                  onClick={() => QuranAudioService.togglePlay()}
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-amber-500 text-brand-depth font-bold flex items-center justify-center shadow-lg shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <button
                  onClick={() => QuranAudioService.playNext()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Next Verse"
                >
                  <SkipForward size={15} />
                </button>

                {/* Speed Toggle */}
                <button
                  onClick={cycleSpeed}
                  className="px-1.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[9px] font-mono text-slate-300 border border-white/10 transition-colors cursor-pointer"
                  title="Playback speed"
                >
                  {playbackRate}x
                </button>

                {/* Dismiss & Completely Stop Recitation */}
                <button
                  onClick={handleStopAndClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer ml-0.5"
                  title="Stop and Close Player"
                >
                  <X size={15} />
                </button>
              </div>

            </div>

            {/* Arabic Live Verse Teaser */}
            {currentTrack.textArabic && (
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-3 text-right">
                <span className="text-[8px] font-mono uppercase tracking-wider text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0 font-semibold">
                  Continuous Background Play
                </span>
                <p className="font-arabic text-xs text-amber-200/90 truncate dir-rtl flex-1">
                  {currentTrack.textArabic}
                </p>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
