import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Filter,
  MessageCircle,
  Heart
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { notificationService } from '../services/notificationService.ts';

interface UmmahUser {
  uid: string;
  displayName: string;
  photoURL: string;
  hasanat: number;
  lastSeen?: any;
  isPremium?: boolean;
}

interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function UmmahHubView() {
  const [users, setUsers] = useState<UmmahUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Record<string, string>>({}); // toId -> status
  const [filter, setFilter] = useState<'all' | 'premium' | 'active'>('all');

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Listen to sent requests to show status
    const q = query(
      collection(db, 'friend_requests'),
      where('fromId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapping: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        mapping[data.toId] = data.status;
      });
      setSentRequests(mapping);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // In a real app we'd use a server-side search or Algolia
        // For now, we fetch latest users and filter client-side if query is small
        const q = query(
          collection(db, 'users'),
          orderBy('hasanat', 'desc'),
          limit(50)
        );

        const snap = await getDocs(q);
        const userList = snap.docs
          .map(doc => ({ ...doc.data() } as UmmahUser))
          .filter(u => u.uid !== currentUser?.uid);
        
        setUsers(userList);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleSendRequest = async (targetUser: UmmahUser) => {
    if (!currentUser) return;

    try {
      await addDoc(collection(db, 'friend_requests'), {
        fromId: currentUser.uid,
        fromName: currentUser.displayName || 'Sanctuary Soul',
        fromPhoto: currentUser.photoURL || '',
        toId: targetUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // No longer notifying the sender here, let the system handle it or just show status change
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friend_requests');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'premium') return matchesSearch && u.isPremium;
    return matchesSearch;
  });

  return (
    <div className="space-y-12 pb-32">
       {/* Header Section */}
       <section className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-brand-primary/20 via-brand-depth to-brand-depth border border-brand-primary/20 p-10 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="px-4 py-1.5 bg-brand-primary text-brand-depth rounded-full text-[10px] font-black uppercase tracking-widest">Global Community</span>
                   <div className="h-px w-24 bg-white/10" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-5xl font-black text-white tracking-tight leading-none">Ummah<br/><span className="text-brand-primary">Hub</span></h2>
                   <p className="text-slate-400 font-medium text-lg max-w-sm">Discover and connect with brothers and sisters on the same spiritual journey.</p>
                </div>
             </div>

             <div className="flex flex-col gap-4 w-full md:w-auto">
                <div className="relative group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" size={20} />
                   <input 
                     type="text" 
                     placeholder="Search for a heart..."
                     className="w-full md:w-96 bg-white/5 border border-white/10 rounded-[2rem] pl-14 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all text-slate-200 placeholder:text-slate-600"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                   {['all', 'premium'].map((f) => (
                     <button
                       key={f}
                       onClick={() => setFilter(f as any)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-primary text-brand-depth' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
             </div>
          </div>
       </section>

       {/* Users Grid */}
       <section className="space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Filter size={18} className="text-brand-primary" />
                Hearts Reaching Out
             </h3>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredUsers.length} Users Found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[2.5rem]" />
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <AnimatePresence mode="popLayout">
                 {filteredUsers.map((user, idx) => (
                   <motion.div
                     key={user.uid}
                     layout
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     transition={{ delay: idx * 0.05 }}
                     className="group relative bg-brand-sidebar/40 border border-white/5 rounded-[2.5rem] p-8 hover:bg-brand-sidebar/80 hover:border-brand-primary/30 transition-all duration-500 overflow-hidden"
                   >
                     {/* Decorative background circle */}
                     <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/5 rounded-full blur-[40px] group-hover:bg-brand-primary/10 transition-colors" />
                     
                     <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between">
                           <div className="relative">
                              <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-2 border-white/5 group-hover:border-brand-primary/30 transition-all bg-brand-depth shadow-xl">
                                 <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="" className="w-full h-full object-cover" />
                              </div>
                              {user.isPremium && (
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-brand-depth shadow-lg border-2 border-brand-sidebar">
                                   <ShieldCheck size={14} />
                                </div>
                              )}
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Hasanat</p>
                              <p className="text-2xl font-black text-white leading-none">{user.hasanat.toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="space-y-1">
                           <h4 className="text-xl font-black text-white tracking-tight line-clamp-1">{user.displayName}</h4>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              <Sparkles size={12} className="text-brand-primary/60" />
                              <span>Level {Math.floor(user.hasanat / 500) + 1} Seeker</span>
                           </div>
                        </div>

                        <div className="pt-2">
                           {sentRequests[user.uid] ? (
                             <div className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                               sentRequests[user.uid] === 'pending' 
                                 ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' 
                                 : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                             }`}>
                                {sentRequests[user.uid] === 'pending' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                                {sentRequests[user.uid] === 'pending' ? 'Request Sent' : 'Sanctuary Connected'}
                             </div>
                           ) : (
                             <button 
                               onClick={() => handleSendRequest(user)}
                               className="w-full py-4 bg-white/5 hover:bg-brand-primary hover:text-brand-depth text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                             >
                                <UserPlus size={16} className="text-brand-primary group-hover/btn:text-brand-depth transition-colors" />
                                Friendly Request
                             </button>
                           )}
                        </div>
                     </div>

                     {/* Stats Overlay on Hover */}
                     <div className="absolute bottom-4 right-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                        <div className="flex items-center gap-1.5 text-pink-500">
                           <Heart size={12} fill="currentColor" />
                           <span className="text-[10px] font-black">2.4k</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-primary">
                           <MessageCircle size={12} fill="currentColor" />
                           <span className="text-[10px] font-black">1.1k</span>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                  <Users size={48} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-xl font-black text-white">Heart not found</h4>
                  <p className="text-slate-500 max-w-xs font-medium">Try searching for a different name or browse the entire community.</p>
               </div>
               <button 
                 onClick={() => { setSearchQuery(''); setFilter('all'); }}
                 className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
               >
                 Clear Search Filters
               </button>
            </div>
          )}
       </section>

       {/* Community Insights Banner */}
       <section className="relative p-10 md:p-16 rounded-[4rem] bg-brand-sidebar border border-white/5 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
             <div className="flex-1 space-y-6">
                <h3 className="text-4xl font-black text-white tracking-tight">The Power of<br/><span className="text-brand-primary">Collective Wisdom</span></h3>
                <p className="text-slate-400 font-medium leading-relaxed max-w-lg">Every heart you connect with in the Ummah Hub expands your spiritual horizon. Share knowledge, track goals together, and uplift the global community.</p>
                <div className="flex items-center gap-8">
                   <div className="space-y-1">
                      <p className="text-2xl font-black text-white">4.2M+</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Members</p>
                   </div>
                   <div className="w-px h-10 bg-white/10" />
                   <div className="space-y-1">
                      <p className="text-2xl font-black text-white">128k</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Today</p>
                   </div>
                </div>
             </div>
             <div className="w-full lg:w-96 grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                     <Users size={32} className="text-brand-primary/20" />
                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Ummah${i}`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  </div>
                ))}
             </div>
          </div>
       </section>
    </div>
  );
}
