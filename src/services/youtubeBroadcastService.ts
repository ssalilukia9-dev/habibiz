import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { notificationService } from './notificationService.ts';
import { shareService, ShareablePayload } from './shareService.ts';

export type VideoReactionType = 'heart' | 'like' | 'sparkle' | 'dua';

export interface YoutubeBroadcastVideoItem {
  id: string;
  youtubeId?: string;
  title: string;
  url: string;
  embedUrl: string;
  thumbnailUrl: string;
  category: 'tafsir' | 'motivation' | 'dua' | 'tajweed' | 'juz_guide' | 'general';
  categoryLabel?: string;
  speaker?: string;
  description?: string;
  duration?: string;
  juzNumber?: number;
  featured?: boolean;
  views?: number;
  likes?: number;
  hearts?: number;
  reactions?: Record<string, number>;
  shares?: number;
  createdAt: string;
  addedBy?: string;
  isBroadcast?: boolean;
  tags?: string[];
}

export type KhatamVideoItem = YoutubeBroadcastVideoItem;

// Built-in starter collection of curated YouTube Khatam Journey broadcasts (10 rich defaults)
export const DEFAULT_YOUTUBE_BROADCASTS: YoutubeBroadcastVideoItem[] = [
  {
    id: 'khatam_tajweed_masterclass',
    youtubeId: 'V-_O7nl0Ii0',
    title: 'Essential Tajweed Rules for Smooth, Fluent Quran Recitation',
    url: 'https://www.youtube.com/watch?v=V-_O7nl0Ii0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/V-_O7nl0Ii0?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/V-_O7nl0Ii0/hqdefault.jpg',
    category: 'tajweed',
    categoryLabel: 'Tajweed Masterclass',
    speaker: 'Ustadh Wissam Sharieff',
    description: 'Mastering Noon Sakinah, Ghunnah, and Madd rules so you can recite effortlessly during daily Khatam sessions.',
    duration: '21:40',
    featured: true,
    views: 18500,
    likes: 1620,
    hearts: 1620,
    shares: 340,
    createdAt: new Date('2026-01-01').toISOString(),
    isBroadcast: true,
    tags: ['tajweed', 'recitation', 'masterclass', 'fluency']
  },
  {
    id: 'khatam_dua_sudais',
    youtubeId: 'kYvj7f6V7R0',
    title: 'Emotional Quran Khatam Dua (دعاء ختم القرآن) - Sheikh Abdul Rahman Al-Sudais',
    url: 'https://www.youtube.com/watch?v=kYvj7f6V7R0',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kYvj7f6V7R0?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/kYvj7f6V7R0/hqdefault.jpg',
    category: 'dua',
    categoryLabel: 'Khatam Duas & Supplications',
    speaker: 'Sheikh Abdul Rahman Al-Sudais',
    description: 'Soul-stirring Khatam supplication recited at the Grand Mosque in Makkah upon completing all 114 Surahs of the Holy Quran.',
    duration: '24:15',
    featured: true,
    views: 14200,
    likes: 3840,
    hearts: 3840,
    shares: 920,
    createdAt: new Date('2026-01-05').toISOString(),
    isBroadcast: true,
    tags: ['dua', 'makkah', 'khatam', 'sudais']
  },
  {
    id: 'khatam_plan_30days',
    youtubeId: 'J---aiy1eqA',
    title: 'How to Complete the Quran in 30 Days (Practical Step-by-Step Schedule)',
    url: 'https://www.youtube.com/watch?v=J---aiy1eqA',
    embedUrl: 'https://www.youtube-nocookie.com/embed/J---aiy1eqA?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/J---aiy1eqA/hqdefault.jpg',
    category: 'juz_guide',
    categoryLabel: 'Khatam Schedule & Strategy',
    speaker: 'Ustadh Nouman Ali Khan',
    description: 'Comprehensive time management breakdown: reciting 4 pages after every prayer to effortlessly complete the full Quran in one month.',
    duration: '14:20',
    featured: true,
    views: 9800,
    likes: 2150,
    hearts: 2150,
    shares: 630,
    createdAt: new Date('2026-01-10').toISOString(),
    isBroadcast: true,
    tags: ['schedule', 'guide', 'ramadan', '30days']
  },
  {
    id: 'khatam_tafsir_baqarah',
    youtubeId: 'kJQP7kiw5Fk',
    title: 'Surah Al-Baqarah: Spiritual Pearls & Deep Tafsir (Juz 1 & 2 Reflection)',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    category: 'tafsir',
    categoryLabel: 'Tafsir & Surah Reflections',
    speaker: 'Dr. Omar Suleiman',
    description: 'Deep diving into the pivotal themes of Surah Al-Baqarah, Ayat al-Kursi, and the covenants of faith as you begin your Khatam.',
    duration: '18:50',
    juzNumber: 1,
    featured: false,
    views: 8320,
    likes: 1940,
    hearts: 1940,
    shares: 410,
    createdAt: new Date('2026-01-15').toISOString(),
    isBroadcast: true,
    tags: ['tafsir', 'baqarah', 'juz1', 'reflection']
  },
  {
    id: 'khatam_dua_alafasy',
    youtubeId: 'd_Z_G-L7Ew8',
    title: 'Dua Khatam Al-Quran Complete Recitation - Sheikh Mishary Rashid Alafasy',
    url: 'https://www.youtube.com/watch?v=d_Z_G-L7Ew8',
    embedUrl: 'https://www.youtube-nocookie.com/embed/d_Z_G-L7Ew8?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/d_Z_G-L7Ew8/hqdefault.jpg',
    category: 'dua',
    categoryLabel: 'Khatam Duas & Supplications',
    speaker: 'Sheikh Mishary Rashid Alafasy',
    description: 'Heart-touching invocation for forgiveness, illumination of the grave with Quranic light, and blessings upon the entire Ummah.',
    duration: '31:10',
    featured: true,
    views: 21500,
    likes: 5400,
    hearts: 5400,
    shares: 1280,
    createdAt: new Date('2026-01-20').toISOString(),
    isBroadcast: true,
    tags: ['dua', 'alafasy', 'khatam', 'supplication']
  },
  {
    id: 'khatam_tajweed_makharij',
    youtubeId: 'sQ244Tz630M',
    title: 'Tajweed Masterclass Part 2: 17 Makharij & Articulation Points',
    url: 'https://www.youtube.com/watch?v=sQ244Tz630M',
    embedUrl: 'https://www.youtube-nocookie.com/embed/sQ244Tz630M?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/sQ244Tz630M/hqdefault.jpg',
    category: 'tajweed',
    categoryLabel: 'Tajweed Masterclass',
    speaker: 'Ustadh Wissam Sharieff',
    description: 'Master the 17 articulation points (throat, tongue, lips, nasal cavity) for crisp, beautiful Quranic recitation.',
    duration: '23:15',
    featured: true,
    views: 15400,
    likes: 1890,
    hearts: 1890,
    shares: 420,
    createdAt: new Date('2026-01-22').toISOString(),
    isBroadcast: true,
    tags: ['tajweed', 'makharij', 'pronunciation', 'masterclass']
  },
  {
    id: 'khatam_motivation_virtues',
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'The Great Reward & Virtues of Reciting and Completing the Holy Quran',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fJ9rUzIMcZQ?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    category: 'motivation',
    categoryLabel: 'Daily Motivation & Virtues',
    speaker: 'Mufti Menk',
    description: 'Prophetic traditions on how the Quran intercedes for its companion on the Day of Resurrection and elevates ranks in Jannah.',
    duration: '15:45',
    featured: false,
    views: 24300,
    likes: 2790,
    hearts: 2790,
    shares: 810,
    createdAt: new Date('2026-01-25').toISOString(),
    isBroadcast: true,
    tags: ['motivation', 'virtues', 'hadith', 'muftimenk']
  },
  {
    id: 'khatam_spiritual_blueprint',
    youtubeId: 'pG1d35q30_c',
    title: 'Spiritual Blueprint: Transforming Your Life Through Quran Khatam',
    url: 'https://www.youtube.com/watch?v=pG1d35q30_c',
    embedUrl: 'https://www.youtube-nocookie.com/embed/pG1d35q30_c?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/pG1d35q30_c/hqdefault.jpg',
    category: 'tafsir',
    categoryLabel: 'Tafsir & Surah Reflections',
    speaker: 'Dr. Yasir Qadhi',
    description: 'A comprehensive roadmap on developing presence of heart (Khushoo), thematic reflection (Tadabbur), and spiritual transformation.',
    duration: '26:40',
    featured: true,
    views: 19800,
    likes: 3120,
    hearts: 3120,
    shares: 690,
    createdAt: new Date('2026-01-28').toISOString(),
    isBroadcast: true,
    tags: ['tafsir', 'blueprint', 'spirituality', 'qadhi']
  },
  {
    id: 'khatam_dua_muaiqly',
    youtubeId: '7c9mD_q6L4M',
    title: 'Soul-Stirring Dua Khatam Al-Quran from Masjid Al-Haram - Sheikh Maher Al-Muaiqly',
    url: 'https://www.youtube.com/watch?v=7c9mD_q6L4M',
    embedUrl: 'https://www.youtube-nocookie.com/embed/7c9mD_q6L4M?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/7c9mD_q6L4M/hqdefault.jpg',
    category: 'dua',
    categoryLabel: 'Khatam Duas & Supplications',
    speaker: 'Sheikh Maher Al-Muaiqly',
    description: 'Heartfelt Khatam prayers from the Holy Kaaba asking Allah for mercy, forgiveness, and protection for the entire global Ummah.',
    duration: '28:20',
    featured: false,
    views: 32000,
    likes: 4210,
    hearts: 4210,
    shares: 1150,
    createdAt: new Date('2026-02-01').toISOString(),
    isBroadcast: true,
    tags: ['dua', 'makkah', 'muaiqly', 'khatam']
  },
  {
    id: 'khatam_juz_amma_guide',
    youtubeId: 'gW3B9Zp4Q0s',
    title: 'Juz Amma Master Strategy: Rapid Memorization & Reflection for Beginners',
    url: 'https://www.youtube.com/watch?v=gW3B9Zp4Q0s',
    embedUrl: 'https://www.youtube-nocookie.com/embed/gW3B9Zp4Q0s?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/gW3B9Zp4Q0s/hqdefault.jpg',
    category: 'juz_guide',
    categoryLabel: 'Khatam Schedule & Strategy',
    speaker: 'Ustadh Nouman Ali Khan',
    description: 'Navigating the short powerful Meccan Surahs of Juz 30 with thematic cohesion, linguistic gems, and daily recitation rhythm.',
    duration: '19:10',
    juzNumber: 30,
    featured: false,
    views: 16700,
    likes: 2480,
    hearts: 2480,
    shares: 530,
    createdAt: new Date('2026-02-05').toISOString(),
    isBroadcast: true,
    tags: ['juz30', 'amma', 'memorization', 'guide']
  }
];

const LOCAL_STORAGE_KEY = 'sanctuary_youtube_broadcasts_v3';
const DELETED_VIDEOS_KEY = 'sanctuary_deleted_video_ids_v1';

export class YoutubeBroadcastService {
  /**
   * Extract clean 11-character YouTube video ID from various YouTube URL formats
   */
  static extractYouTubeId(urlOrId: string): string | null {
    if (!urlOrId) return null;
    const raw = urlOrId.trim();

    // Direct 11-character ID check
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      return raw;
    }

    // Standard YouTube URL formats
    const match = raw.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );

    return match ? match[1] : null;
  }

  /**
   * Parse any YouTube or video URL into embed, thumbnail, and metadata
   */
  static parseVideoUrl(inputUrl: string): {
    youtubeId: string | null;
    embedUrl: string;
    thumbnailUrl: string;
    videoType: 'youtube' | 'vimeo' | 'direct' | 'other';
    isValid: boolean;
  } {
    const raw = inputUrl.trim();
    if (!raw) {
      return {
        youtubeId: null,
        embedUrl: '',
        thumbnailUrl: '',
        videoType: 'other',
        isValid: false
      };
    }

    // 1. YouTube
    const ytId = this.extractYouTubeId(raw);
    if (ytId) {
      return {
        youtubeId: ytId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        videoType: 'youtube',
        isValid: true
      };
    }

    // 2. Vimeo
    const vimeoMatch = raw.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i);
    if (vimeoMatch && vimeoMatch[3]) {
      const vimeoId = vimeoMatch[3];
      return {
        youtubeId: null,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
        videoType: 'vimeo',
        isValid: true
      };
    }

    // 3. Direct HTML5 MP4 / WebM video
    if (raw.endsWith('.mp4') || raw.endsWith('.webm') || raw.endsWith('.ogg')) {
      return {
        youtubeId: null,
        embedUrl: raw,
        thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800',
        videoType: 'direct',
        isValid: true
      };
    }

    // Fallback URL
    return {
      youtubeId: null,
      embedUrl: raw,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      videoType: 'other',
      isValid: raw.startsWith('http')
    };
  }

  /**
   * Get category label helper
   */
  static getCategoryLabel(category: string): string {
    switch (category) {
      case 'tafsir': return 'Tafsir & Surah Reflections';
      case 'dua': return 'Khatam Duas & Supplications';
      case 'motivation': return 'Daily Motivation & Virtues';
      case 'juz_guide': return 'Khatam Schedule & Guides';
      case 'tajweed': return 'Tajweed Masterclass';
      case 'general': return 'Sacred Quranic Wisdom';
      default: return 'Khatam Reflection';
    }
  }

  /**
   * Get set of permanently deleted video IDs from local storage
   */
  static getDeletedVideoIds(): Set<string> {
    try {
      const saved = localStorage.getItem(DELETED_VIDEOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (e) {}
    return new Set();
  }

  /**
   * Mark video ID as deleted
   */
  static markVideoAsDeleted(videoId: string): void {
    try {
      const current = this.getDeletedVideoIds();
      current.add(videoId);
      localStorage.setItem(DELETED_VIDEOS_KEY, JSON.stringify(Array.from(current)));
    } catch (e) {}
  }

  /**
   * Unmark video ID as deleted
   */
  static unmarkVideoAsDeleted(videoId: string): void {
    try {
      const current = this.getDeletedVideoIds();
      if (current.has(videoId)) {
        current.delete(videoId);
        localStorage.setItem(DELETED_VIDEOS_KEY, JSON.stringify(Array.from(current)));
      }
    } catch (e) {}
  }

  /**
   * Get cached videos from localStorage, always ensuring all 10 defaults are present
   */
  static getLocalVideos(): YoutubeBroadcastVideoItem[] {
    const deletedIds = this.getDeletedVideoIds();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed
            .filter(v => !deletedIds.has(v.id))
            .map(v => ({
              ...v,
              hearts: v.hearts !== undefined ? v.hearts : (v.likes || 150),
              reactions: v.reactions || { heart: v.hearts || v.likes || 150 }
            }));

          const existingIds = new Set(list.map(v => v.id));
          const missingDefaults = DEFAULT_YOUTUBE_BROADCASTS.filter(
            d => !deletedIds.has(d.id) && !existingIds.has(d.id)
          );

          if (missingDefaults.length > 0) {
            const merged = [...list, ...missingDefaults];
            this.saveLocalVideos(merged);
            return merged;
          }

          return list;
        }
      }
    } catch (e) {
      console.warn("Failed to read local youtube broadcasts:", e);
    }
    return DEFAULT_YOUTUBE_BROADCASTS.filter(v => !deletedIds.has(v.id));
  }

  /**
   * Save videos to localStorage
   */
  static saveLocalVideos(videos: YoutubeBroadcastVideoItem[]): void {
    try {
      const deletedIds = this.getDeletedVideoIds();
      const filtered = videos.filter(v => !deletedIds.has(v.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("Failed to save local youtube broadcasts:", e);
    }
  }

  /**
   * Subscribe to real-time videos from Firestore collection `khatam_videos` and `deleted_khatam_videos`
   */
  static subscribeToVideos(callback: (videos: YoutubeBroadcastVideoItem[]) => void): () => void {
    // 1. Immediately emit local cache for instant UI response
    const initialLocal = this.getLocalVideos();
    callback(initialLocal);

    let firestoreVideosRaw: any[] = [];
    let firestoreDeletedIds = new Set<string>(this.getDeletedVideoIds());

    const emitMergedList = () => {
      const deletedIds = new Set([...Array.from(this.getDeletedVideoIds()), ...Array.from(firestoreDeletedIds)]);
      const firestoreList: YoutubeBroadcastVideoItem[] = [];
      const seenIds = new Set<string>();

      firestoreVideosRaw.forEach((d) => {
        const videoId = d.id;
        if (deletedIds.has(videoId)) return;
        const data = d.data;
        seenIds.add(videoId);

        const rawUrl = data.url || '';
        const parsed = this.parseVideoUrl(rawUrl);

        let parsedCreatedAt = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt === 'string') {
            parsedCreatedAt = data.createdAt;
          } else if (data.createdAt.toDate) {
            parsedCreatedAt = data.createdAt.toDate().toISOString();
          }
        }

        firestoreList.push({
          id: videoId,
          youtubeId: data.youtubeId || parsed.youtubeId || undefined,
          title: data.title || 'Sacred Khatam Reflection',
          url: rawUrl,
          embedUrl: data.embedUrl || parsed.embedUrl,
          thumbnailUrl: data.thumbnailUrl || parsed.thumbnailUrl,
          category: data.category || 'tafsir',
          categoryLabel: data.categoryLabel || this.getCategoryLabel(data.category || 'tafsir'),
          speaker: data.speaker || 'Sanctuary Scholar',
          description: data.description || '',
          duration: data.duration || '15:00',
          juzNumber: data.juzNumber,
          featured: !!data.featured,
          views: data.views || 0,
          likes: data.likes || 0,
          hearts: data.hearts !== undefined ? data.hearts : (data.likes || 0),
          reactions: data.reactions || { heart: data.hearts || data.likes || 0 },
          shares: data.shares || 0,
          createdAt: parsedCreatedAt,
          addedBy: data.addedBy || 'Admin',
          isBroadcast: true,
          tags: data.tags || []
        });
      });

      // Merge defaults that haven't been deleted or overridden
      const defaultsToAdd = DEFAULT_YOUTUBE_BROADCASTS.filter(
        def => !deletedIds.has(def.id) && !seenIds.has(def.id)
      );

      const combinedList = [...firestoreList, ...defaultsToAdd];

      // Sort: featured videos first, then newest createdAt
      combinedList.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      this.saveLocalVideos(combinedList);
      callback(combinedList);
    };

    try {
      // 1. Subscribe to khatam_videos collection
      const colRef = collection(db, 'khatam_videos');
      const unsubVideos = onSnapshot(colRef, (snapshot) => {
        firestoreVideosRaw = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
        emitMergedList();
      }, (error) => {
        console.warn("Firestore khatam_videos subscription warning, using local cache:", error);
        callback(this.getLocalVideos());
      });

      // 2. Subscribe to deleted_khatam_videos collection for real-time deletion syncing across all devices
      const delColRef = collection(db, 'deleted_khatam_videos');
      const unsubDeleted = onSnapshot(delColRef, (snapshot) => {
        const nextDeleted = new Set<string>(this.getDeletedVideoIds());
        snapshot.forEach(doc => nextDeleted.add(doc.id));
        firestoreDeletedIds = nextDeleted;
        emitMergedList();
      }, (delErr) => {
        console.warn("Firestore deleted_khatam_videos subscription fallback:", delErr);
      });

      return () => {
        unsubVideos();
        unsubDeleted();
      };
    } catch (e) {
      console.warn("Firestore unconfigured, fallback to local storage:", e);
      callback(this.getLocalVideos());
      return () => {};
    }
  }

  /**
   * Fetch all broadcast videos asynchronously
   */
  static async fetchVideos(): Promise<YoutubeBroadcastVideoItem[]> {
    const deletedIds = this.getDeletedVideoIds();
    try {
      // Fetch deleted tombstones
      try {
        const delSnap = await getDocs(collection(db, 'deleted_khatam_videos'));
        delSnap.forEach(d => deletedIds.add(d.id));
      } catch (e) {}

      const colRef = collection(db, 'khatam_videos');
      const snapshot = await getDocs(colRef);
      const firestoreList: YoutubeBroadcastVideoItem[] = [];
      const seenIds = new Set<string>();

      snapshot.forEach(d => {
        if (deletedIds.has(d.id)) return;
        const data = d.data();
        const videoId = d.id;
        seenIds.add(videoId);

        const rawUrl = data.url || '';
        const parsed = this.parseVideoUrl(rawUrl);

        let parsedCreatedAt = new Date().toISOString();
        if (data.createdAt) {
          if (typeof data.createdAt === 'string') {
            parsedCreatedAt = data.createdAt;
          } else if (data.createdAt.toDate) {
            parsedCreatedAt = data.createdAt.toDate().toISOString();
          }
        }

        firestoreList.push({
          id: videoId,
          youtubeId: data.youtubeId || parsed.youtubeId || undefined,
          title: data.title || 'Sacred Khatam Reflection',
          url: rawUrl,
          embedUrl: data.embedUrl || parsed.embedUrl,
          thumbnailUrl: data.thumbnailUrl || parsed.thumbnailUrl,
          category: data.category || 'tafsir',
          categoryLabel: data.categoryLabel || this.getCategoryLabel(data.category || 'tafsir'),
          speaker: data.speaker || 'Sanctuary Scholar',
          description: data.description || '',
          duration: data.duration || '15:00',
          juzNumber: data.juzNumber,
          featured: !!data.featured,
          views: data.views || 0,
          likes: data.likes || 0,
          hearts: data.hearts !== undefined ? data.hearts : (data.likes || 0),
          reactions: data.reactions || { heart: data.hearts || data.likes || 0 },
          shares: data.shares || 0,
          createdAt: parsedCreatedAt,
          addedBy: data.addedBy || 'Admin',
          isBroadcast: true,
          tags: data.tags || []
        });
      });

      const defaultsToAdd = DEFAULT_YOUTUBE_BROADCASTS.filter(
        def => !deletedIds.has(def.id) && !seenIds.has(def.id)
      );

      const combinedList = [...firestoreList, ...defaultsToAdd];

      combinedList.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      this.saveLocalVideos(combinedList);
      return combinedList;
    } catch (e) {
      console.warn("Error fetching khatam_videos from Firestore:", e);
    }
    return this.getLocalVideos();
  }

  /**
   * Delete ALL custom/admin-posted videos from Firestore and reset to defaults
   */
  static async deleteAllCustomVideos(): Promise<{ success: boolean; deletedCount: number }> {
    let count = 0;
    try {
      const colRef = collection(db, 'khatam_videos');
      const snapshot = await getDocs(colRef);
      const deletePromises: Promise<any>[] = [];

      snapshot.forEach(d => {
        count++;
        this.markVideoAsDeleted(d.id);
        deletePromises.push(deleteDoc(doc(db, 'khatam_videos', d.id)));
      });

      await Promise.allSettled(deletePromises);

      // Clear local storage and reset to default broadcasts
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      this.saveLocalVideos(DEFAULT_YOUTUBE_BROADCASTS);

      return { success: true, deletedCount: count };
    } catch (e) {
      console.error("Error deleting all custom videos:", e);
      return { success: false, deletedCount: count };
    }
  }

  /**
   * Post a new YouTube broadcast video to Firestore and notify all users across the Hub
   */
  static async postBroadcastVideo(
    videoData: {
      url: string;
      title?: string;
      category: 'tafsir' | 'motivation' | 'dua' | 'tajweed' | 'juz_guide' | 'general';
      categoryLabel?: string;
      speaker?: string;
      description?: string;
      duration?: string;
      juzNumber?: number;
      featured?: boolean;
      tags?: string[];
    },
    adminUser?: { uid?: string; displayName?: string; email?: string } | string
  ): Promise<{ success: boolean; id?: string; error?: string; video?: YoutubeBroadcastVideoItem }> {
    try {
      const parsed = this.parseVideoUrl(videoData.url);
      if (!parsed.isValid) {
        return { success: false, error: 'Please provide a valid YouTube video link.' };
      }

      const adminName = typeof adminUser === 'string' 
        ? adminUser 
        : (adminUser?.displayName || adminUser?.email || 'Admin Overseer');

      const categoryLabel = videoData.categoryLabel || this.getCategoryLabel(videoData.category);
      const title = videoData.title?.trim() || `${categoryLabel} Broadcast`;

      const videoId = parsed.youtubeId ? `yt_${parsed.youtubeId}` : `video_${Date.now()}`;
      this.unmarkVideoAsDeleted(videoId);

      // Clean up tombstone if previously marked deleted
      try {
        await deleteDoc(doc(db, 'deleted_khatam_videos', videoId));
      } catch (e) {}

      const newVideo: YoutubeBroadcastVideoItem = {
        id: videoId,
        youtubeId: parsed.youtubeId || undefined,
        title,
        url: videoData.url.trim(),
        embedUrl: parsed.embedUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        category: videoData.category,
        categoryLabel,
        speaker: videoData.speaker?.trim() || 'Sanctuary Scholar',
        description: videoData.description?.trim() || 'Sacred Quranic reflection and guidance for the Khatam Journey.',
        duration: videoData.duration?.trim() || '15:00',
        juzNumber: videoData.juzNumber,
        featured: !!videoData.featured,
        views: 0,
        likes: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
        addedBy: adminName,
        isBroadcast: true,
        tags: videoData.tags || [videoData.category, 'khatam', 'quran']
      };

      // 1. Save document to Firestore collection 'khatam_videos'
      try {
        await setDoc(doc(db, 'khatam_videos', videoId), {
          ...newVideo,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore setDoc fallback to local cache:", err);
      }

      // 2. Dispatch cross-platform announcement so all users receive the broadcast notification
      try {
        await addDoc(collection(db, 'announcements'), {
          title: `🎬 New Khatam Broadcast: ${title}`,
          message: `${newVideo.speaker} published a new ${categoryLabel} video for the Khatam Journey. Watch now!`,
          type: 'khatam_video',
          targetUrl: '/khatam',
          mediaUrl: newVideo.url,
          thumbnailUrl: newVideo.thumbnailUrl,
          sender: adminName,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Announcement broadcast notice fallback:", e);
      }

      // 3. Trigger immediate local & push notification
      await notificationService.notifyNewKhatamVideo(
        title,
        newVideo.speaker,
        videoId
      );

      // 4. Update local cache
      const local = this.getLocalVideos();
      const nextList = [newVideo, ...local.filter(v => v.id !== videoId)];
      this.saveLocalVideos(nextList);

      return { success: true, id: videoId, video: newVideo };
    } catch (e: any) {
      console.error("Error broadcasting YouTube video:", e);
      return { success: false, error: e?.message || 'Failed to broadcast video.' };
    }
  }

  /**
   * Update an existing broadcast video in Firestore and notify all users across the Sanctuary
   */
  static async updateBroadcastVideo(
    videoId: string,
    updatedData: {
      url: string;
      title?: string;
      category?: 'tafsir' | 'motivation' | 'dua' | 'tajweed' | 'juz_guide' | 'general';
      categoryLabel?: string;
      speaker?: string;
      description?: string;
      duration?: string;
      juzNumber?: number;
      featured?: boolean;
      tags?: string[];
      notifyAllUsers?: boolean;
    },
    adminUser?: { uid?: string; displayName?: string; email?: string } | string
  ): Promise<{ success: boolean; video?: YoutubeBroadcastVideoItem; error?: string }> {
    try {
      const parsed = this.parseVideoUrl(updatedData.url);
      if (!parsed.isValid) {
        return { success: false, error: 'Please provide a valid YouTube video link.' };
      }

      const adminName = typeof adminUser === 'string'
        ? adminUser
        : (adminUser?.displayName || adminUser?.email || 'Admin Overseer');

      const existingVideos = this.getLocalVideos();
      const existing = existingVideos.find(v => v.id === videoId) || 
                       DEFAULT_YOUTUBE_BROADCASTS.find(v => v.id === videoId);

      const category = updatedData.category || existing?.category || 'tajweed';
      const categoryLabel = updatedData.categoryLabel || this.getCategoryLabel(category);
      const title = updatedData.title?.trim() || existing?.title || `${categoryLabel} Broadcast`;
      const speaker = updatedData.speaker?.trim() || existing?.speaker || 'Sanctuary Scholar';
      const description = updatedData.description !== undefined ? updatedData.description.trim() : (existing?.description || '');
      const duration = updatedData.duration?.trim() || existing?.duration || '20:00';

      const updatedVideo: YoutubeBroadcastVideoItem = {
        ...(existing || {}),
        id: videoId,
        youtubeId: parsed.youtubeId || existing?.youtubeId,
        title,
        url: updatedData.url.trim(),
        embedUrl: parsed.embedUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        category,
        categoryLabel,
        speaker,
        description,
        duration,
        juzNumber: updatedData.juzNumber !== undefined ? updatedData.juzNumber : existing?.juzNumber,
        featured: updatedData.featured !== undefined ? !!updatedData.featured : !!existing?.featured,
        views: existing?.views || 0,
        likes: existing?.likes || 0,
        hearts: existing?.hearts || existing?.likes || 0,
        reactions: existing?.reactions || {},
        shares: existing?.shares || 0,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: existing?.addedBy || adminName,
        isBroadcast: true,
        tags: updatedData.tags || existing?.tags || [category, 'khatam', 'quran']
      } as YoutubeBroadcastVideoItem;

      // 1. Save updated document to Firestore 'khatam_videos' collection
      try {
        await setDoc(doc(db, 'khatam_videos', videoId), {
          ...updatedVideo,
          updatedAt: serverTimestamp(),
          updatedBy: adminName
        }, { merge: true });
      } catch (err) {
        console.warn("Firestore setDoc update fallback to local cache:", err);
      }

      // 2. DISPATCH NOTIFICATION TO ALL USERS:
      // Writes an announcement document in Firestore 'announcements' collection.
      // NotificationService's real-time watcher will fire on all connected users' devices.
      const shouldNotify = updatedData.notifyAllUsers !== false;
      if (shouldNotify) {
        try {
          await addDoc(collection(db, 'announcements'), {
            title: `🎬 Khatam Video Updated: ${title}`,
            message: `"${title}" (${speaker}) was updated in Khatam Journey. Watch the revised broadcast & reflection now!`,
            body: `"${title}" (${speaker}) was updated in Khatam Journey. Watch the revised broadcast & reflection now!`,
            type: 'khatam_video',
            targetUrl: `/?tab=resources&resId=khatam&video=${videoId}`,
            mediaUrl: updatedVideo.url,
            youtubeUrl: updatedVideo.url,
            youtubeId: parsed.youtubeId || '',
            thumbnailUrl: updatedVideo.thumbnailUrl,
            embedUrl: updatedVideo.embedUrl,
            videoId: videoId,
            sender: adminName,
            category,
            speaker,
            isKhatamJourney: true,
            createdAt: serverTimestamp()
          });
        } catch (annErr) {
          console.warn("Firestore announcements broadcast fallback:", annErr);
        }

        // Trigger local notification service
        try {
          await notificationService.notifyNewKhatamVideo(
            `Updated: ${title}`,
            speaker,
            videoId
          );
        } catch (notifErr) {
          console.warn("Local notification trigger fallback:", notifErr);
        }
      }

      // 3. Update local cache
      const nextList = [
        updatedVideo,
        ...existingVideos.filter(v => v.id !== videoId)
      ];
      this.saveLocalVideos(nextList);

      return { success: true, video: updatedVideo };
    } catch (e: any) {
      console.error("Error updating broadcast video:", e);
      return { success: false, error: e?.message || 'Failed to update video.' };
    }
  }

  /**
   * Compatibility alias for addVideo
   */
  static async addVideo(
    videoData: {
      url: string;
      title?: string;
      category: 'tafsir' | 'motivation' | 'dua' | 'tajweed' | 'juz_guide' | 'general';
      categoryLabel?: string;
      speaker?: string;
      description?: string;
      duration?: string;
      juzNumber?: number;
      featured?: boolean;
      tags?: string[];
    },
    adminUser?: { uid?: string; displayName?: string; email?: string } | string
  ): Promise<{ success: boolean; id?: string; error?: string; video?: YoutubeBroadcastVideoItem }> {
    return this.postBroadcastVideo(videoData, adminUser);
  }

  /**
   * Bulk add multiple videos from text or array
   */
  static async bulkAddVideos(
    bulkInput: string | Array<{
      url: string;
      title?: string;
      category?: 'tafsir' | 'motivation' | 'dua' | 'tajweed' | 'juz_guide' | 'general';
      speaker?: string;
      description?: string;
      duration?: string;
    }>,
    defaultCategory: any = 'tafsir',
    adminUser: string = 'Admin'
  ): Promise<{ success: boolean; addedCount: number; errors: string[] }> {
    const errorList: string[] = [];
    let addedCount = 0;

    if (typeof bulkInput === 'string') {
      const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        // Line can be URL or Title | URL
        const parts = line.split('|').map(p => p.trim());
        let url = parts[0];
        let title: string | undefined = undefined;

        if (parts.length >= 2) {
          if (parts[0].startsWith('http')) {
            url = parts[0];
            title = parts[1];
          } else {
            title = parts[0];
            url = parts[1];
          }
        }

        const res = await this.postBroadcastVideo({
          url,
          title,
          category: defaultCategory,
          speaker: 'Sanctuary Scholar'
        }, adminUser);

        if (res.success) {
          addedCount++;
        } else {
          errorList.push(`Failed for "${url}": ${res.error}`);
        }
      }
    } else if (Array.isArray(bulkInput)) {
      for (const item of bulkInput) {
        const res = await this.postBroadcastVideo({
          url: item.url,
          title: item.title,
          category: item.category || defaultCategory,
          speaker: item.speaker,
          description: item.description,
          duration: item.duration
        }, adminUser);

        if (res.success) addedCount++;
        else errorList.push(res.error || `Failed for ${item.url}`);
      }
    }

    return {
      success: addedCount > 0,
      addedCount,
      errors: errorList
    };
  }

  /**
   * Delete an admin-posted video from Firestore and local cache
   */
  static async deleteBroadcastVideo(videoId: string, adminUser?: string): Promise<boolean> {
    try {
      this.markVideoAsDeleted(videoId);
      
      // 1. Delete document from khatam_videos collection
      try {
        await deleteDoc(doc(db, 'khatam_videos', videoId));
      } catch (e) {
        console.warn("Firestore deleteDoc fallback:", e);
      }

      // 2. Write tombstone to deleted_khatam_videos for real-time cross-device deletion syncing
      try {
        await setDoc(doc(db, 'deleted_khatam_videos', videoId), {
          id: videoId,
          deletedAt: serverTimestamp(),
          deletedBy: adminUser || 'Admin'
        });
      } catch (e) {
        console.warn("Firestore deleted_khatam_videos setDoc fallback:", e);
      }

      const local = this.getLocalVideos().filter(v => v.id !== videoId);
      this.saveLocalVideos(local);
      return true;
    } catch (e) {
      console.error("Error deleting video:", e);
      return false;
    }
  }

  /**
   * Compatibility alias for deleteVideo
   */
  static async deleteVideo(videoId: string, adminUser?: string): Promise<boolean> {
    return this.deleteBroadcastVideo(videoId, adminUser);
  }

  /**
   * Toggle featured status of a video
   */
  static async toggleFeatured(videoId: string, currentFeatured: boolean): Promise<boolean> {
    try {
      try {
        await updateDoc(doc(db, 'khatam_videos', videoId), {
          featured: !currentFeatured,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn("Firestore updateDoc toggleFeatured fallback:", e);
      }

      const local = this.getLocalVideos().map(v => 
        v.id === videoId ? { ...v, featured: !currentFeatured } : v
      );
      this.saveLocalVideos(local);
      return true;
    } catch (e) {
      console.error("Error toggling featured status:", e);
      return false;
    }
  }

  /**
   * Like a video and increment likes counter
   */
  static async likeVideo(videoId: string): Promise<void> {
    return this.reactToVideo(videoId, 'like');
  }

  /**
   * React to a Khatam video with Heart, Like, Sparkle, or Dua
   */
  static async reactToVideo(videoId: string, reactionType: VideoReactionType = 'heart', isAdding: boolean = true): Promise<void> {
    try {
      const local = this.getLocalVideos().map(v => {
        if (v.id !== videoId) return v;
        const currentLikes = v.likes || 0;
        const currentHearts = v.hearts || 0;
        const currentReactions = { ...(v.reactions || {}) };
        
        const delta = isAdding ? 1 : -1;
        const newLikes = Math.max(0, currentLikes + delta);
        const newHearts = reactionType === 'heart' ? Math.max(0, currentHearts + delta) : currentHearts;
        currentReactions[reactionType] = Math.max(0, (currentReactions[reactionType] || 0) + delta);

        return {
          ...v,
          likes: newLikes,
          hearts: newHearts,
          reactions: currentReactions
        };
      });
      this.saveLocalVideos(local);

      try {
        const docRef = doc(db, 'khatam_videos', videoId);
        const item = local.find(v => v.id === videoId);
        if (item) {
          await updateDoc(docRef, {
            likes: item.likes || 0,
            hearts: item.hearts || 0,
            reactions: item.reactions || {},
            updatedAt: serverTimestamp()
          });
        }
      } catch (e) {
        // Fallback for non-firestore or offline mode
      }
    } catch (e) {
      console.warn("Error reacting to video:", e);
    }
  }

  /**
   * Record a video view
   */
  static async recordView(videoId: string): Promise<void> {
    try {
      const local = this.getLocalVideos().map(v => 
        v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v
      );
      this.saveLocalVideos(local);

      try {
        const docRef = doc(db, 'khatam_videos', videoId);
        const item = local.find(v => v.id === videoId);
        if (item) {
          await updateDoc(docRef, {
            views: (item.views || 0) + 1
          });
        }
      } catch (e) {}
    } catch (e) {}
  }

  /**
   * Cross-platform share: Trigger universal share modal with video payload
   */
  static shareBroadcastVideo(video: YoutubeBroadcastVideoItem): void {
    const payload: ShareablePayload = {
      title: `🎬 ${video.title}`,
      text: `${video.speaker ? `Speaker: ${video.speaker}\n` : ''}${video.description || 'Watch this sacred Quranic reflection on the Khatam Journey.'}\n\nCategory: ${video.categoryLabel || video.category}`,
      url: video.url,
      imageUrl: video.thumbnailUrl,
      author: video.speaker || 'Sanctuary Scholar',
      source: 'Khatam Journey • Aloha Sanctuary',
      badge: video.categoryLabel || 'Khatam Reflection',
      category: video.category
    };

    shareService.open(payload);

    // Increment share counter in local/firestore
    try {
      const local = this.getLocalVideos().map(v => 
        v.id === video.id ? { ...v, shares: (v.shares || 0) + 1 } : v
      );
      this.saveLocalVideos(local);
    } catch (e) {}
  }

  /**
   * Cross-platform share to Ummah Hub community feed
   */
  static async shareToUmmahHub(
    video: YoutubeBroadcastVideoItem, 
    user: any,
    commentText?: string
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const authorName = user?.displayName || 'Seeker of Knowledge';
      const authorRole = user?.role || 'pilgrim';
      const authorAvatar = user?.photoURL || '';

      const content = commentText?.trim() 
        ? `${commentText.trim()}\n\n🎬 **${video.title}**\n${video.speaker ? `👤 *${video.speaker}*\n` : ''}${video.description || ''}\n\n🔗 ${video.url}\n\n#KhatamJourney #SacredReflections`
        : `✨ **Sacred Khatam Journey Reflection**\n\n🎬 **${video.title}**\n${video.speaker ? `👤 *${video.speaker}*\n` : ''}${video.description || ''}\n\n🔗 ${video.url}\n\n#KhatamJourney #SacredReflections #AlohaSanctuary`;

      const postDoc = await addDoc(collection(db, 'posts'), {
        authorId: user?.uid || 'guest',
        authorName,
        authorAvatar,
        authorRole,
        content,
        mediaType: 'video',
        mediaUrl: video.url,
        embedUrl: video.embedUrl,
        thumbnailUrl: video.thumbnailUrl,
        category: 'khatam_journey',
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 1,
        createdAt: serverTimestamp(),
        isPinned: false
      });

      notificationService.notify(
        "Shared to Ummah Hub!",
        `"${video.title.slice(0, 30)}..." was posted to the community feed.`,
        'community',
        '/hub'
      );

      return { success: true, postId: postDoc.id };
    } catch (err: any) {
      console.warn("Ummah Hub post fallback:", err);
      return { success: false, error: err?.message || 'Could not post to Ummah Hub.' };
    }
  }

  /**
   * Creates an Announcement document in the 'announcements' collection for a YouTube video
   * and registers it for the KhatamJourneyView.
   */
  static async postKhatamAnnouncement(
    data: {
      url: string;
      description?: string;
      title?: string;
      category?: 'tafsir' | 'motivation' | 'dua' | 'tajweed' | 'juz_guide' | 'general';
      speaker?: string;
    },
    adminUser?: { uid?: string; displayName?: string; email?: string } | string
  ): Promise<{ success: boolean; id?: string; announcementId?: string; error?: string; video?: YoutubeBroadcastVideoItem }> {
    try {
      const parsed = this.parseVideoUrl(data.url);
      if (!parsed.isValid) {
        return { success: false, error: 'Please provide a valid YouTube video link.' };
      }

      const adminName = typeof adminUser === 'string' 
        ? adminUser 
        : (adminUser?.displayName || adminUser?.email || 'Admin Overseer');

      const category = data.category || 'tafsir';
      const categoryLabel = this.getCategoryLabel(category);
      const title = data.title?.trim() || `Sacred Reflection: ${categoryLabel}`;
      const description = data.description?.trim() || 'Sacred Quranic reflection and guidance for the Khatam Journey.';

      const videoId = parsed.youtubeId ? `yt_${parsed.youtubeId}` : `video_${Date.now()}`;
      this.unmarkVideoAsDeleted(videoId);

      const newVideo: YoutubeBroadcastVideoItem = {
        id: videoId,
        youtubeId: parsed.youtubeId || undefined,
        title,
        url: data.url.trim(),
        embedUrl: parsed.embedUrl,
        thumbnailUrl: parsed.thumbnailUrl,
        category,
        categoryLabel,
        speaker: data.speaker?.trim() || 'Sanctuary Scholar',
        description,
        duration: '15:00',
        featured: true,
        views: 0,
        likes: 0,
        shares: 0,
        createdAt: new Date().toISOString(),
        addedBy: adminName,
        isBroadcast: true,
        tags: [category, 'khatam', 'announcement']
      };

      // 1. Create document in Firestore 'announcements' collection
      let announcementId = `ann_${Date.now()}`;
      try {
        const annDocRef = await addDoc(collection(db, 'announcements'), {
          title: `🎬 ${title}`,
          message: description,
          description,
          type: 'khatam_video',
          targetUrl: '/khatam',
          mediaUrl: newVideo.url,
          youtubeUrl: newVideo.url,
          youtubeId: parsed.youtubeId || '',
          thumbnailUrl: newVideo.thumbnailUrl,
          embedUrl: newVideo.embedUrl,
          sender: adminName,
          category,
          speaker: newVideo.speaker,
          isKhatamJourney: true,
          createdAt: serverTimestamp()
        });
        announcementId = annDocRef.id;
      } catch (err) {
        console.warn("Firestore announcements addDoc fallback:", err);
      }

      // 2. Save document to 'khatam_videos' collection
      try {
        await setDoc(doc(db, 'khatam_videos', videoId), {
          ...newVideo,
          announcementId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore khatam_videos setDoc fallback:", err);
      }

      // 3. Trigger immediate local & push notification
      await notificationService.notifyNewKhatamVideo(
        title,
        newVideo.speaker,
        videoId
      );

      // 4. Update local cache
      const local = this.getLocalVideos();
      const nextList = [newVideo, ...local.filter(v => v.id !== videoId)];
      this.saveLocalVideos(nextList);

      return { success: true, id: videoId, announcementId, video: newVideo };
    } catch (e: any) {
      console.error("Error creating Khatam announcement:", e);
      return { success: false, error: e?.message || 'Failed to publish video announcement.' };
    }
  }

  /**
   * Real-time subscription to the 'announcements' collection for Khatam Journey updates
   */
  static subscribeToAnnouncements(callback: (announcements: any[]) => void): () => void {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        callback(list);
      }, (error) => {
        console.warn("Firestore announcements subscription error:", error);
      });
      return unsub;
    } catch (err) {
      console.warn("Announcements subscription fallback:", err);
      return () => {};
    }
  }

  /**
   * Re-seed default starter video collection and clear deletion tombstones
   */
  static async seedDefaultVideos(): Promise<void> {
    try {
      localStorage.removeItem(DELETED_VIDEOS_KEY);

      // Clear all deletion tombstones from Firestore
      try {
        const delSnap = await getDocs(collection(db, 'deleted_khatam_videos'));
        const delPromises = delSnap.docs.map(d => deleteDoc(doc(db, 'deleted_khatam_videos', d.id)));
        await Promise.allSettled(delPromises);
      } catch (e) {}

      this.saveLocalVideos(DEFAULT_YOUTUBE_BROADCASTS);

      for (const v of DEFAULT_YOUTUBE_BROADCASTS) {
        try {
          await setDoc(doc(db, 'khatam_videos', v.id), {
            ...v,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (e) {}
      }
    } catch (e) {}
  }

  /**
   * Compatibility alias for seedInitialVideosIfEmpty
   */
  static async seedInitialVideosIfEmpty(): Promise<void> {
    return this.seedDefaultVideos();
  }
}

export const youtubeBroadcastService = YoutubeBroadcastService;
