import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  MessageCircle, 
  ShoppingBag, 
  Compass, 
  Users, 
  User, 
  Award,
  X,
  HelpCircle,
  ArrowRight,
  MapPin,
  Flame,
  Search,
  BookMarked
} from 'lucide-react';

interface WalkthroughTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
  addHasanat: (amount: number) => void;
}

export default function WalkthroughTour({ isOpen, onClose, onNavigate, addHasanat }: WalkthroughTourProps) {
  // Determine current active page based on pathname
  const [currentTab, setCurrentTab] = useState('home');
  const [subTab, setSubTab] = useState<string | null>(null);

  useEffect(() => {
    const handlePathname = () => {
      const path = window.location.pathname.substring(1) || 'home';
      setCurrentTab(path);

      // Detect sub-tab/initialResId from local storage or memory if applicable
      const urlParams = new URLSearchParams(window.location.search);
      const resId = urlParams.get('res') || null;
      setSubTab(resId);
    };

    handlePathname();
    // Listen to route changes (window popstate or custom events)
    window.addEventListener('popstate', handlePathname);
    
    // Set up interval to poll pathname in case SPA router doesn't trigger popstate
    const interval = setInterval(handlePathname, 1000);

    return () => {
      window.removeEventListener('popstate', handlePathname);
      clearInterval(interval);
    };
  }, []);

  // Track claimed rewards per tab to prevent double claiming
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

  // Define dynamic guide content based on the active tab/section
  const getPageGuide = () => {
    switch (currentTab) {
      case 'home':
        return {
          title: "Home Sanctuary 🏡",
          subtitle: "Your Daily Spiritual Launchpad",
          description: "Start every day strong here. Complete holy deeds and check off prayer times to grow your continuous streak.",
          color: "from-indigo-500/20 to-purple-500/20",
          accent: "text-indigo-400",
          border: "border-indigo-500/30",
          bg: "bg-indigo-500/10",
          steps: [
            { id: "h1", text: "Check off a prayer time to keep your streak burning hot! 📅" },
            { id: "h2", text: "Read today's divine Hadith selection in the Daily Deed card. 📖" },
            { id: "h3", text: "View your current Spiritual Level and global Hall of Fame rank. 🏆" }
          ],
          rewardAmount: 25,
          rewardId: "home_deeds"
        };

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
  const isClaimed = claimedRewards[activeGuide.rewardId];

  const handleClaimReward = () => {
    if (!isClaimed) {
      addHasanat(activeGuide.rewardAmount);
      const updated = { ...claimedRewards, [activeGuide.rewardId]: true };
      saveClaimed(updated);
      
      // Dispatch custom audio or visual event for celebratory feedback
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', { 
        detail: { amount: activeGuide.rewardAmount, reason: `${activeGuide.title} Guide completed!` } 
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none flex justify-end items-end md:items-start p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="pointer-events-auto w-full max-w-sm bg-brand-sidebar/95 border border-brand-border rounded-3xl p-5 shadow-2xl backdrop-blur-md overflow-hidden relative"
        >
          {/* Top glow */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${activeGuide.color} opacity-80`} />
          
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
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
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4 text-justify">
            {activeGuide.description}
          </p>

          {/* Page Steps */}
          <div className="space-y-2.5 mb-4">
            {activeGuide.steps.map((step, idx) => (
              <div 
                key={step.id}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0 mt-0.5`}>
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
          <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-widest pt-3 border-t border-white/5">
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
      </div>
    </AnimatePresence>
  );
}
