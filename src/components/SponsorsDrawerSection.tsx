import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ShieldCheck, ChevronRight, X, Sparkles } from 'lucide-react';
import { SANCTUARY_SPONSORS, SponsorItem } from '../data/sponsorsData.ts';

interface SponsorsDrawerSectionProps {
  onCloseDrawer?: () => void;
}

export default function SponsorsDrawerSection({ onCloseDrawer }: SponsorsDrawerSectionProps) {
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(null);

  return (
    <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-slate-400">
          <Award size={14} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300">
            Sanctuary Sponsors
          </span>
        </div>
        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Verified Waqf
        </span>
      </div>

      {/* Spaced Sponsors List for Mobile Drawer with 1rem visual separation */}
      <div className="flex flex-col gap-4">
        {SANCTUARY_SPONSORS.map((sponsor) => (
          <motion.div
            key={sponsor.id}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSponsor(sponsor)}
            style={{ marginBottom: '1rem' }}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] hover:from-white/[0.14] hover:to-white/[0.06] border border-white/10 hover:border-brand-primary/40 transition-all cursor-pointer shadow-lg overflow-hidden last:mb-0"
          >
            {/* Background Accent Glow */}
            <div 
              className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" 
              style={{ backgroundColor: sponsor.accent }}
            />

            <div className="flex items-center gap-3.5 relative z-10">
              {/* Logo / Monogram Badge */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sponsor.logoBg} flex items-center justify-center font-black text-white text-[11px] tracking-wider shadow-md shrink-0 border border-white/20 px-1 text-center leading-tight`}>
                {sponsor.logoText}
              </div>

              {/* Info Block with comfortable line spacing */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-black text-white tracking-wide uppercase truncate group-hover:text-brand-primary transition-colors">
                    {sponsor.name}
                  </h4>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${sponsor.badgeColor}`}>
                    {sponsor.tier}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate leading-tight">
                  {sponsor.role}
                </p>
              </div>

              <ChevronRight size={16} className="text-slate-500 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[10px] text-slate-500 font-medium tracking-wide">
          Aloha • ISIS Wrist • Spiritual Ecosystem
        </p>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSponsor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm rounded-[2rem] bg-brand-sidebar border border-brand-border p-6 shadow-2xl space-y-5 text-left overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${selectedSponsor.logoBg} flex items-center justify-center font-black text-white text-sm tracking-wider shadow-lg border border-white/20 p-2 text-center`}>
                    {selectedSponsor.logoText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white uppercase tracking-tight">
                        {selectedSponsor.name}
                      </h3>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${selectedSponsor.badgeColor}`}>
                        {selectedSponsor.tier}
                      </span>
                    </div>
                    <p className="text-xs text-brand-primary font-semibold mt-1">
                      {selectedSponsor.role}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSponsor(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-200 font-bold">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <span>Sponsorship & Ecosystem Vision</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {selectedSponsor.description}
                </p>
              </div>

              {/* Contribution Points */}
              <div className="space-y-2.5 text-xs text-slate-300 py-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>Supporting continuous high-clarity sacred recitations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-brand-primary shrink-0" />
                  <span>Endowed Digital Waqf for the global Ummah</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Zero-ad spiritual tranquility experience</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedSponsor(null)}
                  className="w-full py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-brand-depth font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 transition-all cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
