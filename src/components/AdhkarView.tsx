import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sun, Moon, Shield, Award, ChevronRight } from 'lucide-react';

const NAMES_OF_ALLAH = [
  { id: 1, arabic: "الرَّحْمَنُ", transliteration: "Ar-Rahman", english: "The Most Merciful" },
  { id: 2, arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", english: "The Especially Merciful" },
  { id: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", english: "The Sovereign Lord" },
  { id: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", english: "The Holy" },
  { id: 5, arabic: "السَّلَامُ", transliteration: "As-Salam", english: "The Source of Peace" },
  { id: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", english: "The Guardian of Faith" },
  { id: 7, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", english: "The Protector" },
  { id: 8, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", english: "The Mighty" },
  { id: 9, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", english: "The Compeller" },
  // ... more names could be added
];

const ADHKAR = [
  { 
    category: "Morning", 
    items: [
      { arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", english: "We have entered a new day and with it all dominion is Allah's.", benefit: "Protection throughout the day" },
      { arabic: "بِاسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", english: "In the Name of Allah with Whose Name nothing can cause harm.", benefit: "Protection from harm" }
    ]
  },
  { 
    category: "Evening", 
    items: [
      { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", english: "We have entered the evening and with it all dominion is Allah's.", benefit: "Peace during the night" },
      { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", english: "I seek refuge in the perfect words of Allah from the evil of what He has created.", benefit: "Safety from evil" }
    ]
  }
];

export default function AdhkarView() {
  const [activeTab, setActiveTab] = useState<'names' | 'adhkar'>('adhkar');

  return (
    <div className="space-y-10">
      <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('adhkar')}
          className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'adhkar' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
        >
          Daily Adhkar
        </button>
        <button 
          onClick={() => setActiveTab('names')}
          className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'names' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
        >
          99 Names of Allah
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'adhkar' ? (
          <motion.div 
            key="adhkar"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            {ADHKAR.map((cat, idx) => (
              <section key={idx} className="space-y-6">
                <div className="flex items-center gap-4 px-6">
                   {cat.category === 'Morning' ? <Sun className="text-brand-primary" /> : <Moon className="text-blue-400" />}
                   <h3 className="text-2xl font-black text-white">{cat.category} Remembrance</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {cat.items.map((dhikr, didx) => (
                     <div key={didx} className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between">
                        <div className="space-y-6">
                           <div className="flex justify-end">
                              <p className="arabic-text text-3xl text-brand-primary leading-loose text-right">{dhikr.arabic}</p>
                           </div>
                           <p className="text-slate-400 text-sm font-medium leading-relaxed italic">{dhikr.english}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-6 border-t border-white/5 text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">
                           <Shield size={14} /> {dhikr.benefit}
                        </div>
                     </div>
                   ))}
                </div>
              </section>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="names"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {NAMES_OF_ALLAH.map((name) => (
              <div key={name.id} className="glass-panel p-8 rounded-[2rem] border-white/5 text-center space-y-4 group hover:border-brand-primary/20 transition-all">
                <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary mx-auto group-hover:scale-110 transition-transform">
                   <Award size={32} />
                </div>
                <div className="space-y-1">
                   <p className="arabic-text text-4xl text-white mb-2">{name.arabic}</p>
                   <h4 className="text-xl font-black text-brand-primary">{name.transliteration}</h4>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{name.english}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
