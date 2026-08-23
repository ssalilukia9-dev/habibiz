import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Image as ImageIcon, 
  Sparkles, 
  Smile, 
  Globe, 
  Users, 
  Lock, 
  Trophy, 
  Plus, 
  Trash2, 
  Check, 
  ChevronDown, 
  Hash, 
  BookOpen, 
  Heart, 
  Send, 
  Sliders, 
  ShieldCheck, 
  Layers,
  Wand2,
  Camera,
  UploadCloud
} from 'lucide-react';

export type PostPrivacy = 'public' | 'friends';

export interface CreatePostPayload {
  content: string;
  caption?: string;
  category: string;
  privacy: PostPrivacy;
  image?: string | null;
  bgStyle: string;
  poll?: {
    options: { id: string; text: string; votes: number }[];
    totalVotes: number;
    userSelections?: Record<string, string>;
  };
  filterPreset?: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePostPayload) => Promise<void> | void;
  currentUser: { uid: string; displayName: string };
  initialCategory?: string;
}

const FEELING_OPTIONS = [
  { emoji: '✨', label: 'Blessed', prefix: 'Feeling blessed today ✨ ' },
  { emoji: '🤲', label: 'Seeking Peace', prefix: 'Hoping for peace & ease in my heart today 🤲 ' },
  { emoji: '🕊️', label: 'Grateful', prefix: 'Full of gratitude today 🕊️ ' },
  { emoji: '🌿', label: 'Reflective', prefix: 'Deep in spiritual thought today 🌿 ' },
  { emoji: '💪', label: 'Determined', prefix: 'Ready to do good deeds today 💪 ' },
  { emoji: '🌧️', label: 'Need Duas', prefix: 'Please keep me in your sincere duas today 🌧️ ' },
  { emoji: '🌙', label: 'Ramadan Joy', prefix: 'Basking in the light of worship 🌙 ' },
  { emoji: '📖', label: 'Quran Light', prefix: 'Touched by a verse from the Holy Quran 📖 ' }
];

const TEMPLATES = [
  { label: '💖 How I Feel', text: '💖 Today I am feeling: ' },
  { label: '💡 Alhamdulillah', text: '💡 Alhamdulillah for this blessing today: ' },
  { label: '🤲 Dua for the Ummah', text: '🤲 Ya Allah, grant ease, protection, and shifa to everyone struggling today...' },
  { label: '📖 Quranic Gem', text: '📖 Quran Reflection: When reciting today, I was reminded that...' },
  { label: '✨ Hadith Reminder', text: '✨ The Prophet ﷺ said: "The best among you are those who have the best manners and character."' },
  { label: '❓ Ask Ummah', text: '❓ Question to the Ummah: What gives you peace when you are feeling overwhelmed?' }
];

const POPULAR_TAGS = [
  '#Alhamdulillah',
  '#QuranReflection',
  '#DailyDua',
  '#HalalLifestyle',
  '#SpiritualGrowth',
  '#JummahMubarak',
  '#UmmahUnited',
  '#PeaceOfHeart'
];

const BG_THEMES = [
  { id: 'default', label: 'Clean Glass', preview: 'bg-slate-800' },
  { id: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-emerald-200 border-emerald-500/30', label: 'Emerald Noor', preview: 'bg-emerald-700' },
  { id: 'bg-gradient-to-br from-amber-950 via-stone-900 to-slate-950 text-amber-200 border-amber-500/30', label: 'Golden Hour', preview: 'bg-amber-600' },
  { id: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950 text-purple-200 border-purple-500/30', label: 'Medina Night', preview: 'bg-indigo-700' },
  { id: 'bg-gradient-to-br from-rose-950 via-pink-950 to-slate-950 text-rose-200 border-rose-500/30', label: 'Rose Velvet', preview: 'bg-rose-700' }
];

const IMAGE_FILTERS = [
  { id: 'none', label: 'Original', class: '' },
  { id: 'warm', label: 'Warm Dawn', class: 'sepia-[0.25] saturate-125' },
  { id: 'emerald', label: 'Emerald Glow', class: 'hue-rotate-15 contrast-105' },
  { id: 'golden', label: 'Golden Hour', class: 'brightness-105 saturate-150' },
  { id: 'bw', label: 'Sakinah B&W', class: 'grayscale contrast-125' }
];

const TOPICS = [
  'How I Feel',
  'General & Life',
  'Spiritual Reminders',
  'Gratitude & Joy',
  'Reflections',
  'Quran & Tafsir',
  'Hadith Studies',
  'Dua & Prayer',
  'Halal Lifestyle',
  'Charity & Relief'
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  initialCategory = 'How I Feel'
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [privacy, setPrivacy] = useState<PostPrivacy>('public');
  const [privacyMenuOpen, setPrivacyMenuOpen] = useState(false);
  const [selectedBgStyle, setSelectedBgStyle] = useState('default');
  const [activeImageFilter, setActiveImageFilter] = useState('none');

  // Media
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Poll
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setSelectedBgStyle('default'); // reset gradient when photo is present
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleTagClick = (tag: string) => {
    setContent(prev => (prev ? `${prev} ${tag}` : tag));
  };

  const handleTemplateClick = (tmplText: string) => {
    setContent(prev => (prev ? `${prev}\n\n${tmplText}` : tmplText));
  };

  const handleFeelingClick = (prefix: string) => {
    setCategory('How I Feel');
    setContent(prev => (prev ? `${prefix}${prev}` : prefix));
  };

  const handlePublish = async () => {
    if (!content.trim() && !imagePreview && (!showPoll || pollOptions.filter(o => o.trim()).length < 2)) {
      return;
    }

    setIsSubmitting(true);

    let pollData;
    if (showPoll && pollOptions.filter(o => o.trim()).length >= 2) {
      pollData = {
        options: pollOptions
          .filter(o => o.trim())
          .map((text, i) => ({ id: `opt-${i}`, text, votes: 0 })),
        totalVotes: 0,
        userSelections: {}
      };
    }

    try {
      await onSubmit({
        content: content.trim(),
        caption: caption.trim() || undefined,
        category,
        privacy,
        image: imagePreview || null,
        bgStyle: selectedBgStyle,
        poll: pollData,
        filterPreset: activeImageFilter
      });
      onClose();
    } catch (err) {
      console.error("Error submitting post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFilterClass = IMAGE_FILTERS.find(f => f.id === activeImageFilter)?.class || '';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-0"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative z-10 w-full max-w-2xl bg-brand-sidebar/95 border border-white/15 rounded-[2.2rem] sm:rounded-[2.8rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-noor-emerald to-teal-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-lg shadow-noor-emerald/20">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-sm sm:text-base">
                  {currentUser.displayName || 'Spiritual Pilgrim'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/30 text-[9px] font-black uppercase font-mono">
                  CREATOR
                </span>
              </div>
              
              {/* Privacy Selector Dropdown Pill */}
              <div className="relative mt-0.5">
                <button
                  type="button"
                  onClick={() => setPrivacyMenuOpen(!privacyMenuOpen)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                    privacy === 'public'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                >
                  {privacy === 'public' ? (
                    <>
                      <Globe size={11} className="text-emerald-400" />
                      <span>Public • Global Ummah</span>
                    </>
                  ) : (
                    <>
                      <Users size={11} className="text-amber-400" />
                      <span>Friends Only • Ummah Circle</span>
                    </>
                  )}
                  <ChevronDown size={11} className={`transition-transform ${privacyMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {privacyMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute left-0 top-8 z-30 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl space-y-1 text-left"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPrivacy('public');
                          setPrivacyMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-start gap-2.5 transition-all text-left cursor-pointer ${
                          privacy === 'public' ? 'bg-emerald-500/20 text-white' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Globe size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white flex items-center gap-1.5">
                            Public
                            {privacy === 'public' && <Check size={12} className="text-emerald-400" />}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">Visible to all believers across the global Ummah</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPrivacy('friends');
                          setPrivacyMenuOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl flex items-start gap-2.5 transition-all text-left cursor-pointer ${
                          privacy === 'friends' ? 'bg-amber-500/20 text-white' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Users size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white flex items-center gap-1.5">
                            Friends Only
                            {privacy === 'friends' && <Check size={12} className="text-amber-400" />}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">Visible exclusively to your verified friends & circle</p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-5">
          {/* How Are You Feeling Selector Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Smile size={13} className="text-amber-400" />
                How are you feeling today?
              </span>
              <span className="text-[9px] font-bold text-slate-500">Tap to express</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {FEELING_OPTIONS.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => handleFeelingClick(f.prefix)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-amber-500/15 hover:border-amber-500/40 border border-white/5 rounded-2xl text-[11px] font-bold text-slate-300 hover:text-amber-300 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Inspiration Templates */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0 mr-1">Inspirations:</span>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => handleTemplateClick(tmpl.text)}
                className="px-2.5 py-1 bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer active:scale-95"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Main Text Content Area */}
          <div className={`p-4 rounded-2xl border transition-all ${
            selectedBgStyle !== 'default' && !imagePreview
              ? selectedBgStyle
              : 'bg-white/5 border-white/10 focus-within:border-emerald-500/50'
          }`}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1200}
              placeholder="What spiritual reflection, daily feeling, blessing, or question is on your heart today? Share your thoughts with the Ummah..."
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-slate-500 resize-none font-medium text-base sm:text-lg min-h-[110px] leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-500 font-bold">
              <span>Share wholesomely in accordance with Islamic ethics</span>
              <span className={content.length > 1000 ? 'text-amber-400' : ''}>{content.length}/1200</span>
            </div>
          </div>

          {/* Image Upload Area & Preview */}
          {imagePreview ? (
            <div className="space-y-2.5">
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 group shadow-2xl bg-black">
                <img
                  src={imagePreview}
                  alt="Post preview"
                  className={`w-full max-h-72 object-cover transition-all ${selectedFilterClass}`}
                />
                
                {/* Remove Image Button */}
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-all cursor-pointer shadow-lg"
                  title="Remove image"
                >
                  <X size={16} />
                </button>

                {/* Filter Selector Bar */}
                <div className="absolute bottom-3 left-3 right-3 p-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Wand2 size={11} /> Filter:
                  </span>
                  <div className="flex items-center gap-1">
                    {IMAGE_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveImageFilter(filter.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                          activeImageFilter === filter.id
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Image Caption Field */}
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add an optional photo caption (e.g. 'Sunset over Masjid An-Nabawi')..."
                  className="w-full bg-transparent border-none focus:outline-none text-xs text-white placeholder-slate-500 font-medium"
                />
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-3 text-center ${
                isDraggingFile
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-emerald-500/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="w-10 h-10 rounded-xl bg-white/5 text-emerald-400 flex items-center justify-center shrink-0">
                <UploadCloud size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Click or Drag & Drop photo to upload</p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WebP supported • Up to 10MB</p>
              </div>
            </div>
          )}

          {/* Card Gradient Theme Selector (if no image attached) */}
          {!imagePreview && (
            <div className="space-y-2 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={12} className="text-amber-400" />
                  Background Style:
                </span>
                <span className="text-[9px] text-slate-400">{BG_THEMES.find(t => t.id === selectedBgStyle)?.label}</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {BG_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedBgStyle(theme.id)}
                    className={`py-2 px-1 rounded-xl border text-[9px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedBgStyle === theme.id
                        ? 'border-amber-400 bg-amber-500/20 text-white shadow-lg'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border border-white/20 ${theme.preview}`} />
                    <span className="truncate w-full text-center">{theme.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Poll Builder */}
          {showPoll ? (
            <div className="space-y-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy size={13} /> Community Poll
                </span>
                <button
                  type="button"
                  onClick={() => setShowPoll(false)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...pollOptions];
                        updated[idx] = e.target.value;
                        setPollOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}...`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-[10px] font-black text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Another Option
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPoll(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-2 cursor-pointer w-fit"
            >
              <Trophy size={14} className="text-emerald-400" />
              <span>+ Add Poll Question</span>
            </button>
          )}

          {/* Topic / Category Selection */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Topic / Sanctuary Category:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TOPICS.map((top) => (
                <button
                  key={top}
                  type="button"
                  onClick={() => setCategory(top)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    category === top
                      ? 'bg-noor-emerald text-white border border-noor-emerald shadow-lg shadow-noor-emerald/20'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tag Inserters */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
              Add Hashtag:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-emerald-400 border border-white/5 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-black">
              <Sparkles size={12} className="text-amber-400" />
              <span>+50 Hasanat on Publish</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting || (!content.trim() && !imagePreview && (!showPoll || pollOptions.filter(o => o.trim()).length < 2))}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-noor-emerald to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-noor-emerald/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Publishing Noor...</span>
              ) : (
                <>
                  <span>Share Reflection</span>
                  <Send size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
