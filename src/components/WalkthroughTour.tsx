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
  ShoppingBag,
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
  ExternalLink,
  Menu,
  Bell
} from 'lucide-react';

interface WalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
  addHasanat?: (amount: number) => void;
  onOpenDrawer?: (open: boolean) => void;
  isDrawerOpen?: boolean;
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
  requiresDrawerOpen?: boolean;
}

// 📱 MOBILE-OPTIMIZED TOUR STEPS (Involves Mobile Drawer, Floating Dock & Mobile Touch Gestures)
export const MOBILE_TOUR_STEPS: TourStep[] = [
  {
    id: "m-welcome",
    targetId: "",
    targetTab: "home",
    title: "Welcome to Sanctuary 🌟",
    subtitle: "Your Mobile Spiritual Haven",
    description: "Assalamu Alaikum! Sanctuary is crafted specifically for seamless mobile worship—offering precise prayer times, Quran recitations, Tahajjud alarms, and spiritual companion Habibi Aliyah.",
    mobileTip: "Swipe left or tap 'Next' to embark on this quick interactive tour.",
    badge: "Mobile Tour • 1/14",
    icon: Smartphone,
    preferredPosition: 'center'
  },
  {
    id: "m-drawer",
    targetId: "tour-mobile-drawer-content",
    targetTab: "home",
    requiresDrawerOpen: true,
    title: "Mobile Navigation Drawer 📋",
    subtitle: "All Sacred Features & Sacred Tools",
    description: "Open the navigation drawer anytime to access everything: Sacred Resources, Qibla Compass, Tahajjud Alarms, Zakat Calculator, 99 Names of Allah, and our community sponsors.",
    mobileTip: "Tap the top-left menu icon to open this comprehensive directory at any time.",
    badge: "Navigation Drawer • 2/14",
    icon: Menu,
    preferredPosition: 'center'
  },
  {
    id: "m-salam-banner",
    targetId: "tour-salam-soul",
    targetTab: "home",
    requiresDrawerOpen: false,
    title: "Daily Sanctuary Banner 🌅",
    subtitle: "Hijri Dates & 1-Tap Quran Resume",
    description: "Updates every morning with uplifting quotes, current Hijri calendar date, and a one-tap button to resume your exact Holy Quran reading progress.",
    mobileTip: "Tap 'Resume' anytime on your home screen to jump back to your last recited Ayah.",
    badge: "Home Hub • 3/14",
    icon: Flame,
    preferredPosition: 'bottom'
  },
  {
    id: "m-prayer-console",
    targetId: "tour-prayer-console",
    targetTab: "home",
    title: "Prayer Console & Adhan 🕋",
    subtitle: "Live Countdown & Sacred Callers",
    description: "Calculates precise prayer times via GPS with an animated live countdown. Configure Adhan callers from Makkah, Madinah, Al-Aqsa, and Cairo.",
    mobileTip: "Receive full Adhan audio notifications even when your phone screen is locked or the app is closed.",
    badge: "Salah Precision • 4/14",
    icon: Moon,
    preferredPosition: 'top'
  },
  {
    id: "m-tahajjud-vigil",
    targetId: "tour-tahajjud-hub",
    targetTab: "prayer_times",
    title: "Tahajjud Vigil & Wake Alarms 🌌",
    subtitle: "Last 1/3 of the Night & Gentle Wake Tones",
    description: "Automatic calculation for the last third of the night. Features functional lockscreen alarms and soothing spiritual wake chimes (Noor Chime, Madinah Melody).",
    mobileTip: "Set your wake-up window (Last 1/3 start, 30m/45m/60m before Fajr) and test the audio alarm anytime.",
    badge: "Night Vigil • 5/14",
    icon: Bell,
    preferredPosition: 'center'
  },
  {
    id: "m-streak-fire",
    targetId: "tour-streak-fire",
    targetTab: "home",
    title: "Hasanat Ledger & Streaks ⚡",
    subtitle: "Track Deeds, Hadith Streaks & Ranks",
    description: "Every verse you recite, daily Hadith you study, and prayer you log mints Hasanat to advance you from Seeker to Habibi King.",
    mobileTip: "Maintain daily consistency to keep your fiery streak burning and earn rank badges.",
    badge: "Spiritual Growth • 6/14",
    icon: Crown,
    preferredPosition: 'top'
  },
  {
    id: "m-daily-centerpiece",
    targetId: "tour-daily-centerpiece",
    targetTab: "home",
    title: "Daily Sacred Revelation 📖",
    subtitle: "Quranic Verses & Prophetic Hadiths",
    description: "Immerse yourself daily in authentic Quranic verses and Sahih Hadiths, complete with rich Arabic typography, audio recitations, and English translations.",
    mobileTip: "Tap this centerpiece card anytime to open the full chapter with verse commentary.",
    badge: "Daily Wisdom • 7/14",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  {
    id: "m-shortcuts",
    targetId: "tour-shortcuts",
    targetTab: "home",
    title: "Quick Action Launchers 🔮",
    subtitle: "Adhkar, Rankings & Sacred Tools",
    description: "One-tap direct shortcuts to launch your morning/evening supplications, view global rankings, or explore the sacred Hajj pilgrimage map.",
    mobileTip: "These quick tiles give you instant access to your most frequently used worship tools.",
    badge: "Quick Launch • 8/14",
    icon: Zap,
    preferredPosition: 'top'
  },
  {
    id: "m-mobile-dock",
    targetId: "tour-mobile-dock",
    targetTab: "home",
    title: "Mobile Floating Bottom Dock 📱",
    subtitle: "Fast 1-Thumb Switching",
    description: "The sleek bottom navigation bar keeps your Home, Resources, Market, Habibi Aliyah, Ummah Hub, and Profile right at your fingertips wherever you are in the app.",
    mobileTip: "Easily switch between features with a single thumb tap on the bottom dock.",
    badge: "Bottom Dock • 9/14",
    icon: Smartphone,
    preferredPosition: 'top'
  },
  {
    id: "m-quran-conservatory",
    targetId: "",
    targetTab: "resources",
    extraNav: { resId: 'quran' },
    title: "Holy Quran Conservatory 📚",
    subtitle: "114 Surahs, 30 Juz & Persistent Audio",
    description: "Read the entire Holy Quran in pristine Uthmani typography. Enjoy persistent background Quran audio that continues uninterrupted as you browse across the app.",
    mobileTip: "Tap any Surah or Ayah to play audio recitations from Alafasy, Sudais, and Minshawi.",
    badge: "Holy Quran • 10/14",
    icon: BookOpen,
    preferredPosition: 'center'
  },
  {
    id: "m-halal-market",
    targetId: "",
    targetTab: "market",
    title: "Sanctuary Halal Market 🛍️",
    subtitle: "Sacred Marketplace & Waqf Goods",
    description: "Explore curated spiritual artifacts, luxury prayer mats, authentic timepieces from ISIS WRISTS, halal goods, and waqf charity contributions.",
    mobileTip: "Browse verified vendors, Islamic timepieces, and community offerings.",
    badge: "Halal Market • 11/14",
    icon: ShoppingBag,
    preferredPosition: 'center'
  },
  {
    id: "m-habibi-aliyah",
    targetId: "",
    targetTab: "companion",
    title: "Habibi Aliyah Spiritual Companion ✨",
    subtitle: "Scripture-Grounded Islamic Nur AI",
    description: "Consult Habibi Aliyah anytime on Salah rulings, Fiqh questions, Quranic reflections, and authentic Duas. Backed by references to Quranic Surahs and verified Hadith.",
    mobileTip: "You can type or speak questions using voice input to receive instant, compassionate guidance.",
    badge: "Habibi Aliyah • 12/14",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  {
    id: "m-ummah-hub",
    targetId: "",
    targetTab: "ummah",
    title: "Global Ummah Hub & NoorTalk 🤝",
    subtitle: "Community Reflections & Group Duas",
    description: "Connect with brothers and sisters across the globe. Share reflections on the NoorTalk feed, participate in community polls, and request heartfelt Duas.",
    mobileTip: "Post daily reflections or encourage fellow pilgrims on their spiritual journeys.",
    badge: "Global Ummah • 13/14",
    icon: Users,
    preferredPosition: 'center'
  },
  {
    id: "m-profile",
    targetId: "",
    targetTab: "profile",
    title: "Pilgrim Passport & Themes 🎨",
    subtitle: "Your Badges, Themes & Audio Caches",
    description: "View your earned achievements, customize visual color themes (Emerald, Gold, Kaaba Black), manage offline audio caches, and switch languages.",
    mobileTip: "Personalize your app's typography, reciters, and adhan preferences in your profile.",
    badge: "Pilgrim Profile • 14/14",
    icon: User,
    preferredPosition: 'center'
  }
];

// 💻 DESKTOP-OPTIMIZED TOUR STEPS (Focuses on Desktop Side Rail, Banners, Hall of Fame & Admin Tools)
export const DESKTOP_TOUR_STEPS: TourStep[] = [
  {
    id: "d-welcome",
    targetId: "",
    targetTab: "home",
    title: "Welcome to Sanctuary 🌟",
    subtitle: "Your Comprehensive Islamic Sanctuary",
    description: "Assalamu Alaikum! Sanctuary is your all-in-one digital companion for daily worship, Holy Quran recitations, prayer precision, and spiritual growth.",
    mobileTip: "Use arrow keys or click 'Next' to tour each console and feature.",
    badge: "Sanctuary Tour • 1/15",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  {
    id: "d-rail",
    targetId: "tour-desktop-rail",
    targetTab: "home",
    title: "Navigation Rail 🚀",
    subtitle: "Instant Access to All Modules",
    description: "The sleek sidebar rail gives you one-click access across Home, Sacred Resources, Halal Market, Habibi Aliyah AI, Ummah Hub, Leaderboards, and Pilgrim Profile.",
    mobileTip: "Hover over any icon to view quick tooltips and keyboard shortcuts.",
    badge: "Navigation Rail • 2/15",
    icon: Layers,
    preferredPosition: 'top'
  },
  {
    id: "d-salam-banner",
    targetId: "tour-salam-soul",
    targetTab: "home",
    title: "Daily Sanctuary Banner 🌅",
    subtitle: "Hijri Dates & 1-Tap Quran Resume",
    description: "Updates every morning with inspiring quotes, current Hijri calendar date, and a one-tap button to resume your exact Holy Quran reading progress.",
    mobileTip: "Click 'Resume' anytime on your home screen to instantly jump back to your last recited Ayah.",
    badge: "Home Hub • 3/15",
    icon: Flame,
    preferredPosition: 'bottom'
  },
  {
    id: "d-prayer-console",
    targetId: "tour-prayer-console",
    targetTab: "home",
    title: "Prayer Console & Adhan 🕋",
    subtitle: "Real-time Countdown & Sacred Callers",
    description: "Calculates precise prayer times via GPS with an animated live countdown ring. Tap the Bell to configure Adhan callers from Makkah, Madinah, Al-Aqsa, and Cairo.",
    mobileTip: "Receive full Adhan audio notifications even when your phone screen is locked or the app is closed.",
    badge: "Salah Precision • 4/15",
    icon: Moon,
    preferredPosition: 'top'
  },
  {
    id: "d-streak-fire",
    targetId: "tour-streak-fire",
    targetTab: "home",
    title: "Hasanat Ledger & Streaks ⚡",
    subtitle: "Track Deeds, Hadith Streaks & Ranks",
    description: "Every verse you recite, daily Hadith you study, and Dhikr you complete mints Hasanat to advance you from Seeker to Habibi King.",
    mobileTip: "Maintain daily consistency to keep your streak burning and unlock milestone rewards.",
    badge: "Spiritual Growth • 5/15",
    icon: Crown,
    preferredPosition: 'top'
  },
  {
    id: "d-daily-centerpiece",
    targetId: "tour-daily-centerpiece",
    targetTab: "home",
    title: "Daily Sacred Revelation 📖",
    subtitle: "Quranic Verses & Prophetic Hadiths",
    description: "Immerse yourself daily in authentic Quranic verses and Sahih Hadiths, complete with rich Arabic typography, audio recitations, and English translations.",
    mobileTip: "Click this centerpiece card anytime to open the full chapter with verse-by-verse commentary.",
    badge: "Daily Wisdom • 6/15",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  {
    id: "d-shortcuts",
    targetId: "tour-shortcuts",
    targetTab: "home",
    title: "Quick Action Launchers 🔮",
    subtitle: "Adhkar, Rankings & AI Counselor",
    description: "One-tap direct shortcuts to launch your morning/evening supplications, view global rankings, consult Habibi Aliyah, or explore the sacred Hajj pilgrimage map.",
    mobileTip: "These quick tiles give you instant access to your most frequently used worship tools.",
    badge: "Smart Utilities • 7/15",
    icon: Zap,
    preferredPosition: 'top'
  },
  {
    id: "d-resources-quran",
    targetId: "tour-nav-resources",
    targetTab: "resources",
    extraNav: { resId: 'quran' },
    title: "Holy Quran Conservatory 📚",
    subtitle: "114 Surahs, 30 Juz & Audio Recitations",
    description: "Read the entire Holy Quran in pristine Uthmani typography. Listen to world-renowned Qaris (Alafasy, Sudais, Minshawi), bookmark verses, and study translations with persistent background audio player.",
    mobileTip: "Supports page-by-page Mushaf reader, search by Ayah or keyword, and offline audio downloads.",
    badge: "Holy Quran • 8/15",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  {
    id: "d-market",
    targetId: "tour-nav-market",
    targetTab: "market",
    title: "Sanctuary Halal Market 🛍️",
    subtitle: "Sacred Islamic Marketplace & Waqf",
    description: "Explore curated spiritual artifacts, luxury prayer mats, authentic timepieces from ISIS WRISTS, halal goods, and waqf contributions.",
    mobileTip: "Browse verified vendors, Islamic timepieces from ISIS WRISTS, and community offerings.",
    badge: "Halal Market • 9/15",
    icon: ShoppingBag,
    preferredPosition: 'top'
  },
  {
    id: "d-companion",
    targetId: "tour-nav-companion",
    targetTab: "companion",
    title: "Habibi Aliyah Spiritual Companion ✨",
    subtitle: "Scripture-Grounded Islamic Nur AI",
    description: "Consult Habibi Aliyah anytime on Salah rulings, Fiqh questions, Quranic reflections, and authentic Duas. Backed by references to Quranic Surahs and verified Hadith.",
    mobileTip: "You can type or speak questions using voice input to receive instant, compassionate guidance.",
    badge: "Habibi Aliyah • 10/15",
    icon: Sparkles,
    preferredPosition: 'top'
  },
  {
    id: "d-ummah",
    targetId: "tour-nav-ummah",
    targetTab: "ummah",
    title: "Global Ummah Hub & NoorTalk 🤝",
    subtitle: "Community Reflections & Group Duas",
    description: "Connect with brothers and sisters across the globe. Share reflections on the NoorTalk feed, participate in community polls, and request heartfelt Duas.",
    mobileTip: "Post daily reflections or encourage fellow pilgrims on their spiritual journeys.",
    badge: "Global Ummah • 11/15",
    icon: Users,
    preferredPosition: 'top'
  },
  {
    id: "d-leaderboard",
    targetId: "",
    targetTab: "leaderboard",
    title: "Spiritual Hall of Fame 🏆",
    subtitle: "Global Seeker Rankings & Leagues",
    description: "Track your standing among dedicated seekers worldwide. Climb through Bronze, Silver, Gold, and Diamond tiers to claim the revered Habibi King crown.",
    mobileTip: "Earn bonus Hasanat by reading Quran, keeping daily streaks, and completing Tasbih Dhikr.",
    badge: "Hall of Fame • 12/15",
    icon: Trophy,
    preferredPosition: 'center'
  },
  {
    id: "d-hajj-map",
    targetId: "",
    targetTab: "resources",
    extraNav: { resId: 'hajj_umrah' },
    title: "3D Hajj & Umrah Interactive Map 🗺️",
    subtitle: "Explore Makkah, Mina, Arafat & Muzdalifah",
    description: "Interactive sacred pilgrimage map highlighting key historical locations, step-by-step rituals (Tawaf, Sa'i, Jamarat), and custom navigation markers.",
    mobileTip: "Tap any landmark marker on the map to view historical background, Duas, and walking routes.",
    badge: "Pilgrimage Hub • 13/15",
    icon: MapPin,
    preferredPosition: 'center'
  },
  {
    id: "d-profile",
    targetId: "tour-nav-profile",
    targetTab: "profile",
    title: "Pilgrim Passport & Themes 🎨",
    subtitle: "Your Badges, Theme Customizers & Stats",
    description: "View your earned achievements, customize visual color themes (Emerald, Gold, Kaaba Black), manage offline audio caches, and switch languages.",
    mobileTip: "Personalize your app's typography, reciters, and adhan preferences in your profile.",
    badge: "Pilgrim Profile • 14/15",
    icon: User,
    preferredPosition: 'top'
  },
  {
    id: "d-admin-hub",
    targetId: "",
    targetTab: "admin",
    title: "Admin Hub & Telemetry Engine 🛡️",
    subtitle: "Live Telemetry, User Hasanat & Automations",
    description: "Private administrative console featuring interactive time-series charts, Habibi Aliyah query inspector, user Hasanat controls, and background automations.",
    mobileTip: "Equipped with live graphs, real-time query streams, and automated background lifecycle tools.",
    badge: "Admin Hub • 15/15",
    icon: ShieldCheck,
    preferredPosition: 'center'
  }
];

export default function WalkthroughTour({ 
  isOpen, 
  onClose, 
  onNavigate, 
  addHasanat,
  onOpenDrawer,
  isDrawerOpen
}: WalkthroughTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });
  const [isPulsing, setIsPulsing] = useState(false);
  const touchStartX = useRef<number>(0);

  const isMobile = windowDimensions.width < 768;
  const activeSteps = isMobile ? MOBILE_TOUR_STEPS : DESKTOP_TOUR_STEPS;
  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];
  const isLastStep = currentStepIndex === activeSteps.length - 1;

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

  // Sync navigation tab and drawer when step changes
  useEffect(() => {
    if (!isOpen) return;

    // Manage mobile drawer open/close state based on step requirements
    if (isMobile && onOpenDrawer) {
      if (currentStep.requiresDrawerOpen) {
        onOpenDrawer(true);
      } else {
        onOpenDrawer(false);
      }
    }

    if (currentStep.targetTab) {
      onNavigate(currentStep.targetTab, currentStep.extraNav);
    }
  }, [isOpen, currentStepIndex, currentStep, onNavigate, onOpenDrawer, isMobile]);

  // Update target rect based on current step
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen) return;

    if (!currentStep.targetId) {
      setTargetRect(null);
      return;
    }

    const element = document.getElementById(currentStep.targetId);
    if (element) {
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
  }, [isOpen, currentStepIndex, activeSteps]);

  // Mobile Touch Gestures (Swipe left to advance, swipe right to go back)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
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
    if (isMobile && onOpenDrawer) {
      onOpenDrawer(false);
    }
    if (addHasanat) {
      addHasanat(10);
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

  const padding = isMobile ? 6 : 10;
  const spotlightX = targetRect ? Math.max(0, targetRect.left - padding) : 0;
  const spotlightY = targetRect ? Math.max(0, targetRect.top - padding) : 0;
  const spotlightWidth = targetRect ? targetRect.width + padding * 2 : 0;
  const spotlightHeight = targetRect ? targetRect.height + padding * 2 : 0;

  const showAbove = targetRect ? (targetRect.top > windowDimensions.height / 2) : false;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[99990] pointer-events-auto overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* SVG Spotlight Mask with Dark Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.85))' }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect 
                  x={spotlightX} 
                  y={spotlightY} 
                  width={spotlightWidth} 
                  height={spotlightHeight} 
                  rx={isMobile ? 18 : 24} 
                  ry={isMobile ? 18 : 24} 
                  fill="black" 
                  className="transition-all duration-300 ease-out"
                />
              )}
            </mask>
          </defs>
          <rect 
            x="0" 
            y="0" 
            width="100%" 
            height="100%" 
            fill="rgba(0, 0, 0, 0.82)" 
            mask="url(#spotlight-mask)" 
          />
        </svg>

        {/* Pulsing Highlight Target Frame */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: isPulsing ? 1.03 : 1,
              x: spotlightX,
              y: spotlightY,
              width: spotlightWidth,
              height: spotlightHeight
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute pointer-events-none rounded-[1.5rem] border-2 border-brand-primary/80 shadow-[0_0_35px_rgba(168,85,247,0.7)]"
            style={{
              boxShadow: '0 0 0 4px rgba(168,85,247,0.25), 0 0 30px rgba(168,85,247,0.5)'
            }}
          >
            {/* Corner Accent Sparkle */}
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-brand-depth shadow-lg animate-bounce">
              <Sparkles size={12} />
            </div>
          </motion.div>
        )}

        {/* Top Header Bar with Progress Indicator and Exit */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50 pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {isMobile ? 'Mobile Interactive Tour' : 'Sanctuary Interactive Tour'}
              </span>
              <p className="text-[10px] text-brand-primary font-bold">
                Step {currentStepIndex + 1} of {activeSteps.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Skip Tour</span>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Floating Coach-Mark Card */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none z-50">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: showAbove ? -20 : 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: showAbove ? -15 : 15, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto w-full max-w-md bg-gradient-to-b from-brand-sidebar via-brand-depth to-black border-2 border-brand-primary/40 rounded-[2.5rem] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl space-y-6 ${
              targetRect && !isMobile
                ? showAbove ? 'mb-auto mt-24' : 'mt-auto mb-24'
                : ''
            }`}
          >
            {/* Step Header with Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-inner shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                    {currentStep.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                    {currentStep.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Subtitle & Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {currentStep.subtitle}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300/90 font-medium leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Mobile / Interaction Tip Box */}
            <div className="p-3.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-start gap-3">
              <Sparkles size={16} className="text-brand-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-brand-primary/90 font-medium leading-normal">
                {currentStep.mobileTip}
              </p>
            </div>

            {/* Progress Dots Bar */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {activeSteps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => handleJumpToStep(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? 'w-6 bg-brand-primary'
                      : idx < currentStepIndex
                      ? 'w-2 bg-brand-primary/40'
                      : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  title={step.title}
                />
              ))}
            </div>

            {/* Navigation Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-1 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLastStep ? 'Complete (+50 Hasanat)' : 'Next Step'}</span>
                {isLastStep ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
