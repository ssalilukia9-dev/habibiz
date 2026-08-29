import { ReadLaterItem } from '../types.ts';

const STORAGE_KEY = 'sanctuary_read_later_queue';
const EVENT_KEY = 'sanctuary_read_later_updated';

class ReadLaterService {
  private static instance: ReadLaterService;
  private listeners: Set<(items: ReadLaterItem[]) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.notifyListeners();
        }
      });
    }
  }

  public static getInstance(): ReadLaterService {
    if (!ReadLaterService.instance) {
      ReadLaterService.instance = new ReadLaterService();
    }
    return ReadLaterService.instance;
  }

  public getItems(): ReadLaterItem[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse read later items:", e);
      return [];
    }
  }

  private saveItems(items: ReadLaterItem[]): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        this.notifyListeners();
        window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: items }));
      }
    } catch (e) {
      console.error("Failed to save read later items:", e);
    }
  }

  private notifyListeners(): void {
    const items = this.getItems();
    this.listeners.forEach(cb => cb(items));
  }

  public subscribe(callback: (items: ReadLaterItem[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.getItems());
    return () => {
      this.listeners.delete(callback);
    };
  }

  public isItemInQueue(id: string): boolean {
    const items = this.getItems();
    return items.some(item => item.id === id);
  }

  public addItem(item: Omit<ReadLaterItem, 'addedAt' | 'isRead'>): ReadLaterItem {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.id === item.id);

    // Calculate approximate read time based on text length (~150 words per minute)
    const wordCount = (item.arabic + ' ' + (item.translation || '')).split(/\s+/).length;
    const estSeconds = Math.max(20, Math.ceil((wordCount / 130) * 60));

    const newItem: ReadLaterItem = {
      ...item,
      addedAt: Date.now(),
      isRead: false,
      estimatedReadTimeSeconds: estSeconds
    };

    if (existingIndex >= 0) {
      items[existingIndex] = { ...items[existingIndex], ...newItem };
    } else {
      items.unshift(newItem);
    }

    this.saveItems(items);
    return newItem;
  }

  public addAyah(
    surahNumber: number,
    surahName: string,
    ayah: { number: number; numberInSurah: number; text: string; translation?: string; audio?: string },
    surahEnglishName?: string
  ): ReadLaterItem {
    const id = `ayah-${surahNumber}-${ayah.numberInSurah || ayah.number}`;
    return this.addItem({
      id,
      type: 'ayah',
      title: `${surahEnglishName || surahName} ${surahNumber}:${ayah.numberInSurah || ayah.number}`,
      subtitle: surahName,
      arabic: ayah.text,
      translation: ayah.translation || 'No translation provided',
      source: surahEnglishName || surahName,
      reference: `Verse ${ayah.numberInSurah || ayah.number}`,
      surahNumber,
      numberInSurah: ayah.numberInSurah || ayah.number
    });
  }

  public addHadith(hadith: {
    id: number;
    narrator: string;
    arabic: string;
    english: string;
    collection: string;
    topic: string;
  }): ReadLaterItem {
    const id = `hadith-${hadith.id}`;
    return this.addItem({
      id,
      type: 'hadith',
      title: `${hadith.collection} #${hadith.id}`,
      subtitle: `Reported by ${hadith.narrator}`,
      arabic: hadith.arabic,
      translation: hadith.english,
      source: hadith.collection,
      reference: `Hadith #${hadith.id}`,
      topic: hadith.topic,
      hadithId: hadith.id,
      hadithCollection: hadith.collection
    });
  }

  public toggleItem(item: Omit<ReadLaterItem, 'addedAt' | 'isRead'>): boolean {
    if (this.isItemInQueue(item.id)) {
      this.removeItem(item.id);
      return false; // Removed
    } else {
      this.addItem(item);
      return true; // Added
    }
  }

  public toggleAyah(
    surahNumber: number,
    surahName: string,
    ayah: { number: number; numberInSurah: number; text: string; translation?: string },
    surahEnglishName?: string
  ): boolean {
    const id = `ayah-${surahNumber}-${ayah.numberInSurah || ayah.number}`;
    if (this.isItemInQueue(id)) {
      this.removeItem(id);
      return false;
    } else {
      this.addAyah(surahNumber, surahName, ayah, surahEnglishName);
      return true;
    }
  }

  public toggleHadith(hadith: {
    id: number;
    narrator: string;
    arabic: string;
    english: string;
    collection: string;
    topic: string;
  }): boolean {
    const id = `hadith-${hadith.id}`;
    if (this.isItemInQueue(id)) {
      this.removeItem(id);
      return false;
    } else {
      this.addHadith(hadith);
      return true;
    }
  }

  public removeItem(id: string): void {
    const items = this.getItems().filter(item => item.id !== id);
    this.saveItems(items);
  }

  public toggleReadStatus(id: string): boolean {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return false;

    item.isRead = !item.isRead;
    item.readAt = item.isRead ? Date.now() : undefined;
    this.saveItems(items);
    return item.isRead;
  }

  public markAllAsRead(): void {
    const items = this.getItems().map(item => ({
      ...item,
      isRead: true,
      readAt: item.readAt || Date.now()
    }));
    this.saveItems(items);
  }

  public clearCompleted(): void {
    const items = this.getItems().filter(item => !item.isRead);
    this.saveItems(items);
  }

  public clearQueue(): void {
    this.saveItems([]);
  }

  public getUnreadCount(): number {
    return this.getItems().filter(item => !item.isRead).length;
  }
}

export const readLaterService = ReadLaterService.getInstance();
