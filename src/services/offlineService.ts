import localforage from 'localforage';
import { Surah, Ayah } from '../types';

const quranStore = localforage.createInstance({
  name: 'AnNurCache',
  storeName: 'quran_v1'
});

export interface SyncProgress {
  total: number;
  current: number;
  status: 'idle' | 'syncing' | 'completed' | 'error';
}

class OfflineService {
  private static instance: OfflineService;

  private constructor() {}

  static getInstance() {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async saveSurahs(surahs: Surah[]) {
    await quranStore.setItem('surah_list', surahs);
  }

  async getSurahs(): Promise<Surah[] | null> {
    return await quranStore.getItem<Surah[]>('surah_list');
  }

  async saveAyahs(surahNumber: number, ayahs: Ayah[]) {
    await quranStore.setItem(`surah_${surahNumber}_ayahs`, ayahs);
  }

  async getAyahs(surahNumber: number): Promise<Ayah[] | null> {
    return await quranStore.getItem<Ayah[]>(`surah_${surahNumber}_ayahs`);
  }

  async clearCache() {
    await quranStore.clear();
  }

  async getCacheSize(): Promise<string> {
    let totalSize = 0;
    try {
      const keys = await quranStore.keys();
      for (const key of keys) {
        const item = await quranStore.getItem(key);
        if (item) {
          // rough estimate via JSON stringify length (2 bytes per char for UTF-16)
          totalSize += JSON.stringify(item).length * 2;
        }
      }
    } catch (e) {
      console.error('Error calculating cache size', e);
    }
    
    if (totalSize === 0) return '0 KB';
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(1)} KB`;
    return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  async syncFullQuran(onProgress?: (progress: SyncProgress) => void) {
    try {
      if (onProgress) onProgress({ total: 114, current: 0, status: 'syncing' });

      // 1. Fetch and save Surah list
      const surahRes = await fetch('https://api.alquran.cloud/v1/surah');
      const surahData = await surahRes.json();
      await this.saveSurahs(surahData.data);

      // 2. Fetch all Ayahs (This can be a heavy operation, so we do it surah by surah)
      for (let i = 1; i <= 114; i++) {
        const ayahRes = await fetch(`https://api.alquran.cloud/v1/surah/${i}/editions/quran-uthmani,en.sahih,ar.alafasy`);
        const ayahData = await ayahRes.json();
        
        // Structure the data to match expected APP types
        const uthmani = ayahData.data[0].ayahs;
        const translation = ayahData.data[1].ayahs;
        const audio = ayahData.data[2].ayahs;

        const combinedAyahs: Ayah[] = uthmani.map((a: any, idx: number) => ({
          number: a.number,
          text: a.text,
          numberInSurah: a.numberInSurah,
          translation: translation[idx].text,
          audio: audio[idx].audio
        }));

        await this.saveAyahs(i, combinedAyahs);
        
        if (onProgress) {
          onProgress({ 
            total: 114, 
            current: i, 
            status: i === 114 ? 'completed' : 'syncing' 
          });
        }
      }
    } catch (error) {
      console.error('Offline sync failed:', error);
      if (onProgress) onProgress({ total: 114, current: 0, status: 'error' });
    }
  }
}

export const offlineService = OfflineService.getInstance();
