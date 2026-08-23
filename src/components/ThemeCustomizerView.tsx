import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Moon,
  Sun,
  Palette,
  CheckCircle2,
  Sliders,
  Eye,
  Heart,
  Compass,
  Waves,
  RefreshCw,
  Plus,
  Trash2,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  Volume2,
  BookOpen,
  Radio,
  Flame,
  Shield,
  HelpCircle,
  Wand2,
  Layers,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';
import {
  CURATED_THEMES,
  SPIRITUAL_MOODS,
  ThemeService,
  SpiritualTheme,
  CustomThemeConfig,
  SpiritualMoodOption
} from '../services/themeService.ts';

interface ThemeCustomizerViewProps {
  theme: string;
  setTheme: (val: string) => void;
  onBack?: () => void;
}

const PRESET_ACCENT_COLORS = [
  { name: 'Aloha Bronze Gold', hex: '#c58f54' },
  { name: 'Imperial Emerald', hex: '#10b981' },
  { name: 'Makkah Amber', hex: '#f59e0b' },
  { name: 'Sultani Sapphire', hex: '#38bdf8' },
  { name: 'Velvet Kiswah Rose', hex: '#fb7185' },
  { name: 'Celestial Lavender', hex: '#a855f7' },
  { name: 'Fajr Dawn Coral', hex: '#fb923c' },
  { name: 'Sham Olive Sage', hex: '#84cc16' },
  { name: 'Samarkand Turquoise', hex: '#06b6d4' },
  { name: 'Al-Aqsa Pure Gold', hex: '#eab308' },
  { name: 'Andalusian Crimson', hex: '#e11d48' },
  { name: 'Royal Violet', hex: '#8b5cf6' }
];

const PRESET_DEPTH_COLORS = [
  { name: 'Oceanic Obsidian', hex: '#0a1c2a' },
  { name: 'Imperial Forest', hex: '#041913' },
  { name: 'Desert Night', hex: '#170f06' },
  { name: 'Sapphire Abyss', hex: '#061022' },
  { name: 'Kiswah Velvet', hex: '#19050d' },
  { name: 'Ethereal Violet Night', hex: '#090314' },
  { name: 'Dawn Horizon', hex: '#180a06' },
  { name: 'Olive Midnight', hex: '#0d1506' },
  { name: 'Pure Obsidian Slate', hex: '#090d12' }
];

export default function ThemeCustomizerView({
  theme,
  setTheme,
  onBack
}: ThemeCustomizerViewProps) {
  // Tab: 'curated' | 'mood' | 'builder' | 'saved'
  const [activeStudioTab, setActiveStudioTab] = useState<'curated' | 'mood' | 'builder' | 'saved'>('curated');

  // Category filter for curated themes
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Selected spiritual mood
  const [selectedMood, setSelectedMood] = useState<SpiritualMoodOption | null>(SPIRITUAL_MOODS[0]);

  // Saved custom themes
  const [savedThemes, setSavedThemes] = useState<CustomThemeConfig[]>(() => {
    return ThemeService.getSavedCustomThemes();
  });

  // Active custom config
  const [activeCustomConfig, setActiveCustomConfig] = useState<CustomThemeConfig | null>(() => {
    return ThemeService.getActiveCustomThemeData();
  });

  // Custom theme builder form state
  const [customForm, setCustomForm] = useState<CustomThemeConfig>(() => {
    if (activeCustomConfig) return activeCustomConfig;
    return {
      id: `custom_${Date.now()}`,
      name: 'My Spiritual Sanctuary',
      arabicTitle: 'واحتي الروحية',
      moodDescription: 'Personalized sacred atmosphere crafted for contemplation.',
      primary: '#c58f54',
      secondary: '#1b4d6e',
      accent: '#e2b789',
      depth: '#0a1c2a',
      sidebar: '#06121c',
      glowIntensity: 'radiant',
      patternType: 'star_quds',
      glassOpacity: 0.12,
      createdAt: Date.now()
    };
  });

  // Copied state indicator
  const [copiedCode, setCopiedCode] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Interactive Tasbih preview counter
  const [previewDhikrCount, setPreviewDhikrCount] = useState<number>(33);
  const [previewDhikrPhrase, setPreviewDhikrPhrase] = useState<string>('سُبْحَانَ اللَّهِ');

  // Active preview theme state for the interactive canvas
  const currentThemeData = CURATED_THEMES.find(t => t.id === theme) || CURATED_THEMES[0];

  const handleApplyCuratedTheme = (themeId: string) => {
    setTheme(themeId);
    ThemeService.applyTheme(themeId);
    const selected = CURATED_THEMES.find(t => t.id === themeId);
    if (selected) {
      triggerAppliedToast(`Atmosphere set to: ${selected.name} (${selected.arabicTitle})`);
    }
  };

  const handleApplyMoodTheme = (mood: SpiritualMoodOption) => {
    setSelectedMood(mood);
    handleApplyCuratedTheme(mood.recommendedThemeId);
  };

  const handleSaveAndApplyCustomTheme = () => {
    const newConfig: CustomThemeConfig = {
      ...customForm,
      id: customForm.id.startsWith('custom_') ? customForm.id : `custom_${Date.now()}`,
      createdAt: Date.now()
    };

    ThemeService.saveCustomTheme(newConfig);
    setSavedThemes(ThemeService.getSavedCustomThemes());
    setActiveCustomConfig(newConfig);

    setTheme('custom');
    ThemeService.applyTheme('custom', newConfig);
    triggerAppliedToast(`Custom theme "${newConfig.name}" saved and applied!`);
  };

  const handleApplySavedCustom = (config: CustomThemeConfig) => {
    setActiveCustomConfig(config);
    setCustomForm(config);
    setTheme('custom');
    ThemeService.applyTheme('custom', config);
    triggerAppliedToast(`Applied custom preset: ${config.name}`);
  };

  const handleDeleteSavedCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom theme preset?')) {
      ThemeService.deleteCustomTheme(id);
      setSavedThemes(ThemeService.getSavedCustomThemes());
      if (theme === 'custom' && activeCustomConfig?.id === id) {
        handleApplyCuratedTheme('aloha');
      }
    }
  };

  const triggerAppliedToast = (msg: string) => {
    setAppliedNotification(msg);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 4000);
  };

  const copyThemeShareCode = () => {
    const configToShare = theme === 'custom' && activeCustomConfig 
      ? activeCustomConfig 
      : currentThemeData;
    
    navigator.clipboard.writeText(JSON.stringify(configToShare, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const randomizeCustomPalette = () => {
    const randomAccent = PRESET_ACCENT_COLORS[Math.floor(Math.random() * PRESET_ACCENT_COLORS.length)];
    const randomDepth = PRESET_DEPTH_COLORS[Math.floor(Math.random() * PRESET_DEPTH_COLORS.length)];
    
    setCustomForm(prev => ({
      ...prev,
      primary: randomAccent.hex,
      accent: randomAccent.hex,
      depth: randomDepth.hex,
      sidebar: '#050a0f'
    }));
  };

  const filteredCuratedThemes = selectedCategory === 'all'
    ? CURATED_THEMES
    : CURATED_THEMES.filter(t => t.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {appliedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-brand-primary text-black font-bold text-xs shadow-2xl shadow-brand-primary/40 flex items-center gap-3 border border-white/20"
          >
            <Sparkles size={18} className="animate-spin" />
            <span>{appliedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO HEADER: SANCTUARY THEME & SPIRITUAL ATMOSPHERE STUDIO */}
      <div className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand-sidebar via-brand-depth to-black shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all active:scale-95 cursor-pointer shrink-0"
                title="Return to Previous Screen"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Palette size={12} /> Spiritual Aesthetics & Atmosphere Studio
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 text-[9px] font-mono border border-white/10 flex items-center gap-1">
                  <Sparkles size={10} className="text-amber-400" /> Active: {theme === 'custom' ? 'Custom Studio Palette' : currentThemeData.name}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white italic tracking-tight">
                Sanctuary Theme Customizer
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium">
                Personalize your digital sanctuary with curated Islamic spiritual palettes or design a bespoke aesthetic reflecting your heart's mood.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
            <button
              onClick={copyThemeShareCode}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Copy Theme Configuration JSON"
            >
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCode ? 'Palette Copied!' : 'Share Theme'}</span>
            </button>

            <button
              onClick={() => handleApplyCuratedTheme('aloha')}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Reset to Aloha Oceanic Gold default"
            >
              <RefreshCw size={14} />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Sacred Quote Callout */}
        <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-serif italic">
          <span>«إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ» — «Indeed, Allah is Beautiful and He loves beauty.» (Sahih Muslim)</span>
          <span className="text-[10px] font-sans font-mono text-brand-primary not-italic uppercase tracking-widest">Instant Live Re-skinning</span>
        </div>
      </div>

      {/* 2. STUDIO NAVIGATION TABS */}
      <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 gap-1 overflow-x-auto scrollbar-none font-sans">
        {[
          { id: 'curated', label: 'Curated Spiritual Palettes', icon: Sparkles, count: CURATED_THEMES.length },
          { id: 'mood', label: 'Heart State & Mood Matcher', icon: Heart, count: SPIRITUAL_MOODS.length },
          { id: 'builder', label: 'Custom Palette Studio', icon: Sliders },
          { id: 'saved', label: 'My Saved Presets', icon: Layers, count: savedThemes.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStudioTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStudioTab(tab.id as any)}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-brand-primary text-black shadow-lg font-black'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${isActive ? 'bg-black/30 text-black' : 'bg-white/10 text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: CURATED SPIRITUAL THEMES */}
      {/* ------------------------------------------------------------------ */}
      {activeStudioTab === 'curated' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Palettes' },
              { id: 'tranquility', label: '🕊️ Peace & Tranquility' },
              { id: 'devotion', label: '🤲 Devotion & Sacred' },
              { id: 'focus', label: '🌌 Solitude & Night' },
              { id: 'dawn', label: '🌅 Dawn & Barakah' },
              { id: 'heritage', label: '🏛️ Islamic Heritage' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black shadow-md font-black'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Curated Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCuratedThemes.map((item) => {
              const isSelected = theme === item.id;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  onClick={() => handleApplyCuratedTheme(item.id)}
                  className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col justify-between gap-5 group cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-brand-primary shadow-2xl ring-2 ring-brand-primary/40'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? undefined : `${item.colors.depth}66`
                  }}
                >
                  {/* Subtle Background Radial Glow */}
                  <div
                    className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity"
                    style={{ backgroundColor: item.colors.primary }}
                  />

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-2.5 py-1 rounded-lg bg-black/40 border border-white/5">
                        {item.category}
                      </span>
                      {isSelected ? (
                        <span className="px-3 py-1 rounded-full bg-brand-primary text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <CheckCircle2 size={12} /> Active Atmosphere
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-white transition-colors flex items-center gap-1">
                          Click to Apply <ChevronRight size={12} />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-lg font-black text-white group-hover:text-brand-primary transition-colors">
                          {item.name}
                        </h3>
                        <span className="arabic-text text-base font-bold text-amber-300/90">
                          {item.arabicTitle}
                        </span>
                      </div>
                      <p className="text-xs text-brand-primary font-bold mt-0.5">
                        {item.mood}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {item.moodDescription}
                      </p>
                    </div>
                  </div>

                  {/* Palette Swatches Row */}
                  <div className="space-y-3 relative z-10 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-xl shadow-md border border-white/20 flex items-center justify-center text-white"
                        style={{ backgroundColor: item.colors.primary }}
                        title={`Primary Accent: ${item.colors.primary}`}
                      >
                        <Sparkles size={12} />
                      </div>
                      <div
                        className="w-8 h-8 rounded-xl shadow-md border border-white/20 flex items-center justify-center text-white"
                        style={{ backgroundColor: item.colors.secondary }}
                        title={`Secondary Hue: ${item.colors.secondary}`}
                      >
                        <Waves size={12} />
                      </div>
                      <div
                        className="w-8 h-8 rounded-xl shadow-md border border-white/20 flex items-center justify-center text-white"
                        style={{ backgroundColor: item.colors.depth }}
                        title={`Background Depth: ${item.colors.depth}`}
                      >
                        <Moon size={12} />
                      </div>

                      <div className="ml-auto font-mono text-[9px] text-slate-400 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                        {item.colors.primary}
                      </div>
                    </div>

                    <p className="text-[11px] font-serif italic text-slate-400 border-l-2 border-brand-primary/40 pl-2.5 line-clamp-2">
                      {item.reflection}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: SPIRITUAL HEART STATE & MOOD MATCHER */}
      {/* ------------------------------------------------------------------ */}
      {activeStudioTab === 'mood' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-[2rem] bg-brand-primary/5 border border-brand-primary/20 space-y-2">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Heart size={18} className="text-brand-primary" /> How is your heart feeling today?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Select your current spiritual intention or emotional state. Sanctuary will harmonize your atmosphere with colors and verses chosen to comfort, elevate, and inspire your soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPIRITUAL_MOODS.map((mood) => {
              const isMoodSelected = selectedMood?.id === mood.id;
              const matchingTheme = CURATED_THEMES.find(t => t.id === mood.recommendedThemeId);

              return (
                <div
                  key={mood.id}
                  onClick={() => handleApplyMoodTheme(mood)}
                  className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col justify-between gap-4 cursor-pointer ${
                    isMoodSelected
                      ? 'bg-white/10 border-brand-primary shadow-2xl ring-2 ring-brand-primary/40'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl p-3 bg-black/40 rounded-2xl border border-white/10 shrink-0">
                      {mood.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white">{mood.label}</h4>
                        {theme === mood.recommendedThemeId && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="arabic-text text-sm font-bold text-amber-300/80">
                        {mood.arabicLabel}
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        {mood.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-bold text-slate-300">Recommended Atmosphere:</span>
                      <span
                        className="px-2.5 py-1 rounded-lg text-black font-black text-[11px]"
                        style={{ backgroundColor: matchingTheme?.colors.primary || '#c58f54' }}
                      >
                        {matchingTheme?.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 bg-brand-primary text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-105"
                    >
                      Apply Mood
                    </button>
                  </div>

                  {/* Quranic Reflection Verse */}
                  <p className="text-[11px] font-serif italic text-amber-200/80 bg-black/30 p-2.5 rounded-xl border border-white/5">
                    {mood.quranVerse}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: CUSTOM PALETTE STUDIO / COLOR MIXER */}
      {/* ------------------------------------------------------------------ */}
      {activeStudioTab === 'builder' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sliders size={18} className="text-brand-primary" /> Personalized Palette Mixer
                </h3>
                <p className="text-xs text-slate-300">
                  Select bespoke colors for your primary brand illumination, midnight background depth, and glass panels.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={randomizeCustomPalette}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Wand2 size={14} className="text-amber-400" /> Randomize Harmony
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndApplyCustomTheme}
                  className="px-5 py-2 bg-brand-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-brand-primary/30 transition-all hover:scale-105 cursor-pointer"
                >
                  Save & Apply Custom Theme
                </button>
              </div>
            </div>

            {/* Custom Theme Name Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Custom Preset Title
                </label>
                <input
                  type="text"
                  value={customForm.name || ''}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  placeholder="e.g. My Tahajjud Oasis"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Arabic Aesthetic Name (Optional)
                </label>
                <input
                  type="text"
                  value={customForm.arabicTitle || ''}
                  onChange={(e) => setCustomForm({ ...customForm, arabicTitle: e.target.value })}
                  placeholder="e.g. واحة التهجد"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white arabic-text focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {/* 1. Primary Accent Color Mixer */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: customForm.primary || '#c58f54' }} />
                  Primary Brand Illumination Color
                </label>
                <span className="font-mono text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  {customForm.primary || '#c58f54'}
                </span>
              </div>

              {/* Preset Swatches */}
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_ACCENT_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, primary: col.hex, accent: col.hex })}
                    className={`w-9 h-9 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
                      (customForm.primary || '').toLowerCase() === col.hex.toLowerCase()
                        ? 'ring-2 ring-white scale-110 border-white'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {(customForm.primary || '').toLowerCase() === col.hex.toLowerCase() && (
                      <Check size={14} className="text-black" />
                    )}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] font-bold text-slate-400">Custom:</span>
                  <input
                    type="color"
                    value={customForm.primary || '#c58f54'}
                    onChange={(e) => setCustomForm({ ...customForm, primary: e.target.value, accent: e.target.value })}
                    className="w-9 h-9 bg-transparent border-0 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. Secondary Supporting Hue */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: customForm.secondary || '#1b4d6e' }} />
                  Secondary Glow & Ambient Hue
                </label>
                <span className="font-mono text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  {customForm.secondary || '#1b4d6e'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_ACCENT_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, secondary: col.hex })}
                    className={`w-9 h-9 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
                      (customForm.secondary || '').toLowerCase() === col.hex.toLowerCase()
                        ? 'ring-2 ring-white scale-110 border-white'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {(customForm.secondary || '').toLowerCase() === col.hex.toLowerCase() && (
                      <Check size={14} className="text-black" />
                    )}
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] font-bold text-slate-400">Custom:</span>
                  <input
                    type="color"
                    value={customForm.secondary || '#1b4d6e'}
                    onChange={(e) => setCustomForm({ ...customForm, secondary: e.target.value })}
                    className="w-9 h-9 bg-transparent border-0 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Midnight Background Depth */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: customForm.depth || '#0a1c2a' }} />
                  Midnight Background Depth Tone
                </label>
                <span className="font-mono text-xs text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  {customForm.depth || '#0a1c2a'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_DEPTH_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setCustomForm({ ...customForm, depth: col.hex })}
                    className={`w-9 h-9 rounded-xl border transition-all cursor-pointer relative flex items-center justify-center ${
                      (customForm.depth || '').toLowerCase() === col.hex.toLowerCase()
                        ? 'ring-2 ring-white scale-110 border-white'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {(customForm.depth || '').toLowerCase() === col.hex.toLowerCase() && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-[10px] font-bold text-slate-400">Custom:</span>
                  <input
                    type="color"
                    value={customForm.depth || '#0a1c2a'}
                    onChange={(e) => setCustomForm({ ...customForm, depth: e.target.value })}
                    className="w-9 h-9 bg-transparent border-0 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4. Glow Intensity & Pattern Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Spiritual Aura & Glow Intensity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['subtle', 'balanced', 'radiant', 'celestial'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      type="button"
                      onClick={() => setCustomForm({ ...customForm, glowIntensity: intensity })}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        customForm.glowIntensity === intensity
                          ? 'bg-brand-primary text-black font-black shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Islamic Pattern Subtle Overlay
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'star_quds', label: 'Al-Quds' },
                    { id: 'arabesque', label: 'Arabesque' },
                    { id: 'mashrabiya', label: 'Mashrabiya' },
                    { id: 'minimal', label: 'Minimal' }
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => setCustomForm({ ...customForm, patternType: pat.id as any })}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        customForm.patternType === pat.id
                          ? 'bg-brand-primary text-black font-black shadow-md'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: MY SAVED CUSTOM PRESETS */}
      {/* ------------------------------------------------------------------ */}
      {activeStudioTab === 'saved' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {savedThemes.length === 0 ? (
            <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-white/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto">
                <Palette size={24} />
              </div>
              <h3 className="text-lg font-black text-white">No Custom Themes Saved Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You haven't created any custom palettes yet. Visit the Custom Palette Studio to mix your own colors and save them here!
              </p>
              <button
                type="button"
                onClick={() => setActiveStudioTab('builder')}
                className="px-5 py-2.5 bg-brand-primary text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                Open Custom Palette Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedThemes.map((st) => {
                const isActive = theme === 'custom' && activeCustomConfig?.id === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleApplySavedCustom(st)}
                    className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? 'bg-white/10 border-brand-primary ring-2 ring-brand-primary/40 shadow-2xl'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-white group-hover:text-brand-primary transition-colors">
                            {st.name}
                          </h4>
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-primary text-black font-black text-[9px] uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        {st.arabicTitle && (
                          <p className="arabic-text text-sm font-bold text-amber-300/80">
                            {st.arabicTitle}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 font-mono mt-1">
                          Created {new Date(st.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteSavedCustom(st.id, e)}
                        className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                        title="Delete custom preset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      <div className="w-7 h-7 rounded-lg shadow" style={{ backgroundColor: st.primary }} title="Primary" />
                      <div className="w-7 h-7 rounded-lg shadow" style={{ backgroundColor: st.secondary }} title="Secondary" />
                      <div className="w-7 h-7 rounded-lg shadow" style={{ backgroundColor: st.depth }} title="Depth" />

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-brand-primary text-black font-black text-[10px] uppercase rounded-lg hover:scale-105 transition-all"
                        >
                          Activate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. LIVE INTERACTIVE SANCTUARY SIMULATOR & PREVIEW CANVAS */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-black/60 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Eye size={18} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">Live Canvas</span>
              <h3 className="text-base font-black text-white">Interactive Sanctuary Preview</h3>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            Simulating live components with active CSS variables
          </span>
        </div>

        {/* Mock Interface Canvas */}
        <div className="p-6 rounded-3xl bg-brand-depth border border-brand-primary/30 shadow-2xl space-y-5 relative overflow-hidden">
          
          {/* Mock Top Navigation */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-brand-depth font-black shadow-lg">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-xs font-black text-white">Habibi Sanctuary</p>
                <p className="text-[9px] text-brand-primary font-bold uppercase tracking-widest">
                  {theme === 'custom' ? customForm.name : currentThemeData.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-mono font-bold border border-brand-primary/30">
                1,420 Hasanat
              </span>
              <div className="w-8 h-8 rounded-full bg-white/10 border border-brand-primary/40 flex items-center justify-center text-xs font-bold text-white">
                👤
              </div>
            </div>
          </div>

          {/* Mock Main Dashboard Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Widget 1: Next Prayer Card */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Prayer</span>
              <div className="flex items-baseline justify-between">
                <h4 className="text-base font-black text-white">Asr Prayer</h4>
                <span className="text-xs font-mono font-bold text-brand-primary">in 42m</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand-primary h-full rounded-full w-3/4" />
              </div>
            </div>

            {/* Widget 2: Interactive Digital Tasbih Bead */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Interactive Tasbih</span>
                <p className="arabic-text text-sm font-bold text-amber-300">{previewDhikrPhrase}</p>
                <p className="text-[10px] text-slate-400 font-mono">Count: {previewDhikrCount}</p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDhikrCount(prev => prev + 1)}
                className="w-11 h-11 rounded-2xl bg-brand-primary text-black font-black text-xs shadow-lg shadow-brand-primary/30 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                title="Tap to count Dhikr"
              >
                +1
              </button>
            </div>

            {/* Widget 3: Live Audio Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-1">
                  <Volume2 size={10} /> Recitation Audio
                </span>
                <p className="text-xs font-bold text-white truncate max-w-[130px]">Surah Ar-Rahman</p>
                <p className="text-[9px] text-slate-400 font-mono">Mishary Alafasy</p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Radio size={14} className="text-brand-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Widget 4: Quranic Ayah Card with Uthmani Calligraphy */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-brand-primary/20 space-y-3 text-center relative overflow-hidden">
            <div className="arabic-text text-2xl sm:text-3xl font-bold text-white leading-loose">
              «فَإِنَّ مَعَ الْعُسْرِ يُسْرًا • إِنَّ مَعَ الْعُسْرِ يُسْرًا»
            </div>
            <p className="text-xs text-slate-300 font-medium">
              “For indeed, with hardship comes ease. Indeed, with hardship comes ease.” (Ash-Sharh 94:5-6)
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-mono font-bold border border-brand-primary/30">
                Surah Ash-Sharh • Ayah 5-6
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
