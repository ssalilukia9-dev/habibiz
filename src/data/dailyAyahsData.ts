export interface DailyAyahItem {
  id: number;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahEnglishName: string;
  arabic: string;
  translation: string;
  theme: string;
  shortReflection: string;
  accentColor?: string;
}

export const DAILY_ISLAMIC_AYAHS: DailyAyahItem[] = [
  {
    id: 1,
    surahNumber: 94,
    ayahNumber: 6,
    surahName: "الشرح",
    surahEnglishName: "Ash-Sharh",
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship will come ease.",
    theme: "Divine Relief",
    shortReflection: "Ease is not merely after the hardship, it is interwoven with it.",
    accentColor: "#10b981"
  },
  {
    id: 2,
    surahNumber: 2,
    ayahNumber: 152,
    surahName: "البقرة",
    surahEnglishName: "Al-Baqarah",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.",
    theme: "Sacred Remembrance",
    shortReflection: "Whenever your heart mentions Allah, the Lord of the heavens mentions you.",
    accentColor: "#f59e0b"
  },
  {
    id: 3,
    surahNumber: 65,
    ayahNumber: 3,
    surahName: "الطلاق",
    surahEnglishName: "At-Talaq",
    arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever relies upon Allah - then He is sufficient for him.",
    theme: "Tawakkul & Trust",
    shortReflection: "Hand your affairs to the One who controls the skies, and find complete tranquility.",
    accentColor: "#3b82f6"
  },
  {
    id: 4,
    surahNumber: 13,
    ayahNumber: 28,
    surahName: "الرعد",
    surahEnglishName: "Ar-Ra'd",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Unquestionably, by the remembrance of Allah hearts are assured.",
    theme: "Heart's Serenity",
    shortReflection: "True inner calm is not found in the world, but in reconnecting with your Creator.",
    accentColor: "#8b5cf6"
  },
  {
    id: 5,
    surahNumber: 2,
    ayahNumber: 286,
    surahName: "البقرة",
    surahEnglishName: "Al-Baqarah",
    arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond that it can bear.",
    theme: "Divine Mercy",
    shortReflection: "You were created with the spiritual resilience to overcome every test you encounter.",
    accentColor: "#ec4899"
  },
  {
    id: 6,
    surahNumber: 39,
    ayahNumber: 53,
    surahName: "الزمر",
    surahEnglishName: "Az-Zumar",
    arabic: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    translation: "Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.",
    theme: "Infinite Forgiveness",
    shortReflection: "No matter how far you have strayed, Allah's mercy is always one sincere prayer away.",
    accentColor: "#14b8a6"
  },
  {
    id: 7,
    surahNumber: 2,
    ayahNumber: 186,
    surahName: "البقرة",
    surahEnglishName: "Al-Baqarah",
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocations of the caller when he calls upon Me.",
    theme: "Divine Proximity",
    shortReflection: "Allah is closer to you than your jugular vein; whisper your worries to Him.",
    accentColor: "#f97316"
  },
  {
    id: 8,
    surahNumber: 3,
    ayahNumber: 139,
    surahName: "آل عمران",
    surahEnglishName: "Ali 'Imran",
    arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
    translation: "So do not weaken and do not grieve, and you will be superior if you are true believers.",
    theme: "Spiritual Courage",
    shortReflection: "Hold firm to your faith and dignity; your worth is determined by your bond with Allah.",
    accentColor: "#06b6d4"
  },
  {
    id: 9,
    surahNumber: 55,
    ayahNumber: 60,
    surahName: "الرحمن",
    surahEnglishName: "Ar-Rahman",
    arabic: "هَلْ جَزَاءُ الْإِحْسَانِ إِلَّا الْإِحْسَانُ",
    translation: "Is the reward for good anything but good?",
    theme: "Excellence & Ihsan",
    shortReflection: "Plant seeds of unconditional kindness today; Allah never lets sincere goodness go to waste.",
    accentColor: "#a855f7"
  },
  {
    id: 10,
    surahNumber: 21,
    ayahNumber: 87,
    surahName: "الأنبياء",
    surahEnglishName: "Al-Anbiya",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    theme: "Dua of Prophet Yunus",
    shortReflection: "The universal key that unlocks every spiritual and worldly darkness.",
    accentColor: "#eab308"
  },
  {
    id: 11,
    surahNumber: 93,
    ayahNumber: 7,
    surahName: "الضحى",
    surahEnglishName: "Ad-Duha",
    arabic: "وَوَجَدَكَ ضَالًّا فَهَدَىٰ",
    translation: "And He found you lost and guided you.",
    theme: "Guidance & Grace",
    shortReflection: "The One who guided your heart through past uncertainties will light your way forward today.",
    accentColor: "#10b981"
  },
  {
    id: 12,
    surahNumber: 14,
    ayahNumber: 7,
    surahName: "إبراهيم",
    surahEnglishName: "Ibrahim",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    translation: "If you are grateful, I will surely increase you in favor.",
    theme: "Abundance of Gratitude",
    shortReflection: "Gratitude turns what you have into more than enough and preserves divine blessings.",
    accentColor: "#f59e0b"
  }
];

export function getDailyAyahForDate(date: Date = new Date()): DailyAyahItem {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % DAILY_ISLAMIC_AYAHS.length;
  return DAILY_ISLAMIC_AYAHS[index];
}
