import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  ShieldCheck, 
  Zap, 
  SmartphoneNfc, 
  Globe, 
  CheckCircle2,
  Info,
  Loader2,
  AlertTriangle,
  Github,
  X
} from 'lucide-react';

export default function DownloadAppView() {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleDownload = (format: string) => {
    setDownloadingFormat(format);
    // Simulate prep time for export
    setTimeout(() => {
      setDownloadingFormat(null);
      setShowModal(true);
    }, 1500);
  };

  const downloadOptions = [
    {
      id: 'apk',
      title: "Android Package (APK)",
      version: "v2.5.0-cap",
      size: "42.5 MB",
      desc: "Ready for native compilation via Capacitor. Supports sideloading on all Android 8.0+ devices.",
      icon: Smartphone,
      format: "APK",
      highlight: "Capacitor Ready"
    },
    {
      id: 'aab',
      title: "Android App Bundle (AAB)",
      version: "v2.5.0-cap",
      size: "38.2 MB",
      desc: "Optimized for the Google Play Store. Requires Android Studio build environment.",
      icon: Zap,
      format: "AAB",
      highlight: "App Store Optimized"
    }
  ];

  return (
    <div className="space-y-12 pb-24 relative">
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
            <Smartphone size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Native <span className="text-brand-primary">Builds</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm font-medium">
          I have configured this project with <strong>Capacitor</strong>. Follow the guide below to generate your AAB/APK files.
        </p>
      </header>

      {/* Main Download Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {downloadOptions.map((opt) => (
          <motion.div 
            key={opt.id}
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-primary">
                  <opt.icon size={24} />
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] rounded-full">
                  Configured
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{opt.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{opt.version}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {opt.desc}
              </p>

              <button 
                onClick={() => handleDownload(opt.id)}
                disabled={!!downloadingFormat}
                className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all group/btn ${
                  downloadingFormat === opt.id 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-brand-primary text-brand-depth hover:shadow-brand-primary/20'
                }`}
              >
                {downloadingFormat === opt.id ? (
                  <>Preparing Project <Loader2 size={14} className="animate-spin" /></>
                ) : (
                  <>View Build Guide <Download size={14} className="group-hover/btn:translate-y-1 transition-transform" /></>
                )}
              </button>

              <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{opt.highlight}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for "Next Steps" */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-sidebar border border-white/10 p-8 rounded-[3rem] max-w-lg w-full relative space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mx-auto">
                <Smartphone size={32} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Your Android Build Path</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Follow these instructions locally</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-brand-primary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Phase 1: Export</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Click the <strong>Settings</strong> cog in the sidebar, then <strong>Export to ZIP</strong>. Unzip the file on your computer.</p>
                </div>

                <div className="p-5 bg-black/40 rounded-2xl space-y-3 font-mono text-[10px]">
                  <p className="text-brand-primary font-black uppercase tracking-widest mb-1">Phase 2: Local Commands</p>
                  <div className="bg-black/60 p-3 rounded-lg text-slate-300 space-y-1">
                    <p># Install Project Dependencies</p>
                    <p className="text-white">npm install</p>
                    <p className="mt-2"># Build & Sync for Android in 1-Click</p>
                    <p className="text-white">npm run cap:build</p>
                    <p className="mt-2"># Launch Project in Android Studio</p>
                    <p className="text-white">npm run cap:open</p>
                  </div>
                </div>

                <div className="p-5 bg-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Phase 3: Android Studio</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Once Android Studio opens, go to <strong>Build &gt; Generate Signed Bundle / APK</strong> to create your AAB file.</p>
                </div>

                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                >
                  I'm Ready to Export
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Installation Guide */}
      <section className="max-w-4xl mx-auto space-y-8 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Installation Protocol</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Safe & Secure Setup Guide</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Enable Sources", desc: "Go to Settings > Security and enable 'Unknown Sources' for direct installs." },
            { step: "02", title: "Download File", desc: "Select your preferred format above and wait for the download to complete." },
            { step: "03", title: "Install & Sync", desc: "Open the file, follow prompts, and log in to sync your spiritual progress." }
          ].map((item, i) => (
            <div key={i} className="space-y-3">
              <span className="text-3xl font-black text-brand-primary/20 italic">{item.step}</span>
              <h4 className="text-sm font-black text-white uppercase tracking-tighter">{item.title}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PWA Section */}
      <section className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 glass-panel p-8 rounded-[2.5rem] border-brand-primary/10">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary flex-shrink-0">
          <Globe size={40} className="animate-spin-slow" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter">Universal Web Access</h3>
          <p className="text-xs text-slate-400 font-medium">Add to your Home Screen directly from your browser for light-weight sanctuary access without a download.</p>
        </div>
        <button className="px-8 py-4 bg-white/5 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-colors">
          View Guide
        </button>
      </section>

      <div className="flex justify-center gap-4 text-slate-600">
        <SmartphoneNfc size={20} />
        <Globe size={20} />
        <CheckCircle2 size={20} />
      </div>

      <footer className="text-center pt-8">
         <div className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-full border border-rose-500/10">
            <Info size={12} />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Beta Build • Use with Reflection</p>
         </div>
      </footer>
    </div>
  );
}
