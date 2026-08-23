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

  // Real Sanctuary community members loaded live from Firestore
  const [communityMembers, setCommunityMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);

  // Explore search filter
  const [exploreFilter, setExploreFilter] = useState('');

  // Friends & Requests state
  const [friends, setFriends] = useState<string[]>(() => {
    try {
      const uid = myUser?.uid || 'guest';
      const saved = localStorage.getItem(`sanctuary_friends_${uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [sentRequests, setSentRequests] = useState<string[]>(() => {
    try {
      const uid = myUser?.uid || 'guest';
      const saved = localStorage.getItem(`sanctuary_sent_reqs_${uid}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 1. Live stream real users from Firestore
  useEffect(() => {
    setLoadingMembers(true);
    let unsubUsers: (() => void) | null = null;

    try {
      unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const members: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Exclude current signed-in user
          if (docSnap.id === myUser?.uid) return;

          const name = data.displayName || data.name || (data.email ? data.email.split('@')[0] : 'Sanctuary Member');
          const initial = (name[0] || 'S').toUpperCase();
          const hasanat = Number(data.hasanat) || 0;
          const rank = data.rank || (hasanat > 500 ? 'Hafiz Candidate' : hasanat > 100 ? 'Devoted Seeker' : 'Sanctuary Seeker');
          const location = data.location || (data.country ? `${data.city ? data.city + ', ' : ''}${data.country}` : 'Sanctuary Global');
          const bio = data.bio || data.aboutMe || (data.email ? `Verified Member • ${data.email}` : 'Dedicated to daily Quran memorization and sunnah.');
          const online = data.isOnline !== undefined ? !!data.isOnline : true;

          const colorIndex = (name.charCodeAt(0) || 0) % 5;
          const bgColors = [
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
            'bg-amber-500/20 text-amber-400 border border-amber-500/30',
            'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
            'bg-purple-500/20 text-purple-400 border border-purple-500/30',
            'bg-teal-500/20 text-teal-400 border border-teal-500/30'
          ];

          members.push({
            id: docSnap.id,
            name,
            email: data.email || '',
            photoURL: data.photoURL || '',
            location,
            rank,
            bio,
            hasanat,
            avatarBg: bgColors[colorIndex],
            initial,
            online
          });
        });

        setCommunityMembers(members);
        setLoadingMembers(false);
      }, (err) => {
        console.warn("Firestore users stream error:", err);
        setLoadingMembers(false);
      });
    } catch (e) {
      console.warn("Could not attach users listener", e);
      setLoadingMembers(false);
    }

    return () => {
      if (unsubUsers) unsubUsers();
    };
  }, [myUser?.uid]);

  // 2. Real-time Firestore friend requests listener (Incoming & Sent)
  useEffect(() => {
    if (!myUser?.uid || myUser.uid.startsWith('local_')) {
      const uid = myUser?.uid || 'guest';
      const saved = localStorage.getItem(`sanctuary_received_reqs_${uid}`);
      if (saved) {
        try { setPendingRequests(JSON.parse(saved)); } catch {}
      }
      return;
    }

    // A. Incoming requests
    const qIncoming = query(
      collection(db, 'friend_requests'),
      where('toId', '==', myUser.uid),
      where('status', '==', 'pending')
    );

    const unsubIncoming = onSnapshot(qIncoming, (snap) => {
      const reqs: ChatRequest[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        reqs.push({
          id: docSnap.id,
          fromId: data.fromId,
          fromName: data.fromName || 'Sanctuary Member',
          fromPhoto: data.fromPhoto || '',
          toId: data.toId,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString())
        });
      });
      setPendingRequests(reqs);
    }, (err) => {
      console.warn("Incoming friend requests stream:", err);
    });

    // B. Sent requests
    const qSent = query(
      collection(db, 'friend_requests'),
      where('fromId', '==', myUser.uid),
      where('status', '==', 'pending')
    );

    const unsubSent = onSnapshot(qSent, (snap) => {
      const sentIds: string[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.toId) sentIds.push(data.toId);
      });
      setSentRequests(sentIds);
    }, (err) => {
      console.warn("Sent friend requests stream:", err);
    });

    return () => {
      unsubIncoming();
      unsubSent();
    };
  }, [myUser?.uid]);

  // Save friends & sent requests
  const saveFriends = (newFriends: string[]) => {
    setFriends(newFriends);
    const uid = myUser?.uid || 'guest';
    localStorage.setItem(`sanctuary_friends_${uid}`, JSON.stringify(newFriends));
  };

  const saveSentRequests = (newSent: string[]) => {
    setSentRequests(newSent);
    const uid = myUser?.uid || 'guest';
    localStorage.setItem(`sanctuary_sent_reqs_${uid}`, JSON.stringify(newSent));
  };

  const saveReceivedRequests = (newReqs: ChatRequest[]) => {
    setPendingRequests(newReqs);
    const uid = myUser?.uid || 'guest';
    localStorage.setItem(`sanctuary_received_reqs_${uid}`, JSON.stringify(newReqs));
  };

  // Send friend request
  const handleSendFriendRequest = async (member: any) => {
    if (!myUser?.uid) return;
    if (friends.includes(member.id) || sentRequests.includes(member.id)) return;

    const nextSent = [...sentRequests, member.id];
    saveSentRequests(nextSent);
    if (addHasanat) addHasanat(3);

    try {
      if (!myUser.uid.startsWith('local_')) {
        await addDoc(collection(db, 'friend_requests'), {
          fromId: myUser.uid,
          fromName: myUser.displayName || (myUser.email ? myUser.email.split('@')[0] : 'Sanctuary Member'),
          fromPhoto: myUser.photoURL || '',
          toId: member.id,
          toName: member.name,
          status: 'pending',
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn("Could not save friend request to Firestore, saved locally", e);
    }
  };

  // Cancel sent request
  const handleCancelSentRequest = async (memberId: string) => {
    const nextSent = sentRequests.filter(id => id !== memberId);
    saveSentRequests(nextSent);

    try {
      if (myUser?.uid && !myUser.uid.startsWith('local_')) {
        const q = query(
          collection(db, 'friend_requests'),
          where('fromId', '==', myUser.uid),
          where('toId', '==', memberId),
          where('status', '==', 'pending')
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await deleteDoc(doc(db, 'friend_requests', d.id));
        });
      }
    } catch (e) {
      console.warn("Could not cancel friend request in Firestore", e);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (req: ChatRequest) => {
    const nextFriends = Array.from(new Set([...friends, req.fromId]));
    saveFriends(nextFriends);
    
    const nextReqs = pendingRequests.filter(r => r.id !== req.id);
    saveReceivedRequests(nextReqs);

    try {
      if (req.id && !req.id.startsWith('req_')) {
        await updateDoc(doc(db, 'friend_requests', req.id), { status: 'accepted' });
      }
    } catch (e) {
      console.warn("Could not update friend request status", e);
    }

    // Create or open private chat room with this new friend
    const roomId = `private_${req.fromId}`;
    let existingRoom = rooms.find(r => r.id === roomId || (r.type === 'private' && r.name === req.fromName));

    if (!existingRoom) {
      existingRoom = {
        id: roomId,
        name: req.fromName,
        type: 'private',
        isBusiness: false,
        participants: [myUser?.uid || 'user', req.fromId],
        participantNames: {
          [req.fromId]: req.fromName,
          [myUser?.uid || 'user']: myUser?.displayName || 'Seeker'
        },
        lastMessage: '🤝 Friend request accepted! You are now connected in Habibi Chat.',
        updatedAt: new Date().toISOString()
      };
      const updatedRooms = [existingRoom, ...rooms];
      setRooms(updatedRooms);
      const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
      localStorage.setItem(localKey, JSON.stringify(updatedRooms));
    }

    setActiveRoom(existingRoom);
    setActiveTab('messages');
    setMobileViewState('chat');
    if (addHasanat) addHasanat(10);
  };

  // Decline request
  const handleDeclineRequest = async (reqId: string) => {
    const nextReqs = pendingRequests.filter(r => r.id !== reqId);
    saveReceivedRequests(nextReqs);

    try {
      if (reqId && !reqId.startsWith('req_')) {
        await deleteDoc(doc(db, 'friend_requests', reqId));
      }
    } catch (e) {
      console.warn("Could not delete declined friend request", e);
    }
  };

  // Start instant 1-on-1 private chat with any sanctuary member
  const handleStartDirectChat = (member: any) => {
    const roomId = `private_${member.id}`;
    let existing = rooms.find(r => r.id === roomId || (r.type === 'private' && r.name === member.name));

    if (!existing) {
      existing = {
        id: roomId,
        name: member.name,
        type: 'private',
        isBusiness: false,
        participants: [myUser?.uid || 'user', member.id],
        participantNames: {
          [member.id]: member.name,
          [myUser?.uid || 'user']: myUser?.displayName || 'Seeker'
        },
        lastMessage: 'As-salamu alaykum habibi! Let us share barakah and reflections.',
        updatedAt: new Date().toISOString()
      };
      const updatedRooms = [existing, ...rooms];
      setRooms(updatedRooms);
      const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
      localStorage.setItem(localKey, JSON.stringify(updatedRooms));
    }

    setActiveRoom(existing);
    setActiveTab('messages');
    setMobileViewState('chat');
  };

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
    <div className="flex h-[calc(100vh-140px)] min-h-[520px] md:h-[700px] bg-[#0c1317] rounded-3xl md:rounded-[2.5rem] border border-[#222e35] overflow-hidden shadow-2xl relative font-sans">
      
      {/* 1. Left Sidebar Panel (WhatsApp Left Chats Panel) */}
      <div className={`w-full md:w-84 border-r border-[#222e35] flex flex-col transition-all duration-300 bg-[#111b21] ${mobileViewState === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Habibi Chat Sidebar Header */}
        <div className="p-3.5 bg-[#202c33] flex items-center justify-between shrink-0 border-b border-[#222e35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] font-bold text-sm overflow-hidden">
              {myUser.photoURL ? (
                <img src={myUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                myUser.displayName?.[0] || 'U'
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e9edef] leading-tight flex items-center gap-1.5">
                <span>Habibi Chat</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#00a884]/20 text-[#00a884] rounded-full font-semibold border border-[#00a884]/30">Ummah</span>
              </h2>
              <p className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00a884] inline-block animate-pulse" />
                Online • {friends.length} Sanctuary Friends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 text-[#aebac1] hover:text-[#00a884] hover:bg-[#111b21] rounded-full transition-all cursor-pointer"
              title="New Channel / Group"
            >
              <Plus size={19} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2.5 bg-[#111b21] border-b border-[#222e35]">
          <div className="flex p-1 bg-[#202c33] rounded-xl">
            {[
              { id: 'messages', label: 'Chats', icon: MessageCircle },
              { id: 'ummah', label: 'Explore', icon: Globe },
              { id: 'requests', label: 'Requests', icon: Inbox, count: pendingRequests.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === tab.id 
                    ? 'bg-[#00a884] text-white shadow-md' 
                    : 'text-[#8696a0] hover:text-[#e9edef]'
                }`}
              >
                <tab.icon size={14} />
                <span className="text-[11px]">{tab.label}</span>
                {tab.count ? (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-black">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Chat List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/50 no-scrollbar">
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
                      className={`w-full text-left p-3.5 pr-10 transition-all flex items-center gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-[#2a3942]'
                          : 'hover:bg-[#202c33]/70 bg-transparent'
                      }`}
                    >
                      {/* WhatsApp Circle Avatar */}
                      <div className="relative w-12 h-12 rounded-full bg-[#202c33] border border-[#222e35] flex items-center justify-center shrink-0 overflow-hidden text-[#00a884]">
                        {room.type === 'business' || isBiz ? (
                          <Briefcase size={20} className="text-[#00a884]" />
                        ) : room.type === 'group' ? (
                          <Users size={20} className="text-[#00a884]" />
                        ) : (
                          getRoomPhoto(room) ? (
                            <img src={getRoomPhoto(room)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={20} className="text-[#8696a0]" />
                          )
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-xs md:text-sm text-[#e9edef] truncate">{getRoomName(room)}</p>
                          <span className="text-[10px] text-[#8696a0] shrink-0 font-medium">
                            {isBiz ? (
                              <span className="text-[9px] text-[#00a884] font-bold">💼 BIZ</span>
                            ) : (
                              'Now'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-xs text-[#8696a0] truncate">
                            {room.lastMessage || 'Tap to send a message...'}
                          </p>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-[#00a884] shrink-0" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Room Delete Trash Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoom(room, e)}
                      title="Delete conversation"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/room:opacity-100 text-[#8696a0] hover:text-red-400 hover:bg-[#111b21] transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}

              {rooms.length === 0 && (
                <div className="py-20 text-center text-[#8696a0]">
                  <MessageCircle size={36} className="mx-auto mb-2 opacity-30 text-[#00a884]" />
                  <p className="text-xs font-semibold">No chats yet</p>
                  <p className="text-[11px] opacity-70 mt-0.5">Click Explore to meet Habibi friends</p>
                </div>
              )}
            </>
          )}

          {/* Explore Sanctuary Community & Connect as Friends */}
          {activeTab === 'ummah' && (
            <div className="p-3 space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]" />
                <input
                  type="text"
                  value={exploreFilter}
                  onChange={(e) => setExploreFilter(e.target.value)}
                  placeholder="Search sanctuary members..."
                  className="w-full bg-[#202c33] text-xs text-[#e9edef] pl-8 pr-3 py-2 rounded-xl border border-[#222e35] focus:outline-none focus:border-[#00a884] placeholder-[#8696a0]"
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">
                  Sanctuary Members ({communityMembers.length})
                </p>
                <span className="text-[10px] text-[#00a884] font-medium">Connect & Chat</span>
              </div>
              
              <div className="space-y-2.5">
                {loadingMembers ? (
                  <div className="p-8 text-center text-[#8696a0] space-y-2">
                    <RotateCw size={22} className="animate-spin mx-auto text-[#00a884]" />
                    <p className="text-xs">Loading real Sanctuary members...</p>
                  </div>
                ) : communityMembers.length === 0 ? (
                  <div className="p-6 bg-[#202c33] rounded-2xl border border-[#222e35] text-center text-xs text-[#8696a0] space-y-2">
                    <Users size={28} className="mx-auto text-[#00a884] opacity-60" />
                    <p className="font-bold text-[#e9edef]">No other signed-in users yet</p>
                    <p className="text-[11px] text-[#8696a0] leading-relaxed">
                      As soon as other worshippers sign into the Sanctuary with their accounts, they will appear here live in real-time.
                    </p>
                  </div>
                ) : (
                  communityMembers
                    .filter(m => 
                      !exploreFilter || 
                      m.name.toLowerCase().includes(exploreFilter.toLowerCase()) ||
                      m.bio.toLowerCase().includes(exploreFilter.toLowerCase()) ||
                      m.location.toLowerCase().includes(exploreFilter.toLowerCase()) ||
                      m.email?.toLowerCase().includes(exploreFilter.toLowerCase())
                    )
                    .map(member => {
                      const isFriend = friends.includes(member.id);
                      const isSent = sentRequests.includes(member.id);

                      return (
                        <div key={member.id} className="p-3 bg-[#202c33] rounded-2xl border border-[#222e35] text-xs text-[#d1d7db] space-y-2.5 transition-all hover:border-[#00a884]/40">
                          <div className="flex items-start gap-2.5">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${member.avatarBg}`}>
                                {member.initial}
                              </div>
                              {member.online && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] border-2 border-[#202c33]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-[#e9edef] truncate">{member.name}</p>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#111b21] text-[#00a884] font-semibold shrink-0">
                                  {member.rank}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#8696a0]">{member.location}</p>
                              <p className="text-[11px] text-[#aebac1] mt-1 line-clamp-2 leading-relaxed">
                                {member.bio}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-[#111b21]/70">
                            {isFriend ? (
                              <button
                                onClick={() => handleStartDirectChat(member)}
                                className="flex-1 py-1.5 bg-[#00a884] hover:bg-[#009373] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <MessageCircle size={13} />
                                <span>Message Habibi</span>
                              </button>
                            ) : isSent ? (
                              <div className="flex-1 flex items-center gap-1.5">
                                <span className="flex-1 py-1.5 bg-[#111b21] text-[#8696a0] text-center text-xs font-semibold rounded-xl border border-[#222e35]">
                                  ⏳ Request Sent
                                </span>
                                <button
                                  onClick={() => handleCancelSentRequest(member.id)}
                                  className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-xl font-semibold transition-all cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleSendFriendRequest(member)}
                                  className="flex-1 py-1.5 bg-[#00a884] hover:bg-[#009373] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Users size={13} />
                                  <span>Add Friend</span>
                                </button>
                                <button
                                  onClick={() => handleStartDirectChat(member)}
                                  className="px-3 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-[#d1d7db] text-xs font-semibold rounded-xl border border-[#222e35] transition-all cursor-pointer"
                                >
                                  Chat
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* Requests Tab (Incoming & Outgoing & My Sanctuary Friends) */}
          {activeTab === 'requests' && (
            <div className="p-3 space-y-4">
              {/* Incoming Requests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">
                    Incoming Requests ({pendingRequests.length})
                  </p>
                  <span className="text-[9px] text-[#00a884] font-semibold">Action Required</span>
                </div>

                {pendingRequests.length > 0 ? (
                  <div className="space-y-2">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="p-3 bg-[#202c33] rounded-2xl border border-[#00a884]/30 space-y-2.5 text-xs text-[#d1d7db]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 text-[#00a884] flex items-center justify-center font-bold text-sm">
                            {req.fromName?.[0] || 'H'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#e9edef] truncate">{req.fromName}</p>
                            <p className="text-[10px] text-[#8696a0]">Wants to connect with you on Habibi Chat</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-[#111b21]">
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="flex-1 py-1.5 bg-[#00a884] hover:bg-[#009373] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check size={13} />
                            <span>Accept & Chat</span>
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            className="px-3 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-red-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#202c33]/50 rounded-2xl border border-[#222e35] text-center text-[#8696a0] text-xs">
                    <Inbox size={24} className="mx-auto mb-1 opacity-40 text-[#00a884]" />
                    <p className="font-medium text-[#d1d7db]">No pending incoming requests</p>
                    <p className="text-[10px] mt-0.5 opacity-80">Explore community members to connect</p>
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-2 pt-2 border-t border-[#222e35]">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">
                    Sent Requests ({sentRequests.length})
                  </p>
                  <span className="text-[9px] text-amber-400 font-medium">Pending Response</span>
                </div>

                {sentRequests.length > 0 ? (
                  <div className="space-y-1.5">
                    {sentRequests.map(sentId => {
                      const member = communityMembers.find(m => m.id === sentId) || {
                        id: sentId,
                        name: sentId.replace('member_', '').replace(/_/g, ' '),
                        location: 'Ummah Network',
                        initial: sentId[0]?.toUpperCase() || 'H'
                      };

                      return (
                        <div key={sentId} className="p-2.5 bg-[#202c33] rounded-xl border border-[#222e35] flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {member.initial || 'H'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-[#e9edef] truncate">{member.name}</p>
                              <p className="text-[9px] text-[#8696a0]">Request sent • Waiting</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleCancelSentRequest(sentId)}
                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold rounded-lg transition-all cursor-pointer shrink-0"
                          >
                            Cancel
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#8696a0] italic px-1">No outgoing requests sent yet.</p>
                )}
              </div>

              {/* My Sanctuary Friends List */}
              <div className="space-y-2 pt-2 border-t border-[#222e35]">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-[#8696a0] uppercase tracking-wider">
                    My Habibi Friends ({friends.length})
                  </p>
                  <span className="text-[9px] text-[#00a884] font-semibold">Connected</span>
                </div>

                <div className="space-y-1.5">
                  {friends.map(friendId => {
                    const member = communityMembers.find(m => m.id === friendId) || {
                      id: friendId,
                      name: friendId.replace('member_', '').replace('_', ' '),
                      location: 'Sanctuary Ummah',
                      avatarBg: 'bg-[#00a884]/20 text-[#00a884]',
                      initial: friendId[0]?.toUpperCase() || 'H'
                    };

                    return (
                      <div key={friendId} className="p-2.5 bg-[#202c33] rounded-xl border border-[#222e35] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.avatarBg || 'bg-[#00a884]/20 text-[#00a884]'}`}>
                            {member.initial || 'H'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#e9edef] truncate">{member.name}</p>
                            <p className="text-[9px] text-[#8696a0] truncate">{member.location}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartDirectChat(member)}
                          className="px-2.5 py-1 bg-[#00a884] hover:bg-[#009373] text-white font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <MessageCircle size={11} />
                          <span>Chat</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Window Area (WhatsApp Authentic Chat Room) */}
      <div className={`flex-1 flex flex-col relative transition-all duration-300 bg-[#0b141a] ${mobileViewState === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* WhatsApp Chat Room Top Header Bar */}
            <div className="p-3 px-4 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => {
                    setActiveRoom(null);
                    setMobileViewState('list');
                  }} 
                  className="md:hidden p-1.5 text-[#aebac1] hover:text-white rounded-full cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Contact Avatar with Online Dot */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#111b21] border border-[#222e35] flex items-center justify-center text-[#00a884] shrink-0 overflow-hidden font-bold">
                    {isBusinessRoom(activeRoom) ? (
                      <Briefcase size={20} className="text-[#00a884]" />
                    ) : getRoomPhoto(activeRoom) ? (
                      <img src={getRoomPhoto(activeRoom)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MessageCircle size={20} className="text-[#00a884]" />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] border-2 border-[#202c33]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-base font-bold text-[#e9edef] truncate">{getRoomName(activeRoom)}</h3>
                    {isBusinessRoom(activeRoom) ? (
                      <span className="px-2 py-0.5 rounded bg-[#00a884]/20 text-[#00a884] text-[9px] font-bold border border-[#00a884]/30 shrink-0">
                        💼 Business
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-[#182229] text-[#8696a0] text-[9px] font-medium border border-[#222e35] shrink-0 flex items-center gap-1">
                        <Clock size={9} className="text-[#ffe082]" /> 48h Disappearing
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-[#8696a0] truncate">
                    {isTyping ? (
                      <span className="text-[#00a884] font-medium">typing...</span>
                    ) : (
                      'online • tap for info'
                    )}
                  </p>
                </div>
              </div>

              {/* WhatsApp Header Action Icons */}
              <div className="flex items-center gap-1 shrink-0 text-[#aebac1]">
                {/* Search In Chat */}
                <button
                  onClick={() => setChatSearchOpen(!chatSearchOpen)}
                  className={`p-2 rounded-full hover:bg-[#111b21] transition-all cursor-pointer ${
                    chatSearchOpen ? 'text-[#00a884] bg-[#111b21]' : 'hover:text-[#e9edef]'
                  }`}
                  title="Search messages"
                >
                  <Search size={18} />
                </button>

                {/* Business / Ephemeral Toggle */}
                <button
                  onClick={handleToggleRoomBusinessMode}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isBusinessRoom(activeRoom)
                      ? 'bg-[#00a884]/20 text-[#00a884] border-[#00a884]/40 hover:bg-[#00a884]/30'
                      : 'bg-[#111b21] text-[#8696a0] border-[#222e35] hover:text-[#e9edef]'
                  }`}
                  title="Toggle Business mode"
                >
                  <Briefcase size={13} />
                  <span className="hidden sm:inline">{isBusinessRoom(activeRoom) ? 'Business Mode' : 'Make Business'}</span>
                </button>

                {/* Clear Chat Trash */}
                <button
                  onClick={handleClearChatHistory}
                  className="p-2 hover:text-red-400 hover:bg-[#111b21] rounded-full transition-all cursor-pointer"
                  title="Clear chat messages"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* In-Chat Search Drawer */}
            <AnimatePresence>
              {chatSearchOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-2.5 bg-[#202c33] border-b border-[#222e35] flex items-center gap-2 overflow-hidden shrink-0"
                >
                  <Search size={15} className="text-[#00a884] shrink-0 ml-2" />
                  <input
                    type="text"
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                    placeholder="Search in conversation..."
                    className="w-full bg-transparent text-xs text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                    autoFocus
                  />
                  {chatSearchTerm && (
                    <button onClick={() => setChatSearchTerm('')} className="text-[#8696a0] hover:text-white p-1">
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinned Announcement Bar */}
            {activeRoom.pinnedMessage && (
              <div className="px-4 py-2 bg-[#182229] border-b border-[#222e35] flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Pin size={13} className="text-[#00a884] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#00a884] uppercase mr-1">Pinned:</span>
                    <span className="text-[#d1d7db] truncate">{activeRoom.pinnedMessage.text}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePinMessage(activeRoom.pinnedMessage!)}
                  className="text-[#8696a0] hover:text-white text-[10px] font-semibold shrink-0 cursor-pointer underline"
                >
                  Unpin
                </button>
              </div>
            )}

            {/* WhatsApp Chat Wallpaper & Messages Feed */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 no-scrollbar relative"
              style={{
                backgroundColor: '#0b141a',
                backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px), radial-gradient(#1f2c34 1px, #0b141a 1px)`,
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px'
              }}
            >
              {/* WhatsApp Security & Ephemeral Notice Pill */}
              <div className="flex justify-center my-2">
                <div className="bg-[#182229] border border-[#222e35] text-[#ffe082] px-3.5 py-1.5 rounded-lg text-[10px] max-w-md text-center shadow-md flex items-center gap-1.5 leading-relaxed">
                  <Lock size={11} className="text-[#ffe082] shrink-0" />
                  <span>
                    Messages are end-to-end protected. {isBusinessRoom(activeRoom) ? 'Business records are preserved permanently.' : 'Standard messages auto-disappear after 48 hours.'}
                  </span>
                </div>
              </div>

              {/* WhatsApp Date Separator */}
              <div className="flex justify-center my-1">
                <span className="bg-[#182229] border border-[#222e35] text-[#8696a0] px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider shadow-sm">
                  Today
                </span>
              </div>

              {/* Messages Mapping */}
              {displayedMessages.map((msg) => {
                const isMe = msg.senderId === myUser.uid;
                const remainingHours = getMessageRemainingHours(msg, activeRoom);
                const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
                  >
                    <div className={`flex gap-1.5 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* WhatsApp Message Bubble */}
                      <div className="space-y-1">
                        <div
                          className={`p-2.5 md:p-3 text-[13px] leading-relaxed shadow-md relative ${
                            isMe
                              ? 'bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-xs'
                              : 'bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-xs'
                          }`}
                        >
                          {/* Sender Name in Group/Direct (for other senders) */}
                          {!isMe && (
                            <p className="text-[11px] font-bold text-[#00a884] mb-1">
                              {msg.senderName}
                            </p>
                          )}

                          {/* WhatsApp Replied Message Box */}
                          {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded-lg border-l-3 text-[11px] ${
                              isMe ? 'bg-[#025144] border-[#00a884] text-[#d1d7db]' : 'bg-[#111b21] border-[#00a884] text-[#8696a0]'
                            }`}>
                              <span className="font-bold text-[#00a884]">{msg.replyTo.senderName}</span>
                              <p className="truncate text-[10px] mt-0.5">{msg.replyTo.text}</p>
                            </div>
                          )}

                          {/* Image Attachment */}
                          {msg.imageUrl && (
                            <div className="relative group/media mb-1.5 rounded-xl overflow-hidden cursor-pointer" onClick={() => setLightboxImage(msg.imageUrl!)}>
                              <img src={msg.imageUrl} alt="Media" className="max-w-full rounded-xl max-h-64 object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold">
                                <ZoomIn size={16} />
                                <span>View Photo</span>
                              </div>
                            </div>
                          )}

                          {/* WhatsApp Style Voice Note Player */}
                          {msg.audioUrl && (
                            <div className={`p-2 rounded-xl flex items-center gap-3 mb-1 min-w-[200px] sm:min-w-[240px] ${
                              isMe ? 'bg-[#025144]' : 'bg-[#111b21]'
                            }`}>
                              <button
                                onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                                className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#009373] text-white flex items-center justify-center cursor-pointer transition-all shrink-0 shadow"
                              >
                                {playingAudioId === msg.id ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                              </button>
                              
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-1 h-3.5">
                                  {[35, 70, 95, 60, 40, 85, 100, 55, 70, 90, 45, 80].map((h, idx) => (
                                    <div 
                                      key={idx} 
                                      className={`flex-1 rounded-full ${
                                        playingAudioId === msg.id ? 'bg-[#00a884] animate-pulse' : 'bg-[#8696a0]'
                                      }`} 
                                      style={{ height: `${h}%` }} 
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-[#8696a0] font-mono">
                                  <span>0:0{msg.audioDuration || 4}</span>
                                  <Mic size={11} className="text-[#00a884]" />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="whitespace-pre-wrap select-text pr-8">{msg.text}</p>

                          {/* Timestamp & Double Blue Checkmark */}
                          <div className="flex items-center justify-end gap-1 mt-0.5 -mb-1 text-[10px] text-[#8696a0] select-none">
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
                            {isMe && (
                              <CheckCheck size={14} className="text-[#53bdeb]" />
                            )}
                          </div>
                        </div>

                        {/* WhatsApp Message Hover Actions Bar */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}>
                          <button
                            onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                            className="p-1 text-[#8696a0] hover:text-[#ffe082] bg-[#202c33] rounded-full shadow cursor-pointer"
                            title="React with emoji"
                          >
                            <Smile size={13} />
                          </button>

                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 text-[#8696a0] hover:text-[#00a884] bg-[#202c33] rounded-full shadow cursor-pointer"
                            title="Reply"
                          >
                            <CornerUpLeft size={13} />
                          </button>

                          <button
                            onClick={() => handleTogglePinMessage(msg)}
                            className="p-1 text-[#8696a0] hover:text-[#ffe082] bg-[#202c33] rounded-full shadow cursor-pointer"
                            title="Pin message"
                          >
                            <Pin size={13} />
                          </button>

                          {isMe && (
                            <button
                              onClick={(e) => handleDeleteMessage(msg, e)}
                              className="p-1 text-[#8696a0] hover:text-red-400 bg-[#202c33] rounded-full shadow cursor-pointer"
                              title="Delete message"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {/* Floating Emoji Picker Popover */}
                        <AnimatePresence>
                          {showEmojiPickerFor === msg.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.85 }}
                              className="flex items-center gap-1 p-1 bg-[#202c33] border border-[#222e35] rounded-full shadow-2xl z-30"
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

                        {/* WhatsApp Reaction Capsules */}
                        {hasReactions && (
                          <div className={`flex flex-wrap gap-1 pt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(msg.reactions!).map(([emoji, uids]) => (
                              <button
                                key={emoji}
                                onClick={() => handleToggleReaction(msg, emoji)}
                                className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border transition-all cursor-pointer shadow-sm ${
                                  uids.includes(myUser.uid)
                                    ? 'bg-[#005c4b] border-[#00a884] text-[#e9edef]'
                                    : 'bg-[#202c33] border-[#222e35] text-[#d1d7db]'
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-bold text-[10px] font-mono">{uids.length}</span>
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
                <div className="flex items-center gap-2 text-[#00a884] text-xs italic px-3 py-1">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Sister Yasmin is typing...</span>
                </div>
              )}
            </div>

            {/* WhatsApp Chat Input Bar */}
            <div className="p-2.5 sm:p-3 bg-[#202c33] border-t border-[#222e35] space-y-2 shrink-0">
              {/* Replying Banner */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 bg-[#111b21] border-l-4 border-[#00a884] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate text-[#d1d7db]">
                      <CornerUpLeft size={13} className="text-[#00a884] shrink-0" />
                      <span className="truncate">
                        Replying to <strong className="text-[#00a884]">{replyingTo.senderName}</strong>: "{replyingTo.text}"
                      </span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-[#8696a0] hover:text-white p-1">
                      <X size={13} />
                    </button>
                  </motion.div>
                )}

                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="relative w-18 h-18 rounded-xl overflow-hidden border-2 border-[#00a884] shadow-lg"
                  >
                    <img src={attachment} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setAttachment(null)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WhatsApp Rich Attachment Popup Drawer */}
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 bg-[#202c33] border border-[#222e35] rounded-2xl grid grid-cols-3 gap-2.5 text-xs shadow-2xl"
                  >
                    <button
                      onClick={() => handleShareDuaCard('Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.', 'Dua for Goodness in Both Worlds')}
                      className="p-2.5 rounded-xl bg-[#111b21] hover:bg-[#2a3942] text-[#d1d7db] border border-[#222e35] flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-[11px] font-semibold">Share Dua</span>
                    </button>

                    <button
                      onClick={handleShareMarketItem}
                      className="p-2.5 rounded-xl bg-[#111b21] hover:bg-[#2a3942] text-[#d1d7db] border border-[#222e35] flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                        <Briefcase size={18} />
                      </div>
                      <span className="text-[11px] font-semibold">Trade Card</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage(undefined, { text: '🕌 [Masjid Check-In] Performing Salah at the local congregation. Duas requested for the Ummah!' })}
                      className="p-2.5 rounded-xl bg-[#111b21] hover:bg-[#2a3942] text-[#d1d7db] border border-[#222e35] flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
                        <MapPin size={18} />
                      </div>
                      <span className="text-[11px] font-semibold">Check-In</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WhatsApp Input Controls Row */}
              <div className="flex items-center gap-2">
                {/* Voice Note Recording Indicator */}
                {isRecordingAudio ? (
                  <div className="flex-1 flex items-center justify-between p-2.5 bg-[#111b21] border border-red-500/40 rounded-full px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold text-red-400 font-mono">
                        Recording audio... 0:0{recordingSeconds}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelAudioRecording}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-[#8696a0] hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStopAudioRecording}
                        className="px-3.5 py-1 rounded-full bg-[#00a884] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                      >
                        <Send size={12} /> Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Attachment Clip Button */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="p-2 text-[#8696a0] hover:text-[#00a884] hover:bg-[#111b21] rounded-full transition-all cursor-pointer shrink-0"
                      title="Attach items"
                    >
                      <Paperclip size={20} />
                    </button>

                    {/* Image Attachment Button */}
                    <label className="p-2 text-[#8696a0] hover:text-[#00a884] hover:bg-[#111b21] rounded-full transition-all cursor-pointer shrink-0">
                      <ImageIcon size={20} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>

                    {/* Voice Dictation (Speech to text) */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                        isListening
                          ? 'bg-[#00a884] text-white animate-pulse'
                          : 'text-[#8696a0] hover:text-[#00a884] hover:bg-[#111b21]'
                      }`}
                      title="Speech to text"
                    >
                      <Mic size={20} />
                    </button>

                    {/* WhatsApp Pill Input Box */}
                    <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-[#2a3942] rounded-full px-4 py-2 text-xs">
                        <input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message"
                          className="w-full bg-transparent text-xs text-[#e9edef] outline-none placeholder:text-[#8696a0]"
                        />
                      </div>

                      {/* WhatsApp Floating Circular Action Button (Send / Mic) */}
                      {newMessage.trim() || attachment ? (
                        <button
                          type="submit"
                          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#009373] text-white flex items-center justify-center transition-all shadow-lg cursor-pointer shrink-0"
                          title="Send message"
                        >
                          <Send size={16} className="ml-0.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartAudioRecording}
                          className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#009373] text-white flex items-center justify-center transition-all shadow-lg cursor-pointer shrink-0"
                          title="Hold to record voice note"
                        >
                          <Mic size={18} />
                        </button>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4 bg-[#0b141a]">
            <div className="w-16 h-16 rounded-full bg-[#202c33] border border-[#222e35] flex items-center justify-center text-[#00a884] shadow-xl">
              <MessageCircle size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#e9edef]">WhatsApp for Sanctuary Ummah</h3>
              <p className="text-xs text-[#8696a0] max-w-xs mx-auto mt-1">
                Select a chat from the sidebar to send messages, voice notes, Duas, and trade cards.
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
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#111b21] border border-[#222e35] rounded-3xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#222e35] pb-3">
                <h3 className="text-base font-bold text-[#e9edef]">New Group / Community Chat</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-[#8696a0] hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider">Group Name</label>
                  <input
                    required
                    type="text"
                    value={newGroupName || ''}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Daily Fiqh Circle, Quran Study..."
                    className="w-full bg-[#202c33] border border-[#222e35] rounded-xl p-3 text-xs text-[#e9edef] outline-none focus:border-[#00a884]"
                  />
                </div>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#202c33] border border-[#222e35] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!isGroupBusiness}
                    onChange={(e) => setIsGroupBusiness(e.target.checked)}
                    className="rounded accent-[#00a884]"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-[#e9edef]">💼 Business & Trade Channel</p>
                    <p className="text-[10px] text-[#8696a0]">Preserves all receipts & transactions permanently (exempt from 48h disappearing rule).</p>
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#00a884] hover:bg-[#009373] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  Create WhatsApp Group
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
