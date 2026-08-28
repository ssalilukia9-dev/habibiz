// Embedded Offline Quran Fallback Cache for High-Reliability Practice

export interface FallbackAyah {
  number: number;
  numberInSurah: number;
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  text: string;
  translation: string;
  juz: number;
  page: number;
}

export const FALLBACK_PAGES: Record<number, FallbackAyah[]> = {
  1: [
    {
      number: 1,
      numberInSurah: 1,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      juz: 1,
      page: 1
    },
    {
      number: 2,
      numberInSurah: 2,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      translation: "[All] praise is [due] to Allah, Lord of the worlds -",
      juz: 1,
      page: 1
    },
    {
      number: 3,
      numberInSurah: 3,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translation: "The Entirely Merciful, the Especially Merciful,",
      juz: 1,
      page: 1
    },
    {
      number: 4,
      numberInSurah: 4,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      translation: "Sovereign of the Day of Recompense.",
      juz: 1,
      page: 1
    },
    {
      number: 5,
      numberInSurah: 5,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "It is You we worship and You we ask for help.",
      juz: 1,
      page: 1
    },
    {
      number: 6,
      numberInSurah: 6,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      translation: "Guide us to the straight path -",
      juz: 1,
      page: 1
    },
    {
      number: 7,
      numberInSurah: 7,
      surahNumber: 1,
      surahName: "الفاتحة",
      surahEnglishName: "Al-Fatihah",
      text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      juz: 1,
      page: 1
    }
  ],
  2: [
    {
      number: 8,
      numberInSurah: 1,
      surahNumber: 2,
      surahName: "البقرة",
      surahEnglishName: "Al-Baqarah",
      text: "الٓمٓ",
      translation: "Alif, Lam, Meem.",
      juz: 1,
      page: 2
    },
    {
      number: 9,
      numberInSurah: 2,
      surahNumber: 2,
      surahName: "البقرة",
      surahEnglishName: "Al-Baqarah",
      text: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      translation: "This is the Book about which there is no doubt, a guidance for those conscious of Allah -",
      juz: 1,
      page: 2
    },
    {
      number: 10,
      numberInSurah: 3,
      surahNumber: 2,
      surahName: "البقرة",
      surahEnglishName: "Al-Baqarah",
      text: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَٰهُمْ يُنفِقُونَ",
      translation: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them,",
      juz: 1,
      page: 2
    },
    {
      number: 11,
      numberInSurah: 4,
      surahNumber: 2,
      surahName: "البقرة",
      surahEnglishName: "Al-Baqarah",
      text: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْءَاخِرَةِ هُمْ يُوقِنُونَ",
      translation: "And who believe in what has been revealed to you, [O Muhammad], and what was revealed before you, and of the Hereafter they are certain [in faith].",
      juz: 1,
      page: 2
    },
    {
      number: 12,
      numberInSurah: 5,
      surahNumber: 2,
      surahName: "البقرة",
      surahEnglishName: "Al-Baqarah",
      text: "أُو۟لَٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
      translation: "Those are upon [right] guidance from their Lord, and it is those who are the successful.",
      juz: 1,
      page: 2
    }
  ],
  604: [
    {
      number: 6222,
      numberInSurah: 1,
      surahNumber: 112,
      surahName: "الإخلاص",
      surahEnglishName: "Al-Ikhlas",
      text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      translation: "Say, He is Allah, [who is] One,",
      juz: 30,
      page: 604
    },
    {
      number: 6223,
      numberInSurah: 2,
      surahNumber: 112,
      surahName: "الإخلاص",
      surahEnglishName: "Al-Ikhlas",
      text: "ٱللَّهُ ٱلصَّمَدُ",
      translation: "Allah, the Eternal Refuge.",
      juz: 30,
      page: 604
    },
    {
      number: 6224,
      numberInSurah: 3,
      surahNumber: 112,
      surahName: "الإخلاص",
      surahEnglishName: "Al-Ikhlas",
      text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      translation: "He neither begets nor is born,",
      juz: 30,
      page: 604
    },
    {
      number: 6225,
      numberInSurah: 4,
      surahNumber: 112,
      surahName: "الإخلاص",
      surahEnglishName: "Al-Ikhlas",
      text: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
      translation: "Nor is there to Him any equivalent.",
      juz: 30,
      page: 604
    },
    {
      number: 6226,
      numberInSurah: 1,
      surahNumber: 113,
      surahName: "الفلق",
      surahEnglishName: "Al-Falaq",
      text: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
      translation: "Say, I seek refuge in the Lord of daybreak",
      juz: 30,
      page: 604
    },
    {
      number: 6227,
      numberInSurah: 2,
      surahNumber: 113,
      surahName: "الفلق",
      surahEnglishName: "Al-Falaq",
      text: "مِن شَرِّ مَا خَلَقَ",
      translation: "From the evil of that which He created",
      juz: 30,
      page: 604
    },
    {
      number: 6228,
      numberInSurah: 3,
      surahNumber: 113,
      surahName: "الفلق",
      surahEnglishName: "Al-Falaq",
      text: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      translation: "And from the evil of darkness when it settles",
      juz: 30,
      page: 604
    },
    {
      number: 6229,
      numberInSurah: 4,
      surahNumber: 113,
      surahName: "الفلق",
      surahEnglishName: "Al-Falaq",
      text: "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
      translation: "And from the evil of the blowers in knots",
      juz: 30,
      page: 604
    },
    {
      number: 6230,
      numberInSurah: 5,
      surahNumber: 113,
      surahName: "الفلق",
      surahEnglishName: "Al-Falaq",
      text: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      translation: "And from the evil of an envier when he envies.",
      juz: 30,
      page: 604
    },
    {
      number: 6231,
      numberInSurah: 1,
      surahNumber: 114,
      surahName: "الناس",
      surahEnglishName: "An-Nas",
      text: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
      translation: "Say, I seek refuge in the Lord of mankind,",
      juz: 30,
      page: 604
    },
    {
      number: 6232,
      numberInSurah: 2,
      surahNumber: 114,
      surahName: "الناس",
      surahEnglishName: "An-Nas",
      text: "مَلِكِ ٱلنَّاسِ",
      translation: "The Sovereign of mankind,",
      juz: 30,
      page: 604
    },
    {
      number: 6233,
      numberInSurah: 3,
      surahNumber: 114,
      surahName: "الناس",
      surahEnglishName: "An-Nas",
      text: "إِلَٰهِ ٱلنَّاسِ",
      translation: "The God of mankind,",
      juz: 30,
      page: 604
    },
    {
      number: 6234,
      numberInSurah: 4,
      surahNumber: 114,
      surahName: "الناس",
      surahEnglishName: "An-Nas",
      text: "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
      translation: "From the evil of the retreating whisperer -",
      juz: 30,
      page: 604
    },
    {
      number: 6235,
      numberInSurah: 5,
      surahNumber: 114,
      surahName: "الناس",
      surahEnglishName: "An-Nas",
      text: "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
      translation: "Who whispers [evil] into the breasts of mankind -",
      juz: 30,
      page: 604
    },
    {
      number: 6236,
      numberInSurah: 6,
      surahNumber: 114,
      surahName: "الناس",
      surahEnglishName: "An-Nas",
      text: "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
      translation: "From among the jinn and mankind.",
      juz: 30,
      page: 604
    }
  ]
};
