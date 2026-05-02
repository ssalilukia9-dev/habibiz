import { motion } from 'motion/react';
import { Crown, Smartphone, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PremiumGatewayProps {
  onActivate: () => void;
}

export default function PremiumGateway({ onActivate }: PremiumGatewayProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-brand-depth flex items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="z-0 absolute inset-0 islamic-pattern opacity-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-brand-sidebar border border-white/10 rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.1)] flex flex-col md:flex-row"
      >
        {/* Left Side: Features */}
        <div className="flex-1 p-8 md:p-12 bg-gradient-to-br from-amber-500/10 to-transparent border-b md:border-b-0 md:border-r border-white/10 space-y-8">
           <div className="space-y-4">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center shadow-2xl">
                 <Crown size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">Premium Sanctuary</h2>
                <p className="text-xs font-black text-amber-400 uppercase tracking-[0.2em]">Ascend to Excellence</p>
              </div>
           </div>

           <div className="space-y-4">
              {[
                { label: 'Unlimited Ummah Access', desc: 'Join all public and private groups' },
                { label: 'Verified Global Badge', desc: 'Your mark of authenticity' },
                { label: 'Priority Support', desc: 'Direct access to community leaders' },
                { label: 'Ad-Free Experience', desc: 'Clean, distraction-free worship' }
              ].map((f, i) => (
                <div key={i} className="flex gap-3">
                   <div className="mt-1">
                      <CheckCircle2 size={16} className="text-brand-primary" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white">{f.label}</p>
                      <p className="text-[10px] text-slate-500">{f.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Right Side: Payment Instructions */}
        <div className="flex-1 p-8 md:p-12 space-y-8 bg-black/20">
           <div className="space-y-6">
              <div className="flex items-center gap-3 text-amber-400">
                 <Smartphone size={20} />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Payment Instruction</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                 <p className="text-xs text-slate-400 leading-relaxed">
                   To unlock the full sanctuary experience, please send a <span className="text-white font-bold">$3 subscription</span> contribution via <span className="text-white font-bold">Sendwave</span>.
                 </p>
                 
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recipient Mobile Number</p>
                    <div className="bg-brand-depth p-4 rounded-2xl flex items-center justify-between border border-amber-500/20">
                       <p className="text-lg font-black text-amber-400">+256 708515639</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                    <p className="text-[9px] text-amber-200/70 leading-tight">After payment, click activate below. Our team verifies all contributions manually.</p>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-4">
              <button 
                onClick={onActivate}
                className="w-full bg-amber-500 text-brand-depth font-black py-5 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                 ACTIVATE ACCESS
                 <ArrowRight size={20} />
              </button>
              <p className="text-[8px] text-center text-slate-600 uppercase font-black tracking-widest">Secure • Private • Spiritual</p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
