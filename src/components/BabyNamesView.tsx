import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, 
  Search, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Check, 
  Share2, 
  Volume2, 
  Filter, 
  X,
  Star
} from 'lucide-react';
import { ISLAMIC_BABY_NAMES, BabyNameItem } from '../data/islamicBabyNamesData';

interface BabyNamesViewProps {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
}

export default function BabyNamesView({ onBack, addHasanat }: BabyNamesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<'all' | 'boy' | 'girl'>('all');
  const [quranicOnly, setQuranicOnly] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_fav_baby_names');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('sanctuary_fav_baby_names', JSON.stringify(next));
      return next;
    });
    if (addHasanat && !favorites.includes(id)) {
      addHasanat(1);
    }
  };

  const handleSpeak = (name: string, arabic: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(name);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (item: BabyNameItem) => {
    navigator.clipboard.writeText(`${item.name} (${item.arabic}) - ${item.meaning}. Origin: ${item.origin}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Alphabet list for quick letter filtering
  const letters = ['ALL', ...Array.from(new Set(ISLAMIC_BABY_NAMES.map(n => n.name[0].toUpperCase()))).sort()];

  const filteredNames = useMemo(() => {
    return ISLAMIC_BABY_NAMES.filter(item => {
      const matchesGender = selectedGender === 'all' || item.gender === selectedGender;
      const matchesQuranic = !quranicOnly || item.isQuranic;
      const matchesLetter = selectedLetter === 'ALL' || item.name.toUpperCase().startsWith(selectedLetter);
      
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        item.name.toLowerCase().includes(q) ||
        item.arabic.includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.origin.toLowerCase().includes(q);

      return matchesGender && matchesQuranic && matchesLetter && matchesQuery;
    });
  }, [searchQuery, selectedGender, quranicOnly, selectedLetter]);

  const boyCount = ISLAMIC_BABY_NAMES.filter(n => n.gender === 'boy').length;
  const girlCount = ISLAMIC_BABY_NAMES.filter(n => n.gender === 'girl').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-purple-950/60 border border-white/10 p-6 md:p-10 backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <Baby size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                  200+ Verified Islamic Names
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest">
                  Boys ({boyCount}) • Girls ({girlCount})
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Sacred Islamic Baby Names
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium mt-1">
                Prophetic, Quranic, and Sahaba names with authentic Arabic typography, noble meanings, and pronunciation guides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setQuranicOnly(!quranicOnly)}
              className={`px-4 py-2.5 rounded-2xl border font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                quranicOnly 
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              <span>Quranic Names Only</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by English name, Arabic (مُحَمَّد), meaning, or Sahaba origin..."
              className="w-full pl-12 pr-10 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-primary/50 transition-all backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Gender Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          {[
            { id: 'all', label: `All Names (${ISLAMIC_BABY_NAMES.length})` },
            { id: 'boy', label: `Boys (${boyCount}) 👦` },
            { id: 'girl', label: `Girls (${girlCount}) 👧` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedGender(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                selectedGender === tab.id
                  ? 'bg-brand-primary text-brand-depth border-brand-primary shadow-lg shadow-brand-primary/20'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {favorites.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGender('all');
                setSelectedLetter('ALL');
              }}
              className="ml-auto px-4 py-2 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold flex items-center gap-1.5"
            >
              <Heart size={14} className="fill-pink-400" />
              <span>{favorites.length} Saved Favorites</span>
            </button>
          )}
        </div>

        {/* Alphabet Letter Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none relative z-10">
          {letters.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLetter(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${
                selectedLetter === l
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Baby Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredNames.map((item) => {
            const isFav = favorites.includes(item.id);
            const isBoy = item.gender === 'boy';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`relative rounded-3xl p-6 border transition-all duration-300 space-y-4 backdrop-blur-xl group hover:shadow-2xl ${
                  isBoy
                    ? 'bg-gradient-to-br from-blue-950/20 via-slate-900/60 to-black/80 border-blue-500/20 hover:border-blue-400/40'
                    : 'bg-gradient-to-br from-pink-950/20 via-slate-900/60 to-black/80 border-pink-500/20 hover:border-pink-400/40'
                }`}
              >
                {/* Top Row: Transliteration + Arabic Typography + Fav */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white tracking-tight">
                        {item.name}
                      </h3>
                      {item.isQuranic && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                          Quranic
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.pronunciation}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-2xl font-serif font-black text-amber-300 drop-shadow-sm font-arabic">
                      {item.arabic}
                    </span>
                  </div>
                </div>

                {/* Meaning & Details */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-200">
                    <span className="text-slate-400 font-medium">Meaning: </span>
                    {item.meaning}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2">
                    <span className="text-slate-500">Origin: </span>
                    {item.origin}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSpeak(item.name, item.arabic, item.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Pronounce Name"
                    >
                      <Volume2 size={15} className={speakingId === item.id ? 'animate-bounce text-emerald-400' : ''} />
                    </button>
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copy Name Details"
                    >
                      {copiedId === item.id ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                    </button>
                  </div>

                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isFav
                        ? 'bg-pink-500/20 border-pink-500/50 text-pink-300 shadow-md shadow-pink-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart size={14} className={isFav ? 'fill-pink-400 text-pink-400' : ''} />
                    <span>{isFav ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredNames.length === 0 && (
        <div className="text-center py-16 p-8 rounded-3xl bg-black/40 border border-white/10 space-y-3">
          <Baby size={40} className="text-slate-500 mx-auto opacity-50" />
          <h4 className="text-lg font-black text-white">No names match "{searchQuery}"</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Names", or clearing the letter filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGender('all');
              setSelectedLetter('ALL');
              setQuranicOnly(false);
            }}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
