import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Map, Compass, Info, Heart, Baby } from 'lucide-react';
import HajjMap from './HajjMap';

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
    { name: "Talha", meaning: "Fruitful tree" },
    { name: "Anas", meaning: "Friendliness" },
    { name: "Adam", meaning: "First man" },
    { name: "Arshad", meaning: "Better guided" },
    { name: "Ashraf", meaning: "Most noble" },
    { name: "Daud", meaning: "Beloved" },
    { name: "Faisal", meaning: "Decisive" },
    { name: "Habib", meaning: "Beloved" },
    { name: "Hadi", meaning: "Guide" },
    { name: "Ilyas", meaning: "Prophet Elias" },
    { name: "Ishaq", meaning: "Laughter, prophet" },
    { name: "Ismail", meaning: "God hears" },
    { name: "Jawad", meaning: "Generous" },
    { name: "Khalid", meaning: "Eternal" },
    { name: "Lutfi", meaning: "Kind" },
    { name: "Mahmoud", meaning: "Praised" },
    { name: "Mansour", meaning: "Victorious" },
    { name: "Marwan", meaning: "Fragrant wood" },
    { name: "Musa", meaning: "Saved from water" },
    { name: "Mustafa", meaning: "The chosen one" },
    { name: "Osman", meaning: "Young bustard" },
    { name: "Raheem", meaning: "Merciful" },
    { name: "Saad", meaning: "Felicity" },
    { name: "Saeed", meaning: "Happy" },
    { name: "Wahid", meaning: "The unique one" },
    { name: "Sameer", meaning: "Entertaining companion" },
    { name: "Aamir", meaning: "Prosperous" },
    { name: "Asim", meaning: "Protector" },
    { name: "Bassam", meaning: "Smiling" },
    { name: "Elias", meaning: "Prophet" },
    { name: "Fadi", meaning: "Redeemer" },
    { name: "Ghaith", meaning: "Rain" },
    { name: "Hassan", meaning: "Pious" },
    { name: "Iyad", meaning: "Support" },
    { name: "Jasim", meaning: "Powerful" },
    { name: "Kamal", meaning: "Perfection" },
    { name: "Labib", meaning: "Sensible" },
    { name: "Maher", meaning: "Skilled" },
    { name: "Nizar", meaning: "Little" },
    { name: "Qadir", meaning: "Capable" },
    { name: "Raed", meaning: "Leader" },
    { name: "Said", meaning: "Happy" },
    { name: "Thabit", meaning: "Firm" },
    { name: "Umar", meaning: "Life" },
    { name: "Wafic", meaning: "Successful" },
    { name: "Yasin", meaning: "Prophet" },
    { name: "Zaki", meaning: "Pure" }
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
    { name: "Zahra", meaning: "Flower, radiant" },
    { name: "Amal", meaning: "Hope" },
    { name: "Anisa", meaning: "Close friend" },
    { name: "Basma", meaning: "Smile" },
    { name: "Dalal", meaning: "Coyness, tenderness" },
    { name: "Du'a", meaning: "Prayer" },
    { name: "Falak", meaning: "Orbit, sky" },
    { name: "Ghalia", meaning: "Precious" },
    { name: "Hala", meaning: "Aura of the moon" },
    { name: "Inas", meaning: "Sociability" },
    { name: "Isra", meaning: "Night journey" },
    { name: "Jinan", meaning: "Gardens of Paradise" },
    { name: "Karima", meaning: "Generous" },
    { name: "Lamis", meaning: "Soft to the touch" },
    { name: "Lujain", meaning: "Silver" },
    { name: "Maha", meaning: "Wild cow (beautiful eyes)" },
    { name: "Malika", meaning: "Queen" },
    { name: "Nawal", meaning: "Gift" },
    { name: "Rana", meaning: "Attractive" },
    { name: "Salma", meaning: "Peaceful" },
    { name: "Sawsan", meaning: "Lily of the valley" },
    { name: "Warda", meaning: "Rose" },
    { name: "Yasmin", meaning: "Jasmine" },
    { name: "Afaf", meaning: "Chastity" },
    { name: "Buthayna", meaning: "Beautiful woman" },
    { name: "Dalia", meaning: "Dahlia flower" },
    { name: "Fadia", meaning: "Redeemer" },
    { name: "Galia", meaning: "Precious" },
    { name: "Heba", meaning: "Gift" },
    { name: "Iffat", meaning: "Virtue" },
    { name: "Jala", meaning: "Clarity" },
    { name: "Kamilah", meaning: "Perfect" },
    { name: "Lamia", meaning: "Dark lipped" },
    { name: "Madiha", meaning: "Praiseworthy" },
    { name: "Najad", meaning: "Help" },
    { name: "Qubilah", meaning: "Concord" },
    { name: "Raja", meaning: "Hope" },
    { name: "Sahar", meaning: "Dawn" },
    { name: "Tahani", meaning: "Congratulations" },
    { name: "Umnia", meaning: "Wish" },
    { name: "Wafa", meaning: "Faithfulness" },
    { name: "Yusra", meaning: "Ease" },
    { name: "Zakiya", meaning: "Pure" }
  ]
};

const HAJJ_STEPS = [
  { title: "Day 1: Arrival & Umrah", desc: "Arrive in Makkah in state of Ihram. Perform Tawaf and Sa'i for Umrah followed by Tahallul (shaving/cutting hair).", day: "Arrival / Umrah" },
  { title: "Day 2-4: Spiritual Prep", desc: "Engage in prayers at Masjid al-Haram, increase recitation of Quran, and attend religious lectures in Makkah.", day: "Settling In" },
  { title: "Day 5 (8th): Mina", desc: "Enter state of Ihram if not already. Depart for Mina. Stay in tents. Perform Dhuhr, Asr, Maghrib, Isha and Fajr prayers.", day: "Yawm at-Tarwiyah" },
  { title: "Day 6 (9th): Arafat", desc: "Depart for Arafat after sunrise. Stand in prayer and supplication (Wuquf) until sunset. This is the heart of Hajj.", day: "Day of Arafah" },
  { title: "Day 6 (9th Night): Muzdalifah", desc: "Move to Muzdalifah after sunset. Pray Maghrib and Isha together. Spend the night under the stars and collect pebbles.", day: "Night at Muzdalifah" },
  { title: "Day 7 (10th): Jamarat & Eid", desc: "Return to Mina. Stoning of Jamarat al-Aqaba. Offer Sacrifice (Qurbani). Shave/cut hair. Perform Tawaf al-Ifadah.", day: "Yawm an-Nahr (Eid)" },
  { title: "Day 8 (11th): Mina Stoning", desc: "Stay in Mina. Stone all three pillars (Small, Medium, Large) after Dhuhr. Focus on Dhikr and Tasbih.", day: "1st Day of Tashreeq" },
  { title: "Day 9 (12th): Mina & Return", desc: "Stone three pillars again. If leaving, depart Mina before sunset for Makkah, otherwise stay another night.", day: "2nd Day of Tashreeq" },
  { title: "Day 10 (13th): Farewell", desc: "Last stoning if still in Mina. Perform Tawaf al-Wada (Farewell Tawaf) before departing Makkah.", day: "Farewell" }
];

interface IslamicGuidesProps {
  initialTab?: 'hajj' | 'names';
}

export default function IslamicGuides({ initialTab = 'hajj' }: IslamicGuidesProps) {
  const [activeTab, setActiveTab] = useState<'hajj' | 'names'>(initialTab);
  const [nameGender, setNameGender] = useState<'boys' | 'girls'>('boys');

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row gap-4 p-1 bg-white/5 rounded-2xl w-full sm:w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('hajj')}
          className={`px-4 sm:px-8 py-3 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-none ${activeTab === 'hajj' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
        >
          Hajj Guide
        </button>
        <button 
          onClick={() => setActiveTab('names')}
          className={`px-4 sm:px-8 py-3 rounded-xl text-xs font-bold transition-all flex-1 sm:flex-none ${activeTab === 'names' ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500'}`}
        >
          Names
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
             <div className="text-center space-y-4 px-4">
                <h3 className="text-2xl md:text-4xl font-black text-white px-6 md:px-0">The Journey of a Lifetime</h3>
                <p className="text-sm md:text-lg text-slate-500 font-medium max-w-xl mx-auto">A step-by-step spiritual guide to performing Umrah and Hajj correctly according to the Sunnah.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
                {HAJJ_STEPS.map((step, idx) => (
                  <div key={idx} className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 flex gap-4 md:gap-6 hover:border-brand-primary/20 transition-all">
                     <div className="w-10 h-10 md:w-14 md:h-14 bg-brand-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-primary font-black text-lg md:text-xl shrink-0">
                        {idx + 1}
                     </div>
                     <div>
                        <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
                           <h4 className="text-base md:text-xl font-bold text-white">{step.title}</h4>
                           <span className="text-[8px] md:text-[10px] font-black text-brand-primary uppercase tracking-widest shrink-0">{step.day}</span>
                        </div>
                        <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">{step.desc}</p>
                     </div>
                  </div>
                ))}
             </div>

            <div className="space-y-8">
               <div className="text-center">
                  <h4 className="text-xl md:text-2xl font-black text-white mb-2">Interactive Hajj Map</h4>
                  <p className="text-xs md:text-sm text-slate-400 font-medium">Explore the holy sites and track your journey in real-time.</p>
               </div>
               <HajjMap />
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
            <div className="text-center space-y-2 md:space-y-4 px-4">
               <h3 className="text-2xl md:text-4xl font-black text-white">Beautiful Islamic Names</h3>
               <p className="text-sm md:text-base text-slate-500 font-medium">Choosing a name with a righteous meaning for your newborn.</p>
            </div>

            <div className="flex gap-3 md:gap-4 justify-center px-4">
               <button 
                 onClick={() => setNameGender('boys')}
                 className={`flex items-center justify-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all flex-1 md:flex-none ${nameGender === 'boys' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-500'}`}
               >
                  <Baby className="w-4.5 h-4.5 md:w-5 md:h-5" /> Boys
               </button>
               <button 
                 onClick={() => setNameGender('girls')}
                 className={`flex items-center justify-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all flex-1 md:flex-none ${nameGender === 'girls' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-500'}`}
               >
                  <Heart className="w-4.5 h-4.5 md:w-5 md:h-5" /> Girls
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
               {(nameGender === 'boys' ? BABY_NAMES.boys : BABY_NAMES.girls).map((n, idx) => (
                 <div key={idx} className="glass-panel p-5 md:p-6 rounded-xl md:rounded-2xl border-white/5 group hover:border-brand-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-1">
                       <h5 className="text-base md:text-lg font-black text-white group-hover:text-brand-primary transition-colors">{n.name}</h5>
                       <span className="text-[9px] md:text-[10px] items-center px-2 py-0.5 rounded-full bg-white/5 text-slate-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">Arabic</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{n.meaning}</p>
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
