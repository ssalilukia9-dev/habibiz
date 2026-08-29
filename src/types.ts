export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | any;
  translation?: string;
  audio?: string;
  audioBlob?: Blob;
}

export interface Translation {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface JuzSurahEntry {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  startAyah: number;
  endAyah: number;
  totalAyahsInJuz: number;
}

export interface Juz {
  index: number;
  nameArabic: string;
  nameTransliteration: string;
  nameTranslation: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  startPage: number;
  endPage: number;
  totalAyahs: number;
  surahs: JuzSurahEntry[];
}

export interface Hadith {
  id: number;
  narrator: string;
  arabic: string;
  english: string;
  collection: string;
  topic: string;
}

export interface GratitudeEntry {
  id: string;
  userId?: string;
  content: string;
  category: string;
  mood: string;
  hasanatAwarded: number;
  dateStr: string; // YYYY-MM-DD
  createdAt: any;
  aliyahReflection?: string;
  alhamdulillahCount?: number;
}

export type ReadLaterItemType = 'ayah' | 'hadith';

export interface ReadLaterItem {
  id: string; // e.g. "ayah-1-1" or "hadith-12"
  type: ReadLaterItemType;
  title: string; // e.g. "Al-Fatihah 1:1" or "Sahih al-Bukhari #1"
  subtitle?: string; // e.g. "The Opener" or "Narrated by Umar ibn al-Khattab"
  arabic: string;
  translation: string;
  source: string; // Surah name or Hadith collection
  reference: string; // e.g. "Verse 1" or "Hadith #1"
  topic?: string;
  surahNumber?: number;
  numberInSurah?: number;
  hadithId?: number;
  hadithCollection?: string;
  addedAt: number; // timestamp
  isRead: boolean;
  readAt?: number;
  notes?: string;
  estimatedReadTimeSeconds?: number;
}

