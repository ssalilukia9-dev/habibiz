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
  Award
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
  action: () => void;
  keywords: string[];
}

interface QuickSanctuaryExplorerProps {
  onNavigate: (tab: string, extra?: any) => void;
  currentTheme?: string;
  setTheme?: (theme: string) => void;
}

export default function QuickSanctuaryExplorer({ onNavigate, currentTheme = 'aloha', setTheme }: QuickSanctuaryExplorerProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'worship' | 'learning' | 'community' | 'lifestyle'>('all');
  const [showThemePicker, setShowThemePicker] = useState(false);

  const EXPLORER_ITEMS: QuickExplorerItem[] = [
    {
      id: 'quran',
      name: 'Noble Qur\'an',
      arabicName: 'القرآن الكريم',
      category: 'worship',
      icon: '📖',
      badge: '114 Surahs',
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      action: () => onNavigate('quran'),
      keywords: ['quran', 'surah', 'ayah', 'juz', 'recitation', 'tarteel', 'audio', 'mushaf']
    },
    {
      id: 'prayers',
      name: 'Prayer Times & Athan',
      arabicName: 'مواقيت الصلاة والأذان',
      category: 'worship',
      icon: '🕌',
      badge: 'Live Adhan',
      color: 'text-amber-300',
      bgGradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      action: () => onNavigate('prayer_times'),
      keywords: ['prayer', 'salah', 'namaz', 'athan', 'adhan', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
    },
    {
      id: 'qibla',
      name: 'Qibla Direction',
      arabicName: 'اتجاه القبلة المباشر',
      category: 'worship',
      icon: '🧭',
      badge: 'Compass AR',
      color: 'text-sky-300',
      bgGradient: 'from-sky-500/20 to-blue-500/10 border-sky-500/30',
      action: () => onNavigate('qibla'),
      keywords: ['qibla', 'kaaba', 'makkah', 'compass', 'direction', 'mecca']
    },
    {
      id: 'tasbih',
      name: 'Digital Tasbih',
      arabicName: 'المسبحة الإلكترونية',
      category: 'worship',
      icon: '📿',
      badge: 'Voice & Touch',
      color: 'text-purple-300',
      bgGradient: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
      action: () => onNavigate('resources', { resId: 'tasbih' }),
      keywords: ['tasbih', 'dhikr', 'subhanallah', 'alhamdulillah', 'allahuakbar', 'counter', 'beads']
    },
    {
      id: 'adhkar',
      name: 'Supplications & Duas',
      arabicName: 'الأذكار والأدعية',
      category: 'worship',
      icon: '🤲',
      badge: 'Morning/Eve',
      color: 'text-teal-300',
      bgGradient: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30',
      action: () => onNavigate('resources', { resId: 'adhkar' }),
      keywords: ['dua', 'duas', 'adhkar', 'supplications', 'hisn', 'morning', 'evening', 'protection']
    },
    {
      id: 'five_pillars',
      name: '5 Pillars of Islam',
      arabicName: 'أركان الإسلام الخمسة',
      category: 'learning',
      icon: '🏛️',
      badge: 'Core Deen',
      color: 'text-amber-300',
      bgGradient: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
      action: () => onNavigate('resources', { resId: 'five_pillars' }),
      keywords: ['pillars', '5 pillars', 'arkan', 'shahada', 'salah', 'zakat', 'sawm', 'hajj']
    },
    {
      id: 'feed',
      name: 'NoorTalk Social Feed',
      arabicName: 'مجتمع نور توك',
      category: 'community',
      icon: '💬',
      badge: 'Live Ummah',
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      action: () => onNavigate('ummah', { view: 'feed' }),
      keywords: ['feed', 'social', 'noortalk', 'ummah', 'community', 'posts', 'reflections', 'comments']
    },
    {
      id: 'companion',
      name: 'Habibi AI Companion',
      arabicName: 'الرفيق الذكي',
      category: 'learning',
      icon: '✨',
      badge: 'AI Scholar',
      color: 'text-indigo-300',
      bgGradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
      action: () => onNavigate('companion'),
      keywords: ['ai', 'companion', 'ask', 'question', 'fatwa', 'scholar', 'chat', 'guidance']
    },
    {
      id: 'hadith',
      name: 'Prophetic Hadith Library',
      arabicName: 'مكتبة الحديث الشريف',
      category: 'learning',
      icon: '📜',
      badge: 'Authentic Sunnah',
      color: 'text-amber-300',
      bgGradient: 'from-amber-500/20 to-rose-500/10 border-amber-500/30',
      action: () => onNavigate('resources', { resId: 'hadith' }),
      keywords: ['hadith', 'bukhari', 'muslim', 'sunnah', 'prophet', 'sayings', 'traditions']
    },
    {
      id: 'names',
      name: '99 Names of Allah',
      arabicName: 'أسماء الله الحسنى',
      category: 'learning',
      icon: '💎',
      badge: 'Asma ul-Husna',
      color: 'text-cyan-300',
      bgGradient: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
      action: () => onNavigate('resources', { resId: 'names' }),
      keywords: ['names', 'allah', '99 names', 'asma', 'attributes', 'asmaulhusna']
    },
    {
      id: 'market',
      name: 'Suq Al-Mubaraki',
      arabicName: 'السوق المبارك',
      category: 'lifestyle',
      icon: '🛍️',
      badge: 'Halal Trade',
      color: 'text-amber-300',
      bgGradient: 'from-amber-500/20 to-emerald-500/10 border-amber-500/30',
      action: () => onNavigate('market'),
      keywords: ['market', 'shop', 'halal', 'products', 'trade', 'buy', 'sell', 'suq']
    },
    {
      id: 'zakat',
      name: 'Zakat Calculator',
      arabicName: 'حاسبة الزكاة الذكية',
      category: 'lifestyle',
      icon: '💰',
      badge: 'Gold & Wealth',
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      action: () => onNavigate('resources', { resId: 'zakat' }),
      keywords: ['zakat', 'charity', 'nisab', 'calculator', 'wealth', 'gold', 'silver', 'sadaqah']
    },
    {
      id: 'hajj',
      name: 'Hajj & Umrah Guide',
      arabicName: 'دليل الحج والعمرة',
      category: 'learning',
      icon: '🕋',
      badge: 'Interactive Rituals',
      color: 'text-yellow-300',
      bgGradient: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
      action: () => onNavigate('resources', { resId: 'hajj_umrah' }),
      keywords: ['hajj', 'umrah', 'tawaf', 'sa\'i', 'makkah', 'madinah', 'ihram', 'pilgrimage']
    },
    {
      id: 'babynames',
      name: 'Islamic Baby Names',
      arabicName: 'أسماء المواليد الإسلامية',
      category: 'lifestyle',
      icon: '👶',
      badge: '1000+ Meanings',
      color: 'text-rose-300',
      bgGradient: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
      action: () => onNavigate('resources', { resId: 'babynames' }),
      keywords: ['baby', 'names', 'meanings', 'boy', 'girl', 'arabic', 'islamic names']
    },
    {
      id: 'calendar',
      name: 'Hijri Sacred Calendar',
      arabicName: 'التقويم الهجري المبارك',
      category: 'lifestyle',
      icon: '📅',
      badge: 'White Days & Eid',
      color: 'text-indigo-300',
      bgGradient: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30',
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

      {/* 🌟 Instant Quick-Launch Grid (Light, cool, accessible cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {filtered.map(item => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.025, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={item.action}
            className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${item.bgGradient} border backdrop-blur-xl cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl group flex flex-col justify-between min-h-[105px]`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.badge && (
                <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/10">
                  {item.badge}
                </span>
              )}
            </div>

            <div className="space-y-0.5 pt-2">
              <p className="font-arabic text-[11px] text-amber-200/80 font-normal leading-tight">
                {item.arabicName}
              </p>
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-200 transition-colors truncate">
                {item.name}
              </h4>
            </div>
          </motion.div>
        ))}
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
