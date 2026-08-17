import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Shield, 
  Award, 
  ChevronRight, 
  Volume2, 
  Play,
  CheckCircle2,
  Lock,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Flame,
  Check,
  Languages,
  Coffee,
  Heart
} from 'lucide-react';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { VoiceService, VoicePlaybackState } from '../services/voiceService.ts';

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
  { id: 11, arabic: "الْخَالِقُ", transliteration: "Al-Khaliq", english: "The Creator" },
  { id: 12, arabic: "الْبَارِئُ", transliteration: "Al-Bari'", english: "The Evolver" }
];

export interface DhikrItem {
  id: string;
  arabic: string;
  transliteration?: string;
  english: string;
  benefit: string;
  targetCount: number;
}

export interface DhikrCategory {
  id: string;
  category: string;
  icon: any;
  items: DhikrItem[];
}

const ADHKAR: DhikrCategory[] = [
  { 
    id: "morning",
    category: "Morning", 
    icon: Sun,
    items: [
      { 
        id: 'm1', 
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", 
        transliteration: "Asbahna wa-asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer.",
        english: "We have entered a new day and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone with no partner.", 
        benefit: "Declaration of Tawheed & Divine Sovereign Protection",
        targetCount: 1
      },
      { 
        id: 'm2', 
        arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", 
        transliteration: "Bismillāhilladhī lā yadurru ma‘as-mihī shay'un fil-ardi wa lā fis-samā'i wa huwas-Samī‘ul-‘Alīm.",
        english: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.", 
        benefit: "Protection from sudden harm & disease (3x)",
        targetCount: 3
      },
      {
        id: 'm3',
        arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
        transliteration: "Radeetu billahi Rabba, wa bil-Islami deena, wa bi-Muhammadin sallallahu 'alayhi wa sallama Nabiyya.",
        english: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace be upon him) as my Prophet.",
        benefit: "Allah promises to please the reciter on the Day of Judgment (3x)",
        targetCount: 3
      },
      {
        id: 'm4',
        arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        transliteration: "Ya Hayyu Ya Qayyoom, bi-rahmatika astagheeth, aslih lee sha'nee kullahu wa la takilnee ila nafsee tarfata 'ayn.",
        english: "O Ever-Living, O Self-Subsisting, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself for even the blink of an eye.",
        benefit: "Supplication for divine guidance & psychological peace",
        targetCount: 1
      },
      {
        id: 'm5',
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
        transliteration: "Subhanallahi wa bihamdihi: 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatih.",
        english: "Glory is to Allah and praise is to Him, by the multitude of His creation, by His Pleasure, by the weight of His Throne, and by the extent of His Words.",
        benefit: "Substantial reward surpassing hours of dhikr (3x)",
        targetCount: 3
      }
    ]
  },
  { 
    id: "evening",
    category: "Evening", 
    icon: Moon,
    items: [
      { 
        id: 'e1', 
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ", 
        transliteration: "Amsayna wa-amsal-mulku lillah wal-hamdu lillah, la ilaha illallahu wahdahu la shareeka lah.",
        english: "We have entered the evening and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone.", 
        benefit: "Gratitude & peace for reaching evening safely",
        targetCount: 1
      },
      { 
        id: 'e2', 
        arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", 
        transliteration: "A'oodhu bi-kalimatil-lahit-tammati min sharri ma khalaq.",
        english: "I seek refuge in the perfect words of Allah from the evil of what He has created.", 
        benefit: "Total nightly protection from harm and poison (3x)",
        targetCount: 3
      },
      { 
        id: 'e3', 
        arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", 
        transliteration: "Hasbiyallahu la ilaha illa Huwa, 'alayhi tawakkaltu wa Huwa Rabbul-'Arshil-'Azeem.",
        english: "Allah is sufficient for me. None has the right to be worshipped but He. In Him I put my trust and He is the Lord of the Mighty Throne.", 
        benefit: "Sufficiency in all worldly & spiritual worries (7x)",
        targetCount: 7
      },
      {
        id: 'e4',
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
        transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namootu wa ilaykal-maseer.",
        english: "O Allah, by Your leave we have reached evening and by Your leave we reached morning, by Your leave we live and die, and unto You is our return.",
        benefit: "Affirmation of Allah's custody over life & time",
        targetCount: 1
      }
    ]
  },
  {
    id: "sleep",
    category: "Sleeping & Waking",
    icon: Shield,
    items: [
      {
        id: 's1',
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amootu wa ahya.",
        english: "In Your name, O Allah, I die and I live.",
        benefit: "Sunnah dua before closing eyes to sleep",
        targetCount: 1
      },
      {
        id: 's2',
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        transliteration: "Alhamdu lillahil-ladhee ahyana ba'da ma amatana wa ilayhin-nushoor.",
        english: "Praise is to Allah Who gives us life after He has caused us to die and unto Him is the resurrection.",
        benefit: "First words upon waking up in the morning",
        targetCount: 1
      },
      {
        id: 's3',
        arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        transliteration: "Bismika Rabbee wada'tu janbee, wa bika arfa'uh, fa in amsakta nafsee farhamha, wa in arsaltaha fahfadh-ha bima tahfadhu bihi 'ibadakas-saliheen.",
        english: "In Your name my Lord, I lie down and in Your name I rise. If You hold back my soul, have mercy on it, and if You release it, protect it.",
        benefit: "Angelic protection during sleep",
        targetCount: 1
      },
      {
        id: 's4',
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qinee 'adhabaka yawma tab'athu 'ibadak.",
        english: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        benefit: "Safety from the Hereafter (3x)",
        targetCount: 3
      }
    ]
  },
  {
    id: "forgiveness",
    category: "Praise & Forgiveness",
    icon: Award,
    items: [
      {
        id: 'pf1',
        arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        transliteration: "Astaghfirullaha wa atoobu ilayh.",
        english: "I seek Allah's forgiveness and turn to Him in sincere repentance.",
        benefit: "Cleansing of sins & opening of sustenance (100x)",
        targetCount: 100
      },
      {
        id: 'pf2',
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        transliteration: "Subhanallahi wa bihamdihi.",
        english: "Glory be to Allah and all praise is due to Him.",
        benefit: "Sins wiped away even if as vast as the foam of the sea (100x)",
        targetCount: 100
      },
      {
        id: 'pf3',
        arabic: "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
        transliteration: "Subhanallah, wal-hamdulillah, wa la ilaha illallah, wallahu Akbar.",
        english: "Glory is to Allah, Praise is to Allah, None has the right to be worshipped but Allah, and Allah is the Greatest.",
        benefit: "The four words most beloved to Allah",
        targetCount: 33
      },
      {
        id: 'pf4',
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah.",
        english: "There is no might and no power except with Allah.",
        benefit: "A treasure from beneath the Throne of Allah in Paradise",
        targetCount: 10
      },
      {
        id: 'pf5',
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        transliteration: "Allahumma Anta Rabbi la ilaha illa Ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't, a'oodhu bika min sharri ma sana't, aboo'u laka bi ni'matika 'alayya wa aboo'u bi dhanbi faghfir lee fa innahu la yaghfirudh-dhunooba illa Ant.",
        english: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I remain upon Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done.",
        benefit: "The Chief of Repentance (Sayyid al-Istighfar) - Guarantee of Paradise",
        targetCount: 1
      }
    ]
  },
  {
    id: "prayer_dhikr",
    category: "After Swalah",
    icon: Sparkles,
    items: [
      {
        id: 'ps1',
        arabic: "أَسْتَغْفِرُ اللَّهَ (3x) ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        transliteration: "Astaghfirullah (3x). Allahumma Antas-Salam wa minkas-salam, tabarakta ya Dhal-Jalali wal-Ikram.",
        english: "I seek forgiveness of Allah (3x). O Allah, You are Peace and from You comes peace. Blessed are You, O Possessor of Majesty and Honor.",
        benefit: "Direct Sunnah immediately following obligatory prayer",
        targetCount: 1
      },
      {
        id: 'ps2',
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
        transliteration: "Allahumma a'innee 'ala dhikrika wa shukrika wa husni 'ibadatik.",
        english: "O Allah, help me to remember You, to express gratitude to You, and to worship You in the finest manner.",
        benefit: "Taught directly by the Prophet (ﷺ) to Mu'adh (RA)",
        targetCount: 1
      },
      {
        id: 'ps3',
        arabic: "سُبْحَانَ اللَّهِ (33x)، الْحَمْدُ لِلَّهِ (33x)، اللَّهُ أَكْبَرُ (33x)",
        transliteration: "Subhanallah (33x), Alhamdulillah (33x), Allahu Akbar (33x).",
        english: "Glory be to Allah, Praise be to Allah, Allah is the Greatest.",
        benefit: "The post-prayer Tasbih that erases all minor sins",
        targetCount: 33
      }
    ]
  }
];

export default function AdhkarView({
  addHasanat,
  incrementDua,
  searchQuery = ''
}: {
  addHasanat: (amount: number) => void;
  incrementDua: () => void;
  searchQuery?: string;
}) {
  const [activeTab, setActiveTab] = useState<'adhkar' | 'names'>('adhkar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [counterMap, setCounterMap] = useState<Record<string, number>>({});
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(VoiceService.getState());
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionIndex, setSessionIndex] = useState<number>(0);
  const [sessionItems, setSessionItems] = useState<DhikrItem[]>([]);
  const [fontSizeScale, setFontSizeScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [showTransliteration, setShowTransliteration] = useState<boolean>(true);

  const currentUser = auth?.currentUser;

  useEffect(() => {
    const unsub = VoiceService.subscribe(setPlaybackState);
    return () => {
      unsub();
      VoiceService.stop();
    };
  }, []);

  // Sync completion states
  useEffect(() => {
    if (!currentUser) {
      const saved = localStorage.getItem('guest-adhkar-progress');
      if (saved) {
        try {
          setCompletedMap(JSON.parse(saved));
        } catch (e) {}
      }
      return;
    }

    const unsub = onSnapshot(doc(db, `users/${currentUser.uid}/adhkarProgress/all`), (docSnap) => {
      if (docSnap.exists()) {
        setCompletedMap(docSnap.data() as Record<string, boolean>);
      }
    }, () => {});

    return () => unsub();
  }, [currentUser]);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (e) {}
    }
  };

  // Play audio for a single dhikr
  const handlePlayDhikr = (dhikr: DhikrItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === dhikr.id) {
      VoiceService.stop();
    } else {
      VoiceService.speakArabic(dhikr.arabic, dhikr.id);
    }
  };

  // Play dual Arabic + English
  const handlePlayBoth = (dhikr: DhikrItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playbackState.isPlaying && playbackState.activeId === dhikr.id && playbackState.mode === 'both') {
      VoiceService.stop();
    } else {
      VoiceService.speakBoth(dhikr.arabic, dhikr.english, dhikr.id);
    }
  };

  // Interactive Tasbih Repetition Counter
  const handleIncrementCounter = (dhikr: DhikrItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic();

    const currentCount = counterMap[dhikr.id] || 0;
    const nextCount = currentCount + 1;
    const isNowComplete = nextCount >= dhikr.targetCount;

    setCounterMap(prev => ({
      ...prev,
      [dhikr.id]: isNowComplete ? dhikr.targetCount : nextCount
    }));

    if (isNowComplete && !completedMap[dhikr.id]) {
      toggleComplete(dhikr.id, true);
    }
  };

  const handleResetCounter = (dhikrId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCounterMap(prev => ({ ...prev, [dhikrId]: 0 }));
  };

  // Mark completion in Firebase / local
  const toggleComplete = async (id: string, forceComplete?: boolean) => {
    const isCurrentlyCompleted = completedMap[id];
    const targetState = forceComplete !== undefined ? forceComplete : !isCurrentlyCompleted;

    const newMap = { ...completedMap, [id]: targetState };
    setCompletedMap(newMap);

    if (targetState) {
      triggerHaptic();
      addHasanat(15);
      incrementDua();
    }

    if (currentUser) {
      try {
        await setDoc(doc(db, `users/${currentUser.uid}/adhkarProgress/all`), newMap, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `adhkarProgress/all`);
      }
    } else {
      localStorage.setItem('guest-adhkar-progress', JSON.stringify(newMap));
    }
  };

  // Start continuous audio session
  const startSession = (categoryItems: DhikrItem[]) => {
    if (!categoryItems.length) return;
    setSessionItems(categoryItems);
    setSessionIndex(0);
    setIsSessionActive(true);
    playSessionItem(categoryItems, 0);
  };

  const playSessionItem = (items: DhikrItem[], idx: number) => {
    if (idx >= items.length) {
      setIsSessionActive(false);
      VoiceService.stop();
      return;
    }

    const current = items[idx];
    VoiceService.speakArabic(current.arabic, current.id, () => {
      // Auto-advance after item finishes
      setTimeout(() => {
        const nextIdx = idx + 1;
        setSessionIndex(nextIdx);
        if (nextIdx < items.length) {
          playSessionItem(items, nextIdx);
        } else {
          setIsSessionActive(false);
          addHasanat(50);
        }
      }, 1000);
    });
  };

  const stopSession = () => {
    setIsSessionActive(false);
    VoiceService.stop();
  };

  const queryLower = searchQuery.trim().toLowerCase();

  const filteredAdhkar = (selectedCategory === 'all' 
    ? ADHKAR 
    : ADHKAR.filter(c => c.id === selectedCategory)
  ).map(cat => {
    if (!queryLower) return cat;
    return {
      ...cat,
      items: cat.items.filter(item => 
        item.english.toLowerCase().includes(queryLower) ||
        item.benefit.toLowerCase().includes(queryLower) ||
        item.arabic.includes(searchQuery.trim()) ||
        (item.transliteration && item.transliteration.toLowerCase().includes(queryLower))
      )
    };
  }).filter(cat => cat.items.length > 0);

  const filteredNames = queryLower 
    ? NAMES_OF_ALLAH.filter(n => 
        n.english.toLowerCase().includes(queryLower) || 
        n.transliteration.toLowerCase().includes(queryLower) || 
        n.arabic.includes(searchQuery.trim())
      )
    : NAMES_OF_ALLAH;

  const totalDhikrCount = ADHKAR.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedDhikrCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedDhikrCount / totalDhikrCount) * 100));

  const fontClass = fontSizeScale === 'lg' ? 'text-3xl sm:text-4xl' : fontSizeScale === 'sm' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-20">
      
      {/* Top Banner & Spiritual Tracker */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-depth via-brand-primary/10 to-brand-depth border border-brand-primary/20 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>Sacred Remembrance • Hisnul Muslim</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Athkar & Duas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-md">
              "Verily, in the remembrance of Allah do hearts find rest." (Surah Ar-Ra'd 13:28)
            </p>
          </div>

          {/* Progress Bar & Hasanat stats */}
          <div className="bg-black/40 border border-white/10 p-3.5 sm:p-4 rounded-2xl sm:min-w-[220px] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Daily Completion</span>
              <span className="font-mono font-bold text-brand-primary">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-brand-primary to-amber-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{completedDhikrCount} of {totalDhikrCount} Finished</span>
              <span className="text-amber-300 font-bold">+{completedDhikrCount * 15} Hasanat</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Main Tab Switcher */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('adhkar')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'adhkar' 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Athkar
          </button>
          <button 
            onClick={() => setActiveTab('names')}
            className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeTab === 'names' 
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            99 Names of Allah
          </button>
        </div>

        {/* Font & Transliteration Toggles */}
        {activeTab === 'adhkar' && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowTransliteration(!showTransliteration)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                showTransliteration 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white/5 border-white/5 text-slate-500'
              }`}
              title="Toggle English pronunciation"
            >
              Abc Pronunciation
            </button>

            {/* Font Size Pills */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[11px] font-bold text-slate-400">
              <button 
                onClick={() => setFontSizeScale('sm')} 
                className={`px-2 py-1 rounded-lg transition-colors ${fontSizeScale === 'sm' ? 'bg-brand-primary text-white' : 'hover:text-white'}`}
              >
                A-
              </button>
              <button 
                onClick={() => setFontSizeScale('md')} 
                className={`px-2 py-1 rounded-lg transition-colors ${fontSizeScale === 'md' ? 'bg-brand-primary text-white' : 'hover:text-white'}`}
              >
                A
              </button>
              <button 
                onClick={() => setFontSizeScale('lg')} 
                className={`px-2 py-1 rounded-lg transition-colors ${fontSizeScale === 'lg' ? 'bg-brand-primary text-white' : 'hover:text-white'}`}
              >
                A+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills (Morning, Evening, Sleep, Forgiveness, After Swalah) */}
      {activeTab === 'adhkar' && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
              selectedCategory === 'all' 
                ? 'bg-white/20 border-white/30 text-white shadow-sm' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          {ADHKAR.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={14} />
                <span>{cat.category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'adhkar' ? (
          <motion.div 
            key="adhkar-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10"
          >
            {filteredAdhkar.map((cat) => {
              const Icon = cat.icon;
              return (
                <section key={cat.id} className="space-y-4">
                  {/* Category Header with Auto-Play Session Action */}
                  <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                          {cat.category} Remembrance
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {cat.items.length} Authentic Supplications
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => isSessionActive ? stopSession() : startSession(cat.items)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isSessionActive 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-accent border border-brand-primary/30'
                      }`}
                    >
                      {isSessionActive ? (
                        <>
                          <Pause size={13} />
                          <span>Stop Session</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} />
                          <span>Auto-Play {cat.category}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                    {cat.items.map((dhikr) => {
                      const isComplete = completedMap[dhikr.id];
                      const currentCount = counterMap[dhikr.id] || 0;
                      const isThisPlaying = playbackState.isPlaying && playbackState.activeId === dhikr.id;

                      return (
                        <motion.div
                          key={dhikr.id}
                          layout
                          className={`relative p-5 sm:p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
                            isComplete 
                              ? 'bg-emerald-500/[0.04] border-emerald-500/30 shadow-emerald-500/5' 
                              : isThisPlaying 
                                ? 'bg-brand-primary/10 border-brand-primary/40 ring-1 ring-brand-primary/30' 
                                : 'bg-white/5 hover:bg-white/[0.08] border-white/10 hover:border-brand-primary/20'
                          }`}
                        >
                          {/* Arabic Text & Recitation */}
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-accent text-[10px] font-bold uppercase tracking-wider">
                                  {dhikr.benefit.split('(')[0].trim()}
                                </span>
                              </div>

                              <button
                                onClick={() => toggleComplete(dhikr.id)}
                                className={`p-1.5 rounded-xl border transition-all ${
                                  isComplete 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                    : 'border-white/10 text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                                title={isComplete ? "Mark incomplete" : "Mark completed"}
                              >
                                <CheckCircle2 size={16} className={isComplete ? 'fill-current' : ''} />
                              </button>
                            </div>

                            {/* Arabic Script */}
                            <p 
                              className={`font-arabic text-right leading-loose text-amber-200/95 font-medium py-2 ${fontClass}`} 
                              dir="rtl"
                            >
                              {dhikr.arabic}
                            </p>

                            {/* Transliteration */}
                            {showTransliteration && dhikr.transliteration && (
                              <p className="text-xs text-brand-accent/80 italic font-mono leading-relaxed mt-2 mb-1">
                                {dhikr.transliteration}
                              </p>
                            )}

                            {/* English Translation */}
                            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed italic mt-2 mb-4">
                              "{dhikr.english}"
                            </p>
                          </div>

                          {/* Interactive Audio & Tasbih Counter Footer */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 mt-auto flex-wrap">
                            
                            {/* Audio Recite Buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handlePlayDhikr(dhikr, e)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  isThisPlaying && playbackState.mode !== 'both'
                                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                                }`}
                              >
                                {isThisPlaying && playbackState.mode !== 'both' ? <Pause size={12} className="fill-current" /> : <Volume2 size={12} />}
                                <span className="text-[11px]">Recite Voice</span>
                              </button>

                              <button
                                onClick={(e) => handlePlayBoth(dhikr, e)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hidden sm:flex ${
                                  isThisPlaying && playbackState.mode === 'both'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
                                }`}
                                title="Listen Arabic + English"
                              >
                                <Languages size={12} />
                                <span className="text-[11px]">Recite + Meaning</span>
                              </button>
                            </div>

                            {/* Sunnah Repetition Counter */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => handleIncrementCounter(dhikr, e)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                                  currentCount >= dhikr.targetCount
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 shadow-sm'
                                }`}
                              >
                                <Sparkles size={12} />
                                <span>{currentCount} / {dhikr.targetCount}x</span>
                              </button>

                              {currentCount > 0 && (
                                <button
                                  onClick={(e) => handleResetCounter(dhikr.id, e)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
                                  title="Reset counter"
                                >
                                  <RotateCcw size={12} />
                                </button>
                              )}
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </motion.div>
        ) : (
          /* 99 Names of Allah Tab */
          <motion.div 
            key="names-list"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredNames.map((name) => {
              const isPlayingName = playbackState.isPlaying && playbackState.activeId === `name-${name.id}`;
              return (
                <motion.div 
                  key={name.id}
                  className={`p-6 rounded-3xl border text-center transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                    isPlayingName 
                      ? 'bg-brand-primary/15 border-brand-primary/50 shadow-brand-primary/20' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-white/5 text-[11px] font-mono text-slate-400 flex items-center justify-center mx-auto">
                    {name.id}
                  </span>

                  <p className="font-arabic text-4xl text-amber-200 font-bold py-1">
                    {name.arabic}
                  </p>

                  <div className="space-y-0.5">
                    <h4 className="text-base font-extrabold text-white tracking-tight">
                      {name.transliteration}
                    </h4>
                    <p className="text-xs text-slate-400 font-light">
                      {name.english}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (isPlayingName) {
                        VoiceService.stop();
                      } else {
                        VoiceService.speakArabic(name.arabic, `name-${name.id}`);
                      }
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isPlayingName 
                        ? 'bg-brand-primary text-white shadow-md' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {isPlayingName ? <Pause size={13} className="fill-current" /> : <Volume2 size={13} />}
                    <span>{isPlayingName ? 'Playing Voice' : 'Pronounce'}</span>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Active Audio Session Bar */}
      {isSessionActive && sessionItems.length > 0 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 p-4 rounded-2xl bg-brand-depth/95 backdrop-blur-2xl border border-brand-primary/30 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 text-app-text"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0 animate-pulse">
              <Volume2 size={18} />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">
                Session ({sessionIndex + 1} of {sessionItems.length})
              </span>
              <p className="text-xs font-semibold text-white truncate">
                {sessionItems[sessionIndex]?.arabic}
              </p>
            </div>
          </div>

          <button
            onClick={stopSession}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-bold shrink-0 transition-colors"
          >
            End
          </button>
        </motion.div>
      )}

    </div>
  );
}
