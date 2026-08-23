import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Search,
  Share2,
  Heart,
  Eye,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shield,
  Plus,
  Maximize2,
  X,
  ExternalLink,
  Award,
  BookMarked,
  Filter,
  CheckCircle2,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { 
  IslamicWisdomService, 
  IslamicTeachingItem, 
  DEFAULT_ISLAMIC_TEACHINGS 
} from '../services/islamicWisdomService.ts';

interface IslamicWisdomViewProps {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
  currentUser?: any;
  onOpenAdmin?: () => void;
  searchQuery?: string;
  isPremium?: boolean;
  onShowPremium?: () => void;
}

export default function IslamicWisdomView({
  onBack,
  addHasanat,
  currentUser,
  onOpenAdmin,
  searchQuery: externalSearch = '',
  isPremium,
  onShowPremium
}: IslamicWisdomViewProps) {
  const [teachings, setTeachings] = useState<IslamicTeachingItem[]>(DEFAULT_ISLAMIC_TEACHINGS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [internalSearch, setInternalSearch] = useState<string>('');
  const [activeTeaching, setActiveTeaching] = useState<IslamicTeachingItem | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readTeachingIds, setReadTeachingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_read_teachings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedTeachingIds, setLikedTeachingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_liked_teachings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to real-time teachings from Firestore
  useEffect(() => {
    const unsub = IslamicWisdomService.subscribeToTeachings((list) => {
      setTeachings(list);
      if (!activeTeaching && list.length > 0) {
        setActiveTeaching(list[0]);
      }
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyTeaching = (item: IslamicTeachingItem) => {
    const text = `📖 "${item.title}"\n\n${item.arabicText ? item.arabicText + '\n\n' : ''}${item.content}\n\n— Source: ${item.scholarOrSource || 'Sacred Tradition'}\nShared via Sanctuary Islamic Wisdom`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    showToast('Teaching copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLikeTeaching = (id: string) => {
    let next: string[];
    if (likedTeachingIds.includes(id)) {
      next = likedTeachingIds.filter(i => i !== id);
    } else {
      next = [...likedTeachingIds, id];
      if (addHasanat) addHasanat(15);
      showToast('+15 Hasanat! Reflection saved to your heart ✨');
    }
    setLikedTeachingIds(next);
    localStorage.setItem('sanctuary_liked_teachings', JSON.stringify(next));
  };

  const handleMarkAsRead = (item: IslamicTeachingItem) => {
    if (readTeachingIds.includes(item.id)) return;
    const next = [...readTeachingIds, item.id];
    setReadTeachingIds(next);
    localStorage.setItem('sanctuary_read_teachings', JSON.stringify(next));
    if (addHasanat) addHasanat(25);
    showToast(`Claimed +25 Hasanat for reflecting upon "${item.title.slice(0, 24)}..." 🌟`);
  };

  const query = (internalSearch || externalSearch).toLowerCase().trim();

  const filteredTeachings = useMemo(() => {
    return teachings.filter(t => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory;
      const matchQuery = !query ||
        t.title.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        (t.arabicText && t.arabicText.includes(query)) ||
        (t.scholarOrSource && t.scholarOrSource.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  }, [teachings, activeCategory, query]);

  const categories = [
    { id: 'all', label: 'All Wisdom' },
    { id: 'hadith_pearls', label: 'Hadith Pearls' },
    { id: 'quran_insights', label: 'Quranic Insights' },
    { id: 'prophetic_sunnah', label: 'Prophetic Sunnah' },
    { id: 'akhlaq_character', label: 'Akhlaq & Character' },
    { id: 'spirituality', label: 'Tazkiyah & Heart' },
    { id: 'daily_reminders', label: 'Daily Reminders' },
  ];

  return (
    <div className="min-h-screen pb-32 text-white space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-emerald-300"
          >
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Picture Lightbox Modal */}
      <AnimatePresence>
        {selectedImageModal && (
          <div 
            onClick={() => setSelectedImageModal(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImageModal} 
                alt="Sacred Teaching Visual" 
                className="w-full h-full object-contain max-h-[85vh] bg-slate-950" 
              />
              <button
                onClick={() => setSelectedImageModal(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors cursor-pointer border border-white/20"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">
        {/* Header Hero Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-[3rem] border-white/10 bg-gradient-to-br from-emerald-600/15 via-brand-depth to-black/85 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-emerald-400" /> Sacred Ilm Repository
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                  {teachings.length} Curated Teachings
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-black uppercase tracking-wider">
                  {readTeachingIds.length} Studied
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl font-black text-white italic tracking-tight flex items-center gap-3">
                <span>Islamic</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Wisdom</span>
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Explore sacred teachings, authentic Prophetic pearls, inspiring picture cards, and heart-softening spiritual lessons uploaded directly by scholars & administrators.
              </p>
            </div>

            {/* Quick Actions & Admin Upload Navigation */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <Shield size={16} />
                  <span>Admin Upload Teachings</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-400/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* In-page Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search teachings, scholars..."
                value={internalSearch}
                onChange={(e) => setInternalSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
              {internalSearch && (
                <button
                  onClick={() => setInternalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Featured Wisdom Spotlight (if available) */}
        {filteredTeachings.some(t => t.featured) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Sparkles size={16} className="text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Featured Teachings of the Week</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTeachings.filter(t => t.featured).slice(0, 2).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="glass-panel border-white/10 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-white/[0.04] to-black/60 shadow-xl flex flex-col group"
                >
                  {/* Image with zoom click */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedImageModal(item.imageUrl)}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-lg">
                        {item.categoryLabel || item.category}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} /> Featured
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageModal(item.imageUrl);
                      }}
                      className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors border border-white/10"
                      title="View Fullscreen Picture"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                        {item.title}
                      </h3>

                      {item.arabicText && (
                        <p className="text-right font-serif text-lg font-bold text-amber-200/90 leading-relaxed bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10">
                          {item.arabicText}
                        </p>
                      )}

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400 font-medium">
                        <span>Source: </span>
                        <span className="font-bold text-white">{item.scholarOrSource || 'Sacred Tradition'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLikeTeaching(item.id)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            likedTeachingIds.includes(item.id)
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                          }`}
                          title="Love Teaching"
                        >
                          <Heart size={14} className={likedTeachingIds.includes(item.id) ? 'fill-rose-400' : ''} />
                        </button>
                        <button
                          onClick={() => handleCopyTeaching(item)}
                          className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy Teaching"
                        >
                          {copiedId === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => handleMarkAsRead(item)}
                          disabled={readTeachingIds.includes(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            readTeachingIds.includes(item.id)
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          }`}
                        >
                          {readTeachingIds.includes(item.id) ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>Studied</span>
                            </>
                          ) : (
                            <>
                              <Award size={12} />
                              <span>+25 Hasanat</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Teachings Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Wisdom & Teachings Gallery ({filteredTeachings.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Click any photo to enlarge
            </span>
          </div>

          {filteredTeachings.length === 0 ? (
            <div className="glass-panel border-white/10 rounded-[2.5rem] p-12 text-center space-y-4">
              <GraduationCap size={40} className="text-slate-500 mx-auto" />
              <h3 className="text-base font-black text-white">No teachings found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search terms or filter category.</p>
              {onOpenAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
                >
                  Upload First Teaching via Admin Hub
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachings.map((item) => {
                const isRead = readTeachingIds.includes(item.id);
                const isLiked = likedTeachingIds.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    whileHover={{ y: -4 }}
                    className="glass-panel border-white/10 rounded-[2.2rem] overflow-hidden bg-slate-900/60 shadow-xl flex flex-col justify-between group"
                  >
                    {/* Picture area */}
                    <div 
                      className="relative h-48 w-full overflow-hidden bg-slate-950 cursor-pointer"
                      onClick={() => setSelectedImageModal(item.imageUrl)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <span className="absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                        {item.categoryLabel || item.category}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageModal(item.imageUrl);
                        }}
                        className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors border border-white/10"
                        title="View Fullscreen"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>

                    {/* Content area */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-black text-white text-sm group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        {item.arabicText && (
                          <p className="text-right font-serif text-sm font-bold text-amber-200/90 leading-relaxed bg-amber-500/5 p-2 rounded-xl border border-amber-500/10 line-clamp-2">
                            {item.arabicText}
                          </p>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                          {item.content}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="pt-3.5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]">
                          {item.scholarOrSource || 'Sacred Tradition'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLikeTeaching(item.id)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLiked
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                            }`}
                            title="Love Teaching"
                          >
                            <Heart size={13} className={isLiked ? 'fill-rose-400' : ''} />
                          </button>
                          
                          <button
                            onClick={() => handleCopyTeaching(item)}
                            className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Teaching"
                          >
                            {copiedId === item.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>

                          <button
                            onClick={() => handleMarkAsRead(item)}
                            disabled={isRead}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
                              isRead
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                            }`}
                          >
                            {isRead ? (
                              <>
                                <Check size={11} />
                                <span>Read</span>
                              </>
                            ) : (
                              <>
                                <Award size={11} />
                                <span>+25</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
