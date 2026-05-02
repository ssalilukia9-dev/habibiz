import { useState, useEffect, useRef } from 'react';
import { SURAH_LIST, RECITERS } from '../constants.ts';
import { Surah, Ayah } from '../types.ts';
import { 
  ChevronLeft, 
  Share2, 
  Play, 
  Bookmark, 
  Info, 
  Loader2,
  Volume2,
  Settings,
  X,
  Check,
  Pause,
  BookOpen
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import quranSample from '../data/quran_sample.json';

interface SurahDetailProps {
  surah: Surah;
  onBack: () => void;
  bookmarks: Ayah[];
  onToggleBookmark: (ayah: Ayah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  addHasanat: (amount: number) => void;
  incrementVerse: () => void;
}

export default function SurahDetail({ 
  surah, 
  onBack, 
  bookmarks, 
  onToggleBookmark,
  selectedReciter,
  onReciterChange,
  addHasanat,
  incrementVerse
}: SurahDetailProps) {
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTafsir, setShowTafsir] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showReciters, setShowReciters] = useState(false);
  const [readAyahs, setReadAyahs] = useState<Set<number>>(new Set());
  const [isAudioLoading, setIsAudioLoading] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleRead = (num: number) => {
    if (!readAyahs.has(num)) {
      incrementVerse();
      setReadAyahs(prev => new Set(prev).add(num));
    }
  };

  const isBookmarked = (ayahNumber: number) => bookmarks.some(b => b.number === ayahNumber);

  useEffect(() => {
    if (playingAyah) {
      const activeElement = document.getElementById(`ayah-${playingAyah}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [playingAyah]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const reciter = RECITERS.find(r => r.id === selectedReciter);
      
      try {
        // Fetch Arabic text + Audio
        const resArabic = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/${reciter?.slug || 'ar.alafasy'}`);
        const dataArabic = await resArabic.json();
        
        // Fetch English translation
        const resTrans = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/en.sahih`);
        const dataTrans = await resTrans.json();

        if (dataArabic.data && dataTrans.data) {
          const combined = dataArabic.data.ayahs.map((a: any, idx: number) => ({
            ...a,
            translation: dataTrans.data.ayahs[idx].text
          }));
          setAyahs(combined);
        }
      } catch (err) {
        console.error("Failed to fetch surah data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [surah.number, selectedReciter]);

  const togglePlay = (ayah: any) => {
    if (playingAyah === ayah.number) {
      audioRef.current?.pause();
      setPlayingAyah(null);
    } else {
      playAyah(ayah);
    }
  };

  const playAyah = (ayah: any) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Use the official audio URL from the API response
    const audioUrl = ayah.audio;
    
    if (!audioUrl) {
      console.error("No audio URL found for this ayah");
      return;
    }
    
    setIsAudioLoading(ayah.number);
    audioRef.current = new Audio(audioUrl);
    
    audioRef.current.oncanplaythrough = () => {
      setIsAudioLoading(null);
      audioRef.current?.play();
      setPlayingAyah(ayah.number);
    };

    audioRef.current.onended = () => {
      if (autoPlay) {
        const currentIndex = ayahs.findIndex(a => a.number === ayah.number);
        if (currentIndex < ayahs.length - 1) {
          playAyah(ayahs[currentIndex + 1]);
        } else {
          setPlayingAyah(null);
        }
      } else {
        setPlayingAyah(null);
      }
    };

    audioRef.current.onerror = () => {
      console.error("Audio failed to load from:", audioUrl);
      setPlayingAyah(null);
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-12 pb-32 animate-pulse">
        {/* Skeleton Header */}
        <div className="bg-brand-sidebar/95 backdrop-blur-xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border flex items-center justify-between sticky top-4 z-40">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl" />
            <div className="space-y-2">
              <div className="w-32 h-6 bg-white/5 rounded-lg" />
              <div className="w-24 h-3 bg-white/5 rounded-lg" />
            </div>
          </div>
          <div className="w-24 h-10 bg-white/5 rounded-xl hidden sm:block" />
        </div>

        {/* Skeleton Bismillah */}
        <div className="flex flex-col items-center py-10 md:py-16 gap-6">
          <div className="w-48 h-4 bg-white/5 rounded-full" />
          <div className="w-64 h-12 bg-white/5 rounded-2xl" />
        </div>

        {/* Skeleton Verses */}
        <div className="space-y-24">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="h-[1px] flex-1 bg-white/5" />
                <div className="flex gap-2">
                   {[1,2,3].map(j => <div key={j} className="w-8 h-8 rounded-full bg-white/5" />)}
                </div>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-3/4 h-16 bg-white/5 rounded-[2rem]" />
                <div className="w-1/2 h-4 bg-white/5 rounded-full mt-8" />
                <div className="w-1/3 h-4 bg-white/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      {/* Surah Header */}
      <div className="bg-brand-sidebar/95 backdrop-blur-xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border flex items-center justify-between sticky top-2 md:top-4 z-40 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-primary hover:bg-brand-primary/20 transition-all shadow-inner">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight">{surah.englishName}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[8px] md:text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em]">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</span>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <button 
                 onClick={() => setShowReciters(!showReciters)}
                 className="text-[8px] md:text-[10px] text-slate-400 hover:text-brand-primary font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
               >
                 <Volume2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> {RECITERS.find(r => r.id === selectedReciter)?.name.split(' ').pop()}
               </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="arabic-text text-3xl md:text-4xl font-bold text-brand-primary leading-tight drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">{surah.name}</p>
          </div>
        </div>

        {/* Reciter Dropdown */}
        <AnimatePresence>
          {showReciters && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-4 right-0 w-72 glass-panel rounded-3xl p-2 border-brand-primary/20 shadow-2xl z-50 backdrop-blur-3xl"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Reciter</p>
                <button onClick={() => setShowReciters(false)}><X size={14} className="text-slate-500" /></button>
              </div>
              <div className="py-2">
                {RECITERS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onReciterChange(r.id);
                      setShowReciters(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedReciter === r.id ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white/5 text-slate-400'}`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold">{r.name}</p>
                      <p className="text-[9px] uppercase tracking-tighter opacity-60">{r.sub}</p>
                    </div>
                    {selectedReciter === r.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bismillah */}
      {surah.number !== 1 && surah.number !== 9 && (
        <div className="flex flex-col items-center py-10 md:py-16 gap-3 md:gap-4">
          <div className="text-brand-primary/40 text-base md:text-xl font-serif italic mb-2 tracking-widest text-center">Bismillahir Rahmanir Raheem</div>
          <p className="arabic-text text-4xl md:text-5xl text-brand-primary/90 tracking-wide drop-shadow-[0_0_20px_rgba(212,175,55,0.2)] text-center px-4">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-12 md:space-y-16">
        {ayahs.map((ayah) => (
          <motion.div 
            key={ayah.number}
            id={`ayah-${ayah.number}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="group relative"
          >
            {/* Verse Number & Actions */}
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
               <div className="w-8 h-8 md:w-10 md:h-10 border border-brand-primary/30 rounded-full flex items-center justify-center text-brand-primary text-[10px] md:text-xs font-bold font-mono">
                  {ayah.numberInSurah}
               </div>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent" />
               <div className="flex items-center gap-1 md:gap-3">
                  <button 
                    onClick={() => togglePlay(ayah)}
                    className={`p-2 transition-all ${playingAyah === ayah.number ? 'text-brand-primary scale-110' : 'text-slate-500 hover:text-brand-primary'}`}
                  >
                    {isAudioLoading === ayah.number ? (
                      <Loader2 size={16} className="animate-spin text-brand-primary" />
                    ) : playingAyah === ayah.number ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                  <button 
                    onClick={() => onToggleBookmark(ayah)}
                    className={`p-2 transition-colors ${isBookmarked(ayah.number) ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'}`}
                  >
                    <Bookmark size={16} fill={isBookmarked(ayah.number) ? "currentColor" : "none"} />
                  </button>
                  <button className="text-slate-500 hover:text-brand-primary p-2 transition-colors hidden xs:block"><Share2 size={16} /></button>
                  <button 
                    onClick={() => setShowTafsir(showTafsir === ayah.number ? null : ayah.number)}
                    className={`p-2 transition-colors ${showTafsir === ayah.number ? 'text-brand-primary bg-brand-primary/10 rounded-full' : 'text-slate-500 hover:text-brand-primary'}`}
                  >
                    <Info size={16} />
                  </button>
               </div>
            </div>

            {/* Arabic Text Display */}
            <div 
              className="mb-8 md:mb-10 text-center cursor-pointer select-none"
              onClick={() => handleRead(ayah.number)}
            >
              <p className={`arabic-text text-3xl sm:text-4xl md:text-6xl leading-[2] md:leading-[1.8] drop-shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all px-2 ${readAyahs.has(ayah.number) ? 'text-brand-primary' : 'text-white hover:text-brand-primary/80'}`}>
                {ayah.text}
              </p>
            </div>

            {/* Translation Display */}
            <div className="max-w-3xl mx-auto text-center px-4">
              <p className="text-lg md:text-2xl font-light text-slate-300 italic tracking-tight leading-relaxed">
                "{ayah.translation || "Loading translation..."}"
              </p>
            </div>

            {/* Tafsir Panel */}
            {showTafsir === ayah.number && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 bg-white/5 border border-white/5 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden group/tafsir shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover/tafsir:opacity-10 text-brand-primary">
                  <BookOpen size={120} />
                </div>
                <h4 className="text-[10px] uppercase font-bold text-brand-primary tracking-[0.2em] mb-4">Deep Insight • Tafsir Extract</h4>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base relative z-10 font-medium">
                  {/* Mock content updated for purple theme */}
                  This realization highlights the depth of the sacred message. In this context, it serves as a divine reassurance for the heart, emphasizing clarity and guidance.
                </p>
                <button className="mt-6 text-brand-primary text-xs font-bold uppercase tracking-widest hover:underline">Read Complete Tafsir →</button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Play Bar */}
      <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-40 bg-brand-sidebar/80 backdrop-blur-2xl border border-brand-primary/20 rounded-full px-6 py-3 md:px-8 md:py-4 shadow-2xl flex items-center gap-4 md:gap-8 min-w-[280px] md:min-w-[320px]">
         <button 
           onClick={() => setAutoPlay(!autoPlay)}
           className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-colors ${autoPlay ? 'text-brand-primary' : 'text-slate-500'} hidden xs:block`}
         >
           Auto: {autoPlay ? 'ON' : 'OFF'}
         </button>
         <button 
           onClick={() => {
             if (playingAyah) {
               audioRef.current?.pause();
               setPlayingAyah(null);
             } else {
               playAyah(ayahs[0]);
             }
           }}
           className="w-10 h-10 md:w-14 md:h-14 bg-brand-primary text-brand-depth rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-brand-primary/20"
         >
           {isAudioLoading ? (
             <Loader2 size={24} className="animate-spin" />
           ) : playingAyah ? (
             <Pause fill="currentColor" size={20} />
           ) : (
             <Play fill="currentColor" size={20} />
           )}
         </button>
         <div className="flex gap-4">
            <button 
              onClick={() => {
                const currentIndex = ayahs.findIndex(a => a.number === playingAyah);
                if (currentIndex > 0) playAyah(ayahs[currentIndex - 1]);
              }}
              className="text-slate-500 hover:text-white transition-colors text-lg"
            >
              ◀
            </button>
            <button 
              onClick={() => {
                const currentIndex = ayahs.findIndex(a => a.number === playingAyah);
                if (currentIndex < ayahs.length - 1) playAyah(ayahs[currentIndex + 1]);
              }}
              className="text-slate-500 hover:text-white transition-colors text-lg"
            >
              ▶
            </button>
         </div>
      </div>

      {/* Sticky Audio Player Floating Bar */}
      <AnimatePresence>
        {playingAyah && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-fit min-w-[300px] glass-panel-purple border-brand-primary/40 p-4 rounded-[2rem] z-50 flex items-center gap-6 shadow-2xl backdrop-blur-2xl"
          >
             <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-depth">
                {isAudioLoading ? <Loader2 size={24} className="animate-spin" /> : <Volume2 size={24} className="animate-pulse" />}
             </div>
             <div className="flex-1">
                <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">{isAudioLoading ? 'Buffering Sanctuary' : 'Now Reciting'}</p>
                <p className="text-xs font-bold text-white truncate max-w-[150px]">
                  Ayah #{playingAyah} • {RECITERS.find(r => r.id === selectedReciter)?.name}
                </p>
             </div>
             <button 
               onClick={() => {
                 audioRef.current?.pause();
                 setPlayingAyah(null);
               }}
               className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-red-400 hover:bg-red-400/10 transition-all"
             >
                <Pause size={20} fill="currentColor" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
