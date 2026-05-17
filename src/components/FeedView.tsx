import React, { useState } from 'react';
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

interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
}

interface Poll {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  userSelection?: string;
}

interface Post {
  id: string;
  user: string;
  isScholar?: boolean;
  content: string;
  time: string;
  supportCount: number;
  reconsiderCount: number;
  userVote: 'support' | 'reconsider' | null;
  comments: Comment[];
  category: 'Quran' | 'Hadith' | 'Reminders' | 'Lifestyle' | 'Charity';
  image?: string;
  isFlagged?: boolean;
  isVerified?: boolean;
  approved?: boolean;
  poll?: Poll;
}

const INITIAL_POSTS: Post[] = [
  {
    id: 'nt-1',
    user: 'Al-Azhar Student',
    isScholar: true,
    content: "Reflecting on Surah Al-Kahf today. The story of the youth in the cave teaches us that even when the whole world seems against truth, Allah's protection is sufficient. #Quran #Tafsir",
    time: '2h ago',
    supportCount: 450,
    reconsiderCount: 2,
    userVote: 'support',
    comments: [
      { id: 'c1', user: 'Zaid', text: 'Beautiful reflection, JazakAllah Khair.', time: '1h ago' }
    ],
    category: 'Quran',
    approved: true
  },
  {
    id: 'nt-2',
    user: 'Sheikh Ibrahim',
    isScholar: true,
    content: "Hadith of the Day: 'The best of you are those who are best to their families.' Sunan al-Tirmidhi. A reminder for us all to start our kindness at home.",
    time: '4h ago',
    supportCount: 1200,
    reconsiderCount: 5,
    userVote: null,
    comments: [],
    category: 'Hadith',
    approved: true
  },
  {
    id: 'nt-3',
    user: 'Help Gaza Relief',
    isVerified: true,
    content: "Assalamu Alaikum Ummah, we are looking for volunteers for the upcoming food drive this Saturday at Masjid Al-Noor. Please DM if interested! #Community #Charity",
    time: '6h ago',
    supportCount: 89,
    reconsiderCount: 0,
    userVote: null,
    comments: [],
    category: 'Charity',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
    approved: true
  },
  {
    id: 'nt-flagged-1',
    user: 'UnknownUser',
    content: "This content was flagged because it appeared to contain non-compliant themes or inappropriate discussion not fitting for NoorTalk's sacred environment.",
    time: '8h ago',
    supportCount: 0,
    reconsiderCount: 150,
    userVote: null,
    comments: [],
    category: 'Lifestyle',
    isFlagged: true,
    approved: false
  },
  {
    id: 'nt-4',
    user: 'Halal Living',
    content: "Quick tip for meal prepping halal: Focus on high-protein legumes and organic zabiha meat. It fuels the body and the soul. #HalalLifestyle",
    time: '12h ago',
    supportCount: 230,
    reconsiderCount: 12,
    userVote: null,
    comments: [],
    category: 'Lifestyle',
    approved: true
  }
];

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

export default function FeedView() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [isScholarMode, setIsScholarMode] = useState(false);
  
  // New creation state
  const [showPollEditor, setShowPollEditor] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleVote = (postId: string, type: 'support' | 'reconsider') => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (p.userVote === type) {
          // Untoggle
          return {
            ...p,
            userVote: null,
            [type === 'support' ? 'supportCount' : 'reconsiderCount']: p[type === 'support' ? 'supportCount' : 'reconsiderCount'] - 1
          };
        } else {
          // Switch or new toggle
          const oldVote = p.userVote;
          let newP = { ...p, userVote: type };
          if (oldVote) {
             newP[oldVote === 'support' ? 'supportCount' : 'reconsiderCount']--;
          }
          newP[type === 'support' ? 'supportCount' : 'reconsiderCount']++;
          return newP;
        }
      }
      return p;
    }));
  };

  const handlePostSubmit = () => {
    if (!newPost.trim() && !imagePreview && !showPollEditor) return;
    
    let pollData: Post['poll'] | undefined;
    if (showPollEditor && pollOptions.filter(o => o.trim()).length >= 2) {
      pollData = {
        options: pollOptions
          .filter(o => o.trim())
          .map((text, i) => ({ id: `opt-${i}`, text, votes: 0 })),
        totalVotes: 0
      };
    }

    const post: Post = {
      id: `nt-${Date.now()}`,
      user: 'You',
      content: newPost,
      time: 'Just now',
      supportCount: 0,
      reconsiderCount: 0,
      userVote: null,
      comments: [],
      category: 'Reminders',
      approved: true,
      image: imagePreview || undefined,
      poll: pollData
    };
    setPosts([post, ...posts]);
    setNewPost('');
    setImagePreview(null);
    setShowPollEditor(false);
    setPollOptions(['', '']);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePollVote = (postId: string, optionId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.poll && !p.poll.userSelection) {
        return {
          ...p,
          poll: {
            ...p.poll,
            userSelection: optionId,
            totalVotes: p.poll.totalVotes + 1,
            options: p.poll.options.map(opt => 
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            )
          }
        };
      }
      return p;
    }));
  };

  const handleApprovePost = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isFlagged: false, approved: true } : p));
  };

  const handleReportPost = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isFlagged: true, approved: false } : p));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-12 gap-8 pb-32">
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
            {posts
              .filter(p => activeCategory === 'All' || p.category === activeCategory)
              .map((post) => (
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
                                const isSelected = post.poll?.userSelection === opt.id;

                                return (
                                  <button
                                    key={opt.id}
                                    disabled={!!post.poll!.userSelection}
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
                                      {post.poll!.userSelection && (
                                        <span className="text-[10px] font-black text-slate-500">{percentage}%</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                              {post.poll.userSelection && (
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

                      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl">
                            <button 
                              onClick={() => handleVote(post.id, 'support')}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${post.userVote === 'support' ? 'bg-noor-emerald text-white shadow-lg shadow-noor-emerald/30' : 'text-slate-400 hover:text-noor-emerald'}`}
                            >
                               <ArrowUp size={16} />
                               Support ({post.supportCount})
                            </button>
                            <button 
                              onClick={() => handleVote(post.id, 'reconsider')}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${post.userVote === 'reconsider' ? 'bg-red-500/20 text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                            >
                               <ArrowDown size={16} />
                               Reconsider ({post.reconsiderCount})
                            </button>
                         </div>

                         <div className="flex items-center gap-2">
                             <button className="flex items-center gap-2 text-slate-500 hover:text-white px-4 py-2 rounded-xl transition-colors font-bold text-xs">
                                <MessageCircle size={18} />
                                {post.comments.length}
                             </button>
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
            ))}
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
