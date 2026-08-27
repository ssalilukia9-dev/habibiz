import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, 
  Sun, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  BookOpen, 
  Heart, 
  Flame, 
  Award, 
  Star, 
  LogOut, 
  Bell, 
  BellRing, 
  RotateCcw, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Copy, 
  Share2, 
  Shield, 
  Calculator, 
  Droplet, 
  Calendar,
  Layers,
  Utensils,
  Zap
} from 'lucide-react';
import { PrayerTimeData } from '../services/prayerService.ts';
import { calculateFastingProgress, calculateTahajjudTimings } from '../services/islamicScheduleService.ts';

interface RamadanHubProps {
  currentTime: Date;
  prayerData: PrayerTimeData | null;
  addHasanat?: (amount: number) => void;
  onExitRamadanMode?: () => void;
}

interface DailyLog {
  suhoor: boolean;
  fasting: boolean;
  fivesalah: boolean;
  taraweeh: boolean;
  quran: boolean;
  sadaqah: boolean;
  tahajjud: boolean;
  dhikr: boolean;
}

interface RamadanDua {
  id: string;
  category: 'suhoor' | 'iftar' | 'ashra' | 'laylatul_qadr' | 'taraweeh' | 'general';
  categoryLabel: string;
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
  source: string;
  ashraStage?: number;
}

// 30 Juz Metadata for Khatam Planner
const RAMADAN_30_JUZ = [
  { juz: 1, name: "Alif-Lam-Meem", surahs: "Al-Fatihah (1) - Al-Baqarah (141)", pages: 20 },
  { juz: 2, name: "Sayaqool", surahs: "Al-Baqarah (142 - 252)", pages: 20 },
  { juz: 3, name: "Tilka'r-Rusul", surahs: "Al-Baqarah (253) - Aal-Imran (92)", pages: 20 },
  { juz: 4, name: "Lan Tanaaloo", surahs: "Aal-Imran (93) - An-Nisa (23)", pages: 20 },
  { juz: 5, name: "Wal-Muhsanat", surahs: "An-Nisa (24 - 147)", pages: 20 },
  { juz: 6, name: "La Yuhibbullah", surahs: "An-Nisa (148) - Al-Ma'idah (81)", pages: 20 },
  { juz: 7, name: "Wa Iza Sami'oo", surahs: "Al-Ma'idah (82) - Al-An'am (110)", pages: 20 },
  { juz: 8, name: "Wa Law Annana", surahs: "Al-An'am (111) - Al-A'raf (87)", pages: 20 },
  { juz: 9, name: "Qal Al-Mala'u", surahs: "Al-A'raf (88) - Al-Anfal (40)", pages: 20 },
  { juz: 10, name: "Wa'lamoo", surahs: "Al-Anfal (41) - At-Tawbah (92)", pages: 20 },
  { juz: 11, name: "Ya'taziroona", surahs: "At-Tawbah (93) - Hud (5)", pages: 20 },
  { juz: 12, name: "Wa Ma Min Daabbah", surahs: "Hud (6) - Yusuf (52)", pages: 20 },
  { juz: 13, name: "Wa Ma Ubarri'u", surahs: "Yusuf (53) - Ibrahim (52)", pages: 20 },
  { juz: 14, name: "Rubama", surahs: "Al-Hijr (1) - An-Nahl (128)", pages: 20 },
  { juz: 15, name: "Subhana'lladhi", surahs: "Al-Isra (1) - Al-Kahf (74)", pages: 20 },
  { juz: 16, name: "Qal Alam", surahs: "Al-Kahf (75) - Ta-Ha (135)", pages: 20 },
  { juz: 17, name: "Iqtaraba", surahs: "Al-Anbiya (1) - Al-Hajj (78)", pages: 20 },
  { juz: 18, name: "Qad Aflaha", surahs: "Al-Mu'minun (1) - Al-Furqan (20)", pages: 20 },
  { juz: 19, name: "Wa Qalalladhina", surahs: "Al-Furqan (21) - An-Naml (55)", pages: 20 },
  { juz: 20, name: "Amman Khalaqa", surahs: "An-Naml (56) - Al-Ankabut (45)", pages: 20 },
  { juz: 21, name: "Utlu Ma Oohiya", surahs: "Al-Ankabut (46) - Al-Ahzab (30)", pages: 20 },
  { juz: 22, name: "Wa Manyaqnut", surahs: "Al-Ahzab (31) - Ya-Sin (27)", pages: 20 },
  { juz: 23, name: "Wa Maliya", surahs: "Ya-Sin (28) - Az-Zumar (31)", pages: 20 },
  { juz: 24, name: "Faman Azlamu", surahs: "Az-Zumar (32) - Fussilat (46)", pages: 20 },
  { juz: 25, name: "Ilayhi Yuraddu", surahs: "Fussilat (47) - Al-Jathiyah (37)", pages: 20 },
  { juz: 26, name: "Ha-Meem", surahs: "Al-Ahqaf (1) - Az-Zariyat (30)", pages: 20 },
  { juz: 27, name: "Qala Fama Khatbukum", surahs: "Az-Zariyat (31) - Al-Hadid (29)", pages: 20 },
  { juz: 28, name: "Qad Sami'allah", surahs: "Al-Mujadila (1) - At-Tahrim (12)", pages: 20 },
  { juz: 29, name: "Tabaraka'lladhi", surahs: "Al-Mulk (1) - Al-Mursalat (50)", pages: 20 },
  { juz: 30, name: "Amma Yatasa'aloon", surahs: "An-Naba (1) - An-Nas (6)", pages: 23 }
];

// 30 Daily Ramadan Reflections & Quranic Ayahs
const RAMADAN_DAILY_REFLECTIONS = [
  { day: 1, title: "Welcoming the Month of Mercy", ayah: "شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ", translation: "The month of Ramadan in which was revealed the Quran, a guidance for the people (2:185).", wisdom: "Renew your sincere intention. Open your heart to receiving divine guidance and spiritual cleansing." },
  { day: 2, title: "Purification Through Fasting", ayah: "يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ", translation: "O you who have believed, decreed upon you is fasting so that you may attain Taqwa (2:183).", wisdom: "Fasting is a shield against physical desires and a school for disciplining the lower soul." },
  { day: 3, title: "Power of Sincere Duas", ayah: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ", translation: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the caller when he calls upon Me (2:186).", wisdom: "Never underestimate a whisper in Sujud. Allah is nearer to you than your jugular vein." },
  { day: 4, title: "Gratitude for the Blessing of Food", ayah: "وَكُلُوا وَاشْرَبُوا وَلَا تُسْرِفُوا ۚ إِنَّهُ لَا يُحِبُّ الْمُسْرِفِينَ", translation: "And eat and drink, but be not excessive. Indeed, He likes not those who commit excess (7:31).", wisdom: "True gratitude at Iftar is eating with mindfulness and extending aid to those without food." },
  { day: 5, title: "Guarding the Tongue", ayah: "وَقُولُوا لِلنَّاسِ حُسْنًا", translation: "And speak to people good words (2:83).", wisdom: "Fasting is not only from food and drink, but from backbiting, anger, and harsh words." },
  { day: 6, title: "Befriending the Quran", ayah: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ", translation: "Indeed, this Quran guides to that which is most suitable (17:9).", wisdom: "Recite with reflection (Tadabbur). Let the sacred words heal your worries." },
  { day: 7, title: "Patience in Adversity", ayah: "إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ", translation: "Indeed, the patient will be given their reward without account (39:10).", wisdom: "Every moment of thirst and patience earns immense unmeasured reward from Allah." },
  { day: 8, title: "Feeding the Hungry (Sadaqah)", ayah: "وَيُطْعِمُونَ الطَّعَامَ عَلَىٰ حُبِّهِ مِسْكِينًا وَيَتِيمًا وَأَسِيرًا", translation: "And they give food in spite of love for it to the needy, the orphan, and the captive (76:8).", wisdom: "Share your meals, send groceries to neighbors, and provide Iftar to the vulnerable." },
  { day: 9, title: "Seeking Absolute Forgiveness", ayah: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", translation: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah (39:53).", wisdom: "No sin is too vast for the ocean of Allah's divine forgiveness." },
  { day: 10, title: "Concluding the Ashra of Mercy", ayah: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", translation: "And My mercy encompasses all things (7:156).", wisdom: "Praise Allah for completing the first ten days steeped in divine unconditional Rahmah." },
  { day: 11, title: "Entering the Ashra of Forgiveness", ayah: "وَاسْتَغْفِرُوا اللَّهَ ۖ إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ", translation: "And seek forgiveness of Allah. Indeed, Allah is Forgiving and Merciful (73:20).", wisdom: "Turn to Allah with tears of sincere repentance. He delights in the servant who returns." },
  { day: 12, title: "The Sweetness of Tahajjud", ayah: "وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ", translation: "And from part of the night, pray with it as additional worship for you (17:79).", wisdom: "The prayer prayed while the world is asleep carries the deepest spiritual illumination." },
  { day: 13, title: "Kinship & Family Ties", ayah: "وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ", translation: "And fear Allah through whom you demand your mutual rights, and the wombs (4:1).", wisdom: "Call estranged relatives, forgive old grievances, and bring tranquility into your home." },
  { day: 14, title: "Tawakkul (Reliance on Allah)", ayah: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "And whoever relies upon Allah - then He is sufficient for him (65:3).", wisdom: "Surrender your anxieties, plans, and future to the Caretaker of all worlds." },
  { day: 15, title: "Mid-Ramadan Checkpoint", ayah: "فَاسْتَبِقُوا الْخَيْرَاتِ", translation: "So hasten towards all that is good (2:148).", wisdom: "Halfway through the blessed month! Re-energize your worship and raise your spiritual pace." },
  { day: 16, title: "The Power of SubhanAllah", ayah: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَكُن مِّنَ السَّاجِدِينَ", translation: "So glorify the praises of your Lord and be of those who prostrate (15:98).", wisdom: "Keep your tongue moist with the remembrance of Allah throughout every mundane task." },
  { day: 17, title: "Day of Badr & Moral Courage", ayah: "وَمَا النَّصْرُ إِلَّا مِنْ عِندِ اللَّهِ الْعَزِيزِ الْحَكِيمِ", translation: "And victory is not except from Allah, the Exalted in Might, the Wise (3:126).", wisdom: "True victory is overcoming internal demons, arrogance, and spiritual laziness." },
  { day: 18, title: "Humility and Kindness", ayah: "وَعِبَادُ الرَّحْمَٰنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا", translation: "And the servants of the Most Merciful are those who walk upon the earth easily (25:63).", wisdom: "Let your fasting make you softer, gentler, and more forgiving to everyone you meet." },
  { day: 19, title: "Sincerity in Hidden Deeds", ayah: "إِن تُبْدُوا الصَّدَقَاتِ فَنِعِمَّا هِيَ ۖ وَإِن تُخْفُوهَا وَتُؤْتُوهَا الْفُقَرَاءَ فَهُوَ خَيْرٌ لَّكُمْ", translation: "If you disclose your charitable expenditures, they are good; but if you conceal them, it is better for you (2:271).", wisdom: "Cultivate secret acts of worship known only to you and your Creator." },
  { day: 20, title: "Preparing for the Final Ten Nights", ayah: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ", translation: "And hasten to forgiveness from your Lord and a garden as wide as the heavens and earth (3:133).", wisdom: "Tighten your belt. The golden crown of Ramadan is about to commence." },
  { day: 21, title: "First Odd Night (21st)", ayah: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", translation: "Indeed, We sent the Quran down during the Night of Decree (97:1).", wisdom: "Search for Laylatul Qadr tonight with sincere devotion, long prostrations, and tears." },
  { day: 22, title: "Repentance from the Fire", ayah: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ", translation: "Our Lord, avert from us the punishment of Hell (25:65).", wisdom: "Beg Allah for emancipation and freedom from the Hellfire for you and your family." },
  { day: 23, title: "Second Odd Night (23rd)", ayah: "وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ ۝ لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ", translation: "And what can make you know what is the Night of Decree? The Night of Decree is better than a thousand months (97:2-3).", wisdom: "Worship on this night equals more than 83 years of non-stop accepted worship." },
  { day: 24, title: "I'tikaf (Spiritual Retreat)", ayah: "وَأَنتُمْ عَاكِفُونَ فِي الْمَسَاجِدِ", translation: "While you are in I'tikaf (retreat) in the mosques (2:187).", wisdom: "Disconnect from social media notifications and connect your heart to the Divine Throne." },
  { day: 25, title: "Third Odd Night (25th)", ayah: "تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ", translation: "The angels and the Spirit descend therein by permission of their Lord for every matter (97:4).", wisdom: "The earth is packed with angels bringing peace, mercy, and answering sincere prayers." },
  { day: 26, title: "Cleansing the Heart of Rancor", ayah: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا", translation: "Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts any resentment (59:10).", wisdom: "Forgive those who wronged you so that Allah may forgive your shortcomings." },
  { day: 27, title: "Fourth Odd Night (27th)", ayah: "سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ", translation: "Peace it is until the emergence of dawn (97:5).", wisdom: "Cry out: 'Allahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'anni' through every breath." },
  { day: 28, title: "Preparing Zakat al-Fitr", ayah: "قَدْ أَفْلَحَ مَن تَزَكَّىٰ ۝ وَذَكَرَ اسْمَ رَبِّهِ فَصَلَّىٰ", translation: "He has certainly succeeded who purifies himself and mentions the name of his Lord and prays (87:14-15).", wisdom: "Ensure your Zakat al-Fitr is paid to the poor before the Eid prayer to seal your fasts." },
  { day: 29, title: "Fifth Odd Night (29th)", ayah: "وَلِتُكَبِّرُوا اللَّهَ عَلَىٰ مَا هَدَاكُمْ وَلَعَلَّكُمْ تَشْكُرُونَ", translation: "And to glorify Allah for that to which He has guided you, and that perhaps you will be grateful (2:185).", wisdom: "Never stop striving until the very last sunset of the blessed holy month." },
  { day: 30, title: "Gratitude & Welcome to Eid", ayah: "قُلْ بِفَضْلِ اللَّهِ وَبِرَحْمَتِهِ فَبِذَٰلِكَ فَلْيَفْرَحُوا", translation: "Say: In the bounty of Allah and in His mercy - in that let them rejoice (10:58).", wisdom: "Taqabbal Allahu Minna Wa Minkum! May Allah accept every fast, prayer, and tear shed." }
];

// Rich Ramadan Duas Collection
const ALL_RAMADAN_DUAS: RamadanDua[] = [
  {
    id: 'suhoor_intention',
    category: 'suhoor',
    categoryLabel: 'Suhoor & Fasting Intention',
    title: 'Dua for Intending the Fast (Niyyah)',
    arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    transliteration: "Wa bi-sawmi ghadinn nawaytu min shahri Ramadān.",
    english: "I intend to keep the fast for tomorrow in the holy month of Ramadan.",
    source: "Prophetic Sunnah / Fiqh Tradition"
  },
  {
    id: 'iftar_sunnah_1',
    category: 'iftar',
    categoryLabel: 'Iftar Breaking Fast',
    title: 'Primary Iftar Dua (Sunan Abi Dawud)',
    arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
    transliteration: "Dhahaba adh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in shā' Allāh.",
    english: "The thirst has vanished, the veins are moistened, and the reward is firmly established, if Allah wills.",
    source: "Sunan Abi Dawud (2357)"
  },
  {
    id: 'iftar_sunnah_2',
    category: 'iftar',
    categoryLabel: 'Iftar Breaking Fast',
    title: 'Iftar Gratitude Dua',
    arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ، وَبِكَ آمَنْتُ، وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    transliteration: "Allāhumma innī laka sumtu, wa bika āmantu, wa 'alā rizqika aftartu.",
    english: "O Allah, I fasted for You, I believe in You, and with Your provision I break my fast.",
    source: "Sunan Abi Dawud (2358)"
  },
  {
    id: 'ashra_1_mercy',
    category: 'ashra',
    categoryLabel: '1st Ashra of Mercy (Days 1-10)',
    title: '1st Ashra (Mercy / Rahmah) Supplication',
    arabic: 'رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ',
    transliteration: "Rabbigh-fir war-ham wa Anta Khayrur-Raahimeen.",
    english: "My Lord, forgive and have mercy, for You are the Best of those who show mercy.",
    source: "Surah Al-Mu'minun (23:118)",
    ashraStage: 1
  },
  {
    id: 'ashra_2_forgiveness',
    category: 'ashra',
    categoryLabel: '2nd Ashra of Forgiveness (Days 11-20)',
    title: '2nd Ashra (Forgiveness / Maghfirah) Supplication',
    arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ',
    transliteration: "Astaghfirullāha Rabbī min kulli dhambinw-wa atoobu ilayh.",
    english: "I ask forgiveness of Allah, my Lord, from every sin and I turn to Him in sincere repentance.",
    source: "Classical Islamic Tradition",
    ashraStage: 2
  },
  {
    id: 'ashra_3_protection',
    category: 'ashra',
    categoryLabel: '3rd Ashra of Protection (Days 21-30)',
    title: '3rd Ashra (Protection from Fire / Nijat) Supplication',
    arabic: 'اللَّهُمَّ أَجِرْنَا مِنَ النَّارِ، يَا مُجِيرُ يَا مُجِيرُ يَا مُجِيرُ',
    transliteration: "Allāhumma ajirnā minan-nār, yā Mujeeru yā Mujeeru yā Mujeer.",
    english: "O Allah, protect us and save us from the Hellfire, O Protector, O Deliverer.",
    source: "Sunan an-Nasa'i / Prophetic Sunnah",
    ashraStage: 3
  },
  {
    id: 'laylatul_qadr_dua',
    category: 'laylatul_qadr',
    categoryLabel: 'Laylatul Qadr (Night of Power)',
    title: 'Chief Supplication of Laylatul Qadr',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    transliteration: "Allāhumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'annī.",
    english: "O Allah, You are Most Forgiving and Pardoning, You love to forgive, so forgive me.",
    source: "Jami` at-Tirmidhi (3513) - Narrated by Aisha (RA)"
  },
  {
    id: 'taraweeh_qunoot',
    category: 'taraweeh',
    categoryLabel: 'Taraweeh & Night Prayer',
    title: 'Qunoot Witr Supplication',
    arabic: 'اللَّهُمَّ اهْدِنَا فِيمَنْ هَدَيْتَ، وَعَافِنَا فِيمَنْ عَافَيْتَ، وَتَوَلَّنَا فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لَنَا فِيمَا أَعْطَيْتَ',
    transliteration: "Allāhummahdinā feeman hadayt, wa 'āfinā feeman 'āfayt, wa tawallanā feeman tawallayt, wa bārik lanā feemā a'tayt.",
    english: "O Allah, guide us among those You have guided, grant us health among those You have healed, take us into Your care among those You have cared for, and bless us in what You have granted.",
    source: "Sunan Abi Dawud (1425) / Sunan an-Nasa'i"
  },
  {
    id: 'fasting_shield_dua',
    category: 'general',
    categoryLabel: 'Protection & Self-Control',
    title: 'Dua When Provoked or Insulted While Fasting',
    arabic: 'إِنِّي صَائِمٌ، إِنِّي صَائِمٌ',
    transliteration: "Innī ṣā'imun, innī ṣā'im.",
    english: "I am indeed fasting, I am indeed fasting (A declaration of peace and self-control).",
    source: "Sahih Bukhari (1894)"
  },
  {
    id: 'guest_iftar_dua',
    category: 'iftar',
    categoryLabel: 'Iftar Breaking Fast',
    title: 'Dua When Breaking Fast at Someone’s Home',
    arabic: 'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ',
    transliteration: "Afṭara 'indakumuṣ-ṣā'imūn, wa akala ṭa'āmakumul-abrār, wa ṣallat 'alaykumul-malā'ikah.",
    english: "May fasting people break their fast with you, may the righteous eat your food, and may the angels send blessings upon you.",
    source: "Sunan Abi Dawud (3854)"
  },
  {
    id: 'hilal_sighting_dua',
    category: 'general',
    categoryLabel: 'Ramadan Beginning / Crescent',
    title: 'Dua for Sighting the Ramadan Crescent Moon (Hilal)',
    arabic: 'اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ',
    transliteration: "Allāhu Akbar, Allāhumma ahillahu 'alaynā bil-amni wal-īmān, was-salāmati wal-Islām, Rabbī wa Rabbukallāh.",
    english: "Allah is the Greatest! O Allah, let this crescent bring us security and faith, safety and Islam. My Lord and your Lord is Allah.",
    source: "Jami` at-Tirmidhi (3451)"
  }
];

export default function RamadanHub({ currentTime, prayerData, addHasanat, onExitRamadanMode }: RamadanHubProps) {
  const navigate = useNavigate();

  // Current Ramadan Day (1 to 30) - users can navigate or jump
  const [ramadanDay, setRamadanDay] = useState<number>(() => {
    return Number(localStorage.getItem('ramadan-current-day') || '15');
  });

  const [activeTab, setActiveTab] = useState<
    'tracker' | 'quran_khatam' | 'laylatul_qadr' | 'multiplier_calc' | 'sunnah_foods' | 'iftar_sunnah' | 'hydration' | 'duas' | 'taraweeh' | 'zakat' | 'reminders'
  >('tracker');

  // Laylatul Qadr 1,000-Month Multiplier Calculator State
  const [calcDeeds, setCalcDeeds] = useState({
    rakats: 2,
    sadaqah: 10,
    quranPages: 4,
    dhikrCount: 100,
    duasCount: 5
  });

  const [selectedDuaCat, setSelectedDuaCat] = useState<string>('all');
  const [copiedDuaId, setCopiedDuaId] = useState<string | null>(null);

  // Khatam Al-Quran State
  const [khatamSpeed, setKhatamSpeed] = useState<1 | 2 | 3>(() => {
    return (Number(localStorage.getItem('ramadan_khatam_speed') || '1') as 1 | 2 | 3);
  });
  const [completedJuzMap, setCompletedJuzMap] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('ramadan_completed_juz');
    return saved ? JSON.parse(saved) : {};
  });

  // Laylatul Qadr checklist state
  const [laylatulChecks, setLaylatulChecks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`ramadan_laylatul_checks_day_${ramadanDay}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Hydration 8-Glass Tracker State
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(`ramadan_hydration_day_${ramadanDay}`);
    return saved ? Number(saved) : 0;
  });

  // Sunnah Dates Count eaten at Iftar
  const [datesCount, setDatesCount] = useState<number>(() => {
    const saved = localStorage.getItem(`ramadan_dates_day_${ramadanDay}`);
    return saved ? Number(saved) : 3;
  });

  // Reminders Config State
  const [enableContinuousReminders, setEnableContinuousReminders] = useState<boolean>(() => {
    return localStorage.getItem('ramadan_continuous_reminders') === 'true';
  });
  const [reminderIntervalMinutes, setReminderIntervalMinutes] = useState<number>(() => {
    return Number(localStorage.getItem('ramadan_reminder_interval') || '30');
  });
  const [chimeSoundEnabled, setChimeSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('ramadan_chime_sound') !== 'false';
  });
  const [lastChimeTime, setLastChimeTime] = useState<number>(0);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Taraweeh Rakat Counter (8 or 20 mode)
  const [taraweehMaxRakats, setTaraweehMaxRakats] = useState<number>(() => {
    return Number(localStorage.getItem('ramadan_taraweeh_target') || '20');
  });
  const [currentTaraweehRakats, setCurrentTaraweehRakats] = useState<number>(() => {
    const saved = localStorage.getItem(`ramadan_taraweeh_rakats_day_${ramadanDay}`);
    return saved ? Number(saved) : 0;
  });
  const [witrPrayed, setWitrPrayed] = useState<boolean>(() => {
    return localStorage.getItem(`ramadan_witr_day_${ramadanDay}`) === 'true';
  });

  // Zakat al-Fitr Calculator
  const [familyMembersCount, setFamilyMembersCount] = useState<number>(() => {
    return Number(localStorage.getItem('ramadan_family_members') || '4');
  });
  const [costPerPerson, setCostPerPerson] = useState<number>(12); // $12 standard value per person
  const [zakatFitrPaid, setZakatFitrPaid] = useState<boolean>(() => {
    return localStorage.getItem('ramadan_zakat_fitr_paid') === 'true';
  });

  const [logs, setLogs] = useState<DailyLog>(() => {
    const saved = localStorage.getItem(`sanctuary_ramadan_log_day_${ramadanDay}`);
    if (saved) return JSON.parse(saved);
    return { suhoor: false, fasting: false, fivesalah: false, taraweeh: false, quran: false, sadaqah: false, tahajjud: false, dhikr: false };
  });

  // Keep day-specific states synced
  useEffect(() => {
    const saved = localStorage.getItem(`sanctuary_ramadan_log_day_${ramadanDay}`);
    setLogs(saved ? JSON.parse(saved) : { suhoor: false, fasting: false, fivesalah: false, taraweeh: false, quran: false, sadaqah: false, tahajjud: false, dhikr: false });

    const savedRakats = localStorage.getItem(`ramadan_taraweeh_rakats_day_${ramadanDay}`);
    setCurrentTaraweehRakats(savedRakats ? Number(savedRakats) : 0);

    const savedWitr = localStorage.getItem(`ramadan_witr_day_${ramadanDay}`);
    setWitrPrayed(savedWitr === 'true');

    const savedHydration = localStorage.getItem(`ramadan_hydration_day_${ramadanDay}`);
    setHydrationGlasses(savedHydration ? Number(savedHydration) : 0);

    const savedDates = localStorage.getItem(`ramadan_dates_day_${ramadanDay}`);
    setDatesCount(savedDates ? Number(savedDates) : 3);

    const savedLaylatul = localStorage.getItem(`ramadan_laylatul_checks_day_${ramadanDay}`);
    setLaylatulChecks(savedLaylatul ? JSON.parse(savedLaylatul) : {});
  }, [ramadanDay]);

  const handleExitRamadan = () => {
    localStorage.setItem('force-ramadan-mode', 'false');
    localStorage.setItem('sanctuary_user_exited_ramadan', 'true');
    window.dispatchEvent(new CustomEvent('ramadan_mode_updated'));
    if (onExitRamadanMode) {
      onExitRamadanMode();
    }
  };

  const changeDay = (dir: 'prev' | 'next') => {
    let nextDay = ramadanDay;
    if (dir === 'prev' && ramadanDay > 1) nextDay = ramadanDay - 1;
    if (dir === 'next' && ramadanDay < 30) nextDay = ramadanDay + 1;
    setRamadanDay(nextDay);
    localStorage.setItem('ramadan-current-day', String(nextDay));
  };

  // Serene local synth chime
  const playLocalChime = (chimeType: 'bell' | 'suhoor' | 'iftar' | 'deed' | 'water' = 'deed') => {
    if (!chimeSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      if (chimeType === 'iftar') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.3);
      } else if (chimeType === 'suhoor') {
        osc.frequency.setValueAtTime(440.00, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.25);
      } else if (chimeType === 'water') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15);
      }
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn("Browser AudioContext offline", err);
    }
  };

  // Live Fasting Progress
  const fastingProgress = useMemo(() => {
    const timesRecord: Record<string, string> = {};
    if (prayerData) {
      const formatTimeStr = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      timesRecord.Fajr = formatTimeStr(prayerData.fajr);
      timesRecord.Maghrib = formatTimeStr(prayerData.maghrib);
    }
    return calculateFastingProgress(timesRecord, currentTime);
  }, [prayerData, currentTime]);

  const tahajjudInfo = useMemo(() => {
    if (!prayerData) return calculateTahajjudTimings();
    const formatTimeStr = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return calculateTahajjudTimings(formatTimeStr(prayerData.maghrib), formatTimeStr(prayerData.fajr));
  }, [prayerData]);

  // Speech recitation
  const handleSpeak = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyDua = (dua: RamadanDua) => {
    const full = `"${dua.arabic}"\n\n"${dua.transliteration}"\n\n"${dua.english}"\n\n— Source: ${dua.source}`;
    navigator.clipboard.writeText(full);
    setCopiedDuaId(dua.id);
    setTimeout(() => setCopiedDuaId(null), 2500);
  };

  const toggleLog = (key: keyof DailyLog) => {
    const newLogs = { ...logs, [key]: !logs[key] };
    setLogs(newLogs);
    localStorage.setItem(`sanctuary_ramadan_log_day_${ramadanDay}`, JSON.stringify(newLogs));

    if (newLogs[key]) {
      playLocalChime('deed');
      if (addHasanat) addHasanat(10);
    }
  };

  // Toggle Juz completion
  const toggleJuzComplete = (juzNum: number) => {
    const nextMap = { ...completedJuzMap, [juzNum]: !completedJuzMap[juzNum] };
    setCompletedJuzMap(nextMap);
    localStorage.setItem('ramadan_completed_juz', JSON.stringify(nextMap));
    playLocalChime('deed');
    if (!completedJuzMap[juzNum] && addHasanat) {
      addHasanat(25);
    }
  };

  const completedJuzCount = Object.values(completedJuzMap).filter(Boolean).length;

  // Toggle Laylatul checklist
  const toggleLaylatulCheck = (key: string) => {
    const next = { ...laylatulChecks, [key]: !laylatulChecks[key] };
    setLaylatulChecks(next);
    localStorage.setItem(`ramadan_laylatul_checks_day_${ramadanDay}`, JSON.stringify(next));
    if (next[key]) {
      playLocalChime('deed');
      if (addHasanat) addHasanat(20);
    }
  };

  // Increment Hydration Glass
  const addHydrationGlass = () => {
    const next = Math.min(8, hydrationGlasses + 1);
    setHydrationGlasses(next);
    localStorage.setItem(`ramadan_hydration_day_${ramadanDay}`, String(next));
    playLocalChime('water');
    if (addHasanat) addHasanat(5);
  };

  const resetHydration = () => {
    setHydrationGlasses(0);
    localStorage.setItem(`ramadan_hydration_day_${ramadanDay}`, '0');
  };

  // Increment Taraweeh Rakat
  const incrementTaraweeh = (step: number = 2) => {
    const next = Math.min(taraweehMaxRakats, Math.max(0, currentTaraweehRakats + step));
    setCurrentTaraweehRakats(next);
    localStorage.setItem(`ramadan_taraweeh_rakats_day_${ramadanDay}`, String(next));
    playLocalChime('deed');
    if (addHasanat && next > currentTaraweehRakats) {
      addHasanat(10);
    }
    if (next >= taraweehMaxRakats && !logs.taraweeh) {
      toggleLog('taraweeh');
    }
  };

  const toggleWitr = () => {
    const next = !witrPrayed;
    setWitrPrayed(next);
    localStorage.setItem(`ramadan_witr_day_${ramadanDay}`, String(next));
    if (next) {
      playLocalChime('deed');
      if (addHasanat) addHasanat(15);
    }
  };

  const toggleZakatPaid = () => {
    const next = !zakatFitrPaid;
    setZakatFitrPaid(next);
    localStorage.setItem('ramadan_zakat_fitr_paid', String(next));
    if (next) {
      playLocalChime('iftar');
      if (addHasanat) addHasanat(50);
    }
  };

  const toggleContinuousReminders = () => {
    const next = !enableContinuousReminders;
    setEnableContinuousReminders(next);
    localStorage.setItem('ramadan_continuous_reminders', String(next));
    if (next) {
      playLocalChime('bell');
      setReminderToast('✨ Continuous Ramadan reminders activated. May your hours be filled with Barakah.');
      setTimeout(() => setReminderToast(null), 4000);
    }
  };

  const currentAshra = ramadanDay <= 10 ? 1 : ramadanDay <= 20 ? 2 : 3;
  const currentAshraLabel = currentAshra === 1 
    ? '1st Ashra of Mercy (Rahmah)' 
    : currentAshra === 2 
    ? '2nd Ashra of Forgiveness (Maghfirah)' 
    : '3rd Ashra of Emancipation from Fire (Nijat)';

  const isTonightOddNight = [20, 22, 24, 26, 28].includes(ramadanDay); // Night preceding 21, 23, 25, 27, 29
  const currentReflection = RAMADAN_DAILY_REFLECTIONS[(ramadanDay - 1) % RAMADAN_DAILY_REFLECTIONS.length];

  const filteredDuas = ALL_RAMADAN_DUAS.filter(d => {
    if (selectedDuaCat === 'all') return true;
    return d.category === selectedDuaCat;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-1 rounded-[3rem] border border-amber-500/30 bg-gradient-to-b from-[#121e17]/95 via-[#0b140f]/95 to-[#060c09]/95 overflow-hidden relative shadow-3xl text-slate-100"
    >
      {/* Background celestial glow decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -mt-32 -mr-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -mb-32 -ml-32" />

      {/* Dynamic Toast for Reminders */}
      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-full bg-amber-500 text-black font-black text-xs shadow-2xl flex items-center gap-3 border border-amber-300"
          >
            <BellRing size={16} className="animate-bounce" />
            <span>{reminderToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 md:p-10 space-y-8 relative z-10">
        
        {/* ROW 1: Header / Navigation & Stage */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-950/40">
              <Moon size={32} className="fill-amber-300/20 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Holy Ramadan Sanctuary</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-slate-300 font-bold hidden sm:inline">({currentAshraLabel})</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                Blessed Ramadan Hub
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Live Sanctuary
                </span>
              </h2>
            </div>
          </div>

          {/* Ramadan Day Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button 
                onClick={() => changeDay('prev')}
                disabled={ramadanDay <= 1}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                title="Previous Ramadan Day"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-4 py-1.5 text-center min-w-[120px]">
                <p className="text-[8px] font-black text-amber-400 uppercase tracking-[0.2em]">Spiritual Stage</p>
                <p className="text-sm font-black text-white">Day {ramadanDay} of 30</p>
              </div>
              <button 
                onClick={() => changeDay('next')}
                disabled={ramadanDay >= 30}
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                title="Next Ramadan Day"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button
              onClick={toggleContinuousReminders}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs transition-all cursor-pointer shadow-lg ${
                enableContinuousReminders 
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300' 
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="Toggle continuous prayer & dhikr reminders"
            >
              <Bell size={15} className={enableContinuousReminders ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
              <span className="hidden sm:inline">{enableContinuousReminders ? 'Reminders ON' : 'Reminders'}</span>
            </button>

            <button
              onClick={handleExitRamadan}
              className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-300 font-bold text-xs transition-all cursor-pointer group"
              title="Exit Ramadan Mode"
            >
              <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform text-red-400" />
              <span className="hidden sm:inline">Exit Mode</span>
            </button>
          </div>
        </div>

        {/* ROW 2: FASTING HERO PROGRESS BAR & LIVE CELESTIAL TIMERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Fasting Countdown & Visual Progress Card */}
          <div className="lg:col-span-8 bg-gradient-to-br from-black/60 to-black/30 border border-amber-500/30 rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            
            {/* Top Row: Fasting Status badge + Golden Iftar indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                    Realtime Fasting Clock
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
                  {fastingProgress.statusBadge}
                </h3>
              </div>

              {fastingProgress.isWithin15MinIftar ? (
                <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 animate-pulse">
                  <Sparkles size={12} /> Golden Dua Window Active (Pray Now!)
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 font-black text-[10px] uppercase tracking-wider">
                  {fastingProgress.isFasting ? 'Fasting (Sawm) Active' : 'Eating Permitted'}
                </div>
              )}
            </div>

            {/* Huge Dynamic Countdown to Iftar / Suhoor */}
            <div className="my-6 relative z-10 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400" /> 
                {fastingProgress.isFasting ? 'Time Remaining Until Iftar (Maghrib)' : 'Time Remaining Until Fajr (Imsak)'}
              </p>
              
              <div className="flex items-center gap-3 md:gap-5 font-mono select-none">
                <div className="bg-black/50 border border-amber-500/20 rounded-2xl px-4 py-3 text-center min-w-[75px] shadow-lg">
                  <div className="text-3xl md:text-5xl font-black text-white">
                    {String(fastingProgress.hoursLeft).padStart(2, '0')}
                  </div>
                  <div className="text-[8px] font-black text-amber-400/80 uppercase tracking-widest mt-0.5">Hours</div>
                </div>
                <span className="text-2xl md:text-4xl text-amber-400 font-bold animate-pulse">:</span>
                <div className="bg-black/50 border border-amber-500/20 rounded-2xl px-4 py-3 text-center min-w-[75px] shadow-lg">
                  <div className="text-3xl md:text-5xl font-black text-white">
                    {String(fastingProgress.minutesLeft).padStart(2, '0')}
                  </div>
                  <div className="text-[8px] font-black text-amber-400/80 uppercase tracking-widest mt-0.5">Minutes</div>
                </div>
                <span className="text-2xl md:text-4xl text-amber-400 font-bold animate-pulse">:</span>
                <div className="bg-black/50 border border-amber-500/20 rounded-2xl px-4 py-3 text-center min-w-[75px] shadow-lg">
                  <div className="text-3xl md:text-5xl font-black text-amber-300">
                    {String(fastingProgress.secondsLeft).padStart(2, '0')}
                  </div>
                  <div className="text-[8px] font-black text-amber-400/80 uppercase tracking-widest mt-0.5">Seconds</div>
                </div>
              </div>
            </div>

            {/* VISUAL FASTING PROGRESS BAR BENEATH THE TEXT */}
            <div className="space-y-2 pt-2 relative z-10">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Sun size={13} className="text-amber-400" />
                  Fajr (Dawn) {fastingProgress.fajrStr}
                </span>
                <span className="text-amber-200 font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30">
                  {Math.round(fastingProgress.progressPercent)}% Fast Completed
                </span>
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Moon size={13} className="text-emerald-400" />
                  Maghrib (Iftar) {fastingProgress.maghribStr}
                </span>
              </div>

              {/* High-fidelity glowing progress bar */}
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-500/30 p-[1.5px] relative shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-300 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(3, fastingProgress.progressPercent)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-[1px] shadow-[0_0_10px_#fbbf24]" />
                </motion.div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                <span>{fastingProgress.elapsedFastingDurationMinutes} mins fasted</span>
                <span className="text-amber-300 font-bold">{fastingProgress.hoursText}</span>
                <span>{fastingProgress.totalFastingDurationMinutes} mins total duration</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Tahajjud Card */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Odd Night of Power Alert if active */}
            {isTonightOddNight && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/50 shadow-xl flex items-center gap-3">
                <Sparkles className="text-amber-300 animate-spin shrink-0" size={24} />
                <div>
                  <h4 className="text-xs font-black text-amber-200 uppercase tracking-wide">Blessed Odd Night Alert</h4>
                  <p className="text-[11px] text-slate-200">Tonight is one of the Odd Nights! Strive for Laylatul Qadr.</p>
                </div>
              </div>
            )}

            {/* Tahajjud / Last Third Widget */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between flex-1">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">
                  Last Third of the Night
                </span>
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Tahajjud Optimum Window</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tahajjudInfo.isLastThirdNow ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                    {tahajjudInfo.isLastThirdNow ? 'Active Now' : 'Upcoming'}
                  </span>
                </h4>
              </div>

              <div className="my-3 py-2 px-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Begins at:</span>
                <span className="text-sm font-mono font-black text-amber-300">{tahajjudInfo.startTimeStr}</span>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                "Our Lord descends to the lowest heaven during the last third of the night, answering every caller." (Bukhari)
              </p>
            </div>

            {/* 30-Day Khatam Quick Snippet */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Quran Khatam Progress</p>
                <p className="text-sm font-black text-white">{completedJuzCount} of 30 Juz Completed</p>
              </div>
              <button
                onClick={() => setActiveTab('quran_khatam')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-400/30 cursor-pointer"
              >
                View Tracker
              </button>
            </div>

          </div>
        </div>

        {/* ROW 3: NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto scrollbar-hide">
          {[
            { id: 'tracker' as const, label: 'Daily Deeds & Fasting', icon: Star },
            { id: 'quran_khatam' as const, label: '30-Day Quran Khatam', icon: BookOpen },
            { id: 'laylatul_qadr' as const, label: 'Laylatul Qadr Seeker', icon: Sparkles },
            { id: 'multiplier_calc' as const, label: '1,000-Month Multiplier', icon: Zap },
            { id: 'sunnah_foods' as const, label: 'Sunnah Superfoods', icon: Heart },
            { id: 'iftar_sunnah' as const, label: 'Sunnah Iftar Ritual', icon: Utensils },
            { id: 'hydration' as const, label: '8-Glass Hydration Wave', icon: Droplet },
            { id: 'taraweeh' as const, label: 'Taraweeh & Qiyam', icon: Flame },
            { id: 'duas' as const, label: 'Ramadan Duas Vault', icon: BookOpen },
            { id: 'zakat' as const, label: 'Zakat al-Fitr Planner', icon: Calculator },
            { id: 'reminders' as const, label: 'Continuous Reminders', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 scale-[1.02]' 
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: DAILY DEEDS & REFLECTION */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {/* Daily Reflection */}
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-black/30 border border-amber-500/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Day {ramadanDay} Reflection</span>
                    <span className="text-[10px] text-slate-300 font-bold">• {currentReflection.title}</span>
                  </div>
                  <p className="arabic-text text-xl md:text-2xl text-amber-200 leading-relaxed text-right md:text-left">
                    "{currentReflection.ayah}"
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    {currentReflection.translation}
                  </p>
                  <p className="text-xs text-amber-300 font-semibold pt-1">
                    💡 Spiritual Pearl: {currentReflection.wisdom}
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak(currentReflection.ayah, 'ar')}
                  className="p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 flex items-center gap-2 font-bold text-xs shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <Volume2 size={16} /> Listen Recitation
                </button>
              </div>
            </div>

            {/* Daily 8 Sunnah Spiritual Deeds */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Star size={16} className="text-amber-400" />
                Day {ramadanDay} Sunnah Deeds & Worship Log
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'suhoor' as const, label: 'Blessed Suhoor Meal', desc: 'Ate pre-dawn meal with barakah' },
                  { key: 'fasting' as const, label: 'Observed Daily Fast (Sawm)', desc: 'Guarded tongue, eyes & heart' },
                  { key: 'fivesalah' as const, label: '5 Daily Prayers on Time', desc: 'In congregation or on earliest time' },
                  { key: 'taraweeh' as const, label: 'Taraweeh / Night Qiyam', desc: 'Stood in night prayer' },
                  { key: 'quran' as const, label: 'Daily Quran Recitation', desc: 'Read at least 1 Juz or target verses' },
                  { key: 'sadaqah' as const, label: 'Ramadan Charity / Sadaqah', desc: 'Gave secret charity or fed someone' },
                  { key: 'tahajjud' as const, label: 'Tahajjud Prayer in Last 3rd', desc: 'Duas made before dawn' },
                  { key: 'dhikr' as const, label: 'Morning & Evening Adhkar', desc: 'Istighfar & Salawat 100x' }
                ].map((item) => {
                  const isChecked = logs[item.key];
                  return (
                    <div 
                      key={item.key}
                      onClick={() => toggleLog(item.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked 
                          ? 'bg-amber-500/15 border-amber-400/40 text-white shadow-lg' 
                          : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked ? 'bg-amber-400 border-amber-300 text-black' : 'border-slate-600 bg-black/40'
                      }`}>
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isChecked ? 'text-amber-200 font-black' : 'text-slate-200'}`}>
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 30-DAY QURAN KHATAM PLANNER */}
        {activeTab === 'quran_khatam' && (
          <div className="space-y-6">
            <div className="p-6 rounded-[2rem] bg-gradient-to-r from-emerald-950/40 to-black/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-400" />
                  <h3 className="text-lg font-black text-white">30-Day Ramadan Quran Khatam Planner</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Plan your recitation to complete the Holy Quran by the end of Ramadan.
                </p>
              </div>

              {/* Khatam Speed Selector */}
              <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2">Target:</span>
                {[
                  { speed: 1 as const, label: '1 Khatam (1 Juz/day)' },
                  { speed: 2 as const, label: '2 Khatams (2 Juz/day)' },
                  { speed: 3 as const, label: '3 Khatams (3 Juz/day)' }
                ].map((s) => (
                  <button
                    key={s.speed}
                    onClick={() => {
                      setKhatamSpeed(s.speed);
                      localStorage.setItem('ramadan_khatam_speed', String(s.speed));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      khatamSpeed === s.speed ? 'bg-emerald-500 text-black font-black shadow-md' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recitation Strategy Tip */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 text-xs text-slate-300">
              <p>
                📖 <strong>Recitation Formula:</strong> For 1 Khatam, read <strong>4 pages</strong> after each of the 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) = 20 pages (1 full Juz) every single day!
              </p>
              <button
                onClick={() => navigate('/resources')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl shrink-0 cursor-pointer text-xs"
              >
                Open Quran Reader
              </button>
            </div>

            {/* 30 Juz Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {RAMADAN_30_JUZ.map((item) => {
                const isCompleted = !!completedJuzMap[item.juz];
                const isTodayTarget = item.juz === ramadanDay;
                return (
                  <div
                    key={item.juz}
                    onClick={() => toggleJuzComplete(item.juz)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative select-none flex flex-col justify-between min-h-[110px] ${
                      isCompleted 
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-white shadow-lg' 
                        : isTodayTarget
                        ? 'bg-amber-500/10 border-amber-400/50 text-white shadow-md'
                        : 'bg-black/40 border-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                          Juz {item.juz}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          isCompleted ? 'bg-emerald-400 text-black font-bold' : 'border border-slate-600'
                        }`}>
                          {isCompleted && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                      <p className="text-xs font-bold text-white mt-1 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.surahs}</p>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-2 border-t border-white/5">
                      <span>{item.pages} pages</span>
                      <span className={isCompleted ? 'text-emerald-300 font-bold' : isTodayTarget ? 'text-amber-300 font-bold' : ''}>
                        {isCompleted ? 'Completed' : isTodayTarget ? "Today's Target" : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LAYLATUL QADR SEEKER & ODD NIGHTS */}
        {activeTab === 'laylatul_qadr' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/20 via-purple-950/40 to-black/50 border border-amber-400/40 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-300" size={20} />
                    <h3 className="text-xl font-black text-white">Laylatul Qadr (Night of Decree) Vigil Seeker</h3>
                  </div>
                  <p className="text-xs text-slate-200">
                    "The Night of Decree is better than a thousand months (83.3 Years of continuous worship)." (97:3)
                  </p>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-200 font-mono text-xs font-bold">
                  Multiplier: 1 Night = 30,000+ Days of Worship
                </div>
              </div>

              {/* Odd Nights Indicator Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {[21, 23, 25, 27, 29].map((oddNight) => {
                  const isCurrent = ramadanDay === oddNight;
                  return (
                    <div 
                      key={oddNight}
                      className={`p-3 rounded-2xl border text-center ${
                        isCurrent 
                          ? 'bg-amber-500 text-black border-amber-300 font-black shadow-lg shadow-amber-500/30' 
                          : 'bg-black/50 border-white/10 text-slate-300'
                      }`}
                    >
                      <p className="text-[9px] uppercase tracking-wider opacity-80">Night of</p>
                      <p className="text-base font-black font-mono">{oddNight}st Ramadan</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Supreme Dua of Aisha (RA) */}
            <div className="p-6 rounded-2xl bg-black/40 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                  The Supreme Supplication of Laylatul Qadr
                </h4>
                <button
                  onClick={() => handleSpeak("اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", 'ar')}
                  className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30"
                >
                  <Volume2 size={14} /> Listen Audio
                </button>
              </div>
              <p className="arabic-text text-2xl text-amber-200 text-right md:text-left leading-relaxed">
                اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
              </p>
              <p className="text-xs text-slate-300 italic font-mono">
                "Allāhumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'annī."
              </p>
              <p className="text-xs text-amber-300 font-medium">
                "O Allah, You are Most Forgiving, and You love to forgive; so forgive me." (Tirmidhi)
              </p>
            </div>

            {/* Night Vigil Checklist */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                Laylatul Qadr Vigil Checklist (Tonight's Goal)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'tahajjud_8', label: '8+ Rakats of Tahajjud Prayer with long Sujud' },
                  { key: 'istighfar_100', label: '100x Astaghfirullah (Seeking Sincere Repentance)' },
                  { key: 'salawat_100', label: '100x Salawat upon the Prophet Muhammad (ﷺ)' },
                  { key: 'laylatul_dua_100', label: '100x "Allahumma innaka Afuwwun..."' },
                  { key: 'surah_qadr', label: 'Recite & Contemplate Surah Al-Qadr (Chapter 97)' },
                  { key: 'secret_sadaqah', label: 'Give Secret Sadaqah (Equal to 83+ years of daily charity)' }
                ].map((c) => {
                  const checked = !!laylatulChecks[c.key];
                  return (
                    <div
                      key={c.key}
                      onClick={() => toggleLaylatulCheck(c.key)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 select-none ${
                        checked ? 'bg-amber-500/20 border-amber-400/50 text-white' : 'bg-black/40 border-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                        checked ? 'bg-amber-400 text-black font-bold' : 'border border-slate-600'
                      }`}>
                        {checked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-bold">{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUNNAH IFTAR RITUAL */}
        {activeTab === 'iftar_sunnah' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/15 via-black/40 to-emerald-950/30 border border-amber-400/30 space-y-4">
              <div className="flex items-center gap-2">
                <Utensils className="text-amber-400" size={20} />
                <h3 className="text-lg font-black text-white">Prophetic Sunnah Iftar Breaking Protocol</h3>
              </div>
              <p className="text-xs text-slate-300">
                Follow the precise step-by-step Sunnah of the Prophet Muhammad (ﷺ) upon sunset.
              </p>

              {/* 5 Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                  <span className="text-[9px] font-black text-amber-400 uppercase">Step 1</span>
                  <h4 className="text-xs font-black text-white">Make Sincere Du'a Before Bite</h4>
                  <p className="text-[11px] text-slate-400">The supplication of a fasting person at Iftar is never rejected.</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                  <span className="text-[9px] font-black text-amber-400 uppercase">Step 2</span>
                  <h4 className="text-xs font-black text-white">Break with Odd Dates & Water</h4>
                  <p className="text-[11px] text-slate-400">Sunnah is 1, 3, or 5 fresh rutab or dry dates before eating a meal.</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
                  <span className="text-[9px] font-black text-amber-400 uppercase">Step 3</span>
                  <h4 className="text-xs font-black text-white">Recite the Hadith Dua</h4>
                  <p className="text-[11px] text-slate-400">"Dhahaba adh-dhama'u wabtallatil-'urooq..."</p>
                </div>
              </div>
            </div>

            {/* Interactive Date Counter */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-white">Dates Eaten at Iftar (Odd Number Sunnah)</h4>
                <p className="text-[11px] text-slate-400">Recommended: 1, 3, or 5 dates</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const next = Math.max(1, datesCount - 2);
                    setDatesCount(next);
                    localStorage.setItem(`ramadan_dates_day_${ramadanDay}`, String(next));
                  }}
                  className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="text-lg font-black font-mono text-amber-300">{datesCount} Dates</span>
                <button
                  onClick={() => {
                    const next = Math.min(9, datesCount + 2);
                    setDatesCount(next);
                    localStorage.setItem(`ramadan_dates_day_${ramadanDay}`, String(next));
                    playLocalChime('deed');
                  }}
                  className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 cursor-pointer font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 8-GLASS HYDRATION WAVE */}
        {activeTab === 'hydration' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-blue-950/40 via-black/50 to-emerald-950/30 border border-blue-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Droplet className="text-blue-400" size={20} />
                    <h3 className="text-lg font-black text-white">Ramadan 8-Glass Sunset-to-Dawn Hydration Wave</h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    Stay fully hydrated between Iftar and Suhoor to maintain energy, sharp focus, and zero headaches during fasting hours.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-black text-blue-300">{hydrationGlasses} / 8 Glasses</span>
                  <button
                    onClick={resetHydration}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                    title="Reset Hydration"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* 8 Glasses Interactive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pt-2">
                {[
                  { num: 1, timing: 'At Iftar' },
                  { num: 2, timing: 'After Maghrib' },
                  { num: 3, timing: 'With Dinner' },
                  { num: 4, timing: 'Pre-Taraweeh' },
                  { num: 5, timing: 'Post-Taraweeh' },
                  { num: 6, timing: 'Night Snack' },
                  { num: 7, timing: 'Suhoor Meal' },
                  { num: 8, timing: 'Final Imsak Sip' }
                ].map((g) => {
                  const isDrunk = g.num <= hydrationGlasses;
                  return (
                    <div
                      key={g.num}
                      onClick={addHydrationGlass}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[95px] select-none ${
                        isDrunk ? 'bg-blue-500/20 border-blue-400/50 shadow-lg' : 'bg-black/50 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <Droplet size={20} className={isDrunk ? 'text-blue-400 fill-blue-400 animate-bounce' : 'text-slate-600'} />
                      <div>
                        <p className="text-[10px] font-bold text-white">Glass #{g.num}</p>
                        <p className="text-[8px] text-slate-400">{g.timing}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addHydrationGlass}
                disabled={hydrationGlasses >= 8}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-black rounded-2xl text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <Droplet size={15} /> Log 1 Glass Drank (+5 Hasanat)
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: TARAWEEH & QIYAAM */}
        {activeTab === 'taraweeh' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-black/40 to-emerald-500/10 border border-amber-400/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className="text-amber-400" size={20} />
                    <h3 className="text-lg font-black text-white">Taraweeh & Qiyam al-Layl Tracker</h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    "Whoever stands in prayer during Ramadan with faith and seeking reward will have all past sins forgiven." (Bukhari)
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-bold pl-2">Target:</span>
                  {[8, 20].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTaraweehMaxRakats(t);
                        localStorage.setItem('ramadan_taraweeh_target', String(t));
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        taraweehMaxRakats === t ? 'bg-amber-500 text-black font-black' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {t} Rakats
                    </button>
                  ))}
                </div>
              </div>

              {/* Rakat Counter Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-black/60 border border-white/10">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Day {ramadanDay} Progress</p>
                  <p className="text-4xl font-black font-mono text-white">{currentTaraweehRakats} / {taraweehMaxRakats} <span className="text-sm text-slate-400 font-sans font-normal">Rakats</span></p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => incrementTaraweeh(-2)}
                    disabled={currentTaraweehRakats <= 0}
                    className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 rounded-xl border border-white/10 text-white cursor-pointer"
                  >
                    <Minus size={18} />
                  </button>
                  <button
                    onClick={() => incrementTaraweeh(2)}
                    disabled={currentTaraweehRakats >= taraweehMaxRakats}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <Plus size={18} /> Prayed 2 Rakats
                  </button>
                </div>
              </div>

              {/* Witr Prayer Toggle */}
              <div 
                onClick={toggleWitr}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  witrPrayed ? 'bg-emerald-500/20 border-emerald-400/40 text-white' : 'bg-black/40 border-white/10 text-slate-300'
                }`}
              >
                <div>
                  <h4 className="text-xs font-black text-white">Witr Prayer Concluded</h4>
                  <p className="text-[10px] text-slate-400">Pray 1 or 3 rakats of Witr with Qunoot supplication.</p>
                </div>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${witrPrayed ? 'bg-emerald-400 text-black font-bold' : 'border border-slate-600'}`}>
                  {witrPrayed && <Check size={16} strokeWidth={3} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: RAMADAN DUAS VAULT */}
        {activeTab === 'duas' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Duas' },
                { id: 'suhoor', label: 'Suhoor & Intention' },
                { id: 'iftar', label: 'Iftar Breaking' },
                { id: 'ashra', label: '3 Ashra Stages' },
                { id: 'laylatul_qadr', label: 'Laylatul Qadr' },
                { id: 'taraweeh', label: 'Taraweeh & Witr' },
                { id: 'general', label: 'General Fasting' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedDuaCat(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDuaCat === c.id ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-slate-300 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDuas.map((dua) => (
                <div key={dua.id} className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">{dua.categoryLabel}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{dua.source}</span>
                    </div>
                    <h4 className="text-xs font-black text-white">{dua.title}</h4>
                    <p className="arabic-text text-xl text-amber-200 text-right leading-relaxed pt-1">
                      {dua.arabic}
                    </p>
                    <p className="text-[11px] text-slate-300 italic font-mono">{dua.transliteration}</p>
                    <p className="text-xs text-slate-200">"{dua.english}"</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleSpeak(dua.arabic, 'ar')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 cursor-pointer"
                      title="Listen Audio"
                    >
                      <Volume2 size={15} />
                    </button>
                    <button
                      onClick={() => handleCopyDua(dua)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                      title="Copy Dua"
                    >
                      {copiedDuaId === dua.id ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: 1,000-MONTH LAYLATUL QADR MULTIPLIER CALCULATOR */}
        {activeTab === 'multiplier_calc' && (
          <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-black/60 to-purple-950/30 border border-amber-400/30 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                    Surah Al-Qadr [97:3] &bull; 83.33+ Years of Continuous Worship
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  Laylatul Qadr 1,000-Month Multiplier Calculator
                </h3>
                <p className="text-xs text-slate-300">
                  "The Night of Decree is better than a thousand months" (30,000 nights). See what your simple worship on this night equals!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-center shrink-0">
                <p className="text-[9px] font-black text-amber-300 uppercase tracking-wider">Divine Multiplier</p>
                <p className="text-2xl md:text-3xl font-black text-white font-mono">30,000x</p>
                <p className="text-[9px] text-amber-300/80">(= 1,000 Lunar Months)</p>
              </div>
            </div>

            {/* Interactive Sliders & Deed Multipliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Rakats of Salah */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-400" /> Voluntary Rakats Prayed Tonight
                  </span>
                  <span className="text-lg font-black font-mono text-white">{calcDeeds.rakats} Rakats</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="20" 
                  step="2"
                  value={calcDeeds.rakats} 
                  onChange={(e) => setCalcDeeds(prev => ({ ...prev, rakats: Number(e.target.value) }))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">Equates to Lifetime Salah:</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    {(calcDeeds.rakats * 30000).toLocaleString()} Rakats (~83 yrs of non-stop prayer!)
                  </span>
                </div>
              </div>

              {/* Sadaqah Given ($) */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Heart size={14} className="text-emerald-400" /> Sadaqah (Charity) Given Tonight
                  </span>
                  <span className="text-lg font-black font-mono text-white">${calcDeeds.sadaqah}</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="250" 
                  step="5"
                  value={calcDeeds.sadaqah} 
                  onChange={(e) => setCalcDeeds(prev => ({ ...prev, sadaqah: Number(e.target.value) }))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">Equates to Lifetime Charity:</span>
                  <span className="text-sm font-black font-mono text-emerald-400">
                    ${(calcDeeds.sadaqah * 30000).toLocaleString()} Given in Charity
                  </span>
                </div>
              </div>

              {/* Quran Pages Recited */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-sky-400" /> Quran Pages Recited Tonight
                  </span>
                  <span className="text-lg font-black font-mono text-white">{calcDeeds.quranPages} Pages</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="1"
                  value={calcDeeds.quranPages} 
                  onChange={(e) => setCalcDeeds(prev => ({ ...prev, quranPages: Number(e.target.value) }))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">Equates to Complete Khatams:</span>
                  <span className="text-sm font-black font-mono text-sky-300">
                    {Math.floor((calcDeeds.quranPages * 30000) / 604)} Complete Quran Khatams!
                  </span>
                </div>
              </div>

              {/* Dhikr & Astaghfirullah Count */}
              <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" /> Astaghfirullah & SubhanAllah Dhikr
                  </span>
                  <span className="text-lg font-black font-mono text-white">{calcDeeds.dhikrCount}x</span>
                </div>
                <input 
                  type="range" 
                  min="33" 
                  max="1000" 
                  step="33"
                  value={calcDeeds.dhikrCount} 
                  onChange={(e) => setCalcDeeds(prev => ({ ...prev, dhikrCount: Number(e.target.value) }))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-slate-300">Equates to Glorifications:</span>
                  <span className="text-sm font-black font-mono text-purple-300">
                    {(calcDeeds.dhikrCount * 30000).toLocaleString()} Remembrances of Allah
                  </span>
                </div>
              </div>

            </div>

            {/* Special Laylatul Qadr Dua Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-black/60 border border-amber-400/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest">
                  Prophetic Master Supplication (Aisha RA)
                </span>
                <p className="arabic-text text-xl font-bold text-amber-200">
                  اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي
                </p>
                <p className="text-xs text-slate-200">
                  "O Allah, You are Most Forgiving, and You love forgiveness, so forgive me." (Tirmidhi 3513)
                </p>
              </div>

              <button
                onClick={() => {
                  handleSpeak("اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", 'ar');
                  if (addHasanat) addHasanat(10);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20 shrink-0"
              >
                <Volume2 size={14} /> Recite Dua (+10 Hasanat)
              </button>
            </div>
          </div>
        )}

        {/* TAB: PROPHETIC SUNNAH SUPERFOODS & NUTRITION */}
        {activeTab === 'sunnah_foods' && (
          <div className="space-y-6">
            <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-950/40 via-black/60 to-amber-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌴</span>
                <h3 className="text-xl font-black text-white">
                  Prophetic Sunnah Superfoods & Ramadan Nutrition Hub
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                The Prophet Muhammad ﷺ emphasized specific nourishing foods for physical vitality, hydration, and cellular longevity during fasting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  emoji: "🌴",
                  name: "Ajwa & Medjool Dates",
                  timing: "Sunnah for Iftar & Suhoor",
                  hadith: "Whoever begins their day with seven Ajwa dates will not be harmed by poison or magic. (Bukhari)",
                  benefits: "Rich in fast-acting natural fructose, potassium to prevent cramps, and high prebiotic fiber to restart digestion smoothly.",
                  tag: "High Energy & Fast Glucose"
                },
                {
                  emoji: "🥣",
                  name: "Warm Talbina (Barley & Honey)",
                  timing: "Recommended for Suhoor",
                  hadith: "Talbina gives rest to the heart of the patient and makes it active, relieving some of its sorrow. (Bukhari)",
                  benefits: "Whole-grain sprouted barley cooked in milk with pure honey. Slow-burning complex carbs that sustain stamina for 14+ hours.",
                  tag: "Sustained Suhoor Stamina"
                },
                {
                  emoji: "🍉",
                  name: "Fresh Watermelon with Dates",
                  timing: "Ideal for Iftar Refreshment",
                  hadith: "The Prophet ﷺ used to eat watermelon with fresh dates, saying: 'The heat of the one is broken by the coolness of the other.' (Abu Dawud)",
                  benefits: "92% natural alkaline electrolyte water combined with mineral-dense dates for deep cellular rehydration after sunset.",
                  tag: "Deep Cellular Hydration"
                },
                {
                  emoji: "🍯",
                  name: "Raw Mountain Honey",
                  timing: "Suhoor Water Tonic",
                  hadith: "There is healing in honey for every illness. (Quran 16:69)",
                  benefits: "Potent antimicrobial enzymes, balances blood sugar, supports gut microbiome, and coats the throat against dry daytime cough.",
                  tag: "Immunity & Healing"
                },
                {
                  emoji: "🫒",
                  name: "Cold-Pressed Olive Oil (Zayt)",
                  timing: "Suhoor / Dinner Drizzle",
                  hadith: "Eat of the olive tree and apply its oil, for it is from a blessed tree. (Tirmidhi)",
                  benefits: "Monounsaturated heart-healthy polyphenols that slow gastric emptying, keeping your stomach comfortable during the fast.",
                  tag: "Blessed Satiety"
                },
                {
                  emoji: "🌿",
                  name: "Black Seed (Habbatus Sauda)",
                  timing: "Daily Suhoor Sprinkle (1/4 tsp)",
                  hadith: "In the black seed is healing for every disease except death. (Bukhari)",
                  benefits: "Contains Thymoquinone, powerful antioxidant that fortifies white blood cells and reduces fasting fatigue.",
                  tag: "Vitality Fortress"
                }
              ].map((food, fIdx) => (
                <div key={fIdx} className="p-5 rounded-2xl bg-black/50 border border-white/10 hover:border-amber-400/40 transition-all space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{food.emoji}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {food.tag}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{food.name}</h4>
                      <p className="text-[10px] text-amber-400 font-bold">{food.timing}</p>
                    </div>
                    <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-xl border border-white/5">
                      "{food.hadith}"
                    </p>
                    <p className="text-[11px] text-slate-300/90 leading-relaxed">
                      {food.benefits}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (addHasanat) addHasanat(5);
                      playLocalChime('deed');
                    }}
                    className="w-full py-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 font-bold text-xs border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>Logged in Sunnah Meals (+5 Hasanat)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: ZAKAT AL-FITR PLANNER */}
        {activeTab === 'zakat' && (
          <div className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-r from-amber-500/10 via-black/40 to-emerald-950/30 border border-amber-400/30 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calculator className="text-amber-400" size={20} />
                <h3 className="text-lg font-black text-white">Zakat al-Fitr & Firdaws Charity Food Support</h3>
              </div>
              <p className="text-xs text-slate-300">
                Zakat al-Fitr is an obligatory charity paid before the Eid al-Fitr prayer to purify fasts and feed the needy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-black/60 border border-white/10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Family Members to Cover (Dependents):</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const next = Math.max(1, familyMembersCount - 1);
                      setFamilyMembersCount(next);
                      localStorage.setItem('ramadan_family_members', String(next));
                    }}
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white cursor-pointer"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="text-xl font-black font-mono text-white">{familyMembersCount} People</span>
                  <button
                    onClick={() => {
                      const next = familyMembersCount + 1;
                      setFamilyMembersCount(next);
                      localStorage.setItem('ramadan_family_members', String(next));
                    }}
                    className="w-9 h-9 rounded-xl bg-amber-500 text-black flex items-center justify-center cursor-pointer font-bold"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-1 sm:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Zakat al-Fitr Due</p>
                <p className="text-3xl font-black font-mono text-amber-300">${familyMembersCount * costPerPerson}</p>
                <p className="text-[10px] text-slate-400 font-mono">(${costPerPerson} standard food staple rate per person)</p>
              </div>
            </div>

            <div 
              onClick={toggleZakatPaid}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                zakatFitrPaid ? 'bg-emerald-500/20 border-emerald-400/40 text-white' : 'bg-black/40 border-white/10 text-slate-300'
              }`}
            >
              <div>
                <h4 className="text-xs font-black text-white">Zakat al-Fitr Disbursed to Charity</h4>
                <p className="text-[10px] text-slate-400">Mark as distributed to local recipients or through Firdaws Charity.</p>
              </div>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${zakatFitrPaid ? 'bg-emerald-400 text-black font-bold' : 'border border-slate-600'}`}>
                {zakatFitrPaid && <Check size={16} strokeWidth={3} />}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: CONTINUOUS REMINDERS */}
        {activeTab === 'reminders' && (
          <div className="p-6 md:p-8 rounded-[2rem] bg-black/40 border border-white/10 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="text-amber-400" size={20} />
                <h3 className="text-lg font-black text-white">Continuous Spiritual Dhikr & Prayer Reminders</h3>
              </div>
              <p className="text-xs text-slate-300">
                Receive soothing chimes and mindfulness notifications while fasting throughout the day.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <h4 className="text-xs font-black text-white">Continuous Reminder Loop</h4>
                <p className="text-[10px] text-slate-400">Periodic audio chime & barakah toast</p>
              </div>
              <button
                onClick={toggleContinuousReminders}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  enableContinuousReminders ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {enableContinuousReminders ? 'Reminders Active (ON)' : 'Disabled (OFF)'}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Reminder Frequency Interval:</label>
              <div className="flex flex-wrap gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setReminderIntervalMinutes(mins);
                      localStorage.setItem('ramadan_reminder_interval', String(mins));
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reminderIntervalMinutes === mins ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    Every {mins} Minutes
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
