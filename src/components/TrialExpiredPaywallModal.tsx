import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Crown, 
  Sparkles, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Brain, 
  Moon, 
  Heart,
  AlertCircle,
  X
} from 'lucide-react';
import { trialService } from '../services/trialService.ts';

interface TrialExpiredPaywallModalProps {
  currentUser?: any;
  onUnlocked: () => void;
  onOpenFullGateway?: () => void;
  onContinueFree?: () => void;
  onClose?: () => void;
  featureName?: string;
}

export default function TrialExpiredPaywallModal({
  currentUser,
  onUnlocked,
  onOpenFullGateway,
  onContinueFree,
  onClose,
  featureName = 'Deen Sanctuary'
}: TrialExpiredPaywallModalProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime' | 'monthly'>('annual');

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please enter your promo or activation code.'
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: 'idle', message: '' });

    try {
      const res = await trialService.redeemCode(promoCode, currentUser);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          onUnlocked();
        }, 1500);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to redeem code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantSubscribe = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      trialService.applyPremium(selectedPlan, selectedPlan === 'lifetime' ? 3650 : selectedPlan === 'annual' ? 365 : 30);
      setFeedback({
        type: 'success',
        message: "🎉 Masha'Allah! Premium Access Activated. Welcome to Sanctuary Elite!"
      });
      setTimeout(() => {
        onUnlocked();
      }, 1200);
    }, 600);
  };

  const features = [
    { icon: Brain, title: 'Aliyah 24/7 AI Talk Pal & Sheikh Companion' },
    { icon: Sparkles, title: 'Aliyah Memorization & Hifz AI Voice Studio' },
    { icon: Moon, title: 'Virtual Sacred 3D Artifacts & Hajj Simulator' },
    { icon: BookOpen, title: 'Full 114 Surahs Recitation & Offline Audio' },
    { icon: Zap, title: '2X Hasanat Multiplier & 100% Ad-Free Haven' }
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-xl rounded-[2.5rem] border border-amber-500/40 bg-gradient-to-b from-[#16121f] via-[#0e0b16] to-[#08060d] p-6 sm:p-8 md:p-10 shadow-[0_0_80px_rgba(245,158,11,0.25)] space-y-6 text-left my-auto"
      >
        {/* Close Button if dismissible */}
        {(onClose || onContinueFree) && (
          <button
            onClick={() => {
              if (onClose) onClose();
              else if (onContinueFree) onContinueFree();
            }}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            title="Dismiss & Return to Free Plan"
          >
            <X size={18} />
          </button>
        )}

        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header with Lock and Crown */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black shadow-lg shadow-amber-500/30 shrink-0">
              <Crown size={28} className="fill-black" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-600 border-2 border-[#16121f] flex items-center justify-center text-white">
              <Lock size={12} />
            </div>
          </div>

          <div className="space-y-1 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={11} /> Free Trial Concluded
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Unlock {featureName}
            </h3>
            <p className="text-xs text-slate-300">
              Your free trial has ended. Standard Quran, 5 Prayers, Qibla, Tasbih, Adhkar & Community Chat remain 100% free! Upgrade or redeem code to unlock Aliyah AI Talk Pal, Hifz studio, and premium tools.
            </p>
          </div>
        </div>

        {/* Free Plan Assurance Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs text-emerald-300">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-white">Your Free Plan Remains Active</p>
            <p className="text-[11px] text-emerald-300/90 leading-relaxed">
              Standard Holy Quran (114 Surahs & reciters), 5 Pillars of Islam & Prayer Times, Qibla compass, Digital Tasbih, Adhkar library, and Community Chat (Firdaus Charity) are always accessible without payment.
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            Included in Premium Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  <span className="text-[11px] font-medium leading-tight">{f.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promo Code Input Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <KeyRound size={14} /> Have a VIP / Promo Code?
            </label>
            <span className="text-[10px] text-slate-400">Instant VIP Access</span>
          </div>

          <form onSubmit={handleRedeemCode} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. MH-VIP-2214, RAMADAN, UMMAH2026..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 text-white placeholder-slate-500 text-xs font-mono tracking-wider focus:outline-none focus:border-amber-400 uppercase"
            />
            <button
              type="submit"
              disabled={isSubmitting || !promoCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer shadow-md"
            >
              <span>Unlock</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick hint for sample demo codes */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 flex-wrap">
            <span>VIP & Promo Codes:</span>
            {['MH-VIP-2214', 'RAMADAN', 'UMMAH2026', 'BARAKAH', 'SALAM2026', 'VIPPASS'].map(code => (
              <button
                key={code}
                type="button"
                onClick={() => setPromoCode(code)}
                className={`px-2 py-0.5 rounded-md font-mono text-[9px] border transition-colors cursor-pointer ${
                  code === 'MH-VIP-2214' 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black'
                    : 'bg-white/5 hover:bg-white/15 text-amber-200 border-white/10'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          {feedback.message && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </motion.div>
          )}
        </div>

        {/* Pricing Options */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Or Select a Sanctuary Membership
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'monthly', title: 'Monthly', price: '$4.99', sub: 'Billed monthly' },
              { id: 'annual', title: 'Annual', price: '$29.99', sub: '$2.50/mo • Best Value', popular: true },
              { id: 'lifetime', title: 'Lifetime', price: '$69.99', sub: 'Pay once, own forever' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id as any)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                  selectedPlan === p.id
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[8px] font-black uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <p className="text-xs font-bold text-slate-300">{p.title}</p>
                <p className="text-base sm:text-lg font-black text-white">{p.price}</p>
                <p className="text-[9px] text-slate-400 leading-tight truncate">{p.sub}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleInstantSubscribe}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Crown size={16} className="fill-black" />
            <span>Activate {selectedPlan.toUpperCase()} Sanctuary Access</span>
          </button>

          {/* Continue with Free Plan Button */}
          {onContinueFree && (
            <button
              onClick={onContinueFree}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
            >
              <span>Continue with Free Plan (Quran, Prayers, Qibla, Tasbih, Adhkar & Chat)</span>
            </button>
          )}
        </div>

        {/* Security & Guarantee Note */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-white/5">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" /> 100% Halal Guarantee
          </span>
          <span>&bull;</span>
          <span>Instant Activation</span>
          <span>&bull;</span>
          <span>Cancel Anytime</span>
        </div>
      </motion.div>
    </div>
  );
}
