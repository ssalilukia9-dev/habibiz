import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Search, 
  MoreHorizontal, 
  Hash, 
  Lock,
  ArrowLeft,
  UserPlus,
  Check,
  X,
  User as UserIcon,
  Plus,
  Clock,
  Trash2,
  Crown,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  or,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  limit
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: any;
}

interface Room {
  id: string;
  name: string;
  type: 'group' | 'private';
  participants?: string[];
  lastMessage?: string;
  updatedAt?: any;
  createdBy?: string;
}

interface ChatUserInfo {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface ChatRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromPhoto?: string;
  toId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export default function ChatView({ isPremium = false }: { isPremium?: boolean }) {
  const [activeTab, setActiveTab] = useState<'ummah' | 'requests'>('ummah');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUserInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ChatRequest[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize public groups if they don't exist
  useEffect(() => {
    const initGroups = async () => {
      if (!auth.currentUser) return;
      const globalRoomId = 'global-ummah';
      const globalRoomRef = doc(db, 'rooms', globalRoomId);
      try {
        const docSnap = await getDoc(globalRoomRef);
        if (!docSnap.exists()) {
          await setDoc(globalRoomRef, {
            name: 'Global Ummah',
            type: 'group',
            participants: [],
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.warn("Global room init error or already exists:", error);
      }
    };
    initGroups();
  }, []);

  // Fetch rooms
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'rooms'),
      or(
        where('type', '==', 'group'),
        where('participants', 'array-contains', auth.currentUser.uid)
      ),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomList);
      setLoading(false);
      
      if (!activeRoom && roomList.length > 0) {
        const global = roomList.find(r => r.id === 'global-ummah');
        if (global) setActiveRoom(global);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });
    return () => unsubscribe();
  }, [activeRoom]);

  // Fetch pendings requests
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'chat_requests'),
      where('toId', '==', auth.currentUser.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRequest)));
    });
    return () => unsubscribe();
  }, []);

  // Fetch messages for active room
  useEffect(() => {
    if (!activeRoom || !auth.currentUser) return;
    const q = query(
      collection(db, `rooms/${activeRoom.id}/messages`),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgList);
      // Faster scroll for real-time feel
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${activeRoom.id}/messages`);
    });
    return () => unsubscribe();
  }, [activeRoom]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Handle user search
  useEffect(() => {
    if (activeTab !== 'ummah' || !userSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('email', '>=', userSearchQuery),
          where('email', '<=', userSearchQuery + '\uf8ff'),
          limit(10)
        );
        const snap = await getDocs(q);
        setSearchResults(snap.docs
          .map(doc => doc.data() as ChatUserInfo)
          .filter(u => u.uid !== auth.currentUser?.uid) // Don't show myself
        );
      } catch (error) {
        console.error("Search error", error);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [userSearchQuery, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !auth.currentUser) return;

    const msgData = {
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
      senderPhoto: auth.currentUser.photoURL,
      text: newMessage,
      timestamp: serverTimestamp()
    };

    try {
      setNewMessage('');
      const messagesRef = collection(db, `rooms/${activeRoom.id}/messages`);
      await addDoc(messagesRef, msgData);
      
      const roomRef = doc(db, 'rooms', activeRoom.id);
      await updateDoc(roomRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `rooms/${activeRoom.id}`);
    }
  };

  const handleSendRequest = async (user: ChatUserInfo) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'chat_requests'), {
        fromId: auth.currentUser.uid,
        fromName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
        fromPhoto: auth.currentUser.photoURL,
        toId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert(`Request sent to ${user.displayName || user.email}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chat_requests');
    }
  };

  const handleAcceptRequest = async (request: ChatRequest) => {
    if (!auth.currentUser) return;
    try {
      // Create room
      const roomId = [auth.currentUser.uid, request.fromId].sort().join('_');
      await setDoc(doc(db, 'rooms', roomId), {
        name: request.fromName, // This is simplistic, might need better naming for private rooms
        type: 'private',
        participants: [auth.currentUser.uid, request.fromId],
        updatedAt: serverTimestamp(),
        lastMessage: 'Chat started'
      });

      // Update request
      await deleteDoc(doc(db, 'chat_requests', request.id));
      setActiveTab('ummah');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chat_requests/rooms');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'chat_requests', requestId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'chat_requests');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !auth.currentUser) return;
    try {
      const roomRef = await addDoc(collection(db, 'rooms'), {
        name: newGroupName,
        type: 'group',
        participants: [auth.currentUser.uid],
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });
      setShowCreateGroup(false);
      setNewGroupName('');
      setActiveRoom({ id: roomRef.id, name: newGroupName, type: 'group', createdBy: auth.currentUser.uid } as Room);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'rooms');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? All messages will be lost.')) return;
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      // Optionally delete messages subcollection - though Firestore doesn't do this automatically
      // For a demo/simple app, we just delete the room doc
      setActiveRoom(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rooms/${roomId}`);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-brand-primary">
          <Lock size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white">Sacred Conversations</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Please login to connect with the global Ummah.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-220px)] md:h-[700px] flex glass-panel rounded-[2rem] md:rounded-[3.5rem] border-white/5 overflow-hidden shadow-2xl bg-brand-sidebar/30 backdrop-blur-3xl relative">
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-brand-depth/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-brand-sidebar border border-white/10 p-8 rounded-[2rem] w-full max-w-sm space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">New Group</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Group Name</label>
                  <input 
                    required
                    type="text" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Fiqh Study Group"
                    className="w-full bg-brand-depth/50 border border-white/10 rounded-2xl py-4 px-6 text-white font-medium outline-none focus:border-brand-primary/40 transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-primary text-brand-depth font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Create Group
                  <Plus size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VERITCAL NAVIGATION RAIL */}
      <div className="hidden md:flex w-20 flex-col items-center py-8 gap-8 border-r border-white/5 bg-black/20">
         {[
           { id: 'ummah', label: 'Ummah', icon: Users, color: '' },
           { id: 'requests', label: 'Requests', icon: Clock, count: pendingRequests.length, color: '' },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => {
               setActiveTab(tab.id as any);
               setActiveRoom(null);
             }}
             className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative group ${activeTab === tab.id ? 'bg-brand-primary text-brand-depth shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
             title={tab.label}
           >
              <tab.icon size={22} className={tab.color || ''} />
              {tab.count ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-black shadow-lg">
                  {tab.count}
                </span>
              ) : null}
              {activeTab === tab.id && (
                <motion.div layoutId="activeChatTab" className="absolute left-[-16px] w-1 h-8 bg-brand-primary rounded-r-full" />
              )}
           </button>
         ))}

         <div className="mt-auto">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPremium ? 'text-amber-400' : 'text-slate-700'}`}>
               <ShieldCheck size={24} />
            </div>
         </div>
      </div>

      {/* Sidebar: Content for selected tab */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 md:p-8 border-b border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-black text-white capitalize">{activeTab}</h3>
              <button 
                onClick={() => setShowCreateGroup(true)}
                className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-depth transition-all"
              >
                <Plus size={20} />
              </button>
           </div>

           {/* Mobile Tabs Wrapper (Vertical Nav is hide) */}
           <div className="md:hidden flex p-1 bg-white/5 rounded-2xl overflow-x-auto">
              {[
                { id: 'ummah', label: 'Ummah', icon: Users },
                { id: 'requests', label: 'Requests', icon: Clock, count: pendingRequests.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[70px] flex flex-col items-center py-2 rounded-xl transition-all relative ${activeTab === tab.id ? 'bg-brand-primary text-brand-depth shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                   <tab.icon size={16} />
                   <span className="text-[10px] font-black uppercase mt-1">{tab.label}</span>
                </button>
              ))}
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 no-scrollbar">
           {activeTab === 'ummah' && (
              <div className="space-y-6">
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                   <input 
                     type="text" 
                     value={userSearchQuery}
                     onChange={(e) => setUserSearchQuery(e.target.value)}
                     placeholder="Search Ummah..."
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                   />
                 </div>
                 
                 {rooms.length > 0 && !userSearchQuery && (
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Your Conversations</p>
                      <div className="space-y-2">
                        {rooms.map(room => (
                          <button
                            key={room.id}
                            onClick={() => setActiveRoom(room)}
                            className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-3 ${activeRoom?.id === room.id ? 'bg-brand-primary text-brand-depth shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                          >
                             <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeRoom?.id === room.id ? 'bg-brand-depth/20' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                {room.type === 'group' ? <Hash size={14} /> : <MessageCircle size={14} />}
                             </div>
                             <div className="min-w-0 flex-1">
                                <p className="font-black text-xs truncate">
                                  {room.type === 'private' ? `Chat with ${room.name}` : room.name}
                                </p>
                             </div>
                          </button>
                        ))}
                      </div>
                   </div>
                 )}
                 
                 {!userSearchQuery && rooms.filter(r => r.type === 'group').length === 0 && (
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Public Communities</p>
                      <div className="space-y-2">
                        <div className="p-4 text-center opacity-40">
                           <p className="text-[10px] font-bold">No public groups available</p>
                        </div>
                      </div>
                   </div>
                 )}

                 <div className="space-y-2">
                    {searchResults.length > 0 && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Members</p>}
                    {searchResults.map(user => (
                      <div key={user.uid} className="bg-white/5 p-4 rounded-3xl flex items-center justify-between border border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary overflow-hidden">
                               {user.photoURL ? <img src={user.photoURL} alt="" /> : <UserIcon size={20} />}
                            </div>
                            <div className="min-w-0">
                               <p className="font-black text-sm text-white truncate">{user.displayName || user.email.split('@')[0]}</p>
                               <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleSendRequest(user)}
                           className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-depth transition-all"
                         >
                            <UserPlus size={18} />
                         </button>
                      </div>
                    ))}
                    {userSearchQuery && searchResults.length === 0 && (
                      <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-8">No members found</p>
                    )}
                 </div>
              </div>
            )}

           {activeTab === 'requests' && (
             <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-white/5 p-5 rounded-[2rem] space-y-4 border border-white/5">
                     <div className="flex items-center gap-3">
                        <img src={req.fromPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromId}`} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                           <p className="font-black text-xs text-white">{req.fromName}</p>
                           <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">Wants to connect</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(req)}
                          className="flex-1 bg-brand-primary text-brand-depth font-black py-2 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                        >
                           <Check size={14} /> Accept
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(req.id)}
                          className="px-4 py-2 bg-white/5 text-slate-500 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                           <X size={14} />
                        </button>
                     </div>
                  </div>
                ))}
                 {pendingRequests.length === 0 && (
                  <div className="text-center py-12 space-y-2 opacity-40">
                     <Clock className="mx-auto text-brand-primary mb-4" size={32} />
                     <p className="text-xs font-bold text-white uppercase tracking-widest">No Requests</p>
                     <p className="text-[10px] font-medium text-slate-500">Invitations will appear here</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="p-4 md:p-8 border-b border-white/5 flex items-center justify-between bg-brand-sidebar/50 backdrop-blur-xl">
               <div className="flex items-center gap-2 md:gap-4">
                  <button onClick={() => setActiveRoom(null)} className="md:hidden text-brand-primary p-2 mr-1"><ArrowLeft size={24} /></button>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                       {activeRoom.type === 'group' ? <Users size={16} className="md:w-5 md:h-5" /> : <MessageCircle size={16} className="md:w-5 md:h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm md:text-lg font-black text-white truncate max-w-[120px] sm:max-w-none">{activeRoom.name}</h4>
                      <p className="text-[8px] md:text-[10px] font-black text-brand-primary uppercase tracking-widest">
                        {activeRoom.type === 'group' ? 'Community Hub' : 'Direct Message'}
                      </p>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                 {activeRoom.type === 'group' && activeRoom.createdBy === auth.currentUser?.uid && (
                    <button 
                      onClick={() => handleDeleteRoom(activeRoom.id)}
                      className="p-2 md:p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Delete Group"
                    >
                       <Trash2 size={18} className="md:w-5 md:h-5" />
                    </button>
                 )}
                 <button className="p-2 md:p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl md:rounded-2xl"><MoreHorizontal size={20} /></button>
               </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 md:space-y-8 no-scrollbar scroll-smooth">
               {messages.map((msg, idx) => {
                 const isMe = msg.senderId === auth.currentUser?.uid;
                 return (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                   >
                     <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img src={msg.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl shrink-0 border border-white/5" />
                        <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                           <div className={`flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                             <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                {msg.senderName}
                                {isMe && isPremium && <Crown size={10} className="text-amber-400" />}
                             </p>
                             <span className="text-[8px] font-bold text-slate-600">{formatTime(msg.timestamp)}</span>
                           </div>
                           <div className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] ${isMe ? 'bg-brand-primary text-brand-depth rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5 shadow-xl'}`}>
                              <p className="text-xs md:text-sm font-medium leading-relaxed">{msg.text}</p>
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 );
               })}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 md:p-8 bg-brand-sidebar/50 border-t border-white/5 islamic-pattern">
               <div className="relative group">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-brand-depth border border-white/10 rounded-[1.5rem] md:rounded-[2rem] py-4 md:py-6 pl-6 md:px-8 text-sm md:text-base text-white focus:outline-none focus:border-brand-primary/40 transition-all font-medium pr-16 md:pr-20 shadow-inner"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-brand-primary text-brand-depth rounded-xl md:rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                  >
                     <Send className="w-4.5 h-4.5 md:w-5 md:h-5" />
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6 islamic-pattern">
             <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-2xl">
                <MessageCircle size={48} />
             </div>
             <div className="space-y-2">
               <h4 className="text-2xl font-black text-white">Select a Chat</h4>
               <p className="text-slate-500 max-w-sm font-medium">Continue your conversations or join the global Ummah feed to connect with others.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
