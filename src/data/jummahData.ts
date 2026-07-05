export interface JummahHadith {
  arabic?: string;
  text: string;
  source: string;
  benefit: string;
}

export const JUMMAH_HADITHS: JummahHadith[] = [
  {
    arabic: "خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ",
    text: "The best day on which the sun has risen is Friday; on it Adam was created, on it he was made to enter Paradise, and on it he was expelled from it.",
    source: "Sahih Muslim",
    benefit: "Master of all days"
  },
  {
    arabic: "مَنِ اغْتَسَلَ يَوْمَ الْجُمُعَةِ... ثُمَّ لَمْ يُفَرِّقْ بَيْنَ اثْنَيْنِ... غُفِرَ لَهُ مَا بَيْنَهُ وَبَيْنَ الْجُمُعَةِ الأُخْرَى",
    text: "Whoever takes a bath on Friday... then remains silent while the Imam is delivering the Khutba, his sins between that Friday and the previous one will be forgiven.",
    source: "Sahih Bukhari",
    benefit: "Spiritual Cleansing"
  },
  {
    arabic: "فِيهِ سَاعَةٌ لاَ يُوَافِقُهَا عَبْدٌ مُسْلِمٌ وَهُوَ يُصَلِّي يَسْأَلُ اللَّهَ شَيْئًا إِلاَّ أَعْطَاهُ إِيَّاهُ",
    text: "There is an hour on Friday and if a Muslim gets it while offering Salat and asks something from Allah, then Allah will definitely meet his demand.",
    source: "Sahih Bukhari",
    benefit: "Accepted Dua"
  },
  {
    arabic: "أَكْثِرُوا الصَّلاَةَ عَلَيَّ يَوْمَ الْجُمُعَةِ وَلَيْلَةَ الْجُمُعَةِ",
    text: "Increase your supplications for blessings upon me on Friday and the night of Friday, for your blessings are presented to me.",
    source: "Al-Tabarani",
    benefit: "Blessings on Prophet (PBUH)"
  },
  {
    arabic: "مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ",
    text: "Whoever reads Surah Al-Kahf on Friday, he will be illuminated with light between the two Fridays.",
    source: "Al-Hakim",
    benefit: "Divine Light"
  }
];
