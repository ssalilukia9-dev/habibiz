import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flag, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Send,
  Lock,
  ChevronRight
} from 'lucide-react';
import { PREDEFINED_REPORT_REASONS, ReportService } from '../services/reportService.ts';

interface ReportPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    user?: string;
    content?: string;
    image?: string;
    category?: string;
  } | null;
  currentUser: any;
  onSuccess?: (message: string) => void;
}

export default function ReportPostModal({
  isOpen,
  onClose,
  post,
  currentUser,
  onSuccess
}: ReportPostModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('inappropriate');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !post) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMsg('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const reasonObj = PREDEFINED_REPORT_REASONS.find(r => r.id === selectedReason);
    const reasonLabel = reasonObj ? reasonObj.label : selectedReason;

    try {
      const res = await ReportService.submitReport({
        postId: post.id,
        postAuthor: post.user || 'Community Member',
        postContent: post.content || '',
        postImage: post.image || '',
        postCategory: post.category || 'General',
        reportedByUid: currentUser?.uid || 'anonymous_user',
        reportedByName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Community Seeker',
        reportedByEmail: currentUser?.email || '',
        reason: reasonLabel,
        details: details.trim()
      });

      if (res.success) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess('Report submitted to Sanctuary Admin moderation team. Thank you for protecting the Ummah.');
        }
        setTimeout(() => {
          setIsSubmitted(false);
          setDetails('');
          setSelectedReason('inappropriate');
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Flag size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Report Reflection</h3>
                <p className="text-xs text-slate-400">Help maintain sacred sanctuary standards</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {isSubmitted ? (
            <div className="p-10 text-center space-y-4 my-auto">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <h4 className="text-lg font-black text-white">Report Submitted</h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                JazakAllahu Khayran. Our moderation team will audit this reflection against Sanctuary community ethics.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Reported Post Preview snippet */}
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-400">Author: <strong className="text-white">{post.user || 'Member'}</strong></span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-mono text-slate-400">{post.category || 'General'}</span>
                </div>
                {post.content && (
                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{post.content}"
                  </p>
                )}
              </div>

              {/* Error notice */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Reasons selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Select Reason for Reporting
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {PREDEFINED_REPORT_REASONS.map((r) => {
                    const isSelected = selectedReason === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedReason(r.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500/40 text-white shadow-md'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1">
                          <p className={`text-xs font-bold ${isSelected ? 'text-rose-300' : 'text-slate-200'}`}>
                            {r.label}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            {r.desc}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-rose-400 bg-rose-500' : 'border-white/20'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional comments / details */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-wider block">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any specific context or timestamps to help moderators..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/40 focus:ring-1 focus:ring-rose-500/40 resize-none"
                  maxLength={400}
                />
                <span className="text-[10px] text-slate-500 float-right">
                  {details.length}/400
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
