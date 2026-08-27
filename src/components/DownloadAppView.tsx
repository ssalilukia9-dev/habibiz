import { useState, useEffect } from 'react';
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
  X,
  Copy,
  Check,
  Apple,
  Terminal,
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';

export default function DownloadAppView() {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<'android' | 'ios' | 'pwa'>('android');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setSelectedGuide('pwa');
      setShowModal(true);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = (format: string) => {
    setDownloadingFormat(format);
    if (format === 'ios') setSelectedGuide('ios');
    else if (format === 'pwa') setSelectedGuide('pwa');
    else setSelectedGuide('android');

    setTimeout(() => {
      setDownloadingFormat(null);
      setShowModal(true);
    }, 600);
  };

  const downloadOptions = [
    {
      id: 'apk',
      title: "Android APK & Play Store (Capacitor)",
      version: "v3.0.0-mobile",
      size: "~28 MB",
      desc: "One-click compilation ready. Compile directly to Android APK for sideloading or Google Play AAB bundle.",
      icon: Smartphone,
      format: "APK",
      highlight: "Capacitor 8.x Ready",
      actionLabel: "View Compilation Steps"
    },
    {
      id: 'ios',
      title: "iOS Native App (Xcode / Capacitor)",
      version: "v3.0.0-ios",
      size: "~32 MB",
      desc: "Ready for iOS compilation via Capacitor. Open with Xcode to deploy on iPhone, iPad, or TestFlight.",
      icon: Apple,
      format: "IPA",
      highlight: "iOS 15+ Native",
      actionLabel: "View iOS Guide"
    },
    {
      id: 'pwa',
      title: "Instant Progressive Web App (PWA)",
      version: "Universal Web",
      size: "< 3 MB",
      desc: "Zero-installation instant app. Runs offline with full-screen experience and native sound audio.",
      icon: Globe,
      format: "PWA",
      highlight: "Instant 1-Tap Install",
      actionLabel: "Install to Home Screen"
    }
  ];

  return (
    <div className="space-y-12 pb-24 relative max-w-5xl mx-auto px-4">
      <header className="text-center space-y-4 pt-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-brand-primary/10 border border-brand-primary/30 rounded-2xl flex items-center justify-center text-brand-primary shadow-lg shadow-brand-primary/20">
            <Smartphone size={32} />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase">
          Compile to <span className="text-brand-primary">Mobile App</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm font-medium">
          Compile into native <strong>Android (APK/AAB)</strong>, <strong>iOS (Xcode)</strong>, or install immediately as an offline <strong>PWA</strong>.
        </p>

        {/* 1-Tap PWA Install Bar */}
        <div className="pt-2">
          <button
            onClick={handleInstallPWA}
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-brand-primary text-brand-depth font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/25 cursor-pointer"
          >
            <Sparkles size={16} />
            {isInstalled ? "App Installed on Device ✓" : "1-Tap Install on Mobile / Desktop"}
          </button>
        </div>
      </header>

      {/* Main Download & Build Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {downloadOptions.map((opt) => (
          <motion.div 
            key={opt.id}
            whileHover={{ y: -5 }}
            className="glass-panel p-6 rounded-[2.5rem] border-white/5 relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  <opt.icon size={24} />
                </div>
                <span className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] rounded-full">
                  {opt.format}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{opt.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{opt.version}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{opt.size}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {opt.desc}
              </p>
            </div>

            <div className="pt-6 relative z-10 space-y-3">
              <button 
                onClick={() => handleDownload(opt.id)}
                disabled={!!downloadingFormat}
                className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all bg-white/10 hover:bg-brand-primary hover:text-brand-depth text-white border border-white/10 hover:border-brand-primary cursor-pointer"
              >
                {downloadingFormat === opt.id ? (
                  <>Preparing Guide <Loader2 size={14} className="animate-spin" /></>
                ) : (
                  <>{opt.actionLabel} <Download size={14} /></>
                )}
              </button>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <CheckCircle2 size={12} className="text-brand-primary" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{opt.highlight}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick 3-Command Compilation Terminal Box */}
      <section className="bg-brand-sidebar border border-brand-border rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Easy 1-Minute Mobile Compilation</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Run in your downloaded project folder</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full self-start sm:self-auto">
            Ready to Build
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {[
            { id: "cmd1", label: "1. Install packages", cmd: "npm install" },
            { id: "cmd2", label: "2. Build web bundle & sync with Android/iOS", cmd: "npm run cap:build" },
            { id: "cmd3", label: "3. Open in Android Studio to export APK/AAB", cmd: "npm run cap:open" }
          ].map((item) => (
            <div key={item.id} className="bg-black/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-4 group">
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-brand-primary font-bold truncate select-all">{item.cmd}</p>
              </div>
              <button
                onClick={() => copyToClipboard(item.cmd, item.id)}
                className="p-2 rounded-xl bg-white/5 hover:bg-brand-primary hover:text-brand-depth text-slate-300 transition-all active:scale-90 shrink-0 cursor-pointer"
                title="Copy command"
              >
                {copiedIndex === item.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for "Compilation Guides" */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-sidebar border border-white/10 p-6 sm:p-8 rounded-[3rem] max-w-xl w-full relative space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                  {selectedGuide === 'android' && <Smartphone size={24} />}
                  {selectedGuide === 'ios' && <Apple size={24} />}
                  {selectedGuide === 'pwa' && <Globe size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {selectedGuide === 'android' && "Android APK & Play Store Compilation"}
                    {selectedGuide === 'ios' && "iOS Xcode Build Guide"}
                    {selectedGuide === 'pwa' && "Install as Native App (PWA)"}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Step-by-step instructions</p>
                </div>
              </div>

              {/* Guide Switcher Tabs */}
              <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                {[
                  { id: 'android', label: 'Android APK' },
                  { id: 'ios', label: 'iOS Xcode' },
                  { id: 'pwa', label: 'PWA Mobile' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedGuide(t.id as any)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selectedGuide === t.id ? 'bg-brand-primary text-brand-depth font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {selectedGuide === 'android' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">Step 1: Export Code</p>
                    <p className="text-slate-400 text-[11px]">Download your repository or export files to your computer.</p>
                  </div>

                  <div className="p-4 bg-black/50 border border-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-brand-primary uppercase tracking-wider text-[11px]">Step 2: Terminal Execution</p>
                    <pre className="text-slate-300 font-mono text-[11px] bg-black/40 p-3 rounded-xl select-all">
                      npm install{"\n"}
                      npm run cap:build{"\n"}
                      npm run cap:open
                    </pre>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">Step 3: Generate APK / AAB</p>
                    <p className="text-slate-400 text-[11px]">Inside Android Studio, navigate to <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> or <strong className="text-white">Generate Signed Bundle</strong> for the Play Store.</p>
                  </div>
                </div>
              )}

              {selectedGuide === 'ios' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">Step 1: Add iOS Target</p>
                    <pre className="text-slate-300 font-mono text-[11px] bg-black/40 p-3 rounded-xl select-all">
                      npm install{"\n"}
                      npx cap add ios{"\n"}
                      npm run build{"\n"}
                      npx cap sync ios
                    </pre>
                  </div>

                  <div className="p-4 bg-black/50 border border-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-brand-primary uppercase tracking-wider text-[11px]">Step 2: Launch Xcode</p>
                    <pre className="text-slate-300 font-mono text-[11px] bg-black/40 p-3 rounded-xl select-all">
                      npx cap open ios
                    </pre>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">Step 3: Archive & Deploy</p>
                    <p className="text-slate-400 text-[11px]">In Xcode, select your signing team and click <strong className="text-white">Product &gt; Archive</strong> to export to TestFlight or the Apple App Store.</p>
                  </div>
                </div>
              )}

              {selectedGuide === 'pwa' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">iPhone & iPad (Safari)</p>
                    <p className="text-slate-400 text-[11px]">Tap the <strong className="text-white">Share</strong> button at the bottom of Safari, then scroll down and tap <strong className="text-brand-primary">Add to Home Screen</strong>.</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl space-y-2">
                    <p className="font-bold text-white uppercase tracking-wider text-[11px]">Android (Chrome / Edge / Firefox)</p>
                    <p className="text-slate-400 text-[11px]">Tap the three dots <strong className="text-white">⋮</strong> menu in the top right and tap <strong className="text-brand-primary">Install App</strong> or <strong className="text-brand-primary">Add to Home Screen</strong>.</p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 cursor-pointer"
              >
                Close Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe & Secure Guarantee */}
      <section className="space-y-6 bg-white/[0.02] border border-white/5 rounded-[3rem] p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Mobile Native Compatibility</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Capacitor 8.x + Offline Support + Adhan Notifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Local Notifications", desc: "Native local notifications configured for all 5 daily prayers and Adhan." },
            { step: "02", title: "Offline Holy Quran", desc: "Cached Quran text, Arabic fonts, and translations for offline access." },
            { step: "03", title: "Instant Sync", desc: "Automatic Firestore cloud synchronization of Hasanat, Duas, and memorisation progress." }
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <span className="text-2xl font-black text-brand-primary/30 font-mono">{item.step}</span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
