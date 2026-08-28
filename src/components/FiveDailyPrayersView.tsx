import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  ShieldAlert, 
  ShieldCheck, 
  Heart, 
  Compass, 
  Clock, 
  Flame, 
  Layers, 
  Award, 
  Check, 
  Info, 
  HelpCircle, 
  ArrowLeft, 
  Share2, 
  Copy,
  Calendar,
  Sparkle
} from 'lucide-react';
import { shareService } from '../services/shareService';

interface PrayerDetail {
  id: string;
  name: string;
  arabicName: string;
  transliteration: string;
  meaning: string;
  timeWindow: string;
  fardRakats: number;
  sunnahBefore: number;
  sunnahAfter: number;
  witrOrNafl?: string;
  recitationStyle: 'Aloud (Jahri)' | 'Silent (Sirri)' | 'Mixed' | string;
  icon: any;
  color: string;
  accentBg: string;
  borderColor: string;
  summary: string;
  virtues: string[];
  authenticHadith: {
    arabic: string;
    text: string;
    source: string;
  };
  stepByStepKey: string;
}

const PRAYERS_DATA: PrayerDetail[] = [
  {
    id: 'fajr',
    name: 'Fajr',
    arabicName: 'صَلَاةُ الْفَجْرِ',
    transliteration: 'Salāt al-Fajr',
    meaning: 'The Dawn Prayer',
    timeWindow: 'From true dawn (Fajr Sadiq) until the moment before sunrise',
    fardRakats: 2,
    sunnahBefore: 2,
    sunnahAfter: 0,
    witrOrNafl: 'Sunnah Mu’akkadah before Fard (extremely emphasized)',
    recitationStyle: 'Aloud (Jahri)',
    icon: Sunrise,
    color: 'text-amber-400',
    accentBg: 'from-amber-500/20 via-orange-950/20 to-slate-900/80',
    borderColor: 'border-amber-500/30',
    summary: 'The awakening of the soul before the world begins. Establishes divine light, protection against hypocrisy, and guarantees the custody of Allah throughout the entire day.',
    virtues: [
      'The 2 Sunnah rak’ahs before Fajr are better than the entire world and everything in it (Sahih Muslim).',
      'Whoever prays Fajr is under the direct covenant and protection of Allah all day (Sahih Muslim).',
      'The angels of the night and the angels of the day gather specifically to witness the recitation of Fajr (Surah Al-Isra 17:78).',
      'Protection against the trial of hypocrisy; hypocrites find Fajr and Isha the heaviest prayers (Bukhari & Muslim).'
    ],
    authenticHadith: {
      arabic: 'رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا',
      text: 'The two [Sunnah] cycles of Fajr are better than the world and all that is within it.',
      source: 'Sahih Muslim 725'
    },
    stepByStepKey: '2 Rak’at Aloud'
  },
  {
    id: 'dhuhr',
    name: 'Dhuhr',
    arabicName: 'صَلَاةُ الظُّهْرِ',
    transliteration: 'Salāt aẓ-Ẓuhr',
    meaning: 'The Midday / Noon Prayer',
    timeWindow: 'From when the sun passes its zenith (midday meridian) until an object’s shadow equals its height',
    fardRakats: 4,
    sunnahBefore: 4,
    sunnahAfter: 2,
    witrOrNafl: '4 Sunnah before + 2 Sunnah after',
    recitationStyle: 'Silent (Sirri)',
    icon: Sun,
    color: 'text-yellow-400',
    accentBg: 'from-yellow-500/20 via-amber-950/20 to-slate-900/80',
    borderColor: 'border-yellow-500/30',
    summary: 'A sacred pause in the middle of daily labor. Disconnects the mind from worldly hustle and opens the celestial gates of divine mercy at midday.',
    virtues: [
      'The gates of heaven are opened at the meridian hour, and the Prophet ﷺ loved for good deeds to ascend at this time (Tirmidhi).',
      'Regular preservation of the 4 Sunnah before Dhuhr and 4 (2+2) after shields the believer from the fire of Hell (Sunan an-Nasa’i).',
      'Purges sins accumulated during morning work and resets spiritual focus for the second half of the day.'
    ],
    authenticHadith: {
      arabic: 'إِنَّهَا سَاعَةٌ تُفْتَحُ فِيهَا أَبْوَابُ السَّمَاءِ، فَأُحِبُّ أَنْ يَصْعَدَ لِي فِيهَا عَمَلٌ صَالِحٌ',
      text: 'It is an hour during which the gates of heaven are opened, and I love that a righteous deed should ascend for me during it.',
      source: 'Jami` at-Tirmidhi 478'
    },
    stepByStepKey: '4 Rak’at Silent'
  },
  {
    id: 'asr',
    name: 'Asr',
    arabicName: 'صَلَاةُ الْعَصْرِ',
    transliteration: 'Salāt al-‘Aṣr',
    meaning: 'The Late Afternoon Prayer (The Middle Prayer)',
    timeWindow: 'From when an object’s shadow equals its length until the sun turns pale yellow before setting',
    fardRakats: 4,
    sunnahBefore: 4,
    sunnahAfter: 0,
    witrOrNafl: '4 Sunnah Ghayr Mu’akkadah (Optional recommended)',
    recitationStyle: 'Silent (Sirri)',
    icon: Sun,
    color: 'text-orange-400',
    accentBg: 'from-orange-500/20 via-red-950/20 to-slate-900/80',
    borderColor: 'border-orange-500/30',
    summary: 'Singled out specifically by Allah in the Quran as "Al-Salat Al-Wusta" (The Middle Prayer). Missing it brings severe spiritual loss, while guarding it guarantees seeing Allah in Jannah.',
    virtues: [
      'Identified by the majority of scholars as the "Middle Prayer" mentioned in Surah Al-Baqarah 2:238.',
      'Whoever misses the Asr prayer deliberately, his good deeds are rendered null and void (Sahih al-Bukhari).',
      'The Prophet ﷺ promised: "You will see your Lord just as you see this moon... so if you can avoid being overwhelmed before sunrise and before sunset (Fajr & Asr), do so" (Bukhari & Muslim).'
    ],
    authenticHadith: {
      arabic: 'مَنْ تَرَكَ صَلاَةَ الْعَصْرِ فَقَدْ حَبِطَ عَمَلُهُ',
      text: 'Whoever leaves the Asr prayer deliberately, all his good deeds are rendered null and void.',
      source: 'Sahih al-Bukhari 553'
    },
    stepByStepKey: '4 Rak’at Silent'
  },
  {
    id: 'maghrib',
    name: 'Maghrib',
    arabicName: 'صَلَاةُ الْمَغْرِبِ',
    transliteration: 'Salāt al-Maghrib',
    meaning: 'The Sunset Prayer',
    timeWindow: 'Immediately after the sun completely disappears below the horizon until red twilight fades',
    fardRakats: 3,
    sunnahBefore: 2,
    sunnahAfter: 2,
    witrOrNafl: '2 Sunnah Mu’akkadah after Fard (and optional 2 before)',
    recitationStyle: 'Mixed (First 2 Rak’at Aloud, 3rd Silent)',
    icon: Sunset,
    color: 'text-rose-400',
    accentBg: 'from-rose-500/20 via-purple-950/20 to-slate-900/80',
    borderColor: 'border-rose-500/30',
    summary: 'The transition from day to night. Time of acceptance of prayers, breaking the fast, and reflecting upon the transient nature of worldly life.',
    virtues: [
      'The Prophet ﷺ never omitted the 2 Sunnah rak’ahs after Maghrib, whether resident or traveling.',
      'The time of Maghrib marks the daily renewal of the divine covenant as darkness falls.',
      'Supplication made at the moment of Maghrib adhan and between Maghrib and Isha is readily answered.'
    ],
    authenticHadith: {
      arabic: 'لاَ تَزَالُ أُمَّتِي بِخَيْرٍ مَا لَمْ يُؤَخِّرُوا الْمَغْرِبَ حَتَّى تَشْتَبِكَ النُّجُومُ',
      text: 'My Ummah will continue to be upon goodness so long as they do not delay Maghrib prayer until the stars intertwine.',
      source: 'Sunan Abi Dawud 418'
    },
    stepByStepKey: '3 Rak’at (2 Aloud + 1 Silent)'
  },
  {
    id: 'isha',
    name: 'Isha',
    arabicName: 'صَلَاةُ الْعِشَاءِ',
    transliteration: 'Salāt al-‘Ishā’',
    meaning: 'The Night Prayer',
    timeWindow: 'From the disappearance of the red twilight until Islamic midnight (halfway between sunset and dawn)',
    fardRakats: 4,
    sunnahBefore: 0,
    sunnahAfter: 2,
    witrOrNafl: '2 Sunnah Mu’akkadah after Fard + 1, 3, or 5 Rak’at Witr',
    recitationStyle: 'Mixed (First 2 Rak’at Aloud, last 2 Silent)',
    icon: Moon,
    color: 'text-indigo-400',
    accentBg: 'from-indigo-500/20 via-blue-950/20 to-slate-900/80',
    borderColor: 'border-indigo-500/30',
    summary: 'The crowning seal of the day’s deeds. Praying Isha in congregation brings the reward of standing half the night in continuous prayer.',
    virtues: [
      'Whoever prays Isha in congregation receives the reward of praying half the night in continuous tahajjud (Sahih Muslim).',
      'Followed by Salāt al-Witr, the most beloved voluntary prayer to Allah.',
      'Provides radiant light on the Day of Resurrection over the narrow bridge of Sirat.'
    ],
    authenticHadith: {
      arabic: 'مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ',
      text: 'Whoever prays Isha in congregation, it is as if he stood in prayer for half of the night.',
      source: 'Sahih Muslim 656'
    },
    stepByStepKey: '4 Rak’at (2 Aloud + 2 Silent) + Witr'
  }
];

interface PostureStep {
  stepNumber: number;
  title: string;
  arabicName: string;
  postureDescription: string;
  keyInstructions: string[];
  arabicRecitation: string;
  transliteration: string;
  translation: string;
  mistakesToAvoid: string[];
  svgAnimationType: 'takbir' | 'qiyam' | 'ruku' | 'qawmah' | 'sujud' | 'jalsah' | 'tashahhud' | 'taslim';
}

const PRAYER_POSTURE_STEPS: PostureStep[] = [
  {
    stepNumber: 1,
    title: 'Intention (Niyyah) & Opening Takbir',
    arabicName: 'تَكْبِيرَةُ الإِحْرَامِ',
    postureDescription: 'Stand upright facing the Qiblah with feet shoulder-width apart. Formulate sincere internal intention in your heart. Raise hands to earlobes or shoulders with palms facing forward.',
    keyInstructions: [
      'Intention is in the heart; pronouncing it verbally is not obligatory.',
      'Raise hands simultaneously while uttering "Allāhu Akbar".',
      'Once Takbir is pronounced, all worldly speech and food are consecrated/forbidden.'
    ],
    arabicRecitation: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allāhu Akbar',
    translation: 'Allah is the Greatest.',
    mistakesToAvoid: ['Looking up at the sky instead of the prostration spot.', 'Exaggerated hand swinging or touching earlobes aggressively.'],
    svgAnimationType: 'takbir'
  },
  {
    stepNumber: 2,
    title: 'Standing & Recitation (Qiyam & Al-Fatihah)',
    arabicName: 'الْقِيَامُ وَقِرَاءَةُ الْفَاتِحَةِ',
    postureDescription: 'Place your right hand over your left hand on your chest or above the navel. Fasten your gaze upon the spot where your forehead will touch during Sujud. Recite the Opening Dua, then Surah Al-Fatihah, followed by another Surah.',
    keyInstructions: [
      'Recite Surah Al-Fatihah slowly with paused breath between each Ayah.',
      'Recitation of Al-Fatihah is a pillar; prayer is invalid without it.',
      'Say "Ameen" softly or audibly with the congregation at the end.'
    ],
    arabicRecitation: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ • الرَّحْمَٰنِ الرَّحِيمِ • مَالِكِ يَوْمِ الدِّينِ • إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ • اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: 'Bismillāhir-Raḥmānir-Raḥīm. Al-ḥamdu lillāhi Rabbil-‘ālamīn. Ar-Raḥmānir-Raḥīm. Māliki Yawmid-Dīn. Iyyāka na‘budu wa iyyāka nasta‘īn. Ihdinaṣ-ṣirāṭal-mustaqīm. Ṣirāṭalladhīna an‘amta ‘alayhim, ghayril-maghḍūbi ‘alayhim wa laḍ-ḍāllīn.',
    translation: 'In the Name of Allah, the Most Compassionate, the Most Merciful. All praise is for Allah—Lord of all worlds. The Most Compassionate, the Most Merciful. Master of the Day of Judgment. You alone we worship and You alone we ask for help. Guide us along the Straight Path. The Path of those You have blessed—not those who have incurred Your wrath, or those who have gone astray.',
    mistakesToAvoid: ['Rushing through Fatihah without pauses.', 'Looking around or closing eyes continuously.'],
    svgAnimationType: 'qiyam'
  },
  {
    stepNumber: 3,
    title: 'Bowing (Ruku’)',
    arabicName: 'الرُّكُوعُ',
    postureDescription: 'Say "Allahu Akbar" and bow at the waist. Grasp your knees firmly with fingers spread wide like clamping. Keep your back straight horizontal like a tabletop, with head aligned with your spine.',
    keyInstructions: [
      'Achieve complete stillness (Tuma’ninah) in bowing.',
      'Repeat the tasbeeh at least 3 times calmly.',
      'Do not arch the back too high or dip the head too low.'
    ],
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ (×٣)',
    transliteration: 'Subḥāna Rabbiyal-‘Aẓīm (3x)',
    translation: 'Glory be to my Lord, the Magnificent (3 times).',
    mistakesToAvoid: ['Curving the spine hunchbacked.', 'Bending the elbows instead of resting hands firmly on knees.'],
    svgAnimationType: 'ruku'
  },
  {
    stepNumber: 4,
    title: 'Rising & Standing (Qawmah / I’tidal)',
    arabicName: 'الاعْتِدَالُ مِنَ الرُّكُوعِ',
    postureDescription: 'Rise smoothly from bowing while raising both hands to shoulder/ear level saying "Sami’Allahu liman hamidah". Stand completely upright with all vertebrae resting in place.',
    keyInstructions: [
      'Stand completely straight for at least a breath before descending.',
      'Recite the praise of Allah with heartfelt humility.'
    ],
    arabicRecitation: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ • رَبَّنَا وَلَكَ الْحَمْدُ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
    transliteration: 'Sami‘ Allāhu liman ḥamidah. Rabbanā wa lakal-ḥamd, ḥamdan kathīran ṭayyiban mubārakan fīh.',
    translation: 'Allah listens to those who praise Him. Our Lord, all praise is due to You—abundant, pure, and blessed praise.',
    mistakesToAvoid: ['Dropping straight into Sujud without pausing in full standing alignment.'],
    svgAnimationType: 'qawmah'
  },
  {
    stepNumber: 5,
    title: 'Prostration (Sujud)',
    arabicName: 'السُّجُودُ',
    postureDescription: 'Say "Allahu Akbar" and prostrate upon 7 designated limbs: forehead & nose firmly on the ground, both palms flat aligned with shoulders, both knees, and toes curled forward pointing to the Qiblah.',
    keyInstructions: [
      'The closest a servant ever is to Allah is while in Sujud.',
      'Keep your elbows lifted off the floor (do not rest arms like a dog).',
      'Make abundant sincere personal dua in prostration.'
    ],
    arabicRecitation: 'سُبْحَانَ رَبِّيَ الأَعْلَى (×٣)',
    transliteration: 'Subḥāna Rabbiyal-A‘lā (3x)',
    translation: 'Glory be to my Lord, the Most High (3 times).',
    mistakesToAvoid: ['Lifting toes or feet off the ground.', 'Resting forearms flat on the rug like a sphinx.'],
    svgAnimationType: 'sujud'
  },
  {
    stepNumber: 6,
    title: 'Sitting between Prostrations (Jalsah)',
    arabicName: 'الْجُلُوسُ بَيْنَ السَّجْدَتَيْنِ',
    postureDescription: 'Say "Allahu Akbar" and sit up straight. Fold your left foot flat beneath you to sit on it (Iftirash), while keeping your right foot upright with toes pointing toward the Qiblah. Rest palms on thighs.',
    keyInstructions: [
      'Pause in stillness and seek forgiveness from Allah.',
      'Then say "Allahu Akbar" and perform the 2nd Sujud identically.'
    ],
    arabicRecitation: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي، وَارْحَمْنِي، وَعَافِنِي، وَاهْدِنِي، وَارْزُقْنِي',
    transliteration: 'Rabbighfir lī, Rabbighfir lī, warḥamnī, wa ‘āfinī, wahdinī, warzuqnī.',
    translation: 'O my Lord, forgive me! Forgive me, have mercy on me, grant me well-being, guide me, and provide for me.',
    mistakesToAvoid: ['Bouncing up and down between sujuds like a peck of a bird without sitting still.'],
    svgAnimationType: 'jalsah'
  },
  {
    stepNumber: 7,
    title: 'Testimony of Faith (Tashahhud & Salawat)',
    arabicName: 'التَّشَهُّدُ وَالصَّلَاةُ الإِبْرَاهِيمِيَّةُ',
    postureDescription: 'Sit in final sitting posture. Place hands on knees/thighs. Clench the right fingers except the index finger. Raise and point the index finger slightly upward while reciting the Shahada.',
    keyInstructions: [
      'Recite At-Tahiyyat followed by the Durood Ibrahimiyyah on Prophet Muhammad ﷺ and Prophet Ibrahim ﷺ.',
      'Seek refuge from the 4 trials: punishment of Hell, grave, trials of life & death, and Dajjal.'
    ],
    arabicRecitation: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلاَمُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلاَمُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ. أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ. اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt. As-salāmu ‘alayka ayyuhan-Nabiyyu wa raḥmatullāhi wa barakātuh. As-salāmu ‘alaynā wa ‘alā ‘ibādillāhiṣ-ṣāliḥīn. Ash-hadu allā ilāha illallāh, wa ash-hadu anna Muḥammadan ‘abduhū wa Rasūluh. Allāhumma ṣalli ‘alā Muḥammadin wa ‘alā āli Muḥammad, kamā ṣallayta ‘alā Ibrāhīma wa ‘alā āli Ibrāhīm, innaka Ḥamīdum-Majīd.',
    translation: 'All compliments, prayers, and pure words are due to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger. O Allah, send peace upon Muhammad and the family of Muhammad, as You sent peace upon Abraham and the family of Abraham; indeed You are Praiseworthy and Glorious.',
    mistakesToAvoid: ['Swinging the index finger wildly instead of gentle focused pointing.'],
    svgAnimationType: 'tashahhud'
  },
  {
    stepNumber: 8,
    title: 'Ending Salam (Taslim)',
    arabicName: 'التَّسْلِيمُ',
    postureDescription: 'Turn your head fully to the right shoulder and utter "Assalamu alaykum wa rahmatullah", then turn your head fully to the left shoulder and repeat.',
    keyInstructions: [
      'Direct intention to greet the recording angels on your shoulders and your fellow worshippers.',
      'Concludes the official prayer before voluntary Adhkar.'
    ],
    arabicRecitation: 'السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ (يَمِينًا وَيَسَارًا)',
    transliteration: 'As-salāmu ‘alaykum wa raḥmatullāh',
    translation: 'Peace and the mercy of Allah be upon you (Right and Left).',
    mistakesToAvoid: ['Nodding the head down before turning left and right.'],
    svgAnimationType: 'taslim'
  }
];

export default function FiveDailyPrayersView({
  onBack,
  addHasanat
}: {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
}) {
  const [activeSection, setActiveSection] = useState<'overview' | 'prayers' | 'how_to_pray' | 'virtues' | 'punishment' | 'qadha'>('overview');
  const [selectedPrayerId, setSelectedPrayerId] = useState<string>('fajr');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Qadha Tracker State
  const [missedFajr, setMissedFajr] = useState<number>(0);
  const [missedDhuhr, setMissedDhuhr] = useState<number>(0);
  const [missedAsr, setMissedAsr] = useState<number>(0);
  const [missedMaghrib, setMissedMaghrib] = useState<number>(0);
  const [missedIsha, setMissedIsha] = useState<number>(0);
  const [repaidCount, setRepaidCount] = useState<number>(0);

  // Load saved Qadha count from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanctuary_qadha_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMissedFajr(parsed.fajr || 0);
        setMissedDhuhr(parsed.dhuhr || 0);
        setMissedAsr(parsed.asr || 0);
        setMissedMaghrib(parsed.maghrib || 0);
        setMissedIsha(parsed.isha || 0);
        setRepaidCount(parsed.repaid || 0);
      }
    } catch (e) {}
  }, []);

  const saveQadha = (f: number, d: number, a: number, m: number, i: number, r: number) => {
    localStorage.setItem('sanctuary_qadha_state', JSON.stringify({
      fajr: f, dhuhr: d, asr: a, maghrib: m, isha: i, repaid: r
    }));
  };

  const selectedPrayer = PRAYERS_DATA.find(p => p.id === selectedPrayerId) || PRAYERS_DATA[0];
  const activeStep = PRAYER_POSTURE_STEPS[activeStepIndex];

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSpeakRecitation = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const totalMissed = missedFajr + missedDhuhr + missedAsr + missedMaghrib + missedIsha;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. TOP HERO BANNER */}
      <div className="relative rounded-[3rem] p-8 sm:p-12 overflow-hidden border border-amber-500/30 bg-gradient-to-br from-[#061828]/95 via-[#03101C]/90 to-[#020A12]/95 shadow-2xl backdrop-blur-2xl">
        {/* Glow Spheres */}
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            {onBack && (
              <button 
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mb-2"
              >
                <ArrowLeft size={14} />
                <span>Return to Sanctuary</span>
              </button>
            )}

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-[0.25em]">
              <Sparkles size={14} />
              <span>The Second Pillar of Islam</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              The 5 Daily Prayers Guide <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-emerald-300 font-serif font-arabic">
                الصَّلَوَاتُ الْخَمْسُ الْمَفْرُوضَةُ
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Salah is the direct celestial ascension (Mi’raj) of the believer. Discover the sacred timings, step-by-step recitations, profound benefits, animated postures, and the grave warnings against neglecting the divine covenant.
            </p>
          </div>

          {/* Quick Summary Pill Badge */}
          <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-3xl font-black text-amber-300 font-mono">17</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fard Rak’at Daily</p>
            </div>
            <button
              onClick={() => {
                if (addHasanat) addHasanat(15);
                shareService.open({
                  title: 'The Five Daily Prayers Guide',
                  text: 'Explore the complete guide to the Five Daily Prayers, virtues, step-by-step recitations, and warnings on Aloha Sanctuary.',
                  url: window.location.href
                });
              }}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-brand-depth font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Share2 size={16} />
              <span>Share Master Guide</span>
            </button>
          </div>
        </div>

        {/* 2. SECTION NAVIGATION TABS */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide border-t border-white/10 pt-6">
          {[
            { id: 'overview', label: '5 Prayers Overview', icon: Clock },
            { id: 'prayers', label: 'Detailed Breakdown', icon: Layers },
            { id: 'how_to_pray', label: 'Animated Walkthrough', icon: Sparkles },
            { id: 'virtues', label: 'Divine Benefits', icon: ShieldCheck },
            { id: 'punishment', label: 'Punishment & Warnings', icon: ShieldAlert },
            { id: 'qadha', label: 'Missed Qadha Plan', icon: RotateCcw }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive 
                    ? 'bg-amber-400 text-brand-depth shadow-xl shadow-amber-400/20 scale-105' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. SECTION CONTENT SWITCHER */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: 5 PRAYERS OVERVIEW GRID */}
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Daily Prayer Matrix</h2>
                <p className="text-slate-400 text-xs">The five mandatory stations of spiritual connection each day</p>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
                5 Daily Stations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRAYERS_DATA.map((prayer) => {
                const Icon = prayer.icon;
                return (
                  <div
                    key={prayer.id}
                    onClick={() => {
                      setSelectedPrayerId(prayer.id);
                      setActiveSection('prayers');
                    }}
                    className={`p-7 rounded-[2.5rem] bg-gradient-to-br ${prayer.accentBg} border ${prayer.borderColor} relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer group shadow-xl space-y-5`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center ${prayer.color} shadow-inner border border-white/10 group-hover:scale-110 transition-transform`}>
                        <Icon size={28} />
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-arabic font-bold text-white block">{prayer.arabicName}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{prayer.transliteration}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-white">{prayer.name} Prayer</h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{prayer.summary}</p>
                    </div>

                    {/* Breakdown Pill */}
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">Obligatory (Fard):</span>
                        <span className="font-mono font-black text-white">{prayer.fardRakats} Rak’at</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">Recitation Style:</span>
                        <span className="font-semibold text-amber-300">{prayer.recitationStyle}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-black uppercase tracking-wider text-amber-300 group-hover:translate-x-1 transition-transform">
                      <span>Explore Detailed Guidance</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}

              {/* Bonus Card: Salāt al-Jumu'ah (Friday Prayer) */}
              <div className="p-7 rounded-[2.5rem] bg-gradient-to-br from-emerald-950/40 via-teal-950/30 to-slate-900/80 border border-emerald-500/30 relative overflow-hidden shadow-xl space-y-5">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner border border-emerald-500/20">
                    <Calendar size={28} />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-arabic font-bold text-emerald-300 block">صَلَاةُ الْجُمُعَةِ</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Friday Gathering</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Friday Jumu’ah Prayer</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Replaces Dhuhr on Fridays for men in congregation. Consists of 2 Khutbah speeches + 2 Fard Rak’ats recited aloud.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Format:</span>
                    <span className="font-mono font-black text-emerald-300">2 Khutbahs + 2 Fard</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">Special Sunnah:</span>
                    <span className="font-semibold text-emerald-300">Ghusl, Surah Al-Kahf</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DETAILED PRAYER BREAKDOWN */}
        {activeSection === 'prayers' && (
          <motion.div
            key="prayers"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Prayer Picker Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {PRAYERS_DATA.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrayerId(p.id)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedPrayerId === p.id 
                      ? 'bg-amber-400 text-brand-depth shadow-lg shadow-amber-400/20 scale-105' 
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {p.name} ({p.arabicName})
                </button>
              ))}
            </div>

            {/* Selected Prayer Deep Dive Container */}
            <div className={`p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br ${selectedPrayer.accentBg} border ${selectedPrayer.borderColor} shadow-2xl space-y-8`}>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-white">{selectedPrayer.name} Prayer</span>
                    <span className="text-2xl sm:text-3xl font-arabic font-bold text-amber-300">{selectedPrayer.arabicName}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">{selectedPrayer.meaning} &bull; {selectedPrayer.timeWindow}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center">
                    <span className="text-lg font-black text-amber-300 font-mono">{selectedPrayer.fardRakats}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Fard Rak’at</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-center">
                    <span className="text-lg font-black text-emerald-300 font-mono">{selectedPrayer.sunnahBefore + selectedPrayer.sunnahAfter}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Sunnah Rak’at</span>
                  </div>
                </div>
              </div>

              {/* Rak’at Breakdown Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Before Fard</span>
                  <p className="text-base font-black text-white">{selectedPrayer.sunnahBefore > 0 ? `${selectedPrayer.sunnahBefore} Sunnah Rak’at` : 'No Sunnah Before'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-400/30 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Obligatory Core</span>
                  <p className="text-base font-black text-amber-100">{selectedPrayer.fardRakats} Fard ({selectedPrayer.recitationStyle})</p>
                </div>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">After Fard</span>
                  <p className="text-base font-black text-white">{selectedPrayer.sunnahAfter > 0 ? `${selectedPrayer.sunnahAfter} Sunnah Rak’at` : 'No Sunnah After'}</p>
                </div>
              </div>

              {/* Authentic Hadith Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-amber-400/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 flex items-center gap-2">
                    <BookOpen size={14} /> Authentic Hadith
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedPrayer.authenticHadith.source}</span>
                </div>
                <p className="text-xl sm:text-2xl font-arabic text-amber-100 text-right leading-loose">
                  {selectedPrayer.authenticHadith.arabic}
                </p>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{selectedPrayer.authenticHadith.text}"
                </p>
              </div>

              {/* Virtues List */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Key Virtues & Divine Spiritual Rewards</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPrayer.virtues.map((v, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-200 leading-relaxed">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ANIMATED HOW TO PRAY STEP-BY-STEP */}
        {activeSection === 'how_to_pray' && (
          <motion.div
            key="how_to_pray"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Interactive Prayer Posture Studio</h2>
                <p className="text-slate-400 text-xs">Step-by-step recitations, animated physical postures, and common mistakes to avoid</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStepIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeStepIndex === 0}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-all cursor-pointer"
                  title="Previous Step"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-mono font-black text-amber-300 px-3">
                  Step {activeStepIndex + 1} of {PRAYER_POSTURE_STEPS.length}
                </span>
                <button
                  onClick={() => setActiveStepIndex(prev => Math.min(PRAYER_POSTURE_STEPS.length - 1, prev + 1))}
                  disabled={activeStepIndex === PRAYER_POSTURE_STEPS.length - 1}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 transition-all cursor-pointer"
                  title="Next Step"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Posture Scrubber Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {PRAYER_POSTURE_STEPS.map((step, idx) => (
                <button
                  key={step.stepNumber}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                    activeStepIndex === idx 
                      ? 'bg-amber-400 text-brand-depth font-black shadow-lg shadow-amber-400/20' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
                    {step.stepNumber}
                  </span>
                  <span>{step.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Step Showcase Card */}
            <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-[#071F36] via-[#041324] to-[#020A12] border border-amber-500/30 shadow-2xl space-y-8">
              
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                    <span>Posture #{activeStep.stepNumber}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{activeStep.title}</h3>
                  <span className="text-xl font-arabic text-amber-300 block">{activeStep.arabicName}</span>
                </div>

                {/* Audio Pronunciation Trigger */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSpeakRecitation(activeStep.arabicRecitation)}
                    className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    {isPlayingAudio ? <VolumeX size={16} className="text-amber-400" /> : <Volume2 size={16} className="text-amber-400" />}
                    <span>{isPlayingAudio ? 'Stop Recitation' : 'Listen Pronunciation'}</span>
                  </button>
                  <button
                    onClick={() => handleCopyText(`${activeStep.arabicRecitation}\n${activeStep.transliteration}\n"${activeStep.translation}"`, `step_${activeStep.stepNumber}`)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Copy Recitation"
                  >
                    {copiedKey === `step_${activeStep.stepNumber}` ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Posture Description & Graphic Alignment */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* SVG Silhouette Animation Box */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-3xl bg-black/60 border border-white/10 relative overflow-hidden">
                  <motion.div
                    key={activeStep.stepNumber}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-40 h-48 flex items-center justify-center text-amber-300"
                  >
                    {activeStep.svgAnimationType === 'takbir' && (
                      <svg viewBox="0 0 100 120" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="50" cy="22" r="10" />
                        <line x1="50" y1="32" x2="50" y2="75" />
                        <line x1="50" y1="45" x2="30" y2="28" />
                        <line x1="30" y1="28" x2="25" y2="18" />
                        <line x1="50" y1="45" x2="70" y2="28" />
                        <line x1="70" y1="28" x2="75" y2="18" />
                        <line x1="50" y1="75" x2="38" y2="115" />
                        <line x1="50" y1="75" x2="62" y2="115" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'qiyam' && (
                      <svg viewBox="0 0 100 120" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="50" cy="20" r="10" />
                        <line x1="50" y1="30" x2="50" y2="75" />
                        <path d="M 50 45 L 42 55 L 58 55 L 50 45" />
                        <line x1="50" y1="75" x2="40" y2="115" />
                        <line x1="50" y1="75" x2="60" y2="115" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'ruku' && (
                      <svg viewBox="0 0 120 100" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="30" cy="40" r="10" />
                        <line x1="38" y1="40" x2="75" y2="40" />
                        <line x1="75" y1="40" x2="75" y2="90" />
                        <line x1="52" y1="40" x2="75" y2="65" />
                        <line x1="75" y1="90" x2="85" y2="90" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'qawmah' && (
                      <svg viewBox="0 0 100 120" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="50" cy="20" r="10" />
                        <line x1="50" y1="30" x2="50" y2="75" />
                        <line x1="50" y1="40" x2="35" y2="70" />
                        <line x1="50" y1="40" x2="65" y2="70" />
                        <line x1="50" y1="75" x2="42" y2="115" />
                        <line x1="50" y1="75" x2="58" y2="115" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'sujud' && (
                      <svg viewBox="0 0 120 80" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="25" cy="65" r="9" />
                        <line x1="34" y1="65" x2="55" y2="35" />
                        <line x1="55" y1="35" x2="90" y2="65" />
                        <line x1="45" y1="48" x2="35" y2="68" />
                        <line x1="90" y1="65" x2="105" y2="65" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'jalsah' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="45" cy="30" r="10" />
                        <line x1="45" y1="40" x2="45" y2="65" />
                        <line x1="45" y1="65" x2="25" y2="85" />
                        <line x1="25" y1="85" x2="75" y2="85" />
                        <line x1="45" y1="50" x2="60" y2="70" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'tashahhud' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="45" cy="28" r="10" />
                        <line x1="45" y1="38" x2="45" y2="65" />
                        <line x1="45" y1="65" x2="25" y2="85" />
                        <line x1="25" y1="85" x2="75" y2="85" />
                        <line x1="45" y1="48" x2="65" y2="60" />
                        <line x1="65" y1="60" x2="75" y2="52" />
                      </svg>
                    )}
                    {activeStep.svgAnimationType === 'taslim' && (
                      <svg viewBox="0 0 100 100" className="w-full h-full stroke-amber-400 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
                        <circle cx="45" cy="30" r="10" />
                        <line x1="45" y1="40" x2="45" y2="68" />
                        <line x1="45" y1="68" x2="25" y2="88" />
                        <line x1="25" y1="88" x2="75" y2="88" />
                        <path d="M 55 30 L 68 25 L 68 35 Z" fill="#f59e0b" />
                      </svg>
                    )}
                  </motion.div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Anatomical Alignment</span>
                </div>

                {/* Instructions & Key Rules */}
                <div className="lg:col-span-8 space-y-4">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                    {activeStep.postureDescription}
                  </p>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">Core Requirements:</span>
                    {activeStep.keyInstructions.map((inst, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sacred Recitation Block */}
              <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-amber-400/25 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Exact Recitation in Arabic</span>
                </div>

                <p className="text-xl sm:text-2xl md:text-3xl font-arabic text-amber-100 text-right leading-loose selection:bg-amber-400/30">
                  {activeStep.arabicRecitation}
                </p>

                <div className="pt-4 border-t border-white/10 space-y-2">
                  <p className="text-xs font-mono text-amber-300/90 leading-relaxed">
                    <span className="font-bold text-slate-400 font-sans">Phonetic: </span>
                    {activeStep.transliteration}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    <span className="font-bold text-slate-400 not-italic">Meaning: </span>
                    "{activeStep.translation}"
                  </p>
                </div>
              </div>

              {/* Mistakes to Avoid */}
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                  <AlertTriangle size={15} /> Mistakes to Avoid in this Posture
                </span>
                <ul className="space-y-1">
                  {activeStep.mistakesToAvoid.map((mistake, i) => (
                    <li key={i} className="text-xs text-red-200/90 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: VIRTUES & BENEFITS */}
        {activeSection === 'virtues' && (
          <motion.div
            key="virtues"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">The Multi-Dimensional Benefits of Salah</h2>
              <p className="text-slate-400 text-xs">Spiritual, psychological, physical, and eternal rewards promised by Allah</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. Spiritual Washing */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-black/80 border border-blue-500/30 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Daily Purification of Sins</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  The Prophet ﷺ compared the 5 prayers to a deep flowing river in front of one’s house in which one bathes 5 times a day: <em>"Would any dirt remain upon him?"</em> They said: <em>"No dirt would remain."</em> He said: <em>"That is the likeness of the five prayers by which Allah erases sins."</em> (Bukhari & Muslim)
                </p>
              </div>

              {/* 2. Mental Peace & Antidote to Anxiety */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-black/80 border border-emerald-500/30 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Heart size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Mental Serenity & Anxiety Relief</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Whenever the Prophet ﷺ faced a distressing matter or heavy tribulation, he immediately rushed to prayer and would say: <em>"O Bilal, give the call to prayer; bring us solace and tranquility through it!"</em> (Sunan Abi Dawud)
                </p>
              </div>

              {/* 3. Shield against Immorality & Sin */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-black/80 border border-amber-500/30 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Restraint from Immorality & Evil</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Allah says in the Quran: <em>"Indeed, genuine prayer restrains from shameful acts and unjust deeds, and the remembrance of Allah is greater."</em> (Surah Al-Ankabut 29:45)
                </p>
              </div>

              {/* 4. Physical Vitality & Circulation */}
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-black/80 border border-purple-500/30 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Flame size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Physical Health & Alignment</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Regular transitions between standing, bowing, and prostration stimulate cerebral blood flow, alleviate spine compression, exercise major joints and muscle groups, and induce parasympathetic nervous recovery.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: PUNISHMENTS & WARNINGS FOR ABANDONING PRAYER */}
        {activeSection === 'punishment' && (
          <motion.div
            key="punishment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert size={32} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">The Gravity of Abandoning Prayer (Tark as-Salah)</h2>
                <p className="text-xs text-red-300 font-medium leading-relaxed">
                  In Islamic jurisprudence, Salah is not merely an optional virtue; it is the definitive boundary between faith and destruction.
                </p>
              </div>
            </div>

            {/* Quranic Warnings */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-red-400" />
                <span>Explicit Quranic Verses on Abandoning / Delaying Prayer</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Surah Al-Muddaththir */}
                <div className="p-7 rounded-[2.5rem] bg-black/60 border border-red-500/30 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">Surah Al-Muddaththir 74:42-43</span>
                  <p className="text-lg font-arabic text-red-200 text-right leading-loose">
                    مَا سَلَكَكُمْ فِي سَقَرَ • قَالُوا لَمْ نَكُ مِنَ الْمُصَلِّينَ
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "‘What caused you to enter Hellfire (Saqar)?’ They will reply: ‘We were not of those who prayed.’"
                  </p>
                </div>

                {/* 2. Surah Maryam */}
                <div className="p-7 rounded-[2.5rem] bg-black/60 border border-red-500/30 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">Surah Maryam 19:59</span>
                  <p className="text-lg font-arabic text-red-200 text-right leading-loose">
                    فَخَلَفَ مِن بَعْدِهِمْ خَلْفٌ أَضَاعُوا الصَّلَاةَ وَاتَّبَعُوا الشَّهَوَاتِ ۖ فَسَوْفَ يَلْقَوْنَ غَيًّا
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "Then there succeeded after them successors who neglected prayer and pursued lusts; so they will meet destruction (Ghayy—a valley of torment in Hell)."
                  </p>
                </div>

                {/* 3. Surah Al-Ma'un */}
                <div className="p-7 rounded-[2.5rem] bg-black/60 border border-red-500/30 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400">Surah Al-Ma’un 107:4-5</span>
                  <p className="text-lg font-arabic text-red-200 text-right leading-loose">
                    فَوَيْلٌ لِّلْمُصَلِّينَ • الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "So woe to those who pray, but who are heedless and delay their prayers past their prescribed times."
                  </p>
                </div>
              </div>
            </div>

            {/* Prophetic Warnings */}
            <div className="p-8 sm:p-10 rounded-[3rem] bg-gradient-to-br from-red-950/40 via-black/80 to-slate-900 border border-red-500/40 space-y-6">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-400" />
                <span>Authentic Prophetic Declarations</span>
              </h3>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-sm font-black text-red-300">1. The Covenant of Faith</p>
                  <p className="text-xs sm:text-sm text-slate-200 italic">
                    "The covenant between us and them is prayer; whoever abandons it has committed disbelief." (Jami` at-Tirmidhi 2621, authentic)
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-sm font-black text-red-300">2. The First Audit on the Day of Judgment</p>
                  <p className="text-xs sm:text-sm text-slate-200 italic">
                    "The very first matter that the servant will be brought to account for on the Day of Judgment is his prayer. If it is sound, he has triumphed and succeeded; but if it is corrupt, he has failed and lost." (Sunan an-Nasa’i 465)
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-sm font-black text-red-300">3. Darkened State in the Grave</p>
                  <p className="text-xs sm:text-sm text-slate-200 italic">
                    Whoever does not guard prayer will have neither light, proof, nor salvation on the Day of Resurrection, and will be resurrected alongside Pharaoh, Haman, and Qarun. (Musnad Ahmad)
                  </p>
                </div>
              </div>

              {/* The Gateway of Hope & Tawbah */}
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <ShieldCheck size={16} /> The Door of Sincere Repentance (Tawbah) is Wide Open
                </span>
                <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                  No matter how many prayers you have missed in the past, Allah forgives all sins upon true remorse and immediate return. Start today with a single prayer, resolve never to abandon it again, and begin making up missed obligations steadily.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 6: QADHA MISSED PRAYERS CALCULATOR */}
        {activeSection === 'qadha' && (
          <motion.div
            key="qadha"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Qadha (Missed Prayers) Recovery Studio</h2>
              <p className="text-slate-400 text-xs">Calculate estimated unperformed prayers and build a steady repayment habit</p>
            </div>

            <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-[#061828]/95 via-brand-sidebar to-black/80 border border-amber-500/30 shadow-2xl space-y-8">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">Daily Qadha Counter</h3>
                  <p className="text-xs text-slate-300">Rule: Pray one missed prayer with every current obligatory prayer (e.g. 1 Fajr Qadha with today’s Fajr).</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-amber-300 font-mono">{totalMissed}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Pending Missed</span>
                </div>
              </div>

              {/* 5 Counter Rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { name: 'Fajr', val: missedFajr, set: (n: number) => { setMissedFajr(n); saveQadha(n, missedDhuhr, missedAsr, missedMaghrib, missedIsha, repaidCount); } },
                  { name: 'Dhuhr', val: missedDhuhr, set: (n: number) => { setMissedDhuhr(n); saveQadha(missedFajr, n, missedAsr, missedMaghrib, missedIsha, repaidCount); } },
                  { name: 'Asr', val: missedAsr, set: (n: number) => { setMissedAsr(n); saveQadha(missedFajr, missedDhuhr, n, missedMaghrib, missedIsha, repaidCount); } },
                  { name: 'Maghrib', val: missedMaghrib, set: (n: number) => { setMissedMaghrib(n); saveQadha(missedFajr, missedDhuhr, missedAsr, n, missedIsha, repaidCount); } },
                  { name: 'Isha', val: missedIsha, set: (n: number) => { setMissedIsha(n); saveQadha(missedFajr, missedDhuhr, missedAsr, missedMaghrib, n, repaidCount); } }
                ].map((item) => (
                  <div key={item.name} className="p-5 rounded-2xl bg-black/50 border border-white/10 text-center space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300">{item.name}</span>
                    <p className="text-2xl font-black text-amber-300 font-mono">{item.val}</p>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => item.set(Math.max(0, item.val - 1))}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => item.set(item.val + 5)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Repay Action Button */}
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-sm font-black text-white">Completed a Qadha Set Today?</span>
                  <p className="text-xs text-emerald-300">Tap below to log completed prayers and claim +25 Hasanat.</p>
                </div>
                <button
                  onClick={() => {
                    const newF = Math.max(0, missedFajr - 1);
                    const newD = Math.max(0, missedDhuhr - 1);
                    const newA = Math.max(0, missedAsr - 1);
                    const newM = Math.max(0, missedMaghrib - 1);
                    const newI = Math.max(0, missedIsha - 1);
                    const newR = repaidCount + 5;
                    setMissedFajr(newF);
                    setMissedDhuhr(newD);
                    setMissedAsr(newA);
                    setMissedMaghrib(newM);
                    setMissedIsha(newI);
                    setRepaidCount(newR);
                    saveQadha(newF, newD, newA, newM, newI, newR);
                    if (addHasanat) addHasanat(25);
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-brand-depth font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
                >
                  Log 1 Full Day Completed (+25)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
