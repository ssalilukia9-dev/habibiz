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
  UserMinus,
  XCircle,
  BellRing,
  Rss
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

export interface UmmahUser {
  uid: string;
  displayName: string;
  email?: string;
  photoURL: string;
  hasanat: number;
  lastSeen?: any;
  isPremium?: boolean;
  bio?: string;
}

export interface FriendRequest {
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

export const DEFAULT_UMMAH_MEMBERS: UmmahUser[] = [
  {
    uid: 'azn-ummah-member',
    displayName: 'Azn (Al-Zubair)',
    email: 'azn@noorhub.org',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    hasanat: 4850,
    lastSeen: new Date().toISOString(),
    isPremium: true,
    bio: 'Dedicated Quran student & Tahajjud seeker. Follow to share reflections!'
  },
  {
    uid: 'scholar-dr-yasir',
    displayName: 'Dr. Yasir Qadhi',
    email: 'dr.yasir@noortalk.org',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    hasanat: 8920,
    lastSeen: new Date().toISOString(),
    isPremium: true,
    bio: 'Dean of Islamic Seminary & Tafsir instructor.'
  },
  {
    uid: 'sister-fatima-z',
    displayName: 'Fatima Zahra',
    email: 'fatima.z@sanctuary.org',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    hasanat: 3640,
    lastSeen: new Date().toISOString(),
    isPremium: true,
    bio: 'Tajweed & Tajweed Masterclass learner 🌸'
  },
  {
    uid: 'hafiz-bilal',
    displayName: 'Hafiz Bilal',
    email: 'bilal@sanctuary.org',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    hasanat: 5210,
    lastSeen: new Date().toISOString(),
    isPremium: false,
    bio: 'Hafiz of the Quran & Khatam leader.'
  },
  {
    uid: 'ustadh-omar',
    displayName: 'Ustadh Omar',
    email: 'omar@ilm.org',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    hasanat: 4120,
    lastSeen: new Date().toISOString(),
    isPremium: true,
    bio: 'Arabic grammar & Seerah study circles 🌿'
  },
  {
    uid: 'sister-samira',
    displayName: 'Samira Bint Ahmad',
    email: 'samira@noorhub.org',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    hasanat: 2980,
    lastSeen: new Date().toISOString(),
    isPremium: false,
    bio: 'Daily Adhkar & Gratitude Journal companion 📿'
  }
];

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
  const [users, setUsers] = useState<UmmahUser[]>(DEFAULT_UMMAH_MEMBERS);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<Record<string, string>>({}); // targetUid -> 'pending' | 'incoming' | 'accepted'
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'following' | 'premium' | 'active'>('all');
  const [isListening, setIsListening] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // User Follows state
  const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('sanctuary_followed_creators');
      return saved ? new Set(JSON.parse(saved)) : new Set(['azn-ummah-member', 'Azn (Al-Zubair)', 'Dr. Yasir Qadhi', 'Fatima Zahra']);
    } catch {
      return new Set(['azn-ummah-member', 'Azn (Al-Zubair)', 'Dr. Yasir Qadhi', 'Fatima Zahra']);
    }
  });

  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({
    'azn-ummah-member': 534,
    'Azn (Al-Zubair)': 534,
    'scholar-dr-yasir': 1420,
    'Dr. Yasir Qadhi': 1420,
    'sister-fatima-z': 382,
    'Fatima Zahra': 382,
    'hafiz-bilal': 289,
    'Hafiz Bilal': 289,
    'ustadh-omar': 412,
    'Ustadh Omar': 412,
    'sister-samira': 210,
    'Samira Bint Ahmad': 210
  });

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

  // Sync follow status from Firestore
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('guest_')) {
      return;
    }

    try {
      const q = query(
        collection(db, 'user_follows'),
        where('followerId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const set = new Set<string>();
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data.creatorId) set.add(data.creatorId);
          if (data.creatorName) set.add(data.creatorName);
        });
        if (set.size > 0) {
          setFollowedUserIds(prev => new Set([...Array.from(prev), ...Array.from(set)]));
        }
      }, () => {});

      return () => unsubscribe();
    } catch {}
  }, [currentUser]);

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

  // Load real members + fallback defaults
  useEffect(() => {
    if (!currentUser || currentUser.uid.startsWith('local_') || currentUser.uid.startsWith('rest_')) {
      setUsers(DEFAULT_UMMAH_MEMBERS);
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
        const fetchedList = snap.docs
          .map(doc => {
            const data = doc.data();
            return {
              uid: doc.id,
              displayName: data.displayName || data.name || (data.email ? data.email.split('@')[0] : 'Sanctuary Member'),
              email: data.email || '',
              photoURL: data.photoURL || '',
              hasanat: Number(data.hasanat) || 0,
              lastSeen: data.lastSeen,
              isPremium: !!data.isPremium,
              bio: data.bio || ''
            } as UmmahUser;
          })
          .filter(u => u.uid !== currentUser?.uid);
        
        // Merge fetched list with defaults to ensure comprehensive community
        const existingIds = new Set(fetchedList.map(u => u.uid));
        const extraDefaults = DEFAULT_UMMAH_MEMBERS.filter(d => !existingIds.has(d.uid));
        setUsers([...fetchedList, ...extraDefaults]);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
        setUsers(DEFAULT_UMMAH_MEMBERS);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  // Follow / Unfollow User Handler
  const handleToggleFollow = async (targetUser: UmmahUser) => {
    const isCurrentlyFollowed = followedUserIds.has(targetUser.uid) || followedUserIds.has(targetUser.displayName);
    const targetKey = targetUser.uid;

    setFollowedUserIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyFollowed) {
        next.delete(targetUser.uid);
        next.delete(targetUser.displayName);
      } else {
        next.add(targetUser.uid);
        next.add(targetUser.displayName);
      }
      try {
        localStorage.setItem('sanctuary_followed_creators', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    setFollowerCounts(prev => ({
      ...prev,
      [targetKey]: Math.max(0, (prev[targetKey] || 0) + (isCurrentlyFollowed ? -1 : 1)),
      [targetUser.displayName]: Math.max(0, (prev[targetUser.displayName] || 0) + (isCurrentlyFollowed ? -1 : 1))
    }));

    if (isCurrentlyFollowed) {
      setSuccessToast(`Unfollowed ${targetUser.displayName}.`);
      setTimeout(() => setSuccessToast(null), 3000);

      if (currentUser && !currentUser.uid.startsWith('local_')) {
        try {
          const followDocId = `${currentUser.uid}_${targetUser.uid}`;
          await deleteDoc(doc(db, 'user_follows', followDocId)).catch(() => {});
          await deleteDoc(doc(db, 'follows', followDocId)).catch(() => {});
        } catch (e) {
          console.warn("Unfollow write fallback:", e);
        }
      }
    } else {
      setSuccessToast(`✨ Following ${targetUser.displayName}! Reflections & activities will appear in your stream.`);
      setTimeout(() => setSuccessToast(null), 4000);

      if (addHasanat) addHasanat(10);

      if (currentUser && !currentUser.uid.startsWith('local_')) {
        try {
          const followDocId = `${currentUser.uid}_${targetUser.uid}`;
          const followData = {
            followerId: currentUser.uid,
            followerName: currentUser.displayName || 'Ummah Member',
            creatorId: targetUser.uid,
            creatorName: targetUser.displayName,
            createdAt: serverTimestamp()
          };

          await setDoc(doc(db, 'user_follows', followDocId), followData).catch(() => {});
          await setDoc(doc(db, 'follows', followDocId), followData).catch(() => {});

          // Send direct in-app notification to the followed user
          await addDoc(collection(db, 'notifications'), {
            type: 'feed_follow',
            recipientId: targetUser.uid,
            senderId: currentUser.uid,
            senderName: currentUser.displayName || 'Ummah Member',
            title: `✨ New Follower on Ummah Hub`,
            body: `${currentUser.displayName || 'A member'} started following you on Ummah Hub.`,
            actionUrl: '/?tab=ummah',
            createdAt: serverTimestamp()
          }).catch(() => {});
        } catch (e) {
          console.warn("Follow write fallback:", e);
        }
      }
    }
  };

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
    const matchesSearch = u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (u.bio && u.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filter === 'following') {
      return followedUserIds.has(u.uid) || followedUserIds.has(u.displayName);
    }
    if (filter === 'premium') return u.isPremium;
    if (filter === 'active') return u.lastSeen;
    return true;
  });

  return (
    <div className="space-y-12 pb-32">
       {/* Feedback Toast */}
       <AnimatePresence>
         {successToast && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-sidebar/95 border border-brand-primary/40 text-white px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-bold"
           >
             <Sparkles size={16} className="text-brand-primary animate-pulse" />
             <span>{successToast}</span>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Header Section */}
       <section className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-brand-primary/20 via-brand-depth to-brand-depth border border-brand-primary/20 p-8 md:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
             <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-4">
                   <span className="px-3 md:px-4 py-1.5 bg-brand-primary text-brand-depth rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">Global Community & Following</span>
                   <div className="h-px w-12 md:w-24 bg-white/10" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Ummah<br/><span className="text-brand-primary">Hub</span></h2>
                   <p className="text-slate-400 font-medium text-base md:text-lg max-w-sm">Discover, follow, and connect with brothers and sisters like Azn on the sacred path.</p>
                </div>
             </div>

             <div className="flex flex-col gap-4 w-full lg:w-auto">
                <div className="relative group">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-primary/40 group-focus-within:text-brand-primary transition-colors" size={20} />
                   <input 
                     type="text" 
                     placeholder="Search for a heart, seeker, or Azn..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full lg:w-96 pl-16 pr-14 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors text-sm font-medium"
                   />
                   <button 
                     onClick={toggleListening}
                     className={`absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-brand-primary bg-brand-primary/10 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                     title="Voice Search"
                   >
                     <Mic size={18} />
                   </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                   {[
                     { id: 'all', label: 'All Members' },
                     { id: 'following', label: `Following (${followedUserIds.size})` },
                     { id: 'premium', label: 'Patrons' },
                     { id: 'active', label: 'Active Now' }
                   ].map((tab) => (
                     <button
                       key={tab.id}
                       onClick={() => setFilter(tab.id as any)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                         filter === tab.id 
                           ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' 
                           : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                       }`}
                     >
                       {tab.label}
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
                <span>{filter === 'following' ? 'Seekers You Follow' : 'Hearts Reaching Out'}</span>
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
                   const isFollowed = followedUserIds.has(user.uid) || followedUserIds.has(user.displayName);
                   const followerCount = followerCounts[user.uid] || followerCounts[user.displayName] || 150;

                   return (
                     <motion.div
                       key={user.uid}
                       layout
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       transition={{ delay: idx * 0.05 }}
                       className="group relative bg-brand-sidebar/40 border border-white/5 rounded-[2.5rem] p-7 hover:bg-brand-sidebar/80 hover:border-brand-primary/30 transition-all duration-500 overflow-hidden flex flex-col justify-between"
                     >
                       {/* Decorative background circle */}
                       <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/5 rounded-full blur-[40px] group-hover:bg-brand-primary/10 transition-colors" />
                       
                       <div className="relative z-10 space-y-5">
                          <div className="flex items-start justify-between">
                             <div className="relative">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-brand-primary/30 transition-all bg-brand-depth shadow-xl">
                                   <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                {user.isPremium && (
                                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-brand-depth shadow-lg border border-brand-sidebar">
                                     <ShieldCheck size={12} />
                                  </div>
                                )}
                             </div>
                             
                             {/* Follow / Unfollow Toggle Button */}
                             <button
                               onClick={() => handleToggleFollow(user)}
                               className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                                 isFollowed
                                   ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                                   : 'bg-brand-primary text-brand-depth hover:scale-105 active:scale-95 shadow-md shadow-brand-primary/20'
                               }`}
                               title={isFollowed ? 'Click to unfollow' : 'Follow this user'}
                             >
                               {isFollowed ? (
                                 <>
                                   <UserCheck size={12} />
                                   <span>Following</span>
                                 </>
                               ) : (
                                 <>
                                   <UserPlus size={12} />
                                   <span>+ Follow</span>
                                 </>
                               )}
                             </button>
                          </div>

                          <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <h4 className="text-lg font-black text-white tracking-tight line-clamp-1">{user.displayName}</h4>
                                {user.lastSeen && (Date.now() - (user.lastSeen?.toMillis ? user.lastSeen.toMillis() : new Date(user.lastSeen).getTime()) < 300000) && (
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse shrink-0" />
                                )}
                             </div>
                             
                             {user.bio ? (
                               <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{user.bio}</p>
                             ) : (
                               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  <Sparkles size={11} className="text-brand-primary/60" />
                                  <span>Level {Math.floor(user.hasanat / 500) + 1} Seeker</span>
                               </div>
                             )}

                             <div className="flex items-center gap-3 pt-1 text-[10px] font-bold text-slate-400">
                               <span className="flex items-center gap-1 text-brand-primary font-black">
                                 ✨ {user.hasanat.toLocaleString()} Hasanat
                               </span>
                               <span>•</span>
                               <span className="flex items-center gap-1">
                                 <Users size={11} /> {followerCount} followers
                               </span>
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
                                   className="flex-1 py-3 bg-brand-primary text-brand-depth rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
                                 >
                                   <UserCheck size={14} /> Accept Request
                                 </button>
                                 <button
                                   onClick={() => {
                                     const matchedReq = incomingRequests.find(r => r.fromId === user.uid);
                                     if (matchedReq) handleDeclineRequest(matchedReq.id, user.uid);
                                   }}
                                   className="p-3 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                   title="Decline"
                                 >
                                   <XCircle size={16} />
                                 </button>
                               </div>
                             ) : reqStatus === 'pending' ? (
                               <div className="flex gap-2">
                                 <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                   <Clock size={13} /> Request Sent
                                 </div>
                                 <button 
                                   onClick={() => handleCancelSentRequest(user.uid)}
                                   className="px-3 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                   title="Cancel Request"
                                 >
                                   Cancel
                                 </button>
                               </div>
                             ) : reqStatus === 'accepted' ? (
                               <div className="flex gap-2">
                                 <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                                   <CheckCircle2 size={14} /> Connected
                                 </div>
                                 <button 
                                   onClick={() => {
                                     window.location.hash = '#/chat';
                                   }}
                                   className="shrink-0 w-11 h-11 bg-brand-primary text-brand-depth rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 group/chat cursor-pointer"
                                   title="Open Chat"
                                 >
                                    <MessageCircle size={17} className="group-hover:rotate-12 transition-transform" />
                                 </button>
                               </div>
                             ) : (
                               <button 
                                 onClick={() => handleSendRequest(user)}
                                 className="w-full py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5 cursor-pointer"
                               >
                                  <MessageCircle size={14} className="text-brand-primary" />
                                  <span>Friendly Request</span>
                               </button>
                             )}
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
                  <h4 className="text-xl font-black text-white">
                    {filter === 'following' ? 'No followed users yet' : 'Heart not found'}
                  </h4>
                  <p className="text-slate-500 max-w-xs font-medium">
                    {filter === 'following' 
                      ? 'Follow users like Azn or other seekers in Ummah Hub to see them here!' 
                      : 'Try searching for a different name or browse the entire community.'}
                  </p>
               </div>
               <button 
                 onClick={() => { setSearchQuery(''); setFilter('all'); }}
                 className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
               >
                  Reset Filter
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
