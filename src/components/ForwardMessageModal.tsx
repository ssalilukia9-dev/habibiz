import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Share2, 
  Send, 
  Users, 
  Hash, 
  Lock, 
  Check, 
  Search, 
  MessageSquare,
  Sparkles,
  CornerUpRight
} from 'lucide-react';
import { Message, Room } from './ChatView';

interface ForwardMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  rooms: Room[];
  currentRoomId: string;
  onForward: (targetRoomId: string, message: Message) => Promise<void>;
}

export default function ForwardMessageModal({
  isOpen,
  onClose,
  message,
  rooms,
  currentRoomId,
  onForward
}: ForwardMessageModalProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [forwardingTo, setForwardingTo] = useState<string | null>(null);
  const [forwardSuccess, setForwardSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !message) return null;

  const filteredRooms = rooms.filter(room => {
    if (room.id === currentRoomId) return false;
    if (!searchTerm.trim()) return true;
    return room.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleForward = async (roomId: string) => {
    setForwardingTo(roomId);
    try {
      await onForward(roomId, message);
      setForwardSuccess(roomId);
      setTimeout(() => {
        setForwardSuccess(null);
        setForwardingTo(null);
        onClose();
      }, 900);
    } catch (err) {
      console.error("Failed to forward:", err);
      setForwardingTo(null);
    }
  };

  const handleCopyFormatted = () => {
    const textToCopy = `"${message.text}"\n— Forwarded from ${message.senderName} on Aloha Sanctuary`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div 
        id="forward-message-modal"
        className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-gradient-to-b from-brand-surface to-brand-depth rounded-[2rem] border border-white/15 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white/5 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                <CornerUpRight size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Forward Message</h3>
                <p className="text-[10px] text-slate-400">Select a channel or direct chat to forward</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Message Preview Snippet */}
          <div className="p-3.5 bg-black/40 border-b border-white/10">
            <div className="p-3 rounded-xl bg-white/5 border-l-4 border-brand-primary text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-brand-primary">{message.senderName}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">Original</span>
              </div>
              <p className="text-slate-200 line-clamp-3 text-xs leading-relaxed">{message.text || (message.imageUrl ? '📷 [Photo Attached]' : '🎤 [Voice Note]')}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations & channels..."
                className="w-full bg-white/5 border border-white/10 focus:border-brand-primary rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>

          {/* Target List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/5">
            {filteredRooms.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare size={24} className="mx-auto text-slate-500" />
                <p>No other channels or chats found.</p>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isForwarding = forwardingTo === room.id;
                const isSuccess = forwardSuccess === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => !isForwarding && handleForward(room.id)}
                    className="p-3 rounded-xl hover:bg-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/20">
                        {room.type === 'group' ? <Users size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{room.name}</p>
                        <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider font-mono">
                          {room.type === 'group' ? 'Community Channel' : 'Direct Conversation'}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isForwarding}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSuccess
                          ? 'bg-emerald-500 text-white'
                          : isForwarding
                          ? 'bg-brand-primary/30 text-white animate-pulse'
                          : 'bg-brand-primary hover:bg-brand-secondary text-brand-depth'
                      }`}
                    >
                      {isSuccess ? (
                        <>
                          <Check size={13} />
                          <span>Sent</span>
                        </>
                      ) : isForwarding ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Quick Copy Option */}
          <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyFormatted}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copied ? 'Copied with Citation' : 'Copy Quote Text'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
