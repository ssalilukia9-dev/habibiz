import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Maximize2, 
  CheckCircle2, 
  ArrowRight, 
  Sun, 
  Moon, 
  Coins, 
  Heart, 
  Video, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Search,
  Check,
  Copy,
  BookOpen,
  HelpCircle,
  Flame,
  Volume2,
  X
} from 'lucide-react';

export interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  speaker: string;
  duration: string;
  videoUrl: string;
  embedId: string;
  thumbnailUrl: string;
  category: 'Masterclass' | 'Step-by-Step' | 'Wudu & Prep' | 'Common Mistakes' | 'Pronunciation & Duas' | 'Animated Guide';
  description: string;
  keyTimestamps: { time: string; seconds: number; title: string; note: string }[];
}

export interface PillarMediaGuide {
  pillarId: string;
  pillarName: string;
  pillarArabic: string;
  videos: VideoItem[];
  animationDetails: {
    title: string;
    description: string;
    stages: { id: string; name: string; arabic: string; explanation: string }[];
  };
}

export const PILLAR_MEDIA_GUIDES: Record<string, PillarMediaGuide> = {
  shahada: {
    pillarId: 'shahada',
    pillarName: 'The Shahadah',
    pillarArabic: 'الشَّهَادَةُ',
    videos: [
      {
        id: 'shahada_main',
        title: 'The Essence & 7 Conditions of the Shahadah',
        subtitle: 'The foundational declaration of Islamic Monotheism (Tawhid)',
        speaker: 'Comprehensive Islamic Guide',
        duration: '14:20',
        videoUrl: 'https://www.youtube.com/watch?v=F_f8rZp5gY8',
        embedId: 'F_f8rZp5gY8',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80',
        category: 'Masterclass',
        description: 'A profound visual exposition of the two testimonies: "Ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadan Rasulullah." Understand the difference between mere tongue pronunciation and living the conditions of knowledge, certainty, sincere devotion, and love.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'The Weight of the Kalimah', note: 'Heavier on the scale than the seven heavens and earth' },
          { time: '03:45', seconds: 225, title: 'Negation (La Ilaha) & Affirmation (Illallah)', note: 'Completely eradicating all false idols before affirming the Creator' },
          { time: '08:15', seconds: 495, title: 'The 7 Essential Conditions', note: 'Knowledge (Ilm), Certainty (Yaqeen), Sincerity (Ikhlas), Truthfulness (Sidq), Love (Mahabbah), Submission (Inqiyad), and Acceptance (Qabul)' },
          { time: '12:00', seconds: 720, title: 'The Testimony of Prophethood', note: 'Following the Sunnah and exemplary character of the Final Messenger ﷺ' }
        ]
      },
      {
        id: 'shahada_reverts',
        title: 'How to Take the Shahadah for Beginners & Reverts',
        subtitle: 'Arabic pronunciation, English translation, and immediate next steps',
        speaker: 'Step-by-Step New Muslim Guide',
        duration: '08:35',
        videoUrl: 'https://www.youtube.com/watch?v=W9j3_22v3vY',
        embedId: 'W9j3_22v3vY',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=1200&q=80',
        category: 'Step-by-Step',
        description: 'Clear, phonetic step-by-step breakdown of how to recite the testimony of faith with conviction, understanding every word, followed by essential first practices (Ghusl, basic prayer steps, and community support).',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Intention and Sincerity', note: 'Entering Islam with pure heart' },
          { time: '02:10', seconds: 130, title: 'Slow Phonetic Recitation', note: 'Practicing the Arabic syllables clearly' },
          { time: '05:00', seconds: 300, title: 'What Changes After Shahadah', note: 'All past sins forgiven, fresh clean slate' }
        ]
      }
    ],
    animationDetails: {
      title: 'Tawhid Radiant Starburst & Spiritual Affirmation',
      description: 'Watch the light of Monotheism disperse doubts and ignite the spiritual heart.',
      stages: [
        { id: '1', name: 'Al-Nafy (The Negation)', arabic: 'لا إِلٰهَ', explanation: 'Denial of all false deities, ego worshipping, materialism, and superstitions.' },
        { id: '2', name: 'Al-Ithbat (The Affirmation)', arabic: 'إِلَّا اللّٰهُ', explanation: 'Affirming singular, undisputed sovereignty and worship exclusively to Allah.' },
        { id: '3', name: 'Al-Risalah (The Messenger)', arabic: 'مُحَمَّدٌ رَسُولُ اللّٰهِ', explanation: 'Accepting the final revelation and following the living sunnah of Prophet Muhammad ﷺ.' }
      ]
    }
  },
  salah: {
    pillarId: 'salah',
    pillarName: 'The Salah (Prayer)',
    pillarArabic: 'الصَّلَاةُ',
    videos: [
      {
        id: 'salah_complete',
        title: 'The Complete Step-by-Step Salah Guide (2, 3 & 4 Rak’ats)',
        subtitle: 'Authentic guide to praying exactly as Prophet Muhammad ﷺ taught',
        speaker: 'One Islam Productions / Authentic Sunnah Guide',
        duration: '18:45',
        videoUrl: 'https://www.youtube.com/watch?v=k4m_w0rQvG4',
        embedId: 'k4m_w0rQvG4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
        category: 'Masterclass',
        description: 'The definitive visual prayer masterclass. Follow from the opening Takbiratul Ihram, hand placement, recitation of Surat Al-Fatiha, precise Ruku bowing, rising in I’tidal, dual Sujud prostration, sitting in Jalsah, Tashahhud recitation, and concluding Tasleem.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Prerequisites: Taharah & Qiblah', note: 'Purifying the body and orienting towards Makkah' },
          { time: '02:30', seconds: 150, title: 'Takbiratul Ihram & Qiyam', note: 'Raising hands and placing right over left' },
          { time: '06:10', seconds: 370, title: 'The Perfect Ruku (Bowing)', note: 'Flat back aligned horizontally with head' },
          { time: '10:45', seconds: 645, title: 'The Peak of Proximity: Sujud', note: 'Prostrating on seven bones with total humility' },
          { time: '15:20', seconds: 920, title: 'Tashahhud & Final Tasleem', note: 'Reciting At-Tahiyyat and turning right and left' }
        ]
      },
      {
        id: 'salah_wudu',
        title: 'How to Perform Wudu (Ablution) Step by Step',
        subtitle: 'The essential physical & spiritual purification key to prayer',
        speaker: 'Prophetic Method Tutorial',
        duration: '06:30',
        videoUrl: 'https://www.youtube.com/watch?v=kQj_3z7M068',
        embedId: 'kQj_3z7M068',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
        category: 'Wudu & Prep',
        description: 'Complete guide to the ablution: washing hands 3 times, rinsing mouth and nose, washing face, arms up to elbows, wiping the head, ears, and washing feet up to ankles, with closing Dua.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Intention & Bismillah', note: 'Initiating Wudu with clean water' },
          { time: '01:15', seconds: 75, title: 'Washing Face & Forearms', note: 'Ensuring full coverage from hairline to chin' },
          { time: '03:40', seconds: 220, title: 'Wiping Head & Washing Feet', note: 'Completing the Sunnah sequence' },
          { time: '05:10', seconds: 310, title: 'Dua After Wudu', note: 'Eight gates of Paradise opened for the reciter' }
        ]
      },
      {
        id: 'salah_mistakes',
        title: 'Common Mistakes in Salah & How to Correct Them',
        subtitle: 'Rushing, improper back alignment, moving before the Imam, and distracted Khushu',
        speaker: 'Fiqh of Prayer Mastery',
        duration: '11:15',
        videoUrl: 'https://www.youtube.com/watch?v=I0mQYgG_bEQ',
        embedId: 'I0mQYgG_bEQ',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
        category: 'Common Mistakes',
        description: 'Learn the most frequent errors made in daily prayers and how to achieve tranquility (Tuma’ninah) and deep focus in every single unit of prayer.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Lack of Tuma’ninah (Tranquility)', note: 'Pausing until all joints rest before moving' },
          { time: '03:20', seconds: 200, title: 'Looking Around & Eyes Focus', note: 'Fixing gaze upon the place of prostration' },
          { time: '07:15', seconds: 435, title: 'Incorrect Sujud Hand & Foot Posture', note: 'Keeping toes pointed forward to Qiblah' }
        ]
      }
    ],
    animationDetails: {
      title: '7-Stage Animated Salah Motion Visualizer',
      description: 'Step-by-step kinetic visualization of the physical and spiritual prayer positions.',
      stages: [
        { id: 'takbir', name: 'Takbiratul Ihram', arabic: 'تَكْبِيرَةُ الْإِحْرَامِ', explanation: 'Hands raised to earlobes/shoulders declaring Allah is Greater than everything.' },
        { id: 'qiyam', name: 'Qiyam (Standing)', arabic: 'الْقِيَامُ وَقِرَاءَةُ الْفَاتِحَةِ', explanation: 'Right hand over left upon the chest, reciting Surat Al-Fatihah with reverence.' },
        { id: 'ruku', name: 'Ruku (Bowing)', arabic: 'الرُّكُوعُ وَالتَّسْبِيحُ', explanation: 'Bowing with flat back, hands grasping knees: Subhana Rabbiyal Azeem.' },
        { id: 'itidal', name: 'I’tidal (Rising)', arabic: 'الِاعْتِدَالُ مِنَ الرُّكُوعِ', explanation: 'Standing straight: Sami Allahu liman hamidah, Rabbana wa lakal hamd.' },
        { id: 'sujud', name: 'Sujud (Prostration)', arabic: 'السُّجُودُ عَلَى سَبْعَةِ أَعْظَامٍ', explanation: 'Seven limbs touching the ground in total humility before the Divine.' },
        { id: 'jalsah', name: 'Jalsah (Sitting)', arabic: 'الْجُلُوسُ بَيْنَ السَّجْدَتَيْنِ', explanation: 'Peaceful pause between prostrations seeking forgiveness: Rabbighfir li.' },
        { id: 'tasleem', name: 'Tasleem (Salutations)', arabic: 'التَّسْلِيمُ يَمِينًا وَشِمَالًا', explanation: 'Turning right then left: Assalamu alaykum wa rahmatullah.' }
      ]
    }
  },
  zakat: {
    pillarId: 'zakat',
    pillarName: 'The Zakat (Purifying Charity)',
    pillarArabic: 'الزَّكَاةُ',
    videos: [
      {
        id: 'zakat_main',
        title: 'Zakat Explained: Calculating Nisab, Assets & The 8 Beneficiaries',
        subtitle: 'Visual breakdown of Islamic economic social justice and wealth purification',
        speaker: 'Islamic Relief / Global Scholars',
        duration: '15:10',
        videoUrl: 'https://www.youtube.com/watch?v=eBfG7eAdfu4',
        embedId: 'eBfG7eAdfu4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80',
        category: 'Masterclass',
        description: 'Zakat is not voluntary tipping—it is a divine right of the poor upon the surplus wealth of the capable. Learn how 2.5% on qualifying wealth held for one lunar year purifies savings, eliminates poverty, and establishes social balance.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Why Zakat Means Purification & Growth', note: 'Wealth never decreases from giving charity' },
          { time: '04:15', seconds: 255, title: 'Understanding Nisab & The Hawl', note: 'The minimum threshold and 1 full lunar year condition' },
          { time: '08:40', seconds: 520, title: 'What is Zakatable? (Gold, Silver, Cash, Stocks)', note: 'Calculating net qualifying wealth easily' },
          { time: '12:30', seconds: 750, title: 'The 8 Quranic Categories of Beneficiaries', note: 'Explicitly detailed in Surah At-Tawbah 9:60' }
        ]
      },
      {
        id: 'zakat_calc',
        title: 'How to Calculate Your Zakat Step-by-Step',
        subtitle: 'Practical numbers, examples, and deductions',
        speaker: 'Practical Islamic Finance Guide',
        duration: '09:45',
        videoUrl: 'https://www.youtube.com/watch?v=4nU1Z5E3_6w',
        embedId: '4nU1Z5E3_6w',
        thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
        category: 'Step-by-Step',
        description: 'Step-by-step arithmetic worksheet showing how to add cash, gold, trade inventory, subtract immediate debts, check against gold/silver Nisab, and calculate 2.5%.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Nisab Value Today', note: 'Using current gold and silver market prices' },
          { time: '03:10', seconds: 190, title: 'Deducting Liabilities', note: 'Subtracting immediate due expenses' },
          { time: '06:40', seconds: 400, title: 'Final 2.5% Multiplication', note: 'Paying promptly to qualified recipients' }
        ]
      }
    ],
    animationDetails: {
      title: 'Wealth Flow & 2.5% Purification Balance',
      description: 'Interactive visualization of how surplus wealth flows into societal nourishment.',
      stages: [
        { id: 'nisab', name: 'Nisab Threshold', arabic: 'نِصَابُ الزَّكَاةِ', explanation: 'Qualifying wealth exceeding approx 85g gold or 595g silver.' },
        { id: 'hawl', name: 'The Lunar Year (Hawl)', arabic: 'حَوْلَانُ الْحَوْلِ', explanation: 'Maintaining qualifying surplus across 354 lunar days.' },
        { id: 'purify', name: '2.5% Extraction', arabic: 'إِخْرَاجُ حَقِّ الْمَالِ', explanation: 'Deducting the pure 2.5% right belonging to the vulnerable.' },
        { id: 'distribution', name: '8 Deserving Groups', arabic: 'مَصَارِفُ الزَّكَاةِ الثَّمَانِيَةُ', explanation: 'Direct distribution to the poor, needy, indebted, and community pillars.' }
      ]
    }
  },
  sawm: {
    pillarId: 'sawm',
    pillarName: 'The Sawm (Fasting of Ramadan)',
    pillarArabic: 'الصَّوْمُ',
    videos: [
      {
        id: 'sawm_main',
        title: 'The Inner Secrets & Rules of Fasting in Ramadan',
        subtitle: 'A cinematic journey through dawn-to-sunset discipline, Quran, and Laylatul Qadr',
        speaker: 'Yaqeen Institute / Islamic Educational Cinema',
        duration: '16:50',
        videoUrl: 'https://www.youtube.com/watch?v=VzEw5hQ_5u4',
        embedId: 'VzEw5hQ_5u4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
        category: 'Masterclass',
        description: 'Fasting is an intimate shield between the servant and Allah. Experience the daily rhythm of Suhoor, intentional restraint of tongue and eyes, the joy of Iftar at sunset, and the spiritual high of Taraweeh nightly prayers.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'The Intention (Niyyah) & Suhoor', note: 'The blessed pre-dawn meal full of barakah' },
          { time: '04:30', seconds: 270, title: 'The True Fast of the Limbs', note: 'Abstaining from backbiting, anger, and vain talk' },
          { time: '09:15', seconds: 555, title: 'The Sweetness of Iftar', note: 'Two joys: one when breaking fast, one when meeting Lord' },
          { time: '13:00', seconds: 780, title: 'The Last Ten Nights & Laylatul Qadr', note: 'A single night better than a thousand months of worship' }
        ]
      },
      {
        id: 'sawm_rules',
        title: 'Essential Rules of Fasting: What Breaks & Does Not Break Fast',
        subtitle: 'Medical inhalers, injections, swallowing saliva, accidental eating, and travel exemptions',
        speaker: 'Fiqh of Ramadan Guide',
        duration: '10:20',
        videoUrl: 'https://www.youtube.com/watch?v=1T3PqU7vM8c',
        embedId: '1T3PqU7vM8c',
        thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
        category: 'Step-by-Step',
        description: 'Clear, reassuring fiqh answers on contemporary questions regarding what breaks the fast and what is permitted, ensuring peace of mind during Ramadan.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Things That Invalidate the Fast', note: 'Eating, drinking, and intentional relations' },
          { time: '03:45', seconds: 225, title: 'Things That DO NOT Break the Fast', note: 'Tasting food without swallowing, brushing teeth, eye drops' },
          { time: '07:20', seconds: 440, title: 'Exemptions & Making Up Days (Qada / Fidyah)', note: 'Pregnant, nursing, ill, and elderly guidelines' }
        ]
      }
    ],
    animationDetails: {
      title: 'Solar & Lunar Fasting Diurnal Cycle',
      description: 'Visual animation tracing the sun from Suhoor, through the day of patience, to sunset Iftar.',
      stages: [
        { id: 'suhoor', name: 'Suhoor & Niyyah', arabic: 'السُّحُورُ وَالنِّيَّةُ', explanation: 'Pre-dawn nourishment and firm inward intention before True Dawn (Fajr).' },
        { id: 'restraint', name: 'The Day of Patience (Sabr)', arabic: 'صَبْرُ النَّهَارِ وَحِفْظُ الْجَوَارِحِ', explanation: 'Guard the tongue, eyes, and heart while feeling empathy for the hungry.' },
        { id: 'iftar', name: 'Maghrib Iftar (Sunset Joy)', arabic: 'فَرْحَةُ الإِفْطَارِ عِنْدَ الْغُرُوبِ', explanation: 'Breaking fast on dates and water with the accepted supplication of the fasting person.' },
        { id: 'qiyam_night', name: 'Nightly Taraweeh & Quran', arabic: 'قِيَامُ اللَّيْلِ وَالتَّرَاوِيحُ', explanation: 'Immersing in communal recitation of the Holy Quran through the night.' }
      ]
    }
  },
  hajj: {
    pillarId: 'hajj',
    pillarName: 'The Hajj (Pilgrimage)',
    pillarArabic: 'الْحَجُّ',
    videos: [
      {
        id: 'hajj_main',
        title: 'The Visual 3D Step-by-Step Hajj Pilgrimage Walkthrough',
        subtitle: 'Following the blessed footsteps of Prophet Ibrahim and Muhammad ﷺ in Makkah',
        speaker: 'Visual Islamic Pilgrimage Series',
        duration: '22:15',
        videoUrl: 'https://www.youtube.com/watch?v=J8tQoT6qC7w',
        embedId: 'J8tQoT6qC7w',
        thumbnailUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80',
        category: 'Animated Guide',
        description: 'Hajj is the ultimate physical and spiritual journey of a lifetime. Follow the route from entering the sacred state of Ihram, circling the Kaaba (Tawaf), running between Safa and Marwa (Sa’i), standing on Mount Arafat, collecting pebbles in Muzdalifah, and stoning the Jamarat in Mina.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'The Miqat & Entering Ihram', note: 'Donning two seamless white garments—shedding all earthly status' },
          { time: '05:20', seconds: 320, title: 'Tawaf around the Kaaba & Sa’i', note: 'Seven circuits aligning heart with the angels around the Throne' },
          { time: '09:40', seconds: 580, title: 'Day 9: The Standing on Mount Arafat', note: '"Hajj is Arafat" — the grand rehearsal for the Day of Judgment' },
          { time: '14:30', seconds: 870, title: 'Muzdalifah Night Under the Stars', note: 'Gathering pebbles in peaceful reflection' },
          { time: '18:15', seconds: 1095, title: 'Mina Jamarat & The Farewell Tawaf', note: 'Rejecting Satan and returning home pure of all sins' }
        ]
      },
      {
        id: 'hajj_daybyday',
        title: 'Day by Day Guide to Hajj & Umrah Rituals',
        subtitle: '8th Dhul Hijjah (Tarwiyah) through 13th Dhul Hijjah (Tashreeq)',
        speaker: 'Comprehensive Hajj Training Institute',
        duration: '14:50',
        videoUrl: 'https://www.youtube.com/watch?v=5P9vXy5u8qI',
        embedId: '5P9vXy5u8qI',
        thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80',
        category: 'Step-by-Step',
        description: 'Detailed daily checklist covering movement between Mina tent city, the plain of Arafat, Muzdalifah overnight stay, Ramy al-Jamarat stoning, sacrifice (Qurbani), shaving/trimming hair (Halq/Taqseer), and Tawaf Al-Ifadah.',
        keyTimestamps: [
          { time: '00:00', seconds: 0, title: 'Day 1 (8th Dhul Hijjah): Mina', note: 'Praying 5 prayers shortened in Mina' },
          { time: '04:10', seconds: 250, title: 'Day 2 (9th Dhul Hijjah): Arafat & Muzdalifah', note: 'The pillar of Hajj and evening departure' },
          { time: '08:30', seconds: 510, title: 'Day 3 (10th Dhul Hijjah): Eid Day in Mina', note: 'Jamarat, Qurbani, Halq, and Tawaf Ifadah' },
          { time: '12:00', seconds: 720, title: 'Days 4-6 (11th-13th): Tashreeq Days', note: 'Stoning all 3 Jamarat and Farewell Tawaf' }
        ]
      }
    ],
    animationDetails: {
      title: 'Dynamic Tawaf Orbit & Pilgrimage Geography Map',
      description: 'Kinetic 3D-styled Kaaba circumambulation and journey milestones.',
      stages: [
        { id: 'ihram', name: '1. Ihram & Talbiyah', arabic: 'الإِحْرَامُ وَالتَّلْبِيَةُ', explanation: 'Labbaik Allahumma Labbaik — responding to the eternal call of Allah.' },
        { id: 'tawaf', name: '2. Tawaf & Sa’i', arabic: 'الطَّوَافُ حَوْلَ الْكَعْبَةِ وَالسَّعْيُ', explanation: 'Circling the Kaaba 7 times and pacing between Safa and Marwa.' },
        { id: 'arafat', name: '3. Standing at Arafat', arabic: 'الْوُقُوفُ بِعَرَفَةَ (يَوْمُ الْحَجِّ الأَكْبَرُ)', explanation: 'The supreme afternoon of weeping, repentance, and universal forgiveness.' },
        { id: 'muzdalifah', name: '4. Muzdalifah & Mina Jamarat', arabic: 'الْمُزْدَلِفَةُ وَرَمْيُ الْجِمَارِ', explanation: 'Overnight beneath open skies, stoning the pillars of temptation.' },
        { id: 'wida', name: '5. Farewell Tawaf (Wida’)', arabic: 'طَوَافُ الْوَدَاعِ', explanation: 'Final affectionate circumambulation before departing the Sacred City.' }
      ]
    }
  }
};

interface PillarsMediaGalleryProps {
  pillarId: string;
  onSelectPillar?: (pillarId: string) => void;
}

export default function PillarsMediaGallery({ pillarId, onSelectPillar }: PillarsMediaGalleryProps) {
  const guide = PILLAR_MEDIA_GUIDES[pillarId] || PILLAR_MEDIA_GUIDES.salah;
  const [selectedVideoId, setSelectedVideoId] = useState<string>(guide.videos[0].id);
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);
  const [isPlayingAnimation, setIsPlayingAnimation] = useState<boolean>(true);
  const [animationSpeed] = useState<number>(3500);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [activeSeekSeconds, setActiveSeekSeconds] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync selected video if pillar changes
  useEffect(() => {
    if (guide.videos && guide.videos.length > 0) {
      setSelectedVideoId(guide.videos[0].id);
      setActiveSeekSeconds(0);
    }
  }, [pillarId]);

  // Auto-advance kinetic stages when playing
  useEffect(() => {
    if (!isPlayingAnimation) return;
    const interval = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % guide.animationDetails.stages.length);
    }, animationSpeed);
    return () => clearInterval(interval);
  }, [isPlayingAnimation, animationSpeed, guide.animationDetails.stages.length]);

  const activeVideo = useMemo(() => {
    return guide.videos.find(v => v.id === selectedVideoId) || guide.videos[0];
  }, [guide.videos, selectedVideoId]);

  // Global search across all 5 pillars and their videos
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    
    const results: { pillarKey: string; pillarName: string; video: VideoItem; matchedTimestamp?: any }[] = [];
    
    Object.entries(PILLAR_MEDIA_GUIDES).forEach(([pKey, pGuide]) => {
      pGuide.videos.forEach(vid => {
        const titleMatch = vid.title.toLowerCase().includes(q);
        const subtitleMatch = vid.subtitle.toLowerCase().includes(q);
        const descMatch = vid.description.toLowerCase().includes(q);
        const catMatch = vid.category.toLowerCase().includes(q);
        const pillarMatch = pGuide.pillarName.toLowerCase().includes(q) || pGuide.pillarArabic.includes(q);
        const matchedTs = vid.keyTimestamps.find(ts => ts.title.toLowerCase().includes(q) || ts.note.toLowerCase().includes(q));

        if (titleMatch || subtitleMatch || descMatch || catMatch || pillarMatch || matchedTs) {
          results.push({
            pillarKey: pKey,
            pillarName: pGuide.pillarName,
            video: vid,
            matchedTimestamp: matchedTs
          });
        }
      });
    });

    return results;
  }, [searchQuery]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSeekAndPlay = (seconds: number) => {
    setActiveSeekSeconds(seconds);
    setShowVideoModal(true);
  };

  const currentStage = guide.animationDetails.stages[activeStageIdx] || guide.animationDetails.stages[0];

  return (
    <div className="space-y-8">
      {/* 1. TOP VIDEO SEARCH & QUICK SEARCH CHIPS */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-500/15 via-black/60 to-emerald-500/15 border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                5 Pillars Video Guide Hub
              </span>
              <span className="text-xs text-slate-400 font-medium">Authentic YouTube Video Tutorials</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Visual Learning & Video Guides for the 5 Pillars
            </h3>
            <p className="text-xs text-slate-300">
              Watch step-by-step video guides, prayer tutorials, Wudu instructions, Zakat calculations, fasting fiqh, and 3D Hajj animations.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveSeekSeconds(0);
                setShowVideoModal(true);
              }}
              className="px-5 py-3 rounded-2xl bg-amber-400 text-brand-depth font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-400/20 transition-all cursor-pointer hover:bg-amber-300"
            >
              <Play size={16} className="fill-current" />
              <span>Watch Active Video</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any guide (e.g., 'How to pray Salah', 'Wudu guide', 'Calculate Nisab', 'Ramadan fasting rules', 'Hajj 3D animation', 'Taking Shahadah')..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-black/60 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400/60 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Search Preset Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide text-xs">
          <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Quick Search:</span>
          {[
            'How to pray Salah',
            'Wudu guide',
            'Sujud & Tashahhud',
            'Calculate Zakat',
            'Fasting rules in Ramadan',
            'Hajj 3D guide',
            'Taking Shahada'
          ].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-[11px] whitespace-nowrap transition-all cursor-pointer shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Dropdown / Panel */}
        {searchQuery.trim() !== '' && (
          <div className="p-4 rounded-2xl bg-black/80 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Found <strong className="text-amber-300">{searchResults.length}</strong> matching video guide(s) for "{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')} className="text-amber-400 hover:underline">Clear</button>
            </div>

            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No matching video guides found. Try searching for "prayer", "wudu", "zakat", "fasting", or "hajj".</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (onSelectPillar) onSelectPillar(res.pillarKey);
                      setSelectedVideoId(res.video.id);
                      if (res.matchedTimestamp) {
                        setActiveSeekSeconds(res.matchedTimestamp.seconds);
                      } else {
                        setActiveSeekSeconds(0);
                      }
                      setShowVideoModal(true);
                      setSearchQuery('');
                    }}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <Play size={14} className="fill-current ml-0.5" />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] font-bold text-amber-400 uppercase block">{res.pillarName} • {res.video.category}</span>
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">{res.video.title}</h5>
                        {res.matchedTimestamp && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                            <span>Chapter: {res.matchedTimestamp.time}</span>
                            <span>- {res.matchedTimestamp.title}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{res.video.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. PILLAR VIDEO SELECTOR TABS (If Multiple Videos in Current Pillar) */}
      {guide.videos.length > 1 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Available Video Guides for {guide.pillarName}:
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">
              {guide.videos.length} High-Definition Guides
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guide.videos.map((vid) => {
              const isSelected = vid.id === activeVideo.id;
              return (
                <button
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideoId(vid.id);
                    setActiveSeekSeconds(0);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/10 border-amber-400/50 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400/30'
                      : 'bg-black/40 hover:bg-black/60 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                        isSelected ? 'bg-amber-400 text-brand-depth' : 'bg-white/10 text-slate-300'
                      }`}>
                        {vid.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{vid.duration}</span>
                    </div>
                    <h4 className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {vid.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{vid.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-xl shrink-0 mt-1 ${
                    isSelected ? 'bg-amber-400 text-brand-depth' : 'bg-white/5 text-slate-400'
                  }`}>
                    <Play size={12} className="fill-current ml-0.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN VIDEO PLAYER + INTERACTIVE CHAPTERS & KINETIC ANIMATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMN 1: EMBEDDED INLINE VIDEO PLAYER & CHAPTERS (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-black/50 border border-white/15 shadow-2xl space-y-6">
            
            {/* Active Video Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-black text-[9px] uppercase border border-red-500/30">
                    {activeVideo.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{activeVideo.duration} Guide</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-white">{activeVideo.title}</h4>
                <p className="text-xs text-slate-400">{activeVideo.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Expand to Fullscreen Cinema Mode"
                >
                  <Maximize2 size={14} />
                  <span>Cinema Mode</span>
                </button>
              </div>
            </div>

            {/* In-Page Embedded Video Player */}
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.embedId}?start=${activeSeekSeconds}&rel=0&modestbranding=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Description and Quick Actions */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {activeVideo.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-bold text-amber-300">Presenter:</span>
                  <span>{activeVideo.speaker}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(activeVideo.videoUrl, `url_${activeVideo.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey === `url_${activeVideo.id}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedKey === `url_${activeVideo.id}` ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Chapter Timestamps */}
            {activeVideo.keyTimestamps.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                    <Clock size={14} className="text-amber-400" />
                    <span>Interactive Chapters & Key Milestones</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Tap to jump straight to timestamp</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeVideo.keyTimestamps.map((ts, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSeekAndPlay(ts.seconds)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-amber-400/10 border border-white/5 hover:border-amber-400/30 text-left transition-all cursor-pointer group space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-amber-400 text-xs font-black bg-amber-400/15 px-2 py-0.5 rounded-md">
                          {ts.time}
                        </span>
                        <ChevronRight size={14} className="text-slate-500 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h6 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {ts.title}
                      </h6>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ts.note}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* COLUMN 2: KINETIC ANIMATION CANVAS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-[2.5rem] bg-black/40 border border-amber-500/20 shadow-2xl space-y-6 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Animation Title & Control Bar */}
            <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{guide.animationDetails.title}</h4>
                  <p className="text-[10px] text-slate-400">Kinetic Dynamic Motion</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingAnimation(!isPlayingAnimation)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlayingAnimation 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                  title={isPlayingAnimation ? 'Pause Animation' : 'Play Animation'}
                >
                  {isPlayingAnimation ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                  <span className="text-[10px] font-mono">{isPlayingAnimation ? 'Playing' : 'Paused'}</span>
                </button>

                <button
                  onClick={() => setActiveStageIdx(0)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                  title="Reset Stage"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Kinetic Animation Visual Stage Container */}
            <div className="relative z-10 w-full h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-black/60 to-slate-950/80 border border-white/10 flex items-center justify-center p-6 overflow-hidden">
              
              {/* SHAHADA KINETIC GRAPHIC */}
              {pillarId === 'shahada' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                    className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-amber-400/30"
                  />
                  <motion.div
                    animate={{ rotate: -360, scale: [1, 1.05, 1] }}
                    transition={{ rotate: { repeat: Infinity, duration: 30, ease: 'linear' }, scale: { repeat: Infinity, duration: 4, ease: 'easeInOut' } }}
                    className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-amber-400/20 bg-amber-500/5 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
                  />

                  <motion.div
                    key={currentStage.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 space-y-2 max-w-sm"
                  >
                    <div className="text-2xl sm:text-3xl font-arabic font-black text-amber-300 leading-relaxed drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                      {currentStage.arabic}
                    </div>
                    <div className="text-sm font-black text-white uppercase tracking-wider">
                      {currentStage.name}
                    </div>
                    <div className="text-xs text-slate-300 leading-relaxed px-4">
                      {currentStage.explanation}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* SALAH KINETIC GRAPHIC */}
              {pillarId === 'salah' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="relative w-full max-w-md h-28 flex items-end justify-center gap-2 pb-2 border-b border-white/10">
                    {guide.animationDetails.stages.map((stg, idx) => {
                      const isCurr = idx === activeStageIdx;
                      return (
                        <div 
                          key={stg.id}
                          onClick={() => setActiveStageIdx(idx)}
                          className="flex flex-col items-center cursor-pointer group"
                        >
                          <div className={`w-7 h-14 sm:w-9 sm:h-18 rounded-xl transition-all flex flex-col items-center justify-end p-1 relative ${
                            isCurr ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/30' : 'bg-white/5 border border-white/10 opacity-40 hover:opacity-80'
                          }`}>
                            <div className={`w-2.5 h-2.5 rounded-full mb-1 ${isCurr ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-slate-400'}`} />
                            <div className={`w-3.5 rounded-t-md ${
                              stg.id === 'sujud' ? 'h-3 w-5' : stg.id === 'ruku' ? 'h-5 rotate-45' : 'h-8'
                            } ${isCurr ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          </div>
                          <span className={`text-[8px] font-bold uppercase mt-1 ${isCurr ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <motion.div
                    key={currentStage.id}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-3 space-y-0.5"
                  >
                    <span className="text-base font-arabic font-bold text-amber-300 block">{currentStage.arabic}</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{currentStage.name}</span>
                    <p className="text-[11px] text-slate-300">{currentStage.explanation}</p>
                  </motion.div>
                </div>
              )}

              {/* ZAKAT KINETIC GRAPHIC */}
              {pillarId === 'zakat' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-center gap-6 sm:gap-10 mb-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto">
                        <Coins size={18} />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Surplus Assets</span>
                      <span className="text-xs font-black text-white font-mono block">97.5% Retained</span>
                    </div>

                    <motion.div 
                      animate={{ x: [0, 6, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex flex-col items-center text-emerald-400"
                    >
                      <span className="text-[9px] font-black uppercase font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 mb-1">
                        2.5% Pure
                      </span>
                      <ArrowRight size={18} />
                    </motion.div>

                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mx-auto">
                        <Heart size={18} />
                      </div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">8 Beneficiaries</span>
                      <span className="text-xs font-black text-emerald-300 font-mono block">Purified Barakah</span>
                    </div>
                  </div>

                  <motion.div key={currentStage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0.5">
                    <span className="text-sm font-arabic font-bold text-amber-300">{currentStage.arabic}</span>
                    <p className="text-xs text-slate-200">{currentStage.explanation}</p>
                  </motion.div>
                </div>
              )}

              {/* SAWM KINETIC GRAPHIC */}
              {pillarId === 'sawm' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="relative w-44 h-20 overflow-hidden border-b-2 border-amber-400/40 mb-3 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 180 }}
                      transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                      className="absolute top-0 w-36 h-36 rounded-full border border-dashed border-white/20"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,1)] flex items-center justify-center text-black">
                        <Sun size={12} />
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,1)] flex items-center justify-center text-white">
                        <Moon size={12} />
                      </div>
                    </motion.div>
                  </div>

                  <motion.div key={currentStage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0.5">
                    <span className="text-sm font-arabic font-bold text-amber-300">{currentStage.arabic}</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">{currentStage.name}</span>
                    <p className="text-[11px] text-slate-300 max-w-xs">{currentStage.explanation}</p>
                  </motion.div>
                </div>
              )}

              {/* HAJJ KINETIC GRAPHIC */}
              {pillarId === 'hajj' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                      className="absolute w-32 h-32 rounded-full border border-dashed border-emerald-400/30"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(52,211,153,1)]" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                      className="absolute w-24 h-24 rounded-full border border-amber-400/30"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400 absolute bottom-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(245,158,11,1)]" />
                    </motion.div>

                    <div className="w-10 h-10 bg-black border-2 border-amber-400 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center text-[9px] font-black text-amber-300 uppercase tracking-widest font-mono">
                      كَعْبَة
                    </div>
                  </div>

                  <motion.div key={currentStage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0.5 mt-1">
                    <span className="text-sm font-arabic font-bold text-amber-300">{currentStage.arabic}</span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">{currentStage.name}</span>
                    <p className="text-[11px] text-slate-300 max-w-xs">{currentStage.explanation}</p>
                  </motion.div>
                </div>
              )}

            </div>

            {/* Stages Step Navigators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              {guide.animationDetails.stages.map((stg, idx) => {
                const isSelected = idx === activeStageIdx;
                return (
                  <button
                    key={stg.id}
                    onClick={() => {
                      setActiveStageIdx(idx);
                      setIsPlayingAnimation(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-brand-depth border-amber-400 font-bold shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    <span className="text-[9px] block opacity-75 uppercase">Phase {idx + 1}</span>
                    <span className="text-[11px] font-bold block truncate">{stg.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* FULL-SCREEN VIDEO PLAYER MODAL (CINEMA MODE) */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-5xl bg-brand-surface rounded-[2.5rem] border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Video size={20} />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md sm:max-w-xl">
                      {activeVideo.title}
                    </h3>
                    <p className="text-xs text-amber-300 font-arabic font-bold truncate">
                      {guide.pillarName} • {guide.pillarArabic} — {activeVideo.category} ({activeVideo.duration})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                >
                  Close Player
                </button>
              </div>

              {/* Video Player Container */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.embedId}?autoplay=1&start=${activeSeekSeconds}&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Footer Chapters & Information */}
              <div className="p-5 sm:p-6 bg-black/50 overflow-y-auto space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Video Overview</h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{activeVideo.description}</p>
                  </div>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider transition-all shrink-0 w-fit"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Key Chapters */}
                {activeVideo.keyTimestamps.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chapters & Milestones (Click to seek)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {activeVideo.keyTimestamps.map((ts, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSeekSeconds(ts.seconds)}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/20 border border-white/5 hover:border-amber-400/40 text-left space-y-1 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                              {ts.time}
                            </span>
                            <span className="text-xs font-bold text-white truncate">{ts.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{ts.note}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
