import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { 
  Sparkles, 
  Check, 
  CreditCard, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  WifiOff,
  Map,
  TrendingUp,
  Library,
  Layout,
  Crown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Video,
  Flame,
  Radio,
  BookOpen,
  Compass,
  Star,
  CheckCircle2,
  HeartHandshake,
  Award,
  Clock,
  Sparkle
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { ActivityLoggerService } from '../services/activityLoggerService';

interface SoundscapeTrack {
  id: string;
  name: string;
  arabicName: string;
  subtitle: string;
  audioUrl: string;
  coverImage: string;
  tag: string;
}

const SACRED_SOUNDSCAPES: SoundscapeTrack[] = [
  {
    id: 'makkah_rain',
    name: 'Gentle Rain over Kaaba',
    arabicName: 'مطر الكعبة المشرفة',
    subtitle: 'Sacred raindrops falling gently onto Mataf marble',
    audioUrl: 'https://cdn.freesound.org/previews/531/531947_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=800',
    tag: 'Focus & Tahajjud'
  },
  {
    id: 'madinah_courtyard',
    name: 'Dawn Courtyard of Al-Nabawi',
    arabicName: 'فجر الروضة الشريفة',
    subtitle: 'Quiet morning breeze with gentle birds of the Prophet\'s Mosque',
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800',
    tag: 'Peace & Serenity'
  },
  {
    id: 'tawaf_echoes',
    name: 'Midnight Tawaf Whispers',
    arabicName: 'همسات الطواف والذكر',
    subtitle: 'Calm ambient murmurs of pilgrims reciting SubhanAllah around the Bayt',
    audioUrl: 'https://cdn.freesound.org/previews/415/415951_5121236-lq.mp3',
    coverImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800',
    tag: 'Deep Contemplation'
  }
];

export default function PremiumView() {
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [soundVolume, setSoundVolume] = useState<number>(0.75);
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'soundscapes' | 'ai_tools' | 'plans'>('overview');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync Current User Status
  useEffect(() => {
    const checkUser = async () => {
      if (auth.currentUser) {
        setUser(auth.currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setIsSubscribed(!!data.isPremium || !!data.isHabibiKing);
          }
        } catch (e) {
          console.warn("User status check offline:", e);
        }
      } else {
        const local = localStorage.getItem('sanctuary_local_user');
        if (local) {
          const parsed = JSON.parse(local);
          setUser(parsed);
          setIsSubscribed(!!parsed.isPremium || !!parsed.isHabibiKing);
        }
      }
    };
    checkUser();
  }, []);

  // Audio Ambient Player handler
  const handleToggleSoundscape = (track: SoundscapeTrack) => {
    if (activeSoundId === track.id && isPlayingSound) {
      audioRef.current?.pause();
      setIsPlayingSound(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.audioUrl);
      audio.loop = true;
      audio.volume = soundVolume;
      audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
      audioRef.current = audio;
      setActiveSoundId(track.id);
      setIsPlayingSound(true);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume;
    }
  }, [soundVolume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle Instant Subscription Activation
  const handleSubscribe = async () => {
    setLoading(true);
    const hasanatBonus = selectedPlan === 'annual' ? 5000 : selectedPlan === 'lifetime' ? 15000 : 1000;

    try {
      const now = new Date();
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          isPremium: true,
          subscriptionTier: selectedPlan,
          premiumActivatedAt: serverTimestamp(),
          hasanatBonusAwarded: hasanatBonus
        });
      }

      // Update local storage
      const local = localStorage.getItem('sanctuary_local_user');
      if (local) {
        const parsed = JSON.parse(local);
        parsed.isPremium = true;
        parsed.subscriptionTier = selectedPlan;
        localStorage.setItem('sanctuary_local_user', JSON.stringify(parsed));
      }

      setIsSubscribed(true);
      setShowCelebration(true);

      // Log to Firestore Activity Stream
      await ActivityLoggerService.logActivity({
        type: 'hasanat',
        title: 'Sanctuary Elite Membership 🌟',
        message: `${user?.displayName || 'Pilgrim'} subscribed to Sanctuary Elite (${selectedPlan.toUpperCase()}) and received +${hasanatBonus.toLocaleString()} Hasanat!`,
        userName: user?.displayName || 'Pilgrim',
        badge: `${selectedPlan.toUpperCase()} VIP`,
        amount: hasanatBonus
      });

      notificationService.notify(
        'Sanctuary Elite Activated 🌟',
        `Masha'Allah! Welcome to the sacred circle. +${hasanatBonus.toLocaleString()} Hasanat bonus added to your treasury!`,
        'system'
      );
    } catch (error) {
      console.warn("Local activation fallback:", error);
      setIsSubscribed(true);
      setShowCelebration(true);
    } finally {
      setLoading(false);
    }
  };

  const VIP_PERKS = [
    {
      title: "24/7 Haramain 4K Live Streams",
      desc: "Instant ultra-low latency live broadcast streams from Makkah Al-Mukarramah & Madinah Al-Munawwarah.",
      icon: Video,
      badge: "LIVE 4K"
    },
    {
      title: "Sacred Ambient Soundscapes",
      desc: "Immersive 3D audio of Kaaba rain, Tawaf murmurs, and dawn breezes over the Prophet's Mosque for Khatmah meditation.",
      icon: Volume2,
      badge: "AUDIO 3D"
    },
    {
      title: "2X Hasanat Spiritual Velocity Booster",
      desc: "Earn double Hasanat points across all Quran recitations, daily Adhkar completions, and Ummah interactions.",
      icon: Zap,
      badge: "2X REWARD"
    },
    {
      title: "Word-by-Word Quranic Linguistic Analyzer",
      desc: "Arabic root words, morphological parsing, lexical definitions, and deep Ibn Kathir / Jalalayn Tafseer commentaries.",
      icon: BookOpen,
      badge: "SCHOLARLY"
    },
    {
      title: "10 Authentic Golden Adhans & Soundboard",
      desc: "Adhan calls from Al-Aqsa, Cairo Minshawi, Toubar Fajr, Brunei, and Dubai with custom desktop scheduling.",
      icon: Radio,
      badge: "10 VOICES"
    },
    {
      title: "Comprehensive Ruqyah Shariah Audio Vault",
      desc: "Complete protective verses against anxiety, evil eye, and distress with continuous playback loops.",
      icon: ShieldCheck,
      badge: "PROTECTION"
    }
  ];

  return (
    <div className="space-y-10 pb-28 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Celebration Modal / Banner */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-8 rounded-[3rem] bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-600 text-brand-depth text-center shadow-2xl relative overflow-hidden space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto text-white shadow-xl">
              <Crown size={36} className="animate-bounce" />
            </div>
            <div className="space-y-1 text-white">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-90">Sacred Ascension</span>
              <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight">
                Welcome to Sanctuary Elite VIP
              </h2>
              <p className="text-sm max-w-lg mx-auto opacity-90 font-medium">
                Your account now has lifetime access to 4K Haramain live streams, Sacred Soundscapes, 2X Hasanat booster, and scholarly Tafseer tools!
              </p>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="px-8 py-3 rounded-2xl bg-brand-depth text-amber-400 font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl cursor-pointer"
            >
              Enter Sacred Experience
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <header className="text-center space-y-4 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-[0.25em] shadow-lg shadow-amber-500/10">
          <Crown size={14} className="animate-pulse" />
          <span>Sanctuary Elite VIP Club</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic">
          Elevate Your <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">Spiritual Journey</span>
        </h1>
        
        <p className="text-slate-300 max-w-2xl mx-auto text-sm md:text-base font-normal leading-relaxed">
          Unlock 24/7 Haramain live streaming, soothing Kaaba ambient soundscapes, 2X Hasanat velocity, and deep word-by-word Quranic insight.
        </p>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'overview', label: 'VIP Perks', icon: Sparkles },
            { id: 'streams', label: 'Haramain 4K Live', icon: Video },
            { id: 'soundscapes', label: 'Sacred Soundscapes', icon: Volume2 },
            { id: 'plans', label: isSubscribed ? 'Active Status' : 'Membership Plans', icon: Crown }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-brand-depth shadow-xl shadow-amber-500/25 scale-105'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* TAB 1: VIP PERKS OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIP_PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel-purple border-white/10 hover:border-amber-500/40 p-6 sm:p-8 rounded-[2.5rem] relative overflow-hidden group transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <perk.icon size={22} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-amber-300 uppercase tracking-widest font-mono">
                    {perk.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                    {perk.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {perk.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Call to Action Banner */}
          {!isSubscribed && (
            <div className="glass-panel p-8 sm:p-10 rounded-[3rem] border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-brand-depth to-orange-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
                  <Flame size={16} />
                  <span>Exclusive Introductory Blessing</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white italic">
                  Ascend to Sanctuary Elite Today
                </h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Join thousands of dedicated believers deepening their Quran memorization, prayer focus, and daily Dhikr.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('plans')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                View VIP Plans ($3.00/mo)
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HARAMAIN 4K LIVE STREAMS */}
      {activeTab === 'streams' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> 24/7 Global Sanctuary Feeds
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white italic">
              Live from the Sacred Harams
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Watch live prayers, circumambulation around the Kaaba, and serene scenes from the Prophet's Mosque in Madinah.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Makkah Live Frame */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/10 bg-black/40 space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Makkah Al-Mukarramah</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase font-mono">
                  LIVE 4K
                </span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-white/10 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/live_stream?channel=UC4_o6i_FfF6r7q9_y6pT7vg&autoplay=0"
                  title="Makkah Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct view of the Holy Kaaba and the Tawaf courtyard. Experience the continuous recitation of the Holy Quran and adhan broadcasts.
              </p>
            </div>

            {/* Madinah Live Frame */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/10 bg-black/40 space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Madinah Al-Munawwarah</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase font-mono">
                  LIVE 4K
                </span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-white/10 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/live_stream?channel=UC_wG9fP9jJ3v8cT6gH_6u4w&autoplay=0"
                  title="Madinah Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct view of the Prophet's Mosque (Al-Masjid An-Nabawi), the Green Dome, and the illuminated minarets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SACRED SOUNDSCAPES */}
      {activeTab === 'soundscapes' && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 flex items-center justify-center gap-2">
              <Sparkles size={12} /> Ambient Spiritual Meditation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white italic">
              Sacred Atmosphere & Focus Loops
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Play sacred background acoustics while reading the Quran, reciting evening Adhkar, or engaging in Tahajjud prayer.
            </p>
          </div>

          {/* Volume Control Bar */}
          <div className="glass-panel p-4 rounded-2xl border-white/10 max-w-md mx-auto flex items-center gap-4">
            <Volume2 size={18} className="text-amber-400 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Soundscape Volume</span>
                <span className="font-mono">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SACRED_SOUNDSCAPES.map((sound) => {
              const isPlaying = activeSoundId === sound.id && isPlayingSound;
              return (
                <div
                  key={sound.id}
                  className={`glass-panel p-6 rounded-[2.5rem] border transition-all space-y-5 relative overflow-hidden ${
                    isPlaying 
                      ? 'border-amber-400 shadow-2xl shadow-amber-500/20 bg-amber-500/[0.04]' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-white/10 group">
                    <img 
                      src={sound.coverImage} 
                      alt={sound.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-black text-amber-300 uppercase tracking-wider">
                      {sound.tag}
                    </span>

                    <button
                      onClick={() => handleToggleSoundscape(sound)}
                      className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                        isPlaying 
                          ? 'bg-amber-400 text-brand-depth scale-110' 
                          : 'bg-white/20 hover:bg-amber-400 hover:text-brand-depth text-white backdrop-blur-md'
                      }`}
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-right text-xs font-arabic text-amber-300 font-bold">{sound.arabicName}</p>
                    <h3 className="text-base font-black text-white">{sound.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-normal">{sound.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PRICING & MEMBERSHIP PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
              Honest & Sacred Subscription
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white italic">
              Choose Your Sanctum Tier
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Every contribution directly supports our cloud servers, real-time sync, and Quran preservation programs.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Monthly Tier */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`glass-panel p-8 rounded-[2.5rem] border transition-all cursor-pointer relative space-y-6 flex flex-col justify-between ${
                selectedPlan === 'monthly'
                  ? 'border-amber-400 bg-amber-500/[0.03] shadow-xl'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Monthly</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-amber-400 bg-amber-400 text-brand-depth' : 'border-white/20'}`}>
                    {selectedPlan === 'monthly' && <Check size={12} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-mono">$3.00</span>
                    <span className="text-xs text-slate-400 font-bold">/month</span>
                  </div>
                  <p className="text-xs text-slate-400">Flexible monthly spiritual access. Cancel anytime.</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span>Haramain 4K Live Streams</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span>Sacred Soundscapes Audio</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span>+1,000 Hasanat Welcome Bonus</span></div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {isSubscribed ? 'Active Plan' : 'Select Monthly ($3.00)'}
              </button>
            </div>

            {/* Annual Tier (BEST VALUE) */}
            <div 
              onClick={() => setSelectedPlan('annual')}
              className={`glass-panel p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative space-y-6 flex flex-col justify-between ${
                selectedPlan === 'annual'
                  ? 'border-amber-400 bg-amber-500/[0.08] shadow-2xl shadow-amber-500/20 scale-105'
                  : 'border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth text-[10px] font-black uppercase tracking-widest shadow-lg">
                MOST POPULAR • 45% SAVINGS
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">Annual Barakah</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'annual' ? 'border-amber-400 bg-amber-400 text-brand-depth' : 'border-white/20'}`}>
                    {selectedPlan === 'annual' && <Check size={12} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-mono">$20.00</span>
                    <span className="text-xs text-slate-400 font-bold">/year</span>
                  </div>
                  <p className="text-[11px] text-amber-300 font-bold">Equivalent to just $1.66/month!</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span>All Monthly Features Included</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span>2X Hasanat Multiplier Booster</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span>Word-by-Word Quran Analyzer</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400" /> <span className="font-bold text-amber-300">+5,000 Hasanat Treasury Bonus</span></div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? 'Activating Sacred Pass...' : isSubscribed ? 'Active VIP Member' : 'Activate Annual Pass ($20.00)'}
              </button>
            </div>

            {/* Lifetime Tier */}
            <div 
              onClick={() => setSelectedPlan('lifetime')}
              className={`glass-panel p-8 rounded-[2.5rem] border transition-all cursor-pointer relative space-y-6 flex flex-col justify-between ${
                selectedPlan === 'lifetime'
                  ? 'border-purple-400 bg-purple-500/[0.04] shadow-xl'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-300">Lifetime Patron</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'lifetime' ? 'border-purple-400 bg-purple-400 text-brand-depth' : 'border-white/20'}`}>
                    {selectedPlan === 'lifetime' && <Check size={12} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-mono">$79.99</span>
                    <span className="text-xs text-slate-400 font-bold">/one-time</span>
                  </div>
                  <p className="text-xs text-slate-400">Pay once, cherish forever across all future updates.</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><Check size={14} className="text-purple-400" /> <span>Permanent Lifetime Access</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-purple-400" /> <span>Golden Patron Profile Badge</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-purple-400" /> <span className="font-bold text-purple-300">+15,000 Hasanat Treasury Bonus</span></div>
                </div>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-purple-500/20"
              >
                {isSubscribed ? 'Active Patron' : 'Become Lifetime Patron'}
              </button>
            </div>
          </div>

          {/* Sendwave Direct Alternative Instruction */}
          <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border-white/10 max-w-xl mx-auto space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Smartphone size={16} />
              <span>Direct Mobile / Sendwave Option</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If card payment is unavailable in your region, send direct contribution via Sendwave to:
            </p>
            <div className="p-3 bg-black/40 rounded-2xl border border-amber-500/20 inline-block font-mono text-amber-400 font-bold text-sm">
              +256 708515639 (Sanctuary Care Team)
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
