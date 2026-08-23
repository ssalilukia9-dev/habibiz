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
  Check,
  Brain,
  Compass,
  DollarSign,
  Users,
  CreditCard,
  ExternalLink,
  Globe
} from 'lucide-react';

interface PremiumGatewayProps {
  onActivate: () => void;
  onClose?: () => void;
}

export default function PremiumGateway({ onActivate, onClose }: PremiumGatewayProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime'>('annual');
  const [selectedRail, setSelectedRail] = useState<'instant' | 'external' | 'mobile'>('instant');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onActivate();
      setIsProcessing(false);
    }, 600);
  };

  const lockedFeatures = [
    { 
      label: 'Google Gemini Pro AI Tajweed Masterclass', 
      desc: 'Deep AI recitation audits, Makharij evaluation, & live Hifz coaching', 
      icon: Brain,
      tag: 'AI PRO'
    },
    { 
      label: 'Holy Aliyah Spiritual AI Companion', 
      desc: 'Unlimited Quranic counseling, voice reflections, & spiritual chat', 
      icon: Sparkles,
      tag: 'VOICE AI'
    },
    { 
      label: 'Studio Master Qaris & Slow Teacher Mode', 
      desc: 'Sheikh Sudais & Mahmoud Khalil Al-Husary slow Murattal', 
      icon: BookOpen,
      tag: 'HD AUDIO'
    },
    { 
      label: '3D Interactive Hajj & Umrah Pilgrimage Tour', 
      desc: '360° virtual Mecca/Madina routes & GPS step-by-step guidance', 
      icon: Compass,
      tag: '3D VIRTUAL'
    },
    { 
      label: '24/7 Haramain 4K Live Streams & Soundscapes', 
      desc: 'Direct Kaaba broadcast & ambient Tawaf rain meditation', 
      icon: Video,
      tag: '4K ULTRA'
    },
    { 
      label: 'Islamic Finance & Zakat Wealth Optimizer', 
      desc: 'Real-time Nisab valuation, halal equities & multi-asset Zakat ledger', 
      icon: DollarSign,
      tag: 'WEALTH'
    },
    { 
      label: 'Ummah VIP Circle & Priority Dua Request', 
      desc: 'Gold verified Voyager badge & priority global community prayers', 
      icon: Users,
      tag: 'COMMUNITY'
    },
    { 
      label: '2X Hasanat Spiritual Velocity & Zero Ads', 
      desc: 'Double reward points on every verse & completely distraction-free', 
      icon: Zap,
      tag: '2X HASANAT'
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="z-0 absolute inset-0 islamic-pattern opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative z-10 w-full max-w-5xl bg-brand-sidebar/95 border border-amber-500/30 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(245,158,11,0.2)] flex flex-col lg:flex-row my-auto"
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        )}

        {/* Left Side: 8 Exclusive Locked Features Showcase */}
        <div className="flex-1 p-6 md:p-10 bg-gradient-to-br from-amber-500/15 via-brand-depth to-transparent border-b lg:border-b-0 lg:border-r border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-brand-depth rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
              <Crown size={28} />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">Sacred VIP Ascension</span>
              <h2 className="text-2xl md:text-3xl font-black text-white italic">Sanctuary Elite VIP Pass</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {lockedFeatures.map((f, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <f.icon size={14} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-white truncate">{f.label}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <ShieldCheck size={20} className="text-amber-400 shrink-0" />
            <p className="text-[10px] text-amber-200/90 leading-relaxed font-medium">
              100% Satisfaction Guarantee. Unlocks across all your mobile & desktop devices instantly.
            </p>
          </div>
        </div>

        {/* Right Side: Tier Selector, External Gateway Rails & Instant Activation */}
        <div className="flex-1 p-6 md:p-10 space-y-5 bg-black/40 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Choose Spiritual Pass</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase font-mono">
                EXTERNAL GATEWAY READY
              </span>
            </div>

            {/* Tier Selectors */}
            <div className="space-y-2.5">
              {/* Annual (Best Value) */}
              <div
                onClick={() => setSelectedPlan('annual')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex items-center justify-between ${
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
                  <p className="text-[10px] text-slate-400">+5,000 Hasanat Bonus • Unlimited AI</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-400 font-mono">$20.00</span>
                  <span className="text-[9px] text-slate-400 block font-medium">/year</span>
                </div>
              </div>

              {/* Monthly */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === 'monthly'
                    ? 'border-amber-400 bg-amber-500/15 shadow-xl'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Monthly Pass</span>
                  <p className="text-[10px] text-slate-400">Cancel anytime • Full Access</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white font-mono">$3.00</span>
                  <span className="text-[9px] text-slate-400 block font-medium">/month</span>
                </div>
              </div>

              {/* Lifetime */}
              <div
                onClick={() => setSelectedPlan('lifetime')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPlan === 'lifetime'
                    ? 'border-purple-400 bg-purple-500/15 shadow-xl'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-purple-300 uppercase tracking-wider">Lifetime Patron</span>
                  <p className="text-[10px] text-slate-400">+15,000 Hasanat + VIP Gold Badge</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-purple-300 font-mono">$79.99</span>
                  <span className="text-[9px] text-slate-400 block font-medium">/one-time</span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Rails */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Select Gateway Method</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRail('instant')}
                  className={`py-2 px-1.5 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedRail === 'instant'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <Zap size={13} />
                  <span>Instant Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRail('external')}
                  className={`py-2 px-1.5 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedRail === 'external'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <CreditCard size={13} />
                  <span>Card / Stripe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRail('mobile')}
                  className={`py-2 px-1.5 rounded-xl border text-[10px] font-black flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    selectedRail === 'mobile'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone size={13} />
                  <span>Sendwave / MTN</span>
                </button>
              </div>

              {selectedRail === 'mobile' && (
                <div className="pt-2 text-[10px] text-slate-300 space-y-0.5 border-t border-white/10">
                  <p>Sendwave / Airtel / MTN Mobile Money Transfer:</p>
                  <p>Recipient: <strong className="text-amber-400 font-mono">+256 708515639</strong></p>
                </div>
              )}

              {selectedRail === 'external' && (
                <div className="pt-2 text-[10px] text-slate-300 space-y-0.5 border-t border-white/10">
                  <p>External Gateway Checkout will connect directly to secure card processing.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Crown size={16} />
              <span>{isProcessing ? 'Activating VIP Pass...' : 'Unlock Sanctuary VIP Pass'}</span>
              <ArrowRight size={16} />
            </button>
            <p className="text-[9px] text-center text-slate-500 uppercase font-bold tracking-widest">
              Instant Cloud Sync • 100% Secure • Sacred Devotion
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
