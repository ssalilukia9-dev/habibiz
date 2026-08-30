import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  BookOpen, 
  Scroll, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Share2, 
  Search, 
  ExternalLink, 
  Sparkles, 
  HardDrive, 
  WifiOff, 
  PlusCircle, 
  CheckCheck, 
  Filter, 
  Edit3, 
  Save, 
  X,
  Copy,
  Info
} from 'lucide-react';
import { readLaterService } from '../services/readLaterService.ts';
import { ReadLaterItem } from '../types.ts';
import { VoiceService } from '../services/voiceService.ts';
import { notificationService } from '../services/notificationService.ts';

interface ReadLaterQueueViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function ReadLaterQueueView({ onNavigate }: ReadLaterQueueViewProps) {
  const [items, setItems] = useState<ReadLaterItem[]>(() => readLaterService.getItems());
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read' | 'ayah' | 'hadith'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = readLaterService.subscribe((updatedItems) => {
      setItems(updatedItems);
    });
    return () => {
      unsubscribe();
      VoiceService.stop();
    };
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Type / Read filter
      if (activeFilter === 'unread' && item.isRead) return false;
      if (activeFilter === 'read' && !item.isRead) return false;
      if (activeFilter === 'ayah' && item.type !== 'ayah') return false;
      if (activeFilter === 'hadith' && item.type !== 'hadith') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesArabic = item.arabic.includes(q);
        const matchesTranslation = item.translation.toLowerCase().includes(q);
        const matchesSource = item.source.toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        return matchesTitle || matchesArabic || matchesTranslation || matchesSource || matchesNotes;
      }
      return true;
    });
  }, [items, activeFilter, searchQuery]);

  // Total reading time calculation
  const totalReadTimeMinutes = useMemo(() => {
    const unreadSecs = items
      .filter(i => !i.isRead)
      .reduce((acc, curr) => acc + (curr.estimatedReadTimeSeconds || 30), 0);
    return Math.max(1, Math.ceil(unreadSecs / 60));
  }, [items]);

  const unreadCount = items.filter(i => !i.isRead).length;

  const handleToggleRead = (id: string) => {
    const newStatus = readLaterService.toggleReadStatus(id);
    if (newStatus) {
      notificationService.notify('Completed Reading', 'Marked as read in your offline study queue.', 'system');
    }
  };

  const handleRemove = (id: string, title: string) => {
    if (playingId === id) {
      VoiceService.stop();
      setPlayingId(null);
    }
    readLaterService.removeItem(id);
    notificationService.notify('Item Removed', `Removed ${title} from queue.`, 'system');
  };

  const handlePlayAudio = (item: ReadLaterItem) => {
    if (playingId === item.id) {
      VoiceService.stop();
      setPlayingId(null);
      return;
    }

    VoiceService.stop();
    setPlayingId(item.id);

    // Speak with VoiceService
    VoiceService.speakBoth(
      item.arabic, 
      item.translation, 
      item.id,
      () => setPlayingId(null)
    );
  };

  const handleCopy = (item: ReadLaterItem) => {
    const textToCopy = `${item.title}\n\n${item.arabic}\n\n"${item.translation}"\n\n— Sanctuary OS Read Later Queue`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    notificationService.notify('Copied to Clipboard', 'Text copied successfully.', 'system');
  };

  const handleStartEditNotes = (item: ReadLaterItem) => {
    setEditingNoteId(item.id);
    setNoteDraft(item.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    readLaterService.updateNotes(id, noteDraft);
    setEditingNoteId(null);
    setNoteDraft('');
    notificationService.notify('Note Saved', 'Your reflection has been updated.', 'system');
  };

  const handleOpenSource = (item: ReadLaterItem) => {
    if (item.type === 'ayah' && item.surahNumber) {
      onNavigate('resources', { resId: 'quran', surahNumber: item.surahNumber });
    } else if (item.type === 'hadith') {
      onNavigate('resources', { resId: 'hadith', hadithId: item.hadithId });
    }
  };

  const handleSeedSamples = () => {
    readLaterService.seedSampleItems();
    notificationService.notify('Queue Initialized', 'Added 3 curated Quran & Hadith gems to your offline queue.', 'system');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Banner / Explanation Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-sidebar via-brand-depth to-slate-950 border border-brand-border p-6 md:p-8 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Clock size={13} className="text-amber-400" />
              <span>Offline-First Queue</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] text-amber-300/80 font-normal lowercase">distinct from permanent bookmarks</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Read Later Queue</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Save Ayahs and Hadiths for quick offline reading, study sessions, or commutes. Items remain cached in local storage without requiring internet access.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl md:text-2xl font-black text-white">{items.length}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In Queue</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl md:text-2xl font-black text-amber-400">{unreadCount}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unread</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl md:text-2xl font-black text-emerald-400">~{totalReadTimeMinutes}m</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Est. Time</div>
            </div>
          </div>
        </div>

        {/* Informational distinction callout */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-brand-primary shrink-0" />
            <span>Fully offline ready. Zero network connectivity required to study queued items.</span>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => readLaterService.markAllAsRead()}
                  className="hover:text-emerald-400 text-slate-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark All Read</span>
                </button>
              )}
              {items.some(i => i.isRead) && (
                <button
                  type="button"
                  onClick={() => readLaterService.clearCompleted()}
                  className="hover:text-amber-400 text-slate-400 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Completed</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            All Items ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Circle size={10} className={activeFilter === 'unread' ? 'fill-black' : 'fill-amber-400 text-amber-400'} />
            <span>Unread ({unreadCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('ayah')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'ayah'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <BookOpen size={13} />
            <span>Ayahs ({items.filter(i => i.type === 'ayah').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('hadith')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'hadith'
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <Scroll size={13} />
            <span>Hadiths ({items.filter(i => i.type === 'hadith').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('read')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'read'
                ? 'bg-slate-300 text-black shadow-lg'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Read ({items.filter(i => i.isRead).length})</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queue..."
            className="w-full bg-brand-sidebar border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="rounded-3xl bg-brand-sidebar/60 border border-dashed border-white/15 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Clock size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">
              {searchQuery ? "No matches found in your queue" : "Your Read Later Queue is empty"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery 
                ? "Try searching for a different keyword, Surah name, or Narrator."
                : "You can save any verse from the Holy Quran or Hadith from the Hadith Library to read later while traveling or offline."}
            </p>
          </div>

          {!searchQuery && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSeedSamples}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles size={14} />
                <span>Load Starter Reflection Gems</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('resources', { resId: 'quran' })}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen size={14} />
                <span>Browse Quran</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('resources', { resId: 'hadith' })}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Scroll size={14} />
                <span>Browse Hadith</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Queue Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden ${
              item.isRead 
                ? 'bg-brand-sidebar/40 border-white/5 opacity-80 hover:opacity-100' 
                : 'bg-brand-sidebar border-brand-border/80 hover:border-brand-primary/40 shadow-xl'
            }`}
          >
            <div className="p-5 md:p-6 space-y-4">
              {/* Header Bar of Card */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Type Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                    item.type === 'ayah'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-sky-500/15 border border-sky-500/30 text-sky-400'
                  }`}>
                    {item.type === 'ayah' ? <BookOpen size={11} /> : <Scroll size={11} />}
                    <span>{item.type === 'ayah' ? 'Ayah' : 'Hadith'}</span>
                  </span>

                  {/* Title & Source */}
                  <span className="text-sm md:text-base font-black text-white tracking-tight">
                    {item.title}
                  </span>

                  {/* Read Time Estimate */}
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock size={11} />
                    <span>~{item.estimatedReadTimeSeconds || 30}s read</span>
                  </span>

                  {/* Offline Cache Confirmed Tag */}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-medium border border-white/5">
                    <HardDrive size={10} className="text-emerald-400" />
                    <span>Saved Offline</span>
                  </span>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Mark Read/Unread Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleRead(item.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                      item.isRead
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {item.isRead ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-400 fill-emerald-400/20" />
                        <span className="hidden md:inline">Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle size={15} />
                        <span className="hidden md:inline">Mark Read</span>
                      </>
                    )}
                  </button>

                  {/* Listen / Voice Audio */}
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(item)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      playingId === item.id
                        ? 'bg-brand-primary text-black border-brand-primary animate-pulse shadow-lg shadow-brand-primary/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={playingId === item.id ? "Stop voice audio" : "Listen with voice audio"}
                  >
                    {playingId === item.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      copiedId === item.id
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Copy text"
                  >
                    <Copy size={15} />
                  </button>

                  {/* Open Source Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenSource(item)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title={item.type === 'ayah' ? "Open in Quran Surah" : "Open in Hadith Library"}
                  >
                    <ExternalLink size={15} />
                  </button>

                  {/* Delete / Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.title)}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
                    title="Remove from queue"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Subtitle / Context (if available) */}
              {item.subtitle && (
                <div className="text-xs text-brand-primary/80 font-medium">
                  {item.subtitle}
                </div>
              )}

              {/* Arabic Sacred Text */}
              <div 
                className="text-right font-arabic text-xl md:text-2xl text-amber-200/95 leading-loose py-2 tracking-wide select-text border-y border-white/5"
                dir="rtl"
              >
                {item.arabic}
              </div>

              {/* English Translation */}
              <div className="text-sm md:text-base text-slate-200 leading-relaxed font-serif italic select-text">
                "{item.translation}"
              </div>

              {/* Personal Notes / Reflection Section */}
              <div className="pt-2">
                {editingNoteId === item.id ? (
                  <div className="space-y-2 bg-black/40 p-3 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold flex items-center gap-1.5">
                        <Edit3 size={12} className="text-brand-primary" />
                        <span>Add Reflection / Study Note</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Write your thoughts, reflections, or reminders on this verse/hadith..."
                      rows={3}
                      className="w-full bg-brand-depth border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-all resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNoteId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(item.id)}
                        className="px-4 py-1.5 rounded-lg bg-brand-primary text-black text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-primary/20"
                      >
                        <Save size={13} />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 text-xs">
                    {item.notes ? (
                      <div className="flex-1 bg-white/5 p-2.5 rounded-xl border border-white/5 text-slate-300 text-xs flex items-start gap-2">
                        <Edit3 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="italic">{item.notes}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No notes attached</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartEditNotes(item)}
                      className="text-xs text-slate-400 hover:text-brand-primary font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>{item.notes ? 'Edit Note' : 'Add Note'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
