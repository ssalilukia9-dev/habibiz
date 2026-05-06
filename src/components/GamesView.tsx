import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Gamepad2, 
  Trophy, 
  Target, 
  Scroll, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  History,
  Heart,
  Brain,
  XCircle
} from 'lucide-react';

interface Game {
  id: string;
  title: string;
  desc: string;
  icon: any;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  reward: number;
  color: string;
}

const GAMES: Game[] = [
  { id: 'quiz', title: 'Islamic Trivia', desc: 'Test your knowledge on Quran, Hadith, and History.', icon: Scroll, difficulty: 'Medium', reward: 200, color: 'from-blue-600/20 to-blue-900/20' },
  { id: 'memory', title: 'Arabic Memory', desc: 'Match Arabic letters to sharpen your recognition.', icon: Target, difficulty: 'Easy', reward: 100, color: 'from-purple-600/20 to-purple-900/20' },
  { id: 'names', title: '99 Names Dash', desc: 'Identify the attributes of Allah as fast as you can.', icon: Sparkles, difficulty: 'Hard', reward: 300, color: 'from-purple-600/20 to-purple-900/20' },
  { id: 'timeline', title: 'Prophets Timeline', desc: 'Arrange the Prophets in their historical order.', icon: History, difficulty: 'Medium', reward: 150, color: 'from-amber-600/20 to-amber-900/20' },
  { id: 'pillars', title: 'Pillars Puzzle', desc: 'Drag and drop the pillars of Islam and Iman.', icon: ShieldCheck, difficulty: 'Easy', reward: 100, color: 'from-rose-600/20 to-rose-900/20' },
  { id: 'seerah', title: 'Seerah Quest', desc: 'Unscramble events from the life of Prophet Muhammad (PBUH).', icon: BookOpen, difficulty: 'Hard', reward: 250, color: 'from-indigo-600/20 to-indigo-900/20' }
];

// --- GAME DATA ---

const TRIVIA_QUESTIONS = [
  // Level 1
  { l: 1, q: "Which Surah is known as the 'Heart of the Quran'?", a: ["Surah Ya-Sin", "Surah Al-Fatiha", "Surah Al-Baqarah", "Surah Al-Mulk"], correct: 0 },
  { l: 1, q: "In which month was the Quran first revealed?", a: ["Rajab", "Ramadan", "Dhul-Hijjah", "Muharram"], correct: 1 },
  { l: 1, q: "How many Sahaba are mentioned by name in the Quran?", a: ["1", "5", "10", "Zero"], correct: 0 },
  // Level 2 (Harder)
  { l: 2, q: "Which Sahabi was known as 'The Sword of Allah'?", a: ["Umar ibn al-Khattab", "Khalid ibn al-Walid", "Ali ibn Abi Talib", "Hamza ibn 'Abd al-Muttalib"], correct: 1 },
  { l: 2, q: "What was the first word of the Quran revealed to the Prophet (PBUH)?", a: ["Allahu", "Subhanan", "Iqra", "Bismillah"], correct: 2 },
  { l: 2, q: "How many times is 'Isa (AS)' mentioned in the Quran?", a: ["25", "15", "5", "40"], correct: 0 },
  // Level 3 (Advance)
  { l: 3, q: "In which battle were the most Huffaz (memorizers) of the Quran martyred?", a: ["Battle of Badr", "Battle of Uhud", "Battle of Yamama", "Battle of Khandaq"], correct: 2 },
  { l: 3, q: "Who was the companion who translated the Quran for the King of Abyssinia?", a: ["Ja'far ibn Abi Talib", "Mus'ab ibn Umayr", "Bilal ibn Rabah", "Abdullah ibn Masud"], correct: 0 },
  { l: 3, q: "Which Surah does not start with 'Bismillah'?", a: ["Surah An-Naml", "Surah At-Tawbah", "Surah At-Tin", "Surah Al-Alaq"], correct: 1 }
];

const NAMES_MATCH = [
  // Easy
  { l: 1, name: "Ar-Rahman", meaning: "The Entirely Merciful" },
  { l: 1, name: "Al-Malik", meaning: "The Absolute Ruler" },
  { l: 1, name: "Al-Quddus", meaning: "The Pure One" },
  // Medium
  { l: 2, name: "Al-Mutakabbir", meaning: "The Supreme" },
  { l: 2, name: "Al-Khaliq", meaning: "The Creator" },
  { l: 2, name: "Al-Bari", meaning: "The Evolver" },
  // Hard
  { l: 3, name: "Al-Mu'min", meaning: "The Infuser of Faith" },
  { l: 3, name: "Al-Muhaymin", meaning: "The Guardian" },
  { l: 3, name: "Al-Aziz", meaning: "The All Mighty" }
];

const PROPHETS_ORDER = ["Adam (AS)", "Nuh (AS)", "Ibrahim (AS)", "Musa (AS)", "Isa (AS)", "Muhammad (PBUH)"];

const PILLARS_CATEGORIES = {
  Islam: ["Shahada", "Salah", "Zakat", "Sawm", "Hajj"],
  Iman: ["Allah", "Angels", "Books", "Prophets", "Judgment", "Qadar"]
};

export default function GamesView({ addHasanat }: { addHasanat: (amount: number) => void }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [gameLevel, setGameLevel] = useState(1);
  const [score, setScore] = useState(0);

  // General State
  const [currentStep, setCurrentStep] = useState(0);
  const [lives, setLives] = useState(3);

  // Filtered Data
  const currentTriviaPool = TRIVIA_QUESTIONS.filter(q => q.l === gameLevel);
  const currentNamesPool = NAMES_MATCH.filter(n => n.l === gameLevel);

  const finishGame = (earnedPoints: number) => {
    setScore(earnedPoints);
    addHasanat(earnedPoints);
    setGameState('result');
  };

  const failGame = () => {
    setGameState('result');
    setScore(0);
  };

  // --- COMPONENT: TRIVIA ---
  const TriviaGame = () => (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-rose-500">
           {Array.from({ length: lives }).map((_, i) => <Heart key={i} size={20} fill="currentColor" />)}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Level {gameLevel} • Question {currentStep + 1} / {currentTriviaPool.length}
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-3xl font-black text-white text-center leading-tight">{currentTriviaPool[currentStep].q}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {currentTriviaPool[currentStep].a.map((opt, i) => (
             <button 
               key={i}
               onClick={() => {
                 if (i === currentTriviaPool[currentStep].correct) {
                   if (currentStep + 1 < currentTriviaPool.length) {
                     setCurrentStep(currentStep + 1);
                   } else {
                     // Next Level or Finish
                     if (gameLevel < 3) {
                       setGameLevel(gameLevel + 1);
                       setCurrentStep(0);
                     } else {
                       finishGame(200 * gameLevel);
                     }
                   }
                 } else {
                   if (lives <= 1) failGame();
                   else setLives(lives - 1);
                 }
               }}
               className="p-6 rounded-3xl bg-brand-sidebar border border-white/10 hover:border-brand-primary hover:bg-brand-primary/5 text-white font-bold transition-all text-left flex justify-between items-center group"
             >
                <span>{opt}</span>
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
           ))}
        </div>
      </div>
    </div>
  );

  // --- COMPONENT: MEMORY ---
  const MemoryGame = () => {
    const letters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح'];
    const [cards, setCards] = useState(() => 
      [...letters, ...letters].sort(() => Math.random() - 0.5).map((v, i) => ({ id: i, val: v, flipped: false, solved: false }))
    );
    const [flipped, setFlipped] = useState<number[]>([]);

    const handleFlip = (id: number) => {
      if (flipped.length === 2 || cards[id].flipped || cards[id].solved) return;
      const nextCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
      setCards(nextCards);
      const nextFlipped = [...flipped, id];
      setFlipped(nextFlipped);

      if (nextFlipped.length === 2) {
        const [i1, i2] = nextFlipped;
        if (nextCards[i1].val === nextCards[i2].val) {
          setTimeout(() => {
            const solved = nextCards.map(c => (c.id === i1 || c.id === i2) ? { ...c, solved: true, flipped: false } : c);
            setCards(solved);
            setFlipped([]);
            if (solved.every(s => s.solved)) finishGame(100);
          }, 600);
        } else {
          setTimeout(() => {
            setCards(nextCards.map(c => (c.id === i1 || c.id === i2) ? { ...c, flipped: false } : c));
            setFlipped([]);
          }, 1000);
        }
      }
    };

    return (
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        {cards.map(c => (
          <button key={c.id} onClick={() => handleFlip(c.id)} className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 ${c.flipped || c.solved ? 'bg-brand-primary text-brand-depth' : 'bg-brand-sidebar border border-white/10'}`}>
            {c.flipped || c.solved ? <span className="arabic-text">{c.val}</span> : <Brain size={24} className="text-slate-700" />}
          </button>
        ))}
      </div>
    );
  };

  // --- COMPONENT: NAMES ---
  const NamesGame = () => (
    <div className="max-w-2xl mx-auto space-y-10">
      <div className="text-center space-y-2">
         <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Level {gameLevel} • Meaning</h3>
         <p className="text-4xl font-black text-white">{currentNamesPool[currentStep].meaning}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
         {currentNamesPool.map((n, i) => (
           <button 
             key={i}
             onClick={() => {
               if (i === currentStep) {
                 if (currentStep + 1 < currentNamesPool.length) {
                   setCurrentStep(currentStep + 1);
                 } else {
                   if (gameLevel < 3) {
                     setGameLevel(gameLevel + 1);
                     setCurrentStep(0);
                   } else {
                     finishGame(300 * gameLevel);
                   }
                 }
               } else {
                 if (lives <= 1) failGame();
                 else setLives(lives - 1);
               }
             }}
             className="p-8 rounded-[2rem] bg-brand-sidebar border border-white/10 hover:border-brand-primary text-2xl font-black transition-all"
           >
              <span className="arabic-text text-3xl mb-2 block">{n.name}</span>
           </button>
         ))}
      </div>
    </div>
  );

  // --- COMPONENT: TIMELINE ---
  const TimelineGame = () => {
    const [items, setItems] = useState(() => [...PROPHETS_ORDER].sort(() => Math.random() - 0.5));
    return (
      <div className="max-w-md mx-auto space-y-10">
        <h3 className="text-center font-bold text-slate-400">Drag to arrange in historical order</h3>
        <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
          {items.map(item => (
            <Reorder.Item key={item} value={item} className="p-4 bg-brand-sidebar border border-white/5 rounded-2xl cursor-grab active:cursor-grabbing text-white font-bold flex justify-between">
              {item} <History size={16} className="opacity-20" />
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <button onClick={() => JSON.stringify(items) === JSON.stringify(PROPHETS_ORDER) ? finishGame(150) : null} className="w-full bg-brand-primary text-brand-depth font-black py-4 rounded-2xl shadow-xl">Verify Order</button>
      </div>
    );
  };

  // --- COMPONENT: PILLARS ---
  const PillarsGame = () => {
    const [pool, setPool] = useState(() => [...PILLARS_CATEGORIES.Islam, ...PILLARS_CATEGORIES.Iman].sort(() => Math.random() - 0.5));
    const [islam, setIslam] = useState<string[]>([]);
    const [iman, setIman] = useState<string[]>([]);

    const move = (item: string, cat: 'islam' | 'iman') => {
      const isCorrect = cat === 'islam' ? PILLARS_CATEGORIES.Islam.includes(item) : PILLARS_CATEGORIES.Iman.includes(item);
      if (isCorrect) {
        if (cat === 'islam') setIslam([...islam, item]); else setIman([...iman, item]);
        const nextPool = pool.filter(p => p !== item);
        setPool(nextPool);
        if (nextPool.length === 0) finishGame(100);
      } else {
        if (lives <= 1) failGame(); else setLives(lives - 1);
      }
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap justify-center gap-2">
           {pool.map(p => (
             <div key={p} className="bg-brand-sidebar p-3 rounded-xl border border-white/10 flex items-center gap-3">
                <button onClick={() => move(p, 'islam')} className="p-1 hover:text-brand-primary"><ChevronRight className="rotate-180" /></button>
                <span className="text-white font-bold">{p}</span>
                <button onClick={() => move(p, 'iman')} className="p-1 hover:text-brand-primary"><ChevronRight /></button>
             </div>
           ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="glass-panel p-6 rounded-3xl border-brand-primary/10">
              <h4 className="text-[10px] font-black uppercase text-center mb-4 text-brand-primary">Islam</h4>
              <div className="space-y-2">{islam.map(i => <div key={i} className="text-xs text-center font-bold text-white/50">{i}</div>)}</div>
           </div>
           <div className="glass-panel p-6 rounded-3xl border-white/5">
              <h4 className="text-[10px] font-black uppercase text-center mb-4 text-blue-400">Iman</h4>
              <div className="space-y-2">{iman.map(i => <div key={i} className="text-xs text-center font-bold text-white/50">{i}</div>)}</div>
           </div>
        </div>
      </div>
    );
  };

  if (gameState === 'playing') {
    return (
      <div className="glass-panel p-10 md:p-16 rounded-[3.5rem] border-white/5 min-h-[500px]">
         <div className="flex justify-between items-center mb-12">
            <h3 className="text-2xl font-black text-white">{GAMES.find(g => g.id === selectedGame)?.title}</h3>
            <button onClick={() => setGameState('lobby')}><XCircle size={28} className="text-slate-600 hover:text-white" /></button>
         </div>
         {selectedGame === 'quiz' && <TriviaGame />}
         {selectedGame === 'memory' && <MemoryGame />}
         {selectedGame === 'names' && <NamesGame />}
         {selectedGame === 'timeline' && <TimelineGame />}
         {selectedGame === 'pillars' && <PillarsGame />}
         {selectedGame === 'seerah' && <div className="text-center py-20"><RefreshCw size={48} className="animate-spin mb-4 mx-auto text-brand-primary" /><p className="text-white font-black">Level Generation...</p><button onClick={() => finishGame(250)} className="mt-8 bg-brand-primary text-brand-depth px-8 py-3 rounded-xl font-black uppercase text-[10px]">Preview Finish</button></div>}
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${score > 0 ? 'bg-brand-primary/20 text-brand-primary' : 'bg-rose-500/20 text-rose-500'}`}>
           {score > 0 ? <Trophy size={64} className="animate-bounce" /> : <XCircle size={64} />}
        </motion.div>
        <div className="space-y-4">
           <h2 className="text-5xl font-black text-white">{score > 0 ? 'MASHALLAH!' : 'TRY AGAIN'}</h2>
           <p className="text-xl text-brand-primary font-bold">{score > 0 ? `Earned ${score} Hasanat` : 'Keep studying!'}</p>
        </div>
        <button onClick={() => setGameState('lobby')} className="bg-brand-primary text-brand-depth px-12 py-4 rounded-[2rem] font-black uppercase text-xs">Continue</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {GAMES.map((game, idx) => (
        <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`group p-8 rounded-[3rem] border border-white/5 bg-gradient-to-br ${game.color} backdrop-blur-md shadow-2xl relative overflow-hidden h-full flex flex-col justify-between`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start">
               <div className="w-16 h-16 rounded-2xl bg-brand-depth border border-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform"><game.icon className="w-8 h-8 text-brand-primary" /></div>
               <div className="text-right">
                  <div className="px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white mb-2">{game.difficulty}</div>
                  <div className="flex items-center gap-1 text-brand-primary text-[10px] font-black"><Sparkles size={10} /> {game.reward} pts</div>
               </div>
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-black text-white">{game.title}</h3>
               <p className="text-sm text-slate-400 font-medium">{game.desc}</p>
            </div>
          </div>
          <button onClick={() => { setSelectedGame(game.id); setGameState('playing'); setCurrentStep(0); setLives(3); setGameLevel(1); }} className="mt-8 w-full bg-brand-primary text-brand-depth font-black text-[10px] uppercase py-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">Enter Arena</button>
        </motion.div>
      ))}
    </div>
  );
}
