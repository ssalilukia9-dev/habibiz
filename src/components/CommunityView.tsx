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
  ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc
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
}

export default function CommunityView() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
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
        handleFirestoreError(error, OperationType.GET, `rooms/${globalRoomId}`);
      }
    };
    initGroups();
  }, []);

  // Fetch rooms
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'rooms'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));
      setRooms(roomList);
      setLoading(false);
      
      // Select global room by default
      if (!activeRoom && roomList.length > 0) {
        const global = roomList.find(r => r.id === 'global-ummah');
        if (global) setActiveRoom(global);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    });
    return () => unsubscribe();
  }, [activeRoom]);

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
      setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${activeRoom.id}/messages`);
    });
    return () => unsubscribe();
  }, [activeRoom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !auth.currentUser) return;

    const msgData = {
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Anonymous',
      senderPhoto: auth.currentUser.photoURL,
      text: newMessage,
      timestamp: serverTimestamp()
    };

    try {
      setNewMessage('');
      const messagesRef = collection(db, `rooms/${activeRoom.id}/messages`);
      await addDoc(messagesRef, msgData);
      
      const roomRef = doc(db, 'rooms', activeRoom.id);
      await setDoc(roomRef, {
        lastMessage: newMessage,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `rooms/${activeRoom.id}`);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center space-y-8">
        <div className="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-brand-primary">
          <Lock size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white">Sacred Space</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Please login to join the global community feed and connect with others.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[700px] flex glass-panel rounded-[3.5rem] border-white/5 overflow-hidden shadow-2xl bg-brand-sidebar/30 backdrop-blur-3xl">
      {/* Sidebar: Rooms */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <h3 className="text-xl font-black text-white">Ummah Feed</h3>
           <Users size={20} className="text-brand-primary" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {rooms.map(room => (
             <button
               key={room.id}
               onClick={() => setActiveRoom(room)}
               className={`w-full text-left p-6 rounded-[2rem] transition-all flex items-center gap-4 ${activeRoom?.id === room.id ? 'bg-brand-primary text-brand-depth shadow-xl shadow-brand-primary/20 scale-[1.02]' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
             >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeRoom?.id === room.id ? 'bg-brand-depth/20' : 'bg-brand-primary/10 text-brand-primary'}`}>
                   {room.type === 'group' ? <Hash size={24} /> : <MessageCircle size={24} />}
                </div>
                <div className="min-w-0">
                   <p className="font-black text-sm truncate">{room.name}</p>
                   <p className="text-[10px] font-medium opacity-60 truncate">{room.lastMessage || 'Start a conversation...'}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-brand-sidebar/50">
               <div className="flex items-center gap-4">
                  <button onClick={() => setActiveRoom(null)} className="md:hidden text-brand-primary"><ArrowLeft size={24} /></button>
                  <div>
                    <h4 className="text-lg font-black text-white">{activeRoom.name}</h4>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Active Agora</p>
                  </div>
               </div>
               <button className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-2xl"><MoreHorizontal size={20} /></button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar scroll-smooth">
               {messages.map((msg, idx) => {
                 const isMe = msg.senderId === auth.currentUser?.uid;
                 return (
                   <motion.div 
                     key={msg.id}
                     initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                   >
                     <div className={`flex gap-4 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <img src={msg.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} alt="" className="w-10 h-10 rounded-2xl shrink-0" />
                        <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">{msg.senderName}</p>
                           <div className={`p-5 rounded-[2rem] ${isMe ? 'bg-brand-primary text-brand-depth rounded-tr-none' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'}`}>
                              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 );
               })}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-8 bg-brand-sidebar/50 border-t border-white/5">
               <div className="relative group">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Contribute to the conversation..."
                    className="w-full bg-brand-depth border border-white/10 rounded-[2rem] py-6 px-8 text-white focus:outline-none focus:border-brand-primary/40 transition-all font-medium pr-20"
                  />
                  <button 
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-primary text-brand-depth rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                  >
                     <Send size={20} />
                  </button>
               </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
             <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                <MessageCircle size={48} />
             </div>
             <div className="space-y-2">
               <h4 className="text-2xl font-black text-white">Join the Conversation</h4>
               <p className="text-slate-500 max-w-sm font-medium">Select a room from the sidebar to start sharing wisdom and connecting with the global Ummah.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
