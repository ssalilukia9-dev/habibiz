import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sun, Moon, Shield, Award, ChevronRight, Volume2, Square, Play } from 'lucide-react';

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
];

const ADHKAR = [
  { 
    category: "Morning", 
    icon: Sun,
    items: [
      { id: 'm1', arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ", english: "We have entered a new day and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone.", benefit: "Declaration of Tawheed" },
      { id: 'm2', arabic: "بِاسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", english: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.", benefit: "Protection from sudden harm" },
      { id: 'm3', arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", english: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Resurrection.", benefit: "Acknowledging Allah's control" },
      { id: 'm4', arabic: "رَضِيتُ بِاللَّهِ رَبَّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", english: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (PBUH) as my Prophet.", benefit: "Allah's pleasure on Judgment Day" },
      { id: 'm5', arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَستَغِيثُ، أَصلِح لِي شَأنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفسِي طَرفَةَ عَيْنٍ", english: "O Ever Living, O Self-Subsisting, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself for even a blink of an eye.", benefit: "Complete reliance on Allah" },
      { id: 'm6', arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ", english: "We have entered the morning upon the natural religion of Islam and the word of sincerity.", benefit: "Firmness in faith" },
      { id: 'm7', arabic: "سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", english: "Glory is to Allah and praise is to Him, by the multitude of His creation, by His Pleasure, by the weight of His Throne, and by the extent of His Words.", benefit: "Immeasurable reward (3x)" }
    ]
  },
  { 
    category: "Evening", 
    icon: Moon,
    items: [
      { id: 'e1', arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", english: "We have entered the evening and with it all dominion is Allah's. Praise is to Allah.", benefit: "Gratitude for reaching evening" },
      { id: 'e2', arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", english: "I seek refuge in the perfect words of Allah from the evil of what He has created.", benefit: "Protection from poisonous stings/harm" },
      { id: 'e3', arabic: "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ، وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ", english: "O Allah, we seek refuge in You from joining anything with You that we know, and we seek Your forgiveness for what we do not know.", benefit: "Protection from Shirk" },
      { id: 'e4', arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي", english: "O Allah, grant me health in my body. O Allah, grant me health in my hearing. O Allah, grant me health in my sight.", benefit: "Supplication for well-being" },
      { id: 'e5', arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", english: "Allah is sufficient for me. None has the right to be worshipped but He. In Him I put my trust and He is the Lord of the Mighty Throne.", benefit: "Sufficiency in all matters (7x)" },
      { id: 'e6', arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", english: "Glory is to Allah and praise is to Him.", benefit: "Sins forgiven even if like foam of sea (100x)" }
    ]
  },
  {
    category: "Before Sleep",
    icon: Shield,
    items: [
      { id: 's1', arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ", english: "In Your Name, my Lord, I lay my side down to sleep, and by Your leave I raise it up.", benefit: "Protection during sleep" },
      { id: 's2', arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", english: "O Allah, protect me from Your punishment on the day You resurrect Your slaves.", benefit: "Safety from the Hereafter" }
    ]
  },
  {
    category: "After Prayer",
    icon: Award,
    items: [
      { id: 'p1', arabic: "أَسْتَغْفِرُ اللهَ (ثَلَاثاً)", english: "I seek Allah's forgiveness (3 times).", benefit: "Purification after Salah" },
      { id: 'p2', arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", english: "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Honor.", benefit: "Greeting the Source of Peace" }
    ]
  }
];

export default function AdhkarView({ addHasanat, incrementDua }: { addHasanat: (amount: number) => void, incrementDua: () => void }) {
  const [activeTab, setActiveTab] = useState<'names' | 'adhkar'>('adhkar');
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleComplete = (id: string) => {
    const next = new Set(completed);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      incrementDua();
    }
    setCompleted(next);
  };

  const completedCount = completed.size;
  const totalCount = ADHKAR.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-4 p-1 bg-white/5 rounded-2xl w-full sm:w-fit">
          <button 
            onClick={() => setActiveTab('adhkar')}
            className={`px-6 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 sm:flex-none ${activeTab === 'adhkar' ? 'bg-brand-primary text-brand-depth shadow-xl shadow-brand-primary/20' : 'text-slate-500 hover:text-slate-400'}`}
          >
            Daily Adhkar
          </button>
          <button 
            onClick={() => setActiveTab('names')}
            className={`px-6 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 sm:flex-none ${activeTab === 'names' ? 'bg-brand-primary text-brand-depth shadow-xl shadow-brand-primary/20' : 'text-slate-500 hover:text-slate-400'}`}
          >
            99 Names
          </button>
        </div>

        {activeTab === 'adhkar' && (
          <div className="flex items-center gap-3 bg-brand-sidebar border border-white/5 py-2 px-6 rounded-full">
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary/20 flex items-center justify-center">
               <Sparkles className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-wider">{completedCount} / {totalCount} Completed</p>
              <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                   className="h-full bg-brand-primary shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                 />
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'adhkar' ? (
          <motion.div 
            key="adhkar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            {ADHKAR.map((cat) => (
              <section key={cat.category} className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                   <div className={`p-3 rounded-2xl bg-brand-sidebar shadow-lg border border-white/5 ${cat.category === 'Morning' ? 'text-brand-primary' : 'text-blue-400'}`}>
                      <cat.icon className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-wider">{cat.category}</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Remembrance & Protection</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {cat.items.map((dhikr) => (
                     <motion.div 
                        key={dhikr.id}
                        layout
                        className={`glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6 flex flex-col justify-between transition-all group relative overflow-hidden ${completed.has(dhikr.id) ? 'bg-brand-primary/5 border-brand-primary/20' : ''}`}
                     >
                        <div className="space-y-6 relative z-10">
                           <div className="flex justify-between items-start gap-4">
                              <div className="flex flex-col gap-3">
                                <button 
                                  onClick={() => toggleComplete(dhikr.id)}
                                  className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${completed.has(dhikr.id) ? 'bg-brand-primary border-brand-primary text-brand-depth' : 'border-white/10 text-slate-400 hover:border-brand-primary/40 hover:text-brand-primary'}`}
                                >
                                   <ChevronRight size={18} className={`transition-transform ${completed.has(dhikr.id) ? 'rotate-90' : ''}`} />
                                </button>
                                <button 
                                  onClick={() => handleSpeak(dhikr.arabic, dhikr.id)}
                                  className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${speakingId === dhikr.id ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'border-white/10 text-slate-400 hover:border-amber-500/40 hover:text-amber-500'}`}
                                >
                                   {speakingId === dhikr.id ? <Square size={16} fill="currentColor" /> : <Volume2 size={18} />}
                                </button>
                              </div>
                              <p className="arabic-text text-3xl text-brand-primary leading-loose text-right flex-1">{dhikr.arabic}</p>
                           </div>
                           <p className="text-slate-300 text-sm font-medium leading-relaxed italic">{dhikr.english}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-brand-primary transition-colors">
                              <Shield className="w-3.5 h-3.5" /> {dhikr.benefit}
                           </div>
                           {completed.has(dhikr.id) && (
                             <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[10px] font-black text-brand-primary uppercase tracking-widest"
                             >
                                Done
                             </motion.span>
                           )}
                        </div>

                        {completed.has(dhikr.id) && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        )}
                     </motion.div>
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
              <div key={name.id} className="glass-panel p-8 rounded-[2rem] border-white/5 text-center space-y-6 group hover:border-brand-primary/20 transition-all relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-brand-primary/5 rounded-full flex items-center justify-center text-brand-primary mx-auto group-hover:scale-110 transition-transform">
                     <Award size={32} />
                  </div>
                  <div className="space-y-4 mt-6">
                     <p className="arabic-text text-4xl text-white mb-2">{name.arabic}</p>
                     <div className="space-y-1">
                        <h4 className="text-xl font-black text-brand-primary">{name.transliteration}</h4>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{name.english}</p>
                     </div>
                     <button 
                        onClick={() => handleSpeak(name.arabic, `name-${name.id}`)}
                        className={`mx-auto w-10 h-10 rounded-full border flex items-center justify-center transition-all ${speakingId === `name-${name.id}` ? 'bg-amber-500 border-amber-500 text-white' : 'border-white/10 text-slate-500 hover:border-amber-500 hover:text-amber-500'}`}
                      >
                        {speakingId === `name-${name.id}` ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
