// Centralized Global Quran Audio Service
// Enables continuous background playback across route changes, browser backgrounding, and MediaSession integration.

import { SURAH_LIST, RECITERS, getAyahAudioUrl } from '../constants';
import { Surah } from '../types';

export interface QuranTrack {
  number: number;           // Global Ayah number (1-6236)
  numberInSurah: number;    // Ayah number in surah (1-N)
  surahNumber: number;      // Surah number (1-114)
  surahName?: string;
  surahEnglishName?: string;
  textArabic: string;
  textTranslation?: string;
  audioUrl: string;
}

export interface QuranAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTrack: QuranTrack | null;
  currentSurah: Surah | null;
  reciterId: number;
  reciterName: string;
  playbackRate: number;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 1
  autoPlayNext: boolean;
  repeatMode: 'none' | 'ayah' | 'surah';
  repeatCount: number;
}

type AudioStateListener = (state: QuranAudioState) => void;

class QuranAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<AudioStateListener> = new Set();
  
  private playlist: QuranTrack[] = [];
  private currentTrackIndex: number = -1;
  private currentSurahData: Surah | null = null;
  private activeReciterId: number = 1; // Default to Mishary Alafasy
  private playbackSpeed: number = 1.0;
  private autoPlayNextAyah: boolean = true;
  private repeatMode: 'none' | 'ayah' | 'surah' = 'none';
  private currentAyahRepeatRemaining: number = 0;

  private state: QuranAudioState = {
    isPlaying: false,
    isLoading: false,
    currentTrack: null,
    currentSurah: null,
    reciterId: 1,
    reciterName: 'Mishary Rashid Alafasy',
    playbackRate: 1.0,
    currentTime: 0,
    duration: 0,
    progress: 0,
    autoPlayNext: true,
    repeatMode: 'none',
    repeatCount: 0
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
      this.setupMediaSession();
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    
    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.state.isLoading = false;
      this.updateMediaSessionPlaybackState('playing');
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.updateMediaSessionPlaybackState('paused');
      this.notify();
    });

    this.audio.addEventListener('waiting', () => {
      this.state.isLoading = true;
      this.notify();
    });

    this.audio.addEventListener('canplay', () => {
      this.state.isLoading = false;
      this.notify();
    });

    this.audio.addEventListener('timeupdate', () => {
      if (!this.audio) return;
      const cur = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      this.state.currentTime = cur;
      this.state.duration = dur;
      this.state.progress = dur > 0 ? cur / dur : 0;
      this.notify();
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn("QuranAudioEngine playback error:", e);
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.notify();
      // Attempt next if autoplaying
      if (this.autoPlayNextAyah) {
        setTimeout(() => this.playNext(), 600);
      }
    });
  }

  private setupMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => this.resume());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && this.audio) {
          this.audio.currentTime = details.seekTime;
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        if (this.audio) {
          this.audio.currentTime = Math.max(0, this.audio.currentTime - (details.seekOffset || 5));
        }
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        if (this.audio) {
          this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + (details.seekOffset || 5));
        }
      });
    } catch (e) {
      console.warn("MediaSession action setup warning:", e);
    }
  }

  private updateMediaSessionMetadata(track: QuranTrack, surah: Surah | null) {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const surahName = surah ? `Surah ${surah.englishName} (${surah.name})` : `Surah ${track.surahNumber}`;
    const title = `${surahName} • Ayah ${track.numberInSurah}`;
    const artist = this.state.reciterName || 'Sacred Quran Reciter';

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album: 'Sanctuary • The Holy Quran',
        artwork: [
          { src: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80&w=512', sizes: '512x512', type: 'image/jpeg' },
          { src: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&q=80&w=256', sizes: '256x256', type: 'image/jpeg' }
        ]
      });
    } catch (e) {
      console.warn("MediaMetadata update error:", e);
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none') {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state;
      } catch {}
    }
  }

  private updateMediaSessionPosition() {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && this.audio) {
      try {
        if (this.audio.duration && !isNaN(this.audio.duration)) {
          navigator.mediaSession.setPositionState({
            duration: this.audio.duration,
            playbackRate: this.audio.playbackRate || 1,
            position: this.audio.currentTime || 0
          });
        }
      } catch {}
    }
  }

  private handleTrackEnded() {
    if (this.repeatMode === 'ayah') {
      if (this.currentAyahRepeatRemaining > 1) {
        this.currentAyahRepeatRemaining--;
        this.replayCurrentTrack();
        return;
      }
    }

    if (this.autoPlayNextAyah) {
      if (this.currentTrackIndex < this.playlist.length - 1) {
        this.playTrackIndex(this.currentTrackIndex + 1);
      } else if (this.repeatMode === 'surah') {
        this.playTrackIndex(0);
      } else {
        // Automatically check if next Surah exists (Whole Quran flow)
        if (this.currentSurahData && this.currentSurahData.number < 114) {
          this.loadAndPlayNextSurah(this.currentSurahData.number + 1);
        } else {
          this.state.isPlaying = false;
          this.notify();
        }
      }
    } else {
      this.state.isPlaying = false;
      this.notify();
    }
  }

  private async loadAndPlayNextSurah(nextSurahNumber: number) {
    try {
      const surahObj = SURAH_LIST.find(s => s.number === nextSurahNumber);
      if (!surahObj) return;

      const res = await fetch(`/api/proxy/alquran/surah/${nextSurahNumber}/quran-uthmani`);
      const data = await res.json();
      
      if (data?.data?.ayahs && Array.isArray(data.data.ayahs)) {
        const tracks: QuranTrack[] = data.data.ayahs.map((a: any) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          surahNumber: nextSurahNumber,
          surahName: surahObj.name,
          surahEnglishName: surahObj.englishName,
          textArabic: a.text,
          audioUrl: getAyahAudioUrl(this.activeReciterId, nextSurahNumber, a.numberInSurah, a.number)
        }));

        this.setPlaylist(tracks, surahObj, this.activeReciterId, 0, true);
      }
    } catch (e) {
      console.warn("Auto-advance to next Surah failed:", e);
    }
  }

  /**
   * Set and immediately play a playlist of Ayahs for a Surah / Juz / Page
   */
  public setPlaylist(
    tracks: QuranTrack[],
    surah: Surah | null,
    reciterId: number,
    startIndex: number = 0,
    autoPlay: boolean = true
  ) {
    this.initAudio();
    this.playlist = tracks;
    this.currentSurahData = surah;
    this.activeReciterId = reciterId;
    
    const reciterObj = RECITERS.find(r => r.id === reciterId);
    if (reciterObj) {
      this.state.reciterId = reciterId;
      this.state.reciterName = reciterObj.name;
    }

    this.state.currentSurah = surah;

    if (tracks.length > 0 && startIndex >= 0 && startIndex < tracks.length) {
      this.playTrackIndex(startIndex, autoPlay);
    }
  }

  public playTrackIndex(index: number, autoPlay: boolean = true) {
    this.initAudio();
    if (index < 0 || index >= this.playlist.length || !this.audio) return;

    this.currentTrackIndex = index;
    const track = this.playlist[index];
    this.state.currentTrack = track;
    this.state.isLoading = true;

    this.updateMediaSessionMetadata(track, this.currentSurahData);

    const streamUrl = this.getDirectOrProxiedAudioUrl(track.audioUrl);
    this.audio.src = streamUrl;
    this.audio.playbackRate = this.playbackSpeed;

    if (autoPlay) {
      this.audio.play().catch((e) => {
        console.warn("Quran audio play error:", e);
        this.state.isLoading = false;
        this.notify();
      });
    }

    this.notify();
  }

  public playAyahByGlobalNumber(globalAyahNumber: number) {
    const idx = this.playlist.findIndex(t => t.number === globalAyahNumber);
    if (idx !== -1) {
      this.playTrackIndex(idx, true);
    }
  }

  public replayCurrentTrack() {
    if (this.audio) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    }
  }

  public resume() {
    this.initAudio();
    if (this.audio && this.state.currentTrack) {
      this.audio.play().catch(() => {});
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }

  public togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public playNext() {
    if (this.currentTrackIndex < this.playlist.length - 1) {
      this.playTrackIndex(this.currentTrackIndex + 1, true);
    } else if (this.currentSurahData && this.currentSurahData.number < 114) {
      this.loadAndPlayNextSurah(this.currentSurahData.number + 1);
    }
  }

  public playPrevious() {
    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
    } else if (this.currentTrackIndex > 0) {
      this.playTrackIndex(this.currentTrackIndex - 1, true);
    }
  }

  public seek(seconds: number) {
    if (this.audio && this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
    }
  }

  public seekProgress(fraction: number) {
    if (this.audio && this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, fraction * this.audio.duration));
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackSpeed = rate;
    this.state.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    this.notify();
  }

  public setReciter(reciterId: number) {
    this.activeReciterId = reciterId;
    const reciterObj = RECITERS.find(r => r.id === reciterId);
    if (reciterObj) {
      this.state.reciterId = reciterId;
      this.state.reciterName = reciterObj.name;
    }
    this.notify();
  }

  public stop() {
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.removeAttribute('src');
        this.audio.load();
      } catch (e) {
        console.warn("Audio reset warning:", e);
      }
    }
    this.state.isPlaying = false;
    this.state.isLoading = false;
    this.state.currentTrack = null;
    this.currentTrackIndex = -1;
    this.playlist = [];
    this.updateMediaSessionPlaybackState('none');
    this.notify();
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }

  public getState(): QuranAudioState {
    return { ...this.state };
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = this.getState();
    this.listeners.forEach(l => l(copy));
  }

  private getDirectOrProxiedAudioUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    return url;
  }
}

export const QuranAudioService = new QuranAudioEngine();
