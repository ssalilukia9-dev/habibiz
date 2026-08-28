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
  UserCheck,
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
  AlertCircle,
  HeartHandshake,
  Shield,
  Info,
  Layers,
  Heart
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
import FirdawsLogo from './FirdawsLogo';
import { MediaLightboxModal, LightboxMediaItem } from './MediaLightboxModal';

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
  isPartner?: boolean;
  verified?: boolean;
  description?: string;
  category?: string;
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
  const activeRoomRef = useRef<Room | null>(null);

  const selectActiveRoom = (room: Room | null) => {
    activeRoomRef.current = room;
    setActiveRoom(room);
  };

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ChatUserInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ChatRequest[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupCategory, setGroupCategory] = useState<'community' | 'quran' | 'business' | 'charity'>('community');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [memberSelectSearch, setMemberSelectSearch] = useState('');
  const [showRoomInfoModal, setShowRoomInfoModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [addMembersSelected, setAddMembersSelected] = useState<string[]>([]);
  const [addMembersSearch, setAddMembersSearch] = useState('');
  const [isGroupBusiness, setIsGroupBusiness] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mobileViewState, setMobileViewState] = useState<'list' | 'chat'>('list');

  // Media Lightbox Expansion State
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState<number>(0);
  const [lightboxFallbackUrl, setLightboxFallbackUrl] = useState<string | null>(null);

  const allChatMediaItems = React.useMemo(() => {
    return messages
      .filter(m => m.imageUrl)
      .map(m => ({
        url: m.imageUrl!,
        author: m.senderName,
        caption: m.text ? m.text : undefined,
        timestamp: m.timestamp?.toMillis 
          ? new Date(m.timestamp.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : (m.timestamp?.toDate ? new Date(m.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined)
      }));
  }, [messages]);

  const openMediaLightbox = (url: string) => {
    const idx = allChatMediaItems.findIndex(item => item.url === url);
    if (idx >= 0) {
      setLightboxActiveIndex(idx);
      setLightboxFallbackUrl(null);
    } else {
      setLightboxFallbackUrl(url);
      setLightboxActiveIndex(0);
    }
    setShowLightbox(true);
  };

  // In-Chat Search State
  const [chatSearchOpen, setChatSearchOpen] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  // Audio Voice Note Recording & Playback State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioPlaybackTime, setAudioPlaybackTime] = useState<number>(0);
  const [audioTotalDuration, setAudioTotalDuration] = useState<number>(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackTickerRef = useRef<any>(null);
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
    const myUid = myUser?.uid || 'user';
    const sorted = [myUid, req.fromId].sort();
    const roomId = `direct_${sorted.join('_')}`;
    let existingRoom = rooms.find(r => r.id === roomId || (r.type === 'private' && (r.id === `private_${req.fromId}` || r.name === req.fromName)));

    if (!existingRoom) {
      existingRoom = {
        id: roomId,
        name: req.fromName,
        type: 'private',
        isBusiness: false,
        participants: [myUid, req.fromId],
        participantNames: {
          [req.fromId]: req.fromName,
          [myUid]: myUser?.displayName || 'Seeker'
        },
        participantPhotos: {
          [req.fromId]: req.fromPhoto || '',
          [myUid]: myUser?.photoURL || ''
        },
        lastMessage: '🤝 Friend request accepted! You are now connected in Habibi Chat.',
        updatedAt: new Date().toISOString()
      };
      const updatedRooms = [existingRoom, ...rooms];
      setRooms(updatedRooms);
      const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
      localStorage.setItem(localKey, JSON.stringify(updatedRooms));

      // Persist to Firestore if authenticated
      if (myUser?.uid && !myUser.uid.startsWith('local_') && !myUser.isRest) {
        setDoc(doc(db, 'rooms', roomId), {
          id: roomId,
          name: req.fromName,
          type: 'private',
          isBusiness: false,
          participants: [myUid, req.fromId],
          participantNames: {
            [req.fromId]: req.fromName,
            [myUid]: myUser.displayName || 'Seeker'
          },
          participantPhotos: {
            [req.fromId]: req.fromPhoto || '',
            [myUid]: myUser.photoURL || ''
          },
          lastMessage: '🤝 Friend request accepted! You are now connected in Habibi Chat.',
          updatedAt: serverTimestamp(),
          createdBy: myUid
        }, { merge: true }).catch(err => console.warn("Could not save room to firestore:", err));
      }
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
    const myUid = myUser?.uid || 'user';
    const sorted = [myUid, member.id].sort();
    const roomId = `direct_${sorted.join('_')}`;
    let existing = rooms.find(r => r.id === roomId || (r.type === 'private' && (r.id === `private_${member.id}` || r.name === member.name)));

    if (!existing) {
      existing = {
        id: roomId,
        name: member.name,
        type: 'private',
        isBusiness: false,
        participants: [myUid, member.id],
        participantNames: {
          [member.id]: member.name,
          [myUid]: myUser?.displayName || 'Seeker'
        },
        participantPhotos: {
          [member.id]: member.photoURL || '',
          [myUid]: myUser?.photoURL || ''
        },
        lastMessage: 'As-salamu alaykum habibi! Let us share barakah and reflections.',
        updatedAt: new Date().toISOString()
      };
      const updatedRooms = [existing, ...rooms];
      setRooms(updatedRooms);
      const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
      localStorage.setItem(localKey, JSON.stringify(updatedRooms));

      // Persist to Firestore if authenticated
      if (myUser?.uid && !myUser.uid.startsWith('local_') && !myUser.isRest) {
        setDoc(doc(db, 'rooms', roomId), {
          id: roomId,
          name: member.name,
          type: 'private',
          isBusiness: false,
          participants: [myUid, member.id],
          participantNames: {
            [member.id]: member.name,
            [myUid]: myUser.displayName || 'Seeker'
          },
          participantPhotos: {
            [member.id]: member.photoURL || '',
            [myUid]: myUser.photoURL || ''
          },
          lastMessage: 'As-salamu alaykum habibi! Let us share barakah and reflections.',
          updatedAt: serverTimestamp(),
          createdBy: myUid
        }, { merge: true }).catch(err => console.warn("Could not save direct chat room to firestore:", err));
      }
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
    return room.type === 'business' || !!room.isBusiness || room.id === 'group_firdaws_charity';
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
    const firdausCharityRoom: Room = { 
      id: 'group_firdaws_charity', 
      name: 'Firdaus Charity Organisation', 
      type: 'group', 
      lastMessage: '🌟 Official Partner: Empowering Lives, Shaping Futures. Join community relief updates.',
      isBusiness: false,
      isPartner: true,
      verified: true,
      description: 'Official Strategic Humanitarian Partner Hub — Empowering Lives, Shaping Futures. Official informational broadcast channel for charity updates, clean water wells, orphan sponsorship, and humanitarian relief.',
      createdBy: 'partner_firdaus',
      participants: myUser?.uid ? [myUser.uid, 'partner_firdaus'] : ['partner_firdaus']
    };

    const defaultStarterRooms: Room[] = [
      firdausCharityRoom,
      { 
        id: 'group_general_circle', 
        name: 'General Sanctuary Circle', 
        type: 'group', 
        lastMessage: 'Reflections and community unity',
        description: 'A global sanctuary circle for Muslims worldwide to exchange daily Islamic reminders, barakah reflections, and du’as.',
        isBusiness: false 
      },
      { 
        id: 'group_quran_study', 
        name: 'Quran Study & Reflections', 
        type: 'group', 
        lastMessage: 'Sharing deep insights and ayah ponderings',
        description: 'Tafsir discussion, memorization accountability, and deep ponderings over the holy verses.',
        isBusiness: false 
      },
      { 
        id: 'group_market_trade', 
        name: 'Suq Al-Mubaraki Trade & Business', 
        type: 'business', 
        lastMessage: 'Permanent escrow and Halal commerce receipts',
        description: 'Halal marketplace coordination and commerce discussions with permanent record keeping.',
        isBusiness: true 
      }
    ];

    const isBogusOrOldFirdawsRoom = (r: Room) => {
      const name = (r.name || '').toLowerCase();
      const id = (r.id || '').toLowerCase();
      if (id === 'group_firdaws_charity') return false; // keep official room
      if (name.includes('dawa') || name.includes('firdaws') || name.includes('firdaus') || id.includes('dawa') || (id.includes('firdaws') && id !== 'group_firdaws_charity')) {
        return true;
      }
      return false;
    };

    if (!myUser || myUser.uid.startsWith('local_') || myUser.isRest) {
      const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
      const saved = localStorage.getItem(localKey);
      if (saved) {
        try {
          const parsed: Room[] = JSON.parse(saved);
          // Mandatory ensure Firdaus Charity Organisation group is present and pinned at top, filter out old dawa/firdaws rooms
          const otherRooms = parsed.filter(r => r.id !== 'group_firdaws_charity' && !isBogusOrOldFirdawsRoom(r));
          const merged = [firdausCharityRoom, ...otherRooms];
          setRooms(merged);
          if (!activeRoomRef.current && merged.length > 0) {
            selectActiveRoom(merged[0]);
          } else if (activeRoomRef.current) {
            const match = merged.find(r => r.id === activeRoomRef.current?.id);
            if (match) selectActiveRoom(match);
          }
          localStorage.setItem(localKey, JSON.stringify(merged));
        } catch (e) {
          setRooms(defaultStarterRooms);
          if (!activeRoomRef.current) selectActiveRoom(defaultStarterRooms[0]);
        }
      } else {
        setRooms(defaultStarterRooms);
        if (!activeRoomRef.current) selectActiveRoom(defaultStarterRooms[0]);
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

      const filteredOther = fetchedRooms.filter(r => r.id !== 'group_firdaws_charity' && !isBogusOrOldFirdawsRoom(r));
      defaultStarterRooms.forEach(sr => {
        if (sr.id !== 'group_firdaws_charity' && !filteredOther.some(r => r.id === sr.id)) {
          filteredOther.push(sr);
        }
      });

      // Mandatory Firdaus Charity Organisation group pinned at top for all users
      const finalRooms = [firdausCharityRoom, ...filteredOther];

      setRooms(finalRooms);
      
      // Preserve currently selected room during live Firestore room updates so user is NEVER abruptly kicked back
      if (!activeRoomRef.current && finalRooms.length > 0) {
        selectActiveRoom(finalRooms[0]);
      } else if (activeRoomRef.current) {
        const currentActiveId = activeRoomRef.current.id;
        const matching = finalRooms.find(r => r.id === currentActiveId);
        if (matching) {
          selectActiveRoom(matching);
        }
      }
      setLoading(false);
    }, (err) => {
      console.warn("Firestore rooms query error:", err);
      setRooms(defaultStarterRooms);
      if (!activeRoomRef.current) selectActiveRoom(defaultStarterRooms[0]);
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

    const isGuestOrLocalUser = !myUser || myUser.uid.startsWith('local_') || myUser.isRest;

    // Simulated seeker companion bots remain local
    if (isGuestOrLocalUser || activeRoom.id.startsWith('seeker_')) {
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
        let starterText = activeRoom.isBusiness || activeRoom.type === 'business'
          ? '💼 Welcome to this Business & Trade channel. All agreements, receipts, and order negotiations here are permanently preserved.'
          : '⏱️ Welcome to this Sanctuary Circle. To keep memory light and spiritual, standard messages automatically disappear after 48 hours.';
        let starterSender = 'Sanctuary Guide';

        if (activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner) {
          starterSender = 'Firdaus Charity Organisation';
          starterText = '🌟 Assalamu Alaikum wa Rahmatullahi wa Barakatuh!\n\nWelcome to the official Firdaus Charity Organisation global group hub.\n\n"Empowering Lives, Shaping Futures"\n\nIn partnership with Muslim Habibi and its young student founders Kizza Hamza & Lubowa Sudias, we share verified humanitarian relief updates, clean water borehole projects in Uganda and East Africa, orphan educational sponsorships, and community du’as. All members are welcome to join, post messages, collaborate, and share your support for the Ummah!';
        }

        const starter: Message = {
          id: 'starter_' + Date.now(),
          senderId: activeRoom.id === 'group_firdaws_charity' ? 'partner_firdaus' : 'system',
          senderName: starterSender,
          text: starterText,
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

    // Live real-time Firestore room messages (including global Firdaus Charity & 1-on-1 chats)
    const msgsQuery = query(
      collection(db, `rooms/${activeRoom.id}/messages`),
      orderBy('timestamp', 'asc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(msgsQuery, (snapshot) => {
      if (snapshot.empty && (activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner)) {
        const welcomeStarter: Message = {
          id: 'starter_firdaus_official',
          senderId: 'partner_firdaus',
          senderName: 'Firdaus Charity Organisation',
          text: '🌟 Assalamu Alaikum wa Rahmatullahi wa Barakatuh!\n\nWelcome to the official Firdaus Charity Organisation global group hub.\n\n"Empowering Lives, Shaping Futures"\n\nIn partnership with Muslim Habibi and student founders Kizza Hamza & Lubowa Sudias, this is our global community space for humanitarian relief updates, water well projects, orphan sponsorship, and community du’as. All members are welcome to share messages and support each other!',
          timestamp: new Date().toISOString(),
          isBusiness: false
        };
        setMessages([welcomeStarter]);
      } else {
        const fetched: Message[] = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as Message[];

        // Filter out messages older than 48 hours for non-business chats
        const filtered = fetched.filter(m => !isMessageExpired(m, activeRoom));
        setMessages(filtered);
      }

      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }, (err) => {
      console.warn("Firestore messages fetch error:", err);
    });

    return () => unsubscribe();
  }, [activeRoom?.id, activeRoom?.isBusiness, activeRoom?.type, myUser?.uid]);

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

    // If local guest user or simulated companion
    const isGuestOrLocal = !myUser || myUser.uid.startsWith('local_') || myUser.isRest || activeRoom.id.startsWith('seeker_');

    if (isGuestOrLocal) {
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

    // Real-time Firestore send
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
      await setDoc(doc(db, 'rooms', activeRoom.id), {
        id: activeRoom.id,
        name: activeRoom.name || 'Sanctuary Room',
        type: activeRoom.type || 'group',
        lastMessage: previewText,
        lastSenderId: myUser.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });
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

  // Playback of Voice Notes
  const handlePlayVoiceNote = (msgId: string, audioUrl?: string, defaultDuration: number = 4) => {
    if (playingAudioId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      if (playbackTickerRef.current) {
        clearInterval(playbackTickerRef.current);
        playbackTickerRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (playbackTickerRef.current) {
      clearInterval(playbackTickerRef.current);
      playbackTickerRef.current = null;
    }

    setPlayingAudioId(msgId);
    setAudioPlaybackTime(0);
    setAudioTotalDuration(defaultDuration);

    if (audioUrl && audioUrl.startsWith('data:audio')) {
      try {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setAudioTotalDuration(Math.round(audio.duration));
          }
        };

        audio.ontimeupdate = () => {
          setAudioPlaybackTime(Math.floor(audio.currentTime));
        };

        audio.onended = () => {
          setPlayingAudioId(null);
          setAudioPlaybackTime(0);
          currentAudioRef.current = null;
        };

        audio.play().catch(err => {
          console.warn("HTML5 audio playback error, falling back to simulated playback:", err);
          startFallbackPlayback(msgId, defaultDuration);
        });
      } catch {
        startFallbackPlayback(msgId, defaultDuration);
      }
    } else {
      startFallbackPlayback(msgId, defaultDuration);
    }
  };

  const startFallbackPlayback = (msgId: string, duration: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}

    let elapsed = 0;
    playbackTickerRef.current = setInterval(() => {
      elapsed += 1;
      setAudioPlaybackTime(elapsed);
      if (elapsed >= duration) {
        clearInterval(playbackTickerRef.current);
        playbackTickerRef.current = null;
        setPlayingAudioId(null);
        setAudioPlaybackTime(0);
      }
    }, 1000);
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

  // Create Group with Selected Participants
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !myUser) return;

    const allParticipantUids = Array.from(new Set([myUser.uid, ...selectedGroupMembers]));
    
    // Map participant names and photos
    const participantNames: { [uid: string]: string } = {
      [myUser.uid]: myUser.displayName || 'You'
    };
    const participantPhotos: { [uid: string]: string } = {
      [myUser.uid]: myUser.photoURL || ''
    };

    allParticipantUids.forEach(uid => {
      const member = communityMembers.find(m => m.id === uid);
      if (member) {
        participantNames[uid] = member.name;
        if (member.photoURL) participantPhotos[uid] = member.photoURL;
      }
    });

    const isBiz = isGroupBusiness || groupCategory === 'business';

    const newRoom: Room = {
      id: 'group_' + Date.now(),
      name: newGroupName.trim(),
      description: groupDescription.trim() || undefined,
      category: groupCategory,
      type: isBiz ? 'business' : 'group',
      isBusiness: isBiz,
      participants: allParticipantUids,
      participantNames,
      participantPhotos,
      updatedAt: new Date().toISOString(),
      createdBy: myUser.uid,
      lastMessage: isBiz 
        ? `💼 Business Channel Opened with ${allParticipantUids.length} member(s)` 
        : `Group created with ${allParticipantUids.length} member(s)`
    };

    setRooms(prev => [newRoom, ...prev]);
    setActiveRoom(newRoom);
    setShowCreateGroup(false);
    setNewGroupName('');
    setGroupDescription('');
    setSelectedGroupMembers([]);
    setIsGroupBusiness(false);
    setGroupCategory('community');

    // Local persistence
    const localKey = `sanctuary_rooms_${myUser?.uid || 'guest'}`;
    try {
      const existingSaved = JSON.parse(localStorage.getItem(localKey) || '[]');
      localStorage.setItem(localKey, JSON.stringify([newRoom, ...existingSaved]));
    } catch {}

    if (!myUser.uid.startsWith('local_') && !myUser.isRest) {
      try {
        const roomDocRef = await addDoc(collection(db, 'rooms'), {
          name: newRoom.name,
          description: newRoom.description || '',
          category: newRoom.category || 'community',
          type: newRoom.type,
          isBusiness: newRoom.isBusiness,
          participants: allParticipantUids,
          participantNames,
          participantPhotos,
          updatedAt: serverTimestamp(),
          createdBy: myUser.uid,
          lastMessage: newRoom.lastMessage
        });

        // Add inaugural message
        await addDoc(collection(db, `rooms/${roomDocRef.id}/messages`), {
          senderId: myUser.uid,
          senderName: myUser.displayName || 'Group Creator',
          text: `👋 Assalamu Alaikum! Welcome everyone to "${newRoom.name}". This group has ${allParticipantUids.length} participant(s).`,
          timestamp: serverTimestamp(),
          isBusiness: newRoom.isBusiness
        });
      } catch (e) {
        console.warn("Could not persist group room to Firestore:", e);
      }
    }
  };

  // Add more members to the currently active group
  const handleAddMembersToActiveRoom = async () => {
    if (
      !activeRoom || 
      addMembersSelected.length === 0 || 
      !myUser || 
      activeRoom.id === 'group_firdaws_charity' || 
      activeRoom.isPartner || 
      activeRoom.name?.toLowerCase().includes('firdauws') || 
      activeRoom.name?.toLowerCase().includes('firdaus')
    ) {
      setShowAddMembersModal(false);
      setAddMembersSelected([]);
      return;
    }
    
    const existingParticipants = activeRoom.participants || [myUser.uid];
    const updatedParticipants = Array.from(new Set([...existingParticipants, ...addMembersSelected]));
    
    const updatedNames = { ...(activeRoom.participantNames || {}) };
    const updatedPhotos = { ...(activeRoom.participantPhotos || {}) };
    
    addMembersSelected.forEach(uid => {
      const member = communityMembers.find(m => m.id === uid);
      if (member) {
        updatedNames[uid] = member.name;
        if (member.photoURL) updatedPhotos[uid] = member.photoURL;
      }
    });

    const updatedRoom: Room = {
      ...activeRoom,
      participants: updatedParticipants,
      participantNames: updatedNames,
      participantPhotos: updatedPhotos,
      lastMessage: `Added ${addMembersSelected.length} new participant(s)`
    };

    setActiveRoom(updatedRoom);
    setRooms(prev => prev.map(r => r.id === activeRoom.id ? updatedRoom : r));
    setShowAddMembersModal(false);
    setAddMembersSelected([]);

    if (!myUser.uid.startsWith('local_') && !myUser.isRest && !activeRoom.id.startsWith('group_firdaws') && !activeRoom.id.startsWith('group_general')) {
      try {
        await updateDoc(doc(db, 'rooms', activeRoom.id), {
          participants: updatedParticipants,
          participantNames: updatedNames,
          participantPhotos: updatedPhotos,
          updatedAt: serverTimestamp(),
          lastMessage: updatedRoom.lastMessage
        });

        await addDoc(collection(db, `rooms/${activeRoom.id}/messages`), {
          senderId: 'system',
          senderName: 'System',
          text: `👥 ${myUser.displayName || 'A participant'} added ${addMembersSelected.length} new member(s) to this group.`,
          timestamp: serverTimestamp(),
          isBusiness: activeRoom.isBusiness
        });
      } catch (err) {
        console.warn("Could not update room participants in Firestore:", err);
      }
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
    <div className="flex h-[calc(100vh-140px)] min-h-[520px] md:h-[700px] bg-brand-depth rounded-3xl md:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative font-sans w-full max-w-full min-w-0">
      
      {/* 1. Left Sidebar Panel (WhatsApp Left Chats Panel) */}
      <div className={`w-full md:w-80 lg:w-84 border-r border-white/10 flex flex-col transition-all duration-300 bg-brand-sidebar shrink-0 ${mobileViewState === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Habibi Chat Sidebar Header */}
        <div className="p-3.5 bg-brand-depth/60 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary font-bold text-sm overflow-hidden">
              {myUser.photoURL ? (
                <img src={myUser.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                myUser.displayName?.[0] || 'U'
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-text leading-tight flex items-center gap-1.5">
                <span>Habibi Chat</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-brand-primary/20 text-brand-primary rounded-full font-semibold border border-brand-primary/30">Ummah</span>
              </h2>
              <p className="text-[10px] text-brand-primary font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-primary inline-block animate-pulse" />
                Online • {friends.length} Sanctuary Friends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 text-app-text-muted hover:text-brand-primary hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title="New Channel / Group"
            >
              <Plus size={19} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2.5 bg-brand-sidebar/80 border-b border-white/10">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
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
                    ? 'bg-brand-primary text-brand-depth shadow-md' 
                    : 'text-app-text-muted hover:text-app-text'
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
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar">
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
                          ? 'bg-brand-primary/15 border-l-2 border-brand-primary'
                          : 'hover:bg-white/5 bg-transparent'
                      }`}
                    >
                      {/* WhatsApp Circle Avatar */}
                      <div className={`relative w-12 h-12 rounded-full border flex items-center justify-center shrink-0 overflow-hidden ${
                        room.id === 'group_firdaws_charity' || room.isPartner
                          ? 'bg-emerald-950/80 border-brand-primary/50 text-brand-primary p-1.5'
                          : 'bg-white/5 border-white/10 text-brand-primary'
                      }`}>
                        {room.id === 'group_firdaws_charity' || room.isPartner ? (
                          <FirdawsLogo variant="icon" size="sm" dark={true} className="w-full h-full object-contain" />
                        ) : room.type === 'business' || isBiz ? (
                          <Briefcase size={20} className="text-brand-primary" />
                        ) : room.type === 'group' ? (
                          <Users size={20} className="text-brand-primary" />
                        ) : (
                          getRoomPhoto(room) ? (
                            <img src={getRoomPhoto(room)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={20} className="text-app-text-dim" />
                          )
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <p className="font-semibold text-xs md:text-sm text-app-text truncate">{getRoomName(room)}</p>
                            {room.verified || room.id === 'group_firdaws_charity' || room.isPartner ? (
                              <span className="shrink-0 text-brand-primary" title="Verified Official Partner">
                                <ShieldCheck size={13} className="fill-brand-primary/20 text-brand-primary" />
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-app-text-dim shrink-0 font-medium">
                            {room.id === 'group_firdaws_charity' || room.isPartner ? (
                              <span className="text-[9px] px-1.5 py-0.2 bg-brand-primary/20 text-brand-accent rounded font-bold border border-brand-primary/40">
                                PARTNER
                              </span>
                            ) : isBiz ? (
                              <span className="text-[9px] text-brand-primary font-bold">💼 BIZ</span>
                            ) : room.type === 'group' && room.participants && room.participants.length > 1 ? (
                              <span className="text-[9px] text-app-text-dim">{room.participants.length} members</span>
                            ) : (
                              'Now'
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-xs text-app-text-muted truncate">
                            {room.lastMessage || 'Tap to send a message...'}
                          </p>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Room Delete Trash Icon */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoom(room, e)}
                      title="Delete conversation"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover/room:opacity-100 text-app-text-dim hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}

              {rooms.length === 0 && (
                <div className="py-20 text-center text-app-text-dim">
                  <MessageCircle size={36} className="mx-auto mb-2 opacity-30 text-brand-primary" />
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
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-dim" />
                <input
                  type="text"
                  value={exploreFilter}
                  onChange={(e) => setExploreFilter(e.target.value)}
                  placeholder="Search sanctuary members..."
                  className="w-full bg-white/5 text-xs text-app-text pl-8 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-brand-primary placeholder:text-app-text-dim"
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold text-app-text-dim uppercase tracking-wider">
                  Sanctuary Members ({communityMembers.length})
                </p>
                <span className="text-[10px] text-brand-primary font-medium">Connect & Chat</span>
              </div>
              
              <div className="space-y-2.5">
                {loadingMembers ? (
                  <div className="p-8 text-center text-app-text-dim space-y-2">
                    <RotateCw size={22} className="animate-spin mx-auto text-brand-primary" />
                    <p className="text-xs">Loading real Sanctuary members...</p>
                  </div>
                ) : communityMembers.length === 0 ? (
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center text-xs text-app-text-muted space-y-2">
                    <Users size={28} className="mx-auto text-brand-primary opacity-60" />
                    <p className="font-bold text-app-text">No other signed-in users yet</p>
                    <p className="text-[11px] text-app-text-muted leading-relaxed">
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
                        <div key={member.id} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-app-text-muted space-y-2.5 transition-all hover:border-brand-primary/40">
                          <div className="flex items-start gap-2.5">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${member.avatarBg}`}>
                                {member.initial}
                              </div>
                              {member.online && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-brand-sidebar" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-app-text truncate">{member.name}</p>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-brand-depth text-brand-primary font-semibold shrink-0">
                                  {member.rank}
                                </span>
                              </div>
                              <p className="text-[10px] text-app-text-dim">{member.location}</p>
                              <p className="text-[11px] text-app-text-muted mt-1 line-clamp-2 leading-relaxed">
                                {member.bio}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                            {isFriend ? (
                              <button
                                onClick={() => handleStartDirectChat(member)}
                                className="flex-1 py-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-depth font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <MessageCircle size={13} />
                                <span>Message Habibi</span>
                              </button>
                            ) : isSent ? (
                              <div className="flex-1 flex items-center gap-1.5">
                                <span className="flex-1 py-1.5 bg-white/5 text-app-text-dim text-center text-xs font-semibold rounded-xl border border-white/10">
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
                                  className="flex-1 py-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-depth font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Users size={13} />
                                  <span>Add Friend</span>
                                </button>
                                <button
                                  onClick={() => handleStartDirectChat(member)}
                                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-app-text text-xs font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
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
                  <p className="text-[10px] font-bold text-app-text-dim uppercase tracking-wider">
                    Incoming Requests ({pendingRequests.length})
                  </p>
                  <span className="text-[9px] text-brand-primary font-semibold">Action Required</span>
                </div>

                {pendingRequests.length > 0 ? (
                  <div className="space-y-2">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="p-3 bg-white/5 rounded-2xl border border-brand-primary/30 space-y-2.5 text-xs text-app-text">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/20 border border-brand-primary/40 text-brand-primary flex items-center justify-center font-bold text-sm">
                            {req.fromName?.[0] || 'H'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-app-text truncate">{req.fromName}</p>
                            <p className="text-[10px] text-app-text-dim">Wants to connect with you on Habibi Chat</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="flex-1 py-1.5 bg-brand-primary hover:bg-brand-secondary text-brand-depth font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check size={13} />
                            <span>Accept & Chat</span>
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-app-text-dim hover:text-red-400 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center text-app-text-dim text-xs">
                    <Inbox size={24} className="mx-auto mb-1 opacity-40 text-brand-primary" />
                    <p className="font-medium text-app-text">No pending incoming requests</p>
                    <p className="text-[10px] mt-0.5 opacity-80">Explore community members to connect</p>
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-app-text-dim uppercase tracking-wider">
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
                        <div key={sentId} className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {member.initial || 'H'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-xs text-app-text truncate">{member.name}</p>
                              <p className="text-[9px] text-app-text-dim">Request sent • Waiting</p>
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
                  <p className="text-[11px] text-app-text-dim italic px-1">No outgoing requests sent yet.</p>
                )}
              </div>

              {/* My Sanctuary Friends List */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold text-app-text-dim uppercase tracking-wider">
                    My Habibi Friends ({friends.length})
                  </p>
                  <span className="text-[9px] text-brand-primary font-semibold">Connected</span>
                </div>

                <div className="space-y-1.5">
                  {friends.map(friendId => {
                    const member = communityMembers.find(m => m.id === friendId) || {
                      id: friendId,
                      name: friendId.replace('member_', '').replace('_', ' '),
                      location: 'Sanctuary Ummah',
                      avatarBg: 'bg-brand-primary/20 text-brand-primary',
                      initial: friendId[0]?.toUpperCase() || 'H'
                    };

                    return (
                      <div key={friendId} className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${member.avatarBg || 'bg-brand-primary/20 text-brand-primary'}`}>
                            {member.initial || 'H'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-app-text truncate">{member.name}</p>
                            <p className="text-[9px] text-app-text-dim truncate">{member.location}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartDirectChat(member)}
                          className="px-2.5 py-1 bg-brand-primary hover:bg-brand-secondary text-brand-depth font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
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
      <div className={`flex-1 min-w-0 w-full flex flex-col relative transition-all duration-300 bg-brand-depth overflow-hidden ${mobileViewState === 'list' ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* WhatsApp Chat Room Top Header Bar */}
            <div className="p-3 px-4 bg-brand-sidebar/95 border-b border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-md backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => {
                    setActiveRoom(null);
                    setMobileViewState('list');
                  }} 
                  className="md:hidden p-1.5 text-app-text-muted hover:text-white rounded-full cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>

                {/* Contact Avatar with Online Dot */}
                <button 
                  onClick={() => setShowRoomInfoModal(true)}
                  className="relative group/avatar cursor-pointer text-left focus:outline-none"
                >
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 overflow-hidden font-bold ${
                    activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner
                      ? 'bg-emerald-950/80 border-brand-primary/50 text-brand-primary p-1'
                      : 'bg-white/5 border-white/10 text-brand-primary'
                  }`}>
                    {activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner ? (
                      <FirdawsLogo variant="icon" size="sm" dark={true} className="w-full h-full object-contain" />
                    ) : isBusinessRoom(activeRoom) ? (
                      <Briefcase size={20} className="text-brand-primary" />
                    ) : getRoomPhoto(activeRoom) ? (
                      <img src={getRoomPhoto(activeRoom)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={20} className="text-brand-primary" />
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-brand-sidebar" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowRoomInfoModal(true)}
                      className="text-sm md:text-base font-bold text-app-text truncate hover:text-brand-primary transition-colors cursor-pointer text-left"
                    >
                      {getRoomName(activeRoom)}
                    </button>
                    {activeRoom.verified || activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner ? (
                      <span className="text-brand-primary shrink-0" title="Verified Strategic Partner">
                        <ShieldCheck size={14} className="fill-brand-primary/20 text-brand-primary" />
                      </span>
                    ) : null}
                    {activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner ? (
                      <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-accent text-[9px] font-bold border border-brand-primary/40 shrink-0">
                        ★ GLOBAL PARTNER
                      </span>
                    ) : isBusinessRoom(activeRoom) ? (
                      <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary text-[9px] font-bold border border-brand-primary/30 shrink-0">
                        💼 Business
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-white/5 text-app-text-dim text-[9px] font-medium border border-white/10 shrink-0 flex items-center gap-1">
                        <Clock size={9} className="text-amber-400" /> 48h Disappearing
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setShowRoomInfoModal(true)}
                    className="text-[11px] text-app-text-muted truncate hover:text-app-text text-left cursor-pointer flex items-center gap-1.5"
                  >
                    {isTyping ? (
                      <span className="text-brand-primary font-medium">typing...</span>
                    ) : activeRoom.participants && activeRoom.participants.length > 1 ? (
                      <span>{activeRoom.participants.length} participants • tap for group info</span>
                    ) : (
                      'online • tap for info'
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp Header Action Icons */}
              <div className="flex items-center gap-1 shrink-0 text-app-text-muted">
                {/* Add Members to Group button - hidden for Firdauws Charity Organisation official hub */}
                {activeRoom.type === 'group' && 
                 activeRoom.id !== 'group_firdaws_charity' && 
                 !activeRoom.isPartner && 
                 !activeRoom.name?.toLowerCase().includes('firdauws') && 
                 !activeRoom.name?.toLowerCase().includes('firdaus') && (
                  <button
                    onClick={() => {
                      setAddMembersSelected([]);
                      setAddMembersSearch('');
                      setShowAddMembersModal(true);
                    }}
                    className="p-2 rounded-full hover:bg-white/5 text-brand-primary hover:text-brand-accent transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Add users to this group"
                  >
                    <UserPlus size={18} />
                    <span className="hidden sm:inline text-[11px]">Add Members</span>
                  </button>
                )}

                {/* Group / Room Info button */}
                <button
                  onClick={() => setShowRoomInfoModal(true)}
                  className="p-2 rounded-full hover:bg-white/5 hover:text-app-text transition-all cursor-pointer"
                  title="Group Info & Members"
                >
                  <Info size={18} />
                </button>
                {/* Search In Chat */}
                <button
                  onClick={() => setChatSearchOpen(!chatSearchOpen)}
                  className={`p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer ${
                    chatSearchOpen ? 'text-brand-primary bg-white/10' : 'hover:text-app-text'
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
                      ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/40 hover:bg-brand-primary/30'
                      : 'bg-white/5 text-app-text-dim border-white/10 hover:text-app-text'
                  }`}
                  title="Toggle Business mode"
                >
                  <Briefcase size={13} />
                  <span className="hidden sm:inline">{isBusinessRoom(activeRoom) ? 'Business Mode' : 'Make Business'}</span>
                </button>

                {/* Clear Chat Trash */}
                <button
                  onClick={handleClearChatHistory}
                  className="p-2 hover:text-red-400 hover:bg-white/5 rounded-full transition-all cursor-pointer"
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
                  className="p-2.5 bg-brand-depth border-b border-white/10 flex items-center gap-2 overflow-hidden shrink-0"
                >
                  <Search size={15} className="text-brand-primary shrink-0 ml-2" />
                  <input
                    type="text"
                    value={chatSearchTerm}
                    onChange={(e) => setChatSearchTerm(e.target.value)}
                    placeholder="Search in conversation..."
                    className="w-full bg-transparent text-xs text-app-text outline-none placeholder:text-app-text-dim"
                    autoFocus
                  />
                  {chatSearchTerm && (
                    <button onClick={() => setChatSearchTerm('')} className="text-app-text-dim hover:text-white p-1">
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pinned Announcement Bar */}
            {activeRoom.pinnedMessage && (
              <div className="px-4 py-2 bg-brand-primary/10 border-b border-brand-primary/20 flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Pin size={13} className="text-brand-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-brand-primary uppercase mr-1">Pinned:</span>
                    <span className="text-app-text truncate">{activeRoom.pinnedMessage.text}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleTogglePinMessage(activeRoom.pinnedMessage!)}
                  className="text-app-text-dim hover:text-white text-[10px] font-semibold shrink-0 cursor-pointer underline"
                >
                  Unpin
                </button>
              </div>
            )}

            {/* WhatsApp Chat Wallpaper & Messages Feed */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 no-scrollbar relative bg-brand-depth"
              style={{
                backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            >
              {/* WhatsApp Security & Ephemeral Notice Pill */}
              <div className="flex justify-center my-2">
                <div className="bg-white/5 border border-white/10 text-brand-accent px-3.5 py-1.5 rounded-lg text-[10px] max-w-md text-center shadow-md flex items-center gap-1.5 leading-relaxed backdrop-blur-md">
                  <Lock size={11} className="text-brand-accent shrink-0" />
                  <span>
                    Messages are end-to-end protected. {isBusinessRoom(activeRoom) ? 'Business records are preserved permanently.' : 'Standard messages auto-disappear after 48 hours.'}
                  </span>
                </div>
              </div>

              {/* WhatsApp Date Separator */}
              <div className="flex justify-center my-1">
                <span className="bg-white/5 border border-white/10 text-app-text-muted px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider shadow-sm">
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
                              ? 'bg-brand-primary/25 border border-brand-primary/35 text-app-text rounded-2xl rounded-tr-xs backdrop-blur-sm'
                              : 'bg-white/10 border border-white/10 text-app-text rounded-2xl rounded-tl-xs backdrop-blur-sm'
                          }`}
                        >
                          {/* Sender Name in Group/Direct (for other senders) */}
                          {!isMe && (
                            <p className="text-[11px] font-bold text-brand-primary mb-1">
                              {msg.senderName}
                            </p>
                          )}

                          {/* WhatsApp Replied Message Box */}
                          {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded-lg border-l-3 text-[11px] ${
                              isMe ? 'bg-brand-primary/20 border-brand-primary text-app-text' : 'bg-black/30 border-brand-accent text-app-text-muted'
                            }`}>
                              <span className="font-bold text-brand-primary">{msg.replyTo.senderName}</span>
                              <p className="truncate text-[10px] mt-0.5">{msg.replyTo.text}</p>
                            </div>
                          )}

                          {/* Image Attachment */}
                          {msg.imageUrl && (
                            <div className="relative group/media mb-1.5 rounded-xl overflow-hidden cursor-pointer" onClick={() => openMediaLightbox(msg.imageUrl!)}>
                              <img src={msg.imageUrl} alt="Media" className="max-w-full rounded-xl max-h-64 object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold">
                                <ZoomIn size={16} />
                                <span>Expand Media</span>
                              </div>
                            </div>
                          )}

                          {/* WhatsApp Style Voice Note Player */}
                          {msg.audioUrl && (
                            <div className={`p-2.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 mb-1.5 min-w-[190px] max-w-full sm:min-w-[240px] shadow-sm ${
                              isMe ? 'bg-brand-primary/20 border border-brand-primary/30' : 'bg-black/30 border border-white/10'
                            }`}>
                              <button
                                onClick={() => handlePlayVoiceNote(msg.id, msg.audioUrl, msg.audioDuration || 5)}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary hover:bg-brand-secondary text-brand-depth flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-md active:scale-95"
                                title={playingAudioId === msg.id ? "Pause Voice Note" : "Play Voice Note"}
                              >
                                {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                              </button>
                              
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-0.5 sm:gap-1 h-4 cursor-pointer" onClick={() => handlePlayVoiceNote(msg.id, msg.audioUrl, msg.audioDuration || 5)}>
                                  {[25, 60, 90, 45, 75, 100, 50, 85, 40, 95, 65, 30, 80, 55, 90, 35].map((h, idx) => {
                                    const totalBars = 16;
                                    const activeRatio = (playingAudioId === msg.id && audioTotalDuration > 0)
                                      ? (audioPlaybackTime / audioTotalDuration)
                                      : 0;
                                    const barRatio = idx / totalBars;
                                    const isPassed = barRatio <= activeRatio;

                                    return (
                                      <div 
                                        key={idx} 
                                        className={`flex-1 rounded-full transition-all duration-150 ${
                                          isPassed 
                                            ? 'bg-brand-primary' 
                                            : playingAudioId === msg.id 
                                              ? 'bg-brand-primary/40 animate-pulse' 
                                              : 'bg-white/20'
                                        }`} 
                                        style={{ height: `${h}%`, minWidth: '2px' }} 
                                      />
                                    );
                                  })}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-app-text-muted font-mono select-none">
                                  <span>
                                    {playingAudioId === msg.id
                                      ? `0:${audioPlaybackTime < 10 ? `0${audioPlaybackTime}` : audioPlaybackTime} / 0:${audioTotalDuration < 10 ? `0${audioTotalDuration}` : audioTotalDuration}`
                                      : `0:${(msg.audioDuration || 5) < 10 ? `0${msg.audioDuration || 5}` : msg.audioDuration || 5}`
                                    }
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Mic size={11} className={playingAudioId === msg.id ? "text-brand-primary animate-bounce" : "text-app-text-dim"} />
                                    <span className="text-[9px] uppercase tracking-wider font-sans font-bold text-brand-primary">Voice</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Message Text */}
                          <p className="whitespace-pre-wrap select-text pr-8">{msg.text}</p>

                          {/* Timestamp & Double Blue Checkmark */}
                          <div className="flex items-center justify-end gap-1 mt-0.5 -mb-1 text-[10px] text-app-text-dim select-none">
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
                              <CheckCheck size={14} className="text-brand-accent" />
                            )}
                          </div>
                        </div>

                        {/* WhatsApp Message Hover Actions Bar */}
                        <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}>
                          <button
                            onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                            className="p-1 text-app-text-muted hover:text-brand-accent bg-brand-sidebar border border-white/10 rounded-full shadow cursor-pointer"
                            title="React with emoji"
                          >
                            <Smile size={13} />
                          </button>

                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 text-app-text-muted hover:text-brand-primary bg-brand-sidebar border border-white/10 rounded-full shadow cursor-pointer"
                            title="Reply"
                          >
                            <CornerUpLeft size={13} />
                          </button>

                          <button
                            onClick={() => handleTogglePinMessage(msg)}
                            className="p-1 text-app-text-muted hover:text-brand-accent bg-brand-sidebar border border-white/10 rounded-full shadow cursor-pointer"
                            title="Pin message"
                          >
                            <Pin size={13} />
                          </button>

                          {isMe && (
                            <button
                              onClick={(e) => handleDeleteMessage(msg, e)}
                              className="p-1 text-app-text-muted hover:text-red-400 bg-brand-sidebar border border-white/10 rounded-full shadow cursor-pointer"
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
                              className="flex items-center gap-1 p-1 bg-brand-depth border border-white/10 rounded-full shadow-2xl z-30"
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
                                    ? 'bg-brand-primary/25 border-brand-primary text-brand-primary'
                                    : 'bg-white/5 border-white/10 text-app-text-muted'
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
                <div className="flex items-center gap-2 text-brand-primary text-xs italic px-3 py-1">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Sister Yasmin is typing...</span>
                </div>
              )}
            </div>

            {/* WhatsApp Chat Input Bar */}
            <div className="p-2.5 sm:p-3 bg-brand-sidebar/95 border-t border-white/10 space-y-2 shrink-0 backdrop-blur-md">
              {/* Replying Banner */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 bg-white/5 border-l-4 border-brand-primary rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate text-app-text">
                      <CornerUpLeft size={13} className="text-brand-primary shrink-0" />
                      <span className="truncate">
                        Replying to <strong className="text-brand-primary">{replyingTo.senderName}</strong>: "{replyingTo.text}"
                      </span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-app-text-dim hover:text-white p-1">
                      <X size={13} />
                    </button>
                  </motion.div>
                )}

                {attachment && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="relative w-18 h-18 rounded-xl overflow-hidden border-2 border-brand-primary shadow-lg"
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
                    className="p-3 bg-brand-depth border border-white/10 rounded-2xl grid grid-cols-3 gap-2.5 text-xs shadow-2xl"
                  >
                    <button
                      onClick={() => handleShareDuaCard('Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.', 'Dua for Goodness in Both Worlds')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-app-text border border-white/10 flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-[11px] font-semibold">Share Dua</span>
                    </button>

                    <button
                      onClick={handleShareMarketItem}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-app-text border border-white/10 flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                        <Briefcase size={18} />
                      </div>
                      <span className="text-[11px] font-semibold">Trade Card</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage(undefined, { text: '🕌 [Masjid Check-In] Performing Salah at the local congregation. Duas requested for the Ummah!' })}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-app-text border border-white/10 flex flex-col items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                        <MapPin size={18} />
                      </div>
                      <span className="text-[11px] font-semibold">Check-In</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WhatsApp Input Controls Row (Optimized for all screen sizes) */}
              <div className="flex items-center gap-1.5 sm:gap-2 w-full min-w-0">
                {/* Voice Note Recording Indicator */}
                {isRecordingAudio ? (
                  <div className="flex-1 min-w-0 flex items-center justify-between p-2 sm:p-2.5 bg-white/5 border border-red-500/40 rounded-full px-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span className="text-xs font-bold text-red-400 font-mono truncate">
                        Recording... 0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={handleCancelAudioRecording}
                        className="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold text-app-text-muted hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStopAudioRecording}
                        className="px-3 sm:px-3.5 py-1 rounded-full bg-brand-primary text-brand-depth text-xs font-bold flex items-center gap-1 cursor-pointer shadow shrink-0"
                      >
                        <Send size={12} /> Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      {/* Attachment Clip Button */}
                      <button
                        type="button"
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                        className="p-1.5 sm:p-2 text-app-text-muted hover:text-brand-primary hover:bg-white/5 rounded-full transition-all cursor-pointer shrink-0"
                        title="Attach items"
                      >
                        <Paperclip size={18} />
                      </button>

                      {/* Image Attachment Button */}
                      <label className="p-1.5 sm:p-2 text-app-text-muted hover:text-brand-primary hover:bg-white/5 rounded-full transition-all cursor-pointer shrink-0">
                        <ImageIcon size={18} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>

                      {/* Voice Dictation (Speech to text) */}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer shrink-0 ${
                          isListening
                            ? 'bg-brand-primary text-brand-depth animate-pulse'
                            : 'text-app-text-muted hover:text-brand-primary hover:bg-white/5'
                        }`}
                        title="Speech to text"
                      >
                        <Mic size={18} />
                      </button>
                    </div>

                    {/* WhatsApp Pill Input Box & Send/Mic Button */}
                    <form onSubmit={handleSendMessage} className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2">
                      <div className="flex-1 min-w-0 flex items-center bg-white/5 border border-white/10 rounded-full px-3 sm:px-4 py-2 text-xs">
                        <input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message"
                          className="w-full min-w-0 bg-transparent text-xs text-app-text outline-none placeholder:text-app-text-dim"
                        />
                      </div>

                      {/* WhatsApp Floating Circular Action Button (Send / Mic) - ALWAYS VISIBLE */}
                      {newMessage.trim() || attachment ? (
                        <button
                          type="submit"
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary hover:bg-brand-secondary text-brand-depth flex items-center justify-center transition-all shadow-lg cursor-pointer shrink-0 active:scale-95"
                          title="Send message"
                        >
                          <Send size={15} className="ml-0.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartAudioRecording}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-primary hover:bg-brand-secondary text-brand-depth flex items-center justify-center transition-all shadow-lg cursor-pointer shrink-0 active:scale-95"
                          title="Hold to record voice note"
                        >
                          <Mic size={16} />
                        </button>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4 bg-brand-depth">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary shadow-xl">
              <MessageCircle size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-app-text">Habibi Ummah Chat</h3>
              <p className="text-xs text-app-text-muted max-w-xs mx-auto mt-1">
                Select a chat from the sidebar to send messages, voice notes, Duas, and trade cards.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Universal High-Craft Media Lightbox Expansion Modal */}
      <MediaLightboxModal
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        media={allChatMediaItems.length > 0 ? allChatMediaItems : (lightboxFallbackUrl ? [{ url: lightboxFallbackUrl }] : [])}
        initialIndex={lightboxActiveIndex}
      />

      {/* 4. Create Group / Channel Modal with Participant Selection */}
      <AnimatePresence>
        {showCreateGroup && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-brand-sidebar border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-app-text">New Sanctuary Group</h3>
                    <p className="text-[11px] text-app-text-muted">Create a circle & select members to invite</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateGroup(false);
                    setSelectedGroupMembers([]);
                    setMemberSelectSearch('');
                  }} 
                  className="text-app-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {/* Group Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">Group Name *</label>
                    <input
                      required
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Daily Quran Circle, Fiqh Study..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-app-text outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">Category</label>
                    <select
                      value={groupCategory}
                      onChange={(e) => setGroupCategory(e.target.value as any)}
                      className="w-full bg-brand-depth border border-white/10 rounded-xl p-2.5 text-xs text-app-text outline-none focus:border-brand-primary cursor-pointer"
                    >
                      <option value="community">🌟 General Sanctuary Community</option>
                      <option value="quran">📖 Quran & Hadith Study</option>
                      <option value="charity">🤲 Charity & Sadaqah Relief</option>
                      <option value="business">💼 Suq Trade & Business</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-app-text-muted uppercase tracking-wider">Description / Intent (Optional)</label>
                  <input
                    type="text"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Brief objective of this circle..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-app-text outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Participant Selector */}
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[11px] font-bold text-app-text flex items-center gap-1.5">
                        <span>Select Participants</span>
                        <span className="px-2 py-0.2 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold">
                          {selectedGroupMembers.length} selected
                        </span>
                      </label>
                      <p className="text-[10px] text-app-text-muted">Choose only the users you want in this group</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allUids = communityMembers.map(m => m.id).filter(id => id !== myUser.uid);
                          setSelectedGroupMembers(allUids);
                        }}
                        className="text-[10px] text-brand-primary hover:underline cursor-pointer font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-white/20">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedGroupMembers([])}
                        className="text-[10px] text-app-text-muted hover:text-red-400 cursor-pointer font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Selected Pills */}
                  {selectedGroupMembers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-white/5 rounded-xl border border-white/10 max-h-20 overflow-y-auto">
                      {selectedGroupMembers.map(uid => {
                        const member = communityMembers.find(m => m.id === uid);
                        return (
                          <span
                            key={uid}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary/20 border border-brand-primary/40 text-brand-primary text-[11px] rounded-full font-medium"
                          >
                            <span className="truncate max-w-[110px]">{member?.name || uid}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedGroupMembers(prev => prev.filter(id => id !== uid))}
                              className="hover:text-red-400 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Search inside members */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                    <input
                      type="text"
                      value={memberSelectSearch}
                      onChange={(e) => setMemberSelectSearch(e.target.value)}
                      placeholder="Search community members by name, city, or bio..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-app-text outline-none focus:border-brand-primary"
                    />
                  </div>

                  {/* Member checklist */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl bg-brand-depth/80 p-1.5 no-scrollbar">
                    {communityMembers
                      .filter(m => m.id !== myUser.uid)
                      .filter(m => {
                        if (!memberSelectSearch.trim()) return true;
                        const t = memberSelectSearch.toLowerCase();
                        return (
                          m.name?.toLowerCase().includes(t) ||
                          m.location?.toLowerCase().includes(t) ||
                          m.rank?.toLowerCase().includes(t)
                        );
                      })
                      .map(member => {
                        const isSelected = selectedGroupMembers.includes(member.id);
                        const isFriend = friends.includes(member.id);
                        return (
                          <div
                            key={member.id}
                            onClick={() => {
                              setSelectedGroupMembers(prev =>
                                isSelected ? prev.filter(id => id !== member.id) : [...prev, member.id]
                              );
                            }}
                            className={`p-2 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-brand-primary/20 border border-brand-primary/40'
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0 overflow-hidden">
                                {member.photoURL ? (
                                  <img src={member.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  member.name?.[0] || 'U'
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-semibold text-app-text truncate">{member.name}</p>
                                  {isFriend && (
                                    <span className="text-[9px] px-1 py-0.2 bg-brand-primary/20 text-brand-primary rounded font-bold">
                                      Friend
                                    </span>
                                  )}
                                  {member.verified && (
                                    <ShieldCheck size={12} className="text-brand-accent shrink-0" />
                                  )}
                                </div>
                                <p className="text-[10px] text-app-text-muted truncate">
                                  {member.location || 'Global Ummah'} • {member.rank || 'Sanctuary Seeker'}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by parent onClick
                                className="w-4 h-4 rounded accent-brand-primary cursor-pointer"
                              />
                            </div>
                          </div>
                        );
                      })}

                    {communityMembers.filter(m => m.id !== myUser.uid).length === 0 && (
                      <div className="p-4 text-center text-app-text-muted text-xs">
                        No other community members found yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Channel Option */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!isGroupBusiness || groupCategory === 'business'}
                    onChange={(e) => setIsGroupBusiness(e.target.checked)}
                    className="rounded accent-brand-primary"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-app-text">💼 Business & Trade Channel</p>
                    <p className="text-[10px] text-app-text-muted">Preserves all receipts & transactions permanently (exempt from 48h disappearing rule).</p>
                  </div>
                </label>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-brand-depth font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <Users size={16} />
                  <span>Create Group ({selectedGroupMembers.length + 1} members)</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Room Info & Members Modal */}
      <AnimatePresence>
        {showRoomInfoModal && activeRoom && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-brand-sidebar border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <h3 className="text-base font-bold text-app-text">Group & Channel Information</h3>
                <button onClick={() => setShowRoomInfoModal(false)} className="text-app-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Profile details */}
              <div className="flex flex-col items-center text-center space-y-2.5 py-2">
                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center overflow-hidden font-bold ${
                  activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner
                    ? 'bg-brand-depth border-brand-accent text-brand-accent p-2 shadow-lg shadow-brand-accent/20'
                    : 'bg-white/5 border-brand-primary text-brand-primary'
                }`}>
                  {activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner ? (
                    <FirdawsLogo variant="badge" size="md" dark={true} className="w-full h-full object-contain" />
                  ) : isBusinessRoom(activeRoom) ? (
                    <Briefcase size={36} className="text-brand-primary" />
                  ) : getRoomPhoto(activeRoom) ? (
                    <img src={getRoomPhoto(activeRoom)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={36} className="text-brand-primary" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="text-base font-bold text-app-text">{getRoomName(activeRoom)}</h4>
                    {(activeRoom.verified || activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner) && (
                      <ShieldCheck size={16} className="text-brand-accent fill-brand-accent/20" />
                    )}
                  </div>
                  {activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner ? (
                    <p className="text-xs font-semibold text-brand-accent mt-0.5">🌟 Official Strategic Humanitarian Partner</p>
                  ) : (
                    <p className="text-xs text-app-text-muted mt-0.5">
                      {isBusinessRoom(activeRoom) ? '💼 Business Channel' : 'Sanctuary Group Circle'}
                    </p>
                  )}
                </div>

                {activeRoom.description && (
                  <p className="text-xs text-app-text bg-white/5 p-3 rounded-2xl border border-white/10 text-left leading-relaxed w-full">
                    {activeRoom.description}
                  </p>
                )}
              </div>

              {/* Status pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-app-text-muted text-[10px] uppercase font-bold">Retention Policy</p>
                  <p className="font-semibold text-app-text flex items-center gap-1 mt-0.5">
                    {isBusinessRoom(activeRoom) ? '💼 Permanent Storage' : '⏱️ 48h Disappearing'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-app-text-muted text-[10px] uppercase font-bold">Total Members</p>
                  <p className="font-semibold text-brand-primary flex items-center gap-1 mt-0.5">
                    👥 {activeRoom.participants?.length || 1} Participants
                  </p>
                </div>
              </div>

              {/* Participant list / Informational Notice */}
              <div className="space-y-2 border-t border-white/10 pt-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
                {(activeRoom.id === 'group_firdaws_charity' || activeRoom.isPartner || activeRoom.name?.toLowerCase().includes('firdaus')) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 mb-2">
                    <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-300">Official Informational Channel</p>
                      <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">
                        This verified partner hub is strictly reserved for official charity news, relief project announcements, and campaign updates. Direct participant invitations are managed exclusively by Firdaus Charity Organisation administrators.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-app-text">Group Participants ({activeRoom.participants?.length || 1})</p>
                  {activeRoom.type === 'group' && 
                   activeRoom.id !== 'group_firdaws_charity' && 
                   !activeRoom.isPartner && 
                   !activeRoom.name?.toLowerCase().includes('firdauws') && 
                   !activeRoom.name?.toLowerCase().includes('firdaus') && (
                    <button
                      onClick={() => {
                        setShowRoomInfoModal(false);
                        setAddMembersSelected([]);
                        setAddMembersSearch('');
                        setShowAddMembersModal(true);
                      }}
                      className="text-xs font-semibold text-brand-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <UserPlus size={13} />
                      <span>+ Add More</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {(activeRoom.participants || [myUser.uid]).map(uid => {
                    const isMe = uid === myUser.uid;
                    const member = communityMembers.find(m => m.id === uid);
                    const name = isMe ? (myUser.displayName || 'You') : (activeRoom.participantNames?.[uid] || member?.name || uid);
                    const photo = isMe ? myUser.photoURL : (activeRoom.participantPhotos?.[uid] || member?.photoURL);
                    const isCreator = activeRoom.createdBy === uid;

                    return (
                      <div key={uid} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-brand-depth border border-white/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0 overflow-hidden">
                            {photo ? (
                              <img src={photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              name?.[0] || 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-app-text truncate">
                              {name} {isMe && <span className="text-app-text-muted font-normal">(You)</span>}
                            </p>
                            <p className="text-[10px] text-app-text-muted">
                              {member?.location || 'Sanctuary Member'}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isCreator ? (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary font-bold border border-brand-primary/30">
                              Group Admin
                            </span>
                          ) : (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-app-text-muted font-medium border border-white/10">
                              Member
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Add Members to Existing Group Modal */}
      <AnimatePresence>
        {showAddMembersModal && activeRoom && (
          <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-brand-sidebar border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-app-text">Add Members</h3>
                  <p className="text-[11px] text-app-text-muted">Select contacts to add to {getRoomName(activeRoom)}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddMembersModal(false);
                    setAddMembersSelected([]);
                  }} 
                  className="text-app-text-muted hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input
                  type="text"
                  value={addMembersSearch}
                  onChange={(e) => setAddMembersSearch(e.target.value)}
                  placeholder="Search community users to add..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-app-text outline-none focus:border-brand-primary"
                />
              </div>

              {/* List of candidates not already in group */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-xl bg-brand-depth/80 p-1.5 no-scrollbar">
                {communityMembers
                  .filter(m => !(activeRoom.participants || []).includes(m.id))
                  .filter(m => {
                    if (!addMembersSearch.trim()) return true;
                    const t = addMembersSearch.toLowerCase();
                    return m.name?.toLowerCase().includes(t) || m.location?.toLowerCase().includes(t);
                  })
                  .map(member => {
                    const isSelected = addMembersSelected.includes(member.id);
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          setAddMembersSelected(prev =>
                            isSelected ? prev.filter(id => id !== member.id) : [...prev, member.id]
                          );
                        }}
                        className={`p-2 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-primary/20 border border-brand-primary/40'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-brand-primary font-bold text-xs shrink-0 overflow-hidden">
                            {member.photoURL ? (
                              <img src={member.photoURL} alt="" className="w-full h-full object-cover" />
                            ) : (
                              member.name?.[0] || 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-app-text truncate">{member.name}</p>
                            <p className="text-[10px] text-app-text-muted truncate">{member.location || 'Ummah'}</p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-brand-primary cursor-pointer shrink-0"
                        />
                      </div>
                    );
                  })}

                {communityMembers.filter(m => !(activeRoom.participants || []).includes(m.id)).length === 0 && (
                  <div className="p-4 text-center text-app-text-muted text-xs">
                    All available sanctuary members are already in this group!
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={addMembersSelected.length === 0}
                onClick={handleAddMembersToActiveRoom}
                className="w-full py-3 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-brand-depth font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                <span>Add ({addMembersSelected.length}) Participants</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
