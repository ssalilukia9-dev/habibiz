import { NameOfAllah } from '../data/namesOfAllahData.ts';
import salamSoulBg from '../assets/images/salam_soul_bg_1783445291609.jpg';
import kaabaBg from '../assets/images/kaaba_dua_theme_bg_1786900551467.jpg';
import splashLanternBg from '../assets/images/splash_lantern_bg_1786900537610.jpg';

export interface DailyBannerData {
  date: string;
  attributeId: number;
  transliteration: string;
  arabic: string;
  english: string;
  meaning: string;
  themeName: string;
  themeCategory: 'mercy' | 'majesty' | 'light' | 'abundance' | 'wisdom' | 'protection' | 'friday' | 'ramadan';
  imageUrl: string;
  fallbackImageUrl: string;
  accentColor: string;
  secondaryColor: string;
  glowGradient: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  tagline: string;
  aiReflection?: string;
  photographerCredit?: string;
}

// Curated high-resolution, spiritual Islamic imagery themes mapped to spiritual categories
const THEMED_IMAGE_SETS = {
  mercy: [
    {
      url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=85',
      name: 'Celestial Dawn over Grand Mosque Arches',
      credit: 'Unsplash / Islamic Heritage'
    },
    {
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=85',
      name: 'Golden Morning Radiance over Sanctuary Minarets',
      credit: 'Unsplash / Spiritual Dawn'
    },
    {
      url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1920&q=85',
      name: 'Serene Tranquility Courtyard at Sunrise',
      credit: 'Unsplash / Sacred Peace'
    }
  ],
  majesty: [
    {
      url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1920&q=85',
      name: 'Grand Royal Dome & Celestial Sapphire Sky',
      credit: 'Unsplash / Grandeur'
    },
    {
      url: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1920&q=85',
      name: 'Majestic Arabesque Colonnade Architecture',
      credit: 'Unsplash / Architecture'
    },
    {
      url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1920&q=85',
      name: 'Infinite Islamic Geometric Geometry & Marble',
      credit: 'Unsplash / Infinite Majesty'
    }
  ],
  light: [
    {
      url: 'https://images.unsplash.com/photo-1564769625624-9a9ec2b10091?auto=format&fit=crop&w=1920&q=85',
      name: 'Luminous Emerald & Starlit Lantern Night',
      credit: 'Unsplash / Divine Noor'
    },
    {
      url: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1920&q=85',
      name: 'Celestial Beams of Light Illuminating Prayer Hall',
      credit: 'Unsplash / Noor'
    },
    {
      url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=85',
      name: 'Ethereal Twilight Glow with Crescent Starlight',
      credit: 'Unsplash / Sacred Twilight'
    }
  ],
  abundance: [
    {
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=85',
      name: 'Golden Desert Dunes at Celestial Golden Hour',
      credit: 'Unsplash / Vast Sustenance'
    },
    {
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
      name: 'Radiant Sunburst of Divine Blessings & Barakah',
      credit: 'Unsplash / Barakah'
    },
    {
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=85',
      name: 'Tranquil Verdant Oasis of Spiritual Abundance',
      credit: 'Unsplash / Serene Nature'
    }
  ],
  wisdom: [
    {
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=85',
      name: 'Cosmic Constellations & Starlit Spiritual Vastness',
      credit: 'Unsplash / Infinite Knowledge'
    },
    {
      url: 'https://images.unsplash.com/photo-1518709779341-56cf4535e94b?auto=format&fit=crop&w=1920&q=85',
      name: 'Sacred Illuminated Calligraphic Carvings',
      credit: 'Unsplash / Wisdom'
    },
    {
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
      name: 'Calm Oceans of Deep Spiritual Contemplation',
      credit: 'Unsplash / Contemplation'
    }
  ],
  protection: [
    {
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=85',
      name: 'Peaceful Sanctuary of Divine Refuge & Peace',
      credit: 'Unsplash / Divine Refuge'
    },
    {
      url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1920&q=85',
      name: 'Quiet Starlit Night of Assurance & Serenity',
      credit: 'Unsplash / Assurance'
    }
  ],
  friday: [
    {
      url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=85',
      name: 'Blessed Jumu’ah Emerald & Gold Mosque Grandeur',
      credit: 'Unsplash / Jumu’ah Mubarak'
    },
    {
      url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1920&q=85',
      name: 'Master of Days Illuminated Congregational Courtyard',
      credit: 'Unsplash / Blessed Friday'
    }
  ],
  ramadan: [
    {
      url: 'https://images.unsplash.com/photo-1564769625624-9a9ec2b10091?auto=format&fit=crop&w=1920&q=85',
      name: 'Holy Ramadan Lantern & Crescent Night',
      credit: 'Unsplash / Ramadan Kareem'
    }
  ]
};

// Categorize Divine Names into corresponding spiritual themes
export function getAttributeCategory(id: number, isFriday = false, isRamadan = false): keyof typeof THEMED_IMAGE_SETS {
  if (isRamadan) return 'ramadan';
  if (isFriday) return 'friday';

  // Mercy & Forgiveness
  if ([1, 2, 14, 34, 47, 79, 80, 81, 82].includes(id)) return 'mercy';
  // Majesty & Sovereignty
  if ([3, 4, 7, 8, 9, 10, 15, 24, 25, 33, 36, 37, 41, 48, 64, 65, 84, 85].includes(id)) return 'majesty';
  // Light, Peace & Creation
  if ([5, 6, 11, 12, 13, 93, 94, 95, 96, 97].includes(id)) return 'light';
  // Sustenance & Bounties
  if ([16, 17, 18, 21, 35, 42, 88, 89, 90, 91].includes(id)) return 'abundance';
  // Wisdom & Knowledge
  if ([19, 26, 27, 28, 29, 30, 31, 32, 45, 46, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63].includes(id)) return 'wisdom';
  // Protection & Strength
  return 'protection';
}

// Visual styles mapped to theme categories
const CATEGORY_STYLES: Record<string, {
  accentColor: string;
  secondaryColor: string;
  glowGradient: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
  themeTitle: string;
}> = {
  mercy: {
    accentColor: '#f59e0b',
    secondaryColor: '#10b981',
    glowGradient: 'from-amber-500/25 via-[#061828]/85 to-emerald-500/20',
    borderClass: 'border-amber-400/40 hover:border-amber-400/70',
    badgeBg: 'bg-amber-400/15 border-amber-400/30',
    badgeText: 'text-amber-300',
    themeTitle: 'Divine Mercy & Compassion Aura'
  },
  majesty: {
    accentColor: '#6366f1',
    secondaryColor: '#f59e0b',
    glowGradient: 'from-indigo-600/30 via-[#040e1a]/90 to-amber-500/20',
    borderClass: 'border-indigo-400/40 hover:border-indigo-400/70',
    badgeBg: 'bg-indigo-500/20 border-indigo-400/30',
    badgeText: 'text-indigo-300',
    themeTitle: 'Sacred Majesty & Grandeur Aura'
  },
  light: {
    accentColor: '#10b981',
    secondaryColor: '#38bdf8',
    glowGradient: 'from-emerald-500/25 via-[#031525]/85 to-cyan-500/20',
    borderClass: 'border-emerald-400/40 hover:border-emerald-400/70',
    badgeBg: 'bg-emerald-400/15 border-emerald-400/30',
    badgeText: 'text-emerald-300',
    themeTitle: 'Celestial Light & Peace Aura'
  },
  abundance: {
    accentColor: '#eab308',
    secondaryColor: '#f97316',
    glowGradient: 'from-yellow-500/25 via-[#051726]/85 to-orange-500/20',
    borderClass: 'border-yellow-400/40 hover:border-yellow-400/70',
    badgeBg: 'bg-yellow-400/15 border-yellow-400/30',
    badgeText: 'text-yellow-300',
    themeTitle: 'Barakah & Sustenance Aura'
  },
  wisdom: {
    accentColor: '#38bdf8',
    secondaryColor: '#a855f7',
    glowGradient: 'from-sky-500/25 via-[#03101e]/85 to-purple-500/20',
    borderClass: 'border-sky-400/40 hover:border-sky-400/70',
    badgeBg: 'bg-sky-400/15 border-sky-400/30',
    badgeText: 'text-sky-300',
    themeTitle: 'Infinite Wisdom & Insight Aura'
  },
  protection: {
    accentColor: '#14b8a6',
    secondaryColor: '#0ea5e9',
    glowGradient: 'from-teal-500/25 via-[#041422]/85 to-blue-500/20',
    borderClass: 'border-teal-400/40 hover:border-teal-400/70',
    badgeBg: 'bg-teal-400/15 border-teal-400/30',
    badgeText: 'text-teal-300',
    themeTitle: 'Peace & Preservation Refuge Aura'
  },
  friday: {
    accentColor: '#10b981',
    secondaryColor: '#f59e0b',
    glowGradient: 'from-emerald-500/30 via-[#031826]/90 to-amber-500/25',
    borderClass: 'border-emerald-400/50 hover:border-emerald-400/80',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/40',
    badgeText: 'text-emerald-300',
    themeTitle: 'Blessed Master of Days (Jumu’ah) Aura'
  },
  ramadan: {
    accentColor: '#f59e0b',
    secondaryColor: '#a855f7',
    glowGradient: 'from-amber-500/30 via-[#051324]/90 to-purple-500/25',
    borderClass: 'border-amber-400/50 hover:border-amber-400/80',
    badgeBg: 'bg-amber-400/20 border-amber-400/40',
    badgeText: 'text-amber-300',
    themeTitle: 'Holy Month of Ramadan Aura'
  }
};

/**
 * Generates or retrieves the daily banner data synchronously with instant fallback,
 * while asynchronously checking the server AI endpoint for dynamic AI reflections and personalized daily themes.
 */
export async function fetchDailyBanner(
  attribute: NameOfAllah,
  date: Date = new Date(),
  variationIndex = 0
): Promise<DailyBannerData> {
  const dateStr = date.toISOString().split('T')[0];
  const isFriday = date.getDay() === 5;
  const isRamadan = localStorage.getItem('force-ramadan-mode') === 'true';
  const category = getAttributeCategory(attribute.id, isFriday, isRamadan);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.mercy;

  const imageSet = THEMED_IMAGE_SETS[category] || THEMED_IMAGE_SETS.mercy;
  const selectedImageMeta = imageSet[(variationIndex + attribute.id) % imageSet.length];

  const cacheKey = `sanctuary_daily_banner_${dateStr}_attr${attribute.id}_v${variationIndex}`;
  
  // Base deterministic data
  const baseData: DailyBannerData = {
    date: dateStr,
    attributeId: attribute.id,
    transliteration: attribute.transliteration,
    arabic: attribute.arabic,
    english: attribute.english,
    meaning: attribute.meaning,
    themeName: style.themeTitle,
    themeCategory: category,
    imageUrl: selectedImageMeta.url,
    fallbackImageUrl: salamSoulBg,
    accentColor: style.accentColor,
    secondaryColor: style.secondaryColor,
    glowGradient: style.glowGradient,
    borderClass: style.borderClass,
    badgeBg: style.badgeBg,
    badgeText: style.badgeText,
    tagline: `Embody the Divine Quality of ${attribute.transliteration} (${attribute.english}) today.`,
    photographerCredit: selectedImageMeta.credit
  };

  // Try cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.imageUrl) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Daily banner cache read warning:', e);
  }

  // Try fetching AI enriched theme from server endpoint
  try {
    const res = await fetch(`/api/ai/daily-banner-image?date=${dateStr}&attributeId=${attribute.id}&category=${category}&variation=${variationIndex}`);
    if (res.ok) {
      const serverData = await res.json();
      if (serverData && serverData.imageUrl) {
        const merged: DailyBannerData = {
          ...baseData,
          ...serverData,
          imageUrl: serverData.imageUrl || baseData.imageUrl,
          aiReflection: serverData.aiReflection || baseData.tagline
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(merged));
        } catch {
          // ignore quota error
        }
        return merged;
      }
    }
  } catch (err) {
    // Network or offline fallback
    console.info('Using high-performance local AI banner theme fallback');
  }

  // Store base deterministic data
  try {
    localStorage.setItem(cacheKey, JSON.stringify(baseData));
  } catch {
    // ignore
  }

  return baseData;
}

export function getSynchronousDailyBannerFallback(
  attribute: NameOfAllah,
  date: Date = new Date(),
  variationIndex = 0
): DailyBannerData {
  const dateStr = date.toISOString().split('T')[0];
  const isFriday = date.getDay() === 5;
  const isRamadan = localStorage.getItem('force-ramadan-mode') === 'true';
  const category = getAttributeCategory(attribute.id, isFriday, isRamadan);
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.mercy;
  const imageSet = THEMED_IMAGE_SETS[category] || THEMED_IMAGE_SETS.mercy;
  const selectedImageMeta = imageSet[(variationIndex + attribute.id) % imageSet.length];

  return {
    date: dateStr,
    attributeId: attribute.id,
    transliteration: attribute.transliteration,
    arabic: attribute.arabic,
    english: attribute.english,
    meaning: attribute.meaning,
    themeName: style.themeTitle,
    themeCategory: category,
    imageUrl: selectedImageMeta.url,
    fallbackImageUrl: salamSoulBg,
    accentColor: style.accentColor,
    secondaryColor: style.secondaryColor,
    glowGradient: style.glowGradient,
    borderClass: style.borderClass,
    badgeBg: style.badgeBg,
    badgeText: style.badgeText,
    tagline: `Embody the Divine Quality of ${attribute.transliteration} (${attribute.english}) today.`,
    photographerCredit: selectedImageMeta.credit
  };
}
