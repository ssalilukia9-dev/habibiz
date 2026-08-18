import { useState, useEffect, useRef, useCallback } from 'react';
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
  Play
} from 'lucide-react';

interface WalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
  addHasanat?: (amount: number) => void;
}

interface TourStep {
  id: string;
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: any;
  preferredPosition?: 'top' | 'bottom' | 'center';
  fallbackTab?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    targetId: "",
    title: "Welcome to Habibi Sanctuary 🌟",
    subtitle: "Your Digital Spiritual Companion",
    description: "Take a 60-second guided tour of your bespoke Islamic Sanctuary. We'll highlight the essential buttons, prayer instruments, AI counselor, and community hubs.",
    badge: "Sanctuary Onboarding",
    icon: Sparkles,
    preferredPosition: 'center'
  },
  {
    id: "salam-banner",
    targetId: "tour-salam-soul",
    title: "Daily Sanctuary Banner 🌅",
    subtitle: "Daily Serenity & Quick Resume",
    description: "Your daily spiritual header updates every morning with inspiring quotes, Hijri reminders, and a one-click button to resume your exact Quran reading progress.",
    badge: "Daily Inspiration",
    icon: Flame,
    preferredPosition: 'bottom',
    fallbackTab: 'home'
  },
  {
    id: "prayer-console",
    targetId: "tour-prayer-console",
    title: "Holy Makkah Prayer Console 🕋",
    subtitle: "Live Adhan & Dynamic Countdown",
    description: "Tracks exact prayer times with a live animated countdown ring, automatic geographic coordinates, and customizable Adhan alerts with authentic audio recitations.",
    badge: "Salah Precision",
    icon: Moon,
    preferredPosition: 'top',
    fallbackTab: 'home'
  },
  {
    id: "progress-stats",
    targetId: "tour-progress-stats",
    title: "Spiritual Vigor & Streaks ⚡",
    subtitle: "Track Hasanat, Verses & Levels",
    description: "Every verse you read, daily Hadith you study, and Dhikr you complete awards Hasanat deeds to ascend through spiritual ranks from Seeker up to Legacy of Light.",
    badge: "Spiritual Growth",
    icon: Crown,
    preferredPosition: 'top',
    fallbackTab: 'home'
  },
  {
    id: "daily-centerpiece",
    targetId: "tour-daily-centerpiece",
    title: "Celestial Daily Centerpiece 📖",
    subtitle: "Quranic Verses & Prophetic Hadiths",
    description: "Reflect upon hand-curated Quranic verses and authentic prophetic narrations complete with clear Arabic script and English translations.",
    badge: "Sacred Wisdom",
    icon: BookOpen,
    preferredPosition: 'top',
    fallbackTab: 'home'
  },
  {
    id: "shortcuts",
    targetId: "tour-shortcuts",
    title: "Quick Action Instruments 🔮",
    subtitle: "Adhkar, Rankings & Pilgrimage",
    description: "Instant access to your daily morning/evening Adhkar rosary, Community Leaderboards, 3D interactive Hajj/Umrah simulation, and Aliyah AI.",
    badge: "Smart Utilities",
    icon: Zap,
    preferredPosition: 'top',
    fallbackTab: 'home'
  },
  {
    id: "nav-resources",
    targetId: "tour-nav-resources",
    title: "Quran & Sacred Adhkar 📚",
    subtitle: "Full Surahs, Translations & Audios",
    description: "Tap this button on mobile or desktop to open the 114 Surahs of the Holy Quran, Hadith collections, and rich daily supplications.",
    badge: "Knowledge Conservatory",
    icon: BookOpen,
    preferredPosition: 'top'
  },
  {
    id: "nav-qibla",
    targetId: "tour-nav-qibla",
    title: "Qibla Compass & Prayer Times 🧭",
    subtitle: "Real-time Direction to Makkah",
    description: "Tap to launch the responsive 3D Qibla Compass, prayer calculation settings, and audio caller configurations.",
    badge: "Sacred Direction",
    icon: Compass,
    preferredPosition: 'top'
  },
  {
    id: "nav-companion",
    targetId: "tour-nav-companion",
    title: "Aliyah AI Spiritual Counselor 🤖",
    subtitle: "Scripture-Grounded Islamic AI",
    description: "Consult Aliyah anytime for answers grounded directly in authentic Quranic verses and verified Hadith narrations with voice synthesis.",
    badge: "Divine AI Guide",
    icon: MessageCircle,
    preferredPosition: 'top'
  },
  {
    id: "nav-ummah",
    targetId: "tour-nav-ummah",
    title: "Ummah Hub & Faith Feed 🤝",
    subtitle: "Community Reflections & Chat",
    description: "Connect with brothers and sisters globally, share reflections on the NoorTalk feed, participate in polls, and join live themed chat rooms.",
    badge: "Global Ummah",
    icon: Users,
    preferredPosition: 'top'
  },
  {
    id: "nav-profile",
    targetId: "tour-nav-profile",
    title: "Pilgrim Passport & Admin 🏆",
    subtitle: "Your Badges, Stats & Settings",
    description: "View your earned achievements, customize visual color themes, manage offline caches, and access the Admin Governance Hub.",
    badge: "Pilgrim Profile",
    icon: User,
    preferredPosition: 'top'
  }
];

export default function WalkthroughTour({ isOpen, onClose, onNavigate, addHasanat }: WalkthroughTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isPulsing, setIsPulsing] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

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
      
      // Delay rect read slightly to allow smooth scroll to settle
      const timeout = setTimeout(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }, 150);

      return () => clearTimeout(timeout);
    } else {
      // If target is in another tab, try to navigate if needed
      if (currentStep.fallbackTab && window.location.pathname !== `/${currentStep.fallbackTab}`) {
        onNavigate(currentStep.fallbackTab);
      }
      setTargetRect(null);
    }
  }, [isOpen, currentStep, onNavigate]);

  useEffect(() => {
    updateSpotlightPosition();
    const interval = setInterval(updateSpotlightPosition, 400);
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

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
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
    setTimeout(() => setIsPulsing(false), 800);
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
  const padding = 10;
  const spotlightX = targetRect ? targetRect.left - padding : 0;
  const spotlightY = targetRect ? targetRect.top - padding : 0;
  const spotlightWidth = targetRect ? targetRect.width + padding * 2 : 0;
  const spotlightHeight = targetRect ? targetRect.height + padding * 2 : 0;

  // Decide if coach mark tooltip should be above or below target
  const isMobile = windowDimensions.width < 768;
  const showAbove = targetRect ? (targetRect.top > windowDimensions.height / 2) : false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99990] pointer-events-auto overflow-hidden">
        {/* SVG Spotlight Mask with Pitch Dark Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ease-out"
          style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.8))' }}
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
                  rx="24"
                  ry="24"
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
            fill="rgba(5, 5, 8, 0.85)" 
            mask="url(#spotlight-mask)"
            className="pointer-events-auto"
            onClick={handleNext}
          />
        </svg>

        {/* Dynamic Glowing Spotlight Focus Ring around target element */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: isPulsing ? 1.05 : 1,
              x: spotlightX,
              y: spotlightY,
              width: spotlightWidth,
              height: spotlightHeight
            }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute pointer-events-none rounded-[24px] border-2 border-brand-primary shadow-[0_0_40px_rgba(16,185,129,0.5)] z-[99992]"
          >
            {/* Coach mark corner reticles */}
            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl-lg" />
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr-lg" />
            <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl-lg" />
            <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-white rounded-br-lg" />

            {/* Glowing beacon pulse ring */}
            <div className="absolute inset-0 rounded-[24px] border border-brand-primary animate-ping opacity-60 pointer-events-none" />

            {/* Target Label pill */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-primary text-brand-depth font-black text-[9px] uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap flex items-center gap-1.5"
            >
              <LocateFixed size={10} className="animate-spin" />
              <span>Target Focused</span>
            </motion.div>
          </motion.div>
        )}

        {/* Coach Mark / Walkthrough Tooltip Card */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none z-[99995]">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.9, y: showAbove ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto w-full max-w-lg bg-brand-sidebar/95 backdrop-blur-2xl border border-brand-primary/30 rounded-[2.5rem] p-6 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-6 ${
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 shadow-lg shadow-brand-primary/10">
                  <Icon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-brand-primary">
                      {currentStep.badge}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">•</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {currentStepIndex + 1} / {TOUR_STEPS.length}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tight mt-0.5">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                title="Exit Tour"
              >
                <X size={16} />
              </button>
            </div>

            {/* Subtitle & Description */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {currentStep.subtitle}
              </h4>
              <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <span>Sanctuary Walkthrough Progress</span>
                <span className="text-brand-primary font-mono font-bold">
                  {Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-brand-primary to-amber-400 rounded-full"
                />
              </div>
            </div>

            {/* Interactive Step Navigation Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={handleFinish}
                className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors py-2"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-3">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}

                {isLastStep ? (
                  <button
                    onClick={handleFinish}
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer animate-bounce"
                  >
                    Complete (+50 Hasanat) <CheckCircle2 size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-7 py-3.5 rounded-2xl bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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
