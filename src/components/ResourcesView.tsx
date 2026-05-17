import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
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
  Smartphone
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
import QiblaView from './QiblaView.tsx';
import PrayerTimesView from './PrayerTimesView.tsx';
import IslamicFinanceView from './IslamicFinanceView.tsx';
import DownloadAppView from './DownloadAppView.tsx';
import { Surah, Ayah } from '../types.ts';

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
}

type TabType = 'quran' | 'hadith' | 'feed' | 'tools' | 'dua' | 'names' | 'halal' | 'calendar' | 'adhkar' | 'zakat' | 'guides' | 'babynames' | 'names_old' | 'games' | 'prayer_times' | 'tasbih' | 'qibla' | 'khatam' | 'mosques' | 'learn' | 'immerse' | 'memorise' | 'coin_shop' | 'mirror' | 'finance' | 'library' | 'calendar_view' | 'market' | 'chat' | 'companion' | 'mobile';

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
  language
}: ResourcesViewProps) {
  const [activeRes, setActiveRes] = useState<TabType | null>(initialResId || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialResId && initialResId !== activeRes) {
      setActiveRes(initialResId);
    }
  }, [initialResId]);

  const categories = [
    {
      title: 'DEEN',
      cards: [
        { id: 'prayer_times', title: 'Prayer Times', icon: Clock, image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=800' },
        { id: 'quran', title: 'Quran', icon: BookOpen, image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800' },
        { id: 'tasbih', title: 'Tasbih', icon: History, image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800' },
        { id: 'qibla', title: 'Qibla', icon: Compass, image: 'https://images.unsplash.com/photo-1551041777-ed39feb53934?auto=format&fit=crop&q=80&w=800' },
        { id: 'adhkar', title: 'Duas & Adhkar', icon: Moon, image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800' },
        { id: 'khatam', title: 'Khatam Journey', icon: Star, image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800' },
        { id: 'mosques', title: 'Sanctuaries Near You', icon: MapPin, image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=800' },
        { id: 'guides', title: 'Islamic Wisdom', icon: GraduationCap, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800' },
        { id: 'immerse', title: 'Immersion', icon: Eye, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800' },
        { id: 'memorise', title: 'Hifz Companion', icon: Brain, image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800' },
        { id: 'market', title: 'Halal Market', icon: ShoppingBag, image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800' },
        { id: 'names', title: '99 Names', icon: Sparkles, image: 'https://images.unsplash.com/photo-1583000212006-7e23730e625a?auto=format&fit=crop&q=80&w=800' },
        { id: 'zakat', title: 'Zakat Calculator', icon: Calculator, image: 'https://images.unsplash.com/photo-1611974717482-aa389182069e?auto=format&fit=crop&q=80&w=800' },
        { id: 'babynames', title: 'Baby Names', icon: Baby, image: 'https://images.unsplash.com/photo-1519689683291-c1033ef378c5?auto=format&fit=crop&q=80&w=800' },
        { id: 'games', title: 'Ilm Games', icon: Gamepad2, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800' },
      ]
    },
    {
      title: 'PREMIUM',
      cards: [
        { id: 'companion', title: 'Holy Aliyah AI', icon: Sparkles, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800', premium: true },
        { id: 'finance', title: 'Islamic Finance', icon: BarChart3, image: 'https://images.unsplash.com/photo-1454165833221-d8d8b66455db?auto=format&fit=crop&q=80&w=800', premium: true },
        { id: 'hadith', title: 'Hadith Library', icon: Library, image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800', premium: true },
        { id: 'calendar', title: 'Hijri Calendar', icon: CalendarDays, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800' },
      ]
    },
    {
      title: 'COMMUNITY',
      cards: [
        { id: 'chat', title: 'Community Chat', icon: Users, image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=300' },
        { id: 'feed', title: 'Social Feed', icon: MessageCircle, image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=300' },
        { id: 'mobile', title: 'Mobile App', icon: Smartphone, image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300' }
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
                <h1 className="text-4xl font-black text-white tracking-tight">
                  {activeRes ? activeRes.charAt(0).toUpperCase() + activeRes.slice(1).replace('_', ' ') : 'The Conservatory'}
                </h1>
                <p className="text-slate-500 font-medium text-sm tracking-wide">
                  {activeRes ? 'Exploring sacred knowledge' : 'Curated spiritual instruments & knowledge'}
                </p>
              </div>
            </div>
          </div>
          {!activeRes && (
            <div className="hidden md:flex items-center gap-4 px-6 py-3 glass-panel rounded-2xl border-white/5">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aura Level</p>
                  <p className="text-sm font-black text-brand-primary">Radiant</p>
               </div>
               <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-primary/20 shadow-lg shadow-brand-primary/10">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sanctuary" alt="Profile" className="w-full h-full object-cover" />
               </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-4 min-h-[600px]">
         <AnimatePresence mode="wait" initial={false}>
            {!activeRes ? (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-16"
              >
                {/* Immersive Category Layout */}
                {categories.map((category, catIdx) => (
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
                        const Icon = category.cards[0].icon;
                        return (
                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCardClick(category.cards[0].id)}
                            className="md:col-span-8 relative h-80 rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5 bg-brand-depth/40"
                          >
                            <img 
                              src={category.cards[0].image} 
                              alt="" 
                              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1591146200259-8692697a5a8f?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                            
                            <div className="absolute top-8 left-8 flex items-center gap-4">
                              <div className="w-14 h-14 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                                <Icon size={28} className="text-white" />
                              </div>
                              {category.cards[0].premium && (
                                <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md">Premium</span>
                              )}
                            </div>

                            <div className="absolute bottom-10 left-10 text-left space-y-2">
                               <h4 className="text-3xl font-black text-white tracking-tight">{category.cards[0].title}</h4>
                               <p className="text-slate-300 font-medium max-w-sm text-sm">Deeply explore the {category.cards[0].title.toLowerCase()} with our advanced spiritual engine.</p>
                            </div>

                            <ChevronRight className="absolute bottom-10 right-10 text-brand-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2" size={32} />
                          </motion.button>
                        );
                      })()}

                      {/* Side Grid for others in category */}
                      <div className="md:col-span-4 grid grid-cols-2 gap-4">
                        {category.cards.slice(1, 5).map((card) => {
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
                              <div className="absolute inset-0 bg-brand-depth/40 group-hover:bg-transparent transition-colors" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                              
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-3">
                                <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                  <CardIcon size={18} className="text-white" />
                                </div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{card.title}</p>
                              </div>
                              
                              {card.premium && (
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
                    {category.cards.length > 5 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                         {category.cards.slice(5).map((card) => {
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
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={activeRes + (selectedSurah ? '-surah' : '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                 {activeRes === 'quran' && (
                   <QuranView 
                      selectedSurah={selectedSurah}
                      onSelectSurah={onSelectSurah}
                      searchQuery={searchQuery}
                      bookmarks={bookmarks}
                      onToggleBookmark={onToggleBookmark}
                      selectedReciter={selectedReciter}
                      onReciterChange={onReciterChange}
                      addHasanat={addHasanat}
                      incrementVerse={incrementVerse}
                      language={language}
                   />
                 )}
                 {activeRes === 'hadith' && (
                   <HadithLibraryView 
                      initialCollection={selectedHadithCollection}
                      onCollectionChange={onHadithCollectionChange}
                   />
                 )}
                 {activeRes === 'feed' && <FeedView />}
                 {activeRes === 'prayer_times' && <PrayerTimesView />}
                 {(activeRes === 'tools' || activeRes === 'tasbih' || activeRes === 'qibla') && <ToolsView />}
                 {activeRes === 'adhkar' && <AdhkarView addHasanat={addHasanat} incrementDua={incrementDua} />}
                 {activeRes === 'names' && <NamesOfAllahView />}
                 {activeRes === 'zakat' && <ZakatCalculator />}
                 {activeRes === 'finance' && <IslamicFinanceView />}
                 {activeRes === 'guides' && <IslamicGuides initialTab="hajj" />}
                 {activeRes === 'babynames' && <IslamicGuides initialTab="names" />}
                 {activeRes === 'games' && <GamesView addHasanat={addHasanat} />}
                 {activeRes === 'mobile' && <DownloadAppView />}
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
                 {['mirror', 'calendar', 'immerse', 'memorise', 'khatam', 'mosques', 'learn', 'names_old'].includes(activeRes as string) && (
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
