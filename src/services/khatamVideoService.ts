import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';

export interface KhatamVideoItem {
  id: string;
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
  createdAt: string;
  addedBy?: string;
}

// Built-in starter collection of sacred Khatam Journey videos
export const DEFAULT_KHATAM_VIDEOS: KhatamVideoItem[] = [
  {
    id: 'khatam_dua_sudais',
    title: 'Emotional Quran Khatam Dua (دعاء ختم القرآن) - Sheikh Abdul Rahman Al-Sudais',
    url: 'https://www.youtube.com/watch?v=kYvj7f6V7R0',
    embedUrl: 'https://www.youtube.com/embed/kYvj7f6V7R0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=800',
    category: 'dua',
    categoryLabel: 'Khatam Duas & Supplications',
    speaker: 'Sheikh Abdul Rahman Al-Sudais',
    description: 'Soul-stirring Khatam supplication recited at the Grand Mosque in Makkah. Recited upon completing the recitation of all 114 Surahs.',
    duration: '24:15',
    featured: true,
    views: 14200,
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'khatam_plan_30days',
    title: 'How to Complete the Quran in 30 Days (Practical Step-by-Step Schedule)',
    url: 'https://www.youtube.com/watch?v=J---aiy1eqA',
    embedUrl: 'https://www.youtube.com/embed/J---aiy1eqA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800',
    category: 'juz_guide',
    categoryLabel: 'Khatam Schedule & Strategy',
    speaker: 'Ustadh Nouman Ali Khan',
    description: 'Comprehensive time management breakdown: reciting 4 pages after every prayer to effortlessly complete the full Quran in one month.',
    duration: '14:20',
    featured: true,
    views: 9800,
    createdAt: new Date('2026-01-05').toISOString()
  },
  {
    id: 'khatam_tafsir_baqarah',
    title: 'Surah Al-Baqarah: Spiritual Pearls & Deep Tafsir (Juz 1 & 2 Reflection)',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    embedUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
    category: 'tafsir',
    categoryLabel: 'Tafsir & Surah Reflections',
    speaker: 'Dr. Omar Suleiman',
    description: 'Deep diving into the pivotal themes of Surah Al-Baqarah, Ayat al-Kursi, and the covenants of faith as you begin your Khatam.',
    duration: '18:50',
    juzNumber: 1,
    featured: false,
    views: 8320,
    createdAt: new Date('2026-01-10').toISOString()
  },
  {
    id: 'khatam_dua_alafasy',
    title: 'Dua Khatam Al-Quran Complete Recitation - Sheikh Mishary Rashid Alafasy',
    url: 'https://www.youtube.com/watch?v=d_Z_G-L7Ew8',
    embedUrl: 'https://www.youtube.com/embed/d_Z_G-L7Ew8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    category: 'dua',
    categoryLabel: 'Khatam Duas & Supplications',
    speaker: 'Sheikh Mishary Rashid Alafasy',
    description: 'Heart-touching invocation for forgiveness, illumination of the grave with Quranic light, and blessings upon the Ummah.',
    duration: '31:10',
    featured: true,
    views: 21500,
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'khatam_motivation_virtues',
    title: 'The Great Reward of Reciting and Completing the Holy Quran',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    embedUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800',
    category: 'motivation',
    categoryLabel: 'Daily Motivation & Virtues',
    speaker: 'Mufti Menk',
    description: 'Prophetic traditions on how the Quran intercedes for its reader on the Day of Resurrection and ascends in Paradise.',
    duration: '12:05',
    featured: false,
    views: 11400,
    createdAt: new Date('2026-01-20').toISOString()
  },
  {
    id: 'khatam_tajweed_masterclass',
    title: 'Essential Tajweed Rules for Smooth, Fluent Quran Recitation',
    url: 'https://www.youtube.com/watch?v=V-_O7nl0Ii0',
    embedUrl: 'https://www.youtube.com/embed/V-_O7nl0Ii0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583000212006-7e23730e625a?auto=format&fit=crop&q=80&w=800',
    category: 'tajweed',
    categoryLabel: 'Tajweed Masterclass',
    speaker: 'Ustadh Wissam Sharieff',
    description: 'Mastering Noon Sakinah, Ghunnah, and Madd rules so you can recite effortlessly during daily Khatam sessions.',
    duration: '21:40',
    featured: false,
    views: 6500,
    createdAt: new Date('2026-01-25').toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'sanctuary_khatam_videos_v1';
const DELETED_VIDEOS_KEY = 'sanctuary_deleted_video_ids_v1';

export class KhatamVideoService {
  /**
   * Get set of permanently deleted video IDs
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
   * Save deleted video ID
   */
  static markVideoAsDeleted(videoId: string): void {
    try {
      const current = this.getDeletedVideoIds();
      current.add(videoId);
      localStorage.setItem(DELETED_VIDEOS_KEY, JSON.stringify(Array.from(current)));
    } catch (e) {}
  }

  /**
   * Unmark a video as deleted (when adding or re-adding a video)
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
   * Parse any video link (YouTube, Vimeo, MP4, WebM) into an embed URL and thumbnail
   */
  static parseVideoUrl(inputUrl: string): { embedUrl: string; thumbnailUrl: string; videoType: 'youtube' | 'vimeo' | 'direct' | 'other' } {
    const raw = inputUrl.trim();
    if (!raw) {
      return { embedUrl: '', thumbnailUrl: '', videoType: 'other' };
    }

    // 1. YouTube variations (watch?v=, youtu.be, /embed/, /shorts/, /live/)
    const ytWatchMatch = raw.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    const youtubeId = ytWatchMatch?.[1];

    if (youtubeId) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        videoType: 'youtube'
      };
    }

    // 2. Vimeo
    const vimeoMatch = raw.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i);
    if (vimeoMatch && vimeoMatch[3]) {
      const vimeoId = vimeoMatch[3];
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
        videoType: 'vimeo'
      };
    }

    // 3. Direct MP4 / WebM video
    if (raw.endsWith('.mp4') || raw.endsWith('.webm') || raw.endsWith('.ogg')) {
      return {
        embedUrl: raw,
        thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800',
        videoType: 'direct'
      };
    }

    // Default iframe fallback
    return {
      embedUrl: raw,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      videoType: 'other'
    };
  }

  /**
   * Get cached videos from localStorage
   */
  static getLocalVideos(): KhatamVideoItem[] {
    const deletedIds = this.getDeletedVideoIds();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(v => !deletedIds.has(v.id));
        }
      }
    } catch (e) {
      console.warn("Failed to read local khatam videos:", e);
    }
    return DEFAULT_KHATAM_VIDEOS.filter(v => !deletedIds.has(v.id));
  }

  /**
   * Save videos to localStorage
   */
  static saveLocalVideos(videos: KhatamVideoItem[]): void {
    try {
      const deletedIds = this.getDeletedVideoIds();
      const filtered = videos.filter(v => !deletedIds.has(v.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("Failed to save local khatam videos:", e);
    }
  }

  /**
   * Realtime subscription to Firestore `khatam_videos` collection
   */
  static subscribeToVideos(callback: (videos: KhatamVideoItem[]) => void): () => void {
    const initialLocal = this.getLocalVideos();
    callback(initialLocal);

    // Event listener for instant cross-tab / cross-component sync
    const handleLocalUpdate = () => {
      callback(this.getLocalVideos());
    };
    window.addEventListener('sanctuary_khatam_videos_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    let unsubscribeFirestore = () => {};

    try {
      const videosQuery = query(collection(db, 'khatam_videos'));
      unsubscribeFirestore = onSnapshot(videosQuery, (snapshot) => {
        const deletedIds = this.getDeletedVideoIds();
        if (!snapshot.empty) {
          const list: KhatamVideoItem[] = [];
          snapshot.forEach((docSnap) => {
            if (deletedIds.has(docSnap.id)) return;
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              title: data.title || 'Sacred Quran Reflection',
              url: data.url || '',
              embedUrl: data.embedUrl || data.url || '',
              thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=800',
              category: data.category || 'general',
              categoryLabel: data.categoryLabel || this.getCategoryLabel(data.category || 'general'),
              speaker: data.speaker || 'Scholar of the Ummah',
              description: data.description || '',
              duration: data.duration || '10:00',
              juzNumber: data.juzNumber,
              featured: !!data.featured,
              views: data.views || 0,
              createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
              addedBy: data.addedBy || 'Admin'
            });
          });

          // Merge any locally added videos not yet in Firestore snapshot
          const localList = this.getLocalVideos();
          const firestoreIds = new Set(list.map(v => v.id));
          for (const localVid of localList) {
            if (!firestoreIds.has(localVid.id) && !deletedIds.has(localVid.id)) {
              list.push(localVid);
            }
          }

          // Sort by featured first, then by creation date (newest first)
          list.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          this.saveLocalVideos(list);
          callback(list);
        } else {
          // If Firestore is empty, seed defaults to Firestore
          this.seedInitialVideosIfEmpty();
          callback(this.getLocalVideos());
        }
      }, (error) => {
        console.warn("Firestore khatam_videos subscription fallback:", error);
        callback(this.getLocalVideos());
      });
    } catch (e) {
      console.warn("Error setting up khatam_videos listener:", e);
    }

    return () => {
      window.removeEventListener('sanctuary_khatam_videos_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      unsubscribeFirestore();
    };
  }

  /**
   * Seed default videos to Firestore if empty
   */
  static async seedInitialVideosIfEmpty(): Promise<void> {
    try {
      const deletedIds = this.getDeletedVideoIds();
      const snap = await getDocs(collection(db, 'khatam_videos'));
      if (snap.empty) {
        for (const item of DEFAULT_KHATAM_VIDEOS) {
          if (deletedIds.has(item.id)) continue;
          const videoRef = doc(db, 'khatam_videos', item.id);
          await setDoc(videoRef, {
            ...item,
            createdAt: serverTimestamp()
          });
        }
      }
    } catch (e) {
      console.warn("Could not seed default videos to Firestore:", e);
    }
  }

  /**
   * Add a single video (Admin action)
   */
  static async addVideo(videoData: Partial<KhatamVideoItem>, adminName?: string): Promise<{ success: boolean; id: string; error?: string }> {
    if (!videoData.url || !videoData.url.trim()) {
      return { success: false, id: '', error: 'Please enter a valid video link.' };
    }

    const { embedUrl, thumbnailUrl } = this.parseVideoUrl(videoData.url);
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Ensure it's not marked as deleted
    this.unmarkVideoAsDeleted(videoId);

    const newItem: KhatamVideoItem = {
      id: videoId,
      title: videoData.title?.trim() || `Sacred Khatam Video #${Date.now().toString().slice(-4)}`,
      url: videoData.url.trim(),
      embedUrl: videoData.embedUrl || embedUrl,
      thumbnailUrl: videoData.thumbnailUrl || thumbnailUrl,
      category: videoData.category || 'general',
      categoryLabel: videoData.categoryLabel || this.getCategoryLabel(videoData.category || 'general'),
      speaker: videoData.speaker?.trim() || 'Sanctuary Scholar',
      description: videoData.description?.trim() || 'Reflection and guidance for completing the Holy Quran.',
      duration: videoData.duration?.trim() || '15:00',
      juzNumber: videoData.juzNumber,
      featured: !!videoData.featured,
      views: 0,
      createdAt: new Date().toISOString(),
      addedBy: adminName || 'Super Admin'
    };

    // 1. Update local storage
    const currentLocal = this.getLocalVideos();
    const updated = [newItem, ...currentLocal.filter(v => v.id !== videoId)];
    this.saveLocalVideos(updated);

    // 2. Broadcast local update
    try {
      window.dispatchEvent(new CustomEvent('sanctuary_khatam_videos_updated', { detail: { video: newItem } }));
    } catch (e) {}

    // 3. Write to Firestore
    try {
      const videoRef = doc(db, 'khatam_videos', videoId);
      await setDoc(videoRef, {
        ...newItem,
        createdAt: serverTimestamp()
      });
      return { success: true, id: videoId };
    } catch (e: any) {
      console.warn("Saved to local storage, Firestore write fallback:", e);
      return { success: true, id: videoId };
    }
  }

  /**
   * Bulk add multiple video links (paste as many links as possible!)
   */
  static async bulkAddVideos(linksText: string, defaultCategory: any = 'general', adminName?: string): Promise<{ success: boolean; addedCount: number; errors: string[] }> {
    const lines = linksText.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { success: false, addedCount: 0, errors: ['No video links found to add.'] };
    }

    let addedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let title = '';
      let url = line;

      if (line.includes('|')) {
        const parts = line.split('|');
        title = parts[0].trim();
        url = parts[1].trim();
      } else if (line.includes(' - http')) {
        const parts = line.split(' - http');
        title = parts[0].trim();
        url = `http${parts[1].trim()}`;
      }

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errors.push(`Skipped invalid line: "${line}"`);
        continue;
      }

      const res = await this.addVideo({
        url,
        title: title || `Khatam Journey Video ${addedCount + 1}`,
        category: defaultCategory,
        categoryLabel: this.getCategoryLabel(defaultCategory)
      }, adminName);

      if (res.success) {
        addedCount++;
      }
    }

    return {
      success: addedCount > 0,
      addedCount,
      errors
    };
  }

  /**
   * Delete a video (Admin action - permanent removal)
   */
  static async deleteVideo(videoId: string): Promise<boolean> {
    // 1. Mark as permanently deleted so it NEVER respawns
    this.markVideoAsDeleted(videoId);

    // 2. Remove from local storage
    const current = this.getLocalVideos();
    const next = current.filter(v => v.id !== videoId);
    this.saveLocalVideos(next);

    // 3. Broadcast local update
    try {
      window.dispatchEvent(new CustomEvent('sanctuary_khatam_videos_updated', { detail: { deletedId: videoId } }));
    } catch (e) {}

    // 4. Remove from Firestore
    try {
      const videoRef = doc(db, 'khatam_videos', videoId);
      await deleteDoc(videoRef);
      return true;
    } catch (e) {
      console.warn("Firestore delete fallback, deleted locally and blacklist recorded:", e);
      return true;
    }
  }

  /**
   * Toggle Featured Status
   */
  static async toggleFeatured(videoId: string, currentFeatured: boolean): Promise<boolean> {
    const nextFeatured = !currentFeatured;
    const current = this.getLocalVideos();
    const updated = current.map(v => v.id === videoId ? { ...v, featured: nextFeatured } : v);
    this.saveLocalVideos(updated);

    try {
      window.dispatchEvent(new CustomEvent('sanctuary_khatam_videos_updated', { detail: { videoId, featured: nextFeatured } }));
    } catch (e) {}

    try {
      const videoRef = doc(db, 'khatam_videos', videoId);
      await setDoc(videoRef, { featured: nextFeatured, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (e) {
      console.warn("Firestore featured toggle fallback:", e);
      return true;
    }
  }

  /**
   * Helper to format category labels
   */
  static getCategoryLabel(category: string): string {
    switch (category) {
      case 'tafsir': return 'Tafsir & Reflections';
      case 'dua': return 'Khatam Duas & Supplications';
      case 'motivation': return 'Daily Motivation & Virtues';
      case 'tajweed': return 'Tajweed Masterclass';
      case 'juz_guide': return 'Juz Guides & Schedules';
      default: return 'Khatam Journey Wisdom';
    }
  }
}
