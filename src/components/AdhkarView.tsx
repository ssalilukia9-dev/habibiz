import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Shield, 
  Award, 
  ChevronRight, 
  Volume2, 
  Square, 
  Play,
  CheckCircle2,
  Lock,
  Pause
} from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';

const NAMES_OF_ALLAH = [
  { id: 1, arabic: "الرَّحْمَنُ", transliteration: "Ar-Rahman", english: "The Most Merciful" },
  { id: 2, arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", english: "The Especially Merciful" },
  { id: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", english: "The Sovereign Lord" },
  { id: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", english: "The Holy" },
  { id: 5, arabic: "السَّلَامُ", transliteration: "As-Salam", english: "The Source of Peace" },
  { id: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", english: "The Guardian of Faith" },
  { id: 7, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", english: "The Protector" },
  { id: 8, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", english: "The Mighty" },
  { id: 9, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", english: "The Compeller" },
  { id: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", english: "The Supreme, The Majestic" },
];

const ADHKAR = [
  { 
    category: "Morning", 
    icon: Sun,
    items: [
      { 
        id: 'm1', 
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ", 
        english: "We have entered a new day and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone.", 
        benefit: "Declaration of Tawheed",
        audio: "https://www.islamicfinder.org/dua/recording/1" 
      },
      { 
        id: 'm2', 
        arabic: "بِاسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", 
        english: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.", 
        benefit: "Protection from sudden harm",
        audio: "https://www.islamicfinder.org/dua/recording/2"
      },
      {
        id: 'm3',
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        english: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (PBUH) as my Prophet.",
        benefit: "Allah promises to please the reciter on the Day of Judgment (3x)"
      },
      {
        id: 'm4',
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        english: "O Ever-Living, O Self-Subsisting, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself for even the blink of an eye.",
        benefit: "Supplication for divine assistance"
      },
      {
        id: 'm5',
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
        english: "Glory is to Allah and praise is to Him, by the multitude of His creation, by His Pleasure, by the weight of His Throne, and by the extent of His Words.",
        benefit: "Substantial reward surpassing hours of dhikr (3x)"
      }
    ]
  },
  { 
    category: "Evening", 
    icon: Moon,
    items: [
      { id: 'e1', arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", english: "We have entered the evening and with it all dominion is Allah's. Praise is to Allah.", benefit: "Gratitude for reaching evening" },
      { id: 'e2', arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", english: "I seek refuge in the perfect words of Allah from the evil of what He has created.", benefit: "Protection from poisonous stings/harm" },
      { id: 'e5', arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", english: "Allah is sufficient for me. None has the right to be worshipped but He. In Him I put my trust and He is the Lord of the Mighty Throne.", benefit: "Sufficiency in all matters (7x)" },
      {
        id: 'e6',
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        english: "O Allah, by Your leave we have reached evening and by Your leave we have reached morning, by Your leave we live and die, and unto You is our return.",
        benefit: "Affirmation of Allah's control over time"
      }
    ]
  },
  {
    category: "Sleeping & Waking",
    icon: Shield,
    items: [
      {
        id: 's1',
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        english: "In Your name, O Allah, I die and I live.",
        benefit: "Dua before sleeping"
      },
      {
        id: 's2',
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        english: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the resurrection.",
        benefit: "Dua upon waking up"
      },
      {
        id: 's3',
        arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا",
        english: "In Your name my Lord, I lie down and in Your name I rise. If You take my soul, have mercy on it, and if You send it back, protect it.",
        benefit: "Protection during sleep"
      },
      {
        id: 's4',
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        english: "O Allah, protect me from Your punishment on the day You resurrect Your slaves.",
        benefit: "Safety from the Hereafter (3x)"
      }
    ]
  },
  {
    category: "Praise & Forgiveness",
    icon: Award,
    items: [
      {
        id: 'pf1',
        arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        english: "I seek Allah's forgiveness and turn to Him in repentance.",
        benefit: "Cleansing of sins (Recite 100x daily)"
      },
      {
        id: 'pf2',
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        english: "Glory be to Allah and all praise is due to Him.",
        benefit: "Forgiveness of sins even if as large as foam of the sea"
      },
      {
        id: 'pf3',
        arabic: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
        english: "Glory is to Allah, Praise is to Allah, None has the right to be worshipped but Allah, and Allah is the Greatest.",
        benefit: "Direct route to Paradise"
      },
      {
        id: 'pf4',
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        english: "There is no might and no power except with Allah.",
        benefit: "A treasure from the treasures of Paradise"
      },
      {
        id: 'pf5',
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
        english: "O Allah, You are my Lord, there is no god but You. You created me and I am Your slave, and I am faithful to my covenant and my promise as much as I can.",
        benefit: "The Master of Forgiveness (Sayyid al-Istighfar)"
      }
    ]
  },
  {
    category: "Safety & Relief",
    icon: Shield,
    items: [
      {
        id: 'sr1',
        arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
        english: "To Allah we belong and unto Him is our return. O Allah, recompense me for my affliction and replace it with something better.",
        benefit: "Comfort in times of loss or trial"
      },
      {
        id: 'sr2',
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        english: "Allah is sufficient for us and He is the Best Disposer of affairs.",
        benefit: "Relief from anxiety and fear"
      },
      {
        id: 'sr3',
        arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
        english: "None has the right to be worshipped but You. Glory be to You! I have been among the wrongdoers.",
        benefit: "Dua of Yunus (AS) - Relief from sadness"
      }
    ]
  },
  {
    category: "Eating & Home",
    icon: Sparkles,
    items: [
      {
        id: 'eh1',
        arabic: "بِسْمِ اللَّهِ",
        english: "In the name of Allah.",
        benefit: "Dua before eating"
      },
      {
        id: 'eh2',
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        english: "Praise be to Allah Who has fed me this and provided it for me without any might or power on my part.",
        benefit: "Forgiveness of past sins"
      },
      {
        id: 'eh3',
        arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنا تَوَكَّلْنا",
        english: "In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we rely.",
        benefit: "Dua before entering the home"
      },
      {
        id: 'eh4',
        arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        english: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
        benefit: "Supplication upon leaving the home"
      }
    ]
  },
  {
    category: "Mosque & Prayer",
    icon: Sparkles,
    items: [
      {
        id: 'mp1',
        arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        english: "O Allah, open the gates of Your mercy for me.",
        benefit: "Dua upon entering the Mosque"
      },
      {
        id: 'mp2',
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
        english: "O Allah, I ask You from Your favor.",
        benefit: "Dua upon leaving the Mosque"
      },
      {
        id: 'mp3',
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
        english: "O Allah, help me to remember You, to give thanks to You, and to worship You in the best manner.",
        benefit: "Dua after every Fard prayer"
      },
      {
        id: 'mp4',
        arabic: "أَسْتَغْفِرُ اللَّهَ (3x) ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        english: "I ask Allah for forgiveness (3x). O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
        benefit: "Sunnah dhikr after Salah"
      }
    ]
  },
  {
    category: "Social & Conduct",
    icon: Shield,
    items: [
      {
        id: 'sc1',
        arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ",
        english: "May the peace, mercy, and blessings of Allah be upon you.",
        benefit: "The Islamic Greeting - Peace of the Ummah"
      },
      {
        id: 'sc2',
        arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        english: "Glory be to You, O Allah, and all praise. I testify that there is no god but You. I ask Your forgiveness and turn to You in repentance.",
        benefit: "Expiation for any idle talk in a gathering"
      },
      {
        id: 'sc3',
        arabic: "جَزَاكَ اللَّهُ خَيْرًا",
        english: "May Allah reward you with goodness.",
        benefit: "Expressing gratitude to another"
      }
    ]
  },
  {
    category: "Travel & Nature",
    icon: Sun,
    items: [
      {
        id: 'tn1',
        arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
        english: "Glory is to Him Who has subjected this to us, as we could never have done it by our own efforts. And surely, to our Lord we are returning.",
        benefit: "Dua for traveling"
      },
      {
        id: 'tn2',
        arabic: "سُبْحَانَ اللَّهِ (33x)، الْحَمْدُ لِلَّهِ (33x)، اللَّهُ أَكْبَرُ (34x)",
        english: "Glory is to Allah, Praise is to Allah, Allah is the Greatest.",
        benefit: "Fatima's (RA) tasbih before sleep or for strength"
      },
      {
        id: 'tn3',
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبُخْلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ",
        english: "O Allah, I seek refuge with You from miserliness, and I seek refuge with You from cowardice, and I seek refuge with You from being sent back to the most miserable old age.",
        benefit: "Protection from negative traits"
      },
      {
        id: 'tn4',
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        english: "O Allah, I seek refuge in you from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
        benefit: "Relief from life's greatest burdens"
      },
      {
        id: 'tn5',
        arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
        english: "My Lord, forgive me and accept my repentance, You are the Ever-Relenting, the Most Merciful.",
        benefit: "Repentance (The Prophet SAWS said this 100x in one sitting)"
      },
      {
        id: 'tn6',
        arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        english: "O Allah, send prayers and peace upon our Prophet Muhammad.",
        benefit: "Obtaining Allah's blessings (10x in morning/evening)"
      },
      {
        id: 'tn7',
        arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        english: "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.",
        benefit: "Protection from Shaytan all day (100x)"
      },
      {
        id: 'tn8',
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
        english: "Glory and praise be to Allah, Glory be to Allah the Almighty.",
        benefit: "Two words light on the tongue, heavy on the scales"
      },
      {
        id: 'tn9',
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
        english: "O Allah, I ask You for forgiveness and well-being in this world and the next.",
        benefit: "Comprehensive well-being"
      },
      {
        id: 'tn10',
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ",
        english: "I seek refuge in the perfect words of Allah from every devil and every poisonous creature and from every evil eye.",
        benefit: "Protection for children and self"
      },
      {
        id: 'tn11',
        arabic: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
        english: "O Controller of hearts, make my heart steadfast in Your religion.",
        benefit: "Dua for steadfastness in faith"
      },
      {
        id: 'tn12',
        arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي بَصَرِي نُورًا، وَفِي سَمْعِي نُورًا",
        english: "O Allah, place light in my heart, and light in my sight, and light in my hearing.",
        benefit: "Supplication for internal and external light"
      },
      {
        id: 'tn13',
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، عَلَيْكَ تَوَكَّلْتُ وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        english: "O Allah, You are my Lord, there is no god but You. In You I have placed my trust and You are the Lord of the Mighty Throne.",
        benefit: "Protection of family and property"
      },
      {
        id: 'tn14',
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        english: "O Allah, I ask You for knowledge that is of benefit, a good provision, and deeds that will be accepted.",
        benefit: "Morning invocation for success"
      },
      {
        id: 'tn15',
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        english: "My Lord, increase me in knowledge.",
        benefit: "Quranic dua for internal growth"
      },
      {
        id: 'tn16',
        arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
        english: "O Allah, bless us in what You have provided us and save us from the punishment of the Fire.",
        benefit: "Dua for blessings in sustenance"
      },
      {
        id: 'tn17',
        arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
        english: "O Allah, You are forgiving and You love forgiveness, so forgive me.",
        benefit: "The ultimate Dua for the night of Qadr"
      },
      {
        id: 'tn18',
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        english: "Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.",
        benefit: "The most comprehensive Quranic supplication"
      },
      {
        id: 'tn19',
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
        english: "O Allah, help me to remember You, to thank You, and to worship You in the best way.",
        benefit: "Dua for spiritual excellence"
      }
    ]
  }
];

export default function AdhkarView({ addHasanat, incrementDua, searchQuery }: { addHasanat: (amount: number) => void, incrementDua: () => void, searchQuery: string }) {
  const [activeTab, setActiveTab] = useState<'names' | 'adhkar'>('adhkar');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const currentUser = auth.currentUser;

  const filteredAdhkar = ADHKAR.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.arabic.includes(searchQuery) || 
      item.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.benefit.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const filteredNames = NAMES_OF_ALLAH.filter(name => 
    name.arabic.includes(searchQuery) ||
    name.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    name.english.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, `users/${currentUser.uid}/adhkarProgress`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapping: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        mapping[doc.id] = doc.data().completed;
      });
      setCompletedMap(mapping);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'adhkarProgress');
    });

    return () => {
      unsubscribe();
      if (audioPlayer) audioPlayer.pause();
      window.speechSynthesis.cancel();
    };
  }, [currentUser]);

  const handleSpeak = (text: string, id: string, audioUrl?: string) => {
    if (speakingId === id) {
      if (audioPlayer) {
        audioPlayer.pause();
        setAudioPlayer(null);
      }
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);
    if (audioPlayer) audioPlayer.pause();
    window.speechSynthesis.cancel();

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.warn("Audio playback failed, synthesis used", e);
        startSynthesis(text, id);
      });
      audio.onended = () => setSpeakingId(null);
      setAudioPlayer(audio);
    } else {
      startSynthesis(text, id);
    }
  };

  const startSynthesis = (text: string, id: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const toggleComplete = async (id: string) => {
    if (!currentUser) {
      alert("Connect your heart to the sanctuary to track progress.");
      return;
    }

    const isCurrentlyCompleted = completedMap[id];
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/adhkarProgress`, id), {
        adhkarId: id,
        completed: !isCurrentlyCompleted,
        lastCompletedAt: serverTimestamp()
      });

      if (!isCurrentlyCompleted) {
        incrementDua();
        addHasanat(10);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `adhkarProgress/${id}`);
    }
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const totalCount = ADHKAR.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="space-y-12">
      {/* ISIS Wrists Header Sponsorship */}
      <div className="glass-panel border-brand-primary/20 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between bg-brand-primary/5 gap-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-[2rem] bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-2xl shadow-brand-primary/20">
            <Sparkles size={32} />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-2 text-nowrap">Sponsored by Aloha Group of Companies</p>
            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Official Timekeeper: <span className="text-brand-primary">ISIS WRISTS</span></h4>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest leading-relaxed">Precision for your sacred moments</p>
          </div>
        </div>
        <button className="w-full md:w-auto px-10 py-5 bg-brand-primary text-brand-depth text-[10px] font-black uppercase rounded-2xl shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all tracking-widest relative z-10">Shop the Selection</button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex p-1 bg-white/5 rounded-2xl w-full md:w-fit">
          {['adhkar', 'names'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${activeTab === tab ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500 hover:text-slate-400'}`}
            >
              {tab === 'adhkar' ? 'Daily Adhkar' : '99 Names'}
            </button>
          ))}
        </div>

        {activeTab === 'adhkar' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6 bg-brand-sidebar border border-white/5 p-4 pr-8 rounded-3xl"
          >
             <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                   <Sparkles size={20} />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-brand-sidebar"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
             </div>
             <div className="space-y-1">
                <div className="flex items-center justify-between gap-12">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Spiritual Momentum</p>
                   <p className="text-[10px] font-black text-brand-primary uppercase">{Math.round((completedCount / totalCount) * 100)}%</p>
                </div>
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                     className="h-full bg-brand-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                   />
                </div>
             </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'adhkar' ? (
          <motion.div 
            key="adhkar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-20"
          >
            {filteredAdhkar.map((cat) => (
              <section key={cat.category} className="space-y-8">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-3xl bg-brand-sidebar border border-white/5 ${cat.category === 'Morning' ? 'text-brand-primary' : 'text-blue-400'} shadow-2xl`}>
                         <cat.icon size={28} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black text-white tracking-tight">{cat.category} Remembrance</h3>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Lock size={10} className="text-brand-primary/40" />
                            Sacred Protection {cat.items.length} Verses
                         </p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {cat.items.map((dhikr, idx) => (
                     <motion.div 
                        key={dhikr.id}
                        layout
                        className={`group relative glass-panel p-10 rounded-[3rem] border border-white/5 transition-all duration-500 overflow-hidden ${completedMap[dhikr.id] ? 'bg-brand-primary/[0.03] border-brand-primary/20' : 'hover:border-brand-primary/30 hover:bg-white/[0.02]'}`}
                     >
                        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                           <div className="flex justify-between items-start gap-8">
                              <div className="flex flex-col gap-4">
                                 <motion.button 
                                   whileHover={{ scale: 1.1 }}
                                   whileTap={{ scale: 0.9 }}
                                   onClick={() => toggleComplete(dhikr.id)}
                                   className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${completedMap[dhikr.id] ? 'bg-brand-primary border-brand-primary text-brand-depth shadow-lg' : 'border-white/10 text-slate-600 hover:border-brand-primary/40 hover:text-brand-primary'}`}
                                 >
                                    {completedMap[dhikr.id] ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
                                 </motion.button>
                                 <motion.button 
                                   whileHover={{ scale: 1.1 }}
                                   whileTap={{ scale: 0.9 }}
                                   onClick={() => handleSpeak(dhikr.arabic, dhikr.id, (dhikr as any).audio)}
                                   className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${speakingId === dhikr.id ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'border-white/10 text-slate-600 hover:border-amber-500/40 hover:text-amber-500'}`}
                                 >
                                    {speakingId === dhikr.id ? <Pause size={24} fill="currentColor" /> : <Volume2 size={24} />}
                                 </motion.button>
                              </div>
                              <p className="arabic-text text-4xl text-right leading-[1.8] text-white/90 font-medium flex-1">
                                 {dhikr.arabic}
                              </p>
                           </div>

                           <div className="space-y-6">
                              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                 <p className="text-slate-400 text-sm font-medium leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all duration-500">"{dhikr.english}"</p>
                              </div>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2.5 px-4 py-2 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                                    <Shield size={14} className="text-brand-primary" />
                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.1em]">{dhikr.benefit}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </section>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="names"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredNames.map((name, idx) => (
              <motion.div 
                key={name.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative bg-brand-sidebar/40 border border-white/5 rounded-[3rem] p-10 text-center hover:bg-brand-sidebar/80 hover:border-brand-primary/30 transition-all duration-500"
              >
                 <div className="w-20 h-20 bg-brand-primary/5 rounded-[1.5rem] flex items-center justify-center text-brand-primary mx-auto group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-brand-depth transition-all duration-500 shadow-xl">
                    <Award size={32} />
                 </div>
                 <div className="space-y-6 mt-8">
                    <p className="arabic-text text-5xl text-white tracking-widest">{name.arabic}</p>
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black text-brand-primary tracking-tight">{name.transliteration}</h4>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{name.english}</p>
                    </div>
                    <motion.button 
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => handleSpeak(name.arabic, `name-${name.id}`)}
                       className={`mx-auto w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${speakingId === `name-${name.id}` ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'border-white/10 text-slate-500 hover:border-amber-500 hover:text-amber-500'}`}
                     >
                       {speakingId === `name-${name.id}` ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                     </motion.button>
                 </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
