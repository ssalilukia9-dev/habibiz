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
  Bell,
  Heart,
  Target,
  Palette,
  Volume2,
  Baby
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

// 📱 COMPREHENSIVE MOBILE TOUR STEPS (Covers Every Page, Mobile Drawer & Interactive Tools)
export const MOBILE_TOUR_STEPS: TourStep[] = [
  {
    id: "m-welcome",
    targetId: "tour-salam-soul",
    targetTab: "home",
    title: "Welcome to Sanctuary 🌟",
    subtitle: "Your Mobile Spiritual Haven",
    description: "Assalamu Alaikum! Sanctuary is your digital home for daily worship—precise prayer calculations, Holy Quran recitations, Tahajjud vigil alarms, and AI companion Habibi Aliyah.",
    mobileTip: "Swipe left or tap 'Next' to tour every console, page, and sacred feature across the app.",
    badge: "Overview • 1/17",
    icon: Smartphone,
    preferredPosition: 'center'
  },
  {
    id: "m-drawer",
    targetId: "tour-mobile-drawer-content",
    targetTab: "home",
    requiresDrawerOpen: true,
    title: "Navigation Drawer & Directory 📋",
    subtitle: "All Sacred Features in One Place",
    description: "Open the menu drawer anytime to reach Quran, Hadith, Marriage Duas, Islamic Baby Names, 99 Names of Allah, Zakat, 3D Qibla, Atmosphere Studio, and community sponsors.",
    mobileTip: "Tap the top-left hamburger menu to open this full directory from any screen.",
    badge: "Navigation • 2/17",
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
    description: "Updates daily with uplifting Islamic quotes, current Hijri date, and a one-tap button to resume reading your exact Quran verse progress.",
    mobileTip: "Tap 'Resume' on the home banner anytime to jump straight into your last recited Ayah.",
    badge: "Home Hub • 3/17",
    icon: Flame,
    preferredPosition: 'bottom'
  },
  {
    id: "m-prayer-console",
    targetId: "tour-prayer-console",
    targetTab: "home",
    title: "Prayer Times & Sacred Adhans 🕋",
    subtitle: "GPS Calculations & Live Countdown",
    description: "Calculates precise prayer times for your exact coordinates. Choose beautiful Adhan voices from Makkah, Madinah, Al-Aqsa, and Cairo.",
    mobileTip: "Receive full Adhan notifications and audio calls even when your phone is locked.",
    badge: "Salah Precision • 4/17",
    icon: Moon,
    preferredPosition: 'top'
  },
  {
    id: "m-tahajjud-vigil",
    targetId: "tour-prayer-console",
    targetTab: "home",
    title: "Tahajjud Vigil & Night Alarms 🌌",
    subtitle: "Last 1/3 of the Night Calculations",
    description: "Automatically computes the blessed last third of the night. Features soothing wake-up chimes (Noor Chime, Madinah Melody) and Tahajjud Duas.",
    mobileTip: "Tap the Bell on the prayer console to set your wake window (30m, 45m, or 60m before Fajr).",
    badge: "Night Vigil • 5/17",
    icon: Bell,
    preferredPosition: 'top'
  },
  {
    id: "m-quran-conservatory",
    targetId: "tour-resource-quran",
    targetTab: "resources",
    extraNav: { resId: 'quran' },
    title: "Holy Quran Conservatory 📚",
    subtitle: "114 Surahs, 30 Juz & Audio Recitations",
    description: "Read the entire Holy Quran in pristine Uthmani script. Listen to Alafasy, Sudais, and Minshawi with persistent background audio player bar.",
    mobileTip: "Quran audio continues playing smoothly as you navigate anywhere in the app.",
    badge: "Holy Quran • 6/17",
    icon: BookOpen,
    preferredPosition: 'center'
  },
  {
    id: "m-marriage-duas",
    targetId: "tour-resource-marriage_duas",
    targetTab: "resources",
    extraNav: { resId: 'marriage_duas' },
    title: "Marriage & Spousal Duas Hub 💍",
    subtitle: "Authentic Quran & Hadith Supplications",
    description: "Dedicated supplications for seeking a righteous spouse, easing marriage arrangements, and fostering peace, affection, and mercy between married couples.",
    mobileTip: "Includes interactive Tasbih counters, phonetic transliteration, and audio pronunciation.",
    badge: "Dua Categories • 7/17",
    icon: Heart,
    preferredPosition: 'center'
  },
  {
    id: "m-hadith-library",
    targetId: "tour-resource-hadith",
    targetTab: "resources",
    extraNav: { resId: 'hadith' },
    title: "Hadith Library & Sunnah Gems 📜",
    subtitle: "Sahih Bukhari, Muslim & Tirmidhi",
    description: "Explore thousands of authentic Prophetic narrations. Search by keyword, browse verified chapters, and generate shareable Hadith cards.",
    mobileTip: "Copy and share authentic Hadiths with family and friends in one tap.",
    badge: "Sunnah Library • 8/17",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  {
    id: "m-baby-names",
    targetId: "tour-babynames-container",
    targetTab: "babynames",
    title: "Islamic Baby Names & Meanings 👶",
    subtitle: "Thousands of Boy & Girl Names",
    description: "Search comprehensive collections of beautiful Muslim boy and girl names with authentic Arabic root definitions, origins, and spiritual meanings.",
    mobileTip: "Bookmark favorite names and share spiritual meanings directly with family.",
    badge: "Baby Names • 9/17",
    icon: Baby,
    preferredPosition: 'center'
  },
  {
    id: "m-qibla-compass",
    targetId: "tour-qibla-container",
    targetTab: "qibla",
    title: "3D Qibla Compass & Kaaba Pointer 🧭",
    subtitle: "GPS Kaaba Direction & Degrees",
    description: "Interactive visual compass accurately pointing to the Holy Kaaba in Makkah with real-time distance and degree readings.",
    mobileTip: "Hold your device flat to calibrate and align towards the Qibla anywhere on earth.",
    badge: "Qibla Direction • 10/17",
    icon: Compass,
    preferredPosition: 'center'
  },
  {
    id: "m-khatam-journey",
    targetId: "tour-khatam-container",
    targetTab: "khatam",
    title: "Khatam Journey & Memorisation 🎯",
    subtitle: "Track 30-Day Quran Reading Plans",
    description: "Set and achieve your Quran completion goals with daily targets, streak trackers, and interactive ayah-by-ayah memorisation tools.",
    mobileTip: "Customize your target completion date to receive balanced daily reading milestones.",
    badge: "Khatam Hub • 11/17",
    icon: Target,
    preferredPosition: 'center'
  },
  {
    id: "m-habibi-aliyah",
    targetId: "tour-companion-container",
    targetTab: "companion",
    title: "Habibi Aliyah AI Companion ✨",
    subtitle: "Scripture-Grounded Islamic Guidance",
    description: "Ask Habibi Aliyah questions on Salah rulings, Fiqh, Quranic reflections, and authentic Duas. Fully backed by Quran and Hadith citations with authentic Islamic speech voice.",
    mobileTip: "Type or use voice speech-to-text to ask questions and receive compassionate advice.",
    badge: "Habibi Aliyah • 12/17",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  {
    id: "m-ummah-hub",
    targetId: "tour-ummah-container",
    targetTab: "ummah",
    title: "Global Ummah Hub & NoorTalk 🤝",
    subtitle: "Friend Requests & Live Habibi Chat",
    description: "Connect with brothers and sisters worldwide. Send and accept real-time friend requests, chat in private direct rooms, and share spiritual reflections on NoorTalk.",
    mobileTip: "Accept incoming friend requests with 1-tap to start instant direct messaging.",
    badge: "Global Ummah • 13/17",
    icon: Users,
    preferredPosition: 'center'
  },
  {
    id: "m-halal-market",
    targetId: "tour-market-container",
    targetTab: "market",
    title: "Sanctuary Halal Market 🛍️",
    subtitle: "Islamic Timepieces & Waqf Goods",
    description: "Curated spiritual artifacts, luxury prayer mats, authentic timepieces from ISIS WRISTS, halal goods, and waqf charity contributions.",
    mobileTip: "Discover verified vendors, Islamic timepieces, and waqf charity initiatives.",
    badge: "Halal Market • 14/17",
    icon: ShoppingBag,
    preferredPosition: 'center'
  },
  {
    id: "m-leaderboard",
    targetId: "tour-leaderboard-container",
    targetTab: "leaderboard",
    title: "Spiritual Hall of Fame 🏆",
    subtitle: "Global Rankings & Hasanat Streaks",
    description: "Climb through Bronze, Silver, Gold, and Diamond tiers by reciting verses, learning Hadiths, and completing daily Dhikr to earn the Habibi King crown.",
    mobileTip: "Maintain daily consistency to keep your fiery streak burning and advance ranks.",
    badge: "Hall of Fame • 15/17",
    icon: Trophy,
    preferredPosition: 'center'
  },
  {
    id: "m-profile-themes",
    targetId: "tour-profile-container",
    targetTab: "profile",
    title: "Pilgrim Passport & Themes 🎨",
    subtitle: "Custom Themes, Offline Caches & Audio",
    description: "Personalize your sanctuary with themes (Kaaba Gold, Royal Emerald, Midnight Noor), manage offline recitations, and switch languages.",
    mobileTip: "Customize your reciters, typography sizes, and visual palette in Profile settings.",
    badge: "Passport • 16/17",
    icon: Palette,
    preferredPosition: 'center'
  },
  {
    id: "m-mobile-dock",
    targetId: "tour-mobile-dock",
    targetTab: "home",
    title: "Floating Bottom Navigation Dock 📱",
    subtitle: "Fast 1-Thumb Switching Anywhere",
    description: "The sleek bottom navigation bar keeps Home, Resources, Market, Habibi Aliyah, Ummah Hub, and Profile right at your fingertips.",
    mobileTip: "You're all set! Enjoy your spiritual journey with Habibi Sanctuary.",
    badge: "Quick Switch • 17/17",
    icon: Smartphone,
    preferredPosition: 'top'
  }
];

// 💻 DESKTOP TOUR STEPS (Focuses on Desktop Side Rail, Banners, Consoles & Directory)
export const DESKTOP_TOUR_STEPS: TourStep[] = [
  {
    id: "d-welcome",
    targetId: "tour-salam-soul",
    targetTab: "home",
    title: "Welcome to Sanctuary 🌟",
    subtitle: "Your Comprehensive Islamic Sanctuary",
    description: "Assalamu Alaikum! Sanctuary is your all-in-one digital sanctuary for daily worship, Holy Quran recitations, prayer precision, and spiritual growth.",
    mobileTip: "Use arrow keys or click 'Next' to tour each console and feature.",
    badge: "Sanctuary Tour • 1/17",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  {
    id: "d-rail",
    targetId: "tour-desktop-rail",
    targetTab: "home",
    title: "Fixed Navigation Rail 🚀",
    subtitle: "Glued to Screen with Instant Access",
    description: "The persistent sidebar rail is fixed to the screen edge for fast one-click access across Home, Resources, Market, Habibi Aliyah, Ummah, Hall of Fame, and Profile.",
    mobileTip: "Hover over any icon to view quick tooltips and keyboard shortcuts.",
    badge: "Navigation Rail • 2/17",
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
    badge: "Home Hub • 3/17",
    icon: Flame,
    preferredPosition: 'bottom'
  },
  {
    id: "d-prayer-console",
    targetId: "tour-prayer-console",
    targetTab: "home",
    title: "Prayer Console & Adhan 🕋",
    subtitle: "Real-time Countdown & Sacred Callers",
    description: "Calculates precise prayer times via GPS with an animated live countdown ring. Configure Adhan callers from Makkah, Madinah, Al-Aqsa, and Cairo.",
    mobileTip: "Receive full Adhan audio notifications with custom adhan caller selection.",
    badge: "Salah Precision • 4/17",
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
    badge: "Spiritual Growth • 5/17",
    icon: Crown,
    preferredPosition: 'top'
  },
  {
    id: "d-resources-quran",
    targetId: "tour-resource-quran",
    targetTab: "resources",
    extraNav: { resId: 'quran' },
    title: "Holy Quran Conservatory 📚",
    subtitle: "114 Surahs, 30 Juz & Audio Recitations",
    description: "Read the entire Holy Quran in pristine Uthmani typography. Listen to Alafasy, Sudais, and Minshawi with persistent background audio player.",
    mobileTip: "Supports page-by-page Mushaf reader, search by Ayah or keyword, and offline audio downloads.",
    badge: "Holy Quran • 6/17",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  {
    id: "d-marriage-duas",
    targetId: "tour-resource-marriage_duas",
    targetTab: "resources",
    extraNav: { resId: 'marriage_duas' },
    title: "Marriage & Spousal Duas 💍",
    subtitle: "Supplications for Spouse & Family Peace",
    description: "Curated Quranic and Hadith supplications for finding a righteous spouse, easing marital search, and creating deep peace and affection in marriage.",
    mobileTip: "Features interactive counters, Arabic audio pronunciation, and Hadith references.",
    badge: "Dua Categories • 7/17",
    icon: Heart,
    preferredPosition: 'top'
  },
  {
    id: "d-hadith",
    targetId: "tour-resource-hadith",
    targetTab: "resources",
    extraNav: { resId: 'hadith' },
    title: "Hadith Library & Sunnah Collections 📜",
    subtitle: "Sahih Bukhari, Muslim, Tirmidhi & Abu Dawud",
    description: "Search and read thousands of authentic Hadiths with scholarly commentary, topics, and one-click sharing.",
    mobileTip: "Easily search hadiths by topic (Charity, Prayer, Character, Marriage, Patience).",
    badge: "Sunnah Hub • 8/17",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  {
    id: "d-baby-names",
    targetId: "tour-babynames-container",
    targetTab: "babynames",
    title: "Islamic Baby Names & Meanings 👶",
    subtitle: "Comprehensive Boy & Girl Names Directory",
    description: "Search thousands of authentic Muslim boy and girl names with Arabic root origins, spiritual significance, and pronunciation guides.",
    mobileTip: "Search by letter, origin, or meaning and save favorite names to your passport.",
    badge: "Baby Names • 9/17",
    icon: Baby,
    preferredPosition: 'center'
  },
  {
    id: "d-qibla",
    targetId: "tour-qibla-container",
    targetTab: "qibla",
    title: "3D Qibla Compass & Kaaba Pointer 🧭",
    subtitle: "Accurate GPS Kaaba Compass",
    description: "3D visual compass pointing accurately towards the Sacred Kaaba in Makkah with real-time degrees and live coordinates.",
    mobileTip: "Real-time heading calculations ensuring accurate prayer direction anywhere.",
    badge: "Qibla Compass • 10/17",
    icon: Compass,
    preferredPosition: 'center'
  },
  {
    id: "d-khatam",
    targetId: "tour-khatam-container",
    targetTab: "khatam",
    title: "Khatam Journey & Memorisation 🎯",
    subtitle: "30-Day Quran Reading Plans & Hifz",
    description: "Plan your Khatam milestones, track daily Surah targets, and test your memory with interactive ayah memorisation.",
    mobileTip: "Set your Ramadan or monthly Khatam goal and track daily completed pages.",
    badge: "Khatam Journey • 11/17",
    icon: Target,
    preferredPosition: 'center'
  },
  {
    id: "d-companion",
    targetId: "tour-companion-container",
    targetTab: "companion",
    title: "Habibi Aliyah AI Companion ✨",
    subtitle: "Scripture-Grounded Islamic Guidance",
    description: "Consult Habibi Aliyah anytime on Salah rulings, Fiqh questions, Quranic reflections, and authentic Duas with instant Quran & Hadith citations and Islamic speech audio.",
    mobileTip: "Type or use voice search to receive prompt, verified Islamic answers.",
    badge: "Habibi Aliyah • 12/17",
    icon: Sparkles,
    preferredPosition: 'top'
  },
  {
    id: "d-ummah",
    targetId: "tour-ummah-container",
    targetTab: "ummah",
    title: "Global Ummah Hub & NoorTalk 🤝",
    subtitle: "Community Reflections, Friend Requests & Chat",
    description: "Connect with Muslims globally. Send and accept friend requests, chat in real-time direct rooms, share reflections on NoorTalk, and participate in community group Duas.",
    mobileTip: "Connect with dedicated seekers worldwide and share barakah.",
    badge: "Global Ummah • 13/17",
    icon: Users,
    preferredPosition: 'top'
  },
  {
    id: "d-market",
    targetId: "tour-market-container",
    targetTab: "market",
    title: "Sanctuary Halal Market 🛍️",
    subtitle: "Islamic Timepieces & Waqf Goods",
    description: "Explore curated spiritual artifacts, luxury prayer mats, authentic timepieces from ISIS WRISTS, halal goods, and waqf contributions.",
    mobileTip: "Browse verified vendors, Islamic timepieces from ISIS WRISTS, and community offerings.",
    badge: "Halal Market • 14/17",
    icon: ShoppingBag,
    preferredPosition: 'top'
  },
  {
    id: "d-leaderboard",
    targetId: "tour-leaderboard-container",
    targetTab: "leaderboard",
    title: "Spiritual Hall of Fame 🏆",
    subtitle: "Global Seeker Rankings & Leagues",
    description: "Track your standing among dedicated seekers worldwide. Climb through Bronze, Silver, Gold, and Diamond tiers to claim the revered Habibi King crown.",
    mobileTip: "Earn bonus Hasanat by reading Quran, keeping daily streaks, and completing Tasbih Dhikr.",
    badge: "Hall of Fame • 15/17",
    icon: Trophy,
    preferredPosition: 'center'
  },
  {
    id: "d-profile",
    targetId: "tour-profile-container",
    targetTab: "profile",
    title: "Pilgrim Passport & Themes 🎨",
    subtitle: "Theme Customizers, Badges & Audio",
    description: "View your earned achievements, customize visual color themes (Emerald, Gold, Kaaba Black), manage offline audio caches, and switch languages.",
    mobileTip: "Personalize your app's typography, reciters, and adhan preferences in your profile.",
    badge: "Pilgrim Profile • 16/17",
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
    badge: "Admin Hub • 17/17",
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
  const touchStartY = useRef<number>(0);

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

  // Update target rect based on current step with fallback resolution and smooth scrolling
  const updateSpotlightPosition = useCallback(() => {
    if (!isOpen) return;

    let element: HTMLElement | null = null;

    if (currentStep.targetId) {
      element = document.getElementById(currentStep.targetId);
    }

    // Fallbacks if primary target ID not yet mounted or not found
    if (!element && currentStep.targetTab) {
      element = document.getElementById(`tour-${currentStep.targetTab}-container`) ||
                document.getElementById(`tour-nav-${currentStep.targetTab}`);
    }

    if (!element && isMobile && currentStep.requiresDrawerOpen) {
      element = document.getElementById("tour-mobile-drawer-content");
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      // Only spotlight if element has meaningful dimension and is visible
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep, isMobile]);

  // Scroll element into view smoothly on step change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      let element: HTMLElement | null = null;
      if (currentStep.targetId) {
        element = document.getElementById(currentStep.targetId);
      }
      if (!element && currentStep.targetTab) {
        element = document.getElementById(`tour-${currentStep.targetTab}-container`) ||
                  document.getElementById(`tour-nav-${currentStep.targetTab}`);
      }
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex, currentStep]);

  useEffect(() => {
    updateSpotlightPosition();
    const interval = setInterval(updateSpotlightPosition, 300);
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
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Only trigger horizontal swipe if movement is primarily horizontal
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const handleNext = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch {}
    }
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      triggerPulse();
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(15); } catch {}
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      triggerPulse();
    }
  };

  const triggerPulse = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
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
      addHasanat(50);
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', { 
        detail: { amount: 50, reason: "Sanctuary Tour Completed! +50 Hasanat!" } 
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
                  rx={isMobile ? 16 : 22} 
                  ry={isMobile ? 16 : 22} 
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

        {/* Pulsing Highlight Target Frame with Corner Accents & Badge */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: isPulsing ? 1.02 : 1,
              x: spotlightX,
              y: spotlightY,
              width: spotlightWidth,
              height: spotlightHeight
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute pointer-events-none rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-brand-primary shadow-[0_0_35px_rgba(212,175,55,0.7)]"
            style={{
              boxShadow: '0 0 0 4px rgba(212,175,55,0.3), 0 0 35px rgba(212,175,55,0.6)'
            }}
          >
            {/* Top Tag / Focus Beacon */}
            <div className="absolute -top-3.5 left-4 px-2.5 py-0.5 rounded-full bg-black/90 border border-brand-primary/80 flex items-center gap-1.5 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-wider text-brand-primary">
                Active Focus
              </span>
            </div>

            {/* Corner Accent Sparkle */}
            <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-brand-depth shadow-lg animate-bounce">
              <Sparkles size={13} />
            </div>

            {/* 4 Corner High-Tech Brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/80 rounded-tl" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white/80 rounded-tr" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white/80 rounded-bl" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/80 rounded-br" />
          </motion.div>
        )}

        {/* Top Header Bar with Progress Indicator and Exit */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex items-center justify-between z-50 pointer-events-auto bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
              <Sparkles size={14} className="sm:text-base" />
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                {isMobile ? 'Mobile Sanctuary Tour' : 'Sanctuary Tour'}
              </span>
              <p className="text-[9px] sm:text-[10px] text-brand-primary font-bold">
                Step {currentStepIndex + 1} of {activeSteps.length}
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 min-h-[36px]"
          >
            <span>Skip</span>
            <X size={13} />
          </button>
        </div>

        {/* Floating Coach-Mark Card with Dynamic Placement to never obstruct spotlight */}
        <div className={`absolute inset-0 flex p-3.5 sm:p-6 pointer-events-none z-50 ${
          isMobile
            ? targetRect
              ? (targetRect.top + targetRect.height / 2 < windowDimensions.height * 0.48)
                ? 'flex-col justify-end pb-16 pt-2 items-center'
                : 'flex-col justify-start pt-14 pb-2 items-center'
              : 'items-center justify-center'
            : 'items-center justify-center'
        }`}>
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: isMobile ? 12 : (showAbove ? -20 : 20), scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? 8 : (showAbove ? -15 : 15), scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto w-[92vw] sm:w-full max-w-lg bg-gradient-to-b from-[#191428] via-[#0f111a] to-black border-2 border-brand-primary/40 rounded-[1.75rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 shadow-[0_0_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col justify-between max-h-[85dvh] sm:max-h-[82vh] overflow-hidden ${
              targetRect && !isMobile
                ? showAbove ? 'mb-auto mt-20' : 'mt-auto mb-20'
                : ''
            }`}
          >
            {/* Scrollable Content Container */}
            <div className="overflow-y-auto scrollbar-hide space-y-2.5 sm:space-y-4 pr-0.5 max-h-[48dvh] sm:max-h-[50vh]">
              {/* Step Header with Badge & Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary shadow-inner shrink-0">
                    <Icon size={isMobile ? 20 : 24} />
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-primary px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20">
                      {currentStep.badge}
                    </span>
                    <h3 className="text-base sm:text-2xl font-black text-white tracking-tight mt-0.5 leading-tight">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Subtitle & Description */}
              <div className="space-y-1">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                  {currentStep.subtitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300/90 font-normal leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Mobile / Interaction Tip Box */}
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-start gap-2">
                <Sparkles size={14} className="text-brand-primary shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-[11px] text-brand-primary/95 font-medium leading-normal">
                  {currentStep.mobileTip}
                </p>
              </div>
            </div>

            {/* Bottom Actions & Progress Dots (Fixed inside Card) */}
            <div className="pt-3 sm:pt-4 border-t border-white/5 space-y-2.5 shrink-0 mt-2">
              {/* Progress Dots Bar */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5 py-0.5 overflow-x-auto scrollbar-hide max-w-full">
                {activeSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => handleJumpToStep(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-5 sm:w-6 bg-brand-primary'
                        : idx < currentStepIndex
                        ? 'w-1.5 sm:w-2 bg-brand-primary/40'
                        : 'w-1 sm:w-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                    title={step.title}
                  />
                ))}
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:hover:bg-white/5 font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                >
                  <ArrowLeft size={15} />
                  <span className="text-[11px] sm:text-xs">Back</span>
                </button>

                <button
                  onClick={handleNext}
                  className="flex-1 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-primary/25 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <span className="text-[11px] sm:text-xs">{isLastStep ? 'Complete (+50 Hasanat)' : 'Next Step'}</span>
                  {isLastStep ? <CheckCircle2 size={15} /> : <ArrowRight size={15} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
