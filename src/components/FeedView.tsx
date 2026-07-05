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
  Flag
} from 'lucide-react';
import { doc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, deleteDoc, increment, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase.ts';
import { restDbClient } from '../lib/restDbClient.ts';
import { handleFirestoreError, OperationType } from '../lib/utils.ts';
import PremiumGateway from './PremiumGateway';

const SIDEBAR_TOPICS = [
  { name: 'Quran & Tafsir', icon: BookOpen, count: '1.2k' },
  { name: 'Hadith Studies', icon: ShieldCheck, count: '850' },
  { name: 'Spiritual Reminders', icon: Sparkles, count: '2.4k' },
  { name: 'Halal Lifestyle', icon: Users, count: '3.1k' },
  { name: 'Charity & Relief', icon: HandHeart, count: '500' }
];

const TRENDING_DUAS = [
  { title: 'Dua for Knowledge', text: 'Rabbi Zidni Ilma' },
  { title: 'Dua for Parents', text: 'Rabbir hamhuma kama...' },
  { title: 'Dua for Relief', text: 'Ya Hayyu Ya Qayyum...' }
];

const ACTIVE_SCHOLARS = [
  { name: 'Dr. Yasir', tag: 'Aalim' },
  { name: 'Sr. Fatima', tag: 'Scholar' },
  { name: 'Ustad Abu Bakr', tag: 'Imam' }
];

interface Comment {
  id: string;
  userId: string;
  user: string;
  text: string;
  time: any;
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
  time: any;
  supportCount: number;
  reconsiderCount: number;
  userVotes?: Record<string, 'support' | 'reconsider'>;
  comments: Comment[];
  category: string;
  image?: string;
  isFlagged?: boolean;
  isVerified?: boolean;
  approved?: boolean;
  poll?: Poll;
}

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
  const [newPost, setNewPost] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isScholarMode, setIsScholarMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Comment/Reply state
  const [replyingTo, setReplyingTo] = useState<{ postId: string, commentId: string } | null>(null);
  const [activePostComment, setActivePostComment] = useState<{ postId: string, text: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'report', id: string, title: string, message: string } | null>(null);

  // New creation state
  const [showPollEditor, setShowPollEditor] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Background Auto-Registration / Auto-Login for seamless interaction
  useEffect(() => {
    const autoLoginRest = async () => {
      const activeUser = getActiveUser();
      if (activeUser && activeUser.uid.startsWith('local_') && !restDbClient.isLoggedIn()) {
        const email = localStorage.getItem('saved-auth-email');
        if (email) {
          const defaultPassword = 'SanctuaryGuestPass123!';
          try {
            const user = await restDbClient.login(email, defaultPassword);
            console.log("REST session auto-activated for guest:", user.displayName);
            window.dispatchEvent(new CustomEvent('rest_auth_updated'));
          } catch (err) {
            try {
              const user = await restDbClient.register(email, defaultPassword, email.split('@')[0]);
              console.log("REST session auto-registered for guest:", user.displayName);
              window.dispatchEvent(new CustomEvent('rest_auth_updated'));
            } catch (regErr) {
              console.warn("REST auto-registration failed:", regErr);
            }
          }
        }
      }
    };
    autoLoginRest();
  }, [authTrigger]);

  // Fetch Posts from Firestore or REST Cloud Database
  useEffect(() => {
    const activeUser = getActiveUser();
    
    // Fall back to REST fetch if no firebase user is logged in
    const useRest = !activeUser || activeUser.isRest || activeUser.uid.startsWith('local_') || activeUser.uid.startsWith('guest_');

    if (useRest) {
      const fetchRestPosts = () => {
        restDbClient.getPosts()
          .then(list => {
            const mapped = list.map(p => ({
              ...p,
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
          ...doc.data(),
          // Map time if it exists
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

  const handleVote = async (postId: string, type: 'support' | 'reconsider') => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const userId = activeUser.uid;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

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
        supportCount: (p.supportCount || 0) + supportChange,
        reconsiderCount: (p.reconsiderCount || 0) + reconsiderChange
      } : p));

      try {
        await restDbClient.votePost(postId, type);
      } catch (e) {
        console.warn("REST vote submission failed:", e);
      }
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const currentVote = post.userVotes?.[userId];
    const updates: any = {};

    if (currentVote === type) {
      // Remove vote
      updates[`userVotes.${userId}`] = null;
      updates[type === 'support' ? 'supportCount' : 'reconsiderCount'] = increment(-1);
    } else {
      // Add or change vote
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

  const handlePostSubmit = async () => {
    if (!newPost.trim() && !imagePreview && !showPollEditor) return;
    const activeUser = getActiveUser();
    if (!activeUser) return;

    // Premium Check for Media/Polls
    if ((imagePreview || showPollEditor) && !isPremium) {
      onShowPremium();
      return;
    }
    
    // AI Flagging Simulation
    const isSensitive = ['debate', 'attack', 'haram', 'politics'].some(word => 
      newPost.toLowerCase().includes(word)
    );

    let pollData: any | undefined;
    if (showPollEditor && pollOptions.filter(o => o.trim()).length >= 2) {
      pollData = {
        options: pollOptions
          .filter(o => o.trim())
          .map((text, i) => ({ id: `opt-${i}`, text, votes: 0 })),
        totalVotes: 0,
        userSelections: {}
      };
    }

    if (activeUser.isRest) {
      try {
        const added = await restDbClient.addPost(newPost, 'Reminders', imagePreview, pollData);
        if (addHasanat) addHasanat(50);
        // Prepend new post to local state immediately
        const mappedNew = {
          ...added,
          id: added.id || `rest-${Date.now()}`,
          userId: activeUser.uid,
          user: activeUser.displayName,
          content: newPost,
          timeDisplay: 'Just now',
          supportCount: 0,
          reconsiderCount: 0,
          userVotes: {},
          comments: [],
          category: 'Reminders',
          image: imagePreview || null,
          poll: pollData
        };
        setPosts([mappedNew, ...posts]);
        setNewPost('');
        setImagePreview(null);
        setShowPollEditor(false);
        setPollOptions(['', '']);
      } catch (e) {
        console.warn("Failed to submit REST post:", e);
      }
      return;
    }

    const postData = {
      userId: activeUser.uid,
      user: activeUser.displayName,
      content: newPost,
      time: serverTimestamp(),
      supportCount: 0,
      reconsiderCount: 0,
      userVotes: {},
      comments: [],
      category: 'Reminders',
      isFlagged: isSensitive,
      approved: !isSensitive,
      image: imagePreview || null,
      poll: pollData
    };

    try {
      await addDoc(collection(db, 'posts'), postData);
      if (addHasanat) addHasanat(50);
      setNewPost('');
      setImagePreview(null);
      setShowPollEditor(false);
      setPollOptions(['', '']);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'posts');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Media is premium
    if (!isPremium) {
      onShowPremium();
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePollVote = async (postId: string, optionId: string) => {
    const activeUser = getActiveUser();
    if (!activeUser) return;
    const userId = activeUser.uid;
    const post = posts.find(p => p.id === postId);
    
    if (post && post.poll && !post.poll.userSelections?.[userId]) {
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
        if (addHasanat) addHasanat(10);
        return;
      }

      const postRef = doc(db, 'posts', postId);
      try {
        await updateDoc(postRef, {
          'poll.totalVotes': increment(1),
          'poll.options': newOptions,
          [`poll.userSelections.${userId}`]: optionId
        });
        if (addHasanat) addHasanat(10);
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
    setConfirmAction({
      type: 'report',
      id: postId,
      title: 'Report for Review?',
      message: 'This will hide the post and alert our community moderators to review it for halal compliance.'
    });
  };

  const handleDeletePost = (postId: string) => {
    setConfirmAction({
      type: 'delete',
      id: postId,
      title: 'Delete this post?',
      message: 'This action cannot be undone. Your reflection will be removed from the NoorTalk feed.'
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'report') {
        await updateDoc(doc(db, 'posts', confirmAction.id), { isFlagged: true, approved: false });
      } else if (confirmAction.type === 'delete') {
        await deleteDoc(doc(db, 'posts', confirmAction.id));
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `posts/${confirmAction.id}`);
    }
    
    setConfirmAction(null);
  };

  const handleCommentSubmit = async (postId: string) => {
    const activeUser = getActiveUser();
    if (!activePostComment || activePostComment.postId !== postId || !activePostComment.text.trim() || !activeUser) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: activeUser.uid,
      user: activeUser.displayName,
      text: activePostComment.text,
      time: new Date().toISOString(),
      replies: []
    };

    if (activeUser.isRest) {
      try {
        const post = posts.find(p => p.id === postId);
        if (post) {
          const updatedComments = [...(post.comments || []), newComment];
          setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
        }
        await restDbClient.commentPost(postId, activePostComment.text);
        if (addHasanat) addHasanat(20);
        setActivePostComment(null);
      } catch (e) {
        console.warn("Failed to submit REST comment:", e);
      }
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      if (post) {
        await updateDoc(postRef, {
          comments: [...post.comments, newComment]
        });
      }
      if (addHasanat) addHasanat(20);
      setActivePostComment(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `posts/${postId}/comments`);
    }
  };

  const RenderComment = ({ comment, postId, isReply = false }: { comment: Comment, postId: string, isReply?: boolean }) => {
    const isReplying = replyingTo?.commentId === comment.id;

    return (
      <div className={`space-y-4 ${isReply ? 'ml-8' : ''}`}>
        <div className="flex gap-4 group/comment">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${isReply ? 'bg-white/5 text-slate-500' : 'bg-noor-emerald/20 text-noor-emerald'}`}>
            {comment.user[0]}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">{comment.user}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Just now</span>
            </div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              {comment.text}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-12 gap-8 pb-32">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-depth/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-panel border-white/10 p-8 rounded-[3rem] max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center ${confirmAction.type === 'delete' ? 'bg-red-500/10 text-red-500' : 'bg-noor-gold/10 text-noor-gold'}`}>
                {confirmAction.type === 'delete' ? <Trash2 size={32} /> : <AlertCircle size={32} />}
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
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${confirmAction.type === 'delete' ? 'bg-red-500 text-white' : 'bg-noor-gold text-black'}`}
                >
                  Confirm Action
                </button>
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Topics */}
      <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
        <div className="glass-panel border-white/10 rounded-[2rem] p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2 px-2">
            <Compass className="text-noor-gold" size={20} />
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/50">Browse NoorTalk</h3>
          </div>
          <div className="space-y-1">
            {['All Feed', 'Following', 'Popular', 'Scholars'].map((item) => (
              <button 
                key={item}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all group flex items-center justify-between ${item === 'All Feed' ? 'bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {item}
                <ArrowUp className="opacity-0 group-hover:opacity-100 -rotate-45 transition-all" size={14} />
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 space-y-6">
             <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scholar Mode</h4>
                <button 
                  onClick={() => setIsScholarMode(!isScholarMode)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isScholarMode ? 'bg-noor-gold' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: isScholarMode ? 20 : 2 }}
                    className="absolute top-1 w-3 h-3 bg-white rounded-full"
                  />
                </button>
             </div>

             <div className="space-y-4">
                <h4 className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Islamic Topics</h4>
                <div className="space-y-1">
                    {SIDEBAR_TOPICS.map((topic) => (
                      <button 
                        key={topic.name}
                        onClick={() => setActiveCategory(topic.name.split(' ')[0])}
                        className="w-full text-left px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3"
                      >
                        <topic.icon size={18} className="text-noor-gold/60" />
                        <span className="flex-1">{topic.name}</span>
                        <span className="text-[10px] opacity-50">{topic.count}</span>
                      </button>
                    ))}
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel border-white/10 rounded-[2rem] p-6 bg-noor-emerald/5 border-noor-emerald/10">
           <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-noor-emerald" size={20} />
              <h3 className="text-sm font-black text-white">Community Adab</h3>
           </div>
           <p className="text-[11px] text-slate-400 leading-relaxed italic">
             NoorTalk is a space for scholarly discussion and spiritual upliftment. Please maintain respectful dialogue and verify all religious quotes.
           </p>
        </div>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-6 space-y-6">
        {/* Header - Mobile Only or Search */}
        <div className="lg:hidden flex items-center justify-between py-4">
           <h2 className="text-2xl font-black text-white px-2">NoorTalk</h2>
           <button className="p-3 bg-white/5 rounded-2xl">
              <Filter size={20} className="text-noor-gold" />
           </button>
        </div>

        {/* Create Post */}
        <div className="glass-panel rounded-[2.5rem] border-white/10 overflow-hidden bg-noor-charcoal/40 backdrop-blur-3xl shadow-2xl">
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex gap-5">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-noor-emerald to-noor-emerald/30 shrink-0 flex items-center justify-center text-white border border-white/10 shadow-lg">
                  <User size={24} />
               </div>
               <div className="flex-1 space-y-4">
                  <textarea 
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share a Quranic reflection or reminder..."
                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 resize-none py-2 font-medium text-lg min-h-[60px]"
                  />
                  
                  {imagePreview && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10">
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        onClick={() => setImagePreview(null)}
                        className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {showPollEditor && (
                    <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-noor-gold uppercase tracking-widest">Create Poll</span>
                        <button onClick={() => setShowPollEditor(false)} className="text-slate-500 hover:text-white">
                          <X size={14} />
                        </button>
                      </div>
                      {pollOptions.map((opt, i) => (
                        <input 
                          key={i}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...pollOptions];
                            newOpts[i] = e.target.value;
                            setPollOptions(newOpts);
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-noor-gold/50"
                        />
                      ))}
                      {pollOptions.length < 4 && (
                        <button 
                          onClick={() => setPollOptions([...pollOptions, ''])}
                          className="text-[10px] font-bold text-noor-emerald/70 hover:text-noor-emerald transition-colors"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                  )}
               </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
               <div className="flex gap-2">
                  <input 
                    type="file" 
                    hidden 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-2xl transition-all ${imagePreview ? 'bg-noor-gold text-black' : 'hover:bg-white/5 text-slate-500 hover:text-noor-gold'}`}
                  >
                     <ImageIcon size={20} />
                  </button>
                  <button 
                    onClick={() => setShowPollEditor(!showPollEditor)}
                    className={`p-3 rounded-2xl transition-all ${showPollEditor ? 'bg-noor-emerald text-white' : 'hover:bg-white/5 text-slate-500 hover:text-noor-emerald'}`}
                  >
                     <Trophy size={20} />
                  </button>
               </div>
               <button 
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim() && !imagePreview && (!showPollEditor || pollOptions.filter(o => o.trim()).length < 2)}
                  className="px-8 py-3 bg-noor-emerald text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-noor-emerald/20 disabled:opacity-30"
               >
                  Publish Noor
               </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {(() => {
              const activeUid = getActiveUser()?.uid || '';
              return posts
                .filter(p => activeCategory === 'All' || p.category === activeCategory)
                .map((post) => {
                  const myVote = post.userVotes?.[activeUid];
                  const myPollSelection = post.poll?.userSelections?.[activeUid];

                return (
              <motion.div 
                key={post.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative group overflow-hidden ${
                  post.isFlagged 
                  ? 'glass-panel border-red-500/20 bg-red-500/5 transition-all duration-500' 
                  : 'glass-panel border-white/10 hover:border-noor-emerald/30 transition-all rounded-[2.5rem]'
                }`}
              >
                {post.isFlagged ? (
                  <div className="p-8 md:p-10 space-y-6">
                    <div className="flex items-center gap-6">
                       <div className="p-4 bg-red-500/10 rounded-3xl text-red-500 border border-red-500/20">
                          <AlertCircle size={24} />
                       </div>
                       <div className="flex-1 text-left">
                          <h3 className="text-sm font-black text-white/90 uppercase tracking-widest mb-1">Halal Compliance Flag</h3>
                          <p className="text-[11px] text-slate-500 font-bold uppercase">Awaiting Scholar Approval</p>
                       </div>
                       {isScholarMode && (
                        <button 
                          onClick={() => handleApprovePost(post.id)}
                          className="px-6 py-3 bg-noor-emerald text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                        >
                          Approve Post
                        </button>
                       )}
                    </div>

                    <div className="px-6 py-5 bg-white/5 rounded-[2rem] border border-white/5 relative group/review overflow-hidden">
                       <div className="absolute inset-0 bg-brand-depth/80 backdrop-blur-md flex items-center justify-center opacity-100 group-hover/review:opacity-0 transition-opacity duration-500 z-10 pointer-events-none">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hidden for Review</span>
                       </div>
                       <p className="text-sm text-slate-400 italic blur-[2px] group-hover/review:blur-0 transition-all duration-700">
                          {post.content}
                       </p>
                    </div>
                     
                    {!isScholarMode && (
                      <div className="flex justify-center gap-6 pt-2">
                        <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors underline">Community Rules</button>
                        <button className="text-[10px] font-black text-red-500/60 uppercase tracking-widest hover:text-red-500 transition-colors">Appeal Removal</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Post Content */}
                    <div className="p-6 md:p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner border border-white/5 ${post.isScholar ? 'bg-noor-gold/10 text-noor-gold' : 'bg-noor-emerald/10 text-noor-emerald'}`}>
                               {post.user[0]}
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  <h4 className="font-black text-white text-sm">{post.user}</h4>
                                  {post.isScholar && (
                                    <span className="px-2 py-0.5 bg-noor-gold/20 text-noor-gold rounded-full text-[8px] font-black uppercase tracking-widest">Scholar</span>
                                  )}
                                  {post.isVerified && <CheckCircle2 size={14} className="text-noor-emerald" />}
                               </div>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{post.time}</span>
                                  <span className="w-1 h-1 bg-white/10 rounded-full" />
                                  <span className="text-[10px] font-black text-noor-emerald uppercase tracking-wider">{post.category}</span>
                               </div>
                            </div>
                         </div>
                         <button className="p-2 text-slate-600 hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                         </button>
                      </div>

                      <div className="space-y-4">
                         <p className="text-lg text-slate-200 leading-relaxed font-medium">
                            {post.content}
                         </p>
                         
                         {post.poll && (
                           <div className="space-y-3 bg-white/5 p-6 rounded-[2rem] border border-white/5">
                              {post.poll.options.map((opt) => {
                                const percentage = post.poll!.totalVotes > 0 
                                  ? Math.round((opt.votes / post.poll!.totalVotes) * 100) 
                                  : 0;
                                const isSelected = myPollSelection === opt.id;

                                return (
                                  <button
                                    key={opt.id}
                                    disabled={!!myPollSelection}
                                    onClick={() => handlePollVote(post.id, opt.id)}
                                    className="w-full relative h-12 rounded-xl overflow-hidden group/poll border border-white/10 hover:border-noor-gold/30 transition-all text-left"
                                  >
                                    <div 
                                      className={`absolute left-0 top-0 h-full transition-all duration-1000 ${isSelected ? 'bg-noor-gold/20' : 'bg-noor-emerald/10'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                    <div className="relative px-4 h-full flex items-center justify-between">
                                      <span className={`text-xs font-bold ${isSelected ? 'text-noor-gold' : 'text-white'}`}>
                                        {opt.text}
                                      </span>
                                      {myPollSelection && (
                                        <span className="text-[10px] font-black text-slate-500">{percentage}%</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                              {myPollSelection && (
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                                  {post.poll.totalVotes} total responses
                                </p>
                              )}
                           </div>
                         )}

                         {post.image && (
                           <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                              <img src={post.image} alt="Post asset" className="w-full h-auto" referrerPolicy="no-referrer" />
                           </div>
                         )}
                      </div>

                      {/* Quick Comments Section */}
                      {post.comments.length > 0 && (
                        <div className="pt-6 border-t border-white/5 space-y-6">
                           <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Community Reflections</h5>
                           <div className="space-y-6">
                              {post.comments.map((comment) => (
                                <RenderComment key={comment.id} comment={comment} postId={post.id} />
                              ))}
                           </div>
                           
                           {/* Add Top-Level Comment */}
                           <div className="mt-4 flex gap-4">
                              <div className="w-8 h-8 rounded-xl bg-noor-emerald/10 text-noor-emerald flex items-center justify-center text-[10px] font-black shrink-0">
                                 Y
                              </div>
                              <div className="flex-1 flex gap-2">
                                 <input 
                                   value={(activePostComment?.postId === post.id) ? activePostComment.text : ''}
                                   onChange={(e) => setActivePostComment({ postId: post.id, text: e.target.value })}
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCommentSubmit(post.id);
                                   }}
                                   placeholder="Add your reflection..."
                                   className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-noor-emerald/50 transition-all font-medium"
                                 />
                                 <button 
                                   onClick={() => handleCommentSubmit(post.id)}
                                   disabled={!(activePostComment?.postId === post.id && activePostComment.text.trim())}
                                   className="p-2 bg-noor-emerald text-white rounded-xl shadow-lg shadow-noor-emerald/10 disabled:opacity-30 active:scale-95 transition-all"
                                 >
                                    <Send size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>
                      )}
                      
                      {post.comments.length === 0 && (
                        <div className="pt-6 border-t border-white/5">
                           <div className="flex gap-4">
                              <div className="w-8 h-8 rounded-xl bg-white/5 text-slate-600 flex items-center justify-center text-[10px] font-black shrink-0">
                                 ?
                              </div>
                              <div className="flex-1 flex gap-2">
                                 <input 
                                   value={(activePostComment?.postId === post.id) ? activePostComment.text : ''}
                                   onChange={(e) => setActivePostComment({ postId: post.id, text: e.target.value })}
                                   onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleCommentSubmit(post.id);
                                   }}
                                   placeholder="Be the first to reflect..."
                                   className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-noor-emerald/50"
                                 />
                                 <button 
                                   onClick={() => handleCommentSubmit(post.id)}
                                   disabled={!(activePostComment?.postId === post.id && activePostComment.text.trim())}
                                   className="p-2 bg-noor-emerald text-white rounded-xl shadow-lg shadow-noor-emerald/10 disabled:opacity-30"
                                 >
                                    <Send size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl">
                            <button 
                              onClick={() => handleVote(post.id, 'support')}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${myVote === 'support' ? 'bg-noor-emerald text-white shadow-lg shadow-noor-emerald/30' : 'text-slate-400 hover:text-noor-emerald'}`}
                            >
                               <ArrowUp size={16} />
                               Support ({post.supportCount})
                            </button>
                            <button 
                              onClick={() => handleVote(post.id, 'reconsider')}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${myVote === 'reconsider' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                            >
                               <ArrowDown size={16} />
                               Reconsider ({post.reconsiderCount})
                            </button>
                            <div className="w-px h-6 bg-white/5 mx-1 hidden sm:block" />
                            <button className="flex items-center gap-2 text-slate-500 hover:text-white px-4 py-2.5 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-widest">
                               <MessageCircle size={16} />
                               {post.comments.length} Comments
                            </button>
                         </div>

                         <div className="flex items-center gap-2 ml-auto sm:ml-0">
                             {post.user === 'You' && (
                               <button 
                                 onClick={() => handleDeletePost(post.id)}
                                 className="p-3 text-slate-500 hover:text-red-500 transition-colors"
                                 title="Delete post"
                               >
                                  <Trash2 size={18} />
                               </button>
                             )}
                             <button className="p-3 text-slate-500 hover:text-noor-gold transition-colors">
                                <Bookmark size={20} />
                             </button>
                             <button className="p-3 text-slate-500 hover:text-noor-emerald transition-colors">
                                <Share2 size={20} />
                             </button>
                             <button 
                               onClick={() => handleReportPost(post.id)}
                               className="p-3 text-slate-500 hover:text-red-500 transition-colors"
                               title="Report content"
                             >
                                <Flag size={18} />
                             </button>
                         </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })})()}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar - Trending & Scholars */}
      <div className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24 h-fit">
         {/* Trending Section */}
         <div className="glass-panel border-white/10 rounded-[2rem] p-6 space-y-6 bg-noor-gold/5 border-noor-gold/10">
            <div className="flex items-center gap-3">
               <TrendingUp className="text-noor-gold" size={20} />
               <h3 className="text-sm font-black text-white uppercase tracking-wider">Trending Noor</h3>
            </div>
            
            <div className="space-y-6">
               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Daily Duas</h4>
                  <div className="space-y-3">
                     {TRENDING_DUAS.map((dua) => (
                       <div key={dua.title} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-noor-gold/30 transition-all cursor-pointer group">
                          <p className="text-xs font-black text-white group-hover:text-noor-gold mb-1">{dua.title}</p>
                          <p className="text-[10px] text-slate-400 italic font-arabic">{dua.text}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Active Circles</h4>
                  <div className="space-y-3">
                     {ACTIVE_SCHOLARS.map((scholar) => (
                       <div key={scholar.name} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-[10px]">
                             {scholar.name[0]}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white">{scholar.name}</p>
                             <span className="text-[9px] font-black text-noor-gold uppercase tracking-tighter">{scholar.tag}</span>
                          </div>
                          <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Scholarship Ad */}
         <div className="glass-panel border-white/10 rounded-[2rem] p-1 overflow-hidden group">
            <div className="relative p-6 space-y-4">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <BookOpen size={64} className="text-noor-emerald" />
               </div>
               <h3 className="text-lg font-black text-white leading-tight">Deepen Your <br/>Religious Understanding</h3>
               <p className="text-[11px] text-slate-400 font-medium">Join our verified scholar program to lead circles and moderate content.</p>
               <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all">
                  Apply Now
               </button>
            </div>
         </div>

         {/* ISIS Wrists Sponsorship */}
         <div className="glass-panel border-brand-primary/20 rounded-[2rem] p-6 bg-brand-primary/5 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
               <Sparkles size={24} />
            </div>
            <div>
               <p className="text-[8px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">Official Partner</p>
               <h4 className="text-sm font-black text-white">ISIS WRISTS</h4>
               <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest leading-relaxed">Timeless Precision for the Modern Believer</p>
            </div>
            <button className="text-[10px] font-black text-noor-gold uppercase underline tracking-widest hover:text-white transition-colors">Shop Collection</button>
         </div>
      </div>
    </div>
  );
}
