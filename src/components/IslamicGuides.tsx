import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Map, Compass, Info, Heart, Baby } from 'lucide-react';

const BABY_NAMES = {
  boys: [
    { name: "Muhammad", meaning: "Praiseworthy" },
    { name: "Ahmed", meaning: "Much praised" },
    { name: "Omar", meaning: "Long-lived, flourishing" },
    { name: "Ali", meaning: "Noble, high" },
    { name: "Zaid", meaning: "Abundance, growth" },
    { name: "Hassan", meaning: "Beautiful, good" },
    { name: "Ibrahim", meaning: "Father of nations" },
    { name: "Yusuf", meaning: "Allah increases" },
    { name: "Hamza", meaning: "Strong, lion" },
    { name: "Bilal", meaning: "Moisture, freshness" },
    { name: "Idris", meaning: "Interpreter, patient" },
    { name: "Yahya", meaning: "John (prophet)" },
    { name: "Malik", meaning: "King, master" },
    { name: "Rayyan", meaning: "Gates of paradise" },
    { name: "Tariq", meaning: "Morning star" },
    { name: "Zubair", meaning: "Strong, brave" },
    { name: "Sulaiman", meaning: "Peaceful" },
    { name: "Ayaan", meaning: "God's gift" },
    { name: "Bashir", meaning: "Bringer of good news" },
    { name: "Fares", meaning: "Knight, horseman" },
    { name: "Haris", meaning: "Guardian" },
    { name: "Imran", meaning: "Prosperity" },
    { name: "Junaid", meaning: "Soldier" },
    { name: "Karim", meaning: "Generous" },
    { name: "Luqman", meaning: "Wise man" },
    { name: "Nabil", meaning: "Noble" },
    { name: "Qasim", meaning: "Distributor" },
    { name: "Ramez", meaning: "Symbol" },
    { name: "Sami", meaning: "Lofty, exalted" },
    { name: "Talha", meaning: "Fruitful tree" }
  ],
  girls: [
    { name: "Fatima", meaning: "One who abstains" },
    { name: "Aisha", meaning: "Alive, flourishing" },
    { name: "Maryam", meaning: "Beloved, pious" },
    { name: "Khadija", meaning: "Premature, trustworthy" },
    { name: "Zainab", meaning: "Fragrant flower" },
    { name: "Sara", meaning: "Princess, joyful" },
    { name: "Jannah", meaning: "Paradise" },
    { name: "Noor", meaning: "Light" },
    { name: "Hanna", meaning: "Compassion" },
    { name: "Hafsa", meaning: "Young lioness" },
    { name: "Layla", meaning: "Night beauty" },
    { name: "Amira", meaning: "Princess" },
    { name: "Dina", meaning: "Love" },
    { name: "Eman", meaning: "Faith" },
    { name: "Farah", meaning: "Joy" },
    { name: "Ghada", meaning: "Graceful woman" },
    { name: "Hiba", meaning: "Gift from God" },
    { name: "Inaya", meaning: "Concern, care" },
    { name: "Jummana", meaning: "Silver pearl" },
    { name: "Kenza", meaning: "Treasure" },
    { name: "Lina", meaning: "Tender, palm tree" },
    { name: "Muna", meaning: "Desire, hope" },
    { name: "Nadia", meaning: "Hopeful" },
    { name: "Ola", meaning: "Highness" },
    { name: "Rania", meaning: "Queen" },
    { name: "Safiya", meaning: "Pure, chosen" },
    { name: "Tasnim", meaning: "Fountain in paradise" },
    { name: "Uzma", meaning: "Greatest" },
    { name: "Yara", meaning: "Small butterfly" },
    { name: "Zahra", meaning: "Flower, radiant" }
  ]
};

const HAJJ_STEPS = [
  { title: "Ihram", desc: "Setting the intention and wearing the sacred attire.", day: "8th Dhul Hijjah" },
  { title: "Mina", desc: "Staying in the city of tents for prayer and reflection.", day: "8th Dhul Hijjah" },
  { title: "Arafat", desc: "The pinnacle of Hajj. Standing in prayer from Dhuhr to Sunset.", day: "9th Dhul Hijjah" },
  { title: "Muzdalifah", desc: "Spending the night under the stars and collecting pebbles.", day: "9th Dhul Hijjah Night" },
  { title: "Jamarat", desc: "Rami (stoning) of the pillars representing Shaytan.", day: "10th - 12th Dhul Hijjah" },
  { title: "Tawaf & Sa'i", desc: "Circling the Kaaba and walking between Safa and Marwa.", day: "10th Dhul Hijjah" }
];

export default function IslamicGuides() {
  const [activeTab, setActiveTab] = useState<'hajj' | 'names'>('hajj');
  const [nameGender, setNameGender] = useState<'boys' | 'girls'>('boys');

  return (
    <div className="space-y-10">
      <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('hajj')}
          className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'hajj' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
        >
          Umrah & Hajj Guide
        </button>
        <button 
          onClick={() => setActiveTab('names')}
          className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'names' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
        >
          Islamic Baby Names
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'hajj' ? (
          <motion.div 
            key="hajj"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4">
               <h3 className="text-4xl font-black text-white">The Journey of a Lifetime</h3>
               <p className="text-slate-500 font-medium max-w-xl mx-auto">A step-by-step spiritual guide to performing Umrah and Hajj correctly according to the Sunnah.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {HAJJ_STEPS.map((step, idx) => (
                 <div key={idx} className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex gap-6 hover:border-brand-primary/20 transition-all">
                    <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black text-xl shrink-0">
                       {idx + 1}
                    </div>
                    <div>
                       <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xl font-bold text-white">{step.title}</h4>
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{step.day}</span>
                       </div>
                       <p className="text-slate-400 text-sm leading-relaxed font-medium">{step.desc}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
               <div className="w-32 h-32 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary shrink-0 animate-pulse">
                  <Map size={64} />
               </div>
               <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white">Interactive Map Coming Soon</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">
                     We are working on a GPS-enabled spiritual companion that guides you through the holy sites of Makkah and Madinah in real-time.
                  </p>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="names"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-5xl mx-auto space-y-12"
          >
            <div className="text-center space-y-4">
               <h3 className="text-4xl font-black text-white">Beautiful Islamic Names</h3>
               <p className="text-slate-500 font-medium">Choosing a name with a righteous meaning for your newborn.</p>
            </div>

            <div className="flex gap-4 justify-center">
               <button 
                 onClick={() => setNameGender('boys')}
                 className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-bold transition-all ${nameGender === 'boys' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-500'}`}
               >
                  <Baby size={20} /> Boys
               </button>
               <button 
                 onClick={() => setNameGender('girls')}
                 className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-sm font-bold transition-all ${nameGender === 'girls' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-500'}`}
               >
                  <Heart size={20} /> Girls
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(nameGender === 'boys' ? BABY_NAMES.boys : BABY_NAMES.girls).map((n, idx) => (
                 <div key={idx} className="glass-panel p-6 rounded-2xl border-white/5 group hover:border-brand-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-1">
                       <h5 className="text-lg font-black text-white group-hover:text-brand-primary transition-colors">{n.name}</h5>
                       <span className="text-[10px] items-center px-2 py-0.5 rounded-full bg-white/5 text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">Arabic</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{n.meaning}</p>
                 </div>
               ))}
               <div className="lg:col-span-3 text-center py-10 opacity-40">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.5em]">200+ More Names being verified</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
