import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  FlipHorizontal, 
  Check, 
  Info,
  Sparkles,
  Rows,
  Square,
  Heart,
  MessageCircle,
  Volume2,
  ArrowDown,
  UserPlus,
  UserCheck,
  Send,
  CheckCircle2,
  Pin,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Image as ImageIcon,
  Clock,
  CornerDownRight,
  Globe,
  Users,
  Smile,
  Copy
} from 'lucide-react';

export interface LightboxMediaItem {
  url: string;
  type?: 'image' | 'video';
  title?: string;
  caption?: string;
  author?: string;
  authorId?: string;
  isScholar?: boolean;
  isVerified?: boolean;
  timestamp?: string;
  postId?: string;
  supportCount?: number;
  reconsiderCount?: number;
  comments?: any[];
  userVotes?: Record<string, 'support' | 'reconsider'>;
  category?: string;
  privacy?: string;
  ameens?: number;
  hearts?: number;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: string | LightboxMediaItem | (string | LightboxMediaItem)[];
  initialIndex?: number;
  currentUser?: any;
  followedUserIds?: Set<string>;
  onToggleFollow?: (creatorId: string, creatorName: string, isScholar?: boolean) => void;
  onAddComment?: (postId: string, text: string, imageAttachment?: any) => Promise<void> | void;
  onAddReply?: (postId: string, parentCommentId: string, text: string, replyToUser?: string, imageAttachment?: any) => Promise<void> | void;
  onVote?: (postId: string, type: 'support' | 'reconsider') => void;
  onCommentReaction?: (postId: string, commentId: string, reaction: 'ameen' | 'heart' | 'like', parentCommentId?: string) => void;
  onOpenAuthorProfile?: (author: { id?: string; name: string; isScholar?: boolean; isVerified?: boolean }) => void;
}

const QUICK_SPIRITUAL_DUAS = [
  'ما شاء الله 🌿',
  'جزاك الله خيراً ✨',
  'بارك الله فيك 🤲',
  'اللهم بارك 💎',
  'آمين يارب العالمين 🌸',
  'سبحان الله وبحمده 🌙',
  'تقبل الله منا ومنكم 🕊️'
];

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  currentUser,
  followedUserIds = new Set(),
  onToggleFollow,
  onAddComment,
  onAddReply,
  onVote,
  onCommentReaction,
  onOpenAuthorProfile
}) => {
  // Normalize media items into array of LightboxMediaItem
  const items: LightboxMediaItem[] = React.useMemo(() => {
    if (!media) return [];
    const arr = Array.isArray(media) ? media : [media];
    return arr.map(item => {
      if (typeof item === 'string') {
        const isVid = item.match(/\.(mp4|webm|ogg|mov)($|\?)/i);
        return {
          url: item,
          type: isVid ? 'video' : 'image'
        };
      }
      return {
        ...item,
        type: item.type || (item.url.match(/\.(mp4|webm|ogg|mov)($|\?)/i) ? 'video' : 'image')
      };
    });
  }, [media]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewMode, setViewMode] = useState<'single' | 'vertical_stream'>('single');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  
  // Local comments state for instant responsive interactions in lightbox
  const [commentInputText, setCommentInputText] = useState('');
  const [replyInputText, setReplyInputText] = useState('');
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [activeReplyUserName, setActiveReplyUserName] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentFeedbackMsg, setCommentFeedbackMsg] = useState<string | null>(null);

  // Pan / Drag State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const verticalStreamRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Sync index on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)));
      resetTransform();
      setCommentInputText('');
      setReplyInputText('');
      setActiveReplyCommentId(null);
    }
  }, [isOpen, initialIndex, items.length]);

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setPan({ x: 0, y: 0 });
  };

  const currentItem = items[currentIndex] || items[0];

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % items.length);
    resetTransform();
    setCommentInputText('');
    setReplyInputText('');
    setActiveReplyCommentId(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    resetTransform();
    setCommentInputText('');
    setReplyInputText('');
    setActiveReplyCommentId(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [items.length]);

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (viewMode === 'single') handleNext();
      } else if (e.key === 'ArrowLeft') {
        if (viewMode === 'single') handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)));
      } else if (e.key === '-' || e.key === '_') {
        setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));
      } else if (e.key === 'r' || e.key === 'R') {
        setRotation(r => (r + 90) % 360);
      } else if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev, viewMode]);

  // Double click / tap to toggle zoom
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2.2);
    } else {
      resetTransform();
    }
  };

  // Dragging logic for zoomed state
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1 || viewMode !== 'single') return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1 || viewMode !== 'single') return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = async (itemToShare?: LightboxMediaItem) => {
    const it = itemToShare || currentItem;
    if (!it?.url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: it.title || "NoorTalk Spiritual Reflection",
          text: it.caption || "View this spiritual reflection on Sanctuary App",
          url: it.url
        });
      } else {
        await navigator.clipboard.writeText(it.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(it.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const handleDownload = (itemToDownload?: LightboxMediaItem) => {
    const it = itemToDownload || currentItem;
    if (!it?.url) return;
    const a = document.createElement('a');
    a.href = it.url;
    a.download = `sanctuary-media-${Date.now()}.${it.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleLike = (url: string, postId?: string) => {
    setLikedMap(prev => ({ ...prev, [url]: !prev[url] }));
    if (postId && onVote) {
      onVote(postId, 'support');
    }
  };

  const scrollToComments = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSendComment = async (postId?: string) => {
    if (!commentInputText.trim() || !postId || !onAddComment) return;
    try {
      setIsSubmittingComment(true);
      await onAddComment(postId, commentInputText.trim());
      setCommentInputText('');
      setCommentFeedbackMsg('✨ Reflection comment posted (+10 Hasanat)!');
      setTimeout(() => setCommentFeedbackMsg(null), 3500);
    } catch (e: any) {
      alert("Failed to submit comment: " + (e.message || 'Error'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSendReply = async (postId?: string, parentCommentId?: string, replyToUser?: string) => {
    if (!replyInputText.trim() || !postId || !parentCommentId || !onAddReply) return;
    try {
      setIsSubmittingComment(true);
      await onAddReply(postId, parentCommentId, replyInputText.trim(), replyToUser);
      setReplyInputText('');
      setActiveReplyCommentId(null);
      setActiveReplyUserName(null);
      setCommentFeedbackMsg('✨ Spiritual reply shared!');
      setTimeout(() => setCommentFeedbackMsg(null), 3500);
    } catch (e: any) {
      alert("Failed to submit reply: " + (e.message || 'Error'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (!isOpen || items.length === 0) return null;

  const isAuthorFollowed = currentItem?.authorId 
    ? followedUserIds.has(currentItem.authorId) || followedUserIds.has(currentItem.author || '')
    : (currentItem?.author ? followedUserIds.has(currentItem.author) : false);

  const isMyPost = currentItem?.authorId && currentUser?.uid === currentItem.authorId;

  return (
    <AnimatePresence>
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden"
      >
        {/* TOP BAR: Controls & Gallery Info */}
        <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-30 shrink-0 border-b border-white/10">
          {/* Left: Metadata & Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">NoorTalk Media</span>
            </div>
            {items.length > 1 && (
              <span className="text-xs font-mono font-bold text-slate-300 px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/10">
                {viewMode === 'single' ? `${currentIndex + 1} / ${items.length}` : `${items.length} Stories`}
              </span>
            )}

            {/* Vertical Stream vs Single Mode Toggle */}
            {items.length > 1 && (
              <button
                onClick={() => setViewMode(v => v === 'single' ? 'vertical_stream' : 'single')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  viewMode === 'vertical_stream'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                }`}
                title={viewMode === 'single' ? "Switch to Continuous Vertical Stream" : "Switch to Single Card View"}
              >
                {viewMode === 'single' ? <Rows size={14} /> : <Square size={14} />}
                <span className="hidden sm:inline">{viewMode === 'single' ? 'Vertical Stream' : 'Single Card'}</span>
              </button>
            )}

            {/* Quick jump to comments button */}
            {currentItem.postId && (
              <button
                onClick={scrollToComments}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-noor-emerald/20 text-noor-emerald hover:bg-noor-emerald/30 border border-noor-emerald/40 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Scroll down to view spiritual comments"
              >
                <MessageCircle size={13} />
                <span>Comments ({((currentItem.comments || []).length)})</span>
              </button>
            )}
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {viewMode === 'single' && (
              <>
                <button
                  onClick={() => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  onClick={() => setFlipH(f => !f)}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden md:flex"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal size={16} />
                </button>
                <button
                  onClick={resetTransform}
                  className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex"
                  title="Reset View"
                >
                  <RotateCcw size={16} />
                </button>
              </>
            )}

            <button
              onClick={() => handleShare()}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Share or Copy Link"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            </button>
            <button
              onClick={() => handleDownload()}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Save Media"
            >
              <Download size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 bg-rose-500/20 hover:bg-rose-500 rounded-xl text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* VIEW MODE 1: VERTICAL STREAM (Continuous vertical scrolling container for media & comments) */}
        {viewMode === 'vertical_stream' ? (
          <div 
            ref={verticalStreamRef}
            className="flex-1 w-full overflow-y-auto px-4 py-6 space-y-12 max-w-3xl mx-auto scroll-smooth"
          >
            {items.map((item, idx) => {
              const isFollowed = item.authorId 
                ? followedUserIds.has(item.authorId) || followedUserIds.has(item.author || '')
                : (item.author ? followedUserIds.has(item.author) : false);
              const isMine = item.authorId && currentUser?.uid === item.authorId;

              return (
                <div 
                  key={idx}
                  id={`lightbox-vertical-item-${idx}`}
                  className="bg-slate-900/90 rounded-[2.5rem] border border-white/15 overflow-hidden shadow-2xl p-5 sm:p-7 space-y-5 relative backdrop-blur-xl"
                >
                  {/* Author Header with Follow / Following button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenAuthorProfile && item.author && onOpenAuthorProfile({
                          id: item.authorId,
                          name: item.author,
                          isScholar: item.isScholar,
                          isVerified: item.isVerified
                        })}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-base shadow cursor-pointer hover:scale-105 transition-transform"
                      >
                        {item.author ? item.author[0].toUpperCase() : 'U'}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onOpenAuthorProfile && item.author && onOpenAuthorProfile({
                              id: item.authorId,
                              name: item.author,
                              isScholar: item.isScholar,
                              isVerified: item.isVerified
                            })}
                            className="text-sm font-black text-white hover:text-noor-emerald transition-colors text-left cursor-pointer"
                          >
                            {item.author || 'Community Member'}
                          </button>
                          {item.isScholar && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-500/30">
                              <GraduationCap size={10} /> Scholar
                            </span>
                          )}
                          {item.isVerified && <CheckCircle2 size={13} className="text-noor-emerald" />}

                          {/* Follow Button */}
                          {!isMine && item.author && onToggleFollow && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFollow(item.authorId || item.author!, item.author!, item.isScholar);
                              }}
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                                isFollowed
                                  ? 'bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/40 hover:bg-rose-500/20 hover:text-rose-300'
                                  : 'bg-white/10 text-white hover:bg-noor-emerald hover:text-white border border-white/15'
                              }`}
                            >
                              {isFollowed ? (
                                <>
                                  <UserCheck size={10} className="text-noor-emerald" />
                                  <span>Following</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus size={10} />
                                  <span>+ Follow</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                          <Clock size={11} className="text-slate-500" />
                          <span>{item.timestamp || 'Spiritual Reflection'}</span>
                          {item.category && (
                            <>
                              <span className="w-1 h-1 bg-white/20 rounded-full" />
                              <span className="text-[10px] font-black text-noor-emerald uppercase">{item.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all"
                        title="Share reflection"
                      >
                        <Share2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl transition-all"
                        title="Download image"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Main Media Asset */}
                  <div 
                    className="rounded-2xl overflow-hidden border border-white/10 relative group bg-black/60 flex items-center justify-center cursor-pointer"
                    onDoubleClick={() => toggleLike(item.url, item.postId)}
                  >
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        controls
                        className="w-full max-h-[70vh] object-contain"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || "Visual Reflection"}
                        className="w-full max-h-[70vh] object-contain rounded-2xl"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-300" />
                        <span>Double-tap to like</span>
                      </span>
                    </div>
                  </div>

                  {/* Caption & Title */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLike(item.url, item.postId)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            likedMap[item.url] || (item.postId && item.userVotes?.[currentUser?.uid] === 'support')
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-white/10 text-slate-300 hover:text-white border-white/10'
                          }`}
                        >
                          <Heart size={15} className={likedMap[item.url] || (item.postId && item.userVotes?.[currentUser?.uid] === 'support') ? 'fill-rose-400 text-rose-400' : ''} />
                          <span>{(item.supportCount || 0) + (likedMap[item.url] ? 1 : 0)}</span>
                        </button>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold">
                          <MessageCircle size={14} className="text-noor-emerald" />
                          <span>{(item.comments || []).length} Comments</span>
                        </div>
                      </div>
                    </div>

                    {item.title && (
                      <h3 className="text-base font-black text-amber-300">{item.title}</h3>
                    )}
                    {item.caption && (
                      <p className="text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  {/* Comments Section directly below media in Stream mode */}
                  {item.comments && item.comments.length > 0 && (
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MessageCircle size={13} className="text-noor-emerald" />
                        <span>Spiritual Discussions & Ameens</span>
                      </h4>
                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {item.comments.slice(0, 5).map((c: any) => (
                          <div key={c.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {c.user ? c.user[0].toUpperCase() : 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">{c.user}</span>
                                <span className="text-[10px] text-slate-500">{c.time ? new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <p className="text-xs text-slate-300 mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW MODE 2: SINGLE FOCUS VIEW WITH VERTICAL SCROLLING CONTAINER INTEGRATING MEDIA & COMMENTS */
          <div 
            ref={scrollContainerRef}
            className="flex-1 w-full overflow-y-auto overflow-x-hidden relative scroll-smooth"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 flex flex-col items-center">
              {/* Top Media Presentation Stage */}
              <div 
                className="w-full relative flex flex-col items-center justify-center group"
                onDoubleClick={handleDoubleClick}
              >
                {/* Previous Media Navigation Arrow */}
                {items.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-3.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
                    title="Previous Reflection"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                {/* Next Media Navigation Arrow */}
                {items.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-3.5 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
                    title="Next Reflection"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}

                {/* Primary Media Item */}
                <div className="w-full flex items-center justify-center relative min-h-[320px] max-h-[75vh] bg-black/60 rounded-[2.5rem] border border-white/15 overflow-hidden shadow-2xl p-2 sm:p-3">
                  {currentItem.type === 'video' ? (
                    <video
                      src={currentItem.url}
                      controls
                      autoPlay
                      className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                      }}
                    />
                  ) : (
                    <motion.img
                      key={currentItem.url}
                      src={currentItem.url}
                      alt={currentItem.title || "Expanded Media"}
                      initial={{ opacity: 0.85, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                      }}
                      className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl cursor-zoom-in"
                      draggable={false}
                    />
                  )}

                  {/* Subtle double-tap notice */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                    <Sparkles size={12} className="text-amber-300" />
                    <span>Double-tap to zoom &bull; Scroll down for comments</span>
                  </div>
                </div>

                {/* Thumbnail Strip (if multiple media) */}
                {items.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-3 no-scrollbar mt-2">
                    {items.map((it, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentIndex(idx);
                          resetTransform();
                        }}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          currentIndex === idx 
                            ? 'border-amber-400 scale-105 shadow-lg shadow-amber-400/20 ring-2 ring-amber-400/40' 
                            : 'border-white/20 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={it.url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouncing Scroll Down Invitation Indicator */}
              <div 
                onClick={scrollToComments}
                className="flex items-center justify-center gap-2 text-xs font-bold text-noor-emerald bg-noor-emerald/10 hover:bg-noor-emerald/20 border border-noor-emerald/30 px-4 py-2 rounded-full cursor-pointer transition-all animate-bounce shadow-lg"
              >
                <ArrowDown size={14} className="animate-pulse" />
                <span>Scroll down to read & write spiritual comments</span>
                <MessageCircle size={14} />
              </div>

              {/* 🌟 INTEGRATED COMMENTS & REFLECTION SECTION BELOW THE MEDIA CONTENT */}
              <div 
                ref={commentsSectionRef}
                className="w-full bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6"
              >
                {/* Author Information Header & Follow Button */}
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => onOpenAuthorProfile && currentItem.author && onOpenAuthorProfile({
                        id: currentItem.authorId,
                        name: currentItem.author,
                        isScholar: currentItem.isScholar,
                        isVerified: currentItem.isVerified
                      })}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-inner cursor-pointer hover:scale-105 transition-transform"
                    >
                      {currentItem.author ? currentItem.author[0].toUpperCase() : 'U'}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onOpenAuthorProfile && currentItem.author && onOpenAuthorProfile({
                            id: currentItem.authorId,
                            name: currentItem.author,
                            isScholar: currentItem.isScholar,
                            isVerified: currentItem.isVerified
                          })}
                          className="font-black text-white text-base hover:text-noor-emerald transition-colors text-left cursor-pointer"
                        >
                          {currentItem.author || 'Community Member'}
                        </button>
                        {currentItem.isScholar && (
                          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                            <GraduationCap size={11} /> Scholar
                          </span>
                        )}
                        {currentItem.isVerified && <CheckCircle2 size={15} className="text-noor-emerald" />}

                        {/* Follow / Following Button */}
                        {!isMyPost && currentItem.author && onToggleFollow && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFollow(currentItem.authorId || currentItem.author!, currentItem.author!, currentItem.isScholar);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                              isAuthorFollowed
                                ? 'bg-noor-emerald/20 text-noor-emerald border border-noor-emerald/40 hover:bg-rose-500/20 hover:text-rose-300'
                                : 'bg-white/10 text-white hover:bg-noor-emerald hover:text-white border border-white/15'
                            }`}
                            title={isAuthorFollowed ? "Click to unfollow" : "Follow creator for new post alerts"}
                          >
                            {isAuthorFollowed ? (
                              <>
                                <UserCheck size={11} className="text-noor-emerald" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus size={11} />
                                <span>+ Follow</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-medium">
                        <Clock size={12} className="text-slate-500" />
                        <span>{currentItem.timestamp || 'Spiritual Reflection'}</span>
                        {currentItem.category && (
                          <>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[10px] font-black text-noor-emerald uppercase tracking-wider">{currentItem.category}</span>
                          </>
                        )}
                        {currentItem.privacy === 'friends' && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 text-[9px] font-bold flex items-center gap-1">
                            <Users size={10} /> Friends
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Share & Bookmark) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShare()}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                      title="Share reflection"
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload()}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                      title="Download image"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Reflection Caption & Title */}
                {(currentItem.title || currentItem.caption) && (
                  <div className="space-y-2 bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/5">
                    {currentItem.title && (
                      <h3 className="text-lg font-black text-amber-300">{currentItem.title}</h3>
                    )}
                    {currentItem.caption && (
                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                        {currentItem.caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Reaction Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLike(currentItem.url, currentItem.postId)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        likedMap[currentItem.url] || (currentItem.postId && currentItem.userVotes?.[currentUser?.uid] === 'support')
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md'
                          : 'bg-white/5 text-slate-300 hover:text-rose-400 border border-white/10'
                      }`}
                    >
                      <Heart 
                        size={16} 
                        className={likedMap[currentItem.url] || (currentItem.postId && currentItem.userVotes?.[currentUser?.uid] === 'support') ? 'fill-rose-400 text-rose-400' : ''} 
                      />
                      <span>{(currentItem.supportCount || 0) + (likedMap[currentItem.url] ? 1 : 0)} Likes</span>
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-noor-emerald/10 border border-noor-emerald/30 text-noor-emerald font-black text-xs uppercase tracking-wider">
                      <MessageCircle size={16} />
                      <span>{((currentItem.comments || []).length)} Comments</span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    Earn +10 Hasanat per spiritual comment
                  </span>
                </div>

                {/* One-Touch Quick Athkar & Duas Preset Chips */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles size={13} />
                    <span>Quick Athkar & Blessings Reply:</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {QUICK_SPIRITUAL_DUAS.map((dua, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCommentInputText(prev => prev ? `${prev} ${dua}` : dua);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-noor-emerald/20 text-slate-200 hover:text-noor-emerald border border-white/10 hover:border-noor-emerald/30 text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        {dua}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notification toast */}
                <AnimatePresence>
                  {commentFeedbackMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="p-3 bg-noor-emerald/20 border border-noor-emerald/40 rounded-xl text-xs font-black text-noor-emerald text-center flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} className="text-amber-300" />
                      <span>{commentFeedbackMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Comment Input Composer */}
                {currentItem.postId && onAddComment && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
                        {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={commentInputText}
                          onChange={(e) => setCommentInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendComment(currentItem.postId);
                            }
                          }}
                          placeholder="Share your spiritual reflection or Ameen..."
                          className="w-full bg-slate-950/80 border border-white/15 focus:border-noor-emerald rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all pr-12"
                        />
                        <button
                          disabled={!commentInputText.trim() || isSubmittingComment}
                          onClick={() => handleSendComment(currentItem.postId)}
                          className="absolute right-2 p-2 rounded-xl bg-noor-emerald text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                          title="Post Comment"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Interactive Comments List */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <MessageCircle size={14} className="text-noor-emerald" />
                    <span>Reflection Threads ({(currentItem.comments || []).length})</span>
                  </h4>

                  {(!currentItem.comments || currentItem.comments.length === 0) ? (
                    <div className="text-center py-8 px-4 bg-white/[0.015] rounded-2xl border border-white/5 text-slate-400 text-xs font-medium space-y-1">
                      <p className="text-sm font-bold text-slate-300">Be the first to share an Ameen or reflection!</p>
                      <p>Use the input above or choose a quick supplication.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                      {currentItem.comments.map((comment: any) => {
                        const isScholarComment = comment.userRole === 'scholar' || comment.user?.toLowerCase().includes('dr.') || comment.user?.toLowerCase().includes('sheikh');
                        const isHafizComment = comment.userRole === 'hafiz' || comment.user?.toLowerCase().includes('hafiz');
                        const hasHeart = comment.userReactions?.[currentUser?.uid] === 'heart' || comment.userReactions?.[currentUser?.uid] === 'like';
                        const hasAmeen = comment.userReactions?.[currentUser?.uid] === 'ameen';

                        return (
                          <div key={comment.id} className="space-y-2">
                            {/* Root Comment Box */}
                            <div className={`p-4 rounded-2xl border transition-all ${
                              comment.isPinned
                                ? 'bg-amber-500/[0.08] border-amber-500/30'
                                : 'bg-white/[0.025] hover:bg-white/[0.04] border-white/5'
                            }`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border ${
                                  isScholarComment
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : isHafizComment
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-300 border-white/10'
                                }`}>
                                  {comment.user ? comment.user[0].toUpperCase() : 'U'}
                                </div>

                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-black text-white">{comment.user}</span>
                                      {isScholarComment && (
                                        <span className="text-[8px] font-black text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                                          Scholar
                                        </span>
                                      )}
                                      {isHafizComment && (
                                        <span className="text-[8px] font-black text-emerald-300 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                                          Hafiz
                                        </span>
                                      )}
                                      {comment.isPinned && (
                                        <span className="text-[8px] font-black text-amber-400 bg-amber-400/20 px-1.5 py-0.2 rounded flex items-center gap-1">
                                          <Pin size={8} className="fill-amber-400" /> Pinned
                                        </span>
                                      )}
                                    </div>

                                    <span className="text-[10px] text-slate-500">
                                      {comment.time ? new Date(comment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                                    {comment.text}
                                  </p>

                                  {comment.imageUrl && (
                                    <div className="rounded-xl overflow-hidden border border-white/10 max-h-48 max-w-sm mt-2">
                                      <img src={comment.imageUrl} alt="Attached reflection" className="w-full h-full object-cover" />
                                    </div>
                                  )}

                                  {/* Action Bar for Comment */}
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      onClick={() => currentItem.postId && onCommentReaction && onCommentReaction(currentItem.postId, comment.id, 'ameen')}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                        hasAmeen
                                          ? 'bg-noor-emerald/20 text-noor-emerald border-noor-emerald/40'
                                          : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
                                      }`}
                                    >
                                      <span>🤲 Ameen</span>
                                      <span>({comment.ameens || 0})</span>
                                    </button>

                                    <button
                                      onClick={() => currentItem.postId && onCommentReaction && onCommentReaction(currentItem.postId, comment.id, 'heart')}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                        hasHeart
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                          : 'bg-white/5 text-slate-400 hover:text-rose-400 border-white/5'
                                      }`}
                                    >
                                      <Heart size={11} className={hasHeart ? 'fill-rose-400' : ''} />
                                      <span>({(comment.hearts || comment.likes || 0)})</span>
                                    </button>

                                    {onAddReply && (
                                      <button
                                        onClick={() => {
                                          if (activeReplyCommentId === comment.id) {
                                            setActiveReplyCommentId(null);
                                            setActiveReplyUserName(null);
                                          } else {
                                            setActiveReplyCommentId(comment.id);
                                            setActiveReplyUserName(comment.user);
                                          }
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 border border-white/5 transition-all cursor-pointer"
                                      >
                                        Reply
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Inline Reply Composer */}
                              {activeReplyCommentId === comment.id && currentItem.postId && (
                                <div className="mt-3 pt-3 border-t border-white/10 pl-11 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={replyInputText}
                                    onChange={(e) => setReplyInputText(e.target.value)}
                                    placeholder={`Replying to @${activeReplyUserName || 'member'}...`}
                                    className="flex-1 bg-slate-950 border border-white/20 focus:border-noor-emerald rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                                  />
                                  <button
                                    disabled={!replyInputText.trim() || isSubmittingComment}
                                    onClick={() => handleSendReply(currentItem.postId, comment.id, activeReplyUserName || undefined)}
                                    className="px-3 py-1.5 bg-noor-emerald text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 disabled:opacity-40 cursor-pointer"
                                  >
                                    Send
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="pl-10 space-y-2 border-l-2 border-white/10 ml-4">
                                {comment.replies.map((reply: any) => (
                                  <div key={reply.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
                                    <CornerDownRight size={14} className="text-slate-500 shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-200">{reply.user}</span>
                                        {reply.replyToUser && (
                                          <span className="text-[10px] text-noor-emerald font-semibold">@{reply.replyToUser}</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-300 mt-0.5">{reply.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
