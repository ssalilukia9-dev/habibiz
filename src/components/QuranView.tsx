import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { SURAH_LIST, JUZ_LIST, RECITERS } from '../constants';
import { Surah, Ayah, Juz } from '../types';
import { 
  BookOpen, 
  Hash, 
  ArrowRight, 
  Volume2, 
  Check, 
  Crown, 
  ChevronDown, 
  Sparkles, 
  WifiOff, 
  Layers, 
  FileText,
  Compass
} from 'lucide-react';
import SurahDetail from './SurahDetail';
import JuzDetail from './JuzDetail';
import MushafPageView from './MushafPageView';
import { offlineService } from '../services/offlineService';

interface QuranViewProps {
  selectedSurah: Surah | null;
  onSelectSurah: (surah: Surah | null) => void;
  searchQuery: string;
  bookmarks: Ayah[];
  onToggleBookmark: (ayah: Ayah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  addHasanat: (amount: number) => void;
  incrementVerse: () => void;
  language: string;
}

export default function QuranView({ 
  selectedSurah, 
  onSelectSurah, 
  searchQuery, 
  bookmarks, 
  onToggleBookmark,
  selectedReciter,
  onReciterChange,
  addHasanat,
  incrementVerse,
  language,
  isPremium,
  onShowPremium
}: QuranViewProps & { isPremium: boolean; onShowPremium: () => void }) {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'surah' | 'juz' | 'mushaf'>(() => {
    if (location.state?.page) return 'mushaf';
    if (location.state?.juzIndex) return 'juz';
    return 'surah';
  });
  const [showReciterList, setShowReciterList] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(() => {
    return location.state?.juzIndex || null;
  });
  const [mushafPage, setMushafPage] = useState<number>(() => {
    return location.state?.page || 1;
  });
  const [downloadedSurahs, setDownloadedSurahs] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (location.state?.page) {
      setMushafPage(location.state.page);
      setViewMode('mushaf');
    } else if (location.state?.juzIndex) {
      setSelectedJuz(location.state.juzIndex);
      setViewMode('juz');
    }
  }, [location.state]);

  useEffect(() => {
    offlineService.getAllDownloadedSurahs().then(metadata => {
      const nums = new Set(Object.keys(metadata).map(k => Number(k.split('_')[0])));
      setDownloadedSurahs(nums);
    });
  }, [selectedSurah, selectedJuz]);

  const handleReciterSelect = (id: number) => {
    if (id > 2 && !isPremium) {
      onShowPremium();
      return;
    }
    onReciterChange(id);
    setShowReciterList(false);
  };

  const bookmarkIds = bookmarks.map(b => b.number);

  const handleToggleAyahBookmark = (ayahNumber: number) => {
    const existing = bookmarks.find(b => b.number === ayahNumber);
    if (existing) {
      onToggleBookmark(existing);
    } else {
      const dummyAyah: Ayah = {
        number: ayahNumber,
        text: '',
        numberInSurah: ayahNumber,
        juz: 1,
        manzil: 1,
        page: 1,
        ruku: 1,
        hizbQuarter: 1,
        sajda: false
      };
      onToggleBookmark(dummyAyah);
    }
  };

  if (selectedSurah) {
    return (
      <SurahDetail 
        surah={selectedSurah} 
        onBack={() => onSelectSurah(null)} 
        bookmarks={bookmarks} 
        onToggleBookmark={onToggleBookmark}
        selectedReciter={selectedReciter}
        onReciterChange={onReciterChange}
        addHasanat={addHasanat}
        incrementVerse={incrementVerse}
        language={language}
      />
    );
  }

  if (selectedJuz) {
    return (
      <JuzDetail 
        juzIndex={selectedJuz}
        onBack={() => setSelectedJuz(null)}
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
        selectedReciter={selectedReciter}
        onReciterChange={onReciterChange}
        addHasanat={addHasanat}
        incrementVerse={incrementVerse}
        language={language}
      />
    );
  }

  const filteredSurahs = SURAH_LIST.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery) ||
    s.number.toString() === searchQuery
  );

  const filteredJuzList = JUZ_LIST.filter(j => 
    j.index.toString().includes(searchQuery) ||
    j.nameArabic.includes(searchQuery) ||
    j.nameTransliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.surahs.some(s => s.surahEnglishName.toLowerCase().includes(searchQuery.toLowerCase()) || s.surahName.includes(searchQuery))
  );

  const activeReciter = RECITERS.find(r => r.id === selectedReciter);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 md:space-y-10"
    >
      {/* Header with 3 Mode Toggles and Reciter Selection */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* View Toggle */}
        <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 p-1.5 rounded-2xl w-full sm:w-fit border border-white/5">
          <button 
            onClick={() => setViewMode('surah')}
            className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'surah' ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Surah
          </button>
          <button 
            onClick={() => setViewMode('juz')}
            className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'juz' ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            By Juz (30)
          </button>
          <button 
            onClick={() => setViewMode('mushaf')}
            className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'mushaf' ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={13} /> Mushaf Page (QR)
          </button>
        </div>

        {/* Reciter Selector */}
        {viewMode !== 'mushaf' && (
          <div className="relative w-full md:w-fit">
            <button 
              onClick={() => setShowReciterList(!showReciterList)}
              className="w-full md:w-80 flex items-center justify-between gap-4 bg-brand-sidebar border border-white/10 p-3.5 rounded-2xl hover:border-brand-primary/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 transition-all">
                  <Volume2 size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Reciter</p>
                  <p className="text-xs font-bold text-slate-200">{activeReciter?.name}</p>
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${showReciterList ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showReciterList && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-3 left-0 right-0 md:w-80 bg-brand-sidebar border border-white/10 rounded-[2rem] p-3 shadow-2xl z-50 backdrop-blur-3xl overflow-hidden"
                >
                  <div className="max-h-[350px] overflow-y-auto no-scrollbar space-y-1">
                    {RECITERS.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleReciterSelect(r.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${selectedReciter === r.id ? 'bg-brand-primary text-brand-depth shadow-lg' : 'hover:bg-white/5 text-slate-300'} ${r.id > 2 && !isPremium ? 'opacity-50' : ''}`}
                      >
                        <div className="text-left min-w-0">
                          <p className={`text-xs font-bold truncate ${selectedReciter === r.id ? 'text-brand-depth' : 'text-slate-200'}`}>{r.name} {r.id > 2 && !isPremium && <Crown size={12} className="inline ml-1 text-amber-500" />}</p>
                          <p className={`text-[9px] uppercase font-bold tracking-tighter opacity-60 ${selectedReciter === r.id ? 'text-brand-depth/70' : 'text-slate-500'}`}>{r.sub}</p>
                        </div>
                        {selectedReciter === r.id && <Check size={14} className="flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* VIEW 1: SURAH LIST */}
      {viewMode === 'surah' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredSurahs.map((surah, idx) => (
            <motion.button
              key={surah.number}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.3) }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSurah(surah)}
              className="group bg-white/5 p-4 md:p-5 rounded-[1.8rem] border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/10 transition-all text-left flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center text-brand-primary font-bold group-hover:bg-brand-primary transition-all group-hover:text-brand-depth shadow-lg text-sm">
                  {surah.number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm md:text-base group-hover:text-brand-primary transition-colors">{surah.englishName}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</p>
                    {downloadedSurahs.has(surah.number) && (
                      <div className="flex items-center gap-1 text-[7px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <WifiOff size={8} /> Offline
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="arabic-text text-xl md:text-2xl font-bold text-brand-primary">{surah.name}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* VIEW 2: FULL COMPILED JUZ BROWSER */}
      {viewMode === 'juz' && (
        <div className="space-y-6">
          <div className="p-6 rounded-[2rem] bg-gradient-to-r from-brand-primary/10 via-transparent to-brand-primary/5 border border-brand-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Complete Compilation</span>
              <h3 className="text-xl font-black text-white">All 30 Juz of the Holy Quran</h3>
              <p className="text-xs text-slate-400 mt-1">Every Juz compiled with all contained Surahs, starting & ending verses, and Mushaf page bounds.</p>
            </div>
            <span className="px-4 py-2 bg-brand-primary/20 rounded-full text-xs font-black text-brand-primary border border-brand-primary/30">
              30 / 30 Juz Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJuzList.map((juz, idx) => (
              <motion.div
                key={juz.index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.3) }}
                className="glass-panel p-6 rounded-[2.2rem] border-white/10 hover:border-brand-primary/40 bg-white/[0.02] transition-all flex flex-col justify-between gap-5 group"
              >
                <div>
                  {/* Top Header of Juz Card */}
                  <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-base shadow-inner group-hover:bg-brand-primary group-hover:text-brand-depth transition-all">
                        #{juz.index}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">Juz {juz.index}</span>
                          <span className="text-[9px] text-slate-500 font-bold">• Pages {juz.startPage}–{juz.endPage}</span>
                        </div>
                        <h4 className="text-base font-black text-white">{juz.nameTransliteration}</h4>
                        <p className="text-[10px] text-slate-400 italic">{juz.nameTranslation}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="arabic-text text-2xl font-bold text-brand-primary">{juz.nameArabic}</p>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{juz.totalAyahs} Ayahs</span>
                    </div>
                  </div>

                  {/* Contained Surahs in this Juz */}
                  <div className="mt-4 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Contains {juz.surahs.length} {juz.surahs.length === 1 ? 'Surah' : 'Surahs'}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {juz.surahs.map((s) => (
                        <button
                          key={s.surahNumber}
                          onClick={() => {
                            const found = SURAH_LIST.find(sl => sl.number === s.surahNumber);
                            if (found) onSelectSurah(found);
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-brand-primary/20 hover:border-brand-primary/40 border border-white/10 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                          title={`Read Surah ${s.surahEnglishName} (Ayahs ${s.startAyah} - ${s.endAyah})`}
                        >
                          <span className="w-4 h-4 rounded-md bg-white/10 text-brand-primary flex items-center justify-center text-[8px] font-black">{s.surahNumber}</span>
                          <span>{s.surahEnglishName}</span>
                          <span className="text-[8px] text-slate-400">({s.startAyah}:{s.endAyah})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <button 
                    onClick={() => {
                      setMushafPage(juz.startPage);
                      setViewMode('mushaf');
                    }}
                    className="text-[10px] font-black text-slate-400 hover:text-brand-primary uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText size={12} /> Mushaf Page {juz.startPage}
                  </button>

                  <button 
                    onClick={() => setSelectedJuz(juz.index)}
                    className="px-5 py-2.5 bg-brand-primary text-brand-depth font-black text-[10px] uppercase tracking-widest rounded-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-brand-primary/20"
                  >
                    Read Entire Juz <ArrowRight size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CLASSICAL MUSHAF PAGE-BY-PAGE VIEW (QR EDITION) */}
      {viewMode === 'mushaf' && (
        <MushafPageView 
          initialPage={mushafPage}
          onBack={() => setViewMode('surah')}
          onSelectSurah={onSelectSurah}
          selectedReciter={selectedReciter}
          onReciterChange={onReciterChange}
          addHasanat={addHasanat}
          incrementVerse={incrementVerse}
          language={language}
          bookmarks={bookmarkIds}
          onToggleBookmark={handleToggleAyahBookmark}
        />
      )}
    </motion.div>
  );
}
