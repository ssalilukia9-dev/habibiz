import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  User, 
  Trash2,
  X,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  Hash,
  ArrowUp,
  ArrowDown,
  BookOpen,
  MessageSquare,
  HandHeart,
  Users,
  Compass,
  Trophy,
  Filter,
  Flag,
  Copy,
  Check,
  Smile,
  SmilePlus,
  Flame,
  SunMedium,
  Globe,
  Lock,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Smartphone,
  Eye,
  Clock
} from 'lucide-react';
import { doc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, deleteDoc, increment, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { restDbClient } from '../lib/restDbClient.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import PremiumGateway from './PremiumGateway';
import CreatePostModal, { CreatePostPayload, PostPrivacy } from './CreatePostModal';
import ReportPostModal from './ReportPostModal.tsx';

const SIDEBAR_TOPICS = [
  { name: 'General & Life', icon: SmilePlus, count: '3.8k' },
  { name: 'How I Feel', icon: Heart, count: '2.9k' },
  { name: 'Spiritual Reminders', icon: Sparkles, count: '2.4k' },
  { name: 'Quran & Tafsir', icon: BookOpen, count: '1.2k' },
  { name: 'Hadith Studies', icon: ShieldCheck, count: '850' },
  { name: 'Halal Lifestyle', icon: Users, count: '3.1k' },
  { name: 'Gratitude & Joy', icon: SunMedium, count: '1.9k' },
  { name: 'Charity & Relief', icon: HandHeart, count: '500' }
];

const TRENDING_DUAS = [
  { title: 'Dua for Peace of Heart', text: 'Ala bi-dhikrillahi tatma\'innul-quloob' },
  { title: 'Dua for Relief & Ease', text: 'Ya Hayyu Ya Qayyum bi-rahmatika astagheeth' },
  { title: 'Dua for Knowledge & Strength', text: 'Rabbi Zidni Ilma wa arzuqni fahma' }
];

const ACTIVE_SCHOLARS = [
  { name: 'Dr. Yasir', tag: 'Aalim' },
  { name: 'Sr. Fatima', tag: 'Scholar' },
  { name: 'Ustad Abu Bakr', tag: 'Imam' }
];

export const TRENDING_HASHTAGS = [
  { tag: '#Alhamdulillah', label: 'Alhamdulillah', count: '1.4k', icon: '🤲' },
  { tag: '#QuranReflection', label: 'Quran Reflection', count: '980', icon: '📖' },
  { tag: '#DailyDua', label: 'Daily Dua', count: '850', icon: '✨' },
  { tag: '#JummahMubarak', label: 'Jummah Mubarak', count: '720', icon: '🕌' },
  { tag: '#Tawakkul', label: 'Tawakkul & Trust', count: '640', icon: '🌿' },
  { tag: '#SeekForgiveness', label: 'Istighfar', count: '590', icon: '💧' },
  { tag: '#FajrClub', label: 'Fajr Club', count: '480', icon: '🌅' },
  { tag: '#DuaForPalestine', label: 'Dua for Palestine', count: '890', icon: '🇵🇸' },
  { tag: '#HalalLiving', label: 'Halal Living', count: '410', icon: '🕊️' },
  { tag: '#SunnahHabits', label: 'Sunnah Habits', count: '360', icon: '🌱' }
];

interface Comment {
  id: string;
  userId: string;
  user: string;
  text: string;
  time: any;
  replyToUser?: string;
  replyToCommentId?: string;
  parentCommentId?: string;
  replies?: Comment[];
}

interface Poll {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userSelections?: Record<string, string>; // userId -> optionId
}

interface Post {
  id: string;
  userId: string;
  user: string;
  isScholar?: boolean;
  content: string;
  caption?: string;
  time?: any;
  timeDisplay?: string;
  supportCount: number;
  reconsiderCount: number;
  userVotes?: Record<string, 'support' | 'reconsider'>;
  comments: Comment[];
  category: string;
  privacy?: PostPrivacy;
  image?: string | null;
  bgStyle?: string;
  filterPreset?: string;
  isFlagged?: boolean;
  isVerified?: boolean;
  approved?: boolean;
  poll?: Poll;
}

// Human-readable time ago formatter (e.g. 'just now', '2m ago', '1h ago', '3d ago')
export const formatTimeAgo = (timestamp: any): string => {
  if (!timestamp) return 'Just now';
  let timeMs = 0;
  try {
    if (typeof timestamp === 'number') {
      timeMs = timestamp;
    } else if (typeof timestamp === 'string') {
      const parsed = Date.parse(timestamp);
      timeMs = isNaN(parsed) ? Date.now() : parsed;
    } else if (timestamp?.seconds) {
      timeMs = timestamp.seconds * 1000;
    } else if (timestamp?.toDate && typeof timestamp.toDate === 'function') {
      timeMs = timestamp.toDate().getTime();
    } else if (timestamp instanceof Date) {
      timeMs = timestamp.getTime();
    } else {
      return 'Just now';
    }

    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - timeMs) / 1000));

    if (diffSeconds < 45) return 'Just now';
    if (diffSeconds < 90) return '1m ago';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y ago`;
  } catch {
    return 'Just now';
  }
};

// Sound tone for interaction
const playHapticAudio = (type: 'like' | 'publish' | 'swipe') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'like') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'publish') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'swipe') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  } catch {}
};

export default function FeedView({ 
  addHasanat, 
  isPremium,
  onShowPremium 
}: { 
  addHasanat?: (amount: number) => void;
  isPremium: boolean;
  onShowPremium: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'friends'>('all');
  const [isScholarMode, setIsScholarMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // View mode: standard social stream or full card swipe player
  const [feedViewMode, setFeedViewMode] = useState<'stream' | 'reels'>('stream');
  const [reelsActiveIndex, setReelsActiveIndex] = useState(0);

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Report Post Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedPostForReport, setSelectedPostForReport] = useState<Post | null>(null);

  // Inline Quick Compose state
  const [inlineContent, setInlineContent] = useState('');
  const [inlineCategory, setInlineCategory] = useState('How I Feel');

  // Comment state
  const [activePostComment, setActivePostComment] = useState<{ postId: string, text: string } | null>(null);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ postId: string; parentCommentId: string; commentId: string; userName: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'report' | 'delete_comment', id: string, commentId?: string, parentCommentId?: string, title: string, message: string } | null>(null);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<string, boolean>>({});

  // Animations & Feedback
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);
  const [heartPops, setHeartPops] = useState<Record<string, boolean>>({});
  const [dragActionNotice, setDragActionNotice] = useState<{ id: string; action: 'like' | 'bookmark' } | null>(null);
  const lastTapTimesRef = useRef<Record<string, number>>({});

  const handleContentTouch = (postId: string) => {
    const now = Date.now();
    const lastTap = lastTapTimesRef.current[postId] || 0;
    if (now - lastTap < 320) {
      handleDoubleTapLike(postId);
      lastTapTimesRef.current[postId] = 0;
    } else {
      lastTapTimesRef.current[postId] = now;
    }
  };

  const getActiveUser = () => {
    if (restDbClient.isLoggedIn()) {
      const u = restDbClient.getUser();
      if (u) {
        return {
          uid: u.uid,
          displayName: u.displayName,
          isRest: true
        };
      }
    }
    if (auth.currentUser) {
      return {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Spiritual Soul',
        isRest: false
      };
    }
    const savedEmail = localStorage.getItem('saved-auth-email');
    if (savedEmail) {
      const uid = 'local_' + btoa(savedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
      return {
        uid,
        displayName: savedEmail.split('@')[0],
        isRest: false
      };
    }
    return {
      uid: 'guest_' + Math.random().toString(36).substring(7),
      displayName: 'Anonymous Pilgrim',
      isRest: false
    };
  };

  const [authTrigger, setAuthTrigger] = useState(0);

  useEffect(() => {
    const handleAuthUpdate = () => {
      setAuthTrigger(prev => prev + 1);
    };
    window.addEventListener('rest_auth_updated', handleAuthUpdate);
    return () => window.removeEventListener('rest_auth_updated', handleAuthUpdate);
  }, []);

  // Background Auto-Registration / Auto-Login for guest convenience
  useEffect(() => {
    const autoLoginRest = async () => {
      const activeUser = getActiveUser();
      if (activeUser && activeUser.uid.startsWith('local_') && !restDbClient.isLoggedIn()) {
        const email = localStorage.getItem('saved-auth-email');
        if (email) {
          const defaultPassword = 'SanctuaryGuestPass123!';
          try {
            const user = await restDbClient.login(email, defaultPassword);
            window.dispatchEvent(new CustomEvent('rest_auth_updated'));
          } catch (err) {
            try {
              const user = await restDbClient.register(email, defaultPassword, email.split('@')[0]);
              window.dispatchEvent(new CustomEvent('rest_auth_updated'));
            } catch (regErr) {}
          }
        }
      }
    };
    autoLoginRest();
  }, [authTrigger]);

  // Fetch Posts from Firestore or REST Cloud Database
  useEffect(() => {
    const activeUser = getActiveUser();
    const useRest = !activeUser || activeUser.isRest || activeUser.uid.startsWith('local_') || activeUser.uid.startsWith('guest_') || activeUser.uid.startsWith('rest_');

    if (useRest) {
      const fetchRestPosts = () => {
        restDbClient.getPosts()
          .then(list => {
            const mapped = list.map(p => ({
              ...p,
              privacy: p.privacy || 'public',
              timeDisplay: p.timeDisplay || (p.time ? new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')
            }));
            setPosts(mapped);
            setLoading(false);
          })
          .catch(err => {
            console.warn("Failed to fetch REST posts:", err);
            setLoading(false);
          });
      };

      fetchRestPosts();
      const intervalId = setInterval(fetchRestPosts, 4000);
      return () => clearInterval(intervalId);
    } else {
      const q = query(
        collection(db, 'posts'),
        orderBy('time', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          privacy: 'public',
          ...doc.data(),
          timeDisplay: doc.data().time ? new Date(doc.data().time.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
        } as any));
        setPosts(list);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [authTrigger]);

  // Handle Double-Tap Heart
  const handleDoubleTapLike = (postId: string) => {
    playHapticAudio('like');
    setHeartPops(prev => ({ ...prev, [postId]: true }));
    
    const activeUser = getActiveUser();
    if (activeUser) {
      const post = posts.find(p => p.id === postId);
      const activeUid = activeUser.uid;
      const myVote = post?.userVotes?.[activeUid];
      if (myVote !== 'support') {
        handleVote(postId, 'support');
      }
    }
    
    setTimeout(() => {
      setHeartPops(prev => ({ ...prev, [postId]: false }));
    }, 850);
  };

  const handleVote = async (postId: string, type: 'support' | 'reconsider') => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const userId = activeUser.uid;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (type === 'support') playHapticAudio('like');

    if (activeUser.isRest) {
      const currentVote = post.userVotes?.[userId];
      let supportChange = 0;
      let reconsiderChange = 0;
      const newUserVotes = { ...(post.userVotes || {}) };

      if (currentVote === type) {
        delete newUserVotes[userId];
        if (type === 'support') supportChange = -1;
        else reconsiderChange = -1;
      } else {
        if (currentVote) {
          if (currentVote === 'support') supportChange = -1;
          else reconsiderChange = -1;
        }
        newUserVotes[userId] = type;
        if (type === 'support') supportChange = 1;
        else reconsiderChange = 1;
      }

      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        userVotes: newUserVotes,
        supportCount: Math.max(0, (p.supportCount || 0) + supportChange),
        reconsiderCount: Math.max(0, (p.reconsiderCount || 0) + reconsiderChange)
      } : p));

      try {
        await restDbClient.votePost(postId, type);
      } catch (e) {}
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const currentVote = post.userVotes?.[userId];
    const updates: any = {};

    if (currentVote === type) {
      updates[`userVotes.${userId}`] = null;
      updates[type === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(-1);
    } else {
      if (currentVote) {
        updates[currentVote === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(-1);
      }
      updates[`userVotes.${userId}`] = type;
      updates[type === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(1);
    }

    try {
      await updateDoc(postRef, updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (postId: string) => {
    playHapticAudio('swipe');
    setBookmarkedPosts(prev => {
      const next = { ...prev, [postId]: !prev[postId] };
      return next;
    });
  };

  // Submit New Post from Modal
  const handleModalPostSubmit = async (payload: CreatePostPayload) => {
    const activeUser = getActiveUser();
    if (!activeUser) return;

    playHapticAudio('publish');

    const isSensitive = ['debate', 'attack', 'haram', 'politics'].some(word => 
      payload.content.toLowerCase().includes(word)
    );

    const optimisticPost: Post = {
      id: `post-${Date.now()}`,
      userId: activeUser.uid,
      user: activeUser.displayName,
      content: payload.content,
      caption: payload.caption,
      category: payload.category,
      privacy: payload.privacy,
      timeDisplay: 'Just now',
      supportCount: 0,
      reconsiderCount: 0,
      userVotes: {},
      comments: [],
      isFlagged: isSensitive,
      approved: !isSensitive,
      image: payload.image || null,
      bgStyle: payload.bgStyle,
      filterPreset: payload.filterPreset,
      poll: payload.poll
    };

    if (addHasanat) addHasanat(50);
    setPosts([optimisticPost, ...posts]);
    setPublishSuccessMessage(`✨ Reflection published to ${payload.privacy === 'public' ? 'Global Ummah' : 'Friends Circle'}! (+50 Hasanat)`);
    setTimeout(() => setPublishSuccessMessage(null), 4500);

    if (activeUser.isRest) {
      try {
        await restDbClient.addPost(
          payload.content,
          payload.category,
          payload.image,
          payload.poll,
          payload.privacy,
          payload.bgStyle,
          payload.caption
        );
      } catch (e) {
        console.warn("REST publish error:", e);
      }
      return;
    }

    try {
      if (auth.currentUser) {
        await addDoc(collection(db, 'posts'), {
          userId: activeUser.uid,
          user: activeUser.displayName,
          content: payload.content,
          caption: payload.caption || '',
          category: payload.category,
          privacy: payload.privacy,
          time: serverTimestamp(),
          supportCount: 0,
          reconsiderCount: 0,
          userVotes: {},
          comments: [],
          isFlagged: isSensitive,
          approved: !isSensitive,
          image: payload.image || null,
          bgStyle: payload.bgStyle,
          poll: payload.poll || null
        });
      } else {
        await restDbClient.addPost(
          payload.content,
          payload.category,
          payload.image,
          payload.poll,
          payload.privacy,
          payload.bgStyle,
          payload.caption
        );
      }
    } catch (e) {
      console.warn("Firestore publish fallback:", e);
    }
  };

  const handlePollVote = async (postId: string, optionId: string) => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const userId = activeUser.uid;
    const post = posts.find(p => p.id === postId);
    
    if (post && post.poll && !post.poll.userSelections?.[userId]) {
      playHapticAudio('like');
      const newOptions = post.poll.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      );

      const newUserSelections = { ...(post.poll.userSelections || {}), [userId]: optionId };
      const updatedPoll = {
        ...post.poll,
        totalVotes: (post.poll.totalVotes || 0) + 1,
        options: newOptions,
        userSelections: newUserSelections
      };

      if (activeUser.isRest) {
        setPosts(posts.map(p => p.id === postId ? { ...p, poll: updatedPoll } : p));
        if (addHasanat) addHasanat(5);
        return;
      }

      const postRef = doc(db, 'posts', postId);
      try {
        await updateDoc(postRef, {
          'poll.totalVotes': increment(1),
          'poll.options': newOptions,
          [`poll.userSelections.${userId}`]: optionId
        });
        if (addHasanat) addHasanat(5);
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/poll`);
      }
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { isFlagged: false, approved: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const handleReportPost = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForReport(post);
      setIsReportModalOpen(true);
    } else {
      setSelectedPostForReport({ id: postId, user: 'Community Member', content: '' } as any);
      setIsReportModalOpen(true);
    }
  };

  const handleDeletePost = (postId: string) => {
    setConfirmAction({
      type: 'delete',
      id: postId,
      title: 'Delete Reflection',
      message: 'Are you sure you want to delete this post? This action cannot be undone.'
    });
  };

  const handleDeleteComment = (postId: string, commentId: string, parentCommentId?: string) => {
    setConfirmAction({
      type: 'delete_comment',
      id: postId,
      commentId,
      parentCommentId,
      title: 'Delete Comment',
      message: 'Are you sure you want to delete this reflection comment?'
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'delete') {
      const activeUser = getActiveUser();
      setPosts(posts.filter(p => p.id !== confirmAction.id));
      setConfirmAction(null);

      if (activeUser?.isRest) {
        try { await restDbClient.deletePost(confirmAction.id); } catch {}
        return;
      }
      try {
        await deleteDoc(doc(db, 'posts', confirmAction.id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `posts/${confirmAction.id}`);
      }
    } else if (confirmAction.type === 'delete_comment') {
      const { id: postId, commentId, parentCommentId } = confirmAction;
      const activeUser = getActiveUser();
      const post = posts.find(p => p.id === postId);
      if (post) {
        let updatedComments = [...(post.comments || [])];
        if (parentCommentId) {
          updatedComments = updatedComments.map(c => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: (c.replies || []).filter(r => r.id !== commentId)
              };
            }
            return c;
          });
        } else {
          updatedComments = updatedComments.filter(c => c.id !== commentId);
        }
        setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
      }
      setConfirmAction(null);

      if (activeUser?.isRest && commentId) {
        try { await restDbClient.deleteComment(postId, commentId); } catch {}
        return;
      }
      if (commentId && post) {
        try {
          const postRef = doc(db, 'posts', postId);
          const currentPostComments = post.comments || [];
          let filteredList: Comment[] = [];
          if (parentCommentId) {
            filteredList = currentPostComments.map(c => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: (c.replies || []).filter(r => r.id !== commentId)
                };
              }
              return c;
            });
          } else {
            filteredList = currentPostComments.filter(c => c.id !== commentId);
          }
          await updateDoc(postRef, { comments: filteredList });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/comments`);
        }
      }
    } else if (confirmAction.type === 'report') {
      setPosts(posts.map(p => p.id === confirmAction.id ? { ...p, isFlagged: true, approved: false } : p));
      setConfirmAction(null);
      try {
        await updateDoc(doc(db, 'posts', confirmAction.id), { isFlagged: true, approved: false });
      } catch {}
    }
  };

  const handleCopyContent = (postId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPostId(postId);
    setPublishSuccessMessage("Copied reflection to clipboard!");
    setTimeout(() => {
      setCopiedPostId(null);
      setPublishSuccessMessage(null);
    }, 2500);
  };

  // 🌟 Native Device Share Sheet with Clipboard Fallback
  const handleSharePost = async (post: Post) => {
    const cleanContent = post.content || post.caption || 'Spiritual reflection';
    const hashtagTag = post.category ? `#${post.category.replace(/[^a-zA-Z0-9]/g, '')}` : '#NoorTalk';
    const shareText = `"${cleanContent}"\n\n— Shared by ${post.user} on Sanctuary Noor Talk 🌿✨\n${hashtagTag} #SanctuaryApp`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Noor Talk Reflection by ${post.user}`,
          text: shareText,
          url: shareUrl
        });
        setPublishSuccessMessage("Reflection shared via device share sheet! ✨");
        setTimeout(() => setPublishSuccessMessage(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy formatted reflection & link to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopiedPostId(post.id);
      setPublishSuccessMessage("Copied reflection link & text for outside sharing! 📋");
      setTimeout(() => {
        setCopiedPostId(null);
        setPublishSuccessMessage(null);
      }, 3000);
    } catch {
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  const handleCommentSubmit = async (postId: string, parentCommentId?: string, replyToUser?: string) => {
    const activeUser = getActiveUser();
    const textToSubmit = parentCommentId ? replyText.trim() : (activePostComment?.postId === postId ? activePostComment.text.trim() : '');
    if (!textToSubmit || !activeUser) return;

    playHapticAudio('publish');

    const newComment: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: activeUser.uid,
      user: activeUser.displayName,
      text: textToSubmit,
      replyToUser: replyToUser || undefined,
      replyToCommentId: parentCommentId || undefined,
      parentCommentId: parentCommentId || undefined,
      time: new Date().toISOString(),
      replies: []
    };

    const post = posts.find(p => p.id === postId);
    if (post) {
      let updatedComments = [...(post.comments || [])];
      if (parentCommentId) {
        let parentFound = false;
        updatedComments = updatedComments.map(c => {
          if (c.id === parentCommentId) {
            parentFound = true;
            return {
              ...c,
              replies: [...(c.replies || []), newComment]
            };
          }
          return c;
        });
        if (!parentFound) {
          updatedComments.push(newComment);
        }
      } else {
        updatedComments.push(newComment);
      }
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    }

    if (addHasanat) addHasanat(10);
    
    if (parentCommentId) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setActivePostComment(null);
    }

    if (activeUser.isRest) {
      try {
        await restDbClient.commentPost(postId, textToSubmit, parentCommentId, replyToUser, parentCommentId);
      } catch (e) {}
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      if (post) {
        const currentPostComments = post.comments || [];
        let updatedList: Comment[] = [];
        if (parentCommentId) {
          let parentFound = false;
          updatedList = currentPostComments.map(c => {
            if (c.id === parentCommentId) {
              parentFound = true;
              return {
                ...c,
                replies: [...(c.replies || []), newComment]
              };
            }
            return c;
          });
          if (!parentFound) {
            updatedList.push(newComment);
          }
        } else {
          updatedList = [...currentPostComments, newComment];
        }
        await updateDoc(postRef, {
          comments: updatedList
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/comments`);
    }
  };

  // Filtered posts calculation (including hashtag filtering)
  const filteredPosts = posts.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesPrivacy = 
      privacyFilter === 'all' || 
      (privacyFilter === 'public' && (!p.privacy || p.privacy === 'public')) ||
      (privacyFilter === 'friends' && p.privacy === 'friends');
    
    const matchesHashtag = !selectedHashtag || (
      (p.content && p.content.toLowerCase().includes(selectedHashtag.toLowerCase())) ||
      (p.caption && p.caption.toLowerCase().includes(selectedHashtag.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(selectedHashtag.replace('#', '').toLowerCase()))
    );

    return matchesCategory && matchesPrivacy && matchesHashtag;
  });

  const currentUser = getActiveUser();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:grid lg:grid-cols-12 gap-8 pb-32">
      {/* 🌟 Dedicated 'Create Post' Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleModalPostSubmit}
        currentUser={currentUser}
        initialCategory={activeCategory !== 'All' ? activeCategory : 'How I Feel'}
      />

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-brand-depth/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel border-white/10 p-8 rounded-[3rem] max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${confirmAction.type.startsWith('delete') ? 'bg-red-500/10 text-red-500' : 'bg-noor-gold/10 text-noor-gold'}`}>
                {confirmAction.type.startsWith('delete') ? <Trash2 size={32} /> : <AlertCircle size={32} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">{confirmAction.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {confirmAction.message}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={executeConfirmedAction}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer ${confirmAction.type.startsWith('delete') ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-noor-gold text-black'}`}
                >
                  {confirmAction.type.startsWith('delete') ? 'Confirm Delete' : 'Confirm Action'}
                </button>
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) for Instant Post Creation */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-24 right-5 sm:right-8 z-40 px-5 py-3.5 rounded-full bg-gradient-to-r from-noor-emerald via-teal-500 to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_10px_35px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer border border-emerald-300/40 backdrop-blur-md"
        title="Create New Reflection"
      >
        <Plus size={18} className="stroke-[3]" />
        <span>Share Noor</span>
        <Sparkles size={14} className="text-amber-300" />
      </motion.button>

      {/* Left Sidebar - Topics & Circles */}
      <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
        <div className="glass-panel border-white/10 rounded-[2rem] p-6 space-y-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <div className="flex items-center gap-2.5">
              <Compass className="text-noor-gold" size={20} />
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/70">NoorTalk Hub</h3>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 rounded-xl bg-noor-emerald/20 text-noor-emerald hover:bg-noor-emerald hover:text-slate-950 transition-all"
              title="Create Post"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            <button 
              onClick={() => { setActiveCategory('All'); setPrivacyFilter('all'); }}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all group flex items-center justify-between cursor-pointer ${
                activeCategory === 'All' && privacyFilter === 'all'
                  ? 'bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/30 shadow-md' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Globe size={15} /> All Feed (Global)
              </span>
              <ArrowUp className="opacity-0 group-hover:opacity-100 -rotate-45 transition-all" size={14} />
            </button>

            <button 
              onClick={() => setPrivacyFilter('friends')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all group flex items-center justify-between cursor-pointer ${
                privacyFilter === 'friends'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={15} className="text-amber-400" /> Ummah Circle (Friends)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black">
                Private
              </span>
            </button>
          </div>

          <div className="pt-5 border-t border-white/5 space-y-5">
             <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scholar Mode</h4>
                <button 
                  onClick={() => setIsScholarMode(!isScholarMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${isScholarMode ? 'bg-noor-gold' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: isScholarMode ? 20 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
             </div>

             <div className="space-y-3">
                <h4 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Islamic Topics</h4>
                <div className="space-y-1">
                    {SIDEBAR_TOPICS.map((topic) => (
                      <button 
                        key={topic.name}
                        onClick={() => setActiveCategory(topic.name.split(' ')[0])}
                        className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          activeCategory === topic.name.split(' ')[0]
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <topic.icon size={16} className="text-noor-gold/70" />
                        <span className="flex-1 truncate">{topic.name}</span>
                        <span className="text-[10px] opacity-40 font-mono">{topic.count}</span>
                      </button>
                    ))}
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel border-white/10 rounded-[2rem] p-5 bg-noor-emerald/5 border-noor-emerald/15 space-y-2">
           <div className="flex items-center gap-2.5">
              <ShieldCheck className="text-noor-emerald" size={18} />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Sanctuary Ethics</h3>
           </div>
           <p className="text-[11px] text-slate-400 leading-relaxed">
             Share your sincere feelings, daily reflections, blessings, and beneficial reminders with peace & brotherhood.
           </p>
        </div>
      </div>

      {/* Main Feed Column */}
      <div className="lg:col-span-6 space-y-5">
        
        {/* Top Control Bar: View Mode Switcher + Create Post Trigger */}
        <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 p-2.5 rounded-[1.8rem] backdrop-blur-xl">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFeedViewMode('stream')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                feedViewMode === 'stream'
                  ? 'bg-noor-emerald text-slate-950 shadow-md shadow-noor-emerald/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span>Stream</span>
            </button>
            <button
              onClick={() => setFeedViewMode('reels')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                feedViewMode === 'reels'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone size={13} />
              <span>Swipe Reels</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-xs flex items-center gap-2 border border-white/10 transition-all cursor-pointer hover:border-emerald-400/40"
          >
            <Plus size={14} className="text-emerald-400" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Quick Compose Card */}
        <motion.div 
          whileHover={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
          className="glass-panel rounded-[2.2rem] border-white/10 overflow-hidden bg-noor-charcoal/40 backdrop-blur-3xl shadow-xl p-5 cursor-pointer"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-noor-emerald to-teal-500 shrink-0 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-noor-emerald/20">
              {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-4 py-3 text-slate-400 text-xs font-medium transition-all flex items-center justify-between">
              <span>What spiritual reflection or feeling is on your heart today?</span>
              <Sparkles size={14} className="text-amber-400 shrink-0 ml-2" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 mt-3 border-t border-white/5 text-slate-400 text-xs font-bold">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400/80 hover:text-emerald-400">
                <ImageIcon size={14} /> Photo
              </span>
              <span className="flex items-center gap-1.5 text-amber-400/80 hover:text-amber-400">
                <Smile size={14} /> Feelings
              </span>
              <span className="flex items-center gap-1.5 text-purple-400/80 hover:text-purple-400">
                <Trophy size={14} /> Poll
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
              +50 Hasanat
            </span>
          </div>
        </motion.div>

        {/* Category & Privacy Filter Pills */}
        <div className="space-y-2">
          {/* Privacy Level Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setPrivacyFilter('all')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyFilter === 'all'
                  ? 'bg-slate-800 text-white border border-white/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={12} /> All Circles
            </button>
            <button
              onClick={() => setPrivacyFilter('public')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyFilter === 'public'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={12} className="text-emerald-400" /> 🌐 Public Only
            </button>
            <button
              onClick={() => setPrivacyFilter('friends')}
              className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                privacyFilter === 'friends'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Users size={12} className="text-amber-400" /> 👥 Friends Only
            </button>
          </div>

          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {[
              'All',
              'How I Feel',
              'General & Life',
              'Spiritual Reminders',
              'Gratitude & Joy',
              'Reflections',
              'Quran & Tafsir',
              'Hadith Studies'
            ].map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedHashtag(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isActive && !selectedHashtag
                      ? 'bg-noor-emerald text-white shadow-lg shadow-noor-emerald/20 border border-noor-emerald'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat === 'All' ? '🌟 All Content' : cat === 'How I Feel' ? '💖 How I Feel' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🌟 Trending Islamic Hashtags Section */}
        <div className="glass-panel rounded-[2rem] border-white/10 p-4 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-purple-950/30 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400 fill-amber-400" />
                <span>Trending Islamic Hashtags</span>
              </h3>
            </div>
            {selectedHashtag && (
              <button
                onClick={() => setSelectedHashtag(null)}
                className="text-[10px] font-black text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 cursor-pointer transition-colors"
              >
                <X size={11} />
                <span>Clear Filter</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {TRENDING_HASHTAGS.map((item) => {
              const isSelected = selectedHashtag?.toLowerCase() === item.tag.toLowerCase();
              return (
                <button
                  key={item.tag}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedHashtag(null);
                    } else {
                      setSelectedHashtag(item.tag);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-noor-emerald to-teal-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-noor-emerald/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:border-emerald-500/30'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.tag}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedHashtag && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1.5 rounded-xl bg-noor-emerald/10 border border-noor-emerald/30 text-[11px] font-bold text-noor-emerald flex items-center justify-between"
            >
              <span>Filtering Ummah reflections matching <strong className="text-white underline">{selectedHashtag}</strong></span>
              <span className="text-[10px] opacity-75 font-mono">{filteredPosts.length} reflections</span>
            </motion.div>
          )}
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {publishSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-3.5 bg-noor-emerald/20 border border-noor-emerald/40 rounded-2xl text-xs font-black text-noor-emerald text-center flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span>{publishSuccessMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🌟 1. NOOR REELS / FULLSCREEN CARD SWIPER MODE */}
        {feedViewMode === 'reels' && (
          <div className="post-card-container relative rounded-[2.5rem] bg-slate-950 border border-purple-500/30 overflow-hidden shadow-2xl min-h-[520px] flex flex-col justify-between p-6">
            {filteredPosts.length > 0 ? (
              <AnimatePresence mode="wait">
                {(() => {
                  const post = filteredPosts[reelsActiveIndex % filteredPosts.length];
                  const myVote = post.userVotes?.[currentUser.uid];

                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 60, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: -60, scale: 0.92 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                      className="space-y-6 flex-1 flex flex-col justify-between"
                    >
                      {/* Reels Top Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-noor-emerald/20 text-noor-emerald flex items-center justify-center font-black text-base border border-noor-emerald/30">
                            {post.user[0]}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white flex items-center gap-2">
                              {post.user}
                              {post.privacy === 'friends' ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black">
                                  👥 Friends
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black">
                                  🌐 Public
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                              <Clock size={10} className="text-slate-500" />
                              <span className="text-slate-300 font-semibold">{formatTimeAgo(post.time)}</span>
                              <span>•</span>
                              <span className="text-noor-emerald font-bold">{post.category}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            {(reelsActiveIndex % filteredPosts.length) + 1} / {filteredPosts.length}
                          </span>
                          <button
                            onClick={() => handleReportPost(post.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Report Post to Moderation"
                          >
                            <Flag size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Reels Media / Content Canvas */}
                      <div 
                        onDoubleClick={() => handleDoubleTapLike(post.id)}
                        className={`p-8 rounded-[2rem] border relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] text-center cursor-pointer ${
                          post.bgStyle && post.bgStyle !== 'default' 
                            ? post.bgStyle 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {post.image ? (
                          <img 
                            src={post.image} 
                            alt="Reel visual" 
                            className="w-full max-h-64 object-cover rounded-2xl shadow-xl"
                          />
                        ) : (
                          <p className="text-xl md:text-2xl font-black text-white italic leading-relaxed tracking-wide">
                            "{post.content}"
                          </p>
                        )}

                        {post.caption && (
                          <p className="mt-3 text-xs text-slate-300 font-medium">
                            {post.caption}
                          </p>
                        )}

                        {/* Double tap heart explosion */}
                        <AnimatePresence>
                          {heartPops[post.id] && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.3 }}
                              animate={{ opacity: 1, scale: 1.4 }}
                              exit={{ opacity: 0, scale: 1.8 }}
                              className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none z-20"
                            >
                              <Heart className="text-red-500 fill-red-500 w-24 h-24 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Reels Navigation & Action Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(post.id, 'support')}
                            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                              myVote === 'support'
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                : 'bg-white/5 text-slate-300 hover:text-red-400'
                            }`}
                          >
                            <Heart size={15} className={myVote === 'support' ? 'fill-white' : ''} />
                            <span>{post.supportCount}</span>
                          </button>
                          
                          <button
                            onClick={() => toggleBookmark(post.id)}
                            className={`p-2 rounded-xl border transition-all ${
                              bookmarkedPosts[post.id]
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-white/5 text-slate-400 border-white/5'
                            }`}
                          >
                            <Bookmark size={15} />
                          </button>

                          <button
                            onClick={() => handleSharePost(post)}
                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-emerald-400 border border-white/5 transition-all cursor-pointer"
                            title="Share reflection outside app"
                          >
                            <Share2 size={15} />
                          </button>
                        </div>

                        {/* Next / Previous Swipe Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playHapticAudio('swipe');
                              setReelsActiveIndex(prev => Math.max(0, prev - 1));
                            }}
                            disabled={reelsActiveIndex === 0}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 disabled:opacity-30 cursor-pointer"
                            title="Previous Noor Card"
                          >
                            <ChevronUp size={18} />
                          </button>
                          <button
                            onClick={() => {
                              playHapticAudio('swipe');
                              setReelsActiveIndex(prev => prev + 1);
                            }}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 cursor-pointer"
                            title="Next Noor Card"
                          >
                            <span>Next</span>
                            <ChevronDown size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm font-bold">No reflections in this category yet.</p>
              </div>
            )}
          </div>
        )}

        {/* 🌟 2. STANDARD FEED STREAM WITH ANIMATED TRANSITIONS & SWIPE PHYSICS */}
        {feedViewMode === 'stream' && (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredPosts.length === 0 && !loading ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-panel border-white/10 rounded-[2.5rem] p-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-3xl bg-noor-emerald/10 text-noor-emerald mx-auto flex items-center justify-center">
                    <Sparkles size={32} />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h4 className="text-lg font-black text-white">No reflections in this filter yet</h4>
                    <p className="text-xs text-slate-400 font-medium">Be the first to share your thoughts, story, or photo with the Ummah!</p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-noor-emerald to-teal-500 text-slate-950 rounded-xl text-xs font-black transition-all uppercase tracking-wider shadow-lg shadow-noor-emerald/20 cursor-pointer"
                  >
                    + Share First Reflection
                  </button>
                </motion.div>
              ) : (
                filteredPosts.map((post) => {
                  const myVote = post.userVotes?.[currentUser.uid];
                  const myPollSelection = post.poll?.userSelections?.[currentUser.uid];
                  const isBookmarked = !!bookmarkedPosts[post.id];
                  const areCommentsExpanded = expandedCommentsPostId === post.id;

                  return (
                    <motion.div
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 35, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: "-40px" }}
                      exit={{ opacity: 0, scale: 0.92, y: -20 }}
                      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x > 90) {
                          // Swiped right -> Like
                          handleVote(post.id, 'support');
                          setDragActionNotice({ id: post.id, action: 'like' });
                          setTimeout(() => setDragActionNotice(null), 1500);
                        } else if (info.offset.x < -90) {
                          // Swiped left -> Bookmark
                          toggleBookmark(post.id);
                          setDragActionNotice({ id: post.id, action: 'bookmark' });
                          setTimeout(() => setDragActionNotice(null), 1500);
                        }
                      }}
                      className={`post-card-container relative group overflow-hidden rounded-[2.5rem] border transition-all duration-300 ${
                        post.isFlagged
                          ? 'glass-panel border-red-500/20 bg-red-500/5'
                          : 'glass-panel border-white/10 hover:border-noor-emerald/30 shadow-xl'
                      }`}
                    >
                      {/* Swipe Visual Feedback Indicator */}
                      <AnimatePresence>
                        {dragActionNotice?.id === post.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-white text-[10px] font-black flex items-center gap-1.5 shadow-xl"
                          >
                            {dragActionNotice.action === 'like' ? (
                              <>
                                <Heart size={12} className="text-red-500 fill-red-500" />
                                <span>Swiped & Liked!</span>
                              </>
                            ) : (
                              <>
                                <Bookmark size={12} className="text-amber-400 fill-amber-400" />
                                <span>Saved to Bookmarks!</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="p-6 md:p-8 space-y-5">
                        {/* Header: User, Privacy Badge, Timestamp & Top-Right Report Flag */}
                        <div className="flex items-center justify-between relative">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner border border-white/5 ${
                              post.isScholar ? 'bg-noor-gold/15 text-noor-gold' : 'bg-noor-emerald/15 text-noor-emerald'
                            }`}>
                              {post.user ? post.user[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-white text-sm">{post.user}</h4>
                                {post.isScholar && (
                                  <span className="px-2 py-0.5 bg-noor-gold/20 text-noor-gold rounded-full text-[8px] font-black uppercase tracking-widest">
                                    Scholar
                                  </span>
                                )}
                                {post.isVerified && <CheckCircle2 size={14} className="text-noor-emerald" />}
                                
                                {/* Privacy Badge */}
                                {post.privacy === 'friends' ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[8px] font-black uppercase flex items-center gap-1">
                                    <Users size={10} className="text-amber-400" /> Friends
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 text-[8px] font-black uppercase flex items-center gap-1">
                                    <Globe size={10} className="text-emerald-400" /> Public
                                  </span>
                                )}
                              </div>
                              
                              {/* 🌟 Human-readable 'time ago' timestamp clearly below author name */}
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                                <Clock size={11} className="text-slate-500 shrink-0" />
                                <span className="font-semibold text-slate-300">{formatTimeAgo(post.time)}</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[10px] font-black text-noor-emerald uppercase tracking-wider">{post.category}</span>
                              </div>
                            </div>
                          </div>

                          {/* Top-Right Actions: Direct Report Flag Button & Options Menu */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleReportPost(post.id)}
                              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Report Post to Moderation"
                            >
                              <Flag size={16} />
                            </button>

                            <div className="relative">
                              <button
                                onClick={() => setOpenPostMenuId(openPostMenuId === post.id ? null : post.id)}
                                className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                              >
                                <MoreHorizontal size={18} />
                              </button>

                              <AnimatePresence>
                                {openPostMenuId === post.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 top-10 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl z-30 py-2 divide-y divide-white/5"
                                  >
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          handleCopyContent(post.id, post.content);
                                          setOpenPostMenuId(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors text-left"
                                      >
                                        {copiedPostId === post.id ? <Check size={14} className="text-noor-emerald" /> : <Copy size={14} />}
                                        <span>{copiedPostId === post.id ? 'Copied' : 'Copy Reflection'}</span>
                                      </button>
                                    </div>

                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setOpenPostMenuId(null);
                                          handleDeletePost(post.id);
                                        }}
                                        className="w-full px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors text-left font-medium"
                                      >
                                        <Trash2 size={14} />
                                        <span>Delete Post</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setOpenPostMenuId(null);
                                          handleReportPost(post.id);
                                        }}
                                        className="w-full px-4 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors text-left font-medium"
                                      >
                                        <Flag size={14} />
                                        <span>Report Content</span>
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        {/* Post Visual Body with Double-Tap Heart Trigger & Scale-Up Icon */}
                        <div 
                          onDoubleClick={() => handleDoubleTapLike(post.id)}
                          onTouchEnd={() => handleContentTouch(post.id)}
                          className="space-y-4 relative select-none cursor-pointer group/body"
                        >
                          {/* Heart Pop Overlay with Dynamic Scale-Up Effect */}
                          <AnimatePresence>
                            {heartPops[post.id] && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.2, rotate: -12 }}
                                animate={{ 
                                  opacity: [0, 1, 1, 0],
                                  scale: [0.2, 1.45, 1.25, 1.6],
                                  rotate: [-12, 0, 6, 0],
                                  y: [0, -10, -22, -38]
                                }}
                                exit={{ opacity: 0, scale: 1.8 }}
                                transition={{ duration: 0.85, times: [0, 0.25, 0.7, 1], ease: "easeOut" }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                              >
                                <div className="relative flex items-center justify-center">
                                  <motion.div
                                    initial={{ scale: 0.5, opacity: 0.9 }}
                                    animate={{ scale: 2.2, opacity: 0 }}
                                    transition={{ duration: 0.75, ease: "easeOut" }}
                                    className="absolute w-28 h-28 rounded-full bg-gradient-to-r from-red-500/50 to-pink-500/50 blur-lg"
                                  />
                                  <Heart className="text-red-500 fill-red-500 w-24 h-24 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)] stroke-[2.5]" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {post.bgStyle && post.bgStyle !== 'default' && !post.image ? (
                            <div 
                              className={`p-8 sm:p-10 rounded-[2rem] border border-white/10 ${post.bgStyle} flex flex-col items-center justify-center min-h-[200px] text-center relative group shadow-xl overflow-hidden`}
                            >
                              <div className="absolute inset-0 bg-white/[0.02] bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                              <p className="text-lg sm:text-2xl font-black italic leading-relaxed tracking-wide drop-shadow-md relative z-10 max-w-md">
                                "{post.content}"
                              </p>
                            </div>
                          ) : (
                            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                              {post.content}
                            </p>
                          )}

                          {/* Image Attachment */}
                          {post.image && (
                            <div 
                              className="rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative group bg-black"
                            >
                              <img
                                src={post.image}
                                alt="Reflection visual"
                                className={`w-full max-h-[420px] object-cover transition-all ${
                                  post.filterPreset === 'warm' ? 'sepia-[0.25] saturate-125' :
                                  post.filterPreset === 'emerald' ? 'hue-rotate-15 contrast-105' :
                                  post.filterPreset === 'golden' ? 'brightness-105 saturate-150' :
                                  post.filterPreset === 'bw' ? 'grayscale contrast-125' : ''
                                }`}
                              />

                              {post.caption && (
                                <div className="p-3 bg-slate-900/90 border-t border-white/10 text-xs text-slate-300 font-medium">
                                  {post.caption}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Poll Card */}
                          {post.poll && (
                            <div className="space-y-2.5 bg-white/5 p-5 rounded-[2rem] border border-white/5">
                              {post.poll.options.map((opt) => {
                                const percentage = post.poll!.totalVotes > 0 
                                  ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                                  : 0;
                                const isSelected = myPollSelection === opt.id;

                                return (
                                  <button
                                    key={opt.id}
                                    disabled={!!myPollSelection}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePollVote(post.id, opt.id);
                                    }}
                                    className="w-full relative h-11 rounded-xl overflow-hidden group/poll border border-white/10 hover:border-noor-gold/30 transition-all text-left cursor-pointer"
                                  >
                                    <div 
                                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ${isSelected ? 'bg-noor-gold/25' : 'bg-noor-emerald/15'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                    <div className="relative px-4 h-full flex items-center justify-between">
                                      <span className={`text-xs font-bold ${isSelected ? 'text-noor-gold' : 'text-white'}`}>
                                        {opt.text}
                                      </span>
                                      {myPollSelection && (
                                        <span className="text-[10px] font-black text-slate-400">{percentage}%</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                              {myPollSelection && (
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">
                                  {post.poll.totalVotes} total responses
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Interactive Actions Footer */}
                        <div className="pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              animate={{ scale: myVote === 'support' || heartPops[post.id] ? [1, 1.3, 1] : 1 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              onClick={() => handleVote(post.id, 'support')}
                              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer ${
                                myVote === 'support' 
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-md' 
                                  : 'text-slate-400 hover:text-red-400'
                              }`}
                            >
                              <Heart size={15} className={myVote === 'support' ? 'fill-red-500 text-red-500' : ''} />
                              <span>{post.supportCount}</span>
                            </motion.button>

                            <button
                              onClick={() => handleVote(post.id, 'reconsider')}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer ${
                                myVote === 'reconsider' 
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
                                  : 'text-slate-400 hover:text-amber-400'
                              }`}
                              title="Reconsider / feedback"
                            >
                              <ArrowDown size={14} />
                              <span>{post.reconsiderCount}</span>
                            </button>

                            <div className="w-px h-5 bg-white/10 mx-1" />

                            <button
                              onClick={() => setExpandedCommentsPostId(areCommentsExpanded ? null : post.id)}
                              className="flex items-center gap-1.5 text-slate-400 hover:text-white px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                            >
                              <MessageCircle size={15} />
                              <span>{(post.comments || []).reduce((acc, c) => acc + 1 + ((c.replies && c.replies.length) || 0), 0)}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleBookmark(post.id)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isBookmarked ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                              }`}
                              title="Bookmark post"
                            >
                              <Bookmark size={16} className={isBookmarked ? 'fill-amber-400' : ''} />
                            </button>

                            {/* 🌟 Native Device Share Button */}
                            <button
                              onClick={() => handleSharePost(post)}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                              title="Share reflection outside app"
                            >
                              <Share2 size={16} />
                              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Share</span>
                            </button>
                          </div>
                        </div>

                        {/* 🌟 Threaded Comments Drawer */}
                        <AnimatePresence>
                          {(areCommentsExpanded || post.comments.length > 0) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pt-4 border-t border-white/5 space-y-4"
                            >
                              {post.comments.length > 0 && (
                                <div className="space-y-4">
                                  {post.comments.map((comment) => (
                                    <div key={comment.id} className="space-y-2">
                                      {/* Top-Level Root Comment */}
                                      <div className="flex items-start gap-3 group/comment relative bg-white/[0.02] hover:bg-white/[0.04] p-3 rounded-2xl border border-white/5 transition-all">
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-noor-emerald/30 to-teal-600/30 text-noor-emerald flex items-center justify-center text-xs font-black shrink-0 border border-noor-emerald/20">
                                          {comment.user ? comment.user[0].toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-black text-white">{comment.user}</span>
                                              <span className="text-[9px] text-slate-500 font-semibold flex items-center gap-1">
                                                <Clock size={9} />
                                                <span>{formatTimeAgo(comment.time)}</span>
                                              </span>
                                            </div>
                                            {(comment.userId === currentUser.uid || isScholarMode) && (
                                              <button
                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                                className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                                                title="Delete comment"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            )}
                                          </div>
                                          <p className="text-xs text-slate-300 font-medium leading-relaxed">{comment.text}</p>
                                          
                                          {/* Reply Action Button */}
                                          <div className="pt-1 flex items-center gap-3">
                                            <button
                                              onClick={() => {
                                                if (replyingTo?.commentId === comment.id) {
                                                  setReplyingTo(null);
                                                  setReplyText('');
                                                } else {
                                                  setReplyingTo({
                                                    postId: post.id,
                                                    parentCommentId: comment.id,
                                                    commentId: comment.id,
                                                    userName: comment.user
                                                  });
                                                  setReplyText('');
                                                }
                                              }}
                                              className="text-[10px] font-black text-noor-emerald hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                              <MessageSquare size={11} />
                                              <span>Reply</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Threaded Nested Replies */}
                                      {comment.replies && comment.replies.length > 0 && (
                                        <div className="ml-6 sm:ml-8 pl-3.5 border-l-2 border-emerald-500/30 space-y-2.5 mt-2">
                                          {comment.replies.map((reply) => (
                                            <div key={reply.id} className="flex items-start gap-2.5 group/reply bg-white/[0.015] hover:bg-white/[0.03] p-2.5 rounded-xl border border-white/5 transition-all">
                                              <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                                {reply.user ? reply.user[0].toUpperCase() : 'U'}
                                              </div>
                                              <div className="flex-1 space-y-0.5">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[11px] font-black text-white">{reply.user}</span>
                                                    {reply.replyToUser && (
                                                      <span className="text-[9px] font-bold text-noor-emerald bg-noor-emerald/10 px-1.5 py-0.2 rounded-md">
                                                        @{reply.replyToUser}
                                                      </span>
                                                    )}
                                                    <span className="text-[8px] text-slate-500 font-semibold">
                                                      {formatTimeAgo(reply.time)}
                                                    </span>
                                                  </div>
                                                  {(reply.userId === currentUser.uid || isScholarMode) && (
                                                    <button
                                                      onClick={() => handleDeleteComment(post.id, reply.id, comment.id)}
                                                      className="opacity-0 group-hover/reply:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                                                      title="Delete reply"
                                                    >
                                                      <Trash2 size={11} />
                                                    </button>
                                                  )}
                                                </div>
                                                <p className="text-xs text-slate-300 font-medium leading-relaxed">{reply.text}</p>
                                                
                                                {/* Nested Reply Trigger */}
                                                <button
                                                  onClick={() => {
                                                    setReplyingTo({
                                                      postId: post.id,
                                                      parentCommentId: comment.id,
                                                      commentId: reply.id,
                                                      userName: reply.user
                                                    });
                                                    setReplyText('');
                                                  }}
                                                  className="text-[9px] font-black text-slate-400 hover:text-noor-emerald flex items-center gap-1 cursor-pointer pt-0.5 transition-colors"
                                                >
                                                  <MessageSquare size={10} />
                                                  <span>Reply</span>
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Inline Threaded Reply Composer */}
                                      {replyingTo?.postId === post.id && replyingTo?.parentCommentId === comment.id && (
                                        <motion.div 
                                          initial={{ opacity: 0, y: -5 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          className="ml-6 sm:ml-8 pl-3.5 border-l-2 border-emerald-500/40 mt-2 space-y-1.5"
                                        >
                                          <div className="flex items-center justify-between text-[10px] font-black text-noor-emerald bg-noor-emerald/10 px-2.5 py-1 rounded-lg">
                                            <span className="flex items-center gap-1.5">
                                              <span>Replying to</span>
                                              <strong className="text-white">@{replyingTo.userName}</strong>
                                            </span>
                                            <button 
                                              onClick={() => {
                                                setReplyingTo(null);
                                                setReplyText('');
                                              }}
                                              className="text-slate-400 hover:text-white cursor-pointer"
                                            >
                                              <X size={12} />
                                            </button>
                                          </div>
                                          <div className="flex gap-2">
                                            <input
                                              autoFocus
                                              value={replyText}
                                              onChange={(e) => setReplyText(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCommentSubmit(post.id, comment.id, replyingTo.userName);
                                              }}
                                              placeholder={`Write a reply to @${replyingTo.userName}...`}
                                              className="flex-1 bg-white/5 border border-emerald-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-noor-emerald"
                                            />
                                            <button
                                              onClick={() => handleCommentSubmit(post.id, comment.id, replyingTo.userName)}
                                              disabled={!replyText.trim()}
                                              className="px-3 py-1.5 bg-noor-emerald text-slate-950 font-black rounded-xl text-xs disabled:opacity-30 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                                            >
                                              <Send size={12} />
                                              <span>Reply</span>
                                            </button>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Main Root Comment Input */}
                              <div className="flex gap-2 pt-1">
                                <input
                                  value={activePostComment?.postId === post.id ? activePostComment.text : ''}
                                  onChange={(e) => setActivePostComment({ postId: post.id, text: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCommentSubmit(post.id);
                                  }}
                                  placeholder="Add your spiritual reflection..."
                                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-noor-emerald/50"
                                />
                                <button
                                  onClick={() => handleCommentSubmit(post.id)}
                                  disabled={!(activePostComment?.postId === post.id && activePostComment.text.trim())}
                                  className="px-4 py-2.5 bg-noor-emerald text-slate-950 font-black rounded-xl disabled:opacity-30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-noor-emerald/20"
                                >
                                  <Send size={14} />
                                  <span className="text-xs font-black hidden sm:inline">Comment</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Right Sidebar - Trending Duas & Scholars */}
      <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
         <div className="glass-panel border-white/10 rounded-[2rem] p-6 space-y-6 bg-noor-gold/5 border-noor-gold/10">
            <div className="flex items-center gap-2.5">
               <TrendingUp className="text-noor-gold" size={18} />
               <h3 className="text-xs font-black text-white uppercase tracking-wider">Trending Noor</h3>
            </div>
            
            <div className="space-y-5">
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Daily Duas</h4>
                  <div className="space-y-2.5">
                     {TRENDING_DUAS.map((dua) => (
                       <div 
                         key={dua.title} 
                         onClick={() => {
                           setIsCreateModalOpen(true);
                         }}
                         className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-noor-gold/30 transition-all cursor-pointer group"
                       >
                          <p className="text-xs font-black text-white group-hover:text-noor-gold mb-0.5">{dua.title}</p>
                          <p className="text-[10px] text-slate-400 italic font-arabic">{dua.text}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5">Active Scholars</h4>
                  <div className="space-y-2">
                     {ACTIVE_SCHOLARS.map((scholar) => (
                       <div key={scholar.name} className="flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-2xl transition-all cursor-pointer">
                          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-[10px]">
                             {scholar.name[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white">{scholar.name}</p>
                             <span className="text-[8px] font-black text-noor-gold uppercase tracking-tighter">{scholar.tag}</span>
                          </div>
                          <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Ummah Scholarship */}
         <div className="glass-panel border-white/10 rounded-[2rem] p-5 relative overflow-hidden group space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-noor-emerald" />
              <h4 className="text-xs font-black text-white">Join Scholar Circle</h4>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Verified scholars can moderate community compliance, lead circles, and host reflections.
            </p>
            <button
              onClick={() => setIsScholarMode(!isScholarMode)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              {isScholarMode ? 'Disable Scholar Mode' : 'Enable Scholar Mode'}
            </button>
         </div>
      </div>

      {/* Report Post Modal for Community & Ethics Compliance */}
      <ReportPostModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedPostForReport(null);
        }}
        post={selectedPostForReport}
        currentUser={getActiveUser()}
        onSuccess={(msg) => {
          setPublishSuccessMessage(msg);
          setTimeout(() => setPublishSuccessMessage(null), 4500);
        }}
      />
    </div>
  );
}
