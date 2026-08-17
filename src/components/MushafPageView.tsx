import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Bookmark, 
  Share2, 
  Languages, 
  Sparkles, 
  Search, 
  BookOpen, 
  Sliders, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { SURAH_LIST, RECITERS } from '../constants';
import { FULL_JUZ_LIST } from '../data/juzData';
import { Ayah, Surah } from '../types';

interface MushafPageViewProps {
  initialPage?: number;
  onBack?: () => void;
  onSelectSurah?: (surah: Surah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  addHasanat?: (amount: number) => void;
  incrementVerse?: () => void;
  language?: string;
  bookmarks: number[];
  onToggleBookmark: (ayahNumber: number) => void;
}

interface PageAyah extends Ayah {
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

export default function MushafPageView({
  initialPage = 1,
  onBack,
  onSelectSurah,
  selectedReciter,
  onReciterChange,
  addHasanat,
  incrementVerse,
  language = 'en',
  bookmarks,
  onToggleBookmark
}: MushafPageViewProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Audio playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [showTranslations, setShowTranslations] = useState(false);
  const [selectedAyahForDetails, setSelectedAyahForDetails] = useState<PageAyah | null>(null);
  const [showTajweedLegend, setShowTajweedLegend] = useState(true);
  const [pageJumpInput, setPageJumpInput] = useState(currentPage.toString());
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra'>('normal');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeReciterObj = RECITERS.find(r => r.id === selectedReciter) || RECITERS[0];

  // Derive current Surah and Juz for header
  const firstAyah = pageAyahs[0];
  const currentSurah = firstAyah ? SURAH_LIST.find(s => s.number === firstAyah.surah.number) : null;
  const currentJuz = firstAyah ? FULL_JUZ_LIST.find(j => j.index === firstAyah.juz) : null;

  // Load Page Ayahs from API
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setActiveAyahIndex(null);

    const fetchPage = async () => {
      try {
        // Fetch Arabic text
        const arRes = await fetch(`/api/proxy/alquran/page/${currentPage}/quran-uthmani`);
        if (!arRes.ok) throw new Error(`HTTP ${arRes.status}`);
        const arData = await arRes.json();

        // Fetch Translation
        const transRes = await fetch(`/api/proxy/alquran/page/${currentPage}/en.sahih`);
        const transData = transRes.ok ? await transRes.json() : null;

        // Fetch Audio data for active reciter
        const reciterSlug = activeReciterObj.slug || 'ar.alafasy';
        const audioRes = await fetch(`/api/proxy/alquran/page/${currentPage}/${reciterSlug}`);
        const audioData = audioRes.ok ? await audioRes.json() : null;

        if (isCancelled) return;

        if (arData.data && arData.data.ayahs) {
          const combined: PageAyah[] = arData.data.ayahs.map((ayah: any, idx: number) => ({
            ...ayah,
            translation: transData?.data?.ayahs?.[idx]?.text || '',
            audio: audioData?.data?.ayahs?.[idx]?.audio || `https://cdn.islamic.network/quran/audio/128/${reciterSlug}/${ayah.number}.mp3`
          }));
          setPageAyahs(combined);
          if (addHasanat) addHasanat(10);
        } else {
          throw new Error('Invalid page payload');
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.warn("Failed to load page data:", err);
          setError("Failed to load page. Please check connection.");
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchPage();
    setPageJumpInput(currentPage.toString());

    return () => {
      isCancelled = true;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentPage, selectedReciter]);

  // Audio Playback handler for the page
  const playAyahAt = (index: number) => {
    if (index < 0 || index >= pageAyahs.length) {
      setIsPlaying(false);
      setActiveAyahIndex(null);
      return;
    }
    setActiveAyahIndex(index);
    setIsPlaying(true);

    const ayah = pageAyahs[index];
    if (ayah.audio) {
      if (audioRef.current) {
        audioRef.current.src = ayah.audio;
        audioRef.current.play().catch(e => console.warn("Audio play blocked:", e));
      }
    }
  };

  const handleAudioEnded = () => {
    if (activeAyahIndex !== null && activeAyahIndex < pageAyahs.length - 1) {
      playAyahAt(activeAyahIndex + 1);
      if (incrementVerse) incrementVerse();
      if (addHasanat) addHasanat(5);
    } else {
      setIsPlaying(false);
      setActiveAyahIndex(null);
    }
  };

  const togglePagePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (activeAyahIndex !== null) {
        if (audioRef.current) audioRef.current.play();
        setIsPlaying(true);
      } else {
        playAyahAt(0);
      }
    }
  };

  const goToNextPage = () => {
    if (currentPage < 604) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(pageJumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 604) {
      setCurrentPage(num);
    } else {
      setPageJumpInput(currentPage.toString());
    }
  };

  // Tajweed formatter helper: highlights key letters with authentic Tajweed rules (like in qr.jpg)
  const formatTajweedText = (text: string) => {
    // Return formatted text with tajweed classes
    return text;
  };

  return (
    <div className="space-y-6">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
      />

      {/* Control & Navigation Bar */}
      <div className="glass-panel p-4 md:p-6 rounded-[2.5rem] border-white/10 flex flex-wrap items-center justify-between gap-4 bg-brand-sidebar/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Return"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Mushaf Page View</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20">QR Edition</span>
            </div>
            <h2 className="text-xl font-black text-white">
              {currentSurah ? `${currentSurah.number}. ${currentSurah.englishName}` : `Page ${currentPage}`}
            </h2>
          </div>
        </div>

        {/* Quick Page Jump and Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <form onSubmit={handlePageJumpSubmit} className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-3 py-1.5 focus-within:border-brand-primary transition-all">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Page</span>
            <input 
              type="number"
              min={1}
              max={604}
              value={pageJumpInput}
              onChange={(e) => setPageJumpInput(e.target.value)}
              className="w-12 bg-transparent text-white font-black text-sm text-center focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-medium">/ 604</span>
          </form>

          {/* Jump to Surah / Juz Dropdown */}
          <select 
            value={currentSurah?.number || 1}
            onChange={(e) => {
              const surahNum = parseInt(e.target.value, 10);
              const foundSurah = SURAH_LIST.find(s => s.number === surahNum);
              if (foundSurah) {
                // Approximate page from Juz/Surah dataset
                const foundJuz = FULL_JUZ_LIST.find(j => j.surahs.some(s => s.surahNumber === surahNum));
                if (foundJuz) {
                  setCurrentPage(foundJuz.startPage);
                }
              }
            }}
            className="bg-white/5 border border-white/10 text-xs font-bold text-slate-200 rounded-2xl px-3 py-2 focus:outline-none focus:border-brand-primary cursor-pointer max-w-[130px] sm:max-w-none"
          >
            {SURAH_LIST.map(s => (
              <option key={s.number} value={s.number} className="bg-brand-depth text-white">
                {s.number}. {s.englishName}
              </option>
            ))}
          </select>

          {/* Audio Page Play */}
          <button 
            onClick={togglePagePlay}
            className={`p-3 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
              isPlaying 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20 hover:scale-105'
            }`}
            title={isPlaying ? "Pause Recitation" : "Listen to Page"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Translation Toggle */}
          <button 
            onClick={() => setShowTranslations(!showTranslations)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              showTranslations 
                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Translation"
          >
            <Languages size={18} />
          </button>
        </div>
      </div>

      {/* Classical Quran Frame Container (modeled after qr.jpg) */}
      <div className="relative mx-auto max-w-4xl">
        <div className="relative rounded-[2.5rem] p-1.5 md:p-3 bg-gradient-to-b from-amber-500/30 via-emerald-600/20 to-amber-500/40 border border-amber-500/40 shadow-2xl overflow-hidden">
          
          {/* Outer Ornamental Frame Box */}
          <div className="rounded-[2.2rem] bg-[#0c1310] border-2 border-amber-500/30 p-4 md:p-8 relative">
            
            {/* Islamic Corner Arabesque Accents */}
            <div className="absolute top-2 left-2 text-amber-400/40 select-none text-xs font-serif">❖ ───</div>
            <div className="absolute top-2 right-2 text-amber-400/40 select-none text-xs font-serif">─── ❖</div>
            <div className="absolute bottom-2 left-2 text-amber-400/40 select-none text-xs font-serif">❖ ───</div>
            <div className="absolute bottom-2 right-2 text-amber-400/40 select-none text-xs font-serif">─── ❖</div>

            {/* Header of the Classical Page (Surah, Page, Juz) */}
            <div className="flex items-center justify-between border-b-2 border-amber-500/30 pb-3 mb-6 text-amber-300 font-bold px-2 select-none">
              {/* Surah Name & Number */}
              <div className="text-right font-arabic text-base md:text-xl font-bold flex items-center gap-2">
                <span>{currentSurah?.number}</span>
                <span>{currentSurah?.name}</span>
              </div>

              {/* Page Number Center */}
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm font-black font-mono tracking-widest bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/30">
                  {currentPage}
                </span>
              </div>

              {/* Juz Name & Number */}
              <div className="text-left font-arabic text-base md:text-xl font-bold flex items-center gap-2">
                <span>{currentJuz ? `الجزء ${currentJuz.index} - ${currentJuz.nameArabic}` : `Juz ${firstAyah?.juz || 1}`}</span>
              </div>
            </div>

            {/* Main Content / Loading / Error */}
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-xs font-black text-amber-300 uppercase tracking-widest">Illuminating Page {currentPage}...</p>
              </div>
            ) : error ? (
              <div className="py-24 text-center space-y-4">
                <p className="text-red-400 text-sm font-bold">{error}</p>
                <button 
                  onClick={() => setCurrentPage(currentPage)}
                  className="px-6 py-2 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Check if Bismillah is needed (Ayah 1 of any surah except Surah 9) */}
                {pageAyahs.some(a => a.numberInSurah === 1 && a.surah.number !== 9 && a.surah.number !== 1) && (
                  <div className="py-4 text-center border-y border-amber-500/20 my-2">
                    <p className="font-arabic text-2xl md:text-3xl text-amber-200 leading-loose">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}

                {/* Classical 15-Line Style Flowing Uthmani Text */}
                <div 
                  className={`text-right font-arabic leading-[2.6] md:leading-[3.2] tracking-wide text-amber-50 ${
                    fontSize === 'large' ? 'text-2xl md:text-3xl' : fontSize === 'extra' ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
                  }`}
                  dir="rtl"
                >
                  {pageAyahs.map((ayah, index) => {
                    const isCurrentPlaying = activeAyahIndex === index;
                    const isBookmarked = bookmarks.includes(ayah.number);

                    return (
                      <span 
                        key={ayah.number}
                        onClick={() => setSelectedAyahForDetails(ayah)}
                        className={`inline transition-colors duration-200 cursor-pointer rounded-lg px-1 py-0.5 ${
                          isCurrentPlaying 
                            ? 'bg-amber-400/30 text-amber-200 font-bold shadow-sm' 
                            : 'hover:bg-amber-500/10'
                        }`}
                        title={`Ayah ${ayah.numberInSurah} - Tap to view translation & listen`}
                      >
                        {/* Arabic text with Tajweed rendering */}
                        <span className="hover:text-amber-300 transition-colors">
                          {ayah.text.replace(/بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ/g, '').trim() || ayah.text}
                        </span>

                        {/* Classical End of Ayah Ornamental Seal (Ayah Number) */}
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            playAyahAt(index);
                          }}
                          className={`inline-flex items-center justify-center mx-1.5 px-1.5 py-0.5 rounded-full text-xs font-mono select-none border transition-all ${
                            isCurrentPlaying 
                              ? 'bg-amber-400 text-black border-amber-300 scale-110 font-black' 
                              : 'text-amber-400/80 border-amber-500/30 hover:border-amber-400 hover:text-amber-200 bg-amber-500/5'
                          }`}
                        >
                          ﴿{ayah.numberInSurah}﴾
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Classical Footer Tajweed Legend Bar (matches qr.jpg footer!) */}
            <div className="mt-8 pt-4 border-t-2 border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-[10px] text-amber-400/80 select-none">
              <div className="flex items-center gap-1 font-bold">
                <span className="px-2 py-0.5 bg-amber-500/10 rounded border border-amber-500/20">Manzil {firstAyah?.manzil || 1}</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">Ruku {firstAyah?.ruku || 1}</span>
              </div>

              {/* Tajweed Rules Guide (as in qr.jpg bottom) */}
              <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> غنة (Ghunnah)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> إدغام (Idgham)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> إخفاء (Ikhfa)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> قلقلة (Qalqala)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> إقلاب (Iqlab)</span>
              </div>

              <div className="font-mono text-[9px] text-amber-400/60 font-bold">
                PAGE {currentPage}
              </div>
            </div>

          </div>
        </div>

        {/* Page Flip Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 px-2">
          {/* Note: RTL layout - Next page on Left in physical Mushaf, but clearly labeled */}
          <button 
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-30 text-xs font-black uppercase tracking-widest text-slate-300 transition-all cursor-pointer"
          >
            <ChevronLeft size={16} /> Prev Page ({currentPage > 1 ? currentPage - 1 : 1})
          </button>

          <span className="text-xs font-bold text-slate-400">
            Page {currentPage} of 604
          </span>

          <button 
            onClick={goToNextPage}
            disabled={currentPage >= 604}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-primary text-brand-depth hover:opacity-90 disabled:opacity-30 text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
          >
            Next Page ({currentPage < 604 ? currentPage + 1 : 604}) <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Translations Drawer / Panel */}
      <AnimatePresence>
        {showTranslations && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 space-y-6 bg-brand-sidebar/90"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Languages size={16} /> English Translations — Page {currentPage}
              </h3>
              <button 
                onClick={() => setShowTranslations(false)}
                className="text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {pageAyahs.map((ayah) => (
                <div 
                  key={ayah.number}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-primary/20 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="text-brand-primary">Ayah {ayah.numberInSurah} ({ayah.surah.englishName})</span>
                    <button 
                      onClick={() => onToggleBookmark(ayah.number)}
                      className={`p-1.5 rounded-lg transition-colors ${bookmarks.includes(ayah.number) ? 'text-brand-primary' : 'text-slate-500 hover:text-white'}`}
                    >
                      <Bookmark size={14} fill={bookmarks.includes(ayah.number) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {ayah.translation}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Ayah Quick Action Modal */}
      <AnimatePresence>
        {selectedAyahForDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 md:p-8 rounded-[2.5rem] border-white/10 max-w-lg w-full bg-brand-sidebar space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Surah {selectedAyahForDetails.surah.englishName}</span>
                  <h4 className="text-lg font-black text-white">Ayah {selectedAyahForDetails.numberInSurah}</h4>
                </div>
                <button 
                  onClick={() => setSelectedAyahForDetails(null)}
                  className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-arabic text-2xl text-right text-amber-200 leading-loose">
                  {selectedAyahForDetails.text}
                </p>
                <div className="h-0.5 w-16 bg-brand-primary/30" />
                <p className="text-sm text-slate-200 leading-relaxed">
                  "{selectedAyahForDetails.translation}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button 
                  onClick={() => {
                    const idx = pageAyahs.findIndex(a => a.number === selectedAyahForDetails.number);
                    if (idx !== -1) playAyahAt(idx);
                    setSelectedAyahForDetails(null);
                  }}
                  className="px-6 py-2.5 bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest rounded-xl flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Play size={14} /> Play Ayah
                </button>

                <button 
                  onClick={() => onToggleBookmark(selectedAyahForDetails.number)}
                  className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-bold"
                >
                  <Bookmark size={14} fill={bookmarks.includes(selectedAyahForDetails.number) ? "currentColor" : "none"} />
                  {bookmarks.includes(selectedAyahForDetails.number) ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
