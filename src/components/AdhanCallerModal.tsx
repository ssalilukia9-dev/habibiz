import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  X, 
  Sparkles, 
  Check, 
  Compass, 
  Clock, 
  Music, 
  Share2,
  ChevronDown
} from 'lucide-react';
import { GLOBAL_ADHAN_LIST } from '../constants.ts';
import { getAudioStreamUrl } from '../lib/api.ts';
import { VoiceService } from '../services/voiceService.ts';

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
  const [volume, setVolume] = useState<number>(0.9);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(225);
  const [hasClaimedDuaReward, setHasClaimedDuaReward] = useState<boolean>(false);
  const [showDuaVoice, setShowDuaVoice] = useState<boolean>(false);
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

    // Initialize Audio playback
    startPlayback(currentAdhan.audioUrl);

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

  const startPlayback = (audioSourceUrl: string) => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch (e) {}
      audioRef.current = null;
    }

    const streamUrl = getAudioStreamUrl(audioSourceUrl);
    if (!streamUrl) return;

    const audio = new Audio(streamUrl);
    audio.preload = 'auto';
    audio.volume = isMuted ? 0 : volume;
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
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(e => console.warn("Playback toggle failed", e));
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
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
      addHasanat(50);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

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
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
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
          <div className="p-4 sm:p-6 space-y-6">
            
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
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium transition-colors"
                  >
                    <Music className="w-3.5 h-3.5 text-brand-primary" />
                    <span className="max-w-[130px] truncate">{currentAdhan.title}</span>
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
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
                    className="w-12 h-12 rounded-full bg-brand-primary hover:bg-brand-primary/90 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-brand-primary/30 transition-all"
                    aria-label={isPlaying ? "Pause Adhan" : "Play Adhan"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>
                </div>

                {/* Volume & Mute Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-primary hidden sm:block"
                  />
                </div>
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
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    hasClaimedDuaReward 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md shadow-amber-500/20 active:scale-95'
                  }`}
                >
                  {hasClaimedDuaReward ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>+50 Hasanat Claimed</span>
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
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-slate-200 transition-colors"
                >
                  <Compass className="w-4 h-4 text-brand-primary" />
                  <span>Open Qibla Compass</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand-primary/20 transition-all text-center"
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
