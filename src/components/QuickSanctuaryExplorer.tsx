import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Compass, 
  Sunrise, 
  Layers, 
  Sparkles, 
  MessageSquare, 
  ShoppingBag, 
  Heart, 
  Calendar, 
  Flame, 
  GraduationCap, 
  Moon, 
  Sun, 
  HelpCircle, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  RotateCcw,
  Landmark,
  ShieldCheck,
  Award,
  Lock,
  Crown
} from 'lucide-react';
import { ThemeService } from '../services/themeService.ts';

interface QuickExplorerItem {
  id: string;
  name: string;
  arabicName: string;
  category: 'worship' | 'learning' | 'community' | 'lifestyle';
  icon: string;
  badge?: string;
  color: string;
  bgGradient: string;
  image: string;
  isPremium?: boolean;
  action: () => void;
  keywords: string[];
}

interface QuickSanctuaryExplorerProps {
  onNavigate: (tab: string, extra?: any) => void;
  currentTheme?: string;
  setTheme?: (theme: string) => void;
  isPremium?: boolean;
  onShowPremium?: () => void;
}

export default function QuickSanctuaryExplorer({ 
  onNavigate, 
  currentTheme = 'aloha', 
  setTheme,
  isPremium = false,
  onShowPremium 
}: QuickSanctuaryExplorerProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'worship' | 'learning' | 'community' | 'lifestyle'>('all');
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleItemClick = (item: QuickExplorerItem) => {
    if (item.isPremium && !isPremium) {
      if (onShowPremium) {
        onShowPremium();
      } else {
        onNavigate('premium');
      }
      return;
    }
    item.action();
  };

  const EXPLORER_ITEMS: QuickExplorerItem[] = [
    {
      id: 'quran',
      name: 'Noble Qur\'an',
      arabicName: 'القرآن الكريم',
      category: 'worship',
      icon: '📖',
      badge: '114 Surahs',
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-950/70 via-emerald-900/40 to-teal-950/60 border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('quran'),
      keywords: ['quran', 'surah', 'ayah', 'juz', 'recitation', 'tarteel', 'audio', 'mushaf']
    },
    {
      id: 'prayers',
      name: 'Prayer Times & Athan',
      arabicName: 'مواقيت الصلاة',
      category: 'worship',
      icon: '🕌',
      badge: 'Live Adhan',
      color: 'text-amber-300',
      bgGradient: 'from-amber-950/70 via-amber-900/40 to-orange-950/60 border-amber-500/30 hover:border-amber-400/70 hover:shadow-amber-500/20',
      image: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('prayer_times'),
      keywords: ['prayer', 'salah', 'namaz', 'athan', 'adhan', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    },
    {
      id: 'khatam',
      name: 'Khatam Journey',
      arabicName: 'رحلة الختمة',
      category: 'worship',
      icon: '🎬',
      badge: 'Broadcasts',
      color: 'text-rose-300',
      bgGradient: 'from-rose-950/70 via-rose-900/40 to-pink-950/60 border-rose-500/30 hover:border-rose-400/70 hover:shadow-rose-500/20',
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('khatam_journey'),
      keywords: ['khatam', 'journey', 'videos', 'reflections', 'finish quran', 'tafsir', 'broadcast']
    },
    {
      id: 'wisdom',
      name: 'Islamic Wisdom',
      arabicName: 'الحكمة الإسلامية',
      category: 'learning',
      icon: '💎',
      badge: 'Daily Pearls',
      color: 'text-cyan-300',
      bgGradient: 'from-cyan-950/70 via-cyan-900/40 to-blue-950/60 border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-cyan-500/20',
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('wisdom'),
      keywords: ['wisdom', 'etiquette', 'hadith', 'akhlaq', 'teachings', 'gems', 'quotes']
    },
    {
      id: 'qibla',
      name: 'Qibla Direction',
      arabicName: 'اتجاه القبلة',
      category: 'worship',
      icon: '🧭',
      badge: 'Compass AR',
      color: 'text-sky-300',
      bgGradient: 'from-sky-950/70 via-sky-900/40 to-blue-950/60 border-sky-500/30 hover:border-sky-400/70 hover:shadow-sky-500/20',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('qibla'),
      keywords: ['qibla', 'kaaba', 'makkah', 'compass', 'direction', 'mecca']
    },
    {
      id: 'tasbih',
      name: 'Digital Tasbih',
      arabicName: 'المسبحة الذكية',
      category: 'worship',
      icon: '📿',
      badge: 'Voice Count',
      color: 'text-purple-300',
      bgGradient: 'from-purple-950/70 via-purple-900/40 to-indigo-950/60 border-purple-500/30 hover:border-purple-400/70 hover:shadow-purple-500/20',
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('resources', { resId: 'tasbih' }),
      keywords: ['tasbih', 'dhikr', 'subhanallah', 'alhamdulillah', 'allahuakbar', 'counter', 'beads']
    },
    {
      id: 'adhkar',
      name: 'Supplications & Duas',
      arabicName: 'الأذكار والأدعية',
      category: 'worship',
      icon: '🤲',
      badge: 'Daily Duas',
      color: 'text-teal-300',
      bgGradient: 'from-teal-950/70 via-teal-900/40 to-emerald-950/60 border-teal-500/30 hover:border-teal-400/70 hover:shadow-teal-500/20',
      image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('resources', { resId: 'adhkar' }),
      keywords: ['dua', 'duas', 'adhkar', 'supplications', 'hisn', 'morning', 'evening', 'protection']
    },
    {
      id: 'five_pillars',
      name: '5 Pillars of Islam',
      arabicName: 'أركان الإسلام',
      category: 'learning',
      icon: '🏛️',
      badge: 'Foundations',
      color: 'text-yellow-300',
      bgGradient: 'from-yellow-950/70 via-amber-900/40 to-amber-950/60 border-yellow-500/30 hover:border-yellow-400/70 hover:shadow-yellow-500/20',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('resources', { resId: 'five_pillars' }),
      keywords: ['pillars', '5 pillars', 'arkan', 'shahada', 'salah', 'zakat', 'sawm', 'hajj']
    },
    {
      id: 'feed',
      name: 'NoorTalk Feed',
      arabicName: 'مجتمع نور توك',
      category: 'community',
      icon: '💬',
      badge: 'Ummah',
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-950/70 via-teal-900/40 to-teal-950/60 border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('ummah', { view: 'feed' }),
      keywords: ['feed', 'social', 'noortalk', 'ummah', 'community', 'posts', 'reflections', 'comments']
    },
    {
      id: 'companion',
      name: 'Habibi AI Scholar',
      arabicName: 'الرفيق الذكي',
      category: 'learning',
      icon: '✨',
      badge: 'Interactive AI',
      color: 'text-indigo-300',
      bgGradient: 'from-indigo-950/70 via-indigo-900/40 to-purple-950/60 border-indigo-500/30 hover:border-indigo-400/70 hover:shadow-indigo-500/20',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('companion'),
      keywords: ['ai', 'companion', 'ask', 'question', 'fatwa', 'scholar', 'chat', 'guidance']
    },
    {
      id: 'hadith',
      name: 'Hadith Library',
      arabicName: 'مكتبة الحديث',
      category: 'learning',
      icon: '📜',
      badge: 'Kutub Sittah',
      color: 'text-amber-300',
      bgGradient: 'from-amber-950/70 via-orange-900/40 to-amber-950/60 border-amber-500/30 hover:border-amber-400/70 hover:shadow-amber-500/20',
      image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('resources', { resId: 'hadith' }),
      keywords: ['hadith', 'bukhari', 'muslim', 'sunnah', 'prophet', 'sayings', 'traditions']
    },
    {
      id: 'names',
      name: '99 Names of Allah',
      arabicName: 'أسماء الله الحسنى',
      category: 'learning',
      icon: '✨',
      badge: 'Asma ul-Husna',
      color: 'text-cyan-300',
      bgGradient: 'from-cyan-950/70 via-teal-900/40 to-cyan-950/60 border-cyan-500/30 hover:border-cyan-400/70 hover:shadow-cyan-500/20',
      image: 'https://images.unsplash.com/photo-1583000212006-7e23730e625a?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('resources', { resId: 'names' }),
      keywords: ['names', 'allah', '99 names', 'asma', 'attributes', 'asmaulhusna']
    },
    {
      id: 'market',
      name: 'Suq Al-Mubaraki',
      arabicName: 'السوق المبارك',
      category: 'lifestyle',
      icon: '🛍️',
      badge: 'Halal Suq',
      color: 'text-amber-300',
      bgGradient: 'from-amber-950/70 via-amber-900/40 to-emerald-950/60 border-amber-500/30 hover:border-amber-400/70 hover:shadow-amber-500/20',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('market'),
      keywords: ['market', 'shop', 'halal', 'products', 'trade', 'buy', 'sell', 'suq']
    },
    {
      id: 'zakat',
      name: 'Zakat Calculator',
      arabicName: 'حاسبة الزكاة',
      category: 'lifestyle',
      icon: '💰',
      badge: 'Nisab Realtime',
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-950/70 via-emerald-900/40 to-teal-950/60 border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1611974717482-aa389182069e?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('resources', { resId: 'zakat' }),
      keywords: ['zakat', 'charity', 'nisab', 'calculator', 'wealth', 'gold', 'silver', 'sadaqah']
    },
    {
      id: 'hajj',
      name: 'Hajj & Umrah Guide',
      arabicName: 'دليل الحج والعمرة',
      category: 'learning',
      icon: '🕋',
      badge: 'Rituals Guide',
      color: 'text-yellow-300',
      bgGradient: 'from-yellow-950/70 via-yellow-900/40 to-amber-950/60 border-yellow-500/30 hover:border-yellow-400/70 hover:shadow-yellow-500/20',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=600',
      isPremium: true,
      action: () => onNavigate('resources', { resId: 'hajj_umrah' }),
      keywords: ['hajj', 'umrah', 'tawaf', 'sa\'i', 'makkah', 'madinah', 'ihram', 'pilgrimage']
    },
    {
      id: 'calendar',
      name: 'Sacred Calendar',
      arabicName: 'التقويم الهجري',
      category: 'lifestyle',
      icon: '📅',
      badge: 'Fasting & Eid',
      color: 'text-indigo-300',
      bgGradient: 'from-indigo-950/70 via-indigo-900/40 to-blue-950/60 border-indigo-500/30 hover:border-indigo-400/70 hover:shadow-indigo-500/20',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
      isPremium: false,
      action: () => onNavigate('resources', { resId: 'calendar_view' }),
      keywords: ['calendar', 'hijri', 'dates', 'islamic calendar', 'white days', 'fasting', 'events']
    }
  ];

  // Filter items by search query and category
  const filtered = EXPLORER_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const query = filterQuery.toLowerCase().trim();
    if (!query) return matchesCategory;
    const matchesText = 
      item.name.toLowerCase().includes(query) ||
      item.arabicName.includes(query) ||
      item.keywords.some(k => k.toLowerCase().includes(query));
    return matchesCategory && matchesText;
  });

  return (
    <section id="quick-sanctuary-explorer" className="w-full space-y-3.5 my-2">
      {/* 🌟 Top Quick Header with Search, Filter & Muslim Pro Lighter Theme Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-black/40 border border-white/10 p-3 sm:p-4 rounded-3xl backdrop-blur-xl shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
          <input
            type="text"
            placeholder="Quick search any feature (Quran, Qibla, Duas, 5 Pillars, Zakat)..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400/50 transition-all"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Features' },
            { id: 'worship', label: 'Worship' },
            { id: 'learning', label: 'Deen & Knowledge' },
            { id: 'community', label: 'Community' },
            { id: 'lifestyle', label: 'Life & Tools' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-md shadow-emerald-400/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 Instant Quick-Launch Grid (Compact, attractive, rich background image cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
        {filtered.map(item => {
          const isLocked = item.isPremium && !isPremium;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleItemClick(item)}
              className={`p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br ${item.bgGradient} border backdrop-blur-xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl group flex flex-col justify-between min-h-[82px] sm:min-h-[88px] relative overflow-hidden`}
            >
              {/* Card Background Image with Rich Vignette Overlay */}
              <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
                <img 
                  src={item.image} 
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover object-center opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 filter brightness-90 contrast-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30 pointer-events-none" />
              </div>

              {/* Top Micro-Row: Icon & Badges */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <span className="text-base sm:text-lg group-hover:scale-110 transition-transform drop-shadow-md select-none">
                  {item.icon}
                </span>

                <div className="flex items-center gap-1">
                  {isLocked ? (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/30 text-amber-300 border border-amber-500/50 backdrop-blur-md shadow-sm">
                      <Lock size={8} className="text-amber-300" />
                      PRO
                    </span>
                  ) : item.isPremium ? (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 backdrop-blur-md shadow-sm">
                      <Crown size={8} className="text-emerald-300" />
                      ELITE
                    </span>
                  ) : item.badge ? (
                    <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/15 text-white/90 border border-white/15 backdrop-blur-md truncate max-w-[85px] leading-tight select-none">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Bottom Info: Arabic Script & Title */}
              <div className="relative z-10 space-y-0.5 pt-1">
                <p className="font-arabic text-[10px] sm:text-[11px] text-amber-200/90 font-normal leading-tight truncate select-none drop-shadow-sm">
                  {item.arabicName}
                </p>
                <h4 className="text-[11px] sm:text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate tracking-tight select-none drop-shadow-sm flex items-center gap-1">
                  <span>{item.name}</span>
                  {isLocked && <Lock size={10} className="text-amber-400/80 inline shrink-0" />}
                </h4>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center bg-black/30 rounded-3xl border border-white/5 space-y-2">
          <p className="text-sm font-bold text-slate-300">No feature matching "{filterQuery}"</p>
          <button
            onClick={() => { setFilterQuery(''); setActiveCategory('all'); }}
            className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
          >
            Show All Sanctuary Features
          </button>
        </div>
      )}
    </section>
  );
}
