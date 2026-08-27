import { VoiceService } from './voiceService.ts';

export type VoiceCommandType = 
  | 'NAVIGATE_QIBLA'
  | 'NAVIGATE_TASBIH'
  | 'VOICE_TASBIH'
  | 'NAVIGATE_SUPPLICATIONS'
  | 'NAVIGATE_QURAN'
  | 'NAVIGATE_PRAYER_TIMES'
  | 'NAVIGATE_COMPANION'
  | 'NAVIGATE_MARKET'
  | 'NAVIGATE_NAMES_OF_ALLAH'
  | 'EXIT_RAMADAN'
  | 'SEARCH';

export interface ParsedVoiceCommand {
  type: VoiceCommandType;
  label: string;
  route?: string;
  tab?: string;
  query?: string;
  speechReply: string;
  action?: () => void;
}

export interface VoiceCommandListener {
  onStatusChange?: (isListening: boolean) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onCommandMatched?: (command: ParsedVoiceCommand, rawText: string) => void;
  onError?: (error: string) => void;
}

export class VoiceCommandService {
  private static recognition: any = null;
  private static isListening: boolean = false;
  private static listeners: Set<VoiceCommandListener> = new Set();
  private static restartTimer: any = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  static subscribe(listener: VoiceCommandListener): () => void {
    this.listeners.add(listener);
    if (listener.onStatusChange) {
      listener.onStatusChange(this.isListening);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyStatus(status: boolean) {
    this.isListening = status;
    this.listeners.forEach(l => l.onStatusChange?.(status));
  }

  private static notifyTranscript(transcript: string, isFinal: boolean) {
    this.listeners.forEach(l => l.onTranscript?.(transcript, isFinal));
  }

  private static notifyCommand(command: ParsedVoiceCommand, rawText: string) {
    this.listeners.forEach(l => l.onCommandMatched?.(command, rawText));
  }

  private static notifyError(err: string) {
    this.listeners.forEach(l => l.onError?.(err));
  }

  /**
   * Parses natural speech into known Islamic Sanctuary voice commands.
   */
  static parseCommand(text: string): ParsedVoiceCommand | null {
    if (!text) return null;
    const clean = text.toLowerCase().trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s{2,}/g, " ");

    // 1. Qibla Commands
    // Handles: "habibi show qibla", "habibi qibla", "show qibla", "open qibla", "qibla compass", "where is qibla", "direction of kaaba"
    if (
      clean.includes('qibla') || 
      clean.includes('kibla') || 
      clean.includes('kaba') || 
      clean.includes('kaaba') ||
      clean.includes('qubla') ||
      (clean.includes('direction') && clean.includes('prayer'))
    ) {
      return {
        type: 'NAVIGATE_QIBLA',
        label: 'Qibla Compass',
        route: '/qibla',
        speechReply: 'Opening Qibla compass for you.'
      };
    }

    // 2. Voice Tasbih / Tasbih with Supplications
    if (
      clean.includes('voice tasbih') || 
      clean.includes('voice count') || 
      clean.includes('voice supplication') ||
      clean.includes('recite tasbih') ||
      clean.includes('voice dhikr')
    ) {
      return {
        type: 'VOICE_TASBIH',
        label: 'Voice Supplications Tasbih',
        route: '/resources',
        tab: 'tasbih',
        speechReply: 'Opening Voice Tasbih. Say your supplications aloud to count.'
      };
    }

    // 3. Tasbih Counter Commands
    if (
      clean.includes('tasbih') || 
      clean.includes('tasbeeh') || 
      clean.includes('counter') || 
      clean.includes('misbaha') ||
      clean.includes('rosary')
    ) {
      return {
        type: 'NAVIGATE_TASBIH',
        label: 'Electronic Tasbih',
        route: '/resources',
        tab: 'tasbih',
        speechReply: 'Opening Electronic Tasbih.'
      };
    }

    // 4. Supplications & Duas / Adhkar
    if (
      clean.includes('supplication') || 
      clean.includes('supplications') || 
      clean.includes('dua') || 
      clean.includes('duas') || 
      clean.includes('adhkar') || 
      clean.includes('dhikr') ||
      clean.includes('azkar') ||
      clean.includes('morning adhkar') ||
      clean.includes('evening adhkar')
    ) {
      return {
        type: 'NAVIGATE_SUPPLICATIONS',
        label: 'Sacred Supplications & Duas',
        route: '/resources',
        tab: 'adhkar',
        speechReply: 'Opening Sacred Supplications and Adhkar.'
      };
    }

    // 5. Exit Ramadan Mode Command
    if (
      clean.includes('exit ramadan') || 
      clean.includes('leave ramadan') || 
      clean.includes('turn off ramadan') || 
      clean.includes('disable ramadan') || 
      clean.includes('close ramadan') ||
      clean.includes('stop ramadan')
    ) {
      return {
        type: 'EXIT_RAMADAN',
        label: 'Exit Ramadan Mode',
        speechReply: 'Exited Ramadan Mode. Restoring standard dashboard.'
      };
    }

    // 6. Noble Quran
    if (
      clean.includes('quran') || 
      clean.includes('surah') || 
      clean.includes('mushaf') || 
      clean.includes('ayah') || 
      clean.includes('recitation')
    ) {
      return {
        type: 'NAVIGATE_QURAN',
        label: 'Noble Quran',
        route: '/resources',
        tab: 'quran',
        speechReply: 'Opening Noble Quran.'
      };
    }

    // 7. Prayer Times & Adhan
    if (
      clean.includes('prayer time') || 
      clean.includes('prayer times') || 
      clean.includes('adhan') || 
      clean.includes('athan') || 
      clean.includes('salah') || 
      clean.includes('namaz') ||
      clean.includes('fajr') ||
      clean.includes('maghrib')
    ) {
      return {
        type: 'NAVIGATE_PRAYER_TIMES',
        label: 'Prayer Times',
        route: '/resources',
        tab: 'prayer_times',
        speechReply: 'Opening Prayer Times.'
      };
    }

    // 8. Habibi Companion / AI Chat
    if (
      clean.includes('companion') || 
      clean.includes('talk to habibi') || 
      clean.includes('ask habibi') || 
      clean.includes('talk') || 
      clean.includes('chat')
    ) {
      return {
        type: 'NAVIGATE_COMPANION',
        label: 'Habibi Companion',
        route: '/companion',
        speechReply: 'Connecting with Habibi Spiritual Companion.'
      };
    }

    // 9. 99 Names of Allah
    if (
      clean.includes('names of allah') || 
      clean.includes('99 names') || 
      clean.includes('asmaul husna') || 
      clean.includes('asma al husna')
    ) {
      return {
        type: 'NAVIGATE_NAMES_OF_ALLAH',
        label: '99 Names of Allah',
        route: '/resources',
        tab: 'names',
        speechReply: 'Opening the 99 Names of Allah.'
      };
    }

    // 10. Suq / Market
    if (clean.includes('market') || clean.includes('shop') || clean.includes('store') || clean.includes('suq')) {
      return {
        type: 'NAVIGATE_MARKET',
        label: 'Noor Market',
        route: '/market',
        speechReply: 'Opening Noor Market.'
      };
    }

    // 11. General Search Fallback
    const strippedQuery = clean.replace(/habibi|please|search for|find|look up|show me/gi, "").trim();
    if (strippedQuery) {
      return {
        type: 'SEARCH',
        query: strippedQuery,
        label: `Search "${strippedQuery}"`,
        speechReply: `Searching for ${strippedQuery}.`
      };
    }

    return null;
  }

  /**
   * Start listening for voice commands
   */
  static startListening() {
    if (!this.isSupported()) {
      this.notifyError('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) return;

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.notifyStatus(true);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);

        this.notifyTranscript(currentText, isFinal);

        if (isFinal && currentText.trim()) {
          const command = this.parseCommand(currentText);
          if (command) {
            this.notifyCommand(command, currentText);
            // Optionally speak audio acknowledgment
            try {
              VoiceService.speakEnglish(command.speechReply, 'voice-cmd');
            } catch (e) {
              console.warn("Speech reply error", e);
            }
          }
        }
      };

      this.recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('[VoiceCommandService] Recognition error:', e.error);
        }
        this.notifyStatus(false);
      };

      this.recognition.onend = () => {
        this.notifyStatus(false);
      };

      this.recognition.start();
    } catch (e: any) {
      console.warn('[VoiceCommandService] Failed to start recognition:', e);
      this.notifyStatus(false);
    }
  }

  /**
   * Stop listening
   */
  static stopListening() {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.notifyStatus(false);
  }

  /**
   * Toggle Voice Command Listening
   */
  static toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }
}
