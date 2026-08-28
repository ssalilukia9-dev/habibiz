import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Hammer, Sparkles, X, Info } from 'lucide-react';

interface ConstructionBannerProps {
  moduleName?: string;
  customMessage?: string;
  allowDismiss?: boolean;
  className?: string;
}

export default function ConstructionBanner({
  moduleName,
  customMessage,
  allowDismiss = true,
  className = ''
}: ConstructionBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={`w-full relative z-30 ${className}`}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 p-3 sm:p-4 shadow-lg backdrop-blur-md">
          {/* Subtle animated background glow */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              {/* Construction Icon Indicator */}
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <AlertTriangle size={18} className="animate-pulse" />
              </div>

              {/* Text content */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    Still Under Construction
                  </span>
                  {moduleName && (
                    <span className="text-[11px] font-bold text-amber-200/80">
                      • {moduleName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-100/90 font-medium truncate sm:whitespace-normal mt-0.5">
                  {customMessage || "This module is actively being enhanced with live updates. All features remain operational."}
                </p>
              </div>
            </div>

            {/* Optional dismiss button */}
            {allowDismiss && (
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-lg text-amber-300/70 hover:text-amber-200 hover:bg-amber-500/20 transition-all shrink-0 cursor-pointer"
                title="Dismiss Notice"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
