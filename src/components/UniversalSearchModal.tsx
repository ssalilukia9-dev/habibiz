import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  BookOpen, 
  Moon, 
  Sparkles, 
  Baby, 
  X, 
  ArrowRight, 
  Layers,
  FileText
} from 'lucide-react';
import { SURAH_LIST } from '../constants';
import { HADITH_DATABASE } from '../data/hadiths';
import { ALL_ADHKAR_CATEGORIES } from '../data/adhkarData';
import { ALL_NAMES_OF_ALLAH } from '../data/namesOfAllahData';
import { ISLAMIC_BABY_NAMES } from '../data/islamicBabyNamesData';

export interface SearchResultItem {
  id: string;
  type: 'quran' | 'hadith' | 'adhkar' | 'name_of_allah' | 'baby_name';
  title: string;
  arabic?: string;
  subtitle: string;
  snippet: string;
  badge: string;
  category: string;
  extraData?: any;
}

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extra?: any) => void;
  initialQuery?: string;
}

export default function UniversalSearchModal({
  isOpen,
  onClose,
  onNavigate,
  initialQuery = ''
}: UniversalSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'quran' | 'hadith' | 'adhkar' | 'names'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, initialQuery]);

  // Keyboard shortcut listener (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Unified index of all items
  const allIndexedItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Quran Surahs (114 Surahs)
    SURAH_LIST.forEach(surah => {
      items.push({
        id: `quran-${surah.number}`,
        type: 'quran',
        title: `Surah ${surah.englishName} (${surah.name})`,
        arabic: surah.name,
        subtitle: `Surah ${surah.number} • ${surah.englishNameTranslation} • ${surah.numberOfAyahs} Verses`,
        snippet: `${surah.revelationType} Revelation. Verses: ${surah.numberOfAyahs}. Meaning: ${surah.englishNameTranslation}`,
        badge: `Quran Surah #${surah.number}`,
        category: 'Holy Quran',
        extraData: { surahNumber: surah.number, surah }
      });
    });

    // 2. Prophetic Hadiths
    HADITH_DATABASE.forEach((hadith) => {
      items.push({
        id: `hadith-${hadith.id}`,
        type: 'hadith',
        title: `${hadith.collection} - Hadith #${hadith.id}`,
        arabic: hadith.arabic,
        subtitle: `Narrated by ${hadith.narrator || 'The Prophet (ﷺ)'} • Topic: ${hadith.topic}`,
        snippet: hadith.english,
        badge: hadith.topic || 'Prophetic Sunnah',
        category: 'Hadith Library',
        extraData: { hadith }
      });
    });

    // 3. Adhkar & Duas
    ALL_ADHKAR_CATEGORIES.forEach(cat => {
      cat.items.forEach((adhkar, idx) => {
        items.push({
          id: `adhkar-${cat.id}-${idx}`,
          type: 'adhkar',
          title: `${cat.category}`,
          arabic: adhkar.arabic,
          subtitle: `${cat.category} • Repeat: ${adhkar.targetCount || 1}x`,
          snippet: `${adhkar.english || ''} • Benefit: ${adhkar.benefit || ''}`,
          badge: cat.id,
          category: 'Adhkar & Duas',
          extraData: { categoryId: cat.id, adhkar }
        });
      });
    });

    // 4. 99 Names of Allah (Asma ul-Husna)
    ALL_NAMES_OF_ALLAH.forEach(name => {
      items.push({
        id: `allah-name-${name.id}`,
        type: 'name_of_allah',
        title: `${name.transliteration} (${name.arabic})`,
        arabic: name.arabic,
        subtitle: `#${name.id} of Asma ul-Husna • ${name.english}`,
        snippet: name.meaning || name.english,
        badge: '99 Names of Allah',
        category: 'Asma ul-Husna',
        extraData: { nameNumber: name.id }
      });
    });

    // 5. Islamic Baby Names
    ISLAMIC_BABY_NAMES.forEach(babyName => {
      items.push({
        id: `baby-${babyName.id}`,
        type: 'baby_name',
        title: `${babyName.name} (${babyName.arabic})`,
        arabic: babyName.arabic,
        subtitle: `${babyName.gender === 'boy' ? 'Boy Name 👦' : 'Girl Name 👧'} • Meaning: ${babyName.meaning}`,
        snippet: `Origin: ${babyName.origin} • Pronunciation: ${babyName.pronunciation}`,
        badge: babyName.isQuranic ? 'Quranic Name' : 'Islamic Name',
        category: 'Baby Names',
        extraData: { babyName }
      });
    });

    return items;
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Return curated quick-access items when search is empty
      return allIndexedItems.slice(0, 15);
    }

    return allIndexedItems.filter(item => {
      if (activeFilter === 'quran' && item.type !== 'quran') return false;
      if (activeFilter === 'hadith' && item.type !== 'hadith') return false;
      if (activeFilter === 'adhkar' && item.type !== 'adhkar') return false;
      if (activeFilter === 'names' && item.type !== 'name_of_allah' && item.type !== 'baby_name') return false;

      return (
        item.title.toLowerCase().includes(q) ||
        (item.arabic && item.arabic.includes(q)) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.snippet.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }).slice(0, 40); // Max 40 quick results for speed
  }, [allIndexedItems, query, activeFilter]);

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();
    if (item.type === 'quran') {
      onNavigate('resources', { resId: 'quran', selectedSurah: item.extraData?.surah });
    } else if (item.type === 'hadith') {
      onNavigate('resources', { resId: 'hadith' });
    } else if (item.type === 'adhkar') {
      onNavigate('resources', { resId: 'adhkar', selectedCategory: item.extraData?.categoryId });
    } else if (item.type === 'name_of_allah') {
      onNavigate('resources', { resId: 'names' });
    } else if (item.type === 'baby_name') {
      onNavigate('resources', { resId: 'babynames' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-start justify-center p-4 sm:p-6 md:pt-20 bg-black/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl bg-gradient-to-b from-[#0A1A2F] via-[#06121E] to-black border-2 border-brand-primary/40 rounded-[2.5rem] p-6 shadow-[0_0_80px_rgba(0,0,0,0.95)] space-y-6 overflow-hidden relative"
        >
          {/* Header Search Input */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">
                  Universal Sanctuary Search
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Search 114 Surahs, Hadiths, Adhkar & Duas, 99 Names, and Baby Names
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 'Al-Mulk', 'Yasin', 'Intentions', 'Morning Dua', 'Muhammad'..."
              className="w-full pl-12 pr-10 py-4 bg-black/60 border border-brand-primary/30 rounded-2xl text-white placeholder-slate-500 text-sm md:text-base focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Resources', icon: Layers },
              { id: 'quran', label: 'Holy Quran (114)', icon: BookOpen },
              { id: 'hadith', label: 'Hadith Library', icon: FileText },
              { id: 'adhkar', label: 'Adhkar & Duas', icon: Moon },
              { id: 'names', label: 'Names & Babies', icon: Baby }
            ].map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    activeFilter === f.id
                      ? 'bg-brand-primary text-brand-depth border-brand-primary shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={13} />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
            {searchResults.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                whileHover={{ scale: 1.01, x: 3 }}
                className="w-full text-left p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-brand-primary/40 transition-all flex items-start justify-between gap-4 group cursor-pointer"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[9px] font-black uppercase tracking-wider">
                      {item.badge}
                    </span>
                    <h4 className="text-sm font-black text-white group-hover:text-brand-primary transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {item.arabic && (
                    <span className="text-lg font-serif font-black text-amber-300 font-arabic">
                      {item.arabic}
                    </span>
                  )}
                  <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-brand-primary group-hover:text-brand-depth text-slate-400 flex items-center justify-center transition-all">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.button>
            ))}

            {searchResults.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <Search size={36} className="text-slate-600 mx-auto" />
                <h4 className="text-base font-black text-white">No results found for "{query}"</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try searching for Quran Surahs (e.g., 'Al-Fatiha', 'Yasin'), Hadith terms, or Dua supplications.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
