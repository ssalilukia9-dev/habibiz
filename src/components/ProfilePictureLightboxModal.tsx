import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Crown, 
  Camera, 
  User as UserIcon, 
  Share2, 
  Check, 
  Heart,
  Moon,
  Compass
} from 'lucide-react';

export interface ProfileViewData {
  name: string;
  photoUrl?: string | null;
  email?: string;
  role?: string;
  isPremium?: boolean;
  hasanat?: number;
  joinedDate?: string;
  bio?: string;
  isCurrentUser?: boolean;
  onEditPhoto?: () => void;
}

interface ProfilePictureLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileViewData | null;
}

export default function ProfilePictureLightboxModal({
  isOpen,
  onClose,
  profile
}: ProfilePictureLightboxModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  if (!isOpen || !profile) return null;

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  const hasPhoto = profile.photoUrl && !imageError;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleDownload = () => {
    if (hasPhoto && profile.photoUrl) {
      const a = document.createElement('a');
      a.href = profile.photoUrl;
      a.download = `${profile.name.replace(/\s+/g, '_')}_profile.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name}'s Sanctuary Profile`,
        text: `View ${profile.name}'s profile on Aloha Islamic Sanctuary`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(profile.photoUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="profile-picture-lightbox"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-gradient-to-b from-brand-surface via-slate-900 to-black rounded-[2.5rem] border border-amber-500/30 overflow-hidden shadow-2xl flex flex-col relative"
        >
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">{profile.name}</h3>
                  {profile.isPremium && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-brand-depth text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                      <Crown size={10} />
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile.role || 'Honored Ummah Member'} • Profile Picture Viewer
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="Close viewer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Picture / Avatar Showcase Viewport */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] bg-black/60 flex items-center justify-center overflow-hidden p-6">
            
            {/* Celestial Ambient Glow Background */}
            <div className="absolute inset-0 bg-radial from-amber-500/15 via-transparent to-transparent pointer-events-none" />

            {hasPhoto ? (
              /* REAL PHOTO DISPLAY WITH ZOOM & ROTATE */
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={profile.photoUrl!}
                  alt={profile.name}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out'
                  }}
                  className={`max-w-full max-h-72 sm:max-h-80 rounded-3xl object-contain shadow-2xl border-2 border-white/20 select-none ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              /* SPIRITUAL ISLAMIC AVATAR FALLBACK EXPANSION */
              <div className="relative flex flex-col items-center justify-center text-center space-y-4">
                {/* Concentric Geometric Mandala Rings */}
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-2 border-dashed border-amber-400/30 flex items-center justify-center p-3 animate-pulse">
                  <div className="w-full h-full rounded-full border-2 border-amber-400/20 bg-gradient-to-tr from-amber-500/20 via-emerald-500/10 to-indigo-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    
                    {/* Big Calligraphic Initial Badge */}
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-brand-depth font-black text-4xl sm:text-5xl flex items-center justify-center shadow-2xl tracking-tight font-arabic drop-shadow-lg">
                      {initials}
                    </div>

                  </div>
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-white/10">
                    Spiritual Ummah Monogram
                  </span>
                  <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                    No custom photo uploaded yet. Displaying personalized Islamic geometric avatar.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Action Overlay Controls (Zoom / Rotate / Reset) */}
            {hasPhoto && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-2xl">
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Rotate clockwise"
                >
                  <RotateCw size={16} />
                </button>
                {(zoomLevel !== 1 || rotation !== 0) && (
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl bg-amber-400 text-brand-depth hover:bg-amber-300 transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Details & Bio Card */}
          <div className="p-5 sm:p-6 bg-white/[0.02] border-t border-white/10 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {profile.hasanat !== undefined && (
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Spiritual Rank</span>
                  <div className="flex items-center gap-1 text-amber-400 font-black text-xs font-mono">
                    <Sparkles size={12} />
                    <span>{profile.hasanat.toLocaleString()} Hasanat</span>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Membership</span>
                <span className="text-xs font-bold text-emerald-400">
                  {profile.isPremium ? 'Sanctuary VIP' : 'Sanctuary Member'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider block">Identity Status</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {hasPhoto ? 'Photo Verified' : 'Standard Avatar'}
                </span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center gap-2 pt-1">
              {profile.isCurrentUser && profile.onEditPhoto && (
                <button
                  onClick={() => {
                    onClose();
                    profile.onEditPhoto!();
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-brand-depth font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
                >
                  <Camera size={15} />
                  <span>{hasPhoto ? 'Change Photo' : 'Upload Profile Picture'}</span>
                </button>
              )}

              {hasPhoto && (
                <button
                  onClick={handleDownload}
                  className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  title="Download photo"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Share profile"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
