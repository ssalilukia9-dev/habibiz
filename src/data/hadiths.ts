export interface HadithEntry {
  id: number;
  narrator: string;
  arabic: string;
  english: string;
  collection: string;
  topic: string;
}

export const HADITH_DATABASE: HadithEntry[] = [
  {
    id: 1,
    narrator: "Umar bin Al-Khattab",
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english: "Actions are but by intentions and every man shall have only that which he intended.",
    collection: "Sahih Bukhari",
    topic: "Sincerity"
  },
  {
    id: 2,
    narrator: "Abu Hurairah",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    english: "Whosoever believes in Allah and the Last Day, let him say good or remain silent.",
    collection: "Sahih Bukhari",
    topic: "Ethics"
  },
  {
    id: 3,
    narrator: "Aisha (RA)",
    arabic: "الدِّينُ النَّصِيحَةُ",
    english: "The religion is sincerity/advice.",
    collection: "Sahih Muslim",
    topic: "Faith"
  },
  {
    id: 4,
    narrator: "Abu Hurairah",
    arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ",
    english: "The strong believer is better and more beloved to Allah than the weak believer.",
    collection: "Sahih Muslim",
    topic: "Strength"
  },
  {
    id: 5,
    narrator: "Anas bin Malik",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحبُّ لِنَفْسِهِ",
    english: "None of you will have faith until he loves for his brother what he loves for himself.",
    collection: "Sahih Bukhari",
    topic: "Brotherhood"
  },
  {
    id: 6,
    narrator: "Abu Hurairah",
    arabic: "تَهَادَوْا تَحَابُّوا",
    english: "Give gifts and you will love one another.",
    collection: "Al-Adab Al-Mufrad",
    topic: "Love"
  },
  {
    id: 7,
    narrator: "Abdullah bin Amr",
    arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ",
    english: "The best of you are those who are best to their families.",
    collection: "Tirmidhi",
    topic: "Family"
  },
  {
    id: 8,
    narrator: "Abu Hurairah",
    arabic: "الصَّلَاةُ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ",
    english: "Prayer prohibits immorality and wrongdoing.",
    collection: "Quran (Hadeeth Qudsi context)",
    topic: "Prayer"
  },
  {
    id: 9,
    narrator: "Ibn Umar",
    arabic: "الظُّلْمُ ظُلُمَاتٌ يَوْمَ الْقِيَامَةِ",
    english: "Injustice will be darkness on the Day of Resurrection.",
    collection: "Sahih Bukhari",
    topic: "Justice"
  },
  {
    id: 10,
    narrator: "Abu Hurairah",
    arabic: "كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ",
    english: "Every joint of a person must perform a charity every day.",
    collection: "Sahih Bukhari",
    topic: "Charity"
  },
  {
    id: 11,
    narrator: "Abu Hurairah",
    arabic: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ حَبِيبَتَانِ إِلَى الرَّحْمَنِ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ",
    english: "Two words are light on the tongue, heavy in the balance, and beloved to the Most Merciful: Glory be to Allah and His is the praise, Glory be to Allah the Great.",
    collection: "Sahih Bukhari",
    topic: "Remembrance"
  },
  {
    id: 12,
    narrator: "Aisha (RA)",
    arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    english: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    collection: "Sahih Bukhari",
    topic: "Consistency"
  },
  {
    id: 13,
    narrator: "Mu'adh bin Jabal",
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا",
    english: "Fear Allah wherever you are, and follow up a bad deed with a good deed, it will wipe it out.",
    collection: "Tirmidhi",
    topic: "Taqwa"
  },
  {
    id: 15,
    narrator: "Abu Hurairah",
    arabic: "إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    english: "Allah does not look at your appearances or your wealth, but He looks at your hearts and your actions.",
    collection: "Sahih Muslim",
    topic: "Sincerity"
  },
  {
    id: 16,
    narrator: "Ibn Abbas",
    arabic: "احْفَظْ اللَّهَ يَحْفَظْكَ",
    english: "Remember Allah and He will protect you.",
    collection: "Tirmidhi",
    topic: "Faith"
  },
  {
    id: 17,
    narrator: "Abu Hurairah",
    arabic: "الكلمة الطيبة صدقة",
    english: "A good word is charity.",
    collection: "Sahih Bukhari",
    topic: "Ethics"
  },
  {
    id: 18,
    narrator: "Anas bin Malik",
    arabic: "يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا",
    english: "Make things easy and do not make them difficult, and give good tidings and do not make people turn away.",
    collection: "Sahih Bukhari",
    topic: "Moderation"
  },
  {
    id: 19,
    narrator: "Abu Hurairah",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    english: "Charity does not decrease wealth.",
    collection: "Sahih Muslim",
    topic: "Charity"
  },
  {
    id: 21,
    narrator: "Abu Hurairah",
    arabic: "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ",
    english: "When a man dies, his deeds come to an end except for three: ongoing charity, knowledge by which people benefit, or a righteous child who prays for him.",
    collection: "Sahih Muslim",
    topic: "Legacy"
  },
  {
    id: 22,
    narrator: "Abu Hurairah",
    arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
    english: "Whoever relieves a believer of some world distress, Allah will relieve him of some of the distress of the Day of Resurrection.",
    collection: "Sahih Muslim",
    topic: "Compassion"
  },
  {
    id: 23,
    narrator: "Abdullah bin Amr",
    arabic: "خَيْرُكُمْ خَيْرُكُمْ لأَهْلِهِ",
    english: "The best of you are those who are best to their families.",
    collection: "Tirmidhi",
    topic: "Family"
  },
  {
    id: 24,
    narrator: "Abu Hurairah",
    arabic: "انْظُرُوا إِلَى مَنْ هُوَ أَسْفَلَ مِنْكُمْ وَلاَ تَنْظُرُوا إِلَى مَنْ هُوَ فَوْقَكُمْ",
    english: "Look at those who are beneath you and do not look at those who are above you, for it is more suitable that you should not underestimate the blessings of Allah.",
    collection: "Sahih Bukhari",
    topic: "Gratitude"
  }
];

export const getDailyHadith = () => {
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return HADITH_DATABASE[dayOfYear % HADITH_DATABASE.length];
};
