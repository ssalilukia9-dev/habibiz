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
  Image as ImageIcon,
  CornerUpLeft,
  Briefcase,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Smile,
  Pin,
  Volume2,
  Play,
  Pause,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Phone,
  Bookmark,
  Share2,
  FileText,
  AlertCircle
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
import { auth, db } from '../lib/firebase';
import { restDbClient } from '../lib/restDbClient';
import { handleFirestoreError, OperationType } from '../lib/utils';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: any;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
  isBusiness?: boolean;
  pinned?: boolean;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user uids
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
}

export interface Room {
  id: string;
  name: string;
  type: 'group' | 'private' | 'business';
  isBusiness?: boolean;
  participants?: string[];
  participantNames?: { [uid: string]: string };
  participantPhotos?: { [uid: string]: string };
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt?: any;
  createdBy?: string;
  pinnedMessage?: Message | null;
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

// 48 hours in milliseconds (2 days)
const DISAPPEARING_DURATION_MS = 48 * 60 * 60 * 1000;

export default function ChatView({ 
  currentUser, 
  isPremium = false, 
  searchQuery, 
  setSearchQuery, 
  addHasanat 
}: { 
  currentUser?: any; 
  isPremium?: boolean; 
  searchQuery: string; 
  setSearchQuery: (q: string) => void; 
  addHasanat?: (amount: number) => void; 
}) {
  const [activeTab, setActiveTab] = useState<'messages' | 'ummah' | 'requests'>('messages');
  const restUser = restDbClient.isLoggedIn() ? restDbClient.getUser() : null;
  const myUser = restUser ? {
    uid: restUser.uid,
    displayName: restUser.displayName,
    email: restUser.email,
    isRest: true
  } : (currentUser || auth.currentUser);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ChatUserInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ChatRequest[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isGroupBusiness, setIsGroupBusiness] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mobileViewState, setMobileViewState] = useState<'list' | 'chat'>('list');

  // Media Lightbox Expansion State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);

  // In-Chat Search State
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  // Audio Voice Note Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Attachment Drawer State
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);

  // Typing emulation indicator
  const [isTyping, setIsTyping] = useState(false);

  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getRoomName = (room: Room) => {
    if (room.type === 'group') return room.name;
    if (room.participantNames && myUser) {
      const otherId = room.participants?.find(uid => uid !== myUser.uid);
      if (otherId && room.participantNames[otherId]) {
        return room.participantNames[otherId];
      }
    }
    return room.name;
  };

  const getRoomPhoto = (room: Room) => {
    if (room.type === 'group') return null;
    if (room.participantPhotos && myUser) {
      const otherId = room.participants?.find(uid => uid !== myUser.uid);
      if (otherId && room.participantPhotos[otherId]) {
        return room.participantPhotos[otherId];
      }
    }
    return null;
  };

  // Check whether a room is in business mode (preserved permanently)
  const isBusinessRoom = (room: Room | null) => {
    if (!room) return false;
    return room.type === 'business' || !!room.isBusiness;
  };

  // Determine if a message has expired under the 48-hour disappearing policy
  const isMessageExpired = (msg: Message, room: Room | null) => {
    if (isBusinessRoom(room) || msg.isBusiness) return false;
    if (!msg.timestamp) return false;

    try {
      const timeMs = typeof msg.timestamp?.toDate === 'function' 
        ? msg.timestamp.toDate().getTime() 
        : (typeof msg.timestamp?.seconds === 'number' 
            ? msg.timestamp.seconds * 1000 
            : new Date(msg.timestamp).getTime());

      if (isNaN(timeMs)) return false;
      const ageMs = Date.now() - timeMs;
      return ageMs > DISAPPEARING_DURATION_MS;
    } catch (e) {
      return false;
    }
  };

  // Get remaining hours until a non-business message disappears
  const getMessageRemainingHours = (msg: Message, room: Room | null) => {
    if (isBusinessRoom(room) || msg.isBusiness) return null;
    if (!msg.timestamp) return '48h';

    try {
      const timeMs = typeof msg.timestamp?.toDate === 'function' 
        ? msg.timestamp.toDate().getTime() 
        : (typeof msg.timestamp?.seconds === 'number' 
            ? msg.timestamp.seconds * 1000 
            : new Date(msg.timestamp).getTime());

      if (isNaN(timeMs)) return '48h';
      const ageMs = Date.now() - timeMs;
      const remainingMs = Math.max(0, DISAPPEARING_DURATION_MS - ageMs);
      const hours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return `${hours}h`;
    } catch (e) {
      return '48h';
    }
  };

  // Voice recognition hookup
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
          setNewMessage(prev => (prev ? prev + ' ' + transcript : transcript));
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

  // Default rooms initialization
  useEffect(() => {
    const defaultStarterRooms: Room[] = [
      { 
        id: 'group_general_circle', 
        name: 'General Sanctuary Circle', 
        type: 'group', 
        lastMessage: 'Reflections and community unity',
        isBusiness: false 
      },
      { 
        id: 'group_quran_study', 
        name: 'Quran Study & Reflections', 
        type: 'group', 
        lastMessage: 'Sharing deep insights and ayah ponderings',
        isBusiness: false 
      },
      { 
        id: 'group_market_trade', 
        name: 'Suq Al-Mubaraki Trade & Business', 
        type: 'business', 
        lastMessage: 'Permanent escrow and Halal commerce receipts',
        isBusiness: true 
      }
    ];

    if (!myUser || myUser.uid.startsWith('local_') || myUser.isRest) {
      const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRooms(parsed);
          if (!activeRoom && parsed.length > 0) setActiveRoom(parsed[0]);
        } catch (e) {
          setRooms(defaultStarterRooms);
          if (!activeRoom) setActiveRoom(defaultStarterRooms[0]);
        }
      } else {
        setRooms(defaultStarterRooms);
        if (!activeRoom) setActiveRoom(defaultStarterRooms[0]);
        localStorage.setItem(localKey, JSON.stringify(defaultStarterRooms));
      }
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'rooms'),
      or(
        where('type', 'in', ['group', 'business']),
        where('participants', 'array-contains', myUser.uid)
      ),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRooms: Room[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Room[];

      const finalRooms = [...fetchedRooms];
      defaultStarterRooms.forEach(sr => {
        if (!finalRooms.some(r => r.id === sr.id)) {
          finalRooms.push(sr);
        }
      });

      setRooms(finalRooms);
      if (!activeRoom && finalRooms.length > 0) {
        setActiveRoom(finalRooms[0]);
      }
      setLoading(false);
    }, (err) => {
      console.warn("Firestore rooms query error:", err);
      setRooms(defaultStarterRooms);
      if (!activeRoom) setActiveRoom(defaultStarterRooms[0]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [myUser?.uid]);

  // Load and subscribe to active room messages with 48h filter
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    if (!myUser || myUser.uid.startsWith('local_') || myUser.isRest || activeRoom.id.startsWith('group_') || activeRoom.id.startsWith('seeker_')) {
      const msgsKey = `sanctuary_msgs_${activeRoom.id}`;
      const stored = localStorage.getItem(msgsKey);
      if (stored) {
        try {
          const parsed: Message[] = JSON.parse(stored);
          // Apply 48-hour disappearing message filter for non-business
          const valid = parsed.filter(m => !isMessageExpired(m, activeRoom));
          setMessages(valid);
          if (valid.length !== parsed.length) {
            localStorage.setItem(msgsKey, JSON.stringify(valid));
          }
        } catch (e) {
          setMessages([]);
        }
      } else {
        // Starter greetings
        const starter: Message = {
          id: 'starter_' + Date.now(),
          senderId: 'system',
          senderName: 'Sanctuary Guide',
          text: activeRoom.isBusiness || activeRoom.type === 'business'
            ? '💼 Welcome to this Business & Trade channel. All agreements, receipts, and order negotiations here are permanently preserved.'
            : '⏱️ Welcome to this Sanctuary Circle. To keep memory light and spiritual, standard messages automatically disappear after 48 hours.',
          timestamp: new Date().toISOString(),
          isBusiness: activeRoom.isBusiness || activeRoom.type === 'business'
        };
        setMessages([starter]);
        localStorage.setItem(msgsKey, JSON.stringify([starter]));
      }
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
      return;
    }

    const msgsQuery = query(
      collection(db, `rooms/${activeRoom.id}/messages`),
      orderBy('timestamp', 'asc'),
      limit(150)
    );

    const unsubscribe = onSnapshot(msgsQuery, (snapshot) => {
      const fetched: Message[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Message[];

      // Filter out messages older than 48 hours for non-business chats
      const filtered = fetched.filter(m => !isMessageExpired(m, activeRoom));
      setMessages(filtered);

      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }, (err) => {
      console.warn("Firestore messages fetch error:", err);
    });

    return () => unsubscribe();
  }, [activeRoom?.id, activeRoom?.isBusiness, activeRoom?.type]);

  // Send text, image, or audio message
  const handleSendMessage = async (e?: React.FormEvent, customPayload?: Partial<Message>) => {
    if (e) e.preventDefault();
    const textToSend = customPayload?.text !== undefined ? customPayload.text : newMessage;
    const imageToSend = customPayload?.imageUrl !== undefined ? customPayload.imageUrl : attachment;
    const audioToSend = customPayload?.audioUrl;
    const isBusinessMsg = customPayload?.isBusiness !== undefined ? customPayload.isBusiness : (isBusinessRoom(activeRoom));

    if ((!textToSend.trim() && !imageToSend && !audioToSend) || !activeRoom || !myUser) return;

    const msgData: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      senderId: myUser.uid,
      senderName: myUser.displayName || 'Anonymous Seeker',
      senderPhoto: myUser.photoURL || '',
      text: textToSend,
      timestamp: new Date().toISOString(),
      isBusiness: isBusinessMsg
    };

    if (imageToSend) msgData.imageUrl = imageToSend;
    if (audioToSend) {
      msgData.audioUrl = audioToSend;
      msgData.audioDuration = customPayload?.audioDuration || 3;
    }
    if (replyingTo) {
      msgData.replyTo = {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        text: replyingTo.text
      };
    }

    setNewMessage('');
    setAttachment(null);
    setReplyingTo(null);
    setShowAttachmentMenu(false);

    // If local/starter room
    const isLocal = myUser.uid.startsWith('local_') || myUser.isRest || activeRoom.id.startsWith('group_') || activeRoom.id.startsWith('seeker_');

    if (isLocal) {
      const msgsKey = `sanctuary_msgs_${activeRoom.id}`;
      const existingRaw = localStorage.getItem(msgsKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [...existing, msgData];
      localStorage.setItem(msgsKey, JSON.stringify(updated));
      setMessages(updated);

      const localRoomsKey = `sanctuary_rooms_${myUser.uid || 'guest'}`;
      const prevRoomsRaw = localStorage.getItem(localRoomsKey);
      const prevRooms = prevRoomsRaw ? JSON.parse(prevRoomsRaw) : [];
      const existingIndex = prevRooms.findIndex((r: any) => r.id === activeRoom.id);

      const previewText = audioToSend ? '🎙️ Voice Note' : (imageToSend ? '📷 Photo' : textToSend);
      const updatedRoom = {
        ...activeRoom,
        lastMessage: previewText,
        updatedAt: new Date().toISOString()
      };

      if (existingIndex > -1) {
        prevRooms[existingIndex] = updatedRoom;
      } else {
        prevRooms.unshift(updatedRoom);
      }
      localStorage.setItem(localRoomsKey, JSON.stringify(prevRooms));
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? updatedRoom : r));

      if (addHasanat) addHasanat(5);

      // Automated simulated response for circles
      if (activeRoom.id === 'group_general_circle' || activeRoom.id === 'group_quran_study') {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const replies = [
            "MashaAllah, thank you for sharing your reflection, brother/sister!",
            "SubhanAllah, the beauty of the Ummah is in moments like this. JazakAllahu Khairan!",
            "May Allah grant you ease and accept your good deeds today."
          ];
          const autoMsg: Message = {
            id: 'bot_' + Date.now(),
            senderId: 'seeker_companion',
            senderName: 'Sister Yasmin',
            text: replies[Math.floor(Math.random() * replies.length)],
            timestamp: new Date().toISOString(),
            isBusiness: false
          };
          const nextWithBot = [...updated, autoMsg];
          localStorage.setItem(msgsKey, JSON.stringify(nextWithBot));
          setMessages(nextWithBot);
          if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 1600);
      }
      return;
    }

    // Firestore send
    try {
      const payload: any = {
        senderId: msgData.senderId,
        senderName: msgData.senderName,
        senderPhoto: msgData.senderPhoto,
        text: msgData.text,
        timestamp: serverTimestamp(),
        isBusiness: msgData.isBusiness || false
      };
      if (msgData.imageUrl) payload.imageUrl = msgData.imageUrl;
      if (msgData.audioUrl) {
        payload.audioUrl = msgData.audioUrl;
        payload.audioDuration = msgData.audioDuration;
      }
      if (msgData.replyTo) payload.replyTo = msgData.replyTo;

      await addDoc(collection(db, `rooms/${activeRoom.id}/messages`), payload);
      if (addHasanat) addHasanat(5);

      const previewText = audioToSend ? '🎙️ Voice Note' : (imageToSend ? '📷 Photo' : textToSend);
      await updateDoc(doc(db, 'rooms', activeRoom.id), {
        lastMessage: previewText,
        lastSenderId: myUser.uid,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore message write fallback:", err);
    }
  };

  // Toggle Room Mode (Business / Permanent vs 48h Ephemeral)
  const handleToggleRoomBusinessMode = async () => {
    if (!activeRoom) return;
    const nextBusiness = !isBusinessRoom(activeRoom);
    const updatedRoom: Room = {
      ...activeRoom,
      type: nextBusiness ? 'business' : 'private',
      isBusiness: nextBusiness
    };

    setActiveRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === activeRoom.id ? updatedRoom : r));

    // Update in LocalStorage
    const localRoomsKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
    const prevRoomsRaw = localStorage.getItem(localRoomsKey);
    if (prevRoomsRaw) {
      const prevRooms = JSON.parse(prevRoomsRaw);
      const idx = prevRooms.findIndex((r: any) => r.id === activeRoom.id);
      if (idx > -1) {
        prevRooms[idx] = updatedRoom;
        localStorage.setItem(localRoomsKey, JSON.stringify(prevRooms));
      }
    }

    // Update in Firestore
    if (myUser && !myUser.uid?.startsWith('local_') && !myUser.isRest && !activeRoom.id.startsWith('group_')) {
      try {
        await updateDoc(doc(db, 'rooms', activeRoom.id), {
          type: nextBusiness ? 'business' : 'private',
          isBusiness: nextBusiness
        });
      } catch (e) {}
    }

    // Post notice in chat
    const noticeText = nextBusiness 
      ? '💼 Mode changed to Business & Trade: All messages in this conversation are now permanently archived.'
      : '⏱️ Mode changed to Ephemeral: Messages in this conversation will automatically disappear after 48 hours.';
    
    handleSendMessage(undefined, { text: noticeText, isBusiness: true });
  };

  // Delete an individual message
  const handleDeleteMessage = async (msg: Message, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeRoom || !myUser) return;

    if (!confirm('Permanently delete this message?')) return;

    // Remove from state
    const next = messages.filter(m => m.id !== msg.id);
    setMessages(next);

    // Remove from LocalStorage
    const msgsKey = `sanctuary_msgs_${activeRoom.id}`;
    localStorage.setItem(msgsKey, JSON.stringify(next));

    // Remove from Firestore
    if (!myUser.uid.startsWith('local_') && !myUser.isRest && !activeRoom.id.startsWith('group_')) {
      try {
        await deleteDoc(doc(db, `rooms/${activeRoom.id}/messages`, msg.id));
      } catch (err) {
        console.warn("Error deleting message from Firestore:", err);
      }
    }
  };

  // Clear entire conversation history in active room
  const handleClearChatHistory = async () => {
    if (!activeRoom || !myUser) return;
    if (!confirm(`Are you sure you want to clear all message history in "${getRoomName(activeRoom)}"?`)) return;

    setMessages([]);
    localStorage.removeItem(`sanctuary_msgs_${activeRoom.id}`);

    if (!myUser.uid.startsWith('local_') && !myUser.isRest && !activeRoom.id.startsWith('group_')) {
      try {
        const msgsSnap = await getDocs(collection(db, `rooms/${activeRoom.id}/messages`));
        const delPromises = msgsSnap.docs.map(d => deleteDoc(doc(db, `rooms/${activeRoom.id}/messages`, d.id)));
        await Promise.all(delPromises);
        await updateDoc(doc(db, 'rooms', activeRoom.id), {
          lastMessage: 'Chat cleared'
        });
      } catch (e) {}
    }
  };

  // Delete / leave active chat room
  const handleDeleteRoom = async (roomToDelete: Room, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!myUser) return;
    const name = getRoomName(roomToDelete);

    if (!confirm(`Delete chat "${name}"? All history will be removed.`)) return;

    setRooms(prev => prev.filter(r => r.id !== roomToDelete.id));
    if (activeRoom?.id === roomToDelete.id) {
      setActiveRoom(null);
      setMessages([]);
      setMobileViewState('list');
    }

    const localRoomsKey = `sanctuary_rooms_${myUser.uid || 'guest'}`;
    const saved = localStorage.getItem(localRoomsKey);
    if (saved) {
      const parsed = JSON.parse(saved).filter((r: any) => r.id !== roomToDelete.id);
      localStorage.setItem(localRoomsKey, JSON.stringify(parsed));
    }
    localStorage.removeItem(`sanctuary_msgs_${roomToDelete.id}`);

    if (!myUser.uid.startsWith('local_') && !myUser.isRest && !roomToDelete.id.startsWith('group_')) {
      try {
        await deleteDoc(doc(db, 'rooms', roomToDelete.id));
      } catch (e) {}
    }
  };

  // Toggle emoji reaction on message
  const handleToggleReaction = async (msg: Message, emoji: string) => {
    if (!myUser || !activeRoom) return;
    const currentReactions = msg.reactions || {};
    const usersForEmoji = currentReactions[emoji] || [];
    const hasReacted = usersForEmoji.includes(myUser.uid);

    const nextUsers = hasReacted 
      ? usersForEmoji.filter(u => u !== myUser.uid) 
      : [...usersForEmoji, myUser.uid];

    const nextReactions = { ...currentReactions };
    if (nextUsers.length > 0) {
      nextReactions[emoji] = nextUsers;
    } else {
      delete nextReactions[emoji];
    }

    const updatedMessages = messages.map(m => m.id === msg.id ? { ...m, reactions: nextReactions } : m);
    setMessages(updatedMessages);
    setShowEmojiPickerFor(null);

    const msgsKey = `sanctuary_msgs_${activeRoom.id}`;
    localStorage.setItem(msgsKey, JSON.stringify(updatedMessages));

    if (!myUser.uid.startsWith('local_') && !myUser.isRest && !activeRoom.id.startsWith('group_')) {
      try {
        await updateDoc(doc(db, `rooms/${activeRoom.id}/messages`, msg.id), {
          reactions: nextReactions
        });
      } catch (e) {}
    }
  };

  // Pinned message toggle
  const handleTogglePinMessage = async (msg: Message) => {
    if (!activeRoom) return;
    const nextPinned = activeRoom.pinnedMessage?.id === msg.id ? null : msg;
    const updatedRoom = { ...activeRoom, pinnedMessage: nextPinned };
    setActiveRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === activeRoom.id ? updatedRoom : r));

    if (myUser && !myUser.uid?.startsWith('local_') && !myUser.isRest && !activeRoom.id.startsWith('group_')) {
      try {
        await updateDoc(doc(db, 'rooms', activeRoom.id), {
          pinnedMessage: nextPinned
        });
      } catch (e) {}
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("Image exceeds 800KB. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Start Audio Voice Note Recording
  const handleStartAudioRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            handleSendMessage(undefined, {
              audioUrl: base64Audio,
              audioDuration: recordingSeconds || 4,
              text: '🎙️ Voice Note'
            });
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecordingAudio(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      } else {
        // Fallback simulation
        setIsRecordingAudio(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(s => s + 1);
        }, 1000);
      }
    } catch (err) {
      console.warn("Microphone access denied or simulated:", err);
      // Simulated voice note
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
  };

  const handleStopAudioRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated voice note payload
      handleSendMessage(undefined, {
        audioUrl: 'simulated_audio_note',
        audioDuration: recordingSeconds || 5,
        text: '🎙️ Voice Note'
      });
    }
    setIsRecordingAudio(false);
  };

  const handleCancelAudioRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
    setRecordingSeconds(0);
  };

  // Quick Share Dua / Ayah card
  const handleShareDuaCard = (duaText: string, title: string) => {
    handleSendMessage(undefined, {
      text: `✨ [Spiritual Reflection: ${title}]\n\n"${duaText}"\n\n— Shared from Habibi Sanctuary`
    });
  };

  // Quick Share Market Trade Reference
  const handleShareMarketItem = () => {
    handleSendMessage(undefined, {
      text: `🛍️ [Suq Al-Mubaraki Inquiry]\n\nI would like to trade / inquire regarding your listed goods. Let's agree on terms and Noor Coin transfer.`,
      isBusiness: true
    });
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !myUser) return;

    const newRoom: Room = {
      id: 'group_' + Date.now(),
      name: newGroupName.trim(),
      type: isGroupBusiness ? 'business' : 'group',
      isBusiness: isGroupBusiness,
      participants: [myUser.uid],
      updatedAt: new Date().toISOString(),
      createdBy: myUser.uid,
      lastMessage: isGroupBusiness ? '💼 Business Channel Opened' : 'Channel created'
    };

    setRooms(prev => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setShowCreateGroup(false);
    setNewGroupName('');
    setIsGroupBusiness(false);

    if (!myUser.uid.startsWith('local_') && !myUser.isRest) {
      try {
        await addDoc(collection(db, 'rooms'), {
          name: newRoom.name,
          type: newRoom.type,
          isBusiness: newRoom.isBusiness,
          participants: [myUser.uid],
          updatedAt: serverTimestamp(),
          createdBy: myUser.uid,
          lastMessage: newRoom.lastMessage
        });
      } catch (e) {}
    }
  };

  // Filter messages by in-chat search
  const displayedMessages = messages.filter(m => {
    if (!chatSearchTerm.trim()) return true;
    const term = chatSearchTerm.toLowerCase();
    return m.text?.toLowerCase().includes(term) || m.senderName?.toLowerCase().includes(term);
  });

  const availableEmojis = ['❤️', '🤲', '👍', '🔥', '🌙', '🕌', '👏', '⭐'];

  if (!myUser) return null;

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] md:h-[680px] bg-slate-950/80 rounded-[2rem] md:rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl relative">
      
      {/* 1. Left Sidebar Panel (Rooms / Explore / Requests) */}
      <div className={`w-full md:w-80 border-r border-white/10 flex flex-col transition-all duration-300 bg-slate-900/60 ${mobileViewState === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-5 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Global Ummah</span>
              <h2 className="text-xl font-black text-white tracking-tight">Sanctuary Hub</h2>
            </div>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2.5 bg-amber-400/15 hover:bg-amber-400 text-amber-400 hover:text-black rounded-xl transition-all cursor-pointer border border-amber-400/30"
              title="Create New Channel"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-black/50 rounded-2xl border border-white/10">
            {[
              { id: 'messages', label: 'Chats', icon: MessageCircle },
              { id: 'ummah', label: 'Explore', icon: Globe },
              { id: 'requests', label: 'Requests', icon: Inbox, count: pendingRequests.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-2.5 rounded-xl transition-all cursor-pointer relative ${
                  activeTab === tab.id 
                    ? 'bg-amber-400 text-black font-black shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-[9px] font-black uppercase mt-1 tracking-wider leading-none">{tab.label}</span>
                {tab.count ? (
                  <span className="absolute top-1 right-2 w-4 h-4 text-[8px] bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5 no-scrollbar">
          {activeTab === 'messages' && (
            <>
              {rooms.map(room => {
                const isActive = activeRoom?.id === room.id;
                const isBiz = isBusinessRoom(room);
                return (
                  <div key={room.id} className="relative group/room">
                    <button
                      onClick={() => {
                        setActiveRoom(room);
                        setMobileViewState('chat');
                      }}
                      className={`w-full text-left p-3.5 pr-9 rounded-2xl transition-all flex items-center gap-3 cursor-pointer border ${
                        isActive
                          ? 'bg-amber-400 text-black border-amber-400 shadow-xl font-bold'
                          : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${
                        isActive ? 'bg-black/20 text-black' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      }`}>
                        {room.type === 'business' || isBiz ? (
                          <Briefcase size={18} />
                        ) : room.type === 'group' ? (
                          <Hash size={18} />
                        ) : (
                          getRoomPhoto(room) ? (
                            <img src={getRoomPhoto(room)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={18} />
                          )
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-black text-xs truncate">{getRoomName(room)}</p>
                          {isBiz && (
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                              isActive ? 'bg-black/30 text-black' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              Biz
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-black/80' : 'text-slate-400'}`}>
                          {room.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </button>

                    {/* Room Delete Trash Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoom(room, e)}
                      title="Delete chat thread"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/room:opacity-100 transition-all cursor-pointer ${
                        isActive ? 'text-black hover:bg-black/20' : 'text-slate-500 hover:text-red-400 hover:bg-white/10'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}

              {rooms.length === 0 && (
                <div className="py-20 text-center text-slate-500">
                  <MessageCircle size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs uppercase font-bold tracking-widest">No active conversations</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'ummah' && (
            <div className="p-2 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Seeker Directory</p>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    Y
                  </div>
                  <div>
                    <p className="font-bold text-white">Yasmin al-Farsi</p>
                    <p className="text-[9px] text-slate-400">Quran Study Leader • Istanbul</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const room: Room = {
                      id: 'seeker_yasmin',
                      name: 'Yasmin al-Farsi',
                      type: 'private',
                      lastMessage: 'As-salamu alaykum!'
                    };
                    setRooms(prev => [room, ...prev]);
                    setActiveRoom(room);
                    setActiveTab('messages');
                  }}
                  className="w-full py-1.5 bg-amber-400 text-black font-black text-[10px] rounded-lg uppercase tracking-wider hover:bg-amber-300 transition-all"
                >
                  Send Direct Message
                </button>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <p className="font-bold text-white">Imam Ahmed Al-Farooq</p>
                    <p className="text-[9px] text-slate-400">Scholar & Fiqh Guide • Cairo</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const room: Room = {
                      id: 'seeker_imam',
                      name: 'Imam Ahmed Al-Farooq',
                      type: 'private',
                      lastMessage: 'BarakAllahu Feek'
                    };
                    setRooms(prev => [room, ...prev]);
                    setActiveRoom(room);
                    setActiveTab('messages');
                  }}
                  className="w-full py-1.5 bg-amber-400 text-black font-black text-[10px] rounded-lg uppercase tracking-wider hover:bg-amber-300 transition-all"
                >
                  Send Direct Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Window Area */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300 bg-slate-950/40 ${mobileViewState === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* Active Room Top Bar */}
            <div className="p-4 md:p-5 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl flex items-center justify-between shrink-0 sticky top-0 z-20">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => {
                    setActiveRoom(null);
                    setMobileViewState('list');
                  }} 
                  className="md:hidden p-2 text-amber-400 hover:bg-white/5 rounded-xl cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
                  {isBusinessRoom(activeRoom) ? <Briefcase size={20} /> : <MessageCircle size={20} />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-black text-white truncate">{getRoomName(activeRoom)}</h3>
                    {isBusinessRoom(activeRoom) ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-wider border border-emerald-500/30 shrink-0">
                        💼 Business Record
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[8px] font-black uppercase tracking-wider border border-amber-400/30 shrink-0 flex items-center gap-1">
                        <Clock size={9} /> 48h Disappearing
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 truncate font-medium">
                    {isBusinessRoom(activeRoom)
                      ? 'Permanent records preserved for commerce and receipts.'
                      : 'Ephemeral mode active: Non-business messages auto-expire after 2 days.'}
                  </p>
                </div>
              </div>

              {/* Chat Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Search in Chat Button */}
                <button
                  onClick={() => setChatSearchOpen(!chatSearchOpen)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    chatSearchOpen ? 'bg-amber-400 text-black border-amber-400' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Search inside this chat"
                >
                  <Search size={15} />
                </button>

                {/* Business / Ephemeral Toggle Button */}
                <button
                  onClick={handleToggleRoomBusinessMode}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isBusinessRoom(activeRoom)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle Business mode (Permanent) vs Ephemeral (48h Disappearing)"
                >
                  <Briefcase size={12} />
                  <span className="hidden sm:inline">{isBusinessRoom(activeRoom) ? 'Business Mode' : 'Make Business'}</span>
                </button>

                {/* Clear Chat History Button */}
                <button
                  onClick={handleClearChatHistory}
                  className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 rounded-xl transition-all cursor-pointer"
                  title="Clear conversation history"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* In-Chat Search Bar Drawer */}
            <AnimatePresence>
              {chatSearchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-3 bg-black/60 border-b border-white/10 flex items-center gap-2 overflow-hidden shrink-0"
                >
                  <Search size={14} className="text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                    placeholder="Search words in this conversation..."
                    className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
                    autoFocus
                  />
                  {chatSearchTerm && (
                    <button onClick={() => setChatSearchTerm('')} className="text-slate-400 hover:text-white p-1">
                      <X size={13} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinned Message Banner if available */}
            {activeRoom.pinnedMessage && (
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Pin size={14} className="text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-wider">Pinned Announcement</p>
                    <p className="text-slate-200 truncate">{activeRoom.pinnedMessage.text}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePinMessage(activeRoom.pinnedMessage!)}
                  className="text-slate-400 hover:text-white text-[10px] font-bold underline shrink-0 cursor-pointer"
                >
                  Unpin
                </button>
              </div>
            )}

            {/* Messages Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar">
              {displayedMessages.map((msg) => {
                const isMe = msg.senderId === myUser.uid;
                const remainingHours = getMessageRemainingHours(msg, activeRoom);
                const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
                  >
                    <div className={`flex gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-white/10 flex items-center justify-center shrink-0 text-amber-400 text-xs font-bold overflow-hidden">
                        {msg.senderPhoto ? (
                          <img src={msg.senderPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          msg.senderName?.[0] || 'U'
                        )}
                      </div>

                      {/* Bubble Container */}
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 px-1 text-[9px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="font-black text-slate-300 uppercase tracking-wider">{msg.senderName}</span>
                          
                          {/* Disappearing indicator or Business badge */}
                          {msg.isBusiness || isBusinessRoom(activeRoom) ? (
                            <span className="text-[8px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Briefcase size={8} /> Business
                            </span>
                          ) : remainingHours ? (
                            <span className="text-[8px] text-amber-400/80 font-mono flex items-center gap-0.5" title="Expires in 48 hours">
                              <Clock size={8} /> {remainingHours} left
                            </span>
                          ) : null}

                          {/* Quick Message Actions Hover Menu */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-amber-300 cursor-pointer"
                              title="React with emoji"
                            >
                              <Smile size={11} />
                            </button>

                            <button
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white cursor-pointer"
                              title="Reply"
                            >
                              <CornerUpLeft size={11} />
                            </button>

                            <button
                              onClick={() => handleTogglePinMessage(msg)}
                              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-amber-400 cursor-pointer"
                              title="Pin message"
                            >
                              <Pin size={11} />
                            </button>

                            {isMe && (
                              <button
                                onClick={(e) => handleDeleteMessage(msg, e)}
                                className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                                title="Delete message"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Message Content Box */}
                        <div
                          className={`p-3.5 md:p-4 rounded-[1.8rem] text-xs leading-relaxed shadow-lg relative ${
                            isMe
                              ? 'bg-amber-400 text-black rounded-tr-none font-medium'
                              : 'bg-slate-900 text-slate-200 rounded-tl-none border border-white/10'
                          }`}
                        >
                          {/* Replied Message Preview */}
                          {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded-xl border-l-2 text-[10px] ${
                              isMe ? 'bg-black/10 border-black text-black/80' : 'bg-black/40 border-amber-400 text-slate-400'
                            }`}>
                              <span className="font-bold uppercase">Replying to {msg.replyTo.senderName}:</span>
                              <p className="truncate italic">"{msg.replyTo.text}"</p>
                            </div>
                          )}

                          {/* Media Image with Click-to-Expand Lightbox */}
                          {msg.imageUrl && (
                            <div className="relative group/media mb-2 rounded-2xl overflow-hidden border border-black/10 cursor-pointer" onClick={() => setLightboxImage(msg.imageUrl!)}>
                              <img src={msg.imageUrl} alt="Media" className="max-w-full rounded-2xl max-h-64 object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-[10px] font-bold">
                                <ZoomIn size={16} />
                                <span>Click to Expand</span>
                              </div>
                            </div>
                          )}

                          {/* Voice Note Player */}
                          {msg.audioUrl && (
                            <div className={`p-2.5 rounded-2xl flex items-center gap-3 mb-1.5 ${isMe ? 'bg-black/15' : 'bg-black/50 border border-white/10'}`}>
                              <button
                                onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                  isMe ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'
                                }`}
                              >
                                {playingAudioId === msg.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                              </button>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-1 h-3">
                                  {[40, 70, 90, 60, 30, 80, 100, 50, 65, 85, 45, 95].map((h, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`flex-1 rounded-full ${playingAudioId === msg.id ? 'animate-pulse bg-current' : 'opacity-50 bg-current'}`} 
                                      style={{ height: `${h}%` }} 
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-mono">
                                  <span>Voice Note</span>
                                  <span>0:0{msg.audioDuration || 4}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {/* Timestamp & Read Receipt */}
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[8px] ${isMe ? 'text-black/60' : 'text-slate-500'}`}>
                            <span>
                              {(() => {
                                if (!msg.timestamp) return '';
                                if (typeof msg.timestamp?.toDate === 'function') {
                                  return msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                }
                                try {
                                  return new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                } catch (e) {
                                  return '';
                                }
                              })()}
                            </span>
                            {isMe && <CheckCheck size={10} className="text-current" />}
                          </div>
                        </div>

                        {/* Floating Emoji Picker Popover */}
                        <AnimatePresence>
                          {showEmojiPickerFor === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex items-center gap-1 p-1 bg-slate-900 border border-white/20 rounded-full shadow-2xl z-30"
                            >
                              {availableEmojis.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => handleToggleReaction(msg, emoji)}
                                  className="w-7 h-7 hover:scale-125 transition-transform text-sm flex items-center justify-center cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Active Reactions Pills */}
                        {hasReactions && (
                          <div className={`flex flex-wrap gap-1 pt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(msg.reactions!).map(([emoji, uids]) => (
                              <button
                                key={emoji}
                                onClick={() => handleToggleReaction(msg, emoji)}
                                className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                  uids.includes(myUser.uid)
                                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                                    : 'bg-black/40 border-white/10 text-slate-300'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-bold text-[9px] font-mono">{uids.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic px-3 py-1">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Sister Yasmin is reflecting...</span>
                </div>
              )}
            </div>

            {/* Input Form & Rich Toolbar */}
            <div className="p-3 md:p-5 bg-slate-950/80 border-t border-white/10 space-y-2 shrink-0">
              {/* Replying Banner */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2.5 bg-slate-900 border border-amber-400/30 rounded-2xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CornerUpLeft size={14} className="text-amber-400 shrink-0" />
                      <span className="text-slate-300 truncate">
                        Replying to <strong className="text-amber-400">{replyingTo.senderName}</strong>: "{replyingTo.text}"
                      </span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white p-1">
                      <X size={14} />
                    </button>
                  </motion.div>
                )}

                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden border border-amber-400 shadow-xl"
                  >
                    <img src={attachment} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setAttachment(null)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rich Attachment Drawer Menu */}
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 bg-slate-900 border border-white/10 rounded-2xl grid grid-cols-3 gap-2 text-xs"
                  >
                    <button
                      onClick={() => handleShareDuaCard('Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.', 'Dua for Goodness in Both Worlds')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-400/20 text-slate-300 hover:text-amber-300 border border-white/5 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={16} className="text-amber-400" />
                      <span className="text-[10px] font-bold">Share Dua Card</span>
                    </button>

                    <button
                      onClick={handleShareMarketItem}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-400/20 text-slate-300 hover:text-emerald-300 border border-white/5 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <Briefcase size={16} className="text-emerald-400" />
                      <span className="text-[10px] font-bold">Suq Trade Card</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage(undefined, { text: '🕌 [Masjid Check-In] Performing Salah at the local congregation. Duas requested for the Ummah!' })}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-teal-400/20 text-slate-300 hover:text-teal-300 border border-white/5 flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <MapPin size={16} className="text-teal-400" />
                      <span className="text-[10px] font-bold">Masjid Check-in</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Row */}
              <div className="flex items-center gap-2">
                {/* Voice Note Recording Indicator Mode */}
                {isRecordingAudio ? (
                  <div className="flex-1 flex items-center justify-between p-3 bg-red-500/20 border border-red-500/40 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold text-red-300 font-mono">
                        Recording Voice Note... 0:0{recordingSeconds}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelAudioRecording}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStopAudioRecording}
                        className="px-4 py-1.5 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Send size={12} /> Send Voice
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Attachment Drawer Trigger */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all cursor-pointer shrink-0"
                      title="Share Duas & Trade items"
                    >
                      <Paperclip size={18} />
                    </button>

                    {/* Image Attachment Button */}
                    <label className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-400 transition-all cursor-pointer shrink-0">
                      <ImageIcon size={18} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>

                    {/* Voice Dictation (Speech to text) */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isListening
                          ? 'bg-amber-400 text-black border-amber-400 animate-pulse'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-amber-400'
                      }`}
                      title="Dictate message"
                    >
                      <Mic size={18} />
                    </button>

                    {/* Text Input Box */}
                    <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message or reflection..."
                        className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-4 text-xs text-white outline-none focus:border-amber-400/50 transition-all placeholder:text-slate-500"
                      />

                      {/* Send Button or Voice Note Record */}
                      {newMessage.trim() || attachment ? (
                        <button
                          type="submit"
                          className="w-11 h-11 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-all shadow-xl shadow-amber-400/20 cursor-pointer shrink-0 font-bold"
                        >
                          <Send size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartAudioRecording}
                          className="w-11 h-11 rounded-2xl bg-amber-400/20 hover:bg-amber-400 text-amber-400 hover:text-black border border-amber-400/30 flex items-center justify-center transition-all cursor-pointer shrink-0"
                          title="Record audio note"
                        >
                          <Volume2 size={18} />
                        </button>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-xl">
              <MessageCircle size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-wider">Sanctuary Circle Standby</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Select a brother, sister, or circle to share reflections, exchange commerce, or ask guidance.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Media Lightbox Expansion Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 md:p-8">
            {/* Lightbox Controls Top Bar */}
            <div className="w-full flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Media Expansion</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-mono">Zoom: {Math.round(lightboxZoom * 100)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxZoom(z => Math.min(3, z + 0.25))}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setLightboxZoom(z => Math.max(0.5, z - 0.25))}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => setLightboxRotation(r => (r + 90) % 360)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 transition-all cursor-pointer"
                  title="Rotate Image"
                >
                  <RotateCw size={18} />
                </button>
                <a
                  href={lightboxImage}
                  download="sanctuary_expanded_media.png"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 transition-all cursor-pointer"
                  title="Save Image"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() => {
                    setLightboxImage(null);
                    setLightboxZoom(1);
                    setLightboxRotation(0);
                  }}
                  className="p-2.5 bg-red-500/20 hover:bg-red-500 rounded-xl text-red-300 hover:text-white transition-all cursor-pointer ml-2"
                  title="Close Expansion"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Image Preview Canvas */}
            <div className="flex-1 flex items-center justify-center overflow-hidden w-full my-4">
              <motion.img
                src={lightboxImage}
                alt="Expanded media"
                style={{
                  transform: `scale(${lightboxZoom}) rotate(${lightboxRotation}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="text-center text-slate-400 text-xs shrink-0">
              <span>Press <strong className="text-white">Esc</strong> or click close to return to chat</span>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Create Group / Channel Modal */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-950 border border-amber-500/30 rounded-[2.5rem] p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-white">Create New Channel</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel Name</label>
                  <input
                    required
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Daily Fiqh Circle, Trade Discussion..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400/50"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGroupBusiness}
                    onChange={(e) => setIsGroupBusiness(e.target.checked)}
                    className="rounded accent-amber-400"
                  />
                  <div className="text-left">
                    <p className="text-xs font-black text-white">💼 Business & Trade Channel</p>
                    <p className="text-[9px] text-slate-400">Preserves all receipts & discussions permanently (exempt from 48h disappearing rule).</p>
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-300 transition-all cursor-pointer shadow-lg"
                >
                  Open Channel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
