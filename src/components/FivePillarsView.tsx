import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Landmark, 
  HeartHandshake, 
  Sunrise, 
  Coins, 
  Moon, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft, 
  Share2, 
  Volume2, 
  VolumeX, 
  Check, 
  Copy, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Award, 
  Calculator, 
  Flame, 
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  Eye,
  Calendar,
  Layers
} from 'lucide-react';
import { shareService } from '../services/shareService';

export interface PillarData {
  id: string;
  orderNumber: number;
  name: string;
  arabicName: string;
  transliteration: string;
  meaning: string;
  icon: any;
  color: string;
  accentBg: string;
  borderColor: string;
  shortSummary: string;
  whatToDo: {
    obligation: string;
    whoMustPerform: string;
    conditions: string[];
    coreAction: string;
  };
  howToDoIt: {
    steps: {
      stepNumber: number;
      title: string;
      arabicTitle?: string;
      description: string;
      practicalTip: string;
    }[];
    interactiveType?: 'shahadah' | 'salah_postures' | 'zakat_calc' | 'sawm_guide' | 'hajj_timeline';
  };
  benefits: {
    spiritual: string[];
    worldly: string[];
    quranVerse: {
      arabic: string;
      translation: string;
      reference: string;
    };
    hadith: {
      arabic: string;
      text: string;
      source: string;
    };
  };
  punishmentsAndWarnings: {
    graveWarnings: string[];
    afterlifeWarning: string;
    scholarlyConsensus: string;
    quranWarning: {
      arabic: string;
      translation: string;
      reference: string;
    };
    hadithWarning: {
      arabic: string;
      text: string;
      source: string;
    };
  };
}

export const FIVE_PILLARS_DATA: PillarData[] = [
  {
    id: 'shahada',
    orderNumber: 1,
    name: 'Shahadah',
    arabicName: 'الشَّهَادَةُ',
    transliteration: 'Ash-Shahādah',
    meaning: 'The Testimony of Faith',
    icon: Landmark,
    color: 'text-amber-300',
    accentBg: 'from-amber-500/20 via-orange-950/20 to-slate-900/80',
    borderColor: 'border-amber-500/30',
    shortSummary: 'The foundation of all Islam. Bearing witness with absolute certainty and conviction that there is no deity worthy of worship except Allah, and that Muhammad ﷺ is His servant and final messenger.',
    whatToDo: {
      obligation: 'Reciting the declaration with firm belief in the heart, vocalizing with the tongue, and manifesting in actions.',
      whoMustPerform: 'Every human entering Islam, and reaffirmed daily by every believer in prayer and remembrance.',
      conditions: [
        'Knowledge (‘Ilm) of its true meaning, negating ignorance',
        'Certainty (Yaqīn) that dispels all doubt',
        'Sincerity (Ikhlāṣ) that negates all forms of polytheism and hypocrisy',
        'Truthfulness (Ṣidq) that banishes falsehood',
        'Love (Maḥabbah) for Allah, His Messenger, and this declaration',
        'Submission (Inqiyād) in action to all divine commandments',
        'Acceptance (Qabūl) without rejection of any part of revelation'
      ],
      coreAction: 'Declare: "Ash-hadu an lā ilāha illallāh, wa ash-hadu anna Muḥammadan ‘abduhū wa rasūluh."'
    },
    howToDoIt: {
      steps: [
        {
          stepNumber: 1,
          title: 'Internal Purification & Sincere Intention',
          arabicTitle: 'إِخْلَاصُ النِّيَّةِ',
          description: 'Purify your heart from worshiping created beings, worldly desires, or idols. Turn your soul entirely towards Allah alone.',
          practicalTip: 'Remember that Allah looks at your heart and intentions before physical actions.'
        },
        {
          stepNumber: 2,
          title: 'Pronouncing the First Half: Oneness of Allah',
          arabicTitle: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
          description: 'Utter "Lā ilāha illallāh" (There is no god except Allah). Negate all false deities first ("Lā ilāha"), then affirm total divinity exclusively to Allah ("illallāh").',
          practicalTip: 'Proclaim it with firm conviction, feeling the sovereignty of your Creator.'
        },
        {
          stepNumber: 3,
          title: 'Pronouncing the Second Half: Final Prophethood',
          arabicTitle: 'مُحَمَّدٌ رَسُولُ ٱللَّٰهِ',
          description: 'Utter "Muḥammadur-Rasūlullāh" (Muhammad is the Messenger of Allah). Acknowledge that the Prophet ﷺ is the final teacher, guide, and exemplar whose sunnah must be followed.',
          practicalTip: 'Express love and reverence for the Prophet ﷺ and commit to following his example.'
        },
        {
          stepNumber: 4,
          title: 'Living by the Covenant (Tawhid in Action)',
          arabicTitle: 'الْعَمَلُ بِمُقْتَضَاهَا',
          description: 'Align daily life with this declaration: pray exclusively to Allah, obey His commands, seek halal provisions, and turn away from sinful shirk.',
          practicalTip: 'Renew your Shahadah at the end of each Wudu and during every prayer Tashahhud.'
        }
      ],
      interactiveType: 'shahadah'
    },
    benefits: {
      spiritual: [
        'Total forgiveness of all past sins upon sincere proclamation (Islam wipes away what came before it)',
        'Direct spiritual guarantee of ultimate entry into Paradise (Jannah)',
        'Unshakable peace, purpose, and clarity free from psychological enslavement to creation',
        'Highest status on the Scales of Good Deeds (Mizan) on the Day of Resurrection'
      ],
      worldly: [
        'Sacred protection of life, honor, and property in the Muslim Ummah',
        'Full integration into the global fraternity of 2+ billion believers',
        'Inner contentment that no worldly anxiety or calamity can shatter'
      ],
      quranVerse: {
        arabic: 'فَاعْلَمْ أَنَّهُ لَا إِلَٰهَ إِلَّا اللَّهُ وَاسْتَغْفِرْ لِذَنبِكَ',
        translation: 'So know, [O Muhammad], that there is no deity except Allah and ask forgiveness for your sin.',
        reference: 'Surah Muhammad 47:19'
      },
      hadith: {
        arabic: 'مَنْ كَانَ آخِرُ كَلَامِهِ لَا إِلَهَ إِلَّا اللَّهُ دَخَلَ الْجَنَّةَ',
        text: 'He whose last words in this world are "Lā ilāha illallāh" shall enter Paradise.',
        source: 'Sunan Abi Dawud 3116 (Authentic)'
      }
    },
    punishmentsAndWarnings: {
      graveWarnings: [
        'Shirk (associating partners with Allah) is the only unforgivable sin if one dies without repenting from it.',
        'Total nullification of all lifelong good deeds and charity if performed for other than Allah.',
        'Spiritual blindness, existential emptiness, and eternal loss in the Hereafter.'
      ],
      afterlifeWarning: 'Perpetual confinement in the deepest fires of Jahannam for those who deliberately reject Tawhid and deny Allah and His Messenger.',
      scholarlyConsensus: 'Consensus of all companions and scholars: Without the Shahadah, no other deed, prayer, fasting, or charity is accepted by Allah.',
      quranWarning: {
        arabic: 'إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَاءُ ۚ وَمَن يُشْرِكْ بِاللَّهِ فَقَدِ افْتَرَىٰ إِثْمًا عَظِيمًا',
        translation: 'Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills. And he who associates others with Allah has certainly fabricated a tremendous sin.',
        reference: 'Surah An-Nisa 4:48'
      },
      hadithWarning: {
        arabic: 'مَنْ مَاتَ وَهُوَ يَدْعُو مِنْ دُونِ اللَّهِ نِدًّا دَخَلَ النَّارَ',
        text: 'Whoever dies whilst supplicating to or invoking anyone other than Allah as a rival shall enter the Fire.',
        source: 'Sahih al-Bukhari 4497'
      }
    }
  },
  {
    id: 'salah',
    orderNumber: 2,
    name: 'Salah',
    arabicName: 'الصَّلَاةُ',
    transliteration: 'Aṣ-Ṣalāh',
    meaning: 'The 5 Daily Obligatory Prayers',
    icon: Sunrise,
    color: 'text-emerald-400',
    accentBg: 'from-emerald-500/20 via-teal-950/20 to-slate-900/80',
    borderColor: 'border-emerald-500/30',
    shortSummary: 'The physical and spiritual ascension (Mi’raj) of the believer. The central pillar holding up the structure of faith, performed 5 times each day facing the Holy Kaaba.',
    whatToDo: {
      obligation: 'Perform 17 mandatory (Fard) cycles across Fajr (2), Dhuhr (4), Asr (4), Maghrib (3), and Isha (4).',
      whoMustPerform: 'Every sane, pubescent Muslim, under all circumstances (standing, sitting, lying down, or in illness).',
      conditions: [
        'Purity from minor and major ritual impurities (Taharah / Wudu / Ghusl)',
        'Cleanliness of body, clothes, and place of prayer',
        'Covering the Awrah (prescribed modesty dress code)',
        'Facing the direction of the Qiblah (Holy Kaaba in Makkah)',
        'Arrival of the specific prayer time window',
        'Formulating the sincere internal intention (Niyyah)'
      ],
      coreAction: 'Perform the physical cycles (Rak’at) with recitations of Surah Al-Fatihah, Ruku’ (bowing), and Sujud (prostration).'
    },
    howToDoIt: {
      steps: [
        {
          stepNumber: 1,
          title: 'Wudu (Ablution) & Facing Qiblah',
          arabicTitle: 'الْوُضُوءُ وَاسْتِقْبَالُ الْقِبْلَةِ',
          description: 'Perform ritual washing of hands, mouth, nose, face, arms, head wipe, and feet. Stand reverently facing the Kaaba.',
          practicalTip: 'Ensure water reaches all mandatory limbs without rushing.'
        },
        {
          stepNumber: 2,
          title: 'Takbirat al-Ihram & Standing (Qiyam)',
          arabicTitle: 'تَكْبِيرَةُ الإِحْرَامِ وَالْقِيَامُ',
          description: 'Raise hands to ears/shoulders and utter "Allāhu Akbar". Fold hands over chest and recite Surah Al-Fatihah followed by Quranic verses.',
          practicalTip: 'Fix your gaze upon the prostration spot on the floor and pause between verses.'
        },
        {
          stepNumber: 3,
          title: 'Bowing (Ruku’) & Rising (I’tidal)',
          arabicTitle: 'الرُّكُوعُ وَالاعْتِدَالُ',
          description: 'Bow at 90 degrees with flat back grasping knees saying "Subḥāna Rabbiyal-‘Aẓīm" (3x). Rise upright saying "Sami’Allāhu liman ḥamidah".',
          practicalTip: 'Achieve complete tranquility (Tuma’ninah) where every bone returns to its resting place.'
        },
        {
          stepNumber: 4,
          title: 'Prostration (Sujud) & Sitting (Jalsah)',
          arabicTitle: 'السُّجُودُ وَالْجُلُوسُ',
          description: 'Prostrate on 7 bones (forehead/nose, two palms, two knees, two toes) saying "Subḥāna Rabbiyal-A‘lā" (3x). Sit in humility between two sujuds.',
          practicalTip: 'You are closest to Allah during Sujud; make sincere personal dua in this state.'
        },
        {
          stepNumber: 5,
          title: 'Tashahhud, Salawat & Salam',
          arabicTitle: 'التَّشَهُّدُ وَالتَّسْلِيمُ',
          description: 'Sit for final testimony (At-Tahiyyat), invoke blessings upon Prophet Muhammad ﷺ and Prophet Ibrahim ﷺ, then turn head right and left with Salam.',
          practicalTip: 'Remain seated after Salam for 2-3 minutes for sacred post-prayer Adhkar.'
        }
      ],
      interactiveType: 'salah_postures'
    },
    benefits: {
      spiritual: [
        'Cleanses sins five times daily like a clear freshwater river flowing past your doorstep',
        'Direct spiritual communion and audience with the Lord of the worlds',
        'Divine shield against indecency, immorality, and heinous misconduct (Surah Al-Ankabut 29:45)',
        'Radiant light on the face, tranquility in the heart, and light over the Bridge of Sirat'
      ],
      worldly: [
        'Supreme mindfulness, discipline, time-management, and stress relief across the day',
        'Physical circulation and bodily restoration through periodic bowing and prostration',
        'Egalitarian social harmony through shoulder-to-shoulder congregational prayer'
      ],
      quranVerse: {
        arabic: 'اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
        translation: 'Recite what has been revealed to you of the Book and establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.',
        reference: 'Surah Al-Ankabut 29:45'
      },
      hadith: {
        arabic: 'أَرَأَيْتُمْ لَوْ أَنَّ نَهَرًا بِبَابِ أَحَدِكُمْ يَغْتَسِلُ مِنْهُ كُلَّ يَوْمٍ خَمْسَ مَرَّاتٍ، هَلْ يَبْقَى مِنْ دَرَنِهِ شَيْءٌ؟',
        text: 'If there was a river at the door of one of you and he bathed in it five times a day, would any dirt remain on him? Such is the example of the five daily prayers: Allah wipes away sins with them.',
        source: 'Sahih al-Bukhari 528, Sahih Muslim 667'
      }
    },
    punishmentsAndWarnings: {
      graveWarnings: [
        'The primary question asked on the Day of Judgment will be concerning Salah; if sound, all deeds succeed; if ruined, all deeds fail.',
        'Abandoning prayer is the defining boundary between faith and disbelief according to authentic prophetic Hadith.',
        'Willful abandonment of prayer leads into the catastrophic valley of Hell called "Saqar" and "Ghayya".'
      ],
      afterlifeWarning: 'Severe punishment in the grave where a boulder continuously crushes the head of the one who slept through obligatory prayers until the Day of Resurrection (Sahih al-Bukhari).',
      scholarlyConsensus: 'Neglecting prayer is ranked among the gravest major sins in Islam, heavier than theft, drinking wine, or consuming usury.',
      quranWarning: {
        arabic: 'مَا سَلَكَكُمْ فِي سَقَرَ • قَالُوا لَمْ نَكُ مِنَ الْمُصَلِّينَ',
        translation: '[The righteous will ask]: "What caused you to enter Hell (Saqar)?" They will reply: "We were not of those who prayed."',
        reference: 'Surah Al-Muddathir 74:42-43'
      },
      hadithWarning: {
        arabic: 'إِنَّ بَيْنَ الرَّجُلِ وَبَيْنَ الشِّرْكِ وَالْكُفْرِ تَرْكَ الصَّلاَةِ',
        text: 'Between a person and polytheism and disbelief is the abandonment of prayer.',
        source: 'Sahih Muslim 82'
      }
    }
  },
  {
    id: 'zakat',
    orderNumber: 3,
    name: 'Zakat',
    arabicName: 'الزَّكَاةُ',
    transliteration: 'Az-Zakāh',
    meaning: 'The Obligatory Purifying Alms',
    icon: Coins,
    color: 'text-yellow-400',
    accentBg: 'from-yellow-500/20 via-amber-950/20 to-slate-900/80',
    borderColor: 'border-yellow-500/30',
    shortSummary: 'The divine redistributive tax purifying wealth and the human soul. Transferring 2.5% of surplus eligible wealth exceeding the Nisab threshold to the 8 Quranic categories of vulnerable people.',
    whatToDo: {
      obligation: 'Pay 2.5% (1/40th) annually on qualifying wealth held for a complete lunar year (Hawl).',
      whoMustPerform: 'Every financially capable Muslim possessing wealth at or above the Nisab threshold.',
      conditions: [
        'Complete ownership of the wealth without debt encumbrance',
        'Wealth must exceed the Nisab threshold (equivalent to ~85g pure gold or ~595g silver)',
        'Passing of one complete Hijri lunar year (Hawl) on that accumulated wealth',
        'Wealth must be of a productive nature (cash, bank balances, gold, investments, merchandise)'
      ],
      coreAction: 'Calculate total net zakatable assets, subtract short-term debts, verify Nisab, and distribute 2.5% to eligible recipients.'
    },
    howToDoIt: {
      steps: [
        {
          stepNumber: 1,
          title: 'Audit All Qualifying Zakatable Assets',
          arabicTitle: 'حَصْرُ الْأَمْوَالِ الزَّكَوِيَّةِ',
          description: 'Sum cash on hand, bank accounts, gold & silver jewelry, market value of stocks/shares, trade inventory, and money lent to others expected to be repaid.',
          practicalTip: 'Primary residence, daily vehicle, furniture, and personal clothing are exempt.'
        },
        {
          stepNumber: 2,
          title: 'Deduct Immediate Short-Term Debts',
          arabicTitle: 'خَصْمُ الدُّيُونِ الْحَالَّةِ',
          description: 'Subtract overdue bills, immediate personal loans due this month, and current living expenses due immediately.',
          practicalTip: 'Long-term mortgage balances for future years are NOT deducted all at once.'
        },
        {
          stepNumber: 3,
          title: 'Verify Against Current Nisab Threshold',
          arabicTitle: 'مُقَارَنَةُ النِّصَابِ',
          description: 'Check today’s market value of 85 grams of 24k gold. If your net zakatable wealth equals or exceeds this sum, Zakat is mandatory.',
          practicalTip: 'Many contemporary scholars recommend using the silver Nisab (~595g silver) to maximize benefit for the poor.'
        },
        {
          stepNumber: 4,
          title: 'Calculate 2.5% & Disburse to 8 Categories',
          arabicTitle: 'إِخْرَاجُ ٢٫٥٪ لِمُسْتَحِقِّيهَا',
          description: 'Multiply net zakatable amount by 0.025 (2.5%). Distribute directly to the poor (Fuqara), destitute (Masakin), indebted, or trusted Islamic charity.',
          practicalTip: 'Giving Zakat to needy relatives (except parents and children) doubles the reward (charity + upholding family ties).'
        }
      ],
      interactiveType: 'zakat_calc'
    },
    benefits: {
      spiritual: [
        'Purifies the soul from greed, miserliness, arrogance, and materialism',
        'Invites divine Barakah (blessing) that supernaturally increases and protects remaining wealth',
        'Extinguishes sins and protects against catastrophic trials like water extinguishes fire',
        'Shield of shade on the Day of Resurrection under the canopy of your charity'
      ],
      worldly: [
        'Eradicates systemic poverty and economic inequality across the community',
        'Fosters deep love, solidarity, and mutual protection between the rich and the poor',
        'Prevents hoarding of capital and stimulates ethical, circulating economic prosperity'
      ],
      quranVerse: {
        arabic: 'خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَّهُمْ',
        translation: 'Take from their wealth a charity by which you purify them and cause them increase, and invoke [Allah’s blessings] upon them. Indeed, your invocations are reassurance for them.',
        reference: 'Surah At-Tawbah 9:103'
      },
      hadith: {
        arabic: 'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
        text: 'Charity does not decrease wealth in the slightest; rather Allah increases it, and whoever is humble for Allah, Allah elevates him.',
        source: 'Sahih Muslim 2588'
      }
    },
    punishmentsAndWarnings: {
      graveWarnings: [
        'Hoarded wealth upon which Zakat was withheld will be transformed into a lethal fiery punishment.',
        'Withholding Zakat causes collective social deprivation, droughts, and withdrawal of divine blessings from agriculture and economy.',
        'Deprives the miserly owner of the pleasure of Allah and seals their fate with the arrogant oppressors.'
      ],
      afterlifeWarning: 'Surah At-Tawbah describes gold and silver plates heated in Hellfire and branded upon the foreheads, flanks, and backs of those who hoarded wealth without paying Zakat.',
      scholarlyConsensus: 'Denying the obligation of Zakat is an act of apostasy; refusing to pay it out of greed is a major capital sin subject to divine wrath and confiscation.',
      quranWarning: {
        arabic: 'وَالَّذِينَ يَكْنِزُونَ الذَّهَبَ وَالْفِضَّةَ وَلَا يُنفِقُونَهَا فِي سَبِيلِ اللَّهِ فَبَشِّرْهُم بِعَذَابٍ أَلِيمٍ • يَوْمَ يُحْمَىٰ عَلَيْهَا فِي نَارِ جَهَنَّمَ فَتُكْوَىٰ بِهَا جِبَاهُهُمْ وَجُنُوبُهُمْ وَظُهُورُهُمْ',
        translation: 'And those who hoard gold and silver and spend it not in the way of Allah—give them tidings of a painful punishment. On the Day when it will be heated in the fire of Hell and seared against their foreheads, their flanks, and their backs...',
        reference: 'Surah At-Tawbah 9:34-35'
      },
      hadithWarning: {
        arabic: 'مَنْ آتَاهُ اللَّهُ مَالاً فَلَمْ يُؤَدِّ زَكَاتَهُ مُثِّلَ لَهُ مَالُهُ يَوْمَ الْقِيَامَةِ شُجَاعًا أَقْرَعَ لَهُ زَبِيبَتَانِ يُطَوَّقُهُ يَوْمَ الْقِيَامَةِ ثُمَّ يَأْخُذُ بِلِهْزِمَتَيْهِ',
        text: 'Whoever is given wealth by Allah and does not pay its Zakat, his wealth will appear on the Day of Resurrection as a bald, venomous serpent with two black spots that will encircle his neck and bite his jaws, saying: "I am your wealth! I am your hoarded treasure!"',
        source: 'Sahih al-Bukhari 1403'
      }
    }
  },
  {
    id: 'sawm',
    orderNumber: 4,
    name: 'Sawm',
    arabicName: 'الصَّوْمُ',
    transliteration: 'Aṣ-Ṣawm',
    meaning: 'Fasting the Holy Month of Ramadan',
    icon: Moon,
    color: 'text-purple-400',
    accentBg: 'from-purple-500/20 via-indigo-950/20 to-slate-900/80',
    borderColor: 'border-purple-500/30',
    shortSummary: 'The spiritual shield and mastery over desire. Total abstinence from food, drink, intimacy, and sinful conduct from true dawn (Fajr) to sunset (Maghrib) during the 9th lunar month of Ramadan.',
    whatToDo: {
      obligation: 'Fast all 29 or 30 days of the sacred month of Ramadan with sincere intention.',
      whoMustPerform: 'Every healthy, sane, adult resident Muslim. (Exemptions with makeup days for travelers, sick, pregnant, and nursing).',
      conditions: [
        'Formulating intention (Niyyah) in the heart each night before Fajr',
        'Abstinence from all food, drink, and marital relations from dawn to dusk',
        'Abstinence from vulgarity, backbiting, anger, and moral corruption',
        'Ritual purity for women (post-menstruation / post-partum)'
      ],
      coreAction: 'Fast from the call of Fajr until the call of Maghrib, accompanied by Quran recitation, Taraweeh, and spiritual introspection.'
    },
    howToDoIt: {
      steps: [
        {
          stepNumber: 1,
          title: 'Nightly Sincere Intention (Niyyah)',
          arabicTitle: 'عَقْدُ النِّيَّةِ لَيْلًا',
          description: 'Resolve firmly in your heart before Fajr to fast the upcoming day for the sake of Allah alone.',
          practicalTip: 'Intention is firmly established simply by waking up intending to fast.'
        },
        {
          stepNumber: 2,
          title: 'The Blessed Suhoor (Pre-Dawn Meal)',
          arabicTitle: 'تَنَاوُلُ السَّحُورِ الْمُبَارَكِ',
          description: 'Eat a wholesome, hydrating meal before Fajr adhan. The Prophet ﷺ emphasized: "Take Suhoor, for indeed in Suhoor there is blessing."',
          practicalTip: 'Dates, complex carbohydrates, oats, and ample water provide sustained cellular energy.'
        },
        {
          stepNumber: 3,
          title: 'Guarding the Fast & Restraining Sins',
          arabicTitle: 'حِفْظُ الصِّيَامِ وَالْجَوَارِحِ',
          description: 'Fast with your tongue (no backbiting or lying), eyes, ears, and thoughts. If insulted, respond calmly: "Inni Ṣā’im" (I am fasting).',
          practicalTip: 'Increase recitation of the Quran and remembrance of Allah during daytime hours.'
        },
        {
          stepNumber: 4,
          title: 'Prompt Iftar (Breaking Fast) at Sunset',
          arabicTitle: 'تَعْجِيلُ الْإِفْطَارِ عِنْدَ الْغُرُوبِ',
          description: 'Break fast immediately upon sunset with fresh/dry dates or water. Recite the authentic dua: "Dhahaba aẓ-ẓama’u wabtallatil-‘urūqu wa thabatal-ajru inshā’Allāh."',
          practicalTip: 'Make heartfelt personal supplications just before Iftar, as this is an answered window of dua.'
        },
        {
          stepNumber: 5,
          title: 'Night Taraweeh & Qiyam al-Layl',
          arabicTitle: 'قِيَامُ اللَّيْلِ وَالتَّرَاوِيحُ',
          description: 'Stand in nocturnal prayer (Taraweeh) after Isha in congregation, especially seeking the Night of Decree (Laylat al-Qadr).',
          practicalTip: 'Seek Laylat al-Qadr in the odd nights of the last 10 days of Ramadan.'
        }
      ],
      interactiveType: 'sawm_guide'
    },
    benefits: {
      spiritual: [
        'Development of Taqwa (God-consciousness and divine reverence) in private and public',
        'Total forgiveness of all prior lifetime sins ("Whoever fasts Ramadan out of faith and hope of reward, all previous sins are forgiven")',
        'Exclusive royal entry into Paradise through the private celestial gate called "Ar-Rayyan"',
        'Direct infinite divine reward whose exact magnitude is known only to Allah'
      ],
      worldly: [
        'Profound cellular detoxification, metabolic autophagy, mental clarity, and digestive reset',
        'Deep visceral empathy with the hungry, poor, and disenfranchised around the globe',
        'Unmatched self-control, emotional regulation, and liberation from bad habits and addictions'
      ],
      quranVerse: {
        arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
        translation: 'O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may attain Taqwa (God-consciousness).',
        reference: 'Surah Al-Baqarah 2:183'
      },
      hadith: {
        arabic: 'كُلُّ عَمَلِ ابْنِ آدَمَ يُضَاعَفُ... إِلاَّ الصَّوْمَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ',
        text: 'Every good deed of the son of Adam is multiplied tenfold up to seven hundred times, except fasting, for Allah says: "Fasting is for Me alone, and I shall reward for it."',
        source: 'Sahih al-Bukhari 1894, Sahih Muslim 1151'
      }
    },
    punishmentsAndWarnings: {
      graveWarnings: [
        'Deliberately breaking even a single day of Ramadan without valid Islamic medical or travel excuse is a catastrophic major sin.',
        'A single deliberately missed day cannot be truly compensated for, even if one fasted the rest of eternity, according to several early scholars.',
        'Leads to spiritual hardening, hypocrisy, and destruction of religious character.'
      ],
      afterlifeWarning: 'A terrifying vision shown to the Prophet ﷺ of people suspended upside down by their Achilles tendons with their cheeks torn and streaming with blood for deliberately breaking their fast before time.',
      scholarlyConsensus: 'Willfully discarding the fast of Ramadan while possessing physical health and sanity is an explicit manifestation of rebellion against Allah.',
      quranWarning: {
        arabic: 'فَمَن شَهِدَ مِنكُمُ الشَّهْرَ فَلْيَصُمْهُ ۖ وَمَن كَانَ مَرِيضًا أَوْ عَلَىٰ سَفَرٍ فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ',
        translation: 'So whoever sights [the new moon of] the month, let him fast it; and whoever is ill or on a journey - then an equal number of other days...',
        reference: 'Surah Al-Baqarah 2:185'
      },
      hadithWarning: {
        arabic: 'بَيْنَا أَنَا نَائِمٌ إِذْ أَتَانِي رَجُلاَنِ... فَإِذَا أَنَا بِقَوْمٍ مُعَلَّقِينَ بِعَرَاقِيبِهِمْ، مُشَقَّقَةٍ أَشْدَاقُهُمْ، تَسِيلُ أَشْدَاقُهُمْ دَمًا، قُلْتُ: مَنْ هَؤُلاَءِ؟ قَالَ: هَؤُلاَءِ الَّذِينَ يُفْطِرُونَ قَبْلَ تَحِلَّةِ صَوْمِهِمْ',
        text: 'While I was sleeping, two angels took me... and I saw people suspended by their ankle-tendons, with their jaw-corners torn and dripping with blood. I asked: "Who are these?" He replied: "These are the ones who broke their fast before its permissible time."',
        source: 'Sahih Ibn Khuzaymah 1986, Sahih Ibn Hibban 7491 (Authentic)'
      }
    }
  },
  {
    id: 'hajj',
    orderNumber: 5,
    name: 'Hajj',
    arabicName: 'الْحَجُّ',
    transliteration: 'Al-Ḥajj',
    meaning: 'The Sacred Pilgrimage to Makkah',
    icon: MapPin,
    color: 'text-teal-400',
    accentBg: 'from-teal-500/20 via-cyan-950/20 to-slate-900/80',
    borderColor: 'border-teal-500/30',
    shortSummary: 'The grand spiritual culmination of a lifetime. The sacred pilgrimage to the Holy House of Allah (Kaaba) and the plains of Arafat, Mina, and Muzdalifah at least once in a lifetime for those physically and financially able.',
    whatToDo: {
      obligation: 'Perform the rites of Hajj during the sacred month of Dhul-Hijjah once in a lifetime.',
      whoMustPerform: 'Every free, sane, adult Muslim who possesses the financial ability (Istita’ah) and safe passage.',
      conditions: [
        'Financial capability covering travel, lodging, and ongoing family support at home',
        'Physical health and physical stamina to perform the rigorous rites',
        'Security and safety of travel routes',
        'Valid Ihram entered before crossing designated territorial Miqat boundaries'
      ],
      coreAction: 'Don the unstitched white Ihram sheets, circumambulate the Kaaba (Tawaf), run between Safa & Marwah (Sa’i), and stand on the Plain of Arafat on the 9th of Dhul-Hijjah.'
    },
    howToDoIt: {
      steps: [
        {
          stepNumber: 1,
          title: 'Entering Ihram & Talbiyah at Miqat',
          arabicTitle: 'الإِحْرَامُ وَالتَّلْبِيَةُ مِنَ الْمِيقَاتِ',
          description: 'Bathe, don two white unstitched sheets (for men) or modest dress (for women), make Niyyah, and continuously chant the Talbiyah: "Labbayk Allāhumma Labbayk..."',
          practicalTip: 'Enter a state of total peace: no perfumes, no clipping nails, no arguments.'
        },
        {
          stepNumber: 2,
          title: 'Tawaf al-Qudum & Sa’i (Arrival)',
          arabicTitle: 'طَوَافُ الْقُدُومِ وَالسَّعْيُ',
          description: 'Perform 7 counter-clockwise circuits around the Kaaba starting from the Black Stone. Then walk 7 times between Mount Safa and Mount Marwah reenacting Hajar’s search for water.',
          practicalTip: 'Keep your focus on heartfelt praise and personal repentance during circumambulation.'
        },
        {
          stepNumber: 3,
          title: 'Day of Tarwiyah (Mina) & The Day of Arafat',
          arabicTitle: 'يَوْمُ التَّرْوِيَةِ بِمِنَى وَالْوُقُوفُ بِعَرَفَةَ',
          description: 'Camp in Mina on the 8th of Dhul-Hijjah. On the 9th, move to Mount Arafat for the supreme standing (Wuquf) from noon till sunset in tears and supplication.',
          practicalTip: '"Hajj is Arafat" — this is the most critical afternoon of your entire life.'
        },
        {
          stepNumber: 4,
          title: 'Muzdalifah & Stoning the Jamarat (Mina)',
          arabicTitle: 'الْمُزْدَلِفَةُ وَرَمْيُ الْجَمَرَاتِ',
          description: 'Spend the night under the stars in Muzdalifah gathering pebbles. Return to Mina on the 10th (Eid day) to stone the Jamarat al-Aqaba (rejecting Satan), offer sacrifice, and shave/trim hair.',
          practicalTip: 'Release all ego, pride, and material attachment when cutting your hair.'
        },
        {
          stepNumber: 5,
          title: 'Tawaf al-Ifadah & Farewell Tawaf (Wida’)',
          arabicTitle: 'طَوَافُ الإِفَاضَةِ وَطَوَافُ الْوَدَاعِ',
          description: 'Return to the Grand Mosque for the core Tawaf al-Ifadah. Conclude your pilgrimage before departing Makkah with the Farewell Tawaf.',
          practicalTip: 'Depart with a renewed soul, carrying the discipline and piety of Hajj back into daily life.'
        }
      ],
      interactiveType: 'hajj_timeline'
    },
    benefits: {
      spiritual: [
        'Total eradication of all lifetime sins — returning pure and sinless as the day born of your mother',
        'Direct answer to the ancient supplication of Prophet Ibrahim (Abraham) and Prophet Ismail ﷺ',
        'Guaranteed reward of Paradise for the Mabroor (pure and accepted) Hajj',
        'Rehearsal for the Grand Gathering on the Day of Resurrection'
      ],
      worldly: [
        'Unmatched global visual manifestation of human equality, obliterating all racial, national, and class divisions',
        'Profound spiritual transformation that rewrites life priorities, ethics, and character forever',
        'Immense physical resilience, endurance, patience, and solidarity with millions of brethren'
      ],
      quranVerse: {
        arabic: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ',
        translation: 'And proclaim to the people the Hajj [pilgrimage]; they will come to you on foot and on every lean camel; they will come from every distant pass.',
        reference: 'Surah Al-Hajj 22:27'
      },
      hadith: {
        arabic: 'مَنْ حَجَّ لِلَّهِ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ',
        text: 'Whoever performs Hajj for the sake of Allah and does not commit any obscenity or transgression shall return [free of sins] as on the day his mother gave birth to him.',
        source: 'Sahih al-Bukhari 1521, Sahih Muslim 1350'
      }
    },
    punishmentsAndWarnings: {
      graveWarnings: [
        'Neglecting Hajj while having the financial wealth and bodily health is an egregious refusal of an explicit divine invitation.',
        'Delayed procrastination until unexpected illness or death strikes without having fulfilled this pillar.',
        'Wasting wealth on luxury vacations while leaving the house of Allah unvisited despite full financial capability.'
      ],
      afterlifeWarning: 'The grave danger of dying upon a state devoid of the completion of Islam; Caliph Umar ibn Al-Khattab issued severe warnings against able individuals who deliberately avoid Hajj.',
      scholarlyConsensus: 'Hajj is an absolute fard obligation once in a lifetime upon the capable; intentional refusal is a devastating major sin.',
      quranWarning: {
        arabic: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا ۚ وَمَن كَفَرَ فَإِنَّ اللَّهَ غَنِيٌّ عَنِ الْعَالَمِينَ',
        translation: 'And [due] to Allah from the people is a pilgrimage to the House - for whoever is able to find thereto a way. But whoever disbelieves - then indeed, Allah is free from need of the worlds.',
        reference: 'Surah Ali ‘Imran 3:97'
      },
      hadithWarning: {
        arabic: 'تَعَجَّلُوا إِلَى الْحَجِّ - يَعْنِي الْفَرِيضَةَ - فَإِنَّ أَحَدَكُمْ لاَ يَدْرِي مَا يَعْرِضُ لَهُ',
        text: 'Hasten to perform Hajj—meaning the obligatory pilgrimage—for none of you knows what obstacles or illness may happen to him.',
        source: 'Musnad Ahmad 2867, Sunan Abi Dawud 1732 (Sahih)'
      }
    }
  }
];

export default function FivePillarsView({
  onBack,
  addHasanat
}: {
  onBack?: () => void;
  addHasanat?: (amount: number) => void;
}) {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('shahada');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'how_to' | 'benefits' | 'warnings' | 'interactive'>('overview');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Interactive Zakat Calculator State
  const [calcCash, setCalcCash] = useState<number>(5000);
  const [calcGold, setCalcGold] = useState<number>(2000);
  const [calcInvestments, setCalcInvestments] = useState<number>(1000);
  const [calcDebts, setCalcDebts] = useState<number>(500);
  const GOLD_NISAB_APPROX = 5800; // USD equivalent approx

  // Interactive Shahadah affirmation
  const [shahadahAffirmed, setShahadahAffirmed] = useState<boolean>(false);

  // Active pillar
  const activePillar = FIVE_PILLARS_DATA.find(p => p.id === selectedPillarId) || FIVE_PILLARS_DATA[0];
  const Icon = activePillar.icon;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSpeak = (text: string) => {
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

  const totalZakatableWealth = Math.max(0, (calcCash + calcGold + calcInvestments) - calcDebts);
  const isEligibleForZakat = totalZakatableWealth >= GOLD_NISAB_APPROX;
  const calculatedZakatDue = isEligibleForZakat ? totalZakatableWealth * 0.025 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. HERO BANNER */}
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
              <span>Arkān al-Islām • The 5 Pillars of Islam</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              The Five Sacred Pillars of Islam <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-emerald-300 font-serif font-arabic">
                أَرْكَانُ الْإِسْلَامِ الْخَمْسَةُ
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Islam is constructed upon five foundational pillars. Explore what to do, step-by-step instructions, immense worldly and afterlife benefits, interactive simulations, and the severe divine warnings for willful neglect.
            </p>
          </div>

          {/* Quick Actions & Hadith Token */}
          <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center space-y-1">
              <span className="text-3xl font-black text-amber-300 font-mono">5</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foundational Pillars</p>
            </div>
            <button
              onClick={() => {
                if (addHasanat) addHasanat(25);
                shareService.open({
                  title: 'The Five Pillars of Islam Master Guide',
                  text: 'Explore the complete guide to the 5 Pillars of Islam (Shahada, Salah, Zakat, Sawm, Hajj), step-by-step instructions, benefits, and warnings on Aloha Sanctuary.',
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

        {/* Famous Jibril Hadith Banner */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-amber-400 shrink-0" />
            <span className="italic">
              "Islam is built upon five: Testimony that none has the right to be worshiped but Allah and Muhammad is His Messenger, establishing prayer, paying Zakat, Hajj to the House, and fasting Ramadan."
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider shrink-0 bg-black/40 px-3 py-1 rounded-full border border-white/10">
            Sahih al-Bukhari 8, Sahih Muslim 16
          </span>
        </div>
      </div>

      {/* 2. THE 5 PILLARS SELECTOR BENTO */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {FIVE_PILLARS_DATA.map((pillar) => {
          const PIcon = pillar.icon;
          const isSelected = pillar.id === selectedPillarId;
          return (
            <button
              key={pillar.id}
              onClick={() => {
                setSelectedPillarId(pillar.id);
                if (addHasanat) addHasanat(5);
              }}
              className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center space-y-3 cursor-pointer group relative overflow-hidden ${
                isSelected 
                  ? `bg-gradient-to-b ${pillar.accentBg} ${pillar.borderColor} shadow-2xl scale-105 ring-2 ring-amber-400/40` 
                  : 'bg-[#061828]/60 hover:bg-[#082238] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="absolute top-2 right-3 text-[10px] font-mono font-bold text-slate-500">
                #{pillar.orderNumber}
              </div>

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-amber-400 text-brand-depth shadow-lg shadow-amber-400/30 scale-110' 
                  : `bg-white/5 ${pillar.color} border border-white/10 group-hover:scale-110`
              }`}>
                <PIcon size={26} />
              </div>

              <div className="space-y-0.5">
                <span className="text-sm font-arabic font-bold text-amber-300/80 block">{pillar.arabicName}</span>
                <h3 className={`text-base font-black transition-colors ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {pillar.name}
                </h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 font-medium">
                  {pillar.meaning}
                </p>
              </div>

              {isSelected && (
                <motion.div 
                  layoutId="activePillarPill"
                  className="w-8 h-1 bg-amber-400 rounded-full mt-1" 
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. SUB-SECTION NAVIGATION FOR SELECTED PILLAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10 pt-2">
        {[
          { id: 'overview', label: '1. What It Is & What To Do', icon: Landmark },
          { id: 'how_to', label: '2. Step-by-Step Instructions', icon: Layers },
          { id: 'benefits', label: '3. Divine Benefits & Virtues', icon: ShieldCheck },
          { id: 'warnings', label: '4. Punishment & Severe Warnings', icon: ShieldAlert },
          { id: 'interactive', label: '5. Interactive Experience & Action', icon: Sparkles }
        ].map((tab) => {
          const SubIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive 
                  ? 'bg-amber-400 text-brand-depth shadow-xl shadow-amber-400/20 scale-105' 
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <SubIcon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. ACTIVE PILLAR CONTENT CONTAINER */}
      <AnimatePresence mode="wait">
        
        {/* SUBTAB 1: WHAT IT IS & WHAT TO DO */}
        {activeSubTab === 'overview' && (
          <motion.div
            key={`${activePillar.id}-overview`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br ${activePillar.accentBg} border ${activePillar.borderColor} shadow-2xl space-y-8`}
          >
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
                  <span>Pillar #{activePillar.orderNumber}</span>
                  <span>&bull;</span>
                  <span>{activePillar.transliteration}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white">{activePillar.name}: {activePillar.meaning}</h2>
                <span className="text-2xl sm:text-3xl font-arabic font-bold text-amber-300 block">{activePillar.arabicName}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSpeak(`${activePillar.name}. ${activePillar.shortSummary}`)}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  {isPlayingAudio ? <VolumeX size={16} className="text-amber-400" /> : <Volume2 size={16} className="text-amber-400" />}
                  <span>{isPlayingAudio ? 'Stop Audio' : 'Listen Guide'}</span>
                </button>
              </div>
            </div>

            {/* Core Essence Text */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-white/10 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">Core Theological Definition</span>
              <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
                {activePillar.shortSummary}
              </p>
            </div>

            {/* Matrix of Obligation, Who & Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <CheckCircle2 size={20} />
                  <h4 className="text-sm font-black uppercase tracking-wider">What Exactly Is Obligated</h4>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                  {activePillar.whatToDo.obligation}
                </p>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">Target Individual:</span>
                  <p className="text-xs text-slate-300">{activePillar.whatToDo.whoMustPerform}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles size={20} />
                  <h4 className="text-sm font-black uppercase tracking-wider">Essential Prerequisites & Conditions</h4>
                </div>
                <ul className="space-y-2">
                  {activePillar.whatToDo.conditions.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                        ✓
                      </span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Core Action Callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-emerald-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 block mb-1">Fundamental Practical Directive</span>
                <p className="text-sm font-bold text-white">{activePillar.whatToDo.coreAction}</p>
              </div>
              <button
                onClick={() => setActiveSubTab('how_to')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-brand-depth font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 cursor-pointer hover:bg-amber-300 transition-all shadow-md"
              >
                <span>View How-To Steps</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: STEP-BY-STEP INSTRUCTIONS */}
        {activeSubTab === 'how_to' && (
          <motion.div
            key={`${activePillar.id}-howto`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white">How to Perform: {activePillar.name}</h3>
                <p className="text-xs text-slate-400">Chronological step-by-step practical guide according to the authentic Sunnah</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
                {activePillar.howToDoIt.steps.length} Key Steps
              </span>
            </div>

            <div className="space-y-4">
              {activePillar.howToDoIt.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-7 rounded-[2.5rem] bg-[#061828]/80 hover:bg-[#071F36] border border-white/10 shadow-xl transition-all space-y-4 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-brand-depth font-mono font-black text-lg flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0">
                        {step.stepNumber}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">{step.title}</h4>
                        {step.arabicTitle && (
                          <span className="text-sm font-arabic font-bold text-amber-300">{step.arabicTitle}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(`${step.title}\n${step.description}\nTip: ${step.practicalTip}`, `step_${step.stepNumber}`)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer self-end sm:self-auto"
                      title="Copy Step"
                    >
                      {copiedKey === `step_${step.stepNumber}` ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed pl-0 sm:pl-16">
                    {step.description}
                  </p>

                  <div className="ml-0 sm:ml-16 p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                    <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300">
                      <span className="font-bold text-amber-300 mr-1">Practical Sunnah Tip:</span>
                      {step.practicalTip}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: DIVINE BENEFITS & VIRTUES */}
        {activeSubTab === 'benefits' && (
          <motion.div
            key={`${activePillar.id}-benefits`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quran Citation Card */}
            <div className="p-8 sm:p-10 rounded-[3rem] bg-gradient-to-br from-emerald-950/60 via-[#061828] to-[#020A12] border border-emerald-500/30 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300 flex items-center gap-2">
                  <BookOpen size={14} /> Divine Quranic Ordinance
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {activePillar.benefits.quranVerse.reference}
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-arabic text-emerald-100 text-right leading-loose">
                {activePillar.benefits.quranVerse.arabic}
              </p>
              <p className="text-sm text-slate-200 italic leading-relaxed">
                "{activePillar.benefits.quranVerse.translation}"
              </p>
            </div>

            {/* Dual Matrix: Spiritual & Worldly Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Spiritual Virtues */}
              <div className="p-7 rounded-[2.5rem] bg-[#061828]/80 border border-amber-500/20 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/20">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Spiritual & Afterlife Virtues</h4>
                    <span className="text-[10px] text-slate-400">Direct rewards in Jannah and soul purification</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activePillar.benefits.spiritual.map((b, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-200 leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worldly Benefits */}
              <div className="p-7 rounded-[2.5rem] bg-[#061828]/80 border border-emerald-500/20 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white">Worldly & Social Benefits</h4>
                    <span className="text-[10px] text-slate-400">Psychological, physical, and communal harmony</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activePillar.benefits.worldly.map((b, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-200 leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Authentic Hadith Banner */}
            <div className="p-8 rounded-3xl bg-black/60 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                  Authentic Prophetic Promise
                </span>
                <span className="text-xs font-mono text-slate-400">{activePillar.benefits.hadith.source}</span>
              </div>
              <p className="text-lg sm:text-xl font-arabic text-amber-100 text-right leading-loose">
                {activePillar.benefits.hadith.arabic}
              </p>
              <p className="text-sm text-slate-300 italic leading-relaxed">
                "{activePillar.benefits.hadith.text}"
              </p>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 4: PUNISHMENT & GRAVE WARNINGS */}
        {activeSubTab === 'warnings' && (
          <motion.div
            key={`${activePillar.id}-warnings`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Severe Warning Alert Card */}
            <div className="p-8 sm:p-10 rounded-[3rem] bg-gradient-to-br from-red-950/70 via-rose-950/40 to-[#020A12] border border-red-500/40 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">Severe Divine Caution</span>
                    <h3 className="text-2xl font-black text-white">Consequences of Neglecting {activePillar.name}</h3>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-400 bg-red-500/20 px-3.5 py-1.5 rounded-full border border-red-500/30">
                  Major Transgression
                </span>
              </div>

              {/* Quran Warning Citation */}
              <div className="p-6 rounded-2xl bg-black/60 border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-300">Quranic Warning</span>
                  <span className="font-mono text-slate-400">{activePillar.punishmentsAndWarnings.quranWarning.reference}</span>
                </div>
                <p className="text-lg sm:text-xl font-arabic text-red-100 text-right leading-loose">
                  {activePillar.punishmentsAndWarnings.quranWarning.arabic}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{activePillar.punishmentsAndWarnings.quranWarning.translation}"
                </p>
              </div>

              {/* Hadith Warning Citation */}
              <div className="p-6 rounded-2xl bg-black/60 border border-red-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-300">Prophetic Hadith Warning</span>
                  <span className="font-mono text-slate-400">{activePillar.punishmentsAndWarnings.hadithWarning.source}</span>
                </div>
                <p className="text-base sm:text-lg font-arabic text-red-100 text-right leading-loose">
                  {activePillar.punishmentsAndWarnings.hadithWarning.arabic}
                </p>
                <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  "{activePillar.punishmentsAndWarnings.hadithWarning.text}"
                </p>
              </div>
            </div>

            {/* Detailed Warnings Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-7 rounded-[2.5rem] bg-[#061828]/80 border border-red-500/20 space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <Flame size={20} />
                  <h4 className="text-sm font-black uppercase tracking-wider">Specific Transgressions & Losses</h4>
                </div>
                <ul className="space-y-3">
                  {activePillar.punishmentsAndWarnings.graveWarnings.map((warn, i) => (
                    <li key={i} className="p-4 rounded-2xl bg-black/40 border border-red-500/10 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                      <span className="text-red-400 font-black text-sm shrink-0">✕</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-7 rounded-[2.5rem] bg-[#061828]/80 border border-red-500/20 space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <BookOpen size={20} />
                  <h4 className="text-sm font-black uppercase tracking-wider">Scholarly Consensus & Juristic Ruling</h4>
                </div>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unanimous Consensus</span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {activePillar.punishmentsAndWarnings.scholarlyConsensus}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-300">Afterlife State</span>
                  <p className="text-xs text-red-100 leading-relaxed font-semibold">
                    {activePillar.punishmentsAndWarnings.afterlifeWarning}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 5: INTERACTIVE SIMULATION & ACTION TOOL */}
        {activeSubTab === 'interactive' && (
          <motion.div
            key={`${activePillar.id}-interactive`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* 1. SHAHADAH INTERACTIVE DECLARATION */}
            {activePillar.id === 'shahada' && (
              <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-amber-500/20 via-orange-950/20 to-slate-900 border border-amber-500/30 shadow-2xl space-y-8 text-center">
                <div className="max-w-2xl mx-auto space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-amber-400 text-brand-depth flex items-center justify-center mx-auto shadow-xl shadow-amber-400/20">
                    <Landmark size={32} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">The Sacred Shahadah Pronunciation Studio</h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Listen to the precise phonetic articulation, read the transliteration, and reaffirm your covenant with Allah.
                  </p>
                </div>

                {/* Big Arabic Display Card */}
                <div className="p-8 rounded-3xl bg-black/60 border border-amber-400/30 space-y-6">
                  <p className="text-3xl sm:text-5xl font-arabic text-amber-200 leading-loose">
                    أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ ٱللَّٰهِ
                  </p>
                  <p className="text-base sm:text-lg text-slate-300 font-mono">
                    "Ash-hadu an lā ilāha illallāh, wa ash-hadu anna Muḥammadan ‘abduhū wa rasūluh."
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 italic">
                    "I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is His servant and messenger."
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/10">
                    <button
                      onClick={() => handleSpeak('Ash-hadu an la ilaha illallah, wa ash-hadu anna Muhammadan rasulullah')}
                      className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Volume2 size={16} className="text-amber-400" />
                      <span>Listen Recitation</span>
                    </button>
                    <button
                      onClick={() => {
                        setShahadahAffirmed(true);
                        if (addHasanat) addHasanat(50);
                      }}
                      className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-brand-depth font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-400/25 flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles size={16} />
                      <span>{shahadahAffirmed ? '✓ Covenant Reaffirmed (+50 Hasanat)' : 'Affirm My Shahadah in My Heart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SALAH INTERACTIVE POSTURE OVERVIEW */}
            {activePillar.id === 'salah' && (
              <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-emerald-500/20 via-teal-950/20 to-slate-900 border border-emerald-500/30 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">5 Daily Stations of Salah</h3>
                    <p className="text-xs text-slate-300">Total 17 obligatory rak’ats across the day</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                    Daily Schedule
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { name: 'Fajr', time: 'Dawn to Sunrise', rakats: '2 Fard', aloud: 'Aloud' },
                    { name: 'Dhuhr', time: 'Midday Zenith', rakats: '4 Fard', aloud: 'Silent' },
                    { name: 'Asr', time: 'Late Afternoon', rakats: '4 Fard', aloud: 'Silent' },
                    { name: 'Maghrib', time: 'Sunset', rakats: '3 Fard', aloud: '2 Aloud + 1 Silent' },
                    { name: 'Isha', time: 'Night Twilight', rakats: '4 Fard', aloud: '2 Aloud + 2 Silent' }
                  ].map((p, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-black/50 border border-white/10 text-center space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">{p.name}</span>
                      <p className="text-lg font-black text-white font-mono">{p.rakats}</p>
                      <p className="text-[10px] text-slate-400">{p.time}</p>
                      <span className="text-[9px] font-bold text-amber-300 block">{p.aloud}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ZAKAT CALCULATOR SIMULATOR */}
            {activePillar.id === 'zakat' && (
              <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-yellow-500/20 via-amber-950/20 to-slate-900 border border-yellow-500/30 shadow-2xl space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <Calculator size={24} className="text-yellow-400" />
                    <span>Instant Zakat Nisab Calculator</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Calculate your exact 2.5% annual zakat obligation based on eligible liquid assets held for one lunar year.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Cash on Hand & Bank Balances ($)</label>
                      <input 
                        type="number"
                        value={calcCash}
                        onChange={(e) => setCalcCash(Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Gold, Silver & Liquid Jewelry Value ($)</label>
                      <input 
                        type="number"
                        value={calcGold}
                        onChange={(e) => setCalcGold(Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Stocks, Shares & Trade Inventory ($)</label>
                      <input 
                        type="number"
                        value={calcInvestments}
                        onChange={(e) => setCalcInvestments(Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">Immediate Short-Term Debts Due ($)</label>
                      <input 
                        type="number"
                        value={calcDebts}
                        onChange={(e) => setCalcDebts(Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  {/* Results Panel */}
                  <div className="p-6 rounded-3xl bg-black/60 border border-yellow-500/20 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="text-slate-400">Gold Nisab Benchmark:</span>
                        <span className="font-mono text-yellow-300 font-bold">~${GOLD_NISAB_APPROX.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                        <span className="text-slate-400">Net Zakatable Wealth:</span>
                        <span className="font-mono text-white font-black text-base">${totalZakatableWealth.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Nisab Threshold Met:</span>
                        <span className={`font-bold ${isEligibleForZakat ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isEligibleForZakat ? '✓ Yes, Zakat is Fard' : 'Below Nisab (No Zakat Due)'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 text-center space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-300">Zakat Due (2.5%)</span>
                      <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                        ${calculatedZakatDue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SAWM RAMADAN TIMELINE */}
            {activePillar.id === 'sawm' && (
              <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-purple-500/20 via-indigo-950/20 to-slate-900 border border-purple-500/30 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">Daily Fasting Architecture</h3>
                  <p className="text-xs text-slate-300">The daily rhythm of the fasting believer from Suhoor to Qiyam</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: '1. Suhoor & Niyyah', time: 'Before Fajr Dawn', desc: 'Hydrating meal, dates, and sincere heart intention.' },
                    { title: '2. Daytime Restraint', time: 'Dawn to Dusk', desc: 'No food, water, or sins. Maximum Quran & Dhikr.' },
                    { title: '3. Sunset Iftar', time: 'At Maghrib', desc: 'Break fast promptly on dates/water with answered dua.' },
                    { title: '4. Night Taraweeh', time: 'After Isha', desc: 'Nocturnal standing in congregation seeking Laylat al-Qadr.' }
                  ].map((s, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-400">{s.title}</span>
                      <p className="text-xs font-bold text-amber-300">{s.time}</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. HAJJ TIMELINE & RITES */}
            {activePillar.id === 'hajj' && (
              <div className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-teal-500/20 via-cyan-950/20 to-slate-900 border border-teal-500/30 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white">The 5 Days of Hajj (Dhul-Hijjah 8–12)</h3>
                  <p className="text-xs text-slate-300">Chronological stages of the supreme lifetime journey</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { day: 'Day 1 (8th)', name: 'Yawm at-Tarwiyah', place: 'Mina Tents', task: 'Don Ihram, pray 5 prayers in Mina.' },
                    { day: 'Day 2 (9th)', name: 'Yawm Arafat', place: 'Plain of Arafat', task: 'The Pinnacle: Wuquf & dua from noon to sunset.' },
                    { day: 'Night 2', name: 'Muzdalifah', place: 'Open Desert', task: 'Gather pebbles & rest under the stars.' },
                    { day: 'Day 3 (10th)', name: 'Eid al-Adha', place: 'Mina & Kaaba', task: 'Stone Jamarat, sacrifice, shave head, Tawaf Ifadah.' },
                    { day: 'Days 4-5', name: 'Ayyam at-Tashriq', place: 'Mina & Kaaba', task: 'Stone all 3 Jamarats & Farewell Tawaf.' }
                  ].map((h, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-1.5 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 font-mono">{h.day}</span>
                      <h4 className="text-xs font-black text-white">{h.name}</h4>
                      <span className="text-[10px] font-bold text-amber-300 block">{h.place}</span>
                      <p className="text-[11px] text-slate-300 leading-snug">{h.task}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
