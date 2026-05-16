import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Shield, 
  Award, 
  ChevronRight, 
  Volume2, 
  Square, 
  Play,
  CheckCircle2,
  Lock,
  Pause
} from 'lucide-react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  serverTimestamp,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';

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
  { id: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", english: "The Supreme, The Majestic" },
];

const ADHKAR = [
  { 
    category: "Morning", 
    icon: Sun,
    items: [
      { 
        id: 'm1', 
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ", 
        english: "We have entered a new day and with it all dominion is Allah's. Praise is to Allah. None has the right to be worshipped but Allah alone.", 
        benefit: "Declaration of Tawheed",
        audio: "https://www.islamicfinder.org/dua/recording/1" 
      },
      { 
        id: 'm2', 
        arabic: "بِاسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", 
        english: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.", 
        benefit: "Protection from sudden harm",
        audio: "https://www.islamicfinder.org/dua/recording/2"
      }
    ]
  },
  { 
    category: "Evening", 
    icon: Moon,
    items: [
      { id: 'e1', arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", english: "We have entered the evening and with it all dominion is Allah's. Praise is to Allah.", benefit: "Gratitude for reaching evening" },
      { id: 'e2', arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", english: "I seek refuge in the perfect words of Allah from the evil of what He has created.", benefit: "Protection from poisonous stings/harm" },
      { id: 'e5', arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", english: "Allah is sufficient for me. None has the right to be worshipped but He. In Him I put my trust and He is the Lord of the Mighty Throne.", benefit: "Sufficiency in all matters (7x)" }
    ]
  }
];

export default function AdhkarView({ addHasanat, incrementDua }: { addHasanat: (amount: number) => void, incrementDua: () => void }) {
  const [activeTab, setActiveTab] = useState<'names' | 'adhkar'>('adhkar');
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, `users/${currentUser.uid}/adhkarProgress`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapping: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        mapping[doc.id] = doc.data().completed;
      });
      setCompletedMap(mapping);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'adhkarProgress');
    });

    return () => {
      unsubscribe();
      if (audioPlayer) audioPlayer.pause();
      window.speechSynthesis.cancel();
    };
  }, [currentUser]);

  const handleSpeak = (text: string, id: string, audioUrl?: string) => {
    if (speakingId === id) {
      if (audioPlayer) {
        audioPlayer.pause();
        setAudioPlayer(null);
      }
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    setSpeakingId(id);
    if (audioPlayer) audioPlayer.pause();
    window.speechSynthesis.cancel();

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.warn("Audio playback failed, synthesis used", e);
        startSynthesis(text, id);
      });
      audio.onended = () => setSpeakingId(null);
      setAudioPlayer(audio);
    } else {
      startSynthesis(text, id);
    }
  };

  const startSynthesis = (text: string, id: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  const toggleComplete = async (id: string) => {
    if (!currentUser) {
      alert("Connect your heart to the sanctuary to track progress.");
      return;
    }

    const isCurrentlyCompleted = completedMap[id];
    try {
      await setDoc(doc(db, `users/${currentUser.uid}/adhkarProgress`, id), {
        adhkarId: id,
        completed: !isCurrentlyCompleted,
        lastCompletedAt: serverTimestamp()
      });

      if (!isCurrentlyCompleted) {
        incrementDua();
        addHasanat(10);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `adhkarProgress/${id}`);
    }
  };

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const totalCount = ADHKAR.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex p-1 bg-white/5 rounded-2xl w-full md:w-fit">
          {['adhkar', 'names'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${activeTab === tab ? 'bg-brand-primary text-brand-depth shadow-xl' : 'text-slate-500 hover:text-slate-400'}`}
            >
              {tab === 'adhkar' ? 'Daily Adhkar' : '99 Names'}
            </button>
          ))}
        </div>

        {activeTab === 'adhkar' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6 bg-brand-sidebar border border-white/5 p-4 pr-8 rounded-3xl"
          >
             <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                   <Sparkles size={20} />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-brand-sidebar"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
             </div>
             <div className="space-y-1">
                <div className="flex items-center justify-between gap-12">
                   <p className="text-[10px] font-black text-white uppercase tracking-widest">Spiritual Momentum</p>
                   <p className="text-[10px] font-black text-brand-primary uppercase">{Math.round((completedCount / totalCount) * 100)}%</p>
                </div>
                <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                     className="h-full bg-brand-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                   />
                </div>
             </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'adhkar' ? (
          <motion.div 
            key="adhkar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-20"
          >
            {ADHKAR.map((cat) => (
              <section key={cat.category} className="space-y-8">
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-3xl bg-brand-sidebar border border-white/5 ${cat.category === 'Morning' ? 'text-brand-primary' : 'text-blue-400'} shadow-2xl`}>
                         <cat.icon size={28} />
                      </div>
                      <div>
                         <h3 className="text-3xl font-black text-white tracking-tight">{cat.category} Remembrance</h3>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Lock size={10} className="text-brand-primary/40" />
                            Sacred Protection {cat.items.length} Verses
                         </p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {cat.items.map((dhikr, idx) => (
                     <motion.div 
                        key={dhikr.id}
                        layout
                        className={`group relative glass-panel p-10 rounded-[3rem] border border-white/5 transition-all duration-500 overflow-hidden ${completedMap[dhikr.id] ? 'bg-brand-primary/[0.03] border-brand-primary/20' : 'hover:border-brand-primary/30 hover:bg-white/[0.02]'}`}
                     >
                        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                           <div className="flex justify-between items-start gap-8">
                              <div className="flex flex-col gap-4">
                                 <motion.button 
                                   whileHover={{ scale: 1.1 }}
                                   whileTap={{ scale: 0.9 }}
                                   onClick={() => toggleComplete(dhikr.id)}
                                   className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${completedMap[dhikr.id] ? 'bg-brand-primary border-brand-primary text-brand-depth shadow-lg' : 'border-white/10 text-slate-600 hover:border-brand-primary/40 hover:text-brand-primary'}`}
                                 >
                                    {completedMap[dhikr.id] ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
                                 </motion.button>
                                 <motion.button 
                                   whileHover={{ scale: 1.1 }}
                                   whileTap={{ scale: 0.9 }}
                                   onClick={() => handleSpeak(dhikr.arabic, dhikr.id, dhikr.audio)}
                                   className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${speakingId === dhikr.id ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'border-white/10 text-slate-600 hover:border-amber-500/40 hover:text-amber-500'}`}
                                 >
                                    {speakingId === dhikr.id ? <Pause size={24} fill="currentColor" /> : <Volume2 size={24} />}
                                 </motion.button>
                              </div>
                              <p className="arabic-text text-4xl text-right leading-[1.8] text-white/90 font-medium flex-1">
                                 {dhikr.arabic}
                              </p>
                           </div>

                           <div className="space-y-6">
                              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                 <p className="text-slate-400 text-sm font-medium leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all duration-500">"{dhikr.english}"</p>
                              </div>
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2.5 px-4 py-2 bg-brand-primary/5 rounded-full border border-brand-primary/10">
                                    <Shield size={14} className="text-brand-primary" />
                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.1em]">{dhikr.benefit}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
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
            {NAMES_OF_ALLAH.map((name, idx) => (
              <motion.div 
                key={name.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative bg-brand-sidebar/40 border border-white/5 rounded-[3rem] p-10 text-center hover:bg-brand-sidebar/80 hover:border-brand-primary/30 transition-all duration-500"
              >
                 <div className="w-20 h-20 bg-brand-primary/5 rounded-[1.5rem] flex items-center justify-center text-brand-primary mx-auto group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-brand-depth transition-all duration-500 shadow-xl">
                    <Award size={32} />
                 </div>
                 <div className="space-y-6 mt-8">
                    <p className="arabic-text text-5xl text-white tracking-widest">{name.arabic}</p>
                    <div className="space-y-2">
                       <h4 className="text-2xl font-black text-brand-primary tracking-tight">{name.transliteration}</h4>
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{name.english}</p>
                    </div>
                    <motion.button 
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => handleSpeak(name.arabic, `name-${name.id}`)}
                       className={`mx-auto w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${speakingId === `name-${name.id}` ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'border-white/10 text-slate-500 hover:border-amber-500 hover:text-amber-500'}`}
                     >
                       {speakingId === `name-${name.id}` ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                     </motion.button>
                 </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
