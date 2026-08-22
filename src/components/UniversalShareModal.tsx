import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Send, 
  Mail, 
  ExternalLink,
  MessageCircle,
  Download,
  Smartphone,
  Globe,
  Quote
} from 'lucide-react';
import { shareService, ShareablePayload } from '../services/shareService';

export default function UniversalShareModal() {
  const [payload, setPayload] = useState<ShareablePayload | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = shareService.subscribe(setPayload);
    return () => unsub();
  }, []);

  if (!payload) return null;

  const handleClose = () => {
    shareService.close();
  };

  const handleCopyFormatted = () => {
    const textToCopy = [
      payload.title ? `✨ ${payload.title}` : '',
      payload.arabic ? `\n"${payload.arabic}"\n` : '',
      payload.text,
      payload.source ? `\n— ${payload.source}` : (payload.author ? `\n— ${payload.author}` : ''),
      payload.url ? `\n\nShared via Aloha Sanctuary:\n${payload.url}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyLink = () => {
    const link = payload.url || window.location.href;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    const ok = await shareService.triggerNativeShare(payload);
    if (ok) {
      handleClose();
    }
  };

  const sharePlatforms = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      borderColor: 'border-emerald-500/30',
      action: () => window.open(shareService.getWhatsAppUrl(payload), '_blank')
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 hover:bg-sky-400 text-white',
      borderColor: 'border-sky-500/30',
      action: () => window.open(shareService.getTelegramUrl(payload), '_blank')
    },
    {
      name: 'X (Twitter)',
      icon: () => (
        <span className="font-mono font-black text-sm">𝕏</span>
      ),
      color: 'bg-stone-900 hover:bg-black text-white border border-white/20',
      borderColor: 'border-white/20',
      action: () => window.open(shareService.getTwitterUrl(payload), '_blank')
    },
    {
      name: 'Facebook',
      icon: Globe,
      color: 'bg-blue-600 hover:bg-blue-500 text-white',
      borderColor: 'border-blue-500/30',
      action: () => window.open(shareService.getFacebookUrl(payload), '_blank')
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-indigo-600 hover:bg-indigo-500 text-white',
      borderColor: 'border-indigo-500/30',
      action: () => window.location.href = shareService.getEmailUrl(payload)
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-gradient-to-b from-[#081b2e] via-[#05111d] to-[#030910] border border-amber-500/30 rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white italic">Share Sacred Wisdom</h3>
                <p className="text-xs text-slate-400">Spread Noor & Barakah across your community</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Visual Content Preview Card */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] no-scrollbar">
            <div 
              ref={cardRef}
              className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black/60 to-emerald-500/10 border border-amber-400/30 shadow-inner space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  {payload.badge || payload.category || 'Sacred Gem'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Aloha Sanctuary
                </span>
              </div>

              {payload.arabic && (
                <div className="text-center py-2">
                  <p className="arabic-text text-xl sm:text-2xl font-arabic font-bold text-amber-300 drop-shadow-md leading-relaxed">
                    {payload.arabic}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-sm font-black text-white line-clamp-3 leading-snug">
                  "{payload.text}"
                </h4>
                {(payload.source || payload.author) && (
                  <p className="text-xs text-amber-400/90 font-medium italic">
                    — {payload.source || payload.author}
                  </p>
                )}
              </div>
            </div>

            {/* Direct Platform Share Icons */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                Share Directly to Platforms
              </label>
              <div className="grid grid-cols-5 gap-2">
                {sharePlatforms.map((plat) => (
                  <button
                    key={plat.name}
                    onClick={plat.action}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl ${plat.color} transition-all cursor-pointer shadow-lg active:scale-95 group`}
                    title={`Share via ${plat.name}`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                      <plat.icon size={18} />
                    </div>
                    <span className="text-[9px] font-black truncate w-full text-center">{plat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons: Native Share, Copy Formatted Text, Copy Link */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <Smartphone size={16} />
                  <span>Open Device Share Menu</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyFormatted}
                  className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 cursor-pointer transition-all active:scale-95"
                >
                  {copiedText ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedText ? 'Copied Text!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/15 cursor-pointer transition-all active:scale-95"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <ExternalLink size={14} />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
