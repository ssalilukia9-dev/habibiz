// Advanced Arabic Orthography Normalizer & Speech Matcher for Quran Recitation

/**
 * Strips all Quranic diacritics, harakat, tanween, tajweed markers,
 * waqf symbols, small letters, and normalizes various orthographic glyphs
 * (Alif variations, Ta Marbuta, Ya/Alif Maqsura).
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    // Remove Quranic Stop Marks, Sajdah, Small high letters, and Tajweed symbols
    .replace(/[\u06D6-\u06ED\u06DF\u06E0\u06E2\u06E3\u06E5\u06E6\u06E8\u06EA-\u06ED]/g, '')
    // Remove all Tashkeel / Harakat (Fatha, Damma, Kasra, Sukun, Shaddah, Tanween, Dagger Alif)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Standardize all forms of Alif (Wasl, Maddah, Hamza above/below) -> Bare Alif
    .replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g, 'ا')
    // Standardize Alif Maqsura and dotted Ya -> Bare Ya
    .replace(/[\u0649\u064A\u06CC]/g, 'ي')
    // Standardize Hamza on Ya / Waw -> Base letter
    .replace(/[\u0626]/g, 'ي')
    .replace(/[\u0624]/g, 'و')
    // Standardize Ta Marbuta -> Ha
    .replace(/[\u0629]/g, 'ه')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Remove punctuation, numbers, braces, brackets
    .replace(/[٠-٩0-9\(\)\[\]\{\}«»\.,;:\?!_"\-—۝۞۩]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Levenshtein Distance for fuzzy Arabic word matching
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Calculates similarity coefficient (0.0 to 1.0) between two Arabic strings
 */
export function calculateArabicSimilarity(s1: string, s2: string): number {
  const n1 = normalizeArabicText(s1);
  const n2 = normalizeArabicText(s2);
  if (!n1 || !n2) return 0;
  if (n1 === n2) return 1.0;

  const maxLen = Math.max(n1.length, n2.length);
  if (maxLen === 0) return 1.0;

  const dist = levenshteinDistance(n1, n2);
  const levSim = 1 - dist / maxLen;

  // Check prefix / suffix match (common when user recites with conjunctions like Wa- / Fa- / Bi- / Al-)
  const prefixMatch = n1.startsWith(n2) || n2.startsWith(n1) ? 0.2 : 0;
  const containsMatch = n1.includes(n2) || n2.includes(n1) ? 0.15 : 0;

  return Math.min(1.0, Math.max(levSim, prefixMatch, containsMatch));
}

/**
 * Checks if a spoken token matches an expected Quranic word with tolerance
 */
export function isWordMatch(expected: string, spoken: string): boolean {
  const normExp = normalizeArabicText(expected);
  const normSpk = normalizeArabicText(spoken);

  if (!normExp || !normSpk) return false;
  if (normExp === normSpk) return true;

  // Handle common Arabic prefixes: و (wa), ف (fa), ب (bi), ل (li), ك (ka), ال (al)
  const stripPrefixes = (w: string) => w.replace(/^(و|ف|ب|ل|ك|ال)/, '');
  if (stripPrefixes(normExp) === stripPrefixes(normSpk)) return true;

  // If length is short (1-2 chars), require strict match
  if (normExp.length <= 2) return normExp === normSpk;

  const sim = calculateArabicSimilarity(normExp, normSpk);
  if (sim >= 0.65) return true;

  // Levenshtein tolerance: allow 1 edit for words >= 3 chars, 2 edits for words >= 6 chars
  const dist = levenshteinDistance(normExp, normSpk);
  if (normExp.length >= 6 && dist <= 2) return true;
  if (normExp.length >= 3 && dist <= 1) return true;

  return false;
}

/**
 * Analyzes pronunciation discrepancies to generate actionable Tajweed tips
 */
export function diagnoseTajweedDiscrepancy(expected: string, spoken: string): { reason: string; tip: string } {
  const exp = normalizeArabicText(expected);
  const spk = normalizeArabicText(spoken);

  if (!spk) {
    return {
      reason: 'Word not captured',
      tip: 'Recite clearly with steady breath through the active Ayah.'
    };
  }

  // Throat letters (Halq): Hamza, Ha, 'Ayn, Haa, Ghayn, Khaa
  if (/[عحغخ]/.test(exp) && !/[عحغخ]/.test(spk)) {
    return {
      reason: 'Throat Articulation (Makhraj Al-Halq)',
      tip: 'Focus on clear friction and vibration in the middle/lower throat for letters like ع and ح.'
    };
  }

  // Heavy vs Light (Tafkheem / Tarqeeq): Saad, Daad, Taa, Dhaa, Qaf, Ghayn, Khaa
  if (/[صضطظقف]/.test(exp) && !/[صضطظقف]/.test(spk)) {
    return {
      reason: 'Heavy Letter Resonance (Tafkheem)',
      tip: 'Elevate the rear of the tongue to give heavy letters (Tafkheem) deep resonance.'
    };
  }

  // Qalqalah Letters: Qaf, Taa, Baa, Jeem, Daal (قطب جد)
  if (/[قطبجد]/.test(exp)) {
    return {
      reason: 'Qalqalah (Echoing Bounce)',
      tip: 'Give a crisp un-voweled bounce on Qalqalah letters when stopping or with sukun.'
    };
  }

  // Nasalization (Ghunnah): Noon / Meem
  if (/[نم]/.test(exp)) {
    return {
      reason: 'Nasalization (Ghunnah Timing)',
      tip: 'Hold Ghunnah with 2 full counts of resonance through the nasal cavity (Khayshoom).'
    };
  }

  return {
    reason: 'Phonetic Discrepancy',
    tip: `Expected "${expected}". Take a calm breath and enunciate each letter slowly.`
  };
}

export function toArabicDigits(num: number | string): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (d) => digits[parseInt(d, 10)]);
}
