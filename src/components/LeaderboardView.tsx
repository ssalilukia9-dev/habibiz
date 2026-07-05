import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  where
} from 'firebase/firestore';
import { 
  Trophy, 
  Crown, 
  Medal, 
  TrendingUp, 
  Star, 
  User as UserIcon,
  Flame,
  Award,
  Search,
  ArrowRight,
  Sparkles,
  Terminal,
  Copy,
  Check,
  Lock,
  BookOpen,
  MessageSquare,
  Bot,
  ShoppingBag,
  Database,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/utils';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  hasanat: number;
  rank?: string;
  isPremium?: boolean;
}

export default function LeaderboardView({ 
  searchQuery, 
  setSearchQuery, 
  currentUser, 
  currentHasanat 
}: { 
  searchQuery: string, 
  setSearchQuery: (q: string) => void,
  currentUser?: any,
  currentHasanat?: number
}) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'kings'>('all');
  
  // Find current user's rank in the fetched list
  const currentUserRank = users.findIndex(u => u.uid === currentUser?.uid) + 1;
  const isUserInTopList = currentUserRank > 0;

  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_')) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const q = query(
      collection(db, 'users'),
      orderBy('hasanat', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: LeaderboardUser[] = [];
      snapshot.forEach((doc) => {
        usersData.push({ ...doc.data() as LeaderboardUser, uid: doc.id });
      });
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const habibiKing = users[0];
  const podium = users.slice(0, 3);
  const others = users.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32">
      <header className="relative py-8 md:py-12 px-6 md:px-8 overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-brand-sidebar border border-white/5 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 md:w-16 md:h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/20 mb-2"
          >
            <Trophy size={28} className="md:w-8 md:h-8" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none font-sans">
            Hall of <span className="text-brand-primary">Souls</span>
          </h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[9px] md:text-[10px] font-sans">The Digital Sanctuary Leaders & Engineering Specs</p>
        </div>
      </header>

      {/* Leaderboard Area */}
      {/* Top Seeker Spotlight */}
          {habibiKing && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative group w-full"
            >
              <div className="absolute inset-0 bg-brand-primary/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-brand-sidebar via-brand-sidebar to-brand-primary/10 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 border-brand-primary/30 shadow-2xl overflow-hidden">
                
                {/* Visual Flair */}
                <div className="absolute top-4 right-8 opacity-10 md:opacity-20 rotate-12 pointer-events-none">
                   <Crown size={120} className="text-brand-primary w-24 h-24 md:w-48 md:h-48" />
                </div>

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 relative z-10">
                  <div className="relative shrink-0">
                    <div className="w-28 h-28 md:w-48 md:h-48 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-2 md:border-4 border-brand-primary shadow-2xl relative z-10 bg-slate-800">
                      {habibiKing.photoURL ? (
                        <img src={habibiKing.photoURL} alt={habibiKing.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <UserIcon size={40} />
                        </div>
                      )}
                    </div>
                    <motion.div 
                       animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                       transition={{ duration: 4, repeat: Infinity }}
                       className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-12 h-12 md:w-16 md:h-16 bg-yellow-400 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-depth shadow-xl z-20"
                    >
                       <Crown size={24} className="md:w-8 md:h-8" />
                    </motion.div>
                  </div>

                  <div className="text-center md:text-left space-y-4 flex-1 w-full">
                    <div className="space-y-1">
                       <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4">
                          <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight uppercase italic decoration-brand-primary decoration-2 md:decoration-4 underline underline-offset-4 md:underline-offset-8">
                           Habibi King
                          </h2>
                          {habibiKing.isPremium && (
                            <div className="px-3 py-1 bg-brand-primary rounded-lg text-brand-depth text-[9px] md:text-[10px] font-black uppercase">Guardian</div>
                          )}
                       </div>
                       <p className="text-lg md:text-2xl text-brand-primary font-bold">{habibiKing.displayName || 'Anonymous Warrior'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pt-2 md:pt-4 w-full">
                       <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Spirit Points</p>
                          <p className="text-lg md:text-2xl font-black text-white leading-none">{habibiKing.hasanat.toLocaleString()}</p>
                       </div>
                       <div className="bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5">
                          <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Title</p>
                          <p className="text-[10px] md:text-xs font-black text-brand-primary uppercase italic tracking-tighter leading-none mt-1">Sultan of Spirit</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard Table */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
               <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-3 font-sans">
                 <Medal className="text-brand-primary" /> The Royal List
               </h3>
               <div className="relative w-full md:w-64">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                 <input 
                   type="text"
                   placeholder="Search Seekers..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-brand-primary/50 transition-all font-sans"
                 />
               </div>
            </div>

            <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 font-sans">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Seeker</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Points</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredUsers.map((user, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={user.uid}
                        className={`group hover:bg-white/5 transition-all ${idx === 0 ? 'bg-brand-primary/5' : ''}`}
                      >
                        <td className="px-8 py-6">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black italic border ${
                             idx === 0 ? 'bg-yellow-400 text-brand-depth border-yellow-500' :
                             idx === 1 ? 'bg-slate-300 text-slate-900 border-slate-400' :
                             idx === 2 ? 'bg-orange-400 text-slate-900 border-orange-500' :
                             'bg-white/5 text-slate-500 border-white/10'
                           }`}>
                             {idx + 1}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border-2 border-white/5 shrink-0 group-hover:border-brand-primary transition-all">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <UserIcon size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                               <p className={`text-sm font-bold tracking-tight ${idx === 0 ? 'text-brand-primary' : 'text-slate-200'}`}>
                                 {user.displayName || 'Anonymous'}
                                 {idx === 0 && <span className="ml-2 text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 bg-brand-primary rounded-md text-brand-depth">Habibi King of the Month</span>}
                               </p>
                               <p className="text-[10px] text-slate-500 font-medium">{user.isPremium ? 'Premium Voyager' : 'Sanctuary Seeker'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-black text-white font-mono">{user.hasanat.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-1">
                              {user.hasanat > 10000 && <Sparkles size={14} className="text-yellow-400" />}
                              {user.hasanat > 5000 && <Star size={14} className="text-brand-primary" />}
                              {user.isPremium && <Award size={14} className="text-brand-primary" />}
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {isLoading && (
                <div className="p-20 flex flex-col items-center justify-center space-y-4 font-sans">
                   <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Searching the scrolls...</p>
                </div>
              )}

              {!isLoading && filteredUsers.length === 0 && (
                <div className="p-20 text-center space-y-4 font-sans">
                   <p className="text-slate-500 font-medium">No souls found matching your search.</p>
                   <button onClick={() => setSearchQuery('')} className="text-brand-primary text-xs font-bold uppercase tracking-widest underline underline-offset-4">Clear Search</button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-brand-primary/10 p-10 rounded-[3rem] border border-brand-primary/20 text-center space-y-6">
             <h4 className="text-2xl font-black text-white italic uppercase tracking-tight font-sans">Ascend the Ranks</h4>
             <p className="text-sm text-slate-400 max-w-lg mx-auto font-sans">
               Gain Hasanat by engaging with the Quran, completing Adhkar, and participating in the Sanctuary Community. The path to the top is open to all seekers of knowledge.
             </p>
             <button className="bg-brand-primary text-brand-depth px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20 font-sans">
                Learn More About Hasanat
             </button>
      </div>

      {/* Sticky User Rank Footer */}
      {!isLoading && (
        <div className="fixed bottom-24 left-0 right-0 px-6 z-40 pointer-events-none">
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="max-w-4xl mx-auto glass-panel p-4 md:p-6 rounded-[2rem] border-brand-primary/30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto bg-brand-sidebar/90 backdrop-blur-2xl flex items-center justify-between font-sans"
          >
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-depth font-black text-xs md:text-base border-2 border-brand-primary/50">
                   {isUserInTopList ? currentUserRank : '?'}
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Your Standing</p>
                   <p className="text-sm md:text-lg font-black text-white truncate max-w-[150px] md:max-w-none">{currentUser?.displayName || 'Seeking Soul'}</p>
                </div>
             </div>

             <div className="flex items-center gap-6 md:gap-10">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Points</p>
                   <p className="text-sm md:text-lg font-black text-brand-primary font-mono leading-none">{(currentHasanat || 0).toLocaleString()}</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-white/10" />
                <div className="hidden sm:block">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Next Badge</p>
                   <div className="flex items-center gap-1 text-yellow-400">
                     <Star size={14} fill="currentColor" />
                     <span className="text-[10px] font-black uppercase">Guardian</span>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
