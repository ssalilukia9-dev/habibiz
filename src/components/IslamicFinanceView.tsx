import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp, 
  Scale, 
  Globe,
  Wallet,
  Zap,
  Info,
  Ban,
  Dices,
  EyeOff,
  Leaf,
  Coins,
  Crown,
  Lock
} from 'lucide-react';
import ZakatCalculator from './ZakatCalculator';

type Section = 'overview' | 'zakat' | 'investment' | 'halal-standards' | 'banking';

interface IslamicFinanceViewProps {
  isPremium?: boolean;
  onShowPremium?: () => void;
}

export default function IslamicFinanceView({ isPremium = false, onShowPremium }: IslamicFinanceViewProps) {
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const financeGuides = [
    {
      id: 'zakat',
      title: 'Zakat Hub',
      description: 'Calculate and understand the 2.5% obligatory wealth purification.',
      icon: Wallet,
      color: 'bg-brand-primary',
      isVip: false
    },
    {
      id: 'investment',
      title: 'Halal Investing',
      description: 'Guidelines on Shariah-compliant stocks, sukuk, and real estate.',
      icon: TrendingUp,
      color: 'bg-blue-500',
      isVip: true
    },
    {
      id: 'halal-standards',
      title: 'Purity Standards',
      description: 'Understanding Riba (Interest), Gharar (Uncertainty), and Maysir (Gambling).',
      icon: ShieldCheck,
      color: 'bg-emerald-500',
      isVip: false
    },
    {
      id: 'banking',
      title: 'Islamic Banking',
      description: 'Principles of Mudarabah, Musharakah, and Murabahah.',
      icon: Scale,
      color: 'bg-amber-500',
      isVip: true
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header logic */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeSection !== 'overview' && (
            <button 
              onClick={() => setActiveSection('overview')}
              className="w-12 h-12 bg-white/5 border border-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              {activeSection === 'overview' ? 'Islamic Finance' : activeSection.replace('-', ' ')}
            </h2>
            <p className="text-slate-500 font-medium text-sm">Managing wealth with spiritual integrity</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
        {[
          { label: 'Halal (Permissible)', icon: ShieldCheck, color: 'text-emerald-400', desc: 'Ethical assets only' },
          { label: 'Riba-Free', icon: Ban, color: 'text-red-400', desc: 'No interest exploitation' },
          { label: 'Asset-Backed', icon: Coins, color: 'text-amber-400', desc: 'Real tangible value' },
          { label: 'Social Justice', icon: Scale, color: 'text-blue-400', desc: 'Circulation of wealth' }
        ].map((p, i) => (
          <div key={i} className="glass-panel p-5 rounded-3xl border-white/5 flex flex-col items-center gap-3 text-center group hover:bg-white/10 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${p.color} group-hover:rotate-12 transition-all`}>
              <p.icon size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:text-brand-primary transition-colors">{p.label}</span>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {financeGuides.map((guide) => (
              <motion.button
                key={guide.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (guide.isVip && !isPremium) {
                    if (onShowPremium) onShowPremium();
                    else setActiveSection(guide.id as Section);
                  } else {
                    setActiveSection(guide.id as Section);
                  }
                }}
                className="group relative p-8 bg-white/5 border border-white/5 rounded-[2.5rem] text-left hover:bg-white/10 transition-all shadow-xl flex flex-col justify-between h-64 overflow-hidden cursor-pointer"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${guide.color}/10 rounded-bl-full blur-3xl`} />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 ${guide.color}/20 rounded-2xl flex items-center justify-center text-white border border-white/10`}>
                      <guide.icon size={28} />
                    </div>
                    {guide.isVip && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase flex items-center gap-1">
                        {!isPremium ? <Lock size={11} /> : <Crown size={11} />} VIP ELITE
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{guide.title}</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-[240px]">{guide.description}</p>
                  </div>
                </div>
                
                <div className="relative z-10 flex items-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                  {guide.isVip && !isPremium ? 'Unlock with Elite Pass' : 'Open Module'} <ChevronRight size={14} />
                </div>
              </motion.button>
            ))}

            {/* Market Tip */}
            <div className="md:col-span-2 p-8 bg-brand-primary shadow-2xl shadow-brand-primary/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 border border-white/20">
               <div className="w-20 h-20 bg-brand-depth/10 rounded-3xl flex items-center justify-center text-brand-depth shrink-0">
                  <Globe size={40} />
               </div>
               <div className="flex-1 space-y-2 text-center md:text-left">
                  <h4 className="text-2xl font-black text-brand-depth leading-tight uppercase italic">Ethical Wealth Creation</h4>
                  <p className="text-brand-depth/70 font-bold text-sm leading-relaxed">
                    Islamic finance is built on risk-sharing and asset-backed transactions. No debt-traps, no interest exploitation, only ethical growth.
                  </p>
               </div>
               <button 
                onClick={() => onShowPremium?.()}
                className="bg-brand-depth text-brand-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all cursor-pointer"
               >
                  Sanctuary Elite
               </button>
            </div>
          </motion.div>
        ) : (activeSection === 'investment' || activeSection === 'banking') && !isPremium ? (
          <motion.div
            key="vip-lock"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 sm:p-12 rounded-[3rem] bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-purple-500/10 border border-amber-500/30 text-center max-w-2xl mx-auto space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
              <Lock size={32} />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                Sanctuary Elite Exclusive
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white italic">
                {activeSection === 'investment' ? 'Halal Wealth & Portfolio Engine' : 'Islamic Banking Masterclass'}
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Unlock full institutional-grade Shariah screening, Sukuk yields analyzer, and personal Islamic wealth ledgers with Sanctuary Elite membership.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => setActiveSection('overview')}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer transition-all"
              >
                Back to Overview
              </button>
              <button
                onClick={() => onShowPremium?.()}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-brand-depth font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Upgrade to Sanctuary Elite
              </button>
            </div>
          </motion.div>
        ) : activeSection === 'zakat' ? (
          <motion.div
            key="zakat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ZakatCalculator />
              </div>
              <div className="space-y-6">
                <div className="glass-panel p-8 rounded-[2.5rem] border-emerald-500/10 bg-emerald-500/5">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                    <Leaf size={24} />
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Wealth Purification</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Zakat is not just a tax—it is an act of worship that purifies your wealth and distributes grace to those in need.
                  </p>
                </div>
                <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Eligible Assets</h4>
                  <ul className="space-y-3">
                    {[
                      { label: 'Gold & Silver', icon: Coins },
                      { label: 'Cash & Savings', icon: Wallet },
                      { label: 'Business Goods', icon: Globe },
                      { label: 'Stocks/Shares', icon: BarChart3 }
                    ].map((item, id) => (
                      <li key={id} className="flex items-center gap-3 text-sm font-bold text-white">
                        <item.icon size={14} className="text-brand-primary" />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
             key="coming-soon"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="py-10 space-y-12"
          >
             <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary italic font-black">؟</div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Core Financial Ethics</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {[
                        { title: 'No Riba', desc: 'Prohibition of usury and interest-based lending.', icon: Ban, color: 'text-red-400' },
                        { title: 'No Gharar', desc: 'Elimination of deceptive schemes and excessive risk.', icon: EyeOff, color: 'text-amber-400' },
                        { title: 'No Maysir', desc: 'Total rejection of gambling and game-of-chance profiting.', icon: Dices, color: 'text-purple-400' },
                        { title: 'Wealth Sharing', desc: 'Mandatory circulation of capital through social contracts.', icon: Scale, color: 'text-emerald-400' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                           <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                              <item.icon size={20} />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-sm font-black text-white uppercase tracking-tight">{item.title}</h4>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center space-y-6 p-10 bg-brand-primary/5 rounded-[3rem] border border-brand-primary/10">
                   <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary animate-pulse">
                      <Zap size={32} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight tracking-[-0.02em]">Financial Expansion</h3>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        We are currently building deep-dive guides for <b>{activeSection.replace('-', ' ')}</b>. 
                        Our experts are ensuring all datasets reflect classical Fiqh and modern economic realities.
                      </p>
                   </div>
                   <button 
                     onClick={() => setActiveSection('overview')}
                     className="bg-brand-primary text-brand-depth px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20"
                   >
                      Back to Sanctuary
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
