import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Compass, 
  BookOpen, 
  ShoppingBag, 
  Bookmark, 
  Trophy, 
  User, 
  MessageSquare, 
  Flame, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';

interface PageGuideBannerProps {
  activeTab: string;
}

interface GuideContent {
  title: string;
  subtitle: string;
  icon: any;
  steps: string[];
}

const GUIDES: Record<string, GuideContent> = {
  home: {
    title: "Sanctuary Dashboard",
    subtitle: "Your personal spiritual gateway",
    icon: Flame,
    steps: [
      "Track your Daily Streak in the top hub to maintain consistent habits.",
      "Earn and view your Hasanat Points awarded for reading Quran and performing good deeds.",
      "Check the 'Daily Deed' and 'Daily Hadith' cards for your daily dose of spiritual focus.",
      "Tap the 'Hasanat' badge to learn about your spiritual rank and unlock rewards."
    ]
  },
  resources: {
    title: "Knowledge Conservatory",
    subtitle: "Access sacred Islamic resources",
    icon: BookOpen,
    steps: [
      "Select the Holy Quran to read verses, bookmark ayah, and play beautiful audio recitations.",
      "Open the Hadith Library to search authentic prophetic narrations by topics.",
      "Use Duas & Adhkar to read daily morning/evening supplications. Tap the Speak icon for perfect audio pronunciation.",
      "Access interactive utility tools like Islamic Financial Portfolio calculators and Hajj guides."
    ]
  },
  market: {
    title: "Halal Bazaar",
    subtitle: "Peer-to-peer virtual marketplace",
    icon: ShoppingBag,
    steps: [
      "Explore listed Islamic books, prayer rugs, and unique digital artifacts.",
      "Buy items using virtual Hasanat Points or list your own peer-to-peer items for trade.",
      "Check seller profiles to view trust rating badges and transaction histories."
    ]
  },
  bookmarks: {
    title: "Sacred Bookmarks",
    subtitle: "Your saved verses and reminders",
    icon: Bookmark,
    steps: [
      "Quickly access specific Quranic Ayah you have marked for reflection.",
      "Review your saved Duas, Adhkar, or prophetic wisdom narrations.",
      "Remove bookmarks by clicking the ribbon icon, or click a card to open its source."
    ]
  },
  leaderboard: {
    title: "Ummah Leaderboard",
    subtitle: "Celebrate spiritual progress",
    icon: Trophy,
    steps: [
      "View the most active members of the Sanctuary and celebrate their progress.",
      "See the Hall of Fame for seekers with the highest streaks or most Hasanat points.",
      "Read helpful notes shared by scholars on cultivating genuine sincere worship."
    ]
  },
  profile: {
    title: "Spiritual Profile",
    subtitle: "Personalize your sanctuary",
    icon: User,
    steps: [
      "Customize your Display Name to personalize your daily feed.",
      "Switch between gorgeous themes (Midnight Amethyst, Emerald Breeze, Rose Sanctuary).",
      "Manage account integration settings, language selection, and offline local backups."
    ]
  },
  companion: {
    title: "Aliyah Companion",
    subtitle: "Spiritual AI guidance & counseling",
    icon: Sparkles,
    steps: [
      "Type any theological, historical, or ethical question to chat with Aliyah.",
      "Receive responses with grounded citations from the Holy Quran and Hadiths.",
      "Earn Hasanat points for reading full comprehensive answers and asking meaningful questions."
    ]
  },
  qibla: {
    title: "Interactive Qibla Compass",
    subtitle: "Locate the direction of Kaaba",
    icon: MapPin,
    steps: [
      "Allow browser geolocation permissions to calculate precise coordinates.",
      "Hold your phone/device flat to locate the exact compass bearing towards Makkah.",
      "View distances and coordinates computed in real-time."
    ]
  },
  ummah: {
    title: "NoorTalk Faith Feed",
    subtitle: "Connect and share reflections",
    icon: MessageSquare,
    steps: [
      "Write a Quranic reflection, share spiritual updates, or host public polls.",
      "Double-tap any post image or card to trigger a beautiful Instagram heart-pop like!",
      "Express support or ask for reconsideration on posts to curate beneficial content.",
      "Add comments and reply to community posts to spark polite scholarly discussions."
    ]
  },
  chat: {
    title: "Chat Sanctuary",
    subtitle: "Umbilical community chat channels",
    icon: ShieldCheck,
    steps: [
      "Join Ummah channels to participate in live themed group chats.",
      "Search the user directory to start secure, private one-on-one direct messages.",
      "Manage message requests and maintain kind, helpful, and polite speech."
    ]
  },
  settings: {
    title: "Sanctuary Settings",
    subtitle: "Configure prayer alerts and themes",
    icon: HelpCircle,
    steps: [
      "Set your local city or coordinates to calculate exact Adhan times.",
      "Toggle individual prayer notifications and choose your preferred Adhan voice style.",
      "Manage cloud syncing, privacy controls, and local cache management."
    ]
  }
};

export default function PageGuideBanner({ activeTab }: PageGuideBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check if user previously collapsed/dismissed guide for this page
    const collapsedState = localStorage.getItem(`guide-collapsed-${activeTab}`);
    const dismissedState = localStorage.getItem(`guide-dismissed-${activeTab}`);
    
    setIsCollapsed(collapsedState === 'true');
    setIsDismissed(dismissedState === 'true');
  }, [activeTab]);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(`guide-collapsed-${activeTab}`, String(newState));
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`guide-dismissed-${activeTab}`, 'true');
  };

  const handleReset = () => {
    setIsDismissed(false);
    setIsCollapsed(false);
    localStorage.removeItem(`guide-dismissed-${activeTab}`);
    localStorage.removeItem(`guide-collapsed-${activeTab}`);
  };

  const guide = GUIDES[activeTab] || GUIDES.home;
  const GuideIcon = guide.icon;

  if (isDismissed) {
    return (
      <div className="flex justify-end mb-4 pr-1">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <HelpCircle size={12} className="text-brand-primary" />
          Show Guide
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 relative overflow-hidden rounded-[2rem] border border-brand-primary/10 bg-brand-sidebar/35 backdrop-blur-3xl p-5 md:p-6 space-y-3 shadow-lg"
    >
      {/* Accent Gradient Line */}
      <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-gradient-to-b from-brand-primary via-brand-secondary to-transparent" />

      {/* Title & Controls */}
      <div className="flex items-center justify-between gap-4 pl-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <GuideIcon size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              {guide.title} Walkthrough
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {guide.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleCollapse}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Guide" : "Collapse Guide"}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Dismiss Guide Permanently"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Guide Steps */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pl-2"
          >
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5">
              {guide.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-lg bg-brand-secondary/15 flex items-center justify-center text-[10px] font-bold text-brand-secondary shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
