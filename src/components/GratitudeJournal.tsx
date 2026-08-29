import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  BookOpen, 
  Plus, 
  Calendar, 
  Flame, 
  Award, 
  Trash2, 
  Volume2, 
  Copy, 
  Check, 
  Mic, 
  MicOff, 
  Send, 
  Search, 
  Filter, 
  ChevronDown, 
  Smile, 
  Sun, 
  Feather, 
  RefreshCw, 
  CheckCircle2,
  Clock,
  MessageCircle,
  Quote,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { apiFetch } from '../lib/api.ts';
import { VoiceService } from '../services/voiceService.ts';
import { notificationService } from '../services/notificationService.ts';
import { GratitudeEntry } from '../types.ts';

const CATEGORIES = [
  { id: 'faith', label: 'Faith & Iman', icon: '📖', color: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30' },
  { id: 'health', label: 'Health & Body', icon: '🤲', color: 'from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30' },
  { id: 'family', label: 'Family & Loved Ones', icon: '👨‍👩‍👧‍👦', color: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30' },
  { id: 'peace', label: 'Peace of Mind', icon: '🕊️', color: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30' },
  { id: 'rizq', label: 'Rizq & Sustenance', icon: '🍞', color: 'from-yellow-500/20 to-amber-500/10 text-yellow-300 border-yellow-500/30' },
  { id: 'nature', label: 'Nature & Creation', icon: '🌿', color: 'from-green-500/20 to-emerald-500/10 text-green-300 border-green-500/30' },
  { id: 'growth', label: 'Growth & Wisdom', icon: '💡', color: 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30' },
  { id: 'small_joys', label: 'Small Blessings', icon: '✨', color: 'from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/30' },
];

const MOODS = [
  { id: 'alhamdulillah', label: 'Alhamdulillah', emoji: '🤲' },
  { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
  { id: 'humbled', label: 'Humbled', emoji: '🌸' },
  { id: 'joyful', label: 'Joyful', emoji: '😊' },
  { id: 'relieved', label: 'Relieved', emoji: '🌿' },
  { id: 'hopeful', label: 'Hopeful', emoji: '✨' },
];

const INSPIRATIONAL_PROMPTS = [
  "What is one simple comfort you experienced today that you often take for granted?",
  "Who is someone whose presence or kind words brought warmth to your day?",
  "What difficulty did Allah ease for you recently, even in the smallest way?",
  "Which prayer, Quran verse, or quiet moment brought peace to your heart today?",
  "What sight, sound, or scent in Allah's creation caught your attention today?",
  "What is a meal, clean sip of water, or shelter you enjoyed with gratitude?",
  "What is a talent, skill, or good deed Allah enabled you to perform today?",
  "What made you smile or feel genuinely content today?"
];

interface GratitudeJournalProps {
  currentUser: any;
  addHasanat: (amount: number) => void;
  speakText: (text: string, onEnd?: () => void) => void;
}

export default function GratitudeJournal({
  currentUser,
  addHasanat,
  speakText
}: GratitudeJournalProps) {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('faith');
  const [selectedMood, setSelectedMood] = useState('alhamdulillah');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReflecting, setIsReflecting] = useState(false);
  const [aliyahReflection, setAliyahReflection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastEarnedAmount, setLastEarnedAmount] = useState(0);

  const recognitionRef = useRef<any>(null);

  // Today's date string format: YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // Check if user already logged an entry today
  const hasLoggedToday = useMemo(() => {
    return entries.some(e => e.dateStr === todayStr);
  }, [entries, todayStr]);

  // Calculate continuous day streak
  const streakCount = useMemo(() => {
    if (entries.length === 0) return 0;
    
    // Extract unique dates in sorted descending order
    const dates = Array.from(new Set(entries.map(e => e.dateStr))).sort().reverse();
    if (dates.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestDate = new Date(dates[0]);
    latestDate.setHours(0, 0, 0, 0);

    // If latest entry is neither today nor yesterday, streak is broken
    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date(latestDate);

    for (const dStr of dates) {
      const entryDate = new Date(dStr);
      entryDate.setHours(0, 0, 0, 0);

      const diffTime = expectedDate.getTime() - entryDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  // Total Hasanat earned from Gratitude Journal
  const totalHasanatFromJournal = useMemo(() => {
    return entries.reduce((acc, e) => acc + (e.hasanatAwarded || 0), 0);
  }, [entries]);

  // Setup Speech-to-text recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setContent(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start voice recognition", err);
      }
    }
  };

  // Sync entries from Firestore / LocalStorage
  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);

    const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');

    if (isLocalUser) {
      const localKey = `sanctuary_gratitude_${currentUser.uid}`;
      const loadLocalData = () => {
        const raw = localStorage.getItem(localKey);
        if (raw) {
          try {
            setEntries(JSON.parse(raw));
          } catch (e) {
            setEntries([]);
          }
        } else {
          // Pre-seed with inspirational initial entry
          const initialEntries: GratitudeEntry[] = [
            {
              id: 'init_1',
              content: 'Alhamdulillah for the gift of another morning, breath in my lungs, and safety in my home.',
              category: 'faith',
              mood: 'alhamdulillah',
              hasanatAwarded: 50,
              dateStr: todayStr,
              createdAt: new Date().toISOString(),
              aliyahReflection: 'A beautiful and humble heart. Remembering that each breath is a granted favor invites continuous peace into your day.',
              alhamdulillahCount: 1
            }
          ];
          setEntries(initialEntries);
          localStorage.setItem(localKey, JSON.stringify(initialEntries));
        }
        setIsLoading(false);
      };

      loadLocalData();
      window.addEventListener('storage', loadLocalData);
      return () => window.removeEventListener('storage', loadLocalData);
    } else {
      // Real-time Firestore sync
      const entriesRef = collection(db, `users/${currentUser.uid}/gratitude_entries`);
      const q = query(entriesRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as GratitudeEntry[];

        setEntries(items);
        setIsLoading(false);
      }, (err) => {
        console.warn("Firestore gratitude sync error:", err);
        handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/gratitude_entries`);
        // Fallback to cache/local
        const localKey = `sanctuary_gratitude_${currentUser.uid}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
          try { setEntries(JSON.parse(raw)); } catch {}
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUser, todayStr]);

  // Next inspirational prompt
  const handleCyclePrompt = () => {
    setPromptIndex(prev => (prev + 1) % INSPIRATIONAL_PROMPTS.length);
  };

  // Generate Aliyah reflection using Gemini
  const handleGenerateReflection = async () => {
    if (!content.trim()) return;
    setIsReflecting(true);
    try {
      const prompt = `You are Aliyah, a thoughtful, warm, and spiritually uplifting companion.
A user just wrote this entry in their Islamic Daily Gratitude (Shukr) Journal:
"${content.trim()}" (Category: ${selectedCategory}, Mood: ${selectedMood})

Provide a concise 1-2 sentence heartfelt, spiritually comforting reflection or brief Islamic du'a of gratitude. Keep it gentle, uplifting, and completely natural without preambles.`;

      const response = await apiFetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: 'You are Aliyah, an empathetic, warm talk pal. Provide concise, beautiful, 2-sentence reflections on gratitude.'
        })
      });

      const data = await response.json();
      if (data && data.text) {
        setAliyahReflection(data.text.trim());
      }
    } catch (e) {
      console.warn("Could not generate reflection:", e);
      setAliyahReflection('Alhamdulillah for this beautiful blessing. May Allah increase you in gratitude and tranquility.');
    } finally {
      setIsReflecting(false);
    }
  };

  // Submit new gratitude entry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const isFirstToday = !hasLoggedToday;
    const hasanatReward = isFirstToday ? 50 : 15; // +50 Hasanat for daily streak entry, +15 for extra entries

    const newEntry: Omit<GratitudeEntry, 'id'> = {
      userId: currentUser.uid,
      content: content.trim(),
      category: selectedCategory,
      mood: selectedMood,
      hasanatAwarded: hasanatReward,
      dateStr: todayStr,
      createdAt: serverTimestamp(),
      aliyahReflection: aliyahReflection.trim() || undefined,
      alhamdulillahCount: 1
    };

    const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');

    try {
      if (isLocalUser) {
        const localKey = `sanctuary_gratitude_${currentUser.uid}`;
        const raw = localStorage.getItem(localKey);
        const existing: GratitudeEntry[] = raw ? JSON.parse(raw) : [];
        const createdItem: GratitudeEntry = {
          ...newEntry,
          id: `local_grat_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        const updated = [createdItem, ...existing];
        localStorage.setItem(localKey, JSON.stringify(updated));
        setEntries(updated);
      } else {
        // Save to user subcollection
        await addDoc(collection(db, `users/${currentUser.uid}/gratitude_entries`), newEntry);
      }

      // Award Hasanat
      addHasanat(hasanatReward);
      setLastEarnedAmount(hasanatReward);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);

      // Trigger Notification
      notificationService.notify(
        '🌿 Daily Shukr Recorded',
        `Alhamdulillah! +${hasanatReward} Hasanat awarded for logging your daily gratitude.`,
        'system',
        '/companion'
      );

      // Reset Form
      setContent('');
      setAliyahReflection('');
    } catch (error) {
      console.error("Failed to save gratitude entry:", error);
      handleFirestoreError(error, OperationType.CREATE, `users/${currentUser.uid}/gratitude_entries`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this gratitude entry?")) return;

    const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');

    try {
      if (isLocalUser) {
        const localKey = `sanctuary_gratitude_${currentUser.uid}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
          const existing: GratitudeEntry[] = JSON.parse(raw);
          const updated = existing.filter(item => item.id !== id);
          localStorage.setItem(localKey, JSON.stringify(updated));
          setEntries(updated);
        }
      } else {
        await deleteDoc(doc(db, `users/${currentUser.uid}/gratitude_entries`, id));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${currentUser.uid}/gratitude_entries/${id}`);
    }
  };

  // Increment Alhamdulillah counter on an entry
  const handleSayAlhamdulillah = async (entry: GratitudeEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    addHasanat(5); // +5 Hasanat for saying Alhamdulillah
    
    const isLocalUser = currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_');

    try {
      if (isLocalUser) {
        const localKey = `sanctuary_gratitude_${currentUser.uid}`;
        const updated = entries.map(item => {
          if (item.id === entry.id) {
            return { ...item, alhamdulillahCount: (item.alhamdulillahCount || 0) + 1 };
          }
          return item;
        });
        localStorage.setItem(localKey, JSON.stringify(updated));
        setEntries(updated);
      } else {
        const docRef = doc(db, `users/${currentUser.uid}/gratitude_entries`, entry.id);
        await updateDoc(docRef, {
          alhamdulillahCount: increment(1)
        });
      }
    } catch (e) {
      console.warn("Could not increment Alhamdulillah count", e);
    }
  };

  // Copy entry to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = !searchQuery.trim() || 
        e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.aliyahReflection && e.aliyahReflection.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, filterCategory]);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto scrollbar-hide space-y-6">
      
      {/* Quranic Verse Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-emerald-950/40 border border-emerald-500/20 p-5 md:p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-emerald-400">
          <Quote size={120} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Heart size={11} className="fill-emerald-400/30 text-emerald-300" />
              <span>Sacred Shukr (Gratitude)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400/70 font-semibold">Surah Ibrahim 14:7</span>
          </div>

          <p className="text-sm md:text-base font-arabic text-emerald-100 font-bold leading-relaxed text-right md:text-left">
            وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ
          </p>

          <p className="text-xs md:text-sm text-emerald-200/90 font-medium italic">
            "And [remember] when your Lord proclaimed: 'If you are grateful, I will surely increase you [in favor]...'"
          </p>
        </div>
      </div>

      {/* Streak & Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Streak Card */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow">
            <Flame size={20} className={streakCount > 0 ? "animate-pulse" : ""} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-black text-white font-mono">{streakCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-tight">Shukr Streak</p>
          </div>
        </div>

        {/* Total Blessings Logged */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-black text-white font-mono">{entries.length}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-tight">Blessings Logged</p>
          </div>
        </div>

        {/* Total Hasanat Earned */}
        <div className="glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow">
            <Award size={20} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-xl font-black text-amber-300 font-mono">+{totalHasanatFromJournal}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-tight">Hasanat Earned</p>
          </div>
        </div>

        {/* Today's Status */}
        <div className={`glass-panel p-4 rounded-2xl border flex items-center gap-3 ${hasLoggedToday ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow ${hasLoggedToday ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
            {hasLoggedToday ? <CheckCircle2 size={20} /> : <Clock size={20} />}
          </div>
          <div>
            <p className={`text-xs font-black uppercase tracking-wider ${hasLoggedToday ? 'text-emerald-300' : 'text-amber-300'}`}>
              {hasLoggedToday ? 'Completed' : 'Pending'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold tracking-tight">
              {hasLoggedToday ? 'Today Logged' : 'Log & Earn +50'}
            </p>
          </div>
        </div>
      </div>

      {/* Celebration Toast when logging */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-400/40 flex items-center justify-between shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 text-lg font-black animate-bounce">
                🌟
              </div>
              <div>
                <p className="text-xs md:text-sm font-black text-amber-200">
                  SubhanAllah! Gratitude Recorded (+{lastEarnedAmount} Hasanat)
                </p>
                <p className="text-[11px] text-slate-300">
                  Your daily Shukr has been added to your spiritual scales and preserved in your Sanctuary.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-400/15 px-3 py-1.5 rounded-full border border-amber-400/30">
              <Sparkles size={14} />
              <span>+{lastEarnedAmount} Hasanat</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Gratitude Entry Form */}
      <div className="glass-panel rounded-3xl p-5 md:p-7 border-white/10 shadow-2xl relative overflow-hidden bg-brand-sidebar/70">
        <div className="space-y-4">
          
          {/* Prompt Header & Prompt Cycle Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/15 border border-brand-primary/30 flex items-center justify-center text-brand-primary">
                <Feather size={15} />
              </div>
              <h3 className="text-sm font-black text-white tracking-tight">
                Log Today's Blessing
              </h3>
              {!hasLoggedToday && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[9px] font-black uppercase tracking-wider">
                  +50 Hasanat Reward
                </span>
              )}
            </div>

            {/* Prompt Inspiration Pill */}
            <button
              type="button"
              onClick={handleCyclePrompt}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer w-fit"
            >
              <RefreshCw size={12} className="text-brand-primary" />
              <span>Inspire Me: <span className="text-slate-400 font-normal">"{INSPIRATIONAL_PROMPTS[promptIndex].slice(0, 36)}..."</span></span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection Chips */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Blessing Domain
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => {
                  const isSelected = selectedCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected 
                          ? `bg-gradient-to-r ${c.color} shadow-md scale-105` 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{c.icon}</span>
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Text Input Area */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={INSPIRATIONAL_PROMPTS[promptIndex]}
                rows={3}
                className="w-full bg-brand-depth/70 border border-white/10 rounded-2xl p-4 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all resize-none shadow-inner leading-relaxed"
              />

              {/* Speech-to-text button in corner */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' 
                      : 'bg-white/10 border-white/10 text-slate-400 hover:text-white hover:bg-white/15'
                  }`}
                  title={isListening ? "Listening... (Tap to stop)" : "Dictate blessing with voice"}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              </div>
            </div>

            {/* Mood / Heart Resonance Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Heart State:
                </span>
                {MOODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                      selectedMood === m.id 
                        ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-primary' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Optional Aliyah AI Reflection Button */}
              <button
                type="button"
                onClick={handleGenerateReflection}
                disabled={!content.trim() || isReflecting}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                title="Ask Aliyah to give a warm spiritual reflection or du'a on your blessing"
              >
                {isReflecting ? <Loader2 size={13} className="animate-spin text-purple-300" /> : <Sparkles size={13} />}
                <span>Reflect with Aliyah</span>
              </button>
            </div>

            {/* Display Generated Aliyah Reflection Preview if available */}
            {aliyahReflection && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3 text-xs text-purple-200"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                  <Sparkles size={13} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">Aliyah's Spiritual Reflection</span>
                    <button 
                      type="button" 
                      onClick={() => setAliyahReflection('')}
                      className="text-purple-400 hover:text-white text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="italic leading-relaxed">{aliyahReflection}</p>
                </div>
              </motion.div>
            )}

            {/* Submit Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-[11px] text-slate-400 font-medium">
                {hasLoggedToday ? "You've already logged today (+15 Hasanat for additional blessings)" : "🌟 Logging earns you +50 Hasanat and advances your streak"}
              </p>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-primary via-emerald-400 to-teal-400 text-brand-depth font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/25 disabled:opacity-40 disabled:scale-100 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    <span>Save Blessing & Earn Hasanat</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* History Section Header & Search/Filters */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-brand-primary" />
            <h3 className="text-base font-black text-white tracking-tight">
              My Gratitude Archive
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {entries.length} Entries
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blessings..."
                className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-primary/50"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-primary/50 cursor-pointer"
            >
              <option value="all" className="bg-brand-depth text-white">All Domains</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id} className="bg-brand-depth text-white">
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entries List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-primary" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading your blessings...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-white/10 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
              <Heart size={24} />
            </div>
            <h4 className="text-sm font-bold text-white">No Gratitude Entries Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || filterCategory !== 'all' 
                ? "No entries match your search filter. Try clearing your search." 
                : "Begin your daily Shukr habit by recording the first blessing of your day above!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence initial={false}>
              {filteredEntries.map((entry) => {
                const categoryObj = CATEGORIES.find(c => c.id === entry.category) || CATEGORIES[0];
                const moodObj = MOODS.find(m => m.id === entry.mood) || MOODS[0];

                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-panel p-5 rounded-2xl border-white/10 hover:border-brand-primary/30 transition-all flex flex-col justify-between space-y-4 group relative bg-brand-sidebar/50"
                  >
                    {/* Card Header: Category & Date */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${categoryObj.color}`}>
                          <span>{categoryObj.icon}</span>
                          <span>{categoryObj.label}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <span>{moodObj.emoji}</span>
                          <span>{moodObj.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <Calendar size={11} />
                        <span>{entry.dateStr}</span>
                      </div>
                    </div>

                    {/* Content Text */}
                    <div className="space-y-3">
                      <p className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed">
                        "{entry.content}"
                      </p>

                      {/* Aliyah Reflection snippet if present */}
                      {entry.aliyahReflection && (
                        <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-500/20 text-[11px] text-purple-200 space-y-1">
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-purple-300">
                            <Sparkles size={10} />
                            <span>Aliyah Reflection</span>
                          </div>
                          <p className="italic leading-relaxed">
                            {entry.aliyahReflection}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Actions & Hasanat Badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      {/* Left: Alhamdulillah Counter Button */}
                      <button
                        type="button"
                        onClick={(e) => handleSayAlhamdulillah(entry, e)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] transition-all cursor-pointer"
                        title="Say Alhamdulillah (+5 Hasanat)"
                      >
                        <Heart size={12} className="fill-emerald-400/40 text-emerald-300" />
                        <span>Alhamdulillah</span>
                        <span className="font-mono bg-emerald-500/20 px-1.5 py-0.2 rounded-md text-[10px]">
                          {entry.alhamdulillahCount || 1}
                        </span>
                      </button>

                      {/* Right: Actions (Read aloud, Copy, Delete) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => speakText(`${entry.content}. ${entry.aliyahReflection || ''}`)}
                          className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          title="Read out loud"
                        >
                          <Volume2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(entry.content, entry.id)}
                          className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === entry.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteEntry(entry.id, e)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
