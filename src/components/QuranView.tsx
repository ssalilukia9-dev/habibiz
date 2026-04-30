import { useState } from 'react';
import { motion } from 'motion/react';
import { SURAH_LIST, JUZ_LIST } from '../constants.ts';
import { Surah, Ayah } from '../types.ts';
import { BookOpen, Hash, ArrowRight } from 'lucide-react';
import SurahDetail from './SurahDetail.tsx';

interface QuranViewProps {
  selectedSurah: Surah | null;
  onSelectSurah: (surah: Surah | null) => void;
  searchQuery: string;
  bookmarks: Ayah[];
  onToggleBookmark: (ayah: Ayah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
}

export default function QuranView({ 
  selectedSurah, 
  onSelectSurah, 
  searchQuery, 
  bookmarks, 
  onToggleBookmark,
  selectedReciter,
  onReciterChange
}: QuranViewProps) {
  const [viewMode, setViewMode] = useState<'surah' | 'juz'>('surah');

  if (selectedSurah) {
    return (
      <SurahDetail 
        surah={selectedSurah} 
        onBack={() => onSelectSurah(null)} 
        bookmarks={bookmarks} 
        onToggleBookmark={onToggleBookmark}
        selectedReciter={selectedReciter}
        onReciterChange={onReciterChange}
      />
    );
  }

  const filteredSurahs = SURAH_LIST.filter(s => 
    s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery) ||
    s.number.toString() === searchQuery
  );

  return (
    <div className="space-y-12">
      {/* View Toggle */}
      <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/5">
        <button 
          onClick={() => setViewMode('surah')}
          className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            viewMode === 'surah' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/20 shadow-lg shadow-brand-primary/10' : 'text-slate-500 hover:text-brand-primary'
          }`}
        >
          By Surah
        </button>
        <button 
          onClick={() => setViewMode('juz')}
          className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            viewMode === 'juz' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/20 shadow-lg shadow-brand-primary/10' : 'text-slate-500 hover:text-brand-primary'
          }`}
        >
          By Juz
        </button>
      </div>

      {viewMode === 'surah' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSurahs.map((surah) => (
            <motion.button
              key={surah.number}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSurah(surah)}
              className="group bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-brand-primary/30 hover:bg-brand-primary/10 transition-all text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand-primary font-bold group-hover:bg-brand-primary transition-all group-hover:text-brand-depth shadow-xl shadow-black/20">
                  {surah.number}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-lg group-hover:text-brand-primary transition-colors">{surah.englishName}</h3>
                  <p className="text-[10px] text-brand-primary/60 uppercase font-bold tracking-widest">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="arabic-text text-2xl font-bold text-brand-primary group-hover:text-brand-primary transition-all">{surah.name}</p>
              </div>
            </motion.button>
          ))}
          
          <div className="sm:col-span-2 lg:col-span-3 p-12 border border-brand-primary/20 bg-brand-primary/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
             <BookOpen size={64} className="mb-6 opacity-20 text-brand-primary" />
             <p className="text-brand-primary font-bold tracking-widest uppercase text-sm mb-2">Infinite Wisdom</p>
             <p className="text-slate-500 max-w-sm italic">"Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian." (15:9)</p>
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
