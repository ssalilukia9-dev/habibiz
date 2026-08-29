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
  Sparkle,
  Lock,
  X
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { ActivityLoggerService } from '../services/activityLoggerService';
import CardPaymentGatewayModal from './CardPaymentGatewayModal';

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
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [activatedAtDate, setActivatedAtDate] = useState<Date | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'vip_monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [soundVolume, setSoundVolume] = useState<number>(0.75);
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'soundscapes' | 'ai_tools' | 'plans'>('overview');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);

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
            const sub = !!data.isPremium || !!data.isHabibiKing;
            setIsSubscribed(sub);
            setCurrentTier(data.subscriptionTier || (sub ? 'annual' : 'free'));
            if (data.premiumActivatedAt) {
              setActivatedAtDate(data.premiumActivatedAt.toDate ? data.premiumActivatedAt.toDate() : new Date(data.premiumActivatedAt));
            }
          }
        } catch (e) {
          console.warn("User status check offline:", e);
        }
      } else {
        const local = localStorage.getItem('sanctuary_local_user');
        if (local) {
          const parsed = JSON.parse(local);
          setUser(parsed);
          const sub = !!parsed.isPremium || !!parsed.isHabibiKing;
          setIsSubscribed(sub);
          setCurrentTier(parsed.subscriptionTier || (sub ? 'annual' : 'free'));
          if (parsed.premiumActivatedAt) {
            setActivatedAtDate(new Date(parsed.premiumActivatedAt));
          }
        }
      }
    };
    checkUser();
  }, []);

  // Audio Ambient Player handler
  const handleToggleSoundscape = (track: SoundscapeTrack) => {
    if (!isSubscribed) {
      notificationService.notify(
        'Sanctuary Elite Feature 🔒',
        'Sacred Soundscapes are exclusive to Sanctuary Elite members. Select a plan to unlock immersive audio.',
        'system'
      );
      setActiveTab('plans');
      return;
    }

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
    const hasanatBonus = selectedPlan === 'vip_monthly' || selectedPlan === 'annual' ? 7500 : 1000;

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
        parsed.premiumActivatedAt = now.toISOString();
        localStorage.setItem('sanctuary_local_user', JSON.stringify(parsed));
      }

      setIsSubscribed(true);
      setCurrentTier(selectedPlan);
      setActivatedAtDate(now);
      setShowCelebration(true);

      // Dispatch global user updated event
      window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
        detail: {
          uid: auth.currentUser?.uid || user?.uid,
          isPremium: true
        }
      }));

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
      setCurrentTier(selectedPlan);
      setShowCelebration(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel Subscription & Return to Free Plan
  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          isPremium: false,
          isHabibiKing: false,
          subscriptionTier: 'free',
          cancelledAt: serverTimestamp()
        });
      }

      // Update local storage
      const local = localStorage.getItem('sanctuary_local_user');
      if (local) {
        const parsed = JSON.parse(local);
        parsed.isPremium = false;
        parsed.isHabibiKing = false;
        parsed.subscriptionTier = 'free';
        localStorage.setItem('sanctuary_local_user', JSON.stringify(parsed));
      }

      setIsSubscribed(false);
      setCurrentTier('free');
      setShowCancelModal(false);

      // Notify global state
      window.dispatchEvent(new CustomEvent('sanctuary_user_updated', {
        detail: {
          uid: auth.currentUser?.uid || user?.uid,
          isPremium: false
        }
      }));

      notificationService.notify(
        'Subscription Cancelled',
        'Your membership has been reverted to the Free Plan. You can rejoin Sanctuary Elite at any time.',
        'system'
      );
    } catch (e) {
      console.warn("Cancel subscription error:", e);
      setIsSubscribed(false);
      setCurrentTier('free');
      setShowCancelModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Expiration Text
  const getExpirationDisplay = () => {
    if (!activatedAtDate) return '1 Year from Activation (Active)';
    if (currentTier === 'lifetime') return 'Lifetime Access (Never expires)';
    const msDuration = (currentTier === 'annual' || currentTier === 'yearly') 
      ? 365 * 24 * 60 * 60 * 1000 
      : 30 * 24 * 60 * 60 * 1000;
    const expiryDate = new Date(activatedAtDate.getTime() + msDuration);
    return `Expires on ${expiryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
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

          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-r from-amber-500/15 via-black/60 to-purple-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto shadow-xl"
            >
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Lock size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">4K Haramain Streams (Sanctuary Elite Only)</h4>
                  <p className="text-xs text-slate-400">Upgrade to an Elite pass to unlock continuous 24/7 ultra-HD feeds with zero interruptions.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
              >
                Unlock 4K Streams
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Makkah Live Frame */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/10 bg-black/40 space-y-4 overflow-hidden relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Makkah Al-Mukarramah</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase font-mono flex items-center gap-1">
                  {!isSubscribed && <Lock size={10} />} LIVE 4K
                </span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-white/10 shadow-2xl">
                {isSubscribed ? (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/live_stream?channel=UC4_o6i_FfF6r7q9_y6pT7vg&autoplay=1"
                    title="Makkah Live Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200" 
                      alt="Makkah Preview" 
                      className="w-full h-full object-cover blur-sm scale-105 opacity-40"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
                        <Crown size={28} />
                      </div>
                      <h4 className="text-base font-black text-white italic">Makkah 4K Kaaba Live Feed</h4>
                      <p className="text-xs text-slate-300 max-w-xs">Reserved for Sanctuary Elite members. Experience direct 4K feeds from the Holy Kaaba courtyard.</p>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 text-brand-depth font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer shadow-lg"
                      >
                        Unlock Feed ($3.00/mo)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct view of the Holy Kaaba and the Tawaf courtyard. Experience the continuous recitation of the Holy Quran and adhan broadcasts.
              </p>
            </div>

            {/* Madinah Live Frame */}
            <div className="glass-panel p-6 rounded-[2.5rem] border-white/10 bg-black/40 space-y-4 overflow-hidden relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Madinah Al-Munawwarah</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase font-mono flex items-center gap-1">
                  {!isSubscribed && <Lock size={10} />} LIVE 4K
                </span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-white/10 shadow-2xl">
                {isSubscribed ? (
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube-nocookie.com/embed/live_stream?channel=UC_wG9fP9jJ3v8cT6gH_6u4w&autoplay=1"
                    title="Madinah Live Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1200" 
                      alt="Madinah Preview" 
                      className="w-full h-full object-cover blur-sm scale-105 opacity-40"
                    />
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
                        <Crown size={28} />
                      </div>
                      <h4 className="text-base font-black text-white italic">Prophet's Mosque 4K Feed</h4>
                      <p className="text-xs text-slate-300 max-w-xs">Direct high-definition broadcast of Al-Masjid An-Nabawi in Madinah Al-Munawwarah.</p>
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="px-5 py-2.5 rounded-xl bg-amber-400 text-brand-depth font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer shadow-lg"
                      >
                        Unlock Feed ($3.00/mo)
                      </button>
                    </div>
                  </div>
                )}
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

          {!isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-r from-purple-500/15 via-black/60 to-amber-500/15 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto shadow-xl"
            >
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <Lock size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Sacred Soundscapes Vault (VIP Feature)</h4>
                  <p className="text-xs text-slate-400">Unlock endless high-definition 3D spatial acoustics from Makkah, Madinah, and the desert night.</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
              >
                Unlock Soundscapes
              </button>
            </motion.div>
          )}

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
                    
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      {!isSubscribed && <Lock size={10} />}
                      {sound.tag}
                    </span>

                    <button
                      onClick={() => handleToggleSoundscape(sound)}
                      className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                        isPlaying 
                          ? 'bg-amber-400 text-brand-depth scale-110' 
                          : !isSubscribed
                          ? 'bg-black/60 text-amber-400 hover:bg-amber-400 hover:text-brand-depth backdrop-blur-md'
                          : 'bg-white/20 hover:bg-amber-400 hover:text-brand-depth text-white backdrop-blur-md'
                      }`}
                    >
                      {!isSubscribed ? <Lock size={18} /> : isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
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
              Honest & Sacred Monetization
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white italic">
              {isSubscribed ? 'Your Active Sanctum Plan' : 'Choose Your Sanctum Tier'}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isSubscribed 
                ? 'Manage your sacred subscription or switch tiers anytime.' 
                : 'Choose the Free Plan for essential tools, or upgrade to Elite to unlock unlimited AI, 4K streams, and master reciters.'}
            </p>
          </div>

          {/* 🌟 Active Subscription Management Banner */}
          {isSubscribed && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-purple-950/40 border border-amber-500/30 shadow-2xl max-w-4xl mx-auto space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shadow-lg">
                    <Crown size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-brand-depth font-black text-[10px] uppercase tracking-wider">
                        {currentTier.toUpperCase()} VIP
                      </span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Active
                      </span>
                    </div>
                    <p className="text-sm font-black text-white mt-1">Sanctuary Elite Membership</p>
                    <p className="text-xs text-amber-300/90 font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} />
                      <span>{getExpirationDisplay()}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black transition-all cursor-pointer hover:border-rose-500/50"
                >
                  Cancel & Revert to Free Plan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-amber-400 shrink-0" />
                  <span>24/7 Haramain 4K Streams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-amber-400 shrink-0" />
                  <span>2X Hasanat Multiplier</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-amber-400 shrink-0" />
                  <span>Sacred Soundscapes Vault</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete 4-Tier Pricing Grid: Free Plan + 3 Paid Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {/* 1. FREE PLAN CARD */}
            <div 
              className={`glass-panel p-6 sm:p-7 rounded-[2.5rem] border transition-all relative space-y-6 flex flex-col justify-between ${
                !isSubscribed
                  ? 'border-emerald-500/50 bg-emerald-500/[0.04] shadow-xl'
                  : 'border-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">Free Seeker</span>
                  {!isSubscribed ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase font-mono">
                      Current Plan
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-400 text-[9px] font-bold uppercase">
                      Default Tier
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono">$0.00</span>
                    <span className="text-xs text-slate-400 font-bold">/forever</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">Essential instruments for your foundational daily devotion.</p>
                </div>

                {/* Included in Free */}
                <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] text-slate-300">
                  <p className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Included:</p>
                  <div className="flex items-center gap-2"><Check size={13} className="text-emerald-400 shrink-0" /> <span>Standard Quran & Reciters</span></div>
                  <div className="flex items-center gap-2"><Check size={13} className="text-emerald-400 shrink-0" /> <span>5 Daily Prayer Times & Qibla</span></div>
                  <div className="flex items-center gap-2"><Check size={13} className="text-emerald-400 shrink-0" /> <span>Digital Tasbih & Adhkar Library</span></div>
                  <div className="flex items-center gap-2"><Check size={13} className="text-emerald-400 shrink-0" /> <span>Community Chat & Faith Feed</span></div>
                  <div className="flex items-center gap-2"><Check size={13} className="text-emerald-400 shrink-0" /> <span>1X Standard Hasanat Velocity</span></div>
                </div>

                {/* Locked in Free */}
                <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] text-slate-400/80">
                  <p className="text-[9px] font-black uppercase text-amber-400/80 tracking-wider">Requires Elite Pass:</p>
                  <div className="flex items-center gap-1.5 text-slate-500 line-through"><Lock size={11} className="text-amber-500/70 shrink-0" /> <span>Haramain 4K Live Streams</span></div>
                  <div className="flex items-center gap-1.5 text-slate-500 line-through"><Lock size={11} className="text-amber-500/70 shrink-0" /> <span>Sacred Soundscapes Vault</span></div>
                  <div className="flex items-center gap-1.5 text-slate-500 line-through"><Lock size={11} className="text-amber-500/70 shrink-0" /> <span>Habibi Aliyah AI Companion</span></div>
                  <div className="flex items-center gap-1.5 text-slate-500 line-through"><Lock size={11} className="text-amber-500/70 shrink-0" /> <span>2X Hasanat Multiplier Booster</span></div>
                </div>
              </div>

              {!isSubscribed ? (
                <div className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-black text-center text-xs uppercase tracking-wider">
                  Active Free Tier
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Downgrade to Free
                </button>
              )}
            </div>

          {/* Membership Tier Cards (2-Tier High Value Model) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* 1. STANDARD MONTHLY TIER */}
            <div 
              onClick={() => setSelectedPlan('monthly')}
              className={`glass-panel p-6 sm:p-8 rounded-[2.5rem] border transition-all cursor-pointer relative space-y-6 flex flex-col justify-between ${
                selectedPlan === 'monthly'
                  ? 'border-amber-400 bg-amber-500/[0.05] shadow-xl ring-2 ring-amber-400/30'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300">Standard Monthly</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-amber-400 bg-amber-400 text-brand-depth' : 'border-white/20'}`}>
                    {selectedPlan === 'monthly' && <Check size={12} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-mono">$3.00</span>
                    <span className="text-xs text-slate-400 font-bold">/month</span>
                  </div>
                  <p className="text-xs text-slate-400">Flexible monthly spiritual access. 30-day cycle. Cancel anytime.</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>24/7 Haramain 4K Streams</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>Sacred Soundscapes Audio</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>Habibi Aliyah Voice AI</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>+1,000 Hasanat Welcome Bonus</span></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('monthly');
                  setShowCardModal(true);
                }}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-amber-400 hover:text-brand-depth text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                {isSubscribed && currentTier === 'monthly' ? 'Current Active Plan' : 'Select Standard ($3.00/mo)'}
              </button>
            </div>

            {/* 2. VIP ALL-ACCESS MONTHLY TIER */}
            <div 
              onClick={() => setSelectedPlan('vip_monthly')}
              className={`glass-panel p-6 sm:p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative space-y-6 flex flex-col justify-between ${
                selectedPlan === 'vip_monthly' || selectedPlan === 'annual'
                  ? 'border-amber-400 bg-amber-500/[0.08] shadow-2xl shadow-amber-500/20 scale-[1.02] z-10'
                  : 'border-amber-500/40 hover:border-amber-400'
              }`}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                ULTIMATE SANCTUARY VIP
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">VIP All-Access Pass</span>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPlan === 'vip_monthly' || selectedPlan === 'annual' ? 'border-amber-400 bg-amber-400 text-brand-depth' : 'border-white/20'}`}>
                    {(selectedPlan === 'vip_monthly' || selectedPlan === 'annual') && <Check size={12} />}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-amber-400 font-mono">$21.00</span>
                    <span className="text-xs text-slate-400 font-bold">/month</span>
                  </div>
                  <p className="text-xs text-amber-300 font-bold">Comprehensive spiritual power suite • Priority VIP badge</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>All Standard Monthly Features</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>2X Hasanat Spiritual Velocity Booster</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>Full AI Tajweed Mastery & Slow Murattal</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span>3D Pilgrimage Tour & Zakat Wealth Suite</span></div>
                  <div className="flex items-center gap-2"><Check size={14} className="text-amber-400 shrink-0" /> <span className="font-bold text-amber-300">+7,500 Hasanat Treasury Bonus</span></div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPlan('vip_monthly');
                  setShowCardModal(true);
                }}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                {loading ? 'Activating...' : isSubscribed && (currentTier === 'vip_monthly' || currentTier === 'annual') ? 'Current Active VIP Plan' : 'Activate VIP Pass ($21.00/mo)'}
              </button>
            </div>

          </div>
          </div>

          {/* Secure Card Payment Guarantee */}
          <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border-white/10 max-w-xl mx-auto space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <CreditCard size={16} />
              <span>Secure Card Payments Only</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All Sanctuary VIP upgrades are processed via encrypted Credit & Debit Card checkout with instant tier activation and automated receipt.
            </p>
            <div className="p-3 bg-black/40 rounded-2xl border border-amber-500/20 flex items-center justify-center gap-3 text-xs text-slate-300">
              <span className="font-semibold text-white">Accepted Cards:</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">Visa</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">MasterCard</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] font-bold">American Express</span>
            </div>
          </div>
        </div>
      )}

      {/* Visa & Mastercard Payment Gateway Modal */}
      {showCardModal && (
        <CardPaymentGatewayModal
          plan={selectedPlan}
          currentUser={user}
          onSuccess={(txnRef) => {
            setShowCardModal(false);
            handleSubscribe();
          }}
          onClose={() => setShowCardModal(false)}
        />
      )}

      {/* 🌟 Cancel Subscription Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <Clock size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Cancel Sanctuary Elite?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Are you sure you want to cancel and revert back to the <strong className="text-amber-400">Free Plan</strong>? You will lose 4K Haramain live streaming, Sacred Soundscapes, and the 2X Hasanat multiplier.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
