import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Library, 
  BookOpen,
  Users,
  Compass,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  History,
  Calculator,
  Baby,
  Gamepad2,
  Clock,
  Moon,
  Star,
  MapPin,
  GraduationCap,
  Eye,
  Brain,
  ShoppingBag,
  Gem,
  BarChart3,
  CalendarDays,
  MessageCircle,
  Zap,
  Smartphone,
  Activity,
  Share2,
  Terminal,
  Bell,
  WifiOff,
  Mic,
  Search,
  ArrowRight,
  Copy,
  Check,
  Award
} from 'lucide-react';
import QuranView from './QuranView.tsx';
import HadithLibraryView from './HadithLibraryView.tsx';
import FeedView from './FeedView.tsx';
import ToolsView from './ToolsView.tsx';
import AdhkarView from './AdhkarView.tsx';
import ZakatCalculator from './ZakatCalculator.tsx';
import IslamicGuides from './IslamicGuides.tsx';
import NamesOfAllahView from './NamesOfAllahView.tsx';
import GamesView from './GamesView.tsx';
import HajjUmrahHub from './HajjUmrahHub.tsx';
import HajjGame3D from './HajjGame3D.tsx';
import PrayerTimesView from './PrayerTimesView.tsx';
import IslamicFinanceView from './IslamicFinanceView.tsx';
import DownloadAppView from './DownloadAppView.tsx';
import NearbyMosquesMap from './NearbyMosquesMap.tsx';
import QiblaView from './QiblaView.tsx';
import HijriCalendarView from './HijriCalendarView.tsx';
import HifzMemorizeView from './HifzMemorizeView.tsx';
import { Surah, Ayah } from '../types.ts';

import OfflineManagerView from './OfflineManagerView.tsx';

interface ResourcesViewProps {
  selectedSurah: Surah | null;
  onSelectSurah: (surah: Surah | null) => void;
  searchQuery: string;
  bookmarks: Ayah[];
  onToggleBookmark: (ayah: Ayah) => void;
  selectedReciter: number;
  onReciterChange: (id: number) => void;
  selectedHadithCollection: string;
  onHadithCollectionChange: (id: string) => void;
  initialResId?: TabType | null;
  addHasanat: (amount: number) => void;
  incrementDua: () => void;
  incrementVerse: () => void;
  language: string;
  setSearchQuery: (q: string) => void;
  isPremium: boolean;
  onShowPremium: () => void;
  currentUser: any;
}

type TabType = 'quran' | 'hadith' | 'feed' | 'tools' | 'dua' | 'names' | 'halal' | 'calendar' | 'adhkar' | 'zakat' | 'guides' | 'babynames' | 'names_old' | 'games' | 'prayer_times' | 'tasbih' | 'qibla' | 'khatam' | 'mosques' | 'learn' | 'immerse' | 'memorise' | 'coin_shop' | 'mirror' | 'finance' | 'library' | 'calendar_view' | 'market' | 'chat' | 'companion' | 'mobile' | 'offline' | 'hajj_umrah' | 'hajj_game' | 'anatomy' | 'system';

export default function ResourcesView({
  selectedSurah,
  onSelectSurah,
  searchQuery,
  bookmarks,
  onToggleBookmark,
  selectedReciter,
  onReciterChange,
  selectedHadithCollection,
  onHadithCollectionChange,
  initialResId,
  addHasanat,
  incrementDua,
  incrementVerse,
  language,
  setSearchQuery,
  isPremium,
  onShowPremium,
  currentUser
}: ResourcesViewProps) {
  const [activeRes, setActiveRes] = useState<TabType | null>(initialResId || null);
  const [isListening, setIsListening] = useState(false);
  const [selectedAnatomyTab, setSelectedAnatomyTab] = useState<'map' | 'navigation' | 'conservatory' | 'rewards' | 'market' | 'auth'>('map');
  const [copyStatus, setCopyStatus] = useState<string>('Copy Developer Prompt');
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (initialResId) {
      setActiveRes(initialResId);
    } else if (location.state?.activeRes) {
      setActiveRes(location.state.activeRes);
    }
  }, [initialResId, location.state]);

  const categories = [
    {
      title: 'DEEN',
      cards: [
        { id: 'prayer_times', title: 'Prayer Times', icon: Clock, image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&q=80&w=800' },
        { id: 'quran', title: 'Quran', icon: BookOpen, image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800' },
        { id: 'tasbih', title: 'Tasbih', icon: History, image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800' },
        { id: 'qibla', title: 'Qibla', icon: Compass, image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800' },
        { id: 'adhkar', title: 'Duas & Adhkar', icon: Moon, image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800' },
        { id: 'khatam', title: 'Khatam Journey', icon: Star, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800' },
        { id: 'mosques', title: 'Sanctuaries Near You', icon: MapPin, image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800' },
        { id: 'immerse', title: 'Immersion', icon: Eye, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800' },
        { id: 'memorise', title: 'Tarteel Hifz AI', icon: Brain, image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800' },
        { id: 'market', title: 'Halal Market', icon: ShoppingBag, image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800' },
        { id: 'names', title: '99 Names', icon: Sparkles, image: 'https://images.unsplash.com/photo-1583000212006-7e23730e625a?auto=format&fit=crop&q=80&w=800' },
        { id: 'zakat', title: 'Zakat Calculator', icon: Calculator, image: 'https://images.unsplash.com/photo-1611974717482-aa389182069e?auto=format&fit=crop&q=80&w=800' },
        { id: 'babynames', title: 'Baby Names', icon: Baby, image: 'https://images.unsplash.com/photo-1519689683291-c1033ef378c5?auto=format&fit=crop&q=80&w=800' },
        { id: 'games', title: 'Ilm Games', icon: Gamepad2, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800' },
      ]
    },
    {
      title: 'PILGRIMAGE',
      cards: [
        { id: 'hajj_umrah', title: 'Hajj & Umrah', icon: MapPin, image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800' },
        { id: 'hajj_game', title: 'Pilgrimage Quest', icon: Gamepad2, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800' },
        { id: 'guides', title: 'Islamic Wisdom', icon: GraduationCap, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800' },
      ]
    },
    {
      title: 'PREMIUM',
      cards: [
        { id: 'companion', title: 'Holy Aliyah AI', icon: Sparkles, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', premium: true },
        { id: 'finance', title: 'Islamic Finance', icon: BarChart3, image: 'https://images.unsplash.com/photo-1454165833221-d8d8b66455db?auto=format&fit=crop&q=80&w=800', premium: true },
        { id: 'hadith', title: 'Hadith Library', icon: Library, image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800', premium: true },
        { id: 'calendar', title: 'Hijri Calendar', icon: CalendarDays, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', premium: false },
      ]
    },
    {
      title: 'COMMUNITY',
      cards: [
        { id: 'chat', title: 'Community Chat', icon: Users, image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=300', premium: false },
        { id: 'feed', title: 'NoorTalk Feed', icon: Compass, image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=300', premium: false },
        { id: 'offline', title: 'Offline Sanctuary', icon: WifiOff, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300', premium: false }
      ]
    },
    {
      title: 'SYSTEM ARCHITECTURE',
      cards: [
        { id: 'anatomy', title: 'Grand Architect Map', icon: Terminal, image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800', premium: false },
        { id: 'system', title: 'Sanctuary OS Core', icon: Activity, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800', premium: false },
        { id: 'mobile', title: 'Download Source Code & App', icon: Smartphone, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800', premium: false }
      ]
    }
  ];

  const handleCardClick = (id: string) => {
    if (id === 'chat') {
      navigate('/chat');
    } else if (id === 'companion') {
      navigate('/companion');
    } else if (id === 'market') {
      navigate('/market');
    } else if (id === 'tasbih') {
      setActiveRes('tools');
    } else {
      setActiveRes(id as TabType);
    }
  };

  return (
    <div className="space-y-12 min-h-screen pb-32">
      {/* Header */}
      {!selectedSurah && (
        <div className="flex items-center justify-between px-4 pt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              {activeRes && (
                <button 
                  onClick={() => { setActiveRes(null); onSelectSurah(null); }}
                  className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-brand-primary/30 transition-all group"
                >
                  <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-white tracking-tight text-nowrap">
                  {activeRes === 'feed' ? 'NoorTalk Community Feed' : (activeRes ? activeRes.charAt(0).toUpperCase() + activeRes.slice(1).replace('_', ' ') : 'The Conservatory')}
                </h1>
                <p className="text-slate-500 font-medium text-sm tracking-wide">
                  {activeRes === 'feed' ? 'Share how you feel, life stories, reflections & connect with the Ummah' : (activeRes ? 'Exploring sacred knowledge' : 'Curated spiritual instruments & knowledge')}
                </p>
              </div>
            </div>
          </div>
          {!activeRes && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 relative">
                 <Search className="absolute left-4 text-brand-primary/40" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search library..."
                   className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-12 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all text-slate-200"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <button 
                   onClick={toggleListening}
                   className={`absolute right-4 p-1.5 rounded-lg transition-all ${isListening ? 'text-brand-primary bg-brand-primary/10 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                   title="Voice Search"
                 >
                   <Mic size={16} />
                 </button>
              </div>
              <div className="hidden md:flex items-center gap-4 px-6 py-3 glass-panel rounded-2xl border-white/5">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aura Level</p>
                    <p className="text-sm font-black text-brand-primary">Radiant</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sanctuary" alt="Profile" className="w-full h-full object-cover" />
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-4 min-h-[70vh]">
         <AnimatePresence mode="popLayout" initial={false}>
            {!activeRes ? (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="space-y-16"
              >
                {/* Immersive Category Layout */}
                {categories.map((category, catIdx) => {
                  const filteredCards = category.cards.filter(c => 
                    c.title.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  if (filteredCards.length === 0) return null;

                  return (
                  <div key={category.title} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                      <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.4em] px-4 py-1.5 bg-brand-primary/5 border border-brand-primary/10 rounded-full">
                        {category.title}
                      </h3>
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      {/* Featured Hero for each category */}
                      {(() => {
                        const Icon = filteredCards[0].icon;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCardClick(filteredCards[0].id)}
                            className="md:col-span-8 relative h-80 rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5 bg-brand-depth/40"
                          >
                            <img 
                              src={filteredCards[0].image} 
                              alt="" 
                              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591146200259-8692697a5a8f?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            
                            <span className="absolute inset-x-12 bottom-12 flex flex-col md:flex-row items-end justify-between gap-8 text-left">
                              <span className="space-y-4">
                                <span className="w-20 h-20 bg-brand-primary rounded-[2.5rem] flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/20">
                                  <Icon size={40} />
                                </span>
                                <span className="block space-y-1">
                                  <h4 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-1">{filteredCards[0].title}</h4>
                                  <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">{filteredCards[0].id === 'hajj_umrah' ? 'Coordinate the sacred steps' : `Explore the ${filteredCards[0].title.toLowerCase()}`}</p>
                                </span>
                              </span>
                              <span className="px-10 py-5 bg-white text-black font-black rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-primary transition-colors flex items-center gap-4">
                                Open Module <ArrowRight size={18} />
                              </span>
                            </span>

                            <ChevronRight className="absolute bottom-10 right-10 text-brand-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2" size={32} />
                          </motion.button>
                        );
                      })()}

                      {/* Side Grid for others in category */}
                      <div className="md:col-span-4 grid grid-cols-2 gap-4">
                        {filteredCards.slice(1, 5).map((card) => {
                          const CardIcon = card.icon;
                          return (
                            <motion.button
                              key={card.id}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCardClick(card.id)}
                              className="relative aspect-square rounded-[2rem] overflow-hidden group border border-white/5 shadow-xl bg-brand-depth/40"
                            >
                              <img 
                                src={card.image} 
                                alt="" 
                                className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=600';
                                }}
                              />
                              <span className="absolute inset-0 bg-brand-depth/40 group-hover:bg-transparent transition-colors" />
                              <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                              
                              <span className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3">
                                <span className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                  <CardIcon size={18} className="text-white" />
                                </span>
                                <span className="block text-[10px] font-black text-white uppercase tracking-widest">{card.title}</span>
                              </span>
                              
                              {(card as any).premium && (
                                <div className="absolute top-4 right-4 text-amber-500">
                                  <Star size={10} fill="currentColor" />
                                </div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Remaining items as a clean list for this category */}
                    {filteredCards.length > 5 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                         {filteredCards.slice(5).map((card) => {
                           const ListIcon = card.icon;
                           return (
                             <motion.button
                               key={card.id}
                               whileHover={{ scale: 1.02 }}
                               whileTap={{ scale: 0.98 }}
                               onClick={() => handleCardClick(card.id)}
                               className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-brand-primary/30 transition-all group"
                             >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-brand-primary transition-colors">
                                  <ListIcon size={18} />
                                </div>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">{card.title}</span>
                             </motion.button>
                           );
                         })}
                      </div>
                    )}
                  </div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key={activeRes + (selectedSurah ? '-surah' : '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                 {(activeRes as any) === 'system' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                       <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-brand-sidebar/40">
                          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                             <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/20">
                                <Activity size={40} />
                             </div>
                             <div className="text-center md:text-left">
                                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Sanctuary <span className="text-brand-primary">OS</span> Core</h2>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Notification System Architecture v2.0</p>
                             </div>
                          </div>

                          {/* Architecture Diagram */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                             {/* Arrows between columns on desktop */}
                             <div className="hidden lg:block absolute top-1/2 left-1/3 -translate-y-1/2 w-12 h-px bg-gradient-to-r from-brand-primary/50 to-transparent z-0" />
                             <div className="hidden lg:block absolute top-1/2 left-2/3 -translate-y-1/2 w-12 h-px bg-gradient-to-r from-brand-primary/50 to-transparent z-0" />

                             {/* Column 1: Sources */}
                             <div className="space-y-4 relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Event Sources</p>
                                {[
                                  { icon: <Clock size={16} />, title: 'Prayer Engine', desc: 'Local Scheduler (30s Tick)', color: 'amber' },
                                  { icon: <Share2 size={16} />, title: 'Cloud Sync', desc: 'Firebase FCM Listeners', color: 'blue' },
                                  { icon: <MessageCircle size={16} />, title: 'Community', desc: 'Real-time WebSocket', color: 'emerald' }
                                ].map((item, i) => (
                                  <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all group">
                                     <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 text-${item.color}-500 flex items-center justify-center mb-4`}>
                                        {item.icon}
                                     </div>
                                     <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                                     <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                                  </div>
                                ))}
                             </div>

                             {/* Column 2: Logic Center */}
                             <div className="space-y-4 relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Middleware Logic</p>
                                <div className="p-8 bg-brand-primary/5 border border-brand-primary/20 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center space-y-6">
                                   <div className="w-16 h-16 bg-brand-primary rounded-3xl flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/30">
                                      <Terminal size={32} />
                                   </div>
                                   <div>
                                      <h4 className="text-lg font-black text-white italic uppercase mb-2">Signal Dispatcher</h4>
                                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                        Validates user preferences, checks "Do Not Disturb" windows, and selects target interface layer (Heads-up vs Background).
                                      </p>
                                   </div>
                                   <div className="w-full h-px bg-white/5" />
                                   <div className="flex gap-2">
                                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-brand-primary uppercase tracking-widest tracking-tighter">Prioritizing...</span>
                                      <span className="px-3 py-1 bg-white/5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">Halal Filtered</span>
                                   </div>
                                </div>
                             </div>

                             {/* Column 3: Output Channels */}
                             <div className="space-y-4 relative z-10">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Output Layers</p>
                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-primary">
                                         <Bell size={20} />
                                      </div>
                                      <div>
                                         <h4 className="text-xs font-black text-white uppercase tracking-widest">Heads-Up Banner</h4>
                                         <p className="text-[9px] text-slate-500 font-bold uppercase italic">In-App Foreground</p>
                                      </div>
                                   </div>
                                   <div className="p-4 bg-brand-depth/40 rounded-xl border border-white/5">
                                      <div className="w-full h-1 bg-white/10 rounded-full mb-3" />
                                      <div className="flex gap-2">
                                         <div className="w-4 h-4 rounded-full bg-brand-primary" />
                                         <div className="flex-1 h-2 bg-white/5 rounded-full" />
                                      </div>
                                   </div>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                                         <Smartphone size={20} />
                                      </div>
                                      <div>
                                         <h4 className="text-xs font-black text-white uppercase tracking-widest">Push Alert (FCM)</h4>
                                         <p className="text-[9px] text-slate-500 font-bold uppercase italic">System Background</p>
                                      </div>
                                   </div>
                                   <div className="grid grid-cols-2 gap-2">
                                      <div className="h-10 bg-white/5 rounded-lg flex items-center justify-center text-[8px] font-black text-slate-600 uppercase tracking-widest">Android</div>
                                      <div className="h-10 bg-white/5 rounded-lg flex items-center justify-center text-[8px] font-black text-slate-600 uppercase tracking-widest">iOS</div>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
                 {activeRes === 'quran' && (
                   <QuranView 
                      selectedSurah={selectedSurah}
                      onSelectSurah={onSelectSurah}
                      searchQuery={searchQuery}
                      bookmarks={bookmarks}
                      onToggleBookmark={onToggleBookmark}
                      selectedReciter={selectedReciter}
                      onReciterChange={onReciterChange} isPremium={isPremium} onShowPremium={onShowPremium}
                      addHasanat={addHasanat}
                      incrementVerse={incrementVerse}
                      language={language}
                   />
                 )}
                 {activeRes === 'hadith' && (
                   <HadithLibraryView 
                      initialCollection={selectedHadithCollection}
                      onCollectionChange={onHadithCollectionChange}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      addHasanat={addHasanat}
                   />
                 )}
                 {(activeRes as any) === 'anatomy' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                       <div className="glass-panel p-6 md:p-10 rounded-[3rem] border-white/5 bg-brand-sidebar/40">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                             <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-2xl">
                                   <Terminal size={32} />
                                </div>
                                <div className="text-center md:text-left">
                                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Grand Architect Map</h2>
                                   <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest font-sans">Sanctuary Application Layout & Specs</p>
                                </div>
                             </div>

                             <button 
                               onClick={() => {
                                 const ARCH_PROMPT = `=== THE SANCTUARY APP SYSTEM BLUEPRINT ===\n\n1. APP EMBEDDED SHELL & INTERACTION LAYERS\n- Bottom Menu Bar: Navigates persistent hubs featuring high-contrast active icons and premium haptic visual indicators:\n  * Library / Conservatory (Sacred knowledge hubs, Quran, Prayer Times, Ilm widgets)\n  * Faith Feed (Social dynamic feed, posts, reflection notes, likes)\n  * Chat sanctuary (User channels, automated messaging limits to real people, search directory)\n  * Aliyah Companion (Advanced GPT/Gemini-fueled personal counselor)\n  * Halal Market (Artifact list, peer-to-peer item exchange with Hasanat badge purchases)\n  * Profiles Profile (Onboarding gateway, stats, achievements, historical streaks)\n- Header Shell: UTC realtime indicator, Aura indicator, dynamic notification alert centers, and smart search integrations.\n\n2. SACRED RESOURCES HUB (CONSERVATORY)\n- Logical categorisation:\n  * DEEN: Quran Audio/text reader, prayer counters, digital tasbih string, offline tools.\n  * PILGRIMAGE: Hajj & Umrah Interactive Compass planner.\n  * PREMIUM: Islamic Finance monitors, Hadith comprehensive databases.\n  * COMMUNITY: Global chat networks, real-time feedback systems.\n  * SYSTEMS: Realtime background notification logs, event engines.\n\n3. HALAL BAZAAR & MERCHANTS\n- Custom peer listings utilizing secure local transactional models and virtual hasanat tokens.\n- Dynamic profile listings displaying seller trust, verification tags, and artifact properties.\n\n4. USER PROFILE & AUTHENTICATION PROTOCOLS\n- Real-time pre-onboarding adopting placeholder emails during organic guest navigation.\n- Safe local profile migrations executing one-way cryptographic transfer of user Hasanat & statistics.\n\n5. DATABASE SCHEMA (FIREBASE FIRESTORE)\n- users: { uid, email, displayName, photoURL, hasanat, streak, onboardingCompleted }\n- chat rooms: { id, title, createdBy, timestamp }\n- Fully validated secure firestore.rules guarding personal directories against foreign modifications.\n\n6. LEADERBOARDS & HARMONIC POINTS\n- Hall of Fame stream loading current user tallies.\n- Rewards calculated per-action (Verses read, Duas said, Prayers checked, Marketplace purchases).`;
                                 navigator.clipboard.writeText(ARCH_PROMPT);
                                 setCopyStatus('Copied Spec Prompt!');
                                 setTimeout(() => setCopyStatus('Copy Developer Prompt'), 2000);
                               }}
                               className="flex items-center gap-3 bg-brand-primary text-brand-text-dark px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto justify-center font-sans"
                             >
                               {copyStatus === 'Copied Spec Prompt!' ? <Check size={14} /> : <Copy size={16} />}
                               {copyStatus}
                             </button>
                          </div>

                          {/* Anatomy Nav Segments */}
                          <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-2xl font-sans">
                             {[
                               { id: 'map', label: 'Grand Blueprint' },
                               { id: 'navigation', label: 'Menu & Shell' },
                               { id: 'conservatory', label: 'Spiritual Hub' },
                               { id: 'rewards', label: 'Hasanat Engine' },
                               { id: 'market', label: 'Halal Bazaar' },
                               { id: 'auth', label: 'Auth & Database' }
                             ].map((tab) => (
                               <button
                                 key={tab.id}
                                 onClick={() => setSelectedAnatomyTab(tab.id as any)}
                                 className={`flex-grow px-4 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${selectedAnatomyTab === tab.id ? 'bg-brand-primary text-brand-text-dark' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                               >
                                 {tab.label}
                               </button>
                             ))}
                          </div>

                          {/* Selected Segment Spec Details */}
                          <div className="bg-brand-depth/40 border border-white/5 p-6 md:p-8 rounded-[2rem] space-y-6 text-slate-200">
                             {selectedAnatomyTab === 'map' && (
                               <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                     <Sparkles size={20} className="text-brand-primary" />
                                     <h3 className="text-lg font-black text-white uppercase tracking-tight italic font-sans animate-pulse">Sanctuary Application Topology</h3>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                    The architectural schema is built with persistent modular containers inside a high-contrast dark visual design framework. Below is the workflow pipeline mapping:
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                                     {[
                                       { step: '01', title: 'Interactive Shell', desc: 'Secure state trackers holding user authentication status and real-time offline synchronization buffers.' },
                                       { step: '02', title: 'Global Context', desc: 'Dynamic React Context managing user streaks, reward points, active rooms, and UI tab selectors.' },
                                       { step: '03', title: 'Core Engines', desc: 'Islamic calculators, Quranic recitation loaders, Local system alerts dispatchers, and Gemini API proxy.' },
                                       { step: '04', title: 'Persistent Ledger', desc: 'Authenticated Firestore pathways synchronizing user progress, active chat boards, and leaderboard records.' }
                                     ].map((item, id) => (
                                       <div key={id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl font-sans">
                                          <div className="text-[10px] font-black text-brand-primary mb-2">STEP {item.step}</div>
                                          <h4 className="text-white font-black text-xs uppercase tracking-wider mb-2">{item.title}</h4>
                                          <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}

                             {selectedAnatomyTab === 'navigation' && (
                               <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                     <Clock size={20} className="text-brand-primary" />
                                     <h3 className="text-lg font-black text-white uppercase tracking-tight italic font-sans">Global Menu Bar & Shell Layout</h3>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                     The navigation layout ensures direct accessibility across complex interactive views while retaining a minimal header:
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-sans">
                                     <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Top Header Control Panel</h4>
                                        <ul className="space-y-2 text-[11px] text-slate-400 list-disc list-inside col-span-1">
                                           <li>Real-time UTC digital clock.</li>
                                           <li>Aura level score computed from total Hasanat.</li>
                                           <li>Hasanat counters (Global reward indicators).</li>
                                           <li>Dynamic notification indicators.</li>
                                        </ul>
                                     </div>
                                     <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">Bottom Persistent Navigation</h4>
                                        <ul className="space-y-2 text-[11px] text-slate-400 list-disc list-inside">
                                           <li>Library: The main Conservatory.</li>
                                           <li>Faith Feed: User reflection boards.</li>
                                           <li>Chat: Multi-user instant chatting room.</li>
                                           <li>Companion: Personal smart AI counselor.</li>
                                           <li>Bazaar: Halal commercial listings.</li>
                                        </ul>
                                     </div>
                                     <div className="p-5 bg-white/5 rounded-2xl border border-white/5 font-sans">
                                        <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3 font-sans font-sans">Unified Voice Search Control</h4>
                                        <ul className="space-y-2 text-[11px] text-slate-400 list-disc list-inside">
                                           <li>Clickable Microphone activating native Web Speech API.</li>
                                           <li>Search criteria matching across cards, guides, surahs, or baby names.</li>
                                        </ul>
                                     </div>
                                  </div>
                               </div>
                             )}

                             {selectedAnatomyTab === 'conservatory' && (
                               <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                     <BookOpen size={20} className="text-brand-primary" />
                                     <h3 className="text-lg font-black text-white uppercase tracking-tight italic">The Spiritual Resources Library</h3>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                     The main entry point of the app, dividing resources into high-fidelity interaction groups:
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest font-sans">DEEN CATEGORY</span>
                                        <p className="text-slate-200 font-bold uppercase text-[11px] mt-2 mb-3 font-sans">Foundational Instruments</p>
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                          Quran audio player with translations, Khatam goal tracking, daily tracker with beautiful micro-vibrations, compass calculations, digital daily tasbih, halal baby names, and islamic games.
                                        </p>
                                     </div>
                                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-sans">PREMIUM AND PILGRIMAGE</span>
                                        <p className="text-slate-200 font-bold uppercase text-[11px] mt-2 mb-3">Specialist Knowledge Layers</p>
                                        <p className="text-[11px] text-slate-400 leading-relaxed">
                                          Islamic wisdom guidelines, comprehensive Hadith libraries with authentic search filtering, Halal personal finance portfolios, and Hajj interactive step-planners.
                                        </p>
                                     </div>
                                  </div>
                               </div>
                             )}

                             {selectedAnatomyTab === 'rewards' && (
                               <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                     <Award size={20} className="text-brand-primary" fill="currentColor" />
                                     <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Hasanat Points Engine & Leaderboard</h3>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed">
                                     Hasanat rewards act as the spiritual gas powering user advancement and leveling:
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                                     {[
                                       { title: 'The Hasanat Economy', points: '+10 to +100', text: 'Earn points dynamically by reading Quranic Surahs, completing daily tasbih cycles, finishing Dua sessions, or correctly answering islamic trivia.' },
                                       { title: 'Streak Integration', points: '1.5x Multiplier', text: 'Consecutive daily check-ins trigger streak calculations, updating global status levels (Novice, Devoted, Steadfast, Radiant, Luminary).' },
                                       { title: 'Hall of Fame', points: 'Global Ranking', text: 'Display rankings in the scoreboard. Seekers compete in real-time based on verified database accumulation profiles.' }
                                     ].map((box, idx) => (
                                       <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                          <div className="flex items-center justify-between gap-2 mb-2">
                                             <h4 className="text-white font-black text-xs uppercase tracking-wider">{box.title}</h4>
                                             <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{box.points}</span>
                                          </div>
                                          <p className="text-slate-400 text-[11px] leading-relaxed">{box.text}</p>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             )}

                             {selectedAnatomyTab === 'market' && (
                               <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                     <ShoppingBag size={20} className="text-brand-primary" />
                                     <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Halal Marketplace & Exchange</h3>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed">
                                     An interactive exchange board connecting buyers and sellers for peer-to-peer halal transactions and coin shops.
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                                        <h4 className="text-white font-black text-xs uppercase tracking-wider mb-2">Peer Listings</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                                           Users can list Islamic instruments (e.g. leather mats, handcrafted oud, premium dates, custom prayer robes) stating terms, price, and location coordinates safely.
                                        </p>
                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-brand-primary uppercase tracking-widest">Buyer Protection Enabled</span>
                                     </div>
                                     <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                                        <h4 className="text-white font-black text-xs uppercase tracking-wider mb-2">Hasanat Coin Shop</h4>
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                                           A reward catalog where users trade earned Hasanat points for aesthetic app design layouts, customized Quran reciter audio files, and exclusive profile badges.
                                        </p>
                                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">Virtual Economy</span>
                                     </div>
                                  </div>
                               </div>
                             )}

                             {selectedAnatomyTab === 'auth' && (
                               <div className="space-y-6">
                                  <div className="flex items-center gap-3">
                                     <Users size={20} className="text-brand-primary" />
                                     <h3 className="text-lg font-black text-white uppercase tracking-tight italic font-sans animate-pulse">Profile Gateway & Firebase Schemas</h3>
                                  </div>
                                  <p className="text-slate-400 text-xs leading-relaxed font-sans">
                                     Secure onboarding mappings bind temporal local cache properties into permanent cloud directories:
                                  </p>
                                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                     <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ONBOARDING PATHWAY</span>
                                     </div>
                                     <p className="text-[11px] text-slate-400 leading-relaxed">
                                        Unauthenticated guests participate organically, with scores accumulating locally under a <code className="text-brand-primary font-mono">local_*</code> placeholder UID index. Upon authentic logging (Google Sign-In/Email), the system triggers profile migration, adopting preloaded data, transferring local credentials, deleting ghost profile references, and validating user data against firestore configurations.
                                     </p>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                                     <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <h4 className="text-xs font-black text-brand-primary uppercase mb-2 font-sans">Users Collection</h4>
                                        <pre className="text-[10px] text-slate-400 leading-relaxed mt-2 bg-black/40 p-4 rounded-xl overflow-x-auto">
{`{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  hasanat: number,
  streak: number,
  onboardingCompleted: boolean,
  lastSeen: Timestamp
}`}
                                        </pre>
                                     </div>
                                     <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                        <h4 className="text-xs font-black text-brand-primary uppercase mb-2 font-sans">Chat Sub-collections</h4>
                                        <pre className="text-[10px] text-slate-400 leading-relaxed mt-2 bg-black/40 p-4 rounded-xl overflow-x-auto">
{`{
  id: string,
  title: string,
  createdBy: string,
  description: string,
  messages: SubCollection[{
    senderId: string,
    text: string,
    timestamp: Timestamp
  }]
}`}
                                        </pre>
                                     </div>
                                  </div>
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  )}
                  {activeRes === 'feed' && <FeedView addHasanat={addHasanat} isPremium={isPremium} onShowPremium={onShowPremium} />}
                 {activeRes === 'prayer_times' && <PrayerTimesView />}
                 {activeRes === 'mosques' && <NearbyMosquesMap />}
                  {activeRes === 'qibla' && <QiblaView />}
                  {(activeRes === 'tools' || activeRes === 'tasbih') && <ToolsView />}
                 {activeRes === 'adhkar' && <AdhkarView addHasanat={addHasanat} incrementDua={incrementDua} searchQuery={searchQuery} />}
                 {activeRes === 'names' && <NamesOfAllahView searchQuery={searchQuery} />}
                 {activeRes === 'zakat' && <ZakatCalculator />}
                 {activeRes === 'finance' && <IslamicFinanceView />}
                 {activeRes === 'guides' && <IslamicGuides initialTab="hajj" searchQuery={searchQuery} isPremium={isPremium} onShowPremium={onShowPremium} addHasanat={addHasanat} incrementDua={incrementDua} />}
                 {activeRes === 'hajj_umrah' && <HajjUmrahHub onNavigate={(view) => setActiveRes(view as TabType)} addHasanat={addHasanat} incrementDua={incrementDua} />}
                  {activeRes === 'hajj_game' && <HajjGame3D onClose={() => setActiveRes(null)} addHasanat={addHasanat} />}
                 {activeRes === 'babynames' && <IslamicGuides initialTab="names" searchQuery={searchQuery} isPremium={isPremium} onShowPremium={onShowPremium} addHasanat={addHasanat} incrementDua={incrementDua} />}
                 {activeRes === 'games' && <GamesView addHasanat={addHasanat} />}
                 {activeRes === 'memorise' && (
                   <HifzMemorizeView
                     onBack={() => setActiveRes(null)}
                     addHasanat={addHasanat}
                     isPremium={isPremium}
                     onShowPremium={onShowPremium}
                   />
                 )}
                 {activeRes === 'offline' && <OfflineManagerView selectedReciter={selectedReciter} currentUser={currentUser} />}
                 {activeRes === 'mobile' && <DownloadAppView />}
                 {(activeRes === 'calendar' || (activeRes as string) === 'calendar_view') && (
                   <HijriCalendarView onNavigate={(tab, extra) => {
                     if (tab === 'resources') {
                       setActiveRes(extra?.resId || null);
                     } else {
                       navigate(`/${tab}`);
                     }
                   }} />
                 )}
                 {['coin_shop'].includes(activeRes as string) && (
                    <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                       <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary animate-pulse">
                          <ShoppingBag size={48} />
                       </div>
                       <div className="space-y-2">
                         <h3 className="text-2xl font-black text-white">Market Room</h3>
                         <p className="text-slate-500 max-w-sm mx-auto font-medium">The sanctuary marketplace is coming soon. Use your Hasanat to unlock spiritual rewards.</p>
                       </div>
                       <button 
                         onClick={() => setActiveRes(null)}
                         className="bg-brand-primary text-brand-depth px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20"
                       >
                          Back to Library
                       </button>
                    </div>
                 )}
                 {['mirror', 'immerse', 'khatam', 'learn', 'names_old'].includes(activeRes as string) && (
                   <div className="flex flex-col items-center justify-center py-20 md:py-40 text-center space-y-6 bg-white/[0.02] rounded-[3rem] border border-white/5 mx-auto max-w-2xl px-8">
                      <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/20">
                         <Sparkles size={32} className="animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                          <span className="text-brand-primary">Module</span> Under Craft
                        </h3>
                        <p className="text-slate-400 max-w-sm mx-auto font-medium text-sm leading-relaxed">We are carefully polishing this sacred interface. Each instrument in the Sanctuary is built with intention. Check back shortly for the update.</p>
                      </div>
                      <button 
                        onClick={() => setActiveRes(null)}
                        className="bg-brand-primary text-brand-depth px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                         Return to Library
                      </button>
                   </div>
                 )}
              </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
