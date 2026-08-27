import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Users, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  Copy, 
  BookOpen, 
  Share2, 
  Search, 
  Filter, 
  Flame, 
  Bookmark, 
  RotateCcw,
  ShieldCheck,
  Languages,
  CheckCircle2
} from 'lucide-react';
import { ALL_ADHKAR_CATEGORIES, DhikrItem } from '../data/adhkarData.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';

interface MarriageDuasCategoryViewProps {
  addHasanat: (amount: number) => void;
  incrementDua: () => void;
  searchQuery?: string;
  initialSubCategory?: 'all' | 'seeking_marriage' | 'married_couples' | 'prophets_duas';
}

export interface MarriageDuaItemExtended extends DhikrItem {
  categoryType: 'seeking_marriage' | 'married_couples' | 'prophets_duas';
  categoryTitle: string;
  categoryArabic: string;
  hadithSource?: string;
}

export default function MarriageDuasCategoryView({
  addHasanat,
  incrementDua,
  searchQuery: externalQuery = '',
  initialSubCategory = 'all'
}: MarriageDuasCategoryViewProps) {
  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'seeking_marriage' | 'married_couples' | 'prophets_duas'>(initialSubCategory);
  const [internalSearch, setInternalSearch] = useState<string>('');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [counterMap, setCounterMap] = useState<Record<string, number>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fontSizeScale, setFontSizeScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(VoiceService.getState());

  // Extract relevant marriage and couple supplications
  const allDuas = useMemo<MarriageDuaItemExtended[]>(() => {
    const list: MarriageDuaItemExtended[] = [];

    const seekingCat = ALL_ADHKAR_CATEGORIES.find(c => c.id === 'seeking_marriage');
    if (seekingCat) {
      seekingCat.items.forEach(item => {
        list.push({
          ...item,
          categoryType: 'seeking_marriage',
          categoryTitle: 'Duas for Seeking a Righteous Spouse',
          categoryArabic: 'أدعية تيسير الزواج والزوج الصالح',
          hadithSource: item.english.includes('(') ? item.english.match(/\(([^)]+)\)/)?.[1] : 'Sunnah & Quran'
        });
      });
    }

    const marriedCat = ALL_ADHKAR_CATEGORIES.find(c => c.id === 'married_couples');
    if (marriedCat) {
      marriedCat.items.forEach(item => {
        list.push({
          ...item,
          categoryType: 'married_couples',
          categoryTitle: 'Duas for Married Couples & Peace Between Spouses',
          categoryArabic: 'أدعية المتزوجين والسكينة بين الزوجين',
          hadithSource: item.english.includes('(') ? item.english.match(/\(([^)]+)\)/)?.[1] : 'Sunnah & Hadith'
        });
      });
    }

    // Additional prophetic marriage & family gems
    const prophetsCat = ALL_ADHKAR_CATEGORIES.find(c => c.id === 'prophets_duas');
    if (prophetsCat) {
      const familyProphets = prophetsCat.items.filter(i => i.id === 'pd6' || i.id === 'pd8' || i.id === 'pd4');
      familyProphets.forEach(item => {
        list.push({
          ...item,
          categoryType: 'prophets_duas',
          categoryTitle: 'Prophetic Duas for Family & Provision',
          categoryArabic: 'أدعية الأنبياء للأهل والذرية والرزق',
          hadithSource: 'Holy Quran & Prophetic Sunnah'
        });
      });
    }

    return list;
  }, []);

  const query = (internalSearch || externalQuery).trim().toLowerCase();

  const filteredDuas = useMemo(() => {
    return allDuas.filter(item => {
      const matchesTab = selectedSubTab === 'all' || item.categoryType === selectedSubTab;
      if (!matchesTab) return false;
      if (!query) return true;

      return (
        item.arabic.includes(query) ||
        item.english.toLowerCase().includes(query) ||
        item.benefit.toLowerCase().includes(query) ||
        (item.transliteration && item.transliteration.toLowerCase().includes(query)) ||
        (item.hadithSource && item.hadithSource.toLowerCase().includes(query))
      );
    });
  }, [allDuas, selectedSubTab, query]);

  const handlePlayAudio = (dua: MarriageDuaItemExtended, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === dua.id) {
      VoiceService.stop();
    } else {
      VoiceService.speakBoth(dua.arabic, dua.english, dua.id);
    }
  };

  const handleIncrement = (dua: MarriageDuaItemExtended, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(25); } catch {}
    }

    const cur = counterMap[dua.id] || 0;
    const next = cur + 1;
    const isFinished = next >= dua.targetCount;

    setCounterMap(prev => ({
      ...prev,
      [dua.id]: isFinished ? dua.targetCount : next
    }));

    if (isFinished && !completedMap[dua.id]) {
      setCompletedMap(prev => ({ ...prev, [dua.id]: true }));
      addHasanat(5);
      incrementDua();
    }
  };

  const handleCopy = (dua: MarriageDuaItemExtended, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const text = `${dua.arabic}\n\n${dua.transliteration || ''}\n\n"${dua.english}"\n\nBenefit & Hadith: ${dua.benefit}\n(Habibi Sanctuary • Duas for Marriage)`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fontClass = fontSizeScale === 'lg' ? 'text-3xl sm:text-4xl' : fontSizeScale === 'sm' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1b1026] via-[#101b2b] to-[#0a1826] border border-brand-primary/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-bold uppercase tracking-wider">
            <Heart size={14} className="fill-pink-400/40 text-pink-400" />
            <span>Sacred Marital Bond • Hadith & Quranic Supplications</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Duas for <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-brand-primary">Marriage & Spousal Harmony</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light leading-relaxed">
                Authentic prayers from the Noble Quran and established Hadith collections (Bukhari, Muslim, Tirmidhi, Abu Dawud) for those seeking a righteous spouse, easing marital arrangements, and nurturing enduring love, affection (Mawaddah), and tranquility (Sakinah) in the home.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-2xl shrink-0">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Users size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authentic Duas</p>
                <p className="text-lg font-black text-white">{allDuas.length} Supplications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategory Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'all', label: 'All Marriage Duas', count: allDuas.length, icon: Sparkles },
            { id: 'seeking_marriage', label: 'Seeking a Spouse', count: allDuas.filter(d => d.categoryType === 'seeking_marriage').length, icon: Heart },
            { id: 'married_couples', label: 'Spousal Love & Peace', count: allDuas.filter(d => d.categoryType === 'married_couples').length, icon: Users },
            { id: 'prophets_duas', label: 'Prophets on Family', count: allDuas.filter(d => d.categoryType === 'prophets_duas').length, icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = selectedSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-600/80 to-brand-primary text-white border-transparent shadow-lg shadow-pink-500/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls: Search & Font Size */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search marriage duas..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
          </div>

          <button
            onClick={() => setShowTransliteration(!showTransliteration)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              showTransliteration ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 text-slate-500'
            }`}
            title="Toggle Transliteration"
          >
            Abc
          </button>

          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-xs font-bold text-slate-400">
            {(['sm', 'md', 'lg'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFontSizeScale(s)}
                className={`px-2 py-1 rounded-lg transition-colors uppercase cursor-pointer ${fontSizeScale === s ? 'bg-brand-primary text-white font-black' : 'hover:text-white'}`}
              >
                {s === 'sm' ? 'A-' : s === 'md' ? 'A' : 'A+'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredDuas.map((dua, index) => {
            const count = counterMap[dua.id] || 0;
            const isCompleted = completedMap[dua.id] || count >= dua.targetCount;
            const isPlaying = playbackState.isPlaying && playbackState.activeId === dua.id;

            return (
              <motion.div
                key={dua.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`relative rounded-[2rem] p-6 sm:p-7 border transition-all flex flex-col justify-between overflow-hidden group ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-brand-sidebar/70 hover:bg-brand-sidebar border-white/10 hover:border-pink-500/30'
                }`}
              >
                {/* Top Badge: Category & Target */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                      dua.categoryType === 'seeking_marriage'
                        ? 'bg-pink-500/10 border-pink-500/30 text-pink-300'
                        : dua.categoryType === 'married_couples'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}>
                      {dua.categoryType === 'seeking_marriage' ? <Heart size={12} className="fill-current" /> : <Users size={12} />}
                      <span>{dua.categoryType === 'seeking_marriage' ? 'Seeking a Spouse' : dua.categoryType === 'married_couples' ? 'Spousal Harmony' : 'Prophetic Gem'}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {count} / {dua.targetCount}x
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 size={14} /> Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arabic Calligraphy */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/5 text-right">
                    <p className={`font-arabic font-bold text-slate-100 leading-loose select-all ${fontClass}`} dir="rtl">
                      {dua.arabic}
                    </p>
                  </div>

                  {/* Transliteration */}
                  {showTransliteration && dua.transliteration && (
                    <p className="text-xs sm:text-sm text-pink-200/90 italic font-medium leading-relaxed">
                      "{dua.transliteration}"
                    </p>
                  )}

                  {/* English Translation */}
                  <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed">
                    {dua.english}
                  </p>

                  {/* Benefit & Sunnah Source Context */}
                  {dua.benefit && (
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                        <ShieldCheck size={12} />
                        <span>Virtue & Hadith Context</span>
                      </p>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        {dua.benefit}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  {/* Audio & Copy Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handlePlayAudio(dua, e)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/30'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title={isPlaying ? 'Stop Audio' : 'Listen with Audio Recitation'}
                    >
                      {isPlaying ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>

                    <button
                      onClick={(e) => handleCopy(dua, e)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                      title="Copy Supplication"
                    >
                      {copiedId === dua.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>

                    {count > 0 && (
                      <button
                        onClick={() => setCounterMap(prev => ({ ...prev, [dua.id]: 0 }))}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        title="Reset Counter"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>

                  {/* Tap to Count Tasbih Button */}
                  <button
                    onClick={(e) => handleIncrement(dua, e)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-lg shadow-pink-600/20'
                    }`}
                  >
                    <Flame size={14} className={count > 0 ? 'text-amber-300' : ''} />
                    <span>{isCompleted ? 'Recited ✓' : `Tap (${count}/${dua.targetCount})`}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDuas.length === 0 && (
        <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
          <Heart size={36} className="mx-auto text-slate-600" />
          <p className="text-base font-bold text-white">No marriage supplications matched your search</p>
          <p className="text-xs text-slate-500">Try clearing your search query or selecting "All Marriage Duas"</p>
        </div>
      )}
    </div>
  );
}
