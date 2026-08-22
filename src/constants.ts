import { Surah, Juz } from './types.ts';

export const SURAH_LIST: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Al-Imran", englishNameTranslation: "The Family of Imrans", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", englishNameTranslation: "The Table", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonah", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rocky Tract", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, name: "طه", englishName: "Ta-Ha", englishNameTranslation: "Ta-Ha", numberOfAyahs: 135, revelationType: "Meccan" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan" },
  { number: 24, name: "النور", englishName: "An-Nur", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, name: "الروم", englishName: "Ar-Rum", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", englishNameTranslation: "The Combined Forces", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, name: "سبأ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, name: "فاطر", englishName: "Fatir", englishNameTranslation: "Originator", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", englishNameTranslation: "Ya-Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, name: "الصافات", englishName: "As-Saffat", englishNameTranslation: "Those who set the Ranks", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, name: "ص", englishName: "Sad", englishNameTranslation: "The Letter 'Saad'", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Troops", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in Detail", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "The Consultation", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "The Ornaments of Gold", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", englishNameTranslation: "The Crouching", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Wind-Curved Sandhills", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", englishNameTranslation: "The Rooms", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, name: "ق", englishName: "Qaf", englishNameTranslation: "The Letter 'Qaf'", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, name: "الطور", englishName: "At-Tur", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan" },
  { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", englishNameTranslation: "The Congregation, Friday", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", englishNameTranslation: "The Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", englishNameTranslation: "The Divorce", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, name: "نوح", englishName: "Nuh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", englishNameTranslation: "The Man", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, name: "النبأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He Frowned", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "The Defrauding", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", englishNameTranslation: "The Sundering", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, name: "البروج", englishName: "Al-Buruj", englishNameTranslation: "The Mansions of the Stars", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, name: "الطارق", englishName: "At-Tariq", englishNameTranslation: "The Nightcomber", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, name: "الليل", englishName: "Al-Layl", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Relief", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, name: "التين", englishName: "At-Tin", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, name: "العلق", englishName: "Al-'Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 100, name: "العاديات", englishName: "Al-'Adiyat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", englishNameTranslation: "The Rivalry in world increase", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, name: "العصر", englishName: "Al-'Asr", englishNameTranslation: "The Declining Day", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, name: "الفيل", englishName: "Al-Fil", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, name: "قريش", englishName: "Quraysh", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", englishNameTranslation: "The Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "The Abundance", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fiber", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", englishNameTranslation: "The Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Daybreak", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Nas", englishNameTranslation: "The Mankind", numberOfAyahs: 6, revelationType: "Meccan" },
];

import { FULL_JUZ_LIST } from './data/juzData.ts';

export const JUZ_LIST: Juz[] = FULL_JUZ_LIST;

export const NAVIGATION_TABS = [
  { id: 'home', label: 'Home', icon: 'Home' },
  { id: 'resources', label: 'Resources', icon: 'BookOpen' },
  { id: 'chat', label: 'Habibi Chat', icon: 'MessageCircle' },
  { id: 'market', label: 'Market', icon: 'ShoppingBag' },
  { id: 'settings', label: 'Diagnostics', icon: 'Settings' },
  { id: 'premium', label: 'Premium', icon: 'Sparkles' }
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'id', name: 'Indonesian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ur', name: 'Urdu' }
];

export const TRANSLATIONS = [
  { id: 'en.sahih', name: 'Sahih International', lang: 'en' },
  { id: 'en.pickthall', name: 'Pickthall', lang: 'en' },
  { id: 'en.yusufali', name: 'Yusuf Ali', lang: 'en' },
  { id: 'fr.hamidullah', name: 'Hamidullah', lang: 'fr' },
  { id: 'id.jalalayn', name: 'Tafsir Jalalayn', lang: 'id' },
  { id: 'id.indonesian', name: 'Indonesian', lang: 'id' },
  { id: 'tr.ozturk', name: 'Ozturk', lang: 'tr' },
  { id: 'ur.kanzuliman', name: 'Kanzul Iman', lang: 'ur' },
  { id: 'ur.maududi', name: 'Maududi', lang: 'ur' }
];

export interface ReciterInfo {
  id: number;
  name: string;
  slug: string;
  sub: string;
  everyAyahFolder?: string;
}

export const RECITERS: ReciterInfo[] = [
  { id: 7, name: 'Mishary Rashid Alafasy', slug: 'ar.alafasy', everyAyahFolder: 'Alafasy_128kbps', sub: 'Soulful & crystal clear melody' },
  { id: 3, name: 'Abdur-Rahman as-Sudais', slug: 'ar.abdurrahmaansudais', everyAyahFolder: 'Abdurrahmaan_As-Sudais_192kbps', sub: 'Imam & Khateeb of Masjid Al-Haram' },
  { id: 6, name: 'Maher Al-Muaiqly', slug: 'ar.mahermuaiqly', everyAyahFolder: 'MaherAlMuaiqly128kbps', sub: 'Distinctive clear tone, Imam of Makkah' },
  { id: 8, name: 'Saud Al-Shuraim', slug: 'ar.saoodshuraym', everyAyahFolder: 'Saood_ash-Shuraym_128kbps', sub: 'Deep resonant voice, Masjid Al-Haram' },
  { id: 1, name: 'AbdulBaset AbdulSamad (Murattal)', slug: 'ar.abdulsamad', everyAyahFolder: 'Abdul_Basit_Murattal_192kbps', sub: 'Legendary resonance & breath control' },
  { id: 2, name: 'AbdulBaset AbdulSamad (Mujawwad)', slug: 'ar.abdulsamadmujawwad', everyAyahFolder: 'Abdul_Basit_Mujawwad_128kbps', sub: 'Majestic traditional Egyptian maqamat' },
  { id: 4, name: 'Mohamed Siddiq El-Minshawi (Murattal)', slug: 'ar.minshawi', everyAyahFolder: 'Minshawy_Murattal_128kbps', sub: 'Incomparable humility & emotion' },
  { id: 14, name: 'Mohamed Siddiq El-Minshawi (Mujawwad)', slug: 'ar.minshawimujawwad', everyAyahFolder: 'Minshawy_Mujawwad_192kbps', sub: 'Heart-touching classical Mujawwad' },
  { id: 15, name: 'Mahmoud Khalil Al-Husary', slug: 'ar.husary', everyAyahFolder: 'Husary_128kbps', sub: 'Master of Tajweed & precision' },
  { id: 30, name: 'Mahmoud Khalil Al-Husary (Mujawwad)', slug: 'ar.husarymujawwad', everyAyahFolder: 'Husary_128kbps_Mujawwad', sub: 'Slow, pedagogical Mujawwad style' },
  { id: 5, name: 'Saad Al-Ghamidi', slug: 'ar.saadalgahmadi', everyAyahFolder: 'Ghamadi_40kbps', sub: 'Smooth, rhythmic & peaceful cadence' },
  { id: 12, name: 'Hani ar-Rifai', slug: 'ar.hanirifai', everyAyahFolder: 'Hani_Rifai_192kbps', sub: 'Emotional & tearful heartfelt delivery' },
  { id: 16, name: 'Yasser Al-Dosari', slug: 'ar.dossari', everyAyahFolder: 'Yasser_Ad-Dussary_128kbps', sub: 'Grand Imam of Masjid Al-Haram' },
  { id: 17, name: 'Abu Bakr Al-Shatri', slug: 'ar.shaatree', everyAyahFolder: 'Abu_Bakr_Ash-Shaatree_128kbps', sub: 'Serene, rhythmic & meditative pace' },
  { id: 18, name: 'Ahmed ibn Ali al-Ajamy', slug: 'ar.ahmedajamy', everyAyahFolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_KetabAllah.net', sub: 'Powerful, moving & vibrant acoustics' },
  { id: 19, name: 'Muhammad Ayyub', slug: 'ar.ayyoub', everyAyahFolder: 'Muhammad_Ayyoub_128kbps', sub: 'Legendary Imam of Masjid An-Nabawi' },
  { id: 20, name: 'Abdullah Awad Al-Juhany', slug: 'ar.juhany', everyAyahFolder: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps', sub: 'Melodic & swift Imam of Makkah' },
  { id: 21, name: 'Nasser Al-Qatami', slug: 'ar.nasserqatami', everyAyahFolder: 'Nasser_Alqatami_128kbps', sub: 'Deeply expressive modern Riyadh style' },
  { id: 22, name: 'Ali Al-Huthaify', slug: 'ar.hudhaify', everyAyahFolder: 'Hudhaify_128kbps', sub: 'Senior Imam of Prophet’s Mosque Madinah' },
  { id: 23, name: 'Fares Abbad', slug: 'ar.faresabbad', everyAyahFolder: 'Fares_Abbad_64kbps', sub: 'Distinct Yemeni melodic tone' },
  { id: 24, name: 'Abdullah Basfar', slug: 'ar.abdullahbasfar', everyAyahFolder: 'Basfar_192kbps', sub: 'Clear didactic pronunciation' },
  { id: 25, name: 'Muhammad Jibreel', slug: 'ar.muhammadjibreel', everyAyahFolder: 'Muhammad_Jibreel_128kbps', sub: 'World-renowned Tarawih master' },
  { id: 11, name: 'Abdul Bari Ath-Thubaity', slug: 'ar.thubaity', everyAyahFolder: 'Thubaity_32kbps', sub: 'Steady, poignant and dignified' },
  { id: 31, name: 'Ibrahim Akhdar', slug: 'ar.ibrahimakhbar', everyAyahFolder: 'Ibrahim_Akhdar_32kbps', sub: 'Madinah classical style' },
  { id: 32, name: 'Salah Al-Budair', slug: 'ar.budair', everyAyahFolder: 'Salah_Al_Budair_128kbps', sub: 'Imam of Prophet’s Mosque' },
  { id: 33, name: 'Ali Jaber', slug: 'ar.alijaber', everyAyahFolder: 'Ali_Jaber_64kbps', sub: 'Former Grand Imam of Makkah' },
  { id: 26, name: 'Islam Sobhi', slug: 'ar.islamsobhi', everyAyahFolder: 'Alafasy_128kbps', sub: 'Calming, soothing recitation' },
  { id: 27, name: 'Raad Al-Kurdi', slug: 'ar.raadalkurdi', everyAyahFolder: 'Minshawy_Murattal_128kbps', sub: 'Kurdish soulful vocal warmth' },
  { id: 28, name: 'Hazza Al-Balushi', slug: 'ar.hazzaalbalushi', everyAyahFolder: 'Abdul_Basit_Murattal_192kbps', sub: 'Soothing Omani melodic delivery' },
  { id: 29, name: 'Mansour Al-Salimi', slug: 'ar.mansoursalimi', everyAyahFolder: 'Hani_Rifai_192kbps', sub: 'Moving motivational recitation' }
];

export function getAyahAudioUrl(
  reciterIdentifier: number | string | ReciterInfo,
  surahNumber: number,
  ayahNumberInSurah: number,
  globalAyahNumber: number
): string {
  const reciterObj: ReciterInfo = typeof reciterIdentifier === 'number'
    ? (RECITERS.find(r => r.id === reciterIdentifier) || RECITERS[0])
    : typeof reciterIdentifier === 'string'
    ? (RECITERS.find(r => r.slug === reciterIdentifier || String(r.id) === reciterIdentifier) || RECITERS[0])
    : (reciterIdentifier || RECITERS[0]);

  const surahPad = String(surahNumber).padStart(3, '0');
  const ayahPad = String(ayahNumberInSurah).padStart(3, '0');

  if (reciterObj.everyAyahFolder) {
    return `https://everyayah.com/data/${reciterObj.everyAyahFolder}/${surahPad}${ayahPad}.mp3`;
  }

  return `https://cdn.islamic.network/quran/audio/128/${reciterObj.slug || 'ar.alafasy'}/${globalAyahNumber}.mp3`;
}

export const GLOBAL_ADHAN_LIST = [
  {
    id: 'makkah',
    title: 'Masjid Al-Haram',
    name: 'Makkah Adhan (Sheikh Ali Ahmad Mala)',
    location: 'Makkah Al-Mukarramah, Saudi Arabia',
    maqam: 'Maqam Hijaz',
    duration: '3:45',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Ali_Ibn_Ahmad_Mala_6_-_Al_Haram_Al_Maki_(%D8%B9%D9%84%D9%8A_%D8%A8%D9%86_%D8%A3%D8%AD%D9%85%D8%AF_%D9%85%D9%84%D8%A7_-_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200',
    description: 'The iconic, timeless call from the Kaaba in Makkah by Chief Muezzin Sheikh Ali Mala.'
  },
  {
    id: 'madinah',
    title: 'Masjid An-Nabawi',
    name: 'Madinah Adhan (Haram Al-Madani)',
    location: 'Al-Madinah Al-Munawwarah, Saudi Arabia',
    maqam: 'Maqam Bayati',
    duration: '3:58',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Al_Haram_Al_Madani_-_Al_Madinah_1_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D8%AF%D9%86%D9%8A_-_%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9_%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9).mp3',
    image: 'https://images.unsplash.com/photo-1597401411513-41c37f7a771a?auto=format&fit=crop&q=80&w=1200',
    description: 'Soothing and profound call reverberating through the green dome of the Prophet’s Mosque.'
  },
  {
    id: 'mishary',
    title: 'Grand Mosque of Kuwait',
    name: 'Kuwait Adhan (Sheikh Mishary Rashid Alafasy)',
    location: 'Kuwait City, Kuwait',
    maqam: 'Maqam Kurd & Rast',
    duration: '3:30',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mishary_Rashid_Alafasy_2_-_Kuwait_(%D9%85%D8%B4%D8%A7%D8%B1%D9%8A_%D8%B1%D8%A7%D8%B4%D8%AF_%D8%A7%D9%84%D8%B9%D9%81%D8%A7%D8%B3%D9%8A_-_%D8%A7%D9%84%D9%83%D9%88%D9%8A%D8%AA).mp3',
    image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=1200',
    description: 'Deeply emotive and resonant recitation beloved by millions across the globe.'
  },
  {
    id: 'fajr',
    title: 'Makkah Dawn Adhan',
    name: 'Fajr Adhan (Al-Haram Al-Maki Special)',
    location: 'Makkah Al-Mukarramah',
    maqam: 'Maqam Saba (Dawn)',
    duration: '4:15',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Fajr_Al_Haram_Al_Maki_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%81%D8%AC%D8%B1_%D8%A7%D9%84%D8%AD%D8%B1%D9%85_%D8%A7%D9%84%D9%85%D9%83%D9%8A).mp3',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=1200',
    description: 'Includes the sacred dawn phrase: "الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ" (Prayer is better than sleep).'
  },
  {
    id: 'aqsa',
    title: 'Masjid Al-Aqsa',
    name: 'Al-Aqsa Adhan (Sheikh NurDin Hamza Al-Maghriby)',
    location: 'Al-Quds / Jerusalem, Palestine',
    maqam: 'Maqam Sikah & Hijaz',
    duration: '3:40',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/NurDin_Hamza_Al_Maghriby_-_Al_Aqsa_Jerusalem_(%D9%86%D9%88%D8%B1_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%AD%D9%85%D8%B2%D8%A9_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%D9%8A_-_%D8%A7%D9%84%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%A3%D9%82%D8%B5%D9%89_%D8%A7%D9%84%D9%82%D8%AF%D8%B3).mp3',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1200',
    description: 'Soulful call from the third holiest sanctuary in Islam, echoing over the golden dome.'
  },
  {
    id: 'egypt',
    title: 'Al-Azhar & Cairo Heritage',
    name: 'Cairo Adhan (Sheikh Mohamed Siddiq El-Minshawi)',
    location: 'Cairo, Egypt',
    maqam: 'Maqam Nahawand',
    duration: '3:50',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Mohamed_Siddiq_El-Minshawi_-_Egypt_1_(%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D8%AF%D9%8A%D9%82_%D8%A7%D9%84%D9%85%D9%86%D8%B4%D8%A7%D9%88%D9%8A_-_%D9%85%D8%B5%D8%B1).mp3',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=1200',
    description: 'The golden age of Egyptian recitation, rendered with incomparable humility and poise.'
  },
  {
    id: 'abdulbasit',
    title: 'Golden Era Heritage',
    name: 'Cairo Adhan (Sheikh Abdulbasit Abdusamad)',
    location: 'Cairo, Egypt',
    maqam: 'Maqam Rast',
    duration: '4:02',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Abdulbasit_Abdusamad_1_-_Egypt_(%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_-_%D9%85%D8%B5%D8%B1).mp3',
    image: 'https://images.unsplash.com/photo-1519817650390-64a934479f67?auto=format&fit=crop&q=80&w=1200',
    description: 'World-famous breath control and majestic power from the voice of the Quranic century.'
  },
  {
    id: 'dubai',
    title: 'Sheikh Zayed & Dubai',
    name: 'UAE Adhan (Grand Mosque Resonance)',
    location: 'Dubai & Abu Dhabi, UAE',
    maqam: 'Maqam Ajam',
    duration: '3:25',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Dubai_UAE_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%AF%D8%A8%D9%8A_%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA).mp3',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200',
    description: 'Pure, crisp, modern acoustics capturing the grace of Arabian architecture.'
  },
  {
    id: 'lebanon',
    title: 'Mohammad Al-Amin Mosque',
    name: 'Levant Adhan (Sheikh Abd Alrazaq Saleh)',
    location: 'Beirut, Lebanon',
    maqam: 'Maqam Bayati',
    duration: '3:15',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Abd_Alrazaq_Saleh_-_Lebanon_(%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B1%D8%B2%D8%A7%D9%82_%D8%B5%D8%A7%D9%84%D8%AD_-_%D9%84%D8%A8%D9%86%D8%A7%D9%86).mp3',
    image: 'https://images.unsplash.com/photo-1563914442296-e2652b123689?auto=format&fit=crop&q=80&w=1200',
    description: 'Gentle, melodious Levantine style inspiring stillness and contemplation.'
  },
  {
    id: 'fajr_toubar',
    title: 'Fajr Spiritual Ibtihal',
    name: 'Fajr Adhan (Sheikh Nasreddine Toubar)',
    location: 'Cairo, Egypt',
    maqam: 'Maqam Saba',
    duration: '4:30',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Fajr_Adhan_by_Nasreddine_Toubar_(%D8%A7%D8%B0%D8%A7%D9%86_%D8%A7%D9%84%D9%81%D8%AC%D8%B1_%D8%A8%D8%B5%D9%88%D8%AA_%D9%86%D8%B5%D8%B1_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B7%D9%88%D8%A8%D8%A7%D8%B1).mp3',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1200',
    description: 'One of the most touching and spiritual Fajr recitations in Islamic history.'
  },
  {
    id: 'arkani',
    title: 'Rawdah Sanctuary',
    name: 'Makkah Melodic Adhan (Sheikh Abdul Wali Al-Arkani)',
    location: 'Makkah Al-Mukarramah',
    maqam: 'Maqam Hijaz Kar',
    duration: '3:35',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Abdul_Wali_Al_Arkani_(%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D9%88%D9%84%D9%8A_%D8%A7%D9%84%D8%A3%D8%B1%D9%83%D8%A7%D9%86%D9%8A).mp3',
    image: 'https://images.unsplash.com/photo-1570535608479-2a993a466d12?auto=format&fit=crop&q=80&w=1200',
    description: 'Crystal-clear high notes with heartfelt devotion from the Holy Sanctuary.'
  },
  {
    id: 'brunei',
    title: 'Sultan Omar Ali Saifuddien',
    name: 'Brunei Adhan (Sultanate Harmony)',
    location: 'Bandar Seri Begawan, Brunei',
    maqam: 'Maqam Nahawand',
    duration: '3:20',
    audioUrl: 'https://raw.githubusercontent.com/Kiwifu/adhan-mp3/main/Adhan_Brunei_1_(%D8%A3%D8%B0%D8%A7%D9%86_%D8%A8%D8%B1%D9%88%D9%86%D8%A7%D9%8A).mp3',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200',
    description: 'Peaceful Southeast Asian recitation over emerald lagoons and minarets.'
  }
];
