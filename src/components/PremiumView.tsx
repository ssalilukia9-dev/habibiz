import { auth, db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Check, 
  CreditCard, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  WifiOff,
  Map,
  TrendingUp,
  Library,
  Layout
} from 'lucide-react';

export default function PremiumView() {
  const handleSubscribe = async () => {
    if (!auth.currentUser) {
      alert('Please sign in to upgrade to Sanctuary Elite.');
      return;
    }

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        isPremium: true,
        premiumActivatedAt: serverTimestamp()
      });
      alert('Welcome to Sanctuary Elite! Your status has been elevated.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  const features = [
    {
      title: "Sanctuary Elite AI",
      desc: "Priority access to Gemini-powered spiritual guidance with long-term memory and deep Quranic analysis.",
      icon: Sparkles
    },
    {
      title: "Offline Mushaf Pro",
      desc: "Download the entire Quran with multiple reciters in high fidelity (4K Audio) for offline spiritual immersion.",
      icon: WifiOff
    },
    {
      title: "Hajj 3D Cartography",
      desc: "Interactive, real-time 3D maps of the Holy Sites with step-by-step guidance for Hajj and Umrah.",
      icon: Map
    },
    {
      title: "Spiritual Analytics",
      desc: "Advanced data visualization of your Quran progress, prayer consistency, and Hasanat velocity over time.",
      icon: TrendingUp
    },
    {
      title: "Exclusive Hadith Vaults",
      desc: "Access to verified scholarly commentaries and historical contexts not available in the public library.",
      icon: Library
    },
    {
      title: "Custom Sanctuary Themes",
      desc: "Unlock premium aesthetics including 'Vintage Parchment', 'Midnight Medinah', and 'Golden Haram' skins.",
      icon: Layout
    }
  ];

  return (
    <div className="space-y-12 pb-24">
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary shadow-2xl shadow-brand-primary/20">
            <Sparkles size={40} className="animate-pulse" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
          Sanctuary <span className="text-brand-primary">Elite</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          Enhance your journey with sacred tools designed for the modern seeker.
        </p>
      </header>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-panel-purple border-brand-primary p-8 rounded-[3rem] relative overflow-hidden group shadow-2xl shadow-brand-primary/20"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
             <Sparkles size={120} />
          </div>
          
          <div className="relative z-10 space-y-6">
             <div className="flex justify-between items-center">
                <span className="px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] rounded-full">
                   Annual Access
                </span>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Saving 40%</span>
             </div>
             
             <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">$4.99</span>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">/ month</span>
             </div>

             <div className="space-y-4 py-6 border-y border-white/5">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-4 items-start">
                     <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0 mt-0.5">
                        <Check size={12} />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-200">{f.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter leading-tight mt-0.5">{f.desc}</p>
                     </div>
                  </div>
                ))}
             </div>

             <button 
                onClick={handleSubscribe}
                className="w-full py-4 bg-brand-primary text-brand-depth rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Elevate My Soul Now <Zap size={16} />
             </button>
          </div>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Secure Pathways to Elite</h2>
           <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">All contributions support our global server maintenance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: "Bank Transfer", desc: "Sanctuary Intl\nAcc: 123456789\nSwift: HBBIUS33", icon: CreditCard, color: "text-blue-400" },
             { title: "Mobile Money", desc: "+234 800 SANCTUARY\nSelect 'Pay Merchant'\nEnter Sanctuary Code: 888", icon: Smartphone, color: "text-green-400" },
             { title: "Sacred Crypto", desc: "BTC: bc1qsanctuary...\nETH: 0xsanctuary...\n10% Extra Reward enabled", icon: Zap, color: "text-amber-400" }
           ].map((method, i) => (
             <div key={i} className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${method.color}`}>
                   <method.icon size={24} />
                </div>
                <h3 className="text-sm font-black text-white flex items-center justify-between">
                   {method.title}
                   <ArrowRight size={14} className="text-slate-700" />
                </h3>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed whitespace-pre-line tracking-tight">
                   {method.desc}
                </p>
             </div>
           ))}
        </div>
      </section>

      <footer className="text-center pt-8">
         <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em]">
            Transparent Subscriptions • Cancel Anytime in Sanctuary Settings
         </p>
      </footer>
    </div>
  );
}
