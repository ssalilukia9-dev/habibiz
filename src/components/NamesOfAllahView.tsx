import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Volume2, 
  Pause, 
  Play, 
  FastForward, 
  Rewind, 
  Check, 
  RotateCcw, 
  Languages,
  BookOpen,
  Heart,
  Repeat,
  Sliders,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';
import { ALL_NAMES_OF_ALLAH, NameOfAllah } from '../data/namesOfAllahData.ts';
import { VoiceService, VoicePlaybackState, ContinuousPlayItem } from '../services/voiceService.ts';

export default function NamesOfAllahView({ searchQuery = '' }: { searchQuery: string }) {
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(VoiceService.getState());
  const [recitationMode, setRecitationMode] = useState<'arabic' | 'english' | 'both'>('both');
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [learnedMap, setLearnedMap] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('sanctuary_learned_names') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const unsub = VoiceService.subscribe((state) => {
      setPlaybackState(state);
      // Auto-scroll to active card in continuous playlist
      if (state.isContinuous && state.currentIndex >= 0 && state.currentIndex < ALL_NAMES_OF_ALLAH.length) {
        const activeName = ALL_NAMES_OF_ALLAH[state.currentIndex];
        if (activeName && cardRefs.current[activeName.id]) {
          cardRefs.current[activeName.id]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    });

    return () => {
      unsub();
      VoiceService.stop();
    };
  }, []);

  const toggleLearned = (id: number) => {
    setLearnedMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('sanctuary_learned_names', JSON.stringify(next));
      return next;
    });
  };

  const handlePlayArabic = (n: NameOfAllah, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = `name-ar-${n.id}`;
    if (playbackState.isPlaying && playbackState.activeId === id) {
      VoiceService.stop();
    } else {
      VoiceService.speakArabic(n.arabic, id);
    }
  };

  const handlePlayEnglish = (n: NameOfAllah, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = `name-en-${n.id}`;
    if (playbackState.isPlaying && playbackState.activeId === id) {
      VoiceService.stop();
    } else {
      const enText = `${n.transliteration}. ${n.english}. ${n.meaning}`;
      VoiceService.speakEnglish(enText, id);
    }
  };

  const handlePlayBoth = (n: NameOfAllah, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = `name-both-${n.id}`;
    if (playbackState.isPlaying && playbackState.activeId === id) {
      VoiceService.stop();
    } else {
      const enText = `${n.transliteration}. ${n.english}. ${n.meaning}`;
      VoiceService.speakBoth(n.arabic, enText, id);
    }
  };

  // Convert Names array into Continuous Queue format
  const continuousItems: ContinuousPlayItem[] = ALL_NAMES_OF_ALLAH.map(n => ({
    id: n.id,
    arabic: n.arabic,
    transliteration: n.transliteration,
    english: `${n.english}. ${n.meaning}`,
    title: `${n.id}. ${n.transliteration}`
  }));

  const startContinuousRecitation = (startIndex: number = 0) => {
    VoiceService.startContinuousPlay(
      continuousItems,
      {
        mode: recitationMode,
        intervalMs: 650,
        loop: isLooping
      },
      startIndex
    );
  };

  const toggleContinuousPlay = () => {
    if (playbackState.isContinuous) {
      VoiceService.togglePauseContinuous();
    } else {
      startContinuousRecitation(0);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    VoiceService.setRate(newSpeed);
  };

  const query = searchQuery.toLowerCase().trim();
  const filteredNames = ALL_NAMES_OF_ALLAH.filter(n => 
    n.transliteration.toLowerCase().includes(query) ||
    n.english.toLowerCase().includes(query) ||
    n.meaning.toLowerCase().includes(query) ||
    n.arabic.includes(searchQuery.trim()) ||
    n.id.toString() === query
  );

  const learnedCount = Object.values(learnedMap).filter(Boolean).length;
  const progressPercent = Math.round((learnedCount / 99) * 100);

  const activeIndex = playbackState.isContinuous ? playbackState.currentIndex : -1;
  const currentActiveName = activeIndex >= 0 ? ALL_NAMES_OF_ALLAH[activeIndex] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-24">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-sidebar via-brand-primary/10 to-brand-sidebar border border-brand-primary/20 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
              <span>Divine Attributes • Asma-ul-Husna (أسماء الله الحسنى)</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
              The 99 Names of Allah
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-light max-w-xl">
              "To Allah belong the Most Beautiful Names, so call on Him by them." (Surah Al-A'raf 7:180). Listen continuously in authentic Arabic, English translation, or dual mode.
            </p>
          </div>

          {/* Memorization Progress Tracker */}
          <div className="bg-black/50 border border-white/10 p-4 rounded-2xl min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Names Learned</span>
              <span className="font-mono font-black text-brand-primary">{learnedCount} / 99</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand-primary to-emerald-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-mono text-right">
              {progressPercent}% Memorized
            </p>
          </div>
        </div>
      </div>

      {/* CONTINUOUS AUDIO CONSOLE & CONTROLS */}
      <div className="glass-panel p-5 md:p-6 rounded-[2rem] border-white/10 bg-brand-sidebar/80 shadow-2xl relative overflow-hidden space-y-4">
        {/* Top Console Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              playbackState.isContinuous && playbackState.isPlaying
                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Volume2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Continuous Asma-ul-Husna Player
                </span>
                {playbackState.isContinuous && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    Live Playing
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {currentActiveName ? (
                  <span>
                    Playing <strong className="text-brand-primary font-mono">#{currentActiveName.id} {currentActiveName.transliteration}</strong> ({currentActiveName.arabic}) - {currentActiveName.english}
                  </span>
                ) : (
                  <span>Auto-advance recitation of all 99 Sacred Names sequentially</span>
                )}
              </p>
            </div>
          </div>

          {/* Mode Selector (Arabic / English / Both) */}
          <div className="flex items-center gap-1.5 p-1 bg-black/40 border border-white/10 rounded-2xl self-stretch sm:self-auto justify-center">
            <button
              onClick={() => {
                setRecitationMode('both');
                if (playbackState.isContinuous) {
                  startContinuousRecitation(playbackState.currentIndex);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                recitationMode === 'both'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Arabic + English
            </button>
            <button
              onClick={() => {
                setRecitationMode('arabic');
                if (playbackState.isContinuous) {
                  startContinuousRecitation(playbackState.currentIndex);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                recitationMode === 'arabic'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Arabic Only
            </button>
            <button
              onClick={() => {
                setRecitationMode('english');
                if (playbackState.isContinuous) {
                  startContinuousRecitation(playbackState.currentIndex);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                recitationMode === 'english'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English Only
            </button>
          </div>
        </div>

        {/* Player Transport Controls & Speed Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5">
          {/* Main Play / Prev / Next / Pause / Stop Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => VoiceService.prevInContinuous()}
              disabled={!playbackState.isContinuous}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-40"
              title="Previous Name"
            >
              <Rewind size={16} />
            </button>

            <button
              onClick={toggleContinuousPlay}
              className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-xl active:scale-95 ${
                playbackState.isContinuous && playbackState.isPlaying && !playbackState.isPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                  : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/30'
              }`}
            >
              {playbackState.isContinuous && playbackState.isPlaying && !playbackState.isPaused ? (
                <>
                  <Pause size={15} className="fill-current" />
                  <span>Pause Continuous</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-current" />
                  <span>{playbackState.isContinuous ? 'Resume Continuous' : 'Play All 99 Names'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => VoiceService.nextInContinuous()}
              disabled={!playbackState.isContinuous}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-40"
              title="Next Name"
            >
              <FastForward size={16} />
            </button>

            {playbackState.isContinuous && (
              <button
                onClick={() => VoiceService.stop()}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all active:scale-95"
              >
                Stop
              </button>
            )}
          </div>

          {/* Speed Selector and Loop Option */}
          <div className="flex items-center gap-3">
            {/* Speed Pills */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-xl">
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                    speed === s
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isLooping
                  ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Repeat Playlist"
            >
              <Repeat size={15} />
              <span className="hidden sm:inline">Repeat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of All 99 Names of Allah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNames.map((n, idx) => {
          const isItemActiveInContinuous = playbackState.isContinuous && playbackState.currentIndex === (n.id - 1);
          const isArPlaying = playbackState.isPlaying && playbackState.activeId === `name-ar-${n.id}`;
          const isBothPlaying = playbackState.isPlaying && playbackState.activeId === `name-both-${n.id}`;
          const isEnPlaying = playbackState.isPlaying && playbackState.activeId === `name-en-${n.id}`;
          const isActive = isItemActiveInContinuous || isArPlaying || isBothPlaying || isEnPlaying;
          const isLearned = Boolean(learnedMap[n.id]);

          return (
            <motion.div 
              key={n.id}
              ref={el => { cardRefs.current[n.id] = el; }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.015, 0.3) }}
              className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl ${
                isActive
                  ? 'bg-gradient-to-br from-brand-primary/25 via-brand-sidebar to-brand-depth border-brand-primary shadow-brand-primary/30 scale-[1.02] ring-2 ring-brand-primary/40'
                  : isLearned
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'glass-panel border-white/5 hover:border-white/20'
              }`}
            >
              {/* Header: ID, Badge, Learned Check */}
              <div className="flex items-center justify-between gap-2">
                <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-400 flex items-center justify-center">
                  #{n.id}
                </span>

                <button
                  onClick={() => toggleLearned(n.id)}
                  className={`p-1.5 rounded-xl border transition-all ${
                    isLearned
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                      : 'border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                  title={isLearned ? "Marked as Learned" : "Mark as Learned"}
                >
                  <Check size={14} />
                </button>
              </div>

              {/* Arabic Calligraphy & Transliteration */}
              <div className="text-center space-y-2 py-2">
                <p className="text-4xl md:text-5xl font-arabic font-bold text-white tracking-wide leading-relaxed selection:bg-brand-primary/30">
                  {n.arabic}
                </p>
                <h3 className="text-lg font-black text-brand-primary tracking-tight">
                  {n.transliteration}
                </h3>
              </div>

              {/* English & Meaning */}
              <div className="space-y-1.5 text-center">
                <p className="text-sm font-bold text-white">
                  {n.english}
                </p>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {n.meaning}
                </p>
              </div>

              {/* Action Buttons: Play Arabic, Play Dual, Start Sequence From Here */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handlePlayArabic(n, e)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                    isArPlaying
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                  }`}
                  title="Listen in Arabic"
                >
                  <Volume2 size={14} />
                  <span>Arabic</span>
                </button>

                <button
                  onClick={(e) => handlePlayBoth(n, e)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                    isBothPlaying
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                  }`}
                  title="Listen Arabic + English"
                >
                  <Languages size={14} />
                  <span>Dual</span>
                </button>

                <button
                  onClick={() => startContinuousRecitation(n.id - 1)}
                  className="p-2 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 transition-all active:scale-95"
                  title={`Start continuous recitation from #${n.id} ${n.transliteration}`}
                >
                  <Play size={14} className="fill-current" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
