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

// Built-in starter collection of curated YouTube Khatam Journey broadcasts
export const DEFAULT_YOUTUBE_BROADCASTS: YoutubeBroadcastVideoItem[] = [
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
    shares: 920,
    createdAt: new Date('2026-01-01').toISOString(),
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
    shares: 630,
    createdAt: new Date('2026-01-05').toISOString(),
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
    shares: 410,
    createdAt: new Date('2026-01-10').toISOString(),
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
    shares: 1280,
    createdAt: new Date('2026-01-15').toISOString(),
    isBroadcast: true,
    tags: ['dua', 'alafasy', 'khatam', 'supplication']
  },
  {
    id: 'khatam_motivation_virtues',
    youtubeId: 'fJ9rUzIMcZQ',
    title: 'The Great Reward of Reciting and Completing the Holy Quran',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fJ9rUzIMcZQ?autoplay=1&rel=0&modestbranding=1',
    thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    category: 'motivation',
    categoryLabel: 'Daily Motivation & Virtues',
    speaker: 'Mufti Menk',
    description: 'Prophetic traditions on how the Quran intercedes for its reader on the Day of Resurrection and elevates ranks in Paradise.',
    duration: '12:05',
    featured: false,
    views: 11400,
    likes: 2790,
    shares: 820,
    createdAt: new Date('2026-01-20').toISOString(),
    isBroadcast: true,
    tags: ['motivation', 'virtues', 'hadith', 'muftimenk']
  },
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
    featured: false,
    views: 6500,
    likes: 1620,
    shares: 340,
    createdAt: new Date('2026-01-25').toISOString(),
    isBroadcast: true,
    tags: ['tajweed', 'recitation', 'masterclass', 'fluency']
  }
];

const LOCAL_STORAGE_KEY = 'sanctuary_youtube_broadcasts_v2';
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
   * Get cached videos from localStorage
   */
  static getLocalVideos(): YoutubeBroadcastVideoItem[] {
    const deletedIds = this.getDeletedVideoIds();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter(v => !deletedIds.has(v.id))
            .map(v => ({
              ...v,
              hearts: v.hearts !== undefined ? v.hearts : (v.likes || 150),
              reactions: v.reactions || { heart: v.hearts || v.likes || 150 }
            }));
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
   * Subscribe to real-time videos from Firestore collection `khatam_videos`
   */
  static subscribeToVideos(callback: (videos: YoutubeBroadcastVideoItem[]) => void): () => void {
    const deletedIds = this.getDeletedVideoIds();
    try {
      const q = query(collection(db, 'khatam_videos'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: YoutubeBroadcastVideoItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            if (!deletedIds.has(d.id)) {
              list.push({
                id: d.id,
                youtubeId: data.youtubeId || this.extractYouTubeId(data.url || '') || undefined,
                title: data.title || 'Sacred Khatam Reflection',
                url: data.url || '',
                embedUrl: data.embedUrl || this.parseVideoUrl(data.url || '').embedUrl,
                thumbnailUrl: data.thumbnailUrl || this.parseVideoUrl(data.url || '').thumbnailUrl,
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
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
                addedBy: data.addedBy || 'Admin',
                isBroadcast: true,
                tags: data.tags || []
              });
            }
          });
          this.saveLocalVideos(list);
          callback(list);
        } else {
          // If Firestore is empty, load defaults and cache
          const local = this.getLocalVideos();
          callback(local);
        }
      }, (error) => {
        console.warn("Firestore khatam_videos subscription warning, using local cache:", error);
        callback(this.getLocalVideos());
      });

      return unsubscribe;
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
      const q = query(collection(db, 'khatam_videos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const list: YoutubeBroadcastVideoItem[] = [];
        snapshot.forEach(d => {
          if (!deletedIds.has(d.id)) {
            const data = d.data();
            list.push({
              id: d.id,
              youtubeId: data.youtubeId || this.extractYouTubeId(data.url || '') || undefined,
              title: data.title || 'Sacred Khatam Reflection',
              url: data.url || '',
              embedUrl: data.embedUrl || this.parseVideoUrl(data.url || '').embedUrl,
              thumbnailUrl: data.thumbnailUrl || this.parseVideoUrl(data.url || '').thumbnailUrl,
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
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
              addedBy: data.addedBy || 'Admin',
              isBroadcast: true,
              tags: data.tags || []
            });
          }
        });
        this.saveLocalVideos(list);
        return list;
      }
    } catch (e) {
      console.warn("Error fetching khatam_videos from Firestore:", e);
    }
    return this.getLocalVideos();
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
  static async deleteBroadcastVideo(videoId: string): Promise<boolean> {
    try {
      this.markVideoAsDeleted(videoId);
      
      try {
        await deleteDoc(doc(db, 'khatam_videos', videoId));
      } catch (e) {
        console.warn("Firestore deleteDoc fallback:", e);
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
  static async deleteVideo(videoId: string): Promise<boolean> {
    return this.deleteBroadcastVideo(videoId);
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
   * Re-seed default starter video collection
   */
  static async seedDefaultVideos(): Promise<void> {
    try {
      localStorage.removeItem(DELETED_VIDEOS_KEY);
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
