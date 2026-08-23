import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Layers, 
  Search, 
  X, 
  Eye, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  BookOpen, 
  FileText,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { 
  IslamicWisdomService, 
  IslamicTeachingItem, 
  DEFAULT_ISLAMIC_TEACHINGS 
} from '../services/islamicWisdomService.ts';

interface AdminWisdomManagerProps {
  currentUser?: any;
  onClose?: () => void;
  compact?: boolean;
}

const PRESET_IMAGES = [
  { label: '🕌 Mosque Light', url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000' },
  { label: '🕋 Sacred Kaaba', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1000' },
  { label: '📜 Quran Manuscript', url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000' },
  { label: '🌿 Sacred Mountain', url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1000' },
  { label: '✨ Islamic Arch', url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000' },
  { label: '🌅 Golden Dawn', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000' },
  { label: '💧 Water of Zamzam', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1000' }
];

export const AdminWisdomManager: React.FC<AdminWisdomManagerProps> = ({ 
  currentUser, 
  onClose,
  compact = false 
}) => {
  const [teachings, setTeachings] = useState<IslamicTeachingItem[]>(DEFAULT_ISLAMIC_TEACHINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<IslamicTeachingItem['category']>('daily_reminders');
  const [scholarOrSource, setScholarOrSource] = useState<string>('');
  const [arabicText, setArabicText] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [featured, setFeatured] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url' | 'presets'>('upload');
  
  // File upload state
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<IslamicTeachingItem | null>(null);

  // Bulk Modal
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<IslamicTeachingItem['category']>('daily_reminders');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState<boolean>(false);

  // Subscribe to live Firestore teachings
  useEffect(() => {
    setLoading(true);
    const unsubscribe = IslamicWisdomService.subscribeToTeachings((list) => {
      setTeachings(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Handle direct file upload with compression
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsCompressing(true);
      setUploadedFileName(file.name);
      const compressedDataUrl = await IslamicWisdomService.compressImageFile(file, 1200, 1200, 0.82);
      setImageUrl(compressedDataUrl);
      setIsCompressing(false);
      showToast(`Image "${file.name}" compressed and ready for Firestore upload!`);
    } catch (err: any) {
      setIsCompressing(false);
      alert(err.message || 'Failed to process image file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Submit single teaching card
  const handleAddTeaching = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please enter a title and teaching content.');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000';

    setIsSubmitting(true);
    const adminName = currentUser?.displayName || currentUser?.email || 'Super Admin';

    const res = await IslamicWisdomService.addTeaching({
      title: title.trim(),
      imageUrl: finalImage,
      category,
      categoryLabel: IslamicWisdomService.getCategoryLabel(category),
      arabicText: arabicText.trim(),
      content: content.trim(),
      scholarOrSource: scholarOrSource.trim() || 'Sacred Tradition',
      featured
    }, adminName);

    setIsSubmitting(false);

    if (res.success) {
      setTitle('');
      setContent('');
      setArabicText('');
      setScholarOrSource('');
      setImageUrl('');
      setUploadedFileName(null);
      setFeatured(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast(`Published Sacred Teaching: "${title.trim()}" to Firestore!`);
    } else {
      alert(res.error || 'Failed to publish teaching.');
    }
  };

  // Delete teaching 1-click
  const handleDeleteTeaching = async (item: IslamicTeachingItem) => {
    if (!window.confirm(`Permanently delete "${item.title}" from Islamic Wisdom repository?`)) {
      return;
    }

    const success = await IslamicWisdomService.deleteTeaching(item.id);
    if (success) {
      showToast(`Deleted teaching: "${item.title}"`);
    }
  };

  // Toggle featured
  const handleToggleFeatured = async (item: IslamicTeachingItem) => {
    const success = await IslamicWisdomService.toggleFeatured(item.id, !!item.featured);
    if (success) {
      showToast(item.featured ? `Unpinned "${item.title}"` : `⭐ Pinned "${item.title}" as Featured!`);
    }
  };

  // Bulk import
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setIsBulkSubmitting(true);
    const lines = bulkText.split(/[\r\n]+/).filter(Boolean);
    const parsedItems = lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      return {
        title: parts[0] || 'Sacred Reflection',
        imageUrl: parts[1] && parts[1].startsWith('http') ? parts[1] : 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
        content: parts[2] || parts[0] || 'Reflect upon the sacred wisdom.',
        scholarOrSource: parts[3] || 'Prophetic Sunnah',
        category: bulkCategory
      };
    });

    const res = await IslamicWisdomService.bulkAddTeachings(parsedItems, currentUser?.displayName || 'Admin');
    setIsBulkSubmitting(false);

    if (res.success) {
      setBulkText('');
      setShowBulkModal(false);
      showToast(`Bulk imported ${res.addedCount} teachings and picture cards!`);
    } else {
      alert(res.errors?.join('\n') || 'Failed to parse teachings.');
    }
  };

  // Filtered list
  const filteredTeachings = teachings.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      (t.arabicText && t.arabicText.includes(q)) ||
      (t.scholarOrSource && t.scholarOrSource.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xl flex items-center justify-between gap-3 border border-emerald-300"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionFeedback}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="p-1 hover:bg-black/10 rounded-lg">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-[2.5rem] border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-teal-950/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <GraduationCap size={13} className="text-emerald-400" /> Admin Wisdom & Picture Studio
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-mono">
              {teachings.length} Cards in Firestore
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {teachings.filter(t => t.featured).length} Featured
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">
            Islamic Wisdom & Picture Teachings Uploader
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Upload high-resolution teaching pictures directly into Firestore with simultaneous 1-click delete management — matching Khatam Journey media workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers size={15} />
            <span>Bulk Import</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Upload & Create Form */}
      <div className="glass-panel p-5 sm:p-7 rounded-[2.2rem] border-white/10 bg-slate-900/60 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Upload New Islamic Teaching Card
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px]">
            <button
              type="button"
              onClick={() => setImageInputMode('upload')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                imageInputMode === 'upload' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload size={12} /> File Upload
            </button>
            <button
              type="button"
              onClick={() => setImageInputMode('presets')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                imageInputMode === 'presets' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={12} /> Presets
            </button>
            <button
              type="button"
              onClick={() => setImageInputMode('url')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                imageInputMode === 'url' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon size={12} /> URL
            </button>
          </div>
        </div>

        <form onSubmit={handleAddTeaching} className="space-y-4">
          {/* Image Input Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Teaching Picture / Image Card *
            </label>

            {imageInputMode === 'upload' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/15 scale-[1.01]'
                    : imageUrl
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-white/15 bg-black/40 hover:border-emerald-400/50 hover:bg-white/[0.02]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isCompressing ? (
                  <div className="flex flex-col items-center gap-2 py-2 text-emerald-400">
                    <RefreshCw className="animate-spin" size={24} />
                    <span className="text-xs font-bold">Compressing image for Firestore storage...</span>
                  </div>
                ) : imageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                        <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 size={13} /> Image Ready to Save
                        </span>
                        <p className="text-slate-400 text-[11px] truncate max-w-xs font-mono">
                          {uploadedFileName || 'Custom Base64 / URL'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl('');
                        setUploadedFileName(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-bold text-white">
                      Click to choose image or drag & drop file here
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WebP (Automatically compressed & optimized for Firestore)
                    </p>
                  </div>
                )}
              </div>
            )}

            {imageInputMode === 'presets' && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        imageUrl === preset.url
                          ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md'
                          : 'border-white/10 bg-black/40 hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold truncate w-full">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {imageInputMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs font-mono outline-none focus:border-emerald-400"
                />
                {imageUrl && (
                  <div className="w-12 h-11 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Teaching Title / Topic *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mercy Towards All Creation / The Light of Sabr"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-emerald-400"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-emerald-400"
              >
                <option value="daily_reminders">Daily Reminders</option>
                <option value="hadith_pearls">Hadith Pearls</option>
                <option value="quran_insights">Quranic Insights</option>
                <option value="prophetic_sunnah">Prophetic Sunnah</option>
                <option value="akhlaq_character">Akhlaq & Character</option>
                <option value="spirituality">Inner Spirituality & Tazkiyah</option>
              </select>
            </div>

            {/* Scholar / Source */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Scholar / Authentic Source
              </label>
              <input
                type="text"
                value={scholarOrSource}
                onChange={(e) => setScholarOrSource(e.target.value)}
                placeholder="e.g. Sahih al-Bukhari / Imam Ibn al-Qayyim"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-emerald-400"
              />
            </div>

            {/* Arabic Matn */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Arabic Matn / Quranic Calligraphy (Optional)
              </label>
              <input
                dir="rtl"
                type="text"
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                placeholder="الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-amber-200 text-sm font-serif outline-none focus:border-emerald-400 text-right"
              />
            </div>

            {/* Reflection Content */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Spiritual Wisdom & Reflection *
              </label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the translation, explanation, context, and daily actionable benefit..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-emerald-400 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer Submit & Pin */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 accent-emerald-500 cursor-pointer"
              />
              <span>⭐ Pin as Featured at top of Islamic Wisdom page</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="animate-spin" size={15} /> : <Database size={15} />}
              <span>Save & Publish to Firestore</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simultaneous Live List & Delete Management */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teachings by title, content, scholar..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-9 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'hadith_pearls', label: 'Hadith' },
              { id: 'quran_insights', label: 'Quran' },
              { id: 'prophetic_sunnah', label: 'Sunnah' },
              { id: 'akhlaq_character', label: 'Akhlaq' },
              { id: 'spirituality', label: 'Spirituality' },
              { id: 'daily_reminders', label: 'Reminders' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  categoryFilter === c.id
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Teaching Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachings.map((item) => (
            <motion.div
              key={item.id}
              layout
              className={`glass-panel rounded-[2rem] border overflow-hidden flex flex-col justify-between shadow-xl transition-all ${
                item.featured
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/70 shadow-amber-500/10'
                  : 'border-white/10 bg-slate-900/50'
              }`}
            >
              <div>
                {/* Image Cover */}
                <div className="relative aspect-video bg-black/60 overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-emerald-300 text-[9px] font-black uppercase tracking-wider border border-white/10">
                    {item.categoryLabel || item.category}
                  </span>

                  {item.featured && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2.5">
                  <h4 className="text-sm font-black text-white line-clamp-2">{item.title}</h4>

                  {item.arabicText && (
                    <p className="text-xs text-amber-200/90 font-serif text-right line-clamp-1 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                      {item.arabicText}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>

                  <div className="text-[10px] text-slate-500 font-bold truncate">
                    Source: <span className="text-slate-300">{item.scholarOrSource || 'Tradition'}</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-black/40 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(item)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    item.featured
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400'
                  }`}
                >
                  ⭐ {item.featured ? 'Featured' : 'Pin'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Preview card"
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTeaching(item)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-rose-600/20"
                    title="Delete teaching"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredTeachings.length === 0 && (
            <div className="col-span-full py-12 text-center space-y-2 glass-panel rounded-3xl border-white/10 bg-slate-900/40">
              <GraduationCap size={32} className="mx-auto text-slate-600" />
              <p className="text-white font-bold text-sm">No teaching picture cards found</p>
              <p className="text-xs text-slate-400">Use the form above to upload your first Islamic wisdom card.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: PREVIEW ITEM */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl space-y-4"
            >
              <div className="relative aspect-video w-full bg-black">
                <img src={previewItem.imageUrl} alt={previewItem.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md text-emerald-300 text-xs font-black uppercase tracking-wider border border-white/10">
                  {previewItem.categoryLabel || previewItem.category}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white">{previewItem.title}</h3>

                {previewItem.arabicText && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
                    <p className="text-lg font-serif text-amber-200 leading-loose">{previewItem.arabicText}</p>
                  </div>
                )}

                <p className="text-xs text-slate-300 leading-relaxed">{previewItem.content}</p>

                <div className="pt-2 text-xs text-slate-400 font-medium">
                  Source: <span className="text-white font-bold">{previewItem.scholarOrSource || 'Classical Sunnah'}</span>
                </div>

                <button
                  onClick={() => setPreviewItem(null)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold cursor-pointer transition-all"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: BULK IMPORT */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-7 space-y-5 shadow-3xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Bulk Import Wisdom Cards</h3>
                    <p className="text-[11px] text-slate-400">Import multiple reflections and pictures at once</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Assign Category
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl py-2.5 px-3.5 text-white text-xs outline-none focus:border-teal-400"
                  >
                    <option value="daily_reminders">Daily Reminders</option>
                    <option value="hadith_pearls">Hadith Pearls</option>
                    <option value="quran_insights">Quranic Insights</option>
                    <option value="prophetic_sunnah">Prophetic Sunnah</option>
                    <option value="akhlaq_character">Akhlaq & Character</option>
                    <option value="spirituality">Inner Spirituality</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Format: Title | Image URL | Content | Scholar
                  </label>
                  <textarea
                    required
                    rows={7}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`Mercy in Islam | https://images.unsplash.com/photo-1542810634-71277d95dcbb | The Prophet (pbuh) said be merciful to those on earth. | Sunan Tirmidhi\nThe Light of Sabr | https://images.unsplash.com/photo-1564769625905-50e93615e769 | Sabr brings unseen peace. | Surah Az-Zumar`}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-3.5 text-white font-mono text-xs outline-none focus:border-teal-400 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-[10px] text-slate-400 font-mono">
                    {bulkText.split(/[\r\n]+/).filter(l => l.trim().length > 0).length} entries detected
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(false)}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isBulkSubmitting}
                      className="px-5 py-2.5 bg-teal-500 text-slate-950 font-black rounded-xl text-xs uppercase transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isBulkSubmitting ? 'Importing...' : 'Import Cards'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
