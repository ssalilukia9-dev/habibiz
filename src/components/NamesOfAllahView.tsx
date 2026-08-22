import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Volume2, 
  Pause, 
  Play, 
  FastForward, 
  Rewind, 
  RotateCcw, 
  BookOpen, 
  Heart, 
  Sliders, 
  CheckCircle2, 
  ListOrdered,
  Share2,
  ExternalLink,
  VolumeX,
  Music2,
  Radio,
  Clock,
  Sparkle,
  Check,
  Search,
  X,
  Filter
} from 'lucide-react';
import { ALL_NAMES_OF_ALLAH, NameOfAllah } from '../data/namesOfAllahData';
import { NAMES_OF_ALLAH_AUDIO_MAP, getNameOfAllahAudioUrl } from '../data/namesOfAllahAudio';
import { YoutubeNamesService, YoutubeNamesState, YOUTUBE_NAMES_VIDEO_ID } from '../services/youtubeNamesService';

export default function NamesOfAllahView({ searchQuery = '' }: { searchQuery: string }) {
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'learned' | 'unlearned' | 'part1' | 'part2' | 'part3'>('all');

  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchQuery]);

  const [ytState, setYtState] = useState<YoutubeNamesState>(YoutubeNamesService.getState());
  const [speed, setSpeed] = useState<number>(1.0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [playingSingleId, setPlayingSingleId] = useState<number | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const singleAudioRef = useRef<HTMLAudioElement | null>(null);

  const [learnedMap, setLearnedMap] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('sanctuary_learned_names') || '{}');
    } catch {
      return {};
    }
  });

  // Subscribe to YouTube Continuous 99 Names Recitation
  useEffect(() => {
    const unsub = YoutubeNamesService.subscribe((state) => {
      setYtState(state);
      // Auto-scroll to active card when continuous recitation is playing
      if (state.isPlaying && cardRefs.current[state.activeNameId]) {
        cardRefs.current[state.activeNameId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });

    return () => {
      unsub();
      if (singleAudioRef.current) {
        singleAudioRef.current.pause();
        singleAudioRef.current = null;
      }
    };
  }, []);

  const toggleLearned = (id: number) => {
    setLearnedMap(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('sanctuary_learned_names', JSON.stringify(next));
      return next;
    });
  };

  /**
   * Play single individual name using the authentic dedicated voice (previous voice)
   */
  const handlePlaySingleName = (n: NameOfAllah, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // 1. If currently playing this single name, stop it
    if (playingSingleId === n.id) {
      if (singleAudioRef.current) {
        singleAudioRef.current.pause();
        singleAudioRef.current = null;
      }
      setPlayingSingleId(null);
      return;
    }

    // 2. Pause global 99 Names audio if running so single name audio is crystal clear
    if (ytState.isPlaying) {
      YoutubeNamesService.pause();
    }

    // 3. Stop any existing single audio instance
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
      singleAudioRef.current = null;
    }

    setPlayingSingleId(n.id);

    // Audio URL priorities: Dedicated high-clarity vocal CDN -> Secondary CDN -> Web Speech fallback
    const primaryUrl = NAMES_OF_ALLAH_AUDIO_MAP[n.id] || getNameOfAllahAudioUrl(n.id);
    const audio = new Audio(primaryUrl);
    singleAudioRef.current = audio;

    audio.onended = () => {
      setPlayingSingleId(null);
    };

    audio.onerror = () => {
      // Fallback to secondary CDN
      const backupUrl = getNameOfAllahAudioUrl(n.id);
      const backupAudio = new Audio(backupUrl);
      singleAudioRef.current = backupAudio;

      backupAudio.onended = () => setPlayingSingleId(null);
      backupAudio.onerror = () => {
        // Ultimate fallback: Web Speech API with Arabic voice
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(n.arabic || n.transliteration);
          utterance.lang = 'ar-SA';
          utterance.rate = 0.85;
          utterance.onend = () => setPlayingSingleId(null);
          utterance.onerror = () => setPlayingSingleId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setPlayingSingleId(null);
        }
      };

      backupAudio.play().catch(() => {
        setPlayingSingleId(null);
      });
    };

    audio.play().catch((err) => {
      console.warn("Audio play prevented, falling back to Web Speech:", err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(n.arabic || n.transliteration);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;
        utterance.onend = () => setPlayingSingleId(null);
        utterance.onerror = () => setPlayingSingleId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingSingleId(null);
      }
    });
  };

  /**
   * Toggle Global 99 Names Recitation Audio (continuous playback with card synchronizer)
   */
  const handleToggleGlobalPlay = () => {
    // Stop any single audio note
    if (singleAudioRef.current) {
      singleAudioRef.current.pause();
      singleAudioRef.current = null;
    }
    setPlayingSingleId(null);

    YoutubeNamesService.togglePlay();
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    YoutubeNamesService.setSpeed(newSpeed);
  };

  const handleCopyName = (n: NameOfAllah, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(`${n.id}. ${n.arabic} - ${n.transliteration} (${n.english}): ${n.meaning}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const query = searchTerm.toLowerCase().trim();
  const filteredNames = ALL_NAMES_OF_ALLAH.filter(n => {
    // 1. Check Search Term
    const matchesSearch = !query || (
      n.transliteration.toLowerCase().includes(query) ||
      n.english.toLowerCase().includes(query) ||
      n.meaning.toLowerCase().includes(query) ||
      n.arabic.includes(searchTerm.trim()) ||
      n.id.toString() === query
    );
    if (!matchesSearch) return false;

    // 2. Check Active Category Filter
    if (activeFilter === 'learned') return !!learnedMap[n.id];
    if (activeFilter === 'unlearned') return !learnedMap[n.id];
    if (activeFilter === 'part1') return n.id >= 1 && n.id <= 33;
    if (activeFilter === 'part2') return n.id >= 34 && n.id <= 66;
    if (activeFilter === 'part3') return n.id >= 67 && n.id <= 99;
    return true;
  });

  const learnedCount = Object.values(learnedMap).filter(Boolean).length;
  const progressPercent = Math.round((learnedCount / 99) * 100);

  const currentActiveName = ALL_NAMES_OF_ALLAH.find(n => n.id === ytState.activeNameId) || ALL_NAMES_OF_ALLAH[0];

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-28">
      
      {/* Header Banner with Sacred Calligraphy & Recitation Details */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-sidebar via-brand-primary/10 to-[#061828] border border-brand-primary/30 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
              <span>Divine Attributes • Asmā' Allāh al-Ḥusnā (أسماء الله الحسنى)</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
              The 99 Names of Allah
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
              "To Allah belong the Most Beautiful Names, so call on Him by them." (Surah Al-A'raf 7:180). Press any single card to hear its individual pronunciation, or tap <strong>Play 99 Names Audio</strong> for continuous synchronized recitation across all cards.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a 
                href={`https://www.youtube.com/watch?v=${YOUTUBE_NAMES_VIDEO_ID}`}
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-wider transition-all"
              >
                <Music2 size={12} />
                <span>Original Recitation Audio</span>
                <ExternalLink size={10} />
              </a>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold">
                <Radio size={12} />
                <span>Speed Sync Active: Cards adapt to {speed}x</span>
              </span>
            </div>
          </div>

          {/* Memorization Progress Tracker */}
          <div className="bg-black/60 border border-white/10 p-5 rounded-2xl min-w-[240px] space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Names Learned</span>
              <span className="font-mono font-black text-brand-primary text-sm">{learnedCount} / 99</span>
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

      {/* CONTINUOUS 99 NAMES AUDIO DOCK & REAL-TIME CARDS SYNCHRONIZER */}
      <div className="glass-panel p-5 md:p-6 rounded-[2.2rem] border border-amber-400/30 bg-gradient-to-b from-[#061828]/95 via-[#03101C]/95 to-black shadow-2xl relative overflow-hidden space-y-5">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Info Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              ytState.isPlaying
                ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-400/20 animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              <Volume2 size={22} />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Continuous 99 Names Recitation Track
                </span>
                {ytState.isPlaying && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Syncing ({speed}x)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Current Position: <strong className="text-amber-300 font-bold font-mono">#{currentActiveName.id} {currentActiveName.transliteration}</strong> ({currentActiveName.arabic}) &bull; <span className="text-slate-400">{currentActiveName.english}</span>
              </p>
            </div>
          </div>

          {/* Quick Jump Dropdown */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <select
              value={ytState.activeNameId}
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                YoutubeNamesService.seekToName(id);
                if (cardRefs.current[id]) {
                  cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              aria-label="Select a Name of Allah to jump to"
              className="bg-black/60 border border-white/15 text-slate-200 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-brand-primary"
            >
              {ALL_NAMES_OF_ALLAH.map((n) => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                  #{n.id} {n.transliteration} - {n.arabic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Timeline Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div 
            className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPct = (e.clientX - rect.left) / rect.width;
              const targetTime = clickPct * (ytState.duration || 240);
              YoutubeNamesService.seekToTime(targetTime);
            }}
          >
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-brand-primary transition-all duration-150"
              style={{ width: `${((ytState.currentTime || 0) / (ytState.duration || 240)) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>{formatSecs(ytState.currentTime)}</span>
            <span className="text-amber-300 font-bold uppercase tracking-wider">
              Card {ytState.activeNameId} of 99 Active
            </span>
            <span>{formatSecs(ytState.duration || 240)}</span>
          </div>
        </div>

        {/* Master Player Controls: Prev, Play/Pause, Next, -10s, +10s, Speed Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => YoutubeNamesService.skipSeconds(-10)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Rewind 10 Seconds"
            >
              -10s
            </button>

            <button
              onClick={() => {
                YoutubeNamesService.prevName();
                const prev = Math.max(1, ytState.activeNameId - 1);
                cardRefs.current[prev]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="Previous Name"
            >
              <Rewind size={16} />
            </button>

            {/* Play 99 Names Audio Master Button */}
            <button
              onClick={handleToggleGlobalPlay}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer ${
                ytState.isPlaying
                  ? 'bg-amber-400 hover:bg-amber-500 text-black shadow-amber-400/25'
                  : 'bg-brand-primary hover:bg-brand-primary/90 text-brand-depth shadow-brand-primary/30'
              }`}
            >
              {ytState.isPlaying ? (
                <>
                  <Pause size={15} className="fill-current" />
                  <span>Pause 99 Names Audio</span>
                </>
              ) : (
                <>
                  <Play size={15} className="fill-current" />
                  <span>Play 99 Names Audio</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                YoutubeNamesService.nextName();
                const next = Math.min(99, ytState.activeNameId + 1);
                cardRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="Next Name"
            >
              <FastForward size={16} />
            </button>

            <button
              onClick={() => YoutubeNamesService.skipSeconds(10)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Forward 10 Seconds"
            >
              +10s
            </button>

            {ytState.isPlaying && (
              <button
                onClick={() => YoutubeNamesService.stop()}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
              >
                Stop
              </button>
            )}
          </div>

          {/* Speed Selection Pills (Dynamic Card Sync Speed) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sliders size={12} className="text-amber-400" />
              Recitation Speed:
            </span>
            <div className="flex items-center gap-1 bg-black/50 border border-white/10 p-1 rounded-xl">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    speed === s
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Change playback & card sync speed to ${s}x`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & QUICK FILTERS FOR 99 NAMES */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search size={18} className="text-amber-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Name (e.g. Ar-Rahman, The Merciful), Arabic (الرحمن), or #ID (e.g. 1)..."
              className="w-full bg-slate-900/90 border border-white/10 hover:border-amber-400/40 focus:border-amber-400 rounded-2xl py-3.5 pl-11 pr-10 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results Counter Badge */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <span className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-bold">
              Showing <strong className="text-amber-300 font-mono">{filteredNames.length}</strong> of 99 Names
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All 99 Names' },
            { id: 'learned', label: `Memorized (${learnedCount})` },
            { id: 'unlearned', label: `To Learn (${99 - learnedCount})` },
            { id: 'part1', label: 'Part 1 (1–33)' },
            { id: 'part2', label: 'Part 2 (34–66)' },
            { id: 'part3', label: 'Part 3 (67–99)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
                activeFilter === tab.id
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20 font-black'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 99 NAMES GRID WITH DUAL AUDIO BEHAVIOR & REAL-TIME SPEED SYNC */}
      {filteredNames.length === 0 ? (
        <div className="p-12 text-center rounded-[2.5rem] bg-slate-900/60 border border-white/10 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-white">No Divine Names match "{searchTerm}"</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Try searching by transliteration (e.g. Al-Malik), Arabic (الملك), English meaning (The King), or number (#3).
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
            }}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            Reset Search & Filters
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNames.map((n) => {
          const isLearned = !!learnedMap[n.id];
          const isCurrentActiveInGlobal = ytState.activeNameId === n.id;
          const isGlobalPlayingThis = isCurrentActiveInGlobal && ytState.isPlaying;
          const isSinglePlayingThis = playingSingleId === n.id;
          const isHighlighted = isGlobalPlayingThis || isSinglePlayingThis || isCurrentActiveInGlobal;

          return (
            <motion.div
              key={n.id}
              ref={(el) => { cardRefs.current[n.id] = el; }}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => handlePlaySingleName(n, e)}
              className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer ${
                isGlobalPlayingThis
                  ? 'bg-gradient-to-b from-amber-500/25 via-[#061828]/95 to-black border-amber-400 ring-2 ring-amber-400/60 shadow-2xl shadow-amber-400/25 scale-[1.03]'
                  : isSinglePlayingThis
                  ? 'bg-gradient-to-b from-emerald-500/25 via-[#061828]/95 to-black border-emerald-400 ring-2 ring-emerald-400/60 shadow-2xl shadow-emerald-400/25 scale-[1.02]'
                  : isCurrentActiveInGlobal
                  ? 'bg-[#061828]/90 border-amber-400/50 ring-1 ring-amber-400/30'
                  : isLearned
                  ? 'bg-[#061828]/70 border-emerald-500/30 hover:border-emerald-500/60'
                  : 'bg-[#061828]/60 border-white/10 hover:border-brand-primary/40 hover:bg-[#072238]'
              }`}
            >
              {/* Active Soundwave Animation Background */}
              {(isGlobalPlayingThis || isSinglePlayingThis) && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.18)_0%,transparent_70%)] pointer-events-none" />
              )}

              {/* Card Top Row: Number, Active Wave Badge, Learn Check, Share */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    isGlobalPlayingThis
                      ? 'bg-amber-400 text-black font-black'
                      : isSinglePlayingThis
                      ? 'bg-emerald-400 text-black font-black'
                      : isCurrentActiveInGlobal
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/5 border border-white/10 text-slate-400'
                  }`}>
                    {n.id}
                  </span>

                  {isGlobalPlayingThis && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>99 Recitation ({speed}x)</span>
                    </span>
                  )}

                  {isSinglePlayingThis && (
                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-black uppercase tracking-wider animate-pulse">
                      <Volume2 size={10} />
                      <span>Speaking Name Voice</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleCopyName(n, e)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
                    title="Copy Name"
                  >
                    {copiedId === n.id ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  </button>

                  <button
                    onClick={() => toggleLearned(n.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isLearned
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={isLearned ? 'Mark as Not Learned' : 'Mark as Learned'}
                  >
                    <CheckCircle2 size={14} className={isLearned ? 'fill-emerald-500/30' : ''} />
                  </button>
                </div>
              </div>

              {/* Card Center: Arabic Calligraphy */}
              <div className="py-5 text-center relative z-10 space-y-2">
                <p className={`arabic-text text-4xl sm:text-5xl font-arabic font-bold transition-all drop-shadow-md ${
                  isGlobalPlayingThis
                    ? 'text-amber-300 scale-105'
                    : isSinglePlayingThis
                    ? 'text-emerald-300 scale-105'
                    : 'text-white group-hover:text-amber-200'
                }`}>
                  {n.arabic}
                </p>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight group-hover:text-brand-primary transition-colors">
                    {n.transliteration}
                  </h3>
                  <p className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">
                    {n.english}
                  </p>
                </div>
              </div>

              {/* Card Bottom: Meaning & Individual Voice Play Button */}
              <div className="space-y-3 pt-3 border-t border-white/5 relative z-10">
                <p className="text-xs text-slate-300 font-normal leading-relaxed line-clamp-2">
                  {n.meaning}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isLearned ? 'Learned ✓' : 'Tap to hear voice'}
                  </span>

                  {/* Individual Name Audio Play Button */}
                  <button
                    onClick={(e) => handlePlaySingleName(n, e)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSinglePlayingThis
                        ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/30 animate-pulse'
                        : isGlobalPlayingThis
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-white/5 hover:bg-amber-400 hover:text-black text-slate-300 border border-white/10 group-hover:border-amber-400/40'
                    }`}
                    title={`Listen to previous individual voice for ${n.transliteration}`}
                  >
                    {isSinglePlayingThis ? (
                      <>
                        <Pause size={12} className="fill-current" />
                        <span>Speaking</span>
                      </>
                    ) : isGlobalPlayingThis ? (
                      <>
                        <Volume2 size={12} />
                        <span>Reciting</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} className="fill-current" />
                        <span>Play Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      )}
    </div>
  );
}
