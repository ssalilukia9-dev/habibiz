import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  MessageCircle, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Flame, 
  Crown, 
  Users, 
  User, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  LocateFixed,
  Play,
  Trophy,
  MapPin,
  Smartphone,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface WalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
  addHasanat?: (amount: number) => void;
}

export interface TourStep {
  id: string;
  targetId: string;
  targetTab?: string;
  extraNav?: any;
  title: string;
  subtitle: string;
  description: string;
  mobileTip: string;
  badge: string;
  icon: any;
  preferredPosition?: 'top' | 'bottom' | 'center';
}

export const COMPLETE_TOUR_STEPS: TourStep[] = [
  // 1. WELCOME TO SANCTUARY
  {
    id: "welcome",
    targetId: "",
    targetTab: "home",
    title: "Welcome to Sanctuary 🌟",
    subtitle: "Your Mobile Spiritual Companion",
    description: "Assalamu Alaikum! Sanctuary is your all-in-one Islamic digital companion designed for your daily worship, Quran recitations, prayer precision, and spiritual growth.",
    mobileTip: "Swipe left or tap 'Next' to explore every button, instrument, and feature of the app.",
    badge: "Sanctuary Tour • 1/16",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  // 2. DAILY SOUL BANNER & HIJRI DATE
  {
    id: "salam-banner",
    targetId: "tour-salam-soul",
    targetTab: "home",
    title: "Daily Sanctuary Banner 🌅",
    subtitle: "Hijri Dates & 1-Tap Quran Resume",
    description: "Updates every morning with inspiring quotes, current Hijri calendar date, and a one-tap button to resume your exact Holy Quran reading progress.",
    mobileTip: "Tap 'Resume' anytime on your home screen to instantly jump back to your last recited Ayah.",
    badge: "Home Hub • 2/16",
    icon: Flame,
    preferredPosition: 'bottom'
  },
  // 3. HOLY MAKKAH PRAYER CONSOLE & ADHAN
  {
    id: "prayer-console",
    targetId: "tour-prayer-console",
    targetTab: "home",
    title: "Prayer Console & Adhan 🕋",
    subtitle: "Real-time Countdown & Sacred Callers",
    description: "Calculates precise prayer times via GPS with an animated live countdown ring. Tap the Bell to configure Adhan callers from Makkah, Madinah, Al-Aqsa, and Cairo.",
    mobileTip: "Receive full Adhan audio notifications even when your phone screen is locked or the app is closed.",
    badge: "Salah Precision • 3/16",
    icon: Moon,
    preferredPosition: 'top'
  },
  // 4. SPIRITUAL HASANAT LEDGER & STREAKS
  {
    id: "progress-stats",
    targetId: "tour-progress-stats",
    targetTab: "home",
    title: "Hasanat Ledger & Streaks ⚡",
    subtitle: "Track Deeds, Hadith Streaks & Ranks",
    description: "Every verse you recite, daily Hadith you study, and Dhikr you complete mints Hasanat to advance you from Seeker to Habibi King.",
    mobileTip: "Maintain daily consistency to keep your streak burning and unlock milestone rewards.",
    badge: "Spiritual Growth • 4/17",
    icon: Crown,
    preferredPosition: 'top'
  },
  // 5. DAILY VIGOR TRACKERS SUITE (PRAYERS, HADITH, QURAN, DHIKR, SAWM, SADAQAH)
  {
    id: "daily-vigor",
    targetId: "tour-daily-vigor",
    targetTab: "home",
    title: "Daily Vigor Tracker Suite ⚡",
    subtitle: "5 Prayers, Hadith, Quran Ayahs & Dhikr",
    description: "Your daily spiritual workout: check off your 5 daily prayers (+15 Hasanat each), mark the daily Hadith reflected (+20), log Quran ayahs recited (+10), count digital Dhikr tasbih beads, and log voluntary fasts & Sadaqah deeds.",
    mobileTip: "Tap each prayer pill as soon as you pray to keep your Daily Vitality score at 100%!",
    badge: "Discipline Hub • 5/17",
    icon: CheckCircle2,
    preferredPosition: 'top'
  },
  // 6. CELESTIAL REVELATION (AYAH & HADITH)
  {
    id: "daily-centerpiece",
    targetId: "tour-daily-centerpiece",
    targetTab: "home",
    title: "Daily Sacred Revelation 📖",
    subtitle: "Quranic Verses & Prophetic Hadiths",
    description: "Immerse yourself daily in authentic Quranic verses and Sahih Hadiths, complete with rich Arabic typography, audio recitations, and English translations.",
    mobileTip: "Tap this centerpiece card anytime to open the full chapter with verse-by-verse commentary.",
    badge: "Daily Wisdom • 6/17",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  // 6. QUICK ACTION UTILITIES
  {
    id: "shortcuts",
    targetId: "tour-shortcuts",
    targetTab: "home",
    title: "Quick Action Launchers 🔮",
    subtitle: "Adhkar, Rankings & AI Counselor",
    description: "One-tap direct shortcuts to launch your morning/evening supplications, view global rankings, consult Habibi AI, or explore the sacred Hajj pilgrimage map.",
    mobileTip: "These 4 quick tiles give you instant access to your most frequently used worship tools.",
    badge: "Smart Utilities • 6/16",
    icon: Zap,
    preferredPosition: 'top'
  },
  // 7. HOLY QURAN CONSERVATORY
  {
    id: "nav-resources-quran",
    targetId: "tour-nav-resources",
    targetTab: "resources",
    extraNav: { resId: 'quran' },
    title: "Holy Quran Conservatory 📚",
    subtitle: "114 Surahs, 30 Juz & Audio Recitations",
    description: "Read the entire Holy Quran in pristine Uthmani typography. Listen to world-renowned Qaris (Alafasy, Sudais, Minshawi), bookmark verses, and study translations.",
    mobileTip: "Supports page-by-page Mushaf reader, search by Ayah or keyword, and offline audio downloads.",
    badge: "Holy Quran • 7/16",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  // 8. REAL-TIME GPS QIBLA COMPASS
  {
    id: "nav-qibla",
    targetId: "tour-nav-qibla",
    targetTab: "qibla",
    title: "3D GPS Qibla Compass 🧭",
    subtitle: "Direct Gyroscope Pointer to Kaaba",
    description: "Calculates the exact direction of the Kaaba in Makkah from anywhere on Earth using your phone's built-in gyroscope and GPS coordinates.",
    mobileTip: "Hold your phone flat and rotate until the compass needle locks into the golden Kaaba beam.",
    badge: "Sacred Direction • 8/16",
    icon: Compass,
    preferredPosition: 'top'
  },
  // 9. HABIBI AI (HOLY ALIYAH) COMPANION
  {
    id: "nav-companion",
    targetId: "tour-nav-companion",
    targetTab: "companion",
    title: "Habibi AI Spiritual Counselor 🤖",
    subtitle: "Scripture-Grounded Islamic AI",
    description: "Consult Habibi AI anytime on Salah rulings, Fiqh questions, Quranic reflections, and authentic Duas. Backed by references to Quranic Surahs and verified Hadith.",
    mobileTip: "You can type or speak questions using voice input to receive instant, compassionate guidance.",
    badge: "Habibi AI • 9/16",
    icon: MessageCircle,
    preferredPosition: 'top'
  },
  // 10. GLOBAL UMMAH HUB & NOORTALK
  {
    id: "nav-ummah",
    targetId: "tour-nav-ummah",
    targetTab: "ummah",
    title: "Global Ummah Hub & NoorTalk 🤝",
    subtitle: "Community Reflections & Group Duas",
    description: "Connect with brothers and sisters across the globe. Share reflections on the NoorTalk feed, participate in community polls, and request heartfelt Duas.",
    mobileTip: "Post daily reflections or encourage fellow pilgrims on their spiritual journeys.",
    badge: "Global Ummah • 10/16",
    icon: Users,
    preferredPosition: 'top'
  },
  // 11. HALL OF FAME & LEADERBOARDS
  {
    id: "leaderboard-page",
    targetId: "",
    targetTab: "leaderboard",
    title: "Spiritual Hall of Fame 🏆",
    subtitle: "Global Seeker Rankings & Leagues",
    description: "Track your standing among dedicated seekers worldwide. Climb through Bronze, Silver, Gold, and Diamond tiers to claim the revered Habibi King crown.",
    mobileTip: "Earn bonus Hasanat by reading Quran, keeping daily streaks, and completing Tasbih Dhikr.",
    badge: "Hall of Fame • 11/16",
    icon: Trophy,
    preferredPosition: 'center'
  },
  // 12. SACRED ADHKAR & DIGITAL TASBIH
  {
    id: "adhkar-tasbih",
    targetId: "tour-shortcuts",
    targetTab: "resources",
    extraNav: { resId: 'adhkar' },
    title: "Sacred Adhkar & Digital Tasbih 📿",
    subtitle: "Morning/Evening Dhikr & Bead Counters",
    description: "Complete your daily morning, evening, and after-prayer supplications with authentic arabic text, virtue explanations, and tactile haptic vibration counters.",
    mobileTip: "Tap anywhere on screen to count SubhanAllah, Alhamdulillah, and Allahu Akbar with haptic feedback.",
    badge: "Sacred Adhkar • 12/16",
    icon: Moon,
    preferredPosition: 'top'
  },
  // 13. 3D INTERACTIVE HAJJ & UMRAH MAP
  {
    id: "hajj-map",
    targetId: "",
    targetTab: "resources",
    extraNav: { resId: 'hajj_umrah' },
    title: "3D Hajj & Umrah Interactive Map 🗺️",
    subtitle: "Explore Makkah, Mina, Arafat & Muzdalifah",
    description: "Interactive sacred pilgrimage map highlighting key historical locations, step-by-step rituals (Tawaf, Sa'i, Jamarat), and custom navigation markers.",
    mobileTip: "Tap any landmark marker on the map to view historical background, Duas, and walking routes.",
    badge: "Pilgrimage Hub • 13/16",
    icon: MapPin,
    preferredPosition: 'center'
  },
  // 14. PILGRIM PASSPORT & PROFILE CUSTOMIZATION
  {
    id: "nav-profile",
    targetId: "tour-nav-profile",
    targetTab: "profile",
    title: "Pilgrim Passport & Themes 🎨",
    subtitle: "Your Badges, Theme Customizers & Stats",
    description: "View your earned achievements, customize visual color themes (Emerald, Gold, Kaaba Black), manage offline audio caches, and switch languages.",
    mobileTip: "Personalize your app's typography, reciters, and adhan preferences in your profile.",
    badge: "Pilgrim Profile • 14/16",
    icon: User,
    preferredPosition: 'top'
  },
  // 15. MOBILE FLOATING NAVIGATION DOCK
  {
    id: "mobile-nav-dock",
    targetId: "tour-nav-home",
    targetTab: "home",
    title: "Mobile Floating Navigation Dock 📱",
    subtitle: "One-Tap Access on Any Phone",
    description: "The sleek bottom navigation bar keeps your Home, Quran, Qibla Compass, Habibi AI, Ummah Hub, and Profile right at your fingertips wherever you are in the app.",
    mobileTip: "Easily switch between features with a single thumb tap on the bottom dock.",
    badge: "Mobile Navigation • 15/16",
    icon: Smartphone,
    preferredPosition: 'top'
  },
  // 16. ADMIN HUB & REAL-TIME TELEMETRY ENGINE
  {
    id: "admin-hub",
    targetId: "",
    targetTab: "admin",
    title: "Admin Hub & Telemetry Engine 🛡️",
    subtitle: "Live Graphs, Telemetry & Auto-Mailing",
    description: "Private administrative console featuring real-time interactive time-series charts, Habibi AI query inspector, user Hasanat controls, and 7-day inactivity push & email automations.",
    mobileTip: "Equipped with live graphs, real-time query streams, and automated background lifecycle tools.",
    badge: "Admin Hub • 16/16",
    icon: ShieldCheck,
    preferredPosition: 'center'
  }
];

export default function WalkthroughTour({ isOpen, onClose, onNavigate, addHasanat }: WalkthroughTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  const [isPulsing, setIsPulsing] = useState(false);
  const touchStartX = useRef<number>(0);

  const currentStep = COMPLETE_TOUR_STEPS[currentStepIndex] || COMPLETE_TOUR_STEPS[0];
  const isLastStep = currentStepIndex === COMPLETE_TOUR_STEPS.length - 1;
  const isMobile = windowDimensions.width < 768;

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync navigation tab when step changes so target element is visible
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep.targetTab) {
      onNavigate(currentStep.targetTab, currentStep.extraNav);
    }
  }, [isOpen, currentStepIndex, currentStep, onNavigate]);

  // Update target rect based on current step
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen) return;

    if (!currentStep.targetId) {
      setTargetRect(null);
      return;
    }

    const element = document.getElementById(currentStep.targetId);
    if (element) {
      // Auto-scroll target into viewport smoothly
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      
      const timeout = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }, 180);

      return () => clearTimeout(timeout);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    updateSpotlightPosition();
    const interval = setInterval(updateSpotlightPosition, 500);
    return () => clearInterval(interval);
  }, [updateSpotlightPosition]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  // Mobile Touch Gestures (Swipe left to advance, swipe right to go back)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      // Swiped left -> Next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> Back
      handlePrev();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < COMPLETE_TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      triggerPulse();
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      triggerPulse();
    }
  };

  const triggerPulse = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 600);
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    triggerPulse();
  };

  const handleFinish = () => {
    if (addHasanat) {
      addHasanat(50);
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', { 
        detail: { amount: 50, reason: "In-App Tour Completed! +50 Hasanat!" } 
      }));
    }
    localStorage.setItem('sanctuary_tour_completed', 'true');
    onClose();
    setCurrentStepIndex(0);
  };

  if (!isOpen) return null;

  const Icon = currentStep.icon;

  // Calculate tooltip placement dynamically
  const padding = isMobile ? 6 : 10;
  const spotlightX = targetRect ? Math.max(0, targetRect.left - padding) : 0;
  const spotlightY = targetRect ? Math.max(0, targetRect.top - padding) : 0;
  const spotlightWidth = targetRect ? targetRect.width + padding * 2 : 0;
  const spotlightHeight = targetRect ? targetRect.height + padding * 2 : 0;

  // Decide if coach mark tooltip should be above or below target
  const showAbove = targetRect ? (targetRect.top > windowDimensions.height / 2) : false;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99990] pointer-events-auto overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* SVG Spotlight Mask with Pitch Dark Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.85))' }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White background = completely visible dark overlay */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout = transparent hole where spotlight focuses */}
              {targetRect && (
                <rect 
                  x={spotlightX}
                  y={spotlightY}
                  width={spotlightWidth}
                  height={spotlightHeight}
                  rx="20"
                  ry="20"
                  fill="black"
                  className="transition-all duration-300 ease-out"
                />
              )}
            </mask>
          </defs>

          {/* Dark backdrop with hole cutout */}
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="rgba(4, 6, 12, 0.88)" 
            mask="url(#spotlight-mask)"
            className="pointer-events-auto cursor-pointer"
            onClick={handleNext}
          />
        </svg>

        {/* Dynamic Glowing Spotlight Focus Ring around target element */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: isPulsing ? 1.04 : 1,
              x: spotlightX,
              y: spotlightY,
              width: spotlightWidth,
              height: spotlightHeight
            }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute pointer-events-none rounded-[20px] border-2 border-brand-primary shadow-[0_0_35px_rgba(245,158,11,0.6)] z-[99992]"
          >
            {/* Coach mark corner reticles */}
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white rounded-tl-md" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white rounded-bl-md" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white rounded-br-md" />

            {/* Glowing beacon pulse ring */}
            <div className="absolute inset-0 rounded-[20px] border border-brand-primary animate-ping opacity-60 pointer-events-none" />

            {/* Target Label pill */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand-primary text-brand-depth font-black text-[8px] uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap flex items-center gap-1"
            >
              <LocateFixed size={9} className="animate-spin" />
              <span>Target Focused</span>
            </motion.div>
          </motion.div>
        )}

        {/* Coach Mark / Walkthrough Tooltip Card (Mobile Responsive Anchor) */}
        <div className={`absolute inset-0 flex items-center justify-center p-3 md:p-6 pointer-events-none z-[99995] ${
          isMobile && targetRect 
            ? (showAbove ? 'items-start pt-4' : 'items-end pb-16') 
            : 'items-center'
        }`}>
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.92, y: showAbove ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`pointer-events-auto w-full max-w-lg bg-brand-sidebar/95 backdrop-blur-3xl border border-brand-primary/40 rounded-[2rem] md:rounded-[2.8rem] p-5 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative overflow-hidden space-y-4 md:space-y-6 max-h-[75vh] md:max-h-[85vh] overflow-y-auto ${
              targetRect && !isMobile ? (
                showAbove 
                  ? 'mb-auto mt-6' 
                  : 'mt-auto mb-6'
              ) : ''
            }`}
          >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-amber-400 to-brand-primary animate-pulse" />

            {/* Header: Step info & Close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0 shadow-lg shadow-brand-primary/10">
                  <Icon size={isMobile ? 20 : 24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">
                      {currentStep.badge}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500">•</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {currentStepIndex + 1} of {COMPLETE_TOUR_STEPS.length}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-white italic uppercase tracking-tight mt-0.5 leading-snug">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10 cursor-pointer shrink-0"
                title="Exit Tour"
              >
                <X size={15} />
              </button>
            </div>

            {/* Subtitle & Description */}
            <div className="p-3.5 md:p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-[11px] md:text-xs font-black text-amber-300 uppercase tracking-wider">
                {currentStep.subtitle}
              </h4>
              <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                {currentStep.description}
              </p>
              {currentStep.mobileTip && (
                <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] md:text-[11px] text-emerald-300 font-semibold">
                  <Smartphone size={12} className="shrink-0 text-emerald-400" />
                  <span>{currentStep.mobileTip}</span>
                </div>
              )}
            </div>

            {/* Interactive Step Timeline Dots (Fast Jump) */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
              {COMPLETE_TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => handleJumpToStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex 
                      ? 'w-6 bg-brand-primary' 
                      : idx < currentStepIndex 
                      ? 'w-2 bg-brand-primary/50' 
                      : 'w-2 bg-white/15'
                  }`}
                  title={step.title}
                />
              ))}
            </div>

            {/* Visual Step Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>Sanctuary Walkthrough</span>
                <span className="text-brand-primary font-mono font-bold">
                  {Math.round(((currentStepIndex + 1) / COMPLETE_TOUR_STEPS.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / COMPLETE_TOUR_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.25 }}
                  className="h-full bg-gradient-to-r from-brand-primary via-amber-400 to-amber-500 rounded-full"
                />
              </div>
            </div>

            {/* Interactive Step Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
              <button
                onClick={handleFinish}
                className="text-[10px] md:text-xs font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors py-2 cursor-pointer"
              >
                Skip
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-3.5 md:px-4 py-2.5 md:py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                )}

                {isLastStep ? (
                  <button
                    onClick={handleFinish}
                    className="px-5 md:px-7 py-2.5 md:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-brand-depth font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer animate-bounce"
                  >
                    Finish (+50 Hasanat) <CheckCircle2 size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-5 md:px-7 py-2.5 md:py-3.5 rounded-2xl bg-brand-primary text-brand-depth font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Feature <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
