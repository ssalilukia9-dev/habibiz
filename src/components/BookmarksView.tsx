import { motion } from 'motion/react';
import { Bookmark, Search, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Ayah } from '../types.ts';
import { SURAH_LIST } from '../constants.ts';

interface BookmarksViewProps {
  bookmarks: Ayah[];
  onRemoveBookmark: (ayah: Ayah) => void;
  onNavigate: (tab: string, extra?: any) => void;
}

export default function BookmarksView({ bookmarks, onRemoveBookmark, onNavigate }: BookmarksViewProps) {
  const getSurahName = (surahNumber: number) => {
    return SURAH_LIST.find(s => s.number === surahNumber)?.englishName || 'Unknown Surah';
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[70vh]">
        <div className="w-32 h-32 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary/20 mb-8 border border-brand-primary/10 shadow-2xl relative group">
          <Bookmark size={56} className="group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-brand-primary/5 blur-2xl rounded-full"></div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Silent Sanctuary</h3>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-light text-lg">
          Your saved verses and reflections will be gathered here. Begin your exploration of the divine words.
        </p>
        <button 
          onClick={() => onNavigate('quran')}
          className="bg-brand-primary text-brand-depth px-10 py-4 rounded-2xl font-bold shadow-xl shadow-brand-primary/40 hover:bg-brand-secondary transition-all active:scale-95"
        >
          Explore Al-Mushaf
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h2 className="text-4xl font-bold text-white tracking-tight">Curated Wisdom</h2>
        <p className="text-brand-primary font-medium tracking-wide">Your collection of reflections and bookmarks</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {bookmarks.map((bookmark) => (
          <motion.div 
            key={bookmark.number}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:border-brand-primary/30 transition-all relative overflow-hidden group shadow-2xl shadow-black/20"
          >
             <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary border border-brand-primary/20">
                      <Bookmark size={22} fill="currentColor" />
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-200">
                        {getSurahName((bookmark as any).surahNumber)} • Verse {bookmark.numberInSurah}
                      </h4>
                      <p className="text-[10px] text-brand-primary/60 uppercase tracking-[0.2em] font-bold">Ayah #{bookmark.number}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => onNavigate('resources', { resId: 'quran', surahNumber: (bookmark as any).surahNumber })}
                     className="p-3 text-brand-primary hover:bg-brand-primary/10 rounded-full transition-all"
                     title="Read in Context"
                   >
                      <ArrowRight size={20} />
                   </button>
                   <button 
                     onClick={() => onRemoveBookmark(bookmark)}
                     className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-full transition-all"
                     title="Remove Bookmark"
                   >
                      <Trash2 size={20} />
                   </button>
                </div>
             </div>

             <p className="arabic-text text-4xl text-right mb-8 leading-relaxed text-brand-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                {bookmark.text}
             </p>
             <p className="text-slate-400 italic text-lg leading-relaxed font-light">
                "{bookmark.translation}"
             </p>

             <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Added to Sanctuary</p>
                <div className="flex gap-4">
                  {/* Share button or other actions */}
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
