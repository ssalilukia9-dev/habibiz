import { useState, useEffect } from 'react';
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
  Pause
} from 'lucide-react';
import { HADITH_DATABASE } from '../data/hadiths.ts';
import { VoiceService } from '../services/voiceService.ts';

const COLLECTIONS = [
  { id: 'all', name: 'All Collections', color: 'bg-brand-primary' },
  { id: 'Sahih Bukhari', name: 'Sahih Bukhari', color: 'bg-blue-500' },
  { id: 'Sahih Muslim', name: 'Sahih Muslim', color: 'bg-purple-600' },
  { id: 'Tirmidhi', name: 'Sunan al-Tirmidhi', color: 'bg-teal-500' },
  { id: 'Al-Adab Al-Mufrad', name: 'Al-Adab Al-Mufrad', color: 'bg-purple-500' }
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
  const [selectedCollection, _setSelectedCollection] = useState(initialCollection || 'all');
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  const handleSelectHadith = (h: typeof HADITH_DATABASE[0]) => {
    setSelectedHadith(h);
    // Award Hasanat for exploring wisdom
    const viewedKey = `viewed-hadith-${h.id}`;
    if (!localStorage.getItem(viewedKey)) {
      addHasanat(20);
      localStorage.setItem(viewedKey, 'true');
    }
  };

  const handleSpeak = (h: typeof HADITH_DATABASE[0]) => {
    if (speakingId === h.id) {
      VoiceService.stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(h.id);
      VoiceService.speak(h.arabic, 'ar');
      // After a certain time or end of speaking, we should reset.
      // Since window.speechSynthesis doesn't always trigger robustly on all browsers, we'll use a timeout fallback or just rely on manual stop.
    }
  };

  useEffect(() => {
    return () => VoiceService.stop();
  }, []);

  const setSelectedCollection = (id: string) => {
    _setSelectedCollection(id);
    onCollectionChange?.(id);
  };

  // Sync if prop changes externally
  useEffect(() => {
    if (initialCollection && initialCollection !== selectedCollection) {
      _setSelectedCollection(initialCollection);
    }
  }, [initialCollection]);
  // Search and Filter State
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedHadith, setSelectedHadith] = useState<typeof HADITH_DATABASE[0] | null>(null);

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
    const matchesSearch = h.english.toLowerCase().includes(searchLower) || 
                          h.topic.toLowerCase().includes(searchLower) ||
                          h.narrator.toLowerCase().includes(searchLower) ||
                          h.arabic.includes(searchQuery); // Arabic search
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
            <span key={i} className="bg-brand-primary/20 text-brand-primary font-bold rounded-sm px-0.5">
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <AnimatePresence mode="wait">
        {!selectedHadith ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-primary transition-colors" size={18} />
                  <input 
                    type="text"
                    placeholder="Search by topic, narrator, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-brand-primary/50 focus:bg-white/[0.07] transition-all text-slate-200"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {(searchQuery || selectedTopic !== 'all' || selectedCollection !== 'all') && (
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest px-4 py-2 hover:bg-brand-primary/10 rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {COLLECTIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCollection(c.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${
                        selectedCollection === c.id 
                          ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary shadow-lg shadow-brand-primary/10' 
                          : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <div className="flex items-center gap-2 px-3 border-r border-white/10 mr-1">
                    <Filter size={12} className="text-brand-primary" />
                    <span className="text-[10px] font-black text-slate-500 whitespace-nowrap uppercase tracking-widest">Topic</span>
                  </div>
                  {TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                        selectedTopic === topic 
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                          : 'bg-white/5 border-transparent text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {topic === 'all' ? 'All Topics' : topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hadith List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredHadith.map((h, i) => (
                  <motion.button
                    layout
                    key={h.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ 
                      type: "spring",
                      duration: 0.4,
                      bounce: 0,
                      delay: searchQuery ? 0 : i * 0.05 
                    }}
                    onClick={() => handleSelectHadith(h)}
                    className="glass-panel p-6 rounded-3xl text-left border-white/5 hover:border-brand-primary/20 transition-all group overflow-hidden relative h-full flex flex-col"
                  >
                    <div className="absolute top-0 right-0 p-4 text-brand-primary/10 group-hover:scale-110 transition-transform">
                      <Quote size={40} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest rounded-lg">
                        <HighlightText text={h.topic} highlight={searchQuery} />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{h.collection}</span>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSpeak(h); }}
                        className={`p-2 rounded-xl border transition-all ${speakingId === h.id ? 'bg-brand-primary border-brand-primary text-brand-depth' : 'border-white/10 text-slate-500 hover:text-brand-primary hover:border-brand-primary/30'}`}
                      >
                        {speakingId === h.id ? <Pause size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-4 font-light italic flex-1">
                      "<HighlightText text={h.english} highlight={searchQuery} />"
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Reported by <HighlightText text={h.narrator} highlight={searchQuery} />
                      </span>
                      <ChevronRight size={16} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {filteredHadith.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] mb-2">No matching wisdom found</p>
                <p className="text-xs text-slate-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl mx-auto"
          >
            <button 
              onClick={() => setSelectedHadith(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors text-xs font-bold uppercase tracking-widest mb-8 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Library
            </button>

            <div className="glass-panel p-6 sm:p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] border-brand-primary/20 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 text-brand-primary/5 pointer-events-none">
                <Quote size={200} />
              </div>
              
              <div className="relative z-10 space-y-8 md:space-y-12">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-primary">
                      <Book className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection</p>
                      <p className="text-xs md:text-sm font-bold text-slate-200">{selectedHadith.collection}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                        onClick={() => handleSpeak(selectedHadith)}
                        className={`p-2 md:p-3 rounded-xl border transition-all ${speakingId === selectedHadith.id ? 'bg-brand-primary border-brand-primary text-brand-depth shadow-xl' : 'glass-panel text-slate-400 hover:text-brand-primary'}`}
                      >
                        {speakingId === selectedHadith.id ? <Pause size={18} /> : <Volume2 size={18} />}
                     </button>
                     <button className="p-2 md:p-3 glass-panel rounded-xl text-slate-400 hover:text-brand-primary transition-all">
                        <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                     <button className="p-2 md:p-3 glass-panel rounded-xl text-slate-400 hover:text-brand-primary transition-all">
                        <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                     </button>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-10 text-center">
                  <p className="arabic-text text-3xl md:text-5xl text-brand-primary leading-[1.8] text-center" dir="rtl">
                    {selectedHadith.arabic}
                  </p>
                  <div className="w-16 md:w-20 h-1 bg-brand-primary/20 mx-auto rounded-full" />
                  <p className="text-lg md:text-2xl text-slate-300 italic font-light leading-relaxed">
                    "<HighlightText text={selectedHadith.english} highlight={searchQuery} />"
                  </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 pt-6 md:pt-10 border-t border-white/10">
                   <div className="text-center md:text-left">
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic</p>
                      <p className="text-xs md:text-sm font-black text-brand-primary uppercase tracking-wider">
                        <HighlightText text={selectedHadith.topic} highlight={searchQuery} />
                      </p>
                   </div>
                   <div className="w-px h-10 bg-white/10 hidden md:block" />
                   <div className="text-center md:text-left">
                      <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narrated by</p>
                      <p className="text-xs md:text-sm font-black text-slate-200">
                        <HighlightText text={selectedHadith.narrator} highlight={searchQuery} />
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
