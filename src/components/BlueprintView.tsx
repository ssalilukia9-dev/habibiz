import { useState } from 'react';
import { 
  Copy, 
  Terminal, 
  Check, 
  Zap, 
  Shield, 
  Database, 
  Smartphone, 
  Layout, 
  Sparkles,
  Search,
  Code
} from 'lucide-react';
import { motion } from 'motion/react';

export default function BlueprintView() {
  const [copied, setCopied] = useState(false);

  const masterPrompt = `Build 'Sanctuary', a production-grade 'Digital Spiritual Haven' web application.

AESTHETIC & THEME:
- Brutalist-Minimalist aesthetic. 
- Colors: Depth (#050505), Sidebar (#0a0a0a), Primary (#facc15), Emerald (#10b981).
- Typography: Heavy Inter font, font-black headings, tracking-tighter, uppercase italic accents.
- Animations: Motion/React for all transitions, staggered list entrances, and a custom rings-based splash screen.

CORE FEATURES:
1. Quran Engine: 
   - Surah & Juz navigation modes.
   - Interactive verse list with real-time audio playback (multi-reciter support).
   - Offline Mode: Incremental 'Verse Download' and 'Full Juz Download' with real-time percentage progress indicators using fetch stream readers.
   - Dynamic Translations: Sync translations (English, Turkish, Indonesian, French, Urdu) based on a global language setting.

2. Gamification (Hasanat System):
   - Global point system tracking 'Hasanat'. 
   - Real-time Firestore-synced leaderboard with a 'Habibi King' spotlight for the global top scorer.
   - Points earned via reading Quran, completing Adhkar, and daily check-ins.

3. Tools & Utilities:
   - Qibla Compass using browser Compass API with a native-feeling UI.
   - Prayer Times view using calculation methods and geolocation.
   - Hadith Library with multi-layered search (text, narrator, topic).
   - Interactive Adhkar counter with haptic feedback simulation.
   - Islamic Finance module: Zakat calculator and simulated Halal Market.

4. AI & Community:
   - 'Habibi AI' companion (Gemini-powered) for spiritual guidance.
   - Real-time community chat rooms with message persistence.

TECHNICAL SPECIFICATION:
- Framework: React 18+ with Vite and TypeScript.
- Styles: Tailwind CSS (Configuration: @import "tailwindcss").
- Database: Firebase (Auth, Firestore).
- Persistence: Firestore 'persistentLocalCache' for a robust offline-first experience.
- Mobile: Capacitor-ready configuration (capacitor.config.ts) for Android/iOS builds.
- Security: Exhaustive Firestore Security Rules matching a strict 'isValidUser' blueprint.

DEVELOPER UI:
- Multi-language support (Settings driven).
- Trial/Premium gating system.
- Detailed 'Download Native App' guide for AAB/APK local compilation via Capacitor.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-brand-depth">
            <Terminal size={20} />
          </div>
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Project Blueprint</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
          The <span className="text-brand-primary">Master Prompt</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-xl text-sm">
          Copy this exhaustive prompt to recreate the exact architecture, aesthetic, and feature-set of Sanctuary in any AI-driven coding environment.
        </p>
      </header>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-brand-sidebar border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-red-500" />
               <div className="w-2 h-2 rounded-full bg-yellow-500" />
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <span className="ml-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">sanctuary_v2.5_blueprint.txt</span>
            </div>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-brand-primary text-brand-depth hover:brightness-110 active:scale-95'
              }`}
            >
              {copied ? (
                <><Check size={14} /> Copied to Clipboard</>
              ) : (
                <><Copy size={14} /> Copy Master Prompt</>
              )}
            </button>
          </div>
          
          <div className="p-8 font-mono text-[11px] leading-relaxed text-slate-300 h-[500px] overflow-y-auto scrollbar-custom">
            <pre className="whitespace-pre-wrap">{masterPrompt}</pre>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Sparkles, title: "Aesthetic", desc: "Brutalist depths with motion-slick transitions." },
          { icon: Database, title: "Persistence", desc: "Offline-first Firestore with local cache." },
          { icon: Shield, title: "Hardened", desc: "Complex relational security rules for data." },
          { icon: Smartphone, title: "Native Ready", desc: "Pre-configured Capacitor setup for Android." },
          { icon: Zap, title: "Gamified", desc: "Hasanat feedback loop with global rankings." },
          { icon: Code, title: "Production", desc: "Tailwind 4.0 architecture with ESM logic." }
        ].map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={item.title}
            className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-3"
          >
            <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
               <item.icon size={20} />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">{item.title}</h4>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
