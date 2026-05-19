export class VoiceService {
  private static synth = window.speechSynthesis;

  static speak(text: string, lang: 'ar' | 'en' = 'ar') {
    if (this.synth.speaking) {
      this.synth.cancel();
      return;
    }

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

    this.synth.speak(utterance);
  }

  static stop() {
    this.synth.cancel();
  }

  static isSpeaking() {
    return this.synth.speaking;
  }
}
