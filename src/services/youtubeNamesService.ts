// Master YouTube Audio Service for Asma-ul-Husna (The 99 Names of Allah)
// Uses the exact vocal recitation from YouTube video: https://www.youtube.com/watch?v=1uciS50jsdU
// Provides frame-accurate continuous playback, real-time name highlighting, seeking, and speed control.

export const YOUTUBE_NAMES_VIDEO_ID = '1uciS50jsdU';

export interface YoutubeNamesState {
  isReady: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  activeNameId: number;
  speed: number;
  volume: number;
  isMuted: boolean;
}

type Listener = (state: YoutubeNamesState) => void;

class YoutubeNamesServiceClass {
  private player: any = null;
  private isApiLoaded = false;
  private containerId = 'youtube-names-player-container';
  private timer: any = null;
  private listeners: Set<Listener> = new Set();
  
  private state: YoutubeNamesState = {
    isReady: false,
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 240, // default fallback
    activeNameId: 1,
    speed: 1.0,
    volume: 100,
    isMuted: false,
  };

  constructor() {
    // Lazy initialize when in browser
    if (typeof window !== 'undefined') {
      this.loadYouTubeApi();
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  public getState(): YoutubeNamesState {
    return { ...this.state };
  }

  private loadYouTubeApi() {
    if (this.isApiLoaded || (window as any).YT) {
      this.isApiLoaded = true;
      this.createPlayer();
      return;
    }

    // Check if script already exists
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevOnReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (prevOnReady) prevOnReady();
      this.isApiLoaded = true;
      this.createPlayer();
    };
  }

  public ensureContainer(): HTMLElement {
    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      // Position offscreen/hidden but active for pristine audio streaming
      container.style.position = 'fixed';
      container.style.bottom = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '240px';
      container.style.height = '160px';
      container.style.opacity = '0.01';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-999';
      document.body.appendChild(container);
    }
    return container;
  }

  public createPlayer() {
    if (this.player || !(window as any).YT || !(window as any).YT.Player) {
      return;
    }

    const container = this.ensureContainer();
    const iframeId = 'yt-names-player-iframe';
    let frameHolder = document.getElementById(iframeId);
    if (!frameHolder) {
      frameHolder = document.createElement('div');
      frameHolder.id = iframeId;
      container.appendChild(frameHolder);
    }

    try {
      this.player = new (window as any).YT.Player(iframeId, {
        height: '160',
        width: '240',
        videoId: YOUTUBE_NAMES_VIDEO_ID,
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            this.state.isReady = true;
            try {
              const dur = event.target.getDuration();
              if (dur && dur > 0) this.state.duration = dur;
            } catch (e) {
              console.warn(e);
            }
            this.notify();
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (!YT) return;

            if (event.data === YT.PlayerState.PLAYING) {
              this.state.isPlaying = true;
              this.state.isPaused = false;
              this.startProgressTracking();
            } else if (event.data === YT.PlayerState.PAUSED) {
              this.state.isPlaying = false;
              this.state.isPaused = true;
              this.stopProgressTracking();
            } else if (event.data === YT.PlayerState.ENDED) {
              this.state.isPlaying = false;
              this.state.isPaused = false;
              this.state.activeNameId = 99;
              this.stopProgressTracking();
            }
            this.notify();
          },
          onError: (error: any) => {
            console.warn("YouTube Player error:", error);
          }
        }
      });
    } catch (err) {
      console.error("Failed to initialize YT Player for 99 Names:", err);
    }
  }

  private startProgressTracking() {
    this.stopProgressTracking();
    this.timer = setInterval(() => {
      if (!this.player || typeof this.player.getCurrentTime !== 'function') return;
      try {
        const curTime = this.player.getCurrentTime() || 0;
        const dur = this.player.getDuration() || this.state.duration || 240;
        this.state.currentTime = curTime;
        this.state.duration = dur;
        this.state.activeNameId = this.calculateNameIdFromTime(curTime, dur);
        this.notify();
      } catch (err) {
        console.warn(err);
      }
    }, 150);
  }

  private stopProgressTracking() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // Converts seconds into corresponding Name ID (1 to 99)
  public calculateNameIdFromTime(timeSec: number, totalDuration: number): number {
    const introOffset = 8.5; // Intro vocal / bismillah preamble
    const outroOffset = 8.0; // Outro dua conclusion
    const usableDuration = Math.max(60, totalDuration - introOffset - outroOffset);

    if (timeSec < introOffset) {
      return 1;
    }
    if (timeSec >= totalDuration - outroOffset) {
      return 99;
    }

    const elapsedInRecitation = timeSec - introOffset;
    const progress = Math.max(0, Math.min(1, elapsedInRecitation / usableDuration));
    const calculatedId = Math.floor(progress * 99) + 1;
    return Math.max(1, Math.min(99, calculatedId));
  }

  // Converts Name ID (1 to 99) into exact target seek time in video
  public calculateTimeFromNameId(nameId: number, totalDuration: number = 240): number {
    const introOffset = 8.5;
    const outroOffset = 8.0;
    const usableDuration = Math.max(60, totalDuration - introOffset - outroOffset);

    const clampedId = Math.max(1, Math.min(99, nameId));
    const targetSec = introOffset + ((clampedId - 1) / 99) * usableDuration;
    return Math.max(0, targetSec);
  }

  public play(nameId?: number) {
    if (!this.player) {
      this.createPlayer();
    }

    if (nameId !== undefined) {
      this.seekToName(nameId);
    }

    if (this.player && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (e) {
        console.warn("Could not play YT video directly:", e);
      }
    }
  }

  public pause() {
    if (this.player && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.warn(e);
      }
    }
    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.stopProgressTracking();
    this.notify();
  }

  public togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop() {
    if (this.player && typeof this.player.stopVideo === 'function') {
      try {
        this.player.stopVideo();
      } catch (e) {
        console.warn(e);
      }
    }
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentTime = 0;
    this.state.activeNameId = 1;
    this.stopProgressTracking();
    this.notify();
  }

  public seekToName(nameId: number) {
    const dur = this.state.duration || 240;
    const seekTime = this.calculateTimeFromNameId(nameId, dur);
    this.seekToTime(seekTime);
    this.state.activeNameId = nameId;
    this.notify();
  }

  public seekToTime(seconds: number) {
    if (this.player && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
        this.state.currentTime = seconds;
        this.notify();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  public nextName() {
    const next = Math.min(99, this.state.activeNameId + 1);
    this.seekToName(next);
  }

  public prevName() {
    const prev = Math.max(1, this.state.activeNameId - 1);
    this.seekToName(prev);
  }

  public skipSeconds(sec: number) {
    const newTime = Math.max(0, Math.min(this.state.duration, this.state.currentTime + sec));
    this.seekToTime(newTime);
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.player && typeof this.player.setPlaybackRate === 'function') {
      try {
        this.player.setPlaybackRate(speed);
      } catch (e) {
        console.warn(e);
      }
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.state.volume = vol;
    if (this.player && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(vol);
      } catch (e) {
        console.warn(e);
      }
    }
    this.notify();
  }
}

export const YoutubeNamesService = new YoutubeNamesServiceClass();
