import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Shield, 
  Award, 
  ChevronRight, 
  Volume2, 
  Play,
  CheckCircle2,
  Lock,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Flame,
  Check,
  Languages,
  Coffee,
  Heart,
  Users,
  Compass,
  Utensils,
  Home,
  CloudRain,
  TrendingUp,
  GraduationCap,
  Eye,
  BookOpen,
  ShieldCheck,
  Bookmark,
  Sunrise,
  Droplets,
  Car,
  DollarSign,
  Baby,
  Activity,
  SmilePlus
} from 'lucide-react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';
import { ALL_NAMES_OF_ALLAH, NameOfAllah } from '../data/namesOfAllahData.ts';
import { DuaAudioService, DUA_RECITERS, DUA_AMBIENT_SOUNDS } from '../services/duaAudioService.ts';

const NAMES_OF_ALLAH = ALL_NAMES_OF_ALLAH;

export interface DhikrItem {
  id: string;
  arabic: string;
  transliteration?: string;
  english: string;
  benefit: string;
  targetCount: number;
}

export interface DhikrCategory {
  id: string;
  category: string;
  icon: any;
  items: DhikrItem[];
}

import { ALL_ADHKAR_CATEGORIES } from '../data/adhkarData.ts';

const iconMap: Record<string, any> = {
  Sun,
  Moon,
  Shield,
  Award,
  Sparkles,
  Heart,
  Users,
  Compass,
  Utensils,
  Home,
  CloudRain,
  TrendingUp,
  GraduationCap,
  Eye,
  BookOpen,
  ShieldCheck,
  Bookmark,
  Sunrise,
  Droplets,
  Car,
  DollarSign,
  Baby,
  Activity,
  SmilePlus
};

const ADHKAR: DhikrCategory[] = ALL_ADHKAR_CATEGORIES.map(cat => ({
  id: cat.id,
  category: cat.category,
  icon: iconMap[cat.iconName] || Sparkles,
  items: cat.items
}));

export default function AdhkarView({
  addHasanat,
  incrementDua,
  searchQuery = '',
  initialCategory = 'all'
}: {
  addHasanat: (amount: number) => void;
  incrementDua: () => void;
  searchQuery?: string;
  initialCategory?: string;
}) {
  const [activeTab, setActiveTab] = useState<'adhkar' | 'names'>('adhkar');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [counterMap, setCounterMap] = useState<Record<string, number>>({});
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(VoiceService.getState());
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const [sessionItems, setSessionItems] = useState<DhikrItem[]>([]);
  const [fontSizeScale, setFontSizeScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);

  const currentUser = auth?.currentUser;

  useEffect(() => {
    const unsub = VoiceService.subscribe(setPlaybackState);
    return () => {
      unsub();
      VoiceService.stop();
    };
  }, []);

  // Sync completion states
  useEffect(() => {
    if (!currentUser) {
      const saved = localStorage.getItem('guest-adhkar-progress');
      if (saved) {
        try {
          setCompletedMap(JSON.parse(saved));
        } catch (e) {}
      }
      return;
    }

    const unsub = onSnapshot(doc(db, `users/${currentUser.uid}/adhkarProgress/all`), (docSnap) => {
      if (docSnap.exists()) {
        setCompletedMap(docSnap.data() as Record<string, boolean>);
      }
    }, () => {});

    return () => unsub();
  }, [currentUser]);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (e) {}
    }
  };

  // Play audio for a single dhikr
  const handlePlayDhikr = (dhikr: DhikrItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === dhikr.id) {
      VoiceService.stop();
    } else {
      VoiceService.speakArabic(dhikr.arabic, dhikr.id);
    }
  };

  // Play dual Arabic + English
  const handlePlayBoth = (dhikr: DhikrItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === dhikr.id && playbackState.mode === 'both') {
      VoiceService.stop();
    } else {
      VoiceService.speakBoth(dhikr.arabic, dhikr.english, dhikr.id);
    }
  };

  // Interactive Tasbih Repetition Counter
  const handleIncrementCounter = (dhikr: DhikrItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic();

    const currentCount = counterMap[dhikr.id] || 0;
    const nextCount = currentCount + 1;
    const isNowComplete = nextCount >= dhikr.targetCount;

    setCounterMap(prev => ({
      ...prev,
      [dhikr.id]: isNowComplete ? dhikr.targetCount : nextCount
    }));

    if (isNowComplete && !completedMap[dhikr.id]) {
      toggleComplete(dhikr.id, true);
    }
  };

  const handleResetCounter = (dhikrId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCounterMap(prev => ({ ...prev, [dhikrId]: 0 }));
  };

  // Mark completion in Firebase / local
  const toggleComplete = async (id: string, forceComplete?: boolean) => {
    const isCurrentlyCompleted = completedMap[id];
    const targetState = forceComplete !== undefined ? forceComplete : !isCurrentlyCompleted;

    const newMap = { ...completedMap, [id]: targetState };
    setCompletedMap(newMap);

    if (targetState) {
      triggerHaptic();
      addHasanat(2);
      incrementDua();
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/adhkarProgress/all`), newMap, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `adhkarProgress/all`);
      }
    } else {
      localStorage.setItem('guest-adhkar-progress', JSON.stringify(newMap));
    }
  };

  // Start continuous audio session
  const startSession = (categoryItems: DhikrItem[]) => {
    if (!categoryItems.length) return;
    setSessionItems(categoryItems);
    setSessionIndex(0);
    setIsSessionActive(true);
    playSessionItem(categoryItems, 0);
  };

  const playSessionItem = (items: DhikrItem[], idx: number) => {
    if (idx >= items.length) {
      setIsSessionActive(false);
      VoiceService.stop();
      return;
    }

    const current = items[idx];
    VoiceService.speakArabic(current.arabic, current.id, () => {
      // Auto-advance after item finishes
      setTimeout(() => {
        const nextIdx = idx + 1;
        setSessionIndex(nextIdx);
        if (nextIdx < items.length) {
          playSessionItem(items, nextIdx);
        } else {
          setIsSessionActive(false);
          addHasanat(5);
        }
      }, 1000);
    });
  };

  const stopSession = () => {
    setIsSessionActive(false);
    VoiceService.stop();
  };

  const queryLower = searchQuery.trim().toLowerCase();

  const filteredAdhkar = (selectedCategory === 'all' 
    ? ADHKAR 
    : ADHKAR.filter(c => c.id === selectedCategory)
  ).map(cat => {
    if (!queryLower) return cat;
    return {
      ...cat,
      items: cat.items.filter(item => 
        item.english.toLowerCase().includes(queryLower) ||
        item.benefit.toLowerCase().includes(queryLower) ||
        item.arabic.includes(searchQuery.trim()) ||
        (item.transliteration && item.transliteration.toLowerCase().includes(queryLower))
      )
    };
  }).filter(cat => cat.items.length > 0);

  const filteredNames = queryLower 
    ? NAMES_OF_ALLAH.filter(n => 
        n.english.toLowerCase().includes(queryLower) || 
        n.transliteration.toLowerCase().includes(queryLower) || 
        n.arabic.includes(searchQuery.trim())
      )
    : NAMES_OF_ALLAH;

  const totalDhikrCount = ADHKAR.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedDhikrCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedDhikrCount / totalDhikrCount) * 100));

  const fontClass = fontSizeScale === 'lg' ? 'text-3xl sm:text-4xl' : fontSizeScale === 'sm' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-20">
      
      {/* Top Banner & Spiritual Tracker */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-depth via-brand-primary/10 to-brand-depth border border-brand-primary/20 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>Sacred Remembrance • Hisnul Muslim</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Athkar & Duas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-md">
              "Verily, in the remembrance of Allah do hearts find rest." (Surah Ar-Ra'd 13:28)
            </p>
          </div>

          {/* Progress Bar & Hasanat stats */}
          <div className="bg-black/40 border border-white/10 p-3.5 sm:p-4 rounded-2xl sm:min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Daily Completion</span>
              <span className="font-mono font-bold text-brand-primary">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand-primary to-amber-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{completedDhikrCount} of {totalDhikrCount} Finished</span>
              <span className="text-amber-300 font-bold">+{completedDhikrCount * 15} Hasanat</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Main Tab Switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('adhkar')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'adhkar' 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Athkar
          </button>
          <button 
            onClick={() => setActiveTab('names')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'names' 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            99 Names of Allah
          </button>
        </div>

        {/* Font & Transliteration Toggles */}
        {activeTab === 'adhkar' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showTransliteration 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}
              title="Toggle English pronunciation"
            >
              Abc Pronunciation
            </button>

            {/* Font Size Pills */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[11px] font-bold text-slate-400">
              <button 
                onClick={() => setFontSizeScale('sm')} 
                className={`px-2 py-1 rounded-lg transition-colors ${fontSizeScale === 'sm' ? 'bg-brand-primary text-white' : 'hover:text-white'}`}
              >
                A-
              </button>
              <button 
                onClick={() => setFontSizeScale('md')} 
                className={`px-2 py-1 rounded-lg transition-colors ${fontSizeScale === 'md' ? 'bg-brand-primary text-white' : 'hover:text-white'}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSizeScale('lg')} 
                className={`px-2 py-1 rounded-lg transition-colors ${fontSizeScale === 'lg' ? 'bg-brand-primary text-white' : 'hover:text-white'}`}
              >
                A+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills (Morning, Evening, Sleep, Forgiveness, After Swalah) */}
      {activeTab === 'adhkar' && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
              selectedCategory === 'all' 
                ? 'bg-white/20 border-white/30 text-white shadow-sm' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          {ADHKAR.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{cat.category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'adhkar' ? (
          <motion.div 
            key="adhkar-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {filteredAdhkar.map((cat) => {
              const Icon = cat.icon;
              return (
                <section key={cat.id} className="space-y-4">
                  {/* Category Header with Auto-Play Session Action */}
                  <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                          {cat.category} Remembrance
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {cat.items.length} Authentic Supplications
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => isSessionActive ? stopSession() : startSession(cat.items)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isSessionActive 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-accent border border-brand-primary/30'
                      }`}
                    >
                      {isSessionActive ? (
                        <>
                          <Pause size={13} />
                          <span>Stop Session</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          <span>Auto-Play {cat.category}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                    {cat.items.map((dhikr) => {
                      const isComplete = completedMap[dhikr.id];
                      const currentCount = counterMap[dhikr.id] || 0;
                      const isThisPlaying = playbackState.isPlaying && playbackState.activeId === dhikr.id;

                      return (
                        <motion.div
                          key={dhikr.id}
                          layout
                          className={`relative p-5 sm:p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
                            isComplete 
                              ? 'bg-emerald-500/[0.04] border-emerald-500/30 shadow-emerald-500/5' 
                              : isThisPlaying 
                                ? 'bg-brand-primary/10 border-brand-primary/40 ring-1 ring-brand-primary/30' 
                                : 'bg-white/5 hover:bg-white/[0.08] border-white/10 hover:border-brand-primary/20'
                          }`}
                        >
                          {/* Arabic Text & Recitation */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-[10px] font-bold uppercase tracking-wider">
                                  {dhikr.benefit.split('(')[0].trim()}
                                </span>
                              </div>

                              <button
                                onClick={() => toggleComplete(dhikr.id)}
                                className={`p-1.5 rounded-xl border transition-all ${
                                  isComplete 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                    : 'border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                                title={isComplete ? "Mark incomplete" : "Mark completed"}
                              >
                                <CheckCircle2 size={16} className={isComplete ? 'fill-current' : ''} />
                              </button>
                            </div>

                            {/* Arabic Script */}
                            <p 
                              className={`font-arabic text-right leading-loose text-amber-200/95 font-medium py-2 ${fontClass}`} 
                              dir="rtl"
                            >
                              {dhikr.arabic}
                            </p>

                            {/* Transliteration */}
                            {showTransliteration && dhikr.transliteration && (
                              <p className="text-xs text-brand-accent/80 italic font-mono leading-relaxed mt-2 mb-1">
                                {dhikr.transliteration}
                              </p>
                            )}

                            {/* English Translation */}
                            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed italic mt-2 mb-4">
                              "{dhikr.english}"
                            </p>
                          </div>

                          {/* Interactive Audio & Tasbih Counter Footer */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 mt-auto flex-wrap">
                            
                            {/* Audio Recite Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handlePlayDhikr(dhikr, e)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  isThisPlaying && playbackState.mode !== 'both'
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                                }`}
                              >
                                {isThisPlaying && playbackState.mode !== 'both' ? <Pause size={12} className="fill-current" /> : <Volume2 size={12} />}
                                <span className="text-[11px]">Recite Voice</span>
                              </button>

                              <button
                                onClick={(e) => handlePlayBoth(dhikr, e)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hidden sm:flex ${
                                  isThisPlaying && playbackState.mode === 'both'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                                }`}
                                title="Listen Arabic + English"
                              >
                                <Languages size={12} />
                                <span className="text-[11px]">Recite + Meaning</span>
                              </button>
                            </div>

                            {/* Sunnah Repetition Counter */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handleIncrementCounter(dhikr, e)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                                  currentCount >= dhikr.targetCount
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 shadow-sm'
                                }`}
                              >
                                <Sparkles size={12} />
                                <span>{currentCount} / {dhikr.targetCount}x</span>
                              </button>

                              {currentCount > 0 && (
                                <button
                                  onClick={(e) => handleResetCounter(dhikr.id, e)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                                  title="Reset counter"
                                >
                                  <RotateCcw size={12} />
                                </button>
                              )}
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </motion.div>
        ) : (
          /* 99 Names of Allah Tab */
          <motion.div 
            key="names-list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredNames.map((name) => {
              const isPlayingName = playbackState.isPlaying && playbackState.activeId === `name-${name.id}`;
              return (
                <motion.div 
                  key={name.id}
                  className={`p-6 rounded-3xl border text-center transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                    isPlayingName 
                      ? 'bg-brand-primary/15 border-brand-primary/50 shadow-brand-primary/20' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-center mx-auto">
                    {name.id}
                  </span>

                  <p className="font-arabic text-4xl text-amber-200 font-bold py-1">
                    {name.arabic}
                  </p>

                  <div className="space-y-0.5">
                    <h4 className="text-base font-extrabold text-white tracking-tight">
                      {name.transliteration}
                    </h4>
                    <p className="text-xs text-slate-400 font-light">
                      {name.english}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (isPlayingName) {
                        VoiceService.stop();
                      } else {
                        VoiceService.speakArabic(name.arabic, `name-${name.id}`);
                      }
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isPlayingName 
                        ? 'bg-brand-primary text-white shadow-md' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {isPlayingName ? <Pause size={13} className="fill-current" /> : <Volume2 size={13} />}
                    <span>{isPlayingName ? 'Playing Voice' : 'Pronounce'}</span>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Active Audio Session Bar */}
      {isSessionActive && sessionItems.length > 0 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 p-4 rounded-2xl bg-brand-depth/95 backdrop-blur-2xl border border-brand-primary/30 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-app-text"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0 animate-pulse">
              <Volume2 size={18} />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">
                Session ({sessionIndex + 1} of {sessionItems.length})
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {sessionItems[sessionIndex]?.arabic}
              </p>
            </div>
          </div>

          <button
            onClick={stopSession}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-bold shrink-0 transition-colors"
          >
            End
          </button>
        </motion.div>
      )}

    </div>
  );
}
