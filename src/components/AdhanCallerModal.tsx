import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume,
  Volume1,
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  X, 
  Sparkles, 
  Check, 
  Compass, 
  Music, 
  ChevronDown,
  Sliders,
  Zap,
  BellRing,
  RotateCcw
} from 'lucide-react';
import { GLOBAL_ADHAN_LIST } from '../constants.ts';
import { getAudioStreamUrl } from '../lib/api.ts';
import { VoiceService } from '../services/voiceService.ts';

// Local storage key for persistent Adhan volume override
const ADHAN_VOLUME_STORAGE_KEY = 'sanctuary_adhan_volume';

export const getStoredAdhanVolume = (): number => {
  try {
    const saved = localStorage.getItem(ADHAN_VOLUME_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 2.0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Error reading stored Adhan volume:", e);
  }
  return 1.0; // 100% default full loudness
};

export const setStoredAdhanVolume = (vol: number): void => {
  try {
    const clamped = Math.max(0, Math.min(2.0, vol));
    localStorage.setItem(ADHAN_VOLUME_STORAGE_KEY, clamped.toString());
    window.dispatchEvent(new CustomEvent('sanctuary_adhan_volume_updated', { detail: { volume: clamped } }));
  } catch (e) {
    console.warn("Error saving Adhan volume:", e);
  }
};

interface AdhanCallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  prayerTime?: string;
  preferredAdhanId?: string;
  addHasanat?: (amount: number) => void;
  onNavigateToQibla?: () => void;
}

const DUA_AFTER_ADHAN = {
  arabic: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
  transliteration: "Allāhumma Rabba hādhihid-da‘watit-tāmmati, was-salātil-qā'imah, āti Muhammadanil-wasīlata wal-fadīlah, wab‘athhu maqāmam-mahmūdanil-ladhī wa‘adtah.",
  english: "O Allah, Lord of this perfect call and established prayer, grant Muhammad the intercession and distinction, and resurrect him to the praised station that You have promised him.",
  benefit: "The Prophet (ﷺ) said: 'Whoever says this after hearing the Adhan, my intercession becomes guaranteed for him on the Day of Resurrection.' (Sahih Bukhari)"
};

export default function AdhanCallerModal({
  isOpen,
  onClose,
  prayerName,
  prayerTime,
  preferredAdhanId,
  addHasanat,
  onNavigateToQibla
}: AdhanCallerModalProps) {
  const [selectedAdhanId, setSelectedAdhanId] = useState<string>(preferredAdhanId || 'makkah');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => getStoredAdhanVolume());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(225);
  const [hasClaimedDuaReward, setHasClaimedDuaReward] = useState<boolean>(false);
  const [showDuaVoice, setShowDuaVoice] = useState<boolean>(false);
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);
  const [showVolumeSavedToast, setShowVolumeSavedToast] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const currentAdhan = GLOBAL_ADHAN_LIST.find(a => a.id === selectedAdhanId) || GLOBAL_ADHAN_LIST[0];

  useEffect(() => {
    if (preferredAdhanId) {
      setSelectedAdhanId(preferredAdhanId);
    }
  }, [preferredAdhanId]);

  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (e) {}
        audioRef.current = null;
      }
      setIsPlaying(false);
      VoiceService.stop();
      return;
    }

    // Load initial stored volume
    const initialVol = getStoredAdhanVolume();
    setVolume(initialVol);

    // Initialize Audio playback
    startPlayback(currentAdhan.audioUrl, initialVol);

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = "";
        } catch (e) {}
        audioRef.current = null;
      }
      VoiceService.stop();
    };
  }, [isOpen, selectedAdhanId]);

  const startPlayback = (audioSourceUrl: string, initialVol?: number) => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (e) {}
      audioRef.current = null;
    }

    const streamUrl = getAudioStreamUrl(audioSourceUrl);
    if (!streamUrl) return;

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = streamUrl;
    audio.preload = 'auto';

    const targetVol = initialVol !== undefined ? initialVol : volume;

    // Web Audio API Gain Node connection for true sound amplification / system media override
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioCtx();
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        
        const gainNode = ctx.createGain();
        gainNodeRef.current = gainNode;
        gainNode.gain.value = isMuted ? 0 : targetVol;

        const source = ctx.createMediaElementSource(audio);
        sourceNodeRef.current = source;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Keep standard HTMLAudio volume at 1.0 when gainNode is in control
        audio.volume = Math.min(1.0, isMuted ? 0 : (targetVol > 1.0 ? 1.0 : targetVol));
      } else {
        audio.volume = Math.min(1.0, Math.max(0, isMuted ? 0 : targetVol));
      }
    } catch (e) {
      // Direct volume fallback
      audio.volume = Math.min(1.0, Math.max(0, isMuted ? 0 : targetVol));
    }

    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          if (err.name === 'AbortError' || err.message?.includes('interrupted')) return;
          console.warn("Adhan autoplay awaiting user interaction:", err);
          setIsPlaying(false);
        });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) {
      startPlayback(currentAdhan.audioUrl);
      return;
    }

    if (isPlaying) {
      try {
        audioRef.current.pause();
      } catch (e) {}
      setIsPlaying(false);
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(e => console.warn("Playback toggle failed", e));
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = nextMuted ? 0 : volume;
    }
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(2.0, parseFloat(newVol.toFixed(2))));
    setVolume(clamped);
    setStoredAdhanVolume(clamped);

    // Show temporary auto-save indicator
    setShowVolumeSavedToast(true);
    setTimeout(() => setShowVolumeSavedToast(false), 2000);

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : clamped;
    }
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1.0, Math.max(0, isMuted ? 0 : (clamped > 1.0 ? 1.0 : clamped)));
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
      if (gainNodeRef.current) gainNodeRef.current.gain.value = clamped;
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleReciteDua = () => {
    if (showDuaVoice) {
      VoiceService.stop();
      setShowDuaVoice(false);
    } else {
      setShowDuaVoice(true);
      VoiceService.speakBoth(DUA_AFTER_ADHAN.arabic, DUA_AFTER_ADHAN.english, 'dua_after_adhan', () => {
        setShowDuaVoice(false);
      });
    }
  };

  const handleClaimReward = () => {
    if (hasClaimedDuaReward) return;
    setHasClaimedDuaReward(true);
    if (addHasanat) {
      addHasanat(5);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getVolumeStatusBadge = (vol: number) => {
    if (isMuted || vol === 0) {
      return { label: '0% Muted', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    if (vol <= 0.4) {
      return { label: `${Math.round(vol * 100)}% Quiet`, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    if (vol <= 0.8) {
      return { label: `${Math.round(vol * 100)}% Balanced`, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    if (vol <= 1.0) {
      return { label: `${Math.round(vol * 100)}% Standard Max`, color: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' };
    }
    if (vol <= 1.5) {
      return { label: `${Math.round(vol * 100)}% ⚡ Fajr Boost`, color: 'bg-amber-500/25 text-amber-300 border-amber-500/40' };
    }
    return { label: `${Math.round(vol * 100)}% 🚀 Ultra Loud`, color: 'bg-orange-500/30 text-orange-300 border-orange-500/50' };
  };

  if (!isOpen) return null;

  const currentVolumeStatus = getVolumeStatusBadge(volume);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl">
        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-brand-depth border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto text-app-text"
        >
          {/* Hero Mosque Header with Dynamic Background */}
          <div className="relative h-64 sm:h-72 w-full overflow-hidden">
            <img 
              src={currentAdhan.image} 
              alt={currentAdhan.name}
              className="w-full h-full object-cover transition-transform duration-1000 scale-105"
            />
            {/* Multi-tier Gradient Overlay for maximum legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-depth via-black/50 to-black/60" />

            {/* Top Bar Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                <span>SWALAH TIME • {prayerName.toUpperCase()}</span>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Adhan Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prayer & Location Details */}
            <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>{prayerName}</span>
                  {prayerTime && (
                    <span className="text-base sm:text-lg font-normal text-amber-300/90 font-mono">
                      ({prayerTime})
                    </span>
                  )}
                </h2>
                
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-[11px] font-medium text-amber-300">
                  {currentAdhan.maqam || 'Sacred Maqam'}
                </span>
              </div>

              <p className="text-sm font-medium text-white/90 truncate">
                {currentAdhan.name}
              </p>
              <p className="text-xs text-white/70 flex items-center gap-1.5">
                <span>📍 {currentAdhan.location}</span>
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-5">
            
            {/* Audio Waveform & Player Controls */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              {/* Progress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{formatSeconds(currentTime)}</span>
                  <span>{formatSeconds(duration)}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between pt-1">
                {/* Voice Selection Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowVoicePicker(!showVoicePicker)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="max-w-[120px] sm:max-w-[150px] truncate">{currentAdhan.title}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown for Adhan Selection */}
                  {showVoicePicker && (
                    <div className="absolute left-0 bottom-full mb-2 w-64 max-h-60 overflow-y-auto bg-brand-depth/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 z-30 space-y-0.5">
                      <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Select Adhan Voice
                      </div>
                      {GLOBAL_ADHAN_LIST.map(adhan => (
                        <button
                          key={adhan.id}
                          onClick={() => {
                            setSelectedAdhanId(adhan.id);
                            setShowVoicePicker(false);
                            localStorage.setItem('preferred-adhan-id', adhan.id);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                            selectedAdhanId === adhan.id 
                              ? 'bg-brand-primary text-white font-medium' 
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="truncate">
                            <p className="truncate font-semibold">{adhan.title}</p>
                            <p className="text-[10px] opacity-75 truncate">{adhan.location}</p>
                          </div>
                          {selectedAdhanId === adhan.id && <Check className="w-3.5 h-3.5 shrink-0 ml-1.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Central Play/Pause Button */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-brand-primary hover:bg-brand-primary/90 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-brand-primary/30 transition-all cursor-pointer"
                    aria-label={isPlaying ? "Pause Adhan" : "Play Adhan"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                </div>

                {/* Mini Quick Mute Toggle */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    title={isMuted ? "Unmute Adhan Audio" : "Mute Adhan Audio"}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-red-400" />
                    ) : volume > 1.0 ? (
                      <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="hidden sm:inline font-mono">{isMuted ? 'Muted' : `${Math.round(volume * 100)}%`}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* DEDICATED LOCAL ADHAN VOLUME OVERRIDE PANEL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/5 via-black/30 to-white/5 border border-white/10 space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                        Adhan Volume Override
                      </h3>
                      {showVolumeSavedToast && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                          ✓ Saved
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Overrides system media level for prayer notifications & alarms
                    </p>
                  </div>
                </div>

                {/* Current Volume Indicator Pill */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all ${currentVolumeStatus.color}`}>
                  {currentVolumeStatus.label}
                </div>
              </div>

              {/* Local Volume Slider with Gradient & Visual Tick Markers */}
              <div className="space-y-2 pt-1">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                    }}
                  />
                </div>

                {/* Visual Scale Indicators */}
                <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
                  <span className="flex items-center gap-0.5"><VolumeX size={10} /> 0% (Mute)</span>
                  <span className="flex items-center gap-0.5"><Volume1 size={10} /> 50%</span>
                  <span className="flex items-center gap-0.5 font-bold text-slate-200"><Volume2 size={10} /> 100% (Standard)</span>
                  <span className="flex items-center gap-0.5 text-amber-300 font-bold"><Zap size={10} /> 150% (Boost)</span>
                  <span className="flex items-center gap-0.5 text-orange-400 font-bold">200% (Max)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                  Presets:
                </span>
                
                <button
                  onClick={() => handleVolumeChange(0)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    volume === 0 || isMuted
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                  }`}
                >
                  0% Mute
                </button>

                <button
                  onClick={() => handleVolumeChange(0.4)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    !isMuted && Math.abs(volume - 0.4) < 0.05
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                  }`}
                >
                  40% Soft
                </button>

                <button
                  onClick={() => handleVolumeChange(0.8)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    !isMuted && Math.abs(volume - 0.8) < 0.05
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                  }`}
                >
                  80% Clear
                </button>

                <button
                  onClick={() => handleVolumeChange(1.0)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    !isMuted && Math.abs(volume - 1.0) < 0.05
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-md font-extrabold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  100% Standard
                </button>

                <button
                  onClick={() => handleVolumeChange(1.5)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    !isMuted && Math.abs(volume - 1.5) < 0.05
                      ? 'bg-amber-400 text-black border-amber-300 shadow-md font-extrabold animate-pulse'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                  title="Amplified volume boost designed to awaken you for Fajr"
                >
                  <Zap size={11} />
                  <span>150% Fajr Boost</span>
                </button>

                <button
                  onClick={() => handleVolumeChange(2.0)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    !isMuted && Math.abs(volume - 2.0) < 0.05
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md font-extrabold'
                      : 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/30'
                  }`}
                >
                  <span>200% Max</span>
                </button>
              </div>
            </div>

            {/* Sunnah Du'a After Adhan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-brand-primary/5 to-transparent border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-xs sm:text-sm font-bold tracking-wide uppercase">
                    Authentic Du'a After Adhan
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReciteDua}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      showDuaVoice 
                        ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30' 
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{showDuaVoice ? 'Speaking...' : 'Listen Du\'a'}</span>
                  </button>
                </div>
              </div>

              {/* Arabic Calligraphy */}
              <p className="text-right font-arabic text-xl sm:text-2xl leading-relaxed text-amber-200/95 font-medium py-1">
                {DUA_AFTER_ADHAN.arabic}
              </p>

              {/* Transliteration */}
              <p className="text-xs italic text-slate-300/90 leading-normal">
                "{DUA_AFTER_ADHAN.transliteration}"
              </p>

              {/* English Meaning */}
              <p className="text-xs text-slate-400 leading-normal">
                {DUA_AFTER_ADHAN.english}
              </p>

              {/* Reward Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/5 text-[11px] text-slate-400">
                <span>{DUA_AFTER_ADHAN.benefit}</span>
                <button
                  onClick={handleClaimReward}
                  disabled={hasClaimedDuaReward}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    hasClaimedDuaReward 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 active:scale-95'
                  }`}
                >
                  {hasClaimedDuaReward ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>+5 Hasanat Claimed</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +50 Hasanat</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center gap-3 pt-1">
              {onNavigateToQibla && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToQibla();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-slate-200 transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-brand-primary" />
                  <span>Open Qibla Compass</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all text-center cursor-pointer"
              >
                Close & Prepare for Swalah
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

