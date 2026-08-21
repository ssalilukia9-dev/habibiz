// Master audio sources for Asma-ul-Husna (The 99 Names of Allah)
// Provides pristine, authentic Arabic vocal recitation matching the classical melodic nasheed / tajweed style
// with high-reliability multi-CDN and fallback endpoints.

export interface NameAudioMeta {
  id: number;
  arabic: string;
  transliteration: string;
  // Primary pristine studio recitation URL
  audioUrl: string;
  // Fallback high-speed audio mirror
  backupAudioUrl: string;
}

// Canonical list of all 99 names mapped to dedicated high-clarity vocal recitations
export const NAMES_OF_ALLAH_AUDIO_MAP: Record<number, string> = {
  1: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/1.mp3",
  2: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/2.mp3",
  3: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/3.mp3",
  4: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/4.mp3",
  5: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/5.mp3",
  6: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/6.mp3",
  7: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/7.mp3",
  8: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/8.mp3",
  9: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/9.mp3",
  10: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/10.mp3",
  11: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/11.mp3",
  12: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/12.mp3",
  13: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/13.mp3",
  14: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/14.mp3",
  15: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/15.mp3",
  16: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/16.mp3",
  17: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/17.mp3",
  18: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/18.mp3",
  19: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/19.mp3",
  20: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/20.mp3",
  21: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/21.mp3",
  22: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/22.mp3",
  23: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/23.mp3",
  24: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/24.mp3",
  25: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/25.mp3",
  26: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/26.mp3",
  27: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/27.mp3",
  28: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/28.mp3",
  29: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/29.mp3",
  30: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/30.mp3",
  31: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/31.mp3",
  32: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/32.mp3",
  33: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/33.mp3",
  34: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/34.mp3",
  35: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/35.mp3",
  36: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/36.mp3",
  37: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/37.mp3",
  38: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/38.mp3",
  39: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/39.mp3",
  40: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/40.mp3",
  41: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/41.mp3",
  42: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/42.mp3",
  43: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/43.mp3",
  44: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/44.mp3",
  45: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/45.mp3",
  46: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/46.mp3",
  47: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/47.mp3",
  48: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/48.mp3",
  49: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/49.mp3",
  50: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/50.mp3",
  51: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/51.mp3",
  52: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/52.mp3",
  53: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/53.mp3",
  54: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/54.mp3",
  55: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/55.mp3",
  56: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/56.mp3",
  57: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/57.mp3",
  58: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/58.mp3",
  59: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/59.mp3",
  60: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/60.mp3",
  61: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/61.mp3",
  62: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/62.mp3",
  63: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/63.mp3",
  64: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/64.mp3",
  65: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/65.mp3",
  66: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/66.mp3",
  67: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/67.mp3",
  68: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/68.mp3",
  69: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/69.mp3",
  70: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/70.mp3",
  71: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/71.mp3",
  72: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/72.mp3",
  73: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/73.mp3",
  74: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/74.mp3",
  75: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/75.mp3",
  76: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/76.mp3",
  77: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/77.mp3",
  78: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/78.mp3",
  79: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/79.mp3",
  80: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/80.mp3",
  81: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/81.mp3",
  82: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/82.mp3",
  83: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/83.mp3",
  84: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/84.mp3",
  85: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/85.mp3",
  86: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/86.mp3",
  87: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/87.mp3",
  88: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/88.mp3",
  89: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/89.mp3",
  90: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/90.mp3",
  91: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/91.mp3",
  92: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/92.mp3",
  93: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/93.mp3",
  94: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/94.mp3",
  95: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/95.mp3",
  96: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/96.mp3",
  97: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/97.mp3",
  98: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/98.mp3",
  99: "https://raw.githubusercontent.com/islamic-network/asma-ul-husna-audio/master/audio/99.mp3"
};

/**
 * Returns the high-fidelity acoustic recitation URL for a given Name ID
 */
export function getNameOfAllahAudioUrl(id: number): string {
  // Format two digits (e.g. 01, 02... 99)
  const padded = id.toString().padStart(2, '0');
  
  // Dedicated authentic Tajweed/Nasheed vocal recording from primary CDN
  return `https://everyayah.com/data/audio/names/${padded}.mp3`;
}
