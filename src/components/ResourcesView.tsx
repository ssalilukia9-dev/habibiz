import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  Bookmark,
  BookOpen,
  Users,
  Compass,
  Archive,
  ChevronRight,
  Search,
  Sparkles,
  History,
  Calculator,
  Map,
  Baby
} from 'lucide-react';
import QuranView from './QuranView.tsx';
import HadithLibraryView from './HadithLibraryView.tsx';
import CommunityView from './CommunityView.tsx';
import ToolsView from './ToolsView.tsx';
import AdhkarView from './AdhkarView.tsx';
import ZakatCalculator from './ZakatCalculator.tsx';
import IslamicGuides from './IslamicGuides.tsx';
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
}

type TabType = 'quran' | 'hadith' | 'community' | 'tools' | 'dua' | 'names' | 'halal' | 'calendar' | 'adhkar' | 'zakat' | 'guides' | 'babynames' | 'names_old';

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
  initialResId
}: ResourcesViewProps) {
  const [activeRes, setActiveRes] = useState<TabType | null>(initialResId || null);

  useEffect(() => {
    if (initialResId) setActiveRes(initialResId);
  }, [initialResId]);

  const resourceCards = [
    { id: 'quran', title: 'The Holy Quran', desc: 'Read, listen, and explore the divine words of Allah.', icon: BookOpen, color: 'from-emerald-600/20 to-emerald-900/20', accent: 'text-emerald-500' },
    { id: 'hadith', title: 'Hadith Library', desc: 'Browse through thousands of prophetic narrations.', icon: Library, color: 'from-blue-600/20 to-blue-900/20', accent: 'text-blue-500' },
    { id: 'adhkar', title: 'Daily Adhkar', desc: 'Authentic supplications for protection and peace.', icon: Sparkles, color: 'from-purple-600/20 to-purple-900/20', accent: 'text-purple-500' },
    { id: 'community', title: 'Ummah Feed', desc: 'Connect with the global community for wisdom.', icon: Users, color: 'from-amber-600/20 to-amber-900/20', accent: 'text-amber-500' },
    { id: 'names', title: '99 Names', desc: 'Learn and contemplate the Beautiful Names of Allah.', icon: History, color: 'from-cyan-600/20 to-cyan-900/20', accent: 'text-cyan-500' },
    { id: 'zakat', title: 'Zakat Calc', desc: 'Calculate your obligatory almsgiving easily.', icon: Calculator, color: 'from-rose-600/20 to-rose-900/20', accent: 'text-rose-500' },
    { id: 'guides', title: 'Hajj & Umrah', desc: 'Step-by-step spiritual guide for pilgrimage.', icon: Map, color: 'from-indigo-600/20 to-indigo-900/20', accent: 'text-indigo-500' },
    { id: 'babynames', title: 'Baby Names', desc: 'Beautiful Islamic names for boys and girls.', icon: Baby, color: 'from-pink-600/20 to-pink-900/20', accent: 'text-pink-500' },
    { id: 'tools', title: 'Islamic Tools', desc: 'Qibla finder, Tasbih, and Prayer time companions.', icon: Compass, color: 'from-teal-600/20 to-teal-900/20', accent: 'text-teal-500' },
  ];

  return (
    <div className="space-y-12 min-h-screen">
      {/* Hero Section */}
      {!selectedSurah && (
        <div className="relative p-12 rounded-[3.5rem] overflow-hidden border border-white/5 bg-brand-sidebar shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {activeRes && (
                  <button 
                    onClick={() => { setActiveRes(null); onSelectSurah(null); }}
                    className="w-10 h-10 bg-brand-primary text-brand-depth rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                )}
                <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
                  {activeRes ? resourceCards.find(c => c.id === activeRes)?.title : 'Islamic Resources'}
                </h2>
              </div>
              <p className="text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
                {activeRes 
                  ? resourceCards.find(c => c.id === activeRes)?.desc 
                  : 'Welcome to your digital sanctuary. Explore deep wisdom, spiritual tools, and connection with the Ummah.'
                }
              </p>
            </div>

            {!activeRes && (
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-brand-primary/40 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center">
                    <Search className="absolute left-6 text-slate-500" size={20} />
                    <input 
                      type="text" 
                      placeholder="Search for wisdom..."
                      className="bg-brand-depth border border-white/10 rounded-3xl py-5 pl-14 pr-8 text-white focus:border-brand-primary/40 outline-none w-full md:w-80 backdrop-blur-md transition-all font-medium"
                    />
                  </div>
               </div>
            )}
          </div>

          {!activeRes && (
            <div className="flex gap-4 mt-10">
               {['#Quran', '#Hadith', '#Dua', '#Qibla'].map(tag => (
                 <button key={tag} className="px-5 py-2 bg-white/5 hover:bg-brand-primary/10 rounded-full border border-white/5 text-[10px] font-black text-slate-500 hover:text-brand-primary transition-all uppercase tracking-widest">
                   {tag}
                 </button>
               ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-Navigation (Only visible when a resource is selected) */}
      {activeRes && !selectedSurah && (
        <div className="flex flex-wrap gap-3">
           {resourceCards.map(card => (
             <button 
               key={card.id}
               onClick={() => { setActiveRes(card.id as TabType); onSelectSurah(null); }}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-bold transition-all border ${activeRes === card.id ? 'bg-brand-primary text-brand-depth border-brand-primary shadow-xl shadow-brand-primary/20' : 'bg-brand-sidebar text-slate-500 border-white/5 hover:border-white/10'}`}
             >
                <card.icon size={16} /> {card.title}
             </button>
           ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="pb-20">
         <AnimatePresence mode="wait">
            {!activeRes ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {resourceCards.map((card, idx) => (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setActiveRes(card.id as TabType)}
                    className={`group relative text-left p-10 rounded-[3rem] border border-white/5 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${card.color} backdrop-blur-md shadow-2xl hover:border-brand-primary/20`}
                  >
                    <div className="relative z-10 space-y-6">
                      <div className={`w-16 h-16 rounded-[1.5rem] bg-brand-depth border border-white/10 flex items-center justify-center transition-transform group-hover:rotate-12 ${card.accent}`}>
                        <card.icon size={32} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white group-hover:text-brand-primary transition-colors">{card.title}</h3>
                        <p className="text-slate-400 font-medium leading-relaxed">{card.desc}</p>
                      </div>
                      <div className="pt-4 flex items-center gap-2 text-brand-primary font-black uppercase text-[10px] tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                        Explore Library <ChevronRight size={14} />
                      </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-brand-primary/10 transition-colors" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl" />
                  </motion.button>
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
                   />
                 )}
                 {activeRes === 'hadith' && (
                   <HadithLibraryView 
                      initialCollection={selectedHadithCollection}
                      onCollectionChange={onHadithCollectionChange}
                   />
                 )}
                 {activeRes === 'community' && <CommunityView />}
                 {activeRes === 'tools' && <ToolsView />}
                 {activeRes === 'adhkar' && <AdhkarView />}
                 {activeRes === 'names' && <AdhkarView />}
                 {activeRes === 'zakat' && <ZakatCalculator />}
                 {activeRes === 'guides' && <IslamicGuides />}
                 {activeRes === 'babynames' && <IslamicGuides />}
                 {(activeRes === 'dua' || activeRes === 'names_old') && (
                   <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                      <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary animate-pulse">
                         <Sparkles size={48} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white">Knowledge Hub Growing</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">This module is being updated with authentic texts and translations. Check back soon!</p>
                      </div>
                      <button 
                        onClick={() => setActiveRes(null)}
                        className="bg-brand-primary text-brand-depth px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-primary/20"
                      >
                         Back to Library
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
