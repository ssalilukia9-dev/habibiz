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

export interface IslamicTeachingItem {
  id: string;
  title: string;
  imageUrl: string;
  category: 'hadith_pearls' | 'quran_insights' | 'akhlaq_character' | 'daily_reminders' | 'prophetic_sunnah' | 'spirituality';
  categoryLabel?: string;
  arabicText?: string;
  content: string;
  scholarOrSource?: string;
  featured?: boolean;
  likes?: number;
  views?: number;
  createdAt: string;
  addedBy?: string;
}

// Built-in starter collection of Sacred Islamic Wisdom & Teachings
export const DEFAULT_ISLAMIC_TEACHINGS: IslamicTeachingItem[] = [
  {
    id: 'wisdom_kindness_creation',
    title: 'Mercy Towards All Living Creatures',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
    category: 'prophetic_sunnah',
    categoryLabel: 'Prophetic Sunnah',
    arabicText: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    content: 'The Prophet Muhammad (ﷺ) said: "The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth, and the One in the heavens will have mercy upon you." (Sunan al-Tirmidhi 1924)',
    scholarOrSource: 'Sunan al-Tirmidhi (Sahih)',
    featured: true,
    likes: 342,
    views: 1820,
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'wisdom_patience_sabr',
    title: 'The Light of Patience (Sabr) in Trials',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&q=80&w=1000',
    category: 'quran_insights',
    categoryLabel: 'Quranic Insights',
    arabicText: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ',
    content: 'Allah says: "Only those who are patient shall receive their reward in full, without reckoning." (Surah Az-Zumar, 39:10). Sabr is not passive resignation; it is radiant composure and active resilience while holding fast to trust in Allah.',
    scholarOrSource: 'Surah Az-Zumar (39:10)',
    featured: true,
    likes: 512,
    views: 2950,
    createdAt: new Date('2026-01-05').toISOString()
  },
  {
    id: 'wisdom_sincerity_ikhlas',
    title: 'Purity of Intention: The Heart of Every Deed',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=1000',
    category: 'spirituality',
    categoryLabel: 'Inner Spirituality',
    arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    content: 'Ibn al-Qayyim remarked: "Deeds without sincerity (Ikhlas) and without following the Sunnah are like a traveler who fills his pouch with dust; it burdens him yet brings no nourishment."',
    scholarOrSource: 'Imam Ibn al-Qayyim al-Jawziyya',
    featured: true,
    likes: 428,
    views: 2100,
    createdAt: new Date('2026-01-10').toISOString()
  },
  {
    id: 'wisdom_beautiful_character',
    title: 'The Heaviest Thing on the Scale: Noble Character (Husn al-Khuluq)',
    imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=1000',
    category: 'akhlaq_character',
    categoryLabel: 'Akhlaq & Character',
    arabicText: 'مَا مِنْ شَيْءٍ أَثْقَلُ فِي مِيزَانِ الْمُؤْمِنِ يَوْمَ الْقِيَامَةِ مِنْ حُسْنِ الْخُلُقِ',
    content: 'Nothing is heavier on the scale of a believer on the Day of Judgment than good manners and a beautiful character. A gentle word, forgiving a brother, smiling at strangers, and swallowing anger elevate ranks exponentially.',
    scholarOrSource: 'Hadith Sahih (Al-Tirmidhi)',
    featured: false,
    likes: 298,
    views: 1450,
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'wisdom_gratitude_shukr',
    title: 'The Key to Increase: Gratitude in Every Condition',
    imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=1000',
    category: 'daily_reminders',
    categoryLabel: 'Daily Reminders',
    arabicText: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    content: '"If you are grateful, I will surely increase you [in favor]." (Surah Ibrahim 14:7). When you thank Allah for the breath in your lungs, the water in your glass, and the faith in your heart, unseen doors of peace and barakah swing wide open.',
    scholarOrSource: 'Surah Ibrahim (14:7)',
    featured: false,
    likes: 389,
    views: 1720,
    createdAt: new Date('2026-01-20').toISOString()
  },
  {
    id: 'wisdom_hadith_seeking_knowledge',
    title: 'The Sacred Path: Seeking Beneficial Knowledge',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000',
    category: 'hadith_pearls',
    categoryLabel: 'Hadith Pearls',
    arabicText: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    content: 'The Messenger of Allah (ﷺ) said: "Whoever takes a path upon which he seeks knowledge, Allah makes the path to Paradise easy for him." (Sahih Muslim 2699)',
    scholarOrSource: 'Sahih Muslim',
    featured: true,
    likes: 620,
    views: 3100,
    createdAt: new Date('2026-01-25').toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'sanctuary_islamic_teachings_v1';
const DELETED_TEACHINGS_KEY = 'sanctuary_deleted_teachings_ids_v1';

export class IslamicWisdomService {
  /**
   * Get set of permanently deleted teaching IDs
   */
  static getDeletedTeachingIds(): Set<string> {
    try {
      const saved = localStorage.getItem(DELETED_TEACHINGS_KEY);
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
   * Mark teaching as permanently deleted
   */
  static markTeachingAsDeleted(teachingId: string): void {
    try {
      const current = this.getDeletedTeachingIds();
      current.add(teachingId);
      localStorage.setItem(DELETED_TEACHINGS_KEY, JSON.stringify(Array.from(current)));
    } catch (e) {}
  }

  /**
   * Get cached teachings from localStorage
   */
  static getLocalTeachings(): IslamicTeachingItem[] {
    const deletedIds = this.getDeletedTeachingIds();
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(t => !deletedIds.has(t.id));
        }
      }
    } catch (e) {
      console.warn("Failed to read local islamic teachings:", e);
    }
    return DEFAULT_ISLAMIC_TEACHINGS.filter(t => !deletedIds.has(t.id));
  }

  /**
   * Save teachings to localStorage
   */
  static saveLocalTeachings(teachings: IslamicTeachingItem[]): void {
    try {
      const deletedIds = this.getDeletedTeachingIds();
      const filtered = teachings.filter(t => !deletedIds.has(t.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("Failed to save local islamic teachings:", e);
    }
  }

  /**
   * Realtime subscription to Firestore `islamic_teachings` collection
   */
  static subscribeToTeachings(callback: (teachings: IslamicTeachingItem[]) => void): () => void {
    const local = this.getLocalTeachings();
    callback(local);

    try {
      const q = query(collection(db, 'islamic_teachings'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const deletedIds = this.getDeletedTeachingIds();
        if (!snapshot.empty) {
          const list: IslamicTeachingItem[] = [];
          snapshot.forEach((docSnap) => {
            if (deletedIds.has(docSnap.id)) return;
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              title: data.title || 'Sacred Islamic Teaching',
              imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
              category: data.category || 'spirituality',
              categoryLabel: data.categoryLabel || this.getCategoryLabel(data.category || 'spirituality'),
              arabicText: data.arabicText || '',
              content: data.content || '',
              scholarOrSource: data.scholarOrSource || 'Islamic Classical Tradition',
              featured: !!data.featured,
              likes: data.likes || 0,
              views: data.views || 0,
              createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
              addedBy: data.addedBy || 'Admin'
            });
          });

          // Sort by featured first, then by creation date
          list.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          this.saveLocalTeachings(list);
          callback(list);
        } else {
          callback(this.getLocalTeachings());
        }
      }, (error) => {
        console.warn("Firestore islamic_teachings subscription fallback:", error);
        callback(this.getLocalTeachings());
      });

      return unsubscribe;
    } catch (e) {
      console.warn("Error setting up islamic_teachings listener:", e);
      return () => {};
    }
  }

  /**
   * Add a single Islamic teaching (Admin action)
   */
  static async addTeaching(data: Partial<IslamicTeachingItem>, adminName?: string): Promise<{ success: boolean; id: string; error?: string }> {
    if (!data.title?.trim() || !data.content?.trim()) {
      return { success: false, id: '', error: 'Please enter a title and teaching content.' };
    }

    const teachingId = `teaching_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const category = data.category || 'daily_reminders';

    const newItem: IslamicTeachingItem = {
      id: teachingId,
      title: data.title.trim(),
      imageUrl: data.imageUrl?.trim() || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000',
      category,
      categoryLabel: data.categoryLabel || this.getCategoryLabel(category),
      arabicText: data.arabicText?.trim() || '',
      content: data.content.trim(),
      scholarOrSource: data.scholarOrSource?.trim() || 'Sacred Tradition',
      featured: !!data.featured,
      likes: 0,
      views: 0,
      createdAt: new Date().toISOString(),
      addedBy: adminName || 'Super Admin'
    };

    // 1. Update local storage
    const currentLocal = this.getLocalTeachings();
    const updated = [newItem, ...currentLocal];
    this.saveLocalTeachings(updated);

    // 2. Write to Firestore
    try {
      const docRef = doc(db, 'islamic_teachings', teachingId);
      await setDoc(docRef, {
        ...newItem,
        createdAt: serverTimestamp()
      });
      return { success: true, id: teachingId };
    } catch (e: any) {
      console.warn("Saved to local storage, Firestore write fallback:", e);
      return { success: true, id: teachingId };
    }
  }

  /**
   * Bulk add multiple teachings / picture cards
   */
  static async bulkAddTeachings(
    items: Array<{ title: string; imageUrl?: string; content: string; category?: any; scholarOrSource?: string; arabicText?: string }>,
    adminName?: string
  ): Promise<{ success: boolean; addedCount: number; errors: string[] }> {
    let addedCount = 0;
    const errors: string[] = [];

    for (const item of items) {
      if (!item.title || !item.content) continue;
      const res = await this.addTeaching({
        title: item.title,
        imageUrl: item.imageUrl,
        content: item.content,
        category: item.category || 'daily_reminders',
        scholarOrSource: item.scholarOrSource,
        arabicText: item.arabicText
      }, adminName);

      if (res.success) {
        addedCount++;
      } else if (res.error) {
        errors.push(res.error);
      }
    }

    return {
      success: addedCount > 0,
      addedCount,
      errors
    };
  }

  /**
   * Delete a teaching permanently (Admin action)
   */
  static async deleteTeaching(teachingId: string): Promise<boolean> {
    // 1. Mark as permanently deleted
    this.markTeachingAsDeleted(teachingId);

    // 2. Remove from local storage
    const current = this.getLocalTeachings();
    const next = current.filter(t => t.id !== teachingId);
    this.saveLocalTeachings(next);

    // 3. Remove from Firestore
    try {
      const docRef = doc(db, 'islamic_teachings', teachingId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.warn("Firestore delete fallback, deleted locally and blacklist recorded:", e);
      return true;
    }
  }

  /**
   * Toggle Featured status
   */
  static async toggleFeatured(teachingId: string, currentFeatured: boolean): Promise<boolean> {
    const nextFeatured = !currentFeatured;
    const current = this.getLocalTeachings();
    const updated = current.map(t => t.id === teachingId ? { ...t, featured: nextFeatured } : t);
    this.saveLocalTeachings(updated);

    try {
      const docRef = doc(db, 'islamic_teachings', teachingId);
      await setDoc(docRef, { featured: nextFeatured, updatedAt: serverTimestamp() }, { merge: true });
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
      case 'hadith_pearls': return 'Hadith Pearls';
      case 'quran_insights': return 'Quranic Insights';
      case 'akhlaq_character': return 'Akhlaq & Character';
      case 'daily_reminders': return 'Daily Reminders';
      case 'prophetic_sunnah': return 'Prophetic Sunnah';
      case 'spirituality': return 'Inner Spirituality & Tazkiyah';
      default: return 'Islamic Wisdom & Teachings';
    }
  }
}
