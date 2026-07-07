import { motion } from 'motion/react';
import { Sparkles, Star, Heart, ShieldCheck, Quote, BookOpen } from 'lucide-react';
import { JUMMAH_HADITHS } from '../data/jummahData.ts';

export default function JummahVirtues() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
            <Star size={20} fill="currentColor" />
          </div>
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Friday Virtues</h3>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Master of Days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
        {JUMMAH_HADITHS.map((hadith, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden hover:border-brand-primary/30 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <Quote size={80} className="text-brand-primary" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">
                  {hadith.benefit}
                </div>
                <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-brand-primary group-hover:text-brand-depth transition-colors">
                  {index === 0 && <Heart size={16} />}
                  {index === 1 && <ShieldCheck size={16} />}
                  {index === 2 && <Sparkles size={16} />}
                  {index === 3 && <Star size={16} />}
                  {index === 4 && <BookOpen size={16} />}
                </div>
              </div>

              {hadith.arabic && (
                <p className="arabic-text text-2xl text-slate-200 leading-relaxed text-right opacity-80 group-hover:opacity-100 transition-opacity">
                  {hadith.arabic}
                </p>
              )}

              <div className="space-y-3">
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                  "{hadith.text}"
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <div className="h-px w-4 bg-brand-primary/40" />
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{hadith.source}</span>
                </div>
              </div>
            </div>
            
            {/* Hover decoration */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
