import localforage from 'localforage';
import { Surah, Ayah } from '../types';
import { RECITERS } from '../constants';

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

  async saveAyahs(surahNumber: number, ayahs: Ayah[], reciterId?: number) {
    const key = reciterId ? `surah_${surahNumber}_reciter_${reciterId}_ayahs` : `surah_${surahNumber}_ayahs`;
    await quranStore.setItem(key, ayahs);
    
    // Store metadata about this download
    const downloadedKey = `download_metadata`;
    const metadata: any = await quranStore.getItem(downloadedKey) || {};
    const metaKey = `${surahNumber}_${reciterId || 'default'}`;
    metadata[metaKey] = {
      timestamp: Date.now(),
      ayahCount: ayahs.length,
      isFullyCached: ayahs.every(a => !!a.audioBlob)
    };
    await quranStore.setItem(downloadedKey, metadata);
  }

  async getAyahs(surahNumber: number, reciterId?: number): Promise<Ayah[] | null> {
    const key = reciterId ? `surah_${surahNumber}_reciter_${reciterId}_ayahs` : `surah_${surahNumber}_ayahs`;
    return await quranStore.getItem<Ayah[]>(key);
  }

  async getDownloadStatus(surahNumber: number, reciterId: number): Promise<{ isDownloaded: boolean; progress: number }> {
    const ayahs = await this.getAyahs(surahNumber, reciterId);
    if (!ayahs) return { isDownloaded: false, progress: 0 };
    
    const cachedCount = ayahs.filter(a => !!a.audioBlob).length;
    return {
      isDownloaded: cachedCount === ayahs.length,
      progress: Math.round((cachedCount / ayahs.length) * 100)
    };
  }

  async getAllDownloadedSurahs(): Promise<Record<string, any>> {
    return await quranStore.getItem('download_metadata') || {};
  }

  async mergeAyahs(surahNumber: number, newAyahs: Ayah[], reciterId?: number) {
    const existing = await this.getAyahs(surahNumber, reciterId) || [];
    const merged = [...existing];
    
    newAyahs.forEach(nA => {
      const idx = merged.findIndex(eA => eA.number === nA.number);
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], ...nA };
      } else {
        merged.push(nA);
      }
    });

    // Sort by number to ensure order
    merged.sort((a, b) => a.number - b.number);
    
    await this.saveAyahs(surahNumber, merged, reciterId);
  }

  async removeDownloadedSurah(surahNumber: number, reciterId?: number) {
    const metaKey = `${surahNumber}_${reciterId || 'default'}`;
    const key = reciterId ? `surah_${surahNumber}_reciter_${reciterId}_ayahs` : `surah_${surahNumber}_ayahs`;
    
    await quranStore.removeItem(key);
    
    const metadata: any = await quranStore.getItem('download_metadata') || {};
    delete metadata[metaKey];
    await quranStore.setItem('download_metadata', metadata);
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

  async syncFullReciter(reciterId: number, onProgress?: (progress: SyncProgress) => void) {
    try {
      const reciter = RECITERS.find(r => r.id === reciterId);
      if (!reciter) throw new Error('Reciter not found');

      if (onProgress) onProgress({ total: 114, current: 0, status: 'syncing' });

      for (let i = 1; i <= 114; i++) {
        // First check if we already have the ayahs for this surah/reciter
        let ayahs = await this.getAyahs(i, reciterId);
        
        if (!ayahs) {
          // Fetch if missing
          const ayahRes = await fetch(`https://api.alquran.cloud/v1/surah/${i}/editions/quran-uthmani,en.sahih,${reciter.slug}`);
          const ayahData = await ayahRes.json();
          
          const uthmani = ayahData.data[0].ayahs;
          const translation = ayahData.data[1].ayahs;
          const audio = ayahData.data[2].ayahs;

          ayahs = uthmani.map((a: any, idx: number) => ({
            number: a.number,
            text: a.text,
            numberInSurah: a.numberInSurah,
            translation: translation[idx].text,
            audio: audio[idx].audio
          }));
        }

        // Now download audio blobs for any missing ones
        const updatedAyahs = [...ayahs];
        for (let j = 0; j < updatedAyahs.length; j++) {
          if (updatedAyahs[j].audio && !updatedAyahs[j].audioBlob) {
            try {
              const res = await fetch(updatedAyahs[j].audio, { mode: 'cors' });
              if (res.ok) {
                updatedAyahs[j].audioBlob = await res.blob();
              }
            } catch (e) {
              console.warn(`Failed to sync audio for surah ${i} ayah ${j+1}`, e);
            }
          }
        }

        await this.saveAyahs(i, updatedAyahs, reciterId);

        if (onProgress) {
          onProgress({ 
            total: 114, 
            current: i, 
            status: i === 114 ? 'completed' : 'syncing' 
          });
        }
      }
    } catch (error) {
      console.error('Reciter sync failed:', error);
      if (onProgress) onProgress({ total: 114, current: 0, status: 'error' });
    }
  }
}

export const offlineService = OfflineService.getInstance();
