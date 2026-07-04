import { useState, useEffect, useRef } from 'react';
import { RECITERS, TRANSLATIONS, SURAH_LIST } from '../constants.ts';
import { Ayah } from '../types.ts';
import { 
  ChevronLeft, 
  Play, 
  Bookmark, 
  Info, 
  Loader2,
  Volume2,
  Settings,
  X,
  Check,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  BookOpen,
  WifiOff,
  Languages,
  ArrowRight,
  Download
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { offlineService } from '../services/offlineService';
import { notificationService } from '../services/notificationService';

interface JuzDetailProps {
  juzIndex: number;
  onBack: () => void;
  bookmarks: Ayah[];
  onToggleBookmark: (ayah: Ayah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  addHasanat: (amount: number) => void;
  incrementVerse: () => void;
  language: string;
}

export default function JuzDetail({ 
  juzIndex, 
  onBack, 
  bookmarks, 
  onToggleBookmark,
  selectedReciter,
  onReciterChange,
  addHasanat,
  incrementVerse,
  language
}: JuzDetailProps) {
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTafsir, setShowTafsir] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showReciters, setShowReciters] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  
  const getTranslationForLang = (lang: string) => {
    switch(lang) {
      case 'tr': return 'tr.ozturk';
      case 'id': return 'id.indonesian';
      case 'fr': return 'fr.hamidullah';
      case 'ur': return 'ur.maududi';
      default: return 'en.sahih';
    }
  };

  const [selectedTranslation, setSelectedTranslation] = useState(() => getTranslationForLang(language));

  useEffect(() => {
    setSelectedTranslation(getTranslationForLang(language));
  }, [language]);
  const [readAyahs, setReadAyahs] = useState<Set<number>>(new Set());
  const [isAudioLoading, setIsAudioLoading] = useState<number | null>(null);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const [downloadingAyah, setDownloadingAyah] = useState<number | null>(null);
  const [downloadingAyahProgress, setDownloadingAyahProgress] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const handleRead = (num: number) => {
    if (!readAyahs.has(num)) {
      incrementVerse();
      setReadAyahs(prev => new Set(prev).add(num));
    }
  };

  const isBookmarked = (ayahNumber: number) => bookmarks.some(b => b.number === ayahNumber);

  useEffect(() => {
    if (juzIndex) {
      localStorage.setItem('last-read-quran', JSON.stringify({
        type: 'juz',
        index: juzIndex,
        title: `Juz ${juzIndex}`,
        timestamp: Date.now()
      }));
    }
  }, [juzIndex]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      
      const reciter = RECITERS.find(r => r.id === selectedReciter);
      const isOfflineMode = localStorage.getItem('offline-mode') === 'true';

      try {
        // Fetch Juz content
        const resArabic = await fetch(`/api/proxy/alquran/juz/${juzIndex}/${reciter?.slug || 'ar.alafasy'}`, { signal: controller.signal });
        const dataArabic = await resArabic.json();
        
        const resTrans = await fetch(`/api/proxy/alquran/juz/${juzIndex}/${selectedTranslation}`, { signal: controller.signal });
        const dataTrans = await resTrans.json();

        if (dataArabic.data && dataTrans.data) {
          const combined = await Promise.all(dataArabic.data.ayahs.map(async (a: any, idx: number) => {
            const surahInfo = SURAH_LIST.find(s => s.number === a.surah.number);
            
            // Check cache for this specific ayah
            const cachedAyahsForSurah = await offlineService.getAyahs(a.surah.number, selectedReciter);
            const cached = cachedAyahsForSurah?.find(ca => ca.number === a.number);

            return {
              ...a,
              surahName: surahInfo?.englishName || a.surah.englishName,
              translation: dataTrans.data.ayahs[idx].text,
              audioBlob: cached?.audio === a.audio ? cached.audioBlob : undefined
            };
          }));
          setAyahs(combined);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          // Ignore expected cleanup abort
          return;
        }
        console.error("Failed to fetch juz data", err);
        // Fallback: If offline, we'd need to reconstruct the Juz from cached surahs
        // This is complex, but for now we've added basic blob persistence
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [juzIndex, selectedReciter, selectedTranslation]);

  const togglePlay = (ayah: any) => {
    if (playingAyah === ayah.number) {
      audioRef.current?.pause();
      setPlayingAyah(null);
    } else {
      playAyah(ayah);
    }
  };

  const playAyah = async (ayah: any) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audioUrl = ayah.audio;
    if (!audioUrl) {
      console.warn(`No audio URL found for juz ayah ${ayah.number}. Skipping.`);
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
      return;
    }
    
    setIsAudioLoading(ayah.number);
    setBufferingProgress(0);
    
    try {
      let localUrl;
      if (ayah.audioBlob) {
        localUrl = URL.createObjectURL(ayah.audioBlob);
      } else {
        localUrl = audioUrl;
      }

      const audio = new Audio(localUrl);
      audioRef.current = audio;

      audio.onprogress = () => {
        if (audio.buffered.length > 0) {
          const duration = audio.duration || 1;
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          setBufferingProgress(Math.min(100, Math.round((bufferedEnd / duration) * 100)));
        }
      };
      
      audio.oncanplaythrough = () => {
        setIsAudioLoading(null);
        setBufferingProgress(100);
        audio.play();
        setPlayingAyah(ayah.number);
      };

      audio.onended = () => {
        handleRead(ayah.number);
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

      audio.onerror = () => {
        setPlayingAyah(null);
        setIsAudioLoading(null);
      };
    } catch (error) {
      console.error("Audio error", error);
      setIsAudioLoading(null);
    }
  };

  const downloadJuzAudio = async () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    setDownloadProgress(0);

    try {
      const updatedAyahs = [...ayahs];
      for (let i = 0; i < updatedAyahs.length; i++) {
        const ayah = updatedAyahs[i];
        if (ayah.audio && !ayah.audioBlob) {
          try {
            const res = await fetch(ayah.audio, { mode: 'cors' });
            if (!res.ok) throw new Error("Audio download failed");
            const blob = await res.blob();
            updatedAyahs[i] = { ...ayah, audioBlob: blob };
          } catch (e) {
            console.warn(`Failed to cache ayah ${ayah.number}`, e);
          }
        }
        setDownloadProgress(Math.round(((i + 1) / updatedAyahs.length) * 100));
      }
      setAyahs(updatedAyahs);
      
      // Group by surah to save in offlineService
      const surahsToUpdate = Array.from(new Set(updatedAyahs.map(a => a.surah.number)));
      for (const surahNum of surahsToUpdate) {
        const surahAyahs = updatedAyahs.filter(a => a.surah.number === surahNum);
        await offlineService.mergeAyahs(surahNum, surahAyahs, selectedReciter);
      }
      
      localStorage.setItem('offline-mode', 'true');
      notificationService.notify('Juz Downloaded', `Juz ${juzIndex} is now available offline.`, 'system');
    } catch (error) {
      console.error("Juz download failed", error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const downloadSingleAyah = async (ayah: any) => {
    if (downloadingAyah || ayah.audioBlob) return;
    setDownloadingAyah(ayah.number);
    setDownloadingAyahProgress(0);

    try {
      const res = await fetch(ayah.audio, { mode: 'cors' });
      if (!res.ok) throw new Error("Fetch failed");
      
      const contentLength = res.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total > 0) setDownloadingAyahProgress(Math.round((loaded / total) * 100));
        }
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      setAyahs(prev => prev.map(a => a.number === ayah.number ? { ...a, audioBlob: blob } : a));
    } catch (error) {
      console.error("Individual ayah download failed", error);
    } finally {
      setDownloadingAyah(null);
      setDownloadingAyahProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 size={48} className="animate-spin text-brand-primary mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Assembling Juz {juzIndex}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      {/* Juz Header */}
      <div className="bg-brand-sidebar/95 backdrop-blur-xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-brand-border flex items-center justify-between sticky top-2 md:top-4 z-40 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={onBack} className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-primary hover:bg-brand-primary/20 transition-all shadow-inner">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight">Juz {juzIndex}</h2>
            <div className="flex items-center gap-2">
               <span className="text-[8px] md:text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em]">{ayahs.length} Ayahs</span>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <button 
                 onClick={downloadJuzAudio}
                 disabled={isDownloadingAll}
                 className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isDownloadingAll ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}`}
               >
                 {isDownloadingAll ? (
                   <><Loader2 size={10} className="animate-spin" /> {downloadProgress}%</>
                 ) : (
                   <><Download size={10} /> Download Juz</>
                 )}
               </button>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <button onClick={() => setShowReciters(!showReciters)} className="text-[8px] md:text-[10px] text-slate-400 hover:text-brand-primary font-bold uppercase tracking-widest flex items-center gap-1">
                 <Volume2 size={10} /> {RECITERS.find(r => r.id === selectedReciter)?.name.split(' ').pop()}
               </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReciters && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-panel p-4 rounded-3xl mt-4">
            {RECITERS.map(r => (
              <button key={r.id} onClick={() => { onReciterChange(r.id); setShowReciters(false); }} className={`w-full text-left p-3 rounded-xl ${selectedReciter === r.id ? 'bg-brand-primary/20 text-brand-primary' : ''}`}>
                <p className="text-xs font-bold">{r.name}</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verses */}
      <div className="space-y-8">
        {ayahs.map((ayah, idx) => {
          const isNewSurah = idx === 0 || ayahs[idx-1].surah.number !== ayah.surah.number;
          return (
            <div key={ayah.number}>
              {isNewSurah && (
                <div className="py-8 border-b border-white/5 mb-8">
                  <h3 className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px]">Surah {ayah.surahName}</h3>
                </div>
              )}
              <motion.div 
                onClick={() => handleRead(ayah.number)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${playingAyah === ayah.number ? 'bg-brand-primary/10 border-brand-primary/30' : 'border-transparent hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-8 h-8 rounded-full border border-brand-primary/30 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                    {ayah.numberInSurah}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => togglePlay(ayah)} className="p-2 text-slate-500 hover:text-brand-primary">
                      {isAudioLoading === ayah.number ? <Loader2 size={16} className="animate-spin" /> : playingAyah === ayah.number ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => downloadSingleAyah(ayah)} 
                      className={`p-2 ${ayah.audioBlob ? 'text-emerald-500' : downloadingAyah === ayah.number ? 'text-brand-primary animate-pulse' : 'text-slate-500 hover:text-brand-primary'}`}
                    >
                      {downloadingAyah === ayah.number ? <span className="text-[8px]">{downloadingAyahProgress}%</span> : ayah.audioBlob ? <Check size={16} /> : <Download size={16} />}
                    </button>
                    <button onClick={() => onToggleBookmark(ayah)} className={`p-2 ${isBookmarked(ayah.number) ? 'text-brand-primary' : 'text-slate-500'}`}>
                      <Bookmark size={16} fill={isBookmarked(ayah.number) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>
                <p className="arabic-text text-3xl text-right mb-4 leading-relaxed">{ayah.text}</p>
                <p className="text-slate-400 italic font-light text-sm">"{ayah.translation}"</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
