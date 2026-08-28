// Web Audio API Synthesizer for instant haptic & melodic recitation feedback
class TarteelAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playTone(type: 'correct' | 'mistake' | 'advance' | 'detected' | 'complete') {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'correct') {
        // High harmonic gentle harp ping (523Hz -> 659Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'mistake') {
        // Soft warm marimba low double-tap (not harsh)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'advance') {
        // Ascending sacred chime (Ayah complete)
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
      } else if (type === 'detected') {
        // Resonant bell for auto-lock
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.14, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.45);
        });
      } else if (type === 'complete') {
        // Celebration fan-fare
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);
          gain.gain.setValueAtTime(0.16, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.55);
        });
      }
    } catch {}
  }
}

export const tarteelAudio = new TarteelAudioSynthesizer();

export interface ReciterProfile {
  id: string;
  name: string;
  arabicName: string;
  cdnId: string;
  style: string;
  premium?: boolean;
}

export const RECITER_PROFILES: ReciterProfile[] = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي', cdnId: 'ar.alafasy', style: 'Murattal' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري', cdnId: 'ar.husary', style: 'Master Tajweed' },
  { id: 'abdulbasit', name: 'Abdul Basit (Murattal)', arabicName: 'عبد الباسط عبد الصمد', cdnId: 'ar.abdulbasitmurattal', style: 'Soulful Murattal' },
  { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi', arabicName: 'محمد صديق المنشاوي', cdnId: 'ar.minshawi', style: 'Majestic & Deep' },
  { id: 'sudais', name: 'Abdur-Rahman As-Sudais', arabicName: 'عبد الرحمن السديس', cdnId: 'ar.abdurrahmaansudais', style: 'Haramain Pace', premium: true },
  { id: 'muaiqly', name: 'Maher Al-Muaiqly', arabicName: 'ماهر المعيقلي', cdnId: 'ar.mahermuaiqly', style: 'Serene & Clear', premium: true }
];
