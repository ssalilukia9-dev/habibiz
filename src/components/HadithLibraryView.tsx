import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronRight, 
  Book, 
  Quote, 
  Filter,
  ArrowLeft,
  Bookmark,
  Share2,
  X,
  Volume2,
  Pause,
  Mic,
  Copy,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Languages
} from 'lucide-react';
import { HADITH_DATABASE, HadithEntry } from '../data/hadiths.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';

const COLLECTIONS = [
  { id: 'all', name: 'All Collections', count: HADITH_DATABASE.length },
  { id: 'Sahih Bukhari', name: 'Sahih Bukhari', count: HADITH_DATABASE.filter(h => h.collection === 'Sahih Bukhari').length },
  { id: 'Sahih Muslim', name: 'Sahih Muslim', count: HADITH_DATABASE.filter(h => h.collection === 'Sahih Muslim').length },
  { id: 'Tirmidhi', name: 'Sunan al-Tirmidhi', count: HADITH_DATABASE.filter(h => h.collection === 'Tirmidhi').length },
  { id: 'Al-Adab Al-Mufrad', name: 'Al-Adab Al-Mufrad', count: HADITH_DATABASE.filter(h => h.collection === 'Al-Adab Al-Mufrad').length }
];

export default function HadithLibraryView({ 
  initialCollection, 
  onCollectionChange, 
  searchQuery, 
  setSearchQuery,
  addHasanat
}: { 
  initialCollection?: string, 
  onCollectionChange?: (id: string) => void, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  addHasanat: (amount: number) => void
}) {
  const [selectedCollection, setSelectedCollectionState] = useState(initialCollection || 'all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedHadith, setSelectedHadith] = useState<HadithEntry | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(VoiceService.getState());
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('bookmarked-hadiths') || '[]');
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const unsub = VoiceService.subscribe(setPlaybackState);
    return () => {
      unsub();
      VoiceService.stop();
    };
  }, []);

  const setSelectedCollection = (id: string) => {
    setSelectedCollectionState(id);
    onCollectionChange?.(id);
  };

  useEffect(() => {
    if (initialCollection && initialCollection !== selectedCollection) {
      setSelectedCollectionState(initialCollection);
    }
  }, [initialCollection]);

  // Voice Search Setup
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, [setSearchQuery]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.warn("Speech recognition error:", e);
      }
    }
  };

  const handleSelectHadith = (h: HadithEntry) => {
    setSelectedHadith(h);
    const viewedKey = `viewed-hadith-${h.id}`;
    if (!localStorage.getItem(viewedKey)) {
      addHasanat(20);
      localStorage.setItem(viewedKey, 'true');
    }
  };

  // Audio Playback Triggers
  const handlePlayArabic = (h: HadithEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === h.id && playbackState.mode === 'arabic') {
      VoiceService.stop();
    } else {
      VoiceService.speakArabic(h.arabic, h.id);
    }
  };

  const handlePlayEnglish = (h: HadithEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === h.id && playbackState.mode === 'english') {
      VoiceService.stop();
    } else {
      VoiceService.speakEnglish(h.english, h.id);
    }
  };

  const handlePlayBoth = (h: HadithEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === h.id && playbackState.mode === 'both') {
      VoiceService.stop();
    } else {
      VoiceService.speakBoth(h.arabic, h.english, h.id);
    }
  };

  const handleToggleSpeed = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const nextSpeed = audioSpeed === 1.0 ? 1.25 : audioSpeed === 1.25 ? 0.8 : 1.0;
    setAudioSpeed(nextSpeed);
    VoiceService.setRate(nextSpeed);
  };

  const handleCopy = (h: HadithEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const textToCopy = `"${h.arabic}"\n\n"${h.english}"\n\n— Reported by ${h.narrator} (${h.collection})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(h.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleBookmark = (h: HadithEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds(prev => {
      const exists = prev.includes(h.id);
      const updated = exists ? prev.filter(id => id !== h.id) : [...prev, h.id];
      localStorage.setItem('bookmarked-hadiths', JSON.stringify(updated));
      return updated;
    });
  };

  const handleShare = async (h: HadithEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareData = {
      title: `Hadith: ${h.topic} - ${h.collection}`,
      text: `"${h.arabic}"\n\n"${h.english}"\n\n— Reported by ${h.narrator} (${h.collection})`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignored if user dismissed share dialog
      }
    } else {
      handleCopy(h);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopic('all');
    setSelectedCollection('all');
  };

  const TOPICS = ['all', ...Array.from(new Set(HADITH_DATABASE.map(h => h.topic)))].sort();

  const filteredHadith = HADITH_DATABASE.filter(h => {
    const matchesCollection = selectedCollection === 'all' || h.collection === selectedCollection;
    const matchesTopic = selectedTopic === 'all' || h.topic === selectedTopic;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          h.english.toLowerCase().includes(searchLower) || 
                          h.topic.toLowerCase().includes(searchLower) ||
                          h.narrator.toLowerCase().includes(searchLower) ||
                          h.arabic.includes(searchQuery);
    return matchesCollection && matchesTopic && matchesSearch;
  });

  const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="bg-brand-primary/25 text-brand-accent font-bold rounded px-1">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-16">
      <AnimatePresence mode="wait">
        {!selectedHadith ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5 sm:space-y-6"
          >
            {/* Search & Collection Tabs */}
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar with Microphone */}
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="Search wisdom by keyword, narrator, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-11 pr-24 outline-none focus:border-brand-primary focus:bg-white/[0.08] transition-all text-sm sm:text-base text-app-text placeholder:text-slate-500 shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={toggleListening}
                    className={`p-2 rounded-xl transition-all ${isListening ? 'text-white bg-red-500 animate-pulse shadow-lg shadow-red-500/30' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                    title="Voice Search"
                    aria-label="Voice Search"
                  >
                    <Mic size={16} />
                  </button>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
                      aria-label="Clear Search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Collections Horizontal Scroll Bar */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                {COLLECTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCollection(c.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 ${
                      selectedCollection === c.id 
                        ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCollection === c.id ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                      {c.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Topic Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 text-xs font-semibold shrink-0">
                  <Filter size={13} className="text-brand-primary" />
                  <span className="uppercase tracking-wider text-[10px]">Topic</span>
                </div>
                {TOPICS.map(topic => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 ${
                      selectedTopic === topic 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold shadow-sm' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {topic === 'all' ? 'All Topics' : topic}
                  </button>
                ))}

                {(searchQuery || selectedTopic !== 'all' || selectedCollection !== 'all') && (
                  <button 
                    onClick={clearFilters}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 px-3 py-1 bg-amber-400/10 rounded-lg shrink-0 border border-amber-400/20 transition-all"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Continuous Hadith Narration Player Console */}
              <div className="glass-panel p-4 sm:p-5 rounded-2xl border-white/10 bg-brand-sidebar/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    playbackState.isContinuous && playbackState.isPlaying
                      ? 'bg-brand-primary/20 border-brand-primary text-brand-primary animate-pulse'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Continuous Hadith Narrator
                      </span>
                      {playbackState.isContinuous && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active ({filteredHadith.length} items)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Auto-play through current collection with authentic Arabic & English translations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    onClick={() => {
                      if (playbackState.isContinuous) {
                        VoiceService.togglePauseContinuous();
                      } else {
                        const items = filteredHadith.map(h => ({
                          id: h.id,
                          arabic: h.arabic,
                          english: `${h.english} — Narrated by ${h.narrator} in ${h.collection}`,
                          title: h.topic
                        }));
                        VoiceService.startContinuousPlay(items, {
                          mode: 'both',
                          intervalMs: 800,
                          loop: true
                        });
                      }
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                      playbackState.isContinuous && playbackState.isPlaying && !playbackState.isPaused
                        ? 'bg-amber-500 text-black shadow-amber-500/20'
                        : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-brand-primary/20'
                    }`}
                  >
                    {playbackState.isContinuous && playbackState.isPlaying && !playbackState.isPaused ? (
                      <>
                        <Pause size={13} className="fill-current" />
                        <span>Pause Playlist</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="fill-current" />
                        <span>{playbackState.isContinuous ? 'Resume Playlist' : 'Play All Hadiths'}</span>
                      </>
                    )}
                  </button>

                  {playbackState.isContinuous && (
                    <button
                      onClick={() => VoiceService.stop()}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
                    >
                      Stop
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hadith Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <AnimatePresence mode="popLayout">
                {filteredHadith.map((h) => {
                  const isThisPlaying = playbackState.isPlaying && playbackState.activeId === h.id;
                  const isBookmarked = bookmarkedIds.includes(h.id);

                  return (
                    <motion.div
                      layout
                      key={h.id}
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 10 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => handleSelectHadith(h)}
                      className={`relative group p-5 sm:p-6 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between overflow-hidden shadow-lg ${
                        isThisPlaying 
                          ? 'bg-brand-primary/10 border-brand-primary/40 shadow-brand-primary/10 ring-1 ring-brand-primary/30' 
                          : 'bg-white/5 hover:bg-white/[0.08] border-white/10 hover:border-brand-primary/30'
                      }`}
                    >
                      {/* Top Meta Info & Quick Actions */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/15 border border-brand-primary/30 text-brand-accent text-[11px] font-semibold tracking-wide">
                              <HighlightText text={h.topic} highlight={searchQuery} />
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              {h.collection}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleToggleBookmark(h, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                              }`}
                              title={isBookmarked ? "Remove Bookmark" : "Bookmark Hadith"}
                              aria-label="Bookmark Hadith"
                            >
                              <Bookmark size={15} className={isBookmarked ? 'fill-current' : ''} />
                            </button>

                            <button
                              onClick={(e) => handleCopy(h, e)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors"
                              title="Copy text"
                              aria-label="Copy Hadith"
                            >
                              {copiedId === h.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                            </button>
                          </div>
                        </div>

                        {/* Arabic Text Snippet */}
                        <p className="font-arabic text-right text-lg sm:text-xl leading-relaxed text-amber-200/90 font-medium py-1.5 mb-2 line-clamp-2" dir="rtl">
                          {h.arabic}
                        </p>

                        {/* English Translation */}
                        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light italic mb-4 line-clamp-3">
                          "<HighlightText text={h.english} highlight={searchQuery} />"
                        </p>
                      </div>

                      {/* Interactive Audio Control Bar on Card */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-auto">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Play Arabic Audio */}
                          <button
                            onClick={(e) => handlePlayArabic(h, e)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isThisPlaying && playbackState.mode === 'arabic'
                                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                            }`}
                            title="Listen in Arabic voice"
                          >
                            {isThisPlaying && playbackState.mode === 'arabic' ? <Pause size={12} className="fill-current" /> : <Volume2 size={12} />}
                            <span className="text-[11px]">Arabic</span>
                          </button>

                          {/* Play English Narration */}
                          <button
                            onClick={(e) => handlePlayEnglish(h, e)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isThisPlaying && playbackState.mode === 'english'
                                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                            }`}
                            title="Listen in English voice"
                          >
                            {isThisPlaying && playbackState.mode === 'english' ? <Pause size={12} className="fill-current" /> : <Play size={12} />}
                            <span className="text-[11px]">English</span>
                          </button>

                          {/* Play Both Combined */}
                          <button
                            onClick={(e) => handlePlayBoth(h, e)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hidden sm:flex ${
                              isThisPlaying && playbackState.mode === 'both'
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                            }`}
                            title="Listen Arabic + English"
                          >
                            <Languages size={12} />
                            <span className="text-[11px]">Full</span>
                          </button>
                        </div>

                        {/* Narrator Info */}
                        <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[130px] text-right">
                          <HighlightText text={h.narrator} highlight={searchQuery} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredHadith.length === 0 && (
              <div className="text-center py-16 px-4 bg-white/5 rounded-3xl border border-dashed border-white/10 space-y-3">
                <Quote className="w-10 h-10 text-slate-500 mx-auto opacity-50" />
                <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">No Hadith matches found</p>
                <p className="text-xs text-slate-500">Try searching for keywords like "Charity", "Prayer", "Brotherhood", or "Sincerity".</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-primary/90 transition-all"
                >
                  View All Hadith
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Focused Hadith Modal / Full Detail View */
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto space-y-5"
          >
            {/* Back Button */}
            <button 
              onClick={() => {
                VoiceService.stop();
                setSelectedHadith(null);
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-brand-primary transition-colors text-xs font-bold uppercase tracking-wider py-2 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              Back to Hadith Library
            </button>

            {/* Sacred Card Container */}
            <div className="p-6 sm:p-10 md:p-14 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-b from-white/[0.08] via-white/5 to-brand-depth border border-white/15 relative overflow-hidden shadow-2xl space-y-8">
              
              {/* Top Header & Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shadow-inner">
                    <Book className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Authentic Wisdom
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      {selectedHadith.collection}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed Button */}
                  <button
                    onClick={handleToggleSpeed}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-300 transition-colors"
                    title="Change recitation speed"
                  >
                    {audioSpeed}x
                  </button>

                  {/* Bookmark Button */}
                  <button 
                    onClick={(e) => handleToggleBookmark(selectedHadith, e)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      bookmarkedIds.includes(selectedHadith.id) 
                        ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark size={18} className={bookmarkedIds.includes(selectedHadith.id) ? 'fill-current' : ''} />
                  </button>

                  {/* Copy Button */}
                  <button 
                    onClick={(e) => handleCopy(selectedHadith, e)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                    title="Copy Hadith"
                  >
                    {copiedId === selectedHadith.id ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>

                  {/* Share Button */}
                  <button 
                    onClick={(e) => handleShare(selectedHadith, e)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
                    title="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Main Hadith Content */}
              <div className="space-y-6 sm:space-y-8 text-center">
                {/* Arabic Calligraphy Recitation */}
                <p 
                  className="font-arabic text-2xl sm:text-4xl md:text-5xl text-amber-200 leading-[2] sm:leading-[2.2] text-center font-medium drop-shadow-sm" 
                  dir="rtl"
                >
                  {selectedHadith.arabic}
                </p>

                {/* Subtle Divider */}
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent mx-auto rounded-full" />

                {/* English Translation */}
                <p className="text-base sm:text-xl md:text-2xl text-slate-200 italic font-light leading-relaxed max-w-2xl mx-auto">
                  "{selectedHadith.english}"
                </p>
              </div>

              {/* Voice Recitation Bar */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">
                    Recitation & Audio Voice
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => handlePlayArabic(selectedHadith)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      playbackState.isPlaying && playbackState.activeId === selectedHadith.id && playbackState.mode === 'arabic'
                        ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30'
                        : 'bg-white/10 hover:bg-white/15 text-slate-200'
                    }`}
                  >
                    {playbackState.isPlaying && playbackState.activeId === selectedHadith.id && playbackState.mode === 'arabic' ? (
                      <>
                        <Pause size={14} className="fill-current" />
                        <span>Playing Arabic</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} />
                        <span>Recite Arabic</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePlayEnglish(selectedHadith)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      playbackState.isPlaying && playbackState.activeId === selectedHadith.id && playbackState.mode === 'english'
                        ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                        : 'bg-white/10 hover:bg-white/15 text-slate-200'
                    }`}
                  >
                    {playbackState.isPlaying && playbackState.activeId === selectedHadith.id && playbackState.mode === 'english' ? (
                      <>
                        <Pause size={14} className="fill-current" />
                        <span>Playing English</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        <span>Narrate English</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handlePlayBoth(selectedHadith)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      playbackState.isPlaying && playbackState.activeId === selectedHadith.id && playbackState.mode === 'both'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/15 text-slate-200'
                    }`}
                  >
                    <Languages size={14} />
                    <span>Play Both</span>
                  </button>
                </div>
              </div>

              {/* Narrator & Topic Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-center">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Theme & Topic
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-brand-primary">
                    {selectedHadith.topic}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    Narrated By
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-200">
                    {selectedHadith.narrator}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
