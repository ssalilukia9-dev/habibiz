import { motion } from 'motion/react';
import { Sparkles, Star, Heart, ShieldCheck, Quote, BookOpen, CheckCircle2 } from 'lucide-react';
import { getVirtueForToday } from '../data/dailyVirtues.ts';

export default function DailyVirtues() {
  const virtue = getVirtueForToday();
  const isFriday = new Date().getDay() === 5;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
            <Star size={20} fill="currentColor" />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
            {isFriday ? 'Friday (Jummah) Virtues' : `${virtue.day} Daily Wisdom`}
          </h3>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
            {isFriday ? 'Master of Days' : 'Daily Reflection'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Virtue Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => {
            if (virtue.reference.toLowerCase().includes('sahih') || virtue.reference.toLowerCase().includes('tirmidhi')) {
               window.dispatchEvent(new CustomEvent('app_navigate', { detail: { tab: 'resources', extra: { resId: 'hadith' } } }));
            } else {
               window.dispatchEvent(new CustomEvent('app_navigate', { detail: { tab: 'resources', extra: { resId: 'quran' } } }));
            }
          }}
          className="lg:col-span-8 group glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/5 relative overflow-hidden hover:border-brand-primary/30 transition-all duration-500 cursor-pointer"
        >
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
            <Quote size={120} className="text-brand-primary" />
          </div>
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="px-4 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">
                {virtue.title}
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                <Heart size={24} />
              </div>
            </div>

            {virtue.arabicContent && (
              <p className="arabic-text text-3xl md:text-4xl text-slate-200 leading-relaxed text-right opacity-80 group-hover:opacity-100 transition-opacity">
                {virtue.arabicContent}
              </p>
            )}

            <div className="space-y-4">
              <p className="text-lg md:text-2xl text-slate-300 font-medium leading-relaxed italic">
                "{virtue.translation}"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-px w-8 bg-brand-primary/40" />
                <span className="text-xs font-black text-brand-primary uppercase tracking-widest">{virtue.reference}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Task Block */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="lg:col-span-4 glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between"
        >
           <div className="space-y-6">
              <div>
                 <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">Today's Deeds</p>
                 <h4 className="text-xl font-black text-white uppercase tracking-tighter">Recommended Acts</h4>
              </div>
              
              <div className="space-y-3">
                 {virtue.tasks?.map((task, i) => (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5 cursor-pointer group/task"
                   >
                     <div className="mt-1 w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center group-hover/task:border-brand-primary transition-colors">
                        <CheckCircle2 size={12} className="opacity-0 group-hover/task:opacity-100 text-brand-primary transition-opacity" />
                     </div>
                     <span className="text-xs md:text-sm text-slate-400 group-hover/task:text-slate-200 font-medium transition-colors">{task}</span>
                   </motion.div>
                 ))}
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-white/5">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Small consistently good deeds are more beloved to Allah than large inconsistent ones.
              </p>
           </div>
        </motion.div>
      </div>
    </section>
  );
}
