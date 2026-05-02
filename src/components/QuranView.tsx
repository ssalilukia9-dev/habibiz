import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SURAH_LIST, JUZ_LIST, RECITERS } from '../constants.ts';
import { Surah, Ayah } from '../types.ts';
import { BookOpen, Hash, ArrowRight, Volume2, Check, ChevronDown } from 'lucide-react';
import SurahDetail from './SurahDetail.tsx';

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
  incrementVerse
}: QuranViewProps) {
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');
  const [showReciterList, setShowReciterList] = useState(false);

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
      />
    );
  }

  const filteredSurahs = SURAH_LIST.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery) ||
    s.number.toString() === searchQuery
  );

  const activeReciter = RECITERS.find(r => r.id === selectedReciter);

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Header with Reciter Selection */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* View Toggle */}
        <div className="flex items-center gap-2 md:gap-4 bg-white/5 p-1 rounded-2xl w-full sm:w-fit border border-white/5">
          <button 
            onClick={() => setViewMode('surah')}
            className={`flex-1 sm:flex-none px-4 md:px-8 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
              viewMode === 'surah' ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-brand-primary'
            }`}
          >
            By Surah
          </button>
          <button 
            onClick={() => setViewMode('juz')}
            className={`flex-1 sm:flex-none px-4 md:px-8 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
              viewMode === 'juz' ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' : 'text-slate-500 hover:text-brand-primary'
            }`}
          >
            By Juz
          </button>
        </div>

        {/* Reciter Selector */}
        <div className="relative w-full md:w-fit">
          <button 
            onClick={() => setShowReciterList(!showReciterList)}
            className="w-full md:w-80 flex items-center justify-between gap-4 bg-brand-sidebar border border-white/10 p-4 rounded-2xl hover:border-brand-primary/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary/20 transition-all">
                <Volume2 size={20} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Reciter</p>
                <p className="text-sm font-bold text-slate-200">{activeReciter?.name}</p>
              </div>
            </div>
            <ChevronDown size={18} className={`text-slate-500 transition-transform ${showReciterList ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showReciterList && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-4 left-0 right-0 md:w-80 bg-brand-sidebar border border-white/10 rounded-[2rem] p-3 shadow-2xl z-50 backdrop-blur-3xl overflow-hidden"
              >
                <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-1">
                  {RECITERS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onReciterChange(r.id);
                        setShowReciterList(false);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${selectedReciter === r.id ? 'bg-brand-primary text-brand-depth shadow-lg' : 'hover:bg-white/5 text-slate-300'}`}
                    >
                      <div className="text-left min-w-0">
                        <p className={`text-sm font-bold truncate ${selectedReciter === r.id ? 'text-brand-depth' : 'text-slate-200'}`}>{r.name}</p>
                        <p className={`text-[10px] uppercase font-bold tracking-tighter opacity-60 ${selectedReciter === r.id ? 'text-brand-depth/70' : 'text-slate-500'}`}>{r.sub}</p>
                      </div>
                      {selectedReciter === r.id && <Check size={16} className="flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {viewMode === 'surah' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {filteredSurahs.map((surah) => (
            <motion.button
              key={surah.number}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSurah(surah)}
              className="group bg-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/10 transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-3 md:gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-primary font-bold group-hover:bg-brand-primary transition-all group-hover:text-brand-depth shadow-xl shadow-black/20 text-sm md:text-base">
                  {surah.number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-base md:text-lg group-hover:text-brand-primary transition-colors">{surah.englishName}</h3>
                  <p className="text-[9px] md:text-[10px] text-brand-primary/60 uppercase font-bold tracking-widest">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="arabic-text text-xl md:text-2xl font-bold text-brand-primary group-hover:text-brand-primary transition-all">{surah.name}</p>
              </div>
            </motion.button>
          ))}
          
          <div className="sm:col-span-2 lg:col-span-3 p-8 md:p-12 border border-brand-primary/20 bg-brand-primary/5 rounded-[2rem] md:rounded-[3rem] flex flex-col items-center justify-center text-center">
             <BookOpen size={48} className="mb-6 opacity-20 text-brand-primary" />
             <p className="text-brand-primary font-bold tracking-widest uppercase text-xs md:text-sm mb-2">Infinite Wisdom</p>
             <p className="text-slate-500 max-w-sm italic text-xs md:text-sm px-4">"Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian." (15:9)</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {JUZ_LIST.map((juz) => (
            <motion.button
              key={juz.index}
              whileHover={{ y: -8 }}
              className="bg-white/5 p-8 rounded-[2rem] border border-white/5 hover:border-brand-primary/30 text-center space-y-4 hover:bg-brand-primary/10 transition-all"
            >
              <div className="text-4xl font-black text-brand-primary opacity-20">#{juz.index}</div>
              <h3 className="font-bold tracking-tight text-slate-300">Juz {juz.index}</h3>
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto text-brand-primary">
                <ArrowRight size={16} />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
