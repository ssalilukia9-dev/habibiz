import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Mic,
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
  Inbox,
  Globe,
  Paperclip,
  Image as ImageIcon
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

export default function ChatView({ isPremium = false, searchQuery, setSearchQuery, addHasanat }: { isPremium?: boolean, searchQuery: string, setSearchQuery: (q: string) => void, addHasanat?: (amount: number) => void }) {
  const [activeTab, setActiveTab] = useState<'messages' | 'ummah' | 'requests'>('messages');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ChatUserInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ChatRequest[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (activeRoom) {
          setNewMessage(prev => prev + ' ' + transcript);
        } else if (activeTab === 'ummah' || activeTab === 'messages') {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [activeRoom, activeTab, setSearchQuery]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.lastMessage && room.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Layout state for mobile
  const [mobileViewState, setMobileViewState] = useState<'list' | 'chat'>('list');

  // Sync mobile view state with active room
  useEffect(() => {
    if (activeRoom) setMobileViewState('chat');
    else setMobileViewState('list');
  }, [activeRoom]);

  // Fetch rooms (Groups the user is in + Personal DMs)
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });
    return () => unsubscribe();
  }, []);

  // Fetch pending requests
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'friend_requests'),
      where('toId', '==', auth.currentUser.uid),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRequest)));
    });
    return () => unsubscribe();
  }, []);

  // Fetch messages
  useEffect(() => {
    if (!activeRoom || !auth.currentUser) return;
    const q = query(
      collection(db, `rooms/${activeRoom.id}/messages`),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgList);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${activeRoom.id}/messages`);
    });
    return () => unsubscribe();
  }, [activeRoom]);

  // Search users for new chats
  useEffect(() => {
    if (activeTab !== 'ummah') {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        let q;
        if (searchQuery.trim()) {
           q = query(
            collection(db, 'users'),
            where('displayName', '>=', searchQuery),
            where('displayName', '<=', searchQuery + '\uf8ff'),
            limit(20)
          );
        } else {
          // Default: show latest users or top hasanat users
          q = query(
            collection(db, 'users'),
            orderBy('hasanat', 'desc'),
            limit(20)
          );
        }
        
        const snap = await getDocs(q);
        setSearchResults(snap.docs
          .map(doc => doc.data() as ChatUserInfo)
          .filter(u => u.uid !== auth.currentUser?.uid)
        );
      } catch (error) {
        console.error("Search error", error);
      }
    };
    const timer = setTimeout(searchUsers, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !activeRoom || !auth.currentUser) return;
    const msgData: any = {
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhoto: auth.currentUser.photoURL,
      text: newMessage,
      timestamp: serverTimestamp()
    };
    if (attachment) {
      msgData.imageUrl = attachment;
    }
    try {
      setNewMessage('');
      setAttachment(null);
      await addDoc(collection(db, `rooms/${activeRoom.id}/messages`), msgData);
      if (addHasanat) addHasanat(5); // Points for messaging
      await updateDoc(doc(db, 'rooms', activeRoom.id), {
        lastMessage: attachment ? '📷 Photo' : newMessage,
        lastSenderId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `rooms/${activeRoom.id}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("Image is too large. Please use a smaller heart (file size < 800KB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendRequest = async (user: ChatUserInfo) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'friend_requests'), {
        fromId: auth.currentUser.uid,
        fromName: auth.currentUser.displayName || 'Anonymous',
        fromPhoto: auth.currentUser.photoURL,
        toId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert(`Request sent to ${user.displayName}. You can chat once they accept.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friend_requests');
    }
  };

  const handleAcceptRequest = async (request: ChatRequest) => {
    if (!auth.currentUser) return;
    try {
      const roomId = [auth.currentUser.uid, request.fromId].sort().join('_');
      await setDoc(doc(db, 'rooms', roomId), {
        name: request.fromName,
        type: 'private',
        participants: [auth.currentUser.uid, request.fromId],
        updatedAt: serverTimestamp(),
        lastMessage: 'Chat started'
      });
      await deleteDoc(doc(db, 'friend_requests', request.id));
      setActiveTab('messages');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'rooms');
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

  const handleDeleteRoom = async () => {
    if (!activeRoom || !auth.currentUser || activeRoom.createdBy !== auth.currentUser.uid) return;
    
    if (!confirm('Are you certain you wish to dissolve this sacred circle? All messages and history will be permanently erased from the sanctuary.')) return;

    try {
      // 1. Delete all messages in the subcollection first (optional but good practice)
      const msgsQuery = query(collection(db, `rooms/${activeRoom.id}/messages`));
      const msgsSnap = await getDocs(msgsQuery);
      
      const deletePromises = msgsSnap.docs.map(m => deleteDoc(doc(db, `rooms/${activeRoom.id}/messages`, m.id)));
      await Promise.all(deletePromises);

      // 2. Delete the room itself
      await deleteDoc(doc(db, 'rooms', activeRoom.id));
      
      setActiveRoom(null);
      setMobileViewState('list');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rooms/${activeRoom.id}`);
    }
  };

  if (!auth.currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[650px] bg-brand-sidebar/20 rounded-[2rem] md:rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl relative">
      
      {/* 1. Sidebar Panel (List of Chats/Search/Requests) */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col transition-all duration-300 ${mobileViewState === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white tracking-tight">Ummah Hub</h2>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-depth transition-all"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Tab Navigation with sliding indicator */}
          <div className="relative flex p-1 bg-white/5 rounded-2xl overflow-hidden">
            {/* Sliding background */}
            <motion.div 
              className="absolute top-1 bottom-1 bg-brand-primary rounded-xl shadow-lg z-0"
              initial={false}
              animate={{ 
                left: activeTab === 'messages' ? '0.25rem' : activeTab === 'ummah' ? '33.33%' : '66.66%',
                width: 'calc(33.33% - 0.5rem)' 
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
            {[
              { id: 'messages', label: 'Chats', icon: MessageCircle },
              { id: 'ummah', label: 'Explore', icon: Globe },
              { id: 'requests', label: 'Requests', icon: Inbox, count: pendingRequests.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all relative z-10 ${activeTab === tab.id ? 'text-brand-depth font-black' : 'text-slate-500 hover:text-white'}`}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[10px] font-black uppercase mt-1 tracking-widest leading-none">{tab.label}</span>
                <AnimatePresence>
                  {tab.count ? (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`absolute top-1.5 right-1.5 w-4 h-4 text-[8px] flex items-center justify-center rounded-full font-black ${activeTab === tab.id ? 'bg-brand-depth text-brand-primary' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}
                    >
                      {tab.count}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Scrolable Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 no-scrollbar">
          {activeTab === 'messages' && (
            <>
              {filteredRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full text-left p-4 rounded-3xl transition-all flex items-center gap-3 ${activeRoom?.id === room.id ? 'bg-brand-primary text-brand-depth shadow-xl' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeRoom?.id === room.id ? 'bg-brand-depth/20' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {room.type === 'group' ? <Hash size={18} /> : (
                      <div className="relative">
                        <MessageCircle size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm truncate">{room.name}</p>
                    <p className="text-[10px] opacity-60 truncate font-medium">{room.lastMessage || 'No messages yet'}</p>
                  </div>
                </button>
              ))}
              {rooms.length === 0 && (
                <div className="py-20 text-center opacity-30 select-none">
                  <MessageCircle size={40} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Quiet in here...</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'ummah' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find seeker by name..."
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:bg-white/10 transition-all font-medium"
                />
                <button 
                  onClick={toggleListening}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isListening ? 'text-brand-primary bg-brand-primary/10 animate-pulse' : 'text-slate-500 hover:text-white'}`}
                >
                  <Mic size={14} />
                </button>
              </div>
              
              <div className="space-y-4">
                {searchQuery === '' && (
                  <div className="px-1 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Seekers</p>
                    <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-black uppercase">Live</div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={user.uid} 
                      className="bg-white/5 p-4 rounded-3xl flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary overflow-hidden relative border border-white/5 shadow-xl">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs text-white truncate group-hover:text-brand-primary transition-colors">{user.displayName || user.email?.split('@')[0]}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Voyager</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSendRequest(user)}
                        className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-brand-depth hover:scale-110 active:scale-95 transition-all shadow-lg shadow-brand-primary/0 hover:shadow-brand-primary/20"
                      >
                        <UserPlus size={18} />
                      </button>
                    </motion.div>
                  ))}

                  {searchResults.length === 0 && (
                     <div className="py-20 text-center opacity-30 select-none">
                        <Globe size={40} className="mx-auto mb-4 animate-pulse" />
                        <p className="text-xs font-black uppercase tracking-widest">Discovering Souls...</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-brand-primary/5 p-5 rounded-[2rem] border border-brand-primary/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <img src={req.fromPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromId}`} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
                    <div>
                      <p className="font-black text-xs text-white leading-none">{req.fromName}</p>
                      <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest mt-1">Connection Request</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptRequest(req)}
                      className="flex-1 bg-brand-primary text-brand-depth font-black py-2 rounded-xl text-xs hover:scale-105 transition-all shadow-lg shadow-brand-primary/10 flex items-center justify-center gap-2"
                    >
                      <Check size={14} /> Accept
                    </button>
                    <button 
                      onClick={() => deleteDoc(doc(db, 'friend_requests', req.id))}
                      className="p-2 bg-white/5 text-slate-500 rounded-xl hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="py-20 text-center opacity-30">
                  <Inbox size={40} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">No Requests</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Window Area */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${mobileViewState === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-5 md:p-8 border-b border-white/5 bg-brand-sidebar/40 backdrop-blur-3xl flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveRoom(null)} className="md:hidden p-2 text-brand-primary hover:bg-brand-primary/10 rounded-xl -ml-2">
                  <ArrowLeft size={24} />
                </button>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-xl shadow-brand-primary/10">
                  {activeRoom.type === 'group' ? <Hash size={24} /> : <MessageCircle size={24} />}
                </div>
                <div>
                  <h3 className="text-sm md:text-lg font-black text-white leading-tight">{activeRoom.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse shadow-[0_0_5px_var(--brand-primary)]"></div>
                    <p className="text-[9px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Sanctuary Channel</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeRoom.type === 'group' && activeRoom.createdBy === auth.currentUser?.uid && (
                  <button 
                    onClick={handleDeleteRoom}
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Dissolve Group"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreHorizontal /></button>
              </div>
            </div>

            {/* Message Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 md:p-10 md:space-y-8 no-scrollbar scroll-smooth">
              {messages.map((msg) => {
                const isMe = msg.senderId === auth.currentUser?.uid;
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src={msg.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} className="w-8 h-8 rounded-lg shrink-0" alt="" />
                      <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{msg.senderName}</p>
                          <span className="text-[8px] text-slate-600 font-bold">{msg.timestamp?.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) || ''}</span>
                        </div>
                        <div className={`p-4 rounded-[2rem] text-sm leading-relaxed shadow-xl relative group/msg ${
                          isMe 
                            ? 'bg-brand-primary text-brand-depth rounded-tr-none' 
                            : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
                        }`}>
                          {msg.imageUrl && (
                            <img 
                              src={msg.imageUrl} 
                              alt="attachment" 
                              className="max-w-full rounded-2xl mb-2 border border-white/10"
                              onLoad={() => {
                                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                              }}
                            />
                          )}
                          {msg.text}
                          {isMe && (
                            <div className="absolute -bottom-1.5 -right-1 flex items-center bg-brand-sidebar/80 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-brand-primary/20 scale-75 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                              <Check size={10} className="text-brand-primary" />
                              <Check size={10} className="-ml-1 text-brand-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-5 md:p-8 bg-brand-sidebar/40 border-t border-white/5">
              <AnimatePresence>
                {attachment && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4 relative w-24 h-24"
                  >
                    <img src={attachment} className="w-full h-full object-cover rounded-2xl border border-brand-primary/30 shadow-xl" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setAttachment(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative flex items-center gap-2">
                <div className="flex gap-1">
                  <button 
                    type="button"
                    onClick={toggleListening}
                    className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-brand-primary/20 text-brand-primary animate-pulse border border-brand-primary/30' : 'bg-brand-depth border border-white/5 text-slate-500 hover:text-brand-primary'}`}
                  >
                    <Mic size={20} />
                  </button>
                  <label className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-brand-depth border border-white/5 text-slate-500 hover:text-brand-primary cursor-pointer transition-all">
                    <ImageIcon size={20} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
                <div className="relative flex-1 flex items-center">
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Reflect and share..."
                    className="w-full bg-brand-depth border border-white/10 rounded-[1.5rem] py-4 md:py-5 px-6 pr-16 text-sm text-white focus:outline-none focus:border-brand-primary/40 transition-all font-medium shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim() && !attachment}
                    className="absolute right-2 w-10 h-10 bg-brand-primary text-brand-depth rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-xl shadow-brand-primary/20"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 islamic-pattern opacity-40">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-[2rem] flex items-center justify-center text-brand-primary border border-brand-primary/10 shadow-2xl">
              <MessageCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-widest uppercase">Sacred Silence</h3>
              <p className="text-xs text-slate-500 font-medium max-w-[240px] mt-2">Select a brother or sister or join a group ummah to begin conversing.</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Create Group Overlay */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-brand-depth/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-sidebar border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm space-y-6 shadow-[0_0_100px_rgba(var(--brand-primary-rgb),0.1)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">New Community Hub</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <input 
                  required value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group Name (e.g. Fiqh Study)"
                  className="w-full bg-brand-depth/50 border border-white/5 rounded-2xl py-4 px-6 text-white font-medium outline-none focus:border-brand-primary/30 transition-all"
                />
                <button 
                  type="submit"
                  className="w-full bg-brand-primary text-brand-depth font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                  Create Channel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
