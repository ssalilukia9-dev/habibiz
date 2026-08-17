import { useState, useEffect, useRef } from 'react';
import { SURAH_LIST, RECITERS, TRANSLATIONS } from '../constants.ts';
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
  SkipForward,
  SkipBack,
  Repeat,
  Repeat1,
  BookOpen,
  WifiOff,
  Languages,
  ArrowRight,
  Download
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { offlineService } from '../services/offlineService';
import { notificationService } from '../services/notificationService';
import { getAudioStreamUrl } from '../lib/api';
import VerseShareModal from './VerseShareModal.tsx';
import WaveformVisualizer from './WaveformVisualizer.tsx';

interface SurahDetailProps {
  surah: Surah;
  onBack: () => void;
  bookmarks: Ayah[];
  onToggleBookmark: (ayah: Ayah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  addHasanat: (amount: number) => void;
  incrementVerse: () => void;
  language: string;
}

export default function SurahDetail({ 
  surah, 
  onBack, 
  bookmarks, 
  onToggleBookmark,
  selectedReciter,
  onReciterChange,
  addHasanat,
  incrementVerse,
  language
}: SurahDetailProps) {
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTafsir, setShowTafsir] = useState<number | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showReciters, setShowReciters] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [shareAyah, setShareAyah] = useState<any | null>(null);
  
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
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [hasanatRewarded, setHasanatRewarded] = useState(false);

  useEffect(() => {
    setHasanatRewarded(false);
    setScrollPercentage(0);
  }, [surah.number]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        const pct = Math.min(100, Math.max(0, Math.round((scrolled / maxScroll) * 100)));
        setScrollPercentage(pct);
      } else {
        setScrollPercentage(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ayahs, isLoading]);

  useEffect(() => {
    if (scrollPercentage >= 95 && !hasanatRewarded && ayahs.length > 0 && !isLoading) {
      setHasanatRewarded(true);
      const rewardAmount = 150;
      addHasanat(rewardAmount);
      notificationService.notify(
        'Surah Completed! 🌟',
        `Ma sha Allah! You've completed reading Surah ${surah.englishName}. You earned +${rewardAmount} extra Hasanat!`,
        'hadith'
      );
    }
  }, [scrollPercentage, hasanatRewarded, ayahs, isLoading, surah.englishName, addHasanat]);
  const [isAudioLoading, setIsAudioLoading] = useState<number | null>(null);
  const [bufferingProgress, setBufferingProgress] = useState(0);
  const [downloadingAyah, setDownloadingAyah] = useState<number | null>(null);
  const [downloadingAyahProgress, setDownloadingAyahProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefetchedAyahsRef = useRef<Set<number>>(new Set());
  const ayahsRef = useRef<any[]>(ayahs);
  const preloadedAudioElementsRef = useRef<Map<number, HTMLAudioElement>>(new Map());

  useEffect(() => {
    ayahsRef.current = ayahs;
  }, [ayahs]);

  const prefetchSingleAyah = (nextAyah: any) => {
    if (nextAyah.audioBlob || prefetchedAyahsRef.current.has(nextAyah.number)) return;
    
    prefetchedAyahsRef.current.add(nextAyah.number);
    const streamUrl = getAudioStreamUrl(nextAyah.audio);
    if (!streamUrl) return;

    // Use browser native prefetching without forcing React state re-renders (prevents UI freezing)
    if (!preloadedAudioElementsRef.current.has(nextAyah.number)) {
      try {
        const preloadAudio = new Audio();
        preloadAudio.preload = 'auto';
        preloadAudio.src = streamUrl;
        preloadedAudioElementsRef.current.set(nextAyah.number, preloadAudio);
      } catch (e) {
        // ignore
      }
    }
  };

  const prefetchNextAyahs = (currentAyahNumber: number) => {
    const currentAyahs = ayahsRef.current;
    const currentIndex = currentAyahs.findIndex(a => a.number === currentAyahNumber);
    if (currentIndex === -1) return;

    // Prefetch next 2 verses ahead lightly
    const nextIndices = [currentIndex + 1, currentIndex + 2];
    
    for (const idx of nextIndices) {
      if (idx < currentAyahs.length) {
        const nextAyah = currentAyahs[idx];
        if (nextAyah.audio && !nextAyah.audioBlob && downloadingAyah !== nextAyah.number) {
          prefetchSingleAyah(nextAyah);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      preloadedAudioElementsRef.current.forEach(audio => {
        try {
          audio.pause();
          audio.src = "";
        } catch (e) {}
      });
      preloadedAudioElementsRef.current.clear();
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
    if (playingAyah && autoPlay) {
      const timer = setTimeout(() => {
        const activeElement = document.getElementById(`ayah-${playingAyah}`);
        if (activeElement) {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [playingAyah, autoPlay]);

  useEffect(() => {
    if (surah.number) {
      localStorage.setItem('last-read-quran', JSON.stringify({
        type: 'surah',
        number: surah.number,
        title: surah.englishName,
        timestamp: Date.now()
      }));
    }
  }, [surah]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      
      const reciter = RECITERS.find(r => r.id === selectedReciter);
      const isOfflineMode = localStorage.getItem('offline-mode') === 'true';
      const cachedAyahs = await offlineService.getAyahs(surah.number, selectedReciter);
      
      if (isOfflineMode && cachedAyahs) {
        setAyahs(cachedAyahs);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch Arabic text + Audio
        const resArabic = await fetch(`/api/proxy/alquran/surah/${surah.number}/${reciter?.slug || 'ar.alafasy'}`, { signal: controller.signal });
        const dataArabic = await resArabic.json();
        
        // Fetch English translation
        const resTrans = await fetch(`/api/proxy/alquran/surah/${surah.number}/${selectedTranslation}`, { signal: controller.signal });
        const dataTrans = await resTrans.json();

        if (dataArabic.data && dataTrans.data) {
          const combined = dataArabic.data.ayahs.map((a: any, idx: number) => {
            const cached = cachedAyahs?.find(ca => ca.number === a.number);
            const secureAudio = a.audio ? a.audio.replace(/^http:/, 'https:') : undefined;
            return {
              ...a,
              audio: secureAudio,
              translation: dataTrans.data?.ayahs?.[idx]?.text || "",
              // Persist audio blob if URLs match
              audioBlob: cached?.audio === secureAudio ? cached.audioBlob : undefined
            };
          });
          setAyahs(combined);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          // Igore expected cleanup abort
          return;
        }
        console.error("Failed to fetch surah data", err);
        // Fallback to cache if fetch fails even if not in strict offline mode
        if (cachedAyahs) {
          setAyahs(cachedAyahs);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [surah.number, selectedReciter, selectedTranslation]);

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
      try {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.oncanplaythrough = null;
        audioRef.current.onprogress = null;
      } catch (e) {}
    }
    
    const rawAudioUrl = ayah.audioBlob ? URL.createObjectURL(ayah.audioBlob) : getAudioStreamUrl(ayah.audio);
    const currentAyahs = ayahsRef.current;
    
    if (!rawAudioUrl) {
      console.warn(`No audio URL found for ayah ${ayah.number}. Skipping or stopping.`);
      if (autoPlay) {
        const currentIndex = currentAyahs.findIndex(a => a.number === ayah.number);
        if (currentIndex < currentAyahs.length - 1) {
          playAyah(currentAyahs[currentIndex + 1]);
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
    
    // Lightly prefetch the next verses ahead
    prefetchNextAyahs(ayah.number);
    
    try {
      let audio: HTMLAudioElement;

      // Reuse preloaded audio instance if available for instant playback without buffer lag
      const preloadedAudio = !ayah.audioBlob ? preloadedAudioElementsRef.current.get(ayah.number) : undefined;
      if (preloadedAudio) {
        audio = preloadedAudio;
        preloadedAudioElementsRef.current.delete(ayah.number);
      } else {
        audio = new Audio();
        audio.preload = 'auto';
        audio.src = rawAudioUrl;
      }
      
      audioRef.current = audio;

      // Buffering progress handler
      audio.onprogress = () => {
        if (audio.buffered.length > 0) {
          const duration = audio.duration || 1;
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          const progress = Math.min(100, Math.round((bufferedEnd / duration) * 100));
          setBufferingProgress(progress);
        }
      };
      
      const onCanPlay = () => {
        setIsAudioLoading(null);
        setBufferingProgress(100);
        audio.play().catch(e => {
          console.warn("Audio play blocked or waiting on user touch:", e);
          setIsAudioLoading(null);
          setPlayingAyah(null);
        });
        setPlayingAyah(ayah.number);
      };

      audio.oncanplaythrough = onCanPlay;

      audio.onended = () => {
        handleRead(ayah.number);
        if (autoPlay) {
          const freshAyahs = ayahsRef.current;
          const currentIndex = freshAyahs.findIndex(a => a.number === ayah.number);
          if (currentIndex < freshAyahs.length - 1) {
            playAyah(freshAyahs[currentIndex + 1]);
          } else {
            setPlayingAyah(null);
          }
        } else {
          setPlayingAyah(null);
        }
      };

      audio.onerror = (e) => {
        console.error("Audio failed to load directly", e);
        // Fallback: If blob URL or specific stream failed, attempt direct fallback URL
        if (audio.src.startsWith('blob:') && ayah.audio) {
          audio.src = getAudioStreamUrl(ayah.audio);
          audio.play().catch(() => {
            setPlayingAyah(null);
            setIsAudioLoading(null);
          });
        } else {
          setPlayingAyah(null);
          setIsAudioLoading(null);
        }
      };

      // If audio already ready, play immediately for snappy response
      if (audio.readyState >= 3) {
        onCanPlay();
      } else {
        audio.load();
      }

    } catch (error) {
      console.error("Failed to initialize audio ayah", error);
      setIsAudioLoading(null);
    }
  };

  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const downloadFullSurah = async () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    setDownloadProgress(0);

    try {
      const updatedAyahs = [...ayahs];
      for (let i = 0; i < updatedAyahs.length; i++) {
        const ayah = updatedAyahs[i];
        if (ayah.audio && !ayah.audioBlob) {
          try {
            const streamUrl = getAudioStreamUrl(ayah.audio);
            const res = await fetch(streamUrl);
            if (!res.ok) throw new Error("Network response was not ok");
            const blob = await res.blob();
            updatedAyahs[i] = {
              ...ayah,
              audioBlob: blob
            };
          } catch (e) {
            console.warn(`Failed to cache audio for ayah ${ayah.number}, will stream normally`, e);
          }
        }
        setDownloadProgress(Math.round(((i + 1) / updatedAyahs.length) * 100));
      }
      setAyahs(updatedAyahs);
      await offlineService.saveAyahs(surah.number, updatedAyahs, selectedReciter);
      localStorage.setItem('offline-mode', 'true');
      notificationService.notify('Surah Downloaded', `${surah.englishName} is now fully available offline.`, 'system');
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const downloadSingleAyah = async (ayah: any) => {
    if (downloadingAyah || ayah.audioBlob) return;
    setDownloadingAyah(ayah.number);
    setDownloadingAyahProgress(0);

    try {
      const streamUrl = getAudioStreamUrl(ayah.audio);
      if (!streamUrl) throw new Error("No audio URL found for this verse.");

      const res = await fetch(streamUrl);
      if (!res.ok) throw new Error("Audio download failed");
      
      const contentLength = res.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = res.body?.getReader();
      if (!reader) {
        const blob = await res.blob();
        const updatedAyahs = ayahs.map(a => 
          a.number === ayah.number ? { ...a, audioBlob: blob } : a
        );
        setAyahs(updatedAyahs);
        await offlineService.saveAyahs(surah.number, updatedAyahs, selectedReciter);
        notificationService.notify('Ayah Synchronized', `Ayah ${ayah.numberInSurah} is now available offline.`, 'system');
        return;
      }

      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total > 0) {
            setDownloadingAyahProgress(Math.round((loaded / total) * 100));
          }
        }
      }

      const blob = new Blob(chunks, { type: res.headers.get('content-type') || 'audio/mpeg' });
      
      const updatedAyahs = ayahs.map(a => 
        a.number === ayah.number ? { ...a, audioBlob: blob } : a
      );
      
      setAyahs(updatedAyahs);
      await offlineService.saveAyahs(surah.number, updatedAyahs, selectedReciter);
      notificationService.notify('Ayah Synchronized', `Ayah ${ayah.numberInSurah} is now available offline.`, 'system');
      console.log(`Saved Ayah ${ayah.number} offline.`);
    } catch (error) {
      console.error("Failed to download individual ayah", error);
      alert("Offline storage failed for this verse. Please try again.");
    } finally {
      setDownloadingAyah(null);
      setDownloadingAyahProgress(0);
    }
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
               <span className="text-[8px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                 {scrollPercentage}% Read
               </span>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <button 
                 onClick={downloadFullSurah}
                 disabled={isDownloadingAll}
                 className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isDownloadingAll ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary'}`}
               >
                 {isDownloadingAll ? (
                   <>
                     <Loader2 size={10} className="animate-spin" /> {downloadProgress}%
                   </>
                 ) : (
                   <>
                     <ArrowRight size={10} className="rotate-90" /> Download
                   </>
                 )}
               </button>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <button 
                 onClick={() => setShowReciters(!showReciters)}
                 className="text-[8px] md:text-[10px] text-slate-400 hover:text-brand-primary font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
               >
                 <Volume2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> {RECITERS.find(r => r.id === selectedReciter)?.name.split(' ').pop()}
               </button>
               <div className="w-1 h-1 bg-slate-700 rounded-full" />
               <button 
                 onClick={() => setShowTranslations(!showTranslations)}
                 className="text-[8px] md:text-[10px] text-slate-400 hover:text-brand-primary font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
               >
                 <Languages className="w-2.5 h-2.5 md:w-3 md:h-3" /> {TRANSLATIONS.find(t => t.id === selectedTranslation)?.name}
               </button>
               {localStorage.getItem('offline-mode') === 'true' && (
                 <>
                   <div className="w-1 h-1 bg-slate-700 rounded-full" />
                   <div className="flex items-center gap-1 text-[8px] md:text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                     <WifiOff size={10} /> Offline Sanctuary
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="arabic-text text-3xl md:text-4xl font-bold text-brand-primary leading-tight drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">{surah.name}</p>
          </div>
        </div>

        {/* Global Download Progress Bar */}
        {isDownloadingAll && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary/10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${downloadProgress}%` }}
              className="h-full bg-brand-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
          </div>
        )}

        {/* Scroll Progress Bar */}
        {!isDownloadingAll && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${scrollPercentage}%` }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              transition={{ ease: "easeOut", duration: 0.1 }}
            />
          </div>
        )}

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

        {/* Translation Dropdown */}
        <AnimatePresence>
          {showTranslations && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-4 right-0 w-72 glass-panel rounded-3xl p-2 border-brand-primary/20 shadow-2xl z-50 backdrop-blur-3xl"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Translation</p>
                <button onClick={() => setShowTranslations(false)}><X size={14} className="text-slate-500" /></button>
              </div>
              <div className="py-2 max-h-80 overflow-y-auto no-scrollbar">
                {TRANSLATIONS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTranslation(t.id);
                      setShowTranslations(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedTranslation === t.id ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-white/5 text-slate-400'}`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-[9px] uppercase tracking-tighter opacity-60">Language: {t.lang.toUpperCase()}</p>
                    </div>
                    {selectedTranslation === t.id && <Check size={16} />}
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
            className={`group relative p-6 md:p-8 rounded-[2.5rem] transition-all duration-700 overflow-hidden ${playingAyah === ayah.number ? 'bg-brand-primary/[0.08] shadow-[0_0_40px_rgba(168,85,247,0.15)] border border-brand-primary/30' : ''}`}
          >
            {/* Active Glow Ornament */}
            {playingAyah === ayah.number && (
              <motion.div 
                layoutId="ayah-highlight-glow"
                className="absolute inset-0 bg-gradient-to-br from-brand-primary/[0.05] via-transparent to-transparent pointer-events-none"
              />
            )}
            {/* Verse Number & Actions */}
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 relative z-10">
               <div className={`w-8 h-8 md:w-10 md:h-10 border rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold font-mono transition-colors shadow-lg ${playingAyah === ayah.number ? 'bg-brand-primary border-brand-primary text-brand-depth shadow-brand-primary/20' : 'border-brand-primary/30 text-brand-primary shadow-black/20'}`}>
                  {ayah.numberInSurah}
               </div>
               <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent" />
               <div className="flex items-center gap-1 md:gap-3">
                  <button 
                    onClick={() => togglePlay(ayah)}
                    className={`p-2 transition-all relative ${playingAyah === ayah.number ? 'text-brand-primary scale-110' : 'text-slate-500 hover:text-brand-primary'}`}
                  >
                    {isAudioLoading === ayah.number ? (
                      <div className="relative">
                        <Loader2 size={16} className="animate-spin text-brand-primary" />
                        <span className="absolute -top-4 -right-4 text-[7px] font-black">{bufferingProgress}%</span>
                      </div>
                    ) : playingAyah === ayah.number ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                  <button 
                    onClick={() => downloadSingleAyah(ayah)}
                    disabled={!!ayah.audioBlob || downloadingAyah === ayah.number}
                    className={`p-2 transition-all relative ${ayah.audioBlob ? 'text-emerald-500' : downloadingAyah === ayah.number ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'}`}
                    title={ayah.audioBlob ? "Saved Offline" : "Download Verse"}
                  >
                    {downloadingAyah === ayah.number ? (
                       <div className="relative flex items-center justify-center w-5 h-5">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="opacity-20"
                            />
                            <motion.circle
                              cx="10"
                              cy="10"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray="50.24"
                              initial={{ strokeDashoffset: 50.24 }}
                              animate={{ strokeDashoffset: 50.24 - (50.24 * downloadingAyahProgress) / 100 }}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="text-[6px] font-black">{downloadingAyahProgress}%</span>
                       </div>
                    ) : ayah.audioBlob ? (
                       <Check size={16} />
                    ) : (
                       <Download size={16} />
                    )}
                  </button>
                  <button 
                    onClick={() => onToggleBookmark(ayah)}
                    className={`p-2 transition-colors ${isBookmarked(ayah.number) ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'}`}
                  >
                    <Bookmark size={16} fill={isBookmarked(ayah.number) ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => setShareAyah({ ...ayah, surahName: surah.englishName })}
                    className="text-slate-500 hover:text-brand-primary p-2 transition-colors hidden xs:block"
                    title="Share Verse"
                  >
                    <Share2 size={16} />
                  </button>
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

      <AnimatePresence>
        {shareAyah && (
          <VerseShareModal 
            ayah={shareAyah} 
            onClose={() => setShareAyah(null)} 
          />
        )}
      </AnimatePresence>

      {/* Unified Audio Player Control Bar */}
      <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl">
         <motion.div 
           initial={{ y: 100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="glass-panel-purple border-brand-primary/30 p-3 md:p-4 rounded-[2rem] shadow-2xl backdrop-blur-3xl flex flex-col gap-2 md:gap-3"
         >
           {/* Real-time D3 Waveform Visualizer */}
           <div className="px-4 pt-1 pb-1">
             <WaveformVisualizer 
               audioElement={audioRef.current} 
               isPlaying={!!playingAyah && !audioRef.current?.paused} 
               theme="quran" 
               height={32} 
             />
           </div>

           <div className="flex items-center justify-between w-full">
             {/* Current Ayah / Status */}
            <div className="flex items-center gap-3 px-2 md:px-4 border-r border-white/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-depth relative overflow-hidden">
                 {isAudioLoading ? (
                   <>
                    <Loader2 size={24} className="animate-spin relative z-10" />
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-black/20 transition-all duration-300"
                      style={{ height: `${bufferingProgress}%` }}
                    />
                   </>
                 ) : playingAyah ? (
                   <Volume2 size={24} className="animate-pulse" />
                 ) : (
                   <BookOpen size={24} />
                 )}
              </div>
              <div className="hidden xs:block">
                 <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] mb-0.5">
                   {isAudioLoading ? `Buffering ${bufferingProgress}%` : playingAyah ? 'Now Reciting' : 'Ready'}
                 </p>
                 <p className="text-[10px] md:text-xs font-bold text-white truncate max-w-[80px] md:max-w-[120px]">
                   {playingAyah ? `Ayah #${ayahs.find(a => a.number === playingAyah)?.numberInSurah}` : `${surah.englishName}`}
                 </p>
              </div>
           </div>

           {/* Player Controls */}
           <div className="flex-1 flex items-center justify-center gap-2 md:gap-6">
              <button 
                onClick={() => {
                  const currentIndex = ayahs.findIndex(a => a.number === (playingAyah || ayahs[0].number));
                  if (currentIndex > 0) playAyah(ayahs[currentIndex - 1]);
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Previous Ayah"
              >
                <SkipBack size={20} fill="currentColor" />
              </button>

              <button 
                onClick={() => {
                  if (playingAyah) {
                    audioRef.current?.pause();
                    setPlayingAyah(null);
                  } else {
                    const toPlay = playingAyah ? ayahs.find(a => a.number === playingAyah) : ayahs[0];
                    playAyah(toPlay);
                  }
                }}
                className="w-12 h-12 md:w-14 md:h-14 bg-brand-primary text-brand-depth rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-brand-primary/30"
              >
                {isAudioLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : playingAyah ? (
                  <Pause fill="currentColor" size={24} />
                ) : (
                  <Play fill="currentColor" size={24} />
                )}
              </button>

              <button 
                onClick={() => {
                  const currentIndex = ayahs.findIndex(a => a.number === (playingAyah || ayahs[0].number));
                  if (currentIndex < ayahs.length - 1) playAyah(ayahs[currentIndex + 1]);
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Next Ayah"
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
           </div>

           {/* Settings Toggles */}
           <div className="flex items-center gap-2 px-2 md:px-4 border-l border-white/10">
              <button 
                onClick={() => setAutoPlay(!autoPlay)}
                className={`p-2.5 rounded-xl transition-all flex flex-col items-center gap-1 ${autoPlay ? 'bg-brand-primary/20 text-brand-primary' : 'text-slate-500 hover:bg-white/5'}`}
                title="Auto-Play Continuous"
              >
                <Repeat size={18} />
                <span className="text-[7px] font-black uppercase tracking-tighter">Auto</span>
              </button>
              
              <button 
                onClick={() => {
                  const activeElement = document.getElementById(`ayah-${playingAyah || ayahs[0].number}`);
                  activeElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-white/5 hover:text-brand-primary transition-all flex flex-col items-center gap-1"
                title="Scroll to Active"
              >
                <Settings size={18} className="rotate-90" />
                <span className="text-[7px] font-black uppercase tracking-tighter">Focus</span>
              </button>
           </div>
          </div>
         </motion.div>
      </div>
    </div>
  );
}
