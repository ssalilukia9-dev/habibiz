import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  MessageCircle, 
  X,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Moon,
  Flame,
  Crown,
  Award,
  BookMarked
} from 'lucide-react';

interface WalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
  addHasanat: (amount: number) => void;
}

const SANCTUARY_STEPS = [
  {
    id: "welcome",
    title: "Welcome, Noble Soul! 🌟",
    desc: "Welcome to your digital Islamic Sanctuary. Let us take a brief interactive tour of your custom-designed spiritual dashboard.",
    elementId: "",
  },
  {
    id: "salam-soul",
    title: "Daily Greetings Banner 🌅",
    desc: "This is your new spiritual command banner. It features daily-changing peaceful greetings, spiritual badges, and quick resumes for your Quran readings.",
    elementId: "tour-salam-soul",
  },
  {
    id: "prayer-console",
    title: "Holy Makkah Prayer Console 🕋",
    desc: "Track live prayer times, view real-time countdowns, configure custom notification alarms, and align your life with the divine schedule.",
    elementId: "tour-prayer-console",
  },
  {
    id: "progress-stats",
    title: "Spiritual Vigor Stats ⚡",
    desc: "Monitor your Quran Verses Read, active Hadith Daily Streak, and track your Level progression up to the ultimate Spiritual Rank.",
    elementId: "tour-progress-stats",
  },
  {
    id: "daily-centerpiece",
    title: "Celestial Centerpiece 📖",
    desc: "Nourish your mind and soul with today's handpicked Quranic verses and prophetic Hadiths, complete with authentic Arabic and English translations.",
    elementId: "tour-daily-centerpiece",
  },
  {
    id: "shortcuts",
    title: "Interactive Instruments 🔮",
    desc: "Quickly access your essential spiritual utilities: Adhkar rosary, Community Leaderboards, the Zakat calculator, and Aliyah—your scripture-guided AI.",
    elementId: "tour-shortcuts",
  }
];

export default function WalkthroughTour({ isOpen, onClose, onNavigate, addHasanat }: WalkthroughTourProps) {
  const [currentTab, setCurrentTab] = useState('home');
  const [currentStep, setCurrentStep] = useState(0);
  const [enableHighlight, setEnableHighlight] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const handlePathname = () => {
      const path = window.location.pathname.substring(1) || 'home';
      setCurrentTab(path);
    };

    handlePathname();
    window.addEventListener('popstate', handlePathname);

    return () => {
      window.removeEventListener('popstate', handlePathname);
    };
  }, [isOpen]);

  // Control highlight classes on the targeted DOM elements
  useEffect(() => {
    if (!isOpen || currentTab !== 'home') {
      SANCTUARY_STEPS.forEach(step => {
        if (step.elementId) {
          const el = document.getElementById(step.elementId);
          if (el) el.classList.remove('tour-highlight');
        }
      });
      return;
    }

    SANCTUARY_STEPS.forEach((step, idx) => {
      if (!step.elementId) return;
      const el = document.getElementById(step.elementId);
      if (!el) return;

      if (idx === currentStep && enableHighlight) {
        el.classList.add('tour-highlight');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        el.classList.remove('tour-highlight');
      }
    });

    return () => {
      SANCTUARY_STEPS.forEach(step => {
        if (step.elementId) {
          const el = document.getElementById(step.elementId);
          if (el) el.classList.remove('tour-highlight');
        }
      });
    };
  }, [isOpen, currentStep, currentTab, enableHighlight]);

  const [claimedRewards, setClaimedRewards] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_claimed_hints');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveClaimed = (updated: Record<string, boolean>) => {
    setClaimedRewards(updated);
    localStorage.setItem('sanctuary_claimed_hints', JSON.stringify(updated));
  };

  const getPageGuide = () => {
    switch (currentTab) {
      case 'resources':
        return {
          title: "The Conservatory 📖",
          subtitle: "Holy Quran & NoorTalk Feed",
          description: "Immerse yourself in deep knowledge or interact with reflections from the global Ummah.",
          color: "from-emerald-500/20 to-teal-500/20",
          accent: "text-emerald-400",
          border: "border-emerald-500/30",
          bg: "bg-emerald-500/10",
          steps: [
            { id: "r1", text: "Scroll Quran Surahs! Look out for the top progress percentage bar. 📊" },
            { id: "r2", text: "Finish reading any Surah (95%+) to claim a premium +150 Hasanat reward! 🌟" },
            { id: "r3", text: "Tap 'NoorTalk Feed' to publish thoughts, comment, or vote on global polls. 💬" }
          ],
          rewardAmount: 30,
          rewardId: "resources_deeds"
        };

      case 'companion':
        return {
          title: "Aliyah AI Companion 🤖",
          subtitle: "Divine Guidance on Demand",
          description: "Aliyah answers using authentic scriptures from the Quran and prophetic Sunnah with deep wisdom.",
          color: "from-pink-500/20 to-rose-500/20",
          accent: "text-pink-400",
          border: "border-pink-500/30",
          bg: "bg-pink-500/10",
          steps: [
            { id: "c1", text: "Ask Aliyah about Islamic history, daily jurisprudence, or moral advice. ✍️" },
            { id: "c2", text: "Keep questions short and direct to receive immediate, concise replies! ⚡" },
            { id: "c3", text: "Use voice microphone mode to comfortably speak your queries. 🎙️" }
          ],
          rewardAmount: 25,
          rewardId: "companion_deeds"
        };

      case 'market':
        return {
          title: "Halal Bazaar 🛍️",
          subtitle: "Spiritual Artifacts & Exchanges",
          description: "Exchange your virtual Hasanat deeds for unique badges and items to showcase on your profile.",
          color: "from-amber-500/20 to-orange-500/20",
          accent: "text-amber-400",
          border: "border-amber-500/30",
          bg: "bg-amber-500/10",
          steps: [
            { id: "m1", text: "Unlock custom ranks and visual labels to adorn your public avatar. 🎖️" },
            { id: "m2", text: "Post spiritual assets for sale to interact with other sellers in the Bazaar. 💼" },
            { id: "m3", text: "Check your transaction logs to trace your purchases and trades. 📊" }
          ],
          rewardAmount: 25,
          rewardId: "market_deeds"
        };

      case 'ummah':
        return {
          title: "Ummah Hub & Guides 🕋",
          subtitle: "Interactive Spiritual Instruments",
          description: "A comprehensive toolbox featuring step-by-step Hajj/Umrah models, Adhkar counters, and calculators.",
          color: "from-violet-500/20 to-fuchsia-500/20",
          accent: "text-violet-400",
          border: "border-violet-500/30",
          bg: "bg-violet-500/10",
          steps: [
            { id: "u1", text: "Play the interactive 3D Hajj Game to simulate active stages of pilgrimage. 🎮" },
            { id: "u2", text: "Calculate exact annual Zakat obligations using the instant financial model. 💰" },
            { id: "u3", text: "Use the live Qibla compass or count custom daily morning/evening Adhkar. 📿" }
          ],
          rewardAmount: 30,
          rewardId: "ummah_deeds"
        };

      case 'profile':
        return {
          title: "Pilgrim Passport 🏆",
          subtitle: "Spiritual Level & Achievements",
          description: "Your passport holds all stats, achievements, streaks, and verified badges.",
          color: "from-blue-500/20 to-cyan-500/20",
          accent: "text-blue-400",
          border: "border-blue-500/30",
          bg: "bg-blue-500/10",
          steps: [
            { id: "p1", text: "Secure your account using Google or GitHub to never lose your Hasanat. 🔐" },
            { id: "p2", text: "Review active daily streaks and your progression towards the next Level. ⚡" },
            { id: "p3", text: "Set custom bio details and display your purchased premium badges. 🎨" }
          ],
          rewardAmount: 25,
          rewardId: "profile_deeds"
        };

      case 'settings':
        return {
          title: "Sanctuary Settings ⚙️",
          subtitle: "Tailor Your Daily Atmosphere",
          description: "Customize your prayer calculation methods, Adhan audios, and offline pre-caching.",
          color: "from-slate-500/20 to-slate-400/20",
          accent: "text-slate-300",
          border: "border-slate-500/30",
          bg: "bg-slate-500/10",
          steps: [
            { id: "s1", text: "Configure prayer offsets and select your preferred Adhan caller. 🔊" },
            { id: "s2", text: "Activate full Offline Pre-Caching to download resources for offline travel. ✈️" },
            { id: "s3", text: "Choose custom calculation methods (e.g. Muslim World League, ISNA). 🌍" }
          ],
          rewardAmount: 20,
          rewardId: "settings_deeds"
        };

      default:
        return {
          title: "Spiritual Sanctuary 🌟",
          subtitle: "Welcome, Noble Pilgrim!",
          description: "Habibi Sanctuary is designed to elevate your daily connection to prayer, knowledge, and community.",
          color: "from-brand-primary/15 to-emerald-500/15",
          accent: "text-brand-primary",
          border: "border-brand-primary/20",
          bg: "bg-brand-primary/10",
          steps: [
            { id: "g1", text: "Earn Hasanat deeds for reading Quran, praying, and saying Tasbih. 📿" },
            { id: "g2", text: "Strengthen your daily habits and review your stats in Pilgrim Passport. 🏆" },
            { id: "g3", text: "Talk to Aliyah AI for authentic, scripture-supported answers. 🤖" }
          ],
          rewardAmount: 15,
          rewardId: "general_deeds"
        };
    }
  };

  const activeGuide = getPageGuide();
  const isClaimed = claimedRewards[activeGuide.rewardId || 'general_deeds'];

  const handleClaimReward = () => {
    const rId = activeGuide.rewardId || 'general_deeds';
    const rAmount = activeGuide.rewardAmount || 15;
    if (!claimedRewards[rId]) {
      addHasanat(rAmount);
      const updated = { ...claimedRewards, [rId]: true };
      saveClaimed(updated);
      
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', { 
        detail: { amount: rAmount, reason: `${activeGuide.title} Guide completed!` } 
      }));
    }
  };

  if (!isOpen) return null;

  const isHomeTour = currentTab === 'home';

  return (
    <AnimatePresence>
      {/* Backdrop overlay for interactive focus */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-[9990] pointer-events-auto"
        />
      )}

      <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4 md:p-6 pointer-events-none">
        {isHomeTour ? (
          /* Sanctuary Dashboard Interactive Onboarding Popup Modal */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="pointer-events-auto w-full max-w-lg bg-brand-sidebar/95 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-3xl backdrop-blur-xl overflow-hidden relative space-y-6"
          >
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-brand-primary to-amber-500 opacity-90" />
            
            {/* Step Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary animate-pulse flex items-center gap-2">
                  <Sparkles size={12} /> Interactive Sanctuary Tour
                </span>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                  {SANCTUARY_STEPS[currentStep].title}
                </h3>
                <p className="text-xs text-slate-500 font-bold tracking-widest">
                  STEP {currentStep + 1} OF {SANCTUARY_STEPS.length}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
              <p className="text-sm text-slate-300 font-medium leading-relaxed">
                {SANCTUARY_STEPS[currentStep].desc}
              </p>
            </div>

            {/* Highlighting controls to easily toggle spotlight focus */}
            <div className="flex items-center justify-between py-2 border-y border-white/5">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Target Element Highlighted</span>
              <button 
                onClick={() => setEnableHighlight(!enableHighlight)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  enableHighlight 
                    ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20" 
                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {enableHighlight ? "Spotlight: Active" : "Spotlight: Skipped"}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={onClose}
                className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}

                {currentStep < SANCTUARY_STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-8 py-4 bg-brand-primary text-brand-depth rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // Award completed reward
                      addHasanat(50);
                      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', { 
                        detail: { amount: 50, reason: "First Sanctuary Tour completed! Noble Soul!" } 
                      }));
                      onClose();
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 animate-bounce"
                  >
                    Complete Tour <CheckCircle2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Corner Walkthrough card for other sections of the app */
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="pointer-events-auto w-full max-w-sm bg-brand-sidebar/95 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md overflow-hidden relative space-y-4"
          >
            {/* Top glow */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeGuide.color} opacity-80`} />
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-500">
                  Al-Murshid Guidance
                </span>
                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mt-0.5">
                  {activeGuide.title}
                </h3>
                <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
                  {activeGuide.subtitle}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all"
                title="Close Guide"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed text-justify">
              {activeGuide.description}
            </p>

            {/* Page Steps */}
            <div className="space-y-2">
              {activeGuide.steps.map((step, idx) => (
                <div 
                  key={step.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider leading-normal">
                    {step.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Reward Section */}
            <div className={`p-3 rounded-2xl border ${activeGuide.border} ${activeGuide.bg} flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shrink-0">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Section Progress
                  </p>
                  <p className="text-xs font-black text-white uppercase tracking-tighter">
                    {isClaimed ? "Rewarded & Read!" : "Complete Section"}
                  </p>
                </div>
              </div>

              {isClaimed ? (
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1.5 rounded-full border border-emerald-500/20">
                  Claimed ✓
                </span>
              ) : (
                <button
                  onClick={handleClaimReward}
                  className="px-3 py-1.5 rounded-xl bg-brand-primary text-brand-depth text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-primary/10"
                >
                  Claim +{activeGuide.rewardAmount}
                </button>
              )}
            </div>

            {/* Quick Nav Suggestion */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest pt-3 border-t border-white/5">
              <span>Explore Sanctuary</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => onNavigate('home')}
                  className="hover:text-brand-primary transition-colors"
                >
                  Home
                </button>
                <span>•</span>
                <button 
                  onClick={() => onNavigate('resources')}
                  className="hover:text-brand-primary transition-colors"
                >
                  Quran
                </button>
                <span>•</span>
                <button 
                  onClick={() => onNavigate('companion')}
                  className="hover:text-brand-primary transition-colors"
                >
                  AI Companion
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
