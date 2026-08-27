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
  ExternalLink
} from 'lucide-react';

export interface LightboxMediaItem {
  url: string;
  type?: 'image' | 'video';
  title?: string;
  caption?: string;
  author?: string;
  timestamp?: string;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: string | LightboxMediaItem | (string | LightboxMediaItem)[];
  initialIndex?: number;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0
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
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  
  // Pan / Drag State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)));
      resetTransform();
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
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    resetTransform();
  }, [items.length]);

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
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
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoom(z => Math.min(4, +(z + 0.15).toFixed(2)));
    } else {
      setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)));
    }
  };

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
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
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

  const handleShare = async () => {
    if (!currentItem?.url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentItem.title || 'Sanctuary Media',
          text: currentItem.caption || 'Shared from Muslim Deen Habibi Sanctuary',
          url: currentItem.url
        });
      } else {
        await navigator.clipboard.writeText(currentItem.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(currentItem.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const handleDownload = () => {
    if (!currentItem?.url) return;
    const a = document.createElement('a');
    a.href = currentItem.url;
    a.download = `sanctuary_${Date.now()}.${currentItem.type === 'video' ? 'mp4' : 'jpg'}`;
    a.target = '_blank';
    a.rel = 'noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* TOP BAR: Controls & Gallery Info */}
        <div className="w-full flex items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 shrink-0">
          {/* Left: Metadata & Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Media Viewer</span>
            </div>
            {items.length > 1 && (
              <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10">
                {currentIndex + 1} / {items.length}
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)))}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn size={17} />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut size={17} />
            </button>
            <button
              onClick={() => setRotation(r => (r + 90) % 360)}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex"
              title="Rotate 90° Clockwise (R)"
            >
              <RotateCw size={17} />
            </button>
            <button
              onClick={() => setFlipH(f => !f)}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden md:flex"
              title="Flip Horizontal"
            >
              <FlipHorizontal size={17} />
            </button>
            <button
              onClick={resetTransform}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex"
              title="Reset View (0)"
            >
              <RotateCcw size={17} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Share or Copy Link"
            >
              {copied ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
            </button>
            <button
              onClick={handleDownload}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer"
              title="Save Media"
            >
              <Download size={17} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-200 hover:text-white transition-all cursor-pointer hidden sm:flex"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
            {(currentItem.caption || currentItem.title || currentItem.author) && (
              <button
                onClick={() => setShowInfo(s => !s)}
                className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer ${
                  showInfo ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-slate-200'
                }`}
                title="Toggle Media Info"
              >
                <Info size={17} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 bg-rose-500/20 hover:bg-rose-500 rounded-xl text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer ml-1"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CENTER VIEWPORT: Canvas with Pan & Zoom */}
        <div 
          className="flex-1 relative flex items-center justify-center overflow-hidden w-full px-2 sm:px-6 cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          {/* Previous Media Arrow */}
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
              title="Previous Media (Left Arrow)"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Render Active Media Item */}
          <div className="relative max-h-[82vh] max-w-[94vw] flex items-center justify-center">
            {currentItem.type === 'video' ? (
              <video
                src={currentItem.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
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
                initial={{ opacity: 0.8, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                }}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-auto"
                draggable={false}
              />
            )}
          </div>

          {/* Next Media Arrow */}
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-2xl"
              title="Next Media (Right Arrow)"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* BOTTOM BAR: Metadata, Caption, Thumbnails & Hint */}
        <div className="w-full flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 shrink-0 space-y-2">
          {/* Metadata Card Overlay if available */}
          {showInfo && (currentItem.title || currentItem.caption || currentItem.author) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full bg-black/70 border border-white/15 rounded-2xl p-3 sm:p-4 backdrop-blur-xl text-center space-y-1 shadow-2xl"
            >
              {currentItem.title && (
                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                  {currentItem.title}
                </h4>
              )}
              {currentItem.caption && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {currentItem.caption}
                </p>
              )}
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 pt-0.5">
                {currentItem.author && <span>Sent by <strong className="text-white">{currentItem.author}</strong></span>}
                {currentItem.timestamp && <span>&bull; {currentItem.timestamp}</span>}
              </div>
            </motion.div>
          )}

          {/* Thumbnail Strip if multiple items */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full px-4 py-1 no-scrollbar">
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

          {/* Quick Shortcuts & Guidance Footer */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Double click to zoom</span>
            <span>&bull;</span>
            <span>Scroll wheel zooms</span>
            <span>&bull;</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Esc</kbd> to exit</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
