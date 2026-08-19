import { useState, useEffect } from 'react';
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
  Heart
} from 'lucide-react';
import { ALL_NAMES_OF_ALLAH, NameOfAllah } from '../data/namesOfAllahData.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';

export default function NamesOfAllahView({ searchQuery = '' }: { searchQuery: string }) {
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(VoiceService.getState());
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState<number>(0);
  const [learnedMap, setLearnedMap] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('sanctuary_learned_names') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const unsub = VoiceService.subscribe(setPlaybackState);
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
      setIsSequencePlaying(false);
    } else {
      setIsSequencePlaying(false);
      VoiceService.speakArabic(n.arabic, id);
    }
  };

  const handlePlayBoth = (n: NameOfAllah, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = `name-both-${n.id}`;
    if (playbackState.isPlaying && playbackState.activeId === id) {
      VoiceService.stop();
      setIsSequencePlaying(false);
    } else {
      setIsSequencePlaying(false);
      const enText = `${n.transliteration}. ${n.english}. ${n.meaning}`;
      VoiceService.speakBoth(n.arabic, enText, id);
    }
  };

  // Sequence Player: Recites all 99 names one after another
  const playSequenceAt = (index: number) => {
    if (index >= ALL_NAMES_OF_ALLAH.length) {
      setIsSequencePlaying(false);
      VoiceService.stop();
      return;
    }

    setCurrentSequenceIndex(index);
    setIsSequencePlaying(true);
    const n = ALL_NAMES_OF_ALLAH[index];
    const id = `seq-name-${n.id}`;

    VoiceService.speakArabic(n.arabic, id, () => {
      setTimeout(() => {
        playSequenceAt(index + 1);
      }, 700);
    });
  };

  const toggleSequencePlay = () => {
    if (isSequencePlaying && playbackState.isPlaying) {
      VoiceService.stop();
      setIsSequencePlaying(false);
    } else {
      playSequenceAt(currentSequenceIndex);
    }
  };

  const handleNextInSequence = () => {
    const nextIdx = (currentSequenceIndex + 1) % ALL_NAMES_OF_ALLAH.length;
    playSequenceAt(nextIdx);
  };

  const handlePrevInSequence = () => {
    const prevIdx = currentSequenceIndex > 0 ? currentSequenceIndex - 1 : ALL_NAMES_OF_ALLAH.length - 1;
    playSequenceAt(prevIdx);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-24">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-sidebar via-brand-primary/10 to-brand-sidebar border border-brand-primary/20 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
              <span>Divine Attributes • Asma-ul-Husna</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tight">
              The 99 Beautiful Names of Allah
            </h2>
            <p className="text-xs md:text-sm text-slate-300 font-light max-w-xl">
              "To Allah belong the Most Beautiful Names, so call on Him by them." (Surah Al-A'raf 7:180). Tap any name to listen to authentic Arabic recitation.
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

      {/* Sequential Reciter Audio Console */}
      <div className="glass-panel p-4 md:p-5 rounded-2xl border-white/10 bg-brand-sidebar/70 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0">
            <Volume2 size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-wider">Continuous Reciter</p>
            <p className="text-[11px] text-slate-400">
              {isSequencePlaying 
                ? `Reciting Name #${ALL_NAMES_OF_ALLAH[currentSequenceIndex]?.id}: ${ALL_NAMES_OF_ALLAH[currentSequenceIndex]?.transliteration}` 
                : "Listen to all 99 Names in continuous sequence"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevInSequence}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Previous Name"
          >
            <Rewind size={16} />
          </button>

          <button
            onClick={toggleSequencePlay}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              isSequencePlaying && playbackState.isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/20'
                : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/30'
            }`}
          >
            {isSequencePlaying && playbackState.isPlaying ? (
              <>
                <Pause size={14} className="fill-current" />
                <span>Pause Recitation</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-current" />
                <span>Play All 99 Names</span>
              </>
            )}
          </button>

          <button
            onClick={handleNextInSequence}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="Next Name"
          >
            <FastForward size={16} />
          </button>
        </div>
      </div>

      {/* Grid of All 99 Names of Allah */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNames.map((n) => {
          const isArPlaying = playbackState.isPlaying && (playbackState.activeId === `name-ar-${n.id}` || (isSequencePlaying && ALL_NAMES_OF_ALLAH[currentSequenceIndex]?.id === n.id));
          const isBothPlaying = playbackState.isPlaying && playbackState.activeId === `name-both-${n.id}`;
          const isLearned = Boolean(learnedMap[n.id]);

          return (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 shadow-xl ${
                isArPlaying || isBothPlaying
                  ? 'bg-gradient-to-br from-brand-primary/20 via-brand-sidebar to-brand-depth border-brand-primary shadow-brand-primary/20 scale-[1.02]'
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
                  title={isLearned ? "Mark unlearned" : "Mark as memorized"}
                >
                  <Check size={14} className={isLearned ? "stroke-[3]" : ""} />
                </button>
              </div>

              {/* Arabic Script */}
              <div className="text-center py-2">
                <p 
                  className="font-arabic text-4xl sm:text-5xl font-bold text-amber-200 leading-tight tracking-wide drop-shadow-md"
                  dir="rtl"
                >
                  {n.arabic}
                </p>
                <h3 className="text-lg font-black text-white tracking-tight mt-3">
                  {n.transliteration}
                </h3>
                <p className="text-xs font-semibold text-brand-primary uppercase tracking-wider mt-0.5">
                  {n.english}
                </p>
              </div>

              {/* Meaning & Explanation */}
              <p className="text-xs text-slate-400 font-light leading-relaxed border-t border-white/5 pt-3">
                {n.meaning}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={(e) => handlePlayArabic(n, e)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isArPlaying && !isBothPlaying
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  {isArPlaying && !isBothPlaying ? <Pause size={12} className="fill-current" /> : <Volume2 size={12} />}
                  <span>Recite</span>
                </button>

                <button
                  onClick={(e) => handlePlayBoth(n, e)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isBothPlaying
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                  }`}
                  title="Recite Arabic + English explanation"
                >
                  <Languages size={12} />
                  <span>Meaning</span>
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredNames.length === 0 && (
          <div className="col-span-full py-16 text-center glass-panel rounded-3xl border-white/5">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
              No Divine Names found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
