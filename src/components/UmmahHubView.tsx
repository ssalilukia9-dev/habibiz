import { useState, useEffect, useRef } from 'react';
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
  Heart,
  Mic,
  UserCheck,
  XCircle,
  BellRing
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  or,
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  getDocs, 
  limit, 
  orderBy,
  doc,
  setDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import { notificationService } from '../services/notificationService.ts';

interface UmmahUser {
  uid: string;
  displayName: string;
  email?: string;
  photoURL: string;
  hasanat: number;
  lastSeen?: any;
  isPremium?: boolean;
}

interface FriendRequest {
  id: string;
  fromId: string;
  fromName?: string;
  fromPhoto?: string;
  fromEmail?: string;
  toId: string;
  toName?: string;
  toEmail?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}

export default function UmmahHubView({ 
  searchQuery, 
  setSearchQuery, 
  addHasanat,
  isPremium,
  onShowPremium
}: { 
  searchQuery: string, 
  setSearchQuery: (q: string) => void, 
  addHasanat?: (amount: number) => void,
  isPremium: boolean,
  onShowPremium: () => void
}) {
  const [users, setUsers] = useState<UmmahUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Record<string, string>>({}); // targetUid -> 'pending' | 'incoming' | 'accepted'
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'premium' | 'active'>('all');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [setSearchQuery]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const currentUser = auth.currentUser;

  // Real-time listener for both sent and received friend requests
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) {
      const uid = currentUser.uid;
      const savedReceived = localStorage.getItem(`sanctuary_received_reqs_${uid}`);
      const savedSent = localStorage.getItem(`sanctuary_sent_reqs_${uid}`);
      const savedFriends = localStorage.getItem(`sanctuary_friends_${uid}`);
      
      const mapping: Record<string, string> = {};
      if (savedSent) {
        try {
          JSON.parse(savedSent).forEach((id: string) => { mapping[id] = 'pending'; });
        } catch {}
      }
      if (savedFriends) {
        try {
          JSON.parse(savedFriends).forEach((id: string) => { mapping[id] = 'accepted'; });
        } catch {}
      }
      if (savedReceived) {
        try {
          const rec: FriendRequest[] = JSON.parse(savedReceived);
          setIncomingRequests(rec);
          rec.forEach(r => { mapping[r.fromId] = 'incoming'; });
        } catch {}
      }
      setSentRequests(mapping);
      return;
    }

    // Listen to all requests involving current user
    const q = query(
      collection(db, 'friend_requests'),
      or(
        where('fromId', '==', currentUser.uid),
        where('toId', '==', currentUser.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapping: Record<string, string> = {};
      const incomingList: FriendRequest[] = [];

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const reqItem: FriendRequest = {
          id: docSnap.id,
          fromId: data.fromId,
          fromName: data.fromName || 'Sanctuary Soul',
          fromPhoto: data.fromPhoto || '',
          fromEmail: data.fromEmail || '',
          toId: data.toId,
          toName: data.toName || '',
          toEmail: data.toEmail || '',
          status: data.status || 'pending',
          createdAt: data.createdAt
        };

        if (data.fromId === currentUser.uid) {
          mapping[data.toId] = data.status;
        } else if (data.toId === currentUser.uid || (currentUser.email && data.toEmail === currentUser.email)) {
          if (data.status === 'pending') {
            incomingList.push(reqItem);
            mapping[data.fromId] = 'incoming';
          } else if (data.status === 'accepted') {
            mapping[data.fromId] = 'accepted';
          }
        }
      });

      setIncomingRequests(incomingList);
      setSentRequests(mapping);
    }, (error) => {
      console.warn("Ummah friend requests stream notice:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Load real members
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) {
      setLoading(false);
      return;
    }
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'users'),
          orderBy('hasanat', 'desc'),
          limit(200)
        );

        const snap = await getDocs(q);
        const userList = snap.docs
          .map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              displayName: data.displayName || data.name || (data.email ? data.email.split('@')[0] : 'Sanctuary Member'),
              email: data.email || '',
              photoURL: data.photoURL || '',
              hasanat: Number(data.hasanat) || 0,
              lastSeen: data.lastSeen,
              isPremium: !!data.isPremium
            } as UmmahUser;
          })
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

  // Send request with full payload for receiver visibility
  const handleSendRequest = async (targetUser: UmmahUser) => {
    if (!currentUser) return;

    try {
      const payload = {
        fromId: currentUser.uid,
        fromEmail: currentUser.email || '',
        fromName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Sanctuary Soul'),
        fromPhoto: currentUser.photoURL || '',
        toId: targetUser.uid,
        toName: targetUser.displayName,
        toEmail: targetUser.email || '',
        status: 'pending',
        createdAt: serverTimestamp()
      };

      if (!currentUser.uid.startsWith('local_') && !currentUser.uid.startsWith('rest_')) {
        await addDoc(collection(db, 'friend_requests'), payload);
      } else {
        const uid = currentUser.uid;
        const savedSent = localStorage.getItem(`sanctuary_sent_reqs_${uid}`);
        const currentList = savedSent ? JSON.parse(savedSent) : [];
        const nextList = Array.from(new Set([...currentList, targetUser.uid]));
        localStorage.setItem(`sanctuary_sent_reqs_${uid}`, JSON.stringify(nextList));
        setSentRequests(prev => ({ ...prev, [targetUser.uid]: 'pending' }));
      }

      if (addHasanat) addHasanat(25);
      notificationService.notify("Request Sent", `Friend request delivered to ${targetUser.displayName}.`, 'community');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friend_requests');
    }
  };

  // Cancel sent request
  const handleCancelSentRequest = async (targetId: string) => {
    if (!currentUser) return;
    try {
      if (!currentUser.uid.startsWith('local_')) {
        const q = query(
          collection(db, 'friend_requests'),
          where('fromId', '==', currentUser.uid),
          where('toId', '==', targetId),
          where('status', '==', 'pending')
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await deleteDoc(d.ref);
        }
      }
      setSentRequests(prev => {
        const copy = { ...prev };
        delete copy[targetId];
        return copy;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'friend_requests');
    }
  };

  // Accept incoming friend request & establish instant direct chat room
  const handleAcceptRequest = async (req: FriendRequest) => {
    if (!currentUser) return;

    try {
      if (req.id && !req.id.startsWith('req_') && !currentUser.uid.startsWith('local_')) {
        await updateDoc(doc(db, 'friend_requests', req.id), {
          status: 'accepted',
          updatedAt: serverTimestamp()
        });

        // Compute deterministic canonical room ID for bidirectional real-time messaging
        const sorted = [currentUser.uid, req.fromId].sort();
        const roomId = `direct_${sorted.join('_')}`;

        await setDoc(doc(db, 'rooms', roomId), {
          id: roomId,
          name: req.fromName || 'Direct Chat',
          type: 'private',
          isBusiness: false,
          participants: [currentUser.uid, req.fromId],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'Seeker',
            [req.fromId]: req.fromName || 'Seeker'
          },
          participantPhotos: {
            [currentUser.uid]: currentUser.photoURL || '',
            [req.fromId]: req.fromPhoto || ''
          },
          lastMessage: '🤝 Friend request accepted! Connected in sanctuary.',
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid
        }, { merge: true });
      }

      // Update local storage state
      const uid = currentUser.uid;
      const savedFriends = localStorage.getItem(`sanctuary_friends_${uid}`);
      const currentFriends = savedFriends ? JSON.parse(savedFriends) : [];
      const updatedFriends = Array.from(new Set([...currentFriends, req.fromId]));
      localStorage.setItem(`sanctuary_friends_${uid}`, JSON.stringify(updatedFriends));

      setSentRequests(prev => ({ ...prev, [req.fromId]: 'accepted' }));
      setIncomingRequests(prev => prev.filter(r => r.id !== req.id));

      if (addHasanat) addHasanat(30);
      notificationService.notify("Request Accepted", `You are now connected with ${req.fromName || 'a member'}!`, 'community');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friend_requests');
    }
  };

  // Decline incoming friend request
  const handleDeclineRequest = async (reqId: string, fromId: string) => {
    try {
      if (reqId && !reqId.startsWith('req_') && currentUser && !currentUser.uid.startsWith('local_')) {
        await deleteDoc(doc(db, 'friend_requests', reqId));
      }
      setIncomingRequests(prev => prev.filter(r => r.id !== reqId));
      setSentRequests(prev => {
        const copy = { ...prev };
        delete copy[fromId];
        return copy;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'friend_requests');
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
       <section className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-brand-primary/20 via-brand-depth to-brand-depth border border-brand-primary/20 p-8 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
             <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-4">
                   <span className="px-3 md:px-4 py-1.5 bg-brand-primary text-brand-depth rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">Global Community</span>
                   <div className="h-px w-12 md:w-24 bg-white/10" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Ummah<br/><span className="text-brand-primary">Hub</span></h2>
                   <p className="text-slate-400 font-medium text-base md:text-lg max-w-sm">Discover and connect with brothers and sisters on the same spiritual journey.</p>
                </div>
             </div>

             <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div className="relative group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" size={20} />
                   <input 
                     type="text" 
                     placeholder="Search for a heart..."
                     className="w-full lg:w-96 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] pl-14 pr-12 py-4 md:py-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all text-slate-200 placeholder:text-slate-600"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   <button 
                     onClick={toggleListening}
                     className={`absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-brand-primary bg-brand-primary/10 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                     title="Voice Search"
                   >
                     <Mic size={18} />
                   </button>
                </div>
                <div className="flex gap-2">
                   {['all', 'premium'].map((f) => (
                     <button
                       key={f}
                       onClick={() => setFilter(f as any)}
                       className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-brand-primary text-brand-depth' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                     >
                       {f}
                     </button>
                   ))}
                </div>
             </div>
          </div>
       </section>

       {/* INCOMING FRIEND REQUESTS HERO BANNER */}
       {incomingRequests.length > 0 && (
         <motion.section 
           initial={{ opacity: 0, y: -15 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-brand-primary/10 border border-brand-primary/30 rounded-[2.5rem] p-6 md:p-8 space-y-4 shadow-xl"
         >
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-brand-primary text-brand-depth flex items-center justify-center font-bold">
                 <BellRing size={20} className="animate-bounce" />
               </div>
               <div>
                 <h3 className="text-base md:text-lg font-black text-white">
                   Incoming Friend Requests ({incomingRequests.length})
                 </h3>
                 <p className="text-xs text-slate-300 font-medium">
                   Brothers and sisters wanting to connect in the Noor sanctuary
                 </p>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
             {incomingRequests.map((req) => (
               <div 
                 key={req.id}
                 className="bg-brand-sidebar/90 border border-brand-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4"
               >
                 <div className="flex items-center gap-3 min-w-0">
                   <div className="w-12 h-12 rounded-xl overflow-hidden bg-brand-depth border border-white/10 shrink-0">
                     <img 
                       src={req.fromPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromId}`} 
                       alt="" 
                       className="w-full h-full object-cover" 
                     />
                   </div>
                   <div className="min-w-0">
                     <h4 className="text-sm font-black text-white truncate">{req.fromName}</h4>
                     <p className="text-[10px] text-brand-primary font-bold">Sent you a connection request</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-1.5 shrink-0">
                   <button
                     onClick={() => handleAcceptRequest(req)}
                     className="px-3 py-2 bg-brand-primary text-brand-depth rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 transition-all flex items-center gap-1 cursor-pointer shadow"
                   >
                     <UserCheck size={13} /> Accept
                   </button>
                   <button
                     onClick={() => handleDeclineRequest(req.id, req.fromId)}
                     className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                     title="Decline"
                   >
                     <XCircle size={15} />
                   </button>
                 </div>
               </div>
             ))}
           </div>
         </motion.section>
       )}

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
                 {filteredUsers.map((user, idx) => {
                   const reqStatus = sentRequests[user.uid];

                   return (
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
                             <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black text-white tracking-tight line-clamp-1">{user.displayName}</h4>
                                {user.lastSeen && (Date.now() - (user.lastSeen?.toMillis ? user.lastSeen.toMillis() : new Date(user.lastSeen).getTime()) < 300000) && (
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                                )}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <Sparkles size={12} className="text-brand-primary/60" />
                                <span>Level {Math.floor(user.hasanat / 500) + 1} Seeker</span>
                             </div>
                          </div>

                          <div className="pt-2">
                             {reqStatus === 'incoming' ? (
                               <div className="flex gap-2">
                                 <button
                                   onClick={() => {
                                     const matchedReq = incomingRequests.find(r => r.fromId === user.uid) || {
                                       id: 'req_' + user.uid,
                                       fromId: user.uid,
                                       fromName: user.displayName,
                                       fromPhoto: user.photoURL,
                                       toId: currentUser?.uid || '',
                                       status: 'pending' as const
                                     };
                                     handleAcceptRequest(matchedReq);
                                   }}
                                   className="flex-1 py-4 bg-brand-primary text-brand-depth rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
                                 >
                                   <UserCheck size={16} /> Accept Request
                                 </button>
                                 <button
                                   onClick={() => {
                                     const matchedReq = incomingRequests.find(r => r.fromId === user.uid);
                                     if (matchedReq) handleDeclineRequest(matchedReq.id, user.uid);
                                   }}
                                   className="p-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl transition-all cursor-pointer"
                                   title="Decline"
                                 >
                                   <XCircle size={18} />
                                 </button>
                               </div>
                             ) : reqStatus === 'pending' ? (
                               <div className="flex gap-2">
                                 <div className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                   <Clock size={15} /> Request Sent
                                 </div>
                                 <button 
                                   onClick={() => handleCancelSentRequest(user.uid)}
                                   className="px-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                   title="Cancel Request"
                                 >
                                   Cancel
                                 </button>
                               </div>
                             ) : reqStatus === 'accepted' ? (
                               <div className="flex gap-2">
                                 <div className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                                   <CheckCircle2 size={16} /> Connected
                                 </div>
                                 <button 
                                   onClick={() => {
                                     window.location.hash = '#/chat';
                                   }}
                                   className="shrink-0 w-14 h-14 bg-brand-primary text-brand-depth rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 group/chat cursor-pointer"
                                   title="Open Chat"
                                 >
                                    <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                                 </button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => handleSendRequest(user)}
                                 className="w-full py-4 bg-white/5 hover:bg-brand-primary hover:text-brand-depth text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 group/btn cursor-pointer"
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
                   );
                 })}
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
