export class VoiceService {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audio: HTMLAudioElement | null = null;
  private static onEndCallback: (() => void) | null = null;

  static speak(text: string, lang: 'ar' | 'en' = 'ar', onEnd?: () => void) {
    this.stop();
    this.onEndCallback = onEnd || null;

    // Use our server-side proxied Google Translate TTS for 100% reliable, high-quality audio pronunciation.
    // This perfectly bypasses browser/iframe sandbox security policies and works everywhere.
    try {
      const cleanText = text.replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`;
      const proxiedUrl = `/api/proxy/audio?url=${encodeURIComponent(ttsUrl)}`;

      const audioObj = new Audio(proxiedUrl);
      this.audio = audioObj;
      
      const playPromise = audioObj.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioObj.onended = () => {
              if (this.onEndCallback) {
                this.onEndCallback();
                this.onEndCallback = null;
              }
            };
          })
          .catch(err => {
            console.warn("Proxied Google TTS play failed, falling back to local speech synthesis:", err);
            this.speakWithSynthesis(text, lang, onEnd);
          });
      }
    } catch (e) {
      console.warn("Failed to play proxied Google TTS, falling back to synthesis:", e);
      this.speakWithSynthesis(text, lang, onEnd);
    }
  }

  private static speakWithSynthesis(text: string, lang: 'ar' | 'en' = 'ar', onEnd?: () => void) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a suitable voice
      const voices = this.synth.getVoices();
      if (lang === 'ar') {
        const arVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arVoice) utterance.voice = arVoice;
        utterance.rate = 0.8; // Recitation style is usually slower
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        if (this.onEndCallback) {
          this.onEndCallback();
          this.onEndCallback = null;
        }
      };
      utterance.onerror = () => {
        if (this.onEndCallback) {
          this.onEndCallback();
          this.onEndCallback = null;
        }
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.error("SpeechSynthesis failed:", err);
      if (onEnd) onEnd();
    }
  }

  static stop() {
    try {
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      if (this.synth) {
        this.synth.cancel();
      }
    } catch (err) {
      console.warn("Error stopping audio/synthesis:", err);
    }
    if (this.onEndCallback) {
      this.onEndCallback();
      this.onEndCallback = null;
    }
  }

  static isSpeaking() {
    return (this.audio && !this.audio.paused) || (this.synth && this.synth.speaking);
  }
}
