import { getAudioStreamUrl } from '../lib/api';

export class VoiceService {
  private static synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static audio: HTMLAudioElement | null = null;
  private static onEndCallback: (() => void) | null = null;

  static speak(text: string, lang: 'ar' | 'en' = 'ar', onEnd?: () => void) {
    this.stop();
    this.onEndCallback = onEnd || null;

    try {
      const cleanText = text.replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`;
      const streamUrl = getAudioStreamUrl(ttsUrl);

      const audioObj = new Audio(streamUrl);
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
            console.warn("TTS stream play failed, falling back to local speech synthesis:", err);
            this.speakWithSynthesis(text, lang, onEnd);
          });
      }
    } catch (e) {
      console.warn("Failed to play TTS audio, falling back to synthesis:", e);
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
        if (onEnd) onEnd();
      };
      
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error", e);
        if (onEnd) onEnd();
      };
      
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (onEnd) onEnd();
    }
  }

  static stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.src = "";
      } catch (e) {}
      this.audio = null;
    }
    if (this.onEndCallback) {
      this.onEndCallback = null;
    }
  }
}
