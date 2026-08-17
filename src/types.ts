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
