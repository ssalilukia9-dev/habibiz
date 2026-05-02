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
  Bookmark
} from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  user: string;
  content: string;
  time: string;
  likes: number;
  hasLiked?: boolean;
  comments: Comment[];
  category: 'spiritual' | 'reminder' | 'art' | 'community';
  image?: string;
  isVerified?: boolean;
  expanded?: boolean;
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    user: 'Sheikh Abdullah',
    isVerified: true,
    content: "The beauty of Fajr is that you chose Allah over your sleep. May He accept our prayers today. #Fajr #Blessings",
    time: '2h ago',
    likes: 124,
    hasLiked: false,
    comments: [
      { id: 'c1', user: 'Fatima', text: 'MashaAllah, truly a beautiful reminder.', time: '1h ago' }
    ],
    category: 'spiritual'
  },
  {
    id: 'vid-1',
    user: 'Haramain Live',
    isVerified: true,
    content: "Live scenes from the Holy Masjid of Makkah. The tawaf never stops, subhanAllah. #Makkah #Umrah",
    time: '3h ago',
    likes: 2450,
    hasLiked: false,
    comments: [],
    category: 'community',
    image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    user: 'Islamic Art Collective',
    content: "Sharing a piece of modern calligraphy of Surah Al-Ikhlas. The geometric perfection in Allah's word is unmatched.",
    time: '4h ago',
    likes: 850,
    hasLiked: true,
    comments: [],
    category: 'art',
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'art-6',
    user: 'Masjid Hub',
    content: "The sunset over the Blue Mosque in Istanbul. Architecture that reaches for the heavens. #Masjid #Travel",
    time: '5h ago',
    likes: 1205,
    hasLiked: false,
    comments: [],
    category: 'art',
    image: 'https://images.unsplash.com/photo-1541432901042-2bad311215bb?q=80&w=2072&auto=format&fit=crop'
  },
  {
    id: 'vid-2',
    user: 'Global Ummah',
    isVerified: true,
    content: "Documentary snippet: The preservation of ancient Quranic manuscripts in Timbuktu. Our intellectual heritage is vast. #History #Knowledge",
    time: '6h ago',
    likes: 1800,
    hasLiked: false,
    comments: [],
    category: 'spiritual',
    image: 'https://images.unsplash.com/photo-1584281723400-13e200ec0301?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    user: 'Hajj Companion',
    isVerified: true,
    content: "To those traveling for Hajj this year: remember that patience is half of faith. There will be crowds, but there will be immense mercy. #Hajj2024",
    time: '6h ago',
    likes: 312,
    hasLiked: false,
    comments: [
      { id: 'c2', user: 'Omar', text: 'Labaik Allahuma Labaik!', time: '2h ago' }
    ],
    category: 'reminder'
  },
  {
    id: 'art-2',
    user: 'Nomad Soul',
    content: "Found this beautiful old mosque while traveling in the mountains. The architecture tells so many stories of our elders. #History #Masjid",
    time: '8h ago',
    likes: 156,
    hasLiked: false,
    comments: [],
    category: 'art',
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1964&auto=format&fit=crop'
  },
  {
    id: 'vid-3',
    user: 'Nature & Iman',
    isVerified: true,
    content: "Time-lapse of the night sky in the Arabian desert. 'And He is the One Who has placed the stars for you...' (Surah Al-An'am). #SubhanAllah #Nature",
    time: '10h ago',
    likes: 3200,
    hasLiked: false,
    comments: [],
    category: 'spiritual',
    image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'ref-1',
    user: 'Daily Dua',
    content: "A quick article on the power of Istighfar. Seeking forgiveness isn't just about deleting sins, it's about opening doors of Barakah (blessings) in our life. \n\nIstighfar is the spiritual shield that protects us from the weights of our own mistakes. When we say 'Astaghfirullah', we are acknowledging our humanness and reaching for Divine Perfection. In the Quran, Allah tells us that through Istighfar, He will send down rain in abundance and provide for us with wealth and children. It is a key that unlocks the treasures of both worlds.",
    time: '12h ago',
    likes: 98,
    hasLiked: false,
    comments: [],
    category: 'spiritual'
  },
  {
    id: 'art-3',
    user: 'Islamic Geometrician',
    content: "The intersection of math and faith: the 12-fold symmetry in this tilework represents the infinite nature of the Creator. #Art #Geometry",
    time: '13h ago',
    likes: 450,
    hasLiked: false,
    comments: [],
    category: 'art',
    image: 'https://images.unsplash.com/photo-1590422321526-70f9da56f7e4?q=80&w=1974&auto=format&fit=crop'
  },
  {
    id: 'ref-2',
    user: 'Quranic Insights',
    content: "Reflection on Surah Ad-Duha: 'Your Lord has not forsaken you, nor has He detested you.' Sometimes we feel abandoned when things go wrong, but this verse is a warm hug for the soul. It reminds us that periods of silence are not periods of absence. Just as the morning sun follows the darkest night, ease is guaranteed after every hardship.",
    time: '15h ago',
    likes: 560,
    hasLiked: true,
    comments: [],
    category: 'spiritual'
  },
  {
    id: 'art-img-1',
    user: 'Cairo Lens',
    content: "The intricate details of the dome of Sultan Hassan Mosque. #Cairo #Heritage",
    time: '16h ago',
    likes: 314,
    hasLiked: false,
    category: 'art',
    image: 'https://images.unsplash.com/photo-1566440263301-443360879308?q=80&w=2070&auto=format&fit=crop',
    comments: []
  },
  {
    id: 'rem-2',
    user: 'Ummah News',
    isVerified: true,
    content: "Construction of the new community center in our neighborhood is almost complete. A place for learning, sports, and sisterhood. Alhamdulillah for the growth of our community. #Community #Ummah",
    time: '18h ago',
    likes: 310,
    hasLiked: false,
    comments: [],
    category: 'community'
  },
  {
    id: 'art-img-2',
    user: 'Art of Iman',
    content: "Watercolor painting of the Prophet's Mosque in Madinah. The peace of this place is unparalleled.",
    time: '20h ago',
    likes: 920,
    hasLiked: false,
    category: 'art',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop',
    comments: []
  },
  {
    id: 'art-img-3',
    user: 'Persian Patterns',
    content: "Blue tilework from Isfahan. The recursive patterns symbolize the unity of the cosmos.",
    time: '22h ago',
    likes: 450,
    hasLiked: false,
    category: 'art',
    image: 'https://images.unsplash.com/photo-1528643198035-7798705f416a?q=80&w=2071&auto=format&fit=crop',
    comments: []
  }
];

// Helper to generate repetitive but diverse content for the requested large volume
const GENERATED_ARTICLES: Post[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `gen-article-${i}`,
  user: ['Daily Reflection', 'Spiritual Path', 'Hadith Today', 'Ummah Voice', 'Sheikh Yusuf'][i % 5],
  content: [
    "The concept of Tawakkul (Trust in Allah) isn't about being passive. It's about tying your camel and then trusting Allah. It means putting in your 100% effort while knowing that the outcome is in the hands of the Al-Mighty. When we truly have Tawakkul, our hearts find peace even amidst chaos.",
    "The power of a consistent Dhikr. SubhanAllah, Alhamdulillah, Allahu Akbar. These simple words weigh heavy on the scales of judgment. Make it a habit to keep your tongue moist with the remembrance of Allah while you walk, work, or rest.",
    "Kindness to neighbors is a forgotten Sunnah. The Prophet (PBUH) emphasized the rights of neighbors so much that the companions thought they might inherit from each other. Today, reach out to your neighbor with a small gift or even just a sincere smile.",
    "Patience in times of trial. Every difficulty we face is a means of purification. 'Indeed, with hardship comes ease.' This Quranic promise is the ultimate anchor for a believer's soul. Stay firm, for the relief is near.",
    "The importance of seeking knowledge. 'Seeking knowledge is obligatory upon every Muslim.' Whether it's religious knowledge or secular sciences that benefit humanity, we are a nation of readers and thinkers."
  ][i % 5] + ` (Reflecting on Chapter ${i + 1} of spiritual growth series.)`,
  time: `${i + 1}d ago`,
  likes: Math.floor(Math.random() * 1000),
  hasLiked: false,
  comments: [],
  category: i % 2 === 0 ? 'spiritual' : 'community'
}));

const GENERATED_IMAGES: Post[] = Array.from({ length: 27 }).map((_, i) => ({
  id: `gen-art-${i}`,
  user: ['Islamic Arts', 'Global Masjids', 'Pattern Master', 'Caligraphy Oasis'][i % 4],
  content: [
    "Breathtaking view of the sunset behind the minarets.",
    "Extreme close-up of intricate geometric patterns.",
    "A candid shot of the Quran being read in a peaceful corner.",
    "The play of light and shadow in a historical mosque courtyard."
  ][i % 4] + ` #IslamicArt #Beauty #Reflection`,
  time: `${i + 2}d ago`,
  likes: Math.floor(Math.random() * 2000),
  hasLiked: false,
  comments: [],
  category: 'art',
  image: [
    'https://images.unsplash.com/photo-1542810634-71277d95dcbb',
    'https://images.unsplash.com/photo-1590076033100-336338b7764f',
    'https://images.unsplash.com/photo-1507567330391-1f398ef3c025',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
  ][i % 4] + `?q=80&w=2070&auto=format&fit=crop`
}));

INITIAL_POSTS.push(...GENERATED_ARTICLES, ...GENERATED_IMAGES);


export default function FeedView() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showProfile, setShowProfile] = useState<string | null>(null);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now().toString(),
      user: 'You',
      content: newPost,
      time: 'Just now',
      likes: 0,
      hasLiked: false,
      comments: [],
      category: 'community'
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          likes: p.hasLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const sharePost = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Islamic Reflection',
          text: `"${post.content}" - shared via Ummah App`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(post.content);
      alert('Content copied to clipboard!');
    }
  };

  const toggleExpanded = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, expanded: !p.expanded } : p));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 relative">
      {/* Stories / Members Section */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
        {['You', 'Aisha', 'Hassan', 'Zainab', 'Bilal', 'Iman'].map((name, i) => (
          <button 
            key={name}
            onClick={() => setShowProfile(name)}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className={`w-16 h-16 rounded-full p-0.5 border-2 ${i === 0 ? 'border-brand-primary' : 'border-brand-primary/30'} flex items-center justify-center bg-brand-sidebar shadow-lg active:scale-90 transition-transform`}>
               <div className="w-full h-full rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xs">
                 {name[0]}
               </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 capitalize">{i === 0 ? 'My Story' : name}</span>
          </button>
        ))}
      </div>

      {/* Create Post */}
      <div className="glass-panel p-6 rounded-[2rem] border-brand-primary/20 bg-brand-sidebar/40 backdrop-blur-xl">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
             <User size={20} />
          </div>
          <textarea 
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share a spiritual reflection..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 resize-none py-1 font-medium text-sm"
            rows={2}
          />
        </div>
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
           <button className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors font-bold text-[10px] uppercase tracking-widest">
              <ImageIcon size={16} />
              Add Image
           </button>
           <button 
             onClick={handlePost}
             disabled={!newPost.trim()}
             className="px-6 py-2 bg-brand-primary text-brand-depth font-black text-[10px] uppercase tracking-[0.2em] rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
           >
             POST
           </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {['All', 'Spiritual', 'Art', 'Community'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab 
              ? 'bg-brand-primary text-brand-depth shadow-lg shadow-brand-primary/20' 
              : 'border border-white/5 text-slate-500 hover:border-brand-primary/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {posts
            .filter(p => activeTab === 'All' || p.category.toLowerCase() === activeTab.toLowerCase())
            .map((post) => (
            <motion.div 
              key={post.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-brand-sidebar/40 border border-white/5 rounded-[2.5rem] overflow-hidden group"
            >
              {/* Post Header */}
              <div className="p-5 flex items-center justify-between">
                <div 
                  className="flex items-center gap-3 cursor-pointer group/user"
                  onClick={() => setShowProfile(post.user)}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover/user:scale-105 transition-transform">
                     {post.user[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-white text-xs uppercase tracking-wider">{post.user}</h4>
                      {post.isVerified && <CheckCircle2 size={12} className="text-brand-primary" />}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{post.time} • {post.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.user === 'You' && (
                    <button 
                      onClick={() => deletePost(post.id)}
                      className="p-2 text-slate-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button className="p-2 text-slate-700 hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-5 pb-4 space-y-4">
                <p className={`text-sm text-slate-200 leading-relaxed font-medium transition-all ${!post.expanded && post.content.length > 200 ? 'line-clamp-3' : ''}`}>
                  {post.content}
                </p>
                {post.content.length > 200 && (
                  <button 
                    onClick={() => toggleExpanded(post.id)}
                    className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                  >
                    {post.expanded ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>

              {post.image && (
                <div className="relative aspect-[4/5] overflow-hidden border-y border-white/5">
                   <img src={post.image} alt="Post content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   {post.id.startsWith('vid') && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-2xl scale-110 group-hover:scale-125 transition-transform">
                           <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1" />
                        </div>
                     </div>
                   )}
                   <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/60">
                      <Bookmark size={14} />
                   </div>
                </div>
              )}

              {/* Interaction Bar */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-all active:scale-125 ${post.hasLiked ? 'text-brand-primary' : 'text-slate-500 hover:text-red-400'}`}
                  >
                     <Heart size={20} fill={post.hasLiked ? "currentColor" : "none"} />
                     <span className="text-[10px] font-black tabular-nums">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-primary transition-colors">
                     <MessageCircle size={20} />
                     <span className="text-[10px] font-black tabular-nums">{post.comments.length}</span>
                  </button>
                  <button 
                    onClick={() => sharePost(post)}
                    className="text-slate-500 hover:text-brand-primary transition-colors"
                  >
                     <Share2 size={20} />
                  </button>
                </div>
                <div className="p-2 bg-brand-primary/5 rounded-xl text-brand-primary/40 group-hover:text-brand-primary transition-colors">
                  <Sparkles size={16} />
                </div>
              </div>

              {/* Comments Section (IG Style) */}
              {post.comments.length > 0 && (
                <div className="px-5 pb-5 pt-0 space-y-2">
                  {post.comments.map(c => (
                    <div key={c.id} className="text-[11px]">
                      <span className="font-black text-white mr-2">{c.user}</span>
                      <span className="text-slate-400 font-medium">{c.text}</span>
                    </div>
                  ))}
                  <button className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-brand-primary transition-colors">View all comments</button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Profile Modal Overlay */}
      <AnimatePresence>
        {showProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-depth/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-sidebar border border-white/5 rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="h-24 bg-gradient-to-r from-brand-primary/20 to-brand-primary/5 relative">
                <button 
                  onClick={() => setShowProfile(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-8 pb-8 -mt-10 text-center space-y-6">
                <div className="inline-flex relative">
                   <div className="w-20 h-20 rounded-full bg-brand-depth border-4 border-brand-sidebar flex items-center justify-center text-brand-primary text-2xl font-black shadow-xl">
                      {showProfile[0]}
                   </div>
                   <div className="absolute bottom-1 right-1 w-5 h-5 bg-purple-500 border-2 border-brand-sidebar rounded-full" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white capitalize">{showProfile}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Community Member</p>
                </div>
                <div className="flex gap-4 justify-center py-4 border-y border-white/5">
                   <div className="text-center">
                      <p className="text-sm font-black text-white">42</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Reflections</p>
                   </div>
                   <div className="w-px h-8 bg-white/5" />
                   <div className="text-center">
                      <p className="text-sm font-black text-white">1.2k</p>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Followers</p>
                   </div>
                </div>
                <button className="w-full py-4 bg-brand-primary text-brand-depth font-black rounded-2xl shadow-xl shadow-brand-primary/20 uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                  FOLLOW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center py-10 opacity-50">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End of Daily Reflections</p>
      </div>
    </div>
  );
}

