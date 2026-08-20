import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Zap, 
  Video, 
  Volume2, 
  BookOpen, 
  Check 
} from 'lucide-react';

interface PremiumGatewayProps {
  onActivate: () => void;
  onClose?: () => void;
}

export default function PremiumGateway({ onActivate, onClose }: PremiumGatewayProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onActivate();
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="z-0 absolute inset-0 islamic-pattern opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative z-10 w-full max-w-4xl bg-brand-sidebar/95 border border-amber-500/30 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_0_120px_rgba(245,158,11,0.15)] flex flex-col md:flex-row"
      >
        {/* Close Button if applicable */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* Left Side: VIP Features Showcase */}
        <div className="flex-1 p-8 md:p-12 bg-gradient-to-br from-amber-500/15 via-brand-depth to-transparent border-b md:border-b-0 md:border-r border-white/10 space-y-8">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-brand-depth rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Crown size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Sacred VIP Ascension</span>
              <h2 className="text-2xl md:text-3xl font-black text-white italic">Sanctuary Elite Pass</h2>
            </div>
          </div>

          <div className="space-y-3.5">
            {[
              { label: '24/7 Haramain 4K Live Streams', desc: 'Direct Kaaba & Al-Nabawi broadcasts', icon: Video },
              { label: 'Sacred Ambient Soundscapes', desc: 'Kaaba rain & Tawaf murmurs for meditation', icon: Volume2 },
              { label: '2X Hasanat Spiritual Velocity', desc: 'Double reward points across all app interactions', icon: Zap },
              { label: 'Word-by-Word Quran Analyzer', desc: 'Arabic root words & Ibn Kathir Tafseer', icon: BookOpen },
              { label: 'Ad-Free Sacred Immersion', desc: 'Pure, peaceful and distraction-free devotion', icon: Sparkles }
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <f.icon size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-white">{f.label}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <ShieldCheck size={20} className="text-amber-400 shrink-0" />
            <p className="text-[10px] text-amber-200/80 leading-relaxed font-medium">
              100% Satisfaction Guarantee. Easily managed and backed by cloud sync.
            </p>
          </div>
        </div>

        {/* Right Side: Tier Selector & Instant Activation */}
        <div className="flex-1 p-8 md:p-12 space-y-6 bg-black/30 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Spiritual Pass</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase font-mono">
                INSTANT UNLOCK
              </span>
            </div>

            {/* Tier Selectors */}
            <div className="space-y-3">
              {/* Annual (Best Value) */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-center justify-between ${
                  selectedPlan === 'annual'
                    ? 'border-amber-400 bg-amber-500/15 shadow-xl shadow-amber-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-wider">Annual Pass</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-brand-depth text-[8px] font-black uppercase tracking-widest">
                      SAVE 45%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">+5,000 Hasanat Treasury Bonus</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-400 font-mono">$20.00</span>
                  <span className="text-[9px] text-slate-400 block font-medium">/year</span>
                </div>
              </div>

              {/* Monthly */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === 'monthly'
                    ? 'border-amber-400 bg-amber-500/15 shadow-xl'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Monthly Pass</span>
                  <p className="text-[10px] text-slate-400">Cancel anytime</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white font-mono">$3.00</span>
                  <span className="text-[9px] text-slate-400 block font-medium">/month</span>
                </div>
              </div>

              {/* Lifetime */}
              <div
                onClick={() => setSelectedPlan('lifetime')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === 'lifetime'
                    ? 'border-purple-400 bg-purple-500/15 shadow-xl'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-purple-300 uppercase tracking-wider">Lifetime Patron</span>
                  <p className="text-[10px] text-slate-400">+15,000 Hasanat + VIP Badge</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-purple-300 font-mono">$79.99</span>
                  <span className="text-[9px] text-slate-400 block font-medium">/one-time</span>
                </div>
              </div>
            </div>

            {/* Mobile / Sendwave instructions */}
            <div className="p-3.5 bg-white/5 border border-white/5 rounded-2xl space-y-1 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Smartphone size={12} />
                <span>Sendwave / Direct Mobile Number</span>
              </div>
              <p>Recipient: <strong className="text-white font-mono">+256 708515639</strong></p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Crown size={16} />
              <span>{isProcessing ? 'Activating VIP Pass...' : 'Unlock Sanctuary Elite Now'}</span>
              <ArrowRight size={16} />
            </button>
            <p className="text-[9px] text-center text-slate-500 uppercase font-bold tracking-widest">
              Instant Cloud Activation • Sacred Devotion
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
