import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ExternalLink, ShieldCheck, ChevronRight, X, Heart, Award } from 'lucide-react';
import { SANCTUARY_SPONSORS, SponsorItem } from '../data/sponsorsData.ts';

interface SponsorsDrawerSectionProps {
  onCloseDrawer?: () => void;
}

export default function SponsorsDrawerSection({ onCloseDrawer }: SponsorsDrawerSectionProps) {
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(null);

  return (
    <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Award size={13} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            Sanctuary Patrons & Sponsors
          </span>
        </div>
        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Verified Waqf
        </span>
      </div>

      {/* Sponsors Grid / Cards */}
      <div className="space-y-2.5">
        {SANCTUARY_SPONSORS.map((sponsor) => (
          <motion.div
            key={sponsor.id}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedSponsor(sponsor)}
            className="group relative p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.04] border border-white/10 hover:border-brand-primary/40 transition-all cursor-pointer shadow-lg overflow-hidden"
          >
            {/* Background Glow */}
            <div 
              className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity" 
              style={{ backgroundColor: sponsor.accent }}
            />

            <div className="flex items-center gap-3 relative z-10">
              {/* Monogram / Logo badge */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sponsor.logoBg} flex items-center justify-center font-black text-white text-xs tracking-wider shadow-md shrink-0 border border-white/20`}>
                {sponsor.logoText}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white tracking-wide uppercase truncate group-hover:text-brand-primary transition-colors">
                    {sponsor.name}
                  </h4>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${sponsor.badgeColor}`}>
                    {sponsor.tier}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {sponsor.role}
                </p>
              </div>

              <ChevronRight size={14} className="text-slate-500 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-1">
        <p className="text-[9px] text-slate-500 font-medium tracking-wide">
          Aloha Group • Spiritual Innovation Ecosystem
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
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedSponsor.logoBg} flex items-center justify-center font-black text-white text-base tracking-wider shadow-lg border border-white/20`}>
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
                    <p className="text-xs text-brand-primary font-semibold mt-0.5">
                      {selectedSponsor.role}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSponsor(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Sponsorship & Vision</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {selectedSponsor.description}
                </p>
              </div>

              {/* Features / Contribution notes */}
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Supporting continuous high-clarity sacred recitations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  <span>Endowed Digital Waqf for the global Ummah</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Zero-ad spiritual tranquility experience</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => setSelectedSponsor(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs shadow-lg shadow-brand-primary/20 transition-all cursor-pointer text-center"
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
