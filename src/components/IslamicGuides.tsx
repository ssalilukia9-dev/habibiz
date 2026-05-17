import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Map, 
  Compass, 
  Info, 
  Heart, 
  Baby, 
  ChevronRight, 
  Star, 
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
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
  { 
    title: "Entering Ihram", 
    day: "Day 1",
    date: "8th Dhul Hijjah",
    desc: "The spiritual commencement. Bathe, wear the Ihram garments, and make your intention (Niyyah).", 
    rituals: ["Ghusl & Ihram", "Niyyah for Hajj", "Start Talbiyah"],
    supplication: "Labbayka Allahumma Labbayk. Labbayka la sharika laka labbayk. Inna al-hamda wa-n-ni'mata laka wa-l-mulk, la sharika lak.",
    meaning: "I am at Your service, O Allah, I am at Your service. You have no partner, I am at your service. Surely all praise and grace are Yours, and the Sovereignty. You have no partner."
  },
  { 
    title: "Destination Mina", 
    day: "Day 1",
    date: "8th Dhul Hijjah",
    desc: "Gathering in the tent city of Mina. Spend the day in prayer and meditation.", 
    rituals: ["Pray Dhuhr, Asr, Maghrib, Isha", "Stay overnight in Mina", "Mental preparation"],
    supplication: "Focus on constant Talbiyah and Dhikr throughout the stay.",
    meaning: "Seeking closeness to Allah through quiet reflection in the sacred valley."
  },
  { 
    title: "Day of Arafah", 
    day: "Day 2",
    date: "9th Dhul Hijjah",
    desc: "The pinnacle of Hajj. Pilgrims gather at the plain of Arafat for the Standing (Wuquf).", 
    rituals: ["Wuquf (Standing)", "Supplications until sunset", "Seeking forgiveness"],
    supplication: "La ilaha illa-Allah wahdahu la sharika lah, lahu al-mulku wa lahu al-hamd, wa huwa 'ala kulli shay'in qadir.",
    meaning: "There is no god but Allah alone, Who has no partner. To Him belongs the Kingdom and to Him belongs all praise, and He has power over all things."
  },
  { 
    title: "Muzdalifah Night", 
    day: "Day 2 Night",
    date: "9th-10th Dhul Hijjah",
    desc: "Stay under the stars. Collect pebbles for the stoning ritual.", 
    rituals: ["Combined Maghrib & Isha", "Night stay", "Pebble collection (7-49+)"],
    supplication: "SubhanAllah, Alhamdulillah, La ilaha illa Allah, Allahu Akbar.",
    meaning: "Praising Allah and acknowledging His Greatness in the quiet of the night."
  },
  { 
    title: "Nahr (Stoning & Sacrifice)", 
    day: "Day 3 (Eid)",
    date: "10th Dhul Hijjah",
    desc: "The day of action. Stoning Jamrat al-Aqaba, Sacrifice, and Shaving hair.", 
    rituals: ["Stoning Jamrat al-Aqaba", "Qurbani (Sacrifice)", "Halaq (Shaving) or Taqsir (Trimming)", "Tawaf al-Ifadah"],
    supplication: "Allahu Akbar - with every pebble thrown.",
    meaning: "Symbolic rejection of temptation and sacrifice in the way of Allah."
  },
  { 
    title: "Days of Tashreeq", 
    day: "Days 4-6",
    date: "11th-13th Dhul Hijjah",
    desc: "Final days in Mina. Stone the three Jamarat pillars each day.", 
    rituals: ["Stoning 3 Jamarat", "Tadhakur (Remembrance)", "Farewell Tawaf (Wada)"],
    supplication: "Allahumma ij'alhu Hajjan mabruran wa dhanban maghfuran.",
    meaning: "O Allah, make it an accepted Hajj and make my sins forgiven."
  }
];

interface IslamicGuidesProps {
  initialTab?: 'hajj' | 'names';
  searchQuery?: string;
}

export default function IslamicGuides({ initialTab = 'hajj', searchQuery = '' }: IslamicGuidesProps) {
  const [activeTab, setActiveTab] = useState<'hajj' | 'names'>(initialTab);
  const [nameGender, setNameGender] = useState<'boys' | 'girls'>('boys');
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const filteredHajjSteps = HAJJ_STEPS.filter(step => 
    step.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    step.rituals.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBabyNames = (nameGender === 'boys' ? BABY_NAMES.boys : BABY_NAMES.girls).filter(n =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

             <div className="grid grid-cols-1 gap-6 px-4 md:px-0">
                {filteredHajjSteps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-white/5 flex flex-col gap-6 hover:border-brand-primary/20 transition-all cursor-pointer group"
                    onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                  >
                     <div className="flex gap-4 md:gap-6 items-start">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-brand-primary font-black text-xl md:text-2xl shrink-0 group-hover:scale-110 transition-transform">
                           {idx + 1}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
                              <h4 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight">{step.title}</h4>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-[8px] md:text-[10px] font-black text-brand-primary uppercase tracking-widest">{step.day}</span>
                                <span className="text-[7px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">{step.date}</span>
                              </div>
                           </div>
                           <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-bold opacity-80">{step.desc}</p>
                        </div>
                     </div>

                     <AnimatePresence>
                        {expandedStep === idx && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden space-y-6 pt-4 border-t border-white/5"
                          >
                             {/* Rituals List */}
                             <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rituals & Actions</p>
                                <div className="flex flex-wrap gap-2">
                                   {step.rituals.map((r, i) => (
                                     <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-[10px] md:text-xs text-white font-bold border border-white/5">
                                        • {r}
                                     </span>
                                   ))}
                                </div>
                             </div>

                             {/* Supplication */}
                             <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 space-y-4">
                                <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-4 bg-brand-primary rounded-full" />
                                      <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Key Supplication</p>
                                   </div>
                                </div>
                                <div className="space-y-3">
                                   <p className="text-sm md:text-lg text-white font-serif leading-relaxed italic">"{step.supplication}"</p>
                                   <div className="h-[1px] bg-brand-primary/10 w-full" />
                                   <p className="text-[10px] md:text-xs text-brand-primary/60 font-bold uppercase tracking-wide leading-relaxed">
                                      {step.meaning}
                                   </p>
                                </div>
                             </div>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="flex justify-center pt-2">
                        <div className={`p-2 rounded-full transition-all ${expandedStep === idx ? 'bg-brand-primary/10 text-brand-primary rotate-180' : 'text-slate-600'}`}>
                           <ChevronRight size={16} />
                        </div>
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
               {filteredBabyNames.map((n, idx) => (
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
