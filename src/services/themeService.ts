/**
 * Theme Service for Habibi Sanctuary
 * Handles curated spiritual theme palettes, custom color customization,
 * mood matching, CSS root variable injection, and local storage synchronization.
 */

export interface SpiritualTheme {
  id: string;
  name: string;
  arabicTitle: string;
  mood: string;
  moodDescription: string;
  reflection: string;
  category: 'tranquility' | 'devotion' | 'focus' | 'dawn' | 'heritage' | 'custom';
  colors: {
    primary: string;       // Main brand accent
    secondary: string;     // Supporting glow / contrast
    accent: string;        // Highlight / badge color
    depth: string;         // Background midnight obsidian
    sidebar: string;       // Sidebar & bottom bar deep tone
    border: string;        // Border subtle tint
    text: string;          // Main text light color
    textMuted: string;     // Muted text color
    textDim: string;       // Dim helper text
  };
  glowColor: string;
  patternType?: 'star_quds' | 'mashrabiya' | 'arabesque' | 'minimal';
  isCustom?: boolean;
}

export interface CustomThemeConfig {
  id: string;
  name: string;
  arabicTitle?: string;
  moodDescription?: string;
  primary: string;
  secondary: string;
  accent: string;
  depth: string;
  sidebar: string;
  glowIntensity: 'subtle' | 'balanced' | 'radiant' | 'celestial';
  patternType: 'star_quds' | 'mashrabiya' | 'arabesque' | 'minimal';
  glassOpacity: number; // 0 to 1
  createdAt: number;
}

export const CURATED_THEMES: SpiritualTheme[] = [
  {
    id: 'aloha',
    name: 'Aloha Royal Gold & Navy',
    arabicTitle: 'السكينة والتقويم الإيماني',
    mood: 'Serenity, Majesty & Reflection',
    moodDescription: 'Imperial desert gold paired with deep oceanic navy and starlight ivory, inspired by the Aloha Sanctuary.',
    reflection: '“And hold firmly to the rope of Allah all together and do not become divided.” (3:103)',
    category: 'tranquility',
    colors: {
      primary: '#d4af37',      // Imperial Desert Gold from crescent & lanterns
      secondary: '#163853',    // Deep Royal Navy from Aloha brand
      accent: '#f3d082',       // Warm Golden Starlight
      depth: '#0b1a28',        // Aloha Night Obsidian Canvas
      sidebar: '#06121d',      // Deep Ocean Abyss
      border: 'rgba(212, 175, 55, 0.25)',
      text: '#fcfbfa',         // Pure Starlight Ivory
      textMuted: '#cbdbe8',    // Soft Slate
      textDim: '#8ea3b8'       // Muted Steel Indigo
    },
    glowColor: 'rgba(212, 175, 55, 0.4)',
    patternType: 'arabesque'
  },
  {
    id: 'aloha_calendar',
    name: 'Aloha Sacred Calendar',
    arabicTitle: 'التقويم الإسلامي — ألوها',
    mood: 'Barakah, Clarity & Calendar Illumination',
    moodDescription: 'Warm bronze gold and Sandstone amber with coastal ocean navy for daily Islamic scheduling.',
    reflection: '“Indeed, the number of months with Allah is twelve [lunar] months.” (9:36)',
    category: 'tranquility',
    colors: {
      primary: '#c58f54',      // Warm Bronze Gold
      secondary: '#1b4d6e',    // Aloha Oceanic Blue
      accent: '#e8c37d',       // Radiant Sandstone Gold
      depth: '#0a1c2a',        // Deep Oceanic Obsidian
      sidebar: '#06121c',      // Night Abyss
      border: 'rgba(197, 143, 84, 0.25)',
      text: '#fdfbf7',
      textMuted: '#cbd5e1',
      textDim: '#94a3b8'
    },
    glowColor: 'rgba(197, 143, 84, 0.38)',
    patternType: 'star_quds'
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    arabicTitle: 'الروضة الشريفة',
    mood: 'Prophetic Peace & Heart Revival',
    moodDescription: 'Inspired by the sacred Green Dome and Rawdah of Masjid An-Nabawi in Madinah.',
    reflection: '“A fragrance of peace and eternal revival for the devoted soul.”',
    category: 'tranquility',
    colors: {
      primary: '#10b981',
      secondary: '#f59e0b',
      accent: '#34d399',
      depth: '#041913',
      sidebar: '#02120e',
      border: 'rgba(16, 185, 129, 0.2)',
      text: '#f0fdf4',
      textMuted: '#a7f3d0',
      textDim: '#6ee7b7'
    },
    glowColor: 'rgba(16, 185, 129, 0.35)',
    patternType: 'star_quds'
  },
  {
    id: 'amber',
    name: 'Desert Amber & Oud',
    arabicTitle: 'عنبر الصحراء',
    mood: 'Warmth, Gratitude & Devotion',
    moodDescription: 'Warm desert sunset and golden incense evoking evenings in Makkah.',
    reflection: '“And He found you lost and guided [you].” (93:7)',
    category: 'devotion',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fde68a',
      depth: '#170f06',
      sidebar: '#0f0903',
      border: 'rgba(245, 158, 11, 0.2)',
      text: '#fffbeb',
      textMuted: '#fde68a',
      textDim: '#fcd34d'
    },
    glowColor: 'rgba(245, 158, 11, 0.35)',
    patternType: 'mashrabiya'
  },
  {
    id: 'sapphire',
    name: 'Sultani Royal Sapphire',
    arabicTitle: 'السلطاني الأزرق',
    mood: 'Night Prayers & Deep Contemplation',
    moodDescription: 'Rich Andalusian indigo twilight and celestial blues for late night Quran study.',
    reflection: '“And in part of the night, pray with it as additional [worship] for you.” (17:79)',
    category: 'focus',
    colors: {
      primary: '#38bdf8',
      secondary: '#0284c7',
      accent: '#7dd3fc',
      depth: '#061022',
      sidebar: '#030814',
      border: 'rgba(56, 189, 248, 0.2)',
      text: '#f0f9ff',
      textMuted: '#bae6fd',
      textDim: '#7dd3fc'
    },
    glowColor: 'rgba(56, 189, 248, 0.35)',
    patternType: 'star_quds'
  },
  {
    id: 'crimson',
    name: 'Velvet Kiswah Crimson',
    arabicTitle: 'كسوة الكعبة',
    mood: 'Awe, Reverence & Earnest Dua',
    moodDescription: 'Deep Kiswah velvet red and gold accents for moments of fervent supplication.',
    reflection: '“Call upon Me; I will respond to you.” (40:60)',
    category: 'devotion',
    colors: {
      primary: '#fb7185',
      secondary: '#f43f5e',
      accent: '#fda4af',
      depth: '#19050d',
      sidebar: '#0f0207',
      border: 'rgba(251, 113, 133, 0.2)',
      text: '#fff1f2',
      textMuted: '#fecdd3',
      textDim: '#fda4af'
    },
    glowColor: 'rgba(251, 113, 133, 0.35)',
    patternType: 'arabesque'
  },
  {
    id: 'purple',
    name: 'Ethereal Noor',
    arabicTitle: 'النور الأثيري',
    mood: 'Quiet Dhikr & Spiritual Elevation',
    moodDescription: 'Cosmic lavender and violet aura evoking heavenly tranquility and light.',
    reflection: '“Allah is the Light of the heavens and the earth.” (24:35)',
    category: 'focus',
    colors: {
      primary: '#a855f7',
      secondary: '#f472b6',
      accent: '#d8b4fe',
      depth: '#090314',
      sidebar: '#05010c',
      border: 'rgba(168, 85, 247, 0.2)',
      text: '#faf5ff',
      textMuted: '#d8b4fe',
      textDim: '#a855f7'
    },
    glowColor: 'rgba(168, 85, 247, 0.35)',
    patternType: 'star_quds'
  },
  {
    id: 'fajr',
    name: 'Fajr Dawn Aurora',
    arabicTitle: 'فجر الأمل',
    mood: 'Morning Barakah & Hope',
    moodDescription: 'Soft coral rose and sunrise amber capturing the blessed freshness of Fajr.',
    reflection: '“By the dawn, and [by] ten nights.” (89:1-2)',
    category: 'dawn',
    colors: {
      primary: '#fb923c',
      secondary: '#f43f5e',
      accent: '#fed7aa',
      depth: '#180a06',
      sidebar: '#100503',
      border: 'rgba(251, 146, 60, 0.22)',
      text: '#fff7ed',
      textMuted: '#ffedd5',
      textDim: '#fdba74'
    },
    glowColor: 'rgba(251, 146, 60, 0.35)',
    patternType: 'arabesque'
  },
  {
    id: 'olive',
    name: 'Olive Grove of Sham',
    arabicTitle: 'زيتون الشام',
    mood: 'Humility, Grounding & Steadfastness',
    moodDescription: 'Earthy sage, olive leaves, and desert sand inspired by the blessed lands.',
    reflection: '“Lit from a blessed tree - an olive, neither of the east nor of the west.” (24:35)',
    category: 'heritage',
    colors: {
      primary: '#84cc16',
      secondary: '#65a30d',
      accent: '#bef264',
      depth: '#0d1506',
      sidebar: '#070c03',
      border: 'rgba(132, 204, 22, 0.22)',
      text: '#f7fee7',
      textMuted: '#d9f99d',
      textDim: '#bef264'
    },
    glowColor: 'rgba(132, 204, 22, 0.35)',
    patternType: 'mashrabiya'
  },
  {
    id: 'samarkand',
    name: 'Turquoise Samarkand',
    arabicTitle: 'فيروز سمرقند',
    mood: 'Wisdom, Art & Islamic Heritage',
    moodDescription: 'Lapis lazuli and turquoise tilework of Silk Road mosques and madrasas.',
    reflection: '“Travel through the earth and observe how He began creation.” (29:20)',
    category: 'heritage',
    colors: {
      primary: '#06b6d4',
      secondary: '#0284c7',
      accent: '#67e8f9',
      depth: '#04151b',
      sidebar: '#020d12',
      border: 'rgba(6, 182, 212, 0.22)',
      text: '#ecfeff',
      textMuted: '#a5f3fc',
      textDim: '#67e8f9'
    },
    glowColor: 'rgba(6, 182, 212, 0.35)',
    patternType: 'star_quds'
  },
  {
    id: 'cordoba',
    name: 'Dusk of Cordoba',
    arabicTitle: 'أندلسيات قرطبة',
    mood: 'Historical Remembrance & Poetry',
    moodDescription: 'Terracotta arches and Andalusian plum dusk celebrating sacred architecture.',
    reflection: '“A timeless harmony of sacred geometry and divine praise.”',
    category: 'heritage',
    colors: {
      primary: '#e11d48',
      secondary: '#c026d3',
      accent: '#fda4af',
      depth: '#1a0610',
      sidebar: '#10030a',
      border: 'rgba(225, 29, 72, 0.22)',
      text: '#fff1f2',
      textMuted: '#fecdd3',
      textDim: '#fda4af'
    },
    glowColor: 'rgba(225, 29, 72, 0.35)',
    patternType: 'arabesque'
  },
  {
    id: 'aqsa',
    name: 'Al-Aqsa Sunbeam',
    arabicTitle: 'شمس الأقصى',
    mood: 'Sacred Light & Elevation',
    moodDescription: 'Radiant Dome of the Rock gold and pure ivory starlight.',
    reflection: '“Exalted is He who took His Servant by night from al-Masjid al-Haram to al-Masjid al-Aqsa.” (17:1)',
    category: 'devotion',
    colors: {
      primary: '#eab308',
      secondary: '#ca8a04',
      accent: '#fef08a',
      depth: '#151205',
      sidebar: '#0d0b02',
      border: 'rgba(234, 179, 8, 0.25)',
      text: '#fefce8',
      textMuted: '#fef08a',
      textDim: '#fde047'
    },
    glowColor: 'rgba(234, 179, 8, 0.4)',
    patternType: 'star_quds'
  },
  {
    id: 'dark',
    name: 'Midnight Obsidian',
    arabicTitle: 'الليل الهادئ',
    mood: 'Solitude & Focused Tahajjud',
    moodDescription: 'Pure deep obsidian and starlight silver for undistracted nighttime prayers.',
    reflection: '“And from the night, glorify Him and after prostration.” (50:40)',
    category: 'focus',
    colors: {
      primary: '#94a3b8',
      secondary: '#64748b',
      accent: '#cbd5e1',
      depth: '#090d12',
      sidebar: '#04070a',
      border: 'rgba(148, 163, 184, 0.18)',
      text: '#f8fafc',
      textMuted: '#cbd5e1',
      textDim: '#94a3b8'
    },
    glowColor: 'rgba(148, 163, 184, 0.3)',
    patternType: 'minimal'
  }
];

export interface SpiritualMoodOption {
  id: string;
  label: string;
  arabicLabel: string;
  icon: string;
  recommendedThemeId: string;
  description: string;
  quranVerse: string;
}

export const SPIRITUAL_MOODS: SpiritualMoodOption[] = [
  {
    id: 'seeking_peace',
    label: 'Seeking Inner Peace & Calm',
    arabicLabel: 'طلب السكينة وطمأنينة القلب',
    icon: '🕊️',
    recommendedThemeId: 'emerald',
    description: 'When your heart feels overwhelmed and seeks the soothing shade of Prophetic peace.',
    quranVerse: '“Unquestionably, by the remembrance of Allah hearts are assured.” (13:28)'
  },
  {
    id: 'deep_tahajjud',
    label: 'Late Night Tahajjud & Solitude',
    arabicLabel: 'قيام الليل والمناجاة',
    icon: '🌌',
    recommendedThemeId: 'sapphire',
    description: 'For midnight conversations with the Creator in the quietest hours of the night.',
    quranVerse: '“Their sides forsake their beds, to invoke their Lord in fear and hope.” (32:16)'
  },
  {
    id: 'morning_barakah',
    label: 'Fajr Energy & Morning Barakah',
    arabicLabel: 'بركة البكور والصباح',
    icon: '🌅',
    recommendedThemeId: 'fajr',
    description: 'Invigorating dawn rays to start your day filled with gratitude and Quran.',
    quranVerse: '“And recite the Quran at dawn. Indeed, the recitation of dawn is ever witnessed.” (17:78)'
  },
  {
    id: 'earnest_dua',
    label: 'Earnest Dua & Awe of the Sacred',
    arabicLabel: 'الدعاء والتضرع والخشوع',
    icon: '🤲',
    recommendedThemeId: 'crimson',
    description: 'When pouring out your deepest desires, tears, and hopes before the Kaaba.',
    quranVerse: '“Indeed, my Lord is near and responsive.” (11:61)'
  },
  {
    id: 'quiet_dhikr',
    label: 'Quiet Dhikr & Contemplation',
    arabicLabel: 'الذكر الخفي والتأمل',
    icon: '✨',
    recommendedThemeId: 'purple',
    description: 'Celestial atmosphere for counting tasbih and meditating on Allah’s beautiful names.',
    quranVerse: '“Remember your Lord within yourself in humility and in fear.” (7:205)'
  },
  {
    id: 'gratitude_warmth',
    label: 'Warmth, Gratitude & Reflection',
    arabicLabel: 'الشكر والامتنان والدفء',
    icon: '🍂',
    recommendedThemeId: 'amber',
    description: 'Reflecting on countless blessings, family, and the gifts of sustenance.',
    quranVerse: '“If you are grateful, I will surely increase you [in favor].” (14:7)'
  },
  {
    id: 'sacred_elevation',
    label: 'Sacred Elevation & Divine Light',
    arabicLabel: 'النور والارتقاء الروحي',
    icon: '🕌',
    recommendedThemeId: 'aqsa',
    description: 'Radiant golden illumination reflecting the majesty of holy sanctuaries.',
    quranVerse: '“Allah is the Light of the heavens and the earth.” (24:35)'
  },
  {
    id: 'steadfast_humility',
    label: 'Steadfast Humility & Grounding',
    arabicLabel: 'الثبات والتواضع والصبر',
    icon: '🌿',
    recommendedThemeId: 'olive',
    description: 'Rooted like the blessed olive tree in patience, endurance, and quiet strength.',
    quranVerse: '“And seek help through patience and prayer.” (2:45)'
  }
];

// Local Storage Keys
const ACTIVE_THEME_KEY = 'app-theme';
const CUSTOM_THEMES_KEY = 'sanctuary-custom-themes';
const ACTIVE_CUSTOM_THEME_KEY = 'sanctuary-active-custom-theme-data';

export class ThemeService {
  /**
   * Apply Theme to DOM and dynamically set CSS variables
   */
  static applyTheme(themeId: string, customConfig?: CustomThemeConfig | null): void {
    if (typeof document === 'undefined') return;

    localStorage.setItem(ACTIVE_THEME_KEY, themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    document.documentElement.classList.add('dark');

    const root = document.documentElement;

    if (themeId === 'custom' && customConfig) {
      this.injectCustomCssVariables(root, customConfig);
      localStorage.setItem(ACTIVE_CUSTOM_THEME_KEY, JSON.stringify(customConfig));
    } else {
      const preset = CURATED_THEMES.find(t => t.id === themeId);
      if (preset) {
        root.style.setProperty('--color-brand-primary', preset.colors.primary);
        root.style.setProperty('--color-brand-secondary', preset.colors.secondary);
        root.style.setProperty('--color-brand-accent', preset.colors.accent);
        root.style.setProperty('--color-brand-depth', preset.colors.depth);
        root.style.setProperty('--color-brand-sidebar', preset.colors.sidebar);
        root.style.setProperty('--color-brand-border', preset.colors.border);
        root.style.setProperty('--color-app-text', preset.colors.text);
        root.style.setProperty('--color-app-text-muted', preset.colors.textMuted);
        root.style.setProperty('--color-app-text-dim', preset.colors.textDim);
      }
    }

    // Dispatch global event for instant reactivity across all views
    window.dispatchEvent(new CustomEvent('app_theme_changed', { 
      detail: { 
        theme: themeId,
        customConfig: customConfig || null
      } 
    }));
  }

  private static injectCustomCssVariables(root: HTMLElement, config: CustomThemeConfig): void {
    root.style.setProperty('--color-brand-primary', config.primary);
    root.style.setProperty('--color-brand-secondary', config.secondary);
    root.style.setProperty('--color-brand-accent', config.accent);
    root.style.setProperty('--color-brand-depth', config.depth);
    root.style.setProperty('--color-brand-sidebar', config.sidebar);
    root.style.setProperty('--color-brand-border', `${config.primary}33`); // 20% opacity
    root.style.setProperty('--color-app-text', '#ffffff');
    root.style.setProperty('--color-app-text-muted', '#cbd5e1');
    root.style.setProperty('--color-app-text-dim', '#94a3b8');
  }

  /**
   * Get Active Theme ID
   */
  static getActiveTheme(): string {
    if (typeof localStorage === 'undefined') return 'aloha';
    return localStorage.getItem(ACTIVE_THEME_KEY) || 'aloha';
  }

  /**
   * Get Saved Custom Themes
   */
  static getSavedCustomThemes(): CustomThemeConfig[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const saved = localStorage.getItem(CUSTOM_THEMES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save a new Custom Theme
   */
  static saveCustomTheme(config: CustomThemeConfig): void {
    const existing = this.getSavedCustomThemes();
    const updated = [config, ...existing.filter(t => t.id !== config.id)];
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
  }

  /**
   * Delete a Custom Theme
   */
  static deleteCustomTheme(id: string): void {
    const existing = this.getSavedCustomThemes();
    const updated = existing.filter(t => t.id !== id);
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
  }

  /**
   * Get Active Custom Theme Data
   */
  static getActiveCustomThemeData(): CustomThemeConfig | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const saved = localStorage.getItem(ACTIVE_CUSTOM_THEME_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get Theme by ID
   */
  static getThemeById(id: string): SpiritualTheme | undefined {
    return CURATED_THEMES.find(t => t.id === id);
  }

  /**
   * Typography & Font Style Management
   */
  static applyFontStyle(styleId: string): void {
    if (typeof document === 'undefined') return;
    const preset = FONT_STYLE_PRESETS.find(f => f.id === styleId) || FONT_STYLE_PRESETS[0];
    localStorage.setItem('sanctuary_font_style', preset.id);
    document.documentElement.setAttribute('data-font-style', preset.id);

    const root = document.documentElement;
    root.style.setProperty('--font-sans', preset.fontSans);
    root.style.setProperty('--font-display', preset.fontDisplay);
    root.style.setProperty('--font-serif', preset.fontSerif);
    root.style.setProperty('--font-arabic', preset.fontArabic);
    root.style.setProperty('--font-mono', preset.fontMono);

    window.dispatchEvent(new CustomEvent('font_style_changed', { 
      detail: { fontStyle: preset.id, config: preset } 
    }));
  }

  static getActiveFontStyle(): string {
    if (typeof localStorage === 'undefined') return 'modern_sanctum';
    return localStorage.getItem('sanctuary_font_style') || 'modern_sanctum';
  }

  static applyArabicFont(arabicFontId: string): void {
    if (typeof document === 'undefined') return;
    const option = ARABIC_FONT_OPTIONS.find(a => a.id === arabicFontId) || ARABIC_FONT_OPTIONS[0];
    localStorage.setItem('sanctuary_arabic_font', option.id);
    document.documentElement.setAttribute('data-arabic-font', option.id);
    document.documentElement.style.setProperty('--font-arabic', option.fontFamily);

    window.dispatchEvent(new CustomEvent('arabic_font_changed', { 
      detail: { arabicFont: option.id, fontFamily: option.fontFamily } 
    }));
  }

  static getActiveArabicFont(): string {
    if (typeof localStorage === 'undefined') return 'amiri_quran';
    return localStorage.getItem('sanctuary_arabic_font') || 'amiri_quran';
  }

  static applyFontSize(size: 'compact' | 'standard' | 'comfort' | 'grand'): void {
    if (typeof document === 'undefined') return;
    localStorage.setItem('sanctuary_font_size', size);
    document.documentElement.setAttribute('data-font-size', size);

    const scaleMap: Record<string, string> = {
      compact: '14.5px',
      standard: '16px',
      comfort: '17.5px',
      grand: '19px'
    };
    document.documentElement.style.fontSize = scaleMap[size] || '16px';

    window.dispatchEvent(new CustomEvent('font_size_changed', { 
      detail: { fontSize: size } 
    }));
  }

  static getActiveFontSize(): 'compact' | 'standard' | 'comfort' | 'grand' {
    if (typeof localStorage === 'undefined') return 'standard';
    return (localStorage.getItem('sanctuary_font_size') as any) || 'standard';
  }
}

export interface FontStyleOption {
  id: string;
  name: string;
  arabicName: string;
  tag: string;
  description: string;
  fontSans: string;
  fontDisplay: string;
  fontSerif: string;
  fontArabic: string;
  fontMono: string;
  badgeBg: string;
  sampleEn: string;
  sampleAr: string;
  iconName?: string;
}

export const FONT_STYLE_PRESETS: FontStyleOption[] = [
  {
    id: 'modern_sanctum',
    name: 'Modern Sanctum (Default)',
    arabicName: 'الحرم العصري',
    tag: 'Modern & Clean',
    description: 'Crisp geometric humanist typeface paired with modern Quranic calligraphy for superior mobile clarity.',
    fontSans: "'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontDisplay: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
    fontSerif: "'Playfair Display', 'Cinzel', serif",
    fontArabic: "'Amiri Quran', 'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
    fontMono: "'JetBrains Mono', monospace",
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    sampleEn: 'Peace & Tranquility in Daily Worship',
    sampleAr: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
  },
  {
    id: 'sacred_medina',
    name: 'Sacred Medina (Classical)',
    arabicName: 'المدينة المنورة',
    tag: 'Spiritual & Traditional',
    description: 'Classical literary serif with authentic Ottoman and Madinah Mushaf Arabic calligraphy script.',
    fontSans: "'Amiri', 'Noto Naskh Arabic', 'Plus Jakarta Sans', Georgia, serif",
    fontDisplay: "'Cinzel', 'Playfair Display', serif",
    fontSerif: "'Cinzel', 'Playfair Display', Georgia, serif",
    fontArabic: "'Amiri Quran', 'Amiri', serif",
    fontMono: "'JetBrains Mono', monospace",
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    sampleEn: 'In Remembrance of Allah Hearts Find Rest',
    sampleAr: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ'
  },
  {
    id: 'royal_heritage',
    name: 'Royal Heritage (Imperial)',
    arabicName: 'التراث السلطاني',
    tag: 'Majestic & Editorial',
    description: 'High-contrast luxury serif display font with Scheherazade calligraphy for noble presence.',
    fontSans: "'Playfair Display', 'Cormorant Garamond', 'Plus Jakarta Sans', Georgia, serif",
    fontDisplay: "'Cinzel', 'Playfair Display', serif",
    fontSerif: "'Cinzel', 'Cormorant Garamond', Georgia, serif",
    fontArabic: "'Scheherazade New', 'Amiri', serif",
    fontMono: "'JetBrains Mono', monospace",
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    sampleEn: 'Majesty, Divine Light & Eternal Reverence',
    sampleAr: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ'
  },
  {
    id: 'minimal_noor',
    name: 'Minimal Noor (Contemporary)',
    arabicName: 'النور النقي',
    tag: 'Minimal & Focus',
    description: 'Ultra-sleek, distraction-free modern typography designed for contemplative focus.',
    fontSans: "'Outfit', 'Alexandria', 'Plus Jakarta Sans', sans-serif",
    fontDisplay: "'Outfit', 'Alexandria', sans-serif",
    fontSerif: "'Playfair Display', serif",
    fontArabic: "'Noto Naskh Arabic', 'Tajawal', 'Amiri', serif",
    fontMono: "'JetBrains Mono', monospace",
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    sampleEn: 'Clarity, Barakah and Daily Reflection',
    sampleAr: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً'
  },
  {
    id: 'alexandria_modern',
    name: 'Alexandria Geometric',
    arabicName: 'الإسكندرية المعاصرة',
    tag: 'Contemporary Arabic',
    description: 'Distinctive contemporary Arabic geometric typography with sleek modern proportions.',
    fontSans: "'Alexandria', 'Tajawal', 'Plus Jakarta Sans', sans-serif",
    fontDisplay: "'Alexandria', 'Outfit', sans-serif",
    fontSerif: "'Playfair Display', serif",
    fontArabic: "'Alexandria', 'Tajawal', 'Noto Naskh Arabic', sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    sampleEn: 'Illuminated Path & Spiritual Awakening',
    sampleAr: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ'
  },
  {
    id: 'obsidian_mono',
    name: 'Obsidian Precision (Mono)',
    arabicName: 'البيان المحكم',
    tag: 'Precise & Structured',
    description: 'Technical monospace styling for seekers who value tabular prayer precision and clean metrics.',
    fontSans: "'JetBrains Mono', 'Plus Jakarta Sans', monospace",
    fontDisplay: "'JetBrains Mono', sans-serif",
    fontSerif: "'Playfair Display', serif",
    fontArabic: "'Amiri', 'Noto Naskh Arabic', serif",
    fontMono: "'JetBrains Mono', monospace",
    badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    sampleEn: 'Fajr 05:12 • Dhuhr 12:45 • Maghrib 18:30',
    sampleAr: 'وَأَقِمِ الصَّلَاةَ لِذِكْرِي'
  }
];

export interface ArabicFontOption {
  id: string;
  name: string;
  arabicName: string;
  fontFamily: string;
  style: string;
  sample: string;
}

export const ARABIC_FONT_OPTIONS: ArabicFontOption[] = [
  {
    id: 'amiri_quran',
    name: 'Amiri Quran',
    arabicName: 'أميري مصحف',
    fontFamily: "'Amiri Quran', 'Amiri', serif",
    style: 'Madinah Mushaf Classical',
    sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
  },
  {
    id: 'noto_naskh',
    name: 'Noto Naskh Arabic',
    arabicName: 'خط النسخ العربي',
    fontFamily: "'Noto Naskh Arabic', serif",
    style: 'Crisp Digital Naskh',
    sample: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ'
  },
  {
    id: 'scheherazade',
    name: 'Scheherazade New',
    arabicName: 'شهرزاد التراثية',
    fontFamily: "'Scheherazade New', 'Amiri', serif",
    style: 'Classical Ottoman & Indo-Pak',
    sample: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ'
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    arabicName: 'الإسكندرية الحديث',
    fontFamily: "'Alexandria', sans-serif",
    style: 'Modern Geometric Display',
    sample: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ'
  },
  {
    id: 'tajawal',
    name: 'Tajawal',
    arabicName: 'خط تجوال الأنيق',
    fontFamily: "'Tajawal', sans-serif",
    style: 'Clean Contemporary Sans',
    sample: 'مَالِكِ يَوْمِ الدِّينِ'
  }
];

export interface FontSizeOption {
  id: 'compact' | 'standard' | 'comfort' | 'grand';
  label: string;
  scale: string;
  description: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { id: 'compact', label: 'Compact', scale: '90%', description: 'Dense & high information density' },
  { id: 'standard', label: 'Standard', scale: '100%', description: 'Default balanced proportions' },
  { id: 'comfort', label: 'Comfort', scale: '112%', description: 'Relaxed reading & larger touch targets' },
  { id: 'grand', label: 'Grand', scale: '125%', description: 'Maximum legibility & high readability' }
];

