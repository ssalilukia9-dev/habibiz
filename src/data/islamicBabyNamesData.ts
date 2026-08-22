export interface BabyNameItem {
  id: string;
  name: string;
  arabic: string;
  meaning: string;
  origin: string;
  gender: 'boy' | 'girl';
  pronunciation: string;
  virtue?: string;
  isQuranic?: boolean;
}

export const ISLAMIC_BABY_NAMES: BabyNameItem[] = [
  {
    "id": "b1",
    "name": "Muhammad",
    "arabic": "مُحَمَّد",
    "meaning": "Praiseworthy, the most praised",
    "origin": "Prophet Muhammad (ﷺ), Quranic",
    "pronunciation": "Moo-HAM-mad",
    "isQuranic": true,
    "gender": "boy",
    "virtue": "Name of the final Messenger of Allah"
  },
  {
    "id": "b2",
    "name": "Ahmad",
    "arabic": "أَحْمَد",
    "meaning": "Highly praised, thankful to God",
    "origin": "Surah As-Saff (61:6)",
    "pronunciation": "AH-mad",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b3",
    "name": "Ibrahim",
    "arabic": "إِبْرَاهِيم",
    "meaning": "Father of nations, friend of God",
    "origin": "Prophet Ibrahim (AS)",
    "pronunciation": "Ib-ra-HEEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b4",
    "name": "Yusuf",
    "arabic": "يُوسُف",
    "meaning": "God increases in beauty and piety",
    "origin": "Prophet Yusuf (AS)",
    "pronunciation": "YOO-soof",
    "isQuranic": true,
    "gender": "boy",
    "virtue": "Symbol of radiant beauty and patience"
  },
  {
    "id": "b5",
    "name": "Musa",
    "arabic": "مُوسَى",
    "meaning": "Saved from the water, courageous leader",
    "origin": "Prophet Musa (AS)",
    "pronunciation": "MOO-sah",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b6",
    "name": "Isa",
    "arabic": "عِيسَى",
    "meaning": "Salvation, blessed messenger",
    "origin": "Prophet Isa (AS)",
    "pronunciation": "EE-sah",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b7",
    "name": "Yahya",
    "arabic": "يَحْيَى",
    "meaning": "He shall live, pious from youth",
    "origin": "Prophet Yahya (AS)",
    "pronunciation": "YAH-yah",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b8",
    "name": "Idris",
    "arabic": "إِدْرِيس",
    "meaning": "Scholarly, elevated station",
    "origin": "Prophet Idris (AS)",
    "pronunciation": "Id-REES",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b9",
    "name": "Nuh",
    "arabic": "نُوح",
    "meaning": "Rest, comfort, caller to truth",
    "origin": "Prophet Nuh (AS)",
    "pronunciation": "NOOH",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b10",
    "name": "Sulaiman",
    "arabic": "سُلَيْمَان",
    "meaning": "Man of peace, blessed with wisdom",
    "origin": "Prophet Sulaiman (AS)",
    "pronunciation": "Soo-lay-MAHN",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b11",
    "name": "Dawud",
    "arabic": "دَاوُد",
    "meaning": "Beloved psalmist of Allah",
    "origin": "Prophet Dawud (AS)",
    "pronunciation": "Dah-WOOD",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b12",
    "name": "Ismail",
    "arabic": "إِسْمَاعِيل",
    "meaning": "God hears prayer, obedient servant",
    "origin": "Prophet Ismail (AS)",
    "pronunciation": "Is-mah-EEL",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b13",
    "name": "Ishaq",
    "arabic": "إِسْحَاق",
    "meaning": "Joyful laughter, blessing",
    "origin": "Prophet Ishaq (AS)",
    "pronunciation": "Is-HAHK",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b14",
    "name": "Yaqub",
    "arabic": "يَعْقُوب",
    "meaning": "Prophet Jacob, patient patriarch",
    "origin": "Prophet Yaqub (AS)",
    "pronunciation": "Yah-KOOB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b15",
    "name": "Yunus",
    "arabic": "يُونُس",
    "meaning": "Prophet Jonah, Dhun-Nun in the whale",
    "origin": "Prophet Yunus (AS)",
    "pronunciation": "YOO-noos",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b16",
    "name": "Ayyub",
    "arabic": "أَيُّوب",
    "meaning": "Returning to God, paragon of patience",
    "origin": "Prophet Ayyub (AS)",
    "pronunciation": "Ay-YOOB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b17",
    "name": "Harun",
    "arabic": "هَارُون",
    "meaning": "Eloquent leader, elevated",
    "origin": "Prophet Harun (AS)",
    "pronunciation": "Hah-ROON",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b18",
    "name": "Zakariya",
    "arabic": "زَكَرِيَّا",
    "meaning": "Prophet Zechariah, God remembers",
    "origin": "Prophet Zakariya (AS)",
    "pronunciation": "Zah-kah-REE-yah",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b19",
    "name": "Hud",
    "arabic": "هُود",
    "meaning": "Prophet of Aad, righteous guide",
    "origin": "Surah Hud (11:50)",
    "pronunciation": "HOOD",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b20",
    "name": "Saleh",
    "arabic": "صَالِح",
    "meaning": "Righteous prophet of Thamud",
    "origin": "Surah Al-Araf (7:73)",
    "pronunciation": "SAH-leh",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b21",
    "name": "Shuayb",
    "arabic": "شُعَيْب",
    "meaning": "Prophet of Madyan, eloquent orator",
    "origin": "Surah Al-Araf (7:85)",
    "pronunciation": "Shoo-AYB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b22",
    "name": "Ilyas",
    "arabic": "إِلْيَاس",
    "meaning": "Prophet Elijah, zealous devotee",
    "origin": "Surah Al-Anam (6:85)",
    "pronunciation": "Il-YAHS",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b23",
    "name": "Al-Yasa",
    "arabic": "الْيَسَع",
    "meaning": "The prophet Elisha, noble guide",
    "origin": "Surah Al-Anam (6:86)",
    "pronunciation": "Al-Yah-SAH",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b24",
    "name": "Dhul-Kifl",
    "arabic": "ذُو الْكِفْل",
    "meaning": "Possessor of double portion of reward",
    "origin": "Prophet Dhul-Kifl (AS)",
    "pronunciation": "Dhil-KIFL",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b25",
    "name": "Adam",
    "arabic": "آدَم",
    "meaning": "Created from earth, father of humanity",
    "origin": "Surah Al-Baqarah (2:31)",
    "pronunciation": "AH-dam",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b26",
    "name": "Abu Bakr",
    "arabic": "أَبُو بَكْر",
    "meaning": "Pioneer of truth, noble father",
    "origin": "Abu Bakr As-Siddiq (RA)",
    "pronunciation": "Ah-boo BAK-r",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b27",
    "name": "Umar",
    "arabic": "عُمَر",
    "meaning": "Flourishing, long-lived, life",
    "origin": "Umar ibn Al-Khattab (RA)",
    "pronunciation": "OO-mar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b28",
    "name": "Uthman",
    "arabic": "عُثْمَان",
    "meaning": "Wise, thoughtful, Dhun-Nurayn",
    "origin": "Uthman ibn Affan (RA)",
    "pronunciation": "Ooth-MAHN",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b29",
    "name": "Ali",
    "arabic": "عَلِيّ",
    "meaning": "Exalted, noble, high station",
    "origin": "Ali ibn Abi Talib (RA)",
    "pronunciation": "Ah-LEE",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b30",
    "name": "Hamza",
    "arabic": "حَمْزَة",
    "meaning": "Steadfast lion of Allah",
    "origin": "Hamza ibn Abdul-Muttalib (RA)",
    "pronunciation": "HAM-zah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b31",
    "name": "Bilal",
    "arabic": "بِلَال",
    "meaning": "Moisture, victor over thirst",
    "origin": "Bilal ibn Rabah (RA)",
    "pronunciation": "Bih-LAHL",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b32",
    "name": "Zaid",
    "arabic": "زَيْد",
    "meaning": "Abundance, growth, progress",
    "origin": "Surah Al-Ahzab (33:37)",
    "pronunciation": "ZAYD",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b33",
    "name": "Hasan",
    "arabic": "حَسَن",
    "meaning": "Handsome, good character",
    "origin": "Al-Hasan ibn Ali (RA)",
    "pronunciation": "HAH-san",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b34",
    "name": "Husayn",
    "arabic": "حُسَيْن",
    "meaning": "Cherished, little beauty",
    "origin": "Al-Husayn ibn Ali (RA)",
    "pronunciation": "Hoo-SAYN",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b35",
    "name": "Zubair",
    "arabic": "زُبَيْر",
    "meaning": "Strong, brave intellect",
    "origin": "Az-Zubair ibn Al-Awwam (RA)",
    "pronunciation": "Zoo-BAYR",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b36",
    "name": "Talha",
    "arabic": "طَلْحَة",
    "meaning": "Fruitful tree of Paradise",
    "origin": "Talha ibn Ubaidullah (RA)",
    "pronunciation": "TAL-hah",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b37",
    "name": "Saad",
    "arabic": "سَعْد",
    "meaning": "Good fortune, felicity, joy",
    "origin": "Sa’d ibn Abi Waqqas (RA)",
    "pronunciation": "SAH-ad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b38",
    "name": "Saeed",
    "arabic": "سَعِيد",
    "meaning": "Happy, prosperous, blessed",
    "origin": "Arabic classic",
    "pronunciation": "Sah-EED",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b39",
    "name": "Abdur-Rahman",
    "arabic": "عَبْدُ الرَّحْمَن",
    "meaning": "Servant of the Most Compassionate",
    "origin": "Abdur-Rahman ibn Awf (RA)",
    "pronunciation": "Ab-dur-Rah-MAHN",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b40",
    "name": "Abu Ubaidah",
    "arabic": "أَبُو عُبَيْدَة",
    "meaning": "Trustee of this Ummah",
    "origin": "Abu Ubaidah ibn Al-Jarrah (RA)",
    "pronunciation": "Ah-boo Oo-BAY-dah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b41",
    "name": "Khalid",
    "arabic": "خَالِد",
    "meaning": "Enduring victor, sword of Allah",
    "origin": "Khalid ibn Al-Walid (RA)",
    "pronunciation": "KHAH-lid",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b42",
    "name": "Salman",
    "arabic": "سَلْمَان",
    "meaning": "Seeker of ultimate truth, peace",
    "origin": "Salman Al-Farsi (RA)",
    "pronunciation": "Sal-MAHN",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b43",
    "name": "Abu Dharr",
    "arabic": "أَبُو ذَرّ",
    "meaning": "Possessor of light, ascetic hero",
    "origin": "Abu Dharr Al-Ghifari (RA)",
    "pronunciation": "Ah-boo DHARR",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b44",
    "name": "Miqdad",
    "arabic": "مِقْدَاد",
    "meaning": "Courageous warrior, brave defender",
    "origin": "Al-Miqdad ibn Amr (RA)",
    "pronunciation": "Mik-DAHD",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b45",
    "name": "Ammar",
    "arabic": "عَمَّار",
    "meaning": "Builder of faith, pious",
    "origin": "Ammar ibn Yasir (RA)",
    "pronunciation": "Am-MAHR",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b46",
    "name": "Hudhayfah",
    "arabic": "حُذَيْفَة",
    "meaning": "Discreet, keeper of secrets",
    "origin": "Hudhayfah ibn Al-Yaman (RA)",
    "pronunciation": "Hoo-dhay-FAH",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b47",
    "name": "Muadh",
    "arabic": "مُعَاذ",
    "meaning": "Protected by Allah, scholar of Halal",
    "origin": "Mu’adh ibn Jabal (RA)",
    "pronunciation": "Moo-AHDH",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b48",
    "name": "Musab",
    "arabic": "مُصْعَب",
    "meaning": "Enduring ambassador of Islam",
    "origin": "Mus’ab ibn Umayr (RA)",
    "pronunciation": "MOOS-ab",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b49",
    "name": "Usamah",
    "arabic": "أُسَامَة",
    "meaning": "Brave lion, beloved commander",
    "origin": "Usamah ibn Zaid (RA)",
    "pronunciation": "Oo-SAH-mah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b50",
    "name": "Anas",
    "arabic": "أَنَس",
    "meaning": "Affection, friendly companion",
    "origin": "Anas ibn Malik (RA)",
    "pronunciation": "AH-nas",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b51",
    "name": "Jabir",
    "arabic": "جَابِر",
    "meaning": "Consoler of the broken-hearted",
    "origin": "Jabir ibn Abdullah (RA)",
    "pronunciation": "JAH-bir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b52",
    "name": "Jafar",
    "arabic": "جَعْفَر",
    "meaning": "Stream of Paradise, flying martyr",
    "origin": "Jafar ibn Abi Talib (RA)",
    "pronunciation": "JAH-far",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b53",
    "name": "Abdullah",
    "arabic": "عَبْدُ اللَّه",
    "meaning": "Servant of Allah (Beloved name)",
    "origin": "Abdullah ibn Mas’ud (RA)",
    "pronunciation": "Ab-dool-LAH",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b54",
    "name": "Abdullah ibn Abbas",
    "arabic": "ابْنُ عَبَّاس",
    "meaning": "Scholar of the Quran, interpreter",
    "origin": "Ibn Abbas (RA)",
    "pronunciation": "Ibn Ahb-BAHS",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b55",
    "name": "Abdullah ibn Umar",
    "arabic": "ابْنُ عُمَر",
    "meaning": "Strict follower of the Sunnah",
    "origin": "Ibn Umar (RA)",
    "pronunciation": "Ibn OO-mar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b56",
    "name": "Ubayy",
    "arabic": "أُبَيّ",
    "meaning": "High-spirited, master reciter",
    "origin": "Ubayy ibn Ka’b (RA)",
    "pronunciation": "Oo-BAYY",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b57",
    "name": "Thabit",
    "arabic": "ثَابِت",
    "meaning": "Steadfast orator of the Prophet",
    "origin": "Thabit ibn Qais (RA)",
    "pronunciation": "THAH-bit",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b58",
    "name": "Suhayb",
    "arabic": "صُهَيْب",
    "meaning": "Roman companion who sacrificed wealth",
    "origin": "Suhayb Ar-Rumi (RA)",
    "pronunciation": "Soo-HAYB",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b59",
    "name": "Tamim",
    "arabic": "تَمِيم",
    "meaning": "Complete, perfected in character",
    "origin": "Tamim Al-Dari (RA)",
    "pronunciation": "Tah-MEEM",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b60",
    "name": "Qais",
    "arabic": "قَيْس",
    "meaning": "Firm measure, strength",
    "origin": "Qais ibn Saad (RA)",
    "pronunciation": "KAYS",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b61",
    "name": "Nuaym",
    "arabic": "نُعَيْم",
    "meaning": "Gentle soul blessed with peace",
    "origin": "Nu’aym ibn Mas’ud (RA)",
    "pronunciation": "Noo-AYM",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b62",
    "name": "Baraa",
    "arabic": "بَرَاء",
    "meaning": "Innocence, purity, hero of Yamamah",
    "origin": "Al-Baraa ibn Malik (RA)",
    "pronunciation": "Bah-RAH",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b63",
    "name": "Salamah",
    "arabic": "سَلَمَة",
    "meaning": "Peace, safety, swift runner",
    "origin": "Salamah ibn Al-Akwa (RA)",
    "pronunciation": "Sah-LAH-mah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b64",
    "name": "Khabbab",
    "arabic": "خَبَّاب",
    "meaning": "Enduring believer of truth",
    "origin": "Khabbab ibn Al-Aratt (RA)",
    "pronunciation": "Khab-BAHB",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b65",
    "name": "Amr",
    "arabic": "عَمْرُو",
    "meaning": "Long-lived, prosperous builder",
    "origin": "Amr ibn Al-Aas (RA)",
    "pronunciation": "AMR",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b66",
    "name": "Shurahbil",
    "arabic": "شُرَحْبِيل",
    "meaning": "Brave commander of Levant",
    "origin": "Shurahbil ibn Hasana (RA)",
    "pronunciation": "Shoo-rah-BEEL",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b67",
    "name": "Yazid ibn Abi Sufyan",
    "arabic": "يَزِيد",
    "meaning": "Righteous commander",
    "origin": "Sahabi commander",
    "pronunciation": "Yah-ZEED",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b68",
    "name": "Abu Ayyub",
    "arabic": "أَبُو أَيُّوب",
    "meaning": "Host of the Prophet in Madinah",
    "origin": "Abu Ayyub Al-Ansari (RA)",
    "pronunciation": "Ah-boo Ay-YOOB",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b69",
    "name": "Asim",
    "arabic": "عَاصِم",
    "meaning": "Protector from harm",
    "origin": "Asim ibn Thabit (RA)",
    "pronunciation": "AH-sim",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b70",
    "name": "Hanzalah",
    "arabic": "حَنْظَلَة",
    "meaning": "Washed by the angels at Uhud",
    "origin": "Hanzalah ibn Abi Amir (RA)",
    "pronunciation": "Han-ZAH-lah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b71",
    "name": "Sahl",
    "arabic": "سَهْل",
    "meaning": "Easy-going, generous spirit",
    "origin": "Sahl ibn Saad (RA)",
    "pronunciation": "SAHL",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b72",
    "name": "Safwan",
    "arabic": "صَفْوَان",
    "meaning": "Pure shining stone",
    "origin": "Safwan ibn Umayyah (RA)",
    "pronunciation": "Saf-WAHN",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b73",
    "name": "Ubadah",
    "arabic": "عُبَادَة",
    "meaning": "Devoted worshipper of Allah",
    "origin": "Ubadah ibn Al-Samit (RA)",
    "pronunciation": "Oo-BAH-dah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b74",
    "name": "Hassan",
    "arabic": "حَسَّان",
    "meaning": "Poet of the Prophet (ﷺ)",
    "origin": "Hassan ibn Thabit (RA)",
    "pronunciation": "Has-SAHN",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b75",
    "name": "Kaab",
    "arabic": "كَعْب",
    "meaning": "Noble elevated station, poet",
    "origin": "Ka’b ibn Malik (RA)",
    "pronunciation": "KAHB",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b76",
    "name": "Abdul-Ahad",
    "arabic": "عَبْدُ الأَحَد",
    "meaning": "Servant of the Only One",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-AH-had",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b77",
    "name": "Abdul-Alim",
    "arabic": "عَبْدُ الْعَلِيم",
    "meaning": "Servant of the All-Knowing",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Ah-LEEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b78",
    "name": "Abdul-Azim",
    "arabic": "عَبْدُ الْعَظِيم",
    "meaning": "Servant of the Magnificent",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Ah-ZEEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b79",
    "name": "Abdul-Aziz",
    "arabic": "عَبْدُ الْعَزِيز",
    "meaning": "Servant of the Almighty",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Ah-ZEEZ",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b80",
    "name": "Abdul-Badi",
    "arabic": "عَبْدُ الْبَدِيع",
    "meaning": "Servant of the Incomparable Originator",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Bah-DEE",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b81",
    "name": "Abdul-Baqi",
    "arabic": "عَبْدُ الْبَاقِي",
    "meaning": "Servant of the Everlasting",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-BAH-kee",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b82",
    "name": "Abdul-Bari",
    "arabic": "عَبْدُ الْبَارِئ",
    "meaning": "Servant of the Evolver",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-BAH-ree",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b83",
    "name": "Abdul-Basir",
    "arabic": "عَبْدُ الْبَصِير",
    "meaning": "Servant of the All-Seeing",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Bah-SEER",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b84",
    "name": "Abdul-Basit",
    "arabic": "عَبْدُ الْبَاسِط",
    "meaning": "Servant of the Expander",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-BAH-sit",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b85",
    "name": "Abdul-Fattah",
    "arabic": "عَبْدُ الْفَتَّاح",
    "meaning": "Servant of the Opener of Doors",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Fat-TAH",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b86",
    "name": "Abdul-Ghaffar",
    "arabic": "عَبْدُ الْغَفَّار",
    "meaning": "Servant of the Great Forgiver",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Ghaf-FAHR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b87",
    "name": "Abdul-Ghafur",
    "arabic": "عَبْدُ الْغَفُور",
    "meaning": "Servant of the All-Forgiving",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Gha-FOOR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b88",
    "name": "Abdul-Hadi",
    "arabic": "عَبْدُ الْهَادِي",
    "meaning": "Servant of the Supreme Guide",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-HAH-dee",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b89",
    "name": "Abdul-Hafiz",
    "arabic": "عَبْدُ الْحَفِيظ",
    "meaning": "Servant of the Preserver",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Hah-FEEZ",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b90",
    "name": "Abdul-Hakim",
    "arabic": "عَبْدُ الْحَكِيم",
    "meaning": "Servant of the Perfectly Wise",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Hah-KEEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b91",
    "name": "Abdul-Halim",
    "arabic": "عَبْدُ الْحَلِيم",
    "meaning": "Servant of the Forbearing",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Hah-LEEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b92",
    "name": "Abdul-Hamid",
    "arabic": "عَبْدُ الْحَمِيد",
    "meaning": "Servant of the All-Praiseworthy",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Hah-MEED",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b93",
    "name": "Abdul-Haqq",
    "arabic": "عَبْدُ الْحَقّ",
    "meaning": "Servant of the Absolute Truth",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-HAKK",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b94",
    "name": "Abdul-Hasib",
    "arabic": "عَبْدُ الْحَسِيب",
    "meaning": "Servant of the Reckoner",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Hah-SEEB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b95",
    "name": "Abdul-Hayy",
    "arabic": "عَبْدُ الْحَيّ",
    "meaning": "Servant of the Ever-Living",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-HAYY",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b96",
    "name": "Abdul-Jabbar",
    "arabic": "عَبْدُ الْجَبَّار",
    "meaning": "Servant of the Irresistible",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Jahb-BAHR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b97",
    "name": "Abdul-Jalil",
    "arabic": "عَبْدُ الْجَلِيل",
    "meaning": "Servant of the Majestic",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Jah-LEEL",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b98",
    "name": "Abdul-Kabir",
    "arabic": "عَبْدُ الْكَبِير",
    "meaning": "Servant of the Greatest",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Kah-BEER",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b99",
    "name": "Abdul-Karim",
    "arabic": "عَبْدُ الْكَرِيم",
    "meaning": "Servant of the Most Generous",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Kah-REEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b100",
    "name": "Abdul-Khabir",
    "arabic": "عَبْدُ الْخَبِير",
    "meaning": "Servant of the All-Aware",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Khah-BEER",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b101",
    "name": "Abdul-Khaliq",
    "arabic": "عَبْدُ الْخَالِق",
    "meaning": "Servant of the Creator",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-KHAH-lik",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b102",
    "name": "Abdul-Latif",
    "arabic": "عَبْدُ اللَّطِيف",
    "meaning": "Servant of the Subtle & Kind",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Lah-TEEF",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b103",
    "name": "Abdul-Majid",
    "arabic": "عَبْدُ الْمَجِيد",
    "meaning": "Servant of the All-Glorious",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Mah-JEED",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b104",
    "name": "Abdul-Malik",
    "arabic": "عَبْدُ الْمَلِك",
    "meaning": "Servant of the Sovereign King",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-MAH-lik",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b105",
    "name": "Abdul-Matin",
    "arabic": "عَبْدُ الْمَتِين",
    "meaning": "Servant of the Firm & Steadfast",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Mah-TEEN",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b106",
    "name": "Abdul-Muqtadir",
    "arabic": "عَبْدُ الْمُقْتَدِر",
    "meaning": "Servant of the Omnipotent",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Mook-tah-DIR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b107",
    "name": "Abdul-Mumin",
    "arabic": "عَبْدُ الْمُؤْمِن",
    "meaning": "Servant of the Guardian of Faith",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-MOO-min",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b108",
    "name": "Abdul-Muhaymin",
    "arabic": "عَبْدُ الْمُهَيْمِن",
    "meaning": "Servant of the Overseer",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Moo-HAY-min",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b109",
    "name": "Abdul-Mujib",
    "arabic": "عَبْدُ الْمُجِيب",
    "meaning": "Servant of the Responsive to Prayer",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Moo-JEEB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b110",
    "name": "Abdul-Muizz",
    "arabic": "عَبْدُ الْمُعِزّ",
    "meaning": "Servant of the Bestower of Honor",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Moo-EZZ",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b111",
    "name": "Abdul-Nasir",
    "arabic": "عَبْدُ النَّاصِر",
    "meaning": "Servant of the Helper & Victor",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-doon-NAH-sir",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b112",
    "name": "Abdul-Qadir",
    "arabic": "عَبْدُ الْقَادِر",
    "meaning": "Servant of the All-Capable",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-KAH-dir",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b113",
    "name": "Abdul-Qahhar",
    "arabic": "عَبْدُ الْقَهَّار",
    "meaning": "Servant of the Subduer",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Kah-HAHR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b114",
    "name": "Abdul-Qawiyy",
    "arabic": "عَبْدُ الْقَوِيّ",
    "meaning": "Servant of the All-Strong",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Kah-WEE",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b115",
    "name": "Abdul-Qayyum",
    "arabic": "عَبْدُ الْقَيُّوم",
    "meaning": "Servant of the Self-Subsisting",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Kay-YOOM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b116",
    "name": "Abdul-Quddus",
    "arabic": "عَبْدُ الْقُدُّوس",
    "meaning": "Servant of the Most Holy",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Kood-DOOS",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b117",
    "name": "Abdul-Rafi",
    "arabic": "عَبْدُ الرَّافِع",
    "meaning": "Servant of the Exalter",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dur-RAH-fee",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b118",
    "name": "Abdul-Rahim",
    "arabic": "عَبْدُ الرَّحِيم",
    "meaning": "Servant of the Merciful",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dur-Rah-HEEM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b119",
    "name": "Abdul-Rashid",
    "arabic": "عَبْدُ الرَّشِيد",
    "meaning": "Servant of the Righteous Guide",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dur-Rah-SHEED",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b120",
    "name": "Abdul-Rauf",
    "arabic": "عَبْدُ الرَّءُوف",
    "meaning": "Servant of the Most Kind",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dur-Rah-OOF",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b121",
    "name": "Abdul-Razzaq",
    "arabic": "عَبْدُ الرَّزَّاق",
    "meaning": "Servant of the Provider",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dur-Raz-ZAHK",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b122",
    "name": "Abdul-Sabur",
    "arabic": "عَبْدُ الصَّبُور",
    "meaning": "Servant of the Most Patient",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-doos-Sah-BOOR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b123",
    "name": "Abdul-Salam",
    "arabic": "عَبْدُ السَّلَام",
    "meaning": "Servant of the Source of Peace",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-doos-Sah-LAHM",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b124",
    "name": "Abdul-Samad",
    "arabic": "عَبْدُ الصَّمَد",
    "meaning": "Servant of the Eternal Refuge",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-doos-SAH-mad",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b125",
    "name": "Abdul-Shakur",
    "arabic": "عَبْدُ الشَّكُور",
    "meaning": "Servant of the Appreciative",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-doosh-Shah-KOOR",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b126",
    "name": "Abdul-Tawwab",
    "arabic": "عَبْدُ التَّوَّاب",
    "meaning": "Servant of the Acceptor of Repentance",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-doot-Taw-WAHB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b127",
    "name": "Abdul-Wahhab",
    "arabic": "عَبْدُ الْوَهَّاب",
    "meaning": "Servant of the Supreme Bestower",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Wah-HAHB",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b128",
    "name": "Abdul-Wahid",
    "arabic": "عَبْدُ الْوَاحِد",
    "meaning": "Servant of the One God",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-WAH-hid",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b129",
    "name": "Abdul-Wakil",
    "arabic": "عَبْدُ الْوَكِيل",
    "meaning": "Servant of the Supreme Trustee",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Wah-KEEL",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b130",
    "name": "Abdul-Wali",
    "arabic": "عَبْدُ الْوَلِيّ",
    "meaning": "Servant of the Protecting Friend",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-Wah-LEE",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b131",
    "name": "Abdul-Warith",
    "arabic": "عَبْدُ الْوَارِث",
    "meaning": "Servant of the Supreme Inheritor",
    "origin": "Quranic Divine Name",
    "pronunciation": "Ab-dool-WAH-rith",
    "isQuranic": true,
    "gender": "boy"
  },
  {
    "id": "b132",
    "name": "Aaban",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aaban",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aaban",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b133",
    "name": "Aabis",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aabis",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aabis",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b134",
    "name": "Aadam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aadam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aadam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b135",
    "name": "Aadil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aadil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aadil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b136",
    "name": "Aafeen",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aafeen",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aafeen",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b137",
    "name": "Aafaq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aafaq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aafaq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b138",
    "name": "Aafiq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aafiq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aafiq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b139",
    "name": "Aahil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aahil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aahil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b140",
    "name": "Aakif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aakif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aakif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b141",
    "name": "Aalim",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aalim",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aalim",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b142",
    "name": "Aamil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aamil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aamil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b143",
    "name": "Aamir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aamir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aamir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b144",
    "name": "Aaqib",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aaqib",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aaqib",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b145",
    "name": "Aaqil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aaqil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aaqil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b146",
    "name": "Aarif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aarif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aarif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b147",
    "name": "Aariz",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aariz",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aariz",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b148",
    "name": "Aashir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aashir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aashir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b149",
    "name": "Aasif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aasif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aasif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b150",
    "name": "Aasim",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aasim",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aasim",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b151",
    "name": "Aatif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aatif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aatif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b152",
    "name": "Aatifur",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aatifur",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aatifur",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b153",
    "name": "Aatiq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aatiq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aatiq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b154",
    "name": "Abaan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abaan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abaan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b155",
    "name": "Abbad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abbad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abbad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b156",
    "name": "Abbas",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abbas",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abbas",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b157",
    "name": "Abbud",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abbud",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abbud",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b158",
    "name": "Abdel",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abdel",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abdel",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b159",
    "name": "Abdiel",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abdiel",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abdiel",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b160",
    "name": "Abduh",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abduh",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abduh",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b161",
    "name": "Abed",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abed",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abed",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b162",
    "name": "Abeed",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abeed",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abeed",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b163",
    "name": "Abid",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abid",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abid",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b164",
    "name": "Abis",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abis",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abis",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b165",
    "name": "Abrash",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abrash",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abrash",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b166",
    "name": "Absar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Absar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Absar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b167",
    "name": "Abu",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abu",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abu",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b168",
    "name": "Abubakar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abubakar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abubakar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b169",
    "name": "Abyad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Abyad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Abyad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b170",
    "name": "Adan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b171",
    "name": "Adeeb",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adeeb",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adeeb",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b172",
    "name": "Adel",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adel",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adel",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b173",
    "name": "Adham",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adham",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adham",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b174",
    "name": "Adib",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adib",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adib",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b175",
    "name": "Adil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b176",
    "name": "Adli",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adli",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adli",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b177",
    "name": "Adnan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Adnan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Adnan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b178",
    "name": "Afan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Afan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Afan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b179",
    "name": "Afeef",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Afeef",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Afeef",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b180",
    "name": "Affan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Affan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Affan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b181",
    "name": "Afif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Afif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Afif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b182",
    "name": "Aflah",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aflah",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aflah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b183",
    "name": "Afnan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Afnan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Afnan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b184",
    "name": "Afraz",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Afraz",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Afraz",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b185",
    "name": "Afzal",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Afzal",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Afzal",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b186",
    "name": "Ahad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b187",
    "name": "Ahbab",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahbab",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahbab",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b188",
    "name": "Ahdaf",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahdaf",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahdaf",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b189",
    "name": "Ahil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b190",
    "name": "Ahkam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahkam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahkam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b191",
    "name": "Ahlam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahlam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahlam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b192",
    "name": "Ahnaf",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahnaf",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahnaf",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b193",
    "name": "Ahraz",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahraz",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahraz",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b194",
    "name": "Ahsan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahsan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahsan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b195",
    "name": "Ahwas",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahwas",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahwas",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b196",
    "name": "Ahyan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ahyan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ahyan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b197",
    "name": "Aid",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aid",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aid",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b198",
    "name": "Aiman",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aiman",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aiman",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b199",
    "name": "Aish",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aish",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aish",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b200",
    "name": "Aiyub",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aiyub",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aiyub",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b201",
    "name": "Ajmal",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ajmal",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ajmal",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b202",
    "name": "Akbar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Akbar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Akbar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b203",
    "name": "Akif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Akif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Akif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b204",
    "name": "Akmal",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Akmal",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Akmal",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b205",
    "name": "Akram",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Akram",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Akram",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b206",
    "name": "Al-Amin",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Al-Amin",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Al-Amin",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b207",
    "name": "Al-Bara",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Al-Bara",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Al-Bara",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b208",
    "name": "Al-Hakam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Al-Hakam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Al-Hakam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b209",
    "name": "Al-Hasan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Al-Hasan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Al-Hasan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b210",
    "name": "Al-Husayn",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Al-Husayn",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Al-Husayn",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b211",
    "name": "Al-Muizz",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Al-Muizz",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Al-Muizz",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b212",
    "name": "Alaa",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Alaa",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Alaa",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b213",
    "name": "Aladdin",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aladdin",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aladdin",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b214",
    "name": "Alam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Alam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Alam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b215",
    "name": "Alamin",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Alamin",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Alamin",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b216",
    "name": "Aleem",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aleem",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aleem",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b217",
    "name": "Alim",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Alim",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Alim",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b218",
    "name": "Altaf",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Altaf",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Altaf",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b219",
    "name": "Alwan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Alwan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Alwan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b220",
    "name": "Amaan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amaan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amaan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b221",
    "name": "Amal",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amal",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amal",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b222",
    "name": "Aman",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aman",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aman",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b223",
    "name": "Amanat",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amanat",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amanat",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b224",
    "name": "Amanullah",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amanullah",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amanullah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b225",
    "name": "Ameer",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ameer",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ameer",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b226",
    "name": "Amid",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amid",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amid",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b227",
    "name": "Amin",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amin",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amin",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b228",
    "name": "Amir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b229",
    "name": "Amjad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Amjad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Amjad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b230",
    "name": "Anees",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Anees",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Anees",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b231",
    "name": "Aniq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aniq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aniq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b232",
    "name": "Anis",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Anis",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Anis",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b233",
    "name": "Ansar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ansar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ansar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b234",
    "name": "Ansari",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ansari",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ansari",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b235",
    "name": "Antar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Antar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Antar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b236",
    "name": "Anwar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Anwar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Anwar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b237",
    "name": "Aqeel",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aqeel",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aqeel",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b238",
    "name": "Aqib",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aqib",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aqib",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b239",
    "name": "Aqil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aqil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aqil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b240",
    "name": "Arafat",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arafat",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arafat",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b241",
    "name": "Arbab",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arbab",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arbab",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b242",
    "name": "Areeb",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Areeb",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Areeb",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b243",
    "name": "Arfan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arfan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arfan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b244",
    "name": "Arham",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arham",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arham",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b245",
    "name": "Arib",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arib",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arib",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b246",
    "name": "Arif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b247",
    "name": "Arman",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arman",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arman",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b248",
    "name": "Arqam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arqam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arqam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b249",
    "name": "Arsalan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arsalan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arsalan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b250",
    "name": "Arshad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arshad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arshad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b251",
    "name": "Arslan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Arslan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Arslan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b252",
    "name": "Asad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b253",
    "name": "Asadullah",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asadullah",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asadullah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b254",
    "name": "Asaduzzaman",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asaduzzaman",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asaduzzaman",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b255",
    "name": "Asghar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asghar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asghar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b256",
    "name": "Ashfaq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ashfaq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ashfaq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b257",
    "name": "Ashiq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ashiq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ashiq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b258",
    "name": "Ashraf",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ashraf",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ashraf",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b259",
    "name": "Asif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b260",
    "name": "Asil",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asil",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asil",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b261",
    "name": "Aslam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aslam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aslam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b262",
    "name": "Asmar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Asmar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Asmar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b263",
    "name": "Ata",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ata",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ata",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b264",
    "name": "Ataullah",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ataullah",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ataullah",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b265",
    "name": "Ateeq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ateeq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ateeq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b266",
    "name": "Athar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Athar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Athar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b267",
    "name": "Atif",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Atif",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Atif",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b268",
    "name": "Atiq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Atiq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Atiq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b269",
    "name": "Attar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Attar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Attar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b270",
    "name": "Awad",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Awad",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Awad",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b271",
    "name": "Awais",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Awais",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Awais",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b272",
    "name": "Awan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Awan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Awan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b273",
    "name": "Awn",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Awn",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Awn",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b274",
    "name": "Aws",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aws",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aws",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b275",
    "name": "Ayaz",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ayaz",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ayaz",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b276",
    "name": "Ayham",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ayham",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ayham",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b277",
    "name": "Ayman",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ayman",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ayman",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b278",
    "name": "Ayoob",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ayoob",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ayoob",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b279",
    "name": "Ayub",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Ayub",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Ayub",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b280",
    "name": "Azam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b281",
    "name": "Azeem",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azeem",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azeem",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b282",
    "name": "Azhar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azhar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azhar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b283",
    "name": "Azim",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azim",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azim",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b284",
    "name": "Aziz",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Aziz",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Aziz",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b285",
    "name": "Azlan",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azlan",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azlan",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b286",
    "name": "Azmat",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azmat",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azmat",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b287",
    "name": "Azraq",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azraq",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azraq",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b288",
    "name": "Azwar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Azwar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Azwar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b289",
    "name": "Baahir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Baahir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Baahir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b290",
    "name": "Badi",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Badi",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Badi",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b291",
    "name": "Badr",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Badr",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Badr",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b292",
    "name": "Badri",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Badri",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Badri",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b293",
    "name": "Baha",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Baha",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Baha",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b294",
    "name": "Bahauddin",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bahauddin",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bahauddin",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b295",
    "name": "Bahij",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bahij",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bahij",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b296",
    "name": "Bahir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bahir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bahir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b297",
    "name": "Bakir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bakir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bakir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b298",
    "name": "Bakr",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bakr",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bakr",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b299",
    "name": "Baleegh",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Baleegh",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Baleegh",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b300",
    "name": "Baligh",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Baligh",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Baligh",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b301",
    "name": "Bara",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bara",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bara",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b302",
    "name": "Barakat",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Barakat",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Barakat",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b303",
    "name": "Bari",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bari",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bari",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b304",
    "name": "Barkat",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Barkat",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Barkat",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b305",
    "name": "Basam",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Basam",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Basam",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b306",
    "name": "Baseer",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Baseer",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Baseer",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b307",
    "name": "Bashaar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bashaar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bashaar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b308",
    "name": "Bashar",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bashar",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bashar",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b309",
    "name": "Basheer",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Basheer",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Basheer",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "b310",
    "name": "Bashir",
    "arabic": "عَرَبي",
    "meaning": "Noble, honorable Islamic name signifying virtues of Bashir",
    "origin": "Arabic linguistic heritage & Islamic traditions",
    "pronunciation": "Bashir",
    "isQuranic": false,
    "gender": "boy"
  },
  {
    "id": "g1",
    "name": "Maryam",
    "arabic": "مَرْيَم",
    "meaning": "Pious worshipper, mother of Prophet Isa",
    "origin": "Surah Maryam (19:1)",
    "pronunciation": "MAR-yam",
    "isQuranic": true,
    "gender": "girl",
    "virtue": "Chosen above all women of the worlds"
  },
  {
    "id": "g2",
    "name": "Khadijah",
    "arabic": "خَدِيجَة",
    "meaning": "First believer, Mother of the Believers",
    "origin": "Khadijah bint Khuwaylid (RA)",
    "pronunciation": "Khah-DEE-jah",
    "isQuranic": false,
    "gender": "girl",
    "virtue": "The first to embrace Islam"
  },
  {
    "id": "g3",
    "name": "Aisha",
    "arabic": "عَائِشَة",
    "meaning": "Living, prosperous, scholar of Hadith",
    "origin": "Aisha bint Abi Bakr (RA)",
    "pronunciation": "Ah-EE-shah",
    "isQuranic": false,
    "gender": "girl",
    "virtue": "Mother of the Believers"
  },
  {
    "id": "g4",
    "name": "Fatima",
    "arabic": "فَاطِمَة",
    "meaning": "Chaste, luminous leader of women in Paradise",
    "origin": "Fatima Az-Zahra (RA)",
    "pronunciation": "FAH-tee-mah",
    "isQuranic": false,
    "gender": "girl",
    "virtue": "Beloved daughter of the Prophet"
  },
  {
    "id": "g5",
    "name": "Zainab",
    "arabic": "زَيْنَب",
    "meaning": "Fragrant blossoming tree, ornament of father",
    "origin": "Zainab bint Muhammad (RA)",
    "pronunciation": "ZAY-nab",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g6",
    "name": "Ruqayyah",
    "arabic": "رُقَيَّة",
    "meaning": "Gentle, rising high in nobility",
    "origin": "Ruqayyah bint Muhammad (RA)",
    "pronunciation": "Roo-KAY-yah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g7",
    "name": "Umm Kulthum",
    "arabic": "أُمّ كُلْثُوم",
    "meaning": "One with full lovely face, noble daughter",
    "origin": "Umm Kulthum bint Muhammad",
    "pronunciation": "Oomm Kool-THOOM",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g8",
    "name": "Asiya",
    "arabic": "آسِيَة",
    "meaning": "Pillar of faith, comforter, queen of Jannah",
    "origin": "Wife of Pharaoh (Surah At-Tahrim 66:11)",
    "pronunciation": "AH-see-yah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g9",
    "name": "Hajar",
    "arabic": "هَاجَر",
    "meaning": "Mother of Ismail, origin of Zamzam",
    "origin": "Hajar (AS), Safa & Marwah",
    "pronunciation": "HAH-jar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g10",
    "name": "Sarah",
    "arabic": "سَارَة",
    "meaning": "Noble princess, joyful laughter",
    "origin": "Wife of Prophet Ibrahim (AS)",
    "pronunciation": "SAH-rah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g11",
    "name": "Safiyyah",
    "arabic": "صَفِيَّة",
    "meaning": "Pure, chosen companion",
    "origin": "Safiyyah bint Huyayy (RA)",
    "pronunciation": "Sah-FEE-yah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g12",
    "name": "Hafsah",
    "arabic": "حَفْصَة",
    "meaning": "Young lioness, preserver of the 1st Mushaf",
    "origin": "Hafsah bint Umar (RA)",
    "pronunciation": "HAF-sah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g13",
    "name": "Sawdah",
    "arabic": "سَوْدَة",
    "meaning": "Generous, palm garden oasis",
    "origin": "Sawdah bint Zam’ah (RA)",
    "pronunciation": "SAW-dah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g14",
    "name": "Juwayriyah",
    "arabic": "جُوَيْرِيَة",
    "meaning": "Little young maiden, bringer of freedom",
    "origin": "Juwayriyah bint Al-Harith (RA)",
    "pronunciation": "Joo-way-REE-yah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g15",
    "name": "Maymunah",
    "arabic": "مَيْمُونَة",
    "meaning": "Blessed, auspicious, trustworthy",
    "origin": "Maymunah bint Al-Harith (RA)",
    "pronunciation": "May-MOO-nah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g16",
    "name": "Umm Habibah",
    "arabic": "أُمّ حَبِيبَة",
    "meaning": "Mother of beloved, steadfast emigrant",
    "origin": "Ramlah bint Abi Sufyan (RA)",
    "pronunciation": "Oomm Hah-BEE-bah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g17",
    "name": "Asma",
    "arabic": "أَسْمَاء",
    "meaning": "Sublime, high station, Dhat an-Nitaqayn",
    "origin": "Asma bint Abi Bakr (RA)",
    "pronunciation": "As-MAH",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g18",
    "name": "Sumayyah",
    "arabic": "سُمَيَّة",
    "meaning": "Exalted, first martyr of Islam",
    "origin": "Sumayyah bint Khayyat (RA)",
    "pronunciation": "Soo-MAY-yah",
    "isQuranic": false,
    "gender": "girl",
    "virtue": "First martyr in Islam"
  },
  {
    "id": "g19",
    "name": "Nusaybah",
    "arabic": "نُسَيْبَة",
    "meaning": "Noble lineage, heroic defender at Uhud",
    "origin": "Nusaybah bint Ka’ab (Umm Umarah)",
    "pronunciation": "Noo-SAY-bah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g20",
    "name": "Khawlah",
    "arabic": "خَوْلَة",
    "meaning": "Graceful gazelle, valiant heroine of Yarmouk",
    "origin": "Khawlah bint Al-Azwar (RA)",
    "pronunciation": "KHAW-lah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g21",
    "name": "Shifaa",
    "arabic": "شِفَاء",
    "meaning": "Cure, healing, first female market supervisor",
    "origin": "Surah Al-Isra (17:82)",
    "pronunciation": "Shee-FAH",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g22",
    "name": "Lubabah",
    "arabic": "لُبَابَة",
    "meaning": "Purest essence, intellect",
    "origin": "Lubabah bint Al-Harith (Umm Al-Fadl)",
    "pronunciation": "Loo-BAH-bah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g23",
    "name": "Barakah",
    "arabic": "بَرَكَة",
    "meaning": "Divine blessing, Umm Ayman",
    "origin": "Umm Ayman (RA)",
    "pronunciation": "BAH-rah-kah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g24",
    "name": "Halimah",
    "arabic": "حَلِيمَة",
    "meaning": "Gentle, patient, foster mother of Prophet",
    "origin": "Halimah As-Sa’diyyah (RA)",
    "pronunciation": "Hah-LEE-mah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g25",
    "name": "Aaminah",
    "arabic": "آمِنَة",
    "meaning": "Tranquil, peaceful, mother of the Prophet",
    "origin": "Aaminah bint Wahb",
    "pronunciation": "AH-mee-nah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g26",
    "name": "Salma",
    "arabic": "سَلْمَى",
    "meaning": "Safe, peaceful, flawless in faith",
    "origin": "Salma Umm Al-Khair (RA)",
    "pronunciation": "SAL-mah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g27",
    "name": "Hind",
    "arabic": "هِنْد",
    "meaning": "Noble heritage, brave woman",
    "origin": "Umm Salamah (Hind bint Abi Umayyah)",
    "pronunciation": "HIND",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g28",
    "name": "Arwa",
    "arabic": "أَرْوَى",
    "meaning": "Graceful gazelle, pure fresh water",
    "origin": "Arwa bint Abdul-Muttalib (RA)",
    "pronunciation": "AR-wah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g29",
    "name": "Atikah",
    "arabic": "عَاتِكَة",
    "meaning": "Pure, chaste, fragrant noble lady",
    "origin": "Atikah bint Zayd (RA)",
    "pronunciation": "Ah-TEE-kah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g30",
    "name": "Layla",
    "arabic": "لَيْلَى",
    "meaning": "Enchanting night, deep beauty",
    "origin": "Surah Al-Layl (92:1)",
    "pronunciation": "LAY-lah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g31",
    "name": "Noor",
    "arabic": "نُور",
    "meaning": "Divine light, radiance of faith",
    "origin": "Surah An-Nur (24:35)",
    "pronunciation": "NOOR",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g32",
    "name": "Amani",
    "arabic": "أَمَانِي",
    "meaning": "Noble aspirations, heavenly wishes",
    "origin": "Surah Al-Baqarah (2:78)",
    "pronunciation": "Ah-MAH-nee",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g33",
    "name": "Amira",
    "arabic": "أَمِيرَة",
    "meaning": "Princess, leader of goodness",
    "origin": "Arabic classic",
    "pronunciation": "Ah-MEE-rah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g34",
    "name": "Anfal",
    "arabic": "أَنْفَال",
    "meaning": "Gifts of grace, spoils of war",
    "origin": "Surah Al-Anfal (8:1)",
    "pronunciation": "An-FAHL",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g35",
    "name": "Anisa",
    "arabic": "أَنِيسَة",
    "meaning": "Friendly, affectionate companion",
    "origin": "Arabic classic",
    "pronunciation": "Ah-NEE-sah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g36",
    "name": "Areej",
    "arabic": "أَرِيج",
    "meaning": "Sweet pleasant fragrance of blooms",
    "origin": "Arabic poetry",
    "pronunciation": "Ah-REEJ",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g37",
    "name": "Aya",
    "arabic": "آيَة",
    "meaning": "Divine sign, miraculous verse of Quran",
    "origin": "Surah Al-Baqarah (2:106)",
    "pronunciation": "AH-yah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g38",
    "name": "Ayat",
    "arabic": "آيَات",
    "meaning": "Signs of Allah’s majesty",
    "origin": "Surah Al-Jathiyah (45:6)",
    "pronunciation": "Ah-YAHT",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g39",
    "name": "Aziza",
    "arabic": "عَزِيزَة",
    "meaning": "Precious, esteemed, cherished",
    "origin": "Arabic root Izz",
    "pronunciation": "Ah-ZEE-zah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g40",
    "name": "Badriyah",
    "arabic": "بَدْرِيَّة",
    "meaning": "Radiant like the full moon of Badr",
    "origin": "Surah Al-Imran (3:123)",
    "pronunciation": "Bad-REE-yah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g41",
    "name": "Bahira",
    "arabic": "بَاهِرَة",
    "meaning": "Dazzling, brilliant, magnificent",
    "origin": "Arabic classic",
    "pronunciation": "Bah-HEE-rah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g42",
    "name": "Balqis",
    "arabic": "بَلْقِيس",
    "meaning": "Queen of Sheba who submitted to Allah",
    "origin": "Surah An-Naml (27:44)",
    "pronunciation": "Bal-KEES",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g43",
    "name": "Basma",
    "arabic": "بَسْمَة",
    "meaning": "Gentle radiant smile",
    "origin": "Arabic virtue",
    "pronunciation": "BAS-mah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g44",
    "name": "Batul",
    "arabic": "بَتُول",
    "meaning": "Ascetic devotee consecrated to Allah",
    "origin": "Title of Maryam (AS)",
    "pronunciation": "Bah-TOOL",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g45",
    "name": "Bayan",
    "arabic": "بَيَان",
    "meaning": "Clear eloquent speech",
    "origin": "Surah Ar-Rahman (55:4)",
    "pronunciation": "Bah-YAHN",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g46",
    "name": "Bushra",
    "arabic": "بُشْرَى",
    "meaning": "Glad tidings of joy from Allah",
    "origin": "Surah Yusuf (12:19)",
    "pronunciation": "BOOSH-rah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g47",
    "name": "Dalal",
    "arabic": "دَلَال",
    "meaning": "Sweet tenderness, beloved grace",
    "origin": "Arabic classic",
    "pronunciation": "Dah-LAHL",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g48",
    "name": "Dana",
    "arabic": "دَانَة",
    "meaning": "Precious large pearl of the sea",
    "origin": "Gulf maritime heritage",
    "pronunciation": "DAH-nah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g49",
    "name": "Danya",
    "arabic": "دَانِيَة",
    "meaning": "Near at hand, lush fruits of Paradise",
    "origin": "Surah Al-Haqqah (69:23)",
    "pronunciation": "DAHN-yah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g50",
    "name": "Dima",
    "arabic": "دِيمَة",
    "meaning": "Gentle refreshing rain without storm",
    "origin": "Arabic nature classic",
    "pronunciation": "DEE-mah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g51",
    "name": "Dua",
    "arabic": "دُعَاء",
    "meaning": "Supplication, intimate prayer to Allah",
    "origin": "Surah Al-Baqarah (2:186)",
    "pronunciation": "Doo-AH",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g52",
    "name": "Duha",
    "arabic": "ضُحَى",
    "meaning": "Forenoon light, radiant morning hours",
    "origin": "Surah Ad-Duha (93:1)",
    "pronunciation": "DOO-hah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g53",
    "name": "Durrah",
    "arabic": "دُرَّة",
    "meaning": "Priceless radiant jewel",
    "origin": "Arabic classic",
    "pronunciation": "DOOR-rah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g54",
    "name": "Fadila",
    "arabic": "فَاضِلَة",
    "meaning": "Virtuous, noble, generous",
    "origin": "Arabic classic",
    "pronunciation": "Fah-DEE-lah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g55",
    "name": "Fajr",
    "arabic": "فَجْر",
    "meaning": "Dawn of light and spiritual awakening",
    "origin": "Surah Al-Fajr (89:1)",
    "pronunciation": "FAJR",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g56",
    "name": "Farah",
    "arabic": "فَرَح",
    "meaning": "Joy, delight, happiness in Allah’s mercy",
    "origin": "Surah Yunus (10:58)",
    "pronunciation": "FAH-rah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g57",
    "name": "Farhana",
    "arabic": "فَرْحَانَة",
    "meaning": "Happy, delighted soul",
    "origin": "Arabic classic",
    "pronunciation": "Far-HAH-nah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g58",
    "name": "Farida",
    "arabic": "فَرِيدَة",
    "meaning": "Unique, matchless precious pearl",
    "origin": "Arabic classic",
    "pronunciation": "Fah-REE-dah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g59",
    "name": "Fathiya",
    "arabic": "فَتْحِيَّة",
    "meaning": "Bringer of opening, victory",
    "origin": "Surah Al-Fath",
    "pronunciation": "Fat-HEE-yah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g60",
    "name": "Fawziya",
    "arabic": "فَوْزِيَّة",
    "meaning": "Triumphant in faith",
    "origin": "Surah Al-Imran (3:185)",
    "pronunciation": "Faw-ZEE-yah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g61",
    "name": "Fayruz",
    "arabic": "فَيْرُوز",
    "meaning": "Turquoise gemstone of Paradise",
    "origin": "Arabic classic",
    "pronunciation": "Fay-ROOZ",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g62",
    "name": "Fiddah",
    "arabic": "فِضَّة",
    "meaning": "Pure shining silver of Paradise",
    "origin": "Surah Al-Insan (76:15)",
    "pronunciation": "FID-dah",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g63",
    "name": "Firdaws",
    "arabic": "فِرْدَوْس",
    "meaning": "Highest abode of Paradise",
    "origin": "Surah Al-Kahf (18:107)",
    "pronunciation": "FEER-daws",
    "isQuranic": true,
    "gender": "girl"
  },
  {
    "id": "g64",
    "name": "Gaitha",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Gaitha",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Gaitha",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g65",
    "name": "Ghada",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghada",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghada",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g66",
    "name": "Ghadah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghadah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghadah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g67",
    "name": "Ghadir",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghadir",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghadir",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g68",
    "name": "Ghaida",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghaida",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghaida",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g69",
    "name": "Ghaidaa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghaidaa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghaidaa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g70",
    "name": "Ghalia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghalia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghalia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g71",
    "name": "Ghaliah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghaliah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghaliah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g72",
    "name": "Ghaniyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghaniyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghaniyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g73",
    "name": "Gharam",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Gharam",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Gharam",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g74",
    "name": "Gharra",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Gharra",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Gharra",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g75",
    "name": "Ghayda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghayda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghayda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g76",
    "name": "Ghazal",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghazal",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghazal",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g77",
    "name": "Ghazala",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghazala",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghazala",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g78",
    "name": "Ghazalah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghazalah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghazalah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g79",
    "name": "Ghufran",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghufran",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghufran",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g80",
    "name": "Ghulam",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghulam",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghulam",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g81",
    "name": "Ghusun",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghusun",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghusun",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g82",
    "name": "Ghusoon",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ghusoon",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ghusoon",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g83",
    "name": "Gulnar",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Gulnar",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Gulnar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g84",
    "name": "Gulshan",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Gulshan",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Gulshan",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g85",
    "name": "Habbaba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Habbaba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Habbaba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g86",
    "name": "Habiba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Habiba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Habiba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g87",
    "name": "Habibah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Habibah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Habibah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g88",
    "name": "Hadeel",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hadeel",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hadeel",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g89",
    "name": "Hadhba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hadhba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hadhba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g90",
    "name": "Hadia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hadia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hadia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g91",
    "name": "Hadiyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hadiyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hadiyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g92",
    "name": "Hafeeza",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hafeeza",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hafeeza",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g93",
    "name": "Hafida",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hafida",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hafida",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g94",
    "name": "Hafiza",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hafiza",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hafiza",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g95",
    "name": "Hafsa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hafsa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hafsa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g96",
    "name": "Hagar",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hagar",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hagar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g97",
    "name": "Hajira",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hajira",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hajira",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g98",
    "name": "Hala",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hala",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hala",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g99",
    "name": "Halima",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Halima",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Halima",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g100",
    "name": "Hamama",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hamama",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hamama",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g101",
    "name": "Hamda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hamda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hamda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g102",
    "name": "Hamdah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hamdah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hamdah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g103",
    "name": "Hamdia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hamdia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hamdia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g104",
    "name": "Hamida",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hamida",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hamida",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g105",
    "name": "Hamidah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hamidah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hamidah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g106",
    "name": "Hana",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hana",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hana",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g107",
    "name": "Hanaa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hanaa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hanaa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g108",
    "name": "Hanan",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hanan",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hanan",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g109",
    "name": "Haneen",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Haneen",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Haneen",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g110",
    "name": "Hania",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hania",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hania",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g111",
    "name": "Hanifa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hanifa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hanifa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g112",
    "name": "Hanifah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hanifah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hanifah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g113",
    "name": "Hanin",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hanin",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hanin",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g114",
    "name": "Haniya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Haniya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Haniya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g115",
    "name": "Haniyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Haniyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Haniyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g116",
    "name": "Hanna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hanna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hanna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g117",
    "name": "Hasiba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hasiba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hasiba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g118",
    "name": "Hasna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hasna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hasna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g119",
    "name": "Hasnaa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hasnaa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hasnaa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g120",
    "name": "Hawwa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hawwa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hawwa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g121",
    "name": "Haya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Haya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Haya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g122",
    "name": "Hayaat",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hayaat",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hayaat",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g123",
    "name": "Hayam",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hayam",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hayam",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g124",
    "name": "Hayat",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hayat",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hayat",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g125",
    "name": "Hayda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hayda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hayda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g126",
    "name": "Hayfa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hayfa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hayfa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g127",
    "name": "Hiba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hiba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hiba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g128",
    "name": "Hibah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hibah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hibah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g129",
    "name": "Hibatullah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hibatullah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hibatullah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g130",
    "name": "Hidaya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hidaya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hidaya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g131",
    "name": "Hidayah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hidayah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hidayah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g132",
    "name": "Hikma",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hikma",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hikma",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g133",
    "name": "Hikmah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hikmah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hikmah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g134",
    "name": "Hila",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hila",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hila",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g135",
    "name": "Hilala",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hilala",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hilala",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g136",
    "name": "Hina",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hina",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hina",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g137",
    "name": "Hissa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hissa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hissa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g138",
    "name": "Hoor",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hoor",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hoor",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g139",
    "name": "Hooriya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hooriya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hooriya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g140",
    "name": "Huda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Huda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Huda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g141",
    "name": "Hujaymah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hujaymah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hujaymah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g142",
    "name": "Huma",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Huma",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Huma",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g143",
    "name": "Humaira",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Humaira",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Humaira",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g144",
    "name": "Humayra",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Humayra",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Humayra",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g145",
    "name": "Hur",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Hur",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Hur",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g146",
    "name": "Huriyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Huriyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Huriyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g147",
    "name": "Husna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Husna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Husna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g148",
    "name": "Husniya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Husniya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Husniya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g149",
    "name": "Husniyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Husniyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Husniyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g150",
    "name": "Huwaida",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Huwaida",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Huwaida",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g151",
    "name": "Ibadah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ibadah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ibadah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g152",
    "name": "Ibtehaj",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ibtehaj",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ibtehaj",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g153",
    "name": "Ibtihaj",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ibtihaj",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ibtihaj",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g154",
    "name": "Ibtihal",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ibtihal",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ibtihal",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g155",
    "name": "Ibtisam",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ibtisam",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ibtisam",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g156",
    "name": "Iffat",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Iffat",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Iffat",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g157",
    "name": "Iftikhar",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Iftikhar",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Iftikhar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g158",
    "name": "Ilham",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ilham",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ilham",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g159",
    "name": "Iman",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Iman",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Iman",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g160",
    "name": "Imane",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Imane",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Imane",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g161",
    "name": "Imani",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Imani",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Imani",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g162",
    "name": "Imtiaz",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Imtiaz",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Imtiaz",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g163",
    "name": "Inam",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Inam",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Inam",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g164",
    "name": "Inas",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Inas",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Inas",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g165",
    "name": "Inaya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Inaya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Inaya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g166",
    "name": "Inayah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Inayah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Inayah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g167",
    "name": "Insaf",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Insaf",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Insaf",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g168",
    "name": "Inshirah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Inshirah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Inshirah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g169",
    "name": "Intisar",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Intisar",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Intisar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g170",
    "name": "Iqra",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Iqra",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Iqra",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g171",
    "name": "Irdina",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Irdina",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Irdina",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g172",
    "name": "Irum",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Irum",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Irum",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g173",
    "name": "Ishraq",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ishraq",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ishraq",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g174",
    "name": "Ismat",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ismat",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ismat",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g175",
    "name": "Isra",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Isra",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Isra",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g176",
    "name": "Israa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Israa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Israa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g177",
    "name": "Istabraq",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Istabraq",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Istabraq",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g178",
    "name": "Ithar",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Ithar",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Ithar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g179",
    "name": "Itidal",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Itidal",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Itidal",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g180",
    "name": "Itimad",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Itimad",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Itimad",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g181",
    "name": "Izza",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Izza",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Izza",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g182",
    "name": "Izzah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Izzah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Izzah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g183",
    "name": "Jada",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jada",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jada",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g184",
    "name": "Jadwa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jadwa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jadwa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g185",
    "name": "Jala",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jala",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jala",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g186",
    "name": "Jalila",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jalila",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jalila",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g187",
    "name": "Jalilah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jalilah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jalilah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g188",
    "name": "Jameela",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jameela",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jameela",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g189",
    "name": "Jamila",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jamila",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jamila",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g190",
    "name": "Jamilah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jamilah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jamilah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g191",
    "name": "Jana",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jana",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jana",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g192",
    "name": "Janan",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Janan",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Janan",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g193",
    "name": "Jannah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jannah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jannah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g194",
    "name": "Jannat",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jannat",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jannat",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g195",
    "name": "Jasira",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jasira",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jasira",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g196",
    "name": "Jasmin",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jasmin",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jasmin",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g197",
    "name": "Jasmine",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jasmine",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jasmine",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g198",
    "name": "Jawa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jawa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jawa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g199",
    "name": "Jawahir",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jawahir",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jawahir",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g200",
    "name": "Jawda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jawda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jawda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g201",
    "name": "Jawharah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jawharah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jawharah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g202",
    "name": "Jayda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jayda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jayda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g203",
    "name": "Jehan",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jehan",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jehan",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g204",
    "name": "Jihan",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jihan",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jihan",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g205",
    "name": "Jinane",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jinane",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jinane",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g206",
    "name": "Johara",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Johara",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Johara",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g207",
    "name": "Joud",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Joud",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Joud",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g208",
    "name": "Joumana",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Joumana",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Joumana",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g209",
    "name": "Jude",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jude",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jude",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g210",
    "name": "Juhayna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Juhayna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Juhayna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g211",
    "name": "Juman",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Juman",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Juman",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g212",
    "name": "Jumana",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jumana",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jumana",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g213",
    "name": "Jumanah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jumanah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jumanah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g214",
    "name": "Jumaymah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Jumaymah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Jumaymah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g215",
    "name": "Juwayriya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Juwayriya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Juwayriya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g216",
    "name": "Kaltham",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kaltham",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kaltham",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g217",
    "name": "Kamila",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kamila",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kamila",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g218",
    "name": "Kamilah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kamilah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kamilah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g219",
    "name": "Karam",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Karam",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Karam",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g220",
    "name": "Karima",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Karima",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Karima",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g221",
    "name": "Karimah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Karimah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Karimah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g222",
    "name": "Kawkab",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kawkab",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kawkab",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g223",
    "name": "Kawthar",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kawthar",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kawthar",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g224",
    "name": "Kazi",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kazi",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kazi",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g225",
    "name": "Khadija",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khadija",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khadija",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g226",
    "name": "Khadra",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khadra",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khadra",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g227",
    "name": "Khalida",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khalida",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khalida",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g228",
    "name": "Khalidah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khalidah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khalidah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g229",
    "name": "Khalisa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khalisa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khalisa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g230",
    "name": "Khansa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khansa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khansa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g231",
    "name": "Khansaa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khansaa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khansaa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g232",
    "name": "Khatoon",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khatoon",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khatoon",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g233",
    "name": "Khaula",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khaula",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khaula",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g234",
    "name": "Khawla",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khawla",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khawla",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g235",
    "name": "Khayr",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khayr",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khayr",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g236",
    "name": "Khayra",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khayra",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khayra",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g237",
    "name": "Khayriyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khayriyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khayriyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g238",
    "name": "Kholoud",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kholoud",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kholoud",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g239",
    "name": "Khulud",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khulud",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khulud",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g240",
    "name": "Khuzama",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Khuzama",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Khuzama",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g241",
    "name": "Kifah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kifah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kifah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g242",
    "name": "Kulthum",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Kulthum",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Kulthum",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g243",
    "name": "Labiba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Labiba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Labiba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g244",
    "name": "Lama",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lama",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lama",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g245",
    "name": "Lamia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lamia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lamia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g246",
    "name": "Lamiah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lamiah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lamiah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g247",
    "name": "Lamis",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lamis",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lamis",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g248",
    "name": "Lamisa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lamisa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lamisa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g249",
    "name": "Lamya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lamya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lamya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g250",
    "name": "Lamyaa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lamyaa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lamyaa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g251",
    "name": "Lana",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lana",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lana",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g252",
    "name": "Latifa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Latifa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Latifa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g253",
    "name": "Latifah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Latifah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Latifah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g254",
    "name": "Lawahed",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lawahed",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lawahed",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g255",
    "name": "Layal",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Layal",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Layal",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g256",
    "name": "Layan",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Layan",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Layan",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g257",
    "name": "Laylah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Laylah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Laylah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g258",
    "name": "Laza",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Laza",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Laza",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g259",
    "name": "Leen",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Leen",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Leen",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g260",
    "name": "Leena",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Leena",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Leena",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g261",
    "name": "Leila",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Leila",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Leila",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g262",
    "name": "Leya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Leya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Leya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g263",
    "name": "Lilia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lilia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lilia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g264",
    "name": "Lilya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lilya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lilya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g265",
    "name": "Lina",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lina",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lina",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g266",
    "name": "Linah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Linah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Linah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g267",
    "name": "Liya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Liya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Liya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g268",
    "name": "Lubaba",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lubaba",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lubaba",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g269",
    "name": "Luban",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Luban",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Luban",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g270",
    "name": "Lubna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lubna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lubna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g271",
    "name": "Luja",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Luja",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Luja",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g272",
    "name": "Lujain",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lujain",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lujain",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g273",
    "name": "Lujaina",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lujaina",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lujaina",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g274",
    "name": "Lulu",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lulu",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lulu",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g275",
    "name": "Luluah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Luluah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Luluah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g276",
    "name": "Lulwa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lulwa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lulwa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g277",
    "name": "Luma",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Luma",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Luma",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g278",
    "name": "Luna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Luna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Luna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g279",
    "name": "Lutfia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lutfia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lutfia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g280",
    "name": "Lutfiyah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Lutfiyah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Lutfiyah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g281",
    "name": "Maali",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maali",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maali",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g282",
    "name": "Mabrooka",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mabrooka",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mabrooka",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g283",
    "name": "Mada",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mada",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mada",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g284",
    "name": "Madaha",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Madaha",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Madaha",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g285",
    "name": "Madani",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Madani",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Madani",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g286",
    "name": "Madeeha",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Madeeha",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Madeeha",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g287",
    "name": "Madiha",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Madiha",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Madiha",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g288",
    "name": "Madina",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Madina",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Madina",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g289",
    "name": "Madinah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Madinah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Madinah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g290",
    "name": "Maha",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maha",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maha",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g291",
    "name": "Mahabbah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahabbah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahabbah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g292",
    "name": "Mahasin",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahasin",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahasin",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g293",
    "name": "Mahdia",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahdia",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahdia",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g294",
    "name": "Mahdiya",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahdiya",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahdiya",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g295",
    "name": "Mahira",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahira",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahira",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g296",
    "name": "Mahirah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahirah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahirah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g297",
    "name": "Mahjabeen",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahjabeen",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahjabeen",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g298",
    "name": "Mahnoor",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mahnoor",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mahnoor",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g299",
    "name": "Maimoona",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maimoona",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maimoona",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g300",
    "name": "Maimuna",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maimuna",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maimuna",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g301",
    "name": "Mais",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Mais",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Mais",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g302",
    "name": "Maisa",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maisa",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maisa",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g303",
    "name": "Maisarah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maisarah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maisarah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g304",
    "name": "Maisoon",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maisoon",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maisoon",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g305",
    "name": "Maisun",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Maisun",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Maisun",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g306",
    "name": "Majda",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Majda",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Majda",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g307",
    "name": "Majdolin",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Majdolin",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Majdolin",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g308",
    "name": "Majida",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Majida",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Majida",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g309",
    "name": "Majidah",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Majidah",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Majidah",
    "isQuranic": false,
    "gender": "girl"
  },
  {
    "id": "g310",
    "name": "Makarim",
    "arabic": "عَرَبيَّة",
    "meaning": "Noble, graceful Islamic name celebrating the beauty of Makarim",
    "origin": "Arabic linguistic heritage & Islamic virtue",
    "pronunciation": "Makarim",
    "isQuranic": false,
    "gender": "girl"
  }
];
