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
    name: 'Aloha Oceanic Gold',
    arabicTitle: 'السكينة الذهبية',
    mood: 'Serenity & Reflection',
    moodDescription: 'Warm bronze gold paired with deep oceanic obsidian for peaceful mindfulness.',
    reflection: '“Unquestionably, by the remembrance of Allah hearts are assured.” (13:28)',
    category: 'tranquility',
    colors: {
      primary: '#c58f54',
      secondary: '#1b4d6e',
      accent: '#e2b789',
      depth: '#0a1c2a',
      sidebar: '#06121c',
      border: 'rgba(197, 143, 84, 0.22)',
      text: '#fdfbf7',
      textMuted: '#cbd5e1',
      textDim: '#94a3b8'
    },
    glowColor: 'rgba(197, 143, 84, 0.35)',
    patternType: 'arabesque'
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
}
