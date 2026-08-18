import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  BookOpen, 
  Sparkles, 
  CheckSquare, 
  Compass, 
  ArrowRight,
  Navigation,
  ArrowLeft,
  Info,
  Clock,
  Heart,
  RotateCcw,
  Zap,
  Globe,
  Tent,
  Waves,
  Moon,
  Gamepad2,
  Train,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Volume2,
  Users,
  Search,
  ExternalLink,
  Award
} from 'lucide-react';
import HajjGame3D from './HajjGame3D.tsx';
import HajjMap from './HajjMap.tsx';
import NearbyMosquesMap from './NearbyMosquesMap.tsx';

interface HajjUmrahHubProps {
  onNavigate: (view: string, subView?: string) => void;
  addHasanat: (amount: number) => void;
  incrementDua: () => void;
}

const MODERN_LOGISTICS = [
  {
    title: "Nusuk App & Rawdah Permits",
    icon: Smartphone,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    desc: "Saudi Arabia's official unified platform. Required for booking your sacred slot into the Rawdah Ash-Sharifah in Madinah and verifying Umrah permits.",
    tips: [
      "Book your Rawdah permit immediately upon visa approval as slots fill weeks in advance.",
      "Separate visiting hours apply for men (early morning & late night) and women (morning & post-Isha).",
      "Keep digital Nusuk QR code readily accessible on your phone at gate checkpoints."
    ]
  },
  {
    title: "Haramain High-Speed Railway",
    icon: Train,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    desc: "State-of-the-art 300 km/h bullet train connecting Makkah, Jeddah Airport (JED), King Abdullah Economic City (KAEC), and Madinah.",
    tips: [
      "Travel time between Makkah and Madinah is only 2 hours and 20 minutes.",
      "Direct station located inside Terminal 1 of King Abdulaziz International Airport (Jeddah).",
      "Standard luggage allowance: 1 large suitcase (up to 25kg) and 1 handbag (up to 7kg)."
    ]
  },
  {
    title: "Makkah Route & Pre-Clearance",
    icon: ShieldCheck,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    desc: "Immigration pre-clearance initiative at departure airports allowing pilgrims to bypass customs in Saudi Arabia and have luggage sent straight to hotels.",
    tips: [
      "Available in selected partner countries (e.g., Malaysia, Indonesia, Pakistan, Morocco, Turkey, Bangladesh).",
      "Ensure all biometric visa forms are finalized before heading to departure airport terminal."
    ]
  },
  {
    title: "Zamzam Water Transport Rules",
    icon: Waves,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    desc: "Official automated 5-liter boxed Zamzam packages for departing international pilgrims.",
    tips: [
      "Available for purchase at designated airport kiosks in Jeddah and Madinah (~12.5 SAR).",
      "Most international airlines permit 1 complimentary 5L Zamzam box checked per ticketed passenger.",
      "Do not pack unsealed liquid bottles inside checked baggage to prevent confiscation."
    ]
  },
  {
    title: "Mobility & Golf Cart Services",
    icon: Navigation,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    desc: "Electric golf carts and manual wheelchair tracks available inside Masjid Al-Haram for seniors, disabled pilgrims, and families.",
    tips: [
      "Electric golf carts operate on the Mezzanine floor for Tawaf and on the upper deck for Sa'i.",
      "Official electric carts can be rented via the Tanaqol service app or directly at the Haram bridges.",
      "Free wheelchairs available at designated distribution points near King Abdulaziz Gate."
    ]
  }
];

const UMRAH_STEPS = [
  {
    step: 1,
    title: "Miqat & Ihram Consecration",
    arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً",
    transliteration: "Labbayk Allahumma 'Umrah",
    translation: "Here I am, O Allah, making the intention for Umrah.",
    desc: "Cleanse body (Ghusl), apply perfume (to body before wearing cloth only), and don the two white seamless unstitched cloths (Izar & Rida) for men, or modest normal clothing for women before crossing the designated Miqat perimeter. Make the Niyyah and begin reciting the Talbiyah continuously.",
    rules: ["No cutting nails or hair", "No perfume on Ihram cloth", "No hunting or cutting trees", "Men must not cover head with fitted cloth", "No marital relations"],
    location: "Designated Miqat (e.g. Dhul Hulaifah, Yalamlam, Qarn al-Manazil, Masjid Aisha for locals)"
  },
  {
    step: 2,
    title: "Entering Masjid Al-Haram",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahumma-ftah li abwaba rahmatik",
    translation: "O Allah, open for me the doors of Your mercy.",
    desc: "Enter the Grand Mosque leading with your right foot. When your gaze first falls upon the Holy Kaaba, make heartfelt supplications as this is a blessed moment of answered Du'a. Cease reciting the Talbiyah upon commencing Tawaf.",
    rules: ["Maintain state of Wudu", "Lower gaze and remain serene", "Proceed to the Black Stone corner to align for Tawaf"],
    location: "Masjid Al-Haram, Makkah"
  },
  {
    step: 3,
    title: "Tawaf Al-Umrah (7 Circuits)",
    arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ",
    transliteration: "Bismillahi Allahu Akbar",
    translation: "In the name of Allah, Allah is the Greatest.",
    desc: "Perform 7 complete counter-clockwise circuits around the Kaaba, starting and ending at the corner of the Black Stone (Hajar al-Aswad). For men: practice Idtiba (uncovering right shoulder) throughout all 7 laps, and Ramal (quickened pace) in the first 3 laps. Between the Yemeni Corner (Rukn Al-Yamani) and the Black Stone, recite: 'Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adhaban-nar'.",
    rules: ["Keep Kaaba to your left", "Walk outside Hijr Ismail (Hateem)", "Point right palm to Black Stone if unable to kiss it"],
    location: "Mataf (Kaaba Courtyard)"
  },
  {
    step: 4,
    title: "Maqam Ibrahim & Drinking Zamzam",
    arabic: "وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى",
    transliteration: "Wattakhidhu min maqami Ibrahima musalla",
    translation: "And take the Station of Abraham as a place of prayer. (2:125)",
    desc: "After completing 7 circuits, cover your right shoulder and offer 2 Rak'ahs of Sunnah prayer behind Maqam Ibrahim (or anywhere in the Haram if crowded), reciting Surah Al-Kafirun in the 1st Rak'ah and Surah Al-Ikhlas in the 2nd. Then proceed to the Zamzam water stations, drink plentifully while standing, face the Qibla, and make sincere Du'a.",
    rules: ["Pray without obstructing walking pilgrims", "Pour water over head for Barakah"],
    location: "Near Maqam Ibrahim & Zamzam Taps"
  },
  {
    step: 5,
    title: "Sa'i Between Safa & Marwa",
    arabic: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ",
    transliteration: "Innas-Safa wal-Marwata min sha'a'irillah",
    translation: "Indeed, Safa and Marwa are among the symbols of Allah. (2:158)",
    desc: "Proceed to Mount Safa to begin Sa'i. Face the Kaaba, raise your hands, praise Allah, and walk towards Marwa (1 lap). Complete 7 laps total (ending at Marwa). Men run/jog lightly between the green fluorescent markers. Supplicate abundantly throughout each lap.",
    rules: ["Start at Safa (Lap 1), end at Marwa (Lap 7)", "Wudu is recommended but not strictly mandatory for Sa'i", "Air-conditioned multi-level tracks available"],
    location: "Mas'a (Safa & Marwa Gallery)"
  },
  {
    step: 6,
    title: "Halq (Shaving) or Taqsir (Trimming)",
    arabic: "الْحَمْدُ لِلَّهِ عَلَى تَمَامِ الْعُمْرَةِ",
    transliteration: "Alhamdulillahi 'ala tamamil 'Umrah",
    translation: "All praise belongs to Allah for the completion of Umrah.",
    desc: "Men shave the entire head (Halq - triple reward) or trim hair evenly all around by at least 1-2 cm (Taqsir). Women trim approximately 1-2 cm (length of a fingertip) from the end of their braid or ponytail. With this ritual completed, all Ihram restrictions are lifted and your Umrah is fulfilled!",
    rules: ["Official barbers located at Marwa exit bridges and Clock Tower basements", "Sanitary single-use blades are legally enforced in Saudi Arabia"],
    location: "Marwa Exits / Certified Barbers"
  }
];

const HAJJ_DAYS = [
  {
    day: "Day 1 (8th Dhul Hijjah)",
    name: "Yawm at-Tarwiyah (Day of Deliberation)",
    summary: "Pilgrims enter Ihram for Hajj and travel to Mina, the City of Tents.",
    actions: [
      "Wear Ihram from hotel and pronounce Niyyah for Hajj: 'Labbayk Allahumma Hajjan'.",
      "Proceed to Mina before Dhuhr prayer.",
      "Pray Dhuhr, Asr, Maghrib, Isha, and Fajr of the 9th shortened but not combined in Mina tents.",
      "Spend the night in Mina engaged in Dhikr, Quran, and rest."
    ]
  },
  {
    day: "Day 2 (9th Dhul Hijjah)",
    name: "Yawm Arafah (The Pinnacle of Hajj)",
    summary: "The defining day: Standing on the plains of Arafah followed by night in Muzdalifah.",
    actions: [
      "Depart Mina for Arafat after sunrise.",
      "Listen to the Arafah Khutbah at Masjid Namirah (or in your tent via broadcast).",
      "Pray Dhuhr and Asr combined and shortened at Dhuhr time.",
      "Wuqoof (Standing): Spend the entire afternoon until sunset making deep, tearful Du'a and repentance.",
      "At sunset (without praying Maghrib), depart quietly to Muzdalifah.",
      "In Muzdalifah: Pray Maghrib and Isha combined with one Adhan and two Iqamahs. Sleep under open sky and gather 49-70 small pebbles (size of chickpeas)."
    ]
  },
  {
    day: "Day 3 (10th Dhul Hijjah)",
    name: "Yawm an-Nahr (Eid al-Adha)",
    summary: "The busiest day: Ramy, Sacrifice, Shaving, and Tawaf Ifadah.",
    actions: [
      "Pray Fajr in Muzdalifah at its earliest time, make Du'a at Al-Mash'ar Al-Haram, and proceed to Mina before sunrise.",
      "Ramy Jamarat Al-Aqaba: Throw 7 pebbles at the Big Pillar saying 'Allahu Akbar' with each throw.",
      "Qurbani (Hady): Sacrifice an animal (usually done via official automated coupons/Adahi app).",
      "Halq or Taqsir: Shave or trim hair. Now you enter 'First Tahallul' (all Ihram restrictions lifted except marital intimacy).",
      "Proceed to Makkah to perform Tawaf Al-Ifadah and Sa'i of Hajj. Return to Mina to spend the night."
    ]
  },
  {
    day: "Days 4 & 5 (11th & 12th Dhul Hijjah)",
    name: "Ayyam at-Tashreeq (Days of Drying Meat)",
    summary: "Stoning all three Jamarat and staying in Mina.",
    actions: [
      "Stay in Mina tents enjoying fellowship, prayer, and gratitude.",
      "After Dhuhr time each day, stone all 3 Jamarat: 7 pebbles at Jamarat as-Sughra (Small), 7 at Jamarat al-Wusta (Middle), and 7 at Jamarat al-Kubra (Big).",
      "Supplicate facing Qibla after stoning the Small and Middle pillars.",
      "If departing on 12th, leave Mina before Maghrib (Ta'ajjul). Otherwise stay for the 13th."
    ]
  },
  {
    day: "Farewell",
    name: "Tawaf Al-Wada (Farewell Circumambulation)",
    summary: "The final rite before departing Makkah.",
    actions: [
      "Perform 7 circuits of Tawaf around the Kaaba immediately before leaving Makkah.",
      "No Sa'i or shaving required after Tawaf Al-Wada.",
      "Depart with a pure, forgiven heart insha'Allah."
    ]
  }
];

const PLACES_DIRECTORY = [
  {
    city: "Makkah",
    name: "Masjid Al-Haram & Holy Kaaba",
    arabic: "المسجد الحرام والكعبة المشرفة",
    category: "Sanctuary",
    coords: "21.4225° N, 39.8262° E",
    howToVisit: "Accessible 24/7. Pedestrian access from Ajyad, Ibrahim Al Khalil, and Jabal Omar streets. Free shuttle buses connect from Kudai and Rusaifa parking depots.",
    significance: "The holiest mosque on Earth. A single prayer here is rewarded as 100,000 prayers elsewhere.",
    highlights: ["Black Stone (Hajar al-Aswad)", "Maqam Ibrahim", "Hijr Ismail (Hateem)", "Well of Zamzam", "Safa & Marwa gallery"]
  },
  {
    city: "Makkah",
    name: "Jabal Al-Noor (Cave of Hira)",
    arabic: "جبل النور وغار حراء",
    category: "Historical Landmark",
    coords: "21.4583° N, 39.8583° E",
    howToVisit: "Take a taxi/Careem to Hira Cultural District. The modern paved mountain path features handrails, rest shelters, and a visitor center museum at the base.",
    significance: "Where Prophet Muhammad ﷺ received the very first revelation of the Holy Quran (Surah Al-Alaq) from Angel Jibreel.",
    highlights: ["Hira Cultural District Museum", "Ascent staircase (approx. 45-60 min hike)", "Breathtaking panoramic view of Makkah"]
  },
  {
    city: "Makkah",
    name: "Jabal Thawr (Cave of Thawr)",
    arabic: "جبل ثور",
    category: "Historical Landmark",
    coords: "21.3783° N, 39.8517° E",
    howToVisit: "Located in the southern district of Makkah. Accessible via taxi. Climb takes ~1.5 to 2 hours; best visited at sunrise.",
    significance: "Where the Prophet ﷺ and Abu Bakr (RA) took refuge for 3 nights during the blessed Hijrah migration to Madinah.",
    highlights: ["The historic protective cave", "Quranic reference in Surah At-Tawbah (9:40)"]
  },
  {
    city: "Makkah",
    name: "Mount Arafat & Jabal ar-Rahmah",
    arabic: "جبل الرحمة في عرفات",
    category: "Pilgrimage Plain",
    coords: "21.3547° N, 39.9842° E",
    howToVisit: "Located ~20km east of Makkah. Accessible via Makkah Metro Line during Hajj or taxi / private tour bus year-round.",
    significance: "The Mount of Mercy where Prophet Muhammad ﷺ delivered the historic Farewell Sermon (Khutbat al-Wada).",
    highlights: ["Jabal ar-Rahmah white pillar", "Masjid Namirah", "Vast spiritual plains"]
  },
  {
    city: "Madinah",
    name: "Al-Masjid An-Nabawi (Prophet's Mosque)",
    arabic: "المسجد النبوي الشريف",
    category: "Sanctuary",
    coords: "24.4672° N, 39.6111° E",
    howToVisit: "Located at the heart of Madinah. Steps from the central hotel district. Open 24/7. Huge automated shading umbrellas across the piazza.",
    significance: "Second holiest mosque in Islam. One prayer is equivalent to 1,000 prayers elsewhere.",
    highlights: ["Rawdah Ash-Sharifah (Garden of Paradise)", "The Green Dome", "Prophet's Tomb & Companions (Abu Bakr & Umar)", "Bab as-Salam"]
  },
  {
    city: "Madinah",
    name: "Masjid Quba",
    arabic: "مسجد قباء",
    category: "Historic Mosque",
    coords: "24.4394° N, 39.6172° E",
    howToVisit: "Walk along the scenic pedestrianized Quba Boulevard from the Prophet's Mosque (3 km paved boulevard) or take golf carts / buses.",
    significance: "The very first mosque built in Islamic history. The Prophet ﷺ said: 'Whoever purifies himself in his house and comes to Masjid Quba and prays two Rak'ahs will have a reward like an Umrah.'",
    highlights: ["Quba Avenue Walking Path", "Expanded courtyard & library", "Saturday morning visit Sunnah"]
  },
  {
    city: "Madinah",
    name: "Mount Uhud & Martyrs Cemetery",
    arabic: "جبل أحد ومقبرة الشهداء",
    category: "Historic Battle Site",
    coords: "24.5033° N, 39.6119° E",
    howToVisit: "Located 5 km north of Madinah center. Accessible by city bus, taxi, or hop-on hop-off tourist coaches.",
    significance: "Site of the Battle of Uhud (3 AH). The Prophet ﷺ said: 'Uhud is a mountain that loves us and we love it.' Contains the resting place of 70 beloved martyrs including Hamza bin Abdul-Muttalib (RA).",
    highlights: ["Mount of Archers (Jabal ar-Rumah)", "Uhud Martyrs Enclosure", "Uhud Battle Exhibition Center"]
  },
  {
    city: "Madinah",
    name: "Masjid Al-Qiblatayn (Two Qiblas)",
    arabic: "مسجد القبلتين",
    category: "Historic Mosque",
    coords: "24.4842° N, 39.5786° E",
    howToVisit: "Accessible via taxi or public transport on Khalid bin Al-Walid road.",
    significance: "Where the revelation was sent down commanding the change of Qibla from Jerusalem (Al-Quds) towards the Kaaba in Makkah during prayer.",
    highlights: ["Historic architectural markers", "Peaceful terraced gardens"]
  },
  {
    city: "Madinah",
    name: "Jannat Al-Baqi Cemetery",
    arabic: "بقيع الغرقد",
    category: "Sacred Burial Grounds",
    coords: "24.4681° N, 39.6167° E",
    howToVisit: "Immediately adjacent to the eastern plaza of Masjid An-Nabawi. Open daily after Fajr and Asr prayers for men.",
    significance: "Resting place of approximately 10,000 noble Companions, wives of the Prophet (Ummahat al-Mu'minin), and martyrs.",
    highlights: ["Serene reflection grounds", "Supplication of the Prophet ﷺ upon entering cemetery"]
  }
];

const SACRED_PRAYERS = [
  {
    id: "niyyah_umrah",
    title: "Niyyah & Talbiyah for Umrah",
    arabic: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً ، لَبَّيْكَ اللَّهُمَّ لَبَّيْك ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْك ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ ، لَا شَرِيكَ لَكَ",
    transliteration: "Labbayk Allahumma 'Umrah. Labbayk Allahumma labbayk, labbayka la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak.",
    translation: "Here I am O Allah, making the intention for Umrah. Here I am at Your service, You have no partner, here I am at Your service. Truly all praise, blessing, and dominion belong to You, You have no partner."
  },
  {
    id: "seeing_kaaba",
    title: "Supplication upon First Gaze at Kaaba",
    arabic: "اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً ، وَزِدْ مَنْ شَرَّفَهُ وَعَظَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا",
    transliteration: "Allahumma zid hadhal-bayta tashrifan wa ta'ziman wa takriman wa mahabah, wa zid man sharrafahu wa 'azzamahu mimman hajjahu awi'tamarahu tashrifan wa takriman wa ta'ziman wa birra.",
    translation: "O Allah, increase this House in honor, magnification, dignity, and awe; and increase those who honor and magnify it among those who perform Hajj or Umrah in honor, dignity, magnification, and righteousness."
  },
  {
    id: "tawaf_corner",
    title: "Between Yamani Corner & Black Stone",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar.",
    translation: "Our Lord, give us good in this world and good in the Hereafter, and save us from the torment of the Fire. (2:201)"
  },
  {
    id: "safa_dua",
    title: "Supplication at Mount Safa & Marwa",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ ، أَنْجَزَ وَعْدَهُ ، وَنَصَرَ عَبْدَهُ ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir. La ilaha illallahu wahdah, anjaza wa'dah, wa nasara 'abdah, wa hazamal-ahzaba wahdah.",
    translation: "There is no deity worthy of worship except Allah alone, without partner. His is the sovereignty and His is all praise, and He is over all things competent. There is no god but Allah alone. He fulfilled His promise, granted victory to His servant, and defeated the allied factions alone."
  },
  {
    id: "arafah_dua",
    title: "Supreme Supplication of Arafah",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamd, wa huwa 'ala kulli shay'in qadir.",
    translation: "The best supplication is the supplication of the Day of Arafah, and the best that I and the prophets before me have said is: There is no deity but Allah alone, having no partner. His is the dominion and His is all praise, and He is over all things powerful."
  }
];

export default function HajjUmrahHub({ onNavigate, addHasanat, incrementDua }: HajjUmrahHubProps) {
  const [activeTab, setActiveTab] = useState<'map' | 'nearby_mosques' | 'umrah' | 'hajj' | 'logistics' | 'places' | 'prayers' | 'checklist'>('map');
  const [showGame, setShowGame] = useState(false);
  const [searchSiteQuery, setSearchSiteQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<'all' | 'Makkah' | 'Madinah'>('all');
  const [completedDuas, setCompletedDuas] = useState<Record<string, boolean>>({});

  const handleClaimDua = (id: string) => {
    if (!completedDuas[id]) {
      setCompletedDuas(prev => ({ ...prev, [id]: true }));
      addHasanat(50);
      incrementDua();
      window.dispatchEvent(new CustomEvent('hasanat_earned_popup', {
        detail: { amount: 50, reason: "Sacred Pilgrimage Du'a Completed! +50 Hasanat" }
      }));
    }
  };

  const filteredPlaces = PLACES_DIRECTORY.filter(place => {
    const matchesCity = cityFilter === 'all' || place.city === cityFilter;
    const matchesSearch = place.name.toLowerCase().includes(searchSiteQuery.toLowerCase()) ||
                          place.significance.toLowerCase().includes(searchSiteQuery.toLowerCase()) ||
                          place.category.toLowerCase().includes(searchSiteQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-12 px-4 pb-32">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-[3.5rem] border border-brand-primary/30 bg-gradient-to-br from-brand-primary/15 via-brand-sidebar to-brand-depth p-8 md:p-14 shadow-3xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 text-brand-primary flex items-center justify-center border border-brand-primary/30 shadow-lg shadow-brand-primary/10">
                <Globe size={22} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">
                Modern Pilgrimage Companion & Guide
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Hajj & Umrah <br/><span className="text-brand-primary">Sanctuary Portal</span>
            </h1>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              Complete modern-day guidebook: Step-by-step Umrah protocols, day-by-day Hajj breakdown, Nusuk app workflows, High-Speed Train transit, interactive 3D simulation, and sacred sites GPS directory.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowGame(true)}
              className="px-8 py-4 bg-brand-primary text-brand-depth rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Gamepad2 size={18} /> Launch 3D Simulation
            </button>
            <button
              onClick={() => setActiveTab('places')}
              className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/15 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <MapPin size={18} /> Explore Sacred Sites
            </button>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Umrah Rituals</p>
            <p className="text-xl font-black text-white font-mono mt-0.5">4 Core Pillars</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hajj Duration</p>
            <p className="text-xl font-black text-amber-400 font-mono mt-0.5">5-6 Sacred Days</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Haramain Train</p>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">2h 20m Transit</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GPS Sites</p>
            <p className="text-xl font-black text-purple-400 font-mono mt-0.5">10+ Landmarks</p>
          </div>
        </div>
      </div>

      {showGame && (
        <HajjGame3D onClose={() => setShowGame(false)} addHasanat={addHasanat} />
      )}

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-brand-sidebar/80 backdrop-blur-xl rounded-2xl border border-white/10">
        {[
          { id: 'map', label: 'Sacred Map & Routes', icon: MapIcon },
          { id: 'nearby_mosques', label: 'Nearby Mosques (GPS)', icon: Compass },
          { id: 'umrah', label: 'Umrah Step-by-Step', icon: BookOpen },
          { id: 'hajj', label: 'Hajj Day-by-Day', icon: Tent },
          { id: 'logistics', label: 'Modern Logistics & Nusuk', icon: Smartphone },
          { id: 'places', label: 'Sacred Places Directory', icon: MapPin },
          { id: 'prayers', label: 'Pilgrim Duas (+50 Hasanat)', icon: Sparkles },
          { id: 'checklist', label: 'Smart Packing Checklist', icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: SACRED LEAFLET MAP */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          <HajjMap />
        </div>
      )}

      {/* TAB: NEARBY MOSQUES MAP */}
      {activeTab === 'nearby_mosques' && (
        <div className="space-y-6">
          <NearbyMosquesMap />
        </div>
      )}

      {/* TAB 1: UMRAH STEP-BY-STEP */}
      {activeTab === 'umrah' && (
        <div className="space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tight">
              The Complete Umrah Pathway
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Perform your minor pilgrimage according to the authentic Sunnah of the Prophet Muhammad ﷺ.
            </p>
          </div>

          <div className="space-y-6">
            {UMRAH_STEPS.map((step) => (
              <div 
                key={step.step}
                className="p-8 md:p-10 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6 relative overflow-hidden group hover:border-brand-primary/40 transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary text-brand-depth font-black text-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20 shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{step.location}</span>
                      <h3 className="text-2xl font-black text-white tracking-tight">{step.title}</h3>
                    </div>
                  </div>
                </div>

                {/* Arabic Prayer / Formula */}
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <p className="arabic-text text-2xl md:text-3xl text-brand-primary text-right leading-relaxed font-bold">
                    {step.arabic}
                  </p>
                  <p className="text-xs font-mono font-bold text-amber-300">
                    "{step.transliteration}"
                  </p>
                  <p className="text-xs text-slate-300 italic">
                    "{step.translation}"
                  </p>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {step.desc}
                </p>

                {/* Essential Rules / Tips */}
                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Key Guidelines & Protocols:</p>
                  <div className="flex flex-wrap gap-2">
                    {step.rules.map((r, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-medium flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HAJJ DAY-BY-DAY */}
      {activeTab === 'hajj' && (
        <div className="space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tight">
              The Journey of a Lifetime: Hajj
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              A comprehensive day-by-day companion from 8th to 13th Dhul Hijjah.
            </p>
          </div>

          <div className="space-y-6">
            {HAJJ_DAYS.map((hajjDay, index) => (
              <div 
                key={index}
                className="p-8 md:p-10 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6 relative overflow-hidden group hover:border-amber-500/40 transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">{hajjDay.day}</span>
                    <h3 className="text-2xl font-black text-white tracking-tight">{hajjDay.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    {hajjDay.summary}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step-by-Step Schedule of Deeds:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hajjDay.actions.map((act, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{act}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MODERN LOGISTICS & NUSUK */}
      {activeTab === 'logistics' && (
        <div className="space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tight">
              Modern-Day Pilgrimage Logistics
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Everything you need to navigate Nusuk, High-Speed Trains, eVisas, transport, and smart services in Saudi Arabia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODERN_LOGISTICS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6 flex flex-col justify-between group hover:border-white/20 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-inner`}>
                        <Icon size={28} />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight">{item.title}</h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-primary">Essential Pilgrim Tips:</p>
                    <ul className="space-y-1.5">
                      {item.tips.map((t, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-brand-primary">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SACRED SITES DIRECTORY WITH GPS */}
      {activeTab === 'places' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search landmarks, history, GPS..."
                value={searchSiteQuery}
                onChange={(e) => setSearchSiteQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'Makkah', 'Madinah'] as const).map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    cityFilter === city
                      ? 'bg-brand-primary text-brand-depth'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  {city === 'all' ? 'All Holy Sites' : city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPlaces.map((place, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6 flex flex-col justify-between group hover:border-brand-primary/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${
                          place.city === 'Makkah' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {place.city}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{place.category}</span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">{place.name}</h3>
                      <p className="arabic-text text-sm text-brand-primary mt-0.5">{place.arabic}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 text-slate-400 border border-white/10 font-mono text-[10px] flex items-center gap-1.5">
                      <MapPin size={12} className="text-brand-primary" />
                      <span>{place.coords}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {place.significance}
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">How to Visit:</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{place.howToVisit}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Key Highlights:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {place.highlights.map((h, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PILGRIM SUPPLICATIONS WITH HASANAT REWARDS */}
      {activeTab === 'prayers' && (
        <div className="space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tight">
              Essential Pilgrimage Supplications
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Recite each prophetic Du'a with devotion. Claim +50 Hasanat for completing each supplication!
            </p>
          </div>

          <div className="space-y-6">
            {SACRED_PRAYERS.map((dua) => {
              const isClaimed = completedDuas[dua.id];
              return (
                <div 
                  key={dua.id}
                  className="p-8 md:p-10 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6 group hover:border-brand-primary/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{dua.title}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/20">
                      Authentic Sunnah
                    </span>
                  </div>

                  <p className="arabic-text text-3xl md:text-4xl text-right leading-relaxed text-brand-primary font-bold">
                    {dua.arabic}
                  </p>

                  <p className="text-xs font-mono font-bold text-amber-300">
                    "{dua.transliteration}"
                  </p>

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{dua.translation}"
                  </p>

                  <button
                    onClick={() => handleClaimDua(dua.id)}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isClaimed 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-brand-primary text-brand-depth shadow-xl shadow-brand-primary/20 hover:scale-[1.01] active:scale-95'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 size={16} /> Completed (+50 Hasanat Claimed)
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Complete & Claim +50 Hasanat
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: SMART PACKING CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-8">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tight">
              Pilgrim Smart Checklist
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Everything to prepare physically, spiritually, and digitally for your blessed journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                category: "Physical & Gear",
                color: "text-amber-400",
                items: [
                  "2 Sets of white Ihram towels (for men)",
                  "Ihram waist belt or pouch for valuables",
                  "Comfortable walking shoes & flip-flops",
                  "Unscented soap, shampoo, and sunscreen",
                  "Small umbrella for sun protection",
                  "Drawstring shoe bag for entering mosques",
                  "Pocket prayer mat & power bank"
                ]
              },
              {
                category: "Spiritual & Mental",
                color: "text-brand-primary",
                items: [
                  "Memorize Talbiyah and core Tawaf Duas",
                  "Prepare personal Dua list for loved ones",
                  "Seek forgiveness and settle outstanding debts",
                  "Learn the rulings and prohibitions of Ihram",
                  "Study the life of Prophet Muhammad ﷺ in Madinah",
                  "Set intention purely for the pleasure of Allah"
                ]
              },
              {
                category: "Digital & Travel",
                color: "text-purple-400",
                items: [
                  "Passport valid for at least 6 months",
                  "Saudi eVisa / Umrah Visa printout",
                  "Nusuk App installed with confirmed bookings",
                  "Haramain Train e-tickets downloaded",
                  "International roaming or Saudi eSIM card",
                  "Emergency hotel contact card with Arabic address"
                ]
              }
            ].map((section, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-[2.5rem] bg-brand-sidebar/70 border border-white/10 space-y-6"
              >
                <h3 className={`text-base font-black uppercase tracking-widest ${section.color}`}>
                  {section.category}
                </h3>

                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-300 font-medium leading-relaxed">
                      <CheckCircle2 size={16} className="text-brand-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
