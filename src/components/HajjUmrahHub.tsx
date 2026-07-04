import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map as MapIcon, 
  BookOpen, 
  Sparkles, 
  CheckSquare, 
  Compass, 
  ArrowRight,
  Navigation,
  ArrowLeft,
  Info,
  Clock,
  Heart,
  RotateCcw,
  Zap,
  Globe,
  Tent,
  Waves,
  Moon,
  Gamepad2
} from 'lucide-react';
import HajjGame3D from './HajjGame3D.tsx';

interface HajjUmrahHubProps {
  onNavigate: (view: string, subView?: string) => void;
  addHasanat: (amount: number) => void;
  incrementDua: () => void;
}

const DUAS = [
  { title: "Niyyah for Umrah", arabic: "اللَّهُمَّ إِنِيْ أُرِيْدُ الْعُمْرَةَ فَيَسِّرْهَا لِيْ وَتَقَبَّلْهَا مِنِيْ", translation: "O Allah, I intend to perform Umrah, so please make it easy for me and accept it from me." },
  { title: "The Talbiyah", arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْك ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْك", translation: "Labbayk Allahumma Labbayk..." },
  { title: "Between Safa & Marwa", arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ الأَعَزُّ الأَكْرَمُ", translation: "My Lord, forgive and have mercy, for You are the Most Mighty, the Most Noble." },
];

const CHECKLIST = [
  { category: "Physical Preparation", items: ["Ihram cloths (2 sets)", "Comfortable walking shoes", "Unscented toiletries", "Personal first aid kit"] },
  { category: "Spiritual Preparation", items: ["Learn Umrah rituals", "Memorize key Duas", "Make a list of family Duas", "Ask for forgiveness from others"] },
  { category: "Travel Essentials", items: ["Vaccination certificate", "Passport & ID", "Hotel reservations", "Local SIM/Data plan"] }
];

const SITES = [
  { name: "The Kaaba", desc: "The House of Allah, the focal point of Islamic prayer and the center of the Masjid al-Haram.", icon: Globe },
  { name: "Mount Safa & Marwa", desc: "The two hills where Hajar (AS) searched for water for her son Ismail (AS).", icon: Navigation },
  { name: "Mina", desc: "The City of Tents, where pilgrims spend the night during the days of Hajj.", icon: Tent },
  { name: "Arafat", desc: "The plain where the most important day of Hajj is spent in prayer.", icon: Sparkles },
  { name: "Muzdalifah", desc: "The place where pilgrims spend the night after leaving Arafat.", icon: Moon },
  { name: "The Maqam Ibrahim", desc: "The stone which bears the footprints of Prophet Ibrahim (AS) during the building of the Kaaba.", icon: Compass },
  { name: "Zamzam Well", desc: "The miraculous water source that has remained flowing for thousands of years.", icon: Waves }
];

export default function HajjUmrahHub({ onNavigate, addHasanat, incrementDua }: HajjUmrahHubProps) {
  const [currentView, setCurrentView] = useState<'hub' | 'duas' | 'umrah' | 'checklist' | 'sites'>('hub');
  const [showGame, setShowGame] = useState(false);

  const handleCompleteDua = (id: string) => {
    const key = `hajj-dua-${id}`;
    if (!localStorage.getItem(key)) {
      addHasanat(50);
      incrementDua();
      localStorage.setItem(key, 'true');
      alert("MashaAllah! You have been awarded 50 Hasanat for completing this Dua.");
    } else {
      alert("You have already completed this Dua today.");
    }
  };

  const items = [
    { id: 'duas', label: 'Duas', sub: 'Sacred Supplications', icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'umrah', label: 'Umrah', sub: 'Pilgrimage Guide', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'checklist', label: 'Checklist', sub: 'Preparation Tracker', icon: CheckSquare, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 'sites', label: 'Sacred Sites', sub: 'Explore Holy Places', icon: Compass, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  const handleItemClick = (id: string) => {
    if (id === 'maps') onNavigate('maps');
    else if (id === 'hajj') onNavigate('hajj');
    else setCurrentView(id as any);
  };

  if (currentView !== 'hub') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 px-4 pb-20">
        <button 
          onClick={() => setCurrentView('hub')}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all border border-white/5 active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Sanctuary Hub
        </button>

        <AnimatePresence mode="wait">
          {currentView === 'duas' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white italic tracking-tighter">Pilgrimage Duas</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connect with the Divine through prayer</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {DUAS.map((dua, i) => (
                  <div key={i} className="glass-panel p-10 rounded-[3rem] border-white/5 space-y-6 bg-gradient-to-br from-brand-primary/5 to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                       <Sparkles size={120} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-1 h-4 bg-brand-primary rounded-full" />
                      <h3 className="text-brand-primary text-xs font-black uppercase tracking-widest">{dua.title}</h3>
                    </div>
                    <p className="arabic-text text-4xl text-right leading-relaxed text-white relative z-10">{dua.arabic}</p>
                    <p className="text-slate-200 text-lg md:text-xl font-medium italic opacity-80 border-t border-white/5 pt-6">"{dua.translation}"</p>
                    <button 
                      onClick={() => handleCompleteDua(`dua-${i}`)}
                      className="w-full py-4 bg-brand-primary text-brand-depth text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                    >
                      Complete & Get +50 Hasanat
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'checklist' && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-12"
             >
                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-white italic tracking-tighter">Travel Checklist</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Track your preparation momentum</p>
                </div>
                <div className="space-y-12">
                  {CHECKLIST.map((cat, i) => (
                    <div key={i} className="space-y-6">
                       <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.5em] flex items-center gap-4">
                          <span>{cat.category}</span>
                          <div className="h-[2px] flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent" />
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {cat.items.map((item, idx) => (
                            <div key={idx} className="glass-panel p-6 rounded-[2rem] border-white/5 flex items-center gap-6 group hover:border-brand-primary/30 transition-all cursor-pointer bg-white/[0.01]">
                               <div className="w-10 h-10 rounded-2xl border-2 border-white/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-depth transition-all">
                                  <CheckSquare size={18} />
                               </div>
                               <span className="text-sm font-bold text-slate-200">{item}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
            </motion.div>
          )}

          {currentView === 'sites' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white italic tracking-tighter">Sacred Sites</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">A journey through historical landmarks</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SITES.map((site, i) => (
                  <div key={i} className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-col space-y-6 hover:border-brand-primary/30 transition-all group bg-white/[0.01]">
                     <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-brand-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                        <site.icon size={32} />
                     </div>
                     <div className="space-y-3">
                        <h3 className="text-2xl font-black text-white italic tracking-tight">{site.name}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{site.desc}</p>
                     </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentView === 'umrah' && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-12"
             >
                <div className="text-center space-y-3">
                  <h2 className="text-5xl font-black text-white italic tracking-tighter">The Umrah Path</h2>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em]">Spiritual Initiation Protocol</p>
                </div>
                
                <div className="relative space-y-8 max-w-2xl mx-auto before:absolute before:left-12 before:top-20 before:bottom-20 before:w-px before:bg-white/5">
                  {[
                    { title: "Ihram & Niyyah", desc: "Enter state of consecration at the Miqat, perform Ghusl and wear Ihram.", icon: Heart },
                    { title: "Tawaf al-Kudum", desc: "Perform seven circumambulations of the Kaaba starting from Hajar al-Aswad.", icon: RotateCcw },
                    { title: "Sa'i", desc: "Walk seven times between the hills of Safa and Marwa.", icon: ArrowRight },
                    { title: "Halq or Taqsir", desc: "Shaving or cutting of hair to mark the completion of rituals.", icon: Zap }
                  ].map((step, i) => (
                    <div key={i} className="relative flex gap-10">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-brand-primary flex items-center justify-center text-brand-depth font-black shrink-0 z-10 shadow-3xl shadow-brand-primary/20 text-3xl italic">
                         {i + 1}
                      </div>
                      <div className="glass-panel p-10 rounded-[3rem] border-white/5 flex-1 space-y-6 bg-white/[0.01]">
                         <div className="flex items-center gap-4 text-brand-primary">
                            <step.icon size={24} />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">{step.title}</h3>
                         </div>
                         <p className="text-sm text-slate-400 font-medium leading-relaxed border-t border-white/5 pt-4">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16 px-4 pb-32">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-brand-primary opacity-50 mb-4 px-2">
           <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-brand-primary" />
           <Sparkles size={20} />
           <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-brand-primary" />
        </div>
        <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none">
           Pilgrimage <br/><span className="text-brand-primary">Sanctuary</span>
        </h2>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] text-center">Protocol & Wisdom Hub</p>
      </div>

      {showGame && (
        <HajjGame3D onClose={() => setShowGame(false)} addHasanat={addHasanat} />
      )}

      {/* 3D Pilgrimage Game Banner */}
      <motion.button
        whileHover={{ scale: 1.01, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowGame(true)}
        className="w-full relative py-12 px-6 md:px-12 glass-panel rounded-[3rem] border-brand-primary/30 overflow-hidden group shadow-4xl bg-gradient-to-r from-brand-primary/20 via-transparent to-brand-primary/5 text-left flex flex-col md:flex-row items-center justify-between gap-8 mb-8"
      >
        <div className="space-y-4 max-w-xl">
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] px-3 py-1 bg-brand-primary/15 border border-brand-primary/25 rounded-full inline-block">New Feature • Interactive</span>
          <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter leading-tight">3D Hajj & Umrah Guide Game</h3>
          <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
            Embark on an immersive, interactive 3D virtual pilgrimage. Perform Tawaf around the Kaaba, retrace Sa'i between Safa and Marwa, collect pebbles at Muzdalifah, and throw them at Jamarat!
          </p>
        </div>
        <div className="px-10 py-5 bg-brand-primary text-brand-depth font-black rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-4 cursor-pointer shrink-0">
           Start Quest Now <Gamepad2 size={18} />
        </div>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Featured Map / Location Action */}
        <motion.button
          whileHover={{ scale: 1.01, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleItemClick('maps')}
          className="lg:col-span-8 relative h-[500px] glass-panel rounded-[4rem] border-white/5 overflow-hidden group shadow-4xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110 opacity-60 mix-blend-overlay"
            alt="Makkah"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          
          <div className="absolute inset-x-12 bottom-12 flex flex-col md:flex-row items-end justify-between gap-8 text-left">
            <div className="space-y-4">
               <div className="w-20 h-20 bg-brand-primary rounded-[2.5rem] flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/20">
                  <MapIcon size={40} />
               </div>
               <div className="space-y-1">
                  <h3 className="text-5xl font-black text-white italic tracking-tighter">Sacred Maps</h3>
                  <p className="text-slate-300 font-bold uppercase text-[10px] tracking-widest">Navigate the architecture of faith</p>
               </div>
            </div>
            <div className="px-10 py-5 bg-white text-black font-black rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl hover:bg-brand-primary transition-colors flex items-center gap-4">
               Open Sanctuary Map <ArrowRight size={18} />
            </div>
          </div>
        </motion.button>

        {/* Side Actions Bento */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-6">
          {items.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemClick(item.id)}
              className="p-8 glass-panel rounded-[3rem] border-white/5 flex flex-col items-center justify-center text-center space-y-6 group bg-white/[0.01] hover:border-brand-primary/30 transition-all shadow-xl"
            >
              <div className={`w-16 h-16 rounded-[1.8rem] ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner`}>
                <item.icon size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white tracking-tight">{item.label}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none opacity-60">{item.sub}</p>
              </div>
            </motion.button>
          ))}
          
          {/* Hajj Specialized Guide */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => handleItemClick('hajj')}
            className="col-span-2 p-10 glass-panel rounded-[3rem] bg-brand-primary/10 border-brand-primary/20 flex items-center justify-between group hover:bg-brand-primary transition-all relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 p-8 opacity-[0.05] group-hover:opacity-20 transition-opacity">
               <Navigation size={120} />
            </div>
            <div className="flex items-center gap-6 relative z-10">
               <div className="w-16 h-16 rounded-3xl bg-brand-primary text-brand-depth flex items-center justify-center shadow-2xl shadow-brand-primary/20 group-hover:bg-brand-depth group-hover:text-brand-primary transition-colors">
                  <Navigation size={32} />
               </div>
               <div className="text-left text-brand-primary group-hover:text-brand-depth transition-colors">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-1">Ritual Mastery</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Full Step-by-Step Hajj Guide</p>
               </div>
            </div>
            <ArrowRight className="text-brand-primary group-hover:text-brand-depth group-hover:translate-x-2 transition-all relative z-10" size={32} />
          </motion.button>
        </div>
      </div>

      {/* Footer Talbiyah Mantle */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="glass-panel p-16 md:p-32 rounded-[5rem] border-white/5 bg-gradient-to-b from-brand-primary/10 to-transparent text-center space-y-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none mix-blend-overlay">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        
        <div className="flex flex-col items-center gap-4 mb-2">
           <div className="w-1 h-12 bg-gradient-to-b from-brand-primary/50 to-transparent rounded-full" />
           <span className="text-[12px] font-black text-brand-primary uppercase tracking-[1em] ml-4">The Talbiyah</span>
        </div>

        <div className="space-y-12">
          <p className="arabic-text text-5xl md:text-8xl text-white leading-relaxed md:leading-relaxed drop-shadow-[0_20px_50px_rgba(168,85,247,0.3)] hover:scale-[1.03] transition-transform duration-700">
            لَبَّيْكَ اللَّهُمَّ لَبَّيْك ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْك ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ ، لَا شَرِيكَ لَكَ
          </p>
          <div className="max-w-2xl mx-auto space-y-4">
             <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent mx-auto" />
             <p className="text-lg md:text-3xl text-slate-400 font-light italic leading-relaxed opacity-60">"Here I am at Your service, O Allah, here I am at Your service. Here I am at Your service, You have no partner, here I am at Your service. Truly all praise and blessings are Yours, and all sovereignty..."</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
