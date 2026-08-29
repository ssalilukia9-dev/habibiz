import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  Trash2,
  X,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Hash,
  ArrowUp,
  ArrowDown,
  BookOpen,
  MessageSquare,
  HandHeart,
  Users,
  Compass,
  Trophy,
  Filter,
  Flag,
  Copy,
  Check,
  Smile,
  SmilePlus,
  Flame,
  SunMedium,
  Globe,
  Lock,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Smartphone,
  Eye,
  Clock,
  GraduationCap,
  Upload,
  Download,
  RefreshCw,
  Layers,
  Bell,
  Pin,
  Quote,
  Award,
  ThumbsUp,
  Camera
} from 'lucide-react';
import { doc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, deleteDoc, increment, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { restDbClient } from '../lib/restDbClient.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import PremiumGateway from './PremiumGateway';
import CreatePostModal, { CreatePostPayload, PostPrivacy } from './CreatePostModal';
import ReportPostModal from './ReportPostModal.tsx';
import { IslamicWisdomService, IslamicTeachingItem, DEFAULT_ISLAMIC_TEACHINGS, compressImageFile, ISLAMIC_IMAGE_PRESETS } from '../services/islamicWisdomService.ts';
import { AdminConfigService } from '../services/adminConfigService.ts';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';
import { notificationService } from '../services/notificationService.ts';

const SIDEBAR_TOPICS = [
  { name: 'General & Life', icon: SmilePlus, count: '3.8k' },
  { name: 'How I Feel', icon: Heart, count: '2.9k' },
  { name: 'Spiritual Reminders', icon: Sparkles, count: '2.4k' },
  { name: 'Quran & Tafsir', icon: BookOpen, count: '1.2k' },
  { name: 'Hadith Studies', icon: ShieldCheck, count: '850' },
  { name: 'Halal Lifestyle', icon: Users, count: '3.1k' },
  { name: 'Gratitude & Joy', icon: SunMedium, count: '1.9k' },
  { name: 'Charity & Relief', icon: HandHeart, count: '500' }
];

const TRENDING_DUAS = [
  { title: 'Dua for Peace of Heart', text: 'Ala bi-dhikrillahi tatma\'innul-quloob' },
  { title: 'Dua for Relief & Ease', text: 'Ya Hayyu Ya Qayyum bi-rahmatika astagheeth' },
  { title: 'Dua for Knowledge & Strength', text: 'Rabbi Zidni Ilma wa arzuqni fahma' }
];

const ACTIVE_SCHOLARS = [
  { name: 'Dr. Yasir', tag: 'Aalim' },
  { name: 'Sr. Fatima', tag: 'Scholar' },
  { name: 'Ustad Abu Bakr', tag: 'Imam' }
];

export const TRENDING_HASHTAGS = [
  { tag: '#Alhamdulillah', label: 'Alhamdulillah', count: '1.4k', icon: '🤲' },
  { tag: '#QuranReflection', label: 'Quran Reflection', count: '980', icon: '📖' },
  { tag: '#DailyDua', label: 'Daily Dua', count: '850', icon: '✨' },
  { tag: '#JummahMubarak', label: 'Jummah Mubarak', count: '720', icon: '🕌' },
  { tag: '#Tawakkul', label: 'Tawakkul & Trust', count: '640', icon: '🌿' },
  { tag: '#SeekForgiveness', label: 'Istighfar', count: '590', icon: '💧' },
  { tag: '#FajrClub', label: 'Fajr Club', count: '480', icon: '🌅' },
  { tag: '#DuaForPalestine', label: 'Dua for Palestine', count: '890', icon: '🇵🇸' },
  { tag: '#HalalLiving', label: 'Halal Living', count: '410', icon: '🕊️' },
  { tag: '#SunnahHabits', label: 'Sunnah Habits', count: '360', icon: '🌱' }
];

export const QUICK_ISLAMIC_REACTIONS = [
  { label: '🤲 Ameen ya Rabb', text: 'Ameen ya Rabb al-Alameen 🤲' },
  { label: '✨ BarakAllahu Feek', text: 'BarakAllahu feekum for this sacred reminder 🌿' },
  { label: '📖 JazakAllahu Khayran', text: 'JazakAllahu Khayran for sharing this beneficial pearl ✨' },
  { label: '💫 SubhanAllah', text: 'SubhanAllah, this touched my heart deeply 🤍' },
  { label: '🌱 MashaAllah', text: 'MashaAllah, beautifully written and beneficial 🌸' },
  { label: '🕊️ May Allah ease your heart', text: 'May Allah grant you ease, peace, and immense barakah 🤲' }
];

export const ISLAMIC_CALLIGRAPHY_SYMBOLS = [
  { symbol: 'ﷺ', label: 'Salawat on Prophet' },
  { symbol: 'ﷻ', label: 'Jalla Jalaluh' },
  { symbol: 'رضي الله عنه', label: 'Radiyallahu Anhu' },
  { symbol: 'رحمه الله', label: 'Rahimahullah' },
  { symbol: '🤲', label: 'Dua' },
  { symbol: '✨', label: 'Noor' },
  { symbol: '📖', label: 'Quran' },
  { symbol: '🕌', label: 'Masjid' },
  { symbol: '🌿', label: 'Peace' },
  { symbol: '🤍', label: 'Pure Heart' },
  { symbol: '📿', label: 'Tasbih' },
  { symbol: '🕊️', label: 'Salam' }
];

export const SPIRITUAL_COMMENT_IMAGE_PRESETS = [
  { 
    id: 'preset-quran',
    label: '📖 Quran Tajweed & Notes', 
    category: 'Quran Reflection',
    tag: '#QuranStudy',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000',
    caption: 'My sacred Quran reflection & notes 📖✨'
  },
  { 
    id: 'preset-masjid',
    label: '🕌 Jumu\'ah Masjid Prayer', 
    category: 'Masjid Gathering',
    tag: '#MasjidCommunity',
    url: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
    caption: 'Blessed Jumu\'ah gathering at the mosque 🕌🕊️'
  },
  { 
    id: 'preset-adhkar',
    label: '📿 Morning/Evening Adhkar Corner', 
    category: 'Dhikr & Tasbih',
    tag: '#DhikrHabits',
    url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000',
    caption: 'Tranquil dhikr and tasbih corner 📿🌿'
  },
  { 
    id: 'preset-kaaba',
    label: '🕋 Sacred Kaaba & Tawaf', 
    category: 'Sacred Sanctuary',
    tag: '#Umrah',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1000',
    caption: 'May Allah invite us all to His sacred House 🕋🤲'
  },
  { 
    id: 'preset-fajr',
    label: '🌅 Fajr Dawn & Tahajjud', 
    category: 'Dawn Prayer',
    tag: '#FajrClub',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000',
    caption: 'The serenity of Fajr dawn prayer 🌅✨'
  },
  { 
    id: 'preset-dua',
    label: '🤲 Heartfelt Dua & Peace', 
    category: 'Dua & Tawakkul',
    tag: '#DuaAndPeace',
    url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1000',
    caption: 'Heartfelt dua in contemplation 🤲🕊️'
  },
  { 
    id: 'preset-nature',
    label: '🌿 Halal Nature Tadabbur', 
    category: 'Nature Tadabbur',
    tag: '#CreationTadabbur',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1000',
    caption: 'Contemplating the beauty of Allah\'s creation 🌿'
  },
  { 
    id: 'preset-iftar',
    label: '🍲 Community Iftar & Sadaqah', 
    category: 'Hospitality & Charity',
    tag: '#HalalBarakah',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000',
    caption: 'Sharing meals and barakah with loved ones 🍲🤍'
  }
];

export interface Comment {
  id: string;
  userId: string;
  user: string;
  userRole?: 'scholar' | 'hafiz' | 'imam' | 'contributor' | 'member';
  text: string;
  imageUrl?: string;
  imageCaption?: string;
  time: any;
  replyToUser?: string;
  replyToCommentId?: string;
  parentCommentId?: string;
  replies?: Comment[];
  likes?: number;
  hearts?: number;
  ameens?: number;
  userReactions?: Record<string, 'heart' | 'ameen' | 'like'>;
  isPinned?: boolean;
  ayahRef?: string;
}

export interface Poll {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userSelections?: Record<string, string>; // userId -> optionId
}

export interface Post {
  id: string;
  userId: string;
  user: string;
  isScholar?: boolean;
  content: string;
  caption?: string;
  time?: any;
  timeDisplay?: string;
  supportCount: number;
  reconsiderCount: number;
  userVotes?: Record<string, 'support' | 'reconsider'>;
  comments: Comment[];
  category: string;
  privacy?: PostPrivacy;
  image?: string | null;
  bgStyle?: string;
  filterPreset?: string;
  isFlagged?: boolean;
  isVerified?: boolean;
  approved?: boolean;
  poll?: Poll;
}

export const DEFAULT_NOOR_POSTS: Post[] = [
  {
    id: 'default-noor-post-1',
    userId: 'scholar-dr-yasir',
    user: 'Dr. Yasir Qadhi',
    isScholar: true,
    content: "Reflecting on Surah Ash-Sharh: 'Fa inna ma'al 'usri yusra, Inna ma'al 'usri yusra' — 'For indeed, with hardship comes ease. Indeed, with hardship comes ease.' (94:5-6) ✨\n\nNotice Allah ﷻ says *with* the hardship, not after it. In every trial you face, the ease is already being prepared by Allah. Keep your heart attached to Him.",
    caption: "The linguistic beauty of Surah Ash-Sharh #QuranReflection",
    category: 'Quran & Tafsir',
    privacy: 'public',
    bgStyle: 'emerald_glow',
    supportCount: 342,
    reconsiderCount: 4,
    time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeDisplay: '45m ago',
    comments: [
      {
        id: 'c-default-1-1',
        userId: 'hafiz-zayd',
        user: 'Hafiz Zayd',
        userRole: 'hafiz',
        text: 'SubhanAllah! The classical tafsir mentions that the hardship (al-Usr) is singular and definite, while ease (Yusr) is indefinite, meaning one hardship will never overcome double ease! 🤍',
        imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'My daily Tajweed & Surah Ash-Sharh study notes 📖✨',
        time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        ameens: 28,
        hearts: 34,
        isPinned: true,
        replies: [
          {
            id: 'c-default-1-1-r1',
            userId: 'brother-hamza',
            user: 'Brother Hamza',
            userRole: 'member',
            replyToUser: 'Hafiz Zayd',
            replyToCommentId: 'c-default-1-1',
            parentCommentId: 'c-default-1-1',
            text: 'Allahu Akbar! That grammatical explanation gives so much tranquil hope. JazakAllahu Khayran!',
            time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
            ameens: 12,
            hearts: 15
          }
        ]
      },
      {
        id: 'c-default-1-2',
        userId: 'sister-safiyyah',
        user: 'Safiyyah Al-Ansari',
        userRole: 'contributor',
        text: 'Needed this reminder so desperately today while going through a tough exam season. Alhamdulillah for the words of Allah that soothe the aching heart 🤲🌿',
        time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        ameens: 19,
        hearts: 22,
        replies: []
      }
    ]
  },
  {
    id: 'default-noor-post-2',
    userId: 'sheikh-bilal',
    user: 'Sheikh Bilal',
    isScholar: true,
    content: "The sacred stillness of the Fajr hour 🌅\n\nWhen you stand before Allah for Fajr while the rest of the creation sleeps, remember: 'Prayer is better than sleep' is not merely a statement, it is an oath of tranquility for your soul. What routine or mindset helps you wake up consistently for Fajr?",
    caption: "Fajr serenity and waking up habits #FajrClub",
    category: 'Spiritual Reminders',
    privacy: 'public',
    bgStyle: 'twilight_deep',
    supportCount: 289,
    reconsiderCount: 2,
    time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    timeDisplay: '2h ago',
    comments: [
      {
        id: 'c-default-2-1',
        userId: 'sister-fatima',
        user: 'Sr. Fatima',
        userRole: 'scholar',
        text: 'Going to sleep with Wudu, reciting Ayat al-Kursi, and sincerely asking Allah before closing your eyes: "Ya Allah, wake me for Your worship" works like an inner spiritual alarm clock 🌸',
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'My morning tasbih & prayer corner before sunrise 📿✨',
        time: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
        ameens: 42,
        hearts: 51,
        isPinned: true,
        replies: [
          {
            id: 'c-default-2-1-r1',
            userId: 'brother-tariq',
            user: 'Tariq Mansoor',
            userRole: 'member',
            replyToUser: 'Sr. Fatima',
            replyToCommentId: 'c-default-2-1',
            parentCommentId: 'c-default-2-1',
            text: 'MashaAllah, I also place my phone across the room so I am forced to physically stand up. May Allah keep our feet firm on Fajr.',
            time: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
            ameens: 16,
            hearts: 18
          }
        ]
      }
    ]
  },
  {
    id: 'default-noor-post-3',
    userId: 'user-aminah',
    user: 'Amina Karim',
    content: "Daily Gratitude Check 🌿: Name 3 blessings you experienced today that wealth could never buy. Let us fill the comments with Alhamdulillah for Ar-Rahman's endless mercy! ✨",
    caption: "Counting our unseen blessings #Alhamdulillah",
    category: 'Gratitude & Joy',
    privacy: 'public',
    bgStyle: 'gold_radiance',
    supportCount: 415,
    reconsiderCount: 1,
    time: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    timeDisplay: '4h ago',
    comments: [
      {
        id: 'c-default-3-1',
        userId: 'user-zayd',
        user: 'Zayn Malik',
        userRole: 'member',
        text: '1. The blessing of Islam & Sujood, 2. The comforting sound of my parents laughing in the living room, 3. Clean water and good health. Alhamdulillah Rabbil Alameen! 🤍',
        time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        ameens: 31,
        hearts: 38,
        replies: []
      },
      {
        id: 'c-default-3-2',
        userId: 'user-maryam',
        user: 'Maryam Al-Qudsi',
        userRole: 'contributor',
        text: 'A heart that still remembers Allah, eyes that can gaze upon the Holy Quran, and peaceful breaths without struggle. Allahumma lakal hamd!',
        time: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
        ameens: 27,
        hearts: 30,
        replies: []
      }
    ]
  },
  {
    id: 'default-noor-post-4',
    userId: 'user-seeker',
    user: 'Spiritual Seeker',
    content: "Feeling a bit anxious and overwhelmed by big life decisions today. Reminding my soul: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ' (HasbunAllahu wa ni'mal wakeel — Allah is sufficient for us, and He is the best disposer of affairs). Please remember me in your Duas tonight 🤲🕊️",
    caption: "Finding peace in Tawakkul #Tawakkul #HowIFeel",
    category: 'How I Feel',
    privacy: 'public',
    bgStyle: 'default',
    supportCount: 380,
    reconsiderCount: 3,
    time: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    timeDisplay: '6h ago',
    comments: [
      {
        id: 'c-default-4-1',
        userId: 'imam-abubakr',
        user: 'Ustad Abu Bakr',
        userRole: 'imam',
        text: 'May Allah expand your chest with tranquility, ease your path, and grant you clarity that leaves you in awe of His divine wisdom. You are in our Duas, dear brother/sister! 🤲✨',
        time: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        ameens: 58,
        hearts: 62,
        isPinned: true,
        replies: [
          {
            id: 'c-default-4-1-r1',
            userId: 'user-seeker',
            user: 'Spiritual Seeker',
            replyToUser: 'Ustad Abu Bakr',
            replyToCommentId: 'c-default-4-1',
            parentCommentId: 'c-default-4-1',
            text: 'Ameen ya Rabb al-Alameen! Your Dua brought such peace to my heart. BarakAllahu feekum.',
            time: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
            ameens: 14,
            hearts: 19
          }
        ]
      }
    ]
  },
  {
    id: 'default-noor-khatam-1',
    userId: 'user-khatam-tariq',
    user: 'Tariq Al-Muqri',
    content: "📖✨ ALHAMDULILLAH! Milestone reached in my Quran Khatam Journey — Completed Surah Al-Baqarah (Juz 1 to 3)! 🤍\n\nSpending 30 minutes every morning after Fajr reviewing the Ayat of debt, spending, fasting, and Ayat al-Kursi has brought unmatched barakah into my home. Starting Surah Ali 'Imran tomorrow InshaAllah. May Allah grant all of us steadfastness to complete the entire Book of Allah!",
    caption: "Quran Khatam Journey: Surah Al-Baqarah Completed #QuranKhatam #Tadabbur",
    category: 'Quran & Tafsir',
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000',
    bgStyle: 'emerald_glow',
    supportCount: 524,
    reconsiderCount: 0,
    time: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    timeDisplay: '8h ago',
    comments: [
      {
        id: 'c-khatam-1-1',
        userId: 'scholar-dr-yasir',
        user: 'Dr. Yasir Qadhi',
        userRole: 'scholar',
        text: 'MashaAllah TabarakAllah! The Prophet ﷺ said: "Recite Surah Al-Baqarah, for holding onto it is a blessing and leaving it is a regret." May Allah accept your Khatam and illuminate your heart with every letter recited! 🤲✨',
        imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'Tafsir Ibn Kathir notes on Surah Al-Baqarah 📖',
        time: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
        ameens: 84,
        hearts: 92,
        isPinned: true,
        replies: [
          {
            id: 'c-khatam-1-1-r1',
            userId: 'user-khatam-tariq',
            user: 'Tariq Al-Muqri',
            replyToUser: 'Dr. Yasir Qadhi',
            replyToCommentId: 'c-khatam-1-1',
            parentCommentId: 'c-khatam-1-1',
            text: 'JazakAllahu Khayran Dr. Yasir! Your Tafsir series on YouTube kept me motivated during the long verses.',
            time: new Date(Date.now() - 1000 * 60 * 350).toISOString(),
            ameens: 29,
            hearts: 31
          }
        ]
      },
      {
        id: 'c-khatam-1-2',
        userId: 'sister-layla',
        user: 'Layla Nur',
        userRole: 'contributor',
        text: 'Allahu Akbar! This inspired me so much to pick up my Mushaf and start my own Khatam journey today. Please make Dua for me! 🌸',
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'My daily bookmark set for Juz 1 📿',
        time: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
        ameens: 36,
        hearts: 40,
        replies: []
      }
    ]
  },
  {
    id: 'default-noor-khatam-2',
    userId: 'user-khatam-samira',
    user: 'Samira Bint Ahmad',
    content: "🌸✨ HALFWAY MILESTONE: Surah Al-Kahf & Juz 15 reached in my Ramadan / Yearly Khatam Journey! 📖\n\nEvery Friday reflection on the Four Trials of Surah Al-Kahf (Faith, Wealth, Knowledge, Power) takes on a deeper meaning when read with intentional contemplation. Making Dua that Allah allows every seeker in NoorTalk to reach their Khatam goals with sincerity (Ikhlas)!",
    caption: "Quran Khatam Journey: Reaching the Halfway Mark Juz 15 #QuranReflection",
    category: 'Quran & Tafsir',
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
    bgStyle: 'gold_radiance',
    supportCount: 468,
    reconsiderCount: 1,
    time: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    timeDisplay: '10h ago',
    comments: [
      {
        id: 'c-khatam-2-1',
        userId: 'hafiz-zayd',
        user: 'Hafiz Zayd',
        userRole: 'hafiz',
        text: 'MashaAllah! You have crossed the center point of the Holy Quran! Keep up the momentum with 4 pages after every Fard prayer, and the second half will flow with ease by Allah’s grace 🤲🤍',
        imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'Quran Khatam tracking table 📿✨',
        time: new Date(Date.now() - 1000 * 60 * 520).toISOString(),
        ameens: 52,
        hearts: 61,
        isPinned: true,
        replies: []
      }
    ]
  },
  {
    id: 'default-noor-khatam-3',
    userId: 'user-khatam-ibrahim',
    user: 'Ibrahim Al-Fassi',
    content: "🕌🤲 CELEBRATING FULL KHATAM AL-QURAN! (Surah An-Nas Completed!) 🕊️✨\n\nAfter 45 days of steady Fajr & Tahajjud recitation, I completed the recitation of the entire Holy Quran today at the local Masjid. The Dua Khatam al-Quran brought tears to my eyes.\n\nI dedicate the reward of this Khatam to my late grandparents, my parents, and for the peace and relief of our oppressed brothers and sisters in Palestine and worldwide. Allahumma Ameen! 🤲🇵🇸",
    caption: "Completed Full Quran Khatam Journey #KhatamAlQuran #Alhamdulillah",
    category: 'Spiritual Reminders',
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1000',
    bgStyle: 'twilight_deep',
    supportCount: 689,
    reconsiderCount: 0,
    time: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    timeDisplay: '12h ago',
    comments: [
      {
        id: 'c-khatam-3-1',
        userId: 'sheikh-bilal',
        user: 'Sheikh Bilal',
        userRole: 'scholar',
        text: 'ALLAHU AKBAR! Congratulations on this grand crown in the Akhirah! The Prophet ﷺ said: "The best among you are those who learn the Quran and teach it." May the Quran be your companion in the grave and your intercessor on the Day of Judgment! 🤲👑✨',
        imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'Special Dua for the Huffadh and Khatam readers 🤲',
        time: new Date(Date.now() - 1000 * 60 * 660).toISOString(),
        ameens: 112,
        hearts: 128,
        isPinned: true,
        replies: []
      },
      {
        id: 'c-khatam-3-2',
        userId: 'user-maryam',
        user: 'Maryam Al-Qudsi',
        userRole: 'contributor',
        text: 'Ameen ya Rabb al-Alameen! Your dedication gives the entire Ummah so much hope and spiritual energy. May Allah reward you and your family! 🤍🌸',
        time: new Date(Date.now() - 1000 * 60 * 610).toISOString(),
        ameens: 47,
        hearts: 54,
        replies: []
      }
    ]
  },
  {
    id: 'default-noor-khatam-4',
    userId: 'user-tahajjud-streak',
    user: 'Farah Siddiqui',
    content: "🌅 30-DAY FAJR & TAHAJJUD STREAK JOURNEY: Reflections on waking before dawn ✨\n\n30 days ago, I struggled to wake up for Fajr. Today, with the Sanctuary app Fajr reminders and making a habit of sleeping on Wudu, I completed 30 consecutive days of Tahajjud + Fajr in congregation.\n\nMy heart feels lighter, anxiety is replaced with stillness, and my daily work has ten times more barakah. If you are struggling, start with just 2 Rak'ahs 15 minutes before Fajr!",
    caption: "30 Days of Tahajjud Serenity #FajrClub #SpiritualJourney",
    category: 'Spiritual Reminders',
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000',
    bgStyle: 'emerald_glow',
    supportCount: 495,
    reconsiderCount: 1,
    time: new Date(Date.now() - 1000 * 60 * 840).toISOString(),
    timeDisplay: '14h ago',
    comments: [
      {
        id: 'c-khatam-4-1',
        userId: 'sister-fatima',
        user: 'Sr. Fatima',
        userRole: 'scholar',
        text: 'SubhanAllah! Tahajjud is the arrow that never misses its target. May Allah keep you steadfast upon this sacred garden of night prayer! 🌿🤲',
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'The serenity of midnight worship 📿',
        time: new Date(Date.now() - 1000 * 60 * 780).toISOString(),
        ameens: 68,
        hearts: 75,
        isPinned: true,
        replies: []
      }
    ]
  },
  {
    id: 'default-noor-khatam-5',
    userId: 'user-salawat-circle',
    user: 'Yusuf Al-Andalusi',
    content: "📿✨ 10,000 SALAWAT & ISTIGHFAR WEEKLY JOURNEY REACHED! 🕊️\n\n'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ'\n\nWhenever life feels constrained, sending blessings upon our Beloved Master Muhammad ﷺ dissolves all worries and invites forgiveness. Let us unite as an Ummah in sending 100 Salawat today! Drop a 'ﷺ' in the comments to join the collective blessing circle!",
    caption: "Salawat on the Prophet ﷺ Blessing Circle #SunnahHabits #Salawat",
    category: 'Gratitude & Joy',
    privacy: 'public',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000',
    bgStyle: 'gold_radiance',
    supportCount: 612,
    reconsiderCount: 0,
    time: new Date(Date.now() - 1000 * 60 * 960).toISOString(),
    timeDisplay: '16h ago',
    comments: [
      {
        id: 'c-khatam-5-1',
        userId: 'imam-abubakr',
        user: 'Ustad Abu Bakr',
        userRole: 'imam',
        text: 'ﷺ ﷺ ﷺ Allahumma Salli wa Sallim wa Barik \'ala Sayyidina Muhammad wa \'ala Aalihi wa Sahbihi Ajma\'een! May we drink from his blessed Hawd Al-Kawthar! 🤲✨',
        imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
        imageCaption: 'The blessed Green Dome in Madinah 🕌',
        time: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
        ameens: 95,
        hearts: 104,
        isPinned: true,
        replies: []
      }
    ]
  }
];

// Human-readable time ago formatter (e.g. 'just now', '2m ago', '1h ago', '3d ago')
export const formatTimeAgo = (timestamp: any): string => {
  if (!timestamp) return 'Just now';
  let timeMs = 0;
  try {
    if (typeof timestamp === 'number') {
      timeMs = timestamp;
    } else if (typeof timestamp === 'string') {
      const parsed = Date.parse(timestamp);
      timeMs = isNaN(parsed) ? Date.now() : parsed;
    } else if (timestamp?.seconds) {
      timeMs = timestamp.seconds * 1000;
    } else if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      timeMs = timestamp.toDate().getTime();
    } else if (timestamp instanceof Date) {
      timeMs = timestamp.getTime();
    } else {
      return 'Just now';
    }

    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - timeMs) / 1000));

    if (diffSeconds < 45) return 'Just now';
    if (diffSeconds < 90) return '1m ago';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  } catch {
    return 'Just now';
  }
};

// Sound tone for interaction
export function ExpandableParagraph({
  text,
  maxWords = 15,
  className = '',
  isQuote = false,
  readMoreColor = 'text-noor-emerald hover:text-emerald-300'
}: {
  text: string;
  maxWords?: number;
  className?: string;
  isQuote?: boolean;
  readMoreColor?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const isLong = words.length > maxWords;

  const displayedWords = isLong && !isExpanded
    ? words.slice(0, maxWords).join(' ') + '...'
    : text;

  return (
    <div className={className}>
      <span>{isQuote ? `"${displayedWords}"` : displayedWords}</span>
      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
          className={`ml-2 inline-flex items-center gap-0.5 font-black text-xs underline cursor-pointer transition-all ${readMoreColor}`}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

const playHapticAudio = (type: 'like' | 'publish' | 'swipe') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'like') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'publish') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'swipe') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch {}
};

export default function FeedView({ 
  addHasanat, 
  isPremium,
  onShowPremium 
}: { 
  addHasanat?: (amount: number) => void;
  isPremium: boolean;
  onShowPremium: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'friends'>('all');
  const [isScholarMode, setIsScholarMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // View mode: standard social stream or full card swipe player
  const [feedViewMode, setFeedViewMode] = useState<'stream' | 'reels'>('stream');
  const [reelsActiveIndex, setReelsActiveIndex] = useState(0);

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Report Post Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostForReport, setSelectedPostForReport] = useState<Post | null>(null);

  // Inline Quick Compose state
  const [inlineContent, setInlineContent] = useState('');
  const [inlineCategory, setInlineCategory] = useState('How I Feel');

  // Comment state
  const [activePostComment, setActivePostComment] = useState<{ postId: string, text: string } | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ postId: string; parentCommentId: string; commentId: string; userName: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [activeIslamicToolbarPostId, setActiveIslamicToolbarPostId] = useState<string | null>(null);

  // 📷 NoorTalk Comment Image Attachment & Selection Tool State
  const [commentImageAttachment, setCommentImageAttachment] = useState<{
    postId: string;
    imageUrl: string;
    caption?: string;
    category?: string;
    tag?: string;
  } | null>(null);

  const [replyImageAttachment, setReplyImageAttachment] = useState<{
    postId: string;
    commentId: string;
    imageUrl: string;
    caption?: string;
    category?: string;
    tag?: string;
  } | null>(null);

  const [activePhotoPicker, setActivePhotoPicker] = useState<{
    postId: string;
    commentId?: string;
    isReply: boolean;
  } | null>(null);

  const [photoPickerTab, setPhotoPickerTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [isProcessingCommentImage, setIsProcessingCommentImage] = useState<boolean>(false);

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'report' | 'delete_comment', id: string, commentId?: string, parentCommentId?: string, title: string, message: string } | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  // Animations & Feedback
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [heartPops, setHeartPops] = useState<Record<string, boolean>>({});
  const [dragActionNotice, setDragActionNotice] = useState<{ id: string; action: 'like' | 'bookmark' } | null>(null);
  const lastTapTimesRef = useRef<Record<string, number>>({});

  // 🖼️ Universal Media Lightbox Expansion State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxMediaItems, setLightboxMediaItems] = useState<LightboxMediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openPostMediaLightbox = (post: Post) => {
    if (!post.image) return;
    const items: LightboxMediaItem[] = filteredPosts
      .filter(p => p.image)
      .map(p => ({
        url: p.image!,
        author: p.user || 'Community Member',
        caption: p.caption || p.content || undefined,
        title: p.category ? `${p.category} Reflection` : undefined,
        timestamp: p.timeDisplay || (p.time?.toDate ? p.time.toDate().toLocaleDateString() : undefined)
      }));
    const targetIdx = items.findIndex(item => item.url === post.image);
    setLightboxMediaItems(items.length > 0 ? items : [{ url: post.image, caption: post.caption || post.content, author: post.user }]);
    setLightboxIndex(targetIdx >= 0 ? targetIdx : 0);
    setIsLightboxOpen(true);
  };

  const openTeachingMediaLightbox = (teaching: IslamicTeachingItem) => {
    setLightboxMediaItems([{
      url: teaching.imageUrl,
      title: teaching.title,
      caption: teaching.content,
      author: `${teaching.category.replace('_', ' ').toUpperCase()} • ${teaching.scholarOrSource || teaching.scholar || 'Prophetic Guidance'}`
    }]);
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  const openCommentMediaLightbox = (imageUrl: string, author: string, caption?: string, text?: string) => {
    setLightboxMediaItems([{
      url: imageUrl,
      title: 'Spiritual Activity Reflection',
      caption: caption || text || undefined,
      author: `${author} • Noor Talk Reflection`
    }]);
    setLightboxIndex(0);
    setIsLightboxOpen(true);
  };

  const handleCommentPhotoFile = async (file: File, postId: string, commentId?: string, isReply: boolean = false) => {
    if (!file) return;
    try {
      setIsProcessingCommentImage(true);
      const dataUrl = await compressImageFile(file, 1000, 0.82);
      if (isReply && commentId) {
        setReplyImageAttachment({
          postId,
          commentId,
          imageUrl: dataUrl,
          caption: 'Spiritual activity reflection 📸',
          category: 'Spiritual Activity'
        });
      } else {
        setCommentImageAttachment({
          postId,
          imageUrl: dataUrl,
          caption: 'Spiritual activity reflection 📸',
          category: 'Spiritual Activity'
        });
      }
      setActivePhotoPicker(null);
      setPublishSuccessMessage("📸 Spiritual activity photo attached (+15 Hasanat)!");
      setTimeout(() => setPublishSuccessMessage(null), 3000);
    } catch (err: any) {
      alert("Image processing failed: " + (err.message || 'Unknown error'));
    } finally {
      setIsProcessingCommentImage(false);
    }
  };

  const handleSelectPresetPhoto = (preset: typeof SPIRITUAL_COMMENT_IMAGE_PRESETS[0], postId: string, commentId?: string, isReply: boolean = false) => {
    playHapticAudio('swipe');
    if (isReply && commentId) {
      setReplyImageAttachment({
        postId,
        commentId,
        imageUrl: preset.url,
        caption: preset.caption,
        category: preset.category,
        tag: preset.tag
      });
    } else {
      setCommentImageAttachment({
        postId,
        imageUrl: preset.url,
        caption: preset.caption,
        category: preset.category,
        tag: preset.tag
      });
    }
    setActivePhotoPicker(null);
    setPublishSuccessMessage(`📸 Attached "${preset.label}" (+15 Hasanat)!`);
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  const handleAttachUrlPhoto = (postId: string, commentId?: string, isReply: boolean = false) => {
    if (!customPhotoUrl.trim()) return;
    if (isReply && commentId) {
      setReplyImageAttachment({
        postId,
        commentId,
        imageUrl: customPhotoUrl.trim(),
        caption: 'Sacred visual reflection 🌿'
      });
    } else {
      setCommentImageAttachment({
        postId,
        imageUrl: customPhotoUrl.trim(),
        caption: 'Sacred visual reflection 🌿'
      });
    }
    setCustomPhotoUrl('');
    setActivePhotoPicker(null);
    setPublishSuccessMessage("📸 Photo attached from web link (+15 Hasanat)!");
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  // 📖 Dedicated Admin-Only Islamic Wisdom Visual Teaching Studio State
  const [showAdminWisdomStudio, setShowAdminWisdomStudio] = useState(false);
  const [adminTeachings, setAdminTeachings] = useState<IslamicTeachingItem[]>(DEFAULT_ISLAMIC_TEACHINGS);
  const [wisdomFilterCategory, setWisdomFilterCategory] = useState<string>('all');
  const [wisdomSearchQuery, setWisdomSearchQuery] = useState<string>('');
  const [adminWisdomTitle, setAdminWisdomTitle] = useState<string>('');
  const [adminWisdomImageUrl, setAdminWisdomImageUrl] = useState<string>('https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000');
  const [adminWisdomCategory, setAdminWisdomCategory] = useState<'hadith_pearls' | 'quran_insights' | 'akhlaq_character' | 'daily_reminders' | 'prophetic_sunnah' | 'spirituality'>('spirituality');
  const [adminWisdomContent, setAdminWisdomContent] = useState<string>('');
  const [adminWisdomArabic, setAdminWisdomArabic] = useState<string>('');
  const [adminWisdomScholar, setAdminWisdomScholar] = useState<string>('');
  const [adminWisdomFeatured, setAdminWisdomFeatured] = useState<boolean>(false);
  const [isUploadingWisdom, setIsUploadingWisdom] = useState<boolean>(false);
  const [isCompressingWisdomImg, setIsCompressingWisdomImg] = useState<boolean>(false);
  const [previewingWisdomCard, setPreviewingWisdomCard] = useState<IslamicTeachingItem | null>(null);

  // Subscribe to live Islamic Teachings in Firestore
  useEffect(() => {
    const unsub = IslamicWisdomService.subscribeToTeachings((list) => {
      setAdminTeachings(list);
    });
    return () => unsub();
  }, []);

  const handleAdminWisdomFileChange = async (file: File) => {
    if (!file) return;
    try {
      setIsCompressingWisdomImg(true);
      const dataUrl = await compressImageFile(file, 1280, 0.85);
      setAdminWisdomImageUrl(dataUrl);
      setPublishSuccessMessage("✨ Sacred visual compressed & attached!");
      setTimeout(() => setPublishSuccessMessage(null), 3000);
    } catch (err: any) {
      alert("Image processing failed: " + (err.message || 'Unknown error'));
    } finally {
      setIsCompressingWisdomImg(false);
    }
  };

  const handleAdminPublishWisdomCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWisdomTitle.trim() || !adminWisdomContent.trim()) {
      alert("Please provide a title and teaching explanation.");
      return;
    }

    setIsUploadingWisdom(true);
    const activeUser = getActiveUser();
    const res = await IslamicWisdomService.addTeaching({
      title: adminWisdomTitle.trim(),
      imageUrl: adminWisdomImageUrl.trim(),
      category: adminWisdomCategory,
      arabicText: adminWisdomArabic.trim(),
      content: adminWisdomContent.trim(),
      scholarOrSource: adminWisdomScholar.trim() || 'Islamic Classical Tradition',
      featured: adminWisdomFeatured
    }, activeUser?.displayName || 'Admin');
    setIsUploadingWisdom(false);

    if (res.success) {
      setAdminWisdomTitle('');
      setAdminWisdomArabic('');
      setAdminWisdomContent('');
      setAdminWisdomScholar('');
      setAdminWisdomFeatured(false);
      setPublishSuccessMessage(`✨ Teaching "${adminWisdomTitle}" published to Islamic Wisdom repository!`);
      setTimeout(() => setPublishSuccessMessage(null), 4500);
    } else {
      alert(res.error || "Failed to publish teaching card.");
    }
  };

  const handleAdminDeleteWisdomCard = async (teaching: IslamicTeachingItem) => {
    if (!window.confirm(`Admin: Delete "${teaching.title}" from Islamic Wisdom?`)) return;
    const success = await IslamicWisdomService.deleteTeaching(teaching.id);
    if (success) {
      setPublishSuccessMessage(`🗑️ Removed teaching "${teaching.title}" from Firestore.`);
      setTimeout(() => setPublishSuccessMessage(null), 3500);
    }
  };

  const handleAdminToggleFeaturedWisdomCard = async (teaching: IslamicTeachingItem) => {
    await IslamicWisdomService.toggleFeatured(teaching.id, !!teaching.featured);
    setPublishSuccessMessage(`⭐ ${teaching.featured ? 'Unpinned from' : 'Pinned to'} Islamic Wisdom hero!`);
    setTimeout(() => setPublishSuccessMessage(null), 3000);
  };

  const handleContentTouch = (postId: string) => {
    const now = Date.now();
    const lastTap = lastTapTimesRef.current[postId] || 0;
    if (now - lastTap < 320) {
      handleDoubleTapLike(postId);
      lastTapTimesRef.current[postId] = 0;
    } else {
      lastTapTimesRef.current[postId] = now;
    }
  };

  const getActiveUser = () => {
    if (restDbClient.isLoggedIn()) {
      const u = restDbClient.getUser();
      if (u) {
        return {
          uid: u.uid,
          displayName: u.displayName,
          isRest: true
        };
      }
    }
    if (auth.currentUser) {
      return {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Spiritual Soul',
        isRest: false
      };
    }
    const savedEmail = localStorage.getItem('saved-auth-email');
    if (savedEmail) {
      const uid = 'local_' + btoa(savedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
      return {
        uid,
        displayName: savedEmail.split('@')[0],
        isRest: false
      };
    }
    let guestUid = localStorage.getItem('sanctuary_guest_uid');
    if (!guestUid) {
      guestUid = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('sanctuary_guest_uid', guestUid);
    }
    return {
      uid: guestUid,
      displayName: 'Spiritual Soul',
      isRest: false
    };
  };

  const [authTrigger, setAuthTrigger] = useState(0);

  useEffect(() => {
    const handleAuthUpdate = () => {
      setAuthTrigger(prev => prev + 1);
    };
    window.addEventListener('rest_auth_updated', handleAuthUpdate);
    return () => window.removeEventListener('rest_auth_updated', handleAuthUpdate);
  }, []);

  // Background Auto-Registration / Auto-Login for guest convenience
  useEffect(() => {
    const autoLoginRest = async () => {
      const activeUser = getActiveUser();
      if (activeUser && activeUser.uid.startsWith('local_') && !restDbClient.isLoggedIn()) {
        const email = localStorage.getItem('saved-auth-email');
        if (email) {
          const defaultPassword = 'SanctuaryGuestPass123!';
          try {
            const user = await restDbClient.login(email, defaultPassword);
            window.dispatchEvent(new CustomEvent('rest_auth_updated'));
          } catch (err) {
            try {
              const user = await restDbClient.register(email, defaultPassword, email.split('@')[0]);
              window.dispatchEvent(new CustomEvent('rest_auth_updated'));
            } catch (regErr) {}
          }
        }
      }
    };
    autoLoginRest();
  }, [authTrigger]);

  // Fetch Posts from Firestore or REST Cloud Database
  useEffect(() => {
    const activeUser = getActiveUser();
    const useRest = !activeUser || activeUser.isRest || activeUser.uid.startsWith('local_') || activeUser.uid.startsWith('guest_') || activeUser.uid.startsWith('rest_');

    if (useRest) {
      const fetchRestPosts = () => {
        restDbClient.getPosts()
          .then(list => {
            const mapped = list.map(p => ({
              ...p,
              privacy: p.privacy || 'public',
              timeDisplay: p.timeDisplay || (p.time ? new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')
            }));
            if (mapped.length === 0) {
              setPosts(DEFAULT_NOOR_POSTS);
            } else {
              // Merge any default posts that aren't in mapped
              const existingIds = new Set(mapped.map(p => p.id));
              const extraDefaults = DEFAULT_NOOR_POSTS.filter(d => !existingIds.has(d.id));
              setPosts([...mapped, ...extraDefaults]);
            }
            setLoading(false);
          })
          .catch(err => {
            console.warn("Failed to fetch REST posts:", err);
            setPosts(DEFAULT_NOOR_POSTS);
            setLoading(false);
          });
      };

      fetchRestPosts();
      const intervalId = setInterval(fetchRestPosts, 4000);
      return () => clearInterval(intervalId);
    } else {
      const q = query(
        collection(db, 'posts'),
        orderBy('time', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            privacy: 'public',
            ...data,
            comments: Array.isArray(data.comments) ? data.comments : [],
            timeDisplay: data.time ? new Date(data.time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
          } as any;
        });
        if (list.length === 0) {
          setPosts(DEFAULT_NOOR_POSTS);
        } else {
          const existingIds = new Set(list.map(p => p.id));
          const extraDefaults = DEFAULT_NOOR_POSTS.filter(d => !existingIds.has(d.id));
          setPosts([...list, ...extraDefaults]);
        }
        setLoading(false);

        // Auto-expand and scroll to linked discussion if URL has post param or hash
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const targetPostId = urlParams.get('post') || window.location.hash.replace('#post-', '');
          if (targetPostId) {
            setExpandedCommentsPostId(targetPostId);
            setTimeout(() => {
              const el = document.getElementById(`post-${targetPostId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 500);
          }
        } catch (e) {}
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [authTrigger]);

  // Handle Double-Tap Heart
  const handleDoubleTapLike = (postId: string) => {
    playHapticAudio('like');
    setHeartPops(prev => ({ ...prev, [postId]: true }));
    
    const activeUser = getActiveUser();
    if (activeUser) {
      const post = posts.find(p => p.id === postId);
      const activeUid = activeUser.uid;
      const myVote = post?.userVotes?.[activeUid];
      if (myVote !== 'support') {
        handleVote(postId, 'support');
      }
    }
    
    setTimeout(() => {
      setHeartPops(prev => ({ ...prev, [postId]: false }));
    }, 850);
  };

  const handleVote = async (postId: string, type: 'support' | 'reconsider') => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const userId = activeUser.uid;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (type === 'support') playHapticAudio('like');

    // Apply instantaneous optimistic update immediately for ultra-fast response on any network
    const currentVote = post.userVotes?.[userId];
    let supportChange = 0;
    let reconsiderChange = 0;
    const newUserVotes = { ...(post.userVotes || {}) };

    if (currentVote === type) {
      delete newUserVotes[userId];
      if (type === 'support') supportChange = -1;
      else reconsiderChange = -1;
    } else {
      if (currentVote) {
        if (currentVote === 'support') supportChange = -1;
        else reconsiderChange = -1;
      }
      newUserVotes[userId] = type;
      if (type === 'support') supportChange = 1;
      else reconsiderChange = 1;
    }

    setPosts(prevPosts => prevPosts.map(p => p.id === postId ? {
      ...p,
      userVotes: newUserVotes,
      supportCount: Math.max(0, (p.supportCount || 0) + supportChange),
      reconsiderCount: Math.max(0, (p.reconsiderCount || 0) + reconsiderChange)
    } : p));

    if (activeUser.isRest) {
      try {
        await restDbClient.votePost(postId, type);
      } catch (e) {}
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const updates: any = {};

    if (currentVote === type) {
      updates[`userVotes.${userId}`] = null;
      updates[type === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(-1);
    } else {
      if (currentVote) {
        updates[currentVote === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(-1);
      }
      updates[`userVotes.${userId}`] = type;
      updates[type === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(1);
    }

    try {
      await updateDoc(postRef, updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (postId: string) => {
    playHapticAudio('swipe');
    setBookmarkedPosts(prev => {
      const next = { ...prev, [postId]: !prev[postId] };
      return next;
    });
  };

  // Submit New Post from Modal
  const handleModalPostSubmit = async (payload: CreatePostPayload) => {
    const activeUser = getActiveUser();
    if (!activeUser) return;

    playHapticAudio('publish');

    const isSensitive = ['debate', 'attack', 'haram', 'politics'].some(word => 
      payload.content.toLowerCase().includes(word)
    );

    const optimisticPost: Post = {
      id: `post-${Date.now()}`,
      userId: activeUser.uid,
      user: activeUser.displayName,
      content: payload.content,
      caption: payload.caption,
      category: payload.category,
      privacy: payload.privacy,
      timeDisplay: 'Just now',
      supportCount: 0,
      reconsiderCount: 0,
      userVotes: {},
      comments: [],
      isFlagged: isSensitive,
      approved: !isSensitive,
      image: payload.image || null,
      bgStyle: payload.bgStyle,
      filterPreset: payload.filterPreset,
      poll: payload.poll
    };

    if (addHasanat) addHasanat(50);
    setPosts([optimisticPost, ...posts]);
    setPublishSuccessMessage(`✨ Reflection published to ${payload.privacy === 'public' ? 'Global Ummah' : 'Friends Circle'}! (+50 Hasanat)`);
    setTimeout(() => setPublishSuccessMessage(null), 4500);

    // Broadcast in-app & system signal for the newly published story
    notificationService.notifyNewFeedPost(
      activeUser.displayName || 'Community Member',
      payload.content,
      optimisticPost.id
    );

    if (activeUser.isRest) {
      try {
        await restDbClient.addPost(
          payload.content,
          payload.category,
          payload.image,
          payload.poll,
          payload.privacy,
          payload.bgStyle,
          payload.caption
        );
      } catch (e) {
        console.warn("REST publish error:", e);
      }
      return;
    }

    try {
      if (auth.currentUser) {
        await addDoc(collection(db, 'posts'), {
          userId: activeUser.uid,
          user: activeUser.displayName,
          content: payload.content,
          caption: payload.caption || '',
          category: payload.category,
          privacy: payload.privacy,
          time: serverTimestamp(),
          supportCount: 0,
          reconsiderCount: 0,
          userVotes: {},
          comments: [],
          isFlagged: isSensitive,
          approved: !isSensitive,
          image: payload.image || null,
          bgStyle: payload.bgStyle,
          poll: payload.poll || null
        });
      } else {
        await restDbClient.addPost(
          payload.content,
          payload.category,
          payload.image,
          payload.poll,
          payload.privacy,
          payload.bgStyle,
          payload.caption
        );
      }
    } catch (e) {
      console.warn("Firestore publish fallback:", e);
    }
  };

  const handlePollVote = async (postId: string, optionId: string) => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const userId = activeUser.uid;
    const post = posts.find(p => p.id === postId);
    
    if (post && post.poll && !post.poll.userSelections?.[userId]) {
      playHapticAudio('like');
      const newOptions = post.poll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      const newUserSelections = { ...(post.poll.userSelections || {}), [userId]: optionId };
      const updatedPoll = {
        ...post.poll,
        totalVotes: (post.poll.totalVotes || 0) + 1,
        options: newOptions,
        userSelections: newUserSelections
      };

      if (activeUser.isRest) {
        setPosts(posts.map(p => p.id === postId ? { ...p, poll: updatedPoll } : p));
        if (addHasanat) addHasanat(5);
        return;
      }

      const postRef = doc(db, 'posts', postId);
      try {
        await updateDoc(postRef, {
          'poll.totalVotes': increment(1),
          'poll.options': newOptions,
          [`poll.userSelections.${userId}`]: optionId
        });
        if (addHasanat) addHasanat(5);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/poll`);
      }
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { isFlagged: false, approved: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleReportPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForReport(post);
      setIsReportModalOpen(true);
    } else {
      setSelectedPostForReport({ id: postId, user: 'Community Member', content: '' } as any);
      setIsReportModalOpen(true);
    }
  };

  const handleDeletePost = (postId: string) => {
    setConfirmAction({
      type: 'delete',
      id: postId,
      title: 'Delete Reflection',
      message: 'Are you sure you want to delete this post? This action cannot be undone.'
    });
  };

  const handleDeleteComment = (postId: string, commentId: string, parentCommentId?: string) => {
    setConfirmAction({
      type: 'delete_comment',
      id: postId,
      commentId,
      parentCommentId,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this reflection comment?'
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'delete') {
      const activeUser = getActiveUser();
      setPosts(posts.filter(p => p.id !== confirmAction.id));
      setConfirmAction(null);

      if (activeUser?.isRest) {
        try { await restDbClient.deletePost(confirmAction.id); } catch {}
        return;
      }
      try {
        await deleteDoc(doc(db, 'posts', confirmAction.id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `posts/${confirmAction.id}`);
      }
    } else if (confirmAction.type === 'delete_comment') {
      const { id: postId, commentId, parentCommentId } = confirmAction;
      const activeUser = getActiveUser();
      const post = posts.find(p => p.id === postId);
      if (post) {
        let updatedComments = [...(post.comments || [])];
        if (parentCommentId) {
          updatedComments = updatedComments.map(c => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: (c.replies || []).filter(r => r.id !== commentId)
              };
            }
            return c;
          });
        } else {
          updatedComments = updatedComments.filter(c => c.id !== commentId);
        }
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
      }
      setConfirmAction(null);

      if (activeUser?.isRest && commentId) {
        try { await restDbClient.deleteComment(postId, commentId); } catch {}
        return;
      }
      if (commentId && post) {
        try {
          const postRef = doc(db, 'posts', postId);
          const currentPostComments = post.comments || [];
          let filteredList: Comment[] = [];
          if (parentCommentId) {
            filteredList = currentPostComments.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: (c.replies || []).filter(r => r.id !== commentId)
                };
              }
              return c;
            });
          } else {
            filteredList = currentPostComments.filter(c => c.id !== commentId);
          }
          await updateDoc(postRef, { comments: filteredList });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/comments`);
        }
      }
    } else if (confirmAction.type === 'report') {
      setPosts(posts.map(p => p.id === confirmAction.id ? { ...p, isFlagged: true, approved: false } : p));
      setConfirmAction(null);
      try {
        await updateDoc(doc(db, 'posts', confirmAction.id), { isFlagged: true, approved: false });
      } catch {}
    }
  };

  const handleCopyContent = (postId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPostId(postId);
    setPublishSuccessMessage("Copied reflection to clipboard!");
    setTimeout(() => {
      setCopiedPostId(null);
      setPublishSuccessMessage(null);
    }, 2500);
  };

  // 🌟 Native Device Share Sheet with Clipboard Fallback
  const handleSharePost = async (post: Post) => {
    const cleanContent = post.content || post.caption || 'Spiritual reflection';
    const hashtagTag = post.category ? `#${post.category.replace(/[^a-zA-Z0-9]/g, '')}` : '#NoorTalk';
    const shareText = `"${cleanContent}"\n\n— Shared by ${post.user} on Sanctuary Noor Talk 🌿✨\n${hashtagTag} #SanctuaryApp`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Noor Talk Reflection by ${post.user}`,
          text: shareText,
          url: shareUrl
        });
        setPublishSuccessMessage("Reflection shared via device share sheet! ✨");
        setTimeout(() => setPublishSuccessMessage(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy formatted reflection & link to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopiedPostId(post.id);
      setPublishSuccessMessage("Copied reflection link & text for outside sharing! 📋");
      setTimeout(() => {
        setCopiedPostId(null);
        setPublishSuccessMessage(null);
      }, 3000);
    } catch {
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  const handleCommentSubmit = async (postId: string, parentCommentId?: string, replyToUser?: string) => {
    const activeUser = getActiveUser();
    const textToSubmit = parentCommentId ? replyText.trim() : (activePostComment?.postId === postId ? activePostComment.text.trim() : '');
    
    // Check if there is an image attached
    const attachedImage = parentCommentId 
      ? (replyImageAttachment?.commentId === parentCommentId ? replyImageAttachment.imageUrl : undefined)
      : (commentImageAttachment?.postId === postId ? commentImageAttachment.imageUrl : undefined);
    
    const attachedCaption = parentCommentId 
      ? (replyImageAttachment?.commentId === parentCommentId ? replyImageAttachment.caption : undefined)
      : (commentImageAttachment?.postId === postId ? commentImageAttachment.caption : undefined);

    // If neither text nor image is present, ignore
    if ((!textToSubmit && !attachedImage) || !activeUser) return;

    playHapticAudio('publish');

    const finalText = textToSubmit || (attachedCaption ? attachedCaption : 'Shared a spiritual moment 📸✨');

    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: activeUser.uid,
      user: activeUser.displayName,
      text: finalText,
      imageUrl: attachedImage,
      imageCaption: attachedCaption,
      replyToUser: replyToUser || undefined,
      replyToCommentId: parentCommentId || undefined,
      parentCommentId: parentCommentId || undefined,
      time: new Date().toISOString(),
      ameens: 0,
      hearts: 0,
      likes: 0,
      userReactions: {},
      replies: []
    };

    const post = posts.find(p => p.id === postId);
    if (post) {
      let updatedComments = [...(post.comments || [])];
      if (parentCommentId) {
        let parentFound = false;
        updatedComments = updatedComments.map(c => {
          if (c.id === parentCommentId) {
            parentFound = true;
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        });
        if (!parentFound) {
          updatedComments.push(newComment);
        }
      } else {
        updatedComments.push(newComment);
      }
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    }

    setExpandedCommentsPostId(postId);
    if (addHasanat) addHasanat(attachedImage ? 25 : 10);
    
    if (parentCommentId) {
      setReplyingTo(null);
      setReplyText('');
      setReplyImageAttachment(null);
    } else {
      setActivePostComment(null);
      setCommentImageAttachment(null);
    }
    setActivePhotoPicker(null);

    // Trigger notification for comment thread replies
    if (post) {
      // 1. If replying to a specific comment, notify that comment's author
      if (parentCommentId) {
        const parentComment = (post.comments || []).find(c => c.id === parentCommentId);
        if (parentComment && parentComment.userId !== activeUser.uid) {
          notificationService.notifyCommentReply(
            activeUser.displayName || 'A community member',
            finalText,
            postId,
            parentComment.user || 'Discussion Participant'
          );
        }
      }

      // 2. If user is commenting/replying on someone else's post, notify post author
      if (post.userId && post.userId !== activeUser.uid) {
        notificationService.notifyCommentReply(
          activeUser.displayName || 'A community member',
          finalText,
          postId,
          undefined,
          true
        );
      }

      // 3. Store notification record in Firestore
      try {
        const targetUserId = parentCommentId 
          ? ((post.comments || []).find(c => c.id === parentCommentId)?.userId || post.userId)
          : post.userId;

        if (targetUserId && targetUserId !== activeUser.uid && !activeUser.isRest) {
          addDoc(collection(db, 'notifications'), {
            type: 'feed_reply',
            recipientId: targetUserId,
            senderId: activeUser.uid,
            senderName: activeUser.displayName || 'A member',
            postId: postId,
            parentCommentId: parentCommentId || null,
            text: finalText,
            createdAt: serverTimestamp(),
            read: false,
            actionUrl: `/?tab=ummah&view=feed&post=${postId}&expand=true#post-${postId}`
          }).catch(() => {});
        }
      } catch (err) {
        console.warn("Notification write failed:", err);
      }
    }

    if (activeUser.isRest) {
      try {
        await restDbClient.commentPost(postId, finalText, parentCommentId, replyToUser, parentCommentId, attachedImage, attachedCaption);
      } catch (e) {}
      return;
    }

    try {
      // Sync with REST backend as well to ensure multi-client availability
      restDbClient.commentPost(postId, finalText, parentCommentId, replyToUser, parentCommentId, attachedImage, attachedCaption).catch(() => {});

      const postRef = doc(db, 'posts', postId);
      if (post) {
        const currentPostComments = post.comments || [];
        let updatedList: Comment[] = [];
        if (parentCommentId) {
          let parentFound = false;
          updatedList = currentPostComments.map(c => {
            if (c.id === parentCommentId) {
              parentFound = true;
              return {
                ...c,
                replies: [...(c.replies || []), newComment]
              };
            }
            return c;
          });
          if (!parentFound) {
            updatedList.push(newComment);
          }
        } else {
          updatedList = [...currentPostComments, newComment];
        }
        await updateDoc(postRef, {
          comments: updatedList
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/comments`);
    }
  };

  // 🤲 Comment Reaction Handler (Ameen, Heart, Like)
  const handleCommentReaction = async (
    postId: string, 
    commentId: string, 
    reactionType: 'ameen' | 'heart' | 'like' = 'ameen',
    parentCommentId?: string
  ) => {
    const activeUser = getActiveUser();
    if (!activeUser) return;

    playHapticAudio('like');
    if (addHasanat) addHasanat(5);

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const mutateComment = (c: Comment): Comment => {
      if (c.id === commentId) {
        const userReactions = { ...(c.userReactions || {}) };
        const currentReaction = userReactions[activeUser.uid];
        let hearts = c.hearts || c.likes || 0;
        let ameens = c.ameens || 0;

        if (currentReaction === reactionType) {
          delete userReactions[activeUser.uid];
          if (reactionType === 'ameen') ameens = Math.max(0, ameens - 1);
          else hearts = Math.max(0, hearts - 1);
        } else {
          if (currentReaction === 'ameen') ameens = Math.max(0, ameens - 1);
          if (currentReaction === 'heart' || currentReaction === 'like') hearts = Math.max(0, hearts - 1);

          userReactions[activeUser.uid] = reactionType;
          if (reactionType === 'ameen') ameens += 1;
          else hearts += 1;
        }

        return { ...c, hearts, likes: hearts, ameens, userReactions };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: c.replies.map(mutateComment) };
      }
      return c;
    };

    const updatedComments = (post.comments || []).map(mutateComment);
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));

    setPublishSuccessMessage(reactionType === 'ameen' ? "🤲 Ameen recorded (+5 Hasanat!)" : "❤️ Noor reaction sent (+5 Hasanat!)");
    setTimeout(() => setPublishSuccessMessage(null), 2500);

    if (activeUser.isRest) {
      try {
        await restDbClient.reactToComment(postId, commentId, reactionType);
      } catch (err) {}
      return;
    }

    try {
      restDbClient.reactToComment(postId, commentId, reactionType).catch(() => {});
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { comments: updatedComments });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/comments`);
    }
  };

  // 📌 Pin/Unpin Comment (for Post Author or Scholars/Admins)
  const handleTogglePinComment = async (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    let wasPinned = false;
    const updatedComments = (post.comments || []).map(c => {
      if (c.id === commentId) {
        wasPinned = !c.isPinned;
        return { ...c, isPinned: !c.isPinned };
      }
      return c;
    });

    // Sort pinned comments to the top
    updatedComments.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));

    setPublishSuccessMessage(wasPinned ? "📌 Reflection pinned to top!" : "Unpinned reflection");
    setTimeout(() => setPublishSuccessMessage(null), 2500);

    const activeUser = getActiveUser();
    if (!activeUser?.isRest) {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, { comments: updatedComments });
      } catch (e) {}
    }
  };

  // 📋 Copy Reflection to Clipboard
  const handleCopyCommentText = (commentId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommentId(commentId);
    setPublishSuccessMessage("Copied reflection to clipboard! ✨");
    setTimeout(() => {
      setCopiedCommentId(null);
      setPublishSuccessMessage(null);
    }, 2500);
  };

  // ⚡ Insert Quick Dua / Islamic Reaction
  const handleInsertQuickReaction = (postId: string, reactionText: string, isReply: boolean = false) => {
    playHapticAudio('swipe');
    if (isReply) {
      setReplyText(prev => prev ? `${prev} ${reactionText}` : reactionText);
    } else {
      setActivePostComment(prev => {
        const currentText = prev?.postId === postId ? prev.text : '';
        return {
          postId,
          text: currentText ? `${currentText} ${reactionText}` : reactionText
        };
      });
    }
  };

  // 🔤 Insert Islamic Calligraphy Symbol (e.g. ﷺ, ﷻ)
  const handleInsertSymbol = (postId: string, symbol: string, isReply: boolean = false) => {
    playHapticAudio('swipe');
    if (isReply) {
      setReplyText(prev => `${prev}${symbol} `);
    } else {
      setActivePostComment(prev => {
        const currentText = prev?.postId === postId ? prev.text : '';
        return {
          postId,
          text: `${currentText}${symbol} `
        };
      });
    }
  };

  // Filtered posts calculation (including hashtag filtering)
  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesPrivacy = 
      privacyFilter === 'all' || 
      (privacyFilter === 'public' && (!p.privacy || p.privacy === 'public')) ||
      (privacyFilter === 'friends' && p.privacy === 'friends');
    
    const matchesHashtag = !selectedHashtag || (
      (p.content && p.content.toLowerCase().includes(selectedHashtag.toLowerCase())) ||
      (p.caption && p.caption.toLowerCase().includes(selectedHashtag.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(selectedHashtag.replace('#', '').toLowerCase()))
    );

    return matchesCategory && matchesPrivacy && matchesHashtag;
  });

  const currentUser: any = getActiveUser();
  const isAdmin = currentUser?.email === 'ssalilukia9@gmail.com' ||
                  currentUser?.email === 'admin@habibisanctuary.com' ||
                  (typeof localStorage !== 'undefined' && (
                    localStorage.getItem('sanctuary_admin_logged_in') === 'true' ||
                    localStorage.getItem('sanctuary_admin_mode') === 'true' ||
                    localStorage.getItem('saved-auth-email')?.toLowerCase() === 'ssalilukia9@gmail.com' ||
                    localStorage.getItem('saved-auth-email')?.toLowerCase()?.includes('admin')
                  )) ||
                  AdminConfigService.isAdminUser(currentUser);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:grid lg:grid-cols-12 gap-8 pb-32">
      {/* 🌟 Dedicated 'Create Post' Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleModalPostSubmit}
        currentUser={currentUser}
        initialCategory={activeCategory !== 'All' ? activeCategory : 'How I Feel'}
      />

      {/* Lightbox Preview Modal for Islamic Teaching */}
      <AnimatePresence>
        {previewingWisdomCard && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-brand-sidebar border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl space-y-4"
            >
              <div className="relative aspect-video w-full bg-black overflow-hidden">
                <img
                  src={previewingWisdomCard.imageUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'}
                  alt={previewingWisdomCard.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <button
                  onClick={() => setPreviewingWisdomCard(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer border border-white/10"
                >
                  <X size={16} />
                </button>
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-emerald-500/80 text-slate-950 font-black text-xs uppercase tracking-wider">
                  {previewingWisdomCard.categoryLabel || previewingWisdomCard.category}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-black text-white">{previewingWisdomCard.title}</h3>
                {previewingWisdomCard.arabicText && (
                  <p className="text-sm text-amber-200 font-serif text-right bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-loose">
                    {previewingWisdomCard.arabicText}
                  </p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {previewingWisdomCard.content}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
                  <span>Source: <strong className="text-white">{previewingWisdomCard.scholarOrSource || 'Tradition'}</strong></span>
                  <button
                    onClick={() => setPreviewingWisdomCard(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-depth/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-white/10 p-8 rounded-[3rem] max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${confirmAction.type.startsWith('delete') ? 'bg-red-500/10 text-red-500' : 'bg-noor-gold/10 text-noor-gold'}`}>
                {confirmAction.type.startsWith('delete') ? <Trash2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">{confirmAction.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {confirmAction.message}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={executeConfirmedAction}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer ${confirmAction.type.startsWith('delete') ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-noor-gold text-black'}`}
                >
                  {confirmAction.type.startsWith('delete') ? 'Confirm Delete' : 'Confirm Action'}
                </button>
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) for Instant Post Creation */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-24 right-5 sm:right-8 z-40 px-5 py-3.5 rounded-full bg-gradient-to-r from-noor-emerald via-teal-500 to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_10px_35px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer border border-emerald-300/40 backdrop-blur-md"
        title="Create New Reflection"
      >
        <Plus size={18} className="stroke-[3]" />
        <span>Share Noor</span>
        <Sparkles size={14} className="text-amber-300" />
      </motion.button>

      {/* Left Sidebar - Topics & Circles */}
      <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
        <div className="glass-panel border-white/10 rounded-[2rem] p-6 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2.5">
              <Compass className="text-noor-gold" size={20} />
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/70">NoorTalk Hub</h3>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 rounded-xl bg-noor-emerald/20 text-noor-emerald hover:bg-noor-emerald hover:text-slate-950 transition-all"
              title="Create Post"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => { setActiveCategory('All'); setPrivacyFilter('all'); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all group flex items-center justify-between cursor-pointer ${
                activeCategory === 'All' && privacyFilter === 'all'
                  ? 'bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/30 shadow-md' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe size={15} /> All Feed (Global)
              </span>
              <ArrowUp className="opacity-0 group-hover:opacity-100 -rotate-45 transition-all" size={14} />
            </button>

            <button 
              onClick={() => setPrivacyFilter('friends')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all group flex items-center justify-between cursor-pointer ${
                privacyFilter === 'friends'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={15} className="text-amber-400" /> Ummah Circle (Friends)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black">
                Private
              </span>
            </button>
          </div>

          <div className="pt-5 border-t border-white/5 space-y-5">
             <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scholar Mode</h4>
                <button 
                  onClick={() => setIsScholarMode(!isScholarMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${isScholarMode ? 'bg-noor-gold' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: isScholarMode ? 20 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
             </div>

             <div className="space-y-3">
                <h4 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Islamic Topics</h4>
                <div className="space-y-1">
                    {SIDEBAR_TOPICS.map((topic) => (
                      <button 
                        key={topic.name}
                        onClick={() => setActiveCategory(topic.name.split(' ')[0])}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          activeCategory === topic.name.split(' ')[0]
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <topic.icon size={16} className="text-noor-gold/70" />
                        <span className="flex-1 truncate">{topic.name}</span>
                        <span className="text-[10px] opacity-40 font-mono">{topic.count}</span>
                      </button>
                    ))}
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel border-white/10 rounded-[2rem] p-5 bg-noor-emerald/5 border-noor-emerald/15 space-y-2">
           <div className="flex items-center gap-2.5">
              <ShieldCheck className="text-noor-emerald" size={18} />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Sanctuary Ethics</h3>
           </div>
           <p className="text-[11px] text-slate-400 leading-relaxed">
             Share your sincere feelings, daily reflections, blessings, and beneficial reminders with peace & brotherhood.
           </p>
        </div>
      </div>

      {/* Main Feed Column */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* Top Control Bar: View Mode Switcher + Create Post Trigger */}
        <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 p-2.5 rounded-[1.8rem] backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFeedViewMode('stream')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                feedViewMode === 'stream'
                  ? 'bg-noor-emerald text-slate-950 shadow-md shadow-noor-emerald/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Stream</span>
            </button>
            <button
              onClick={() => setFeedViewMode('reels')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                feedViewMode === 'reels'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone size={13} />
              <span>Swipe Reels</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-xs flex items-center gap-2 border border-white/10 transition-all cursor-pointer hover:border-emerald-400/40"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>Create Post</span>
          </button>
        </div>

        {/* 👑 ADMIN ONLY: Dedicated Islamic Wisdom & Visual Teaching Studio in Post Management */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-[2.5rem] border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-slate-900/80 to-black/90 p-5 sm:p-6 shadow-2xl space-y-5 overflow-hidden relative"
          >
            {/* Header / Studio Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                      👑 Admin Studio
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {adminTeachings.length} Active Teachings
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">
                    Islamic Wisdom & Visual Teaching Creator
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowAdminWisdomStudio(!showAdminWisdomStudio)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {showAdminWisdomStudio ? (
                    <>
                      <ChevronUp size={14} />
                      <span>Collapse Studio</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Upload & Manage ({adminTeachings.length})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Upload & Management Workspace */}
            <AnimatePresence>
              {showAdminWisdomStudio && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 pt-2 overflow-hidden"
                >
                  {/* Uploader Form */}
                  <form onSubmit={handleAdminPublishWisdomCard} className="space-y-4 bg-black/40 p-4 sm:p-5 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Upload size={13} /> Direct Image & Reflection Uploader (Stored in Firestore)
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Upload & delete in real time</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Title */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Teaching Title / Sacred Theme *
                        </label>
                        <input
                          required
                          type="text"
                          value={adminWisdomTitle}
                          onChange={(e) => setAdminWisdomTitle(e.target.value)}
                          placeholder="e.g. The Highest Ranks of Taqwa / Healing in Gratitude"
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-emerald-400 transition-colors"
                        />
                      </div>

                      {/* Direct Image File Upload or URL */}
                      <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between pl-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <ImageIcon size={13} className="text-emerald-400" />
                            <span>Sacred Picture / Visual Card *</span>
                          </label>
                          <span className="text-[9px] text-emerald-400">Direct file or URL</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                          {/* File input */}
                          <div className="sm:col-span-5">
                            <label className={`w-full py-3 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                              isCompressingWisdomImg
                                ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                                : 'border-white/15 hover:border-emerald-400/50 bg-black/40 hover:bg-black/60 text-slate-300'
                            }`}>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleAdminWisdomFileChange(f);
                                }}
                              />
                              {isCompressingWisdomImg ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin text-emerald-400" />
                                  <span className="text-xs font-bold">Compressing...</span>
                                </>
                              ) : (
                                <>
                                  <Download size={14} className="text-emerald-400 rotate-180" />
                                  <span className="text-xs font-bold">Select File from Device</span>
                                </>
                              )}
                            </label>
                          </div>

                          {/* Image URL & preview */}
                          <div className="sm:col-span-7 flex gap-2">
                            <input
                              required
                              type="text"
                              value={adminWisdomImageUrl}
                              onChange={(e) => setAdminWisdomImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs font-mono outline-none focus:border-emerald-400 transition-colors truncate"
                            />
                            {adminWisdomImageUrl && (
                              <div className="w-12 h-11 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shrink-0">
                                <img src={adminWisdomImageUrl} alt="Visual" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Preset Image Selector */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[9px] text-slate-500 font-bold uppercase">Presets:</span>
                          {ISLAMIC_IMAGE_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setAdminWisdomImageUrl(preset.url)}
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all border cursor-pointer ${
                                adminWisdomImageUrl === preset.url
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Category *
                        </label>
                        <select
                          value={adminWisdomCategory}
                          onChange={(e) => setAdminWisdomCategory(e.target.value as any)}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-emerald-400 transition-colors"
                        >
                          <option value="spirituality">Inner Spirituality & Tazkiyah</option>
                          <option value="hadith_pearls">Hadith Pearls</option>
                          <option value="quran_insights">Quranic Insights</option>
                          <option value="prophetic_sunnah">Prophetic Sunnah</option>
                          <option value="akhlaq_character">Akhlaq & Character</option>
                          <option value="daily_reminders">Daily Reminders</option>
                        </select>
                      </div>

                      {/* Scholar / Source */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Scholar / Authenticated Source
                        </label>
                        <input
                          type="text"
                          value={adminWisdomScholar}
                          onChange={(e) => setAdminWisdomScholar(e.target.value)}
                          placeholder="e.g. Sahih al-Bukhari / Imam al-Nawawi"
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs outline-none focus:border-emerald-400 transition-colors"
                        />
                      </div>

                      {/* Arabic Matn */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Arabic Quran / Hadith Text (Optional)
                        </label>
                        <input
                          dir="rtl"
                          type="text"
                          value={adminWisdomArabic}
                          onChange={(e) => setAdminWisdomArabic(e.target.value)}
                          placeholder="إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ..."
                          className="w-full bg-black/50 border border-white/10 rounded-2xl py-3 px-4 text-amber-200 text-sm font-serif outline-none focus:border-emerald-400 transition-colors text-right"
                        />
                      </div>

                      {/* Explanation Content */}
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                          Wisdom Explanation & Reflection *
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={adminWisdomContent}
                          onChange={(e) => setAdminWisdomContent(e.target.value)}
                          placeholder="Write the sacred explanation, translation, context, and practical daily action..."
                          className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-emerald-400 transition-colors resize-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Publish Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                        <input
                          type="checkbox"
                          checked={adminWisdomFeatured}
                          onChange={(e) => setAdminWisdomFeatured(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 accent-emerald-500 cursor-pointer"
                        />
                        <span>⭐ Pin as Featured Hero Card</span>
                      </label>

                      <button
                        type="submit"
                        disabled={isUploadingWisdom || isCompressingWisdomImg}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isUploadingWisdom ? <RefreshCw className="animate-spin" size={14} /> : <Upload size={14} />}
                        <span>Upload Teaching Card</span>
                      </button>
                    </div>
                  </form>

                  {/* Simultaneous Live Management List (Upload & Delete at the same time) */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <span>Live Teachings Repository</span>
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-mono">
                          {adminTeachings.length} Total
                        </span>
                      </h4>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={wisdomSearchQuery}
                          onChange={(e) => setWisdomSearchQuery(e.target.value)}
                          placeholder="Search teachings..."
                          className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition-all w-44"
                        />

                        <select
                          value={wisdomFilterCategory}
                          onChange={(e) => setWisdomFilterCategory(e.target.value)}
                          className="bg-black/40 border border-white/10 rounded-xl py-1.5 px-2 text-xs text-slate-300 outline-none focus:border-emerald-400"
                        >
                          <option value="all">All Categories</option>
                          <option value="spirituality">Spirituality</option>
                          <option value="hadith_pearls">Hadith</option>
                          <option value="quran_insights">Quran</option>
                          <option value="prophetic_sunnah">Sunnah</option>
                          <option value="akhlaq_character">Akhlaq</option>
                          <option value="daily_reminders">Reminders</option>
                        </select>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                      {adminTeachings
                        .filter(t => {
                          const matchCat = wisdomFilterCategory === 'all' || t.category === wisdomFilterCategory;
                          const q = wisdomSearchQuery.toLowerCase().trim();
                          const matchQ = !q || t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q) || (t.scholarOrSource && t.scholarOrSource.toLowerCase().includes(q));
                          return matchCat && matchQ;
                        })
                        .map((teaching) => (
                          <div
                            key={teaching.id}
                            className="p-3.5 rounded-2xl bg-black/50 border border-white/10 hover:border-white/20 transition-all flex items-start gap-3 justify-between group shadow-md"
                          >
                            <div 
                              onClick={() => openTeachingMediaLightbox(teaching)}
                              className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0 relative cursor-pointer group/timg"
                              title="Click to expand sacred visual"
                            >
                              <img src={teaching.imageUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'} alt={teaching.title} className="w-full h-full object-cover group-hover/timg:scale-110 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/timg:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Sparkles size={14} className="text-amber-300" />
                              </div>
                              {teaching.featured && (
                                <span className="absolute top-1 left-1 px-1 rounded bg-amber-500 text-black text-[8px] font-black">
                                  ⭐
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-emerald-400 font-bold uppercase truncate">
                                  {teaching.categoryLabel || teaching.category}
                                </span>
                                <span className="text-slate-400 truncate max-w-[90px]">
                                  {teaching.scholarOrSource || 'Tradition'}
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white truncate">{teaching.title}</h5>
                              <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">{teaching.content}</p>
                            </div>

                            {/* Actions (Preview, Feature, 1-Click Delete) */}
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                onClick={() => setPreviewingWisdomCard(teaching)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Preview Card"
                              >
                                <Eye size={13} />
                              </button>

                              <button
                                onClick={() => handleAdminToggleFeaturedWisdomCard(teaching)}
                                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                  teaching.featured ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400 hover:text-amber-300'
                                }`}
                                title={teaching.featured ? 'Unpin Featured' : 'Pin Featured'}
                              >
                                ⭐
                              </button>

                              <button
                                onClick={() => handleAdminDeleteWisdomCard(teaching)}
                                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-sm active:scale-95"
                                title="Delete from Firestore & App"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quick Compose Card */}
        <motion.div 
          whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
          className="glass-panel rounded-[2.2rem] border-white/10 overflow-hidden bg-noor-charcoal/40 backdrop-blur-3xl shadow-xl p-5 cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-noor-emerald to-teal-500 shrink-0 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-noor-emerald/20">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-slate-400 text-xs font-medium transition-all flex items-center justify-between">
              <span>What spiritual reflection or feeling is on your heart today?</span>
              <Sparkles size={14} className="text-amber-400 shrink-0 ml-2" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-white/5 text-slate-400 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400/80 hover:text-emerald-400">
                <ImageIcon size={14} /> Photo
              </span>
              <span className="flex items-center gap-1.5 text-amber-400/80 hover:text-amber-400">
                <Smile size={14} /> Feelings
              </span>
              <span className="flex items-center gap-1.5 text-purple-400/80 hover:text-purple-400">
                <Trophy size={14} /> Poll
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              +50 Hasanat
            </span>
          </div>
        </motion.div>

        {/* Category & Privacy Filter Pills */}
        <div className="space-y-2">
          {/* Privacy Level Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setPrivacyFilter('all')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyFilter === 'all'
                  ? 'bg-slate-800 text-white border border-white/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={12} /> All Circles
            </button>
            <button
              onClick={() => setPrivacyFilter('public')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyFilter === 'public'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={12} className="text-emerald-400" /> 🌐 Public Only
            </button>
            <button
              onClick={() => setPrivacyFilter('friends')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyFilter === 'friends'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Users size={12} className="text-amber-400" /> 👥 Friends Only
            </button>
          </div>

          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {[
              'All',
              'How I Feel',
              'General & Life',
              'Spiritual Reminders',
              'Gratitude & Joy',
              'Reflections',
              'Quran & Tafsir',
              'Hadith Studies'
            ].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedHashtag(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive && !selectedHashtag
                      ? 'bg-noor-emerald text-white shadow-lg shadow-noor-emerald/20 border border-noor-emerald'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat === 'All' ? '🌟 All Content' : cat === 'How I Feel' ? '💖 How I Feel' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🌟 Trending Islamic Hashtags Section */}
        <div className="glass-panel rounded-[2rem] border-white/10 p-4 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-purple-950/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400 fill-amber-400" />
                <span>Trending Islamic Hashtags</span>
              </h3>
            </div>
            {selectedHashtag && (
              <button
                onClick={() => setSelectedHashtag(null)}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 cursor-pointer transition-colors"
              >
                <X size={11} />
                <span>Clear Filter</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TRENDING_HASHTAGS.map((item) => {
              const isSelected = selectedHashtag?.toLowerCase() === item.tag.toLowerCase();
              return (
                <button
                  key={item.tag}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedHashtag(null);
                    } else {
                      setSelectedHashtag(item.tag);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-noor-emerald to-teal-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-noor-emerald/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.tag}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedHashtag && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1.5 rounded-xl bg-noor-emerald/10 border border-noor-emerald/30 text-[11px] font-bold text-noor-emerald flex items-center justify-between"
            >
              <span>Filtering Ummah reflections matching <strong className="text-white underline">{selectedHashtag}</strong></span>
              <span className="text-[10px] opacity-75 font-mono">{filteredPosts.length} reflections</span>
            </motion.div>
          )}
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {publishSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-3.5 bg-noor-emerald/20 border border-noor-emerald/40 rounded-2xl text-xs font-black text-noor-emerald text-center flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>{publishSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🌟 1. NOOR REELS / FULLSCREEN CARD SWIPER MODE */}
        {feedViewMode === 'reels' && (
          <div className="post-card-container relative rounded-[2.5rem] bg-slate-950 border border-purple-500/30 overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between p-6">
            {filteredPosts.length > 0 ? (
              <AnimatePresence mode="wait">
                {(() => {
                  const post = filteredPosts[reelsActiveIndex % filteredPosts.length];
                  const myVote = post.userVotes?.[currentUser.uid];

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 60, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: -60, scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                      className="space-y-6 flex-1 flex flex-col justify-between"
                    >
                      {/* Reels Top Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-noor-emerald/20 text-noor-emerald flex items-center justify-center font-black text-base border border-noor-emerald/30">
                            {post.user[0]}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                              {post.user}
                              {post.privacy === 'friends' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                                  👥 Friends
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black">
                                  🌐 Public
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <Clock size={10} className="text-slate-500" />
                              <span className="text-slate-300 font-semibold">{formatTimeAgo(post.time)}</span>
                              <span>•</span>
                              <span className="text-noor-emerald font-bold">{post.category}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            {(reelsActiveIndex % filteredPosts.length) + 1} / {filteredPosts.length}
                          </span>
                          <button
                            onClick={() => handleReportPost(post.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Report Post to Moderation"
                          >
                            <Flag size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Reels Media / Content Canvas */}
                      <div 
                        onDoubleClick={() => handleDoubleTapLike(post.id)}
                        className={`p-8 rounded-[2rem] border relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] text-center cursor-pointer ${
                          post.bgStyle && post.bgStyle !== 'default' 
                            ? post.bgStyle 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {post.image ? (
                          <div 
                            className="w-full relative group/reelimg cursor-pointer"
                            onClick={() => openPostMediaLightbox(post)}
                            title="Click to expand reel visual"
                          >
                            <img 
                              src={post.image} 
                              alt="Reel visual" 
                              className="w-full max-h-64 object-cover rounded-2xl shadow-xl group-hover/reelimg:scale-[1.01] transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/reelimg:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-1 text-white text-xs font-bold backdrop-blur-[1px]">
                              <span>Expand Visual</span>
                            </div>
                          </div>
                        ) : (
                          <ExpandableParagraph
                            text={post.content}
                            maxWords={15}
                            isQuote={true}
                            className="text-xl md:text-2xl font-black text-white italic leading-relaxed tracking-wide"
                            readMoreColor="text-emerald-300 hover:text-emerald-200 bg-black/40 px-2.5 py-1 rounded-xl border border-white/20 not-italic inline-block mt-3"
                          />
                        )}

                        {post.caption && (
                          <div className="mt-3">
                            <ExpandableParagraph
                              text={post.caption}
                              maxWords={15}
                              className="text-xs text-slate-300 font-medium"
                              readMoreColor="text-emerald-400 hover:text-emerald-300"
                            />
                          </div>
                        )}

                        {/* Double tap heart explosion */}
                        <AnimatePresence>
                          {heartPops[post.id] && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.3 }}
                              animate={{ opacity: 1, scale: 1.4 }}
                              exit={{ opacity: 0, scale: 1.8 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-20"
                            >
                              <Heart className="text-red-500 fill-red-500 w-24 h-24 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Reels Navigation & Action Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(post.id, 'support')}
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                              myVote === 'support'
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                : 'bg-white/5 text-slate-300 hover:text-red-400'
                            }`}
                          >
                            <Heart size={15} className={myVote === 'support' ? 'fill-white' : ''} />
                            <span>{post.supportCount}</span>
                          </button>
                          
                          <button
                            onClick={() => toggleBookmark(post.id)}
                            className={`p-2 rounded-xl border transition-all ${
                              bookmarkedPosts[post.id]
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-white/5 text-slate-400 border-white/5'
                            }`}
                          >
                            <Bookmark size={15} />
                          </button>

                          <button
                            onClick={() => handleSharePost(post)}
                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-400 border border-white/5 transition-all cursor-pointer"
                            title="Share reflection outside app"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>

                        {/* Next / Previous Swipe Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playHapticAudio('swipe');
                              setReelsActiveIndex(prev => Math.max(0, prev - 1));
                            }}
                            disabled={reelsActiveIndex === 0}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 disabled:opacity-30 cursor-pointer"
                            title="Previous Noor Card"
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            onClick={() => {
                              playHapticAudio('swipe');
                              setReelsActiveIndex(prev => prev + 1);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
                            title="Next Noor Card"
                          >
                            <span>Next</span>
                            <ChevronDown size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm font-bold">No reflections in this category yet.</p>
              </div>
            )}
          </div>
        )}

        {/* 🌟 2. STANDARD FEED STREAM WITH ANIMATED TRANSITIONS & SWIPE PHYSICS */}
        {feedViewMode === 'stream' && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.length === 0 && !loading ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel border-white/10 rounded-[2.5rem] p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-noor-emerald/10 text-noor-emerald mx-auto flex items-center justify-center">
                    <Sparkles size={32} />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="text-lg font-black text-white">No reflections in this filter yet</h4>
                    <p className="text-xs text-slate-400 font-medium">Be the first to share your thoughts, story, or photo with the Ummah!</p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-noor-emerald to-teal-500 text-slate-950 rounded-xl text-xs font-black transition-all uppercase tracking-wider shadow-lg shadow-noor-emerald/20 cursor-pointer"
                  >
                    + Share First Reflection
                  </button>
                </motion.div>
              ) : (
                filteredPosts.map((post) => {
                  const myVote = post.userVotes?.[currentUser.uid];
                  const myPollSelection = post.poll?.userSelections?.[currentUser.uid];
                  const isBookmarked = !!bookmarkedPosts[post.id];
                  const areCommentsExpanded = expandedCommentsPostId === post.id;

                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 35, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-40px" }}
                      exit={{ opacity: 0, scale: 0.92, y: -20 }}
                      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 90) {
                          // Swiped right -> Like
                          handleVote(post.id, 'support');
                          setDragActionNotice({ id: post.id, action: 'like' });
                          setTimeout(() => setDragActionNotice(null), 1500);
                        } else if (info.offset.x < -90) {
                          // Swiped left -> Bookmark
                          toggleBookmark(post.id);
                          setDragActionNotice({ id: post.id, action: 'bookmark' });
                          setTimeout(() => setDragActionNotice(null), 1500);
                        }
                      }}
                      className={`post-card-container relative group overflow-hidden rounded-[2.5rem] border transition-all duration-300 ${
                        post.isFlagged
                          ? 'glass-panel border-red-500/20 bg-red-500/5'
                          : 'glass-panel border-white/10 hover:border-noor-emerald/30 shadow-xl'
                      }`}
                    >
                      {/* Swipe Visual Feedback Indicator */}
                      <AnimatePresence>
                        {dragActionNotice?.id === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-white text-[10px] font-black flex items-center gap-1.5 shadow-xl"
                          >
                            {dragActionNotice.action === 'like' ? (
                              <>
                                <Heart size={12} className="text-red-500 fill-red-500" />
                                <span>Swiped & Liked!</span>
                              </>
                            ) : (
                              <>
                                <Bookmark size={12} className="text-amber-400 fill-amber-400" />
                                <span>Saved to Bookmarks!</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="p-6 md:p-8 space-y-5">
                        {/* Header: User, Privacy Badge, Timestamp & Top-Right Report Flag */}
                        <div className="flex items-center justify-between relative">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner border border-white/5 ${
                              post.isScholar ? 'bg-noor-gold/15 text-noor-gold' : 'bg-noor-emerald/15 text-noor-emerald'
                            }`}>
                              {post.user ? post.user[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-white text-sm">{post.user}</h4>
                                {post.isScholar && (
                                  <span className="px-2 py-0.5 bg-noor-gold/20 text-noor-gold rounded-full text-[8px] font-black uppercase tracking-widest">
                                    Scholar
                                  </span>
                                )}
                                {post.isVerified && <CheckCircle2 size={14} className="text-noor-emerald" />}
                                
                                {/* Privacy Badge */}
                                {post.privacy === 'friends' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[8px] font-black uppercase flex items-center gap-1">
                                    <Users size={10} className="text-amber-400" /> Friends
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[8px] font-black uppercase flex items-center gap-1">
                                    <Globe size={10} className="text-emerald-400" /> Public
                                  </span>
                                )}
                              </div>
                              
                              {/* 🌟 Human-readable 'time ago' timestamp clearly below author name */}
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                                <Clock size={11} className="text-slate-500 shrink-0" />
                                <span className="font-semibold text-slate-300">{formatTimeAgo(post.time)}</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[10px] font-black text-noor-emerald uppercase tracking-wider">{post.category}</span>
                              </div>
                            </div>
                          </div>

                          {/* Top-Right Actions: Direct Report Flag Button & Options Menu */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReportPost(post.id)}
                              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Report Post to Moderation"
                            >
                              <Flag size={16} />
                            </button>

                            <div className="relative">
                              <button
                                onClick={() => setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)}
                                className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              <AnimatePresence>
                                {openPostMenuId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-10 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl z-30 py-2 divide-y divide-white/5"
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          handleCopyContent(post.id, post.content);
                                          setOpenPostMenuId(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left"
                                      >
                                        {copiedPostId === post.id ? <Check size={14} className="text-noor-emerald" /> : <Copy size={14} />}
                                        <span>{copiedPostId === post.id ? 'Copied' : 'Copy Reflection'}</span>
                                      </button>
                                    </div>

                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setOpenPostMenuId(null);
                                          handleDeletePost(post.id);
                                        }}
                                        className="w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors text-left font-medium"
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete Post</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setOpenPostMenuId(null);
                                          handleReportPost(post.id);
                                        }}
                                        className="w-full px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors text-left font-medium"
                                      >
                                        <Flag size={14} />
                                        <span>Report Content</span>
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {/* Post Visual Body with Double-Tap Heart Trigger & Scale-Up Icon */}
                        <div 
                          onDoubleClick={() => handleDoubleTapLike(post.id)}
                          onTouchEnd={() => handleContentTouch(post.id)}
                          className="space-y-4 relative select-none cursor-pointer group/body"
                        >
                          {/* Heart Pop Overlay with Dynamic Scale-Up Effect */}
                          <AnimatePresence>
                            {heartPops[post.id] && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.2, rotate: -12 }}
                                animate={{ 
                                  opacity: [0, 1, 1, 0],
                                  scale: [0.2, 1.45, 1.25, 1.6],
                                  rotate: [-12, 0, 6, 0],
                                  y: [0, -10, -22, -38]
                                }}
                                exit={{ opacity: 0, scale: 1.8 }}
                                transition={{ duration: 0.85, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                              >
                                <div className="relative flex items-center justify-center">
                                  <motion.div
                                    initial={{ scale: 0.5, opacity: 0.9 }}
                                    animate={{ scale: 2.2, opacity: 0 }}
                                    transition={{ duration: 0.75, ease: "easeOut" }}
                                    className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-red-500/50 to-pink-500/50 blur-lg"
                                  />
                                  <Heart className="text-red-500 fill-red-500 w-24 h-24 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)] stroke-[2.5]" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {post.bgStyle && post.bgStyle !== 'default' && !post.image ? (
                            <div 
                              className={`p-8 sm:p-10 rounded-[2rem] border border-white/10 ${post.bgStyle} flex flex-col items-center justify-center min-h-[200px] text-center relative group shadow-xl overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-white/[0.02] bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                              <ExpandableParagraph
                                text={post.content}
                                maxWords={15}
                                isQuote={true}
                                className="text-lg sm:text-2xl font-black italic leading-relaxed tracking-wide drop-shadow-md relative z-10 max-w-md"
                                readMoreColor="text-white bg-black/40 hover:bg-black/60 px-2.5 py-1 rounded-xl border border-white/20 not-italic inline-block mt-2"
                              />
                            </div>
                          ) : (
                            <ExpandableParagraph
                              text={post.content}
                              maxWords={15}
                              className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium"
                              readMoreColor="text-noor-emerald hover:text-emerald-300 bg-noor-emerald/10 hover:bg-noor-emerald/20 px-2 py-0.5 rounded-lg border border-noor-emerald/20"
                            />
                          )}

                          {/* Image Attachment with High-Craft Lightbox Expansion */}
                          {post.image && (
                            <div 
                              onClick={() => openPostMediaLightbox(post)}
                              className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group bg-black cursor-pointer"
                              title="Click to view & expand photo"
                            >
                              <img
                                src={post.image}
                                alt="Reflection visual"
                                className={`w-full max-h-[420px] object-cover transition-all group-hover:scale-[1.01] duration-300 ${
                                  post.filterPreset === 'warm' ? 'sepia-[0.25] saturate-125' :
                                  post.filterPreset === 'emerald' ? 'hue-rotate-15 contrast-105' :
                                  post.filterPreset === 'golden' ? 'brightness-105 saturate-150' :
                                  post.filterPreset === 'bw' ? 'grayscale contrast-125' : ''
                                }`}
                              />

                              {/* Hover expansion banner */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 pointer-events-none">
                                <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                                  <Sparkles size={13} className="text-amber-300" />
                                  <span>Tap to Expand Fullscreen</span>
                                </span>
                              </div>

                              {post.caption && (
                                <div className="p-3 bg-slate-900/90 border-t border-white/10 text-xs text-slate-300 font-medium">
                                  <ExpandableParagraph
                                    text={post.caption}
                                    maxWords={15}
                                    className="text-xs text-slate-300 font-medium"
                                    readMoreColor="text-noor-emerald hover:text-emerald-300"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Poll Card */}
                          {post.poll && (
                            <div className="space-y-2.5 bg-white/5 p-5 rounded-[2rem] border border-white/5">
                              {post.poll.options.map((opt) => {
                                const percentage = post.poll!.totalVotes > 0 
                                  ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                                  : 0;
                                const isSelected = myPollSelection === opt.id;

                                return (
                                  <button
                                    key={opt.id}
                                    disabled={!!myPollSelection}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePollVote(post.id, opt.id);
                                    }}
                                    className="w-full relative h-11 rounded-xl overflow-hidden group/poll border border-white/10 hover:border-noor-gold/30 transition-all text-left cursor-pointer"
                                  >
                                    <div 
                                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ${isSelected ? 'bg-noor-gold/25' : 'bg-noor-emerald/15'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                    <div className="relative px-4 h-full flex items-center justify-between">
                                      <span className={`text-xs font-bold ${isSelected ? 'text-noor-gold' : 'text-white'}`}>
                                        {opt.text}
                                      </span>
                                      {myPollSelection && (
                                        <span className="text-[10px] font-black text-slate-400">{percentage}%</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                              {myPollSelection && (
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                  {post.poll.totalVotes} total responses
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Interactive Actions Footer */}
                        <div className="pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              animate={{ scale: myVote === 'support' || heartPops[post.id] ? [1, 1.3, 1] : 1 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              onClick={() => handleVote(post.id, 'support')}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer ${
                                myVote === 'support' 
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-md' 
                                  : 'text-slate-400 hover:text-red-400'
                              }`}
                            >
                              <Heart size={15} className={myVote === 'support' ? 'fill-red-500 text-red-500' : ''} />
                              <span>{post.supportCount}</span>
                            </motion.button>

                            <button
                              onClick={() => handleVote(post.id, 'reconsider')}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer ${
                                myVote === 'reconsider' 
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                                  : 'text-slate-400 hover:text-amber-400'
                              }`}
                              title="Reconsider / feedback"
                            >
                              <ArrowDown size={14} />
                              <span>{post.reconsiderCount}</span>
                            </button>

                            <div className="w-px h-5 bg-white/10 mx-1" />

                            <button
                              onClick={() => setExpandedCommentsPostId(areCommentsExpanded ? null : post.id)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                                areCommentsExpanded 
                                  ? 'bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/40 shadow-sm shadow-noor-emerald/10' 
                                  : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                              }`}
                              title={areCommentsExpanded ? "Hide spiritual comments" : "View spiritual comments"}
                            >
                              <MessageCircle size={15} className={areCommentsExpanded ? "fill-noor-emerald/20 text-noor-emerald" : ""} />
                              <span>{(post.comments || []).reduce((acc, c) => acc + 1 + ((c.replies && c.replies.length) || 0), 0)}</span>
                              <span className="hidden sm:inline text-[9px] capitalize font-medium">{areCommentsExpanded ? 'Hide' : 'Reflect'}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(post.id)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isBookmarked ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                              }`}
                              title="Bookmark post"
                            >
                              <Bookmark size={16} className={isBookmarked ? 'fill-amber-400' : ''} />
                            </button>

                            {/* 🌟 Native Device Share Button */}
                            <button
                              onClick={() => handleSharePost(post)}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                              title="Share reflection outside app"
                            >
                              <Share2 size={16} />
                              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Share</span>
                            </button>
                          </div>
                        </div>

                        {/* 🌟 Threaded Comments Drawer - Hidden by default until tapped */}
                        <AnimatePresence>
                          {areCommentsExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-white/5 space-y-4"
                            >
                              {/* Thread Notification Subscription Pill */}
                              {((post.comments || []).some(c => c.userId === currentUser?.uid || (c.replies || []).some(r => r.userId === currentUser?.uid)) || post.userId === currentUser?.uid) && (
                                <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                                  <div className="flex items-center gap-2">
                                    <Bell size={12} className="text-emerald-400 animate-pulse" />
                                    <span>Spiritual Thread Active &bull; Reply Alerts Enabled</span>
                                  </div>
                                  <span className="text-[9px] font-bold text-emerald-400/80 lowercase italic font-sans">
                                    tracking blessings
                                  </span>
                                </div>
                              )}

                              {/* Comment List */}
                              {(post.comments && post.comments.length > 0) ? (
                                <div className="space-y-3.5">
                                  {post.comments.map((comment) => {
                                    const isAuthorOrScholar = currentUser?.uid === post.userId || isAdmin || isScholarMode;
                                    const userHasAmeen = comment.userReactions?.[currentUser?.uid] === 'ameen';
                                    const userHasHeart = comment.userReactions?.[currentUser?.uid] === 'heart' || comment.userReactions?.[currentUser?.uid] === 'like';
                                    
                                    const isScholarComment = comment.userRole === 'scholar' || comment.user.toLowerCase().includes('dr.') || comment.user.toLowerCase().includes('sheikh') || comment.user.toLowerCase().includes('ustad');
                                    const isHafizComment = comment.userRole === 'hafiz' || comment.user.toLowerCase().includes('hafiz');
                                    const isImamComment = comment.userRole === 'imam' || comment.user.toLowerCase().includes('imam');
                                    const isContributor = comment.userRole === 'contributor';

                                    return (
                                      <div key={comment.id} className="space-y-2">
                                        {/* Top-Level Root Comment */}
                                        <div className={`flex items-start gap-3 group/comment relative p-3.5 rounded-2xl border transition-all ${
                                          comment.isPinned 
                                            ? 'bg-amber-500/[0.06] border-amber-500/30 shadow-md shadow-amber-500/5' 
                                            : 'bg-white/[0.025] hover:bg-white/[0.045] border-white/5'
                                        }`}>
                                          {/* Avatar with Role Aura */}
                                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border relative ${
                                            isScholarComment 
                                              ? 'bg-gradient-to-br from-amber-500/30 to-amber-700/30 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                                              : isHafizComment
                                              ? 'bg-gradient-to-br from-emerald-500/30 to-teal-700/30 text-emerald-300 border-emerald-500/40'
                                              : 'bg-gradient-to-br from-teal-500/20 to-slate-800 text-teal-300 border-white/10'
                                          }`}>
                                            {comment.user ? comment.user[0].toUpperCase() : 'U'}
                                            {comment.isPinned && (
                                              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                                                <Pin size={9} className="fill-slate-950" />
                                              </span>
                                            )}
                                          </div>

                                          {/* Comment Content & Metadata */}
                                          <div className="flex-1 space-y-1.5 min-w-0">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-black text-white">{comment.user}</span>
                                                
                                                {/* Role & Verification Badges */}
                                                {isScholarComment && (
                                                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <GraduationCap size={10} />
                                                    <span>Scholar</span>
                                                  </span>
                                                )}
                                                {isHafizComment && (
                                                  <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <BookOpen size={10} />
                                                    <span>Hafiz</span>
                                                  </span>
                                                )}
                                                {isImamComment && (
                                                  <span className="text-[9px] font-black text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <ShieldCheck size={10} />
                                                    <span>Imam</span>
                                                  </span>
                                                )}
                                                {isContributor && (
                                                  <span className="text-[9px] font-bold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Sparkles size={9} />
                                                    <span>Contributor</span>
                                                  </span>
                                                )}

                                                {comment.isPinned && (
                                                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <Pin size={9} className="fill-amber-300" />
                                                    <span>Pinned Reflection</span>
                                                  </span>
                                                )}

                                                <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                                                  <Clock size={9} />
                                                  <span>{formatTimeAgo(comment.time)}</span>
                                                </span>
                                              </div>

                                              {/* Actions menu for comment */}
                                              <div className="flex items-center gap-1">
                                                {/* Copy Button */}
                                                <button
                                                  onClick={() => handleCopyCommentText(comment.id, comment.text)}
                                                  className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                                  title="Copy reflection"
                                                >
                                                  {copiedCommentId === comment.id ? (
                                                    <Check size={12} className="text-noor-emerald" />
                                                  ) : (
                                                    <Copy size={12} />
                                                  )}
                                                </button>

                                                {/* Pin Button for Post Author or Admin */}
                                                {isAuthorOrScholar && (
                                                  <button
                                                    onClick={() => handleTogglePinComment(post.id, comment.id)}
                                                    className={`p-1 transition-colors cursor-pointer ${
                                                      comment.isPinned ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover/comment:opacity-100'
                                                    }`}
                                                    title={comment.isPinned ? "Unpin reflection" : "Pin reflection to top"}
                                                  >
                                                    <Pin size={12} className={comment.isPinned ? "fill-amber-400" : ""} />
                                                  </button>
                                                )}

                                                {/* Delete Button */}
                                                {(comment.userId === currentUser?.uid || isAdmin || isScholarMode) && (
                                                  <button
                                                    onClick={() => handleDeleteComment(post.id, comment.id)}
                                                    className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                                                    title="Delete comment"
                                                  >
                                                    <Trash2 size={12} />
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {/* Comment Text */}
                                            <p className="text-xs text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">{comment.text}</p>

                                            {/* 🌟 Attached Spiritual Activity Photo */}
                                            {comment.imageUrl && (
                                              <div className="mt-2.5 max-w-sm rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500/40 bg-black/40 group/cimg relative transition-all shadow-md">
                                                <div 
                                                  onClick={() => openCommentMediaLightbox(comment.imageUrl!, comment.user, comment.imageCaption, comment.text)}
                                                  className="cursor-pointer relative overflow-hidden group/zoom"
                                                >
                                                  <img 
                                                    src={comment.imageUrl} 
                                                    alt={comment.imageCaption || "Spiritual activity"} 
                                                    className="w-full max-h-56 object-cover group-hover/zoom:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                  />
                                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-end p-2.5 justify-between">
                                                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                                                      <Eye size={12} className="text-emerald-400" />
                                                      <span>Tap to view photo</span>
                                                    </span>
                                                    <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                      Spiritual Activity
                                                    </span>
                                                  </div>
                                                </div>
                                                {comment.imageCaption && (
                                                  <div className="px-2.5 py-1.5 bg-white/[0.03] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-300">
                                                    <span className="truncate italic font-medium">{comment.imageCaption}</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            
                                            {/* Islamic Interactive Reactions & Reply Bar */}
                                            <div className="pt-2 flex items-center gap-2 flex-wrap">
                                              {/* Ameen Reaction Button */}
                                              <button
                                                onClick={() => handleCommentReaction(post.id, comment.id, 'ameen')}
                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                                  userHasAmeen
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 scale-105'
                                                    : 'bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border border-white/5'
                                                }`}
                                                title="Say Ameen / Support reflection (+5 Hasanat)"
                                              >
                                                <span>🤲</span>
                                                <span>Ameen</span>
                                                {(comment.ameens || 0) > 0 && (
                                                  <span className="font-sans font-bold text-[9px] opacity-90">({comment.ameens})</span>
                                                )}
                                              </button>

                                              {/* Noor Heart Reaction Button */}
                                              <button
                                                onClick={() => handleCommentReaction(post.id, comment.id, 'heart')}
                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                                                  userHasHeart
                                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20 scale-105'
                                                    : 'bg-white/5 hover:bg-rose-500/10 text-slate-300 hover:text-rose-300 border border-white/5'
                                                }`}
                                                title="Send Noor / Heart (+5 Hasanat)"
                                              >
                                                <Heart size={11} className={userHasHeart ? 'fill-rose-400 text-rose-400' : ''} />
                                                <span>Noor</span>
                                                {((comment.hearts || comment.likes || 0) > 0) && (
                                                  <span className="font-sans font-bold text-[9px] opacity-90">({comment.hearts || comment.likes})</span>
                                                )}
                                              </button>

                                              {/* Reply Action Button */}
                                              <button
                                                onClick={() => {
                                                  if (replyingTo?.commentId === comment.id) {
                                                    setReplyingTo(null);
                                                    setReplyText('');
                                                  } else {
                                                    setReplyingTo({
                                                      postId: post.id,
                                                      parentCommentId: comment.id,
                                                      commentId: comment.id,
                                                      userName: comment.user
                                                    });
                                                    setReplyText('');
                                                  }
                                                }}
                                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                                                  replyingTo?.commentId === comment.id
                                                    ? 'bg-noor-emerald text-slate-950 font-black'
                                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-noor-emerald border border-white/5'
                                                }`}
                                              >
                                                <MessageSquare size={11} />
                                                <span>Reply</span>
                                                {comment.replies && comment.replies.length > 0 && (
                                                  <span className="text-[9px] opacity-80">({comment.replies.length})</span>
                                                )}
                                              </button>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Threaded Nested Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                          <div className="ml-5 sm:ml-8 pl-3 border-l-2 border-emerald-500/30 space-y-2 mt-2">
                                            {comment.replies.map((reply) => {
                                              const userHasReplyAmeen = reply.userReactions?.[currentUser?.uid] === 'ameen';
                                              const userHasReplyHeart = reply.userReactions?.[currentUser?.uid] === 'heart' || reply.userReactions?.[currentUser?.uid] === 'like';
                                              const isScholarReply = reply.userRole === 'scholar' || reply.user.toLowerCase().includes('dr.') || reply.user.toLowerCase().includes('sheikh') || reply.user.toLowerCase().includes('ustad');

                                              return (
                                                <div key={reply.id} className="flex items-start gap-2.5 group/reply bg-white/[0.02] hover:bg-white/[0.035] p-3 rounded-xl border border-white/5 transition-all">
                                                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-black shrink-0 border border-teal-500/30">
                                                    {reply.user ? reply.user[0].toUpperCase() : 'U'}
                                                  </div>
                                                  <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                                      <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[11px] font-black text-white">{reply.user}</span>
                                                        {isScholarReply && (
                                                          <span className="text-[8px] font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                                            Scholar
                                                          </span>
                                                        )}
                                                        {reply.replyToUser && (
                                                          <span className="text-[9px] font-bold text-noor-emerald bg-noor-emerald/10 px-1.5 py-0.2 rounded-md">
                                                            @{reply.replyToUser}
                                                          </span>
                                                        )}
                                                        <span className="text-[8px] text-slate-500 font-semibold">
                                                          {formatTimeAgo(reply.time)}
                                                        </span>
                                                      </div>
                                                      <div className="flex items-center gap-1">
                                                        <button
                                                          onClick={() => handleCopyCommentText(reply.id, reply.text)}
                                                          className="p-0.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                                                          title="Copy reply"
                                                        >
                                                          {copiedCommentId === reply.id ? <Check size={10} className="text-noor-emerald" /> : <Copy size={10} />}
                                                        </button>
                                                        {(reply.userId === currentUser?.uid || isAdmin || isScholarMode) && (
                                                          <button
                                                            onClick={() => handleDeleteComment(post.id, reply.id, comment.id)}
                                                            className="opacity-0 group-hover/reply:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                                                            title="Delete reply"
                                                          >
                                                            <Trash2 size={11} />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                    <p className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">{reply.text}</p>

                                                    {/* 🌟 Attached Photo in Reply */}
                                                    {reply.imageUrl && (
                                                      <div className="mt-2 max-w-xs rounded-lg overflow-hidden border border-white/10 hover:border-emerald-500/40 bg-black/30 group/rimg relative transition-all shadow-sm">
                                                        <div 
                                                          onClick={() => openCommentMediaLightbox(reply.imageUrl!, reply.user, reply.imageCaption, reply.text)}
                                                          className="cursor-pointer relative overflow-hidden group/zoom"
                                                        >
                                                          <img 
                                                            src={reply.imageUrl} 
                                                            alt={reply.imageCaption || "Spiritual activity"} 
                                                            className="w-full max-h-40 object-cover group-hover/zoom:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer"
                                                          />
                                                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/zoom:opacity-100 transition-opacity flex items-end p-2 justify-between">
                                                            <span className="text-[9px] font-bold text-white flex items-center gap-1">
                                                              <Eye size={11} className="text-emerald-400" />
                                                              <span>Expand</span>
                                                            </span>
                                                          </div>
                                                        </div>
                                                        {reply.imageCaption && (
                                                          <div className="px-2 py-1 bg-white/[0.02] border-t border-white/5 text-[9px] text-slate-400 truncate italic">
                                                            {reply.imageCaption}
                                                          </div>
                                                        )}
                                                      </div>
                                                    )}
                                                    
                                                    {/* Nested Reply Action Bar with Reactions */}
                                                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                                                      <button
                                                        onClick={() => handleCommentReaction(post.id, reply.id, 'ameen', comment.id)}
                                                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                                          userHasReplyAmeen
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black'
                                                            : 'bg-white/5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-300'
                                                        }`}
                                                      >
                                                        <span>🤲</span>
                                                        <span>Ameen</span>
                                                        {(reply.ameens || 0) > 0 && <span>({reply.ameens})</span>}
                                                      </button>

                                                      <button
                                                        onClick={() => handleCommentReaction(post.id, reply.id, 'heart', comment.id)}
                                                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                                          userHasReplyHeart
                                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black'
                                                            : 'bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300'
                                                        }`}
                                                      >
                                                        <Heart size={9} className={userHasReplyHeart ? 'fill-rose-400 text-rose-400' : ''} />
                                                        {(reply.hearts || reply.likes || 0) > 0 && <span>({reply.hearts || reply.likes})</span>}
                                                      </button>

                                                      <button
                                                        onClick={() => {
                                                          setReplyingTo({
                                                            postId: post.id,
                                                            parentCommentId: comment.id,
                                                            commentId: reply.id,
                                                            userName: reply.user
                                                          });
                                                          setReplyText('');
                                                        }}
                                                        className="text-[9px] font-black text-slate-400 hover:text-noor-emerald flex items-center gap-1 cursor-pointer transition-colors px-1"
                                                      >
                                                        <MessageSquare size={10} />
                                                        <span>Reply</span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}

                                        {/* Inline Threaded Reply Composer with Islamic Quick Chips & Photo Attachment */}
                                        {replyingTo?.postId === post.id && replyingTo?.parentCommentId === comment.id && (
                                          <motion.div 
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="ml-5 sm:ml-8 pl-3 border-l-2 border-emerald-500/40 mt-2 space-y-2"
                                          >
                                            <div className="flex items-center justify-between text-[10px] font-black text-noor-emerald bg-noor-emerald/10 px-2.5 py-1 rounded-lg">
                                              <span className="flex items-center gap-1.5">
                                                <span>Replying in thread to</span>
                                                <strong className="text-white">@{replyingTo.userName}</strong>
                                              </span>
                                              <button 
                                                onClick={() => {
                                                  setReplyingTo(null);
                                                  setReplyText('');
                                                  setReplyImageAttachment(null);
                                                  setActivePhotoPicker(null);
                                                }}
                                                className="text-slate-400 hover:text-white cursor-pointer"
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>

                                            {/* Attached Photo Preview in Reply */}
                                            {replyImageAttachment?.commentId === comment.id && (
                                              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                                <img 
                                                  src={replyImageAttachment.imageUrl} 
                                                  alt="Attachment" 
                                                  className="w-10 h-10 rounded-lg object-cover border border-white/10"
                                                />
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-[10px] font-bold text-white truncate">{replyImageAttachment.caption}</p>
                                                  <span className="text-[8px] text-emerald-400 font-semibold">+15 Hasanat attached</span>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => setReplyImageAttachment(null)}
                                                  className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                                                >
                                                  <X size={12} />
                                                </button>
                                              </div>
                                            )}

                                            {/* Quick Islamic Reaction Pills for Reply */}
                                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                              {QUICK_ISLAMIC_REACTIONS.slice(0, 4).map((r, i) => (
                                                <button
                                                  key={i}
                                                  type="button"
                                                  onClick={() => handleInsertQuickReaction(post.id, r.text, true)}
                                                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-[9px] font-bold text-slate-300 hover:text-emerald-300 transition-all shrink-0 cursor-pointer"
                                                >
                                                  {r.label}
                                                </button>
                                              ))}
                                            </div>

                                            <div className="flex gap-2">
                                              {/* Photo picker trigger for reply */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (activePhotoPicker?.commentId === comment.id) {
                                                    setActivePhotoPicker(null);
                                                  } else {
                                                    setActivePhotoPicker({ postId: post.id, commentId: comment.id, isReply: true });
                                                  }
                                                }}
                                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                                                  replyImageAttachment?.commentId === comment.id 
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-emerald-300 border border-white/10'
                                                }`}
                                                title="Add spiritual activity photo (+15 Hasanat)"
                                              >
                                                <Camera size={13} />
                                              </button>

                                              <input
                                                autoFocus
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter') handleCommentSubmit(post.id, comment.id, replyingTo.userName);
                                                }}
                                                placeholder={`Write a reply to @${replyingTo.userName}...`}
                                                className="flex-1 bg-white/5 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-noor-emerald"
                                              />
                                              <button
                                                onClick={() => handleCommentSubmit(post.id, comment.id, replyingTo.userName)}
                                                disabled={!replyText.trim() && !(replyImageAttachment?.commentId === comment.id)}
                                                className="px-3.5 py-2 bg-noor-emerald text-slate-950 font-black rounded-xl text-xs disabled:opacity-30 active:scale-95 transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-noor-emerald/20 shrink-0"
                                              >
                                                <Send size={12} />
                                                <span>Reply</span>
                                              </button>
                                            </div>

                                            {/* Photo Selection Tool Drawer for Reply */}
                                            {activePhotoPicker?.postId === post.id && activePhotoPicker?.commentId === comment.id && activePhotoPicker?.isReply && (
                                              <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-2.5 backdrop-blur-md"
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                                                    <Camera size={12} className="text-emerald-400" />
                                                    <span>Attach Spiritual Activity Photo</span>
                                                  </span>
                                                  <button
                                                    type="button"
                                                    onClick={() => setActivePhotoPicker(null)}
                                                    className="text-slate-400 hover:text-white"
                                                  >
                                                    <X size={12} />
                                                  </button>
                                                </div>

                                                {/* Preset Gallery */}
                                                <div className="grid grid-cols-4 gap-1.5">
                                                  {SPIRITUAL_COMMENT_IMAGE_PRESETS.slice(0, 4).map((preset, pIdx) => (
                                                    <button
                                                      key={pIdx}
                                                      type="button"
                                                      onClick={() => handleSelectPresetPhoto(preset, post.id, comment.id, true)}
                                                      className="group/preset relative rounded-lg overflow-hidden border border-white/10 hover:border-emerald-400 aspect-square cursor-pointer transition-all"
                                                    >
                                                      <img src={preset.url} alt={preset.caption} className="w-full h-full object-cover group-hover/preset:scale-110 transition-transform" />
                                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preset:opacity-100 flex items-center justify-center p-1 text-[8px] font-bold text-white text-center">
                                                        {preset.label}
                                                      </div>
                                                    </button>
                                                  ))}
                                                </div>

                                                {/* Upload option */}
                                                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                                  <label className="flex-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold text-center cursor-pointer transition-colors flex items-center justify-center gap-1">
                                                    <Upload size={10} />
                                                    <span>Upload Photo</span>
                                                    <input
                                                      type="file"
                                                      accept="image/*"
                                                      className="hidden"
                                                      onChange={(e) => {
                                                        const f = e.target.files?.[0];
                                                        if (f) handleCommentPhotoFile(f, post.id, comment.id, true);
                                                      }}
                                                    />
                                                  </label>
                                                </div>
                                              </motion.div>
                                            )}
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1">
                                  <p className="text-xs font-bold text-slate-300">No reflections yet on this post</p>
                                  <p className="text-[10px] text-slate-500">Be the first to share your spiritual insight, advice, or say Ameen 🤲</p>
                                </div>
                              )}

                              {/* Main Root Comment Composer */}
                              <div className="space-y-2 pt-2 border-t border-white/5">
                                {/* Attached Spiritual Activity Photo Preview in Root Composer */}
                                {commentImageAttachment?.postId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-md shadow-emerald-500/5"
                                  >
                                    <img 
                                      src={commentImageAttachment.imageUrl} 
                                      alt="Attachment" 
                                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded uppercase tracking-wider">
                                          Photo Ready
                                        </span>
                                        <span className="text-[9px] font-bold text-emerald-400">+15 Hasanat</span>
                                      </div>
                                      <p className="text-xs font-bold text-white truncate mt-0.5">{commentImageAttachment.caption}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setCommentImageAttachment(null)}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                                      title="Remove photo"
                                    >
                                      <X size={14} />
                                    </button>
                                  </motion.div>
                                )}

                                {/* Quick Islamic Reflection Chips */}
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest shrink-0 mr-1 flex items-center gap-1">
                                    <Sparkles size={10} className="text-amber-400" />
                                    <span>Quick Dua:</span>
                                  </span>
                                  {QUICK_ISLAMIC_REACTIONS.map((r, i) => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => handleInsertQuickReaction(post.id, r.text, false)}
                                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 text-[10px] font-bold text-slate-300 hover:text-emerald-300 transition-all shrink-0 cursor-pointer active:scale-95"
                                    >
                                      {r.label}
                                    </button>
                                  ))}
                                </div>

                                {/* Islamic Calligraphy & Symbols Bar Toggle + Photo Tool Action Bar */}
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => setActiveIslamicToolbarPostId(activeIslamicToolbarPostId === post.id ? null : post.id)}
                                      className="text-[10px] font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Sparkles size={11} className="text-amber-400" />
                                      <span>{activeIslamicToolbarPostId === post.id ? "Hide Calligraphy Symbols" : "Islamic Symbols (ﷺ, ﷻ, 🤲)"}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (activePhotoPicker?.postId === post.id && !activePhotoPicker?.isReply) {
                                          setActivePhotoPicker(null);
                                        } else {
                                          setActivePhotoPicker({ postId: post.id, isReply: false });
                                        }
                                      }}
                                      className={`text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                                        activePhotoPicker?.postId === post.id && !activePhotoPicker?.isReply 
                                          ? 'text-noor-emerald font-black' 
                                          : 'text-slate-400 hover:text-emerald-300'
                                      }`}
                                    >
                                      <Camera size={11} className="text-emerald-400" />
                                      <span>{activePhotoPicker?.postId === post.id && !activePhotoPicker?.isReply ? "Close Photo Tool" : "Add Spiritual Photo"}</span>
                                    </button>
                                  </div>

                                  <span className="text-[9px] font-bold text-emerald-400/80 flex items-center gap-1">
                                    <span>+10 Hasanat</span>
                                    <Sparkles size={9} />
                                  </span>
                                </div>

                                {activeIslamicToolbarPostId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                  >
                                    {ISLAMIC_CALLIGRAPHY_SYMBOLS.map((sym, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleInsertSymbol(post.id, sym.symbol, false)}
                                        title={sym.label}
                                        className="px-2 py-1 rounded-lg bg-black/40 hover:bg-amber-500/30 border border-white/10 hover:border-amber-500/40 text-xs font-bold text-amber-200 hover:text-amber-100 transition-all shrink-0 cursor-pointer active:scale-90 font-arabic"
                                      >
                                        {sym.symbol}
                                      </button>
                                    ))}
                                  </motion.div>
                                )}

                                {/* 🌟 Spiritual Photo Selection Tool Popover */}
                                {activePhotoPicker?.postId === post.id && !activePhotoPicker?.isReply && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="p-4 rounded-3xl bg-slate-900/95 border border-emerald-500/30 shadow-2xl space-y-3.5 backdrop-blur-xl"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                                          <Camera size={13} />
                                        </div>
                                        <h4 className="text-xs font-black text-white">Share Your Spiritual Activity Photo</h4>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setActivePhotoPicker(null)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>

                                    {/* Quick Preset Cards Grid */}
                                    <div className="space-y-1.5">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose From Spiritual Activity Presets</p>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {SPIRITUAL_COMMENT_IMAGE_PRESETS.map((preset, pIdx) => (
                                          <button
                                            key={pIdx}
                                            type="button"
                                            onClick={() => handleSelectPresetPhoto(preset, post.id)}
                                            className="group/pcard text-left rounded-xl overflow-hidden border border-white/10 hover:border-emerald-400 bg-white/[0.02] hover:bg-emerald-500/10 transition-all cursor-pointer relative"
                                          >
                                            <div className="aspect-[4/3] overflow-hidden relative">
                                              <img 
                                                src={preset.url} 
                                                alt={preset.caption} 
                                                className="w-full h-full object-cover group-hover/pcard:scale-110 transition-transform duration-300"
                                                loading="lazy"
                                                referrerPolicy="no-referrer"
                                              />
                                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                                                <span className="text-[9px] font-black text-white truncate">{preset.label}</span>
                                              </div>
                                            </div>
                                            <div className="p-1.5 text-[8px] text-slate-400 truncate italic">
                                              {preset.caption}
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Upload From Device or Custom Web Link */}
                                    <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <label className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm">
                                        <Upload size={14} />
                                        <span>Upload From Gallery / Camera</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleCommentPhotoFile(f, post.id);
                                          }}
                                        />
                                      </label>

                                      <div className="flex gap-1.5">
                                        <input
                                          type="url"
                                          placeholder="Or paste image URL (https://...)"
                                          value={customPhotoUrl}
                                          onChange={(e) => setCustomPhotoUrl(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customPhotoUrl.trim()) {
                                              handleAttachUrlPhoto(post.id);
                                            }
                                          }}
                                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (customPhotoUrl.trim()) {
                                              handleAttachUrlPhoto(post.id);
                                            }
                                          }}
                                          className="px-3 py-2 bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white font-bold rounded-xl text-[10px] transition-all cursor-pointer shrink-0"
                                        >
                                          Attach
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                {/* Main Comment Input */}
                                <div className="flex gap-2 items-center">
                                  {/* Quick Camera Icon Button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (activePhotoPicker?.postId === post.id && !activePhotoPicker?.isReply) {
                                        setActivePhotoPicker(null);
                                      } else {
                                        setActivePhotoPicker({ postId: post.id, isReply: false });
                                      }
                                    }}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                                      commentImageAttachment?.postId === post.id
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10'
                                    }`}
                                    title="Attach spiritual activity photo"
                                  >
                                    <Camera size={15} />
                                  </button>

                                  <input
                                    value={activePostComment?.postId === post.id ? activePostComment.text : ''}
                                    onChange={(e) => setActivePostComment({ postId: post.id, text: e.target.value })}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCommentSubmit(post.id);
                                    }}
                                    placeholder={commentImageAttachment?.postId === post.id ? "Add a reflection note with your photo..." : "Share your spiritual reflection, advice, or say Ameen..."}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-noor-emerald/60 focus:bg-white/[0.07] transition-all"
                                  />
                                  <button
                                    onClick={() => handleCommentSubmit(post.id)}
                                    disabled={!(activePostComment?.postId === post.id && activePostComment.text.trim()) && !(commentImageAttachment?.postId === post.id)}
                                    className="px-4 py-2.5 bg-noor-emerald text-slate-950 font-black rounded-2xl disabled:opacity-30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-noor-emerald/20 shrink-0"
                                    title="Post reflection (+10 Hasanat)"
                                  >
                                    <Send size={13} />
                                    <span className="text-xs font-black hidden sm:inline">Reflect</span>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Right Sidebar - Trending Duas & Scholars */}
      <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
         <div className="glass-panel border-white/10 rounded-[2rem] p-6 space-y-6 bg-noor-gold/5 border-noor-gold/10">
            <div className="flex items-center gap-2.5">
               <TrendingUp className="text-noor-gold" size={18} />
               <h3 className="text-xs font-black text-white uppercase tracking-wider">Trending Noor</h3>
            </div>
            
            <div className="space-y-5">
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Daily Duas</h4>
                  <div className="space-y-2.5">
                     {TRENDING_DUAS.map((dua) => (
                       <div 
                         key={dua.title} 
                         onClick={() => {
                           setIsCreateModalOpen(true);
                         }}
                         className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-noor-gold/30 transition-all cursor-pointer group"
                       >
                          <p className="text-xs font-black text-white group-hover:text-noor-gold mb-0.5">{dua.title}</p>
                          <p className="text-[10px] text-slate-400 italic font-arabic">{dua.text}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Active Scholars</h4>
                  <div className="space-y-2">
                     {ACTIVE_SCHOLARS.map((scholar) => (
                       <div key={scholar.name} className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-2xl transition-all cursor-pointer">
                          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-[10px]">
                             {scholar.name[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white">{scholar.name}</p>
                             <span className="text-[8px] font-black text-noor-gold uppercase tracking-tighter">{scholar.tag}</span>
                          </div>
                          <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Ummah Scholarship */}
         <div className="glass-panel border-white/10 rounded-[2rem] p-5 relative overflow-hidden group space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-noor-emerald" />
              <h4 className="text-xs font-black text-white">Join Scholar Circle</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Verified scholars can moderate community compliance, lead circles, and host reflections.
            </p>
            <button
              onClick={() => setIsScholarMode(!isScholarMode)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              {isScholarMode ? 'Disable Scholar Mode' : 'Enable Scholar Mode'}
            </button>
         </div>
      </div>

      {/* Report Post Modal for Community & Ethics Compliance */}
      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedPostForReport(null);
        }}
        post={selectedPostForReport}
        currentUser={getActiveUser()}
        onSuccess={(msg) => {
          setPublishSuccessMessage(msg);
          setTimeout(() => setPublishSuccessMessage(null), 4500);
        }}
      />

      {/* Universal Media Lightbox Expansion Modal */}
      <MediaLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        media={lightboxMediaItems}
        initialIndex={lightboxIndex}
      />
    </div>
  );
}
